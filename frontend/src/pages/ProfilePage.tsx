import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  Save,
  Accessibility,
  Eye,
  Ear,
  Brain,
  Sparkles,
  Building2,
  ArrowRight,
  HeartPulse,
  UserPlus,
  LogIn,
  LogOut,
  Mail,
  Lock,
  AlertCircle,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { UserProfile } from '../types';

interface Props {
  onNavigate?: (tab: string) => void;
}

const emptyNeedsTemplate = (): Omit<UserProfile, 'user_id' | 'updated_at'> => ({
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
    needs_companion: false,
    needs_priority_service: false,
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
});

function getSelectedSummary(p: Omit<UserProfile, 'user_id' | 'updated_at'>) {
  const mental: string[] = [];
  const corporal: string[] = [];

  // Neurodivergências & Desenvolvimento
  if (p.sensory.autism) mental.push('Autismo (TEA)');
  if (p.sensory.adhd) mental.push('TDAH');
  if (p.intellectual.intellectual_disability) mental.push('Deficiência Intelectual');
  if (p.sensory.down_syndrome) mental.push('Síndrome de Down');
  if (p.intellectual.dyslexia) mental.push('Dislexia');
  if (p.sensory.tourette) mental.push('Síndrome de Tourette');

  // Saúde Mental & Psicossociais
  if (p.sensory.anxiety_disorder || p.sensory.social_interaction_difficulty) mental.push('Ansiedade / Ansiedade Social');
  if (p.sensory.panic_disorder) mental.push('Síndrome do Pânico / Agorafobia');
  if (p.sensory.depression) mental.push('Depressão / Burnout');
  if (p.sensory.bipolar_disorder) mental.push('Transtorno Bipolar');
  if (p.sensory.ocd) mental.push('TOC');
  if (p.sensory.ptsd) mental.push('TEPT (Estresse Pós-Traumático)');
  if (p.sensory.psychosocial_condition) mental.push('Condição Psicossocial / Esquizofrenia');
  if (p.intellectual.memory_dementia) mental.push('Demência / Alzheimer / Memória');

  // Gatilhos Sensoriais & Comunicação
  if (p.sensory.noise_sensitivity) mental.push('Sensibilidade a Ruídos');
  if (p.sensory.light_sensitivity) mental.push('Sensibilidade à Luz');
  if (p.sensory.smell_sensitivity) mental.push('Sensibilidade a Cheiros');
  if (p.sensory.crowded_spaces_difficulty) mental.push('Evitar Aglomerações / Filas');
  if (p.sensory.needs_quiet_spaces) mental.push('Espaço Calmo / Autorregulação');
  if (p.intellectual.complex_info_difficulty || p.intellectual.needs_simple_instructions) {
    mental.push('Linguagem Simples');
  }
  if (p.intellectual.spatial_orientation_difficulty) mental.push('Orientação Espacial');
  if (p.intellectual.prefers_written_communication) mental.push('Comunicação Escrita');

  // Corporais
  if (p.physical.wheelchair) corporal.push('Cadeira de Rodas');
  if (p.physical.reduced_mobility) corporal.push('Mobilidade Reduzida');
  if (p.physical.crutches) corporal.push('Muletas');
  if (p.physical.cane) corporal.push('Bengala / Andador');
  if (p.physical.stair_difficulty || p.physical.needs_ramps_elevators) corporal.push('Rampas / Elevadores');
  if (p.physical.long_distance_difficulty) corporal.push('Dificuldade em Longas Distâncias');
  if (p.other.temporary_mobility_issue) corporal.push('Limitação Corporal Temporária');
  if (p.visual.blindness) corporal.push('Cegueira Total');
  if (p.visual.low_vision) corporal.push('Baixa Visão');
  if (p.visual.needs_tactile_audio_signage) corporal.push('Piso Tátil / Áudio');
  if (p.auditory.deafness) corporal.push('Surdez');
  if (p.auditory.partial_hearing_loss) corporal.push('Perda Auditiva Parcial');
  if (p.auditory.needs_libras) corporal.push('Libras');

  return { mental, corporal };
}

interface OptionDef {
  section: 'physical' | 'intellectual' | 'sensory' | 'visual' | 'auditory' | 'other';
  field: string;
  extraField?: { section: 'physical' | 'intellectual' | 'sensory' | 'visual' | 'auditory' | 'other'; field: string };
  label: string;
  desc: string;
}

const MENTAL_NEURO_OPTIONS: OptionDef[] = [
  {
    section: 'sensory',
    field: 'autism',
    label: 'Autismo (TEA — Transtorno do Espectro Autista)',
    desc: 'Previsibilidade, comunicação clara e menor sobrecarga de estímulos.',
  },
  {
    section: 'sensory',
    field: 'adhd',
    label: 'TDAH (Déficit de Atenção e Hiperatividade)',
    desc: 'Filas organizadas, avisos objetivos e menos distrações no atendimento.',
  },
  {
    section: 'intellectual',
    field: 'intellectual_disability',
    label: 'Deficiência Intelectual',
    desc: 'Linguagem simples, pictogramas claros e equipe paciente.',
  },
  {
    section: 'sensory',
    field: 'down_syndrome',
    label: 'Síndrome de Down',
    desc: 'Sinalização intuitiva, acolhimento respeitoso e incentivo à autonomia.',
  },
  {
    section: 'intellectual',
    field: 'dyslexia',
    label: 'Dislexia / Dificuldade de Leitura e Escrita',
    desc: 'Preferência por ícones visuais, orientação verbal e placas com fonte legível.',
  },
  {
    section: 'sensory',
    field: 'tourette',
    label: 'Síndrome de Tourette / Tiques Motores ou Vocais',
    desc: 'Ambiente acolhedor, sem julgamento e atendimento flexível.',
  },
];

const MENTAL_HEALTH_OPTIONS: OptionDef[] = [
  {
    section: 'sensory',
    field: 'anxiety_disorder',
    extraField: { section: 'sensory', field: 'social_interaction_difficulty' },
    label: 'Transtorno de Ansiedade / Ansiedade Social',
    desc: 'Atendimento calmo, sem pressão e menor exposição em público.',
  },
  {
    section: 'sensory',
    field: 'panic_disorder',
    label: 'Síndrome do Pânico / Agorafobia',
    desc: 'Espaços arejados, saídas fáceis e evitar locais fechados ou lotados.',
  },
  {
    section: 'sensory',
    field: 'depression',
    label: 'Depressão / Esgotamento Emocional (Burnout)',
    desc: 'Atendimento acolhedor, sem burocracia excessiva e sem longas esperas.',
  },
  {
    section: 'sensory',
    field: 'bipolar_disorder',
    label: 'Transtorno Bipolar',
    desc: 'Previsibilidade, ambiente equilibrado e acolhimento sem estigmas.',
  },
  {
    section: 'sensory',
    field: 'ocd',
    label: 'TOC (Transtorno Obsessivo-Compulsivo)',
    desc: 'Organização clara, higiene visível e tempo respeitado no atendimento.',
  },
  {
    section: 'sensory',
    field: 'ptsd',
    label: 'TEPT (Estresse Pós-Traumático)',
    desc: 'Evita barulhos súbitos, abordagens bruscas e locais sem visão de saída.',
  },
  {
    section: 'sensory',
    field: 'psychosocial_condition',
    label: 'Esquizofrenia / Outras Condições Psicossociais',
    desc: 'Ambiente tranquilo, comunicação serena, clara e livre de discriminação.',
  },
  {
    section: 'intellectual',
    field: 'memory_dementia',
    label: 'Demência / Alzheimer / Perda de Memória',
    desc: 'Placas grandes e visíveis, orientação espacial simples e apoio paciente.',
  },
];

const MENTAL_TRIGGERS_OPTIONS: OptionDef[] = [
  {
    section: 'sensory',
    field: 'noise_sensitivity',
    label: 'Hipersensibilidade a Ruídos, Música Alta ou Eco',
    desc: 'Sons intensos causam mal-estar, dor de cabeça ou sobrecarga.',
  },
  {
    section: 'sensory',
    field: 'light_sensitivity',
    label: 'Sensibilidade à Iluminação Forte ou Luzes Piscantes',
    desc: 'Luzes fluorescentes diretas ou muito fortes geram desconforto.',
  },
  {
    section: 'sensory',
    field: 'smell_sensitivity',
    label: 'Sensibilidade a Cheiros Fortes, Perfumes ou Produtos Químicos',
    desc: 'Preferência por locais bem ventilados e sem odores intensos.',
  },
  {
    section: 'sensory',
    field: 'crowded_spaces_difficulty',
    label: 'Desconforto em Filas Longas ou Aglomerações',
    desc: 'Necessita atendimento ágil, agendado ou horários de menor movimento.',
  },
  {
    section: 'sensory',
    field: 'needs_quiet_spaces',
    label: 'Necessidade de Espaço Calmo para Pausa e Autorregulação',
    desc: 'Ter um local silencioso para descansar em caso de crise ou sobrecarga.',
  },
  {
    section: 'intellectual',
    field: 'needs_simple_instructions',
    extraField: { section: 'intellectual', field: 'complex_info_difficulty' },
    label: 'Dificuldade com Burocracia / Necessito de Linguagem Simples',
    desc: 'Explicações diretas, passo a passo e sem palavras difíceis.',
  },
  {
    section: 'intellectual',
    field: 'spatial_orientation_difficulty',
    label: 'Dificuldade de Orientação Espacial em Locais Grandes',
    desc: 'Placas fáceis indicando entrada, setores, banheiros e saída.',
  },
  {
    section: 'intellectual',
    field: 'prefers_written_communication',
    label: 'Prefiro Comunicação Escrita / Alternativa (Sem Falar Muito)',
    desc: 'Atendimento por texto, mensagem, cartão ou apontando opções.',
  },
];

const normalizeSearch = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const ProfilePage: React.FC<Props> = ({ onNavigate }) => {
  const {
    user,
    profile,
    isRegisteredUser,
    registerAccount,
    loginAccount,
    logoutAccount,
    updateProfile,
    switchUserRole,
    loading,
  } = useAuth();
  const { speakText, isSpeaking, stopSpeaking } = useAccessibility();

  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [needsData, setNeedsData] = useState<Omit<UserProfile, 'user_id' | 'updated_at'>>(emptyNeedsTemplate);
  const [pillarFilter, setPillarFilter] = useState<'todas' | 'mentais' | 'corporais'>('todas');
  const [conditionSearch, setConditionSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isRegisteredUser && profile) {
      setNeedsData({
        physical: { ...emptyNeedsTemplate().physical, ...profile.physical },
        intellectual: { ...emptyNeedsTemplate().intellectual, ...profile.intellectual },
        sensory: { ...emptyNeedsTemplate().sensory, ...profile.sensory },
        visual: { ...emptyNeedsTemplate().visual, ...profile.visual },
        auditory: { ...emptyNeedsTemplate().auditory, ...profile.auditory },
        other: { ...emptyNeedsTemplate().other, ...profile.other },
        accompaniment: { ...emptyNeedsTemplate().accompaniment, ...profile.accompaniment },
      });
    } else if (!isRegisteredUser) {
      setNeedsData(emptyNeedsTemplate());
    }
  }, [isRegisteredUser, profile]);

  const handleCheckboxChange = (
    section: 'physical' | 'intellectual' | 'sensory' | 'visual' | 'auditory' | 'other',
    field: string,
    value: boolean
  ) => {
    setNeedsData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const handleOptionToggle = (opt: OptionDef, value: boolean) => {
    handleCheckboxChange(opt.section, opt.field, value);
    if (opt.extraField) {
      handleCheckboxChange(opt.extraField.section, opt.extraField.field, value);
    }
  };

  const handleAccompanimentChange = (field: string, value: any) => {
    setNeedsData((prev) => ({
      ...prev,
      accompaniment: {
        ...prev.accompaniment,
        [field]: value,
      },
    }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setAuthError('Preencha nome completo, e-mail e senha para concluir seu cadastro.');
      return;
    }

    try {
      setAuthSubmitting(true);
      await registerAccount({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: 'visitor',
        profileData: needsData,
      });
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError('Informe seu e-mail e senha para entrar.');
      return;
    }
    try {
      setAuthSubmitting(true);
      await loginAccount(loginEmail.trim(), loginPassword);
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Credenciais inválidas.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleUpdateRegisteredProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(needsData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleReadPageGuide = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(
        'Página de Cadastro e Perfil Personalizado do AcessoReal. Você pode marcar qualquer combinação de condições mentais, como Autismo, TDAH, Deficiência Intelectual, Ansiedade, Pânico, Depressão, Bipolaridade, TOC, Estresse Pós-Traumático, Dislexia ou sensibilidades sensoriais, além de condições corporais como cadeira de rodas, baixa visão e surdez. Não exigimos laudos médicos.'
      );
    }
  };

  const matchesSearch = (label: string, desc?: string) => {
    if (!conditionSearch.trim()) return true;
    const q = normalizeSearch(conditionSearch);
    return normalizeSearch(label).includes(q) || (desc ? normalizeSearch(desc).includes(q) : false);
  };

  const isGestor = user.role === 'owner';
  const summary = getSelectedSummary(needsData);

  const renderMentalGroup = (
    title: string,
    emoji: string,
    borderColor: string,
    options: OptionDef[]
  ) => {
    const filtered = options.filter((o) => matchesSearch(o.label, o.desc));
    if (filtered.length === 0) return null;
    return (
      <div className={`surface-card p-5 sm:p-6 space-y-3.5 border-l-4 ${borderColor}`}>
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <span aria-hidden="true" className="text-base">{emoji}</span>
          <span>{title}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((opt) => {
            const isChecked = Boolean((needsData[opt.section] as any)[opt.field]);
            return (
              <AccessibleOptionCard
                key={`${opt.section}_${opt.field}`}
                label={opt.label}
                description={opt.desc}
                checked={isChecked}
                accent="violet"
                onChange={(v) => handleOptionToggle(opt, v)}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderDisabilitySelectors = () => (
    <div className="space-y-5">
      {/* Accessible Filter + Search Bar */}
      <div className="surface-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todas', label: 'Ver Todas' },
              { id: 'mentais', label: '🧠 Condições Mentais (22)' },
              { id: 'corporais', label: '♿ Condições Corporais' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPillarFilter(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  pillarFilter === t.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={conditionSearch}
              onChange={(e) => setConditionSearch(e.target.value)}
              placeholder="Filtrar: ansiedade, pânico, dislexia..."
              aria-label="Filtrar condições mentais ou corporais"
              className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* PILLAR 1: CONDIÇÕES MENTAIS, COGNITIVAS E PSICOSSOCIAIS (22 OPÇÕES ACESSÍVEIS) */}
      {(pillarFilter === 'todas' || pillarFilter === 'mentais') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700">
              <Brain size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Condições Mentais, Cognitivas e Psicossociais
              </h3>
              <p className="text-xs text-slate-600">
                Todas as opções possuem explicação em linguagem simples. Marque quantas desejar, sem necessidade de laudo.
              </p>
            </div>
          </div>

          {renderMentalGroup(
            'Neurodivergências & Desenvolvimento',
            '🧩',
            'border-l-violet-500',
            MENTAL_NEURO_OPTIONS
          )}

          {renderMentalGroup(
            'Saúde Mental & Condições Psicossociais',
            '💜',
            'border-l-purple-600',
            MENTAL_HEALTH_OPTIONS
          )}

          {renderMentalGroup(
            'Gatilhos Sensoriais, Comunicação & Conforto',
            '🎧',
            'border-l-fuchsia-500',
            MENTAL_TRIGGERS_OPTIONS
          )}
        </div>
      )}

      {/* PILLAR 2: CONDIÇÕES CORPORAIS, FÍSICAS, VISUAIS E AUDITIVAS */}
      {(pillarFilter === 'todas' || pillarFilter === 'corporais') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1 pt-2">
            <div className="p-2.5 rounded-xl bg-brand-100 text-brand-700">
              <HeartPulse size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Deficiências e Condições Corporais / Físicas
              </h3>
              <p className="text-xs text-slate-600">
                Marque suas necessidades corporais de mobilidade, visão ou audição.
              </p>
            </div>
          </div>

          <div className="surface-card p-5 sm:p-6 space-y-3.5 border-l-4 border-l-brand-600">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              ♿ Mobilidade & Condição Física
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  section: 'physical' as const,
                  field: 'wheelchair',
                  label: 'Utilizo cadeira de rodas (manual ou motorizada)',
                  desc: 'Prioriza rampas suaves, portas >= 80cm e banheiros adaptados.',
                },
                {
                  section: 'physical' as const,
                  field: 'reduced_mobility',
                  label: 'Mobilidade reduzida, fadiga física ou marcha lenta',
                  desc: 'Prioriza pisos antiderrapantes, apoios e trajetos curtos.',
                },
                {
                  section: 'physical' as const,
                  field: 'crutches',
                  label: 'Utilizo muletas',
                  desc: 'Prioriza pisos regulares sem obstáculos e corrimãos.',
                },
                {
                  section: 'physical' as const,
                  field: 'cane',
                  label: 'Utilizo bengala ou andador de apoio',
                  desc: 'Prioriza áreas niveladas e assentos de descanso.',
                },
                {
                  section: 'physical' as const,
                  field: 'stair_difficulty',
                  extraField: { section: 'physical' as const, field: 'needs_ramps_elevators' },
                  label: 'Dificuldade com escadas / Preciso de rampas ou elevadores',
                  desc: 'Evita degraus sem alternativa acessível.',
                },
                {
                  section: 'physical' as const,
                  field: 'long_distance_difficulty',
                  label: 'Dificuldade para caminhar longas distâncias ou ficar em pé',
                  desc: 'Prioriza vagas próximas à entrada e atendimento prioritário.',
                },
                {
                  section: 'other' as const,
                  field: 'temporary_mobility_issue',
                  label: 'Limitação corporal temporária (gestação, fratura, pós-cirúrgico)',
                  desc: 'Adapta a pesquisa para o seu momento atual.',
                },
              ]
                .filter((o) => matchesSearch(o.label, o.desc))
                .map((opt) => (
                  <AccessibleOptionCard
                    key={`${opt.section}_${opt.field}`}
                    label={opt.label}
                    description={opt.desc}
                    checked={Boolean((needsData[opt.section] as any)[opt.field])}
                    accent="brand"
                    onChange={(v) => handleOptionToggle(opt, v)}
                  />
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="surface-card p-5 space-y-3 border-l-4 border-l-sky-500">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Eye size={16} className="text-sky-600" />
                <span>Deficiência Visual</span>
              </h4>
              <div className="space-y-2.5">
                {[
                  {
                    section: 'visual' as const,
                    field: 'blindness',
                    label: 'Cegueira total',
                    desc: 'Prioriza piso tátil, Braille e rotas desobstruídas.',
                  },
                  {
                    section: 'visual' as const,
                    field: 'low_vision',
                    label: 'Baixa visão / visão subnormal',
                    desc: 'Prioriza alto contraste, boa iluminação e letras legíveis.',
                  },
                  {
                    section: 'visual' as const,
                    field: 'needs_tactile_audio_signage',
                    extraField: { section: 'visual' as const, field: 'reading_difficulty' },
                    label: 'Necessito de piso tátil e avisos sonoros',
                    desc: 'Sinalização tátil em pisos e semáforos/painéis sonoros.',
                  },
                ]
                  .filter((o) => matchesSearch(o.label, o.desc))
                  .map((opt) => (
                    <AccessibleOptionCard
                      key={`${opt.section}_${opt.field}`}
                      label={opt.label}
                      description={opt.desc}
                      checked={Boolean((needsData[opt.section] as any)[opt.field])}
                      accent="brand"
                      onChange={(v) => handleOptionToggle(opt, v)}
                    />
                  ))}
              </div>
            </div>

            <div className="surface-card p-5 space-y-3 border-l-4 border-l-teal-500">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Ear size={16} className="text-teal-600" />
                <span>Deficiência Auditiva</span>
              </h4>
              <div className="space-y-2.5">
                {[
                  {
                    section: 'auditory' as const,
                    field: 'deafness',
                    label: 'Surdez',
                    desc: 'Prioriza Libras, atendimento por texto e alertas visuais.',
                  },
                  {
                    section: 'auditory' as const,
                    field: 'partial_hearing_loss',
                    label: 'Perda auditiva parcial / aparelho auditivo',
                    desc: 'Prioriza ambientes com menos eco/ruído e boa sinalização.',
                  },
                  {
                    section: 'auditory' as const,
                    field: 'needs_libras',
                    extraField: { section: 'auditory' as const, field: 'needs_visual_information' },
                    label: 'Comunicação em Libras e painéis visuais',
                    desc: 'Atendimento em Libras e chamadas visuais em tela.',
                  },
                ]
                  .filter((o) => matchesSearch(o.label, o.desc))
                  .map((opt) => (
                    <AccessibleOptionCard
                      key={`${opt.section}_${opt.field}`}
                      label={opt.label}
                      description={opt.desc}
                      checked={Boolean((needsData[opt.section] as any)[opt.field])}
                      accent="brand"
                      onChange={(v) => handleOptionToggle(opt, v)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accompaniment & Custom Notes */}
      <div className="surface-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
          <Users size={18} className="text-brand-600" />
          <span>Acompanhamento & Outras Observações</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'alone', title: 'Costumo ir sozinho(a)' },
            { id: 'accompanied', title: 'Costumo ir acompanhado(a)' },
            { id: 'undecided', title: 'Varia / A definir' },
          ].map((opt) => (
            <label
              key={opt.id}
              className={`p-3.5 rounded-xl border-2 cursor-pointer text-xs font-bold flex items-center justify-between transition-all ${
                needsData.accompaniment.status === opt.id
                  ? 'border-brand-600 bg-brand-50/60 text-brand-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{opt.title}</span>
              <input
                type="radio"
                name="acc_mode"
                checked={needsData.accompaniment.status === opt.id}
                onChange={() => handleAccompanimentChange('status', opt.id)}
                className="w-4 h-4 text-brand-600"
              />
            </label>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>Outra condição mental ou corporal não listada acima (opcional):</span>
          </label>
          <input
            type="text"
            value={needsData.other.custom_needs}
            onChange={(e) =>
              setNeedsData((prev) => ({
                ...prev,
                other: { ...prev.other, custom_needs: e.target.value },
              }))
            }
            placeholder="Ex: Preciso de assento durante filas, prefiro atendimento por mensagem escrita..."
            className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white p-3.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );

  if (loading && isRegisteredUser && !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4">
        <div className="h-10 w-56 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-200/70 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Top Hero & 2-Profile Switcher */}
      <div className="mesh-hero text-white p-6 sm:p-8 rounded-[2rem] shadow-elevated border border-white/10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-300 bg-white/10 px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/15">
            <Accessibility size={15} />
            <span>Perfis do AcessoReal</span>
          </div>

          <button
            type="button"
            onClick={handleReadPageGuide}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isSpeaking ? 'Parar Áudio' : 'Ouvir Explicação'}</span>
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Perfil Personalizado & Perfil Gestor
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Cadastre seu <strong>Perfil Personalizado</strong> escolhendo entre 22 opções de condições mentais/cognitivas e condições corporais, ou acesse o <strong>Perfil Gestor</strong>.
          </p>
        </div>

        {/* 2 PROFILES ONLY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => switchUserRole('visitor')}
            className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
              !isGestor
                ? 'bg-white text-slate-900 border-white shadow-elevated ring-4 ring-accent-400/30'
                : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
            }`}
          >
            <div className={`p-3 rounded-2xl shrink-0 ${!isGestor ? 'bg-brand-600 text-white' : 'bg-white/10 text-accent-300'}`}>
              <UserPlus size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm">Perfil Personalizado</span>
                {!isGestor && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ATIVO
                  </span>
                )}
              </div>
              <p className={`text-xs leading-relaxed ${!isGestor ? 'text-slate-600' : 'text-slate-300'}`}>
                Cadastre-se e marque suas <strong>condições mentais ou corporais</strong> em linguagem acessível.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => switchUserRole('owner')}
            className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
              isGestor
                ? 'bg-white text-slate-900 border-white shadow-elevated ring-4 ring-accent-400/30'
                : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
            }`}
          >
            <div className={`p-3 rounded-2xl shrink-0 ${isGestor ? 'bg-slate-900 text-accent-400' : 'bg-white/10 text-brand-300'}`}>
              <Building2 size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm">Perfil Gestor</span>
                {isGestor && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ATIVO
                  </span>
                )}
              </div>
              <p className={`text-xs leading-relaxed ${isGestor ? 'text-slate-600' : 'text-slate-300'}`}>
                Para responsáveis por estabelecimentos, escolas e assistências sociais gerenciarem acessibilidade.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* VIEW 1: PERFIL GESTOR */}
      {isGestor ? (
        <div className="surface-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                Modo Gestor de Estabelecimento
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Gerencie a Acessibilidade do Seu Local
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Cadastre novos espaços em Tupã, atualize o checklist técnico da NBR 9050 e acompanhe recomendações de acessibilidade física e mental.
              </p>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('owner')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all shrink-0"
              >
                <span>Abrir Portal do Gestor</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Cadastrar Locais', desc: 'Inclua estabelecimentos comerciais, escolas, clínicas ou unidades de assistência social.' },
              { title: 'Checklist Completo', desc: 'Atualize rampas, banheiros adaptados, piso tátil, Libras e conforto sensorial.' },
              { title: 'Evolução Transparente', desc: 'Receba recomendações claras para aumentar a autonomia dos visitantes.' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h3 className="text-xs font-extrabold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : !isRegisteredUser ? (
        /* VIEW 2A: CADASTRO / LOGIN DO PERFIL PERSONALIZADO */
        <div className="space-y-6">
          <div className="flex bg-slate-200/70 p-1.5 rounded-2xl max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                authTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus size={15} />
              <span>Criar Meu Cadastro</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                authTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn size={15} />
              <span>Já Tenho Conta</span>
            </button>
          </div>

          {authTab === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="surface-card p-6 sm:p-8 space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600">
                    Passo 1 de 2 • Cadastro Pessoal
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Crie sua conta no AcessoReal
                  </h2>
                  <p className="text-xs text-slate-600">
                    Suas condições mentais ou corporais ficam salvas no seu perfil para personalizar toda a plataforma.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nome Completo *</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ex: Ana Paula Silva"
                        className="w-full text-xs font-medium pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">E-mail *</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full text-xs font-medium pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Senha *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        minLength={4}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Crie uma senha"
                        className="w-full text-xs font-medium pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 text-[11px] text-emerald-950 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Privacidade & Respeito (LGPD):</strong> Seus dados são sigilosos e nunca exibidos publicamente. Você pode editar ou remover qualquer condição a qualquer momento.
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="px-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600 block">
                    Passo 2 de 2 • Escolha suas Necessidades
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Selecione quais condições mentais ou corporais você tem:
                  </h2>
                </div>

                {renderDisabilitySelectors()}
              </div>

              {authError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="sticky bottom-4 bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  Marcadas: <strong className="text-violet-700">{summary.mental.length} mentais</strong> •{' '}
                  <strong className="text-brand-700">{summary.corporal.length} corporais</strong>
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-extrabold rounded-xl shadow-glow-brand transition-all text-xs sm:text-sm disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  <span>{authSubmitting ? 'Cadastrando...' : 'Concluir Cadastro Personalizado'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="surface-card p-6 sm:p-8 max-w-lg mx-auto space-y-5">
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-extrabold text-slate-900">Entrar na Minha Conta</h2>
                <p className="text-xs text-slate-500">
                  Acesse seu perfil cadastrado para carregar suas condições mentais e corporais.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
              >
                {authSubmitting ? 'Entrando...' : 'Entrar no Meu Perfil'}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* VIEW 2B: PERFIL CADASTRADO & EDITÁVEL */
        <form onSubmit={handleUpdateRegisteredProfile} className="space-y-6">
          <div className="surface-card p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white font-display font-extrabold text-xl flex items-center justify-center shadow-glow-brand shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">{user.name}</h2>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Cadastrado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={logoutAccount}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition-colors"
              >
                <LogOut size={14} />
                <span>Sair / Novo Cadastro</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-200/80 space-y-2">
                <span className="text-[11px] font-extrabold text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain size={14} />
                  <span>Condições Mentais ({summary.mental.length})</span>
                </span>
                {summary.mental.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {summary.mental.map((tag) => (
                      <span key={tag} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-violet-800 border border-violet-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-violet-700/70">Nenhuma condição mental marcada.</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 space-y-2">
                <span className="text-[11px] font-extrabold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse size={14} />
                  <span>Condições Corporais ({summary.corporal.length})</span>
                </span>
                {summary.corporal.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {summary.corporal.map((tag) => (
                      <span key={tag} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-brand-800 border border-brand-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-700/70">Nenhuma condição corporal marcada.</p>
                )}
              </div>
            </div>
          </div>

          {renderDisabilitySelectors()}

          <div className="sticky bottom-4 bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              {savedSuccess ? (
                <span className="text-emerald-600 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 size={17} /> Perfil e condições atualizados com sucesso!
                </span>
              ) : (
                <span>Você pode adicionar ou remover condições mentais e corporais sempre que precisar.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-brand-600 text-white font-extrabold rounded-xl shadow-md transition-all text-xs sm:text-sm disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Salvando...' : 'Salvar Alterações do Perfil'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const AccessibleOptionCard: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  accent?: 'violet' | 'brand';
  onChange: (val: boolean) => void;
}> = ({ label, description, checked, accent = 'brand', onChange }) => {
  const activeStyle =
    accent === 'violet'
      ? 'bg-violet-50/90 border-violet-500 ring-2 ring-violet-500/20 text-violet-950'
      : 'bg-brand-50/90 border-brand-500 ring-2 ring-brand-500/20 text-brand-950';

  const checkboxColor = accent === 'violet' ? 'text-violet-600 focus:ring-violet-500' : 'text-brand-600 focus:ring-brand-500';

  return (
    <label
      className={`flex items-start gap-3.5 p-3.5 min-h-[60px] rounded-2xl border-2 cursor-pointer transition-all ${
        checked
          ? `${activeStyle} shadow-sm`
          : 'bg-slate-50/70 border-slate-200/80 text-slate-800 hover:bg-white hover:border-slate-300'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`w-5 h-5 mt-0.5 rounded-md border-slate-300 shrink-0 cursor-pointer ${checkboxColor}`}
      />
      <div className="space-y-0.5 leading-snug">
        <span className="block text-xs font-bold">{label}</span>
        {description && (
          <span className="block text-[11px] text-slate-600 font-normal leading-relaxed">
            {description}
          </span>
        )}
      </div>
    </label>
  );
};
