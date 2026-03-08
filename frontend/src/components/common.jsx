import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LiveSearch } from './LiveSearch';

export const NavBar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showTools, setShowTools] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  const closeAll = () => { setShowTools(false); setShowAccount(false); setShowMobile(false); };
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 text-sm font-semibold transition-all duration-200 rounded ${
      isActive(path) ? 'text-red-500' : 'text-gray-400 hover:text-white'
    }`;

  const mobileLink = (path, label) => (
    <Link to={path} onClick={closeAll}
      className={`block px-4 py-3 text-sm font-semibold border-b border-white/5 transition-colors ${isActive(path) ? 'text-red-400' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(5,5,5,0.97)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center"
              style={{ boxShadow: '0 0 12px rgba(229,62,62,0.5)' }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-500" fill="currentColor">
                <circle cx="12" cy="12" r="2"/>
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
            </div>
            <Link to="/" className="text-xl font-black tracking-tight text-white hover:text-red-400 transition-colors">
              CVEarity
            </Link>
          </div>

          {/* Center Nav Links — desktop only */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
            <Link to="/threats" className={linkClass('/threats')}>Threats</Link>
            <Link to="/learn" className={linkClass('/learn')}>Learn</Link>

            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowTools(!showTools); setShowAccount(false); }}
                className="px-3 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1 rounded"
              >
                Tools
                <svg className="w-3 h-3 opacity-50 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
                </svg>
              </button>
              {showTools && (
                <div
                  className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-white/10 shadow-2xl py-2 z-50"
                  style={{ background: '#111' }}
                  onMouseLeave={() => setShowTools(false)}
                >
                  <Link to="/live" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors" onClick={() => setShowTools(false)}>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>Live Feed
                  </Link>
                  <Link to="/compare" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowTools(false)}>CVE Compare</Link>
                  <div className="border-t border-white/10 my-1"/>
                  <Link to="/cvss-calculator" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowTools(false)}>CVSS Calculator</Link>
                  <Link to="/risk" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowTools(false)}>Risk Dashboard</Link>
                  <Link to="/watchlist" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowTools(false)}>Watchlist</Link>
                  <Link to="/assets" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowTools(false)}>Asset Inventory</Link>
                  <Link to="/developer" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowTools(false)}>Developer API</Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search — desktop */}
            <div className="hidden md:block">
              {showSearch ? (
                <div className="w-64"><LiveSearch onClose={() => setShowSearch(false)} /></div>
              ) : (
                <button onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-500 hover:text-white transition-colors" title="Search CVEs">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors">
                      Admin
                    </Link>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => { setShowAccount(!showAccount); setShowTools(false); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white border border-white/10 rounded-lg hover:border-white/25 transition-colors"
                    >
                      <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">
                        {(user?.username || 'U')[0].toUpperCase()}
                      </span>
                      {user?.username || 'Account'}
                      <svg className="w-3 h-3 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
                      </svg>
                    </button>
                    {showAccount && (
                      <div
                        className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-white/10 shadow-2xl py-2 z-50"
                        style={{ background: '#111' }}
                        onMouseLeave={() => setShowAccount(false)}
                      >
                        <Link to="/settings" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowAccount(false)}>Account Settings</Link>
                        <Link to="/mfa" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowAccount(false)}>MFA Settings</Link>
                        <Link to="/developer" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowAccount(false)}>API Keys</Link>
                        <div className="border-t border-white/10 my-1"/>
                        <button
                          onClick={() => { logout(); setShowAccount(false); }}
                          className="block w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-1.5 text-sm font-bold text-white border border-white/20 rounded-lg hover:border-red-500/50 hover:text-red-400 transition-colors">Login</Link>
                  <Link to="/register" className="px-4 py-1.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors" style={{ boxShadow: '0 0 14px rgba(229,62,62,0.35)' }}>Sign Up</Link>
                </>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowMobile(!showMobile)}
              aria-label="Toggle menu"
            >
              {showMobile ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {showMobile && (
        <div className="md:hidden border-t border-white/5" style={{ background: '#0a0a0a' }}>
          <div className="px-2 py-2">
            {mobileLink('/', 'Home')}
            {mobileLink('/dashboard', 'Dashboard')}
            {mobileLink('/threats', 'Threats')}
            {mobileLink('/learn', 'Learn')}
            <div className="px-4 py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest mt-2">Tools</div>
            {mobileLink('/live', '⚡ Live Feed')}
            {mobileLink('/compare', 'CVE Compare')}
            {mobileLink('/cvss-calculator', 'CVSS Calculator')}
            {mobileLink('/risk', 'Risk Dashboard')}
            {mobileLink('/watchlist', 'Watchlist')}
            {mobileLink('/assets', 'Asset Inventory')}
            {mobileLink('/developer', 'Developer API')}
            <div className="border-t border-white/5 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Account</div>
                  {mobileLink('/settings', 'Account Settings')}
                  {mobileLink('/mfa', 'MFA Settings')}
                  {user?.role === 'admin' && mobileLink('/admin', '🔴 Admin Panel')}
                  <button
                    onClick={() => { logout(); closeAll(); }}
                    className="block w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors border-b border-white/5"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-4 py-3">
                  <Link to="/login" onClick={closeAll} className="flex-1 text-center py-2.5 text-sm font-bold text-white border border-white/20 rounded-lg">Login</Link>
                  <Link to="/register" onClick={closeAll} className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t mt-20" style={{ background: '#050505', borderColor: '#1a1a1a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full border-2 border-red-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-red-500" fill="currentColor">
                  <circle cx="12" cy="12" r="2"/>
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
              </div>
              <span className="text-lg font-black text-white">CVEarity</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">Vulnerability intelligence platform for modern security teams.</p>
          </div>
          <div>
            <h4 className="text-red-500 font-bold uppercase tracking-wider text-[10px] mb-5">Product</h4>
            <ul className="space-y-3 text-gray-500 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-500 font-bold uppercase tracking-wider text-[10px] mb-5">Developers</h4>
            <ul className="space-y-3 text-gray-500 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-500 font-bold uppercase tracking-wider text-[10px] mb-5">Company</h4>
            <ul className="space-y-3 text-gray-500 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: '#1a1a1a' }}>
          <p className="text-gray-600 text-xs">&copy; 2025 CVEarity. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-white transition-colors text-xs">Terms</a>
            <a href="#" className="text-gray-600 hover:text-white transition-colors text-xs">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-white transition-colors text-xs">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const GlassmorphCard = ({ children, className = '' }) => (
  <div className={`tenable-card transition-theme ${className}`}>{children}</div>
);

export const SeverityBadge = ({ severity }) => {
  const colors = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/30',
    high:     'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    low:      'bg-green-500/10 text-green-400 border-green-500/30'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black border tracking-tight ${colors[severity] || colors.low}`}>
      {severity}
    </span>
  );
};

export const LoadingSkeleton = ({ className = '', count = 5 }) => {
  if (className) {
    return <div className={`rounded animate-pulse ${className}`} style={{ background: '#1a1a1a' }} />;
  }
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-12 rounded animate-pulse" style={{ background: '#1a1a1a' }} />
      ))}
    </div>
  );
};

export const ErrorAlert = ({ message }) => (
  <div className="bg-red-500/10 border-l-4 border-red-500 rounded p-4 text-red-400 text-sm">
    <span className="font-bold">Error:</span> {message}
  </div>
);
