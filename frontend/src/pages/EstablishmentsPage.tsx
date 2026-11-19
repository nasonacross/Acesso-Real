import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Sparkles,
  Radar
} from 'lucide-react';
import { Establishment, EstablishmentCategory } from '../types';
import { fetchEstablishments } from '../api';
import { useAuth } from '../context/AuthContext';
import { AccessibilityBadge } from '../components/AccessibilityBadge';
import { ProvenanceBadge } from '../components/ProvenanceBadge';

interface Props {
  onNavigate: (tab: string, estId?: string) => void;
}

export const EstablishmentsPage: React.FC<Props> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedCity, setSelectedCity] = useState<string>('radar-bastos-marilia');
  const [sortBy, setSortBy] = useState<'compatibility' | 'score' | 'distance'>('compatibility');

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
      return (b.personal_compatibility_score ?? 0) - (a.personal_compatibility_score ?? 0);
    }
    if (sortBy === 'score') {
      return b.overall_score - a.overall_score;
    }
    return 0;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pesquisa & Comparação de Acessibilidade
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Localize e compare as condições reais de acesso físico, cognitivo, sensorial, visual e auditivo.
          </p>
        </div>

        {/* Radar Bastos ↔ Marília City Filter Bar */}
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-300">
            <Radar size={16} />
            <span>Filtro de Localidade / Radar da Alta Paulista:</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setSelectedCity('radar-bastos-marilia')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCity === 'radar-bastos-marilia'
                  ? 'bg-accent-500 text-slate-950 shadow-md ring-2 ring-accent-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🛰️ Radar Bastos ↔ Marília (Todos)
            </button>

            <button
              onClick={() => setSelectedCity('bastos')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCity === 'bastos'
                  ? 'bg-accent-500 text-slate-950 shadow-md ring-2 ring-accent-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🥚 Bastos
            </button>

            <button
              onClick={() => setSelectedCity('tupa')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCity === 'tupa'
                  ? 'bg-accent-500 text-slate-950 shadow-md ring-2 ring-accent-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🏛️ Tupã
            </button>

            <button
              onClick={() => setSelectedCity('pompeia')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCity === 'pompeia'
                  ? 'bg-accent-500 text-slate-950 shadow-md ring-2 ring-accent-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ⚙️ Pompeia
            </button>

            <button
              onClick={() => setSelectedCity('marilia')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCity === 'marilia'
                  ? 'bg-accent-500 text-slate-950 shadow-md ring-2 ring-accent-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🏙️ Marília
            </button>

            <button
              onClick={() => setSelectedCity('todas')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedCity === 'todas'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Todas as Cidades
            </button>
          </div>
        </div>

        {/* Filters and search input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome, rua, bairro, serviço (ex: Poupatempo, APAE, Hospital)..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500"
            >
              <option value="todos">Todas as Categorias</option>
              <option value="cras">CRAS (Assistência Social)</option>
              <option value="creas">CREAS (Proteção Especial)</option>
              <option value="hospital">Hospitais & Saúde</option>
              <option value="reparticao_publica">Poupatempo & Serviços</option>
              <option value="assistencia_social">APAE & Reabilitação</option>
              <option value="farmacia">Farmácias</option>
              <option value="mercado">Supermercados</option>
              <option value="transporte">Terminais Rodoviários</option>
              <option value="escola">FATEC & Escolas</option>
              <option value="lazer">Bosque & Eventos</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 font-medium"
            >
              <option value="compatibility">Ordenar: Compatibilidade Pessoal</option>
              <option value="score">Ordenar: Nota Geral de Acessibilidade</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Building size={48} className="text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Nenhum estabelecimento encontrado</h3>
          <p className="text-xs text-slate-500">
            Tente selecionar outra cidade do radar ou pesquisar com termos mais amplos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-semibold px-2">
            Exibindo {sortedList.length} estabelecimentos cadastrados e avaliados
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sortedList.map((est) => (
              <div
                key={est.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                {/* Image and Basic Info */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={est.images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'}
                      alt={est.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-900 border border-brand-200">
                        📍 {est.city}
                      </span>
                      <AccessibilityBadge classification={est.classification} size="sm" />
                      <ProvenanceBadge
                        provenance={est.provenance}
                        reliabilityScore={est.reliability_score}
                        isDemo={est.is_demo}
                      />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {est.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {est.description}
                    </p>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span>{est.address} — {est.city}/{est.state}</span>
                    </div>

                    {/* Category score pills breakdown */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        Física: <strong>{est.physical_score}</strong>
                      </span>
                      <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        Intelectual: <strong>{est.intellectual_score}</strong>
                      </span>
                      <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        Sensorial: <strong>{est.sensory_score}</strong>
                      </span>
                      <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        Visual: <strong>{est.visual_score}</strong>
                      </span>
                      <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        Auditiva: <strong>{est.auditory_score}</strong>
                      </span>
                    </div>

                    {est.barriers.length > 0 && (
                      <div className="text-xs bg-rose-50 text-rose-800 border border-rose-200 p-2 rounded-lg font-medium flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                        <span>Alerta: {est.barriers[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compatibility and Actions Panel */}
                <div className="w-full md:w-56 flex flex-col items-center justify-between self-stretch bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 space-y-3">
                  <div className="text-center w-full">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Compatibilidade Individual
                    </span>
                    <span className="text-3xl font-extrabold text-brand-600">
                      {est.personal_compatibility_score !== undefined && est.personal_compatibility_score !== null
                        ? `${est.personal_compatibility_score}%`
                        : `${est.overall_score}%`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Nota Geral: {est.overall_score}/100
                    </span>
                  </div>

                  <div className="w-full space-y-2">
                    <button
                      onClick={() => onNavigate('detail', est.id)}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                    >
                      <span>Ver Avaliação Detalhada</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => onNavigate('simulation', est.id)}
                      className="w-full bg-white hover:bg-slate-100 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200"
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
