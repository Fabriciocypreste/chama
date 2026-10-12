import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Star,
  X,
  Heart,
  Layers,
  Compass,
  BookmarkCheck,
  Check,
  Plus,
} from 'lucide-react';
import { StickerItem } from '../../types';
import { capixabaStickers } from '../../data/mockData';
import { playTapSound } from '../../utils/soundEffects';

export interface StickerKeyboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: StickerItem) => void;
  favoriteStickerIds: string[];
  onToggleFavorite: (stickerId: string) => void;
  onShowToast?: (message: string) => void;
}

export const StickerKeyboardDrawer: React.FC<StickerKeyboardDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
  favoriteStickerIds,
  onToggleFavorite,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'gallery'>('favorites');
  const [selectedCategory, setSelectedCategory] = useState<
    'todas' | 'girias' | 'praias' | 'culinaria' | 'expressoes'
  >('todas');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter stickers for the Gallery tab
  const galleryStickers = useMemo(() => {
    return capixabaStickers.filter((stk) => {
      const matchesCategory =
        selectedCategory === 'todas' || stk.category === selectedCategory;
      const matchesSearch =
        stk.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stk.badgeText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Filter stickers for "Minhas Figurinhas" (Favorites) tab
  const favoriteStickers = useMemo(() => {
    const list = capixabaStickers.filter((stk) =>
      favoriteStickerIds.includes(stk.id)
    );
    if (!searchQuery.trim()) return list;
    return list.filter(
      (stk) =>
        stk.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stk.badgeText.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favoriteStickerIds, searchQuery]);

  const handleFavoriteClick = (e: React.MouseEvent, stk: StickerItem) => {
    e.stopPropagation();
    playTapSound();
    const isFav = favoriteStickerIds.includes(stk.id);
    onToggleFavorite(stk.id);

    if (onShowToast) {
      if (isFav) {
        onShowToast(`Figurinha removida de "Minhas Figurinhas"`);
      } else {
        onShowToast(`"${stk.phrase}" salva em "Minhas Figurinhas"! ⭐`);
      }
    }
  };

  const currentList = activeTab === 'favorites' ? favoriteStickers : galleryStickers;

  return (
    <div className="relative z-20 px-3 pb-2 max-h-80 overflow-y-auto no-scrollbar animate-fade-in select-none">
      <div className="glass-card rounded-3xl p-3.5 shadow-2xl border border-white/15 bg-slate-900/95 backdrop-blur-2xl flex flex-col gap-2.5">
        {/* Top Header: Section Switcher Tabs & Close */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-2">
          {/* Main Tabs: Minhas Figurinhas vs Galeria Capixaba */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/70 border border-white/10">
            {/* Minhas Figurinhas Tab */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setActiveTab('favorites');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star
                size={13}
                className={
                  activeTab === 'favorites'
                    ? 'fill-slate-950 text-slate-950'
                    : 'fill-amber-400/40 text-amber-400'
                }
              />
              <span>Minhas Figurinhas</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'favorites'
                    ? 'bg-slate-950 text-amber-300'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {favoriteStickerIds.length}
              </span>
            </button>

            {/* Galeria Capixaba Tab */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setActiveTab('gallery');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-md shadow-[#FF2E93]/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={13} className="text-pink-300" />
              <span>Galeria Capixaba</span>
              <span className="text-[10px] text-pink-200">💙🤍💖</span>
            </button>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-xl hover:bg-white/10 active:scale-95 cursor-pointer transition-colors shrink-0"
            title="Fechar teclado de figurinhas"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search
            size={14}
            className="absolute left-3 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'favorites'
                ? 'Buscar nas minhas figurinhas salvas...'
                : 'Buscar na galeria: camburi, moqueca, poquei...'
            }
            className="w-full py-1.5 pl-8 pr-7 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF2E93]/60 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-xs text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Pills (active in Gallery tab) */}
        {activeTab === 'gallery' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'girias', label: 'Gírias' },
              { id: 'praias', label: 'Praias & Rolês' },
              { id: 'culinaria', label: 'Culinária' },
              { id: 'expressoes', label: 'Expressões' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  setSelectedCategory(cat.id as typeof selectedCategory);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF2E93] text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab Helper Hint */}
        {activeTab === 'favorites' && favoriteStickerIds.length > 0 && (
          <div className="flex items-center justify-between text-[11px] text-amber-200/90 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
            <span className="flex items-center gap-1.5">
              <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
              <span>Figurinhas salvas favoritas ({favoriteStickers.length})</span>
            </span>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setActiveTab('gallery');
              }}
              className="text-[10px] font-bold text-[#00C2FF] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <Plus size={12} />
              <span>Ver Galeria</span>
            </button>
          </div>
        )}

        {/* Sticker Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto no-scrollbar pt-0.5">
          {currentList.length === 0 ? (
            activeTab === 'favorites' ? (
              /* Empty state for Minhas Figurinhas */
              <div className="col-span-full py-6 px-4 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md ring-4 ring-amber-500/10">
                  <Star size={24} className="fill-amber-400/40" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {searchQuery
                      ? 'Nenhuma figurinha favorita com essa busca'
                      : 'Nenhuma figurinha favorita salva ainda'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Navegue pela <strong>Galeria Capixaba</strong> e toque na
                    estrelinha <strong>⭐</strong> no canto de qualquer figurinha para
                    salvá-la aqui nas <em>Minhas Figurinhas</em>!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setActiveTab('gallery');
                    setSearchQuery('');
                  }}
                  className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white text-xs font-bold shadow-md shadow-[#FF2E93]/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Explorar Galeria Capixaba</span>
                </button>
              </div>
            ) : (
              /* Empty state for Gallery search */
              <div className="col-span-full py-8 text-center text-xs text-slate-400">
                Nenhuma figurinha encontrada para &quot;{searchQuery}&quot;
              </div>
            )
          ) : (
            currentList.map((stk) => {
              const isFavorite = favoriteStickerIds.includes(stk.id);

              return (
                <div
                  key={stk.id}
                  onClick={() => onSelectSticker(stk)}
                  className={`relative p-2.5 rounded-2xl bg-gradient-to-tr ${stk.bgGradient} border-2 border-white/70 hover:border-white flex flex-col items-center justify-between text-center gap-1 shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all cursor-pointer group`}
                >
                  {/* Save to Favorites Star Button (Top Right) */}
                  <button
                    type="button"
                    title={
                      isFavorite
                        ? 'Remover de Minhas Figurinhas'
                        : 'Salvar em Minhas Figurinhas ⭐'
                    }
                    onClick={(e) => handleFavoriteClick(e, stk)}
                    className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 shadow-sm ${
                      isFavorite
                        ? 'bg-black/60 text-amber-300 ring-1 ring-amber-400/80 scale-105'
                        : 'bg-black/30 hover:bg-black/60 text-white/70 hover:text-amber-300 hover:scale-110 opacity-70 group-hover:opacity-100'
                    }`}
                  >
                    <Star
                      size={13}
                      className={isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                    />
                  </button>

                  {/* Badge */}
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-black/40 text-white/90 uppercase tracking-wider pr-6 truncate max-w-full">
                    {stk.badgeText}
                  </span>

                  {/* Emoji */}
                  <span className="text-2xl filter drop-shadow my-0.5 transition-transform group-hover:scale-125">
                    {stk.emoji}
                  </span>

                  {/* Phrase */}
                  <span className="text-xs font-black tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-tight w-full truncate">
                    {stk.phrase}
                  </span>

                  {/* Saved pill indicator in favorites tab */}
                  {isFavorite && activeTab === 'favorites' && (
                    <span className="text-[8px] font-bold text-amber-200 bg-black/30 px-1.5 py-0.2 rounded-md">
                      ★ Salva
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info: tip to save */}
        <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>Toque na estrelinha em qualquer figurinha para salvar</span>
          </span>
          <span>{capixabaStickers.length} figurinhas no Poquei</span>
        </div>
      </div>
    </div>
  );
};
