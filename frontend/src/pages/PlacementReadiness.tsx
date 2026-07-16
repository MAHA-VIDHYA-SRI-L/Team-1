import { useState, useEffect } from 'react';
import { 
  ArrowLeft, TrendingUp, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PieChart, Pie
} from 'recharts';
import { fetchAnalysis, fetchStudentProfile, fetchAcademicDetails, runAnalysis } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { SkeletonCard, SkeletonProfile } from '../components/SkeletonLoader';
import logoUrl from '../assets/logo.jpg';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Button, Card, EmptyState, FormError, PageHeader
} from '../components/ui';

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
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-8 flex flex-col gap-6 w-full max-w-[1600px] mx-auto transition-colors duration-300">
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

  const renderConsolidatedReport = (text?: string) => {
    if (!text) return null;
    try {
      if (text.trim().startsWith('{')) {
        const obj = JSON.parse(text);
        const sections = [
          { title: 'Overall Summary', body: obj.overall_summary },
          { title: 'Academic Analysis', body: obj.academic_analysis },
          { title: 'Technical & Projects', body: `${obj.technical_analysis || ''} ${obj.project_analysis || ''}`.trim() },
          { title: 'Recruiter Impression', body: obj.recruiter_impression },
          { title: 'Final Verdict', body: obj.final_verdict }
        ].filter(s => s.body && s.body !== 'Analysis unavailable.');

        if (sections.length > 0) {
          return (
            <div className="space-y-3 mt-4 max-w-2xl">
              {sections.map((sec, idx) => (
                <Card key={idx} className="p-4 shadow-sm transition-all hover:shadow-md">
                  <span className="font-extrabold text-[#002D62] dark:text-blue-400 uppercase tracking-wider text-[11px] block mb-1">
                    • {sec.title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {sec.body}
                  </p>
                </Card>
              ))}
            </div>
          );
        }
      }
    } catch {
      // fallback to text parsing
    }
    const cleaned = text.replace(/^#\s*Placement Analysis.*?(\n|$)/i, '').trim();
    if (cleaned.includes('##')) {
      const sections = cleaned.split(/##\s+/).map(s => s.trim()).filter(Boolean);
      return (
        <div className="space-y-3 mt-4 max-w-2xl">
          {sections.slice(0, 3).map((sec, idx) => {
            const lines = sec.split('\n');
            const title = lines[0].replace(/[:.#]/g, '').trim();
            const body = lines.slice(1).join(' ').trim() || sec.replace(/^[^.\n]+[:.]?\s*/, '');
            return (
              <Card key={idx} className="p-4 shadow-sm transition-all hover:shadow-md">
                <span className="font-extrabold text-[#002D62] dark:text-blue-400 uppercase tracking-wider text-[11px] block mb-1">
                  • {title}
                </span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {body}
                </p>
              </Card>
            );
          })}
        </div>
      );
    }
    const paragraphs = cleaned.split(/\n\n+/).filter(Boolean);
    return (
      <div className="space-y-2.5 mt-3 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
        {paragraphs.slice(0, 3).map((p, idx) => (
          <p key={idx}>{p.replace(/#/g, '').trim()}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Page Header */}
      <PageHeader
        logo={
          <div className="h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-slate-200/80 dark:ring-slate-700 shadow-sm shrink-0 bg-white p-0.5">
            <img src={logoUrl} className="w-full h-full object-contain rounded-xl" alt="Placemate Logo" />
          </div>
        }
        title="Placemate"
        badge="Readiness Report"
        subtitle="AI Readiness Assessment"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onBackToDashboard}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Dashboard
            </Button>
            <ThemeToggle variant="button" />
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunAnalysis}
              disabled={analysisRunning}
              loading={analysisRunning}
              icon={<Clock className="h-4 w-4" />}
            >
              {analysis ? 'Re-run AI Analysis' : 'Run AI Analysis'}
            </Button>
          </div>
        }
      />

      <main className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 xl:px-14 py-8 flex-1 flex flex-col space-y-8 relative z-10 print:p-0">
        
        {/* Student Context Card */}
        <Card className="p-6 bg-gradient-to-r from-slate-900 to-[#002D62] text-white border-0 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Candidate Name</p>
              <p className="text-sm font-black text-white mt-1 truncate">{profileData?.name || user.fullName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Register No.</p>
              <p className="text-sm font-black text-white mt-1">{profileData?.regsNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Department</p>
              <p className="text-sm font-black text-white mt-1">{profileData?.department || user.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Current CGPA</p>
              <p className="text-sm font-black text-emerald-400 mt-1">{currentCgpa || '—'}</p>
            </div>
          </div>
        </Card>

        {!analysis ? (
          <Card className="p-12">
            <EmptyState
              icon={<Clock className="h-12 w-12 text-[#002D62] dark:text-blue-400" />}
              title="AI Analysis is Ready"
              description="Unlock your personalized placement readiness score. Our advanced heuristic engine analyzes your profile and resume to generate strengths, weaknesses, and actionable recommendations."
              action={
                <div className="flex flex-col items-center gap-4 mt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleRunAnalysis}
                    disabled={analysisRunning}
                    loading={analysisRunning}
                    icon={<TrendingUp className="h-5 w-5" />}
                  >
                    Initialize Analysis
                  </Button>
                  {analysisError && <FormError message={analysisError} />}
                </div>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Visual score gauge and charts */}
            <div className="lg:col-span-1 space-y-6">
              {/* Circular Score Gauge refactored to Segmented Box Gauge */}
              <Card className="p-6 flex flex-col items-center text-center">
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Readiness Score Quotient</p>
                <div className="flex items-center gap-3 justify-center mb-4 pt-2">
                  <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">{score}<span className="text-xl font-extrabold text-slate-400 dark:text-slate-505">/100</span></span>
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-extrabold text-slate-450 dark:text-slate-550 tracking-wider block">Level</span>
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${
                      score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                </div>
                
                {/* Segmented block boxes (10 segments) */}
                <div className="w-full space-y-2 px-2 mt-2">
                  <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                    <span>Placement Ready</span>
                    <span>{score}%</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 w-full">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const stepValue = (idx + 1) * 10;
                      const isActive = score >= stepValue;
                      return (
                        <div
                          key={idx}
                          className={`h-4.5 rounded-md border transition-all duration-500 ${
                            isActive
                              ? score >= 80
                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                                : score >= 60
                                  ? 'bg-gradient-to-t from-blue-600 to-blue-400 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.25)]'
                                  : 'bg-gradient-to-t from-amber-600 to-amber-400 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                              : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 dark:text-white mt-5">
                  Status: <span className={`${score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>{analysis.readiness_status}</span>
                </h3>
              </Card>

              {/* Breakdown Bar Chart */}
              <Card className="p-6">
                <p className="text-xs font-black text-slate-705 dark:text-slate-350 uppercase tracking-wider mb-4">Score Breakdown</p>
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
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                      <Bar dataKey="value" radius={[0,4,4,0]} barSize={12}>
                        {getComponentScores(analysis).map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={`url(#colorUv-${index})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Radar Chart */}
              <Card className="p-6 flex flex-col items-center">
                <p className="text-xs font-black text-slate-705 dark:text-slate-350 uppercase tracking-wider mb-2 self-start">Skill Radar</p>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={getComponentScores(analysis)}>
                      <defs>
                        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#0b63ff" stopOpacity={0.1}/>
                          <stop offset="100%" stopColor="#0b63ff" stopOpacity={0.6}/>
                        </radialGradient>
                      </defs>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 650 }} />
                      <Radar name="Score" dataKey="value" stroke="#0b63ff" strokeWidth={1.5} fill="url(#radarGrad)" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Area Contribution Pie Chart */}
              <Card className="p-6">
                <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide text-xs mb-3">Area Contribution</h4>
                <div className="w-full flex justify-center" style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getComponentScores(analysis)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getComponentScores(analysis).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
                  {getComponentScores(analysis).map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse" style={{ backgroundColor: entry.color }} />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{entry.name} ({entry.value}%)</span>
                    </div>
                  ))}
                </div>
              </Card>

              {analysis.recruiter_impression && (
                <Card className="p-6 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/80 dark:border-emerald-800/50">
                  <h4 className="flex items-center gap-2.5 font-black text-emerald-900 dark:text-emerald-450 uppercase tracking-wide text-xs mb-3">
                    <CheckCircle className="h-4 w-4" /> Recruiter Impression
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.recruiter_impression}</p>
                </Card>
              )}

              {analysis.career_fit && Array.isArray(analysis.career_fit) && (
                <Card className="p-6">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-4 text-xs">🎓 Suitable Career Paths</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.career_fit.map((role: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-200/80 dark:border-blue-800/50">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">{role}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {analysis.final_verdict && (
                <Card className="p-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800/50">
                  <h4 className="font-black text-purple-900 dark:text-purple-400 uppercase tracking-wide mb-3 text-xs">📋 Final Verdict</h4>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{analysis.final_verdict}</p>
                </Card>
              )}
            </div>

            {/* Right Column: Reports and detailed texts */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Key Insights: Strengths, Weaknesses, Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.strengths && (
                  <Card className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-100 dark:border-emerald-950/80 shadow-sm flex flex-col">
                    <h5 className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[10px] mb-2.5 shrink-0">
                      <CheckCircle className="h-4 w-4" /> Top Strengths
                    </h5>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-350 leading-relaxed flex-1">
                      {analysis.strengths}
                    </p>
                  </Card>
                )}

                {analysis.weaknesses && (
                  <Card className="p-5 bg-gradient-to-br from-rose-500/5 to-amber-500/5 dark:from-rose-500/10 dark:to-amber-500/10 border border-rose-100 dark:border-rose-950/80 shadow-sm flex flex-col">
                    <h5 className="flex items-center gap-2 font-black text-rose-800 dark:text-rose-455 uppercase tracking-wider text-[10px] mb-2.5 shrink-0">
                      <AlertTriangle className="h-4 w-4" /> Areas to Improve
                    </h5>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-355 leading-relaxed flex-1">
                      {analysis.weaknesses}
                    </p>
                  </Card>
                )}

                {analysis.recommendations && (
                  <Card className="p-5 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10 border border-indigo-100 dark:border-indigo-950/80 shadow-sm flex flex-col">
                    <h5 className="flex items-center gap-2 font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-wider text-[10px] mb-2.5 shrink-0">
                      <TrendingUp className="h-4 w-4" /> Roadmap Action
                    </h5>
                    <div className="text-[11px] font-bold text-slate-650 dark:text-slate-350 leading-relaxed space-y-1 flex-1">
                      {analysis.recommendations.split(/\d+\.\s+/).map((r: string) => r.trim()).filter(Boolean).map((rec: string, idx: number) => (
                        <div key={idx} className="flex gap-1.5 items-start">
                          <span className="text-indigo-650 dark:text-indigo-400 font-extrabold shrink-0">{idx + 1}.</span>
                          <span>{rec}</span>
                        </div>
                      )) || analysis.recommendations}
                    </div>
                  </Card>
                )}
              </div>

              {/* Detailed Consolidated Report Preview card */}
              <Card className="p-6 bg-white dark:bg-slate-800">
                <span className="font-extrabold text-[#002D62] dark:text-blue-400 uppercase tracking-wider text-[11px] block mb-2">
                  Consolidated Summary Details
                </span>
                {renderConsolidatedReport(analysis.consolidated_report)}
              </Card>

              {analysis.overall_summary && (
                <Card className="p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/80 dark:border-blue-800/50">
                  <h4 className="flex items-center gap-2.5 font-black text-blue-900 dark:text-blue-400 uppercase tracking-wide text-sm mb-3">
                    <TrendingUp className="h-5 w-5" /> Overall Summary
                  </h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.overall_summary}</p>
                </Card>
              )}

              {analysis.academic_analysis && (
                <Card className="p-6">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">📚 Academic Analysis</h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.academic_analysis}</p>
                </Card>
              )}

              {analysis.resume_analysis && (
                <Card className="p-6">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">📄 Resume Analysis</h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.resume_analysis}</p>
                </Card>
              )}

              {analysis.technical_analysis && (
                <Card className="p-6">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">⚙️ Technical Analysis</h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.technical_analysis}</p>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.project_analysis && (
                  <Card className="p-6">
                    <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">🎯 Project Analysis</h4>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.project_analysis}</p>
                  </Card>
                )}

                {analysis.internship_analysis && (
                  <Card className="p-6">
                    <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">💼 Internship Analysis</h4>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.internship_analysis}</p>
                  </Card>
                )}
              </div>

              {analysis.certification_analysis && (
                <Card className="p-6">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3 text-sm">🏆 Certification Analysis</h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.certification_analysis}</p>
                </Card>
              )}

            </div>
          </div>
        )}

        {/* Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs font-bold text-slate-400 italic">
            Disclaimer: Placemate is a supporting tool for your career — use insights to guide decisions alongside mentors. Do not blindly follow this.
          </p>
        </div>

      </main>

    </div>
  );
}