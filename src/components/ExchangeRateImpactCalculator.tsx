// src/components/ExchangeRateImpactCalculator.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import CountUp from "react-countup";
import html2canvas from "html2canvas";
import {
  TrendingUp,
  TrendingDown,
  Link as LinkIcon,
  Image as ImageIcon,
  Globe,
} from "lucide-react";
import FinancialKnowledgeArchive from "./FinancialKnowledgeArchive";
import CurrencyInput from "./CurrencyInput";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

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

  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;

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
          환율 변동이 내 연봉의 실제 &apos;글로벌 가치&apos;에 미치는 영향을
          대통령급 보고서 수준으로 분석해 드립니다.
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
          <TrendIcon className="w-10 h-10" />
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

// 메인 컴포넌트는 두 개의 하위 컴포넌트를 렌더링하는 역할만 합니다.
export default function ExchangeRateImpactCalculator() {
  return (
    <>
      <SalaryPurchasingPowerCalculator />
      <FinancialKnowledgeArchive />
    </>
  );
}
