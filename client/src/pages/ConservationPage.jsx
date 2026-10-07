import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Search, Filter, Calendar, MapPin, CheckCircle, Clock, Trash2, Edit2, X, Activity, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const ConservationPage = () => {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [programs, setPrograms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [editProgramTarget, setEditProgramTarget] = useState(null);
  const [viewProgram, setViewProgram] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [activeProgramForActivity, setActiveProgramForActivity] = useState(null);

  const [deleteProgramTarget, setDeleteProgramTarget] = useState(null);
  const [deleteActivityTarget, setDeleteActivityTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Forms
  const [programForm, setProgramForm] = useState({
    programName: '',
    objective: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: 10000000,
    status: 'Active',
    locationId: '',
  });

  const [activityForm, setActivityForm] = useState({
    activityName: '',
    activityDate: new Date().toISOString().split('T')[0],
    responsiblePerson: '',
    description: '',
    outcome: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await api.conservation.getAllPrograms(params);
      if (res.success) {
        setPrograms(res.data);
        setStats(res.stats);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch programs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.locations.getAll();
      if (res.success) setLocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchLocations();
  }, [statusFilter]);

  const handleOpenView = async (id) => {
    setViewLoading(true);
    try {
      const res = await api.conservation.getProgramById(id);
      if (res.success) {
        setViewProgram(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load program details', 'error');
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenEdit = (prog) => {
    setEditProgramTarget(prog);
    setProgramForm({
      programName: prog.Program_Name,
      objective: prog.Objective,
      startDate: prog.Start_Date,
      endDate: prog.End_Date || '',
      budget: prog.Budget,
      status: prog.Status,
      locationId: prog.Location_ID,
    });
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editProgramTarget) {
        const res = await api.conservation.updateProgram(editProgramTarget.Program_ID, programForm);
        if (res.success) {
          addToast(res.message, 'success');
          setEditProgramTarget(null);
          fetchPrograms();
        }
      } else {
        const res = await api.conservation.createProgram(programForm);
        if (res.success) {
          addToast(res.message, 'success');
          setIsAddProgramOpen(false);
          setProgramForm({
            programName: '',
            objective: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            budget: 10000000,
            status: 'Active',
            locationId: locations[0]?.Location_ID || '',
          });
          fetchPrograms();
        }
      }
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activeProgramForActivity) return;
    setSubmitting(true);
    try {
      const res = await api.conservation.createActivity({
        ...activityForm,
        programId: activeProgramForActivity.Program_ID,
      });
      if (res.success) {
        addToast(res.message, 'success');
        setIsAddActivityOpen(false);
        setActivityForm({
          activityName: '',
          activityDate: new Date().toISOString().split('T')[0],
          responsiblePerson: '',
          description: '',
          outcome: '',
        });
        if (viewProgram && viewProgram.Program_ID === activeProgramForActivity.Program_ID) {
          handleOpenView(viewProgram.Program_ID);
        }
        fetchPrograms();
      }
    } catch (err) {
      addToast(err.message || 'Failed to add activity', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteProgram = async () => {
    if (!deleteProgramTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.conservation.deleteProgram(deleteProgramTarget.Program_ID);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteProgramTarget(null);
        if (viewProgram?.Program_ID === deleteProgramTarget.Program_ID) setViewProgram(null);
        fetchPrograms();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete program', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDeleteActivity = async () => {
    if (!deleteActivityTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.conservation.deleteActivity(deleteActivityTarget.Activity_ID);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteActivityTarget(null);
        if (viewProgram) handleOpenView(viewProgram.Program_ID);
        fetchPrograms();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete activity', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Conservation Programs & Field Activities</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Track multi-state conservation initiatives, funded recovery programs, and executed field actions.
          </p>
        </div>

        {hasRole('Admin', 'Conservation Officer') && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditProgramTarget(null);
              setProgramForm({
                programName: '',
                objective: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                budget: 10000000,
                status: 'Active',
                locationId: locations[0]?.Location_ID || '',
              });
              setIsAddProgramOpen(true);
            }}
          >
            <Plus size={16} />
            <span>+ Create Program</span>
          </button>
        )}
      </div>

      {/* Program Summary Ribbon */}
      {stats && (
        <div className="grid-3">
          <div className="card" style={{ background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Programs</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {stats.totalPrograms} Initiatives
            </div>
          </div>
          <div className="card" style={{ background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Status</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '0.2rem' }}>
              {stats.activePrograms} In Progress
            </div>
          </div>
          <div className="card" style={{ background: 'var(--bg-surface)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cumulative Budget</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>
              ₹{(Number(stats.totalBudget) / 10000000).toFixed(1)} Crores
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-surface)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search programs by name, objective, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPrograms()}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
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
            <option value="Active">Active</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchPrograms}>
          Filter
        </button>
      </div>

      {/* PROGRAMS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            Loading conservation programs...
          </div>
        ) : programs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No conservation programs found.
          </div>
        ) : (
          programs.map((prog) => (
            <div key={prog.Program_ID} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{prog.Program_Name}</h3>
                    <StatusBadge status={prog.Status} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>📍 <strong>{prog.Location_Name}</strong>, {prog.State}</span>
                    <span>•</span>
                    <span>🌳 {prog.Habitat_Name}</span>
                    <span>•</span>
                    <span>🗓️ {prog.Start_Date} {prog.End_Date ? `to ${prog.End_Date}` : '(Ongoing)'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)' }}>
                    ₹{Number(prog.Budget).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {prog.activityCount || 0} Executed Field Activities
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {prog.Objective}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenView(prog.Program_ID)}
                >
                  <Activity size={14} />
                  <span>View Timeline & Activities ({prog.activityCount || 0})</span>
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {hasRole('Admin', 'Conservation Officer') && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setActiveProgramForActivity(prog);
                          setIsAddActivityOpen(true);
                        }}
                      >
                        <Plus size={13} />
                        <span>+ Add Activity</span>
                      </button>
                      <button className="btn btn-secondary btn-sm" title="Edit" onClick={() => handleOpenEdit(prog)}>
                        <Edit2 size={13} />
                      </button>
                    </>
                  )}
                  {hasRole('Admin') && (
                    <button className="btn btn-danger btn-sm" title="Delete" onClick={() => setDeleteProgramTarget(prog)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* VIEW PROGRAM & ACTIVITIES MODAL */}
      {viewProgram && (
        <div className="modal-overlay" onClick={() => setViewProgram(null)}>
          <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{viewProgram.Program_Name}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {viewProgram.Location_Name}, {viewProgram.State}</div>
              </div>
              <button onClick={() => setViewProgram(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ background: 'var(--bg-card)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Conservation Objective
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{viewProgram.Objective}</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--emerald-600)' }}>
                    Executed Field Activities ({viewProgram.activities?.length || 0})
                  </h4>
                  {hasRole('Admin', 'Conservation Officer') && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setActiveProgramForActivity(viewProgram);
                        setIsAddActivityOpen(true);
                      }}
                    >
                      <Plus size={13} />
                      <span>Log Milestone Action</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                  {viewProgram.activities?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No field activities recorded under this program yet.
                    </div>
                  ) : (
                    viewProgram.activities?.map((act) => (
                      <div key={act.Activity_ID} className="card" style={{ background: 'var(--bg-card)', borderLeft: '3px solid var(--emerald-500)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{act.Activity_Name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🗓️ {act.Activity_Date}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', marginBottom: '0.4rem' }}>
                          Lead Person: <strong>{act.Responsible_Person}</strong>
                        </div>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                          {act.Description}
                        </p>
                        {act.Outcome && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--emerald-300)', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                            <strong>Outcome:</strong> {act.Outcome}
                          </div>
                        )}
                        {hasRole('Admin', 'Conservation Officer') && (
                          <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                              onClick={() => setDeleteActivityTarget(act)}
                            >
                              Delete Activity
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewProgram(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PROGRAM MODAL */}
      {(isAddProgramOpen || editProgramTarget) && (
        <div className="modal-overlay" onClick={() => { setIsAddProgramOpen(false); setEditProgramTarget(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>{editProgramTarget ? 'Edit Program' : 'Create Conservation Program'}</h3>
              <button onClick={() => { setIsAddProgramOpen(false); setEditProgramTarget(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProgramSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Program Name <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Project Snow Leopard: High Himalayan Stewards"
                    value={programForm.programName}
                    onChange={(e) => setProgramForm({ ...programForm, programName: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Location (FK) <span className="required">*</span></label>
                    <select
                      required
                      className="form-select"
                      value={programForm.locationId}
                      onChange={(e) => setProgramForm({ ...programForm, locationId: e.target.value })}
                    >
                      <option value="">-- Select Location --</option>
                      {locations.map((l) => (
                        <option key={l.Location_ID} value={l.Location_ID}>
                          {l.Location_Name}, {l.State}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Status <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={programForm.status}
                      onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
                    >
                      <option value="Planned">Planned</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start Date <span className="required">*</span></label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={programForm.startDate}
                      onChange={(e) => setProgramForm({ ...programForm, startDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={programForm.endDate}
                      onChange={(e) => setProgramForm({ ...programForm, endDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Budget (INR ₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={programForm.budget}
                      onChange={(e) => setProgramForm({ ...programForm, budget: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Program Objectives & Strategy <span className="required">*</span></label>
                  <textarea
                    required
                    className="form-textarea"
                    placeholder="Describe mission scope, target species recovery, anti-poaching measures..."
                    value={programForm.objective}
                    onChange={(e) => setProgramForm({ ...programForm, objective: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddProgramOpen(false); setEditProgramTarget(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editProgramTarget ? 'Update Program' : 'Initiate Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ACTIVITY MODAL */}
      {isAddActivityOpen && (
        <div className="modal-overlay" onClick={() => setIsAddActivityOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Log Conservation Activity for "{activeProgramForActivity?.Program_Name}"</h3>
              <button onClick={() => setIsAddActivityOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleActivitySubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Activity / Drive Name <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Anti-Poaching Wireless Camera Mesh Deployment"
                    value={activityForm.activityName}
                    onChange={(e) => setActivityForm({ ...activityForm, activityName: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date Executed <span className="required">*</span></label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={activityForm.activityDate}
                      onChange={(e) => setActivityForm({ ...activityForm, activityDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Responsible Person / Officer <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Vikram Rathore"
                      value={activityForm.responsiblePerson}
                      onChange={(e) => setActivityForm({ ...activityForm, responsiblePerson: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description of Activity</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Details of operation, troops/volunteers deployed, quadrants cleared..."
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quantified Outcome</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Zero poaching incidents detected; 120 ha restored"
                    value={activityForm.outcome}
                    onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddActivityOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Record Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROGRAM CONFIRMATION */}
      <ConfirmationModal
        isOpen={!!deleteProgramTarget}
        title={`Delete Program "${deleteProgramTarget?.Program_Name}"?`}
        message={`Are you sure you want to delete Conservation Program #${deleteProgramTarget?.Program_ID}? This will cascade delete all ${deleteProgramTarget?.activityCount || 0} associated child activities.`}
        confirmText="Delete Program"
        loading={deleteLoading}
        onConfirm={handleConfirmDeleteProgram}
        onCancel={() => setDeleteProgramTarget(null)}
      />

      {/* DELETE ACTIVITY CONFIRMATION */}
      <ConfirmationModal
        isOpen={!!deleteActivityTarget}
        title="Delete Activity?"
        message={`Are you sure you want to delete activity "${deleteActivityTarget?.Activity_Name}"?`}
        confirmText="Delete Activity"
        loading={deleteLoading}
        onConfirm={handleConfirmDeleteActivity}
        onCancel={() => setDeleteActivityTarget(null)}
      />
    </div>
  );
};
