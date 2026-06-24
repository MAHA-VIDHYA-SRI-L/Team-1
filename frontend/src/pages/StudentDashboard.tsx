import React from 'react';
import { LogOut, LayoutDashboard, User, Briefcase, CheckCircle2 } from 'lucide-react';

interface StudentDashboardProps {
  user: {
    fullName: string;
    email: string;
    idNumber?: string;
    contactNo?: string;
  };
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
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
          <div className="md:hidden">
            <h1 className="text-lg font-black text-[#002D62] uppercase tracking-wider">Placemate</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[13px] font-bold text-slate-800 leading-none">{user.fullName}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Student Profile</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-[14px]">
              {user.fullName.charAt(0).toUpperCase()}
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
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome to your Dashboard, {user.fullName}!</h2>
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
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Roll Number / ID</p>
                  <p className="font-bold text-slate-800 mt-1">{user.idNumber || 'Not provided'}</p>
                </div>
                <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Official Email Address</p>
                  <p className="font-bold text-slate-800 mt-1 break-all">{user.email}</p>
                </div>
                <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mobile Contact Channel</p>
                  <p className="font-bold text-slate-800 mt-1">{user.contactNo || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="space-y-4">
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Applied Drives</p>
                  <p className="text-2xl font-black text-slate-800 mt-0.5">0</p>
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Eligibility Status</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">Eligible</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}