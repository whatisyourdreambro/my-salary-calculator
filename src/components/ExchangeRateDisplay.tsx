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

  const foreignCurrency =
    assetCurrency === "KRW" ? comparisonCurrency : assetCurrency;

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

      setManualPastRateStr(pastRate?.toFixed(4) || "0");
      setManualCurrentRateStr(currentRate?.toFixed(4) || "0");
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [pastDate, foreignCurrency, isManual, useDxy]);

  useEffect(() => {
    if (useDxy) {
      const pDxy = parseFloat(pastDxy) || 0;
      const cDxy = parseFloat(currentDxy) || 0;
      const pRate = parseFloat(manualPastRateStr) || 1300;
      if (pDxy > 0 && cDxy > 0) {
        const estimatedRate = pRate * (cDxy / pDxy);
        setManualCurrentRateStr(estimatedRate.toFixed(4));
      }
    }
  }, [useDxy, pastDxy, currentDxy, manualPastRateStr]);

  useEffect(() => {
    if (!searchParams.get("assetAmount")) {
      fetchRates();
    } else {
      setIsLoading(false);
    }
  }, [fetchRates, searchParams]);

  // [수정] 결과 단위를 비교 통화에 맞게 변경하는 로직
  const { analysis, resultSymbol } = useMemo(() => {
    const pRateRaw = parseFloat(manualPastRateStr) || 0;
    const cRateRaw = parseFloat(manualCurrentRateStr) || 0;
    const amount = parseNumber(assetAmount);
    const isAssetKRW = assetCurrency === "KRW";

    const foreign = isAssetKRW ? comparisonCurrency : assetCurrency;
    const pRate = foreign === "JPY" ? pRateRaw / 100 : pRateRaw;
    const cRate = foreign === "JPY" ? cRateRaw / 100 : cRateRaw;

    let res;
    let symbol;

    if (!amount || !pRate || !cRate) {
      res = {
        changeAmount: 0,
        changePercentage: 0,
        pastValue: 0,
        currentValue: 0,
      };
      symbol =
        currencies.find((c) => c.id === comparisonCurrency)?.symbol || "₩";
    } else if (isAssetKRW) {
      // 자산이 원화일 경우, 결과는 '비교 통화'로 표시
      symbol =
        currencies.find((c) => c.id === comparisonCurrency)?.symbol || "$";
      const pastValueInForeign = amount / pRate;
      const currentValueInForeign = amount / cRate;
      const changeAmount = currentValueInForeign - pastValueInForeign;
      const changePercentage =
        pastValueInForeign > 0 ? (changeAmount / pastValueInForeign) * 100 : 0;
      res = {
        changeAmount: changeAmount,
        changePercentage: parseFloat(changePercentage.toFixed(2)),
        pastValue: pastValueInForeign,
        currentValue: currentValueInForeign,
      };
    } else {
      // 자산이 외화일 경우, 결과는 '원화'로 표시
      symbol = currencies.find((c) => c.id === "KRW")?.symbol || "₩";
      const pastValueInKRW = amount * pRate;
      const currentValueInKRW = amount * cRate;
      const changeAmount = currentValueInKRW - pastValueInKRW;
      const changePercentage =
        pastValueInKRW > 0 ? (changeAmount / pastValueInKRW) * 100 : 0;
      res = {
        changeAmount: changeAmount,
        changePercentage: parseFloat(changePercentage.toFixed(2)),
        pastValue: pastValueInKRW,
        currentValue: currentValueInKRW,
      };
    }

    // 정수형이 아닌 경우 소수점 2자리까지 표시
    const roundValue = (val: number) =>
      Number.isInteger(val) ? val : parseFloat(val.toFixed(2));

    return {
      analysis: {
        changeAmount: roundValue(res.changeAmount),
        changePercentage: res.changePercentage,
        pastValue: roundValue(res.pastValue),
        currentValue: roundValue(res.currentValue),
      },
      resultSymbol: symbol,
    };
  }, [
    assetAmount,
    assetCurrency,
    comparisonCurrency,
    manualPastRateStr,
    manualCurrentRateStr,
  ]);

  const assetSymbol =
    currencies.find((c) => c.id === assetCurrency)?.symbol || "₩";

  const chartData = [
    { name: "과거", value: analysis.pastValue },
    { name: "현재", value: analysis.currentValue },
  ];

  const currentValueColor = analysis.changeAmount >= 0 ? "#0052ff" : "#e11d48";

  // [수정] 공유 링크를 고정 URL로 변경
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

  return (
    <>
      <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border mt-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-center mb-8">
          환율 변동에 따른 내 자산 가치 변화
        </h2>

        <div ref={reportRef} className="bg-light-card dark:bg-dark-card p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* === 입력부 === */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  분석 자산
                </label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={assetCurrency}
                    onChange={(e) => setAssetCurrency(e.target.value)}
                    className="p-3 border rounded-lg dark:bg-dark-card dark:border-gray-700"
                  >
                    {currencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.id}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={formatNumber(parseNumber(assetAmount))}
                      onChange={(e) =>
                        setAssetAmount(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="w-full text-lg p-3 pr-8 border rounded-lg dark:bg-dark-card dark:border-gray-700 font-semibold"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                      {assetSymbol}
                    </span>
                  </div>
                </div>
              </div>

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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    기준 과거 시점
                  </label>
                </div>
                <input
                  type="date"
                  value={pastDate}
                  onChange={(e) => setPastDate(e.target.value)}
                  disabled={isManual}
                  className="w-full p-3 mt-1 border rounded-lg dark:bg-dark-card dark:border-gray-700 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    환율 (1 {foreignCurrency === "JPY" ? "100" : ""}
                    {foreignCurrency} 당 KRW)
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
                  <button
                    onClick={fetchRates}
                    disabled={isManual}
                    className="p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    aria-label="최신 환율 불러오기"
                  >
                    <RefreshCw size={18} />
                  </button>
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
                      DXY로 적정 환율 추정
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
                  <p className="text-xs text-center text-gray-500 pt-2">
                    ※ DXY와 과거 환율을 기준으로 추정된 환율이며, 실제와 다를 수
                    있습니다.
                  </p>
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
                    최신 환율 정보를 불러오는 중...
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
                    <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary text-sm">
                      {`과거 환율 ${manualPastRateStr} 대비, 현재(미래) 환율 ${manualCurrentRateStr} 기준,`}
                      <br />
                      <strong>
                        {assetSymbol}
                        {formatNumber(parseNumber(assetAmount))}
                      </strong>
                      의 상대적 가치는
                    </p>
                    <div
                      className={`flex items-center justify-center gap-2 text-4xl lg:text-5xl font-bold my-2 ${
                        analysis.changeAmount >= 0
                          ? "text-primary"
                          : "text-danger"
                      }`}
                    >
                      {analysis.changeAmount >= 0 ? (
                        <TrendingUp className="w-10 h-10" />
                      ) : (
                        <TrendingDown className="w-10 h-10" />
                      )}
                      <CountUp
                        end={Math.abs(analysis.changeAmount)}
                        prefix={analysis.changeAmount >= 0 ? "+ " : "- "}
                        suffix={` ${resultSymbol}`}
                        separator=","
                        decimals={
                          Number.isInteger(analysis.changeAmount) ? 0 : 2
                        }
                      />
                    </div>
                    <p
                      className={`font-semibold text-lg ${
                        analysis.changeAmount >= 0
                          ? "text-primary"
                          : "text-danger"
                      }`}
                    >
                      ({analysis.changePercentage}%)
                    </p>
                  </div>
                  <div className="h-48 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 10, right: 120 }}
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

        <div className="mt-8 pt-6 border-t dark:border-gray-700 flex flex-col sm:flex-row gap-4">
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
