import { HiCheckCircle, HiExclamation, HiXCircle } from 'react-icons/hi';

/**
 * Grade detection confidence badge matching GLM 5.2 design.
 * @param {{ confidence: 'high'|'low'|'error'|'none', grade?: number|string }} props
 */
export default function ConfidenceBadge({ confidence, grade }) {
  const configs = {
    high: {
      icon: HiCheckCircle,
      label: 'High Confidence',
      className: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    },
    low: {
      icon: HiExclamation,
      label: 'Low Confidence',
      className: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    },
    error: {
      icon: HiXCircle,
      label: 'OCR Error',
      className: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50',
    },
    none: {
      icon: HiExclamation,
      label: 'Not Detected',
      className: 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border-surface-200 dark:border-surface-700',
    },
  };

  const config = configs[confidence] || configs.none;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {grade && <span className="font-mono">{grade}</span>}
      {config.label}
    </span>
  );
}
