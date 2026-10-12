/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  UserProfile,
  ChatThread,
  Message,
  CallLog,
  StatusStory,
  Channel,
  Community,
  Contact,
  ActiveTab,
  ScreenView,
  StickerItem,
  BlockedContactRecord,
  BlockReasonCategory,
  PrefeituraContact,
  SupergroupFormData,
  LiveLocationData,
} from './types';
import {
  initialUserProfile,
  initialChats,
  initialAnaClaraMessages,
  initialCalls,
  initialStories,
  initialChannels,
  initialCommunities,
  initialContacts,
  initialBlockedContacts,
} from './data/mockData';
import { LoginScreen } from './components/screens/LoginScreen';
import { ChatsScreen } from './components/screens/ChatsScreen';
import { ChatDetailScreen } from './components/screens/ChatDetailScreen';
import { CallsScreen } from './components/screens/CallsScreen';
import { StatusScreen } from './components/screens/StatusScreen';
import { StatusViewerModal } from './components/screens/StatusViewerModal';
import { CommunitiesScreen } from './components/screens/CommunitiesScreen';
import { ContactsScreen } from './components/screens/ContactsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { HubScreen } from './components/screens/HubScreen';
import { ActiveCallModal } from './components/screens/ActiveCallModal';
import { PrefeiturasModal } from './components/screens/PrefeiturasModal';
import { CreateSupergroupModal } from './components/chat/CreateSupergroupModal';
import { playMessageReceivedSound, playMessageSentSound, playTapSound } from './utils/soundEffects';

export default function App() {
  // App state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('main');
  const [activeTab, setActiveTab] = useState<ActiveTab>('conversas');
  const [showPrefeiturasModal, setShowPrefeiturasModal] = useState(false);
  const [showCreateSupergroupModal, setShowCreateSupergroupModal] = useState(false);
  const [toastAppMessage, setToastAppMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastAppMessage(text);
    setTimeout(() => {
      setToastAppMessage(null);
    }, 3000);
  };
  
  // Data state
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [chats, setChats] = useState<ChatThread[]>(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<string>('chat-ana-clara');
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({
    'chat-ana-clara': initialAnaClaraMessages,
  });
  const [calls, setCalls] = useState<CallLog[]>(initialCalls);
  const [stories, setStories] = useState<StatusStory[]>(initialStories);
  const [channels] = useState<Channel[]>(initialChannels);
  const [communities] = useState<Community[]>(initialCommunities);
  const [contacts] = useState<Contact[]>(initialContacts);

  // Active Story & Calling Modals
  const [activeStory, setActiveStory] = useState<StatusStory | null>(null);
  const [activeCallContact, setActiveCallContact] = useState<{
    name: string;
    isVideo: boolean;
  } | null>(null);

  // Blocked contacts records & IDs state
  const [blockedHistory, setBlockedHistory] = useState<BlockedContactRecord[]>(() => {
    try {
      const saved = localStorage.getItem('poquei_blocked_history_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load blocked contacts history', e);
    }
    return initialBlockedContacts;
  });

  const [blockedContactIds, setBlockedContactIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('poquei_blocked_history_v1');
      if (saved) {
        const parsed: BlockedContactRecord[] = JSON.parse(saved);
        return parsed.map((p) => p.contactId);
      }
    } catch (e) {
      console.warn(e);
    }
    return initialBlockedContacts.map((b) => b.contactId);
  });

  // Disappearing messages timers per chat thread
  const [disappearingTimersByChat, setDisappearingTimersByChat] = useState<
    Record<string, 'off' | '24h' | '7d' | '90d'>
  >({
    'chat-ana-clara': '24h',
  });

  // Viewport display mode: 'mobile-frame' or 'full-screen'
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  const handleBlockContact = (
    chatId: string,
    reasonCategory: BlockReasonCategory = 'unwanted',
    reasonLabel: string = 'Indesejado / Sem interesse',
    customNotes?: string
  ) => {
    setBlockedContactIds((prev) => (prev.includes(chatId) ? prev : [...prev, chatId]));

    const targetChat = chats.find((c) => c.id === chatId);
    const targetContact = contacts.find((c) => `chat-${c.id}` === chatId || c.id === chatId);

    const contactName = targetChat?.name || targetContact?.name || 'Contato';
    const contactAvatar =
      targetChat?.avatarUrl ||
      targetContact?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
    const contactPhone = targetContact?.phone || '+55 27 99999-0000';

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: BlockedContactRecord = {
      id: `block-${Date.now()}`,
      contactId: chatId,
      contactName,
      contactAvatar,
      contactPhone,
      reasonCategory,
      reasonLabel,
      customNotes,
      blockedAt: formattedDate,
      timestamp: Date.now(),
    };

    setBlockedHistory((prev) => {
      const filtered = prev.filter((item) => item.contactId !== chatId);
      const updated = [newRecord, ...filtered];
      try {
        localStorage.setItem('poquei_blocked_history_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const sysMsg: Message = {
      id: `msg-sys-block-${Date.now()}`,
      chatId,
      senderId: 'system',
      type: 'system',
      text: `Você bloqueou este contato. Motivo: ${reasonLabel.split('/')[0].trim()}. Gerencie em Configurações > Contatos Bloqueados.`,
      timestamp: timeStr,
      status: 'read',
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));
  };

  const handleUnblockContact = (chatId: string) => {
    setBlockedContactIds((prev) => prev.filter((id) => id !== chatId));
    setBlockedHistory((prev) => {
      const updated = prev.filter((item) => item.contactId !== chatId);
      try {
        localStorage.setItem('poquei_blocked_history_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const sysMsg: Message = {
      id: `msg-sys-unblock-${Date.now()}`,
      chatId,
      senderId: 'system',
      type: 'system',
      text: 'Você desbloqueou este contato. As mensagens e chamadas foram reativadas.',
      timestamp: timeStr,
      status: 'read',
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));
  };

  const handleUpdateDisappearingTimer = (
    chatId: string,
    newTimer: 'off' | '24h' | '7d' | '90d'
  ) => {
    setDisappearingTimersByChat((prev) => ({
      ...prev,
      [chatId]: newTimer,
    }));

    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, disappearingTimer: newTimer } : c))
    );

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const systemText =
      newTimer === 'off'
        ? 'Você desativou as mensagens temporárias nesta conversa.'
        : `Você ativou as mensagens temporárias. As novas mensagens desaparecerão após ${
            newTimer === '24h' ? '24 horas' : newTimer === '7d' ? '7 dias' : '90 dias'
          }.`;

    const sysMsg: Message = {
      id: `msg-sys-${Date.now()}`,
      chatId,
      senderId: 'system',
      type: 'system',
      text: systemText,
      timestamp: timeStr,
      status: 'read',
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));
  };

  const handleSimulateExpireMessages = (chatId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    setMessagesByChat((prev) => {
      const list = prev[chatId] || [];
      const remaining = list.filter((m) => !m.isDisappearing);
      const noticeMsg: Message = {
        id: `msg-sys-expired-${Date.now()}`,
        chatId,
        senderId: 'system',
        type: 'system',
        text: 'Mensagens temporárias expiradas foram removidas automaticamente para preservar seu histórico e privacidade.',
        timestamp: timeStr,
        status: 'read',
      };
      return {
        ...prev,
        [chatId]: [...remaining, noticeMsg],
      };
    });
  };

  // Handle send message
  const handleSendMessage = (
    text: string,
    type:
      | 'text'
      | 'image'
      | 'audio'
      | 'quote'
      | 'sticker'
      | 'system'
      | 'walkie_talkie'
      | 'location' = 'text',
    stickerData?: StickerItem,
    audioDuration?: string,
    audioUrl?: string,
    walkieTalkieChannel?: string,
    liveLocationData?: LiveLocationData
  ) => {
    // If contact is blocked, prevent sending
    if (blockedContactIds.includes(selectedChatId)) {
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const activeTimer = disappearingTimersByChat[selectedChatId] || 'off';
    const isTemp = activeTimer !== 'off';

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      chatId: selectedChatId,
      senderId: 'user',
      text,
      type,
      stickerData,
      audioDuration,
      audioUrl,
      walkieTalkieChannel,
      liveLocationData,
      timestamp: timeStr,
      status: 'sent',
      isDisappearing: isTemp,
      disappearingDuration: isTemp ? activeTimer : undefined,
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMsg],
    }));

    // Update last message in chat thread
    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChatId
          ? {
              ...c,
              lastMessage: {
                text:
                  type === 'sticker'
                    ? `[Figurinha: ${stickerData?.phrase || text}]`
                    : type === 'image'
                    ? '[Foto]'
                    : type === 'audio'
                    ? `[Mensagem de voz ${audioDuration || ''}]`
                    : type === 'walkie_talkie'
                    ? `[Rádio PTT: ${walkieTalkieChannel || 'Câmbio'}]`
                    : type === 'location'
                    ? `[Localização ao vivo: ${liveLocationData?.placeName || 'ES'}]`
                    : text,
                timestamp: timeStr,
                type,
                isReadByThem: false,
              },
            }
          : c
      )
    );

    // Auto simulated reply from Ana Clara with Capixaba slangs awareness
    if (selectedChatId === 'chat-ana-clara') {
      setTimeout(() => {
        let replyText = 'Amo o Espírito Santo demais, melhor vibe do mundo! 💙';

        const lowerText = (text || '').toLowerCase();
        if (type === 'walkie_talkie') {
          replyText =
            'Câmbio na escuta! Mensagem de rádio recebida em alto e bom som no canal 27! Câmbio e desligo! 📻🤙';
        } else if (type === 'location') {
          replyText = `Recebi sua localização ao vivo em ${
            liveLocationData?.placeName || 'Vitória'
          }! Já tô a caminho, chego em alguns minutos! 📍🌊`;
        } else if (type === 'audio') {
          const audioReplies = [
            'Ouvindo seu áudio aqui agora! Que energia boa, bora fechar esse rolê em Camburi! 🎧🌊',
            'Adorei o áudio! Poquemo no 12 hoje, partiu orla! 🎙️🔥',
            'Voz de quem tá pronto pra comer aquela moqueca capixaba! Chego em 10 minutos! 🥘✨',
          ];
          replyText = audioReplies[Math.floor(Math.random() * audioReplies.length)];
        } else if (lowerText.includes('camburi')) {
          replyText = 'Partiu Camburi agora mesmo! Bora encontrar no quiosque 5 tomar água de coco! 🥥🏖️';
        } else if (lowerText.includes('massa')) {
          replyText = 'Massa demais da conta! Espírito Santo é top demais! 🤩🤙';
        } else if (lowerText.includes('coitado')) {
          replyText = 'Hahaha ô coitado mesmo! Não sabe o que tá perdendo aqui na Ilha! 😂';
        } else if (lowerText.includes('moqueca') || lowerText.includes('peixada')) {
          replyText = 'Falou e disse! Moqueca é capixaba, o resto é peixada! 🥘🤤';
        } else if (lowerText.includes('poquei')) {
          replyText = 'Poquemo no 12! Mandou benzão! 🚀🔥';
        } else if (lowerText.includes('convento')) {
          replyText = 'A vista lá do alto do Convento é uma das 7 maravilhas do mundo! 🙏✨';
        } else if (lowerText.includes('costa')) {
          replyText = 'Praia da Costa é perfeita! Água calma e o dia tá lindo! 🌊☀️';
        } else {
          const replyTextOptions = [
            'Partiu! Já tô me arrumando pra ir pra Camburi! 🌊',
            'Poquei no look de praia hoje! ☀️🏖️',
            'Amo o Espírito Santo demais, melhor vibe do mundo! 💙',
            'Depois bora comer aquela moqueca na Ilha das Caieiras? 🥘',
          ];
          replyText =
            replyTextOptions[Math.floor(Math.random() * replyTextOptions.length)];
        }

        const anaTimer = disappearingTimersByChat['chat-ana-clara'] || 'off';
        const isAnaTemp = anaTimer !== 'off';

        const replyMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          chatId: 'chat-ana-clara',
          senderId: 'contact-ana-clara',
          text: replyText,
          type: 'text',
          timestamp: timeStr,
          status: 'read',
          isDisappearing: isAnaTemp,
          disappearingDuration: isAnaTemp ? anaTimer : undefined,
        };

        setMessagesByChat((prev) => ({
          ...prev,
          'chat-ana-clara': [...(prev['chat-ana-clara'] || []), replyMsg],
        }));

        playMessageReceivedSound();
      }, 1800);
    }
  };

  // Create Supergroup handler
  const handleCreateSupergroup = (data: SupergroupFormData) => {
    const newGroupId = `supergroup-${Date.now()}`;
    const newGroup: ChatThread = {
      id: newGroupId,
      name: data.name,
      avatarUrl: data.avatarUrl,
      isGroup: true,
      isSupergroup: true,
      memberCount: data.memberLimit,
      region: data.region,
      description: data.description,
      subtopics: data.subtopics,
      currentSubtopic: data.subtopics[0] || '#geral',
      unreadCount: 0,
      isFavorite: true,
      lastMessage: {
        text: `Supergrupo criado com ${data.subtopics.length} tópicos ativos! 🚀`,
        timestamp: 'Agora',
        type: 'text',
      },
    };

    setChats((prev) => [newGroup, ...prev]);
    setMessagesByChat((prev) => ({
      ...prev,
      [newGroupId]: [
        {
          id: `msg-sg-welcome-${Date.now()}`,
          chatId: newGroupId,
          senderId: 'system',
          text: `Bem-vindo ao supergrupo ${data.name}! Capacidade para até ${data.memberLimit.toLocaleString('pt-BR')} membros com canais: ${data.subtopics.join(', ')}.`,
          type: 'system',
          timestamp: 'Agora',
          status: 'read',
        },
      ],
    }));

    setSelectedChatId(newGroupId);
    setCurrentScreen('chat_detail');
  };

  // Start chat with Prefeitura handler
  const handleStartChatWithPrefeitura = (pref: PrefeituraContact) => {
    const chatId = `pref-${pref.id}`;
    const existing = chats.find((c) => c.id === chatId);
    if (existing) {
      handleOpenChat(chatId);
    } else {
      const newPrefChat: ChatThread = {
        id: chatId,
        name: `Prefeitura de ${pref.cidade} 🏛️`,
        avatarUrl: pref.avatarUrl,
        isGroup: false,
        isOnline: true,
        lastSeen: 'Canal Oficial do Cidadão',
        unreadCount: 1,
        lastMessage: {
          text: `Canal oficial de ${pref.cidade}. Ouvidoria: ${pref.ouvidoria || '156'}`,
          timestamp: 'Agora',
          type: 'text',
        },
      };

      setChats((prev) => [newPrefChat, ...prev]);
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [
          {
            id: `msg-pref-welcome-${Date.now()}`,
            chatId,
            senderId: pref.id,
            text: `Olá, cidadão! Bem-vindo ao canal oficial verificado da Prefeitura de ${pref.cidade} (${pref.regiao}) no Poquei. Como podemos ajudar hoje? Você também pode ligar diretamente no ${pref.telefoneGeral} ou WhatsApp ${pref.whatsappCidadao}.`,
            type: 'text',
            timestamp: 'Agora',
            status: 'read',
          },
        ],
      }));

      setSelectedChatId(chatId);
      setCurrentScreen('chat_detail');
    }
  };

  // Open Chat
  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId);
    // Mark as read
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
    setCurrentScreen('chat_detail');
  };

  // Start chat with contact from contacts list
  const handleStartChatWithContact = (contact: Contact) => {
    const existing = chats.find(
      (c) => c.name.toLowerCase() === contact.name.toLowerCase()
    );
    if (existing) {
      handleOpenChat(existing.id);
    } else {
      const newChat: ChatThread = {
        id: `chat-${contact.id}`,
        name: contact.name,
        avatarUrl: contact.avatarUrl,
        isGroup: false,
        isOnline: contact.isOnline,
        lastSeen: contact.status,
        unreadCount: 0,
        lastMessage: {
          text: 'Conversa iniciada',
          timestamp: 'Agora',
          type: 'text',
        },
      };
      setChats((prev) => [newChat, ...prev]);
      setSelectedChatId(newChat.id);
      setCurrentScreen('chat_detail');
    }
  };

  // React to message with Capixaba emoji/icon
  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessagesByChat((prev) => {
      const list = prev[selectedChatId] || initialAnaClaraMessages;
      return {
        ...prev,
        [selectedChatId]: list.map((msg) => {
          if (msg.id !== messageId) return msg;
          const currentReactions = msg.reactions || [];
          const exists = currentReactions.includes(emoji);
          const nextReactions = exists
            ? currentReactions.filter((r) => r !== emoji)
            : [...currentReactions, emoji];
          return {
            ...msg,
            reactions: nextReactions,
          };
        }),
      };
    });
  };

  // Start call
  const handleStartCall = (contactName: string, isVideo: boolean) => {
    setActiveCallContact({ name: contactName, isVideo });
    // Add to call log
    const newLog: CallLog = {
      id: `call-${Date.now()}`,
      contactId: 'contact-active',
      name: contactName,
      avatarUrl:
        chats.find((c) => c.name === contactName)?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      timestamp: 'Agora',
      callType: 'outgoing',
      isVideo,
      duration: '00:01',
    };
    setCalls((prev) => [newLog, ...prev]);
  };

  // Active chat thread
  const currentChat =
    chats.find((c) => c.id === selectedChatId) || chats[0];
  const currentMessages =
    messagesByChat[selectedChatId] || initialAnaClaraMessages;

  // Render current screen content
  const renderScreenContent = () => {
    if (!isLoggedIn) {
      return (
        <LoginScreen
          onLogin={() => setIsLoggedIn(true)}
          onContinueGoogle={() => setIsLoggedIn(true)}
        />
      );
    }

    if (currentScreen === 'chat_detail') {
      return (
        <ChatDetailScreen
          chat={currentChat}
          messages={currentMessages}
          onBack={() => setCurrentScreen('main')}
          onSendMessage={handleSendMessage}
          onReactToMessage={handleReactToMessage}
          onStartCall={(isVideo) => handleStartCall(currentChat.name, isVideo)}
          onOpenProfile={() => setCurrentScreen('profile')}
          isBlocked={blockedContactIds.includes(selectedChatId)}
          onBlockContact={(reasonCategory, reasonLabel, customNotes) =>
            handleBlockContact(selectedChatId, reasonCategory, reasonLabel, customNotes)
          }
          onUnblockContact={() => handleUnblockContact(selectedChatId)}
          disappearingTimer={disappearingTimersByChat[selectedChatId] || 'off'}
          onUpdateDisappearingTimer={(timer) =>
            handleUpdateDisappearingTimer(selectedChatId, timer)
          }
          onSimulateExpire={() => handleSimulateExpireMessages(selectedChatId)}
        />
      );
    }

    if (currentScreen === 'contacts') {
      return (
        <ContactsScreen
          contacts={contacts}
          onStartChatWithContact={handleStartChatWithContact}
          onCallContact={(contact, isVideo) => handleStartCall(contact.name, isVideo)}
          onBack={() => setCurrentScreen('main')}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentScreen('main');
          }}
        />
      );
    }

    if (currentScreen === 'settings') {
      return (
        <SettingsScreen
          userProfile={userProfile}
          onOpenProfile={() => setCurrentScreen('profile')}
          onBack={() => setCurrentScreen('main')}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentScreen('main');
          }}
          onLogout={() => setIsLoggedIn(false)}
          blockedHistory={blockedHistory}
          onUnblockContact={handleUnblockContact}
        />
      );
    }

    if (currentScreen === 'profile') {
      return (
        <ProfileScreen
          userProfile={userProfile}
          onUpdateProfile={(updated) =>
            setUserProfile((prev) => ({ ...prev, ...updated }))
          }
          onBack={() => setCurrentScreen('settings')}
          isBlocked={blockedContactIds.includes(selectedChatId)}
          onBlockContact={(reasonCategory, reasonLabel, customNotes) =>
            handleBlockContact(selectedChatId, reasonCategory, reasonLabel, customNotes)
          }
          onUnblockContact={handleUnblockContact}
          disappearingTimer={disappearingTimersByChat[selectedChatId] || 'off'}
          onUpdateDisappearingTimer={(timer) =>
            handleUpdateDisappearingTimer(selectedChatId, timer)
          }
          blockedHistory={blockedHistory}
        />
      );
    }

    // Main screen: Tab driven (Conversas, Ligações, Comunidades, Status, Mais)
    switch (activeTab) {
      case 'conversas':
        return (
          <ChatsScreen
            chats={chats}
            messagesByChat={messagesByChat}
            onSelectChat={handleOpenChat}
            onOpenNewChat={() => setCurrentScreen('contacts')}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenSettings={() => setCurrentScreen('settings')}
          />
        );

      case 'ligacoes':
        return (
          <CallsScreen
            calls={calls}
            onStartCall={(name, isVideo) => handleStartCall(name, isVideo)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenContactsTab={() => setCurrentScreen('contacts')}
          />
        );

      case 'comunidades':
        return (
          <CommunitiesScreen
            communities={communities}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );

      case 'status':
        return (
          <StatusScreen
            stories={stories}
            channels={channels}
            onOpenStory={(story) => setActiveStory(story)}
            onAddStatus={() => {
              alert('Adicionar nova foto ou pensamento ao seu status Capixaba');
            }}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );

      case 'mais':
        return (
          <HubScreen
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenSettings={() => setCurrentScreen('settings')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#040814] text-slate-100 flex flex-col items-center justify-center font-sans antialiased">
      {/* Top Demo Bar: Screen Navigator & Viewport Toggle */}
      <header className="w-full bg-[#081024]/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-xs z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-pink-400">
            <Sparkles size={16} />
            <span className="hidden sm:inline">Poquei Capixaba</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono">
              v1.0.0
            </span>
          </div>

          {/* Quick Jump Screen Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-slate-400 hidden md:inline">Telas:</span>
            <button
              type="button"
              onClick={() => setIsLoggedIn(false)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                !isLoggedIn ? 'bg-[#FF2E93] text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              1. Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentScreen('main');
                setActiveTab('conversas');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'main' && activeTab === 'conversas'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              2. Conversas
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setSelectedChatId('chat-ana-clara');
                setCurrentScreen('chat_detail');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'chat_detail'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              3. Chat Ana Clara
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentScreen('main');
                setActiveTab('ligacoes');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'main' && activeTab === 'ligacoes'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              4. Ligações
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentScreen('main');
                setActiveTab('status');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'main' && activeTab === 'status'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              5. Status
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentScreen('main');
                setActiveTab('comunidades');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'main' && activeTab === 'comunidades'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              6. Comunidades
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentScreen('contacts');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'contacts'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              7. Contatos
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentScreen('settings');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'settings'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              8. Configurações
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentScreen('profile');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'profile'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              9. Meu Perfil
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setCurrentScreen('main');
                setActiveTab('mais');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                isLoggedIn && currentScreen === 'main' && activeTab === 'mais'
                  ? 'bg-[#FF2E93] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              10. Mais
            </button>
          </div>
        </div>

        {/* Viewport format switcher (Android phone device mockup vs Expanded) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer font-medium"
          >
            {isMobileFrame ? (
              <>
                <Maximize2 size={13} />
                <span className="hidden sm:inline">Expandir Tela</span>
              </>
            ) : (
              <>
                <Smartphone size={13} />
                <span className="hidden sm:inline">Modo Celular</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container / Mobile Phone Shell */}
      <main className="flex-1 w-full flex items-center justify-center p-0 md:p-6 overflow-hidden">
        <div
          className={`relative transition-all duration-300 ${
            isMobileFrame
              ? 'w-full max-w-[412px] h-[860px] max-h-[92vh] rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(255,46,147,0.15)] border-[8px] border-slate-800/90 ring-1 ring-white/10'
              : 'w-full max-w-4xl h-[90vh] rounded-2xl border border-white/10 shadow-2xl'
          } overflow-hidden bg-[#0A1224] flex flex-col`}
        >
          {/* Android Punch Hole camera (in mobile frame mode) */}
          {isMobileFrame && (
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black ring-2 ring-slate-800/80 z-40 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C2FF]/30" />
            </div>
          )}

          {/* Render Active Screen Content */}
          <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
            {renderScreenContent()}
          </div>
        </div>
      </main>

      {/* Full-screen Status Story Viewer Modal */}
      {activeStory && (
        <StatusViewerModal
          story={activeStory}
          onClose={() => setActiveStory(null)}
          onReply={(text) => {
            handleSendMessage(`Resposta ao status: ${text}`, 'text');
            setActiveStory(null);
            setCurrentScreen('chat_detail');
          }}
        />
      )}

      {/* Full-screen Simulated Audio/Video Call Modal */}
      {activeCallContact && (
        <ActiveCallModal
          contactName={activeCallContact.name}
          isVideo={activeCallContact.isVideo}
          onEndCall={() => setActiveCallContact(null)}
        />
      )}
    </div>
  );
}
