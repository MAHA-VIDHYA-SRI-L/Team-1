import React, { useState, useMemo, useEffect } from 'react';
import AuthBackground from './ui/AuthBackground';
import type { StudentProfileData } from '../types/profile';

interface StudentProfileWizardProps {
  onComplete: (completedData: StudentProfileData) => void;
  initialEmail: string;
  initialName?: string;
  initialRegsNumber?: string;
  initialPhone?: string;
}

const DEPARTMENTS = ['CSE','MECH','ECE','BIO MEDICAL','IT','AUTO MOBILE','SFE','EEE','AIDS','MBA','MCA'];
const YEARS = ['I year', 'II year', 'III year', 'IV year'];
const BOARDS = ['State Board', 'CBSE', 'ICSE'];
const STANDINGS = ['UG', 'PG'] as const;

export default function StudentProfileWizard({ 
  onComplete, 
  initialEmail,
  initialName = '',
  initialRegsNumber = '',
  initialPhone = '',
}: StudentProfileWizardProps) {
  
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [secondaryEducation, setSecondaryEducation] = useState<'twelfth' | 'diploma'>('twelfth');
  
  const [formData, setFormData] = useState<StudentProfileData>(() => {
    const savedState = sessionStorage.getItem('studentWizardState');
    if (savedState) {
      try { 
        return { 
          ...JSON.parse(savedState), 
          name: initialName, 
          regsNumber: initialRegsNumber, 
          email: initialEmail,
          phone: JSON.parse(savedState).phone || initialPhone,
        }; 
      } catch (e) { 
        console.error('Failed to parse saved state', e); 
      }
    }
    return {
      name: initialName, 
      dob: '',
      regsNumber: initialRegsNumber,
      email: initialEmail, 
      department: '', 
      year: '', 
      semesterTerm: '',
      currentSemester: '', 
      yearOfStudy: '', 
      passOutYear: '', 
      phone: initialPhone, 
      alternativePhone: '', 
      address: '', 
      isOtherState: false, 
      stateName: 'Tamil Nadu', 
      pinCode: '', 
      district: '',
      linkedinUrl: '',
      boardOfStudy: '', 
      graduationStanding: '', 
      tenthPercentage: '', 
      tenthSchool: '', 
      twelfthPercentage: '', 
      twelfthSchool: '', 
      diplomaPercentage: '',
      diplomaInstitution: '',
      ugCollegeName: '',
      ugCgpa: '',
      pgCollegeName: '',
      pgCgpa: '0.00',
      finalCgpa: '0.00',
      sgpaSemesterValues: Array(8).fill(''),
      profileCreatedDate: new Date().toISOString(),
      profileUpdatedDate: new Date().toISOString()
    };
  });

  useEffect(() => {
    let changed = false;
    const updates: Partial<StudentProfileData> = {};

    const entryYear = parseInt(formData.yearOfStudy);
    if (!isNaN(entryYear) && formData.yearOfStudy.length === 4) {
      const calculatedPassOut = (entryYear + 4).toString();
      if (formData.passOutYear !== calculatedPassOut) {
        updates.passOutYear = calculatedPassOut;
        changed = true;
      }
    } else if (formData.passOutYear !== '') {
      updates.passOutYear = '';
      changed = true;
    }

    let calculatedSem = '';
    if (formData.year && formData.semesterTerm) {
      let baseSem = formData.year === 'I year' ? 1 : formData.year === 'II year' ? 3 : formData.year === 'III year' ? 5 : formData.year === 'IV year' ? 7 : 0;
      calculatedSem = formData.semesterTerm === 'Odd' ? baseSem.toString() : (baseSem + 1).toString();
    }
    
    if (formData.currentSemester !== calculatedSem) {
      updates.currentSemester = calculatedSem;
      changed = true;
    }

    if (changed) {
      setFormData(prev => {
        const next = { ...prev, ...updates };
        sessionStorage.setItem('studentWizardState', JSON.stringify(next));
        return next;
      });
    } else {
      sessionStorage.setItem('studentWizardState', JSON.stringify(formData));
    }
  }, [formData.year, formData.semesterTerm, formData.yearOfStudy, formData.passOutYear, formData.currentSemester]);

  const completedSemsCount = useMemo(() => {
    const semNum = parseInt(formData.currentSemester);
    return isNaN(semNum) || semNum <= 1 ? 0 : semNum - 1; 
  }, [formData.currentSemester]);

  const dynamicPercentage = useMemo(() => {
    const baseFields = [
      formData.name, formData.dob, formData.department, formData.year, formData.semesterTerm, formData.currentSemester, 
      formData.regsNumber, formData.yearOfStudy, formData.passOutYear,
      formData.email, formData.phone, formData.linkedinUrl,
      formData.address, formData.stateName, formData.district, formData.pinCode,
      formData.boardOfStudy, formData.graduationStanding, formData.tenthPercentage
    ];
    let filledCount = baseFields.filter(val => typeof val === 'string' ? val.trim() !== '' : !!val).length;
    let totalFieldsCount = baseFields.length;

    const optionalFields = [
      formData.alternativePhone, formData.tenthSchool, formData.twelfthPercentage, formData.twelfthSchool, formData.diplomaPercentage
    ];
    const filledOptionals = optionalFields.filter(v => typeof v === 'string' && v.trim() !== '').length;
    filledCount += filledOptionals;
    totalFieldsCount += optionalFields.length;

    if (formData.graduationStanding === 'PG' && formData.ugCgpa) {
      filledCount += 1;
      totalFieldsCount += 1;
    }

    if (completedSemsCount > 0) {
      totalFieldsCount += completedSemsCount;
      filledCount += formData.sgpaSemesterValues.slice(0, completedSemsCount).filter(v => v.trim() !== '').length;
    }
    return Math.min(100, Math.round((filledCount / totalFieldsCount) * 100));
  }, [formData, completedSemsCount]);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dynamicPercentage / 100) * circumference;

  const computedCgpa = useMemo(() => {
    const validScores = formData.sgpaSemesterValues.slice(0, completedSemsCount).map(v => parseFloat(v)).filter(num => !isNaN(num) && num <= 10 && num > 0);
    return validScores.length === 0 ? '0.00' : (validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length).toFixed(2);
  }, [formData.sgpaSemesterValues, completedSemsCount]);

  useEffect(() => {
    const isPG = formData.graduationStanding === 'PG';
    const updates: Partial<StudentProfileData> = {};
    if (isPG && formData.pgCgpa !== computedCgpa) updates.pgCgpa = computedCgpa;
    if (!isPG && formData.finalCgpa !== computedCgpa) updates.finalCgpa = computedCgpa;
    if (Object.keys(updates).length > 0) setFormData(prev => ({ ...prev, ...updates }));
  }, [computedCgpa, formData.finalCgpa, formData.pgCgpa, formData.graduationStanding]);

  const handleDigitFilterChange = (field: keyof StudentProfileData, val: string, maxLength: number) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length <= maxLength) {
      setFormData(prev => ({ ...prev, [field]: digitsOnly }));
      setErrors(prev => { const next = { ...prev }; delete next[field as string]; return next; });
    }
  };

  const handleDobTextFilterChange = (val: string) => {
    setFormData(prev => ({ ...prev, dob: val.replace(/[^0-9\-/]/g, '') }));
    setErrors(prev => { const next = { ...prev }; delete next.dob; return next; });
  };

  const handlePercentageChange = (field: keyof StudentProfileData, val: string) => {
    if (val === '' || /^\d{0,3}(\.\d{0,2})?$/.test(val)) {
      if (!isNaN(parseFloat(val)) && parseFloat(val) > 100) return;
      setFormData(prev => ({ ...prev, [field]: val }));
      setErrors(prev => { const next = { ...prev }; delete next[field as string]; return next; });
    }
  };

  const handleSemesterChange = (index: number, value: string) => {
    if (value === '' || /^\d{0,2}(\.\d{0,2})?$/.test(value)) {
      if (!isNaN(parseFloat(value)) && parseFloat(value) > 10) return;
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
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.department) newErrors.department = 'Department selection is required';
      if (!formData.year) newErrors.year = 'Year level is required';
      if (!formData.semesterTerm) newErrors.semesterTerm = 'Academic term selection is required';
      if (formData.yearOfStudy.length !== 4) newErrors.yearOfStudy = 'Academic Year Entry must be 4 digits';
    }

    if (step === 2) {
      if (!formData.phone || formData.phone.length !== 10) {
        if (!initialPhone) newErrors.phone = 'Active phone contact must be exactly 10 digits';
      }
      if (formData.alternativePhone && formData.alternativePhone.length !== 10) {
        newErrors.alternativePhone = 'Alternative phone must be exactly 10 digits';
      }
      if (!formData.linkedinUrl.trim()) {
        newErrors.linkedinUrl = 'LinkedIn profile URL is required';
      } else {
        const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
        if (!linkedinRegex.test(formData.linkedinUrl)) {
          newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL';
        }
      }
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (formData.isOtherState && !formData.stateName.trim()) newErrors.stateName = 'State name is required';
      if (!formData.district.trim()) newErrors.district = 'District is required';
      if (!formData.pinCode || formData.pinCode.length !== 6) {
        newErrors.pinCode = 'Pincode must be exactly 6 digits';
      }
    }

    if (Object.keys(newErrors).length > 0) setErrors(newErrors); else { setErrors({}); setStep(prev => prev + 1); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.boardOfStudy) newErrors.boardOfStudy = 'Board selection is required';
    if (!formData.graduationStanding) newErrors.graduationStanding = 'Graduation track choice is required';
    if (!formData.ugCollegeName.trim()) newErrors.ugCollegeName = 'UG college name is required';
    if (!formData.tenthPercentage) newErrors.tenthPercentage = '10th Percentage score is required';
    if (!formData.tenthSchool.trim()) newErrors.tenthSchool = '10th school name is required';
    if (secondaryEducation === 'twelfth') {
      if (!formData.twelfthPercentage) newErrors.twelfthPercentage = '12th percentage is required';
      if (!formData.twelfthSchool.trim()) newErrors.twelfthSchool = '12th school name is required';
    } else {
      if (!formData.diplomaPercentage) newErrors.diplomaPercentage = 'Diploma percentage is required';
      if (!formData.diplomaInstitution.trim()) newErrors.diplomaInstitution = 'Diploma institution is required';
    }
    if (formData.graduationStanding === 'PG' && !formData.pgCollegeName.trim()) {
      newErrors.pgCollegeName = 'PG college name is required';
    }

    if (completedSemsCount > 0) {
      const activeSemsFilled = formData.sgpaSemesterValues.slice(0, completedSemsCount).filter(v => v !== '').length;
      if (activeSemsFilled < completedSemsCount) {
        newErrors.sgpaMatrix = `Please enter scores for all ${completedSemsCount} completed semester(s).`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      sessionStorage.removeItem('studentWizardState');
      const finalData = { 
        ...formData, 
        profileUpdatedDate: new Date().toISOString(),
        ugCgpa: computedCgpa !== '0.00' ? computedCgpa : (formData.ugCgpa || ''),
        finalCgpa: formData.graduationStanding !== 'PG'
          ? (computedCgpa !== '0.00' ? computedCgpa : (formData.ugCgpa || ''))
          : (computedCgpa !== '0.00' ? computedCgpa : (formData.pgCgpa || '')),
        // Clear fields not applicable to chosen secondary education type
        twelfthPercentage: secondaryEducation === 'twelfth' ? formData.twelfthPercentage : '',
        twelfthSchool: secondaryEducation === 'twelfth' ? formData.twelfthSchool : '',
        diplomaPercentage: secondaryEducation === 'diploma' ? formData.diplomaPercentage : '',
        diplomaInstitution: secondaryEducation === 'diploma' ? formData.diplomaInstitution : '',
      };
      if (finalData.graduationStanding !== 'PG') {
        finalData.pgCollegeName = '';
        finalData.pgCgpa = '0.00';
      }
      onComplete(finalData);
    }
  };

  return (
    <AuthBackground layout="centered">
      <div className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 md:p-8 z-10 relative my-auto">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Complete Your Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3 — Setup your student workstation context</p>
            </div>

            <div 
              className="relative flex items-center justify-center h-14 w-14 flex-shrink-0"
              role="progressbar" 
              aria-valuenow={dynamicPercentage} 
              aria-valuemin={0} 
              aria-valuemax={100}
            >
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r={radius} className="text-slate-100" strokeWidth="4px" stroke="currentColor" fill="transparent" />
                <circle
                  cx="28" cy="28" r={radius}
                  className="text-[#002D62] transition-all duration-300 ease-out"
                  strokeWidth="4px" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" stroke="currentColor" fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center" aria-hidden="true">
                <span className="text-[11px] font-extrabold text-slate-700 leading-none">{dynamicPercentage}%</span>
                <span className="text-[7px] uppercase tracking-wider text-slate-400 mt-0.5 font-bold">Done</span>
              </div>
            </div>
          </div>

          <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#002D62] tracking-wider mb-2">Basic Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Name (Registered)</label>
                    <input type="text" value={formData.name} disabled className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-500 cursor-not-allowed font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Register Number (Registered)</label>
                    <input type="text" value={formData.regsNumber} disabled className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-500 cursor-not-allowed font-medium" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Date of Birth *</label>
                    <input type="date" value={formData.dob} onChange={(e) => handleDobTextFilterChange(e.target.value)} className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none focus:border-[#002D62] ${errors.dob ? 'border-red-500' : 'border-slate-200'}`} />
                    {errors.dob && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.dob}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Department *</label>
                    <select value={formData.department} onChange={(e) => { setFormData({...formData, department: e.target.value}); setErrors(p => { const n={...p}; delete n.department; return n; }); }} className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.department ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`}>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.department}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Year of Study *</label>
                    <select value={formData.year} onChange={(e) => { setFormData({...formData, year: e.target.value}); setErrors(p => { const n={...p}; delete n.year; return n; }); }} className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.year ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`}>
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {errors.year && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.year}</p>}
                  </div>
                  <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-xs font-semibold text-slate-500">Current Academic Term *</label>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center text-sm gap-2 font-medium text-slate-700 cursor-pointer"><input type="radio" name="semesterTerm" value="Odd" checked={formData.semesterTerm === 'Odd'} onChange={() => { setFormData({...formData, semesterTerm: 'Odd'}); setErrors(p => { const n={...p}; delete n.semesterTerm; return n; }); }} className="w-4 h-4 text-[#002D62]" /> Odd Term (Jul-Dec)</label>
                      <label className="flex items-center text-sm gap-2 font-medium text-slate-700 cursor-pointer"><input type="radio" name="semesterTerm" value="Even" checked={formData.semesterTerm === 'Even'} onChange={() => { setFormData({...formData, semesterTerm: 'Even'}); setErrors(p => { const n={...p}; delete n.semesterTerm; return n; }); }} className="w-4 h-4 text-[#002D62]" /> Even Term (Jan-Jun)</label>
                    </div>
                    {errors.semesterTerm && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.semesterTerm}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Academic Entry Year (4 Digits) *</label>
                    <input type="text" placeholder="e.g. 2024" value={formData.yearOfStudy} onChange={(e) => handleDigitFilterChange('yearOfStudy', e.target.value, 4)} className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.yearOfStudy ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`} />
                    {errors.yearOfStudy && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.yearOfStudy}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Current Semester</label>
                    <input type="text" value={formData.currentSemester ? `Semester ${formData.currentSemester}` : 'Awaiting Inputs'} disabled className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl cursor-not-allowed" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Expected Graduation Pass Out Year</label>
                    <input type="text" value={formData.passOutYear || 'Awaiting Entry Year'} disabled className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#002D62] tracking-wider mb-2">Communication Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Email Address (Registered)</label>
                    <input type="text" value={formData.email} disabled className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-500 cursor-not-allowed font-medium" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">LinkedIn Profile Link *</label>
                    <input type="text" placeholder="https://www.linkedin.com/in/username" value={formData.linkedinUrl} onChange={(e) => { setFormData({...formData, linkedinUrl: e.target.value}); setErrors(p => { const n={...p}; delete n.linkedinUrl; return n; }); }} className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.linkedinUrl ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`} />
                    {errors.linkedinUrl && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.linkedinUrl}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Phone Number {initialPhone ? '(Registered)' : '*'}</label>
                    {initialPhone ? (
                      <input type="text" value={formData.phone} disabled className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl text-slate-500 cursor-not-allowed font-medium" />
                    ) : (
                      <>
                        <input type="text" value={formData.phone} onChange={(e) => handleDigitFilterChange('phone', e.target.value, 10)} className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.phone ? 'border-red-500' : 'border-slate-200'}`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.phone}</p>}
                      </>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Alternative Phone</label>
                    <input type="text" value={formData.alternativePhone} onChange={(e) => handleDigitFilterChange('alternativePhone', e.target.value, 10)} className="w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none border-slate-200" />
                    {errors.alternativePhone && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.alternativePhone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Address *</label>
                    <textarea value={formData.address} onChange={(e) => { setFormData({...formData, address: e.target.value}); setErrors(p => { const n={...p}; delete n.address; return n; }); }} className={`w-full mt-1 p-2.5 border text-sm rounded-xl h-20 resize-none focus:outline-none ${errors.address ? 'border-red-500' : 'border-slate-200'}`} />
                    {errors.address && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.address}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">State *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center text-sm gap-1.5 font-medium text-slate-600"><input type="radio" checked={!formData.isOtherState} onChange={() => setFormData({...formData, isOtherState: false, stateName: 'Tamil Nadu'})} /> Tamil Nadu</label>
                      <label className="flex items-center text-sm gap-1.5 font-medium text-slate-600"><input type="radio" checked={formData.isOtherState} onChange={() => setFormData({...formData, isOtherState: true, stateName: ''})} /> Other State</label>
                    </div>
                    {formData.isOtherState && <input type="text" placeholder="Enter state name" value={formData.stateName} onChange={(e) => { setFormData({...formData, stateName: e.target.value}); setErrors(p => { const n={...p}; delete n.stateName; return n; }); }} className={`w-full mt-2 p-2 border text-sm rounded-xl ${errors.stateName ? 'border-red-500' : 'border-slate-200'}`} />}
                    {errors.stateName && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.stateName}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">District *</label>
                    <input type="text" value={formData.district} onChange={(e) => { const v = e.target.value; if (v === '' || /^[A-Za-z\s]+$/.test(v)) { setFormData({...formData, district: v}); setErrors(p => { const n={...p}; delete n.district; return n; }); } }} className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.district ? 'border-red-500' : 'border-slate-200'}`} />
                    {errors.district && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.district}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Pin Code *</label>
                    <input type="text" value={formData.pinCode} onChange={(e) => handleDigitFilterChange('pinCode', e.target.value, 6)} className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.pinCode ? 'border-red-500' : 'border-slate-200'}`} />
                    {errors.pinCode && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.pinCode}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-[#002D62] tracking-wider">Scholastic Records</h3>
                  <div className="bg-orange-500 text-white font-bold text-xs px-3 py-1 rounded-lg">Auto CGPA: {computedCgpa}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Board of Affiliation *</label>
                    <select value={formData.boardOfStudy} onChange={(e) => { setFormData({...formData, boardOfStudy: e.target.value}); setErrors(p => { const n={...p}; delete n.boardOfStudy; return n; })} } className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.boardOfStudy ? 'border-red-500' : 'border-slate-200'}`}>
                      <option value="">Select Board</option>
                      {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.boardOfStudy && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.boardOfStudy}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Graduation Standing *</label>
                    <select value={formData.graduationStanding} onChange={(e) => { const val = e.target.value as 'UG' | 'PG' | ''; setFormData({...formData, graduationStanding: val}); setErrors(p => { const n={...p}; delete n.graduationStanding; return n; })} } className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.graduationStanding ? 'border-red-500' : 'border-slate-200'}`}>
                      <option value="">Select Standing</option>
                      {STANDINGS.map(s => <option key={s} value={s}>{s === 'UG' ? 'Undergraduate (UG)' : 'Postgraduate (PG)'}</option>)}
                    </select>
                    {errors.graduationStanding && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.graduationStanding}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">UG College Name *</label>
                    <input type="text" placeholder="e.g. Anna University" value={formData.ugCollegeName}
                      onChange={(e) => { setFormData({...formData, ugCollegeName: e.target.value}); setErrors(p => { const n={...p}; delete n.ugCollegeName; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.ugCollegeName ? 'border-red-500' : 'border-slate-200 focus:border-[#002D62]'}`}
                    />
                    {errors.ugCollegeName && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.ugCollegeName}</p>}
                  </div>

                  {formData.graduationStanding === 'PG' && (
                    <div className="sm:col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 space-y-3">
                      <p className="text-xs font-bold text-[#002D62] uppercase tracking-wide">Postgraduate Details</p>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">PG College Name *</label>
                        <input type="text" placeholder="e.g. IIT Madras" value={formData.pgCollegeName}
                          onChange={(e) => { setFormData({...formData, pgCollegeName: e.target.value}); setErrors(p => { const n={...p}; delete n.pgCollegeName; return n; }); }}
                          className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none focus:border-[#002D62] ${errors.pgCollegeName ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {errors.pgCollegeName && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.pgCollegeName}</p>}
                      </div>
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <span className="text-xs font-semibold text-slate-500">PG CGPA (auto-computed from SGPA)</span>
                        <span className="text-sm font-black text-[#002D62]">{computedCgpa}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-500">10th Score (%) *</label>
                    <input type="text" placeholder="e.g. 76.5" value={formData.tenthPercentage} onChange={(e) => handlePercentageChange('tenthPercentage', e.target.value)} className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.tenthPercentage ? 'border-red-500' : 'border-slate-200'}`} />
                    {errors.tenthPercentage && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.tenthPercentage}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">10th School Name *</label>
                    <input type="text" placeholder="School name" value={formData.tenthSchool}
                      onChange={(e) => { const v = e.target.value; if (v === '' || /^[A-Za-z\s.,'()-]+$/.test(v)) { setFormData({...formData, tenthSchool: v}); setErrors(p => { const n={...p}; delete n.tenthSchool; return n; }); } }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.tenthSchool ? 'border-red-500' : 'border-slate-200'}`} />
                    {errors.tenthSchool && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.tenthSchool}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Secondary Education Type *</label>
                    <div className="flex gap-3 mt-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                        <input type="radio" checked={secondaryEducation === 'twelfth'} onChange={() => setSecondaryEducation('twelfth')} className="w-4 h-4 text-[#002D62]" /> 12th (HSC)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                        <input type="radio" checked={secondaryEducation === 'diploma'} onChange={() => setSecondaryEducation('diploma')} className="w-4 h-4 text-[#002D62]" /> Diploma
                      </label>
                    </div>
                  </div>

                  {secondaryEducation === 'twelfth' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">12th Score (%) *</label>
                        <input type="text" placeholder="e.g. 76.5" value={formData.twelfthPercentage} onChange={(e) => handlePercentageChange('twelfthPercentage', e.target.value)} className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.twelfthPercentage ? 'border-red-500' : 'border-slate-200'}`} />
                        {errors.twelfthPercentage && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.twelfthPercentage}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">12th School Name *</label>
                        <input type="text" placeholder="School name" value={formData.twelfthSchool}
                          onChange={(e) => { const v = e.target.value; if (v === '' || /^[A-Za-z\s.,'()-]+$/.test(v)) { setFormData({...formData, twelfthSchool: v}); setErrors(p => { const n={...p}; delete n.twelfthSchool; return n; }); } }}
                          className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.twelfthSchool ? 'border-red-500' : 'border-slate-200'}`} />
                        {errors.twelfthSchool && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.twelfthSchool}</p>}
                      </div>
                    </>
                  )}

                  {secondaryEducation === 'diploma' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">Diploma Score (%) *</label>
                        <input type="text" placeholder="e.g. 76.5" value={formData.diplomaPercentage} onChange={(e) => handlePercentageChange('diplomaPercentage', e.target.value)} className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.diplomaPercentage ? 'border-red-500' : 'border-slate-200'}`} />
                        {errors.diplomaPercentage && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.diplomaPercentage}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">Diploma Institution *</label>
                        <input type="text" placeholder="Institution name" value={formData.diplomaInstitution}
                          onChange={(e) => { setFormData({...formData, diplomaInstitution: e.target.value}); setErrors(p => { const n={...p}; delete n.diplomaInstitution; return n; }); }}
                          className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.diplomaInstitution ? 'border-red-500' : 'border-slate-200'}`} />
                        {errors.diplomaInstitution && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.diplomaInstitution}</p>}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wide mb-1">Prior Semester SGPA Log</h4>
                  {completedSemsCount > 0 ? (
                    <>
                      <p className="text-[11px] text-slate-400 mb-3">Input your GPA scores for completed semesters 1 to {completedSemsCount}:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, idx) => {
                          const isNeeded = idx < completedSemsCount;
                          return (
                            <div key={idx} className="flex flex-col gap-1">
                              <label className={`text-[10px] font-bold text-center ${isNeeded ? 'text-slate-500' : 'text-slate-300'}`}>Sem {idx + 1}</label>
                              <input type="text" placeholder="0.00" value={formData.sgpaSemesterValues[idx]} disabled={!isNeeded} onChange={(e) => handleSemesterChange(idx, e.target.value)} className={`w-full p-2 text-center text-sm border rounded-xl focus:outline-none transition-all ${!isNeeded ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-slate-100' : 'bg-white border-slate-200 focus:border-[#002D62] font-semibold text-slate-800 shadow-sm'}`} />
                            </div>
                          );
                        })}
                      </div>
                      {errors.sgpaMatrix && <p className="text-red-500 text-xs mt-2 font-semibold">⚠️ {errors.sgpaMatrix}</p>}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400 text-center py-1">No prior semesters to log for Semester 1 students.</p>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">Current CGPA (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 8.50"
                          value={formData.ugCgpa}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '' || /^\d{0,2}(\.\d{0,2})?$/.test(v)) {
                              if (!isNaN(parseFloat(v)) && parseFloat(v) > 10) return;
                              setFormData(prev => ({ ...prev, ugCgpa: v }));
                            }
                          }}
                          className="w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none border-slate-200 focus:border-[#002D62]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setStep(p => Math.max(1, p - 1))} disabled={step === 1} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">Back</button>
              <button type="submit" className="px-6 py-2.5 text-xs font-bold text-white bg-[#002D62] hover:bg-[#001f42] rounded-xl shadow-lg transition-all">{step === 3 ? 'Save & Finish Setup' : 'Continue Step'}</button>
            </div>
          </form>
        </div>
      </div>
    </AuthBackground>
  );
}