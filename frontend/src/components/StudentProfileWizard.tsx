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
  );
}