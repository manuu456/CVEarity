import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const S = {
  page: { minHeight: '100vh', background: '#050505', paddingTop: '96px', paddingBottom: '60px', paddingLeft: '24px', paddingRight: '24px' },
  wrap: { maxWidth: '860px', margin: '0 auto' },
  card: { background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '16px', marginBottom: '24px', overflow: 'hidden' },
  cardHead: { padding: '20px 28px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '12px' },
  icon: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(229,62,62,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: 0 },
  sub: { fontSize: '11px', color: '#6b7280', margin: '2px 0 0' },
  body: { padding: '28px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '7px' },
  input: { width: '100%', padding: '11px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '500', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  btnPrimary: { padding: '11px 24px', background: '#E53E3E', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.05em', boxShadow: '0 0 16px rgba(229,62,62,0.3)', transition: 'opacity 0.2s', whiteSpace: 'nowrap' },
  btnGhost: { padding: '11px 20px', background: 'transparent', color: '#9ca3af', border: '1px solid #2a2a2a', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' },
};

const StatBox = ({ label, value, color = '#ffffff' }) => (
  <div style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '10px', padding: '16px 20px' }}>
    <p style={{ fontSize: '10px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>{label}</p>
    <p style={{ fontSize: '24px', fontWeight: '900', color, margin: 0, letterSpacing: '-0.02em' }}>{value ?? '—'}</p>
  </div>
);

const LogLine = ({ line }) => {
  const color = line.startsWith('✅') ? '#4ade80' : line.startsWith('❌') ? '#f87171' : line.startsWith('⚠️') ? '#fbbf24' : '#9ca3af';
  return <p style={{ color, fontSize: '12px', fontFamily: 'monospace', margin: '3px 0', lineHeight: '1.5' }}>{line}</p>;
};

export const DataSyncPage = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchSyncing, setSearchSyncing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [maxResults, setMaxResults] = useState('200');

  const addLog = (line) => setLogs(prev => [...prev, line]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const r = await api.get('/sync/stats');
      if (r.data.success) setStats(r.data.stats);
    } catch {
      setStats(null);
    }
    setLoadingStats(false);
  };

  useEffect(() => { loadStats(); }, []);

  const runSync = async () => {
    setSyncing(true);
    setLogs([]);
    addLog(`🔄 Starting NVD sync (max ${maxResults} CVEs)...`);
    try {
      const r = await api.post(`/sync/cves?maxResults=${maxResults}&resultsPerPage=100`);
      if (r.data.success) {
        addLog(`✅ Sync complete: ${r.data.synced} new, ${r.data.updated} updated, ${r.data.skipped} skipped`);
        addLog(`✅ Total processed: ${r.data.total}`);
      } else {
        addLog(`❌ Sync failed: ${r.data.error || 'Unknown error'}`);
      }
    } catch (e) {
      addLog(`❌ Request failed: ${e.response?.data?.error || e.message}`);
    }
    await loadStats();
    setSyncing(false);
  };

  const runKeywordSync = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setSearchSyncing(true);
    setLogs([]);
    addLog(`🔍 Searching NVD for: "${keyword}"...`);
    try {
      const r = await api.post('/sync/search', { keyword: keyword.trim() });
      if (r.data.success) {
        addLog(`✅ Found ${r.data.total} CVEs, synced ${r.data.synced} new`);
        addLog(r.data.message);
      } else {
        addLog(`❌ Search failed: ${r.data.error || 'Unknown error'}`);
      }
    } catch (e) {
      addLog(`❌ Request failed: ${e.response?.data?.error || e.message}`);
    }
    await loadStats();
    setSearchSyncing(false);
  };

  const runCleanup = async () => {
    if (!window.confirm('Delete CVEs older than 90 days from the database?')) return;
    addLog('🗑️ Running cleanup (CVEs older than 90 days)...');
    try {
      const r = await api.post('/sync/cleanup?retentionDays=90');
      if (r.data.success) {
        addLog(`✅ Cleanup complete: ${r.data.deleted} CVEs removed`);
      } else {
        addLog(`❌ Cleanup failed: ${r.data.error}`);
      }
    } catch (e) {
      addLog(`❌ Request failed: ${e.message}`);
    }
    await loadStats();
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>NVD Data Sync</h1>
            <span style={{ padding: '2px 9px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'rgba(229,62,62,0.12)', color: '#E53E3E', border: '1px solid rgba(229,62,62,0.25)' }}>Admin</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            Pull real CVE data from the NIST National Vulnerability Database (NVD API v2.0).
          </p>
        </div>

        {/* Stats */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.icon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={S.title}>Database Statistics</p>
              <p style={S.sub}>Current CVE data in the local database.</p>
            </div>
            <button onClick={loadStats} disabled={loadingStats} style={{ ...S.btnGhost, padding: '7px 14px', fontSize: '11px' }}>
              {loadingStats ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>
          <div style={{ ...S.body, paddingTop: '20px' }}>
            {loadingStats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[...Array(4)].map((_, i) => <div key={i} style={{ background: '#1a1a1a', borderRadius: '10px', height: '72px', animation: 'pulse 1.5s infinite' }} />)}
              </div>
            ) : stats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                  <StatBox label="Total CVEs" value={stats.totalCVEs?.toLocaleString()} color="#ffffff" />
                  <StatBox label="Last Synced" value={stats.lastSync ? new Date(stats.lastSync).toLocaleDateString() : 'Never'} color="#9ca3af" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <StatBox label="Critical" value={stats.bySeverity?.critical} color="#ef4444" />
                  <StatBox label="High" value={stats.bySeverity?.high} color="#f97316" />
                  <StatBox label="Medium" value={stats.bySeverity?.medium} color="#eab308" />
                  <StatBox label="Low" value={stats.bySeverity?.low} color="#22c55e" />
                </div>
              </>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '13px' }}>Failed to load stats.</p>
            )}
          </div>
        </div>

        {/* Full Sync */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.icon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
            </div>
            <div>
              <p style={S.title}>Full NVD Sync</p>
              <p style={S.sub}>Fetch the latest CVEs from NVD and insert into the database. Takes 1–3 minutes.</p>
            </div>
          </div>
          <div style={S.body}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px' }}>
                <label style={S.label}>Max CVEs to fetch</label>
                <select
                  value={maxResults}
                  onChange={e => setMaxResults(e.target.value)}
                  style={{ ...S.input, cursor: 'pointer' }}
                >
                  <option value="50">50 CVEs (quick test)</option>
                  <option value="200">200 CVEs</option>
                  <option value="500">500 CVEs</option>
                  <option value="1000">1000 CVEs</option>
                  <option value="2000">2000 CVEs (slow)</option>
                </select>
              </div>
              <button onClick={runSync} disabled={syncing || searchSyncing} style={{ ...S.btnPrimary, opacity: (syncing || searchSyncing) ? 0.6 : 1 }}>
                {syncing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Syncing...
                  </span>
                ) : '↓ Sync from NVD'}
              </button>
            </div>
            <div style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '8px', padding: '4px 0' }}>
              <div style={{ padding: '8px 14px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Sync Log</span>
                {logs.length > 0 && <button onClick={() => setLogs([])} style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '11px', cursor: 'pointer' }}>Clear</button>}
              </div>
              <div style={{ padding: '12px 14px', minHeight: '60px', maxHeight: '180px', overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <p style={{ color: '#2a2a2a', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>Waiting for sync...</p>
                ) : logs.map((l, i) => <LogLine key={i} line={l} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Sync */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.icon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            </div>
            <div>
              <p style={S.title}>Search & Sync by Keyword</p>
              <p style={S.sub}>Fetch CVEs matching a specific product, vendor, or technology (e.g. "Apache", "OpenSSL").</p>
            </div>
          </div>
          <div style={S.body}>
            <form onSubmit={runKeywordSync} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={S.label}>Keyword</label>
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="e.g. Apache, OpenSSL, Windows, Log4j"
                  style={S.input}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" disabled={searchSyncing || syncing || !keyword.trim()} style={{ ...S.btnPrimary, opacity: (searchSyncing || syncing || !keyword.trim()) ? 0.6 : 1 }}>
                  {searchSyncing ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Searching...
                    </span>
                  ) : '🔍 Search & Sync'}
                </button>
              </div>
            </form>
            <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '12px' }}>
              Popular: Apache · OpenSSL · Windows · Linux · Log4j · Spring · nginx · Chrome · Firefox
            </p>
          </div>
        </div>

        {/* Maintenance */}
        <div style={{ ...S.card, borderColor: 'rgba(239,68,68,0.15)' }}>
          <div style={{ ...S.cardHead, borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
            <div style={{ ...S.icon, background: 'rgba(239,68,68,0.08)' }}>
              <svg width="16" height="16" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
            </div>
            <div>
              <p style={{ ...S.title, color: '#ef4444' }}>Database Maintenance</p>
              <p style={S.sub}>Remove stale CVE records to keep the database lean.</p>
            </div>
          </div>
          <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: '#fff', fontWeight: '700', fontSize: '13px', margin: '0 0 4px' }}>Cleanup Old CVEs</p>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Permanently delete CVEs older than 90 days. Cannot be undone.</p>
            </div>
            <button onClick={runCleanup} style={{ padding: '9px 18px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Run Cleanup
            </button>
          </div>
        </div>

        {/* API key hint */}
        <div style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '16px 20px' }}>
          <p style={{ fontSize: '10px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 6px' }}>NVD API Key (optional)</p>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
            Without an API key the NVD rate limit is ~5 requests/30s. Add <code style={{ color: '#9ca3af', background: '#111', padding: '1px 5px', borderRadius: '3px' }}>NVD_API_KEY=your_key</code> to <code style={{ color: '#9ca3af', background: '#111', padding: '1px 5px', borderRadius: '3px' }}>backend/.env</code> for higher limits.
            Get a free key at <span style={{ color: '#E53E3E' }}>nvd.nist.gov/developers/request-an-api-key</span>
          </p>
        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}select option{background:#0a0a0a;color:#fff;}input:focus,select:focus{border-color:#E53E3E!important;outline:none;}`}</style>
    </div>
  );
};
