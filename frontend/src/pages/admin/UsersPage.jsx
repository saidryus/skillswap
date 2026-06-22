import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiShieldCheck, HiLockClosed, HiUpload } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ALL_PERMISSIONS = [
  { key: 'users',               label: 'Student Management' },
  { key: 'courses',             label: 'Courses' },
  { key: 'tutor-applications',  label: 'Tutor Applications' },
  { key: 'sessions',            label: 'Sessions' },
  { key: 'student-schedules',   label: 'Student Schedules' },
  { key: 'announcements',       label: 'Announcements' },
];

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '',
  role: 'student', yearLevel: '', phone: '', studentIdNumber: '',
  department: 'Information Technology', isActive: true, permissions: [],
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.isSuperAdmin;

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('student');
  const [deptFilter, setDeptFilter] = useState('');
  const [importText, setImportText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchUsers();
    api.get('/departments').then(({ data }) => setDepartments(data)).catch(() => {});
  }, []);

  useEffect(() => {
    let result = users;
    // Role filter
    if (roleFilter === 'tutor') result = result.filter(u => u.isTutor);
    else if (roleFilter === 'subadmin') result = result.filter(u => u.role === 'admin' && !u.isSuperAdmin);
    else if (roleFilter) result = result.filter(u => u.role === roleFilter);
    // Year level filter (only applies to students)
    if (yearFilter) result = result.filter(u => u.yearLevel === Number(yearFilter));
    // Department filter
    if (deptFilter) result = result.filter(u => u.department === deptFilter);
    // Search
    if (search) result = result.filter(u =>
      `${u.firstName} ${u.lastName} ${u.email} ${u.studentIdNumber || ''}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, yearFilter, deptFilter, roleFilter, users]);

  const students = users.filter(u => u.role === 'student');
  const counts = {
    student: students.length,
    tutor:   users.filter(u => u.isTutor).length,
    subadmin: users.filter(u => u.role === 'admin' && !u.isSuperAdmin).length,
    year: {
      1: students.filter(u => u.yearLevel === 1).length,
      2: students.filter(u => u.yearLevel === 2).length,
      3: students.filter(u => u.yearLevel === 3).length,
      4: students.filter(u => u.yearLevel === 4).length,
    },
  };

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ ...u, password: '', yearLevel: u.yearLevel ?? '', permissions: u.permissions || [] });
    setModalOpen(true);
  };

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await api.put(`/users/${editUser._id}`, form);
        toast.success('User updated');
      } else {
        await api.post('/users', form);
        toast.success('User created');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleImport = async () => {
    if (!importText.trim()) { toast.error('Paste CSV data first'); return; }
    setImportLoading(true);
    try {
      const lines = importText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.replace(/"/g, '').trim());
        return headers.reduce((obj, h, i) => { obj[h] = vals[i] || ''; return obj; }, {});
      }).filter(r => r.email);

      const { data } = await api.post('/users/import', rows);
      toast.success(`Imported: ${data.created} created, ${data.skipped} skipped${data.errors.length ? `, ${data.errors.length} errors` : ''}`);
      setImportOpen(false);
      setImportText('');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally { setImportLoading(false); }
  };

  const getRoleBadge = (u) => {
    if (u.isSuperAdmin) return <span className="inline-flex items-center gap-1 badge bg-yellow-500/20 text-yellow-300 border-yellow-500/30"><HiShieldCheck className="w-3 h-3" /> Super Admin</span>;
    if (u.role === 'admin') return <span className="inline-flex items-center gap-1 badge bg-blue-500/20 text-blue-300 border-blue-500/30"><HiLockClosed className="w-3 h-3" /> Sub-Admin</span>;
    if (u.isTutor) return <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/30">Tutor</span>;
    return <span className="badge bg-slate-500/20 text-surface-700 dark:text-surface-300 border-slate-500/30">Student</span>;
  };

  // Show year level filter only when viewing students or tutors
  const showYearFilter = roleFilter === 'student' || roleFilter === 'tutor';

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle="Manage all registered IT department students"
        action={
          <div className="flex gap-2">
            <button onClick={() => setImportOpen(true)} className="btn-secondary flex items-center gap-2">
              <HiUpload className="w-4 h-4" /> Bulk Import
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <HiPlus className="w-4 h-4" /> Add Student
            </button>
          </div>
        }
      />

      {/* Role tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex gap-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-1">
          {[
            { key: 'student', label: 'All Students', count: counts.student },
            { key: 'tutor',   label: 'Tutors',       count: counts.tutor },
            ...(isSuperAdmin ? [{ key: 'subadmin', label: 'Sub-Admin', count: counts.subadmin }] : []),
          ].map(tab => (
            <button key={tab.key} onClick={() => { setRoleFilter(tab.key); setYearFilter(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${roleFilter === tab.key ? 'bg-blue-600 text-white shadow' : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:bg-surface-800'}`}>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${roleFilter === tab.key ? 'bg-blue-500/50 text-blue-100' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2" placeholder="Search by name, email, ID..." />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field py-2 w-48">
          <option value="">All Departments</option>
          {departments.filter(d => d.isActive).map(d => (
            <option key={d._id} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Year level filter — only shown for students/tutors */}
      {showYearFilter && (
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-1 mb-6 w-fit">
          {[
            { key: '', label: 'All Years', count: students.length },
            { key: '1', label: '1st Year', count: counts.year[1] },
            { key: '2', label: '2nd Year', count: counts.year[2] },
            { key: '3', label: '3rd Year', count: counts.year[3] },
            { key: '4', label: '4th Year', count: counts.year[4] },
          ].map(tab => (
            <button key={tab.key} onClick={() => setYearFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${yearFilter === tab.key ? 'bg-indigo-600 text-white shadow' : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:bg-surface-800'}`}>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${yearFilter === tab.key ? 'bg-indigo-500/50 text-indigo-100' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Student ID</th>
                <th className="table-header">Year Level</th>
                <th className="table-header">Role</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-surface-500 dark:text-surface-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-surface-500 dark:text-surface-400">No users found</td></tr>
              ) : filtered.map(u => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface-50/50 dark:bg-surface-800/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-semibold">{u.firstName[0]}{u.lastName[0]}</span>
                      </div>
                      <span className="font-medium text-surface-900 dark:text-surface-100">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-surface-700 dark:text-surface-300">{u.email}</td>
                  <td className="table-cell font-mono text-xs">{u.studentIdNumber || '—'}</td>
                  <td className="table-cell">
                    {u.yearLevel
                      ? <span className="badge bg-indigo-500/20 text-indigo-300 border-indigo-500/30">{YEAR_LABELS[u.yearLevel]}</span>
                      : '—'}
                  </td>
                  <td className="table-cell">{getRoleBadge(u)}</td>
                  <td className="table-cell">
                    <span className={`badge ${u.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {!u.isSuperAdmin && (
                        <button onClick={() => openEdit(u)} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <HiPencil className="w-4 h-4" />
                        </button>
                      )}
                      {!u.isSuperAdmin && (isSuperAdmin || u.role !== 'admin') && (
                        <button onClick={() => handleDelete(u._id)} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit User' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name</label><input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="input-field" required /></div>
            <div><label className="label">Last Name</label><input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="input-field" required /></div>
          </div>
          <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" required /></div>
          <div>
            <label className="label">{editUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" required={!editUser} minLength={6} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Student ID</label><input value={form.studentIdNumber} onChange={e => setForm({...form, studentIdNumber: e.target.value})} className="input-field" placeholder="202400001" /></div>
            <div><label className="label">Year Level</label>
              <select value={form.yearLevel} onChange={e => setForm({...form, yearLevel: e.target.value})} className="input-field">
                <option value="">Select year</option>
                <option value="1">1st Year</option><option value="2">2nd Year</option>
                <option value="3">3rd Year</option><option value="4">4th Year</option>
              </select>
            </div>
          </div>
          <div><label className="label">Phone (optional)</label><input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="+63 9XX XXX XXXX" /></div>
          <div><label className="label">Department</label>
            <select value={form.department || 'Information Technology'} onChange={e => setForm({...form, department: e.target.value})} className="input-field">
              <option value="Information Technology">Information Technology</option>
              {departments.filter(d => d.isActive && d.name !== 'Information Technology').map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          {isSuperAdmin && !editUser && (
            <div><label className="label">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value, permissions: []})} className="input-field">
                <option value="student">Student</option>
                <option value="admin">Admin (Sub-Admin)</option>
              </select>
            </div>
          )}
          {form.role === 'admin' && isSuperAdmin && (
            <div className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-3 flex items-center gap-2">
                <HiShieldCheck className="w-4 h-4 text-blue-400" /> Sub-Admin Permissions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(({ key, label }) => (
                  <label key={key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
                    ${form.permissions.includes(key) ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:border-slate-500'}`}>
                    <input type="checkbox" checked={form.permissions.includes(key)} onChange={() => togglePermission(key)} className="w-3.5 h-3.5 accent-blue-500" />
                    <span className="text-xs font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {editUser && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded" />
              <label htmlFor="isActive" className="text-sm text-surface-700 dark:text-surface-300">Active Account</label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editUser ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={importOpen} onClose={() => { setImportOpen(false); setImportText(''); }} title="Bulk Import Students">
        <div className="space-y-4">
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 text-xs text-surface-500 dark:text-surface-400 space-y-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-surface-700 dark:text-surface-300">Expected CSV format:</p>
              <button
                onClick={() => {
                  const header = 'firstName,lastName,email,password,studentIdNumber,yearLevel,phone';
                  const sample = 'Juan,Dela Cruz,juan@student.edu,pass123,202400001,1,09171234567\nAna,Gonzales,ana@student.edu,,202400002,1,';
                  const blob = new Blob([`${header}\n${sample}`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'students_import_template.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <HiUpload className="w-3 h-3 rotate-180" /> Download Template
              </button>
            </div>
            <p className="font-mono">firstName,lastName,email,password,studentIdNumber,yearLevel,phone</p>
            <p className="font-mono text-surface-400 dark:text-surface-500">Juan,Dela Cruz,juan@student.edu,pass123,2024-00001,1,</p>
            <p className="mt-1 text-surface-400 dark:text-surface-500">password defaults to <span className="text-surface-700 dark:text-surface-300">skillswap123</span> if blank · phone is optional</p>
          </div>
          <div>
            <label className="label">Paste CSV data</label>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="input-field font-mono text-xs"
              rows={8}
              placeholder="firstName,lastName,email,password,studentIdNumber,yearLevel,phone&#10;Juan,Dela Cruz,juan@student.edu,,2024-00001,1,"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setImportOpen(false); setImportText(''); }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleImport} disabled={importLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {importLoading
                ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                : <HiUpload className="w-4 h-4" />}
              Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
