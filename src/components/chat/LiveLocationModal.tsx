import React, { useState } from 'react';
import {
  MapPin,
  X,
  Navigation,
  Compass,
  Clock,
  Radio,
  Check,
  Sparkles,
  Map,
} from 'lucide-react';
import { LiveLocationData } from '../../types';
import { capixabaLandmarks, CapixabaLandmark } from '../../data/mockData';
import { playTapSound } from '../../utils/soundEffects';

interface LiveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareLocation: (locationData: LiveLocationData) => void;
  onShowToast: (msg: string) => void;
}

export const LiveLocationModal: React.FC<LiveLocationModalProps> = ({
  isOpen,
  onClose,
  onShareLocation,
  onShowToast,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // 60 minutes default
  const [selectedLandmark, setSelectedLandmark] = useState<CapixabaLandmark>(
    capixabaLandmarks[0]
  );
  const [isUsingGps, setIsUsingGps] = useState(false);

  if (!isOpen) return null;

  const durationOptions = [
    { minutes: 15, label: '15 minutos', badge: 'Rápido' },
    { minutes: 60, label: '1 hora', badge: 'Recomendado' },
    { minutes: 480, label: '8 horas', badge: 'Dia todo' },
  ];

  const handleConfirmShare = () => {
    playTapSound();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const locationData: LiveLocationData = {
      placeName: isUsingGps
        ? 'Minha Localização GPS Atual (Vitória, ES)'
        : selectedLandmark.name,
      landmark: isUsingGps
        ? 'Transmitindo via GPS de alta precisão'
        : selectedLandmark.description,
      city: isUsingGps ? 'Vitória' : selectedLandmark.city,
      durationMinutes: selectedDuration,
      sharedAt: timeStr,
      expiresAt: Date.now() + selectedDuration * 60 * 1000,
      isLive: true,
      latitude: isUsingGps ? -20.2976 : selectedLandmark.lat,
      longitude: isUsingGps ? -40.2957 : selectedLandmark.lng,
      distanceMeters: isUsingGps ? 50 : 420,
      accuracyMeters: 8,
    };

    onShareLocation(locationData);
    onShowToast(`Localização em tempo real compartilhada (${selectedDuration} min)! 📍`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#091224] border border-cyan-500/30 text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Navigation size={18} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Localização em Tempo Real</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                  AO VIVO
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Compartilhe seu trajeto e pontos do Espírito Santo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {/* Duration Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 mb-2">
              <Clock size={12} className="text-[#00C2FF]" />
              <span>Duração do compartilhamento ao vivo</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setSelectedDuration(opt.minutes);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    selectedDuration === opt.minutes
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span
                    className={`text-[9px] px-1 rounded ${
                      selectedDuration === opt.minutes
                        ? 'bg-cyan-500/30 text-cyan-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Map Preview Simulation Widget */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-[#0c1c36] border border-cyan-500/30 shadow-inner flex items-center justify-center">
            {/* Background radar grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#00C2FF_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

            {/* Pulsing radar circles */}
            <div className="absolute w-32 h-32 rounded-full border border-emerald-400/40 animate-ping opacity-30" />
            <div className="absolute w-48 h-48 rounded-full border border-cyan-400/20" />
            <div className="absolute w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-400/60" />

            {/* Central live user pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-400/30">
                <Navigation size={18} className="rotate-45" />
              </div>
              <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-white/20 text-[10px] font-bold text-emerald-300 shadow-md">
                {isUsingGps ? 'GPS Ativo · Vitória' : selectedLandmark.name}
              </div>
            </div>

            {/* Bottom radar status */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sinal GPS 100%</span>
              </span>
              <span>Precisão ~8m</span>
            </div>
          </div>

          {/* Landmarks / Points of Interest in Espírito Santo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <MapPin size={12} className="text-[#FF2E93]" />
                <span>Selecione o ponto capixaba inicial</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setIsUsingGps(!isUsingGps);
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                  isUsingGps
                    ? 'bg-cyan-500/20 text-[#00C2FF] border-cyan-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {isUsingGps ? '✓ Usando GPS Local' : 'Usar GPS Real'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar pr-0.5">
              {capixabaLandmarks.map((lm) => {
                const isSelected = !isUsingGps && selectedLandmark.id === lm.id;
                return (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setIsUsingGps(false);
                      setSelectedLandmark(lm);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-[#00C2FF]/60 text-white shadow-md'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#00C2FF]/20 text-[#00C2FF]'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-100 truncate">
                          {lm.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {lm.city} · {lm.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-[#00C2FF] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmShare}
            className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Navigation size={14} />
            <span>Compartilhar ao Vivo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
