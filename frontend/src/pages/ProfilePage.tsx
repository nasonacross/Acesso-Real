import React, { useState } from 'react';
import {
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  Save,
  HelpCircle,
  Accessibility,
  Eye,
  Ear,
  Brain,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState<UserProfile | null>(profile);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync if profile loads asynchronously
  React.useEffect(() => {
    if (profile && !formData) {
      setFormData(profile);
    }
  }, [profile]);

  if (loading || !formData) {
    return (
      <div className="py-12 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const handleCheckboxChange = (
    section: 'physical' | 'intellectual' | 'sensory' | 'visual' | 'auditory' | 'other',
    field: string,
    value: boolean
  ) => {
    setFormData({
      ...formData,
      [section]: {
        ...(formData[section] as any),
        [field]: value,
      },
    });
  };

  const handleAccompanimentChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      accompaniment: {
        ...formData.accompaniment,
        [field]: value,
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header and LGPD Notice */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <Accessibility size={15} />
          <span>Configuração de Compatibilidade Individual</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Meu Perfil de Necessidades & Acompanhamento
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Informe quais barreiras você enfrenta e quais recursos são necessários para que o AcessoReal calcule sua <strong>compatibilidade personalizada</strong> com cada local.
        </p>

        {/* LGPD Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Privacidade & Conformidade com a LGPD:</span>
            <p className="leading-relaxed">
              O preenchimento é 100% voluntário. <strong>Não exigimos laudos médicos, diagnósticos clínicos ou documentos comprobatórios.</strong> Você tem controle total para editar, limpar ou escolher quais itens serão considerados nas pesquisas a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION B: OPÇÃO DE ACOMPANHAMENTO (Crucial) */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-900 font-extrabold text-lg">
            <Users size={22} className="text-brand-600" />
            <h2>Você pretende ir acompanhado(a) ou sozinho(a)?</h2>
          </div>
          <p className="text-xs text-slate-600">
            Esta escolha calibra os cálculos de autonomia e o nível de esforço exigido no estabelecimento.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { id: 'alone', title: '1. Vou sozinho(a)', desc: 'Prioriza autonomia plena, orientação fácil e assistência da equipe local.' },
              { id: 'accompanied', title: '2. Vou acompanhado(a)', desc: 'Permite informar o apoio que seu acompanhante prestará.' },
              { id: 'undecided', title: '3. Ainda não sei', desc: 'Avalia tanto cenários autônomos quanto assistidos.' },
            ].map((option) => (
              <label
                key={option.id}
                className={`flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.accompaniment.status === option.id
                    ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{option.title}</span>
                    <input
                      type="radio"
                      name="accompaniment_status"
                      checked={formData.accompaniment.status === option.id}
                      onChange={() => handleAccompanimentChange('status', option.id)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* If Accompanied, extra details */}
          {formData.accompaniment.status === 'accompanied' && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Detalhes do Auxílio do Acompanhante:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <CheckboxInput
                  label="O acompanhante ajudará na locomoção física (empurrar cadeira/subir rampas)"
                  checked={formData.accompaniment.helps_mobility}
                  onChange={(v) => handleAccompanimentChange('helps_mobility', v)}
                />
                <CheckboxInput
                  label="O acompanhante ajudará na comunicação e atendimento"
                  checked={formData.accompaniment.helps_communication}
                  onChange={(v) => handleAccompanimentChange('helps_communication', v)}
                />
                <CheckboxInput
                  label="O acompanhante auxiliará nas atividades (compras, pagamentos, alcance)"
                  checked={formData.accompaniment.helps_activities}
                  onChange={(v) => handleAccompanimentChange('helps_activities', v)}
                />
                <CheckboxInput
                  label="Acompanhamento integral durante todo o percurso"
                  checked={formData.accompaniment.full_time_escort}
                  onChange={(v) => handleAccompanimentChange('full_time_escort', v)}
                />
              </div>

              <div className="text-[11px] text-slate-500 italic pt-1">
                * Importante: A presença do acompanhante não substitui a responsabilidade do local em ser acessível.
              </div>
            </div>
          )}
        </section>

        {/* 1. Deficiências Físicas e Motoras */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <span className="text-xl">♿</span>
            <h2>Deficiências Físicas e Motoras</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <CheckboxInput
              label="Utilizo cadeira de rodas (manual ou motorizada)"
              checked={formData.physical.wheelchair}
              onChange={(v) => handleCheckboxChange('physical', 'wheelchair', v)}
            />
            <CheckboxInput
              label="Utilizo muletas"
              checked={formData.physical.crutches}
              onChange={(v) => handleCheckboxChange('physical', 'crutches', v)}
            />
            <CheckboxInput
              label="Utilizo bengala de apoio físico"
              checked={formData.physical.cane}
              onChange={(v) => handleCheckboxChange('physical', 'cane', v)}
            />
            <CheckboxInput
              label="Possuo mobilidade reduzida / marcha lenta"
              checked={formData.physical.reduced_mobility}
              onChange={(v) => handleCheckboxChange('physical', 'reduced_mobility', v)}
            />
            <CheckboxInput
              label="Dificuldade para subir ou descer escadas"
              checked={formData.physical.stair_difficulty}
              onChange={(v) => handleCheckboxChange('physical', 'stair_difficulty', v)}
            />
            <CheckboxInput
              label="Dificuldade para caminhar longas distâncias"
              checked={formData.physical.long_distance_difficulty}
              onChange={(v) => handleCheckboxChange('physical', 'long_distance_difficulty', v)}
            />
            <CheckboxInput
              label="Necessito estritamente de rampas ou elevadores"
              checked={formData.physical.needs_ramps_elevators}
              onChange={(v) => handleCheckboxChange('physical', 'needs_ramps_elevators', v)}
            />
          </div>
        </section>

        {/* 2. Deficiências Intelectuais e Cognitivas */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Brain size={20} className="text-purple-600" />
            <h2>Deficiências Intelectuais e Cognitivas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <CheckboxInput
              label="Deficiência intelectual"
              checked={formData.intellectual.intellectual_disability}
              onChange={(v) => handleCheckboxChange('intellectual', 'intellectual_disability', v)}
            />
            <CheckboxInput
              label="Dificuldade de compreensão de informações complexas ou burocráticas"
              checked={formData.intellectual.complex_info_difficulty}
              onChange={(v) => handleCheckboxChange('intellectual', 'complex_info_difficulty', v)}
            />
            <CheckboxInput
              label="Dificuldade de orientação espacial em layouts extensos"
              checked={formData.intellectual.spatial_orientation_difficulty}
              onChange={(v) => handleCheckboxChange('intellectual', 'spatial_orientation_difficulty', v)}
            />
            <CheckboxInput
              label="Necessidade de instruções simples, diretas e objetivas"
              checked={formData.intellectual.needs_simple_instructions}
              onChange={(v) => handleCheckboxChange('intellectual', 'needs_simple_instructions', v)}
            />
            <CheckboxInput
              label="Necessidade de auxílio paciente para realizar certas atividades"
              checked={formData.intellectual.needs_assistance_tasks}
              onChange={(v) => handleCheckboxChange('intellectual', 'needs_assistance_tasks', v)}
            />
          </div>
        </section>

        {/* 3. Condições Psicossociais e Neurodivergências */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <span className="text-xl">♾️</span>
            <h2>Condições Psicossociais e Neurodivergências</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <CheckboxInput
              label="Autismo (Transtorno do Espectro Autista - TEA)"
              checked={formData.sensory.autism}
              onChange={(v) => handleCheckboxChange('sensory', 'autism', v)}
            />
            <CheckboxInput
              label="TDAH (Transtorno do Déficit de Atenção e Hiperatividade)"
              checked={formData.sensory.adhd}
              onChange={(v) => handleCheckboxChange('sensory', 'adhd', v)}
            />
            <CheckboxInput
              label="Síndrome de Down"
              checked={formData.sensory.down_syndrome}
              onChange={(v) => handleCheckboxChange('sensory', 'down_syndrome', v)}
            />
            <CheckboxInput
              label="Dificuldades ou ansiedade em interação social intensa"
              checked={formData.sensory.social_interaction_difficulty}
              onChange={(v) => handleCheckboxChange('sensory', 'social_interaction_difficulty', v)}
            />
            <CheckboxInput
              label="Hipersensibilidade a ruídos, sons altos ou eco"
              checked={formData.sensory.noise_sensitivity}
              onChange={(v) => handleCheckboxChange('sensory', 'noise_sensitivity', v)}
            />
            <CheckboxInput
              label="Sensibilidade a iluminação forte ou luzes estroboscópicas"
              checked={formData.sensory.light_sensitivity}
              onChange={(v) => handleCheckboxChange('sensory', 'light_sensitivity', v)}
            />
            <CheckboxInput
              label="Desconforto severo em ambientes com grande aglomeração"
              checked={formData.sensory.crowded_spaces_difficulty}
              onChange={(v) => handleCheckboxChange('sensory', 'crowded_spaces_difficulty', v)}
            />
            <CheckboxInput
              label="Necessidade de espaços tranquilos de pausa e autorregulação"
              checked={formData.sensory.needs_quiet_spaces}
              onChange={(v) => handleCheckboxChange('sensory', 'needs_quiet_spaces', v)}
            />
          </div>
        </section>

        {/* 4. Deficiências Visuais */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Eye size={20} className="text-blue-600" />
            <h2>Deficiências Visuais</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <CheckboxInput
              label="Cegueira total"
              checked={formData.visual.blindness}
              onChange={(v) => handleCheckboxChange('visual', 'blindness', v)}
            />
            <CheckboxInput
              label="Baixa visão / visão subnormal"
              checked={formData.visual.low_vision}
              onChange={(v) => handleCheckboxChange('visual', 'low_vision', v)}
            />
            <CheckboxInput
              label="Dificuldade de leitura em placas pequenas ou sem contraste"
              checked={formData.visual.reading_difficulty}
              onChange={(v) => handleCheckboxChange('visual', 'reading_difficulty', v)}
            />
            <CheckboxInput
              label="Necessidade de piso tátil direcional e avisos sonoros"
              checked={formData.visual.needs_tactile_audio_signage}
              onChange={(v) => handleCheckboxChange('visual', 'needs_tactile_audio_signage', v)}
            />
          </div>
        </section>

        {/* 5. Deficiências Auditivas */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Ear size={20} className="text-teal-600" />
            <h2>Deficiências Auditivas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <CheckboxInput
              label="Surdez"
              checked={formData.auditory.deafness}
              onChange={(v) => handleCheckboxChange('auditory', 'deafness', v)}
            />
            <CheckboxInput
              label="Perda auditiva parcial / uso de aparelho auditivo"
              checked={formData.auditory.partial_hearing_loss}
              onChange={(v) => handleCheckboxChange('auditory', 'partial_hearing_loss', v)}
            />
            <CheckboxInput
              label="Necessidade de comunicação em Libras (Língua Brasileira de Sinais)"
              checked={formData.auditory.needs_libras}
              onChange={(v) => handleCheckboxChange('auditory', 'needs_libras', v)}
            />
            <CheckboxInput
              label="Necessidade de chamadas e informações visuais em tela"
              checked={formData.auditory.needs_visual_information}
              onChange={(v) => handleCheckboxChange('auditory', 'needs_visual_information', v)}
            />
          </div>
        </section>

        {/* 6. Outras Necessidades */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Sparkles size={20} className="text-amber-500" />
            <h2>Outras Necessidades Específicas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <CheckboxInput
              label="Dificuldade temporária de locomoção (fratura, pós-cirúrgico, gestação)"
              checked={formData.other.temporary_mobility_issue}
              onChange={(v) => handleCheckboxChange('other', 'temporary_mobility_issue', v)}
            />
            <CheckboxInput
              label="Necessidade prioritária assegurada por lei"
              checked={formData.other.needs_priority_service}
              onChange={(v) => handleCheckboxChange('other', 'needs_priority_service', v)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descreva outras necessidades particulares (opcional):
            </label>
            <input
              type="text"
              value={formData.other.custom_needs}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  other: { ...formData.other, custom_needs: e.target.value },
                })
              }
              placeholder="Ex: Não posso permanecer em pé em filas por mais de 5 minutos..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </section>

        {/* Save Bar */}
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-300 shadow-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {savedSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={16} /> Perfil e modo de visita salvos com sucesso!
              </span>
            ) : (
              <span>Seus dados são salvos com segurança no seu dispositivo.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Salvando...' : 'Salvar Meu Perfil'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const CheckboxInput: React.FC<{
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}> = ({ label, checked, onChange }) => {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
        checked
          ? 'bg-brand-50/70 border-brand-300 text-brand-950 font-medium'
          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 mt-0.5 text-brand-600 rounded border-slate-300 focus:ring-brand-500 shrink-0"
      />
      <span className="leading-tight">{label}</span>
    </label>
  );
};
