import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Users,
  Compass,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  Building,
  Navigation,
  Accessibility
} from 'lucide-react';
import { Establishment, EstablishmentCategory } from '../types';
import { fetchEstablishments } from '../api';
import { useAuth } from '../context/AuthContext';
import { AccessibilityBadge } from '../components/AccessibilityBadge';
import { ProvenanceBadge } from '../components/ProvenanceBadge';

interface Props {
  onNavigate: (tab: string, estId?: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const { profile, updateAccompanimentStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [featured, setFeatured] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, [profile?.user_id]);

  const loadFeatured = async () => {
    try {
      setLoading(true);
      const data = await fetchEstablishments({
        userId: profile?.user_id,
      });
      setFeatured(data.slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('establishments');
  };

  const categories: { id: EstablishmentCategory; label: string; icon: string }[] = [
    { id: 'cras', label: 'CRAS & Social', icon: '🏛️' },
    { id: 'creas', label: 'CREAS', icon: '🤝' },
    { id: 'hospital', label: 'Hospitais & Saúde', icon: '🏥' },
    { id: 'farmacia', label: 'Farmácias', icon: '💊' },
    { id: 'mercado', label: 'Supermercados', icon: '🛒' },
    { id: 'restaurante', label: 'Restaurantes', icon: '🍽️' },
    { id: 'transporte', label: 'Transporte & Metrô', icon: '🚇' },
    { id: 'escola', label: 'Bibliotecas & Escolas', icon: '📚' },
  ];

  const accompanimentStatus = profile?.accompaniment.status || 'undecided';

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-accent-950 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-xl mt-4">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-accent-300">
            <Accessibility size={15} />
            <span>Plataforma Inteligente de Acessibilidade Universal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Descubra a acessibilidade <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-brand-200">REAL</span> antes de sair de casa.
          </h1>

          <p className="text-base sm:text-xl text-brand-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Não basta uma rampa isolada. Analisamos da calçada e entrada até os banheiros, nível de ruído, sinalização e autonomia com base nas <strong>suas necessidades individuais</strong>.
          </p>

          {/* Quick Accompaniment Switcher on Hero */}
          <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl">
            <span className="text-xs text-brand-200 block mb-2 font-medium">
              Como você pretende visitar hoje?
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateAccompanimentStatus('alone')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  accompanimentStatus === 'alone'
                    ? 'bg-accent-500 text-slate-950 shadow-lg scale-102'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Vou sozinho(a)
              </button>
              <button
                onClick={() => updateAccompanimentStatus('accompanied')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  accompanimentStatus === 'accompanied'
                    ? 'bg-accent-500 text-slate-950 shadow-lg scale-102'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Vou acompanhado(a)
              </button>
              <button
                onClick={() => updateAccompanimentStatus('undecided')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  accompanimentStatus === 'undecided'
                    ? 'bg-accent-500 text-slate-950 shadow-lg scale-102'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Ainda não sei
              </button>
            </div>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-2xl"
          >
            <div className="flex-1 flex items-center px-3 gap-2">
              <Search size={20} className="text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por mercado, hospital, CRAS, farmácia, endereço..."
                className="w-full text-slate-900 text-sm focus:outline-none py-2"
                aria-label="Campo de busca de estabelecimentos"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>Buscar</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-lg transition-all"
            >
              <MapPin size={16} />
              <span>Abrir Radar Bastos ↔ Marília no Mapa</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <Sparkles size={16} className="text-yellow-300" />
              <span>Analisar Foto com IA</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <UserCheck size={16} className="text-brand-300" />
              <span>Personalizar Meu Perfil</span>
            </button>
          </div>
        </div>
      </section>

      {/* Radar Bastos até Marília Showcase */}
      <section className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-brand-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/40 text-xs font-bold uppercase tracking-wider">
              <span>🛰️ Eixo SP-294 / Alta Paulista</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Radar de Acessibilidade: Bastos até Marília
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Mapeamento de instituições reais ao longo do corredor da Alta Paulista: Hospitais, CRAS, Poupatempo, APAE, FATEC, shoppings e terminais de passageiros.
            </p>
          </div>

          <button
            onClick={() => onNavigate('map')}
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-slate-950 px-5 py-2.5 rounded-xl font-extrabold text-xs shadow transition-all shrink-0"
          >
            <span>Ver Todo o Eixo no Mapa</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Corridor Hubs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div
            onClick={() => onNavigate('map')}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 cursor-pointer transition-all space-y-1"
          >
            <div className="text-lg">🥚</div>
            <h4 className="font-bold text-sm text-white">Bastos</h4>
            <p className="text-[11px] text-brand-200">
              Hospital Beneficente, CRAS Bastos, Supermercado Kawakami, Recinto Festa do Ovo.
            </p>
          </div>

          <div
            onClick={() => onNavigate('map')}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 cursor-pointer transition-all space-y-1"
          >
            <div className="text-lg">🏛️</div>
            <h4 className="font-bold text-sm text-white">Tupã</h4>
            <p className="text-[11px] text-brand-200">
              Poupatempo Tupã, Santa Casa de Tupã, Rodoviária Geraldo Seiscento.
            </p>
          </div>

          <div
            onClick={() => onNavigate('map')}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 cursor-pointer transition-all space-y-1"
          >
            <div className="text-lg">⚙️</div>
            <h4 className="font-bold text-sm text-white">Pompeia</h4>
            <p className="text-[11px] text-brand-200">
              FATEC / Fundação Shunji Nishimura, Santa Casa de Pompeia, CRAS Pompeia.
            </p>
          </div>

          <div
            onClick={() => onNavigate('map')}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 cursor-pointer transition-all space-y-1"
          >
            <div className="text-lg">🏙️</div>
            <h4 className="font-bold text-sm text-white">Marília</h4>
            <p className="text-[11px] text-brand-200">
              HCFAMEMA, Poupatempo, APAE Marília, Marília Shopping, Bosque Municipal.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Categorias de Serviços & Locais</h2>
            <p className="text-xs text-slate-500">Explore serviços públicos e privados com dados verificados</p>
          </div>
          <button
            onClick={() => onNavigate('establishments')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('establishments')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all text-center group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-bold text-slate-800 leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Places with Compatibility */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Locais em Destaque & Compatibilidade</h2>
            <p className="text-xs text-slate-500">
              Cálculo individual considerando seu perfil ({accompanimentStatus === 'alone' ? 'Visita Solo' : accompanimentStatus === 'accompanied' ? 'Com Acompanhante' : 'A definir'})
            </p>
          </div>
          <button
            onClick={() => onNavigate('establishments')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Ver catálogo completo</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featured.map((est) => (
              <div
                key={est.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={est.images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'}
                      alt={est.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <AccessibilityBadge classification={est.classification} size="sm" />
                    </div>
                    {est.personal_compatibility_score !== undefined && est.personal_compatibility_score !== null && (
                      <div className="absolute top-3 right-3 bg-brand-900/90 backdrop-blur-md text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg border border-white/20">
                        {est.personal_compatibility_score}% Compatível
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <ProvenanceBadge
                      provenance={est.provenance}
                      reliabilityScore={est.reliability_score}
                      isDemo={est.is_demo}
                    />

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {est.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {est.description}
                    </p>

                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{est.address}</span>
                    </div>

                    {est.barriers.length > 0 && (
                      <div className="text-xs bg-rose-50 text-rose-800 border border-rose-200 p-2 rounded-lg">
                        <strong>Barreira conhecida:</strong> {est.barriers[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Nota Geral: <strong>{est.overall_score}/100</strong>
                  </span>

                  <button
                    onClick={() => onNavigate('detail', est.id)}
                    className="inline-flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <span>Ver Avaliação Completa</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Philosophy & Pillars */}
      <section className="bg-slate-100 rounded-3xl p-8 border border-slate-200 space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            As 6 Dimensões da Acessibilidade Real
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Nenhuma boa nota em uma categoria pode camuflar uma barreira grave em outra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-2xl">♿</span>
            <h4 className="font-bold text-slate-900 text-sm">Física & Motora</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rampas com inclinação real NBR 9050, portas largas (&gt;80cm), sanitários acessíveis e ausência de obstáculos nas rotas.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-2xl">🧩</span>
            <h4 className="font-bold text-slate-900 text-sm">Intelectual & Cognitiva</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Linguagem simples, sinalização com pictogramas claros, rotas intuitivas e paciência no atendimento.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-2xl">🎧</span>
            <h4 className="font-bold text-slate-900 text-sm">Psicossocial & Sensorial</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Controle de poluição sonora, iluminação acolhedora e salas calmas de descompressão para pessoas autistas ou com TDAH.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-2xl">🦯</span>
            <h4 className="font-bold text-slate-900 text-sm">Visual</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Piso tátil direcional e de alerta, sinalização em Braille com relevo e contraste cromático adequado.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-2xl">🤟</span>
            <h4 className="font-bold text-slate-900 text-sm">Auditiva</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Atendimento em Libras, painéis visuais de senha e avisos luminosos de emergência.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-2xl">❤️</span>
            <h4 className="font-bold text-slate-900 text-sm">Qualidade do Atendimento</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Respeito absoluto à autonomia, atendimento humanizado e disposição genuína para suporte sem preconceitos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
