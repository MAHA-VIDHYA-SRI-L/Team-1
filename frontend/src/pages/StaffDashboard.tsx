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
  FileText,
  Download
} from 'lucide-react';
import { fetchStaffStudents, fetchStaffStudentById, updatePlacementStatus, verifyStudentByStaff, blockStudent, updateCertStatus, mapStudentRecord, type StudentRecord } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ThemeToggle } from '../components/ThemeToggle';

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

  const exportRosterToCSV = (dataToExport = students) => {
    if (!dataToExport || dataToExport.length === 0) {
      alert('No students to export.');
      return;
    }
    const headers = ['Register No', 'Full Name', 'Email', 'Department', 'Readiness Score', 'Placement Status', 'Company', 'Profile Verified', 'Blocked'];
    const rows = dataToExport.map(s => [
      s.regNo || '',
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.email || '',
      s.dept || '',
      `${s.readinessScore || 0}%`,
      s.status || '',
      `"${(s.company || '').replace(/"/g, '""')}"`,
      s.isVerified ? 'Yes' : 'No',
      s.isBlocked ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `placemate_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col transition-colors text-slate-800 dark:text-slate-100">
      
      <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#002D62] to-[#00428c] flex items-center justify-center shadow-md shadow-[#002D62]/20 text-white font-black text-xl tracking-tighter">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Placemate</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#002D62]/10 dark:bg-blue-900/40 text-[#002D62] dark:text-blue-300 border border-[#002D62]/20 dark:border-blue-700/50 uppercase tracking-wider">
                  STAFF PORTAL
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  SYSTEM ACTIVE · ROSTER MANAGEMENT
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle variant="button" />
            <div className="text-right hidden sm:block mr-2">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">{user.fullName}</p>
              <p className="text-[11px] font-bold text-orange-500 dark:text-orange-400 mt-1 uppercase tracking-wider">Placement Officer</p>
            </div>
            {onNavigateToReport && (
              <button
                onClick={onNavigateToReport}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#002D62] dark:text-blue-300 bg-[#002D62]/5 dark:bg-blue-950/40 hover:bg-[#002D62]/10 dark:hover:bg-blue-900/40 border border-[#002D62]/20 dark:border-blue-800/50 rounded-xl transition-all shadow-2xs hover:scale-102 active:scale-98"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Reports</span>
              </button>
            )}
            <button
              onClick={() => exportRosterToCSV(students)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl transition-all shadow-2xs hover:scale-102 active:scale-98"
              title="Export complete student roster to CSV spreadsheet"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all shadow-2xs hover:scale-102 active:scale-98 border border-red-100 dark:border-red-900/40"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

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
          <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase px-1 block mb-3">Live Placement Analytics & Roster Metrics</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Enrolled Students */}
            <div 
              onClick={() => setShowDeptBreakdown(!showDeptBreakdown)}
              className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm cursor-pointer select-none relative transition-all hover:border-[#002D62]/40 dark:hover:border-blue-500 hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-[#002D62] to-[#00428c] text-white rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
                    <Users className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold px-2.5 py-1 text-slate-600 dark:text-slate-300 rounded-lg transition-colors">
                    {showDeptBreakdown ? 'Hide Breakdown ✕' : 'Depts ▾'}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{totalStudents}</p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide mt-0.5">Total Enrolled Students</p>
                </div>
              </div>

              {showDeptBreakdown && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 animate-fadeIn max-h-[160px] overflow-y-auto pr-1">
                  <p className="text-[10px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">Department Matrix Breakup:</p>
                  {Object.entries(deptBreakdown).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <span>{dept} Department</span>
                      <span className="bg-[#002D62] dark:bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{count} Users</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 2: Placed Students */}
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/20 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl shadow-sm w-fit">
                  <Briefcase className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{placedStudents.length}</p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide mt-0.5">Students Placed Successfully</p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Placement Concentration</p>
                {Object.keys(placedDeptBreakdown).length === 0 ? (
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">No placements logs found.</p>
                ) : (
                  Object.entries(placedDeptBreakdown).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">
                      <span>{dept} Division</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">{count} Placed</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card 3: Unplaced Bench */}
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm bg-gradient-to-br from-white via-white to-orange-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-orange-950/20 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-sm w-fit">
                  <XCircle className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-black text-orange-600 dark:text-orange-400 tracking-tight">{unplacedStudents.length}</p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide mt-0.5">Remaining Bench Strength</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">Unplaced Volume by Dept</p>
                {Object.entries(unplacedDeptBreakdown).map(([dept, count]) => (
                  <div key={dept} className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-orange-50/50 dark:bg-orange-950/30 px-2 py-1 rounded-lg">
                    <span>{dept} Branch</span>
                    <span className="text-orange-600 dark:text-orange-400 font-black">{count} Awaiting</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Verified Profiles */}
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-blue-950/20 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-sm w-fit">
                  <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{students.filter(s => s.isVerified).length}</p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide mt-0.5">Verified Student Profiles</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-xl">
                <span>Verification Ratio</span>
                <span className="text-blue-700 dark:text-blue-400 font-black">
                  {totalStudents > 0 ? Math.round((students.filter(s => s.isVerified).length / totalStudents) * 100) : 0}% Verified
                </span>
              </div>
            </div>

          </div>
        </div>

        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block mb-3">
            <span className="inline-flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5" />Placement Analytics Charts</span>
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 rounded-[24px] p-5 shadow-sm">
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Placed vs Not Placed by Department</p>
              {deptChartData.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium py-8 text-center">No department data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptChartData} barCategoryGap="30%">
                    <XAxis dataKey="dept" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: '#0f172a', color: '#f8fafc' }} />
                    <Bar dataKey="Placed" fill="#059669" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Not Placed" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 rounded-[24px] p-5 shadow-sm flex flex-col">
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Overall Placement Ratio</p>
              {totalStudents === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium py-8 text-center">No data yet.</p>
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

            <div className="lg:col-span-3 bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 rounded-[24px] p-5 shadow-sm">
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Readiness Score Distribution</p>
              {totalStudents === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium py-8 text-center">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={readinessDistData} barCategoryGap="40%">
                    <XAxis dataKey="range" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: '#0f172a', color: '#f8fafc' }} />
                    <Bar dataKey="count" name="Students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        </div>

        <div className="space-y-4">
          <span className="text-[11px] font-black tracking-widest text-slate-400 dark:text-slate-400 uppercase px-1 block">Student Search & Roster Control Console</span>

          {/* FILTERS CONSOLE BAR */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-6 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white text-xs font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3">
              <SlidersHorizontal className="h-4 w-4 text-[#002D62] dark:text-blue-400" />
              <span>Roster Filtration & Search Console</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
              <div className="relative">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Search Credentials</label>
                <div className="relative">
                  <div className="absolute left-2 top-1.5 bottom-1.5 flex items-center justify-center px-2.5 rounded-xl bg-gradient-to-br from-[#002D62] to-[#00428c] text-white shadow-xs">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Student Name or Reg No..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 text-xs bg-white dark:bg-slate-800 border-2 border-slate-200/80 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-400 font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-[#002D62]/40 dark:hover:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Filter Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-800 border-2 border-slate-200/80 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-400 font-bold text-slate-700 dark:text-slate-200 hover:border-[#002D62]/40 dark:hover:border-blue-500 transition-colors"
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
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Placement Status</label>
                <div className="flex gap-1.5">
                  {['All', 'Placed', 'Not Placed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`flex-1 py-2.5 rounded-2xl text-[11px] font-bold border-2 transition-all ${
                        statusFilter === st 
                          ? 'bg-gradient-to-r from-[#002D62] to-[#00428c] dark:from-blue-600 dark:to-blue-500 text-white border-[#002D62] dark:border-blue-500 shadow-sm' 
                          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Min Readiness</label>
                  <span className="text-xs font-black text-white bg-[#002D62] dark:bg-blue-600 px-2 py-0.5 rounded-lg">{minReadiness}% +</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={minReadiness}
                  onChange={(e) => setMinReadiness(Number(e.target.value))}
                  className="w-full accent-[#002D62] dark:accent-blue-400 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-bold text-slate-500">Filtered Results ({filteredStudents.length} matching)</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportRosterToCSV(filteredStudents)}
                  disabled={filteredStudents.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#002D62] dark:text-blue-300 bg-[#002D62]/5 dark:bg-blue-950/40 hover:bg-[#002D62]/10 border border-[#002D62]/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-3 w-3" />
                  <span>Export Filtered ({filteredStudents.length})</span>
                </button>
                {(searchQuery || selectedDept !== 'All' || minReadiness > 0 || statusFilter !== 'All') && (
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedDept('All'); setMinReadiness(0); setStatusFilter('All'); }}
                    className="text-[10px] text-orange-500 font-bold hover:underline"
                  >
                    Clear Active Filters
                  </button>
                )}
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/90 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <Filter className="h-6 w-6 text-slate-300 dark:text-slate-600 mb-2" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Student Records Found</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">
                  Adjust your filter conditions or structural parameter values to review alternate matches.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredStudents.map((student) => {
                  const isPlaced = student.status === 'Placed';
                  return (
                    <div 
                      key={student.id}
                      className={`bg-white dark:bg-slate-800/90 border rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${
                        student.isBlocked ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20' : isPlaced ? 'border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-white via-white to-emerald-50/20 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/20' : 'border-slate-200/80 dark:border-slate-700/80 hover:border-[#002D62]/40 dark:hover:border-blue-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#002D62] to-[#00428c] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm shadow-[#002D62]/10">
                              {student.name ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono font-extrabold text-[#002D62] dark:text-blue-400 bg-[#002D62]/10 dark:bg-blue-900/40 px-2 py-0.5 rounded-md inline-block mb-1">
                                {student.regNo || 'NO-REG'}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate" title={student.name}>{student.name}</h4>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-400 block tracking-wider">Readiness</span>
                            <span className={`text-xs font-black flex items-center gap-0.5 justify-end px-2 py-0.5 rounded-lg mt-0.5 ${
                              student.readinessScore >= 85 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40' : student.readinessScore >= 65 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                            }`}>
                              <Sparkles className="h-3 w-3 shrink-0" />
                              {student.readinessScore}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 mb-4 bg-slate-50/80 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-[#002D62] dark:text-blue-400" />
                            <span className="truncate">{student.dept} Branch</span>
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate pl-5">{student.email}</p>
                        </div>

                        {!student.isVerified ? (
                          <button
                            onClick={() => handleVerifyStudent(student.id)}
                            disabled={verifyingId === student.id}
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-900/40 rounded-xl transition-all mb-2.5 shadow-2xs hover:scale-101 active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {verifyingId === student.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
                            {verifyingId === student.id ? 'Verifying...' : 'Verify Student Profile'}
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-xl mb-2.5">
                            <BadgeCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Profile Verified
                          </div>
                        )}

                        {!student.placementVerified ? (
                          <button
                            onClick={() => openPlacementModal(student)}
                            disabled={verifyingId === student.id}
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#002D62] dark:text-blue-300 bg-[#002D62]/5 dark:bg-blue-950/40 hover:bg-[#002D62]/10 dark:hover:bg-blue-900/40 border border-[#002D62]/20 dark:border-blue-800/50 rounded-xl transition-all mb-2.5 shadow-2xs hover:scale-101 active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-[#002D62] dark:text-blue-400" /> Verify Placement
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl mb-2.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Placement Verified
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border ${
                          student.isBlocked ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40' : isPlaced ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/40'
                        }`}>
                          ● {student.isBlocked ? 'Blocked' : student.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isPlaced && student.company && !student.isBlocked && (
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-xl border border-slate-200/80 dark:border-slate-600 max-w-[100px] truncate" title={student.company}>
                              <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400 shrink-0" />
                              <span className="truncate">{student.company}</span>
                            </span>
                          )}
                          <button
                            onClick={() => handleViewStudent(student.id)}
                            title="View full profile"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#002D62] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleBlockToggle(student.id, !student.isBlocked)}
                            title={student.isBlocked ? 'Unblock student' : 'Block student'}
                            className={`p-2 rounded-xl transition-colors ${
                              student.isBlocked ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white' : 'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white'
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Student Profile</h3>
              <button onClick={() => setViewStudent(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X className="h-4 w-4" /></button>
            </div>
            {viewLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-[#002D62] dark:text-blue-400" /></div>
            ) : viewStudent && (() => {
              const p = viewStudent.profile;
              const a = viewStudent.academic;
              return (
                <div className="p-5 space-y-4 text-[13px]">
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-slate-700/60">
                    <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-2">Personal Details</p>
                    {[['Name', p.full_name], ['Register No', p.register_no], ['Department', p.branch], ['Degree', p.degree], ['Year', p.current_year], ['Semester', p.current_semester], ['Pass Out Year', p.pass_out_year], ['DOB', p.dob]].map(([k, v]) => v && (
                      <div key={k} className="flex justify-between border-b border-slate-100 dark:border-slate-700/80 pb-1">
                        <span className="font-semibold text-slate-400 dark:text-slate-400">{k}</span>
                        <span className="text-slate-700 dark:text-slate-200 font-bold">{v}</span>
                      </div>
                    ))}
                    {p.linkedin_url && (
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/80 pb-1">
                        <span className="font-semibold text-slate-400 dark:text-slate-400">LinkedIn</span>
                        <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-bold text-xs truncate max-w-[180px]">View Profile</a>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-slate-700/60">
                    <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-2">Contact</p>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Mail className="h-3.5 w-3.5" /><span>{p.email}</span></div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Phone className="h-3.5 w-3.5" /><span>{p.phone || '—'}</span></div>
                    {p.alternative_phone && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Phone className="h-3.5 w-3.5" /><span>{p.alternative_phone} (Alt)</span></div>}
                    {p.address && <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300"><MapPin className="h-3.5 w-3.5 mt-0.5" /><span>{[p.address, p.district, p.state_name, p.pin_code].filter(Boolean).join(', ')}</span></div>}
                  </div>

                  {a && (
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-slate-700/60">
                      <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-2">Academic Records</p>
                      {[['10th School', a.tenth_school], ['10th %', a.tenth_percentage], ['12th School', a.twelfth_school], ['12th %', a.twelfth_percentage], ['Diploma %', a.diploma_percentage], ['UG College', a.ug_college], ['UG CGPA', a.ug_cgpa], ['PG College', a.pg_college], ['PG CGPA', a.pg_cgpa], ['Placement', a.placement_status], ['Company', a.company_name]].map(([k, v]) => v != null && v !== '' && (
                        <div key={k} className="flex justify-between border-b border-slate-100 dark:border-slate-700/80 pb-1">
                          <span className="font-semibold text-slate-400 dark:text-slate-400">{k}</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold">{String(v)}</span>
                        </div>
                      ))}
                      {Array.isArray(a.sgpa_values) && a.sgpa_values.some((v: string) => v) && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">SGPA per Semester</p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {a.sgpa_values.map((v: string, i: number) => (
                              <div key={i} className={`p-2 rounded-lg text-center border ${v ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-800/50' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700 opacity-40'}`}>
                                <span className="text-[9px] text-slate-400 block">S{i+1}</span>
                                <span className="text-xs font-black text-[#002D62] dark:text-blue-300">{v || '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {Array.isArray(viewStudent.skills) && viewStudent.skills.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60">
                      <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-3">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {viewStudent.skills.map((sk: any, i: number) => (
                          <span key={i} className="text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 px-2.5 py-1 rounded-lg">
                            {sk.skill_name}{sk.proficiency ? ` · ${sk.proficiency}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(viewStudent.certifications) && viewStudent.certifications.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-700/60">
                      <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider">Certifications</p>
                      {viewStudent.certifications.map((c: any) => (
                        <div key={c.id} className="border-b border-slate-100 dark:border-slate-700/80 pb-2 last:border-0 last:pb-0">
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-xs">{c.certification_name}</p>
                          {c.certificate_url && (
                            <a href={c.certificate_url.startsWith('http') ? c.certificate_url : `${import.meta.env.VITE_SUPABASE_URL || ''}${c.certificate_url}`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">View Certificate</a>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {c.status?.toLowerCase() === 'approved' ? (
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</span>
                            ) : c.status?.toLowerCase() === 'rejected' ? (
                              <span className="text-[10px] font-black text-red-500 dark:text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleCertStatus(c.id, 'approved')}
                                  disabled={certUpdatingId === c.id}
                                  className="px-2 py-0.5 text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                >
                                  {certUpdatingId === c.id ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleCertStatus(c.id, 'rejected')}
                                  disabled={certUpdatingId === c.id}
                                  className="px-2 py-0.5 text-[10px] font-black bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
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
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-700/60">
                      <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider">Internships</p>
                      {viewStudent.internships.map((intern: any, i: number) => (
                        <div key={i} className="border-b border-slate-100 dark:border-slate-700/80 pb-2 last:border-0 last:pb-0">
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-xs">{intern.role} @ {intern.company_name}</p>
                          {intern.duration && <p className="text-[11px] text-slate-500 dark:text-slate-400">{intern.duration}</p>}
                          {intern.certificate_url && (
                            <a href={intern.certificate_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">View Certificate</a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {viewStudent.resume?.resume_url && (
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60">
                      <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-2">Resume</p>
                      <a href={viewStudent.resume.resume_url} target="_blank" rel="noreferrer"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> View / Download Resume
                      </a>
                    </div>
                  )}

                  {viewStudent.analysis && (
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-slate-700/60">
                      <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">Placement Readiness Analysis</p>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/80 pb-1">
                        <span className="font-semibold text-slate-400 dark:text-slate-400">Readiness Score</span>
                        <span className="font-black text-[#002D62] dark:text-blue-400">{viewStudent.analysis.readiness_score}%</span>
                      </div>
                      {viewStudent.analysis.readiness_status && (
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/80 pb-1">
                          <span className="font-semibold text-slate-400 dark:text-slate-400">Status</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{viewStudent.analysis.readiness_status}</span>
                        </div>
                      )}
                      {viewStudent.analysis.strengths && (
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-2 mb-1">Strengths</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{viewStudent.analysis.strengths}</p>
                        </div>
                      )}
                      {viewStudent.analysis.weaknesses && (
                        <div>
                          <p className="text-[10px] font-bold text-orange-500 dark:text-orange-400 uppercase mt-2 mb-1">Weaknesses</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{viewStudent.analysis.weaknesses}</p>
                        </div>
                      )}
                      {viewStudent.analysis.recommendations && (
                        <div>
                          <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mt-2 mb-1">Recommendations</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{viewStudent.analysis.recommendations}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black ${p.is_verified ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'}`}>
                      {p.is_verified ? <BadgeCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {p.is_verified ? 'Profile Verified' : 'Pending Verification'}
                    </span>
                    {!p.is_verified && (
                      <button
                        onClick={() => handleVerifyStudent(p.id)}
                        disabled={verifyingId === p.id}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 dark:text-white text-sm">Verify Placement</h3>
              <button onClick={() => setPlacementModal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Set official placement status for <span className="font-bold text-slate-700 dark:text-slate-200">{placementModal.name}</span></p>
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
                          : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
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
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-400 font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setPlacementModal(null)}
                className="flex-1 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >Cancel</button>
              <button
                onClick={handleVerifyPlacement}
                disabled={!!verifyingId || (placementForm.status === 'Placed' && !placementForm.company.trim())}
                className="flex-1 py-2 text-xs font-bold bg-[#002D62] dark:bg-blue-600 text-white rounded-xl hover:bg-[#003580] dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
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