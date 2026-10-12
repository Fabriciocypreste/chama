import React from 'react';

interface AndroidNavBarProps {
  onBack?: () => void;
  onHome?: () => void;
  className?: string;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  onBack,
  onHome,
  className = '',
}) => {
  return (
    <div
      className={`w-full h-5 flex items-center justify-center pb-2 select-none z-30 ${className}`}
    >
      {/* Gesture bar pill */}
      <button
        type="button"
        onClick={onHome || onBack}
        title="Início"
        className="w-32 h-1 bg-white/40 hover:bg-white/70 active:scale-95 transition-all rounded-full cursor-pointer"
        aria-label="Barra de navegação Android"
      />
    </div>
  );
};
