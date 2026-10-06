import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Search, Filter, Eye, Edit2, Trash2, X, Link as LinkIcon, Bug, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const ThreatsPage = () => {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [threats, setThreats] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewThreat, setViewThreat] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    threatName: '',
    threatType: 'Human',
    severity: 'Critical',
    description: '',
  });

  const [linkData, setLinkData] = useState({
    speciesId: '',
    threatId: '',
    impactLevel: 'Critical',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (severityFilter !== 'All') params.severity = severityFilter;
      const res = await api.threats.getAll(params);
      if (res.success) {
        setThreats(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch threats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecies = async () => {
    try {
      const res = await api.species.getAll();
      if (res.success) setSpeciesList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThreats();
    fetchSpecies();
  }, [severityFilter]);

  const handleOpenView = async (id) => {
    setViewLoading(true);
    try {
      const res = await api.threats.getById(id);
      if (res.success) {
        setViewThreat(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load threat details', 'error');
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditTarget(item);
    setFormData({
      threatName: item.Threat_Name,
      threatType: item.Threat_Type,
      severity: item.Severity,
      description: item.Description || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) {
        const res = await api.threats.update(editTarget.Threat_ID, formData);
        if (res.success) {
          addToast(res.message, 'success');
          setEditTarget(null);
          fetchThreats();
        }
      } else {
        const res = await api.threats.create(formData);
        if (res.success) {
          addToast(res.message, 'success');
          setIsAddModalOpen(false);
          setFormData({
            threatName: '',
            threatType: 'Human',
            severity: 'Critical',
            description: '',
          });
          fetchThreats();
        }
      }
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.threats.link(linkData);
      if (res.success) {
        addToast(res.message, 'success');
        setIsLinkModalOpen(false);
        fetchThreats();
      }
    } catch (err) {
      addToast(err.message || 'Failed to link threat', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.threats.delete(deleteTarget.Threat_ID);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteTarget(null);
        fetchThreats();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete threat', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Threat Analysis & Risks</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Anthropogenic and environmental drivers of extinction mapped across vulnerable taxa in 3NF.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {hasRole('Admin', 'Researcher') && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setLinkData({
                    speciesId: speciesList[0]?.Species_ID || '',
                    threatId: threats[0]?.Threat_ID || '',
                    impactLevel: 'Critical',
                    description: '',
                  });
                  setIsLinkModalOpen(true);
                }}
              >
                <LinkIcon size={15} />
                <span>Link to Species (M:N)</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditTarget(null);
                  setFormData({
                    threatName: '',
                    threatType: 'Human',
                    severity: 'Critical',
                    description: '',
                  });
                  setIsAddModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>+ Add Threat Factor</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-surface)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by Threat Name or Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchThreats()}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Severity:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchThreats}>
          Search
        </button>
      </div>

      {/* THREATS TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Threat Name</th>
              <th>Classification</th>
              <th>Severity</th>
              <th>Impacted Species Count</th>
              <th>Risk Description</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                  Loading threat matrix...
                </td>
              </tr>
            ) : threats.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No threats found.
                </td>
              </tr>
            ) : (
              threats.map((t) => (
                <tr key={t.Threat_ID}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    #{t.Threat_ID}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{t.Threat_Name}</div>
                  </td>
                  <td>
                    <span className="badge badge-role">{t.Threat_Type}</span>
                  </td>
                  <td>
                    <StatusBadge status={t.Severity} />
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: t.Severity === 'Critical' ? '#f87171' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      ⚠️ {t.affectedSpeciesCount || 0} species
                    </span>
                  </td>
                  <td style={{ maxWidth: '280px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {t.Description || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" title="View Affected Species" onClick={() => handleOpenView(t.Threat_ID)}>
                        <Eye size={13} />
                      </button>
                      {hasRole('Admin', 'Researcher') && (
                        <button className="btn btn-secondary btn-sm" title="Edit" onClick={() => handleOpenEdit(t)}>
                          <Edit2 size={13} />
                        </button>
                      )}
                      {hasRole('Admin') && (
                        <button className="btn btn-danger btn-sm" title="Delete" onClick={() => setDeleteTarget(t)}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW THREAT DETAILS MODAL */}
      {viewThreat && (
        <div className="modal-overlay" onClick={() => setViewThreat(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color="#f87171" />
                <h3 style={{ fontSize: '1.2rem' }}>{viewThreat.Threat_Name}</h3>
              </div>
              <button onClick={() => setViewThreat(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-2">
                <div className="card" style={{ background: 'var(--bg-card)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type Classification</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewThreat.Threat_Type}</div>
                </div>
                <div className="card" style={{ background: 'var(--bg-card)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Severity Level</div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <StatusBadge status={viewThreat.Severity} />
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Impacted Species ({viewThreat.affectedSpecies?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {viewThreat.affectedSpecies?.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No species currently mapped to this threat.</div>
                  ) : (
                    viewThreat.affectedSpecies?.map((s) => (
                      <div key={s.Species_ID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>{s.Common_Name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.impactDescription || 'High degradation impact'}</div>
                        </div>
                        <StatusBadge status={s.Impact_Level || s.Conservation_Status} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewThreat(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT THREAT MODAL */}
      {(isAddModalOpen || editTarget) && (
        <div className="modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>{editTarget ? 'Edit Threat Factor' : 'Register New Threat Factor'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Threat Name (Unique) <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Commercial Deforestation & Shola Fragmentation"
                    value={formData.threatName}
                    onChange={(e) => setFormData({ ...formData, threatName: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Threat Type <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.threatType}
                      onChange={(e) => setFormData({ ...formData, threatType: e.target.value })}
                    >
                      <option value="Human">Human / Anthropogenic</option>
                      <option value="Natural">Natural</option>
                      <option value="Environmental">Environmental Pollution</option>
                      <option value="Climate-related">Climate-related</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Severity Level <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    >
                      <option value="Critical">Critical Alert</option>
                      <option value="High">High Severity</option>
                      <option value="Medium">Medium Concern</option>
                      <option value="Low">Low Concern</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Ecological mechanism, severity factors, and mitigation protocols..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editTarget ? 'Update Threat' : 'Save Threat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK THREAT TO SPECIES MODAL (M:N JUNCTION) */}
      {isLinkModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLinkModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Link Threat to Species (Species_Threat M:N)</h3>
              <button onClick={() => setIsLinkModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLinkSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Species <span className="required">*</span></label>
                  <select
                    required
                    className="form-select"
                    value={linkData.speciesId}
                    onChange={(e) => setLinkData({ ...linkData, speciesId: e.target.value })}
                  >
                    <option value="">-- Select Species --</option>
                    {speciesList.map((s) => (
                      <option key={s.Species_ID} value={s.Species_ID}>
                        {s.Common_Name} ({s.Scientific_Name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Threat Factor <span className="required">*</span></label>
                  <select
                    required
                    className="form-select"
                    value={linkData.threatId}
                    onChange={(e) => setLinkData({ ...linkData, threatId: e.target.value })}
                  >
                    <option value="">-- Select Threat --</option>
                    {threats.map((t) => (
                      <option key={t.Threat_ID} value={t.Threat_ID}>
                        {t.Threat_Name} ({t.Severity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Impact Level on this Specific Species <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={linkData.impactLevel}
                    onChange={(e) => setLinkData({ ...linkData, impactLevel: e.target.value })}
                  >
                    <option value="Critical">Critical Impact</option>
                    <option value="High">High Impact</option>
                    <option value="Medium">Medium Impact</option>
                    <option value="Low">Low Impact</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Specific Impact Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Arboreal canopy fragmentation preventing foraging across shola gaps..."
                    value={linkData.description}
                    onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsLinkModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Linking...' : 'Establish Relational Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title={`Delete Threat "${deleteTarget?.Threat_Name}"?`}
        message={`Are you sure you want to delete Threat #${deleteTarget?.Threat_ID}? This will cascade delete linked rows in the Species_Threat junction table.`}
        confirmText="Delete Threat"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
