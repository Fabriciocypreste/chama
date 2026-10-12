import React, { useState, useMemo } from 'react';
import {
  Ban,
  X,
  Search,
  ShieldCheck,
  ShieldAlert,
  MailWarning,
  UserX,
  AlertTriangle,
  HelpCircle,
  Calendar,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { BlockedContactRecord, BlockReasonCategory } from '../../types';
import { playTapSound } from '../../utils/soundEffects';

export interface BlockedContactsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedHistory: BlockedContactRecord[];
  onUnblock: (contactId: string) => void;
}

export const BlockedContactsHistoryModal: React.FC<BlockedContactsHistoryModalProps> = ({
  isOpen,
  onClose,
  blockedHistory,
  onUnblock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | BlockReasonCategory>('all');
  const [unblockingContact, setUnblockingContact] = useState<BlockedContactRecord | null>(null);

  const filteredList = useMemo(() => {
    return blockedHistory.filter((item) => {
      const matchesSearch =
        item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.contactPhone && item.contactPhone.includes(searchTerm)) ||
        item.reasonLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.customNotes && item.customNotes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedFilter === 'all' || item.reasonCategory === selectedFilter;

      return matchesSearch && matchesCategory;
    });
  }, [blockedHistory, searchTerm, selectedFilter]);

  if (!isOpen) return null;

  const getReasonConfig = (cat: BlockReasonCategory) => {
    switch (cat) {
      case 'spam':
        return {
          label: 'Spam',
          icon: MailWarning,
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
      case 'harassment':
        return {
          label: 'Assédio',
          icon: ShieldAlert,
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        };
      case 'unwanted':
        return {
          label: 'Indesejado',
          icon: UserX,
          badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        };
      case 'scam':
        return {
          label: 'Golpe / Fraude',
          icon: AlertTriangle,
          badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      default:
        return {
          label: 'Outro',
          icon: HelpCircle,
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
    }
  };

  const handleConfirmUnblock = () => {
    if (unblockingContact) {
      playTapSound();
      onUnblock(unblockingContact.contactId);
      setUnblockingContact(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#0A1224] border border-rose-500/30 shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
              <Ban size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">
                  Contatos Bloqueados
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {blockedHistory.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Histórico de motivos registrados no seu perfil
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

        {/* Search Bar */}
        <div className="px-4 pt-3 pb-2 border-b border-white/5 space-y-2.5 bg-slate-900/60">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por contato ou motivo..."
              className="w-full bg-slate-950/80 border border-white/10 focus:border-[#FF2E93] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Categories filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSelectedFilter('all');
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Todos ({blockedHistory.length})
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSelectedFilter('spam');
              }}
              className={`px-2.5 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                selectedFilter === 'spam'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-amber-400/90 hover:bg-white/10'
              }`}
            >
              Spam
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSelectedFilter('harassment');
              }}
              className={`px-2.5 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                selectedFilter === 'harassment'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-white/5 text-rose-400/90 hover:bg-white/10'
              }`}
            >
              Assédio
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSelectedFilter('unwanted');
              }}
              className={`px-2.5 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                selectedFilter === 'unwanted'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-white/5 text-sky-400/90 hover:bg-white/10'
              }`}
            >
              Indesejado
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSelectedFilter('scam');
              }}
              className={`px-2.5 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                selectedFilter === 'scam'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-white/5 text-red-400/90 hover:bg-white/10'
              }`}
            >
              Golpes
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 ring-8 ring-emerald-500/5">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                {searchTerm
                  ? 'Nenhum bloqueio encontrado com esses termos'
                  : 'Nenhum contato bloqueado'}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {searchTerm
                  ? 'Tente buscar por outro nome de contato ou altere a categoria de filtro acima.'
                  : 'Sua lista de conversas está tranquila. Quando você bloquear um contato indesejado, ele aparecerá aqui com seu respectivo motivo.'}
              </p>
            </div>
          ) : (
            filteredList.map((item) => {
              const reasonConf = getReasonConfig(item.reasonCategory);
              const ReasonIcon = reasonConf.icon;

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-3.5 border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 transition-all flex flex-col gap-2.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <Avatar
                          name={item.contactName}
                          src={item.contactAvatar}
                          size="md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center border border-slate-900">
                          <Ban size={9} />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-pink-300 transition-colors">
                          {item.contactName}
                        </h4>
                        {item.contactPhone && (
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {item.contactPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Unblock quick button */}
                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        setUnblockingContact(item);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-300 border border-white/10 hover:border-emerald-500/30 text-[11px] font-semibold active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      Desbloquear
                    </button>
                  </div>

                  {/* Reason badge & description */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${reasonConf.badgeColor}`}
                      >
                        <ReasonIcon size={11} />
                        <span>{reasonConf.label}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={11} />
                        <span>{item.blockedAt}</span>
                      </div>
                    </div>

                    <p className="text-[11px] font-medium text-slate-200 leading-snug">
                      {item.reasonLabel}
                    </p>

                    {item.customNotes && (
                      <p className="text-[10px] text-slate-400 italic bg-black/20 p-1.5 rounded-lg border border-white/5">
                        &ldquo;{item.customNotes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-[#00C2FF] shrink-0" />
            <span>Os motivos são armazenados no histórico do perfil para fins de auditoria e segurança.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer text-xs"
          >
            Concluir
          </button>
        </div>

        {/* Unblock Confirmation Dialog */}
        {unblockingContact && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl p-5 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-emerald-500/10">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-sm font-bold text-white">
                Desbloquear {unblockingContact.contactName}?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Você voltará a receber mensagens e chamadas deste contato. O registro histórico de bloqueio continuará arquivado.
              </p>
              <div className="w-full flex items-center gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setUnblockingContact(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnblock}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
