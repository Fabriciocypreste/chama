import React, { useState } from 'react';
import {
  ChevronRight,
  QrCode,
  User,
  MessageCircle,
  Bell,
  HardDrive,
  Palette,
  HelpCircle,
  Info,
  ChevronLeft,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, ActiveTab, BlockedContactRecord } from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { BottomNav } from '../common/BottomNav';
import { Avatar } from '../common/Avatar';
import { BlockedContactsHistoryModal } from './BlockedContactsHistoryModal';

interface SettingsScreenProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onBack?: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout?: () => void;
  blockedHistory?: BlockedContactRecord[];
  onUnblockContact?: (contactId: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userProfile,
  onOpenProfile,
  onBack,
  activeTab,
  onTabChange,
  onLogout,
  blockedHistory = [],
  onUnblockContact,
}) => {
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const menuSections = [
    {
      id: 'conta',
      icon: User,
      title: 'Conta e Perfil',
      subtitle: 'Privacidade, segurança, mudar número',
      onClick: onOpenProfile,
    },
    {
      id: 'bloqueios',
      icon: Ban,
      title: 'Contatos Bloqueados',
      subtitle: `${blockedHistory.length} contato(s) com histórico de motivos`,
      badge: blockedHistory.length > 0 ? `${blockedHistory.length}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      onClick: () => setShowBlockedModal(true),
    },
    {
      id: 'conversas',
      icon: MessageCircle,
      title: 'Conversas',
      subtitle: 'Tema, papel de parede, histórico',
      onClick: () => alert('Configurações de conversas: Backup e papel de parede capixaba'),
    },
    {
      id: 'notificacoes',
      icon: Bell,
      title: 'Notificações',
      subtitle: 'Chamada, mensagem, grupos',
      onClick: () => alert('Notificações ativadas para todas as mensagens'),
    },
    {
      id: 'armazenamento',
      icon: HardDrive,
      title: 'Armazenamento',
      subtitle: 'Uso de dados e mídia',
      onClick: () => alert('Armazenamento do Poquei: 24.5 MB utilizados'),
    },
    {
      id: 'aparencia',
      icon: Palette,
      title: 'Aparência',
      subtitle: 'Tema, cores, idioma',
      onClick: () => alert('Tema padrão: Noite Ilha de Vitória com realces neon rosa e ciano'),
    },
    {
      id: 'ajuda',
      icon: HelpCircle,
      title: 'Ajuda',
      subtitle: 'Central de ajuda, fale conosco',
      onClick: () => alert('Suporte Capixaba: suporte@poquei.com.br'),
    },
    {
      id: 'sobre',
      icon: Info,
      title: 'Sobre o Poquei',
      subtitle: 'Versão 1.0.0 (Capixaba Build)',
      onClick: () => alert('Poquei v1.0.0 - O mensageiro feito com carinho no Espírito Santo.'),
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0A1224] text-white select-none">
      {/* Top Status Bar */}
      <AndroidStatusBar />

      {/* Header */}
      <header className="px-5 pt-1 pb-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-white">Configurações</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-3 z-10">
        {/* Profile Highlight Card */}
        <div
          onClick={onOpenProfile}
          className="glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-slate-800/60 transition-all cursor-pointer border border-white/10 group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar
              name={userProfile.name}
              src={userProfile.avatarUrl}
              size="lg"
            />

            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-100 truncate group-hover:text-pink-300 transition-colors">
                {userProfile.name}
              </h2>
              <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[170px]">
                {userProfile.statusText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-slate-400">
            <button
              type="button"
              title="Meu QR Code"
              onClick={(e) => {
                e.stopPropagation();
                alert(`QR Code do perfil de ${userProfile.name}: poquei.app/fabricio`);
              }}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <QrCode size={19} />
            </button>
            <ChevronRight size={18} />
          </div>
        </div>

        {/* Settings List */}
        <div className="glass-card rounded-2xl divide-y divide-white/5 border border-white/10 overflow-hidden">
          {menuSections.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={item.onClick}
                className="flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    item.id === 'bloqueios'
                      ? 'bg-rose-500/15 border-rose-500/25 text-rose-400 group-hover:scale-105'
                      : 'bg-slate-800/80 border-white/5 text-[#00C2FF] group-hover:text-[#FF2E93] group-hover:scale-105'
                  }`}>
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-200 truncate">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <ChevronRight size={17} className="text-slate-400 shrink-0 ml-2" />
              </div>
            );
          })}
        </div>

        {/* Logout button */}
        {onLogout && (
          <div className="pt-2 pb-4">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs tracking-wide transition-all cursor-pointer"
            >
              Sair da conta
            </button>
          </div>
        )}
      </div>

      {/* Modal do Histórico de Bloqueios */}
      <BlockedContactsHistoryModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        blockedHistory={blockedHistory}
        onUnblock={(id) => {
          if (onUnblockContact) {
            onUnblockContact(id);
          }
        }}
      />

      {/* Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Bottom Android Gesture Bar */}
      <AndroidNavBar onHome={() => onTabChange('conversas')} />
    </div>
  );
};
