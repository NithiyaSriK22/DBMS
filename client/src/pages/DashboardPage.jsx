import React, { useState, useEffect } from 'react';
import {
  Bug,
  ShieldCheck,
  Trees,
  AlertTriangle,
  HeartHandshake,
  Eye,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  SpeciesCategoryDonutChart,
  ConservationStatusBarChart,
  RegionalDistributionChart,
  PopulationTrendAreaChart,
  MajorThreatsChart,
} from '../components/Charts';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardPage = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.dashboard.getStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p>Executing live relational SQL metrics aggregation queries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)' }}>
          <h3 style={{ color: '#f87171', marginBottom: '0.5rem' }}>Database Query Error</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchStats}>
            Retry Queries
          </button>
        </div>
      </div>
    );
  }

  const { cards, charts, recentObservations, activePrograms } = data || {};

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner & Quick Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Biodiversity Overview</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Real-time ecological statistics computed directly via SQL aggregation across normalized 3NF tables.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchStats} title="Rerun SQL aggregate queries">
            <RefreshCw size={14} />
            <span>Refresh SQL</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('species', 'new')}>
            <span>+ Add Species</span>
          </button>
        </div>
      </div>

      {/* 6 STATISTIC CARDS */}
      <div className="grid-6">
        <StatCard
          title="Total Species"
          value={cards?.totalSpecies}
          icon={Bug}
          color="emerald"
          subtitle="Taxa recorded in 3NF"
        />
        <StatCard
          title="Protected Species"
          value={cards?.protectedSpecies}
          icon={ShieldCheck}
          color="blue"
          subtitle="IUCN listed wildlife"
        />
        <StatCard
          title="Habitats"
          value={cards?.totalHabitats}
          icon={Trees}
          color="emerald"
          subtitle="Preserved biomes"
        />
        <StatCard
          title="Endangered Species"
          value={cards?.endangeredSpecies}
          icon={AlertTriangle}
          color="red"
          subtitle="Critical & Endangered"
        />
        <StatCard
          title="Active Programs"
          value={cards?.activePrograms}
          icon={HeartHandshake}
          color="purple"
          subtitle="State initiatives"
        />
        <StatCard
          title="Recorded Observations"
          value={cards?.recordedObservations}
          icon={Eye}
          color="amber"
          subtitle={`${cards?.totalIndividuals?.toLocaleString() || 0} specimens logged`}
        />
      </div>

      {/* 5 CHARTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        {/* Chart 1: Species by Category (5 Cols) */}
        <div className="card" style={{ gridColumn: 'span 5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Chart 1 — Species by Category</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distribution across taxonomic classes</p>
            </div>
            <Layers size={18} color="var(--emerald-400)" />
          </div>
          <SpeciesCategoryDonutChart data={charts?.speciesByCategory} />
        </div>

        {/* Chart 2: Conservation Status (4 Cols) */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Chart 2 — Conservation Status</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threat categories breakdown</p>
            </div>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <ConservationStatusBarChart data={charts?.speciesByStatus} />
        </div>

        {/* Chart 3: Species Distribution by Region (3 Cols) */}
        <div className="card" style={{ gridColumn: 'span 3' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Chart 3 — Geographic Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Species recorded by location</p>
            </div>
            <MapPin size={18} color="var(--emerald-400)" />
          </div>
          <RegionalDistributionChart data={charts?.speciesByRegion} />
        </div>

        {/* Chart 4: Population Trend (6 Cols) */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Chart 4 — Observation Timeline</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Field surveillance volume over time</p>
            </div>
            <TrendingUp size={18} color="var(--emerald-400)" />
          </div>
          <PopulationTrendAreaChart data={charts?.populationTrend} />
        </div>

        {/* Chart 5: Major Threats (6 Cols) */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Chart 5 — Major Threats Affecting Species</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ranked by number of vulnerable wildlife impacted</p>
            </div>
            <AlertTriangle size={18} color="#f87171" />
          </div>
          <MajorThreatsChart data={charts?.majorThreats} />
        </div>
      </div>

      {/* RECENT FIELD OBSERVATIONS & CONSERVATION SPOTLIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Observations Stream */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Field Observations</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('observations')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentObservations?.map((obs) => (
              <div
                key={obs.Observation_ID}
                style={{
                  padding: '0.75rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {obs.speciesName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>({obs.Scientific_Name})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <MapPin size={12} color="var(--emerald-400)" />
                    <span>{obs.Location_Name}, {obs.State}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--emerald-300)' }}>{obs.Population_Count} individuals</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={obs.Conservation_Status} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    {obs.Observation_Date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Conservation Spotlight */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Conservation Initiatives</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('conservation')}
            >
              <span>View Programs</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activePrograms?.map((prog) => (
              <div
                key={prog.Program_ID}
                style={{
                  padding: '0.85rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {prog.Program_Name}
                  </div>
                  <span className="badge badge-active">Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>📍 {prog.Location_Name}, {prog.State}</span>
                  <span style={{ color: 'var(--emerald-600)', fontWeight: 600 }}>
                    Budget: ₹{(Number(prog.Budget) / 10000000).toFixed(1)} Cr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
