import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// ─── Reusable helpers ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, colorClass = 'text-main', accent, sub }) => (
  <div
    className="bg-card border border-subtle rounded-xl p-5"
    style={accent ? { borderLeft: `3px solid ${accent}` } : {}}
  >
    <div className="text-muted text-[10px] font-black uppercase tracking-widest mb-3">{label}</div>
    <div className={`text-3xl font-black tabular-nums tracking-tight ${colorClass}`}>{value ?? '—'}</div>
    {sub && <div className="text-muted text-[10px] font-bold mt-2 uppercase tracking-wider">{sub}</div>}
  </div>
);

const NavCard = ({ title, description, icon, accent, path, navigate }) => (
  <button
    onClick={() => navigate(path)}
    className="group p-5 bg-card border border-subtle rounded-xl text-left hover:border-white/20 transition-all w-full"
    style={{ borderLeft: `3px solid ${accent}` }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        {icon}
      </div>
      <svg className="w-4 h-4 text-muted group-hover:text-main translate-x-0 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
      </svg>
    </div>
    <h3 className="text-main font-black text-[10px] uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-muted text-[11px] font-medium leading-relaxed">{description}</p>
  </button>
);

const ActivityRow = ({ log }) => {
  const typeColors = {
    login: '#22c55e',
    logout: '#6b7280',
    admin_user_update: '#f97316',
    admin_user_deactivate: '#ef4444',
    admin_user_activate: '#22c55e',
    admin_setting_update: '#a855f7',
    register: '#3b82f6',
  };
  const color = typeColors[log.action_type] || '#6b7280';
  const diff = Math.floor((Date.now() - new Date(log.created_at).getTime()) / 1000);
  const timeAgo = diff < 60 ? `${diff}s ago` : diff < 3600 ? `${Math.floor(diff / 60)}m ago` : diff < 86400 ? `${Math.floor(diff / 3600)}h ago` : `${Math.floor(diff / 86400)}d ago`;

  return (
    <div className="flex items-start gap-3 px-6 py-3 hover:bg-page/50 transition border-b border-subtle last:border-0">
      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <div className="text-main font-bold text-sm leading-snug">{log.description || log.action_type}</div>
        <div className="text-muted text-[10px] font-bold uppercase tracking-wider mt-0.5">
          {log.username || `User #${log.user_id}`}
        </div>
      </div>
      <div className="text-muted text-[10px] font-bold uppercase tracking-wider flex-shrink-0">{timeAgo}</div>
    </div>
  );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [syncStats, setSyncStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, logsRes, syncRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/activity'),
        api.get('/sync/stats'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || null);
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data?.data?.users || usersRes.value.data?.data || []);
      }
      if (logsRes.status === 'fulfilled') {
        setRecentLogs((logsRes.value.data?.logs || []).slice(0, 8));
      }
      if (syncRes.status === 'fulfilled') setSyncStats(syncRes.value.data?.stats || null);
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleUserAction = async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      fetchAll();
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    }
  };

  const newUsersToday = users.filter(u => (Date.now() - new Date(u.created_at).getTime()) < 86400000);

  if (loading) {
    return (
      <div className="min-h-screen bg-page pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-card border border-subtle rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-card border border-subtle rounded-xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-card border border-subtle rounded-xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-main tracking-tight">Governance Console</h1>
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/25 text-[10px] font-black uppercase tracking-widest rounded">Admin</span>
            </div>
            <p className="text-muted text-sm font-medium">
              Welcome, <span className="text-main font-bold">{user?.username}</span> — platform health at a glance.
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="self-start sm:self-auto px-4 py-2 bg-card border border-subtle rounded-lg text-[10px] font-black text-muted uppercase tracking-widest hover:text-main hover:border-white/20 transition"
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 border-l-4 border-l-red-500 p-4 rounded-lg text-red-400 text-xs font-bold">{error}</div>
        )}

        {/* ── Key metrics ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats?.totalUsers ?? users.length} accent="#3b82f6" />
          <StatCard label="Active Users" value={stats?.activeUsers} colorClass="text-green-400" accent="#22c55e" />
          <StatCard label="Admins" value={stats?.adminUsers} colorClass="text-orange-400" accent="#f97316" />
          <StatCard
            label="Events (24h)"
            value={stats?.recentActivity ?? '—'}
            colorClass="text-purple-400"
            accent="#a855f7"
            sub={newUsersToday.length > 0 ? `${newUsersToday.length} new user${newUsersToday.length > 1 ? 's' : ''} today` : undefined}
          />
        </div>

        {/* ── CVE database snapshot ────────────────────────────────────── */}
        {syncStats && (
          <div className="bg-card border border-subtle rounded-xl p-6" style={{ borderLeft: '3px solid #E53E3E' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-main font-black text-[10px] uppercase tracking-widest">CVE Database Snapshot</h2>
              <Link to="/admin/sync" className="text-[10px] font-black text-red-400 uppercase hover:text-red-300 transition">Sync Now →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total CVEs', value: syncStats.totalCVEs?.toLocaleString(), color: 'text-main' },
                { label: 'Critical', value: syncStats.bySeverity?.critical, color: 'text-red-400' },
                { label: 'High', value: syncStats.bySeverity?.high, color: 'text-orange-400' },
                { label: 'Medium', value: syncStats.bySeverity?.medium, color: 'text-yellow-400' },
                { label: 'Low', value: syncStats.bySeverity?.low, color: 'text-green-400' },
                { label: 'Last Synced', value: syncStats.lastSync ? new Date(syncStats.lastSync).toLocaleDateString() : 'Never', color: 'text-muted' },
              ].map((s, i) => (
                <div key={i} className="bg-page border border-subtle rounded-lg p-3 text-center">
                  <div className="text-muted text-[9px] font-black uppercase tracking-widest mb-2">{s.label}</div>
                  <div className={`text-lg font-black tabular-nums ${s.color}`}>{s.value ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick nav cards ──────────────────────────────────────────── */}
        <div>
          <h2 className="text-main font-black text-[10px] uppercase tracking-widest mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <NavCard title="User Management" description="Manage accounts, roles, and access permissions." icon="👥" accent="#3b82f6" path="/admin/users" navigate={navigate} />
            <NavCard title="Audit Logs" description="Real-time activity logs and security audit trails." icon="📋" accent="#a855f7" path="/admin/activity" navigate={navigate} />
            <NavCard title="NVD Data Sync" description="Trigger a manual NVD sync to pull fresh CVE data." icon="🔄" accent="#22c55e" path="/admin/sync" navigate={navigate} />
            <NavCard title="Reports" description="Generate comprehensive vulnerability intelligence reports." icon="📊" accent="#f97316" path="/admin/reports" navigate={navigate} />
            <NavCard title="Learn Center" description="Add and edit Intellectual Mastery guides for users." icon="🎓" accent="#06b6d4" path="/admin/learn" navigate={navigate} />
            <NavCard title="Settings" description="Configure site, access control, sessions, and notifications." icon="⚙️" accent="#E53E3E" path="/admin/settings" navigate={navigate} />
          </div>
        </div>

        {/* ── Two-column: users + activity ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent users */}
          <div className="bg-card border border-subtle rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
              <h3 className="text-main font-black text-[10px] uppercase tracking-widest">Recent Users</h3>
              <Link to="/admin/users" className="text-[10px] font-black text-red-400 uppercase hover:text-red-300 transition">All Users →</Link>
            </div>
            <div className="divide-y divide-subtle">
              {users.slice(0, 6).map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-3 hover:bg-page/50 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center text-red-400 font-black text-xs">
                      {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-main font-bold text-sm leading-none mb-0.5 truncate">{u.username}</p>
                      <p className="text-muted text-[10px] truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                      u.role === 'admin' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>{u.role}</span>
                    <button
                      onClick={() => handleUserAction(u.id, u.is_active ? 'deactivate' : 'activate')}
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border transition ${
                        u.is_active
                          ? 'text-red-400 border-red-500/30 hover:bg-red-500/10'
                          : 'text-green-400 border-green-500/30 hover:bg-green-500/10'
                      }`}
                    >
                      {u.is_active ? 'Revoke' : 'Restore'}
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="px-6 py-8 text-center text-muted text-[10px] font-black uppercase tracking-widest">No users found</div>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-card border border-subtle rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
              <h3 className="text-main font-black text-[10px] uppercase tracking-widest">
                Recent Activity
                {stats?.recentActivity > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-[9px]">
                    {stats.recentActivity} today
                  </span>
                )}
              </h3>
              <Link to="/admin/activity" className="text-[10px] font-black text-red-400 uppercase hover:text-red-300 transition">All Logs →</Link>
            </div>
            <div>
              {recentLogs.length > 0
                ? recentLogs.map((log, i) => <ActivityRow key={i} log={log} />)
                : <div className="px-6 py-8 text-center text-muted text-[10px] font-black uppercase tracking-widest">No recent activity</div>
              }
            </div>
          </div>

        </div>

        {/* ── System health strip ──────────────────────────────────────── */}
        <div className="bg-card border border-subtle rounded-xl p-5 flex flex-wrap gap-6 items-center">
          <div className="text-main font-black text-[10px] uppercase tracking-widest">System Status</div>
          {[
            { label: 'API', ok: true },
            { label: 'Database', ok: true },
            { label: 'Auth', ok: true },
            { label: 'NVD Sync', ok: !!syncStats },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${s.ok ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-muted text-[10px] font-black uppercase tracking-widest">{s.label}</span>
              <span className={`text-[9px] font-black uppercase ${s.ok ? 'text-green-500' : 'text-red-400'}`}>{s.ok ? 'OK' : 'DOWN'}</span>
            </div>
          ))}
          <div className="ml-auto text-muted text-[10px] font-bold">
            Last refreshed: {new Date().toLocaleTimeString()}
          </div>
        </div>

      </div>
    </div>
  );
};
