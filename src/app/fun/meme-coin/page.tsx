// src/app/fun/meme-coin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Dog, Cat, Ghost, Rocket, TrendingDown, Skull } from "lucide-react";
import AdUnit from "@/components/AdUnit";

const initialCapital = 1000000;

const coins = [
  { id: "doge", name: "댕댕코인", icon: Dog, description: "귀여움으로 세상을 구원할 코인. 커뮤니티가 강력합니다." },
  { id: "cat", name: "냥냥코인", icon: Cat, description: "변덕이 심하지만, 가끔 상상 이상의 잭팟을 터뜨립니다." },
  { id: "ghost", name: "월급루팡코인", icon: Ghost, description: "실체는 없지만, 모두의 염원을 담아 조용히 우상향합니다." },
];

const events = [
  { description: "일론 머스크가 댕댕코인을 언급했습니다!", effect: { doge: 3, cat: 0.8, ghost: 1 } },
  { description: "미국 SEC에서 모든 밈코인을 규제한다는 소문이 돕니다...", effect: { doge: 0.4, cat: 0.5, ghost: 0.6 } },
  { description: "냥냥코인 개발자가 잠적했습니다!", effect: { doge: 1.2, cat: 0.1, ghost: 1.1 } },
  { description: "월급루팡코인, 대기업과 파트너십 체결! (아님)", effect: { doge: 1, cat: 0.9, ghost: 5 } },
  { description: "알 수 없는 이유로 모든 코인이 떡상합니다!", effect: { doge: 2, cat: 2.5, ghost: 1.8 } },
];

const formatNumber = (num: number) => num.toLocaleString();

export default function MemeCoinPage() {
  const [step, setStep] = useState('invest'); // invest, result
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
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const finalPortfolio = Object.entries(investments).reduce((acc, [coinId, amount]) => {
      const multiplier = randomEvent.effect[coinId as keyof typeof randomEvent.effect];
      acc[coinId] = amount * multiplier;
      return acc;
    }, {} as { [key: string]: number });

    const finalValue = Object.values(finalPortfolio).reduce((a, b) => a + b, 0);
    const profit = finalValue - totalInvested;

    const chartData = [
      { time: '시작', value: totalInvested },
      { time: '1달 후', value: finalValue },
    ];

    setResult({ randomEvent, finalPortfolio, finalValue, profit, chartData });
    setStep('result');
  };

  const resetGame = () => {
    setStep('invest');
    setInvestments({ doge: 0, cat: 0, ghost: 0 });
    setResult(null);
  };

  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">밈코인 투자 시뮬레이터</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">100만원으로 인생역전, 혹은 나락. 당신의 선택은?</p>
      </div>

      {/* Ad Unit: Top */}
      <div className="mb-8">
        <AdUnit slotId="8877665544" format="auto" label="Meme Coin Top Ad" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'invest' ? (
          <motion.div key="invest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center p-4 mb-8 bg-secondary rounded-xl">
              <p className="text-muted-foreground">가용 시드머니</p>
              <p className="text-3xl font-bold text-primary">{formatNumber(remainingCapital)}원</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coins.map(coin => (
                <div key={coin.id} className="bg-card p-6 rounded-2xl border border-border text-center flex flex-col">
                  <coin.icon className="w-12 h-12 mx-auto text-primary" />
                  <h3 className="text-2xl font-bold my-2">{coin.name}</h3>
                  <p className="text-sm text-muted-foreground flex-grow">{coin.description}</p>
                  <p className="text-2xl font-bold my-4">{formatNumber(investments[coin.id as keyof typeof investments])}원</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleInvestmentChange(coin.id as keyof typeof investments, -100000)} className="w-full py-2 bg-secondary rounded-lg hover:bg-secondary/80">-10만</button>
                    <button onClick={() => handleInvestmentChange(coin.id as keyof typeof investments, 100000)} className="w-full py-2 bg-secondary rounded-lg hover:bg-secondary/80">+10만</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button onClick={runSimulation} disabled={totalInvested === 0} className="px-12 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                1달 후 결과 확인하기
              </button>
            </div>
          </motion.div>
        ) : (
          result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="p-6 bg-secondary rounded-xl mb-8">
                <p className="text-lg font-semibold">[1달 후 발생한 이벤트]</p>
                <p className="text-xl font-bold text-primary">{result.randomEvent.description}</p>
              </div>
              <div className={`p-8 rounded-2xl shadow-2xl border ${result.profit >= 0 ? 'border-primary' : 'border-destructive'}`}>
                {result.profit >= 0 ? <Rocket className="w-16 h-16 mx-auto text-primary" /> : <Skull className="w-16 h-16 mx-auto text-destructive" />}
                <h2 className="text-3xl font-bold my-2">최종 자산</h2>
                <p className={`text-5xl font-bold ${result.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatNumber(result.finalValue)}원</p>
                <p className={`font-semibold ${result.profit >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                  ({result.profit >= 0 ? '+' : ''}{formatNumber(result.profit)}원 / {((result.profit / totalInvested) * 100).toFixed(2)}%)
                </p>
                <div className="h-64 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData}>
                      <XAxis dataKey="time" />
                      <YAxis hide={true} domain={['dataMin - 100000', 'dataMax + 100000']} />
                      <Tooltip formatter={(value: number) => `${formatNumber(value)} 원`} />
                      <Line type="monotone" dataKey="value" strokeWidth={3} stroke={result.profit >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ad Unit: Result Bottom */}
              <div className="my-8">
                <AdUnit slotId="4455667788" format="auto" label="Meme Coin Result Ad" />
              </div>

              <div className="mt-8 text-center">
                <button onClick={resetGame} className="px-12 py-4 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors">
                  다시하기
                </button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </main>
  );
}
