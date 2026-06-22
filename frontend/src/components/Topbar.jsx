import { HiMenu, HiSun, HiMoon, HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { playSound, isSoundEnabled, setSoundEnabled } from '../utils/sounds';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleThemeToggle = () => {
    playSound('toggle');
    toggleTheme();
  };

  const handleSoundToggle = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
    if (newState) playSound('pop');
  };

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 
                        bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl
                        border-b border-surface-200/50 dark:border-surface-800/50
                        transition-colors duration-300 z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { playSound('click'); onMenuClick(); }}
          className="btn-icon"
          aria-label="Toggle menu"
        >
          <HiMenu className="w-5 h-5" />
        </motion.button>
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sound toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSoundToggle}
          className="btn-icon"
          aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
          title={soundOn ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundOn ? <HiVolumeUp className="w-4 h-4" /> : <HiVolumeOff className="w-4 h-4" />}
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleThemeToggle}
          className="btn-icon relative overflow-hidden"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {isDark ? <HiSun className="w-4 h-4 text-amber-400" /> : <HiMoon className="w-4 h-4 text-primary-500" />}
          </motion.div>
        </motion.button>

        {/* Notifications */}
        <NotificationBell />

        {/* User avatar */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2.5 pl-2 sm:pl-3 ml-1 sm:ml-2 
                     border-l border-surface-200 dark:border-surface-700"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 
                          flex items-center justify-center shadow-glow-sm">
            <span className="text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400 capitalize leading-tight">
              {user?.isTutor ? 'Student · Tutor' : user?.role}
            </p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
