import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  Layers,
  Radar
} from 'lucide-react';
import { Establishment, EstablishmentCategory } from '../types';
import { fetchEstablishments } from '../api';
import { useAuth } from '../context/AuthContext';
import { MapComponent } from '../components/MapComponent';
import { AccessibilityBadge } from '../components/AccessibilityBadge';

interface Props {
  onNavigate: (tab: string, estId?: string) => void;
}

export const MapPage: React.FC<Props> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedCity, setSelectedCity] = useState<string>('radar-bastos-marilia');

  const [filterWheelchair, setFilterWheelchair] = useState(false);
  const [filterLibras, setFilterLibras] = useState(false);
  const [filterSensory, setFilterSensory] = useState(false);
  const [filterRestroom, setFilterRestroom] = useState(false);
  const [filterBraille, setFilterBraille] = useState(false);

  // Map state - Default centered on the Bastos-Marília corridor
  const [mapCenter, setMapCenter] = useState<[number, number]>([-22.06, -50.35]); // Corredor Alta Paulista
  const [mapZoom, setMapZoom] = useState<number>(10);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState(30);
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
    userLocation,
    radiusKm,
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
        lat: userLocation ? userLocation[0] : undefined,
        lng: userLocation ? userLocation[1] : undefined,
        radiusKm: userLocation ? radiusKm : undefined,
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
    switch (cityKey) {
      case 'bastos':
        setMapCenter([-21.9221, -50.7342]);
        setMapZoom(14);
        break;
      case 'tupa':
        setMapCenter([-21.9347, -50.5136]);
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

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada no seu navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(14);
      },
      (err) => {
        console.warn('Erro ao obter GPS, simulando centro do radar Bastos:', err.message);
        const simCoords: [number, number] = [-21.9221, -50.7342];
        setUserLocation(simCoords);
        setMapCenter(simCoords);
        setMapZoom(14);
      }
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Radar & City Selector Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-accent-950 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radar size={20} className="text-accent-400 animate-pulse" />
            <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
              Radar de Acessibilidade: Bastos até Marília
            </h2>
          </div>
          <span className="text-xs text-brand-200">
            SP-294 • Rod. Comandante João Ribeiro de Barros (Alta Paulista)
          </span>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => handleSelectCityTarget('radar-bastos-marilia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === 'radar-bastos-marilia'
                ? 'bg-accent-500 text-slate-950 shadow-md scale-102 ring-2 ring-accent-300'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🛰️ Radar Completo (Bastos a Marília)
          </button>

          <button
            onClick={() => handleSelectCityTarget('bastos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === 'bastos'
                ? 'bg-accent-500 text-slate-950 shadow-md scale-102 ring-2 ring-accent-300'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🥚 Bastos
          </button>

          <button
            onClick={() => handleSelectCityTarget('tupa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === 'tupa'
                ? 'bg-accent-500 text-slate-950 shadow-md scale-102 ring-2 ring-accent-300'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🏛️ Tupã
          </button>

          <button
            onClick={() => handleSelectCityTarget('pompeia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === 'pompeia'
                ? 'bg-accent-500 text-slate-950 shadow-md scale-102 ring-2 ring-accent-300'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            ⚙️ Pompeia
          </button>

          <button
            onClick={() => handleSelectCityTarget('marilia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === 'marilia'
                ? 'bg-accent-500 text-slate-950 shadow-md scale-102 ring-2 ring-accent-300'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🏙️ Marília
          </button>

          <button
            onClick={() => handleSelectCityTarget('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCity === 'todas'
                ? 'bg-white text-slate-950 shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Todas as Cidades
          </button>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome, rua, hospital, CRAS, APAE, Poupatempo..."
              className="w-full text-xs md:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs md:text-sm py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500"
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

            <button
              onClick={handleGetCurrentLocation}
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow transition-colors shrink-0"
              title="Centralizar no meu GPS"
            >
              <Navigation size={14} />
              <span>Meu GPS</span>
            </button>
          </div>
        </div>

        {/* Accessibility Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1">Filtros de Acessibilidade:</span>

          <button
            onClick={() => setFilterWheelchair(!filterWheelchair)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterWheelchair
                ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            ♿ Cadeirantes (Rampa & Portas)
          </button>

          <button
            onClick={() => setFilterRestroom(!filterRestroom)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterRestroom
                ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            🚻 Banheiro Adaptado
          </button>

          <button
            onClick={() => setFilterLibras(!filterLibras)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterLibras
                ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            🤟 Atendimento em Libras
          </button>

          <button
            onClick={() => setFilterSensory(!filterSensory)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterSensory
                ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            🎧 Conforto Sensorial / Silencioso
          </button>

          <button
            onClick={() => setFilterBraille(!filterBraille)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterBraille
                ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            🦯 Braille / Piso Tátil
          </button>
        </div>
      </div>

      {/* Map & Preview Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[650px]">
        {/* Map View */}
        <div className="lg:col-span-2 h-full relative">
          <MapComponent
            establishments={establishments}
            center={mapCenter}
            zoom={mapZoom}
            userLocation={userLocation}
            radiusKm={userLocation ? radiusKm : undefined}
            selectedId={selectedEst?.id}
            onSelectEstablishment={(est) => {
              setSelectedEst(est);
              setMapCenter([est.lat, est.lng]);
              setMapZoom(15);
            }}
          />

          {/* Quick legend on top of map */}
          <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md text-[11px] space-y-1 hidden sm:block">
            <span className="font-bold text-slate-700 block text-xs mb-1">Legenda de Marcadores:</span>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bem Avaliada (&ge;75)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Parcial (60-74)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Limitada (40-59)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Insuficiente (&lt;40 ou barreira grave)</div>
          </div>
        </div>

        {/* Places List or Selected Place Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-y-auto">
          {selectedEst ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {selectedEst.category} • {selectedEst.city}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedEst.name}
                  </h3>
                </div>
                <AccessibilityBadge classification={selectedEst.classification} size="sm" />
              </div>

              <div className="h-32 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={selectedEst.images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedEst.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedEst.description}
              </p>

              <div className="text-xs text-slate-600 space-y-1">
                <div>📍 {selectedEst.address} ({selectedEst.city}/{selectedEst.state})</div>
                <div>📞 {selectedEst.phone || 'Telefone não informado'}</div>
              </div>

              {selectedEst.personal_compatibility_score !== undefined && selectedEst.personal_compatibility_score !== null && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-center">
                  <span className="text-xs text-brand-800 font-medium block">
                    Compatibilidade com Seu Perfil:
                  </span>
                  <span className="text-2xl font-extrabold text-brand-600">
                    {selectedEst.personal_compatibility_score}%
                  </span>
                </div>
              )}

              {selectedEst.barriers.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs text-rose-800 space-y-1">
                  <span className="font-bold">⚠️ Barreiras Conhecidas:</span>
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
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Ver Detalhes & Avaliações</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={() => onNavigate('simulation', selectedEst.id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Compass size={14} />
                  <span>Simular Visita ("Antes de Ir")</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Locais no Radar ({establishments.length})
                </h3>
                <span className="text-xs text-slate-400">Clique para inspecionar</span>
              </div>

              <div className="space-y-2">
                {establishments.map((est) => (
                  <div
                    key={est.id}
                    onClick={() => {
                      setSelectedEst(est);
                      setMapCenter([est.lat, est.lng]);
                      setMapZoom(15);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] font-bold text-brand-700 uppercase">
                          {est.city}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {est.name}
                        </h4>
                      </div>
                      <span className="text-xs font-extrabold text-brand-700 shrink-0">
                        {est.overall_score}/100
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {est.address}
                    </div>
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
