import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  hasStory?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isOnline = false,
  hasStory = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-2xl',
  };

  const badgeSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  // Get first letters
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  // Consistent background color based on name
  const colors = [
    'from-pink-500 to-rose-600',
    'from-sky-500 to-blue-600',
    'from-cyan-500 to-teal-600',
    'from-fuchsia-500 to-purple-600',
    'from-indigo-500 to-sky-600',
  ];
  const colorIndex = Math.abs(name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % colors.length;
  const gradient = colors[colorIndex];

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {/* Story border glow if has active story */}
      {hasStory && (
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-[#FF2E93] via-[#00C2FF] to-[#FF75B5] animate-spin-slow opacity-90 p-[2px]" />
      )}

      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-white border border-white/10 select-none shadow-md`}
      >
        {!imgError && src ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center shadow-inner`}>
            <span>{initials || '?'}</span>
          </div>
        )}
      </div>

      {/* Online indicator */}
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 ${badgeSizes[size]} bg-emerald-500 rounded-full ring-2 ring-slate-900 shadow-sm`}
          title="Online"
        />
      )}
    </div>
  );
};
