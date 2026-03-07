import React, { useState, useMemo } from 'react';

const METRICS = {
  AV: { name: 'Attack Vector', options: [
    { value: 'N', label: 'Network', score: 0.85 },
    { value: 'A', label: 'Adjacent', score: 0.62 },
    { value: 'L', label: 'Local', score: 0.55 },
    { value: 'P', label: 'Physical', score: 0.20 }
  ]},
  AC: { name: 'Attack Complexity', options: [
    { value: 'L', label: 'Low', score: 0.77 },
    { value: 'H', label: 'High', score: 0.44 }
  ]},
  PR: { name: 'Privileges Required', options: [
    { value: 'N', label: 'None', score: 0.85 },
    { value: 'L', label: 'Low', score: 0.62 },
    { value: 'H', label: 'High', score: 0.27 }
  ]},
  UI: { name: 'User Interaction', options: [
    { value: 'N', label: 'None', score: 0.85 },
    { value: 'R', label: 'Required', score: 0.62 }
  ]},
  S: { name: 'Scope', options: [
    { value: 'U', label: 'Unchanged', score: 0 },
    { value: 'C', label: 'Changed', score: 1 }
  ]},
  C: { name: 'Confidentiality', options: [
    { value: 'N', label: 'None', score: 0.0 },
    { value: 'L', label: 'Low', score: 0.22 },
    { value: 'H', label: 'High', score: 0.56 }
  ]},
  I: { name: 'Integrity', options: [
    { value: 'N', label: 'None', score: 0.0 },
    { value: 'L', label: 'Low', score: 0.22 },
    { value: 'H', label: 'High', score: 0.56 }
  ]},
  A: { name: 'Availability', options: [
    { value: 'N', label: 'None', score: 0.0 },
    { value: 'L', label: 'Low', score: 0.22 },
    { value: 'H', label: 'High', score: 0.56 }
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

    // ISS = 1 - [(1 - C) × (1 - I) × (1 - A)]
    const iss = 1 - ((1 - c) * (1 - i) * (1 - a));

    if (iss <= 0) return { score: 0, severity: 'None', vector: buildVector() };

    // Impact
    let impact;
    if (!scopeChanged) {
      impact = 6.42 * iss;
    } else {
      impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    }

    // Exploitability
    const exploitability = 8.22 * av * ac * pr * ui;

    // Base Score
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
    None: { bg: 'bg-slate-500', text: 'text-slate-300', ring: 'ring-slate-500' },
    Low: { bg: 'bg-green-500', text: 'text-green-400', ring: 'ring-green-500' },
    Medium: { bg: 'bg-yellow-500', text: 'text-yellow-400', ring: 'ring-yellow-500' },
    High: { bg: 'bg-orange-500', text: 'text-orange-400', ring: 'ring-orange-500' },
    Critical: { bg: 'bg-red-500', text: 'text-red-400', ring: 'ring-red-500' }
  };

  const currentColors = severityColors[calculation.severity] || severityColors.None;

  const copyVector = () => {
    if (calculation.vector) {
      navigator.clipboard.writeText(calculation.vector);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          CVSS v3.1 Calculator
        </h1>
        <p className="text-slate-400 mb-8">Calculate Common Vulnerability Scoring System scores</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metrics Selection */}
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(METRICS).map(([key, metric]) => (
              <div key={key} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">{metric.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {metric.options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelected(prev => ({ ...prev, [key]: opt.value }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selected[key] === opt.value
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Score Display */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center sticky top-6">
              <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-4">Base Score</h3>
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ring-4 ${currentColors.ring} bg-slate-900`}>
                <span className={`text-4xl font-bold ${currentColors.text}`}>
                  {calculation.score !== null ? calculation.score : '—'}
                </span>
              </div>
              {calculation.severity && (
                <span className={`inline-block mt-4 px-4 py-1 rounded-full text-sm font-medium ${currentColors.bg} text-white`}>
                  {calculation.severity}
                </span>
              )}

              {/* Vector String */}
              {calculation.vector && (
                <div className="mt-6">
                  <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Vector String</h4>
                  <div className="bg-slate-900 rounded-lg p-3 text-xs text-cyan-400 font-mono break-all">
                    {calculation.vector}
                  </div>
                  <button
                    onClick={copyVector}
                    className="mt-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    📋 Copy to clipboard
                  </button>
                </div>
              )}

              {/* Score Bar */}
              <div className="mt-6">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${currentColors.bg}`}
                    style={{ width: `${(calculation.score || 0) * 10}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h4 className="text-white text-sm font-medium mb-3">Severity Scale</h4>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'None', range: '0.0', color: 'bg-slate-500' },
                  { label: 'Low', range: '0.1 - 3.9', color: 'bg-green-500' },
                  { label: 'Medium', range: '4.0 - 6.9', color: 'bg-yellow-500' },
                  { label: 'High', range: '7.0 - 8.9', color: 'bg-orange-500' },
                  { label: 'Critical', range: '9.0 - 10.0', color: 'bg-red-500' }
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                      <span className="text-slate-300">{s.label}</span>
                    </div>
                    <span className="text-slate-500">{s.range}</span>
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
