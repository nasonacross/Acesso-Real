import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Globe,
  Share2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Star,
  MessageSquare,
  ShieldCheck,
  Compass,
  Volume2,
  ArrowLeft,
  Building,
  Flag
} from 'lucide-react';
import { Establishment, PersonalCompatibilityResult } from '../types';
import { fetchEstablishmentById, calculateCompatibility } from '../api';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityBadge } from '../components/AccessibilityBadge';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { CompatibilityCard } from '../components/CompatibilityCard';
import { ReviewModal } from '../components/ReviewModal';
import { ReportModal } from '../components/ReportModal';

interface Props {
  establishmentId: string;
  onNavigate: (tab: string, estId?: string) => void;
}

export const EstablishmentDetailPage: React.FC<Props> = ({ establishmentId, onNavigate }) => {
  const { profile } = useAuth();
  const { speakText } = useAccessibility();

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [compatibility, setCompatibility] = useState<PersonalCompatibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'fisica' | 'cognitiva' | 'sensorial' | 'visual' | 'auditiva' | 'atendimento'>('fisica');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [establishmentId, profile?.user_id]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const est = await fetchEstablishmentById(establishmentId);
      setEstablishment(est);

      if (profile) {
        const comp = await calculateCompatibility(establishmentId, profile);
        setCompatibility(comp);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (!establishment) return;
    const textToSpeak = `
      Estabelecimento ${establishment.name}.
      Classificação: ${establishment.classification}.
      Nota geral: ${establishment.overall_score} de 100.
      Endereço: ${establishment.address}.
      ${establishment.barriers.length > 0 ? `Atenção: possui barreira conhecida: ${establishment.barriers.join(', ')}.` : 'Nenhuma barreira crítica relatada.'}
      ${compatibility ? `Sua compatibilidade individual estimada é de ${compatibility.overall_compatibility} por cento.` : ''}
    `;
    speakText(textToSpeak);
  };

  if (loading) {
    return (
      <div className="py-12 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Estabelecimento não encontrado</h2>
        <button
          onClick={() => onNavigate('establishments')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const f = establishment.features;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onNavigate('establishments')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          <span>Voltar para pesquisa</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadAloud}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            title="Ouvir resumo em voz alta"
          >
            <Volume2 size={16} className="text-brand-600" />
            <span>Ouvir Resumo</span>
          </button>

          <button
            onClick={() => onNavigate('simulation', establishment.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow transition-colors"
          >
            <Compass size={16} />
            <span>Simular Visita</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Photo Gallery Banner */}
        <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img
            src={establishment.images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'}
            alt={`Fotografia de ${establishment.name}`}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <AccessibilityBadge classification={establishment.classification} size="md" />
              <ProvenanceBadge
                provenance={establishment.provenance}
                reliabilityScore={establishment.reliability_score}
                lastUpdate={establishment.last_update}
                isDemo={establishment.is_demo}
              />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {establishment.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl">
              {establishment.description}
            </p>
          </div>
        </div>

        {/* Address & Quick metadata */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-brand-600 shrink-0" />
            <span className="font-medium">{establishment.address} — {establishment.city}/{establishment.state}</span>
          </div>

          <div className="flex items-center gap-4">
            {establishment.phone && (
              <a
                href={`tel:${establishment.phone}`}
                className="flex items-center gap-1 text-brand-700 font-semibold hover:underline"
              >
                <Phone size={14} />
                <span>{establishment.phone}</span>
              </a>
            )}

            {establishment.website && (
              <a
                href={establishment.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-brand-700 font-semibold hover:underline"
              >
                <Globe size={14} />
                <span>Website</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* INDIVIDUAL COMPATIBILITY INDEX CARD (Crucial core feature) */}
      {compatibility && (
        <section aria-labelledby="compatibilidade-heading">
          <CompatibilityCard
            compatibility={compatibility}
            onOpenSimulation={() => onNavigate('simulation', establishment.id)}
          />
        </section>
      )}

      {/* Severe Barriers Alert Banner if exists */}
      {establishment.barriers.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base text-rose-900">
            <AlertTriangle size={20} className="text-rose-600 shrink-0" />
            <span>Atenção: Barreiras Conhecidas Identificadas</span>
          </div>
          <p className="text-xs text-rose-800">
            A plataforma AcessoReal nunca permite que uma nota alta em uma categoria encubra barreiras críticas para os visitantes:
          </p>
          <ul className="list-disc list-inside text-xs space-y-1 font-medium">
            {establishment.barriers.map((barr, idx) => (
              <li key={idx}>{barr}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Complete 6 Category Breakdown & Checklist */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Avaliação Técnica por Categoria (0 a 100 pontos)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cada categoria é calculada de forma independente para garantir transparência integral.
          </p>
        </div>

        {/* 6 Category Score Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Física & Motora', score: establishment.physical_score, icon: '♿', id: 'fisica' as const },
            { label: 'Intelectual', score: establishment.intellectual_score, icon: '🧩', id: 'cognitiva' as const },
            { label: 'Sensorial', score: establishment.sensory_score, icon: '🎧', id: 'sensorial' as const },
            { label: 'Visual', score: establishment.visual_score, icon: '🦯', id: 'visual' as const },
            { label: 'Auditiva', score: establishment.auditory_score, icon: '🤟', id: 'auditiva' as const },
            { label: 'Atendimento', score: establishment.service_score, icon: '❤️', id: 'atendimento' as const },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryTab(cat.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeCategoryTab === cat.id
                  ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-base font-extrabold text-slate-900">{cat.score}</span>
              </div>
              <div className="text-xs font-bold text-slate-700 truncate">{cat.label}</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    cat.score >= 75 ? 'bg-emerald-500' : cat.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Checklist Content by Active Tab */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
            Checklist de Recursos Verificados: {activeCategoryTab.toUpperCase()}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {activeCategoryTab === 'fisica' && (
              <>
                <CheckItem label="Rampa de acesso na entrada" status={f.has_ramp} />
                <CheckItem label="Inclinação da rampa adequada (NBR 9050)" status={f.ramp_adequate_slope} />
                <CheckItem label="Corrimãos instalados nos acessos" status={f.has_handrails} />
                <CheckItem label="Portas amplas com vão livre ≥ 80cm" status={f.wide_doors} />
                <CheckItem label="Corredores espaçosos para circulação" status={f.spacious_corridors} />
                <CheckItem label="Ausência de obstáculos nas passagens" status={f.no_obstacles} />
                <CheckItem label="Elevador acessível (se houver mezanino)" status={f.accessible_elevator} />
                <CheckItem label="Sanitário adaptado com barras de apoio" status={f.adapted_restroom} />
                <CheckItem label="Vagas de estacionamento reservadas para PCD" status={f.accessible_parking} />
                <CheckItem label="Balcão ou caixa em altura acessível" status={f.accessible_counters} />
                <CheckItem label="Pisos regulares e antiderrapantes" status={f.non_slip_regular_floors} />
                <CheckItem label="Acesso para cadeirantes em todas as áreas" status={f.wheelchair_access_all_areas} />
              </>
            )}

            {activeCategoryTab === 'cognitiva' && (
              <>
                <CheckItem label="Sinalizações simples com pictogramas" status={f.simple_signage} />
                <CheckItem label="Informações em linguagem fácil" status={f.plain_language} />
                <CheckItem label="Identificação visual clara dos setores" status={f.clear_ambient_identification} />
                <CheckItem label="Atendimento paciente e preparado" status={f.patient_trained_staff} />
                <CheckItem label="Orientações e mapas visuais intuitivos" status={f.visual_guidance} />
                <CheckItem label="Organização lógica do espaço" status={f.intuitive_organization} />
                <CheckItem label="Instruções e formulários simplificados" status={f.simplified_instructions} />
                <CheckItem label="Permite atendimento assistido com acompanhante" status={f.allows_accompanied_service} />
                <CheckItem label="Ambiente que minimiza confusão espacial" status={f.low_confusion_environment} />
                <CheckItem label="Recursos de comunicação alternativa (PECS/Cartões)" status={f.alternative_communication} />
              </>
            )}

            {activeCategoryTab === 'sensorial' && (
              <>
                <CheckItem label="Ambiente com baixo nível de ruído" status={f.low_noise_level} />
                <CheckItem label="Iluminação confortável (sem luz estroboscópica)" status={f.comfortable_lighting} />
                <CheckItem label="Espaço calmo para descanso e autorregulação" status={f.quiet_rest_space} />
                <CheckItem label="Possibilidade de atendimento individualizado" status={f.individualized_service} />
                <CheckItem label="Redução de estímulos visuais excessivos" status={f.reduced_visual_stimuli} />
                <CheckItem label="Tratamento respeitoso e sem discriminação" status={f.respectful_non_discriminatory} />
                <CheckItem label="Flexibilidade e tolerância no tempo de atendimento" status={f.flexible_service} />
                <CheckItem label="Identificação de horários de grande movimentação" status={f.crowd_level_indicated} />
                <CheckItem label="Sala de descompressão sensorial disponível" status={f.sensory_regulation_room} />
              </>
            )}

            {activeCategoryTab === 'visual' && (
              <>
                <CheckItem label="Piso tátil direcional e de alerta" status={f.tactile_paving} />
                <CheckItem label="Sinalização em Braille e relevo táctil" status={f.braille_signage} />
                <CheckItem label="Alto contraste nas informações e placas" status={f.high_contrast_info} />
                <CheckItem label="Placas com letras grandes e legíveis" status={f.legible_signage} />
                <CheckItem label="Audiodescrição disponível" status={f.audio_description_available} />
                <CheckItem label="Sinalização sonora ou avisos por voz" status={f.sound_signage} />
                <CheckItem label="Rotas seguras desobstruídas para pessoas cegas" status={f.accessible_routes_blind} />
              </>
            )}

            {activeCategoryTab === 'auditiva' && (
              <>
                <CheckItem label="Atendimento em Libras ou intérprete" status={f.libras_service} />
                <CheckItem label="Informações visuais nas chamadas" status={f.visual_info_screens} />
                <CheckItem label="Painéis digitais de chamada de senha" status={f.call_panels} />
                <CheckItem label="Alertas visuais e luminosos de emergência" status={f.luminous_alerts} />
                <CheckItem label="Atendimento por texto / WhatsApp" status={f.text_service} />
              </>
            )}

            {activeCategoryTab === 'atendimento' && (
              <>
                <CheckItem label="Funcionários com capacitação inclusiva" status={f.inclusive_trained_staff} />
                <CheckItem label="Respeito às necessidades individuais" status={f.respects_individual_needs} />
                <CheckItem label="Atendimento prioritário assegurado" status={f.priority_service} />
                <CheckItem label="Práticas de comunicação acessível" status={f.accessible_communication_practice} />
                <CheckItem label="Disposição prestativa para oferecer auxílio" status={f.willingness_to_help} />
                <CheckItem label="Ausência total de práticas capacitistas" status={f.no_discriminatory_practices} />
                <CheckItem label="Respeito absoluto à autonomia da pessoa" status={f.respects_autonomy} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Community Reviews & Barrier Reports Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Relatos da Comunidade ({establishment.reviews?.length || 0})
            </h2>
            <p className="text-xs text-slate-500">
              Experiências reais contadas por quem visitou desacompanhado ou com apoio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Flag size={14} />
              <span>Reportar Erro</span>
            </button>

            <button
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow transition-colors"
            >
              <MessageSquare size={14} />
              <span>Avaliar este local</span>
            </button>
          </div>
        </div>

        {/* Reviews List */}
        {establishment.reviews && establishment.reviews.length > 0 ? (
          <div className="space-y-4">
            {establishment.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rev.user_name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-semibold">
                        {rev.user_condition_tag}
                      </span>
                      {rev.went_accompanied ? (
                        <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                          Visita com acompanhante
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                          Visita independente (sozinho)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} className="fill-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{rev.rating}/5</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.barriers_reported && rev.barriers_reported.length > 0 && (
                  <div className="text-xs bg-rose-50 text-rose-900 border border-rose-200 p-2 rounded-lg space-y-0.5">
                    <strong className="block text-rose-700">Barreiras apontadas pelo visitante:</strong>
                    {rev.barriers_reported.map((b, i) => (
                      <div key={i}>• {b}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
            <p className="text-xs text-slate-500">
              Ainda não há relatos para este local. Seja o primeiro a compartilhar sua experiência real!
            </p>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="text-xs text-brand-600 font-bold hover:underline"
            >
              Publicar a primeira avaliação
            </button>
          </div>
        )}
      </section>

      {/* Modals */}
      <ReviewModal
        establishmentId={establishment.id}
        establishmentName={establishment.name}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={loadDetails}
      />

      <ReportModal
        establishmentId={establishment.id}
        establishmentName={establishment.name}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};

const CheckItem: React.FC<{ label: string; status: boolean }> = ({ label, status }) => {
  return (
    <div
      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
        status ? 'bg-white border-slate-200' : 'bg-slate-100/60 border-slate-200/60 text-slate-400'
      }`}
    >
      <span className={status ? 'text-slate-800 font-medium' : 'text-slate-500'}>
        {label}
      </span>
      {status ? (
        <CheckCircle size={16} className="text-emerald-600 shrink-0" />
      ) : (
        <XCircle size={16} className="text-slate-400 shrink-0" />
      )}
    </div>
  );
};
