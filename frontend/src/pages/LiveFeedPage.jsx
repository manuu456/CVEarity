import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SecurityNewsFeed } from '../components/SecurityNewsFeed';

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
  critical: { card: 'border-l-red-500', badge: 'bg-red-500/10 text-red-500 border-red-500/20', bar: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' },
  high:     { card: 'border-l-orange-500', badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20', bar: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' },
  medium:   { card: 'border-l-yellow', badge: 'bg-yellow/10 text-yellow border-yellow/20', bar: 'bg-yellow shadow-[0_0_8px_rgba(234,179,8,0.4)]' },
  low:      { card: 'border-l-green-500', badge: 'bg-green-500/10 text-green-500 border-green-500/20', bar: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' },
  unknown:  { card: 'border-l-muted', badge: 'bg-muted/10 text-muted border-subtle', bar: 'bg-muted' }
};

const LiveCard = ({ cve, isNew }) => {
  const navigate = useNavigate();
  const colors = severityColors[cve.severity] || severityColors.unknown;
  const score = parseFloat(cve.severity_score) || 0;

  return (
    <div
      onClick={() => navigate(`/cve/${cve.cve_id}`)}
      className={`bg-card border border-subtle border-l-4 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-md group flex items-center justify-between transition-theme
        ${colors.card} ${isNew ? 'ring-2 ring-yellow ring-opacity-50' : ''}`}
    >
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-3 mb-2">
           <span className="text-main font-black text-xs uppercase tracking-widest">{cve.cve_id}</span>
           <span className={`text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-widest ${colors.badge}`}>{cve.severity}</span>
           {isNew && <span className="text-[9px] bg-yellow text-black px-2 py-0.5 rounded font-black uppercase animate-pulse">New Intelligence</span>}
        </div>
        <p className="text-main text-sm font-bold truncate group-hover:text-opacity-80 transition">{cve.title || 'Vulnerability intelligence record'}</p>
        <div className="mt-4 flex items-center gap-6">
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Score:</span>
              <span className="text-xs font-black text-main">{score.toFixed(1)}</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Modified:</span>
              <span className="text-xs font-black text-main">
                 {cve.published_date ? new Date(cve.published_date).toLocaleDateString() : 'Pending'}
              </span>
           </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-24 h-1.5 bg-page rounded-full overflow-hidden transition-theme">
         <div className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`} style={{ width: `${(score / 10) * 100}%` }}></div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, colorClass, icon }) => {
  const animated = useCountUp(value);
  return (
    <div className={`bg-card border border-subtle rounded-xl p-6 shadow-sm transition-theme`}>
      <div className="text-muted text-[9px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
         {icon} {label}
      </div>
      <div className={`text-3xl font-black ${colorClass} tracking-tighter`}>
        {animated.toLocaleString()}
      </div>
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
        const newIds = freshCVEs.filter(c => !existingIds.has(c.cve_id)).map(c => c.cve_id);
        if (newIds.length > 0) {
           setNewCveIds(new Set(newIds));
           setTimeout(() => setNewCveIds(new Set()), 10000);
        }
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
  useInterval(() => fetchFeed(true), 30000);
  useInterval(() => setSecondsAgo(s => s + 1), 1000);

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6 transition-theme">
      <div className="max-w-7xl mx-auto">
        {/* Intelligence Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-subtle pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-4xl font-black text-main tracking-tight">Security Intelligence</h1>
               <div className="flex items-center gap-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  Real-time
               </div>
            </div>
            <p className="text-muted text-sm font-medium">Monitoring global vulnerability streams from primary reporting nodes.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
               <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Last Node Update</div>
               <div className="text-xs font-black text-main">{secondsAgo}s ago / auto-sync 30s</div>
            </div>
            <button
              onClick={() => fetchFeed(true)}
              className="tenable-btn-secondary px-6 py-3 text-[10px] tracking-[0.2em] uppercase"
            >
              Manual Synchronize
            </button>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left Infrastructure (CVE Feed) ── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Aggregate Metrics */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Global records" value={stats.totalCVEs || 0} colorClass="text-main" icon="📑" />
                <StatCard label="Critical" value={stats.bySeverity?.critical || 0} colorClass="text-red-500" icon="🔋" />
                <StatCard label="High Impact" value={stats.bySeverity?.high || 0} colorClass="text-orange-500" icon="⚠️" />
                <StatCard label="Evaluated" value={stats.bySeverity?.medium || 0} colorClass="text-yellow" icon="🔍" />
              </div>
            )}

            {/* Event Log Title */}
            <div className="flex items-center justify-between border-b border-subtle pb-4">
               <h3 className="text-main font-black text-[11px] uppercase tracking-[0.2em]">Primary Intelligence Stream</h3>
               <span className="text-[9px] font-black text-muted uppercase">Showing Latest 30 Events</span>
            </div>

            {/* Event Cards */}
            <div className="space-y-4">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-card border border-subtle rounded-xl animate-pulse shadow-sm"></div>
                ))
              ) : (
                cves.length === 0 ? (
                  <div className="text-center py-24 bg-card border border-subtle rounded-2xl shadow-sm transition-theme">
                    <div className="text-4xl mb-4">📡</div>
                    <p className="text-main font-black text-sm uppercase tracking-widest mb-2">No Active Stream detected</p>
                    <p className="text-muted text-xs font-medium">Initialize system synchronization via the admin console.</p>
                  </div>
                ) : (
                  cves.map(cve => (
                    <LiveCard key={cve.cve_id} cve={cve} isNew={newCveIds.has(cve.cve_id)} />
                  ))
                )
              )}
            </div>
          </div>

          {/* ── Right Intelligence (Security News & Exploits) ── */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-main rounded-2xl p-8 text-white shadow-lg overflow-hidden relative mb-8 transition-theme">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h4 className="text-yellow font-black text-[10px] uppercase tracking-[0.3em] mb-4">Feed Intelligence</h4>
                <p className="text-lg font-medium leading-tight text-white/80">
                   Integrating Hacker News real-time alerts and Offensive Security exploit databases for global threat landscape visibility.
                </p>
             </div>
            
            <div className="space-y-8">
               <SecurityNewsFeed
                 defaultTab="news"
                 maxItems={8}
                 compact={false}
                 autoRefresh={true}
               />
               <SecurityNewsFeed
                 defaultTab="exploits"
                 maxItems={8}
                 compact={false}
                 autoRefresh={true}
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
