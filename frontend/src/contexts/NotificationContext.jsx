/**
 * Notification context and provider.
 *
 * Provides a toast notification system and polls the backend for unread
 * vulnerability alerts when the user is authenticated.
 *
 * @module contexts/NotificationContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

/**
 * Hook to access toast notification helpers and the unread alert count.
 *
 * @returns {{ notify: Object, unreadAlerts: number, addToast: Function, removeToast: Function }}
 */
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

let idCounter = 0;

/**
 * Provider component that renders a fixed-position toast container and polls
 * for new vulnerability alerts every 60 seconds.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const { isAuthenticated } = useAuth();
  const pollRef = useRef(null);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const notify = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    critical: (msg, dur) => addToast(msg, 'critical', dur || 8000),
  };

  // Poll for new alerts every 60s when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const pollAlerts = async () => {
      try {
        const r = await api.get('/watchlist/alerts');
        const count = r.data.data?.unreadCount || 0;
        if (count > unreadAlerts && unreadAlerts !== null) {
          notify.warning(`You have ${count} unread vulnerability alert${count > 1 ? 's' : ''}`, 6000);
        }
        setUnreadAlerts(count);
      } catch (e) {}
    };
    pollAlerts();
    pollRef.current = setInterval(pollAlerts, 60000);
    return () => clearInterval(pollRef.current);
  }, [isAuthenticated]);

  const typeStyles = {
    success: { bg: 'bg-green-500/20 border-green-500/40', icon: '✅', text: 'text-green-300' },
    error:   { bg: 'bg-red-500/20 border-red-500/40',   icon: '❌', text: 'text-red-300' },
    warning: { bg: 'bg-yellow-500/20 border-yellow-500/40', icon: '⚠️', text: 'text-yellow-300' },
    info:    { bg: 'bg-cyan-500/20 border-cyan-500/40', icon: 'ℹ️', text: 'text-cyan-300' },
    critical: { bg: 'bg-red-600/30 border-red-500/60', icon: '🚨', text: 'text-red-200' },
  };

  return (
    <NotificationContext.Provider value={{ notify, unreadAlerts, addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          const style = typeStyles[toast.type] || typeStyles.info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-lg shadow-2xl
                ${style.bg} transition-all duration-300
                ${toast.exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}
            >
              <span className="text-lg flex-shrink-0">{style.icon}</span>
              <p className={`text-sm flex-1 ${style.text}`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors text-lg leading-none"
              >×</button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};
