import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDownload, HiX } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Export modal state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportCourse, setExportCourse] = useState('');
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data));
  }, []);

  const loadStudents = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const course = courses.find((c) => c._id === selectedCourse);
      const students = course?.students || [];
      setRecords(students);

      // Load existing attendance
      const { data } = await api.get(`/attendance/course/${selectedCourse}?date=${date}`);
      const map = {};
      data.forEach((a) => { map[a.student._id] = a.status; });
      const init = {};
      students.forEach((s) => { init[s._id] = map[s._id] || 'present'; });
      setAttendance(init);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, [selectedCourse, date]);

  const handleSubmit = async () => {
    if (!selectedCourse || records.length === 0) return;
    setSubmitting(true);
    try {
      const attendanceRecords = records.map((s) => ({
        studentId: s._id,
        status: attendance[s._id] || 'absent',
      }));
      await api.post('/attendance/mark', { courseId: selectedCourse, date, records: attendanceRecords });
      toast.success('Attendance saved successfully');
    } catch (err) {
      toast.error('Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!exportCourse) { toast.error('Please select a course'); return; }
    setExporting(true);
    try {
      const params = new URLSearchParams({ courseId: exportCourse });
      if (exportFrom) params.append('dateFrom', exportFrom);
      if (exportTo) params.append('dateTo', exportTo);

      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/attendance/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || 'Export failed');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const course = courses.find(c => c._id === exportCourse);
      a.href = url;
      a.download = `Attendance_${course?.courseCode || 'export'}_${exportFrom || 'all'}_to_${exportTo || 'all'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported successfully');
      setExportOpen(false);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const statusColors = {
    present: 'bg-green-500/20 text-green-300 border-green-500/30',
    absent: 'bg-red-500/20 text-red-300 border-red-500/30',
    late: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    excused: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  return (
    <div>
      <PageHeader
        title="Attendance Management"
        subtitle="Mark and view student attendance"
        action={
          <button onClick={() => { setExportCourse(selectedCourse || ''); setExportOpen(true); }} className="btn-secondary flex items-center gap-2">
            <HiDownload className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Select Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input-field">
              <option value="">Choose a course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end">
            {records.length > 0 && (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Saving...' : 'Save Attendance'}
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : records.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">Students ({records.length})</h3>
            <div className="flex gap-2">
              <button onClick={() => { const a = {}; records.forEach((s) => { a[s._id] = 'present'; }); setAttendance(a); }} className="text-xs px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors">All Present</button>
              <button onClick={() => { const a = {}; records.forEach((s) => { a[s._id] = 'absent'; }); setAttendance(a); }} className="text-xs px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors">All Absent</button>
            </div>
          </div>
          <div className="divide-y divide-slate-700/50">
            {records.map((student) => (
              <div key={student._id} className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-semibold">{student.firstName[0]}{student.lastName[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-slate-400">{student.studentId || student.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['present', 'absent', 'late', 'excused'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setAttendance({ ...attendance, [student._id]: status })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${attendance[student._id] === status ? statusColors[status] : 'bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : selectedCourse ? (
        <div className="card text-center py-12 text-slate-400">No students enrolled in this course</div>
      ) : (
        <div className="card text-center py-12 text-slate-400">Select a course to manage attendance</div>
      )}

      {/* Export Modal */}
      <Modal isOpen={exportOpen} onClose={() => setExportOpen(false)} title="Export Attendance">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Select a course and optional date range. Leave dates blank to export all records.
          </p>
          <div>
            <label className="label">Course</label>
            <select value={exportCourse} onChange={e => setExportCourse(e.target.value)} className="input-field">
              <option value="">Select a course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From</label>
              <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} className="input-field" />
            </div>
          </div>
          {exportFrom && exportTo && exportFrom > exportTo && (
            <p className="text-xs text-red-400">⚠ "From" date is after "To" date</p>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setExportOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleExport}
              disabled={exporting || !exportCourse || (exportFrom && exportTo && exportFrom > exportTo)}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exporting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Exporting...</>
                : <><HiDownload className="w-4 h-4" /> Download CSV</>
              }
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
