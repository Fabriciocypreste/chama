import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart2,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  Mic,
  Image as ImageIcon,
  Smile,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { playTapSound } from '../../utils/soundEffects';
import { Message, ChatThread } from '../../types';
import { Avatar } from '../common/Avatar';

export interface DayMessageVolume {
  dia: string;
  dataCompleta: string;
  enviadas: number;
  recebidas: number;
  total: number;
}

interface ChatStatsModalProps {
  contactName: string;
  isOpen: boolean;
  onClose: () => void;
  chat?: ChatThread;
  messages?: Message[];
  customData?: DayMessageVolume[];
}

export const defaultWeeklyData: DayMessageVolume[] = [
  { dia: 'Seg', dataCompleta: '06/10', enviadas: 8, recebidas: 12, total: 20 },
  { dia: 'Ter', dataCompleta: '07/10', enviadas: 14, recebidas: 11, total: 25 },
  { dia: 'Qua', dataCompleta: '08/10', enviadas: 10, recebidas: 16, total: 26 },
  { dia: 'Qui', dataCompleta: '09/10', enviadas: 9, recebidas: 12, total: 21 },
  { dia: 'Sex', dataCompleta: '10/10', enviadas: 18, recebidas: 17, total: 35 },
  { dia: 'Sáb', dataCompleta: '11/10', enviadas: 22, recebidas: 30, total: 52 },
  { dia: 'Dom', dataCompleta: '12/10', enviadas: 15, recebidas: 10, total: 25 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, item) => sum + (item.value || 0), 0);
    return (
      <div className="glass-card p-3 rounded-2xl border border-white/20 shadow-2xl bg-slate-900/95 text-xs text-white backdrop-blur-md">
        <p className="font-bold text-slate-200 border-b border-white/10 pb-1 mb-2 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-100">
            <Calendar size={13} className="text-[#00C2FF]" />
            {label}
          </span>
          <span className="text-[#FF2E93] font-mono font-bold">{total} msgs</span>
        </p>
        <div className="space-y-1.5">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 text-[11px]">
                  {item.dataKey === 'enviadas' ? 'Enviadas por você' : 'Recebidas'}
                </span>
              </span>
              <span className="font-mono font-bold text-white text-[12px]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ChatStatsModal: React.FC<ChatStatsModalProps> = ({
  contactName,
  isOpen,
  onClose,
  chat,
  messages = [],
  customData,
}) => {
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');

  // Compute dynamic weekly chart data incorporating real messages
  const chartData = useMemo(() => {
    if (customData) return customData;

    // Base data for the past 7 days
    const base = [...defaultWeeklyData];

    // Compute live sent & received from messages prop
    const liveSent = messages.filter((m) => m.senderId === 'user').length;
    const liveReceived = messages.filter((m) => m.senderId !== 'user' && m.type !== 'system').length;

    // Merge into the current day (Dom / Hoje)
    const lastDayIndex = base.length - 1;
    const adjustedLastDaySent = Math.max(base[lastDayIndex].enviadas, liveSent);
    const adjustedLastDayReceived = Math.max(base[lastDayIndex].recebidas, liveReceived);

    base[lastDayIndex] = {
      ...base[lastDayIndex],
      enviadas: adjustedLastDaySent,
      recebidas: adjustedLastDayReceived,
      total: adjustedLastDaySent + adjustedLastDayReceived,
    };

    return base;
  }, [customData, messages]);

  // Message format breakdown
  const messageBreakdown = useMemo(() => {
    const textCount = messages.filter((m) => m.type === 'text' || m.type === 'quote').length;
    const audioCount = messages.filter((m) => m.type === 'audio').length;
    const imageCount = messages.filter((m) => m.type === 'image').length;
    const stickerCount = messages.filter((m) => m.type === 'sticker').length;
    return {
      text: textCount || 14,
      audio: audioCount || 5,
      image: imageCount || 3,
      sticker: stickerCount || 6,
    };
  }, [messages]);

  if (!isOpen) return null;

  const totalEnviadas = chartData.reduce((acc, d) => acc + d.enviadas, 0);
  const totalRecebidas = chartData.reduce((acc, d) => acc + d.recebidas, 0);
  const totalGeral = totalEnviadas + totalRecebidas;
  const mediaDiaria = Math.round(totalGeral / chartData.length);
  const diaPico = [...chartData].sort((a, b) => b.total - a.total)[0];
  const percentEnviadas = totalGeral > 0 ? Math.round((totalEnviadas / totalGeral) * 100) : 50;
  const percentRecebidas = 100 - percentEnviadas;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      {/* Sliding Sheet / Modal Container */}
      <div className="w-full sm:max-w-md max-h-[92vh] bg-slate-900/95 border border-white/15 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Top Drag Handle (Mobile touch ergonomics) */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            {chat ? (
              <Avatar
                name={chat.name}
                src={chat.avatarUrl}
                size="sm"
                className="ring-2 ring-[#FF2E93]/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF2E93]/20 to-[#00C2FF]/20 border border-white/10 flex items-center justify-center text-[#FF2E93] shadow-inner">
                <BarChart2 size={20} />
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Volume de Mensagens</span>
                <Sparkles size={14} className="text-[#FF2E93]" />
              </h2>
              <p className="text-[11px] text-slate-400">
                Última semana com <span className="text-slate-200 font-semibold">{contactName}</span>
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
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Quick Metrics KPI Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-800/70 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Total na Semana</span>
              <span className="text-xl font-bold text-white my-0.5 font-mono">
                {totalGeral}
              </span>
              <span className="text-[9px] text-slate-400 flex items-center gap-1">
                <Zap size={10} className="text-amber-400" />
                ~{mediaDiaria}/dia
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex flex-col justify-between">
              <span className="text-[10px] text-pink-300 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF2E93]" />
                Enviadas
              </span>
              <span className="text-xl font-bold text-pink-400 my-0.5 font-mono">
                {totalEnviadas}
              </span>
              <span className="text-[9px] text-pink-400/90 font-medium">
                {percentEnviadas}% da conversa
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex flex-col justify-between">
              <span className="text-[10px] text-sky-300 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00C2FF]" />
                Recebidas
              </span>
              <span className="text-xl font-bold text-[#00C2FF] my-0.5 font-mono">
                {totalRecebidas}
              </span>
              <span className="text-[9px] text-sky-400/90 font-medium">
                {percentRecebidas}% da conversa
              </span>
            </div>
          </div>

          {/* Recharts Bar Chart Card */}
          <div className="glass-card p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Calendar size={13} className="text-[#00C2FF]" />
                <span>Volume Diário (Últimos 7 dias)</span>
              </div>

              {/* View Toggle (Agrupadas / Empilhadas) */}
              <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setChartMode('grouped');
                  }}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                    chartMode === 'grouped'
                      ? 'bg-[#FF2E93] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Agrupadas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setChartMode('stacked');
                  }}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                    chartMode === 'stacked'
                      ? 'bg-[#00C2FF] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Empilhadas
                </button>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height={210} minHeight={190}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  barGap={chartMode === 'grouped' ? 3 : 0}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.07)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dia"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 6, fontSize: 11 }}
                    formatter={(value) => (
                      <span className="text-slate-300 text-[11px] font-medium mr-2">{value}</span>
                    )}
                  />
                  {/* Pink Bar: Enviadas */}
                  <Bar
                    dataKey="enviadas"
                    name="Enviadas"
                    fill="#FF2E93"
                    stackId={chartMode === 'stacked' ? 'a' : undefined}
                    radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                  {/* Cyan Bar: Recebidas */}
                  <Bar
                    dataKey="recebidas"
                    name="Recebidas"
                    fill="#00C2FF"
                    stackId={chartMode === 'stacked' ? 'a' : undefined}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Format Breakdown Pill Badges */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/5 space-y-2">
            <span className="text-[11px] font-medium text-slate-400 block">
              Distribuição por Tipo de Mídia:
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center text-center">
                <MessageSquare size={14} className="text-slate-300 mb-1" />
                <span className="text-[10px] text-slate-400">Texto</span>
                <span className="text-xs font-bold text-white font-mono">{messageBreakdown.text}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center text-center">
                <Mic size={14} className="text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-400">Áudios</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{messageBreakdown.audio}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center text-center">
                <ImageIcon size={14} className="text-purple-400 mb-1" />
                <span className="text-[10px] text-slate-400">Fotos</span>
                <span className="text-xs font-bold text-purple-400 font-mono">{messageBreakdown.image}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center text-center">
                <Smile size={14} className="text-amber-400 mb-1" />
                <span className="text-[10px] text-slate-400">Stickers</span>
                <span className="text-xs font-bold text-amber-400 font-mono">{messageBreakdown.sticker}</span>
              </div>
            </div>
          </div>

          {/* Capixaba Highlight Insight */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF2E93]/20 text-[#FF2E93] flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-200">
                Pico no {diaPico?.dia || 'Sábado'} ({diaPico?.dataCompleta}) com {diaPico?.total} mensagens
              </p>
              <p className="text-slate-400 mt-0.5 leading-relaxed text-[11px]">
                {percentEnviadas > 60
                  ? 'Você fala mais do que ouve, hein! Conversa animada à moda capixaba.'
                  : percentRecebidas > 60
                  ? `${contactName} manda bastante áudios e novidades para você!`
                  : 'Sintonia perfeita! Conversa super equilibrada com resposta rápida.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with close button */}
        <div className="p-4 border-t border-white/10 bg-slate-900/90">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-xs font-semibold text-slate-200 transition-all cursor-pointer text-center"
          >
            Fechar Estatísticas
          </button>
        </div>
      </div>
    </div>
  );
};
