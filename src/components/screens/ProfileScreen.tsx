import React, { useState } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Camera,
  User,
  MessageSquare,
  Phone,
  Info,
  Link as LinkIcon,
  ChevronRight,
  Check,
  Ban,
  ShieldCheck,
  ShieldAlert,
  Clock,
  MailWarning,
  UserX,
  AlertTriangle,
  HelpCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { UserProfile, BlockedContactRecord, BlockReasonCategory } from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { Avatar } from '../common/Avatar';
import { playTapSound } from '../../utils/soundEffects';
import { DisappearingMessagesModal } from './DisappearingMessagesModal';
import { BlockContactModal } from '../chat/BlockContactModal';
import { BlockedContactsHistoryModal } from './BlockedContactsHistoryModal';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onBack: () => void;
  isBlocked?: boolean;
  onBlockContact?: (
    reasonCategory: BlockReasonCategory,
    reasonLabel: string,
    customNotes?: string,
    reportToModeration?: boolean
  ) => void;
  onUnblockContact?: (contactId: string) => void;
  disappearingTimer?: 'off' | '24h' | '7d' | '90d';
  onUpdateDisappearingTimer?: (timer: 'off' | '24h' | '7d' | '90d') => void;
  blockedHistory?: BlockedContactRecord[];
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onUpdateProfile,
  onBack,
  isBlocked = false,
  onBlockContact,
  onUnblockContact,
  disappearingTimer = 'off',
  onUpdateDisappearingTimer,
  blockedHistory = [],
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [statusInput, setStatusInput] = useState(userProfile.statusText);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showBlockedHistoryModal, setShowBlockedHistoryModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateProfile({ name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleSaveStatus = () => {
    if (statusInput.trim()) {
      onUpdateProfile({ statusText: statusInput.trim() });
    }
    setIsEditingStatus(false);
  };

  const getReasonBadge = (cat: BlockReasonCategory) => {
    switch (cat) {
      case 'spam':
        return {
          label: 'Spam',
          icon: MailWarning,
          style: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
      case 'harassment':
        return {
          label: 'Assédio',
          icon: ShieldAlert,
          style: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        };
      case 'unwanted':
        return {
          label: 'Indesejado',
          icon: UserX,
          style: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        };
      case 'scam':
        return {
          label: 'Golpe',
          icon: AlertTriangle,
          style: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      default:
        return {
          label: 'Outro',
          icon: HelpCircle,
          style: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0A1224] text-white select-none">
      {/* Top Status Bar */}
      <AndroidStatusBar />

      {/* Header */}
      <header className="px-4 pt-1 pb-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Voltar"
            onClick={onBack}
            className="p-1 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-white">Meu perfil</h1>
        </div>

        <button
          type="button"
          title="Opções do perfil"
          onClick={() => setShowBlockedHistoryModal(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Floating Toast */}
      {toastMsg && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 border border-[#00C2FF]/40 text-xs text-slate-100 rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2 pointer-events-none">
          <Sparkles size={14} className="text-[#00C2FF] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Profile Photo Area */}
      <div className="flex flex-col items-center py-3 z-10 shrink-0">
        <div className="relative group cursor-pointer" onClick={() => showToast('Foto de perfil sincronizada')}>
          <div className="w-24 h-24 rounded-full ring-4 ring-white/10 shadow-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#FF2E93] via-[#00C2FF] to-pink-400">
            <Avatar
              name={userProfile.name}
              src={userProfile.avatarUrl}
              size="xl"
              className="w-full h-full"
            />
          </div>

          {/* Camera Edit Badge */}
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF2E93] hover:bg-[#ff1685] text-white flex items-center justify-center shadow-lg border-2 border-[#0A1224] cursor-pointer transition-transform group-hover:scale-110">
            <Camera size={16} />
          </div>
        </div>
      </div>

      {/* Profile Detail Fields */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2.5 z-10 pb-4">
        {/* Name Field */}
        <div className="glass-card rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <User size={20} className="text-[#00C2FF] shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Nome</span>
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-slate-900 border border-[#FF2E93] rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1 rounded bg-[#FF2E93] text-white"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-100 truncate mt-0.5">
                  {userProfile.name}
                </p>
              )}
            </div>
          </div>
          {!isEditingName && (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Recado Field */}
        <div className="glass-card rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <MessageSquare size={20} className="text-[#FF2E93] shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Recado</span>
              {isEditingStatus ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full bg-slate-900 border border-[#FF2E93] rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    className="p-1 rounded bg-[#FF2E93] text-white"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-200 truncate mt-0.5">
                  {userProfile.statusText}
                </p>
              )}
            </div>
          </div>
          {!isEditingStatus && (
            <button
              type="button"
              onClick={() => setIsEditingStatus(true)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Telefone Field */}
        <div className="glass-card rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <Phone size={20} className="text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Telefone</span>
              <p className="text-sm font-semibold text-slate-100 truncate mt-0.5 font-mono">
                {userProfile.phone}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Sobre Field */}
        <div className="glass-card rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <Info size={20} className="text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Sobre</span>
              <p className="text-sm font-semibold text-slate-100 truncate mt-0.5">
                {userProfile.about}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Link Field */}
        <div className="glass-card rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <LinkIcon size={20} className="text-sky-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Link do Poquei</span>
              <p className="text-sm font-medium text-sky-400 truncate mt-0.5">
                {userProfile.link}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Mensagens Temporárias Field */}
        <div
          onClick={() => {
            playTapSound();
            setShowDisappearingModal(true);
          }}
          className="glass-card rounded-2xl p-3.5 border border-white/10 flex items-center justify-between hover:bg-white/[0.06] active:scale-[0.99] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Clock size={20} className="text-[#FF2E93] shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Mensagens temporárias
                </span>
                {disappearingTimer && disappearingTimer !== 'off' && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-pink-500/20 text-[#FF2E93] border border-pink-500/30">
                    {disappearingTimer}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-200 truncate mt-0.5 group-hover:text-pink-200 transition-colors">
                {disappearingTimer && disappearingTimer !== 'off'
                  ? `Desaparecem após ${disappearingTimer}`
                  : 'Desativadas'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-white transition-colors" />
        </div>

        {/* Histórico de Contatos Bloqueados - Painel de Configurações do Perfil */}
        <div className="glass-card rounded-2xl border border-rose-500/25 bg-slate-900/50 overflow-hidden shadow-lg">
          {/* Card Header & Trigger */}
          <div
            onClick={() => {
              playTapSound();
              setShowBlockedHistoryModal(true);
            }}
            className="p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Ban size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white block">
                    Contatos Bloqueados
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {blockedHistory.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 group-hover:text-rose-200 transition-colors">
                  Histórico de motivos registrados (spam, assédio, indesejado...)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400 group-hover:text-white transition-colors">
              <ChevronRight size={18} />
            </div>
          </div>

          {/* Quick Preview List in Profile Settings */}
          {blockedHistory.length > 0 ? (
            <div className="border-t border-white/5 divide-y divide-white/5 bg-slate-950/40">
              {blockedHistory.slice(0, 3).map((item) => {
                const badge = getReasonBadge(item.reasonCategory);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={item.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        name={item.contactName}
                        src={item.contactAvatar}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200 truncate text-[11px]">
                            {item.contactName}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold border ${badge.style}`}
                          >
                            <BadgeIcon size={9} />
                            <span>{badge.label}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {item.blockedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        if (onUnblockContact) {
                          onUnblockContact(item.contactId);
                          showToast(`Contato desbloqueado: ${item.contactName}`);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 border border-white/10 text-[10px] font-semibold transition-all cursor-pointer shrink-0"
                    >
                      Desbloquear
                    </button>
                  </div>
                );
              })}

              <div className="p-2 text-center bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setShowBlockedHistoryModal(true);
                  }}
                  className="text-[11px] font-bold text-[#00C2FF] hover:underline cursor-pointer"
                >
                  Ver histórico completo ({blockedHistory.length}) e filtros →
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-white/5 bg-slate-950/30 flex items-center gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Nenhum contato bloqueado no momento.</span>
            </div>
          )}
        </div>

        {/* Direct Block/Unblock toggle for current contact if viewed */}
        <div className="pt-1">
          {isBlocked ? (
            <button
              type="button"
              onClick={() => setShowUnblockConfirm(true)}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <ShieldCheck size={18} />
              <span>Desbloquear {userProfile.name}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setShowBlockModal(true);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Ban size={18} />
              <span>Bloquear {userProfile.name} (selecionar motivo)</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Bloqueio com Seleção de Motivo no Perfil */}
      <BlockContactModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        contactName={userProfile.name}
        contactAvatar={userProfile.avatarUrl}
        onConfirmBlock={(reasonCategory, reasonLabel, customNotes, reportToModeration) => {
          setShowBlockModal(false);
          if (onBlockContact) {
            onBlockContact(reasonCategory, reasonLabel, customNotes, reportToModeration);
          }
          showToast(`Bloqueado por: ${reasonLabel.split('/')[0].trim()}`);
        }}
      />

      {/* Modal do Histórico Completo de Bloqueios */}
      <BlockedContactsHistoryModal
        isOpen={showBlockedHistoryModal}
        onClose={() => setShowBlockedHistoryModal(false)}
        blockedHistory={blockedHistory}
        onUnblock={(id) => {
          if (onUnblockContact) {
            onUnblockContact(id);
            showToast('Contato desbloqueado com sucesso');
          }
        }}
      />

      {/* Modal de Confirmação de Desbloqueio no Perfil */}
      {showUnblockConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 select-none animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl p-5 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/10">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-base font-bold text-white">Desbloquear {userProfile.name}?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Você voltará a poder trocar mensagens e realizar chamadas com este contato.
            </p>
            <div className="w-full flex items-center gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setShowUnblockConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setShowUnblockConfirm(false);
                  if (onUnblockContact) onUnblockContact(userProfile.id);
                  showToast('Contato desbloqueado');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Mensagens Temporárias */}
      <DisappearingMessagesModal
        isOpen={showDisappearingModal}
        onClose={() => setShowDisappearingModal(false)}
        currentTimer={disappearingTimer}
        contactName={userProfile.name}
        onSaveTimer={(timer) => {
          if (onUpdateDisappearingTimer) {
            onUpdateDisappearingTimer(timer);
          }
        }}
      />

      {/* Bottom Android Gesture Bar */}
      <AndroidNavBar onHome={onBack} />
    </div>
  );
};
