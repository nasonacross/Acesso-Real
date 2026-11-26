import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  UserProfile,
  Establishment,
  Review,
  AIAnalysis,
  ReportItem
} from './types.js';
import { calculateAccessibilityScores } from './scoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = fs.existsSync(path.resolve(__dirname, 'data/database.json'))
  ? path.resolve(__dirname, 'data')
  : path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export function createDefaultProfile(userId: string): UserProfile {
  return {
    user_id: userId,
    physical: {
      wheelchair: false,
      crutches: false,
      cane: false,
      reduced_mobility: false,
      stair_difficulty: false,
      long_distance_difficulty: false,
      needs_ramps_elevators: false,
    },
    intellectual: {
      intellectual_disability: false,
      complex_info_difficulty: false,
      spatial_orientation_difficulty: false,
      needs_simple_instructions: false,
      needs_assistance_tasks: false,
      dyslexia: false,
      memory_dementia: false,
      prefers_written_communication: false,
    },
    sensory: {
      autism: false,
      adhd: false,
      down_syndrome: false,
      social_interaction_difficulty: false,
      noise_sensitivity: false,
      light_sensitivity: false,
      crowded_spaces_difficulty: false,
      needs_quiet_spaces: false,
      anxiety_disorder: false,
      panic_disorder: false,
      depression: false,
      bipolar_disorder: false,
      ocd: false,
      ptsd: false,
      tourette: false,
      psychosocial_condition: false,
      smell_sensitivity: false,
    },
    visual: {
      blindness: false,
      low_vision: false,
      reading_difficulty: false,
      needs_tactile_audio_signage: false,
    },
    auditory: {
      deafness: false,
      partial_hearing_loss: false,
      needs_libras: false,
      needs_visual_information: false,
    },
    other: {
      temporary_mobility_issue: false,
      needs_priority_service: false,
      needs_companion: false,
      custom_needs: '',
    },
    accompaniment: {
      status: 'undecided',
      companion_count: 1,
      helps_mobility: false,
      helps_communication: false,
      helps_activities: false,
      full_time_escort: false,
    },
    updated_at: new Date().toISOString(),
  };
}

export function hydrateProfile(userId: string, existing?: Partial<UserProfile> | null): UserProfile {
  const def = createDefaultProfile(userId);
  if (!existing) return def;
  return {
    ...def,
    ...existing,
    user_id: userId,
    physical: { ...def.physical, ...(existing.physical || {}) },
    intellectual: { ...def.intellectual, ...(existing.intellectual || {}) },
    sensory: { ...def.sensory, ...(existing.sensory || {}) },
    visual: { ...def.visual, ...(existing.visual || {}) },
    auditory: { ...def.auditory, ...(existing.auditory || {}) },
    other: { ...def.other, ...(existing.other || {}) },
    accompaniment: { ...def.accompaniment, ...(existing.accompaniment || {}) },
    updated_at: existing.updated_at || def.updated_at,
  };
}

interface Schema {
  users: User[];
  profiles: Record<string, UserProfile>;
  establishments: Establishment[];
  reviews: Review[];
  ai_analyses: AIAnalysis[];
  reports: ReportItem[];
}

class Database {
  private data: Schema = {
    users: [],
    profiles: {},
    establishments: [],
    reviews: [],
    ai_analyses: [],
    reports: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!process.env.VERCEL && !fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (_err) {
        // Ignore in read-only serverless filesystems
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (e) {
        console.error('Erro ao ler database.json, gerando novo seed:', e);
      }
    }

    this.seed();
    this.persist();
  }

  public persist() {
    if (process.env.VERCEL) return;
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Falha ao persistir banco de dados:', err);
    }
  }

  private seed() {
    // 1. Initial Users
    this.data.users = [
      {
        id: 'usr_admin',
        name: 'Administradora AcessoReal',
        email: 'admin@acessoreal.org',
        role: 'admin',
        password_hash: 'admin123',
        created_at: new Date().toISOString(),
      },
      {
        id: 'usr_gestor',
        name: 'Carlos Oliveira (Gestor Comercial)',
        email: 'gestor@supermercadocentral.com.br',
        role: 'owner',
        password_hash: 'gestor123',
        created_at: new Date().toISOString(),
      },
      {
        id: 'usr_visitante',
        name: 'Mariana Silva (Usuária Cadeirante & Ativista)',
        email: 'mariana@exemplo.com.br',
        role: 'visitor',
        password_hash: 'mariana123',
        created_at: new Date().toISOString(),
      },
    ];

    // 2. Default Profile for Mariana
    this.data.profiles['usr_visitante'] = {
      user_id: 'usr_visitante',
      physical: {
        wheelchair: true,
        crutches: false,
        cane: false,
        reduced_mobility: true,
        stair_difficulty: true,
        long_distance_difficulty: true,
        needs_ramps_elevators: true,
      },
      intellectual: {
        intellectual_disability: false,
        complex_info_difficulty: false,
        spatial_orientation_difficulty: false,
        needs_simple_instructions: false,
        needs_assistance_tasks: false,
      },
      sensory: {
        autism: false,
        adhd: false,
        down_syndrome: false,
        social_interaction_difficulty: false,
        noise_sensitivity: true,
        light_sensitivity: false,
        crowded_spaces_difficulty: true,
        needs_quiet_spaces: false,
      },
      visual: {
        blindness: false,
        low_vision: false,
        reading_difficulty: false,
        needs_tactile_audio_signage: false,
      },
      auditory: {
        deafness: false,
        partial_hearing_loss: false,
        needs_libras: false,
        needs_visual_information: false,
      },
      other: {
        temporary_mobility_issue: false,
        needs_priority_service: true,
        needs_companion: false,
        custom_needs: 'Necessidade de rampa sem desnível na calçada',
      },
      accompaniment: {
        status: 'alone',
        companion_count: 0,
        helps_mobility: false,
        helps_communication: false,
        helps_activities: false,
        full_time_escort: false,
      },
      updated_at: new Date().toISOString(),
    };

    // 3. Establishments Seed with Brazilian public and private hubs
    const rawEstablishments = [
      {
        id: 'est_cras_esperanca',
        name: 'CRAS Esperança — Centro de Referência de Assistência Social',
        category: 'cras' as const,
        description: 'Unidade pública estatal descentralizada da política de assistência social, com atendimento a famílias em situação de vulnerabilidade e cadastro único.',
        address: 'Rua das Flores, 450, Bairro Esperança',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01310-000',
        lat: -23.55052,
        lng: -46.633308,
        phone: '(11) 3244-8800',
        website: 'https://social.sp.gov.br/cras',
        images: ['/images/establishments/est_cras_esperanca_sat.jpg'],
        provenance: 'presencial' as const,
        is_demo: false,
        verified_status: 'verificado' as const,
        reliability_score: 95,
        last_update: '2026-10-15',
        owner_id: null,
        features: {
          has_ramp: true,
          ramp_adequate_slope: true,
          has_handrails: true,
          wide_doors: true,
          spacious_corridors: true,
          no_obstacles: true,
          accessible_elevator: false, // térreo
          adapted_restroom: true,
          accessible_parking: true,
          accessible_counters: true,
          non_slip_regular_floors: true,
          wheelchair_access_all_areas: true,

          simple_signage: true,
          plain_language: true,
          clear_ambient_identification: true,
          patient_trained_staff: true,
          visual_guidance: true,
          intuitive_organization: true,
          simplified_instructions: true,
          allows_accompanied_service: true,
          low_confusion_environment: true,
          alternative_communication: true,

          low_noise_level: true,
          comfortable_lighting: true,
          quiet_rest_space: true,
          individualized_service: true,
          reduced_visual_stimuli: true,
          respectful_non_discriminatory: true,
          flexible_service: true,
          crowd_level_indicated: true,
          sensory_regulation_room: true,

          tactile_paving: true,
          braille_signage: true,
          high_contrast_info: true,
          legible_signage: true,
          audio_description_available: false,
          sound_signage: true,
          accessible_routes_blind: true,

          libras_service: true,
          visual_info_screens: true,
          call_panels: true,
          luminous_alerts: false,
          text_service: true,

          inclusive_trained_staff: true,
          respects_individual_needs: true,
          priority_service: true,
          accessible_communication_practice: true,
          willingness_to_help: true,
          no_discriminatory_practices: true,
          respects_autonomy: true,
        },
        barriers: [],
        unverified_items: ['Alerta luminoso de incêndio'],
      },
      {
        id: 'est_supermercado_central',
        name: 'Supermercado Central & Galeria',
        category: 'mercado' as const,
        description: 'Supermercado de médio porte com padaria, açougue, caixas de autoatendimento e caixas convencionais preferenciais.',
        address: 'Av. Paulista, 1200, Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01311-200',
        lat: -23.561414,
        lng: -46.655881,
        phone: '(11) 3388-1000',
        website: 'https://supermercadocentral.com.br',
        images: ['/images/establishments/est_supermercado_central_sat.jpg'],
        provenance: 'usuario' as const,
        is_demo: false,
        verified_status: 'parcial' as const,
        reliability_score: 75,
        last_update: '2026-11-01',
        owner_id: 'usr_gestor',
        features: {
          has_ramp: true,
          ramp_adequate_slope: true,
          has_handrails: true,
          wide_doors: true,
          spacious_corridors: true,
          no_obstacles: false, // pallets e caixas ocasionais
          accessible_elevator: true,
          adapted_restroom: true,
          accessible_parking: true,
          accessible_counters: true,
          non_slip_regular_floors: true,
          wheelchair_access_all_areas: true,

          simple_signage: true,
          plain_language: false,
          clear_ambient_identification: true,
          patient_trained_staff: true,
          visual_guidance: true,
          intuitive_organization: false,
          simplified_instructions: false,
          allows_accompanied_service: true,
          low_confusion_environment: false,
          alternative_communication: false,

          low_noise_level: false, // Som alto e barulho constante
          comfortable_lighting: false, // Luz fluorescente muito intensa
          quiet_rest_space: false,
          individualized_service: false,
          reduced_visual_stimuli: false, // Excesso de banners e cores
          respectful_non_discriminatory: true,
          flexible_service: true,
          crowd_level_indicated: true,
          sensory_regulation_room: false,

          tactile_paving: false,
          braille_signage: false,
          high_contrast_info: true,
          legible_signage: true,
          audio_description_available: false,
          sound_signage: false,
          accessible_routes_blind: false,

          libras_service: false,
          visual_info_screens: true,
          call_panels: true,
          luminous_alerts: false,
          text_service: true,

          inclusive_trained_staff: true,
          respects_individual_needs: true,
          priority_service: true,
          accessible_communication_practice: false,
          willingness_to_help: true,
          no_discriminatory_practices: true,
          respects_autonomy: true,
        },
        barriers: [
          'Nível sonoro elevado e música ambiente contínua (desafiador para pessoas com hipersensibilidade auditiva ou TEA)',
          'Ausência de piso tátil nos corredores principais',
        ],
        unverified_items: ['Disponibilidade de carrinho motorizado ou adaptado para cadeirantes'],
      },
      {
        id: 'est_hospital_geral_inclusivo',
        name: 'Hospital Geral Regional Inclusivo Dr. Arnaldo',
        category: 'hospital' as const,
        description: 'Complexo hospitalar com pronto-socorro 24h, ambulatório de especialidades, centro cirúrgico e equipe multidisciplinar de acolhimento.',
        address: 'Rua Dr. Ovídio Pires de Campos, 225',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '05403-010',
        lat: -23.55589,
        lng: -46.67115,
        phone: '(11) 2661-0000',
        website: 'https://hospitalregional.sp.gov.br',
        images: ['/images/establishments/hospital_clinicas_facade.jpg', '/images/establishments/est_hospital_geral_inclusivo_sat.jpg'],
        provenance: 'documentada' as const,
        is_demo: false,
        verified_status: 'verificado' as const,
        reliability_score: 92,
        last_update: '2026-11-10',
        owner_id: null,
        features: {
          has_ramp: true,
          ramp_adequate_slope: true,
          has_handrails: true,
          wide_doors: true,
          spacious_corridors: true,
          no_obstacles: true,
          accessible_elevator: true,
          adapted_restroom: true,
          accessible_parking: true,
          accessible_counters: true,
          non_slip_regular_floors: true,
          wheelchair_access_all_areas: true,

          simple_signage: true,
          plain_language: true,
          clear_ambient_identification: true,
          patient_trained_staff: true,
          visual_guidance: true,
          intuitive_organization: true,
          simplified_instructions: true,
          allows_accompanied_service: true,
          low_confusion_environment: true,
          alternative_communication: true,

          low_noise_level: true,
          comfortable_lighting: true,
          quiet_rest_space: true,
          individualized_service: true,
          reduced_visual_stimuli: true,
          respectful_non_discriminatory: true,
          flexible_service: true,
          crowd_level_indicated: true,
          sensory_regulation_room: true,

          tactile_paving: true,
          braille_signage: true,
          high_contrast_info: true,
          legible_signage: true,
          audio_description_available: true,
          sound_signage: true,
          accessible_routes_blind: true,

          libras_service: true,
          visual_info_screens: true,
          call_panels: true,
          luminous_alerts: true,
          text_service: true,

          inclusive_trained_staff: true,
          respects_individual_needs: true,
          priority_service: true,
          accessible_communication_practice: true,
          willingness_to_help: true,
          no_discriminatory_practices: true,
          respects_autonomy: true,
        },
        barriers: [],
        unverified_items: [],
      },
      {
        id: 'est_farmacia_popular',
        name: 'Farmácia Popular Saúde Já',
        category: 'farmacia' as const,
        description: 'Dispensação de medicamentos do programa Farmácia Popular, produtos de higiene e cuidados médicos de rotina.',
        address: 'Rua Augusta, 950, Consolação',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01304-001',
        lat: -23.55392,
        lng: -46.65345,
        phone: '(11) 3120-4550',
        website: 'https://farmaciasaudeja.com.br',
        images: ['/images/establishments/est_farmacia_popular_sat.jpg'],
        provenance: 'ia' as const,
        is_demo: false,
        verified_status: 'parcial' as const,
        reliability_score: 70,
        last_update: '2026-10-28',
        owner_id: null,
        features: {
          has_ramp: false, // Possui degrau de 12cm na entrada!
          ramp_adequate_slope: false,
          has_handrails: false,
          wide_doors: true,
          spacious_corridors: false, // Prateleiras muito próximas
          no_obstacles: false,
          accessible_elevator: false,
          adapted_restroom: false,
          accessible_parking: false,
          accessible_counters: false,
          non_slip_regular_floors: true,
          wheelchair_access_all_areas: false,

          simple_signage: true,
          plain_language: true,
          clear_ambient_identification: true,
          patient_trained_staff: true,
          visual_guidance: true,
          intuitive_organization: true,
          simplified_instructions: false,
          allows_accompanied_service: true,
          low_confusion_environment: true,
          alternative_communication: false,

          low_noise_level: true,
          comfortable_lighting: true,
          quiet_rest_space: false,
          individualized_service: true,
          reduced_visual_stimuli: true,
          respectful_non_discriminatory: true,
          flexible_service: true,
          crowd_level_indicated: false,
          sensory_regulation_room: false,

          tactile_paving: false,
          braille_signage: false,
          high_contrast_info: true,
          legible_signage: true,
          audio_description_available: false,
          sound_signage: false,
          accessible_routes_blind: false,

          libras_service: false,
          visual_info_screens: false,
          call_panels: false,
          luminous_alerts: false,
          text_service: true,

          inclusive_trained_staff: true,
          respects_individual_needs: true,
          priority_service: true,
          accessible_communication_practice: true,
          willingness_to_help: true,
          no_discriminatory_practices: true,
          respects_autonomy: true,
        },
        barriers: [
          'Degrau de 12cm sem rampa na entrada principal (impede acesso independente de cadeirantes)',
          'Corredores internos com menos de 80cm entre gôndolas',
          'Não possui sanitário para clientes',
        ],
        unverified_items: ['Campainha externa para solicitação de auxílio'],
      },
      {
        id: 'est_restaurante_cidadao',
        name: 'Restaurante Cidadão Sabor & Inclusão',
        category: 'restaurante' as const,
        description: 'Restaurante com buffet por quilo e à la carte, mesas adaptadas com recuo para cadeiras de rodas e cardápio em Braille e QR code sonoro.',
        address: 'Rua Vergueiro, 1500, Vila Mariana',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '04101-000',
        lat: -23.57564,
        lng: -46.64023,
        phone: '(11) 5084-2211',
        website: 'https://restaurantesaboreinclusao.com.br',
        images: ['/images/establishments/est_restaurante_cidadao_sat.jpg'],
        provenance: 'declarada' as const,
        is_demo: false,
        verified_status: 'verificado' as const,
        reliability_score: 88,
        last_update: '2026-11-05',
        owner_id: null,
        features: {
          has_ramp: true,
          ramp_adequate_slope: true,
          has_handrails: true,
          wide_doors: true,
          spacious_corridors: true,
          no_obstacles: true,
          accessible_elevator: false, // plano térreo
          adapted_restroom: true,
          accessible_parking: true,
          accessible_counters: true,
          non_slip_regular_floors: true,
          wheelchair_access_all_areas: true,

          simple_signage: true,
          plain_language: true,
          clear_ambient_identification: true,
          patient_trained_staff: true,
          visual_guidance: true,
          intuitive_organization: true,
          simplified_instructions: true,
          allows_accompanied_service: true,
          low_confusion_environment: true,
          alternative_communication: true,

          low_noise_level: true, // área tranquila reservada
          comfortable_lighting: true,
          quiet_rest_space: true,
          individualized_service: true,
          reduced_visual_stimuli: true,
          respectful_non_discriminatory: true,
          flexible_service: true,
          crowd_level_indicated: true,
          sensory_regulation_room: false,

          tactile_paving: true,
          braille_signage: true,
          high_contrast_info: true,
          legible_signage: true,
          audio_description_available: true,
          sound_signage: false,
          accessible_routes_blind: true,

          libras_service: true,
          visual_info_screens: true,
          call_panels: false,
          luminous_alerts: false,
          text_service: true,

          inclusive_trained_staff: true,
          respects_individual_needs: true,
          priority_service: true,
          accessible_communication_practice: true,
          willingness_to_help: true,
          no_discriminatory_practices: true,
          respects_autonomy: true,
        },
        barriers: [],
        unverified_items: ['Alarme de emergência com flash luminoso no sanitário'],
      },
      {
        id: 'est_creas_central',
        name: 'CREAS Central — Proteção e Atendimento Especializado a Famílias',
        category: 'creas' as const,
        description: 'Unidade pública estatal que oferece apoio, orientação e acompanhamento a indivíduos e famílias em situação de ameaça ou violação de direitos.',
        address: 'Rua São Bento, 380, Centro Histórico',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01010-001',
        lat: -23.54751,
        lng: -46.63412,
        phone: '(11) 3105-9922',
        website: 'https://social.sp.gov.br/creas',
        images: ['/images/establishments/est_creas_central_sat.jpg'],
        provenance: 'presencial' as const,
        is_demo: false,
        verified_status: 'verificado' as const,
        reliability_score: 94,
        last_update: '2026-10-20',
        owner_id: null,
        features: {
          has_ramp: true,
          ramp_adequate_slope: true,
          has_handrails: true,
          wide_doors: true,
          spacious_corridors: true,
          no_obstacles: true,
          accessible_elevator: true,
          adapted_restroom: true,
          accessible_parking: true,
          accessible_counters: true,
          non_slip_regular_floors: true,
          wheelchair_access_all_areas: true,

          simple_signage: true,
          plain_language: true,
          clear_ambient_identification: true,
          patient_trained_staff: true,
          visual_guidance: true,
          intuitive_organization: true,
          simplified_instructions: true,
          allows_accompanied_service: true,
          low_confusion_environment: true,
          alternative_communication: true,

          low_noise_level: true,
          comfortable_lighting: true,
          quiet_rest_space: true,
          individualized_service: true,
          reduced_visual_stimuli: true,
          respectful_non_discriminatory: true,
          flexible_service: true,
          crowd_level_indicated: true,
          sensory_regulation_room: true,

          tactile_paving: true,
          braille_signage: true,
          high_contrast_info: true,
          legible_signage: true,
          audio_description_available: false,
          sound_signage: true,
          accessible_routes_blind: true,

          libras_service: true,
          visual_info_screens: true,
          call_panels: true,
          luminous_alerts: true,
          text_service: true,

          inclusive_trained_staff: true,
          respects_individual_needs: true,
          priority_service: true,
          accessible_communication_practice: true,
          willingness_to_help: true,
          no_discriminatory_practices: true,
          respects_autonomy: true,
        },
        barriers: [],
        unverified_items: [],
      },
      {
        id: 'est_biblioteca_monteiro_lobato',
        name: 'Biblioteca Pública Infantojuvenil Monteiro Lobato',
        category: 'escola' as const,
        description: 'Espaço cultural com acervo Braille, audiolivros, computadores com leitor de tela (NVDA/JAWS), contação de histórias em Libras e sala de regulação sensorial.',
        address: 'Rua General Jardim, 485, Vila Buarque',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01223-011',
        lat: -23.54421,
        lng: -46.65089,
        phone: '(11) 3256-4122',
        website: 'https://bibliotecas.sp.gov.br/monteiro-lobato',
        images: ['/images/establishments/est_biblioteca_monteiro_lobato.jpg', '/images/establishments/est_biblioteca_monteiro_lobato_sat.jpg'],
        provenance: 'presencial' as const,
        is_demo: false,
        verified_status: 'verificado' as const,
        reliability_score: 96,
        last_update: '2026-11-12',
        owner_id: null,
        features: {
          has_ramp: true,
          ramp_adequate_slope: true,
          has_handrails: true,
          wide_doors: true,
          spacious_corridors: true,
          no_obstacles: true,
          accessible_elevator: true,
          adapted_restroom: true,
          accessible_parking: true,
          accessible_counters: true,
          non_slip_regular_floors: true,
          wheelchair_access_all_areas: true,

          simple_signage: true,
          plain_language: true,
          clear_ambient_identification: true,
          patient_trained_staff: true,
          visual_guidance: true,
          intuitive_organization: true,
          simplified_instructions: true,
          allows_accompanied_service: true,
          low_confusion_environment: true,
          alternative_communication: true,

          low_noise_level: true,
          comfortable_lighting: true,
          quiet_rest_space: true,
          individualized_service: true,
          reduced_visual_stimuli: true,
          respectful_non_discriminatory: true,
          flexible_service: true,
          crowd_level_indicated: true,
          sensory_regulation_room: true,

          tactile_paving: true,
          braille_signage: true,
          high_contrast_info: true,
          legible_signage: true,
          audio_description_available: true,
          sound_signage: true,
          accessible_routes_blind: true,

          libras_service: true,
          visual_info_screens: true,
          call_panels: true,
          luminous_alerts: true,
          text_service: true,

          inclusive_trained_staff: true,
          respects_individual_needs: true,
          priority_service: true,
          accessible_communication_practice: true,
          willingness_to_help: true,
          no_discriminatory_practices: true,
          respects_autonomy: true,
        },
        barriers: [],
        unverified_items: [],
      },
      {
        id: 'est_terminal_acessivel',
        name: 'Terminal Urbano de Ônibus & Metrô Central',
        category: 'transporte' as const,
        description: 'Ponto intermodal de transporte coletivo com elevadores panorâmicos, piso tátil podotátil integrado e equipe de apoio para embarque.',
        address: 'Praça da Sé, s/n, Centro',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01001-000',
        lat: -23.55030,
        lng: -46.63390,
        phone: '(11) 3111-2000',
        website: 'https://sptrans.com.br',
        images: ['/images/establishments/terminal_se_facade.jpg', '/images/establishments/est_terminal_acessivel_sat.jpg'],
        provenance: 'documentada' as const,
        is_demo: false,
        verified_status: 'parcial' as const,
        reliability_score: 82,
        last_update: '2026-11-14',
        owner_id: null,
        features: {
          has_ramp: true,
          ramp_adequate_slope: true,
          has_handrails: true,
          wide_doors: true,
          spacious_corridors: true,
          no_obstacles: true,
          accessible_elevator: true,
          adapted_restroom: true,
          accessible_parking: false,
          accessible_counters: true,
          non_slip_regular_floors: true,
          wheelchair_access_all_areas: true,

          simple_signage: true,
          plain_language: true,
          clear_ambient_identification: true,
          patient_trained_staff: true,
          visual_guidance: true,
          intuitive_organization: false, // Estrutura grande e movimentada
          simplified_instructions: true,
          allows_accompanied_service: true,
          low_confusion_environment: false,
          alternative_communication: true,

          low_noise_level: false, // Muito barulho nos horários de pico
          comfortable_lighting: true,
          quiet_rest_space: false,
          individualized_service: true,
          reduced_visual_stimuli: false,
          respectful_non_discriminatory: true,
          flexible_service: false,
          crowd_level_indicated: true,
          sensory_regulation_room: false,

          tactile_paving: true,
          braille_signage: true,
          high_contrast_info: true,
          legible_signage: true,
          audio_description_available: false,
          sound_signage: true,
          accessible_routes_blind: true,

          libras_service: true,
          visual_info_screens: true,
          call_panels: true,
          luminous_alerts: true,
          text_service: true,

          inclusive_trained_staff: true,
          respects_individual_needs: true,
          priority_service: true,
          accessible_communication_practice: true,
          willingness_to_help: true,
          no_discriminatory_practices: true,
          respects_autonomy: true,
        },
        barriers: [
          'Alto fluxo de pedestres e ruído sonoro intenso das 17h às 19h',
          'Elevador de acesso à plataforma Leste em manutenção periódica',
        ],
        unverified_items: ['Tempo de espera médio para auxílio de embarque'],
      },
    ];

    // Calculate score breakdowns and classifications
    this.data.establishments = rawEstablishments.map((est) => {
      const scores = calculateAccessibilityScores(
        est.features,
        est.barriers,
        est.unverified_items
      );
      return {
        ...est,
        physical_score: scores.physical_score,
        intellectual_score: scores.intellectual_score,
        sensory_score: scores.sensory_score,
        visual_score: scores.visual_score,
        auditory_score: scores.auditory_score,
        service_score: scores.service_score,
        overall_score: scores.overall_score,
        classification: scores.classification,
      };
    });

    // 4. Initial Collaborative Reviews
    this.data.reviews = [
      {
        id: 'rev_1',
        establishment_id: 'est_supermercado_central',
        user_id: 'usr_visitante',
        user_name: 'Mariana Silva',
        user_condition_tag: 'Usuária de Cadeira de Rodas',
        went_accompanied: false,
        rating: 4,
        comment: 'Consegui entrar sozinha tranquilamente pela rampa principal da Paulista. O caixa prioritário funciona bem, mas os corredores de bebidas às vezes ficam com caixas de papelão no chão.',
        category_evaluations: {
          physical: 85,
          intellectual: 70,
          sensory: 50,
          visual: 60,
          auditory: 80,
          service: 90,
        },
        barriers_reported: [
          'Caixas temporárias de reposição obstruindo trecho do corredor 4',
        ],
        images: ['/images/establishments/est_supermercado_central_sat.jpg'],
        provenance: 'presencial',
        status: 'aprovada',
        created_at: '2026-11-10T14:30:00Z',
      },
      {
        id: 'rev_2',
        establishment_id: 'est_cras_esperanca',
        user_id: 'usr_visitante',
        user_name: 'Mariana Silva',
        user_condition_tag: 'Usuária de Cadeira de Rodas',
        went_accompanied: true,
        rating: 5,
        comment: 'Equipe do CRAS extremamente empática e atenciosa! Rampa suave, banheiro espaçoso com barras firmes e atendimento sem qualquer preconceito.',
        category_evaluations: {
          physical: 95,
          intellectual: 90,
          sensory: 85,
          visual: 90,
          auditory: 90,
          service: 100,
        },
        barriers_reported: [],
        images: [],
        provenance: 'presencial',
        status: 'aprovada',
        created_at: '2026-11-12T10:15:00Z',
      },
    ];

    // 5. Initial AI Analyses Seed
    this.data.ai_analyses = [
      {
        id: 'ai_seed_1',
        establishment_id: 'est_supermercado_central',
        image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
        category_analyzed: 'entrada',
        identified_items: [
          'Rampa de acesso frontal com piso antiderrapante',
          'Portas automáticas de correr de vidro temperado',
          'Luminária de teto uniforme',
        ],
        potential_barriers: [
          'Fita de contraste visual na porta de vidro parece ausente ou de baixo contraste',
          'Guia lateral de proteção da rampa de baixa altura',
        ],
        affected_audience: [
          'Pessoas com baixa visão',
          'Usuários de cadeira de rodas motorizada',
        ],
        recommended_improvements: [
          'Aplicar faixa fotoluminescente ou adesivo de alto contraste na porta de vidro',
          'Instalar guia de balizamento de 5cm na lateral da rampa',
        ],
        confidence_score: 86,
        confidence_label: 'Alta confiança',
        disclaimer: 'Esta análise é baseada em visão computacional e inteligência artificial e representa INDÍCIOS VISUAIS preliminares. Não constitui laudo técnico ou certificação da NBR 9050.',
        status: 'concluido',
        created_at: '2026-11-15T09:20:00Z',
      },
    ];

    // 6. Reports Seed
    this.data.reports = [];
  }

  // --- USERS ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  // --- PROFILES ---
  public getProfile(userId: string): UserProfile {
    if (!this.data.profiles[userId]) {
      // Default empty profile
      this.data.profiles[userId] = {
        user_id: userId,
        physical: {
          wheelchair: false,
          crutches: false,
          cane: false,
          reduced_mobility: false,
          stair_difficulty: false,
          long_distance_difficulty: false,
          needs_ramps_elevators: false,
        },
        intellectual: {
          intellectual_disability: false,
          complex_info_difficulty: false,
          spatial_orientation_difficulty: false,
          needs_simple_instructions: false,
          needs_assistance_tasks: false,
        },
        sensory: {
          autism: false,
          adhd: false,
          down_syndrome: false,
          social_interaction_difficulty: false,
          noise_sensitivity: false,
          light_sensitivity: false,
          crowded_spaces_difficulty: false,
          needs_quiet_spaces: false,
        },
        visual: {
          blindness: false,
          low_vision: false,
          reading_difficulty: false,
          needs_tactile_audio_signage: false,
        },
        auditory: {
          deafness: false,
          partial_hearing_loss: false,
          needs_libras: false,
          needs_visual_information: false,
        },
        other: {
          temporary_mobility_issue: false,
          needs_priority_service: false,
          needs_companion: false,
          custom_needs: '',
        },
        accompaniment: {
          status: 'undecided',
          companion_count: 0,
          helps_mobility: false,
          helps_communication: false,
          helps_activities: false,
          full_time_escort: false,
        },
        updated_at: new Date().toISOString(),
      };
      this.persist();
    }
    return this.data.profiles[userId];
  }

  public saveProfile(profile: UserProfile): UserProfile {
    profile.updated_at = new Date().toISOString();
    this.data.profiles[profile.user_id] = profile;
    this.persist();
    return profile;
  }

  // --- ESTABLISHMENTS ---
  public getAllEstablishments(): Establishment[] {
    return this.data.establishments;
  }

  public getEstablishmentById(id: string): Establishment | undefined {
    return this.data.establishments.find((e) => e.id === id);
  }

  public createEstablishment(est: Establishment): Establishment {
    const scores = calculateAccessibilityScores(
      est.features,
      est.barriers,
      est.unverified_items
    );
    const enriched: Establishment = {
      ...est,
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
    this.data.establishments.push(enriched);
    this.persist();
    return enriched;
  }

  public updateEstablishment(id: string, updates: Partial<Establishment>): Establishment | null {
    const index = this.data.establishments.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const current = this.data.establishments[index];
    const mergedFeatures = updates.features ? { ...current.features, ...updates.features } : current.features;
    const mergedBarriers = updates.barriers ?? current.barriers;
    const mergedUnverified = updates.unverified_items ?? current.unverified_items;

    const scores = calculateAccessibilityScores(mergedFeatures, mergedBarriers, mergedUnverified);

    const updated: Establishment = {
      ...current,
      ...updates,
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

    this.data.establishments[index] = updated;
    this.persist();
    return updated;
  }

  public deleteEstablishment(id: string): boolean {
    const index = this.data.establishments.findIndex((e) => e.id === id);
    if (index === -1) return false;
    this.data.establishments.splice(index, 1);
    this.persist();
    return true;
  }

  // --- REVIEWS ---
  public getReviewsByEstablishment(establishmentId: string): Review[] {
    return this.data.reviews.filter(
      (r) => r.establishment_id === establishmentId && r.status === 'aprovada'
    );
  }

  public getAllReviews(): Review[] {
    return this.data.reviews;
  }

  public addReview(review: Review): Review {
    this.data.reviews.unshift(review);
    this.persist();
    return review;
  }

  public updateReviewStatus(id: string, status: Review['status']): boolean {
    const rev = this.data.reviews.find((r) => r.id === id);
    if (!rev) return false;
    rev.status = status;
    this.persist();
    return true;
  }

  // --- AI ANALYSES ---
  public addAIAnalysis(analysis: AIAnalysis): AIAnalysis {
    this.data.ai_analyses.unshift(analysis);
    this.persist();
    return analysis;
  }

  public getAIAnalyses(establishmentId?: string): AIAnalysis[] {
    if (establishmentId) {
      return this.data.ai_analyses.filter((a) => a.establishment_id === establishmentId);
    }
    return this.data.ai_analyses;
  }

  // --- REPORTS ---
  public addReport(report: ReportItem): ReportItem {
    this.data.reports.unshift(report);
    this.persist();
    return report;
  }

  public getReports(): ReportItem[] {
    return this.data.reports;
  }

  public updateReportStatus(id: string, status: ReportItem['status']): boolean {
    const rep = this.data.reports.find((r) => r.id === id);
    if (!rep) return false;
    rep.status = status;
    this.persist();
    return true;
  }
}

export const db = new Database();
