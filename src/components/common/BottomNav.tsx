import React from 'react';
import { MessageSquare, Phone, Users2, CircleDot, MoreHorizontal } from 'lucide-react';
import { ActiveTab } from '../../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unreadChatsCount?: number;
  missedCallsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadChatsCount = 4,
  missedCallsCount = 1,
}) => {
  const tabs = [
    {
      id: 'conversas' as ActiveTab,
      label: 'Conversas',
      icon: MessageSquare,
      badge: unreadChatsCount,
    },
    {
      id: 'ligacoes' as ActiveTab,
      label: 'Ligações',
      icon: Phone,
      badge: missedCallsCount > 0 ? missedCallsCount : undefined,
    },
    {
      id: 'comunidades' as ActiveTab,
      label: 'Comunidades',
      icon: Users2,
    },
    {
      id: 'status' as ActiveTab,
      label: 'Status',
      icon: CircleDot,
      hasDot: true,
    },
    {
      id: 'mais' as ActiveTab,
      label: 'Mais',
      icon: MoreHorizontal,
    },
  ];

  return (
    <nav
      aria-label="Navegação principal do app"
      className="w-full bg-[#091122]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around select-none z-30"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[58px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
              isActive ? 'text-[#FF2E93]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Icon container */}
            <div className="relative">
              <IconComponent
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,46,147,0.7)]' : ''}`}
              />

              {/* Status active dot */}
              {tab.hasDot && !isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00C2FF] ring-2 ring-[#091122]" />
              )}
            </div>

            {/* Tab Label */}
            <span
              className={`text-[10px] mt-1 tracking-tight font-medium ${
                isActive ? 'text-[#FF2E93] font-semibold' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
