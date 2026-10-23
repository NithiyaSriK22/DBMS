import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Bug,
  Trees,
  MapPin,
  Eye,
  GraduationCap,
  ShieldAlert,
  HeartHandshake,
  BarChart3,
  Terminal,
  Settings,
  User,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ activeTab, onTabChange, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'species', label: 'Species', icon: Bug, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'habitats', label: 'Habitats', icon: Trees, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'locations', label: 'Locations', icon: MapPin, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'observations', label: 'Observations', icon: Eye, roles: ['Admin', 'Researcher', 'Viewer'] },
    { id: 'researchers', label: 'Researchers', icon: GraduationCap, roles: ['Admin', 'Researcher', 'Viewer'] },
    { id: 'threats', label: 'Threats', icon: ShieldAlert, roles: ['Admin', 'Researcher', 'Conservation Officer'] },
    { id: 'conservation', label: 'Conservation', icon: HeartHandshake, roles: ['Admin', 'Conservation Officer'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'sql-console', label: 'SQL Console', icon: Terminal, roles: ['Admin', 'Researcher'] },
  ];

  const currentRole = user?.role || 'Viewer';
  const navItems = allNavItems.filter((item) => !item.roles || item.roles.includes(currentRole));

  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className="app-top-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(21, 61, 43, 0.08)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* =========================================================================
          TIER 1: Primary Brand, Omni-Search, User Profile & Actions
          ========================================================================= */}
      <div
        style={{
          height: '68px',
          padding: '0 clamp(1rem, 2.5vw, 2.25rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid rgba(226, 233, 218, 0.7)',
        }}
      >
        {/* Left: Brand Identity */}
        <div
          onClick={() => handleNavClick('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          title="Return to Biodiversity Dashboard"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--forest-emerald) 0%, var(--forest-evergreen) 100%)',
              border: '1px solid rgba(196, 164, 91, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: '0 2px 10px rgba(21, 61, 43, 0.2)',
            }}
          >
            🌿
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1.125rem',
                color: 'var(--forest-deep)',
                letterSpacing: '-0.015em',
                lineHeight: 1.15,
                fontFamily: 'var(--font-heading)',
              }}
            >
              BIODIVERSITY
            </div>
            <div
              style={{
                fontSize: '0.675rem',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Management System
            </div>
          </div>
        </div>

        {/* Center: Global Omni-Search Bar */}
        <div style={{ flex: 1, maxWidth: '420px', display: 'flex', justifyContent: 'center' }} className="header-search-container">
          <button
            onClick={onOpenSearch}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.55rem 1rem',
              background: 'var(--neutral-cream)',
              border: '1px solid var(--natural-sage)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--forest-emerald)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.color = 'var(--forest-deep)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(47, 118, 81, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--natural-sage)';
              e.currentTarget.style.background = 'var(--neutral-cream)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Search size={16} color="var(--forest-emerald)" />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: 500 }}>Search species, habitats, researchers...</span>
            <kbd
              style={{
                fontSize: '0.675rem',
                background: '#FFFFFF',
                border: '1px solid var(--natural-sage)',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--forest-deep)',
                fontWeight: 700,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              }}
            >
              /
            </kbd>
          </button>
        </div>

        {/* Right: Role Status, User Account Pill & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Role Badge */}
          <div
            className="header-role-badge"
            style={{
              padding: '0.4rem 0.85rem',
              background: 'var(--neutral-cream)',
              border: '1px solid var(--natural-sage)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.775rem',
              fontWeight: 700,
              color: 'var(--forest-deep)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
              }}
            />
            <span>{currentRole}</span>
          </div>

          {/* User Profile Dropdown Pill */}
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.35rem 0.75rem 0.35rem 0.45rem',
                background: isUserMenuOpen ? 'var(--neutral-cream)' : '#FFFFFF',
                border: '1px solid var(--natural-sage)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--forest-emerald)';
                e.currentTarget.style.background = 'var(--neutral-cream)';
              }}
              onMouseLeave={(e) => {
                if (!isUserMenuOpen) {
                  e.currentTarget.style.borderColor = 'var(--natural-sage)';
                  e.currentTarget.style.background = '#FFFFFF';
                }
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest-evergreen) 100%)',
                  border: '1px solid rgba(196, 164, 91, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'var(--accent-gold)',
                  fontSize: '0.85rem',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--forest-deep)',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                className="header-user-name"
              >
                {user?.name || 'Account'}
              </span>
              <ChevronDown size={14} color="var(--forest-emerald)" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 110,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                }}
              >
                {/* User Header in Dropdown */}
                <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-deep)' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user?.email || 'Logged in user'}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '0.35rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--forest-emerald)',
                      background: 'rgba(47, 118, 81, 0.1)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    Role: {currentRole}
                  </div>
                </div>

                {/* Sub-page Links */}
                <button
                  onClick={() => {
                    handleNavClick('profile');
                    setIsUserMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: activeTab === 'profile' ? 'var(--neutral-cream)' : 'transparent',
                    border: 'none',
                    color: 'var(--forest-deep)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--neutral-cream)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = activeTab === 'profile' ? 'var(--neutral-cream)' : 'transparent')}
                >
                  <User size={15} color="var(--forest-emerald)" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    handleNavClick('settings');
                    setIsUserMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: activeTab === 'settings' ? 'var(--neutral-cream)' : 'transparent',
                    border: 'none',
                    color: 'var(--forest-deep)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--neutral-cream)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = activeTab === 'settings' ? 'var(--neutral-cream)' : 'transparent')}
                >
                  <Settings size={15} color="var(--forest-emerald)" />
                  <span>System Settings</span>
                </button>

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 0' }} />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} color="#dc2626" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Direct Sign Out Button */}
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm header-signout-btn"
            title="Sign out of BMS"
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--natural-sage)',
              background: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--natural-sage)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            <LogOut size={14} />
            <span style={{ fontSize: '0.775rem' }}>Sign Out</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="mobile-nav-toggle-btn"
            style={{
              display: 'none',
              padding: '0.45rem',
              background: 'var(--neutral-cream)',
              border: '1px solid var(--natural-sage)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--forest-deep)',
              cursor: 'pointer',
            }}
            aria-label="Toggle navigation bar"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: Horizontal Sub-Webpage Navigation Strip
          ========================================================================= */}
      <nav
        className="app-top-nav-strip"
        style={{
          background: 'var(--neutral-ivory)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.45rem clamp(1rem, 2.5vw, 2.25rem)',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          gap: '0.35rem',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`top-nav-tab ${isActive ? 'active' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.425rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: isActive
                  ? 'var(--forest-deep)'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(196, 164, 91, 0.45)'
                  : '1px solid transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 2px 8px rgba(21, 61, 43, 0.22)' : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(32, 86, 61, 0.08)';
                  e.currentTarget.style.color = 'var(--forest-deep)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon
                size={15}
                color={isActive ? 'var(--accent-gold)' : 'var(--natural-sage)'}
                style={{ flexShrink: 0 }}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* =========================================================================
          MOBILE COLLAPSIBLE MENU (When Screen Width < 900px)
          ========================================================================= */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            background: '#FFFFFF',
            borderBottom: '2px solid var(--forest-emerald)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--forest-deep)' : 'var(--neutral-cream)',
                  border: isActive ? '1px solid rgba(196, 164, 91, 0.45)' : '1px solid var(--natural-sage)',
                  color: isActive ? '#FFFFFF' : 'var(--forest-deep)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Icon size={17} color={isActive ? 'var(--accent-gold)' : 'var(--forest-emerald)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
