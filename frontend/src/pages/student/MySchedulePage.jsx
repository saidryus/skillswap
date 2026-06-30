import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiClock, HiUpload, HiDocumentText, HiCheckCircle, HiExclamation } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_HEIGHT = 40;

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
  '#7c3aed', '#059669', '#d97706', '#e11d48', '#0284c7',
];

export default function MySchedulePage() {
  const { user, refreshUser } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSchedule();
  }, [user._id]);

  const fetchSchedule = () => {
    setLoading(true);
    api.get(`/student-schedules/${user._id}`)
      .then(({ data }) => setSchedule(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('studyLoad', file);

    try {
      const { data } = await api.post('/student-schedules/upload-study-load', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message);
      setUploadResult({
        success: true,
        message: data.message,
        entriesCreated: data.entriesCreated,
        coursesMatched: data.coursesMatched,
        unmatchedCodes: data.unmatchedCodes,
      });
      fetchSchedule();
      refreshUser();
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      toast.error(msg);
      setUploadResult({ success: false, message: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // Build timetable grid data
  const gridEntries = {};
  const consumed = new Set();
  const labelColorMap = {};
  let colorIdx = 0;

  // Assign colors by unique label (so same subject on different days gets same color)
  schedule.forEach(entry => {
    if (!labelColorMap[entry.label]) {
      labelColorMap[entry.label] = BLOCK_COLORS[colorIdx % BLOCK_COLORS.length];
      colorIdx++;
    }
  });

  schedule.forEach(entry => {
    const si = TIME_SLOTS.indexOf(entry.startTime);
    if (si === -1) return;
    const dayIdx = DAYS.indexOf(entry.day);
    if (dayIdx === -1) return;
    const key = `${entry.day}-${si}`;
    gridEntries[key] = entry;
    const slots = durationSlots(entry.startTime, entry.endTime);
    for (let i = 1; i < slots; i++) consumed.add(`${entry.day}-${si + i}`);
  });

  // Determine visible time range
  const usedSlots = new Set();
  schedule.forEach(entry => {
    const si = TIME_SLOTS.indexOf(entry.startTime);
    if (si === -1) return;
    const slots = durationSlots(entry.startTime, entry.endTime);
    for (let i = 0; i < slots; i++) usedSlots.add(si + i);
  });
  const minSlot = usedSlots.size > 0 ? Math.max(0, Math.min(...usedSlots) - 1) : 0;
  const maxSlot = usedSlots.size > 0 ? Math.min(TIME_SLOTS.length - 1, Math.max(...usedSlots) + 1) : TIME_SLOTS.length - 1;
  const visibleSlots = TIME_SLOTS.slice(minSlot, maxSlot + 1);

  // Determine which days have entries
  const activeDays = DAYS.filter(day => schedule.some(e => e.day === day));
  const displayDays = activeDays.length > 0 ? activeDays : DAYS.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="My Schedule"
        subtitle="Your weekly class timetable — used for conflict-free session matching"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : schedule.length === 0 ? (
        /* Upload study load prompt */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div
            className={`card p-8 text-center border-2 border-dashed transition-colors cursor-pointer
              ${dragOver
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                : 'border-surface-300 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-600'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-3 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-surface-600 dark:text-surface-300 font-medium">Processing your study load...</p>
                <p className="text-xs text-surface-400">Extracting schedule from document</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mx-auto mb-4">
                  <HiUpload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                  Upload Your Study Load
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                  Upload your schedule slip PDF from the enrollment system. We'll automatically read your subjects and schedule.
                </p>
                <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
                  <HiDocumentText className="w-5 h-5" />
                  <span>Drop file here or click to browse</span>
                </div>
                <p className="text-xs text-surface-400 mt-3">Accepts PDF, JPG, PNG (max 5MB)</p>
              </>
            )}
          </div>

          {uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl border ${
                uploadResult.success
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {uploadResult.success ? (
                  <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <HiExclamation className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    uploadResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>{uploadResult.message}</p>
                  {uploadResult.success && uploadResult.unmatchedCodes?.length > 0 && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                      Note: Courses {uploadResult.unmatchedCodes.join(', ')} are not yet in the system but were still added to your schedule.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Timetable view */
        <>
          {/* Header bar with re-upload */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {schedule.length} class {schedule.length === 1 ? 'entry' : 'entries'} across {activeDays.length} {activeDays.length === 1 ? 'day' : 'days'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2 text-sm py-1.5"
            >
              <HiUpload className="w-4 h-4" /> Re-upload Study Load
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-primary-50 dark:bg-primary-950/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-sm text-primary-700 dark:text-primary-300">Processing new study load...</p>
            </div>
          )}

          {uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg border ${
                uploadResult.success
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {uploadResult.success ? (
                  <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <HiExclamation className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <p className={`text-sm ${uploadResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {uploadResult.message}
                </p>
              </div>
            </motion.div>
          )}

          {/* Timetable grid */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <div style={{ minWidth: 700 }}>
                {/* Day headers */}
                <div className="grid border-b border-surface-200 dark:border-surface-700" style={{ gridTemplateColumns: `64px repeat(${displayDays.length}, 1fr)` }}>
                  <div className="bg-surface-100 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700/40" />
                  {displayDays.map(day => (
                    <div key={day} className="text-center py-3 text-xs font-bold text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700/40 uppercase tracking-wide">
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>

                {/* Time rows */}
                {visibleSlots.map((time, vi) => {
                  const absIdx = minSlot + vi;
                  const isHour = time.endsWith(':00');

                  return (
                    <div key={time} className="grid" style={{ gridTemplateColumns: `64px repeat(${displayDays.length}, 1fr)`, height: SLOT_HEIGHT }}>
                      {/* Time label */}
                      <div className={`flex items-start justify-end pr-2 pt-0.5 border-r border-surface-200 dark:border-surface-700/40 ${isHour ? 'border-b border-surface-200 dark:border-surface-700/30' : ''}`}>
                        {isHour && <span className="text-[11px] text-surface-400 dark:text-surface-500 leading-none font-medium">{formatTime12(time)}</span>}
                      </div>

                      {/* Day cells */}
                      {displayDays.map(day => {
                        const key = `${day}-${absIdx}`;
                        if (consumed.has(key)) return <div key={day} className={`border-r border-surface-200 dark:border-surface-700/40 ${isHour ? 'border-b border-surface-200 dark:border-surface-700/30' : ''}`} style={{ height: SLOT_HEIGHT }} />;

                        const entry = gridEntries[key];
                        return (
                          <div key={day} className={`relative border-r border-surface-200 dark:border-surface-700/40 ${isHour ? 'border-b border-surface-200 dark:border-surface-700/30' : ''}`} style={{ height: SLOT_HEIGHT }}>
                            {entry && (
                              <div
                                className="absolute inset-x-0.5 rounded-md text-xs overflow-hidden z-10 shadow-sm"
                                style={{
                                  height: durationSlots(entry.startTime, entry.endTime) * SLOT_HEIGHT - 2,
                                  top: 1,
                                  backgroundColor: labelColorMap[entry.label],
                                  border: `1px solid ${labelColorMap[entry.label]}cc`,
                                }}
                              >
                                <div className="p-1.5 h-full overflow-hidden">
                                  <p className="font-bold text-white leading-tight truncate text-[11px]">{entry.label || 'Class'}</p>
                                  <p className="text-white/70 leading-tight" style={{ fontSize: 10 }}>{formatTime12(entry.startTime)} – {formatTime12(entry.endTime)}</p>
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
          </div>

          {/* Legend */}
          <div className="mt-4 card">
            <p className="text-xs font-semibold text-surface-600 dark:text-surface-300 mb-2 uppercase tracking-wide">Subjects</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(labelColorMap).map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-50 dark:bg-surface-800">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-surface-700 dark:text-surface-300 truncate max-w-[200px]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
