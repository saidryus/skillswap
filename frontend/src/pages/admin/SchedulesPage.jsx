import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { HiPrinter, HiDownload, HiTrash, HiX, HiExclamation, HiCheck } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ── Constants ─────────────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate 30-min slots 07:00 → 21:00
const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 7; h < 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

const SLOT_HEIGHT = 36; // px per 30-min slot

// Palette of distinct, readable colors for schedule blocks
// Each entry: { id, bg (tailwind), border (tailwind), hex (for swatch) }
const COLOR_PALETTE = [
  { id: 'blue',    bg: 'bg-blue-600/80',    border: 'border-blue-400',    hex: '#2563eb' },
  { id: 'purple',  bg: 'bg-purple-600/80',  border: 'border-purple-400',  hex: '#9333ea' },
  { id: 'green',   bg: 'bg-green-600/80',   border: 'border-green-400',   hex: '#16a34a' },
  { id: 'orange',  bg: 'bg-orange-500/80',  border: 'border-orange-400',  hex: '#ea580c' },
  { id: 'pink',    bg: 'bg-pink-600/80',    border: 'border-pink-400',    hex: '#db2777' },
  { id: 'teal',    bg: 'bg-teal-600/80',    border: 'border-teal-400',    hex: '#0d9488' },
  { id: 'red',     bg: 'bg-red-600/80',     border: 'border-red-400',     hex: '#dc2626' },
  { id: 'yellow',  bg: 'bg-yellow-500/80',  border: 'border-yellow-400',  hex: '#ca8a04' },
  { id: 'indigo',  bg: 'bg-indigo-600/80',  border: 'border-indigo-400',  hex: '#4f46e5' },
  { id: 'cyan',    bg: 'bg-cyan-600/80',    border: 'border-cyan-400',    hex: '#0891b2' },
  { id: 'rose',    bg: 'bg-rose-600/80',    border: 'border-rose-400',    hex: '#e11d48' },
  { id: 'lime',    bg: 'bg-lime-600/80',    border: 'border-lime-400',    hex: '#65a30d' },
];

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function slotIndex(time) {
  return TIME_SLOTS.indexOf(time);
}

function durationSlots(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 30;
}

/* ── Draggable course card ──────────────────────────────────────── */
function CourseCard({ course, isDragging, scheduledDays = [], color, usedColorIds, onColorChange }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `course-${course._id}`,
    data: { type: 'course', course },
  });

  const [pickerOpen, setPickerOpen] = useState(false);

  const style = transform
    ? { transform: `translate(${transform.x}px,${transform.y}px)`, zIndex: 999 }
    : {};

  const dayAbbr = { Monday:'M', Tuesday:'T', Wednesday:'W', Thursday:'Th', Friday:'F', Saturday:'Sa' };

  return (
    <div className="mb-2">
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`select-none cursor-grab active:cursor-grabbing rounded-lg p-3 border transition-all
          ${isDragging ? 'opacity-40' : 'opacity-100'}
          bg-slate-700 border-slate-600 hover:border-blue-500`}
      >
        {/* Color swatch strip */}
        <div
          className="h-1 rounded-full mb-2 -mx-0.5"
          style={{ backgroundColor: color?.hex || '#475569' }}
        />
        <p className="text-sm font-semibold text-slate-100">{course.courseCode}</p>
        <p className="text-xs text-slate-400 truncate">{course.courseName}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-500">{course.units} units</p>
          {scheduledDays.length > 0 && (
            <div className="flex gap-0.5">
              {scheduledDays.map(d => (
                <span key={d} className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded px-1">
                  {dayAbbr[d] || d.slice(0,2)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Color picker toggle — outside drag listeners so clicks don't start a drag */}
      <div className="relative">
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); setPickerOpen(o => !o); }}
          className="w-full flex items-center gap-1.5 px-2 py-1 rounded-b-lg bg-slate-800 border border-t-0 border-slate-600 hover:bg-slate-700 transition-colors"
        >
          <span
            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
            style={{ backgroundColor: color?.hex || '#475569' }}
          />
          <span className="text-xs text-slate-400 flex-1 text-left">
            {color ? color.id : 'Pick color'}
          </span>
          <svg className={`w-3 h-3 text-slate-500 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              onPointerDown={e => e.stopPropagation()}
              className="absolute left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-2xl"
            >
              <p className="text-xs text-slate-500 mb-2">Choose a color</p>
              <div className="grid grid-cols-6 gap-1.5">
                {COLOR_PALETTE.map(c => {
                  const isUsed = usedColorIds.has(c.id) && color?.id !== c.id;
                  const isSelected = color?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      title={isUsed ? `${c.id} (in use)` : c.id}
                      disabled={isUsed}
                      onClick={() => { onColorChange(c); setPickerOpen(false); }}
                      className={`relative w-6 h-6 rounded-full border-2 transition-all
                        ${isSelected ? 'border-white scale-110' : 'border-transparent'}
                        ${isUsed ? 'opacity-25 cursor-not-allowed' : 'hover:scale-110 hover:border-white/60 cursor-pointer'}
                      `}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <HiCheck className="absolute inset-0 m-auto w-3 h-3 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Droppable grid cell ────────────────────────────────────────── */
function GridCell({ day, time, children, hasConflict }) {
  const id = `cell-${day}-${time}`;
  const { setNodeRef, isOver } = useDroppable({ id, data: { day, time } });

  return (
    <div
      ref={setNodeRef}
      className={`border-b border-r border-slate-700/40 relative transition-colors
        ${isOver ? (hasConflict ? 'bg-red-500/20' : 'bg-blue-500/15') : ''}
      `}
      style={{ height: SLOT_HEIGHT }}
    >
      {children}
    </div>
  );
}

/* ── Placed schedule block ──────────────────────────────────────── */
function ScheduleBlock({ schedule, onRemove, color }) {
  const slots = durationSlots(schedule.startTime, schedule.endTime);
  // Fallback color if none assigned
  const blockColor = color
    ? `${color.bg} ${color.border}`
    : 'bg-slate-600/80 border-slate-400';

  return (
    <div
      className={`absolute inset-x-0.5 rounded border text-xs overflow-hidden z-10 ${blockColor}`}
      style={{ height: slots * SLOT_HEIGHT - 2, top: 1 }}
    >
      <div className="flex items-start justify-between p-1 h-full">
        <div className="overflow-hidden">
          <p className="font-bold text-white leading-tight truncate">{schedule.course?.courseCode}</p>
          <p className="text-white/80 leading-tight truncate" style={{ fontSize: 10 }}>
            {schedule.startTime}–{schedule.endTime}
          </p>
          {schedule.room && (
            <p className="text-white/70 leading-tight truncate" style={{ fontSize: 10 }}>
              {schedule.room}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(schedule._id)}
          className="text-white/60 hover:text-white shrink-0 ml-1"
        >
          <HiX className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ── Drop confirmation modal ────────────────────────────────────── */
function DropModal({ pending, onConfirm, onCancel }) {
  const [room, setRoom] = useState('');
  const [duration, setDuration] = useState('60');

  if (!pending) return null;

  const endTime = addMinutes(pending.time, parseInt(duration));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 w-80 shadow-2xl"
      >
        <h3 className="text-base font-semibold text-slate-100 mb-1">Place Schedule</h3>
        <p className="text-sm text-slate-400 mb-4">
          <span className="text-blue-400 font-medium">{pending.course.courseCode}</span>
          {' '}on {pending.day} at {pending.time}
        </p>

        <div className="space-y-3">
          <div>
            <label className="label">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className="input-field">
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="150">2.5 hours</option>
              <option value="180">3 hours</option>
            </select>
          </div>
          <div>
            <label className="label">Room (optional)</label>
            <input
              value={room}
              onChange={e => setRoom(e.target.value)}
              className="input-field"
              placeholder="e.g. Room 101"
            />
          </div>
          <p className="text-xs text-slate-500">
            End time: <span className="text-slate-300">{endTime}</span>
          </p>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => onConfirm({ room, endTime })}
            className="btn-primary flex-1"
          >
            Place
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function SchedulesPage() {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]); // all schedules in DB
  const [activeDrag, setActiveDrag] = useState(null);
  const [pending, setPending] = useState(null); // { course, day, time }
  const [conflictError, setConflictError] = useState(null);
  const [semester, setSemester] = useState('1st Semester');
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [courseColors, setCourseColors] = useState({}); // courseId → COLOR_PALETTE entry
  const gridRef = useRef();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  /* fetch faculty + all schedules */
  useEffect(() => {
    Promise.all([
      api.get('/users?role=faculty'),
      api.get('/schedules'),
    ]).then(([fRes, sRes]) => {
      setFaculty(fRes.data);
      setSchedules(sRes.data);
    });
  }, []);

  /* fetch courses for selected faculty */
  useEffect(() => {
    if (!selectedFaculty) { setCourses([]); setCourseColors({}); return; }
    api.get('/courses').then(({ data }) => {
      const filtered = data.filter(c => c.faculty?._id === selectedFaculty);
      setCourses(filtered);
      // Auto-assign colors to courses that don't have one yet
      setCourseColors(prev => {
        const next = { ...prev };
        const usedIds = new Set(Object.values(next).map(c => c.id));
        filtered.forEach(course => {
          if (!next[course._id]) {
            const available = COLOR_PALETTE.find(c => !usedIds.has(c.id));
            if (available) {
              next[course._id] = available;
              usedIds.add(available.id);
            }
          }
        });
        return next;
      });
    });
  }, [selectedFaculty]);

  /* schedules for the selected faculty's courses */
  const facultyCourseIds = courses.map(c => c._id);
  const placedSchedules = schedules.filter(s =>
    facultyCourseIds.includes(s.course?._id || s.course)
  );

  /* build a map of courseId → days already scheduled */
  const scheduledDaysMap = {};
  placedSchedules.forEach(s => {
    const cid = s.course?._id || s.course;
    if (!scheduledDaysMap[cid]) scheduledDaysMap[cid] = [];
    if (!scheduledDaysMap[cid].includes(s.day)) scheduledDaysMap[cid].push(s.day);
  });

  /* build a lookup: day → time → schedule */
  const grid = {};
  placedSchedules.forEach(s => {
    if (!grid[s.day]) grid[s.day] = {};
    grid[s.day][s.startTime] = s;
  });

  /* set of color IDs currently in use */
  const usedColorIds = new Set(Object.values(courseColors).map(c => c.id));

  function handleColorChange(courseId, color) {
    setCourseColors(prev => ({ ...prev, [courseId]: color }));
  }

  /* drag handlers */
  function handleDragStart({ active }) {
    setActiveDrag(active.data.current?.course || null);
    setConflictError(null);
  }

  function handleDragEnd({ active, over }) {
    setActiveDrag(null);
    if (!over) return;
    const { day, time } = over.data.current;
    const course = active.data.current?.course;
    if (!course || !day || !time) return;
    setPending({ course, day, time });
  }

  async function handleConfirm({ room, endTime }) {
    const { course, day, time } = pending;
    setConflictError(null);
    try {
      const { data } = await api.post('/schedules', {
        course: course._id,
        day,
        startTime: time,
        endTime,
        room,
        semester,
        schoolYear,
      });
      // re-fetch schedules
      const sRes = await api.get('/schedules');
      setSchedules(sRes.data);
      setPending(null);
      toast.success(`${course.courseCode} scheduled on ${day} ${time}–${endTime}`);
    } catch (err) {
      const d = err.response?.data;
      if (err.response?.status === 409) {
        setConflictError({ type: d.conflictType, message: d.message });
        setPending(null);
      } else {
        toast.error(d?.message || 'Failed to save schedule');
        setPending(null);
      }
    }
  }

  async function handleRemove(scheduleId) {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      setSchedules(prev => prev.filter(s => s._id !== scheduleId));
      toast.success('Schedule removed');
    } catch {
      toast.error('Failed to remove');
    }
  }

  /* PDF export */
  function handleDownloadPDF() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const fac = faculty.find(f => f._id === selectedFaculty);
    const facName = fac ? `${fac.firstName} ${fac.lastName}` : 'All Faculty';

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TROPHE UNIVERSITY — Class Schedule', 148, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Faculty: ${facName}   |   ${semester}   |   S.Y. ${schoolYear}`, 148, 22, { align: 'center' });

    const rows = [];
    placedSchedules.forEach(s => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
      rows.push([
        s.course?.courseCode || '',
        s.course?.courseName || '',
        s.course?.type === 'laboratory' ? 'Lab' : 'Lec',
        s.day,
        `${s.startTime} – ${s.endTime}`,
        s.room || 'TBA',
        s.course?.units ?? '',
        `${hrs}h`,
      ]);
    });
    rows.sort((a, b) => DAYS.indexOf(a[3]) - DAYS.indexOf(b[3]) || a[4].localeCompare(b[4]));

    // Compute unique-course totals (avoid double-counting multi-day courses)
    const seenCourseIds = new Set();
    let totalUnits = 0;
    placedSchedules.forEach(s => {
      const cid = s.course?._id;
      if (cid && !seenCourseIds.has(cid)) {
        seenCourseIds.add(cid);
        totalUnits += s.course?.units || 0;
      }
    });
    const totalHrs = placedSchedules.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
    }, 0);

    autoTable(doc, {
      startY: 28,
      head: [['Code', 'Course Name', 'Type', 'Day', 'Time', 'Room', 'Units', 'Hrs']],
      body: rows,
      foot: [['', 'TOTALS', '', '', '', '', totalUnits, `${totalHrs}h/wk`]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Schedule_${facName.replace(' ', '_')}_${semester}.pdf`);
  }

  function handlePrint() {
    const fac = faculty.find(f => f._id === selectedFaculty);
    const facName = fac ? `${fac.firstName} ${fac.lastName}` : '';

    const sorted = [...placedSchedules].sort(
      (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime)
    );

    // Totals
    const seenCourseIds = new Set();
    let totalUnits = 0;
    placedSchedules.forEach(s => {
      const cid = s.course?._id;
      if (cid && !seenCourseIds.has(cid)) {
        seenCourseIds.add(cid);
        totalUnits += s.course?.units || 0;
      }
    });
    const totalHrs = placedSchedules.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
    }, 0);

    const rows = sorted.map(s => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
      const isLab = s.course?.type === 'laboratory';
      const typeStyle = isLab
        ? 'background:#f3e8ff;color:#7e22ce;'
        : 'background:#dcfce7;color:#15803d;';
      return `
        <tr>
          <td>${s.course?.courseCode || ''}</td>
          <td>${s.course?.courseName || ''}</td>
          <td><span style="font-size:11px;font-weight:600;padding:2px 7px;border-radius:999px;${typeStyle}">${isLab ? 'Lab' : 'Lec'}</span></td>
          <td>${s.day}</td>
          <td>${s.startTime} – ${s.endTime}</td>
          <td>${s.room || 'TBA'}</td>
          <td style="text-align:center">${s.course?.units ?? ''}</td>
          <td style="text-align:center">${hrs}h</td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Schedule – ${facName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
          h2 { text-align: center; margin-bottom: 4px; }
          p  { text-align: center; color: #555; margin-bottom: 16px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1d4ed8; color: white; padding: 8px 10px; text-align: left; }
          td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) td { background: #f8fafc; }
          tfoot td { background: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1; }
          @page { size: A4 landscape; margin: 15mm; }
        </style>
      </head>
      <body>
        <h2>TROPHE UNIVERSITY — Class Schedule</h2>
        <p>Faculty: ${facName} &nbsp;|&nbsp; ${semester} &nbsp;|&nbsp; S.Y. ${schoolYear}</p>
        <table>
          <thead>
            <tr>
              <th>Code</th><th>Course Name</th><th>Type</th><th>Day</th>
              <th>Time</th><th>Room</th><th style="text-align:center">Units</th><th style="text-align:center">Hrs</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align:right">TOTALS:</td>
              <td style="text-align:center">${totalUnits}</td>
              <td style="text-align:center">${totalHrs}h/wk</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  }

  const conflictColors = {
    room: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
    instructor: 'bg-red-500/15 border-red-500/40 text-red-300',
    student: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',
    course: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Schedule Planner" subtitle="Drag courses onto the weekly grid to build schedules" />

      {/* Conflict banner */}
      <AnimatePresence>
        {conflictError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-start gap-3 p-3 rounded-lg border mb-4 ${conflictColors[conflictError.type] || 'bg-red-500/15 border-red-500/40 text-red-300'}`}
          >
            <HiExclamation className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide mb-0.5">
                {conflictError.type?.replace('_', ' ')} Conflict
              </p>
              <p className="text-sm">{conflictError.message}</p>
            </div>
            <button onClick={() => setConflictError(null)}><HiX className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={selectedFaculty}
          onChange={e => setSelectedFaculty(e.target.value)}
          className="input-field w-56"
        >
          <option value="">Select Faculty</option>
          {faculty.map(f => (
            <option key={f._id} value={f._id}>{f.firstName} {f.lastName}</option>
          ))}
        </select>

        <select value={semester} onChange={e => setSemester(e.target.value)} className="input-field w-40">
          <option>1st Semester</option>
          <option>2nd Semester</option>
          <option>Summer</option>
        </select>

        <input
          value={schoolYear}
          onChange={e => setSchoolYear(e.target.value)}
          className="input-field w-32"
          placeholder="2024-2025"
        />

        <div className="ml-auto flex gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={!selectedFaculty}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40"
          >
            <HiDownload className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={handlePrint}
            disabled={!selectedFaculty}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40"
          >
            <HiPrinter className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {!selectedFaculty ? (
        <div className="card flex-1 flex items-center justify-center text-slate-400">
          Select a faculty member to start building their schedule
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 flex-1 min-h-0">

            {/* Course panel */}
            <div className="w-52 shrink-0 flex flex-col">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Courses ({courses.length})
              </p>
              <div className="flex-1 overflow-y-auto pr-1">
                {courses.length === 0 && (
                  <p className="text-xs text-slate-500">No courses assigned to this faculty.</p>
                )}
                {courses.map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isDragging={activeDrag?._id === course._id}
                    scheduledDays={scheduledDaysMap[course._id] || []}
                    color={courseColors[course._id] || null}
                    usedColorIds={usedColorIds}
                    onColorChange={(c) => handleColorChange(course._id, c)}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Drag a course onto the grid. Click × on a block to remove it.
              </p>
            </div>

            {/* Weekly grid */}
            <div className="flex-1 overflow-auto" ref={gridRef}>
              <div className="min-w-max">
                {/* Header row */}
                <div className="flex">
                  <div className="w-16 shrink-0" />
                  {DAYS.map(day => (
                    <div
                      key={day}
                      className="flex-1 min-w-28 text-center text-xs font-bold text-slate-300 uppercase tracking-wider py-2 border-b border-slate-700 bg-slate-800/80"
                    >
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>

                {/* Time rows */}
                {TIME_SLOTS.map((time, ti) => (
                  <div key={time} className="flex">
                    {/* Time label — only on the hour */}
                    <div className="w-16 shrink-0 flex items-start justify-end pr-2 pt-0.5">
                      {time.endsWith(':00') && (
                        <span className="text-xs text-slate-500">{time}</span>
                      )}
                    </div>

                    {DAYS.map(day => {
                      const sched = grid[day]?.[time];
                      return (
                        <div key={day} className="flex-1 min-w-28 relative">
                          <GridCell day={day} time={time}>
                            {sched && (
                              <ScheduleBlock
                                schedule={sched}
                                onRemove={handleRemove}
                                color={courseColors[sched.course?._id] || null}
                              />
                            )}
                          </GridCell>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeDrag && (
              <div className="bg-blue-600 border border-blue-400 rounded-lg p-3 shadow-2xl w-48 opacity-90 cursor-grabbing">
                <p className="text-sm font-bold text-white">{activeDrag.courseCode}</p>
                <p className="text-xs text-blue-200 truncate">{activeDrag.courseName}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Drop confirmation modal */}
      <DropModal pending={pending} onConfirm={handleConfirm} onCancel={() => setPending(null)} />

    </div>
  );
}
