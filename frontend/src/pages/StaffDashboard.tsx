import { useState, useMemo, useEffect } from 'react';
import {
  Users, Briefcase, XCircle, Search, SlidersHorizontal, LogOut, Filter,
  GraduationCap, Sparkles, MapPin, BarChart2, Ban, CheckCircle2,
  ShieldCheck, Eye, Phone, Mail, BadgeCheck, Clock, FileText, Download,
} from 'lucide-react';
import { fetchStaffStudents, fetchStaffStudentById, updatePlacementStatus, verifyStudentByStaff, blockStudent, updateCertStatus, mapStudentRecord, type StudentRecord } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Button, Card, CardHeader, CardBody, StatCard, SectionCard, PageContainer, PageHeader,
  Modal, Input, Select, Badge, EmptyState, SectionLoader, ThemeToggle,
} from '../components/ui';

interface StaffDashboardProps {
  user: {
    fullName: string;
    email: string;
  };
  onLogout: () => void;
  onNavigateToReport?: () => void;
  onBackToAdmin?: () => void;
}

export default function StaffDashboard({ user, onLogout, onNavigateToReport, onBackToAdmin }: StaffDashboardProps) {
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
  const [viewError, setViewError] = useState<string | null>(null);
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
    setViewError(null);
    setViewLoading(true);
    try {
      const data = await fetchStaffStudentById(id);
      setViewStudent(data);
    } catch (e: any) {
      setViewError(e.message || 'Failed to load student profile.');
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">Placemate</span>
            <Badge variant="brand">Staff Portal</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="button" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden sm:block">{user.fullName}</span>
            {onBackToAdmin && (
              <Button variant="secondary" size="sm" icon={<LogOut className="h-3.5 w-3.5" />} onClick={onBackToAdmin}>
                <span className="hidden md:inline">Admin Console</span>
              </Button>
            )}
            {onNavigateToReport && (
              <Button variant="secondary" size="sm" icon={<FileText className="h-3.5 w-3.5" />} onClick={onNavigateToReport}>
                Reports
              </Button>
            )}
            <Button variant="success" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => exportRosterToCSV(students)}>
              <span className="hidden md:inline">Export CSV</span>
            </Button>
            {!onBackToAdmin && (
              <Button variant="danger" size="sm" icon={<LogOut className="h-3.5 w-3.5" />} onClick={onLogout}>
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <PageContainer width="wide">

        <PageHeader
          title="Staff Dashboard"
          subtitle="Live Placement Analytics & Roster Management"
        />

        {loading && <SectionLoader message="Loading student roster..." />}

        {fetchError && (
          <EmptyState
            icon={<XCircle className="h-8 w-8" />}
            title="Failed to Load Student Roster"
            description={fetchError}
            action={
              <Button variant="secondary" size="sm" onClick={() => { setFetchError(null); setLoading(true); loadStudents(); }}>
                Retry
              </Button>
            }
          />
        )}

        {!loading && !fetchError && <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
          <StatCard
            label="Total Enrolled Students"
            value={totalStudents}
            icon={<Users className="h-5 w-5 text-white" />}
            iconBg="bg-gradient-to-br from-[#002D62] to-[#00428c]"
            onClick={() => setShowDeptBreakdown(!showDeptBreakdown)}
            trend={
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {showDeptBreakdown ? (
                  Object.entries(deptBreakdown).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <span>{dept}</span>
                      <span className="bg-[#002D62] dark:bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{count}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">Click to view dept breakdown</span>
                )}
              </div>
            }
          />

          <StatCard
            label="Students Placed Successfully"
            value={placedStudents.length}
            icon={<Briefcase className="h-5 w-5 text-white" />}
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
            trend={
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Placement Concentration</p>
                {Object.keys(placedDeptBreakdown).length === 0 ? (
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">No placements yet.</p>
                ) : (
                  Object.entries(placedDeptBreakdown).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">
                      <span>{dept}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">{count}</span>
                    </div>
                  ))
                )}
              </div>
            }
          />

          <StatCard
            label="Remaining Bench Strength"
            value={unplacedStudents.length}
            icon={<XCircle className="h-5 w-5 text-white" />}
            iconBg="bg-gradient-to-br from-orange-500 to-amber-600"
            trend={
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">Unplaced by Dept</p>
                {Object.entries(unplacedDeptBreakdown).map(([dept, count]) => (
                  <div key={dept} className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-orange-50/50 dark:bg-orange-950/30 px-2 py-1 rounded-lg">
                    <span>{dept}</span>
                    <span className="text-orange-600 dark:text-orange-400 font-black">{count}</span>
                  </div>
                ))}
              </div>
            }
          />

          <StatCard
            label="Verified Student Profiles"
            value={students.filter(s => s.isVerified).length}
            icon={<ShieldCheck className="h-5 w-5 text-white" />}
            iconBg="bg-gradient-to-br from-blue-600 to-indigo-700"
            trend={
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Verification Ratio</span>
                <span className="text-blue-700 dark:text-blue-400 font-black">
                  {totalStudents > 0 ? Math.round((students.filter(s => s.isVerified).length / totalStudents) * 100) : 0}% Verified
                </span>
              </div>
            }
          />

        </div>

        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block mb-3">
            <span className="inline-flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5" />Placement Analytics Charts</span>
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 rounded-[24px] p-5 shadow-sm">
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Placed vs Not Placed by Department</p>
              {deptChartData.length === 0 ? (
                <EmptyState icon={<BarChart2 className="h-6 w-6" />} title="No Department Data" description="Data will appear once students are loaded." />
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
                <EmptyState icon={<BarChart2 className="h-6 w-6" />} title="No Placement Data" description="Placement ratios will appear once students are loaded." />
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
                <EmptyState icon={<BarChart2 className="h-6 w-6" />} title="No Readiness Data" description="Score distribution will appear once students are loaded." />
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

          <SectionCard
            title="Roster Filtration & Search"
            action={<SlidersHorizontal className="h-4 w-4 text-[#002D62] dark:text-blue-400" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <Input
                  placeholder="Student Name or Reg No..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="h-3.5 w-3.5" />}
                />
              </div>

              <div>
                <Select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
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
                </Select>
              </div>

              <div className="flex gap-1.5">
                {['All', 'Placed', 'Not Placed'].map((st) => (
                  <Button
                    key={st}
                    type="button"
                    size="sm"
                    variant={statusFilter === st ? 'primary' : 'secondary'}
                    onClick={() => setStatusFilter(st)}
                    className="flex-1"
                  >
                    {st}
                  </Button>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Min Readiness</span>
                  <span className="text-xs font-black text-white bg-[#002D62] dark:bg-blue-600 px-2 py-0.5 rounded-lg">{minReadiness}%+</span>
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
          </SectionCard>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-bold text-slate-500">Filtered Results ({filteredStudents.length} matching)</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download className="h-3 w-3" />}
                  onClick={() => exportRosterToCSV(filteredStudents)}
                  disabled={filteredStudents.length === 0}
                >
                  Export Filtered ({filteredStudents.length})
                </Button>
                {(searchQuery || selectedDept !== 'All' || minReadiness > 0 || statusFilter !== 'All') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSearchQuery(''); setSelectedDept('All'); setMinReadiness(0); setStatusFilter('All'); }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <EmptyState
                icon={<Filter className="h-6 w-6" />}
                title="No Student Records Found"
                description="Adjust your filter conditions to review alternate matches."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredStudents.map((student) => {
                  const isPlaced = student.status === 'Placed';
                  const readinessBadgeVariant = student.readinessScore >= 85 ? 'success' : student.readinessScore >= 65 ? 'info' : 'warning';
                  return (
                    <Card
                      key={student.id}
                      className={`hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                        student.isBlocked ? 'border-red-200 dark:border-red-900/50' :
                        isPlaced ? 'border-emerald-200/80 dark:border-emerald-900/50' : ''
                      }`}
                    >
                      <CardHeader
                        action={
                          <Badge variant={readinessBadgeVariant}>
                            <Sparkles className="h-3 w-3" />
                            {student.readinessScore}%
                          </Badge>
                        }
                      >
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#002D62] to-[#00428c] text-white flex items-center justify-center font-black text-xs shrink-0">
                          {student.name ? student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-extrabold text-[#002D62] dark:text-blue-400 bg-[#002D62]/10 dark:bg-blue-900/40 px-1.5 py-0.5 rounded inline-block leading-none mb-0.5">
                            {student.regNo || 'NO-REG'}
                          </span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{student.name}</p>
                        </div>
                      </CardHeader>

                      <CardBody className="space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-[#002D62] dark:text-blue-400 shrink-0" />
                            <span className="truncate">{student.dept}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pl-5">{student.email}</p>
                        </div>

                        {!student.isVerified ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full justify-center text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                            icon={<ShieldCheck className="h-3.5 w-3.5" />}
                            loading={verifyingId === student.id}
                            disabled={verifyingId === student.id}
                            onClick={() => handleVerifyStudent(student.id)}
                          >
                            {verifyingId === student.id ? 'Verifying...' : 'Verify Profile'}
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-xl">
                            <BadgeCheck className="h-3.5 w-3.5" /> Profile Verified
                          </div>
                        )}

                        {!student.placementVerified ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full justify-center"
                            icon={<ShieldCheck className="h-3.5 w-3.5" />}
                            disabled={verifyingId === student.id}
                            onClick={() => openPlacementModal(student)}
                          >
                            Verify Placement
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Placement Verified
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <Badge
                            variant={student.isBlocked ? 'danger' : isPlaced ? 'success' : 'warning'}
                            dot
                          >
                            {student.isBlocked ? 'Blocked' : student.status}
                          </Badge>

                          <div className="flex items-center gap-1.5">
                            {isPlaced && student.company && !student.isBlocked && (
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg max-w-[90px] truncate" title={student.company}>
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{student.company}</span>
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="h-3.5 w-3.5" />}
                              onClick={() => handleViewStudent(student.id)}
                              title="View full profile"
                            />
                            <Button
                              variant={student.isBlocked ? 'success' : 'danger'}
                              size="sm"
                              icon={student.isBlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                              onClick={() => handleBlockToggle(student.id, !student.isBlocked)}
                              title={student.isBlocked ? 'Unblock student' : 'Block student'}
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        </>
        }

      </PageContainer>

      <Modal
        open={!!(viewStudent || viewLoading || viewError)}
        onClose={() => { setViewStudent(null); setViewError(null); }}
        title="Student Profile"
        maxWidth="max-w-2xl"
      >
        {viewLoading ? (
          <SectionLoader message="Loading profile..." />
        ) : viewError ? (
          <EmptyState
            icon={<XCircle className="h-8 w-8" />}
            title="Failed to Load Profile"
            description={viewError}
          />
        ) : viewStudent && (() => {
          const p = viewStudent.profile;
          const a = viewStudent.academic;
          return (
            <div className="space-y-4 text-[13px]">

                  {/* ── Personal Information ── */}
                  <SectionCard title="Personal Information">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      <Card>
                        <CardBody className="space-y-2">
                          <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">Identity</p>
                          {[['Name', p.full_name], ['Register No', p.register_no], ['Department', p.branch], ['Degree', p.degree], ['Year', p.current_year], ['Semester', p.current_semester], ['Pass Out Year', p.pass_out_year], ['DOB', p.dob]].map(([k, v]) => v && (
                            <div key={k} className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1 last:border-0 last:pb-0">
                              <span className="text-xs font-semibold text-slate-400">{k}</span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{v}</span>
                            </div>
                          ))}
                          {p.linkedin_url && (
                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1 last:border-0 last:pb-0">
                              <span className="text-xs font-semibold text-slate-400">LinkedIn</span>
                              <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View Profile</a>
                            </div>
                          )}
                        </CardBody>
                      </Card>

                      <Card>
                        <CardBody className="space-y-3">
                          <p className="text-[10px] font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">Contact</p>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <Mail className="h-3.5 w-3.5 shrink-0" /><span>{p.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <Phone className="h-3.5 w-3.5 shrink-0" /><span>{p.phone || '—'}</span>
                          </div>
                          {p.alternative_phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <Phone className="h-3.5 w-3.5 shrink-0" /><span>{p.alternative_phone} (Alt)</span>
                            </div>
                          )}
                          {p.address && (
                            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <span>{[p.address, p.district, p.state_name, p.pin_code].filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                        </CardBody>
                      </Card>

                    </div>
                  </SectionCard>

                  {/* ── Academic Information ── */}
                  {a && (
                    <SectionCard title="Academic Information">
                      <Card>
                        <CardBody className="space-y-2">
                          {[['10th School', a.tenth_school], ['10th %', a.tenth_percentage], ['12th School', a.twelfth_school], ['12th %', a.twelfth_percentage], ['Diploma %', a.diploma_percentage], ['UG College', a.ug_college], ['UG CGPA', a.ug_cgpa], ['PG College', a.pg_college], ['PG CGPA', a.pg_cgpa], ['Placement', a.placement_status], ['Company', a.company_name]].map(([k, v]) => v != null && v !== '' && (
                            <div key={k} className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1 last:border-0 last:pb-0">
                              <span className="text-xs font-semibold text-slate-400">{k}</span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{String(v)}</span>
                            </div>
                          ))}
                          {Array.isArray(a.sgpa_values) && a.sgpa_values.some((v: string) => v) && (
                            <div className="pt-3">
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
                        </CardBody>
                      </Card>
                    </SectionCard>
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
                              <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>
                            ) : c.status?.toLowerCase() === 'rejected' ? (
                              <Badge variant="danger"><XCircle className="h-3 w-3" /> Rejected</Badge>
                            ) : (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  loading={certUpdatingId === c.id}
                                  disabled={certUpdatingId === c.id}
                                  onClick={() => handleCertStatus(c.id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  disabled={certUpdatingId === c.id}
                                  onClick={() => handleCertStatus(c.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {Array.isArray(viewStudent.internships) && viewStudent.internships.length > 0 && (
                    <SectionCard title="Internships">
                      <div className="space-y-3">
                        {viewStudent.internships.map((intern: any, i: number) => (
                          <Card key={i}>
                            <CardBody className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{intern.role}</p>
                                <Badge variant="muted">{intern.company_name}</Badge>
                              </div>
                              {intern.duration && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{intern.duration}</p>
                              )}
                              {intern.certificate_url && (
                                <a href={intern.certificate_url} target="_blank" rel="noreferrer"
                                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                  <Eye className="h-3 w-3" /> View Certificate
                                </a>
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {viewStudent.resume?.resume_url && (
                    <SectionCard title="Resume">
                      <Card>
                        <CardBody className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <FileText className="h-4 w-4 text-[#002D62] dark:text-blue-400 shrink-0" />
                            <span className="font-semibold">Resume Document</span>
                          </div>
                          <a href={viewStudent.resume.resume_url} target="_blank" rel="noreferrer"
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0">
                            <Eye className="h-3.5 w-3.5" /> View / Download
                          </a>
                        </CardBody>
                      </Card>
                    </SectionCard>
                  )}

                  {viewStudent.analysis && (
                    <SectionCard title="AI Placement Analysis">
                      <div className="space-y-3">

                        <Card>
                          <CardBody className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Readiness Score</p>
                              <p className="text-2xl font-black text-[#002D62] dark:text-blue-400">{viewStudent.analysis.readiness_score}%</p>
                            </div>
                            {viewStudent.analysis.readiness_status && (
                              <Badge variant="info">{viewStudent.analysis.readiness_status}</Badge>
                            )}
                          </CardBody>
                        </Card>

                        {viewStudent.analysis.strengths && (
                          <Card>
                            <CardBody className="space-y-1.5">
                              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Strengths</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{viewStudent.analysis.strengths}</p>
                            </CardBody>
                          </Card>
                        )}

                        {viewStudent.analysis.weaknesses && (
                          <Card>
                            <CardBody className="space-y-1.5">
                              <p className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-wider">Weaknesses</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{viewStudent.analysis.weaknesses}</p>
                            </CardBody>
                          </Card>
                        )}

                        {viewStudent.analysis.recommendations && (
                          <Card>
                            <CardBody className="space-y-1.5">
                              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Recommendations</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{viewStudent.analysis.recommendations}</p>
                            </CardBody>
                          </Card>
                        )}

                      </div>
                    </SectionCard>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black ${p.is_verified ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'}`}>
                      {p.is_verified ? <BadgeCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {p.is_verified ? 'Profile Verified' : 'Pending Verification'}
                    </span>
                    {!p.is_verified && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={verifyingId === p.id}
                        disabled={verifyingId === p.id}
                        onClick={() => handleVerifyStudent(p.id)}
                      >
                        {verifyingId === p.id ? 'Verifying...' : 'Verify Now'}
                      </Button>
                    )}
                  </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={!!placementModal}
        onClose={() => setPlacementModal(null)}
        title="Verify Placement"
        subtitle={placementModal ? `Set official placement status for ${placementModal.name}` : undefined}
        maxWidth="max-w-sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="md" onClick={() => setPlacementModal(null)} disabled={!!verifyingId}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={!!verifyingId}
              disabled={!!verifyingId || (placementForm.status === 'Placed' && !placementForm.company.trim())}
              onClick={handleVerifyPlacement}
            >
              Confirm & Verify
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Placement Status</p>
            <div className="flex gap-2">
              {['Placed', 'Not Placed'].map(s => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={placementForm.status === s ? (s === 'Placed' ? 'success' : 'danger') : 'secondary'}
                  className="flex-1 justify-center"
                  onClick={() => setPlacementForm(f => ({ ...f, status: s }))}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          {placementForm.status === 'Placed' && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</p>
              <Input
                type="text"
                placeholder="e.g. TCS, Infosys..."
                value={placementForm.company}
                onChange={e => setPlacementForm(f => ({ ...f, company: e.target.value }))}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}