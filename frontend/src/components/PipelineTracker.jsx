import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';

/**
 * Horizontal pipeline/status tracker matching GLM 5.2 design.
 * Used in Become a Tutor page to show application progress.
 * 
 * @param {{ steps: string[], currentStepIndex: number, status?: 'pending'|'approved'|'rejected' }} props
 */
export default function PipelineTracker({ steps, currentStepIndex, status }) {
  return (
    <div className="flex items-center gap-0 my-4 overflow-x-auto">
      {steps.map((label, idx) => {
        const isDone = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;
        const isFinal = idx === steps.length - 1;

        // Determine final step color based on status
        let dotClass = 'bg-surface-200 dark:bg-surface-700 border-surface-300 dark:border-surface-600 text-surface-500';
        if (isDone) {
          dotClass = 'bg-emerald-500 border-emerald-500 text-white';
        } else if (isCurrent) {
          if (isFinal && status === 'rejected') {
            dotClass = 'bg-red-500 border-red-500 text-white';
          } else if (isFinal && status === 'approved') {
            dotClass = 'bg-emerald-500 border-emerald-500 text-white';
          } else {
            dotClass = 'bg-primary-500 border-primary-500 text-white animate-glow-pulse';
          }
        }

        return (
          <div key={idx} className="flex items-center">
            {idx > 0 && (
              <div
                className={`w-8 sm:w-12 h-0.5 transition-colors duration-500 ${
                  isDone ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700'
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ${dotClass}`}
              >
                {isDone ? <HiCheck className="w-3.5 h-3.5" /> : idx + 1}
              </motion.div>
              <span className="text-[10px] text-surface-500 dark:text-surface-400 font-medium whitespace-nowrap">
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
