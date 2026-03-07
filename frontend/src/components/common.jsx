import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const NavBar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-950 border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <Link
                to="/"
                className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 cursor-pointer hover:opacity-80 transition text-glow"
              >
                CVEarity
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive('/')
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive('/dashboard')
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      isActive('/admin')
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <div className="px-3 py-2 text-sm text-gray-300">
                  {user?.username || 'Account'}
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-cyan-300 font-medium hover:text-white transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-cyan-500/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">CVEarity</h3>
            <p className="text-gray-400 text-sm">Vulnerability intelligence platform for modern security teams.</p>
          </div>
          <div>
            <h4 className="text-cyan-400 font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition">Features</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Pricing</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-cyan-400 font-semibold mb-4">Developers</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition">Documentation</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">API Reference</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-cyan-400 font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition">About</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Contact</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cyan-500/10 pt-8">
          <p className="text-gray-400 text-sm text-center">
            (c) 2024 CVEarity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export const GlassmorphCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-800/40 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition ${className}`}>
      {children}
    </div>
  );
};

export const SeverityBadge = ({ severity }) => {
  const colors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/50',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-green-500/20 text-green-400 border-green-500/50'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[severity] || colors.low}`}>
      {severity.toUpperCase()}
    </span>
  );
};

export const LoadingSkeleton = ({ className = '', count = 5 }) => {
  if (className) {
    return (
      <div className={`bg-slate-700/50 rounded-lg animate-pulse ${className}`}></div>
    );
  }

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
};

export const ErrorAlert = ({ message }) => {
  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
      <span className="font-semibold">Error:</span> {message}
    </div>
  );
};
