import React from 'react';
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
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'species', label: 'Species', icon: Bug, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'habitats', label: 'Habitats', icon: Trees, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'locations', label: 'Locations', icon: MapPin, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'researchers', label: 'Researchers', icon: GraduationCap, roles: ['Admin', 'Researcher', 'Viewer'] },
    { id: 'observations', label: 'Observations', icon: Eye, roles: ['Admin', 'Researcher', 'Viewer'] },
    { id: 'threats', label: 'Threats', icon: ShieldAlert, roles: ['Admin', 'Researcher', 'Conservation Officer'] },
    { id: 'conservation', label: 'Conservation Programs', icon: HeartHandshake, roles: ['Admin', 'Conservation Officer'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'sql-console', label: 'SQL Console', icon: Terminal, roles: ['Admin', 'Researcher'] },
    { id: 'profile', label: 'Profile', icon: User, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Researcher', 'Conservation Officer', 'Viewer'] },
  ];

  const currentRole = user?.role || 'Viewer';
  const navItems = allNavItems.filter((item) => !item.roles || item.roles.includes(currentRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 90,
            display: 'block',
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          height: '100vh',
          background: 'var(--forest-deep)',
          borderRight: '1px solid rgba(196, 164, 91, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.35rem 1.5rem',
            borderBottom: '1px solid rgba(196, 164, 91, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--forest-emerald) 0%, var(--forest-evergreen) 100%)',
                border: '1px solid rgba(196, 164, 91, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
              }}
            >
              🌿
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
                BIODIVERSITY
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--accent-gold)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Management System
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--natural-sage)',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onClose) onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(47, 118, 81, 0.45)' : 'transparent',
                  border: isActive ? '1px solid rgba(196, 164, 91, 0.35)' : '1px solid transparent',
                  color: isActive ? '#FFFFFF' : 'var(--natural-pale-sage)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--natural-pale-sage)';
                  }
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent-gold)' : 'var(--natural-sage)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid rgba(196, 164, 91, 0.15)',
            background: 'rgba(13, 38, 27, 0.65)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(47, 118, 81, 0.35)',
                border: '1px solid rgba(196, 164, 91, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                fontSize: '0.9rem',
              }}
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {user?.role || 'Viewer'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--natural-pale-sage)',
              borderColor: 'rgba(196, 164, 91, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.color = 'var(--forest-deep)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'var(--natural-pale-sage)';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
