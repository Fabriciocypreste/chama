import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  Play,
  Pause,
  CheckCheck,
  MapPin,
  FileText,
  ImageIcon,
  Search,
  Sparkles,
  Ban,
  ShieldCheck,
  BellOff,
  Trash2,
  User,
  AlertTriangle,
  BarChart2,
  Clock,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Filter,
  Wand2,
  RotateCcw,
  Bot,
  Lock,
  Star,
  Radio,
  Navigation,
  Compass,
  Hash,
  Users,
} from 'lucide-react';
import {
  Message,
  ChatThread,
  StickerItem,
  BlockReasonCategory,
  LiveLocationData,
} from '../../types';
import { AndroidStatusBar } from '../common/AndroidStatusBar';
import { AndroidNavBar } from '../common/AndroidNavBar';
import { Avatar } from '../common/Avatar';
import { capixabaStickers } from '../../data/mockData';
import {
  playMessageSentSound,
  playMessageReceivedSound,
  playTapSound,
  playReactionSound,
  playLongPressHaptic,
  playSyntheticVoiceNote,
  playWalkieTalkieBeep,
} from '../../utils/soundEffects';
import { ChatStatsModal } from './ChatStatsModal';
import { DisappearingMessagesModal } from './DisappearingMessagesModal';
import { QuickReplies } from '../common/QuickReplies';
import { translateToCapixaba } from '../../utils/aiTranslator';
import { AiTranslatorModal } from '../chat/AiTranslatorModal';
import { MessageReactionPicker } from '../chat/MessageReactionPicker';
import { MessageReactionBadges } from '../chat/MessageReactionBadges';
import { AudioMessageBubble } from '../chat/AudioMessageBubble';
import { VoiceRecorderBar } from '../chat/VoiceRecorderBar';
import { WalkieTalkieBar } from '../chat/WalkieTalkieBar';
import { LiveLocationModal } from '../chat/LiveLocationModal';
import { MediaLinksDocsModal } from '../chat/MediaLinksDocsModal';
import { EncryptionSecurityModal } from '../chat/EncryptionSecurityModal';
import { BlockContactModal } from '../chat/BlockContactModal';
import { StickerKeyboardDrawer } from '../chat/StickerKeyboardDrawer';

interface ChatDetailScreenProps {
  chat: ChatThread;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (
    text: string,
    type?:
      | 'text'
      | 'image'
      | 'audio'
      | 'quote'
      | 'sticker'
      | 'system'
      | 'walkie_talkie'
      | 'location',
    stickerData?: StickerItem,
    audioDuration?: string,
    audioUrl?: string,
    walkieTalkieChannel?: string,
    liveLocationData?: LiveLocationData
  ) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
  onStartCall: (isVideo: boolean) => void;
  onOpenProfile?: () => void;
  isBlocked?: boolean;
  onBlockContact?: (
    reasonCategory: BlockReasonCategory,
    reasonLabel: string,
    customNotes?: string,
    reportToModeration?: boolean
  ) => void;
  onUnblockContact?: () => void;
  disappearingTimer?: 'off' | '24h' | '7d' | '90d';
  onUpdateDisappearingTimer?: (timer: 'off' | '24h' | '7d' | '90d') => void;
  onSimulateExpire?: () => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  chat,
  messages,
  onBack,
  onSendMessage,
  onReactToMessage,
  onStartCall,
  onOpenProfile,
  isBlocked = false,
  onBlockContact,
  onUnblockContact,
  disappearingTimer = 'off',
  onUpdateDisappearingTimer,
  onSimulateExpire,
}) => {
  const [inputText, setInputText] = useState('');
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);
  const [audioPlaybackCurrentTime, setAudioPlaybackCurrentTime] = useState<number>(0);
  const activeAudioElRef = useRef<HTMLAudioElement | null>(null);
  const stopSyntheticVoiceRef = useRef<(() => void) | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Walkie-Talkie & Live Location & Supergroup states
  const [isWalkieTalkieMode, setIsWalkieTalkieMode] = useState(false);
  const [showLiveLocationModal, setShowLiveLocationModal] = useState(false);
  const [playingWalkieMsgId, setPlayingWalkieMsgId] = useState<string | null>(null);
  const [selectedSubtopicFilter, setSelectedSubtopicFilter] = useState<string | null>(null);

  // Capixaba Reaction State & Long-Press Handling
  const [reactionTargetMessage, setReactionTargetMessage] = useState<Message | null>(null);
  const [localReactions, setLocalReactions] = useState<Record<string, string[]>>({});
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleStartLongPress = (msg: Message) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      playLongPressHaptic();
      setReactionTargetMessage(msg);
    }, 420);
  };

  const handleCancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    playReactionSound();
    const targetMsg = messages.find((m) => m.id === messageId);
    const existing =
      localReactions[messageId] !== undefined
        ? localReactions[messageId]
        : targetMsg?.reactions || [];
    const hasReaction = existing.includes(emoji);
    const updated = hasReaction
      ? existing.filter((e) => e !== emoji)
      : [...existing, emoji];

    setLocalReactions((prev) => ({
      ...prev,
      [messageId]: updated,
    }));

    if (onReactToMessage) {
      onReactToMessage(messageId, emoji);
    }

    showToast(
      hasReaction
        ? `Reação ${emoji} removida da mensagem`
        : `Você reagiu com ${emoji} à mensagem!`
    );
  };

  const getLongPressProps = (msg: Message) => ({
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      handleStartLongPress(msg);
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (touchStartPosRef.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
        const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
        if (dx > 10 || dy > 10) {
          handleCancelLongPress();
        }
      }
    },
    onTouchEnd: () => handleCancelLongPress(),
    onTouchCancel: () => handleCancelLongPress(),
    onMouseDown: (e: React.MouseEvent) => {
      if (e.button === 0) {
        touchStartPosRef.current = { x: e.clientX, y: e.clientY };
        handleStartLongPress(msg);
      }
    },
    onMouseMove: (e: React.MouseEvent) => {
      if (touchStartPosRef.current) {
        const dx = Math.abs(e.clientX - touchStartPosRef.current.x);
        const dy = Math.abs(e.clientY - touchStartPosRef.current.y);
        if (dx > 10 || dy > 10) {
          handleCancelLongPress();
        }
      }
    },
    onMouseUp: () => handleCancelLongPress(),
    onMouseLeave: () => handleCancelLongPress(),
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      handleCancelLongPress();
      playLongPressHaptic();
      setReactionTargetMessage(msg);
    },
  });

  // Block contact menu and modals
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalTab, setMediaModalTab] = useState<'media' | 'links' | 'docs'>('media');
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);

  // Disappearing messages modal & selected option
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [selectedTimerOption, setSelectedTimerOption] = useState<'off' | '24h' | '7d' | '90d'>(
    disappearingTimer
  );

  const handleJumpToMessage = (messageId: string) => {
    setTimeout(() => {
      const el = document.getElementById(`msg-bubble-${messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#00C2FF]', 'ring-offset-2', 'ring-offset-[#070F1E]');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#00C2FF]', 'ring-offset-2', 'ring-offset-[#070F1E]');
        }, 2500);
      }
    }, 120);
  };

  useEffect(() => {
    setSelectedTimerOption(disappearingTimer);
  }, [disappearingTimer]);

  // Search state in ChatDetailScreen
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [filterOnlyMatches, setFilterOnlyMatches] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Capixaba Translator states
  const [isAiTranslating, setIsAiTranslating] = useState(false);
  const [lastOriginalText, setLastOriginalText] = useState<string | null>(null);
  const [translationBanner, setTranslationBanner] = useState<{
    original: string;
    translated: string;
    source?: string;
  } | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen) {
      setFilterOnlyMatches(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setActiveMatchIndex(0);
      setFilterOnlyMatches(true);
    }
  }, [isSearchOpen]);

  // Message text extraction helper for searching
  const getMessageSearchableText = (msg: Message): string => {
    const parts: string[] = [];
    if (msg.text) parts.push(msg.text);
    if (msg.quoteText) parts.push(msg.quoteText);
    if (msg.imageCaption) parts.push(msg.imageCaption);
    if (msg.stickerData?.phrase) parts.push(msg.stickerData.phrase);
    if (msg.stickerData?.badgeText) parts.push(msg.stickerData.badgeText);
    return parts.join(' ').toLowerCase();
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingMessageIds = React.useMemo(() => {
    if (!trimmedQuery || !isSearchOpen) return [];
    return messages
      .filter((msg) => {
        const text = getMessageSearchableText(msg);
        return text.includes(trimmedQuery);
      })
      .map((m) => m.id);
  }, [messages, trimmedQuery, isSearchOpen]);

  // Adjust active match index if matches change
  useEffect(() => {
    if (matchingMessageIds.length === 0) {
      setActiveMatchIndex(0);
    } else if (activeMatchIndex >= matchingMessageIds.length) {
      setActiveMatchIndex(matchingMessageIds.length - 1);
    }
  }, [matchingMessageIds.length]);

  const activeMatchedMessageId = matchingMessageIds[activeMatchIndex] || null;

  // Scroll to active match when it changes
  useEffect(() => {
    if (isSearchOpen && activeMatchedMessageId) {
      const el = document.getElementById(`msg-bubble-${activeMatchedMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeMatchIndex, activeMatchedMessageId, isSearchOpen]);

  const handleNextMatch = () => {
    if (matchingMessageIds.length === 0) return;
    playTapSound();
    setActiveMatchIndex((prev) => (prev + 1) % matchingMessageIds.length);
  };

  const handlePrevMatch = () => {
    if (matchingMessageIds.length === 0) return;
    playTapSound();
    setActiveMatchIndex((prev) => (prev - 1 + matchingMessageIds.length) % matchingMessageIds.length);
  };

  // Helper to highlight matching text occurrences
  const renderHighlightedText = (text?: string, isCurrentBubble?: boolean) => {
    if (!text) return null;
    const query = searchQuery.trim();
    if (!isSearchOpen || !query) return text;

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    if (parts.length <= 1) return text;

    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === query.toLowerCase()) {
            return (
              <mark
                key={index}
                className={`rounded-xs px-1 py-0.5 font-bold transition-all duration-200 ${
                  isCurrentBubble
                    ? 'bg-amber-300 text-slate-950 shadow-sm ring-2 ring-amber-400'
                    : 'bg-amber-400/90 text-slate-900'
                }`}
              >
                {part}
              </mark>
            );
          }
          return part;
        })}
      </>
    );
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom only when search is not actively jumping
  useEffect(() => {
    if (!isSearchOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showStickers, isSearchOpen]);

  const parseDurationToSeconds = (durStr?: string): number => {
    if (!durStr) return 32;
    const parts = durStr.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      return mins * 60 + secs;
    }
    const num = parseInt(durStr, 10);
    return isNaN(num) ? 32 : num;
  };

  const stopAllAudioPlayback = () => {
    if (activeAudioElRef.current) {
      try {
        activeAudioElRef.current.pause();
        activeAudioElRef.current.currentTime = 0;
      } catch {}
      activeAudioElRef.current = null;
    }
    if (stopSyntheticVoiceRef.current) {
      try {
        stopSyntheticVoiceRef.current();
      } catch {}
      stopSyntheticVoiceRef.current = null;
    }
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setPlayingAudioMsgId(null);
    setPlayingWalkieMsgId(null);
    setAudioPlaybackCurrentTime(0);
  };

  const handleTogglePlayWalkie = (msg: Message) => {
    playTapSound();
    if (playingWalkieMsgId === msg.id) {
      stopAllAudioPlayback();
      return;
    }
    stopAllAudioPlayback();
    playWalkieTalkieBeep(true);
    setPlayingWalkieMsgId(msg.id);
    const durSec = parseDurationToSeconds(msg.audioDuration || '5s');
    setTimeout(() => {
      playWalkieTalkieBeep(false);
      setPlayingWalkieMsgId(null);
    }, durSec * 1000);
  };

  useEffect(() => {
    return () => {
      stopAllAudioPlayback();
    };
  }, []);

  const handleTogglePlayAudio = (msg: Message) => {
    playTapSound();
    if (playingAudioMsgId === msg.id) {
      stopAllAudioPlayback();
      return;
    }

    stopAllAudioPlayback();

    const durationSec = parseDurationToSeconds(msg.audioDuration || '0:32');
    setPlayingAudioMsgId(msg.id);
    setAudioPlaybackCurrentTime(0);

    if (msg.audioUrl) {
      try {
        const audio = new Audio(msg.audioUrl);
        activeAudioElRef.current = audio;
        audio.ontimeupdate = () => {
          setAudioPlaybackCurrentTime(Math.floor(audio.currentTime));
        };
        audio.onended = () => {
          stopAllAudioPlayback();
        };
        audio.onerror = () => {
          playSyntheticPlayback(durationSec);
        };
        audio.play().catch(() => {
          playSyntheticPlayback(durationSec);
        });
      } catch {
        playSyntheticPlayback(durationSec);
      }
    } else {
      playSyntheticPlayback(durationSec);
    }
  };

  const playSyntheticPlayback = (durationSec: number) => {
    const stopFn = playSyntheticVoiceNote(durationSec, () => {
      stopAllAudioPlayback();
    });
    stopSyntheticVoiceRef.current = stopFn;

    let sec = 0;
    audioIntervalRef.current = setInterval(() => {
      sec += 1;
      setAudioPlaybackCurrentTime(sec);
      if (sec >= durationSec) {
        stopAllAudioPlayback();
      }
    }, 1000);
  };

  const handleSeekAudio = (msg: Message, fraction: number) => {
    const totalSec = parseDurationToSeconds(msg.audioDuration || '0:32');
    const targetSec = Math.floor(fraction * totalSec);
    setAudioPlaybackCurrentTime(targetSec);
    if (playingAudioMsgId === msg.id && activeAudioElRef.current) {
      try {
        activeAudioElRef.current.currentTime = targetSec;
      } catch {}
    }
  };

  const handleTranslateCurrentText = async (customText?: string) => {
    const raw = (customText !== undefined ? customText : inputText).trim();
    if (!raw) {
      setShowAiModal(true);
      return;
    }

    setIsAiTranslating(true);
    playTapSound();
    showToast('Traduzindo para dialeto capixaba autêntico com IA... ✨');

    try {
      const res = await translateToCapixaba(raw);
      setLastOriginalText(raw);
      setInputText(res.translatedText);
      setTranslationBanner({
        original: raw,
        translated: res.translatedText,
        source: res.source,
      });
      playMessageReceivedSound();
      showToast('Mensagem traduzida para o dialeto capixaba!');
    } catch (err: any) {
      console.error('Translation error:', err);
      showToast('Erro ao traduzir. Tente novamente.');
    } finally {
      setIsAiTranslating(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    playMessageSentSound();
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
    setLastOriginalText(null);
    setTranslationBanner(null);
    setShowStickers(false);

    // Auto simulated response after 2s for authentic feel
    if (chat.id === 'chat-ana-clara') {
      setTimeout(() => {
        playMessageReceivedSound();
      }, 2000);
    }
  };

  const handleSendSticker = (sticker: StickerItem) => {
    playMessageSentSound();
    onSendMessage(sticker.phrase, 'sticker', sticker);
    setShowStickers(false);

    // Auto simulated response from Ana Clara for Capixaba stickers
    if (chat.id === 'chat-ana-clara') {
      setTimeout(() => {
        playMessageReceivedSound();
      }, 2000);
    }
  };

  // Saved / Favorite stickers state in "Minhas Figurinhas"
  const [favoriteStickerIds, setFavoriteStickerIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('poquei_favorite_stickers_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load favorite stickers from localStorage', e);
    }
    return ['stk-poquei', 'stk-moqueca', 'stk-partiu-camburi'];
  });

  const handleToggleFavoriteSticker = (stickerId: string) => {
    setFavoriteStickerIds((prev) => {
      const exists = prev.includes(stickerId);
      const updated = exists
        ? prev.filter((id) => id !== stickerId)
        : [...prev, stickerId];
      try {
        localStorage.setItem('poquei_favorite_stickers_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const handleSendQuickReply = (text: string) => {
    playMessageSentSound();
    onSendMessage(text, 'text');
    showToast(`Resposta rápida enviada: "${text}"`);
    setShowStickers(false);
    setShowAttachments(false);

    // Auto simulated response from Ana Clara for quick replies
    if (chat.id === 'chat-ana-clara') {
      setTimeout(() => {
        playMessageReceivedSound();
      }, 2000);
    }
  };

  const handleSendVoiceMessage = (durationSeconds: number, audioUrl?: string) => {
    setIsRecording(false);
    playMessageSentSound();
    const durationStr = `0:${String(durationSeconds).padStart(2, '0')}`;
    onSendMessage(
      `Mensagem de voz (${durationStr})`,
      'audio',
      undefined,
      durationStr,
      audioUrl
    );
    showToast(`Áudio gravado e enviado (${durationStr})! 🎙️`);

    // Auto simulated response from Ana Clara
    if (chat.id === 'chat-ana-clara') {
      setTimeout(() => {
        playMessageReceivedSound();
      }, 2000);
    }
  };


  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#070F1E] text-white select-none">
      {/* Background Wallpaper with subtle Terceira Ponte glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1224] via-[#0B152B] to-[#060D1A] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Top Status Bar */}
      <AndroidStatusBar className="relative z-30" />

      {/* Top Header: Search Mode or Standard Mode */}
      {isSearchOpen ? (
        <header className="relative z-30 px-3 py-2 bg-[#091122]/98 backdrop-blur-2xl border-b border-[#00C2FF]/30 flex items-center gap-2 shadow-2xl animate-fade-in">
          {/* Back / Close button */}
          <button
            type="button"
            title="Fechar pesquisa"
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Search Input Container */}
          <div className="flex-1 relative flex items-center min-w-0">
            <Search
              size={16}
              className="absolute left-3 text-[#00C2FF] pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.shiftKey) handlePrevMatch();
                  else handleNextMatch();
                } else if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Pesquisar mensagens antigas..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-900/90 border border-white/20 focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] rounded-xl text-xs text-slate-100 placeholder:text-slate-400 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                title="Limpar pesquisa"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results count & Navigation */}
          {trimmedQuery ? (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-semibold text-slate-300 px-1 whitespace-nowrap">
                {matchingMessageIds.length > 0
                  ? `${activeMatchIndex + 1}/${matchingMessageIds.length}`
                  : '0/0'}
              </span>

              <button
                type="button"
                title="Mensagem anterior (Shift+Enter)"
                disabled={matchingMessageIds.length === 0}
                onClick={handlePrevMatch}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronUp size={16} />
              </button>

              <button
                type="button"
                title="Próxima mensagem (Enter)"
                disabled={matchingMessageIds.length === 0}
                onClick={handleNextMatch}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronDown size={16} />
              </button>

              {/* Filter toggle button */}
              <button
                type="button"
                title={filterOnlyMatches ? "Mostrar todas as mensagens" : "Filtrar e exibir apenas as mensagens encontradas"}
                onClick={() => setFilterOnlyMatches(!filterOnlyMatches)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                  filterOnlyMatches
                    ? 'bg-pink-500/25 border-pink-500 text-pink-300 shadow-sm'
                    : 'bg-slate-800/80 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Filter size={11} />
                <span>{filterOnlyMatches ? 'Filtradas' : 'Todas'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-1.5 py-1 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </header>
      ) : (
        /* Standard Chat Top Header */
        <header className="relative z-30 px-3 py-2 bg-[#091122]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {/* Back button */}
            <button
              type="button"
              title="Voltar"
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Contact Avatar */}
            <div
              className="flex items-center gap-2.5 cursor-pointer min-w-0"
              onClick={onOpenProfile}
            >
              <Avatar
                name={chat.name}
                src={chat.avatarUrl}
                size="sm"
                isOnline={chat.isOnline}
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-semibold text-slate-100 truncate">
                    {chat.name}
                  </h2>
                  <button
                    type="button"
                    title="Criptografia de ponta a ponta ativa. Toque para verificar."
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapSound();
                      setShowEncryptionModal(true);
                    }}
                    className="p-1 -m-0.5 text-cyan-400/90 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-full transition-all cursor-pointer shrink-0"
                  >
                    <Lock size={12} className="text-[#00C2FF]" />
                  </button>
                  {disappearingTimer && disappearingTimer !== 'off' && (
                    <span
                      title={`Mensagens temporárias ativadas: ${disappearingTimer}. Toque para configurar.`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDisappearingModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-[#FF2E93] border border-pink-500/35 text-[10px] font-bold cursor-pointer transition-all shrink-0"
                    >
                      <Clock size={10} />
                      <span>{disappearingTimer}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-emerald-400 block leading-tight">
                  {chat.isOnline ? 'online' : chat.lastSeen || 'visto recentemente'}
                </span>
              </div>
            </div>
          </div>

          {/* Action icons: Search, Call, Video, Chart, Menu */}
          <div className="flex items-center gap-0.5 text-slate-300">
            {/* Quick Search Trigger */}
            <button
              type="button"
              title="Pesquisar mensagens na conversa"
              onClick={() => setIsSearchOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00C2FF] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              title="Ligação de voz"
              onClick={() => onStartCall(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Phone size={18} />
            </button>

            <button
              type="button"
              title="Chamada de vídeo"
              onClick={() => onStartCall(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Video size={19} />
            </button>

            {/* Quick Chart Trigger */}
            <button
              type="button"
              title="Intensidade da conversa (Gráfico de Mensagens)"
              onClick={() => setShowStatsModal(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-pink-400 hover:text-pink-300 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <BarChart2 size={18} />
            </button>

            {/* Quick Media, Links & Docs Trigger */}
            <button
              type="button"
              title="Mídia, Links e Docs"
              onClick={() => {
                playTapSound();
                setShowMediaModal(true);
                setMediaModalTab('media');
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-purple-400 hover:text-purple-300 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ImageIcon size={18} />
            </button>

            {/* 3-dots menu container */}
            <div className="relative">
              <button
                type="button"
                title="Mais opções"
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <MoreVertical size={19} />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-10 w-56 bg-slate-900/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl py-1.5 z-50 animate-fade-in divide-y divide-white/10">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowDisappearingModal(true);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock size={15} className="text-[#FF2E93]" />
                          <span>Mensagens temporárias</span>
                        </div>
                        <span className="text-[10px] font-bold text-pink-400 uppercase">
                          {disappearingTimer && disappearingTimer !== 'off' ? disappearingTimer : 'Desativ.'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setIsSearchOpen(true);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Search size={15} className="text-[#00C2FF]" />
                        <span>Pesquisar na conversa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowStatsModal(true);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <BarChart2 size={15} className="text-[#FF2E93]" />
                        <span>Intensidade da conversa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User size={15} className="text-[#00C2FF]" />
                        <span>Ver contato</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          playTapSound();
                          setShowMediaModal(true);
                          setMediaModalTab('media');
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ImageIcon size={15} className="text-purple-400" />
                        <span>Mídia, Links e Docs</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          playTapSound();
                          setShowEncryptionModal(true);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Lock size={15} className="text-[#00C2FF]" />
                        <span>Criptografia de ponta a ponta</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          showToast('Notificações silenciadas por 8 horas');
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <BellOff size={15} className="text-amber-400" />
                        <span>Silenciar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          showToast('Conversa limpa com sucesso');
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} className="text-slate-400" />
                        <span>Limpar conversa</span>
                      </button>
                    </div>

                    {/* Block / Unblock action */}
                    <div className="py-1">
                      {isBlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowUnblockConfirm(true);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                        >
                          <ShieldCheck size={15} />
                          <span>Desbloquear contato</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowBlockConfirm(true);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                        >
                          <Ban size={15} />
                          <span>Bloquear contato</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Supergroup Subtopics Channels Bar */}
      {chat.isSupergroup && chat.subtopics && chat.subtopics.length > 0 && (
        <div className="relative z-25 px-3 py-2 bg-[#081324]/95 border-b border-pink-500/20 backdrop-blur-md flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-md">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-500/20 text-[#FF2E93] text-[10px] font-bold shrink-0 border border-pink-500/30">
            <Users size={11} />
            <span>
              {chat.memberCount ? `${(chat.memberCount / 1000).toFixed(1)}k membros` : 'Supergrupo'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              setSelectedSubtopicFilter(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubtopicFilter === null
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/5'
            }`}
          >
            #todos-os-canais
          </button>

          {chat.subtopics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => {
                playTapSound();
                setSelectedSubtopicFilter(topic);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                selectedSubtopicFilter === topic
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/5'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 border border-[#00C2FF]/40 text-xs text-slate-100 rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2 pointer-events-none">
          <Sparkles size={14} className="text-[#00C2FF] animate-pulse shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {/* Date pill separator */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] text-slate-400 font-medium tracking-wide shadow-sm">
            Hoje
          </span>
        </div>

        {/* End-to-End Encryption Visual Indicator Banner */}
        <div className="flex justify-center my-2.5 animate-fade-in">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setShowEncryptionModal(true);
            }}
            className="max-w-[350px] px-3.5 py-2 rounded-2xl bg-slate-900/85 hover:bg-slate-800/90 border border-amber-400/25 hover:border-amber-400/40 text-[11px] text-amber-200/90 flex items-center gap-2.5 shadow-lg backdrop-blur-md active:scale-95 transition-all cursor-pointer text-left group"
            title="As mensagens e chamadas são protegidas com criptografia de ponta a ponta. Toque para saber mais."
          >
            <div className="w-6 h-6 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
              <Lock size={12} />
            </div>
            <span className="leading-snug text-slate-300">
              <strong className="text-amber-300 font-semibold">Criptografia de ponta a ponta:</strong> As mensagens e chamadas são protegidas. Ninguém fora desta conversa pode lê-las ou ouvi-las. <span className="text-[#00C2FF] font-semibold underline decoration-cyan-400/50 hover:decoration-cyan-300">Toque para saber mais</span>.
            </span>
          </button>
        </div>

        {/* Disappearing Messages Active Banner */}
        {disappearingTimer && disappearingTimer !== 'off' && (
          <div className="flex justify-center my-2 animate-fade-in">
            <button
              type="button"
              onClick={() => setShowDisappearingModal(true)}
              className="px-3.5 py-1.5 rounded-2xl bg-pink-500/15 border border-pink-500/35 text-[11px] text-pink-200 flex items-center gap-2 shadow-md hover:bg-pink-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Clock size={13} className="text-[#FF2E93] shrink-0" />
              <span>Mensagens temporárias ativadas ({disappearingTimer}). Toque para alterar.</span>
            </button>
          </div>
        )}

        {/* Helper hint when search is open but empty */}
        {isSearchOpen && !trimmedQuery && (
          <div className="flex items-center justify-center my-2 animate-fade-in">
            <div className="px-3.5 py-1.5 rounded-2xl bg-cyan-950/40 border border-[#00C2FF]/30 text-[11px] text-[#00C2FF] flex items-center gap-1.5 shadow-sm">
              <Search size={12} className="text-[#00C2FF] shrink-0" />
              <span>Digite para filtrar mensagens antigas (ex: Camburi, praia, moqueca, áudio)</span>
            </div>
          </div>
        )}

        {/* Active Filter Banner when search has query and matches */}
        {isSearchOpen && trimmedQuery && matchingMessageIds.length > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-[#00C2FF]/40 text-xs text-slate-200 shadow-lg backdrop-blur-md animate-fade-in">
            <span className="flex items-center gap-2 text-xs">
              <Filter size={13} className="text-[#00C2FF]" />
              <span>
                {filterOnlyMatches ? 'Filtrando:' : 'Destacando:'}{' '}
                <strong>{matchingMessageIds.length}</strong> de {messages.length} mensagens com "{searchQuery}"
              </span>
            </span>
            <button
              type="button"
              onClick={() => setFilterOnlyMatches(!filterOnlyMatches)}
              className="text-[11px] font-semibold text-[#00C2FF] hover:text-[#38D8FF] transition-colors cursor-pointer"
            >
              {filterOnlyMatches ? 'Ver no contexto' : 'Apenas filtradas'}
            </button>
          </div>
        )}

        {/* Empty State when no messages match search query */}
        {isSearchOpen && trimmedQuery && matchingMessageIds.length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 text-center my-8 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-white/10 max-w-xs mx-auto animate-fade-in shadow-xl">
            <div className="w-12 h-12 rounded-full bg-slate-800/90 border border-white/10 flex items-center justify-center mb-3 text-slate-400">
              <Search size={22} className="text-pink-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100">
              Nenhuma mensagem encontrada
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Não encontramos nenhuma mensagem correspondente a <span className="text-pink-300 font-semibold">"{searchQuery}"</span> nesta conversa.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Limpar pesquisa
              </button>
              <button
                type="button"
                onClick={() => setFilterOnlyMatches(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
              >
                Ver todas
              </button>
            </div>
          </div>
        )}

        {(isSearchOpen && filterOnlyMatches && trimmedQuery
          ? messages.filter((m) => matchingMessageIds.includes(m.id))
          : messages
        ).map((msg) => {
          const isBubbleMatched = Boolean(trimmedQuery && isSearchOpen && matchingMessageIds.includes(msg.id));
          const isCurrentMatchBubble = Boolean(isBubbleMatched && msg.id === activeMatchedMessageId);

          if (msg.type === 'system') {
            return (
              <div
                key={msg.id}
                id={`msg-bubble-${msg.id}`}
                className={`w-full flex justify-center my-2.5 transition-all duration-200 ${
                  isCurrentMatchBubble ? 'scale-105' : ''
                }`}
              >
                <div
                  onClick={() => setShowDisappearingModal(true)}
                  className={`px-3.5 py-2 rounded-2xl bg-slate-900/90 border text-xs text-slate-200 flex items-center gap-2 shadow-lg backdrop-blur-md cursor-pointer hover:bg-slate-800/90 transition-all text-center max-w-[90%] ${
                    isCurrentMatchBubble
                      ? 'border-[#00C2FF] ring-2 ring-[#00C2FF] shadow-[#00C2FF]/30'
                      : isBubbleMatched
                      ? 'border-amber-400/60'
                      : 'border-pink-500/30'
                  }`}
                >
                  <Clock size={14} className="text-[#FF2E93] shrink-0" />
                  <span className="leading-relaxed">
                    {renderHighlightedText(msg.text, isCurrentMatchBubble)}
                  </span>
                </div>
              </div>
            );
          }

          const isUser = msg.senderId === 'user';
          const isTemporary = msg.isDisappearing || (disappearingTimer !== 'off');
          const currentReactions =
            localReactions[msg.id] !== undefined
              ? localReactions[msg.id]
              : msg.reactions || [];
          const isBeingLongPressed = reactionTargetMessage?.id === msg.id;

          return (
            <div
              key={msg.id}
              id={`msg-bubble-${msg.id}`}
              className={`group relative flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                isUser ? 'ml-auto' : 'mr-auto'
              } ${currentReactions.length > 0 ? 'mb-4' : 'mb-1'} transition-all duration-200 select-none cursor-pointer ${
                isBeingLongPressed ? 'scale-105 z-30' : ''
              } ${
                isCurrentMatchBubble
                  ? 'ring-2 ring-[#00C2FF] ring-offset-2 ring-offset-[#070F1E] rounded-2xl shadow-xl shadow-[#00C2FF]/30 scale-[1.01]'
                  : isBubbleMatched
                  ? 'ring-1 ring-amber-400/50 rounded-2xl'
                  : ''
              }`}
              {...getLongPressProps(msg)}
            >
              {/* Type: Plain Text Message */}
              {msg.type === 'text' && (
                <div
                  className={`p-3 rounded-2xl relative shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-[#FF2E93] to-[#D81B60] text-white rounded-tr-xs'
                      : 'bg-slate-800/85 backdrop-blur-md text-slate-100 border border-white/10 rounded-tl-xs'
                  }`}
                >
                  <p className="text-sm leading-relaxed pr-12">
                    {renderHighlightedText(msg.text, isCurrentMatchBubble)}
                  </p>
                  <div className="flex items-center gap-1.5 justify-end mt-1 text-[10px] text-white/70">
                    {isTemporary && (
                      <span
                        title={`Mensagem temporária (${msg.disappearingDuration || disappearingTimer})`}
                        className="inline-flex items-center gap-0.5 text-pink-300 font-semibold"
                      >
                        <Clock size={11} />
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck size={14} className="text-[#00C2FF]" />}
                  </div>
                </div>
              )}

              {/* Type: Audio Message */}
              {msg.type === 'audio' && (
                <AudioMessageBubble
                  msg={msg}
                  isUser={isUser}
                  isTemporary={isTemporary}
                  isPlaying={playingAudioMsgId === msg.id}
                  currentTime={playingAudioMsgId === msg.id ? audioPlaybackCurrentTime : 0}
                  totalDuration={parseDurationToSeconds(msg.audioDuration || '0:32')}
                  onTogglePlay={() => handleTogglePlayAudio(msg)}
                  onSeek={(fraction) => handleSeekAudio(msg, fraction)}
                />
              )}

              {/* Type: Photo Message */}
              {msg.type === 'image' && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    playTapSound();
                    setShowMediaModal(true);
                    setMediaModalTab('media');
                  }}
                  className="p-1 rounded-2xl rounded-tl-xs bg-slate-800/85 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden max-w-[280px] cursor-pointer hover:border-pink-500/50 transition-all group/photo"
                >
                  {/* Photo container: Camburi Beach scenery or uploaded photo */}
                  <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900">
                    {msg.imageUrl && msg.imageUrl !== 'camburi-beach' ? (
                      <img
                        src={msg.imageUrl}
                        alt={msg.imageCaption || 'Foto'}
                        className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <svg viewBox="0 0 400 250" className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300">
                        <defs>
                          <linearGradient id="beachSky" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#29B6F6" />
                            <stop offset="60%" stopColor="#81D4FA" />
                            <stop offset="100%" stopColor="#FFF9C4" />
                          </linearGradient>
                          <linearGradient id="oceanBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0288D1" />
                            <stop offset="100%" stopColor="#004D40" />
                          </linearGradient>
                        </defs>
                        {/* Tropical Sky */}
                        <rect width="400" height="250" fill="url(#beachSky)" />
                        {/* Sun */}
                        <circle cx="320" cy="50" r="28" fill="#FFF59D" filter="drop-shadow(0 0 10px #FFEE58)" />
                        {/* Distant Hills / Morro do Moreno */}
                        <path d="M 0,140 Q 120,80 220,135 T 400,120 L 400,200 L 0,200 Z" fill="#2E7D32" opacity="0.8" />
                        <path d="M 180,135 Q 280,95 380,130 L 400,150 L 180,150 Z" fill="#1B5E20" opacity="0.9" />
                        {/* Ocean waves */}
                        <rect y="130" width="400" height="70" fill="url(#oceanBlue)" />
                        <path d="M 0,165 Q 100,160 200,165 T 400,163" stroke="#E0F7FA" strokeWidth="3" fill="none" opacity="0.7" />
                        {/* Sand Beach Camburi */}
                        <path d="M 0,185 Q 200,175 400,185 L 400,250 L 0,250 Z" fill="#FFE082" />
                        {/* Beach umbrellas & coconut trees */}
                        <circle cx="100" cy="205" r="9" fill="#E91E63" />
                        <circle cx="180" cy="210" r="9" fill="#00BCD4" />
                        {/* Palm silhouette */}
                        <path d="M 350,230 Q 345,185 365,160" stroke="#795548" strokeWidth="4" fill="none" />
                        <circle cx="365" cy="160" r="14" fill="#388E3C" />
                      </svg>
                    )}

                    {/* Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] text-white font-medium flex items-center gap-1">
                      <MapPin size={10} className="text-[#FF2E93]" />
                      <span>{msg.imageUrl && msg.imageUrl !== 'camburi-beach' ? 'Foto' : 'Praia de Camburi'}</span>
                    </div>

                    {/* Tap to expand hint */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] text-white/80 opacity-0 group-hover/photo:opacity-100 transition-opacity">
                      Ver na galeria
                    </div>
                  </div>

                  {/* Caption & Timestamp */}
                  <div className="p-2.5 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-100">
                      {renderHighlightedText(msg.imageCaption || 'ES sempre incrível! 💙', isCurrentMatchBubble)}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-2">
                      {isTemporary && (
                        <Clock size={11} className="text-pink-400" />
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Type: Highlight / Quote Card */}
              {msg.type === 'quote' && (
                <div className="p-3.5 rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#FF2E93] via-[#E91E63] to-[#D81B60] text-white shadow-xl shadow-[#FF2E93]/25 border border-white/20">
                  <p className="text-sm font-semibold tracking-wide drop-shadow-sm pr-6">
                    {renderHighlightedText(msg.text || msg.quoteText, isCurrentMatchBubble)}
                  </p>
                  <div className="flex items-center gap-1.5 justify-end mt-1 text-[10px] text-white/80">
                    {isTemporary && (
                      <Clock size={11} className="text-pink-300" />
                    )}
                    <span>{msg.timestamp}</span>
                    <CheckCheck size={14} className="text-[#00C2FF]" />
                  </div>
                </div>
              )}

              {/* Type: Sticker Regional do Espírito Santo */}
              {msg.type === 'sticker' && (
                <div
                  className="group relative select-none cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
                  onClick={() => playTapSound()}
                >
                  {/* Sticker Graphic Container with WhatsApp die-cut white outline */}
                  <div
                    className={`relative p-3.5 rounded-3xl bg-gradient-to-tr ${
                      msg.stickerData?.bgGradient || 'from-pink-500 via-rose-500 to-amber-500'
                    } text-white shadow-2xl border-2 border-white/90 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] min-w-[170px] max-w-[210px] overflow-hidden`}
                  >
                    {/* Gloss shine reflection */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/25 rounded-full blur-xl pointer-events-none" />

                    {/* Top sticker bar with ES flag micro-badge & favorite star toggle */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-md text-[9px] font-bold tracking-wider uppercase text-white/90 border border-white/20">
                        {renderHighlightedText(msg.stickerData?.badgeText || 'Capixaba Raiz', isCurrentMatchBubble)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {msg.stickerData?.id && (
                          <button
                            type="button"
                            title={
                              favoriteStickerIds.includes(msg.stickerData.id)
                                ? 'Salva em Minhas Figurinhas ⭐'
                                : 'Salvar em Minhas Figurinhas'
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              playTapSound();
                              handleToggleFavoriteSticker(msg.stickerData!.id);
                              const isFav = favoriteStickerIds.includes(msg.stickerData!.id);
                              showToast(
                                isFav
                                  ? 'Removida de "Minhas Figurinhas"'
                                  : `"${msg.stickerData!.phrase}" salva em "Minhas Figurinhas"! ⭐`
                              );
                            }}
                            className={`p-1 rounded-full transition-all cursor-pointer ${
                              favoriteStickerIds.includes(msg.stickerData.id)
                                ? 'text-amber-300 bg-black/40 ring-1 ring-amber-400/60'
                                : 'text-white/60 hover:text-amber-300 hover:bg-black/30'
                            }`}
                          >
                            <Star
                              size={12}
                              className={
                                favoriteStickerIds.includes(msg.stickerData.id)
                                  ? 'fill-amber-400 text-amber-400'
                                  : ''
                              }
                            />
                          </button>
                        )}
                        <span className="text-xs">💙🤍💖</span>
                      </div>
                    </div>

                    {/* Central Emoji & Phrase */}
                    <div className="flex flex-col items-center text-center my-1.5 py-1">
                      <span className="text-4xl mb-1 filter drop-shadow-md">
                        {msg.stickerData?.emoji || '🏝️'}
                      </span>
                      <span className="text-base font-extrabold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
                        {renderHighlightedText(msg.stickerData?.phrase || msg.text, isCurrentMatchBubble)}
                      </span>
                    </div>

                    {/* Bottom watermark */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[9px] text-white/80 font-medium">
                      <span>Poquei · ES</span>
                      <span>#regional</span>
                    </div>
                  </div>

                  {/* Message timestamp & ticks */}
                  <div className="flex items-center gap-1.5 justify-end mt-1 px-1 text-[10px] text-slate-300">
                    {isTemporary && (
                      <Clock size={11} className="text-pink-400" />
                    )}
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck size={14} className="text-[#00C2FF]" />}
                  </div>
                </div>
              )}

              {/* Type: Walkie-Talkie VHF Radio Transmission */}
              {msg.type === 'walkie_talkie' && (
                <div
                  className={`p-3.5 rounded-2xl relative shadow-xl border w-72 sm:w-80 select-none ${
                    isUser
                      ? 'bg-gradient-to-r from-[#17253d] to-[#0c1626] border-amber-500/40 text-amber-100 rounded-tr-xs'
                      : 'bg-[#0a1526]/95 border-amber-500/30 text-amber-200 rounded-tl-xs'
                  }`}
                >
                  {/* Channel Frequency Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20 text-[10px] font-mono">
                    <span className="flex items-center gap-1.5 font-bold text-amber-400">
                      <Radio size={13} className="text-amber-400 animate-pulse" />
                      <span>{msg.walkieTalkieChannel || 'CH 27 · 146.520 MHz'}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                      PTT / CÂMBIO
                    </span>
                  </div>

                  {/* Radio Play button & Waveform */}
                  <div className="flex items-center gap-3 my-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlayWalkie(msg);
                      }}
                      className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                    >
                      {playingWalkieMsgId === msg.id ? (
                        <span className="text-xs font-mono font-black">■ PAUSAR</span>
                      ) : (
                        <span className="text-xs font-mono font-black">▶ OUVIR</span>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Animated Radio Bars */}
                      <div className="flex items-end gap-[3px] h-6 py-1">
                        {[45, 80, 100, 60, 90, 75, 40, 85, 95, 70, 50, 90, 80, 60].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full transition-all ${
                              playingWalkieMsgId === msg.id
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-amber-500/40'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/80">
                        <span>{msg.audioDuration || '5s'}</span>
                        <span className="italic opacity-80">
                          {playingWalkieMsgId === msg.id ? 'Transmitindo...' : 'Transmissão de rádio'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transcript / Subtext */}
                  {msg.text && (
                    <p className="text-[11px] text-slate-300 mt-2 font-mono leading-tight bg-black/30 p-1.5 rounded-lg border border-white/5">
                      {renderHighlightedText(msg.text, isCurrentMatchBubble)}
                    </p>
                  )}

                  {/* Timestamp & checks */}
                  <div className="flex items-center gap-1.5 justify-end mt-1 text-[10px] text-amber-400/70">
                    {isTemporary && (
                      <Clock size={11} className="text-pink-400" />
                    )}
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck size={13} className="text-amber-400" />}
                  </div>
                </div>
              )}

              {/* Type: Live Location Card in Espírito Santo */}
              {msg.type === 'location' && (
                <div
                  className={`p-3 rounded-2xl relative shadow-xl border w-72 sm:w-80 select-none overflow-hidden ${
                    isUser
                      ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 rounded-tr-xs'
                      : 'bg-slate-900/90 border-cyan-500/30 text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {/* Map Graphic Simulation Header */}
                  <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-[#071325] border border-emerald-500/30 flex items-center justify-center mb-2.5">
                    {/* Radial grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#00C2FF_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                    {/* Pulsing circle */}
                    <div className="absolute w-24 h-24 rounded-full border border-emerald-400/40 animate-ping opacity-30" />
                    <div className="absolute w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/60" />

                    {/* Center Pin */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                        <Navigation size={17} className="rotate-45" />
                      </div>
                    </div>

                    {/* Live Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-slate-950 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>TEMPO REAL</span>
                    </div>

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] text-emerald-300 font-mono">
                      ES · GPS Ativo
                    </div>
                  </div>

                  {/* Location Name & Details */}
                  <div className="space-y-1 mb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#FF2E93] shrink-0" />
                      <span className="truncate">
                        {msg.liveLocationData?.placeName || msg.text || 'Localização ao vivo'}
                      </span>
                    </h4>
                    {msg.liveLocationData?.landmark && (
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {msg.liveLocationData.landmark}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                      <span className="text-emerald-400 font-medium">
                        Duração: {msg.liveLocationData?.durationMinutes || 60} min
                      </span>
                      <span>Precisão ~8m</span>
                    </div>
                  </div>

                  {/* Action buttons: Abrir Rota */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        showToast(`Traçando rota no mapa até ${msg.liveLocationData?.placeName || 'o destino'}! 🗺️`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Navigation size={11} />
                      <span>Ver no Mapa</span>
                    </button>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck size={13} className="text-[#00C2FF]" />}
                    </div>
                  </div>
                </div>
              )}

              {/* Message Reaction Badges on bottom corner */}
              <MessageReactionBadges
                reactions={currentReactions}
                onToggleReaction={(emoji) => handleToggleReaction(msg.id, emoji)}
                onOpenPicker={() => setReactionTargetMessage(msg)}
                isUserMessage={isUser}
              />

              {/* Desktop quick reaction button on hover */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playTapSound();
                  setReactionTargetMessage(msg);
                }}
                className={`absolute -top-2.5 ${
                  isUser ? '-left-8' : '-right-8'
                } opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-slate-800/95 hover:bg-[#FF2E93] text-slate-300 hover:text-white border border-white/20 shadow-md cursor-pointer z-20 hidden sm:flex items-center justify-center`}
                title="Reagir com emoji capixaba (ou pressione e segure)"
              >
                <Smile size={12} />
              </button>
            </div>
          );
        })}

        {/* Blocked contact system notice */}
        {isBlocked && (
          <div className="flex justify-center my-3 animate-fade-in">
            <button
              type="button"
              onClick={() => setShowUnblockConfirm(true)}
              className="px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 shadow-md hover:bg-rose-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Ban size={14} className="text-rose-400 shrink-0" />
              <span>Você bloqueou este contato. Toque para desbloquear.</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments popup tray */}
      {showAttachments && (
        <div className="relative z-20 px-4 pb-2">
          <div className="glass-card rounded-2xl p-3 flex items-center justify-around shadow-2xl animate-fade-in border border-white/10">
            <button
              type="button"
              onClick={() => {
                setShowAttachments(false);
                onSendMessage('Foto de Camburi enviada 📸', 'image');
              }}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <ImageIcon size={22} />
              </div>
              <span className="text-[11px]">Galeria</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAttachments(false);
                setShowLiveLocationModal(true);
              }}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Navigation size={22} className="animate-pulse" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-300">Tempo Real</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAttachments(false);
                onSendMessage('Praia da Costa, Vila Velha 📍', 'text');
              }}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <MapPin size={22} />
              </div>
              <span className="text-[11px]">Local Fixo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAttachments(false);
                onSendMessage('Roteiro_Final_ES.pdf 📄', 'text');
              }}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <FileText size={22} />
              </div>
              <span className="text-[11px]">Documento</span>
            </button>
          </div>
        </div>
      )}

      {/* Capixaba Regional Stickers & Minhas Figurinhas Keyboard Drawer */}
      <StickerKeyboardDrawer
        isOpen={showStickers}
        onClose={() => setShowStickers(false)}
        onSelectSticker={handleSendSticker}
        favoriteStickerIds={favoriteStickerIds}
        onToggleFavorite={handleToggleFavoriteSticker}
        onShowToast={showToast}
      />

      {/* Bottom Message Input Bar OR Blocked Banner */}
      {isBlocked ? (
        <footer className="relative z-30 px-4 py-3 bg-[#091122]/98 backdrop-blur-xl border-t border-rose-500/20">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-rose-500/30 text-rose-300 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Ban size={18} className="text-rose-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">
                Você bloqueou este contato.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setShowUnblockConfirm(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              Desbloquear
            </button>
          </div>
        </footer>
      ) : (
        <footer className="relative z-30 px-3 py-2 bg-[#091122]/95 backdrop-blur-xl border-t border-white/10">
          {/* AI Translation result preview chip */}
          {translationBanner && (
            <div className="mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900/95 to-pink-950/60 border border-[#00C2FF]/40 text-xs text-slate-200 shadow-xl backdrop-blur-md animate-fade-in flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#00C2FF]">
                  <Sparkles size={12} className="text-[#00C2FF]" />
                  <span>Traduzido para Dialeto Capixaba Autêntico</span>
                  {translationBanner.source === 'gemini' && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#00C2FF]/20 text-cyan-200">
                      Gemini IA
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (lastOriginalText) {
                        setInputText(lastOriginalText);
                        setTranslationBanner(null);
                        showToast('Texto original restaurado');
                      }
                    }}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Desfazer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranslationBanner(null)}
                    className="text-[11px] text-slate-400 hover:text-white cursor-pointer px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 leading-snug">
                <span className="text-slate-400 line-through mr-1.5 text-[10px]">
                  "{translationBanner.original}"
                </span>
                <span className="text-cyan-200 font-medium">
                  → "{translationBanner.translated}"
                </span>
              </div>
            </div>
          )}

          {/* Capixaba Quick Replies Component */}
          <QuickReplies onSelectReply={handleSendQuickReply} disabled={isRecording} />

          {/* Walkie-Talkie Active Bar OR Voice Recorder Bar OR Text Input Controls */}
          {isWalkieTalkieMode ? (
            <div className="py-0.5">
              <WalkieTalkieBar
                onSendMessage={(text, type, sticker, dur, url, channel) => {
                  playMessageSentSound();
                  onSendMessage(text, type, sticker, dur, url, channel);
                }}
                onClose={() => setIsWalkieTalkieMode(false)}
                onShowToast={showToast}
              />
            </div>
          ) : isRecording ? (
            <div className="py-0.5">
              <VoiceRecorderBar
                onSendVoice={handleSendVoiceMessage}
                onCancel={() => {
                  setIsRecording(false);
                  showToast('Gravação de áudio cancelada');
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Main Input Pill Box */}
              <div className="flex-1 flex items-center bg-slate-900/80 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-[#FF2E93]/60 focus-within:ring-1 focus-within:ring-[#FF2E93]/40 transition-all">
                {/* Sticker / Emoji trigger */}
                <button
                  type="button"
                  title="Figurinhas e Emojis"
                  onClick={() => {
                    setShowAttachments(false);
                    setShowStickers(!showStickers);
                  }}
                  className="text-slate-400 hover:text-white mr-2 cursor-pointer transition-colors"
                >
                  <Smile size={20} />
                </button>

                {/* Input field */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Mensagem..."
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
                />

                {/* AI Capixaba Translator Trigger Button */}
                <button
                  type="button"
                  disabled={isAiTranslating}
                  title={
                    inputText.trim()
                      ? 'Traduzir mensagem para o dialeto capixaba autêntico com IA'
                      : 'Tradutor Capixaba com IA (testar frases e gírias)'
                  }
                  onClick={() => handleTranslateCurrentText()}
                  className={`relative p-1.5 rounded-full transition-all cursor-pointer shrink-0 mx-0.5 ${
                    isAiTranslating
                      ? 'bg-[#00C2FF]/20 text-[#00C2FF] animate-pulse'
                      : inputText.trim().length > 0
                      ? 'text-[#00C2FF] hover:bg-[#00C2FF]/15 active:scale-90 hover:scale-110'
                      : 'text-slate-400 hover:text-[#00C2FF] hover:bg-white/5'
                  }`}
                >
                  {isAiTranslating ? (
                    <Sparkles size={18} className="animate-spin text-[#00C2FF]" />
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <Wand2 size={18} className={inputText.trim() ? "text-[#00C2FF]" : "text-slate-400"} />
                      <span className="absolute -top-1.5 -right-2 text-[8px] font-black px-1 py-0.2 rounded-full bg-gradient-to-r from-pink-500 to-[#00C2FF] text-white shadow-xs leading-none">
                        IA
                      </span>
                    </div>
                  )}
                </button>

                {/* Paperclip attachment */}
                <button
                  type="button"
                  title="Anexar arquivo"
                  onClick={() => {
                    setShowStickers(false);
                    setShowAttachments(!showAttachments);
                  }}
                  className="text-slate-400 hover:text-white mx-1 cursor-pointer transition-colors"
                >
                  <Paperclip size={19} className="rotate-45" />
                </button>

                {/* Camera action */}
                <button
                  type="button"
                  title="Tirar foto"
                  onClick={() => onSendMessage('Foto rápida da orla 📸', 'image')}
                  className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <Camera size={19} />
                </button>
              </div>

              {/* Walkie-Talkie Radio Toggle Button */}
              <button
                type="button"
                title="Modo Walkie-Talkie VHF (Push-to-Talk com rádio do ES)"
                onClick={() => {
                  playTapSound();
                  setIsWalkieTalkieMode(true);
                  setShowAttachments(false);
                  setShowStickers(false);
                }}
                className="w-10 h-10 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Radio size={18} />
              </button>

              {/* Dynamic Action: Send or Voice Recorder */}
              {inputText.trim().length > 0 ? (
                <button
                  type="button"
                  title="Enviar mensagem"
                  onClick={handleSend}
                  className="w-11 h-11 rounded-full bg-[#FF2E93] hover:bg-[#ff1685] text-white flex items-center justify-center shadow-lg shadow-[#FF2E93]/40 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  title="Gravar áudio"
                  onClick={() => {
                    setIsRecording(true);
                  }}
                  className="w-11 h-11 rounded-full bg-[#FF2E93] hover:bg-[#ff1685] shadow-lg shadow-[#FF2E93]/40 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 group hover:ring-2 hover:ring-[#FF2E93]/50"
                >
                  <Mic size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          )}
        </footer>
      )}

      {/* Modal de Bloqueio de Contato com Seleção de Motivo */}
      <BlockContactModal
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        contactName={chat.name}
        contactAvatar={chat.avatarUrl}
        onConfirmBlock={(reasonCategory, reasonLabel, customNotes, reportToModeration) => {
          setShowBlockConfirm(false);
          if (onBlockContact) {
            onBlockContact(reasonCategory, reasonLabel, customNotes, reportToModeration);
          }
          showToast(`Bloqueado: ${reasonLabel.split('/')[0].trim()}`);
        }}
      />

      {/* Modal de Confirmação de Desbloqueio */}
      {showUnblockConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 select-none animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl p-5 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/10">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-base font-bold text-white">Desbloquear {chat.name}?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Você voltará a poder enviar e receber mensagens, figurinhas e chamadas com este contato.
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
                  if (onUnblockContact) onUnblockContact();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estatísticas / Intensidade da Conversa com Recharts */}
      <ChatStatsModal
        chat={chat}
        contactName={chat.name}
        messages={messages}
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />

      {/* Modal de Configuração de Mensagens Temporárias */}
      <DisappearingMessagesModal
        isOpen={showDisappearingModal}
        onClose={() => setShowDisappearingModal(false)}
        currentTimer={disappearingTimer}
        contactName={chat.name}
        onSaveTimer={(timer) => {
          if (onUpdateDisappearingTimer) {
            onUpdateDisappearingTimer(timer);
          }
        }}
        onSimulateExpire={onSimulateExpire}
        temporaryMessagesCount={
          messages.filter((m) => m.isDisappearing || (disappearingTimer !== 'off' && m.type !== 'system')).length
        }
      />

      {/* Modal do Tradutor Capixaba IA */}
      <AiTranslatorModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        currentInput={inputText}
        onApplyTranslation={(translated, shouldSendImmediately) => {
          setLastOriginalText(inputText.trim() || null);
          setInputText(translated);
          setTranslationBanner({
            original: inputText.trim() || 'Mensagem formal',
            translated,
            source: 'gemini',
          });
          if (shouldSendImmediately) {
            playMessageSentSound();
            onSendMessage(translated, 'text');
            setInputText('');
            setLastOriginalText(null);
            setTranslationBanner(null);
            if (chat.id === 'chat-ana-clara') {
              setTimeout(() => {
                playMessageReceivedSound();
              }, 2000);
            }
          }
        }}
      />

      {/* Modal / Popover de Reações Capixabas em Mensagens (Long-press) */}
      {reactionTargetMessage && (
        <MessageReactionPicker
          messageText={
            reactionTargetMessage.text ||
            reactionTargetMessage.quoteText ||
            reactionTargetMessage.imageCaption ||
            reactionTargetMessage.stickerData?.phrase ||
            (reactionTargetMessage.type === 'audio' ? 'Mensagem de áudio' : '')
          }
          currentReactions={
            localReactions[reactionTargetMessage.id] !== undefined
              ? localReactions[reactionTargetMessage.id]
              : reactionTargetMessage.reactions || []
          }
          onSelectReaction={(emoji) => {
            handleToggleReaction(reactionTargetMessage.id, emoji);
            setReactionTargetMessage(null);
          }}
          onClose={() => setReactionTargetMessage(null)}
          isUserMessage={reactionTargetMessage.senderId === 'user'}
        />
      )}

      {/* Modal de Mídia, Links e Docs Compartilhados */}
      <MediaLinksDocsModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        chat={chat}
        messages={messages}
        initialTab={mediaModalTab}
        onJumpToMessage={handleJumpToMessage}
      />

      {/* Modal de Criptografia de Ponta a Ponta */}
      <EncryptionSecurityModal
        isOpen={showEncryptionModal}
        onClose={() => setShowEncryptionModal(false)}
        chat={chat}
      />

      {/* Modal de Localização em Tempo Real no ES */}
      <LiveLocationModal
        isOpen={showLiveLocationModal}
        onClose={() => setShowLiveLocationModal(false)}
        onShareLocation={(loc) => {
          playMessageSentSound();
          onSendMessage(
            `Localização ao vivo: ${loc.placeName}`,
            'location',
            undefined,
            undefined,
            undefined,
            undefined,
            loc
          );
        }}
        onShowToast={showToast}
      />

      {/* Bottom Android Gesture Bar */}
      <AndroidNavBar onHome={onBack} />
    </div>
  );
};
