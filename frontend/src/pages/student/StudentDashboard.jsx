import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiCalendar, HiClipboardList, HiPrinter } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, schedulesRes, attendanceRes, annRes] = await Promise.all([
          api.get('/courses/my-courses'),
          api.get('/schedules/my-schedule'),
          api.get('/attendance/my-attendance'),
          api.get('/announcements'),
        ]);
        setCourses(coursesRes.data);
        setSchedules(schedulesRes.data);
        setAttendance(attendanceRes.data);
        setAnnouncements(annRes.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedules = schedules.filter((s) => s.day === today);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  return (
    <div>
      <PageHeader title={`Hello, ${user.firstName}!`} subtitle={`Student ID: ${user.studentId || 'N/A'} • ${user.department || 'N/A'}`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Enrolled Courses" value={courses.length} icon={HiAcademicCap} color="blue" />
        <StatCard title="Total Schedules" value={schedules.length} icon={HiCalendar} color="purple" />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={HiClipboardList} color="green" subtitle={`${presentCount} of ${attendance.length} classes`} />
      </div>

      {/* Print Study Load Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => navigate('/print/study-load')}
        className="w-full mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl flex items-center justify-between hover:border-blue-500/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
            <HiPrinter className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-100">Print Study Load</p>
            <p className="text-xs text-slate-400">View and print your official study load</p>
          </div>
        </div>
        <span className="text-blue-400 text-sm">View →</span>
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Today's Classes ({today})</h2>
          {todaySchedules.length === 0 ? (
            <p className="text-slate-400 text-sm">No classes today.</p>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((s) => (
                <div key={s._id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <div className="w-2 h-10 bg-blue-500 rounded-full shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-100">{s.course?.courseName}</p>
                    <p className="text-xs text-slate-400">{s.startTime} – {s.endTime} • {s.room || 'TBA'}</p>
                  </div>
                  <p className="text-xs text-slate-400">{s.course?.faculty ? `${s.course.faculty.firstName} ${s.course.faculty.lastName}` : 'TBA'}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-slate-400 text-sm">No announcements.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a._id} className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-sm font-medium text-slate-100">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
