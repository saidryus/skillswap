import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { HiPrinter, HiDownload, HiTrash, HiX, HiExclamation, HiBeaker } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ── Constants ─────────────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 7; h < 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

const SLOT_HEIGHT = 36;

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function durationSlots(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 30;
}

/* ── Draggable lab course card ──────────────────────────────────── */
function LabCourseCard({ course, isDragging, scheduledDays = [] }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `lab-course-${course._id}`,
    data: { type: 'course', course },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px,${transform.y}px)`, zIndex: 999 }
    : {};

  const dayAbbr = { Monday: 'M', Tuesday: 'T', Wednesday: 'W', Thursday: 'Th', Friday: 'F', Saturday: 'Sa' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`select-none cursor-grab active:cursor-grabbing rounded-lg p-3 mb-2 border transition-all
        ${isDragging ? 'opacity-40' : 'opacity-100'}
        bg-purple-900/40 border-purple-700/60 hover:border-purple-400`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <HiBeaker className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <p className="text-sm font-semibold text-slate-100">{course.courseCode}</p>
      </div>
      <p className="text-xs text-slate-400 truncate">{course.courseName}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded px-1.5 py-0.5">
          Lab · {course.units} units
        </span>
        {scheduledDays.length > 0 && (
          <div className="flex gap-0.5">
            {scheduledDays.map(d => (
              <span key={d} className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded px-1">
                {dayAbbr[d] || d.slice(0, 2)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Droppable grid cell ────────────────────────────────────────── */
function GridCell({ day, time, children, hasConflict }) {
  const id = `lab-cell-${day}-${time}`;
  const { setNodeRef, isOver } = useDroppable({ id, data: { day, time } });

  return (
    <div
      ref={setNodeRef}
      className={`border-b border-r border-slate-700/40 relative transition-colors
        ${isOver ? (hasConflict ? 'bg-red-500/20' : 'bg-purple-500/15') : ''}
      `}
      style={{ height: SLOT_HEIGHT }}
    >
      {children}
    </div>
  );
}

/* ── Placed schedule block ──────────────────────────────────────── */
function ScheduleBlock({ schedule, onRemove }) {
  const slots = durationSlots(schedule.startTime, schedule.endTime);

  return (
    <div
      className="absolute inset-x-0.5 rounded border text-xs overflow-hidden z-10 bg-purple-600/80 border-purple-400"
      style={{ height: slots * SLOT_HEIGHT - 2, top: 1 }}
    >
      <div className="flex items-start justify-between p-1 h-full">
        <div className="overflow-hidden">
          <div className="flex items-center gap-1">
            <HiBeaker className="w-3 h-3 text-purple-200 shrink-0" />
            <p className="font-bold text-white leading-tight truncate">{schedule.course?.courseCode}</p>
          </div>
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
  const [duration, setDuration] = useState('180'); // default 3h for lab

  if (!pending) return null;

  const endTime = addMinutes(pending.time, parseInt(duration));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-slate-800 border border-purple-700/50 rounded-xl p-6 w-80 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-1">
          <HiBeaker className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-semibold text-slate-100">Place Lab Schedule</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          <span className="text-purple-400 font-medium">{pending.course.courseCode}</span>
          {' '}on {pending.day} at {pending.time}
        </p>

        <div className="space-y-3">
          <div>
            <label className="label">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className="input-field">
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="150">2.5 hours</option>
              <option value="180">3 hours</option>
              <option value="210">3.5 hours</option>
              <option value="240">4 hours</option>
              <option value="270">4.5 hours</option>
              <option value="300">5 hours</option>
            </select>
          </div>
          <div>
            <label className="label">Laboratory Room</label>
            <input
              value={room}
              onChange={e => setRoom(e.target.value)}
              className="input-field"
              placeholder="e.g. Computer Lab 1"
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
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Place
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function LabSchedulesPage() {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [labCourses, setLabCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeDrag, setActiveDrag] = useState(null);
  const [pending, setPending] = useState(null);
  const [conflictError, setConflictError] = useState(null);
  const [semester, setSemester] = useState('1st Semester');
  const [schoolYear, setSchoolYear] = useState('2024-2025');
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

  /* fetch lab courses for selected faculty */
  useEffect(() => {
    if (!selectedFaculty) { setLabCourses([]); return; }
    api.get('/courses').then(({ data }) => {
      // Filter: assigned to this faculty AND type is laboratory
      const labs = data.filter(
        c => c.faculty?._id === selectedFaculty &&
          (c.type === 'laboratory' || c.courseCode?.toLowerCase().includes('lab'))
      );
      setLabCourses(labs);
    });
  }, [selectedFaculty]);

  /* schedules for the selected faculty's lab courses only */
  const labCourseIds = labCourses.map(c => c._id);
  const placedSchedules = schedules.filter(s =>
    labCourseIds.includes(s.course?._id || s.course)
  );

  /* courseId → days already scheduled */
  const scheduledDaysMap = {};
  placedSchedules.forEach(s => {
    const cid = s.course?._id || s.course;
    if (!scheduledDaysMap[cid]) scheduledDaysMap[cid] = [];
    if (!scheduledDaysMap[cid].includes(s.day)) scheduledDaysMap[cid].push(s.day);
  });

  /* day → time → schedule lookup */
  const grid = {};
  placedSchedules.forEach(s => {
    if (!grid[s.day]) grid[s.day] = {};
    grid[s.day][s.startTime] = s;
  });

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
      await api.post('/schedules', {
        course: course._id,
        day,
        startTime: time,
        endTime,
        room,
        semester,
        schoolYear,
      });
      const sRes = await api.get('/schedules');
      setSchedules(sRes.data);
      setPending(null);
      toast.success(`${course.courseCode} lab scheduled on ${day} ${time}–${endTime}`);
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
      toast.success('Lab schedule removed');
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
    doc.text('TROPHE UNIVERSITY — Laboratory Schedule', 148, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Faculty: ${facName}   |   ${semester}   |   S.Y. ${schoolYear}`, 148, 22, { align: 'center' });

    const rows = placedSchedules.map(s => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
      return [
        s.course?.courseCode || '',
        s.course?.courseName || '',
        s.day,
        `${s.startTime} – ${s.endTime}`,
        s.room || 'TBA',
        s.course?.units ?? '',
        `${hrs}h`,
      ];
    });
    rows.sort((a, b) => DAYS.indexOf(a[2]) - DAYS.indexOf(b[2]) || a[3].localeCompare(b[3]));

    const seenIds = new Set();
    let totalUnits = 0;
    placedSchedules.forEach(s => {
      const cid = s.course?._id;
      if (cid && !seenIds.has(cid)) { seenIds.add(cid); totalUnits += s.course?.units || 0; }
    });
    const totalHrs = placedSchedules.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
    }, 0);

    autoTable(doc, {
      startY: 28,
      head: [['Code', 'Course Name', 'Day', 'Time', 'Lab Room', 'Units', 'Hrs']],
      body: rows,
      foot: [['', 'TOTALS', '', '', '', totalUnits, `${totalHrs}h/wk`]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [126, 34, 206], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [245, 243, 255], textColor: [88, 28, 135], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 245, 255] },
    });

    doc.save(`LabSchedule_${facName.replace(' ', '_')}_${semester}.pdf`);
  }

  function handlePrint() {
    const fac = faculty.find(f => f._id === selectedFaculty);
    const facName = fac ? `${fac.firstName} ${fac.lastName}` : '';

    const sorted = [...placedSchedules].sort(
      (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime)
    );

    const seenIds = new Set();
    let totalUnits = 0;
    placedSchedules.forEach(s => {
      const cid = s.course?._id;
      if (cid && !seenIds.has(cid)) { seenIds.add(cid); totalUnits += s.course?.units || 0; }
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
      return `
        <tr>
          <td>${s.course?.courseCode || ''}</td>
          <td>${s.course?.courseName || ''}</td>
          <td>${s.day}</td>
          <td>${s.startTime} – ${s.endTime}</td>
          <td>${s.room || 'TBA'}</td>
          <td style="text-align:center">${s.course?.units ?? ''}</td>
          <td style="text-align:center">${hrs}h</td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html><html>
      <head>
        <title>Lab Schedule – ${facName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
          h2 { text-align: center; margin-bottom: 4px; }
          .sub { text-align:center; color:#555; margin-bottom:16px; font-size:13px; }
          .badge { display:inline-block; background:#f3e8ff; color:#7e22ce; font-size:11px;
                   font-weight:600; padding:2px 8px; border-radius:999px; margin-bottom:12px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #7e22ce; color: white; padding: 8px 10px; text-align: left; }
          td { padding: 7px 10px; border-bottom: 1px solid #e9d5ff; }
          tr:nth-child(even) td { background: #faf5ff; }
          tfoot td { background: #f3e8ff; font-weight: bold; border-top: 2px solid #d8b4fe; }
          @page { size: A4 landscape; margin: 15mm; }
        </style>
      </head>
      <body>
        <h2>TROPHE UNIVERSITY — Laboratory Schedule</h2>
        <p class="sub">Faculty: ${facName} &nbsp;|&nbsp; ${semester} &nbsp;|&nbsp; S.Y. ${schoolYear}</p>
        <div style="text-align:center"><span class="badge">🧪 Laboratory Courses Only</span></div>
        <table>
          <thead>
            <tr>
              <th>Code</th><th>Course Name</th><th>Day</th>
              <th>Time</th><th>Lab Room</th>
              <th style="text-align:center">Units</th><th style="text-align:center">Hrs</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align:right">TOTALS:</td>
              <td style="text-align:center">${totalUnits}</td>
              <td style="text-align:center">${totalHrs}h/wk</td>
            </tr>
          </tfoot>
        </table>
      </body></html>
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
      <PageHeader
        title="Lab Schedule Planner"
        subtitle="Drag laboratory courses onto the weekly grid"
      />

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
        <div className="card flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <HiBeaker className="w-10 h-10 opacity-30" />
          <p>Select a faculty member to view their laboratory courses</p>
        </div>
      ) : labCourses.length === 0 ? (
        <div className="card flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <HiBeaker className="w-10 h-10 opacity-30" />
          <p>This faculty has no laboratory courses assigned.</p>
          <p className="text-xs text-slate-500">
            Set a course's type to <span className="text-purple-400 font-medium">laboratory</span> in the Courses page to see it here.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 flex-1 min-h-0">

            {/* Lab course panel */}
            <div className="w-52 shrink-0 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <HiBeaker className="w-4 h-4 text-purple-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Lab Courses ({labCourses.length})
                </p>
              </div>
              <div className="flex-1 overflow-y-auto pr-1">
                {labCourses.map(course => (
                  <LabCourseCard
                    key={course._id}
                    course={course}
                    isDragging={activeDrag?._id === course._id}
                    scheduledDays={scheduledDaysMap[course._id] || []}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Drag a lab course onto the grid. Default duration is 3 hours.
              </p>
            </div>

            {/* Weekly grid */}
            <div className="flex-1 overflow-auto" ref={gridRef}>
              <div className="min-w-max">
                {/* Header */}
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
                {TIME_SLOTS.map(time => (
                  <div key={time} className="flex">
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
                              <ScheduleBlock schedule={sched} onRemove={handleRemove} />
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
              <div className="bg-purple-600 border border-purple-400 rounded-lg p-3 shadow-2xl w-48 opacity-90 cursor-grabbing">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <HiBeaker className="w-3.5 h-3.5 text-purple-200" />
                  <p className="text-sm font-bold text-white">{activeDrag.courseCode}</p>
                </div>
                <p className="text-xs text-purple-200 truncate">{activeDrag.courseName}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <DropModal pending={pending} onConfirm={handleConfirm} onCancel={() => setPending(null)} />
    </div>
  );
}
