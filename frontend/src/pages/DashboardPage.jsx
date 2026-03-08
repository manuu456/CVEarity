import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { SeverityBadge } from '../components/common';

// ─── Small reusable helpers ───────────────────────────────────────────────────

const StatCard = ({ label, value, sub, colorClass = 'text-main', accent, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-card border border-subtle rounded-xl p-5 text-left hover:border-white/20 transition-all w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    style={accent ? { borderLeft: `3px solid ${accent}` } : {}}
  >
    <div className="text-muted text-[10px] font-black uppercase tracking-widest mb-3">{label}</div>
    <div className={`text-3xl font-black tabular-nums tracking-tight ${colorClass}`}>{value ?? '—'}</div>
    {sub && <div className="text-muted text-[10px] font-bold mt-2 uppercase tracking-wider">{sub}</div>}
  </button>
);

const QuickAction = ({ icon, label, to, accent = '#E53E3E' }) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-2 p-4 bg-card border border-subtle rounded-xl hover:border-white/20 transition-all group"
  >
    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
      style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
      {icon}
    </div>
    <span className="text-[10px] font-black text-muted uppercase tracking-widest group-hover:text-main transition-colors text-center leading-tight">{label}</span>
  </Link>
);

const RiskGauge = ({ score }) => {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? '#EF4444' : pct >= 40 ? '#F97316' : '#22C55E';
  const label = pct >= 70 ? 'HIGH RISK' : pct >= 40 ? 'MODERATE' : 'LOW RISK';
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f1f1f" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-main">{pct}</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color }}>{label}</div>
        <div className="text-main font-black text-lg">Personal Risk Score</div>
        <div className="text-muted text-xs font-medium">Based on your assets &amp; watchlist</div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [globalStats, setGlobalStats] = useState(null);
  const [watchlistAlerts, setWatchlistAlerts] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [assetMatches, setAssetMatches] = useState([]);
  const [recentCVEs, setRecentCVEs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, cvesRes, watchRes, alertsRes, assetsRes] = await Promise.allSettled([
        api.get('/cves/statistics'),
        api.get('/cves'),
        api.get('/watchlist'),
        api.get('/watchlist/alerts'),
        api.get('/assets/matches'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setGlobalStats(statsRes.value.data?.data || statsRes.value.data || null);
      }
      if (cvesRes.status === 'fulfilled') {
        const arr = cvesRes.value.data?.cves || cvesRes.value.data?.data || [];
        setRecentCVEs(arr);
      }
      if (watchRes.status === 'fulfilled') {
        setWatchlist(watchRes.value.data?.data || []);
      }
      if (alertsRes.status === 'fulfilled') {
        setWatchlistAlerts(alertsRes.value.data?.data?.alerts || []);
      }
      if (assetsRes.status === 'fulfilled') {
        setAssetMatches(assetsRes.value.data?.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Personal risk score: weighted by critical/high asset matches + unread alerts
  const criticalMatches = assetMatches.filter(m => m.severity === 'critical').length;
  const highMatches = assetMatches.filter(m => m.severity === 'high').length;
  const unreadAlerts = watchlistAlerts.filter(a => !a.is_read).length;
  const rawRisk = Math.min(100, criticalMatches * 20 + highMatches * 8 + unreadAlerts * 5);

  // Filtered CVE table
  const filteredCVEs = recentCVEs.filter(c => {
    const sl = search.toLowerCase();
    const matchSearch = !sl ||
      (c.cveId || c.cve_id || '').toLowerCase().includes(sl) ||
      (c.title || '').toLowerCase().includes(sl);
    const matchSev = !severityFilter || c.severity === severityFilter;
    return matchSearch && matchSev;
  });

  const firstName = user?.first_name || user?.username || 'there';

  // Top 5 at-risk assets (sorted by criticality)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const topAssets = [...assetMatches]
    .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
    .slice(0, 5);

  const newAlerts = watchlistAlerts.filter(a => !a.is_read).slice(0, 5);

  if (loading) {
    return (
      <main className="bg-page min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-card border border-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="bg-page min-h-screen py-10 transition-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── Welcome banner ─────────────────────────────────────────── */}
        <div className="bg-card border border-subtle rounded-2xl p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          style={{ borderLeft: '3px solid #E53E3E' }}>
          <div>
            <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-2">Welcome back</p>
            <h1 className="text-3xl font-black text-main tracking-tight">Hey, {firstName} 👋</h1>
            <p className="text-muted text-sm font-medium mt-1">
              {unreadAlerts > 0
                ? `You have ${unreadAlerts} unread watchlist alert${unreadAlerts > 1 ? 's' : ''} — review them below.`
                : 'Your threat landscape looks calm. Keep monitoring.'}
            </p>
          </div>
          <RiskGauge score={rawRisk} />
        </div>

        {/* ── Personal stats row ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Watchlist Items"
            value={watchlist.length}
            sub="Tracked software"
            accent="#3b82f6"
            onClick={() => navigate('/watchlist')}
          />
          <StatCard
            label="Unread Alerts"
            value={unreadAlerts}
            sub="New CVE matches"
            colorClass={unreadAlerts > 0 ? 'text-red-500' : 'text-main'}
            accent="#EF4444"
            onClick={() => navigate('/watchlist')}
          />
          <StatCard
            label="Asset CVE Hits"
            value={assetMatches.length}
            sub="Matching vulnerabilities"
            colorClass={assetMatches.length > 0 ? 'text-orange-500' : 'text-main'}
            accent="#F97316"
            onClick={() => navigate('/assets')}
          />
          <StatCard
            label="Total CVEs Tracked"
            value={globalStats?.totalCVEs?.toLocaleString()}
            sub="In global database"
            accent="#22c55e"
          />
        </div>

        {/* ── Quick actions ──────────────────────────────────────────── */}
        <div className="bg-card border border-subtle rounded-xl p-6">
          <h2 className="text-main font-black text-[10px] uppercase tracking-widest mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction icon="🛡️" label="Add Asset" to="/assets" accent="#3b82f6" />
            <QuickAction icon="👁️" label="Manage Watchlist" to="/watchlist" accent="#a855f7" />
            <QuickAction icon="📊" label="Risk Dashboard" to="/risk" accent="#E53E3E" />
            <QuickAction icon="⚖️" label="Compare CVEs" to="/compare" accent="#f97316" />
          </div>
        </div>

        {/* ── Two-column: alerts + top assets ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Watchlist alerts */}
          <div className="bg-card border border-subtle rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
              <h3 className="text-main font-black text-[10px] uppercase tracking-widest">
                Watchlist Alerts
                {unreadAlerts > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[9px]">
                    {unreadAlerts} new
                  </span>
                )}
              </h3>
              <Link to="/watchlist" className="text-[10px] font-black text-red-400 uppercase hover:text-red-300 transition">View All →</Link>
            </div>
            <div className="divide-y divide-subtle">
              {newAlerts.length > 0 ? newAlerts.map((alert, i) => (
                <div key={i} className="px-6 py-3 flex items-start gap-3 hover:bg-page/50 transition cursor-pointer"
                  onClick={() => navigate(`/cve/${alert.cve_id}`)}>
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                  <div className="min-w-0">
                    <div className="text-main font-bold text-sm leading-snug line-clamp-1">{alert.cve_id}</div>
                    <div className="text-muted text-[10px] font-bold uppercase tracking-wider mt-0.5">
                      Matched: {alert.software_name}
                    </div>
                  </div>
                  <SeverityBadge severity={alert.severity || 'medium'} />
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-muted text-[10px] font-black uppercase tracking-widest">
                  {watchlist.length === 0
                    ? 'No watchlist items yet — add software to monitor'
                    : 'No new alerts — all clear'}
                </div>
              )}
              {watchlist.length === 0 && (
                <div className="px-6 py-4 border-t border-subtle">
                  <Link to="/watchlist"
                    className="block w-full text-center py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition">
                    + Add to Watchlist
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Top at-risk assets */}
          <div className="bg-card border border-subtle rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
              <h3 className="text-main font-black text-[10px] uppercase tracking-widest">Top At-Risk Assets</h3>
              <Link to="/assets" className="text-[10px] font-black text-red-400 uppercase hover:text-red-300 transition">Manage →</Link>
            </div>
            <div className="divide-y divide-subtle">
              {topAssets.length > 0 ? topAssets.map((asset, i) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-page/50 transition cursor-pointer"
                  onClick={() => navigate(`/cve/${asset.cve_id}`)}>
                  <div className="min-w-0">
                    <div className="text-main font-bold text-sm leading-none mb-1 line-clamp-1">
                      {asset.asset_name || asset.software_name || asset.cve_id}
                    </div>
                    <div className="text-muted text-[10px] font-bold uppercase tracking-wider">{asset.cve_id}</div>
                  </div>
                  <SeverityBadge severity={asset.severity || 'medium'} />
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-muted text-[10px] font-black uppercase tracking-widest">
                  {assetMatches.length === 0
                    ? 'No asset CVE matches found'
                    : 'All assets are clear'}
                </div>
              )}
              {assetMatches.length === 0 && (
                <div className="px-6 py-4 border-t border-subtle">
                  <Link to="/assets"
                    className="block w-full text-center py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition">
                    + Add Asset
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CVE explorer (full table) ──────────────────────────────── */}
        <div className="bg-card border border-subtle rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-subtle flex flex-col sm:flex-row sm:items-center gap-4">
            <h3 className="text-main font-black text-[10px] uppercase tracking-widest flex-1">
              CVE Explorer <span className="ml-2 text-muted font-bold text-[9px]">({filteredCVEs.length} results)</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search CVE ID or title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-3 py-1.5 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:ring-1 focus:ring-main transition font-medium placeholder:opacity-40 w-52"
              />
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="px-3 py-1.5 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none transition font-bold uppercase"
              >
                <option value="">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {(search || severityFilter) && (
                <button
                  onClick={() => { setSearch(''); setSeverityFilter(''); }}
                  className="text-[10px] font-black text-red-500 uppercase hover:text-red-400 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-page/50">
                <tr>
                  {['CVE ID', 'Title', 'Severity', 'Score', 'Published'].map(h => (
                    <th key={h} className="py-3 px-6 text-muted font-black text-[10px] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredCVEs.length > 0 ? filteredCVEs.map((cve, i) => {
                  const id = cve.cveId || cve.cve_id;
                  const score = cve.severityScore || cve.severity_score;
                  return (
                    <tr key={i} className="hover:bg-page/60 transition cursor-pointer group"
                      onClick={() => navigate(`/cve/${id}`)}>
                      <td className="py-3 px-6 text-main font-black text-sm tracking-tighter">{id}</td>
                      <td className="py-3 px-6">
                        <div className="text-main font-bold text-sm line-clamp-1 group-hover:text-red-400 transition">{cve.title}</div>
                        <div className="text-[10px] text-muted mt-0.5 uppercase font-bold tracking-widest">
                          {(cve.affectedSoftware || []).slice(0, 1).join(', ') || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-6"><SeverityBadge severity={cve.severity || 'unknown'} /></td>
                      <td className="py-3 px-6 text-main font-black text-sm tabular-nums">{score ? parseFloat(score).toFixed(1) : '—'}</td>
                      <td className="py-3 px-6 text-muted text-[10px] font-black uppercase tracking-widest">{cve.publishedDate || cve.published_date || 'N/A'}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-muted font-bold uppercase text-[10px] tracking-[0.2em]">
                      No CVEs match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
};
