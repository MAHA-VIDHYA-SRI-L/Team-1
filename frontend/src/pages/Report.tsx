import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportProps {
  user: {
    fullName: string;
    email: string;
    department?: string;
  };
  onBackToDashboard: () => void;
}

export default function ReportPage({ user, onBackToDashboard }: ReportProps) {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    // TODO: Replace with real API calls
    setProfile({
      fullName: user.fullName,
      email: user.email,
      phone: 'N/A',
      location: 'N/A',
      summary: 'Profile summary not available in this mock.',
      skills: ['React', 'TypeScript']
    });

    setAnalysis({
      summary: 'Automated analysis indicates strengths in frontend and suggested improvements in quantifying achievements and ATS keywords.',
      score: 78,
      strengths: ['Frontend development', 'Project clarity'],
      improvements: ['Quantify metrics', 'Tailor keywords'],
      recommendations: ['Add measurable outcomes to projects', 'Tailor resume for target roles']
    });
  }, [user.fullName, user.email]);

  const getComponentScores = (analysisObj: any) => {
    const base = [
      { name: 'Resume', value: analysisObj?.component_scores?.resume ?? 20, color: '#0b63ff' },
      { name: 'Skills', value: analysisObj?.component_scores?.skills ?? 30, color: '#06b6d4' },
      { name: 'Experience', value: analysisObj?.component_scores?.experience ?? 20, color: '#10b981' },
      { name: 'Projects', value: analysisObj?.component_scores?.projects ?? 15, color: '#f59e0b' },
      { name: 'Interview', value: analysisObj?.component_scores?.interview ?? 15, color: '#ef4444' },
    ];
    const sum = base.reduce((s, b) => s + b.value, 0);
    if (sum !== 100) return base.map(b => ({ ...b, value: Math.round((b.value / sum) * 100) }));
    return base;
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    const node = reportRef.current;
    const canvas = await html2canvas(node, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = (pdf as any).getImageProperties(imgData);
    const pdfWidth = 210;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${profile?.fullName || 'placement'}-report.pdf`);
  };

  if (!profile || !analysis) return <div className="min-h-screen flex items-center justify-center">Loading report...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBackToDashboard} className="px-3 py-2 bg-white rounded shadow-sm flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0b63ff] to-[#1db954] text-white font-black flex items-center justify-center text-sm">
                {user.fullName.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#002D62]">Placement Report</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{user.department || 'Student Workspace'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadPdf} className="px-4 py-2 bg-[#002D62] text-white rounded flex items-center gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </div>
        </div>

        <div ref={reportRef} className="bg-white p-8 rounded-2xl shadow">
          <header className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-black">{profile.fullName}</h2>
              <p className="text-sm text-slate-500">{profile.email} • {profile.phone} • {profile.location}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-[#002D62]">PlacementMate</div>
              <div className="text-xs text-slate-400">Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </header>

          <section className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              <h3 className="font-black text-slate-800">Executive Summary</h3>
              <p className="text-sm text-slate-700 mt-2">{analysis.summary}</p>
              <p className="mt-2 text-sm"><strong>Readiness score:</strong> {analysis.score}/100</p>
            </div>
            <div className="md:col-span-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Breakdown</p>
              <div style={{ width: '100%', height: 120 }} className="mt-2">
                <ResponsiveContainer>
                  <BarChart data={getComponentScores(analysis)} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fontWeight: 700 }} />
                    <Tooltip formatter={(v: any) => `${v}%`} />
                    <Bar dataKey="value" radius={[6,6,6,6]}>
                      {getComponentScores(analysis).map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="mb-4">
            <h4 className="font-bold">Profile</h4>
            <p className="text-sm mt-1">{profile.summary}</p>
            <p className="text-sm mt-1"><strong>Skills:</strong> {profile.skills.join(', ')}</p>
          </section>

          <section className="mb-4">
            <h4 className="font-bold">Findings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <h5 className="font-semibold">Strengths</h5>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  {analysis.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold">Opportunities</h5>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  {analysis.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h4 className="font-bold">Recommendations</h4>
            <ol className="list-decimal pl-5 mt-2 text-sm">
              {analysis.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ol>
          </section>

          <section className="mb-4 text-sm text-slate-600">
            <h5 className="font-semibold">Disclaimer</h5>
            <p className="mt-2">This PlacementMate report is focused on supporting your career growth by providing recommendations based on the data you shared (profile and uploaded resume). It is not a replacement for professional career coaching or your own judgement. Do not follow recommendations blindly — treat them as guidance.</p>
          </section>

          <footer className="text-xs text-slate-400 mt-6">Prepared by PlacementMate • {new Date().getFullYear()}</footer>
        </div>
      </div>
    </div>
  );
}
