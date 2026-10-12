import React from 'react';
import { Sparkles, X, Heart } from 'lucide-react';
import { playReactionSound, playTapSound } from '../../utils/soundEffects';

export interface CapixabaReactionItem {
  id: string;
  emoji: string;
  name: string;
  tag: string;
  culturalDescription: string;
  isCustomCapixaba?: boolean;
}

export const CAPIXABA_REACTIONS: CapixabaReactionItem[] = [
  {
    id: 'moqueca',
    emoji: '🍲',
    name: 'Moqueca Capixaba',
    tag: 'Culinária Raiz',
    culturalDescription: 'Panela de barro de Goiabeiras: Moqueca é capixaba, o resto é peixada!',
    isCustomCapixaba: true,
  },
  {
    id: 'congo',
    emoji: '🥁',
    name: 'Tambor de Congo',
    tag: 'Cultura Tradicional',
    culturalDescription: 'Congo Capixaba de Roda d\'Água e Barra do Jucu. Ritmo ancestral capixaba!',
    isCustomCapixaba: true,
  },
  {
    id: 'coracao_azul',
    emoji: '💙',
    name: 'Coração Azul',
    tag: 'Bandeira ES',
    culturalDescription: 'Azul do Espírito Santo: Trabalha e Confia!',
  },
  {
    id: 'coracao_rosa',
    emoji: '💖',
    name: 'Coração Rosa',
    tag: 'Vibe Poquei',
    culturalDescription: 'Rosa vibrante da bandeira e identidade capixaba.',
  },
  {
    id: 'pocou',
    emoji: '🔥',
    name: 'Pocou!',
    tag: 'Gíria Autêntica',
    culturalDescription: 'Tá pocando! Gíria máxima para algo incrível ou emocionante.',
  },
  {
    id: 'joinha',
    emoji: '👍',
    name: 'Massa / Fechou',
    tag: 'Positivo',
    culturalDescription: 'Massa demais! Tudo certo e combinado.',
  },
  {
    id: 'camburi',
    emoji: '🌊',
    name: 'Onda de Camburi',
    tag: 'Praias do ES',
    culturalDescription: 'Vibe praiana de Camburi, Praia da Costa e Guarapari.',
  },
  {
    id: 'cafe',
    emoji: '☕',
    name: 'Café das Montanhas',
    tag: 'Pedra Azul',
    culturalDescription: 'Café arábica premiado das Montanhas Capixabas.',
  },
];

// Custom authentic Clay Pot Moqueca SVG
export const MoquecaClayPotIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Steam vapor */}
    <path
      d="M17 10C16 7 19 6 18 3"
      stroke="#FF8A65"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="2 3"
      opacity="0.85"
    />
    <path
      d="M24 9C23 6 26 5 25 2"
      stroke="#FFB74D"
      strokeWidth="2.2"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M31 10C30 7 33 6 32 3"
      stroke="#FF8A65"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="2 3"
      opacity="0.85"
    />

    {/* Panela de Barro (clay pot body) - Goiabeiras craft */}
    <ellipse cx="24" cy="27" rx="19" ry="12" fill="#241B18" stroke="#3E2723" strokeWidth="2" />
    <path
      d="M5 26C5 36 12 43 24 43C36 43 43 36 43 26C43 24 42 22 41 21C38 18 31 16 24 16C17 16 10 18 7 21C6 22 5 24 5 26Z"
      fill="#2C1D18"
    />
    {/* Clay pot rim */}
    <ellipse cx="24" cy="21" rx="17" ry="5.5" fill="#4E342E" stroke="#5D4037" strokeWidth="1.5" />
    
    {/* Bubbling Moqueca Sauce inside */}
    <ellipse cx="24" cy="21.5" rx="14.5" ry="4" fill="#D84315" />
    <ellipse cx="24" cy="21.8" rx="12" ry="2.8" fill="#FF5722" />
    {/* Green Cilantro herbs & pepper flakes */}
    <circle cx="21" cy="21.5" r="1.3" fill="#4CAF50" />
    <circle cx="27" cy="21.2" r="1.2" fill="#81C784" />
    <circle cx="24" cy="22.2" r="1.1" fill="#FFEB3B" />
    <circle cx="18" cy="22" r="0.9" fill="#FFC107" />
    <circle cx="29" cy="22.2" r="0.9" fill="#388E3C" />

    {/* Clay Handles (alças da panela de barro) */}
    <path
      d="M5 24C2 24 2 28 5 28"
      stroke="#3E2723"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M43 24C46 24 46 28 43 28"
      stroke="#3E2723"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Clay sheen reflection */}
    <path
      d="M10 32C12 37 17 40 24 40"
      stroke="#5D4037"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

// Custom authentic Congo Drum SVG (Tambor de Congo Capixaba)
export const CongoDrumIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Drum Wooden Body */}
    <path
      d="M10 14L13 36C13.5 39 18 41 24 41C30 41 34.5 39 35 36L38 14"
      fill="#8D6E63"
      stroke="#5D4037"
      strokeWidth="2"
    />
    <path
      d="M12 24C12 24 18 26 24 26C30 26 36 24 36 24"
      stroke="#D7CCC8"
      strokeWidth="1.5"
      strokeDasharray="2 2"
    />

    {/* Congo Bands / Colorful Capixaba Ribbons (Fitas de Congo) */}
    <path
      d="M11 18C15 20 22 20.5 24 20.5C26 20.5 33 20 37 18"
      stroke="#00C2FF"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M12 27C16 29 22 29.5 24 29.5C26 29.5 32 29 36 27"
      stroke="#FF2E93"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M13 33C17 34.5 22 35 24 35C26 35 31 34.5 35 33"
      stroke="#FFEB3B"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Tuning Ropes (Cordas em V) */}
    <path d="M11 14L18 38L24 14L30 38L37 14" stroke="#4E342E" strokeWidth="1.6" strokeLinecap="round" />

    {/* Drum Skin Head (Couro do tambor) */}
    <ellipse cx="24" cy="14" rx="14" ry="5.5" fill="#FFF8E1" stroke="#8D6E63" strokeWidth="2" />
    <ellipse cx="24" cy="14" rx="10" ry="3.5" fill="#FFE082" opacity="0.6" />

    {/* Drum Sticks / Baquetas cruzadas */}
    <path d="M6 8L18 20" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" />
    <circle cx="6" cy="8" r="2.2" fill="#E65100" />
    <path d="M42 8L30 20" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" />
    <circle cx="42" cy="8" r="2.2" fill="#E65100" />
  </svg>
);

interface MessageReactionPickerProps {
  onSelectReaction: (emoji: string) => void;
  onClose: () => void;
  currentReactions?: string[];
  messageText?: string;
  isUserMessage?: boolean;
}

export const MessageReactionPicker: React.FC<MessageReactionPickerProps> = ({
  onSelectReaction,
  onClose,
  currentReactions = [],
  messageText = '',
  isUserMessage = false,
}) => {
  const [hoveredReaction, setHoveredReaction] = React.useState<CapixabaReactionItem | null>(null);

  const handlePick = (emoji: string) => {
    playReactionSound();
    onSelectReaction(emoji);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reações da mensagem"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 animate-fade-in bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playTapSound();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-sm bg-[#0B1528]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,194,255,0.2)] animate-scale-up text-white flex flex-col gap-3 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-1.5">
              Reações Capixabas
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-normal">
                ES 💙🤍💖
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar reações"
          >
            <X size={15} />
          </button>
        </div>

        {/* Message preview snippet */}
        {messageText && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-slate-300 truncate italic">
            "{messageText}"
          </div>
        )}

        {/* Floating Quick Reaction Pill (WhatsApp/Telegram style row) */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-2.5 shadow-inner flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {CAPIXABA_REACTIONS.map((item) => {
            const isSelected = currentReactions.includes(item.emoji);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item.emoji)}
                onMouseEnter={() => setHoveredReaction(item)}
                onMouseLeave={() => setHoveredReaction(null)}
                className={`relative group flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-150 transform hover:scale-125 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-t from-pink-500/30 to-cyan-500/20 ring-2 ring-[#00C2FF] shadow-lg shadow-[#00C2FF]/30'
                    : 'hover:bg-white/10'
                }`}
                title={item.name}
              >
                {/* Visual Icon */}
                <div className="w-9 h-9 flex items-center justify-center text-2xl transition-transform group-hover:animate-bounce">
                  {item.id === 'moqueca' ? (
                    <div className="relative">
                      <MoquecaClayPotIcon size={32} />
                      <span className="absolute -bottom-1 -right-1 text-xs">🍲</span>
                    </div>
                  ) : item.id === 'congo' ? (
                    <div className="relative">
                      <CongoDrumIcon size={32} />
                      <span className="absolute -bottom-1 -right-1 text-xs">🥁</span>
                    </div>
                  ) : (
                    <span>{item.emoji}</span>
                  )}
                </div>

                {/* Selected Indicator dot */}
                {isSelected && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#00C2FF] shadow-sm shadow-[#00C2FF]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Cultural Detail Card / Hover preview */}
        <div className="min-h-[58px] p-2.5 rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-white/10 flex items-center gap-3 transition-all">
          {hoveredReaction ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                {hoveredReaction.id === 'moqueca' ? (
                  <MoquecaClayPotIcon size={26} />
                ) : hoveredReaction.id === 'congo' ? (
                  <CongoDrumIcon size={26} />
                ) : (
                  <span className="text-xl">{hoveredReaction.emoji}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    {hoveredReaction.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                    {hoveredReaction.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5 line-clamp-2">
                  {hoveredReaction.culturalDescription}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 text-slate-400 text-xs w-full justify-center">
              <Sparkles size={14} className="text-[#00C2FF] shrink-0 animate-spin" />
              <span>Toque em um emoji ou ícone cultural para reagir à mensagem</span>
            </div>
          )}
        </div>

        {/* Culture highlights quick cards */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <button
            type="button"
            onClick={() => handlePick('🍲')}
            className="flex items-center gap-2 p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 hover:bg-amber-900/40 transition-colors text-left cursor-pointer"
          >
            <MoquecaClayPotIcon size={22} className="shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-xs text-amber-100 flex items-center gap-1">
                Moqueca 🍲
              </div>
              <div className="text-[10px] text-amber-300/80 truncate">
                O resto é peixada!
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePick('🥁')}
            className="flex items-center gap-2 p-2 rounded-xl bg-pink-950/30 border border-pink-500/30 text-pink-200 hover:bg-pink-900/40 transition-colors text-left cursor-pointer"
          >
            <CongoDrumIcon size={22} className="shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-xs text-pink-100 flex items-center gap-1">
                Congo 🥁
              </div>
              <div className="text-[10px] text-pink-300/80 truncate">
                Tambor & Casaca ES
              </div>
            </div>
          </button>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span>💡 Dica: Mantenha a mensagem pressionada para abrir</span>
          {currentReactions.length > 0 && (
            <span className="text-[#00C2FF] font-medium">
              {currentReactions.length} reação(ões) ativa(s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
