import React, { useState } from 'react';
import { Settings, User, ShieldCheck, Database, Server, RefreshCw, Key, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.auth.updateProfile({ name: profileName, phone: profilePhone });
      if (res.success) {
        addToast(res.message, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Profile & System Settings</h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Manage your account credentials, view role-based access control (RBAC) privileges, and inspect relational database diagnostics.
        </p>
      </div>

      {/* User Profile Form */}
      <div className="card" style={{ background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <User size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Your Profile Information</h3>
        </div>

        <form onSubmit={handleUpdateProfile}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Primary Key ID)</label>
              <input
                type="email"
                disabled
                className="form-input"
                value={user?.email || ''}
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone Contact</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98450 XXXXX"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned System Role</label>
              <div
                style={{
                  padding: '0.65rem 0.9rem',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--emerald-600)',
                }}
              >
                <ShieldCheck size={16} />
                <span>{user?.role || 'Viewer'}</span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Relational Database Diagnostics */}
      <div className="card" style={{ background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <Database size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Relational Database Diagnostics</h3>
        </div>

        <div className="grid-3" style={{ marginBottom: '1rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schema Normalization</div>
            <div style={{ fontWeight: 800, color: 'var(--emerald-600)', fontSize: '1rem', marginTop: '0.2rem' }}>
              Third Normal Form (3NF)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Zero redundant columns, normalized foreign keys
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Foreign Key Enforcement</div>
            <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1rem', marginTop: '0.2rem' }}>
              CASCADE & RESTRICT Active
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Enforced at database engine layer
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Core Entities</div>
            <div style={{ fontWeight: 800, color: '#d97706', fontSize: '1rem', marginTop: '0.2rem' }}>
              11 Relational Tables
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Including M:N junction tables & constraints
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="card" style={{ background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <ShieldCheck size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Role-Based Access Control (RBAC) Matrix</h3>
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
                    {p.admin ? <CheckCircle2 size={16} color="#34d399" style={{ margin: '0 auto' }} /> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.officer ? <CheckCircle2 size={16} color="#34d399" style={{ margin: '0 auto' }} /> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.researcher ? <CheckCircle2 size={16} color="#34d399" style={{ margin: '0 auto' }} /> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.viewer ? <CheckCircle2 size={16} color="#34d399" style={{ margin: '0 auto' }} /> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
