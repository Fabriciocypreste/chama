import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface AndroidStatusBarProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  className = '',
  theme = 'dark',
}) => {
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';

  return (
    <div
      className={`w-full flex items-center justify-between px-6 pt-3 pb-2 text-xs select-none z-30 ${textColor} ${className}`}
    >
      {/* Current Time */}
      <span className="font-semibold tracking-tight text-[13px]">{time}</span>

      {/* Network, Wi-Fi & Battery */}
      <div className="flex items-center gap-1.5">
        {/* Cell signal icon */}
        <div className="flex items-end gap-[1.5px] h-3.5 mr-0.5">
          <div className="w-[3px] h-1.5 bg-current rounded-xs" />
          <div className="w-[3px] h-2 bg-current rounded-xs" />
          <div className="w-[3px] h-2.5 bg-current rounded-xs" />
          <div className="w-[3px] h-3 bg-current rounded-xs" />
        </div>

        {/* Wi-Fi Icon */}
        <Wifi size={14} strokeWidth={2.5} />

        {/* Battery Icon */}
        <div className="flex items-center gap-0.5">
          <Battery size={16} strokeWidth={2.5} className="rotate-90 fill-current" />
        </div>
      </div>
    </div>
  );
};
