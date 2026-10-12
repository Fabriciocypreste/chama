import React from 'react';

interface CityNightBackgroundProps {
  className?: string;
  overlayOpacity?: string;
  showBridge?: boolean;
}

export const CityNightBackground: React.FC<CityNightBackgroundProps> = ({
  className = '',
  overlayOpacity = 'bg-slate-950/60',
  showBridge = true,
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* Night Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060D1E] via-[#09152E] to-[#040915]" />

      {/* Atmospheric glow from the city lights and bay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-[60%] rounded-full bg-gradient-to-t from-pink-600/15 via-sky-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Panoramic SVG: Vitória, Terceira Ponte, Convento da Penha, and bay reflections */}
      {showBridge && (
        <svg
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full opacity-65 mix-blend-screen"
        >
          <defs>
            {/* Mountain Gradient (Morro do Moreno / Convento cliff) */}
            <linearGradient id="mountainDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B1B38" />
              <stop offset="100%" stopColor="#040914" />
            </linearGradient>

            {/* Bridge Cable Glow */}
            <linearGradient id="bridgeLights" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFAA00" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFF0B0" stopOpacity="1" />
              <stop offset="100%" stopColor="#FF4081" stopOpacity="0.8" />
            </linearGradient>

            {/* Water Reflection Gradient */}
            <linearGradient id="waterGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFB300" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#00C2FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#040914" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Distant stars */}
          <g fill="#FFFFFF" opacity="0.6">
            <circle cx="120" cy="80" r="1.5" />
            <circle cx="280" cy="120" r="1.2" />
            <circle cx="450" cy="60" r="2" opacity="0.9" />
            <circle cx="680" cy="100" r="1.2" />
            <circle cx="820" cy="70" r="1.8" />
            <circle cx="910" cy="140" r="1.2" />
            <circle cx="180" cy="180" r="1.4" />
            <circle cx="560" cy="140" r="1.6" />
            <circle cx="760" cy="190" r="1.3" />
          </g>

          {/* Distant Mountain Ridge: Vila Velha / Morro do Moreno */}
          <path
            d="M 650,560 Q 750,340 850,380 T 1000,560 L 1000,650 L 650,650 Z"
            fill="url(#mountainDark)"
          />

          {/* Convento da Penha illuminated atop the cliff */}
          <g transform="translate(810, 360)">
            <rect x="0" y="0" width="16" height="12" fill="#FFE899" filter="drop-shadow(0 0 4px #FFE899)" />
            <polygon points="8,-8 -2,0 18,0" fill="#E65100" />
            <rect x="18" y="-6" width="6" height="18" fill="#FFE899" />
            {/* Cross atop tower */}
            <line x1="21" y1="-12" x2="21" y2="-6" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="18" y1="-9" x2="24" y2="-9" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>

          {/* Terceira Ponte - The iconic curved high bridge connecting Vitória & Vila Velha */}
          {/* Main bridge roadway arc */}
          <path
            d="M 50,600 Q 420,410 950,560"
            fill="none"
            stroke="#1E293B"
            strokeWidth="10"
          />
          {/* Roadway lights strip */}
          <path
            d="M 50,598 Q 420,408 950,558"
            fill="none"
            stroke="url(#bridgeLights)"
            strokeWidth="3.5"
            filter="drop-shadow(0 0 6px #FFAA00)"
          />

          {/* Bridge supporting pillars and stays */}
          <line x1="360" y1="465" x2="360" y2="650" stroke="#0F172A" strokeWidth="7" />
          <line x1="480" y1="465" x2="480" y2="650" stroke="#0F172A" strokeWidth="7" />
          
          {/* Cable stays radiating from the main towers */}
          <g stroke="#FFD54F" strokeWidth="0.8" opacity="0.75">
            <line x1="420" y1="410" x2="330" y2="480" />
            <line x1="420" y1="410" x2="360" y2="465" />
            <line x1="420" y1="410" x2="480" y2="465" />
            <line x1="420" y1="410" x2="520" y2="485" />
          </g>

          {/* City skyline buildings along Vitória shore (left) */}
          <g fill="#0B1428" opacity="0.95">
            <rect x="30" y="520" width="22" height="100" />
            <rect x="58" y="490" width="28" height="130" />
            <rect x="92" y="535" width="20" height="85" />
            <rect x="118" y="505" width="30" height="115" />
            <rect x="154" y="540" width="24" height="80" />
            <rect x="184" y="515" width="35" height="105" />
            <rect x="225" y="550" width="26" height="70" />
          </g>

          {/* Building window lights */}
          <g fill="#FFD54F" opacity="0.7">
            <rect x="64" y="505" width="4" height="3" />
            <rect x="74" y="520" width="4" height="3" />
            <rect x="64" y="535" width="4" height="3" />
            <rect x="124" y="525" width="4" height="3" fill="#00C2FF" />
            <rect x="134" y="540" width="4" height="3" />
            <rect x="194" y="530" width="5" height="3" fill="#FF4081" />
            <rect x="204" y="545" width="4" height="3" />
          </g>

          {/* Bay Water Surface & Reflections */}
          <rect x="0" y="620" width="1000" height="180" fill="#030814" />
          <ellipse cx="450" cy="660" rx="380" ry="40" fill="url(#waterGlow)" />
          
          {/* Water light ripples */}
          <g stroke="#FFC107" strokeWidth="1.2" opacity="0.35">
            <line x1="380" y1="635" x2="480" y2="635" />
            <line x1="350" y1="645" x2="510" y2="645" />
            <line x1="400" y1="655" x2="470" y2="655" />
            <line x1="320" y1="670" x2="540" y2="670" stroke="#00C2FF" />
            <line x1="360" y1="690" x2="500" y2="690" stroke="#FF4081" />
          </g>
        </svg>
      )}

      {/* Dark vignette overlay for text legibility */}
      <div className={`absolute inset-0 ${overlayOpacity} backdrop-blur-[1px]`} />
    </div>
  );
};
