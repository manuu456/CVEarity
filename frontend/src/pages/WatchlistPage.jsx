import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ software_name: '', vendor: '', severity_threshold: 'all' });
  const [activeTab, setActiveTab] = useState('watchlist');

  useEffect(() => {
    fetchWatchlist();
    fetchAlerts();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      setWatchlist(res.data.data || []);
    } catch (err) { console.error('Error:', err); }
    setLoading(false);
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/watchlist/alerts');
      setAlerts(res.data.data?.alerts || []);
      setUnreadCount(res.data.data?.unreadCount || 0);
    } catch (err) { console.error('Error:', err); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/watchlist', formData);
      setFormData({ software_name: '', vendor: '', severity_threshold: 'all' });
      setShowAddForm(false);
      fetchWatchlist();
      fetchAlerts();
    } catch (err) { console.error('Error:', err); }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/watchlist/${id}`);
      fetchWatchlist();
      fetchAlerts();
    } catch (err) { console.error('Error:', err); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/watchlist/alerts/${id}/read`);
      fetchAlerts();
    } catch (err) { console.error('Error:', err); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/watchlist/alerts/read-all');
      fetchAlerts();
    } catch (err) { console.error('Error:', err); }
  };

  const severityColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    all: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Watchlist & Alerts
            </h1>
            <p className="text-slate-400 mt-1">Monitor software for new vulnerabilities</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
          >
            + Add to Watchlist
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Add Software to Watch</h3>
            <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Software name (e.g. Apache, Linux)"
                value={formData.software_name}
                onChange={(e) => setFormData({ ...formData, software_name: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Vendor (optional)"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={formData.severity_threshold}
                onChange={(e) => setFormData({ ...formData, severity_threshold: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical Only</option>
                <option value="high">High & Above</option>
                <option value="medium">Medium & Above</option>
              </select>
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg py-2 font-medium transition-colors">
                Add
              </button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'watchlist' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${activeTab === 'alerts' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Alerts ({alerts.length})
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div className="space-y-3">
            {watchlist.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                <p className="text-slate-400 text-lg">No items in your watchlist yet</p>
                <p className="text-slate-500 mt-2">Add software to watch for new vulnerabilities</p>
              </div>
            ) : (
              watchlist.map(item => (
                <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-cyan-400 text-lg">🔍</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{item.software_name}</h3>
                      <p className="text-slate-400 text-sm">
                        {item.vendor && `${item.vendor} • `}
                        <span className={`px-2 py-0.5 rounded text-xs border ${severityColors[item.severity_threshold]}`}>
                          {item.severity_threshold === 'all' ? 'All severities' : `${item.severity_threshold}+`}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            {alerts.length > 0 && unreadCount > 0 && (
              <button onClick={markAllRead} className="mb-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                Mark all as read
              </button>
            )}
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                  <p className="text-slate-400 text-lg">No alerts yet</p>
                  <p className="text-slate-500 mt-2">Alerts appear when new CVEs match your watchlist</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`bg-slate-800/50 border rounded-xl p-4 flex items-start justify-between transition-colors ${
                      alert.is_read ? 'border-slate-700 opacity-60' : 'border-cyan-500/30 bg-cyan-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${alert.is_read ? 'bg-slate-600' : 'bg-cyan-400'}`}></div>
                      <div>
                        <p className="text-white text-sm">{alert.message || `CVE ${alert.cve_id} found`}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!alert.is_read && (
                      <button
                        onClick={() => markRead(alert.id)}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
