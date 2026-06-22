import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCalendar, HiClock, HiCheck } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import WizardSteps from '../../components/WizardSteps';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

/* ── Time helpers ─────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_HEIGHT = 28;

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

/* ── Mini timetable component ─────────────────────────────── */
function MiniTimetable({ title, schedule, color, freeSlots = [], selectedSlot, onSelectSlot, minSlotOverride, maxSlotOverride }) {
  const gridEntries = {};
  const consumed = new Set();
  schedule.forEach(entry => {
    const si = TIME_SLOTS.indexOf(entry.startTime);
    if (si === -1) return;
    gridEntries[`${entry.day}-${si}`] = entry;
    const slots = durationSlots(entry.startTime, entry.endTime);
    for (let i = 1; i < slots; i++) consumed.add(`${entry.day}-${si + i}`);
  });

  const freeGridEntries = {};
  freeSlots.forEach(slot => {
    const si = TIME_SLOTS.indexOf(slot.startTime);
    if (si === -1) return;
    if (!freeGridEntries[`${slot.day}-${si}`]) {
      freeGridEntries[`${slot.day}-${si}`] = slot;
    }
  });

  const minSlot = minSlotOverride !== undefined ? minSlotOverride : 0;
  const maxSlot = maxSlotOverride !== undefined ? maxSlotOverride : TIME_SLOTS.length - 1;
  const visibleSlots = TIME_SLOTS.slice(minSlot, maxSlot + 1);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
        <p className="text-xs font-bold text-surface-700 dark:text-surface-300">{title}</p>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 360 }}>
          <div className="grid border-b border-surface-200 dark:border-surface-800" style={{ gridTemplateColumns: '44px repeat(6, 1fr)' }}>
            <div className="bg-surface-50 dark:bg-surface-800/30" />
            {DAYS.map(day => (
              <div key={day} className="text-center py-1.5 text-[10px] font-bold 
                                        text-surface-500 dark:text-surface-400 
                                        bg-surface-50 dark:bg-surface-800/30 
                                        border-l border-surface-200/50 dark:border-surface-700/50">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {visibleSlots.map((time, vi) => {
            const absIdx = minSlot + vi;
            const isHour = time.endsWith(':00');

            return (
              <div key={time} className="grid" style={{ gridTemplateColumns: '44px repeat(6, 1fr)', height: SLOT_HEIGHT }}>
                <div className={`flex items-start justify-end pr-1 pt-0.5 
                                 border-r border-surface-200/50 dark:border-surface-700/50 
                                 ${isHour ? 'border-b border-surface-200/30 dark:border-surface-700/30' : ''}`}>
                  {isHour && <span className="text-[9px] text-surface-400 leading-none whitespace-nowrap">{formatTime12(time)}</span>}
                </div>
                {DAYS.map(day => {
                  const key = `${day}-${absIdx}`;
                  if (consumed.has(key)) return <div key={day} className="border-l border-surface-200/30 dark:border-surface-700/30" style={{ height: SLOT_HEIGHT }} />;

                  const entry = gridEntries[key];
                  const freeEntry = freeGridEntries[key];

                  return (
                    <div key={day} className={`relative border-l border-surface-200/30 dark:border-surface-700/30 ${isHour ? 'border-b border-surface-100/50 dark:border-surface-800/50' : ''}`} style={{ height: SLOT_HEIGHT }}>
                      {entry && (
                        <div
                          className="absolute inset-x-0.5 rounded overflow-hidden z-10"
                          style={{
                            height: durationSlots(entry.startTime, entry.endTime) * SLOT_HEIGHT - 2,
                            top: 1,
                            backgroundColor: entry._color || color,
                            border: `1px solid ${(entry._color || color)}cc`,
                          }}
                        >
                          <div className="p-0.5 h-full overflow-hidden">
                            <p className="font-bold text-white leading-tight truncate" style={{ fontSize: 9 }}>{entry.label || 'Class'}</p>
                          </div>
                        </div>
                      )}
                      {freeEntry && !entry && (
                        <button
                          onClick={() => { playSound('pop'); onSelectSlot && onSelectSlot(freeEntry); }}
                          className={`absolute inset-x-0.5 rounded overflow-hidden z-10 transition-all cursor-pointer ${
                            selectedSlot?.key === freeEntry.key
                              ? 'ring-2 ring-emerald-400 bg-emerald-500/30 dark:bg-emerald-500/20'
                              : 'hover:ring-1 hover:ring-emerald-400/50'
                          }`}
                          style={{
                            height: SLOT_HEIGHT - 2,
                            top: 1,
                            backgroundColor: selectedSlot?.key === freeEntry.key ? undefined : 'rgba(16,185,129,0.1)',
                            border: '1px dashed #10b981',
                          }}
                        >
                          <div className="p-0.5 h-full flex items-center justify-center">
                            {selectedSlot?.key === freeEntry.key
                              ? <HiCheck className="w-3 h-3 text-emerald-500" />
                              : <p className="text-emerald-500 font-bold" style={{ fontSize: 8 }}>FREE</p>
                            }
                          </div>
                        </button>
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
  );
}

/* ── Main page ────────────────────────────────────────────── */
export default function BookSessionPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(params.get('courseId') || '');
  const [selectedTutor, setSelectedTutor] = useState(params.get('tutorId') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [venue, setVenue] = useState('');
  const [venueType, setVenueType] = useState('on-campus');
  const [notes, setNotes] = useState('');
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [booking, setBooking] = useState(false);

  const [mySchedule, setMySchedule] = useState([]);
  const [tutorSchedule, setTutorSchedule] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [tutorSessions, setTutorSessions] = useState([]);

  useEffect(() => {
    api.get(`/student-schedules/${user._id}`).then(({ data }) => setMySchedule(data));
    api.get(`/sessions/user/${user._id}`).then(({ data }) => {
      const sessionEntries = data.map(s => {
        const d = new Date(s.date);
        const dayIdx = d.getDay();
        const dayName = dayIdx === 0 ? 'Sunday' : DAYS[dayIdx - 1];
        return { day: dayName, startTime: s.startTime, endTime: s.endTime, label: `📚 ${s.courseCode || 'Session'}`, _color: '#ea580c' };
      });
      setMySessions(sessionEntries);
    }).catch(() => setMySessions([]));
  }, [user._id]);

  // Filter courses: enrolled (from schedule) + upcoming (year level and above)
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCodes, setEnrolledCodes] = useState(new Set());

  useEffect(() => {
    if (mySchedule.length === 0) { setCourses([]); setAllCourses([]); return; }

    api.get('/courses').then(({ data }) => {
      // Extract course codes from schedule labels
      const codes = new Set();
      mySchedule.forEach(entry => {
        // Match 5-digit EDP codes (e.g. "32094 - IT-SYSADMN32 (LAB)")
        const edpMatch = entry.label?.match(/^(\d{5})/);
        if (edpMatch) { codes.add(edpMatch[1]); return; }
        // Match alphanumeric course codes (e.g. "IT101 - Introduction to Computing")
        const alphaMatch = entry.label?.match(/^([A-Z]{2,}\d{3,})/i);
        if (alphaMatch) codes.add(alphaMatch[1].toUpperCase());
      });
      setEnrolledCodes(codes);

      // Enrolled courses: in their schedule
      const enrolled = data.filter(c => codes.has(c.courseCode));

      // Upcoming courses: year level above theirs, not already enrolled
      const upcoming = data.filter(c =>
        c.yearLevel && user.yearLevel && c.yearLevel > user.yearLevel && !codes.has(c.courseCode)
      );

      setCourses([...enrolled, ...upcoming]);
      setAllCourses(data);
    });
  }, [mySchedule]);

  useEffect(() => {
    if (!selectedCourse) { setTutors([]); return; }
    api.get(`/tutor-profiles/tutors?courseId=${selectedCourse}`).then(({ data }) => {
      setTutors(data.filter(t => t.tutor?._id !== user._id));
    });
  }, [selectedCourse, user._id]);

  useEffect(() => {
    if (!selectedTutor) { setTutorSchedule([]); setTutorSessions([]); return; }
    api.get(`/student-schedules/${selectedTutor}`).then(({ data }) => setTutorSchedule(data));
    api.get(`/sessions/user/${selectedTutor}`).then(({ data }) => {
      const tutorSessionEntries = data.map(s => {
        const d = new Date(s.date);
        const dayIdx = d.getDay();
        const dayName = dayIdx === 0 ? 'Sunday' : DAYS[dayIdx - 1];
        return { day: dayName, startTime: s.startTime, endTime: s.endTime, label: `📚 ${s.courseCode || 'Session'}`, _color: '#ea580c' };
      });
      setTutorSessions(tutorSessionEntries);
    }).catch(() => setTutorSessions([]));
  }, [selectedTutor]);

  const handleFindSlots = async () => {
    if (!selectedCourse || !selectedTutor) { toast.error('Select a course and tutor first'); return; }
    setLoadingSuggest(true);
    setSuggestions([]);
    setSelectedSlot(null);
    playSound('click');
    try {
      const { data } = await api.post('/sessions/suggest', {
        tutorId: selectedTutor, tuteeIds: [user._id], courseId: selectedCourse, durationMinutes: 60,
      });
      setSuggestions(data.suggestions);
      if (data.suggestions.length === 0) toast.error('No mutual free slots found.');
      else playSound('success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to find slots');
    } finally { setLoadingSuggest(false); }
  };

  const handleBook = async () => {
    if (!selectedSlot) { toast.error('Select a time slot from the timetable'); return; }
    if (!venue.trim()) { toast.error('Please enter a venue'); return; }
    setBooking(true);
    playSound('click');
    try {
      await api.post('/sessions', {
        tutorId: selectedTutor, tuteeIds: [user._id], courseId: selectedCourse,
        date: selectedSlot.date || new Date().toISOString(),
        startTime: selectedSlot.startTime, endTime: selectedSlot.endTime,
        venue, venueType, notes,
      });
      playSound('success');
      toast.success('Session booked successfully!');
      navigate('/student/my-sessions');
    } catch (err) {
      playSound('error');
      toast.error(err.response?.data?.message || 'Failed to book session');
    } finally { setBooking(false); }
  };

  const freeSlots = suggestions.flatMap(s =>
    s.slots.map(slot => ({
      day: s.day, date: s.date || null,
      startTime: slot.startTime, endTime: slot.endTime,
      key: `${s.day}-${slot.startTime}`, label: 'Available',
    }))
  );

  const freeSlotsForGrid = [];
  const seenGridKeys = new Set();
  freeSlots.forEach(s => {
    if (!seenGridKeys.has(s.key)) { seenGridKeys.add(s.key); freeSlotsForGrid.push(s); }
  });

  const selectedTutorProfile = tutors.find(t => t.tutor?._id === selectedTutor);
  const selectedCourseObj = courses.find(c => c._id === selectedCourse);

  return (
    <div>
      <PageHeader title="Book a Session" subtitle="Find mutual free time and schedule a study session" />

      {/* Wizard step indicator */}
      <WizardSteps
        steps={[
          { label: 'Select Course & Tutor' },
          { label: 'Pick a Time Slot' },
          { label: 'Confirm Booking' },
        ]}
        currentStep={selectedSlot ? 2 : (selectedTutor && suggestions.length > 0) ? 1 : 0}
      />

      {/* Step 1 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">1</span>
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">Select Course & Tutor</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Course</label>
            <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedTutor(''); setSuggestions([]); setSelectedSlot(null); }} className="input-field">
              <option value="">Select a course</option>
              {(() => {
                const enrolled = courses.filter(c => enrolledCodes.has(c.courseCode));
                const upcoming = courses.filter(c => !enrolledCodes.has(c.courseCode));
                return (
                  <>
                    {enrolled.length > 0 && (
                      <optgroup label={`Currently Enrolled (Year ${user.yearLevel})`}>
                        {enrolled.map(c => <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>)}
                      </optgroup>
                    )}
                    {upcoming.length > 0 && (
                      <optgroup label="Upcoming Courses">
                        {upcoming.map(c => <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName} (Year {c.yearLevel})</option>)}
                      </optgroup>
                    )}
                  </>
                );
              })()}
            </select>
          </div>
          <div>
            <label className="label">Tutor</label>
            <select value={selectedTutor} onChange={e => { setSelectedTutor(e.target.value); setSuggestions([]); setSelectedSlot(null); }} className="input-field" disabled={!selectedCourse}>
              <option value="">Select a tutor</option>
              {tutors.map(t => <option key={t._id} value={t.tutor?._id}>{t.tutor?.firstName} {t.tutor?.lastName}</option>)}
            </select>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFindSlots}
          disabled={!selectedCourse || !selectedTutor || loadingSuggest}
          className="btn-primary mt-4 flex items-center gap-2"
        >
          {loadingSuggest ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiClock className="w-4 h-4" />}
          {loadingSuggest ? 'Finding free slots...' : 'Find Available Slots'}
        </motion.button>
      </motion.div>

      {/* Step 2 — Timetable */}
      {(selectedTutor && (suggestions.length > 0 || mySchedule.length > 0)) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">2</span>
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">Pick a Time Slot</h3>
          </div>
          {suggestions.length > 0 && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">
              Green dashed slots are mutual free times. Click one to select it.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(() => {
              const myFullSchedule = [...mySchedule, ...mySessions];
              const tutorFullSchedule = [...tutorSchedule, ...tutorSessions];
              const allEntries = [...myFullSchedule, ...tutorFullSchedule, ...freeSlotsForGrid];
              const allIndices = new Set();
              allEntries.forEach(e => {
                const si = TIME_SLOTS.indexOf(e.startTime);
                if (si === -1) return;
                const slots = durationSlots(e.startTime, e.endTime);
                for (let i = 0; i < slots; i++) allIndices.add(si + i);
              });
              const minS = allIndices.size > 0 ? Math.max(0, Math.min(...allIndices) - 1) : 0;
              const maxS = allIndices.size > 0 ? Math.min(TIME_SLOTS.length - 1, Math.max(...allIndices) + 1) : 14;

              return (
                <>
                  <MiniTimetable title={`Your Schedule — ${user.firstName}`} schedule={myFullSchedule} color="#6366f1" freeSlots={freeSlotsForGrid} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} minSlotOverride={minS} maxSlotOverride={maxS} />
                  <div className="relative">
                    <div className="lg:absolute lg:inset-0 card flex flex-col overflow-hidden">
                      <p className="text-xs font-bold text-surface-700 dark:text-surface-300 mb-3 shrink-0">Available Slots</p>
                      {suggestions.length === 0 ? (
                        <p className="text-xs text-surface-400 flex-1 flex items-center justify-center">Click "Find Available Slots" to see options</p>
                      ) : freeSlots.length === 0 ? (
                        <p className="text-xs text-surface-400 flex-1 flex items-center justify-center">No mutual free slots found</p>
                      ) : (
                        <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0">
                          {freeSlots.map(slot => (
                            <button key={slot.key} onClick={() => { playSound('pop'); setSelectedSlot(slot); }}
                              className={`w-full text-left p-3 rounded-xl border transition-all ${
                                selectedSlot?.key === slot.key
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-sm'
                                  : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                              }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-surface-700 dark:text-surface-200">{slot.day}</span>
                                {selectedSlot?.key === slot.key && <HiCheck className="w-4 h-4 text-emerald-500" />}
                              </div>
                              <p className="text-sm font-bold text-surface-900 dark:text-white mt-0.5">{formatTime12(slot.startTime)} – {formatTime12(slot.endTime)}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <MiniTimetable title={`Tutor — ${selectedTutorProfile?.tutor?.firstName || 'Tutor'}`} schedule={tutorFullSchedule} color="#8b5cf6" freeSlots={freeSlotsForGrid} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} minSlotOverride={minS} maxSlotOverride={maxS} />
                </>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Step 3 — Confirm */}
      {selectedSlot && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">3</span>
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">Confirm Booking</h3>
          </div>

          <div className="rounded-xl p-4 mb-5 flex items-center gap-4 
                          bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
            <HiCalendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-white">
                {selectedSlot.day} · {formatTime12(selectedSlot.startTime)} – {formatTime12(selectedSlot.endTime)}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {selectedCourseObj?.courseCode} with {selectedTutorProfile?.tutor?.firstName} {selectedTutorProfile?.tutor?.lastName}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Venue Type</label>
              <div className="flex gap-3">
                {['on-campus', 'online'].map(t => (
                  <label key={t} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                    venueType === t
                      ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-400 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                      : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}>
                    <input type="radio" value={t} checked={venueType === t} onChange={() => setVenueType(t)} className="sr-only" />
                    <span className="text-sm font-medium capitalize">{t.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Venue / Meeting Link</label>
              <input value={venue} onChange={e => setVenue(e.target.value)} className="input-field" placeholder={venueType === 'online' ? 'e.g. Google Meet link' : 'e.g. Library Study Room 1'} />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" rows={2} placeholder="Topics to cover, materials needed..." />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleBook}
              disabled={booking}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {booking ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiCheck className="w-4 h-4" />}
              {booking ? 'Booking...' : 'Confirm Booking'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
