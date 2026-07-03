import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Download,
  Filter,
  GraduationCap,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { fetchStaffStudents, mapStudentRecord, type StudentRecord } from '../services/api';
import { ThemeToggle } from '../components/ThemeToggle';
import logoUrl from '../assets/logo.jpg';
import {
  Button, Card, SectionCard, StatCard, Table, TableRow, Td, SectionLoader, EmptyState, PageHeader
} from '../components/ui';

interface StaffReportProps {
  user: {
    fullName: string;
    email: string;
  };
  onBack: () => void;
}

const DEPARTMENTS = [
  'All', 'CSE', 'ECE', 'IT', 'MECH', 'EEE',
  'AIDS', 'AUTO MOBILE', 'BIO MEDICAL', 'SFE', 'MBA', 'MCA',
];

export default function StaffReport({ user, onBack }: StaffReportProps) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verifiedFilter, setVerifiedFilter] = useState('All');
  const [minReadiness, setMinReadiness] = useState(0);

  type SortKey = 'name' | 'regNo' | 'dept' | 'status' | 'readinessScore' | 'isVerified' | 'placementVerified';
  type SortDir = 'asc' | 'desc';
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  useEffect(() => {
    fetchStaffStudents()
      .then(({ students: raw }) => {
        setStudents((raw || []).map(mapStudentRecord));
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = students.filter((s) => {
      const matchSearch =
        !q || s.name.toLowerCase().includes(q) || s.regNo.toLowerCase().includes(q) || (s.company ?? '').toLowerCase().includes(q);
      const matchDept = selectedDept === 'All' || s.dept === selectedDept.trim().toUpperCase();
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchVerified =
        verifiedFilter === 'All' ||
        (verifiedFilter === 'Verified' && s.isVerified) ||
        (verifiedFilter === 'Unverified' && !s.isVerified);
      const matchReadiness = s.readinessScore >= minReadiness;
      return matchSearch && matchDept && matchStatus && matchVerified && matchReadiness;
    });

    return [...filtered].sort((a, b) => {
      let aVal: string | number | boolean = a[sortKey] ?? '';
      let bVal: string | number | boolean = b[sortKey] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, searchQuery, selectedDept, statusFilter, verifiedFilter, minReadiness, sortKey, sortDir]);

  const hasActiveFilter =
    searchQuery || selectedDept !== 'All' || statusFilter !== 'All' || verifiedFilter !== 'All' || minReadiness > 0;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setStatusFilter('All');
    setVerifiedFilter('All');
    setMinReadiness(0);
  };

  const downloadCSV = () => {
    const headers = [
      'Reg No', 'Name', 'Email', 'Department',
      'Placement Status', 'Company', 'Readiness Score',
      'Profile Verified', 'Placement Verified', 'Blocked',
    ];
    const rows = filteredStudents.map((s) => [
      s.regNo,
      s.name,
      s.email,
      s.dept,
      s.status,
      s.company ?? '',
      `${s.readinessScore}%`,
      s.isVerified ? 'Yes' : 'No',
      s.placementVerified ? 'Yes' : 'No',
      s.isBlocked ? 'Yes' : 'No',
    ]);

    const sanitize = (val: string) => {
      const s = String(val).replace(/"/g, '""');
      // Prevent CSV formula injection
      return /^[=+\-@|]/.test(s) ? `'${s}` : s;
    };
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${sanitize(String(cell))}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Summary stats for filtered set
  const placed = filteredStudents.filter((s) => s.status === 'Placed').length;
  const notPlaced = filteredStudents.filter((s) => s.status === 'Not Placed').length;
  const verified = filteredStudents.filter((s) => s.isVerified).length;
  const avgReadiness =
    filteredStudents.length > 0
      ? Math.round(filteredStudents.reduce((sum, s) => sum + s.readinessScore, 0) / filteredStudents.length)
      : 0;

  const tableHeaders = [
    '#',
    <span key="reg" onClick={() => handleSort('regNo')} className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-blue-200 transition-colors group">
      Reg No
      {sortKey === 'regNo' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />) : <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />}
    </span>,
    <span key="name" onClick={() => handleSort('name')} className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-blue-200 transition-colors group">
      Name
      {sortKey === 'name' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />) : <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />}
    </span>,
    <span key="dept" onClick={() => handleSort('dept')} className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-blue-200 transition-colors group">
      Dept
      {sortKey === 'dept' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />) : <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />}
    </span>,
    'Email',
    <span key="status" onClick={() => handleSort('status')} className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-blue-200 transition-colors group">
      Status
      {sortKey === 'status' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />) : <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />}
    </span>,
    'Company',
    <span key="readiness" onClick={() => handleSort('readinessScore')} className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-blue-200 transition-colors group">
      Readiness
      {sortKey === 'readinessScore' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />) : <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />}
    </span>,
    <span key="profile" onClick={() => handleSort('isVerified')} className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-blue-200 transition-colors group">
      Profile
      {sortKey === 'isVerified' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />) : <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />}
    </span>,
    <span key="placement" onClick={() => handleSort('placementVerified')} className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-blue-200 transition-colors group">
      Placement
      {sortKey === 'placementVerified' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />) : <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />}
    </span>,
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col font-sans transition-colors duration-300">

      {/* ── Header ── */}
      <PageHeader
        logo={
          <div className="h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-slate-200/80 dark:ring-slate-700 shadow-sm shrink-0 bg-white p-0.5">
            <img src={logoUrl} className="w-full h-full object-contain rounded-xl" alt="Placemate Logo" />
          </div>
        }
        title="Placemate"
        badge="Staff Portal"
        subtitle="Student Placement Report"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            <div className="text-right hidden sm:block mr-2">
              <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-none">{user.fullName}</p>
              <p className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wider">Placement Officer</p>
            </div>
            <ThemeToggle variant="button" />
            <Button
              variant="primary"
              size="sm"
              onClick={downloadCSV}
              disabled={filteredStudents.length === 0}
              icon={<Download className="h-4 w-4" />}
            >
              Download CSV
            </Button>
          </div>
        }
      />

      <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 sm:p-10 space-y-8">

        {/* ── Loading ── */}
        {loading && (
          <Card className="p-12">
            <SectionLoader message="Loading student data..." />
          </Card>
        )}

        {/* ── Error ── */}
        {fetchError && (
          <Card className="p-12">
            <EmptyState
              icon={<XCircle className="h-12 w-12 text-red-500" />}
              title="Failed to load students"
              description={fetchError}
            />
          </Card>
        )}

        {!loading && !fetchError && (
          <>
            {/* ── Summary Cards ── */}
            <div>
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase px-1 block mb-4">
                Report Summary — {filteredStudents.length} students
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                  label="Placed"
                  value={placed}
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  accentColor="text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                  label="Not Placed"
                  value={notPlaced}
                  icon={<XCircle className="h-6 w-6" />}
                  iconBg="bg-orange-50 dark:bg-orange-950/40"
                  accentColor="text-orange-500 dark:text-orange-400"
                />
                <StatCard
                  label="Verified"
                  value={verified}
                  icon={<BadgeCheck className="h-6 w-6" />}
                  iconBg="bg-blue-50 dark:bg-blue-950/40"
                  accentColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                  label="Avg Readiness"
                  value={`${avgReadiness}%`}
                  icon={<Sparkles className="h-6 w-6" />}
                  iconBg="bg-[#002D62]/10 dark:bg-blue-900/30"
                  accentColor="text-[#002D62] dark:text-blue-400"
                />
              </div>
            </div>

            {/* ── Filters ── */}
            <SectionCard
              title="Filter & Search"
              subtitle="Refine the student directory based on criteria"
              action={
                hasActiveFilter ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    Clear All Filters
                  </Button>
                ) : null
              }
            >
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

                  {/* Search */}
                  <div className="xl:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Name, Reg No or Company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-500 font-medium transition-colors"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-500 font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Placement Status */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Placement</label>
                    <div className="flex gap-1.5">
                      {['All', 'Placed', 'Not Placed'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                            statusFilter === st
                              ? 'bg-[#002D62] dark:bg-blue-600 text-white border-[#002D62] dark:border-blue-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {st === 'Not Placed' ? 'Unplaced' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verified Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Profile</label>
                    <div className="flex gap-1.5">
                      {['All', 'Verified', 'Unverified'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVerifiedFilter(v)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                            verifiedFilter === v
                              ? 'bg-[#002D62] dark:bg-blue-600 text-white border-[#002D62] dark:border-blue-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Readiness slider */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Min Readiness Score</label>
                    <span className="text-xs font-black text-[#002D62] dark:text-blue-400 bg-[#002D62]/5 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">{minReadiness}% +</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minReadiness}
                    onChange={(e) => setMinReadiness(Number(e.target.value))}
                    className="w-full accent-[#002D62] dark:accent-blue-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── Results count + Download hint ── */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {filteredStudents.length} record{filteredStudents.length !== 1 ? 's' : ''} found
              </span>
              {filteredStudents.length > 0 && (
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Click "Download CSV" to export this list
                </span>
              )}
            </div>

            {/* ── Table ── */}
            {filteredStudents.length === 0 ? (
              <Card className="p-12">
                <EmptyState
                  icon={<Filter className="h-12 w-12 text-slate-300 dark:text-slate-600" />}
                  title="No Records Match Your Filters"
                  description="Try adjusting your search or filter criteria."
                  action={
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  }
                />
              </Card>
            ) : (
              <SectionCard title="Student Directory" subtitle="Sorted and filtered list of student records" noPadding>
                <Table headers={tableHeaders}>
                  {filteredStudents.map((s, idx) => (
                    <TableRow
                      key={s.id}
                      className={s.isBlocked ? 'bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50/50' : ''}
                    >
                      <Td><span className="text-slate-400 font-bold">{idx + 1}</span></Td>

                      <Td>
                        <span className="font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[11px]">
                          {s.regNo || '—'}
                        </span>
                      </Td>

                      <Td>
                        <p className="font-bold text-slate-800 dark:text-white whitespace-nowrap">{s.name}</p>
                        {s.isBlocked && (
                          <span className="text-[9px] font-black text-red-500 dark:text-red-400 uppercase tracking-wider">Blocked</span>
                        )}
                      </Td>

                      <Td>
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {s.dept || '—'}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-slate-500 dark:text-slate-400 font-medium max-w-[180px] truncate block">
                          {s.email}
                        </span>
                      </Td>

                      <Td>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg whitespace-nowrap ${
                          s.status === 'Placed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400'
                        }`}>
                          {s.status === 'Placed'
                            ? <CheckCircle2 className="h-3 w-3" />
                            : <XCircle className="h-3 w-3" />}
                          {s.status}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-slate-700 dark:text-slate-200 font-bold whitespace-nowrap">
                          {s.company || <span className="text-slate-300 dark:text-slate-600 font-normal">—</span>}
                        </span>
                      </Td>

                      <Td>
                        <span className={`inline-flex items-center gap-1 font-black whitespace-nowrap ${
                          s.readinessScore >= 85
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : s.readinessScore >= 65
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-amber-500 dark:text-amber-400'
                        }`}>
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          {s.readinessScore}%
                        </span>
                      </Td>

                      <Td>
                        {s.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            <BadgeCheck className="h-4 w-4" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-500 dark:text-amber-400 whitespace-nowrap">
                            <Clock className="h-4 w-4" /> Pending
                          </span>
                        )}
                      </Td>

                      <Td>
                        {s.placementVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            <CheckCircle2 className="h-4 w-4" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-slate-400 whitespace-nowrap">
                            <Clock className="h-4 w-4" /> Pending
                          </span>
                        )}
                      </Td>
                    </TableRow>
                  ))}
                </Table>

                {/* Table footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-xs font-bold text-slate-400">
                    Showing {filteredStudents.length} of {students.length} students
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={downloadCSV}
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    Export CSV
                  </Button>
                </div>
              </SectionCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}
