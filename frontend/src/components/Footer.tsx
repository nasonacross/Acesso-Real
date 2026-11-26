import React from 'react';
import { Accessibility, Heart, MapPin, ShieldCheck } from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white shadow-glow-brand">
                <Accessibility size={18} />
              </div>
              <span className="font-display text-xl font-extrabold text-white tracking-tight">
                Acesso<span className="text-accent-400">Real</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Plataforma inteligente de acessibilidade universal com foco em Tupã-SP e região. Calculamos a compatibilidade real de espaços públicos, estabelecimentos e assistências sociais para cada necessidade individual.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
              <ShieldCheck size={14} className="text-accent-400" />
              <span>WCAG 2.2 Nível AA • NBR 9050 • LGPD</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <span className="font-display font-bold text-white text-xs uppercase tracking-wider block">
              Navegação Rápida
            </span>
            <ul className="space-y-2">
              {[
                { id: 'home', label: 'Página Inicial' },
                { id: 'map', label: 'Mapa Interativo (Tupã)' },
                { id: 'route', label: 'Rotas a partir da FADAP' },
                { id: 'establishments', label: 'Catálogo de Locais' },
                { id: 'profile', label: 'Meu Perfil Acessível' },
                { id: 'ai', label: 'Análise Visual com IA' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="hover:text-accent-400 transition-colors font-medium"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Ethics & Location */}
          <div className="space-y-3">
            <span className="font-display font-bold text-white text-xs uppercase tracking-wider block">
              Base de Referência
            </span>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <MapPin size={13} className="text-accent-400" />
                <span>Faculdade FADAP / FAP</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Rua Mandaguaris, 1010 — Centro, Tupã/SP. Ponto de partida padrão para rotas acessíveis no município.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} AcessoReal — Plataforma Inteligente de Acessibilidade Universal.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Inclusão social feita com rigor e</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 inline" />
            <span>para todas as pessoas.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
