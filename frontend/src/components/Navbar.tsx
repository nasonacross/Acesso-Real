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
    { id: 'map', label: 'Mapa Interativo', icon: MapPin },
    { id: 'establishments', label: 'Estabelecimentos', icon: Search },
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'route', label: 'Rota Acessível', icon: Navigation },
    { id: 'ai', label: 'Análise por IA', icon: Sparkles },
    { id: 'owner', label: 'Área do Estabelecimento', icon: Building2 },
    { id: 'admin', label: 'Painel Admin', icon: ShieldAlert },
    { id: 'about', label: 'Metodologia', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Universal Accessibility Toolbar */}
      <div className="bg-slate-900 text-white text-xs px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 hidden sm:inline">Acessibilidade do Site:</span>

          {/* High Contrast */}
          <button
            onClick={toggleHighContrast}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-colors ${
              highContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            aria-label="Alternar modo de alto contraste"
          >
            <SunMoon size={13} />
            <span>{highContrast ? 'Contraste Normal' : 'Alto Contraste'}</span>
          </button>

          {/* Font Controls */}
          <div className="inline-flex items-center gap-1 bg-slate-800 rounded px-1 py-0.5">
            <Type size={13} className="text-slate-400 ml-1" />
            <button
              onClick={decreaseFont}
              className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-xs font-bold"
              aria-label="Diminuir tamanho da fonte"
              title="Diminuir fonte"
            >
              A-
            </button>
            <button
              onClick={resetFont}
              className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-xs"
              aria-label="Restaurar tamanho da fonte"
              title="Tamanho padrão"
            >
              {Math.round(fontScale * 100)}%
            </button>
            <button
              onClick={increaseFont}
              className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-xs font-bold"
              aria-label="Aumentar tamanho da fonte"
              title="Aumentar fonte"
            >
              A+
            </button>
          </div>

          {/* Audio TTS helper */}
          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white font-bold animate-pulse"
              aria-label="Parar leitura de voz"
            >
              <VolumeX size={13} />
              <span>Parar Leitura</span>
            </button>
          ) : (
            <button
              onClick={() => speakText('AcessoReal: Plataforma inteligente de acessibilidade universal e compatibilidade individual.')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white"
              aria-label="Testar leitor de voz do site"
              title="Testar leitura em voz alta"
            >
              <Volume2 size={13} />
              <span className="hidden md:inline">Ouvir Introdução</span>
            </button>
          )}
        </div>

        {/* User Role Switcher & PWA Install */}
        <div className="flex items-center gap-2">
          {!installedPwa && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white font-bold px-2.5 py-0.5 rounded text-xs transition-colors shadow-sm"
              aria-label="Instalar aplicativo PWA"
            >
              <Download size={13} />
              <span>Instalar App</span>
            </button>
          )}

          {/* Quick profile / role switcher for testing */}
          <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Perfil:</span>
            <select
              value={user.role}
              onChange={(e) => switchUserRole(e.target.value as any)}
              className="bg-slate-800 text-white text-xs rounded border border-slate-700 px-2 py-0.5 focus:ring-1 focus:ring-brand-400"
              aria-label="Alternar papel de usuário para teste"
            >
              <option value="visitor">Mariana (Visitante PCD)</option>
              <option value="owner">Carlos (Gestor do Local)</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28">
                <circle cx="50" cy="28" r="10" fill="#ffffff" />
                <path d="M42 43 C42 43, 56 41, 64 48 C70 53, 67 60, 67 60" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
                <path d="M50 44 L44 65 L60 65" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="43" cy="69" r="14" fill="none" stroke="#ffffff" stroke-width="6" />
                <circle cx="75" cy="28" r="4" fill="#facc15" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block leading-tight">
                Acesso<span className="text-accent-600">Real</span>
              </span>
              <span className="text-[10px] text-slate-700 font-semibold uppercase tracking-wider block">
                Acessibilidade Universal
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border-b-2 border-brand-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} className={isActive ? 'text-brand-600' : 'text-slate-600'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Abrir menu de navegação"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-slate-200 bg-white rounded-b-2xl shadow-xl space-y-1">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-600'} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 px-3">
              <span className="text-xs text-slate-500 block mb-1">Simular Perfil:</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => switchUserRole('visitor')}
                  className={`text-xs py-1 px-2 rounded font-medium border ${user.role === 'visitor' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  Visitante
                </button>
                <button
                  onClick={() => switchUserRole('owner')}
                  className={`text-xs py-1 px-2 rounded font-medium border ${user.role === 'owner' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  Gestor
                </button>
                <button
                  onClick={() => switchUserRole('admin')}
                  className={`text-xs py-1 px-2 rounded font-medium border ${user.role === 'admin' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
