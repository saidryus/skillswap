import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/api';

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/attendance/my-attendance'), api.get('/courses/my-courses')])
      .then(([attRes, courseRes]) => {
        setAttendance(attRes.data);
        setCourses(courseRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCourse
    ? attendance.filter((a) => a.course?._id === selectedCourse)
    : attendance;

  const present = filtered.filter((a) => a.status === 'present').length;
  const absent = filtered.filter((a) => a.status === 'absent').length;
  const late = filtered.filter((a) => a.status === 'late').length;
  const rate = filtered.length > 0 ? Math.round(((present + late) / filtered.length) * 100) : 0;

  const statusColors = {
    present: 'bg-green-500/20 text-green-300 border border-green-500/30',
    absent: 'bg-red-500/20 text-red-300 border border-red-500/30',
    late: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    excused: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Track your attendance records" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Present', value: present, color: 'text-green-400' },
          { label: 'Absent', value: absent, color: 'text-red-400' },
          { label: 'Late', value: late, color: 'text-yellow-400' },
          { label: 'Rate', value: `${rate}%`, color: 'text-blue-400' },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-slate-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input-field max-w-xs">
          <option value="">All Courses</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="table-header">Course</th>
                <th className="table-header">Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-slate-400">No attendance records found</td></tr>
              ) : filtered.map((a) => (
                <tr key={a._id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-slate-100">{a.course?.courseName}</p>
                    <p className="text-xs text-slate-400">{a.course?.courseCode}</p>
                  </td>
                  <td className="table-cell">{new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="table-cell">
                    <span className={`badge ${statusColors[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="table-cell text-slate-400">{a.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
