import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiStar, HiCalendar } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import CompetencyTooltip from '../../components/CompetencyTooltip';
import { useAuth } from '../../context/AuthContext';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';

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
      // Extract course codes from schedule
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

      // Enrolled: in their schedule
      const enrolled = data.filter(c => codes.has(c.courseCode));
      // Upcoming: year level above theirs, not enrolled
      const upcoming = data.filter(c =>
        c.yearLevel && user.yearLevel && c.yearLevel > user.yearLevel && !codes.has(c.courseCode)
      );

      setCourses([...enrolled, ...upcoming]);
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
      <PageHeader title="Find a Tutor" subtitle="Browse verified peer tutors for IT courses" />

      {/* Course selector — grouped */}
      {(() => {
        const enrolled = courses.filter(c => enrolledCodes.has(c.courseCode));
        const upcoming = courses.filter(c => !enrolledCodes.has(c.courseCode));
        // Group upcoming by year level
        const upcomingByYear = {};
        upcoming.forEach(c => {
          const yr = c.yearLevel || 0;
          if (!upcomingByYear[yr]) upcomingByYear[yr] = [];
          upcomingByYear[yr].push(c);
        });
        const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

        return (
          <div className="mb-8 space-y-5">
            {enrolled.length > 0 && (
              <div>
                <p className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                  Currently Enrolled — Year {user.yearLevel}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {enrolled.map(c => (
                    <motion.button
                      key={c._id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { playSound('click'); setSelectedCourse(c._id); }}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                        selectedCourse === c._id
                          ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700 shadow-glow-sm'
                          : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm'
                      }`}
                    >
                      <p className={`text-xs font-bold font-mono ${
                        selectedCourse === c._id ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'
                      }`}>{c.courseCode}</p>
                      <p className={`text-xs truncate mt-0.5 ${
                        selectedCourse === c._id ? 'text-primary-500 dark:text-primary-300' : 'text-surface-500 dark:text-surface-400'
                      }`}>{c.courseName}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(upcomingByYear).sort((a, b) => a - b).map(yr => (
              <div key={yr}>
                <p className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                  Upcoming — {YEAR_LABELS[yr] || `Year ${yr}`}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {upcomingByYear[yr].map(c => (
                    <motion.button
                      key={c._id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { playSound('click'); setSelectedCourse(c._id); }}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                        selectedCourse === c._id
                          ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700 shadow-glow-sm'
                          : 'bg-white dark:bg-surface-900 border-surface-200/60 dark:border-surface-800/60 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm opacity-80'
                      }`}
                    >
                      <p className={`text-xs font-bold font-mono ${
                        selectedCourse === c._id ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'
                      }`}>{c.courseCode}</p>
                      <p className={`text-xs truncate mt-0.5 ${
                        selectedCourse === c._id ? 'text-primary-500 dark:text-primary-300' : 'text-surface-500 dark:text-surface-400'
                      }`}>{c.courseName}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
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
