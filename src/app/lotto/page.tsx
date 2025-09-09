"use client";

import { useState, useMemo } from "react";
import { generateLottoSets } from "@/lib/lottoGenerator";

// 숫자 범위에 따라 색상 클래스를 반환하는 헬퍼 함수
const getNumberColorClass = (number: number): string => {
  if (number >= 1 && number <= 10) return "bg-yellow-400 text-white";
  if (number >= 11 && number <= 20) return "bg-blue-500 text-white";
  if (number >= 21 && number <= 30) return "bg-red-500 text-white";
  if (number >= 31 && number <= 40) return "bg-gray-500 text-white";
  if (number >= 41 && number <= 45) return "bg-green-500 text-white";
  return "bg-gray-200 text-gray-800";
};

export default function LottoPage() {
  const [numberOfSets, setNumberOfSets] = useState(5);
  const [includeInput, setIncludeInput] = useState("");
  const [generatedSets, setGeneratedSets] = useState<number[][]>([]);

  const fixedNumbers = useMemo(() => {
    return includeInput
      .split(",")
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 45);
  }, [includeInput]);

  const handleGenerate = () => {
    const sets = generateLottoSets(numberOfSets, fixedNumbers);
    setGeneratedSets(sets);
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          🍀 행운의 로또 번호 생성기
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          당신의 행운을 시험해 보세요.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sets"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              생성 개수
            </label>
            <input
              type="number"
              id="sets"
              value={numberOfSets}
              onChange={(e) =>
                setNumberOfSets(Math.max(1, Number(e.target.value)))
              }
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              min="1"
            />
          </div>
          <div>
            <label
              htmlFor="include"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              포함할 숫자 (쉼표로 구분)
            </label>
            <input
              type="text"
              id="include"
              value={includeInput}
              onChange={(e) => setIncludeInput(e.target.value)}
              placeholder="예: 7, 15, 45"
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          번호 생성하기
        </button>
      </div>

      {generatedSets.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            생성 결과
          </h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="p-2 w-1/6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  No.
                </th>
                <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  행운 번호
                </th>
              </tr>
            </thead>
            <tbody>
              {generatedSets.map((set, index) => (
                <tr key={index} className="border-t dark:border-gray-700">
                  <td className="p-2 font-semibold">{index + 1}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {set.map((num) => (
                        <div
                          key={num}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${getNumberColorClass(
                            num
                          )}`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
