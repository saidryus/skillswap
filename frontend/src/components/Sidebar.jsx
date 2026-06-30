import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/sounds';
import Logo from './Logo';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  HiHome, HiUsers, HiAcademicCap, HiBell, HiLogout,
  HiChevronLeft, HiChevronRight, HiClipboardList,
  HiCalendar, HiSearch, HiBookOpen, HiStar, HiOfficeBuilding,
} from 'react-icons/hi';

const navItems = {
  admin: [
    { section: 'Overview' },
    { to: '/admin', label: 'Dashboard', icon: HiHome, end: true, permission: null },
    { section: 'Management' },
    { to: '/admin/users', label: 'Students', icon: HiUsers, permission: 'users' },
    { to: '/admin/courses', label: 'Courses', icon: HiAcademicCap, permission: 'courses' },
    { to: '/admin/departments', label: 'Departments', icon: HiOfficeBuilding, permission: 'courses' },
    { to: '/admin/tutor-applications', label: 'Tutor Applications', icon: HiStar, permission: 'tutor-applications' },
    { section: 'Monitoring' },
    { to: '/admin/sessions', label: 'Sessions', icon: HiCalendar, permission: 'sessions' },
    { to: '/admin/student-schedules', label: 'Student Schedules', icon: HiClipboardList, permission: 'student-schedules' },
    { section: 'Other' },
    { to: '/admin/announcements', label: 'Announcements', icon: HiBell, permission: 'announcements' },
  ],
  student: [
    { section: 'Main' },
    { to: '/student', label: 'Dashboard', icon: HiHome, end: true },
    { to: '/student/find-tutor', label: 'Find a Tutor', icon: HiSearch },
    { to: '/student/book-session', label: 'Book a Session', icon: HiCalendar },
    { to: '/student/my-sessions', label: 'My Sessions', icon: HiBookOpen },
    { to: '/student/become-tutor', label: 'Become a Tutor', icon: HiStar },
    { section: 'Schedule' },
    { to: '/student/my-schedule', label: 'My Schedule', icon: HiClipboardList },
    { section: 'Other' },
    { to: '/student/announcements', label: 'Announcements', icon: HiBell },
  ],
};

export default function Sidebar({ open, setOpen, isMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState({});

  // Map notification types to sidebar routes
  const TYPE_TO_ROUTE = {
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

  // Fetch unread notifications grouped by type → map to sidebar routes
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data } = await api.get('/notifications/unread-by-type');
        const routeMap = TYPE_TO_ROUTE[user?.role] || {};
        const routeCounts = {};

        Object.entries(data).forEach(([type, count]) => {
          const route = routeMap[type];
          if (route) {
            routeCounts[route] = (routeCounts[route] || 0) + count;
          }
        });

        setBadges(routeCounts);
      } catch (_) {}
    };

    if (user) {
      fetchBadges();
      const interval = setInterval(fetchBadges, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  let items = navItems[user?.role] || [];

  if (user?.role === 'admin' && !user?.isSuperAdmin) {
    const userPermissions = user?.permissions || [];
    items = items.filter(item => item.section || !item.permission || userPermissions.includes(item.permission));
  }

  const handleLogout = () => {
    playSound('swoosh');
    logout();
    navigate('/login');
  };

  const sidebarWidth = open ? 260 : 76;

  return (
    <motion.aside
      animate={{ width: isMobile ? 260 : sidebarWidth }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col relative overflow-hidden
                 bg-white dark:bg-surface-900
                 border-r border-surface-200/50 dark:border-surface-800/50
                 transition-colors duration-300"
    >
      {/* Sidebar ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[200px] h-[200px] 
                        bg-primary-500/[0.04] dark:bg-primary-500/[0.06] 
                        rounded-full blur-[60px]" />
        <div className="absolute -bottom-20 -left-10 w-[150px] h-[150px] 
                        bg-purple-500/[0.03] dark:bg-purple-500/[0.05] 
                        rounded-full blur-[50px]" />
        <div className="absolute top-[40%] -right-10 w-[100px] h-[100px] 
                        bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] 
                        rounded-full blur-[40px] animate-pulse-slow" />
        {/* Subtle vertical line accent */}
        <div className="absolute top-0 right-0 w-[1px] h-full 
                        bg-gradient-to-b from-transparent via-primary-500/[0.08] to-transparent
                        dark:via-primary-400/[0.1]" />
      </div>
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-surface-200/50 dark:border-surface-800/50 shrink-0">
        <AnimatePresence mode="wait">
          {open || isMobile ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <Logo size={34} />
              <div>
                <h1 className="text-base font-bold text-surface-900 dark:text-white tracking-tight">
                  SkillSwap
                </h1>
                <p className="text-[10px] font-medium text-primary-500 tracking-widest uppercase">
                  IT Department
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-auto"
            >
              <Logo size={34} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item, idx) => {
          // Section label
          if (item.section) {
            return (
              <AnimatePresence key={`section-${idx}`}>
                {(open || isMobile) && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-[1.5px] 
                               px-3 pt-4 pb-1"
                  >
                    {item.section}
                  </motion.p>
                )}
              </AnimatePresence>
            );
          }

          const { to, label, icon: Icon, end } = item;
          const badgeCount = badges[to] || 0;
          return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => {
              playSound('click');
              if (isMobile) setOpen(false);
            }}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ripple-container ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative shrink-0">
                  <Icon className="w-5 h-5" />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] 
                                     bg-red-500 text-white text-[9px] font-bold rounded-full 
                                     flex items-center justify-center px-0.5 shadow-sm">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {(open || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm whitespace-nowrap flex-1"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {(open || isMobile) && badgeCount > 0 && (
                  <span className="ml-auto bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 
                                   text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-surface-200/50 dark:border-surface-800/50 p-3 shrink-0">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 
                          flex items-center justify-center shrink-0 shadow-glow-sm">
            <span className="text-white text-sm font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <AnimatePresence>
            {(open || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">
                  {user?.isTutor ? 'Student · Tutor' : user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl 
                     text-surface-500 dark:text-surface-400 
                     hover:bg-red-50 dark:hover:bg-red-950/30 
                     hover:text-red-600 dark:hover:text-red-400 
                     transition-all duration-200"
        >
          <HiLogout className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {(open || isMobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { playSound('toggle'); setOpen(!open); }}
          className="absolute -right-3 top-20 w-6 h-6 
                     bg-white dark:bg-surface-800 
                     border border-surface-200 dark:border-surface-700 
                     rounded-full flex items-center justify-center 
                     text-surface-400 hover:text-primary-500
                     shadow-md transition-colors z-50"
        >
          {open ? <HiChevronLeft className="w-3 h-3" /> : <HiChevronRight className="w-3 h-3" />}
        </motion.button>
      )}
    </motion.aside>
  );
}
