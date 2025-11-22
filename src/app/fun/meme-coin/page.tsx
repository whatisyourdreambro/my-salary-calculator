"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Dog, Cat, Ghost, Rocket, TrendingDown, TrendingUp, Skull, DollarSign, RefreshCw } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const initialCapital = 1000000;

const coins = [
  { id: "doge", name: "DOGE", fullName: "댕댕코인", icon: Dog, color: "#F1C40F", description: "일론이 트윗하면 화성감. 아니면 지옥감." },
  { id: "cat", name: "CAT", fullName: "냥냥코인", icon: Cat, color: "#E91E63", description: "9개의 목숨을 가진 코인. 죽은 줄 알았지?" },
  { id: "ghost", name: "GHOST", fullName: "루팡코인", icon: Ghost, color: "#9B59B6", description: "실체 없음. 근데 다들 삼. 이게 바로 코인." },
];

const events = [
  { description: "🚀 일론 머스크: 'DOGE to the Moon!'", effect: { doge: 5.0, cat: 0.5, ghost: 0.8 }, type: "pump" },
  { description: "📉 SEC: '모든 밈코인 상장 폐지 검토'", effect: { doge: 0.1, cat: 0.1, ghost: 0.1 }, type: "dump" },
  { description: "💎 냥냥코인 개발자: '러그풀 아닙니다'", effect: { doge: 0.9, cat: 0.01, ghost: 1.1 }, type: "scam" },
  { description: "🔥 루팡코인, 대기업 인수설 (찌라시)", effect: { doge: 0.8, cat: 0.8, ghost: 10.0 }, type: "pump" },
  { description: "🐳 고래의 매집 시작! 전종목 상승!", effect: { doge: 2.0, cat: 2.0, ghost: 2.0 }, type: "pump" },
];

const formatNumber = (num: number) => num.toLocaleString();

export default function MemeCoinPage() {
  const [step, setStep] = useState<'invest' | 'analyzing' | 'result'>('invest');
  const [investments, setInvestments] = useState({ doge: 0, cat: 0, ghost: 0 });
  const [result, setResult] = useState<any>(null);

  const totalInvested = Object.values(investments).reduce((a, b) => a + b, 0);
  const remainingCapital = initialCapital - totalInvested;

  const handleInvestmentChange = (coinId: keyof typeof investments, amount: number) => {
    const currentAmount = investments[coinId];
    const newAmount = currentAmount + amount;
    if (newAmount >= 0 && remainingCapital - amount >= 0) {
      setInvestments(prev => ({ ...prev, [coinId]: newAmount }));
    }
  };

  const runSimulation = () => {
    setStep('analyzing');

    setTimeout(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const finalPortfolio = Object.entries(investments).reduce((acc, [coinId, amount]) => {
        const multiplier = randomEvent.effect[coinId as keyof typeof randomEvent.effect];
        acc[coinId] = Math.floor(amount * multiplier);
        return acc;
      }, {} as { [key: string]: number });

      const finalValue = Object.values(finalPortfolio).reduce((a, b) => a + b, 0);
      const profit = finalValue - totalInvested;
      const profitRate = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

      // Mock chart data
      const chartData = [
        { time: '09:00', value: totalInvested },
        { time: '10:00', value: totalInvested * (0.9 + Math.random() * 0.2) },
        { time: '11:00', value: totalInvested * (0.8 + Math.random() * 0.4) },
        { time: '12:00', value: totalInvested * (0.7 + Math.random() * 0.6) },
        { time: '13:00', value: finalValue },
      ];

      setResult({ randomEvent, finalPortfolio, finalValue, profit, profitRate, chartData });
      setStep('result');
    }, 2500);
  };

  const resetGame = () => {
    setStep('invest');
    setInvestments({ doge: 0, cat: 0, ghost: 0 });
    setResult(null);
  };

  return (
    <main className="w-full min-h-screen bg-black text-green-500 font-mono overflow-hidden relative selection:bg-green-500 selection:text-black">
      {/* Matrix Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,0,.3)_25%,rgba(0,255,0,.3)_26%,transparent_27%,transparent_74%,rgba(0,255,0,.3)_75%,rgba(0,255,0,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,255,0,.3)_25%,rgba(0,255,0,.3)_26%,transparent_27%,transparent_74%,rgba(0,255,0,.3)_75%,rgba(0,255,0,.3)_76%,transparent_77%,transparent)] bg-[size:50px_50px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12 border-b border-green-900/50 pb-8">
          <div className="inline-block px-4 py-1 border border-green-500 rounded-full text-xs mb-4 animate-pulse">
            LIVE MARKET STATUS: EXTREME GREED
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2">
            CRYPTO <span className="text-green-500">PANIC</span>
          </h1>
          <p className="text-green-700 text-lg">100만원으로 인생역전? 가즈아! 🚀</p>
        </div>

        {/* Ad Unit */}
        <div className="mb-8 max-w-3xl mx-auto border border-green-900/30 bg-green-900/5 rounded-lg overflow-hidden">
          <AdUnit slotId="8877665544" format="auto" label="Meme Coin Top Ad" />
        </div>

        <AnimatePresence mode="wait">
          {step === 'invest' && (
            <motion.div
              key="invest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Wallet */}
              <div className="bg-green-900/10 border border-green-500/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-green-700 text-sm uppercase">Available Balance</p>
                  <p className="text-4xl font-bold text-white tracking-tight">{formatNumber(remainingCapital)} KRW</p>
                </div>
                <button
                  onClick={runSimulation}
                  disabled={totalInvested === 0}
                  className="px-8 py-4 bg-green-600 hover:bg-green-500 text-black font-black text-xl rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]"
                >
                  매수 체결 (BUY)
                </button>
              </div>

              {/* Coins Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coins.map(coin => (
                  <div key={coin.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-green-500/50 transition-colors group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-full" style={{ backgroundColor: `${coin.color}20` }}>
                        <coin.icon className="w-8 h-8" style={{ color: coin.color }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{coin.name}</h3>
                        <p className="text-xs text-zinc-500">{coin.fullName}</p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 min-h-[40px] mb-6">{coin.description}</p>

                    <div className="bg-black/50 p-4 rounded-xl mb-4 border border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">내 보유량</p>
                      <p className="text-xl font-bold text-white">{formatNumber(investments[coin.id as keyof typeof investments])} 원</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleInvestmentChange(coin.id as keyof typeof investments, -100000)}
                        className="py-2 bg-zinc-800 hover:bg-red-900/30 text-red-500 rounded-lg font-bold transition-colors"
                      >
                        -10만
                      </button>
                      <button
                        onClick={() => handleInvestmentChange(coin.id as keyof typeof investments, 100000)}
                        className="py-2 bg-zinc-800 hover:bg-green-900/30 text-green-500 rounded-lg font-bold transition-colors"
                      >
                        +10만
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-32 h-32 mb-8">
                <motion.div
                  className="absolute inset-0 border-4 border-green-500/30 border-t-green-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Rocket className="w-12 h-12 text-green-500 animate-bounce" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">시장 분석 중...</h2>
              <p className="text-green-500 animate-pulse">고래들의 움직임을 포착하고 있습니다</p>

              <div className="mt-8 w-full max-w-md">
                <AdUnit slotId="9988776655" format="rectangle" label="Analyzing Ad" />
              </div>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Event Banner */}
              <div className={`p-6 rounded-2xl border-2 text-center ${result.profit >= 0 ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                <h2 className="text-3xl font-black text-white mb-2">
                  {result.profit >= 0 ? "TO THE MOON! 🚀" : "RUG PULL! 📉"}
                </h2>
                <p className="text-xl font-bold">{result.randomEvent.description}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                  <p className="text-zinc-500 text-sm">최종 평가액</p>
                  <p className={`text-3xl font-bold ${result.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatNumber(result.finalValue)} 원
                  </p>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                  <p className="text-zinc-500 text-sm">수익금</p>
                  <p className={`text-3xl font-bold ${result.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.profit > 0 ? '+' : ''}{formatNumber(result.profit)} 원
                  </p>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                  <p className="text-zinc-500 text-sm">수익률</p>
                  <p className={`text-3xl font-bold ${result.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.profitRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 bg-zinc-900/30 rounded-2xl border border-zinc-800 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(val) => `${val / 10000}만`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                      formatter={(val: number) => formatNumber(Math.round(val))}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={result.profit >= 0 ? '#22c55e' : '#ef4444'}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={20} /> 다시 하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
