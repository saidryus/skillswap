import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiUpload, HiCheck, HiX, HiClock, HiDocumentText, HiCalendar } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import PipelineTracker from '../../components/PipelineTracker';
import ConfidenceBadge from '../../components/ConfidenceBadge';
import { useAuth } from '../../context/AuthContext';
import { playSound } from '../../utils/sounds';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending:  'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
};

const STATUS_ICONS = {
  pending:  <HiClock className="w-3.5 h-3.5" />,
  approved: <HiCheck className="w-3.5 h-3.5" />,
  rejected: <HiX className="w-3.5 h-3.5" />,
};

export default function BecomeTutorPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hasSchedule, setHasSchedule] = useState(true);
  const fileRef = useRef();

  const fetchData = async () => {
    const [coursesRes, appsRes, schedRes] = await Promise.all([
      api.get('/student-schedules/my-courses'),
      api.get('/tutor-profiles/my-applications'),
      api.get('/student-schedules/has-schedule'),
    ]);
    setHasSchedule(schedRes.data.hasSchedule);
    // Keep enrolled and previous separate
    const { enrolledCourses, previousCourses } = coursesRes.data;
    // Tag them so we can group properly
    const tagged = [
      ...enrolledCourses.map(c => ({ ...c, _group: 'enrolled' })),
      ...previousCourses.map(c => ({ ...c, _group: 'previous' })),
    ];
    // Deduplicate by _id
    const uniqueCourses = [...new Map(tagged.map(c => [c._id, c])).values()];
    setCourses(uniqueCourses);
    setMyApplications(appsRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const blockedCourseIds = new Set(
    myApplications
      .filter(a => a.status === 'pending' || a.status === 'approved')
      .map(a => a.course?._id)
  );
  const availableCourses = courses.filter(c => !blockedCourseIds.has(c._id));

  // Group available courses by year level and semester for organized dropdown
  const studentYear = user?.yearLevel || 1;

  const groupedCourses = {};
  // Currently enrolled (from schedule)
  const enrolled = availableCourses.filter(c => c._group === 'enrolled');
  if (enrolled.length > 0) groupedCourses['current'] = enrolled;
  // Previous courses — group by year level
  const previous = availableCourses.filter(c => c._group === 'previous');
  if (previous.length > 0) {
    // Get unique year levels, sorted descending
    const years = [...new Set(previous.map(c => c.yearLevel))].sort((a, b) => b - a);
    for (const y of years) {
      const yearCourses = previous.filter(c => c.yearLevel === y);
      if (yearCourses.length > 0) groupedCourses[`year-${y}`] = yearCourses;
    }
  }
  // Courses without a year level
  const ungrouped = availableCourses.filter(c => !c.yearLevel && !c._group);
  if (ungrouped.length > 0) groupedCourses['general'] = ungrouped;

  const getGroupLabel = (key) => {
    if (key === 'current') return `Currently Enrolled (Year ${studentYear})`;
    if (key === 'general') return 'General Subjects';
    if (key.startsWith('year-')) return `Year ${key.split('-')[1]} Subjects`;
    return key;
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(f.type)) { toast.error('Only PDF and image files are allowed'); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error('File must be 5MB or less'); return; }
    setFile(f);
    playSound('pop');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) { toast.error('Select a course'); return; }
    if (!file) { toast.error('Upload your grade slip or class card'); return; }

    setSubmitting(true);
    setSubmitError('');
    playSound('click');
    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourse);
      formData.append('gradeDocument', file);

      await api.post('/tutor-profiles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      playSound('success');
      toast.success('Application submitted! Admin will review it shortly.');
      setSelectedCourse('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchData();
    } catch (err) {
      playSound('error');
      const msg = err.response?.data?.message || 'Failed to submit application';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Become a Tutor" subtitle="Apply to tutor courses you've completed successfully" />

      {!hasSchedule && (
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
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Schedule Required</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                You need to upload your class schedule before applying as a tutor. The system uses your schedule to match you with tutees.
              </p>
              <a href="/student/my-schedule" className="inline-block mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 underline hover:text-amber-900 dark:hover:text-amber-100">
                Upload your schedule →
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {hasSchedule && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-base font-bold text-surface-900 dark:text-white mb-1">
            Apply to Tutor a Course
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-5">
            Upload your grade slip or class card as proof. Admin will review and approve your application.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Course</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a course to tutor</option>
                {Object.keys(groupedCourses).map(groupKey => {
                  const groupCourses = groupedCourses[groupKey];
                  if (!groupCourses || groupCourses.length === 0) return null;
                  return (
                    <optgroup key={groupKey} label={getGroupLabel(groupKey)}>
                      {groupCourses.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.courseCode} — {c.courseName}{c.semester ? ` (${c.semester === 1 ? '1st' : '2nd'} Sem)` : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              {availableCourses.length === 0 && (
                <p className="text-xs text-surface-400 mt-1.5">You have applied for all available courses.</p>
              )}
            </div>

            <div>
              <label className="label">Grade Slip / Class Card</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                  ${file
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 dark:hover:border-primary-600 bg-surface-50 dark:bg-surface-800/50'
                  }`}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <HiDocumentText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{file.name}</p>
                      <p className="text-xs text-surface-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="ml-2 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-surface-400 hover:text-red-500 transition-colors"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-3">
                      <HiUpload className="w-6 h-6 text-surface-400" />
                    </div>
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      Click to upload your grade slip
                    </p>
                    <p className="text-xs text-surface-400 mt-1">PDF, JPG, or PNG · Max 5MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
                <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting || availableCourses.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <HiUpload className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Application'}
            </motion.button>
          </form>
        </motion.div>

        {/* My applications */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-base font-bold text-surface-900 dark:text-white mb-4">My Applications</h3>
          {myApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                <HiDocumentText className="w-7 h-7 text-surface-400" />
              </div>
              <p className="text-sm text-surface-400">No applications yet</p>
              <p className="text-xs text-surface-400 mt-1">Submit your first application to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app, idx) => {
                // Determine pipeline step index based on status
                const pipelineSteps = ['Submitted', 'OCR Processing', 'Admin Review', app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Pending'];
                const currentStepIdx = app.status === 'pending' ? 2 : 3;

                return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 
                             border border-surface-200/50 dark:border-surface-700/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-surface-800 dark:text-surface-100 font-mono">
                        {app.course?.courseCode}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                        {app.course?.courseName}
                      </p>
                    </div>
                    <span className={`${STATUS_STYLES[app.status]} flex items-center gap-1 shrink-0`}>
                      {STATUS_ICONS[app.status]}
                      {app.status}
                    </span>
                  </div>

                  {/* Pipeline tracker */}
                  <PipelineTracker
                    steps={pipelineSteps}
                    currentStepIndex={currentStepIdx}
                    status={app.status}
                  />

                  {/* Grade detection info */}
                  {app.detectedGrade && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-surface-500 dark:text-surface-400">Detected Grade:</span>
                      <span className="text-xs font-bold font-mono text-surface-800 dark:text-surface-100">
                        {app.detectedGrade}
                      </span>
                      <ConfidenceBadge confidence={app.gradeDetectionConfidence || 'none'} />
                    </div>
                  )}

                  <p className="text-[10px] text-surface-400 mt-2 font-medium">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>

                  {app.status === 'rejected' && app.adminNotes && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2.5 
                                  bg-red-50 dark:bg-red-950/30 rounded-lg p-2.5 border border-red-200 dark:border-red-800/50">
                      Reason: {app.adminNotes}
                    </p>
                  )}
                  {app.status === 'approved' && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2.5 font-medium flex items-center gap-1">
                      <HiCheck className="w-3.5 h-3.5" />
                      You are verified to tutor this course
                    </p>
                  )}
                </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      )}
    </div>
  );
}
