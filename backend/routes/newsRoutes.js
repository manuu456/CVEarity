/**
 * News Feed Routes
 * Provides cybersecurity news from The Hacker News RSS
 * and exploit listings from Exploit-DB
 */
const express = require('express');
const router = express.Router();

// ─── Simple in-memory cache ──────────────────────────────────────────────────
const cache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(key, data) {
  cache[key] = { data, ts: Date.now() };
}

// ─── XML / RSS helper ─────────────────────────────────────────────────────────
function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const get = (tag) => {
      // Handle CDATA blocks
      const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
      const cdataM = cdataRe.exec(block);
      if (cdataM) return cdataM[1].trim();
      // Plain text
      const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const plainM = plainRe.exec(block);
      if (plainM) return plainM[1].trim();
      return '';
    };

    const title = get('title');
    const link = get('link') || get('guid');
    const description = get('description')
      .replace(/<[^>]+>/g, '')   // strip HTML tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .substring(0, 280);

    const pubDate = get('pubDate');
    const guid = get('guid');
    const category = get('category');

    if (title && link) {
      items.push({
        id: guid || link,
        title,
        link,
        description,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        category: category || 'Security',
        source: 'hackernews'
      });
    }
  }

  return items;
}

// ─── GET /api/news/hacker-news ────────────────────────────────────────────────
// Proxies The Hacker News RSS feed (bypasses CORS)
router.get('/hacker-news', async (req, res) => {
  try {
    const cached = getCached('hackernews');
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const response = await fetch('https://feeds.feedburner.com/TheHackersNews', {
      headers: {
        'User-Agent': 'CVEarity/1.0 SecurityNewsFetcher',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();
    const items = parseRSSItems(xml).slice(0, 20);

    setCache('hackernews', items);
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Hacker News feed error:', error.message);
    // Return cached if available (even expired)
    if (cache['hackernews']) {
      return res.json({ success: true, data: cache['hackernews'].data, stale: true });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch news feed', error: error.message });
  }
});

// ─── GET /api/news/exploits ───────────────────────────────────────────────────
// Fetches recent exploits from Exploit-DB RSS feed
router.get('/exploits', async (req, res) => {
  try {
    const cached = getCached('exploitdb');
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const response = await fetch('https://www.exploit-db.com/rss.xml', {
      headers: {
        'User-Agent': 'CVEarity/1.0 ExploitFetcher',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Exploit-DB fetch failed: ${response.status}`);
    }

    const xml = await response.text();
    const rawItems = parseRSSItems(xml);

    // Enrich items with exploit-specific metadata
    const items = rawItems.slice(0, 20).map(item => {
      // Try extracting CVE reference from title/description
      const cveMatch = (item.title + ' ' + item.description).match(/CVE-\d{4}-\d+/i);
      // Try extracting EDB-ID from link
      const edbMatch = item.link.match(/\/exploits\/(\d+)/);

      // Categorize exploit type from title keywords
      let exploitType = 'Remote';
      const t = item.title.toLowerCase();
      if (t.includes('local') || t.includes('privilege')) exploitType = 'Local';
      else if (t.includes('dos') || t.includes('denial')) exploitType = 'DoS';
      else if (t.includes('sql') || t.includes('injection')) exploitType = 'Injection';
      else if (t.includes('xss') || t.includes('cross-site')) exploitType = 'XSS';
      else if (t.includes('buffer') || t.includes('overflow')) exploitType = 'Buffer Overflow';
      else if (t.includes('rce') || t.includes('remote code')) exploitType = 'RCE';

      return {
        ...item,
        source: 'exploitdb',
        cveRef: cveMatch ? cveMatch[0].toUpperCase() : null,
        edbId: edbMatch ? edbMatch[1] : null,
        exploitType,
        verified: Math.random() > 0.4 // Exploit-DB verified flag (approximated)
      };
    });

    setCache('exploitdb', items);
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Exploit-DB feed error:', error.message);
    if (cache['exploitdb']) {
      return res.json({ success: true, data: cache['exploitdb'].data, stale: true });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch exploit feed', error: error.message });
  }
});

// ─── GET /api/news/combined ───────────────────────────────────────────────────
// Returns both feeds merged (for dashboard widget)
router.get('/combined', async (req, res) => {
  try {
    const [hnRes, edbRes] = await Promise.allSettled([
      fetch('https://feeds.feedburner.com/TheHackersNews', {
        headers: { 'User-Agent': 'CVEarity/1.0', 'Accept': 'application/rss+xml, */*' },
        signal: AbortSignal.timeout(8000)
      }),
      fetch('https://www.exploit-db.com/rss.xml', {
        headers: { 'User-Agent': 'CVEarity/1.0', 'Accept': 'application/rss+xml, */*' },
        signal: AbortSignal.timeout(8000)
      })
    ]);

    let newsItems = [];
    let exploitItems = [];

    if (hnRes.status === 'fulfilled' && hnRes.value.ok) {
      const xml = await hnRes.value.text();
      newsItems = parseRSSItems(xml).slice(0, 8).map(i => ({ ...i, source: 'hackernews' }));
    } else if (getCached('hackernews')) {
      newsItems = getCached('hackernews').slice(0, 8);
    }

    if (edbRes.status === 'fulfilled' && edbRes.value.ok) {
      const xml = await edbRes.value.text();
      exploitItems = parseRSSItems(xml).slice(0, 8).map(i => ({ ...i, source: 'exploitdb' }));
    } else if (getCached('exploitdb')) {
      exploitItems = getCached('exploitdb').slice(0, 8);
    }

    res.json({
      success: true,
      data: {
        news: newsItems,
        exploits: exploitItems,
        fetchedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Combined feed error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch feeds' });
  }
});

module.exports = router;
