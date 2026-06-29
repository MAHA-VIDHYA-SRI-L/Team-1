import { useState, useRef, useEffect } from 'react';
import { 
  LogOut, LayoutDashboard, User, Briefcase, CheckCircle2, 
  RotateCcw, Award, CalendarDays, Settings, Camera, 
  X, BadgeCheck, Clock, CheckCircle, FileText, Upload,
  Sparkles, Loader2, TrendingUp, AlertTriangle, Lightbulb, Building2
} from 'lucide-react';
import { uploadResume, fetchResume, runAnalysis, fetchAnalysis, fetchStudentProfile, fetchAcademicDetails, saveStudentProfile, saveAcademicDetails, updateSelfPlacement } from '../services/api';
import StudentProfileWizard from '../components/StudentProfileWizard';
import type { StudentProfileData } from '../types/profile';

interface StudentDashboardProps {
  user: {
    fullName: string;
    email: string;
    idNumber?: string;
    contactNo?: string;
  };
  onLogout: () => void;
  onNavigateToBadges: () => void;
}

export default function StudentDashboard({ user, onLogout, onNavigateToBadges }: StudentDashboardProps) {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [isResumeRequired, setIsResumeRequired] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [profileFormRecord, setProfileFormRecord] = useState<Partial<StudentProfileData> | null>(null);

  // Profile picture upload and sidebar drawer states
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVerified = profileFormRecord?.isVerifiedByStaff || false; 
  const placementStatus = profileFormRecord?.placementStatus || 'Not Placed';
  const placementVerified = profileFormRecord?.placementVerified || false;
  const [placementEdit, setPlacementEdit] = useState(false);
  const [placementInput, setPlacementInput] = useState<'Placed' | 'Not Placed'>(placementStatus as 'Placed' | 'Not Placed');
  const [companyInput, setCompanyInput] = useState(profileFormRecord?.companyName || '');
  const [placementSaving, setPlacementSaving] = useState(false);

  const handleSavePlacement = async () => {
    if (placementInput === 'Placed' && !companyInput.trim()) return;
    setPlacementSaving(true);
    try {
      await updateSelfPlacement(placementInput, companyInput.trim() || undefined);
      setProfileFormRecord(prev => prev ? { ...prev, placementStatus: placementInput, placementVerified: false, companyName: companyInput.trim() } : prev);
      setPlacementEdit(false);
    } catch {}
    setPlacementSaving(false);
  };

  // Resume & Analysis state
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis().then(d => { if (d?.analysis) setAnalysis(d.analysis); }).catch(() => {});
    Promise.all([
      fetchStudentProfile(),
      fetchAcademicDetails().catch(() => ({ academic: {} })),
      fetchResume().catch(() => null),
    ])
      .then(([profileRes, academicRes, resumeRes]) => {
        const resumeFetched = resumeRes?.resume?.resume_url || null;
        if (resumeFetched) setResumeUrl(resumeFetched);
        const merged: Partial<StudentProfileData> = { ...profileRes.profile, ...academicRes.academic };
        if (merged.name) {
          setProfileFormRecord(merged);
          const profileComplete = !!(merged.phone && merged.phone.trim() && merged.dob && merged.dob.trim());
          setIsSetupComplete(profileComplete);
          if (profileComplete) setIsResumeRequired(false);
        } else {
          setIsSetupComplete(false);
        }
      })
      .catch(() => {
        setFetchFailed(true);
        setIsSetupComplete(null);
      });
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    setResumeError(null);
    try {
      const data = await uploadResume(file);
      setResumeUrl(data.resume_url);
      setIsResumeRequired(false);
    } catch (err: any) {
      setResumeError(err.message);
    } finally {
      setResumeUploading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const data = await runAnalysis();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to reset your profile details? You will have to fill out the setup form again.")) {
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

  if (fetchFailed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 w-full max-w-sm text-center space-y-4">
          <p className="text-sm font-bold text-slate-700">Failed to load your profile.</p>
          <p className="text-xs text-slate-400">Your session may have expired. Please log out and log in again.</p>
          <button onClick={onLogout} className="w-full py-2.5 bg-[#002D62] text-white text-sm font-bold rounded-xl hover:bg-[#001f42] transition-colors">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (isSetupComplete === null) return null;

  if (!isSetupComplete || !profileFormRecord) {
    return (
      <StudentProfileWizard 
        initialEmail={user.email}
        initialName={user.fullName}
        initialRegsNumber={user.idNumber}
        initialPhone={user.contactNo}
        onComplete={async (completedForm) => {
          try {
            const [, academicRes] = await Promise.all([
              saveStudentProfile(completedForm),
              fetchAcademicDetails().catch(() => null),
            ]);
            await saveAcademicDetails(completedForm, !!academicRes?.academic);
            setProfileFormRecord(completedForm as Partial<StudentProfileData>);
            setIsSetupComplete(true);
            setIsResumeRequired(true);
          } catch (e: any) {
            alert('Failed to save profile: ' + e.message + '. Please try again.');
          }
        }} 
      />
    );
  }

  if (isResumeRequired) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 w-full max-w-md text-center space-y-5">
          <div className="p-4 bg-orange-50 rounded-2xl w-fit mx-auto">
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Upload Your Resume</h2>
            <p className="text-sm text-slate-500 mt-1.5">A resume is required to complete your setup and enable AI placement analysis.</p>
          </div>
          {resumeError && <p className="text-xs text-red-500 font-semibold">{resumeError}</p>}
          {resumeUrl ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-emerald-600">✓ Resume uploaded successfully</p>
              <button
                onClick={() => setIsResumeRequired(false)}
                className="w-full py-3 bg-[#002D62] text-white text-sm font-bold rounded-xl hover:bg-[#001f42] transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => resumeInputRef.current?.click()}
                disabled={resumeUploading}
                className="w-full py-3 bg-[#002D62] text-white text-sm font-bold rounded-xl hover:bg-[#001f42] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {resumeUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {resumeUploading ? 'Uploading...' : 'Select PDF Resume'}
              </button>
              <input ref={resumeInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
            </>
          )}
        </div>
      </div>
    );
  }

  const totalSemFieldsCount = profileFormRecord.sgpaSemesterValues?.filter(v => v !== '').length || 0;
  const currentCgpa = profileFormRecord.graduationStanding === 'PG' ? profileFormRecord.pgCgpa : profileFormRecord.finalCgpa;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      
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
            
            <button onClick={handleResetProfile} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all">
              <RotateCcw className="h-4 w-4 text-orange-400 stroke-[2.5]" />
              <span>Reset Profile Data</span>
            </button>
          </nav>
        </div>
        
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

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-black text-lg bg-slate-200 overflow-hidden ring-4 transition-all duration-300 ${isVerified ? 'ring-blue-500' : 'ring-amber-400'}`}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-slate-400">{(profileFormRecord.name || user.fullName || 'S').charAt(0).toUpperCase()}</span>
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
              <p className="text-sm font-black text-slate-800 leading-none">{profileFormRecord.name || user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{profileFormRecord.department || 'Student'}</p>
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

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome to your Dashboard, {profileFormRecord.name?.split(' ')[0] || 'Student'}!</h2>
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
                    <p className="font-black text-slate-700 mt-1">{profileFormRecord.regsNumber || 'Not provided'}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <p className="text-[11px] font-bold uppercase tracking-wide">Date of Birth</p>
                    </div>
                    <p className="font-black text-slate-700">{profileFormRecord.dob || 'Not provided'}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Official Email Address</p>
                    <p className="font-black text-slate-700 mt-1 break-all">{profileFormRecord.email}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mobile Phone Contact</p>
                    <p className="font-black text-slate-700 mt-1">{profileFormRecord.phone || 'Not provided'}</p>
                  </div>
                  
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">LinkedIn Profile URL</p>
                      <p className="font-black text-blue-600 mt-1 truncate max-w-[200px] sm:max-w-xs">{profileFormRecord.linkedinUrl || 'Not linked'}</p>
                    </div>
                    {}
                    <svg className="h-6 w-6 text-blue-600/30 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Setup Tracking Term</p>
                    <p className="font-black text-[#002D62] mt-1 uppercase">
                      {profileFormRecord.year || 'N/A'} — {profileFormRecord.semesterTerm ? `${profileFormRecord.semesterTerm} Semester` : 'N/A'}
                    </p>
                  </div>
                  
                  {profileFormRecord.address && (
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Permanent Home Address</p>
                      <p className="font-black text-slate-600 mt-1">
                        {profileFormRecord.address}{profileFormRecord.district ? `, ${profileFormRecord.district}` : ''}{profileFormRecord.stateName ? `, ${profileFormRecord.stateName}` : ''}{profileFormRecord.pinCode ? ` — ${profileFormRecord.pinCode}` : ''}
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
                    {profileFormRecord.graduationStanding === 'PG' ? 'PG Current CGPA' : 'Current Eligibility (CGPA)'}
                  </p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{currentCgpa || '0.00'}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-200"><CheckCircle2 className="h-6 w-6" /></div>
              </div>

              <div className={`p-5 rounded-2xl border-2 shadow-sm relative overflow-hidden transition-all duration-300 ${
                placementStatus === 'Placed' ? 'bg-emerald-50 border-emerald-400/40' : 'bg-orange-50 border-orange-400/40'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    placementStatus === 'Placed' ? 'text-emerald-700' : 'text-orange-700'
                  }`}>Placement Status</p>
                  {!placementEdit && (
                    <button onClick={() => { setPlacementEdit(true); setPlacementInput(placementStatus as 'Placed' | 'Not Placed'); setCompanyInput(profileFormRecord?.companyName || ''); }}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-colors">Edit</button>
                  )}
                </div>

                {placementEdit ? (
                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      {(['Not Placed', 'Placed'] as const).map(s => (
                        <button key={s} onClick={() => setPlacementInput(s)}
                          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                            placementInput === s
                              ? s === 'Placed' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-orange-500 text-white border-orange-500'
                              : 'bg-white text-slate-500 border-slate-200'
                          }`}>{s}</button>
                      ))}
                    </div>
                    {placementInput === 'Placed' && (
                      <div className="relative">
                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" placeholder="Company name *" value={companyInput}
                          onChange={e => setCompanyInput(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setPlacementEdit(false)}
                        className="flex-1 py-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                      <button onClick={handleSavePlacement} disabled={placementSaving || (placementInput === 'Placed' && !companyInput.trim())}
                        className="flex-1 py-1.5 text-[11px] font-bold text-white bg-[#002D62] rounded-lg hover:bg-[#001f42] disabled:opacity-50 transition-colors">
                        {placementSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className={`text-3xl font-black tracking-tight ${
                      placementStatus === 'Placed' ? 'text-emerald-600' : 'text-orange-600'
                    }`}>{placementStatus === 'Placed' ? 'PLACED' : 'NOT PLACED'}</h3>
                    {placementStatus === 'Placed' && profileFormRecord?.companyName && (
                      <p className="text-[11px] font-bold text-slate-600 mt-1">{profileFormRecord.companyName}</p>
                    )}
                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      placementVerified ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {placementVerified ? <BadgeCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {placementVerified ? 'Staff Verified' : 'Pending Verification'}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm p-6">
            <div className="flex justify-between items-end border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-sm font-bold text-slate-800">Historical Semester Matrix Scores</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Scale: 10.00</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {(profileFormRecord.sgpaSemesterValues || Array(8).fill('')).map((score, i) => (
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
              <button
                onClick={() => resumeInputRef.current?.click()}
                disabled={resumeUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002D62] text-white text-[11px] font-bold rounded-lg hover:bg-[#052349] disabled:opacity-60 transition-colors"
              >
                {resumeUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {resumeUploading ? 'Uploading...' : 'Upload PDF'}
              </button>
              <input ref={resumeInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
            </div>

            {resumeError && <p className="text-xs text-red-500 font-semibold mb-3">{resumeError}</p>}

            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                <FileText className="h-4 w-4" /> View Uploaded Resume
              </a>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No resume uploaded yet. Upload a PDF to enable AI analysis.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#002D62]" />
                <h3 className="text-sm font-bold text-slate-800">AI Placement Analysis</h3>
              </div>
              <button
                onClick={handleRunAnalysis}
                disabled={analysisLoading || !resumeUrl}
                title={!resumeUrl ? 'Upload a resume first' : ''}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-[11px] font-bold rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
              >
                {analysisLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {analysisLoading ? 'Analyzing...' : analysis ? 'Re-Analyze' : 'Run Analysis'}
              </button>
            </div>

            {analysisError && <p className="text-xs text-red-500 font-semibold mb-3">{analysisError}</p>}

            {!analysis && !analysisLoading && (
              <p className="text-xs text-slate-400 font-medium">No analysis yet. {!resumeUrl ? 'Upload a resume first, then run' : 'Click "Run Analysis"'} to generate your placement readiness report.</p>
            )}

            {analysis && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-[#002D62]">{analysis.readiness_score}<span className="text-lg text-slate-400">/100</span></p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Readiness Score</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide ${
                    analysis.readiness_status === 'Ready' ? 'bg-emerald-100 text-emerald-700' :
                    analysis.readiness_status === 'Almost Ready' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{analysis.readiness_status}</span>
                </div>

                {analysis.consolidated_report && (
                  <p className="text-xs text-slate-600 leading-relaxed border-l-2 border-[#002D62]/20 pl-3">{analysis.consolidated_report}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Strengths</p>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium">{analysis.strengths}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">Weaknesses</p>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium">{analysis.weaknesses}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-blue-600" />
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-wide">Recommendations</p>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium">{analysis.recommendations}</p>
                  </div>
                </div>

                {analysis.analyzed_at && (
                  <p className="text-[10px] text-slate-400 font-medium">Last analyzed: {new Date(analysis.analyzed_at).toLocaleString()}</p>
                )}
              </div>
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