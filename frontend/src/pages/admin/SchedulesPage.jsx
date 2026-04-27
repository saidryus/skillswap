import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiExclamation } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyForm = { course: '', day: 'Monday', startTime: '08:00', endTime: '09:30', room: '', semester: '1st Semester', schoolYear: '2024-2025' };

const CONFLICT_LABELS = {
  room:       { color: 'bg-orange-500/15 border-orange-500/40 text-orange-300', label: 'Room Conflict' },
  instructor: { color: 'bg-red-500/15 border-red-500/40 text-red-300',    label: 'Instructor Conflict' },
  student:    { color: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300', label: 'Student Conflict' },
  course:     { color: 'bg-blue-500/15 border-blue-500/40 text-blue-300',  label: 'Duplicate Schedule' },
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [dayFilter, setDayFilter] = useState('');
  const [conflictError, setConflictError] = useState(null); // { type, message }

  const fetchData = async () => {
    try {
      const [schedulesRes, coursesRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/courses'),
      ]);
      setSchedules(schedulesRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditSchedule(null); setForm(emptyForm); setConflictError(null); setModalOpen(true); };
  const openEdit = (s) => {
    setEditSchedule(s);
    setConflictError(null);
    setForm({ course: s.course?._id || '', day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room || '', semester: s.semester || '', schoolYear: s.schoolYear || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError(null);
    try {
      if (editSchedule) {
        await api.put(`/schedules/${editSchedule._id}`, form);
        toast.success('Schedule updated');
      } else {
        await api.post('/schedules', form);
        toast.success('Schedule created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data?.conflictType) {
        // Show inline conflict error inside the modal
        setConflictError({ type: data.conflictType, message: data.message });
      } else {
        toast.error(data?.message || 'Operation failed');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Schedule deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filtered = dayFilter ? schedules.filter((s) => s.day === dayFilter) : schedules;

  const dayColors = {
    Monday: 'bg-blue-500/20 text-blue-300',
    Tuesday: 'bg-green-500/20 text-green-300',
    Wednesday: 'bg-purple-500/20 text-purple-300',
    Thursday: 'bg-orange-500/20 text-orange-300',
    Friday: 'bg-pink-500/20 text-pink-300',
    Saturday: 'bg-yellow-500/20 text-yellow-300',
    Sunday: 'bg-red-500/20 text-red-300',
  };

  return (
    <div>
      <PageHeader
        title="Schedule Management"
        subtitle="Manage class schedules"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <HiPlus className="w-4 h-4" /> Add Schedule
          </button>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setDayFilter('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!dayFilter ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>All</button>
        {DAYS.map((d) => (
          <button key={d} onClick={() => setDayFilter(d)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${dayFilter === d ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{d}</button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="table-header">Course</th>
                <th className="table-header">Day</th>
                <th className="table-header">Time</th>
                <th className="table-header">Room</th>
                <th className="table-header">Faculty</th>
                <th className="table-header">Semester</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No schedules found</td></tr>
              ) : filtered.map((s) => (
                <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-700/30 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-slate-100">{s.course?.courseName}</p>
                    <p className="text-xs text-slate-400">{s.course?.courseCode}</p>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${dayColors[s.day]}`}>{s.day}</span>
                  </td>
                  <td className="table-cell">{s.startTime} – {s.endTime}</td>
                  <td className="table-cell">{s.room || '—'}</td>
                  <td className="table-cell">{s.course?.faculty ? `${s.course.faculty.firstName} ${s.course.faculty.lastName}` : '—'}</td>
                  <td className="table-cell text-xs">{s.semester} {s.schoolYear}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editSchedule ? 'Edit Schedule' : 'Create Schedule'}>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Conflict error banner */}
          {conflictError && (
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${CONFLICT_LABELS[conflictError.type]?.color || 'bg-red-500/15 border-red-500/40 text-red-300'}`}>
              <HiExclamation className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5">
                  {CONFLICT_LABELS[conflictError.type]?.label || 'Conflict Detected'}
                </p>
                <p className="text-sm">{conflictError.message}</p>
              </div>
            </div>
          )}
          <div>
            <label className="label">Course</label>
            <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="input-field" required>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Day</label>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="input-field">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Room</label>
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="input-field" placeholder="Room 101" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="input-field">
                <option>1st Semester</option>
                <option>2nd Semester</option>
                <option>Summer</option>
              </select>
            </div>
            <div>
              <label className="label">School Year</label>
              <input value={form.schoolYear} onChange={(e) => setForm({ ...form, schoolYear: e.target.value })} className="input-field" placeholder="2024-2025" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editSchedule ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
