import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiPrinter } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const dayColors = {
  Monday: 'border-l-blue-500',
  Tuesday: 'border-l-green-500',
  Wednesday: 'border-l-purple-500',
  Thursday: 'border-l-orange-500',
  Friday: 'border-l-pink-500',
  Saturday: 'border-l-yellow-500',
  Sunday: 'border-l-red-500',
};

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/schedules/my-schedule')
      .then(({ data }) => setSchedules(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day === day);
    return acc;
  }, {});

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  return (
    <div>
      <PageHeader
        title="My Schedule"
        subtitle="Your weekly class schedule"
        action={
          <button onClick={() => navigate('/print/study-load')} className="btn-secondary flex items-center gap-2">
            <HiPrinter className="w-4 h-4" /> Print Study Load
          </button>
        }
      />

      {schedules.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">No schedules found. Contact admin to enroll in courses.</div>
      ) : (
        <div className="space-y-6">
          {DAYS.map((day) => {
            if (grouped[day].length === 0) return null;
            return (
              <motion.div key={day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{day}</h2>
                <div className="space-y-3">
                  {grouped[day].map((s) => (
                    <div key={s._id} className={`card border-l-4 ${dayColors[day]} hover:border-slate-600 transition-colors`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-100">{s.course?.courseName}</p>
                          <p className="text-sm text-slate-400 mt-0.5">{s.course?.courseCode} • {s.course?.units} units</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-200">{s.startTime} – {s.endTime}</p>
                          <p className="text-xs text-slate-400">{s.room || 'TBA'}</p>
                        </div>
                      </div>
                      {s.course?.faculty && (
                        <p className="text-xs text-slate-500 mt-2">
                          Instructor: {s.course.faculty.firstName} {s.course.faculty.lastName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
