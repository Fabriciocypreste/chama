import React, { useState } from 'react';
import { Camera, MoreVertical, Plus, Check, ChevronRight } from 'lucide-react';
import { StatusStory, Channel, ActiveTab } from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { BottomNav } from '../common/BottomNav';
import { Avatar } from '../common/Avatar';

interface StatusScreenProps {
  stories: StatusStory[];
  channels: Channel[];
  onOpenStory: (story: StatusStory) => void;
  onAddStatus: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({
  stories,
  channels: initialChannels,
  onOpenStory,
  onAddStatus,
  activeTab,
  onTabChange,
}) => {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);

  const toggleFollowChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, isFollowed: !ch.isFollowed } : ch
      )
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0A1224] text-white select-none">
      {/* Top Status Bar */}
      <AndroidStatusBar />

      {/* Header */}
      <header className="px-5 pt-1 pb-3 flex items-center justify-between z-20">
        <h1 className="text-xl font-bold tracking-tight text-white">Status</h1>

        <div className="flex items-center gap-2 text-slate-300">
          <button
            type="button"
            title="Adicionar foto ao status"
            onClick={onAddStatus}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <Camera size={20} />
          </button>
          <button
            type="button"
            title="Configurações de privacidade do status"
            onClick={() => alert('Privacidade do status: Meus contatos')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-4 z-10">
        {/* Meu Status */}
        <div
          onClick={onAddStatus}
          className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer"
        >
          <div className="relative">
            <Avatar
              name="Fabricio Cypreste"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              size="md"
            />
            {/* Pink Plus Badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF2E93] border-2 border-[#0A1224] flex items-center justify-center text-white shadow-sm">
              <Plus size={12} strokeWidth={3} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100">Meu status</h3>
            <p className="text-xs text-slate-400">Toque para adicionar</p>
          </div>
        </div>

        {/* Atualizações recentes Header & Carousel */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 px-2 mb-3 tracking-wide">
            Atualizações recentes
          </h2>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
            {stories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => onOpenStory(story)}
                className="flex flex-col items-center gap-1.5 min-w-[70px] cursor-pointer group"
              >
                {/* Glowing neon ring avatar */}
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#FF2E93] via-[#00C2FF] to-[#FF75B5] group-hover:scale-105 transition-transform shadow-md shadow-[#FF2E93]/20">
                  <div className="p-0.5 rounded-full bg-[#0A1224]">
                    <Avatar
                      name={story.authorName}
                      src={story.authorAvatar}
                      size="md"
                    />
                  </div>
                </div>

                <span className="text-xs font-medium text-slate-200 truncate w-16 text-center">
                  {story.authorName}
                </span>
                <span className="text-[10px] text-slate-400">
                  {story.timeAgo}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Canais Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-sm font-bold text-slate-200">Canais</h2>
            <button
              type="button"
              onClick={() => alert('Visualizando todos os canais do Espírito Santo')}
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver todos</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-1">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={ch.name}
                    src={ch.avatarUrl}
                    size="md"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-slate-100 truncate">
                        {ch.name}
                      </h3>
                      {ch.isVerified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#00C2FF] text-slate-900 text-[9px] font-bold flex items-center justify-center shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{ch.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {ch.followers}
                    </span>
                  </div>
                </div>

                {/* Follow / Unfollow button */}
                <button
                  type="button"
                  onClick={() => toggleFollowChannel(ch.id)}
                  title={ch.isFollowed ? 'Seguindo' : 'Seguir canal'}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ml-2 ${
                    ch.isFollowed
                      ? 'bg-slate-800 text-[#00C2FF] border border-[#00C2FF]/30'
                      : 'bg-[#FF2E93] hover:bg-[#ff1685] text-white shadow-sm shadow-[#FF2E93]/30'
                  }`}
                >
                  {ch.isFollowed ? <Check size={16} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                </button>
              </div>
            ))}
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
