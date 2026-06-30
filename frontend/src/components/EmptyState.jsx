import { motion } from 'framer-motion';

const illustrations = {
  sessions: (
    <svg className="w-24 h-24 text-surface-300 dark:text-surface-600" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" className="stroke-current" strokeWidth="2" strokeDasharray="8 4" />
      <rect x="40" y="35" width="40" height="50" rx="4" className="stroke-current" strokeWidth="2" />
      <line x1="48" y1="50" x2="72" y2="50" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="58" x2="65" y2="58" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="66" x2="68" y2="66" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="80" r="3" className="fill-current opacity-50" />
    </svg>
  ),
  notifications: (
    <svg className="w-24 h-24 text-surface-300 dark:text-surface-600" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" className="stroke-current" strokeWidth="2" strokeDasharray="8 4" />
      <path d="M60 30 C60 30 45 40 45 55 L45 70 L40 75 L80 75 L75 70 L75 55 C75 40 60 30 60 30Z" className="stroke-current" strokeWidth="2" strokeLinejoin="round" />
      <path d="M54 75 C54 79 56.7 82 60 82 C63.3 82 66 79 66 75" className="stroke-current" strokeWidth="2" />
      <circle cx="72" cy="38" r="6" className="fill-current opacity-30" />
    </svg>
  ),
  tutors: (
    <svg className="w-24 h-24 text-surface-300 dark:text-surface-600" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" className="stroke-current" strokeWidth="2" strokeDasharray="8 4" />
      <circle cx="60" cy="45" r="12" className="stroke-current" strokeWidth="2" />
      <path d="M38 85 C38 70 48 62 60 62 C72 62 82 70 82 85" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 35 L60 28 L68 35" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  schedule: (
    <svg className="w-24 h-24 text-surface-300 dark:text-surface-600" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" className="stroke-current" strokeWidth="2" strokeDasharray="8 4" />
      <rect x="35" y="35" width="50" height="50" rx="4" className="stroke-current" strokeWidth="2" />
      <line x1="35" y1="48" x2="85" y2="48" className="stroke-current" strokeWidth="2" />
      <line x1="52" y1="35" x2="52" y2="48" className="stroke-current" strokeWidth="1.5" />
      <line x1="68" y1="35" x2="68" y2="48" className="stroke-current" strokeWidth="1.5" />
      <circle cx="50" cy="60" r="2" className="fill-current opacity-50" />
      <circle cx="60" cy="60" r="2" className="fill-current opacity-50" />
      <circle cx="70" cy="60" r="2" className="fill-current opacity-50" />
      <circle cx="50" cy="72" r="2" className="fill-current opacity-50" />
    </svg>
  ),
  files: (
    <svg className="w-24 h-24 text-surface-300 dark:text-surface-600" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" className="stroke-current" strokeWidth="2" strokeDasharray="8 4" />
      <path d="M45 35 L45 85 L75 85 L75 50 L60 35 Z" className="stroke-current" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 35 L60 50 L75 50" className="stroke-current" strokeWidth="2" strokeLinejoin="round" />
      <line x1="52" y1="62" x2="68" y2="62" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="72" x2="64" y2="72" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg className="w-24 h-24 text-surface-300 dark:text-surface-600" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" className="stroke-current" strokeWidth="2" strokeDasharray="8 4" />
      <circle cx="55" cy="52" r="16" className="stroke-current" strokeWidth="2.5" />
      <line x1="66" y1="63" x2="80" y2="77" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  generic: (
    <svg className="w-24 h-24 text-surface-300 dark:text-surface-600" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" className="stroke-current" strokeWidth="2" strokeDasharray="8 4" />
      <path d="M50 55 L60 45 L70 55" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="60" y1="45" x2="60" y2="75" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default function EmptyState({
  type = 'generic',
  title = 'Nothing here yet',
  description = 'Get started by taking an action below.',
  primaryAction,
  primaryLabel,
  secondaryAction,
  secondaryLabel,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        {illustrations[type] || illustrations.generic}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-bold text-surface-700 dark:text-surface-300 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3"
      >
        {primaryAction && (
          <button onClick={primaryAction} className="btn-primary">
            {primaryLabel || 'Get Started'}
          </button>
        )}
        {secondaryAction && (
          <button onClick={secondaryAction} className="btn-secondary">
            {secondaryLabel || 'Learn More'}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
