import { useState, useEffect } from 'react';
import {
  Users, UserCheck, Plus, Trash2, Ban, CheckCircle2, Eye, LogOut, Edit2,
  AlertCircle, User, Hash, Phone, Mail, ShieldCheck, Search, Filter, UserX, X
} from 'lucide-react';
import collegeLogo from '../assets/logo.jpg';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Button, Input, StatCard, SectionCard, Modal, Badge, Table, TableRow, Td,
  SectionLoader, EmptyState, Toast, FormError, PageHeader
} from '../components/ui';

interface AdminUser { fullName: string; email: string; }
interface AdminDashboardProps { user: AdminUser; onLogout: () => void; }

interface Student {
  id: string; full_name: string; register_no: string; email: string; phone: string; is_blocked: boolean;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Student Users"
            value={students.length}
            icon={<Users className="h-6 w-6" />}
            iconBg="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50"
            accentColor="text-blue-600 dark:text-blue-400"
            footer={
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Placement Ready Accounts</span>
              </div>
            }
          />
          <StatCard
            label="Staff Users"
            value={staff.length}
            icon={<UserCheck className="h-6 w-6" />}
            iconBg="bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800/50"
            accentColor="text-orange-600 dark:text-orange-400"
            footer={
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>Verified Placement Officers</span>
              </div>
            }
          />
          <StatCard
            label="Unblocked Users"
            value={students.filter(s => !s.is_blocked).length + staff.filter(s => !s.is_blocked).length}
            icon={<ShieldCheck className="h-6 w-6" />}
            iconBg="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50"
            accentColor="text-emerald-600 dark:text-emerald-400"
            footer={
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Active Operational Accounts</span>
              </div>
            }
          />
          <StatCard
            label="Blocked Users"
            value={students.filter(s => s.is_blocked).length + staff.filter(s => s.is_blocked).length}
            icon={<UserX className="h-6 w-6" />}
            iconBg="bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50"
            accentColor="text-rose-600 dark:text-rose-400"
            footer={
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Restricted Access Accounts</span>
              </div>
            }
          />
        </div>

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
      {(() => {
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
                  ['Account State', s.is_blocked ? '🔴 Blocked' : '🟢 Active']
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{k}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* View Staff */}
      {(() => {
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
                  ['Account State', s.is_blocked ? '🔴 Blocked' : '🟢 Active']
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{k}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        );
      })()}
    </PageContainer>
  );
}