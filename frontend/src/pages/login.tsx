import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Send } from 'lucide-react';

type AuthView = 'login' | 'register';

export default function LoginPage() {
  const [view, setView] = useState<AuthView>('login');
  
  // Form Input States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleViewSwitch = (newView: AuthView) => {
    setView(newView);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setEmailError('');
    setPasswordError('');
    setShowPassword(false);
  };

  const handleEmailValidation = (val: string) => {
    setEmail(val);
    if (val.length === 0) {
      setEmailError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordValidation = (val: string) => {
    setPassword(val);
    if (val.length === 0) {
      setPasswordError('Password is required');
      return;
    }

    if (view === 'register') {
      if (val.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
      const hasLowercase = /[a-z]/.test(val);
      const hasUppercase = /[A-Z]/.test(val);
      const hasDigit = /[0-9]/.test(val);
      const hasSymbol = /[^A-Za-z0-9]/.test(val);

      if (!hasLowercase || !hasUppercase || !hasDigit || !hasSymbol) {
        setPasswordError('Must contain lowercase, uppercase, digits, and symbols');
        return;
      }
    } else {
      if (val.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
    }
    setPasswordError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || emailError || passwordError) return;
    console.log('Authenticating...', { email, view, firstName, lastName });
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center font-sans antialiased selection:bg-[#002D62]/10 selection:text-[#002D62] overflow-hidden">
      
      {/* Wave Animation Styles */}
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave { animation: wave 15s linear infinite; }
        .animate-wave-slow { animation: wave 25s linear infinite; }
      `}</style>
      
      <div className="w-full h-full flex flex-col md:flex-row relative z-10 p-3 md:p-4 gap-4 box-border">
        
        {/* LEFT PANEL: Campus Image (45% Width) */}
        <div className="hidden md:block w-[45%] h-full shrink-0 relative group">
          <div className="w-full h-full rounded-[24px] overflow-hidden relative shadow-sm border border-slate-100">
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/5"></div>
            
            
            
          </div>
        </div>

        {/* RIGHT PANEL: Form column occupying 55% width */}
        <div className="w-full md:w-[55%] flex flex-col justify-between items-center px-6 sm:px-12 lg:px-16 py-6 h-full overflow-y-auto relative bg-slate-50">
          
          {/* Animated Waves Background */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute bottom-0 left-0 w-[200%] h-48 animate-wave opacity-[0.07]">
              <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                <path fill="#002D62" d="M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,181.3C672,181,768,139,864,122.7C960,107,1056,117,1152,149.3C1248,181,1344,235,1392,261.3L1440,288L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-[200%] h-56 animate-wave-slow opacity-[0.05]">
              <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                <path fill="#002D62" d="M0,192L48,202.7C96,213,192,235,288,224C384,213,480,171,576,160C672,149,768,171,864,181.3C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
              </svg>
            </div>
          </div>

          {/* Form Card Wrapper */}
          <div className="w-full max-w-[480px] mx-auto my-auto flex flex-col items-center text-center p-8 sm:p-10 rounded-[28px] bg-white/95 backdrop-blur-md border border-white shadow-[0_15px_50px_rgba(0,0,0,0.03)] z-10 relative">
            
            {/* Identity Logo & Branding */}
            <div className="flex flex-col items-center space-y-3">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm ring-4 ring-slate-100 overflow-hidden">
                <img 
                  src="/logo.jpg" 
                  alt="K.S.R. College of Engineering Logo" 
                  className="w-full h-full object-contain rounded-full select-none"
                  onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + '/src/assets/logo.jpg') {
                      e.currentTarget.src = '/src/assets/logo.jpg';
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#002D62] tracking-wider uppercase leading-none">
                  Placemate
                </h2>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  Student Placement Tracker
                </p>
                <p className="text-[11px] font-medium text-slate-400 italic">
                  Track. Apply. Achieve.
                </p>
              </div>
            </div>

            {/* Title Section */}
            <div className="w-full flex flex-col items-center space-y-1 pt-4">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {view === 'login' ? 'Welcome Back!' : 'Get Started!'}
              </h1>
              <p className="text-[13px] text-slate-500 font-medium">
                {view === 'login' ? 'Login to your account' : 'Create your tracking account'}
              </p>
              <div className="w-12 h-[2.5px] bg-gradient-to-r from-[#002D62] to-blue-500 rounded-full mt-2"></div>
            </div>

            {/* Interactive Form Fields */}
            <form onSubmit={handleSubmit} className="w-full text-left space-y-4 pt-5">
              
              {/* Conditional Name Inputs */}
              {view === 'register' && (
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase px-0.5">First Name</label>
                    <input 
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full px-4 py-3 rounded-xl text-slate-800 text-[13px] bg-white border border-slate-200 focus:border-[#002D62] focus:ring-4 focus:ring-[#002D62]/5 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase px-0.5">Last Name</label>
                    <input 
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-4 py-3 rounded-xl text-slate-800 text-[13px] bg-white border border-slate-200 focus:border-[#002D62] focus:ring-4 focus:ring-[#002D62]/5 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase px-0.5">Email ID</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#002D62] transition-colors">
                    <Mail className="h-[16px] w-[16px]" />
                  </span>
                  <input 
                    type="text"
                    value={email}
                    onChange={(e) => handleEmailValidation(e.target.value)}
                    onBlur={(e) => handleEmailValidation(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-slate-800 text-[13px] bg-white border shadow-sm outline-none transition-all duration-200 ${
                      emailError 
                        ? 'border-red-400 focus:ring-4 focus:ring-red-500/5 focus:border-red-500' 
                        : 'border-slate-200 focus:border-[#002D62] focus:ring-4 focus:ring-[#002D62]/5'
                    }`}
                  />
                </div>
                {emailError && (
                  <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase px-0.5">Password</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#002D62] transition-colors">
                    <Lock className="h-[16px] w-[16px]" />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordValidation(e.target.value)}
                    onBlur={(e) => handlePasswordValidation(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-11 py-3 rounded-xl text-slate-800 text-[13px] bg-white border shadow-sm outline-none transition-all duration-200 ${
                      passwordError 
                        ? 'border-red-400 focus:ring-4 focus:ring-red-500/5 focus:border-red-500' 
                        : 'border-slate-200 focus:border-[#002D62] focus:ring-4 focus:ring-[#002D62]/5'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5 text-left leading-tight">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              {/* Checkbox / Footer Block */}
              <div className="flex items-start gap-2.5 pt-1 text-[13px] leading-relaxed text-slate-600 font-medium">
                {view === 'login' ? (
                  <div className="w-full flex items-center justify-between text-[12px] font-semibold">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="remember" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 border-slate-300 text-[#002D62] focus:ring-0 accent-[#002D62] cursor-pointer rounded transition-all duration-200"
                      />
                      <label htmlFor="remember" className="text-slate-400 hover:text-slate-600 cursor-pointer select-none">Remember Me</label>
                    </div>
                    <a href="#forgot" className="text-[#002D62] hover:underline">Forgot Password?</a>
                  </div>
                ) : (
                  <>
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 border-slate-300 text-[#002D62] focus:ring-0 accent-[#002D62] cursor-pointer rounded transition-all duration-200"
                      required
                    />
                    <label htmlFor="terms" className="cursor-pointer select-none text-left">
                      By clicking submit, I agree to the{' '}
                      <a href="#terms" className="text-[#002D62] font-bold hover:underline">terms & conditions</a> and{' '}
                      <a href="#privacy" className="text-[#002D62] font-bold hover:underline">privacy policy</a> and give my consent to receive updates through SMS/Email.
                    </label>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-3 py-3.5 px-4 bg-[#002D62] hover:bg-[#052349] text-white font-bold text-[15px] rounded-xl transition-all duration-200 tracking-wider shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {view === 'login' ? (
                  <span>Login</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </form>

            {/* Switch View */}
            <div className="text-[12px] font-medium text-slate-400 pt-5">
              {view === 'login' ? (
                <>
                  New User?{' '}
                  <button 
                    type="button" 
                    onClick={() => handleViewSwitch('register')} 
                    className="text-[#002D62] font-black hover:underline"
                  >
                    Register Here!
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button 
                    type="button" 
                    onClick={() => handleViewSwitch('login')} 
                    className="text-[#002D62] font-black hover:underline"
                  >
                    Login Here!
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="text-[11px] font-medium text-slate-400 z-10 hidden sm:block relative">
            © {new Date().getFullYear()} K.S.R. College of Engineering. All rights reserved.
          </div>

        </div>
      </div>
    </div>
  );
}