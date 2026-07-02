import { type ReactNode } from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import logoUrl from '../assets/logo.jpg';
import { ThemeToggle } from './ThemeToggle';

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors">

      {/* Topbar */}
      <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shrink-0">
              <img src={logoUrl} alt="Placemate" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[14px] font-black text-[#001e4d] dark:text-white leading-none">{pageTitle}</p>
              {pageSubtitle && (
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{pageSubtitle}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle variant="button" />
          {topbarActions && <div className="flex items-center gap-2">{topbarActions}</div>}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="h-8 w-8 rounded-xl bg-[#001e4d] dark:bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              {userFullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-none">{userFullName}</p>
              <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider mt-0.5">Placement Officer</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all"
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
