import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Sub-webpages
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
import { ProfilePage } from './pages/ProfilePage';

// Helper to parse active sub-webpage tab from browser location
const getTabFromLocation = () => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase().trim();
  const validTabs = [
    'dashboard',
    'species',
    'habitats',
    'locations',
    'observations',
    'researchers',
    'threats',
    'conservation',
    'reports',
    'sql-console',
    'profile',
    'settings',
  ];
  if (!path || path === 'dashboard') {
    return 'dashboard';
  }
  return validTabs.includes(path) ? path : 'dashboard';
};

function MainApp() {
  const { user, isAuthenticated, loading, login } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(getTabFromLocation);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sub-webpage Title mapping
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
    'sql-console': { title: 'SQL Query Console', subtitle: 'Interactive SQL execution and relational query demonstration' },
    profile: { title: 'User Profile', subtitle: 'Authenticated credentials, authorization level, and contact details' },
    settings: { title: 'System Settings', subtitle: 'System diagnostics and RBAC matrix' },
  };

  // Synchronize browser history and sub-webpage navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const targetPath = tabId === 'dashboard' ? '/' : `/${tabId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: tabId }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromLocation();
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update document title dynamically based on current sub-webpage
  useEffect(() => {
    const current = titles[activeTab] || titles.dashboard;
    document.title = `${current.title} — Biodiversity Management System`;
  }, [activeTab]);

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
    if (entityType === 'species') handleTabChange('species');
    else if (entityType === 'habitat') handleTabChange('habitats');
    else if (entityType === 'location') handleTabChange('locations');
    else if (entityType === 'researcher') handleTabChange('researchers');
    else if (entityType === 'threat') handleTabChange('threats');
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div>
          <p>Loading Biodiversity Management Platform...</p>
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header & Horizontal Sub-Webpage Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Sub-Webpage Content Area */}
      <main style={{ flex: 1, width: '100%', minHeight: 'calc(100vh - 120px)' }}>
        {activeTab === 'dashboard' && <DashboardPage onNavigate={handleTabChange} />}
        {activeTab === 'species' && <SpeciesPage />}
        {activeTab === 'habitats' && <HabitatsPage />}
        {activeTab === 'locations' && <LocationsPage />}
        {activeTab === 'observations' && <ObservationsPage />}
        {activeTab === 'researchers' && <ResearchersPage />}
        {activeTab === 'threats' && <ThreatsPage />}
        {activeTab === 'conservation' && <ConservationPage />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'sql-console' && <SqlConsolePage />}
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

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
