import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Plus,
  Save,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Establishment, AccessibilityFeatures } from '../types';
import { fetchEstablishments, createEstablishment, updateEstablishment } from '../api';
import { useAuth } from '../context/AuthContext';

export const OwnerPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEst, setSelectedEst] = useState<Establishment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Establishment Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Establishment['category']>('mercado');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [features, setFeatures] = useState<AccessibilityFeatures>({
    has_ramp: false,
    ramp_adequate_slope: false,
    has_handrails: false,
    wide_doors: false,
    spacious_corridors: false,
    no_obstacles: false,
    accessible_elevator: false,
    adapted_restroom: false,
    accessible_parking: false,
    accessible_counters: false,
    non_slip_regular_floors: false,
    wheelchair_access_all_areas: false,

    simple_signage: false,
    plain_language: false,
    clear_ambient_identification: false,
    patient_trained_staff: false,
    visual_guidance: false,
    intuitive_organization: false,
    simplified_instructions: false,
    allows_accompanied_service: false,
    low_confusion_environment: false,
    alternative_communication: false,

    low_noise_level: false,
    comfortable_lighting: false,
    quiet_rest_space: false,
    individualized_service: false,
    reduced_visual_stimuli: false,
    respectful_non_discriminatory: false,
    flexible_service: false,
    crowd_level_indicated: false,
    sensory_regulation_room: false,

    tactile_paving: false,
    braille_signage: false,
    high_contrast_info: false,
    legible_signage: false,
    audio_description_available: false,
    sound_signage: false,
    accessible_routes_blind: false,

    libras_service: false,
    visual_info_screens: false,
    call_panels: false,
    luminous_alerts: false,
    text_service: false,

    inclusive_trained_staff: false,
    respects_individual_needs: false,
    priority_service: false,
    accessible_communication_practice: false,
    willingness_to_help: false,
    no_discriminatory_practices: false,
    respects_autonomy: false,
  });

  useEffect(() => {
    loadMyEstablishments();
  }, []);

  const loadMyEstablishments = async () => {
    try {
      const all = await fetchEstablishments();
      setEstablishments(all);
      if (all.length > 0 && !selectedEst) {
        handleSelectEst(all[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEst = (est: Establishment) => {
    setSelectedEst(est);
    setIsCreating(false);
    setFeatures(est.features);
    setName(est.name);
    setCategory(est.category);
    setAddress(est.address);
    setDescription(est.description);
    setPhone(est.phone);
    setWebsite(est.website);
  };

  const handleToggleFeature = (key: keyof AccessibilityFeatures) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isCreating) {
        const created = await createEstablishment({
          name,
          category,
          address,
          description,
          phone,
          website,
          owner_id: user.id,
          features,
          provenance: 'declarada',
        });
        setSuccessMsg('Estabelecimento cadastrado com sucesso!');
        await loadMyEstablishments();
        setSelectedEst(created);
        setIsCreating(false);
      } else if (selectedEst) {
        const updated = await updateEstablishment(selectedEst.id, {
          name,
          category,
          address,
          description,
          phone,
          website,
          features,
        });
        setSuccessMsg('Condições de acessibilidade atualizadas!');
        setSelectedEst(updated);
        await loadMyEstablishments();
      }
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="surface-card p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <Building2 size={15} />
          <span>Portal do Estabelecimento & Gestor</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Gerenciamento de Acessibilidade & Questionário Inclusivo
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Cadastre seu estabelecimento, preencha o questionário com as condições reais das suas instalações e acompanhe recomendações para receber pessoas com deficiência com autonomia.
        </p>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Select or Create Place buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {establishments.map((est) => (
            <button
              key={est.id}
              onClick={() => handleSelectEst(est)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                !isCreating && selectedEst?.id === est.id
                  ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {est.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setSelectedEst(null);
            setName('');
            setAddress('');
            setDescription('');
            setPhone('');
            setWebsite('');
          }}
          className="inline-flex items-center gap-1.5 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-colors shrink-0"
        >
          <Plus size={16} />
          <span>Cadastrar Novo Local</span>
        </button>
      </div>

      {/* Questionnaire Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            {isCreating ? 'Dados do Novo Estabelecimento' : `Editando: ${selectedEst?.name}`}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome do Local</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Farmácia Popular Central"
                className="w-full p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="mercado">Mercado / Supermercado</option>
                <option value="farmacia">Farmácia</option>
                <option value="hospital">Hospital / Clínica</option>
                <option value="restaurante">Restaurante / Lanchonete</option>
                <option value="cras">CRAS (Assistência Social)</option>
                <option value="creas">CREAS (Proteção Especial)</option>
                <option value="escola">Escola / Biblioteca</option>
                <option value="transporte">Transporte / Estação</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Endereço Completo</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 450, Centro"
                className="w-full p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Descrição do Estabelecimento</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve resumo dos serviços oferecidos..."
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* 40+ Accessibility Questionnaire Sections */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Questionário de Acessibilidade Real
              </h2>
              <p className="text-xs text-slate-500">
                Marque apenas os itens que estão realmente disponíveis e em funcionamento.
              </p>
            </div>
          </div>

          {/* Física */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-brand-700">
              A) Acessibilidade Física e Motora
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <ToggleCheckbox
                label="Rampa de acesso na entrada"
                checked={features.has_ramp}
                onChange={() => handleToggleFeature('has_ramp')}
              />
              <ToggleCheckbox
                label="Inclinação adequada da rampa (< 8.33% NBR 9050)"
                checked={features.ramp_adequate_slope}
                onChange={() => handleToggleFeature('ramp_adequate_slope')}
              />
              <ToggleCheckbox
                label="Presença de corrimãos em ambos os lados"
                checked={features.has_handrails}
                onChange={() => handleToggleFeature('has_handrails')}
              />
              <ToggleCheckbox
                label="Portas com largura adequada (vão livre ≥ 80cm)"
                checked={features.wide_doors}
                onChange={() => handleToggleFeature('wide_doors')}
              />
              <ToggleCheckbox
                label="Corredores espaçosos para manobra de cadeira"
                checked={features.spacious_corridors}
                onChange={() => handleToggleFeature('spacious_corridors')}
              />
              <ToggleCheckbox
                label="Ausência de obstáculos nas passagens"
                checked={features.no_obstacles}
                onChange={() => handleToggleFeature('no_obstacles')}
              />
              <ToggleCheckbox
                label="Elevadores acessíveis com botões em relevo"
                checked={features.accessible_elevator}
                onChange={() => handleToggleFeature('accessible_elevator')}
              />
              <ToggleCheckbox
                label="Sanitário adaptado com barras e giro livre"
                checked={features.adapted_restroom}
                onChange={() => handleToggleFeature('adapted_restroom')}
              />
              <ToggleCheckbox
                label="Vagas de estacionamento PCD sinalizadas"
                checked={features.accessible_parking}
                onChange={() => handleToggleFeature('accessible_parking')}
              />
              <ToggleCheckbox
                label="Balcão e caixa em altura rebaixada"
                checked={features.accessible_counters}
                onChange={() => handleToggleFeature('accessible_counters')}
              />
            </div>
          </div>

          {/* Intelectual */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700">
              B) Acessibilidade Intelectual e Cognitiva
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <ToggleCheckbox
                label="Sinalizações simples e compreensíveis"
                checked={features.simple_signage}
                onChange={() => handleToggleFeature('simple_signage')}
              />
              <ToggleCheckbox
                label="Comunicação em linguagem fácil e sem termos difíceis"
                checked={features.plain_language}
                onChange={() => handleToggleFeature('plain_language')}
              />
              <ToggleCheckbox
                label="Atendimento paciente e preparado para esclarecer dúvidas"
                checked={features.patient_trained_staff}
                onChange={() => handleToggleFeature('patient_trained_staff')}
              />
              <ToggleCheckbox
                label="Orientações e mapas visuais intuitivos"
                checked={features.visual_guidance}
                onChange={() => handleToggleFeature('visual_guidance')}
              />
              <ToggleCheckbox
                label="Permite atendimento acompanhado"
                checked={features.allows_accompanied_service}
                onChange={() => handleToggleFeature('allows_accompanied_service')}
              />
            </div>
          </div>

          {/* Sensorial */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-700">
              C) Acessibilidade Sensorial e Psicossocial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <ToggleCheckbox
                label="Ambiente com baixo nível de ruído"
                checked={features.low_noise_level}
                onChange={() => handleToggleFeature('low_noise_level')}
              />
              <ToggleCheckbox
                label="Iluminação suave e confortável"
                checked={features.comfortable_lighting}
                onChange={() => handleToggleFeature('comfortable_lighting')}
              />
              <ToggleCheckbox
                label="Espaço calmo para descanso e autorregulação"
                checked={features.quiet_rest_space}
                onChange={() => handleToggleFeature('quiet_rest_space')}
              />
              <ToggleCheckbox
                label="Divulgação de horários com menor movimentação"
                checked={features.crowd_level_indicated}
                onChange={() => handleToggleFeature('crowd_level_indicated')}
              />
            </div>
          </div>

          {/* Visual & Auditivo */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700">
              D & E) Visual, Auditivo e Atendimento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <ToggleCheckbox
                label="Piso tátil instalado nas rotas principais"
                checked={features.tactile_paving}
                onChange={() => handleToggleFeature('tactile_paving')}
              />
              <ToggleCheckbox
                label="Sinalização em Braille nas portas e elevadores"
                checked={features.braille_signage}
                onChange={() => handleToggleFeature('braille_signage')}
              />
              <ToggleCheckbox
                label="Atendimento em Libras ou suporte por vídeo"
                checked={features.libras_service}
                onChange={() => handleToggleFeature('libras_service')}
              />
              <ToggleCheckbox
                label="Painéis visuais digitais de chamada"
                checked={features.call_panels}
                onChange={() => handleToggleFeature('call_panels')}
              />
              <ToggleCheckbox
                label="Equipe treinada para acolhimento inclusivo"
                checked={features.inclusive_trained_staff}
                onChange={() => handleToggleFeature('inclusive_trained_staff')}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow transition-colors text-sm disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Gravando...' : 'Salvar Condições de Acessibilidade'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const ToggleCheckbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
}> = ({ label, checked, onChange }) => {
  return (
    <label
      onClick={onChange}
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
        checked
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}}
        className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
      />
      <span className="leading-tight">{label}</span>
    </label>
  );
};
