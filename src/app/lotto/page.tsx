// src/app/lotto/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  generateLottoSets,
  type GenerationStrategy,
} from "@/lib/lottoGenerator";
import { Settings, Sparkles, Loader, Clover, RefreshCw } from "lucide-react";
import AdUnit from "@/components/AdUnit";

// 숫자 범위에 따라 색상 클래스를 반환하는 헬퍼 함수
const getNumberColorClass = (number: number): string => {
  if (number >= 1 && number <= 10)
    return "bg-yellow-400 text-black shadow-inner shadow-black/20";
  if (number >= 11 && number <= 20)
    return "bg-blue-500 text-white shadow-inner shadow-black/20";
  if (number >= 21 && number <= 30)
    return "bg-red-500 text-white shadow-inner shadow-black/20";
  if (number >= 31 && number <= 40)
    return "bg-gray-600 text-white shadow-inner shadow-black/20";
  if (number >= 41 && number <= 45)
    return "bg-green-500 text-white shadow-inner shadow-black/20";
  return "bg-gray-200 text-gray-800 shadow-inner shadow-black/20";
};

type LottoSetAnalysis = {
  sum: number;
  oddCount: number;
  evenCount: number;
  highCount: number;
  lowCount: number;
};

type GeneratedSet = {
  numbers: number[];
  analysis: LottoSetAnalysis;
};

export default function LottoPage() {
  const [numberOfSets, setNumberOfSets] = useState(5);
  const [includeInput, setIncludeInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [strategy, setStrategy] = useState<GenerationStrategy>("random");
  const [generatedSets, setGeneratedSets] = useState<GeneratedSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [revealedSets, setRevealedSets] = useState<GeneratedSet[]>([]);

  const parseNumbers = (input: string) =>
    input
      .split(/[, ]+/)
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 45);

  const includeNumbers = useMemo(
    () => parseNumbers(includeInput),
    [includeInput]
  );
  const excludeNumbers = useMemo(
    () => parseNumbers(excludeInput),
    [excludeInput]
  );

  const handleGenerate = () => {
    setIsLoading(true);
    setGeneratedSets([]);
    setRevealedSets([]);

    setTimeout(() => {
      try {
        const sets = generateLottoSets(
          numberOfSets,
          includeNumbers,
          excludeNumbers,
          strategy
        );
        const analyzedSets = sets.map((set) => ({
          numbers: set,
          analysis: {
            sum: set.reduce((a, b) => a + b, 0),
            oddCount: set.filter((n) => n % 2 !== 0).length,
            evenCount: set.filter((n) => n % 2 === 0).length,
            highCount: set.filter((n) => n > 22).length,
            lowCount: set.filter((n) => n <= 22).length,
          },
        }));
        setGeneratedSets(analyzedSets);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }, 1500); // 1.5초 동안 애니메이션 보여주기
  };

  useEffect(() => {
    if (generatedSets.length > 0) {
      let delay = 0;
      generatedSets.forEach((set) => {
        setTimeout(() => {
          setRevealedSets((prev) => [...prev, set]);
        }, delay);
        delay += 500; // 각 세트가 0.5초 간격으로 나타남
      });
    }
  }, [generatedSets]);

  const handleReset = () => {
    setNumberOfSets(5);
    setIncludeInput("");
    setExcludeInput("");
    setStrategy("random");
    setGeneratedSets([]);
    setRevealedSets([]);
    setShowAdvanced(false);
  };

  return (
    <main className="w-full min-h-screen bg-background text-foreground overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-30 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-green-500 rounded-full blur-3xl animate-pulse"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-full bg-green-500/10 mb-6 border border-green-500/20 animate-bounce-slow">
            <Clover className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
            행운의 로또 생성기
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            과학적인 알고리즘으로 당신의 행운을 찾아드립니다.<br />
            이번 주 주인공은 바로 당신입니다.
          </p>
        </div>

        {/* Ad Unit: Top */}
        <div className="mb-12 max-w-3xl mx-auto">
          <AdUnit slotId="1122334455" format="auto" label="Lotto Top Ad" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card/50 backdrop-blur-xl p-6 rounded-3xl border border-border shadow-xl">
              <div className="space-y-6">
                <div>
                  <label htmlFor="sets" className="block text-sm font-bold mb-2 text-foreground">
                    생성할 게임 수
                  </label>
                  <select
                    id="sets"
                    value={numberOfSets}
                    onChange={(e) => setNumberOfSets(Number(e.target.value))}
                    className="w-full p-4 rounded-xl bg-background border-2 border-border focus:border-green-500 transition-colors font-medium"
                  >
                    {[1, 2, 3, 4, 5, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}게임
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="strategy" className="block text-sm font-bold mb-2 text-foreground">
                    생성 전략
                  </label>
                  <select
                    id="strategy"
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as GenerationStrategy)}
                    className="w-full p-4 rounded-xl bg-background border-2 border-border focus:border-green-500 transition-colors font-medium"
                  >
                    <option value="random">🎲 랜덤 균형 (추천)</option>
                    <option value="balancedOddEven">⚖️ 홀짝 균형</option>
                    <option value="balancedHighLow">📈 고저 균형</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-border hover:border-green-500 hover:text-green-500 transition-all flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground"
                >
                  <Settings size={16} />
                  {showAdvanced ? "고급 설정 닫기" : "제외/포함 숫자 설정"}
                </button>

                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-secondary/30 rounded-xl animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-muted-foreground">포함할 숫자 (최대 5개)</label>
                      <input
                        type="text"
                        value={includeInput}
                        onChange={(e) => setIncludeInput(e.target.value)}
                        placeholder="예: 7, 15"
                        className="w-full p-3 rounded-lg bg-background border border-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-muted-foreground">제외할 숫자</label>
                      <input
                        type="text"
                        value={excludeInput}
                        onChange={(e) => setExcludeInput(e.target.value)}
                        placeholder="예: 4, 44"
                        className="w-full p-3 rounded-lg bg-background border border-border text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                  >
                    {isLoading ? <Loader className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    번호 생성
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-4 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"
                    aria-label="초기화"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Winning Numbers (Mock) */}
            <div className="bg-card/50 backdrop-blur-xl p-6 rounded-3xl border border-border shadow-lg">
              <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">지난주 당첨 번호</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {[3, 11, 16, 24, 32, 45].map((num) => (
                  <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getNumberColorClass(num)}`}>
                    {num}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                  +
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getNumberColorClass(7)}`}>
                  7
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2">
            <div className="bg-card/30 backdrop-blur-xl min-h-[600px] rounded-3xl border border-border p-6 sm:p-8 relative overflow-hidden">
              {/* Slot Machine Effect Container */}
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20">
                  <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-green-500 animate-pulse">
                      LUCKY
                    </div>
                  </div>
                  <p className="text-xl font-bold animate-pulse text-green-500">행운을 모으는 중...</p>
                </div>
              ) : revealedSets.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Sparkles className="text-yellow-500" />
                      생성 결과
                    </h2>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {revealedSets.map((set, index) => (
                      <div
                        key={index}
                        className="bg-background border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all animate-in slide-in-from-bottom-4 fade-in duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-muted-foreground/50 text-2xl w-8 text-center">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <div className="flex gap-2">
                              {set.numbers.map((num) => (
                                <div
                                  key={num}
                                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl shadow-lg transform transition-transform hover:scale-110 hover:-translate-y-1 ${getNumberColorClass(num)}`}
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 text-[10px] sm:text-xs font-bold uppercase text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                            <div className="flex flex-col items-center">
                              <span>SUM</span>
                              <span className="text-foreground">{set.analysis.sum}</span>
                            </div>
                            <div className="w-px h-full bg-border" />
                            <div className="flex flex-col items-center">
                              <span>ODD</span>
                              <span className="text-blue-500">{set.analysis.oddCount}</span>
                            </div>
                            <div className="w-px h-full bg-border" />
                            <div className="flex flex-col items-center">
                              <span>HIGH</span>
                              <span className="text-red-500">{set.analysis.highCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ad Unit: Result Bottom */}
                  <div className="mt-8">
                    <AdUnit slotId="5566778899" format="rectangle" label="Lotto Result Ad" />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <Clover className="w-24 h-24 mb-4" />
                  <p className="text-xl font-medium">왼쪽에서 옵션을 선택하고<br />번호를 생성해보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
