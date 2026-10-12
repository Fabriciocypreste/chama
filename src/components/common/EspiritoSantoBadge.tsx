import React from 'react';

interface EspiritoSantoBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EspiritoSantoBadge: React.FC<EspiritoSantoBadgeProps> = ({
  className = '',
  size = 'md',
}) => {
  const mapSizes = {
    sm: 'w-7 h-9',
    md: 'w-9 h-12',
    lg: 'w-12 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Map silhouette of Espírito Santo filled with the state flag stripes */}
      <div className={`relative ${mapSizes[size]} shrink-0 drop-shadow-[0_4px_12px_rgba(255,46,147,0.35)]`}>
        <svg viewBox="0 0 100 130" className="w-full h-full">
          <defs>
            <linearGradient id="esFlagGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              {/* Blue at top, white in middle, pink at bottom */}
              <stop offset="0%" stopColor="#00A3E0" />
              <stop offset="32%" stopColor="#00A3E0" />
              <stop offset="34%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#FFFFFF" />
              <stop offset="67%" stopColor="#FF75B5" />
              <stop offset="100%" stopColor="#FF2E93" />
            </linearGradient>
            <filter id="esGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF2E93" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Stylized recognizable silhouette of Espírito Santo */}
          <path
            d="M 45,5 
               C 60,8 70,20 75,32 
               C 80,45 82,60 85,75 
               C 88,90 78,110 65,122 
               C 52,126 40,118 35,110 
               C 28,98 22,85 24,70 
               C 26,55 30,42 32,30 
               C 34,18 38,10 45,5 Z"
            fill="url(#esFlagGradient)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            filter="url(#esGlow)"
          />

          {/* Coastal indentation around Vitória bay */}
          <path
            d="M 85,75 C 78,80 77,88 82,92"
            stroke="#00C2FF"
            strokeWidth="1.5"
            fill="none"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Signature calligraphy */}
      <div className="flex flex-col">
        <span
          className={`font-script text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${textSizes[size]}`}
          style={{ letterSpacing: '0.02em' }}
        >
          Feito no
        </span>
        <span
          className={`font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-white to-sky-300 leading-none ${textSizes[size]}`}
        >
          Espírito Santo.
        </span>
      </div>
    </div>
  );
};
