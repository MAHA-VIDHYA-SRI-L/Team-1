import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Download, Loader2, AlertCircle,
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

interface ReportProps {
  user: { fullName: string; email: string; department?: string };
  onBackToDashboard: () => void;
}

export default function ReportPage({ user, onBackToDashboard }: ReportProps) {
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [academic, setAcademic] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
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
    let objectUrl: string | null = null;
    try {
      // Temporarily make the report visible at full width for capture
      const el = reportRef.current;
      const originalStyle = el.style.cssText;
      el.style.width = '794px';
      el.style.minHeight = 'auto';

      await new Promise(r => setTimeout(r, 150));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
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
      console.error(e);
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[#002D62]" />
        <span className="text-sm font-semibold text-slate-500">Building report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-slate-600">{error}</p>
        <button onClick={onBackToDashboard} className="text-xs font-bold text-[#002D62] underline">Back</button>
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

  const certsByCategory = certifications.reduce((acc: Record<string, any[]>, c: any) => {
    const cat = c.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  // ── Divider ──
  const HR = () => <div style={{ borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />;

  // ── Section heading ──
  const SectionHead = ({ title }: { title: string }) => (
    <div style={{
      background: '#002D62', color: '#fff', padding: '5px 12px',
      fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
      textTransform: 'uppercase', marginBottom: 10, borderRadius: 3,
    }}>
      {title}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#e5e7eb', fontFamily: 'Arial, sans-serif' }}>

      {/* ── Toolbar (not captured in PDF) ── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBackToDashboard}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', border: '1px solid #e2e8f0',
              borderRadius: 10, background: '#f8fafc', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: '#475569',
            }}
          >
            <ArrowLeft size={13} /> Back
          </button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#002D62', letterSpacing: 1 }}>PLACEMATE</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>PLACEMENT READINESS REPORT</div>
          </div>
        </div>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', background: downloading ? '#64748b' : '#002D62',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 12, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer',
          }}
        >
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {downloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* ── A4 Paper ── */}
      <div style={{ padding: '32px 16px', display: 'flex', justifyContent: 'center' }}>
        <div
          ref={reportRef}
          style={{
            width: 794, background: '#fff',
            boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
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
              borderRadius: 6, padding: '14px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>/ 100</div>
                <div style={{
                  marginTop: 4, fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: 0.8, color: scoreColor,
                  background: `${scoreColor}18`, padding: '2px 8px', borderRadius: 3,
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
                      <strong style={{ color: '#1e293b' }}>Certifications:</strong> {certifications.length}
                    </span>
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
                {analysis.consolidated_report}
              </div>
            </>
          )}

          {/* ══ ANALYSIS ══ */}
          {analysis && (analysis.strengths || analysis.weaknesses || analysis.recommendations) && (
            <>
              <SectionHead title="AI Analysis Summary" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                {analysis.strengths && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '10px 12px' }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: '#166534', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>✓ Strengths</div>
                    <div style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.7 }}>{analysis.strengths}</div>
                  </div>
                )}
                {analysis.weaknesses && (
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 4, padding: '10px 12px' }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: '#9a3412', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>⚠ Areas to Improve</div>
                    <div style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.7 }}>{analysis.weaknesses}</div>
                  </div>
                )}
                {analysis.recommendations && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '10px 12px' }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: '#1e40af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>→ Recommendations</div>
                    <div style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.7 }}>{analysis.recommendations}</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ ACADEMIC DETAILS ══ */}
          {academic && (
            <>
              <SectionHead title="Academic Details" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: '10th %', value: academic.tenthPercentage },
                  { label: '12th %', value: academic.twelfthPercentage },
                  { label: 'Diploma %', value: academic.diplomaPercentage },
                  { label: 'UG CGPA', value: academic.ugCgpa },
                  { label: 'PG CGPA', value: academic.pgCgpa },
                  { label: 'Degree', value: academic.graduationStanding },
                  { label: 'UG College', value: academic.ugCollegeName },
                  { label: 'Board', value: academic.boardOfStudy },
                ].filter(i => i.value && i.value !== '').map(item => (
                  <div key={item.label} style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 4, padding: '8px 10px',
                  }}>
                    <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', marginTop: 2 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* SGPA Table */}
              {sgpaFilled.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                    Semester SGPA
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {sgpaValues.map((v, i) => (
                      <div key={i} style={{
                        flex: 1, textAlign: 'center', padding: '6px 4px',
                        background: v ? (parseFloat(v) >= 8 ? '#d1fae5' : parseFloat(v) >= 6.5 ? '#dbeafe' : '#fff7ed') : '#f8fafc',
                        border: `1px solid ${v ? (parseFloat(v) >= 8 ? '#6ee7b7' : parseFloat(v) >= 6.5 ? '#93c5fd' : '#fed7aa') : '#e2e8f0'}`,
                        borderRadius: 4, opacity: v ? 1 : 0.4,
                      }}>
                        <div style={{ fontSize: 7.5, color: '#94a3b8', fontWeight: 700 }}>S{i + 1}</div>
                        <div style={{ fontSize: 11, fontWeight: 900, color: '#1e293b', marginTop: 1 }}>{v || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

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
                    padding: '8px 10px', marginBottom: 6,
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4,
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

          {/* ══ CERTIFICATIONS ══ */}
          {certifications.length > 0 && (
            <>
              <SectionHead title={`Certifications & Achievements (${certifications.length})`} />
              <div style={{ marginBottom: 20 }}>
                {Object.entries(certsByCategory).map(([cat, certs]) => (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{
                      fontSize: 9, fontWeight: 800, color: '#475569',
                      textTransform: 'uppercase', letterSpacing: 0.8,
                      borderBottom: '1px solid #f1f5f9', paddingBottom: 4, marginBottom: 6,
                    }}>
                      {cat} ({(certs as any[]).length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {(certs as any[]).map((cert: any, i: number) => (
                        <div key={cert.id ?? i} style={{
                          padding: '7px 10px', background: '#f8fafc',
                          border: '1px solid #e2e8f0', borderRadius: 4,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: '#1e293b' }}>{cert.certification_name}</div>
                          <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>{cert.issuer}</div>
                          {cert.start_date && (
                            <div style={{ fontSize: 8.5, color: '#94a3b8', marginTop: 1 }}>
                              {cert.start_date}{cert.end_date ? ` — ${cert.end_date}` : ''}
                            </div>
                          )}
                          <span style={{
                            display: 'inline-block', marginTop: 3,
                            padding: '1px 6px', borderRadius: 3, fontSize: 8,
                            fontWeight: 700, textTransform: 'uppercase',
                            background: cert.status?.toLowerCase() === 'approved' ? '#d1fae5' : '#fff7ed',
                            color: cert.status?.toLowerCase() === 'approved' ? '#065f46' : '#c2410c',
                          }}>
                            {cert.status || 'Pending'}
                          </span>
                        </div>
                      ))}
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
            padding: '10px 14px', marginBottom: 20,
            background: isPlaced ? '#f0fdf4' : '#fff7ed',
            border: `1px solid ${isPlaced ? '#bbf7d0' : '#fed7aa'}`,
            borderRadius: 4,
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
