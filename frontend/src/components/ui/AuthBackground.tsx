import { type ReactNode } from 'react';
import campusImg from '../../assets/campus.jpg';
import collegeLogo from '../../assets/logo.jpg';
import { GraduationCap, BarChart2, ShieldCheck } from 'lucide-react';

interface AuthBackgroundProps {
  children: ReactNode;
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

export default function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="min-h-screen w-full flex font-sans antialiased bg-slate-100">

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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-[#002D62] overflow-hidden">
            <img src={collegeLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-[#002D62] font-black text-base tracking-widest uppercase">Placemate</p>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>

        <p className="lg:hidden mt-8 text-[11px] text-slate-400 font-medium text-center">
          © {new Date().getFullYear()} K.S.R. College of Engineering
        </p>
      </div>

    </div>
  );
}
