import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiUsers, HiAcademicCap, HiCalendar, HiClipboardList } from 'react-icons/hi';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, schedules: 0, announcements: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes, schedulesRes, announcementsRes] = await Promise.all([
          api.get('/users'),
          api.get('/courses'),
          api.get('/schedules'),
          api.get('/announcements'),
        ]);
        setStats({
          users: usersRes.data.length,
          courses: coursesRes.data.length,
          schedules: schedulesRes.data.length,
          announcements: announcementsRes.data.length,
        });
        setAnnouncements(announcementsRes.data.slice(0, 3));
        setRecentUsers(usersRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Overview of the campus management system" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats.users} icon={HiUsers} color="blue" />
        <StatCard title="Courses" value={stats.courses} icon={HiAcademicCap} color="green" />
        <StatCard title="Schedules" value={stats.schedules} icon={HiCalendar} color="purple" />
        <StatCard title="Announcements" value={stats.announcements} icon={HiClipboardList} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-semibold">{u.firstName[0]}{u.lastName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`badge-${u.role}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Announcements</h2>
          <div className="space-y-3">
            {announcements.length === 0 && <p className="text-slate-400 text-sm">No announcements yet.</p>}
            {announcements.map((a) => (
              <div key={a._id} className="p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{a.title}</p>
                  {a.isPinned && <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shrink-0">Pinned</span>}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{a.content}</p>
                <p className="text-xs text-slate-500 mt-2">By {a.author?.firstName} {a.author?.lastName}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
