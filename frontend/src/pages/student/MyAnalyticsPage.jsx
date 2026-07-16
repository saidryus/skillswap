import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiCheckCircle, HiXCircle, HiCalendar,
  HiAcademicCap, HiUsers, HiLocationMarker, HiTrendingUp,
} from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import api from '../../utils/api';

/* ── helpers ── */
function formatTime12(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`;
}

/* ── Monthly bar chart ── */
function MonthlyChart({ data }) {
  const max = Math.max(...data.map(d => Math.max(d.booked, d.completed)), 1);
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <HiTrendingUp className="w-4 h-4 text-blue-500" /> Session Activity (6 months)
        </h3>
        <div className="flex items-center gap-4 text-xs text-surface-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500/70" /> Booked</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/70" /> Completed</span>
        </div>
      </div>
      <div className="flex items-end gap-2" style={{ height: 140 }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: 120 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.booked / max) * 100}%` }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16,1,0.3,1] }}
                className="flex-1 bg-blue-500/60 rounded-t-md"
                style={{ minHeight: d.booked > 0 ? 4 : 0 }}
                title={`${d.booked} booked`}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.completed / max) * 100}%` }}
                transition={{ delay: i * 0.06 + 0.05, duration: 0.5, ease: [0.16,1,0.3,1] }}
                className="flex-1 bg-emerald-500/60 rounded-t-md"
                style={{ minHeight: d.completed > 0 ? 4 : 0 }}
                title={`${d.completed} completed`}
              />
            </div>
            <p className="text-[10px] text-surface-400 text-center leading-tight">{d.month}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Attendance ring ── */
function AttendanceRing({ rate, completed, cancelled }) {
  const hasData = completed > 0 || cancelled > 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;
  const color = !hasData ? '#6b7280' : rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg width={96} height={96} className="absolute inset-0 -rotate-90">
          <circle cx={48} cy={48} r={r} fill="none" stroke="currentColor"
            className="text-surface-200 dark:text-surface-700" strokeWidth={8} />
          {hasData && (
            <motion.circle
              cx={48} cy={48} r={r} fill="none"
              stroke={color} strokeWidth={8}
              strokeDasharray={`${circ}`}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - dash }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="relative text-center">
          {hasData ? (
            <>
              <p className="text-xl font-bold leading-none" style={{ color }}>{rate}%</p>
              <p className="text-[10px] text-surface-400 mt-0.5">attendance</p>
            </>
          ) : (
            <p className="text-xs text-surface-400 text-center leading-tight">No<br/>data</p>
          )}
        </div>
      </div>
      <div className="flex gap-4 text-xs text-surface-500 dark:text-surface-400">
        <span className="flex items-center gap-1">
          <HiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />{completed} completed
        </span>
        <span className="flex items-center gap-1">
          <HiXCircle className="w-3.5 h-3.5 text-red-500" />{cancelled} cancelled
        </span>
      </div>
    </div>
  );
}

/* ── Course breakdown bar ── */
function CourseBar({ course, maxCompleted }) {
  const pct = maxCompleted > 0 ? (course.completed / maxCompleted) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-semibold text-surface-800 dark:text-surface-100">{course.courseCode}</span>
        <span className="text-surface-500 dark:text-surface-400">
          {course.completed}/{course.total} completed
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          className="h-full rounded-full bg-primary-500"
        />
      </div>
      <p className="text-[10px] text-surface-400 truncate">{course.courseName}</p>
    </div>
  );
}

/* ── Main page ── */
export default function MyAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions/my-stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-surface-400">Loading your analytics...</p>
      </div>
    </div>
  );

  if (!stats) return null;

  const { overview, courseBreakdown, monthlyData, recent } = stats;
  const maxCompleted = Math.max(...courseBreakdown.map(c => c.completed), 1);
  const totalVenue = overview.onlineSessions + overview.onCampusSessions;
  const onlinePct = totalVenue > 0 ? Math.round((overview.onlineSessions / totalVenue) * 100) : 0;

  return (
    <div>
      <PageHeader title="My Analytics" subtitle="A summary of your tutoring activity and progress" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Sessions" value={overview.total} icon={HiCalendar} color="blue" />
        <StatCard title="Completed" value={overview.completed} icon={HiCheckCircle} color="green" />
        <StatCard title="Tutors Worked With" value={overview.uniqueTutors} icon={HiUsers} color="purple" />
        <StatCard title="Courses Covered" value={courseBreakdown.length} icon={HiAcademicCap} color="orange" />
      </div>

      {/* Monthly chart + attendance + venue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <MonthlyChart data={monthlyData} />
        </div>

        <div className="space-y-4">
          {/* Attendance ring */}
          <div className="card flex flex-col items-center py-4">
            <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-3">Attendance Rate</h3>
            <AttendanceRing rate={overview.attendanceRate} completed={overview.completed} cancelled={overview.cancelled} />
          </div>

          {/* Venue split */}
          <div className="card">
            <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-1.5">
              <HiLocationMarker className="w-4 h-4 text-surface-400" /> Venue Preference
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-surface-600 dark:text-surface-300">🖥 Online</span>
                  <span className="text-surface-500 dark:text-surface-400">{overview.onlineSessions} ({onlinePct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${onlinePct}%` }}
                    transition={{ duration: 0.6 }} className="h-full rounded-full bg-primary-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-surface-600 dark:text-surface-300">🏫 On-campus</span>
                  <span className="text-surface-500 dark:text-surface-400">{overview.onCampusSessions} ({100 - onlinePct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${100 - onlinePct}%` }}
                    transition={{ duration: 0.6 }} className="h-full rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session status summary */}
      <div className="card mb-6">
        <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-4">Session Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Completed', value: overview.completed, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Scheduled', value: overview.scheduled, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Pending', value: overview.pending, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Cancelled', value: overview.cancelled, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'Rejected', value: overview.rejected, color: 'text-surface-400', bg: 'bg-surface-500/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl p-3 ${bg} text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Course breakdown */}
      {courseBreakdown.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-4">
            Sessions by Course
          </h3>
          <div className="space-y-4">
            {courseBreakdown.map(course => (
              <CourseBar key={course.courseId} course={course} maxCompleted={maxCompleted} />
            ))}
          </div>
        </div>
      )}

      {/* Recent completed sessions */}
      <div className="card">
        <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 mb-4 flex items-center gap-1.5">
          <HiCheckCircle className="w-4 h-4 text-emerald-500" /> Recent Completed Sessions
        </h3>
        {recent.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">No completed sessions yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recent.map(s => (
              <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                <div className="w-1.5 h-10 bg-emerald-500 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">
                    {s.course?.courseCode} — {s.course?.courseName}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {new Date(s.date).toLocaleDateString()} · {formatTime12(s.startTime)}–{formatTime12(s.endTime)}
                  </p>
                  <p className="text-xs text-surface-400">
                    Tutor: {s.tutor?.firstName} {s.tutor?.lastName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
