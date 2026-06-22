import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiUpload, HiCheck, HiX, HiClock, HiDocumentText } from 'react-icons/hi';
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
  const fileRef = useRef();

  const fetchData = async () => {
    const [coursesRes, appsRes] = await Promise.all([
      api.get('/courses'),
      api.get('/tutor-profiles/my-applications'),
    ]);
    // Only show courses at or below the student's year level (current + previous)
    const studentYear = user?.yearLevel || 1;
    const filtered = coursesRes.data.filter(c => !c.yearLevel || c.yearLevel <= studentYear);
    setCourses(filtered);
    setMyApplications(appsRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const blockedCourseIds = new Set(
    myApplications
      .filter(a => a.status === 'pending' || a.status === 'approved')
      .map(a => a.course?._id)
  );
  const availableCourses = courses.filter(c => !blockedCourseIds.has(c._id));

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
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Become a Tutor" subtitle="Apply to tutor IT courses you've completed successfully" />

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
                {availableCourses.map(c => (
                  <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>
                ))}
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
    </div>
  );
}
