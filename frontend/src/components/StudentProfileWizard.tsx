import React, { useState, useMemo, useEffect } from 'react';
import AuthBackground from './ui/AuthBackground';

interface StudentProfileWizardProps {
  onComplete: (completedData: any) => void;
  initialEmail: string;
  initialName?: string;     // Passed from registration/auth state
  initialRegsNumber?: string; // Passed from registration/auth state
}

export default function StudentProfileWizard({ 
  onComplete, 
  initialEmail,
  initialName = 'Francis', // Default fallback for dev, will use passed prop
  initialRegsNumber = '24CSE012' // Default fallback for dev, will use passed prop
}: StudentProfileWizardProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    // Pre-filled fields from registration are locked down
    name: initialName, 
    regsNumber: initialRegsNumber,
    email: initialEmail, 
    
    // Step 1 Fields
    department: '', 
    year: '', 
    currentSemester: '', // Automatically calculated now
    yearOfStudy: '',     // Academic Year Entry (e.g., 2024)
    passOutYear: '',     // Automatically calculated now
    
    // Step 2 Fields
    phone: '', 
    alternativePhone: '', 
    address: '', 
    isOtherState: false, 
    stateName: 'Tamil Nadu', 
    pinCode: '', 
    district: '',
    linkedinUrl: '', // New Field
    
    // Step 3 Fields
    boardOfStudy: '', 
    graduationStanding: '', 
    tenthPercentage: '', 
    tenthSchoolName: '', 
    twelfthPercentage: '', 
    twelfthDiplomaSchoolName: '', 
    sgpaSemesterValues: Array(8).fill('')
  });

  // --- AUTOMATIC ACADEMIC YEAR & SEMESTER CALCULATOR ---
  useEffect(() => {
    const entryYear = parseInt(formData.yearOfStudy);
    if (!isNaN(entryYear) && formData.yearOfStudy.length === 4) {
      // Calculate Expected Graduation Pass Out Year automatically (Entry Year + 4)
      const calculatedPassOut = (entryYear + 4).toString();
      
      // Calculate Semester automatically based on selected Year of Study
      let calculatedSem = '';
      if (formData.year === 'I year') calculatedSem = '1';
      if (formData.year === 'II year') calculatedSem = '3';
      if (formData.year === 'III year') calculatedSem = '5';
      if (formData.year === 'IV year') calculatedSem = '7';

      setFormData(prev => ({
        ...prev,
        passOutYear: calculatedPassOut,
        currentSemester: calculatedSem
      }));
      
      // Clear auto-calculated validation errors if any existed
      setErrors(prev => {
        const next = { ...prev };
        delete next.passOutYear;
        delete next.currentSemester;
        return next;
      });
    }
  }, [formData.year, formData.yearOfStudy]);

  // Calculate how many previous semesters need inputs
  const completedSemsCount = useMemo(() => {
    const semNum = parseInt(formData.currentSemester);
    if (isNaN(semNum) || semNum <= 1) return 0;
    return semNum - 1; 
  }, [formData.currentSemester]);

  // --- DYNAMIC PROGRESS TRACKER ---
  const dynamicPercentage = useMemo(() => {
    const baseFields = [
      formData.name, formData.department, formData.year, formData.currentSemester, 
      formData.regsNumber, formData.yearOfStudy, formData.passOutYear,
      formData.email, formData.phone, formData.alternativePhone, formData.address, 
      formData.stateName, formData.district, formData.pinCode, formData.linkedinUrl,
      formData.boardOfStudy, formData.graduationStanding, formData.tenthPercentage, formData.tenthSchoolName
    ];

    let filledCount = baseFields.filter(val => typeof val === 'string' ? val.trim() !== '' : !!val).length;
    let totalFieldsCount = baseFields.length;

    if (completedSemsCount > 0) {
      totalFieldsCount += completedSemsCount;
      const filledSems = formData.sgpaSemesterValues.slice(0, completedSemsCount).filter(v => v.trim() !== '').length;
      filledCount += filledSems;
    }

    return Math.round((filledCount / totalFieldsCount) * 100);
  }, [formData, completedSemsCount]);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dynamicPercentage / 100) * circumference;

  // Compute CGPA securely ensuring values stay valid
  const computedCgpa = useMemo(() => {
    const validScores = formData.sgpaSemesterValues
      .slice(0, completedSemsCount)
      .map(v => parseFloat(v))
      .filter(num => !isNaN(num) && num <= 10);
    
    if (validScores.length === 0) return '0.00';
    const sum = validScores.reduce((acc, curr) => acc + curr, 0);
    return (sum / validScores.length).toFixed(2);
  }, [formData.sgpaSemesterValues, completedSemsCount]);

  // --- Input Filtering & Handlers ---
  const handleDigitFilterChange = (field: string, val: string, maxLength: number) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length <= maxLength) {
      setFormData(prev => ({ ...prev, [field]: digitsOnly }));
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handlePercentageChange = (field: string, val: string) => {
    if (val === '' || /^\d{0,2}(\.\d{0,1})?$/.test(val) || val === '100') {
      setFormData(prev => ({ ...prev, [field]: val }));
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleSemesterChange = (index: number, value: string) => {
    // Validates that input is a decimal structure and strict upper bound check (< 10.01)
    if (value === '' || /^\d{0,1}(\.\d{0,2})?$/.test(value) || value === '10') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed > 10) return; // Prevent entries higher than 10

      const updatedSems = [...formData.sgpaSemesterValues];
      updatedSems[index] = value;
      setFormData({ ...formData, sgpaSemesterValues: updatedSems });
      setErrors(prev => { const next = { ...prev }; delete next.sgpaMatrix; return next; });
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.department) newErrors.department = 'Department selection is required';
      if (!formData.year) newErrors.year = 'Year level is required';
      if (formData.yearOfStudy.length !== 4) newErrors.yearOfStudy = 'Academic Year Entry must be 4 digits';
    }

    if (step === 2) {
      if (formData.phone.length !== 10) newErrors.phone = 'Phone must be exactly 10 digits';
      if (formData.alternativePhone.length !== 10) newErrors.alternativePhone = 'Alternative phone must be 10 digits';
      if (!formData.address.trim()) newErrors.address = 'Street address is required';
      if (formData.isOtherState && !formData.stateName.trim()) newErrors.stateName = 'State designation is required';
      if (!formData.district.trim()) newErrors.district = 'District name is required';
      if (formData.pinCode.length !== 6) newErrors.pinCode = 'Pincode must be exactly 6 digits';
      
      // LinkedIn URL format validation
      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
      if (!formData.linkedinUrl.trim()) {
        newErrors.linkedinUrl = 'LinkedIn Profile link is required';
      } else if (!linkedinRegex.test(formData.linkedinUrl)) {
        newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL (e.g., linkedin.com/in/username)';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.boardOfStudy) newErrors.boardOfStudy = 'Board selection is required';
    if (!formData.graduationStanding) newErrors.graduationStanding = 'Graduation track choice is required';
    if (!formData.tenthPercentage) newErrors.tenthPercentage = '10th Percentage is required';
    if (!formData.tenthSchoolName.trim()) newErrors.tenthSchoolName = '10th School Name is required';

    const filledSemsCount = formData.sgpaSemesterValues.slice(0, completedSemsCount).filter(v => v !== '').length;
    if (filledSemsCount < completedSemsCount) {
      newErrors.sgpaMatrix = `Please enter valid grades (< 10) for all ${completedSemsCount} completed semester(s).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      onComplete(formData);
    }
  };

  return (
    <AuthBackground>
      <div className="min-h-screen w-full flex items-center justify-center p-8 md:p-7">
        <div className="w-full max-w-2xl md:min-w-[600px] flex-shrink-0 bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 md:p-8 my-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Complete Your Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3 — Setup your student dashboard context</p>
            </div>

            {/* Progress Circle */}
            <div className="relative flex items-center justify-center h-14 w-14 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r={radius} className="text-slate-100" strokeWidth="4px" stroke="currentColor" fill="transparent" />
                <circle
                  cx="28" cy="28" r={radius}
                  className="text-[#002D62] transition-all duration-300 ease-out"
                  strokeWidth="4px" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" stroke="currentColor" fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[11px] font-extrabold text-slate-700 leading-none">{dynamicPercentage}%</span>
                <span className="text-[7px] uppercase tracking-wider text-slate-400 mt-0.5 font-bold">Done</span>
              </div>
            </div>
          </div>

          <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-6">
            
            {/* STEP 1: BASIC STUDENT DETAILS */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#002D62] tracking-wider mb-2">Basic Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name field - Read-Only */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Name (Registered)</label>
                    <input 
                      type="text" value={formData.name} disabled
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:outline-none text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>

                  {/* Register Number field - Read-Only */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Register Number (Registered)</label>
                    <input 
                      type="text" value={formData.regsNumber} disabled
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:outline-none text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>

                  {/* Department Select Dropdown - Solves manual typos */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Department *</label>
                    <select 
                      value={formData.department} onChange={(e) => { setFormData({...formData, department: e.target.value}); setErrors(p => { const n={...p}; delete n.department; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.department ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`}
                    >
                      <option value="">Select Department</option>
                      {['CSE','MECH','ECE','BIO MEDICAL','IT','AUTO MOBILE','SFE','EEE','AIDS','MBA','MCA'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.department}</p>}
                  </div>

                  {/* Year of study select */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Year of Study *</label>
                    <select 
                      value={formData.year} onChange={(e) => { setFormData({...formData, year: e.target.value}); setErrors(p => { const n={...p}; delete n.year; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.year ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`}
                    >
                      <option value="">Select Year</option>
                      {['I year', 'II year', 'III year', 'IV year'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {errors.year && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.year}</p>}
                  </div>

                  {/* Academic Year Entry (Triggers smart calculations) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Academic Entry Year (4 Digits) *</label>
                    <input 
                      type="text" placeholder="e.g. 2024" value={formData.yearOfStudy} onChange={(e) => handleDigitFilterChange('yearOfStudy', e.target.value, 4)}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.yearOfStudy ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`}
                    />
                    {errors.yearOfStudy && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.yearOfStudy}</p>}
                  </div>

                  {/* Current Semester - Auto-computed */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Current Semester (Auto-Calculated)</label>
                    <input 
                      type="text" value={formData.currentSemester ? `Semester ${formData.currentSemester}` : 'Awaiting Year Parameters'} disabled
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Pass Out Year - Auto-computed */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Expected Graduation Pass Out Year (Auto-Calculated)</label>
                    <input 
                      type="text" value={formData.passOutYear || 'Awaiting Entry Year'} disabled
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: COMMUNICATIONS & SOCIAL LINKS */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#002D62] tracking-wider mb-2">Communication & Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Email field - Read-Only */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Email Address (Registered)</label>
                    <input 
                      type="text" value={formData.email} disabled
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:outline-none text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>

                  {/* LinkedIn URL Field */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">LinkedIn Profile Link *</label>
                    <input 
                      type="text" placeholder="https://www.linkedin.com/in/username" value={formData.linkedinUrl} 
                      onChange={(e) => { setFormData({...formData, linkedinUrl: e.target.value}); setErrors(p => { const n={...p}; delete n.linkedinUrl; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.linkedinUrl ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`}
                    />
                    {errors.linkedinUrl && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.linkedinUrl}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Phone Number *</label>
                    <input 
                      type="text" value={formData.phone} onChange={(e) => handleDigitFilterChange('phone', e.target.value, 10)}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.phone ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Alternative Phone *</label>
                    <input 
                      type="text" value={formData.alternativePhone} onChange={(e) => handleDigitFilterChange('alternativePhone', e.target.value, 10)}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.alternativePhone ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.alternativePhone && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.alternativePhone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Address *</label>
                    <textarea 
                      value={formData.address} onChange={(e) => { setFormData({...formData, address: e.target.value}); setErrors(p => { const n={...p}; delete n.address; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl h-20 resize-none focus:outline-none ${errors.address ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.address}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">State *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center text-sm gap-1.5 font-medium text-slate-600">
                        <input type="radio" checked={!formData.isOtherState} onChange={() => setFormData({...formData, isOtherState: false, stateName: 'Tamil Nadu'})} />
                        Tamil Nadu
                      </label>
                      <label className="flex items-center text-sm gap-1.5 font-medium text-slate-600">
                        <input type="radio" checked={formData.isOtherState} onChange={() => setFormData({...formData, isOtherState: true, stateName: ''})} />
                        Other State
                      </label>
                    </div>
                    {formData.isOtherState && (
                      <input 
                        type="text" placeholder="Enter state name" value={formData.stateName}
                        onChange={(e) => setFormData({...formData, stateName: e.target.value})}
                        className="w-full mt-2 p-2 border text-sm rounded-xl border-slate-200"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">District *</label>
                    <input 
                      type="text" value={formData.district} onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^[A-Za-z\s]+$/.test(v)) {
                          setFormData({...formData, district: v});
                          setErrors(p => { const n={...p}; delete n.district; return n; });
                        }
                      }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.district ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.district && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.district}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Pin Code *</label>
                    <input 
                      type="text" value={formData.pinCode} onChange={(e) => handleDigitFilterChange('pinCode', e.target.value, 6)}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.pinCode ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.pinCode && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.pinCode}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SCHOLASTIC RECORDS & PRIOR SEMESTER CALCULATOR */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-[#002D62] tracking-wider">Scholastic Records</h3>
                  <div className="bg-orange-500 text-white font-bold text-xs px-3 py-1 rounded-lg">
                    Auto CGPA: {computedCgpa}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Board of Affiliation *</label>
                    <select 
                      value={formData.boardOfStudy} onChange={(e) => { setFormData({...formData, boardOfStudy: e.target.value}); setErrors(p => { const n={...p}; delete n.boardOfStudy; return n; })} }
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.boardOfStudy ? 'border-red-500' : 'border-slate-200'}`}
                    >
                      <option value="">Select Board</option>
                      <option value="State Board">State Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                    </select>
                    {errors.boardOfStudy && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.boardOfStudy}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Graduation Standing *</label>
                    <select 
                      value={formData.graduationStanding} onChange={(e) => { setFormData({...formData, graduationStanding: e.target.value}); setErrors(p => { const n={...p}; delete n.graduationStanding; return n; })} }
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.graduationStanding ? 'border-red-500' : 'border-slate-200'}`}
                    >
                      <option value="">Select Standing</option>
                      <option value="UG">Undergraduate (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                    </select>
                    {errors.graduationStanding && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.graduationStanding}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">10th Score (%) *</label>
                    <input 
                      type="text" placeholder="e.g. 76.5" value={formData.tenthPercentage} 
                      onChange={(e) => handlePercentageChange('tenthPercentage', e.target.value)}
                      className="w-full mt-1 p-2.5 border text-sm rounded-xl border-slate-200 focus:outline-none"
                    />
                    {errors.tenthPercentage && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.tenthPercentage}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">10th School Name *</label>
                    <input 
                      type="text" placeholder="School Location" value={formData.tenthSchoolName} 
                      onChange={(e) => { setFormData({...formData, tenthSchoolName: e.target.value}); setErrors(p => { const n={...p}; delete n.tenthSchoolName; return n; }); }}
                      className="w-full mt-1 p-2.5 border text-sm rounded-xl border-slate-200 focus:outline-none"
                    />
                    {errors.tenthSchoolName && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.tenthSchoolName}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">12th Score (%)</label>
                    <input 
                      type="text" placeholder="e.g. 76.5" value={formData.twelfthPercentage} 
                      onChange={(e) => handlePercentageChange('twelfthPercentage', e.target.value)}
                      className="w-full mt-1 p-2.5 border text-sm rounded-xl border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">12th / Diploma School Name</label>
                    <input 
                      type="text" placeholder="School/Polytechnic name" value={formData.twelfthDiplomaSchoolName} 
                      onChange={(e) => setFormData({...formData, twelfthDiplomaSchoolName: e.target.value})}
                      className="w-full mt-1 p-2.5 border text-sm rounded-xl border-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Semester Tracker Matrix (Strictly locked to < 10.00 entries) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wide mb-1">Prior Semester SGPA Log</h4>
                  
                  {completedSemsCount > 0 ? (
                    <>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Based on your year selection, input your GPA scores for completed semesters 1 to {completedSemsCount} (Max scale value 10):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, idx) => {
                          const isNeeded = idx < completedSemsCount;
                          return (
                            <div key={idx} className="flex flex-col gap-1">
                              <label className={`text-[10px] font-bold text-center ${isNeeded ? 'text-slate-500' : 'text-slate-300'}`}>
                                Sem {idx + 1}
                              </label>
                              <input 
                                type="text" 
                                placeholder="0.00" 
                                value={formData.sgpaSemesterValues[idx]} 
                                disabled={!isNeeded}
                                onChange={(e) => handleSemesterChange(idx, e.target.value)}
                                className={`w-full p-2 text-center text-sm border rounded-xl focus:outline-none transition-all ${!isNeeded ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-slate-100' : 'bg-white border-slate-200 focus:border-[#002D62] font-semibold text-slate-800 shadow-sm'}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-orange-500 font-medium">
                      ℹ️ Setup detects you are in Semester 1. No previous semester inputs needed.
                    </p>
                  )}
                  {errors.sgpaMatrix && <p className="text-red-500 text-xs mt-3 font-semibold">⚠️ {errors.sgpaMatrix}</p>}
                </div>
              </div>
            )}

            {/* Navigation Tray */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              {step > 1 && (
                <button 
                  type="button" onClick={() => setStep(step - 1)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-all"
                >
                  &larr; Back
                </button>
              )}
              <button 
                type="submit"
                className="flex-1 bg-[#002D62] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#001c3d] transition-all"
              >
                {step === 3 ? 'Complete Profile Setup' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthBackground>
  );
}