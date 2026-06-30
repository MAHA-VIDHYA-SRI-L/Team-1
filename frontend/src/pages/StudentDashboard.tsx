import { useState, useRef, useEffect } from 'react';
import { 
  LogOut, LayoutDashboard, User, Briefcase, CheckCircle2, 
  RotateCcw, Award, CalendarDays, Settings, Camera, 
  X, BadgeCheck, Clock, CheckCircle, FileText, Upload, Loader2, FileBarChart, Menu, Sun, Moon
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { SkeletonCard, SkeletonProfile } from '../components/SkeletonLoader';
import logoUrl from '../assets/logo.jpg';
import { uploadResume, fetchResume, fetchStudentProfile, fetchAcademicDetails, saveStudentProfile, saveAcademicDetails } from '../services/api';
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
  onNavigateToPlacement: () => void;
  onNavigateToReport: () => void;
}

export default function StudentDashboard({ user, onLogout, onNavigateToBadges, onNavigateToPlacement, onNavigateToReport }: StudentDashboardProps) {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [checkingProfile, setCheckingProfile] = useState<boolean>(true);
  const [profileFormRecord, setProfileFormRecord] = useState<Partial<StudentProfileData> | null>(null);
  
  const { addToast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode state from document
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  // Profile picture upload and sidebar drawer states
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVerified = profileFormRecord?.isVerifiedByStaff || false; 
  const placementStatus = profileFormRecord?.placementStatus || 'Not Placed';

  // Resume state
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResume().then(d => { if (d?.resume?.resume_url) setResumeUrl(d.resume.resume_url); }).catch(() => {});
    Promise.all([
      fetchStudentProfile(),
      fetchAcademicDetails().catch(() => ({ academic: {} })),
    ])
      .then(([profileRes, academicRes]) => {
        const merged: Partial<StudentProfileData> = { ...profileRes.profile, ...academicRes.academic };
        if (merged.name) {
          setProfileFormRecord(merged);
          setIsSetupComplete(true);
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
      addToast('Resume uploaded successfully!', 'success');
    } catch (err: any) {
      setResumeError(err.message);
      addToast(err.message || 'Failed to upload resume', 'error');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to reset your profile details? You will have to fill out the setup form again.")) {
      setProfileFormRecord(null);
      setIsSetupComplete(false);
      addToast('Profile reset initiated.', 'info');
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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <SkeletonProfile />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
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
              const [, academicRes] = await Promise.all([
                saveStudentProfile(completedForm),
                fetchAcademicDetails().catch(() => null),
              ]);
              await saveAcademicDetails(completedForm, !!academicRes?.academic);
              addToast('Profile setup complete! Welcome to Placemate.', 'success');
            } catch {
              addToast('Error saving profile. Please try again.', 'error');
            }
          }} 
      />
    );
  }

  // safe profile object to avoid null checks during the initial checking phase
  const pf = profileFormRecord || ({} as Partial<StudentProfileData>);

  const totalSemFieldsCount = (pf.sgpaSemesterValues || []).filter((v: any) => v !== '').length || 0;
  const currentCgpa = pf.graduationStanding === 'PG' ? ((pf as any).pgCgpa || (pf as any).ugCgpa) : (pf as any).finalCgpa;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-[#002D62]/5 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`bg-[#002D62] dark:bg-slate-900 text-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 shadow-xl border-r border-transparent dark:border-slate-800 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} overflow-hidden`}>
        <div className="p-6 space-y-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center justify-between gap-3">
            <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/20">
                <img src={logoUrl} alt="Placemate Logo" className="w-full h-full object-cover" />
              </div>
              <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-32'}`}>
                <h1 className="text-xl font-black tracking-wider uppercase">Placemate</h1>
                <p className="text-[10px] font-bold text-blue-300/80 dark:text-blue-400/80 tracking-widest uppercase mt-0.5">Student</p>
              </div>
            </div>
            <button onClick={() => setSidebarCollapsed(prev => !prev)} className={`rounded-full p-2 text-slate-200 hover:bg-white/10 transition-colors duration-200 shrink-0 ${sidebarCollapsed ? 'absolute right-6' : ''}`}>
              <Menu className="h-4 w-4" />
            </button>
          </div>
          
          <nav className="space-y-2">
            <button title="Overview Dashboard" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 border border-orange-500 text-white group`}>
              <LayoutDashboard className="h-4 w-4 stroke-[2.5] shrink-0 transition-transform group-hover:scale-110" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Overview Dashboard</span>
            </button>

            <button title="Badges & Certificates" onClick={onNavigateToBadges} className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 group`}>
              <Award className="h-4 w-4 text-amber-400 stroke-[2.5] shrink-0 transition-transform group-hover:scale-110" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Badges & Certificates</span>
            </button>
            <button title="Placement Readiness" onClick={onNavigateToPlacement} className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 group`}>
              <CheckCircle className="h-4 w-4 text-emerald-400 stroke-[2.5] shrink-0 transition-transform group-hover:scale-110" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Placement Readiness</span>
            </button>

            <button title="Formal Report" onClick={onNavigateToReport} className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 group`}>
              <FileBarChart className="h-4 w-4 text-emerald-400 stroke-[2.5] shrink-0 transition-transform group-hover:scale-110" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Formal Report</span>
            </button>
            
            <button title="Reset Profile Data" onClick={handleResetProfile} className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 group`}>
              <RotateCcw className="h-4 w-4 text-orange-400 stroke-[2.5] shrink-0 transition-transform group-hover:scale-110" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Reset Profile Data</span>
            </button>
          </nav>
        </div>
        
        {/* Profile Settings & Logout Section */}
        <div className="p-4 border-t border-white/10 dark:border-slate-800 space-y-2 bg-[#00224D] dark:bg-slate-950">
          <button title="Profile Settings" onClick={() => setIsSettingsOpen(true)} className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 dark:hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 group`}>
            <Settings className="h-4 w-4 stroke-[2.5] shrink-0 transition-transform group-hover:rotate-90" />
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Profile Settings</span>
          </button>

          <button title="Logout Account" onClick={onLogout} className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} px-4 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 group`}>
            <LogOut className="h-4 w-4 stroke-[2.5] shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* WORKSPACE WINDOW */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* HEADER: Dynamic Circular Avatar and details aligned Left */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br from-[#0b63ff] to-[#1db954] overflow-hidden ring-4 transition-all duration-300 ${isVerified ? 'ring-blue-500 shadow-lg' : 'ring-amber-400 shadow-md'}`}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-slate-400 dark:text-slate-200">{((pf.name as string) || user.fullName || 'S').charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm">
                {isVerified ? (
                  <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-50 dark:fill-blue-900/50" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500 fill-amber-50 dark:fill-amber-900/50" />
                )}
              </div>

              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white leading-none">{(pf.name as string) || user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{(pf.department as string) || 'Student'}</p>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isVerified ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isVerified ? 'Verified Profile' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="md:hidden flex items-center gap-3">
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-[#002D62] dark:hover:text-blue-400"><Settings className="h-5 w-5" /></button>
              <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500"><LogOut className="h-5 w-5" /></button>
            </div>
          </div>
        </header>

        {/* WORKSPACE VIEWPORT */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Welcome to your Dashboard, {(pf.name as string)?.split(' ')[0] || user.fullName.split(' ')[0]}!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Keep track of your pending campus application metrics and profile status updates.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-sm overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#002D62] dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-[#002D62] dark:text-blue-400 tracking-wider uppercase">Verified Profile Credentials</h3>
                  </div>
                  <button onClick={() => setIsSettingsOpen(true)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Edit Settings</button>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Register Number</p>
                    <p className="font-black text-slate-700 dark:text-slate-200 mt-1">{(pf.regsNumber as string) || 'Not provided'}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <p className="text-[11px] font-bold uppercase tracking-wide">Date of Birth</p>
                    </div>
                    <p className="font-black text-slate-700 dark:text-slate-200">{(pf.dob as string) || 'Not provided'}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Official Email Address</p>
                    <p className="font-black text-slate-700 dark:text-slate-200 mt-1 break-all">{(pf.email as string) || user.email}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mobile Phone Contact</p>
                    <p className="font-black text-slate-700 dark:text-slate-200 mt-1">{(pf.phone as string) || 'Not provided'}</p>
                  </div>
                  
                  <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">LinkedIn Profile URL</p>
                      <p className="font-black text-blue-600 dark:text-blue-400 mt-1 truncate max-w-[200px] sm:max-w-xs">{(pf.linkedinUrl as string) || 'Not linked'}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700 sm:col-span-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Setup Tracking Term</p>
                    <p className="font-black text-[#002D62] dark:text-blue-400 mt-1 uppercase">
                      {(pf.year as string) || 'N/A'} — {pf.semesterTerm ? `${pf.semesterTerm} Semester` : 'N/A'}
                    </p>
                  </div>
                  
                  {pf.address && (
                    <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700 sm:col-span-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Permanent Home Address</p>
                      <p className="font-black text-slate-600 dark:text-slate-300 mt-1">
                        {pf.address}{pf.district ? `, ${pf.district}` : ''}{pf.stateName ? `, ${pf.stateName}` : ''}{pf.pinCode ? ` — ${pf.pinCode}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-6 rounded-2xl border-2 shadow-sm text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[140px] transition-all duration-300 ${
                placementStatus === 'Placed' 
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500/30' 
                  : 'bg-orange-50 dark:bg-orange-950 border-orange-500/30'
              }`}>
                <div className={`absolute -right-4 -bottom-4 opacity-5 rotate-[-15deg] transition-all duration-300 ${placementStatus === 'Placed' ? 'text-emerald-900 dark:text-emerald-50' : 'text-orange-900 dark:text-orange-50'}`}>
                  <CheckCircle className="w-48 h-48" />
                </div>
                
                <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 mb-2 ${placementStatus === 'Placed' ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}`}>
                  Official Placement Status
                </p>
                <h3 className={`text-4xl font-black tracking-tight relative z-10 ${placementStatus === 'Placed' ? 'text-emerald-600 dark:text-emerald-500' : 'text-orange-600 dark:text-orange-500'}`}>
                  {placementStatus === 'Placed' ? 'PLACED' : 'NOT PLACED'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-3 relative z-10 uppercase tracking-wide">
                  Verified by Staff Administration
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between group hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors duration-200">
                <div>
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {pf.graduationStanding === 'PG' ? 'PG Current CGPA' : 'Current Eligibility (CGPA)'}
                  </p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500 mt-1">{currentCgpa || '0.00'}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform duration-200"><CheckCircle2 className="h-6 w-6" /></div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between group hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200">
                <div>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active Track Semesters</p>
                  <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{totalSemFieldsCount} <span className="text-lg text-slate-300 dark:text-slate-600">/ 8</span></p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform duration-200"><Briefcase className="h-6 w-6" /></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-lg p-6 transition-colors">
            <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Historical Semester Matrix Scores</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Scale: 10.00</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {(pf.sgpaSemesterValues || Array(8).fill('')).map((score, i) => (
                <div key={i} className={`p-4 border rounded-xl text-center transition-all ${score ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/50' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60'}`}>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Sem {i + 1}</span>
                  <span className="text-lg font-black text-[#002D62] dark:text-blue-400 mt-1 block">{score || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#002D62] dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Resume</h3>
              </div>
              <div className="relative inline-block">
                {/* Pulsing ring to attract attention */}
                {!resumeUrl && (
                  <span className="absolute -inset-1.5 rounded-lg bg-[#002D62] dark:bg-blue-500 opacity-20 animate-ping blur-lg" />
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
                className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                <FileText className="h-4 w-4" /> View Uploaded Resume
              </a>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No resume uploaded yet. Upload a PDF to enable AI analysis in the Reports page.</p>
            )}
          </div>
        </main>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-700">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-[24px]">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#002D62] dark:text-blue-400" />
                <h2 className="text-lg font-bold text-[#002D62] dark:text-white">Profile Settings</h2>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select a section to edit</p>
              
              <button onClick={() => { setIsSettingsOpen(false); handleResetProfile(); }} className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-all text-left group">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">Basic & Contact Details</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Phone, Address, LinkedIn, DOB</p>
                </div>
              </button>
              
              <button onClick={() => { setIsSettingsOpen(false); handleResetProfile(); }} className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-all text-left group">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">Academic Records</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">10th, 12th, Current Semesters, SGPA</p>
                </div>
              </button>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 italic">Note: Making changes will require you to review and confirm the profile setup wizard.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}