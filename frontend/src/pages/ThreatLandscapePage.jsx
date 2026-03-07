import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

export const ThreatLandscapePage = () => {
  const [stats, setStats] = useState(null);
  const [cves, setCves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, cvesRes] = await Promise.all([
        api.get('/cves/statistics'),
        api.get('/cves')
      ]);
      setStats(statsRes.data.data || null);
      setCves(cvesRes.data.cves || []);
    } catch (e) { console.error('Error:', e); }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>;

  // Compute chart data
  const severityData = stats ? [
    { name: 'Critical', count: stats.bySeverity?.critical || 0, color: '#ef4444' },
    { name: 'High', count: stats.bySeverity?.high || 0, color: '#f97316' },
    { name: 'Medium', count: stats.bySeverity?.medium || 0, color: '#eab308' },
    { name: 'Low', count: stats.bySeverity?.low || 0, color: '#22c55e' }
  ] : [];

  const yearData = stats?.byYear ? Object.entries(stats.byYear).map(([year, count]) => ({ year, count })) : [];

  // Top affected software
  const softwareCount = {};
  cves.forEach(cve => {
    (cve.affectedSoftware || []).forEach(sw => {
      const name = sw.split(' ')[0];
      softwareCount[name] = (softwareCount[name] || 0) + 1;
    });
  });
  const topSoftware = Object.entries(softwareCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Monthly trends
  const monthlyData = {};
  cves.forEach(cve => {
    const month = cve.publishedDate?.substring(0, 7);
    if (month) monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  const trendData = Object.entries(monthlyData).sort().map(([month, count]) => ({ month, count }));

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Threat Landscape
        </h1>
        <p className="text-slate-400 mb-8">Global vulnerability intelligence and trends</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{stats?.totalCVEs || 0}</p><p className="text-slate-400 text-sm">Total CVEs</p>
          </div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{stats?.bySeverity?.critical || 0}</p><p className="text-slate-400 text-sm">Critical</p>
          </div>
          <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{stats?.bySeverity?.high || 0}</p><p className="text-slate-400 text-sm">High</p>
          </div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats?.bySeverity?.medium || 0}</p><p className="text-slate-400 text-sm">Medium</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Severity Distribution */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Severity Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={severityData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }) => `${name}: ${count}`}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* CVE Trends */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">CVE Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Affected Software */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Most Affected Software</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSoftware} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CVEs by Year */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">CVEs by Year</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Critical Alerts */}
        {stats?.recentAlerts?.length > 0 && (
          <div className="mt-8 bg-red-500/5 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-red-400 font-semibold mb-4">🚨 Recent Critical Vulnerabilities</h3>
            <div className="space-y-2">
              {stats.recentAlerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-red-400 font-mono">{a.cveId}</span>
                  <span className="text-slate-300">{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
