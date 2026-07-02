import { useState, useMemo, useEffect } from 'react';
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
  MapPin,
  Loader2,
  BarChart2,
  Ban,
  CheckCircle2,
  ShieldCheck,
  Eye,
  X,
  Phone,
  Mail,
  BadgeCheck,
  Clock,
  FileText
} from 'lucide-react';
import { fetchStaffStudents, fetchStaffStudentById, updatePlacementStatus, verifyStudentByStaff, blockStudent, updateCertStatus, mapStudentRecord, type StudentRecord } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface StaffDashboardProps {
  user: {
    fullName: string;
    email: string;
  };
  onLogout: () => void;
  onNavigateToReport?: () => void;
}

export default function StaffDashboard({ user, onLogout, onNavigateToReport }: StaffDashboardProps) {
  const [showDeptBreakdown, setShowDeptBreakdown] = useState<boolean>(false);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [minReadiness, setMinReadiness] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [placementModal, setPlacementModal] = useState<{ id: string; name: string; currentStatus: string; currentCompany?: string } | null>(null);
  const [placementForm, setPlacementForm] = useState({ status: 'Placed', company: '' });

  const loadStudents = () => {
    fetchStaffStudents()
      .then(({ students: raw }) => {
        setStudents((raw || []).map(mapStudentRecord));
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, []);

  const handleBlockToggle = async (id: string, block: boolean) => {
    if (!window.confirm(`Are you sure you want to ${block ? 'block' : 'unblock'} this student?`)) return;
    try {
      await blockStudent(id, block);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, isBlocked: block } : s));
    } catch (e: any) {
      alert('Failed to update block status: ' + e.message);
    }
  };

  const handleVerifyPlacement = async () => {
    if (!placementModal) return;
    const { id } = placementModal;
    if (placementForm.status === 'Placed' && !placementForm.company.trim()) {
      alert('Company name is required when marking as Placed.');
      return;
    }
    setVerifyingId(id);
    try {
      await updatePlacementStatus(id, placementForm.status as 'Placed' | 'Not Placed', placementForm.company || undefined);
      setStudents(prev => prev.map(s => s.id === id ? {
        ...s,
        placementVerified: true,
        status: placementForm.status as 'Placed' | 'Not Placed',
        company: placementForm.company || s.company,
      } : s));
      setPlacementModal(null);
    } catch (e: any) {
      alert('Failed to verify placement: ' + e.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyStudent = async (id: string) => {
    setVerifyingId(id);
    try {
      await verifyStudentByStaff(id, true);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, isVerified: true } : s));
      setViewStudent((prev: any) => prev ? { ...prev, profile: { ...prev.profile, is_verified: true } } : prev);
    } catch (e: any) {
      alert('Failed to verify student: ' + e.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const openPlacementModal = (student: StudentRecord) => {
    setPlacementForm({ status: student.status, company: student.company || '' });
    setPlacementModal({ id: student.id, name: student.name, currentStatus: student.status, currentCompany: student.company });
  };

  // Student profile modal
  const [viewStudent, setViewStudent] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [certUpdatingId, setCertUpdatingId] = useState<string | null>(null);

  const handleCertStatus = async (certId: string, status: 'approved' | 'rejected') => {
    setCertUpdatingId(certId);
    try {
      await updateCertStatus(certId, status);
      setViewStudent((prev: any) => ({
        ...prev,
        certifications: prev.certifications.map((c: any) =>
          c.id === certId ? { ...c, status } : c
        ),
      }));
    } catch (e: any) {
      alert('Failed to update certificate status: ' + e.message);
    } finally {
      setCertUpdatingId(null);
    }
  };

  const handleViewStudent = async (id: string) => {
    setViewStudent(null);
    setViewLoading(true);
    try {
      const data = await fetchStaffStudentById(id);
      setViewStudent(data);
    } catch (e: any) {
      alert('Failed to load student profile: ' + e.message);
    } finally {
      setViewLoading(false);
    }
  };

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

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter(student => {
      const matchesSearch = !q ||
        student.name.toLowerCase().includes(q) ||
        student.regNo.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'All' || student.dept === selectedDept.trim().toUpperCase();
      const matchesReadiness = student.readinessScore >= minReadiness;
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;

      return matchesSearch && matchesDept && matchesReadiness && matchesStatus;
    });
  }, [students, searchQuery, selectedDept, minReadiness, statusFilter]);

  const deptChartData = useMemo(() => {
    const map: Record<string, { dept: string; Placed: number; 'Not Placed': number }> = {};
    students.forEach(s => {
      if (!map[s.dept]) map[s.dept] = { dept: s.dept, Placed: 0, 'Not Placed': 0 };
      map[s.dept][s.status]++;
    });
    return Object.values(map);
  }, [students]);

  const placementPieData = useMemo(() => [
    { name: 'Placed', value: placedStudents.length },
    { name: 'Not Placed', value: unplacedStudents.length },
  ], [placedStudents.length, unplacedStudents.length]);

  const readinessDistData = useMemo(() => {
    const buckets = [{ range: '0–40', count: 0 }, { range: '41–60', count: 0 }, { range: '61–80', count: 0 }, { range: '81–100', count: 0 }];
    students.forEach(s => {
      if (s.readinessScore <= 40) buckets[0].count++;
      else if (s.readinessScore <= 60) buckets[1].count++;
      else if (s.readinessScore <= 80) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [students]);

  const PIE_COLORS = ['#059669', '#f97316'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      
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
          {onNavigateToReport && (
            <button
              onClick={onNavigateToReport}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#002D62] border border-[#002D62]/20 bg-[#002D62]/5 hover:bg-[#002D62]/10 rounded-xl transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Reports</span>
            </button>
          )}
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 border border-red-100 bg-red-50/50 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#002D62]" />
            <span className="ml-2 text-sm font-bold text-slate-500">Loading student roster...</span>
          </div>
        )}

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-xl">
            Failed to load students: {fetchError}
          </div>
        )}

        {!loading && !fetchError && <>
        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block mb-3">Live Placement Analytics</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
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
                </div>
              )}
            </div>

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

        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block mb-3">
            <span className="inline-flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5" />Placement Analytics Charts</span>
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">Placed vs Not Placed by Department</p>
              {deptChartData.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium py-8 text-center">No department data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptChartData} barCategoryGap="30%">
                    <XAxis dataKey="dept" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="Placed" fill="#059669" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Not Placed" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm flex flex-col">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">Overall Placement Ratio</p>
              {totalStudents === 0 ? (
                <p className="text-xs text-slate-400 font-medium py-8 text-center">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={placementPieData} cx="50%" cy="45%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}
                      style={{ fontSize: 10, fontWeight: 700 }}>
                      {placementPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">Readiness Score Distribution</p>
              {totalStudents === 0 ? (
                <p className="text-xs text-slate-400 font-medium py-8 text-center">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={readinessDistData} barCategoryGap="40%">
                    <XAxis dataKey="range" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="count" name="Students" fill="#002D62" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block">Student Search & Roster Control</span>

          {/* FILTERS CONSOLE BAR */}
          <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold border-b border-slate-50 pb-2">
              <SlidersHorizontal className="h-4 w-4 text-[#002D62]" />
              <span>Roster Filtration Controls</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#002D62] font-bold text-slate-700"
                >
                  <option value="All">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="MECH">MECH</option>
                  <option value="EEE">EEE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="AUTO MOBILE">AUTO MOBILE</option>
                  <option value="BIO MEDICAL">BIO MEDICAL</option>
                  <option value="SFE">SFE</option>
                  <option value="MBA">MBA</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>

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
              </div>
            </div>
          </div>

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
                        student.isBlocked ? 'border-red-100 bg-red-50/20' : isPlaced ? 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/5' : 'border-slate-100'
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

                        <p className="text-[11px] text-slate-500 font-medium truncate mb-3">{student.email}</p>

                        {!student.isVerified ? (
                          <button
                            onClick={() => handleVerifyStudent(student.id)}
                            disabled={verifyingId === student.id}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {verifyingId === student.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            {verifyingId === student.id ? 'Verifying...' : 'Verify Student Profile'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 mb-2">
                            <BadgeCheck className="h-3.5 w-3.5" /> Profile Verified
                          </div>
                        )}

                        {!student.placementVerified ? (
                          <button
                            onClick={() => openPlacementModal(student)}
                            disabled={verifyingId === student.id}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Verify Placement
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mb-2">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Placement Verified
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                          student.isBlocked ? 'bg-red-50 text-red-500' : isPlaced ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          ● {student.isBlocked ? 'Blocked' : student.status}
                        </span>

                        <div className="flex items-center gap-2">
                          {isPlaced && student.company && !student.isBlocked && (
                            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 max-w-[100px] truncate">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{student.company}</span>
                            </span>
                          )}
                          <button
                            onClick={() => handleViewStudent(student.id)}
                            title="View full profile"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleBlockToggle(student.id, !student.isBlocked)}
                            title={student.isBlocked ? 'Unblock student' : 'Block student'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              student.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-400 hover:bg-red-100'
                            }`}
                          >
                            {student.isBlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        </>
        }

      </div>

      {(viewStudent || viewLoading) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800 text-sm">Student Profile</h3>
              <button onClick={() => setViewStudent(null)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
            </div>
            {viewLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-[#002D62]" /></div>
            ) : viewStudent && (() => {
              const p = viewStudent.profile;
              const a = viewStudent.academic;
              return (
                <div className="p-5 space-y-4 text-[13px]">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider mb-2">Personal Details</p>
                    {[['Name', p.full_name], ['Register No', p.register_no], ['Department', p.branch], ['Degree', p.degree], ['Year', p.current_year], ['Semester', p.current_semester], ['Pass Out Year', p.pass_out_year], ['DOB', p.dob]].map(([k, v]) => v && (
                      <div key={k} className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="font-semibold text-slate-400">{k}</span>
                        <span className="text-slate-700 font-bold">{v}</span>
                      </div>
                    ))}
                    {p.linkedin_url && (
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="font-semibold text-slate-400">LinkedIn</span>
                        <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-xs truncate max-w-[180px]">View Profile</a>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider mb-2">Contact</p>
                    <div className="flex items-center gap-2 text-slate-600"><Mail className="h-3.5 w-3.5" /><span>{p.email}</span></div>
                    <div className="flex items-center gap-2 text-slate-600"><Phone className="h-3.5 w-3.5" /><span>{p.phone || '—'}</span></div>
                    {p.alternative_phone && <div className="flex items-center gap-2 text-slate-600"><Phone className="h-3.5 w-3.5" /><span>{p.alternative_phone} (Alt)</span></div>}
                    {p.address && <div className="flex items-start gap-2 text-slate-600"><MapPin className="h-3.5 w-3.5 mt-0.5" /><span>{[p.address, p.district, p.state_name, p.pin_code].filter(Boolean).join(', ')}</span></div>}
                  </div>

                  {a && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider mb-2">Academic Records</p>
                      {[['10th School', a.tenth_school], ['10th %', a.tenth_percentage], ['12th School', a.twelfth_school], ['12th %', a.twelfth_percentage], ['Diploma %', a.diploma_percentage], ['UG College', a.ug_college], ['UG CGPA', a.ug_cgpa], ['PG College', a.pg_college], ['PG CGPA', a.pg_cgpa], ['Placement', a.placement_status], ['Company', a.company_name]].map(([k, v]) => v != null && v !== '' && (
                        <div key={k} className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="font-semibold text-slate-400">{k}</span>
                          <span className="text-slate-700 font-bold">{String(v)}</span>
                        </div>
                      ))}
                      {Array.isArray(a.sgpa_values) && a.sgpa_values.some((v: string) => v) && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">SGPA per Semester</p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {a.sgpa_values.map((v: string, i: number) => (
                              <div key={i} className={`p-2 rounded-lg text-center border ${v ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                                <span className="text-[9px] text-slate-400 block">S{i+1}</span>
                                <span className="text-xs font-black text-[#002D62]">{v || '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {Array.isArray(viewStudent.skills) && viewStudent.skills.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider mb-3">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {viewStudent.skills.map((sk: any, i: number) => (
                          <span key={i} className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg">
                            {sk.skill_name}{sk.proficiency ? ` · ${sk.proficiency}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(viewStudent.certifications) && viewStudent.certifications.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider">Certifications</p>
                      {viewStudent.certifications.map((c: any) => (
                        <div key={c.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                          <p className="font-bold text-slate-700 text-xs">{c.certification_name}</p>
                          <p className="text-[11px] text-slate-500">{c.issuer}{c.category ? ` · ${c.category}` : ''}</p>
                          {c.certificate_url && (
                            <a href={c.certificate_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 font-bold">View Certificate</a>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {c.status?.toLowerCase() === 'approved' ? (
                              <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</span>
                            ) : c.status?.toLowerCase() === 'rejected' ? (
                              <span className="text-[10px] font-black text-red-500 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleCertStatus(c.id, 'approved')}
                                  disabled={certUpdatingId === c.id}
                                  className="px-2 py-0.5 text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                >
                                  {certUpdatingId === c.id ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleCertStatus(c.id, 'rejected')}
                                  disabled={certUpdatingId === c.id}
                                  className="px-2 py-0.5 text-[10px] font-black bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {Array.isArray(viewStudent.internships) && viewStudent.internships.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider">Internships</p>
                      {viewStudent.internships.map((intern: any, i: number) => (
                        <div key={i} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                          <p className="font-bold text-slate-700 text-xs">{intern.role} @ {intern.company_name}</p>
                          {intern.duration && <p className="text-[11px] text-slate-500">{intern.duration}</p>}
                          {intern.certificate_url && (
                            <a href={intern.certificate_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 font-bold">View Certificate</a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {viewStudent.resume?.resume_url && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider mb-2">Resume</p>
                      <a href={viewStudent.resume.resume_url} target="_blank" rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> View / Download Resume
                      </a>
                    </div>
                  )}

                  {viewStudent.analysis && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <p className="text-[10px] font-black text-[#002D62] uppercase tracking-wider mb-1">Placement Readiness Analysis</p>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="font-semibold text-slate-400">Readiness Score</span>
                        <span className="font-black text-[#002D62]">{viewStudent.analysis.readiness_score}%</span>
                      </div>
                      {viewStudent.analysis.readiness_status && (
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="font-semibold text-slate-400">Status</span>
                          <span className="font-bold text-slate-700">{viewStudent.analysis.readiness_status}</span>
                        </div>
                      )}
                      {viewStudent.analysis.strengths && (
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase mt-2 mb-1">Strengths</p>
                          <p className="text-xs text-slate-600">{viewStudent.analysis.strengths}</p>
                        </div>
                      )}
                      {viewStudent.analysis.weaknesses && (
                        <div>
                          <p className="text-[10px] font-bold text-orange-500 uppercase mt-2 mb-1">Weaknesses</p>
                          <p className="text-xs text-slate-600">{viewStudent.analysis.weaknesses}</p>
                        </div>
                      )}
                      {viewStudent.analysis.recommendations && (
                        <div>
                          <p className="text-[10px] font-bold text-blue-600 uppercase mt-2 mb-1">Recommendations</p>
                          <p className="text-xs text-slate-600">{viewStudent.analysis.recommendations}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black ${p.is_verified ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.is_verified ? <BadgeCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {p.is_verified ? 'Profile Verified' : 'Pending Verification'}
                    </span>
                    {!p.is_verified && (
                      <button
                        onClick={() => handleVerifyStudent(p.id)}
                        disabled={verifyingId === p.id}
                        className="text-[11px] font-bold text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {verifyingId === p.id ? <><Loader2 className="h-3 w-3 animate-spin" /> Verifying...</> : 'Verify Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {placementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-sm">Verify Placement</h3>
              <button onClick={() => setPlacementModal(null)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-slate-500">Set official placement status for <span className="font-bold text-slate-700">{placementModal.name}</span></p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Placement Status</label>
                <div className="flex gap-2">
                  {['Placed', 'Not Placed'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPlacementForm(f => ({ ...f, status: s }))}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                        placementForm.status === s
                          ? s === 'Placed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
              {placementForm.status === 'Placed' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. TCS, Infosys..."
                    value={placementForm.company}
                    onChange={e => setPlacementForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#002D62] font-medium"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setPlacementModal(null)}
                className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >Cancel</button>
              <button
                onClick={handleVerifyPlacement}
                disabled={!!verifyingId || (placementForm.status === 'Placed' && !placementForm.company.trim())}
                className="flex-1 py-2 text-xs font-bold bg-[#002D62] text-white rounded-xl hover:bg-[#003580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {verifyingId ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</> : 'Confirm & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}