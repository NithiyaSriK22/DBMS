import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtitle, change }) => {
  const colorMap = {
    emerald: {
      bg: '#ecfdf5',
      border: '#a7f3d0',
      text: '#059669',
    },
    amber: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#d97706',
    },
    red: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#dc2626',
    },
    blue: {
      bg: '#f0f9ff',
      border: '#bae6fd',
      text: '#0284c7',
    },
    purple: {
      bg: '#faf5ff',
      border: '#e9d5ff',
      text: '#9333ea',
    },
  };

  const theme = colorMap[color] || colorMap.emerald;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
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
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
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
