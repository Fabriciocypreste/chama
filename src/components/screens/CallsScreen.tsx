import React, { useState } from 'react';
import { Phone, Video, MoreVertical, ShieldCheck, ArrowDownLeft, ArrowUpRight, PhoneMissed } from 'lucide-react';
import { CallLog, ActiveTab } from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { BottomNav } from '../common/BottomNav';
import { Avatar } from '../common/Avatar';

interface CallsScreenProps {
  calls: CallLog[];
  onStartCall: (contactName: string, isVideo: boolean) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenContactsTab: () => void;
}

export const CallsScreen: React.FC<CallsScreenProps> = ({
  calls,
  onStartCall,
  activeTab,
  onTabChange,
  onOpenContactsTab,
}) => {
  const [filter, setFilter] = useState<'todas' | 'perdidas' | 'contatos'>('todas');

  const filteredCalls = calls.filter((call) => {
    if (filter === 'perdidas') return call.callType === 'missed';
    return true;
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0A1224] text-white select-none">
      {/* Top Status Bar */}
      <AndroidStatusBar />

      {/* Header */}
      <header className="px-5 pt-1 pb-3 flex items-center justify-between z-20">
        <h1 className="text-xl font-bold tracking-tight text-white">Ligações</h1>

        <div className="flex items-center gap-2 text-slate-300">
          <button
            type="button"
            title="Privacidade e segurança das chamadas"
            onClick={() => alert('Todas as chamadas do Poquei são criptografadas de ponta a ponta.')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ShieldCheck size={20} />
          </button>
          <button
            type="button"
            title="Menu"
            onClick={() => alert('Limpar registro de chamadas')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="px-5 pb-3 flex items-center gap-2 z-20">
        <button
          type="button"
          onClick={() => setFilter('todas')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filter === 'todas'
              ? 'bg-[#FF2E93] text-white shadow-md shadow-[#FF2E93]/30'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/5'
          }`}
        >
          Todas
        </button>

        <button
          type="button"
          onClick={() => setFilter('perdidas')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filter === 'perdidas'
              ? 'bg-[#FF2E93] text-white shadow-md shadow-[#FF2E93]/30'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/5'
          }`}
        >
          Perdidas
        </button>

        <button
          type="button"
          onClick={onOpenContactsTab}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/5 transition-all cursor-pointer"
        >
          Contatos
        </button>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1 z-10">
        {filteredCalls.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Nenhuma ligação encontrada
          </div>
        ) : (
          filteredCalls.map((call) => {
            const isMissed = call.callType === 'missed';

            return (
              <div
                key={call.id}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/[0.04] transition-all group"
              >
                {/* Contact Avatar */}
                <Avatar
                  name={call.name}
                  src={call.avatarUrl}
                  size="md"
                />

                {/* Name & Call info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      isMissed ? 'text-rose-400' : 'text-slate-100'
                    }`}
                  >
                    {call.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                    {call.callType === 'incoming' && (
                      <ArrowDownLeft size={14} className="text-emerald-400 shrink-0" />
                    )}
                    {call.callType === 'outgoing' && (
                      <ArrowUpRight size={14} className="text-sky-400 shrink-0" />
                    )}
                    {call.callType === 'missed' && (
                      <PhoneMissed size={14} className="text-rose-500 shrink-0" />
                    )}
                    <span className={isMissed ? 'text-rose-400' : 'text-slate-400'}>
                      {call.timestamp}
                    </span>
                  </div>
                </div>

                {/* Quick actions: Voice Call & Video Call */}
                <div className="flex items-center gap-1.5 shrink-0 text-slate-300">
                  <button
                    type="button"
                    title={`Ligar para ${call.name}`}
                    onClick={() => onStartCall(call.name, false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-[#00C2FF] active:scale-90 transition-all cursor-pointer"
                  >
                    <Phone size={18} />
                  </button>

                  <button
                    type="button"
                    title={`Chamada de vídeo com ${call.name}`}
                    onClick={() => onStartCall(call.name, true)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-[#FF2E93] active:scale-90 transition-all cursor-pointer"
                  >
                    <Video size={19} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

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
