import { useState, useEffect } from 'react';
import { 
  ArrowLeft, TrendingUp, AlertTriangle, Lightbulb, 
  CheckCircle, Loader2, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PieChart, Pie
} from 'recharts';
import { fetchAnalysis, fetchStudentProfile, fetchAcademicDetails, runAnalysis } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { SkeletonCard, SkeletonProfile } from '../components/SkeletonLoader';
import logoUrl from '../assets/logo.jpg';
import ThemeToggle from '../components/ThemeToggle';

interface PlacementReadinessProps {
  user: {
    fullName: string;
    email: string;
    department?: string;
  };
  onBackToDashboard: () => void;
}

export default function PlacementReadiness({ user, onBackToDashboard }: PlacementReadinessProps) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const { addToast } = useToast();

  const handleRunAnalysis = async () => {
    if (analysisRunning) return;
    setAnalysisError(null);
    setAnalysisRunning(true);
    try {
      const result = await runAnalysis();
      setAnalysis(result?.analysis ?? (result?.readiness_score ? result : null));
      addToast("AI Analysis completed successfully! Here is your report.", "success");
    } catch (err: any) {
      console.error('runAnalysis error', err);
      setAnalysisError(err?.message || 'Unable to complete AI analysis. Please try again.');
      addToast("Unable to complete AI analysis.", "error");
    } finally {
      setAnalysisRunning(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [analysisRes, profileRes, academicRes] = await Promise.all([
          fetchAnalysis().catch(() => ({ analysis: null })),
          fetchStudentProfile().catch(() => ({ profile: {} })),
          fetchAcademicDetails().catch(() => ({ academic: {} })),
        ]);
        if (analysisRes && (analysisRes.analysis || analysisRes.readiness_score)) {
        setAnalysis(analysisRes.analysis ?? analysisRes);
      }
        setProfileData({ ...profileRes.profile, ...academicRes.academic });
      } catch {
        // silently handled — individual fetches already have fallbacks
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-8 flex flex-col gap-6 w-full max-w-6xl mx-auto transition-colors duration-300">
        <SkeletonProfile />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  const score = analysis?.readiness_score || 0;
  const currentCgpa = profileData?.graduationStanding === 'PG'
    ? (profileData?.pgCgpa || profileData?.ugCgpa)
    : (profileData?.ugCgpa || profileData?.finalCgpa);

  const getComponentScores = (analysisObj: any) => {
    const cs = analysisObj?.component_scores;
    // component_scores only exists on fresh AI run, not on DB fetch — derive from readiness_score if missing
    const s = analysisObj?.readiness_score ?? 50;
    const base = [
      { name: 'Resume',     value: cs?.resume     ?? Math.round(s * 0.25), color: '#0b63ff' },
      { name: 'Skills',     value: cs?.skills     ?? Math.round(s * 0.30), color: '#06b6d4' },
      { name: 'Experience', value: cs?.experience ?? Math.round(s * 0.20), color: '#10b981' },
      { name: 'Projects',   value: cs?.projects   ?? Math.round(s * 0.15), color: '#f59e0b' },
      { name: 'Interview',  value: cs?.interview  ?? Math.round(s * 0.10), color: '#ef4444' },
    ];
    const sum = base.reduce((acc, b) => acc + b.value, 0);
    return sum > 0 ? base.map(b => ({ ...b, value: Math.round((b.value / sum) * 100) })) : base;
  };

  const getLostPointItems = (analysisObj: any) => {
    const weaknesses = Array.isArray(analysisObj?.weaknesses) ? analysisObj.weaknesses : (typeof analysisObj?.weaknesses === 'string' ? analysisObj.weaknesses.split('\n').filter(Boolean) : []);
    if (weaknesses.length) return weaknesses.map((w: any) => ({ area: w.split(':')[0] || 'Area', reason: w }));
    const recs = Array.isArray(analysisObj?.recommendations) ? analysisObj.recommendations : (analysisObj?.recommendations ? [analysisObj.recommendations] : []);
    if (recs.length) return [{ area: 'Recommendations', reason: recs.join('; ') }];
    return [{ area: 'General', reason: 'Lower ATS keywords and fewer quantified achievements.' }];
  };

  const recList: string[] = Array.isArray(analysis?.recommendations)
    ? analysis.recommendations
    : typeof analysis?.recommendations === 'string' && analysis.recommendations
    ? analysis.recommendations.split(/\n|(?<=\.)\s+(?=[A-Z0-9])/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-gradient-to-b from-[#002D62] to-[#001D40] dark:from-slate-900 dark:to-slate-950 text-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 shadow-2xl print:hidden border-r border-transparent dark:border-slate-800 transition-colors duration-300">
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          <div className="border-b border-white/10 dark:border-slate-800 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/20">
              <img src={logoUrl} alt="Placemate Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Placemate</h1>
              <p className="text-[10px] font-bold text-blue-300/80 dark:text-blue-400/80 tracking-widest uppercase mt-0.5">Readiness Report</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0b63ff] to-[#1db954] text-white font-black text-sm flex items-center justify-center ring-2 ring-white/10 shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left truncate">
              <p className="text-xs font-black leading-none truncate">{user.fullName}</p>
              <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-wider">{user.department || 'CSE'} Department</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white/10 text-white border border-white/5 shadow-inner rounded-xl text-[12px] font-bold tracking-wide transition-all whitespace-nowrap relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full"></div>
              <CheckCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
              <span className="truncate">AI Readiness Report</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 dark:border-slate-800 bg-[#001D40]/80 dark:bg-slate-950">
          <button 
            onClick={onBackToDashboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN ACTIVE WINDOW AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto print:overflow-visible">
        
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0 print:hidden transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button onClick={onBackToDashboard} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full md:hidden">
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0b63ff] to-[#1db954] text-white font-black flex items-center justify-center text-sm shadow">
                {user.fullName.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">AI Readiness Assessment</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Career Analysis</p>
              </div>
            </div>
            
            <div className="sm:hidden">
              <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">AI Assessment</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleRunAnalysis}
              disabled={analysisRunning}
              className="flex items-center gap-2 px-4 py-2 bg-[#002D62] dark:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-60 shadow-sm hover:shadow-md hover:bg-[#001c3d] dark:hover:bg-blue-700"
            >
              {analysisRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
              <span className="hidden sm:block">{analysis ? 'Re-run AI Analysis' : 'Run AI Analysis'}</span>
              <span className="sm:hidden">Re-run</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-10 flex-1 print:p-0">
          
          {/* AI ASSESSMENT PAGE */}
          <div className="w-full mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[24px] relative overflow-hidden transition-colors duration-300">
            
            {/* Header */}
            <div className="border-b-4 border-[#002D62] dark:border-blue-600 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end relative z-10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#002D62] dark:text-blue-400 uppercase tracking-tight drop-shadow-sm">Placement Readiness</h1>
                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-bold mt-1 tracking-wide">Official AI Assessment Report</p>
              </div>
              <div className="text-left md:text-right mt-4 md:mt-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Placemate Workspace</p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Student Context */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 shadow-sm">
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Candidate Name</p>
                <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white mt-0.5">{profileData?.name || user.fullName}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Register No.</p>
                <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white mt-0.5">{profileData?.regsNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Department</p>
                <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white mt-0.5">{profileData?.department || user.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Current CGPA</p>
                <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{currentCgpa || '—'}</p>
              </div>
            </div>

            {!analysis ? (
              <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-emerald-50/50 dark:from-blue-900/10 dark:to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="max-w-xl mx-auto relative z-10">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-lg mx-auto flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700">
                    <Clock className="w-10 h-10 text-[#002D62] dark:text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">AI Analysis is Ready</h2>
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold px-6">
                    Unlock your personalized placement readiness score. Our advanced heuristic engine analyzes your profile and resume to generate strengths, weaknesses, and actionable recommendations.
                  </p>
                  <button onClick={handleRunAnalysis} disabled={analysisRunning} className="mt-8 px-8 py-3.5 bg-gradient-to-r from-[#002D62] to-[#00479e] dark:from-blue-600 dark:to-blue-800 text-white rounded-xl font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center gap-2 mx-auto">
                    {analysisRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                    <span>{analysisRunning ? 'Generating Insights...' : 'Initialize Analysis'}</span>
                  </button>
                  {analysisError && <p className="mt-6 text-sm text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-900/30 py-2 px-4 rounded-lg inline-block">{analysisError}</p>}
                </div>
              </div>
            ) : (
              <>
                {/* Overall Score & Breakdown */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r={56} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="14" fill="transparent" />
                      <circle 
                        cx="96" cy="96" r={56} 
                        stroke="currentColor" strokeWidth="14" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 56} 
                        strokeDashoffset={2 * Math.PI * 56 - (score / 100) * 2 * Math.PI * 56} 
                        className={`${score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-blue-500' : 'text-amber-500'} transition-all duration-1000 ease-out`} 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-slate-800 dark:text-white">{score}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Score</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left w-full">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Status: <span className={`${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>{analysis.readiness_status}</span></h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-3 max-w-2xl">{analysis.consolidated_report}</p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Score Breakdown</p>
                        <div style={{ width: '100%', height: 180 }}>
                          <ResponsiveContainer>
                            <BarChart data={getComponentScores(analysis)} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                {getComponentScores(analysis).map((entry: any, index: number) => (
                                  <linearGradient key={`grad-${index}`} id={`colorUv-${index}`} x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                                  </linearGradient>
                                ))}
                              </defs>
                              <XAxis type="number" hide domain={[0, 100]} />
                              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                              <Bar dataKey="value" radius={[0,4,4,0]} barSize={14}>
                                {getComponentScores(analysis).map((_entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={`url(#colorUv-${index})`} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 self-start">Skill Radar</p>
                        <div style={{ width: '100%', height: 180 }}>
                          <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getComponentScores(analysis)}>
                              <defs>
                                <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#0b63ff" stopOpacity={0.1}/>
                                  <stop offset="100%" stopColor="#0b63ff" stopOpacity={0.6}/>
                                </radialGradient>
                              </defs>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                              <Radar name="Score" dataKey="value" stroke="#0b63ff" strokeWidth={2} fill="url(#radarGrad)" />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Overview (New Chart) */}
                <div className="mb-10 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide text-sm mb-6">Area Contribution</h4>
                  <div className="w-full flex justify-center" style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getComponentScores(analysis)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getComponentScores(analysis).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {getComponentScores(analysis).map((entry: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{entry.name} ({entry.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consolidated Report Sections */}
                <div className="space-y-6 mb-10">
                  
                  {/* Overall Summary */}
                  {analysis.overall_summary && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                      <h4 className="flex items-center gap-2 font-black text-blue-800 dark:text-blue-400 uppercase tracking-wide mb-3">
                        <TrendingUp size={18} /> Overall Summary
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.overall_summary}</p>
                    </div>
                  )}

                  {/* Academic Analysis */}
                  {analysis.academic_analysis && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">📚 Academic Analysis</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.academic_analysis}</p>
                    </div>
                  )}

                  {/* Resume Analysis */}
                  {analysis.resume_analysis && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">📄 Resume Analysis</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.resume_analysis}</p>
                    </div>
                  )}

                  {/* Technical Analysis */}
                  {analysis.technical_analysis && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">⚙️ Technical Analysis</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.technical_analysis}</p>
                    </div>
                  )}

                  {/* Project & Experience Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysis.project_analysis && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">🎯 Project Analysis</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.project_analysis}</p>
                      </div>
                    )}

                    {analysis.internship_analysis && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">💼 Internship Analysis</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.internship_analysis}</p>
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  {analysis.certification_analysis && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">🏆 Certification Analysis</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.certification_analysis}</p>
                    </div>
                  )}

                  {/* Recruiter Impression */}
                  {analysis.recruiter_impression && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                      <h4 className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wide mb-3">
                        <CheckCircle size={18} /> Recruiter Impression
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.recruiter_impression}</p>
                    </div>
                  )}

                  {/* Career Fit */}
                  {analysis.career_fit && Array.isArray(analysis.career_fit) && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-4 text-sm">🎓 Suitable Career Paths</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.career_fit.map((role: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0"></div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final Verdict */}
                  {analysis.final_verdict && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border-2 border-purple-100 dark:border-purple-800/50 shadow-sm">
                      <h4 className="font-black text-purple-800 dark:text-purple-400 uppercase tracking-wide mb-3 text-sm">📋 Final Verdict</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{analysis.final_verdict}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Disclaimer Footer */}
            <div className="mt-12 pt-6 border-t-2 border-slate-100 dark:border-slate-800 text-center relative print:pt-4">
              <p className="text-xs font-bold text-slate-400 italic">
                Disclaimer: Placemate is a supporting tool for your career — use insights to guide decisions alongside mentors. Do not blindly follow this.
              </p>
            </div>

          </div>
        </main>
      </div>

    </div>
  );
}