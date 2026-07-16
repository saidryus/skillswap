import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiUpload } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
const emptyForm = { courseCode: '', courseName: '', description: '', units: 3, yearLevel: '', semester: '', department: '', isActive: true };

// Parse a single CSV line handling quoted fields (commas inside quotes)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [importText, setImportText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data);
    } catch {}
  };

  useEffect(() => {
    let result = courses;
    if (yearFilter) result = result.filter(c => c.yearLevel === Number(yearFilter));
    if (semFilter) result = result.filter(c => c.semester === Number(semFilter));
    if (deptFilter) result = result.filter(c => c.department === deptFilter);
    if (search) result = result.filter(c =>
      `${c.courseCode} ${c.courseName}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [courses, yearFilter, semFilter, deptFilter, search]);

  const openCreate = () => { setEditCourse(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => { setEditCourse(c); setForm({ ...c, yearLevel: c.yearLevel ?? '', semester: c.semester ?? '' }); setModalOpen(true); };

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
      fetchCourses();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      setDeleteConfirm(null);
      fetchCourses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleImport = async () => {
    if (!importText.trim()) { toast.error('Paste CSV data first'); return; }
    setImportLoading(true);
    try {
      const lines = importText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(line => {
        const vals = parseCSVLine(line).map(v => v.trim());
        return headers.reduce((obj, h, i) => { obj[h] = vals[i] || ''; return obj; }, {});
      }).filter(r => r.coursecode || r.code);

      if (rows.length === 0) { toast.error('No valid rows found. Check your CSV format.'); setImportLoading(false); return; }

      // Normalize header keys to match what backend expects
      const normalized = rows.map(r => ({
        courseCode: r.coursecode || r.code || '',
        courseName: r.coursename || r.name || '',
        description: r.description || '',
        units: r.units || '3',
        yearLevel: r.yearlevel || r.year || '',
        semester: r.semester || '',
        department: r.department || '',
      }));

      const { data } = await api.post('/courses/import', normalized);
      toast.success(`Imported: ${data.created} created, ${data.skipped} skipped${data.errors.length ? `, ${data.errors.length} errors` : ''}`);
      if (data.errors.length) {
        data.errors.slice(0, 3).forEach(e => toast.error(`${e.row}: ${e.reason}`));
      }
      setImportOpen(false);
      setImportText('');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally { setImportLoading(false); }
  };

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  courses.forEach(c => { if (counts[c.yearLevel] !== undefined) counts[c.yearLevel]++; });

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Manage courses available for peer tutoring"
        action={
          <div className="flex gap-2">
            <button onClick={() => setImportOpen(true)} className="btn-secondary flex items-center gap-2">
              <HiUpload className="w-4 h-4" /> Bulk Import
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2"><HiPlus className="w-4 h-4" /> Add Course</button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-1">
          {[{ key: '', label: 'All', count: courses.length }, { key: '1', label: '1st Year', count: counts[1] }, { key: '2', label: '2nd Year', count: counts[2] }, { key: '3', label: '3rd Year', count: counts[3] }, { key: '4', label: '4th Year', count: counts[4] }].map(tab => (
            <button key={tab.key} onClick={() => setYearFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${yearFilter === tab.key ? 'bg-blue-600 text-white shadow' : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:bg-surface-800'}`}>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${yearFilter === tab.key ? 'bg-blue-500/50 text-blue-100' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2" placeholder="Search courses..." />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field py-2 w-48">
          <option value="">All Departments</option>
          {departments.filter(d => d.isActive).map(d => (
            <option key={d._id} value={d.name}>{d.name}</option>
          ))}
        </select>
        <select value={semFilter} onChange={e => setSemFilter(e.target.value)} className="input-field py-2 w-36">
          <option value="">All Semesters</option>
          <option value="1">1st Semester</option>
          <option value="2">2nd Semester</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="table-header">Code</th>
                <th className="table-header">Course Name</th>
                <th className="table-header">Units</th>
                <th className="table-header">Year Level</th>
                <th className="table-header">Semester</th>
                <th className="table-header">Department</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? <tr><td colSpan={7} className="text-center py-8 text-surface-500 dark:text-surface-400">Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-surface-500 dark:text-surface-400">No courses found</td></tr>
              : filtered.map(c => (
                <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface-50/50 dark:bg-surface-800/50 transition-colors">
                  <td className="table-cell font-mono text-blue-400 font-semibold">{c.courseCode}</td>
                  <td className="table-cell">
                    <p className="text-surface-900 dark:text-surface-100">{c.courseName}</p>
                    {c.description && <p className="text-xs text-surface-400 dark:text-surface-500 truncate max-w-xs">{c.description}</p>}
                  </td>
                  <td className="table-cell">{c.units}</td>
                  <td className="table-cell">{c.yearLevel ? <span className="badge bg-indigo-500/20 text-indigo-300 border-indigo-500/30">{YEAR_LABELS[c.yearLevel]}</span> : '—'}</td>
                  <td className="table-cell">{c.semester ? <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/30">Sem {c.semester}</span> : '—'}</td>
                  <td className="table-cell text-sm text-surface-500 dark:text-surface-400">{c.department || '—'}</td>
                  <td className="table-cell"><span className={`badge ${c.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(c)} className="p-1.5 text-surface-500 dark:text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCourse ? 'Edit Course' : 'Add Course'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Course Code</label><input value={form.courseCode} onChange={e => setForm({...form, courseCode: e.target.value.toUpperCase()})} className="input-field font-mono uppercase" required placeholder="IT101" /></div>
            <div><label className="label">Units</label><input type="number" value={form.units} onChange={e => setForm({...form, units: Number(e.target.value)})} className="input-field" min={1} max={12} required /></div>
          </div>
          <div><label className="label">Course Name</label><input value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} className="input-field" required /></div>
          <div><label className="label">Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" placeholder="Optional" /></div>
          <div><label className="label">Year Level</label>
            <select value={form.yearLevel} onChange={e => setForm({...form, yearLevel: e.target.value})} className="input-field" required>
              <option value="">Select year level</option>
              <option value="1">1st Year</option><option value="2">2nd Year</option>
              <option value="3">3rd Year</option><option value="4">4th Year</option>
            </select>
          </div>
          <div><label className="label">Semester</label>
            <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} className="input-field" required>
              <option value="">Select semester</option>
              <option value="1">1st Semester</option><option value="2">2nd Semester</option>
            </select>
          </div>
          <div><label className="label">Department</label>
            <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="input-field" required>
              <option value="">Select department...</option>
              {departments.filter(d => d.isActive).map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          {editCourse && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="courseActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded" />
              <label htmlFor="courseActive" className="text-sm text-surface-700 dark:text-surface-300">Active</label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editCourse ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={importOpen} onClose={() => { setImportOpen(false); setImportText(''); }} title="Bulk Import Courses">
        <div className="space-y-4">
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 text-xs text-surface-500 dark:text-surface-400 space-y-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-surface-700 dark:text-surface-300">Expected CSV format:</p>
              <button
                onClick={() => {
                  const header = 'courseCode,courseName,description,units,yearLevel,semester,department';
                  const sample = 'NCM101,Anatomy and Physiology,"Structure and functions of the human body",5,1,1,College of Nursing\nIT101,Introduction to Computing,"Fundamentals of computing",3,1,1,Information Technology';
                  const blob = new Blob([`${header}\n${sample}`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'courses_import_template.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <HiUpload className="w-3 h-3 rotate-180" /> Download Template
              </button>
            </div>
            <p className="font-mono text-xs break-all">courseCode,courseName,description,units,yearLevel,semester,department</p>
            <p className="font-mono text-xs text-surface-400 dark:text-surface-500 break-all">NCM101,Anatomy and Physiology,"Structure and functions...",5,1,1,College of Nursing</p>
            <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">yearLevel: 1-4 · semester: 1-2 · units: 1-12 · Wrap descriptions with commas in quotes. Department must match an existing department name.</p>
          </div>
          <div>
            <label className="label">Upload CSV file or paste data</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-2"
                onClick={() => document.getElementById('csvCourseFileInput').click()}
              >
                📄 Choose CSV File
              </button>
              <input
                id="csvCourseFileInput"
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setImportText(ev.target.result);
                  reader.readAsText(file);
                  e.target.value = '';
                }}
              />
              <span className="text-xs text-surface-400 self-center">or paste below</span>
            </div>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="input-field font-mono text-xs"
              rows={8}
              placeholder="courseCode,courseName,description,units,yearLevel,semester&#10;IT101,Introduction to Computing,,3,1,1"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setImportOpen(false); setImportText(''); }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleImport} disabled={importLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {importLoading
                ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                : <HiUpload className="w-4 h-4" />}
              Import
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm?._id)}
        title="Delete Course"
        message={deleteConfirm ? `Delete course ${deleteConfirm.courseCode} — ${deleteConfirm.courseName}? This cannot be undone.` : ''}
        confirmText="Delete Course"
      />
    </div>
  );
}
