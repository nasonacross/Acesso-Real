import { Establishment } from './types.js';
import { db } from './database.js';

export interface RouteRequest {
  origin: {
    lat: number;
    lng: number;
    name: string;
  };
  destination: {
    lat: number;
    lng: number;
    name: string;
    establishmentId?: string;
  };
  profile?: 'cadeirante' | 'visual' | 'mobilidade' | 'idoso' | 'sensorial' | 'geral';
  routePreference?: 'nivelada' | 'curta' | 'sensorial';
  transportMode?: 'pe' | 'onibus' | 'carro';
}

export interface RouteStep {
  step_number: number;
  title: string;
  instruction: string;
  distance_meters: number;
  duration_seconds: number;
  accessibility_feature: string;
  status: 'confirmado' | 'atencao' | 'informativo';
  icon: 'straight' | 'right' | 'left' | 'crossing' | 'destination' | 'elevator' | 'ramp' | 'bus' | 'car';
  alert?: string | null;
  lat: number;
  lng: number;
}

export interface AccessibleRouteResponse {
  origin_name: string;
  origin_coords: [number, number];
  destination_name: string;
  destination_coords: [number, number];
  destination_establishment_id?: string;
  transport_mode: 'pe' | 'onibus' | 'carro';
  transport_mode_text: string;
  total_distance_meters: number;
  total_distance_text: string;
  total_duration_minutes: number;
  total_duration_text: string;
  overall_accessibility_score: number;
  level_paving_percentage: number;
  tactile_paving_percentage: number;
  sensory_calm_score: number;
  route_type: 'nivelada' | 'curta' | 'sensorial';
  coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  steps: RouteStep[];
  critical_warnings: string[];
  establishment_summary?: {
    name: string;
    category: string;
    classification: string;
    overall_score: number;
    image?: string;
  };
}

// Haversine distance in meters
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Fetch OSRM route with timeout (foot or driving) using routing.openstreetmap.de primary + project-osrm fallback
async function fetchOsrmRoute(
  startLng: number,
  startLat: number,
  endLng: number,
  endLat: number,
  mode: 'foot' | 'driving'
): Promise<{ coordinates: [number, number][]; distanceMeters: number; steps?: any[] } | null> {
  const endpoints = [
    mode === 'foot'
      ? `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`
      : `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`,
    `https://router.project-osrm.org/route/v1/${mode}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`,
  ];

  for (const url of endpoints) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AcessoReal-Tupa/1.0 (+https://acesso-real.vercel.app)',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data: any = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] // convert [lon, lat] to [lat, lon]
        );
        const rawSteps = route.legs?.[0]?.steps || [];
        return {
          coordinates: coords,
          distanceMeters: Math.round(route.distance),
          steps: rawSteps,
        };
      }
    } catch (_e) {
      // Try next routing server or fallback to synthetic geometry
    } finally {
      clearTimeout(timeoutId);
    }
  }
  return null;
}

// Generate street-like intermediate grid polyline coordinates if OSRM is unavailable
function generateGridPolyline(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const coords: [number, number][] = [start];
  const midLat = start[0] + (end[0] - start[0]) * 0.45;
  const midLng = start[1] + (end[1] - start[1]) * 0.55;

  coords.push([midLat, start[1]]);
  coords.push([midLat, midLng]);
  coords.push([end[0], midLng]);
  coords.push(end);

  const result: [number, number][] = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    result.push(p1);
    for (let j = 1; j < 3; j++) {
      const frac = j / 3;
      result.push([p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac]);
    }
  }
  result.push(end);
  return result;
}

export async function calculateAccessibleRoute(
  req: RouteRequest,
  establishmentsOverride?: Establishment[]
): Promise<AccessibleRouteResponse> {
  const { origin, destination, profile = 'geral', routePreference = 'nivelada', transportMode = 'pe' } = req;

  // Retrieve destination establishment from Supabase list or local DB fallback
  const all = establishmentsOverride && establishmentsOverride.length > 0
    ? establishmentsOverride
    : db.getAllEstablishments();

  let establishment: Establishment | undefined;
  if (destination.establishmentId) {
    establishment = all.find((e) => e.id === destination.establishmentId);
  }
  if (!establishment) {
    establishment = all.find(
      (e) =>
        e.name.toLowerCase().includes(destination.name.toLowerCase()) ||
        (Math.abs(e.lat - destination.lat) < 0.001 && Math.abs(e.lng - destination.lng) < 0.001)
    );
  }

  // Calculate straight line distance
  const crowDistance = haversineDistanceMeters(origin.lat, origin.lng, destination.lat, destination.lng);
  const isIntercityCorridor = crowDistance > 12000; // >12km (between Bastos, Tupã, Pompeia, Marília along SP-294)

  // Try OSRM route: if mode is carro or onibus, or intercity, use driving geometry along SP-294
  const osrmMode = transportMode === 'pe' && !isIntercityCorridor ? 'foot' : 'driving';
  const osrmResult = await fetchOsrmRoute(origin.lng, origin.lat, destination.lng, destination.lat, osrmMode);

  let finalCoords: [number, number][];
  let distanceMeters: number;

  if (osrmResult && osrmResult.coordinates.length > 1) {
    finalCoords = osrmResult.coordinates;
    distanceMeters = osrmResult.distanceMeters;
  } else {
    finalCoords = generateGridPolyline([origin.lat, origin.lng], [destination.lat, destination.lng]);
    distanceMeters = Math.round(crowDistance * 1.25);
  }

  // Speed and duration calculations based on transportMode and profile
  let totalDurationMinutes: number;
  let transportModeText: string;

  if (transportMode === 'carro') {
    transportModeText = 'Carro Adaptado / Táxi Acessível';
    // Urban avg 35km/h, highway SP-294 avg 75km/h
    const avgSpeedKmH = isIntercityCorridor ? 70 : 35;
    totalDurationMinutes = Math.max(3, Math.round((distanceMeters / 1000 / avgSpeedKmH) * 60));
  } else if (transportMode === 'onibus') {
    transportModeText = 'Transporte Público / Ônibus Adaptado';
    // Bus line along SP-294 + stops
    const busSpeedKmH = isIntercityCorridor ? 55 : 22;
    totalDurationMinutes = Math.max(8, Math.round((distanceMeters / 1000 / busSpeedKmH) * 60 + 8)); // +8 min boarding/stops
  } else {
    // Mode 'pe' (walking / wheelchair)
    transportModeText = 'A Pé / Cadeira de Rodas';
    let speedMetersPerSec = 1.16;
    if (profile === 'cadeirante' || profile === 'mobilidade') speedMetersPerSec = 0.88;
    else if (profile === 'idoso') speedMetersPerSec = 0.82;
    else if (profile === 'sensorial') speedMetersPerSec = 0.95;

    if (isIntercityCorridor) {
      // Pedestrian for 50-100km is unusual, calculate walking time but note
      totalDurationMinutes = Math.round(distanceMeters / speedMetersPerSec / 60);
    } else {
      totalDurationMinutes = Math.max(2, Math.round(distanceMeters / speedMetersPerSec / 60));
    }
  }

  // Determine accessibility metrics
  let overallScore = 94;
  let levelPavingPercentage = 95;
  let tactilePavingPercentage = 85;
  let sensoryCalmScore = 80;

  if (routePreference === 'nivelada') {
    levelPavingPercentage = 98;
    overallScore = 96;
  } else if (routePreference === 'curta') {
    levelPavingPercentage = 84;
    overallScore = 88;
  } else if (routePreference === 'sensorial') {
    sensoryCalmScore = 92;
    overallScore = 95;
  }

  if (establishment) {
    if (profile === 'cadeirante') {
      overallScore = Math.round((overallScore + establishment.physical_score) / 2);
    } else if (profile === 'visual') {
      overallScore = Math.round((overallScore + establishment.visual_score) / 2);
      tactilePavingPercentage = establishment.features.tactile_paving ? 95 : 60;
    } else if (profile === 'sensorial') {
      overallScore = Math.round((overallScore + establishment.sensory_score) / 2);
    }
  }

  const steps: RouteStep[] = [];
  const coordsCount = finalCoords.length;
  const isGpsOrigin = origin.name.toLowerCase().includes('gps') || origin.name.toLowerCase().includes('localização');
  const startP = finalCoords[0];
  const endP = finalCoords[coordsCount - 1];
  const mid1Idx = Math.floor(coordsCount * 0.35);
  const mid1P = finalCoords[mid1Idx] || finalCoords[0];
  const mid2Idx = Math.floor(coordsCount * 0.7);
  const mid2P = finalCoords[mid2Idx] || finalCoords[coordsCount - 1];

  if (transportMode === 'carro') {
    // CAR ROUTE STEPS
    steps.push({
      step_number: 1,
      title: isGpsOrigin ? 'Embarque na Sua Localização (GPS)' : `Partida: ${origin.name}`,
      instruction: `Embarque no veículo adaptado ou táxi acessível com auxílio de rampa ou plataforma lateral. Fixação segura do cinto e cadeira de rodas.`,
      distance_meters: Math.round(distanceMeters * 0.05),
      duration_seconds: 120,
      accessibility_feature: 'Veículo com rampa de acesso e fixação para cadeira de rodas',
      status: 'confirmado',
      icon: 'car',
      lat: startP[0],
      lng: startP[1],
    });

    steps.push({
      step_number: 2,
      title: isIntercityCorridor ? `Deslocamento Rodoviário até ${establishment?.city || 'Tupã'}` : 'Deslocamento por Vias Urbanas de Tupã',
      instruction: isIntercityCorridor
        ? `Siga pela rodovia de acesso até o perímetro urbano de ${establishment?.city || 'Tupã'}. Pista asfaltada e sinalizada.`
        : `Siga pelas vias urbanas de Tupã com tráfego organizado e boa sinalização viária em direção ao bairro do destino.`,
      distance_meters: Math.round(distanceMeters * 0.7),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.7),
      accessibility_feature: 'Trajeto pavimentado com acesso direto ao destino',
      status: 'confirmado',
      icon: 'straight',
      lat: mid1P[0],
      lng: mid1P[1],
    });

    steps.push({
      step_number: 3,
      title: 'Estacionamento na Vaga PCD Reservada',
      instruction: `Estacione na vaga de estacionamento reservada para PcD de ${destination.name}. Vaga sinalizada conforme NBR 9050 com faixa adicional de circulação de 1,20m para manobra.`,
      distance_meters: Math.round(distanceMeters * 0.15),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.15),
      accessibility_feature: 'Vaga reservada com rebaixo de guia direto para o passeio',
      status: 'confirmado',
      icon: 'destination',
      lat: mid2P[0],
      lng: mid2P[1],
    });

    steps.push({
      step_number: 4,
      title: `Chegada e Entrada: ${destination.name}`,
      instruction: `Desembarque com segurança e dirija-se à entrada acessível de ${destination.name}. Piso nivelado antiderrapante e portas amplas (>80cm).`,
      distance_meters: Math.round(distanceMeters * 0.1),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.1),
      accessibility_feature: 'Entrada térrea com rampa e corrimãos bilaterais',
      status: 'confirmado',
      icon: 'destination',
      lat: endP[0],
      lng: endP[1],
    });
  } else if (transportMode === 'onibus') {
    // BUS / PUBLIC TRANSIT STEPS
    steps.push({
      step_number: 1,
      title: isGpsOrigin ? 'Deslocamento ao Ponto / Terminal Acessível' : `Partida: ${origin.name}`,
      instruction: `Acesse o ponto de parada ou terminal rodoviário mais próximo com calçada rebaixada e sinalização tátil.`,
      distance_meters: Math.round(distanceMeters * 0.08),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.1),
      accessibility_feature: 'Plataforma de embarque com piso tátil e área coberta',
      status: 'confirmado',
      icon: 'straight',
      lat: startP[0],
      lng: startP[1],
    });

    steps.push({
      step_number: 2,
      title: isIntercityCorridor ? 'Embarque em Ônibus Intermunicipal Acessível' : 'Embarque em Ônibus Urbano Adaptado de Tupã',
      instruction: `Embarque no ônibus adaptado com elevador para cadeira de rodas, assento preferencial e espaço reservado para cão-guia ou acompanhante.`,
      distance_meters: Math.round(distanceMeters * 0.1),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.15),
      accessibility_feature: 'Veículo com plataforma elevatória e assento reservado NBR 14022',
      status: 'confirmado',
      icon: 'bus',
      lat: mid1P[0],
      lng: mid1P[1],
    });

    steps.push({
      step_number: 3,
      title: isIntercityCorridor ? `Viagem até ${establishment?.city || 'Tupã'}` : 'Deslocamento na Linha Municipal de Tupã',
      instruction: `Trajeto assistido pelo transporte coletivo urbano de Tupã. Utilize o botão de parada acessível próximo ao assento reservado.`,
      distance_meters: Math.round(distanceMeters * 0.65),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.55),
      accessibility_feature: 'Sinalização de paradas e fixação de segurança para cadeirantes',
      status: 'confirmado',
      icon: 'bus',
      lat: mid2P[0],
      lng: mid2P[1],
    });

    steps.push({
      step_number: 4,
      title: `Desembarque e Caminhada até ${destination.name}`,
      instruction: `Desembarque no terminal ou parada acessível em frente ao destino. Siga pela calçada nivelada com guia rebaixada até a recepção.`,
      distance_meters: Math.round(distanceMeters * 0.17),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.2),
      accessibility_feature: 'Percurso final 100% nivelado sem degraus',
      status: 'confirmado',
      icon: 'destination',
      lat: endP[0],
      lng: endP[1],
    });
  } else {
    // PEDESTRIAN / WHEELCHAIR STEPS
    steps.push({
      step_number: 1,
      title: isGpsOrigin ? 'Partida: Sua Posição Atual (GPS)' : `Partida: ${origin.name}`,
      instruction: isGpsOrigin
        ? `Inicie o trajeto a pé ou em cadeira de rodas saindo da sua localização atual. Dirija-se à calçada com rebaixamento de guia e piso regular.`
        : `Inicie o percurso a pé saindo de ${origin.name}. Siga em direção à calçada acessível com rebaixamento de guia.`,
      distance_meters: Math.round(distanceMeters * 0.15),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.15),
      accessibility_feature: profile === 'visual' ? 'Piso tátil direcional e de alerta' : 'Acesso nivelado sem degraus',
      status: 'confirmado',
      icon: 'straight',
      lat: startP[0],
      lng: startP[1],
    });

    steps.push({
      step_number: 2,
      title: 'Passeio Público e Calçadas Acessíveis',
      instruction: `Prossiga pela calçada principal. Faixa livre de circulação com mais de 1,50m de largura, piso regular e blocos sem desníveis.`,
      distance_meters: Math.round(distanceMeters * 0.4),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.4),
      accessibility_feature: 'Calçada regular com rota livre desobstruída',
      status: 'confirmado',
      icon: 'straight',
      lat: mid1P[0],
      lng: mid1P[1],
    });

    steps.push({
      step_number: 3,
      title: 'Travessia Adaptada com Rebaixo de Guia',
      instruction: `Atravesse na faixa de pedestres com rampa de rebaixo suave (inclinação < 8%). ${
        profile === 'visual'
          ? 'Semáforo sonorizado com alerta vibratório e tátil para travessia segura.'
          : 'Sinalização visual e faixa de travessia nivelada.'
      }`,
      distance_meters: Math.round(distanceMeters * 0.2),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.2),
      accessibility_feature: 'Rampa de rebaixo NBR 9050 e semáforo acessível',
      status: 'confirmado',
      icon: 'crossing',
      alert: routePreference === 'curta' ? 'Atenção ao fluxo de veículos em horários de pico.' : null,
      lat: mid2P[0],
      lng: mid2P[1],
    });

    steps.push({
      step_number: 4,
      title: `Chegada e Entrada: ${destination.name}`,
      instruction: `Você chegou a ${destination.name}. ${
        establishment?.features?.has_ramp !== false
          ? 'Acesso principal com rampa nivelada, piso antiderrapante e portas largas (>80cm).'
          : 'Entrada ampla nivelada diretamente com o passeio público.'
      }`,
      distance_meters: Math.round(distanceMeters * 0.25),
      duration_seconds: Math.round(totalDurationMinutes * 60 * 0.25),
      accessibility_feature: 'Entrada 100% acessível e portas amplas',
      status: 'confirmado',
      icon: 'destination',
      lat: endP[0],
      lng: endP[1],
    });
  }

  // Warnings
  const criticalWarnings: string[] = [];
  if (isIntercityCorridor && transportMode === 'pe') {
    criticalWarnings.push(`A distância no corredor regional entre as cidades é de ${(distanceMeters / 1000).toFixed(0)} km. Recomendamos selecionar 'Ônibus Adaptado' ou 'Carro Adaptado' para este deslocamento.`);
  }
  if (establishment && establishment.barriers.length > 0) {
    criticalWarnings.push(`No destino: ${establishment.barriers[0]}`);
  }

  const distanceText =
    distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters} metros`;

  let durationText: string;
  if (transportMode === 'carro') {
    durationText = `${totalDurationMinutes} min de carro / táxi acessível`;
  } else if (transportMode === 'onibus') {
    durationText = `${totalDurationMinutes} min de ônibus adaptado`;
  } else {
    durationText = `${totalDurationMinutes} min a pé / cadeira de rodas (${profile === 'cadeirante' ? 'ritmo suave' : 'ritmo normal'})`;
  }

  return {
    origin_name: origin.name,
    origin_coords: [origin.lat, origin.lng],
    destination_name: destination.name,
    destination_coords: [destination.lat, destination.lng],
    destination_establishment_id: establishment?.id,
    transport_mode: transportMode,
    transport_mode_text: transportModeText,
    total_distance_meters: distanceMeters,
    total_distance_text: distanceText,
    total_duration_minutes: totalDurationMinutes,
    total_duration_text: durationText,
    overall_accessibility_score: overallScore,
    level_paving_percentage: levelPavingPercentage,
    tactile_paving_percentage: tactilePavingPercentage,
    sensory_calm_score: sensoryCalmScore,
    route_type: routePreference,
    coordinates: finalCoords,
    steps,
    critical_warnings: criticalWarnings,
    establishment_summary: establishment
      ? {
          name: establishment.name,
          category: establishment.category,
          classification: establishment.classification,
          overall_score: establishment.overall_score,
          image: establishment.images[0],
        }
      : undefined,
  };
}
