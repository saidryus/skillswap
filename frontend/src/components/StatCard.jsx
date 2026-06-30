import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useScrollReveal';
import { useState } from 'react';

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    accent: 'text-blue-600 dark:text-blue-400',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]',
    particle: '#3b82f6',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    accent: 'text-emerald-600 dark:text-emerald-400',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]',
    particle: '#10b981',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
    accent: 'text-purple-600 dark:text-purple-400',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]',
    particle: '#8b5cf6',
  },
  orange: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    accent: 'text-amber-600 dark:text-amber-400',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]',
    particle: '#f59e0b',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    accent: 'text-red-600 dark:text-red-400',
    glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]',
    particle: '#ef4444',
  },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, index = 0 }) {
  const colors = colorMap[color] || colorMap.blue;
  const countRef = useCountUp(typeof value === 'number' ? value : 0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25, ease: 'easeOut' } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl p-5 border 
                  bg-white dark:bg-surface-900
                  border-surface-200/80 dark:border-surface-800/80
                  shadow-sm hover:shadow-lg transition-all duration-300 group
                  ${colors.glow}`}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className={`absolute inset-0 opacity-0 ${colors.bg}`}
        animate={{ opacity: isHovered ? 0.5 : 0.3 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated corner accent */}
      <motion.div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${colors.particle}15, transparent 70%)` }}
        animate={isHovered ? { scale: [1, 1.2, 1], rotate: [0, 90, 180] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <motion.div
            className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center`}
            animate={isHovered ? { rotate: [0, -5, 5, 0], scale: 1.15 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        </div>
        <p className="text-3xl font-bold text-surface-900 dark:text-white" ref={countRef}>
          {value}
        </p>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="text-xs text-surface-500 dark:text-surface-400 mt-1.5"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Bottom shine line on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.particle}, transparent)` }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isHovered ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}
