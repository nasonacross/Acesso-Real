-- ====================================================================
-- AcessoReal — Schema do Banco de Dados PostgreSQL / Supabase
-- Projeto: acessoreal-db (sa-east-1)
-- ====================================================================

create extension if not exists "pgcrypto";

-- 1. TABELA DE USUÁRIOS
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text unique not null,
  role text not null default 'visitor' check (role in ('visitor', 'owner', 'admin')),
  password_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. TABELA DE PERFIS PERSONALIZADOS (CONDIÇÕES MENTAIS & CORPORAIS)
create table if not exists public.profiles (
  user_id text primary key references public.users(id) on delete cascade,
  physical jsonb not null default '{}'::jsonb,
  intellectual jsonb not null default '{}'::jsonb,
  sensory jsonb not null default '{}'::jsonb,
  visual jsonb not null default '{}'::jsonb,
  auditory jsonb not null default '{}'::jsonb,
  other jsonb not null default '{}'::jsonb,
  accompaniment jsonb not null default '{"status": "undecided", "companion_count": 1, "helps_mobility": false, "helps_communication": false, "helps_activities": false, "full_time_escort": false}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. TABELA DE ESTABELECIMENTOS E ASSISTÊNCIAS SOCIAIS (TUPÃ & REGIÃO)
create table if not exists public.establishments (
  id text primary key,
  name text not null,
  category text not null,
  description text default '',
  address text not null,
  city text not null,
  state text not null default 'SP',
  postal_code text default '',
  lat double precision not null,
  lng double precision not null,
  phone text default '',
  website text default '',
  images jsonb not null default '[]'::jsonb,
  provenance text default 'usuario',
  is_demo boolean default false,
  verified_status text default 'em_analise',
  reliability_score integer default 60,
  last_update text default to_char(now(), 'YYYY-MM-DD'),
  owner_id text references public.users(id) on delete set null,
  features jsonb not null default '{}'::jsonb,
  barriers jsonb not null default '[]'::jsonb,
  unverified_items jsonb not null default '[]'::jsonb,
  physical_score integer default 0,
  intellectual_score integer default 0,
  sensory_score integer default 0,
  visual_score integer default 0,
  auditory_score integer default 0,
  service_score integer default 0,
  overall_score integer default 0,
  classification text default '',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_establishments_city on public.establishments (lower(city));
create index if not exists idx_establishments_category on public.establishments (category);
create index if not exists idx_establishments_status on public.establishments (verified_status);
create index if not exists idx_establishments_owner_id on public.establishments (owner_id);
create index if not exists idx_establishments_features on public.establishments using gin (features);

-- 4. TABELA DE AVALIAÇÕES (REVIEWS)
create table if not exists public.reviews (
  id text primary key,
  establishment_id text not null references public.establishments(id) on delete cascade,
  user_id text default 'usr_anonimo',
  user_name text default 'Visitante AcessoReal',
  user_condition_tag text default 'Visitante',
  went_accompanied boolean default false,
  rating integer default 5,
  comment text default '',
  category_evaluations jsonb not null default '{"physical": 80, "intellectual": 80, "sensory": 80, "visual": 80, "auditory": 80, "service": 80}'::jsonb,
  barriers_reported jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  provenance text default 'usuario',
  status text not null default 'aprovada' check (status in ('aprovada', 'pendente', 'rejeitada')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_reviews_establishment on public.reviews (establishment_id);

-- 5. TABELA DE ANÁLISES POR IA VISÃO
create table if not exists public.ai_analyses (
  id text primary key,
  establishment_id text references public.establishments(id) on delete set null,
  image_url text not null,
  category_analyzed text default 'entrada',
  identified_items jsonb not null default '[]'::jsonb,
  potential_barriers jsonb not null default '[]'::jsonb,
  affected_audience jsonb not null default '[]'::jsonb,
  recommended_improvements jsonb not null default '[]'::jsonb,
  confidence_score integer default 80,
  confidence_label text default 'Média confiança',
  disclaimer text default '',
  status text not null default 'concluido',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_ai_establishment on public.ai_analyses (establishment_id);

-- 6. TABELA DE DENÚNCIAS (REPORTS)
create table if not exists public.reports (
  id text primary key,
  establishment_id text not null references public.establishments(id) on delete cascade,
  reported_by_user_id text default 'usr_anonimo',
  reason text not null,
  description text default '',
  status text not null default 'pendente' check (status in ('pendente', 'resolvida', 'descartada')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_reports_establishment_id on public.reports (establishment_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
alter table public.reviews enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.reports enable row level security;

-- Users: acesso restrito ao service_role (backend Vercel)
drop policy if exists "Acesso restrito ao service_role para usuarios" on public.users;
create policy "Acesso restrito ao service_role para usuarios"
  on public.users for all to service_role using (true) with check (true);

-- Leitura pública controlada
create policy "Permitir leitura pública de estabelecimentos" on public.establishments for select using (true);
create policy "Permitir leitura pública de avaliações aprovadas" on public.reviews for select using (status = 'aprovada');
create policy "Permitir leitura pública de análises IA" on public.ai_analyses for select using (true);
create policy "Permitir leitura de perfis pelo próprio usuário" on public.profiles for select using (true);

-- Inserção e atualização
create policy "Permitir inserção de avaliações" on public.reviews for insert with check (true);
create policy "Permitir inserção de denúncias" on public.reports for insert with check (true);
create policy "Permitir inserção de análises IA" on public.ai_analyses for insert with check (true);
create policy "Permitir cadastro de estabelecimentos" on public.establishments for insert with check (true);
create policy "Permitir atualização de estabelecimentos" on public.establishments for update using (true);
create policy "Permitir atualização de perfis" on public.profiles for insert with check (true);
create policy "Permitir update de perfis" on public.profiles for update using (true);
