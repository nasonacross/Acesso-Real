export type UserRole = 'visitor' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface PhysicalNeeds {
  wheelchair: boolean;
  crutches: boolean;
  cane: boolean;
  reduced_mobility: boolean;
  stair_difficulty: boolean;
  long_distance_difficulty: boolean;
  needs_ramps_elevators: boolean;
}

export interface IntellectualNeeds {
  intellectual_disability: boolean;
  complex_info_difficulty: boolean;
  spatial_orientation_difficulty: boolean;
  needs_simple_instructions: boolean;
  needs_assistance_tasks: boolean;
  dyslexia?: boolean;
  memory_dementia?: boolean;
  prefers_written_communication?: boolean;
}

export interface SensoryNeeds {
  autism: boolean;
  adhd: boolean;
  down_syndrome: boolean;
  social_interaction_difficulty: boolean;
  noise_sensitivity: boolean;
  light_sensitivity: boolean;
  crowded_spaces_difficulty: boolean;
  needs_quiet_spaces: boolean;
  anxiety_disorder?: boolean;
  panic_disorder?: boolean;
  depression?: boolean;
  bipolar_disorder?: boolean;
  ocd?: boolean;
  ptsd?: boolean;
  tourette?: boolean;
  psychosocial_condition?: boolean;
  smell_sensitivity?: boolean;
}

export interface VisualNeeds {
  blindness: boolean;
  low_vision: boolean;
  reading_difficulty: boolean;
  needs_tactile_audio_signage: boolean;
}

export interface AuditoryNeeds {
  deafness: boolean;
  partial_hearing_loss: boolean;
  needs_libras: boolean;
  needs_visual_information: boolean;
}

export interface OtherNeeds {
  temporary_mobility_issue: boolean;
  needs_priority_service: boolean;
  needs_companion: boolean;
  custom_needs: string;
}

export interface AccompanimentInfo {
  status: 'alone' | 'accompanied' | 'undecided';
  companion_count: number;
  helps_mobility: boolean;
  helps_communication: boolean;
  helps_activities: boolean;
  full_time_escort: boolean;
}

export interface UserProfile {
  user_id: string;
  physical: PhysicalNeeds;
  intellectual: IntellectualNeeds;
  sensory: SensoryNeeds;
  visual: VisualNeeds;
  auditory: AuditoryNeeds;
  other: OtherNeeds;
  accompaniment: AccompanimentInfo;
  updated_at: string;
}

export type EstablishmentCategory = 
  | 'mercado'
  | 'farmacia'
  | 'hospital'
  | 'clinica'
  | 'restaurante'
  | 'loja'
  | 'escola'
  | 'banco'
  | 'reparticao_publica'
  | 'cras'
  | 'creas'
  | 'assistencia_social'
  | 'lazer'
  | 'transporte';

export type ProvenanceType = 
  | 'declarada'
  | 'usuario'
  | 'ia'
  | 'presencial'
  | 'documentada';

export type VerifiedStatus = 
  | 'verificado'
  | 'parcial'
  | 'em_analise'
  | 'pendente';

export type AccessibilityClassification = 
  | 'Acessibilidade bem avaliada'
  | 'Acessibilidade parcial'
  | 'Acessibilidade limitada'
  | 'Acessibilidade insuficiente'
  | 'Informações insuficientes para avaliação';

export interface AccessibilityFeatures {
  has_ramp: boolean;
  ramp_adequate_slope: boolean;
  has_handrails: boolean;
  wide_doors: boolean;
  spacious_corridors: boolean;
  no_obstacles: boolean;
  accessible_elevator: boolean;
  adapted_restroom: boolean;
  accessible_parking: boolean;
  accessible_counters: boolean;
  non_slip_regular_floors: boolean;
  wheelchair_access_all_areas: boolean;

  simple_signage: boolean;
  plain_language: boolean;
  clear_ambient_identification: boolean;
  patient_trained_staff: boolean;
  visual_guidance: boolean;
  intuitive_organization: boolean;
  simplified_instructions: boolean;
  allows_accompanied_service: boolean;
  low_confusion_environment: boolean;
  alternative_communication: boolean;

  low_noise_level: boolean;
  comfortable_lighting: boolean;
  quiet_rest_space: boolean;
  individualized_service: boolean;
  reduced_visual_stimuli: boolean;
  respectful_non_discriminatory: boolean;
  flexible_service: boolean;
  crowd_level_indicated: boolean;
  sensory_regulation_room: boolean;

  tactile_paving: boolean;
  braille_signage: boolean;
  high_contrast_info: boolean;
  legible_signage: boolean;
  audio_description_available: boolean;
  sound_signage: boolean;
  accessible_routes_blind: boolean;

  libras_service: boolean;
  visual_info_screens: boolean;
  call_panels: boolean;
  luminous_alerts: boolean;
  text_service: boolean;

  inclusive_trained_staff: boolean;
  respects_individual_needs: boolean;
  priority_service: boolean;
  accessible_communication_practice: boolean;
  willingness_to_help: boolean;
  no_discriminatory_practices: boolean;
  respects_autonomy: boolean;
}

export interface Establishment {
  id: string;
  name: string;
  category: EstablishmentCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  images: string[];
  provenance: ProvenanceType;
  is_demo: boolean;
  verified_status: VerifiedStatus;
  reliability_score: number;
  last_update: string;
  owner_id: string | null;

  physical_score: number;
  intellectual_score: number;
  sensory_score: number;
  visual_score: number;
  auditory_score: number;
  service_score: number;
  overall_score: number;
  classification: AccessibilityClassification;

  features: AccessibilityFeatures;
  barriers: string[];
  unverified_items: string[];

  // Dynamic fields
  distance_km?: number | null;
  personal_compatibility_score?: number | null;
  reviews?: Review[];
  ai_analyses?: AIAnalysis[];
}

export interface Review {
  id: string;
  establishment_id: string;
  user_id: string;
  user_name: string;
  user_condition_tag: string;
  went_accompanied: boolean;
  rating: number;
  comment: string;
  category_evaluations: {
    physical: number;
    intellectual: number;
    sensory: number;
    visual: number;
    auditory: number;
    service: number;
  };
  barriers_reported: string[];
  images: string[];
  provenance: 'usuario' | 'presencial';
  status: 'aprovada' | 'pendente' | 'rejeitada';
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  establishment_id: string | null;
  image_url: string;
  category_analyzed: 'entrada' | 'rampa' | 'corredor' | 'banheiro' | 'balcao' | 'calcada' | 'sinalizacao' | 'ambiente';
  identified_items: string[];
  potential_barriers: string[];
  affected_audience: string[];
  recommended_improvements: string[];
  confidence_score: number;
  confidence_label: 'Alta confiança' | 'Média confiança' | 'Indício preliminar (requer validação presencial)';
  disclaimer: string;
  status: 'concluido';
  created_at: string;
}

export interface PersonalCompatibilityResult {
  overall_compatibility: number;
  category_compatibility: {
    physical: number | null;
    intellectual: number | null;
    sensory: number | null;
    visual: number | null;
    auditory: number | null;
    service: number;
  };
  individual_autonomy_score: number;
  strengths: string[];
  potential_difficulties: string[];
  unverified_points: string[];
  alone_visit_condition: 'Favorável' | 'Atenção redobrada' | 'Desaconselhada desacompanhada' | 'Informações insuficientes';
  companion_impact_notes: string[];
  helpful_resources: string[];
  aspects_requiring_aid: string[];
  data_reliability: number;
  summary_message: string;
}

export interface VisitSimulationResult {
  establishment_id: string;
  establishment_name: string;
  steps: {
    title: string;
    description: string;
    status: 'adequado' | 'alerta' | 'desconhecido';
    badge: string;
  }[];
  verdict: {
    can_go_alone: boolean;
    companion_recommended: boolean;
    main_reason: string;
    key_phone_questions: string[];
  };
  generated_at: string;
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

export interface AccessibleRouteResult {
  origin_name: string;
  origin_coords: [number, number];
  destination_name: string;
  destination_coords: [number, number];
  destination_establishment_id?: string;
  transport_mode?: 'pe' | 'onibus' | 'carro';
  transport_mode_text?: string;
  total_distance_meters: number;
  total_distance_text: string;
  total_duration_minutes: number;
  total_duration_text: string;
  overall_accessibility_score: number;
  level_paving_percentage: number;
  tactile_paving_percentage: number;
  sensory_calm_score: number;
  route_type: 'nivelada' | 'curta' | 'sensorial';
  coordinates: [number, number][];
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
