export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  statusText: string;
  about: string;
  link: string;
  avatarUrl: string;
}

export interface StickerItem {
  id: string;
  phrase: string;
  category: 'girias' | 'praias' | 'culinaria' | 'expressoes';
  emoji: string;
  badgeText: string;
  bgGradient: string;
  borderColor: string;
}

export interface LiveLocationData {
  placeName: string;
  landmark?: string;
  city?: string;
  durationMinutes: number;
  sharedAt: string;
  expiresAt: number;
  distanceMeters?: number;
  accuracyMeters?: number;
  isLive: boolean;
  latitude: number;
  longitude: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string; // 'user' or contact id
  senderName?: string;
  text?: string;
  type: 'text' | 'audio' | 'image' | 'quote' | 'sticker' | 'system' | 'walkie_talkie' | 'location';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  audioDuration?: string;
  audioUrl?: string;
  walkieTalkieChannel?: string;
  liveLocationData?: LiveLocationData;
  imageUrl?: string;
  imageCaption?: string;
  quoteText?: string;
  stickerData?: StickerItem;
  reactions?: string[];
  isDisappearing?: boolean;
  disappearingDuration?: '24h' | '7d' | '90d';
}

export interface ChatThread {
  id: string;
  name: string;
  avatarUrl: string;
  isGroup: boolean;
  isSupergroup?: boolean;
  memberCount?: number;
  subtopics?: string[];
  currentSubtopic?: string;
  description?: string;
  region?: string;
  isOnline?: boolean;
  lastSeen?: string;
  unreadCount: number;
  isFavorite?: boolean;
  disappearingTimer?: 'off' | '24h' | '7d' | '90d';
  lastMessage: {
    text: string;
    sender?: string;
    timestamp: string;
    isReadByThem?: boolean;
    type?: 'text' | 'image' | 'audio' | 'quote' | 'sticker' | 'system' | 'walkie_talkie' | 'location';
  };
}

export interface CallLog {
  id: string;
  contactId: string;
  name: string;
  avatarUrl: string;
  timestamp: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
  duration?: string;
}

export interface StatusStory {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  stories: {
    id: string;
    type: 'image' | 'text';
    content: string; // image url or background text
    caption?: string;
    location?: string;
    timestamp: string;
  }[];
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  followers: string;
  avatarUrl: string;
  isVerified: boolean;
  isFollowed: boolean;
}

export interface Community {
  id: string;
  name: string;
  emoji: string;
  membersCount: number;
  description: string;
  imageUrl: string;
  subgroups: string[];
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  status: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export type ActiveTab = 'conversas' | 'ligacoes' | 'comunidades' | 'status' | 'mais';
export type ScreenView = 
  | 'login' 
  | 'main' 
  | 'chat_detail' 
  | 'contacts' 
  | 'settings' 
  | 'profile' 
  | 'calling';

export type BlockReasonCategory = 'spam' | 'harassment' | 'unwanted' | 'scam' | 'other';

export interface BlockedContactRecord {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  contactPhone?: string;
  reasonCategory: BlockReasonCategory;
  reasonLabel: string;
  customNotes?: string;
  blockedAt: string;
  timestamp: number;
}

export type RegiaoES = 'Grande Vitória' | 'Região Serrana' | 'Litoral Sul' | 'Norte & Noroeste';

export interface PrefeituraContact {
  id: string;
  cidade: string;
  regiao: RegiaoES;
  prefeito?: string;
  populacao?: string;
  telefoneGeral: string;
  whatsappCidadao: string;
  ouvidoria: string;
  defesaCivil: string;
  guardaMunicipal?: string;
  disqueSilencio?: string;
  saudeEmergencia?: string;
  endereco: string;
  siteOficial: string;
  avatarUrl: string;
}

export interface SupergroupFormData {
  name: string;
  description: string;
  region: string;
  memberLimit: number;
  subtopics: string[];
  avatarUrl: string;
}
