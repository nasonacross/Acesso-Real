import { AccessibilityClassification, AccessibilityFeatures } from './types.js';

export interface ScoreBreakdown {
  physical_score: number;
  intellectual_score: number;
  sensory_score: number;
  visual_score: number;
  auditory_score: number;
  service_score: number;
  overall_score: number;
  classification: AccessibilityClassification;
  severe_barriers_detected: string[];
}

export function calculateAccessibilityScores(
  features: AccessibilityFeatures,
  barriers: string[] = [],
  unverified_items: string[] = []
): ScoreBreakdown {
  // 1. Physical Score (12 items)
  const physicalItems = [
    features.has_ramp,
    features.ramp_adequate_slope,
    features.has_handrails,
    features.wide_doors,
    features.spacious_corridors,
    features.no_obstacles,
    features.accessible_elevator,
    features.adapted_restroom,
    features.accessible_parking,
    features.accessible_counters,
    features.non_slip_regular_floors,
    features.wheelchair_access_all_areas,
  ];
  const physicalCount = physicalItems.filter(Boolean).length;
  let physical_score = Math.round((physicalCount / physicalItems.length) * 100);

  // 2. Intellectual Score (10 items)
  const intellectualItems = [
    features.simple_signage,
    features.plain_language,
    features.clear_ambient_identification,
    features.patient_trained_staff,
    features.visual_guidance,
    features.intuitive_organization,
    features.simplified_instructions,
    features.allows_accompanied_service,
    features.low_confusion_environment,
    features.alternative_communication,
  ];
  const intellectualCount = intellectualItems.filter(Boolean).length;
  let intellectual_score = Math.round((intellectualCount / intellectualItems.length) * 100);

  // 3. Psychosocial & Sensory Score (9 items)
  const sensoryItems = [
    features.low_noise_level,
    features.comfortable_lighting,
    features.quiet_rest_space,
    features.individualized_service,
    features.reduced_visual_stimuli,
    features.respectful_non_discriminatory,
    features.flexible_service,
    features.crowd_level_indicated,
    features.sensory_regulation_room,
  ];
  const sensoryCount = sensoryItems.filter(Boolean).length;
  let sensory_score = Math.round((sensoryCount / sensoryItems.length) * 100);

  // 4. Visual Score (7 items)
  const visualItems = [
    features.tactile_paving,
    features.braille_signage,
    features.high_contrast_info,
    features.legible_signage,
    features.audio_description_available,
    features.sound_signage,
    features.accessible_routes_blind,
  ];
  const visualCount = visualItems.filter(Boolean).length;
  let visual_score = Math.round((visualCount / visualItems.length) * 100);

  // 5. Auditory Score (5 items)
  const auditoryItems = [
    features.libras_service,
    features.visual_info_screens,
    features.call_panels,
    features.luminous_alerts,
    features.text_service,
  ];
  const auditoryCount = auditoryItems.filter(Boolean).length;
  let auditory_score = Math.round((auditoryCount / auditoryItems.length) * 100);

  // 6. Service Quality Score (7 items)
  const serviceItems = [
    features.inclusive_trained_staff,
    features.respects_individual_needs,
    features.priority_service,
    features.accessible_communication_practice,
    features.willingness_to_help,
    features.no_discriminatory_practices,
    features.respects_autonomy,
  ];
  const serviceCount = serviceItems.filter(Boolean).length;
  let service_score = Math.round((serviceCount / serviceItems.length) * 100);

  // Severe barrier checks
  const severe_barriers: string[] = [];
  if (barriers.length > 0) {
    severe_barriers.push(...barriers);
  }
  if (!features.wide_doors && !features.has_ramp) {
    severe_barriers.push('Entrada inacessível para cadeira de rodas ou mobilidade reduzida');
  }
  if (!features.adapted_restroom) {
    severe_barriers.push('Ausência de sanitário adaptado');
  }

  // Calculate raw weighted overall score
  const rawOverall = Math.round(
    (physical_score * 0.25) +
    (intellectual_score * 0.15) +
    (sensory_score * 0.15) +
    (visual_score * 0.15) +
    (auditory_score * 0.15) +
    (service_score * 0.15)
  );

  // Determine classification with barrier-protection rule:
  // "nunca permitir que uma boa pontuação em uma categoria esconda uma barreira grave em outra"
  let classification: AccessibilityClassification;

  const totalUnverified = unverified_items.length;
  if (totalUnverified >= 15) {
    classification = 'Informações insuficientes para avaliação';
  } else {
    // Check lowest category score
    const lowestCategoryScore = Math.min(
      physical_score,
      intellectual_score,
      sensory_score,
      visual_score,
      auditory_score,
      service_score
    );

    if (severe_barriers.length >= 2 || lowestCategoryScore < 35 || rawOverall < 40) {
      classification = 'Acessibilidade insuficiente';
    } else if (severe_barriers.length >= 1 || lowestCategoryScore < 50 || rawOverall < 60) {
      classification = 'Acessibilidade limitada';
    } else if (lowestCategoryScore < 65 || rawOverall < 75) {
      classification = 'Acessibilidade parcial';
    } else {
      classification = 'Acessibilidade bem avaliada';
    }
  }

  return {
    physical_score,
    intellectual_score,
    sensory_score,
    visual_score,
    auditory_score,
    service_score,
    overall_score: rawOverall,
    classification,
    severe_barriers_detected: severe_barriers,
  };
}
