import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiX, HiCheck, HiCheckCircle } from 'react-icons/hi';
import { playSound } from '../utils/sounds';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TYPE_ICONS = {
  tutor_application:  { emoji: '📝', color: 'text-amber-500' },
  tutor_approved:     { emoji: '✅', color: 'text-emerald-500' },
  tutor_rejected:     { emoji: '❌', color: 'text-red-500' },
  session_request:    { emoji: '📅', color: 'text-blue-500' },
  session_accepted:   { emoji: '🤝', color: 'text-emerald-500' },
  session_rejected:   { emoji: '🚫', color: 'text-red-500' },
  session_cancelled:  { emoji: '❌', color: 'text-orange-500' },
  session_completed:  { emoji: '🎉', color: 'text-purple-500' },
  announcement:       { emoji: '📢', color: 'text-blue-500' },
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
  const navigate = useNavigate();
  const { user } = useAuth();

  // Map notification types to routes
  const TYPE_ROUTES = {
    admin: {
      tutor_application: '/admin/tutor-applications',
      session_request: '/admin/sessions',
      session_accepted: '/admin/sessions',
      session_rejected: '/admin/sessions',
      session_cancelled: '/admin/sessions',
      session_completed: '/admin/sessions',
      announcement: '/admin/announcements',
    },
    student: {
      tutor_approved: '/student/become-tutor',
      tutor_rejected: '/student/become-tutor',
      session_request: '/student/my-sessions',
      session_accepted: '/student/my-sessions',
      session_rejected: '/student/my-sessions',
      session_cancelled: '/student/my-sessions',
      session_completed: '/student/my-sessions',
      announcement: '/student/announcements',
    },
  };

  const fetchUnread = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      if (data.count > unread && unread > 0) playSound('notification');
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

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
  };

  const handleClickNotification = async (n) => {
    // Mark as read
    if (!n.isRead) {
      await api.put(`/notifications/${n._id}/read`);
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
    }
    // Navigate to relevant page
    const route = n.link || (TYPE_ROUTES[user?.role] || {})[n.type];
    if (route) {
      setOpen(false);
      navigate(route);
    }
  };

  const handleMarkAllRead = async () => {
    await api.put('/notifications/mark-all-read');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    playSound('success');
  };

  const handleDelete = async (id) => {
    const removed = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (removed && !removed.isRead) setUnread((c) => Math.max(0, c - 1));
    await api.delete(`/notifications/${id}`);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { playSound('click'); setOpen(!open); }}
        className="btn-icon relative"
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
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] 
                         bg-red-500 text-white text-[10px] font-bold rounded-full 
                         flex items-center justify-center px-1 shadow-lg"
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-96 z-50 overflow-hidden
                       bg-white dark:bg-surface-900 
                       border border-surface-200 dark:border-surface-800 
                       rounded-2xl shadow-elevated-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 
                            border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-surface-900 dark:text-white">
                  Notifications
                </span>
                {unread > 0 && (
                  <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 
                                   text-xs font-bold px-2 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 
                             hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
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
                  <div className="w-6 h-6 border-2 border-primary-200 dark:border-primary-800 
                                  border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 
                                  flex items-center justify-center mx-auto mb-3">
                    <HiBell className="w-6 h-6 text-surface-400" />
                  </div>
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
                    No notifications yet
                  </p>
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                    You're all caught up
                  </p>
                </div>
              ) : (
                notifications.map((n, idx) => {
                  const icon = TYPE_ICONS[n.type] || { emoji: '🔔', color: 'text-surface-400' };
                  const hasRoute = n.link || (TYPE_ROUTES[user?.role] || {})[n.type];
                  return (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleClickNotification(n)}
                      className={`flex items-start gap-3 px-5 py-3.5 
                                  border-b border-surface-100 dark:border-surface-800/50 
                                  hover:bg-surface-50 dark:hover:bg-surface-800/50 
                                  transition-colors group
                                  ${hasRoute ? 'cursor-pointer' : 'cursor-default'}
                                  ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''}`}
                    >
                      <span className="text-lg shrink-0 mt-0.5">{icon.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-tight
                          ${n.isRead ? 'text-surface-600 dark:text-surface-300' : 'text-surface-900 dark:text-white'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-surface-400 dark:text-surface-500 mt-1 font-medium">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => handleMarkRead(n._id)}
                            className="p-1.5 rounded-lg text-surface-400 
                                       hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 
                                       transition-colors"
                            title="Mark as read"
                          >
                            <HiCheck className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleDelete(n._id)}
                          className="p-1.5 rounded-lg text-surface-400 
                                     hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 
                                     transition-colors"
                          title="Delete"
                        >
                          <HiX className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
