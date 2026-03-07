import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GlassmorphCard, SeverityBadge } from '../components/common';
import { getCVEs, getStatistics } from '../services/api';

export const LandingPage = ({ onExplore }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [recentCVEs, setRecentCVEs] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cveData, statsData] = await Promise.all([
          getCVEs(),
          getStatistics()
        ]);
        setRecentCVEs((cveData.data || []).slice(0, 3));
        setStats(statsData.data || null);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handleExplore = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleDashboard = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <main className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight text-glow">
              Smarter Vulnerability Intelligence for Modern Security Teams
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Track, analyze, and automate responses to software vulnerabilities in real time. Discover threats before they impact your infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExplore}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 text-glow"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Explore Platform'}
              </button>
              <button 
                onClick={handleDashboard}
                className="px-10 py-4 border-2 border-cyan-500/50 text-cyan-400 font-bold rounded-lg hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300"
              >
                {isAuthenticated ? 'CVE Intelligence' : 'Sign In'}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-3xl opacity-10"></div>
            <div className="relative bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-lg">
              <div className="space-y-6">
                {recentCVEs.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-mono text-sm font-semibold">{recentCVEs[0]?.cveId || 'CVE-2024-1086'}</span>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-3/4"></div>
                    </div>
                    <p className="text-gray-300 text-base font-medium">{recentCVEs[0]?.title || 'Linux Kernel Privilege Escalation'}</p>
                    <div className="pt-6 border-t border-cyan-500/20">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">CVSS Score: <span className="text-white font-bold">{recentCVEs[0]?.severityScore?.toFixed(1) || '9.8'}</span></span>
                        <SeverityBadge severity={recentCVEs[0]?.severity || 'critical'} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-mono text-sm font-semibold">CVE-2024-1086</span>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-3/4"></div>
                    </div>
                    <p className="text-gray-300 text-base font-medium">Linux Kernel Privilege Escalation</p>
                    <div className="pt-6 border-t border-cyan-500/20">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">CVSS Score: <span className="text-white font-bold">9.8</span></span>
                        <SeverityBadge severity="critical" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-cyan-500/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 text-glow">Real-Time Vulnerability Intelligence</h2>
            <p className="text-lg text-gray-300">Current threat landscape statistics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassmorphCard className="p-8 hover:scale-105 transition-transform duration-300 text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">{stats.totalCVEs || 0}</div>
              <div className="text-gray-300 font-semibold">Total CVEs Tracked</div>
            </GlassmorphCard>
            <GlassmorphCard className="p-8 hover:scale-105 transition-transform duration-300 text-center">
              <div className="text-5xl font-bold text-red-400 mb-2">{stats.bySeverity?.critical || 0}</div>
              <div className="text-gray-300 font-semibold">Critical Issues</div>
            </GlassmorphCard>
            <GlassmorphCard className="p-8 hover:scale-105 transition-transform duration-300 text-center">
              <div className="text-5xl font-bold text-orange-400 mb-2">{stats.bySeverity?.high || 0}</div>
              <div className="text-gray-300 font-semibold">High Risk</div>
            </GlassmorphCard>
            <GlassmorphCard className="p-8 hover:scale-105 transition-transform duration-300 text-center">
              <div className="text-5xl font-bold text-yellow-400 mb-2">{stats.bySeverity?.medium || 0}</div>
              <div className="text-gray-300 font-semibold">Medium Severity</div>
            </GlassmorphCard>
          </div>
        </section>
      )}

      {/* Recent Vulnerabilities Section */}
      {recentCVEs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-cyan-500/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 text-glow">Latest Vulnerabilities</h2>
            <p className="text-lg text-gray-300">Most recently discovered threats</p>
          </div>
          <div className="space-y-4">
            {recentCVEs.map((cve, i) => (
              <GlassmorphCard key={i} className="p-6 hover:bg-slate-700/30 transition-colors duration-300 cursor-pointer" onClick={() => navigate(`/cve/${cve.cveId}`)}>
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <p className="text-cyan-400 font-mono font-bold text-lg mb-2">{cve.cveId}</p>
                    <p className="text-gray-300 text-base mb-3">{cve.title}</p>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-sm text-gray-400">Score: <span className="text-white font-semibold">{cve.severityScore?.toFixed(1) || 'N/A'}</span></span>
                      <span className="text-sm text-gray-400">Published: {cve.publishedDate}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-end">
                    <SeverityBadge severity={cve.severity} />
                    <button 
                      onClick={() => navigate(`/cve/${cve.cveId}`)}
                      className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </GlassmorphCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <button 
              onClick={handleDashboard}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              View All Vulnerabilities
            </button>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-cyan-500/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-glow">Powerful Features</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to stay ahead of vulnerabilities and protect your infrastructure
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: '📊',
              title: 'CVE Intelligence Dashboard',
              desc: 'Comprehensive vulnerability tracking with real-time metrics'
            },
            {
              icon: '🚨',
              title: 'Real-time Vulnerability Alerts',
              desc: 'Instant notifications for new critical vulnerabilities'
            },
            {
              icon: '⚡',
              title: 'Risk Scoring & Prioritization',
              desc: 'AI-powered severity assessment and threat prioritization'
            },
            {
              icon: '🔗',
              title: 'Security Automation & APIs',
              desc: 'Integrate with your existing security tools and workflows'
            }
          ].map((feature, i) => (
            <GlassmorphCard key={i} className="p-8 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-6 text-center">{feature.icon}</div>
              <h3 className="text-white font-bold text-xl mb-4 text-center">{feature.title}</h3>
              <p className="text-gray-400 text-center leading-relaxed">{feature.desc}</p>
            </GlassmorphCard>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-cyan-500/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-glow">How It Works</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Three simple steps to transform your vulnerability management
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              title: 'Monitor Global Databases',
              desc: 'CVEarity continuously monitors global CVE databases and threat intelligence feeds'
            },
            {
              step: '02',
              title: 'Analyze Risk Automatically',
              desc: 'Advanced algorithms analyze vulnerability risk using CVSS scores and context'
            },
            {
              step: '03',
              title: 'Automate Responses',
              desc: 'Trigger automated alerts and remediation workflows through integrations'
            }
          ].map((item, i) => (
            <div key={i} className="relative text-center">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-7xl font-bold text-cyan-500/20">{item.step}</div>
              <GlassmorphCard className="pt-16 p-8 hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </GlassmorphCard>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-cyan-500/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-glow">Integrations</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Seamlessly connect with your favorite tools and platforms
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {['GitHub', 'Jira', 'Slack', 'Datadog', 'PagerDuty', 'Sumo Logic'].map((integration, i) => (
            <GlassmorphCard key={i} className="flex items-center justify-center h-20 hover:scale-105 transition-transform duration-300">
              <span className="text-gray-300 font-semibold text-center text-lg">{integration}</span>
            </GlassmorphCard>
          ))}
        </div>
      </section>

      {/* Why CVEarity Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-cyan-500/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-glow">Why CVEarity</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The advantages that set us apart from traditional vulnerability management
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { title: '⚡ Faster Detection', desc: 'Identify vulnerabilities hours before public disclosure' },
            { title: '🤖 Automated Workflows', desc: 'Reduce MTTR with automated security responses' },
            { title: '🎯 Better Prioritization', desc: 'Focus on what matters with intelligent risk scoring' },
            { title: '👨‍💻 Developer-Friendly APIs', desc: 'Easy integration into your CI/CD pipelines' }
          ].map((item, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="text-4xl flex-shrink-0">{item.title.split(' ')[0]}</div>
              <div className="space-y-2">
                <h3 className="text-white font-bold text-xl">{item.title.substring(2)}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-cyan-500/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-glow">Quick Start in Minutes</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get up and running with CVEarity in just a few clicks
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassmorphCard className="p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-6 text-center">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center">1. Sign Up</h3>
            <p className="text-gray-400 text-center mb-6">Create your account in seconds with minimal setup required</p>
            <Link to="/register" className="block text-center text-cyan-400 hover:text-cyan-300 font-semibold">Get Started →</Link>
          </GlassmorphCard>
          <GlassmorphCard className="p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-6 text-center">📊</div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center">2. Browse CVEs</h3>
            <p className="text-gray-400 text-center mb-6">Explore and analyze vulnerabilities with our intelligent dashboard</p>
            <button onClick={handleDashboard} className="block w-full text-center text-cyan-400 hover:text-cyan-300 font-semibold">View Dashboard →</button>
          </GlassmorphCard>
          <GlassmorphCard className="p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-6 text-center">🔐</div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center">3. Secure Assets</h3>
            <p className="text-gray-400 text-center mb-6">Take action with automated responses and remediation</p>
            <a href="#" className="block text-center text-cyan-400 hover:text-cyan-300 font-semibold">Learn More →</a>
          </GlassmorphCard>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-cyan-500/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-glow">Enterprise-Grade Features</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built for security teams of all sizes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { icon: '🔍', title: 'Advanced Search', desc: 'Filter vulnerabilities by severity, software, CVE ID and more' },
            { icon: '📈', title: 'Analytics Dashboard', desc: 'Visual insights into vulnerability trends and patterns' },
            { icon: '👥', title: 'User Management', desc: 'Granular role-based access control for teams' },
            { icon: '📁', title: 'Data Export', desc: 'Export reports in CSV, JSON, and Text formats' },
            { icon: '📝', title: 'Activity Logging', desc: 'Complete audit trails of all system activities' },
            { icon: '⚡', title: 'Real-time Updates', desc: 'Live streaming of new vulnerabilities and threats' }
          ].map((feature, i) => (
            <div key={i} className="flex gap-6">
              <div className="text-5xl flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-cyan-500/10 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-glow">Start Securing Your Infrastructure Today</h2>
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          Join thousands of security teams using CVEarity to stay ahead of threats
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 text-glow inline-block text-center"
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="px-12 py-5 border-2 border-cyan-500/50 text-cyan-400 font-bold text-lg rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
              >
                Sign In
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 text-glow"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="px-12 py-5 border-2 border-cyan-500/50 text-cyan-400 font-bold text-lg rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
              >
                Admin Panel
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
};
