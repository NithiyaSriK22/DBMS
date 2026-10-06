import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ShieldAlert, Trees, MapPin, User, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';

export const GlobalSearchModal = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ species: [], habitats: [], locations: [], researchers: [], threats: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ species: [], habitats: [], locations: [], researchers: [], threats: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ species: [], habitats: [], locations: [], researchers: [], threats: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search.global(query);
        if (res.success) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.species.length +
    results.habitats.length +
    results.locations.length +
    results.researchers.length +
    results.threats.length;

  const handleSelect = (entityType, id) => {
    onClose();
    if (onNavigate) {
      onNavigate(entityType, id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', background: 'var(--bg-surface-elevated)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={20} color="var(--emerald-400)" />
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.4rem 0',
              fontSize: '1rem',
              boxShadow: 'none',
            }}
            placeholder="Search species, habitats, locations, researchers, threats..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 size={18} className="animate-spin" color="var(--text-muted)" />}
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {!query && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Type anything to search across the entire relational biodiversity database...
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-role" onClick={() => setQuery('Tiger')} style={{ cursor: 'pointer' }}>Bengal Tiger</span>
                <span className="badge badge-role" onClick={() => setQuery('Western Ghats')} style={{ cursor: 'pointer' }}>Western Ghats</span>
                <span className="badge badge-role" onClick={() => setQuery('Poaching')} style={{ cursor: 'pointer' }}>Poaching</span>
                <span className="badge badge-role" onClick={() => setQuery('Elephant')} style={{ cursor: 'pointer' }}>Elephant</span>
              </div>
            </div>
          )}

          {query && totalResults === 0 && !loading && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matching relational records found for "<strong>{query}</strong>".
            </div>
          )}

          {/* Species Results */}
          {results.species.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Species ({results.species.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {results.species.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect('species', item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--emerald-500)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.subtitle} • {item.tag}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge status={item.badge} />
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habitats Results */}
          {results.habitats.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Habitats ({results.habitats.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {results.habitats.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect('habitats', item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.subtitle} • {item.tag}</div>
                    </div>
                    <span className="badge badge-active">{item.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locations Results */}
          {results.locations.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Locations ({results.locations.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {results.locations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect('locations', item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>
                    </div>
                    <MapPin size={16} color="var(--emerald-400)" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Threats Results */}
          {results.threats.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Threat Factors ({results.threats.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {results.threats.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect('threats', item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>
                    </div>
                    <StatusBadge status={item.badge} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
