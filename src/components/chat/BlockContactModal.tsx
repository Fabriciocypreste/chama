import React, { useState } from 'react';
import {
  Ban,
  X,
  AlertTriangle,
  MailWarning,
  ShieldAlert,
  UserX,
  HelpCircle,
  Check,
  ShieldCheck,
  MessageSquareWarning,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { BlockReasonCategory } from '../../types';
import { playTapSound } from '../../utils/soundEffects';

export interface BlockContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar?: string;
  onConfirmBlock: (
    reasonCategory: BlockReasonCategory,
    reasonLabel: string,
    customNotes?: string,
    reportToModeration?: boolean
  ) => void;
}

interface ReasonOption {
  id: BlockReasonCategory;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badgeColor: string;
  borderColor: string;
}

const REASON_OPTIONS: ReasonOption[] = [
  {
    id: 'spam',
    title: 'Spam ou mensagens repetitivas',
    description: 'Propagandas comerciais, correntes automáticas ou mensagens insistentes.',
    icon: MailWarning,
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 'harassment',
    title: 'Assédio ou ofensas',
    description: 'Comportamento desrespeitoso, importunação persistente, ofensas ou intimidação.',
    icon: ShieldAlert,
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/40',
  },
  {
    id: 'unwanted',
    title: 'Indesejado / Sem interesse',
    description: 'Não desejo mais conversar, receber chamadas ou manter contato no Poquei.',
    icon: UserX,
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500/40',
  },
  {
    id: 'scam',
    title: 'Golpe ou suspeita de fraude',
    description: 'Tentativa de phishing, links suspeitos, perfis falsos ou pedidos de PIX/dinheiro.',
    icon: AlertTriangle,
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    borderColor: 'border-red-500/40',
  },
  {
    id: 'other',
    title: 'Outro motivo',
    description: 'Especificar um motivo diferente ou observação particular.',
    icon: HelpCircle,
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/40',
  },
];

export const BlockContactModal: React.FC<BlockContactModalProps> = ({
  isOpen,
  onClose,
  contactName,
  contactAvatar,
  onConfirmBlock,
}) => {
  const [selectedReason, setSelectedReason] = useState<BlockReasonCategory>('unwanted');
  const [customNote, setCustomNote] = useState('');
  const [reportToModeration, setReportToModeration] = useState(true);

  if (!isOpen) return null;

  const currentOption = REASON_OPTIONS.find((r) => r.id === selectedReason) || REASON_OPTIONS[0];

  const handleConfirm = () => {
    playTapSound();
    onConfirmBlock(
      selectedReason,
      currentOption.title,
      selectedReason === 'other' || customNote.trim() ? customNote.trim() : undefined,
      reportToModeration
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div
        className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-3 border-b border-white/10 flex items-start justify-between bg-gradient-to-b from-rose-950/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={contactName} src={contactAvatar} size="md" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center border-2 border-slate-900 shadow">
                <Ban size={11} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">
                  Bloquear {contactName}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Escolha o motivo para registrar no histórico do seu perfil
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Informative Security Banner */}
        <div className="px-5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2.5 text-[11px] text-rose-200">
          <ShieldAlert size={16} className="text-rose-400 shrink-0" />
          <span>
            Este contato não poderá ver seu status, enviar mensagens nem fazer ligações para você.
          </span>
        </div>

        {/* Body / Reasons List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-2.5">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Selecione o motivo do bloqueio:
          </label>

          <div className="space-y-2">
            {REASON_OPTIONS.map((option) => {
              const isSelected = selectedReason === option.id;
              const Icon = option.icon;

              return (
                <div
                  key={option.id}
                  onClick={() => {
                    playTapSound();
                    setSelectedReason(option.id);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? `bg-slate-800/90 ${option.borderColor} ring-1 ${option.borderColor} shadow-lg`
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                      isSelected ? option.badgeColor : 'bg-slate-800 border-white/10 text-slate-400'
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold leading-snug ${
                          isSelected ? 'text-white' : 'text-slate-200'
                        }`}
                      >
                        {option.title}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-rose-500 bg-rose-600 text-white'
                            : 'border-slate-500 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Note Field if 'other' or optional note */}
          {(selectedReason === 'other' || selectedReason === 'spam' || selectedReason === 'scam') && (
            <div className="pt-1 animate-fade-in">
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Observações ou detalhes (opcional):
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ex: Mensagens indesejadas de ofertas, ligou em horário indevido..."
                rows={2}
                maxLength={200}
                className="w-full bg-slate-950/80 border border-white/15 focus:border-rose-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
              />
            </div>
          )}

          {/* Moderation report checkbox */}
          <div
            onClick={() => setReportToModeration(!reportToModeration)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition-colors"
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                reportToModeration
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'border-slate-500 bg-transparent'
              }`}
            >
              {reportToModeration && <Check size={12} strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-slate-200 font-medium block">
                Denunciar para a moderação do Poquei
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                As últimas mensagens serão verificadas para proteção comunitária.
              </span>
            </div>
            <MessageSquareWarning size={16} className="text-rose-400 shrink-0" />
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-5 py-4 border-t border-white/10 bg-slate-950/60 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold text-slate-300 transition-all cursor-pointer text-center"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Ban size={15} />
            <span>Bloquear contato</span>
          </button>
        </div>
      </div>
    </div>
  );
};
