import React from 'react';

export const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  let badgeClass = 'badge-lc';
  const s = String(status).toLowerCase();

  if (s.includes('critically endangered') || s === 'critical') {
    badgeClass = 'badge-crit';
  } else if (s.includes('endangered') || s === 'high') {
    badgeClass = 'badge-end';
  } else if (s.includes('vulnerable') || s === 'medium') {
    badgeClass = 'badge-vuln';
  } else if (s.includes('near threatened') || s === 'low') {
    badgeClass = 'badge-nt';
  } else if (s.includes('least concern')) {
    badgeClass = 'badge-lc';
  } else if (s === 'active') {
    badgeClass = 'badge-active';
  } else if (s === 'planned') {
    badgeClass = 'badge-planned';
  } else if (s === 'completed') {
    badgeClass = 'badge-completed';
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};
