import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassmorphCard, LoadingSkeleton, ErrorAlert } from '../../components/common';
import api from '../../services/api';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, settingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/settings')
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
      setSettings(settingsRes.data.data.settings);
      setError(null);
    } catch (err) {
      setError('Failed to fetch admin data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, settings, and system statistics</p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-slate-800/30 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Quick Access Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 transition-all duration-300 text-left"
              >
                <p className="text-cyan-400 font-bold text-lg">👥 User Management</p>
                <p className="text-gray-300 text-sm mt-2">Manage users, roles, and permissions</p>
              </button>
              <button
                onClick={() => navigate('/admin/activity')}
                className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-all duration-300 text-left"
              >
                <p className="text-purple-400 font-bold text-lg">📋 Activity Logs</p>
                <p className="text-gray-300 text-sm mt-2">Monitor user actions and events</p>
              </button>
              <button
                onClick={() => navigate('/customer-care')}
                className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:border-green-500/50 transition-all duration-300 text-left"
              >
                <p className="text-green-400 font-bold text-lg">💬 Customer Care</p>
                <p className="text-gray-300 text-sm mt-2">Support team dashboard</p>
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-all duration-300 text-left"
              >
                <p className="text-orange-400 font-bold text-lg">📊 Reports</p>
                <p className="text-gray-300 text-sm mt-2">Analytics and vulnerability reports</p>
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
                <div className="text-gray-400 text-sm mb-3 font-medium">Total Users</div>
                <div className="text-4xl font-bold text-cyan-400">{stats.totalUsers}</div>
              </GlassmorphCard>
              <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
                <div className="text-gray-400 text-sm mb-3 font-medium">Active Users</div>
                <div className="text-4xl font-bold text-green-400">{stats.activeUsers}</div>
              </GlassmorphCard>
              <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
                <div className="text-gray-400 text-sm mb-3 font-medium">Admin Users</div>
                <div className="text-4xl font-bold text-orange-400">{stats.adminUsers}</div>
              </GlassmorphCard>
              <GlassmorphCard className="p-6 hover:scale-105 transition-transform duration-300">
                <div className="text-gray-400 text-sm mb-3 font-medium">Recent Activity</div>
                <div className="text-4xl font-bold text-purple-400">{stats.recentActivity}</div>
              </GlassmorphCard>
            </div>

            {/* Recent Users */}
            <GlassmorphCard className="p-6">
              <h3 className="text-white font-bold text-xl mb-6 text-glow">Recent Users</h3>
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-cyan-500/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.first_name?.[0] || user.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        user.is_active ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphCard>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <GlassmorphCard className="p-6">
            <h3 className="text-white font-bold text-xl mb-6 text-glow">User Management</h3>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-cyan-500/10">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.first_name?.[0] || user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username
                        }
                      </p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-xs">{user.company || 'No company'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'admin'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-2">
                      {user.is_active ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'deactivate')}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300 text-sm"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300 text-sm"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphCard>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <GlassmorphCard className="p-6">
            <h3 className="text-white font-bold text-xl mb-6 text-glow">System Settings</h3>
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.setting_key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-cyan-500/10">
                  <div>
                    <p className="text-white font-medium">{setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="text-gray-400 text-sm">Current: {setting.setting_value}</p>
                  </div>
                  <div className="text-gray-500 text-sm">
                    Updated: {new Date(setting.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphCard>
        )}
      </div>
    </div>
  );
};