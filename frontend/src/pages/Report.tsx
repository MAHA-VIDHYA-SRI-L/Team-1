import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
  Sparkles,
  BadgeCheck,
  Clock,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, RadialBarChart, RadialBar } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  fetchStudentProfile,
  fetchAcademicDetails,
  fetchAnalysis,
  fetchCertifications,
  fetchResume,
} from '../services/api';

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
  const [academic, setAcademic] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchStudentProfile(),
      fetchAcademicDetails(),
      fetchAnalysis(),
      fetchCertifications(),
      fetchResume(),
    ])
      .then(([profileRes, academicRes, analysisRes, certsRes, resumeRes]) => {
        setProfile(profileRes.profile);
        setAcademic(academicRes.academic);
        setAnalysis(analysisRes);
        setCertifications(Array.isArray(certsRes) ? certsRes : certsRes?.certifications ?? []);
        // backend returns { resume: { resume_url, uploaded_at } }
        setResume(resumeRes?.resume ?? null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const score = analysis?.readiness_score ?? analysis?.score ?? 0;

  const scoreColor =
    score >= 85 ? '#059669' : score >= 65 ? '#002D62' : score >= 45 ? '#f59e0b' : '#ef4444';

  const radialData = [{ name: 'Score', value: score, fill: scoreColor }];

  const sgpaChartData = (() => {
    const vals: string[] = academic?.sgpaSemesterValues ?? [];
    return vals
      .map((v, i) => ({ sem: `S${i + 1}`, sgpa: parseFloat(v) || 0 }))
      .filter((d) => d.sgpa > 0);
  })();

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = (pdf as any).getImageProperties(imgData);
      const pdfWidth = 210;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile?.name || user.fullName}-placement-report.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#002D62]" />
        <span className="ml-2 text-sm font-bold text-slate-500">Building your report...</span>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm font-bold text-slate-600">Failed to load report: {error}</p>
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-[#002D62] underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const displayName = profile?.name || user.fullName;
  const displayEmail = profile?.email || user.email;
  const displayDept = profile?.department || user.department || '—';
  const placementStatus = academic?.placementStatus ?? 'Not Placed';
  const isPlaced = placementStatus === 'Placed';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div>
            <h1 className="text-lg font-black text-[#002D62] uppercase tracking-wider">Placemate</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Placement Readiness Report</p>
          </div>
        </div>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#002D62] hover:bg-[#003580] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </header>

      {/* ── Report Body ── */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6">
        <div ref={reportRef} className="space-y-5">

          {/* ── Hero Card ── */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#002D62] to-[#0057b8] text-white font-black flex items-center justify-center text-lg shrink-0">
                  {displayName.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{displayName}</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {displayDept} · {profile?.year ? `Year ${profile.year}` : ''} {profile?.passOutYear ? `· Batch ${profile.passOutYear}` : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Mail className="h-3 w-3" />{displayEmail}
                    </span>
                    {profile?.phone && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Phone className="h-3 w-3" />{profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PlacementMate</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Generated: {new Date().toLocaleDateString()}</p>
                <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                  isPlaced ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'
                }`}>
                  {isPlaced ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {placementStatus}
                  {isPlaced && academic?.companyName ? ` · ${academic.companyName}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* ── Score + Summary ── */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Radial Score */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Readiness Score</p>
                <div className="relative" style={{ width: 120, height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black" style={{ color: scoreColor }}>{score}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">/ 100</span>
                  </div>
                </div>
                {analysis.readiness_status && (
                  <span className="mt-2 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600">
                    {analysis.readiness_status}
                  </span>
                )}
              </div>

              {/* Summary */}
              <div className="md:col-span-2 bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Analysis Summary
                </p>
                {analysis.strengths && (
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">Strengths</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{analysis.strengths}</p>
                  </div>
                )}
                {analysis.weaknesses && (
                  <div>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-1">Areas to Improve</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{analysis.weaknesses}</p>
                  </div>
                )}
                {analysis.recommendations && (
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Recommendations</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{analysis.recommendations}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Academic Details ── */}
          {academic && (
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
              <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <GraduationCap className="h-3.5 w-3.5" /> Academic Details
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: '10th %', value: academic.tenthPercentage },
                  { label: '12th %', value: academic.twelfthPercentage },
                  { label: 'Diploma %', value: academic.diplomaPercentage },
                  { label: 'UG CGPA', value: academic.ugCgpa },
                  { label: 'PG CGPA', value: academic.pgCgpa },
                  { label: 'Degree', value: academic.graduationStanding },
                  { label: 'UG College', value: academic.ugCollegeName },
                  { label: 'Board', value: academic.boardOfStudy },
                ].filter((item) => item.value && item.value !== '').map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-black text-slate-700 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* SGPA Chart */}
              {sgpaChartData.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">SGPA Trend</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={sgpaChartData} barCategoryGap="30%">
                      <XAxis dataKey="sem" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} allowDecimals tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip
                        formatter={(v: any) => [v, 'SGPA']}
                        contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="sgpa" radius={[6, 6, 0, 0]}>
                        {sgpaChartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.sgpa >= 8 ? '#059669' : entry.sgpa >= 6.5 ? '#002D62' : '#f97316'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ── Certifications ── */}
          {certifications.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
              <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <Award className="h-3.5 w-3.5" /> Certifications ({certifications.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certifications.map((cert: any, i: number) => (
                  <div key={cert.id ?? i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                      <BadgeCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{cert.certification_name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {cert.issuer}{cert.category ? ` · ${cert.category}` : ''}
                      </p>
                      {cert.status && (
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded mt-1 inline-block ${
                          cert.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {cert.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Placement + Resume row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Placement */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
              <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <Briefcase className="h-3.5 w-3.5" /> Placement Status
              </p>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isPlaced ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                  {isPlaced
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    : <Clock className="h-5 w-5 text-orange-500" />}
                </div>
                <div>
                  <p className={`text-base font-black ${isPlaced ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {placementStatus}
                  </p>
                  {isPlaced && academic?.companyName && (
                    <p className="text-xs font-bold text-slate-600 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {academic.companyName}
                    </p>
                  )}
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${
                    academic?.placementVerified ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {academic?.placementVerified ? 'Staff Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
              <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <BookOpen className="h-3.5 w-3.5" /> Resume
              </p>
              {resume?.resume_url ? (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#002D62]/5 rounded-xl">
                    <Download className="h-5 w-5 text-[#002D62]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Resume on file</p>
                    {resume.uploaded_at && (
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                    <a
                      href={resume.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:underline mt-0.5 inline-block"
                    >
                      View / Download →
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold">No resume uploaded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Profile Verification ── */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile?.isVerifiedByStaff ? (
                <BadgeCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500" />
              )}
              <span className={`text-xs font-black ${profile?.isVerifiedByStaff ? 'text-blue-600' : 'text-amber-500'}`}>
                {profile?.isVerifiedByStaff ? 'Profile verified by Placement Officer' : 'Profile pending staff verification'}
              </span>
            </div>
            <Sparkles className={`h-4 w-4 ${score >= 65 ? 'text-emerald-500' : 'text-amber-400'}`} />
          </div>

          {/* ── Footer ── */}
          <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-wider py-2">
            PlacementMate · Placement Readiness Report · {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  );
}
