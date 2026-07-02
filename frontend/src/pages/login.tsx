import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, WifiOff, Phone, ArrowLeft } from 'lucide-react';
import { setTokens } from '../services/api';
import AuthBackground from '../components/ui/AuthBackground';
import collegeLogo from '../assets/logo.jpg';
import ThemeToggle from '../components/ThemeToggle';

interface UserData {
  fullName: string;
  email: string;
  idNumber?: string;
  contactNo?: string;
}

interface LoginProps {
  onLoginSuccess: (role: 'student' | 'staff' | 'admin', user: UserData) => void;
}

const Field = ({
  id, label, icon: Icon, type = 'text', value, onChange, placeholder, error, right,
}: {
  id: string; label: string; icon: React.ElementType; type?: string;
  value: string; onChange: (v: string) => void; placeholder?: string;
  error?: string; right?: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      {right}
    </div>
    <div className="relative group">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#002D62] dark:group-focus-within:text-blue-400 transition-colors">
        <Icon className="h-4 w-4" />
      </span>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800/90 border outline-none transition-all shadow-sm ${
          error ? 'border-red-400 dark:border-red-900/60 focus:border-red-500 bg-red-50/30 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700 focus:border-[#002D62] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#002D62]/10 dark:focus:ring-blue-500/20'
        }`}
      />
    </div>
    {error && (
      <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
      </p>
    )}
  </div>
);

const PasswordField = ({
  id, label, value, onChange, placeholder, error, show, onToggle, right,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; show: boolean; onToggle: () => void;
  right?: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      {right}
    </div>
    <div className="relative group">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#002D62] dark:group-focus-within:text-blue-400 transition-colors">
        <Lock className="h-4 w-4" />
      </span>
      <input
        id={id} type={show ? 'text' : 'password'} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800/90 border outline-none transition-all shadow-sm ${
          error ? 'border-red-400 dark:border-red-900/60 focus:border-red-500 bg-red-50/30 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700 focus:border-[#002D62] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#002D62]/10 dark:focus:ring-blue-500/20'
        }`}
      />
      <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {error && (
      <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
      </p>
    )}
  </div>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default function Login({ onLoginSuccess }: LoginProps) {
  const [view, setView] = useState<'login' | 'forgot'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [lastFivePhone, setLastFivePhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showRecoveryPass, setShowRecoveryPass] = useState(false);
  const [showRecoveryConfirmPass, setShowRecoveryConfirmPass] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const [recoveryEmailError, setRecoveryEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');
  const [recoveryGeneralError, setRecoveryGeneralError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem('_pm_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  const validateEmailText = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) { setEmailError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setEmailError('Enter a valid email address'); return false; }
    setEmailError(''); return true;
  };

  const validatePasswordText = (text: string): boolean => {
    if (!text || !text.trim()) { setPasswordError('Password is required'); return false; }
    setPasswordError(''); return true;
  };

  const validateRecoveryEmail = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) { setRecoveryEmailError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setRecoveryEmailError('Enter a valid email address'); return false; }
    setRecoveryEmailError(''); return true;
  };

  const handlePhoneInput = (val: string) => {
    const nums = val.replace(/\D/g, '');
    setLastFivePhone(nums);
    if (!nums) { setPhoneError('Last 5 digits of your phone are required'); return false; }
    if (nums.length !== 5) { setPhoneError('Must be exactly 5 digits'); return false; }
    setPhoneError(''); return true;
  };

  const handleNewPasswordValidation = (val: string) => {
    setNewPassword(val);
    if (!val) { setNewPasswordError('New password is required'); return false; }
    const reqs = [];
    if (val.length < 8) reqs.push('8+ characters');
    if (!/[A-Z]/.test(val)) reqs.push('uppercase letter');
    if (!/[a-z]/.test(val)) reqs.push('lowercase letter');
    if (!/\d/.test(val)) reqs.push('number');
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(val)) reqs.push('special character');
    if (reqs.length) { setNewPasswordError(`Needs: ${reqs.join(', ')}`); return false; }
    setNewPasswordError('');
    if (confirmNewPassword && val !== confirmNewPassword) setConfirmNewPasswordError('Passwords do not match');
    else setConfirmNewPasswordError('');
    return true;
  };

  const handleConfirmNewPasswordValidation = (val: string) => {
    setConfirmNewPassword(val);
    if (!val) { setConfirmNewPasswordError('Please confirm your password'); return false; }
    if (val !== newPassword) { setConfirmNewPasswordError('Passwords do not match'); return false; }
    setConfirmNewPasswordError(''); return true;
  };

  const applyDomainExtension = (domain: string) => {
    const prefix = email.split('@')[0];
    if (!prefix.trim()) return;
    const computed = `${prefix.trim()}${domain}`;
    setEmail(computed);
    validateEmailText(computed);
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleAuthSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!validateEmailText(email) || !validatePasswordText(password)) return;
    if (!navigator.onLine) { setLoginError('You are offline. Please check your internet connection.'); return; }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json();
      if (!response.ok) { setLoginError(result.error || 'Invalid email or password. Please try again.'); return; }
      if (result.token) setTokens(result.token, result.refreshToken);
      localStorage.setItem('_pm_remembered_email', email.trim());
      setToastMessage('Logged in successfully');
      setShowToast(true);
      setTimeout(() => onLoginSuccess(result.role, result.user), 1000);
    } catch {
      setLoginError(!navigator.onLine
        ? 'You are offline. Please check your internet connection.'
        : 'Unable to reach the server. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryGeneralError('');
<<<<<<< HEAD
    const ok = validateRecoveryEmail(recoveryEmail)
      && (handlePhoneInput(lastFivePhone) as unknown as boolean)
      && (handleNewPasswordValidation(newPassword) as unknown as boolean)
      && (handleConfirmNewPasswordValidation(confirmNewPassword) as unknown as boolean);
    if (!ok) return;
    if (!navigator.onLine) { setRecoveryGeneralError('You are offline. Please check your internet connection.'); return; }
=======
    const v1 = validateRecoveryEmail(recoveryEmail);
    const v2 = handlePhoneInput(lastFivePhone);
    const v3 = handleNewPasswordValidation(newPassword);
    const v4 = handleConfirmNewPasswordValidation(confirmNewPassword);
    if (!v1 || !v2 || !v3 || !v4) return;
>>>>>>> f33446df387cff230311d5aa8eab6967f63c0bfb
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim(), phoneDigits: lastFivePhone, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) { setRecoveryGeneralError(result.error || 'Verification failed. Please check your details.'); return; }
      setToastMessage('Password reset successfully');
      setShowToast(true);
      setRecoveryEmail(''); setLastFivePhone(''); setNewPassword(''); setConfirmNewPassword('');
      setView('login');
    } catch {
      setRecoveryGeneralError('Unable to reach the server. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToRecovery = () => {
    setEmailError(''); setPasswordError(''); setLoginError('');
    setView('forgot');
  };

  const handleSwitchToLogin = () => {
    setRecoveryEmailError(''); setPhoneError(''); setNewPasswordError('');
    setConfirmNewPasswordError(''); setRecoveryGeneralError('');
    setView('login');
  };

  return (
    <AuthBackground layout="split" pattern="waves">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle variant="pill" />
      </div>

      {/* Toast */}
      <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
        showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}>
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {toastMessage}
      </div>

      {/* Offline banner */}
      {isOffline && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
          <WifiOff className="h-3.5 w-3.5" /> No internet connection
        </div>
      )}

      {view === 'login' ? (
        <div className="w-full max-w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,45,98,0.22),0_0_25px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 space-y-6 relative z-10 transition-all duration-300 hover:shadow-[0_30px_70px_-15px_rgba(0,45,98,0.28)] text-slate-800 dark:text-slate-100">
          {/* Header inside the card matching reference figure */}
          <div className="flex flex-col items-center text-center">
            {/* College Logo */}
            <div className="h-16 w-16 rounded-full bg-white border-2 border-[#002D62] dark:border-blue-400 shadow-md p-1.5 flex items-center justify-center mb-3">
              <img src={collegeLogo} alt="College Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            
            {/* Brand Title */}
            <h1 className="text-2xl font-black text-[#002D62] dark:text-blue-400 tracking-wider uppercase leading-none">
              PLACEMATE
            </h1>
            <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-1">
              STUDENT PLACEMENT TRACKER
            </p>
            <p className="text-xs italic text-slate-400 dark:text-slate-500 font-medium mt-1">
              Track. Apply. Achieve.
            </p>

            {/* Welcome Back Section */}
            <div className="mt-6 w-full">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Welcome Back!</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Login to your account</p>
              <div className="w-12 h-1 bg-[#002D62] dark:bg-blue-500 rounded-full mx-auto mt-3.5 mb-1" />
            </div>
          </div>

          <form onSubmit={handleAuthSubmission} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="email-input" className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">EMAIL ID</label>
                {email && !email.includes('@') && (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => applyDomainExtension('@ksrce.ac.in')}
                      className="text-[10px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-900/40 hover:bg-orange-100 transition-colors">
                      @ksrce
                    </button>
                    <button type="button" onClick={() => applyDomainExtension('@gmail.com')}
                      className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors">
                      @gmail
                    </button>
                  </div>
                )}
              </div>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#002D62] dark:group-focus-within:text-blue-400 transition-colors">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email-input" name="email" type="text" value={email}
                  onChange={e => { setEmail(e.target.value); validateEmailText(e.target.value); }}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800/90 border outline-none transition-all shadow-sm ${
                    emailError ? 'border-red-400 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700 focus:border-[#002D62] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#002D62]/10 dark:focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {emailError && <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{emailError}</p>}
            </div>

            <PasswordField
              id="password-input" label="PASSWORD" value={password}
              onChange={v => { setPassword(v); validatePasswordText(v); }}
              placeholder="••••••••" error={passwordError}
              show={showPassword} onToggle={() => setShowPassword(p => !p)}
            />

            {/* Forgot Password link */}
            <div className="flex justify-end pt-1">
              <button type="button" onClick={handleSwitchToRecovery}
                className="text-xs font-bold text-[#002D62] dark:text-blue-400 hover:underline transition-colors">
                Forgot Password?
              </button>
            </div>

            {loginError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{loginError}
              </div>
            )}

            <div className="pt-2">
              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#002D62] dark:bg-blue-600 hover:bg-[#001e4d] dark:hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-base rounded-xl transition-all shadow-md active:scale-[0.98]">
                {isLoading ? <><Spinner /><span>Logging in...</span></> : 'Login'}
              </button>
            </div>
          </form>

          <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
              Any issue? Contact admin.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,45,98,0.22),0_0_25px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 space-y-6 relative z-10 transition-all duration-300 hover:shadow-[0_30px_70px_-15px_rgba(0,45,98,0.28)] text-slate-800 dark:text-slate-100">
          {/* Header matching figure style */}
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-white border-2 border-[#002D62] dark:border-blue-400 shadow-md p-1.5 flex items-center justify-center mb-3">
              <img src={collegeLogo} alt="College Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <h1 className="text-2xl font-black text-[#002D62] dark:text-blue-400 tracking-wider uppercase leading-none">
              PLACEMATE
            </h1>
            <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-1">
              STUDENT PLACEMENT TRACKER
            </p>
            <p className="text-xs italic text-slate-400 dark:text-slate-500 font-medium mt-1">
              Track. Apply. Achieve.
            </p>

            <div className="mt-6 w-full relative">
              <button type="button" onClick={handleSwitchToLogin}
                className="absolute left-0 top-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Reset Password</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Verify identity to set new password</p>
              <div className="w-12 h-1 bg-[#002D62] dark:bg-blue-500 rounded-full mx-auto mt-3.5 mb-1" />
            </div>
          </div>

          <form onSubmit={handleRecoverySubmission} className="space-y-4">
            <Field
              id="recovery-email-input" label="REGISTERED EMAIL" icon={Mail}
              value={recoveryEmail}
              onChange={v => { setRecoveryEmail(v); validateRecoveryEmail(v); }}
              placeholder="you@ksrce.ac.in" error={recoveryEmailError}
            />

            <Field
              id="phone-digits-input" label="LAST 5 DIGITS OF YOUR PHONE" icon={Phone}
              value={lastFivePhone}
              onChange={handlePhoneInput}
              placeholder="e.g. 54321" error={phoneError}
            />

            <PasswordField
              id="new-password-input" label="NEW PASSWORD" value={newPassword}
              onChange={handleNewPasswordValidation}
              placeholder="••••••••" error={newPasswordError}
              show={showRecoveryPass} onToggle={() => setShowRecoveryPass(p => !p)}
            />

            <PasswordField
              id="confirm-new-password-input" label="CONFIRM NEW PASSWORD" value={confirmNewPassword}
              onChange={handleConfirmNewPasswordValidation}
              placeholder="••••••••" error={confirmNewPasswordError}
              show={showRecoveryConfirmPass} onToggle={() => setShowRecoveryConfirmPass(p => !p)}
            />

            {recoveryGeneralError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{recoveryGeneralError}
              </div>
            )}

            <div className="pt-2">
              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#002D62] dark:bg-blue-600 hover:bg-[#001e4d] dark:hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-base rounded-xl transition-all shadow-md active:scale-[0.98]">
                {isLoading ? <><Spinner /><span>Resetting...</span></> : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AuthBackground>
  );
}
