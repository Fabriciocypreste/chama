import React from 'react';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { PoqueiLogo } from '../common/PoqueiLogo';
import { EspiritoSantoBadge } from '../common/EspiritoSantoBadge';
import { CityNightBackground } from '../common/CityNightBackground';

interface LoginScreenProps {
  onLogin: () => void;
  onContinueGoogle?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onContinueGoogle,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 text-white select-none">
      {/* City night background with Terceira Ponte and bay reflections */}
      <CityNightBackground overlayOpacity="bg-slate-950/40" />

      {/* Top Status Bar */}
      <AndroidStatusBar className="relative z-20" />

      {/* Center Hero: Poquei Logo, Title & Slogan */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <PoqueiLogo size="xl" />

        <div className="mt-4 max-w-xs">
          <p className="text-base text-slate-200/90 font-medium tracking-wide drop-shadow-md">
            Poquei o. Jeito capixaba de conversar.
          </p>
        </div>
      </div>

      {/* Bottom Action Area: Google button, Sign Up, Login, and Espírito Santo badge */}
      <div className="relative z-20 px-6 pb-4 flex flex-col items-center gap-3.5 max-w-md mx-auto w-full">
        {/* Continue with Google button */}
        <button
          type="button"
          onClick={onContinueGoogle || onLogin}
          className="w-full py-3.5 px-5 bg-white text-slate-800 rounded-full font-semibold text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer"
        >
          {/* Google 'G' official colored logo */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar com Google</span>
        </button>

        {/* Create account button */}
        <button
          type="button"
          onClick={onLogin}
          className="w-full py-3.5 px-5 bg-slate-900/80 hover:bg-slate-800/90 text-white rounded-full font-semibold text-sm border border-white/20 backdrop-blur-md active:scale-[0.98] transition-all shadow-md cursor-pointer"
        >
          Criar conta
        </button>

        {/* Enter link */}
        <button
          type="button"
          onClick={onLogin}
          className="text-xs text-sky-400 hover:text-sky-300 font-semibold tracking-wide py-1 cursor-pointer transition-colors"
        >
          Entrar
        </button>

        {/* Feito no Espírito Santo badge */}
        <div className="pt-2 pb-1">
          <EspiritoSantoBadge size="md" />
        </div>

        {/* Bottom Android bar */}
        <AndroidNavBar onHome={onLogin} />
      </div>
    </div>
  );
};
