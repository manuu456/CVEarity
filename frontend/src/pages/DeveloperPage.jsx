import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const DeveloperPage = () => {
  const [keys, setKeys] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchKeys(); }, []);

  const fetchKeys = async () => {
    try { const r = await api.get('/developer/keys'); setKeys(r.data.data || []); } catch (e) {}
    setLoading(false);
  };

  const generateKey = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/developer/keys', { key_name: keyName });
      setNewKey(r.data.data?.api_key);
      setKeyName('');
      setShowForm(false);
      fetchKeys();
    } catch (e) {}
  };

  const revokeKey = async (id) => {
    try { await api.delete(`/developer/keys/${id}`); fetchKeys(); } catch (e) {}
  };

  const copyKey = (key) => navigator.clipboard.writeText(key);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Developer API</h1>
            <p className="text-slate-400 mt-1">Manage your API keys for programmatic access</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors">+ Generate Key</button>
        </div>

        {/* New key alert */}
        {newKey && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <p className="text-green-400 font-medium mb-2">🔑 New API Key Generated — Copy it now!</p>
            <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-cyan-400 break-all">{newKey}</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => copyKey(newKey)} className="text-xs text-slate-400 hover:text-cyan-400">📋 Copy</button>
              <button onClick={() => setNewKey(null)} className="text-xs text-slate-400 hover:text-red-400">✕ Dismiss</button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <form onSubmit={generateKey} className="flex gap-4">
              <input type="text" placeholder="Key name (e.g. CI/CD Pipeline)" value={keyName} onChange={e => setKeyName(e.target.value)} className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500" required />
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg px-6 py-2 font-medium transition-colors">Generate</button>
            </form>
          </div>
        )}

        {/* API Keys List */}
        <div className="space-y-3">
          {keys.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center"><p className="text-slate-400">No API keys yet</p></div>
          ) : keys.map(k => (
            <div key={k.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">{k.key_name}</h3>
                <p className="text-slate-400 text-sm font-mono">{k.api_key_preview} • {k.permissions} • {k.is_active ? '✅ Active' : '❌ Inactive'}</p>
              </div>
              <button onClick={() => revokeKey(k.id)} className="text-red-400 hover:text-red-300 px-3 py-1 rounded-lg transition-colors">Revoke</button>
            </div>
          ))}
        </div>

        {/* API Documentation */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📖 API Documentation</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="text-cyan-400 font-mono mb-1">GET /api/cves</h4>
              <p className="text-slate-400">List all CVEs. Query params: severity, search, year</p>
            </div>
            <div>
              <h4 className="text-cyan-400 font-mono mb-1">GET /api/cves/:id</h4>
              <p className="text-slate-400">Get a specific CVE by ID</p>
            </div>
            <div>
              <h4 className="text-cyan-400 font-mono mb-1">GET /api/cves/statistics</h4>
              <p className="text-slate-400">Get CVE statistics (counts by severity, year)</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <p className="text-slate-400 mb-1">Usage with API key:</p>
              <code className="text-cyan-400 text-xs">curl -H "X-API-Key: cvea_your_key" https://your-domain.vercel.app/api/cves</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
