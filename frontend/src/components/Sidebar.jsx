import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import {
  HiHome, HiUsers, HiAcademicCap, HiCalendar,
  HiClipboardList, HiBell, HiLogout, HiChevronLeft, HiChevronRight
} from 'react-icons/hi';

const navItems = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: HiHome, end: true },
    { to: '/admin/users', label: 'Users', icon: HiUsers },
    { to: '/admin/courses', label: 'Courses', icon: HiAcademicCap },
    { to: '/admin/schedules', label: 'Schedules', icon: HiCalendar },
    { to: '/admin/attendance', label: 'Attendance', icon: HiClipboardList },
    { to: '/admin/announcements', label: 'Announcements', icon: HiBell },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: HiHome, end: true },
    { to: '/faculty/courses', label: 'My Courses', icon: HiAcademicCap },
    { to: '/faculty/attendance', label: 'Attendance', icon: HiClipboardList },
    { to: '/faculty/announcements', label: 'Announcements', icon: HiBell },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: HiHome, end: true },
    { to: '/student/courses', label: 'My Courses', icon: HiAcademicCap },
    { to: '/student/schedule', label: 'My Schedule', icon: HiCalendar },
    { to: '/student/attendance', label: 'Attendance', icon: HiClipboardList },
    { to: '/student/announcements', label: 'Announcements', icon: HiBell },
  ],
};

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: open ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-slate-900 border-r border-slate-700/50 flex flex-col overflow-hidden relative z-10"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-slate-700/50 shrink-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Logo size={36} showText textSize="text-base" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Logo size={36} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-slate-700/50 p-3 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-slate-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <HiLogout className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors z-20"
      >
        {open ? <HiChevronLeft className="w-3 h-3" /> : <HiChevronRight className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
