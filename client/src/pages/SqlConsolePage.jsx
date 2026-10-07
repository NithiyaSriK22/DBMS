import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle2, Clock, Code, BookOpen, Layers, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const SqlConsolePage = () => {
  const { addToast } = useToast();
  const [queriesList, setQueriesList] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState(1);
  const [customSql, setCustomSql] = useState('');
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' or 'custom'

  const [executionResult, setExecutionResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await api.queries.getList();
        if (res.success) {
          setQueriesList(res.queries);
          if (res.queries.length > 0) {
            handleRunPreset(res.queries[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchList();
  }, []);

  const handleRunPreset = async (id) => {
    setSelectedQueryId(id);
    setExecuting(true);
    setError(null);
    try {
      const res = await api.queries.execute({ queryId: id });
      if (res.success) {
        setExecutionResult(res);
      }
    } catch (err) {
      setError(err.message || 'Execution error');
      setExecutionResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const handleRunCustom = async () => {
    if (!customSql.trim()) {
      addToast('Please enter a SQL query to execute', 'info');
      return;
    }
    setExecuting(true);
    setError(null);
    try {
      const res = await api.queries.execute({ customSql });
      if (res.success) {
        setExecutionResult(res);
        addToast(`Query executed in ${res.executionTimeMs}`, 'success');
      }
    } catch (err) {
      setError(err.message || 'SQL execution failed');
      setExecutionResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const currentQuery = queriesList.find((q) => q.id === selectedQueryId);

  return (
    <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>DBMS Viva & SQL Relational Console</h2>
            <span
              style={{
                fontSize: '0.7rem',
                background: 'rgba(251, 191, 36, 0.15)',
                color: '#fbbf24',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            >
              VIVA EVALUATION READY
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Direct interactive execution of the 10 core DBMS benchmark queries demonstrating 3NF, multi-table joins, GROUP BY, HAVING, and subqueries.
          </p>
        </div>
      </div>

      {/* Main Console Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Left: Query List Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Benchmark Relational Queries
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '72vh', overflowY: 'auto' }}>
            {queriesList.map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  setActiveTab('preset');
                  handleRunPreset(q.id);
                }}
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: selectedQueryId === q.id && activeTab === 'preset' ? 'var(--bg-surface-elevated)' : 'var(--bg-card)',
                  border: selectedQueryId === q.id && activeTab === 'preset' ? '1px solid var(--emerald-500)' : '1px solid var(--border-subtle)',
                  color: selectedQueryId === q.id && activeTab === 'preset' ? '#ffffff' : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{q.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--emerald-400)', fontStyle: 'italic' }}>
                  {q.concept}
                </div>
              </button>
            ))}

            <button
              onClick={() => {
                setActiveTab('custom');
                if (!customSql) {
                  setCustomSql("SELECT Common_Name, Scientific_Name, Conservation_Status, Population_Estimate FROM Species WHERE Conservation_Status = 'Endangered' ORDER BY Population_Estimate ASC LIMIT 10;");
                }
              }}
              style={{
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'custom' ? 'var(--bg-surface-elevated)' : 'var(--bg-card)',
                border: activeTab === 'custom' ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                color: activeTab === 'custom' ? '#fbbf24' : 'var(--text-secondary)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Code size={16} />
              <span>+ Custom SQL Editor</span>
            </button>
          </div>
        </div>

        {/* Right: Code Viewer & Results Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* SQL Editor / Query View Box */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={16} color="var(--emerald-600)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {activeTab === 'preset' ? currentQuery?.title : 'Custom Interactive SQL Terminal'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {executionResult && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <Clock size={12} />
                    <span>{executionResult.executionTimeMs}</span>
                  </span>
                )}

                <button
                  className="btn btn-primary btn-sm"
                  onClick={activeTab === 'preset' ? () => handleRunPreset(selectedQueryId) : handleRunCustom}
                  disabled={executing}
                >
                  <Play size={13} fill="currentColor" />
                  <span>{executing ? 'Executing SQL...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            {activeTab === 'preset' ? (
              <div>
                <pre
                  style={{
                    background: '#06281c',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    color: '#6ee7b7',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem',
                    overflowX: 'auto',
                    border: '1px solid rgba(5, 150, 105, 0.2)',
                    lineHeight: '1.5',
                  }}
                >
                  {currentQuery?.sql}
                </pre>

                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                  <BookOpen size={14} color="#d97706" />
                  <span><strong>DBMS Concept:</strong> {currentQuery?.concept} — {currentQuery?.description}</span>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  className="form-textarea"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    minHeight: '120px',
                    background: '#06281c',
                    color: '#6ee7b7',
                    border: '1px solid rgba(5, 150, 105, 0.2)',
                  }}
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  placeholder="SELECT * FROM Species WHERE Conservation_Status = 'Endangered';"
                />
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  💡 Enter any standard SQL query (SELECT, JOIN, GROUP BY, HAVING, AGGREGATES) to query the active database.
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="table-container" style={{ minHeight: '260px' }}>
            <div style={{ padding: '0.75rem 1rem', background: '#f1f7f4', borderBottom: '1px solid #d1e7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#065f46' }}>
                Query Execution Results {executionResult ? `(${executionResult.rowCount} rows returned)` : ''}
              </span>
              {executionResult && (
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  Latency: {executionResult.executionTimeMs}
                </span>
              )}
            </div>

            {executing ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                Executing query on relational database engine...
              </div>
            ) : error ? (
              <div style={{ padding: '2rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            ) : !executionResult || executionResult.data.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {executionResult ? 'Query executed successfully with 0 matching rows.' : 'Click "Run Query" to execute against the live database.'}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    {executionResult.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {executionResult.data.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {executionResult.columns.map((col) => (
                        <td key={col} style={{ fontFamily: typeof row[col] === 'number' ? 'var(--font-mono)' : 'inherit' }}>
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
