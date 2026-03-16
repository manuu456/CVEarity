import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSkeleton } from '../components/common';

const RATE_LIMIT_OPTIONS = [50, 100, 250, 500, 1000];
const DEFAULT_RATE_LIMIT = 100;

const S = {
  page: { minHeight: '100vh', background: '#050505', paddingTop: '96px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px' },
  wrap: { maxWidth: '896px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid #1f1f1f', paddingBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  h1: { fontSize: '36px', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', margin: 0 },
  badge: { padding: '2px 8px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '4px' },
  muted: { color: '#9ca3af', fontSize: '13px', fontWeight: '500', marginTop: '6px' },
  btnRed: { padding: '10px 24px', background: '#E53E3E', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' },
  card: { background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' },
  input: { flex: 1, padding: '10px 16px', background: '#050505', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', outline: 'none' },
  select: { padding: '10px 16px', background: '#050505', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', outline: 'none', cursor: 'pointer' },
  btnGreen: { padding: '10px 32px', background: 'transparent', color: '#22C55E', border: '2px solid #22C55E', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' },
  keyRow: { padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', gap: '12px', flexWrap: 'wrap' },
  mono: { fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af' },
  getBadge: { padding: '2px 6px', background: '#1e3a5f', color: '#60a5fa', fontSize: '9px', fontWeight: '700', borderRadius: '3px' },
  rateBadge: { padding: '2px 7px', background: '#1a2a1a', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', fontSize: '10px', fontWeight: '700', borderRadius: '4px', letterSpacing: '0.03em' },
  codeBg: { background: '#000', border: '1px solid #1f1f1f', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#22C55E', overflowX: 'auto' },
};

export const DeveloperPage = () => {
  const [keys, setKeys] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState(DEFAULT_RATE_LIMIT);
  const [newKey, setNewKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingRateId, setEditingRateId] = useState(null);
  const [editingRateValue, setEditingRateValue] = useState(DEFAULT_RATE_LIMIT);

  useEffect(() => { fetchKeys(); }, []);

  const fetchKeys = async () => {
    try { const r = await api.get('/developer/keys'); setKeys(r.data.data || []); } catch (e) {}
    setLoading(false);
  };

  const generateKey = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/developer/keys', { key_name: keyName, rate_limit: rateLimit });
      setNewKey(r.data.data?.api_key);
      setKeyName('');
      setRateLimit(DEFAULT_RATE_LIMIT);
      setShowForm(false);
      fetchKeys();
    } catch (e) {}
  };

  const revokeKey = async (id) => {
    try { await api.delete(`/developer/keys/${id}`); fetchKeys(); } catch (e) {}
  };

  const startEditRate = (key) => {
    setEditingRateId(key.id);
    setEditingRateValue(key.rate_limit || DEFAULT_RATE_LIMIT);
  };

  const saveRateLimit = async (id) => {
    try {
      await api.patch(`/developer/keys/${id}/rate-limit`, { rate_limit: editingRateValue });
      setEditingRateId(null);
      fetchKeys();
    } catch (e) {}
  };

  const copyKey = (key) => navigator.clipboard.writeText(key);

  if (loading) return (
    <div style={S.page}>
      <div style={S.wrap}>
        <LoadingSkeleton className="h-10 w-64 rounded-lg mb-8" />
        <LoadingSkeleton className="h-48 w-full rounded-xl mb-4" />
        <LoadingSkeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={S.h1}>API Access</h1>
              <span style={S.badge}>Developer</span>
            </div>
            <p style={S.muted}>Manage API keys for programmatic access to vulnerability intelligence.</p>
          </div>
          <button style={S.btnRed} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Key'}
          </button>
        </div>

        {/* New key success alert */}
        {newKey && (
          <div style={{ ...S.card, border: '1px solid rgba(34,197,94,0.3)', marginBottom: '32px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: '#22C55E' }} />
            <div style={{ paddingLeft: '12px' }}>
              <p style={{ color: '#22C55E', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                API Key Generated
              </p>
              <p style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '16px' }}>
                This key will not be shown again. Copy it now and store it securely.
              </p>
              <div style={{ background: '#000', border: '1px solid #1f1f1f', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#22C55E', wordBreak: 'break-all', marginBottom: '16px' }}>
                {newKey}
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => copyKey(newKey)} style={{ ...S.btnGreen, padding: '6px 16px', fontSize: '10px' }}>Copy Key</button>
                <button onClick={() => setNewKey(null)} style={{ padding: '6px 16px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {/* New key form */}
        {showForm && (
          <div style={{ ...S.card, marginBottom: '32px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: '#E53E3E' }} />
            <div style={{ paddingLeft: '12px' }}>
              <h3 style={{ color: '#fff', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>New API Key</h3>
              <form onSubmit={generateKey} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Key name (e.g. Jenkins CI)"
                  value={keyName}
                  onChange={e => setKeyName(e.target.value)}
                  style={S.input}
                  required
                />
                <select
                  value={rateLimit}
                  onChange={e => setRateLimit(Number(e.target.value))}
                  style={S.select}
                  title="Requests per hour"
                >
                  {RATE_LIMIT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt} req/hr</option>
                  ))}
                </select>
                <button type="submit" style={S.btnRed}>Generate</button>
              </form>
            </div>
          </div>
        )}

        {/* Keys list */}
        <div style={{ marginBottom: '48px' }}>
          <h3 style={{ color: '#fff', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Active API Keys</h3>
          {keys.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '48px' }}>
              <p style={{ color: '#4b5563', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No API keys yet</p>
            </div>
          ) : (
            <div style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' }}>
              {keys.map((k, i) => (
                <div key={k.id} style={{ ...S.keyRow, borderBottom: i < keys.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{k.key_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={S.mono}>{k.api_key_preview}</span>
                      <span style={{ color: '#2a2a2a' }}>·</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#9ca3af' }}>{k.permissions}</span>
                      <span style={{ color: '2a2a2a' }}>·</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: k.is_active ? '#22C55E' : '#ef4444' }}>
                        {k.is_active ? 'Active' : 'Revoked'}
                      </span>
                      <span style={{ color: '#2a2a2a' }}>·</span>
                      {editingRateId === k.id ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <select
                            value={editingRateValue}
                            onChange={e => setEditingRateValue(Number(e.target.value))}
                            style={{ ...S.select, padding: '2px 8px', fontSize: '10px' }}
                          >
                            {RATE_LIMIT_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt} req/hr</option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveRateLimit(k.id)}
                            style={{ background: 'transparent', border: 'none', color: '#22C55E', fontSize: '10px', fontWeight: '700', cursor: 'pointer', padding: '2px 6px' }}
                          >Save</button>
                          <button
                            onClick={() => setEditingRateId(null)}
                            style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '10px', fontWeight: '700', cursor: 'pointer', padding: '2px 6px' }}
                          >Cancel</button>
                        </span>
                      ) : (
                        <button
                          onClick={() => startEditRate(k)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          title="Edit rate limit"
                        >
                          <span style={S.rateBadge}>{k.rate_limit || DEFAULT_RATE_LIMIT} req/hr</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => revokeKey(k.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>Revoke</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Docs */}
        <div style={S.card}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '32px' }}>API Reference</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            {[
              { method: 'GET', path: '/api/cves', desc: 'List vulnerabilities. Params: severity, search, year' },
              { method: 'GET', path: '/api/cves/:id', desc: 'Get full details for a CVE identifier' },
              { method: 'GET', path: '/api/cves/statistics', desc: 'Severity distribution and trend data' },
              { method: 'GET', path: '/api/watchlist', desc: 'Your tracked software watchlist entries' },
            ].map((e, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={S.getBadge}>{e.method}</span>
                  <code style={{ fontFamily: 'monospace', fontSize: '12px', color: '#e2e8f0', fontWeight: '700' }}>{e.path}</code>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '12px' }}>{e.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Example Request</p>
            <div style={S.codeBg}>
              {'curl -H "X-API-Key: YOUR_KEY" https://your-domain.com/api/cves'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
