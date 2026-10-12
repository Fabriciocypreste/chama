import React, { useState } from 'react';
import {
  UserPlus,
  MoreVertical,
  Search,
  Phone,
  MessageSquare,
  ChevronLeft,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { Contact, ActiveTab } from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { BottomNav } from '../common/BottomNav';
import { Avatar } from '../common/Avatar';

interface ContactsScreenProps {
  contacts: Contact[];
  onStartChatWithContact: (contact: Contact) => void;
  onCallContact: (contact: Contact, isVideo: boolean) => void;
  onBack?: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenPrefeiturasGuide?: () => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  contacts,
  onStartChatWithContact,
  onCallContact,
  onBack,
  activeTab,
  onTabChange,
  onOpenPrefeiturasGuide,
}) => {
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by first letter
  const groupedContacts = filteredContacts.reduce<Record<string, Contact[]>>((acc, contact) => {
    const letter = contact.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedContacts).sort();

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0A1224] text-white select-none">
      {/* Top Status Bar */}
      <AndroidStatusBar />

      {/* Header */}
      <header className="px-4 pt-1 pb-3 flex items-center justify-between z-20">
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
          <h1 className="text-xl font-bold tracking-tight text-white">Contatos</h1>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <button
            type="button"
            title="Adicionar novo contato"
            onClick={() => alert('Adicionar novo contato')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus size={20} />
          </button>
          <button
            type="button"
            title="Opções"
            onClick={() => alert('Opções de contatos')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Search Input */}
      <div className="px-4 pb-2.5 z-20">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contatos..."
            className="w-full py-2.5 pl-11 pr-4 bg-slate-900/70 border border-white/10 rounded-full text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#FF2E93]/60 focus:ring-1 focus:ring-[#FF2E93]/40 transition-all"
          />
        </div>
      </div>

      {/* Grouped Contacts List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-4 z-10">
        {/* Guia Oficial de Prefeituras do ES Banner */}
        {onOpenPrefeiturasGuide && (
          <div
            onClick={onOpenPrefeiturasGuide}
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-cyan-950/70 border border-cyan-500/30 flex items-center justify-between hover:border-cyan-500/60 transition-all cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#00C2FF] flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform">
                <Building2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">Prefeituras do Espírito Santo</h4>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                    OFICIAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Telefones úteis, WhatsApp Cidadão e Ouvidorias
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:text-cyan-300 transition-colors" />
          </div>
        )}

        {sortedLetters.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Nenhum contato encontrado
          </div>
        ) : (
          sortedLetters.map((letter) => (
            <div key={letter} className="space-y-1">
              {/* Section letter header */}
              <h2 className="text-xs font-bold text-pink-400 px-3 py-1 uppercase tracking-wider">
                {letter}
              </h2>

              {groupedContacts[letter].map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.04] transition-all group"
                >
                  {/* Contact Info */}
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    onClick={() => onStartChatWithContact(contact)}
                  >
                    <Avatar
                      name={contact.name}
                      src={contact.avatarUrl}
                      size="md"
                      isOnline={contact.isOnline}
                    />

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-pink-200 transition-colors">
                        {contact.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {contact.status}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Quick Call & Message */}
                  <div className="flex items-center gap-1 shrink-0 text-slate-300">
                    <button
                      type="button"
                      title={`Ligar para ${contact.name}`}
                      onClick={() => onCallContact(contact, false)}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-[#00C2FF] active:scale-90 transition-all cursor-pointer"
                    >
                      <Phone size={18} />
                    </button>

                    <button
                      type="button"
                      title={`Mensagem para ${contact.name}`}
                      onClick={() => onStartChatWithContact(contact)}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-[#FF2E93] active:scale-90 transition-all cursor-pointer"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
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
