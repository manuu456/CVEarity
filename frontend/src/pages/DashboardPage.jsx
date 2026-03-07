import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCVEs, getStatistics } from '../services/api';
import { GlassmorphCard, SeverityBadge, LoadingSkeleton, ErrorAlert } from '../components/common';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [cves, setCVEs] = useState([]);
  const [filteredCVEs, setFilteredCVEs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    severity: '',
    software: '',
    year: '',
    search: ''
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cveData, statsData] = await Promise.all([
          getCVEs(),
          getStatistics()
        ]);
        setCVEs(cveData.data || []);
        setFilteredCVEs(cveData.data || []);
        setStats(statsData.data || null);
        setError(null);
      } catch (err) {
        setError('Failed to fetch vulnerability data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...cves];

    if (filters.severity) {
      result = result.filter(c => c.severity === filters.severity);
    }
    if (filters.software) {
      result = result.filter(c =>
        c.affectedSoftware.some(s => s.toLowerCase().includes(filters.software.toLowerCase()))
      );
    }
    if (filters.year) {
      result = result.filter(c => c.publishedDate.startsWith(filters.year));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c =>
        c.cveId.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCVEs(result);
  }, [filters, cves]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ severity: '', software: '', year: '', search: '' });
  };

  // Prepare chart data
  const severityData = stats ? [
    { name: 'Critical', value: stats.bySeverity.critical, color: COLORS.critical },
    { name: 'High', value: stats.bySeverity.high, color: COLORS.high },
    { name: 'Medium', value: stats.bySeverity.medium, color: COLORS.medium },
    { name: 'Low', value: stats.bySeverity.low, color: COLORS.low }
  ].filter(d => d.value > 0) : [];

  const yearData = stats ? Object.entries(stats.byYear)
    .sort()
    .map(([year, count]) => ({ year, count }))
    .slice(-5) : [];

  return (
    <main className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 text-glow">CVE Dashboard</h1>
          <p className="text-xl text-gray-300">Monitor and analyze vulnerability intelligence in real-time</p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="text-gray-400 text-sm mb-3 font-medium">Total CVEs</div>
              <div className="text-4xl font-bold text-cyan-400">{stats.totalCVEs}</div>
            </GlassmorphCard>
            <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="text-gray-400 text-sm mb-3 font-medium">Critical</div>
              <div className="text-4xl font-bold text-red-400">{stats.bySeverity.critical}</div>
            </GlassmorphCard>
            <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="text-gray-400 text-sm mb-3 font-medium">High Risk</div>
              <div className="text-4xl font-bold text-orange-400">{stats.bySeverity.high}</div>
            </GlassmorphCard>
            <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="text-gray-400 text-sm mb-3 font-medium">Medium</div>
              <div className="text-4xl font-bold text-yellow-400">{stats.bySeverity.medium}</div>
            </GlassmorphCard>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pie Chart */}
          <GlassmorphCard className="p-6">
            <h3 className="text-white font-bold text-xl mb-6 text-glow">Severity Distribution</h3>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
            )}
          </GlassmorphCard>

          {/* Bar Chart */}
          <GlassmorphCard className="p-6">
            <h3 className="text-white font-bold text-xl mb-6 text-glow">CVEs by Year</h3>
            {yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
            )}
          </GlassmorphCard>
        </div>

        {/* Recent Alerts */}
        {stats && stats.recentAlerts && stats.recentAlerts.length > 0 && (
          <GlassmorphCard className="mb-12 p-6">
            <h3 className="text-white font-bold text-xl mb-6 text-glow">Recent Critical Alerts</h3>
            <div className="space-y-4">
              {stats.recentAlerts.slice(0, 3).map((cve, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-cyan-500/10 hover:bg-slate-700/50 transition-colors duration-300">
                  <div className="flex-1">
                    <p className="text-cyan-400 font-mono text-sm font-bold mb-1">{cve.cveId}</p>
                    <p className="text-gray-300 text-base">{cve.title}</p>
                  </div>
                  <SeverityBadge severity={cve.severity} />
                </div>
              ))}
            </div>
          </GlassmorphCard>
        )}

        {/* Filters */}
        <GlassmorphCard className="mb-12 p-6">
          <h3 className="text-white font-bold text-xl mb-6 text-glow">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-3">Search CVE</label>
              <input
                type="text"
                placeholder="CVE ID or keyword..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-3">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-3">Software</label>
              <input
                type="text"
                placeholder="e.g., Linux, OpenSSL..."
                value={filters.software}
                onChange={(e) => handleFilterChange('software', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-3">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
              >
                <option value="">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="px-6 py-3 text-cyan-400 font-medium hover:bg-cyan-500/10 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Clear Filters
          </button>
        </GlassmorphCard>

        {/* CVE Table */}
        <GlassmorphCard className="p-6">
          <h3 className="text-white font-bold text-xl mb-6 text-glow">
            Vulnerabilities ({filteredCVEs.length} results)
          </h3>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/20">
                    <th className="text-left py-3 px-4 text-cyan-400 font-semibold">CVE ID</th>
                    <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Title</th>
                    <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Severity</th>
                    <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Score</th>
                    <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Affected Software</th>
                    <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Published</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCVEs.map((cve, i) => (
                    <tr key={i} className="border-b border-cyan-500/10 hover:bg-slate-700/20 transition">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/cve/${cve.cveId}`)}
                          className="text-cyan-400 font-mono font-bold hover:text-cyan-300 cursor-pointer transition-colors"
                        >
                          {cve.cveId}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-300 max-w-xs truncate">{cve.title}</td>
                      <td className="py-3 px-4">
                        <SeverityBadge severity={cve.severity} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-semibold">{cve.severityScore?.toFixed(1) || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {cve.affectedSoftware?.slice(0, 2).join(', ') || 'N/A'}
                        {cve.affectedSoftware?.length > 2 && '...'}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{cve.publishedDate || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCVEs.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No vulnerabilities found matching your filters.
                </div>
              )}
            </div>
          )}
        </GlassmorphCard>
      </div>
    </main>
  );
};
