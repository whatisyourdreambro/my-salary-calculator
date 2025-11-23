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
  RotateCcw,
  Globe,
  TrendingUp,
  Coffee,
  Sandwich,
  Crown,
  Gem
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
import { motion } from "framer-motion";

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
  USD: { bigMac: 5.69, coffee: 5.50 },
  JPY: { bigMac: 450, coffee: 400 },
  EUR: { bigMac: 5.30, coffee: 4.50 },
  CNY: { bigMac: 24.0, coffee: 30.0 },
  GBP: { bigMac: 4.19, coffee: 3.50 },
};

const CurrencyTicker = () => (
  <div className="w-full overflow-hidden bg-black border-y border-yellow-500/20 py-3 mb-8 relative">
    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />
    <motion.div
      className="flex whitespace-nowrap gap-12"
      animate={{ x: [0, -1000] }}
      transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
    >
      {[...currencies, ...currencies, ...currencies].map((c, i) => (
        <div key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-400">
          <span className="text-xl grayscale opacity-70">{c.flag}</span>
          <span className="font-serif text-yellow-500/80">{c.id}</span>
          <span className="text-white font-bold tracking-wider">{c.rate.toLocaleString()}</span>
          <span className="text-xs text-emerald-500 flex items-center gap-1">
            <TrendingUp size={10} /> LIVE
          </span>
        </div>
      ))}
    </motion.div>
  </div>
);

export default function ExchangeRateImpactCalculator() {
  const searchParams = useSearchParams();
  const reportRef = useRef<HTMLDivElement>(null);

  const [assetAmount, setAssetAmount] = useState(() =>
    formatNumber(parseNumber(searchParams.get("assetAmount") || "100000000"))
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
      // Use open.er-api.com for "Real-time" (Latest)
      // Use frankfurter for Past (Historical)
      const [pastRes, currentRes] = await Promise.all([
        fetch(`https://api.frankfurter.app/${pastDate}?from=${from}&to=${to}`),
        fetch(`https://open.er-api.com/v6/latest/${from}`),
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
    const convertedAmount = amount / cRate;
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

  const currentValueColor = analysis.changeAmount >= 0 ? "#10b981" : "#f43f5e";

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
      backgroundColor: "#000000",
      useCORS: true,
      windowHeight: element.scrollHeight,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Moneysalary_Premium_Report.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const handleReset = () => {
    setAssetAmount(formatNumber(100000000));
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

  const inputStyle = "w-full p-4 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition disabled:opacity-50 text-white font-medium";
  const textInputStyle = `${inputStyle} text-center font-mono text-lg`;

  return (
    <div className="animate-fade-in-up bg-black min-h-screen text-white">
      <CurrencyTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-500/30 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-4 tracking-tight">
            Global Wealth Intelligence
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
            초고액 자산가를 위한 실시간 환율 영향 분석 및 자산 가치 시뮬레이션
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden" ref={reportRef}>
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 relative z-10">
            {/* Input Section */}
            <div className="space-y-8">
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
                <CurrencyInput
                  label="분석할 자산 규모"
                  value={assetAmount}
                  onValueChange={setAssetAmount}
                  quickAmounts={[100000000, 500000000, 1000000000]}
                  selectedCurrency={assetCurrency}
                  onCurrencyChange={setAssetCurrency}
                  currencies={currencies}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-yellow-500/80 uppercase tracking-wider mb-2 block">Comparison Currency</label>
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
                  <label className="text-xs font-bold text-yellow-500/80 uppercase tracking-wider mb-2 block">Historical Date</label>
                  <input
                    type="date"
                    value={pastDate}
                    onChange={(e) => setPastDate(e.target.value)}
                    disabled={isManual || useDxy}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-4 p-6 border border-zinc-800 rounded-3xl bg-zinc-900/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Exchange Rate ({comparisonCurrency} → {assetCurrency})</label>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-yellow-500 transition-colors" onClick={() => setIsManual(!isManual)}>
                    <span className="text-xs font-bold">MANUAL OVERRIDE</span>
                    <div className={`w-3 h-3 rounded-full border ${isManual ? 'bg-yellow-500 border-yellow-500' : 'border-zinc-600'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <span className="text-xs text-zinc-500 block mb-1 text-center">PAST</span>
                    <input type="text" value={manualPastRateStr} onChange={(e) => setManualPastRateStr(e.target.value)} disabled={!isManual} className={textInputStyle} />
                  </div>
                  <ArrowRight className="text-zinc-700" />
                  <div className="flex-1">
                    <span className="text-xs text-zinc-500 block mb-1 text-center">CURRENT (LIVE)</span>
                    <input type="text" value={manualCurrentRateStr} onChange={(e) => setManualCurrentRateStr(e.target.value)} disabled={!isManual || useDxy} className={textInputStyle} />
                  </div>
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div className="flex flex-col justify-center">
              {isLoading ? (
                <div className="text-center py-20">
                  <Loader className="animate-spin mx-auto text-yellow-500 mb-6" size={48} />
                  <p className="font-serif text-xl text-zinc-300">Analyzing Global Markets...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full p-8 bg-red-900/10 rounded-3xl border border-red-900/30">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="font-bold text-red-400 mb-2">Analysis Failed</h3>
                    <p className="text-sm text-red-300/70">{error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 h-full flex flex-col">
                  {/* Main Result Card */}
                  <div className={`p-10 rounded-[2.5rem] text-center transition-all duration-500 border relative overflow-hidden group ${analysis.changeAmount >= 0
                    ? "bg-gradient-to-br from-emerald-950/30 to-emerald-900/10 border-emerald-500/20"
                    : "bg-gradient-to-br from-rose-950/30 to-rose-900/10 border-rose-500/20"
                    }`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />

                    <p className="font-serif text-zinc-400 mb-6 tracking-wide uppercase text-xs">
                      Net Asset Value Impact
                    </p>

                    <div className="flex flex-col items-center justify-center gap-2 mb-6">
                      <span className="text-xl font-medium text-zinc-600 line-through decoration-zinc-600/50">
                        {resultSymbol}{formatNumber(analysis.pastValue)}
                      </span>
                      <ArrowRight className="text-zinc-700 rotate-90 my-2" size={20} />
                      <span className={`text-5xl sm:text-6xl font-black tracking-tighter ${analysis.changeAmount >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}>
                        <CountUp
                          end={analysis.currentValue}
                          prefix={resultSymbol}
                          separator=","
                          decimals={0}
                          duration={2}
                        />
                      </span>
                    </div>

                    <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-sm font-bold border ${analysis.changeAmount >= 0
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}>
                      {analysis.changeAmount >= 0 ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                      <CountUp
                        end={Math.abs(analysis.changeAmount)}
                        prefix={analysis.changeAmount >= 0 ? "+" : "-"}
                        separator=","
                      />
                      <span>({analysis.changePercentage}%)</span>
                    </div>
                  </div>

                  {/* Purchasing Power Cards */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center text-center hover:border-yellow-500/30 transition-colors group">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Gem className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Luxury Index</p>
                      <p className="text-2xl font-bold text-white">
                        {purchasingPower.bigMacs.toLocaleString()} <span className="text-sm font-normal text-zinc-600">Units</span>
                      </p>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center text-center hover:border-yellow-500/30 transition-colors group">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Coffee className="w-6 h-6 text-amber-600" />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Lifestyle Index</p>
                      <p className="text-2xl font-bold text-white">
                        {purchasingPower.coffees.toLocaleString()} <span className="text-sm font-normal text-zinc-600">Cups</span>
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-48 bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 50, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={40} stroke="#52525b" fontSize={12} fontWeight={700} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', padding: '12px' }}
                          itemStyle={{ color: '#e4e4e7', fontFamily: 'serif' }}
                          formatter={(value: number) => `${resultSymbol}${formatNumber(value)}`}
                          cursor={{ fill: "rgba(255,255,255,0.02)" }}
                        />
                        <Bar dataKey="value" barSize={32} radius={[0, 8, 8, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#3f3f46" : currentValueColor} />
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

        <div className="mt-8 pt-8 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={handleReset} className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2 border border-zinc-800">
            <RotateCcw size={18} /> RESET
          </button>
          <button onClick={handleShareLink} className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2 border border-zinc-800">
            <LinkIcon size={18} /> SHARE LINK
          </button>
          <button onClick={handleShareImage} className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2 border border-zinc-800">
            <ImageIcon size={18} /> SAVE REPORT
          </button>
        </div>
      </div>

      <FinancialKnowledgeArchive />
    </div>
  );
}
