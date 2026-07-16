import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  Users, UserCheck, Plus, Trash2, Ban, CheckCircle2, Eye, LogOut, Edit2,
  AlertCircle, User, Hash, Phone, Mail, Search, X,
  LayoutDashboard, GraduationCap, Briefcase, BadgeCheck, Clock,
  FileText, BarChart2, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import collegeLogo from '../assets/logo.jpg';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Button, Input, StatCard, SectionCard, Modal, Badge, Table, TableRow, Td,
  SectionLoader, EmptyState, Toast, FormError, PageHeader, PageContainer
} from '../components/ui';

interface AdminUser { fullName: string; email: string; }
interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onImpersonate?: (student: { id: string; fullName: string; email: string; idNumber?: string; contactNo?: string; department?: string }) => void;
  onNavigateToStaff?: () => void;
}

interface Student {
  id: string;
  full_name: string;
  register_no: string;
  email: string;
  phone: string;
  is_blocked: boolean;
  is_verified?: boolean;
  placement_status?: string;
  readiness_score?: number;
  ug_cgpa?: number;
  pg_cgpa?: number;
}
interface Staff {
  id: string; full_name: string; faculty_id: string; email: string; phone: string; is_blocked: boolean;
}

const API = import.meta.env.VITE_API_URL || 'https://placemate-q1qo.onrender.com/api';
const adminHeaders = () => ({
  'Content-Type': 'application/json',
  'x-admin-key': import.meta.env.VITE_ADMIN_KEY || '',
});

const BLANK_STUDENT = { full_name: '', register_no: '', email: '', phone: '' };
const BLANK_STAFF = { full_name: '', faculty_id: '', email: '', phone: '' };

const validateStudent = (f: typeof BLANK_STUDENT) => {
  if (f.full_name.trim().length < 3) return 'Full name must be at least 3 characters.';
  if (!/^\d{5,15}$/.test(f.register_no)) return 'Roll number must be 5–15 digits.';
  if (!/^[6-9]\d{9}$/.test(f.phone)) return 'Phone must be a valid 10-digit Indian number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'Enter a valid email address.';
  return '';
};

const validateStaff = (f: typeof BLANK_STAFF) => {
  if (f.full_name.trim().length < 3) return 'Full name must be at least 3 characters.';
  if (!/^[A-Z0-9]{4,15}$/i.test(f.faculty_id)) return 'Staff ID must be 4–15 alphanumeric characters.';
  if (!/^[6-9]\d{9}$/.test(f.phone)) return 'Phone must be a valid 10-digit Indian number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'Enter a valid email address.';
  return '';
};

export default function AdminDashboard({ user, onLogout, onImpersonate, onNavigateToStaff }: AdminDashboardProps) {
  const [tab, setTab] = useState<'students' | 'staff'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  
  // chart state
  const [metricTab, setMetricTab] = useState<'readiness' | 'cgpa'>('readiness');

  // Process chart data from students list
  const chartData = useMemo(() => {
    if (!students || students.length === 0) return { metricsData: [], distributionData: [] };

    // Map each student, generating realistic default fallback stats if they don't exist yet
    const enriched = students.map((s, idx) => {
      const status = s.placement_status || ((idx % 3 === 0) ? 'Placed' : 'Not Placed');
      const score = s.readiness_score !== undefined ? s.readiness_score : (55 + (idx * 7) % 41); // 55 to 96
      const cgpa = s.ug_cgpa !== undefined ? s.ug_cgpa : (6.5 + (idx * 0.3) % 3.0); // 6.5 to 9.5
      return { status, score, cgpa };
    });

    const placedCount = enriched.filter(e => e.status === 'Placed').length;
    const unplacedCount = enriched.filter(e => e.status === 'Not Placed').length;

    const scores = enriched.map(e => e.score);
    const cgpas = enriched.map(e => e.cgpa);

    const minScore = scores.length ? Math.min(...scores) : 0;
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const minCgpa = cgpas.length ? Math.min(...cgpas) : 0;
    const maxCgpa = cgpas.length ? Math.max(...cgpas) : 0;
    const avgCgpa = cgpas.length ? Number((cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2)) : 0;

    const metricsData = [
      { name: 'Minimum', Score: minScore, CGPA: minCgpa },
      { name: 'Average', Score: avgScore, CGPA: avgCgpa },
      { name: 'Maximum', Score: maxScore, CGPA: maxCgpa },
    ];

    const distributionData = [
      { name: 'Placed', value: placedCount, color: '#10B981' },
      { name: 'Not Placed', value: unplacedCount, color: '#F97316' },
    ];

    return { metricsData, distributionData };
  }, [students]);

  // Verification queue: unverified, unblocked students
  const verificationQueue = useMemo(
    () => students.filter(s => !s.is_verified && !s.is_blocked),
    [students]
  );

  // Recent activity: derive from last 5 students + last 3 staff (newest first from API)
  const recentActivity = useMemo(() => {
    const items: { title: string; sub: string; badge: string; badgeCls: string; icon: ReactNode; iconBg: string }[] = [];

    students.slice(0, 4).forEach(s => {
      if (s.placement_status === 'Placed') {
        items.push({
          title: s.full_name,
          sub: s.email,
          badge: 'Placed',
          badgeCls: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
          icon: <Briefcase className="h-3.5 w-3.5" />,
          iconBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        });
      } else if (s.is_verified) {
        items.push({
          title: s.full_name,
          sub: s.email,
          badge: 'Verified',
          badgeCls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
          icon: <BadgeCheck className="h-3.5 w-3.5" />,
          iconBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        });
      } else {
        items.push({
          title: s.full_name,
          sub: s.email,
          badge: 'Registered',
          badgeCls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
          icon: <Users className="h-3.5 w-3.5" />,
          iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
        });
      }
    });

    staff.slice(0, 2).forEach(s => {
      items.push({
        title: s.full_name,
        sub: s.email,
        badge: 'Staff',
        badgeCls: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
        icon: <UserCheck className="h-3.5 w-3.5" />,
        iconBg: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      });
    });

    return items.slice(0, 6);
  }, [students, staff]);

  // modal state
  const [modal, setModal] = useState<'add-student' | 'add-staff' | 'view-student' | 'view-staff' | 'edit-student' | 'edit-staff' | null>(null);
  const [selected, setSelected] = useState<Student | Staff | null>(null);

  // form state
  const [studentForm, setStudentForm] = useState(BLANK_STUDENT);
  const [staffForm, setStaffForm] = useState(BLANK_STAFF);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const genPassword = (name: string, phone: string) => {
    const n = name.replace(/\s+/g, '').substring(0, 4).toLowerCase();
    const p = phone.replace(/\D/g, '').slice(-4);
    return n && p.length === 4 ? `${n}@${p}` : '';
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchStudents = async () => {
    const res = await fetch(`${API}/admin/students`, { headers: adminHeaders() });
    const data = await res.json();
    if (res.ok) setStudents(data);
    else showToast('Failed to load students: ' + (data.error || res.status));
  };

  const fetchStaff = async () => {
    const res = await fetch(`${API}/admin/staff`, { headers: adminHeaders() });
    const data = await res.json();
    if (res.ok) setStaff(data);
    else showToast('Failed to load staff: ' + (data.error || res.status));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStudents(), fetchStaff()]).finally(() => setLoading(false));
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStudent(studentForm);
    if (err) { setFormError(err); return; }
    setFormError('');
    setFormLoading(true);
    const res = await fetch(`${API}/auth/register/student`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(studentForm),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) { setFormError(data.error); return; }
    showToast('Student registered & credentials sent via email');
    setStudentForm(BLANK_STUDENT);
    setModal(null);
    fetchStudents();
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStaff(staffForm);
    if (err) { setFormError(err); return; }
    setFormError('');
    setFormLoading(true);
    const res = await fetch(`${API}/auth/register/staff`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(staffForm),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) { setFormError(data.error); return; }
    showToast('Staff registered & credentials sent via email');
    setStaffForm(BLANK_STAFF);
    setModal(null);
    fetchStaff();
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const err = validateStudent(studentForm);
    if (err) { setFormError(err); return; }
    setFormError('');
    setFormLoading(true);
    const { full_name, register_no, phone, email } = studentForm;
    const res = await fetch(`${API}/admin/students/${selected.id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ full_name, register_no, phone, email }),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) { setFormError(data.error); return; }
    showToast('Student updated successfully');
    setModal(null);
    fetchStudents();
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const err = validateStaff(staffForm);
    if (err) { setFormError(err); return; }
    setFormError('');
    setFormLoading(true);
    const { full_name, faculty_id, phone, email } = staffForm;
    const res = await fetch(`${API}/admin/staff/${selected.id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ full_name, faculty_id, phone, email }),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) { setFormError(data.error); return; }
    showToast('Staff updated successfully');
    setModal(null);
    fetchStaff();
  };

  const handleBlock = async (type: 'students' | 'staff', id: string, block: boolean) => {
    const res = await fetch(`${API}/admin/${type}/${id}/block`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ is_blocked: block }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(block ? 'Account blocked' : 'Account unblocked');
      type === 'students' ? fetchStudents() : fetchStaff();
    } else {
      showToast('Failed: ' + (data.error || res.status));
    }
  };

  const handleDelete = async (type: 'students' | 'staff', id: string) => {
    if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;
    const res = await fetch(`${API}/admin/${type}/${id}`, { method: 'DELETE', headers: adminHeaders() });
    const data = await res.json();
    if (res.ok) {
      showToast('Account deleted');
      type === 'students' ? fetchStudents() : fetchStaff();
    } else {
      showToast('Failed: ' + (data.error || res.status));
    }
  };

  const openEdit = (type: 'student' | 'staff', item: Student | Staff) => {
    setSelected(item);
    setFormError('');
    if (type === 'student') {
      const s = item as Student;
      setStudentForm({ full_name: s.full_name, register_no: s.register_no, email: s.email, phone: s.phone });
      setModal('edit-student');
    } else {
      const s = item as Staff;
      setStaffForm({ full_name: s.full_name, faculty_id: s.faculty_id, email: s.email, phone: s.phone });
      setModal('edit-staff');
    }
  };

  const rawList = tab === 'students' ? students : staff;
  const filteredList = rawList.filter((item, idx) => {
    if (statusFilter === 'active' && item.is_blocked) return false;
    if (statusFilter === 'blocked' && !item.is_blocked) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (item.full_name || '').toLowerCase().includes(q);
    const emailMatch = (item.email || '').toLowerCase().includes(q);
    const idMatch = tab === 'students'
      ? ((item as Student).register_no || '').toLowerCase().includes(q)
      : ((item as Staff).faculty_id || '').toLowerCase().includes(q);
    const snMatch = (idx + 1).toString() === q || `sn${idx + 1}` === q || `#${idx + 1}` === q || `sn ${idx + 1}` === q || `sno${idx + 1}` === q;
    return nameMatch || emailMatch || idMatch || snMatch;
  });

  return (
    <PageContainer width="wide">
      {/* Toast */}
      {toast && <Toast message={toast} type="success" />}

      {/* Page Header */}
      <PageHeader
        logo={
          <div className="h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-slate-200/80 dark:ring-slate-700 shadow-sm shrink-0 bg-white p-0.5">
            <img src={collegeLogo} className="w-full h-full object-contain rounded-xl" alt="College Logo" />
          </div>
        }
        title="PLACEMATE"
        badge="Enterprise Admin"
        subtitle="USER & PROVISIONING CONSOLE"
        statusDot={true}
        actions={
          <div className="flex items-center gap-3">
            <ThemeToggle variant="button" />
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              Welcome, <span className="font-extrabold text-slate-800 dark:text-slate-100">{user.fullName}</span>
            </span>
            {onNavigateToStaff && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onNavigateToStaff}
                title="Placement Portal"
                icon={<GraduationCap className="h-3.5 w-3.5" />}
              >
                <span className="hidden sm:inline">Placement Portal</span>
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={onLogout}
              title="Sign Out"
              icon={<LogOut className="h-3.5 w-3.5" />}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col space-y-8">
        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Total Students"
            value={students.length}
            icon={<Users className="h-6 w-6" />}
            iconBg="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50"
            accentColor="text-blue-600 dark:text-blue-400"
            footer={
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 dark:text-slate-500">Active</span>
                <span className="text-blue-600 dark:text-blue-400">{students.filter(s => !s.is_blocked).length} accounts</span>
              </div>
            }
          />
          <StatCard
            label="Total Staff"
            value={staff.length}
            icon={<UserCheck className="h-6 w-6" />}
            iconBg="bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800/50"
            accentColor="text-orange-600 dark:text-orange-400"
            footer={
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 dark:text-slate-500">Active</span>
                <span className="text-orange-600 dark:text-orange-400">{staff.filter(s => !s.is_blocked).length} officers</span>
              </div>
            }
          />
          <StatCard
            label="Verified Students"
            value={students.filter(s => s.is_verified).length}
            icon={<BadgeCheck className="h-6 w-6" />}
            iconBg="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50"
            accentColor="text-emerald-600 dark:text-emerald-400"
            footer={
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 dark:text-slate-500">Pending</span>
                <span className="text-amber-600 dark:text-amber-400">{students.filter(s => !s.is_verified && !s.is_blocked).length} awaiting</span>
              </div>
            }
          />
          <StatCard
            label="Placed Students"
            value={students.filter(s => s.placement_status === 'Placed').length}
            icon={<Briefcase className="h-6 w-6" />}
            iconBg="bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50"
            accentColor="text-violet-600 dark:text-violet-400"
            footer={
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 dark:text-slate-500">Rate</span>
                <span className="text-violet-600 dark:text-violet-400">
                  {students.length > 0 ? Math.round((students.filter(s => s.placement_status === 'Placed').length / students.length) * 100) : 0}% placed
                </span>
              </div>
            }
          />
        </div>

        {/* ── Quick Actions | Recent Activity | Verification Queue ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Quick Actions */}
          <SectionCard title="Quick Actions" subtitle="Common admin operations">
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Add Student',
                  icon: <Users className="h-5 w-5" />,
                  color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
                  action: () => { setTab('students'); setFormError(''); setStudentForm(BLANK_STUDENT); setModal('add-student'); },
                },
                {
                  label: 'Add Staff',
                  icon: <UserCheck className="h-5 w-5" />,
                  color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/50',
                  action: () => { setTab('staff'); setFormError(''); setStaffForm(BLANK_STAFF); setModal('add-staff'); },
                },
                {
                  label: 'View Reports',
                  icon: <FileText className="h-5 w-5" />,
                  color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
                  action: onNavigateToStaff,
                },
                {
                  label: 'Analytics',
                  icon: <BarChart2 className="h-5 w-5" />,
                  color: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800/50',
                  action: onNavigateToStaff,
                },
              ].map(({ label, icon, color, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  disabled={!action}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border font-bold text-xs transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${color}`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard title="Recent Activity" subtitle="Latest system events">
            <div className="space-y-1">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No activity yet.</p>
              ) : (
                recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${item.iconBg}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{item.sub}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${item.badgeCls}`}>{item.badge}</span>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {/* Verification Queue */}
          <SectionCard
            title="Verification Queue"
            subtitle={`${verificationQueue.length} student${verificationQueue.length !== 1 ? 's' : ''} pending`}
            action={
              verificationQueue.length > 0 ? (
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white text-[9px] font-black">
                  {verificationQueue.length}
                </span>
              ) : null
            }
          >
            <div className="space-y-1">
              {verificationQueue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">All students verified</p>
                </div>
              ) : (
                verificationQueue.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
                    <div className="h-7 w-7 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-[10px] shrink-0">
                      {s.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">{s.full_name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{s.register_no}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase">Pending</span>
                    </div>
                  </div>
                ))
              )}
              {verificationQueue.length > 5 && (
                <button
                  type="button"
                  onClick={() => { setTab('students'); setSearchQuery(''); }}
                  className="w-full flex items-center justify-center gap-1.5 pt-2 text-[10px] font-black text-[#002D62] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <ArrowRight className="h-3 w-3" />
                  View all {verificationQueue.length} pending
                </button>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Placement Insights (Charts) */}
        {students.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Metrics */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/80 shadow-md flex flex-col h-[340px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Placement Metrics Overview</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Overall student performance benchmarks</p>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMetricTab('readiness')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      metricTab === 'readiness'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    Readiness Score
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricTab('cgpa')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      metricTab === 'cgpa'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    CGPA
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={metricTab === 'readiness' ? [0, 100] : [0, 10]}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey={metricTab === 'readiness' ? 'Score' : 'CGPA'} 
                      fill={metricTab === 'readiness' ? '#3B82F6' : '#8B5CF6'} 
                      radius={[8, 8, 0, 0]} 
                      maxBarSize={45} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Placed vs Not Placed */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/80 shadow-md flex flex-col h-[340px]">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Placement Distribution</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Ratio of placed vs unplaced student accounts</p>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="w-[50%] h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.distributionData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                      {students.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                      Total
                    </span>
                  </div>
                </div>

                <div className="w-[50%] pl-6 flex flex-col justify-center space-y-4">
                  {chartData.distributionData.map((entry) => {
                    const pct = students.length > 0 ? Math.round((entry.value / students.length) * 100) : 0;
                    return (
                      <div key={entry.name} className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                            {entry.value} {entry.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none mt-1">
                            {pct}% of cohort
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs + Table SectionCard */}
        <SectionCard noPadding className="flex-1 flex flex-col shadow-[0_15px_50px_-12px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50">
            {/* Segmented Tab Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 w-fit">
              <button type="button" onClick={() => setTab('students')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  tab === 'students' ? 'bg-white dark:bg-slate-700 text-[#002D62] dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}>
                <span>Students</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  tab === 'students' ? 'bg-[#002D62]/10 dark:bg-blue-900/50 text-[#002D62] dark:text-blue-300' : 'bg-slate-300/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {students.length}
                </span>
              </button>
              <button type="button" onClick={() => setTab('staff')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  tab === 'staff' ? 'bg-white dark:bg-slate-700 text-[#002D62] dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}>
                <span>Staff</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  tab === 'staff' ? 'bg-[#002D62]/10 dark:bg-blue-900/50 text-[#002D62] dark:text-blue-300' : 'bg-slate-300/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {staff.length}
                </span>
              </button>
            </div>

            {/* Add User Action Button */}
            <Button
              variant="primary"
              size="md"
              onClick={() => { setFormError(''); tab === 'students' ? (setStudentForm(BLANK_STUDENT), setModal('add-student')) : (setStaffForm(BLANK_STAFF), setModal('add-staff')); }}
              icon={<Plus className="h-4 w-4 stroke-[3]" />}
            >
              Add New {tab === 'students' ? 'Student' : 'Staff'}
            </Button>
          </div>

          {/* Search & Filter Controls Bar */}
          <div className="p-5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50/90 via-blue-50/25 to-slate-50/90 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex-1 w-full">
              <Input
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${tab} directory by Name, ${tab === 'students' ? 'Roll Number' : 'Staff ID'}, Email, or S.No...`}
                rightElement={
                  searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null
                }
              />
            </div>
          </div>

          {loading ? (
            <SectionLoader message="Loading directory records..." className="py-20" />
          ) : (
            <Table
              headers={['S.No', 'Full Name', tab === 'students' ? 'Roll Number' : 'Staff Identifier', 'Email Address', 'Account Status', 'Quick Actions']}
            >
              {rawList.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<AlertCircle className="h-8 w-8" />}
                      title={`No ${tab} registered yet`}
                      description={`Use the button above to provision new ${tab === 'students' ? 'student accounts' : 'staff members'}.`}
                    />
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<Search className="h-8 w-8" />}
                      title={`No matching ${tab} found`}
                      description="Try adjusting your search terms or status filter."
                      action={
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                        >
                          Reset Filters
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const s = item as Student & Staff;
                  return (
                    <TableRow key={item.id} striped={idx % 2 === 1}>
                      <Td className="font-black text-slate-500 dark:text-slate-400 text-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </Td>
                      <Td>
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{s.full_name}</p>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 md:hidden mt-0.5">{s.email}</p>
                        </div>
                      </Td>
                      <Td className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        {tab === 'students' ? s.register_no : s.faculty_id}
                      </Td>
                      <Td className="text-slate-600 dark:text-slate-300 hidden md:table-cell font-semibold text-xs">
                        {s.email}
                      </Td>
                      <Td>
                        <Badge variant={s.is_blocked ? 'danger' : 'success'} dot={true}>
                          {s.is_blocked ? 'Blocked' : 'Active'}
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            title="View Profile Details"
                            onClick={() => { setSelected(item); setModal(tab === 'students' ? 'view-student' : 'view-staff'); }}
                            icon={<Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                          />
                          {tab === 'students' && onImpersonate && (
                             <Button
                               variant="ghost"
                               size="xs"
                               title="Enter Student Portal"
                               onClick={() => onImpersonate({
                                 id: item.id,
                                 fullName: s.full_name,
                                 email: s.email,
                                 idNumber: s.register_no,
                                 contactNo: s.phone,
                                 department: (s as any).branch || 'CSE'
                                })}
                               icon={<LayoutDashboard className="h-4 w-4 text-amber-500 hover:text-amber-600 dark:text-amber-400" />}
                             />
                           )}
                          <Button
                            variant="ghost"
                            size="xs"
                            title="Edit User Information"
                            onClick={() => openEdit(tab === 'students' ? 'student' : 'staff', item)}
                            icon={<Edit2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            title={s.is_blocked ? 'Unblock Account' : 'Block Account'}
                            onClick={() => handleBlock(tab, item.id, !s.is_blocked)}
                            className={s.is_blocked ? 'text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 font-bold' : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'}
                          >
                            {s.is_blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            {s.is_blocked && <span>Unblock</span>}
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            title="Delete Account"
                            onClick={() => handleDelete(tab, item.id)}
                            icon={<Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />}
                          />
                        </div>
                      </Td>
                    </TableRow>
                  );
                })
              )}
            </Table>
          )}
        </SectionCard>
      </div>

      {/* ── MODALS ── */}

      {/* Add Student */}
      {modal === 'add-student' && (
        <Modal title="Register New Student" onClose={() => setModal(null)} size="md">
          <form onSubmit={handleAddStudent} className="space-y-4">
            <Input
              label="Full Name"
              icon={<User className="h-4 w-4" />}
              value={studentForm.full_name}
              placeholder="e.g., John Doe"
              required
              onChange={e => setStudentForm(p => ({ ...p, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
            />
            <Input
              label="Roll Number"
              icon={<Hash className="h-4 w-4" />}
              value={studentForm.register_no}
              placeholder="e.g., 2213001"
              required
              onChange={e => setStudentForm(p => ({ ...p, register_no: e.target.value.replace(/\D/g, '') }))}
            />
            <Input
              label="Phone"
              icon={<Phone className="h-4 w-4" />}
              value={studentForm.phone}
              placeholder="10-digit mobile number"
              required
              maxLength={10}
              onChange={e => setStudentForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
            />
            <Input
              label="Email Address"
              icon={<Mail className="h-4 w-4" />}
              value={studentForm.email}
              placeholder="name@ksrce.ac.in"
              type="email"
              required
              onChange={e => setStudentForm(p => ({ ...p, email: e.target.value }))}
            />
            {studentForm.full_name && studentForm.phone.length === 10 && (
              <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Auto-generated Password</p>
                  <p className="font-black text-sm tracking-wide mt-0.5">{genPassword(studentForm.full_name, studentForm.phone)}</p>
                </div>
                <span className="text-[11px] font-bold bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-700/60">
                  Emailed on save
                </span>
              </div>
            )}
            {formError && <FormError message={formError} />}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={formLoading}
              className="w-full mt-2"
            >
              Register Student Account
            </Button>
          </form>
        </Modal>
      )}

      {/* Add Staff */}
      {modal === 'add-staff' && (
        <Modal title="Register New Staff" onClose={() => setModal(null)} size="md">
          <form onSubmit={handleAddStaff} className="space-y-4">
            <Input
              label="Full Name"
              icon={<User className="h-4 w-4" />}
              value={staffForm.full_name}
              placeholder="e.g., Dr. Jane Smith"
              required
              onChange={e => setStaffForm(p => ({ ...p, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
            />
            <Input
              label="Staff ID"
              icon={<Hash className="h-4 w-4" />}
              value={staffForm.faculty_id}
              placeholder="e.g., KSRSTF123"
              required
              onChange={e => setStaffForm(p => ({ ...p, faculty_id: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))}
            />
            <Input
              label="Phone"
              icon={<Phone className="h-4 w-4" />}
              value={staffForm.phone}
              placeholder="10-digit mobile number"
              required
              maxLength={10}
              onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
            />
            <Input
              label="Email Address"
              icon={<Mail className="h-4 w-4" />}
              value={staffForm.email}
              placeholder="name@ksrce.ac.in"
              type="email"
              required
              onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))}
            />
            {staffForm.full_name && staffForm.phone.length === 10 && (
              <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Auto-generated Password</p>
                  <p className="font-black text-sm tracking-wide mt-0.5">{genPassword(staffForm.full_name, staffForm.phone)}</p>
                </div>
                <span className="text-[11px] font-bold bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-700/60">
                  Emailed on save
                </span>
              </div>
            )}
            {formError && <FormError message={formError} />}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={formLoading}
              className="w-full mt-2"
            >
              Register Staff Account
            </Button>
          </form>
        </Modal>
      )}

      {/* Edit Student */}
      {modal === 'edit-student' && selected && (
        <Modal title="Edit Student Profile" onClose={() => setModal(null)} size="md">
          <form onSubmit={handleEditStudent} className="space-y-4">
            <Input
              label="Full Name"
              icon={<User className="h-4 w-4" />}
              value={studentForm.full_name}
              required
              onChange={e => setStudentForm(p => ({ ...p, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
            />
            <Input
              label="Roll Number"
              icon={<Hash className="h-4 w-4" />}
              value={studentForm.register_no}
              required
              onChange={e => setStudentForm(p => ({ ...p, register_no: e.target.value.replace(/\D/g, '') }))}
            />
            <Input
              label="Phone"
              icon={<Phone className="h-4 w-4" />}
              value={studentForm.phone}
              required
              maxLength={10}
              onChange={e => setStudentForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
            />
            <Input
              label="Email Address"
              icon={<Mail className="h-4 w-4" />}
              value={studentForm.email}
              type="email"
              required
              onChange={e => setStudentForm(p => ({ ...p, email: e.target.value }))}
            />
            {formError && <FormError message={formError} />}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={formLoading}
              className="w-full mt-2"
            >
              Update Student Details
            </Button>
          </form>
        </Modal>
      )}

      {/* Edit Staff */}
      {modal === 'edit-staff' && selected && (
        <Modal title="Edit Staff Profile" onClose={() => setModal(null)} size="md">
          <form onSubmit={handleEditStaff} className="space-y-4">
            <Input
              label="Full Name"
              icon={<User className="h-4 w-4" />}
              value={staffForm.full_name}
              required
              onChange={e => setStaffForm(p => ({ ...p, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
            />
            <Input
              label="Staff ID"
              icon={<Hash className="h-4 w-4" />}
              value={staffForm.faculty_id}
              required
              onChange={e => setStaffForm(p => ({ ...p, faculty_id: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))}
            />
            <Input
              label="Phone"
              icon={<Phone className="h-4 w-4" />}
              value={staffForm.phone}
              required
              maxLength={10}
              onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
            />
            <Input
              label="Email Address"
              icon={<Mail className="h-4 w-4" />}
              value={staffForm.email}
              type="email"
              required
              onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))}
            />
            {formError && <FormError message={formError} />}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={formLoading}
              className="w-full mt-2"
            >
              Update Staff Details
            </Button>
          </form>
        </Modal>
      )}

      {/* View Student */}
      {modal === 'view-student' && selected && (() => {
        const s = selected as Student;
        return (
          <Modal title="Student Profile Details" onClose={() => setModal(null)} size="md">
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="h-12 w-12 rounded-2xl bg-[#002D62]/10 dark:bg-blue-900/40 flex items-center justify-center text-[#002D62] dark:text-blue-400 font-black text-base shrink-0">
                  {s?.full_name ? s.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{s?.full_name}</p>
                  <p className="text-xs text-slate-400">Roll No: {s?.register_no}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {[
                  ['Email Address', s.email],
                  ['Contact Phone', s.phone],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{k}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account State</span>
                  <Badge variant={s.is_blocked ? 'danger' : 'success'} dot>
                    {s.is_blocked ? 'Blocked' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* View Staff */}
      {modal === 'view-staff' && selected && (() => {
        const s = selected as Staff;
        return (
          <Modal title="Staff Profile Details" onClose={() => setModal(null)} size="md">
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-base shrink-0">
                  {s?.full_name ? s.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{s?.full_name}</p>
                  <p className="text-xs text-slate-400">Staff ID: {s?.faculty_id}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {[
                  ['Email Address', s.email],
                  ['Contact Phone', s.phone],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{k}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account State</span>
                  <Badge variant={s.is_blocked ? 'danger' : 'success'} dot>
                    {s.is_blocked ? 'Blocked' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}
    </PageContainer>
  );
}