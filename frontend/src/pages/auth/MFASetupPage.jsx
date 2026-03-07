import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export const MFASetupPage = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkMFA(); }, []);

  const checkMFA = async () => {
    try {
      const r = await api.get('/auth/profile');
      setMfaEnabled(!!r.data.data?.user?.mfa_enabled);
    } catch (e) {}
    setLoading(false);
  };

  const setupMFA = async () => {
    try {
      const r = await api.post('/auth/mfa/setup');
      setSetupData(r.data.data);
      setStatus('');
    } catch (e) { setStatus('Failed to generate MFA setup'); }
  };

  const verifyMFA = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/auth/mfa/verify', { code: verifyCode });
      if (r.data.success) { setMfaEnabled(true); setSetupData(null); setVerifyCode(''); setStatus('✅ MFA enabled successfully!'); }
      else setStatus('❌ Invalid code, try again');
    } catch (e) { setStatus('❌ Verification failed'); }
  };

  const disableMFA = async () => {
    try {
      await api.post('/auth/mfa/disable');
      setMfaEnabled(false);
      setStatus('MFA disabled');
    } catch (e) { setStatus('Failed to disable MFA'); }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Two-Factor Authentication
        </h1>
        <p className="text-slate-400 mb-8">Secure your account with TOTP-based 2FA</p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">MFA Status</h3>
              <p className={`text-sm ${mfaEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
                {mfaEnabled ? '🔒 Enabled — Your account is protected' : '⚠️ Disabled — Enable for better security'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${mfaEnabled ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          </div>

          {!mfaEnabled && !setupData && (
            <button onClick={setupMFA} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg py-3 font-medium transition-colors">
              Setup MFA
            </button>
          )}

          {setupData && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-3">Scan this QR code with Google Authenticator or Authy:</p>
                {setupData.qrCode ? (
                  <img src={setupData.qrCode} alt="MFA QR Code" className="mx-auto w-48 h-48 bg-white rounded-lg p-2" />
                ) : (
                  <div className="mx-auto w-48 h-48 bg-slate-700 rounded-lg flex items-center justify-center">
                    <p className="text-slate-400 text-sm">QR Code</p>
                  </div>
                )}
                <p className="text-slate-500 text-xs mt-3">Manual key: <code className="text-cyan-400">{setupData.secret}</code></p>
              </div>
              <form onSubmit={verifyMFA} className="flex gap-3">
                <input type="text" placeholder="Enter 6-digit code" value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-center text-lg tracking-widest placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  maxLength={6} pattern="\d{6}" required />
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2 font-medium transition-colors">Verify</button>
              </form>
            </div>
          )}

          {mfaEnabled && (
            <button onClick={disableMFA} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg py-3 font-medium transition-colors mt-4">
              Disable MFA
            </button>
          )}

          {status && <p className="mt-4 text-center text-sm text-slate-300">{status}</p>}
        </div>
      </div>
    </div>
  );
};
