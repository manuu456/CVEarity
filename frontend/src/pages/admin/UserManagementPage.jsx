import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GlassmorphCard, LoadingSkeleton, ErrorAlert } from '../../components/common';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    role: 'user',
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data.users || response.data.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setFormData({
      firstName: user.firstName || user.first_name || '',
      lastName: user.lastName || user.last_name || '',
      company: user.company || '',
      role: user.role,
      isActive: user.isActive === undefined ? user.is_active : user.isActive
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUser = async () => {
    try {
      await api.put(`/admin/users/${editingUser}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        role: formData.role,
        isActive: formData.isActive
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      const action = isActive ? 'deactivate' : 'activate';
      await api.post(`/admin/users/${userId}/${action}`);
      fetchUsers();
    } catch (err) {
      setError(`Failed to ${isActive ? 'deactivate' : 'activate'} user`);
      console.error(err);
    }
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
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">User Management</h1>
          <p className="text-gray-400">Manage user accounts, roles, and permissions</p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Search Bar */}
        <GlassmorphCard className="p-6">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
          />
        </GlassmorphCard>

        {/* Users Table */}
        <GlassmorphCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Users ({filteredUsers.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Username</th>
                  <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Created</th>
                  <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-cyan-500/10 hover:bg-slate-700/20 transition">
                    <td className="py-3 px-4 text-white font-medium">{user.username}</td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-500/20 text-red-400'
                          : user.role === 'customer_care'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`w-2 h-2 rounded-full inline-block ${
                        user.isActive === undefined ? (user.is_active ? 'bg-green-400' : 'bg-red-400') : (user.isActive ? 'bg-green-400' : 'bg-red-400')
                      }`} />
                      <span className="ml-2 text-sm text-gray-300">
                        {user.isActive === undefined ? (user.is_active ? 'Active' : 'Inactive') : (user.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(user.createdAt || user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-cyan-400 hover:text-cyan-300 mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive === undefined ? user.is_active : user.isActive)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        {(user.isActive === undefined ? user.is_active : user.isActive) ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassmorphCard>

        {/* Edit User Modal */}
        {editingUser && (
          <GlassmorphCard className="p-8 fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-lg p-8 max-w-md w-full border border-cyan-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Edit User</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleFormChange('company', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="customer_care">Customer Care</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleFormChange('isActive', e.target.checked)}
                      className="mr-2 w-4 h-4"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 bg-slate-700/20 hover:bg-slate-700/30 border border-slate-500/50 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassmorphCard>
        )}
      </div>
    </div>
  );
};
