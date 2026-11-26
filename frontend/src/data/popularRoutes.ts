export interface PopularRoutePreset {
  id: string;
  city: 'Tupã';
  title: string;
  category: string;
  badge: string;
  transportMode: 'pe' | 'onibus' | 'carro';
  originName: string;
  originCoords: [number, number];
  destEstablishmentId: string;
  destName: string;
  destCoords: [number, number];
  highlights: string[];
}

export const POPULAR_ROUTES: PopularRoutePreset[] = [
  {
    id: 'tupa_fadap_sec_assistencia',
    city: 'Tupã',
    title: 'FADAP ➔ Secretaria de Assistência Social',
    category: 'Assistência Social',
    badge: '350 m • Centro',
    transportMode: 'pe',
    originName: 'Faculdade FADAP / FAP (Rua Mandaguaris, 1010)',
    originCoords: [-21.94148, -50.51442],
    destEstablishmentId: 'est_sec_assistencia_tupa',
    destName: 'Secretaria Municipal de Assistência Social — Tupã',
    destCoords: [-21.93874, -50.51572],
    highlights: ['Trajeto curto no Centro', 'Calçadas largas na Rua Mandaguaris e Paiaquás', 'Entrada nivelada'],
  },
  {
    id: 'tupa_fadap_poupatempo',
    city: 'Tupã',
    title: 'FADAP ➔ Poupatempo Tupã',
    category: 'Serviços Públicos',
    badge: '550 m • Nivelada',
    transportMode: 'pe',
    originName: 'Faculdade FADAP / FAP (Rua Mandaguaris, 1010)',
    originCoords: [-21.94148, -50.51442],
    destEstablishmentId: 'est_poupatempo_tupa',
    destName: 'Poupatempo Tupã — Central do Cidadão',
    destCoords: [-21.93681, -50.51623],
    highlights: ['Travessias rebaixadas até a Av. Tabajaras', 'Piso tátil direcional', 'Recepção 100% acessível'],
  },
  {
    id: 'tupa_fadap_cras2',
    city: 'Tupã',
    title: 'FADAP ➔ CRAS II Sul (Natalino Rodrigues)',
    category: 'Assistência Social (CRAS)',
    badge: '500 m • Zona Sul',
    transportMode: 'pe',
    originName: 'Faculdade FADAP / FAP (Rua Mandaguaris, 1010)',
    originCoords: [-21.94148, -50.51442],
    destEstablishmentId: 'est_cras2_tupa',
    destName: 'CRAS II Sul — Unidade "Natalino Rodrigues" (Tupã)',
    destCoords: [-21.94559, -50.51524],
    highlights: ['Percurso direto pela Zona Sul', 'Guias rebaixadas nas esquinas', 'Atendimento PAIF e CadÚnico'],
  },
  {
    id: 'tupa_fadap_creas',
    city: 'Tupã',
    title: 'FADAP ➔ CREAS Tupã',
    category: 'Proteção Social Especial',
    badge: '1,4 km • Ônibus/Carro',
    transportMode: 'carro',
    originName: 'Faculdade FADAP / FAP (Rua Mandaguaris, 1010)',
    originCoords: [-21.94148, -50.51442],
    destEstablishmentId: 'est_creas_tupa',
    destName: 'CREAS Tupã — Proteção Social Especial',
    destCoords: [-21.92927, -50.51431],
    highlights: ['Acesso rápido pela Rua Iporans', 'Vaga PCD na porta', 'Sala de acolhimento acessível'],
  },
  {
    id: 'tupa_fadap_apae',
    city: 'Tupã',
    title: 'FADAP ➔ APAE de Tupã',
    category: 'Inclusão & Reabilitação',
    badge: '1,6 km • Inclusiva',
    transportMode: 'carro',
    originName: 'Faculdade FADAP / FAP (Rua Mandaguaris, 1010)',
    originCoords: [-21.94148, -50.51442],
    destEstablishmentId: 'est_apae_tupa',
    destName: 'APAE de Tupã — Centro de Reabilitação e Inclusão',
    destCoords: [-21.92850, -50.50950],
    highlights: ['Trajeto até a Av. Arthur Fernandes', 'Estacionamento reservado PCD', 'Referência em acessibilidade'],
  },
  {
    id: 'tupa_fadap_santacasa',
    city: 'Tupã',
    title: 'FADAP ➔ Santa Casa de Tupã',
    category: 'Saúde & Hospital',
    badge: '2,0 km • Saúde',
    transportMode: 'onibus',
    originName: 'Faculdade FADAP / FAP (Rua Mandaguaris, 1010)',
    originCoords: [-21.94148, -50.51442],
    destEstablishmentId: 'est_santacasa_tupa',
    destName: 'Santa Casa de Misericórdia de Tupã',
    destCoords: [-21.92391, -50.51805],
    highlights: ['Linha urbana com elevador', 'Acesso nivelado ao Pronto-Socorro', 'Rampa com corrimãos duplos'],
  },
  {
    id: 'tupa_fadap_cras1',
    city: 'Tupã',
    title: 'FADAP ➔ CRAS I Leste (Parque Kennedy)',
    category: 'Assistência Social (CRAS)',
    badge: '2,3 km • Zona Leste',
    transportMode: 'onibus',
    originName: 'Faculdade FADAP / FAP (Rua Mandaguaris, 1010)',
    originCoords: [-21.94148, -50.51442],
    destEstablishmentId: 'est_cras1_tupa',
    destName: 'CRAS I Leste — Parque Kennedy (Tupã)',
    destCoords: [-21.93410, -50.49458],
    highlights: ['Transporte coletivo adaptado', 'Atendimento familiar acessível', 'Entrada sem degraus'],
  },
  {
    id: 'tupa_fadap_praca_bandeira',
    city: 'Tupã',
    title: 'FADAP ➔ Praça da Bandeira (Centro)',
    category: 'Lazer & Centro',
    badge: '800 m • A Pé',
    transportMode: 'pe',
    originName: 'Faculdade FADAP / FAP (Rua Mandaguaris, 1010)',
    originCoords: [-21.94148, -50.51442],
    destEstablishmentId: 'est_praca_bandeira_tupa',
    destName: 'Praça da Bandeira — Centro de Tupã',
    destCoords: [-21.93437, -50.51327],
    highlights: ['Calçadas centrais acessíveis', 'Bancos de descanso sombreados', 'Travessias sinalizadas'],
  },
];
