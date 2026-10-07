import React, { useState, useEffect } from 'react';
import {
  Bug,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  Trees,
  ShieldAlert,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const SpeciesPage = ({ openAddDirectly = false }) => {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [speciesList, setSpeciesList] = useState([]);
  const [habitats, setHabitats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddDirectly);
  const [editTarget, setEditTarget] = useState(null);
  const [viewProfileId, setViewProfileId] = useState(null);
  const [speciesProfile, setSpeciesProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('overview');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    commonName: '',
    scientificName: '',
    speciesType: 'Mammal',
    family: '',
    conservationStatus: 'Least Concern',
    populationEstimate: 0,
    description: '',
    discoveryDate: '',
    imageUrl: '',
    selectedHabitatId: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchSpecies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== 'All') params.type = typeFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.species.getAll(params);
      if (res.success) {
        setSpeciesList(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch species records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHabitatsList = async () => {
    try {
      const res = await api.habitats.getAll();
      if (res.success) setHabitats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSpecies();
    fetchHabitatsList();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSpecies();
  };

  // View Profile
  const handleOpenProfile = async (id) => {
    setViewProfileId(id);
    setProfileLoading(true);
    setActiveProfileTab('overview');
    try {
      const res = await api.species.getById(id);
      if (res.success) {
        setSpeciesProfile(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load species profile', 'error');
      setViewProfileId(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditTarget(item);
    setFormData({
      commonName: item.Common_Name,
      scientificName: item.Scientific_Name,
      speciesType: item.Species_Type,
      family: item.Family,
      conservationStatus: item.Conservation_Status,
      populationEstimate: item.Population_Estimate,
      description: item.Description || '',
      discoveryDate: item.Discovery_Date || '',
      imageUrl: item.Image_Url || '',
      selectedHabitatId: '',
    });
  };

  // Submit Add or Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (editTarget) {
        const res = await api.species.update(editTarget.Species_ID, formData);
        if (res.success) {
          addToast(res.message, 'success');
          setEditTarget(null);
          fetchSpecies();
        }
      } else {
        const payload = {
          ...formData,
          habitatIds: formData.selectedHabitatId ? [formData.selectedHabitatId] : [],
        };
        const res = await api.species.create(payload);
        if (res.success) {
          addToast(res.message, 'success');
          setIsAddModalOpen(false);
          setFormData({
            commonName: '',
            scientificName: '',
            speciesType: 'Mammal',
            family: '',
            conservationStatus: 'Least Concern',
            populationEstimate: 0,
            description: '',
            discoveryDate: '',
            imageUrl: '',
            selectedHabitatId: '',
          });
          fetchSpecies();
        }
      }
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.species.delete(deleteTarget.Species_ID);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteTarget(null);
        fetchSpecies();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete species', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Species Management</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Curate and manage biological records, IUCN conservation statuses, and population census in 3NF.
          </p>
        </div>

        {hasRole('Admin', 'Researcher') && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditTarget(null);
              setFormData({
                commonName: '',
                scientificName: '',
                speciesType: 'Mammal',
                family: '',
                conservationStatus: 'Least Concern',
                populationEstimate: 0,
                description: '',
                discoveryDate: '',
                imageUrl: '',
                selectedHabitatId: '',
              });
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>+ Add Species</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'var(--bg-surface)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search by Common Name, Scientific Name, Family..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Mammal">Mammal</option>
            <option value="Bird">Bird</option>
            <option value="Reptile">Reptile</option>
            <option value="Amphibian">Amphibian</option>
            <option value="Fish">Fish</option>
            <option value="Plant">Plant</option>
            <option value="Insect">Insect</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Critically Endangered">Critically Endangered</option>
            <option value="Endangered">Endangered</option>
            <option value="Vulnerable">Vulnerable</option>
            <option value="Near Threatened">Near Threatened</option>
            <option value="Least Concern">Least Concern</option>
          </select>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchSpecies} title="Reload records">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* SPECIES DATA TABLE */}
      <div className="table-container">
        <table className="data-table" style={{ minWidth: '1020px' }}>
          <thead>
            <tr>
              <th style={{ width: '70px', whiteSpace: 'nowrap' }}>ID</th>
              <th style={{ minWidth: '220px', whiteSpace: 'nowrap' }}>Species</th>
              <th style={{ minWidth: '110px', whiteSpace: 'nowrap' }}>Type</th>
              <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>Family</th>
              <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Conservation Status</th>
              <th style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>Population Est.</th>
              <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Relational Links</th>
              <th style={{ minWidth: '130px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                  Loading relational species records...
                </td>
              </tr>
            ) : speciesList.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  <Bug size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No species records found</div>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try modifying filters or add a new species record.</p>
                </td>
              </tr>
            ) : (
              speciesList.map((item) => (
                <tr key={item.Species_ID}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                    #{item.Species_ID}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={item.Image_Url || 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=150&q=80'}
                        alt={item.Common_Name}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          border: '1px solid var(--border-subtle)',
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.925rem' }}>{item.Common_Name}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--emerald-600)', fontStyle: 'italic', fontWeight: 600 }}>
                          {item.Scientific_Name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge badge-role">{item.Species_Type}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{item.Family}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <StatusBadge status={item.Conservation_Status} />
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {item.Population_Estimate ? Number(item.Population_Estimate).toLocaleString() : 'Unknown'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      <span title="Linked Habitats" style={{ background: '#f8fafc', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>🌳 {item.habitatCount || 0}</span>
                      <span title="Threats" style={{ background: '#f8fafc', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>⚠️ {item.threatCount || 0}</span>
                      <span title="Observations" style={{ background: '#f8fafc', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>👁️ {item.observationCount || 0}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="View Complete Relational Profile"
                        onClick={() => handleOpenProfile(item.Species_ID)}
                        style={{ padding: '0.45rem 0.65rem' }}
                      >
                        <Eye size={15} />
                      </button>

                      {hasRole('Admin', 'Researcher') && (
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Edit Species"
                          onClick={() => handleOpenEdit(item)}
                          style={{ padding: '0.45rem 0.65rem' }}
                        >
                          <Edit2 size={15} />
                        </button>
                      )}

                      {hasRole('Admin') && (
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Species"
                          onClick={() => setDeleteTarget(item)}
                          style={{ padding: '0.45rem 0.65rem' }}
                        >
                          <Trash2 size={15} />
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

      {/* ADD / EDIT SPECIES MODAL */}
      {(isAddModalOpen || editTarget) && (
        <div className="modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bug size={20} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.15rem' }}>{editTarget ? 'Edit Species Record' : 'Add New Species to Registry'}</h3>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Common Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Bengal Tiger"
                      value={formData.commonName}
                      onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Scientific Name (Unique) <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Panthera tigris tigris"
                      value={formData.scientificName}
                      onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Species Type <span className="required">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.speciesType}
                      onChange={(e) => setFormData({ ...formData, speciesType: e.target.value })}
                    >
                      <option value="Mammal">Mammal</option>
                      <option value="Bird">Bird</option>
                      <option value="Reptile">Reptile</option>
                      <option value="Amphibian">Amphibian</option>
                      <option value="Fish">Fish</option>
                      <option value="Plant">Plant</option>
                      <option value="Insect">Insect</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Family <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Felidae"
                      value={formData.family}
                      onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Conservation Status <span className="required">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.conservationStatus}
                      onChange={(e) => setFormData({ ...formData, conservationStatus: e.target.value })}
                    >
                      <option value="Critically Endangered">Critically Endangered</option>
                      <option value="Endangered">Endangered</option>
                      <option value="Vulnerable">Vulnerable</option>
                      <option value="Near Threatened">Near Threatened</option>
                      <option value="Least Concern">Least Concern</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Population Estimate</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="3167"
                      value={formData.populationEstimate}
                      onChange={(e) => setFormData({ ...formData, populationEstimate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Discovery / Classification Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.discoveryDate}
                      onChange={(e) => setFormData({ ...formData, discoveryDate: e.target.value })}
                    />
                  </div>
                </div>

                {!editTarget && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Initial Habitat Assignment (M:N)</label>
                    <select
                      className="form-select"
                      value={formData.selectedHabitatId}
                      onChange={(e) => setFormData({ ...formData, selectedHabitatId: e.target.value })}
                    >
                      <option value="">-- Optional: Link Primary Habitat --</option>
                      {habitats.map((h) => (
                        <option key={h.Habitat_ID} value={h.Habitat_ID}>
                          {h.Habitat_Name} ({h.Habitat_Type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Biological Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Detailed behavioral, morphological, and ecological habitat notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setIsAddModalOpen(false); setEditTarget(null); }}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving to Database...' : editTarget ? 'Update Species' : 'Save Species'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPECIES DETAIL PROFILE MODAL */}
      {viewProfileId && (
        <div className="modal-overlay" onClick={() => setViewProfileId(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '850px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {profileLoading || !speciesProfile ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                <span>Executing multi-table relational join query...</span>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={speciesProfile.Image_Url || 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=150&q=80'}
                      alt={speciesProfile.Common_Name}
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{speciesProfile.Common_Name}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--emerald-600)', fontStyle: 'italic', fontWeight: 600 }}>
                        {speciesProfile.Scientific_Name} • {speciesProfile.Family}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewProfileId(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Profile Navigation Tabs */}
                <div
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: '#f8fafc',
                    padding: '0 1rem',
                  }}
                >
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'habitats', label: `Habitats (${speciesProfile.habitats?.length || 0})` },
                    { id: 'observations', label: `Observations (${speciesProfile.observations?.length || 0})` },
                    { id: 'threats', label: `Threats (${speciesProfile.threats?.length || 0})` },
                    { id: 'programs', label: `Conservation (${speciesProfile.programs?.length || 0})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveProfileTab(tab.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeProfileTab === tab.id ? '2px solid var(--emerald-600)' : '2px solid transparent',
                        color: activeProfileTab === tab.id ? 'var(--emerald-600)' : 'var(--text-muted)',
                        fontWeight: activeProfileTab === tab.id ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {/* TAB 1: OVERVIEW */}
                  {activeProfileTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="grid-3">
                        <div className="card" style={{ background: 'var(--bg-card)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IUCN Status</span>
                          <div style={{ marginTop: '0.35rem' }}>
                            <StatusBadge status={speciesProfile.Conservation_Status} />
                          </div>
                        </div>

                        <div className="card" style={{ background: 'var(--bg-card)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Population</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                            {Number(speciesProfile.Population_Estimate).toLocaleString()}
                          </div>
                        </div>

                        <div className="card" style={{ background: 'var(--bg-card)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Taxa Class</span>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--emerald-600)', marginTop: '0.2rem' }}>
                            {speciesProfile.Species_Type}
                          </div>
                        </div>
                      </div>

                      <div className="card" style={{ background: 'var(--bg-card)' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                          Species Description & Morphology
                        </h4>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                          {speciesProfile.Description || 'No biological notes recorded for this taxon yet.'}
                        </p>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem' }}>
                        <span>Discovery Date: <strong>{speciesProfile.Discovery_Date || 'Historical'}</strong></span>
                        <span>Database Registry ID: <strong>#{speciesProfile.Species_ID}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: HABITATS */}
                  {activeProfileTab === 'habitats' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {speciesProfile.habitats?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No linked habitats recorded in junction table Species_Habitat yet.
                        </div>
                      ) : (
                        speciesProfile.habitats?.map((h) => (
                          <div key={h.Habitat_ID} className="card" style={{ background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{h.Habitat_Name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                {h.Habitat_Type} • {h.Climate} • {Number(h.Area).toLocaleString()} sq km
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span className="badge badge-active">{h.Protection_Status}</span>
                              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', marginTop: '0.3rem', fontWeight: 600 }}>
                                Local Pop: {Number(h.habitatPopulation || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 3: OBSERVATIONS */}
                  {activeProfileTab === 'observations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {speciesProfile.observations?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No field survey observations logged for this species yet.
                        </div>
                      ) : (
                        speciesProfile.observations?.map((obs) => (
                          <div key={obs.Observation_ID} className="card" style={{ background: 'var(--bg-card)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <div>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>📍 {obs.Location_Name}, {obs.State}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                  Logged by: <strong>{obs.researcherName}</strong> ({obs.Organization})
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span className="badge badge-role">{obs.Observation_Method}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 700, marginTop: '0.2rem' }}>
                                  {obs.Population_Count} individuals
                                </div>
                              </div>
                            </div>
                            {obs.Notes && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: '#f8fafc', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                "{obs.Notes}"
                              </p>
                            )}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                              Survey Date: {obs.Observation_Date}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 4: THREATS */}
                  {activeProfileTab === 'threats' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {speciesProfile.threats?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No active ecological threats assigned to this species in junction table.
                        </div>
                      ) : (
                        speciesProfile.threats?.map((th) => (
                          <div key={th.Threat_ID} className="card" style={{ background: 'var(--bg-card)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>⚠️ {th.Threat_Name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classification: {th.Threat_Type}</div>
                              </div>
                              <StatusBadge status={th.Impact_Level || th.Severity} />
                            </div>
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                              {th.impactDescription || 'High risk of habitat degradation and population decline.'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 5: CONSERVATION PROGRAMS */}
                  {activeProfileTab === 'programs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {speciesProfile.programs?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No active state conservation initiatives mapped to this territory yet.
                        </div>
                      ) : (
                        speciesProfile.programs?.map((prog) => (
                          <div key={prog.Program_ID} className="card" style={{ background: 'var(--bg-card)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{prog.Program_Name}</div>
                              <StatusBadge status={prog.Status} />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              {prog.Objective}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span>📍 {prog.Location_Name}, {prog.State}</span>
                              <span style={{ color: 'var(--emerald-600)', fontWeight: 600 }}>
                                Budget: ₹{Number(prog.Budget).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setViewProfileId(null)}>
                    Close Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.Common_Name}"?`}
        message={`Are you sure you want to delete species record #${deleteTarget?.Species_ID} (${deleteTarget?.Common_Name})? This will cascade-delete linked entries in Species_Habitat, Species_Threat, and Species_Observation.`}
        confirmText="Confirm SQL Deletion"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
