import { type ReactNode } from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import logoUrl from '../assets/logo.jpg';

interface StaffShellProps {
  pageTitle: string;
  pageSubtitle?: string;
  topbarActions?: ReactNode;
  children: ReactNode;
  userFullName: string;
  onLogout?: () => void;
  onBack?: () => void;
}

export default function StaffShell({
  pageTitle,
  pageSubtitle,
  topbarActions,
  children,
  userFullName,
  onLogout,
  onBack,
}: StaffShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">

      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
              <img src={logoUrl} alt="Placemate" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[14px] font-black text-[#001e4d] leading-none">{pageTitle}</p>
              {pageSubtitle && (
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{pageSubtitle}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {topbarActions && <div className="flex items-center gap-2">{topbarActions}</div>}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="h-8 w-8 rounded-xl bg-[#001e4d] text-white font-black text-xs flex items-center justify-center shrink-0">
              {userFullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-[12px] font-bold text-slate-800 leading-none">{userFullName}</p>
              <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider mt-0.5">Placement Officer</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 border border-red-100 bg-red-50/50 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
