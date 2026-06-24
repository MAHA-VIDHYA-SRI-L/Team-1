import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthBackground from '../components/ui/AuthBackground';
import collegeLogo from '../assets/logo.jpg';

interface UserData {
  fullName: string;
  email: string;
  idNumber?: string;
  contactNo?: string;
}

interface LoginProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (role: 'student' | 'staff', user: UserData) => void;
}

export default function Login({ onNavigateToRegister, onLoginSuccess }: LoginProps) {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // --- ERROR STATES ---
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // --- AUTO-HIDE TOAST EFFECT ---
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // --- VALIDATION HANDLERS ---
  const handleEmailValidation = (val: string) => {
    setEmail(val);
    if (val.length === 0) {
      setEmailError('Email ID is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email address');
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
    if (val.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
    } else {
      setPasswordError('');
    }
  };

  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- FORM SUBMIT HANDLING ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    handleEmailValidation(email);
    handlePasswordValidation(password);

    if (!email.trim() || !password.trim() || emailError || passwordError) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoginError(result.error || 'Login failed');
        return;
      }

      setShowToast(true);
      setTimeout(() => onLoginSuccess(result.role, result.user), 1000);
    } catch {
      setLoginError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      {/* SUCCESS TOAST POPUP */}
      <div 
        className={`fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white font-semibold text-[13px] px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.3)] border border-emerald-400/20 transition-all duration-300 transform ${
          showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 stroke-[2.5]" />
        <span>Login Successful</span>
      </div>

      {/* Central Login White Interactive Card */}
      <div className="w-full max-w-[480px] mx-auto my-auto flex flex-col items-center text-center p-8 sm:p-10 rounded-[28px] bg-white border border-slate-100 shadow-[0_15px_50px_rgba(0,0,0,0.02)] relative">
        
        {/* Branding Logo Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm ring-4 ring-slate-100 overflow-hidden">
            <img 
              src={collegeLogo} 
              alt="College Logo" 
              className="w-full h-full object-contain rounded-full select-none"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-[#002D62] tracking-wider uppercase leading-none">Placemate</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Student Placement Tracker</p>
            <p className="text-[11px] italic text-slate-400 font-medium pt-1">Track. Apply. Achieve.</p>
          </div>
        </div>

        {/* Welcome Messaging with Central Orange Accent Line */}
        <div className="w-full flex flex-col items-center space-y-1 pt-5">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back!</h1>
          <p className="text-[13px] text-slate-500 font-medium">Login to your account</p>
          <div className="w-12 h-[2.5px] bg-orange-500 rounded-full mt-2"></div>
        </div>

        {/* Input Interactive Form Elements */}
        <form onSubmit={handleSubmit} className="w-full text-left space-y-4 pt-5">
          
          {/* Email ID Field */}
          <div className="space-y-1.5">
            <label htmlFor="email-input" className="text-[11px] font-bold text-[#002D62] tracking-wide uppercase px-0.5">
              Email ID
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Mail className="h-[16px] w-[16px]" />
              </span>
              <input 
                id="email-input"
                name="email"
                type="text" 
                value={email} 
                onChange={(e) => handleEmailValidation(e.target.value)}
                onBlur={(e) => handleEmailValidation(e.target.value)}
                placeholder="name@example.com" 
                className={`w-full pl-11 pr-4 py-3 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] outline-none transition-all ${
                  emailError 
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/5' 
                    : 'border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
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

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="password-input" className="text-[11px] font-bold text-[#002D62] tracking-wide uppercase px-0.5">
              Password
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Lock className="h-[16px] w-[16px]" />
              </span>
              <input 
                id="password-input"
                name="password"
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => handlePasswordValidation(e.target.value)}
                onBlur={(e) => handlePasswordValidation(e.target.value)}
                placeholder="••••••••" 
                className={`w-full pl-11 pr-11 py-3 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] outline-none transition-all ${
                  passwordError 
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/5' 
                    : 'border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
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
              <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          {/* Remember Me Controls */}
          <div className="flex items-center justify-between pt-0.5 text-[12px] font-semibold">
            <label className="flex items-center gap-2 text-slate-600 hover:text-slate-800 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 border-slate-300 text-[#002D62] accent-[#002D62] cursor-pointer rounded transition-all"
              />
              <span>Remember Me</span>
            </label>
            <a href="#forgot" className="text-[#002D62] hover:text-[#052349] hover:underline">Forgot Password?</a>
          </div>

          {loginError && (
            <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form Trigger Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 bg-[#002D62] hover:bg-[#052349] disabled:opacity-60 text-white font-bold text-[15px] rounded-xl transition-all tracking-wider shadow-md active:scale-[0.98]"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* View Transition Link */}
        <div className="text-[12px] font-medium text-slate-400 pt-5">
          New User? <button type="button" onClick={onNavigateToRegister} className="text-[#002D62] font-black hover:underline">Register Here!</button>
        </div>

      </div>
    </AuthBackground>
  );
}