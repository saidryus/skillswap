import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiShieldCheck, HiLockClosed, HiCog } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ALL_PERMISSIONS = [
  { key: 'users',         label: 'User Management' },
  { key: 'courses',       label: 'Courses' },
  { key: 'schedules',     label: 'Schedules' },
  { key: 'lab-schedules', label: 'Lab Schedules' },
  { key: 'attendance',    label: 'Attendance' },
  { key: 'announcements', label: 'Announcements' },
];

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '',
  role: 'student', department: '', yearLevel: '', phone: '',
  isActive: true, permissions: [],
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.isSuperAdmin;

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Settings state
  const [prefix, setPrefix] = useState('UC');
  const [prefixInput, setPrefixInput] = useState('UC');

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setPrefix(data.studentIdPrefix);
      setPrefixInput(data.studentIdPrefix);
    } catch {}
  };

  useEffect(() => { fetchUsers(); fetchSettings(); }, []);

  useEffect(() => {
    let result = users;
    if (search) result = result.filter(u =>
      `${u.firstName} ${u.lastName} ${u.email} ${u.studentId || ''}`.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter === 'subadmin') result = result.filter(u => u.role === 'admin' && !u.isSuperAdmin);
    else if (roleFilter === 'superadmin') result = result.filter(u => u.isSuperAdmin);
    else if (roleFilter) result = result.filter(u => u.role === roleFilter);
    setFiltered(result);
  }, [search, roleFilter, users]);

  // Counts for category tabs
  const counts = {
    all:        users.length,
    student:    users.filter(u => u.role === 'student').length,
    faculty:    users.filter(u => u.role === 'faculty').length,
    subadmin:   users.filter(u => u.role === 'admin' && !u.isSuperAdmin).length,
    superadmin: users.filter(u => u.isSuperAdmin).length,
  };

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ ...u, password: '', yearLevel: u.yearLevel ?? '', phone: u.phone ?? '', permissions: u.permissions || [] });
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
      const payload = { ...form };
      if (form.role !== 'admin') delete payload.permissions;

      if (editUser) {
        await api.put(`/users/${editUser._id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', payload);
        toast.success('User created');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSavePrefix = async () => {
    try {
      await api.put('/settings', { studentIdPrefix: prefixInput });
      setPrefix(prefixInput.toUpperCase());
      toast.success('Prefix updated');
      setSettingsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update prefix');
    }
  };

  const getRoleBadge = (u) => {
    if (u.role === 'admin') {
      if (u.isSuperAdmin) return (
        <span className="inline-flex items-center gap-1 badge bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          <HiShieldCheck className="w-3 h-3" /> Super Admin
        </span>
      );
      return (
        <span className="inline-flex items-center gap-1 badge bg-blue-500/20 text-blue-300 border-blue-500/30">
          <HiLockClosed className="w-3 h-3" /> Sub-Admin
        </span>
      );
    }
    return <span className={`badge-${u.role}`}>{u.role}</span>;
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage all campus users"
        action={
          <div className="flex gap-2">
            {isSuperAdmin && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="btn-secondary flex items-center gap-2"
                title="Student ID Settings"
              >
                <HiCog className="w-4 h-4" />
                <span className="text-xs font-mono text-slate-300">{prefix}-####</span>
              </button>
            )}
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <HiPlus className="w-4 h-4" /> Add User
            </button>
          </div>
        }
      />

      {/* Category tabs + search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Role tabs */}
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
          {[
            { key: '',           label: 'All',        count: counts.all },
            { key: 'student',    label: 'Students',   count: counts.student },
            { key: 'faculty',    label: 'Faculty',    count: counts.faculty },
            { key: 'subadmin',   label: 'Sub-Admin',  count: counts.subadmin },
            ...(isSuperAdmin ? [{ key: 'superadmin', label: 'Super Admin', count: counts.superadmin }] : []),
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${roleFilter === tab.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${roleFilter === tab.key ? 'bg-blue-500/50 text-blue-100' : 'bg-slate-700 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2"
            placeholder="Search users..."
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Department</th>
                <th className="table-header">Student ID</th>
                <th className="table-header">Year</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-slate-400">No users found</td></tr>
              ) : filtered.map((u) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        ${u.isSuperAdmin
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                          : u.role === 'admin'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}
                      >
                        <span className="text-white text-xs font-semibold">
                          {u.firstName[0]}{u.lastName[0]}
                        </span>
                      </div>
                      <span className="font-medium text-slate-100">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="table-cell">{u.email}</td>
                  <td className="table-cell">{getRoleBadge(u)}</td>
                  <td className="table-cell">{u.department || '—'}</td>
                  <td className="table-cell font-mono text-xs">{u.studentId || '—'}</td>
                  <td className="table-cell">
                    {u.yearLevel ? (
                      <span className="badge bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                        {YEAR_LABELS[u.yearLevel]}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="table-cell text-xs">{u.phone || '—'}</td>
                  <td className="table-cell">
                    <span className={`badge ${u.isActive
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'}`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {(!u.isSuperAdmin || isSuperAdmin) && (
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                      )}
                      {!u.isSuperAdmin && (isSuperAdmin || u.role !== 'admin') && (
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
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

      {/* Student ID Prefix Settings Modal */}
      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="Student ID Settings">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Set the prefix used when auto-generating student IDs. The system will append a zero-padded counter.
          </p>
          <div className="bg-slate-700/40 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Preview</p>
            <p className="text-2xl font-mono font-bold text-blue-400">
              {(prefixInput || 'UC').toUpperCase()}-0001
            </p>
          </div>
          <div>
            <label className="label">Prefix</label>
            <input
              value={prefixInput}
              onChange={e => setPrefixInput(e.target.value.toUpperCase())}
              className="input-field font-mono uppercase"
              placeholder="UC"
              maxLength={6}
            />
            <p className="text-xs text-slate-500 mt-1">Max 6 characters. Existing student IDs are not affected.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setSettingsOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSavePrefix} className="btn-primary flex-1">Save</button>
          </div>
        </div>
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="input-field" required
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="input-field" required
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field" required
            />
          </div>

          <div>
            <label className="label">
              {editUser ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              required={!editUser}
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value, permissions: [] })}
                className="input-field"
                disabled={editUser?.isSuperAdmin}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                {isSuperAdmin && <option value="admin">Admin (Sub-Admin)</option>}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Student-only fields */}
          {form.role === 'student' && (
            <>
              {/* Auto-generated ID notice */}
              {!editUser && (
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                  <span className="text-xs text-blue-400">
                    Student ID will be auto-generated as <span className="font-mono font-semibold">{prefix}-####</span>
                  </span>
                </div>
              )}
              {editUser && (
                <div>
                  <label className="label">Student ID</label>
                  <input
                    value={form.studentId || ''}
                    readOnly
                    className="input-field opacity-60 cursor-not-allowed font-mono"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Year Level</label>
                  <select
                    value={form.yearLevel}
                    onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
              </div>
            </>
          )}

          {/* Faculty phone */}
          {form.role === 'faculty' && (
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+63 9XX XXX XXXX"
              />
            </div>
          )}

          {/* Permissions panel */}
          {form.role === 'admin' && isSuperAdmin && !editUser?.isSuperAdmin && (
            <div className="bg-slate-700/40 border border-slate-600/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <HiShieldCheck className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-semibold text-slate-200">Sub-Admin Permissions</p>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Select which sections this sub-admin can access. Unselected sections will be hidden from their sidebar.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(({ key, label }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
                      ${form.permissions.includes(key)
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(key)}
                      onChange={() => togglePermission(key)}
                      className="w-3.5 h-3.5 accent-blue-500"
                    />
                    <span className="text-xs font-medium">{label}</span>
                  </label>
                ))}
              </div>
              {form.permissions.length === 0 && (
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠ No permissions selected — this sub-admin will only see the dashboard.
                </p>
              )}
            </div>
          )}

          {editUser && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-slate-300">Active Account</label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
