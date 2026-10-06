import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SpeciesPage } from './pages/SpeciesPage';
import { HabitatsPage } from './pages/HabitatsPage';
import { LocationsPage } from './pages/LocationsPage';
import { ObservationsPage } from './pages/ObservationsPage';
import { ResearchersPage } from './pages/ResearchersPage';
import { ThreatsPage } from './pages/ThreatsPage';
import { ConservationPage } from './pages/ConservationPage';
import { ReportsPage } from './pages/ReportsPage';
import { SqlConsolePage } from './pages/SqlConsolePage';
import { SettingsPage } from './pages/SettingsPage';

function MainApp() {
  const { user, isAuthenticated, loading, login } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global hotkey for search: '/' or 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDemoLogin = async (email, pass) => {
    try {
      const res = await login(email, pass);
      if (res.success) {
        addToast(`Logged in as ${res.user.role}: ${res.user.name}`, 'success');
        setShowLoginModal(false);
      }
    } catch (err) {
      addToast(err.message || 'Demo login failed', 'error');
    }
  };

  const handleGlobalNavigate = (entityType, id) => {
    if (entityType === 'species') setActiveTab('species');
    else if (entityType === 'habitat') setActiveTab('habitats');
    else if (entityType === 'location') setActiveTab('locations');
    else if (entityType === 'researcher') setActiveTab('researchers');
    else if (entityType === 'threat') setActiveTab('threats');
  };

  // Titles mapping
  const titles = {
    dashboard: { title: 'Biodiversity Overview', subtitle: 'Real-time database-driven ecological monitoring' },
    species: { title: 'Species Registry', subtitle: 'Biological taxonomy, population census, and IUCN statuses' },
    habitats: { title: 'Habitat Management', subtitle: 'Global biomes, geographic areas, and protection levels' },
    locations: { title: 'Geographical Locations', subtitle: 'GPS coordinates and territorial sectors' },
    observations: { title: 'Field Observations', subtitle: 'Field survey logs and specimen tracking' },
    researchers: { title: 'Researchers Directory', subtitle: 'Faculty, specialists, and scientific organizations' },
    threats: { title: 'Threat Risk Analysis', subtitle: 'Ecological and anthropogenic extinction pressures' },
    conservation: { title: 'Conservation Initiatives', subtitle: 'State recovery programs and milestone activities' },
    reports: { title: 'Reports & Analytics', subtitle: 'SQL-driven aggregated reports with CSV exports' },
    'sql-lab': { title: 'DBMS Viva / SQL Lab', subtitle: 'Interactive execution of 10 relational DBMS queries' },
    settings: { title: 'System Settings', subtitle: 'Profile, RBAC permissions, and database diagnostics' },
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div>
          <p>Connecting to Relational DBMS Engine...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Landing Page or Login Page
  if (!isAuthenticated) {
    if (showLoginModal) {
      return (
        <LoginPage
          onBack={() => setShowLoginModal(false)}
          onLoginSuccess={() => setShowLoginModal(false)}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setShowLoginModal(true)}
        onDemoLogin={handleDemoLogin}
      />
    );
  }

  const currentTitle = titles[activeTab] || titles.dashboard;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          title={currentTitle.title}
          subtitle={currentTitle.subtitle}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main style={{ flex: 1 }}>
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'species' && <SpeciesPage />}
          {activeTab === 'habitats' && <HabitatsPage />}
          {activeTab === 'locations' && <LocationsPage />}
          {activeTab === 'observations' && <ObservationsPage />}
          {activeTab === 'researchers' && <ResearchersPage />}
          {activeTab === 'threats' && <ThreatsPage />}
          {activeTab === 'conservation' && <ConservationPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'sql-lab' && <SqlConsolePage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Omni-Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleGlobalNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
