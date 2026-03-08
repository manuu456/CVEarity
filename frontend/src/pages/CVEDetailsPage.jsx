import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCVEById } from '../services/api';
import { SeverityBadge, LoadingSkeleton } from '../components/common';

export const CVEDetailsPage = () => {
  const { cveId } = useParams();
  const navigate = useNavigate();
  const [cve, setCVE] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCVEDetails = async () => {
      try {
        const response = await getCVEById(cveId);
        if (response.success) {
          setCVE(response.data);
        } else {
          setError('CVE not found');
        }
      } catch (err) {
        setError(err.message || 'Error fetching CVE details');
        console.error('Error fetching CVE:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCVEDetails();
  }, [cveId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page pt-20 pb-12 px-4 transition-theme">
        <div className="max-w-5xl mx-auto space-y-8">
          <LoadingSkeleton className="h-10 w-96 rounded-lg" />
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LoadingSkeleton className="h-48 w-full rounded-2xl" />
            <LoadingSkeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !cve) {
    return (
      <div className="min-h-screen bg-page pt-20 pb-12 px-4 transition-theme">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-card border border-subtle p-12 rounded-2xl shadow-sm transition-theme">
            <div className="text-red-600 text-5xl mb-6">⚠️</div>
            <h1 className="text-2xl font-black text-main mb-4 uppercase tracking-tight">Security Intelligence Error</h1>
            <p className="text-muted font-medium mb-8 max-w-md mx-auto">{error || 'The requested CVE identifier could not be located in the primary vulnerability directory.'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="tenable-btn-primary px-8 py-3 text-[10px] tracking-[0.2em] uppercase"
            >
              Return to Control Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pt-20 pb-12 px-4 transition-theme">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Action */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[10px] font-black text-main uppercase tracking-widest border-b-2 border-yellow pb-0.5 hover:bg-yellow/10 transition px-2"
          >
            <svg className="w-3 h-3 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
            Backward Track
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Source:</span>
            <span className="text-[10px] font-black text-main uppercase tracking-widest bg-card px-2 py-0.5 border border-subtle rounded transition-theme">National Vulnerability Database</span>
          </div>
        </div>

        {/* Primary Intelligence Header */}
        <div className="bg-card border border-subtle rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row transition-theme">
           <div className="p-8 md:p-10 flex-1 border-b md:border-b-0 md:border-r border-subtle">
              <div className="flex items-center flex-wrap gap-3 mb-4">
                 <h1 className="text-4xl font-black text-main tracking-tighter">{cve.cveId}</h1>
                 <SeverityBadge severity={cve.severity} />
                 {(cve.hasExploit || cve.has_exploit) && (
                   <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/30">Known Exploit</span>
                 )}
                 {(cve.isKEV || cve.is_kev) && (
                   <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest bg-purple-500/15 text-purple-400 border border-purple-500/30">CISA KEV</span>
                 )}
              </div>
              <h2 className="text-xl font-bold text-main leading-tight mb-6">{cve.title || 'Untitled vulnerability record'}</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 pt-6 border-t border-subtle">
                 <div>
                    <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">CVSS Score</div>
                    <div className="text-2xl font-black text-main tracking-tighter">{cve.severityScore || 'N/A'}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">EPSS Score</div>
                    <div className="text-2xl font-black tracking-tighter" style={{ color: cve.epssScore == null ? '#9ca3af' : cve.epssScore > 0.5 ? '#ef4444' : cve.epssScore > 0.1 ? '#f97316' : '#22C55E' }}>
                      {cve.epssScore != null ? `${(cve.epssScore * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className="text-[8px] text-muted font-bold">Exploit Probability</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Published</div>
                    <div className="text-sm font-black text-main">{new Date(cve.publishedDate).toLocaleDateString()}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Modified</div>
                    <div className="text-sm font-black text-main">{new Date(cve.lastModified || cve.publishedDate).toLocaleDateString()}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Exploit Status</div>
                    <div className={`text-sm font-black uppercase tracking-tight ${(cve.hasExploit || cve.has_exploit) ? 'text-red-400' : 'text-green-500'}`}>
                      {(cve.hasExploit || cve.has_exploit) ? 'Exploit Known' : 'No Public Exploit'}
                    </div>
                 </div>
              </div>
           </div>
           
            <div className="bg-main p-10 text-white min-w-[300px] flex flex-col justify-center items-start relative overflow-hidden transition-theme">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
               <div className="relative z-10 w-full">
                  <div className="flex items-baseline gap-2 mb-1">
                     <span className="text-5xl font-black text-white tracking-tighter">{cve.severityScore || '0.0'}</span>
                     <span className="text-yellow font-black text-xs uppercase tracking-widest">/ 10.0</span>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-6">Institutional Risk Index</div>
                  
                  <div className="space-y-4 w-full">
                     <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/40">
                        <span>Exploitability</span>
                        <span className="text-white">High</span>
                     </div>
                     <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow w-[85%] rounded-full"></div>
                     </div>
                     <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/40">
                        <span>Impact Magnitude</span>
                        <span className="text-white">High</span>
                     </div>
                     <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[90%] rounded-full"></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Vector Breakdown Matrix */}
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
               { l: 'AV', v: 'Network', c: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
               { l: 'AC', v: 'Low', c: 'bg-green-500/10 text-green-500 border-green-500/20' },
               { l: 'PR', v: 'None', c: 'bg-green-500/10 text-green-500 border-green-500/20' },
               { l: 'UI', v: 'None', c: 'bg-green-500/10 text-green-500 border-green-500/20' },
               { l: 'S', v: 'Unchanged', c: 'bg-gray-500/10 text-muted border-subtle' },
               { l: 'C', v: 'High', c: 'bg-red-500/10 text-red-500 border-red-500/20' },
               { l: 'I', v: 'High', c: 'bg-red-500/10 text-red-500 border-red-500/20' },
               { l: 'A', v: 'High', c: 'bg-red-500/10 text-red-500 border-red-500/20' }
            ].map((m, i) => (
               <div key={i} className="bg-card border border-subtle p-3 rounded-lg shadow-sm transition-theme">
                  <div className="text-[8px] font-black text-muted uppercase mb-1 tracking-widest">{m.l}</div>
                  <div className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded text-center border ${m.c}`}>{m.v}</div>
               </div>
            ))}
         </div>

        {/* Contextual Narrative */}
        <div className="bg-card border border-subtle rounded-2xl p-10 shadow-sm relative overflow-hidden transition-theme">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          </div>
          <h3 className="text-main font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-5 h-0.5 bg-yellow"></span>
            Technical Intelligence Summary
          </h3>
          <p className="text-main/90 text-sm font-medium leading-[1.8] relative z-10">{cve.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Deployment Targets (Affected Software) */}
           <div className="bg-card border border-subtle rounded-2xl shadow-sm overflow-hidden transition-theme">
             <div className="px-8 py-5 border-b border-subtle bg-subtle/10">
                <h3 className="text-main font-black text-[10px] uppercase tracking-widest">Compromisable Infrastructures</h3>
             </div>
             <div className="p-8">
                {cve.affectedSoftware && cve.affectedSoftware.length > 0 ? (
                  <div className="space-y-3">
                    {cve.affectedSoftware.map((software, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-page p-3 border border-subtle rounded-lg transition-theme hover:border-main">
                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                        <span className="text-main font-bold text-xs">{software}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-[10px] font-black uppercase tracking-widest italic">No institutional software mapping available for this record.</p>
                )}
             </div>
           </div>

           {/* Forensic Evidence (References) */}
           <div className="bg-card border border-subtle rounded-2xl shadow-sm overflow-hidden transition-theme">
             <div className="px-8 py-5 border-b border-subtle bg-subtle/10">
                <h3 className="text-main font-black text-[10px] uppercase tracking-widest">External Intelligence Nodes</h3>
             </div>
             <div className="p-8">
                {cve.references && cve.references.length > 0 ? (
                  <div className="space-y-3">
                    {cve.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between group bg-page p-3 border border-subtle rounded-lg transition-theme hover:bg-card hover:border-yellow"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                           <svg className="w-3 h-3 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                           </svg>
                           <span className="text-main font-bold text-xs truncate uppercase tracking-tighter">{ref.split('/')[2] || 'Source Intelligence'}</span>
                        </div>
                        <span className="text-[9px] font-black text-muted uppercase transition-colors group-hover:text-main">Link</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-[10px] font-black uppercase tracking-widest italic">No external references found for this security record.</p>
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
