import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  MapPin,
  Search,
  User,
  Compass,
  Sparkles,
  ShieldAlert,
  Building2,
  Volume2,
  VolumeX,
  SunMoon,
  Type,
  Download,
  Info,
  Navigation
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const {
    highContrast,
    toggleHighContrast,
    fontScale,
    increaseFont,
    decreaseFont,
    resetFont,
    isSpeaking,
    stopSpeaking,
    speakText,
  } = useAccessibility();

  const { user, switchUserRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [installedPwa, setInstalledPwa] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalledPwa(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      const choice = await pwaPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledPwa(true);
      }
      setPwaPrompt(null);
    } else {
      alert(
        'Para instalar o AcessoReal:\n• No Android/Chrome: Toque no menu (três pontos) > "Instalar aplicativo".\n• No iOS/Safari: Toque em Compartilhar > "Adicionar à Tela de Início".'
      );
    }
  };

  const navItems = [
    { id: 'home', label: 'Início', icon: Compass },
    { id: 'map', label: 'Mapa', icon: MapPin },
    { id: 'route', label: 'Rotas Tupã', icon: Navigation },
    { id: 'establishments', label: 'Locais', icon: Search },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'ai', label: 'IA Visão', icon: Sparkles },
    { id: 'owner', label: 'Gestor', icon: Building2 },
    { id: 'admin', label: 'Admin', icon: ShieldAlert },
    { id: 'about', label: 'Sobre', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
      {/* Universal Accessibility Toolbar */}
      <div className="bg-slate-950 text-white text-[11px] px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-400 hidden md:inline">Acessibilidade:</span>

          <button
            onClick={toggleHighContrast}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold transition-colors ${
              highContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-white/10 hover:bg-white/20 text-slate-100'
            }`}
            aria-label="Alternar modo de alto contraste"
          >
            <SunMoon size={12} />
            <span>{highContrast ? 'Contraste Normal' : 'Alto Contraste'}</span>
          </button>

          <div className="inline-flex items-center gap-0.5 bg-white/10 rounded-full px-1.5 py-0.5">
            <Type size={12} className="text-slate-400 mr-0.5" />
            <button
              onClick={decreaseFont}
              className="px-1.5 hover:bg-white/15 rounded-full font-bold"
              aria-label="Diminuir tamanho da fonte"
            >
              A-
            </button>
            <button
              onClick={resetFont}
              className="px-1.5 hover:bg-white/15 rounded-full text-[10px] font-semibold text-slate-300"
              aria-label="Restaurar tamanho da fonte"
            >
              {Math.round(fontScale * 100)}%
            </button>
            <button
              onClick={increaseFont}
              className="px-1.5 hover:bg-white/15 rounded-full font-bold"
              aria-label="Aumentar tamanho da fonte"
            >
              A+
            </button>
          </div>

          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-pulse"
              aria-label="Parar leitura de voz"
            >
              <VolumeX size={12} />
              <span>Parar Voz</span>
            </button>
          ) : (
            <button
              onClick={() => speakText('AcessoReal: Plataforma inteligente de acessibilidade universal e compatibilidade individual em Tupã.')}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-100"
              aria-label="Ouvir apresentação da plataforma"
            >
              <Volume2 size={12} />
              <span className="hidden sm:inline">Leitor de Voz</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!installedPwa && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-500 text-white font-bold px-3 py-0.5 rounded-full transition-colors"
              aria-label="Instalar aplicativo PWA"
            >
              <Download size={12} />
              <span>Instalar App</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">Perfil:</span>
            <select
              value={user.role === 'owner' ? 'owner' : 'visitor'}
              onChange={(e) => {
                const role = e.target.value as 'visitor' | 'owner';
                switchUserRole(role);
                if (role === 'owner') setActiveTab('owner');
                else setActiveTab('profile');
              }}
              className="bg-white/10 text-white text-[11px] font-semibold rounded-full border border-white/15 px-2.5 py-0.5 focus:ring-1 focus:ring-brand-400"
              aria-label="Alternar entre Perfil Personalizado e Perfil Gestor"
            >
              <option value="visitor" className="text-slate-900">👤 {user.role === 'visitor' ? user.name : 'Perfil Personalizado'}</option>
              <option value="owner" className="text-slate-900">🏢 Perfil Gestor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Modern Frosted Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl p-1 shrink-0 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="26" height="26">
                <circle cx="50" cy="28" r="10" fill="#ffffff" />
                <path d="M42 43 C42 43, 56 41, 64 48 C70 53, 67 60, 67 60" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                <path d="M50 44 L44 65 L60 65" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="43" cy="69" r="14" fill="none" stroke="#ffffff" strokeWidth="6" />
                <circle cx="75" cy="28" r="4" fill="#fde047" />
              </svg>
            </div>
            <div>
              <span className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight block leading-none">
                Acesso<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">Real</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">
                Tupã & Região
              </span>
            </div>
          </button>

          {/* Desktop Floating Pill Nav */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={14} className={isActive ? 'text-accent-400' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              aria-label="Abrir menu de navegação"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-slate-100 bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-elevated space-y-1 animate-fade-in">
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-accent-400' : 'text-slate-500'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 px-1">
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Tipo de Perfil:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    switchUserRole('visitor');
                    setActiveTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs py-2 px-3 rounded-xl font-bold border transition-all ${
                    user.role !== 'owner'
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  👤 Personalizado
                </button>
                <button
                  onClick={() => {
                    switchUserRole('owner');
                    setActiveTab('owner');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs py-2 px-3 rounded-xl font-bold border transition-all ${
                    user.role === 'owner'
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🏢 Perfil Gestor
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
