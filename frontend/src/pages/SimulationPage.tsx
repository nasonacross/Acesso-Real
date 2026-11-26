import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Phone,
  Volume2,
  User,
  Users,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Establishment, VisitSimulationResult } from '../types';
import { fetchEstablishments, fetchSimulation } from '../api';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

interface Props {
  initialEstablishmentId?: string;
  onNavigate: (tab: string, estId?: string) => void;
}

export const SimulationPage: React.FC<Props> = ({ initialEstablishmentId, onNavigate }) => {
  const { profile } = useAuth();
  const { speakText } = useAccessibility();

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedId, setSelectedId] = useState<string>(initialEstablishmentId || '');
  const [simulation, setSimulation] = useState<VisitSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (selectedId && profile) {
      runSimulation(selectedId);
    }
  }, [selectedId, profile?.updated_at]);

  const loadList = async () => {
    try {
      const data = await fetchEstablishments();
      setEstablishments(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runSimulation = async (estId: string) => {
    try {
      setLoading(true);
      const res = await fetchSimulation(estId, profile || undefined);
      setSimulation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadSimulation = () => {
    if (!simulation) return;
    const text = `
      Simulação da visita para ${simulation.establishment_name}.
      Veredito: ${simulation.verdict.can_go_alone ? 'Condições favoráveis para visita independente.' : 'Recomenda-se atenção redobrada ou presença de acompanhante.'}
      Motivo: ${simulation.verdict.main_reason}.
      ${simulation.steps.map((s) => `${s.title}: ${s.description}`).join(' ')}
    `;
    speakText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Top Banner */}
      <div className="mesh-hero text-white p-6 sm:p-8 rounded-[2rem] shadow-elevated border border-white/10 space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
          <Compass size={15} />
          <span>Antes de ir, saiba o que esperar</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Simulador de Experiência & Autonomia
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Nossa inteligência sintetiza cada etapa da sua ida — da calçada aos banheiros e atendimento — para que você tome uma decisão informada e sem surpresas.
        </p>

        {/* Place Selector */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-brand-200 mb-1">
            Selecione o estabelecimento para simular:
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full sm:w-auto text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl bg-white text-slate-900 border-0 focus:ring-4 focus:ring-brand-400"
          >
            {establishments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 space-y-4">
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-44 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      ) : simulation ? (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div
            className={`p-6 rounded-3xl border-2 shadow-sm ${
              simulation.verdict.can_go_alone
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                  Veredito da Simulação
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold">
                  {simulation.verdict.can_go_alone
                    ? 'Condições Favoráveis para Visita Desacompanhada'
                    : 'Recomendação de Atenção ou Presença de Acompanhante'}
                </h2>
              </div>

              <button
                onClick={handleReadSimulation}
                className="inline-flex items-center gap-1.5 bg-white text-slate-800 font-bold px-4 py-2 rounded-xl text-xs shadow-sm hover:bg-slate-50 transition-colors shrink-0"
              >
                <Volume2 size={16} className="text-brand-600" />
                <span>Ouvir Simulação</span>
              </button>
            </div>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed font-medium">
              {simulation.verdict.main_reason}
            </p>
          </div>

          {/* Step by step journey */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Passo a Passo da Sua Visita ao Local
            </h3>

            <div className="space-y-4">
              {simulation.steps.map((step, idx) => {
                const isOk = step.status === 'adequado';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
                      isOk ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/60 border-amber-200'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                      {isOk ? (
                        <CheckCircle2 size={20} className="text-emerald-600" />
                      ) : (
                        <AlertTriangle size={20} className="text-amber-600" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isOk
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {step.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Phone Confirmation Checklist */}
          <div className="bg-sky-50 border border-sky-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sky-950 font-bold text-base">
              <Phone size={20} className="text-sky-700" />
              <h3>Antes de sair de casa: Perguntas recomendadas por telefone</h3>
            </div>
            <p className="text-xs text-sky-900 leading-relaxed">
              Para maior segurança e previsibilidade da sua rotina, caso pretenda ir em horário de pico ou sozinho(a), confirme estas informações:
            </p>

            <ul className="space-y-2 text-xs text-sky-950">
              {simulation.verdict.key_phone_questions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-sky-100">
                  <span className="font-bold text-sky-600">❓</span>
                  <span className="font-medium">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};
