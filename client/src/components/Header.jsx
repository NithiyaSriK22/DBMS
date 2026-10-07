import React from 'react';
import { Search, Bell, Database, Menu, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ title, subtitle, onOpenSearch, onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header
      className="app-header"
      style={{
        minHeight: '70px',
        padding: '0.75rem clamp(1rem, 2.5vw, 2rem)',
        background: 'var(--bg-surface)',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '200px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm mobile-sidebar-toggle"
          id="mobile-sidebar-toggle"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Search, Database Status, Role Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.5rem 1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            minWidth: '220px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--emerald-500)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Search size={15} color="var(--emerald-400)" />
          <span style={{ flex: 1, textAlign: 'left' }}>Search database...</span>
          <kbd
            style={{
              fontSize: '0.65rem',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              padding: '0.1rem 0.35rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            /
          </kbd>
        </button>

        {/* Database Relational Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            color: '#065f46',
          }}
          title="Relational 3NF Schema & Foreign Keys Enforced"
        >
          <Database size={13} color="#059669" />
          <span style={{ fontWeight: 600 }}>SQL Relational (3NF)</span>
        </div>

        {/* Role Indicator */}
        <div
          style={{
            padding: '0.35rem 0.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
          <span>{user?.role || 'Viewer'}</span>
        </div>
      </div>
    </header>
  );
};
