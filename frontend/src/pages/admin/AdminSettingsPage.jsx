import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const S = {
  page: { minHeight: '100vh', background: '#050505', paddingTop: '96px', paddingBottom: '60px', paddingLeft: '24px', paddingRight: '24px' },
  wrap: { maxWidth: '800px', margin: '0 auto' },
  section: { background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '16px', marginBottom: '24px', overflow: 'hidden' },
  sectionHead: { padding: '20px 28px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '12px' },
  sectionIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(229,62,62,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sectionTitle: { fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: 0 },
  sectionSub: { fontSize: '11px', color: '#6b7280', margin: '2px 0 0' },
  body: { padding: '8px 0' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid #151515', gap: '24px' },
  label: { color: '#ffffff', fontWeight: '700', fontSize: '13px', margin: '0 0 3px' },
  sub: { color: '#6b7280', fontSize: '12px', margin: 0 },
  input: { padding: '8px 12px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#ffffff', fontSize: '13px', fontWeight: '600', outline: 'none', minWidth: '200px', transition: 'border-color 0.2s' },
  select: { padding: '8px 12px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#ffffff', fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer' },
  saveBtn: { padding: '8px 18px', background: '#E53E3E', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.05em', boxShadow: '0 0 12px rgba(229,62,62,0.25)', transition: 'opacity 0.2s' },
};

const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
      background: value ? '#E53E3E' : '#2a2a2a', position: 'relative', transition: 'background 0.2s', flexShrink: 0
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
      position: 'absolute', top: '3px', left: value ? '23px' : '3px',
      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
    }} />
  </button>
);

const Alert = ({ msg }) => msg ? (
  <div style={{ margin: '16px 28px 0', padding: '11px 16px', borderRadius: '8px', background: msg.t === 'ok' ? 'rgba(34,197,94,0.08)' : 'rgba(229,62,62,0.08)', border: `1px solid ${msg.t === 'ok' ? 'rgba(34,197,94,0.25)' : 'rgba(229,62,62,0.25)'}`, borderLeft: `3px solid ${msg.t === 'ok' ? '#22c55e' : '#E53E3E'}` }}>
    <p style={{ color: msg.t === 'ok' ? '#4ade80' : '#f87171', fontSize: '12px', fontWeight: '700', margin: 0 }}>{msg.text}</p>
  </div>
) : null;

// Helper to get a setting value from the array
const getSetting = (settings, key) => {
  const s = settings.find(s => s.setting_key === key);
  return s ? s.setting_value : '';
};

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    api.get('/admin/settings')
      .then(r => setSettings(r.data.data.settings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateLocal = (key, value) => {
    setSettings(prev => prev.map(s => s.setting_key === key ? { ...s, setting_value: value } : s));
  };

  const save = async (key) => {
    const value = getSetting(settings, key);
    setSaving(p => ({ ...p, [key]: true }));
    setMessages(p => ({ ...p, [key]: null }));
    try {
      await api.put(`/admin/settings/${key}`, { value });
      setMessages(p => ({ ...p, [key]: { t: 'ok', text: 'Saved' } }));
      setTimeout(() => setMessages(p => ({ ...p, [key]: null })), 2500);
    } catch (e) {
      setMessages(p => ({ ...p, [key]: { t: 'err', text: 'Failed to save' } }));
    }
    setSaving(p => ({ ...p, [key]: false }));
  };

  const SaveBtn = ({ k }) => (
    <button onClick={() => save(k)} disabled={saving[k]} style={{ ...S.saveBtn, opacity: saving[k] ? 0.6 : 1 }}>
      {saving[k] ? 'Saving...' : 'Save'}
    </button>
  );

  const InlineMsg = ({ k }) => messages[k] ? (
    <span style={{ fontSize: '11px', fontWeight: '700', color: messages[k].t === 'ok' ? '#4ade80' : '#f87171', marginLeft: '10px' }}>
      {messages[k].t === 'ok' ? '✓ ' : '✗ '}{messages[k].text}
    </span>
  ) : null;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050505', paddingTop: '96px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingLeft: '24px', paddingRight: '24px' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '16px', marginBottom: '24px', height: '160px', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Admin Settings</h1>
              <span style={{ padding: '2px 9px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'rgba(229,62,62,0.12)', color: '#E53E3E', border: '1px solid rgba(229,62,62,0.25)' }}>Admin Only</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Configure site-wide settings, access control, and platform behaviour.</p>
          </div>
        </div>

        {/* Site Settings */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionIcon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>
            </div>
            <div>
              <p style={S.sectionTitle}>Site Configuration</p>
              <p style={S.sectionSub}>Platform name, description, and general settings.</p>
            </div>
          </div>
          <div style={S.body}>
            {/* Site name */}
            <div style={S.row}>
              <div style={{ flex: 1 }}>
                <p style={S.label}>Site Name</p>
                <p style={S.sub}>The name displayed in the browser tab and emails.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  value={getSetting(settings, 'site_name')}
                  onChange={e => updateLocal('site_name', e.target.value)}
                  style={S.input}
                />
                <SaveBtn k="site_name" />
                <InlineMsg k="site_name" />
              </div>
            </div>
            {/* Site description */}
            <div style={{ ...S.row, borderBottom: 'none' }}>
              <div style={{ flex: 1 }}>
                <p style={S.label}>Site Description</p>
                <p style={S.sub}>Short description shown in meta tags and landing page.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  value={getSetting(settings, 'site_description')}
                  onChange={e => updateLocal('site_description', e.target.value)}
                  style={{ ...S.input, minWidth: '260px' }}
                />
                <SaveBtn k="site_description" />
                <InlineMsg k="site_description" />
              </div>
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionIcon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>
            </div>
            <div>
              <p style={S.sectionTitle}>Access Control</p>
              <p style={S.sectionSub}>User registration and login restrictions.</p>
            </div>
          </div>
          <div style={S.body}>
            {/* Allow registration */}
            <div style={S.row}>
              <div>
                <p style={S.label}>Allow New Registrations</p>
                <p style={S.sub}>When disabled, new users cannot create accounts.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Toggle
                  value={getSetting(settings, 'allow_registration') === 'true'}
                  onChange={val => { updateLocal('allow_registration', val ? 'true' : 'false'); setTimeout(() => save('allow_registration'), 50); }}
                />
                <span style={{ color: getSetting(settings, 'allow_registration') === 'true' ? '#22c55e' : '#6b7280', fontSize: '11px', fontWeight: '800', minWidth: '32px' }}>
                  {getSetting(settings, 'allow_registration') === 'true' ? 'ON' : 'OFF'}
                </span>
                <InlineMsg k="allow_registration" />
              </div>
            </div>
            {/* Max login attempts */}
            <div style={{ ...S.row, borderBottom: 'none' }}>
              <div>
                <p style={S.label}>Max Login Attempts</p>
                <p style={S.sub}>Number of failed login attempts before lockout.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={getSetting(settings, 'max_login_attempts')}
                  onChange={e => updateLocal('max_login_attempts', e.target.value)}
                  style={S.select}
                >
                  {['3','5','10','20'].map(v => <option key={v} value={v}>{v} attempts</option>)}
                </select>
                <SaveBtn k="max_login_attempts" />
                <InlineMsg k="max_login_attempts" />
              </div>
            </div>
          </div>
        </div>

        {/* Session & Notifications */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionIcon}>
              <svg width="16" height="16" fill="none" stroke="#E53E3E" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
            </div>
            <div>
              <p style={S.sectionTitle}>Sessions & Notifications</p>
              <p style={S.sectionSub}>Session expiry and email notification settings.</p>
            </div>
          </div>
          <div style={S.body}>
            {/* Session timeout */}
            <div style={S.row}>
              <div>
                <p style={S.label}>Session Timeout</p>
                <p style={S.sub}>How long users stay logged in after their last activity.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={getSetting(settings, 'session_timeout')}
                  onChange={e => updateLocal('session_timeout', e.target.value)}
                  style={S.select}
                >
                  {[['1','1 hour'],['6','6 hours'],['12','12 hours'],['24','24 hours'],['48','48 hours'],['168','7 days']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <SaveBtn k="session_timeout" />
                <InlineMsg k="session_timeout" />
              </div>
            </div>
            {/* Email notifications */}
            <div style={{ ...S.row, borderBottom: 'none' }}>
              <div>
                <p style={S.label}>Email Notifications</p>
                <p style={S.sub}>Send users email alerts for watchlist matches and security events.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Toggle
                  value={getSetting(settings, 'email_notifications') === 'true'}
                  onChange={val => { updateLocal('email_notifications', val ? 'true' : 'false'); setTimeout(() => save('email_notifications'), 50); }}
                />
                <span style={{ color: getSetting(settings, 'email_notifications') === 'true' ? '#22c55e' : '#6b7280', fontSize: '11px', fontWeight: '800', minWidth: '32px' }}>
                  {getSetting(settings, 'email_notifications') === 'true' ? 'ON' : 'OFF'}
                </span>
                <InlineMsg k="email_notifications" />
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ ...S.section, borderColor: 'rgba(239,68,68,0.2)' }}>
          <div style={{ ...S.sectionHead, borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ ...S.sectionIcon, background: 'rgba(239,68,68,0.1)' }}>
              <svg width="16" height="16" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
            </div>
            <div>
              <p style={{ ...S.sectionTitle, color: '#ef4444' }}>Danger Zone</p>
              <p style={S.sectionSub}>Irreversible and destructive actions.</p>
            </div>
          </div>
          <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <p style={S.label}>Purge Activity Logs</p>
              <p style={S.sub}>Permanently delete all activity log entries. This cannot be undone.</p>
            </div>
            <button
              onClick={async () => {
                if (!window.confirm('Delete all activity logs? This is irreversible.')) return;
                try {
                  await api.delete('/admin/activity');
                  alert('Activity logs purged.');
                } catch {
                  alert('Failed to purge logs.');
                }
              }}
              style={{ padding: '9px 18px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Purge Logs
            </button>
          </div>
        </div>

      </div>
      <style>{`select option{background:#0a0a0a;color:#fff;}input:focus,select:focus{border-color:#E53E3E!important;box-shadow:0 0 0 3px rgba(229,62,62,0.1);outline:none;}`}</style>
    </div>
  );
};
