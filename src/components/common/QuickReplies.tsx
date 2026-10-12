import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { playTapSound } from '../../utils/soundEffects';

export interface QuickReplyItem {
  id: string;
  text: string;
  emoji: string;
  badge?: string;
}

export const defaultCapixabaQuickReplies: QuickReplyItem[] = [
  { id: 'qr-bora', text: 'Bora ali?', emoji: '🏖️', badge: 'Rolê' },
  { id: 'qr-indo', text: 'Tô indo', emoji: '🏃💨', badge: 'A caminho' },
  { id: 'qr-depois', text: 'Depois a gente vê', emoji: '😉', badge: 'Tranquilo' },
  { id: 'qr-camburi', text: 'Partiu Camburi!', emoji: '🌊', badge: 'Praia' },
  { id: 'qr-boa', text: 'Qual é a boa?', emoji: '🤙', badge: 'Papo' },
  { id: 'qr-pocou', text: 'Pocou demais!', emoji: '🔥', badge: 'Top' },
  { id: 'qr-massa', text: 'Massa!', emoji: '✨', badge: 'Gíria' },
  { id: 'qr-moqueca', text: 'Moqueca hoje?', emoji: '🍲', badge: 'Almoço' },
  { id: 'qr-ligo', text: 'Te ligo já já', emoji: '📞', badge: 'Aviso' },
  { id: 'qr-cheguei', text: 'Cheguei!', emoji: '📍', badge: 'Local' },
];

interface QuickRepliesProps {
  onSelectReply: (text: string) => void;
  disabled?: boolean;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({
  onSelectReply,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleClick = (item: QuickReplyItem) => {
    if (disabled) return;
    playTapSound();
    onSelectReply(item.text);
  };

  return (
    <div className="relative z-20 w-full mb-1.5 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1 mb-1 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-[#00C2FF] flex items-center justify-center">
            <Zap size={10} className="fill-[#00C2FF]" />
          </div>
          <span className="font-semibold text-slate-200">Respostas Rápidas</span>
          <span className="text-[10px] text-pink-400 font-bold flex items-center gap-0.5">
            <Sparkles size={9} />
            Capixaba
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setIsExpanded(!isExpanded);
          }}
          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
          title={isExpanded ? 'Recolher respostas rápidas' : 'Expandir respostas rápidas'}
        >
          <span>{isExpanded ? 'Ocultar' : 'Sugerir'}</span>
          {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>

      {/* Horizontal Carousel of Quick Replies */}
      {isExpanded && (
        <div className="relative group">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth">
            {defaultCapixabaQuickReplies.map((reply) => (
              <button
                key={reply.id}
                type="button"
                disabled={disabled}
                onClick={() => handleClick(reply)}
                className="group/pill shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-[#00C2FF]/15 active:bg-[#00C2FF]/25 border border-white/10 hover:border-[#00C2FF]/50 active:scale-95 text-xs text-slate-200 hover:text-white shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <span className="text-sm shrink-0 transition-transform group-hover/pill:scale-110">
                  {reply.emoji}
                </span>
                <span className="font-medium whitespace-nowrap text-slate-100 group-hover/pill:text-cyan-200">
                  {reply.text}
                </span>
                {reply.badge && (
                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-white/5 text-slate-400 group-hover/pill:text-pink-300 group-hover/pill:bg-pink-500/10">
                    {reply.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right edge fade indicator for horizontal scroll */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#091122] to-transparent opacity-70" />
        </div>
      )}
    </div>
  );
};
