import React, { useState, useEffect } from 'react';
import {
  Trees,
  Shield,
  BarChart3,
  Search,
  Eye,
  ArrowRight,
  CheckCircle2,
  Globe,
  Compass,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const LandingPage = ({ onGetStarted, onDemoLogin }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const fetchLiveStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await api.dashboard.getPublicStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch public stats:', err.message);
      setStatsError(err.message || 'Database connection offline');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);



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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-ivory)', color: 'var(--text-primary)' }}>
      {/* Top Navbar */}
      <nav
        style={{
          padding: '1.1rem clamp(1rem, 3vw, 2.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(196, 164, 91, 0.28)',
          background: 'rgba(21, 61, 43, 0.97)',
          backdropFilter: 'blur(14px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(13, 38, 27, 0.25)',
        }}
      >
        {/* Left: Clickable Logo & Title */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
          title="Return to Home"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--forest-emerald) 0%, var(--forest-evergreen) 100%)',
              border: '1px solid rgba(196, 164, 91, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: '#ffffff',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            🌿
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF', letterSpacing: '-0.01em', fontFamily: 'var(--font-heading)' }}>
            BIODIVERSITY MANAGEMENT SYSTEM
          </div>
        </div>

        {/* Center: Public Navigation Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
          className="desktop-nav"
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '0.4rem 0.2rem',
              transition: 'color 0.15s ease',
              borderBottom: '2px solid var(--accent-gold)',
            }}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('about')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--natural-pale-sage)',
              cursor: 'pointer',
              fontWeight: 500,
              padding: '0.4rem 0.2rem',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--natural-pale-sage)')}
          >
            About the Project
          </button>
          <button
            onClick={() => scrollToSection('features')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--natural-pale-sage)',
              cursor: 'pointer',
              fontWeight: 500,
              padding: '0.4rem 0.2rem',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--natural-pale-sage)')}
          >
            Features
          </button>
        </div>

        {/* Right: Sign In Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-primary"
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(135deg, var(--forest-evergreen) 0%, #153D2B 100%)',
              borderColor: 'rgba(196, 164, 91, 0.45)',
            }}
          >
            <span>{user ? 'Enter Dashboard' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        style={{
          padding: '5.5rem 2rem 4rem',
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
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--neutral-cream)',
            border: '1px solid var(--natural-sage)',
            color: 'var(--forest-evergreen)',
            fontSize: '0.775rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1.5rem',
          }}
        >
          <span>🌿 Relational Environmental Conservation</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            marginBottom: '1.25rem',
            color: 'var(--forest-deep)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Biodiversity Management System
        </h1>

        <h2
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.85rem)',
            fontWeight: 600,
            color: 'var(--forest-emerald)',
            marginBottom: '1.5rem',
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
          }}
        >
          Monitor. Protect. Preserve.
        </h2>

        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 2.75rem',
            lineHeight: 1.7,
          }}
        >
          An integrated database platform for managing biodiversity records, monitoring endangered species,
          understanding ecological threats, and supporting data-driven conservation efforts.
        </p>

        {/* Call to Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
            <span>Get Started Now</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Live Database Metrics Preview */}
        <div
          id="about"
          className="card"
          style={{
            padding: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            textAlign: 'left',
            position: 'relative',
            background: '#FFFFFF',
            border: '1px solid rgba(196, 164, 91, 0.35)',
            boxShadow: 'var(--shadow-md), 0 8px 30px rgba(21, 61, 43, 0.06)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {statsLoading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 0.65rem', color: 'var(--forest-emerald)' }} />
              <div style={{ fontSize: '0.875rem' }}>Connecting to database and aggregating records...</div>
            </div>
          ) : statsError ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '0.925rem', color: '#991B1B', marginBottom: '0.75rem', fontWeight: 600 }}>
                Database metrics unavailable: {statsError}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={fetchLiveStats}>
                <RefreshCw size={13} />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            <>
              <div style={{ borderLeft: '3px solid var(--forest-deep)', paddingLeft: '1.1rem' }}>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Database Taxa
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--forest-deep)', fontFamily: 'var(--font-heading)', lineHeight: 1.15, margin: '0.35rem 0' }}>
                  {stats?.totalSpecies ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--forest-emerald)', fontWeight: 600 }}>
                  Cataloged Species
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--accent-blue)', paddingLeft: '1.1rem' }}>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Key Habitats
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-heading)', lineHeight: 1.15, margin: '0.35rem 0' }}>
                  {stats?.totalHabitats ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Rainforests, Mangroves, Reefs
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--accent-gold)', paddingLeft: '1.1rem' }}>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Surveillance Surveys
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#8C6D27', fontFamily: 'var(--font-heading)', lineHeight: 1.15, margin: '0.35rem 0' }}>
                  {stats?.totalObservations ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Field Observations & Logs
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--forest-evergreen)', paddingLeft: '1.1rem' }}>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Programs
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--forest-evergreen)', fontFamily: 'var(--font-heading)', lineHeight: 1.15, margin: '0.35rem 0' }}>
                  {stats?.activePrograms ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--forest-emerald)', fontWeight: 600 }}>
                  Active Conservation Initiatives
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4 Pillars / Features Section */}
      <section id="features" style={{ padding: '5rem 2rem', background: 'var(--neutral-cream)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.85rem', color: 'var(--forest-deep)', fontFamily: 'var(--font-heading)' }}>
              Core Architectural Capabilities
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.65 }}>
              Built specifically to demonstrate relational modeling, referential integrity, and high-performance querying.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.15rem',
                    background: '#FFFFFF',
                    border: '1px solid rgba(168, 185, 154, 0.45)',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--forest-emerald)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(168, 185, 154, 0.45)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--natural-pale-sage)',
                      border: '1px solid var(--natural-sage)',
                      color: 'var(--forest-evergreen)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--forest-deep)', fontFamily: 'var(--font-heading)' }}>
                    {pillar.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '2.5rem 1.5rem',
          background: 'var(--forest-deep)',
          textAlign: 'center',
          color: 'var(--neutral-ivory)',
          fontSize: '0.9rem',
          borderTop: '1px solid rgba(196, 164, 91, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}
        >
          <span>🌿 Biodiversity Management System</span>
          <span style={{ color: 'var(--accent-gold)' }}>•</span>
          <span style={{ color: 'var(--natural-sage)' }}>@2026</span>
        </div>
      </footer>
    </div>
  );
};
