import React from 'react';

interface PoqueiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const PoqueiLogo: React.FC<PoqueiLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* Stylized Poquei emblem: Espírito Santo tricolor wave inside glossy 3D pill/circle */}
        <div className={`relative ${iconSizes[size]} shrink-0 rounded-2xl p-0.5 shadow-lg group`}>
          {/* Glowing neon halo */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#00C2FF] via-[#FF2E93] to-[#FF75B5] opacity-80 blur-[6px]" />
          
          {/* Glass sphere/badge container */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-white/30 flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="flagBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00C2FF" />
                  <stop offset="100%" stopColor="#0077B6" />
                </linearGradient>
                <linearGradient id="flagPink" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF75B5" />
                  <stop offset="100%" stopColor="#FF2E93" />
                </linearGradient>
                <linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background gradient */}
              <rect width="100" height="100" fill="#0A1128" />

              {/* Espírito Santo Waves: Blue (top), White (mid), Pink (bottom) */}
              <path
                d="M 10,25 Q 50,15 90,30 L 90,45 Q 50,30 10,40 Z"
                fill="url(#flagBlue)"
              />
              <path
                d="M 10,40 Q 50,30 90,45 L 90,60 Q 50,45 10,55 Z"
                fill="#FFFFFF"
                opacity="0.95"
              />
              <path
                d="M 10,55 Q 50,45 90,60 L 90,75 Q 50,60 10,70 Z"
                fill="url(#flagPink)"
              />

              {/* Central stylized 'P' speech loop */}
              <circle cx="50" cy="45" r="22" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity="0.9" />
              <path d="M 36,45 L 36,75" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

              {/* Highlight glass reflection */}
              <ellipse cx="50" cy="22" rx="35" ry="12" fill="url(#gloss)" />
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <span
          className={`font-extrabold tracking-tight text-white flex items-center ${textSizes[size]}`}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.02em',
          }}
        >
          Poquei
        </span>
      </div>

      {showSubtitle && (
        <p className="mt-2 text-sm text-slate-300 font-medium tracking-wide text-center">
          Poquei o. Jeito capixaba de conversar.
        </p>
      )}
    </div>
  );
};
