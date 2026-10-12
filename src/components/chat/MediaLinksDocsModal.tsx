import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Image as ImageIcon,
  Link2,
  FileText,
  Download,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Play,
  Pause,
  MessageSquare,
  ChevronLeft,
  Calendar,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Message, ChatThread } from '../../types';
import { playTapSound, playSyntheticVoiceNote, stopAllAudioPlayback } from '../../utils/soundEffects';

interface MediaLinksDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatThread;
  messages: Message[];
  initialTab?: 'media' | 'links' | 'docs';
  onJumpToMessage?: (messageId: string) => void;
}

export interface MediaItem {
  id: string;
  messageId?: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  timestamp: string;
  sender: 'user' | 'contact';
  isSvgScene?: boolean;
}

export interface LinkItem {
  id: string;
  messageId?: string;
  url: string;
  title: string;
  description: string;
  domain: string;
  timestamp: string;
  sender: 'user' | 'contact';
}

export interface DocItem {
  id: string;
  messageId?: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'audio';
  timestamp: string;
  sender: 'user' | 'contact';
  duration?: string;
  audioUrl?: string;
}

// Curated Capixaba media memories for the chat thread
const defaultCapixabaMedia: MediaItem[] = [
  {
    id: 'media-camburi',
    messageId: 'msg-4',
    type: 'image',
    url: 'camburi-beach',
    caption: 'Praia de Camburi num domingo de sol em Vitória 🌊',
    timestamp: 'Hoje, 09:17',
    sender: 'contact',
    isSvgScene: true,
  },
  {
    id: 'media-convento',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1598887142487-3c854d51d2c7?auto=format&fit=crop&w=800&q=80',
    caption: 'Vista do Convento da Penha sobre a Terceira Ponte ⛪',
    timestamp: 'Ontem, 16:45',
    sender: 'contact',
  },
  {
    id: 'media-moqueca',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    caption: 'Moqueca Capixaba borbulhando na panela de barro de Goiabeiras 🐟🍲',
    timestamp: 'Ontem, 14:12',
    sender: 'user',
  },
  {
    id: 'media-ponte',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Terceira Ponte e Baía de Vitória ao pôr do sol 🌅',
    timestamp: 'Sábado, 18:20',
    sender: 'contact',
  },
  {
    id: 'media-pedra-azul',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    caption: 'Passeio nas montanhas capixabas em Pedra Azul ⛰️',
    timestamp: '12 de Out, 11:30',
    sender: 'user',
  },
  {
    id: 'media-manguinhos',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
    caption: 'Mar tranquilo na Vila de Manguinhos, Serra ES 🦀',
    timestamp: '08 de Out, 15:10',
    sender: 'contact',
  },
];

// Curated Capixaba links exchanged in the conversation
const defaultCapixabaLinks: LinkItem[] = [
  {
    id: 'link-1',
    url: 'https://descubraoespiritosanto.es.gov.br/gastronomia/moqueca-capixaba',
    title: 'Receita Oficial da Moqueca Capixaba das Paneleiras',
    description: 'Guia completo com o passo a passo tradicional: urucum, coentro fresco e panela de barro.',
    domain: 'descubraoespiritosanto.es.gov.br',
    timestamp: 'Hoje, 09:10',
    sender: 'contact',
  },
  {
    id: 'link-2',
    url: 'https://conventodapenha.org.br/visitas-e-horarios',
    title: 'Convento da Penha em Vila Velha - Horários e Missas',
    description: 'Um dos monumentos religiosos mais antigos do Brasil, fundado em 1558 no alto do penhasco.',
    domain: 'conventodapenha.org.br',
    timestamp: 'Ontem, 16:30',
    sender: 'contact',
  },
  {
    id: 'link-3',
    url: 'https://vitoria.es.gov.br/turismo/calcadao-de-camburi',
    title: 'Prefeitura de Vitória - Quiosques e Lazer no Calçadão',
    description: 'Mapa de ciclovias, aluguel de bikes e programação cultural na orla de Camburi.',
    domain: 'vitoria.es.gov.br',
    timestamp: 'Ontem, 14:15',
    sender: 'user',
  },
  {
    id: 'link-4',
    url: 'https://vilavelha.es.gov.br/trilhas-morro-do-moreno',
    title: 'Trilhas do Morro do Moreno para ver o nascer do sol',
    description: 'Dicas de segurança e mapas das trilhas com vista deslumbrante para a Baía de Vitória.',
    domain: 'vilavelha.es.gov.br',
    timestamp: '06 de Out, 08:20',
    sender: 'contact',
  },
];

// Curated Capixaba documents & files exchanged
const defaultCapixabaDocs: DocItem[] = [
  {
    id: 'doc-1',
    name: 'Cardapio_Moqueca_Ilha_das_Caieiras_2026.pdf',
    size: '1.4 MB',
    type: 'pdf',
    timestamp: 'Hoje, 09:15',
    sender: 'contact',
  },
  {
    id: 'doc-2',
    name: 'Roteiro_Fim_de_Semana_Guarapari_Setiba.pdf',
    size: '2.8 MB',
    type: 'pdf',
    timestamp: 'Ontem, 17:00',
    sender: 'user',
  },
  {
    id: 'doc-3',
    name: 'Receita_Original_Torta_Capixaba_Paneleiras.pdf',
    size: '890 KB',
    type: 'pdf',
    timestamp: '09 de Out, 10:20',
    sender: 'contact',
  },
];

export const MediaLinksDocsModal: React.FC<MediaLinksDocsModalProps> = ({
  isOpen,
  onClose,
  chat,
  messages,
  initialTab = 'media',
  onJumpToMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'links' | 'docs'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<MediaItem | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [playingAudioDocId, setPlayingAudioDocId] = useState<string | null>(null);

  // Synchronize initialTab if changed
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Aggregate Media from messages + curated
  const mediaItems = useMemo<MediaItem[]>(() => {
    const list: MediaItem[] = [];

    // Add any image messages from actual messages list
    messages.forEach((msg) => {
      if (msg.type === 'image' && msg.imageUrl) {
        list.push({
          id: `media-${msg.id}`,
          messageId: msg.id,
          type: 'image',
          url: msg.imageUrl,
          caption: msg.imageCaption || 'Foto compartilhada',
          timestamp: msg.timestamp,
          sender: msg.senderId === 'user' ? 'user' : 'contact',
          isSvgScene: msg.imageUrl === 'camburi-beach',
        });
      }
    });

    // Merge curated defaults avoiding duplicate messageIds
    defaultCapixabaMedia.forEach((def) => {
      if (!list.some((item) => item.id === def.id || (def.messageId && item.messageId === def.messageId))) {
        list.push(def);
      }
    });

    return list;
  }, [messages]);

  // Aggregate Links from messages + curated
  const linkItems = useMemo<LinkItem[]>(() => {
    const list: LinkItem[] = [...defaultCapixabaLinks];

    // Detect links in actual messages text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    messages.forEach((msg) => {
      if (msg.text) {
        const matches = msg.text.match(urlRegex);
        if (matches) {
          matches.forEach((url, idx) => {
            try {
              const parsed = new URL(url);
              list.unshift({
                id: `link-msg-${msg.id}-${idx}`,
                messageId: msg.id,
                url,
                title: `Link compartilhado na conversa`,
                description: msg.text || 'Link compartilhado',
                domain: parsed.hostname,
                timestamp: msg.timestamp,
                sender: msg.senderId === 'user' ? 'user' : 'contact',
              });
            } catch {
              // ignore invalid url
            }
          });
        }
      }
    });

    return list;
  }, [messages]);

  // Aggregate Docs & Audios from messages + curated
  const docItems = useMemo<DocItem[]>(() => {
    const list: DocItem[] = [...defaultCapixabaDocs];

    // Detect audio messages from actual chat messages
    messages.forEach((msg) => {
      if (msg.type === 'audio') {
        list.push({
          id: `audio-${msg.id}`,
          messageId: msg.id,
          name: msg.senderId === 'user' ? 'Mensagem de voz enviada' : 'Áudio recebido de ' + chat.name,
          size: 'Áudio gravado',
          type: 'audio',
          timestamp: msg.timestamp,
          sender: msg.senderId === 'user' ? 'user' : 'contact',
          duration: msg.audioDuration || '0:32',
          audioUrl: msg.audioUrl,
        });
      }
    });

    return list;
  }, [messages, chat.name]);

  // Filtered lists by search query
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaItems;
    const q = searchQuery.toLowerCase();
    return mediaItems.filter(
      (m) => (m.caption && m.caption.toLowerCase().includes(q)) || m.timestamp.toLowerCase().includes(q)
    );
  }, [mediaItems, searchQuery]);

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return linkItems;
    const q = searchQuery.toLowerCase();
    return linkItems.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q)
    );
  }, [linkItems, searchQuery]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docItems;
    const q = searchQuery.toLowerCase();
    return docItems.filter(
      (d) => d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q) || d.timestamp.toLowerCase().includes(q)
    );
  }, [docItems, searchQuery]);

  if (!isOpen) return null;

  const handleCopyLink = (link: LinkItem) => {
    playTapSound();
    navigator.clipboard?.writeText(link.url);
    setCopiedLinkId(link.id);
    setTimeout(() => {
      setCopiedLinkId(null);
    }, 2000);
  };

  const handleDownload = (itemName: string) => {
    playTapSound();
    setDownloadFeedback(`Download iniciado: ${itemName}`);
    setTimeout(() => {
      setDownloadFeedback(null);
    }, 2500);
  };

  const handleShare = (title: string) => {
    playTapSound();
    setDownloadFeedback(`Link de compartilhamento copiado!`);
    setTimeout(() => {
      setDownloadFeedback(null);
    }, 2500);
  };

  const handleTogglePlayAudioDoc = (doc: DocItem) => {
    if (playingAudioDocId === doc.id) {
      stopAllAudioPlayback();
      setPlayingAudioDocId(null);
    } else {
      stopAllAudioPlayback();
      setPlayingAudioDocId(doc.id);
      playSyntheticVoiceNote(3, () => {
        setPlayingAudioDocId(null);
      });
    }
  };

  const handleJump = (messageId?: string) => {
    if (!messageId) return;
    playTapSound();
    onClose();
    if (onJumpToMessage) {
      onJumpToMessage(messageId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      {/* Modal Dialog Card */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-2xl bg-[#0A1224] border border-white/10 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-4 py-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onClose();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Fechar"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Mídia, Links e Docs</span>
                <span className="text-[10px] text-pink-400 font-mono">· {chat.name}</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {mediaItems.length} mídias · {linkItems.length} links · {docItems.length} arquivos
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
            title="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="px-4 py-2.5 bg-slate-900/50 border-b border-white/5 flex items-center gap-2 shrink-0">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar fotos, links ou documentos..."
              className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF2E93] focus:ring-1 focus:ring-[#FF2E93] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Segmented Controls */}
        <div className="px-4 py-2 bg-slate-900/40 border-b border-white/10 flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setActiveTab('media');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-[#FF2E93] to-[#D81B60] text-white shadow-lg shadow-[#FF2E93]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon size={14} />
            <span>Mídias</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'media' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {filteredMedia.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              setActiveTab('links');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'links'
                ? 'bg-gradient-to-r from-[#00C2FF] to-[#0091FF] text-white shadow-lg shadow-[#00C2FF]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Link2 size={14} />
            <span>Links</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'links' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {filteredLinks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              setActiveTab('docs');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText size={14} />
            <span>Docs & Áudios</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'docs' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {filteredDocs.length}
            </span>
          </button>
        </div>

        {/* Toast Feedback for actions */}
        {downloadFeedback && (
          <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <span>{downloadFeedback}</span>
            <Check size={14} />
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* TAB 1: MEDIA (GRID FORMAT) */}
          {activeTab === 'media' && (
            <div>
              {filteredMedia.length === 0 ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-pink-400">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">Nenhuma mídia encontrada</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Fotos e vídeos compartilhados na conversa aparecerão aqui no formato de grade.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {filteredMedia.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playTapSound();
                        setSelectedLightboxImage(item);
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-pink-500/60 transition-all cursor-pointer active:scale-98 shadow-md"
                    >
                      {item.isSvgScene ? (
                        <div className="w-full h-full relative">
                          <svg viewBox="0 0 400 250" className="w-full h-full object-cover">
                            <defs>
                              <linearGradient id={`grad-sky-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#29B6F6" />
                                <stop offset="60%" stopColor="#81D4FA" />
                                <stop offset="100%" stopColor="#FFF9C4" />
                              </linearGradient>
                              <linearGradient id={`grad-ocean-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0288D1" />
                                <stop offset="100%" stopColor="#004D40" />
                              </linearGradient>
                            </defs>
                            <rect width="400" height="250" fill={`url(#grad-sky-${item.id})`} />
                            <circle cx="320" cy="50" r="28" fill="#FFF59D" />
                            <path d="M 0,140 Q 120,80 220,135 T 400,120 L 400,200 L 0,200 Z" fill="#2E7D32" opacity="0.8" />
                            <rect y="130" width="400" height="70" fill={`url(#grad-ocean-${item.id})`} />
                            <path d="M 0,185 Q 200,175 400,185 L 400,250 L 0,250 Z" fill="#FFE082" />
                            <circle cx="100" cy="205" r="9" fill="#E91E63" />
                          </svg>
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                            Camburi
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.caption || 'Foto'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-left pointer-events-none">
                        <span className="text-[10px] font-medium text-white truncate drop-shadow">
                          {item.caption || 'Ver imagem'}
                        </span>
                        <span className="text-[9px] text-slate-300 drop-shadow">
                          {item.timestamp}
                        </span>
                      </div>

                      {/* Zoom Indicator */}
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                        <Maximize2 size={11} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LINKS (RICH CARD LIST) */}
          {activeTab === 'links' && (
            <div className="space-y-3">
              {filteredLinks.length === 0 ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#00C2FF]">
                    <Link2 size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">Nenhum link encontrado</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Links para sites, portais de turismo e receitas compartilhados aparecerão aqui.
                  </p>
                </div>
              ) : (
                filteredLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-[#00C2FF]/50 transition-all shadow-md group flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C2FF]/20 to-[#0091FF]/10 border border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] shrink-0">
                          <Link2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#00C2FF] transition-colors">
                            {link.title}
                          </h4>
                          <span className="text-[11px] text-[#00C2FF] font-mono block truncate">
                            {link.domain}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0">
                        {link.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {link.description}
                    </p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(link)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                        >
                          {copiedLinkId === link.id ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        {link.messageId && (
                          <button
                            type="button"
                            onClick={() => handleJump(link.messageId)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                          >
                            <MessageSquare size={12} className="text-pink-400" />
                            <span>Na conversa</span>
                          </button>
                        )}
                      </div>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDownload(`Link aberto: ${link.domain}`);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#00C2FF]/20 hover:bg-[#00C2FF]/30 text-[#00C2FF] font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                      >
                        <span>Abrir Link</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: DOCS & AUDIOS */}
          {activeTab === 'docs' && (
            <div className="space-y-2.5">
              {filteredDocs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-purple-400">
                    <FileText size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">Nenhum documento ou áudio</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Arquivos PDF, receitas, roteiros e mensagens de voz gravadas aparecerão aqui.
                  </p>
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const isAudio = doc.type === 'audio';
                  const isPlayingThisAudio = playingAudioDocId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-purple-500/50 transition-all shadow-md group flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isAudio ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePlayAudioDoc(doc)}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2E93] to-[#D81B60] text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            title={isPlayingThisAudio ? 'Pausar áudio' : 'Ouvir áudio'}
                          >
                            {isPlayingThisAudio ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 font-bold text-xs">
                            PDF
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                            {doc.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{doc.size}</span>
                            {doc.duration && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-pink-400 font-bold">{doc.duration}</span>
                              </>
                            )}
                            <span>·</span>
                            <span>{doc.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {doc.messageId && (
                          <button
                            type="button"
                            onClick={() => handleJump(doc.messageId)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Ver mensagem na conversa"
                          >
                            <MessageSquare size={15} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownload(doc.name)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Baixar arquivo"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-pink-400" />
            <span>Mídias sincronizadas com o Poquei Capixaba</span>
          </div>
          <span className="font-mono text-slate-500">Criptografia Ponta a Ponta</span>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX IMAGE VIEWER */}
      {selectedLightboxImage && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 animate-fade-in">
          {/* Top Lightbox Actions */}
          <div className="flex items-center justify-between text-white shrink-0">
            <div>
              <p className="text-xs text-slate-400">
                Compartilhado {selectedLightboxImage.sender === 'user' ? 'por você' : `por ${chat.name}`}
              </p>
              <p className="text-[11px] text-slate-500">{selectedLightboxImage.timestamp}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleShare(selectedLightboxImage.caption || 'Foto')}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Compartilhar foto"
              >
                <Share2 size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleDownload(selectedLightboxImage.caption || 'Foto_Capixaba.jpg')}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Baixar foto"
              >
                <Download size={16} />
              </button>

              {selectedLightboxImage.messageId && (
                <button
                  type="button"
                  onClick={() => {
                    const msgId = selectedLightboxImage.messageId;
                    setSelectedLightboxImage(null);
                    handleJump(msgId);
                  }}
                  className="px-3 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ir para a mensagem no chat"
                >
                  <MessageSquare size={14} />
                  <span>Na conversa</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedLightboxImage(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer ml-1"
                title="Fechar visualizador"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Centered Image */}
          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            {selectedLightboxImage.isSvgScene ? (
              <div className="max-w-2xl w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <svg viewBox="0 0 400 250" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="lightboxBeachSky" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#29B6F6" />
                      <stop offset="60%" stopColor="#81D4FA" />
                      <stop offset="100%" stopColor="#FFF9C4" />
                    </linearGradient>
                    <linearGradient id="lightboxOcean" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0288D1" />
                      <stop offset="100%" stopColor="#004D40" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="250" fill="url(#lightboxBeachSky)" />
                  <circle cx="320" cy="50" r="28" fill="#FFF59D" filter="drop-shadow(0 0 10px #FFEE58)" />
                  <path d="M 0,140 Q 120,80 220,135 T 400,120 L 400,200 L 0,200 Z" fill="#2E7D32" opacity="0.8" />
                  <path d="M 180,135 Q 280,95 380,130 L 400,150 L 180,150 Z" fill="#1B5E20" opacity="0.9" />
                  <rect y="130" width="400" height="70" fill="url(#lightboxOcean)" />
                  <path d="M 0,165 Q 100,160 200,165 T 400,163" stroke="#E0F7FA" strokeWidth="3" fill="none" opacity="0.7" />
                  <path d="M 0,185 Q 200,175 400,185 L 400,250 L 0,250 Z" fill="#FFE082" />
                  <circle cx="100" cy="205" r="9" fill="#E91E63" />
                  <circle cx="180" cy="210" r="9" fill="#00BCD4" />
                  <path d="M 350,230 Q 345,185 365,160" stroke="#795548" strokeWidth="4" fill="none" />
                  <circle cx="365" cy="160" r="14" fill="#388E3C" />
                </svg>
              </div>
            ) : (
              <img
                src={selectedLightboxImage.url}
                alt={selectedLightboxImage.caption || 'Foto em tamanho real'}
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              />
            )}
          </div>

          {/* Bottom Caption Bar */}
          {selectedLightboxImage.caption && (
            <div className="px-6 py-3 bg-black/60 backdrop-blur-md rounded-2xl max-w-lg mx-auto text-center shrink-0 border border-white/10">
              <p className="text-sm font-medium text-white">{selectedLightboxImage.caption}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
