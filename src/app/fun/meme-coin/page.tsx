"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { Dog, Cat, Ghost, Rocket, RefreshCw, Download, CheckCheck, AlertTriangle } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

const INITIAL_CAPITAL = 1_000_000;
const fmt = (n: number) => n.toLocaleString("ko-KR");

type CoinId = "doge" | "cat" | "ghost";

const coins = [
  {
    id: "doge" as CoinId,
    name: "DOGE",
    fullName: "댕댕코인",
    icon: Dog,
    color: "#F59E0B",
    badge: "고위험",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    desc: "일론 트윗 하나에 화성 가거나 지옥 감. 예측 불가 그 자체.",
    volatility: "★★★☆☆",
  },
  {
    id: "cat" as CoinId,
    name: "CAT",
    fullName: "냥냥코인",
    icon: Cat,
    color: "#EC4899",
    badge: "극위험",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    desc: "9개의 목숨을 가진 코인. 지금 몇 번째 목숨인지 개발자도 모름.",
    volatility: "★★★★☆",
  },
  {
    id: "ghost" as CoinId,
    name: "GHOST",
    fullName: "유령코인",
    icon: Ghost,
    color: "#8B5CF6",
    badge: "사기의심",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    desc: "실체 없음. 근데 다들 삼. 이게 바로 코인의 본질.",
    volatility: "★★★★★",
  },
] as const;

const EVENTS = [
  { desc: "🚀 일론 머스크: 'DOGE to the Moon!' 트윗 폭발", effect: { doge: 5.2, cat: 0.6, ghost: 0.9 }, type: "pump" as const },
  { desc: "📉 SEC '모든 밈코인 상장폐지 검토' 긴급 성명", effect: { doge: 0.12, cat: 0.08, ghost: 0.05 }, type: "dump" as const },
  { desc: "💀 냥냥코인 개발팀 잠적... 러그풀 강력 의심", effect: { doge: 1.1, cat: 0.01, ghost: 1.3 }, type: "scam" as const },
  { desc: "🔥 유령코인, 글로벌 빅테크 인수설 (찌라시 폭발)", effect: { doge: 0.7, cat: 0.8, ghost: 11.0 }, type: "pump" as const },
  { desc: "🐳 글로벌 고래 전 종목 매집! 시장 전체 폭등!", effect: { doge: 2.1, cat: 2.8, ghost: 1.9 }, type: "pump" as const },
  { desc: "🏛️ 한국 금감원: '밈코인 전면 거래 제한' 경고", effect: { doge: 0.3, cat: 0.25, ghost: 0.2 }, type: "dump" as const },
  { desc: "🌊 비트코인 40% 폭락! 알트코인 전멸 직전", effect: { doge: 0.15, cat: 0.1, ghost: 0.08 }, type: "dump" as const },
  { desc: "🎰 거래소 해킹 발생! 냥냥코인 자산 95% 증발", effect: { doge: 0.9, cat: 0.05, ghost: 0.85 }, type: "scam" as const },
  { desc: "📺 BBC: '댕댕코인, 국가 공식 통화 채택 논의'", effect: { doge: 7.3, cat: 1.2, ghost: 0.7 }, type: "pump" as const },
  { desc: "🌍 G20 공동성명: '밈코인 국제 규제 착수'", effect: { doge: 0.2, cat: 0.3, ghost: 0.15 }, type: "dump" as const },
];

export default function MemeCoinPage() {
  const [step, setStep] = useState<"invest" | "analyzing" | "result">("invest");
  const [investments, setInvestments] = useState<Record<CoinId, number>>({ doge: 0, cat: 0, ghost: 0 });
  const [result, setResult] = useState<{
    event: typeof EVENTS[0];
    portfolio: Record<CoinId, number>;
    finalValue: number;
    profit: number;
    profitRate: number;
    chartData: { time: string; value: number }[];
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const totalInvested = (Object.values(investments) as number[]).reduce((a, b) => a + b, 0);
  const remaining = INITIAL_CAPITAL - totalInvested;

  const changeAmount = (id: CoinId, delta: number) => {
    setInvestments(prev => {
      const next = prev[id] + delta;
      if (next < 0 || remaining - delta < 0) return prev;
      return { ...prev, [id]: next };
    });
  };

  const setMax = (id: CoinId) => {
    setInvestments(prev => ({ ...prev, [id]: prev[id] + remaining }));
  };

  const runSimulation = () => {
    if (totalInvested === 0) return;
    setStep("analyzing");
    setTimeout(() => {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      const portfolio = {} as Record<CoinId, number>;
      coins.forEach(c => {
        portfolio[c.id] = Math.floor(investments[c.id] * event.effect[c.id]);
      });
      const finalValue = (Object.values(portfolio) as number[]).reduce((a, b) => a + b, 0);
      const profit = finalValue - totalInvested;
      const profitRate = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
      const base = totalInvested;
      const chartData = [
        { time: "09:00", value: base },
        { time: "10:30", value: Math.round(base * (0.88 + Math.random() * 0.24)) },
        { time: "12:00", value: Math.round(base * (0.75 + Math.random() * 0.5)) },
        { time: "14:00", value: Math.round(base * (0.6 + Math.random() * 0.8)) },
        { time: "15:30", value: Math.round(finalValue * (0.85 + Math.random() * 0.1)) },
        { time: "17:00", value: finalValue },
      ];
      setResult({ event, portfolio, finalValue, profit, profitRate, chartData });
      setStep("result");
    }, 2800);
  };

  const reset = () => {
    setStep("invest");
    setInvestments({ doge: 0, cat: 0, ghost: 0 });
    setResult(null);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const captureResultImage = async (): Promise<Blob | null> => {
    if (!shareRef.current) return null;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(shareRef.current, { scale: 2, useCORS: true, backgroundColor: "#0D1117" });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const handleSaveImage = async () => {
    if (!shareRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(shareRef.current, { scale: 2, useCORS: true, backgroundColor: "#0D1117" });
      const a = document.createElement("a");
      a.download = "meme-coin-result.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      showToast("이미지 저장 완료!");
    } catch {
      showToast("이미지 저장에 실패했습니다.");
    }
  };

  const isProfit = result ? result.profit >= 0 : true;

  return (
    <main className="w-full min-h-screen bg-[#0D1117] text-white font-mono overflow-hidden relative">
      {/* Matrix grid background */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(0,255,65,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,.5)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Top accent */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent z-50" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-20">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold mb-5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            실시간 시장 현황: 극도의 탐욕 🔥
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-3">
            <span className="text-white">CRYPTO</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">PANIC</span>
          </h1>
          <p className="text-gray-400 text-lg">100만원으로 인생역전? 가즈아! 🚀</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ─── STEP: INVEST ─── */}
          {step === "invest" && (
            <motion.div
              key="invest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Wallet Banner */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-green-400 text-xs uppercase tracking-widest font-bold mb-1">보유 잔액</p>
                  <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {fmt(remaining)}{" "}
                    <span className="text-lg text-gray-400">KRW</span>
                  </p>
                  {totalInvested > 0 && (
                    <p className="text-xs text-gray-500 mt-1">투자 중: {fmt(totalInvested)}원</p>
                  )}
                </div>

                {/* Portfolio mini bar */}
                {totalInvested > 0 && (
                  <div className="w-full sm:w-48">
                    <p className="text-xs text-gray-500 mb-1.5">포트폴리오</p>
                    <div className="h-3 rounded-full overflow-hidden bg-[#21262D] flex">
                      {coins.map(c => {
                        const pct = (investments[c.id] / INITIAL_CAPITAL) * 100;
                        return pct > 0 ? (
                          <div key={c.id} style={{ width: `${pct}%`, backgroundColor: c.color }} className="h-full" />
                        ) : null;
                      })}
                      <div style={{ width: `${(remaining / INITIAL_CAPITAL) * 100}%` }} className="h-full bg-[#30363D]" />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>투자됨 {((totalInvested / INITIAL_CAPITAL) * 100).toFixed(0)}%</span>
                      <span>잔여 {((remaining / INITIAL_CAPITAL) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={runSimulation}
                  disabled={totalInvested === 0}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-400 text-black font-black text-lg rounded-xl hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(34,197,94,0.3)] whitespace-nowrap"
                >
                  매수 체결 🚀
                </button>
              </div>

              {/* Coins Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coins.map(coin => {
                  const invested = investments[coin.id];
                  const pct = totalInvested > 0 ? ((invested / totalInvested) * 100).toFixed(0) : "0";
                  const Icon = coin.icon;
                  return (
                    <div
                      key={coin.id}
                      className="bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/40 rounded-2xl p-5 transition-all group"
                    >
                      {/* Coin header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${coin.color}22` }}>
                            <Icon className="w-5 h-5" style={{ color: coin.color }} />
                          </div>
                          <div>
                            <p className="font-black text-white text-lg leading-none">{coin.name}</p>
                            <p className="text-gray-500 text-xs">{coin.fullName}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${coin.badgeColor}`}>
                          {coin.badge}
                        </span>
                      </div>

                      <p className="text-gray-400 text-xs leading-relaxed mb-4 min-h-[36px]">{coin.desc}</p>

                      {/* 변동성 */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-600 text-[10px]">변동성</span>
                        <span className="text-yellow-500 text-xs tracking-widest">{coin.volatility}</span>
                      </div>

                      {/* 보유량 */}
                      <div className="bg-[#0D1117] rounded-xl p-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs">보유량</span>
                          {totalInvested > 0 && invested > 0 && (
                            <span className="text-xs font-bold" style={{ color: coin.color }}>{pct}%</span>
                          )}
                        </div>
                        <p className="text-xl font-black text-white mt-0.5">{fmt(invested)}<span className="text-sm text-gray-500 font-normal ml-1">원</span></p>
                        {invested > 0 && (
                          <div className="h-1 bg-[#21262D] rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${(invested / INITIAL_CAPITAL) * 100}%`, backgroundColor: coin.color }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => changeAmount(coin.id, -100000)}
                          disabled={invested < 100000}
                          className="py-2 text-sm font-bold rounded-lg bg-[#21262D] text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all disabled:opacity-30"
                        >
                          -10만
                        </button>
                        <button
                          onClick={() => changeAmount(coin.id, 100000)}
                          disabled={remaining < 100000}
                          className="py-2 text-sm font-bold rounded-lg bg-[#21262D] text-gray-300 hover:bg-green-500/20 hover:text-green-400 transition-all disabled:opacity-30"
                        >
                          +10만
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => changeAmount(coin.id, -500000)}
                          disabled={invested < 500000}
                          className="py-2 text-xs font-bold rounded-lg bg-[#21262D] text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all disabled:opacity-30"
                        >
                          -50만
                        </button>
                        <button
                          onClick={() => setMax(coin.id)}
                          disabled={remaining === 0}
                          className="py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-30"
                          style={remaining > 0 ? { borderColor: `${coin.color}50`, color: coin.color, background: `${coin.color}15` } : { borderColor: "#30363D", color: "#666" }}
                        >
                          ALL-IN
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Risk Warning */}
              <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-yellow-500/80 text-xs leading-relaxed">
                  이것은 재미용 모의투자입니다. 실제 코인 투자는 원금 손실 위험이 있으므로 신중하게 결정하세요.
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── STEP: ANALYZING ─── */}
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative w-36 h-36 mb-8">
                <motion.div
                  className="absolute inset-0 border-2 border-green-500/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-2 border-2 border-t-green-400 border-r-emerald-300 border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-6 border-2 border-t-transparent border-r-transparent border-b-green-500 border-l-green-400 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Rocket className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">시장 분석 중...</h2>
              <p className="text-green-400 text-sm animate-pulse">고래들의 움직임을 포착하고 있습니다</p>
              <div className="mt-8 font-mono text-xs text-gray-600 space-y-1">
                <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>
                  &gt; blockchain.scan() ████████░░ 80%
                </motion.p>
                <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
                  &gt; whale.detect() ██████████ 100%
                </motion.p>
                <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}>
                  &gt; market.predict() ██████░░░░ 60%
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* ─── STEP: RESULT ─── */}
          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              {/* Capture zone */}
              <div ref={shareRef} className="space-y-5 bg-[#0D1117] p-4 rounded-2xl">
                {/* Event Banner */}
                <div className={`p-5 rounded-2xl border text-center ${
                  result.event.type === "pump"
                    ? "bg-green-500/10 border-green-500/30"
                    : result.event.type === "scam"
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}>
                  <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${
                    result.event.type === "pump" ? "text-green-400" :
                    result.event.type === "scam" ? "text-orange-400" : "text-red-400"
                  }`}>
                    {result.event.type === "pump" ? "🚀 TO THE MOON!" :
                     result.event.type === "scam" ? "⚠️ RUG PULL 의심!" : "📉 마켓 크래시!"}
                  </h2>
                  <p className="text-gray-300 font-bold">{result.event.desc}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "최종 평가액", value: `${fmt(result.finalValue)}원`, color: isProfit ? "text-green-400" : "text-red-400" },
                    { label: "수익/손실", value: `${result.profit >= 0 ? "+" : ""}${fmt(result.profit)}원`, color: isProfit ? "text-green-400" : "text-red-400" },
                    { label: "수익률", value: `${result.profitRate >= 0 ? "+" : ""}${result.profitRate.toFixed(1)}%`, color: isProfit ? "text-green-400" : "text-red-400" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                      <p className={`text-lg sm:text-xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData}>
                      <XAxis dataKey="time" stroke="#555" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#555" tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v / 10000)}만`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", borderRadius: "8px" }}
                        labelStyle={{ color: "#888" }}
                        formatter={(v: number) => [`${fmt(Math.round(v))}원`, "평가액"]}
                      />
                      <ReferenceLine y={totalInvested} stroke="#555" strokeDasharray="4 4" label={{ value: "투자액", fill: "#666", fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isProfit ? "#4ade80" : "#f87171"}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: isProfit ? "#4ade80" : "#f87171" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Coin breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  {coins.map(coin => {
                    const Icon = coin.icon;
                    const orig = investments[coin.id];
                    const final = result.portfolio[coin.id];
                    const diff = final - orig;
                    const diffPct = orig > 0 ? ((diff / orig) * 100).toFixed(0) : "—";
                    return (
                      <div key={coin.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 text-center">
                        <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: coin.color }} />
                        <p className="text-gray-400 text-xs font-bold">{coin.name}</p>
                        <p className="text-white text-sm font-black mt-1">{fmt(final)}<span className="text-gray-500 text-xs">원</span></p>
                        {orig > 0 && (
                          <p className={`text-xs font-bold mt-0.5 ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {diff >= 0 ? "+" : ""}{diffPct}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Share section */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5">
                <p className="text-sm font-bold text-center mb-1">🚀 친구에게 자랑하기</p>
                <p className="text-xs text-gray-500 text-center mb-4">결과를 공유하고 친구들도 도전하게 해보세요!</p>
                <button
                  onClick={handleSaveImage}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-gray-300 hover:text-white transition-all text-sm font-bold"
                >
                  <Download className="w-5 h-5" />
                  이미지 저장
                </button>
                <ShareButtons
                  title={`밈코인 모의투자 결과: 수익률 ${result.profitRate >= 0 ? "+" : ""}${result.profitRate.toFixed(1)}% ${result.profit >= 0 ? "🚀" : "💸"}`}
                  description="100만원으로 인생역전? CRYPTO PANIC 밈코인 모의투자"
                  getShareImage={captureResultImage}
                  className="justify-center mt-4"
                />
              </div>

              <button
                onClick={reset}
                className="w-full py-4 bg-[#161B22] border border-[#30363D] hover:border-green-500/40 text-gray-300 hover:text-green-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> 다시 투자하기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#161B22] border border-[#30363D] text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 z-50 whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4 text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
