import { useState, useEffect } from 'react';
import { Users, UserCheck, Plus, Trash2, Ban, CheckCircle2, Eye, Edit2, User, Hash, Phone, Mail, ShieldCheck, Search, UserX } from 'lucide-react';
import { PageContainer, PageHeader, StatCard, ThemeToggle, Badge, Input, Button, Select, Table, Thead, Tbody, Th, Tr, Td, Modal, Label, FieldError } from '../components/ui';
import { AlertCircle } from "lucide-react";
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

  return (
    <PageContainer width="wide">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/50 animate-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />{toast}
        </div>
      )}

      <PageHeader
        title="Admin Console"
        subtitle={`Welcome, ${user.fullName} — User & Provisioning Console`}
        action={
          <div className="flex items-center gap-3">
            <Badge variant="success">System Live</Badge>
            <ThemeToggle variant="button" />
            <button onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white border border-red-100 dark:border-red-900/40 transition-all shadow-sm active:scale-95">
              <span>Logout</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Student Users" value={students.length} icon={<Users className="h-6 w-6" />} iconBg="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
          <StatCard label="Staff Users" value={staff.length} icon={<UserCheck className="h-6 w-6" />} iconBg="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" />
          <StatCard label="Active Users" value={students.filter(s => !s.is_blocked).length + staff.filter(s => !s.is_blocked).length} icon={<ShieldCheck className="h-6 w-6" />} iconBg="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Blocked Users" value={students.filter(s => s.is_blocked).length + staff.filter(s => s.is_blocked).length} icon={<UserX className="h-6 w-6" />} iconBg="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" />
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
          <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search ${tab} by Name, ${tab === 'students' ? 'Roll Number' : 'Staff ID'}, or Email...`}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
                className="w-full sm:w-40"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </Select>
              {(searchQuery || statusFilter !== 'all') && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                  Reset
                </Button>
              )}
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
              <Table>
                <Thead>
                  <Tr>
                    <Th>S.No</Th>
                    <Th>Full Name</Th>
                    <Th>{tab === 'students' ? 'Roll Number' : 'Staff ID'}</Th>
                    <Th className="hidden md:table-cell">Email</Th>
                    <Th>Status</Th>
                    <Th align="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rawList.length === 0 ? (
                    <Tr>
                      <td colSpan={6} align="center" className="text-center px-6 py-10">
                        <div className="py-10 flex flex-col items-center gap-2">
                          <AlertCircle className="h-7 w-7 text-slate-300" />
                          <p className="font-bold text-slate-500">No {tab} registered yet</p>
                        </div>
                      </td>
                    </Tr>
                  ) : filteredList.length === 0 ? (
                    <Tr>
                      <td colSpan={6} align="center">
                        <div className="py-10 flex flex-col items-center gap-2">
                          <Search className="h-7 w-7 text-slate-300" />
                          <p className="font-bold text-slate-500">No matching {tab} found</p>
                          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>Reset Filters</Button>
                        </div>
                      </td>
                    </Tr>
                  ) : (
                    filteredList.map((item, idx) => {
                      const s = item as Student & Staff;
                      return (
                        <Tr key={item.id}>
                          <Td muted>{String(idx + 1).padStart(2, '0')}</Td>
                          <Td>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{s.full_name}</p>
                            <p className="text-xs text-slate-400 md:hidden">{s.email}</p>
                          </Td>
                          <Td>{tab === 'students' ? s.register_no : s.faculty_id}</Td>
                          <Td className="hidden md:table-cell">{s.email}</Td>
                          <Td>
                            <Badge variant={s.is_blocked ? 'danger' : 'success'}>
                              {s.is_blocked ? 'Blocked' : 'Active'}
                            </Badge>
                          </Td>
                          <Td align="right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />}
                                onClick={() => { setSelected(item); setModal(tab === 'students' ? 'view-student' : 'view-staff'); }} />
                              <Button variant="ghost" size="sm" icon={<Edit2 className="h-3.5 w-3.5" />}
                                onClick={() => openEdit(tab === 'students' ? 'student' : 'staff', item)} />
                              <Button
                                variant={s.is_blocked ? 'success' : 'ghost'} size="sm"
                                icon={s.is_blocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                onClick={() => handleBlock(tab, item.id, !s.is_blocked)}
                              >{s.is_blocked ? 'Unblock' : ''}</Button>
                              <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={() => handleDelete(tab, item.id)} />
                            </div>
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            );
          })()}
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Add Student */}
      <Modal open={modal === 'add-student'} onClose={() => setModal(null)} title="Register New Student">
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <Label htmlFor="s-name" required>Full Name</Label>
            <Input id="s-name" icon={<User className="h-4 w-4" />} value={studentForm.full_name} placeholder="e.g., John Doe"
              onChange={e => setStudentForm(p => ({ ...p, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="s-reg" required>Roll Number</Label>
            <Input id="s-reg" icon={<Hash className="h-4 w-4" />} value={studentForm.register_no} placeholder="e.g., 2213001"
              onChange={e => setStudentForm(p => ({ ...p, register_no: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="s-phone" required>Phone</Label>
            <Input id="s-phone" icon={<Phone className="h-4 w-4" />} value={studentForm.phone} placeholder="10-digit mobile number" maxLength={10}
              onChange={e => setStudentForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="s-email" required>Email Address</Label>
            <Input id="s-email" type="email" icon={<Mail className="h-4 w-4" />} value={studentForm.email} placeholder="name@ksrce.ac.in"
              onChange={e => setStudentForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          {studentForm.full_name && studentForm.phone.length === 10 && (
            <div className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Auto-generated Password</p>
                <p className="font-black text-sm tracking-wide mt-0.5">{genPassword(studentForm.full_name, studentForm.phone)}</p>
              </div>
              <span className="text-[11px] font-bold bg-white text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60">Emailed on save</span>
            </div>
          )}
          <FieldError message={formError} />
          <Button type="submit" loading={formLoading} className="w-full" size="lg">
            {formLoading ? 'Provisioning...' : 'Register Student Account'}
          </Button>
        </form>
      </Modal>

      {/* Add Staff */}
      <Modal open={modal === 'add-staff'} onClose={() => setModal(null)} title="Register New Staff">
        <form onSubmit={handleAddStaff} className="space-y-4">
          <div>
            <Label htmlFor="st-name" required>Full Name</Label>
            <Input id="st-name" icon={<User className="h-4 w-4" />} value={staffForm.full_name} placeholder="e.g., Dr. Jane Smith"
              onChange={e => setStaffForm(p => ({ ...p, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="st-id" required>Staff ID</Label>
            <Input id="st-id" icon={<Hash className="h-4 w-4" />} value={staffForm.faculty_id} placeholder="e.g., KSRSTF123"
              onChange={e => setStaffForm(p => ({ ...p, faculty_id: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="st-phone" required>Phone</Label>
            <Input id="st-phone" icon={<Phone className="h-4 w-4" />} value={staffForm.phone} placeholder="10-digit mobile number" maxLength={10}
              onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="st-email" required>Email Address</Label>
            <Input id="st-email" type="email" icon={<Mail className="h-4 w-4" />} value={staffForm.email} placeholder="name@ksrce.ac.in"
              onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          {staffForm.full_name && staffForm.phone.length === 10 && (
            <div className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Auto-generated Password</p>
                <p className="font-black text-sm tracking-wide mt-0.5">{genPassword(staffForm.full_name, staffForm.phone)}</p>
              </div>
              <span className="text-[11px] font-bold bg-white text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60">Emailed on save</span>
            </div>
          )}
          <FieldError message={formError} />
          <Button type="submit" loading={formLoading} className="w-full" size="lg">
            {formLoading ? 'Provisioning...' : 'Register Staff Account'}
          </Button>
        </form>
      </Modal>

      {/* Edit Student */}
      <Modal open={modal === 'edit-student' && !!selected} onClose={() => setModal(null)} title="Edit Student Profile">
        <form onSubmit={handleEditStudent} className="space-y-4">
          <div>
            <Label htmlFor="es-name" required>Full Name</Label>
            <Input id="es-name" icon={<User className="h-4 w-4" />} value={studentForm.full_name}
              onChange={e => setStudentForm(p => ({ ...p, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="es-reg" required>Roll Number</Label>
            <Input id="es-reg" icon={<Hash className="h-4 w-4" />} value={studentForm.register_no}
              onChange={e => setStudentForm(p => ({ ...p, register_no: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="es-phone" required>Phone</Label>
            <Input id="es-phone" icon={<Phone className="h-4 w-4" />} value={studentForm.phone} maxLength={10}
              onChange={e => setStudentForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="es-email" required>Email Address</Label>
            <Input id="es-email" type="email" icon={<Mail className="h-4 w-4" />} value={studentForm.email}
              onChange={e => setStudentForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <FieldError message={formError} />
          <Button type="submit" loading={formLoading} className="w-full" size="lg">
            {formLoading ? 'Saving...' : 'Update Student Details'}
          </Button>
        </form>
      </Modal>

      {/* Edit Staff */}
      <Modal open={modal === 'edit-staff' && !!selected} onClose={() => setModal(null)} title="Edit Staff Profile">
        <form onSubmit={handleEditStaff} className="space-y-4">
          <div>
            <Label htmlFor="est-name" required>Full Name</Label>
            <Input id="est-name" icon={<User className="h-4 w-4" />} value={staffForm.full_name}
              onChange={e => setStaffForm(p => ({ ...p, full_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="est-id" required>Staff ID</Label>
            <Input id="est-id" icon={<Hash className="h-4 w-4" />} value={staffForm.faculty_id}
              onChange={e => setStaffForm(p => ({ ...p, faculty_id: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="est-phone" required>Phone</Label>
            <Input id="est-phone" icon={<Phone className="h-4 w-4" />} value={staffForm.phone} maxLength={10}
              onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <Label htmlFor="est-email" required>Email Address</Label>
            <Input id="est-email" type="email" icon={<Mail className="h-4 w-4" />} value={staffForm.email}
              onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <FieldError message={formError} />
          <Button type="submit" loading={formLoading} className="w-full" size="lg">
            {formLoading ? 'Saving...' : 'Update Staff Details'}
          </Button>
        </form>
      </Modal>

      {/* View Student */}
      {(() => {
        const s = selected as Student;
        return (
          <Modal open={modal === 'view-student' && !!selected} onClose={() => setModal(null)} title="Student Profile">
            <div className="space-y-4">
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
                {([
                  ['Email', s?.email],
                  ['Phone', s?.phone],
                  ['Status', s?.is_blocked ? '🔴 Blocked' : '🟢 Active'],
                ] as [string, string][]).map(([k, v]) => (
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
          <Modal open={modal === 'view-staff' && !!selected} onClose={() => setModal(null)} title="Staff Profile">
            <div className="space-y-4">
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
                {([
                  ['Email', s?.email],
                  ['Phone', s?.phone],
                  ['Status', s?.is_blocked ? '🔴 Blocked' : '🟢 Active'],
                ] as [string, string][]).map(([k, v]) => (
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