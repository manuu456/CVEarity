import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const AssetInventoryPage = () => {
  const [assets, setAssets] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ software_name: '', version: '', vendor: '', category: 'general', criticality: 'medium' });

  useEffect(() => { fetchAssets(); fetchMatches(); }, []);

  const fetchAssets = async () => {
    try { const r = await api.get('/assets'); setAssets(r.data.data || []); } catch (e) {}
    setLoading(false);
  };
  const fetchMatches = async () => {
    try { const r = await api.get('/assets/matches'); setMatches(r.data.data || []); } catch (e) {}
  };
  const addAsset = async (e) => {
    e.preventDefault();
    try { await api.post('/assets', form); setForm({ software_name: '', version: '', vendor: '', category: 'general', criticality: 'medium' }); setShowForm(false); fetchAssets(); fetchMatches(); } catch (e) {}
  };
  const removeAsset = async (id) => {
    try { await api.delete(`/assets/${id}`); fetchAssets(); fetchMatches(); } catch (e) {}
  };

  const critColors = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-orange-400', critical: 'text-red-400' };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Asset Inventory</h1>
            <p className="text-slate-400 mt-1">Track your software stack and discover vulnerabilities</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors">+ Add Asset</button>
        </div>

        {showForm && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <form onSubmit={addAsset} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input type="text" placeholder="Software (e.g. Apache)" value={form.software_name} onChange={e => setForm({...form, software_name: e.target.value})} className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500" required />
              <input type="text" placeholder="Version" value={form.version} onChange={e => setForm({...form, version: e.target.value})} className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500" />
              <input type="text" placeholder="Vendor" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500" />
              <select value={form.criticality} onChange={e => setForm({...form, criticality: e.target.value})} className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500">
                <option value="low">Low Criticality</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg py-2 font-medium transition-colors">Add</button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{assets.length}</p><p className="text-slate-400 text-sm">Total Assets</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{matches.length}</p><p className="text-slate-400 text-sm">Matched CVEs</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{assets.filter(a => a.criticality === 'critical' || a.criticality === 'high').length}</p><p className="text-slate-400 text-sm">High/Critical Assets</p>
          </div>
        </div>

        {/* Asset List */}
        <div className="space-y-3">
          {assets.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center"><p className="text-slate-400 text-lg">No assets added yet</p></div>
          ) : assets.map(a => (
            <div key={a.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-colors">
              <div>
                <h3 className="text-white font-medium">{a.software_name} {a.version && <span className="text-slate-400">v{a.version}</span>}</h3>
                <p className="text-slate-400 text-sm">{a.vendor || 'Unknown vendor'} • <span className={critColors[a.criticality]}>{a.criticality}</span></p>
              </div>
              <button onClick={() => removeAsset(a.id)} className="text-red-400 hover:text-red-300 px-3 py-1 rounded-lg transition-colors">Remove</button>
            </div>
          ))}
        </div>

        {/* Matched CVEs */}
        {matches.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">⚠️ Matched Vulnerabilities</h2>
            <div className="space-y-2">
              {matches.map((m, i) => (
                <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-red-400 font-mono text-sm">{m.cve_id}</span>
                    <span className="text-white ml-2">{m.title}</span>
                    <span className="text-slate-400 ml-2 text-sm">→ {m.software_name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${m.severity === 'critical' ? 'bg-red-500/20 text-red-400' : m.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{m.severity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
