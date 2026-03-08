import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const critColors = {
  low: 'text-green-400 border-green-500/30 bg-green-500/10',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
};
const severityColors = {
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  low: 'text-green-400 border-green-500/30 bg-green-500/10',
};

const CATEGORY_ICONS = { web: '🌐', library: '📦', os: '💻', database: '🗄️', network: '🔌', general: '🖥️' };

const TIPS = [
  { icon: '🎯', title: 'Be specific with versions', desc: 'Use exact versions like "2.4.51" not just "2.4" — more precise matching means fewer false positives.' },
  { icon: '⭐', title: 'Mark business-critical assets', desc: 'Set criticality to "critical" for production systems — they get elevated risk scores on your dashboard.' },
  { icon: '📊', title: 'CVE matches update automatically', desc: 'Once an asset is added, any new CVE that references that software will appear in the matches section below.' },
  { icon: '📥', title: 'Bulk import via CSV', desc: 'Have a large software inventory? Download the CSV template and import hundreds of assets at once.' },
];

export const AssetInventoryPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ software_name: '', version: '', vendor: '', category: 'general', criticality: 'medium' });
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null);
  const [matchFilter, setMatchFilter] = useState('');
  const csvRef = useRef(null);

  useEffect(() => { fetchAll(true); }, []);

  const fetchAll = async (initial = false) => {
    try {
      const [assetsRes, matchesRes] = await Promise.all([
        api.get('/assets'),
        api.get('/assets/matches').catch(() => ({ data: { data: [] } }))
      ]);
      setAssets(assetsRes.data.data || []);
      setMatches(matchesRes.data.data || []);
    } catch (e) { console.error(e); }
    if (initial) setLoading(false);
  };

  const addAsset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', form);
      setForm({ software_name: '', version: '', vendor: '', category: 'general', criticality: 'medium' });
      setShowForm(false);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const removeAsset = async (id) => {
    try { await api.delete(`/assets/${id}`); fetchAll(); }
    catch (e) { console.error(e); }
  };

  // CSV helpers
  const parseCSVLine = (line) => {
    const vals = []; let cur = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQuote = !inQuote; }
      else if (c === ',' && !inQuote) { vals.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    vals.push(cur.trim());
    return vals;
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    return lines.slice(1).map(line => {
      const vals = parseCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return obj;
    }).filter(r => r.software_name || r['software name'] || r.name);
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvImporting(true); setCsvResult(null);
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length === 0) {
      setCsvResult({ error: 'No valid rows. Expected columns: software_name, version, vendor, criticality' });
      setCsvImporting(false); e.target.value = ''; return;
    }
    const VALID_CRIT = ['low', 'medium', 'high', 'critical'];
    const results = await Promise.allSettled(rows.map(row =>
      api.post('/assets', {
        software_name: row.software_name || row['software name'] || row.name,
        version: row.version || '', vendor: row.vendor || '',
        category: row.category || 'general',
        criticality: VALID_CRIT.includes(row.criticality) ? row.criticality : 'medium'
      })
    ));
    const success = results.filter(r => r.status === 'fulfilled').length;
    setCsvResult({ success, failed: results.length - success, total: rows.length });
    fetchAll(); setCsvImporting(false); e.target.value = '';
  };

  const downloadTemplate = () => {
    const csv = 'software_name,version,vendor,category,criticality\nApache HTTP Server,2.4.51,Apache,web,high\nOpenSSL,1.1.1n,OpenSSL,library,critical\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'asset-import-template.csv'; a.click();
  };

  const filteredMatches = matchFilter
    ? matches.filter(m => m.severity === matchFilter)
    : matches;

  const criticalCount = assets.filter(a => a.criticality === 'critical').length;
  const highCount = assets.filter(a => a.criticality === 'high').length;
  const criticalMatches = matches.filter(m => m.severity === 'critical').length;

  if (loading) return (
    <div className="min-h-screen bg-page pt-24 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-card border border-subtle rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-subtle">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-main tracking-tight">Asset Inventory</h1>
              {criticalMatches > 0 && (
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/25 text-[10px] font-black uppercase tracking-widest rounded animate-pulse">
                  {criticalMatches} critical match{criticalMatches > 1 ? 'es' : ''}
                </span>
              )}
            </div>
            <p className="text-muted text-sm font-medium">Register your software stack and get matched against the global CVE database.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="file" accept=".csv" ref={csvRef} onChange={handleCSVImport} className="hidden" />
            <button onClick={downloadTemplate} className="px-3 py-2 bg-card border border-subtle text-muted rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-main transition">
              CSV Template
            </button>
            <button onClick={() => csvRef.current?.click()} disabled={csvImporting}
              className="px-4 py-2 bg-card border border-subtle text-muted rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-main transition disabled:opacity-50">
              {csvImporting ? 'Importing...' : '↑ Import CSV'}
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-lg">
              {showForm ? 'Cancel' : '+ Add Asset'}
            </button>
          </div>
        </div>

        {/* ── CSV feedback ────────────────────────────────────────── */}
        {csvResult && (
          <div className={`rounded-xl p-4 flex items-center justify-between border ${csvResult.error ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
            <p className={`text-xs font-bold ${csvResult.error ? 'text-red-400' : 'text-green-400'}`}>
              {csvResult.error || `Import complete: ${csvResult.success} added, ${csvResult.failed} failed out of ${csvResult.total} rows`}
            </p>
            <button onClick={() => setCsvResult(null)} className="text-muted text-xs hover:text-main transition ml-4">✕</button>
          </div>
        )}

        {/* ── Stat cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Assets', value: assets.length, color: 'text-main', accent: '#3b82f6' },
            { label: 'Critical Assets', value: criticalCount, color: criticalCount > 0 ? 'text-red-400' : 'text-main', accent: '#ef4444' },
            { label: 'High Risk Assets', value: highCount, color: highCount > 0 ? 'text-orange-400' : 'text-main', accent: '#f97316' },
            { label: 'CVE Matches', value: matches.length, color: matches.length > 0 ? 'text-red-400' : 'text-green-400', accent: '#E53E3E' },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-subtle rounded-xl p-4" style={{ borderLeft: `3px solid ${s.accent}` }}>
              <div className="text-muted text-[9px] font-black uppercase tracking-widest mb-2">{s.label}</div>
              <div className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Add asset form ──────────────────────────────────────── */}
        {showForm && (
          <div className="bg-card border border-subtle rounded-xl p-6" style={{ borderLeft: '3px solid #E53E3E' }}>
            <h3 className="text-main font-black text-[10px] uppercase tracking-widest mb-5">Add New Asset</h3>
            <form onSubmit={addAsset} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Software Name *</label>
                <input type="text" placeholder="e.g. Apache HTTP Server" value={form.software_name}
                  onChange={e => setForm({ ...form, software_name: e.target.value })}
                  className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" required />
              </div>
              <div>
                <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Version</label>
                <input type="text" placeholder="e.g. 2.4.51" value={form.version}
                  onChange={e => setForm({ ...form, version: e.target.value })}
                  className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" />
              </div>
              <div>
                <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Vendor</label>
                <input type="text" placeholder="e.g. Apache Foundation" value={form.vendor}
                  onChange={e => setForm({ ...form, vendor: e.target.value })}
                  className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" />
              </div>
              <div>
                <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main font-bold focus:outline-none transition">
                  {Object.entries(CATEGORY_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Criticality</label>
                <select value={form.criticality} onChange={e => setForm({ ...form, criticality: e.target.value })}
                  className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main font-bold focus:outline-none transition">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition">
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Asset list ──────────────────────────────────────────── */}
        <div className="bg-card border border-subtle rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
            <h3 className="text-main font-black text-[10px] uppercase tracking-widest">Registered Assets <span className="ml-2 text-muted font-bold text-[9px]">({assets.length})</span></h3>
          </div>

          {assets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4 opacity-30">🖥️</div>
              <p className="text-main font-black text-sm uppercase tracking-widest mb-2">No assets registered yet</p>
              <p className="text-muted text-xs font-medium mb-6">Add your software stack to start getting vulnerability matches.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowForm(true)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition">
                  + Add First Asset
                </button>
                <button onClick={() => csvRef.current?.click()}
                  className="px-5 py-2 bg-card border border-subtle text-muted rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-main transition">
                  Import CSV
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-subtle">
              {assets.map(a => (
                <div key={a.id} className="flex items-center justify-between px-6 py-4 hover:bg-page/50 transition group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 bg-page border border-subtle rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {CATEGORY_ICONS[a.category] || '🖥️'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-main font-bold text-sm truncate">
                        {a.software_name}{a.version && <span className="text-muted font-normal ml-1.5">v{a.version}</span>}
                      </div>
                      <div className="text-muted text-[10px] font-bold uppercase tracking-wider mt-0.5">{a.vendor || 'Unknown vendor'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${critColors[a.criticality]}`}>{a.criticality}</span>
                    <button onClick={() => removeAsset(a.id)}
                      className="text-[9px] font-black text-red-500 uppercase px-2 py-0.5 rounded border border-red-500/30 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CVE matches ─────────────────────────────────────────── */}
        <div className="bg-card border border-subtle rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
            <h3 className={`font-black text-[10px] uppercase tracking-widest ${matches.length > 0 ? 'text-red-400' : 'text-main'}`}>
              {matches.length > 0 ? '⚠️ ' : ''}CVE Matches on Your Assets
              <span className="ml-2 text-muted font-bold text-[9px]">({matches.length})</span>
            </h3>
            {matches.length > 0 && (
              <div className="flex gap-2">
                {['', 'critical', 'high', 'medium', 'low'].map(sev => (
                  <button key={sev} onClick={() => setMatchFilter(sev)}
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border transition ${matchFilter === sev ? 'bg-white/10 text-main border-white/20' : 'text-muted border-subtle hover:text-main'}`}>
                    {sev || 'All'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3 opacity-30">✅</div>
              <p className="text-green-400 font-black text-sm uppercase tracking-widest mb-1">No CVE matches found</p>
              <p className="text-muted text-xs font-medium">
                {assets.length === 0
                  ? 'Add assets above to start scanning for CVE matches.'
                  : 'Your registered assets have no known CVE matches right now. Keep monitoring!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-subtle">
              {filteredMatches.map((m, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-red-500/5 transition cursor-pointer"
                  onClick={() => navigate(`/cve/${m.cve_id}`)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-main font-black text-sm">{m.cve_id}</span>
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase ${severityColors[m.severity]}`}>{m.severity}</span>
                      </div>
                      <div className="text-main text-xs font-bold line-clamp-1">{m.title}</div>
                      <div className="text-muted text-[10px] font-bold uppercase tracking-wider mt-0.5">
                        Asset: {m.software_name}
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-muted flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Tips panel ──────────────────────────────────────────── */}
        <div className="bg-card border border-subtle rounded-xl p-6">
          <h4 className="text-main font-black text-[10px] uppercase tracking-widest mb-4">Best practices for Asset Inventory</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 bg-page border border-subtle rounded-lg">
                <span className="text-lg flex-shrink-0">{tip.icon}</span>
                <div>
                  <div className="text-main font-bold text-xs mb-0.5">{tip.title}</div>
                  <div className="text-muted text-[10px] font-medium leading-relaxed">{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
