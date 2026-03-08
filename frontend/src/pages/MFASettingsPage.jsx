import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const MFASettingsPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState('idle'); // idle | setup | verify
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  const mfaEnabled = !!user?.mfa_enabled;

  const startSetup = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/auth/mfa/setup');
      setSecret(res.data.data.secret);
      setOtpauthUrl(res.data.data.otpauthUrl);
      setStep('verify');
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to start MFA setup' });
    }
    setLoading(false);
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setMessage({ type: 'error', text: 'Enter a 6-digit code' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/auth/mfa/verify', { code });
      setMessage({ type: 'success', text: 'MFA enabled successfully. Your account is now protected.' });
      setStep('idle');
      setCode('');
      // Refresh user so mfa_enabled updates
      window.location.reload();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Verification failed' });
    }
    setLoading(false);
  };

  const disableMFA = async () => {
    if (!window.confirm('Disable MFA? Your account will be less secure.')) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/auth/mfa/disable');
      setMessage({ type: 'success', text: 'MFA disabled.' });
      window.location.reload();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to disable MFA' });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', paddingTop: '96px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              MFA Settings
            </h1>
            <span style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900',
              textTransform: 'uppercase', letterSpacing: '0.15em',
              background: mfaEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(229,62,62,0.15)',
              color: mfaEnabled ? '#22c55e' : '#ef4444',
              border: `1px solid ${mfaEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(229,62,62,0.3)'}`
            }}>
              {mfaEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Multi-factor authentication adds an extra layer of security to your account.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '24px',
            background: message.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(229,62,62,0.08)',
            border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(229,62,62,0.25)'}`,
            borderLeft: `3px solid ${message.type === 'success' ? '#22c55e' : '#E53E3E'}`
          }}>
            <p style={{ color: message.type === 'success' ? '#4ade80' : '#f87171', fontSize: '13px', fontWeight: '700', margin: 0 }}>
              {message.text}
            </p>
          </div>
        )}

        {/* Main Card */}
        <div style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #1f1f1f' }}>
            <p style={{ fontSize: '11px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 4px' }}>
              Authenticator App
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
              Use an authenticator app (Google Authenticator, Authy, etc.) to generate time-based one-time passwords.
            </p>
          </div>

          <div style={{ padding: '28px' }}>
            {/* Status row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: step === 'verify' ? '28px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: mfaEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(229,62,62,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {mfaEnabled ? (
                    <svg width="20" height="20" fill="none" stroke="#22c55e" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008H12v-.008z"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '14px', margin: 0 }}>
                    {mfaEnabled ? 'MFA is active' : 'MFA is not enabled'}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>
                    {mfaEnabled ? 'Your account requires a 6-digit code on login' : 'Enable to require a code on every login'}
                  </p>
                </div>
              </div>

              {step === 'idle' && (
                mfaEnabled ? (
                  <button
                    onClick={disableMFA}
                    disabled={loading}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer', border: '1px solid rgba(229,62,62,0.4)',
                      background: 'rgba(229,62,62,0.08)', color: '#ef4444', transition: 'all 0.2s'
                    }}
                  >
                    Disable MFA
                  </button>
                ) : (
                  <button
                    onClick={startSetup}
                    disabled={loading}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                      background: '#E53E3E', color: '#ffffff', boxShadow: '0 0 16px rgba(229,62,62,0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {loading ? 'Setting up...' : 'Enable MFA'}
                  </button>
                )
              )}
            </div>

            {/* Setup flow */}
            {step === 'verify' && (
              <div>
                {/* Secret key */}
                <div style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 10px' }}>
                    Step 1 — Add to authenticator app
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 12px' }}>
                    Open your authenticator app and add a new account using this secret key:
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <code style={{
                      flex: 1, padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a',
                      borderRadius: '6px', color: '#22c55e', fontFamily: 'monospace', fontSize: '15px',
                      letterSpacing: '0.15em', fontWeight: '700'
                    }}>
                      {secret}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(secret); }}
                      style={{
                        padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a',
                        borderRadius: '6px', color: '#9ca3af', cursor: 'pointer', fontSize: '12px',
                        fontWeight: '700', whiteSpace: 'nowrap'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  {otpauthUrl && (
                    <p style={{ color: '#4b5563', fontSize: '11px', margin: '10px 0 0' }}>
                      Or scan the QR code if your app supports otpauth:// URIs.
                    </p>
                  )}
                </div>

                {/* Verify code */}
                <div style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '16px 20px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 10px' }}>
                    Step 2 — Verify with a code
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 14px' }}>
                    Enter the 6-digit code from your authenticator app to confirm setup:
                  </p>
                  <form onSubmit={verifyCode} style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      style={{
                        flex: 1, padding: '11px 16px', background: '#111', border: '1px solid #2a2a2a',
                        borderRadius: '8px', color: '#ffffff', fontSize: '20px', fontWeight: '700',
                        letterSpacing: '0.3em', textAlign: 'center', outline: 'none', fontFamily: 'monospace'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loading || code.length !== 6}
                      style={{
                        padding: '11px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                        cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                        background: code.length === 6 ? '#E53E3E' : '#1a1a1a',
                        color: code.length === 6 ? '#ffffff' : '#4b5563',
                        border: 'none', transition: 'all 0.2s',
                        boxShadow: code.length === 6 ? '0 0 16px rgba(229,62,62,0.3)' : 'none'
                      }}
                    >
                      {loading ? 'Verifying...' : 'Activate'}
                    </button>
                  </form>
                </div>

                <button
                  onClick={() => { setStep('idle'); setCode(''); setSecret(''); setMessage(null); }}
                  style={{ marginTop: '14px', background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info box */}
        <div style={{ marginTop: '20px', background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '16px 20px' }}>
          <p style={{ fontSize: '10px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 6px' }}>
            Supported Apps
          </p>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
            Google Authenticator · Microsoft Authenticator · Authy · 1Password · Bitwarden
          </p>
        </div>

      </div>
      <style>{`input::placeholder { color: #3f3f46; } input:focus { border-color: #E53E3E !important; box-shadow: 0 0 0 3px rgba(229,62,62,0.12); }`}</style>
    </div>
  );
};
