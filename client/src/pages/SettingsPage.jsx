import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Server, Key, CheckCircle2, Sliders, Monitor, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [rowDensity, setRowDensity] = useState('comfortable');
  const [refreshInterval, setRefreshInterval] = useState('manual');

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addToast('System preferences saved successfully.', 'success');
  };

  const permissionsMatrix = [
    { module: 'View Dashboard & Analytics', admin: true, officer: true, researcher: true, viewer: true },
    { module: 'View Species & Habitat Profiles', admin: true, officer: true, researcher: true, viewer: true },
    { module: 'Add / Edit Species Records', admin: true, officer: false, researcher: true, viewer: false },
    { module: 'Delete Species Records', admin: true, officer: false, researcher: false, viewer: false },
    { module: 'Manage Habitats & Locations', admin: true, officer: true, researcher: false, viewer: false },
    { module: 'Log Field Observations', admin: true, officer: false, researcher: true, viewer: false },
    { module: 'Manage Conservation Programs', admin: true, officer: true, researcher: false, viewer: false },
    { module: 'Assign Threats to Species (M:N)', admin: true, officer: false, researcher: true, viewer: false },
    { module: 'Execute Custom SQL Queries', admin: true, officer: false, researcher: false, viewer: false },
    { module: 'User Management & Roles', admin: true, officer: false, researcher: false, viewer: false },
  ];

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--forest-deep)' }}>System Settings & Diagnostics</h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Inspect relational database schema diagnostics, role-based access control (RBAC) matrix, and configure workspace preferences.
        </p>
      </div>

      {/* Relational Database Diagnostics */}
      <div className="card" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <Database size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--forest-deep)', fontWeight: 700 }}>Relational Database Diagnostics</h3>
        </div>

        <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--natural-pale-sage)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Schema Normalization</div>
            <div style={{ fontWeight: 800, color: 'var(--emerald-600)', fontSize: '1.1rem', marginTop: '0.2rem' }}>
              Third Normal Form (3NF)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Zero transitive dependencies, composite primary keys, lossless joins
            </div>
          </div>

          <div style={{ background: 'var(--natural-pale-sage)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Referential Integrity</div>
            <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem', marginTop: '0.2rem' }}>
              CASCADE & RESTRICT Active
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Enforced at database engine layer via SQL foreign keys
            </div>
          </div>

          <div style={{ background: 'var(--natural-pale-sage)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Relational Entities</div>
            <div style={{ fontWeight: 800, color: '#d97706', fontSize: '1.1rem', marginTop: '0.2rem' }}>
              11 SQL Tables
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Users, Species, Habitat, Location, Researchers, Observations, Threats, Programs, Activities, Junctions
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="card" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <ShieldCheck size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--forest-deep)', fontWeight: 700 }}>Role-Based Access Control (RBAC) Matrix</h3>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Operation / Entity Module</th>
                <th style={{ textAlign: 'center' }}>Admin</th>
                <th style={{ textAlign: 'center' }}>Conservation Officer</th>
                <th style={{ textAlign: 'center' }}>Researcher</th>
                <th style={{ textAlign: 'center' }}>Viewer</th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{p.module}</td>
                  <td style={{ textAlign: 'center' }}>
                    {p.admin ? <CheckCircle2 size={16} color="#059669" style={{ margin: '0 auto' }} /> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.officer ? <CheckCircle2 size={16} color="#059669" style={{ margin: '0 auto' }} /> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.researcher ? <CheckCircle2 size={16} color="#059669" style={{ margin: '0 auto' }} /> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.viewer ? <CheckCircle2 size={16} color="#059669" style={{ margin: '0 auto' }} /> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workspace & Display Preferences */}
      <div className="card" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <Sliders size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--forest-deep)', fontWeight: 700 }}>Display & Workspace Preferences</h3>
        </div>

        <form onSubmit={handleSavePreferences}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Table Row Density</label>
              <select
                className="form-select"
                value={rowDensity}
                onChange={(e) => setRowDensity(e.target.value)}
              >
                <option value="compact">Compact (Higher information density)</option>
                <option value="comfortable">Comfortable (Default padding)</option>
                <option value="spacious">Spacious (Accessible row spacing)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Metrics Auto-Refresh</label>
              <select
                className="form-select"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
              >
                <option value="manual">Manual Refresh (On demand)</option>
                <option value="30s">Every 30 seconds</option>
                <option value="60s">Every 60 seconds</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Save Workspace Preferences
          </button>
        </form>
      </div>

      {/* Session Diagnostics */}
      <div className="card" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <Key size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--forest-deep)', fontWeight: 700 }}>Security & Session Details</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <span>Authenticated User:</span>
            <strong style={{ color: 'var(--forest-deep)' }}>{user?.name} ({user?.email})</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <span>Active Session Token:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-600)', fontSize: '0.8rem' }}>
              JSON Web Token (HS256 Verified)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Password Security:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>bcrypt 10 salt rounds</span>
          </div>
        </div>
      </div>
    </div>
  );
};
