import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, Calendar, Key, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.auth.updateProfile({ name, phone });
      if (res.success) {
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const rolePrivileges = {
    Admin: [
      'Full CRUD access to Species, Habitats, Locations, Researchers, and Threats',
      'Create and update Conservation Programs and field milestone activities',
      'Manage User accounts and assign role-based system permissions',
      'Execute direct and predefined SQL evaluation queries in the DBMS Console',
      'Export system-wide analytical CSV reports',
    ],
    Researcher: [
      'Record and update scientific field observations and specimen telemetry',
      'Create and update species biological catalog records and taxonomy',
      'Link identified ecological and anthropogenic threats to species',
      'Inspect habitat biomes, geographic coordinates, and research profiles',
      'View biodiversity analytics and researcher productivity metrics',
    ],
    'Conservation Officer': [
      'Coordinate and manage state-funded biodiversity conservation programs',
      'Log program milestones, patrols, and field conservation activities',
      'Monitor habitat regions, ecosystems, and ecological threat levels',
      'Inspect species classifications and population census trends',
      'Generate conservation program progress and budget reports',
    ],
    Viewer: [
      'Read-only access to ecological dashboards, species profiles, and biomes',
      'Inspect recorded observation surveys and research profiles',
      'Filter and search biodiversity records by taxa, status, and region',
      'Generate and inspect relational SQL analytics and CSV reports',
      'Strictly restricted from creating, modifying, or deleting database records',
    ],
  };

  const privileges = rolePrivileges[user?.role] || rolePrivileges.Viewer;

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--forest-deep)' }}>User Profile & Identity</h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          View authenticated credentials, role-based authorization level, and update personal contact information.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ background: '#ffffff', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            color: '#ffffff',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
          }}
        >
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--forest-deep)' }}>{user?.name || 'Authorized User'}</h3>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ShieldCheck size={14} />
              {user?.role || 'Viewer'}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            <Mail size={14} color="var(--text-muted)" />
            <span>{user?.email || 'user@biodiversity.org'}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="card" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <User size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--forest-deep)', fontWeight: 700 }}>Personal Information</h3>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                disabled
                className="form-input"
                value={user?.email || ''}
                style={{ opacity: 0.65, cursor: 'not-allowed', background: 'var(--natural-pale-sage)' }}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone Contact</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 XXXXX"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role</label>
              <div
                style={{
                  padding: '0.65rem 0.9rem',
                  background: 'var(--natural-pale-sage)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--forest-evergreen)',
                }}
              >
                <Lock size={15} color="var(--text-muted)" />
                <span>{user?.role || 'Viewer'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 400 }}>
                  Managed by DB Admin
                </span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Role Authorized Capabilities */}
      <div className="card" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <ShieldCheck size={18} color="var(--emerald-600)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--forest-deep)', fontWeight: 700 }}>
            Authorized Permissions for {user?.role || 'Viewer'}
          </h3>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {privileges.map((p, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
