import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  Establishment,
  Review,
  AIAnalysis,
  ReportItem,
  UserProfile,
  User
} from './types.js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

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
      auth: { persistSession: false },
    });
  }
  return client;
}

// ==================== SUPABASE REPOSITORY METHODS ====================

export const supabaseDb = {
  // ESTABLISHMENTS
  async getAllEstablishments(): Promise<Establishment[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('establishments')
      .select('*')
      .order('overall_score', { ascending: false });

    if (error) {
      console.error('Erro ao buscar estabelecimentos no Supabase:', error.message);
      return null;
    }
    return data as Establishment[];
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
      console.error('Erro ao buscar estabelecimento por ID no Supabase:', error.message);
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
      console.error('Erro ao criar estabelecimento no Supabase:', error.message);
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
      console.error('Erro ao atualizar estabelecimento no Supabase:', error.message);
      return null;
    }
    return data as Establishment;
  },

  async deleteEstablishment(id: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return false;

    const { error } = await sb
      .from('establishments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar estabelecimento no Supabase:', error.message);
      return false;
    }
    return true;
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
      console.error('Erro ao buscar perfil no Supabase:', error.message);
      return null;
    }
    return data as UserProfile | null;
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar perfil no Supabase:', error.message);
      return null;
    }
    return data as UserProfile;
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
      console.error('Erro ao buscar avaliações no Supabase:', error.message);
      return null;
    }
    return data as Review[];
  },

  async getAllReviews(): Promise<Review[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar todas avaliações no Supabase:', error.message);
      return null;
    }
    return data as Review[];
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
      console.error('Erro ao inserir avaliação no Supabase:', error.message);
      return null;
    }
    return data as Review;
  },

  async updateReviewStatus(id: string, status: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return false;

    const { error } = await sb
      .from('reviews')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status da avaliação no Supabase:', error.message);
      return false;
    }
    return true;
  },

  // AI ANALYSES
  async getAIAnalyses(establishmentId?: string): Promise<AIAnalysis[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    let query = sb.from('ai_analyses').select('*').order('created_at', { ascending: false });
    if (establishmentId) {
      query = query.eq('establishment_id', establishmentId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar análises de IA no Supabase:', error.message);
      return null;
    }
    return data as AIAnalysis[];
  },

  async addAIAnalysis(analysis: AIAnalysis): Promise<AIAnalysis | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('ai_analyses')
      .insert(analysis)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar análise de IA no Supabase:', error.message);
      return null;
    }
    return data as AIAnalysis;
  },

  // REPORTS
  async getReports(): Promise<ReportItem[] | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar denúncias no Supabase:', error.message);
      return null;
    }
    return data as ReportItem[];
  },

  async addReport(report: ReportItem): Promise<ReportItem | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('reports')
      .insert(report)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar denúncia no Supabase:', error.message);
      return null;
    }
    return data as ReportItem;
  },

  async updateReportStatus(id: string, status: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return false;

    const { error } = await sb
      .from('reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status da denúncia no Supabase:', error.message);
      return false;
    }
    return true;
  },

  // USERS
  async findUserByEmail(email: string): Promise<User | null> {
    const sb = getSupabase();
    if (!sb) return null;

    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar usuário por email no Supabase:', error.message);
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
      console.error('Erro ao criar usuário no Supabase:', error.message);
      return null;
    }
    return data as User;
  },
};
