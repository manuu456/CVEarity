import React, { useState, useEffect } from 'react';
import api from '../services/api';

const severityColors = {
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  low: 'text-green-400 border-green-500/30 bg-green-500/10',
  unknown: 'text-slate-400 border-slate-600 bg-slate-500/10'
};

const ScoreBar = ({ score, max = 10 }) => {
  const pct = Math.min((score / max) * 100, 100);
  const color = score >= 9 ? 'bg-red-500' : score >= 7 ? 'bg-orange-500' : score >= 4 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>CVSS Score</span><span className="font-bold text-white">{score?.toFixed(1) || 'N/A'}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, a, b, highlight }) => (
  <div className={`grid grid-cols-3 gap-2 py-3 border-b border-slate-700/50 items-start ${highlight ? 'bg-cyan-500/5 rounded-lg px-2' : ''}`}>
    <div className="text-slate-400 text-xs font-medium uppercase tracking-wider pt-0.5">{label}</div>
    <div className="text-white text-sm">{a || <span className="text-slate-500">—</span>}</div>
    <div className={`text-sm ${highlight && a !== b ? 'text-yellow-400 font-medium' : 'text-white'}`}>
      {b || <span className="text-slate-500">—</span>}
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
    if (slot === 'a') { setSearchA(cve.cve_id); setSuggestions(s => ({ ...s, a: [] })); fetchCVE(cve.cve_id, 'a'); }
    else { setSearchB(cve.cve_id); setSuggestions(s => ({ ...s, b: [] })); fetchCVE(cve.cve_id, 'b'); }
  };

  const getSoftware = (cve) => {
    if (!cve) return '—';
    const sw = cve.affectedSoftware || cve.affected_software || [];
    const arr = Array.isArray(sw) ? sw : JSON.parse(sw || '[]');
    return arr.slice(0, 3).join(', ') || '—';
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          CVE Comparison Tool
        </h1>
        <p className="text-slate-400 mb-8">Side-by-side comparison of any two vulnerabilities</p>

        {/* Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { slot: 'a', search: searchA, setSearch: setSearchA, cve: cveA },
            { slot: 'b', search: searchB, setSearch: setSearchB, cve: cveB }
          ].map(({ slot, search, setSearch, cve }) => (
            <div key={slot}>
              <label className="text-slate-400 text-sm mb-2 block font-medium">
                CVE {slot.toUpperCase()}
              </label>
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. CVE-2024-1234"
                    value={search}
                    onChange={e => { setSearch(e.target.value); searchSuggestions(e.target.value, slot); }}
                    onKeyDown={e => e.key === 'Enter' && fetchCVE(search, slot)}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                  <button
                    onClick={() => fetchCVE(search, slot)}
                    disabled={loading[slot]}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {loading[slot] ? '...' : 'Load'}
                  </button>
                </div>
                {suggestions[slot].length > 0 && (
                  <div className="absolute top-full left-0 right-12 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                    {suggestions[slot].map(s => (
                      <div key={s.cve_id} onClick={() => selectSuggestion(s, slot)}
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-slate-700 transition">
                        <span className="text-cyan-400 font-mono text-xs">{s.cve_id}</span>
                        <span className="text-slate-300 text-xs truncate">{s.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cve && (
                <div className={`mt-2 px-3 py-2 rounded-lg border text-xs ${severityColors[cve.severity] || severityColors.unknown}`}>
                  ✓ {cve.cveId || cve.cve_id} — {cve.severity?.toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        {(cveA || cveB) && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-slate-700">
              <div className="text-slate-400 text-xs font-medium uppercase">Field</div>
              <div className="text-cyan-400 font-bold text-sm">{cveA ? (cveA.cveId || cveA.cve_id) : 'CVE A'}</div>
              <div className="text-cyan-400 font-bold text-sm">{cveB ? (cveB.cveId || cveB.cve_id) : 'CVE B'}</div>
            </div>

            <InfoRow label="Severity" a={cveA?.severity?.toUpperCase()} b={cveB?.severity?.toUpperCase()} highlight={cveA?.severity !== cveB?.severity} />
            <InfoRow label="CVSS Score"
              a={cveA ? parseFloat(cveA.severityScore || cveA.severity_score || 0).toFixed(1) : null}
              b={cveB ? parseFloat(cveB.severityScore || cveB.severity_score || 0).toFixed(1) : null}
              highlight
            />
            <InfoRow label="Published"
              a={cveA?.publishedDate || cveA?.published_date}
              b={cveB?.publishedDate || cveB?.published_date}
            />
            <InfoRow label="Affected Software" a={getSoftware(cveA)} b={getSoftware(cveB)} />
            <InfoRow label="Has Exploit"
              a={cveA ? (cveA.has_exploit || cveA.hasExploit ? '⚡ Yes' : '✘ No') : null}
              b={cveB ? (cveB.has_exploit || cveB.hasExploit ? '⚡ Yes' : '✘ No') : null}
              highlight
            />
            <InfoRow label="CISA KEV"
              a={cveA ? (cveA.is_kev || cveA.isKEV ? '🏛️ Yes' : '✘ No') : null}
              b={cveB ? (cveB.is_kev || cveB.isKEV ? '🏛️ Yes' : '✘ No') : null}
              highlight
            />

            {/* Score bars */}
            <div className="grid grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-700">
              <div className="col-start-2">
                {cveA && <ScoreBar score={parseFloat(cveA.severityScore || cveA.severity_score || 0)} />}
              </div>
              <div>
                {cveB && <ScoreBar score={parseFloat(cveB.severityScore || cveB.severity_score || 0)} />}
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
              {[cveA, cveB].map((cve, i) => cve && (
                <div key={i}>
                  <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Description {i === 0 ? 'A' : 'B'}</h4>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-4">
                    {cve.description || 'No description available'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!cveA && !cveB && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-5xl mb-4">⚖️</p>
            <p className="text-lg">Enter two CVE IDs to compare them side by side</p>
          </div>
        )}
      </div>
    </div>
  );
};
