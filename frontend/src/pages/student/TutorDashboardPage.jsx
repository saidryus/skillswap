import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiCalendar, HiCheckCircle, HiXCircle, HiClock, HiAcademicCap } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

/* ── Star rating display ── */
function StarDisplay({ score, size = 'md' }) {
  const stars = [];
  const rounded = Math.round(score * 2) / 2; // round to nearest 0.5
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rounded)) {
      stars.push(<HiStar key={i} className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} text-amber-400`} />);
    } else if (i - 0.5 === rounded) {
      stars.push(<HiStar key={i} className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} text-amber-200`} />);
    } else {
      stars.push(<HiStar key={i} className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} text-surface-200 dark:text-surface-700`} />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

/* ── Rating distribution bar ── */
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-surface-500 dark:text-surface-400 w-4 text-right">{star}</span>
      <HiStar className="w-3.5 h-3.5 text-amber-400" />
      <div className="flex-1 h-2.5 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: (5 - star) * 0.1 }}
          className="h-full rounded-full bg-amber-400"
        />
      </div>
      <span className="text-xs text-surface-400 w-6 text-right">{count}</span>
    </div>
  );
}

export default function TutorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ratings/my-tutor-stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-surface-400">Loading tutor stats...</p>
      </div>
    </div>
  );

  if (!stats || !stats.isApprovedTutor) return (
    <div>
      <PageHeader title="Tutor Dashboard" subtitle="Your tutoring statistics and performance" />
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
          <HiAcademicCap className="w-8 h-8 text-surface-400" />
        </div>
        <p className="text-surface-600 dark:text-surface-300 font-medium">You're not an approved tutor yet</p>
        <p className="text-sm text-surface-400 mt-1">Apply to tutor a course to see your dashboard here</p>
      </div>
    </div>
  );

  const { overview, distribution, courseStats, recentRatings } = stats;

  return (
    <div>
      <PageHeader title="Tutor Dashboard" subtitle="Your tutoring performance and ratings" />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Average Rating" value={`${overview.avgScore}/5`} icon={HiStar} color="amber" />
        <StatCard title="Completed Sessions" value={overview.completedSessions} icon={HiCheckCircle} color="green" />
        <StatCard title="Completion Rate" value={`${overview.completionRate}%`} icon={HiCalendar} color="blue" />
        <StatCard title="Available This Week" value={`${overview.availableSlots}/${overview.maxSessionsPerWeek}`} icon={HiClock} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Rating Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card lg:col-span-1"
        >
          <h3 className="text-base font-bold text-surface-900 dark:text-white mb-4">Rating Overview</h3>
          
          {/* Big average */}
          <div className="flex flex-col items-center mb-6">
            <p className="text-4xl font-bold text-surface-900 dark:text-white">{overview.avgScore}</p>
            <StarDisplay score={overview.avgScore} size="lg" />
            <p className="text-sm text-surface-400 mt-1">{overview.totalRatings} total rating{overview.totalRatings !== 1 ? 's' : ''}</p>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => (
              <RatingBar key={star} star={star} count={distribution[star] || 0} total={overview.totalRatings} />
            ))}
          </div>
        </motion.div>

        {/* Per-Course Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card lg:col-span-2"
        >
          <h3 className="text-base font-bold text-surface-900 dark:text-white mb-4">Course Performance</h3>
          
          {courseStats.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-8">No course data yet</p>
          ) : (
            <div className="space-y-3">
              {courseStats.map((cs, idx) => (
                <motion.div
                  key={cs.courseId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/50 dark:border-surface-700/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 font-mono">{cs.courseCode}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">{cs.courseName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
                        <HiStar className="w-3.5 h-3.5 text-amber-400" />
                        {cs.avgRating > 0 ? `${cs.avgRating}/5` : 'No ratings'}
                        {cs.totalRatings > 0 && <span className="text-surface-400">({cs.totalRatings})</span>}
                      </span>
                      <span className="text-xs text-surface-400">·</span>
                      <span className="text-xs text-surface-500 dark:text-surface-400">
                        {cs.completedSessions} session{cs.completedSessions !== 1 ? 's' : ''}
                      </span>
                      {cs.grade && (
                        <>
                          <span className="text-xs text-surface-400">·</span>
                          <span className="text-xs text-surface-500 dark:text-surface-400">
                            Grade: {cs.grade.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <StarDisplay score={cs.avgRating} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Session Summary + Recent Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-base font-bold text-surface-900 dark:text-white mb-4">Session Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <span className="text-sm text-surface-600 dark:text-surface-300 flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4 text-emerald-500" /> Completed
              </span>
              <span className="text-sm font-bold text-surface-900 dark:text-white">{overview.completedSessions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <span className="text-sm text-surface-600 dark:text-surface-300 flex items-center gap-2">
                <HiCalendar className="w-4 h-4 text-blue-500" /> Scheduled
              </span>
              <span className="text-sm font-bold text-surface-900 dark:text-white">{overview.scheduledSessions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <span className="text-sm text-surface-600 dark:text-surface-300 flex items-center gap-2">
                <HiClock className="w-4 h-4 text-amber-500" /> Pending
              </span>
              <span className="text-sm font-bold text-surface-900 dark:text-white">{overview.pendingSessions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <span className="text-sm text-surface-600 dark:text-surface-300 flex items-center gap-2">
                <HiXCircle className="w-4 h-4 text-red-500" /> Cancelled
              </span>
              <span className="text-sm font-bold text-surface-900 dark:text-white">{overview.cancelledSessions}</span>
            </div>
            <div className="pt-2 border-t border-surface-200 dark:border-surface-700">
              <div className="flex items-center justify-between p-3">
                <span className="text-sm font-medium text-surface-700 dark:text-surface-200">Completion Rate</span>
                <span className={`text-sm font-bold ${overview.completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {overview.completionRate}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-base font-bold text-surface-900 dark:text-white mb-4">Recent Feedback</h3>
          {recentRatings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                <HiStar className="w-6 h-6 text-surface-400" />
              </div>
              <p className="text-sm text-surface-400">No ratings yet</p>
              <p className="text-xs text-surface-400 mt-1">Complete sessions to receive feedback</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentRatings.map((r, idx) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200/50 dark:border-surface-700/50"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <StarDisplay score={r.score} />
                    <span className="text-[10px] text-surface-400 font-medium">{r.course}</span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-surface-600 dark:text-surface-300 mt-1">"{r.comment}"</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-surface-400">— {r.ratedBy}</p>
                    <p className="text-[10px] text-surface-400">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
