import React, { useState, useRef, useMemo } from 'react';
import {
  Camera,
  Plus,
  Search,
  CheckCheck,
  ImageIcon,
  Clock,
  X,
  MessageSquare,
  User,
  Sparkles,
  Filter,
  Building2,
  Users,
} from 'lucide-react';
import { ChatThread, ActiveTab, Message } from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { BottomNav } from '../common/BottomNav';
import { PoqueiLogo } from '../common/PoqueiLogo';
import { Avatar } from '../common/Avatar';
import { initialAnaClaraMessages } from '../../data/mockData';
import { playTapSound } from '../../utils/soundEffects';

interface ChatsScreenProps {
  chats: ChatThread[];
  messagesByChat?: Record<string, Message[]>;
  onSelectChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenPrefeiturasGuide?: () => void;
  onOpenCreateSupergroup?: () => void;
}

export type SearchScope = 'tudo' | 'contatos' | 'mensagens';

interface ChatMatchDetail {
  chat: ChatThread;
  nameMatches: boolean;
  lastMessageMatches: boolean;
  matchedHistorySnippet?: string;
  matchedHistoryTimestamp?: string;
  totalMatchesInChat: number;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({
  chats,
  messagesByChat,
  onSelectChat,
  onOpenNewChat,
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenPrefeiturasGuide,
  onOpenCreateSupergroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('tudo');
  const [filter, setFilter] = useState<'todas' | 'nao_lidas' | 'grupos' | 'favoritos'>('todas');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Helper to extract searchable string from a message
  const getMessageSearchText = (m: Message): string => {
    const parts: string[] = [];
    if (m.text) parts.push(m.text);
    if (m.quoteText) parts.push(m.quoteText);
    if (m.imageCaption) parts.push(m.imageCaption);
    if (m.stickerData?.phrase) parts.push(m.stickerData.phrase);
    if (m.stickerData?.badgeText) parts.push(m.stickerData.badgeText);
    return parts.join(' ');
  };

  // Helper to highlight matching text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query || !query.trim() || !text) return text;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === query.trim().toLowerCase() ? (
        <mark
          key={index}
          className="bg-[#FF2E93]/35 text-white font-bold px-0.5 rounded text-inherit shadow-xs ring-1 ring-[#FF2E93]/60"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Process search matches across contact names, last messages and full message history
  const { matchedChatDetails, totalMatchCount } = useMemo(() => {
    if (!trimmedQuery) {
      return {
        matchedChatDetails: chats.map(
          (chat): ChatMatchDetail => ({
            chat,
            nameMatches: false,
            lastMessageMatches: false,
            totalMatchesInChat: 0,
          })
        ),
        totalMatchCount: 0,
      };
    }

    let globalMatches = 0;

    const details: ChatMatchDetail[] = [];

    chats.forEach((chat) => {
      const nameMatches = chat.name.toLowerCase().includes(trimmedQuery);
      const lastMessageMatches = (chat.lastMessage.text || '').toLowerCase().includes(trimmedQuery);

      // Search full message history for this chat
      const chatMessages: Message[] =
        messagesByChat?.[chat.id] ||
        (chat.id === 'chat-ana-clara' ? initialAnaClaraMessages : []);

      let matchedHistorySnippet: string | undefined = undefined;
      let matchedHistoryTimestamp: string | undefined = undefined;
      let historyMatchCount = 0;

      for (const msg of chatMessages) {
        const text = getMessageSearchText(msg);
        if (text.toLowerCase().includes(trimmedQuery)) {
          historyMatchCount += 1;
          if (!matchedHistorySnippet) {
            matchedHistorySnippet = text;
            matchedHistoryTimestamp = msg.timestamp;
          }
        }
      }

      // Check scope criteria
      let isScopeMatch = false;
      if (searchScope === 'tudo') {
        isScopeMatch = nameMatches || lastMessageMatches || historyMatchCount > 0;
      } else if (searchScope === 'contatos') {
        isScopeMatch = nameMatches;
      } else if (searchScope === 'mensagens') {
        isScopeMatch = lastMessageMatches || historyMatchCount > 0;
      }

      if (isScopeMatch) {
        const totalMatchesInChat =
          (nameMatches ? 1 : 0) + (lastMessageMatches ? 1 : 0) + historyMatchCount;
        globalMatches += 1;

        details.push({
          chat,
          nameMatches,
          lastMessageMatches,
          matchedHistorySnippet,
          matchedHistoryTimestamp,
          totalMatchesInChat,
        });
      }
    });

    return {
      matchedChatDetails: details,
      totalMatchCount: globalMatches,
    };
  }, [chats, messagesByChat, trimmedQuery, searchScope]);

  // Apply tab filter chips ('todas', 'nao_lidas', 'grupos', 'favoritos')
  const filteredChatDetails = useMemo(() => {
    return matchedChatDetails.filter(({ chat }) => {
      if (filter === 'nao_lidas') return chat.unreadCount > 0;
      if (filter === 'grupos') return chat.isGroup;
      if (filter === 'favoritos') return chat.isFavorite;
      return true;
    });
  }, [matchedChatDetails, filter]);

  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleClearSearch = () => {
    playTapSound();
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleSelectSuggestedTerm = (term: string) => {
    playTapSound();
    setSearchQuery(term);
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0A1224] text-white select-none">
      {/* Top Status Bar */}
      <AndroidStatusBar />

      {/* Main Header Bar */}
      <header className="px-5 pt-1 pb-2 flex items-center justify-between z-20">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenSettings}>
          <PoqueiLogo size="sm" />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {onOpenPrefeiturasGuide && (
            <button
              type="button"
              title="Guia Oficial de Prefeituras do ES"
              onClick={() => {
                playTapSound();
                onOpenPrefeiturasGuide();
              }}
              className="px-2.5 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 hover:text-white flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Building2 size={14} />
              <span className="text-[11px]">Prefeituras</span>
            </button>
          )}

          {onOpenCreateSupergroup && (
            <button
              type="button"
              title="Criar Supergrupo Capixaba"
              onClick={() => {
                playTapSound();
                onOpenCreateSupergroup();
              }}
              className="px-2.5 py-1.5 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/35 text-pink-300 hover:text-white flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Users size={14} />
              <span className="text-[11px]">Supergrupo</span>
            </button>
          )}

          <button
            type="button"
            title="Câmera rápida"
            onClick={() => {
              playTapSound();
              alert('Câmera rápida ativada!');
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <Camera size={18} />
          </button>

          <button
            type="button"
            title="Nova conversa"
            onClick={() => {
              playTapSound();
              onOpenNewChat();
            }}
            className="w-8 h-8 rounded-full bg-[#FF2E93] hover:bg-[#ff1685] text-white flex items-center justify-center shadow-lg shadow-[#FF2E93]/40 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={18} strokeWidth={2.8} />
          </button>
        </div>
      </header>

      {/* Enhanced Search Bar at the Top */}
      <div className="px-4 pb-2 z-20 flex flex-col gap-2">
        <div className="relative flex items-center group">
          <Search
            size={18}
            className={`absolute left-3.5 transition-colors pointer-events-none ${
              searchQuery ? 'text-[#00C2FF]' : 'text-slate-400 group-focus-within:text-[#FF2E93]'
            }`}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleClearSearch();
              }
            }}
            placeholder="Buscar por contato ou conteúdo de mensagem..."
            className="w-full py-2.5 pl-10 pr-10 bg-slate-900/80 border border-white/10 rounded-2xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00C2FF]/70 focus:ring-2 focus:ring-[#00C2FF]/20 shadow-inner backdrop-blur-md transition-all"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              title="Limpar pesquisa"
              className="absolute right-3 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Search Scopes & Indicator when active */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between gap-1 text-[11px] animate-fade-in px-1">
            <span className="text-slate-300 font-medium truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C2FF] animate-pulse" />
              <span>
                {totalMatchCount === 0
                  ? 'Nenhum resultado'
                  : `${totalMatchCount} ${
                      totalMatchCount === 1 ? 'conversa' : 'conversas'
                    }`}
              </span>
            </span>

            {/* Scope selectors */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setSearchScope('tudo');
                }}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                  searchScope === 'tudo'
                    ? 'bg-[#00C2FF] text-black font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tudo
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setSearchScope('contatos');
                }}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                  searchScope === 'contatos'
                    ? 'bg-[#00C2FF] text-black font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Contatos
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setSearchScope('mensagens');
                }}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                  searchScope === 'mensagens'
                    ? 'bg-[#00C2FF] text-black font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mensagens
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Chips Bar (Todas, Não lidas, Grupos, Favoritos) */}
      <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar z-20">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            setFilter('todas');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'todas'
              ? 'bg-[#FF2E93] text-white shadow-md shadow-[#FF2E93]/30'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/5'
          }`}
        >
          Todas
        </button>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setFilter('nao_lidas');
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            filter === 'nao_lidas'
              ? 'bg-[#FF2E93] text-white shadow-md shadow-[#FF2E93]/30'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/5'
          }`}
        >
          <span>Não lidas</span>
          {totalUnread > 0 && (
            <span
              className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                filter === 'nao_lidas' ? 'bg-white text-[#FF2E93]' : 'bg-[#FF2E93] text-white'
              }`}
            >
              {totalUnread}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setFilter('grupos');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'grupos'
              ? 'bg-[#FF2E93] text-white shadow-md shadow-[#FF2E93]/30'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/5'
          }`}
        >
          Grupos
        </button>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setFilter('favoritos');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'favoritos'
              ? 'bg-[#FF2E93] text-white shadow-md shadow-[#FF2E93]/30'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/5'
          }`}
        >
          Favoritos
        </button>
      </div>

      {/* Chat List Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1.5 z-10">
        {filteredChatDetails.length === 0 ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-slate-900/90 border border-white/10 flex items-center justify-center mb-3 text-slate-400 shadow-xl">
              <Search size={24} className="text-pink-400" />
            </div>

            <h3 className="text-sm font-bold text-slate-100">
              Nenhuma conversa encontrada
            </h3>

            <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
              Não encontramos nenhuma conversa correspondente a{' '}
              <strong className="text-pink-300">"{searchQuery}"</strong> no nome do contato ou
              conteúdo das mensagens.
            </p>

            {/* Quick suggested searches */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Sugestões rápidas capixabas:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs">
                {['Camburi', 'Moqueca', 'Ana Clara', 'Família', 'Praia'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectSuggestedTerm(term)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-[#FF2E93]/20 text-slate-200 hover:text-pink-200 border border-white/10 text-[11px] font-medium transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 rounded-xl bg-[#FF2E93] hover:bg-[#ff1685] text-white text-xs font-semibold shadow-lg shadow-[#FF2E93]/30 transition-all cursor-pointer"
              >
                Limpar pesquisa
              </button>
              {filter !== 'todas' && (
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setFilter('todas');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                >
                  Ver todas as abas
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredChatDetails.map(
            ({
              chat,
              nameMatches,
              lastMessageMatches,
              matchedHistorySnippet,
              matchedHistoryTimestamp,
            }) => {
              const hasPastMatch =
                Boolean(trimmedQuery) &&
                matchedHistorySnippet &&
                !lastMessageMatches &&
                chat.lastMessage.text !== matchedHistorySnippet;

              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    playTapSound();
                    onSelectChat(chat.id);
                  }}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/[0.04] active:bg-white/[0.08] transition-all cursor-pointer group border ${
                    nameMatches || lastMessageMatches || hasPastMatch
                      ? 'border-[#00C2FF]/30 bg-slate-900/40 shadow-sm'
                      : 'border-transparent'
                  }`}
                >
                  {/* Contact Avatar */}
                  <Avatar
                    name={chat.name}
                    src={chat.avatarUrl}
                    size="md"
                    isOnline={chat.isOnline}
                  />

                  {/* Name, Last Message & Match details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-pink-200 transition-colors">
                          {renderHighlightedText(chat.name, searchQuery)}
                        </h3>
                        {chat.disappearingTimer && chat.disappearingTimer !== 'off' && (
                          <span
                            title={`Mensagens temporárias: ${chat.disappearingTimer}`}
                            className="inline-flex items-center text-pink-400 shrink-0"
                          >
                            <Clock size={11} />
                          </span>
                        )}
                        {nameMatches && Boolean(trimmedQuery) && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] font-medium shrink-0">
                            Contato
                          </span>
                        )}
                        {chat.isSupergroup && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/40 font-bold shrink-0">
                            {chat.memberCount ? `${(chat.memberCount / 1000).toFixed(0)}k membros` : 'Supergrupo'}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-medium shrink-0 ml-2 ${
                          chat.unreadCount > 0 ? 'text-[#FF2E93] font-bold' : 'text-slate-400'
                        }`}
                      >
                        {chat.lastMessage.timestamp}
                      </span>
                    </div>

                    {/* Latest Message preview */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                        {chat.disappearingTimer && chat.disappearingTimer !== 'off' && (
                          <Clock size={11} className="text-pink-400/80 shrink-0 inline mr-0.5" />
                        )}
                        {chat.lastMessage.isReadByThem && (
                          <CheckCheck size={14} className="text-[#00C2FF] shrink-0" />
                        )}
                        {chat.lastMessage.type === 'image' && (
                          <ImageIcon size={13} className="text-slate-300 shrink-0 inline mr-0.5" />
                        )}
                        <span className="truncate">
                          {renderHighlightedText(chat.lastMessage.text, searchQuery)}
                        </span>
                      </p>

                      {/* Unread badge count */}
                      {chat.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#FF2E93] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-sm shadow-[#FF2E93]/40">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Subtopics chips if supergroup */}
                    {chat.isSupergroup && chat.subtopics && chat.subtopics.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 overflow-hidden">
                        {chat.subtopics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-white/5 truncate max-w-[85px]"
                          >
                            {topic}
                          </span>
                        ))}
                        {chat.subtopics.length > 3 && (
                          <span className="text-[9px] text-pink-400 font-mono font-semibold">
                            +{chat.subtopics.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Past message history match snippet if found deeper in the thread */}
                    {hasPastMatch && matchedHistorySnippet && (
                      <div className="mt-1.5 px-2 py-1 rounded-xl bg-cyan-950/40 border border-[#00C2FF]/30 text-[11px] text-slate-300 flex items-center gap-1.5 animate-fade-in">
                        <MessageSquare size={11} className="text-[#00C2FF] shrink-0" />
                        <span className="truncate flex-1 text-slate-300">
                          Na conversa:{' '}
                          <span className="italic text-slate-200">
                            "{renderHighlightedText(matchedHistorySnippet, searchQuery)}"
                          </span>
                        </span>
                        {matchedHistoryTimestamp && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {matchedHistoryTimestamp}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        unreadChatsCount={totalUnread}
      />

      {/* Bottom Android Gesture Bar */}
      <AndroidNavBar onHome={() => onTabChange('conversas')} />
    </div>
  );
};
