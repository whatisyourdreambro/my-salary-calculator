// src/app/lotto/page.tsx
"use client";

import { useState, useMemo } from "react";
import {
  generateLottoSets,
  type LottoGenerationMode,
} from "@/lib/lottoGenerator";
import CurrencyInput from "@/components/CurrencyInput";

// 숫자 범위에 따라 색상 클래스를 반환하는 헬퍼 함수
const getNumberColorClass = (number: number): string => {
  if (number >= 1 && number <= 10) return "bg-yellow-400 text-black";
  if (number >= 11 && number <= 20) return "bg-blue-500 text-white";
  if (number >= 21 && number <= 30) return "bg-red-500 text-white";
  if (number >= 31 && number <= 40) return "bg-gray-600 text-white";
  if (number >= 41 && number <= 45) return "bg-green-500 text-white";
  return "bg-gray-200 text-gray-800";
};

const ModeButton = ({
  mode,
  currentMode,
  setMode,
  children,
}: {
  mode: LottoGenerationMode;
  currentMode: LottoGenerationMode;
  setMode: (mode: LottoGenerationMode) => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={() => setMode(mode)}
    className={`flex-1 p-3 rounded-lg font-semibold transition ${
      currentMode === mode
        ? "bg-primary text-white shadow-md"
        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
    }`}
  >
    {children}
  </button>
);

export default function LottoPage() {
  const [numberOfSets, setNumberOfSets] = useState(5);
  const [includeInput, setIncludeInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [salaryInput, setSalaryInput] = useState("3,000,000");
  const [generatedSets, setGeneratedSets] = useState<number[][]>([]);
  const [mode, setMode] = useState<LottoGenerationMode>("random");

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
    try {
      const sets = generateLottoSets({
        count: numberOfSets,
        mode,
        includeNumbers,
        excludeNumbers,
        salary: Number(salaryInput.replace(/,/g, "")),
      });
      setGeneratedSets(sets);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          🍀 행운의 로또 번호 생성기
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          Moneysalary만의 특별한 조합으로 행운을 빌어보세요.
        </p>
      </div>

      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            생성 방식 선택
          </label>
          <div className="flex gap-2">
            <ModeButton mode="random" currentMode={mode} setMode={setMode}>
              완전 랜덤
            </ModeButton>
            <ModeButton mode="statistical" currentMode={mode} setMode={setMode}>
              통계 기반
            </ModeButton>
            <ModeButton mode="salary" currentMode={mode} setMode={setMode}>
              ✨월급 기반
            </ModeButton>
          </div>
        </div>

        {mode === "salary" && (
          <CurrencyInput
            label="나의 월급 또는 원하는 숫자를 입력하세요"
            value={salaryInput}
            onValueChange={setSalaryInput}
            quickAmounts={[1000000, 500000, 100000]}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label htmlFor="sets" className="block text-sm font-medium">
              생성 개수
            </label>
            <input
              type="number"
              id="sets"
              value={numberOfSets}
              onChange={(e) =>
                setNumberOfSets(Math.max(1, Number(e.target.value)))
              }
              className="mt-1 w-full p-2 border rounded-md dark:bg-dark-card dark:border-gray-600"
              min="1"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="include" className="block text-sm font-medium">
              포함할 숫자
            </label>
            <input
              type="text"
              id="include"
              value={includeInput}
              onChange={(e) => setIncludeInput(e.target.value)}
              placeholder="예: 7, 15"
              className="mt-1 w-full p-2 border rounded-md dark:bg-dark-card dark:border-gray-600"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="exclude" className="block text-sm font-medium">
              제외할 숫자
            </label>
            <input
              type="text"
              id="exclude"
              value={excludeInput}
              onChange={(e) => setExcludeInput(e.target.value)}
              placeholder="예: 3, 21"
              className="mt-1 w-full p-2 border rounded-md dark:bg-dark-card dark:border-gray-600"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition text-lg"
        >
          🚀 행운 번호 생성하기
        </button>
      </div>

      {generatedSets.length > 0 && (
        <div className="mt-8 bg-light-card dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4">생성 결과</h2>
          <div className="space-y-4">
            {generatedSets.map((set, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <span className="font-bold text-gray-500 w-8">
                  {String.fromCharCode(65 + index)}
                </span>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  {set.map((num) => (
                    <div
                      key={num}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-inner ${getNumberColorClass(
                        num
                      )}`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
