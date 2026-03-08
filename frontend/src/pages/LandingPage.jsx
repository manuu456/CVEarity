import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SeverityBadge } from '../components/common';
import { getCVEs, getStatistics } from '../services/api';
import { SecurityNewsFeed } from '../components/SecurityNewsFeed';

const TargetIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <circle cx="40" cy="40" r="38" stroke="#E53E3E" strokeWidth="1.5" opacity="0.25"/>
    <circle cx="40" cy="40" r="28" stroke="#E53E3E" strokeWidth="1.5" opacity="0.45"/>
    <circle cx="40" cy="40" r="18" stroke="#E53E3E" strokeWidth="1.5" opacity="0.7"/>
    <circle cx="40" cy="40" r="7"  fill="#E53E3E"/>
    <line x1="40" y1="2"  x2="40" y2="18" stroke="#E53E3E" strokeWidth="1.5" opacity="0.5"/>
    <line x1="40" y1="62" x2="40" y2="78" stroke="#E53E3E" strokeWidth="1.5" opacity="0.5"/>
    <line x1="2"  y1="40" x2="18" y2="40" stroke="#E53E3E" strokeWidth="1.5" opacity="0.5"/>
    <line x1="62" y1="40" x2="78" y2="40" stroke="#E53E3E" strokeWidth="1.5" opacity="0.5"/>
  </svg>
);

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [recentCVEs, setRecentCVEs] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cveData, statsData] = await Promise.all([getCVEs(), getStatistics()]);
        setRecentCVEs((cveData.data || []).slice(0, 3));
        setStats(statsData.data || null);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handleLaunch = () => navigate(isAuthenticated ? '/dashboard' : '/login');

  return (
    <main style={{ background: '#050505', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-radial pointer-events-none" />
        <div className="absolute inset-0 bg-grid pointer-events-none" style={{ opacity: 0.5 }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          {/* Target / crosshair icon */}
          <div className="flex justify-center mb-10">
            <div className="w-24 h-24" style={{ filter: 'drop-shadow(0 0 28px rgba(229,62,62,0.55))' }}>
              <TargetIcon />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">
            Welcome to{' '}
            <span style={{ color: '#E53E3E', textShadow: '0 0 40px rgba(229,62,62,0.45)' }}>
              CVEarity
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The most advanced vulnerability intelligence platform designed for security engineers,
            penetration testers, and enterprise security teams worldwide.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLaunch}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: '#E53E3E', boxShadow: '0 0 28px rgba(229,62,62,0.45)' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
              {isAuthenticated ? 'Go to Dashboard' : 'Launch Platform'}
            </button>

            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold rounded-lg border-2 transition-all duration-200 hover:bg-green-500/10 active:scale-95"
                style={{ color: '#22C55E', borderColor: '#22C55E' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Start Free Trial
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section className="border-y py-14" style={{ background: '#080808', borderColor: '#181818' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: stats?.totalCVEs || '250K+', label: 'CVEs Tracked',       color: '#E53E3E' },
              { value: stats?.bySeverity?.critical || '18K+', label: 'Critical Severity', color: '#E53E3E' },
              { value: stats?.bySeverity?.high || '42K+',     label: 'High Severity',     color: '#F97316' },
              { value: '99.9%',                               label: 'Uptime',            color: '#22C55E' }
            ].map((s, i) => (
              <div key={i}>
                <div className="text-4xl sm:text-5xl font-black mb-1.5 tracking-tight"
                  style={{ color: s.color, textShadow: `0 0 24px ${s.color}44` }}>
                  {s.value}
                </div>
                <div className="text-gray-600 text-[11px] uppercase tracking-widest font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT CVEs ───────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-500/25 mb-5"
              style={{ background: 'rgba(229,62,62,0.06)' }}>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>
              LIVE THREATS
            </div>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Recently Identified Risks</h2>
            <p className="text-gray-500 text-lg">Newly published vulnerabilities requiring immediate attention.</p>
          </div>

          <div className="space-y-3">
            {recentCVEs.length > 0 ? recentCVEs.map((cve, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row justify-between items-center gap-5 p-6 rounded-xl border cursor-pointer group"
                style={{ background: '#0a0a0a', borderColor: '#1c1c1c', transition: 'border-color 0.2s, background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(229,62,62,0.28)'; e.currentTarget.style.background = '#0d0d0d'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1c1c1c'; e.currentTarget.style.background = '#0a0a0a'; }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-black text-white text-lg tracking-tight">{cve.cveId}</span>
                    <SeverityBadge severity={cve.severity} />
                  </div>
                  <h3 className="text-gray-300 font-medium mb-3 leading-snug">{cve.title}</h3>
                  <div className="flex gap-6">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      Score: <span className="text-gray-400">{cve.severityScore?.toFixed(1) || 'N/A'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      Published: <span className="text-gray-400">{cve.publishedDate}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/cve/${cve.cveId}`)}
                  className="px-6 py-2.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap"
                  style={{ color: '#E53E3E', borderColor: 'rgba(229,62,62,0.3)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,62,62,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  View Details →
                </button>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-600 text-sm">Loading vulnerabilities...</div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link to="/threats" className="text-red-400 hover:text-red-300 text-sm font-bold transition-colors">
              View Full Threat Database →
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIVE INTEL FEED ───────────────────────────────── */}
      <section className="py-24 border-t" style={{ background: '#080808', borderColor: '#181818' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3 space-y-6 lg:sticky top-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-500/25"
                style={{ background: 'rgba(229,62,62,0.06)' }}>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>
                LIVE INTEL
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                Real-Time Threat<br/>Surface Monitoring
              </h2>
              <p className="text-gray-400 leading-relaxed text-sm">
                Unified feeds from NVD, The Hacker News, and Exploit-DB providing a real-time view of the modern threat landscape.
              </p>
              <ul className="space-y-3 pt-2">
                {['Daily Exploit Database Sync', 'Real-time Cybersecurity News', 'Automated Risk Prioritization'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#E53E3E', boxShadow: '0 0 8px rgba(229,62,62,0.6)' }}/>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={handleLaunch}
                className="px-8 py-3 text-sm font-bold rounded-lg border-2 transition-all hover:bg-green-500/10"
                style={{ color: '#22C55E', borderColor: 'rgba(34,197,94,0.5)' }}>
                Access Full Feed →
              </button>
            </div>

            <div className="lg:w-2/3 space-y-4">
              <div className="p-5 rounded-xl border" style={{ background: '#0a0a0a', borderColor: '#1c1c1c' }}>
                <h4 className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-5">Latest Cybersecurity Intel</h4>
                <SecurityNewsFeed defaultTab="news" maxItems={3} compact={true} />
              </div>
              <div className="p-5 rounded-xl border" style={{ background: '#0a0a0a', borderColor: '#1c1c1c' }}>
                <h4 className="font-black text-[10px] uppercase tracking-widest mb-5" style={{ color: '#E53E3E' }}>Functional Exploits Reported</h4>
                <SecurityNewsFeed defaultTab="exploits" maxItems={3} compact={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Platform Capabilities</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-16">
            Enterprise-grade tools for vulnerability management and infrastructure security.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Intel Dashboard',  desc: 'Centralized metrics for real-time vulnerability tracking.',  icon: '◎' },
              { title: 'Real-time Alerts', desc: 'Instant notifications on critical and emerging threats.',     icon: '⚡' },
              { title: 'Asset Matching',   desc: 'Automatically map CVEs to your infrastructure assets.',       icon: '⬡' },
              { title: 'API Integration',  desc: 'Secure endpoints for automation and SIEM workflows.',         icon: '</>' }
            ].map((f, i) => (
              <div
                key={i}
                className="p-7 rounded-xl border text-left transition-all duration-200"
                style={{ background: '#0a0a0a', borderColor: '#1c1c1c' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(229,62,62,0.28)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1c1c1c'; }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-base mb-5"
                  style={{ background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.2)', color: '#E53E3E' }}>
                  {f.icon}
                </div>
                <h3 className="font-black text-white text-base mb-2 tracking-tight">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative text-center rounded-2xl border overflow-hidden p-14"
            style={{
              background: 'linear-gradient(135deg,#0d0d0d 0%,#100909 100%)',
              borderColor: 'rgba(229,62,62,0.2)'
            }}>
            <div className="absolute inset-0 hero-radial pointer-events-none" style={{ opacity: 0.6 }}/>
            <h2 className="relative text-4xl font-black text-white mb-5 tracking-tight">
              Secure Your Infrastructure<br/>at Scale.
            </h2>
            <p className="relative text-gray-400 text-lg max-w-xl mx-auto mb-10">
              Join security teams worldwide that rely on CVEarity for their vulnerability management lifecycle.
            </p>
            <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/register"
                    className="px-10 py-3.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90"
                    style={{ background: '#E53E3E', boxShadow: '0 0 24px rgba(229,62,62,0.4)' }}>
                    Get Started Free
                  </Link>
                  <Link to="/login"
                    className="px-10 py-3.5 text-sm font-bold text-gray-300 border border-white/15 rounded-lg hover:border-white/35 hover:text-white transition-all">
                    Sign In
                  </Link>
                </>
              ) : (
                <button onClick={() => navigate('/dashboard')}
                  className="px-10 py-3.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90"
                  style={{ background: '#E53E3E', boxShadow: '0 0 24px rgba(229,62,62,0.4)' }}>
                  Open Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};
