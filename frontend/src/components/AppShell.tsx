import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Award, CheckCircle, FileBarChart,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import logoUrl from '../assets/logo.jpg';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  active?: boolean;
  onClick: () => void;
}

interface AppShellProps {
  /** Page title shown in the topbar */
  pageTitle: string;
  pageSubtitle?: string;
  /** Right-side topbar actions */
  topbarActions?: ReactNode;
  /** Main content */
  children: ReactNode;
  /** Active nav key */
  activePage: 'dashboard' | 'badges' | 'placement' | 'report';
  onNavigateToDashboard: () => void;
  onNavigateToBadges: () => void;
  onNavigateToPlacement: () => void;
  onNavigateToReport: () => void;
  onLogout: () => void;
  onOpenSettings?: () => void;
  userFullName: string;
  userDept?: string;
  isVerified?: boolean;
}

export default function AppShell({
  pageTitle,
  pageSubtitle,
  topbarActions,
  children,
  activePage,
  onNavigateToDashboard,
  onNavigateToBadges,
  onNavigateToPlacement,
  onNavigateToReport,
  onLogout,
  onOpenSettings,
  userFullName,
  userDept,
  isVerified,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-white',
      active: activePage === 'dashboard',
      onClick: onNavigateToDashboard,
    },
    {
      label: 'Badges & Certificates',
      icon: Award,
      iconColor: 'text-amber-400',
      active: activePage === 'badges',
      onClick: onNavigateToBadges,
    },
    {
      label: 'Placement Readiness',
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      active: activePage === 'placement',
      onClick: onNavigateToPlacement,
    },
    {
      label: 'Formal Report',
      icon: FileBarChart,
      iconColor: 'text-sky-400',
      active: activePage === 'report',
      onClick: onNavigateToReport,
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
          <img src={logoUrl} alt="Placemate" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-[15px] font-black tracking-widest uppercase text-white leading-none">Placemate</p>
            <p className="text-[9px] font-bold text-blue-300/70 tracking-widest uppercase mt-0.5">Student Portal</p>
          </div>
        )}
      </div>

      {/* User chip */}
      {!collapsed && (
        <div className="mx-4 mt-4 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0">
            {userFullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-black text-white truncate leading-none">{userFullName}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">{userDept || 'Student'}</p>
          </div>
          {isVerified !== undefined && (
            <span className={`ml-auto shrink-0 w-2 h-2 rounded-full ${isVerified ? 'bg-emerald-400' : 'bg-amber-400'}`} title={isVerified ? 'Verified' : 'Pending'} />
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 mt-5 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-2 mb-2">Navigation</p>
        )}
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => { item.onClick(); setMobileOpen(false); }}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all group relative ${
              item.active
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            {item.active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-full" />
            )}
            <item.icon className={`h-4 w-4 shrink-0 stroke-[2.5] ${item.active ? 'text-white' : item.iconColor}`} />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-white/40" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10 space-y-1">
        {onOpenSettings && (
          <button
            onClick={() => { onOpenSettings(); setMobileOpen(false); }}
            title={collapsed ? 'Settings' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <Settings className="h-4 w-4 shrink-0 stroke-[2.5] transition-transform group-hover:rotate-90" />
            {!collapsed && <span>Settings</span>}
          </button>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4 shrink-0 stroke-[2.5]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex font-sans text-slate-800 dark:text-slate-100 transition-colors">

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col bg-[#001e4d] dark:bg-[#090D16] border-r border-transparent dark:border-slate-800/80 shrink-0 h-screen sticky top-0 shadow-xl transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-60'}`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(p => !p)}
          className="absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md text-slate-500 dark:text-slate-400 hover:text-[#001e4d] dark:hover:text-white transition-colors z-10"
        >
          <Menu className="h-3.5 w-3.5" />
        </button>
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#001e4d] dark:bg-[#090D16] flex flex-col shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Topbar */}
        <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-[15px] font-black text-slate-800 dark:text-slate-100 leading-none">{pageTitle}</h1>
              {pageSubtitle && (
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mt-0.5">{pageSubtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="button" />
            {topbarActions && <div className="flex items-center gap-2">{topbarActions}</div>}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
