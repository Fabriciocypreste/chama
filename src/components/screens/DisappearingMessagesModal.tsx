import React, { useState } from 'react';
import {
  Clock,
  Check,
  Shield,
  Trash2,
  X,
  Info,
  Sparkles,
  Timer,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { playTapSound, playMessageSentSound } from '../../utils/soundEffects';

interface DisappearingMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimer: 'off' | '24h' | '7d' | '90d';
  contactName: string;
  onSaveTimer: (timer: 'off' | '24h' | '7d' | '90d') => void;
  onSimulateExpire?: () => void;
  temporaryMessagesCount?: number;
}

export const DisappearingMessagesModal: React.FC<DisappearingMessagesModalProps> = ({
  isOpen,
  onClose,
  currentTimer = 'off',
  contactName,
  onSaveTimer,
  onSimulateExpire,
  temporaryMessagesCount = 0,
}) => {
  const [selectedTimer, setSelectedTimer] = useState<'off' | '24h' | '7d' | '90d'>(currentTimer);
  const [showSimulateToast, setShowSimulateToast] = useState(false);

  if (!isOpen) return null;

  const timerOptions: {
    id: '24h' | '7d' | '90d' | 'off';
    label: string;
    description: string;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: '24h',
      label: '24 horas',
      description: 'Mensagens desaparecem 1 dia após o envio.',
      badge: 'Mais privacidade',
      badgeColor: 'bg-pink-500/20 text-[#FF2E93] border-pink-500/30',
    },
    {
      id: '7d',
      label: '7 dias',
      description: 'Tempo ideal para manter o histórico recente limpo.',
      badge: 'Recomendado',
      badgeColor: 'bg-cyan-500/20 text-[#00C2FF] border-cyan-500/30',
    },
    {
      id: '90d',
      label: '90 dias',
      description: 'Histórico preservado por três meses antes de expirar.',
      badge: 'Longo prazo',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'off',
      label: 'Desativadas',
      description: 'As mensagens permanecem salvas para sempre.',
      badge: 'Padrão',
      badgeColor: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
    },
  ];

  const handleSave = () => {
    playTapSound();
    onSaveTimer(selectedTimer);
    onClose();
  };

  const handleTriggerSimulate = () => {
    playMessageSentSound();
    if (onSimulateExpire) {
      onSimulateExpire();
    }
    setShowSimulateToast(true);
    setTimeout(() => {
      setShowSimulateToast(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0A1224] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="relative px-5 pt-4 pb-3 border-b border-white/10 flex items-center justify-between bg-[#081020]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 border border-pink-500/30 flex items-center justify-center text-[#FF2E93] shadow-md shadow-pink-500/10">
              <Clock size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Mensagens Temporárias
              </h2>
              <span className="text-xs text-slate-400">Conversa com {contactName}</span>
            </div>
          </div>

          <button
            type="button"
            title="Fechar"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border border-pink-500/20 text-xs text-slate-300 flex items-start gap-3">
            <Shield size={18} className="text-[#00C2FF] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-slate-200">
                Privacidade & Armazenamento Automático
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Quando ativado, todas as novas mensagens enviadas ou recebidas nesta conversa desaparecerão após o período escolhido. Mensagens anteriores não serão afetadas.
              </p>
            </div>
          </div>

          {/* Radio Options List */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-1 block">
              Duração das mensagens
            </label>

            {timerOptions.map((option) => {
              const isSelected = selectedTimer === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => {
                    playTapSound();
                    setSelectedTimer(option.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500/15 to-purple-500/10 border-[#FF2E93] shadow-lg shadow-pink-500/10 ring-1 ring-[#FF2E93]/40'
                      : 'bg-slate-900/60 border-white/10 hover:bg-slate-800/60 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Custom Radio Circle */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#FF2E93] text-white shadow-sm'
                          : 'border-2 border-slate-500 group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isSelected ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {option.label}
                        </span>
                        {option.badge && (
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${option.badgeColor}`}
                          >
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  <Clock
                    size={16}
                    className={`shrink-0 ml-2 transition-colors ${
                      isSelected ? 'text-[#FF2E93]' : 'text-slate-500'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Preview of visual indicator in chat */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                <Sparkles size={13} className="text-pink-400" />
                Como fica no chat
              </span>
              <span className="text-[10px] text-slate-400">Indicador visual ativo</span>
            </div>

            {/* Bubble mock preview */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#D81B60] text-white text-xs shadow-md">
              <p>Partiu Camburi dar uma volta de bike? 🚲🌊</p>
              <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-white/80">
                {selectedTimer !== 'off' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-black/25 text-pink-200 font-bold border border-white/15">
                    <Clock size={10} />
                    <span>{selectedTimer}</span>
                  </span>
                )}
                <span>10:45</span>
                <span>✓✓</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              {selectedTimer !== 'off'
                ? `O ícone de relógio com "${selectedTimer}" aparecerá nas mensagens temporárias e no topo da conversa.`
                : 'Mensagens temporárias desligadas. Nenhuma mensagem será apagada automaticamente.'}
            </p>
          </div>

          {/* Interactive Simulation Action (Bonus verification) */}
          {temporaryMessagesCount > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTriggerSimulate}
                className="w-full py-2.5 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-300 border border-amber-500/25 flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <Flame size={15} className="text-amber-400" />
                <span>Simular apagamento das {temporaryMessagesCount} mensagens agora</span>
              </button>
            </div>
          )}

          {showSimulateToast && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-fade-in flex items-center justify-center gap-2">
              <Check size={14} />
              <span>Mensagens temporárias expiradas foram apagadas com sucesso!</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#081020]/95 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF2E93] to-[#D81B60] hover:from-[#ff1685] hover:to-[#c2185b] active:scale-95 text-xs font-bold text-white shadow-lg shadow-[#FF2E93]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Clock size={15} />
            <span>Salvar configuração</span>
          </button>
        </div>
      </div>
    </div>
  );
};
