import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const S = {
  page: { minHeight: '100vh', background: '#050505', paddingTop: '96px', paddingBottom: '60px', paddingLeft: '24px', paddingRight: '24px' },
  wrap: { maxWidth: '720px', margin: '0 auto' },
  section: { background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '16px', marginBottom: '24px', overflow: 'hidden' },
  sectionHead: { padding: '20px 28px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '12px' },
  sectionIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(229,62,62,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: 0 },
  sectionSub: { fontSize: '11px', color: '#6b7280', margin: '2px 0 0' },
  body: { padding: '28px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '7px' },
  input: { width: '100%', padding: '11px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '500', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' },
  btnPrimary: { padding: '10px 22px', background: '#E53E3E', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.05em', boxShadow: '0 0 16px rgba(229,62,62,0.3)', transition: 'opacity 0.2s' },
  btnGhost: { padding: '10px 22px', background: 'transparent', color: '#9ca3af', border: '1px solid #2a2a2a', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  btnDanger: { padding: '10px 22px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #1a1a1a' },
  tag: (color) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', background: `${color}18`, color, border: `1px solid ${color}30` }),
};

const Alert = ({ msg }) => msg ? (
  <div style={{ padding: '11px 16px', borderRadius: '8px', marginBottom: '20px', background: msg.t === 'ok' ? 'rgba(34,197,94,0.08)' : 'rgba(229,62,62,0.08)', border: `1px solid ${msg.t === 'ok' ? 'rgba(34,197,94,0.25)' : 'rgba(229,62,62,0.25)'}`, borderLeft: `3px solid ${msg.t === 'ok' ? '#22c55e' : '#E53E3E'}` }}>
    <p style={{ color: msg.t === 'ok' ? '#4ade80' : '#f87171', fontSize: '12px', fontWeight: '700', margin: 0 }}>{msg.text}</p>
  </div>
) : null;

export const UserSettingsPage = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();

  const [profile, setProfile] = useState({ firstName: user?.firstName || user?.first_name || '', lastName: user?.lastName || user?.last_name || '', company: user?.company || '' });
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [focused, setFocused] = useState('');

  const focusStyle = (name) => ({
    ...S.input,
    borderColor: focused === name ? '#E53E3E' : '#2a2a2a',
    boxShadow: focused === name ? '0 0 0 3px rgba(229,62,62,0.1)' : 'none'
  });
  const fp = (name) => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    const res = await updateProfile(profile);
    setProfileMsg(res?.success ? { t: 'ok', text: 'Profile updated successfully.' } : { t: 'err', text: res?.message || 'Update failed.' });
    setSaving(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) { setPwdMsg({ t: 'err', text: 'Passwords do not match.' }); return; }
    if (pwd.newPwd.length < 6) { setPwdMsg({ t: 'err', text: 'Password must be at least 6 characters.' }); return; }
    setChangingPwd(true);
    setPwdMsg(null);
    const res = await changePassword({ currentPassword: pwd.current, newPassword: pwd.newPwd });
    setPwdMsg(res?.success ? { t: 'ok', text: 'Password changed successfully.' } : { t: 'err', text: res?.message || 'Password change failed.' });
    if (res?.success) setPwd({ current: '', newPwd: '', confirm: '' });
    setChangingPwd(false);
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Account Settings</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Manage your profile, security, and account preferences.</p>
        </div>

        {/* Profile Info */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionIcon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
            </div>
            <div>
              <p style={S.sectionTitle}>Profile Information</p>
              <p style={S.sectionSub}>Your public display name and organization.</p>
            </div>
          </div>
          <div style={S.body}>
            <Alert msg={profileMsg} />

            {/* Read-only account info */}
            <div style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '10px', padding: '16px 20px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ ...S.label, marginBottom: '4px' }}>Username</p>
                  <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '14px', margin: 0 }}>@{user?.username}</p>
                </div>
                <div>
                  <p style={{ ...S.label, marginBottom: '4px' }}>Email</p>
                  <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '14px', margin: 0 }}>{user?.email}</p>
                </div>
                <div>
                  <p style={{ ...S.label, marginBottom: '4px' }}>Role</p>
                  <span style={S.tag(user?.role === 'admin' ? '#E53E3E' : '#22c55e')}>{user?.role}</span>
                </div>
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <div style={{ ...S.grid2, marginBottom: '16px' }}>
                <div>
                  <label style={S.label}>First Name</label>
                  <input value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} placeholder="First name" style={focusStyle('fn')} {...fp('fn')} />
                </div>
                <div>
                  <label style={S.label}>Last Name</label>
                  <input value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} placeholder="Last name" style={focusStyle('ln')} {...fp('ln')} />
                </div>
              </div>
              <div style={{ marginBottom: '22px' }}>
                <label style={S.label}>Organization</label>
                <input value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} placeholder="Company or institution" style={focusStyle('company')} {...fp('company')} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={saving} style={{ ...S.btnPrimary, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionIcon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            </div>
            <div>
              <p style={S.sectionTitle}>Change Password</p>
              <p style={S.sectionSub}>Use a strong password with at least 6 characters.</p>
            </div>
          </div>
          <div style={S.body}>
            <Alert msg={pwdMsg} />
            <form onSubmit={savePassword}>
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Current Password</label>
                <input type="password" value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })} placeholder="Enter current password" style={focusStyle('cp')} {...fp('cp')} required />
              </div>
              <div style={{ ...S.grid2, marginBottom: '22px' }}>
                <div>
                  <label style={S.label}>New Password</label>
                  <input type="password" value={pwd.newPwd} onChange={e => setPwd({ ...pwd, newPwd: e.target.value })} placeholder="Min 6 characters" style={focusStyle('np')} {...fp('np')} required />
                </div>
                <div>
                  <label style={S.label}>Confirm New Password</label>
                  <input type="password" value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} placeholder="Re-enter new password" style={focusStyle('cnp')} {...fp('cnp')} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={changingPwd} style={{ ...S.btnPrimary, opacity: changingPwd ? 0.7 : 1 }}>
                  {changingPwd ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Overview */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionIcon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
            </div>
            <div>
              <p style={S.sectionTitle}>Security</p>
              <p style={S.sectionSub}>Two-factor authentication and session management.</p>
            </div>
          </div>
          <div style={S.body}>
            <div style={{ ...S.row, borderBottom: '1px solid #1a1a1a' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: '700', fontSize: '13px', margin: '0 0 3px' }}>Multi-Factor Authentication</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Require a code from your authenticator app on login.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={S.tag(user?.mfa_enabled ? '#22c55e' : '#6b7280')}>{user?.mfa_enabled ? 'Enabled' : 'Disabled'}</span>
                <a href="/mfa" style={{ ...S.btnGhost, textDecoration: 'none', fontSize: '11px' }}>Manage</a>
              </div>
            </div>
            <div style={{ ...S.row, borderBottom: '1px solid #1a1a1a' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: '700', fontSize: '13px', margin: '0 0 3px' }}>API Keys</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Manage programmatic access to the CVEarity API.</p>
              </div>
              <a href="/developer" style={{ ...S.btnGhost, textDecoration: 'none', fontSize: '11px' }}>Manage</a>
            </div>
            <div style={{ ...S.row, borderBottom: 'none' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: '700', fontSize: '13px', margin: '0 0 3px' }}>Active Session</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>You are currently signed in. Sign out to end your session.</p>
              </div>
              <button onClick={logout} style={S.btnDanger}>Sign Out</button>
            </div>
          </div>
        </div>

      </div>
      <style>{`input::placeholder{color:#3f3f46;}input:focus{outline:none;}`}</style>
    </div>
  );
};
