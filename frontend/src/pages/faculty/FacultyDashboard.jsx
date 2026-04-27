import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiUsers, HiCalendar, HiBell } from 'react-icons/hi';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, schedulesRes, annRes] = await Promise.all([
          api.get('/courses'),
          api.get('/schedules'),
          api.get('/announcements'),
        ]);
        const myCourses = coursesRes.data.filter((c) => c.faculty?._id === user._id);
        const myCourseIds = myCourses.map((c) => c._id);
        const mySchedules = schedulesRes.data.filter((s) => myCourseIds.includes(s.course?._id));
        setCourses(myCourses);
        setSchedules(mySchedules);
        setAnnouncements(annRes.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user._id]);

  const totalStudents = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  return (
    <div>
      <PageHeader title={`Welcome, ${user.firstName}`} subtitle="Faculty Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="My Courses" value={courses.length} icon={HiAcademicCap} color="blue" />
        <StatCard title="Total Students" value={totalStudents} icon={HiUsers} color="green" />
        <StatCard title="Schedules" value={schedules.length} icon={HiCalendar} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">My Courses</h2>
          {courses.length === 0 ? (
            <p className="text-slate-400 text-sm">No courses assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{c.courseName}</p>
                    <p className="text-xs text-slate-400">{c.courseCode} • {c.units} units</p>
                  </div>
                  <span className="text-xs text-slate-400">{c.students?.length || 0} students</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Today's Schedule */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">My Schedules</h2>
          {schedules.length === 0 ? (
            <p className="text-slate-400 text-sm">No schedules found.</p>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{s.course?.courseName}</p>
                    <p className="text-xs text-slate-400">{s.day} • {s.startTime} – {s.endTime}</p>
                  </div>
                  <span className="text-xs text-slate-400">{s.room || 'TBA'}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
