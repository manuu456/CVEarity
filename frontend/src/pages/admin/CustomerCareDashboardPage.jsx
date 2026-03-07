import React, { useState, useEffect } from 'react';
import { getCVEs } from '../../services/api';
import { GlassmorphCard, SeverityBadge, LoadingSkeleton, ErrorAlert } from '../../components/common';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
};

export const CustomerCareDashboardPage = () => {
  const [cves, setCVEs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: 0
  });
  const [selectedCVE, setSelectedCVE] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCVEData();
  }, []);

  const fetchCVEData = async () => {
    try {
      setLoading(true);
      const response = await getCVEs();
      const cveData = response.data || [];
      setCVEs(cveData);

      // Calculate statistics
      const statsCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: cveData.length
      };

      cveData.forEach(cve => {
        if (cve.severity in statsCounts) {
          statsCounts[cve.severity]++;
        }
      });

      setStats(statsCounts);
      setError('');
    } catch (err) {
      setError('Failed to load vulnerability data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCVEs = cves.filter(cve =>
    cve.cveId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cve.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cve.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const severityData = [
    { name: 'Critical', value: stats.critical, color: COLORS.critical },
    { name: 'High', value: stats.high, color: COLORS.high },
    { name: 'Medium', value: stats.medium, color: COLORS.medium },
    { name: 'Low', value: stats.low, color: COLORS.low }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <LoadingSkeleton className="h-12 w-80" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">Customer Care Dashboard</h1>
          <p className="text-gray-400">Monitor vulnerabilities and provide customer support</p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-gray-400 text-sm mb-2">Total CVEs</div>
            <div className="text-3xl font-bold text-cyan-400">{stats.total}</div>
          </GlassmorphCard>
          <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-gray-400 text-sm mb-2">Critical</div>
            <div className="text-3xl font-bold text-red-400">{stats.critical}</div>
          </GlassmorphCard>
          <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-gray-400 text-sm mb-2">High</div>
            <div className="text-3xl font-bold text-orange-400">{stats.high}</div>
          </GlassmorphCard>
          <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-gray-400 text-sm mb-2">Medium</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.medium}</div>
          </GlassmorphCard>
          <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-gray-400 text-sm mb-2">Low</div>
            <div className="text-3xl font-bold text-green-400">{stats.low}</div>
          </GlassmorphCard>
        </div>

        {/* Charts */}
        {severityData.length > 0 && (
          <GlassmorphCard className="p-6">
            <h3 className="text-white font-bold text-xl mb-6">Severity Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#06b6d4', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </GlassmorphCard>
        )}

        {/* Search and Filter */}
        <GlassmorphCard className="p-6">
          <input
            type="text"
            placeholder="Search vulnerabilities by CVE ID, title, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
          />
        </GlassmorphCard>

        {/* CVE List */}
        <GlassmorphCard className="p-6">
          <h3 className="text-white font-bold text-xl mb-6">Critical Vulnerabilities to Address</h3>
          <div className="space-y-4">
            {filteredCVEs.length > 0 ? (
              filteredCVEs.map((cve, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCVE(selectedCVE?.id === cve.id ? null : cve)}
                  className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-cyan-400 font-mono font-bold text-sm">{cve.cveId}</span>
                        <SeverityBadge severity={cve.severity} />
                      </div>
                      <p className="text-white font-medium">{cve.title}</p>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{cve.description}</p>
                    </div>
                    <span className="text-gray-500 text-sm whitespace-nowrap ml-4">
                      {new Date(cve.publishedDate).toLocaleDateString()}
                    </span>
                  </div>

                  {selectedCVE?.id === cve.id && (
                    <div className="mt-4 pt-4 border-t border-cyan-500/20 space-y-2 text-sm text-gray-300">
                      <p><strong>Score:</strong> {cve.severityScore?.toFixed(1) || 'N/A'}</p>
                      {cve.affectedSoftware && cve.affectedSoftware.length > 0 && (
                        <p><strong>Affected:</strong> {cve.affectedSoftware.join(', ')}</p>
                      )}
                      {cve.references && cve.references.length > 0 && (
                        <p>
                          <strong>References:</strong> {' '}
                          {cve.references.map((ref, i) => (
                            <a key={i} href={ref} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 break-all">
                              {ref}
                              {i < cve.references.length - 1 && ', '}
                            </a>
                          ))}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No vulnerabilities found matching your search
              </div>
            )}
          </div>
        </GlassmorphCard>

        {/* Customer Support Notes */}
        <GlassmorphCard className="p-6">
          <h3 className="text-white font-bold text-xl mb-4">Quick Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 font-semibold mb-2">🔴 Critical Vulnerabilities</p>
              <p className="text-gray-300">Require immediate attention and mitigation</p>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-orange-400 font-semibold mb-2">🟠 High Severity</p>
              <p className="text-gray-300">Should be patched within days</p>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 font-semibold mb-2">🟡 Medium & Low</p>
              <p className="text-gray-300">Plan patches within regular updates</p>
            </div>
          </div>
        </GlassmorphCard>
      </div>
    </div>
  );
};
