import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Filter, Eye, Edit2, Trash2, X, Globe, Navigation, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const LocationsPage = () => {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [locations, setLocations] = useState([]);
  const [habitats, setHabitats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    locationName: '',
    state: '',
    country: 'India',
    latitude: '',
    longitude: '',
    habitatId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (stateFilter !== 'All') params.state = stateFilter;
      const res = await api.locations.getAll(params);
      if (res.success) {
        setLocations(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHabitats = async () => {
    try {
      const res = await api.habitats.getAll();
      if (res.success) setHabitats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchHabitats();
  }, [stateFilter]);

  const handleOpenEdit = (item) => {
    setEditTarget(item);
    setFormData({
      locationName: item.Location_Name,
      state: item.State,
      country: item.Country || 'India',
      latitude: item.Latitude,
      longitude: item.Longitude,
      habitatId: item.Habitat_ID,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) {
        const res = await api.locations.update(editTarget.Location_ID, formData);
        if (res.success) {
          addToast(res.message, 'success');
          setEditTarget(null);
          fetchLocations();
        }
      } else {
        const res = await api.locations.create(formData);
        if (res.success) {
          addToast(res.message, 'success');
          setIsAddModalOpen(false);
          setFormData({
            locationName: '',
            state: '',
            country: 'India',
            latitude: '',
            longitude: '',
            habitatId: '',
          });
          fetchLocations();
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
      const res = await api.locations.delete(deleteTarget.Location_ID);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteTarget(null);
        fetchLocations();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete location', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const uniqueStates = ['All', ...new Set(locations.map((l) => l.State).filter(Boolean))];

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Biodiversity Locations</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Geographical sanctuaries, GPS coordinates, and foreign-key mapped habitat zones.
          </p>
        </div>

        {hasRole('Admin', 'Conservation Officer') && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditTarget(null);
              setFormData({
                locationName: '',
                state: '',
                country: 'India',
                latitude: '',
                longitude: '',
                habitatId: habitats[0]?.Habitat_ID || '',
              });
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>+ Add Location</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-surface)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by Location, State, or Habitat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLocations()}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>State:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchLocations}>
          Search
        </button>
      </div>

      {/* LOCATIONS TABLE */}
      <div className="table-container">
        <table className="data-table" style={{ minWidth: '980px' }}>
          <thead>
            <tr>
              <th style={{ width: '70px', whiteSpace: 'nowrap' }}>ID</th>
              <th style={{ minWidth: '220px', whiteSpace: 'nowrap' }}>Location Name</th>
              <th style={{ minWidth: '160px', whiteSpace: 'nowrap' }}>State / Country</th>
              <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Linked Habitat (FK)</th>
              <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>GPS Coordinates</th>
              <th style={{ minWidth: '160px', whiteSpace: 'nowrap' }}>Activity Count</th>
              <th style={{ minWidth: '120px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                  Loading geographical coordinates...
                </td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  No location records found.
                </td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.Location_ID}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                    #{loc.Location_ID}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} color="var(--emerald-600)" />
                      <span>{loc.Location_Name}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{loc.State}, {loc.Country}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge badge-role" title={loc.Habitat_Type}>
                      🌳 {loc.Habitat_Name}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {Number(loc.Latitude).toFixed(4)}° N, {Number(loc.Longitude).toFixed(4)}° E
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      <span style={{ background: '#f8fafc', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>🐾 {loc.speciesCount || 0} species</span>
                      <span style={{ background: '#f8fafc', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>👁️ {loc.observationCount || 0} obs</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                      {hasRole('Admin', 'Conservation Officer') && (
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Edit"
                          onClick={() => handleOpenEdit(loc)}
                          style={{ padding: '0.45rem 0.65rem' }}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {hasRole('Admin') && (
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete"
                          onClick={() => setDeleteTarget(loc)}
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

      {/* ADD / EDIT LOCATION MODAL */}
      {(isAddModalOpen || editTarget) && (
        <div className="modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>{editTarget ? 'Edit Location' : 'Register New Location'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location / Sector Name <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Silent Valley Core Zone"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">State / Province <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Kerala"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Latitude (Decimal) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      className="form-input"
                      placeholder="e.g. 11.083333"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Longitude (Decimal) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      className="form-input"
                      placeholder="e.g. 76.450000"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Linked Habitat (Foreign Key) <span className="required">*</span></label>
                  <select
                    required
                    className="form-select"
                    value={formData.habitatId}
                    onChange={(e) => setFormData({ ...formData, habitatId: e.target.value })}
                  >
                    <option value="">-- Select Habitat --</option>
                    {habitats.map((h) => (
                      <option key={h.Habitat_ID} value={h.Habitat_ID}>
                        {h.Habitat_Name} ({h.Habitat_Type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editTarget ? 'Update Location' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title={`Delete Location "${deleteTarget?.Location_Name}"?`}
        message={`Are you sure you want to delete Location #${deleteTarget?.Location_ID}? Any associated species observations or conservation programs will trigger relational foreign-key restriction rules.`}
        confirmText="Delete Location"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
