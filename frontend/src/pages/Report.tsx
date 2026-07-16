import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Download, AlertCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  fetchStudentProfile,
  fetchAcademicDetails,
  fetchAnalysis,
  fetchCertifications,
  fetchSkills,
  fetchInternships,
} from '../services/api';
import { ThemeToggle } from '../components/ThemeToggle';
import logoUrl from '../assets/logo.jpg';
import {
  Button, Card, SectionLoader, EmptyState, PageHeader
} from '../components/ui';

interface ReportProps {
  user: { fullName: string; email: string; department?: string };
  onBackToDashboard: () => void;
}

export default function ReportPage({ user, onBackToDashboard }: ReportProps) {
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [academic, setAcademic] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [, setCertifications] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchStudentProfile(),
      fetchAcademicDetails(),
      fetchAnalysis().catch(() => null),
      fetchCertifications().catch(() => ({ certifications: [] })),
      fetchSkills().catch(() => ({ skills: [] })),
      fetchInternships().catch(() => ({ internships: [] })),
    ])
      .then(([profileRes, academicRes, analysisRes, certsRes, skillsRes, internRes]) => {
        setProfile(profileRes.profile);
        setAcademic(academicRes.academic);
        setAnalysis(analysisRes?.analysis ?? null);
        setCertifications(Array.isArray(certsRes) ? certsRes : certsRes?.certifications ?? []);
        setSkills(Array.isArray(skillsRes) ? skillsRes : skillsRes?.skills ?? []);
        setInternships(Array.isArray(internRes) ? internRes : internRes?.internships ?? []);
      })
      .catch((err) => {
        if (err?.message === 'unauthorized') onBackToDashboard();
        else setError(err?.message || 'Failed to load report data');
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadPdf = async () => {
    if (!reportRef.current || downloading) return;
    setDownloading(true);
    try {
      const el = reportRef.current;
      const originalStyle = el.style.cssText;
      el.style.width = '794px';
      el.style.minHeight = 'auto';

      await new Promise(r => setTimeout(r, 150));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        windowWidth: 794,
      });

      el.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const imgH = (canvas.height * pageW) / canvas.width;

      let yPos = 0;
      while (yPos < imgH) {
        if (yPos > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yPos, pageW, imgH);
        yPos += pageH;
      }

      const name = profile?.name || user.fullName;
      pdf.save(`${name.replace(/\s+/g, '-')}-placement-report.pdf`);
    } catch (e) {
      console.error('PDF download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-6 flex items-center justify-center transition-colors duration-300">
        <Card className="p-12 max-w-md w-full shadow-lg">
          <SectionLoader message="Building report..." />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-6 flex items-center justify-center transition-colors duration-300">
        <Card className="p-12 max-w-md w-full shadow-lg">
          <EmptyState
            icon={<AlertCircle className="h-12 w-12 text-red-500" />}
            title="Report Error"
            description={error}
            action={
              <Button variant="secondary" size="sm" onClick={onBackToDashboard}>
                Back to Dashboard
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const name = profile?.name || user.fullName;
  const email = profile?.email || user.email;
  const dept = profile?.department || user.department || '';
  const phone = profile?.phone || '';
  const regNo = profile?.regsNumber || '';
  const linkedin = profile?.linkedinUrl || '';
  const passOut = profile?.passOutYear || '';
  const year = profile?.year || '';

  const cgpa = (() => {
    const ug = academic?.ugCgpa || '';
    const pg = academic?.pgCgpa || '';
    const fin = academic?.finalCgpa || '';
    if (academic?.graduationStanding === 'PG') return pg || ug || fin;
    return ug || fin;
  })();

  const sgpaValues: string[] = academic?.sgpaSemesterValues ?? [];
  const sgpaFilled = sgpaValues.filter(v => v && v !== '');

  const score = analysis?.readiness_score ?? 0;
  const scoreColor = score >= 85 ? '#059669' : score >= 65 ? '#1d4ed8' : score >= 45 ? '#d97706' : '#dc2626';
  const scoreLabel = score >= 85 ? 'Highly Ready' : score >= 65 ? 'Ready' : score >= 45 ? 'Needs Improvement' : 'Not Ready';

  const isPlaced = academic?.placementStatus === 'Placed';



  // ── Divider ──
  const HR = () => <div className="my-3 border-t border-slate-200 dark:border-slate-700" />;

  // ── Section heading ──
  const SectionHead = ({ title }: { title: string }) => (
    <div className="mb-3 flex items-center rounded-xl border-l-4 border-[#002D62] bg-slate-100 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#002D62] dark:bg-slate-800 dark:text-blue-400">
      {title}
    </div>
  );

  const formatReportText = (text?: string) => {
    if (!text) return null;
    try {
      if (text.trim().startsWith('{')) {
        const obj = JSON.parse(text);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '10.5px', color: '#1e293b', textAlign: 'justify' }}>
            {obj.overall_summary && (
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {obj.overall_summary}
              </p>
            )}
            {(obj.academic_analysis || obj.technical_analysis || obj.project_analysis) && (
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {obj.academic_analysis || ''} {obj.technical_analysis || ''} {obj.project_analysis || ''}
              </p>
            )}
            {(obj.recruiter_impression || obj.final_verdict) && (
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {obj.recruiter_impression || ''} {obj.final_verdict || ''}
              </p>
            )}
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', borderTop: '1px solid #cbd5e1', fontSize: '10px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', verticalAlign: 'top', width: '120px' }}>
                    <strong style={{ color: '#002D62', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Strengths</strong>
                  </td>
                  <td style={{ padding: '8px 0', color: '#334155', lineHeight: 1.6 }}>
                    {obj.strengths || analysis?.strengths || 'N/A'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', verticalAlign: 'top', width: '120px' }}>
                    <strong style={{ color: '#002D62', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Areas to Improve</strong>
                  </td>
                  <td style={{ padding: '8px 0', color: '#334155', lineHeight: 1.6 }}>
                    {obj.weaknesses || analysis?.weaknesses || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', verticalAlign: 'top', width: '120px' }}>
                    <strong style={{ color: '#002D62', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommendations</strong>
                  </td>
                  <td style={{ padding: '8px 0', color: '#334155', lineHeight: 1.6 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(obj.recommendations || analysis?.recommendations || '').split(/\d+\.\s+/).map((r: string) => r.trim()).filter(Boolean).map((rec: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#002D62' }}>{idx + 1}.</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
    } catch {
      // fallback to text parsing
    }
    const cleaned = text.replace(/^#\s*Placement Analysis.*?(\n|$)/i, '').trim();
    if (cleaned.includes('##')) {
      const sections = cleaned.split(/##\s+/).map(s => s.trim()).filter(Boolean);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '10.5px', color: '#1e293b', textAlign: 'justify' }}>
          {sections.slice(0, 3).map((sec, idx) => {
            const lines = sec.split('\n');
            const body = lines.slice(1).join(' ').trim() || sec.replace(/^[^.\n]+[:.]?\s*/, '');
            return (
              <p key={idx} style={{ margin: 0, lineHeight: 1.6 }}>
                {body}
              </p>
            );
          })}
        </div>
      );
    }
    const paragraphs = cleaned.split(/\n\n+/).filter(Boolean);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '10.5px', color: '#1e293b', textAlign: 'justify' }}>
        {paragraphs.slice(0, 3).map((p, idx) => (
          <p key={idx} style={{ margin: 0, lineHeight: 1.6 }}>
            {p.replace(/#/g, '').trim()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] font-sans transition-colors duration-300 flex flex-col">

      {/* ── Toolbar (not captured in PDF) ── */}
      <PageHeader
        logo={
          <div className="h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-slate-200/80 dark:ring-slate-700 shadow-sm shrink-0 bg-white p-0.5">
            <img src={logoUrl} className="w-full h-full object-contain rounded-xl" alt="Placemate Logo" />
          </div>
        }
        title="Placemate"
        badge="Placement Readiness Report"
        subtitle="Official Candidate Summary"
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
              onClick={downloadPdf}
              disabled={downloading}
              loading={downloading}
              icon={<Download className="h-4 w-4" />}
            >
              Download PDF
            </Button>
          </div>
        }
      />

      {/* ── A4 Paper ── */}
      <div className="flex-1 flex justify-center py-10 px-4 bg-slate-100 dark:bg-slate-900/60 overflow-x-auto shadow-inner">
        <div
          ref={reportRef}
          style={{
            width: 794, background: '#fff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            borderRadius: 16,
            padding: '48px 56px',
            color: '#1e293b',
            fontSize: 11,
            lineHeight: 1.6,
          }}
        >

          {/* ══ HEADER ══ */}
          <div style={{ borderBottom: '3px solid #002D62', paddingBottom: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#002D62', letterSpacing: 0.5 }}>{name}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 3 }}>
                  {dept}{year ? ` · Year ${year}` : ''}{passOut ? ` · Batch ${passOut}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
                  {email && <span style={{ fontSize: 10, color: '#475569' }}>✉ {email}</span>}
                  {phone && <span style={{ fontSize: 10, color: '#475569' }}>✆ {phone}</span>}
                  {regNo && <span style={{ fontSize: 10, color: '#475569' }}>ID: {regNo}</span>}
                  {linkedin && <span style={{ fontSize: 10, color: '#475569' }}>in {linkedin}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>PlacementMate</div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
                  Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div style={{
                  marginTop: 8, display: 'inline-block',
                  padding: '3px 10px', borderRadius: 4, fontSize: 9, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: 0.8,
                  background: isPlaced ? '#d1fae5' : '#fff7ed',
                  color: isPlaced ? '#065f46' : '#c2410c',
                  border: `1px solid ${isPlaced ? '#6ee7b7' : '#fdba74'}`,
                }}>
                  {isPlaced ? '✓ Placed' : '○ Not Placed'}
                  {isPlaced && academic?.companyName ? ` · ${academic.companyName}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* ══ READINESS SCORE BANNER ══ */}
          {analysis && (
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 14, padding: '16px 22px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>/ 100</div>
                <div style={{
                  marginTop: 4, fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: 0.8, color: scoreColor,
                  background: `${scoreColor}18`, padding: '3px 10px', borderRadius: 6,
                }}>
                  {scoreLabel}
                </div>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#002D62', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                  Placement Readiness Status
                </div>
                <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.7 }}>
                  {analysis.readiness_status && (
                    <span style={{
                      display: 'inline-block', marginBottom: 4,
                      padding: '1px 8px', borderRadius: 3, fontSize: 9,
                      fontWeight: 700, background: '#eff6ff', color: '#1d4ed8',
                    }}>
                      Status: {analysis.readiness_status}
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#475569' }}>
                      <strong style={{ color: '#1e293b' }}>Skills:</strong> {skills.length}
                    </span>
                    <span style={{ fontSize: 10, color: '#475569' }}>
                      <strong style={{ color: '#1e293b' }}>Internships:</strong> {internships.length}
                    </span>
                    {cgpa && (
                      <span style={{ fontSize: 10, color: '#475569' }}>
                        <strong style={{ color: '#1e293b' }}>CGPA:</strong> {cgpa}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ CONSOLIDATED REPORT ══ */}
          {analysis?.consolidated_report && (
            <>
              <SectionHead title="Consolidated Placement Readiness Report" />
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 4, padding: '12px 16px', marginBottom: 20,
                fontSize: 10.5, color: '#334155', lineHeight: 1.8,
              }}>
                {formatReportText(analysis.consolidated_report)}
              </div>
            </>
          )}

          {/* ══ ACADEMIC DETAILS ══ */}
          {academic && (() => {
            const items = [
              { label: '10th Marks', value: academic.tenthPercentage ? `${academic.tenthPercentage}%` : null },
              { label: '12th Marks', value: academic.twelfthPercentage ? `${academic.twelfthPercentage}%` : null },
              { label: 'Diploma Marks', value: academic.diplomaPercentage ? `${academic.diplomaPercentage}%` : null },
              { label: 'UG CGPA', value: academic.ugCgpa },
              { label: 'PG CGPA', value: academic.pgCgpa },
              { label: 'Graduation Standing', value: academic.graduationStanding },
              { label: 'UG College Name', value: academic.ugCollegeName },
              { label: 'Board of Study', value: academic.boardOfStudy },
            ].filter(i => i.value && i.value !== '');

            const rows = [];
            for (let i = 0; i < items.length; i += 2) {
              rows.push([items[i], items[i + 1] || null]);
            }

            return (
              <>
                <SectionHead title="Academic Details" />
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, border: '1px solid #e2e8f0', fontSize: '10px' }}>
                  <tbody>
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: rIdx < rows.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                        <td style={{ padding: '8px 10px', background: '#f8fafc', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0', width: '25%' }}>
                          {row[0].label}
                        </td>
                        <td style={{ padding: '8px 10px', fontWeight: 800, color: '#1e293b', borderRight: '1px solid #e2e8f0', width: '25%' }}>
                          {row[0].value}
                        </td>
                        <td style={{ padding: '8px 10px', background: row[1] ? '#f8fafc' : '#ffffff', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0', width: '25%' }}>
                          {row[1]?.label || ''}
                        </td>
                        <td style={{ padding: '8px 10px', fontWeight: 800, color: '#1e293b', width: '25%' }}>
                          {row[1]?.value || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* SGPA Table */}
                {sgpaFilled.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                      Semester SGPA
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: '10px', textAlign: 'center' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          {sgpaValues.map((_, idx) => (
                            <th key={idx} style={{ padding: '6px 4px', fontWeight: 700, color: '#475569', borderRight: idx < sgpaValues.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                              Sem {idx + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {sgpaValues.map((v, idx) => (
                            <td key={idx} style={{ padding: '8px 4px', fontWeight: 800, color: '#1e293b', borderRight: idx < sgpaValues.length - 1 ? '1px solid #e2e8f0' : 'none', background: v ? (parseFloat(v) >= 8 ? '#f0fdf4' : parseFloat(v) >= 6.5 ? '#eff6ff' : '#fff7ed') : '#ffffff' }}>
                              {v || '—'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()}

          {/* ══ SKILLS ══ */}
          {skills.length > 0 && (
            <>
              <SectionHead title={`Skills (${skills.length})`} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {skills.map((s: any, i: number) => (
                  <span key={s.id ?? i} style={{
                    padding: '3px 10px', background: '#eff6ff',
                    border: '1px solid #bfdbfe', borderRadius: 20,
                    fontSize: 9.5, fontWeight: 700, color: '#1d4ed8',
                  }}>
                    {s.skill_name}{s.proficiency ? ` · ${s.proficiency}` : ''}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* ══ INTERNSHIPS ══ */}
          {internships.length > 0 && (
            <>
              <SectionHead title={`Internships (${internships.length})`} />
              <div style={{ marginBottom: 20 }}>
                {internships.map((intern: any, i: number) => (
                  <div key={intern.id ?? i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', marginBottom: 8,
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 14, marginTop: 1 }}>💼</div>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: '#1e293b' }}>{intern.role}</div>
                      <div style={{ fontSize: 9.5, color: '#64748b' }}>
                        {intern.company_name}{intern.duration ? ` · ${intern.duration}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ PLACEMENT STATUS ══ */}
          <SectionHead title="Placement Status" />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 18px', marginBottom: 20,
            background: isPlaced ? '#f0fdf4' : '#fff7ed',
            border: `1px solid ${isPlaced ? '#bbf7d0' : '#fed7aa'}`,
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 20 }}>{isPlaced ? '✅' : '⏳'}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: isPlaced ? '#065f46' : '#c2410c' }}>
                {academic?.placementStatus || 'Not Placed'}
              </div>
              {isPlaced && academic?.companyName && (
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>📍 {academic.companyName}</div>
              )}
              <div style={{
                display: 'inline-block', marginTop: 4,
                padding: '1px 8px', borderRadius: 3, fontSize: 8.5,
                fontWeight: 700, textTransform: 'uppercase',
                background: academic?.placementVerified ? '#dbeafe' : '#f1f5f9',
                color: academic?.placementVerified ? '#1d4ed8' : '#94a3b8',
              }}>
                {academic?.placementVerified ? 'Staff Verified' : 'Pending Verification'}
              </div>
            </div>
          </div>

          {/* ══ FOOTER ══ */}
          <HR />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 8.5, color: '#94a3b8' }}>
              {profile?.isVerifiedByStaff
                ? '✓ Profile verified by Placement Officer'
                : '○ Profile pending staff verification'}
            </div>
            <div style={{ fontSize: 8.5, color: '#cbd5e1', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              PlacementMate · Placement Readiness Report · {new Date().getFullYear()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
