import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Mic,
  Volume2,
  X,
  ChevronDown,
  Sparkles,
  Signal,
  Wifi,
  Waves,
} from 'lucide-react';
import { walkieTalkieChannels, WalkieTalkieChannel } from '../../data/mockData';
import {
  playWalkieTalkieBeep,
  playRadioFrequencyTune,
  playTapSound,
} from '../../utils/soundEffects';

interface WalkieTalkieBarProps {
  onSendMessage: (
    text: string,
    type: 'walkie_talkie',
    stickerData?: undefined,
    audioDuration?: string,
    audioUrl?: string,
    walkieTalkieChannel?: string
  ) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const WalkieTalkieBar: React.FC<WalkieTalkieBarProps> = ({
  onSendMessage,
  onClose,
  onShowToast,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<WalkieTalkieChannel>(
    walkieTalkieChannels[0]
  );
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingDurationRef = useRef<number>(0);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleStartTransmission = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (isPressing) return;

    // Start transmission chirp sound
    playWalkieTalkieBeep(true);
    setIsPressing(true);
    setRecordingSeconds(0);
    recordingDurationRef.current = 0;

    // Tick recording duration
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        const next = prev + 1;
        recordingDurationRef.current = next;
        return next;
      });
    }, 1000);
  };

  const handleEndTransmission = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!isPressing) return;

    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Classic Roger beep ("Câmbio!")
    playWalkieTalkieBeep(false);
    setIsPressing(false);

    const duration = Math.max(1, recordingDurationRef.current);
    const durationStr = `${duration}s`;

    // Send walkie talkie message
    const transmissionText = `[Câmbio ${selectedChannel.code}] Transmissão via ${selectedChannel.name} (${durationStr})`;

    onSendMessage(
      transmissionText,
      'walkie_talkie',
      undefined,
      durationStr,
      'walkie-talkie-synth',
      `${selectedChannel.code} · ${selectedChannel.frequency}`
    );

    onShowToast(`Transmissão de rádio enviada no ${selectedChannel.code}! 📻`);
    setRecordingSeconds(0);
    recordingDurationRef.current = 0;
  };

  const handleChangeChannel = (channel: WalkieTalkieChannel) => {
    playRadioFrequencyTune();
    setSelectedChannel(channel);
    setShowChannelDropdown(false);
    onShowToast(`Sintonizado em ${channel.code} (${channel.frequency})`);
  };

  return (
    <div className="relative p-3 rounded-2xl bg-gradient-to-b from-[#0c182d] to-[#070e1c] border-2 border-amber-500/30 text-white shadow-2xl backdrop-blur-xl animate-fade-in select-none">
      {/* Top Header: Frequency & Mode indicator */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Radio size={16} className={isPressing ? 'animate-pulse text-amber-300' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-400">
                WALKIE-TALKIE VHF
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                PTT
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-none">
              Modo Rádio Capixaba
            </p>
          </div>
        </div>

        {/* Channel Selector trigger & Close button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setShowChannelDropdown(!showChannelDropdown);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-inner"
          >
            <span>{selectedChannel.code}</span>
            <ChevronDown size={12} className={`transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            title="Sair do modo Walkie-Talkie"
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Channel Dropdown Menu */}
      {showChannelDropdown && (
        <div className="mb-3 p-2 rounded-xl bg-slate-900 border border-amber-500/40 shadow-2xl animate-fade-in space-y-1 z-30">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-0.5">
            Canais e Frequências do ES
          </div>
          {walkieTalkieChannels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => handleChangeChannel(channel)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                channel.id === selectedChannel.id
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-amber-400">{channel.code}</span>
                  <span className="text-xs">{channel.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {channel.frequency} · {channel.description}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Wifi size={10} className="text-emerald-400" />
                {channel.activeUsersCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Tactical LCD Radio Frequency Screen */}
      <div className="relative mb-3 p-3 rounded-xl bg-[#030812] border border-amber-500/30 text-amber-300 font-mono flex items-center justify-between shadow-inner overflow-hidden">
        {/* CRT Scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400">{selectedChannel.code}</span>
            <span className="text-[11px] text-slate-400">·</span>
            <span className="text-sm font-black tracking-wider text-amber-300">
              {selectedChannel.frequency}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 truncate max-w-[210px] mt-0.5">
            {selectedChannel.name}
          </div>
        </div>

        {/* Transmission Status Badge */}
        <div className="flex items-center gap-1.5 text-right">
          {isPressing ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 animate-pulse text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>TX {recordingSeconds}s</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              <Signal size={10} />
              <span>RX PRONTO</span>
            </div>
          )}
        </div>
      </div>

      {/* Visualizer Waves when transmitting */}
      {isPressing && (
        <div className="mb-3 flex items-center justify-center gap-1 h-6 animate-fade-in">
          {[40, 75, 95, 60, 100, 85, 45, 90, 70, 100, 80, 50, 95, 65, 85].map((h, i) => (
            <div
              key={i}
              style={{
                height: `${h}%`,
                animationDelay: `${i * 45}ms`,
              }}
              className="w-1 rounded-full bg-gradient-to-t from-amber-500 to-rose-400 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Big Push-to-Talk Button */}
      <div className="flex flex-col items-center justify-center gap-2">
        <button
          type="button"
          onTouchStart={handleStartTransmission}
          onTouchEnd={handleEndTransmission}
          onTouchCancel={handleEndTransmission}
          onMouseDown={handleStartTransmission}
          onMouseUp={handleEndTransmission}
          onMouseLeave={handleEndTransmission}
          className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer select-none active:scale-[0.98] ${
            isPressing
              ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white shadow-rose-600/50 ring-4 ring-rose-500/40 scale-[0.99]'
              : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
          }`}
        >
          <Mic size={24} className={isPressing ? 'animate-bounce' : ''} />
          <div className="flex flex-col items-center">
            <span className="text-sm font-extrabold tracking-wider uppercase">
              {isPressing ? 'SOLTE PARA TRANSMITIR (CÂMBIO!)' : 'SEGURE PARA FALAR (PTT)'}
            </span>
            <span className="text-[10px] font-medium opacity-85">
              {isPressing ? 'Gravando e transmitindo na frequência...' : 'Bip de rádio ao apertar e soltar'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
