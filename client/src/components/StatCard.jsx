import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtitle, change, onClick }) => {
  const colorMap = {
    emerald: {
      bg: 'var(--natural-pale-sage)',
      border: 'var(--natural-sage)',
      text: 'var(--forest-evergreen)',
    },
    amber: {
      bg: 'rgba(196, 164, 91, 0.15)',
      border: 'rgba(196, 164, 91, 0.4)',
      text: '#8C6D27',
    },
    red: {
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#991B1B',
    },
    blue: {
      bg: '#F0F9FF',
      border: '#BAE6FD',
      text: '#0284C7',
    },
    purple: {
      bg: '#FAF5FF',
      border: '#E9D5FF',
      text: '#7E22CE',
    },
    moss: {
      bg: 'rgba(120, 139, 80, 0.15)',
      border: 'rgba(120, 139, 80, 0.35)',
      text: 'var(--natural-moss)',
    },
  };

  const theme = colorMap[color] || colorMap.emerald;

  return (
    <div
      className="card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--forest-emerald)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={19} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--forest-deep)', fontFamily: 'var(--font-heading)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value || '0'}
        </span>
      </div>

      {(subtitle || change) && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {change && <span style={{ color: theme.text, fontWeight: 600 }}>{change}</span>}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
