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
  Globe,
  TrendingUp,
  Coffee,
  Sandwich,
  Plane
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
import { motion, AnimatePresence } from "framer-motion";

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
  { id: "KRW", name: "대한민국 원", flag: "🇰🇷", symbol: "₩", rate: 1 },
  { id: "USD", name: "미국 달러", flag: "🇺🇸", symbol: "$", rate: 1400 },
  { id: "JPY", name: "일본 엔", flag: "🇯🇵", symbol: "¥", rate: 9.2 },
  { id: "EUR", name: "유로", flag: "🇪🇺", symbol: "€", rate: 1500 },
  { id: "CNY", name: "중국 위안", flag: "🇨🇳", symbol: "¥", rate: 195 },
  { id: "GBP", name: "영국 파운드", flag: "🇬🇧", symbol: "£", rate: 1750 },
];

const initialPastDate = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return toInputDateString(date);
})();

// Mock Data for Purchasing Power (Big Mac Index / Coffee Index)
const purchasingPowerData = {
  KRW: { bigMac: 6900, coffee: 4500 },
  USD: { bigMac: 5.69, coffee: 5.50 }, // $5.69 * 1400 = ~8000 KRW
  JPY: { bigMac: 450, coffee: 400 },   // 450 * 9.2 = ~4140 KRW
  EUR: { bigMac: 5.30, coffee: 4.50 },
  CNY: { bigMac: 24.0, coffee: 30.0 },
  GBP: { bigMac: 4.19, coffee: 3.50 },
};

const CurrencyTicker = () => (
  <div className="w-full overflow-hidden bg-primary/5 border-y border-primary/10 py-2 mb-8">
    <motion.div
      className="flex whitespace-nowrap gap-8"
      animate={{ x: [0, -1000] }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
    >
      {[...currencies, ...currencies, ...currencies].map((c, i) => (
        <div key={i} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="text-lg">{c.flag}</span>
          <span>{c.id}</span>
          <span className="text-primary font-bold">{c.rate.toLocaleString()}</span>
          <span className="text-xs text-emerald-500">▲ 0.5%</span>
        </div>
      ))}
    </motion.div>
  </div>
);

export default function ExchangeRateImpactCalculator() {
  const searchParams = useSearchParams();
  const reportRef = useRef<HTMLDivElement>(null);

  const [assetAmount, setAssetAmount] = useState(() =>
    formatNumber(parseNumber(searchParams.get("assetAmount") || "60000000"))
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
        setComparisonCurrency(newComparison?.id || "USD");
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

  const { analysis, resultSymbol, purchasingPower } = useMemo(() => {
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

    // Purchasing Power Calculation
    // Convert current asset amount to comparison currency
    const convertedAmount = amount / cRate; // Amount in Comparison Currency
    const compCurrencyData = purchasingPowerData[comparisonCurrency as keyof typeof purchasingPowerData];

    const bigMacs = compCurrencyData ? convertedAmount / compCurrencyData.bigMac : 0;
    const coffees = compCurrencyData ? convertedAmount / compCurrencyData.coffee : 0;

    return {
      analysis: {
        changeAmount: roundValue(res.changeAmount),
        changePercentage: parseFloat(res.changePercentage.toFixed(2)),
        pastValue: roundValue(res.pastValue),
        currentValue: roundValue(res.currentValue),
      },
      resultSymbol: finalResultSymbol,
      purchasingPower: {
        bigMacs: Math.floor(bigMacs),
        coffees: Math.floor(coffees),
      }
    };
  }, [assetAmount, assetCurrency, manualPastRateStr, manualCurrentRateStr, comparisonCurrency]);

  const chartData = [
    { name: "과거", value: analysis.pastValue },
    { name: "현재", value: analysis.currentValue },
  ];

  const currentValueColor = analysis.changeAmount >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

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
    setAssetAmount(formatNumber(60000000));
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

  const inputStyle = "w-full p-3 mt-1 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50 text-foreground";
  const textInputStyle = `${inputStyle} text-center font-mono`;

  return (
    <div className="animate-fade-in-up">
      <CurrencyTicker />

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 mb-4">
            <Globe className="w-6 h-6 text-cyan-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Global Salary Intelligence
          </h2>
          <p className="text-zinc-400">환율 변동에 따른 내 연봉의 진짜 가치를 확인하세요.</p>
        </div>

        <div className="p-4" ref={reportRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <CurrencyInput
                  label="연봉 / 자산 입력"
                  value={assetAmount}
                  onValueChange={setAssetAmount}
                  quickAmounts={[10000000, 5000000]}
                  selectedCurrency={assetCurrency}
                  onCurrencyChange={setAssetCurrency}
                  currencies={currencies}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">비교 통화</label>
                  <select
                    value={comparisonCurrency}
                    onChange={(e) => setComparisonCurrency(e.target.value)}
                    className={inputStyle}
                  >
                    {currencies
                      .filter((c) => c.id !== assetCurrency)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.flag} {c.name} ({c.id})</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1 block">기준 과거 시점</label>
                  <input
                    type="date"
                    value={pastDate}
                    onChange={(e) => setPastDate(e.target.value)}
                    disabled={isManual || useDxy}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2 p-4 border border-white/10 rounded-2xl bg-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-400">환율 (1 {comparisonCurrency} 당 {assetCurrency})</label>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" onClick={() => setIsManual(!isManual)}>
                    <span className="text-xs font-semibold">수동입력</span>
                    <div className={`w-4 h-4 rounded border ${isManual ? 'bg-primary border-primary' : 'border-zinc-500'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="과거 환율" value={manualPastRateStr} onChange={(e) => setManualPastRateStr(e.target.value)} disabled={!isManual} className={textInputStyle} />
                  <ArrowRight className="text-zinc-500" />
                  <input type="text" placeholder="현재 환율" value={manualCurrentRateStr} onChange={(e) => setManualCurrentRateStr(e.target.value)} disabled={!isManual || useDxy} className={textInputStyle} />
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div className="flex flex-col justify-center">
              {isLoading ? (
                <div className="text-center py-20">
                  <Loader className="animate-spin mx-auto text-primary mb-4" size={48} />
                  <p className="font-semibold text-zinc-400">글로벌 데이터를 분석 중입니다...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full p-8 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="font-bold text-red-400 mb-2">데이터 로드 실패</h3>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 h-full flex flex-col">
                  {/* Main Result Card */}
                  <div className={`p-8 rounded-3xl text-center transition-all duration-500 border ${analysis.changeAmount >= 0
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-rose-500/10 border-rose-500/20"
                    }`}>
                    <p className="font-medium text-sm text-zinc-400 mb-4">
                      환율 변동으로 인한 가치 변화
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-2">
                      <span className="text-2xl font-bold text-zinc-500 line-through decoration-zinc-500/50">
                        {resultSymbol}{formatNumber(analysis.pastValue)}
                      </span>
                      <ArrowRight className="text-zinc-600" />
                      <span className={`text-4xl sm:text-5xl font-black ${analysis.changeAmount >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}>
                        <CountUp
                          end={analysis.currentValue}
                          prefix={resultSymbol}
                          separator=","
                          decimals={0}
                        />
                      </span>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold ${analysis.changeAmount >= 0
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                      }`}>
                      {analysis.changeAmount >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                      <CountUp
                        end={Math.abs(analysis.changeAmount)}
                        prefix={analysis.changeAmount >= 0 ? "+" : "-"}
                        separator=","
                      />
                      <span>({analysis.changePercentage}%)</span>
                    </div>
                  </div>

                  {/* Purchasing Power Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                        <Sandwich className="w-5 h-5 text-orange-500" />
                      </div>
                      <p className="text-xs text-zinc-400 mb-1">Big Mac Index</p>
                      <p className="text-xl font-bold text-white">
                        {purchasingPower.bigMacs.toLocaleString()} <span className="text-sm font-normal text-zinc-500">개</span>
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-amber-700/20 flex items-center justify-center mb-2">
                        <Coffee className="w-5 h-5 text-amber-700" />
                      </div>
                      <p className="text-xs text-zinc-400 mb-1">Starbucks Index</p>
                      <p className="text-xl font-bold text-white">
                        {purchasingPower.coffees.toLocaleString()} <span className="text-sm font-normal text-zinc-500">잔</span>
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-40 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 50, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={40} stroke="#71717a" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                          itemStyle={{ color: '#e4e4e7' }}
                          formatter={(value: number) => `${resultSymbol}${formatNumber(value)}`}
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        />
                        <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#52525b" : currentValueColor} />
                          ))}
                          <LabelList dataKey="value" content={<CustomBarLabel />} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={handleReset} className="w-full py-3 bg-white/5 text-zinc-300 font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10">
            <RotateCcw size={18} /> 초기화
          </button>
          <button onClick={handleShareLink} className="w-full py-3 bg-white/5 text-zinc-300 font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10">
            <LinkIcon size={18} /> 링크로 공유
          </button>
          <button onClick={handleShareImage} className="w-full py-3 bg-white/5 text-zinc-300 font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10">
            <ImageIcon size={18} /> 이미지로 저장
          </button>
        </div>
      </div>

      <FinancialKnowledgeArchive />
    </div>
  );
}
