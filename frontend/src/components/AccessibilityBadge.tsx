import React from 'react';
import { AccessibilityClassification } from '../types';
import { ShieldCheck, AlertTriangle, AlertCircle, XCircle, HelpCircle } from 'lucide-react';

interface Props {
  classification: AccessibilityClassification;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AccessibilityBadge: React.FC<Props> = ({
  classification,
  showIcon = true,
  size = 'md',
}) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = HelpCircle;

  switch (classification) {
    case 'Acessibilidade bem avaliada':
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300';
      Icon = ShieldCheck;
      break;
    case 'Acessibilidade parcial':
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300';
      Icon = AlertTriangle;
      break;
    case 'Acessibilidade limitada':
      colorStyles = 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300';
      Icon = AlertCircle;
      break;
    case 'Acessibilidade insuficiente':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300';
      Icon = XCircle;
      break;
    case 'Informações insuficientes para avaliação':
    default:
      colorStyles = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
      Icon = HelpCircle;
      break;
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm md:text-base px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 20,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${colorStyles} ${sizeStyles}`}
      role="status"
      aria-label={`Classificação de acessibilidade: ${classification}`}
    >
      {showIcon && <Icon size={iconSizes} aria-hidden="true" className="shrink-0" />}
      <span>{classification}</span>
    </span>
  );
};
