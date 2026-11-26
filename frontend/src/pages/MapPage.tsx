import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  ArrowRight,
  Radar,
  GraduationCap,
  ChevronLeft
} from 'lucide-react';
import { Establishment } from '../types';
import { fetchEstablishments } from '../api';
import { useAuth } from '../context/AuthContext';
import { MapComponent } from '../components/MapComponent';
import { AccessibilityBadge } from '../components/AccessibilityBadge';

interface Props {
  onNavigate: (tab: string, estId?: string) => void;
}

const FADAP_COORDS: [number, number] = [-21.94148, -50.51442];

export const MapPage: React.FC<Props> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedCity, setSelectedCity] = useState<string>('tupa');

  const [filterWheelchair, setFilterWheelchair] = useState(false);
  const [filterLibras, setFilterLibras] = useState(false);
  const [filterSensory, setFilterSensory] = useState(false);
  const [filterRestroom, setFilterRestroom] = useState(false);
  const [filterBraille, setFilterBraille] = useState(false);

  // Initial location strictly fixed on Faculdade FADAP (Tupã - SP)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-21.9360, -50.5144]);
  const [mapZoom, setMapZoom] = useState<number>(14);
  const [selectedEst, setSelectedEst] = useState<Establishment | null>(null);

  useEffect(() => {
    loadEstablishments();
  }, [
    search,
    selectedCategory,
    selectedCity,
    filterWheelchair,
    filterLibras,
    filterSensory,
    filterRestroom,
    filterBraille,
    profile?.user_id,
  ]);

  const loadEstablishments = async () => {
    try {
      setLoading(true);
      const isCorridor = selectedCity === 'radar-bastos-marilia';
      const cityFilter = isCorridor || selectedCity === 'todas' ? undefined : selectedCity;

      const data = await fetchEstablishments({
        q: search || undefined,
        category: selectedCategory !== 'todos' ? selectedCategory : undefined,
        city: cityFilter,
        corridor: isCorridor ? 'bastos-marilia' : undefined,
        wheelchair: filterWheelchair,
        libras: filterLibras,
        sensory: filterSensory,
        restroom: filterRestroom,
        braille: filterBraille,
        userId: profile?.user_id,
      });
      setEstablishments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCityTarget = (cityKey: string) => {
    setSelectedCity(cityKey);
    setSelectedEst(null);
    switch (cityKey) {
      case 'tupa':
        setMapCenter([-21.9360, -50.5144]);
        setMapZoom(14);
        break;
      case 'bastos':
        setMapCenter([-21.9221, -50.7342]);
        setMapZoom(14);
        break;
      case 'pompeia':
        setMapCenter([-22.1090, -50.1710]);
        setMapZoom(14);
        break;
      case 'marilia':
        setMapCenter([-22.2175, -49.9480]);
        setMapZoom(13);
        break;
      case 'radar-bastos-marilia':
      default:
        setMapCenter([-22.06, -50.35]);
        setMapZoom(10);
        break;
    }
  };

  const handleCenterFadap = () => {
    setSelectedCity('tupa');
    setMapCenter(FADAP_COORDS);
    setMapZoom(16);
    const fadap = establishments.find((e) => e.id === 'est_fadap_tupa');
    if (fadap) setSelectedEst(fadap);
  };

  return (
    <div className="space-y-5 pb-16 animate-fade-in">
      {/* Modern Top Map Header */}
      <div className="mesh-hero text-white p-5 sm:p-6 rounded-[2rem] shadow-elevated border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-accent-300 border border-white/15">
              <Radar size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight">
                Mapa Interativo de Acessibilidade
              </h1>
              <p className="text-xs text-slate-300">
                Localização inicial: <strong>Faculdade FADAP / FAP (Tupã - SP)</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleCenterFadap}
            className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-glow-accent transition-all hover:-translate-y-0.5 shrink-0"
          >
            <GraduationCap size={16} />
            <span>Centralizar na FADAP (Tupã)</span>
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
          {[
            { id: 'tupa', label: '🏛️ Tupã (FADAP & Assistências)' },
            { id: 'bastos', label: '🥚 Bastos' },
            { id: 'pompeia', label: '⚙️ Pompeia' },
            { id: 'marilia', label: '🏙️ Marília' },
            { id: 'radar-bastos-marilia', label: '🛰️ Toda a Região' },
            { id: 'todas', label: 'Todos os Locais' },
          ].map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelectCityTarget(city.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCity === city.id
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="surface-card p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por FADAP, CRAS, CREAS, APAE, Poupatempo, Santa Casa..."
              className="w-full text-xs md:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs md:text-sm py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700"
          >
            <option value="todos">Todas as Categorias</option>
            <option value="cras">CRAS (Assistência Social)</option>
            <option value="creas">CREAS (Proteção Especial)</option>
            <option value="assistencia_social">APAE & Secretaria Social</option>
            <option value="escola">Faculdade FADAP & Ensino</option>
            <option value="hospital">Hospitais & UPA</option>
            <option value="reparticao_publica">Poupatempo & Serviços</option>
            <option value="farmacia">Farmácias & Centro</option>
            <option value="mercado">Supermercados</option>
            <option value="transporte">Terminais Rodoviários</option>
            <option value="lazer">Praças & Parques</option>
          </select>
        </div>

        {/* Accessibility Feature Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1">Recursos:</span>
          {[
            { active: filterWheelchair, toggle: () => setFilterWheelchair(!filterWheelchair), label: '♿ Cadeirantes' },
            { active: filterRestroom, toggle: () => setFilterRestroom(!filterRestroom), label: '🚻 Banheiro Adaptado' },
            { active: filterLibras, toggle: () => setFilterLibras(!filterLibras), label: '🤟 Libras' },
            { active: filterSensory, toggle: () => setFilterSensory(!filterSensory), label: '🎧 Conforto Sensorial' },
            { active: filterBraille, toggle: () => setFilterBraille(!filterBraille), label: '🦯 Braille / Piso Tátil' },
          ].map((f, idx) => (
            <button
              key={idx}
              onClick={f.toggle}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                f.active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Map & Inspector Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Container */}
        <div className="lg:col-span-2 h-[440px] sm:h-[540px] lg:h-[640px] relative">
          <MapComponent
            establishments={establishments}
            center={mapCenter}
            zoom={mapZoom}
            userLocation={FADAP_COORDS}
            selectedId={selectedEst?.id}
            onSelectEstablishment={(est) => {
              setSelectedEst(est);
              setMapCenter([est.lat, est.lng]);
              setMapZoom(15);
            }}
          />

          {/* Floating Legend */}
          <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-md text-[11px] space-y-1.5 hidden sm:block">
            <span className="font-extrabold text-slate-800 block text-xs mb-1">Classificação:</span>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bem Avaliada (&ge;75)</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Parcial (60-74)</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Limitada (40-59)</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Insuficiente (&lt;40)</div>
          </div>
        </div>

        {/* Sidebar List / Selected Place Card */}
        <div className="surface-card p-5 flex flex-col max-h-[640px] overflow-y-auto">
          {selectedEst ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedEst(null)}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Voltar para lista ({establishments.length})</span>
              </button>

              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                    {selectedEst.category.replace('_', ' ')} • {selectedEst.city}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {selectedEst.name}
                  </h3>
                </div>
                <AccessibilityBadge classification={selectedEst.classification} size="sm" />
              </div>

              <div className="h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <img
                  src={selectedEst.images[0] || '/images/establishments/est_poupatempo.jpg'}
                  alt={selectedEst.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{selectedEst.description}</p>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5"><MapPin size={13} className="text-brand-600 shrink-0" /> {selectedEst.address} — {selectedEst.city}/{selectedEst.state}</div>
                {selectedEst.phone && <div>📞 {selectedEst.phone}</div>}
              </div>

              {selectedEst.personal_compatibility_score !== undefined && selectedEst.personal_compatibility_score !== null && (
                <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-3.5 text-center">
                  <span className="text-[11px] text-brand-800 font-bold uppercase tracking-wider block">
                    Compatibilidade com Seu Perfil
                  </span>
                  <span className="text-3xl font-extrabold text-brand-600">
                    {selectedEst.personal_compatibility_score}%
                  </span>
                </div>
              )}

              {selectedEst.barriers.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs text-rose-800 space-y-1">
                  <span className="font-extrabold">⚠️ Barreiras Identificadas:</span>
                  <ul className="list-disc list-inside">
                    {selectedEst.barriers.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onNavigate('detail', selectedEst.id)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Ver Detalhes & Avaliações</span>
                  <ArrowRight size={14} />
                </button>

                {selectedEst.city.toLowerCase() === 'tupã' && selectedEst.id !== 'est_fadap_tupa' && (
                  <button
                    onClick={() => onNavigate('route', selectedEst.id)}
                    className="w-full bg-accent-500 hover:bg-accent-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Navigation size={14} />
                    <span>Traçar Rota a partir da FADAP</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('simulation', selectedEst.id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Compass size={14} />
                  <span>Simular Visita ("Antes de Ir")</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Locais Mapeados ({loading ? '...' : establishments.length})
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Toque para inspecionar</span>
              </div>

              <div className="space-y-2.5">
                {establishments.map((est) => (
                  <div
                    key={est.id}
                    onClick={() => {
                      setSelectedEst(est);
                      setMapCenter([est.lat, est.lng]);
                      setMapZoom(15);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold text-brand-600 uppercase">
                          {est.city} • {est.category.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                          {est.name}
                        </h4>
                      </div>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 shrink-0">
                        {est.overall_score}/100
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{est.address}</div>
                    <AccessibilityBadge classification={est.classification} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
