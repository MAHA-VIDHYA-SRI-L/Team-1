import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, WifiOff, Phone, ArrowLeft } from 'lucide-react';
import AuthBackground from '../components/ui/AuthBackground';
import collegeLogo from '../assets/logo.jpg';

interface UserData {
  fullName: string;
  email: string;
  idNumber?: string;
  contactNo?: string;
}

interface LoginProps {
  onLoginSuccess: (role: 'student' | 'staff' | 'admin', user: UserData) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // --- VIEW SWITCHER ---
  const [view, setView] = useState<'login' | 'forgot'>('login');

  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // --- RECOVERY FLOW STATE ---
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [lastFivePhone, setLastFivePhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showRecoveryPass, setShowRecoveryPass] = useState(false);
  const [showRecoveryConfirmPass, setShowRecoveryConfirmPass] = useState(false);

  // --- ERROR & PERFORMANCE TRACKING STATES ---
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

  // --- HARDWARE LIFECYCLE MONITOR ---
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // --- VALIDATION MATRIX (LOGIN) ---
  const validateEmailText = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) {
      setEmailError('Email ID is required to access records');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please present a structurally sound email identity');
      return false;
    }
    const lower = trimmed.toLowerCase();
    if (!lower.endsWith('@gmail.com') && !lower.endsWith('@ksrce.ac.in')) {
      setEmailError('Access restricted strictly to @ksrce.ac.in or @gmail.com domains');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePasswordText = (text: string): boolean => {
    if (!text) {
      setPasswordError('Account access passcode security is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // --- VALIDATION MATRIX (PASSWORD RECOVERY) ---
  const validateRecoveryEmail = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) {
      setRecoveryEmailError('Registered email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setRecoveryEmailError('Enter a valid email address');
      return false;
    }
    setRecoveryEmailError('');
    return true;
  };

  const handlePhoneInput = (val: string) => {
    const numbersOnly = val.replace(/\D/g, '');
    setLastFivePhone(numbersOnly);

    if (numbersOnly.length === 0) {
      setPhoneError('Last 5 digits of your phone number are required');
      return false;
    } else if (numbersOnly.length !== 5) {
      setPhoneError('Must be exactly the last 5 digits');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const handleNewPasswordValidation = (val: string) => {
    setNewPassword(val);
    if (val.length === 0) {
      setNewPasswordError('New password is required');
      return false;
    }

    const requirements = [];
    if (val.length < 8) requirements.push('minimum 8 characters');
    if (!/[A-Z]/.test(val)) requirements.push('an uppercase letter');
    if (!/[a-z]/.test(val)) requirements.push('a lowercase letter');
    if (!/\d/.test(val)) requirements.push('a digit');
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(val)) requirements.push('a special symbol');

    if (requirements.length > 0) {
      setNewPasswordError(`Password requires: ${requirements.join(', ')}`);
      return false;
    } else {
      setNewPasswordError('');
    }

    if (confirmNewPassword && val !== confirmNewPassword) {
      setConfirmNewPasswordError('Passwords do not match');
    } else {
      setConfirmNewPasswordError('');
    }
    return true;
  };

  const handleConfirmNewPasswordValidation = (val: string) => {
    setConfirmNewPassword(val);
    if (val.length === 0) {
      setConfirmNewPasswordError('Please confirm your new password');
      return false;
    }
    if (val !== newPassword) {
      setConfirmNewPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmNewPasswordError('');
      return true;
    }
  };

  const applyDomainExtension = (domain: string) => {
    let currentPrefix = email.split('@')[0];
    if (!currentPrefix.trim()) return;
    const computedString = `${currentPrefix.trim()}${domain}`;
    setEmail(computedString);
    validateEmailText(computedString);
  };

  // --- AUTH SUBMISSION HANDLER ---
  const handleAuthSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailStatus = validateEmailText(email);
    const passwordStatus = validatePasswordText(password);

    if (!emailStatus || !passwordStatus) return;

    if (!navigator.onLine) {
      setLoginError('Local area connection pipeline down. Verify physical connection configurations.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoginError(result.error || 'Server validation failed. Verify profile credentials.');
        return;
      }

      setToastMessage('Session Logged in Successfully');
      setShowToast(true);
      setTimeout(() => onLoginSuccess(result.role, result.user), 1000);
    } catch {
      if (!navigator.onLine) {
        setLoginError('Global system disconnected. Re-examine routing switches.');
      } else {
        setLoginError('Unable to connect to service terminal. Confirm server is running at localhost:3000.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- PASSWORD RECOVERY SUBMISSION HANDLER ---
  const handleRecoverySubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryGeneralError('');

    const isEmailValid = validateRecoveryEmail(recoveryEmail);
    const isPhoneValid = handlePhoneInput(lastFivePhone);
    const isPassValid = handleNewPasswordValidation(newPassword);
    const isConfirmValid = handleConfirmNewPasswordValidation(confirmNewPassword);

    if (!isEmailValid || !isPhoneValid || !isPassValid || !isConfirmValid) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          phoneDigits: lastFivePhone,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setRecoveryGeneralError(result.error || 'Verification failed. Double check provided details.');
        return;
      }

      setToastMessage('Password reset updated successfully');
      setShowToast(true);
      
      setRecoveryEmail('');
      setLastFivePhone('');
      setNewPassword('');
      setConfirmNewPassword('');
      setView('login');
    } catch {
      setRecoveryGeneralError('Network interface breakdown. Check host channel connection configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToRecovery = () => {
    setEmailError('');
    setPasswordError('');
    setLoginError('');
    setView('forgot');
  };

  const handleSwitchToLogin = () => {
    setRecoveryEmailError('');
    setPhoneError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');
    setRecoveryGeneralError('');
    setView('login');
  };

  return (
    <AuthBackground>
      {/* TRANSACTION SUCCESS NOTIFIER */}
      <div 
        className={`fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-full shadow-lg border border-emerald-400/20 transition-all duration-300 transform ${
          showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>{toastMessage}</span>
      </div>

      {/* HARDWARE FAULT BAR */}
      {isOffline && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-600 text-white font-black text-[11px] uppercase tracking-wider px-4 py-2 rounded-full shadow-md animate-pulse">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline Pipeline Trapped</span>
        </div>
      )}

      {/* Interactive Auth Card */}
      <div className="w-full max-w-[480px] mx-auto my-6 flex flex-col items-center text-center p-6 sm:p-8 rounded-[28px] bg-white border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
        
        {/* Institutional Identity Frame */}
        <div className="flex flex-col items-center space-y-2">
          <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm ring-4 ring-slate-100 overflow-hidden">
            <img 
              src={collegeLogo} 
              alt="Institution Logo" 
              className="w-full h-full object-contain rounded-full select-none"
            />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-[#002D62] tracking-wider uppercase leading-none">Placemate</h2>
            <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Student Placement Tracker</p>
          </div>
        </div>

        {view === 'login' ? (
          <>
            <div className="w-full flex flex-col items-center space-y-0.5 pt-4">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Welcome Back!</h1>
              <p className="text-xs text-slate-400 font-medium">Login to your account</p>
              <div className="w-12 h-[2.5px] bg-orange-500 rounded-full mt-1.5"></div>
            </div>

            {/* LOGIN INPUT INTERFACE */}
            <form onSubmit={handleAuthSubmission} className="w-full text-left space-y-3 pt-3">
              
              {/* Email Processing Input Block */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-0.5">
                  <label htmlFor="email-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">
                    Email Identity
                  </label>
                  {email && !email.includes('@') && (
                    <div className="flex gap-1.5">
                      <button 
                        type="button" 
                        onClick={() => applyDomainExtension('@ksrce.ac.in')}
                        className="text-[9px] font-extrabold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 hover:bg-orange-100 transition-colors"
                      >
                        + ksrce
                      </button>
                      <button 
                        type="button" 
                        onClick={() => applyDomainExtension('@gmail.com')}
                        className="text-[9px] font-extrabold bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        + gmail
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <Mail className="h-[15px] w-[15px]" />
                  </span>
                  <input 
                    id="email-input"
                    name="email"
                    type="text" 
                    value={email} 
                    onChange={(e) => { setEmail(e.target.value); validateEmailText(e.target.value); }}
                    placeholder="username@ksrce.ac.in" 
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${
                      emailError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'
                    }`}
                  />
                </div>
                {emailError && (
                  <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Passcode Security Input Block */}
              <div className="space-y-1">
                <label htmlFor="password-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">
                  Secure Password
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <Lock className="h-[15px] w-[15px]" />
                  </span>
                  <input 
                    id="password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => { setPassword(e.target.value); validatePasswordText(e.target.value); }}
                    placeholder="••••••••" 
                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${
                      passwordError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'
                    }`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                
                {/* RECOVERY LINK SUBTLE ALIGNMENT - Positioned cleanly right underneath the password input container */}
                <div className="flex justify-end px-0.5 pt-0.5">
                  <button type="button" onClick={handleSwitchToRecovery} className="text-[11px] font-bold text-[#002D62] hover:text-orange-500 transition-colors">
                    Recover Password?
                  </button>
                </div>

                {passwordError && (
                  <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              {loginError && (
                <div className="text-[11px] font-semibold text-red-500 flex items-start gap-1.5 px-0.5 py-1 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Auth Dispatch Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-[#002D62] hover:bg-[#052349] disabled:opacity-60 text-white font-bold text-[14px] rounded-xl transition-all tracking-wider shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>


          </>
        ) : (
          <>
            <div className="w-full flex flex-col items-center space-y-0.5 pt-4">
              <div className="w-full flex items-center justify-start">
                <button type="button" onClick={handleSwitchToLogin} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </button>
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight pt-2">Recover Password</h1>
              <p className="text-xs text-slate-400 font-medium">Verify your profile metrics to configuration reset</p>
              <div className="w-12 h-[2.5px] bg-orange-500 rounded-full mt-1.5"></div>
            </div>

            {/* RECOVERY INPUT INTERFACE */}
            <form onSubmit={handleRecoverySubmission} className="w-full text-left space-y-3 pt-3">
              
              {/* RECOVERY EMAIL */}
              <div className="space-y-1">
                <label htmlFor="recovery-email-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">Registered Email</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <Mail className="h-[15px] w-[15px]" />
                  </span>
                  <input 
                    id="recovery-email-input"
                    type="text"
                    value={recoveryEmail}
                    onChange={(e) => { setRecoveryEmail(e.target.value); validateRecoveryEmail(e.target.value); }}
                    placeholder="name@ksrce.ac.in"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${
                      recoveryEmailError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'
                    }`}
                  />
                </div>
                {recoveryEmailError && (
                  <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{recoveryEmailError}</span>
                  </div>
                )}
              </div>

              {/* RECOVERY PHONE LAST 5 DIGITS */}
              <div className="space-y-1">
                <label htmlFor="phone-digits-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">Last 5 Digits of Phone Number</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <Phone className="h-[15px] w-[15px]" />
                  </span>
                  <input 
                    id="phone-digits-input"
                    type="text"
                    maxLength={5}
                    value={lastFivePhone}
                    onChange={(e) => handlePhoneInput(e.target.value)}
                    placeholder="e.g., 54321"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${
                      phoneError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'
                    }`}
                  />
                </div>
                {phoneError && (
                  <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{phoneError}</span>
                  </div>
                )}
              </div>

              {/* NEW PASSWORD */}
              <div className="space-y-1">
                <label htmlFor="new-password-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">New Password</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <Lock className="h-[15px] w-[15px]" />
                  </span>
                  <input 
                    id="new-password-input"
                    type={showRecoveryPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => handleNewPasswordValidation(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${
                      newPasswordError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'
                    }`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowRecoveryPass(!showRecoveryPass)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showRecoveryPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {newPasswordError && (
                  <div className="text-[11px] font-semibold text-red-500 flex items-start gap-1.5 px-0.5 pt-0.5 leading-tight">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{newPasswordError}</span>
                  </div>
                )}
              </div>

              {/* CONFIRM NEW PASSWORD */}
              <div className="space-y-1">
                <label htmlFor="confirm-new-password-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">Confirm New Password</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <Lock className="h-[15px] w-[15px]" />
                  </span>
                  <input 
                    id="confirm-new-password-input"
                    type={showRecoveryConfirmPass ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => handleConfirmNewPasswordValidation(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${
                      confirmNewPasswordError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'
                    }`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowRecoveryConfirmPass(!showRecoveryConfirmPass)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showRecoveryConfirmPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {confirmNewPasswordError && (
                  <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{confirmNewPasswordError}</span>
                  </div>
                )}
              </div>

              {recoveryGeneralError && (
                <div className="text-[11px] font-semibold text-red-500 flex items-start gap-1.5 px-0.5 py-1 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{recoveryGeneralError}</span>
                </div>
              )}

              {/* Recovery Form Submission Action Dispatcher */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-[#002D62] hover:bg-[#052349] disabled:opacity-60 text-white font-bold text-[14px] rounded-xl transition-all tracking-wider shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Updating Security Matrix...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </AuthBackground>
  );
}