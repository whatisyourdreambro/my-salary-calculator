"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import CountUp from "react-countup";
import {
  Loader,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  ArrowRight,
  RotateCcw,
  Globe,
  TrendingUp,
  TrendingDown,
  Coffee,
  Gem,
  Wifi,
  WifiOff,
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
import NumberInput from "@/components/NumberInput";

const formatNumber = (num: number) => {
  if (isNaN(num)) return "0";
  return num.toLocaleString("ko-KR");
};
const parseNumber = (str: string) => Number(String(str).replace(/,/g, ""));

const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ── Currency metadata (rates fetched live) ─────────────────────
const CURRENCY_META = [
  { id: "KRW", name: "대한민국 원",  flag: "🇰🇷", symbol: "₩"  },
  { id: "USD", name: "미국 달러",    flag: "🇺🇸", symbol: "$"  },
  { id: "JPY", name: "일본 엔",      flag: "🇯🇵", symbol: "¥"  },
  { id: "EUR", name: "유로",         flag: "🇪🇺", symbol: "€"  },
  { id: "CNY", name: "중국 위안",    flag: "🇨🇳", symbol: "¥"  },
  { id: "GBP", name: "영국 파운드",  flag: "🇬🇧", symbol: "£"  },
];

// Fallback rates (KRW base, for offline)
const FALLBACK_KRW_RATES: Record<string, number> = {
  KRW: 1,
  USD: 1 / 1470,
  JPY: 1 / 9.24,
  EUR: 1 / 1730,
  CNY: 1 / 215,
  GBP: 1 / 1985,
};

type LiveRates = Record<string, number>; // key: currency id, value: rate vs KRW

// Purchasing power data (per unit in local currency)
const purchasingPowerData: Record<string, { bigMac: number; coffee: number }> = {
  KRW: { bigMac: 6900, coffee: 4500 },
  USD: { bigMac: 5.69, coffee: 5.50 },
  JPY: { bigMac: 450,  coffee: 400  },
  EUR: { bigMac: 5.30, coffee: 4.50 },
  CNY: { bigMac: 24.0, coffee: 30.0 },
  GBP: { bigMac: 4.19, coffee: 3.50 },
};

const initialPastDate = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return toInputDateString(date);
})();

// ── Live Ticker ────────────────────────────────────────────────
function CurrencyTicker({ liveRates, isLive }: { liveRates: LiveRates; isLive: boolean }) {
  const items = CURRENCY_META.filter((c) => c.id !== "KRW").map((c) => {
    const rateVsKRW = liveRates[c.id] ?? FALLBACK_KRW_RATES[c.id];
    // Rate displayed as "1 USD = X KRW"
    const krwPerUnit = rateVsKRW > 0 ? 1 / rateVsKRW : 0;
    return { ...c, krwPerUnit };
  });

  return (
    <div
      className="w-full overflow-hidden py-3 mb-0 relative"
      style={{ backgroundColor: "#0145F2", borderBottom: "1px solid rgba(255,255,255,0.15)" }}
    >
      {/* fade edges */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to right, #0145F2 0%, transparent 8%, transparent 92%, #0145F2 100%)",
        }}
      />
      <motion.div
        className="flex whitespace-nowrap gap-14"
        animate={{ x: [0, -1200] }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((c, i) => (
          <div key={i} className="flex items-center gap-3 text-sm font-semibold">
            <span className="text-xl">{c.flag}</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{c.id}</span>
            <span style={{ color: "#FFFFFF", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {formatNumber(Math.round(c.krwPerUnit))}
              <span style={{ fontSize: "0.7rem", fontWeight: 400, marginLeft: "2px", color: "rgba(255,255,255,0.85)" }}> KRW</span>
            </span>
            {isLive ? (
              <span className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.65rem", fontWeight: 700 }}>
                <Wifi size={10} /> UPDATED
              </span>
            ) : (
              <span className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.65rem" }}>
                <WifiOff size={10} /> EXAMPLE
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function ExchangeRateImpactCalculator() {
  const searchParams = useSearchParams();
  const reportRef = useRef<HTMLDivElement>(null);

  // ── Live rate state ──────────────────────────────────────────
  const [liveRates, setLiveRates] = useState<LiveRates>(FALLBACK_KRW_RATES);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // ── Form state ───────────────────────────────────────────────
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

  // currencies array derived from live rates
  const currencies = useMemo(() =>
    CURRENCY_META.map((c) => ({
      ...c,
      rate: c.id === "KRW" ? 1 : (1 / (liveRates[c.id] ?? FALLBACK_KRW_RATES[c.id])),
    })),
    [liveRates]
  );

  // ── Fetch ALL live rates once on mount (USD base → convert to KRW base) ──
  useEffect(() => {
    async function fetchLiveRates() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD", {
          next: { revalidate: 300 }, // cache 5 min if in next.js server context
        } as RequestInit);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (data.result !== "success") throw new Error("API error");

        const usdToKrw: number = data.rates["KRW"];
        if (!Number.isFinite(usdToKrw) || usdToKrw <= 0) throw new Error("Invalid base rate");
        const krwBase: LiveRates = { KRW: 1 };
        for (const cur of ["USD", "JPY", "EUR", "CNY", "GBP"]) {
          if (!Number.isFinite(data.rates[cur]) || data.rates[cur] <= 0) throw new Error("Invalid quote rate");
          // 1 KRW = (rate_cur/usdToKrw) units of cur
          // so liveRates[cur] = rate_cur / usdToKrw
          krwBase[cur] = data.rates[cur] / usdToKrw;
        }
        setLiveRates(krwBase);
        setIsLive(true);

        // Format last updated time
        const updatedMs = (data.time_last_update_unix ?? Date.now() / 1000) * 1000;
        const dateStr = new Date(updatedMs).toLocaleString("ko-KR", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        setLastUpdated(dateStr);
      } catch {
        // stay with fallback
        setIsLive(false);
      }
    }
    fetchLiveRates();
    // refresh every 5 minutes
    const interval = setInterval(fetchLiveRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (assetCurrency === comparisonCurrency) {
      const newComparison = currencies.find((c) => c.id !== assetCurrency);
      if (newComparison) setComparisonCurrency(newComparison.id || "USD");
    }
  }, [assetCurrency, comparisonCurrency, currencies]);

  // ── Fetch past + current rates for selected pair ─────────────
  const fetchRates = useCallback(async () => {
    if (isManual) return;
    const from = comparisonCurrency;
    const to = assetCurrency;

    if (from === to) {
      setManualPastRateStr("1.0000");
      setManualCurrentRateStr("1.0000");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Past rate: Frankfurter historical
      const pastRes = await fetch(
        `https://api.frankfurter.dev/v1/${pastDate}?base=${from}&symbols=${to}`
      );
      if (!pastRes.ok) throw new Error("과거 환율 정보를 불러오는 데 실패했습니다.");
      const pastData = await pastRes.json();

      // Current rate: from our already-fetched liveRates (KRW base)
      let currentRateValue: number;
      if (to === "KRW") {
        // from X to KRW => 1/liveRates[from] KRW (since liveRates[from] = units_of_from per 1 KRW)
        currentRateValue = liveRates[from] > 0 ? 1 / liveRates[from] : 0;
      } else if (from === "KRW") {
        currentRateValue = liveRates[to] ?? 0;
      } else {
        // cross rate: (1 / liveRates[from]) * liveRates[to] but both are vs KRW
        // liveRates[X] = units_of_X / 1_KRW
        // 1 unit_from = (1/liveRates[from]) KRW = (1/liveRates[from]) * liveRates[to] units_to
        currentRateValue =
          liveRates[from] > 0 ? liveRates[to] / liveRates[from] : 0;
      }

      const pastRateValue: number = pastData.rates?.[to];
      setManualPastRateStr(pastRateValue?.toFixed(4) || "0");
      setManualCurrentRateStr(currentRateValue?.toFixed(4) || "0");
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [pastDate, assetCurrency, comparisonCurrency, isManual, liveRates]);

  // Re-fetch whenever liveRates or selections change
  useEffect(() => {
    if (isLive || !isManual) fetchRates();
  }, [fetchRates, isLive]); // eslint-disable-line

  const { analysis, resultSymbol, purchasingPower } = useMemo(() => {
    const pRate = parseFloat(manualPastRateStr) || 0;
    const cRate = parseFloat(manualCurrentRateStr) || 0;
    const amount = parseNumber(assetAmount);

    const finalResultSymbol =
      currencies.find((c) => c.id === assetCurrency)?.symbol || "₩";

    let res;
    if (!amount || !pRate || !cRate) {
      res = { changeAmount: 0, changePercentage: 0, pastValue: amount, currentValue: amount };
    } else {
      const pastValue = amount;
      const currentValue = amount * (pRate / cRate);
      const changeAmount = currentValue - pastValue;
      res = {
        changeAmount,
        changePercentage: pastValue > 0 ? (changeAmount / pastValue) * 100 : 0,
        pastValue,
        currentValue,
      };
    }

    const roundValue = (val: number) =>
      Number.isInteger(val) ? val : parseFloat(val.toFixed(2));

    // Purchasing power in comparison currency
    const convertedAmount = cRate > 0 ? amount * (liveRates[comparisonCurrency] ?? 0) : 0;
    const compCurrencyData = purchasingPowerData[comparisonCurrency];
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
      },
    };
  }, [assetAmount, assetCurrency, manualPastRateStr, manualCurrentRateStr, comparisonCurrency, currencies, liveRates]);

  const chartData = [
    { name: "과거", value: analysis.pastValue },
    { name: "현재", value: analysis.currentValue },
  ];

  const isGain = analysis.changeAmount >= 0;
  const gainColor = "#0145F2";
  const lossColor = "#7A9AB5";

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText("https://www.moneysalary.com/?tab=exchange");
      alert("공유 링크가 클립보드에 복사되었습니다!");
    } catch {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleShareImage = async () => {
    const element = reportRef.current;
    if (!element) return;
    const { default: html2canvas } = await import("html2canvas");
    html2canvas(element, {
      scale: 2,
      backgroundColor: "#EDF1F5",
      useCORS: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Moneysalary_Exchange_Report.png`;
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
    setManualPastRateStr("");
    setManualCurrentRateStr("");
    setError(null);
  };

  const inputStyle =
    "w-full p-4 mt-1 bg-white border border-canvas rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-50 text-navy font-medium";
  const textInputStyle = `${inputStyle} text-center tabular-nums text-lg`;

  return (
    <div className="animate-fade-in-up bg-canvas min-h-screen">
      {/* Live Ticker */}
      <CurrencyTicker liveRates={liveRates} isLive={isLive} />

      <div className="page-width py-12 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
            style={{
              backgroundColor: "hsl(var(--accent))",
              color: "hsl(var(--accent-foreground))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            {isLive ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isLive
              ? `최근 고시 환율 적용 중 · 업데이트: ${lastUpdated}`
              : "환율 조회 전·연결 불가 시 예시 환율 표시"}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight mb-4">
            환율 <span className="text-electric">영향 계산기</span>
          </h1>
          <p className="text-faint-blue text-lg max-w-2xl mx-auto font-medium">
            일 단위 참고 환율로 자산 가치 변화와 구매력을 비교합니다
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="text-link underline">Rates By Exchange Rate API</a>
            {" · 과거 환율: "}<a href="https://frankfurter.dev/v1/" target="_blank" rel="noopener noreferrer" className="text-link underline">Frankfurter</a>
            {" · 실제 환전에는 은행의 적용환율과 수수료를 확인하세요."}
          </p>

          {/* Live rate summary pills */}
          {isLive && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap justify-center gap-3 mt-6"
            >
              {CURRENCY_META.filter((c) => c.id !== "KRW").map((c) => {
                const krwPer = liveRates[c.id] > 0 ? 1 / liveRates[c.id] : 0;
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                    style={{ backgroundColor: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  >
                    <span>{c.flag}</span>
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>{c.id}</span>
                    <span style={{ color: "hsl(var(--link))", fontVariantNumeric: "tabular-nums" }}>
                      {formatNumber(Math.round(krwPer))}원
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Main Card */}
        <div
          ref={reportRef}
          className="bg-white rounded-[2rem] shadow-sm p-8 sm:p-10 relative overflow-hidden"
          style={{ border: "1.5px solid hsl(var(--border))" }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ background: "linear-gradient(to right, #0145F2, #3D7FF5)" }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pt-4">
            {/* ── Input Section ── */}
            <div className="space-y-6">
              {/* Asset input */}
              <div className="bg-canvas rounded-2xl p-6 border border-canvas">
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

              {/* Currency pair + date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                    비교 통화
                  </label>
                  <select
                    value={comparisonCurrency}
                    onChange={(e) => setComparisonCurrency(e.target.value)}
                    className={inputStyle}
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
                  <label className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                    과거 기준일
                  </label>
                  <input
                    type="date"
                    value={pastDate}
                    onChange={(e) => setPastDate(e.target.value)}
                    disabled={isManual}
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Rate inputs */}
              <div
                className="p-5 rounded-2xl space-y-4"
                style={{ border: "1.5px solid hsl(var(--border))", backgroundColor: "hsl(var(--accent))" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-faint-blue uppercase tracking-wider">
                    환율 ({comparisonCurrency} → {assetCurrency})
                  </span>
                  <button
                    onClick={() => setIsManual(!isManual)}
                    className="flex items-center gap-2 text-xs font-bold transition-colors"
                    style={{ color: isManual ? "hsl(var(--link))" : "hsl(var(--muted-foreground))" }}
                  >
                    수동 입력
                    <div
                      className="w-3 h-3 rounded-full border-2 transition-colors"
                      style={{
                        backgroundColor: isManual ? "hsl(var(--primary))" : "transparent",
                        borderColor: isManual ? "hsl(var(--primary))" : "hsl(var(--input))",
                      }}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="text-xs text-faint-blue block mb-1 text-center font-bold">과거</span>
                    <NumberInput
                      type="text"
                      value={manualPastRateStr}
                      onChange={(e) => setManualPastRateStr(e.target.value)}
                      disabled={!isManual}
                      className={textInputStyle}
                    />
                  </div>
                  <ArrowRight className="text-electric flex-none" />
                  <div className="flex-1">
                    <span className="text-xs text-faint-blue block mb-1 text-center font-bold">
                      현재 {isLive && <span style={{ color: "hsl(var(--link))" }}>· 최근 고시</span>}
                    </span>
                    <NumberInput
                      type="text"
                      value={manualCurrentRateStr}
                      onChange={(e) => setManualCurrentRateStr(e.target.value)}
                      disabled={!isManual}
                      className={textInputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchRates}
                disabled={isLoading || isManual}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: "#0145F2",
                  color: "#FFFFFF",
                }}
              >
                {isLoading ? (
                  <><Loader size={16} className="animate-spin" /> 환율 조회 중...</>
                ) : (
                  <><Globe size={16} /> 환율 다시 확인하기</>
                )}
              </button>
            </div>

            {/* ── Result Section ── */}
            <div className="flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                  >
                    <Loader className="animate-spin mx-auto text-primary mb-4" size={40} />
                    <p className="text-muted-blue font-semibold">환율 분석 중...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 rounded-2xl text-center"
                    style={{ backgroundColor: "hsl(var(--destructive) / 0.08)", border: "1.5px solid hsl(var(--destructive) / 0.3)" }}
                  >
                    <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "hsl(var(--destructive))" }} />
                    <h3 className="font-bold mb-1" style={{ color: "hsl(var(--destructive))" }}>환율 조회 실패</h3>
                    <p className="text-sm text-faint-blue">{error}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5 h-full flex flex-col"
                  >
                    {/* Main result */}
                    <div
                      className="p-8 rounded-[1.5rem] text-center relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)",
                        boxShadow: "0 8px 32px -8px #0145F244",
                      }}
                    >
                      <div
                        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                      />
                      <p className="text-xs font-bold uppercase tracking-widest mb-4 relative z-10"
                        style={{ color: "rgba(255,255,255,0.85)" }}>
                        환율 영향 시뮬레이션 결과
                      </p>

                      <div className="flex flex-col items-center gap-2 mb-5 relative z-10">
                        <span className="text-base font-medium line-through"
                          style={{ color: "rgba(255,255,255,0.85)" }}>
                          {resultSymbol}{formatNumber(analysis.pastValue)}
                        </span>
                        <ArrowRight className="rotate-90" size={18} style={{ color: "rgba(255,255,255,0.4)" }} />
                        <span className="max-w-full break-all text-[clamp(1.625rem,6vw,3rem)] font-black tabular-nums sm:text-5xl" style={{ color: "#FFFFFF" }}>
                          <CountUp
                            end={analysis.currentValue}
                            prefix={resultSymbol}
                            separator=","
                            decimals={0}
                            duration={1.5}
                          />
                        </span>
                      </div>

                      <div
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold relative z-10"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.15)",
                          color: "#FFFFFF",
                        }}
                      >
                        {isGain ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <CountUp
                          end={Math.abs(analysis.changeAmount)}
                          prefix={isGain ? "+" : "-"}
                          separator=","
                        />
                        <span>({isGain ? "+" : ""}{analysis.changePercentage}%)</span>
                      </div>
                    </div>

                    {/* Purchasing Power */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="p-5 rounded-2xl flex flex-col items-center justify-center text-center"
                        style={{ backgroundColor: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))" }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                          style={{ backgroundColor: "hsl(var(--accent))" }}
                        >
                          <Gem className="w-5 h-5" style={{ color: "hsl(var(--link))" }} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-faint-blue mb-1">
                          빅맥 지수
                        </p>
                        <p className="text-2xl font-black text-navy">
                          {purchasingPower.bigMacs.toLocaleString("ko-KR")}
                          <span className="text-sm font-normal text-faint-blue ml-1">개</span>
                        </p>
                      </div>
                      <div
                        className="p-5 rounded-2xl flex flex-col items-center justify-center text-center"
                        style={{ backgroundColor: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))" }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                          style={{ backgroundColor: "hsl(var(--accent))" }}
                        >
                          <Coffee className="w-5 h-5" style={{ color: "hsl(var(--link))" }} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-faint-blue mb-1">
                          커피 지수
                        </p>
                        <p className="text-2xl font-black text-navy">
                          {purchasingPower.coffees.toLocaleString("ko-KR")}
                          <span className="text-sm font-normal text-faint-blue ml-1">잔</span>
                        </p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div
                      className="h-44 p-5 rounded-2xl"
                      style={{ backgroundColor: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))" }}
                    >
                      <p className="text-xs font-bold text-faint-blue uppercase tracking-wider mb-3">
                        과거 vs 현재 자산 가치
                      </p>
                      <ResponsiveContainer width="100%" height="80%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ left: 0, right: 48, top: 0, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            width={36}
                            stroke="#7A9AB5"
                            fontSize={12}
                            fontWeight={700}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "#DDE4EC",
                              borderRadius: "10px",
                              padding: "8px 12px",
                              color: "#0A1829",
                              fontSize: "13px",
                            }}
                            formatter={(value: number) =>
                              `${resultSymbol}${formatNumber(value)}`
                            }
                            cursor={{ fill: "#0145F208" }}
                          />
                          <Bar dataKey="value" barSize={28} radius={[0, 6, 6, 0]}>
                            {chartData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={index === 0 ? "#DDE4EC" : isGain ? gainColor : lossColor}
                              />
                            ))}
                            <LabelList dataKey="value" content={<CustomBarLabel />} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleReset}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "1.5px solid hsl(var(--border))" }}
          >
            <RotateCcw size={16} /> 초기화
          </button>
          <button
            onClick={handleShareLink}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "1.5px solid hsl(var(--border))" }}
          >
            <LinkIcon size={16} /> 링크 공유
          </button>
          <button
            onClick={handleShareImage}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: "#0145F2", color: "#FFFFFF" }}
          >
            <ImageIcon size={16} /> 리포트 저장
          </button>
        </div>
      </div>

      <FinancialKnowledgeArchive />
    </div>
  );
}
