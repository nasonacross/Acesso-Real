import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { metric } from '@vercel/functions';
import { db, createDefaultProfile, hydrateProfile } from './database.js';
import { calculatePersonalCompatibility, generateVisitSimulation } from './compatibility.js';
import { analyzeAccessibilityImage, OpticalMetrics } from './aiVision.js';
import { calculateAccessibleRoute } from './routesCalculator.js';
import { calculateAccessibilityScores } from './scoring.js';
import { isSupabaseConfigured, supabaseDb } from './supabase.js';
import { Establishment, Review, ReportItem, User, UserProfile } from './types.js';

dotenv.config();

// Serverless-safe memory upload (no ephemeral filesystem writes on Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB limit (fits Vercel 4.5 MB function payload limit)
});

export const app = express();

app.use(cors());
app.use(express.json({ limit: '4mb' }));

function normalizeText(str: string | null | undefined): string {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getEstablishmentsSource(): Promise<{ list: Establishment[]; source: 'supabase' | 'local' }> {
  const started = performance.now();
  if (isSupabaseConfigured()) {
    const rows = await supabaseDb.getAllEstablishments();
    if (rows && rows.length > 0) {
      metric('acessoreal.establishments.query_ms', performance.now() - started, { source: 'supabase' });
      return { list: rows, source: 'supabase' };
    }
  }
  metric('acessoreal.establishments.query_ms', performance.now() - started, { source: 'local' });
  return { list: db.getAllEstablishments(), source: 'local' };
}

async function getProfileSource(userId: string): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    const sbProfile = await supabaseDb.getProfile(userId);
    if (sbProfile) return sbProfile;
  }
  return hydrateProfile(userId, db.getProfile(userId));
}

// ==================== HEALTH CHECK ====================
app.get('/api/health', async (_req, res) => {
  const sbHealth = await supabaseDb.checkHealth();
  res.json({
    ok: true,
    platform: 'AcessoReal',
    runtime: process.env.VERCEL ? 'vercel' : 'local',
    database: sbHealth.connected ? 'supabase_postgres' : 'local_fallback',
    supabase: sbHealth,
    timestamp: new Date().toISOString(),
  });
});

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      metric('acessoreal.auth.login', 1, { outcome: 'validation_error' });
      return res.status(400).json({ error: 'E-mail obrigatório' });
    }

    let user: User | null = null;
    if (isSupabaseConfigured()) {
      user = await supabaseDb.findUserByEmail(email);
    }
    if (!user) {
      user = db.findUserByEmail(email) || null;
    }

    if (!user || user.password_hash !== password) {
      metric('acessoreal.auth.login', 1, { outcome: 'invalid_credentials' });
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const profile = await getProfileSource(user.id);
    metric('acessoreal.auth.login', 1, { outcome: 'success', role: user.role });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err: any) {
    console.error('Erro no login:', err);
    metric('acessoreal.auth.login', 1, { outcome: 'error' });
    res.status(500).json({ error: 'Erro interno ao autenticar usuário' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'visitor', profileData } = req.body;
    if (!name || !email || !password) {
      metric('acessoreal.auth.register', 1, { outcome: 'validation_error' });
      return res.status(400).json({ error: 'Preencha nome, e-mail e senha para se cadastrar' });
    }

    let existing: User | null = null;
    if (isSupabaseConfigured()) {
      existing = await supabaseDb.findUserByEmail(email);
    }
    if (!existing) {
      existing = db.findUserByEmail(email) || null;
    }

    if (existing) {
      metric('acessoreal.auth.register', 1, { outcome: 'duplicate_email' });
      return res.status(409).json({ error: 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role: (role === 'owner' || role === 'admin' ? role : 'visitor') as User['role'],
      password_hash: String(password),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const created = await supabaseDb.createUser(newUser);
      if (!created) {
        metric('acessoreal.auth.register', 1, { outcome: 'db_error' });
        return res.status(500).json({ error: 'Não foi possível salvar o cadastro no banco de dados' });
      }
    }
    db.createUser(newUser);

    let profile: UserProfile = createDefaultProfile(newUser.id);
    if (profileData && typeof profileData === 'object') {
      profile = hydrateProfile(newUser.id, profileData);
    }

    if (isSupabaseConfigured()) {
      const saved = await supabaseDb.saveProfile(profile);
      if (saved) profile = saved;
    }
    db.saveProfile(profile);

    metric('acessoreal.auth.register', 1, { outcome: 'success', role: newUser.role });

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      profile,
    });
  } catch (err: any) {
    console.error('Erro no cadastro:', err);
    metric('acessoreal.auth.register', 1, { outcome: 'error' });
    res.status(500).json({ error: 'Erro interno ao cadastrar usuário' });
  }
});

// ==================== PROFILE ROUTES ====================
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const profile = await getProfileSource(req.params.userId);
    res.json(profile);
  } catch (err: any) {
    console.error('Erro ao carregar perfil:', err);
    res.status(500).json({ error: 'Erro ao carregar perfil' });
  }
});

app.put('/api/profile/:userId', async (req, res) => {
  try {
    const current = await getProfileSource(req.params.userId);
    const merged = hydrateProfile(req.params.userId, {
      ...current,
      ...req.body,
      physical: { ...current.physical, ...(req.body.physical || {}) },
      intellectual: { ...current.intellectual, ...(req.body.intellectual || {}) },
      sensory: { ...current.sensory, ...(req.body.sensory || {}) },
      visual: { ...current.visual, ...(req.body.visual || {}) },
      auditory: { ...current.auditory, ...(req.body.auditory || {}) },
      other: { ...current.other, ...(req.body.other || {}) },
      accompaniment: { ...current.accompaniment, ...(req.body.accompaniment || {}) },
    });

    let updated = merged;
    if (isSupabaseConfigured()) {
      const saved = await supabaseDb.saveProfile(merged);
      if (saved) updated = saved;
    }
    db.saveProfile(updated);

    res.json(updated);
  } catch (err: any) {
    console.error('Erro ao salvar perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// ==================== ESTABLISHMENTS ====================
app.get('/api/establishments', async (req, res) => {
  try {
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
      radiusKm = '20',
      userId,
    } = req.query;

    const { list: rawList } = await getEstablishmentsSource();
    let list = [...rawList];

    if (corridor === 'bastos-marilia') {
      const validCities = ['bastos', 'tupa', 'pompeia', 'marilia', 'oriente', 'vera cruz', 'iacri'];
      list = list.filter((e) => validCities.includes(normalizeText(e.city)));
    }

    if (city && city !== 'todas') {
      const targetCity = normalizeText(city as string);
      list = list.filter((e) => normalizeText(e.city) === targetCity);
    }

    if (q && typeof q === 'string') {
      const term = normalizeText(q);
      list = list.filter(
        (e) =>
          normalizeText(e.name).includes(term) ||
          normalizeText(e.address).includes(term) ||
          normalizeText(e.city).includes(term) ||
          normalizeText(e.state).includes(term) ||
          normalizeText(e.description).includes(term) ||
          normalizeText(e.category).includes(term)
      );
    }

    if (category && category !== 'todos') {
      list = list.filter((e) => e.category === category);
    }

    if (wheelchair === 'true') list = list.filter((e) => e.features?.has_ramp && e.features?.wide_doors);
    if (libras === 'true') list = list.filter((e) => e.features?.libras_service);
    if (sensory === 'true') list = list.filter((e) => e.features?.low_noise_level || e.features?.sensory_regulation_room);
    if (restroom === 'true') list = list.filter((e) => e.features?.adapted_restroom);
    if (braille === 'true') list = list.filter((e) => e.features?.braille_signage || e.features?.tactile_paving);

    const userLat = lat ? parseFloat(lat as string) : null;
    const userLng = lng ? parseFloat(lng as string) : null;
    const userProfile = userId && typeof userId === 'string' ? await getProfileSource(userId) : null;

    let enriched = list.map((est) => {
      let distanceKm: number | null = null;
      if (userLat !== null && userLng !== null && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
        distanceKm = Math.round(haversineDistanceKm(userLat, userLng, est.lat, est.lng) * 10) / 10;
      }

      const compatibilityScore = userProfile
        ? calculatePersonalCompatibility(userProfile, est).overall_compatibility
        : null;

      return {
        ...est,
        distance_km: distanceKm,
        personal_compatibility_score: compatibilityScore,
      };
    });

    if (userLat !== null && userLng !== null && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
      const maxDist = parseFloat(radiusKm as string) || 20;
      enriched = enriched.filter((e) => e.distance_km === null || e.distance_km <= maxDist);
      enriched.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
    }

    res.json(enriched);
  } catch (err: any) {
    console.error('Erro ao listar estabelecimentos:', err);
    res.status(500).json({ error: 'Erro ao listar estabelecimentos' });
  }
});

app.get('/api/establishments/:id', async (req, res) => {
  try {
    let est: Establishment | null = null;
    if (isSupabaseConfigured()) {
      est = await supabaseDb.getEstablishmentById(req.params.id);
    }
    if (!est) {
      est = db.getEstablishmentById(req.params.id) || null;
    }
    if (!est) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    const reviews =
      (isSupabaseConfigured() ? await supabaseDb.getReviewsByEstablishment(est.id) : null) ??
      db.getReviewsByEstablishment(est.id);
    const aiAnalyses =
      (isSupabaseConfigured() ? await supabaseDb.getAIAnalyses(est.id) : null) ??
      db.getAIAnalyses(est.id);

    res.json({
      ...est,
      reviews,
      ai_analyses: aiAnalyses,
    });
  } catch (err: any) {
    console.error('Erro ao obter estabelecimento:', err);
    res.status(500).json({ error: 'Erro ao buscar estabelecimento' });
  }
});

app.post('/api/establishments', async (req, res) => {
  try {
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
      id: `est_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: body.name,
      category: body.category,
      description: body.description || '',
      address: body.address,
      city: body.city || 'Tupã',
      state: body.state || 'SP',
      postal_code: body.postal_code || '17600-050',
      lat: body.lat ?? -21.94148,
      lng: body.lng ?? -50.51442,
      phone: body.phone || '',
      website: body.website || '',
      images: body.images?.length ? body.images : ['/images/establishments/est_poupatempo.jpg'],
      provenance: body.provenance || 'usuario',
      is_demo: false,
      verified_status: 'em_analise',
      reliability_score: 70,
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

    let created = newEst;
    if (isSupabaseConfigured()) {
      const sbCreated = await supabaseDb.createEstablishment(newEst);
      if (sbCreated) created = sbCreated;
    }
    db.createEstablishment(created);

    res.status(201).json(created);
  } catch (err: any) {
    console.error('Erro ao criar estabelecimento:', err);
    res.status(500).json({ error: 'Erro ao cadastrar estabelecimento' });
  }
});

app.put('/api/establishments/:id', async (req, res) => {
  try {
    let current: Establishment | null = null;
    if (isSupabaseConfigured()) {
      current = await supabaseDb.getEstablishmentById(req.params.id);
    }
    if (!current) {
      current = db.getEstablishmentById(req.params.id) || null;
    }
    if (!current) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    const mergedFeatures = req.body.features
      ? { ...current.features, ...req.body.features }
      : current.features;
    const mergedBarriers = req.body.barriers ?? current.barriers;
    const mergedUnverified = req.body.unverified_items ?? current.unverified_items;
    const scores = calculateAccessibilityScores(mergedFeatures, mergedBarriers, mergedUnverified);

    const updates: Partial<Establishment> = {
      ...req.body,
      features: mergedFeatures,
      barriers: mergedBarriers,
      unverified_items: mergedUnverified,
      physical_score: scores.physical_score,
      intellectual_score: scores.intellectual_score,
      sensory_score: scores.sensory_score,
      visual_score: scores.visual_score,
      auditory_score: scores.auditory_score,
      service_score: scores.service_score,
      overall_score: scores.overall_score,
      classification: scores.classification,
      last_update: new Date().toISOString().split('T')[0],
    };

    let updated: Establishment | null = null;
    if (isSupabaseConfigured()) {
      updated = await supabaseDb.updateEstablishment(req.params.id, updates);
    }
    const localUpdated = db.updateEstablishment(req.params.id, updates);
    res.json(updated || localUpdated || { ...current, ...updates });
  } catch (err: any) {
    console.error('Erro ao atualizar estabelecimento:', err);
    res.status(500).json({ error: 'Erro ao atualizar estabelecimento' });
  }
});

app.delete('/api/establishments/:id', async (req, res) => {
  try {
    let ok = false;
    if (isSupabaseConfigured()) {
      ok = await supabaseDb.deleteEstablishment(req.params.id);
    }
    const localOk = db.deleteEstablishment(req.params.id);
    if (!ok && !localOk) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao deletar estabelecimento:', err);
    res.status(500).json({ error: 'Erro ao excluir estabelecimento' });
  }
});

// ==================== COMPATIBILITY & SIMULATION ====================
app.post('/api/establishments/:id/compatibility', async (req, res) => {
  try {
    const est =
      (isSupabaseConfigured() ? await supabaseDb.getEstablishmentById(req.params.id) : null) ||
      db.getEstablishmentById(req.params.id);
    if (!est) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    const { profile, userId } = req.body;
    const userProfile = profile
      ? hydrateProfile(userId || 'usr_visitante', profile)
      : await getProfileSource(userId || 'usr_visitante');

    const compatibility = calculatePersonalCompatibility(userProfile, est);
    res.json(compatibility);
  } catch (err: any) {
    console.error('Erro ao calcular compatibilidade:', err);
    res.status(500).json({ error: 'Erro ao calcular compatibilidade' });
  }
});

app.post('/api/establishments/:id/simulation', async (req, res) => {
  try {
    const est =
      (isSupabaseConfigured() ? await supabaseDb.getEstablishmentById(req.params.id) : null) ||
      db.getEstablishmentById(req.params.id);
    if (!est) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    const { profile, userId } = req.body;
    const userProfile = profile
      ? hydrateProfile(userId || 'usr_visitante', profile)
      : await getProfileSource(userId || 'usr_visitante');

    const simulation = generateVisitSimulation(userProfile, est);
    res.json(simulation);
  } catch (err: any) {
    console.error('Erro ao gerar simulação:', err);
    res.status(500).json({ error: 'Erro ao gerar simulação de visita' });
  }
});

// ==================== REVIEWS ====================
app.get('/api/establishments/:id/reviews', async (req, res) => {
  try {
    const reviews =
      (isSupabaseConfigured() ? await supabaseDb.getReviewsByEstablishment(req.params.id) : null) ??
      db.getReviewsByEstablishment(req.params.id);
    res.json(reviews);
  } catch (err: any) {
    console.error('Erro ao listar avaliações:', err);
    res.status(500).json({ error: 'Erro ao listar avaliações' });
  }
});

app.post('/api/establishments/:id/reviews', async (req, res) => {
  try {
    const est =
      (isSupabaseConfigured() ? await supabaseDb.getEstablishmentById(req.params.id) : null) ||
      db.getEstablishmentById(req.params.id);
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
      went_accompanied: Boolean(went_accompanied),
      rating: Number(rating) || 5,
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

    if (barriers_reported && barriers_reported.length > 0) {
      const existingBarriers = new Set(est.barriers || []);
      barriers_reported.forEach((b: string) => existingBarriers.add(b));
      const patch = {
        barriers: Array.from(existingBarriers),
        reliability_score: Math.min(100, (est.reliability_score || 80) + 2),
      };
      if (isSupabaseConfigured()) {
        await supabaseDb.updateEstablishment(est.id, patch);
      }
      db.updateEstablishment(est.id, patch);
    }

    metric('acessoreal.reviews.created', 1, { outcome: 'success' });
    res.status(201).json(review);
  } catch (err: any) {
    console.error('Erro ao registrar avaliação:', err);
    metric('acessoreal.reviews.created', 1, { outcome: 'error' });
    res.status(500).json({ error: 'Erro ao salvar avaliação' });
  }
});

// ==================== AI VISION ANALYSIS ====================
app.post('/api/ai/analyze', upload.single('image'), async (req, res) => {
  const started = performance.now();
  const categoryHint = (req.body.category || 'entrada') as any;
  try {
    if (!req.file) {
      metric('acessoreal.ai.analyze', 1, { outcome: 'validation_error', category: String(categoryHint) });
      return res.status(400).json({ error: 'Nenhuma fotografia enviada para análise' });
    }

    const establishmentId = req.body.establishment_id || null;
    let opticalMetrics: OpticalMetrics | undefined;
    if (req.body.optical_metrics) {
      try {
        opticalMetrics = JSON.parse(req.body.optical_metrics);
      } catch (_e) {
        opticalMetrics = undefined;
      }
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const fileName = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    // Persist uploaded photo directly to Supabase Storage (serverless-safe)
    let imageUrl = `/uploads/${fileName}`;
    if (isSupabaseConfigured()) {
      const publicUrl = await supabaseDb.uploadPublicImage(
        req.file.buffer,
        fileName,
        req.file.mimetype || 'image/jpeg'
      );
      if (publicUrl) {
        imageUrl = publicUrl;
      }
    }

    const analysis = await analyzeAccessibilityImage({
      imageBuffer: req.file.buffer,
      imageUrl,
      mimeType: req.file.mimetype || 'image/jpeg',
      categoryHint,
      establishmentId,
      opticalMetrics,
    });

    if (isSupabaseConfigured()) {
      await supabaseDb.addAIAnalysis(analysis);
    }
    db.addAIAnalysis(analysis);

    metric('acessoreal.ai.analyze', 1, { outcome: 'success', category: String(categoryHint) });
    metric('acessoreal.ai.duration_ms', performance.now() - started, { category: String(categoryHint) });
    res.json(analysis);
  } catch (err: any) {
    console.error('Falha na análise de IA:', err);
    metric('acessoreal.ai.analyze', 1, { outcome: 'error', category: String(categoryHint) });
    res.status(500).json({ error: 'Erro ao processar imagem por inteligência artificial', details: err.message });
  }
});

app.get('/api/ai/history', async (req, res) => {
  try {
    const estId = req.query.establishment_id as string | undefined;
    const list =
      (isSupabaseConfigured() ? await supabaseDb.getAIAnalyses(estId) : null) ??
      db.getAIAnalyses(estId);
    res.json(list);
  } catch (err: any) {
    console.error('Erro ao buscar histórico IA:', err);
    res.status(500).json({ error: 'Erro ao buscar histórico de análises' });
  }
});

// ==================== IMAGE UPLOADS ====================
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    let fileUrl = `/uploads/${filename}`;
    if (isSupabaseConfigured()) {
      const uploadedUrl = await supabaseDb.uploadPublicImage(
        req.file.buffer,
        filename,
        req.file.mimetype || 'image/jpeg'
      );
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
      }
    }

    res.json({ url: fileUrl, filename });
  } catch (err: any) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro ao fazer upload de arquivo' });
  }
});

// ==================== REPORTS & MODERATION ====================
app.post('/api/reports', async (req, res) => {
  try {
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
  } catch (err: any) {
    console.error('Erro ao registrar denúncia:', err);
    res.status(500).json({ error: 'Erro ao salvar denúncia' });
  }
});

// ==================== ACCESSIBLE ROUTES (TUPÃ / FADAP) ====================
app.post('/api/routes/calculate', async (req, res) => {
  const started = performance.now();
  const mode = String(req.body?.transportMode || 'pe');
  try {
    const { origin, destination, profile, routePreference, transportMode } = req.body;
    if (!origin || !destination || origin.lat == null || destination.lat == null) {
      metric('acessoreal.routes.calculate', 1, { outcome: 'validation_error', mode });
      return res.status(400).json({ error: 'Origem e destino com coordenadas são obrigatórios' });
    }
    const { list } = await getEstablishmentsSource();
    const result = await calculateAccessibleRoute(
      { origin, destination, profile, routePreference, transportMode },
      list
    );
    metric('acessoreal.routes.calculate', 1, { outcome: 'success', mode });
    metric('acessoreal.routes.duration_ms', performance.now() - started, { mode });
    res.json(result);
  } catch (error: any) {
    console.error('Erro ao calcular rota acessível:', error);
    metric('acessoreal.routes.calculate', 1, { outcome: 'error', mode });
    res.status(500).json({ error: 'Erro ao calcular rota acessível' });
  }
});

// ==================== ADMIN DASHBOARD ====================
app.get('/api/admin/dashboard', async (_req, res) => {
  try {
    const { list: establishments } = await getEstablishmentsSource();
    const reviews =
      (isSupabaseConfigured() ? await supabaseDb.getAllReviews() : null) ?? db.getAllReviews();
    const reports =
      (isSupabaseConfigured() ? await supabaseDb.getReports() : null) ?? db.getReports();
    const analyses =
      (isSupabaseConfigured() ? await supabaseDb.getAIAnalyses() : null) ?? db.getAIAnalyses();

    const totalVerified = establishments.filter((e) => e.verified_status === 'verificado').length;
    const totalPartial = establishments.filter((e) => e.verified_status === 'parcial').length;
    const totalPending = establishments.filter(
      (e) => e.verified_status === 'em_analise' || e.verified_status === 'pendente'
    ).length;

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
  } catch (err: any) {
    console.error('Erro no dashboard admin:', err);
    res.status(500).json({ error: 'Erro ao carregar painel administrativo' });
  }
});

app.put('/api/admin/reviews/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    let ok = false;
    if (isSupabaseConfigured()) {
      ok = await supabaseDb.updateReviewStatus(req.params.id, status);
    }
    const localOk = db.updateReviewStatus(req.params.id, status);
    if (!ok && !localOk) return res.status(404).json({ error: 'Avaliação não encontrada' });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao moderar avaliação:', err);
    res.status(500).json({ error: 'Erro ao atualizar status da avaliação' });
  }
});

app.put('/api/admin/reports/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    let ok = false;
    if (isSupabaseConfigured()) {
      ok = await supabaseDb.updateReportStatus(req.params.id, status);
    }
    const localOk = db.updateReportStatus(req.params.id, status);
    if (!ok && !localOk) return res.status(404).json({ error: 'Denúncia não encontrada' });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao moderar denúncia:', err);
    res.status(500).json({ error: 'Erro ao atualizar status da denúncia' });
  }
});

export default app;
