// src/components/ExchangeRateDisplay.tsx
"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import CountUp from "react-countup";
import html2canvas from "html2canvas";
import {
  TrendingUp,
  TrendingDown,
  Loader,
  RefreshCw,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  PlusCircle,
  X,
  Award,
  Globe,
  Wallet,
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

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

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

interface Scenario {
  id: number;
  title: string;
  pastRate: string;
  currentRate: string;
  useDxy: boolean;
  pastDxy: string;
  currentDxy: string;
}

// 연봉 구매력 계산기 컴포넌트
const SalaryPurchasingPowerCalculator = () => {
  const purchasingPowerRef = useRef<HTMLDivElement>(null);
  const [salary, setSalary] = useState("60000000");
  const [rateA, setRateA] = useState("1350");
  const [rateB, setRateB] = useState("1420");

  const { changeInKRW, changeInUSD, isIncrease, explanation } = useMemo(() => {
    const salaryNum = parseNumber(salary);
    const rateANum = parseNumber(rateA);
    const rateBNum = parseNumber(rateB);

    if (!salaryNum || !rateANum || !rateBNum) {
      return {
        changeInKRW: 0,
        changeInUSD: 0,
        isIncrease: false,
        explanation: "",
      };
    }

    const pastValueInUSD = salaryNum / rateANum;
    const currentValueInUSD = salaryNum / rateBNum;
    const diffUSD = currentValueInUSD - pastValueInUSD;
    const effectiveChangeInKRW = diffUSD * rateBNum;

    const isDevaluation = rateBNum > rateANum;
    const changeText = isDevaluation ? "하락" : "상승";
    const effectText = isDevaluation ? "감소" : "증가";

    const expl = `달러 대비 원화 가치가 ${changeText}하여, 동일한 연봉으로 구매할 수 있는 해외 상품/서비스의 실질 가치가 변동되었습니다. 이는 실질적으로 연봉이 ${formatNumber(
      Math.round(Math.abs(effectiveChangeInKRW))
    )}원 ${effectText}한 것과 같은 효과입니다.`;

    return {
      changeInKRW: effectiveChangeInKRW,
      changeInUSD: diffUSD,
      isIncrease: !isDevaluation,
      explanation: expl,
    };
  }, [salary, rateA, rateB]);

  const handleShare = async () => {
    alert("공유 기능이 준비 중입니다.");
  };

  const handleCapture = () => {
    const element = purchasingPowerRef.current;
    if (!element) return;
    html2canvas(element, { scale: 2, backgroundColor: null }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Moneysalary_연봉구매력_분석결과.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div
      ref={purchasingPowerRef}
      className="bg-slate-800 dark:bg-black text-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-400/30 mt-16 animate-fade-in-up"
    >
      <div className="text-center mb-8">
        <Globe className="mx-auto h-10 w-10 text-cyan-400 mb-2" />
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
          연봉 구매력 계산기
        </h2>
        <p className="mt-2 text-slate-400 max-w-xl mx-auto">
          환율 변동이 내 연봉의 실제 '글로벌 가치'에 미치는 영향을 대통령급
          보고서 수준으로 분석해 드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CurrencyInput
          label="내 세전 연봉 (KRW)"
          value={salary}
          onValueChange={setSalary}
          quickAmounts={[10000000, 5000000]}
        />
        <div>
          <label className="text-sm font-medium text-slate-400">
            과거 환율 (1 USD 당)
          </label>
          <div className="relative mt-1">
            <input
              type="number"
              value={rateA}
              onChange={(e) => setRateA(e.target.value)}
              className="w-full p-3 sm:p-4 text-xl sm:text-2xl font-bold border-2 border-slate-600 rounded-lg bg-slate-900 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-slate-500 text-sm sm:text-base">
              ₩
            </span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-400">
            현재/미래 환율 (1 USD 당)
          </label>
          <div className="relative mt-1">
            <input
              type="number"
              value={rateB}
              onChange={(e) => setRateB(e.target.value)}
              className="w-full p-3 sm:p-4 text-xl sm:text-2xl font-bold border-2 border-slate-600 rounded-lg bg-slate-900 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-slate-500 text-sm sm:text-base">
              ₩
            </span>
          </div>
        </div>
      </div>

      <div
        className={`mt-8 p-6 rounded-xl text-center transition-colors duration-300 ${
          isIncrease ? "bg-blue-900/50" : "bg-red-900/50"
        }`}
      >
        <p className="font-semibold text-slate-300 text-sm">
          {`과거 ₩${rateA} 대비 현재 ₩${rateB} 기준, 연봉 ${formatNumber(
            parseNumber(salary)
          )}원의 실질 구매력은...`}
        </p>
        <div
          className={`flex items-center justify-center gap-2 text-4xl lg:text-5xl font-bold my-2 ${
            isIncrease ? "text-sky-400" : "text-red-400"
          }`}
        >
          {isIncrease ? (
            <TrendingUp className="w-10 h-10" />
          ) : (
            <TrendingDown className="w-10 h-10" />
          )}
          <CountUp
            end={Math.abs(changeInKRW)}
            prefix="₩ "
            separator=","
            decimals={0}
          />
        </div>
        <p
          className={`font-semibold text-lg ${
            isIncrease ? "text-sky-400" : "text-red-400"
          }`}
        >
          (달러 기준{" "}
          <CountUp
            end={Math.abs(changeInUSD)}
            prefix="$ "
            separator=","
            decimals={0}
          />{" "}
          가치 변동)
        </p>
        <div className="mt-4 pt-4 border-t border-white/20 text-left text-slate-300 text-sm">
          <p className="font-bold text-base text-white mb-1">보고서:</p>
          <p>{explanation}</p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleShare}
          className="w-full py-3 bg-slate-700 font-semibold rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"
        >
          <LinkIcon size={18} /> 링크로 공유
        </button>
        <button
          onClick={handleCapture}
          className="w-full py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition flex items-center justify-center gap-2"
        >
          <ImageIcon size={18} /> 이미지로 저장
        </button>
      </div>
    </div>
  );
};

// 기존 ExchangeRateImpactCalculator 컴포넌트 (시나리오 비교)
export default function ExchangeRateImpactCalculator() {
  const searchParams = useSearchParams();
  const reportRef = useRef<HTMLDivElement>(null);

  const [assetAmount, setAssetAmount] = useState(
    () => searchParams.get("assetAmount") || "100000000"
  );
  const [assetCurrency, setAssetCurrency] = useState(
    () => searchParams.get("assetCurrency") || "KRW"
  );
  const [comparisonCurrency, setComparisonCurrency] = useState(
    () => searchParams.get("comparisonCurrency") || "USD"
  );
  const [pastDate, setPastDate] = useState(
    () =>
      searchParams.get("pastDate") ||
      (() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        return toInputDateString(date);
      })()
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [useDxy, setUseDxy] = useState(false);
  const [pastDxy, setPastDxy] = useState("105.00");
  const [currentDxy, setCurrentDxy] = useState("108.00");

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

  const foreignCurrency =
    assetCurrency === "KRW" ? comparisonCurrency : assetCurrency;

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

  const fetchRates = useCallback(async () => {
    if (isManual || useDxy) {
      setIsLoading(false);
      return;
    }
    const to = "KRW";
    const from = foreignCurrency;

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

      const pastRate =
        from === "JPY" ? pastData.rates[to] * 100 : pastData.rates[to];
      const currentRate =
        from === "JPY" ? currentData.rates[to] * 100 : currentData.rates[to];

      const newScenarios = scenarios.map((s) =>
        s.id === 1
          ? {
              ...s,
              pastRate: pastRate?.toFixed(4) || "0",
              currentRate: currentRate?.toFixed(4) || "0",
            }
          : s
      );
      setScenarios(newScenarios);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [pastDate, foreignCurrency, isManual, useDxy, scenarios]);

  useEffect(() => {
    scenarios.forEach((s) => {
      if (s.useDxy) {
        const pDxy = parseFloat(s.pastDxy) || 0;
        const cDxy = parseFloat(s.currentDxy) || 0;
        const pRate = parseFloat(s.pastRate) || 1300;
        if (pDxy > 0 && cDxy > 0) {
          const estimatedRate = pRate * (cDxy / pDxy);
          if (s.currentRate !== estimatedRate.toFixed(4)) {
            setScenarios((currentScenarios) =>
              currentScenarios.map((sc) =>
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

  useEffect(() => {
    if (!searchParams.get("assetAmount")) {
      fetchRates();
    } else {
      setIsLoading(false);
    }
  }, [fetchRates, searchParams]);

  const analysisResults = useMemo(() => {
    return scenarios.map((scenario) => {
      const { pastRate, currentRate } = scenario;
      const isAssetKRW = assetCurrency === "KRW";
      const foreign = isAssetKRW ? comparisonCurrency : assetCurrency;
      const pRateRaw = parseFloat(pastRate) || 0;
      const cRateRaw = parseFloat(currentRate) || 0;
      const pRate = foreign === "JPY" ? pRateRaw / 100 : pRateRaw;
      const cRate = foreign === "JPY" ? cRateRaw / 100 : cRateRaw;
      const amount = parseNumber(assetAmount);

      let res;
      if (!amount || !pRate || !cRate) {
        res = {
          changeAmount: 0,
          changePercentage: 0,
          pastValue: 0,
          currentValue: 0,
        };
      } else if (isAssetKRW) {
        const pastValueInForeign = amount / pRate;
        const currentValueInForeign = amount / cRate;
        const changeAmount = currentValueInForeign - pastValueInForeign;
        res = {
          changeAmount,
          changePercentage:
            pastValueInForeign > 0
              ? (changeAmount / pastValueInForeign) * 100
              : 0,
          pastValue: pastValueInForeign,
          currentValue: currentValueInForeign,
        };
      } else {
        const pastValueInKRW = amount * pRate;
        const currentValueInKRW = amount * cRate;
        const changeAmount = currentValueInKRW - pastValueInKRW;
        res = {
          changeAmount,
          changePercentage:
            pastValueInKRW > 0 ? (changeAmount / pastValueInKRW) * 100 : 0,
          pastValue: pastValueInKRW,
          currentValue: currentValueInKRW,
        };
      }

      const roundValue = (val: number) =>
        Number.isInteger(val) ? val : parseFloat(val.toFixed(2));

      return {
        id: scenario.id,
        changeAmount: roundValue(res.changeAmount),
        pastValue: roundValue(res.pastValue),
        currentValue: roundValue(res.currentValue),
        changePercentage: parseFloat(res.changePercentage.toFixed(2)),
      };
    });
  }, [assetAmount, assetCurrency, comparisonCurrency, scenarios]);

  const bestScenario = useMemo(() => {
    if (analysisResults.length === 0) return null;
    return analysisResults.reduce((best, current) =>
      current.changeAmount > best.changeAmount ? current : best
    );
  }, [analysisResults]);

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
    html2canvas(element, { scale: 2, backgroundColor: null }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Moneysalary_환율분석결과.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const assetSymbol =
    currencies.find((c) => c.id === assetCurrency)?.symbol || "₩";
  const resultSymbol =
    assetCurrency === "KRW"
      ? currencies.find((c) => c.id === comparisonCurrency)?.symbol || "$"
      : "₩";

  return (
    <>
      <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border mt-8 animate-fade-in-up">
        {/* ... 여기에 기존 시나리오 계산기 UI가 들어갑니다 ... */}
      </div>

      <SalaryPurchasingPowerCalculator />

      <FinancialKnowledgeArchive />
    </>
  );
}
