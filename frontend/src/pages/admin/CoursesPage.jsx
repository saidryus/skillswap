import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiUserAdd, HiUserRemove } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { courseCode: '', courseName: '', description: '', units: 3, department: '', faculty: '' };

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedStudent, setSelectedStudent] = useState('');

  const fetchData = async () => {
    try {
      const [coursesRes, facultyRes, studentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/users?role=faculty'),
        api.get('/users?role=student'),
      ]);
      setCourses(coursesRes.data);
      setFaculty(facultyRes.data);
      setStudents(studentsRes.data);
      // Keep selectedCourse in sync so enrollment modal reflects latest data
      setSelectedCourse(prev =>
        prev ? coursesRes.data.find(c => c._id === prev._id) ?? prev : prev
      );
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditCourse(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => { setEditCourse(c); setForm({ ...c, faculty: c.faculty?._id || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse._id}`, form);
        toast.success('Course updated');
      } else {
        await api.post('/courses', form);
        toast.success('Course created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent) return;
    try {
      await api.post(`/courses/${selectedCourse._id}/enroll`, { studentId: selectedStudent });
      toast.success('Student enrolled');
      fetchData();
      setSelectedStudent('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleUnenroll = async (courseId, studentId) => {
    try {
      await api.post(`/courses/${courseId}/unenroll`, { studentId });
      toast.success('Student removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove student');
    }
  };

  return (
    <div>
      <PageHeader
        title="Course Management"
        subtitle="Manage courses, faculty, and enrollments"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <HiPlus className="w-4 h-4" /> Add Course
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{course.courseCode}</span>
                  <h3 className="text-base font-semibold text-slate-100 mt-1">{course.courseName}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(course)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(course._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {course.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{course.description}</p>}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Units:</span>
                  <span className="text-slate-200 font-medium">{course.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Faculty:</span>
                  <span className="text-slate-200">{course.faculty ? `${course.faculty.firstName} ${course.faculty.lastName}` : 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Students:</span>
                  <span className="text-slate-200">{course.students?.length || 0} enrolled</span>
                </div>
              </div>

              <button
                onClick={() => { setSelectedCourse(course); setEnrollModal(true); }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
              >
                <HiUserAdd className="w-4 h-4" /> Manage Enrollment
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCourse ? 'Edit Course' : 'Create Course'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Course Code</label>
              <input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} className="input-field" placeholder="CS101" required />
            </div>
            <div>
              <label className="label">Units</label>
              <input type="number" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} className="input-field" min={1} max={6} required />
            </div>
          </div>
          <div>
            <label className="label">Course Name</label>
            <input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label">Assign Faculty</label>
              <select value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} className="input-field">
                <option value="">Unassigned</option>
                {faculty.map((f) => (
                  <option key={f._id} value={f._id}>{f.firstName} {f.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editCourse ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Enrollment Modal */}
      <Modal isOpen={enrollModal} onClose={() => setEnrollModal(false)} title={`Enrollment: ${selectedCourse?.courseName}`} size="lg">
        <div className="space-y-4">
          <div className="flex gap-3">
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="input-field flex-1">
              <option value="">Select student to enroll</option>
              {students
                .filter((s) => !selectedCourse?.students?.some((e) => e._id === s._id))
                .map((s) => (
                  <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId || s.email})</option>
                ))}
            </select>
            <button onClick={handleEnroll} className="btn-primary whitespace-nowrap">Enroll</button>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Enrolled Students ({selectedCourse?.students?.length || 0})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedCourse?.students?.length === 0 && <p className="text-slate-400 text-sm">No students enrolled</p>}
              {selectedCourse?.students?.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-100">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-slate-400">{s.studentId || s.email}</p>
                  </div>
                  <button onClick={() => handleUnenroll(selectedCourse._id, s._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <HiUserRemove className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
