import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const severityColors = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  all: 'bg-page text-muted border-subtle'
};

const SeverityDot = ({ level }) => {
  const colors = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500' };
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[level] || 'bg-muted'}`} />;
};

const TIP_ITEMS = [
  { icon: '🎯', title: 'Target popular attack surfaces', desc: 'Start with Apache, OpenSSL, Windows, Linux, Log4j, Chrome.' },
  { icon: '🔔', title: 'Use severity filters', desc: 'Set High/Critical threshold to reduce noise — only get alerted when it matters.' },
  { icon: '⚡', title: 'Check alerts regularly', desc: 'New CVE matches appear instantly. Acknowledge them after reviewing.' },
  { icon: '🔗', title: 'Link with Asset Inventory', desc: 'Add the same software to Assets for combined risk scoring on the dashboard.' },
];

export const WatchlistPage = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ software_name: '', vendor: '', severity_threshold: 'all' });
  const [activeTab, setActiveTab] = useState('watchlist');

  useEffect(() => { fetchWatchlist(); fetchAlerts(); }, []);

  const fetchWatchlist = async () => {
    try { const res = await api.get('/watchlist'); setWatchlist(res.data.data || []); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/watchlist/alerts');
      setAlerts(res.data.data?.alerts || []);
      setUnreadCount(res.data.data?.unreadCount || 0);
    } catch (err) { console.error(err); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/watchlist', formData);
      setFormData({ software_name: '', vendor: '', severity_threshold: 'all' });
      setShowAddForm(false);
      fetchWatchlist(); fetchAlerts();
    } catch (err) { console.error(err); }
  };

  const removeItem = async (id) => {
    try { await api.delete(`/watchlist/${id}`); fetchWatchlist(); fetchAlerts(); }
    catch (err) { console.error(err); }
  };

  const markRead = async (id) => {
    try { await api.put(`/watchlist/alerts/${id}/read`); fetchAlerts(); }
    catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try { await api.put('/watchlist/alerts/read-all'); fetchAlerts(); }
    catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen bg-page pt-24 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-card border border-subtle rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.is_read).length;

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-subtle">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-main tracking-tight">Watchlist</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/25 text-[10px] font-black uppercase tracking-widest rounded animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-muted text-sm font-medium">Monitor software you care about — get alerted the moment a matching CVE is published.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="self-start sm:self-auto px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-lg"
          >
            {showAddForm ? 'Cancel' : '+ Watch Software'}
          </button>
        </div>

        {/* ── Stat strip ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Watching', value: watchlist.length, color: 'text-main', accent: '#3b82f6' },
            { label: 'Total Alerts', value: alerts.length, color: 'text-main', accent: '#a855f7' },
            { label: 'Unread', value: unreadCount, color: unreadCount > 0 ? 'text-red-400' : 'text-main', accent: '#E53E3E' },
            { label: 'Critical Unread', value: criticalAlerts, color: criticalAlerts > 0 ? 'text-red-500' : 'text-main', accent: '#ef4444' },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-subtle rounded-xl p-4" style={{ borderLeft: `3px solid ${s.accent}` }}>
              <div className="text-muted text-[9px] font-black uppercase tracking-widest mb-2">{s.label}</div>
              <div className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Add form ────────────────────────────────────────────── */}
        {showAddForm && (
          <div className="bg-card border border-subtle rounded-xl p-6 relative overflow-hidden" style={{ borderLeft: '3px solid #FFC72C' }}>
            <h3 className="text-main font-black text-[10px] uppercase tracking-widest mb-5">Watch New Software</h3>
            <form onSubmit={addItem} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Software / Product *</label>
                <input type="text" placeholder="e.g. Apache, Log4j" value={formData.software_name}
                  onChange={e => setFormData({ ...formData, software_name: e.target.value })}
                  className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" required />
              </div>
              <div className="sm:col-span-1">
                <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Vendor (optional)</label>
                <input type="text" placeholder="e.g. Apache Foundation" value={formData.vendor}
                  onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" />
              </div>
              <div className="sm:col-span-1">
                <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Alert Threshold</label>
                <select value={formData.severity_threshold} onChange={e => setFormData({ ...formData, severity_threshold: e.target.value })}
                  className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main font-bold focus:outline-none transition">
                  <option value="all">All Severity</option>
                  <option value="critical">Critical Only</option>
                  <option value="high">High + Critical</option>
                  <option value="medium">Medium & Above</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition">
                  Start Watching
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div className="flex border-b border-subtle">
          {[
            { id: 'watchlist', label: `Watching (${watchlist.length})` },
            { id: 'alerts', label: `Alerts (${alerts.length})`, badge: unreadCount },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition relative ${activeTab === tab.id ? 'text-main' : 'text-muted hover:text-main'}`}>
              {tab.label}
              {tab.badge > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full">{tab.badge}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t" />}
            </button>
          ))}
        </div>

        {/* ── Watchlist tab ────────────────────────────────────────── */}
        {activeTab === 'watchlist' && (
          <div className="space-y-4">
            {watchlist.length === 0 ? (
              <div className="bg-card border border-dashed border-subtle rounded-xl p-12 text-center">
                <div className="text-5xl mb-4 opacity-30">👁️</div>
                <p className="text-main font-black text-sm uppercase tracking-widest mb-2">Nothing being watched yet</p>
                <p className="text-muted text-xs font-medium mb-6">Add software names like Apache, OpenSSL, or Log4j to start receiving CVE alerts.</p>
                <button onClick={() => setShowAddForm(true)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition">
                  + Watch First Software
                </button>
              </div>
            ) : (
              <div className="bg-card border border-subtle rounded-xl overflow-hidden">
                <div className="divide-y divide-subtle">
                  {watchlist.map(item => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-page/50 transition group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-9 h-9 bg-page border border-subtle rounded-lg flex items-center justify-center text-main flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-main font-bold text-sm truncate">{item.software_name}</div>
                          <div className="text-muted text-[10px] font-bold uppercase tracking-wider mt-0.5">
                            {item.vendor || 'Any vendor'} ·{' '}
                            <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black transition ${severityColors[item.severity_threshold]}`}>
                              {item.severity_threshold === 'all' ? 'All severity' : `${item.severity_threshold}+`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)}
                        className="text-[9px] font-black text-red-500 uppercase px-3 py-1 rounded border border-red-500/30 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips panel */}
            <div className="bg-card border border-subtle rounded-xl p-6">
              <h4 className="text-main font-black text-[10px] uppercase tracking-widest mb-4">Getting the most out of Watchlist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIP_ITEMS.map((tip, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-page border border-subtle rounded-lg">
                    <span className="text-lg flex-shrink-0">{tip.icon}</span>
                    <div>
                      <div className="text-main font-bold text-xs mb-0.5">{tip.title}</div>
                      <div className="text-muted text-[10px] font-medium leading-relaxed">{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Alerts tab ───────────────────────────────────────────── */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length > 0 && unreadCount > 0 && (
              <div className="flex justify-end">
                <button onClick={markAllRead}
                  className="px-4 py-1.5 bg-card border border-subtle text-muted text-[10px] font-black uppercase tracking-widest rounded-lg hover:text-main transition">
                  Mark All Read
                </button>
              </div>
            )}

            {alerts.length === 0 ? (
              <div className="bg-card border border-dashed border-subtle rounded-xl p-12 text-center">
                <div className="text-5xl mb-4 opacity-30">📡</div>
                <p className="text-main font-black text-sm uppercase tracking-widest mb-2">No alerts yet</p>
                <p className="text-muted text-xs font-medium mb-6">
                  {watchlist.length === 0
                    ? 'Add software to your watchlist first — alerts appear here when matching CVEs are found.'
                    : 'You\'re being monitored. Alerts appear here when new CVEs match your watched software.'}
                </p>
                {watchlist.length === 0 && (
                  <button onClick={() => setActiveTab('watchlist')}
                    className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition">
                    Go to Watchlist
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-card border border-subtle rounded-xl overflow-hidden">
                <div className="divide-y divide-subtle">
                  {alerts.map(alert => (
                    <div key={alert.id}
                      className={`flex items-start justify-between px-6 py-4 transition ${alert.is_read ? 'opacity-50' : 'hover:bg-page/50 cursor-pointer'}`}
                      onClick={() => !alert.is_read && navigate(`/cve/${alert.cve_id}`)}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`flex-shrink-0 mt-1.5 w-2 h-2 rounded-full ${alert.is_read ? 'bg-subtle' : 'bg-red-500 animate-pulse'}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-main font-black text-sm">{alert.cve_id}</span>
                            {alert.severity && <SeverityDot level={alert.severity} />}
                            {alert.severity && <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${severityColors[alert.severity]}`}>{alert.severity}</span>}
                          </div>
                          <div className="text-muted text-[10px] font-medium truncate">{alert.message || `CVE ${alert.cve_id} matched your watchlist`}</div>
                          <div className="text-muted text-[9px] font-black uppercase tracking-wider mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {!alert.is_read && (
                        <button onClick={e => { e.stopPropagation(); markRead(alert.id); }}
                          className="flex-shrink-0 ml-4 text-[9px] font-black text-muted uppercase px-3 py-1 rounded border border-subtle hover:text-main hover:border-white/20 transition">
                          Dismiss
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
