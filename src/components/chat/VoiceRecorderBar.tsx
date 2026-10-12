import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Send, Mic, Radio, ChevronLeft } from 'lucide-react';
import { playRecordStartSound, playRecordCancelSound, playTapSound } from '../../utils/soundEffects';

interface VoiceRecorderBarProps {
  onSendVoice: (durationSeconds: number, audioUrl?: string) => void;
  onCancel: () => void;
}

export const VoiceRecorderBar: React.FC<VoiceRecorderBarProps> = ({
  onSendVoice,
  onCancel,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [volumeLevels, setVolumeLevels] = useState<number[]>([30, 50, 40, 70, 85, 60, 45, 80, 65, 50, 35, 60]);
  const [isSlideCancelling, setIsSlideCancelling] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    playRecordStartSound();
    startTimeRef.current = Date.now();

    // Timer interval
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
    }, 250);

    // Try acquiring real microphone
    let isCancelled = false;

    const startRecording = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (isCancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;

          // Set up audio analyser for real-time waveform visualization
          try {
            const AudioContextClass =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              audioContextRef.current = ctx;
              const source = ctx.createMediaStreamSource(stream);
              const analyser = ctx.createAnalyser();
              analyser.fftSize = 64;
              source.connect(analyser);
              analyserRef.current = analyser;

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateBars = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                // Sample 12 frequencies
                const levels: number[] = [];
                for (let i = 0; i < 12; i++) {
                  const idx = Math.min(i * 2, dataArray.length - 1);
                  const val = dataArray[idx];
                  levels.push(Math.max(20, Math.min(100, Math.round((val / 255) * 100))));
                }
                setVolumeLevels(levels);
                animFrameRef.current = requestAnimationFrame(updateBars);
              };
              updateBars();
            }
          } catch {
            // AudioContext visualizer optional
          }

          // Create MediaRecorder
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          recorder.start(100);
        }
      } catch {
        // Fallback to simulated audio meter
        const fallbackInterval = setInterval(() => {
          setVolumeLevels(() =>
            Array.from({ length: 12 }, () => Math.floor(25 + Math.random() * 70))
          );
        }, 120);

        return () => clearInterval(fallbackInterval);
      }
    };

    startRecording();

    return () => {
      isCancelled = true;
      clearInterval(timerInterval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleFinishAndSend = () => {
    playTapSound();
    const finalDuration = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        let blobUrl: string | undefined;
        try {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: mediaRecorderRef.current?.mimeType || 'audio/webm',
            });
            blobUrl = URL.createObjectURL(audioBlob);
          }
        } catch {
          // fallback
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        onSendVoice(finalDuration, blobUrl);
      };
      try {
        mediaRecorderRef.current.stop();
      } catch {
        onSendVoice(finalDuration);
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      onSendVoice(finalDuration);
    }
  };

  const handleCancelRecording = () => {
    playRecordCancelSound();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    onCancel();
  };

  // Touch gesture to slide left and cancel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartXRef.current - currentX;
    if (diff > 70) {
      setIsSlideCancelling(true);
    } else {
      setIsSlideCancelling(false);
    }
  };

  const handleTouchEnd = () => {
    if (isSlideCancelling) {
      handleCancelRecording();
    }
    touchStartXRef.current = null;
    setIsSlideCancelling(false);
  };

  const formatTimer = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`flex items-center gap-2 p-1.5 rounded-full bg-slate-900/95 border transition-all animate-fade-in ${
        isSlideCancelling
          ? 'border-rose-500/80 bg-rose-950/40 ring-2 ring-rose-500/40'
          : 'border-pink-500/40 shadow-lg shadow-pink-500/10'
      }`}
    >
      {/* Cancel / Trash Button */}
      <button
        type="button"
        title="Cancelar gravação"
        onClick={handleCancelRecording}
        className="w-9 h-9 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90"
      >
        <Trash2 size={17} />
      </button>

      {/* Recording status: pulsing red dot & live timer */}
      <div className="flex items-center gap-2 px-1 shrink-0">
        <div className="relative flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-rose-500 relative flex items-center justify-center">
            <Radio size={8} className="text-white" />
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-rose-400 min-w-9">
          {formatTimer(elapsedSeconds)}
        </span>
      </div>

      {/* Live Equalizer waveform bars */}
      <div className="flex-1 flex items-center justify-center gap-1 h-7 px-2 overflow-hidden">
        {volumeLevels.map((lvl, idx) => (
          <div
            key={idx}
            style={{ height: `${Math.max(15, lvl)}%` }}
            className={`w-1 rounded-full transition-all duration-75 ${
              isSlideCancelling
                ? 'bg-rose-400'
                : 'bg-gradient-to-t from-[#FF2E93] to-[#00C2FF]'
            }`}
          />
        ))}
      </div>

      {/* Slide to cancel indicator */}
      <div className="hidden sm:flex items-center text-[10.5px] text-slate-400 whitespace-nowrap pr-1 select-none">
        <ChevronLeft size={13} className="text-slate-400 animate-pulse" />
        <span>Deslize p/ cancelar</span>
      </div>

      {/* Send voice button */}
      <button
        type="button"
        title="Enviar mensagem de voz"
        onClick={handleFinishAndSend}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF2E93] to-[#ff1685] text-white flex items-center justify-center shadow-lg shadow-[#FF2E93]/40 active:scale-95 hover:scale-105 transition-all cursor-pointer shrink-0"
      >
        <Send size={18} className="ml-0.5" />
      </button>
    </div>
  );
};
