import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSpeakerphone } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { title: '', content: '', targetRoles: ['admin', 'faculty', 'student'], isPinned: false };

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAnn, setEditAnn] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const canManage = user?.role === 'admin' || user?.role === 'faculty';

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const openCreate = () => { setEditAnn(null); setForm(emptyForm); setModalOpen(true); playSound('pop'); };
  const openEdit = (a) => { setEditAnn(a); setForm({ title: a.title, content: a.content, targetRoles: a.targetRoles, isPinned: a.isPinned }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playSound('click');
    try {
      if (editAnn) {
        await api.put(`/announcements/${editAnn._id}`, form);
        toast.success('Announcement updated');
      } else {
        await api.post('/announcements', form);
        toast.success('Announcement posted');
      }
      playSound('success');
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      playSound('error');
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleRole = (role) => {
    const roles = form.targetRoles.includes(role)
      ? form.targetRoles.filter((r) => r !== role)
      : [...form.targetRoles, role];
    setForm({ ...form, targetRoles: roles });
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Campus-wide announcements and notices"
        action={
          canManage && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={openCreate}
              className="btn-primary flex items-center gap-2"
            >
              <HiPlus className="w-4 h-4" /> Post Announcement
            </motion.button>
          )
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
            <HiSpeakerphone className="w-7 h-7 text-surface-400" />
          </div>
          <p className="text-surface-500 dark:text-surface-400">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`card hover:shadow-md transition-all ${
                a.isPinned ? 'border-amber-300 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-950/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {a.isPinned && <span className="badge-warning">📌 Pinned</span>}
                    <div className="flex gap-1">
                      {a.targetRoles.map((r) => (
                        <span key={r} className={`badge text-[10px] ${
                          r === 'admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                          : r === 'faculty' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        }`}>{r}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-surface-900 dark:text-white mb-2">{a.title}</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">{a.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-surface-400">
                    <span>By {a.author?.firstName} {a.author?.lastName}</span>
                    <span>•</span>
                    <span>{new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                {canManage && (user?.role === 'admin' || a.author?._id === user?._id) && (
                  <div className="flex gap-1 shrink-0">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => openEdit(a)}
                      className="p-2 rounded-xl text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
                      <HiPencil className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleDelete(a._id)}
                      className="p-2 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <HiTrash className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editAnn ? 'Edit Announcement' : 'Post Announcement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field" rows={4} required />
          </div>
          <div>
            <label className="label">Visible To</label>
            <div className="flex gap-3">
              {['admin', 'faculty', 'student'].map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                  <input type="checkbox" checked={form.targetRoles.includes(role)} onChange={() => toggleRole(role)}
                    className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-500 focus:ring-primary-500" />
                  <span className="text-sm text-surface-700 dark:text-surface-300 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            <input type="checkbox" id="isPinned" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-500 focus:ring-primary-500" />
            <label htmlFor="isPinned" className="text-sm text-surface-700 dark:text-surface-300 font-medium">Pin this announcement</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primary flex-1">
              {editAnn ? 'Update' : 'Post'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
