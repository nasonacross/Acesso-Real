import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.resolve(__dirname, '../data/database.json');
const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJson(obj) {
  if (obj === null || obj === undefined) return `'{}'::jsonb`;
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

let sql = `-- ====================================================================
-- AcessoReal - Seed Data para Supabase / PostgreSQL
-- Contém dados de usuários, perfis, estabelecimentos (Tupã, Bastos, Marília, SP),
-- avaliações comunitárias e análises de visão computacional por IA
-- ====================================================================

-- 1. SEED USUÁRIOS
INSERT INTO public.users (id, name, email, role, password_hash, created_at)
VALUES
`;

const userRows = (data.users || []).map(u => {
  return `  (${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.email)}, ${escapeSql(u.role)}, ${escapeSql(u.password_hash)}, ${escapeSql(u.created_at)})`;
});
sql += userRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';

// 2. SEED PERFIS
sql += `-- 2. SEED PERFIS DE ACESSIBILIDADE\nINSERT INTO public.profiles (user_id, physical, intellectual, sensory, visual, auditory, other, accompaniment, updated_at)\nVALUES\n`;

const profileRows = Object.values(data.profiles || {}).map(p => {
  return `  (${escapeSql(p.user_id)}, ${escapeJson(p.physical)}, ${escapeJson(p.intellectual)}, ${escapeJson(p.sensory)}, ${escapeJson(p.visual)}, ${escapeJson(p.auditory)}, ${escapeJson(p.other)}, ${escapeJson(p.accompaniment)}, ${escapeSql(p.updated_at)})`;
});
sql += profileRows.join(',\n') + '\nON CONFLICT (user_id) DO NOTHING;\n\n';

// 3. SEED ESTABELECIMENTOS
sql += `-- 3. SEED ESTABELECIMENTOS (${data.establishments.length} locais em Tupã, Bastos, Marília e SP)\n`;
sql += `INSERT INTO public.establishments (
  id, name, category, description, address, city, state, postal_code,
  lat, lng, phone, website, images, provenance, is_demo, verified_status,
  reliability_score, last_update, owner_id, features, barriers, unverified_items,
  physical_score, intellectual_score, sensory_score, visual_score,
  auditory_score, service_score, overall_score, classification
) VALUES\n`;

const estRows = (data.establishments || []).map(e => {
  return `  (${escapeSql(e.id)}, ${escapeSql(e.name)}, ${escapeSql(e.category)}, ${escapeSql(e.description || '')}, ${escapeSql(e.address)}, ${escapeSql(e.city)}, ${escapeSql(e.state || 'SP')}, ${escapeSql(e.postal_code || '')}, ${e.lat}, ${e.lng}, ${escapeSql(e.phone || '')}, ${escapeSql(e.website || '')}, ${escapeJson(e.images || [])}, ${escapeSql(e.provenance || 'usuario')}, ${e.is_demo ? 'true' : 'false'}, ${escapeSql(e.verified_status || 'em_analise')}, ${e.reliability_score || 60}, ${escapeSql(e.last_update || '2026-11-19')}, ${escapeSql(e.owner_id)}, ${escapeJson(e.features || {})}, ${escapeJson(e.barriers || [])}, ${escapeJson(e.unverified_items || [])}, ${e.physical_score || 0}, ${e.intellectual_score || 0}, ${e.sensory_score || 0}, ${e.visual_score || 0}, ${e.auditory_score || 0}, ${e.service_score || 0}, ${e.overall_score || 0}, ${escapeSql(e.classification || '')})`;
});
sql += estRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';

// 4. SEED AVALIAÇÕES
if (data.reviews && data.reviews.length > 0) {
  sql += `-- 4. SEED AVALIAÇÕES\n`;
  sql += `INSERT INTO public.reviews (
    id, establishment_id, user_id, user_name, user_condition_tag,
    went_accompanied, rating, comment, category_evaluations,
    barriers_reported, images, provenance, status, created_at
  ) VALUES\n`;

  const revRows = data.reviews.map(r => {
    return `  (${escapeSql(r.id)}, ${escapeSql(r.establishment_id)}, ${escapeSql(r.user_id)}, ${escapeSql(r.user_name)}, ${escapeSql(r.user_condition_tag)}, ${r.went_accompanied ? 'true' : 'false'}, ${r.rating}, ${escapeSql(r.comment)}, ${escapeJson(r.category_evaluations)}, ${escapeJson(r.barriers_reported)}, ${escapeJson(r.images)}, ${escapeSql(r.provenance)}, ${escapeSql(r.status)}, ${escapeSql(r.created_at)})`;
  });
  sql += revRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
}

// 5. SEED ANÁLISES IA
if (data.ai_analyses && data.ai_analyses.length > 0) {
  sql += `-- 5. SEED ANÁLISES DE VISÃO COMPUTACIONAL POR IA\n`;
  sql += `INSERT INTO public.ai_analyses (
    id, establishment_id, image_url, category_analyzed,
    identified_items, potential_barriers, affected_audience,
    recommended_improvements, confidence_score, confidence_label,
    disclaimer, status, created_at
  ) VALUES\n`;

  const aiRows = data.ai_analyses.map(a => {
    return `  (${escapeSql(a.id)}, ${escapeSql(a.establishment_id)}, ${escapeSql(a.image_url)}, ${escapeSql(a.category_analyzed)}, ${escapeJson(a.identified_items)}, ${escapeJson(a.potential_barriers)}, ${escapeJson(a.affected_audience)}, ${escapeJson(a.recommended_improvements)}, ${a.confidence_score}, ${escapeSql(a.confidence_label)}, ${escapeSql(a.disclaimer)}, ${escapeSql(a.status)}, ${escapeSql(a.created_at)})`;
  });
  sql += aiRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
}

const outputFile = path.resolve(__dirname, '../../supabase/seed.sql');
fs.writeFileSync(outputFile, sql, 'utf8');
console.log(`Generated ${outputFile} with ${data.establishments.length} establishments!`);
