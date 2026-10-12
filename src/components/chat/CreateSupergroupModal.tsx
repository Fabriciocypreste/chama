import React, { useState } from 'react';
import {
  Users,
  X,
  Hash,
  Plus,
  Shield,
  Sparkles,
  MapPin,
  Check,
  Flame,
  Volume2,
  Crown,
} from 'lucide-react';
import { SupergroupFormData, RegiaoES } from '../../types';
import { playTapSound } from '../../utils/soundEffects';

interface CreateSupergroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSupergroup: (data: SupergroupFormData) => void;
  onShowToast: (msg: string) => void;
}

const REGION_OPTIONS: RegiaoES[] = [
  'Grande Vitória',
  'Região Serrana',
  'Litoral Sul',
  'Norte & Noroeste',
];

const PRESET_AVATARS = [
  {
    name: 'Terceira Ponte',
    url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Praia & Mar',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Pedra Azul',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Convento da Penha',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Comunidade & Rolê',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=150&q=80',
  },
];

const SUGGESTED_SUBTOPICS = [
  '#avisos-oficiais',
  '#trânsito-ao-vivo',
  '#rolês-e-encontros',
  '#dicas-de-praia',
  '#vagas-de-emprego',
  '#moqueca-e-gastronomia',
  '#compra-e-venda',
  '#segurança-do-bairro',
];

export const CreateSupergroupModal: React.FC<CreateSupergroupModalProps> = ({
  isOpen,
  onClose,
  onCreateSupergroup,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState<RegiaoES>('Grande Vitória');
  const [memberLimit, setMemberLimit] = useState<number>(100000);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_AVATARS[0].url);
  const [subtopics, setSubtopics] = useState<string[]>([
    '#avisos-oficiais',
    '#geral-capixaba',
    '#rolês-es',
  ]);
  const [newTopicInput, setNewTopicInput] = useState('');

  // Moderation toggles
  const [antiSpamActive, setAntiSpamActive] = useState(true);
  const [adminOnlyLinks, setAdminOnlyLinks] = useState(true);
  const [approvalRequired, setApprovalRequired] = useState(false);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    let clean = newTopicInput.trim().toLowerCase();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = `#${clean}`;
    clean = clean.replace(/\s+/g, '-');

    if (!subtopics.includes(clean)) {
      playTapSound();
      setSubtopics([...subtopics, clean]);
      setNewTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    if (subtopics.length <= 1) {
      onShowToast('O supergrupo precisa de pelo menos 1 tópico');
      return;
    }
    playTapSound();
    setSubtopics(subtopics.filter((t) => t !== topicToRemove));
  };

  const handleToggleSuggestedTopic = (topic: string) => {
    playTapSound();
    if (subtopics.includes(topic)) {
      handleRemoveTopic(topic);
    } else {
      setSubtopics([...subtopics, topic]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Informe o nome do Supergrupo');
      return;
    }

    playTapSound();
    const data: SupergroupFormData = {
      name: name.trim(),
      description:
        description.trim() ||
        `Supergrupo capixaba oficial (${region}) com subcanais temáticos e milhares de membros.`,
      region,
      memberLimit,
      subtopics,
      avatarUrl: selectedAvatar,
    };

    onCreateSupergroup(data);
    onShowToast(`Supergrupo "${data.name}" criado com sucesso! 🚀`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#091224] border border-pink-500/30 text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-[#FF2E93] border border-pink-500/40 flex items-center justify-center shadow-inner">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white">Criar Supergrupo Capixaba</h2>
                <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-black uppercase tracking-wider">
                  ATÉ 200K
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Milhares de membros, subtópicos temáticos e moderação avançada
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {/* Group Name & Avatar */}
          <div className="flex items-start gap-3">
            <div className="relative group shrink-0">
              <img
                src={selectedAvatar}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500/40 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#FF2E93] text-white shadow-md">
                <Sparkles size={10} />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Nome do Supergrupo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ciclismo & Orla da Grande Vitória 🚴‍♀️"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Preset Avatars picker */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Escolha um avatar temático do Espírito Santo:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.name}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setSelectedAvatar(av.url);
                  }}
                  className={`relative p-1 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    selectedAvatar === av.url
                      ? 'border-[#FF2E93] bg-pink-500/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  {selectedAvatar === av.url && (
                    <div className="absolute inset-0 bg-[#FF2E93]/30 rounded-xl flex items-center justify-center">
                      <Check size={14} className="text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
              Descrição e Regras da Comunidade
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito da comunidade, orientações e avisos..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-all resize-none"
            />
          </div>

          {/* Region and Member Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 mb-1">
                <MapPin size={12} className="text-[#00C2FF]" />
                <span>Região Capixaba</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegiaoES)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 mb-1">
                <Crown size={12} className="text-amber-400" />
                <span>Capacidade de Membros</span>
              </label>
              <select
                value={memberLimit}
                onChange={(e) => setMemberLimit(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value={10000} className="bg-slate-900">Até 10.000 membros</option>
                <option value={50000} className="bg-slate-900">Até 50.000 membros</option>
                <option value={100000} className="bg-slate-900">Até 100.000 membros (Padrão)</option>
                <option value={200000} className="bg-slate-900">Até 200.000 membros (Supergrupo Mega)</option>
              </select>
            </div>
          </div>

          {/* Subtopics / Channels Manager */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Hash size={13} className="text-[#FF2E93]" />
                <span>Subtópicos & Canais Internos</span>
              </label>
              <span className="text-[10px] text-pink-300 font-mono">
                {subtopics.length} tópicos ativos
              </span>
            </div>

            {/* Active subtopics chips */}
            <div className="flex flex-wrap gap-1.5">
              {subtopics.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-200 text-xs font-mono font-semibold"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(t)}
                    className="text-pink-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add new subtopic input */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <Hash size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={newTopicInput}
                  onChange={(e) => setNewTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTopic();
                    }
                  }}
                  placeholder="Novo tópico (ex: eventos-camburi)"
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-1.5 rounded-xl bg-[#FF2E93] hover:bg-[#ff1685] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Suggested quick chips */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 block mb-1">
                Sugestões populares do ES (toque para adicionar):
              </span>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_SUBTOPICS.map((suggested) => {
                  const isAdded = subtopics.includes(suggested);
                  return (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => handleToggleSuggestedTopic(suggested)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {suggested} {isAdded ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Moderation Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Shield size={14} className="text-emerald-400" />
              <span>Controles de Moderação do Supergrupo</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 cursor-pointer">
                <span className="text-slate-300">Filtro automático anti-spam e bots</span>
                <input
                  type="checkbox"
                  checked={antiSpamActive}
                  onChange={(e) => setAntiSpamActive(e.target.checked)}
                  className="rounded text-[#FF2E93] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 cursor-pointer">
                <span className="text-slate-300">Apenas admins enviam links externos</span>
                <input
                  type="checkbox"
                  checked={adminOnlyLinks}
                  onChange={(e) => setAdminOnlyLinks(e.target.checked)}
                  className="rounded text-[#FF2E93] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 cursor-pointer">
                <span className="text-slate-300">Exigir aprovação de moderador para entrada</span>
                <input
                  type="checkbox"
                  checked={approvalRequired}
                  onChange={(e) => setApprovalRequired(e.target.checked)}
                  className="rounded text-[#FF2E93] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-[#FF2E93] via-pink-600 to-purple-600 hover:from-[#ff1685] hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-[#FF2E93]/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Users size={15} />
              <span>Criar Supergrupo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
