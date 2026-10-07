import React from 'react';
import {
  Trees,
  Shield,
  BarChart3,
  Search,
  Eye,
  ArrowRight,
  Database,
  CheckCircle2,
  Lock,
  Globe,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export const LandingPage = ({ onGetStarted, onDemoLogin }) => {
  const { user } = useAuth();

  const demoRoles = [
    {
      role: 'Admin',
      name: 'Dr. Rajesh Sharma',
      email: 'admin@biodiversity.org',
      pass: 'Admin@123',
      desc: 'Full CRUD control over species, habitats, researchers, threats, and user privileges.',
      badgeColor: '#10b981',
    },
    {
      role: 'Researcher',
      name: 'Dr. Sunita Narain',
      email: 'sunita.narain@wii.gov.in',
      pass: 'Research@123',
      desc: 'Log field surveys, update GPS/drone telemetry observations, and link ecological threats.',
      badgeColor: '#38bdf8',
    },
    {
      role: 'Conservation Officer',
      name: 'Vikram Rathore',
      email: 'vikram.rathore@forest.gov.in',
      pass: 'Officer@123',
      desc: 'Manage state conservation programs, budget allocations, and milestone field activities.',
      badgeColor: '#fbbf24',
    },
    {
      role: 'Viewer',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@nature.org',
      pass: 'Viewer@123',
      desc: 'Read-only access to interactive dashboards, species profiles, and analytical reports.',
      badgeColor: '#a855f7',
    },
  ];

  const pillars = [
    {
      icon: Eye,
      title: 'Species Monitoring',
      desc: 'Comprehensive records of 24+ taxa, scientific classifications, IUCN status, and population counts.',
    },
    {
      icon: Trees,
      title: 'Habitat Management',
      desc: 'Map ecological biomes from Western Ghats rainforests to Sundarbans mangroves and Himalayan plateaus.',
    },
    {
      icon: Shield,
      title: 'Conservation Tracking',
      desc: 'Coordinate funded recovery programs, anti-poaching camera surveillance, and habitat restoration drives.',
    },
    {
      icon: BarChart3,
      title: 'Biodiversity Analytics',
      desc: 'Live relational SQL queries, multi-table joins, threat distribution matrix, and CSV report exports.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Top Navbar */}
      <nav
        style={{
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(5, 150, 105, 0.3)',
            }}
          >
            🌿
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              BIODIVERSITY MANAGEMENT SYSTEM
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--emerald-600)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Relational Database Platform (3NF)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: '#065f46',
            }}
          >
            <Database size={13} color="#059669" />
            <span style={{ fontWeight: 600 }}>Relational SQL Engine</span>
          </div>

          <button className="btn btn-primary" onClick={onGetStarted}>
            <span>{user ? 'Enter Dashboard' : 'Sign In / Demo'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: '#065f46',
            marginBottom: '1.5rem',
          }}
        >
          <span>🌱</span>
          <span style={{ fontWeight: 600 }}>Enterprise-Grade Full-Stack DBMS Architecture</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            color: '#06281c',
          }}
        >
          Biodiversity Management System
        </h1>

        <h2
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.8rem)',
            fontWeight: 600,
            color: 'var(--emerald-600)',
            marginBottom: '1.5rem',
            letterSpacing: '0.02em',
          }}
        >
          Monitor. Protect. Preserve.
        </h2>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          An integrated database platform for managing biodiversity records, monitoring endangered species,
          understanding ecological threats, and supporting data-driven conservation efforts.
        </p>

        {/* Call to Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
            <span>Get Started Now</span>
            <ArrowRight size={18} />
          </button>
          <a
            href="#demo-accounts"
            className="btn btn-secondary btn-lg"
            style={{ textDecoration: 'none' }}
          >
            <span>Explore 1-Click Role Logins</span>
          </a>
        </div>

        {/* Live Database Metrics Preview */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Database Taxa</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06281c', fontFamily: 'var(--font-heading)' }}>24+</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 600 }}>Normalized 3NF Entities</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Key Habitats</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-heading)' }}>8 Biomes</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rainforests, Mangroves, Reefs</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Surveillance Surveys</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-heading)' }}>24 Field Logs</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GPS, Drone, Camera Grid</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Programs</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>₹191M Budget</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 600 }}>Multi-state Initiatives</div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Core Architectural Capabilities</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Built specifically to demonstrate relational modeling, referential integrity, and high-performance querying.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--emerald-500)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#06281c' }}>{pillar.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 1-Click Role Login Demo Section */}
      <section id="demo-accounts" style={{ padding: '4rem 2rem 6rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          className="card-elevated"
          style={{
            padding: '3rem 2rem',
            background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
            border: '1px solid #bbf7d0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-full)',
              color: '#b45309',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            ⚡ EVALUATOR & FACULTY QUICK-ACCESS
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: '#06281c' }}>Instant Role-Based Demo Login</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
            Click any authorized role below to automatically authenticate and evaluate specialized permissions, CRUD access, and SQL analytics.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
            {demoRoles.map((demo, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: `${demo.badgeColor}15`,
                        color: demo.badgeColor,
                        border: `1px solid ${demo.badgeColor}33`,
                      }}
                    >
                      {demo.role}
                    </span>
                    <Lock size={14} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#06281c' }}>{demo.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {demo.email}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {demo.desc}
                  </p>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => onDemoLogin(demo.email, demo.pass)}
                >
                  <span>Login as {demo.role}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '2.5rem 2rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}
      >
        <p>🌿 <strong>Biodiversity Management System</strong> • Relational DBMS Full-Stack Project</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>
          Demonstrating 3NF Relational Schemas, Foreign Keys, Referential Integrity, Joins, Aggregation, and Role Authorization.
        </p>
      </footer>
    </div>
  );
};
