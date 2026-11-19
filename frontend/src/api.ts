import {
  Establishment,
  UserProfile,
  PersonalCompatibilityResult,
  VisitSimulationResult,
  Review,
  AIAnalysis
} from './types';

const BASE_URL = '/api';

export async function fetchEstablishments(params?: {
  q?: string;
  category?: string;
  city?: string;
  corridor?: string;
  wheelchair?: boolean;
  libras?: boolean;
  sensory?: boolean;
  restroom?: boolean;
  braille?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  userId?: string;
}): Promise<Establishment[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.category && params.category !== 'todos') query.set('category', params.category);
  if (params?.city && params.city !== 'todas') query.set('city', params.city);
  if (params?.corridor) query.set('corridor', params.corridor);
  if (params?.wheelchair) query.set('wheelchair', 'true');
  if (params?.libras) query.set('libras', 'true');
  if (params?.sensory) query.set('sensory', 'true');
  if (params?.restroom) query.set('restroom', 'true');
  if (params?.braille) query.set('braille', 'true');
  if (params?.lat !== undefined) query.set('lat', params.lat.toString());
  if (params?.lng !== undefined) query.set('lng', params.lng.toString());
  if (params?.radiusKm) query.set('radiusKm', params.radiusKm.toString());
  if (params?.userId) query.set('userId', params.userId);

  const res = await fetch(`${BASE_URL}/establishments?${query.toString()}`);
  if (!res.ok) throw new Error('Falha ao carregar estabelecimentos');
  return res.json();
}

export async function fetchEstablishmentById(id: string): Promise<Establishment> {
  const res = await fetch(`${BASE_URL}/establishments/${id}`);
  if (!res.ok) throw new Error('Estabelecimento não encontrado');
  return res.json();
}

export async function createEstablishment(data: Partial<Establishment>): Promise<Establishment> {
  const res = await fetch(`${BASE_URL}/establishments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao criar estabelecimento');
  return res.json();
}

export async function updateEstablishment(id: string, data: Partial<Establishment>): Promise<Establishment> {
  const res = await fetch(`${BASE_URL}/establishments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao atualizar estabelecimento');
  return res.json();
}

export async function fetchProfile(userId: string): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/profile/${userId}`);
  if (!res.ok) throw new Error('Falha ao obter perfil');
  return res.json();
}

export async function saveProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Falha ao salvar perfil');
  return res.json();
}

export async function calculateCompatibility(
  establishmentId: string,
  profile?: UserProfile,
  userId?: string
): Promise<PersonalCompatibilityResult> {
  const res = await fetch(`${BASE_URL}/establishments/${establishmentId}/compatibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, userId }),
  });
  if (!res.ok) throw new Error('Falha ao calcular compatibilidade');
  return res.json();
}

export async function fetchSimulation(
  establishmentId: string,
  profile?: UserProfile,
  userId?: string
): Promise<VisitSimulationResult> {
  const res = await fetch(`${BASE_URL}/establishments/${establishmentId}/simulation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, userId }),
  });
  if (!res.ok) throw new Error('Falha ao simular visita');
  return res.json();
}

export async function submitReview(establishmentId: string, reviewData: Partial<Review>): Promise<Review> {
  const res = await fetch(`${BASE_URL}/establishments/${establishmentId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) throw new Error('Falha ao enviar avaliação');
  return res.json();
}

export async function submitReport(data: {
  establishment_id: string;
  reason: string;
  description: string;
  reported_by_user_id?: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao enviar denúncia');
  return res.json();
}

export async function analyzeImageAI(
  formData: FormData
): Promise<AIAnalysis> {
  const res = await fetch(`${BASE_URL}/ai/analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Falha ao processar análise por IA');
  return res.json();
}

export async function fetchAdminDashboard(): Promise<any> {
  const res = await fetch(`${BASE_URL}/admin/dashboard`);
  if (!res.ok) throw new Error('Falha ao carregar dados administrativos');
  return res.json();
}

export async function updateReviewStatusAdmin(id: string, status: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/admin/reviews/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Falha ao atualizar avaliação');
  return res.json();
}

export async function updateReportStatusAdmin(id: string, status: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/admin/reports/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Falha ao atualizar denúncia');
  return res.json();
}
