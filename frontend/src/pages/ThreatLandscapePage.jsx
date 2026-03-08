import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { LoadingSkeleton } from '../components/common';

const TENABLE_YELLOW = '#FFC72C';

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

  if (loading) return (
    <div className="min-h-screen bg-page p-10 transition-theme">
       <div className="max-w-7xl mx-auto space-y-10">
          <LoadingSkeleton className="h-10 w-96 rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
             {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <LoadingSkeleton className="h-[300px] rounded-xl" />
             <LoadingSkeleton className="h-[300px] rounded-xl" />
          </div>
       </div>
    </div>
  );

  const severityData = stats ? [
    { name: 'Critical', count: stats.bySeverity?.critical || 0, color: '#EF4444' },
    { name: 'High', count: stats.bySeverity?.high || 0, color: '#F97316' },
    { name: 'Medium', count: stats.bySeverity?.medium || 0, color: '#EAB308' },
    { name: 'Low', count: stats.bySeverity?.low || 0, color: '#22C55E' }
  ] : [];

  const yearData = stats?.byYear ? Object.entries(stats.byYear).map(([year, count]) => ({ year, count })) : [];

  const softwareCount = {};
  cves.forEach(cve => {
    (cve.affectedSoftware || []).forEach(sw => {
      const name = sw.split(' ')[0];
      if (name) softwareCount[name] = (softwareCount[name] || 0) + 1;
    });
  });
  const topSoftware = Object.entries(softwareCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const monthlyData = {};
  cves.forEach(cve => {
    const month = cve.publishedDate?.substring(0, 7);
    if (month) monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  const trendData = Object.entries(monthlyData).sort().map(([month, count]) => ({ month, count }));

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6 transition-theme">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 border-b border-subtle pb-8">
           <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-main tracking-tight">Global Threat Landscape</h1>
              <span className="px-2 py-0.5 bg-main text-white text-[10px] font-black uppercase tracking-widest rounded transition-theme">Institutional Intelligence</span>
           </div>
           <p className="text-muted text-sm font-medium">Macro-scale vulnerability trajectories and global infrastructure risk assessment telemetry.</p>
        </div>

        {/* Aggregate Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Security Records', value: stats?.totalCVEs || 0, color: 'text-main' },
            { label: 'Critical Infiltrations', value: stats?.bySeverity?.critical || 0, color: 'text-red-500' },
            { label: 'High Exposure Nodes', value: stats?.bySeverity?.high || 0, color: 'text-orange-500' },
            { label: 'Neutralized Vectors', value: stats?.bySeverity?.medium || 0, color: 'text-yellow' }
          ].map((stat, i) => (
             <div key={i} className="bg-card border border-subtle rounded-xl p-6 shadow-sm hover:shadow-md transition-theme">
                <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-3">{stat.label}</div>
                <div className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value.toLocaleString()}</div>
             </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-card border border-subtle rounded-xl p-8 shadow-sm transition-theme">
             <h3 className="text-main font-black text-[10px] uppercase tracking-widest mb-6">Severity Magnitude Distribution</h3>
             <div className="flex items-center gap-6">
               <div className="flex-1 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={severityData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="count" strokeWidth={0}>
                           {severityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />)}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '10px', fontWeight: 'bold', fontSize: '11px', color: '#fff' }}
                          formatter={(val, name) => [val.toLocaleString(), name]}
                        />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex flex-col gap-3 flex-shrink-0 w-28">
                  {severityData.map((s, i) => (
                     <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }}></div>
                        <div>
                           <div className="text-[9px] font-black text-main uppercase tracking-widest leading-none">{s.name}</div>
                           <div className="text-[10px] font-black mt-0.5" style={{ color: s.color }}>{s.count.toLocaleString()}</div>
                        </div>
                     </div>
                  ))}
               </div>
             </div>
          </div>

          <div className="bg-card border border-subtle rounded-xl p-8 shadow-sm transition-theme">
             <h3 className="text-main font-black text-[10px] uppercase tracking-widest mb-8">Temporal Analysis of Influx</h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="month" hide />
                      <YAxis tick={{ fontSize: 9, fill: 'var(--text-main)', fontWeight: '900' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontWeight: 'bold', fontSize: '10px' }}
                        itemStyle={{ color: 'var(--text-main)' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#E53E3E" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: TENABLE_YELLOW }} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
           <div className="bg-card border border-subtle rounded-xl p-8 shadow-sm transition-theme">
              <h3 className="text-main font-black text-[10px] uppercase tracking-widest mb-8">Targeted Infrastructure Mapping</h3>
              <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSoftware} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9, fill: 'var(--text-main)', fontWeight: '900' }} axisLine={false} tickLine={false} />
                       <Tooltip 
                        cursor={{ fill: 'var(--bg-page)', opacity: 0.4 }} 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontWeight: 'bold', fontSize: '10px' }}
                       />
                       <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-card border border-subtle rounded-xl p-8 shadow-sm transition-theme">
              <h3 className="text-main font-black text-[10px] uppercase tracking-widest mb-8">Annual Intelligence Accumulation</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-main)', fontWeight: '900' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-main)', fontWeight: '900' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'var(--bg-page)', opacity: 0.4 }} 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontWeight: 'bold', fontSize: '10px' }}
                    />
                    <Bar dataKey="count" fill={TENABLE_YELLOW} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="bg-main rounded-2xl p-10 text-white shadow-xl flex flex-col justify-center relative overflow-hidden transition-theme">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.91-4.33-3.56zm2.95-8H5.08c.96-1.65 2.49-2.93 4.33-3.56-.6 1.11-1.06 2.31-1.38 3.56zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.34.16-2h4.68c.09.66.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
           </div>
           <h3 className="text-yellow font-black text-[10px] uppercase tracking-[0.2em] mb-6">Strategic Landscape Brief</h3>
           <p className="text-lg font-medium leading-relaxed text-white/80 mb-8 max-w-3xl">
              The Global Threat Landscape provides a consolidated vantage point for analyzing systemic security drifts. Institutional data correlates real-time ingestion with historic temporal shifts to define the evolving exposure surface.
           </p>
           <div className="flex gap-12">
              <div className="border-l-2 border-yellow/40 pl-6">
                 <p className="text-[10px] text-white/50 font-black uppercase mb-1 tracking-widest">Observation Radius</p>
                 <p className="text-2xl font-black italic tracking-tight">360° Operational</p>
              </div>
              <div className="border-l-2 border-yellow/40 pl-6">
                 <p className="text-[10px] text-white/50 font-black uppercase mb-1 tracking-widest">Intelligence Velocity</p>
                 <p className="text-2xl font-black italic tracking-tight">Low-Latency</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
