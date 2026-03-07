import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const useCountUp = (target, duration = 1000) => {
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
  }, [target]);
  return count;
};

const AnimatedStat = ({ value, label, color, trend }) => {
  const animated = useCountUp(value);
  return (
    <div className={`bg-slate-800/40 backdrop-blur-lg border rounded-xl p-6 hover:scale-105 transition-all duration-300 ${color}`}>
      <div className="text-gray-400 text-sm mb-3 font-medium flex items-center justify-between">
        {label}
        {trend !== undefined && (
          <span className={`text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-slate-400'}`}>
            {trend > 0 ? `+${trend} today` : 'No change'}
          </span>
        )}
      </div>
      <div className={`text-4xl font-bold tabular-nums ${color.includes('red') ? 'text-red-400' : color.includes('orange') ? 'text-orange-400' : color.includes('yellow') ? 'text-yellow-400' : 'text-cyan-400'}`}>
        {animated.toLocaleString()}
      </div>
    </div>
  );
};

const TimeAgo = ({ date }) => {
  const [str, setStr] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      if (diff < 60) setStr(`${diff}s ago`);
      else if (diff < 3600) setStr(`${Math.floor(diff / 60)}m ago`);
      else setStr(`${Math.floor(diff / 3600)}h ago`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date]);
  return <span>{str}</span>;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [cves, setCVEs] = useState([]);
  const [filteredCVEs, setFilteredCVEs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({ severity: '', software: '', year: '', search: '' });

  const COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      const [cveData, statsData] = await Promise.all([
        api.get('/cves'),
        api.get('/cves/statistics')
      ]);
      const cvesArr = cveData.data?.cves || cveData.data?.data || [];
      setCVEs(cvesArr);
      setFilteredCVEs(cvesArr);
      setStats(statsData.data?.data || statsData.data || null);
      setLastUpdated(new Date());
      setRefreshCountdown(30);
      setError(null);
    } catch (err) {
      setError('Failed to fetch vulnerability data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(false); }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const refreshId = setInterval(() => fetchData(true), 30000);
    const countdownId = setInterval(() => setRefreshCountdown(c => c <= 1 ? 30 : c - 1), 1000);
    return () => { clearInterval(refreshId); clearInterval(countdownId); };
  }, [fetchData]);

  // Apply filters
  useEffect(() => {
    let result = [...cves];
    if (filters.severity) result = result.filter(c => c.severity === filters.severity);
    if (filters.software) result = result.filter(c =>
      (c.affectedSoftware || c.affected_software || []).some(s =>
        (typeof s === 'string' ? s : JSON.stringify(s)).toLowerCase().includes(filters.software.toLowerCase())
      )
    );
    if (filters.year) result = result.filter(c => (c.publishedDate || c.published_date || '').startsWith(filters.year));
    if (filters.search) {
      const sl = filters.search.toLowerCase();
      result = result.filter(c =>
        (c.cveId || c.cve_id || '').toLowerCase().includes(sl) ||
        (c.title || '').toLowerCase().includes(sl) ||
        (c.description || '').toLowerCase().includes(sl)
      );
    }
    setFilteredCVEs(result);
  }, [filters, cves]);

  const severityData = stats ? [
    { name: 'Critical', value: stats.bySeverity?.critical || 0, color: COLORS.critical },
    { name: 'High', value: stats.bySeverity?.high || 0, color: COLORS.high },
    { name: 'Medium', value: stats.bySeverity?.medium || 0, color: COLORS.medium },
    { name: 'Low', value: stats.bySeverity?.low || 0, color: COLORS.low }
  ].filter(d => d.value > 0) : [];

  const yearData = stats ? Object.entries(stats.byYear || {}).sort().map(([year, count]) => ({ year, count })).slice(-6) : [];

  const exportCSV = async () => {
    try {
      const url = `${api.defaults.baseURL}/reports/csv`;
      const token = localStorage.getItem('token');
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await response.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cvearity-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch (e) { console.error('CSV export failed', e); }
  };

  return (
    <main className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header with live indicator */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-bold text-white">CVE Dashboard</h1>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-spin' : 'bg-green-400 animate-pulse'}`}></div>
                <span className="text-green-400 text-xs font-bold uppercase tracking-wider">
                  {isRefreshing ? 'Syncing...' : 'Live'}
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {lastUpdated ? <>Updated <TimeAgo date={lastUpdated} /> · Next refresh in {refreshCountdown}s</> : 'Loading...'}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => fetchData(true)} className="px-4 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm flex items-center gap-2">
              <span className={isRefreshing ? 'animate-spin' : ''}>↻</span> Refresh
            </button>
            <button onClick={exportCSV} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition text-sm">
              ⬇ Export CSV
            </button>
            <button onClick={() => navigate('/live')} className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div> Live Feed
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 text-red-300 text-sm mb-6">{error}</div>
        )}

        {/* Animated Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <AnimatedStat label="Total CVEs" value={stats.totalCVEs || 0} color="border-cyan-500/20" />
            <AnimatedStat label="Critical" value={stats.bySeverity?.critical || 0} color="border-red-500/20" />
            <AnimatedStat label="High Risk" value={stats.bySeverity?.high || 0} color="border-orange-500/20" />
            <AnimatedStat label="Medium" value={stats.bySeverity?.medium || 0} color="border-yellow-500/20" />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-800/40 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-white font-bold text-xl mb-6">Severity Distribution</h3>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} dataKey="value">
                    {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-72 flex items-center justify-center text-gray-400">No data available</div>}
          </div>

          <div className="bg-slate-800/40 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-white font-bold text-xl mb-6">CVEs by Year</h3>
            {yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-72 flex items-center justify-center text-gray-400">No data available</div>}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6 mb-12">
          <h3 className="text-white font-bold text-xl mb-6">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {[
              { key: 'search', placeholder: 'CVE ID or keyword...', type: 'input', label: 'Search CVE' },
              { key: 'severity', type: 'select', label: 'Severity', options: ['critical', 'high', 'medium', 'low'] },
              { key: 'software', placeholder: 'e.g. Linux, Apache...', type: 'input', label: 'Software' },
              { key: 'year', type: 'select', label: 'Year', options: ['2026', '2025', '2024', '2023'] }
            ].map(({ key, placeholder, type, label, options }) => (
              <div key={key}>
                <label className="text-gray-400 text-sm font-medium block mb-2">{label}</label>
                {type === 'input' ? (
                  <input type="text" placeholder={placeholder} value={filters[key]}
                    onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition" />
                ) : (
                  <select value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 transition">
                    <option value="">All</option>
                    {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setFilters({ severity: '', software: '', year: '', search: '' })}
            className="px-6 py-2 text-cyan-400 font-medium hover:bg-cyan-500/10 rounded-lg transition text-sm">
            Clear Filters
          </button>
        </div>

        {/* CVE Table */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-xl">
              Vulnerabilities <span className="text-cyan-400">({filteredCVEs.length})</span>
            </h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/20">
                    {['CVE ID', 'Title', 'Severity', 'Score', 'Affected Software', 'Published'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-cyan-400 font-semibold text-sm">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCVEs.map((cve, i) => {
                    const id = cve.cveId || cve.cve_id;
                    const sev = cve.severity || 'unknown';
                    const score = cve.severityScore || cve.severity_score;
                    const date = cve.publishedDate || cve.published_date;
                    const software = cve.affectedSoftware || (cve.affected_software ? JSON.parse(cve.affected_software || '[]') : []);
                    const sevColors = { critical: 'bg-red-500/20 text-red-400', high: 'bg-orange-500/20 text-orange-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-green-500/20 text-green-400' };
                    return (
                      <tr key={i} className="border-b border-cyan-500/10 hover:bg-slate-700/20 transition cursor-pointer group" onClick={() => navigate(`/cve/${id}`)}>
                        <td className="py-3 px-4 text-cyan-400 font-mono font-bold text-sm group-hover:text-cyan-300 transition">{id}</td>
                        <td className="py-3 px-4 text-gray-300 max-w-xs truncate text-sm">{cve.title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${sevColors[sev] || 'bg-slate-500/20 text-slate-400'}`}>{sev}</span>
                        </td>
                        <td className="py-3 px-4 text-white font-semibold text-sm">{score ? parseFloat(score).toFixed(1) : 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {(Array.isArray(software) ? software : []).slice(0, 2).join(', ') || 'N/A'}
                          {(Array.isArray(software) ? software : []).length > 2 && '...'}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{date || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCVEs.length === 0 && (
                <div className="text-center py-12 text-gray-400">No vulnerabilities found matching your filters.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
