import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiUserAdd, HiUserRemove, HiUpload, HiDownload, HiCheckCircle, HiExclamationCircle, HiX } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { courseCode: '', courseName: '', description: '', units: 3, type: 'lecture', yearLevel: '', department: '', faculty: '' };

// Parse a CSV string into an array of objects using the header row as keys
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    // Handle quoted fields with commas inside
    const values = [];
    let cur = '', inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { values.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    values.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  }).filter(row => Object.values(row).some(v => v !== ''));
}

const CSV_TEMPLATE = `courseCode,courseName,description,units,type,yearLevel,department
CS101,Introduction to Computing,Fundamentals of computing,3,lecture,1,Computer Science
CS102L,Computing Laboratory,Hands-on computing lab,1,laboratory,1,Computer Science
`;

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // CSV import state
  const [csvRows, setCsvRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

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

  // CSV import handlers
  function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCsv(e.target.result);
      if (rows.length === 0) { toast.error('No valid rows found in CSV'); return; }
      setCsvRows(rows);
      setImportResult(null);
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleImport() {
    if (csvRows.length === 0) return;
    setImporting(true);
    try {
      const { data } = await api.post('/courses/import', csvRows);
      setImportResult(data);
      if (data.created > 0) fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'courses_template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function closeImportModal() {
    setImportModal(false);
    setCsvRows([]);
    setImportResult(null);
  }

  return (
    <div>
      <PageHeader
        title="Course Management"
        subtitle="Manage courses, faculty, and enrollments"
        action={
          <div className="flex gap-2">
            <button onClick={() => setImportModal(true)} className="btn-secondary flex items-center gap-2">
              <HiUpload className="w-4 h-4" /> Import CSV
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <HiPlus className="w-4 h-4" /> Add Course
            </button>
          </div>
        }
      />

      {/* Year filter */}
      <div className="flex gap-3 mb-6">
        {['', '1', '2', '3', '4'].map(y => (
          <button
            key={y}
            onClick={() => setYearFilter(y)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border
              ${yearFilter === y
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
          >
            {y === '' ? 'All Years' : `${y}${y === '1' ? 'st' : y === '2' ? 'nd' : y === '3' ? 'rd' : 'th'} Year`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses
            .filter(c => yearFilter === '' || String(c.yearLevel) === yearFilter)
            .map((course) => (
            <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{course.courseCode}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${course.type === 'laboratory' ? 'bg-purple-500/10 text-purple-400' : 'bg-green-500/10 text-green-400'}`}>
                      {course.type === 'laboratory' ? 'Lab' : 'Lec'}
                    </span>
                    {course.yearLevel && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                        {course.yearLevel}{course.yearLevel === 1 ? 'st' : course.yearLevel === 2 ? 'nd' : course.yearLevel === 3 ? 'rd' : 'th'} Year
                      </span>
                    )}
                  </div>
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
              <label className="label">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="lecture">Lecture</option>
                <option value="laboratory">Laboratory</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Year Level</label>
              <select value={form.yearLevel} onChange={(e) => setForm({ ...form, yearLevel: e.target.value })} className="input-field">
                <option value="">Not specified</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
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
      {/* CSV Import Modal */}
      <Modal isOpen={importModal} onClose={closeImportModal} title="Import Courses from CSV" size="lg">
        <div className="space-y-4">

          {/* Template download */}
          <div className="flex items-center justify-between bg-slate-700/40 border border-slate-600/50 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Download Template</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Columns: courseCode, courseName, description, units, type, yearLevel, department
              </p>
            </div>
            <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2 shrink-0">
              <HiDownload className="w-4 h-4" /> Template
            </button>
          </div>

          {/* Drop zone */}
          {!importResult && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${dragOver ? 'border-blue-400 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'}`}
            >
              <HiUpload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">
                {csvRows.length > 0 ? `${csvRows.length} rows loaded` : 'Drop your CSV here or click to browse'}
              </p>
              <p className="text-xs text-slate-500 mt-1">.csv files only</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* Preview table */}
          {csvRows.length > 0 && !importResult && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Preview — {csvRows.length} rows
              </p>
              <div className="overflow-auto max-h-52 rounded-lg border border-slate-700">
                <table className="w-full text-xs">
                  <thead className="bg-slate-700/60 sticky top-0">
                    <tr>
                      {Object.keys(csvRows[0]).map(h => (
                        <th key={h} className="px-3 py-2 text-left text-slate-300 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {csvRows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-700/30">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-1.5 text-slate-300 whitespace-nowrap">{v || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import result */}
          {importResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{importResult.created}</p>
                  <p className="text-xs text-green-300 mt-0.5">Created</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{importResult.skipped}</p>
                  <p className="text-xs text-yellow-300 mt-0.5">Skipped (duplicate)</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{importResult.errors.length}</p>
                  <p className="text-xs text-red-300 mt-0.5">Errors</p>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-xs font-semibold text-red-400 mb-1">Errors:</p>
                  {importResult.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-300">{e.row}: {e.reason}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={closeImportModal} className="btn-secondary flex-1">
              {importResult ? 'Close' : 'Cancel'}
            </button>
            {csvRows.length > 0 && !importResult && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {importing ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing...</>
                ) : (
                  <><HiUpload className="w-4 h-4" /> Import {csvRows.length} Courses</>
                )}
              </button>
            )}
            {importResult && (
              <button onClick={() => { setCsvRows([]); setImportResult(null); }} className="btn-primary flex-1">
                Import Another File
              </button>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
}
