import React from 'react';
import { Search, Bell, Menu, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ title, subtitle, onOpenSearch, onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header
      className="app-header"
      style={{
        minHeight: '72px',
        padding: '0.85rem clamp(1rem, 2.5vw, 2.25rem)',
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
        flexWrap: 'wrap',
        gap: '0.75rem 1rem',
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '200px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm mobile-sidebar-toggle"
          id="mobile-sidebar-toggle"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--forest-deep)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Search, Database Status, Role Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.5rem 1rem',
            background: 'var(--neutral-cream)',
            border: '1px solid var(--natural-sage)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            fontSize: '0.825rem',
            cursor: 'pointer',
            minWidth: '220px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--forest-emerald)';
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.color = 'var(--forest-deep)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--natural-sage)';
            e.currentTarget.style.background = 'var(--neutral-cream)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Search size={15} color="var(--forest-emerald)" />
          <span style={{ flex: 1, textAlign: 'left' }}>Search database...</span>
          <kbd
            style={{
              fontSize: '0.65rem',
              background: '#FFFFFF',
              border: '1px solid var(--natural-sage)',
              padding: '0.1rem 0.35rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--forest-deep)',
              fontWeight: 600,
            }}
          >
            /
          </kbd>
        </button>

        {/* Role Indicator */}
        <div
          style={{
            padding: '0.4rem 0.85rem',
            background: 'var(--neutral-cream)',
            border: '1px solid var(--natural-sage)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.775rem',
            fontWeight: 600,
            color: 'var(--forest-deep)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--forest-emerald)' }} />
          <span>{user?.role || 'Viewer'}</span>
        </div>
      </div>
    </header>
  );
};
