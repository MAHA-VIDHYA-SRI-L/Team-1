import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Printer, TrendingUp, AlertTriangle, Lightbulb, 
  CheckCircle, Loader2, LayoutDashboard, FileBarChart
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { fetchAnalysis, fetchStudentProfile, fetchAcademicDetails } from '../services/api';

interface PlacementReadinessProps {
  user: {
    fullName: string;
    email: string;
    department?: string;
  };
  onBackToDashboard: () => void;
  onViewReport?: () => void;
}

export default function PlacementReadiness({ user, onBackToDashboard, onViewReport }: PlacementReadinessProps) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const [analysisRes, profileRes, academicRes] = await Promise.all([
          fetchAnalysis().catch((e) => {
            console.error('fetchAnalysis error', e);
            return { analysis: null };
          }),
          fetchStudentProfile().catch((e) => {
            console.error('fetchStudentProfile error', e);
            return { profile: {} };
          }),
          fetchAcademicDetails().catch((e) => {
            console.error('fetchAcademicDetails error', e);
            return { academic: {} };
          }),
        ]);
        console.debug('PlacementReadiness fetch results', { analysisRes, profileRes, academicRes });
        if (analysisRes && analysisRes.analysis) setAnalysis(analysisRes.analysis);
        setProfileData({ ...profileRes.profile, ...academicRes.academic });
      } catch (err) {
        console.error('PlacementReadiness unexpected error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#002D62]" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Generating Official Report...</p>
        </div>
      </div>
    );
  }

  const score = analysis?.readiness_score || 0;
  const currentCgpa = profileData?.graduationStanding === 'PG' ? profileData.pgCgpa : profileData?.finalCgpa;

  // Helper: build chart data for component breakdown
  const getComponentScores = (analysisObj: any) => {
    const base = [
      { name: 'Resume', value: analysisObj?.component_scores?.resume ?? 20, color: '#0b63ff' },
      { name: 'Skills', value: analysisObj?.component_scores?.skills ?? 30, color: '#06b6d4' },
      { name: 'Experience', value: analysisObj?.component_scores?.experience ?? 20, color: '#10b981' },
      { name: 'Projects', value: analysisObj?.component_scores?.projects ?? 15, color: '#f59e0b' },
      { name: 'Interview', value: analysisObj?.component_scores?.interview ?? 15, color: '#ef4444' },
    ];
    const sum = base.reduce((s, b) => s + b.value, 0);
    if (sum !== 100) {
      return base.map(b => ({ ...b, value: Math.round((b.value / sum) * 100) }));
    }
    return base;
  };

  const getLostPointItems = (analysisObj: any) => {
    const weaknesses = Array.isArray(analysisObj?.weaknesses) ? analysisObj.weaknesses : (typeof analysisObj?.weaknesses === 'string' ? analysisObj.weaknesses.split('\n').filter(Boolean) : []);
    if (weaknesses.length) return weaknesses.map((w: any) => ({ area: w.split(':')[0] || 'Area', reason: w }));
    const recs = Array.isArray(analysisObj?.recommendations) ? analysisObj.recommendations : (analysisObj?.recommendations ? [analysisObj.recommendations] : []);
    if (recs.length) return [{ area: 'Recommendations', reason: recs.join('; ') }];
    return [{ area: 'General', reason: 'Lower ATS keywords and fewer quantified achievements.' }];
  };

  // Normalize recommendations to an array to avoid runtime map errors
  const recList: string[] = Array.isArray(analysis?.recommendations)
    ? analysis.recommendations
    : analysis?.recommendations
    ? [analysis.recommendations]
    : [];

  return (
    <div className="min-h-screen bg-slate-200 flex font-sans text-slate-800">
      
      {/* 1. LEFT SIDEBAR NAVIGATION (Matching Badges.tsx style) */}
      <aside className="w-64 bg-[#002D62] text-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 shadow-2xl print:hidden">
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-xl font-black tracking-wider uppercase">Placemate</h1>
            <p className="text-[10px] font-bold text-blue-300/80 tracking-widest uppercase mt-0.5">Readiness Report</p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center ring-2 ring-white/10 shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left truncate">
              <p className="text-xs font-black leading-none truncate">{user.fullName}</p>
              <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-wider">{user.department || 'CSE'} Department</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button onClick={onBackToDashboard} className="w-full flex items-center gap-3 px-3.5 py-3 text-slate-300 hover:text-white hover:bg-white/5 border border-transparent rounded-xl text-[12px] font-bold tracking-wide transition-all">
              <LayoutDashboard className="h-4 w-4 shrink-0 stroke-[2.5]" />
              <span>Overview Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-3 bg-white/10 text-white border border-white/10 shadow-inner rounded-xl text-[12px] font-bold tracking-wide transition-all">
              <CheckCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
              <span>AI Readiness Report</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#00224D]">
          <button 
            onClick={onBackToDashboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-[#002D62] hover:bg-blue-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN ACTIVE WINDOW AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto print:overflow-visible">
        
        {/* Top Header - Kept clean with Print Action */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={onBackToDashboard} className="p-2 hover:bg-slate-100 rounded-full md:hidden">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0b63ff] to-[#1db954] text-white font-black flex items-center justify-center text-sm">
                {user.fullName.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">AI Readiness Assessment</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Career Analysis</p>
              </div>
            </div>

            <div className="sm:hidden">
              <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">AI Readiness Assessment</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Career Analysis</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {typeof onViewReport === 'function' && (
              <button onClick={onViewReport} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-[#002D62] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all">
                <FileBarChart className="h-4 w-4" /> View Full Report
              </button>
            )}

            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#002D62] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#001c3d] shadow-md transition-all active:scale-[0.98]"
            >
              <Printer className="h-4 w-4" /> Download / Print Report
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-10 flex-1 print:p-0 bg-gradient-to-b from-slate-50 to-slate-100">
          {/* FORMAL A4 REPORT PAGE */}
          <div className="max-w-5xl mx-auto bg-white shadow-xl p-10 md:p-16 rounded-2xl print:rounded-none print:shadow-none print:p-0 min-h-[900px] border border-slate-100">
            
            {/* Header */}
            <div className="border-b-4 border-[#002D62] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
              <div>
                <h1 className="text-4xl font-black text-[#002D62] uppercase tracking-tight">Placement Readiness</h1>
                <p className="text-lg text-slate-500 font-bold mt-1 tracking-wide">Official AI Assessment Report</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Placemate Workspace</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Student Context */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Candidate Name</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{profileData?.name || user.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Register No.</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{profileData?.regsNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{profileData?.department || user.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Current CGPA</p>
                <p className="text-sm font-black text-emerald-600 mt-0.5">{currentCgpa || '0.00'}</p>
              </div>
            </div>

            {!analysis ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 font-bold">No AI Analysis generated yet. Return to the dashboard and run the analysis on your uploaded resume.</p>
              </div>
            ) : (
              <>
                {/* Overall Score & Breakdown */}
                <div className="flex flex-col md:flex-row items-start gap-8 mb-10 pb-8 border-b border-slate-100">
                  <div className="relative w-48 h-48 flex items-center justify-center shrink-0 transform transition-transform duration-700 hover:scale-105">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r={56} stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-100" />
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
                        <span className="text-4xl font-black text-slate-800">{score}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</span>
                      </div>
                    </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-black text-slate-800">Status: <span className={`${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>{analysis.readiness_status}</span></h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed mt-3">{analysis.consolidated_report}</p>

                    <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm">
                      <p className="text-sm font-bold text-slate-700">Score Breakdown</p>
                      <div style={{ width: '100%', height: 120 }} className="mt-3">
                        <ResponsiveContainer>
                          <BarChart data={getComponentScores(analysis)} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis type="number" hide domain={[0, 100]} />
                            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fontWeight: 700 }} />
                            <Tooltip formatter={(v: any) => `${v}%`} />
                            <Bar dataKey="value" radius={[6,6,6,6]}>
                                      {getComponentScores(analysis).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="bg-white p-6 rounded-xl border-2 border-emerald-100 shadow-sm relative overflow-hidden break-inside-avoid">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={48} className="text-emerald-600" /></div>
                    <h4 className="flex items-center gap-2 font-black text-emerald-800 uppercase tracking-wide mb-4 relative z-10">
                      <TrendingUp size={18}/> Core Strengths
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10 whitespace-pre-line">{analysis.strengths}</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border-2 border-amber-100 shadow-sm relative overflow-hidden break-inside-avoid">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={48} className="text-amber-600" /></div>
                    <h4 className="flex items-center gap-2 font-black text-amber-800 uppercase tracking-wide mb-4 relative z-10">
                      <AlertTriangle size={18}/> Key Weaknesses
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10 whitespace-pre-line">{analysis.weaknesses}</p>
                  </div>
                </div>
                {/* Recommendations + Lost Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-[#002D62]/5 p-6 rounded-xl border border-[#002D62]/10 shadow-sm">
                    <h4 className="flex items-center gap-2 font-black text-[#002D62] uppercase tracking-wide mb-3"><Lightbulb size={18}/> How to Improve</h4>
                    <ul className="list-decimal pl-5 text-sm space-y-2">
                      {recList.map((r: string, i: number) => (<li key={i}>{r}</li>))}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      <button className="px-4 py-2 bg-[#002D62] text-white rounded-lg text-xs font-bold">Edit Resume</button>
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold">Improve Skills</button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="font-black text-slate-800 uppercase text-sm mb-2">Where you lost points</h4>
                    <p className="text-sm text-slate-600 mb-3">Pinpoint causes that reduced your readiness score and suggested fixes.</p>
                    <ul className="list-disc pl-5 text-sm space-y-2 text-slate-700">
                      {getLostPointItems(analysis).map((it: any, idx: number) => (
                        <li key={idx}><strong>{it.area}:</strong> {it.reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Disclaimer Footer */}
            <div className="mt-12 pt-6 border-t-2 border-slate-100 text-center relative print:pt-4">
              <p className="text-xs font-bold text-slate-400 italic">
                Disclaimer: Placemate is a supporting tool for your career — use insights to guide decisions alongside mentors.
              </p>
            </div>

          </div>
        </main>
      </div>

    </div>
  );
}