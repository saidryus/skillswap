import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiSearch, HiRefresh, HiUserGroup } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_HEIGHT = 36;

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 7; h < 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

function parseTime(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatTime12(t) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function durationSlots(start, end) {
  return (parseTime(end) - parseTime(start)) / 30;
}

const BLOCK_COLORS = [
  '#2563eb', '#9333ea', '#16a34a', '#ea580c', '#db2777',
  '#0d9488', '#dc2626', '#ca8a04', '#4f46e5', '#0891b2',
];

const emptyEntry = { day: 'Monday', startTime: '07:30', endTime: '09:00', label: '' };

export default function StudentSchedulesPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [entryForm, setEntryForm] = useState(emptyEntry);
  const [search, setSearch] = useState('');

  // Bulk enroll state
  const [bulkModal, setBulkModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkYearFilter, setBulkYearFilter] = useState('');
  const [bulkSelectedStudents, setBulkSelectedStudents] = useState([]);
  const [bulkEntries, setBulkEntries] = useState([{ ...emptyEntry }]);
  const [bulkReplace, setBulkReplace] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  useEffect(() => {
    api.get('/users?role=student').then(({ data }) => setStudents(data))
      .finally(() => setLoadingStudents(false));
    api.get('/courses').then(({ data }) => setCourses(data));
  }, []);

  const fetchSchedule = async (studentId) => {
    setLoadingSchedule(true);
    try {
      const { data } = await api.get(`/student-schedules/${studentId}`);
      setSchedule(data);
    } catch { toast.error('Failed to load schedule'); }
    finally { setLoadingSchedule(false); }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    fetchSchedule(student._id);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/student-schedules/${selectedStudent._id}/entry`, entryForm);
      toast.success('Entry added');
      setAddModal(false);
      setEntryForm(emptyEntry);
      fetchSchedule(selectedStudent._id);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add entry'); }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await api.delete(`/student-schedules/entry/${entryId}`);
      toast.success('Entry removed');
      fetchSchedule(selectedStudent._id);
    } catch { toast.error('Failed to delete entry'); }
  };

  const handleClearSchedule = async () => {
    if (!confirm(`Clear all schedule entries for ${selectedStudent.firstName} ${selectedStudent.lastName}?`)) return;
    try {
      await api.delete(`/student-schedules/${selectedStudent._id}`);
      toast.success('Schedule cleared');
      setSchedule([]);
    } catch { toast.error('Failed to clear schedule'); }
  };

  // Bulk enroll helpers
  const toggleBulkStudent = (id) => {
    setBulkSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const filtered = students.filter(s => {
      const matchSearch = `${s.firstName} ${s.lastName} ${s.studentIdNumber || ''}`.toLowerCase().includes(bulkSearch.toLowerCase());
      const matchYear = bulkYearFilter ? s.yearLevel === Number(bulkYearFilter) : true;
      return matchSearch && matchYear;
    });
    setBulkSelectedStudents(filtered.map(s => s._id));
  };

  const deselectAll = () => setBulkSelectedStudents([]);

  const addBulkEntry = () => setBulkEntries(prev => [...prev, { ...emptyEntry }]);

  const removeBulkEntry = (idx) => setBulkEntries(prev => prev.filter((_, i) => i !== idx));

  const updateBulkEntry = (idx, field, value) => {
    setBulkEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleBulkEnroll = async () => {
    if (bulkSelectedStudents.length === 0) return toast.error('Select at least one student');
    const validEntries = bulkEntries.filter(e => e.day && e.startTime && e.endTime);
    if (validEntries.length === 0) return toast.error('Add at least one valid schedule entry');

    setBulkSubmitting(true);
    try {
      const { data } = await api.post('/student-schedules/bulk-enroll', {
        studentIds: bulkSelectedStudents,
        entries: validEntries,
        replaceExisting: bulkReplace,
      });
      toast.success(data.message);
      setBulkModal(false);
      setBulkSelectedStudents([]);
      setBulkEntries([{ ...emptyEntry }]);
      setBulkReplace(false);
      // Refresh current student schedule if one is selected
      if (selectedStudent) fetchSchedule(selectedStudent._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk enrollment failed');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.studentIdNumber || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  // Build grid data: for each day, find entries that start at a given time slot
  const gridEntries = {};   // `${day}-${slotIdx}` → entry
  const consumed = new Set(); // slots consumed by multi-slot blocks
  const entryColorMap = {};
  let colorIdx = 0;

  schedule.forEach(entry => {
    const si = TIME_SLOTS.indexOf(entry.startTime);
    if (si === -1) return;
    gridEntries[`${entry.day}-${si}`] = entry;
    if (!entryColorMap[entry._id]) {
      entryColorMap[entry._id] = BLOCK_COLORS[colorIdx % BLOCK_COLORS.length];
      colorIdx++;
    }
    const slots = durationSlots(entry.startTime, entry.endTime);
    for (let i = 1; i < slots; i++) consumed.add(`${entry.day}-${si + i}`);
  });

  // Determine visible range
  const usedSlots = new Set();
  schedule.forEach(entry => {
    const si = TIME_SLOTS.indexOf(entry.startTime);
    const slots = durationSlots(entry.startTime, entry.endTime);
    for (let i = 0; i < slots; i++) usedSlots.add(si + i);
  });
  const minSlot = usedSlots.size > 0 ? Math.max(0, Math.min(...usedSlots) - 1) : 0;
  const maxSlot = usedSlots.size > 0 ? Math.min(TIME_SLOTS.length - 1, Math.max(...usedSlots) + 1) : TIME_SLOTS.length - 1;
  const visibleSlots = TIME_SLOTS.slice(minSlot, maxSlot + 1);

  return (
    <div>
      <PageHeader title="Student Schedules" subtitle="Manage weekly class schedules for constraint-based session matching" />

      {/* Bulk Enroll button */}
      <div className="flex justify-end mb-4">
        <button onClick={() => setBulkModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <HiUserGroup className="w-4 h-4" /> Bulk Enroll Students
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student list */}
        <div className="card lg:col-span-1">
          <div className="relative mb-3">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2" placeholder="Search students..." />
          </div>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {loadingStudents ? <p className="text-surface-500 dark:text-surface-400 text-sm">Loading...</p>
            : filteredStudents.map(s => (
              <button key={s._id} onClick={() => handleSelectStudent(s)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${selectedStudent?._id === s._id ? 'bg-blue-600/20 border border-blue-500/40' : 'hover:bg-surface-50 dark:bg-surface-800'}`}>
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{s.firstName} {s.lastName}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{s.studentIdNumber || s.email} · Year {s.yearLevel}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Timetable view */}
        <div className="lg:col-span-3">
          {!selectedStudent ? (
            <div className="card flex items-center justify-center h-40 text-surface-500 dark:text-surface-400">
              Select a student to view or edit their schedule
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                <div>
                  <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{selectedStudent.studentIdNumber} · Year {selectedStudent.yearLevel} · {schedule.length} entries</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEntryForm(emptyEntry); setAddModal(true); }} className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
                    <HiPlus className="w-4 h-4" /> Add
                  </button>
                  {schedule.length > 0 && (
                    <button onClick={handleClearSchedule} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 text-red-400 hover:text-red-300">
                      <HiRefresh className="w-4 h-4" /> Clear
                    </button>
                  )}
                </div>
              </div>

              {loadingSchedule ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
              ) : schedule.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-surface-400 dark:text-surface-500 text-sm">
                  No schedule entries yet. Click "Add" to create one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: 700 }}>
                    {/* Day headers */}
                    <div className="grid border-b border-surface-200 dark:border-surface-700" style={{ gridTemplateColumns: '56px repeat(6, 1fr)' }}>
                      <div className="bg-surface-100 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700/40" />
                      {DAYS.map(day => (
                        <div key={day} className="text-center py-2 text-xs font-semibold text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700/40">
                          {day.slice(0, 3).toUpperCase()}
                        </div>
                      ))}
                    </div>

                    {/* Time rows */}
                    {visibleSlots.map((time, vi) => {
                      const absIdx = minSlot + vi;
                      const isHour = time.endsWith(':00');

                      return (
                        <div key={time} className="grid" style={{ gridTemplateColumns: '56px repeat(6, 1fr)', height: SLOT_HEIGHT }}>
                          {/* Time label */}
                          <div className={`flex items-start justify-end pr-2 pt-0.5 border-r border-surface-200 dark:border-surface-700/40 ${isHour ? 'border-b border-surface-300 dark:border-surface-600/30' : ''}`}>
                            {isHour && <span className="text-xs text-surface-400 dark:text-surface-500 leading-none">{formatTime12(time)}</span>}
                          </div>

                          {/* Day cells */}
                          {DAYS.map(day => {
                            const key = `${day}-${absIdx}`;
                            if (consumed.has(key)) return <div key={day} className="border-r border-surface-200 dark:border-surface-700/40" style={{ height: SLOT_HEIGHT }} />;

                            const entry = gridEntries[key];
                            return (
                              <div key={day} className={`relative border-r border-surface-200 dark:border-surface-700/40 ${isHour ? 'border-b border-surface-300 dark:border-surface-600/30' : ''}`} style={{ height: SLOT_HEIGHT }}>
                                {entry && (
                                  <div
                                    className="absolute inset-x-0.5 rounded text-xs overflow-hidden z-10 group cursor-pointer"
                                    style={{
                                      height: durationSlots(entry.startTime, entry.endTime) * SLOT_HEIGHT - 2,
                                      top: 1,
                                      backgroundColor: entryColorMap[entry._id],
                                      border: `1px solid ${entryColorMap[entry._id]}cc`,
                                    }}
                                  >
                                    <div className="p-1 h-full overflow-hidden relative">
                                      <p className="font-bold text-white leading-tight truncate">{entry.label || 'Class'}</p>
                                      <p className="text-white/70 leading-tight" style={{ fontSize: 10 }}>{formatTime12(entry.startTime)}–{formatTime12(entry.endTime)}</p>
                                      {/* Delete button on hover */}
                                      <button
                                        onClick={() => handleDeleteEntry(entry._id)}
                                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove"
                                      >
                                        <HiTrash className="w-2.5 h-2.5 text-white" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add entry modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Schedule Entry">
        <form onSubmit={handleAddEntry} className="space-y-4">
          <div>
            <label className="label">Day</label>
            <select value={entryForm.day} onChange={e => setEntryForm({...entryForm, day: e.target.value})} className="input-field">
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Start Time</label><input type="time" value={entryForm.startTime} onChange={e => setEntryForm({...entryForm, startTime: e.target.value})} className="input-field" required /></div>
            <div><label className="label">End Time</label><input type="time" value={entryForm.endTime} onChange={e => setEntryForm({...entryForm, endTime: e.target.value})} className="input-field" required /></div>
          </div>
          <div><label className="label">Label</label><input value={entryForm.label} onChange={e => setEntryForm({...entryForm, label: e.target.value})} className="input-field" placeholder="e.g. IT101 - Introduction to Computing" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Add Entry</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Enroll modal */}
      <Modal isOpen={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Enroll Students" size="lg">
        <div className="space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Select Students */}
          <div>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">1. Select Students</h4>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input value={bulkSearch} onChange={e => setBulkSearch(e.target.value)} className="input-field pl-9 py-1.5 text-sm" placeholder="Search students..." />
              </div>
              <select value={bulkYearFilter} onChange={e => setBulkYearFilter(e.target.value)} className="input-field w-32 py-1.5 text-sm">
                <option value="">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={selectAllFiltered} className="text-xs text-blue-500 hover:text-blue-400">Select All Filtered</button>
              <button type="button" onClick={deselectAll} className="text-xs text-red-500 hover:text-red-400">Deselect All</button>
              <span className="text-xs text-surface-500 dark:text-surface-400 ml-auto">{bulkSelectedStudents.length} selected</span>
            </div>
            <div className="border border-surface-200 dark:border-surface-700 rounded-lg max-h-40 overflow-y-auto">
              {students
                .filter(s => {
                  const matchSearch = `${s.firstName} ${s.lastName} ${s.studentIdNumber || ''}`.toLowerCase().includes(bulkSearch.toLowerCase());
                  const matchYear = bulkYearFilter ? s.yearLevel === Number(bulkYearFilter) : true;
                  return matchSearch && matchYear;
                })
                .map(s => (
                  <label key={s._id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer">
                    <input type="checkbox" checked={bulkSelectedStudents.includes(s._id)} onChange={() => toggleBulkStudent(s._id)} className="rounded border-surface-300 dark:border-surface-600" />
                    <span className="text-sm text-surface-900 dark:text-surface-100">{s.firstName} {s.lastName}</span>
                    <span className="text-xs text-surface-500 dark:text-surface-400 ml-auto">{s.studentIdNumber} · Yr {s.yearLevel}</span>
                  </label>
                ))
              }
            </div>
          </div>

          {/* Step 2: Define Schedule Entries */}
          <div>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">2. Schedule Entries to Assign</h4>
            <div className="space-y-2">
              {bulkEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-surface-50 dark:bg-surface-800 rounded-lg">
                  <select value={entry.day} onChange={e => updateBulkEntry(idx, 'day', e.target.value)} className="input-field py-1 text-xs w-24">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input type="time" value={entry.startTime} onChange={e => updateBulkEntry(idx, 'startTime', e.target.value)} className="input-field py-1 text-xs w-24" />
                  <input type="time" value={entry.endTime} onChange={e => updateBulkEntry(idx, 'endTime', e.target.value)} className="input-field py-1 text-xs w-24" />
                  <select value={entry.label} onChange={e => updateBulkEntry(idx, 'label', e.target.value)} className="input-field py-1 text-xs flex-1">
                    <option value="">-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={`${c.courseCode} - ${c.courseName}`}>{c.courseCode} - {c.courseName}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={entry.label}
                    onChange={e => updateBulkEntry(idx, 'label', e.target.value)}
                    className="input-field py-1 text-xs flex-1"
                    placeholder="Or type custom label"
                  />
                  {bulkEntries.length > 1 && (
                    <button type="button" onClick={() => removeBulkEntry(idx)} className="text-red-500 hover:text-red-400">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addBulkEntry} className="mt-2 text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1">
              <HiPlus className="w-3 h-3" /> Add another entry
            </button>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bulkReplace} onChange={e => setBulkReplace(e.target.checked)} className="rounded border-surface-300 dark:border-surface-600" />
              <span className="text-sm text-surface-700 dark:text-surface-300">Replace existing schedules (clear first)</span>
            </label>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 ml-6">If unchecked, new entries will be added to existing schedules.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
            <button type="button" onClick={() => setBulkModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="button" onClick={handleBulkEnroll} disabled={bulkSubmitting} className="btn-primary flex-1">
              {bulkSubmitting ? 'Enrolling...' : `Enroll ${bulkSelectedStudents.length} Student(s)`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
