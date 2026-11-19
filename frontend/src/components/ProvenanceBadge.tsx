import React from 'react';
import { ProvenanceType } from '../types';
import { UserCheck, Building, Sparkles, MapPinCheck, FileCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  provenance: ProvenanceType;
  reliabilityScore?: number;
  lastUpdate?: string;
  isDemo?: boolean;
}

export const ProvenanceBadge: React.FC<Props> = ({
  provenance,
  reliabilityScore,
  lastUpdate,
  isDemo = false,
}) => {
  const configs: Record<
    ProvenanceType,
    { label: string; icon: React.ComponentType<{ size: number; className?: string }>; color: string }
  > = {
    presencial: {
      label: 'Verificado Presencialmente',
      icon: MapPinCheck,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    documentada: {
      label: 'Confirmado por Laudo / Doc.',
      icon: FileCheck,
      color: 'bg-blue-50 text-blue-800 border-blue-300',
    },
    usuario: {
      label: 'Informado por Usuário',
      icon: UserCheck,
      color: 'bg-sky-50 text-sky-800 border-sky-300',
    },
    declarada: {
      label: 'Declarado pelo Estabelecimento',
      icon: Building,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    },
    ia: {
      label: 'Analisado por IA (Indício Visual)',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-800 border-purple-300',
    },
  };

  const config = configs[provenance] || configs.usuario;
  const Icon = config.icon;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isDemo && (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
          Dados Demonstrativos
        </span>
      )}

      <span
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium ${config.color}`}
        title={`Origem do dado: ${config.label}`}
      >
        <Icon size={14} className="shrink-0" />
        <span>{config.label}</span>
      </span>

      {reliabilityScore !== undefined && (
        <span
          className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
          title="Nível de confiabilidade baseado em verificações cruzadas"
        >
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>Confiabilidade: <strong>{reliabilityScore}%</strong></span>
        </span>
      )}

      {lastUpdate && (
        <span className="text-xs text-slate-500">
          Atualizado em: {new Date(lastUpdate).toLocaleDateString('pt-BR')}
        </span>
      )}
    </div>
  );
};
