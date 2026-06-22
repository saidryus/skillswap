import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiStar, HiBookOpen, HiClock, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mySessions, setMySessions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const actionsRef = useScrollReveal({ y: 20, children: true, stagger: 0.1 });

  useEffect(() => {
    Promise.all([
      api.get('/sessions/my-sessions'),
      api.get('/tutor-profiles/my-applications'),
      api.get('/announcements'),
    ]).then(([sessRes, appRes, annRes]) => {
      setMySessions(sessRes.data);
      setMyApplications(appRes.data);
      setAnnouncements(annRes.data.slice(0, 3));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const upcoming = mySessions.filter(s => s.status === 'scheduled').sort((a, b) => new Date(a.date) - new Date(b.date));
  const completed = mySessions.filter(s => s.status === 'completed').length;
  const pendingApps = myApplications.filter(a => a.status === 'pending').length;
  const approvedCourses = myApplications.filter(a => a.status === 'approved').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-surface-400">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`Hello, ${user.firstName} 👋`}
        subtitle={`${user.studentIdNumber || 'IT Department'} · Year ${user.yearLevel || '—'}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Upcoming Sessions" value={upcoming.length} icon={HiCalendar} color="blue" />
        <StatCard title="Completed Sessions" value={completed} icon={HiBookOpen} color="green" />
        <StatCard title="Tutor Courses" value={approvedCourses} icon={HiStar} color="purple" />
        <StatCard title="Pending Apps" value={pendingApps} icon={HiClock} color="orange" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8" ref={actionsRef}>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playSound('click'); navigate('/student/find-tutor'); }}
          className="group relative overflow-hidden rounded-2xl p-5 text-left 
                     bg-gradient-to-br from-primary-50 to-primary-100/50 
                     dark:from-primary-950/50 dark:to-primary-900/30
                     border border-primary-200/50 dark:border-primary-800/50
                     hover:shadow-glow-sm transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 dark:bg-primary-400/10 
                            flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <HiStar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-surface-900 dark:text-white">Find a Tutor</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Browse verified peer tutors by course</p>
            </div>
            <HiArrowRight className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playSound('click'); navigate('/student/become-tutor'); }}
          className="group relative overflow-hidden rounded-2xl p-5 text-left 
                     bg-gradient-to-br from-purple-50 to-purple-100/50 
                     dark:from-purple-950/50 dark:to-purple-900/30
                     border border-purple-200/50 dark:border-purple-800/50
                     hover:shadow-glow-sm transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-400/10 
                            flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <HiBookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-surface-900 dark:text-white">Become a Tutor</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Apply to tutor courses you've mastered</p>
            </div>
            <HiArrowRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            Upcoming Sessions
          </h2>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                <HiCalendar className="w-6 h-6 text-surface-400" />
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400">No upcoming sessions</p>
              <button
                onClick={() => navigate('/student/book-session')}
                className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline mt-2"
              >
                Book one now →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((s, idx) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl 
                             bg-surface-50 dark:bg-surface-800
                             border border-surface-200/50 dark:border-surface-700/50"
                >
                  <div className="w-1.5 h-12 bg-primary-500 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">
                      {s.course?.courseCode} — {s.course?.courseName}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                      {new Date(s.date).toLocaleDateString()} · {s.startTime}–{s.endTime}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">{s.venue || 'Venue TBD'}</p>
                  </div>
                  <span className={`badge text-xs ${s.venueType === 'online' ? 'badge-primary' : 'badge-neutral'}`}>
                    {s.venueType}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            Announcements
          </h2>
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                <span className="text-2xl">📢</span>
              </div>
              <p className="text-sm text-surface-400">No announcements</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a, idx) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800
                             border border-surface-200/50 dark:border-surface-700/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">
                      {a.title}
                    </p>
                    {a.isPinned && <span className="badge-warning shrink-0 text-[10px]">Pinned</span>}
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5 line-clamp-2">
                    {a.content}
                  </p>
                  <p className="text-[10px] text-surface-400 mt-2 font-medium">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
