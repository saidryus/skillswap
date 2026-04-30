import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSpeakerphone } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
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

  const openCreate = () => { setEditAnn(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (a) => { setEditAnn(a); setForm({ title: a.title, content: a.content, targetRoles: a.targetRoles, isPinned: a.isPinned }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editAnn) {
        await api.put(`/announcements/${editAnn._id}`, form);
        toast.success('Announcement updated');
      } else {
        await api.post('/announcements', form);
        toast.success('Announcement posted');
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
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
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <HiPlus className="w-4 h-4" /> Post Announcement
            </button>
          )
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : announcements.length === 0 ? (
        <div className="card text-center py-16">
          <HiSpeakerphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card hover:border-slate-600 transition-colors ${a.isPinned ? 'border-yellow-500/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {a.isPinned && <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">📌 Pinned</span>}
                    <div className="flex gap-1">
                      {a.targetRoles.map((r) => (
                        <span key={r} className={`badge-${r}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mb-2">{a.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{a.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span>By {a.author?.firstName} {a.author?.lastName}</span>
                    <span>•</span>
                    <span>{new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                {canManage && (user?.role === 'admin' || a.author?._id === user?._id) && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(a._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <HiTrash className="w-4 h-4" />
                    </button>
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
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.targetRoles.includes(role)} onChange={() => toggleRole(role)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-300 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPinned" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="w-4 h-4 rounded" />
            <label htmlFor="isPinned" className="text-sm text-slate-300">Pin this announcement</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editAnn ? 'Update' : 'Post'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
