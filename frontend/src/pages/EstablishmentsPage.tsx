import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Building,
  ArrowRight,
  AlertTriangle,
  Compass,
  Navigation,
  Radar
} from 'lucide-react';
import { Establishment } from '../types';
import { fetchEstablishments } from '../api';
import { useAuth } from '../context/AuthContext';
import { AccessibilityBadge } from '../components/AccessibilityBadge';
import { ProvenanceBadge } from '../components/ProvenanceBadge';

interface Props {
  onNavigate: (tab: string, estId?: string) => void;
  initialSearch?: string;
  initialCategory?: string;
}

export const EstablishmentsPage: React.FC<Props> = ({
  onNavigate,
  initialSearch = '',
  initialCategory = 'todos',
}) => {
  const { profile } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCity, setSelectedCity] = useState<string>('tupa');
  const [sortBy, setSortBy] = useState<'compatibility' | 'score'>('compatibility');

  useEffect(() => {
    if (initialSearch !== undefined) setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory !== undefined) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    loadList();
  }, [search, selectedCategory, selectedCity, profile?.user_id]);

  const loadList = async () => {
    try {
      setLoading(true);
      const isCorridor = selectedCity === 'radar-bastos-marilia';
      const cityFilter = isCorridor || selectedCity === 'todas' ? undefined : selectedCity;

      const data = await fetchEstablishments({
        q: search || undefined,
        category: selectedCategory !== 'todos' ? selectedCategory : undefined,
        city: cityFilter,
        corridor: isCorridor ? 'bastos-marilia' : undefined,
        userId: profile?.user_id,
      });
      setEstablishments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedList = [...establishments].sort((a, b) => {
    if (sortBy === 'compatibility') {
      return (b.personal_compatibility_score ?? b.overall_score) - (a.personal_compatibility_score ?? a.overall_score);
    }
    return b.overall_score - a.overall_score;
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Header & Filters */}
      <div className="surface-card p-6 sm:p-7 space-y-5">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-600">
            Catálogo Verificado
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pesquisa & Comparação de Acessibilidade
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Compare condições reais de acesso físico, cognitivo, sensorial, visual e auditivo em Tupã e região.
          </p>
        </div>

        {/* City Selector */}
        <div className="mesh-hero text-white p-4 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-300">
            <Radar size={15} />
            <span>Filtrar por Cidade:</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: 'tupa', label: '🏛️ Tupã (FADAP & Assistências)' },
              { id: 'bastos', label: '🥚 Bastos' },
              { id: 'pompeia', label: '⚙️ Pompeia' },
              { id: 'marilia', label: '🏙️ Marília' },
              { id: 'radar-bastos-marilia', label: '🛰️ Toda a Região' },
              { id: 'todas', label: 'Todas as Cidades' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  selectedCity === c.id
                    ? 'bg-accent-400 text-slate-950 shadow-md'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Selects */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar FADAP, CRAS, CREAS, APAE, Poupatempo, Hospital..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none text-xs sm:text-sm py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700"
            >
              <option value="todos">Todas as Categorias</option>
              <option value="cras">CRAS (Assistência Social)</option>
              <option value="creas">CREAS (Proteção Especial)</option>
              <option value="assistencia_social">APAE & Secretaria Social</option>
              <option value="escola">FADAP & Ensino</option>
              <option value="hospital">Hospitais & UPA</option>
              <option value="reparticao_publica">Poupatempo & Serviços</option>
              <option value="farmacia">Farmácias & Centro</option>
              <option value="mercado">Supermercados</option>
              <option value="transporte">Terminais Rodoviários</option>
              <option value="lazer">Praças & Parques</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 sm:flex-none text-xs sm:text-sm py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700"
            >
              <option value="compatibility">Ordenar: Compatibilidade</option>
              <option value="score">Ordenar: Nota Geral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-200/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : sortedList.length === 0 ? (
        <div className="surface-card text-center py-16 p-8 space-y-3">
          <Building size={44} className="text-slate-300 mx-auto" />
          <h3 className="text-lg font-extrabold text-slate-800">Nenhum local encontrado</h3>
          <p className="text-xs text-slate-500">
            Tente alterar a categoria, limpar a busca ou escolher outra cidade.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('todos');
              setSelectedCity('tupa');
            }}
            className="text-xs font-bold text-brand-600 underline"
          >
            Redefinir filtros para Tupã
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-bold px-1">
            Exibindo {sortedList.length} locais avaliados
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sortedList.map((est) => (
              <div
                key={est.id}
                className="surface-card hover:border-brand-300 hover:shadow-elevated transition-all duration-200 p-5 flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div
                    onClick={() => onNavigate('detail', est.id)}
                    className="w-full sm:w-48 h-40 rounded-2xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer group"
                  >
                    <img
                      src={est.images[0] || '/images/establishments/est_poupatempo.jpg'}
                      alt={est.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200/80">
                        📍 {est.city}
                      </span>
                      <AccessibilityBadge classification={est.classification} size="sm" />
                      <ProvenanceBadge
                        provenance={est.provenance}
                        reliabilityScore={est.reliability_score}
                        isDemo={est.is_demo}
                      />
                    </div>

                    <h3
                      onClick={() => onNavigate('detail', est.id)}
                      className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-brand-600 cursor-pointer leading-snug transition-colors"
                    >
                      {est.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {est.description}
                    </p>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin size={14} className="text-brand-600 shrink-0" />
                      <span>{est.address} — {est.city}/{est.state}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'Física', val: est.physical_score },
                        { label: 'Intelectual', val: est.intellectual_score },
                        { label: 'Sensorial', val: est.sensory_score },
                        { label: 'Visual', val: est.visual_score },
                        { label: 'Auditiva', val: est.auditory_score },
                      ].map((s) => (
                        <span key={s.label} className="text-[11px] bg-slate-100/90 px-2.5 py-0.5 rounded-full text-slate-700 font-medium">
                          {s.label}: <strong className="text-slate-900">{s.val}</strong>
                        </span>
                      ))}
                    </div>

                    {est.barriers.length > 0 && (
                      <div className="text-xs bg-rose-50 text-rose-800 border border-rose-200/80 p-2.5 rounded-xl font-medium flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                        <span>Alerta: {est.barriers[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Panel */}
                <div className="w-full md:w-56 flex flex-col items-center justify-between self-stretch bg-slate-50/90 p-4 rounded-2xl border border-slate-200/70 shrink-0 space-y-3">
                  <div className="text-center w-full">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Compatibilidade Pessoal
                    </span>
                    <span className="font-display text-3xl font-extrabold text-brand-600">
                      {est.personal_compatibility_score !== undefined && est.personal_compatibility_score !== null
                        ? `${est.personal_compatibility_score}%`
                        : `${est.overall_score}%`}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Nota Geral: {est.overall_score}/100
                    </span>
                  </div>

                  <div className="w-full space-y-2">
                    <button
                      onClick={() => onNavigate('detail', est.id)}
                      className="w-full bg-slate-900 hover:bg-brand-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>Ver Avaliação</span>
                      <ArrowRight size={14} />
                    </button>

                    {est.city.toLowerCase() === 'tupã' && est.id !== 'est_fadap_tupa' && (
                      <button
                        onClick={() => onNavigate('route', est.id)}
                        className="w-full bg-accent-500 hover:bg-accent-400 text-slate-950 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Navigation size={13} />
                        <span>Rota da FADAP</span>
                      </button>
                    )}

                    <button
                      onClick={() => onNavigate('simulation', est.id)}
                      className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200/80 transition-colors"
                    >
                      <Compass size={14} />
                      <span>Simular Visita</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
