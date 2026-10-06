import React, { useState, useEffect } from 'react';
import { Trees, Plus, Search, Filter, Eye, Edit2, Trash2, X, MapPin, Bug, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const HabitatsPage = () => {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [habitats, setHabitats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewHabitat, setViewHabitat] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    habitatName: '',
    habitatType: 'Tropical Evergreen Forest',
    climate: '',
    area: 0,
    description: '',
    protectionStatus: 'National Park',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchHabitats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== 'All') params.type = typeFilter;
      const res = await api.habitats.getAll(params);
      if (res.success) {
        setHabitats(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch habitats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitats();
  }, [typeFilter]);

  const handleOpenView = async (id) => {
    setViewLoading(true);
    try {
      const res = await api.habitats.getById(id);
      if (res.success) {
        setViewHabitat(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load habitat details', 'error');
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditTarget(item);
    setFormData({
      habitatName: item.Habitat_Name,
      habitatType: item.Habitat_Type,
      climate: item.Climate,
      area: item.Area,
      description: item.Description || '',
      protectionStatus: item.Protection_Status || 'National Park',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) {
        const res = await api.habitats.update(editTarget.Habitat_ID, formData);
        if (res.success) {
          addToast(res.message, 'success');
          setEditTarget(null);
          fetchHabitats();
        }
      } else {
        const res = await api.habitats.create(formData);
        if (res.success) {
          addToast(res.message, 'success');
          setIsAddModalOpen(false);
          setFormData({
            habitatName: '',
            habitatType: 'Tropical Evergreen Forest',
            climate: '',
            area: 0,
            description: '',
            protectionStatus: 'National Park',
          });
          fetchHabitats();
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
      const res = await api.habitats.delete(deleteTarget.Habitat_ID);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteTarget(null);
        fetchHabitats();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete habitat', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Habitat Management</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Ecosystem biomes, geographic land cover in sq km, and protection statuses.
          </p>
        </div>

        {hasRole('Admin', 'Conservation Officer') && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditTarget(null);
              setFormData({
                habitatName: '',
                habitatType: 'Tropical Evergreen Forest',
                climate: '',
                area: 0,
                description: '',
                protectionStatus: 'National Park',
              });
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>+ Add Habitat</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-surface)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search habitats by name or climate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchHabitats()}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchHabitats}>
          Search
        </button>
      </div>

      {/* HABITATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            Loading habitats from relational database...
          </div>
        ) : habitats.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No habitats match your search.
          </div>
        ) : (
          habitats.map((h) => (
            <div key={h.Habitat_ID} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge badge-active">{h.Protection_Status}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    #{h.Habitat_ID}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.35rem' }}>{h.Habitat_Name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', fontWeight: 600, marginBottom: '0.6rem' }}>
                  {h.Habitat_Type}
                </div>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                  {h.Description || 'No detailed ecological description provided.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cover Area</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {Number(h.Area).toLocaleString()} km²
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Climate Zone</div>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.Climate}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>🐾 <strong>{h.speciesCount || 0}</strong> species</span>
                  <span>•</span>
                  <span>📍 <strong>{h.locationCount || 0}</strong> locations</span>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button className="btn btn-secondary btn-sm" title="View Habitat Details" onClick={() => handleOpenView(h.Habitat_ID)}>
                    <Eye size={13} />
                  </button>
                  {hasRole('Admin', 'Conservation Officer') && (
                    <button className="btn btn-secondary btn-sm" title="Edit" onClick={() => handleOpenEdit(h)}>
                      <Edit2 size={13} />
                    </button>
                  )}
                  {hasRole('Admin') && (
                    <button className="btn btn-danger btn-sm" title="Delete" onClick={() => setDeleteTarget(h)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* VIEW HABITAT DETAIL MODAL */}
      {viewHabitat && (
        <div className="modal-overlay" onClick={() => setViewHabitat(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trees size={20} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.2rem' }}>{viewHabitat.Habitat_Name}</h3>
              </div>
              <button onClick={() => setViewHabitat(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-3">
                <div className="card" style={{ background: 'var(--bg-card)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Biome Type</div>
                  <div style={{ fontWeight: 700, color: 'var(--emerald-400)', marginTop: '0.25rem' }}>{viewHabitat.Habitat_Type}</div>
                </div>
                <div className="card" style={{ background: 'var(--bg-card)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Area</div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>{Number(viewHabitat.Area).toLocaleString()} km²</div>
                </div>
                <div className="card" style={{ background: 'var(--bg-card)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protection Status</div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span className="badge badge-active">{viewHabitat.Protection_Status}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Inhabiting Species Records</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {viewHabitat.species?.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No species currently linked in Species_Habitat junction table.</div>
                  ) : (
                    viewHabitat.species?.map((s) => (
                      <div key={s.Species_ID} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>{s.Common_Name} ({s.Scientific_Name})</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>Pop: {Number(s.habitatPopulation || 0).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Protected Geographic Locations</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {viewHabitat.locations?.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No location records currently assigned.</div>
                  ) : (
                    viewHabitat.locations?.map((l) => (
                      <div key={l.Location_ID} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <span>📍 {l.Location_Name}, {l.State}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{l.observationCount || 0} observations</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewHabitat(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editTarget) && (
        <div className="modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>{editTarget ? 'Edit Habitat Record' : 'Add New Habitat'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Habitat Name (Unique) <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Sundarbans Mangrove Delta"
                    value={formData.habitatName}
                    onChange={(e) => setFormData({ ...formData, habitatName: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Habitat Type <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.habitatType}
                      onChange={(e) => setFormData({ ...formData, habitatType: e.target.value })}
                    >
                      <option value="Tropical Evergreen Forest">Tropical Evergreen Forest</option>
                      <option value="Mangrove Forest">Mangrove Forest</option>
                      <option value="Grassland">Grassland</option>
                      <option value="Coral Reef">Coral Reef</option>
                      <option value="Mountain Ecosystem">Mountain Ecosystem</option>
                      <option value="Dry Deciduous Forest">Dry Deciduous Forest</option>
                      <option value="Wetland">Wetland</option>
                      <option value="Desert">Desert</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Protection Status</label>
                    <select
                      className="form-select"
                      value={formData.protectionStatus}
                      onChange={(e) => setFormData({ ...formData, protectionStatus: e.target.value })}
                    >
                      <option value="National Park">National Park</option>
                      <option value="Wildlife Sanctuary">Wildlife Sanctuary</option>
                      <option value="UNESCO World Heritage">UNESCO World Heritage</option>
                      <option value="Biosphere Reserve">Biosphere Reserve</option>
                      <option value="Ramsar Wetland Site">Ramsar Wetland Site</option>
                      <option value="Protected Forest">Protected Forest</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Climate Description <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Humid Tropical / Monsoon"
                      value={formData.climate}
                      onChange={(e) => setFormData({ ...formData, climate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cover Area (sq km)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ecological Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Ecological characteristics, canopy layers, key flora..."
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
                  {submitting ? 'Saving...' : editTarget ? 'Update Habitat' : 'Save Habitat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title={`Delete Habitat "${deleteTarget?.Habitat_Name}"?`}
        message={`Are you sure you want to delete Habitat #${deleteTarget?.Habitat_ID}? If any locations or species records are strictly linked, DBMS referential integrity will prevent deletion.`}
        confirmText="Delete Habitat"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
