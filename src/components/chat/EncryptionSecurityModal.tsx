import React, { useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Fingerprint,
  MessageSquare,
  FileText,
  PhoneCall,
  MapPin,
  Sparkles,
  Camera,
  Share2,
  Info,
} from 'lucide-react';
import { ChatThread } from '../../types';
import { Avatar } from '../common/Avatar';
import { playTapSound, playReactionSound, playLongPressHaptic } from '../../utils/soundEffects';

interface EncryptionSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatThread;
}

export const EncryptionSecurityModal: React.FC<EncryptionSecurityModalProps> = ({
  isOpen,
  onClose,
  chat,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'verify'>('info');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  if (!isOpen) return null;

  // Generate deterministic 60-digit fingerprint based on chat.id and chat.name
  const generateFingerprint = (seed: string): string[] => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const groups: string[] = [];
    for (let i = 0; i < 12; i++) {
      const num = ((absHash * (i + 1) * 9301 + 49297) % 90000) + 10000;
      groups.push(num.toString());
    }
    return groups;
  };

  const fingerprintGroups = generateFingerprint(chat.id + chat.name);
  const fullFingerprint = fingerprintGroups.join(' ');

  const handleCopy = () => {
    playTapSound();
    navigator.clipboard?.writeText(fullFingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateVerify = () => {
    playTapSound();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      playReactionSound();
      playLongPressHaptic();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#08101E] border border-cyan-500/25 rounded-3xl shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-white/10 bg-gradient-to-b from-cyan-950/30 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Lock size={20} className="text-[#00C2FF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Criptografia de Ponta a Ponta
              </h3>
              <p className="text-xs text-slate-400">Poquei Protocol • Segurança Máxima</p>
            </div>
          </div>

          <button
            type="button"
            title="Fechar"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-1 flex gap-2 border-b border-white/5 bg-slate-900/40">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setActiveTab('info');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'bg-cyan-500/20 text-[#00C2FF] border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Como Funciona</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setActiveTab('verify');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-cyan-500/20 text-[#00C2FF] border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Fingerprint size={14} />
            <span>Verificar Chaves</span>
            {isVerified && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'info' ? (
            <>
              {/* Highlight Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900/70 to-emerald-950/30 border border-cyan-500/25 flex items-start gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-[#00C2FF] shrink-0 mt-0.5">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Sua conversa com <span className="text-cyan-300">{chat.name}</span> é privada
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    As mensagens e chamadas são protegidas de ponta a ponta. Apenas você e {chat.name} têm as chaves secretas necessárias para ler, ouvir ou descriptografar o conteúdo. Nem mesmo os servidores do <strong>Poquei</strong> têm acesso.
                  </p>
                </div>
              </div>

              {/* Security Pillars */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  O que está 100% blindado nesta conversa:
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-slate-100">Mensagens de texto e de voz</h5>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Criptografadas no seu aparelho antes do envio com chaves efêmeras.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-400/20 flex items-center justify-center text-[#FF2E93] shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-slate-100">Fotos, vídeos e figurinhas</h5>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Mídias compactadas e codificadas, inacessíveis a terceiros.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <PhoneCall size={16} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-slate-100">Chamadas de áudio e vídeo</h5>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Fluxo P2P autenticado diretamente entre os dispositivos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-slate-100">Localização e rotas capixabas</h5>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Coordenadas em tempo real compartilhadas com sigilo total.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capixaba Trust Note */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
                <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Papo Capixaba Seguro:</strong> Do Convento da Penha às praias de Guarapari, suas conversas ficam exclusivamente no seu celular. Não coletamos nem vendemos dados.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Verification Section */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 mb-1">
                  <QrCode size={24} />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Código de Segurança de 60 Dígitos
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Compare este código de segurança com o aparelho de{' '}
                  <span className="text-cyan-300 font-medium">{chat.name}</span> para certificar-se de que a conexão não foi interceptada.
                </p>
              </div>

              {/* Simulated QR Code & Contact Avatar */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <div className="relative p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                  {/* Stylized QR Code SVG */}
                  <svg
                    className="w-36 h-36"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="100" height="100" fill="white" />
                    {/* Corner Position Detection Patterns */}
                    {/* Top-Left */}
                    <rect x="10" y="10" width="22" height="22" fill="#091122" />
                    <rect x="14" y="14" width="14" height="14" fill="white" />
                    <rect x="18" y="18" width="6" height="6" fill="#00C2FF" />

                    {/* Top-Right */}
                    <rect x="68" y="10" width="22" height="22" fill="#091122" />
                    <rect x="72" y="14" width="14" height="14" fill="white" />
                    <rect x="76" y="18" width="6" height="6" fill="#00C2FF" />

                    {/* Bottom-Left */}
                    <rect x="10" y="68" width="22" height="22" fill="#091122" />
                    <rect x="14" y="72" width="14" height="14" fill="white" />
                    <rect x="18" y="76" width="6" height="6" fill="#00C2FF" />

                    {/* Data patterns (matrix dots) */}
                    <rect x="36" y="12" width="4" height="4" fill="#091122" />
                    <rect x="44" y="12" width="4" height="4" fill="#091122" />
                    <rect x="52" y="12" width="4" height="4" fill="#091122" />
                    <rect x="40" y="20" width="4" height="4" fill="#091122" />
                    <rect x="48" y="20" width="4" height="4" fill="#091122" />
                    <rect x="56" y="20" width="4" height="4" fill="#091122" />

                    <rect x="12" y="36" width="4" height="4" fill="#091122" />
                    <rect x="20" y="36" width="4" height="4" fill="#091122" />
                    <rect x="28" y="36" width="4" height="4" fill="#091122" />
                    <rect x="16" y="44" width="4" height="4" fill="#091122" />
                    <rect x="24" y="44" width="4" height="4" fill="#091122" />

                    <rect x="36" y="36" width="6" height="6" fill="#00C2FF" />
                    <rect x="46" y="36" width="8" height="4" fill="#091122" />
                    <rect x="58" y="36" width="4" height="8" fill="#091122" />
                    <rect x="40" y="46" width="8" height="4" fill="#091122" />
                    <rect x="52" y="46" width="8" height="8" fill="#00C2FF" />

                    <rect x="68" y="36" width="4" height="4" fill="#091122" />
                    <rect x="76" y="36" width="4" height="4" fill="#091122" />
                    <rect x="84" y="36" width="4" height="4" fill="#091122" />
                    <rect x="72" y="44" width="4" height="4" fill="#091122" />
                    <rect x="80" y="44" width="4" height="4" fill="#091122" />

                    <rect x="36" y="68" width="4" height="4" fill="#091122" />
                    <rect x="44" y="68" width="4" height="4" fill="#091122" />
                    <rect x="52" y="68" width="4" height="4" fill="#091122" />
                    <rect x="40" y="76" width="4" height="4" fill="#091122" />
                    <rect x="48" y="76" width="4" height="4" fill="#091122" />
                    <rect x="56" y="76" width="4" height="4" fill="#091122" />

                    <rect x="68" y="68" width="6" height="6" fill="#091122" />
                    <rect x="78" y="68" width="4" height="4" fill="#091122" />
                    <rect x="86" y="68" width="4" height="4" fill="#091122" />
                    <rect x="72" y="78" width="8" height="4" fill="#091122" />
                    <rect x="84" y="78" width="4" height="8" fill="#091122" />
                  </svg>

                  {/* Little lock badge in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#08101E] border-2 border-white flex items-center justify-center text-[#00C2FF] shadow-md">
                      <Lock size={14} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Avatar name={chat.name} src={chat.avatarUrl} size="sm" />
                  <span className="text-xs font-semibold text-slate-200">
                    Chave de {chat.name}
                  </span>
                </div>
              </div>

              {/* 60-digit representation in 4 columns / rows */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Sequência Numérica de Chave</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[#00C2FF] hover:text-[#38D8FF] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar código</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono text-[11px] text-slate-200 tracking-wider">
                  {fingerprintGroups.map((group, idx) => (
                    <span
                      key={idx}
                      className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-cyan-500/30 transition-colors"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive verification button */}
              <div className="pt-1">
                {isVerified ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 flex items-center justify-center gap-2 text-xs font-semibold animate-fade-in">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Chaves de criptografia verificadas com sucesso!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateVerify}
                    disabled={isVerifying}
                    className="w-full py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[#00C2FF] hover:text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span>Autenticando chaves ponto a ponto...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={14} />
                        <span>Escanear ou Simular Verificação de Chave</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#060c17] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Lock size={12} className="text-[#00C2FF]" />
            <span>Chave AES-256 bits com Curva 25519</span>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00C2FF] to-[#0094FF] hover:from-[#38D8FF] hover:to-[#00A3FF] text-[#050B14] font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
