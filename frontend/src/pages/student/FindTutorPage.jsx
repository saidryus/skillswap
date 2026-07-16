import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiStar, HiCalendar, HiChevronDown, HiChevronLeft, HiChevronRight, HiCheck, HiClock, HiX, HiLocationMarker } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import CompetencyTooltip from '../../components/CompetencyTooltip';
import { useAuth } from '../../context/AuthContext';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';
import toast from 'react-hot-toast';

/* ── Helpers ── */
function formatTime12(t) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/* ── Collapsible course section ── */
function CourseSection({ label, courses, selectedCourse, onSelect, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasSelection = courses.some(c => c._id === selectedCourse);

  return (
    <div className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <button
        onClick={() => { setIsOpen(!isOpen); playSound('click'); }}
        className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
          isOpen ? 'bg-primary-50 dark:bg-primary-950/30'
            : hasSelection ? 'bg-emerald-50 dark:bg-emerald-950/20'
            : 'bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isOpen ? 'text-primary-600 dark:text-primary-400' :
            hasSelection ? 'text-emerald-600 dark:text-emerald-400' :
            'text-surface-500 dark:text-surface-400'
          }`}>{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 font-medium">{courses.length}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <HiChevronDown className="w-4 h-4 text-surface-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="p-3 border-t border-surface-200/50 dark:border-surface-700/50 bg-white dark:bg-surface-900">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {courses.map(c => (
                  <motion.button key={c._id} whileTap={{ scale: 0.95 }} onClick={() => onSelect(c._id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      selectedCourse === c._id
                        ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700 shadow-glow-sm'
                        : 'bg-surface-50 dark:bg-surface-800/50 border-surface-200/50 dark:border-surface-700/50 hover:border-primary-200 dark:hover:border-primary-800'
                    }`}>
                    <p className={`text-xs font-bold font-mono ${selectedCourse === c._id ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}`}>{c.courseCode}</p>
                    <p className={`text-[11px] truncate mt-0.5 ${selectedCourse === c._id ? 'text-primary-500 dark:text-primary-300' : 'text-surface-500 dark:text-surface-400'}`}>{c.courseName}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Inline Booking Panel ── */
function BookingPanel({ tutor, courseId, courseCode, user, onClose, onBooked }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [venue, setVenue] = useState('');
  const [venueType, setVenueType] = useState('on-campus');
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    const year = new Date().getFullYear();
    api.get(`/sessions/holidays?year=${year}`).then(({ data }) => setHolidays(data)).catch(() => {});
  }, []);

  // Auto-fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate) { setSlots([]); return; }
    setLoadingSlots(true);
    setSelectedSlot(null);
    api.post('/sessions/suggest', {
      tutorId: tutor._id,
      tuteeIds: [user._id],
      courseId,
      date: selectedDate,
      durationMinutes: 60,
    }).then(({ data }) => {
      const daySlots = data.suggestions.flatMap(s =>
        s.slots.map(slot => ({
          startTime: slot.startTime, endTime: slot.endTime,
          date: selectedDate, day: s.day, key: `${selectedDate}-${slot.startTime}`,
        }))
      );
      setSlots(daySlots);
      if (daySlots.length > 0) playSound('success');
    }).catch(err => {
      toast.error(err.response?.data?.message || 'Failed to find slots');
      setSlots([]);
    }).finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot) { toast.error('Select a time slot'); return; }
    if (!venue.trim()) { toast.error('Enter a venue'); return; }
    setBooking(true);
    playSound('click');
    try {
      await api.post('/sessions', {
        tutorId: tutor._id, tuteeIds: [user._id], courseId,
        date: selectedSlot.date, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime,
        venue, venueType, notes,
      });
      playSound('success');
      toast.success('Session booked!');
      onBooked();
    } catch (err) {
      playSound('error');
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  // Calendar logic
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const holidaySet = new Set(holidays.map(h => h.date));
  const holidayMap = {};
  holidays.forEach(h => { holidayMap[h.date] = h; });

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-end"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="relative w-full max-w-md h-full bg-white dark:bg-surface-900 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-white">Book a Session</h3>
            <p className="text-xs text-surface-400 mt-0.5">
              {tutor.firstName} {tutor.lastName} · {courseCode}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <HiX className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Mini calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setViewMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 })} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                <HiChevronLeft className="w-4 h-4 text-surface-500" />
              </button>
              <span className="text-sm font-bold text-surface-800 dark:text-surface-200">{monthLabel}</span>
              <button onClick={() => setViewMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 })} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                <HiChevronRight className="w-4 h-4 text-surface-500" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-surface-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} />;
                const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dateObj = new Date(viewMonth.year, viewMonth.month, day);
                const isSun = dateObj.getDay() === 0;
                const isPast = dateObj < today;
                const isHol = holidaySet.has(dateStr);
                const isDisabled = isPast || isSun || isHol;
                const isSelected = selectedDate === dateStr;
                const holidayInfo = holidayMap[dateStr];

                return (
                  <button key={day} disabled={isDisabled} onClick={() => { playSound('click'); setSelectedDate(dateStr); }}
                    title={holidayInfo ? `🚫 ${holidayInfo.name} (${holidayInfo.type})` : isSun ? 'Sunday — no sessions' : ''}
                    className={`relative aspect-square rounded-lg text-xs font-medium transition-all ${
                      isSelected ? 'bg-primary-500 text-white scale-110 shadow-sm'
                      : isHol ? 'text-red-300 dark:text-red-700 cursor-not-allowed bg-red-50 dark:bg-red-950/20'
                      : isSun ? 'text-surface-300 dark:text-surface-600 cursor-not-allowed'
                      : isPast ? 'text-surface-300 dark:text-surface-600 cursor-not-allowed'
                      : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}>
                    {day}
                    {isHol && !isSelected && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-400" />
                    )}
                    {isSun && !isPast && !isSelected && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
              <span className="flex items-center gap-1.5 text-[10px] text-surface-500 dark:text-surface-400">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Holiday
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-surface-500 dark:text-surface-400">
                <span className="w-2 h-2 rounded-full bg-surface-300 dark:bg-surface-600" /> Sunday
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-surface-500 dark:text-surface-400">
                <span className="w-2 h-2 rounded-full bg-primary-500" /> Selected
              </span>
            </div>

            {/* Show holiday name if hovered date is a holiday */}
            {selectedDate && holidayMap[selectedDate] && (
              <div className="mt-2 px-2 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
                <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                  🚫 {holidayMap[selectedDate].name} ({holidayMap[selectedDate].type} holiday)
                </p>
              </div>
            )}
          </div>

          {/* Slots */}
          {selectedDate && (
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
                {formatDateLabel(selectedDate)} — {loadingSlots ? 'Loading...' : `${slots.length} slots`}
              </p>
              {loadingSlots ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-surface-400 text-center py-4">No available slots. Try another date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                  {slots.map(slot => (
                    <button key={slot.key} onClick={() => { playSound('pop'); setSelectedSlot(slot); }}
                      className={`px-2 py-2 rounded-lg border text-center transition-all ${
                        selectedSlot?.key === slot.key
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700'
                          : 'border-surface-200 dark:border-surface-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                      }`}>
                      <p className="text-xs font-semibold text-surface-800 dark:text-surface-100">{formatTime12(slot.startTime)}</p>
                      <p className="text-[10px] text-surface-400">{formatTime12(slot.endTime)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Venue + Confirm */}
          {selectedSlot && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2 border-t border-surface-200 dark:border-surface-700">
              <div className="flex gap-2">
                {['on-campus', 'online'].map(t => (
                  <button key={t} onClick={() => setVenueType(t)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                      venueType === t ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-400 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                      : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-surface-300'
                    }`}>
                    {t === 'on-campus' ? '🏫 On Campus' : '💻 Online'}
                  </button>
                ))}
              </div>
              <input value={venue} onChange={e => setVenue(e.target.value)} className="input-field text-sm"
                placeholder={venueType === 'online' ? 'Meeting link' : 'e.g. Library Room 1'} />
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field text-sm" rows={2} placeholder="Notes (optional)" />
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleBook} disabled={booking || !venue.trim()}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm">
                {booking ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiCheck className="w-4 h-4" />}
                {booking ? 'Booking...' : 'Confirm Session'}
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function FindTutorPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [enrolledCodes, setEnrolledCodes] = useState(new Set());
  const [bookingTutor, setBookingTutor] = useState(null);
  const [tutorInsights, setTutorInsights] = useState({});
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    // Fetch eligible courses from curriculum (based on verified academic progression)
    api.get('/curriculum/eligible').then(({ data }) => {
      setCourses(data.courses || []);
      setEnrolledCodes(new Set());
    }).catch(console.error);
  }, [user.yearLevel, user.currentSemester]);

  useEffect(() => {
    if (!selectedCourse) { setTutors([]); return; }
    setLoading(true);
    api.get(`/tutor-profiles/tutors?courseId=${selectedCourse}`)
      .then(({ data }) => {
        const filtered = data.filter(t => t.tutor?._id !== user._id);
        setTutors(filtered);
        // Fetch insights for each tutor (non-blocking)
        filtered.forEach(t => {
          if (t.tutor?._id) {
            api.get(`/ratings/insights/${t.tutor._id}?courseId=${selectedCourse}`)
              .then(({ data: insightData }) => {
                if (insightData.hasInsights) {
                  setTutorInsights(prev => ({ ...prev, [t.tutor._id]: insightData.insights }));
                }
              })
              .catch(() => {});
          }
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCourse, user._id]);

  const filtered = tutors.filter(t =>
    `${t.tutor?.firstName} ${t.tutor?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCourseObj = courses.find(c => c._id === selectedCourse);

  return (
    <div>
      <PageHeader title="Find a Tutor" subtitle="Browse verified peer tutors for your courses" />

      {/* Course search + selector */}
      <div className="mb-3">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
          <input
            value={courseSearch}
            onChange={e => setCourseSearch(e.target.value)}
            className="input-field pl-9 py-2.5 w-full sm:w-72"
            placeholder="Search courses..."
          />
        </div>
      </div>
      {(() => {
        // Group all courses by year level
        const coursesByYear = {};
        courses.forEach(c => {
          const yr = c.yearLevel || 0;
          if (!coursesByYear[yr]) coursesByYear[yr] = [];
          coursesByYear[yr].push(c);
        });

        const sections = [];
        Object.keys(coursesByYear).sort((a, b) => b - a).forEach(yr => {
          const filteredYr = courseSearch
            ? coursesByYear[yr].filter(c => `${c.courseCode} ${c.courseName}`.toLowerCase().includes(courseSearch.toLowerCase()))
            : coursesByYear[yr];
          if (filteredYr.length > 0) {
            const isCurrentYear = Number(yr) === user.yearLevel;
            sections.push({
              id: `year-${yr}`,
              label: `Year ${yr} Subjects${isCurrentYear ? ' (Current)' : ''}`,
              courses: filteredYr,
              defaultOpen: isCurrentYear,
            });
          }
        });

        return (
          <div className="mb-8 space-y-2">
            {sections.length === 0 && courseSearch && (
              <p className="text-sm text-surface-400 text-center py-4">No courses match "{courseSearch}"</p>
            )}
            {sections.map(section => (
              <CourseSection key={section.id} label={section.label} courses={section.courses}
                selectedCourse={selectedCourse} onSelect={(id) => { playSound('click'); setSelectedCourse(id); }}
                defaultOpen={section.defaultOpen} />
            ))}
          </div>
        );
      })()}

      {/* Tutor list */}
      <AnimatePresence mode="wait">
        {selectedCourse && (
          <motion.div key={selectedCourse} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Tutors for <span className="text-primary-600 dark:text-primary-400">{selectedCourseObj?.courseCode}</span>
                <span className="text-surface-400 font-normal ml-2 text-sm">({filtered.length} available)</span>
              </h2>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2.5 w-full sm:w-56" placeholder="Search tutors..." />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                  <HiSearch className="w-7 h-7 text-surface-400" />
                </div>
                <p className="text-surface-500 dark:text-surface-400">No verified tutors available for this course yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((profile, idx) => (
                  <motion.div key={profile._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }} whileHover={{ y: -3 }}
                    className="card p-5 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 hover:border-primary-200 dark:hover:border-primary-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shrink-0 shadow-glow-sm">
                        <span className="text-white text-base font-bold">{profile.tutor?.firstName?.[0]}{profile.tutor?.lastName?.[0]}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-surface-900 dark:text-white">{profile.tutor?.firstName} {profile.tutor?.lastName}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{profile.tutor?.studentIdNumber || 'CCS'} · Year {profile.tutor?.yearLevel}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <CompetencyTooltip score={profile.competencyScore || 0} rating={profile.avgRating || 0} recommendationScore={profile.recommendationScore || 0} completedSessions={profile.completedSessions || 0} reliability={profile.completionRate || 100} />
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-surface-500 dark:text-surface-400">
                        <span className="flex items-center gap-1"><HiStar className="w-3.5 h-3.5 text-amber-500" />{profile.avgRating > 0 ? `${profile.avgRating}/5` : 'No ratings'}</span>
                        <span>Rec: {profile.recommendationScore || 0}%</span>
                        <span>{profile.completedSessions || 0} sessions</span>
                        <span>Reliability: {profile.completionRate || 100}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-surface-500 dark:text-surface-400">Availability</span>
                        <span className={profile.isAvailable !== false ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-500'}>
                          {profile.isAvailable !== false ? `${profile.availableSlots || '?'} slots left` : 'Fully booked'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Verified Tutor
                    </div>

                    {/* AI Insights — strengths from student reviews */}
                    {tutorInsights[profile.tutor?._id] && (
                      <div className="rounded-lg p-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 space-y-1.5">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-surface-400 flex items-center gap-1">
                          🧠 AI Insight <span className="font-normal">· based on {tutorInsights[profile.tutor._id].totalReviews} review{tutorInsights[profile.tutor._id].totalReviews !== 1 ? 's' : ''}</span>
                        </p>
                        {/* Summary sentence */}
                        <p className="text-[11px] text-surface-600 dark:text-surface-300 italic">
                          {tutorInsights[profile.tutor._id].topStrengths?.length > 0
                            ? `"Students consistently praise ${tutorInsights[profile.tutor._id].topStrengths.slice(0, 2).map(s => s.label).join(' and ')}${tutorInsights[profile.tutor._id].topImprovements?.length > 0 ? `. Some suggest improving ${tutorInsights[profile.tutor._id].topImprovements[0].label.toLowerCase()}.` : '.'}"` 
                            : `"${tutorInsights[profile.tutor._id].overallSentiment || 'Positive'} feedback overall."`
                          }
                        </p>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {tutorInsights[profile.tutor._id].topStrengths?.slice(0, 3).map(s => (
                            <span key={s.label} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                              ✓ {s.label}
                            </span>
                          ))}
                          {tutorInsights[profile.tutor._id].topImprovements?.slice(0, 2).map(s => (
                            <span key={s.label} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                              ◐ {s.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => { playSound('click'); setBookingTutor(profile.tutor); }}
                      disabled={profile.isAvailable === false}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm">
                      <HiCalendar className="w-4 h-4" />
                      {profile.isAvailable !== false ? 'Book a Session' : 'Unavailable'}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedCourse && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center mb-4">
            <HiSearch className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-surface-600 dark:text-surface-300 font-medium">Select a course above</p>
          <p className="text-sm text-surface-400 mt-1">to find available tutors</p>
        </motion.div>
      )}

      {/* Booking slide-out panel */}
      <AnimatePresence>
        {bookingTutor && (
          <BookingPanel
            tutor={bookingTutor}
            courseId={selectedCourse}
            courseCode={selectedCourseObj?.courseCode || ''}
            user={user}
            onClose={() => setBookingTutor(null)}
            onBooked={() => { setBookingTutor(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
