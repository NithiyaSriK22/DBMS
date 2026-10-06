import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Search, Mail, Phone, Building, Award, Eye, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const ResearchersPage = () => {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    specialization: 'Wildlife Biology',
    experienceYears: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResearchers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (specializationFilter !== 'All') params.specialization = specializationFilter;
      const res = await api.researchers.getAll(params);
      if (res.success) {
        setResearchers(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch researchers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchers();
  }, [specializationFilter]);

  const handleOpenEdit = (item) => {
    setEditTarget(item);
    setFormData({
      name: item.Name,
      email: item.Email,
      phone: item.Phone || '',
      organization: item.Organization,
      specialization: item.Specialization,
      experienceYears: item.Experience_Years,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) {
        const res = await api.researchers.update(editTarget.Researcher_ID, formData);
        if (res.success) {
          addToast(res.message, 'success');
          setEditTarget(null);
          fetchResearchers();
        }
      } else {
        const res = await api.researchers.create(formData);
        if (res.success) {
          addToast(res.message, 'success');
          setIsAddModalOpen(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            organization: '',
            specialization: 'Wildlife Biology',
            experienceYears: 5,
          });
          fetchResearchers();
        }
      }
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.researchers.delete(deleteTarget.Researcher_ID);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteTarget(null);
        fetchResearchers();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete researcher', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Researchers & Field Scientists</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Scientific faculty, organizations, and linked field observation contributions.
          </p>
        </div>

        {hasRole('Admin') && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditTarget(null);
              setFormData({
                name: '',
                email: '',
                phone: '',
                organization: '',
                specialization: 'Wildlife Biology',
                experienceYears: 5,
              });
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>+ Add Researcher</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-surface)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by Name, Organization, Specialization, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchResearchers()}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchResearchers}>
          Search
        </button>
      </div>

      {/* RESEARCHERS CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            Loading scientific faculty...
          </div>
        ) : researchers.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No researchers found.
          </div>
        ) : (
          researchers.map((r) => (
            <div key={r.Researcher_ID} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.2))',
                        border: '1px solid var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        color: 'var(--emerald-400)',
                      }}
                    >
                      {r.Name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>{r.Name}</h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                        {r.Specialization}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    #{r.Researcher_ID}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <Building size={14} color="var(--text-muted)" />
                  <span>{r.Organization}</span>
                </div>

                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', background: 'var(--bg-surface)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={13} />
                    <span>{r.Email}</span>
                  </div>
                  {r.Phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={13} />
                      <span>{r.Phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 700 }}>
                    👁️ {r.observationCount || 0} Surveys Logged
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {r.Experience_Years} years experience
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {hasRole('Admin') && (
                    <>
                      <button className="btn btn-secondary btn-sm" title="Edit" onClick={() => handleOpenEdit(r)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-danger btn-sm" title="Delete" onClick={() => setDeleteTarget(r)}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editTarget) && (
        <div className="modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>{editTarget ? 'Edit Researcher Profile' : 'Register New Researcher'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name & Title <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Dr. K. Ullas Karanth"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address (Unique) <span className="required">*</span></label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="name@organization.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Contact</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98450 XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Organization / Institution <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Wildlife Conservation Society / Wildlife Institute of India"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Specialization <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Mammalogy / Carnivore Ecology"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editTarget ? 'Update Profile' : 'Save Researcher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title={`Delete Researcher "${deleteTarget?.Name}"?`}
        message={`Are you sure you want to delete Researcher record #${deleteTarget?.Researcher_ID}? If they have field observations registered in the database, referential integrity will prevent deletion.`}
        confirmText="Delete Researcher"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
