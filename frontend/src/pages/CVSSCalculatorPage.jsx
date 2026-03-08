import React, { useState, useMemo } from 'react';

const METRICS = {
  AV: { name: 'Attack Vector (AV)', options: [
    { value: 'N', label: 'Network', score: 0.85, desc: 'Remotely exploitable' },
    { value: 'A', label: 'Adjacent', score: 0.62, desc: 'Local network shared' },
    { value: 'L', label: 'Local', score: 0.55, desc: 'Physical or shell access' },
    { value: 'P', label: 'Physical', score: 0.20, desc: 'Hardware interaction needed' }
  ]},
  AC: { name: 'Attack Complexity (AC)', options: [
    { value: 'L', label: 'Low', score: 0.77, desc: 'Minimal effort required' },
    { value: 'H', label: 'High', score: 0.44, desc: 'Specific conditions needed' }
  ]},
  PR: { name: 'Privileges Required (PR)', options: [
    { value: 'N', label: 'None', score: 0.85, desc: 'Unauthenticated access' },
    { value: 'L', label: 'Low', score: 0.62, desc: 'Basic user permissions' },
    { value: 'H', label: 'High', score: 0.27, desc: 'Administrative control' }
  ]},
  UI: { name: 'User Interaction (UI)', options: [
    { value: 'N', label: 'None', score: 0.85, desc: 'Zero interaction required' },
    { value: 'R', label: 'Required', score: 0.62, desc: 'User action necessary' }
  ]},
  S: { name: 'Scope (S)', options: [
    { value: 'U', label: 'Unchanged', score: 0, desc: 'Impact only on target' },
    { value: 'C', label: 'Changed', score: 1, desc: 'Impact beyond target' }
  ]},
  C: { name: 'Confidentiality (C)', options: [
    { value: 'N', label: 'None', score: 0.0, desc: 'Data remains secure' },
    { value: 'L', label: 'Low', score: 0.22, desc: 'Minor data disclosure' },
    { value: 'H', label: 'High', score: 0.56, desc: 'Total data compromise' }
  ]},
  I: { name: 'Integrity (I)', options: [
    { value: 'N', label: 'None', score: 0.0, desc: 'No data modification' },
    { value: 'L', label: 'Low', score: 0.22, desc: 'Minor corruption possible' },
    { value: 'H', label: 'High', score: 0.56, desc: 'Full system modification' }
  ]},
  A: { name: 'Availability (A)', options: [
    { value: 'N', label: 'None', score: 0.0, desc: 'Service remains active' },
    { value: 'L', label: 'Low', score: 0.22, desc: 'Reduced performance' },
    { value: 'H', label: 'High', score: 0.56, desc: 'Target fully offline' }
  ]}
};

const PR_SCORES_CHANGED = { N: 0.85, L: 0.68, H: 0.50 };

export const CVSSCalculatorPage = () => {
  const [selected, setSelected] = useState({
    AV: null, AC: null, PR: null, UI: null, S: null, C: null, I: null, A: null
  });

  const calculation = useMemo(() => {
    const allSelected = Object.values(selected).every(v => v !== null);
    if (!allSelected) return { score: null, severity: null, vector: null };

    const av = METRICS.AV.options.find(o => o.value === selected.AV).score;
    const ac = METRICS.AC.options.find(o => o.value === selected.AC).score;
    const ui = METRICS.UI.options.find(o => o.value === selected.UI).score;
    const scopeChanged = selected.S === 'C';
    const pr = scopeChanged
      ? PR_SCORES_CHANGED[selected.PR]
      : METRICS.PR.options.find(o => o.value === selected.PR).score;
    const c = METRICS.C.options.find(o => o.value === selected.C).score;
    const i = METRICS.I.options.find(o => o.value === selected.I).score;
    const a = METRICS.A.options.find(o => o.value === selected.A).score;

    const iss = 1 - ((1 - c) * (1 - i) * (1 - a));
    if (iss <= 0) return { score: 0, severity: 'None', vector: buildVector() };

    let impact;
    if (!scopeChanged) {
      impact = 6.42 * iss;
    } else {
      impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    }

    const exploitability = 8.22 * av * ac * pr * ui;

    let score;
    if (impact <= 0) {
      score = 0;
    } else if (!scopeChanged) {
      score = Math.min(impact + exploitability, 10);
    } else {
      score = Math.min(1.08 * (impact + exploitability), 10);
    }

    score = Math.ceil(score * 10) / 10;

    let severity;
    if (score === 0) severity = 'None';
    else if (score <= 3.9) severity = 'Low';
    else if (score <= 6.9) severity = 'Medium';
    else if (score <= 8.9) severity = 'High';
    else severity = 'Critical';

    return { score, severity, vector: buildVector() };
  }, [selected]);

  function buildVector() {
    const parts = Object.entries(selected)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => `${k}:${v}`);
    return parts.length > 0 ? `CVSS:3.1/${parts.join('/')}` : '';
  }

  const severityColors = {
    None: { text: 'text-muted', ring: 'border-subtle', bg: 'bg-muted' },
    Low: { text: 'text-green-500', ring: 'border-green-500', bg: 'bg-green-500' },
    Medium: { text: 'text-yellow', ring: 'border-yellow', bg: 'bg-yellow' },
    High: { text: 'text-orange-500', ring: 'border-orange-500', bg: 'bg-orange-500' },
    Critical: { text: 'text-red-500', ring: 'border-red-500', bg: 'bg-red-500' }
  };

  const currentColors = severityColors[calculation.severity] || severityColors.None;

  const copyVector = () => {
    if (calculation.vector) {
      navigator.clipboard.writeText(calculation.vector);
    }
  };

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6 transition-theme">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-subtle pb-8 gap-6">
           <div>
              <div className="flex items-center gap-4 mb-2">
                 <h1 className="text-4xl font-black text-main tracking-tight">CVSS v3.1 Matrix</h1>
                 <span className="px-2 py-0.5 bg-main text-white text-[9px] font-black uppercase tracking-widest rounded transition-theme">Scoring Engine</span>
              </div>
              <p className="text-muted text-sm font-medium italic">Standardized framework for communicating the characteristics and severity of software vulnerabilities.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Base Metric Groups */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(METRICS).map(([key, metric]) => (
              <div key={key} className="bg-card border border-subtle rounded-2xl shadow-sm p-6 overflow-hidden relative transition-theme">
                <div className="absolute top-0 left-0 w-full h-1 bg-subtle/5"></div>
                <h3 className="text-main font-black text-[11px] uppercase tracking-widest mb-6">{metric.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {metric.options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelected(prev => ({ ...prev, [key]: opt.value }))}
                      className={`group p-3 rounded-xl border text-left transition-all ${
                        selected[key] === opt.value
                          ? 'border-main bg-main text-white'
                          : 'border-subtle bg-page text-main hover:border-main'
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase mb-1">{opt.label}</div>
                      <div className={`text-[8px] font-medium leading-tight ${selected[key] === opt.value ? 'text-white/80' : 'text-muted'}`}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Scorecard */}
          <div className="space-y-6">
            <div className="bg-card border border-subtle rounded-3xl p-10 text-center sticky top-28 shadow-lg transition-theme">
              <h3 className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-8">Computed Base Score</h3>
              
              <div className={`w-40 h-40 mx-auto rounded-full border-8 flex items-center justify-center ${currentColors.ring} bg-card shadow-inner transition-theme`}>
                 <div className="text-center">
                    <div className={`text-5xl font-black ${currentColors.text} tracking-tighter`}>
                      {calculation.score !== null ? calculation.score : '—'}
                    </div>
                    {calculation.severity && (
                       <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${currentColors.text}`}>
                          {calculation.severity}
                       </div>
                    )}
                 </div>
              </div>

              {/* Vector Matrix */}
              {calculation.vector && (
                <div className="mt-10">
                  <div className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-3">Vector Identification String</div>
                  <div className="bg-page border border-subtle rounded-xl p-4 text-[10px] text-main font-mono break-all leading-relaxed transition-theme">
                    {calculation.vector}
                  </div>
                  <button
                    onClick={copyVector}
                    className="mt-4 text-[9px] font-black text-main uppercase border-b border-main hover:text-opacity-70 transition-theme"
                  >
                    Copy Intelligence Vector
                  </button>
                </div>
              )}

              {/* Tactical Progress Bar */}
              <div className="mt-10">
                <div className="w-full bg-page rounded-full h-1.5 transition-theme">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${currentColors.bg}`}
                    style={{ width: `${(calculation.score || 0) * 10}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] font-black text-muted uppercase mt-2">
                  <span>Baseline</span>
                  <span>Critical (10.0)</span>
                </div>
              </div>
            </div>

            {/* Severity Threshold Matrix */}
            <div className="bg-card border border-subtle rounded-2xl p-6 shadow-sm transition-theme text-main">
              <h4 className="text-main font-black text-[10px] uppercase tracking-widest mb-4">Severity Threshold Matrix</h4>
              <div className="space-y-3">
                {[
                  { label: 'None', range: '0.0', color: 'bg-muted' },
                  { label: 'Low', range: '0.1 - 3.9', color: 'bg-green-500' },
                  { label: 'Medium', range: '4.0 - 6.9', color: 'bg-yellow' },
                  { label: 'High', range: '7.0 - 8.9', color: 'bg-orange-500' },
                  { label: 'Critical', range: '9.0 - 10.0', color: 'bg-red-500' }
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1 border-b border-subtle last:border-0 transition-theme">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${s.color}`}></div>
                      <span className="text-[10px] font-black text-main uppercase tracking-tight">{s.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted transition-theme">{s.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
