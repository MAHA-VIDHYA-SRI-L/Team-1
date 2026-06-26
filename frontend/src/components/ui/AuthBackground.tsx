import { useState, type ReactNode } from 'react';

interface AuthBackgroundProps {
  children: ReactNode;
}

export default function AuthBackground({ children }: AuthBackgroundProps) {
  const [imageSrc, setImageSrc] = useState('/campus.jpg');
  const [imgFallbackFailed, setImgFallbackFailed] = useState(false);

  // Generate 40 lines evenly distributed down the viewport height (900px canvas)
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
      duration: `${16 + (i % 5) * 3}s`,
      delay: `${i * -0.7}s`,
      opacity: i % 2 === 0 ? '0.06' : '0.10'
    };
  });

  const handleImageError = () => {
    if (!imgFallbackFailed) {
      setImgFallbackFailed(true);
      setImageSrc('/src/assets/campus.jpg');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-50 to-[#002D62]/5 flex items-center justify-center font-sans antialiased selection:bg-[#002D62]/10 selection:text-[#002D62] overflow-x-hidden relative">
      
      {/* Dynamic Keyframe Injection for the gentle drifting movement */}
      <style>{`
        @keyframes subtleWave {
          0%, 100% { transform: translateY(0px) scaleY(1); }
          50% { transform: translateY(-14px) scaleY(1.02); }
        }
        .topo-wave-line { 
          animation: subtleWave ease-in-out infinite; 
          transform-origin: center center;
        }
      `}</style>

      {/* Decorative Ambient Radial Glow behind the central content zone */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#002D62]/5 to-transparent rounded-full blur-[140px] pointer-events-none z-0"></div>
      
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
              strokeWidth="0.75" 
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
      <div className="w-full min-h-screen flex flex-col md:flex-row relative z-10 p-3 md:p-5 gap-5 box-border bg-transparent">
        
        {/* LEFT PANEL: Campus Card with richer framing lines and defined glass effects */}
        <div className="hidden md:block w-[45%] lg:w-[40%] relative shrink-0">
          <div className="sticky top-5 h-[calc(100vh-40px)] rounded-[24px] overflow-hidden bg-white/40 backdrop-blur-[6px] p-2 border border-white/80 shadow-[0_12px_40px_rgba(0,45,98,0.04)]">
            <div className="w-full h-full rounded-[18px] overflow-hidden relative shadow-inner group">
              <img 
                src={imageSrc} 
                alt="Institutional Campus Hub" 
                className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
                onError={handleImageError}
              />
              {/* Complex overlay tint for adding visual weight to the image border frame */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-black/5"></div>
              
              {/* Floating Identity Watermark for added corporate authority */}
              <div className="absolute top-6 left-6 flex items-center gap-2.5 bg-slate-950/30 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-white">
                <div className="h-5 w-5 rounded-md bg-orange-500 flex items-center justify-center font-black text-white text-[10px]">P</div>
                <span className="text-[11px] font-black tracking-widest uppercase">PLACEMATE PLATFORM</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Pure translucent lane passing lines cleanly across viewport */}
        <div className="w-full md:flex-1 flex flex-col justify-between items-center px-4 sm:px-12 lg:px-16 py-6 min-h-[calc(100vh-40px)] relative bg-transparent">
          
          <div className="hidden md:block h-2"></div>

          {/* Central Interactive Content Display (Forms Injected Here) */}
          <div className="w-full max-w-md my-auto relative z-10">
            {children}
          </div>

          {/* Footer Copyright Text Frame */}
          <div className="text-[11px] font-bold text-slate-400 tracking-wider z-10 hidden sm:block relative pt-6 select-none uppercase font-mono">
            © {new Date().getFullYear()} K.S.R. College of Engineering. All rights reserved.
          </div>

        </div>
      </div>
    </div>
  );
}