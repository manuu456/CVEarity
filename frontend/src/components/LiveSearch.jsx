import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const severityColors = {
  critical: 'text-red-400 bg-red-500/20',
  high: 'text-orange-400 bg-orange-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  low: 'text-green-400 bg-green-500/20',
  unknown: 'text-slate-400 bg-slate-500/20'
};

export const LiveSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/live/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(res.data.data || []);
        setIsOpen(true);
      } catch (e) {
        setResults([]);
      }
      setLoading(false);
    };
    search();
  }, [debouncedQuery]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && selectedIndex >= 0) {
      selectResult(results[selectedIndex]);
    }
    if (e.key === 'Escape') { setIsOpen(false); onClose?.(); }
  };

  const selectResult = (cve) => {
    navigate(`/cve/${cve.cve_id}`);
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 gap-2 focus-within:border-cyan-500 transition-colors">
        <span className="text-slate-400 text-sm">🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search CVEs... (e.g. Apache, CVE-2024)"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="bg-transparent text-white text-sm flex-1 outline-none placeholder-slate-500"
          autoFocus
        />
        {loading && <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>}
        {query && <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }} className="text-slate-500 hover:text-white">✕</button>}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[200]">
          {results.map((cve, i) => (
            <div
              key={cve.cve_id}
              onClick={() => selectResult(cve)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${i === selectedIndex ? 'bg-cyan-500/20' : 'hover:bg-slate-700'}`}
            >
              <span className="text-cyan-400 font-mono text-xs font-bold w-28 flex-shrink-0">{cve.cve_id}</span>
              <span className="text-slate-300 text-sm truncate flex-1">{cve.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${severityColors[cve.severity] || severityColors.unknown}`}>
                {cve.severity}
              </span>
            </div>
          ))}
          <div className="px-4 py-2 border-t border-slate-700 text-xs text-slate-500">
            ↑↓ navigate • Enter to open • Esc to close
          </div>
        </div>
      )}

      {isOpen && results.length === 0 && debouncedQuery.length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 text-center text-slate-400 text-sm z-[200]">
          No CVEs matching "{debouncedQuery}"
        </div>
      )}
    </div>
  );
};
