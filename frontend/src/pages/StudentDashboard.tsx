import { useState } from 'react';
import { LogOut, LayoutDashboard, User, Briefcase, CheckCircle2, RotateCcw, Award } from 'lucide-react';
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
  onNavigateToBadges: () => void; // New prop wired to handle sub-navigation
}

export default function StudentDashboard({ user, onLogout, onNavigateToBadges }: StudentDashboardProps) {
  // 1. STRICT GUARD STATE: Forcefully defaults to false so the wizard MUST show first
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  
  // Storage for the wizard form data fields
  const [profileFormRecord, setProfileFormRecord] = useState<StudentProfileData | null>(null);

  // 2. RESET HANDLER: Clears form data and kicks the user back to the multi-step wizard pipeline
  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to reset your profile details? You will have to fill out the setup form again.")) {
      setProfileFormRecord(null);
      setIsSetupComplete(false);
    }
  };

  // 3. FORCE INTERCEPT: If the setup flag is false, show the wizard. No bypass allowed.
  if (!isSetupComplete || !profileFormRecord) {
    return (
      <StudentProfileWizard 
        initialEmail={user.email} 
        onComplete={(completedForm) => {
          setProfileFormRecord(completedForm);
          setIsSetupComplete(true); // Flips the gate to open the dashboard view
        }} 
      />
    );
  }

  // Calculate dynamic metrics from the filled semester matrix data
  const totalSemFieldsCount = profileFormRecord.sgpaSemesterValues.filter(v => v !== '').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      
      {/* Side Navigation Bar */}
      <aside className="w-64 bg-[#002D62] text-white flex flex-col p-5 justify-between shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div>
            <h1 className="text-xl font-black tracking-wider uppercase">Placemate</h1>
            <p className="text-[10px] font-bold text-slate-300/60 tracking-widest uppercase mt-0.5">Student Workstation</p>
          </div>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-[13px] font-bold tracking-wide transition-all">
              <LayoutDashboard className="h-4 w-4 stroke-[2.5]" />
              <span>Overview Dashboard</span>
            </button>

            {/* NEW: Navigation trigger targeting the Badges & Certificates view component page */}
            <button 
              onClick={onNavigateToBadges}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all mt-1"
            >
              <Award className="h-4 w-4 text-amber-400 stroke-[2.5]" />
              <span>Badges & Certificates</span>
            </button>

            {/* Reset Details Option inside Sidebar */}
            <button 
              onClick={handleResetProfile}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-[13px] font-bold tracking-wide transition-all mt-1"
            >
              <RotateCcw className="h-4 w-4 text-orange-400 stroke-[2.5]" />
              <span>Reset Profile Data</span>
            </button>
          </nav>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-[13px] font-bold tracking-wide transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-4 w-4 stroke-[2.5]" />
          <span>Logout Account</span>
        </button>
      </aside>

      {/* Main Panel Content Window */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between md:justify-end gap-4">
          <div className="md:hidden flex items-center gap-2">
            <h1 className="text-lg font-black text-[#002D62] uppercase tracking-wider">Placemate</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile View: Badges Navigation Shortcut */}
            <button 
              onClick={onNavigateToBadges} 
              className="md:hidden p-2 text-slate-400 hover:text-amber-500"
              title="View Badges & Certificates"
            >
              <Award className="h-4 w-4" />
            </button>

            {/* Mobile Reset Action View Shortcut button */}
            <button 
              onClick={handleResetProfile} 
              className="md:hidden p-2 text-slate-400 hover:text-orange-500"
              title="Reset Profile Setup"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <div className="text-right">
              <p className="text-[13px] font-bold text-slate-800 leading-none">{profileFormRecord.name || user.fullName}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{profileFormRecord.department || 'Student Profile'}</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-[14px]">
              {(profileFormRecord.name || user.fullName).charAt(0).toUpperCase()}
            </div>
            <button onClick={onLogout} className="md:hidden p-2 text-slate-400 hover:text-red-500">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Welcome Intro Section */}
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome to your Dashboard, {profileFormRecord.name || user.fullName}!</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-0.5">Keep track of your pending campus application metrics and profile status updates.</p>
            </div>
            <div className="w-16 h-[3px] sm:w-[3px] sm:h-12 bg-orange-500 rounded-full shrink-0"></div>
          </div>

          {/* Core Profile Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                <User className="h-4 w-4 text-[#002D62]" />
                <h3 className="text-[13px] font-bold text-[#002D62] tracking-wider uppercase">Verified Profile Credentials</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Register Number</p>
                  <p className="font-bold text-slate-800 mt-1">{profileFormRecord.regsNumber || 'Not provided'}</p>
                </div>
                <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Official Email Address</p>
                  <p className="font-bold text-slate-800 mt-1 break-all">{profileFormRecord.email}</p>
                </div>
                <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mobile Phone Contact</p>
                  <p className="font-bold text-slate-800 mt-1">{profileFormRecord.phone || 'Not provided'}</p>
                </div>
                <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Setup Tracking Year</p>
                  <p className="font-bold text-[#002D62] mt-1 uppercase">{profileFormRecord.year || 'Not configured'}</p>
                </div>
                <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Permanent Home Address</p>
                  <p className="font-bold text-slate-600 mt-1">
                    {profileFormRecord.address}, {profileFormRecord.district}, {profileFormRecord.stateName} — {profileFormRecord.pinCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="space-y-4">
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Active Track Semesters</p>
                  <p className="text-2xl font-black text-slate-800 mt-0.5">{totalSemFieldsCount} / 8</p>
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Eligibility Basis</p>
                  <p className="text-sm font-black text-emerald-600 mt-0.5">
                    {profileFormRecord.graduationStanding === 'PG' ? `UG CGPA: ${profileFormRecord.ugCgpa}` : `10th: ${profileFormRecord.tenthPercentage}%`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Semester Cards Matrix view layout layout */}
          <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Historical Semester Matrix Scores</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {profileFormRecord.sgpaSemesterValues.map((score, i) => (
                <div key={i} className={`p-3 border rounded-xl text-center transition-all ${score ? 'bg-blue-50/20 border-blue-100' : 'bg-slate-50/40 border-slate-100/60 opacity-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sem {i + 1}</span>
                  <span className="text-sm font-bold text-[#002D62] mt-0.5 block">{score || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}