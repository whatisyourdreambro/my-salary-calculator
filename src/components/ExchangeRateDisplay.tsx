// src/components/ExchangeRateDisplay.tsx
"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import CountUp from "react-countup";
import html2canvas from "html2canvas";
import {
  Loader,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  ArrowRight,
  Info,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import CustomBarLabel from "./CustomBarLabel";
import FinancialKnowledgeArchive from "./FinancialKnowledgeArchive";
import CurrencyInput from "./CurrencyInput";

const formatNumber = (num: number) => {
  if (isNaN(num)) return "0";
  return num.toLocaleString();
};
const parseNumber = (str: string) => Number(String(str).replace(/,/g, ""));

const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const currencies = [
  { id: "KRW", name: "대한민국 원", flag: "🇰🇷", symbol: "₩" },
  { id: "USD", name: "미국 달러", flag: "🇺🇸", symbol: "$" },
  { id: "JPY", name: "일본 엔", flag: "🇯🇵", symbol: "¥" },
  { id: "EUR", name: "유로", flag: "🇪🇺", symbol: "€" },
  { id: "CNY", name: "중국 위안", flag: "🇨🇳", symbol: "¥" },
  { id: "GBP", name: "영국 파운드", flag: "🇬🇧", symbol: "£" },
];

const initialPastDate = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return toInputDateString(date);
})();

export default function ExchangeRateImpactCalculator() {
  const searchParams = useSearchParams();
  const reportRef = useRef<HTMLDivElement>(null);

  const [assetAmount, setAssetAmount] = useState(() =>
    formatNumber(parseNumber(searchParams.get("assetAmount") || "40000000"))
  );
  const [assetCurrency, setAssetCurrency] = useState(
    () => searchParams.get("assetCurrency") || "KRW"
  );
  const [comparisonCurrency, setComparisonCurrency] = useState(
    () => searchParams.get("comparisonCurrency") || "USD"
  );
  const [pastDate, setPastDate] = useState(
    () => searchParams.get("pastDate") || initialPastDate
  );
  const [isManual, setIsManual] = useState(
    () => searchParams.get("isManual") === "true"
  );
  const [manualPastRateStr, setManualPastRateStr] = useState(
    () => searchParams.get("manualPastRateStr") || ""
  );
  const [manualCurrentRateStr, setManualCurrentRateStr] = useState(
    () => searchParams.get("manualCurrentRateStr") || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [useDxy, setUseDxy] = useState(false);
  const [pastDxy, setPastDxy] = useState("105.00");
  const [currentDxy, setCurrentDxy] = useState("108.00");

  useEffect(() => {
    if (assetCurrency === comparisonCurrency) {
      const newComparison = currencies.find((c) => c.id !== assetCurrency);
      if (newComparison) {
        setComparisonCurrency(newComparison.id);
      }
    }
  }, [assetCurrency, comparisonCurrency]);

  const fetchRates = useCallback(async () => {
    if (isManual || useDxy) {
      setIsLoading(false);
      return;
    }
    const from = comparisonCurrency;
    const to = assetCurrency;

    if (from === to) {
      setManualPastRateStr("1.0000");
      setManualCurrentRateStr("1.0000");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [pastRes, currentRes] = await Promise.all([
        fetch(`https://api.frankfurter.app/${pastDate}?from=${from}&to=${to}`),
        fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`),
      ]);

      if (!pastRes.ok || !currentRes.ok)
        throw new Error("환율 정보를 불러오는 데 실패했습니다.");

      const pastData = await pastRes.json();
      const currentData = await currentRes.json();

      const pastRateValue = pastData.rates[to];
      const currentRateValue = currentData.rates[to];

      setManualPastRateStr(pastRateValue?.toFixed(4) || "0");
      setManualCurrentRateStr(currentRateValue?.toFixed(4) || "0");
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [pastDate, assetCurrency, comparisonCurrency, isManual, useDxy]);

  useEffect(() => {
    if (useDxy) {
      if (assetCurrency === "KRW" && comparisonCurrency === "USD") {
        const pDxy = parseFloat(pastDxy) || 0;
        const cDxy = parseFloat(currentDxy) || 0;
        const pRate = parseFloat(manualPastRateStr) || 1300;
        if (pDxy > 0 && cDxy > 0 && pRate > 0) {
          const estimatedRate = pRate * (cDxy / pDxy);
          setManualCurrentRateStr(estimatedRate.toFixed(4));
        }
      }
    } else {
      fetchRates();
    }
  }, [
    useDxy,
    pastDxy,
    currentDxy,
    manualPastRateStr,
    fetchRates,
    assetCurrency,
    comparisonCurrency,
  ]);

  useEffect(() => {
    if (!searchParams.get("assetAmount")) {
      fetchRates();
    } else {
      setIsLoading(false);
    }
  }, [fetchRates, searchParams]);

  const { analysis, resultSymbol } = useMemo(() => {
    const pRate = parseFloat(manualPastRateStr) || 0;
    const cRate = parseFloat(manualCurrentRateStr) || 0;
    const amount = parseNumber(assetAmount);

    const finalResultSymbol =
      currencies.find((c) => c.id === assetCurrency)?.symbol || "₩";

    let res;

    if (!amount || !pRate || !cRate) {
      res = {
        changeAmount: 0,
        changePercentage: 0,
        pastValue: amount,
        currentValue: amount,
      };
    } else {
      const pastValue = amount;
      const currentValue = amount * (pRate / cRate);
      const changeAmount = currentValue - pastValue;

      res = {
        changeAmount: changeAmount,
        changePercentage: pastValue > 0 ? (changeAmount / pastValue) * 100 : 0,
        pastValue: pastValue,
        currentValue: currentValue,
      };
    }

    const roundValue = (val: number) =>
      Number.isInteger(val) ? val : parseFloat(val.toFixed(2));

    return {
      analysis: {
        changeAmount: roundValue(res.changeAmount),
        changePercentage: parseFloat(res.changePercentage.toFixed(2)),
        pastValue: roundValue(res.pastValue),
        currentValue: roundValue(res.currentValue),
      },
      resultSymbol: finalResultSymbol,
    };
  }, [assetAmount, assetCurrency, manualPastRateStr, manualCurrentRateStr]);

  const chartData = [
    { name: "과거", value: analysis.pastValue },
    { name: "현재", value: analysis.currentValue },
  ];

  const currentValueColor = analysis.changeAmount >= 0 ? "#0052ff" : "#e11d48";

  const handleShareLink = async () => {
    const shareUrl = "https://www.moneysalary.com/?tab=exchange";
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("공유 링크가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("링크 공유 실패:", err);
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleShareImage = () => {
    const element = reportRef.current;
    if (!element) return;

    html2canvas(element, {
      scale: 2,
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#1e1e1e"
        : "#ffffff",
      useCORS: true,
      windowHeight: element.scrollHeight,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Moneysalary_환율분석결과.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const handleReset = () => {
    setAssetAmount(formatNumber(40000000));
    setAssetCurrency("KRW");
    setComparisonCurrency("USD");
    setPastDate(initialPastDate);
    setIsManual(false);
    setUseDxy(false);
    setManualPastRateStr("");
    setManualCurrentRateStr("");
    setError(null);
    fetchRates();
  };

  return (
    <>
      <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border mt-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-center mb-8">
          환율 변동에 따른 내 자산 가치 변화
        </h2>

        <div className="p-4" ref={reportRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-6">
              <CurrencyInput
                label="분석 자산"
                value={assetAmount}
                onValueChange={setAssetAmount}
                quickAmounts={[10000000, 1000000]}
                selectedCurrency={assetCurrency}
                onCurrencyChange={setAssetCurrency}
                currencies={currencies}
              />

              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  비교 통화
                </label>
                <select
                  value={comparisonCurrency}
                  onChange={(e) => setComparisonCurrency(e.target.value)}
                  className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700"
                >
                  {currencies
                    .filter((c) => c.id !== assetCurrency)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name} ({c.id})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  기준 과거 시점
                </label>
                <input
                  type="date"
                  value={pastDate}
                  onChange={(e) => setPastDate(e.target.value)}
                  disabled={isManual || useDxy}
                  className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    환율 (1 {comparisonCurrency} 당 {assetCurrency})
                  </label>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsManual(!isManual)}
                  >
                    <span className="text-xs font-semibold">수동입력</span>
                    <input
                      type="checkbox"
                      checked={isManual}
                      readOnly
                      className="h-4 w-4 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="과거 환율"
                    value={manualPastRateStr}
                    onChange={(e) => setManualPastRateStr(e.target.value)}
                    disabled={!isManual}
                    className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 disabled:opacity-50 text-center font-mono"
                  />
                  <span className="font-bold text-primary">→</span>
                  <input
                    type="text"
                    placeholder="현재/미래 환율"
                    value={manualCurrentRateStr}
                    onChange={(e) => setManualCurrentRateStr(e.target.value)}
                    disabled={!isManual || useDxy}
                    className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 disabled:opacity-50 text-center font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    달러 인덱스 (DXY)
                  </label>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setUseDxy(!useDxy)}
                  >
                    <span className="text-xs font-bold text-primary">
                      DXY로 환율 추정
                    </span>
                    <input
                      type="checkbox"
                      checked={useDxy}
                      readOnly
                      className="h-4 w-4 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="과거 DXY"
                    value={pastDxy}
                    onChange={(e) => setPastDxy(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 text-center font-mono"
                  />
                  <span className="font-bold text-primary">→</span>
                  <input
                    type="text"
                    placeholder="현재/미래 DXY"
                    value={currentDxy}
                    onChange={(e) => setCurrentDxy(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 text-center font-mono"
                  />
                </div>
                {useDxy && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        &apos;DXY로 환율 추정하기&apos;:
                      </span>{" "}
                      달러 가치 변화율을 &apos;과거 환율&apos;에 적용하여
                      &apos;현재/미래 환율&apos;을 추정합니다. 시장의 큰 흐름을
                      예측하는 참고 지표로 활용할 수 있습니다.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* === 결과부 === */}
            <div className="flex flex-col justify-center">
              {isLoading ? (
                <div className="text-center">
                  <Loader
                    className="animate-spin mx-auto text-primary"
                    size={48}
                  />
                  <p className="mt-4 font-semibold">
                    환율 정보를 불러오는 중...
                  </p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
                  <div>
                    <h3 className="font-bold">로딩 실패</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in-up h-full flex flex-col">
                  <div
                    className={`p-6 rounded-xl text-center transition-colors duration-300 grow flex flex-col justify-center ${
                      analysis.changeAmount >= 0
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : "bg-red-50 dark:bg-red-900/30"
                    }`}
                  >
                    <p className="font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {`과거 환율 ${manualPastRateStr} → 현재 ${manualCurrentRateStr} 기준`}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-2">
                      <div className="text-lg sm:text-2xl font-bold text-gray-500">
                        {`${resultSymbol}${formatNumber(analysis.pastValue)}`}
                      </div>
                      <ArrowRight
                        className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${
                          analysis.changeAmount >= 0
                            ? "text-primary"
                            : "text-danger"
                        }`}
                      />
                      <div
                        className={`text-3xl sm:text-4xl font-bold ${
                          analysis.changeAmount >= 0
                            ? "text-primary"
                            : "text-danger"
                        }`}
                      >
                        <CountUp
                          end={analysis.currentValue}
                          prefix={`${resultSymbol}`}
                          separator=","
                          decimals={
                            Number.isInteger(analysis.currentValue) ? 0 : 2
                          }
                        />
                      </div>
                    </div>
                    <div
                      className={`font-semibold text-base sm:text-lg ${
                        analysis.changeAmount >= 0
                          ? "text-primary"
                          : "text-danger"
                      }`}
                    >
                      <CountUp
                        end={analysis.changeAmount}
                        prefix={analysis.changeAmount >= 0 ? "▲ " : "▼ "}
                        suffix={` ${resultSymbol} (${analysis.changePercentage}%)`}
                        separator=","
                        decimals={
                          Number.isInteger(analysis.changeAmount) ? 0 : 2
                        }
                      />
                    </div>
                  </div>
                  <div className="h-48 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 10, right: 90 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          width={70}
                          stroke="currentColor"
                        />
                        <Tooltip
                          formatter={(value: number) =>
                            `${resultSymbol}${formatNumber(value)}`
                          }
                          cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        />
                        <Bar dataKey="value" barSize={30} radius={[0, 8, 8, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? "#a0aec0" : currentValueColor}
                            />
                          ))}
                          <LabelList
                            dataKey="value"
                            content={<CustomBarLabel />}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleReset}
            className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> 초기화
          </button>
          <button
            onClick={handleShareLink}
            className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
          >
            <LinkIcon size={18} /> 링크로 공유
          </button>
          <button
            onClick={handleShareImage}
            className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
          >
            <ImageIcon size={18} /> 이미지로 저장
          </button>
        </div>
      </div>

      <FinancialKnowledgeArchive />
    </>
  );
}
