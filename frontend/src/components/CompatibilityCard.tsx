import React from 'react';
import { PersonalCompatibilityResult } from '../types';
import {
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  User,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface Props {
  compatibility: PersonalCompatibilityResult;
  onOpenSimulation?: () => void;
}

export const CompatibilityCard: React.FC<Props> = ({
  compatibility,
  onOpenSimulation,
}) => {
  const {
    overall_compatibility,
    category_compatibility,
    individual_autonomy_score,
    strengths,
    potential_difficulties,
    unverified_points,
    alone_visit_condition,
    companion_impact_notes,
    summary_message,
  } = compatibility;

  let scoreColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (overall_compatibility < 50) {
    scoreColor = 'text-rose-600 bg-rose-50 border-rose-200';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (overall_compatibility < 75) {
    scoreColor = 'text-amber-600 bg-amber-50 border-amber-200';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  const categoryLabels: Record<string, string> = {
    physical: 'Física & Motora',
    intellectual: 'Intelectual & Cognitiva',
    sensory: 'Sensorial & Psicossocial',
    visual: 'Visual',
    auditory: 'Auditiva',
    service: 'Atendimento Inclusivo',
  };

  return (
    <div className="bg-white border-2 border-brand-200 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
            <Sparkles size={14} className="text-brand-500" />
            Índice de Compatibilidade Pessoal
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Compatibilidade com o seu perfil
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Calculado com base nas necessidades que você selecionou e no modo de acompanhamento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${scoreColor} min-w-[100px]`}>
            <span className="text-3xl font-extrabold tracking-tight">
              {overall_compatibility}%
            </span>
            <span className="text-xs font-semibold text-center uppercase tracking-wider">
              Compatibilidade
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 bg-slate-50 min-w-[90px]">
            <span className="text-2xl font-bold text-slate-800">
              {individual_autonomy_score}%
            </span>
            <span className="text-xs text-slate-600 text-center font-medium">
              Autonomia
            </span>
          </div>
        </div>
      </div>

      {/* Summary Message */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-sm text-slate-800 font-medium leading-relaxed">
          {summary_message}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Condição para ir desacompanhado(a):</span>
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${badgeColor}`}>
            <User size={13} />
            {alone_visit_condition}
          </span>
        </div>
      </div>

      {/* Category Compatibility Breakdown */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Compatibilidade por categoria do seu perfil
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(category_compatibility).map(([key, val]) => {
            const isEvaluated = val !== null;
            return (
              <div
                key={key}
                className={`p-3 rounded-xl border text-sm ${
                  isEvaluated
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="text-xs text-slate-600 truncate font-medium">
                  {categoryLabels[key] || key}
                </div>
                <div className="mt-1 font-bold text-base">
                  {isEvaluated ? (
                    <span className={val >= 70 ? 'text-emerald-600' : val >= 50 ? 'text-amber-600' : 'text-rose-600'}>
                      {val}%
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-slate-500 italic">
                      Não aplicável ao perfil
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Difficulties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-3">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span>O que está adequado</span>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((s, idx) => (
                <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Nenhum recurso específico cadastrado para suas necessidades ativas.
            </p>
          )}
        </div>

        {/* Potential Difficulties */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <span>Dificuldades que podem ser encontradas</span>
          </div>
          {potential_difficulties.length > 0 ? (
            <ul className="space-y-2">
              {potential_difficulties.map((d, idx) => (
                <li key={idx} className="text-xs text-amber-950 flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">⚠️</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-600">
              Nenhuma barreira grave identificada para o seu perfil.
            </p>
          )}
        </div>
      </div>

      {/* Unverified Information Alert */}
      {unverified_points.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm mb-2">
            <HelpCircle size={16} className="text-slate-500" />
            <span>Informações ainda não verificadas presencialmente:</span>
          </div>
          <p className="text-xs text-slate-600 mb-2">
            Recomenda-se confirmar antes de sair de casa:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unverified_points.map((u, idx) => (
              <span
                key={idx}
                className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-300"
              >
                {u}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Companion Impact */}
      {companion_impact_notes.length > 0 && (
        <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-4 text-xs text-sky-950 space-y-1.5">
          <div className="font-bold text-sky-900 flex items-center gap-1.5 mb-1">
            <Users size={16} className="text-sky-700" />
            Acompanhamento & Autonomia:
          </div>
          {companion_impact_notes.map((note, idx) => (
            <p key={idx} className="leading-relaxed">
              {note}
            </p>
          ))}
        </div>
      )}

      {/* Call to action: Visit Simulation */}
      {onOpenSimulation && (
        <div className="pt-2">
          <button
            onClick={onOpenSimulation}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm md:text-base focus:ring-4 focus:ring-brand-300"
          >
            <Compass size={18} />
            <span>Antes de ir, saiba o que esperar (Simulação da Visita)</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
