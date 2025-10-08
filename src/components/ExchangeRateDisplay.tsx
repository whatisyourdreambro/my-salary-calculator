// src/components/ExchangeRateImpactCalculator.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import CountUp from "react-countup";
import html2canvas from "html2canvas";
import {
  Link as LinkIcon,
  Image as ImageIcon,
  PlusCircle,
  X,
  Award,
} from "lucide-react";
import FinancialKnowledgeArchive from "./FinancialKnowledgeArchive";

const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const currencies = [
  // [수정] 요청하신 대로 원화 기호를 '₩'로 수정했습니다.
  { id: "KRW", name: "대한민국 원", flag: "🇰🇷", symbol: "₩" },
  { id: "USD", name: "미국 달러", flag: "🇺🇸", symbol: "$" },
  { id: "JPY", name: "일본 엔", flag: "🇯🇵", symbol: "¥" },
  { id: "EUR", name: "유로", flag: "🇪🇺", symbol: "€" },
  { id: "CNY", name: "중국 위안", flag: "🇨🇳", symbol: "¥" },
  { id: "GBP", name: "영국 파운드", flag: "🇬🇧", symbol: "£" },
];

interface Scenario {
  id: number;
  title: string;
  pastRate: string;
  currentRate: string;
  useDxy: boolean;
  pastDxy: string;
  currentDxy: string;
}

interface AnalysisResult {
  id: number;
  changeAmount: number;
  changePercentage: number;
  pastValue: number;
  currentValue: number;
}

export default function ExchangeRateImpactCalculator() {
  const reportRef = useRef<HTMLDivElement>(null);

  const [assetAmount, setAssetAmount] = useState(100000000);
  const [assetCurrency, setAssetCurrency] = useState("KRW");
  const [comparisonCurrency, setComparisonCurrency] = useState("USD");
  const [pastDate, setPastDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return toInputDateString(date);
  });

  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 1,
      title: "시나리오 1",
      pastRate: "1416",
      currentRate: "1387",
      useDxy: false,
      pastDxy: "105",
      currentDxy: "103",
    },
  ]);
  const [nextId, setNextId] = useState(2);

  const addScenario = () => {
    if (scenarios.length >= 3) {
      alert("최대 3개까지 시나리오를 추가할 수 있습니다.");
      return;
    }
    setScenarios([
      ...scenarios,
      {
        id: nextId,
        title: `시나리오 ${nextId}`,
        pastRate: "",
        currentRate: "",
        useDxy: false,
        pastDxy: "",
        currentDxy: "",
      },
    ]);
    setNextId(nextId + 1);
  };

  const removeScenario = (id: number) => {
    if (scenarios.length <= 1) {
      alert("최소 1개의 시나리오가 필요합니다.");
      return;
    }
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const updateScenario = (
    id: number,
    field: keyof Omit<Scenario, "id" | "title">,
    value: string | boolean
  ) => {
    setScenarios(
      scenarios.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  useEffect(() => {
    scenarios.forEach((s) => {
      if (s.useDxy) {
        const pDxy = parseFloat(s.pastDxy) || 0;
        const cDxy = parseFloat(s.currentDxy) || 0;
        const pRate = parseFloat(s.pastRate) || 1300;
        if (pDxy > 0 && cDxy > 0) {
          const estimatedRate = pRate * (cDxy / pDxy);
          if (s.currentRate !== estimatedRate.toFixed(4)) {
            setScenarios((scenarios) =>
              scenarios.map((sc) =>
                sc.id === s.id
                  ? { ...sc, currentRate: estimatedRate.toFixed(4) }
                  : sc
              )
            );
          }
        }
      }
    });
  }, [scenarios]);

  const analysisResults: AnalysisResult[] = useMemo(() => {
    return scenarios.map((scenario) => {
      const { pastRate, currentRate } = scenario;
      const isAssetKRW = assetCurrency === "KRW";
      const foreignCurrency = isAssetKRW ? comparisonCurrency : assetCurrency;

      const pRateRaw = parseFloat(pastRate) || 0;
      const cRateRaw = parseFloat(currentRate) || 0;

      const pRate = foreignCurrency === "JPY" ? pRateRaw / 100 : pRateRaw;
      const cRate = foreignCurrency === "JPY" ? cRateRaw / 100 : cRateRaw;

      const amount = assetAmount;

      if (!amount || !pRate || !cRate)
        return {
          id: scenario.id,
          changeAmount: 0,
          changePercentage: 0,
          pastValue: 0,
          currentValue: 0,
        };

      let result;
      if (isAssetKRW) {
        const pastValueInForeign = amount / pRate;
        const currentValueInForeign = amount / cRate;
        const changeInForeign = currentValueInForeign - pastValueInForeign;
        const changeAmount = changeInForeign * cRate;
        result = {
          changeAmount: Math.round(changeAmount),
          changePercentage: amount > 0 ? (changeAmount / amount) * 100 : 0,
          pastValue: Math.round(amount),
          currentValue: Math.round(amount + changeAmount),
        };
      } else {
        const pastValueInKRW = amount * pRate;
        const currentValueInKRW = amount * cRate;
        const changeAmount = currentValueInKRW - pastValueInKRW;
        result = {
          changeAmount: Math.round(changeAmount),
          changePercentage:
            pastValueInKRW > 0 ? (changeAmount / pastValueInKRW) * 100 : 0,
          pastValue: Math.round(pastValueInKRW),
          currentValue: Math.round(currentValueInKRW),
        };
      }
      return { id: scenario.id, ...result };
    });
  }, [assetAmount, assetCurrency, comparisonCurrency, scenarios]);

  const bestScenario = useMemo(() => {
    if (analysisResults.length === 0) return null;
    return analysisResults.reduce((best, current) =>
      current.changeAmount > best.changeAmount ? current : best
    );
  }, [analysisResults]);

  const handleShareLink = async () => {
    const dataToShare = {
      assetAmount: assetAmount.toString(),
      assetCurrency,
      comparisonCurrency,
      pastDate,
      scenarios,
    };
    const encodedData = btoa(JSON.stringify(dataToShare));
    const shareUrl = `${window.location.origin}/share-exchange/${encodedData}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("결과 공유 링크가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("링크 공유 실패:", err);
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleShareImage = () => {
    const element = reportRef.current;
    if (!element) return;
    html2canvas(element, { scale: 2, backgroundColor: null }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Moneysalary_환율분석결과.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <>
      <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border mt-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-center mb-8">
          환율 변동 시나리오별 자산 가치 비교
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <label className="text-sm font-medium">분석 자산</label>
            <select
              value={assetCurrency}
              onChange={(e) => setAssetCurrency(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700"
            >
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">자산 금액</label>
            <input
              type="number"
              value={assetAmount}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setAssetAmount(isNaN(value) ? 0 : value);
              }}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 font-semibold"
            />
          </div>
          <div>
            <label className="text-sm font-medium">비교 통화</label>
            <select
              value={comparisonCurrency}
              onChange={(e) => setComparisonCurrency(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700"
            >
              {currencies
                .filter((c) => c.id !== assetCurrency)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.id}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">기준 과거 시점</label>
            <input
              type="date"
              value={pastDate}
              onChange={(e) => setPastDate(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="p-4 border dark:border-gray-700 rounded-xl space-y-4 relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{scenario.title}</h3>
                {scenarios.length > 1 && (
                  <button
                    onClick={() => removeScenario(scenario.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <div>
                <label className="text-xs font-medium">
                  환율 (1 {comparisonCurrency === "JPY" ? "100" : ""}
                  {comparisonCurrency} 당 KRW)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="과거"
                    value={scenario.pastRate}
                    onChange={(e) =>
                      updateScenario(scenario.id, "pastRate", e.target.value)
                    }
                    className="w-full p-2 text-center border rounded-md dark:bg-gray-800"
                  />
                  <span className="font-bold text-primary">→</span>
                  <input
                    type="text"
                    placeholder="현재/미래"
                    value={scenario.currentRate}
                    onChange={(e) =>
                      updateScenario(scenario.id, "currentRate", e.target.value)
                    }
                    disabled={scenario.useDxy}
                    className="w-full p-2 text-center border rounded-md dark:bg-gray-800 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">
                    달러 인덱스(DXY) 추정
                  </label>
                  <input
                    type="checkbox"
                    checked={scenario.useDxy}
                    onChange={(e) =>
                      updateScenario(scenario.id, "useDxy", e.target.checked)
                    }
                    className="h-4 w-4 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="과거"
                    value={scenario.pastDxy}
                    onChange={(e) =>
                      updateScenario(scenario.id, "pastDxy", e.target.value)
                    }
                    className="w-full p-2 text-center border rounded-md dark:bg-gray-800"
                  />
                  <span className="font-bold text-primary">→</span>
                  <input
                    type="text"
                    placeholder="현재"
                    value={scenario.currentDxy}
                    onChange={(e) =>
                      updateScenario(scenario.id, "currentDxy", e.target.value)
                    }
                    className="w-full p-2 text-center border rounded-md dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          ))}
          {scenarios.length < 3 && (
            <button
              onClick={addScenario}
              className="border-2 border-dashed dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
            >
              <PlusCircle />
              <span className="mt-2 font-semibold">시나리오 추가</span>
            </button>
          )}
        </div>
        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">시나리오별 결과 비교</h2>
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={handleShareLink}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                <LinkIcon size={16} />
                링크로 공유
              </button>
              <button
                onClick={handleShareImage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                <ImageIcon size={16} />
                이미지로 저장
              </button>
            </div>
          </div>
          <div className="space-y-4" ref={reportRef}>
            {analysisResults
              .sort((a, b) => b.changeAmount - a.changeAmount)
              .map((res, index) => {
                const scenario = scenarios.find((s) => s.id === res.id);
                if (!scenario) return null;
                const isBest = res.id === bestScenario?.id;
                const changeAmount = res.changeAmount;
                return (
                  <div
                    key={res.id}
                    className={`p-4 rounded-xl border-2 ${
                      isBest
                        ? "border-primary bg-blue-50 dark:bg-blue-900/30"
                        : "bg-light-card dark:bg-dark-card border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xl font-bold ${
                            isBest ? "text-primary" : ""
                          }`}
                        >
                          {index + 1}위
                        </span>
                        <span className="font-semibold">{scenario.title}</span>
                        {isBest && (
                          <span className="text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Award size={12} /> BEST
                          </span>
                        )}
                      </div>
                      <div className="text-center sm:text-right">
                        <p
                          className={`text-2xl font-bold ${
                            changeAmount >= 0 ? "text-primary" : "text-danger"
                          }`}
                        >
                          {/* [수정] CountUp 컴포넌트 사용법을 개선하여 부호와 화폐 기호를 깔끔하게 표시합니다. */}
                          <CountUp
                            end={Math.abs(changeAmount)}
                            separator=","
                            prefix={changeAmount >= 0 ? "+ " : "- "}
                            suffix=" ₩"
                            duration={0.5}
                          />
                        </p>
                        <p className="text-xs text-gray-500">
                          ({res.changePercentage.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <FinancialKnowledgeArchive />
    </>
  );
}
