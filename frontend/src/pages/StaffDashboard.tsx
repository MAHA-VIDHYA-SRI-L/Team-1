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
  BarChart2
} from 'lucide-react';
import { fetchStaffStudents } from '../services/api';
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
}

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
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaffStudents()
      .then(({ students: raw }) => {
        setStudents(raw.map((s: any) => ({
          id: s.id,
          regNo: s.register_no,
          name: s.full_name,
          dept: s.branch,
          readinessScore: s.readiness_score ?? 0,
          status: s.placement_status === 'Placed' ? 'Placed' : 'Not Placed',
          company: s.company_name ?? undefined,
          email: s.email,
        })));
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  // --- CHART DATA ---
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
                </div>
              )}
            </div>

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

        {/* ==================== CHARTS SECTION ==================== */}
        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block mb-3">
            <span className="inline-flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5" />Placement Analytics Charts</span>
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Chart 1: Dept Placement Bar Chart */}
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

            {/* Chart 2: Placement Pie */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm flex flex-col">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">Overall Placement Ratio</p>
              {totalStudents === 0 ? (
                <p className="text-xs text-slate-400 font-medium py-8 text-center">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={placementPieData} cx="50%" cy="45%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${( percent * 100).toFixed(0)}%`} labelLine={false}
                      style={{ fontSize: 10, fontWeight: 700 }}>
                      {placementPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 3: Readiness Distribution */}
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
              </div>
            </div>
          </div>

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

        </>
        }

      </div>
    </div>
  );
}