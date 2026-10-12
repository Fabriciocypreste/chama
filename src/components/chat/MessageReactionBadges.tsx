import React from 'react';
import { playReactionSound, playTapSound } from '../../utils/soundEffects';
import { MoquecaClayPotIcon, CongoDrumIcon } from './MessageReactionPicker';

interface MessageReactionBadgesProps {
  reactions?: string[];
  onToggleReaction: (emoji: string) => void;
  onOpenPicker: () => void;
  isUserMessage?: boolean;
}

export const MessageReactionBadges: React.FC<MessageReactionBadgesProps> = ({
  reactions = [],
  onToggleReaction,
  onOpenPicker,
  isUserMessage = false,
}) => {
  if (!reactions || reactions.length === 0) return null;

  // Group emojis and count them
  const counts: Record<string, number> = {};
  reactions.forEach((emoji) => {
    counts[emoji] = (counts[emoji] || 0) + 1;
  });

  const uniqueEmojis = Object.keys(counts);

  return (
    <div
      className={`absolute -bottom-3.5 z-20 flex items-center gap-1 ${
        isUserMessage ? 'right-2' : 'left-2'
      } select-none animate-scale-up`}
    >
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#070F1E]/95 border border-white/20 shadow-lg backdrop-blur-md">
        {uniqueEmojis.map((emoji) => {
          const count = counts[emoji];
          return (
            <button
              key={emoji}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playReactionSound();
                onToggleReaction(emoji);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-white/20 active:scale-95 transition-all text-xs cursor-pointer group"
              title={`Reação: ${emoji} (toque para alternar)`}
            >
              {emoji === '🍲' ? (
                <div className="flex items-center gap-0.5">
                  <MoquecaClayPotIcon size={14} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[11px]">🍲</span>
                </div>
              ) : emoji === '🥁' ? (
                <div className="flex items-center gap-0.5">
                  <CongoDrumIcon size={14} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[11px]">🥁</span>
                </div>
              ) : (
                <span className="text-xs group-hover:scale-110 transition-transform inline-block">
                  {emoji}
                </span>
              )}
              {count > 1 && (
                <span className="text-[10px] font-bold text-slate-300 ml-0.5">
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Plus button to add more reactions */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playTapSound();
            onOpenPicker();
          }}
          className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer ml-0.5"
          title="Adicionar reação capixaba"
        >
          +
        </button>
      </div>
    </div>
  );
};
