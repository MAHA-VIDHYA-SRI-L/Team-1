import { useState, useEffect } from 'react';
import { Users, UserCheck, Plus, Trash2, Ban, CheckCircle2, Eye, X, LogOut, Edit2, AlertCircle, User, Hash, Phone, Mail } from 'lucide-react';
import collegeLogo from '../assets/logo.jpg';

interface AdminUser { fullName: string; email: string; }
interface AdminDashboardProps { user: AdminUser; onLogout: () => void; }

const inputCls = 'w-full pl-10 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400/80 text-[13px] bg-slate-50/40 border border-slate-300 shadow-sm outline-none transition-all focus:border-orange-500';

const IconInput = ({ icon: Icon, value, onChange, placeholder, type = 'text', required = true, maxLength }: {
  icon: React.ElementType; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; maxLength?: number;
}) => (
  <div className="relative group">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
      <Icon className="h-[15px] w-[15px]" />
    </span>
    <input type={type} value={value} placeholder={placeholder} required={required} maxLength={maxLength}
      onChange={e => onChange(e.target.value)} className={inputCls} />
  </div>
);

const ModalWrapper = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-[15px]">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const TableRow = ({ item, type, onView, onEdit, onBlock, onDelete }: {
  item: Student | Staff; type: 'students' | 'staff';
  onView: () => void; onEdit: () => void;
  onBlock: () => void; onDelete: () => void;
}) => {
  const s = item as Student & Staff;
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 text-[13px]">
      <td className="px-4 py-3 font-medium text-slate-800">{s.full_name}</td>
      <td className="px-4 py-3 text-slate-500">{type === 'students' ? s.register_no : s.faculty_id}</td>
      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{s.email}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${s.is_blocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {s.is_blocked ? 'Blocked' : 'Active'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button title="View" onClick={onView} className="text-slate-400 hover:text-blue-500 transition-colors"><Eye className="h-4 w-4" /></button>
          <button title="Edit" onClick={onEdit} className="text-slate-400 hover:text-orange-500 transition-colors"><Edit2 className="h-4 w-4" /></button>
          <button title={s.is_blocked ? 'Unblock' : 'Block'} onClick={onBlock}
            className={`transition-colors ${s.is_blocked ? 'text-emerald-500 hover:text-emerald-700' : 'text-amber-400 hover:text-amber-600'}`}>
            {s.is_blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          </button>
          <button title="Delete" onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
  'x-admin-key': import.meta.env.VITE_ADMIN_KEY || 'Admin@123',
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
  };

  const fetchStaff = async () => {
    const res = await fetch(`${API}/admin/staff`, { headers: adminHeaders() });
    const data = await res.json();
    if (res.ok) setStaff(data);
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
    if (res.ok) {
      showToast(block ? 'Account blocked' : 'Account unblocked');
      type === 'students' ? fetchStudents() : fetchStaff();
    }
  };

  const handleDelete = async (type: 'students' | 'staff', id: string) => {
    if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;
    const res = await fetch(`${API}/admin/${type}/${id}`, { method: 'DELETE', headers: adminHeaders() });
    if (res.ok) {
      showToast('Account deleted');
      type === 'students' ? fetchStudents() : fetchStaff();
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-white text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-lg">
          <CheckCircle2 className="h-4 w-4" />{toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-slate-200">
            <img src={collegeLogo} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-[13px] font-black text-[#002D62] uppercase tracking-wide leading-none">Placemate</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-500 hidden sm:block">Welcome, <span className="font-bold text-slate-700">{user.fullName}</span></span>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-red-500 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="px-6 pt-6 grid grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{students.length}</p>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Students</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{staff.length}</p>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Staff</p>
          </div>
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="px-6 pt-6 flex-1">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              <button onClick={() => setTab('students')}
                className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition-all ${tab === 'students' ? 'bg-white text-[#002D62] shadow-sm' : 'text-slate-500'}`}>
                Students
              </button>
              <button onClick={() => setTab('staff')}
                className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition-all ${tab === 'staff' ? 'bg-white text-[#002D62] shadow-sm' : 'text-slate-500'}`}>
                Staff
              </button>
            </div>
            <button
              onClick={() => { setFormError(''); tab === 'students' ? (setStudentForm(BLANK_STUDENT), setModal('add-student')) : (setStaffForm(BLANK_STAFF), setModal('add-staff')); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#002D62] text-white text-[12px] font-bold rounded-lg hover:bg-[#052349] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add {tab === 'students' ? 'Student' : 'Staff'}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-[13px]">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">{tab === 'students' ? 'Roll No' : 'Staff ID'}</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab === 'students' ? students : staff).length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-[13px]">No {tab} found</td></tr>
                  ) : (
                    (tab === 'students' ? students : staff).map(item => (
                      <TableRow key={item.id} item={item} type={tab}
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
          )}
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Add Student */}
      {modal === 'add-student' && (
        <ModalWrapper title="Register New Student" onClose={() => setModal(null)}>
          <form onSubmit={handleAddStudent} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
              <IconInput icon={User} value={studentForm.full_name} placeholder="e.g., John Doe"
                onChange={v => setStudentForm(p => ({ ...p, full_name: v.replace(/[^a-zA-Z\s]/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Roll Number</label>
              <IconInput icon={Hash} value={studentForm.register_no} placeholder="e.g., 2213001"
                onChange={v => setStudentForm(p => ({ ...p, register_no: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Phone</label>
              <IconInput icon={Phone} value={studentForm.phone} placeholder="10-digit number" maxLength={10}
                onChange={v => setStudentForm(p => ({ ...p, phone: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Email</label>
              <IconInput icon={Mail} value={studentForm.email} placeholder="name@ksrce.ac.in" type="email"
                onChange={v => setStudentForm(p => ({ ...p, email: v }))} />
            </div>
            {studentForm.full_name && studentForm.phone.length === 10 && (
              <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                Auto password: <span className="font-bold text-slate-700 tracking-wide">{genPassword(studentForm.full_name, studentForm.phone)}</span>
                <span className="text-slate-400"> — will be emailed</span>
              </div>
            )}
            {formError && <div className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{formError}</div>}
            <button type="submit" disabled={formLoading}
              className="w-full py-2.5 bg-[#002D62] text-white font-bold text-[13px] rounded-xl hover:bg-[#052349] disabled:opacity-60">
              {formLoading ? 'Registering...' : 'Register Student'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Add Staff */}
      {modal === 'add-staff' && (
        <ModalWrapper title="Register New Staff" onClose={() => setModal(null)}>
          <form onSubmit={handleAddStaff} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
              <IconInput icon={User} value={staffForm.full_name} placeholder="e.g., Dr. Jane Smith"
                onChange={v => setStaffForm(p => ({ ...p, full_name: v.replace(/[^a-zA-Z\s]/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Staff ID</label>
              <IconInput icon={Hash} value={staffForm.faculty_id} placeholder="e.g., KSRSTF123"
                onChange={v => setStaffForm(p => ({ ...p, faculty_id: v.replace(/[^a-zA-Z0-9]/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Phone</label>
              <IconInput icon={Phone} value={staffForm.phone} placeholder="10-digit number" maxLength={10}
                onChange={v => setStaffForm(p => ({ ...p, phone: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Email</label>
              <IconInput icon={Mail} value={staffForm.email} placeholder="name@ksrce.ac.in" type="email"
                onChange={v => setStaffForm(p => ({ ...p, email: v }))} />
            </div>
            {staffForm.full_name && staffForm.phone.length === 10 && (
              <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                Auto password: <span className="font-bold text-slate-700 tracking-wide">{genPassword(staffForm.full_name, staffForm.phone)}</span>
                <span className="text-slate-400"> — will be emailed</span>
              </div>
            )}
            {formError && <div className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{formError}</div>}
            <button type="submit" disabled={formLoading}
              className="w-full py-2.5 bg-[#002D62] text-white font-bold text-[13px] rounded-xl hover:bg-[#052349] disabled:opacity-60">
              {formLoading ? 'Registering...' : 'Register Staff'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Edit Student */}
      {modal === 'edit-student' && selected && (
        <ModalWrapper title="Edit Student" onClose={() => setModal(null)}>
          <form onSubmit={handleEditStudent} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
              <IconInput icon={User} value={studentForm.full_name}
                onChange={v => setStudentForm(p => ({ ...p, full_name: v.replace(/[^a-zA-Z\s]/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Roll Number</label>
              <IconInput icon={Hash} value={studentForm.register_no}
                onChange={v => setStudentForm(p => ({ ...p, register_no: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Phone</label>
              <IconInput icon={Phone} value={studentForm.phone} maxLength={10}
                onChange={v => setStudentForm(p => ({ ...p, phone: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Email</label>
              <IconInput icon={Mail} value={studentForm.email} type="email"
                onChange={v => setStudentForm(p => ({ ...p, email: v }))} />
            </div>
            {formError && <div className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{formError}</div>}
            <button type="submit" disabled={formLoading}
              className="w-full py-2.5 bg-[#002D62] text-white font-bold text-[13px] rounded-xl hover:bg-[#052349] disabled:opacity-60">
              {formLoading ? 'Updating...' : 'Update Student'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Edit Staff */}
      {modal === 'edit-staff' && selected && (
        <ModalWrapper title="Edit Staff" onClose={() => setModal(null)}>
          <form onSubmit={handleEditStaff} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
              <IconInput icon={User} value={staffForm.full_name}
                onChange={v => setStaffForm(p => ({ ...p, full_name: v.replace(/[^a-zA-Z\s]/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Staff ID</label>
              <IconInput icon={Hash} value={staffForm.faculty_id}
                onChange={v => setStaffForm(p => ({ ...p, faculty_id: v.replace(/[^a-zA-Z0-9]/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Phone</label>
              <IconInput icon={Phone} value={staffForm.phone} maxLength={10}
                onChange={v => setStaffForm(p => ({ ...p, phone: v.replace(/\D/g, '') }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Email</label>
              <IconInput icon={Mail} value={staffForm.email} type="email"
                onChange={v => setStaffForm(p => ({ ...p, email: v }))} />
            </div>
            {formError && <div className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{formError}</div>}
            <button type="submit" disabled={formLoading}
              className="w-full py-2.5 bg-[#002D62] text-white font-bold text-[13px] rounded-xl hover:bg-[#052349] disabled:opacity-60">
              {formLoading ? 'Updating...' : 'Update Staff'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* View Student */}
      {modal === 'view-student' && selected && (() => {
        const s = selected as Student;
        return (
          <ModalWrapper title="Student Profile" onClose={() => setModal(null)}>
            <div className="space-y-3 text-[13px]">
              {[
                ['Full Name', s.full_name], 
                ['Roll Number', s.register_no], 
                ['Email', s.email], 
                ['Phone', s.phone],
                ['Status', s.is_blocked ? '🔴 Blocked' : '🟢 Active']
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">{k}</span>
                  <span className="text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </ModalWrapper>
        );
      })()}

      {/* View Staff */}
      {modal === 'view-staff' && selected && (() => {
        const s = selected as Staff;
        return (
          <ModalWrapper title="Staff Profile" onClose={() => setModal(null)}>
            <div className="space-y-3 text-[13px]">
              {[
                ['Full Name', s.full_name], 
                ['Staff ID', s.faculty_id], 
                ['Email', s.email], 
                ['Phone', s.phone],
                ['Status', s.is_blocked ? '🔴 Blocked' : '🟢 Active']
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">{k}</span>
                  <span className="text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </ModalWrapper>
        );
      })()}
    </div>
  );
}