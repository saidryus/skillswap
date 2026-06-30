import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiStar, HiCalendar, HiChevronDown } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import CompetencyTooltip from '../../components/CompetencyTooltip';
import { useAuth } from '../../context/AuthContext';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';

/* ── Collapsible course section ── */
function CourseSection({ label, courses, selectedCourse, onSelect, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasSelection = courses.some(c => c._id === selectedCourse);

  return (
    <div className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => { setIsOpen(!isOpen); playSound('click'); }}
        className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
          isOpen
            ? 'bg-primary-50 dark:bg-primary-950/30'
            : hasSelection
              ? 'bg-emerald-50 dark:bg-emerald-950/20'
              : 'bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isOpen ? 'text-primary-600 dark:text-primary-400' :
            hasSelection ? 'text-emerald-600 dark:text-emerald-400' :
            'text-surface-500 dark:text-surface-400'
          }`}>{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 font-medium">
            {courses.length}
          </span>
          {hasSelection && !isOpen && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-medium">
              Selected
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <HiChevronDown className="w-4 h-4 text-surface-400" />
        </motion.div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-3 border-t border-surface-200/50 dark:border-surface-700/50 bg-white dark:bg-surface-900">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {courses.map(c => (
                  <motion.button
                    key={c._id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(c._id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      selectedCourse === c._id
                        ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700 shadow-glow-sm'
                        : 'bg-surface-50 dark:bg-surface-800/50 border-surface-200/50 dark:border-surface-700/50 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    <p className={`text-xs font-bold font-mono ${
                      selectedCourse === c._id ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'
                    }`}>{c.courseCode}</p>
                    <p className={`text-[11px] truncate mt-0.5 ${
                      selectedCourse === c._id ? 'text-primary-500 dark:text-primary-300' : 'text-surface-500 dark:text-surface-400'
                    }`}>{c.courseName}{c.semester ? ` (${c.semester === 1 ? '1st' : '2nd'} Sem)` : ''}</p>
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

export default function FindTutorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [mySchedule, setMySchedule] = useState([]);
  const [enrolledCodes, setEnrolledCodes] = useState(new Set());

  useEffect(() => {
    api.get(`/student-schedules/${user._id}`).then(({ data }) => setMySchedule(data));
  }, [user._id]);

  useEffect(() => {
    if (mySchedule.length === 0) { setCourses([]); return; }

    api.get('/courses').then(({ data }) => {
      // Get enrolled course IDs from schedule entries (linked via course field)
      const enrolledIds = new Set();
      mySchedule.forEach(entry => {
        if (entry.course) {
          const courseId = typeof entry.course === 'object' ? entry.course._id : entry.course;
          if (courseId) enrolledIds.add(courseId);
        }
      });
      setEnrolledCodes(enrolledIds);

      // Enrolled: courses linked from schedule
      const enrolled = data.filter(c => enrolledIds.has(c._id));
      // Previous: same year lower semester + lower year levels
      const previous = data.filter(c => {
        if (enrolledIds.has(c._id)) return false;
        if (!c.yearLevel || !user.yearLevel) return false;
        if (c.yearLevel < user.yearLevel) return true;
        if (c.yearLevel === user.yearLevel && user.currentSemester === 2 && c.semester === 1) return true;
        return false;
      });

      setCourses([...enrolled, ...previous]);
    });
  }, [mySchedule, user.yearLevel]);

  useEffect(() => {
    if (!selectedCourse) { setTutors([]); return; }
    setLoading(true);
    api.get(`/tutor-profiles/tutors?courseId=${selectedCourse}`)
      .then(({ data }) => setTutors(data.filter(t => t.tutor?._id !== user._id)))
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

      {/* Course selector — collapsible dropdown sections */}
      {(() => {
        const enrolled = courses.filter(c => enrolledCodes.has(c._id));
        const previous = courses.filter(c => !enrolledCodes.has(c._id));
        // Group previous by year level
        const previousByYear = {};
        previous.forEach(c => {
          const yr = c.yearLevel || 0;
          if (!previousByYear[yr]) previousByYear[yr] = [];
          previousByYear[yr].push(c);
        });
        const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

        const sections = [];
        if (enrolled.length > 0) {
          sections.push({ id: 'enrolled', label: `Currently Enrolled — Year ${user.yearLevel}`, courses: enrolled, defaultOpen: true });
        }
        Object.keys(previousByYear).sort((a, b) => b - a).forEach(yr => {
          sections.push({ id: `previous-${yr}`, label: `Year ${yr} Subjects`, courses: previousByYear[yr], defaultOpen: false });
        });

        return (
          <div className="mb-8 space-y-2">
            {sections.map(section => (
              <CourseSection
                key={section.id}
                label={section.label}
                courses={section.courses}
                selectedCourse={selectedCourse}
                onSelect={(id) => { playSound('click'); setSelectedCourse(id); }}
                defaultOpen={section.defaultOpen}
              />
            ))}
          </div>
        );
      })()}

      <AnimatePresence mode="wait">
        {selectedCourse && (
          <motion.div
            key={selectedCourse}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Tutors for <span className="text-primary-600 dark:text-primary-400">{selectedCourseObj?.courseCode}</span>
                <span className="text-surface-400 font-normal ml-2 text-sm">({filtered.length} available)</span>
              </h2>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field pl-9 py-2.5 w-full sm:w-56"
                  placeholder="Search tutors..."
                />
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
                  <motion.div
                    key={profile._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="card p-5 flex flex-col gap-4 hover:shadow-lg transition-all duration-300
                               hover:border-primary-200 dark:hover:border-primary-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 
                                      flex items-center justify-center shrink-0 shadow-glow-sm">
                        <span className="text-white text-base font-bold">
                          {profile.tutor?.firstName?.[0]}{profile.tutor?.lastName?.[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-surface-900 dark:text-white">
                          {profile.tutor?.firstName} {profile.tutor?.lastName}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {profile.tutor?.studentIdNumber || 'IT Department'} · Year {profile.tutor?.yearLevel}
                        </p>
                      </div>
                    </div>

                    {/* Competency with hover tooltip */}
                    <div className="space-y-2">
                      <CompetencyTooltip
                        score={profile.competencyScore || 0}
                        rating={profile.avgRating || 0}
                        grade={profile.grade || 0}
                        completedSessions={profile.completedSessions || 0}
                        reliability={profile.completionRate || 100}
                      />
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-surface-500 dark:text-surface-400">
                        <span className="flex items-center gap-1">
                          <HiStar className="w-3.5 h-3.5 text-amber-500" />
                          {profile.avgRating > 0 ? `${profile.avgRating}/5` : 'No ratings'}
                        </span>
                        <span>Grade: {profile.grade > 0 ? profile.grade.toFixed(2) : 'N/A'}</span>
                        <span>{profile.completedSessions || 0} sessions</span>
                        <span>Reliability: {profile.completionRate || 100}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-surface-500 dark:text-surface-400">Availability</span>
                        <span className={profile.isAvailable !== false ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-500'}>
                          {profile.isAvailable !== false
                            ? `${profile.availableSlots || '?'} slots left`
                            : 'Fully booked'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Verified Tutor
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { playSound('click'); navigate(`/student/book-session?tutorId=${profile.tutor?._id}&courseId=${selectedCourse}`); }}
                      disabled={profile.isAvailable === false}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                    >
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/50 
                          flex items-center justify-center mb-4">
            <HiSearch className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-surface-600 dark:text-surface-300 font-medium">Select a course above</p>
          <p className="text-sm text-surface-400 mt-1">to find available tutors</p>
        </motion.div>
      )}
    </div>
  );
}
