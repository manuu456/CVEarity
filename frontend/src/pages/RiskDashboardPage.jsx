import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

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
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };
  const riskBg = (score) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Risk Prioritization
        </h1>
        <p className="text-slate-400 mb-8">CVEs ranked by real-world risk — fix the most dangerous ones first</p>

        {/* Risk Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{prioritized.filter(c => c.riskScore >= 80).length}</p>
            <p className="text-slate-400 text-sm">Critical Risk</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{prioritized.filter(c => c.riskScore >= 60 && c.riskScore < 80).length}</p>
            <p className="text-slate-400 text-sm">High Risk</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{prioritized.filter(c => c.riskScore >= 40 && c.riskScore < 60).length}</p>
            <p className="text-slate-400 text-sm">Medium Risk</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{prioritized.filter(c => c.riskScore < 40).length}</p>
            <p className="text-slate-400 text-sm">Low Risk</p>
          </div>
        </div>

        {/* Fix This First */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-1">🔥 Fix These First</h2>
          <p className="text-slate-400 text-sm mb-4">Top vulnerabilities ranked by combined risk factors</p>
          <div className="space-y-3">
            {prioritized.slice(0, 15).map((cve, i) => (
              <div key={cve.cveId || i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center gap-4 hover:border-slate-600 transition-colors">
                <div className="text-slate-500 font-mono text-sm w-6">#{i + 1}</div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${riskBg(cve.riskScore)} bg-opacity-20`}>
                  <span className={`text-lg font-bold ${riskColor(cve.riskScore)}`}>{cve.riskScore}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono text-sm">{cve.cveId}</span>
                    {cve.affectsAssets && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">YOUR ASSET</span>}
                    {(cve.hasExploit || cve.has_exploit) && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">EXPLOITED</span>}
                    {(cve.isKEV || cve.is_kev) && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">CISA KEV</span>}
                  </div>
                  <p className="text-white text-sm truncate">{cve.title}</p>
                </div>
                <div className="w-24">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${riskBg(cve.riskScore)}`} style={{ width: `${cve.riskScore}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Legend */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h4 className="text-white text-sm font-medium mb-3">Risk Score Factors</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
            <div>📊 CVSS Score × 10</div>
            <div>⚡ Known Exploit: +20</div>
            <div>🏛️ CISA KEV: +15</div>
            <div>🖥️ Affects Your Assets: +25</div>
          </div>
        </div>
      </div>
    </div>
  );
};
