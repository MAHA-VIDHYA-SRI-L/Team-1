import { useState, useEffect } from 'react';
import { Users, UserCheck, Plus, Trash2, Ban, CheckCircle2, Eye, X, LogOut, Edit2, AlertCircle, User, Hash, Phone, Mail, ShieldCheck, Search, Filter, UserX } from 'lucide-react';
import collegeLogo from '../assets/logo.jpg';
import { ThemeToggle } from '../components/ThemeToggle';

interface AdminUser { fullName: string; email: string; }
interface AdminDashboardProps { user: AdminUser; onLogout: () => void; }

const inputCls = 'w-full pl-10 pr-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm outline-none transition-all focus:border-[#002D62] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#002D62]/10';

const IconInput = ({ icon: Icon, value, onChange, placeholder, type = 'text', required = true, maxLength }: {
  icon: React.ElementType; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; maxLength?: number;
}) => (
  <div className="relative group">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#002D62] dark:group-focus-within:text-blue-400 transition-colors">
      <Icon className="h-4 w-4" />
    </span>
    <input type={type} value={value} placeholder={placeholder} required={required} maxLength={maxLength}
      onChange={e => onChange(e.target.value)} className={inputCls} />
  </div>
);

const ModalWrapper = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden transition-colors">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">{title}</h3>
        <button type="button" onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const TableRow = ({ item, type, index, onView, onEdit, onBlock, onDelete }: {
  item: Student | Staff; type: 'students' | 'staff'; index: number;
  onView: () => void; onEdit: () => void;
  onBlock: () => void; onDelete: () => void;
}) => {
  const s = item as Student & Staff;
  return (
    <tr className={`border-b border-slate-200/80 dark:border-slate-700/80 transition-all text-sm group ${
      index % 2 === 0 ? 'bg-white dark:bg-slate-800/80' : 'bg-slate-100/90 dark:bg-slate-900/60'
    } hover:bg-blue-50/60 dark:hover:bg-blue-950/40 hover:shadow-2xs`}>
      <td className="px-6 py-4.5 font-black text-slate-500 dark:text-slate-400 text-xs">
        {String(index + 1).padStart(2, '0')}
      </td>
      <td className="px-6 py-4.5">
        <div>
          <p className="font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{s.full_name}</p>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 md:hidden mt-0.5">{s.email}</p>
        </div>
      </td>
      <td className="px-6 py-4.5 font-bold text-slate-700 dark:text-slate-300 text-xs">{type === 'students' ? s.register_no : s.faculty_id}</td>
      <td className="px-6 py-4.5 text-slate-600 dark:text-slate-300 hidden md:table-cell font-semibold text-xs">{s.email}</td>
      <td className="px-6 py-4.5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${
          s.is_blocked ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.is_blocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          {s.is_blocked ? 'Blocked' : 'Active'}
        </span>
      </td>
      <td className="px-6 py-4.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" title="View Profile Details" onClick={onView} 
            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" title="Edit User Information" onClick={onEdit} 
            className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all">
            <Edit2 className="h-4 w-4" />
          </button>
          <button type="button" title={s.is_blocked ? 'Unblock Account' : 'Block Account'} onClick={onBlock}
            className={`p-2 rounded-xl transition-all ${
              s.is_blocked ? 'text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs flex items-center gap-1 px-2.5' : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}>
            {s.is_blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
            {s.is_blocked && <span>Unblock</span>}
          </button>
          <button type="button" title="Delete Account" onClick={onDelete} 
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface Student {
  id: string; full_name: string; register_no: string; email: string; phone: string; is_blocked: boolean;
}
interface Staff {
  id: string; full_name: string; faculty_id: string; email: string; phone: string; is_blocked: boolean;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
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

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'students' | 'staff'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/50 animate-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />{toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 px-6 sm:px-10 py-4 shadow-sm transition-colors">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-slate-200/80 dark:ring-slate-700 shadow-sm shrink-0 bg-white p-0.5">
              <img src={collegeLogo} className="w-full h-full object-contain rounded-xl" alt="College Logo" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-black text-[#002D62] dark:text-blue-400 tracking-wider uppercase leading-none">PLACEMATE</p>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#002D62]/10 dark:bg-blue-900/40 text-[#002D62] dark:text-blue-300 border border-[#002D62]/20 dark:border-blue-700/50 uppercase tracking-widest">
                  Enterprise Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-bold tracking-wider mt-1">USER & PROVISIONING CONSOLE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">System Live</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-3">
              <ThemeToggle variant="button" />
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                Welcome, <span className="font-extrabold text-slate-800 dark:text-slate-100">{user.fullName}</span>
              </span>
              <button onClick={onLogout} title="Sign Out"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white border border-red-100 dark:border-red-900/40 transition-all shadow-sm active:scale-95">
                <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 xl:px-14 py-8 flex-1 flex flex-col space-y-8 relative z-10">
        {/* Stats Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Student Users</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{students.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-105 transition-transform">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Placement Ready Accounts</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Staff Users</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{staff.length}</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800/50 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm group-hover:scale-105 transition-transform">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
              <span>Verified Placement Officers</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Unblocked Users</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                  {students.filter(s => !s.is_blocked).length + staff.filter(s => !s.is_blocked).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Active Operational Accounts</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:border-rose-300 dark:hover:border-rose-500 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Blocked Users</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                  {students.filter(s => s.is_blocked).length + staff.filter(s => s.is_blocked).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm group-hover:scale-105 transition-transform">
                <UserX className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>Restricted Access Accounts</span>
            </div>
          </div>
        </div>

        {/* Tabs + Table Card */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.06)] overflow-hidden flex-1 flex flex-col">
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
            <button
              type="button"
              onClick={() => { setFormError(''); tab === 'students' ? (setStudentForm(BLANK_STUDENT), setModal('add-student')) : (setStaffForm(BLANK_STAFF), setModal('add-staff')); }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#002D62] to-[#00428c] text-white text-xs font-extrabold rounded-xl hover:from-[#001f44] hover:to-[#003366] transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Add New {tab === 'students' ? 'Student' : 'Staff'}
            </button>
          </div>

          {/* Search & Filter Controls Bar */}
          <div className="p-5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50/90 via-blue-50/25 to-slate-50/90 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 w-full group">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-xl bg-gradient-to-br from-[#002D62] to-[#00428c] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform pointer-events-none">
                <Search className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${tab} directory by Name, ${tab === 'students' ? 'Roll Number' : 'Staff ID'}, Email, or S.No...`}
                className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200/80 dark:border-slate-700/80 hover:border-[#002D62]/40 dark:hover:border-blue-500 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#002D62] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#002D62]/10 transition-all duration-200 shadow-[0_4px_15px_-3px_rgba(0,45,98,0.06)] hover:shadow-[0_6px_20px_-3px_rgba(0,45,98,0.12)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  <X className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border-2 border-slate-200/80 dark:border-slate-700/80 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.04)] self-start sm:self-auto shrink-0">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2.5 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-[#002D62] dark:text-blue-400" /> Status:
              </span>
              {(['all', 'active', 'blocked'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-gradient-to-r from-[#002D62] to-[#00428c] dark:from-blue-600 dark:to-blue-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-[#002D62] animate-spin" />
              <p className="text-slate-400 font-bold text-sm">Loading directory records...</p>
            </div>
          ) : (() => {
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
              <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-[#002D62] via-[#00387a] to-[#002D62] text-white border-b-2 border-[#001f44] shadow-md">
                    <tr className="text-[11px] font-black uppercase tracking-widest text-white/95">
                      <th className="px-6 py-4.5 text-left">S.No</th>
                      <th className="px-6 py-4.5 text-left">Full Name</th>
                      <th className="px-6 py-4.5 text-left">{tab === 'students' ? 'Roll Number' : 'Staff Identifier'}</th>
                      <th className="px-6 py-4.5 text-left hidden md:table-cell">Email Address</th>
                      <th className="px-6 py-4.5 text-left">Account Status</th>
                      <th className="px-6 py-4.5 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rawList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="h-8 w-8 text-slate-300" />
                            <p className="font-bold text-base text-slate-600">No {tab} registered yet</p>
                            <p className="text-xs text-slate-400 max-w-sm">Use the button above to provision new {tab === 'students' ? 'student accounts' : 'staff members'}.</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Search className="h-8 w-8 text-slate-300" />
                            <div>
                              <p className="font-bold text-base text-slate-600">No matching {tab} found</p>
                              <p className="text-xs text-slate-400 max-w-sm mt-0.5">Try adjusting your search terms or status filter.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                            >
                              Reset Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((item, idx) => (
                        <TableRow key={item.id} item={item} type={tab} index={idx}
                          onView={() => { setSelected(item); setModal(tab === 'students' ? 'view-student' : 'view-staff'); }}
                          onEdit={() => openEdit(tab === 'students' ? 'student' : 'staff', item)}
                          onBlock={() => handleBlock(tab, item.id, !(item as Student & Staff).is_blocked)}
                          onDelete={() => handleDelete(tab, item.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Add Student */}
      {modal === 'add-student' && (
        <ModalWrapper title="Register New Student" onClose={() => setModal(null)}>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Full Name</label>
              <IconInput icon={User} value={studentForm.full_name} placeholder="e.g., John Doe"
                onChange={v => setStudentForm(p => ({ ...p, full_name: v.replace(/[^a-zA-Z\s]/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Roll Number</label>
              <IconInput icon={Hash} value={studentForm.register_no} placeholder="e.g., 2213001"
                onChange={v => setStudentForm(p => ({ ...p, register_no: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Phone</label>
              <IconInput icon={Phone} value={studentForm.phone} placeholder="10-digit mobile number" maxLength={10}
                onChange={v => setStudentForm(p => ({ ...p, phone: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Email Address</label>
              <IconInput icon={Mail} value={studentForm.email} placeholder="name@ksrce.ac.in" type="email"
                onChange={v => setStudentForm(p => ({ ...p, email: v }))} />
            </div>
            {studentForm.full_name && studentForm.phone.length === 10 && (
              <div className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Auto-generated Password</p>
                  <p className="font-black text-sm tracking-wide mt-0.5">{genPassword(studentForm.full_name, studentForm.phone)}</p>
                </div>
                <span className="text-[11px] font-bold bg-white text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  Emailed on save
                </span>
              </div>
            )}
            {formError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" /><span>{formError}</span>
              </div>
            )}
            <button type="submit" disabled={formLoading}
              className="w-full py-3 bg-gradient-to-r from-[#002D62] to-[#00428c] text-white font-extrabold text-sm rounded-xl hover:from-[#001f44] hover:to-[#003366] transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2">
              {formLoading ? 'Provisioning Student...' : 'Register Student Account'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Add Staff */}
      {modal === 'add-staff' && (
        <ModalWrapper title="Register New Staff" onClose={() => setModal(null)}>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Full Name</label>
              <IconInput icon={User} value={staffForm.full_name} placeholder="e.g., Dr. Jane Smith"
                onChange={v => setStaffForm(p => ({ ...p, full_name: v.replace(/[^a-zA-Z\s]/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Staff ID</label>
              <IconInput icon={Hash} value={staffForm.faculty_id} placeholder="e.g., KSRSTF123"
                onChange={v => setStaffForm(p => ({ ...p, faculty_id: v.replace(/[^a-zA-Z0-9]/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Phone</label>
              <IconInput icon={Phone} value={staffForm.phone} placeholder="10-digit mobile number" maxLength={10}
                onChange={v => setStaffForm(p => ({ ...p, phone: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Email Address</label>
              <IconInput icon={Mail} value={staffForm.email} placeholder="name@ksrce.ac.in" type="email"
                onChange={v => setStaffForm(p => ({ ...p, email: v }))} />
            </div>
            {staffForm.full_name && staffForm.phone.length === 10 && (
              <div className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Auto-generated Password</p>
                  <p className="font-black text-sm tracking-wide mt-0.5">{genPassword(staffForm.full_name, staffForm.phone)}</p>
                </div>
                <span className="text-[11px] font-bold bg-white text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  Emailed on save
                </span>
              </div>
            )}
            {formError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" /><span>{formError}</span>
              </div>
            )}
            <button type="submit" disabled={formLoading}
              className="w-full py-3 bg-gradient-to-r from-[#002D62] to-[#00428c] text-white font-extrabold text-sm rounded-xl hover:from-[#001f44] hover:to-[#003366] transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2">
              {formLoading ? 'Provisioning Staff...' : 'Register Staff Account'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Edit Student */}
      {modal === 'edit-student' && selected && (
        <ModalWrapper title="Edit Student Profile" onClose={() => setModal(null)}>
          <form onSubmit={handleEditStudent} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Full Name</label>
              <IconInput icon={User} value={studentForm.full_name}
                onChange={v => setStudentForm(p => ({ ...p, full_name: v.replace(/[^a-zA-Z\s]/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Roll Number</label>
              <IconInput icon={Hash} value={studentForm.register_no}
                onChange={v => setStudentForm(p => ({ ...p, register_no: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Phone</label>
              <IconInput icon={Phone} value={studentForm.phone} maxLength={10}
                onChange={v => setStudentForm(p => ({ ...p, phone: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Email Address</label>
              <IconInput icon={Mail} value={studentForm.email} type="email"
                onChange={v => setStudentForm(p => ({ ...p, email: v }))} />
            </div>
            {formError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" /><span>{formError}</span>
              </div>
            )}
            <button type="submit" disabled={formLoading}
              className="w-full py-3 bg-gradient-to-r from-[#002D62] to-[#00428c] text-white font-extrabold text-sm rounded-xl hover:from-[#001f44] hover:to-[#003366] transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2">
              {formLoading ? 'Saving Changes...' : 'Update Student Details'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Edit Staff */}
      {modal === 'edit-staff' && selected && (
        <ModalWrapper title="Edit Staff Profile" onClose={() => setModal(null)}>
          <form onSubmit={handleEditStaff} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Full Name</label>
              <IconInput icon={User} value={staffForm.full_name}
                onChange={v => setStaffForm(p => ({ ...p, full_name: v.replace(/[^a-zA-Z\s]/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Staff ID</label>
              <IconInput icon={Hash} value={staffForm.faculty_id}
                onChange={v => setStaffForm(p => ({ ...p, faculty_id: v.replace(/[^a-zA-Z0-9]/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Phone</label>
              <IconInput icon={Phone} value={staffForm.phone} maxLength={10}
                onChange={v => setStaffForm(p => ({ ...p, phone: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Email Address</label>
              <IconInput icon={Mail} value={staffForm.email} type="email"
                onChange={v => setStaffForm(p => ({ ...p, email: v }))} />
            </div>
            {formError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" /><span>{formError}</span>
              </div>
            )}
            <button type="submit" disabled={formLoading}
              className="w-full py-3 bg-gradient-to-r from-[#002D62] to-[#00428c] text-white font-extrabold text-sm rounded-xl hover:from-[#001f44] hover:to-[#003366] transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2">
              {formLoading ? 'Saving Changes...' : 'Update Staff Details'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* View Student */}
      {modal === 'view-student' && selected && (() => {
        const s = selected as Student;
        return (
          <ModalWrapper title="Student Profile Details" onClose={() => setModal(null)}>
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="h-12 w-12 rounded-2xl bg-[#002D62]/10 dark:bg-blue-900/40 flex items-center justify-center text-[#002D62] dark:text-blue-400 font-black text-base shrink-0">
                  {s.full_name ? s.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-white text-base">{s.full_name}</p>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-400">Roll No: {s.register_no}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {[
                  ['Email Address', s.email], 
                  ['Contact Phone', s.phone],
                  ['Account State', s.is_blocked ? '🔴 Blocked' : '🟢 Active']
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5">
                    <span className="font-semibold text-slate-400 dark:text-slate-400 text-xs uppercase tracking-wider">{k}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </ModalWrapper>
        );
      })()}

      {/* View Staff */}
      {modal === 'view-staff' && selected && (() => {
        const s = selected as Staff;
        return (
          <ModalWrapper title="Staff Profile Details" onClose={() => setModal(null)}>
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-base shrink-0">
                  {s.full_name ? s.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-white text-base">{s.full_name}</p>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-400">Staff ID: {s.faculty_id}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {[
                  ['Email Address', s.email], 
                  ['Contact Phone', s.phone],
                  ['Account State', s.is_blocked ? '🔴 Blocked' : '🟢 Active']
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5">
                    <span className="font-semibold text-slate-400 dark:text-slate-400 text-xs uppercase tracking-wider">{k}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </ModalWrapper>
        );
      })()}
    </div>
  );
}