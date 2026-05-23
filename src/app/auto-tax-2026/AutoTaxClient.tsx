"use client";

import { useMemo, useState } from "react";

const CC_RATES: Array<{ ceil: number; rate: number; label: string }> = [
  { ceil: 1000, rate: 80, label: "1,000cc 이하 (80원/cc)" },
  { ceil: 1600, rate: 140, label: "1,001~1,600cc (140원/cc)" },
  { ceil: Infinity, rate: 200, label: "1,601cc 이상 (200원/cc)" },
];

function getCCRate(cc: number): number {
  const tier = CC_RATES.find((t) => cc <= t.ceil);
  return tier ? tier.rate : 200;
}

function getDepreciationRate(years: number): number {
  // 3년차부터 매년 5%씩 경감 (최대 50%)
  if (years < 3) return 0;
  return Math.min(0.5, (years - 2) * 0.05);
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function AutoTaxClient() {
  const [cc, setCc] = useState(2000);
  const [years, setYears] = useState(3);
  const [isElectric, setIsElectric] = useState(false);
  const [yearlyPayment, setYearlyPayment] = useState(false);

  const result = useMemo(() => {
    let baseTax: number;
    if (isElectric) {
      baseTax = 130000;
    } else {
      baseTax = cc * getCCRate(cc);
    }
    const depRate = getDepreciationRate(years);
    const depreciated = baseTax * (1 - depRate);
    const educationTax = depreciated * 0.3;
    let total = depreciated + educationTax;
    if (yearlyPayment) {
      total = total * 0.93; // 1월 연납 7% 할인
    }
    return {
      baseTax,
      depRate: Math.round(depRate * 100),
      depreciated,
      educationTax,
      total,
      halfPayment: Math.round(((depreciated + educationTax) / 2)),
      yearlyDiscount: (depreciated + educationTax) * 0.07,
    };
  }, [cc, years, isElectric, yearlyPayment]);

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 자동차세 즉시 계산
        </h2>

        {/* 전기차 토글 */}
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isElectric}
            onChange={(e) => setIsElectric(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-navy dark:text-canvas-100">
            전기차 (배기량 무관 연 13만원 정액)
          </span>
        </label>

        {/* 배기량 */}
        {!isElectric && (
          <div className="mb-4">
            <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
              배기량 (cc)
            </label>
            <input
              type="number"
              value={cc}
              onChange={(e) => setCc(Math.max(0, Number(e.target.value) || 0))}
              min={0}
              max={10000}
              step={1}
              className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
              aria-label="배기량 (cc)"
            />
            <p className="mt-2 text-xs text-faint-blue">
              현재 적용 세율: {getCCRate(cc)}원/cc ({CC_RATES.find((t) => cc <= t.ceil)?.label})
            </p>
          </div>
        )}

        {/* 차령 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            차령 (보유 연수): {years}년차
          </label>
          <input
            type="range"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min={1}
            max={15}
            step={1}
            className="w-full"
            aria-label="차령 (보유 연수)"
          />
          <p className="mt-2 text-xs text-faint-blue">
            경감률: {result.depRate}% {years < 3 ? "(3년차부터 경감 시작)" : `(매년 5%씩 차감, 최대 50%)`}
          </p>
        </div>

        {/* 연납 여부 */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={yearlyPayment}
            onChange={(e) => setYearlyPayment(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-navy dark:text-canvas-100">
            1월 연납 (약 7% 할인 적용)
          </span>
        </label>

        {/* 결과 */}
        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            최종 자동차세 (2026년 기준)
          </p>
          <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
            {fmt(result.total)}원
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>본세 (배기량/정액)</span>
              <span>{fmt(result.baseTax)}원</span>
            </div>
            {result.depRate > 0 && (
              <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                <span>차령 경감 ({result.depRate}%) 후</span>
                <span>{fmt(result.depreciated)}원</span>
              </div>
            )}
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>지방교육세 (30%)</span>
              <span>+{fmt(result.educationTax)}원</span>
            </div>
            {yearlyPayment && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>1월 연납 할인 (7%)</span>
                <span>-{fmt(result.yearlyDiscount)}원</span>
              </div>
            )}
          </div>

          {!yearlyPayment && (
            <div className="mt-4 pt-4 border-t border-electric-20">
              <p className="text-xs font-bold text-navy dark:text-canvas-100 mb-1">
                분납 시 6월·12월 각각 납부
              </p>
              <p className="text-lg font-black text-navy dark:text-canvas-50">
                {fmt(result.halfPayment)}원 × 2회
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 비영업용 승용차 기준. 영업용·승합·화물·이륜차는 별도 세율 적용. 실제 자동차세는 지자체
          공시 기준이며 본 계산기는 추정치입니다. 정확한 금액은 위택스(wetax.go.kr) 또는 자동차세
          모바일 앱에서 확인하세요.
        </p>
      </div>
    </section>
  );
}
