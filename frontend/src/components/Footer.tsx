import React from 'react';
import { Accessibility, ShieldCheck, Heart } from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center text-white">
                <Accessibility size={18} />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Acesso<span className="text-accent-400">Real</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Plataforma inteligente de avaliação da acessibilidade REAL de espaços coletivos, calculando a compatibilidade individual de acordo com deficiências, necessidades sensoriais e acompanhamento.
            </p>
            <div className="text-[11px] text-slate-500">
              Desenvolvido com diretrizes WCAG 2.2 Nível AA • Total respeito à LGPD.
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">
              Navegação Rápida
            </span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Página Inicial
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">
                  Mapa Interativo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('establishments')} className="hover:text-white transition-colors">
                  Pesquisa & Catálogo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('profile')} className="hover:text-white transition-colors">
                  Meu Perfil de Necessidades
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('route')} className="hover:text-white transition-colors">
                  Minha Rota Acessível
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai')} className="hover:text-white transition-colors">
                  Análise de Imagens com IA
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Ethics */}
          <div className="space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">
              Compromisso Técnico
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• Baseado nas normas NBR 9050 / ABNT</li>
              <li>• Análises por IA sempre identificadas como indícios</li>
              <li>• Dados de saúde protegidos e confidenciais</li>
              <li>• Informações verificadas com transparência de origem</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} AcessoReal — Plataforma Aberta de Acessibilidade Universal.
          </div>
          <div className="flex items-center gap-1">
            <span>Inclusão social feita com rigor e</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 inline" />
            <span>para todas as pessoas.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
