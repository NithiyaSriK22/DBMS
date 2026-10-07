import React, { useState } from 'react';

// 1. SPECIES CATEGORY DONUT CHART
export const SpeciesCategoryDonutChart = ({ data = [] }) => {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No category data</div>;
  }

  const colorPalette = {
    Mammal: '#10b981',
    Bird: '#38bdf8',
    Reptile: '#f59e0b',
    Amphibian: '#a855f7',
    Fish: '#06b6d4',
    Plant: '#84cc16',
    Insect: '#ec4899',
  };

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  // Calculate SVG arc paths
  let cumulativeAngle = 0;
  const slices = data.map((item) => {
    const angle = (item.count / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const radius = 70;
    const innerRadius = 45;

    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);

    const x3 = 100 + innerRadius * Math.cos(endRad);
    const y3 = 100 + innerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(startRad);
    const y4 = 100 + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      ...item,
      pathData,
      color: colorPalette[item.category] || '#10b981',
      percentage: ((item.count / total) * 100).toFixed(1),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.pathData}
              fill={slice.color}
              opacity={hovered === null || hovered === idx ? 1 : 0.4}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter: hovered === idx ? 'brightness(1.2)' : 'none',
              }}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {/* Center Label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {hovered !== null ? slices[hovered].count : total}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {hovered !== null ? slices[hovered].category : 'Species'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 0.85rem', marginTop: '1rem', justifyContent: 'center' }}>
        {slices.map((slice, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: hovered === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: slice.color }} />
            <span>{slice.category}: <strong>{slice.count}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. CONSERVATION STATUS BAR CHART
export const ConservationStatusBarChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No status data</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critically Endangered': return '#ef4444';
      case 'Endangered': return '#f97316';
      case 'Vulnerable': return '#f59e0b';
      case 'Near Threatened': return '#14b8a6';
      case 'Least Concern': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', padding: '0.5rem 0' }}>
      {data.map((item, idx) => {
        const pct = ((item.count / maxVal) * 100).toFixed(0);
        const color = getStatusColor(item.status);
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.status}</span>
              <span style={{ color, fontWeight: 700 }}>{item.count} species</span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 3. REGIONAL DISTRIBUTION CHART
export const RegionalDistributionChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No regional records</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.speciesCount), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {data.slice(0, 6).map((item, idx) => {
        const pct = ((item.speciesCount / maxVal) * 100).toFixed(0);
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.locationName}</span>
              <span style={{ color: 'var(--emerald-600)', fontSize: '0.75rem', fontWeight: 600 }}>
                {item.speciesCount} species • {item.observationCount} observations
              </span>
            </div>
            <div style={{ height: '7px', background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #059669, #0284c7)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.region}</div>
          </div>
        );
      })}
    </div>
  );
};

// 4. POPULATION TREND AREA CHART
export const PopulationTrendAreaChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No observation timeline</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.observationCount), 1);
  const width = 340;
  const height = 120;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - (d.observationCount / maxVal) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-subtle)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3,3" />

        {/* Area fill */}
        <path d={areaD} fill="url(#trendGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        <span>{data[0]?.period || 'Start'}</span>
        <span>Monthly Observations Census</span>
        <span>{data[data.length - 1]?.period || 'Latest'}</span>
      </div>
    </div>
  );
};

// 5. MAJOR THREATS CHART
export const MajorThreatsChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No threat data</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.affectedSpeciesCount), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {data.slice(0, 6).map((item, idx) => {
        const pct = ((item.affectedSpeciesCount / maxVal) * 100).toFixed(0);
        const isCritical = item.severity === 'Critical';
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.threatName}</span>
              <span style={{ color: isCritical ? '#dc2626' : '#d97706', fontWeight: 700 }}>
                {item.affectedSpeciesCount} species
              </span>
            </div>
            <div style={{ height: '7px', background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: isCritical ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #f97316, #f59e0b)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
