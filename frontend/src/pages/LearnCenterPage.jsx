import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// ─── Tool Definitions ───────────────────────────────────────────────
const TOOLS = [
  {
    id: 'dashboard',
    icon: '📊',
    name: 'Unified Dashboard',
    tagline: 'Global command center for threat intelligence',
    color: 'bg-tenable-navy',
    route: '/dashboard',
    difficulty: 'Beginner',
    timeToLearn: '2 min',
    what: 'The Unified Dashboard provides a centralized vantage point for all vulnerability intelligence. It synchronizes with global threat feeds in real-time, delivering immediate visibility into operational risks.',
    why: 'Enterprise security requires high-resolution visibility. The dashboard eliminates intelligence silos, allowing teams to monitor the entire vulnerability lifecycle from a single pane of glass.',
    howToUse: [
      'Authorize credentials and navigate to the Dashboard conduit.',
      'Monitor real-time telemetry via the top-level metric modules.',
      'Analyze severity distribution using the automated visualization matrix.',
      'Track temporal trends to identify escalation patterns in disclosure cycles.',
      'Apply multi-dimensional filters (Severity, Asset Class, Vector) to isolate critical exposures.',
      'Drill down into individual CVE profiles for forensic-level detail.',
      'Export operational reports for executive review or offline auditing.',
    ],
    tips: [
      'The 🟢 OPERATIONAL status indicates live synchronization for up-to-the-minute intelligence.',
      'Utilize the Software Filter to execute rapid impact assessments for specific infrastructure components.',
      'Engage "Force Re-Sync" for immediate data propagation from the National Vulnerability Database.',
    ],
    keyTerms: [
      { term: 'CVE', def: 'Common Vulnerabilities and Exposures — standardized identifiers for public security flaws.' },
      { term: 'CVSS Vector', def: 'A numerical score representing the intrinsic characteristics and severity of a threat.' },
      { term: 'Risk Tiering', def: 'Classification of threats into Critical, High, Medium, and Low operational priority bands.' },
    ],
  },
  {
    id: 'live-feed',
    icon: '📡',
    name: 'Operational Live Feed',
    tagline: 'Real-time telemetry of emerging global threats',
    color: 'bg-tenable-navy',
    route: '/live',
    difficulty: 'Beginner',
    timeToLearn: '2 min',
    what: 'A low-latency intelligence stream capturing vulnerabilities the moment they are disclosed. This high-frequency feed is optimized for rapid response teams who require immediate notification of zero-day exposures.',
    why: 'The window between disclosure and exploitation is shrinking. Real-time telemetry allows security operatives to initiate mitigation protocols before attackers can weaponize new vulnerabilities.',
    howToUse: [
      'Access the Live Intake via the primary navigation hierarchy.',
      'Each intelligence card displays identity markers, severity metrics, and the disclosure timestamp.',
      'Identify "UNREAD/NEW" indicators to track the latest influx of vulnerability data.',
      'Interface with any entry to expand the full technical specification.',
      'Monitor the synchronization countdown to anticipate the next tactical data update.',
    ],
    tips: [
      'Cross-reference live disclosures with your Asset Inventory to identify immediate operational impact.',
      'Maintain active monitoring during peak disclosure periods to minimize response latency.',
      'Enable system notifications to receive critical-tier alerts directly in your workspace.',
    ],
    keyTerms: [
      { term: 'NVD Sync', def: 'Bilateral data exchange with the National Vulnerability Database.' },
      { term: 'Zero-Day Disclosure', def: 'A vulnerability that has been publicly announced but may not yet have an official patch.' },
      { term: 'Telemetry', def: 'The automated gathering and transmission of data from remote sources.' },
    ],
  },
  {
    id: 'cvss-calculator',
    icon: '🧮',
    name: 'CVSS Scoring Engine',
    tagline: 'Standardized matrix for vulnerability quantification',
    color: 'bg-tenable-navy',
    route: '/cvss-calculator',
    difficulty: 'Intermediate',
    timeToLearn: '5 min',
    what: 'An institutional-grade calculator for deriving CVSS v3.1 Base Scores. By selecting vectors across the exploitability and impact matrices, users can precisely quantify the risk profile of any security flaw.',
    why: 'Accurate risk quantification is the foundation of prioritization. This engine provides a standardized language for communicating threat severity across the organization and supply chain.',
    howToUse: [
      'Navigate to the Scoring Engine module.',
      'Define the Exploitability Matrix: Attack Vector, Complexity, Privileges, and User Interaction.',
      'Define the Impact Matrix: Confidentiality, Integrity, and Availability consequences.',
      'Configure the Scope Vector to account for impacts beyond the vulnerable component.',
      'Observe the real-time score propagation and severity tiering.',
      'Export the generated Vector Identification String for inclusion in technical advisories.',
    ],
    tips: [
      'Note that Scope:Changed often significantly escalates the final score by an order of magnitude.',
      'Use the vector string as a standard reference in all vulnerability communications.',
      'Remember that Base Scores don\'t account for environmental controls—use the Risk Dashboard for that.',
    ],
    keyTerms: [
      { term: 'Base Score', def: 'The inherent severity of a vulnerability, independent of environment or time.' },
      { term: 'Vector String', def: 'A compressed alphanumeric representation of all metric selections.' },
      { term: 'Impact ISS', def: 'The Impact Sub Score—a core component of the final CVSS calculation.' },
    ],
  },
  {
    id: 'watchlist',
    icon: '👁️',
    name: 'Persistent Monitoring',
    tagline: 'Automated surveillance of critical infrastructure',
    color: 'bg-tenable-navy',
    route: '/watchlist',
    difficulty: 'Beginner',
    timeToLearn: '3 min',
    what: 'The Watchlist subsystem allows for the creation of persistence-based monitoring rules for specific vendors and products. It automates the "hunt" by alerting you the second a relevant vulnerability is identified.',
    why: 'Manual searches are insufficient at scale. Persistent monitoring ensures that your most vital assets are under constant surveillance without requiring manual interrogation of the database.',
    howToUse: [
      'Initialize a New Target Definition via the Watchlist interface.',
      'Specify the Software Identifier and Vendor context for precise matching.',
      'Configure Severity Thresholds to filter out low-priority intelligence.',
      'Monitor the Tactical Alerts tab for incoming notifications.',
      'Acknowledge and archive communication logs once remediation is initiated.',
    ],
    tips: [
      'Prioritize monitoring for core infrastructure: OS Kernels, Web Servers, and Identity Providers.',
      'Utilize High-Severity filters for broad vendor lists to maintain a high signal-to-noise ratio.',
      'The red unread indicator provides immediate situational awareness of new matched threats.',
    ],
    keyTerms: [
      { term: 'Tactical Alert', def: 'A high-priority notification triggered by a watchlist match.' },
      { term: 'Signal-to-Noise', def: 'The ratio of useful intelligence to irrelevant background data.' },
      { term: 'Surveillance Target', def: 'A specific software or vendor component assigned for monitoring.' },
    ],
  },
  {
    id: 'asset-inventory',
    icon: '🖥️',
    name: 'Asset Intelligence',
    tagline: 'Bilateral mapping of infrastructure to vulnerabilities',
    color: 'bg-tenable-navy',
    route: '/assets',
    difficulty: 'Intermediate',
    timeToLearn: '4 min',
    what: 'A robust repository for organizational assets. By registering your software stack, the platform executes a bilateral match between your real-world footprint and the global CVE database.',
    why: 'Global risk is theoretical; asset risk is operational. Asset Intelligence transforms static CVE data into actionable organizational insights by identifying exactly which systems are exposed.',
    howToUse: [
      'Register new infrastructure components in the Asset Directory.',
      'Assign Criticality Tiers to assets based on business impact (Production vs. Dev).',
      'Analyze the Matched Vulnerability Matrix to identify active exposures.',
      'Review asset-specific risk profiles provided by the intelligence engine.',
      'Maintain the directory by purging decommissioned software components.',
    ],
    tips: [
      'Maintain high version accuracy (e.g., 2.4.51 vs 2.4) to minimize false-positive detections.',
      'Flag assets as "Buisness Critical" to automatically elevate their risk scores in the dashboard.',
      'Use the asset inventory as the definitive source for your vulnerability management meetings.',
    ],
    keyTerms: [
      { term: 'Criticality Tier', def: 'The relative importance of an asset to the organization\'s core operations.' },
      { term: 'Exposure Surface', def: 'The total sum of vulnerabilities affecting your registered assets.' },
      { term: 'Bilateral Match', def: 'The automated process of linking CVE descriptors to asset metadata.' },
    ],
  },
  {
    id: 'risk-dashboard',
    icon: '📈',
    name: 'Strategic Prioritization',
    tagline: 'Context-aware risk scoring for remediation planning',
    color: 'bg-tenable-navy',
    route: '/risk',
    difficulty: 'Intermediate',
    timeToLearn: '3 min',
    what: 'The platform\'s flagship prioritization engine. It aggregates CVSS scores, exploit availability, CISA KEV status, and internal asset criticality to produce a unified 0–100 Risk Index.',
    why: 'Fixed CVSS scores don\'t account for exploitation reality. Strategic Prioritization allows teams to bypass "fire drills" and focus on the vulnerabilities that attackers are actually using.',
    howToUse: [
      'Navigate to the Prioritization Matrix.',
      'Review the high-risk outliers in the "Critical Remediation" list.',
      'Identify threats with "EXPLOIT ACTIVE" and "CISA KEV" indicators.',
      'Focus on "ASSET MATCH" items which represent immediate direct risk to your environment.',
      'Prioritize remediation workflows based on the weighted Risk Index.',
    ],
    tips: [
      'A vulnerability with an active exploit and an internal asset match is a "Tier 0" emergency.',
      'Use the Risk Index to justify security budgets and resource allocation to stakeholders.',
      'Risk scores are dynamic; monitor the dashboard daily for changes in exploit availability.',
    ],
    keyTerms: [
      { term: 'Risk Index', def: 'A weighted 0-100 score calculating the probability and impact of exploitation.' },
      { term: 'Remediation Velocity', def: 'The speed at which an organization identifies and patches high-risk threats.' },
      { term: 'CISA KEV', def: 'Known Exploited Vulnerabilities — the definitive list of threats being used in the wild.' },
    ],
  },
  {
    id: 'compare',
    icon: '⚖️',
    name: 'Differential Intelligence',
    tagline: 'Side-by-side comparison of any two vulnerabilities',
    color: 'bg-tenable-navy',
    route: '/compare',
    difficulty: 'Intermediate',
    timeToLearn: '2 min',
    what: 'The Compare module facilitates high-fidelity differential analysis between any two vulnerability identifiers. It highlights discrepancies in metadata, scoring vectors, and institutional status.',
    why: 'Comparative analysis is vital for triage. It allows analysts to justify prioritization decisions by visualizing the delta between similar-looking threats.',
    howToUse: [
      'Initialize the Differential Interface.',
      'Input the primary and secondary CVE identifiers into the comparative slots.',
      'Execute the comparison to generate the side-by-side matrix.',
      'Review highlighted data points representing mismatched risk indicators.',
      'Analyze the scoring bars to determine the relative severity delta.',
    ],
    tips: [
      'Utilize this tool when justifying patching order to cross-functional engineering teams.',
      'Mismatched statuses in "Exploit Availability" or "CISA KEV" should override raw CVSS scores.',
      'Capture Matrix screenshots for inclusion in formal remediation justifications.',
    ],
    keyTerms: [
      { term: 'Differential Analysis', def: 'The systematic comparison of two datasets to identify unique differences.' },
      { term: 'Risk Delta', def: 'The quantified difference in severity between two security exposures.' },
    ],
  },
  {
    id: 'threats',
    icon: '🌐',
    name: 'Global Landscape',
    tagline: 'Macro-level analysis of the vulnerability ecosystem',
    color: 'bg-tenable-navy',
    route: '/threats',
    difficulty: 'Beginner',
    timeToLearn: '2 min',
    what: 'A high-level intelligence module providing an aggregated view of global vulnerability trends. It visualizes systemic shifts in the threat landscape through multidimensional analytics.',
    why: 'Strategic decision-makers require context. The Global Landscape provides the necessary data to understand broader industry trends beyond individual vulnerability events.',
    howToUse: [
      'Access the Landscape Analytics via the primary dashboard.',
      'Study the Severity Distribution Matrix to understand the current threat density.',
      'Monitor the temporal Trend Graphs for anomalies in disclosure frequency.',
      'Analyze the "Most Targeted Infrastructure" list for systemic ecosystem risks.',
    ],
    tips: [
      'Use these analytics in monthly executive briefings to demonstrate proactive monitoring.',
      'Spikes in temporal trends often precede large-scale exploitation campaigns.',
      'Align your internal patching goals with the broader industry trends visualized here.',
    ],
    keyTerms: [
      { term: 'Macro Intelligence', def: 'Large-scale data analysis focused on systemic patterns rather than individual events.' },
      { term: 'Disclosure Frequency', def: 'The rate at which new vulnerabilities are publicly announced.' },
    ],
  },
  {
    id: 'developer',
    icon: '🔑',
    name: 'Programmatic Access',
    tagline: 'Advanced API integration for security automation',
    color: 'bg-tenable-navy',
    route: '/developer',
    difficulty: 'Advanced',
    timeToLearn: '5 min',
    what: 'The Developer Portal enables programmatic interaction with the CVEarity intelligence engine. It provides the infrastructure for generating secure API keys and integrating data into automated pipelines.',
    why: 'Security at scale requires automation. Programmatic Access allows for the seamless injection of threat intelligence into CI/CD workflows and custom SOC dashboards.',
    howToUse: [
      'Generate a unique Authentication Token via the portal.',
      'Register the token within your automation secrets manager (Vault, GitHub Secrets).',
      'Integrate the API endpoints (CVE Data, Statistics, Search) into your scripts.',
      'Monitor token utilization and rotate or revoke keys as required by your security policy.',
    ],
    tips: [
      'Implement "Fail-Closed" logic in your CI/CD pipelines for critical vulnerabilities match.',
      'Utilize granular statistics endpoints to populate real-time internal SOC monitors.',
    ],
    keyTerms: [
      { term: 'API Key Rotation', def: 'The security best practice of periodically replacing authentication tokens.' },
      { term: 'SOC Integration', def: 'The process of linking threat intelligence data into a Security Operations Center.' },
    ],
  },
  {
    id: 'mfa',
    icon: '🔐',
    name: 'Multi-Factor Validation',
    tagline: 'Cryptographic identity protection for secure access',
    color: 'bg-tenable-navy',
    route: '/mfa',
    difficulty: 'Beginner',
    timeToLearn: '3 min',
    what: 'A secondary layer of authentication utilizing time-based cryptographic tokens. MFA significantly enhances account security by requiring both a knowledge factor (password) and a possession factor (authenticator).',
    why: 'Credential theft is a primary attack vector. Multi-Factor Validation renders stolen passwords useless by requiring a secondary, time-sensitive verification code.',
    howToUse: [
      'Initialize the MFA setup protocol.',
      'Synchronize your physical authenticator device with the on-screen cryptographic seed.',
      'Validate the connection by entering the six-digit synchronous token.',
      'Note the restoration of secure access status upon successful verification.',
    ],
    tips: [
      'Ensure your authenticator application is backed up to prevent account lockout.',
      'Contact system administration immediately if you lose access to your possession factor.',
    ],
    keyTerms: [
      { term: 'TOTP', def: 'Time-based One-Time Password — a cryptographic token valid for a limited window.' },
      { term: 'Identity Lockdown', def: 'The state of comprehensive account protection achieved through MFA.' },
    ],
  },
];

// ─── Difficulty Badge ──────────────────────────────────────────────
const DifficultyBadge = ({ level }) => {
  const colors = {
    Beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
    Intermediate: 'bg-yellow/10 text-yellow border-yellow/20',
    Advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-theme ${colors[level]}`}>{level}</span>
  );
};

// ─── Tool Card (Grid View) ─────────────────────────────────────────
const ToolCard = ({ tool, onClick, isAdmin, onEdit, onDelete }) => (
  <div className="bg-card border border-subtle rounded-2xl p-6 text-left hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-subtle/10 group-hover:bg-main transition-colors"></div>

    {/* Admin action buttons */}
    {isAdmin && tool.id && (
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={e => { e.stopPropagation(); onEdit(tool); }}
          className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[8px] font-black uppercase rounded hover:bg-blue-500/30 transition"
        >Edit</button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(tool); }}
          className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[8px] font-black uppercase rounded hover:bg-red-500/30 transition"
        >Delete</button>
      </div>
    )}

    <button onClick={() => onClick(tool)} className="flex flex-col h-full text-left">
      <div className={`flex items-start justify-between mb-6 ${isAdmin ? 'pr-24' : ''}`}>
        <div className="w-12 h-12 rounded-xl bg-page flex items-center justify-center text-xl border border-subtle group-hover:bg-main group-hover:text-white transition-all duration-300 shadow-sm">
          {tool.icon}
        </div>
        <DifficultyBadge level={tool.difficulty} />
      </div>
      <h3 className="text-main font-black text-sm uppercase tracking-tight mb-2 transition-colors">{tool.name}</h3>
      <p className="text-muted text-[11px] mb-6 leading-relaxed flex-grow italic font-medium">{tool.tagline}</p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-subtle">
        <span className="text-muted text-[9px] font-black uppercase tracking-widest">⏱ {tool.timeToLearn || tool.time_to_learn} cycle</span>
        <span className="text-main text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Access Guide →</span>
      </div>
    </button>
  </div>
);

// ─── Inline Admin Module Form (Modal) ──────────────────────────────
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const emptyForm = () => ({
  module_key: '', icon: '📚', name: '', tagline: '', route: '',
  difficulty: 'Beginner', time_to_learn: '3 min',
  what_text: '', why_text: '',
  how_to_use: [''], tips: [''], key_terms: [{ term: '', def: '' }],
  is_active: true, sort_order: 0,
});

const ModuleFormModal = ({ initial, onSave, onClose, saving }) => {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const arrUpdate = (k, i, v) => { const a = [...form[k]]; a[i] = v; set(k, a); };
  const arrAdd = (k, empty) => set(k, [...form[k], empty]);
  const arrRemove = (k, i) => set(k, form[k].filter((_, idx) => idx !== i));
  const ktUpdate = (i, field, v) => { const a = [...form.key_terms]; a[i] = { ...a[i], [field]: v }; set('key_terms', a); };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-subtle rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-subtle px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-main font-black text-xs uppercase tracking-widest">{form.id ? 'Edit Module' : 'New Module'}</h2>
          <button onClick={onClose} className="text-muted hover:text-main text-xl transition-colors">✕</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Key *</label>
              <input required value={form.module_key} onChange={e => set('module_key', e.target.value)}
                disabled={!!form.id}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition disabled:opacity-50" placeholder="my-module" />
            </div>
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Icon</label>
              <input value={form.icon} onChange={e => set('icon', e.target.value)}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" placeholder="📚" />
            </div>
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Name *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" placeholder="Module Name" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Tagline</label>
              <input value={form.tagline} onChange={e => set('tagline', e.target.value)}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" />
            </div>
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Route</label>
              <input value={form.route} onChange={e => set('route', e.target.value)}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" placeholder="/dashboard" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none transition">
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Time</label>
              <input value={form.time_to_learn} onChange={e => set('time_to_learn', e.target.value)}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" placeholder="3 min" />
            </div>
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" />
            </div>
          </div>

          {/* What / Why */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">What is it?</label>
              <textarea value={form.what_text} onChange={e => set('what_text', e.target.value)} rows={3}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition resize-none" />
            </div>
            <div>
              <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-1">Why use it?</label>
              <textarea value={form.why_text} onChange={e => set('why_text', e.target.value)} rows={3}
                className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition resize-none" />
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">How-to Steps</label>
            <div className="space-y-2">
              {form.how_to_use.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s} onChange={e => arrUpdate('how_to_use', i, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" placeholder={`Step ${i + 1}`} />
                  <button type="button" onClick={() => arrRemove('how_to_use', i)} className="text-red-500 hover:text-red-400 px-2">×</button>
                </div>
              ))}
              <button type="button" onClick={() => arrAdd('how_to_use', '')} className="text-[9px] font-black text-muted uppercase hover:text-main transition">+ Add Step</button>
            </div>
          </div>

          {/* Tips */}
          <div>
            <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Pro Tips</label>
            <div className="space-y-2">
              {form.tips.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input value={t} onChange={e => arrUpdate('tips', i, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" placeholder={`Tip ${i + 1}`} />
                  <button type="button" onClick={() => arrRemove('tips', i)} className="text-red-500 hover:text-red-400 px-2">×</button>
                </div>
              ))}
              <button type="button" onClick={() => arrAdd('tips', '')} className="text-[9px] font-black text-muted uppercase hover:text-main transition">+ Add Tip</button>
            </div>
          </div>

          {/* Key Terms */}
          <div>
            <label className="text-muted text-[9px] font-black uppercase tracking-widest block mb-2">Key Terms</label>
            <div className="space-y-2">
              {form.key_terms.map((kt, i) => (
                <div key={i} className="flex gap-2">
                  <input value={kt.term} onChange={e => ktUpdate(i, 'term', e.target.value)}
                    className="w-32 px-3 py-1.5 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" placeholder="Term" />
                  <input value={kt.def} onChange={e => ktUpdate(i, 'def', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" placeholder="Definition" />
                  <button type="button" onClick={() => arrRemove('key_terms', i)} className="text-red-500 hover:text-red-400 px-2">×</button>
                </div>
              ))}
              <button type="button" onClick={() => arrAdd('key_terms', { term: '', def: '' })} className="text-[9px] font-black text-muted uppercase hover:text-main transition">+ Add Term</button>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set('is_active', !form.is_active)}
              className={`px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition ${form.is_active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {form.is_active ? '✓ Published' : '✗ Hidden'}
            </button>
            <span className="text-muted text-[9px]">Toggle visibility on Learn Center</span>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t border-subtle">
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50">
              {saving ? 'Saving...' : (form.id ? 'Save Changes' : 'Create Module')}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-2 bg-card border border-subtle text-muted hover:text-main rounded-lg text-[10px] font-black uppercase tracking-widest transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Full Detail Modal ─────────────────────────────────────────────
const ToolDetail = ({ tool, onClose, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('what');

  const tabs = [
    { id: 'what', label: 'Operational Overview' },
    { id: 'how', label: 'Tactical Guide' },
    { id: 'tips', label: 'Intelligence Tips' },
    { id: 'terms', label: 'Glossary' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fade-in" onClick={onClose}>
      <div
        className="bg-card border border-subtle rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative transition-theme"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 p-5 z-10">
           <button onClick={onClose} className="text-muted hover:text-main text-xl transition-colors">✕</button>
        </div>

        {/* Header */}
        <div className="p-8 border-b border-subtle bg-page/5 transition-theme">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-page rounded-2xl flex items-center justify-center text-3xl border border-subtle text-main shadow-inner">
              {tool.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-2xl font-black text-main uppercase tracking-tight">{tool.name}</h2>
                 <DifficultyBadge level={tool.difficulty} />
              </div>
              <p className="text-muted text-sm font-medium italic">{tool.tagline}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-subtle bg-page/50 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-main bg-card' : 'text-muted hover:text-main'}`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-main transition-theme"></div>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-card transition-theme">
          {activeTab === 'what' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h4 className="text-main font-black text-[10px] uppercase tracking-[0.2em] mb-4">Functional Definition</h4>
                <p className="text-muted text-sm leading-relaxed font-medium">{tool.what}</p>
              </div>
              <div className="bg-page border-l-4 border-yellow p-6 rounded-2xl shadow-inner transition-theme">
                <h4 className="text-main font-black text-[10px] uppercase tracking-[0.2em] mb-2">Operational Significance</h4>
                <p className="text-muted text-sm leading-relaxed italic">{tool.why}</p>
              </div>
            </div>
          )}

          {activeTab === 'how' && (
            <div className="animate-fade-in">
              <h4 className="text-main font-black text-[10px] uppercase tracking-[0.2em] mb-6">Step-by-Step Tactical Procedure</h4>
              <ol className="space-y-5">
                {tool.howToUse.map((step, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <span className="w-6 h-6 rounded-full bg-main flex items-center justify-center text-white text-[9px] font-black flex-shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
                      {i + 1}
                    </span>
                    <span className="text-muted text-sm leading-relaxed font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="animate-fade-in">
              <h4 className="text-main font-black text-[10px] uppercase tracking-[0.2em] mb-6">Advanced Intelligence Practices</h4>
              <div className="space-y-4">
                {tool.tips.map((tip, i) => (
                  <div key={i} className="flex gap-4 bg-page border border-subtle rounded-xl p-4 shadow-sm transition-theme">
                    <span className="text-yellow text-lg flex-shrink-0">⚡</span>
                    <span className="text-muted text-[11px] leading-relaxed font-medium italic">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="animate-fade-in">
              <h4 className="text-main font-black text-[10px] uppercase tracking-[0.2em] mb-6">Nomenclature & Standards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.keyTerms.map((term, i) => (
                  <div key={i} className="bg-page border border-subtle rounded-xl p-4 transition-theme">
                    <p className="font-black text-main text-[9px] uppercase tracking-widest mb-1.5">{term.term}</p>
                    <p className="text-muted text-[10px] leading-relaxed italic font-medium">{term.def}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-subtle p-6 flex flex-col sm:flex-row items-center justify-between bg-page transition-theme gap-4">
          <p className="text-muted text-[9px] font-black uppercase tracking-widest text-center sm:text-left">Ready to initiate operation?</p>
          <button
            onClick={() => onNavigate(tool.route)}
            className="tenable-btn-primary w-full sm:w-auto px-10 py-3 text-[10px] tracking-[0.2em] uppercase"
          >
            Deploy {tool.name} →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helper: raw DB module → TOOLS shape ───────────────────────────
const normalise = m => ({
  id: m.id, module_key: m.module_key,
  icon: m.icon || '📚', name: m.name, tagline: m.tagline || '',
  route: m.route || '/', difficulty: m.difficulty || 'Beginner',
  timeToLearn: m.time_to_learn || '3 min',
  what: m.what_text || '', why: m.why_text || '',
  howToUse: Array.isArray(m.how_to_use) ? m.how_to_use : [],
  tips: Array.isArray(m.tips) ? m.tips : [],
  keyTerms: Array.isArray(m.key_terms) ? m.key_terms : [],
  is_active: m.is_active, sort_order: m.sort_order,
});

// ─── Main Learn Center Page ────────────────────────────────────────
export const LearnCenterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dbModules, setDbModules] = useState(null);
  const [formModal, setFormModal] = useState(null); // null | 'new' | {tool obj for edit}
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const loadModules = () => {
    const endpoint = isAdmin ? '/learn/all' : '/learn';
    api.get(endpoint)
      .then(res => {
        const data = res.data?.data || [];
        setDbModules(data.length > 0 ? data.map(normalise) : []);
      })
      .catch(() => setDbModules([]));
  };

  useEffect(() => { loadModules(); }, [isAdmin]);

  const tools = (dbModules && dbModules.length > 0) ? dbModules : TOOLS;

  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  const filtered = tools.filter(t =>
    (filter === 'all' || t.difficulty === filter) &&
    (search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.tagline.toLowerCase().includes(search.toLowerCase()))
  );

  const handleNavigate = (route) => { setSelected(null); navigate(route); };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/learn/${form.id}`, form);
        showToast('Module updated');
      } else {
        await api.post('/learn', form);
        showToast('Module created');
      }
      setFormModal(null);
      loadModules();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (tool) => {
    if (!tool.id) { showToast('Built-in modules cannot be deleted', false); return; }
    if (!window.confirm(`Delete "${tool.name}"?`)) return;
    try {
      await api.delete(`/learn/${tool.id}`);
      showToast('Module deleted');
      loadModules();
    } catch { showToast('Delete failed', false); }
  };

  const openEdit = (tool) => {
    if (!tool.id) { showToast('Edit built-in modules from Admin → Learn Center', false); return; }
    setFormModal({
      id: tool.id, module_key: tool.module_key || '',
      icon: tool.icon, name: tool.name, tagline: tool.tagline,
      route: tool.route, difficulty: tool.difficulty,
      time_to_learn: tool.timeToLearn || '3 min',
      what_text: tool.what, why_text: tool.why,
      how_to_use: tool.howToUse?.length ? tool.howToUse : [''],
      tips: tool.tips?.length ? tool.tips : [''],
      key_terms: tool.keyTerms?.length ? tool.keyTerms : [{ term: '', def: '' }],
      is_active: tool.is_active !== false,
      sort_order: tool.sort_order || 0,
    });
  };

  return (
    <div className="min-h-screen bg-page pt-24 pb-20 px-6 transition-theme">
      <div className="max-w-6xl mx-auto">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-[70] px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl transition-all ${toast.ok ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16 relative">
          {isAdmin && (
            <div className="absolute right-0 top-0 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/25 text-[9px] font-black uppercase tracking-widest rounded">Admin Mode</span>
              <button
                onClick={() => setFormModal('new')}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-lg"
              >+ Add Module</button>
            </div>
          )}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-main text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full mb-6 shadow-lg transition-theme">
            <span className="animate-pulse text-yellow">●</span> Knowledge Academy
          </div>
          <h1 className="text-5xl font-black text-main tracking-tighter mb-4 transition-theme">
            Intellectual Mastery Series
          </h1>
          <p className="text-muted text-lg max-w-3xl mx-auto font-medium italic opacity-80">
            Comprehensive operational guides designed to transform raw vulnerability data into strategic security intelligence.
          </p>
        </div>

        {/* Institutional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card border border-subtle rounded-3xl p-8 text-center shadow-sm relative overflow-hidden transition-theme">
            <div className="absolute top-0 left-0 w-full h-1 bg-main opacity-20"></div>
            <p className="text-4xl font-black text-main tracking-tighter">{tools.length}</p>
            <p className="text-muted text-[10px] font-black uppercase tracking-widest mt-2">Operational Modules</p>
          </div>
          <div className="bg-card border border-subtle rounded-3xl p-8 text-center shadow-sm relative overflow-hidden transition-theme">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-20"></div>
            <p className="text-4xl font-black text-green-500 tracking-tighter">{tools.filter(t => t.difficulty === 'Beginner').length}</p>
            <p className="text-muted text-[10px] font-black uppercase tracking-widest mt-2">Onboarding Essentials</p>
          </div>
          <div className="bg-card border border-subtle rounded-3xl p-8 text-center shadow-sm relative overflow-hidden transition-theme">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow opacity-20"></div>
            <p className="text-4xl font-black text-main tracking-tighter">~{tools.reduce((a, t) => a + parseInt(t.timeToLearn || t.time_to_learn || 0), 0)} min</p>
            <p className="text-muted text-[10px] font-black uppercase tracking-widest mt-2">Total Intelligence Cycle</p>
          </div>
        </div>

        {/* Global Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center">
          <div className="flex bg-card border border-subtle rounded-2xl p-1 shadow-sm transition-theme overflow-x-auto max-w-full scrollbar-hide">
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-8 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-xl whitespace-nowrap ${filter === d ? 'bg-main text-white shadow-lg' : 'text-muted hover:text-main'}`}
              >
                {d === 'all' ? 'Unfiltered' : d}
              </button>
            ))}
          </div>
          <div className="flex-1 w-full relative">
            <input
              type="text"
              placeholder="Search intelligence index..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-card border border-subtle rounded-2xl px-6 py-4 text-sm text-main font-bold placeholder-muted/40 focus:outline-none focus:ring-2 focus:ring-main/20 shadow-sm transition-all"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted opacity-40">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
            </div>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 animate-fade-in">
          {filtered.map((tool, i) => (
            <ToolCard
              key={tool.id || tool.module_key || i}
              tool={tool}
              onClick={setSelected}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-card border border-dashed border-subtle rounded-3xl transition-theme">
            <p className="text-5xl mb-6 opacity-30">🔍</p>
            <p className="text-main font-black text-sm uppercase tracking-widest mb-2">No matching intelligence found</p>
            <p className="text-muted text-xs">Adjust your filters to expand the search.</p>
          </div>
        )}

        {/* Strategic Roadmap */}
        <div className="bg-gradient-to-br from-main to-main/90 rounded-3xl p-12 shadow-2xl relative overflow-hidden transition-theme">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <svg className="w-64 h-64" fill="white" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-white font-black text-3xl uppercase tracking-tight mb-2">Operational Roadmap</h2>
            <p className="text-white/60 text-sm mb-12 italic">Optimized sequence for accelerated system proficiency.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {['dashboard', 'live-feed', 'watchlist', 'asset-inventory', 'risk-dashboard', 'cvss-calculator'].map((id, i) => {
                const tool = tools.find(t => (t.id || t.module_key) === id);
                if (!tool) return null;
                return (
                  <button 
                    key={id} 
                    onClick={() => setSelected(tool)} 
                    className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-yellow transition-all group scale-100 hover:scale-105"
                  >
                    <span className="text-white/40 text-[9px] font-black mb-4">#0{i + 1}</span>
                    <span className="text-3xl mb-4 group-hover:scale-110 transition-transform">{tool.icon}</span>
                    <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] text-center leading-relaxed">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Admin: Create / Edit Module Modal */}
      {formModal !== null && (
        <ModuleFormModal
          initial={formModal === 'new' ? emptyForm() : formModal}
          onSave={handleSave}
          onClose={() => setFormModal(null)}
          saving={saving}
        />
      )}

      {/* Detail Modal Infrastructure */}
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
