import {
  Establishment,
  UserProfile,
  PersonalCompatibilityResult,
  VisitSimulationResult
} from './types.js';

export function calculatePersonalCompatibility(
  profile: UserProfile,
  est: Establishment
): PersonalCompatibilityResult {
  const f = est.features;
  const p = profile.physical;
  const i = profile.intellectual;
  const s = profile.sensory;
  const v = profile.visual;
  const a = profile.auditory;
  const acc = profile.accompaniment;

  const strengths: string[] = [];
  const potential_difficulties: string[] = [];
  const unverified_points: string[] = [...(est.unverified_items || [])];
  const companion_impact_notes: string[] = [];
  const helpful_resources: string[] = [];
  const aspects_requiring_aid: string[] = [];

  // 1. PHYSICAL EVALUATION
  let physicalScore: number | null = null;
  const physicalSelected = p.wheelchair || p.crutches || p.cane || p.reduced_mobility || 
                           p.stair_difficulty || p.long_distance_difficulty || p.needs_ramps_elevators;

  if (physicalSelected) {
    let physPoints = 0;
    let physTotal = 0;

    if (p.wheelchair || p.needs_ramps_elevators || p.stair_difficulty) {
      physTotal += 3;
      if (f.has_ramp && f.ramp_adequate_slope) {
        physPoints += 3;
        strengths.push('Rampa de acesso suave e em conformidade para cadeira de rodas');
      } else if (f.has_ramp) {
        physPoints += 1.5;
        potential_difficulties.push('Possui rampa, porém a inclinação pode ser íngreme sem auxílio');
      } else {
        potential_difficulties.push('Ausência aparente de rampa de acesso na entrada');
      }

      physTotal += 2;
      if (f.wide_doors) {
        physPoints += 2;
        strengths.push('Portas com largura ampla para passagem de cadeira de rodas');
      } else {
        potential_difficulties.push('Portas com largura estreita ou batente elevado');
      }

      physTotal += 2;
      if (f.adapted_restroom) {
        physPoints += 2;
        strengths.push('Sanitário adaptado disponível');
      } else {
        potential_difficulties.push('Não possui sanitário adaptado ou com barras de apoio');
      }

      physTotal += 2;
      if (f.spacious_corridors && f.no_obstacles) {
        physPoints += 2;
        strengths.push('Corredores amplos e livres de obstáculos');
      } else {
        potential_difficulties.push('Corredores estreitos ou passagens obstruídas');
      }
    }

    if (p.cane || p.crutches || p.reduced_mobility) {
      physTotal += 2;
      if (f.has_handrails) {
        physPoints += 2;
        strengths.push('Corrimãos instalados nos acessos principais');
      } else {
        potential_difficulties.push('Falta de corrimão de apoio para locomoção');
      }

      physTotal += 1;
      if (f.non_slip_regular_floors) {
        physPoints += 1;
        strengths.push('Piso regular e antiderrapante');
      } else {
        potential_difficulties.push('Piso irregular ou escorregadio');
      }
    }

    if (p.long_distance_difficulty) {
      physTotal += 1;
      if (f.accessible_parking) {
        physPoints += 1;
        strengths.push('Vaga preferencial próxima à entrada');
      } else {
        potential_difficulties.push('Estacionamento distante ou sem vagas acessíveis');
      }
    }

    physicalScore = physTotal > 0 ? Math.round((physPoints / physTotal) * 100) : 100;
  }

  // 2. INTELLECTUAL EVALUATION
  let intellectualScore: number | null = null;
  const intellectualSelected = i.intellectual_disability || i.complex_info_difficulty || 
                               i.spatial_orientation_difficulty || i.needs_simple_instructions || 
                               i.needs_assistance_tasks;

  if (intellectualSelected) {
    let intPoints = 0;
    let intTotal = 0;

    intTotal += 2;
    if (f.simple_signage && f.plain_language) {
      intPoints += 2;
      strengths.push('Sinalização simples e comunicação em linguagem fácil');
    } else {
      potential_difficulties.push('Sinalização complexa ou ausência de pictogramas simplificados');
    }

    intTotal += 2;
    if (f.patient_trained_staff) {
      intPoints += 2;
      strengths.push('Equipe com treinamento e disposição para atendimento paciente');
    } else {
      potential_difficulties.push('Equipe sem treinamento específico para suporte cognitivo');
    }

    intTotal += 2;
    if (f.intuitive_organization && f.low_confusion_environment) {
      intPoints += 2;
      strengths.push('Ambiente organizado de forma intuitiva e de fácil orientação');
    } else {
      potential_difficulties.push('Espaço com layout confuso ou de difícil localização');
    }

    if (f.allows_accompanied_service) {
      strengths.push('Permite e incentiva atendimento assistido com acompanhante');
    }

    intellectualScore = intTotal > 0 ? Math.round((intPoints / intTotal) * 100) : 100;
  }

  // 3. SENSORY & PSYCHOSOCIAL EVALUATION
  let sensoryScore: number | null = null;
  const sensorySelected = s.autism || s.adhd || s.down_syndrome || s.social_interaction_difficulty ||
                          s.noise_sensitivity || s.light_sensitivity || s.crowded_spaces_difficulty ||
                          s.needs_quiet_spaces;

  if (sensorySelected) {
    let senPoints = 0;
    let senTotal = 0;

    if (s.noise_sensitivity) {
      senTotal += 2;
      if (f.low_noise_level) {
        senPoints += 2;
        strengths.push('Nível de ruído reduzido ou ambiente acusticamente controlado');
      } else {
        potential_difficulties.push('Ambiente barulhento ou com som ambiente elevado');
      }
    }

    if (s.light_sensitivity) {
      senTotal += 2;
      if (f.comfortable_lighting && f.reduced_visual_stimuli) {
        senPoints += 2;
        strengths.push('Iluminação confortável sem luzes estroboscópicas ou excesso de estímulos');
      } else {
        potential_difficulties.push('Iluminação muito forte, fluorescente direta ou piscante');
      }
    }

    if (s.needs_quiet_spaces || s.crowded_spaces_difficulty || s.autism) {
      senTotal += 2;
      if (f.sensory_regulation_room || f.quiet_rest_space) {
        senPoints += 2;
        strengths.push('Sala ou espaço calmo disponível para autorregulação sensorial');
      } else {
        potential_difficulties.push('Não possui espaço reservado para descompressão sensorial');
      }

      senTotal += 1;
      if (f.crowd_level_indicated) {
        senPoints += 1;
        strengths.push('Informa horários de menor pico e movimentação');
      }
    }

    if (f.individualized_service && f.flexible_service) {
      strengths.push('Atendimento flexível e personalizado');
    }

    sensoryScore = senTotal > 0 ? Math.round((senPoints / senTotal) * 100) : 100;
  }

  // 4. VISUAL EVALUATION
  let visualScore: number | null = null;
  const visualSelected = v.blindness || v.low_vision || v.reading_difficulty || v.needs_tactile_audio_signage;

  if (visualSelected) {
    let visPoints = 0;
    let visTotal = 0;

    if (v.blindness || v.needs_tactile_audio_signage) {
      visTotal += 2;
      if (f.tactile_paving && f.accessible_routes_blind) {
        visPoints += 2;
        strengths.push('Piso tátil direcional e de alerta nas rotas principais');
      } else {
        potential_difficulties.push('Ausência de piso tátil nas rotas de circulação');
      }

      visTotal += 2;
      if (f.braille_signage || f.sound_signage) {
        visPoints += 2;
        strengths.push('Sinalização em Braille e/ou sonora presente');
      } else {
        potential_difficulties.push('Sem sinalização em Braille ou avisos sonoros');
      }
    }

    if (v.low_vision || v.reading_difficulty) {
      visTotal += 2;
      if (f.high_contrast_info && f.legible_signage) {
        visPoints += 2;
        strengths.push('Comunicação visual com alto contraste e tipografia legível');
      } else {
        potential_difficulties.push('Contraste visual baixo em placas e sinalizações');
      }
    }

    visualScore = visTotal > 0 ? Math.round((visPoints / visTotal) * 100) : 100;
  }

  // 5. AUDITORY EVALUATION
  let auditoryScore: number | null = null;
  const auditorySelected = a.deafness || a.partial_hearing_loss || a.needs_libras || a.needs_visual_information;

  if (auditorySelected) {
    let audPoints = 0;
    let audTotal = 0;

    if (a.needs_libras || a.deafness) {
      audTotal += 3;
      if (f.libras_service) {
        audPoints += 3;
        strengths.push('Atendimento em Libras ou suporte por intérprete');
      } else {
        potential_difficulties.push('Não possui funcionários fluentes em Libras');
      }
    }

    audTotal += 2;
    if (f.visual_info_screens || f.call_panels || f.text_service) {
      audPoints += 2;
      strengths.push('Painéis visuais de chamada e atendimento por mensagem/texto');
    } else {
      potential_difficulties.push('Chamadas realizadas exclusivamente por voz sem painel');
    }

    auditoryScore = audTotal > 0 ? Math.round((audPoints / audTotal) * 100) : 100;
  }

  // 6. SERVICE QUALITY EVALUATION (Always considered)
  const serviceScore = est.service_score;
  if (f.inclusive_trained_staff && f.respects_autonomy) {
    strengths.push('Equipe preparada com respeito à autonomia da pessoa com deficiência');
  }

  // 7. ACCOMPANIMENT FACTOR & INDIVIDUAL AUTONOMY
  let baseAutonomy = 85;
  if (potential_difficulties.length > 0) {
    baseAutonomy -= (potential_difficulties.length * 12);
  }
  if (!f.wide_doors || !f.has_ramp) {
    baseAutonomy -= 20;
  }
  if (est.barriers && est.barriers.length > 0) {
    baseAutonomy -= (est.barriers.length * 15);
  }
  const individual_autonomy_score = Math.max(10, Math.min(100, baseAutonomy));

  // Determine alone visit condition
  let alone_visit_condition: 'Favorável' | 'Atenção redobrada' | 'Desaconselhada desacompanhada' | 'Informações insuficientes';
  if (unverified_points.length >= 8) {
    alone_visit_condition = 'Informações insuficientes';
  } else if (individual_autonomy_score >= 75) {
    alone_visit_condition = 'Favorável';
  } else if (individual_autonomy_score >= 50) {
    alone_visit_condition = 'Atenção redobrada';
  } else {
    alone_visit_condition = 'Desaconselhada desacompanhada';
  }

  // Companion impact
  if (acc.status === 'accompanied') {
    companion_impact_notes.push(`Você indicou visita com ${acc.companion_count || 1} acompanhante(s).`);
    if (acc.helps_mobility) {
      companion_impact_notes.push('O acompanhante poderá auxiliar na transposição de rampas íngremes ou desníveis.');
      aspects_requiring_aid.push('Apoio físico na entrada ou circulação interna');
    }
    if (acc.helps_communication) {
      companion_impact_notes.push('O acompanhante ajudará na mediação de dúvidas ou comunicação de necessidades.');
      aspects_requiring_aid.push('Apoio na comunicação e conferência de informações');
    }
    if (acc.helps_activities) {
      aspects_requiring_aid.push('Auxílio nas compras, pagamentos ou alcance de itens em balcões');
    }
    companion_impact_notes.push('A presença do acompanhante facilita a visita, mas não anula a responsabilidade do local em ser acessível.');
  } else if (acc.status === 'alone') {
    companion_impact_notes.push('Você planeja ir sozinho(a). O sistema priorizou recursos de autonomia plena e atendimento cooperativo.');
    if (individual_autonomy_score < 60) {
      aspects_requiring_aid.push('Recomendamos ligar previamente para confirmar se haverá funcionário disponível para apoio na chegada.');
    }
  } else {
    companion_impact_notes.push('Status de acompanhamento não definido. As recomendações consideram tanto visita autônoma quanto assistida.');
  }

  // Helpful resources recommendations
  if (f.accessible_parking) helpful_resources.push('Vaga exclusiva próxima');
  if (f.patient_trained_staff) helpful_resources.push('Atendimento prioritário e paciente');
  if (f.adapted_restroom) helpful_resources.push('Sanitário acessível disponível');
  if (f.text_service) helpful_resources.push('Canal de comunicação por texto/WhatsApp');

  // Calculate overall compatibility based ONLY on selected categories
  const activeScores: number[] = [];
  if (physicalScore !== null) activeScores.push(physicalScore);
  if (intellectualScore !== null) activeScores.push(intellectualScore);
  if (sensoryScore !== null) activeScores.push(sensoryScore);
  if (visualScore !== null) activeScores.push(visualScore);
  if (auditoryScore !== null) activeScores.push(auditoryScore);
  activeScores.push(serviceScore);

  let overall = Math.round(activeScores.reduce((acc, cur) => acc + cur, 0) / activeScores.length);
  if (acc.status === 'accompanied' && acc.helps_mobility && overall < 85 && physicalScore !== null && physicalScore < 70) {
    // Companion helps partially compensate, up to 10% bonus for user convenience
    overall = Math.min(100, overall + 8);
  }

  let summary_message = '';
  if (overall >= 80) {
    summary_message = `Este estabelecimento apresenta excelente compatibilidade com suas necessidades configuradas (${overall}%).`;
  } else if (overall >= 60) {
    summary_message = `O estabelecimento possui compatibilidade parcial (${overall}%). Existem pontos de atenção destacados antes da sua ida.`;
  } else {
    summary_message = `Atenção: A compatibilidade com seu perfil é limitada (${overall}%). Há barreiras significativas que podem comprometer sua autonomia.`;
  }

  if (acc.status === 'alone' && alone_visit_condition === 'Desaconselhada desacompanhada') {
    summary_message += ' Como você pretende ir desacompanhado(a), recomendamos verificar as condições ou considerar apoio.';
  }

  return {
    overall_compatibility: overall,
    category_compatibility: {
      physical: physicalScore,
      intellectual: intellectualScore,
      sensory: sensoryScore,
      visual: visualScore,
      auditory: auditoryScore,
      service: serviceScore,
    },
    individual_autonomy_score,
    strengths,
    potential_difficulties,
    unverified_points,
    alone_visit_condition,
    companion_impact_notes,
    helpful_resources,
    aspects_requiring_aid,
    data_reliability: est.reliability_score || 80,
    summary_message,
  };
}

export function generateVisitSimulation(
  profile: UserProfile,
  est: Establishment
): VisitSimulationResult {
  const comp = calculatePersonalCompatibility(profile, est);
  const f = est.features;

  const steps: VisitSimulationResult['steps'] = [
    {
      title: '1. Chegada e Calçada',
      description: f.tactile_paving
        ? 'Calçada com piso tátil e rota desobstruída. Acesso confortável.'
        : 'A calçada possui desníveis ou não há piso tátil verificado. Redobre a atenção ao desembarcar.',
      status: f.tactile_paving ? 'adequado' : 'alerta',
      badge: f.tactile_paving ? 'Acesso Regular' : 'Atenção ao Desembarcar',
    },
    {
      title: '2. Entrada Principal',
      description: f.has_ramp && f.wide_doors
        ? 'Entrada em nível ou rampa suave com portas amplas de fácil passagem.'
        : f.has_ramp
        ? 'Existe rampa na entrada, mas a largura da porta ou inclinação pode exigir esforço adicional.'
        : 'Degrau na entrada sem rampa aparente. Pode exigir auxílio para cadeira de rodas ou carrinho.',
      status: (f.has_ramp && f.wide_doors) ? 'adequado' : 'alerta',
      badge: f.has_ramp ? 'Entrada com Rampa' : 'Atenção: Degrau de Entrada',
    },
    {
      title: '3. Circulação Interna e Passagens',
      description: f.spacious_corridors && f.no_obstacles
        ? 'Corredores largos, pisos nivelados e sem caixas ou expositores obstruindo a circulação.'
        : 'Corredores podem ser estreitos em horários de pico. Fique atento a potenciais barreiras temporárias.',
      status: (f.spacious_corridors && f.no_obstacles) ? 'adequado' : 'alerta',
      badge: f.spacious_corridors ? 'Circulação Livre' : 'Passagens Estreitas',
    },
    {
      title: '4. Banheiros e Instalações',
      description: f.adapted_restroom
        ? 'Sanitário adaptado com barras de apoio laterais e espaço de manobra.'
        : 'Sanitário adaptado NÃO confirmado ou inexistente no local.',
      status: f.adapted_restroom ? 'adequado' : 'alerta',
      badge: f.adapted_restroom ? 'Banheiro Adaptado' : 'Sem Banheiro Adaptado',
    },
    {
      title: '5. Ambiente e Nível Sensorial',
      description: f.low_noise_level && f.comfortable_lighting
        ? 'Ambiente acústico moderado e iluminação suave, adequado para regulação sensorial.'
        : 'Ambiente com ruídos rotineiros ou iluminação intensa. Se você tem hipersensibilidade, recomendamos fones redutores.',
      status: (f.low_noise_level && f.comfortable_lighting) ? 'adequado' : 'alerta',
      badge: f.low_noise_level ? 'Sensorialmente Tranquilo' : 'Estímulos Moderados/Altos',
    },
    {
      title: '6. Atendimento e Comunicação',
      description: f.inclusive_trained_staff
        ? 'Atendentes preparados para comunicação paciente, respeito à autonomia e atendimento preferencial.'
        : 'Atendimento convencional. Recomenda-se informar claramente suas necessidades logo na chegada.',
      status: f.inclusive_trained_staff ? 'adequado' : 'desconhecido',
      badge: f.inclusive_trained_staff ? 'Equipe Treinada' : 'Atendimento Comum',
    },
  ];

  const key_phone_questions = [
    'A entrada principal possui rampa ou há degrau para entrar?',
    'O sanitário adaptado está aberto e em funcionamento hoje?',
    'Qual o horário de menor movimentação para uma visita mais tranquila?',
    'Há vaga preferencial de estacionamento reservada e desobstruída?',
  ];

  return {
    establishment_id: est.id,
    establishment_name: est.name,
    steps,
    verdict: {
      can_go_alone: comp.alone_visit_condition === 'Favorável',
      companion_recommended: comp.alone_visit_condition !== 'Favorável',
      main_reason: comp.summary_message,
      key_phone_questions,
    },
    generated_at: new Date().toISOString(),
  };
}
