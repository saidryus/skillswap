import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Competency score display with hover tooltip showing breakdown.
 * Matches GLM 5.2 design with progress bar + detailed hover breakdown.
 * 
 * @param {{ score: number, rating: number, grade: number, completedSessions: number, reliability: number }} props
 */
export default function CompetencyTooltip({ score = 0, rating = 0, grade = 0, completedSessions = 0, reliability = 0 }) {
  const [hovered, setHovered] = useState(false);

  // Calculate individual contributions
  const ratingContrib = Math.round((rating / 5) * 35);
  const gradeContrib = grade > 0 ? Math.round((1 - (grade - 1) / 4) * 25) : 0;
  const completionContrib = Math.min(20, Math.round((reliability / 100) * 20));
  const sessionsContrib = Math.min(20, Math.round((completedSessions / 20) * 20));

  const breakdowns = [
    { label: 'Ratings (35%)', value: ratingContrib, color: 'text-amber-500' },
    { label: 'Grade (25%)', value: gradeContrib, color: 'text-emerald-500' },
    { label: 'Completion (20%)', value: completionContrib, color: 'text-blue-500' },
    { label: 'Sessions (20%)', value: sessionsContrib, color: 'text-purple-500' },
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-500 dark:text-surface-400 font-medium">Competency Score</span>
          <span className="font-bold font-mono text-surface-800 dark:text-surface-200">{score}/100</span>
        </div>
        <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(score, 100)}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
          />
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                       bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700
                       rounded-xl p-3.5 min-w-[200px] shadow-lg"
          >
            <p className="text-xs font-bold text-surface-700 dark:text-surface-200 mb-2.5">
              Score Breakdown
            </p>
            <div className="space-y-2">
              {breakdowns.map(b => (
                <div key={b.label} className="flex items-center justify-between text-xs">
                  <span className="text-surface-500 dark:text-surface-400">{b.label}</span>
                  <span className={`font-bold font-mono ${b.color}`}>{b.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-surface-200 dark:border-surface-700 flex justify-between text-xs">
              <span className="font-semibold text-surface-700 dark:text-surface-200">Total</span>
              <span className="font-bold font-mono text-primary-600 dark:text-primary-400">{score}/100</span>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 
                            bg-white dark:bg-surface-800 border-r border-b 
                            border-surface-200 dark:border-surface-700 
                            rotate-45 -mt-[5px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
