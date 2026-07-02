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
import { fetchStaffStudents, mapStudentRecord, type StudentRecord } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

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

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">

      {/* ── Header ── */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div>
            <h1 className="text-lg font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wider">Placemate</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Student Placement Report</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-none">{user.fullName}</p>
            <p className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wider">Placement Officer</p>
          </div>
          <button
            onClick={downloadCSV}
            disabled={filteredStudents.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#002D62] dark:bg-blue-600 hover:bg-[#003580] dark:hover:bg-blue-500 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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
            <Loader2 className="h-6 w-6 animate-spin text-[#002D62] dark:text-blue-400" />
            <span className="ml-2 text-sm font-bold text-slate-500 dark:text-slate-400">Loading student data...</span>
          </div>
        )}

        {/* ── Error ── */}
        {fetchError && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm font-bold px-4 py-3 rounded-xl">
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
                  { label: 'Placed', value: placed, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-100 dark:border-emerald-900/50' },
                  { label: 'Not Placed', value: notPlaced, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-100 dark:border-orange-900/50' },
                  { label: 'Verified', value: verified, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-100 dark:border-blue-900/50' },
                  { label: 'Avg Readiness', value: `${avgReadiness}%`, color: 'text-[#002D62] dark:text-blue-300', bg: 'bg-[#002D62]/5 dark:bg-blue-900/20', border: 'border-[#002D62]/10 dark:border-blue-800/30' },
                ].map((card) => (
                  <div key={card.label} className={`bg-white dark:bg-slate-900 border ${card.border} p-4 rounded-[20px] shadow-sm transition-colors duration-300`}>
                    <div className={`w-fit px-2 py-0.5 rounded-lg ${card.bg} mb-3`}>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${card.color}`}>{card.label}</span>
                    </div>
                    <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Filters ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[24px] shadow-sm space-y-4 transition-colors duration-300">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-xs font-bold">
                  <SlidersHorizontal className="h-4 w-4 text-[#002D62] dark:text-blue-400" />
                  <span>Filter & Search</span>
                </div>
                {hasActiveFilter && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] text-orange-500 dark:text-orange-400 font-bold hover:underline"
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
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-500 font-bold text-slate-700 dark:text-slate-200"
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
                            ? 'bg-[#002D62] dark:bg-blue-600 text-white border-[#002D62] dark:border-blue-600'
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
                            ? 'bg-[#002D62] dark:bg-blue-600 text-white border-[#002D62] dark:border-blue-600'
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
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Min Readiness Score</label>
                  <span className="text-xs font-black text-[#002D62] dark:text-blue-400 bg-[#002D62]/5 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{minReadiness}% +</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minReadiness}
                  onChange={(e) => setMinReadiness(Number(e.target.value))}
                  className="w-full accent-[#002D62] dark:accent-blue-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* ── Results count + Download hint ── */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
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
              <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <Filter className="h-6 w-6 text-slate-300 dark:text-slate-600 mb-2" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Records Match Your Filters</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] shadow-sm overflow-hidden transition-colors duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50">
                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">#</th>

                        {/* Sortable: Reg No */}
                        <th
                          onClick={() => handleSort('regNo')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] dark:hover:text-blue-400 transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Reg No
                            {sortKey === 'regNo' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62] dark:text-blue-400" /> : <ArrowDown className="h-3 w-3 text-[#002D62] dark:text-blue-400" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Sortable: Name */}
                        <th
                          onClick={() => handleSort('name')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] dark:hover:text-blue-400 transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Name
                            {sortKey === 'name' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62] dark:text-blue-400" /> : <ArrowDown className="h-3 w-3 text-[#002D62] dark:text-blue-400" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Sortable: Dept */}
                        <th
                          onClick={() => handleSort('dept')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] dark:hover:text-blue-400 transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Dept
                            {sortKey === 'dept' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62] dark:text-blue-400" /> : <ArrowDown className="h-3 w-3 text-[#002D62] dark:text-blue-400" />
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
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] dark:hover:text-blue-400 transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Status
                            {sortKey === 'status' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62] dark:text-blue-400" /> : <ArrowDown className="h-3 w-3 text-[#002D62] dark:text-blue-400" />
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
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] dark:hover:text-blue-400 transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Readiness
                            {sortKey === 'readinessScore' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62] dark:text-blue-400" /> : <ArrowDown className="h-3 w-3 text-[#002D62] dark:text-blue-400" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Sortable: Profile Verified */}
                        <th
                          onClick={() => handleSort('isVerified')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] dark:hover:text-blue-400 transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Profile
                            {sortKey === 'isVerified' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62] dark:text-blue-400" /> : <ArrowDown className="h-3 w-3 text-[#002D62] dark:text-blue-400" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                            )}
                          </span>
                        </th>

                        {/* Sortable: Placement Verified */}
                        <th
                          onClick={() => handleSort('placementVerified')}
                          className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#002D62] dark:hover:text-blue-400 transition-colors group"
                        >
                          <span className="inline-flex items-center gap-1">
                            Placement
                            {sortKey === 'placementVerified' ? (
                              sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-[#002D62] dark:text-blue-400" /> : <ArrowDown className="h-3 w-3 text-[#002D62] dark:text-blue-400" />
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
                          className={`border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                            s.isBlocked ? 'bg-red-50/20 dark:bg-red-950/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-slate-400 font-bold">{idx + 1}</td>

                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px]">
                              {s.regNo || '—'}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800 dark:text-white whitespace-nowrap">{s.name}</p>
                            {s.isBlocked && (
                              <span className="text-[9px] font-black text-red-500 dark:text-red-400 uppercase">Blocked</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">
                              <GraduationCap className="h-3 w-3 text-slate-400 shrink-0" />
                              {s.dept || '—'}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium max-w-[180px] truncate">
                            {s.email}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg w-fit whitespace-nowrap ${
                              s.status === 'Placed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                : 'bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400'
                            }`}>
                              {s.status === 'Placed'
                                ? <CheckCircle2 className="h-3 w-3" />
                                : <XCircle className="h-3 w-3" />}
                              {s.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                            {s.company || <span className="text-slate-300 dark:text-slate-600">—</span>}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-0.5 font-black whitespace-nowrap ${
                              s.readinessScore >= 85
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : s.readinessScore >= 65
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-amber-500 dark:text-amber-400'
                            }`}>
                              <Sparkles className="h-3 w-3 shrink-0" />
                              {s.readinessScore}%
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {s.isVerified ? (
                              <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                <BadgeCheck className="h-3.5 w-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 dark:text-amber-400 whitespace-nowrap">
                                <Clock className="h-3.5 w-3.5" /> Pending
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {s.placementVerified ? (
                              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
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
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/30">
                  <span className="text-[10px] font-bold text-slate-400">
                    Showing {filteredStudents.length} of {students.length} students
                  </span>
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[#002D62] dark:text-blue-400 bg-[#002D62]/5 dark:bg-blue-900/30 hover:bg-[#002D62]/10 dark:hover:bg-blue-900/50 rounded-lg transition-all"
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
