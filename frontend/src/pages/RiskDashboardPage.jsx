import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { SeverityBadge, LoadingSkeleton } from '../components/common';

export const RiskDashboardPage = () => {
  const [cves, setCves] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cvesRes, assetsRes] = await Promise.all([
        api.get('/cves'),
        api.get('/assets/matches').catch(() => ({ data: { data: [] } }))
      ]);
      setCves(cvesRes.data.cves || []);
      setAssets(assetsRes.data.data || []);
    } catch (e) {}
    setLoading(false);
  };

  const prioritized = useMemo(() => {
    const assetCveIds = new Set(assets.map(a => a.cve_id));
    return cves.map(cve => {
      let riskScore = (cve.severityScore || 0) * 10;
      if (cve.hasExploit || cve.has_exploit) riskScore += 20;
      if (cve.isKEV || cve.is_kev) riskScore += 15;
      if (assetCveIds.has(cve.cveId)) riskScore += 25;
      const severityBonus = { critical: 15, high: 10, medium: 5, low: 0 };
      riskScore += severityBonus[cve.severity] || 0;
      return { ...cve, riskScore: Math.min(riskScore, 100), affectsAssets: assetCveIds.has(cve.cveId) };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [cves, assets]);

  const riskColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };
  const riskBg = (score) => {
    if (score >= 80) return 'bg-red-600';
    if (score >= 60) return 'bg-orange-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading) return (
    <div className="min-h-screen bg-tenable-grey-light p-10">
       <div className="max-w-6xl mx-auto space-y-10">
          <LoadingSkeleton className="h-10 w-96 rounded" />
          <div className="grid grid-cols-4 gap-4">
             {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-24 rounded-lg" />)}
          </div>
          <LoadingSkeleton className="h-[400px] w-full rounded-lg" />
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-tenable-grey-light pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
           <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-tenable-navy tracking-tight">Risk Prioritization</h1>
              <span className="px-2 py-0.5 bg-tenable-navy text-white text-[10px] font-black uppercase tracking-widest rounded">Engine</span>
           </div>
           <p className="text-tenable-text-muted text-sm font-medium">CVEs ranked by institutional risk factors and real-world exploitation telemetry.</p>
        </div>

        {/* Risk Metrics Summary */}
        {(() => {
          const counts = prioritized.reduce((acc, c) => {
            if (c.riskScore >= 80) acc[0]++;
            else if (c.riskScore >= 60) acc[1]++;
            else if (c.riskScore >= 40) acc[2]++;
            else acc[3]++;
            return acc;
          }, [0, 0, 0, 0]);
          return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Critical Risk', count: counts[0], color: 'text-red-500' },
            { label: 'High Exposure', count: counts[1], color: 'text-orange-500' },
            { label: 'Medium Risk', count: counts[2], color: 'text-yellow-500' },
            { label: 'Low Risk', count: counts[3], color: 'text-green-500' }
          ].map((stat, i) => (
             <div key={i} className="bg-card border border-subtle rounded-xl p-6 shadow-sm transition-theme">
                <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">{stat.label}</div>
                <div className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.count}</div>
             </div>
          ))}
        </div>
          );
        })()}

        {/* Prioritization List */}
        <div className="bg-card border border-subtle rounded-xl overflow-hidden mb-10">
          <div className="px-8 py-5 border-b border-subtle flex items-center justify-between">
             <h2 className="text-main font-black text-xs uppercase tracking-widest">Remediation Priority Queue</h2>
             <div className="text-[10px] font-black text-muted uppercase tracking-widest">Sorted by Risk Index</div>
          </div>
          <div className="divide-y divide-subtle">
            {prioritized.slice(0, 15).map((cve, i) => (
              <div key={cve.cveId || i} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-page transition group">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="text-muted font-black text-sm w-8">#{i + 1}</div>
                  <div className={`w-14 h-14 rounded flex flex-col items-center justify-center border border-subtle shadow-inner ${statBgForScore(cve.riskScore)}`}>
                    <span className={`text-xl font-black ${riskColor(cve.riskScore)}`}>{cve.riskScore}</span>
                    <span className="text-[8px] font-black uppercase text-muted -mt-1">Index</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <span className="text-main font-black text-xs uppercase tracking-widest">{cve.cveId}</span>
                       <SeverityBadge severity={cve.severity} />
                       {cve.affectsAssets && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase shadow-sm">Asset Match</span>}
                       {(cve.hasExploit || cve.has_exploit) && <span className="text-[9px] bg-red-900/60 text-red-300 border border-red-700/40 px-2 py-0.5 rounded font-black uppercase">Known Exploit</span>}
                       {(cve.isKEV || cve.is_kev) && <span className="text-[9px] bg-purple-600 text-white px-2 py-0.5 rounded font-black uppercase">CISA KEV</span>}
                    </div>
                    <p className="text-main text-sm font-bold truncate pr-4">{cve.title || 'Institutional security record'}</p>
                  </div>
                </div>

                <div className="w-full md:w-32">
                   <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 text-right md:text-left">Risk Magnitude</div>
                   <div className="w-full bg-page rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${riskBg(cve.riskScore)}`} style={{ width: `${cve.riskScore}%` }}></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Logic Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-tenable-navy rounded-lg p-10 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
              </div>
              <h3 className="text-tenable-yellow font-black text-xs uppercase tracking-[0.2em] mb-4">Risk Calculation Matrix</h3>
              <p className="text-sm font-medium leading-relaxed text-gray-300 mb-8">
                 The risk index represents a synthesized evaluation of static severity metrics (CVSS) augmented by dynamic environmental telemetry.
              </p>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-white/70">
                 <div className="flex items-center gap-2 border-l border-tenable-yellow pl-3">Static CVSS Value × 10</div>
                 <div className="flex items-center gap-2 border-l border-tenable-yellow pl-3">Known Exploit Vector (+20)</div>
                 <div className="flex items-center gap-2 border-l border-tenable-yellow pl-3">CISA Primary Oversight (+15)</div>
                 <div className="flex items-center gap-2 border-l border-tenable-yellow pl-3">Asset Mapping Contact (+25)</div>
              </div>
           </div>
           
           <div className="bg-card border border-subtle rounded-xl p-10 flex flex-col justify-center transition-theme">
              <h3 className="text-main font-black text-xs uppercase tracking-widest mb-4">Risk Scoring Logic</h3>
              <p className="text-muted text-sm font-medium leading-relaxed">
                 Institutional remediation efforts should be vertically aligned with the prioritization index. 
                 Records presenting an index of &gt;= 80 require immediate forensic evaluation and patching within 24 operational hours.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const statBgForScore = (score) => {
   if (score >= 80) return 'bg-red-500/10';
   if (score >= 60) return 'bg-orange-500/10';
   if (score >= 40) return 'bg-yellow-500/10';
   return 'bg-green-500/10';
};
