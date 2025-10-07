// src/app/lotto/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  generateLottoSets,
  type GenerationStrategy,
} from "@/lib/lottoGenerator";
import { Settings, Sparkles, Loader, Clover, RefreshCw } from "lucide-react";

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
    <main className="w-full min-h-screen bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30">
        {/* 별똥별 효과를 위한 여러개의 div */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <Clover className="mx-auto h-12 w-12 text-green-400 animate-pulse" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-yellow-300">
            행운의 로또 번호 생성기
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            당신의 일상에 특별한 행운을 더해보세요.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sets" className="block text-sm font-medium">
                게임 수
              </label>
              <select
                id="sets"
                value={numberOfSets}
                onChange={(e) => setNumberOfSets(Number(e.target.value))}
                className="mt-1 w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
              >
                {[1, 2, 3, 4, 5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}개
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="strategy" className="block text-sm font-medium">
                생성 전략
              </label>
              <select
                id="strategy"
                value={strategy}
                onChange={(e) =>
                  setStrategy(e.target.value as GenerationStrategy)
                }
                className="mt-1 w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
              >
                <option value="random">랜덤 균형</option>
                <option value="balancedOddEven">홀/짝수 조합</option>
                <option value="balancedHighLow">고/저수 조합</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white"
          >
            <Settings size={16} />
            {showAdvanced ? "고급 설정 닫기" : "고급 설정 열기"}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up">
              <div>
                <label htmlFor="include" className="block text-sm font-medium">
                  포함할 숫자 (최대 5개)
                </label>
                <input
                  type="text"
                  id="include"
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  placeholder="예: 7, 15"
                  className="mt-1 w-full p-2 border rounded-md bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="exclude" className="block text-sm font-medium">
                  제외할 숫자
                </label>
                <input
                  type="text"
                  id="exclude"
                  value={excludeInput}
                  onChange={(e) => setExcludeInput(e.target.value)}
                  placeholder="예: 3, 21"
                  className="mt-1 w-full p-2 border rounded-md bg-gray-800 border-gray-600"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-green-400 to-yellow-400 text-black font-bold rounded-lg hover:opacity-90 transition text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={20} /> 행운 번호 생성
            </button>
            <button
              onClick={handleReset}
              className="p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              aria-label="초기화"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 text-center">
            <Loader className="mx-auto h-12 w-12 animate-spin text-green-400" />
            <p className="mt-4">당신을 위한 행운의 숫자를 찾고 있습니다...</p>
          </div>
        )}

        {revealedSets.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 text-center">생성 결과</h2>
            <div className="space-y-6">
              {revealedSets.map((set, index) => (
                <div
                  key={index}
                  className="bg-white/5 p-4 rounded-xl border border-white/10 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400 w-8">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      {set.numbers.map((num) => (
                        <div
                          key={num}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl transform transition-transform hover:scale-110 ${getNumberColorClass(
                            num
                          )}`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2 text-xs">
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      총합: {set.analysis.sum}
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      홀: {set.analysis.oddCount}
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      짝: {set.analysis.evenCount}
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      저: {set.analysis.lowCount}
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      고: {set.analysis.highCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
