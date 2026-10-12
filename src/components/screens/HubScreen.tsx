import React, { useState } from 'react';
import {
  Star,
  Laptop,
  CreditCard,
  Smile,
  Clock,
  Palette,
  ChevronRight,
  Sparkles,
  Building2,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { BottomNav } from '../common/BottomNav';
import { PoqueiLogo } from '../common/PoqueiLogo';
import { EspiritoSantoBadge } from '../common/EspiritoSantoBadge';

interface HubScreenProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenPrefeiturasGuide?: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenPrefeiturasGuide,
}) => {
  const [activeTheme, setActiveTheme] = useState<'noite' | 'sunset' | 'camburi'>('noite');

  const hubItems = [
    {
      id: 'prefeituras',
      title: 'Prefeituras do ES',
      icon: Building2,
      iconColor: 'text-[#00C2FF]',
      action: () => {
        if (onOpenPrefeiturasGuide) onOpenPrefeiturasGuide();
        else alert('Guia oficial com telefones e WhatsApp das prefeituras capixabas');
      },
    },
    {
      id: 'favoritas',
      title: 'Mensagens favoritas',
      icon: Star,
      iconColor: 'text-amber-400',
      action: () => alert('Suas mensagens marcadas com estrela no Poquei'),
    },
    {
      id: 'dispositivos',
      title: 'Dispositivos conectados',
      icon: Laptop,
      iconColor: 'text-[#00C2FF]',
      action: () => alert('Poquei Web: Conectado no Chrome (Vitória, ES)'),
    },
    {
      id: 'pagamentos',
      title: 'Pagamentos',
      icon: CreditCard,
      iconColor: 'text-emerald-400',
      action: () => alert('Pix Capixaba via Poquei: Envie e receba em tempo real!'),
    },
    {
      id: 'figurinhas',
      title: 'Figurinhas',
      icon: Smile,
      iconColor: 'text-[#FF2E93]',
      action: () => alert('Pacote de Stickers: Expressões Capixabas ativado!'),
    },
    {
      id: 'temporarias',
      title: 'Mensagens temporárias',
      icon: Clock,
      iconColor: 'text-purple-400',
      action: () => alert('Mensagens autodestrutivas: 24h, 7 dias ou 90 dias'),
    },
    {
      id: 'temas',
      title: 'Temas',
      icon: Palette,
      iconColor: 'text-pink-400',
      action: () => {
        const nextTheme = activeTheme === 'noite' ? 'sunset' : activeTheme === 'sunset' ? 'camburi' : 'noite';
        setActiveTheme(nextTheme);
      },
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0A1224] text-white select-none">
      {/* Top Status Bar */}
      <AndroidStatusBar />

      {/* Header with Centered Poquei Logo */}
      <header className="px-5 pt-1 pb-4 flex flex-col items-center justify-center z-20">
        <PoqueiLogo size="md" />
      </header>

      {/* 2-Column Grid of Shortcuts */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-4 z-10">
        <div className="grid grid-cols-2 gap-3">
          {hubItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="glass-card rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 hover:bg-slate-800/70 border border-white/10 active:scale-95 transition-all cursor-pointer group shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                  <Icon size={24} className={item.iconColor} />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick settings shortcut row */}
        <div
          onClick={onOpenSettings}
          className="glass-card rounded-2xl p-3.5 flex items-center justify-between border border-white/10 hover:bg-slate-800/60 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-[#FF2E93] flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Abrir Configurações do App</h4>
              <p className="text-[11px] text-slate-400">Privacidade, notificações e dados</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Bottom Decorative Capixaba Signature Banner */}
        <div className="pt-2 pb-1 flex flex-col items-center justify-center">
          <div className="relative py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500/10 via-sky-500/10 to-pink-500/10 border border-white/10 shadow-lg flex flex-col items-center">
            {/* Neon background ambient light */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF2E93]/20 via-transparent to-[#00C2FF]/20 blur-xl pointer-events-none" />
            <EspiritoSantoBadge size="lg" />
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Bottom Android Gesture Bar */}
      <AndroidNavBar onHome={() => onTabChange('conversas')} />
    </div>
  );
};
