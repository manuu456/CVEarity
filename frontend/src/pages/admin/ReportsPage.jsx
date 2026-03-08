import React, { useState, useEffect } from 'react';
import { getCVEs, getStatistics } from '../../services/api';
import { GlassmorphCard, LoadingSkeleton, ErrorAlert } from '../../components/common';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TENABLE_NAVY = '#002B49';
const TENABLE_YELLOW = '#FFC72C';
const TENABLE_GREY_LIGHT = '#F4F6F8';
const TENABLE_GREY_MEDIUM = '#E5E8EB';

const SEVERITY_COLORS = ['#D32F2F', '#EF5350', '#FF7043', '#66BB6A'];

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
      setError('Failed to load operational report metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCVEReport = () => {
    const report = {
      title: 'Institutional Vulnerability Intelligence Report',
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
Corporate Directory Status: Active
----------------------------------

EXECUTIVE SUMMARY
-----------------
Total Corporate Risks Identified: ${report.totalCVEs}
Critical Escalations: ${report.bySeverity.critical || 0}
High Priority Nodes: ${report.bySeverity.high || 0}
Medium Exposure: ${report.bySeverity.medium || 0}
Low Priority: ${report.bySeverity.low || 0}

DETAILED INTELLIGENCE NODES
---------------------------
${report.cveDetails.map(cve => `
[${cve.id}] - ${cve.title}
Magnitude: ${cve.severity.toUpperCase()} (${cve.score})
Publication Registry: ${cve.published}
Infrastructure Target: ${cve.affected}
`).join('\n')}`;
  };

  const exportAsCSV = () => {
    const headers = ['CVE ID', 'Designation', 'Severity', 'Risk Score', 'Publication Date', 'Target Infrastructure'];
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
    a.download = `cvearity-intelligence-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportAsJSON = () => {
    const report = {
      title: 'Institutional Vulnerability Intelligence Report',
      generatedAt: new Date().toISOString(),
      totalCVEs: cves.length,
      statistics: stats,
      vulnerabilities: cves
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cvearity-intelligence-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const exportAsText = () => {
    const report = generateCVEReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cvearity-intelligence-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page pt-24 pb-12 px-6 transition-theme">
        <div className="max-w-7xl mx-auto space-y-8">
          <LoadingSkeleton className="h-10 w-96 rounded-xl" />
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const yearData = stats?.byYear ? Object.entries(stats.byYear).map(([year, count]) => ({ year, count })).sort() : [];
  const severityData = stats?.bySeverity ? [
    { name: 'Critical', value: stats.bySeverity.critical, color: '#ef4444' },
    { name: 'High', value: stats.bySeverity.high, color: '#f97316' },
    { name: 'Medium', value: stats.bySeverity.medium, color: '#eab308' },
    { name: 'Low', value: stats.bySeverity.low, color: '#22c55e' }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6 transition-theme">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-subtle pb-8">
           <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-black text-main tracking-tight uppercase">Institutional Analytics Engine</h1>
              <span className="px-3 py-1 bg-main text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Operational Intelligence</span>
           </div>
           <p className="text-muted text-sm font-medium italic opacity-80">Macro-scale reporting and forensic data export for corporate risk assessment.</p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Intelligence Export options */}
        <div className="bg-card border border-subtle rounded-3xl p-8 shadow-sm transition-theme">
          <h3 className="text-main font-black text-[10px] uppercase tracking-[0.2em] mb-8">Intelligence Export Operations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={exportAsCSV}
              className="tenable-btn-secondary px-6 py-4 flex items-center justify-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📊</span> 
              <span className="text-[10px] tracking-widest uppercase">Generate CSV Dataset</span>
            </button>
            <button
              onClick={exportAsJSON}
              className="tenable-btn-secondary px-6 py-4 flex items-center justify-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📋</span> 
              <span className="text-[10px] tracking-widest uppercase">Generate JSON Structure</span>
            </button>
            <button
              onClick={exportAsText}
              className="tenable-btn-secondary px-6 py-4 flex items-center justify-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📄</span> 
              <span className="text-[10px] tracking-widest uppercase">Generate Narrative Text</span>
            </button>
          </div>
        </div>

        {/* Report Vector Selection */}
        <div className="bg-card border border-subtle rounded-2xl p-2 shadow-sm flex gap-2 overflow-x-auto transition-theme">
          {[
            { id: 'summary', label: 'Telemetry Summary' },
            { id: 'detailed', label: 'Forensic Analysis' },
            { id: 'timeline', label: 'Temporal Trajectory' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                reportType === type.id
                  ? 'bg-main text-white shadow-xl scale-[1.02]'
                  : 'text-muted hover:text-main hover:bg-page'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Dynamic Data Stream */}
        {reportType === 'summary' && stats && (
          <div className="space-y-10 animate-fade-in">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                  { l: 'Total Intel Nodes', v: cves.length, c: 'text-main', icon: '🔍' },
                  { l: 'Critical Escalations', v: stats.bySeverity.critical || 0, c: 'text-red-500', icon: '🚨' },
                  { l: 'High Priority Nodes', v: stats.bySeverity.high || 0, c: 'text-orange-500', icon: '⚠️' },
                  { l: 'Remediation Velocity', v: '94.2%', c: 'text-green-500', icon: '⚡' }
               ].map((stat, i) => (
                  <div key={i} className="bg-card border border-subtle rounded-3xl p-8 shadow-sm transition-theme relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-subtle/10 group-hover:bg-main transition-colors"></div>
                     <p className="text-muted text-[9px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span>{stat.icon}</span> {stat.l}
                     </p>
                     <p className={`text-4xl font-black ${stat.c} tracking-tighter`}>{stat.v}</p>
                  </div>
               ))}
            </div>

            {/* Charts */}
            <div className="bg-card border border-subtle rounded-3xl p-10 shadow-sm transition-theme">
               <h3 className="text-main font-black text-[10px] uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-main animate-pulse"></span>
                 Severity Distribution Matrix
               </h3>
               <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={severityData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={80} 
                        outerRadius={120} 
                        paddingAngle={8} 
                        dataKey="value"
                        stroke="none"
                      >
                        {severityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-card)', 
                          border: '1px solid var(--border-subtle)', 
                          borderRadius: '16px', 
                          fontSize: '11px', 
                          fontWeight: 'bold',
                          color: 'var(--text-main)',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex flex-wrap justify-center gap-8 mt-10">
                 {severityData.map((item, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                     <span className="text-[10px] font-black uppercase text-main opacity-80 tracking-widest">{item.name}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {reportType === 'detailed' && (
          <div className="bg-card border border-subtle rounded-3xl shadow-sm overflow-hidden transition-theme animate-fade-in">
             <div className="px-10 py-8 border-b border-subtle bg-page/5">
                <h3 className="text-main font-black text-[10px] uppercase tracking-[0.2em]">Deep Forensic Analysis Repository</h3>
             </div>
             <div className="divide-y divide-subtle max-h-[700px] overflow-y-auto scrollbar-hide">
                {cves.slice(0, 20).map((cve, idx) => (
                  <div key={idx} className="p-8 hover:bg-page transition-all border-l-4 border-l-transparent hover:border-l-main flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group">
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-2">
                           <span className="text-main font-black text-xs tracking-widest group-hover:translate-x-1 transition-transform inline-block">{cve.cveId}</span>
                           <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-theme ${
                              cve.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                              cve.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                              'bg-main/5 border-subtle text-main'
                           }`}>
                              {cve.severity}
                           </span>
                        </div>
                        <p className="text-main font-bold text-sm truncate opacity-90">{cve.title}</p>
                     </div>
                     <div className="text-left sm:text-right whitespace-nowrap bg-page/50 sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto">
                        <div className="text-[11px] font-black text-main">Risk Score: <span className="text-lg tracking-tighter ml-1">{cve.severityScore || 'N/A'}</span></div>
                        <div className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mt-1.5 opacity-60 italic">Registry Logged</div>
                     </div>
                  </div>
                ))}
                {cves.length > 20 && (
                   <div className="p-6 text-center bg-page/30">
                      <p className="text-muted text-[10px] font-black uppercase tracking-widest opacity-60 italic">+ {cves.length - 20} ADDITIONAL RECORDS OMITTED FROM PREVIEW</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {reportType === 'timeline' && yearData.length > 0 && (
          <div className="bg-card border border-subtle rounded-3xl p-10 shadow-sm transition-theme animate-fade-in">
            <h3 className="text-main font-black text-[10px] uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-yellow animate-pulse"></span>
              Annual Intelligence Influx Timeline
            </h3>
            <div className="h-[450px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={yearData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} opacity={0.5} />
                   <XAxis 
                     dataKey="year" 
                     tick={{ fontSize: 10, fill: 'var(--text-main)', fontWeight: '900' }} 
                     axisLine={{ stroke: 'var(--border-subtle)' }}
                     tickLine={false}
                   />
                   <YAxis 
                     tick={{ fontSize: 10, fill: 'var(--text-main)', fontWeight: '900' }} 
                     axisLine={{ stroke: 'var(--border-subtle)' }}
                     tickLine={false}
                   />
                   <Tooltip 
                     cursor={{ fill: 'var(--bg-page)', opacity: 0.4 }} 
                     contentStyle={{ 
                        backgroundColor: 'var(--bg-card)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: '16px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        color: 'var(--text-main)',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                      }} 
                   />
                   <Bar dataKey="count" fill="var(--color-main)" radius={[8, 8, 0, 0]} barSize={40} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
