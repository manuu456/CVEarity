import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Tool Definitions ───────────────────────────────────────────────
const TOOLS = [
  {
    id: 'dashboard',
    icon: '📊',
    name: 'CVE Dashboard',
    tagline: 'Your command center for vulnerability intelligence',
    color: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/20',
    route: '/dashboard',
    difficulty: 'Beginner',
    timeToLearn: '2 min',
    what: 'The Dashboard gives you a real-time overview of all known vulnerabilities in your database. It refreshes every 30 seconds and shows live statistics across severity levels.',
    why: 'Security teams need a single pane of glass to monitor the threat landscape without hopping between multiple tools.',
    howToUse: [
      'Log in and navigate to /dashboard',
      'View the animated stat cards at the top — they show total CVEs, critical, high, and medium counts',
      'Use the Severity Distribution pie chart to see the proportion of each severity level',
      'Use the CVEs by Year bar chart to spot increasing or decreasing trends',
      'Use the filter row to narrow results by severity, software, year, or keyword',
      'Click any CVE ID in the table to drill into its full details',
      'Click "Export CSV" to download the filtered results for offline analysis',
    ],
    tips: [
      'The 🟢 LIVE badge flashes green — if it turns yellow, the data is being refreshed',
      'Use the Software filter to quickly find CVEs affecting a specific product like "Apache" or "Linux"',
      'The "Refresh Now" button forces an immediate update without waiting 30 seconds',
    ],
    keyTerms: [
      { term: 'CVE', def: 'Common Vulnerabilities and Exposures — a unique ID for each known security flaw' },
      { term: 'CVSS Score', def: 'A 0–10 number representing how severe a vulnerability is' },
      { term: 'Severity', def: 'Critical (9–10), High (7–8.9), Medium (4–6.9), Low (0–3.9)' },
    ],
  },
  {
    id: 'live-feed',
    icon: '📡',
    name: 'Live CVE Feed',
    tagline: 'Real-time stream of the newest vulnerabilities',
    color: 'from-red-500 to-rose-600',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
    route: '/live',
    difficulty: 'Beginner',
    timeToLearn: '2 min',
    what: 'The Live Feed is a scrolling stream of the most recently published CVEs, sorted by date. It auto-refreshes every 30 seconds and highlights brand-new entries with a "NEW" badge.',
    why: 'Attackers exploit newly disclosed vulnerabilities within hours. Staying on top of the live feed means you can respond before attackers do.',
    howToUse: [
      'Navigate to /live or click "🔴 Live Feed" in the Tools menu',
      'Each card shows the CVE ID, title, severity badge, CVSS score bar, and publish date',
      'Green "NEW" badges appear on entries that arrived since your last refresh',
      'Click any card to open the full CVE detail page',
      'Use "↻ Refresh Now" to manually pull the latest data immediately',
      'Watch the countdown timer — it shows how many seconds until the next auto-refresh',
    ],
    tips: [
      'Sort by Critical severity using the Dashboard filter, then jump to the Live Feed for context',
      'If no CVEs appear, an admin needs to sync data from the NVD source first',
      'The feed shows the last 30 published CVEs — older ones are in the main Dashboard table',
    ],
    keyTerms: [
      { term: 'NVD', def: 'National Vulnerability Database — the official US government CVE repository' },
      { term: 'Published Date', def: 'When a CVE was officially disclosed to the public' },
      { term: 'Auto-Refresh', def: 'The page fetches fresh data on a timer without you doing anything' },
    ],
  },
  {
    id: 'cvss-calculator',
    icon: '🧮',
    name: 'CVSS v3.1 Calculator',
    tagline: 'Calculate vulnerability severity scores yourself',
    color: 'from-purple-500 to-violet-600',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
    route: '/cvss-calculator',
    difficulty: 'Intermediate',
    timeToLearn: '5 min',
    what: 'The CVSS Calculator lets you compute the official CVSS v3.1 Base Score for any vulnerability by selecting values for 8 metric vectors. It shows the score, severity, and the vector string in real-time as you choose.',
    why: 'Security analysts and pen testers need to score custom or undisclosed vulnerabilities. Vendors use this to report severity in advisories.',
    howToUse: [
      'Navigate to /cvss-calculator',
      'Work through each of the 8 metrics from top to bottom:',
      '  • Attack Vector — how can the attacker reach the target?',
      '  • Attack Complexity — how hard is it to exploit?',
      '  • Privileges Required — does the attacker need an account?',
      '  • User Interaction — does a victim need to click something?',
      '  • Scope — does the impact extend beyond the vulnerable component?',
      '  • Confidentiality, Integrity, Availability — what kind of damage occurs?',
      'The score and severity ring update instantly as you select options',
      'Copy the vector string (e.g. CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H) to share with your team',
    ],
    tips: [
      'AV:Network + AC:Low + PR:None = highest exploitability (worst case)',
      'C:High/I:High/A:High = maximum impact — this is typically a Critical (9.5+) score',
      'A Scope:Changed score means the vulnerability can affect neighboring systems',
      'Share the vector string in bug reports so others can reproduce your score',
    ],
    keyTerms: [
      { term: 'CVSS', def: 'Common Vulnerability Scoring System — the industry standard for rating severity' },
      { term: 'Vector String', def: 'A short code like CVSS:3.1/AV:N/... that encodes all metric choices' },
      { term: 'Base Score', def: 'The inherent severity score without environment or time adjustments' },
    ],
  },
  {
    id: 'watchlist',
    icon: '👁️',
    name: 'Watchlist & Alerts',
    tagline: 'Monitor specific software for new vulnerabilities',
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    route: '/watchlist',
    difficulty: 'Beginner',
    timeToLearn: '3 min',
    what: 'The Watchlist lets you subscribe to specific software names (e.g. "Apache", "Windows", "OpenSSL"). Whenever a new CVE matching that software enters the database, you get an alert automatically.',
    why: 'No one reads thousands of CVEs daily. The Watchlist brings relevant threats to YOU instead of making you hunt for them.',
    howToUse: [
      'Navigate to /watchlist',
      'Click "+ Add to Watchlist" to open the add form',
      'Enter the software name — use partial names like "Apache" rather than "Apache HTTP Server 2.4.1"',
      'Optionally add a Vendor name for more specific matching',
      'Choose a severity threshold — "All Severities" or only "Critical" alerts',
      'Click "Add" — the system immediately scans for existing CVE matches',
      'Switch to the Alerts tab to see matched vulnerabilities',
      'Click "Mark read" or "Mark all read" to clear processed alerts',
    ],
    tips: [
      'Add your most critical production software first (your database, web server, OS)',
      'Use "Critical Only" threshold to avoid alert fatigue for less important software',
      'The unread count badge on the Alerts tab updates in real-time',
      'Removing a watchlist item also clears its associated alerts',
    ],
    keyTerms: [
      { term: 'Alert', def: 'A notification that a watched software has a matching CVE' },
      { term: 'Severity Threshold', def: 'Only alert on CVEs at or above this severity level' },
      { term: 'Alert Fatigue', def: 'Being overwhelmed by too many alerts, causing important ones to be missed' },
    ],
  },
  {
    id: 'asset-inventory',
    icon: '🖥️',
    name: 'Asset Inventory',
    tagline: 'Map your software stack to known vulnerabilities',
    color: 'from-teal-500 to-cyan-600',
    border: 'border-teal-500/30',
    glow: 'shadow-teal-500/20',
    route: '/assets',
    difficulty: 'Intermediate',
    timeToLearn: '4 min',
    what: 'Asset Inventory lets you register the software components your organization runs (your assets). The platform automatically matches each asset against CVEs to show you exactly which vulnerabilities affect your environment.',
    why: 'Knowing a CVE exists is not enough — you need to know if YOUR systems are vulnerable. Asset Inventory creates that link.',
    howToUse: [
      'Navigate to /assets and click "+ Add Asset"',
      'Fill in the software name, version, vendor, and criticality level',
      'Click "Add" — the system immediately scans the CVE database for matches',
      'The stats cards show your total assets, matched CVE count, and high/critical asset count',
      'Scroll down to "⚠️ Matched Vulnerabilities" to see which CVEs affect which of your assets',
      'Remove assets you no longer use to keep the inventory clean',
    ],
    tips: [
      'Set criticality to "Critical" for production databases, payment systems, and auth servers',
      'Add the exact version number (e.g. "2.4.51") to reduce false-positive matches',
      'Cross-reference matched CVEs with the Risk Dashboard to prioritize patching order',
      'A clean asset inventory is the foundation of any vulnerability management program',
    ],
    keyTerms: [
      { term: 'Asset', def: 'Any software component your organization depends on' },
      { term: 'CVE Match', def: 'A CVE whose affected software description overlaps with your asset' },
      { term: 'Criticality', def: 'How important the asset is to your business — critical assets get priority patching' },
    ],
  },
  {
    id: 'risk-dashboard',
    icon: '📈',
    name: 'Risk Prioritization',
    tagline: 'Focus on what matters — fix the biggest risks first',
    color: 'from-orange-500 to-red-600',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
    route: '/risk',
    difficulty: 'Intermediate',
    timeToLearn: '3 min',
    what: 'The Risk Dashboard scores every CVE on a 0–100 risk scale using multiple signals: CVSS score, whether a working exploit exists, whether CISA flagged it as actively exploited (KEV), and whether it affects one of your registered assets.',
    why: 'A CVSS score alone does not tell you what to patch first. Risk scoring combines exploitability, impact, and your specific environment to give more actionable prioritization.',
    howToUse: [
      'Navigate to /risk',
      'The stat cards at top show how many CVEs fall in each risk band',
      'The "🔥 Fix These First" list ranks CVEs from highest risk to lowest',
      'Look for red "YOUR ASSET" badges — these directly affect systems you own',
      '"EXPLOITED" badge means a working exploit exists in the wild',
      '"CISA KEV" badge means the US government confirms active exploitation',
      'Share the ranked list with your engineering team for sprint planning',
    ],
    tips: [
      'Add your assets first (Asset Inventory) to get the full benefit — "YOUR ASSET" flags are critical',
      'Any CVE with all three badges (ASSET + EXPLOITED + KEV) is an immediate patch emergency',
      'Risk score = CVSS×10 + 20 (exploit) + 15 (KEV) + 25 (your asset) = max 100',
      'Export the top 20 as CSV and use it as your weekly patching backlog',
    ],
    keyTerms: [
      { term: 'KEV', def: 'CISA Known Exploited Vulnerabilities — confirmed actively exploited in the wild' },
      { term: 'Risk Score', def: 'CVEarity\'s proprietary 0–100 priority score combining CVSS + exploitation signals' },
      { term: 'MTTR', def: 'Mean Time To Remediate — how long on average it takes to patch a vulnerability' },
    ],
  },
  {
    id: 'compare',
    icon: '⚖️',
    name: 'CVE Compare Tool',
    tagline: 'Side-by-side comparison of any two vulnerabilities',
    color: 'from-indigo-500 to-purple-600',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
    route: '/compare',
    difficulty: 'Intermediate',
    timeToLearn: '2 min',
    what: 'The Compare Tool lets you load any two CVEs and view them side by side. It highlights differences in severity, CVSS score, affected software, exploit status, and CISA KEV status.',
    why: 'When deciding between two patches or reporting to leadership, a clear side-by-side comparison makes the decision obvious.',
    howToUse: [
      'Navigate to /compare',
      'Type a CVE ID in the "CVE A" box — autocomplete will suggest matches as you type',
      'Click "Load" or press Enter to fetch the CVE\'s data',
      'Repeat for "CVE B"',
      'The comparison table appears with all fields',
      'Yellow highlighted rows indicate fields where the two CVEs differ',
      'CVSS score bars give a quick visual of which CVE is more severe',
    ],
    tips: [
      'Use this when management asks "which one should we fix first?" — the comparison makes it obvious',
      'Compare a Critical KEV CVE vs a High non-exploited CVE to justify prioritization decisions',
      'Works great for comparing different CVEs affecting the same software across versions',
    ],
    keyTerms: [
      { term: 'Diff Highlight', def: 'Yellow coloring on rows where the two CVEs have different values' },
      { term: 'Autocomplete', def: 'Type-ahead search that suggests CVE IDs as you type' },
    ],
  },
  {
    id: 'threats',
    icon: '🌐',
    name: 'Threat Landscape',
    tagline: 'Big-picture view of the global vulnerability ecosystem',
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    route: '/threats',
    difficulty: 'Beginner',
    timeToLearn: '2 min',
    what: 'The Threat Landscape page shows macro-level intelligence: severity distribution charts, CVE trend lines over time, the most commonly affected software, and yearly totals.',
    why: 'Understanding the big picture helps security leaders make budget decisions and communicate risk to executives in visual, digestible formats.',
    howToUse: [
      'Navigate to /threats (or click "Threats" in the NavBar)',
      'Read the stat cards at top for a quick system overview',
      'Study the "Severity Distribution" pie chart — a large red slice means your database is heavily critical-weighted',
      'Read the "CVE Trends Over Time" line chart for month-by-month growth patterns',
      'Scroll to "Most Affected Software" to see which products have the most CVEs recorded',
      'Use the "CVEs by Year" bar chart to spot years with unusually high vulnerability disclosure',
    ],
    tips: [
      'Use this page in security review meetings to visualize the current threat environment',
      'A sudden spike in the trend chart often corresponds to a major disclosure event (e.g. Log4Shell)',
      'Export charts as screenshots for board-level security briefings',
    ],
    keyTerms: [
      { term: 'Threat Landscape', def: 'The overall state of known threats at a given point in time' },
      { term: 'Disclosure', def: 'The public announcement of a vulnerability\'s existence' },
    ],
  },
  {
    id: 'developer',
    icon: '🔑',
    name: 'Developer API',
    tagline: 'Integrate CVEarity into your own tools',
    color: 'from-green-500 to-emerald-600',
    border: 'border-green-500/30',
    glow: 'shadow-green-500/20',
    route: '/developer',
    difficulty: 'Advanced',
    timeToLearn: '5 min',
    what: 'The Developer API lets you generate personal API keys and use them to query CVEarity programmatically — from CI/CD pipelines, scripts, dashboards, or other security tools.',
    why: 'Security automation is essential at scale. Feeding CVEarity data into your CI/CD pipeline can block deployments when new critical vulnerabilities affect your dependencies.',
    howToUse: [
      'Navigate to /developer and click "+ Generate Key"',
      'Give the key a descriptive name (e.g. "GitHub Actions", "Local Dev")',
      'Copy the full key immediately — it won\'t be shown again!',
      'Use the key in API requests as a header: X-API-Key: cvea_yourkey',
      'Available endpoints: GET /api/cves, GET /api/cves/:id, GET /api/cves/statistics',
      'Revoke old or compromised keys immediately using the "Revoke" button',
    ],
    tips: [
      'Store API keys in environment variables or secrets managers — never in source code',
      'Create separate keys for each tool/environment (dev, staging, production)',
      'Revoke keys when team members leave or when you suspect a leak',
      'Use the statistics endpoint to build custom dashboards in Grafana or similar tools',
    ],
    keyTerms: [
      { term: 'API Key', def: 'A secret token that authenticates programmatic access to CVEarity' },
      { term: 'CI/CD', def: 'Continuous Integration/Delivery — automated build and deployment pipelines' },
      { term: 'Rate Limit', def: 'A cap on how many API calls can be made in a time period' },
    ],
  },
  {
    id: 'mfa',
    icon: '🔐',
    name: 'Multi-Factor Authentication',
    tagline: 'Add a second layer of protection to your account',
    color: 'from-rose-500 to-pink-600',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
    route: '/mfa',
    difficulty: 'Beginner',
    timeToLearn: '3 min',
    what: 'MFA (Two-Factor Authentication) adds a second verification step on top of your password. After enabling it, signing in requires both your password AND a 6-digit time-based code from an authenticator app.',
    why: 'Passwords alone can be stolen, guessed, or leaked. MFA ensures that even if your password is compromised, attackers cannot access your account without also having your phone.',
    howToUse: [
      'Navigate to /mfa (or click your username → "MFA Settings")',
      'Click "Setup MFA"',
      'Open Google Authenticator, Authy, or Microsoft Authenticator on your phone',
      'Tap "+" or "Add Account" in the app, then scan the QR code shown on screen',
      'The app will display a rotating 6-digit code',
      'Type the current code into the verification box and click "Verify"',
      'MFA is now enabled — future logins will require this code',
    ],
    tips: [
      'Save the manual secret key in a secure location as a backup',
      'If you lose your phone, contact an admin to reset MFA on your account',
      'TOTP codes are valid for 30 seconds — if one fails, wait for the next cycle',
      'Use a backup code manager like 1Password or Bitwarden to store the secret',
    ],
    keyTerms: [
      { term: 'TOTP', def: 'Time-based One-Time Password — a 6-digit code that changes every 30 seconds' },
      { term: 'Authenticator App', def: 'A mobile app (Google Authenticator, Authy) that generates TOTP codes' },
      { term: '2FA', def: 'Two-Factor Authentication — another name for MFA' },
    ],
  },
];

// ─── Difficulty Badge ──────────────────────────────────────────────
const DifficultyBadge = ({ level }) => {
  const colors = {
    Beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    Intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[level]}`}>{level}</span>
  );
};

// ─── Tool Card (Grid View) ─────────────────────────────────────────
const ToolCard = ({ tool, onClick }) => (
  <button
    onClick={() => onClick(tool)}
    className={`bg-slate-800/50 border ${tool.border} rounded-2xl p-6 text-left hover:scale-[1.02] hover:shadow-lg ${tool.glow} transition-all duration-300 group`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl shadow-lg`}>
        {tool.icon}
      </div>
      <DifficultyBadge level={tool.difficulty} />
    </div>
    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">{tool.name}</h3>
    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{tool.tagline}</p>
    <div className="flex items-center justify-between">
      <span className="text-slate-500 text-xs">⏱ {tool.timeToLearn} to learn</span>
      <span className="text-cyan-400 text-sm font-medium">Learn →</span>
    </div>
  </button>
);

// ─── Full Detail Modal ─────────────────────────────────────────────
const ToolDetail = ({ tool, onClose, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('what');

  const tabs = [
    { id: 'what', label: 'What is it?' },
    { id: 'how', label: '📋 How to Use' },
    { id: 'tips', label: '💡 Pro Tips' },
    { id: 'terms', label: '📖 Key Terms' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${tool.color} p-6 flex items-start justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl backdrop-blur-sm">
              {tool.icon}
            </div>
            <div>
              <h2 className="text-white font-bold text-2xl">{tool.name}</h2>
              <p className="text-white/80 text-sm mt-1">{tool.tagline}</p>
              <div className="flex items-center gap-2 mt-2">
                <DifficultyBadge level={tool.difficulty} />
                <span className="text-white/60 text-xs">⏱ {tool.timeToLearn} to learn</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'what' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2 text-sm uppercase tracking-wider">What does it do?</h4>
                <p className="text-slate-300 leading-relaxed">{tool.what}</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm">🎯 Why does this matter?</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{tool.why}</p>
              </div>
            </div>
          )}

          {activeTab === 'how' && (
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Step-by-step guide</h4>
              <ol className="space-y-3">
                {tool.howToUse.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    {step.startsWith('  •') ? (
                      <div className="flex gap-3 pl-7">
                        <span className="text-slate-500 text-sm">•</span>
                        <span className="text-slate-300 text-sm">{step.replace('  •', '').trim()}</span>
                      </div>
                    ) : (
                      <>
                        <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                          {i + 1}
                        </span>
                        <span className="text-slate-300 text-sm leading-relaxed">{step}</span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activeTab === 'tips' && (
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Pro tips & best practices</h4>
              <div className="space-y-3">
                {tool.tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                    <span className="text-yellow-400 flex-shrink-0">💡</span>
                    <span className="text-slate-300 text-sm leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Key terminology</h4>
              <div className="space-y-3">
                {tool.keyTerms.map((term, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className={`font-bold text-sm mb-1 bg-gradient-to-r ${tool.color} bg-clip-text text-transparent`}>{term.term}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{term.def}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-slate-700 p-4 flex items-center justify-between bg-slate-800/30">
          <p className="text-slate-500 text-sm">Ready to try it?</p>
          <button
            onClick={() => onNavigate(tool.route)}
            className={`px-6 py-2 bg-gradient-to-r ${tool.color} text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300`}
          >
            Open {tool.name} →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Learn Center Page ────────────────────────────────────────
export const LearnCenterPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  const filtered = TOOLS.filter(t =>
    (filter === 'all' || t.difficulty === filter) &&
    (search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.tagline.toLowerCase().includes(search.toLowerCase()))
  );

  const handleNavigate = (route) => {
    setSelected(null);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-6">
            🎓 Learn Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Master Every Tool on
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> CVEarity</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Interactive guides for every feature — from beginner basics to advanced security workflows.
            Each tool has a step-by-step walkthrough, pro tips, and a glossary.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{TOOLS.length}</p>
            <p className="text-slate-400 text-sm">Tools Covered</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{TOOLS.filter(t => t.difficulty === 'Beginner').length}</p>
            <p className="text-slate-400 text-sm">Beginner-Friendly</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">~{TOOLS.reduce((a, t) => a + parseInt(t.timeToLearn), 0)} min</p>
            <p className="text-slate-400 text-sm">Total Learning Time</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 flex-wrap">
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === d ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {d === 'all' ? 'All Tools' : d}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition text-sm"
          />
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={setSelected} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-4">🔍</p>
            <p>No tools match your search</p>
          </div>
        )}

        {/* Recommended Learning Path */}
        <div className="mt-16 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
          <h2 className="text-white font-bold text-2xl mb-2">🗺️ Recommended Learning Path</h2>
          <p className="text-slate-400 mb-6">New to CVEarity? Follow this guided order:</p>
          <div className="flex flex-wrap gap-3">
            {['dashboard', 'live-feed', 'watchlist', 'asset-inventory', 'risk-dashboard', 'cvss-calculator', 'compare', 'threats', 'developer', 'mfa'].map((id, i) => {
              const tool = TOOLS.find(t => t.id === id);
              if (!tool) return null;
              return (
                <button key={id} onClick={() => setSelected(tool)} className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 hover:border-cyan-500/50 transition-colors group">
                  <span className="text-slate-500 text-xs font-bold w-5">{i + 1}</span>
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <ToolDetail
          tool={selected}
          onClose={() => setSelected(null)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};
