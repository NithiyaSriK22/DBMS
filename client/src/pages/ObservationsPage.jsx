import React, { useState, useEffect } from 'react';
import { Eye, Plus, Search, Filter, Calendar, MapPin, User, Trash2, Edit2, X, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const ObservationsPage = () => {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [observations, setObservations] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [speciesFilter, setSpeciesFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    speciesId: '',
    locationId: '',
    researcherId: '',
    observationDate: new Date().toISOString().split('T')[0],
    populationCount: 1,
    observationMethod: 'Camera Trap',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchObservations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (methodFilter !== 'All') params.method = methodFilter;
      if (speciesFilter !== 'All') params.speciesId = speciesFilter;

      const res = await api.observations.getAll(params);
      if (res.success) {
        setObservations(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch observations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [sRes, lRes, rRes] = await Promise.all([
        api.species.getAll(),
        api.locations.getAll(),
        api.researchers.getAll(),
      ]);
      if (sRes.success) setSpeciesList(sRes.data);
      if (lRes.success) setLocations(lRes.data);
      if (rRes.success) setResearchers(rRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchObservations();
    fetchDependencies();
  }, [methodFilter, speciesFilter]);

  const handleOpenEdit = (item) => {
    setEditTarget(item);
    setFormData({
      speciesId: item.Species_ID,
      locationId: item.Location_ID,
      researcherId: item.Researcher_ID,
      observationDate: item.Observation_Date,
      populationCount: item.Population_Count,
      observationMethod: item.Observation_Method,
      notes: item.Notes || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) {
        const res = await api.observations.update(editTarget.Observation_ID, formData);
        if (res.success) {
          addToast(res.message, 'success');
          setEditTarget(null);
          fetchObservations();
        }
      } else {
        const res = await api.observations.create(formData);
        if (res.success) {
          addToast(res.message, 'success');
          setIsAddModalOpen(false);
          setFormData({
            speciesId: speciesList[0]?.Species_ID || '',
            locationId: locations[0]?.Location_ID || '',
            researcherId: researchers[0]?.Researcher_ID || '',
            observationDate: new Date().toISOString().split('T')[0],
            populationCount: 1,
            observationMethod: 'Camera Trap',
            notes: '',
          });
          fetchObservations();
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to save observation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.observations.delete(deleteTarget.Observation_ID);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteTarget(null);
        fetchObservations();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete observation', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Species Observations</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Scientific field logs combining Species, Location, and Researcher relational foreign-key entities.
          </p>
        </div>

        {hasRole('Admin', 'Researcher') && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditTarget(null);
              setFormData({
                speciesId: speciesList[0]?.Species_ID || '',
                locationId: locations[0]?.Location_ID || '',
                researcherId: researchers[0]?.Researcher_ID || '',
                observationDate: new Date().toISOString().split('T')[0],
                populationCount: 1,
                observationMethod: 'Camera Trap',
                notes: '',
              });
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>+ Log Observation</span>
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
            placeholder="Search by Species, Researcher, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchObservations()}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Method:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="All">All Methods</option>
            <option value="Camera Trap">Camera Trap</option>
            <option value="Field Survey">Field Survey</option>
            <option value="Drone Survey">Drone Survey</option>
            <option value="GPS Tracking">GPS Tracking</option>
            <option value="Direct Observation">Direct Observation</option>
            <option value="Environmental DNA">Environmental DNA</option>
          </select>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchObservations}>
          Filter
        </button>
      </div>

      {/* OBSERVATIONS TABLE */}
      <div className="table-container">
        <table className="data-table" style={{ minWidth: '1080px' }}>
          <thead>
            <tr>
              <th style={{ width: '70px', whiteSpace: 'nowrap' }}>ID</th>
              <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>Species (FK)</th>
              <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Location (FK)</th>
              <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Researcher (FK)</th>
              <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>Date</th>
              <th style={{ minWidth: '90px', whiteSpace: 'nowrap' }}>Count</th>
              <th style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>Method</th>
              <th style={{ minWidth: '220px', whiteSpace: 'nowrap' }}>Field Notes</th>
              <th style={{ minWidth: '120px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                  Loading field observations...
                </td>
              </tr>
            ) : observations.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  No observations logged yet.
                </td>
              </tr>
            ) : (
              observations.map((obs) => (
                <tr key={obs.Observation_ID}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                    #{obs.Observation_ID}
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{obs.speciesName}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--emerald-600)', fontStyle: 'italic', fontWeight: 600 }}>
                        {obs.Scientific_Name}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{obs.Location_Name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{obs.State} ({obs.Habitat_Name})</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{obs.researcherName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{obs.Organization}</div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                    {obs.Observation_Date}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {obs.Population_Count}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge badge-role">{obs.Observation_Method}</span>
                  </td>
                  <td style={{ maxWidth: '240px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {obs.Notes || '—'}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                      {hasRole('Admin', 'Researcher') && (
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Edit"
                          onClick={() => handleOpenEdit(obs)}
                          style={{ padding: '0.45rem 0.65rem' }}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {hasRole('Admin', 'Researcher') && (
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete"
                          onClick={() => setDeleteTarget(obs)}
                          style={{ padding: '0.45rem 0.65rem' }}
                        >
                          <Trash2 size={14} />
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

      {/* ADD / EDIT OBSERVATION MODAL */}
      {(isAddModalOpen || editTarget) && (
        <div className="modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>{editTarget ? 'Edit Field Observation' : 'Log New Field Survey Observation'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Observed Species (FK) <span className="required">*</span></label>
                    <select
                      required
                      className="form-select"
                      value={formData.speciesId}
                      onChange={(e) => setFormData({ ...formData, speciesId: e.target.value })}
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
                    <label className="form-label">Location (FK) <span className="required">*</span></label>
                    <select
                      required
                      className="form-select"
                      value={formData.locationId}
                      onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    >
                      <option value="">-- Select Location --</option>
                      {locations.map((l) => (
                        <option key={l.Location_ID} value={l.Location_ID}>
                          {l.Location_Name}, {l.State}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Observing Researcher (FK) <span className="required">*</span></label>
                    <select
                      required
                      className="form-select"
                      value={formData.researcherId}
                      onChange={(e) => setFormData({ ...formData, researcherId: e.target.value })}
                    >
                      <option value="">-- Select Researcher --</option>
                      {researchers.map((r) => (
                        <option key={r.Researcher_ID} value={r.Researcher_ID}>
                          {r.Name} ({r.Organization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Observation Date <span className="required">*</span></label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={formData.observationDate}
                      onChange={(e) => setFormData({ ...formData, observationDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Population Count (Specimens) <span className="required">*</span></label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-input"
                      value={formData.populationCount}
                      onChange={(e) => setFormData({ ...formData, populationCount: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Observation Method <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.observationMethod}
                      onChange={(e) => setFormData({ ...formData, observationMethod: e.target.value })}
                    >
                      <option value="Camera Trap">Camera Trap</option>
                      <option value="Field Survey">Field Survey</option>
                      <option value="Drone Survey">Drone Survey</option>
                      <option value="GPS Tracking">GPS Tracking</option>
                      <option value="Direct Observation">Direct Observation</option>
                      <option value="Environmental DNA">Environmental DNA</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Field Notes & Behavioral Log</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Specific quadrant, animal behavior, breeding signals, environmental conditions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editTarget ? 'Update Log' : 'Save Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Field Observation Log?"
        message={`Are you sure you want to delete Observation record #${deleteTarget?.Observation_ID} (${deleteTarget?.speciesName} at ${deleteTarget?.Location_Name})?`}
        confirmText="Delete Record"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
