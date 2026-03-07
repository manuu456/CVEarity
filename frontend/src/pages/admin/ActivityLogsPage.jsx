import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GlassmorphCard, LoadingSkeleton, ErrorAlert } from '../../components/common';

export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    fetchActivityLogs();
  }, [page, filterUser, filterAction]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      let url = `/admin/activity?page=${page}&limit=${limit}`;
      if (filterUser) url += `&userId=${filterUser}`;
      
      const response = await api.get(url);
      if (response.data.success) {
        setLogs(response.data.data.logs || response.data.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch activity logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterAction && log.action !== filterAction) return false;
    return true;
  });

  const getActionColor = (action) => {
    if (action.includes('login')) return 'text-green-400';
    if (action.includes('deactivate')) return 'text-red-400';
    if (action.includes('activate')) return 'text-green-400';
    if (action.includes('update')) return 'text-yellow-400';
    if (action.includes('delete')) return 'text-red-400';
    return 'text-cyan-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <LoadingSkeleton className="h-12 w-80" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">Activity Logs</h1>
          <p className="text-gray-400">Monitor user actions and system events</p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Filters */}
        <GlassmorphCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Filter by Action</label>
              <select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="user_updated">User Updated</option>
                <option value="user_deactivated">User Deactivated</option>
                <option value="user_activated">User Activated</option>
                <option value="profile_update">Profile Updated</option>
                <option value="password_change">Password Changed</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Filter by User ID</label>
              <input
                type="text"
                placeholder="Enter user ID..."
                value={filterUser}
                onChange={(e) => {
                  setFilterUser(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterAction('');
                  setFilterUser('');
                  setPage(1);
                  fetchActivityLogs();
                }}
                className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </GlassmorphCard>

        {/* Activity Logs Table */}
        <GlassmorphCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <div key={idx} className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className={`font-semibold ${getActionColor(log.action)}`}>
                        {log.action.toUpperCase().replace(/_/g, ' ')}
                      </p>
                      <p className="text-gray-300 text-sm mt-1">{log.details || 'No details'}</p>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>User ID: {log.user_id}</span>
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No activity logs found
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-cyan-500/10">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-400">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filteredLogs.length < limit}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </GlassmorphCard>
      </div>
    </div>
  );
};
