<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { Camera, User, Phone, GraduationCap, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface WizardProps {
  onComplete: (finalData: any) => void;
}

export default function StudentProfileWizard({ onComplete }: WizardProps) {
  const [step, setStep] = useState(1);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // --- STEP 1: BASIC DETAILS STATE ---
  const [basicDetails, setBasicDetails] = useState({
    name: '',
    regNo: '',
    dob: '',
    yearOfStudy: '', // e.g., 1st Year, 2nd Year, etc.
    branch: '',      // e.g., CSE, ECE, IT
    passOutYear: '',
  });

  // --- STEP 2: CONTACT DETAILS STATE ---
  const [contactDetails, setContactDetails] = useState({
    address: '',
    email: '',
    contactNumber: '',
    altContactNumber: '', // Extra relevant contact field
    linkedinUrl: '',       // Extra relevant contact field
  });

  // --- STEP 3: ACADEMIC DETAILS STATE ---
  const [academicDetails, setAcademicDetails] = useState({
    tenthPercentage: '',
    tenthSchool: '',
    twelfthPercentage: '',
    twelfthSchool: '',
    boardType: 'State', 
    degreeType: 'UG',   
    ugCgpaForPg: '',    
  });

  const [semesters, setSemesters] = useState<string[]>(Array(8).fill(''));
  const [calculatedCgpa, setCalculatedCgpa] = useState('0.00');

  // --- LIVE CGPA ENGINE ---
  useEffect(() => {
    const validMarks = semesters.map(val => parseFloat(val)).filter(num => !isNaN(num) && num >= 0);
    if (validMarks.length > 0) {
      const sum = validMarks.reduce((acc, curr) => acc + curr, 0);
      setCalculatedCgpa((sum / validMarks.length).toFixed(2));
    } else {
      setCalculatedCgpa('0.00');
    }
  }, [semesters]);

  // --- STEP VALIDATION LOGIC ---
  const getMissingBasicFields = () => {
    const missing: string[] = [];
    if (!basicDetails.name.trim()) missing.push('Full Name');
    if (!basicDetails.regNo.trim()) missing.push('Register Number');
    if (!basicDetails.dob) missing.push('Date of Birth');
    if (!basicDetails.yearOfStudy) missing.push('Year of Study');
    if (!basicDetails.branch.trim()) missing.push('Branch/Department');
    if (!basicDetails.passOutYear.trim()) missing.push('Passout Year');
    return missing;
  };

  const getMissingContactFields = () => {
    const missing: string[] = [];
    if (!contactDetails.address.trim()) missing.push('Permanent Address');
    if (!contactDetails.email.trim() || !contactDetails.email.includes('@')) missing.push('Valid Email Address');
    if (!contactDetails.contactNumber.trim() || contactDetails.contactNumber.length < 10) missing.push('Valid 10-Digit Contact Number');
    return missing;
  };

  const getMissingAcademicFields = () => {
    const missing: string[] = [];
    if (!academicDetails.tenthPercentage) missing.push('10th Percentage');
    if (!academicDetails.tenthSchool.trim()) missing.push('10th School Name');
    if (!academicDetails.twelfthPercentage) missing.push('12th Percentage');
    if (!academicDetails.twelfthSchool.trim()) missing.push('12th School Name');
    if (academicDetails.degreeType === 'PG' && !academicDetails.ugCgpaForPg) missing.push('Prior UG CGPA');
    return missing;
  };

  // Validation Status Flags
  const isStep1Valid = getMissingBasicFields().length === 0;
  const isStep2Valid = getMissingContactFields().length === 0;
  const isStep3Valid = getMissingAcademicFields().length === 0;

  // --- DYNAMIC PROGRESS SYSTEM ---
  const calculateProgress = () => {
    if (step === 1) return 33;
    if (step === 2) return 66;
    return 100;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep3Valid) return;

    onComplete({
      profilePic,
      ...basicDetails,
      ...contactDetails,
      ...academicDetails,
      semesterMarks: semesters.filter(s => s !== ''),
      finalCgpa: calculatedCgpa,
      profileCreatedDate: new Date().toLocaleDateString(),
      profileUpdatedDate: new Date().toLocaleDateString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* TOP STATUS HEADER BAR */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group h-16 w-16 rounded-full bg-slate-100 border-2 border-[#002D62] flex items-center justify-center overflow-hidden shrink-0">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-slate-400" />
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="h-4 w-4 text-white" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#002D62]">Setup Profile Pipeline</h2>
              <p className="text-xs text-slate-400 font-medium">Step {step} of 3 — Profiles must be verified complete</p>
            </div>
          </div>

          {/* Graphical Percentage Status Wheel */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">
            <span className="text-sm font-black text-orange-500">{calculateProgress()}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Done</span>
          </div>
        </div>

        {/* WORKSPACE CONTENT AREA */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* ================= STEP 1: BASIC DETAILS ================= */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-[#002D62]">
                <User className="h-4 w-4 text-orange-500" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Primary Basic Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Full Name *</label>
                  <input type="text" value={basicDetails.name} onChange={e => setBasicDetails({...basicDetails, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-medium" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Register Number *</label>
                  <input type="text" value={basicDetails.regNo} onChange={e => setBasicDetails({...basicDetails, regNo: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-medium" placeholder="e.g., 731624CS021" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Date of Birth *</label>
                  <input type="date" value={basicDetails.dob} onChange={e => setBasicDetails({...basicDetails, dob: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-medium" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Year of Study *</label>
                  <select value={basicDetails.yearOfStudy} onChange={e => setBasicDetails({...basicDetails, yearOfStudy: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-medium">
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Branch / Department *</label>
                  <input type="text" value={basicDetails.branch} onChange={e => setBasicDetails({...basicDetails, branch: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-medium" placeholder="e.g., CSE" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Passout Year *</label>
                  <input type="number" value={basicDetails.passOutYear} onChange={e => setBasicDetails({...basicDetails, passOutYear: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-medium" placeholder="e.g., 2028" />
                </div>
              </div>

              {/* Step 1 Error Alerts */}
              {!isStep1Valid && (
                <div className="bg-red-50 text-red-600 rounded-xl p-3 flex gap-2 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>Missing mandatory fields: {getMissingBasicFields().join(', ')}</div>
                </div>
              )}

              {isStep1Valid && (
                <button type="button" onClick={() => setStep(2)} className="w-full py-2.5 bg-[#002D62] hover:bg-[#062447] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-4">
                  <span>Continue to Contact Info</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* ================= STEP 2: CONTACT DETAILS ================= */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-[#002D62]">
                <Phone className="h-4 w-4 text-orange-500" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Communication & Contact Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Email Address *</label>
                  <input type="email" value={contactDetails.email} onChange={e => setContactDetails({...contactDetails, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-medium" placeholder="studentname@college.edu" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Contact Number *</label>
                    <input type="tel" value={contactDetails.contactNumber} onChange={e => setContactDetails({...contactDetails, contactNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-medium" placeholder="Primary mobile phone" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Alternative Contact Number</label>
                    <input type="tel" value={contactDetails.altContactNumber} onChange={e => setContactDetails({...contactDetails, altContactNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-medium" placeholder="Parent or secondary mobile" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">LinkedIn Profile URL</label>
                  <input type="url" value={contactDetails.linkedinUrl} onChange={e => setContactDetails({...contactDetails, linkedinUrl: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-medium" placeholder="https://linkedin.com/in/username" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Permanent Residential Address *</label>
                  <textarea rows={2} value={contactDetails.address} onChange={e => setContactDetails({...contactDetails, address: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-medium" placeholder="Full door number, street, city and pin code" />
                </div>
              </div>

              {/* Step 2 Error Alerts */}
              {!isStep2Valid && (
                <div className="bg-red-50 text-red-600 rounded-xl p-3 flex gap-2 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>Missing mandatory fields: {getMissingContactFields().join(', ')}</div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl flex items-center justify-center gap-1 transition-all">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                {isStep2Valid && (
                  <button type="button" onClick={() => setStep(3)} className="w-2/3 py-2.5 bg-[#002D62] hover:bg-[#062447] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                    <span>Continue to Academics</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 3: ACADEMIC DETAILS ================= */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-[#002D62]">
                <GraduationCap className="h-4 w-4 text-orange-500" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Scholastic & Transcript Records</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Board of Affiliation</label>
                  <select value={academicDetails.boardType} onChange={e => setAcademicDetails({...academicDetails, boardType: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-bold text-slate-700">
                    <option value="State">State Board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="International">International Board (IB/IGCSE)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Graduation Standing</label>
                  <select value={academicDetails.degreeType} onChange={e => setAcademicDetails({...academicDetails, degreeType: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-bold text-slate-700">
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">10th Score (%) *</label>
                  <input type="number" value={academicDetails.tenthPercentage} onChange={e => setAcademicDetails({...academicDetails, tenthPercentage: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="Percentage" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">10th School Name *</label>
                  <input type="text" value={academicDetails.tenthSchool} onChange={e => setAcademicDetails({...academicDetails, tenthSchool: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="School name location" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">12th / Diploma Score (%) *</label>
                  <input type="number" value={academicDetails.twelfthPercentage} onChange={e => setAcademicDetails({...academicDetails, twelfthPercentage: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="Percentage" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">12th / Diploma School *</label>
                  <input type="text" value={academicDetails.twelfthSchool} onChange={e => setAcademicDetails({...academicDetails, twelfthSchool: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="School/Polytechnic name" />
                </div>
              </div>

              {/* Dynamic Transcript Live Matrix Block */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase text-[#002D62]">Live Semester Tracking Matrix</span>
                  <div className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-black">
                    Auto CGPA: {calculatedCgpa}
                  </div>
                </div>

                {academicDetails.degreeType === 'PG' && (
                  <div className="pb-2 border-b border-slate-200/60">
                    <label className="text-[11px] font-bold text-[#002D62] uppercase block mb-1">Prior UG Overall CGPA *</label>
                    <input type="number" step="0.01" value={academicDetails.ugCgpaForPg} onChange={e => setAcademicDetails({...academicDetails, ugCgpaForPg: e.target.value})} className="w-1/2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none" placeholder="e.g., 8.40" />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Enter GPA scored per semester till date:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: academicDetails.degreeType === 'PG' ? 4 : 8 }).map((_, index) => (
                      <div key={index}>
                        <input type="number" step="0.01" min="0" max="10" value={semesters[index]} onChange={e => {
                          const updated = [...semesters];
                          updated[index] = e.target.value;
                          setSemesters(updated);
                        }} className="w-full py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center font-bold text-slate-700" placeholder={`Sem ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3 Error Alerts */}
              {!isStep3Valid && (
                <div className="bg-red-50 text-red-600 rounded-xl p-3 flex gap-2 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>Missing scholastic fields: {getMissingAcademicFields().join(', ')}</div>
                </div>
              )}

              {/* Wizard Navigation Footer Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl flex items-center justify-center gap-1 transition-all">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="submit" disabled={!isStep3Valid} className={`w-2/3 py-2.5 font-bold text-sm rounded-xl transition-all shadow-md ${isStep3Valid ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Complete Profile Setup
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
=======
import React, { useState, useMemo } from 'react';
import AuthBackground from './ui/AuthBackground';

interface StudentProfileWizardProps {
  onComplete: (completedData: any) => void;
  initialEmail: string;
}

export default function StudentProfileWizard({ onComplete, initialEmail }: StudentProfileWizardProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '', department: '', year: '', currentSemester: '', regsNumber: '', yearOfStudy: '', passOutYear: '',
    email: initialEmail, phone: '', alternativePhone: '', address: '', isOtherState: false, stateName: 'Tamil Nadu', pinCode: '', district: '',
    boardOfStudy: '', graduationStanding: '', tenthPercentage: '', tenthSchoolName: '', twelfthPercentage: '', twelfthDiplomaSchoolName: '', diplomaPercentage: '', ugCgpa: '',
    sgpaSemesterValues: Array(8).fill('')
  });

  // Calculate how many previous semesters need inputs based on current semester selection
  const completedSemsCount = useMemo(() => {
    const semNum = parseInt(formData.currentSemester);
    if (isNaN(semNum) || semNum <= 1) return 0;
    return semNum - 1; 
  }, [formData.currentSemester]);

  // --- DYNAMIC REAL-TIME PROGRESS CALCULATOR ---
  const dynamicPercentage = useMemo(() => {
    // 1. Define all fields that we consider trackable for completion progress
    const baseFields = [
      formData.name, formData.department, formData.year, formData.currentSemester, 
      formData.regsNumber, formData.yearOfStudy, formData.passOutYear,
      formData.email, formData.phone, formData.alternativePhone, formData.address, 
      formData.stateName, formData.district, formData.pinCode,
      formData.boardOfStudy, formData.graduationStanding, formData.tenthPercentage, formData.tenthSchoolName
    ];

    // 2. Count filled items out of our tracking list
    let filledCount = baseFields.filter(val => typeof val === 'string' ? val.trim() !== '' : !!val).length;
    let totalFieldsCount = baseFields.length;

    // 3. Add dynamic semester tracking fields if the user has completed past semesters
    if (completedSemsCount > 0) {
      totalFieldsCount += completedSemsCount;
      const filledSems = formData.sgpaSemesterValues.slice(0, completedSemsCount).filter(v => v.trim() !== '').length;
      filledCount += filledSems;
    }

    // Return an integer between 0 and 100
    return Math.round((filledCount / totalFieldsCount) * 100);
  }, [formData, completedSemsCount]);

  // Circular SVG configuration metrics
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dynamicPercentage / 100) * circumference;

  // Dynamically compute CGPA over completed semesters
  const computedCgpa = useMemo(() => {
    const validScores = formData.sgpaSemesterValues
      .slice(0, completedSemsCount)
      .map(v => parseFloat(v))
      .filter(num => !isNaN(num));
    
    if (validScores.length === 0) return '0.00';
    const sum = validScores.reduce((acc, curr) => acc + curr, 0);
    return (sum / validScores.length).toFixed(2);
  }, [formData.sgpaSemesterValues, completedSemsCount]);

  // --- Input Handlers ---
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^[A-Za-z\s]+$/.test(val)) {
      setFormData({ ...formData, name: val });
      setErrors(prev => { const next = { ...prev }; delete next.name; return next; });
    }
  };

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
    if (value === '' || /^\d{0,1}(\.\d{0,2})?$/.test(value) || value === '10') {
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
      if (!formData.name.trim()) newErrors.name = 'Name field is required';
      if (!formData.department) newErrors.department = 'Department selection is required';
      if (!formData.year) newErrors.year = 'Year level is required';
      if (!formData.currentSemester) newErrors.currentSemester = 'Current semester selection is required';
      if (!formData.regsNumber.trim()) newErrors.regsNumber = 'Register number is required';
      if (formData.yearOfStudy.length !== 4) newErrors.yearOfStudy = 'Must be exactly 4 digits';
      if (formData.passOutYear.length !== 4) newErrors.passOutYear = 'Must be exactly 4 digits';
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/^[A-Z].*@(gmail\.com|ksrce\.ac\.in)$/.test(formData.email)) {
        newErrors.email = 'Must start with a CAPITAL letter and end with @gmail.com or @ksrce.ac.in';
      }
      if (formData.phone.length !== 10) newErrors.phone = 'Phone must be exactly 10 digits';
      if (formData.alternativePhone.length !== 10) newErrors.alternativePhone = 'Alternative phone must be 10 digits';
      if (!formData.address.trim()) newErrors.address = 'Street address is required';
      if (formData.isOtherState && !formData.stateName.trim()) newErrors.stateName = 'State designation is required';
      if (!formData.district.trim()) newErrors.district = 'District name is required';
      if (formData.pinCode.length !== 6) newErrors.pinCode = 'Pincode must be exactly 6 digits';
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
      newErrors.sgpaMatrix = `Please enter scores for all ${completedSemsCount} completed semester(s).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      onComplete({
        ...formData,
        ugCgpa: computedCgpa
      });
    }
  };

  return (
    <AuthBackground>
      <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 md:p-8 my-auto">
          
          {/* Step Progression Head */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Complete Your Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3 — Configuration mandatory before workspace entry</p>
            </div>

            {/* DYNAMIC CIRCULAR PROGRESS BAR */}
            <div className="relative flex items-center justify-center h-14 w-14">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring Track */}
                <circle
                  cx="28" cy="28" r={radius}
                  className="text-slate-100" strokeWidth="4px" stroke="currentColor" fill="transparent"
                />
                {/* Active Progress Fill Ring */}
                <circle
                  cx="28" cy="28" r={radius}
                  className="text-[#002D62] transition-all duration-300 ease-out"
                  strokeWidth="4px"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              {/* Center Percentage Display Label */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[11px] font-extrabold text-slate-700 leading-none">{dynamicPercentage}%</span>
                <span className="text-[7px] uppercase tracking-wider text-slate-400 mt-0.5 font-bold">Done</span>
              </div>
            </div>

          </div>

          <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-6">
            
            {/* STEP 1: GENERAL ATTRIBUTES */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#002D62] tracking-wider mb-2">Basic Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Name *</label>
                    <input 
                      type="text" value={formData.name} onChange={handleNameChange}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-[#002D62]'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Department *</label>
                    <select 
                      value={formData.department} onChange={(e) => { setFormData({...formData, department: e.target.value}); setErrors(p => { const n={...p}; delete n.department; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.department ? 'border-red-500' : 'border-slate-200'}`}
                    >
                      <option value="">Select Department</option>
                      {['CSE','MECH','ECE','BIO MEDICAL','IT','AUTO MOBILE','SFE','EEE','AIDS','MBA','MCA'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.department}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Year of Study *</label>
                    <select 
                      value={formData.year} onChange={(e) => { setFormData({...formData, year: e.target.value}); setErrors(p => { const n={...p}; delete n.year; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.year ? 'border-red-500' : 'border-slate-200'}`}
                    >
                      <option value="">Select Year</option>
                      {['I year', 'II year', 'III year', 'IV year'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {errors.year && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.year}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Current Semester *</label>
                    <select 
                      value={formData.currentSemester} 
                      onChange={(e) => { 
                        setFormData({...formData, currentSemester: e.target.value, sgpaSemesterValues: Array(8).fill('')}); 
                        setErrors(p => { const n={...p}; delete n.currentSemester; return n; }); 
                      }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl bg-white focus:outline-none ${errors.currentSemester ? 'border-red-500' : 'border-slate-200'}`}
                    >
                      <option value="">Select Semester</option>
                      {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                    {errors.currentSemester && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.currentSemester}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Register Number *</label>
                    <input 
                      type="text" value={formData.regsNumber} onChange={(e) => { setFormData({...formData, regsNumber: e.target.value}); setErrors(p => { const n={...p}; delete n.regsNumber; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.regsNumber ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.regsNumber && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.regsNumber}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Academic Year Entry (4 Digits) *</label>
                    <input 
                      type="text" placeholder="e.g. 2024" value={formData.yearOfStudy} onChange={(e) => handleDigitFilterChange('yearOfStudy', e.target.value, 4)}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.yearOfStudy ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.yearOfStudy && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.yearOfStudy}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Expected Graduation Pass Out Year (4 Digits) *</label>
                    <input 
                      type="text" placeholder="e.g. 2028" value={formData.passOutYear} onChange={(e) => handleDigitFilterChange('passOutYear', e.target.value, 4)}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.passOutYear ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.passOutYear && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.passOutYear}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: COMMUNICATIONS */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#002D62] tracking-wider mb-2">Communication & Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Email *</label>
                    <input 
                      type="text" value={formData.email} onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors(p => { const n={...p}; delete n.email; return n; }); }}
                      className={`w-full mt-1 p-2.5 border text-sm rounded-xl focus:outline-none ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors.email}</p>}
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
                      value={formData.boardOfStudy} onChange={(e) => setFormData({...formData, boardOfStudy: e.target.value})}
                      className="w-full mt-1 p-2.5 border text-sm rounded-xl bg-white border-slate-200 focus:outline-none"
                    >
                      <option value="">Select Board</option>
                      <option value="State Board">State Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Graduation Standing *</label>
                    <select 
                      value={formData.graduationStanding} onChange={(e) => setFormData({...formData, graduationStanding: e.target.value})}
                      className="w-full mt-1 p-2.5 border text-sm rounded-xl bg-white border-slate-200 focus:outline-none"
                    >
                      <option value="">Select Standing</option>
                      <option value="UG">Undergraduate (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">10th Score (%) *</label>
                    <input 
                      type="text" placeholder="e.g. 76.5" value={formData.tenthPercentage} 
                      onChange={(e) => handlePercentageChange('tenthPercentage', e.target.value)}
                      className="w-full mt-1 p-2.5 border text-sm rounded-xl border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">10th School Name *</label>
                    <input 
                      type="text" placeholder="School Location" value={formData.tenthSchoolName} 
                      onChange={(e) => { setFormData({...formData, tenthSchoolName: e.target.value}); setErrors(p => { const n={...p}; delete n.tenthSchoolName; return n; }); }}
                      className="w-full mt-1 p-2.5 border text-sm rounded-xl border-slate-200 focus:outline-none"
                    />
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

                {/* Semester Tracker Matrix */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wide mb-1">Prior Semester SGPA Log</h4>
                  
                  {completedSemsCount > 0 ? (
                    <>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Since you are in <strong>Semester {formData.currentSemester}</strong>, please input your GPA scores for completed semesters 1 to {completedSemsCount}:
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
                      ℹ️ You are in Semester 1. No previous semester scores need to be logged yet!
                    </p>
                  )}
                  {errors.sgpaMatrix && <p className="text-red-500 text-xs mt-3 font-semibold">⚠️ {errors.sgpaMatrix}</p>}
                </div>
              </div>
            )}

            {/* Error handling wrapper summary */}
            {Object.keys(errors).length > 0 && step === 3 && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
                Missing scholastic parameters detected. Please check all past GPA cells.
              </div>
            )}

            {/* Form actions navigation tray */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              {step > 1 && (
                <button 
                  type="button" onClick={() => setStep(step - 1)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-all"
                >
                  ← Back
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
>>>>>>> Stashed changes
  );
}