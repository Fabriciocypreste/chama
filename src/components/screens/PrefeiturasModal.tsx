import React, { useState, useMemo } from 'react';
import {
  Landmark,
  X,
  Search,
  Phone,
  MessageCircle,
  Shield,
  ExternalLink,
  MapPin,
  Check,
  Copy,
  Users,
  Building2,
  AlertTriangle,
  VolumeX,
  HeartPulse,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { PrefeituraContact, RegiaoES } from '../../types';
import { initialPrefeituras } from '../../data/mockData';
import { playTapSound } from '../../utils/soundEffects';

interface PrefeiturasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOfficialChat: (prefeitura: PrefeituraContact) => void;
  onShowToast: (msg: string) => void;
}

export const PrefeiturasModal: React.FC<PrefeiturasModalProps> = ({
  isOpen,
  onClose,
  onStartOfficialChat,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegiaoES | 'Todas'>('Todas');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    playTapSound();
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(`${label}-${text}`);
      onShowToast(`${label} copiado: ${text}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      onShowToast(`Número: ${text}`);
    }
  };

  const filteredPrefeituras = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialPrefeituras.filter((p) => {
      const matchRegion =
        selectedRegion === 'Todas' || p.regiao === selectedRegion;

      if (!q) return matchRegion;

      const matchCity = p.cidade.toLowerCase().includes(q);
      const matchServices =
        (p.telefoneGeral && p.telefoneGeral.toLowerCase().includes(q)) ||
        (p.ouvidoria && p.ouvidoria.toLowerCase().includes(q)) ||
        (p.defesaCivil && p.defesaCivil.toLowerCase().includes(q)) ||
        (p.guardaMunicipal && p.guardaMunicipal.toLowerCase().includes(q)) ||
        (p.disqueSilencio && p.disqueSilencio.toLowerCase().includes(q)) ||
        (p.saudeEmergencia && p.saudeEmergencia.toLowerCase().includes(q)) ||
        (p.prefeito && p.prefeito.toLowerCase().includes(q));

      return matchRegion && (matchCity || matchServices);
    });
  }, [search, selectedRegion]);

  const regionTabs: (RegiaoES | 'Todas')[] = [
    'Todas',
    'Grande Vitória',
    'Região Serrana',
    'Litoral Sul',
    'Norte & Noroeste',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-[#081124] border border-cyan-500/30 text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00C2FF] border border-cyan-500/40 flex items-center justify-center shadow-lg">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Prefeituras do Espírito Santo
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  GUIA OFICIAL
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Telefones, WhatsApp Cidadão, Defesa Civil e Ouvidorias municipais
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar & Region filters */}
        <div className="p-4 bg-slate-900/80 border-b border-white/5 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cidade, serviço (ex: 156, defesa civil, disque-silêncio)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Regional category buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {regionTabs.map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => {
                  playTapSound();
                  setSelectedRegion(reg);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedRegion === reg
                    ? 'bg-[#00C2FF] text-slate-950 border-[#00C2FF] font-bold shadow-md shadow-[#00C2FF]/25'
                    : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700/80'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* List of Prefeituras */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-3.5 flex-1">
          {filteredPrefeituras.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Building2 size={32} className="text-slate-500 mb-2" />
              <p className="font-bold text-slate-300">Nenhum município encontrado</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Tente buscar por nome de outra cidade ou limpe o filtro regional.
              </p>
            </div>
          ) : (
            filteredPrefeituras.map((pref) => {
              return (
                <div
                  key={pref.id}
                  className="rounded-2xl p-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 shadow-lg hover:border-cyan-500/40 transition-all space-y-3"
                >
                  {/* City Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={pref.avatarUrl}
                        alt={pref.cidade}
                        className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/30 shrink-0 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{pref.cidade}</h3>
                          <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-[#00C2FF] text-[10px] font-semibold border border-cyan-500/30">
                            {pref.regiao}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {pref.prefeito && `Prefeito(a): ${pref.prefeito} · `}
                          {pref.populacao && `${pref.populacao}`}
                        </p>
                      </div>
                    </div>

                    {/* Official Verified Chat Button */}
                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        onStartOfficialChat(pref);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                    >
                      <MessageCircle size={13} />
                      <span>Chat Oficial</span>
                    </button>
                  </div>

                  {/* Contact Channels Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Telefone Geral */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone size={14} className="text-cyan-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Telefone Geral
                          </span>
                          <span className="text-slate-200 font-mono font-medium truncate block">
                            {pref.telefoneGeral}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pref.telefoneGeral, 'Telefone')}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                          title="Copiar telefone"
                        >
                          <Copy size={12} />
                        </button>
                        <a
                          href={`tel:${pref.telefoneGeral.replace(/\D/g, '')}`}
                          className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[10px] font-bold"
                        >
                          Ligar
                        </a>
                      </div>
                    </div>

                    {/* WhatsApp Cidadão */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageCircle size={14} className="text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-emerald-400 block uppercase font-bold">
                            WhatsApp Cidadão
                          </span>
                          <span className="text-slate-200 font-mono font-medium truncate block">
                            {pref.whatsappCidadao}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pref.whatsappCidadao, 'WhatsApp')}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                          title="Copiar WhatsApp"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playTapSound();
                            onStartOfficialChat(pref);
                            onClose();
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold cursor-pointer"
                        >
                          Abrir
                        </button>
                      </div>
                    </div>

                    {/* Ouvidoria */}
                    {pref.ouvidoria && (
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            Ouvidoria Municipal
                          </span>
                          <span className="text-slate-300 text-[11px] truncate block">
                            {pref.ouvidoria}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pref.ouvidoria, 'Ouvidoria')}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )}

                    {/* Defesa Civil */}
                    {pref.defesaCivil && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-amber-300 block font-bold uppercase">
                              Defesa Civil (199)
                            </span>
                            <span className="text-slate-200 text-[11px] truncate block font-mono">
                              {pref.defesaCivil}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pref.defesaCivil, 'Defesa Civil')}
                          className="p-1 rounded hover:bg-white/10 text-amber-300 cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )}

                    {/* Guarda Municipal ou Disque-Silêncio (se disponível) */}
                    {pref.disqueSilencio && (
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <VolumeX size={13} className="text-pink-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-pink-300 block font-bold uppercase">
                              Disque-Silêncio
                            </span>
                            <span className="text-slate-300 text-[11px] truncate block">
                              {pref.disqueSilencio}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pref.disqueSilencio!, 'Disque-Silêncio')}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )}

                    {pref.saudeEmergencia && (
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <HeartPulse size={13} className="text-rose-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-rose-300 block font-bold uppercase">
                              Saúde / Emergência
                            </span>
                            <span className="text-slate-300 text-[11px] truncate block">
                              {pref.saudeEmergencia}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pref.saudeEmergencia!, 'Saúde')}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Address & Official Website Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[280px] flex items-center gap-1">
                      <MapPin size={11} className="text-slate-500 shrink-0" />
                      <span className="truncate">{pref.endereco}</span>
                    </span>
                    <a
                      href={pref.siteOficial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>Portal Oficial</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredPrefeituras.length} prefeituras exibidas</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
          >
            Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};
