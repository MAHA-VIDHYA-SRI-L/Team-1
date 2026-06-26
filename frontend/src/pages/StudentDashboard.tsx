import { useState, useRef, useEffect } from 'react';
import StudentProfileWizard from '../components/StudentProfileWizard';
import { 
  Phone, 
  GraduationCap, 
  MapPin, 
  Mail, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  Edit3, 
  Check, 
  X,
  Upload,
  LayoutDashboard,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core state datasets
  const [profileData, setProfileData] = useState<any>(() => {
    const saved = localStorage.getItem('placemate_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(() => {
    return localStorage.getItem('placemate_profile') !== null;
  });

  // UIUX Visual Flash States (Zero-latency saving indicator loops)
  const [saveFlash, setSaveFlash] = useState<'header' | 'contact' | 'academics' | null>(null);

  // Section Editing Management States
  const [editingSection, setEditingSection] = useState<'header' | 'contact' | 'academics' | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [completenessScore, setCompletenessScore] = useState<number>(0);

  // Dynamic profile completeness engine calculation
  useEffect(() => {
    if (!profileData) return;
    const coreFields = ['name', 'regNo', 'branch', 'yearOfStudy', 'email', 'contactNumber', 'address', 'tenthPercentage', 'twelfthPercentage'];
    let filled = 0;
    coreFields.forEach(field => {
      if (profileData[field] && profileData[field].toString().trim() !== '') filled++;
    });
    const score = Math.round((filled / coreFields.length) * 100);
    setCompletenessScore(score);
  }, [profileData]);

  const handleWizardCompletion = (data: any) => {
    localStorage.setItem('placemate_profile', JSON.stringify(data));
    setProfileData(data);
    setIsProfileComplete(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedData = { ...profileData, profilePic: base64String };
        localStorage.setItem('placemate_profile', JSON.stringify(updatedData));
        setProfileData(updatedData);
        triggerSaveFlash('header');
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = (section: 'header' | 'contact' | 'academics') => {
    setEditForm({ ...profileData });
    setEditingSection(section);
  };

  const triggerSaveFlash = (section: 'header' | 'contact' | 'academics') => {
    setSaveFlash(section);
    setTimeout(() => setSaveFlash(null), 800);
  };

  const saveSectionChanges = () => {
    const currentSection = editingSection;
    const updatedTimestamp = new Date().toLocaleDateString('en-GB');
    const updatedData = {
      ...editForm,
      profileUpdatedDate: updatedTimestamp
    };
    localStorage.setItem('placemate_profile', JSON.stringify(updatedData));
    setProfileData(updatedData);
    setEditingSection(null);
    if (currentSection) triggerSaveFlash(currentSection);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditForm({});
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSemesterMarkChange = (index: number, value: string) => {
    const updatedMarks = [...(editForm.semesterMarks || Array(8).fill(''))];
    updatedMarks[index] = value;
    setEditForm((prev: any) => ({ ...prev, semesterMarks: updatedMarks }));
  };

  const handleResetProfile = () => {
    if (window.confirm('Are you sure you want to completely erase your profile records? This cannot be undone.')) {
      localStorage.removeItem('placemate_profile');
      setProfileData(null);
      setIsProfileComplete(false);
      setEditingSection(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex antialiased selection:bg-orange-500 selection:text-white font-sans text-slate-800">
      
      {!isProfileComplete && (
        <StudentProfileWizard onComplete={handleWizardCompletion} />
      )}

      {/* GLASSMORPHIC SIDEBAR COMPONENT CONTAINER */}
      <aside className="w-64 bg-gradient-to-b from-[#001E3D] via-[#001730] to-[#000F21] text-white p-6 flex flex-col justify-between hidden lg:flex shrink-0 border-r border-slate-900 shadow-xl">
        <div className="space-y-10">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20 text-base transform hover:rotate-3 transition-transform">
              P
            </div>
            <span className="text-sm font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              PLACEMATE
            </span>
          </div>
          
          <nav className="space-y-2">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-[#ffffff]/[0.03] hover:bg-orange-500 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 group shadow-inner border border-white/[0.04] hover:border-orange-400 hover:shadow-orange-500/20">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" /> 
                <span className="tracking-wide">My Profile Dashboard</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1" />
            </button>
          </nav>
        </div>
        
        <div className="space-y-4 px-2 border-t border-white/[0.06] pt-6">
          {isProfileComplete && (
            <button 
              onClick={handleResetProfile} 
              className="text-left text-[11px] font-bold text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-2 tracking-wide uppercase"
            >
              <span>⚙️</span> <span>Reset System Profile</span>
            </button>
          )}
          <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            © 2026 K.S.R.C.E
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE REGION */}
      <main className={`flex-1 p-6 md:p-10 space-y-8 transition-all duration-500 ${!isProfileComplete ? 'blur-lg pointer-events-none select-none' : ''}`}>
        
        {/* INTERACTIVE ACTIONS HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-50" />
            <div className="text-xs font-bold text-slate-400 tracking-widest uppercase font-mono">
              Workspace Core System Engine
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2.5 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/60">
              {completenessScore === 100 ? (
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Completeness: <strong className={completenessScore === 100 ? "text-emerald-600" : "text-amber-600"}>{completenessScore}%</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="h-5.5 w-5.5 rounded-md bg-orange-500 flex items-center justify-center font-black text-white text-[11px]">P</div>
              <span className="text-xs font-black tracking-wider text-[#002D62]">PLACEMATE</span>
            </div>
          </div>
        </div>

        {/* PROFILE HEADER HERO SPACE */}
        <div className={`bg-white rounded-2xl border transition-all duration-500 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm ${saveFlash === 'header' ? 'border-emerald-400 ring-4 ring-emerald-50 bg-emerald-50/10' : 'border-slate-200/70'}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
            
            {/* AVATAR DEPLOYMENT WRAPPER */}
            <div className="flex flex-col items-center gap-2.5 shrink-0 relative group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-24 w-24 rounded-full bg-slate-50 border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center cursor-pointer transition-all duration-300 ring-4 ring-slate-100 group-hover:ring-orange-100"
              >
                {profileData?.profilePic ? (
                  <img src={profileData.profilePic} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="text-slate-400 font-bold text-[11px] flex flex-col items-center gap-1">
                    <Upload className="h-4 w-4 text-slate-300" />
                    <span>Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-[#001E3D]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-[1px]">
                  <Upload className="h-4 w-4 text-white" />
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              
              {editingSection !== 'header' ? (
                <button 
                  type="button" onClick={() => startEditing('header')}
                  className="inline-flex items-center gap-1 text-[10px] text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 transition-colors uppercase tracking-wide mt-1 shadow-sm hover:bg-orange-100"
                >
                  <Edit3 className="h-2.5 w-2.5" /> Edit Bio
                </button>
              ) : (
                <div className="flex gap-1 absolute -bottom-1">
                  <button type="button" onClick={saveSectionChanges} className="p-1 bg-emerald-500 text-white rounded-md shadow-sm hover:bg-emerald-600"><Check className="h-3 w-3" /></button>
                  <button type="button" onClick={cancelEditing} className="p-1 bg-slate-200 text-slate-600 rounded-md shadow-sm hover:bg-slate-300"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>

            {/* IDENTITY HEADER FIELDS */}
            <div className="flex-1 w-full space-y-1">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {editingSection === 'header' ? (
                  <input 
                    type="text" value={editForm.name || ''} placeholder="Student Name"
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-xl font-bold text-[#002D62] bg-slate-50 border-b-2 border-orange-400 px-2 py-0.5 outline-none w-full sm:w-auto focus:bg-orange-50/30 transition-colors"
                  />
                ) : (
                  <h1 className="text-2xl font-black text-[#002D62] tracking-tight">{profileData?.name || 'Student Candidate Name'}</h1>
                )}
                <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 font-bold text-[10px] rounded-md border border-orange-100 uppercase tracking-widest shrink-0">
                  {profileData?.degreeType || 'UG'} Candidate
                </span>
              </div>

              <div className="text-xs font-mono font-bold text-slate-400">
                {editingSection === 'header' ? (
                  <input 
                    type="text" value={editForm.regNo || ''} placeholder="Registration ID"
                    onChange={(e) => handleInputChange('regNo', e.target.value)}
                    className="text-xs font-mono bg-slate-50 border-b border-orange-400 px-2 py-0.5 outline-none w-44"
                  />
                ) : (
                  profileData?.regNo || 'REGISTRATION_ID'
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/40 text-slate-600">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" /> 
                  {editingSection === 'header' ? (
                    <input type="text" value={editForm.branch || ''} onChange={(e) => handleInputChange('branch', e.target.value)} className="bg-white border rounded px-1 w-20 outline-none" placeholder="Branch" />
                  ) : (
                    profileData?.branch || 'N/A'
                  )}
                </span>
                
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/40 text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> 
                  {editingSection === 'header' ? (
                    <select value={editForm.yearOfStudy || ''} onChange={(e) => handleInputChange('yearOfStudy', e.target.value)} className="bg-white border rounded outline-none">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  ) : (
                    profileData?.yearOfStudy || 'N/A'
                  )}
                </span>

                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/40 text-slate-600">
                  <span className="text-slate-400">Graduation Track:</span> 
                  {editingSection === 'header' ? (
                    <input type="text" value={editForm.passOutYear || ''} onChange={(e) => handleInputChange('passOutYear', e.target.value)} className="bg-white border rounded px-1 w-14 outline-none text-center" placeholder="YYYY" />
                  ) : (
                    <strong className="text-slate-800">{profileData?.passOutYear || 'N/A'}</strong>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* AGGREGATED METRIC Display */}
          <div className="bg-gradient-to-br from-[#002D62] to-[#001836] text-white px-8 py-5 rounded-2xl text-center shadow-lg shrink-0 w-full sm:w-auto border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-12 w-12 bg-white/[0.02] rounded-bl-full pointer-events-none" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">AGGREGATED CGPA</span>
            {editingSection === 'header' ? (
              <input 
                type="text" value={editForm.finalCgpa || ''} placeholder="0.00"
                onChange={(e) => handleInputChange('finalCgpa', e.target.value)}
                className="text-xl font-black text-center text-orange-400 bg-slate-900/50 border border-slate-700 rounded-lg outline-none mt-2 w-20 py-0.5"
              />
            ) : (
              <span className="text-3xl font-black tracking-tight block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                {profileData?.finalCgpa || '0.00'}
              </span>
            )}
          </div>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT ZONE CONTAINER */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* CONTACT INFORMATION */}
            <div className={`bg-white rounded-2xl border transition-all duration-300 p-6 space-y-5 shadow-sm ${saveFlash === 'contact' ? 'border-emerald-400 ring-4 ring-emerald-50 bg-emerald-50/10' : 'border-slate-200/70'}`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-[#002D62]">
                  <Phone className="h-4 w-4 text-orange-500" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">Contact & Communication Records</h3>
                </div>
                
                {editingSection !== 'contact' ? (
                  <button type="button" onClick={() => startEditing('contact')} className="text-slate-400 hover:text-orange-500 p-1.5 hover:bg-slate-50 rounded-xl transition-all">
                    <Edit3 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={saveSectionChanges} className="text-white font-bold text-xs bg-emerald-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700">Save</button>
                    <button type="button" onClick={cancelEditing} className="text-slate-600 font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-lg border hover:bg-slate-200">Cancel</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mail className="h-3 w-3" /> Primary Email Address</span>
                  {editingSection === 'contact' ? (
                    <input type="email" value={editForm.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-0.5 rounded text-xs outline-none focus:border-orange-500" />
                  ) : (
                    <span className="text-slate-700 font-bold block break-all">{profileData?.email || 'N/A'}</span>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Phone className="h-3 w-3" /> Contact Mobile Number</span>
                  {editingSection === 'contact' ? (
                    <input type="text" value={editForm.contactNumber || ''} onChange={(e) => handleInputChange('contactNumber', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-0.5 rounded text-xs outline-none focus:border-orange-500" />
                  ) : (
                    <span className="text-slate-700 font-bold block">{profileData?.contactNumber || 'N/A'}</span>
                  )}
                </div>

                <div className="sm:col-span-2 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Phone className="h-3 w-3" /> Alternative Mobile Number</span>
                  {editingSection === 'contact' ? (
                    <input type="text" value={editForm.altContactNumber || ''} onChange={(e) => handleInputChange('altContactNumber', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-0.5 rounded text-xs outline-none focus:border-orange-500" />
                  ) : (
                    <span className="text-slate-700 font-bold block">{profileData?.altContactNumber || 'None'}</span>
                  )}
                </div>

                <div className="sm:col-span-2 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Residential Mailing Address</span>
                  {editingSection === 'contact' ? (
                    <input type="text" value={editForm.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-0.5 rounded text-xs outline-none focus:border-orange-500" />
                  ) : (
                    <span className="text-slate-700 font-bold block">{profileData?.address || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* LIVE TERM SEMESTER TRACKING MATRICES */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-[#002D62]">
                  <Award className="h-4 w-4 text-orange-500" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">Live Term Semester Tracking Matrices</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {Array.from({ length: (editingSection === 'contact' ? editForm.degreeType : profileData?.degreeType) === 'PG' ? 4 : 8 }).map((_, index) => {
                  const score = editingSection === 'contact' ? editForm.semesterMarks?.[index] : profileData?.semesterMarks?.[index];
                  const hasValue = score && score.toString().trim() !== '';
                  const numericScore = parseFloat(score || '0');
                  
                  return (
                    <div key={index} className="p-3 bg-slate-50/40 border border-slate-100 rounded-xl text-center transition-all duration-200 hover:shadow-sm">
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Semester {index + 1}</span>
                      {editingSection === 'contact' ? (
                        <input 
                          type="text" value={score || ''} onChange={(e) => handleSemesterMarkChange(index, e.target.value)} 
                          className="w-full text-center bg-white border border-slate-200 rounded-lg text-xs font-bold mt-1.5 py-0.5 focus:border-orange-500 outline-none"
                          placeholder="0.00"
                        />
                      ) : (
                        <span className={`text-base font-black block mt-1.5 ${hasValue ? (numericScore >= 8.5 ? 'text-emerald-600' : 'text-[#002D62]') : 'text-slate-300 font-normal'}`}>
                          {hasValue ? score : '—'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT ZONE CONTAINER */}
          <div className="space-y-8">
            
            {/* SCHOOL ACADEMIC HISTORY */}
            <div className={`bg-white rounded-2xl border transition-all duration-300 p-6 space-y-5 shadow-sm ${saveFlash === 'academics' ? 'border-emerald-400 ring-4 ring-emerald-50 bg-emerald-50/10' : 'border-slate-200/70'}`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-[#002D62]">
                  <GraduationCap className="h-4 w-4 text-orange-500" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">School Academic History</h3>
                </div>

                {editingSection !== 'academics' ? (
                  <button type="button" onClick={() => startEditing('academics')} className="text-slate-400 hover:text-orange-500 p-1.5 hover:bg-slate-50 rounded-xl transition-all">
                    <Edit3 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={saveSectionChanges} className="text-white font-bold text-xs bg-emerald-600 px-2 py-0.5 rounded-md hover:bg-emerald-700">Save</button>
                    <button type="button" onClick={cancelEditing} className="p-1 bg-slate-100 rounded-md text-slate-500 hover:bg-slate-200"><X className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-sm font-medium">
                <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">10th Matriculation Board</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                      {editingSection === 'academics' ? (
                        <input type="text" value={editForm.tenthPercentage || ''} onChange={(e) => handleInputChange('tenthPercentage', e.target.value)} className="w-10 text-center border bg-white rounded text-xs outline-none" />
                      ) : (
                        profileData?.tenthPercentage || '0'
                      )}%
                    </span>
                  </div>
                  {editingSection === 'academics' ? (
                    <input type="text" value={editForm.tenthSchool || ''} onChange={(e) => handleInputChange('tenthSchool', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-0.5 rounded text-xs mt-1 outline-none focus:border-orange-500" placeholder="Institution Name" />
                  ) : (
                    <p className="font-bold text-slate-700 mt-1">{profileData?.tenthSchool || 'N/A'}</p>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">12th / Diploma Grade</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                      {editingSection === 'academics' ? (
                        <input type="text" value={editForm.twelfthPercentage || ''} onChange={(e) => handleInputChange('twelfthPercentage', e.target.value)} className="w-10 text-center border bg-white rounded text-xs outline-none" />
                      ) : (
                        profileData?.twelfthPercentage || '0'
                      )}%
                    </span>
                  </div>
                  {editingSection === 'academics' ? (
                    <input type="text" value={editForm.twelfthSchool || ''} onChange={(e) => handleInputChange('twelfthSchool', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-0.5 rounded text-xs mt-1 outline-none focus:border-orange-500" placeholder="Institution Name" />
                  ) : (
                    <p className="font-bold text-slate-700 mt-1">{profileData?.twelfthSchool || 'N/A'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Board Affiliation</span>
                    {editingSection === 'academics' ? (
                      <input type="text" value={editForm.boardType || ''} onChange={(e) => handleInputChange('boardType', e.target.value)} className="w-full text-center border bg-white rounded outline-none" placeholder="State/CBSE" />
                    ) : (
                      <span className="text-slate-700 font-black block">{profileData?.boardType || 'State'}</span>
                    )}
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Prior UG CGPA</span>
                    {editingSection === 'academics' ? (
                      <input type="text" value={editForm.ugCgpaForPg || ''} onChange={(e) => handleInputChange('ugCgpaForPg', e.target.value)} className="w-full text-center border bg-white rounded outline-none" placeholder="0.00" />
                    ) : (
                      <span className="text-slate-700 font-black block">{profileData?.ugCgpaForPg || 'N/A'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM LOGGING INTEGRITY */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-3 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-[#002D62] font-black uppercase tracking-widest text-[10px]">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>System Logging Integrity</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50/40 border border-slate-100 rounded-xl">
                <span className="text-slate-400">Profile Initialized:</span>
                <span className="font-mono text-slate-700 font-bold">{profileData?.profileCreatedDate || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50/40 border border-slate-100 rounded-xl">
                <span className="text-slate-400">Transaction Sync:</span>
                <span className="font-mono text-slate-700 font-bold">{profileData?.profileUpdatedDate || 'N/A'}</span>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}