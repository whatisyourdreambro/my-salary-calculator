"use client";

import { useMemo, useState } from "react";

// 재산세 (주택분, 만원 단위 변환 후 적용)
function calcPropertyTax(publishedValue: number, fairMarketRatio = 0.6): number {
  const taxableBase = publishedValue * fairMarketRatio;
  if (taxableBase <= 60_000_000) return taxableBase * 0.001;
  if (taxableBase <= 150_000_000) return 60_000 + (taxableBase - 60_000_000) * 0.0015;
  if (taxableBase <= 300_000_000) return 195_000 + (taxableBase - 150_000_000) * 0.0025;
  return 570_000 + (taxableBase - 300_000_000) * 0.004;
}

// 종합부동산세 (일반세율, 1세대 1주택 12억 공제)
function calcComprehensiveTax(
  publishedValue: number,
  isOnlyOneHome: boolean,
  numHomes: number,
  fairMarketRatio = 0.6
): number {
  const deduction = isOnlyOneHome ? 1_200_000_000 : numHomes === 1 ? 900_000_000 : 0;
  const afterDeduction = Math.max(0, publishedValue - deduction);
  const taxableBase = afterDeduction * fairMarketRatio;

  if (taxableBase <= 0) return 0;
  if (taxableBase <= 300_000_000) return taxableBase * 0.005;
  if (taxableBase <= 600_000_000) return 1_500_000 + (taxableBase - 300_000_000) * 0.007;
  if (taxableBase <= 1_200_000_000) return 3_600_000 + (taxableBase - 600_000_000) * 0.01;
  if (taxableBase <= 2_500_000_000) return 9_600_000 + (taxableBase - 1_200_000_000) * 0.013;
  if (taxableBase <= 5_000_000_000) return 26_500_000 + (taxableBase - 2_500_000_000) * 0.015;
  if (taxableBase <= 9_400_000_000) return 64_000_000 + (taxableBase - 5_000_000_000) * 0.02;
  return 152_000_000 + (taxableBase - 9_400_000_000) * 0.027;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function PropertyHoldingTaxClient() {
  const [publishedValue, setPublishedValue] = useState(1_000_000_000);
  const [numHomes, setNumHomes] = useState(1);
  const [isOnlyOneHome, setIsOnlyOneHome] = useState(true);

  const result = useMemo(() => {
    const propertyTax = calcPropertyTax(publishedValue);
    const educationTax = propertyTax * 0.2; // 지방교육세 20%
    const comprehensiveTax = calcComprehensiveTax(publishedValue, isOnlyOneHome && numHomes === 1, numHomes);
    const totalRegional = propertyTax + educationTax;
    const total = totalRegional + comprehensiveTax;
    return { propertyTax, educationTax, comprehensiveTax, totalRegional, total };
  }, [publishedValue, numHomes, isOnlyOneHome]);

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 부동산 보유세 즉시 계산
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            주택 공시가격 (원)
          </label>
          <input
            type="number"
            value={publishedValue}
            onChange={(e) => setPublishedValue(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={100_000_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="주택 공시가격 (원)"
          />
          <p className="mt-2 text-xs text-faint-blue">
            {fmt(publishedValue / 100_000_000)}억{" "}
            {fmt((publishedValue % 100_000_000) / 10000)}만원
            (시세 약 {fmt((publishedValue * 1.5) / 100_000_000)}억 수준)
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            보유 주택 수: {numHomes}주택{numHomes >= 3 ? " (다주택자 중과 대상 가능)" : ""}
          </label>
          <input
            type="range"
            value={numHomes}
            onChange={(e) => setNumHomes(Number(e.target.value))}
            min={1}
            max={5}
            step={1}
            className="w-full"
            aria-label="보유 주택 수"
          />
          <div className="flex justify-between text-xs text-faint-blue mt-1">
            <span>1주택</span>
            <span>2주택</span>
            <span>3주택+</span>
          </div>
        </div>

        {numHomes === 1 && (
          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={isOnlyOneHome}
              onChange={(e) => setIsOnlyOneHome(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-navy dark:text-canvas-100">
              1세대 1주택자 (12억 공제 + 우대세율 적용)
            </span>
          </label>
        )}

        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            연 보유세 총액
          </p>
          <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
            {fmt(result.total)}원
          </p>
          <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>재산세 (7·9월 분납)</span>
              <span>{fmt(result.propertyTax)}원</span>
            </div>
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>지방교육세 (재산세의 20%)</span>
              <span>+{fmt(result.educationTax)}원</span>
            </div>
            <div className="flex justify-between text-navy dark:text-canvas-100 font-bold pt-2 border-t border-electric-20 mt-2">
              <span>재산세 합계 (7·9월)</span>
              <span>{fmt(result.totalRegional)}원</span>
            </div>
            <div className="flex justify-between text-muted-blue dark:text-canvas-300 pt-2">
              <span>종합부동산세 (12월)</span>
              <span>{result.comprehensiveTax > 0 ? fmt(result.comprehensiveTax) + "원" : "—"}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 공정시장가액비율 60% 가정 (정부 정책에 따라 변동). 1세대 1주택 우대세율, 세부담상한제,
          고령자·장기보유 세액공제는 단순화되어 있습니다. 정확한 금액은 위택스(wetax.go.kr) 또는
          국세청 홈택스에서 확인하세요.
        </p>
      </div>
    </section>
  );
}
