import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  Establishment,
  Review,
  AIAnalysis,
  ReportItem,
  UserProfile,
  User,
} from './types.js';
import { hydrateProfile } from './database.js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http'));
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const STORAGE_BUCKET = 'images';

export const supabaseDb = {
  // HEALTH CHECK
  async checkHealth(): Promise<{ connected: boolean; establishmentsCount: number; latencyMs: number; error?: string }> {
    const started = performance.now();
    const sb = getSupabase();
    if (!sb) {
      return { connected: false, establishmentsCount: 0, latencyMs: 0, error: 'Supabase não configurado' };
    }
    const { count, error } = await sb
      .from('establishments')
      .select('id', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - started);
    if (error) {
      return { connected: false, establishmentsCount: 0, latencyMs, error: error.message };
    }
    return { connected: true, establishmentsCount: count ?? 0, latencyMs };
  },

  // USERS
  async findUserByEmail(email: string): Promise<User | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('users')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error) {
      console.error('Supabase findUserByEmail error:', error.message);
      return null;
    }
    return data as User | null;
  },

  async createUser(user: User): Promise<User | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) {
      console.error('Supabase createUser error:', error.message);
      return null;
    }
    return data as User;
  },

  // PROFILES
  async getProfile(userId: string): Promise<UserProfile | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getProfile error:', error.message);
      return null;
    }
    if (!data) return null;
    return hydrateProfile(userId, data as Partial<UserProfile>);
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const payload: UserProfile = {
      ...hydrateProfile(profile.user_id, profile),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await sb
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase saveProfile error:', error.message);
      return null;
    }
    return hydrateProfile(profile.user_id, data as Partial<UserProfile>);
  },

  // ESTABLISHMENTS
  async getAllEstablishments(): Promise<Establishment[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('establishments')
      .select('*')
      .order('overall_score', { ascending: false });

    if (error) {
      console.error('Supabase getAllEstablishments error:', error.message);
      return null;
    }
    return (data || []) as Establishment[];
  },

  async getEstablishmentById(id: string): Promise<Establishment | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('establishments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase getEstablishmentById error:', error.message);
      return null;
    }
    return data as Establishment | null;
  },

  async createEstablishment(est: Establishment): Promise<Establishment | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('establishments')
      .insert(est)
      .select()
      .single();

    if (error) {
      console.error('Supabase createEstablishment error:', error.message);
      return null;
    }
    return data as Establishment;
  },

  async updateEstablishment(id: string, updates: Partial<Establishment>): Promise<Establishment | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('establishments')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase updateEstablishment error:', error.message);
      return null;
    }
    return data as Establishment | null;
  },

  async deleteEstablishment(id: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return false;

    const { error } = await sb
      .from('establishments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteEstablishment error:', error.message);
      return false;
    }
    return true;
  },

  // REVIEWS
  async getReviewsByEstablishment(establishmentId: string): Promise<Review[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('reviews')
      .select('*')
      .eq('establishment_id', establishmentId)
      .eq('status', 'aprovada')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getReviewsByEstablishment error:', error.message);
      return null;
    }
    return (data || []) as Review[];
  },

  async getAllReviews(): Promise<Review[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getAllReviews error:', error.message);
      return null;
    }
    return (data || []) as Review[];
  },

  async addReview(review: Review): Promise<Review | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) {
      console.error('Supabase addReview error:', error.message);
      return null;
    }
    return data as Review;
  },

  async updateReviewStatus(id: string, status: Review['status']): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return false;

    const { error } = await sb
      .from('reviews')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Supabase updateReviewStatus error:', error.message);
      return false;
    }
    return true;
  },

  // AI ANALYSES
  async addAIAnalysis(analysis: AIAnalysis): Promise<AIAnalysis | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('ai_analyses')
      .insert(analysis)
      .select()
      .single();

    if (error) {
      console.error('Supabase addAIAnalysis error:', error.message);
      return null;
    }
    return data as AIAnalysis;
  },

  async getAIAnalyses(establishmentId?: string): Promise<AIAnalysis[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    let query = sb
      .from('ai_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (establishmentId) {
      query = query.eq('establishment_id', establishmentId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase getAIAnalyses error:', error.message);
      return null;
    }
    return (data || []) as AIAnalysis[];
  },

  // REPORTS
  async addReport(report: ReportItem): Promise<ReportItem | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const dbStatus =
      report.status === 'resolvido'
        ? 'resolvida'
        : report.status === 'rejeitado'
        ? 'descartada'
        : 'pendente';

    const { data, error } = await sb
      .from('reports')
      .insert({ ...report, status: dbStatus })
      .select()
      .single();

    if (error) {
      console.error('Supabase addReport error:', error.message);
      return null;
    }
    return data as ReportItem;
  },

  async getReports(): Promise<ReportItem[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getReports error:', error.message);
      return null;
    }
    return (data || []) as ReportItem[];
  },

  async updateReportStatus(id: string, status: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return false;

    const dbStatus =
      status === 'resolvido' || status === 'resolvida'
        ? 'resolvida'
        : status === 'rejeitado' || status === 'descartada'
        ? 'descartada'
        : 'pendente';

    const { error } = await sb
      .from('reports')
      .update({ status: dbStatus })
      .eq('id', id);

    if (error) {
      console.error('Supabase updateReportStatus error:', error.message);
      return false;
    }
    return true;
  },

  // STORAGE (Serverless-safe persistent image uploads)
  async uploadPublicImage(
    buffer: Buffer,
    filename: string,
    contentType = 'image/jpeg'
  ): Promise<string | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const objectPath = `uploads/${filename}`;
    const { error } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, buffer, {
        contentType,
        upsert: true,
        cacheControl: '31536000',
      });

    if (error) {
      console.error('Supabase Storage upload error:', error.message);
      return null;
    }

    const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
    return data?.publicUrl || null;
  },
};
