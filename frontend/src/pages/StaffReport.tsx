import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Download,
  Filter,
  GraduationCap,
  Sparkles,
  Loader2,
  FileText,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { fetchStaffStudents } from '../services/api';

interface StaffReportProps {
  user: {
    fullName: string;
    email: string;
  };
  onBack: () => void;
}

interface StudentRecord {
  id: string;
  regNo: string;
  name: string;
  dept: string;
  readinessScore: number;
  status: 'Placed' | 'Not Placed';
  placementVerified: boolean;
  company?: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
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
        setStudents(
          (raw || []).map((s: any) => ({
            id: s.id,
            regNo: s.register_no ?? '',
            name: s.full_name ?? '',
            dept: (s.branch ?? '').trim().toUpperCase(),
            readinessScore: s.readiness_score ?? 0,
            status: s.placement_status === 'Placed' ? 'Placed' : 'Not Placed',
            placementVerified: s.placement_verified ?? false,
            company: s.company_name ?? undefined,
            email: s.email ?? '',
            isBlocked: s.is_blocked ?? false,
            isVerified: s.is_verified ?? false,
          }))
        );
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

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div>
            <h1 className="text-lg font-black text-[#002D62] uppercase tracking-wider">Placemate</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Student Placement Report</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-slate-800 leading-none">{user.fullName}</p>
            <p className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wider">Placement Officer</p>
          </div>
          <button
            onClick={downloadCSV}
            disabled={filteredStudents.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#002D62] hover:bg-[#003580] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#002D62]" />
            <span className="ml-2 text-sm font-bold text-slate-500">Loading student data...</span>
          </div>
        )}

        {/* ── Error ── */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-xl">
            Failed to load students: {fetchError}
          </div>
        )}

        {!loading && !fetchError && (
          <>
            {/* ── Summary Cards ── */}
            <div>
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1 block mb-3">
                Report Summary — {filteredStudents.length} students
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Placed', value: placed, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                  { label: 'Not Placed', value: notPlaced, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
                  { label: 'Verified', value: verified, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                  { label: 'Avg Readiness', value: `${avgReadiness}%`, color: 'text-[#002D62]', bg: 'bg-[#002D62]/5', border: 'border-[#002D62]/10' },
                ].map((card) => (
                  <div key={card.label} className={`bg-white border ${card.border} p-4 rounded-[20px] shadow-sm`}>
                    <div className={`w-fit px-2 py-0.5 rounded-lg ${card.bg} mb-3`}>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${card.color}`}>{card.label}</span>
                    </div>
                    <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Filters ── */}
            <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                  <SlidersHorizontal className="h-4 w-4 text-[#002D62]" />
                  <span>Filter & Search</span>
                </div>
                {hasActiveFilter && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] text-orange-500 font-bold hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

                {/* Search */}
                <div className="xl:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Name, Reg No or Company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#002D62] font-medium"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#002D62] font-bold text-slate-700"
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
                            ? 'bg-[#002D62] text-white border-[#002D62]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                            ? 'bg-[#002D62] text-white border-[#002D62]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Readiness slider */}
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

            {/* ── Results count + Download hint ── */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500">
                {filteredStudents.length} record{filteredStudents.length !== 1 ? 's' : ''} found
              </span>
              {filteredStudents.length > 0 && (
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Click "Download CSV" to export this list
                </span>
              )}
            </div>

            {/* ── Table ── */}
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <Filter className="h-6 w-6 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No Records Match Your Filters</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">#</th>

                        {/* Sortable: Reg No */}
                        <th
                          onClick={() => handleSort('regNo')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Reg No
                            {sortKey === 'regNo' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62]" /> : <ArrowDown className="h-3 w-3 text-[#002D62]" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Sortable: Name */}
                        <th
                          onClick={() => handleSort('name')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Name
                            {sortKey === 'name' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62]" /> : <ArrowDown className="h-3 w-3 text-[#002D62]" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Sortable: Dept */}
                        <th
                          onClick={() => handleSort('dept')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Dept
                            {sortKey === 'dept' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62]" /> : <ArrowDown className="h-3 w-3 text-[#002D62]" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Non-sortable: Email */}
                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Email</th>

                        {/* Sortable: Status */}
                        <th
                          onClick={() => handleSort('status')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Status
                            {sortKey === 'status' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62]" /> : <ArrowDown className="h-3 w-3 text-[#002D62]" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Non-sortable: Company */}
                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Company</th>

                        {/* Sortable: Readiness */}
                        <th
                          onClick={() => handleSort('readinessScore')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Readiness
                            {sortKey === 'readinessScore' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62]" /> : <ArrowDown className="h-3 w-3 text-[#002D62]" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Sortable: Profile Verified */}
                        <th
                          onClick={() => handleSort('isVerified')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Profile
                            {sortKey === 'isVerified' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62]" /> : <ArrowDown className="h-3 w-3 text-[#002D62]" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Sortable: Placement Verified */}
                        <th
                          onClick={() => handleSort('placementVerified')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Placement
                            {sortKey === 'placementVerified' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62]" /> : <ArrowDown className="h-3 w-3 text-[#002D62]" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                            s.isBlocked ? 'bg-red-50/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-slate-400 font-bold">{idx + 1}</td>

                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                              {s.regNo || '—'}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800 whitespace-nowrap">{s.name}</p>
                            {s.isBlocked && (
                              <span className="text-[9px] font-black text-red-500 uppercase">Blocked</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-slate-600 font-bold whitespace-nowrap">
                              <GraduationCap className="h-3 w-3 text-slate-400 shrink-0" />
                              {s.dept || '—'}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-500 font-medium max-w-[180px] truncate">
                            {s.email}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg w-fit whitespace-nowrap ${
                              s.status === 'Placed'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-orange-50 text-orange-500'
                            }`}>
                              {s.status === 'Placed'
                                ? <CheckCircle2 className="h-3 w-3" />
                                : <XCircle className="h-3 w-3" />}
                              {s.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                            {s.company || <span className="text-slate-300">—</span>}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-0.5 font-black whitespace-nowrap ${
                              s.readinessScore >= 85
                                ? 'text-emerald-600'
                                : s.readinessScore >= 65
                                ? 'text-blue-600'
                                : 'text-amber-500'
                            }`}>
                              <Sparkles className="h-3 w-3 shrink-0" />
                              {s.readinessScore}%
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {s.isVerified ? (
                              <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 whitespace-nowrap">
                                <BadgeCheck className="h-3.5 w-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 whitespace-nowrap">
                                <Clock className="h-3.5 w-3.5" /> Pending
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {s.placementVerified ? (
                              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 whitespace-nowrap">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 whitespace-nowrap">
                                <Clock className="h-3.5 w-3.5" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table footer */}
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                  <span className="text-[10px] font-bold text-slate-400">
                    Showing {filteredStudents.length} of {students.length} students
                  </span>
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[#002D62] bg-[#002D62]/5 hover:bg-[#002D62]/10 rounded-lg transition-all"
                  >
                    <Download className="h-3 w-3" />
                    Export CSV
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
