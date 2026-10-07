import React, { useState, useEffect } from 'react';
import { BarChart3, Download, RefreshCw, Filter, FileText, Table, Layers, ArrowUpRight, Loader2 } from 'lucide-react';
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
    { id: 'habitat', label: '2. Species by Habitat', exportKey: 'habitats' },
    { id: 'threatened', label: '3. Most Threatened Species', exportKey: 'threats' },
    { id: 'trends', label: '4. Survey Population Trends', exportKey: 'observations' },
    { id: 'threats', label: '5. Threats Impact Matrix', exportKey: 'threats' },
    { id: 'region', label: '6. Conservation by Region', exportKey: 'habitats' },
    { id: 'researchers', label: '7. Researcher Productivity', exportKey: 'observations' },
  ];

  const handleExportCsv = (exportKey) => {
    const url = api.reports.exportUrl(exportKey);
    window.open(url, '_blank');
    addToast('Downloading CSV report generated directly from SQL database...', 'info');
  };

  const currentTabObj = reportTabs.find((t) => t.id === activeReport) || reportTabs[0];

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reports & Relational Analytics</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Aggregated analytical summaries utilizing SQL GROUP BY, HAVING, subqueries, and multi-table joins.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchReports}>
            <RefreshCw size={14} />
            <span>Rerun SQL Reports</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleExportCsv(currentTabObj.exportKey)}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
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
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: activeReport === tab.id ? '1px solid var(--border-bright)' : '1px solid transparent',
              background: activeReport === tab.id ? 'var(--bg-surface-elevated)' : 'transparent',
              color: activeReport === tab.id ? 'var(--emerald-400)' : 'var(--text-secondary)',
              fontWeight: activeReport === tab.id ? 700 : 500,
              fontSize: '0.825rem',
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
              <div style={{ padding: '1rem', background: '#f1f7f4', borderBottom: '1px solid #d1e7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                  Report 1: Species Distribution by Conservation Status (GROUP BY Conservation_Status)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  SQL COUNT(), SUM(), AVG(), MIN(), MAX()
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

          {/* REPORT 2: SPECIES BY HABITAT */}
          {activeReport === 'habitat' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: '#f1f7f4', borderBottom: '1px solid #d1e7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                  Report 2: Biodiversity Richness by Habitat (LEFT JOIN Species_Habitat GROUP BY Habitat_ID)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  SQL COUNT(DISTINCT Species_ID)
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Habitat Name</th>
                    <th>Ecosystem Type</th>
                    <th>Protection</th>
                    <th>Area (km²)</th>
                    <th>Species Inhabiting</th>
                    <th>Total Population</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.speciesByHabitat?.map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.Habitat_Name}</td>
                      <td><span className="badge badge-role">{h.Habitat_Type}</span></td>
                      <td><span className="badge badge-active">{h.Protection_Status}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{Number(h.areaSqKm).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>{h.speciesCount} species</td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{Number(h.totalRecordedPopulation).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 3: MOST THREATENED SPECIES */}
          {activeReport === 'threatened' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: '#f1f7f4', borderBottom: '1px solid #d1e7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                  Report 3: Most Threatened Species Ranking (Multi-table Join & Critical Threat Sum)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#dc2626', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  High Risk Priorities
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Species Name</th>
                    <th>Scientific Name</th>
                    <th>Taxa</th>
                    <th>Status</th>
                    <th>Critical Threats</th>
                    <th>Total Threats</th>
                    <th>Global Population</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.mostThreatened?.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.Common_Name}</td>
                      <td style={{ color: 'var(--emerald-600)', fontStyle: 'italic', fontWeight: 600 }}>{s.Scientific_Name}</td>
                      <td><span className="badge badge-role">{s.Species_Type}</span></td>
                      <td><StatusBadge status={s.Conservation_Status} /></td>
                      <td><span style={{ color: '#dc2626', fontWeight: 800 }}>⚠️ {s.criticalThreatsCount} Critical</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.totalThreatsCount} Threats</td>
                      <td style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {Number(s.Population_Estimate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 4: POPULATION TRENDS */}
          {activeReport === 'trends' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: '#f1f7f4', borderBottom: '1px solid #d1e7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                  Report 4: Survey Observations & Field Methods by Year
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  strftime('%Y', Observation_Date)
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Observation Year</th>
                    <th>Survey Methodology</th>
                    <th>Total Field Surveys</th>
                    <th>Specimens Documented</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.populationTrends?.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{p.observationYear}</td>
                      <td><span className="badge badge-role">{p.Observation_Method}</span></td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.totalSurveys} surveys</td>
                      <td style={{ color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {Number(p.specimensRecorded).toLocaleString()} specimens
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 5: THREATS IMPACT */}
          {activeReport === 'threats' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: '#f1f7f4', borderBottom: '1px solid #d1e7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                  Report 5: Ecological Threats Impact Analysis
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  SQL JOIN Threat & Species_Threat
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Threat Name</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Total Affected Species</th>
                    <th>Endangered Taxa Impacted</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.threatsImpact?.map((th, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{th.Threat_Name}</td>
                      <td><span className="badge badge-role">{th.Threat_Type}</span></td>
                      <td><StatusBadge status={th.Severity} /></td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{th.affectedSpeciesCount} species</td>
                      <td style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ {th.endangeredSpeciesAffected} Endangered</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 6: CONSERVATION BY REGION */}
          {activeReport === 'region' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: '#f1f7f4', borderBottom: '1px solid #d1e7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                  Report 6: State-wise Conservation Initiatives & Financial Budget Allocation
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  JOIN Location & Conservation_Program
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>State / Territory</th>
                    <th>Total Programs</th>
                    <th>Active Programs</th>
                    <th>Total Allocated Budget (INR)</th>
                    <th>Milestone Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.conservationByRegion?.map((reg, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>📍 {reg.region}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{reg.totalPrograms} Programs</td>
                      <td><span className="badge badge-active">{reg.activePrograms} Active</span></td>
                      <td style={{ color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        ₹{Number(reg.totalBudgetAllocated).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{reg.totalExecutedActivities} activities</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 7: RESEARCHER PRODUCTIVITY */}
          {activeReport === 'researchers' && (
            <div className="table-container">
              <div style={{ padding: '1rem', background: '#f1f7f4', borderBottom: '1px solid #d1e7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                  Report 7: Scientific Field Productivity & Observation Output
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  LEFT JOIN Researchers & Species_Observation
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
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{res.Name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{res.Organization}</td>
                      <td><span className="badge badge-role">{res.Specialization}</span></td>
                      <td style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>{res.totalSurveysConducted} surveys</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {Number(res.totalSpecimensDocumented).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{res.distinctSpeciesTracked} species</td>
                      <td style={{ color: 'var(--text-muted)' }}>{res.locationsSurveyed} locations</td>
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
