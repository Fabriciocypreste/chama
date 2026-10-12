import React from 'react';
import { Play, Pause, Clock, CheckCheck, Mic } from 'lucide-react';
import { Message } from '../../types';

interface AudioMessageBubbleProps {
  msg: Message;
  isUser: boolean;
  isTemporary: boolean;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  onTogglePlay: (e: React.MouseEvent | React.TouchEvent) => void;
  onSeek?: (percentage: number) => void;
}

// Generate a deterministic aesthetic waveform height pattern for any message id
const getWaveformHeights = (id: string): number[] => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const baseSeed = Math.abs(hash);
  const bars: number[] = [];
  const count = 22;

  for (let i = 0; i < count; i++) {
    // Generate pseudo-random heights between 25% and 100%
    const pseudo = Math.sin(baseSeed + i * 1.7) * 10000;
    const rand = pseudo - Math.floor(pseudo);
    // Give conversational speech rhythm: higher in middle, tapered ends
    const taper = Math.sin((i / (count - 1)) * Math.PI);
    const height = Math.max(25, Math.min(100, Math.floor(30 + rand * 55 * taper + 15 * taper)));
    bars.push(height);
  }
  return bars;
};

export const AudioMessageBubble: React.FC<AudioMessageBubbleProps> = ({
  msg,
  isUser,
  isTemporary,
  isPlaying,
  currentTime,
  totalDuration,
  onTogglePlay,
  onSeek,
}) => {
  const waveformHeights = React.useMemo(() => getWaveformHeights(msg.id), [msg.id]);

  const formatSeconds = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage);
  };

  return (
    <div
      className={`p-3 sm:p-3.5 rounded-2xl relative shadow-md transition-all select-none w-72 sm:w-80 ${
        isUser
          ? 'bg-gradient-to-r from-[#FF2E93] to-[#D81B60] text-white rounded-tr-xs'
          : 'bg-slate-800/90 backdrop-blur-md text-slate-100 border border-white/10 rounded-tl-xs'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause circular button */}
        <button
          type="button"
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay(e);
          }}
          title={isPlaying ? 'Pausar áudio' : 'Ouvir mensagem de voz'}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 hover:scale-105 shadow-md cursor-pointer ${
            isUser
              ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
              : 'bg-gradient-to-tr from-[#FF2E93] to-[#00C2FF] text-white shadow-pink-500/20'
          }`}
        >
          {isPlaying ? (
            <Pause size={19} className="fill-current" />
          ) : (
            <Play size={19} className="fill-current ml-0.5" />
          )}
        </button>

        {/* Audio scrubber & waveform bars */}
        <div className="flex-1 min-w-0">
          <div
            onClick={handleWaveformClick}
            className="flex items-end gap-[3px] h-7 mb-1.5 cursor-pointer py-1 group/wave"
            title="Clique para avançar/voltar no áudio"
          >
            {waveformHeights.map((height, i) => {
              const barFraction = (i + 1) / waveformHeights.length;
              const currentFraction = totalDuration > 0 ? currentTime / totalDuration : 0;
              const isPlayed = currentFraction >= barFraction;

              return (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isUser
                      ? isPlayed
                        ? 'bg-white shadow-xs'
                        : 'bg-white/35 group-hover/wave:bg-white/50'
                      : isPlayed
                      ? 'bg-[#FF2E93] shadow-xs'
                      : 'bg-slate-600 group-hover/wave:bg-slate-500'
                  }`}
                />
              );
            })}
          </div>

          {/* Time indicators & Message metadata */}
          <div className="flex items-center justify-between text-[10.5px]">
            <span className={`font-mono ${isUser ? 'text-white/85' : 'text-slate-400'}`}>
              {isPlaying || currentTime > 0
                ? `${formatSeconds(currentTime)} / ${formatSeconds(totalDuration)}`
                : formatSeconds(totalDuration)}
            </span>

            <div className="flex items-center gap-1.5">
              {msg.audioUrl && (
                <span
                  title="Áudio gravado pelo microfone"
                  className={`inline-flex items-center gap-0.5 text-[9px] px-1 rounded ${
                    isUser ? 'bg-black/20 text-white/80' : 'bg-slate-700/80 text-cyan-300'
                  }`}
                >
                  <Mic size={9} />
                  <span>Voz</span>
                </span>
              )}

              {isTemporary && (
                <span
                  title={`Mensagem temporária (${msg.disappearingDuration || 'temporária'})`}
                  className="inline-flex items-center gap-0.5 text-pink-300 font-semibold"
                >
                  <Clock size={11} />
                </span>
              )}

              <span className={isUser ? 'text-white/70' : 'text-slate-400'}>{msg.timestamp}</span>

              {isUser && (
                <CheckCheck
                  size={14}
                  className="text-[#00C2FF] filter drop-shadow-[0_0_2px_rgba(0,194,255,0.6)]"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
