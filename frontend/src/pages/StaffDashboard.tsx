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

  const [profileData, setProfileData] = useState<any>(() => {
    const saved = localStorage.getItem('placemate_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(() => {
    return localStorage.getItem('placemate_profile') !== null;
  });

  const [saveFlash, setSaveFlash] = useState<'header' | 'contact' | 'academics' | null>(null);
  const [editingSection, setEditingSection] = useState<'header' | 'contact' | 'academics' | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [completenessScore, setCompletenessScore] = useState<number>(0);

  useEffect(() => {
    if (!profileData) return;
    const coreFields = ['name', 'regNo', 'branch', 'yearOfStudy', 'email', 'contactNumber', 'address', 'tenthPercentage', 'twelfthPercentage'];
    let filled = 0;
    coreFields.forEach(field => {
      if (profileData[field] && profileData[field].toString().trim() !== '') filled++;
    });
    setCompletenessScore(Math.round((filled / coreFields.length) * 100));
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
        const updatedData = { ...profileData, profilePic: reader.result as string };
        localStorage.setItem('placemate_profile', JSON.stringify(updatedData));
        setProfileData(updatedData);
        setSaveFlash('header');
        setTimeout(() => setSaveFlash(null), 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = (section: 'header' | 'contact' | 'academics') => {
    setEditForm({ ...profileData });
    setEditingSection(section);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveSectionChanges = () => {
    const currentSection = editingSection;
    const updatedData = { ...editForm, profileUpdatedDate: new Date().toLocaleDateString('en-GB') };
    localStorage.setItem('placemate_profile', JSON.stringify(updatedData));
    setProfileData(updatedData);
    setEditingSection(null);
    if (currentSection) {
      setSaveFlash(currentSection);
      setTimeout(() => setSaveFlash(null), 800);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex antialiased text-slate-800">
      
      {!isProfileComplete && <StudentProfileWizard onComplete={handleWizardCompletion} />}

      <aside className="w-64 bg-gradient-to-b from-[#001E3D] via-[#001730] to-[#000F21] text-white p-6 flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="space-y-10">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center font-black text-white shadow-lg">P</div>
            <span className="text-sm font-black tracking-widest text-white">PLACEMATE</span>
          </div>
          <nav className="space-y-2">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-[#ffffff]/[0.03] hover:bg-orange-500 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all group">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover:text-white" /> 
                <span>Profile Dashboard</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          </nav>
        </div>
        <div className="space-y-4 px-2 border-t border-white/[0.06] pt-6">
          {isProfileComplete && (
            <button onClick={() => { localStorage.removeItem('placemate_profile'); setProfileData(null); setIsProfileComplete(false); }} className="text-left text-[11px] font-bold text-slate-400 hover:text-orange-400 transition-colors uppercase">
              Reset Profile
            </button>
          )}
          <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">© 2026 K.S.R.C.E</div>
        </div>
      </aside>

      <main className={`flex-1 p-6 md:p-10 space-y-8 transition-all ${!isProfileComplete ? 'blur-lg pointer-events-none' : ''}`}>
        
        <div className="flex items-center justify-between border-b pb-5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs font-bold text-slate-400 tracking-widest uppercase font-mono">Workspace System</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2.5 bg-slate-100 px-3.5 py-1.5 rounded-xl border">
              {completenessScore === 100 ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Progress: <strong className={completenessScore === 100 ? "text-emerald-600" : "text-amber-600"}>{completenessScore}%</strong>
              </span>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-2xl border p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative shadow-sm ${saveFlash === 'header' ? 'border-emerald-400 ring-4 ring-emerald-50 bg-emerald-50/10' : 'border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
            <div className="flex flex-col items-center gap-2.5 shrink-0 relative group">
              <div onClick={() => fileInputRef.current?.click()} className="h-24 w-24 rounded-full bg-slate-50 border overflow-hidden shadow-inner flex items-center justify-center cursor-pointer relative">
                {profileData?.profilePic ? <img src={profileData.profilePic} alt="Avatar" className="w-full h-full object-cover" /> : <Upload className="h-4 w-4 text-slate-300" />}
                <div className="absolute inset-0 bg-[#001E3D]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"><Upload className="h-4 w-4 text-white" /></div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              {editingSection !== 'header' ? (
                <button type="button" onClick={() => startEditing('header')} className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-md border uppercase tracking-wide mt-1"><Edit3 className="h-2.5 w-2.5 inline mr-1" />Edit Bio</button>
              ) : (
                <div className="flex gap-1 mt-1">
                  <button type="button" onClick={saveSectionChanges} className="p-1 bg-emerald-500 text-white rounded-md"><Check className="h-3 w-3" /></button>
                  <button type="button" onClick={() => setEditingSection(null)} className="p-1 bg-slate-200 text-slate-600 rounded-md"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {editingSection === 'header' ? (
                  <input type="text" value={editForm.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="text-xl font-bold text-[#002D62] bg-slate-50 border-b-2 border-orange-400 px-2 outline-none" />
                ) : (
                  <h1 className="text-2xl font-black text-[#002D62] tracking-tight">{profileData?.name || 'Student Candidate Name'}</h1>
                )}
                <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 font-bold text-[10px] rounded-md border uppercase tracking-widest">{profileData?.degreeType || 'UG'}</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-400">
                {editingSection === 'header' ? (
                  <input type="text" value={editForm.regNo || ''} onChange={(e) => handleInputChange('regNo', e.target.value)} className="text-xs font-mono bg-slate-50 border-b border-orange-400 px-2 outline-none" />
                ) : (
                  profileData?.regNo || 'REGISTRATION_ID'
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border text-slate-600">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  {editingSection === 'header' ? (
                    <input type="text" value={editForm.branch || ''} onChange={(e) => handleInputChange('branch', e.target.value)} className="bg-white border rounded px-1 w-20 outline-none" />
                  ) : (
                    profileData?.branch || 'N/A'
                  )}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border text-slate-600">
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
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#002D62] to-[#001836] text-white px-8 py-5 rounded-2xl text-center shadow-lg shrink-0 w-full sm:w-auto border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">AGGREGATED CGPA</span>
            {editingSection === 'header' ? (
              <input type="text" value={editForm.finalCgpa || ''} onChange={(e) => handleInputChange('finalCgpa', e.target.value)} className="text-xl font-black text-center text-orange-400 bg-slate-900 border rounded outline-none mt-2 w-20" />
            ) : (
              <span className="text-3xl font-black tracking-tight block mt-1 text-orange-400">{profileData?.finalCgpa || '0.00'}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className={`bg-white rounded-2xl border p-6 space-y-5 shadow-sm ${saveFlash === 'contact' ? 'border-emerald-400 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2.5 text-[#002D62]">
                  <Phone className="h-4 w-4 text-orange-500" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">Contact Details</h3>
                </div>
                {editingSection !== 'contact' ? (
                  <button type="button" onClick={() => startEditing('contact')} className="text-slate-400 hover:text-orange-500 p-1.5"><Edit3 className="h-4 w-4" /></button>
                ) : (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={saveSectionChanges} className="text-white font-bold text-xs bg-emerald-600 px-3 py-1.5 rounded-lg">Save</button>
                    <button type="button" onClick={() => setEditingSection(null)} className="text-slate-600 font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-lg border">Cancel</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                <div className="p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email Address</span>
                  {editingSection === 'contact' ? (
                    <input type="email" value={editForm.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full bg-white border px-2 py-0.5 rounded text-xs outline-none" />
                  ) : (
                    <span className="text-slate-700 font-bold block">{profileData?.email || 'N/A'}</span>
                  )}
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Phone className="h-3 w-3" /> Mobile Number</span>
                  {editingSection === 'contact' ? (
                    <input type="text" value={editForm.contactNumber || ''} onChange={(e) => handleInputChange('contactNumber', e.target.value)} className="w-full bg-white border px-2 py-0.5 rounded text-xs outline-none" />
                  ) : (
                    <span className="text-slate-700 font-bold block">{profileData?.contactNumber || 'N/A'}</span>
                  )}
                </div>
                <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Phone className="h-3 w-3" /> Alternative Contact</span>
                  {editingSection === 'contact' ? (
                    <input type="text" value={editForm.altContactNumber || ''} onChange={(e) => handleInputChange('altContactNumber', e.target.value)} className="w-full bg-white border px-2 py-0.5 rounded text-xs outline-none" />
                  ) : (
                    <span className="text-slate-700 font-bold block">{profileData?.altContactNumber || 'None'}</span>
                  )}
                </div>
                <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Address</span>
                  {editingSection === 'contact' ? (
                    <input type="text" value={editForm.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full bg-white border px-2 py-0.5 rounded text-xs outline-none" />
                  ) : (
                    <span className="text-slate-700 font-bold block">{profileData?.address || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2.5 text-[#002D62]">
                  <Award className="h-4 w-4 text-orange-500" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">Semester Track Matrices</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {Array.from({ length: profileData?.degreeType === 'PG' ? 4 : 8 }).map((_, index) => {
                  const score = profileData?.semesterMarks?.[index];
                  const hasValue = score && score.toString().trim() !== '';
                  return (
                    <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Sem {index + 1}</span>
                      <span className="text-base font-black block mt-1.5 text-[#002D62]">{hasValue ? score : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className={`bg-white rounded-2xl border p-6 space-y-5 shadow-sm ${saveFlash === 'academics' ? 'border-emerald-400 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2.5 text-[#002D62]">
                  <GraduationCap className="h-4 w-4 text-orange-500" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">Academic History</h3>
                </div>
                {editingSection !== 'academics' ? (
                  <button type="button" onClick={() => startEditing('academics')} className="text-slate-400 hover:text-orange-500 p-1.5"><Edit3 className="h-4 w-4" /></button>
                ) : (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={saveSectionChanges} className="text-white font-bold text-xs bg-emerald-600 px-2 py-0.5 rounded-md">Save</button>
                    <button type="button" onClick={() => setEditingSection(null)} className="p-1 bg-slate-100 rounded-md"><X className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
              <div className="space-y-4 text-sm font-medium">
                <div className="p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">10th Percentage</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {editingSection === 'academics' ? (
                        <input type="text" value={editForm.tenthPercentage || ''} onChange={(e) => handleInputChange('tenthPercentage', e.target.value)} className="w-10 text-center border rounded" />
                      ) : (
                        profileData?.tenthPercentage || '0'
                      )}%
                    </span>
                  </div>
                  <p className="font-bold text-slate-700">{profileData?.tenthSchool || 'N/A'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">12th Percentage</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {editingSection === 'academics' ? (
                        <input type="text" value={editForm.twelfthPercentage || ''} onChange={(e) => handleInputChange('twelfthPercentage', e.target.value)} className="w-10 text-center border rounded" />
                      ) : (
                        profileData?.twelfthPercentage || '0'
                      )}%
                    </span>
                  </div>
                  <p className="font-bold text-slate-700">{profileData?.twelfthSchool || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6 space-y-3 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2 pb-2 border-b text-[#002D62] font-black uppercase tracking-widest text-[10px]">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>System Tracking Log</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-xl">
                <span>Profile Initialized:</span>
                <span className="font-mono text-slate-700 font-bold">{profileData?.profileCreatedDate || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}