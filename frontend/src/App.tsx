import React, { useState } from 'react';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { EstablishmentsPage } from './pages/EstablishmentsPage';
import { EstablishmentDetailPage } from './pages/EstablishmentDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { SimulationPage } from './pages/SimulationPage';
import { RoutePage } from './pages/RoutePage';
import { AiVisionPage } from './pages/AiVisionPage';
import { OwnerPortalPage } from './pages/OwnerPortalPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>('est_fadap_tupa');
  const [initialSearch, setInitialSearch] = useState<string>('');
  const [initialCategory, setInitialCategory] = useState<string>('todos');

  const handleNavigate = (
    tab: string,
    estId?: string,
    options?: { search?: string; category?: string }
  ) => {
    if (estId) {
      setSelectedEstablishmentId(estId);
    }
    if (options?.search !== undefined) {
      setInitialSearch(options.search);
    } else if (tab !== 'establishments') {
      setInitialSearch('');
    }
    if (options?.category !== undefined) {
      setInitialCategory(options.category);
    } else if (tab !== 'establishments') {
      setInitialCategory('todos');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 transition-colors">
      <Navbar activeTab={activeTab} setActiveTab={(tab) => handleNavigate(tab)} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'home' && <HomePage onNavigate={handleNavigate} />}
        {activeTab === 'map' && <MapPage onNavigate={handleNavigate} />}
        {activeTab === 'establishments' && (
          <EstablishmentsPage
            onNavigate={handleNavigate}
            initialSearch={initialSearch}
            initialCategory={initialCategory}
          />
        )}
        {activeTab === 'detail' && (
          <EstablishmentDetailPage
            establishmentId={selectedEstablishmentId}
            onNavigate={handleNavigate}
          />
        )}
        {activeTab === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
        {activeTab === 'simulation' && (
          <SimulationPage
            initialEstablishmentId={selectedEstablishmentId}
            onNavigate={handleNavigate}
          />
        )}
        {activeTab === 'route' && (
          <RoutePage
            onNavigate={handleNavigate}
            initialDestinationId={selectedEstablishmentId}
          />
        )}
        {activeTab === 'ai' && <AiVisionPage />}
        {activeTab === 'owner' && <OwnerPortalPage />}
        {activeTab === 'admin' && <AdminPage />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      <Footer onNavigate={(tab) => handleNavigate(tab)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AccessibilityProvider>
  );
};

export default App;
