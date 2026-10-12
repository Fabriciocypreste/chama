import React, { useState } from 'react';
import { Plus, ChevronRight, Users, MessageCircle, Sparkles } from 'lucide-react';
import { Community, ActiveTab } from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { BottomNav } from '../common/BottomNav';

interface CommunitiesScreenProps {
  communities: Community[];
  onSelectCommunity?: (community: Community) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const CommunitiesScreen: React.FC<CommunitiesScreenProps> = ({
  communities,
  onSelectCommunity,
  activeTab,
  onTabChange,
}) => {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0A1224] text-white select-none">
      {/* Top Status Bar */}
      <AndroidStatusBar />

      {/* Header */}
      <header className="px-5 pt-1 pb-3 flex items-center justify-between z-20">
        <h1 className="text-xl font-bold tracking-tight text-white">Comunidades</h1>

        <button
          type="button"
          title="Nova comunidade"
          onClick={() => alert('Criar nova comunidade Capixaba')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={22} />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-3 z-10">
        {communities.map((com) => {
          const isExpanded = selectedCommunity?.id === com.id;

          return (
            <div
              key={com.id}
              className="glass-card rounded-2xl p-4 transition-all hover:bg-slate-800/60 border border-white/10 cursor-pointer"
              onClick={() => {
                setSelectedCommunity(isExpanded ? null : com);
                if (onSelectCommunity) onSelectCommunity(com);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Thumbnail / Emoji Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {com.emoji}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {com.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#00C2FF]" />
                      <span>{com.membersCount} membros</span>
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-[#FF2E93]' : ''}`}
                />
              </div>

              {/* Expanded details & channels */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2.5 animate-fade-in">
                  <p className="text-slate-300 leading-relaxed">{com.description}</p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[#FF2E93] uppercase tracking-wider block">
                      Canais do Grupo:
                    </span>
                    {com.subgroups.map((group, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Abrindo canal: ${group}`);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle size={14} className="text-[#00C2FF]" />
                          <span>{group}</span>
                        </div>
                        <span className="text-[10px] text-pink-400 font-semibold">Entrar</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Informative Capixaba banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-sky-500/10 to-transparent border border-white/5 flex items-center gap-3">
          <Sparkles size={24} className="text-[#FF2E93] shrink-0" />
          <p className="text-xs text-slate-300">
            Comunidades conectam capixabas da Grande Vitória, litoral e montanhas!
          </p>
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
