"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 재산세 (주택분) — 1세대 1주택 특례 반영 (2026년 기준, 행안부·지방세법)
// · 공정시장가액비율: 1세대1주택 43~45% 특례(공시 3억 이하 43% / 3~6억 44% /
//   6억 초과 45% — 2026년 유지 확정), 그 외 일반 60%
// · 특례세율: 1세대1주택 & 공시가 9억 이하 → 표준세율 대비 구간별 0.05%p 인하
//   (지방세법 제111조의2, 2026년 납부분까지 연장)
function calcPropertyTax(publishedValue: number, isSpecialOneHome: boolean): number {
  const fairMarketRatio = isSpecialOneHome
    ? publishedValue <= 300_000_000
      ? 0.43
      : publishedValue <= 600_000_000
      ? 0.44
      : 0.45
    : 0.6;
  const taxableBase = publishedValue * fairMarketRatio;

  if (isSpecialOneHome && publishedValue <= 900_000_000) {
    // 특례세율 0.05~0.35% (누진공제 3만/12만/42만원)
    if (taxableBase <= 60_000_000) return taxableBase * 0.0005;
    if (taxableBase <= 150_000_000) return 30_000 + (taxableBase - 60_000_000) * 0.001;
    if (taxableBase <= 300_000_000) return 120_000 + (taxableBase - 150_000_000) * 0.002;
    return 420_000 + (taxableBase - 300_000_000) * 0.0035;
  }
  // 표준세율 0.1~0.4% (누진공제 6만/19.5만/57만원)
  if (taxableBase <= 60_000_000) return taxableBase * 0.001;
  if (taxableBase <= 150_000_000) return 60_000 + (taxableBase - 60_000_000) * 0.0015;
  if (taxableBase <= 300_000_000) return 195_000 + (taxableBase - 150_000_000) * 0.0025;
  return 570_000 + (taxableBase - 300_000_000) * 0.004;
}

// 종합부동산세 (일반세율 기준)
// 기본공제: 1세대 1주택 12억원, 그 외 인별 9억원 (2023년 개정 — 다주택자도 9억.
// 이전 코드가 다주택 공제 0원으로 계산해 최대 12배 과대산출하던 것을 정정)
function calcComprehensiveTax(
  publishedValue: number,
  isOnlyOneHome: boolean,
  fairMarketRatio = 0.6
): number {
  const deduction = isOnlyOneHome ? 1_200_000_000 : 900_000_000;
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
    const special = isOnlyOneHome && numHomes === 1;
    const propertyTax = calcPropertyTax(publishedValue, special);
    const educationTax = propertyTax * 0.2; // 지방교육세 20%
    const comprehensiveTax = calcComprehensiveTax(publishedValue, special);
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
              1세대 1주택자 (종부세 12억 공제 + 재산세 특례세율·공정시장가액비율
              43~45% 적용)
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
              <span>재산세 (7·9월 분납 · 20만원 이하는 7월 일괄)</span>
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

        {/* 결과 직하 다음 액션 — 보유세 확인 직후 절세·자금 계획으로 연결 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/tools/real-estate/gift-tax"
            className="group inline-flex items-center gap-1 text-xs font-bold text-electric bg-electric-5 border border-electric-20 rounded-full px-3 py-1.5 hover:bg-electric hover:text-white transition-colors"
          >
            공동명의·증여로 줄이려면? 증여세 계산
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </Link>
          <Link
            href="/tools/real-estate/acquisition-tax"
            className="group inline-flex items-center gap-1 text-xs font-bold text-electric bg-electric-5 border border-electric-20 rounded-full px-3 py-1.5 hover:bg-electric hover:text-white transition-colors"
          >
            매수 계획이면 취득세 먼저 계산
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </Link>
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 2026년 기준 — 1세대 1주택은 공정시장가액비율 43~45% 특례와
          특례세율(공시 9억 이하)을 반영하며, 그 외는 60%·표준세율 기준입니다.
          도시지역분 재산세(과표의 0.14%), 종부세의 재산세 중복분 공제,
          3주택 이상 중과세율(과표 12억 초과분 2.0~5.0%), 과세표준상한제·세부담상한은
          단순화를 위해 미반영 — 실제 고지액과 차이가 날 수 있습니다. 정확한 금액은
          위택스(wetax.go.kr)·홈택스에서 확인하세요.
        </p>
      </div>
    </section>
  );
}
