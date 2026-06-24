import type { ReactNode } from 'react';

interface AuthBackgroundProps {
  children: ReactNode;
}

export default function AuthBackground({ children }: AuthBackgroundProps) {
  // Generate 20 lines evenly distributed down the viewport height (900px canvas)
  const totalLines = 40;
  const lines = Array.from({ length: totalLines }, (_, i) => {
    const baseHeight = (900 / (totalLines + 1)) * (i + 1);
    const offsetA = i % 2 === 0 ? 80 : -80;
    const offsetB = i % 3 === 0 ? 120 : -60;
    const offsetC = i % 4 === 0 ? -90 : 70;
    
    return {
      id: i,
      path: `M -50,${baseHeight} 
             C 300,${baseHeight + offsetA} 
               550,${baseHeight + offsetB} 
               900,${baseHeight + offsetC} 
             C 1150,${baseHeight - offsetA} 
               1300,${baseHeight + offsetB} 
               1500,${baseHeight}`,
      duration: `${16 + (i % 5) * 3}s`, // Smooth out animation speed slightly
      delay: `${i * -0.7}s`,
      opacity: i % 2 === 0 ? '0.07' : '0.11' // Enhanced opacity values so they don't look washed out
    };
  });

  return (
    // Replaced flat bg-slate-50 with a premium radial gradient depth mesh
    <div className="h-screen w-screen bg-gradient-to-br from-slate-100 via-slate-50 to-[#002D62]/5 flex items-center justify-center font-sans antialiased selection:bg-[#002D62]/10 selection:text-[#002D62] overflow-hidden relative">
      
      {/* Dynamic Keyframe Injection for the gentle drifting movement */}
      <style>{`
        @keyframes subtleWave {
          0%, 100% { transform: translateY(0px) scaleY(1); }
          50% { transform: translateY(-16px) scaleY(1.03); }
        }
        .topo-wave-line { 
          animation: subtleWave ease-in-out infinite; 
          transform-origin: center center;
        }
      `}</style>

      {/* Decorative Ambient Radial Glow behind the central content zone to remove dullness */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#002D62]/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Full-Screen Vector Topographic Wave Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 bg-transparent">
        <svg 
          className="w-full h-full text-[#002D62]" 
          viewBox="0 0 1440 900" 
          preserveAspectRatio="none" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {lines.map((line) => (
            <path 
              key={line.id}
              className="topo-wave-line" 
              opacity={line.opacity}
              stroke="currentColor" 
              strokeWidth="0.75" // Enhanced stroke thickness for better crisp clarity
              d={line.path}
              style={{
                animationDuration: line.duration,
                animationDelay: line.delay
              }}
            />
          ))}
        </svg>
      </div>

      {/* Main Layout Grid Container */}
      <div className="w-full h-full flex flex-col md:flex-row relative z-10 p-3 md:p-5 gap-5 box-border bg-transparent">
        
        {/* LEFT PANEL: Campus Card with richer framing lines and defined glass effects */}
        <div className="hidden md:block w-[45%] h-full shrink-0 relative">
          <div className="w-full h-full rounded-[24px] overflow-hidden relative bg-white/40 backdrop-blur-[4px] p-2 border border-white/80 shadow-[0_12px_40px_rgba(0,45,98,0.05)]">
            <div className="w-full h-full rounded-[18px] overflow-hidden relative shadow-inner">
              <img 
                src="/campus.jpg" 
                alt="Institutional Campus Hub" 
                className="w-full h-full object-cover select-none"
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + '/src/assets/campus.jpg') {
                    e.currentTarget.src = '/src/assets/campus.jpg';
                  }
                }}
              />
              {/* Complex overlay tint for adding visual weight to the image border frame */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-black/5"></div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Pure translucent lane passing lines cleanly across viewport */}
        <div className="w-full md:w-[55%] flex flex-col justify-between items-center px-4 sm:px-12 lg:px-16 py-6 h-full overflow-y-auto relative bg-transparent">
          
          <div className="hidden md:block h-2"></div>

          {/* Central Interactive Content Display (Forms Injected Here) */}
          {children}

          {/* Footer Copyright Text Frame */}
          <div className="text-[11px] font-semibold text-slate-400 tracking-wide z-10 hidden sm:block relative pt-4 select-none">
            © {new Date().getFullYear()} K.S.R. College of Engineering. All rights reserved.
          </div>

        </div>
      </div>
    </div>
  );
}