import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiShieldCheck, HiLockClosed } from 'react-icons/hi';
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

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '',
  role: 'student', department: '', studentId: '',
  isActive: true, permissions: [],
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.isSuperAdmin;

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = users;
    if (search) result = result.filter(u =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter) result = result.filter(u => u.role === roleFilter);
    setFiltered(result);
  }, [search, roleFilter, users]);

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ ...u, password: '', permissions: u.permissions || [] });
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
      // Only send permissions when creating/editing an admin
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
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <HiPlus className="w-4 h-4" /> Add User
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2"
            placeholder="Search users..."
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field w-36 py-2"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="faculty">Faculty</option>
          <option value="student">Student</option>
        </select>
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
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No users found</td></tr>
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
                  <td className="table-cell">{u.studentId || '—'}</td>
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
                      {/* Can't edit super admin unless you are super admin */}
                      {(!u.isSuperAdmin || isSuperAdmin) && (
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                      )}
                      {/* Can't delete super admin or other admins unless super admin */}
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
                {/* Only super admin can assign admin role */}
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

          {form.role === 'student' && (
            <div>
              <label className="label">Student ID</label>
              <input
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="input-field"
              />
            </div>
          )}

          {/* Permissions panel — only shown when creating/editing an admin and current user is super admin */}
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
