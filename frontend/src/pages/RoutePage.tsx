import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Accessibility,
  ArrowRight,
  Route,
  Bus,
  Footprints,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RoutePage: React.FC = () => {
  const { profile } = useAuth();
  const [origin, setOrigin] = useState('Estação Praça da Sé (Metrô)');
  const [destination, setDestination] = useState('CRAS Esperança — Rua das Flores, 450');
  const [isCalculated, setIsCalculated] = useState(true);

  const routeSegments = [
    {
      title: 'Trecho 1: Desembarque e Acesso à Superfície',
      detail: 'Utilize o elevador panorâmico A da estação para acesso ao nível da rua. Plataforma nivelada sem desníveis.',
      status: 'confirmado',
      badge: 'Elevador Operando',
      alert: null,
    },
    {
      title: 'Trecho 2: Calçada da Praça e Travessia Principal',
      detail: 'Faixa de pedestres com rebaixo de meio-fio nivelado (inclinação 8%) e semáforo com sinal sonoro para pedestres cegos.',
      status: 'confirmado',
      badge: 'Travessia Adaptada',
      alert: null,
    },
    {
      title: 'Trecho 3: Passeio Público da Rua das Flores (250m)',
      detail: 'Piso de blocos intertravados com guia direcional tátil contínua até o número 450.',
      status: 'confirmado',
      badge: 'Calçada Regular',
      alert: null,
    },
    {
      title: 'Trecho 4: Entrada do Destino (CRAS Esperança)',
      detail: 'Rampa de acesso frontal com inclinação suave, corrimãos bilaterais e portas duplas com vão livre de 90cm.',
      status: 'confirmado',
      badge: 'Entrada Nivelada',
      alert: null,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-900 to-accent-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
          <Route size={15} />
          <span>Navegação & Trajeto Seguro</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Minha Rota Acessível
        </h1>

        <p className="text-xs sm:text-sm text-brand-100 max-w-2xl leading-relaxed">
          Cálculo de rotas e caminhos entre transportes e serviços levando em consideração condições reais de calçadas, rebaixamentos de guias e rotas táteis.
        </p>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-brand-200 mb-1">
                Ponto de Partida:
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-brand-400" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl bg-white text-slate-900 border-0 focus:ring-2 focus:ring-accent-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-brand-200 mb-1">
                Destino Desejado:
              </label>
              <div className="relative">
                <Navigation size={16} className="absolute left-3 top-3 text-accent-400" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl bg-white text-slate-900 border-0 focus:ring-2 focus:ring-accent-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setIsCalculated(true)}
              className="bg-accent-500 hover:bg-accent-600 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow transition-colors flex items-center gap-1.5"
            >
              <Navigation size={14} />
              <span>Traçar Rota Acessível</span>
            </button>
          </div>
        </div>
      </div>

      {/* Route results */}
      {isCalculated && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
                Itinerário Calculado
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Trajeto Total: 420 metros — Aprox. 6 a 8 minutos
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% de Rotas Niveladas
              </span>
            </div>
          </div>

          {/* Segment list */}
          <div className="space-y-4">
            {routeSegments.map((seg, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{seg.title}</h3>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {seg.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                  {seg.detail}
                </p>

                {seg.alert && (
                  <div className="ml-8 text-xs bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-lg font-medium">
                    ⚠️ {seg.alert}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-950 flex items-start gap-2.5">
            <Info size={18} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5">Distinção de Transparência:</strong>
              As informações de calçada e travessia acima foram verificadas presencialmente por membros da comunidade AcessoReal. Obstáculos temporários (obras ou veículos) podem ocorrer.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
