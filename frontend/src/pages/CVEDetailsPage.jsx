import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCVEById } from '../services/api';
import { GlassmorphCard, SeverityBadge, LoadingSkeleton, ErrorAlert } from '../components/common';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <LoadingSkeleton className="h-12 w-80 rounded-lg" />
          <LoadingSkeleton className="h-32 w-full rounded-lg" />
          <LoadingSkeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !cve) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
          <ErrorAlert message={error || 'CVE not found'} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </button>

        {/* CVE Header */}
        <GlassmorphCard className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{cve.cveId}</h1>
              <h2 className="text-xl text-gray-300 mb-4">{cve.title}</h2>
            </div>
            <SeverityBadge severity={cve.severity} size="lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Severity Score</p>
              <p className="text-2xl font-bold text-cyan-400">{cve.severityScore || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Published Date</p>
              <p className="text-lg text-white">{new Date(cve.publishedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </GlassmorphCard>

        {/* Description */}
        <GlassmorphCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-4">Description</h3>
          <p className="text-gray-300 leading-relaxed">{cve.description}</p>
        </GlassmorphCard>

        {/* Affected Software */}
        {cve.affectedSoftware && cve.affectedSoftware.length > 0 && (
          <GlassmorphCard className="p-8">
            <h3 className="text-xl font-bold text-white mb-4">Affected Software</h3>
            <div className="space-y-2">
              {cve.affectedSoftware.map((software, idx) => (
                <div key={idx} className="flex items-center text-gray-300">
                  <span className="text-cyan-400 mr-2">▸</span>
                  {software}
                </div>
              ))}
            </div>
          </GlassmorphCard>
        )}

        {/* References */}
        {cve.references && cve.references.length > 0 && (
          <GlassmorphCard className="p-8">
            <h3 className="text-xl font-bold text-white mb-4">References</h3>
            <div className="space-y-2">
              {cve.references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span className="mr-2">🔗</span>
                  <span className="truncate">{ref}</span>
                </a>
              ))}
            </div>
          </GlassmorphCard>
        )}

        {/* Metadata */}
        <GlassmorphCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-4">Additional Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Last Modified</p>
              <p className="text-gray-300">{new Date(cve.lastModified).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">CVE ID</p>
              <p className="text-gray-300 font-mono">{cve.cveId}</p>
            </div>
          </div>
        </GlassmorphCard>
      </div>
    </div>
  );
};
