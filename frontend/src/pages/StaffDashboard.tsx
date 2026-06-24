import React from 'react';
import { LogOut, Shield, Users, Building2, FileBarChart, Layers } from 'lucide-react';

interface StaffDashboardProps {
  user: {
    fullName: string;
    email: string;
    idNumber?: string;
  };
  onLogout: () => void;
}

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Side Navigation Bar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-5 justify-between shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div>
            <h1 className="text-xl font-black text-orange-500 tracking-wider uppercase">Placemate</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Staff & Corporate Portal</p>
          </div>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-[13px] font-bold tracking-wide transition-all text-orange-400">
              <Layers className="h-4 w-4 stroke-[2.5]" />
              <span>Admin Console</span>
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
            <h1 className="text-lg font-black text-orange-600 uppercase tracking-wider">Placemate</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[13px] font-bold text-slate-800 leading-none">{user.fullName}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Faculty Administrator</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[14px]">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <button onClick={onLogout} className="md:hidden p-2 text-slate-400 hover:text-red-500">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Admin Banner Setup */}
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Administrative Console</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-0.5">Logged in as: <span className="text-slate-700 font-bold">{user.email}</span> ({user.idNumber || 'Staff Member'})</p>
            </div>
            <div className="w-12 h-[2.5px] sm:w-[2.5px] sm:h-12 bg-orange-500 rounded-full shrink-0"></div>
          </div>

          {/* Quick Metrics Tracking Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Students</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">---</p>
              </div>
            </div>
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building2 className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Drives</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">---</p>
              </div>
            </div>
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileBarChart className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Placed Ratio</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">0%</p>
              </div>
            </div>
          </div>

          {/* Controls Placeholder */}
          <div className="p-8 bg-white border border-slate-100 rounded-[24px] shadow-sm text-center py-12">
            <Shield className="h-10 w-10 text-orange-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Operational Module Pending Connection</h3>
            <p className="text-[13px] text-slate-400 max-w-sm mx-auto mt-1">This engine grants authorization to process student audit indices and corporate verification queues.</p>
          </div>
        </main>
      </div>
    </div>
  );
}