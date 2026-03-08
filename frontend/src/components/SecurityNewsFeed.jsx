/**
 * SecurityNewsFeed.jsx
 * Fetches news/exploits via the backend proxy, with a direct rss2json fallback
 * so it works even when the backend server is not running.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const HN_RSS  = 'https://feeds.feedburner.com/TheHackersNews';
const EDB_RSS = 'https://www.exploit-db.com/rss.xml';

// Fetch RSS directly in the browser via a CORS proxy and parse with DOMParser
const fetchRSSDirectly = async (rssUrl, maxItems = 10) => {
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item')).slice(0, maxItems);
  return items.map(el => {
    const get = (tag) => el.querySelector(tag)?.textContent?.trim() || '';
    return {
      id:          get('guid') || get('link'),
      title:       get('title'),
      link:        get('link') || get('guid'),
      description: get('description').replace(/<[^>]+>/g, '').substring(0, 220),
      pubDate:     get('pubDate'),
      categories:  Array.from(el.querySelectorAll('category')).map(c => c.textContent.trim())
    };
  }).filter(i => i.title && i.link);
};

const EXPLOIT_TYPE_COLORS = {
  RCE:             { bg: 'rgba(239,68,68,0.15)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  'Buffer Overflow':{ bg: 'rgba(239,68,68,0.1)',   text: '#fca5a5', border: 'rgba(239,68,68,0.2)' },
  Local:           { bg: 'rgba(249,115,22,0.15)',  text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  Remote:          { bg: 'rgba(168,85,247,0.15)',  text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  DoS:             { bg: 'rgba(234,179,8,0.15)',   text: '#facc15', border: 'rgba(234,179,8,0.3)' },
  Injection:       { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  XSS:             { bg: 'rgba(236,72,153,0.15)',  text: '#f472b6', border: 'rgba(236,72,153,0.3)' },
};
const defaultColor = { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.3)' };
const getColor = (type) => EXPLOIT_TYPE_COLORS[type] || defaultColor;

const guessExploitType = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('rce') || t.includes('remote code')) return 'RCE';
  if (t.includes('local') || t.includes('privilege')) return 'Local';
  if (t.includes('dos') || t.includes('denial')) return 'DoS';
  if (t.includes('sql') || t.includes('injection')) return 'Injection';
  if (t.includes('xss') || t.includes('cross-site')) return 'XSS';
  if (t.includes('buffer') || t.includes('overflow')) return 'Buffer Overflow';
  return 'Remote';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const NewsItem = ({ item }) => (
  <a href={item.link} target="_blank" rel="noopener noreferrer"
    style={{ display: 'block', textDecoration: 'none' }}>
    <div style={{
      display: 'flex', gap: '12px', padding: '10px 12px', borderRadius: '10px',
      border: '1px solid transparent', transition: 'all 0.15s',
      cursor: 'pointer'
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      <div style={{
        flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px',
        background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
      }}>📰</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500', lineHeight: '1.4', margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {item.categories?.[0] && (
            <span style={{ fontSize: '11px', padding: '1px 6px', background: 'rgba(6,182,212,0.1)', color: '#22d3ee', borderRadius: '4px', fontWeight: '500' }}>
              {item.categories[0]}
            </span>
          )}
          <span style={{ fontSize: '11px', color: '#475569' }}>{timeAgo(item.pubDate)}</span>
        </div>
        {item.description && (
          <p style={{ color: '#64748b', fontSize: '11px', margin: '4px 0 0', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.description.replace(/<[^>]+>/g, '').substring(0, 140)}
          </p>
        )}
      </div>
    </div>
  </a>
);

const ExploitItem = ({ item }) => {
  const exploitType = item.exploitType || guessExploitType(item.title);
  const cveMatch = (item.title + ' ' + (item.description || '')).match(/CVE-\d{4}-\d+/i);
  const edbMatch = (item.link || '').match(/\/exploits\/(\d+)/);
  const colors = getColor(exploitType);

  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer"
      style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        display: 'flex', gap: '12px', padding: '10px 12px', borderRadius: '10px',
        background: colors.bg, border: `1px solid ${colors.border}`, transition: 'all 0.15s',
        cursor: 'pointer', marginBottom: '2px'
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        <div style={{
          flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px',
          background: colors.bg, border: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px'
        }}>💥</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500', lineHeight: '1.4', margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', padding: '1px 6px', background: colors.bg, color: colors.text, borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {exploitType}
            </span>
            {cveMatch && (
              <span style={{ fontSize: '10px', padding: '1px 6px', background: 'rgba(234,179,8,0.1)', color: '#fbbf24', borderRadius: '4px', fontFamily: 'monospace', border: '1px solid rgba(234,179,8,0.2)' }}>
                {cveMatch[0].toUpperCase()}
              </span>
            )}
            {edbMatch && (
              <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace' }}>EDB-{edbMatch[1]}</span>
            )}
            <span style={{ fontSize: '11px', color: '#475569', marginLeft: 'auto' }}>{timeAgo(item.pubDate)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SecurityNewsFeed = ({
  maxItems = 10,
  compact = false,
  autoRefresh = true,
  defaultTab = 'news',
  className = ''
}) => {
  const [activeTab, setActiveTab]       = useState(defaultTab);
  const [newsItems, setNewsItems]       = useState([]);
  const [exploitItems, setExploitItems] = useState([]);
  const [loadingNews, setLoadingNews]   = useState(true);
  const [loadingExploits, setLoadingExploits] = useState(true);
  const [errorNews, setErrorNews]       = useState(null);
  const [errorExploits, setErrorExploits] = useState(null);
  const [lastFetch, setLastFetch]       = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchNews = useCallback(async () => {
    setLoadingNews(true);
    setErrorNews(null);
    try {
      // 1. Backend proxy (works when server is running + Vite proxy configured)
      const res = await api.get('/news/hacker-news');
      setNewsItems((res.data.data || []).slice(0, maxItems));
    } catch {
      try {
        // 2. Direct browser fetch via corsproxy.io (no backend needed)
        const items = await fetchRSSDirectly(HN_RSS, maxItems);
        setNewsItems(items);
      } catch {
        setErrorNews('Unable to load news feed. Check your connection.');
      }
    } finally {
      setLoadingNews(false);
    }
  }, [maxItems]);

  const fetchExploits = useCallback(async () => {
    setLoadingExploits(true);
    setErrorExploits(null);
    try {
      // 1. Backend proxy
      const res = await api.get('/news/exploits');
      setExploitItems((res.data.data || []).slice(0, maxItems));
    } catch {
      try {
        // 2. Direct browser fetch via corsproxy.io
        const items = await fetchRSSDirectly(EDB_RSS, maxItems);
        setExploitItems(items);
      } catch {
        setErrorExploits('Unable to load exploit feed. Check your connection.');
      }
    } finally {
      setLoadingExploits(false);
    }
  }, [maxItems]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchNews(), fetchExploits()]);
    setLastFetch(new Date());
    setIsRefreshing(false);
  }, [fetchNews, fetchExploits]);

  useEffect(() => { refreshAll(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    intervalRef.current = setInterval(refreshAll, 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, refreshAll]);

  const isLoading    = activeTab === 'news' ? loadingNews : loadingExploits;
  const currentError = activeTab === 'news' ? errorNews   : errorExploits;
  const displayItems = activeTab === 'news' ? newsItems    : exploitItems;
  const itemCount    = compact ? Math.min(maxItems, 5) : maxItems;

  const cardStyle = {
    background: 'rgba(15,15,15,0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid #1f1f1f',
    borderRadius: '16px',
    overflow: 'hidden'
  };

  const tabActive = (tab) => ({
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
    transition: 'all 0.2s',
    ...(activeTab === tab
      ? tab === 'news'
        ? { background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.25)' }
        : { background: 'rgba(229,62,62,0.15)', color: '#f87171', border: '1px solid rgba(229,62,62,0.25)' }
      : { background: 'transparent', color: '#6b7280', border: '1px solid transparent' })
  });

  return (
    <div style={cardStyle} className={className}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '8px', height: '8px' }}>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
              background: activeTab === 'news' ? '#22d3ee' : '#E53E3E', opacity: 0.6
            }}/>
            <span style={{ position: 'relative', display: 'block', width: '8px', height: '8px', borderRadius: '50%', background: activeTab === 'news' ? '#22d3ee' : '#E53E3E' }}/>
          </div>
          <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '14px' }}>
            {activeTab === 'news' ? 'Cyber News' : 'Live Exploits'}
          </span>
          <span style={{ color: '#4b5563', fontSize: '11px' }}>
            {lastFetch ? `Updated ${timeAgo(lastFetch.toISOString())}` : 'Loading…'}
          </span>
        </div>
        <button onClick={refreshAll} disabled={isRefreshing} title="Refresh"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: '4px', borderRadius: '6px', display: 'flex' }}>
          <svg className={isRefreshing ? 'animate-spin' : ''} style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', padding: '0 18px 10px' }}>
        <button onClick={() => setActiveTab('news')} style={tabActive('news')}>
          <span>📰</span> The Hacker News
          {newsItems.length > 0 && (
            <span style={{ padding: '1px 6px', borderRadius: '999px', fontSize: '10px', background: activeTab === 'news' ? 'rgba(6,182,212,0.2)' : '#1f1f1f', color: activeTab === 'news' ? '#22d3ee' : '#6b7280' }}>
              {newsItems.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('exploits')} style={tabActive('exploits')}>
          <span>💥</span> Exploit-DB
          {exploitItems.length > 0 && (
            <span style={{ padding: '1px 6px', borderRadius: '999px', fontSize: '10px', background: activeTab === 'exploits' ? 'rgba(229,62,62,0.2)' : '#1f1f1f', color: activeTab === 'exploits' ? '#f87171' : '#6b7280' }}>
              {exploitItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Source strip */}
      <div style={{ margin: '0 18px 10px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1f1f1f', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#4b5563' }}>
        {activeTab === 'news' ? (
          <>
            <span>Source: <a href="https://thehackernews.com" target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'none' }}>thehackernews.com</a></span>
            <span>via RSS · feedburner</span>
          </>
        ) : (
          <>
            <span>Source: <a href="https://www.exploit-db.com" target="_blank" rel="noopener noreferrer" style={{ color: '#f87171', textDecoration: 'none' }}>exploit-db.com</a></span>
            <span>by Offensive Security</span>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '0 10px 10px', maxHeight: compact ? '320px' : '520px', overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 8px' }}>
            {[...Array(compact ? 3 : 5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1a1a1a', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }}/>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ height: '12px', background: '#1a1a1a', borderRadius: '4px', width: '85%', animation: 'pulse 1.5s ease-in-out infinite' }}/>
                  <div style={{ height: '12px', background: '#1a1a1a', borderRadius: '4px', width: '65%', animation: 'pulse 1.5s ease-in-out infinite' }}/>
                  <div style={{ height: '10px', background: '#141414', borderRadius: '4px', width: '35%', animation: 'pulse 1.5s ease-in-out infinite' }}/>
                </div>
              </div>
            ))}
          </div>
        ) : currentError ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📡</div>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>{currentError}</p>
            <button onClick={refreshAll}
              style={{ padding: '8px 20px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              Try Again
            </button>
          </div>
        ) : displayItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563', fontSize: '13px' }}>No items found.</div>
        ) : (
          displayItems.slice(0, itemCount).map((item, i) =>
            activeTab === 'news'
              ? <NewsItem key={item.id || i} item={item} />
              : <ExploitItem key={item.id || i} item={item} />
          )
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 18px 14px', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#374151' }}>Auto-refresh every 5 min</span>
        <a href={activeTab === 'news' ? 'https://thehackernews.com' : 'https://www.exploit-db.com'}
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '11px', fontWeight: '600', color: activeTab === 'news' ? '#0891b2' : '#E53E3E', textDecoration: 'none' }}>
          View all on site ↗
        </a>
      </div>

      <style>{`
        @keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
      `}</style>
    </div>
  );
};

export default SecurityNewsFeed;
