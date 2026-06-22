import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiCheck, HiX, HiStar } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
  pending:    'badge-warning',
  scheduled:  'badge-primary',
  completed:  'badge-success',
  cancelled:  'badge-danger',
  rejected:   'badge-neutral',
};

export default function MySessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [rateModal, setRateModal] = useState(null);
  const [rateScore, setRateScore] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [ratedSessions, setRatedSessions] = useState(new Set());

  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/sessions/my-sessions');
      setSessions(data);
    } catch { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleComplete = async (id) => {
    try {
      await api.put(`/sessions/${id}/complete`);
      playSound('success');
      toast.success('Session marked as completed');
      fetchSessions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this session?')) return;
    try {
      await api.put(`/sessions/${id}/cancel`);
      toast.success('Session cancelled');
      fetchSessions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/sessions/${id}/accept`);
      playSound('success');
      toast.success('Session accepted! It is now scheduled.');
      fetchSessions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for declining (optional):') || '';
    try {
      await api.put(`/sessions/${id}/reject`, { reason });
      toast.success('Session declined');
      fetchSessions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRate = async () => {
    if (!rateModal || rateScore < 1) { toast.error('Select a rating (1-5 stars)'); return; }
    try {
      await api.post('/ratings', { sessionId: rateModal._id, score: rateScore, comment: rateComment });
      playSound('success');
      toast.success('Rating submitted!');
      setRatedSessions(prev => new Set([...prev, rateModal._id]));
      setRateModal(null);
      setRateScore(0);
      setRateComment('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit rating'); }
  };

  const filtered = sessions.filter(s => s.status === tab);
  const counts = {
    pending: sessions.filter(s => s.status === 'pending').length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
  };

  return (
    <div>
      <PageHeader title="My Sessions" subtitle="Your tutoring sessions as tutor or tutee" />

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-6 w-fit rounded-xl 
                      bg-surface-100 dark:bg-surface-800 
                      border border-surface-200 dark:border-surface-700">
        {[
          { key: 'pending', label: 'Pending' },
          { key: 'scheduled', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { playSound('click'); setTab(t.key); }}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                tab === t.key
                  ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                  : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
              }`}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
            <HiCalendar className="w-7 h-7 text-surface-400" />
          </div>
          <p className="text-sm text-surface-400">No {tab} sessions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, idx) => {
            const isTutor = s.tutor?._id === user._id || s.tutor === user._id;
            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="card p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400">
                        {s.course?.courseCode}
                      </span>
                      <span className="text-sm text-surface-500 dark:text-surface-400">
                        {s.course?.courseName}
                      </span>
                      <span className={STATUS_STYLES[s.status]}>{s.status}</span>
                      {isTutor && (
                        <span className="badge bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px]">
                          You're the tutor
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 dark:text-surface-400 mt-1">
                      <span className="flex items-center gap-1">
                        <HiCalendar className="w-3.5 h-3.5" />
                        {new Date(s.date).toLocaleDateString()} · {s.startTime}–{s.endTime}
                      </span>
                      <span>{s.venue || 'No venue set'}</span>
                      <span className={s.venueType === 'online' ? 'text-primary-500' : ''}>
                        {s.venueType}
                      </span>
                    </div>
                    {isTutor ? (
                      <p className="text-xs text-surface-400 mt-1.5">
                        Tutees: {s.tutees?.map(t => `${t.firstName} ${t.lastName}`).join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-surface-400 mt-1.5">
                        Tutor: {s.tutor?.firstName} {s.tutor?.lastName}
                      </p>
                    )}
                    {s.notes && (
                      <p className="text-xs text-surface-400 mt-1 italic bg-surface-50 dark:bg-surface-800 rounded-lg px-3 py-1.5 inline-block">
                        "{s.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {s.status === 'pending' && isTutor && (
                      <>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAccept(s._id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl 
                                     bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 
                                     border border-emerald-200 dark:border-emerald-800/50
                                     hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-xs font-medium transition-colors">
                          <HiCheck className="w-3.5 h-3.5" /> Accept
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleReject(s._id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl 
                                     bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 
                                     border border-red-200 dark:border-red-800/50
                                     hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-medium transition-colors">
                          <HiX className="w-3.5 h-3.5" /> Decline
                        </motion.button>
                      </>
                    )}

                    {s.status === 'pending' && !isTutor && (
                      <>
                        <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 
                                         border border-amber-200 dark:border-amber-800/50 px-3 py-2 rounded-xl font-medium">
                          Awaiting tutor
                        </span>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCancel(s._id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl 
                                     bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 
                                     border border-red-200 dark:border-red-800/50
                                     hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-medium transition-colors">
                          <HiX className="w-3.5 h-3.5" /> Cancel
                        </motion.button>
                      </>
                    )}

                    {s.status === 'scheduled' && (
                      <>
                        {isTutor && (
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleComplete(s._id)}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl 
                                       bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 
                                       border border-emerald-200 dark:border-emerald-800/50
                                       hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-xs font-medium transition-colors">
                            <HiCheck className="w-3.5 h-3.5" /> Complete
                          </motion.button>
                        )}
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCancel(s._id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl 
                                     bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 
                                     border border-red-200 dark:border-red-800/50
                                     hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-medium transition-colors">
                          <HiX className="w-3.5 h-3.5" /> Cancel
                        </motion.button>
                      </>
                    )}

                    {s.status === 'completed' && !isTutor && !ratedSessions.has(s._id) && (
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => { setRateModal(s); setRateScore(0); setRateComment(''); }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl 
                                   bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 
                                   border border-amber-200 dark:border-amber-800/50
                                   hover:bg-amber-100 dark:hover:bg-amber-950/50 text-xs font-medium transition-colors">
                        <HiStar className="w-3.5 h-3.5" /> Rate Tutor
                      </motion.button>
                    )}

                    {s.status === 'completed' && !isTutor && ratedSessions.has(s._id) && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <HiCheck className="w-3.5 h-3.5" /> Rated
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rating modal */}
      <Modal isOpen={!!rateModal} onClose={() => setRateModal(null)} title="Rate Your Tutor">
        {rateModal && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <p className="text-sm font-bold text-surface-800 dark:text-surface-100">
                {rateModal.course?.courseCode} — {rateModal.course?.courseName}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Tutor: {rateModal.tutor?.firstName} {rateModal.tutor?.lastName}
              </p>
              <p className="text-xs text-surface-400 mt-0.5">
                {new Date(rateModal.date).toLocaleDateString()} · {rateModal.startTime}–{rateModal.endTime}
              </p>
            </div>

            <div>
              <label className="label">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setRateScore(star); playSound('pop'); }}
                    className="p-1 transition-all"
                  >
                    <HiStar className={`w-8 h-8 transition-colors duration-200 ${
                      star <= rateScore ? 'text-amber-400' : 'text-surface-300 dark:text-surface-600'
                    }`} />
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-surface-500 mt-1.5 font-medium">
                {rateScore === 0 ? 'Click a star to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rateScore]}
              </p>
            </div>

            <div>
              <label className="label">Comment (optional)</label>
              <textarea
                value={rateComment}
                onChange={e => setRateComment(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="How was the session? Any feedback for the tutor?"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setRateModal(null)} className="btn-secondary flex-1">Cancel</button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleRate}
                disabled={rateScore < 1}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <HiStar className="w-4 h-4" /> Submit Rating
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
