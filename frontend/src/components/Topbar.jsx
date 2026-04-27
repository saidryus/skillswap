import { HiMenu, HiPrinter } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotificationBell from './NotificationBell';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700/50 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-slate-400 hover:text-slate-100 transition-colors"
        >
          <HiMenu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-slate-100">
            Smart Campus Management
          </h1>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.role === 'student' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/print/study-load')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
          >
            <HiPrinter className="w-4 h-4" />
            <span>Study Load</span>
          </motion.button>
        )}
        <NotificationBell />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-100">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
