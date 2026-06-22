import { motion } from 'framer-motion';

export default function Logo({ size = 40, showText = false, textSize = 'text-xl' }) {
  return (
    <div className="flex items-center gap-3">
      <motion.svg
        whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="url(#swapLogoGrad)" />
        <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />

        {/* Intertwined swap arrows — S-shaped like the reference */}
        {/* Top arrow pointing up-right */}
        <path
          d="M38 28 L58 28 L58 22 L72 34 L58 46 L58 40 L44 40 Q34 40 34 50"
          fill="#ffffff"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
        />

        {/* Bottom arrow pointing down-left */}
        <path
          d="M62 72 L42 72 L42 78 L28 66 L42 54 L42 60 L56 60 Q66 60 66 50"
          fill="#ffffff"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
        />

        {/* Intersection overlay for the intertwined effect */}
        <path
          d="M44 40 Q34 40 34 50 Q34 54 36 56"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M56 60 Q66 60 66 50 Q66 46 64 44"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="swapLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>
        </defs>
      </motion.svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-surface-900 dark:text-white ${textSize}`}>
            Skill<span className="text-primary-500">Swap</span>
          </span>
          <span className="text-surface-400 dark:text-surface-500 text-[10px] font-medium tracking-wider uppercase mt-0.5">
            Peer Tutoring Platform
          </span>
        </div>
      )}
    </div>
  );
}
