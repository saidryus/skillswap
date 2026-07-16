import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCalendar, HiClock, HiCheck, HiChevronLeft, HiChevronRight, HiLocationMarker } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import WizardSteps from '../../components/WizardSteps';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

/* ── Helpers ─────────────────────────────────────────── */
function formatTime12(t) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/* ── Calendar Component ─────────────────────────────── */
function DateCalendar({ selectedDate, onSelectDate, holidays = [], disabledDates = [] }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const holidaySet = new Set(holidays.map(h => h.date));

  const prevMonth = () => {
    setViewMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const days = [];
  // Empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(viewMonth.year, viewMonth.month, day);
    const isSunday = dateObj.getDay() === 0;
    const isPast = dateObj < today;
    const isHoliday = holidaySet.has(dateStr);
    const isDisabled = isPast || isSunday || isHoliday;
    const isSelected = selectedDate === dateStr;
    const isToday = dateObj.getTime() === today.getTime();

    const holidayInfo = holidays.find(h => h.date === dateStr);

    days.push(
      <button
        key={day}
        disabled={isDisabled}
        onClick={() => { playSound('click'); onSelectDate(dateStr); }}
        title={holidayInfo ? holidayInfo.name : isSunday ? 'Sunday (no sessions)' : ''}
        className={`relative w-full aspect-square rounded-xl text-sm font-medium transition-all duration-200 ${
          isSelected
            ? 'bg-primary-500 text-white shadow-glow-sm scale-105'
            : isDisabled
              ? 'text-surface-300 dark:text-surface-600 cursor-not-allowed'
              : isToday
                ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-950/50'
                : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:scale-105'
        }`}
      >
        {day}
        {isHoliday && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-400" />
        )}
      </button>
    );
  }

  return (
    <div className="card">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <HiChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-300" />
        </button>
        <h3 className="text-sm font-bold text-surface-900 dark:text-white">{monthLabel}</h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <HiChevronRight className="w-5 h-5 text-surface-600 dark:text-surface-300" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-surface-400 uppercase">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-surface-200 dark:border-surface-700">
        <span className="flex items-center gap-1.5 text-[10px] text-surface-400">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Holiday
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-surface-400">
          <span className="w-2 h-2 rounded-full bg-surface-300 dark:bg-surface-600" /> Unavailable
        </span>
      </div>
    </div>
  );
}

/* ── Time Slot List ─────────────────────────────────── */
function TimeSlotList({ slots, selectedSlot, onSelectSlot, loading }) {
  if (loading) return (
    <div className="card flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-xs text-surface-400">Finding available slots...</p>
      </div>
    </div>
  );

  if (slots.length === 0) return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
        <HiClock className="w-6 h-6 text-surface-400" />
      </div>
      <p className="text-sm text-surface-500 dark:text-surface-400">No available time slots for this date</p>
      <p className="text-xs text-surface-400 mt-1">Try selecting a different date</p>
    </div>
  );

  return (
    <div className="card">
      <h4 className="text-sm font-bold text-surface-900 dark:text-white mb-3">
        Available Time Slots
        <span className="text-surface-400 font-normal ml-2">({slots.length} found)</span>
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
        {slots.map((slot, idx) => (
          <motion.button
            key={slot.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playSound('pop'); onSelectSlot(slot); }}
            className={`p-3 rounded-xl border text-center transition-all duration-200 ${
              selectedSlot?.key === slot.key
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-sm'
                : 'bg-surface-50 dark:bg-surface-800/50 border-surface-200/50 dark:border-surface-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10'
            }`}
          >
            <p className={`text-sm font-semibold ${
              selectedSlot?.key === slot.key ? 'text-emerald-700 dark:text-emerald-300' : 'text-surface-800 dark:text-surface-100'
            }`}>
              {formatTime12(slot.startTime)}
            </p>
            <p className={`text-xs mt-0.5 ${
              selectedSlot?.key === slot.key ? 'text-emerald-500 dark:text-emerald-400' : 'text-surface-400'
            }`}>
              to {formatTime12(slot.endTime)}
            </p>
            {selectedSlot?.key === slot.key && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                <HiCheck className="w-4 h-4 text-emerald-500 mx-auto" />
              </motion.div>
            )}
          </motion.button>
        ))}
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
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [venue, setVenue] = useState('');
  const [venueType, setVenueType] = useState('on-campus');
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [enrolledCodes, setEnrolledCodes] = useState(new Set());

  // Fetch schedule + holidays
  useEffect(() => {
    api.get(`/student-schedules/${user._id}`).then(({ data }) => setMySchedule(data)).catch(() => {});
    const year = new Date().getFullYear();
    api.get(`/sessions/holidays?year=${year}`).then(({ data }) => setHolidays(data)).catch(() => {});
    if (new Date().getMonth() >= 10) {
      api.get(`/sessions/holidays?year=${year + 1}`).then(({ data }) => setHolidays(prev => [...prev, ...data])).catch(() => {});
    }
  }, [user._id]);

  // Filter courses — use schedule-linked courses when available, fall back to year-level courses
  useEffect(() => {
    api.get('/courses').then(({ data }) => {
      if (mySchedule.length > 0) {
        const enrolledIds = new Set();
        mySchedule.forEach(entry => {
          if (entry.course) {
            const courseId = typeof entry.course === 'object' ? entry.course._id : entry.course;
            if (courseId) enrolledIds.add(courseId);
          }
        });
        setEnrolledCodes(enrolledIds);
        const enrolled = data.filter(c => enrolledIds.has(c._id));
        const previous = data.filter(c => {
          if (enrolledIds.has(c._id)) return false;
          if (!c.yearLevel || !user.yearLevel) return false;
          if (c.yearLevel < user.yearLevel) return true;
          if (c.yearLevel === user.yearLevel && user.currentSemester === 2 && c.semester === 1) return true;
          return false;
        });
        setCourses([...enrolled, ...previous]);
      } else {
        // No schedule — show all courses up to student's year level
        const available = data.filter(c => {
          if (!user.yearLevel) return true;
          if (c.yearLevel < user.yearLevel) return true;
          if (c.yearLevel === user.yearLevel) return true;
          return false;
        });
        setCourses(available);
      }
    });
  }, [mySchedule, user.yearLevel]);

  // Fetch tutors when course changes
  useEffect(() => {
    if (!selectedCourse) { setTutors([]); return; }
    api.get(`/tutor-profiles/tutors?courseId=${selectedCourse}`).then(({ data }) => {
      setTutors(data.filter(t => t.tutor?._id !== user._id));
    });
  }, [selectedCourse, user._id]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedTutor) { setSlots([]); return; }
    setLoadingSlots(true);
    setSelectedSlot(null);
    api.post('/sessions/suggest', {
      tutorId: selectedTutor,
      tuteeIds: [user._id],
      courseId: selectedCourse,
      date: selectedDate,
      durationMinutes: 60,
    }).then(({ data }) => {
      const daySlots = data.suggestions.flatMap(s =>
        s.slots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: selectedDate,
          day: s.day,
          key: `${selectedDate}-${slot.startTime}`,
        }))
      );
      setSlots(daySlots);
      if (daySlots.length === 0) toast('No mutual free slots on this date', { icon: '📅' });
      else playSound('success');
    }).catch(err => {
      toast.error(err.response?.data?.message || 'Failed to find slots');
      setSlots([]);
    }).finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedTutor, selectedCourse, user._id]);

  const handleBook = async () => {
    if (!selectedSlot) { toast.error('Select a time slot'); return; }
    if (!venue.trim()) { toast.error('Please enter a venue'); return; }
    setBooking(true);
    playSound('click');
    try {
      await api.post('/sessions', {
        tutorId: selectedTutor,
        tuteeIds: [user._id],
        courseId: selectedCourse,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
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

  const selectedTutorProfile = tutors.find(t => t.tutor?._id === selectedTutor);
  const selectedCourseObj = courses.find(c => c._id === selectedCourse);

  const currentStep = selectedSlot ? 2 : (selectedDate && selectedTutor) ? 1 : 0;

  return (
    <div>
      <PageHeader title="Book a Session" subtitle="Pick a date and time for your study session" />

      {/* No schedule info banner — soft nudge, not a gate */}
      {mySchedule.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-5 border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
              <HiCalendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Schedule not uploaded</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                Upload your class schedule so the system can find mutual free time with your tutor. You can still browse and book without it.
              </p>
              <a href="/student/my-availability" className="inline-block mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 underline hover:text-amber-900 dark:hover:text-amber-100">
                Upload your schedule →
              </a>
            </div>
          </div>
        </motion.div>
      )}

      <WizardSteps
          steps={[
            { label: 'Select Course & Tutor' },
            { label: 'Pick a Date & Time' },
            { label: 'Confirm Booking' },
          ]}
          currentStep={currentStep}
        />

        {/* Step 1: Course & Tutor selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">1</span>
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">Select Course & Tutor</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Course</label>
              <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedTutor(''); setSelectedDate(''); setSlots([]); setSelectedSlot(null); }} className="input-field">
                <option value="">Select a course</option>
                {(() => {
                  const enrolled = courses.filter(c => enrolledCodes.has(c._id));
                  const previous = courses.filter(c => !enrolledCodes.has(c._id));
                  const previousByYear = {};
                  previous.forEach(c => {
                    const yr = c.yearLevel || 0;
                    if (!previousByYear[yr]) previousByYear[yr] = [];
                    previousByYear[yr].push(c);
                  });
                  return (
                    <>
                      {enrolled.length > 0 && (
                        <optgroup label={`Currently Enrolled (Year ${user.yearLevel})`}>
                          {enrolled.map(c => <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>)}
                        </optgroup>
                      )}
                      {Object.keys(previousByYear).sort((a, b) => b - a).map(yr => (
                        <optgroup key={yr} label={`Year ${yr} Subjects`}>
                          {previousByYear[yr].map(c => <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>)}
                        </optgroup>
                      ))}
                    </>
                  );
                })()}
              </select>
            </div>
            <div>
              <label className="label">Tutor</label>
              <select value={selectedTutor} onChange={e => { setSelectedTutor(e.target.value); setSelectedDate(''); setSlots([]); setSelectedSlot(null); }} className="input-field" disabled={!selectedCourse}>
                <option value="">Select a tutor</option>
                {tutors.map(t => (
                  <option key={t._id} value={t.tutor?._id}>
                    {t.tutor?.firstName} {t.tutor?.lastName} — Score: {t.competencyScore || 0}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Step 2: Date & Time */}
        {selectedTutor && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">2</span>
              <h3 className="text-sm font-bold text-surface-900 dark:text-white">Pick a Date & Time</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Calendar */}
              <DateCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                holidays={holidays}
              />

              {/* Time slots */}
              <div>
                {selectedDate ? (
                  <>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">
                      Showing available slots for <span className="font-semibold text-surface-700 dark:text-surface-200">{formatDateLabel(selectedDate)}</span>
                    </p>
                    <TimeSlotList
                      slots={slots}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      loading={loadingSlots}
                    />
                  </>
                ) : (
                  <div className="card flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                      <HiCalendar className="w-6 h-6 text-surface-400" />
                    </div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Select a date on the calendar</p>
                    <p className="text-xs text-surface-400 mt-1">to see available time slots</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        <AnimatePresence>
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">3</span>
                <h3 className="text-sm font-bold text-surface-900 dark:text-white">Confirm Booking</h3>
              </div>

              {/* Summary */}
              <div className="rounded-xl p-4 mb-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <HiCalendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-surface-900 dark:text-white">
                      {formatDateLabel(selectedSlot.date)} · {formatTime12(selectedSlot.startTime)} – {formatTime12(selectedSlot.endTime)}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {selectedCourseObj?.courseCode} with {selectedTutorProfile?.tutor?.firstName} {selectedTutorProfile?.tutor?.lastName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Venue Type</label>
                  <div className="flex gap-3">
                    {['on-campus', 'online'].map(t => (
                      <button key={t} type="button" onClick={() => setVenueType(t)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                        venueType === t
                          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-400 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                          : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:border-surface-300 dark:hover:border-surface-600'
                      }`}>
                        <HiLocationMarker className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">{t.replace('-', ' ')}</span>
                      </button>
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
                  disabled={booking || !venue.trim()}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  {booking ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiCheck className="w-5 h-5" />
                  )}
                  {booking ? 'Booking...' : 'Confirm Session'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
