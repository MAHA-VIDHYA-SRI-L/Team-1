import { useState, useRef, useEffect } from 'react';
import { 
  LogOut, LayoutDashboard, User, Briefcase, CheckCircle2, 
  RotateCcw, Award, CalendarDays, Settings, Camera, 
  X, BadgeCheck, Clock, CheckCircle, FileText, Upload, Loader2, FileBarChart
} from 'lucide-react';
import { uploadResume, fetchResume, fetchStudentProfile, fetchAcademicDetails, saveStudentProfile, saveAcademicDetails } from '../services/api';
import StudentProfileWizard from '../components/StudentProfileWizard';
import type { StudentProfileData } from '../types/profile';

interface StudentDashboardProps {
  user: {
    fullName: string;
    email: string;
    idNumber?: string;
    contactNo?: string;
    department?: string;
  };
  onLogout: () => void;
  onNavigateToBadges: () => void;
  onNavigateToPlacement: () => void;
  onNavigateToReport: () => void;
  onDepartmentLoaded?: (dept: string) => void;
}

export default function StudentDashboard({ user, onLogout, onNavigateToBadges, onNavigateToPlacement, onNavigateToReport, onDepartmentLoaded }: StudentDashboardProps) {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [checkingProfile, setCheckingProfile] = useState<boolean>(true);
  const [profileFormRecord, setProfileFormRecord] = useState<Partial<StudentProfileData> | null>(null);

  // Profile picture upload and sidebar drawer states
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVerified = profileFormRecord?.isVerifiedByStaff || false; 
  const placementStatus = profileFormRecord?.placementStatus || 'Not Placed';

  // Resume state
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResume().then(d => {
      // backend returns { resume: { resume_url, uploaded_at } }
      const url = d?.resume?.resume_url || d?.resume_url || null;
      if (url) setResumeUrl(url);
    }).catch(() => {});
    Promise.all([
      fetchStudentProfile(),
      fetchAcademicDetails().catch(() => ({ academic: {} })),
    ])
      .then(([profileRes, academicRes]) => {
        const merged: Partial<StudentProfileData> = { ...profileRes.profile, ...academicRes.academic };
        if (merged.name) {
          setProfileFormRecord(merged);
          setIsSetupComplete(true);
          if (merged.department && onDepartmentLoaded) {
            onDepartmentLoaded(merged.department as string);
          }
        } else {
          setIsSetupComplete(false);
        }
      })
      .catch(() => {
        setIsSetupComplete(false);
      })
      .finally(() => setCheckingProfile(false));
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    setResumeError(null);
    try {
      const data = await uploadResume(file);
      setResumeUrl(data.resume_url);
    } catch (err: any) {
      setResumeError(err.message);
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to reset your profile details? You will have to fill out the setup form again.")) {
      sessionStorage.removeItem('studentWizardState');
      setProfileFormRecord(null);
      setIsSetupComplete(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  if (checkingProfile) {
    // While we validate whether profile setup exists, show the dashboard shell to avoid flashing the wizard
    // The real content will load once checkingProfile is false
  } else if (!isSetupComplete || !profileFormRecord) {
    return (
      <StudentProfileWizard 
        initialEmail={user.email}
        initialName={user.fullName}
        initialRegsNumber={user.idNumber}
        onComplete={async (completedForm) => {
          setProfileFormRecord(completedForm as Partial<StudentProfileData>);
          setIsSetupComplete(true);
          try {
            await saveStudentProfile(completedForm);
            const existingAcademic = await fetchAcademicDetails().catch(() => null);
            const hasExisting = !!(existingAcademic?.academic && Object.keys(existingAcademic.academic).length > 0);
            await saveAcademicDetails(completedForm, hasExisting);
          } catch {}
        }} 
      />
    );
  }

  // safe profile object to avoid null checks during the initial checking phase
  const pf = profileFormRecord || ({} as Partial<StudentProfileData>);

  const totalSemFieldsCount = (pf.sgpaSemesterValues || []).filter((v: any) => v !== '').length || 0;
  // ugCgpa is always set from API (ug_cgpa field). finalCgpa is computed locally by the wizard.
  // For PG students use pgCgpa, for UG use ugCgpa then fallback to finalCgpa.
  const currentCgpa =
    pf.graduationStanding === 'PG'
      ? ((pf as any).pgCgpa || (pf as any).ugCgpa || '0.00')
      : ((pf as any).ugCgpa || (pf as any).finalCgpa || '0.00');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#002D62] text-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 shadow-xl">
        <div className="p-6 space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-black tracking-wider uppercase">Placemate</h1>
            <p className="text-[10px] font-bold text-blue-300/80 tracking-widest uppercase mt-0.5">Student Workstation</p>
          </div>
          
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-[13px] font-bold tracking-wide transition-all border border-white/10">
              <LayoutDashboard className="h-4 w-4 stroke-[2.5]" />
              <span>Overview Dashboard</span>
            </button>

            <button onClick={onNavigateToBadges} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all">
              <Award className="h-4 w-4 text-amber-400 stroke-[2.5]" />
              <span>Badges & Certificates</span>
            </button>
            <button onClick={onNavigateToPlacement} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all">
              <CheckCircle className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
              <span>Placement Readiness</span>
            </button>

            <button onClick={onNavigateToReport} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all">
              <FileBarChart className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
              <span>Formal Report</span>
            </button>
            
            <button onClick={handleResetProfile} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all">
              <RotateCcw className="h-4 w-4 text-orange-400 stroke-[2.5]" />
              <span>Reset Profile Data</span>
            </button>
          </nav>
        </div>
        
        {/* Profile Settings & Logout Section */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-[#00224D]">
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-[13px] font-bold tracking-wide transition-all">
            <Settings className="h-4 w-4 stroke-[2.5]" />
            <span>Profile Settings</span>
          </button>

          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-[13px] font-bold tracking-wide transition-all">
            <LogOut className="h-4 w-4 stroke-[2.5]" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* WORKSPACE WINDOW */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* HEADER: Dynamic Circular Avatar and details aligned Left */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br from-[#0b63ff] to-[#1db954] overflow-hidden ring-4 transition-all duration-300 ${isVerified ? 'ring-blue-500 shadow-lg' : 'ring-amber-400 shadow-md'}`}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-slate-400">{((pf.name as string) || user.fullName || 'S').charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                {isVerified ? (
                  <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-50" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500 fill-amber-50" />
                )}
              </div>

              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-800 leading-none">{(pf.name as string) || user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{(pf.department as string) || 'Student'}</p>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isVerified ? 'text-blue-600' : 'text-amber-600'}`}>
                  {isVerified ? 'Verified Profile' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-[#002D62]"><Settings className="h-5 w-5" /></button>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>

        {/* WORKSPACE VIEWPORT */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome to your Dashboard, {(pf.name as string)?.split(' ')[0] || user.fullName.split(' ')[0]}!</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Keep track of your pending campus application metrics and profile status updates.</p>
            </div>
            <div className="w-16 h-[3px] sm:w-[3px] sm:h-12 bg-orange-500 rounded-full shrink-0"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#002D62]" />
                    <h3 className="text-sm font-bold text-[#002D62] tracking-wider uppercase">Verified Profile Credentials</h3>
                  </div>
                  <button onClick={() => setIsSettingsOpen(true)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Edit Settings</button>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Register Number</p>
                    <p className="font-black text-slate-700 mt-1">{(pf.regsNumber as string) || 'Not provided'}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <p className="text-[11px] font-bold uppercase tracking-wide">Date of Birth</p>
                    </div>
                    <p className="font-black text-slate-700">{(pf.dob as string) || 'Not provided'}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Official Email Address</p>
                    <p className="font-black text-slate-700 mt-1 break-all">{(pf.email as string) || user.email}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mobile Phone Contact</p>
                    <p className="font-black text-slate-700 mt-1">{(pf.phone as string) || 'Not provided'}</p>
                  </div>
                  
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">LinkedIn Profile URL</p>
                      <p className="font-black text-blue-600 mt-1 truncate max-w-[200px] sm:max-w-xs">{(pf.linkedinUrl as string) || 'Not linked'}</p>
                    </div>
                    <svg className="h-6 w-6 text-blue-600/30 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Setup Tracking Term</p>
                    <p className="font-black text-[#002D62] mt-1 uppercase">
                      {(pf.year as string) || 'N/A'} — {pf.semesterTerm ? `${pf.semesterTerm} Semester` : 'N/A'}
                    </p>
                  </div>
                  
                  {pf.address && (
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Permanent Home Address</p>
                      <p className="font-black text-slate-600 mt-1">
                        {pf.address}{pf.district ? `, ${pf.district}` : ''}{pf.stateName ? `, ${pf.stateName}` : ''}{pf.pinCode ? ` — ${pf.pinCode}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors duration-200">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Active Track Semesters</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{totalSemFieldsCount} <span className="text-lg text-slate-300">/ 8</span></p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-200"><Briefcase className="h-6 w-6" /></div>
              </div>
              
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between group hover:border-emerald-300 transition-colors duration-200">
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                    {pf.graduationStanding === 'PG' ? 'PG Current CGPA' : 'Current Eligibility (CGPA)'}
                  </p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{currentCgpa || '0.00'}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-200"><CheckCircle2 className="h-6 w-6" /></div>
              </div>

              <div className={`p-6 rounded-2xl border-2 shadow-sm text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[140px] transition-all duration-300 ${
                placementStatus === 'Placed' 
                  ? 'bg-emerald-50 border-emerald-500/30' 
                  : 'bg-orange-50 border-orange-500/30'
              }`}>
                <div className={`absolute -right-4 -bottom-4 opacity-5 rotate-[-15deg] transition-all duration-300 ${placementStatus === 'Placed' ? 'text-emerald-900' : 'text-orange-900'}`}>
                  <CheckCircle className="w-48 h-48" />
                </div>
                
                <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 mb-2 ${placementStatus === 'Placed' ? 'text-emerald-700' : 'text-orange-700'}`}>
                  Official Placement Status
                </p>
                <h3 className={`text-4xl font-black tracking-tight relative z-10 ${placementStatus === 'Placed' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {placementStatus === 'Placed' ? 'PLACED' : 'NOT PLACED'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-3 relative z-10 uppercase tracking-wide">
                  Verified by Staff Administration
                </p>
              </div>
            </div>
          </div>

            <div className="bg-white border border-slate-200 rounded-[24px] shadow-lg p-6">
            <div className="flex justify-between items-end border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-sm font-bold text-slate-800">Historical Semester Matrix Scores</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Scale: 10.00</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {(pf.sgpaSemesterValues || Array(8).fill('')).map((score, i) => (
                <div key={i} className={`p-4 border rounded-xl text-center transition-all ${score ? 'bg-blue-50/30 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Sem {i + 1}</span>
                  <span className="text-lg font-black text-[#002D62] mt-1 block">{score || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#002D62]" />
                <h3 className="text-sm font-bold text-slate-800">Resume</h3>
              </div>
              <div className="relative inline-block">
                {/* Pulsing ring to attract attention */}
                {!resumeUrl && (
                  <span className="absolute -inset-1.5 rounded-lg bg-[#002D62] opacity-20 animate-ping blur-lg" />
                )}
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading}
                  className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#0b63ff] to-[#06b6d4] text-white text-[12px] font-bold rounded-xl hover:scale-[1.02] disabled:opacity-60 transition-all shadow-md"
                >
                  {resumeUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{resumeUploading ? 'Uploading...' : (resumeUrl ? 'Replace Resume' : 'Upload Resume')}</span>
                </button>
                {!resumeUrl && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">New</div>
                )}
              </div>
              <input ref={resumeInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
            </div>

            {resumeError && <p className="text-xs text-red-500 font-semibold mb-3">{resumeError}</p>}

            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                <FileText className="h-4 w-4" /> View Uploaded Resume
              </a>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No resume uploaded yet. Upload a PDF to enable AI analysis in the Reports page.</p>
            )}
          </div>
        </main>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[24px]">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#002D62]" />
                <h2 className="text-lg font-bold text-[#002D62]">Profile Settings</h2>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select a section to edit</p>
              
              <button onClick={() => { setIsSettingsOpen(false); handleResetProfile(); }} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-blue-50 transition-all text-left group">
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">Basic & Contact Details</p>
                  <p className="text-xs text-slate-500 mt-0.5">Phone, Address, LinkedIn, DOB</p>
                </div>
              </button>
              
              <button onClick={() => { setIsSettingsOpen(false); handleResetProfile(); }} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-blue-50 transition-all text-left group">
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">Academic Records</p>
                  <p className="text-xs text-slate-500 mt-0.5">10th, 12th, Current Semesters, SGPA</p>
                </div>
              </button>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">Note: Making changes will require you to review and confirm the profile setup wizard.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}