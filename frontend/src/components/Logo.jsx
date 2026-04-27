// Trophe Greek-themed SVG logo
// Features: Owl of Athena centered in a laurel wreath with Greek key (meander) border

export default function Logo({ size = 40, showText = false, textSize = 'text-xl' }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle background */}
        <circle cx="50" cy="50" r="48" fill="#1e3a8a" />
        <circle cx="50" cy="50" r="48" fill="url(#bgGrad)" />

        {/* Greek key (meander) border ring */}
        <circle cx="50" cy="50" r="46" stroke="#60a5fa" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="43" stroke="#3b82f6" strokeWidth="0.3" fill="none" />

        {/* Laurel wreath - left side */}
        <g fill="#22c55e" opacity="0.9">
          {/* Left laurel leaves */}
          <ellipse cx="14" cy="50" rx="5" ry="2.5" transform="rotate(-10 14 50)" />
          <ellipse cx="16" cy="40" rx="5" ry="2.5" transform="rotate(-30 16 40)" />
          <ellipse cx="21" cy="31" rx="5" ry="2.5" transform="rotate(-50 21 31)" />
          <ellipse cx="29" cy="24" rx="5" ry="2.5" transform="rotate(-70 29 24)" />
          <ellipse cx="39" cy="19" rx="5" ry="2.5" transform="rotate(-85 39 19)" />
          <ellipse cx="14" cy="60" rx="5" ry="2.5" transform="rotate(10 14 60)" />
          <ellipse cx="16" cy="70" rx="5" ry="2.5" transform="rotate(30 16 70)" />
          <ellipse cx="21" cy="79" rx="5" ry="2.5" transform="rotate(50 21 79)" />
          <ellipse cx="29" cy="86" rx="5" ry="2.5" transform="rotate(70 29 86)" />
          <ellipse cx="39" cy="91" rx="5" ry="2.5" transform="rotate(85 39 91)" />
        </g>

        {/* Laurel wreath - right side */}
        <g fill="#22c55e" opacity="0.9">
          <ellipse cx="86" cy="50" rx="5" ry="2.5" transform="rotate(10 86 50)" />
          <ellipse cx="84" cy="40" rx="5" ry="2.5" transform="rotate(30 84 40)" />
          <ellipse cx="79" cy="31" rx="5" ry="2.5" transform="rotate(50 79 31)" />
          <ellipse cx="71" cy="24" rx="5" ry="2.5" transform="rotate(70 71 24)" />
          <ellipse cx="61" cy="19" rx="5" ry="2.5" transform="rotate(85 61 19)" />
          <ellipse cx="86" cy="60" rx="5" ry="2.5" transform="rotate(-10 86 60)" />
          <ellipse cx="84" cy="70" rx="5" ry="2.5" transform="rotate(-30 84 70)" />
          <ellipse cx="79" cy="79" rx="5" ry="2.5" transform="rotate(-50 79 79)" />
          <ellipse cx="71" cy="86" rx="5" ry="2.5" transform="rotate(-70 71 86)" />
          <ellipse cx="61" cy="91" rx="5" ry="2.5" transform="rotate(-85 61 91)" />
        </g>

        {/* Wreath stems */}
        <path d="M 50 93 Q 42 90 36 85" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 50 93 Q 58 90 64 85" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="93" r="2" fill="#fbbf24" />

        {/* Inner circle for owl */}
        <circle cx="50" cy="48" r="28" fill="#0f172a" opacity="0.7" />

        {/* OWL BODY */}
        {/* Body */}
        <ellipse cx="50" cy="58" rx="12" ry="14" fill="#1e40af" />
        {/* Wing left */}
        <ellipse cx="39" cy="58" rx="6" ry="10" fill="#1d4ed8" transform="rotate(-10 39 58)" />
        {/* Wing right */}
        <ellipse cx="61" cy="58" rx="6" ry="10" fill="#1d4ed8" transform="rotate(10 61 58)" />
        {/* Chest feather pattern */}
        <ellipse cx="50" cy="60" rx="7" ry="9" fill="#2563eb" opacity="0.6" />

        {/* OWL HEAD */}
        <circle cx="50" cy="42" r="11" fill="#1e40af" />

        {/* Ear tufts */}
        <polygon points="43,33 40,26 46,31" fill="#1e40af" />
        <polygon points="57,33 60,26 54,31" fill="#1e40af" />

        {/* Eyes - large and wise */}
        {/* Left eye */}
        <circle cx="44" cy="42" r="5.5" fill="#fbbf24" />
        <circle cx="44" cy="42" r="3.5" fill="#1e3a8a" />
        <circle cx="44" cy="42" r="2" fill="#0f172a" />
        <circle cx="45.5" cy="40.5" r="0.8" fill="white" />
        {/* Right eye */}
        <circle cx="56" cy="42" r="5.5" fill="#fbbf24" />
        <circle cx="56" cy="42" r="3.5" fill="#1e3a8a" />
        <circle cx="56" cy="42" r="2" fill="#0f172a" />
        <circle cx="57.5" cy="40.5" r="0.8" fill="white" />

        {/* Beak */}
        <polygon points="50,44 47,48 53,48" fill="#fbbf24" />

        {/* Facial disc */}
        <path d="M 38 38 Q 44 34 50 35 Q 56 34 62 38 Q 60 50 50 52 Q 40 50 38 38 Z" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5" />

        {/* Talons */}
        <line x1="44" y1="71" x2="41" y2="76" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="44" y1="71" x2="44" y2="77" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="44" y1="71" x2="47" y2="76" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="56" y1="71" x2="53" y2="76" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="56" y1="71" x2="56" y2="77" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="56" y1="71" x2="59" y2="76" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />

        {/* Greek key pattern dots around inner ring */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 36 * Math.cos(rad);
          const y = 50 + 36 * Math.sin(rad);
          return <circle key={i} cx={x} cy={y} r="0.8" fill="#60a5fa" opacity="0.6" />;
        })}

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="bgGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-white tracking-wide ${textSize}`} style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.08em' }}>
            ΤΡΟΦΗ
          </span>
          <span className="text-blue-400 text-xs tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
            Trophe
          </span>
        </div>
      )}
    </div>
  );
}
