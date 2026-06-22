import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';

/**
 * Wizard step indicator matching GLM 5.2 design.
 * @param {{ steps: { label: string }[], currentStep: number }} props
 */
export default function WizardSteps({ steps, currentStep }) {
  return (
    <div className="flex gap-2 mb-8">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
              isActive
                ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-950/30'
                : isCompleted
                ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-glow-sm'
                  : isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
              }`}
            >
              {isCompleted ? <HiCheck className="w-3.5 h-3.5" /> : idx + 1}
            </div>
            <span
              className={`text-sm font-medium transition-colors duration-300 hidden sm:block ${
                isActive
                  ? 'text-primary-700 dark:text-primary-300'
                  : isCompleted
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-surface-500 dark:text-surface-400'
              }`}
            >
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
