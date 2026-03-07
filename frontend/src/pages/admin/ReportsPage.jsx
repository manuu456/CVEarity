import React, { useState, useEffect } from 'react';
import { getCVEs, getStatistics } from '../../services/api';
import { GlassmorphCard, LoadingSkeleton, ErrorAlert } from '../../components/common';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export const ReportsPage = () => {
  const [cves, setCVEs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [cveRes, statsRes] = await Promise.all([
        getCVEs(),
        getStatistics()
      ]);
      setCVEs(cveRes.data || []);
      setStats(statsRes.data || null);
      setError('');
    } catch (err) {
      setError('Failed to load report data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCVEReport = () => {
    const report = {
      title: 'CVE Vulnerability Report',
      generatedAt: new Date().toLocaleString(),
      totalCVEs: cves.length,
      bySeverity: stats?.bySeverity || {},
      cveDetails: cves.map(cve => ({
        id: cve.cveId,
        title: cve.title,
        severity: cve.severity,
        score: cve.severityScore,
        published: cve.publishedDate,
        affected: cve.affectedSoftware?.join('; ') || 'N/A'
      }))
    };
    
    return `${report.title}
Generated: ${report.generatedAt}

SUMMARY
-------
Total CVEs: ${report.totalCVEs}
Critical: ${report.bySeverity.critical || 0}
High: ${report.bySeverity.high || 0}
Medium: ${report.bySeverity.medium || 0}
Low: ${report.bySeverity.low || 0}

DETAILED VULNERABILITIES
------------------------
${report.cveDetails.map(cve => `
${cve.id} - ${cve.title}
Severity: ${cve.severity.toUpperCase()} (${cve.score})
Published: ${cve.published}
Affected Software: ${cve.affected}
`).join('\n')}`;
  };

  const exportAsCSV = () => {
    const headers = ['CVE ID', 'Title', 'Severity', 'CVSS Score', 'Published Date', 'Affected Software'];
    const rows = cves.map(cve => [
      cve.cveId,
      cve.title,
      cve.severity,
      cve.severityScore || 'N/A',
      cve.publishedDate,
      cve.affectedSoftware?.join('; ') || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cve-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportAsJSON = () => {
    const report = {
      title: 'CVE Vulnerability Report',
      generatedAt: new Date().toISOString(),
      totalCVEs: cves.length,
      statistics: stats,
      vulnerabilities: cves
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cve-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const exportAsText = () => {
    const report = generateCVEReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cve-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

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

  const yearData = stats?.byYear ? Object.entries(stats.byYear).map(([year, count]) => ({ year, count })).sort() : [];
  const severityData = stats?.bySeverity ? [
    { name: 'Critical', value: stats.bySeverity.critical },
    { name: 'High', value: stats.bySeverity.high },
    { name: 'Medium', value: stats.bySeverity.medium },
    { name: 'Low', value: stats.bySeverity.low }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">Reports & Analytics</h1>
          <p className="text-gray-400">Comprehensive vulnerability analysis and reporting</p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Export Options */}
        <GlassmorphCard className="p-6">
          <h3 className="text-white font-bold text-xl mb-4">Export Report</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportAsCSV}
              className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg transition-all duration-300 font-medium"
            >
              📊 Export as CSV
            </button>
            <button
              onClick={exportAsJSON}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-lg transition-all duration-300 font-medium"
            >
              📋 Export as JSON
            </button>
            <button
              onClick={exportAsText}
              className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg transition-all duration-300 font-medium"
            >
              📄 Export as Text
            </button>
          </div>
        </GlassmorphCard>

        {/* Report Type Selection */}
        <GlassmorphCard className="p-6">
          <h3 className="text-white font-bold text-xl mb-4">Report Type</h3>
          <div className="flex gap-4">
            {[
              { id: 'summary', label: '📊 Summary Report' },
              { id: 'detailed', label: '📝 Detailed Analysis' },
              { id: 'timeline', label: '📈 Severity Timeline' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  reportType === type.id
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                    : 'bg-slate-800/30 border border-slate-700/50 text-gray-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </GlassmorphCard>

        {/* Summary Report */}
        {reportType === 'summary' && stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassmorphCard className="p-6">
                <p className="text-gray-400 text-sm mb-2">Total CVEs</p>
                <p className="text-3xl font-bold text-cyan-400">{cves.length}</p>
              </GlassmorphCard>
              <GlassmorphCard className="p-6">
                <p className="text-gray-400 text-sm mb-2">Critical</p>
                <p className="text-3xl font-bold text-red-400">{stats.bySeverity.critical || 0}</p>
              </GlassmorphCard>
              <GlassmorphCard className="p-6">
                <p className="text-gray-400 text-sm mb-2">High</p>
                <p className="text-3xl font-bold text-orange-400">{stats.bySeverity.high || 0}</p>
              </GlassmorphCard>
              <GlassmorphCard className="p-6">
                <p className="text-gray-400 text-sm mb-2">Remediation Rate</p>
                <p className="text-3xl font-bold text-green-400">--</p>
              </GlassmorphCard>
            </div>

            {/* Charts */}
            {severityData.length > 0 && (
              <GlassmorphCard className="p-6">
                <h3 className="text-white font-bold text-xl mb-6">Severity Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" labelLine={false} label dataKey="value" outerRadius={100} fill="#8884d8">
                      {severityData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#06b6d4' }} />
                  </PieChart>
                </ResponsiveContainer>
              </GlassmorphCard>
            )}
          </div>
        )}

        {/* Detailed Analysis */}
        {reportType === 'detailed' && (
          <GlassmorphCard className="p-6">
            <h3 className="text-white font-bold text-xl mb-6">Detailed CVE Analysis</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {cves.slice(0, 10).map((cve, idx) => (
                <div key={idx} className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-cyan-400 font-bold">{cve.cveId}</p>
                      <p className="text-white font-medium">{cve.title}</p>
                      <p className="text-gray-400 text-sm">{cve.description?.substring(0, 100)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Score: {cve.severityScore || 'N/A'}</p>
                      <p className={`text-sm font-bold ${
                        cve.severity === 'critical' ? 'text-red-400' :
                        cve.severity === 'high' ? 'text-orange-400' :
                        cve.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {cve.severity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {cves.length > 10 && <p className="text-center text-gray-400">... and {cves.length - 10} more</p>}
            </div>
          </GlassmorphCard>
        )}

        {/* Timeline */}
        {reportType === 'timeline' && yearData.length > 0 && (
          <GlassmorphCard className="p-6">
            <h3 className="text-white font-bold text-xl mb-6">CVE Timeline by Year</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#06b6d4', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </GlassmorphCard>
        )}
      </div>
    </div>
  );
};
