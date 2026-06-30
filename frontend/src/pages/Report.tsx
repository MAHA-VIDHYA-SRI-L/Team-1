import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle, Target, TrendingUp, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../contexts/ToastContext';
import { SkeletonCard, SkeletonProfile } from '../components/SkeletonLoader';
import logoUrl from '../assets/logo.jpg';

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
  const [activeSection, setActiveSection] = useState('executive-summary');

  const { addToast } = useToast();

  useEffect(() => {
    // TODO: Replace with real API calls
    setProfile({
      fullName: user.fullName,
      email: user.email,
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'A highly motivated and detail-oriented candidate with a strong foundation in modern web technologies. Demonstrates excellent problem-solving capabilities and a proven track record of delivering robust software solutions within agile environments. Exceptional communication skills paired with a deep understanding of software architecture.',
      skills: ['React.js', 'TypeScript', 'Node.js', 'System Architecture', 'Agile Methodologies', 'Cloud Computing (AWS)']
    });

    setAnalysis({
      summary: 'Comprehensive heuristic evaluation indicates exceptional aptitude in frontend development frameworks and architectural design. The candidate exhibits strong alignment with industry standards, particularly in crafting scalable applications. However, strategic refinement is required regarding the quantification of project impacts and the integration of specific Application Tracking System (ATS) keywords.',
      score: 84,
      strengths: [
        'Advanced proficiency in modern JavaScript frameworks (React, Vue).',
        'Demonstrated ability to architect scalable and maintainable codebases.',
        'Strong conceptual grasp of cloud deployment pipelines and CI/CD.'
      ],
      improvements: [
        'Absence of quantifiable metrics in describing past project achievements.',
        'Underutilization of industry-standard ATS keywords in the resume summary.',
        'Limited articulation of cross-functional team leadership experience.'
      ],
      recommendations: [
        'Incorporate measurable outcomes (e.g., "Increased performance by 20%") for all listed projects.',
        'Tailor the resume objective and experience sections to prominently feature target role keywords.',
        'Highlight instances of mentoring, leadership, or cross-functional collaboration to demonstrate soft skills.'
      ]
    });

    addToast("Official Assessment Report generated successfully.", "success");
  }, [user.fullName, user.email]);



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
    addToast("Report downloaded successfully as PDF.", "success");
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!profile || !analysis) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-10 flex flex-col items-center transition-colors duration-300">
        <div className="w-full max-w-6xl space-y-6">
          <SkeletonProfile />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* Sticky Table of Contents Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#002D62] to-[#001D40] dark:from-slate-900 dark:to-slate-950 text-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 shadow-2xl print:hidden border-r border-transparent dark:border-slate-800 transition-colors duration-300">
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          <div className="border-b border-white/10 dark:border-slate-800 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/20">
              <img src={logoUrl} alt="Placemate Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Placemate</h1>
              <p className="text-[10px] font-bold text-blue-300/80 dark:text-blue-400/80 tracking-widest uppercase mt-0.5">Report Navigation</p>
            </div>
          </div>

          <nav className="space-y-1.5 pt-2 font-sans">
            {[
              { id: 'candidate-details', label: 'Candidate Details', icon: FileText },
              { id: 'executive-summary', label: 'I. Executive Summary', icon: CheckCircle },
              { id: 'profile-analysis', label: 'II. Profile Analysis', icon: Target },
              { id: 'analytical-findings', label: 'III. Analytical Findings', icon: TrendingUp },
              { id: 'strategic-recs', label: 'IV. Recommendations', icon: BookOpen }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-bold tracking-wide transition-all whitespace-nowrap relative ${
                    isActive 
                      ? 'bg-white/10 text-white border border-white/5 shadow-inner' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full"></div>}
                  <Icon className={`h-4.5 w-4.5 shrink-0 stroke-[2.5] ${isActive ? 'text-white' : 'opacity-70'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 dark:border-slate-800 bg-[#001D40]/80 dark:bg-slate-950">
          <button 
            onClick={onBackToDashboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98] font-sans"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto print:overflow-visible p-6 md:p-10">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Mobile Header Actions */}
        <div className="w-full font-sans mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:hidden">
          <div className="flex items-center gap-4">
            <button onClick={onBackToDashboard} className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center text-slate-600 dark:text-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Document Viewer</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Formal Assessment Report</p>
            </div>
          </div>
          <button onClick={downloadPdf} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow transition-all">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>

        {/* Desktop Download Button - top right of document */}
        <div className="w-full flex justify-end mb-4 hidden lg:flex font-sans">
          <button onClick={downloadPdf} className="px-5 py-2.5 bg-[#002D62] hover:bg-[#001c3d] text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow transition-all">
            <Download className="h-4 w-4" /> Export Document to PDF
          </button>
        </div>

        {/* The Document Area - Always keep it light mode for formal PDF rendering/printing, but apply dark border/shadows if dark mode wrapper */}
        <div ref={reportRef} className="w-full bg-white text-slate-900 p-10 md:p-16 lg:p-20 shadow-2xl border border-slate-200 dark:border-slate-700 leading-relaxed print:p-0 print:shadow-none print:border-none relative">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none overflow-hidden">
            <h1 className="text-[12rem] font-black rotate-[-45deg] whitespace-nowrap text-slate-900 uppercase tracking-tighter">CONFIDENTIAL</h1>
          </div>
        <header className="border-b-4 border-slate-900 pb-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="font-sans">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Official Placement Report</h1>
            <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase mt-2">Comprehensive Candidate Evaluation</p>
          </div>
          <div className="text-right text-xs font-sans">
            <p className="font-bold text-slate-800 uppercase tracking-wider mb-1">Generated By</p>
            <p className="font-semibold text-[#002D62]">PlacementMate Automated System</p>
            <p className="text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </header>

        {/* Candidate Information Block */}
        <div id="candidate-details" className="mb-12 border border-slate-300 p-6 bg-slate-50/50 relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-sans mb-4 border-b border-slate-200 pb-2">Candidate Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-slate-500 font-sans">Full Name</p>
              <p className="font-bold text-lg">{profile.fullName}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 font-sans">Department / Workspace</p>
              <p className="font-medium text-slate-800">{user.department || 'Undergraduate Student'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 font-sans">Contact Email</p>
              <p className="font-medium text-slate-800">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 font-sans">Location / Phone</p>
              <p className="font-medium text-slate-800">{profile.location} | {profile.phone}</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <section id="executive-summary" className="mb-10 relative z-10 scroll-mt-12">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 pb-2 mb-4 font-sans">I. Executive Summary</h2>
          <p className="text-justify mb-4">
            {analysis.summary} This report presents a formal evaluation of the candidate's professional profile, scholastic achievements, and resume data. The evaluation aims to quantify placement readiness and provide theoretical insights into areas requiring strategic intervention.
          </p>
          <div className="p-4 bg-slate-100 border-l-4 border-slate-800 my-6">
            <p className="text-sm uppercase tracking-wider font-bold text-slate-700 font-sans">Aggregate Readiness Score</p>
            <p className="text-3xl font-black font-sans text-slate-900 mt-1">{analysis.score} / 100</p>
            <p className="text-sm italic mt-2 text-slate-600">Note: This score is calculated via automated heuristic analysis representing an estimation of overall preparedness.</p>
          </div>
        </section>

        {/* Profile Theory & Skills */}
        <section id="profile-analysis" className="mb-10 relative z-10 scroll-mt-12">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 pb-2 mb-4 font-sans">II. Profile Analysis & Core Competencies</h2>
          <p className="text-justify mb-4">{profile.summary}</p>
          <p className="text-justify mb-4">
            The candidate demonstrates theoretical and practical understanding in several domains. The following core competencies have been identified from the submitted documentation:
          </p>
          <ul className="list-disc pl-8 mt-2 space-y-1">
            {profile.skills.map((skill: string, i: number) => (
              <li key={i} className="font-medium">{skill}</li>
            ))}
          </ul>
        </section>

        {/* Findings: Strengths & Weaknesses */}
        <section id="analytical-findings" className="mb-10 relative z-10 scroll-mt-12">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 pb-2 mb-4 font-sans">III. Analytical Findings</h2>
          <p className="text-justify mb-6">
            An in-depth review of the applicant's credentials reveals a distinct pattern of professional capabilities as well as notable gaps in the application presentation.
          </p>
          
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">A. Demonstrated Strengths</h3>
            <ul className="list-decimal pl-8 space-y-2 text-justify">
              {analysis.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">B. Identified Deficiencies</h3>
            <ul className="list-decimal pl-8 space-y-2 text-justify">
              {analysis.improvements.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Recommendations */}
        <section id="strategic-recs" className="mb-10 relative z-10 scroll-mt-12">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 pb-2 mb-4 font-sans">IV. Strategic Recommendations</h2>
          <p className="text-justify mb-4">
            To mitigate the identified deficiencies and capitalize on existing strengths, the following actionable and theoretical recommendations are proposed:
          </p>
          <ul className="list-disc pl-8 space-y-3 text-justify">
            {analysis.recommendations.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>

        {/* Footer Disclaimer */}
        <section id="disclaimer" className="pt-10 border-t border-slate-300 relative z-10 scroll-mt-12">
          <h4 className="font-bold uppercase tracking-wider text-sm mb-2 font-sans">Formal Disclaimer</h4>
          <p className="text-xs text-justify text-slate-500 leading-relaxed font-sans">
            This formal assessment report is strictly generated for advisory purposes within the PlacementMate ecosystem. The analytical findings and recommendations contained herein are derived solely from user-supplied data streams (i.e., resume files, profile configurations). The institution assumes no liability for the definitive accuracy of the automated readiness score. Candidates are strongly advised to utilize this theoretical framework in conjunction with manual review by academic faculty and career counseling professionals.
          </p>
        </section>

      </div>
      </div>
      </div>
    </div>
  );
}
