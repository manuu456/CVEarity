import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const emptyForm = () => ({
  module_key: '', icon: '📚', name: '', tagline: '', route: '',
  difficulty: 'Beginner', time_to_learn: '3 min',
  what_text: '', why_text: '',
  how_to_use: [''],
  tips: [''],
  key_terms: [{ term: '', def: '' }],
  is_active: true, sort_order: 0,
});

const DiffBadge = ({ level }) => {
  const cls = { Beginner: 'text-green-400 border-green-500/30 bg-green-500/10', Intermediate: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', Advanced: 'text-red-400 border-red-500/30 bg-red-500/10' };
  return <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${cls[level] || cls.Beginner}`}>{level}</span>;
};

// ─── Array field editor (steps / tips) ───────────────────────────────────────
const ArrayField = ({ label, items, onChange }) => {
  const update = (i, val) => { const a = [...items]; a[i] = val; onChange(a); };
  const add = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input value={item} onChange={e => update(i, e.target.value)}
              className="flex-1 px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
              placeholder={`${label} #${i + 1}`} />
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-400 px-2 text-lg leading-none">×</button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-[10px] font-black text-muted uppercase tracking-widest hover:text-main transition">+ Add</button>
      </div>
    </div>
  );
};

// ─── Key terms editor ─────────────────────────────────────────────────────────
const KeyTermsField = ({ items, onChange }) => {
  const update = (i, field, val) => { const a = [...items]; a[i] = { ...a[i], [field]: val }; onChange(a); };
  const add = () => onChange([...items, { term: '', def: '' }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Key Terms</label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex gap-2 flex-1">
              <input value={item.term} onChange={e => update(i, 'term', e.target.value)}
                className="w-36 px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
                placeholder="Term" />
              <input value={item.def} onChange={e => update(i, 'def', e.target.value)}
                className="flex-1 px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
                placeholder="Definition" />
            </div>
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-400 px-2 text-lg leading-none mt-1">×</button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-[10px] font-black text-muted uppercase tracking-widest hover:text-main transition">+ Add Term</button>
      </div>
    </div>
  );
};

// ─── Module form (create / edit) ──────────────────────────────────────────────
const ModuleForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial);
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-6">
      {/* Row 1: key + icon + name */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Module Key *</label>
          <input required value={form.module_key} onChange={e => set('module_key', e.target.value)}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
            placeholder="e.g. my-tool" />
        </div>
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Icon (emoji)</label>
          <input value={form.icon} onChange={e => set('icon', e.target.value)}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
            placeholder="📚" />
        </div>
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
            placeholder="Module name" />
        </div>
      </div>

      {/* Row 2: tagline + route */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Tagline</label>
          <input value={form.tagline} onChange={e => set('tagline', e.target.value)}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
            placeholder="Short description" />
        </div>
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Route (e.g. /dashboard)</label>
          <input value={form.route} onChange={e => set('route', e.target.value)}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
            placeholder="/dashboard" />
        </div>
      </div>

      {/* Row 3: difficulty + time + sort + active */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Difficulty</label>
          <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none transition">
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Time to Learn</label>
          <input value={form.time_to_learn} onChange={e => set('time_to_learn', e.target.value)}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition"
            placeholder="3 min" />
        </div>
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Sort Order</label>
          <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition" />
        </div>
        <div className="flex flex-col">
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Published</label>
          <button type="button" onClick={() => set('is_active', !form.is_active)}
            className={`mt-1 px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition ${form.is_active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {form.is_active ? '✓ Active' : '✗ Hidden'}
          </button>
        </div>
      </div>

      {/* What + Why */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">What is it?</label>
          <textarea value={form.what_text} onChange={e => set('what_text', e.target.value)} rows={4}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition resize-none"
            placeholder="Describe the module..." />
        </div>
        <div>
          <label className="text-muted text-[10px] font-black uppercase tracking-widest block mb-2">Why use it?</label>
          <textarea value={form.why_text} onChange={e => set('why_text', e.target.value)} rows={4}
            className="w-full px-3 py-2 bg-page border border-subtle rounded-lg text-sm text-main focus:outline-none focus:border-white/30 transition resize-none"
            placeholder="Explain the importance..." />
        </div>
      </div>

      {/* Steps, Tips, Key Terms */}
      <ArrayField label="How-to Steps" items={form.how_to_use} onChange={v => set('how_to_use', v)} />
      <ArrayField label="Pro Tips" items={form.tips} onChange={v => set('tips', v)} />
      <KeyTermsField items={form.key_terms} onChange={v => set('key_terms', v)} />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Module'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2 bg-card border border-subtle text-muted hover:text-main rounded-lg text-[10px] font-black uppercase tracking-widest transition">
          Cancel
        </button>
      </div>
    </form>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export const LearnCenterManagePage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null); // null | 'create' | { ...editModule }
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/learn/all');
      setModules(res.data?.data || []);
      setError(null);
    } catch {
      setError('Failed to load modules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/learn/${form.id}`, form);
        showToast('Module updated successfully');
      } else {
        await api.post('/learn', form);
        showToast('Module created successfully');
      }
      setMode(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete module "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/learn/${id}`);
      showToast('Module deleted');
      load();
    } catch {
      showToast('Delete failed', false);
    }
  };

  const handleToggleActive = async (m) => {
    try {
      await api.put(`/learn/${m.id}`, { ...m, is_active: !m.is_active });
      load();
    } catch {
      showToast('Update failed', false);
    }
  };

  return (
    <div className="min-h-screen bg-page pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl transition-all ${toast.ok ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-main tracking-tight">Learn Center</h1>
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/25 text-[10px] font-black uppercase tracking-widest rounded">Admin</span>
            </div>
            <p className="text-muted text-sm font-medium">Manage the Intellectual Mastery Series modules visible to all users.</p>
          </div>
          {mode === null && (
            <button onClick={() => setMode('create')}
              className="self-start sm:self-auto px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-lg">
              + New Module
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 border-l-4 border-l-red-500 p-4 rounded-lg text-red-400 text-xs font-bold">{error}</div>
        )}

        {/* Create / Edit form */}
        {mode !== null && (
          <div className="bg-card border border-subtle rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-subtle">
              <h2 className="text-main font-black text-[10px] uppercase tracking-widest">
                {mode === 'create' ? 'Create New Module' : `Editing: ${mode.name}`}
              </h2>
            </div>
            <div className="p-6">
              <ModuleForm
                initial={mode === 'create' ? emptyForm() : {
                  ...mode,
                  how_to_use: mode.how_to_use?.length ? mode.how_to_use : [''],
                  tips: mode.tips?.length ? mode.tips : [''],
                  key_terms: mode.key_terms?.length ? mode.key_terms : [{ term: '', def: '' }],
                }}
                onSave={handleSave}
                onCancel={() => setMode(null)}
                saving={saving}
              />
            </div>
          </div>
        )}

        {/* Modules list */}
        <div className="bg-card border border-subtle rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
            <h3 className="text-main font-black text-[10px] uppercase tracking-widest">
              All Modules <span className="ml-2 text-muted font-bold text-[9px]">({modules.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="divide-y divide-subtle">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-page rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-page rounded w-48 animate-pulse" />
                    <div className="h-3 bg-page rounded w-72 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-4">No modules yet</p>
              <p className="text-muted text-xs mb-6">The Learn Center will show default built-in modules until you add custom ones here.</p>
              <button onClick={() => setMode('create')}
                className="px-5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition">
                + Create First Module
              </button>
            </div>
          ) : (
            <div className="divide-y divide-subtle">
              {modules.map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-page/50 transition group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border ${m.is_active ? 'border-subtle bg-page' : 'border-subtle bg-page opacity-40'}`}>
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-main font-bold text-sm">{m.name}</span>
                      <DiffBadge level={m.difficulty} />
                      {!m.is_active && <span className="text-[9px] font-black text-muted uppercase tracking-widest border border-subtle rounded px-1.5 py-0.5">Hidden</span>}
                    </div>
                    <div className="text-muted text-[10px] font-medium truncate">{m.tagline}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleToggleActive(m)}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded border transition ${m.is_active ? 'text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10' : 'text-green-400 border-green-500/30 hover:bg-green-500/10'}`}>
                      {m.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => setMode(m)}
                      className="text-[9px] font-black uppercase px-2 py-1 rounded border border-subtle text-muted hover:text-main hover:border-white/20 transition">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(m.id, m.name)}
                      className="text-[9px] font-black uppercase px-2 py-1 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-card border border-subtle rounded-xl p-5">
          <h4 className="text-main font-black text-[10px] uppercase tracking-widest mb-2">How it works</h4>
          <p className="text-muted text-xs leading-relaxed">
            Modules added here appear on the public <span className="text-main font-bold">/learn</span> page for all users.
            If the database has no custom modules, the page shows built-in default guides.
            Use <span className="text-main font-bold">Sort Order</span> (lower = first) to control display sequence.
            Hidden modules are saved but not visible to regular users.
          </p>
        </div>

      </div>
    </div>
  );
};
