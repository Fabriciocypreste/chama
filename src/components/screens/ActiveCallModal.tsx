import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Video, VideoOff, RotateCcw } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { playTapSound } from '../../utils/soundEffects';

interface ActiveCallModalProps {
  contactName: string;
  isVideo: boolean;
  onEndCall: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  contactName,
  isVideo,
  onEndCall,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(isVideo);
  const [status, setStatus] = useState('Chamando...');

  useEffect(() => {
    // Transition from "Chamando..." to connected after 2.2s
    const connectTimer = setTimeout(() => {
      setStatus('Conectado');
    }, 2200);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'Conectado') {
      timer = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const formattedTime = `${String(Math.floor(callDuration / 60)).padStart(2, '0')}:${String(
    callDuration % 60
  ).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#060D1A] text-white flex flex-col justify-between p-6 select-none animate-fade-in">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A162D] via-[#071022] to-[#040813] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

      {/* Top Info Header */}
      <div className="relative z-20 flex flex-col items-center pt-8 text-center">
        <span className="text-xs font-semibold text-[#00C2FF] uppercase tracking-wider mb-1">
          {isVideo ? 'Chamada de vídeo Poquei' : 'Chamada de voz Poquei'}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          {contactName}
        </h2>
        <p className="text-sm text-slate-300 font-mono">
          {status === 'Chamando...' ? 'Chamando...' : formattedTime}
        </p>
      </div>

      {/* Center Visual: Avatar or Video Simulation */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center">
        {videoEnabled ? (
          <div className="w-full max-w-xs aspect-[3/4] rounded-3xl overflow-hidden bg-slate-900 border border-white/20 relative shadow-2xl flex flex-col justify-between p-4">
            {/* Simulated coastal video background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-900 via-indigo-950 to-pink-900 opacity-90" />
            <div className="relative z-10 self-end px-2.5 py-1 rounded-full bg-black/50 text-[10px] text-white backdrop-blur-md">
              HD 60fps
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <Avatar name={contactName} size="xl" />
              <p className="mt-3 text-sm font-semibold text-white drop-shadow-md">
                {contactName}
              </p>
            </div>

            {/* Picture-in-picture local user preview */}
            <div className="relative z-10 self-end w-20 h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/30 shadow-xl">
              <div className="w-full h-full bg-gradient-to-b from-slate-700 to-slate-900 flex items-center justify-center text-xs text-white/70">
                Você
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Pulsing ring for call animation */}
            <div className="absolute -inset-6 rounded-full bg-pink-500/20 animate-ping opacity-60" />
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#FF2E93] to-[#00C2FF] shadow-2xl">
              <Avatar name={contactName} size="xl" className="w-32 h-32" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-20 pb-8 flex flex-col items-center gap-6">
        <div className="flex items-center justify-center gap-5">
          {/* Mute Button */}
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setIsMuted(!isMuted);
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Video Toggle Button */}
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setVideoEnabled(!videoEnabled);
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              !videoEnabled ? 'bg-slate-800 text-slate-400' : 'bg-sky-600 text-white'
            }`}
          >
            {videoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
          </button>

          {/* Speaker Button */}
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setIsSpeaker(!isSpeaker);
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isSpeaker ? 'bg-sky-600 text-white' : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Volume2 size={22} />
          </button>
        </div>

        {/* End Call Button */}
        <button
          type="button"
          onClick={() => {
            playTapSound();
            onEndCall();
          }}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 active:scale-95 transition-all cursor-pointer"
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
};
