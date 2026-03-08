import React, { useState, useEffect } from 'react';
import api from '../services/api';

const severityColors = {
  critical: 'text-red-500 border-red-500/20 bg-red-500/10',
  high: 'text-orange-500 border-orange-500/20 bg-orange-500/10',
  medium: 'text-yellow border-yellow/20 bg-yellow/10',
  low: 'text-green-500 border-green-500/20 bg-green-500/10',
  unknown: 'text-muted border-subtle bg-page'
};

const ScoreBar = ({ score, max = 10 }) => {
  const pct = Math.min((score / max) * 100, 100);
  const color = score >= 9 ? 'bg-red-500' : score >= 7 ? 'bg-orange-500' : score >= 4 ? 'bg-yellow' : 'bg-green-500';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted mb-2">
        <span>Computed Score</span><span className="text-main">{score?.toFixed(1) || 'N/A'}</span>
      </div>
      <div className="h-1 bg-page rounded-full overflow-hidden transition-theme">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, a, b, highlight }) => (
  <div className={`grid grid-cols-3 gap-6 py-4 border-b border-subtle items-start transition-theme ${highlight ? 'bg-yellow/5' : ''}`}>
    <div className="text-muted text-[9px] font-black uppercase tracking-widest pt-1">{label}</div>
    <div className="text-main text-sm font-bold">{a || <span className="opacity-30">—</span>}</div>
    <div className={`text-sm font-bold ${highlight && a !== b ? 'text-red-500 italic' : 'text-main'}`}>
      {b || <span className="opacity-30">—</span>}
    </div>
  </div>
);

export const CVEComparePage = () => {
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [cveA, setCveA] = useState(null);
  const [cveB, setCveB] = useState(null);
  const [suggestions, setSuggestions] = useState({ a: [], b: [] });
  const [loading, setLoading] = useState({ a: false, b: false });

  const fetchCVE = async (id, slot) => {
    if (!id.trim()) return;
    setLoading(l => ({ ...l, [slot]: true }));
    try {
      const r = await api.get(`/cves/${id.trim().toUpperCase()}`);
      const cve = r.data.data || r.data.cve || r.data;
      if (slot === 'a') setCveA(cve);
      else setCveB(cve);
    } catch (e) {
      if (slot === 'a') setCveA(null);
      else setCveB(null);
    }
    setLoading(l => ({ ...l, [slot]: false }));
  };

  const searchSuggestions = async (q, slot) => {
    if (q.length < 2) { setSuggestions(s => ({ ...s, [slot]: [] })); return; }
    try {
      const r = await api.get(`/live/autocomplete?q=${encodeURIComponent(q)}`);
      setSuggestions(s => ({ ...s, [slot]: r.data.data || [] }));
    } catch (e) {}
  };

  const selectSuggestion = (cve, slot) => {
    if (slot === 'a') { setSearchA(cve.cve_id || cve.cveId); setSuggestions(s => ({ ...s, a: [] })); fetchCVE(cve.cve_id || cve.cveId, 'a'); }
    else { setSearchB(cve.cve_id || cve.cveId); setSuggestions(s => ({ ...s, b: [] })); fetchCVE(cve.cve_id || cve.cveId, 'b'); }
  };

  const getSoftware = (cve) => {
    if (!cve) return '—';
    const sw = cve.affectedSoftware || cve.affected_software || [];
    const arr = Array.isArray(sw) ? sw : JSON.parse(sw || '[]');
    return arr.slice(0, 3).join(', ') || '—';
  };

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6 transition-theme">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-subtle pb-8 gap-6">
           <div>
              <div className="flex items-center gap-4 mb-2">
                 <h1 className="text-4xl font-black text-main tracking-tight">Differential Intelligence</h1>
                 <span className="px-3 py-1 bg-main text-white text-[9px] font-black uppercase tracking-widest rounded transition-theme shadow-sm">Side-by-Side Analysis</span>
              </div>
              <p className="text-muted text-sm font-medium">Compare vulnerability profiles to prioritize remediation efforts across infrastructure.</p>
           </div>
        </div>

        {/* Tactical Selection Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {[
            { slot: 'a', search: searchA, setSearch: setSearchA, cve: cveA, label: 'Analysis Point A' },
            { slot: 'b', search: searchB, setSearch: setSearchB, cve: cveB, label: 'Analysis Point B' }
          ].map(({ slot, search, setSearch, cve, label }) => (
            <div key={slot} className="bg-card border border-subtle rounded-2xl p-6 shadow-sm relative overflow-hidden transition-theme">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-main opacity-10"></div>
              <label className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">
                {label}
              </label>
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. CVE-2024-1234"
                    value={search}
                    onChange={e => { setSearch(e.target.value); searchSuggestions(e.target.value, slot); }}
                    onKeyDown={e => e.key === 'Enter' && fetchCVE(search, slot)}
                    className="flex-1 bg-page border border-subtle rounded-lg px-4 py-2.5 text-sm text-main font-bold placeholder-muted/30 focus:outline-none focus:ring-1 focus:ring-main transition-theme"
                  />
                  <button
                    onClick={() => fetchCVE(search, slot)}
                    disabled={loading[slot]}
                    className="tenable-btn-primary px-6 py-2.5 text-[10px] tracking-widest uppercase disabled:opacity-50"
                  >
                    {loading[slot] ? '...' : 'Initiate'}
                  </button>
                </div>
                {suggestions[slot].length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-subtle rounded-xl shadow-2xl py-2 z-50 transition-theme backdrop-blur-xl">
                    {suggestions[slot].map(s => (
                      <div key={s.cve_id || s.cveId} onClick={() => selectSuggestion(s, slot)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-page transition-theme border-b border-subtle last:border-0">
                        <span className="text-main font-black text-[10px] uppercase w-24 flex-shrink-0">{s.cve_id || s.cveId}</span>
                        <span className="text-muted text-[10px] font-bold truncate tracking-tight">{s.title || 'Untitled security record'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cve && (
                <div className={`mt-4 px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-tight flex items-center gap-2 transition-theme ${severityColors[cve.severity] || severityColors.unknown}`}>
                  <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                  {cve.cveId || cve.cve_id} — {cve.severity || 'UNKNOWN'} RISK
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Institutional Comparison Table */}
        {(cveA || cveB) && (
          <div className="bg-card border border-subtle rounded-2xl shadow-lg overflow-hidden mb-12 transition-theme">
            {/* Matrix Header */}
            <div className="grid grid-cols-3 gap-6 p-10 bg-main text-white relative transition-theme">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-end">Comparative Feature</div>
              <div className="text-xl font-black tracking-tighter">{cveA ? (cveA.cveId || cveA.cve_id) : 'PENDING TARGET A'}</div>
              <div className="text-xl font-black tracking-tighter">{cveB ? (cveB.cveId || cveB.cve_id) : 'PENDING TARGET B'}</div>
            </div>

            <div className="px-10 pb-10">
              <InfoRow label="Operational Severity" a={cveA?.severity?.toUpperCase()} b={cveB?.severity?.toUpperCase()} highlight={cveA?.severity !== cveB?.severity} />
              <InfoRow label="Base Score (CVSS)"
                a={cveA ? parseFloat(cveA.severityScore || cveA.severity_score || 0).toFixed(1) : null}
                b={cveB ? parseFloat(cveB.severityScore || cveB.severity_score || 0).toFixed(1) : null}
                highlight
              />
              <InfoRow label="Intelligence Disseminated"
                a={cveA?.publishedDate || cveA?.published_date}
                b={cveB?.publishedDate || cveB?.published_date}
              />
              <InfoRow label="Targeted Infrastructure" a={getSoftware(cveA)} b={getSoftware(cveB)} />
              <InfoRow label="Exploit Availability"
                a={cveA ? (cveA.has_exploit || cveA.hasExploit ? '⚡ ACTIVE EXPLOITATION' : '✘ NONE DETECTED') : null}
                b={cveB ? (cveB.has_exploit || cveB.hasExploit ? '⚡ ACTIVE EXPLOITATION' : '✘ NONE DETECTED') : null}
                highlight
              />
              <InfoRow label="CISA KEV STATUS"
                a={cveA ? (cveA.is_kev || cveA.isKEV ? '🏛️ ARCHIVED AS KEV' : '✘ INACTIVE') : null}
                b={cveB ? (cveB.is_kev || cveB.isKEV ? '🏛️ ARCHIVED AS KEV' : '✘ INACTIVE') : null}
                highlight
              />

              {/* Graphical Scoring Matrix */}
              <div className="grid grid-cols-2 gap-12 mt-10 pt-10">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4 px-1">Target A Metrics</h4>
                  {cveA ? <ScoreBar score={parseFloat(cveA.severityScore || cveA.severity_score || 0)} /> : <div className="h-6 bg-page rounded-lg animate-pulse"></div>}
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4 px-1">Target B Metrics</h4>
                  {cveB ? <ScoreBar score={parseFloat(cveB.severityScore || cveB.severity_score || 0)} /> : <div className="h-6 bg-page rounded-lg animate-pulse"></div>}
                </div>
              </div>

              {/* Intelligence Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-12 border-t border-subtle">
                {[cveA, cveB].map((cve, i) => (
                  <div key={i}>
                    <h4 className="text-[10px] font-black text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-yellow"></span>
                       Summary Assessment {i === 0 ? 'A' : 'B'}
                    </h4>
                    <p className="text-muted text-[13px] font-medium leading-relaxed italic border-l-2 border-yellow/40 pl-6 py-2">
                      {cve?.description || 'Data acquisition in progress...'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!cveA && !cveB && (
          <div className="bg-card border border-subtle rounded-2xl p-24 text-center shadow-sm transition-theme">
            <div className="w-20 h-20 bg-page rounded-full flex items-center justify-center mx-auto mb-8 text-3xl transition-theme">⚖️</div>
            <h3 className="text-main font-black text-2xl uppercase tracking-tighter mb-4">Comparison Matrix Idle</h3>
            <p className="text-muted text-sm font-medium italic max-w-sm mx-auto">Enter twin CVE identifiers above to initiate side-by-side differential analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};
