import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { SeverityBadge, LoadingSkeleton } from '../../components/common';

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
    (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="min-h-screen bg-page py-10 px-4 transition-theme">
        <div className="max-w-6xl mx-auto space-y-8">
          <LoadingSkeleton className="h-10 w-80 rounded-xl" />
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page py-10 px-4 transition-theme">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Area */}
        <div className="border-b border-subtle pb-8">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl font-black text-main tracking-tight uppercase">Identity & Access</h1>
            <span className="px-3 py-1 bg-main text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Management</span>
          </div>
          <p className="text-muted text-sm font-medium italic opacity-80">Control institutional access levels, authentication states, and organizational mapping.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-5 rounded-xl text-red-500 text-xs font-bold shadow-sm transition-theme">
            {error}
          </div>
        )}

        {/* Global Search & Filtration */}
        <div className="bg-card border border-subtle rounded-3xl p-8 shadow-sm transition-theme">
           <div className="relative group">
              <input
                type="text"
                placeholder="Query by Identity (Username) or Electronic Mail Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-page border border-subtle rounded-2xl text-sm text-main font-bold placeholder-muted/40 focus:outline-none focus:ring-2 focus:ring-main/20 transition-all shadow-inner"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted group-focus-within:text-main transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </div>
        </div>

        {/* Directory Listing */}
        <div className="bg-card border border-subtle rounded-3xl shadow-sm overflow-hidden transition-theme">
          <div className="px-8 py-6 border-b border-subtle bg-page/5 flex items-center justify-between">
            <h2 className="text-main font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-main animate-pulse"></span>
              Global Identity Directory ({filteredUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-page/50">
                <tr>
                  {['Institutional Identity', 'Communication Endpoint', 'Authorization Role', 'Verification', 'Operational Controls'].map(h => (
                    <th key={h} className="py-5 px-8 text-main font-black text-[9px] uppercase tracking-widest opacity-60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredUsers.map(user => {
                  const isActive = user.isActive === undefined ? user.is_active : user.isActive;
                  return (
                    <tr key={user.id} className="hover:bg-page transition-all group">
                      <td className="py-6 px-8 text-main font-black text-sm group-hover:translate-x-1 transition-transform">{user.username}</td>
                      <td className="py-6 px-8 text-muted text-xs font-bold italic">{user.email}</td>
                      <td className="py-6 px-8">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-theme ${
                          user.role === 'admin' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                            : user.role === 'customer_care'
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-600'
                            : 'bg-main/5 border-subtle text-main'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-sm animate-pulse ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-[10px] font-black text-main uppercase tracking-widest opacity-80">{isActive ? 'Authorized' : 'Unauthorized'}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right space-x-6">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-[9px] font-black text-main uppercase tracking-widest border-b-2 border-transparent hover:border-main transition-all"
                        >
                          Modify Policy
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, isActive)}
                          className={`text-[9px] font-black uppercase tracking-widest border-b-2 border-transparent transition-all ${
                            isActive ? 'text-red-500 hover:border-red-500' : 'text-green-500 hover:border-green-500'
                          }`}
                        >
                          {isActive ? 'Revoke Session' : 'Grant Session'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Modification Interface (Modal) */}
        {editingUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingUser(null)} />
             <div className="bg-card border border-subtle rounded-3xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden transition-theme">
                <div className="bg-page/10 px-10 py-8 border-b border-subtle">
                   <h2 className="text-main font-black text-xl uppercase tracking-tight">Identity Parameter Override</h2>
                   <p className="text-muted text-[9px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Manual security posture adjustment</p>
                </div>
                
                <div className="p-10 space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2 opacity-60">First Descriptor</label>
                        <input type="text" value={formData.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)}
                          className="w-full px-5 py-3 bg-page border border-subtle rounded-xl text-sm text-main font-bold focus:outline-none focus:ring-2 focus:ring-main/20 shadow-inner" />
                      </div>
                      <div>
                        <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2 opacity-60">Final Descriptor</label>
                        <input type="text" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)}
                          className="w-full px-5 py-3 bg-page border border-subtle rounded-xl text-sm text-main font-bold focus:outline-none focus:ring-2 focus:ring-main/20 shadow-inner" />
                      </div>
                   </div>
                   
                   <div>
                    <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2 opacity-60">Institutional Mapping (Company)</label>
                    <input type="text" value={formData.company} onChange={(e) => handleFormChange('company', e.target.value)}
                      className="w-full px-5 py-3 bg-page border border-subtle rounded-xl text-sm text-main font-bold focus:outline-none focus:ring-2 focus:ring-main/20 shadow-inner" />
                   </div>

                   <div>
                    <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2 opacity-60">Authorization Tier</label>
                    <select value={formData.role} onChange={(e) => handleFormChange('role', e.target.value)}
                      className="w-full px-5 py-3 bg-page border border-subtle rounded-xl text-sm text-main font-black uppercase focus:outline-none focus:ring-2 focus:ring-main/20 shadow-inner appearance-none">
                      <option value="user">Standard Agent</option>
                      <option value="admin">Institutional Administrator</option>
                      <option value="customer_care">Deployment Support</option>
                    </select>
                   </div>

                   <div className="flex items-center gap-4 p-5 bg-page border border-subtle rounded-2xl shadow-inner group cursor-pointer" onClick={() => handleFormChange('isActive', !formData.isActive)}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.isActive ? 'bg-main border-main text-white' : 'bg-transparent border-subtle'}`}>
                        {formData.isActive && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <label className="text-main text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">Verify Identity Credentials (Active)</label>
                   </div>
                </div>

                <div className="px-10 py-8 bg-page/10 border-t border-subtle flex gap-4">
                   <button onClick={handleSaveUser}
                    className="flex-1 tenable-btn-primary py-4 text-[10px] tracking-[0.2em] uppercase">
                    Commit Changes
                   </button>
                   <button onClick={() => setEditingUser(null)}
                    className="tenable-btn-secondary px-8 py-4 text-[10px] tracking-[0.2em] uppercase">
                    Abort
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
