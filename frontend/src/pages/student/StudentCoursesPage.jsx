import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { HiAcademicCap, HiUser, HiClock } from 'react-icons/hi';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/my-courses')
      .then(res => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        subtitle={`You are enrolled in ${courses.length} course${courses.length !== 1 ? 's' : ''}`}
      />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          <HiAcademicCap className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">You are not enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/40 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <HiAcademicCap className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">
                  {course.units} unit{course.units !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Course info */}
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                {course.courseCode}
              </p>
              <h3 className="text-sm font-semibold text-slate-100 mb-1 leading-snug">
                {course.courseName}
              </h3>
              {course.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{course.description}</p>
              )}

              {/* Footer */}
              <div className="border-t border-slate-700/50 pt-3 space-y-1.5">
                {course.faculty ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <HiUser className="w-3.5 h-3.5 shrink-0" />
                    <span>{course.faculty.firstName} {course.faculty.lastName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <HiUser className="w-3.5 h-3.5 shrink-0" />
                    <span>No instructor assigned</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <HiClock className="w-3.5 h-3.5 shrink-0" />
                  <span>{course.department || 'General'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
