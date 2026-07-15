"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PENSION_BASE_2026 } from "@/lib/taxConstants2026";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

/**
 * 단순화된 국민연금 예상수령액 계산:
 *  - 40년 가입 시 소득대체율 43% (2026년 적용, 연금개혁 반영)
 *  - 가입기간에 비례 감소 (40년 기준 100%)
 *  - 10년 미만은 반환일시금 처리 (월 연금 0)
 *  - 기준소득월액 상·하한 클램프 — 상한(월 659만원) 초과 소득은 연금 산정에
 *    반영되지 않으므로 고소득 입력 시 불가능한 연금액이 나오지 않게 방어
 */
function calcMonthlyPension(years: number, avgMonthlyIncome: number): number {
  if (years < 10) return 0;
  const clampedIncome = Math.min(
    Math.max(avgMonthlyIncome, PENSION_BASE_2026.MIN_MONTHLY),
    PENSION_BASE_2026.MAX_MONTHLY
  );
  const yearRatio = Math.min(1, years / 40);
  const replacementRate = 0.43; // 40년 기준 43% (2026년 적용)
  return clampedIncome * replacementRate * yearRatio;
}

export default function NationalPensionClient() {
  const [years, setYears] = useState(30);
  const [avgIncome, setAvgIncome] = useState(4_000_000);

  const result = useMemo(() => {
    const monthly = calcMonthlyPension(years, avgIncome);
    const annual = monthly * 12;
    const total25y = annual * 25; // 만 65세부터 90세까지 25년 수령 가정
    const effectiveRate = avgIncome > 0 ? (monthly / avgIncome) * 100 : 0;
    return { monthly, annual, total25y, effectiveRate, eligible: years >= 10 };
  }, [years, avgIncome]);

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 국민연금 예상수령액 즉시 계산
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            가입기간: {years}년{years < 10 ? " (10년 미만 = 반환일시금)" : ""}
          </label>
          <input
            type="range"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min={1}
            max={45}
            step={1}
            className="w-full"
            aria-label="가입기간"
          />
          <div className="flex justify-between text-xs text-faint-blue mt-1">
            <span>1년</span>
            <span className={years >= 10 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
              10년 (최소)
            </span>
            <span>30년</span>
            <span>40년 (만점)</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            가입 중 평균 월소득 (현재 가치, 원)
          </label>
          <input
            type="number"
            value={avgIncome}
            onChange={(e) => setAvgIncome(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={100_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="가입 중 평균 월소득"
          />
          <p className="mt-2 text-xs text-faint-blue">
            {fmt(avgIncome / 10000)}만원 (기준소득월액 상한 659만원까지만 보험료·연금
            산정에 반영, 2026.7~2027.6)
          </p>
        </div>

        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          {result.eligible ? (
            <>
              <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
                예상 월 노령연금 (만 65세부터)
              </p>
              <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
                {fmt(result.monthly)}원
              </p>
              <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>실 소득대체율</span>
                  <span>{result.effectiveRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>연 수령액</span>
                  <span>{fmt(result.annual)}원</span>
                </div>
                <div className="flex justify-between text-navy dark:text-canvas-50 font-bold pt-2 border-t border-electric-20 mt-2">
                  <span>25년 수령 누적 (~만 90세)</span>
                  <span>{fmt(result.total25y / 10000)}만원</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                노령연금 미수급 (10년 미만)
              </p>
              <p className="text-2xl font-black text-rose-600 mb-3">반환일시금</p>
              <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
                가입기간 10년(120개월) 미만이라 노령연금을 받을 수 없습니다. 대신 그동안 납입한
                보험료에 이자를 더해 일시금으로 반환받게 됩니다. 만 60세 이후 임의계속가입(최대 5년)으로
                가입기간을 채우면 노령연금 수급 자격을 확보할 수 있습니다.
              </p>
            </>
          )}
        </div>

        {/* 결과 직하 다음 액션 — 연금 부족분 대비·다른 공제 확인으로 연결 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/tools/finance/irp"
            className="group inline-flex items-center gap-1 text-xs font-bold text-electric bg-electric-5 border border-electric-20 rounded-full px-3 py-1.5 hover:bg-electric hover:text-white transition-colors"
          >
            국민연금만으론 부족? IRP·연금저축 절세
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </Link>
          <Link
            href="/fire-calculator"
            className="group inline-flex items-center gap-1 text-xs font-bold text-electric bg-electric-5 border border-electric-20 rounded-full px-3 py-1.5 hover:bg-electric hover:text-white transition-colors"
          >
            은퇴 필요 자금 전체 계산 (FIRE)
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </Link>
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 본 계산기는 40년 가입 시 소득대체율 43%(2026년 적용)를 기준으로 한 단순 추정치입니다.
          실제로는 연도별 소득대체율이 다르지만 40년 전 기간에 43%를 가정해 단순화했습니다. 실제
          연금액은 A값(전체 가입자 평균소득)·B값(본인 평균소득)·물가상승률 등을 반영한 정밀 공식으로
          산정되며, 국민연금공단(1355) 또는 NPS 홈페이지의 &quot;내 연금 알아보기&quot;에서 정확한
          금액을 확인하세요.
        </p>
      </div>
    </section>
  );
}
