import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './database.js';
import { calculatePersonalCompatibility, generateVisitSimulation } from './compatibility.js';
import { analyzeAccessibilityImage } from './aiVision.js';
import { calculateAccessibilityScores } from './scoring.js';
import { isSupabaseConfigured, supabaseDb } from './supabase.js';
import { Establishment, Review, ReportItem, AIAnalysis } from './types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = process.env.VERCEL ? '/tmp' : path.resolve(__dirname, '../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (_e) {
    // Ignore in read-only environments
  }
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

export const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

// Helper: Haversine distance in km
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail obrigatório' });
  }

  let user = null;
  if (isSupabaseConfigured()) {
    user = await supabaseDb.findUserByEmail(email);
  }
  if (!user) {
    user = db.findUserByEmail(email);
  }

  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  let profile = null;
  if (isSupabaseConfigured()) {
    profile = await supabaseDb.getProfile(user.id);
  }
  if (!profile) {
    profile = db.getProfile(user.id);
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile,
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'visitor' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  let existing = null;
  if (isSupabaseConfigured()) {
    existing = await supabaseDb.findUserByEmail(email);
  }
  if (!existing) {
    existing = db.findUserByEmail(email);
  }

  if (existing) {
    return res.status(409).json({ error: 'E-mail já cadastrado' });
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    email,
    role: role as any,
    password_hash: password,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    await supabaseDb.createUser(newUser);
  }
  db.createUser(newUser);

  const profile = db.getProfile(newUser.id);
  res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    profile,
  });
});

// ==================== PROFILE ROUTES ====================
app.get('/api/profile/:userId', async (req, res) => {
  let profile = null;
  if (isSupabaseConfigured()) {
    profile = await supabaseDb.getProfile(req.params.userId);
  }
  if (!profile) {
    profile = db.getProfile(req.params.userId);
  }
  res.json(profile);
});

app.put('/api/profile/:userId', async (req, res) => {
  const current = db.getProfile(req.params.userId);
  const updatedData = {
    ...current,
    ...req.body,
    user_id: req.params.userId,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    await supabaseDb.saveProfile(updatedData);
  }
  const updated = db.saveProfile(updatedData);
  res.json(updated);
});

// ==================== ESTABLISHMENTS ====================
app.get('/api/establishments', async (req, res) => {
  const {
    q,
    category,
    city,
    corridor,
    wheelchair,
    libras,
    sensory,
    restroom,
    braille,
    lat,
    lng,
    radiusKm = 20,
    userId,
  } = req.query;

  let list: Establishment[] = [];
  if (isSupabaseConfigured()) {
    const sbList = await supabaseDb.getAllEstablishments();
    list = sbList && sbList.length > 0 ? sbList : db.getAllEstablishments();
  } else {
    list = db.getAllEstablishments();
  }

  // Corridor filter (e.g. Bastos até Marília radar)
  if (corridor === 'bastos-marilia') {
    const validCities = ['bastos', 'tupã', 'tupa', 'pompeia', 'pompéia', 'marília', 'marilia', 'oriente', 'vera cruz', 'iacri'];
    list = list.filter((e) => validCities.includes((e.city || '').toLowerCase()));
  }

  // City filter
  if (city && city !== 'todas') {
    list = list.filter((e) => (e.city || '').toLowerCase() === (city as string).toLowerCase());
  }

  // Text search (includes name, address, description, category, city, state)
  if (q && typeof q === 'string') {
    const term = q.toLowerCase();
    list = list.filter(
      (e) =>
        (e.name || '').toLowerCase().includes(term) ||
        (e.address || '').toLowerCase().includes(term) ||
        (e.city || '').toLowerCase().includes(term) ||
        (e.state || '').toLowerCase().includes(term) ||
        (e.description || '').toLowerCase().includes(term) ||
        (e.category || '').toLowerCase().includes(term)
    );
  }

  // Category filter
  if (category && category !== 'todos') {
    list = list.filter((e) => e.category === category);
  }

  // Feature filters
  if (wheelchair === 'true') {
    list = list.filter((e) => e.features?.has_ramp && e.features?.wide_doors);
  }
  if (libras === 'true') {
    list = list.filter((e) => e.features?.libras_service);
  }
  if (sensory === 'true') {
    list = list.filter((e) => e.features?.low_noise_level || e.features?.sensory_regulation_room);
  }
  if (restroom === 'true') {
    list = list.filter((e) => e.features?.adapted_restroom);
  }
  if (braille === 'true') {
    list = list.filter((e) => e.features?.braille_signage || e.features?.tactile_paving);
  }

  // Distance calculation & filter
  const userLat = lat ? parseFloat(lat as string) : null;
  const userLng = lng ? parseFloat(lng as string) : null;

  let enriched = list.map((est) => {
    let distanceKm: number | null = null;
    if (userLat !== null && userLng !== null) {
      distanceKm = Math.round(haversineDistanceKm(userLat, userLng, est.lat, est.lng) * 10) / 10;
    }

    // Optional user compatibility scoring
    let compatibilityScore: number | null = null;
    if (userId && typeof userId === 'string') {
      const prof = db.getProfile(userId);
      const comp = calculatePersonalCompatibility(prof, est);
      compatibilityScore = comp.overall_compatibility;
    }

    return {
      ...est,
      distance_km: distanceKm,
      personal_compatibility_score: compatibilityScore,
    };
  });

  if (userLat !== null && userLng !== null) {
    const maxDist = parseFloat(radiusKm as string) || 20;
    enriched = enriched.filter((e) => e.distance_km === null || e.distance_km <= maxDist);
    enriched.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
  }

  res.json(enriched);
});

app.get('/api/establishments/:id', async (req, res) => {
  let est: Establishment | null | undefined = null;
  if (isSupabaseConfigured()) {
    est = await supabaseDb.getEstablishmentById(req.params.id);
  }
  if (!est) {
    est = db.getEstablishmentById(req.params.id);
  }

  if (!est) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado' });
  }

  let reviews: Review[] = [];
  if (isSupabaseConfigured()) {
    const sbReviews = await supabaseDb.getReviewsByEstablishment(est.id);
    reviews = sbReviews || db.getReviewsByEstablishment(est.id);
  } else {
    reviews = db.getReviewsByEstablishment(est.id);
  }

  let aiAnalyses = [];
  if (isSupabaseConfigured()) {
    const sbAI = await supabaseDb.getAIAnalyses(est.id);
    aiAnalyses = sbAI || db.getAIAnalyses(est.id);
  } else {
    aiAnalyses = db.getAIAnalyses(est.id);
  }

  res.json({
    ...est,
    reviews,
    ai_analyses: aiAnalyses,
  });
});

app.post('/api/establishments', async (req, res) => {
  const body = req.body;
  if (!body.name || !body.category || !body.address) {
    return res.status(400).json({ error: 'Campos essenciais ausentes' });
  }

  const scores = calculateAccessibilityScores(
    body.features || {},
    body.barriers || [],
    body.unverified_items || []
  );

  const newEst: Establishment = {
    id: body.id || `est_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: body.name,
    category: body.category,
    description: body.description || '',
    address: body.address,
    city: body.city || 'São Paulo',
    state: body.state || 'SP',
    postal_code: body.postal_code || '',
    lat: body.lat || -23.55052,
    lng: body.lng || -46.633308,
    phone: body.phone || '',
    website: body.website || '',
    images: body.images || [],
    provenance: body.provenance || 'usuario',
    is_demo: false,
    verified_status: body.verified_status || 'em_analise',
    reliability_score: body.reliability_score || 60,
    last_update: new Date().toISOString().split('T')[0],
    owner_id: body.owner_id || null,
    physical_score: scores.physical_score,
    intellectual_score: scores.intellectual_score,
    sensory_score: scores.sensory_score,
    visual_score: scores.visual_score,
    auditory_score: scores.auditory_score,
    service_score: scores.service_score,
    overall_score: scores.overall_score,
    classification: scores.classification,
    features: body.features || {},
    barriers: body.barriers || [],
    unverified_items: body.unverified_items || [],
  };

  if (isSupabaseConfigured()) {
    await supabaseDb.createEstablishment(newEst);
  }
  const created = db.createEstablishment(newEst);
  res.status(201).json(created);
});

app.put('/api/establishments/:id', async (req, res) => {
  if (isSupabaseConfigured()) {
    await supabaseDb.updateEstablishment(req.params.id, req.body);
  }
  const updated = db.updateEstablishment(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado' });
  }
  res.json(updated);
});

app.delete('/api/establishments/:id', async (req, res) => {
  if (isSupabaseConfigured()) {
    await supabaseDb.deleteEstablishment(req.params.id);
  }
  const ok = db.deleteEstablishment(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado' });
  }
  res.json({ success: true });
});

// ==================== COMPATIBILITY & SIMULATION ====================
app.post('/api/establishments/:id/compatibility', async (req, res) => {
  let est = null;
  if (isSupabaseConfigured()) {
    est = await supabaseDb.getEstablishmentById(req.params.id);
  }
  if (!est) {
    est = db.getEstablishmentById(req.params.id);
  }
  if (!est) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado' });
  }

  const { profile, userId } = req.body;
  const userProfile = profile || (userId ? db.getProfile(userId) : db.getProfile('usr_visitante'));
  const compatibility = calculatePersonalCompatibility(userProfile, est);
  res.json(compatibility);
});

app.post('/api/establishments/:id/simulation', async (req, res) => {
  let est = null;
  if (isSupabaseConfigured()) {
    est = await supabaseDb.getEstablishmentById(req.params.id);
  }
  if (!est) {
    est = db.getEstablishmentById(req.params.id);
  }
  if (!est) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado' });
  }

  const { profile, userId } = req.body;
  const userProfile = profile || (userId ? db.getProfile(userId) : db.getProfile('usr_visitante'));
  const simulation = generateVisitSimulation(userProfile, est);
  res.json(simulation);
});

// ==================== REVIEWS ====================
app.get('/api/establishments/:id/reviews', async (req, res) => {
  let reviews: Review[] = [];
  if (isSupabaseConfigured()) {
    const sbReviews = await supabaseDb.getReviewsByEstablishment(req.params.id);
    reviews = sbReviews || db.getReviewsByEstablishment(req.params.id);
  } else {
    reviews = db.getReviewsByEstablishment(req.params.id);
  }
  res.json(reviews);
});

app.post('/api/establishments/:id/reviews', async (req, res) => {
  let est = null;
  if (isSupabaseConfigured()) {
    est = await supabaseDb.getEstablishmentById(req.params.id);
  }
  if (!est) {
    est = db.getEstablishmentById(req.params.id);
  }
  if (!est) {
    return res.status(404).json({ error: 'Estabelecimento não encontrado' });
  }

  const {
    user_id = 'usr_anonimo',
    user_name = 'Visitante AcessoReal',
    user_condition_tag = 'Visitante',
    went_accompanied = false,
    rating = 5,
    comment = '',
    category_evaluations,
    barriers_reported = [],
    images = [],
  } = req.body;

  const review: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    establishment_id: est.id,
    user_id,
    user_name,
    user_condition_tag,
    went_accompanied,
    rating,
    comment,
    category_evaluations: category_evaluations || {
      physical: 80,
      intellectual: 80,
      sensory: 80,
      visual: 80,
      auditory: 80,
      service: 80,
    },
    barriers_reported,
    images,
    provenance: 'usuario',
    status: 'aprovada',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    await supabaseDb.addReview(review);
  }
  db.addReview(review);

  // If new barriers are reported, update establishment barriers
  if (barriers_reported && barriers_reported.length > 0) {
    const existingBarriers = new Set(est.barriers);
    barriers_reported.forEach((b: string) => existingBarriers.add(b));
    const updatedBarriers = Array.from(existingBarriers);
    const newScore = Math.min(100, (est.reliability_score || 60) + 2);

    if (isSupabaseConfigured()) {
      await supabaseDb.updateEstablishment(est.id, {
        barriers: updatedBarriers,
        reliability_score: newScore,
      });
    }
    db.updateEstablishment(est.id, {
      barriers: updatedBarriers,
      reliability_score: newScore,
    });
  }

  res.status(201).json(review);
});

// ==================== AI VISION ANALYSIS ====================
app.post('/api/ai/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma fotografia enviada para análise' });
    }

    const categoryHint = (req.body.category || 'entrada') as any;
    const establishmentId = req.body.establishment_id || null;

    const analysis = await analyzeAccessibilityImage(req.file.path, categoryHint, establishmentId);
    
    if (isSupabaseConfigured()) {
      await supabaseDb.addAIAnalysis(analysis);
    }
    db.addAIAnalysis(analysis);

    res.json(analysis);
  } catch (err: any) {
    console.error('Falha na análise de IA:', err);
    res.status(500).json({ error: 'Erro ao processar imagem por inteligência artificial', details: err.message });
  }
});

app.get('/api/ai/history', async (req, res) => {
  const estId = req.query.establishment_id as string | undefined;
  let list: AIAnalysis[] = [];
  if (isSupabaseConfigured()) {
    const sbList = await supabaseDb.getAIAnalyses(estId);
    list = sbList || db.getAIAnalyses(estId);
  } else {
    list = db.getAIAnalyses(estId);
  }
  res.json(list);
});

// ==================== IMAGE UPLOADS ====================
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não enviado' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// ==================== REPORTS & MODERATION ====================
app.post('/api/reports', async (req, res) => {
  const { establishment_id, reported_by_user_id = 'usr_anonimo', reason, description } = req.body;
  if (!establishment_id || !reason) {
    return res.status(400).json({ error: 'Dados incompletos para denúncia' });
  }

  const report: ReportItem = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    establishment_id,
    reported_by_user_id,
    reason,
    description: description || '',
    status: 'pendente',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    await supabaseDb.addReport(report);
  }
  db.addReport(report);
  res.status(201).json(report);
});

// ==================== ADMIN DASHBOARD ====================
app.get('/api/admin/dashboard', async (_req, res) => {
  let establishments: Establishment[] = [];
  let reviews: Review[] = [];
  let reports: ReportItem[] = [];
  let analyses: AIAnalysis[] = [];

  if (isSupabaseConfigured()) {
    establishments = (await supabaseDb.getAllEstablishments()) || db.getAllEstablishments();
    reviews = (await supabaseDb.getAllReviews()) || db.getAllReviews();
    reports = (await supabaseDb.getReports()) || db.getReports();
    analyses = (await supabaseDb.getAIAnalyses()) || db.getAIAnalyses();
  } else {
    establishments = db.getAllEstablishments();
    reviews = db.getAllReviews();
    reports = db.getReports();
    analyses = db.getAIAnalyses();
  }

  const totalVerified = establishments.filter((e) => e.verified_status === 'verificado').length;
  const totalPartial = establishments.filter((e) => e.verified_status === 'parcial').length;
  const totalPending = establishments.filter((e) => e.verified_status === 'em_analise' || e.verified_status === 'pendente').length;

  res.json({
    kpis: {
      total_establishments: establishments.length,
      total_verified: totalVerified,
      total_partial: totalPartial,
      total_pending: totalPending,
      total_reviews: reviews.length,
      total_reports_pending: reports.filter((r) => r.status === 'pendente').length,
      total_ai_analyses: analyses.length,
    },
    recent_reviews: reviews.slice(0, 5),
    recent_reports: reports.slice(0, 5),
    recent_ai: analyses.slice(0, 5),
    establishments,
  });
});

app.put('/api/admin/reviews/:id/status', async (req, res) => {
  const { status } = req.body;
  if (isSupabaseConfigured()) {
    await supabaseDb.updateReviewStatus(req.params.id, status);
  }
  const ok = db.updateReviewStatus(req.params.id, status);
  if (!ok) return res.status(404).json({ error: 'Avaliação não encontrada' });
  res.json({ success: true });
});

app.put('/api/admin/reports/:id/status', async (req, res) => {
  const { status } = req.body;
  if (isSupabaseConfigured()) {
    await supabaseDb.updateReportStatus(req.params.id, status);
  }
  const ok = db.updateReportStatus(req.params.id, status);
  if (!ok) return res.status(404).json({ error: 'Denúncia não encontrada' });
  res.json({ success: true });
});

// ==================== SERVE FRONTEND ====================
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

export default app;
