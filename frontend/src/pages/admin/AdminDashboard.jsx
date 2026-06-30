import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiUsers, HiAcademicCap, HiStar, HiCalendar, HiTrendingUp } from 'react-icons/hi';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, courses: 0, pendingApplications: 0, sessionsThisWeek: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useScrollReveal({ y: 30, delay: 0.2 });
  const cardsRef = useScrollReveal({ y: 20, children: true, stagger: 0.08 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes, applicationsRes, sessionsRes, statsRes] = await Promise.all([
          api.get('/users?role=student'),
          api.get('/courses'),
          api.get('/tutor-profiles?status=pending'),
          api.get('/sessions?status=scheduled'),
          api.get('/sessions/stats'),
        ]);

        const now = new Date();
        const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
        const thisWeek = sessionsRes.data.filter(s => {
          const d = new Date(s.date);
          return d >= now && d <= weekEnd;
        });

        setStats({
          students: usersRes.data.length,
          courses: coursesRes.data.length,
          pendingApplications: applicationsRes.data.length,
          sessionsThisWeek: thisWeek.length,
        });
        setRecentApplications(applicationsRes.data.slice(0, 4));
        setUpcomingSessions(thisWeek.slice(0, 4));
        setSessionStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-surface-400">Loading dashboard...</p>
      </div>
    </div>
  );

  const weeklyMax = sessionStats?.weeklyData
    ? Math.max(...sessionStats.weeklyData.map(w => Math.max(w.booked, w.completed)), 1)
    : 1;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="SkillSwap — IT Department Peer Tutoring Overview" />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" ref={cardsRef}>
        <StatCard title="Total Students" value={stats.students} icon={HiUsers} color="blue" />
        <StatCard title="Active Courses" value={stats.courses} icon={HiAcademicCap} color="green" />
        <StatCard title="Pending Applications" value={stats.pendingApplications} icon={HiStar} color="orange" />
        <StatCard title="Sessions This Week" value={stats.sessionsThisWeek} icon={HiCalendar} color="purple" />
      </div>

      {/* Session frequency analytics */}
      {sessionStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" ref={chartRef}>
          {/* Weekly trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <HiTrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Session Frequency
              </h2>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-primary-500 rounded-sm" /> Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-accent-500 rounded-sm" /> Completed
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-40">
              {sessionStats.weeklyData.map((week, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end" style={{ height: 130 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(week.booked / weeklyMax) * 100}%` }}
                      transition={{ delay: 0.3 + idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex-1 bg-primary-500/70 dark:bg-primary-400/60 rounded-t-md"
                      style={{ minHeight: week.booked > 0 ? 4 : 0 }}
                      title={`${week.booked} booked`}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(week.completed / weeklyMax) * 100}%` }}
                      transition={{ delay: 0.4 + idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex-1 bg-accent-500/70 dark:bg-accent-400/60 rounded-t-md"
                      style={{ minHeight: week.completed > 0 ? 4 : 0 }}
                      title={`${week.completed} completed`}
                    />
                  </div>
                  <p className="text-[10px] text-surface-400 text-center leading-tight mt-1">
                    {new Date(week.weekStart).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-surface-200 dark:border-surface-800 text-xs">
              <span className="text-surface-500">Total: <span className="text-surface-900 dark:text-white font-bold">{sessionStats.totals.total}</span></span>
              <span className="text-surface-500">Completed: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{sessionStats.totals.completed}</span></span>
              <span className="text-surface-500">Pending: <span className="text-amber-600 dark:text-amber-400 font-bold">{sessionStats.totals.pending}</span></span>
              <span className="text-surface-500">Cancelled: <span className="text-red-600 dark:text-red-400 font-bold">{sessionStats.totals.cancelled}</span></span>
            </div>
          </motion.div>

          {/* Top tutors + courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card"
          >
            <h2 className="text-sm font-bold text-surface-900 dark:text-white mb-3">Top Tutors</h2>
            {sessionStats.topTutors.length === 0 ? (
              <p className="text-xs text-surface-400">No completed sessions yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {sessionStats.topTutors.map((t, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-center justify-between p-2.5 
                               bg-surface-50 dark:bg-surface-800 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-surface-400 w-4">{idx + 1}</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 
                                      flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                          {t.user.firstName[0]}{t.user.lastName[0]}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-surface-700 dark:text-surface-200">
                        {t.user.firstName} {t.user.lastName}
                      </p>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      {t.completedCount}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="border-t border-surface-200 dark:border-surface-800 pt-3 mt-3">
              <h2 className="text-sm font-bold text-surface-900 dark:text-white mb-3">Top Courses</h2>
              {sessionStats.topCourses.length === 0 ? (
                <p className="text-xs text-surface-400">No sessions yet.</p>
              ) : (
                <div className="space-y-2">
                  {sessionStats.topCourses.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 
                                              bg-surface-50 dark:bg-surface-800 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-surface-400 w-4">{idx + 1}</span>
                        <p className="text-xs font-mono font-semibold text-surface-700 dark:text-surface-200">
                          {c.course.courseCode}
                        </p>
                      </div>
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-bold">
                        {c.sessionCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            Pending Tutor Applications
          </h2>
          {recentApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                <HiStar className="w-6 h-6 text-surface-400" />
              </div>
              <p className="text-sm text-surface-400">No pending applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((a, idx) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl 
                             bg-surface-50 dark:bg-surface-800 
                             border border-surface-200/50 dark:border-surface-700/50
                             hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 
                                  flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {a.tutor?.firstName?.[0]}{a.tutor?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">
                      {a.tutor?.firstName} {a.tutor?.lastName}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {a.course?.courseCode} — {a.course?.courseName}
                    </p>
                  </div>
                  <span className="badge-warning shrink-0">Pending</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            Upcoming Sessions
          </h2>
          {upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                <HiCalendar className="w-6 h-6 text-surface-400" />
              </div>
              <p className="text-sm text-surface-400">No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s, idx) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800 
                             border border-surface-200/50 dark:border-surface-700/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-surface-800 dark:text-surface-100 font-mono">
                      {s.course?.courseCode}
                    </p>
                    <span className={`badge ${s.venueType === 'online' ? 'badge-primary' : 'badge-success'}`}>
                      {s.venueType === 'online' ? 'Online' : 'On-campus'}
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5">
                    {new Date(s.date).toLocaleDateString()} · {s.startTime}–{s.endTime}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    Tutor: {s.tutor?.firstName} {s.tutor?.lastName}
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
