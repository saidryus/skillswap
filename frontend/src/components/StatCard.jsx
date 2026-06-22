import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useScrollReveal';

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
    accent: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    accent: 'text-red-600 dark:text-red-400',
  },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colors = colorMap[color] || colorMap.blue;
  const countRef = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl p-5 border 
                  bg-white dark:bg-surface-900
                  border-surface-200/80 dark:border-surface-800/80
                  shadow-sm hover:shadow-lg transition-all duration-300 group`}
    >
      {/* Subtle background gradient */}
      <div className={`absolute inset-0 opacity-30 dark:opacity-20 ${colors.bg}`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center 
                          group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-bold text-surface-900 dark:text-white" ref={countRef}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
