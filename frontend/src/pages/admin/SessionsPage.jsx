import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiCalendar } from 'react-icons/hi';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  scheduled:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completed:  'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled:  'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/sessions');
      setSessions(data);
    } catch { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    let result = sessions;
    if (statusFilter) result = result.filter(s => s.status === statusFilter);
    if (search) result = result.filter(s =>
      `${s.tutor?.firstName} ${s.tutor?.lastName} ${s.course?.courseCode}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [sessions, statusFilter, search]);

  const counts = {
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
  };

  return (
    <div>
      <PageHeader title="Sessions" subtitle="All tutoring sessions across the platform" />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-1">
          {[
            { key: '',           label: 'All',       count: sessions.length },
            { key: 'scheduled',  label: 'Scheduled', count: counts.scheduled },
            { key: 'completed',  label: 'Completed', count: counts.completed },
            { key: 'cancelled',  label: 'Cancelled', count: counts.cancelled },
          ].map(tab => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${statusFilter === tab.key ? 'bg-blue-600 text-white' : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:bg-surface-800'}`}>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${statusFilter === tab.key ? 'bg-blue-500/50 text-blue-100' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2" placeholder="Search by tutor or course..." />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="table-header">Course</th>
                <th className="table-header">Tutor</th>
                <th className="table-header">Tutees</th>
                <th className="table-header">Date & Time</th>
                <th className="table-header">Venue</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-surface-500 dark:text-surface-400">Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-surface-500 dark:text-surface-400">No sessions found</td></tr>
              : filtered.map(s => (
                <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface-50/50 dark:bg-surface-800/50 transition-colors">
                  <td className="table-cell">
                    <p className="text-surface-900 dark:text-surface-100 font-mono text-sm font-semibold">{s.course?.courseCode}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{s.course?.courseName}</p>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm text-surface-900 dark:text-surface-100">{s.tutor?.firstName} {s.tutor?.lastName}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{s.tutor?.studentIdNumber}</p>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-0.5">
                      {s.tutees?.map(t => (
                        <p key={t._id} className="text-xs text-surface-700 dark:text-surface-300">{t.firstName} {t.lastName}</p>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <HiCalendar className="w-3.5 h-3.5 text-surface-500 dark:text-surface-400 shrink-0" />
                      <div>
                        <p className="text-sm text-surface-900 dark:text-surface-100">{new Date(s.date).toLocaleDateString()}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{s.startTime}–{s.endTime}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm text-surface-900 dark:text-surface-100 truncate max-w-[150px]">{s.venue || '—'}</p>
                    <span className={`badge text-xs ${s.venueType === 'online' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-500/20 text-surface-700 dark:text-surface-300 border-slate-500/30'}`}>
                      {s.venueType}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge border ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
