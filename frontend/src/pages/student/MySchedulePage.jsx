import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiClock, HiTrash, HiCheck, HiUpload, HiX, HiInformationCircle } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 7; h < 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

function formatTime12(t) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function parseTime(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/* ── Weekly Grid Calendar ── */
function WeeklyGrid({ availability, onToggle, isDragging, setIsDragging, dragMode, setDragMode }) {
  const gridRef = useRef(null);

  const isSlotAvailable = (day, time) => {
    return availability.some(a =>
      a.day === day && parseTime(a.startTime) <= parseTime(time) && parseTime(a.endTime) > parseTime(time)
    );
  };

  const handleMouseDown = (day, time) => {
    const available = isSlotAvailable(day, time);
    setDragMode(available ? 'remove' : 'add');
    setIsDragging(true);
    onToggle(day, time, available ? 'remove' : 'add');
  };

  const handleMouseEnter = (day, time) => {
    if (!isDragging) return;
    onToggle(day, time, dragMode);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalUp);
    return () => window.removeEventListener('mouseup', handleGlobalUp);
  }, []);

  return (
    <div className="card p-0 overflow-hidden select-none" ref={gridRef} onMouseUp={handleMouseUp}>
      {/* Day headers */}
      <div className="grid border-b border-surface-200 dark:border-surface-700" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
        <div className="p-2 bg-surface-50 dark:bg-surface-800/50" />
        {DAYS.map(day => (
          <div key={day} className="p-2 text-center text-[11px] font-bold text-surface-600 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 border-l border-surface-200/50 dark:border-surface-700/50">
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="max-h-[500px] overflow-y-auto">
        {TIME_SLOTS.map((time, ti) => {
          const isHour = time.endsWith(':00');
          return (
            <div key={time} className="grid" style={{ gridTemplateColumns: '60px repeat(6, 1fr)', height: 24 }}>
              <div className={`flex items-center justify-end pr-2 border-r border-surface-200/50 dark:border-surface-700/50 ${isHour ? 'border-t border-surface-100 dark:border-surface-800' : ''}`}>
                {isHour && <span className="text-[9px] text-surface-400">{formatTime12(time)}</span>}
              </div>
              {DAYS.map(day => {
                const available = isSlotAvailable(day, time);
                return (
                  <div
                    key={day}
                    onMouseDown={() => handleMouseDown(day, time)}
                    onMouseEnter={() => handleMouseEnter(day, time)}
                    className={`border-l border-surface-100/50 dark:border-surface-800/50 transition-colors cursor-pointer ${
                      isHour ? 'border-t border-surface-100 dark:border-surface-800' : ''
                    } ${
                      available
                        ? 'bg-emerald-400/30 dark:bg-emerald-500/20 hover:bg-emerald-400/50 dark:hover:bg-emerald-500/30'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function MySchedulePage() {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState('add');
  const [hasChanges, setHasChanges] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewSlots, setPreviewSlots] = useState(null);
  const fileRef = useRef();

  const fetchAvailability = async () => {
    try {
      const { data } = await api.get('/availability/me');
      // Convert slot objects to internal format
      setAvailability(data.map(s => ({ _id: s._id, day: s.day, startTime: s.startTime, endTime: s.endTime })));
    } catch { toast.error('Failed to load availability'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAvailability(); }, []);

  // Toggle a single 30-min cell
  const handleToggle = (day, time, mode) => {
    const timeEnd = (() => {
      const idx = TIME_SLOTS.indexOf(time);
      return idx < TIME_SLOTS.length - 1 ? TIME_SLOTS[idx + 1] : '21:00';
    })();

    setAvailability(prev => {
      if (mode === 'add') {
        // Check if already available at this time
        const exists = prev.some(a => a.day === day && parseTime(a.startTime) <= parseTime(time) && parseTime(a.endTime) > parseTime(time));
        if (exists) return prev;
        return [...prev, { day, startTime: time, endTime: timeEnd, _new: true }];
      } else {
        // Remove: filter out slots that cover this time
        return prev.filter(a => !(a.day === day && parseTime(a.startTime) <= parseTime(time) && parseTime(a.endTime) > parseTime(time)));
      }
    });
    setHasChanges(true);
  };

  // Merge adjacent slots for the same day before saving
  const mergeSlots = (slots) => {
    const merged = [];
    const byDay = {};
    slots.forEach(s => {
      if (!byDay[s.day]) byDay[s.day] = [];
      byDay[s.day].push(s);
    });

    Object.keys(byDay).forEach(day => {
      const sorted = byDay[day].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
      let current = { ...sorted[0] };

      for (let i = 1; i < sorted.length; i++) {
        if (parseTime(sorted[i].startTime) <= parseTime(current.endTime)) {
          // Merge overlapping/adjacent
          current.endTime = sorted[i].endTime > current.endTime ? sorted[i].endTime : current.endTime;
        } else {
          merged.push({ day: current.day, startTime: current.startTime, endTime: current.endTime });
          current = { ...sorted[i] };
        }
      }
      merged.push({ day: current.day, startTime: current.startTime, endTime: current.endTime });
    });

    return merged;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const merged = mergeSlots(availability);
      const { data } = await api.put('/availability/me', { slots: merged });
      setAvailability(data.slots || merged);
      setHasChanges(false);
      playSound('success');
      toast.success(`Availability saved — ${merged.length} time block${merged.length !== 1 ? 's' : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleClearDay = (day) => {
    setAvailability(prev => prev.filter(a => a.day !== day));
    setHasChanges(true);
    playSound('pop');
  };

  const handleClearAll = () => {
    setAvailability([]);
    setHasChanges(true);
    playSound('pop');
  };

  // ── Schedule Import (optional, privacy-safe) ──
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('studyLoad', file);

      const { data } = await api.post('/student-schedules/upload-study-load', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Convert extracted schedule entries into availability (free time = inverse of class time)
      const classBlocks = data.schedules || [];
      const suggestedAvail = [];

      DAYS.forEach(day => {
        const dayClasses = classBlocks
          .filter(c => c.day === day)
          .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

        if (dayClasses.length === 0) {
          // Entire day free — suggest 8AM-5PM
          suggestedAvail.push({ day, startTime: '08:00', endTime: '17:00' });
        } else {
          // Before first class
          if (parseTime(dayClasses[0].startTime) > parseTime('08:00')) {
            suggestedAvail.push({ day, startTime: '08:00', endTime: dayClasses[0].startTime });
          }
          // Between classes
          for (let i = 0; i < dayClasses.length - 1; i++) {
            const gapStart = dayClasses[i].endTime;
            const gapEnd = dayClasses[i + 1].startTime;
            if (parseTime(gapEnd) - parseTime(gapStart) >= 60) { // at least 1hr gap
              suggestedAvail.push({ day, startTime: gapStart, endTime: gapEnd });
            }
          }
          // After last class
          const lastEnd = dayClasses[dayClasses.length - 1].endTime;
          if (parseTime('20:00') - parseTime(lastEnd) >= 60) {
            suggestedAvail.push({ day, startTime: lastEnd, endTime: '20:00' });
          }
        }
      });

      setPreviewSlots(suggestedAvail);
      playSound('success');
      toast.success(`Found ${classBlocks.length} class blocks — generated ${suggestedAvail.length} free time suggestions`);

      // Immediately delete the schedule data from server (privacy)
      try {
        await api.delete(`/student-schedules/${data.schedules?.[0]?.student || ''}`);
      } catch { /* silent — schedule cleanup is best-effort */ }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import schedule');
    } finally { setImporting(false); }
  };

  const handleAcceptPreview = () => {
    setAvailability(previewSlots);
    setPreviewSlots(null);
    setHasChanges(true);
    playSound('success');
    toast.success('Suggested availability applied — review and save when ready');
  };

  // Count summary
  const slotCount = availability.length;
  const daysWithAvail = new Set(availability.map(a => a.day)).size;

  return (
    <div>
      <PageHeader title="My Availability" subtitle="Set when you're available for tutoring sessions" />

      {/* Instructions */}
      <div className="mb-5 p-4 rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/50">
        <div className="flex items-start gap-3">
          <HiInformationCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-primary-700 dark:text-primary-300">
              <span className="font-semibold">Click and drag</span> on the calendar below to mark when you're free for tutoring. Green cells = available. The scheduler will only suggest sessions within your available times.
            </p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {hasChanges && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 py-2"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiCheck className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Availability'}
          </motion.button>
        )}
        <button onClick={handleClearAll} className="btn-secondary flex items-center gap-1.5 py-2 text-xs">
          <HiTrash className="w-3.5 h-3.5" /> Clear All
        </button>
        {DAYS.map(day => {
          const has = availability.some(a => a.day === day);
          if (!has) return null;
          return (
            <button key={day} onClick={() => handleClearDay(day)} className="text-[10px] px-2 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              Clear {day.slice(0, 3)}
            </button>
          );
        })}

        <div className="ml-auto">
          <button
            onClick={() => setShowImport(!showImport)}
            className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <HiUpload className="w-3.5 h-3.5" /> Generate from Class Schedule (Optional)
          </button>
        </div>
      </div>

      {/* Schedule Import Panel */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="card border-dashed border-surface-300 dark:border-surface-600">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Generate Availability from Class Schedule</h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                    Upload your schedule slip to automatically suggest free time blocks. Your class schedule is <span className="font-medium text-primary-600 dark:text-primary-400">deleted immediately</span> after processing — only your confirmed availability is saved.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={importing}
                      className="btn-secondary flex items-center gap-2 text-xs py-2"
                    >
                      {importing ? <span className="w-3.5 h-3.5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" /> : <HiUpload className="w-3.5 h-3.5" />}
                      {importing ? 'Processing...' : 'Upload Schedule PDF'}
                    </button>
                    <span className="text-[10px] text-surface-400">PDF only · Processed once · Not stored</span>
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf" onChange={handleImport} className="hidden" />
                </div>
                <button onClick={() => setShowImport(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                  <HiX className="w-4 h-4 text-surface-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview from import */}
      <AnimatePresence>
        {previewSlots && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card mb-4 border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/10"
          >
            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
              Suggested Availability ({previewSlots.length} blocks)
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {previewSlots.map((s, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-white dark:bg-surface-800 border border-emerald-200 dark:border-emerald-700 text-surface-700 dark:text-surface-300">
                  {s.day.slice(0, 3)} {formatTime12(s.startTime)}–{formatTime12(s.endTime)}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleAcceptPreview} className="btn-primary text-xs py-2 flex items-center gap-1.5">
                <HiCheck className="w-3.5 h-3.5" /> Apply Suggestions
              </button>
              <button onClick={() => setPreviewSlots(null)} className="btn-secondary text-xs py-2">
                Discard
              </button>
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2">
              You can edit these after applying. Your class schedule has already been deleted from the server.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Calendar Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <WeeklyGrid
          availability={availability}
          onToggle={handleToggle}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          dragMode={dragMode}
          setDragMode={setDragMode}
        />
      )}

      {/* Summary */}
      {slotCount > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
          <p className="text-xs text-surface-500 dark:text-surface-400">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{daysWithAvail} day{daysWithAvail !== 1 ? 's' : ''}</span> with availability set.
            {hasChanges && <span className="text-amber-500 ml-2">• Unsaved changes</span>}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-[10px] text-surface-400">
          <span className="w-3 h-3 rounded bg-emerald-400/30 dark:bg-emerald-500/20 border border-emerald-400/50" /> Available
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-surface-400">
          <span className="w-3 h-3 rounded bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700" /> Not set
        </span>
      </div>
    </div>
  );
}
