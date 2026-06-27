<<<<<<< Updated upstream
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
=======
import { useState, useMemo } from 'react';
import { 
  Users, 
  Briefcase, 
  XCircle, 
  Search, 
  SlidersHorizontal, 
  LogOut, 
  Filter,
  GraduationCap,
  Sparkles,
  MapPin
} from 'lucide-react';

interface StaffDashboardProps {
  user: {
    fullName: string;
    email: string;
>>>>>>> Stashed changes
  };

<<<<<<< Updated upstream
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
=======
interface StudentRecord {
  id: string;
  regNo: string;
  name: string;
  dept: string;
  readinessScore: number;
  status: 'Placed' | 'Not Placed';
  company?: string;
  email: string;
}

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  // --- STATE MANAGEMENT ---
  const [showDeptBreakdown, setShowDeptBreakdown] = useState<boolean>(false);
  
  // Filter Fields State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [minReadiness, setMinReadiness] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Master Student dataset
  const [students] = useState<StudentRecord[]>([
    { id: '1', regNo: '921322104001', name: 'Francis Edition', dept: 'CSE', readinessScore: 92, status: 'Placed', company: 'Google', email: 'francis@placement.edu' },
    { id: '2', regNo: '921322104014', name: 'Abishek Kumar', dept: 'CSE', readinessScore: 85, status: 'Not Placed', email: 'abishek@placement.edu' },
    { id: '3', regNo: '921322106022', name: 'Priya Dharshini', dept: 'ECE', readinessScore: 78, status: 'Placed', company: 'Cognizant', email: 'priya@placement.edu' },
    { id: '4', regNo: '921322114005', name: 'Dinesh Karthik', dept: 'MECH', readinessScore: 64, status: 'Not Placed', email: 'dinesh@placement.edu' },
    { id: '5', regNo: '921322103041', name: 'Shreya Iyer', dept: 'IT', readinessScore: 89, status: 'Placed', company: 'Microsoft', email: 'shreya@placement.edu' },
    { id: '6', regNo: '921322104088', name: 'Rahul R', dept: 'CSE', readinessScore: 55, status: 'Not Placed', email: 'rahul@placement.edu' }
  ]);

  // --- DYNAMIC CALCULATIONS ---
  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.status === 'Placed');
  const unplacedStudents = students.filter(s => s.status === 'Not Placed');

  const deptBreakdown = useMemo(() => {
    const counts: { [key: string]: number } = {};
    students.forEach(s => { counts[s.dept] = (counts[s.dept] || 0) + 1; });
    return counts;
  }, [students]);

  const placedDeptBreakdown = useMemo(() => {
    const counts: { [key: string]: number } = {};
    placedStudents.forEach(s => { counts[s.dept] = (counts[s.dept] || 0) + 1; });
    return counts;
  }, [placedStudents]);

  const unplacedDeptBreakdown = useMemo(() => {
    const counts: { [key: string]: number } = {};
    unplacedStudents.forEach(s => { counts[s.dept] = (counts[s.dept] || 0) + 1; });
    return counts;
  }, [unplacedStudents]);

  // --- FILTER ENGINE PIPELINE ---
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.regNo.includes(searchQuery);
      
      const matchesDept = selectedDept === 'All' || student.dept === selectedDept;
      const matchesReadiness = student.readinessScore >= minReadiness;
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;

      return matchesSearch && matchesDept && matchesReadiness && matchesStatus;
    });
  }, [students, searchQuery, selectedDept, minReadiness, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      
      {/* GLOBAL STAFF WORKSPACE HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div>
          <h1 className="text-lg font-black text-[#002D62] uppercase tracking-wider">Placemate</h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Administrative Control Panel</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[13px] font-bold text-slate-800 leading-none">{user.fullName}</p>
            <p className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wider">Placement Officer</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 border border-red-100 bg-red-50/50 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE ELEMENT CANVAS CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* ==================== TOP CANVAS (30% Area Metric Boxes) ==================== */}
        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block mb-3">Live Placement Analytics</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* BOX 1: TOTAL NO OF STUDENTS */}
            <div 
              onClick={() => setShowDeptBreakdown(!showDeptBreakdown)}
              className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm cursor-pointer select-none relative transition-all hover:border-[#002D62]/30 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-[#002D62]/5 text-[#002D62] rounded-xl group-hover:bg-[#002D62]/10 transition-all">
                  <Users className="h-5 w-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] bg-slate-100 font-bold px-2.5 py-1 text-slate-500 rounded-lg">
                  {showDeptBreakdown ? 'Hide Breakdown ✕' : 'Click for Depts ▾'}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-slate-800">{totalStudents}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Total Enrolled Students</p>
              </div>

              {showDeptBreakdown && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-fadeIn">
                  <p className="text-[10px] font-bold text-[#002D62] uppercase tracking-wider mb-1">Department Matrix Breakup:</p>
                  {Object.entries(deptBreakdown).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <span>{dept} Department</span>
                      <span className="bg-[#002D62] text-white text-[10px] px-2 py-0.5 rounded-full font-black">{count} Users</span>
                    </div>
                  ))}
>>>>>>> Stashed changes
                </div>
              )}
            </div>

<<<<<<< Updated upstream
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
=======
            {/* BOX 2: TOTAL NUMBER OF PEOPLE PLACED */}
            <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm bg-gradient-to-br from-white to-emerald-50/10">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <Briefcase className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-emerald-600">{placedStudents.length}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Students Placed Successfully</p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100/60 space-y-1.5">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Placement Concentration</p>
                {Object.keys(placedDeptBreakdown).length === 0 ? (
                  <p className="text-xs font-medium text-slate-400">No placements logs found.</p>
                ) : (
                  Object.entries(placedDeptBreakdown).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                      <span>{dept} Division</span>
                      <span className="text-emerald-600">{count} Placed</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* BOX 3: TOTAL NUMBER OF PEOPLE NOT PLACED */}
            <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm bg-gradient-to-br from-white to-orange-50/10">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl w-fit">
                <XCircle className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-orange-600">{unplacedStudents.length}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Remaining Bench Strength</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/60 space-y-1.5">
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-wider">Unplaced Volume by Dept</p>
                {Object.entries(unplacedDeptBreakdown).map(([dept, count]) => (
                  <div key={dept} className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                    <span>{dept} Branch</span>
                    <span className="text-orange-500">{count} Awaiting</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ==================== BELOW CANVAS (70% Filter Section & Roster Card Output) ==================== */}
        <div className="space-y-4">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block">Student Search & Roster Control</span>

          {/* FILTERS CONSOLE BAR */}
          <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold border-b border-slate-50 pb-2">
              <SlidersHorizontal className="h-4 w-4 text-[#002D62]" />
              <span>Roster Filtration Controls</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search text query bar */}
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Search Credentials</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Student Name or Reg No..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#002D62] font-medium"
                  />
                </div>
              </div>

              {/* Department options selector dropdown */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#002D62] font-bold text-slate-700"
                >
                  <option value="All">All Departments</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="IT">Information Tech (IT)</option>
                  <option value="MECH">Mechanical (MECH)</option>
                </select>
              </div>

              {/* Placement filter status segment buttons */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Placement Status</label>
                <div className="flex gap-1.5">
                  {['All', 'Placed', 'Not Placed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                        statusFilter === st 
                          ? 'bg-[#002D62] text-white border-[#002D62]' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for Readiness score gauge boundaries */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Min Readiness Score</label>
                  <span className="text-xs font-black text-[#002D62] bg-[#002D62]/5 px-2 py-0.5 rounded-md">{minReadiness}% +</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={minReadiness}
                  onChange={(e) => setMinReadiness(Number(e.target.value))}
                  className="w-full accent-[#002D62] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
>>>>>>> Stashed changes
              </div>
            </div>
          </div>

<<<<<<< Updated upstream
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
=======
          {/* LOWER CARDS MATRIX GRID DISPLAY */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-bold text-slate-500">Filtered Results ({filteredStudents.length} matching)</span>
              {(searchQuery || selectedDept !== 'All' || minReadiness > 0 || statusFilter !== 'All') && (
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedDept('All'); setMinReadiness(0); setStatusFilter('All'); }}
                  className="text-[10px] text-orange-500 font-bold hover:underline"
                >
                  Clear Active Filters
                </button>
              )}
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <Filter className="h-6 w-6 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No Student Records Found</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Adjust your filter conditions or structural parameter values to review alternate matches.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => {
                  const isPlaced = student.status === 'Placed';
                  return (
                    <div 
                      key={student.id}
                      className={`bg-white border rounded-[22px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                        isPlaced ? 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/5' : 'border-slate-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              {student.regNo}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 mt-1.5 leading-tight">{student.name}</h4>
                            <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5 flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              <span>{student.dept} Branch</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Readiness</span>
                            <span className={`text-sm font-black flex items-center gap-0.5 justify-end ${
                              student.readinessScore >= 85 ? 'text-emerald-600' : student.readinessScore >= 65 ? 'text-blue-600' : 'text-amber-500'
                            }`}>
                              <Sparkles className="h-3 w-3 shrink-0" />
                              {student.readinessScore}%
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium truncate mb-4">{student.email}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                          isPlaced ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          ● {student.status}
                        </span>

                        {isPlaced && student.company && (
                          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 max-w-[140px] truncate">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{student.company}</span>
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
>>>>>>> Stashed changes
    </div>
  );
}