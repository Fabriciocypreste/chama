import React, { useState, useEffect } from 'react';
import { X, Send, Heart, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { StatusStory } from '../../types';
import { Avatar } from '../common/Avatar';
import { playTapSound, playMessageSentSound } from '../../utils/soundEffects';

interface StatusViewerModalProps {
  story: StatusStory | null;
  onClose: () => void;
  onReply: (text: string) => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  story,
  onClose,
  onReply,
}) => {
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!story) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [story, onClose]);

  if (!story) return null;

  const currentStoryItem = story.stories[0];

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    playMessageSentSound();
    onReply(replyText.trim());
    setReplyText('');
    onClose();
  };

  const handleSendReaction = (emoji: string) => {
    playMessageSentSound();
    onReply(emoji);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between overflow-hidden select-none animate-fade-in">
      {/* Top Status Progress Bar */}
      <div className="px-3 pt-3 flex items-center gap-1 z-30">
        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all ease-linear duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Top Bar with Author */}
      <div className="px-4 py-2 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Avatar
            name={story.authorName}
            src={story.authorAvatar}
            size="sm"
          />
          <div>
            <h3 className="text-sm font-semibold text-white drop-shadow-sm">
              {story.authorName}
            </h3>
            <span className="text-[11px] text-white/70">{story.timeAgo}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Story Visual Card */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center z-20">
        {/* Background Visual Render */}
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[3/4] relative bg-gradient-to-b from-sky-800 via-indigo-900 to-slate-950 flex flex-col justify-end p-6">
          {/* Subtle Capixaba Illustration */}
          <div className="absolute inset-0 opacity-40">
            <svg viewBox="0 0 300 400" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="storySun" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF8A65" />
                  <stop offset="100%" stopColor="#E91E63" />
                </linearGradient>
              </defs>
              <circle cx="150" cy="180" r="90" fill="url(#storySun)" opacity="0.6" />
              <path d="M 0,260 Q 150,220 300,260 L 300,400 L 0,400 Z" fill="#0A1128" />
              <path d="M 50,300 Q 150,280 250,300" stroke="#00C2FF" strokeWidth="2" fill="none" opacity="0.8" />
            </svg>
          </div>

          {/* Location pill */}
          {currentStoryItem.location && (
            <div className="relative z-10 self-start mb-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs text-white flex items-center gap-1.5 border border-white/10">
              <MapPin size={13} className="text-[#FF2E93]" />
              <span>{currentStoryItem.location}</span>
            </div>
          )}

          {/* Caption */}
          <div className="relative z-10 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-left">
            <p className="text-base font-semibold text-white leading-snug drop-shadow-md">
              {currentStoryItem.caption}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Emoji Reactions */}
      <div className="px-6 pb-2 flex items-center justify-center gap-3 z-30">
        {['❤️', '😂', '🔥', '🏖️', '👏', '😍'].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleSendReaction(emoji)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-125 transition-transform text-xl flex items-center justify-center cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Reply input tray */}
      <div className="px-4 pb-6 pt-1 flex items-center gap-2 z-30">
        <div className="flex-1 flex items-center bg-white/20 backdrop-blur-md border border-white/25 rounded-full px-4 py-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            placeholder="Responder ao status..."
            className="w-full bg-transparent text-sm text-white placeholder-white/70 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setIsLiked(!isLiked);
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isLiked ? 'text-[#FF2E93] scale-110' : 'text-white hover:text-pink-300'
          }`}
        >
          <Heart size={24} className={isLiked ? 'fill-current' : ''} />
        </button>

        {replyText.trim() && (
          <button
            type="button"
            onClick={handleSendReply}
            className="w-11 h-11 rounded-full bg-[#FF2E93] text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};
