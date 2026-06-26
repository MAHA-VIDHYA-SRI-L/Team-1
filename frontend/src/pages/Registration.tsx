import { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Hash, Phone } from 'lucide-react';
import AuthBackground from '../components/ui/AuthBackground';
import collegeLogo from '../assets/logo.jpg';

interface RegistrationProps {
  onNavigateToLogin: () => void;
}

export default function Registration({ onNavigateToLogin }: RegistrationProps) {
  // --- STATE MANAGEMENT ---
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // --- ERROR STATES ---
  const [nameError, setNameError] = useState('');
  const [idError, setIdError] = useState('');
  const [contactError, setContactError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- ROLE SWITCH CLEAR EFFECT ---
  const handleRoleChange = (newRole: 'student' | 'staff') => {
    if (newRole === role) return;
    setRole(newRole);
    
    setFullName('');
    setIdNumber('');
    setContactNo('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');

    setNameError('');
    setIdError('');
    setContactError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setRegisterError('');
  };

  // --- AUTO-HIDE TOAST EFFECT ---
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // --- VALIDATION HANDLERS ---
  const handleNameValidation = (val: string) => {
    const alphabeticOnly = val.replace(/[^a-zA-Z\s]/g, '');
    setFullName(alphabeticOnly);

    if (alphabeticOnly.trim().length === 0) {
      setNameError('Full Name is required (letters only)');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleIdValidation = (val: string) => {
    let targetedValue = val;
    const idLabel = role === 'student' ? 'Roll Number' : 'Staff ID';

    if (role === 'student') {
      targetedValue = val.replace(/\D/g, '');
    } else {
      targetedValue = val.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    setIdNumber(targetedValue);

    if (targetedValue.trim().length === 0) {
      setIdError(`${idLabel} is required`);
      return false;
    }
    setIdError('');
    return true;
  };

  const handleContactValidation = (val: string) => {
    const sanitized = val.replace(/\D/g, '');
    setContactNo(sanitized);

    if (sanitized.length === 0) {
      setContactError('Contact number is required');
      return false;
    } else if (sanitized.length !== 10) {
      setContactError('Contact number must be exactly 10 digits');
      return false;
    } else {
      setContactError('');
      return true;
    }
  };

  const handleEmailValidation = (val: string) => {
    setEmail(val);
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      setEmailError('Email ID is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    const domainLower = trimmed.toLowerCase();
    if (!domainLower.endsWith('@gmail.com') && !domainLower.endsWith('@ksrce.ac.in')) {
      setEmailError('Access denied. Use your official @ksrce.ac.in or @gmail.com account');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handlePasswordValidation = (val: string) => {
    setPassword(val);
    if (val.length === 0) {
      setPasswordError('Password is required');
      return false;
    }
    
    const requirements = [];
    if (val.length < 8) requirements.push('minimum 8 characters');
    if (!/[A-Z]/.test(val)) requirements.push('an uppercase letter');
    if (!/[a-z]/.test(val)) requirements.push('a lowercase letter');
    if (!/\d/.test(val)) requirements.push('a digit');
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(val)) requirements.push('a special symbol');

    if (requirements.length > 0) {
      setPasswordError(`Password requires: ${requirements.join(', ')}`);
      return false;
    } else {
      setPasswordError('');
    }

    if (confirmPassword && val !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
    return true;
  };

  const handleConfirmPasswordValidation = (val: string) => {
    setConfirmPassword(val);
    if (val.length === 0) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (val !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  // --- FORM SUBMIT HANDLING ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    const nameValid = handleNameValidation(fullName);
    const idValid = handleIdValidation(idNumber);
    const contactValid = handleContactValidation(contactNo);
    const emailValid = handleEmailValidation(email);
    const passwordValid = handlePasswordValidation(password);
    const confirmValid = handleConfirmPasswordValidation(confirmPassword);

    if (!nameValid || !idValid || !contactValid || !emailValid || !passwordValid || !confirmValid) {
      return;
    }

    setIsLoading(true);

    const endpoint = role === 'student'
      ? 'http://localhost:3000/api/auth/register/student'
      : 'http://localhost:3000/api/auth/register/staff';

    const normalizedEmail = email.trim().toLowerCase();

    const body = role === 'student'
      ? { full_name: fullName.trim(), register_no: idNumber.trim(), phone: contactNo, email: normalizedEmail, password }
      : { full_name: fullName.trim(), faculty_id: idNumber.trim(), phone: contactNo, email: normalizedEmail, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Registration failed';
        
        if (
          errorMsg.toLowerCase().includes('already registered') || 
          errorMsg.toLowerCase().includes('already exists') ||
          errorMsg.toLowerCase().includes('duplicate')
        ) {
          setRegisterError('This ID is already registered.');
        } else {
          setRegisterError(errorMsg);
        }
        return;
      }

      setShowToast(true);
      setTimeout(() => onNavigateToLogin(), 1500);
    } catch {
      setRegisterError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white font-semibold text-[13px] px-4 py-2.5 rounded-full shadow-lg border border-emerald-400/20 transition-all duration-300 transform scale-100">
        {showToast && (
          <>
            <CheckCircle2 className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>Registration Successful</span>
          </>
        )}
      </div>

      <div className="w-full max-w-[480px] mx-auto my-6 flex flex-col items-center text-center p-6 sm:p-8 rounded-[28px] bg-white border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
        
        <div className="flex flex-col items-center space-y-2">
          <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm ring-4 ring-slate-100 overflow-hidden">
            <img src={collegeLogo} alt="Logo" className="w-full h-full object-contain rounded-full select-none" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-[#002D62] tracking-wider uppercase leading-none">Placemate</h2>
            <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Student Placement Tracker</p>
          </div>
        </div>

        <div className="w-full flex flex-col items-center space-y-0.5 pt-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Create Account</h1>
          <div className="w-12 h-[2.5px] bg-orange-500 rounded-full mt-1.5"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full text-left space-y-3 pt-3">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 tracking-wide uppercase px-0.5">I am a</label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`py-2 text-[12px] font-bold rounded-lg transition-all ${role === 'student' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-orange-500/10' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('staff')}
                className={`py-2 text-[12px] font-bold rounded-lg transition-all ${role === 'staff' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-orange-500/10' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Staff
              </button>
            </div>
          </div>

          {/* NAME FIELD */}
          <div className="space-y-1">
            <label htmlFor="name-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">Full Name</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <User className="h-[15px] w-[15px]" />
              </span>
              <input 
                id="name-input"
                type="text" 
                value={fullName} 
                onChange={(e) => handleNameValidation(e.target.value)}
                onBlur={(e) => handleNameValidation(e.target.value)}
                placeholder="John Doe" 
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${nameError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'}`}
              />
            </div>
            {nameError && <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5"><AlertCircle className="h-3.5 w-3.5" /><span>{nameError}</span></div>}
          </div>

          {/* DYNAMIC ID FIELD */}
          <div className="space-y-1">
            <label htmlFor="id-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">{role === 'student' ? 'Roll Number' : 'Staff ID'}</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Hash className="h-[15px] w-[15px]" />
              </span>
              <input 
                id="id-input"
                type="text" 
                value={idNumber} 
                onChange={(e) => handleIdValidation(e.target.value)}
                onBlur={(e) => handleIdValidation(e.target.value)}
                placeholder={role === 'student' ? 'e.g., 2213001' : 'e.g., KSRSTF123'} 
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${idError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'}`}
              />
            </div>
            {idError && <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5"><AlertCircle className="h-3.5 w-3.5" /><span>{idError}</span></div>}
          </div>

          {/* CONTACT FIELD */}
          <div className="space-y-1">
            <label htmlFor="contact-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">Contact Number</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Phone className="h-[15px] w-[15px]" />
              </span>
              <input 
                id="contact-input"
                type="text" 
                maxLength={10}
                value={contactNo} 
                onChange={(e) => handleContactValidation(e.target.value)}
                onBlur={(e) => handleContactValidation(e.target.value)}
                placeholder="Enter 10-digit number" 
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${contactError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'}`}
              />
            </div>
            {contactError && <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5"><AlertCircle className="h-3.5 w-3.5" /><span>{contactError}</span></div>}
          </div>

          {/* EMAIL ID FIELD */}
          <div className="space-y-1">
            <label htmlFor="email-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">Email ID</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Mail className="h-[15px] w-[15px]" />
              </span>
              <input 
                id="email-input"
                type="text" 
                value={email} 
                onChange={(e) => handleEmailValidation(e.target.value)}
                onBlur={(e) => handleEmailValidation(e.target.value)}
                placeholder="name@ksrce.ac.in" 
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${emailError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'}`}
              />
            </div>
            {emailError && <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5"><AlertCircle className="h-3.5 w-3.5" /><span>{emailError}</span></div>}
          </div>

          {/* PASSWORD FIELD */}
          <div className="space-y-1">
            <label htmlFor="password-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Lock className="h-[15px] w-[15px]" />
              </span>
              <input 
                id="password-input"
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => handlePasswordValidation(e.target.value)}
                onBlur={(e) => handlePasswordValidation(e.target.value)}
                placeholder="••••••••" 
                className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {passwordError && <div className="text-[11px] font-semibold text-red-500 flex items-start gap-1.5 px-0.5 pt-0.5 leading-tight"><AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{passwordError}</span></div>}
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div className="space-y-1">
            <label htmlFor="confirm-password-input" className="text-[11px] font-bold text-slate-700 tracking-wide uppercase px-0.5">Confirm Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Lock className="h-[15px] w-[15px]" />
              </span>
              <input 
                id="confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={(e) => handleConfirmPasswordValidation(e.target.value)}
                onBlur={(e) => handleConfirmPasswordValidation(e.target.value)}
                placeholder="••••••••" 
                className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border shadow-sm outline-none transition-all ${confirmPasswordError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-orange-500'}`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {confirmPasswordError && <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5 px-0.5 pt-0.5"><AlertCircle className="h-3.5 w-3.5" /><span>{confirmPasswordError}</span></div>}
          </div>

          {registerError && (
            <div className="text-[11px] font-semibold text-red-500 flex items-center justify-between gap-1.5 px-2 py-2 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>{registerError}</span>
              </div>
              {registerError.includes('registered') && (
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-[#002D62] font-black underline hover:text-[#052349] whitespace-nowrap shrink-0 text-[11px]"
                >
                  Login instead
                </button>
              )}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 bg-[#002D62] hover:bg-[#052349] disabled:opacity-60 text-white font-bold text-[14px] rounded-xl transition-all tracking-wider shadow-md active:scale-[0.98]"
          >
            {isLoading ? 'Processing...' : `Register as ${role === 'student' ? 'Student' : 'Staff'}`}
          </button>
        </form>

        <div className="text-[12px] font-medium text-slate-400 pt-3">
          Already have an account? <button type="button" onClick={onNavigateToLogin} className="text-[#002D62] font-black hover:underline">Login Here</button>
        </div>

      </div>
    </AuthBackground>
  );
}