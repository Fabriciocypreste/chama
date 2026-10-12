import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Check, RotateCcw, X, Send } from 'lucide-react';
import { translateToCapixaba } from '../../utils/aiTranslator';
import { playTapSound, playMessageReceivedSound } from '../../utils/soundEffects';

interface AiTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInput: string;
  onApplyTranslation: (translatedText: string, shouldSendImmediately?: boolean) => void;
}

const formalExamples = [
  {
    title: 'Convidar para a praia',
    formal: 'Prezados, teriam disponibilidade para nos reunirmos na praia hoje à tarde?',
  },
  {
    title: 'Pedir pão na padaria',
    formal: 'Por gentileza, comprem dez pães franceses para o nosso café da tarde.',
  },
  {
    title: 'Elogiar um evento / rolê',
    formal: 'O evento de ontem à noite foi de uma qualidade extraordinária.',
  },
  {
    title: 'Perguntar sobre o almoço',
    formal: 'Gostaria de saber onde podemos apreciar um bom ensopado de peixe hoje.',
  },
  {
    title: 'Avisar que está a caminho',
    formal: 'Estou em trânsito e chegarei ao compromisso em aproximadamente quinze minutos.',
  },
];

export const AiTranslatorModal: React.FC<AiTranslatorModalProps> = ({
  isOpen,
  onClose,
  currentInput,
  onApplyTranslation,
}) => {
  const [textToTranslate, setTextToTranslate] = useState(currentInput || '');
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [sourceUsed, setSourceUsed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTranslate = async (customText?: string) => {
    const text = (customText !== undefined ? customText : textToTranslate).trim();
    if (!text) return;

    setIsLoading(true);
    setErrorMsg(null);
    playTapSound();

    try {
      const res = await translateToCapixaba(text);
      setTranslatedResult(res.translatedText);
      setSourceUsed(res.source || 'gemini');
      playMessageReceivedSound();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Não foi possível traduzir no momento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExample = (formal: string) => {
    setTextToTranslate(formal);
    handleTranslate(formal);
  };

  const handleApply = (sendDirectly = false) => {
    if (!translatedResult) return;
    playTapSound();
    onApplyTranslation(translatedResult, sendDirectly);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-[#0A1224] border border-[#00C2FF]/30 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-[#0A1832] to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-[#00C2FF] flex items-center justify-center text-white shadow-md shadow-[#00C2FF]/20">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Tradutor Capixaba IA</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[#00C2FF] border border-[#00C2FF]/30">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transforme mensagens formais no dialeto autêntico do Espírito Santo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Formal Input box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mensagem formal ou padrão:
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={textToTranslate}
                onChange={(e) => setTextToTranslate(e.target.value)}
                placeholder="Ex: Prezados colegas, poderíamos nos encontrar na praia hoje à tarde?"
                className="w-full p-3 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] text-xs text-slate-100 placeholder:text-slate-500 outline-none resize-none transition-all shadow-inner"
              />
              {textToTranslate && (
                <button
                  type="button"
                  onClick={() => setTextToTranslate('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Translate Button */}
          <button
            type="button"
            disabled={isLoading || !textToTranslate.trim()}
            onClick={() => handleTranslate()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-[#FF2E93] to-[#00C2FF] hover:opacity-95 active:scale-98 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#FF2E93]/25 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles size={15} className="animate-spin text-white" />
                <span>Traduzindo com IA do Poquei...</span>
              </>
            ) : (
              <>
                <Wand2 size={15} />
                <span>Traduzir para Dialeto Capixaba Raiz</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Translated Result Card */}
          {translatedResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900/80 to-pink-950/40 border border-[#00C2FF]/50 shadow-xl animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#00C2FF] flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles size={13} />
                  <span>Dialeto Capixaba Autêntico</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {sourceUsed === 'gemini' ? '✨ Gerado com Gemini IA' : '⚡ Dialeto local'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-sm font-medium text-emerald-300 leading-relaxed shadow-inner">
                "{translatedResult}"
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApply(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <Check size={14} className="text-[#00C2FF]" />
                  <span>Usar no campo de texto</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApply(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#00C2FF] hover:bg-[#38D8FF] text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#00C2FF]/30 transition-all cursor-pointer"
                >
                  <Send size={14} />
                  <span>Enviar direto</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Examples Section */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Ou teste com frases prontas do dia a dia:
            </span>
            <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
              {formalExamples.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectExample(item.formal)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-[#00C2FF]/30 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="pr-2">
                    <span className="text-[10px] font-bold text-pink-400 block">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-300 group-hover:text-cyan-200 line-clamp-1">
                      "{item.formal}"
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-[#00C2FF] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
