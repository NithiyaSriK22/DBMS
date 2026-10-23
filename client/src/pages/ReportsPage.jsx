import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Code2,
  Layers,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';

export const ReportsPage = () => {
  const { addToast } = useToast();
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('status');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.reports.get();
      if (res.success) {
        setReportsData(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to generate reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const reportTabs = [
    { id: 'status', label: '1. Conservation Status', exportKey: 'species-status' },
    { id: 'taxa', label: '2. Taxonomic Groups', exportKey: 'species-taxa' },
    { id: 'habitat_observations', label: '3. Observations by Habitat', exportKey: 'observations-habitat' },
    { id: 'researchers', label: '4. Researcher Activity', exportKey: 'researchers' },
    { id: 'threats', label: '5. Species Threats', exportKey: 'threats' },
    { id: 'programs', label: '6. Program Summary', exportKey: 'programs' },
    { id: 'recent_observations', label: '7. Recent Observations', exportKey: 'recent-observations' },
    { id: 'endangered', label: '8. Endangered Taxa', exportKey: 'endangered-species' },
  ];

  const handleExportCsv = (exportKey) => {
    if (!exportKey) return;
    const url = api.reports.exportUrl(exportKey);
    window.open(url, '_blank');
    addToast('Downloading CSV report generated directly from SQL database...', 'info');
  };

  const currentTabObj = reportTabs.find((t) => t.id === activeReport) || reportTabs[0];

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--forest-deep)' }}>Reports & Relational Analytics</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            SQL-driven analytical reports utilizing GROUP BY, HAVING, subqueries, multi-table joins, and CSV exports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchReports}>
            <RefreshCw size={14} />
            <span>Rerun SQL Reports</span>
          </button>

          {currentTabObj.exportKey && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleExportCsv(currentTabObj.exportKey)}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Reports Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: activeReport === tab.id ? '1px solid #a7f3d0' : '1px solid transparent',
              background: activeReport === tab.id ? '#ecfdf5' : 'transparent',
              color: activeReport === tab.id ? '#065f46' : 'var(--text-secondary)',
              fontWeight: activeReport === tab.id ? 700 : 500,
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT CONTENT VIEW */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
          Computing relational SQL aggregations across all entities...
        </div>
      ) : !reportsData ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No report data generated.
        </div>
      ) : (
        <div>
          {/* REPORT 1: CONSERVATION STATUS */}
          {activeReport === 'status' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: 'var(--natural-pale-sage)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-deep)', fontSize: '0.95rem' }}>
                  Report 1: Species Distribution by Conservation Status
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>IUCN Conservation Status</th>
                    <th>Total Species Count</th>
                    <th>Cumulative Population</th>
                    <th>Average Population</th>
                    <th>Smallest Recorded</th>
                    <th>Largest Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.speciesByStatus?.map((r, i) => (
                    <tr key={i}>
                      <td><StatusBadge status={r.Conservation_Status} /></td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.totalSpecies} taxa</td>
                      <td style={{ color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{Number(r.totalEstimatedPopulation).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{Number(r.avgPopulation).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Number(r.minPopulation).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Number(r.maxPopulation).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 2: TAXONOMIC GROUPS */}
          {activeReport === 'taxa' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: 'var(--natural-pale-sage)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-deep)', fontSize: '0.95rem' }}>
                  Report 2: Species Summary by Taxonomic Group
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Taxonomic Biological Group</th>
                    <th>Species Count</th>
                    <th>Total Cumulative Population</th>
                    <th>Average Population</th>
                    <th>Minimum Count</th>
                    <th>Maximum Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.speciesByTaxa?.map((t, i) => (
                    <tr key={i}>
                      <td><span className="badge badge-role">{t.taxonomicGroup}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>{t.totalSpecies} species</td>
                      <td style={{ color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {Number(t.totalEstimatedPopulation).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{Number(t.avgPopulation).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Number(t.minPopulation).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Number(t.maxPopulation).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 3: OBSERVATIONS BY HABITAT */}
          {activeReport === 'habitat_observations' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: 'var(--natural-pale-sage)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-deep)', fontSize: '0.95rem' }}>
                  Report 3: Field Observations by Habitat
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Habitat Ecosystem</th>
                    <th>Habitat Type</th>
                    <th>Protection Status</th>
                    <th>Surveys Conducted</th>
                    <th>Specimens Documented</th>
                    <th>Distinct Species Observed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.observationsByHabitat?.map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>{h.Habitat_Name}</td>
                      <td><span className="badge badge-role">{h.Habitat_Type}</span></td>
                      <td><span className="badge badge-active">{h.Protection_Status}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>{h.totalObservations} surveys</td>
                      <td style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {Number(h.totalSpecimensCount).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{h.uniqueSpeciesObserved} species</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 4: RESEARCHER ACTIVITY */}
          {activeReport === 'researchers' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: 'var(--natural-pale-sage)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-deep)', fontSize: '0.95rem' }}>
                  Report 4: Scientific Researcher Field Activity Summary
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Researcher Name</th>
                    <th>Institution</th>
                    <th>Specialization</th>
                    <th>Surveys Conducted</th>
                    <th>Specimens Documented</th>
                    <th>Unique Species Logged</th>
                    <th>Locations Covered</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.researcherActivity?.map((res, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>{res.Name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{res.Organization}</td>
                      <td><span className="badge badge-role">{res.Specialization}</span></td>
                      <td style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>{res.totalSurveysConducted} surveys</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {Number(res.totalSpecimensDocumented).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{res.distinctSpeciesTracked} species</td>
                      <td style={{ color: 'var(--text-muted)' }}>{res.locationsSurveyed} sectors</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 5: SPECIES THREATS */}
          {activeReport === 'threats' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: 'var(--natural-pale-sage)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-deep)', fontSize: '0.95rem' }}>
                  Report 5: Threats Associated with Species
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Species Common Name</th>
                    <th>Scientific Name</th>
                    <th>IUCN Status</th>
                    <th>Associated Threat</th>
                    <th>Threat Category</th>
                    <th>Severity</th>
                    <th>Impact Level</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.speciesThreats?.map((st, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>{st.Common_Name}</td>
                      <td style={{ color: 'var(--emerald-600)', fontStyle: 'italic' }}>{st.Scientific_Name}</td>
                      <td><StatusBadge status={st.Conservation_Status} /></td>
                      <td style={{ fontWeight: 600, color: 'var(--forest-deep)' }}>{st.Threat_Name}</td>
                      <td><span className="badge badge-role">{st.Threat_Type}</span></td>
                      <td><StatusBadge status={st.Severity} /></td>
                      <td><span style={{ fontWeight: 700, color: st.Impact_Level === 'Critical' ? '#dc2626' : 'var(--text-secondary)' }}>{st.Impact_Level}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 6: CONSERVATION PROGRAM SUMMARY */}
          {activeReport === 'programs' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: 'var(--natural-pale-sage)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-deep)', fontSize: '0.95rem' }}>
                  Report 6: Conservation Program Summary
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Program Lifecycle Status</th>
                    <th>Initiatives Count</th>
                    <th>Total Budget Allocated</th>
                    <th>Average Program Budget</th>
                    <th>Milestone Activities Executed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.programSummary?.map((p, i) => (
                    <tr key={i}>
                      <td><StatusBadge status={p.programStatus} /></td>
                      <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>{p.totalPrograms} Programs</td>
                      <td style={{ color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        ₹{Number(p.totalBudgetAllocated).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        ₹{Number(p.avgBudget).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.totalExecutedActivities} activities</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 7: RECENT OBSERVATIONS LOG */}
          {activeReport === 'recent_observations' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: 'var(--natural-pale-sage)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-deep)', fontSize: '0.95rem' }}>
                  Report 7: Recent Field Observation Logs
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Observed Taxa</th>
                    <th>Status</th>
                    <th>Location / Sector</th>
                    <th>Habitat</th>
                    <th>Researcher</th>
                    <th>Count</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.recentObservations?.map((o, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{o.Observation_Date}</td>
                      <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>{o.speciesName}</td>
                      <td><StatusBadge status={o.Conservation_Status} /></td>
                      <td>{o.Location_Name}, {o.State}</td>
                      <td><span className="badge badge-active">{o.Habitat_Name}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{o.researcherName}</td>
                      <td style={{ fontWeight: 700, color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)' }}>{o.Population_Count}</td>
                      <td><span className="badge badge-role">{o.Observation_Method}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 8: ENDANGERED SPECIES */}
          {activeReport === 'endangered' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: 'var(--natural-pale-sage)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-deep)', fontSize: '0.95rem' }}>
                  Report 8: High Priority Endangered & Threatened Taxa
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Common Name</th>
                    <th>Scientific Name</th>
                    <th>Class</th>
                    <th>Family</th>
                    <th>IUCN Category</th>
                    <th>Global Population Estimate</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.endangeredSpecies?.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>{s.Common_Name}</td>
                      <td style={{ color: 'var(--emerald-600)', fontStyle: 'italic', fontWeight: 600 }}>{s.Scientific_Name}</td>
                      <td><span className="badge badge-role">{s.Species_Type}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.Family}</td>
                      <td><StatusBadge status={s.Conservation_Status} /></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--forest-deep)' }}>
                        {Number(s.Population_Estimate).toLocaleString()} specimens
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
