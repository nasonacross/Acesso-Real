import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  UserCheck,
  ArrowRight,
  Navigation,
  Accessibility,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Building2,
  Compass
} from 'lucide-react';
import { Establishment, EstablishmentCategory } from '../types';
import { fetchEstablishments } from '../api';
import { useAuth } from '../context/AuthContext';
import { AccessibilityBadge } from '../components/AccessibilityBadge';
import { ProvenanceBadge } from '../components/ProvenanceBadge';

interface Props {
  onNavigate: (tab: string, estId?: string, options?: { search?: string; category?: string }) => void;
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
        city: 'tupa',
        userId: profile?.user_id,
      });
      // Prioritize FADAP, APAE, Poupatempo and CREAS in Tupã
      const priorityIds = ['est_fadap_tupa', 'est_apae_tupa', 'est_poupatempo_tupa', 'est_creas_tupa'];
      const sorted = [...data].sort((a, b) => {
        const ia = priorityIds.indexOf(a.id);
        const ib = priorityIds.indexOf(b.id);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return b.overall_score - a.overall_score;
      });
      setFeatured(sorted.slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('establishments', undefined, { search: searchTerm.trim() });
  };

  const categories: { id: EstablishmentCategory; label: string; icon: string; desc: string }[] = [
    { id: 'cras', label: 'CRAS', icon: '🏛️', desc: 'Proteção Básica' },
    { id: 'creas', label: 'CREAS', icon: '🤝', desc: 'Proteção Especial' },
    { id: 'assistencia_social', label: 'APAE & Social', icon: '💛', desc: 'Inclusão & Apoio' },
    { id: 'escola', label: 'FADAP & Ensino', icon: '🎓', desc: 'Educação Superior' },
    { id: 'hospital', label: 'Hospitais & UPA', icon: '🏥', desc: 'Saúde 24h' },
    { id: 'reparticao_publica', label: 'Poupatempo', icon: '📋', desc: 'Serviços Públicos' },
    { id: 'farmacia', label: 'Farmácias', icon: '💊', desc: 'Av. Tamoios' },
    { id: 'lazer', label: 'Praças & Lazer', icon: '🌳', desc: 'Convivência' },
  ];

  const accompanimentStatus = profile?.accompaniment.status || 'undecided';

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* Ultra-Modern Mesh Hero Section */}
      <section className="relative overflow-hidden mesh-hero text-white py-14 sm:py-20 px-5 sm:px-10 rounded-[2.25rem] shadow-elevated border border-white/10">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-accent-300 shadow-sm">
            <Accessibility size={15} />
            <span>Acessibilidade Inteligente • Tupã / SP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
            Descubra a acessibilidade{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-brand-300 to-cyan-200">
              REAL
            </span>{' '}
            antes de sair de casa.
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Avaliamos da calçada e rampa de entrada até banheiros adaptados, ruído sensorial, sinalização e autonomia com base nas <strong className="text-white">suas necessidades individuais</strong>.
          </p>

          {/* Modern Segmented Accompaniment Control */}
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/15 p-2 rounded-2xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 block mb-2 font-bold">
              Como você pretende visitar hoje?
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'alone', label: 'Sozinho(a)' },
                { id: 'accompanied', label: 'Acompanhado(a)' },
                { id: 'undecided', label: 'A definir' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateAccompanimentStatus(opt.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    accompanimentStatus === opt.id
                      ? 'bg-accent-400 text-slate-950 shadow-md'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Glass Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-elevated ring-4 ring-white/10"
          >
            <div className="flex-1 flex items-center px-3.5 gap-2.5">
              <Search size={19} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar FADAP, CRAS, CREAS, APAE, Poupatempo, Santa Casa..."
                className="w-full text-slate-900 text-sm font-medium focus:outline-none py-2.5 bg-transparent"
                aria-label="Campo de busca de estabelecimentos"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm shrink-0"
            >
              <span>Pesquisar</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Primary Action Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              onClick={() => onNavigate('route')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-300 hover:to-accent-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-glow-accent transition-all hover:-translate-y-0.5"
            >
              <Navigation size={15} />
              <span>Traçar Rota saindo da FADAP</span>
            </button>

            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all"
            >
              <MapPin size={15} className="text-brand-300" />
              <span>Mapa Interativo de Tupã</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all"
            >
              <Sparkles size={15} className="text-amber-300" />
              <span>Analisar Foto com IA</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all"
            >
              <UserCheck size={15} className="text-accent-300" />
              <span>Meu Perfil</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tupã & FADAP Bento Spotlight */}
      <section className="surface-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/80 text-[11px] font-extrabold uppercase tracking-wider">
              <GraduationCap size={14} />
              <span>Base Inicial: Faculdade FADAP / FAP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rede Acessível de Tupã - SP
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Mapeamento completo das unidades de Assistência Social, saúde, educação e serviços públicos de Tupã com rotas acessíveis traçadas a partir da FADAP.
            </p>
          </div>

          <button
            onClick={() => onNavigate('route')}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all shrink-0"
          >
            <span>Abrir Rotas de Tupã</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: GraduationCap,
              color: 'bg-brand-50 text-brand-600',
              title: 'Faculdade FADAP',
              desc: 'Ponto inicial das rotas na Rua Mandaguaris, 1010 — Centro.',
              action: () => onNavigate('detail', 'est_fadap_tupa'),
            },
            {
              icon: HeartHandshake,
              color: 'bg-emerald-50 text-emerald-600',
              title: 'CRAS, CREAS & APAE',
              desc: 'CRAS I, II e III, CREAS, Secretaria de Assistência Social e APAE Tupã.',
              action: () => onNavigate('route', 'est_sec_assistencia_tupa'),
            },
            {
              icon: ShieldCheck,
              color: 'bg-rose-50 text-rose-600',
              title: 'Saúde em Tupã',
              desc: 'Santa Casa de Misericórdia e UPA 24h com rotas acessíveis.',
              action: () => onNavigate('route', 'est_santacasa_tupa'),
            },
            {
              icon: Building2,
              color: 'bg-amber-50 text-amber-600',
              title: 'Cidadania & Centro',
              desc: 'Poupatempo Tupã, Praça da Bandeira, Av. Tamoios e Rodoviária.',
              action: () => onNavigate('route', 'est_poupatempo_tupa'),
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                onClick={card.action}
                className="p-5 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5 cursor-pointer space-y-3 group"
              >
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-900">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modern Categories Bento Grid */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Explorar por Categoria
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique para filtrar os estabelecimentos e serviços avaliados
            </p>
          </div>
          <button
            onClick={() => onNavigate('establishments')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('establishments', undefined, { category: cat.id })}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-400 hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5 text-center group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-extrabold text-slate-900 leading-tight">{cat.label}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Tupã Establishments */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Destaques em Tupã & Compatibilidade
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cálculo individual considerando seu perfil ({accompanimentStatus === 'alone' ? 'Visita Solo' : accompanimentStatus === 'accompanied' ? 'Com Acompanhante' : 'A definir'})
            </p>
          </div>
          <button
            onClick={() => onNavigate('establishments')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>Catálogo completo</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-56 bg-slate-200/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featured.map((est) => (
              <article
                key={est.id}
                className="surface-card overflow-hidden hover:shadow-elevated hover:border-brand-300 transition-all duration-200 hover:-translate-y-0.5 flex flex-col group"
              >
                <div
                  onClick={() => onNavigate('detail', est.id)}
                  className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={est.images[0] || '/images/establishments/est_poupatempo.jpg'}
                    alt={est.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <AccessibilityBadge classification={est.classification} size="sm" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-slate-900 shadow-sm">
                    {est.personal_compatibility_score ?? est.overall_score}% compatível
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-300">
                      {est.city} • {est.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-extrabold leading-snug line-clamp-1">{est.name}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <ProvenanceBadge
                      provenance={est.provenance}
                      reliabilityScore={est.reliability_score}
                      isDemo={est.is_demo}
                    />
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {est.description}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin size={13} className="text-brand-600 shrink-0" />
                      <span className="truncate">{est.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onNavigate('detail', est.id)}
                      className="flex-1 bg-slate-900 hover:bg-brand-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Ver Ficha</span>
                      <ArrowRight size={13} />
                    </button>
                    {est.id !== 'est_fadap_tupa' ? (
                      <button
                        onClick={() => onNavigate('route', est.id)}
                        className="bg-accent-50 hover:bg-accent-100 text-accent-800 border border-accent-200/80 font-bold py-2.5 px-3.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Navigation size={13} />
                        <span>Rota da FADAP</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('simulation', est.id)}
                        className="bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200/80 font-bold py-2.5 px-3.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Compass size={13} />
                        <span>Simular</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 6 Pillars Bento Section */}
      <section className="surface-card p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-600">
            Metodologia Universal
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Avaliação Real em 6 Dimensões Independentes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Uma nota alta em atendimento nunca esconde uma barreira física ou sensorial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '♿', title: 'Física & Motora', desc: 'Rampas NBR 9050, portas > 80cm, sanitários adaptados e pisos regulares.' },
            { icon: '🧩', title: 'Intelectual & Cognitiva', desc: 'Linguagem simples, pictogramas claros e organização intuitiva dos espaços.' },
            { icon: '🎧', title: 'Sensorial & Neurodivergência', desc: 'Controle de ruído, iluminação confortável e áreas de descompressão.' },
            { icon: '🦯', title: 'Visual & Baixa Visão', desc: 'Piso tátil direcional, alto contraste, braile e rotas livres de obstáculos.' },
            { icon: '🤟', title: 'Auditiva & Libras', desc: 'Atendimento em Libras, comunicação por texto e painéis visuais.' },
            { icon: '❤️', title: 'Atendimento Humanizado', desc: 'Equipe capacitada, respeito à autonomia e prioridade real.' },
          ].map((pillar, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
              <div className="text-2xl">{pillar.icon}</div>
              <h3 className="font-extrabold text-sm text-slate-900">{pillar.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
