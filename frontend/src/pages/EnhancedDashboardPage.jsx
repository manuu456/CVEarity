import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCVEs, getStatistics } from '../services/api';
import { GlassmorphCard, SeverityBadge, ErrorAlert } from '../components/common';

export const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [cves, setCVEs] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [trendingCVEs, setTrendingCVEs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cveData, statsData] = await Promise.all([
          getCVEs(),
          getStatistics()
        ]);
        
        const allCVEs = cveData.data || [];
        setCVEs(allCVEs);
        setStats(statsData.data || {});
        
        // Get critical alerts
        const critical = allCVEs.filter(c => c.severity === 'critical').slice(0, 3);
        setCriticalAlerts(critical);
        
        // Get trending (recent)
        const trending = allCVEs.slice(0, 5);
        setTrendingCVEs(trending);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    { label: 'View All CVEs', action: () => navigate('/dashboard'), icon: '📊', color: 'cyan' },
    { label: 'Admin Panel', action: () => navigate('/admin'), icon: '⚙️', color: 'blue' },
    { label: 'Activity Logs', action: () => navigate('/admin/activity'), icon: '📋', color: 'purple' },
    { label: 'Reports', action: () => navigate('/admin/reports'), icon: '📈', color: 'green' },
  ];

  return (
    <main className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 text-glow">Welcome to CVEarity</h1>
          <p className="text-xl text-gray-300">Your comprehensive vulnerability intelligence platform</p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm font-medium mb-2">Total CVEs</div>
                  <div className="text-4xl font-bold text-cyan-400">{stats.totalCVEs || 0}</div>
                </div>
                <div className="text-5xl opacity-20">📊</div>
              </div>
            </GlassmorphCard>
            <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm font-medium mb-2">Critical Risk</div>
                  <div className="text-4xl font-bold text-red-400">{stats.bySeverity?.critical || 0}</div>
                </div>
                <div className="text-5xl opacity-20">🚨</div>
              </div>
            </GlassmorphCard>
            <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm font-medium mb-2">High Severity</div>
                  <div className="text-4xl font-bold text-orange-400">{stats.bySeverity?.high || 0}</div>
                </div>
                <div className="text-5xl opacity-20">⚠️</div>
              </div>
            </GlassmorphCard>
            <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm font-medium mb-2">Medium+ Risk</div>
                  <div className="text-4xl font-bold text-yellow-400">{(stats.bySeverity?.medium || 0) + (stats.bySeverity?.low || 0)}</div>
                </div>
                <div className="text-5xl opacity-20">📌</div>
              </div>
            </GlassmorphCard>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300"
            >
              <GlassmorphCard className="absolute inset-0 group-hover:scale-105 transition-transform duration-300" />
              <div className="relative z-10 text-center space-y-3">
                <div className="text-5xl">{action.icon}</div>
                <span className="text-white font-semibold text-lg block group-hover:text-cyan-300 transition-colors">{action.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Critical Alerts */}
          <GlassmorphCard className="lg:col-span-2 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-glow">🚨 Critical Alerts</h2>
            {criticalAlerts.length > 0 ? (
              <div className="space-y-4">
                {criticalAlerts.map((cve, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/cve/${cve.cveId}`)}
                    className="p-4 bg-slate-700/30 border border-red-500/30 rounded-lg hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-red-400 font-mono font-bold mb-1">{cve.cveId}</p>
                        <p className="text-gray-300 text-sm">{cve.title.substring(0, 60)}...</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-white font-bold">{cve.severityScore?.toFixed(1)}</span>
                        <SeverityBadge severity={cve.severity} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No critical vulnerabilities detected</p>
            )}
          </GlassmorphCard>

          {/* Quick Stats Card */}
          <GlassmorphCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-glow">📈 Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-cyan-500/20">
                <span className="text-gray-300">Total Vulnerabilities</span>
                <span className="text-2xl font-bold text-cyan-400">{stats?.totalCVEs || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-cyan-500/20">
                <span className="text-gray-300">Critical Issues</span>
                <span className="text-2xl font-bold text-red-400">{stats?.bySeverity?.critical || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-cyan-500/20">
                <span className="text-gray-300">High Risk</span>
                <span className="text-2xl font-bold text-orange-400">{stats?.bySeverity?.high || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Updated</span>
                <span className="text-sm text-gray-400">Just now</span>
              </div>
            </div>
          </GlassmorphCard>
        </div>

        {/* Trending CVEs */}
        <GlassmorphCard className="mt-8 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-glow">🔥 Trending Vulnerabilities</h2>
          {trendingCVEs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {trendingCVEs.map((cve, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/cve/${cve.cveId}`)}
                  className="group p-4 bg-slate-700/20 border border-cyan-500/20 rounded-lg hover:bg-slate-700/40 hover:border-cyan-500/50 transition-all duration-300 text-left"
                >
                  <p className="text-cyan-400 font-mono font-bold text-sm mb-2 group-hover:text-cyan-300">{cve.cveId}</p>
                  <p className="text-gray-300 text-xs leading-tight mb-3 line-clamp-2">{cve.title}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{cve.severityScore?.toFixed(1)} CVSS</span>
                    <SeverityBadge severity={cve.severity} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Loading vulnerabilities...</p>
          )}
        </GlassmorphCard>

        {/* Features Highlight */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassmorphCard className="p-6">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-3">Advanced Search</h3>
            <p className="text-gray-400 mb-4">Filter CVEs by severity, software, year, and more</p>
            <button onClick={() => navigate('/dashboard')} className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">Explore →</button>
          </GlassmorphCard>
          <GlassmorphCard className="p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Analytics & Reports</h3>
            <p className="text-gray-400 mb-4">Export data in CSV, JSON, and Text formats</p>
            <button onClick={() => navigate('/admin/reports')} className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">View Reports →</button>
          </GlassmorphCard>
          <GlassmorphCard className="p-6">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-3">Team Management</h3>
            <p className="text-gray-400 mb-4">Role-based access control for teams</p>
            <button onClick={() => navigate('/admin/users')} className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">Manage Users →</button>
          </GlassmorphCard>
        </div>
      </div>
    </main>
  );
};

export default EnhancedDashboard;