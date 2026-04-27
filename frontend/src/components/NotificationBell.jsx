import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiX, HiCheck, HiCheckCircle } from 'react-icons/hi';
import api from '../utils/api';

const TYPE_ICONS = {
  schedule_changed:  { emoji: '📅', color: 'text-orange-400' },
  schedule_created:  { emoji: '📅', color: 'text-blue-400' },
  instructor_assigned: { emoji: '👨‍🏫', color: 'text-purple-400' },
  instructor_changed:  { emoji: '👨‍🏫', color: 'text-yellow-400' },
  announcement:      { emoji: '📢', color: 'text-blue-400' },
  attendance_marked: { emoji: '✅', color: 'text-green-400' },
  enrollment:        { emoji: '🎓', color: 'text-green-400' },
  unenrollment:      { emoji: '🚫', color: 'text-red-400' },
  course_updated:    { emoji: '📚', color: 'text-indigo-400' },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchUnread = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnread(data.count);
    } catch (_) {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnread(data.filter((n) => !n.isRead).length);
    } catch (_) {}
    setLoading(false);
  };

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load full list when panel opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnread((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await api.put('/notifications/mark-all-read');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const handleDelete = async (id) => {
    await api.delete(`/notifications/${id}`);
    const removed = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (removed && !removed.isRead) setUnread((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <HiBell className="w-5 h-5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <HiBell className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-slate-100">Notifications</span>
                {unread > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <HiCheckCircle className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <HiBell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const icon = TYPE_ICONS[n.type] || { emoji: '🔔', color: 'text-slate-400' };
                  return (
                    <motion.div
                      key={n._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/40 transition-colors group ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                    >
                      {/* Unread dot */}
                      <div className="mt-1 shrink-0">
                        {!n.isRead ? (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        ) : (
                          <div className="w-2 h-2" />
                        )}
                      </div>

                      {/* Icon */}
                      <span className="text-lg shrink-0 mt-0.5">{icon.emoji}</span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${n.isRead ? 'text-slate-300' : 'text-slate-100'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n._id)}
                            className="p-1 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                            title="Mark as read"
                          >
                            <HiCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n._id)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete"
                        >
                          <HiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-slate-700 text-center">
                <p className="text-xs text-slate-500">{notifications.length} notification{notifications.length !== 1 ? 's' : ''} total</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
