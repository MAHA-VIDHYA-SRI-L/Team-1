import { useState, useRef, useEffect } from 'react';
import {
  LogOut, LayoutDashboard, User, Briefcase, CheckCircle2,
  RotateCcw, Award, CalendarDays, Settings, Camera,
  X, BadgeCheck, Clock, CheckCircle, FileText, Upload, Loader2, FileBarChart, Menu
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
    department?: string;
  };
  onLogout: () => void;
  onNavigateToBadges: () => void;
  onNavigateToPlacement: () => void;
  onNavigateToReport: () => void;
  onDepartmentLoaded?: (dept: string) => void;
}

const NAV_ITEMS = (
  onDashboard: () => void,
  onBadges: () => void,
  onPlacement: () => void,
  onReport: () => void,
  onReset: () => void,
) => [
  { label: 'Dashboard',          icon: LayoutDashboard, onClick: onDashboard,  active: true  },
  { label: 'Badges & Certificates', icon: Award,        onClick: onBadges,     active: false },
  { label: 'Placement Readiness',   icon: CheckCircle,  onClick: onPlacement,  active: false },
  { label: 'Formal Report',         icon: FileBarChart, onClick: onReport,     active: false },
  { label: 'Reset Profile',         icon: RotateCcw,    onClick: onReset,      active: false },
];

const InfoTile = ({ label, value, span = false }: { label: string; value: string; span?: boolean }) => (
  <div className={`p-4 bg-slate-50 rounded-xl border border-slate-100 ${span ? 'sm:col-span-2' : ''}`}>
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-700 break-all">{value || '—'}</p>
  </div>
);

export default function StudentDashboard({
  user, onLogout, onNavigateToBadges, onNavigateToPlacement, onNavigateToReport, onDepartmentLoaded,
}: StudentDashboardProps) {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileFormRecord, setProfileFormRecord] = useState<Partial<StudentProfileData> | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const isVerified = profileFormRecord?.isVerifiedByStaff || false;
  const placementStatus = (profileFormRecord as any)?.placementStatus || 'Not Placed';
  const placementVerified = (profileFormRecord as any)?.placementVerified || false;
  const [verifiedBannerDismissed, setVerifiedBannerDismissed] = useState(
    () => sessionStorage.getItem('_pm_verified_banner_dismissed') === '1'
  );
  const showVerifiedBanner = isVerified && !verifiedBannerDismissed;

  const loadProfile = (silent = false) => {
    if (!silent) setCheckingProfile(true);
    Promise.all([
      fetchStudentProfile(),
      fetchAcademicDetails().catch(() => ({ academic: {} })),
    ])
      .then(([profileRes, academicRes]) => {
        const merged: Partial<StudentProfileData> = { ...profileRes.profile, ...academicRes.academic };
        if (merged.name) {
          setProfileFormRecord(merged);
          setIsSetupComplete(true);
          if (merged.department && onDepartmentLoaded) onDepartmentLoaded(merged.department as string);
        } else if (!silent) {
          setIsSetupComplete(false);
        }
      })
      .catch(() => { if (!silent) setIsSetupComplete(false); })
      .finally(() => { if (!silent) setCheckingProfile(false); });
  };

  useEffect(() => {
    fetchResume().then(d => {
      const url = d?.resume?.resume_url || d?.resume_url || null;
      if (url) setResumeUrl(url);
    }).catch(() => {});
    loadProfile();

    const onVisible = () => { if (document.visibilityState === 'visible') loadProfile(true); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (profilePic) URL.revokeObjectURL(profilePic);
    };
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || resumeUploading) return;
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
    if (window.confirm('Are you sure you want to reset your profile? You will need to fill the setup form again.')) {
      sessionStorage.removeItem('studentWizardState');
      setProfileFormRecord(null);
      setIsSetupComplete(false);
      addToast('Profile reset.', 'info');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (profilePic) URL.revokeObjectURL(profilePic);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <SkeletonProfile />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6"><SkeletonCard /><SkeletonCard /></div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!isSetupComplete || !profileFormRecord) {
    return (
      <StudentProfileWizard
        initialEmail={user.email}
        initialName={user.fullName}
        initialRegsNumber={user.idNumber}
        initialPhone={profileFormRecord?.phone as string | undefined}
        onComplete={async (completedForm) => {
          setProfileFormRecord(completedForm as Partial<StudentProfileData>);
          setIsSetupComplete(true);
          try {
            await saveStudentProfile(completedForm);
            await saveAcademicDetails(completedForm);
          } catch (err: any) {
            addToast(err?.message || 'Failed to save profile. Please try again.', 'error');
          }
        }}
      />
    );
  }

  const pf = profileFormRecord || ({} as Partial<StudentProfileData>);
  const totalSemFieldsCount = (pf.sgpaSemesterValues || []).filter((v: any) => v !== '').length || 0;
  const _ug = (pf as any).ugCgpa;
  const _pg = (pf as any).pgCgpa;
  const _hasVal = (v: any) => v !== '' && v != null;
  const currentCgpa =
    pf.graduationStanding === 'PG'
      ? (_hasVal(_pg) ? _pg : _hasVal(_ug) ? _ug : '—')
      : (_hasVal(_ug) ? _ug : _hasVal(_pg) ? _pg : '—');

  const firstName = (pf.name as string)?.split(' ')[0] || user.fullName.split(' ')[0];
  const displayName = (pf.name as string) || user.fullName;
  const displayDept = (pf.department as string) || 'Student';

  const navItems = NAV_ITEMS(
    () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    onNavigateToBadges,
    onNavigateToPlacement,
    onNavigateToReport,
    handleResetProfile,
  );

  const SidebarContent = () => (
    <>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Brand */}
        <div className={`px-5 py-5 flex items-center gap-3 border-b border-white/10 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="h-9 w-9 rounded-xl bg-white overflow-hidden shrink-0 shadow-sm">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-white font-black text-base tracking-widest uppercase leading-none">Placemate</p>
              <p className="text-blue-300/60 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Student Portal</p>
            </div>
          )}
        </div>

        {/* User chip */}
        {!sidebarCollapsed && (
          <div className="mx-4 mt-4 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate leading-none">{displayName}</p>
              <p className="text-blue-300/60 text-[10px] font-semibold uppercase tracking-wider mt-0.5 truncate">{displayDept}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="px-3 mt-5 space-y-1">
          {!sidebarCollapsed && (
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-2">Navigation</p>
          )}
          {navItems.map(({ label, icon: Icon, onClick, active }) => (
            <button
              key={label}
              onClick={onClick}
              title={sidebarCollapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                sidebarCollapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={() => setIsSettingsOpen(true)}
          title={sidebarCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/8 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>
        <button
          onClick={onLogout}
          title={sidebarCollapsed ? 'Sign out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#002D62] flex flex-col transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-[#002D62] h-screen sticky top-0 shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-[68px]' : 'w-60'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(p => !p)}
          className="absolute -right-3 top-20 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:text-slate-800 transition-colors z-10"
        >
          <Menu className="h-3 w-3" />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-medium text-slate-400">{displayDept}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className={`text-[11px] font-semibold ${isVerified ? 'text-blue-600' : 'text-amber-500'}`}>
                  {isVerified ? 'Verified' : 'Pending verification'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <div className={`h-9 w-9 rounded-full overflow-hidden ring-2 ${isVerified ? 'ring-blue-400' : 'ring-amber-400'} bg-gradient-to-br from-[#002D62] to-blue-500 flex items-center justify-center text-white font-bold text-sm`}>
                {profilePic
                  ? <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                  : displayName.charAt(0).toUpperCase()
                }
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                {isVerified
                  ? <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                  : <Clock className="h-3.5 w-3.5 text-amber-500" />
                }
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-3.5 w-3.5 text-white" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
            {/* Mobile actions */}
            <div className="md:hidden flex items-center gap-1">
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <Settings className="h-4 w-4" />
              </button>
              <button onClick={onLogout} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-5 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">

          {/* Welcome banner */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">Good to see you, {firstName}!</h2>
            <p className="text-sm text-slate-500 mt-1">Track your placement journey, manage certificates, and monitor your readiness score.</p>
          </div>

          {/* Verification notification banner */}
          {showVerifiedBanner && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-800">Your profile has been verified!</p>
                  <p className="text-xs text-blue-600 mt-0.5">A placement officer has reviewed and approved your profile.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setVerifiedBannerDismissed(true);
                  sessionStorage.setItem('_pm_verified_banner_dismissed', '1');
                }}
                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-100 transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Profile card */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#002D62]" />
                  <h3 className="text-sm font-bold text-slate-800">Profile Details</h3>
                </div>
                <button onClick={() => setIsSettingsOpen(true)} className="text-xs font-semibold text-[#002D62] hover:text-orange-500 transition-colors">
                  Edit
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoTile label="Register Number" value={(pf.regsNumber as string) || ''} />
                <InfoTile label="Date of Birth" value={(pf.dob as string) || ''} />
                <InfoTile label="Email" value={(pf.email as string) || user.email} />
                <InfoTile label="Phone" value={(pf.phone as string) || ''} />
                <InfoTile label="LinkedIn" value={(pf.linkedinUrl as string) || 'Not linked'} span />
                <InfoTile
                  label="Current Term"
                  value={`${(pf.year as string) || 'N/A'} — ${pf.semesterTerm ? `${pf.semesterTerm} Semester` : 'N/A'}`}
                  span
                />
                {pf.address && (
                  <InfoTile
                    label="Address"
                    value={[pf.address, pf.district, pf.stateName, pf.pinCode ? `— ${pf.pinCode}` : ''].filter(Boolean).join(', ')}
                    span
                  />
                )}
              </div>
            </div>

            {/* Right column stats */}
            <div className="space-y-4">
              {/* Placement status */}
              <div className={`p-5 rounded-2xl border text-center relative overflow-hidden ${
                placementStatus === 'Placed'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="absolute -right-4 -bottom-4 opacity-[0.06]">
                  <CheckCircle className="w-32 h-32" />
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${placementStatus === 'Placed' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  Placement Status
                </p>
                <p className={`text-3xl font-black tracking-tight ${placementStatus === 'Placed' ? 'text-emerald-600' : 'text-orange-500'}`}>
                  {placementStatus === 'Placed' ? 'Placed' : 'Not Placed'}
                </p>
                {placementVerified && placementStatus === 'Placed' && (
                  <p className="text-[11px] text-slate-400 mt-2">Verified by placement officer</p>
                )}
              </div>

              {/* CGPA */}
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {pf.graduationStanding === 'PG' ? 'PG CGPA' : 'CGPA'}
                  </p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{currentCgpa || '—'}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>

              {/* Semesters */}
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Semesters Tracked</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">
                    {totalSemFieldsCount} <span className="text-lg font-semibold text-slate-300">/ 8</span>
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* SGPA grid */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-sm font-bold text-slate-800">Semester SGPA</h3>
              <span className="text-[11px] font-medium text-slate-400">Scale: 10.00</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {(pf.sgpaSemesterValues || Array(8).fill('')).map((score, i) => (
                <div key={i} className={`p-4 border rounded-xl text-center ${score ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Sem {i + 1}</span>
                  <span className="text-lg font-black text-[#002D62] mt-1 block">{score || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#002D62]" />
                <h3 className="text-sm font-bold text-slate-800">Resume</h3>
              </div>
              <div className="relative">
                {!resumeUrl && <span className="absolute -inset-1 rounded-lg bg-[#002D62] opacity-10 animate-ping" />}
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading}
                  className="relative flex items-center gap-2 px-4 py-2 bg-[#002D62] hover:bg-[#001e4d] text-white text-xs font-bold rounded-xl disabled:opacity-60 transition-all shadow-sm"
                >
                  {resumeUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {resumeUploading ? 'Uploading...' : resumeUrl ? 'Replace' : 'Upload PDF'}
                </button>
              </div>
              <input ref={resumeInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
            </div>
            {resumeError && <p className="text-xs text-red-500 font-medium mb-3">{resumeError}</p>}
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                <FileText className="h-4 w-4" /> View uploaded resume
              </a>
            ) : (
              <p className="text-sm text-slate-400">No resume uploaded yet. Upload a PDF to enable AI analysis.</p>
            )}
          </div>

        </main>
      </div>

      {/* Settings modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#002D62]" />
                <h2 className="text-base font-bold text-slate-800">Profile Settings</h2>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select a section to edit</p>
              {[
                { title: 'Basic & Contact Details', sub: 'Phone, address, LinkedIn, date of birth' },
                { title: 'Academic Records', sub: '10th, 12th, current semesters, SGPA' },
              ].map(({ title, sub }) => (
                <button
                  key={title}
                  onClick={() => { setIsSettingsOpen(false); setIsSetupComplete(false); }}
                  className="w-full text-left p-4 border border-slate-100 rounded-xl hover:border-[#002D62]/30 hover:bg-slate-50 transition-all group"
                >
                  <p className="text-sm font-bold text-slate-800 group-hover:text-[#002D62]">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </button>
              ))}
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                You will be taken to the profile wizard to update your details.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
