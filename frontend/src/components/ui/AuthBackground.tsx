import { type ReactNode } from 'react';
import campusImg from '../../assets/campus.jpg';
import collegeLogo from '../../assets/logo.jpg';
import { GraduationCap, BarChart2, ShieldCheck } from 'lucide-react';

interface AuthBackgroundProps {
  children: ReactNode;
  layout?: 'split' | 'centered';
  pattern?: 'none' | 'waves';
}

const features = [
  {
    icon: GraduationCap,
    title: 'Academic Tracking',
    desc: 'Monitor CGPA, SGPA, and academic milestones in one place.',
  },
  {
    icon: BarChart2,
    title: 'AI Readiness Score',
    desc: 'Get an AI-powered placement readiness score with actionable insights.',
  },
  {
    icon: ShieldCheck,
    title: 'Staff Verified',
    desc: 'Profiles and placements verified directly by placement officers.',
  },
];

const WavesSVG = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
    <svg className="absolute w-full h-full object-cover" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      {/* Primary wave series */}
      <path d="M-100 50 C 200 -50, 600 150, 1500 0" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
      <path d="M-100 100 C 300 0, 700 200, 1500 50" stroke="#94A3B8" strokeWidth="1" opacity="0.5" fill="none" />
      <path d="M-100 150 C 400 50, 800 250, 1500 100" stroke="#E2E8F0" strokeWidth="2" fill="none" />
      <path d="M-100 200 C 350 100, 750 300, 1500 150" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
      <path d="M-100 250 C 450 150, 850 350, 1500 200" stroke="#64748B" strokeWidth="1" opacity="0.4" fill="none" />
      <path d="M-100 300 C 300 200, 700 400, 1500 250" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
      <path d="M-100 350 C 500 250, 900 450, 1500 300" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
      <path d="M-100 400 C 400 300, 800 500, 1500 350" stroke="#94A3B8" strokeWidth="1" opacity="0.6" strokeDasharray="4 8" fill="none" />
      <path d="M-100 450 C 550 350, 950 550, 1500 400" stroke="#CBD5E1" strokeWidth="2" fill="none" />
      <path d="M-100 500 C 350 400, 750 600, 1500 450" stroke="#E2E8F0" strokeWidth="1" fill="none" />
      <path d="M-100 550 C 450 450, 850 650, 1500 500" stroke="#64748B" strokeWidth="1.5" opacity="0.3" fill="none" />
      <path d="M-100 600 C 300 500, 700 700, 1500 550" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
      <path d="M-100 650 C 500 550, 900 750, 1500 600" stroke="#E2E8F0" strokeWidth="2" fill="none" />
      <path d="M-100 700 C 400 600, 800 800, 1500 650" stroke="#CBD5E1" strokeWidth="1" opacity="0.7" fill="none" />
      <path d="M-100 750 C 550 650, 950 850, 1500 700" stroke="#94A3B8" strokeWidth="1.5" opacity="0.5" fill="none" />
      <path d="M-100 800 C 350 700, 750 900, 1500 750" stroke="#E2E8F0" strokeWidth="1" fill="none" />
      <path d="M-100 850 C 450 750, 850 950, 1500 800" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="8 4" fill="none" />
      <path d="M-100 900 C 300 800, 700 1000, 1500 850" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
      
      {/* Intersecting & crossing waves for density and dynamic texture */}
      <path d="M-100 80 C 500 280, 900 -70, 1500 230" stroke="#CBD5E1" strokeWidth="1.5" opacity="0.7" fill="none" />
      <path d="M-100 180 C 600 380, 1000 30, 1500 330" stroke="#94A3B8" strokeWidth="1" opacity="0.4" fill="none" />
      <path d="M-100 280 C 450 480, 850 130, 1500 430" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
      <path d="M-100 380 C 550 580, 950 230, 1500 530" stroke="#CBD5E1" strokeWidth="2" opacity="0.6" fill="none" />
      <path d="M-100 480 C 400 680, 800 330, 1500 630" stroke="#64748B" strokeWidth="1" opacity="0.3" strokeDasharray="5 5" fill="none" />
      <path d="M-100 580 C 650 780, 1050 430, 1500 730" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
      <path d="M-100 680 C 500 880, 900 530, 1500 830" stroke="#CBD5E1" strokeWidth="1" opacity="0.8" fill="none" />
      <path d="M-100 780 C 600 980, 1000 630, 1500 930" stroke="#94A3B8" strokeWidth="1.5" opacity="0.5" fill="none" />
    </svg>
  </div>
);

export default function AuthBackground({ children, layout = 'split', pattern = 'none' }: AuthBackgroundProps) {
  if (layout === 'centered') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-between font-sans antialiased bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden p-4 sm:p-6 transition-colors duration-300">
        {/* Background waves pattern */}
        {pattern === 'waves' && <WavesSVG />}

        {/* Top Spacer for vertical balance */}
        <div className="w-full h-2 sm:h-4" />

        {/* Main Content Area */}
        <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10 my-4 sm:my-8">
          {children}
        </div>

        {/* Footer */}
        <p className="relative z-10 text-slate-400 dark:text-slate-500 text-xs font-medium text-center py-4">
          © {new Date().getFullYear()} K.S.R. College of Engineering. All rights reserved.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex font-sans antialiased bg-slate-100 dark:bg-[#0F172A] transition-colors duration-300">

      {/* ── Left branded panel ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden">
        {/* Campus photo */}
        <img
          src={campusImg}
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001433]/95 via-[#002D62]/90 to-[#001433]/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white overflow-hidden shadow-lg shrink-0">
              <img src={collegeLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-widest uppercase leading-none">Placemate</p>
              <p className="text-blue-300/70 text-[10px] font-bold tracking-widest uppercase mt-0.5">K.S.R. College of Engineering</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-auto mb-12">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Your placement<br />
              <span className="text-orange-400">journey starts</span><br />
              here.
            </h1>
            <p className="mt-4 text-blue-200/80 text-sm font-medium leading-relaxed max-w-sm">
              Track academics, upload certificates, run AI analysis, and get placed — all from one unified platform.
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold leading-none">{title}</p>
                    <p className="text-blue-200/60 text-xs font-medium mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-blue-300/40 text-[11px] font-medium">
            © {new Date().getFullYear()} K.S.R. College of Engineering. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-10 min-h-screen relative overflow-hidden transition-colors duration-300 ${
        pattern === 'waves' ? 'bg-[#F8FAFC] dark:bg-[#0F172A]' : 'bg-white dark:bg-[#0F172A]'
      }`}>
        {/* Background waves pattern for right panel */}
        {pattern === 'waves' && <WavesSVG />}

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-[#002D62] overflow-hidden">
            <img src={collegeLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-[#002D62] dark:text-blue-400 font-black text-base tracking-widest uppercase">Placemate</p>
        </div>

        <div className="w-full max-w-[520px] relative z-10">
          {children}
        </div>

        <p className="lg:hidden mt-8 text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center relative z-10">
          © {new Date().getFullYear()} K.S.R. College of Engineering
        </p>
      </div>
    </div>
  );
}
