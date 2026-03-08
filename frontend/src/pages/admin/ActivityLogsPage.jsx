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
    if (action.includes('login') || action.includes('activate')) return 'text-green-500';
    if (action.includes('deactivate') || action.includes('delete')) return 'text-red-500';
    if (action.includes('update')) return 'text-main';
    return 'text-main';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page pt-24 pb-12 px-6 transition-theme">
        <div className="max-w-6xl mx-auto space-y-8">
          <LoadingSkeleton className="h-10 w-96 rounded-xl" />
          <LoadingSkeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6 transition-theme">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-subtle pb-8">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl font-black text-main tracking-tight uppercase">Institutional Activity Audit</h1>
            <span className="px-3 py-1 bg-main text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Admin Oversight</span>
          </div>
          <p className="text-muted text-sm font-medium italic opacity-80">Real-time telemetry of user actions and systemic operational events across the infrastructure.</p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Search & Intelligence Filters */}
        <div className="bg-card border border-subtle rounded-3xl p-8 shadow-sm transition-theme">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-muted text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Action Category</label>
              <select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setPage(1);
                }}
                className="w-full px-5 py-3 bg-page border border-subtle rounded-xl text-sm font-bold text-main focus:ring-2 focus:ring-main/20 transition-all outline-none appearance-none shadow-inner"
              >
                <option value="">All Operational Vectors</option>
                <option value="login">Authentication: Login</option>
                <option value="logout">Authentication: Logout</option>
                <option value="user_updated">Management: Record Updated</option>
                <option value="user_deactivated">Management: Record Deactivated</option>
                <option value="user_activated">Management: Record Activated</option>
                <option value="profile_update">User: Identity Modified</option>
                <option value="password_change">User: Credential Rotation</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-muted text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Identity Identifier (UUID)</label>
              <input
                type="text"
                placeholder="Search by UUID..."
                value={filterUser}
                onChange={(e) => {
                  setFilterUser(e.target.value);
                  setPage(1);
                }}
                className="w-full px-5 py-3 bg-page border border-subtle rounded-xl text-sm font-bold text-main placeholder-muted/30 focus:ring-2 focus:ring-main/20 transition-all outline-none font-mono shadow-inner"
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
                className="tenable-btn-secondary w-full py-3 text-[10px] tracking-[0.2em] uppercase"
              >
                Flush Filters
              </button>
            </div>
          </div>
        </div>

        {/* Audit Directory */}
        <div className="bg-card border border-subtle rounded-3xl shadow-sm overflow-hidden transition-theme">
          <div className="px-10 py-6 border-b border-subtle bg-page/5 flex items-center justify-between">
            <h2 className="text-main font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-main animate-pulse"></span>
              Chronological Event Registry
            </h2>
            <div className="px-3 py-1 bg-page/30 text-muted text-[9px] font-black uppercase tracking-widest border border-subtle rounded-full opacity-60">Filtered Sequence</div>
          </div>
          <div className="divide-y divide-subtle">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <div key={idx} className="p-8 hover:bg-page transition-all group border-l-4 border-l-transparent hover:border-l-main">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2">
                         <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${getActionColor(log.action)}`}>
                           {log.action.replace(/_/g, ' ')}
                         </span>
                         <span className="w-1.5 h-1.5 bg-subtle rounded-full"></span>
                         <span className="text-[10px] font-mono text-muted uppercase tracking-tight opacity-60">ID: {log.user_id}</span>
                      </div>
                      <p className="text-main font-bold text-sm leading-relaxed opacity-90">{log.details || 'Operational record generated without additional context.'}</p>
                    </div>
                    <div className="text-left sm:text-right bg-page/50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
                       <p className="text-[11px] font-black text-main uppercase tracking-tighter">
                         {new Date(log.created_at).toLocaleDateString()}
                       </p>
                       <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1 opacity-60">
                         {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                       </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black text-muted uppercase tracking-[0.2em] pt-2 border-t border-subtle/50">
                    <span className="opacity-60 italic">Target Node: {log.ip_address || 'Internal Interface'}</span>
                    <span className="group-hover:text-main transition-colors flex items-center gap-2">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      Forensic Integrity Verified
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-24 text-center bg-page/5 transition-theme">
                <div className="text-6xl mb-8 opacity-20 filter grayscale">📂</div>
                <p className="text-main font-black text-sm uppercase tracking-[0.2em] mb-4">Registry Null</p>
                <p className="text-muted text-xs font-medium italic opacity-60 max-w-sm mx-auto">No operational event records match the currently specified intelligence parameters.</p>
              </div>
            )}
          </div>

          {/* Navigational Logic */}
          <div className="flex items-center justify-between px-10 py-6 bg-page/10 border-t border-subtle">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="tenable-btn-secondary px-8 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous Frame
            </button>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] hidden sm:block">Intelligence Page</span>
               <span className="w-10 h-10 rounded-xl bg-main text-white flex items-center justify-center font-black text-sm shadow-lg shadow-main/20">{page}</span>
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filteredLogs.length < limit}
              className="tenable-btn-secondary px-8 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next Frame
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
