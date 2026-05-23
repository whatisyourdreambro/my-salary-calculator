"use client";

import { useMemo, useState } from "react";

type Product = "savings" | "deposit"; // 정기적금 / 정기예금
type InterestType = "simple" | "compound"; // 단리 / 복리

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function SavingsInterestClient() {
  const [product, setProduct] = useState<Product>("savings");
  const [interestType, setInterestType] = useState<InterestType>("simple");
  const [amount, setAmount] = useState(500_000); // 정기적금: 월 적립액 / 정기예금: 예치금
  const [months, setMonths] = useState(24);
  const [annualRate, setAnnualRate] = useState(4.0);
  const [taxFree, setTaxFree] = useState(false);

  const result = useMemo(() => {
    const r = annualRate / 100;
    const monthlyRate = r / 12;
    let principal: number;
    let interest: number;

    if (product === "savings") {
      // 정기적금
      principal = amount * months;
      if (interestType === "simple") {
        // 단리: 월적립액 × n × (n+1)/2 × 월이율
        interest = amount * months * (months + 1) / 2 * monthlyRate;
      } else {
        // 월복리: 매월 (1+월이율) 누적
        let balance = 0;
        for (let i = 0; i < months; i++) {
          balance = (balance + amount) * (1 + monthlyRate);
        }
        interest = balance - principal;
      }
    } else {
      // 정기예금
      principal = amount;
      if (interestType === "simple") {
        interest = amount * r * (months / 12);
      } else {
        interest = amount * Math.pow(1 + monthlyRate, months) - amount;
      }
    }

    const taxRate = taxFree ? 0 : 0.154;
    const tax = interest * taxRate;
    const netInterest = interest - tax;
    const maturity = principal + netInterest;

    return { principal, interest, tax, netInterest, maturity };
  }, [product, interestType, amount, months, annualRate, taxFree]);

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 적금·예금 만기 즉시 계산
        </h2>

        {/* 상품 유형 토글 */}
        <div className="mb-4 grid grid-cols-2 gap-2 p-1 bg-canvas-100 dark:bg-canvas-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setProduct("savings")}
            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
              product === "savings"
                ? "bg-white dark:bg-canvas-900 text-electric shadow-sm"
                : "text-muted-blue dark:text-canvas-300"
            }`}
          >
            정기적금 (월 적립)
          </button>
          <button
            type="button"
            onClick={() => setProduct("deposit")}
            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
              product === "deposit"
                ? "bg-white dark:bg-canvas-900 text-electric shadow-sm"
                : "text-muted-blue dark:text-canvas-300"
            }`}
          >
            정기예금 (목돈 거치)
          </button>
        </div>

        {/* 단리/복리 */}
        <div className="mb-5 grid grid-cols-2 gap-2 p-1 bg-canvas-100 dark:bg-canvas-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setInterestType("simple")}
            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
              interestType === "simple"
                ? "bg-white dark:bg-canvas-900 text-electric shadow-sm"
                : "text-muted-blue dark:text-canvas-300"
            }`}
          >
            단리
          </button>
          <button
            type="button"
            onClick={() => setInterestType("compound")}
            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
              interestType === "compound"
                ? "bg-white dark:bg-canvas-900 text-electric shadow-sm"
                : "text-muted-blue dark:text-canvas-300"
            }`}
          >
            월복리
          </button>
        </div>

        {/* 금액 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            {product === "savings" ? "월 적립액 (원)" : "예치금 (원)"}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={product === "savings" ? 50_000 : 1_000_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label={product === "savings" ? "월 적립액" : "예치금"}
          />
        </div>

        {/* 기간 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            가입 기간: {months}개월 ({(months / 12).toFixed(1)}년)
          </label>
          <input
            type="range"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            min={1}
            max={120}
            step={1}
            className="w-full"
            aria-label="가입 기간"
          />
        </div>

        {/* 금리 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            연 이자율: {annualRate.toFixed(2)}%
          </label>
          <input
            type="range"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
            aria-label="연 이자율"
          />
        </div>

        {/* 비과세 옵션 */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={taxFree}
            onChange={(e) => setTaxFree(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-navy dark:text-canvas-100">
            비과세 상품 (ISA·청년도약계좌·조합예탁금 등)
          </span>
        </label>

        {/* 결과 */}
        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            만기 원리금 (세후)
          </p>
          <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
            {fmt(result.maturity)}원
          </p>
          <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>{product === "savings" ? "총 적립 원금" : "예치금 원금"}</span>
              <span>{fmt(result.principal)}원</span>
            </div>
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>세전 이자</span>
              <span>+{fmt(result.interest)}원</span>
            </div>
            {!taxFree && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>이자소득세 (15.4%)</span>
                <span>-{fmt(result.tax)}원</span>
              </div>
            )}
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-2 border-t border-electric-20 mt-2">
              <span>세후 이자</span>
              <span>+{fmt(result.netInterest)}원</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 일반 시중은행 정기예적금은 대부분 단리입니다. 복리는 일부 상품(예: 적립식 펀드, 일부
          저축은행 상품)에만 적용됩니다. 정확한 금리·세금·우대조건은 가입 전 은행 공시 자료를
          확인하세요. 본 계산기는 시뮬레이션 추정치입니다.
        </p>
      </div>
    </section>
  );
}
