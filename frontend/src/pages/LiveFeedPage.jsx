import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const useInterval = (callback, delay) => {
  useEffect(() => {
    if (!delay) return;
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
};

const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const severityColors = {
  critical: { card: 'border-red-500/40 bg-red-500/5', badge: 'bg-red-500/20 text-red-400', bar: 'bg-red-500' },
  high:     { card: 'border-orange-500/40 bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-400', bar: 'bg-orange-500' },
  medium:   { card: 'border-yellow-500/40 bg-yellow-500/5', badge: 'bg-yellow-500/20 text-yellow-400', bar: 'bg-yellow-500' },
  low:      { card: 'border-green-500/40 bg-green-500/5', badge: 'bg-green-500/20 text-green-400', bar: 'bg-green-500' },
  unknown:  { card: 'border-slate-600 bg-slate-800/20', badge: 'bg-slate-500/20 text-slate-400', bar: 'bg-slate-500' }
};

const LiveCard = ({ cve, isNew }) => {
  const navigate = useNavigate();
  const colors = severityColors[cve.severity] || severityColors.unknown;
  const score = parseFloat(cve.severity_score) || 0;

  return (
    <div
      onClick={() => navigate(`/cve/${cve.cve_id}`)}
      className={`border rounded-xl p-4 cursor-pointer transition-all duration-500 hover:scale-[1.01] hover:shadow-lg hover:-translate-y-0.5
        ${colors.card} ${isNew ? 'animate-pulse-once ring-1 ring-cyan-400/50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-cyan-400 font-mono font-bold text-sm">{cve.cve_id}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isNew && <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
          <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${colors.badge}`}>{cve.severity}</span>
        </div>
      </div>
      <p className="text-white text-sm font-medium mb-3 line-clamp-2">{cve.title}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>CVSS</span>
            <span className="text-white font-bold">{score.toFixed(1)}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${colors.bar}`} style={{ width: `${(score / 10) * 100}%` }}></div>
          </div>
        </div>
        <span className="text-slate-500 text-xs whitespace-nowrap">
          {cve.published_date ? new Date(cve.published_date).toLocaleDateString() : 'Unknown'}
        </span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }) => {
  const animated = useCountUp(value);
  return (
    <div className={`bg-slate-800/50 border rounded-xl p-4 text-center ${color}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-3xl font-bold mb-1 ${color.includes('red') ? 'text-red-400' : color.includes('orange') ? 'text-orange-400' : color.includes('yellow') ? 'text-yellow-400' : 'text-cyan-400'}`}>
        {animated}
      </div>
      <div className="text-slate-400 text-xs">{label}</div>
    </div>
  );
};

export const LiveFeedPage = () => {
  const [cves, setCVEs] = useState([]);
  const [newCveIds, setNewCveIds] = useState(new Set());
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [stats, setStats] = useState(null);

  const fetchFeed = useCallback(async (isRefresh = false) => {
    try {
      const [feedRes, statusRes, statsRes] = await Promise.all([
        api.get('/live/recent?limit=30'),
        api.get('/live/sync-status'),
        api.get('/cves/statistics').catch(() => ({ data: { data: null } }))
      ]);
      const freshCVEs = feedRes.data.data?.cves || [];

      if (isRefresh && cves.length > 0) {
        const existingIds = new Set(cves.map(c => c.cve_id));
        const newIds = new Set(freshCVEs.filter(c => !existingIds.has(c.cve_id)).map(c => c.cve_id));
        setNewCveIds(newIds);
        setTimeout(() => setNewCveIds(new Set()), 5000);
      }

      setCVEs(freshCVEs);
      setSyncStatus(feedRes.data.data);
      setStats(statsRes.data.data);
      setLastRefreshed(new Date());
      setSecondsAgo(0);
    } catch (e) { console.error('Feed error:', e); }
    setLoading(false);
  }, [cves]);

  useEffect(() => { fetchFeed(false); }, []);

  // Auto-refresh every 30 seconds
  useInterval(() => fetchFeed(true), 30000);

  // Tick "seconds ago" counter
  useInterval(() => setSecondsAgo(s => s + 1), 1000);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Live CVE Feed
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">
              Refreshes in {30 - (secondsAgo % 30)}s
            </span>
            <button
              onClick={() => fetchFeed(true)}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
            >
              ↻ Refresh Now
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard label="Total CVEs" value={stats.totalCVEs || 0} color="border-cyan-500/20" icon="📊" />
            <StatCard label="Critical" value={stats.bySeverity?.critical || 0} color="border-red-500/20" icon="🔴" />
            <StatCard label="High" value={stats.bySeverity?.high || 0} color="border-orange-500/20" icon="🟠" />
            <StatCard label="Medium" value={stats.bySeverity?.medium || 0} color="border-yellow-500/20" icon="🟡" />
          </div>
        )}

        {/* Last updated banner */}
        {lastRefreshed && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-2 mb-4 flex items-center justify-between text-xs text-slate-400">
            <span>📡 Auto-refreshing every 30 seconds</span>
            <span>Last updated: {lastRefreshed.toLocaleTimeString()} ({secondsAgo}s ago)</span>
          </div>
        )}

        {/* CVE Cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {cves.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-lg mb-2">No CVEs in the feed yet</p>
                <p className="text-sm">Sync from NVD using the admin panel to populate the feed</p>
              </div>
            ) : (
              cves.map(cve => (
                <LiveCard key={cve.cve_id} cve={cve} isNew={newCveIds.has(cve.cve_id)} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
