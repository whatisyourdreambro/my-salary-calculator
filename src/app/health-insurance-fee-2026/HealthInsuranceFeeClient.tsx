"use client";

import { useMemo, useState } from "react";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

type Type = "workplace" | "regional";

export default function HealthInsuranceFeeClient() {
  const [type, setType] = useState<Type>("workplace");
  const [monthlyWage, setMonthlyWage] = useState(4_000_000);
  const [regionalScore, setRegionalScore] = useState(1500);

  const result = useMemo(() => {
    if (type === "workplace") {
      const healthFee = monthlyWage * 0.03595;
      const longTermCare = healthFee * 0.1314;
      const totalSelf = healthFee + longTermCare;
      const totalCompany = totalSelf; // 회사도 동일 분담
      return {
        type: "workplace" as const,
        healthFee,
        longTermCare,
        totalSelf,
        totalCompany,
        annual: totalSelf * 12,
      };
    } else {
      // 지역가입자 부과점수당 금액: 2026년 211.5원 확정 (국민건강보험법 시행령)
      const pointValue = 211.5;
      const healthFee = regionalScore * pointValue;
      const longTermCare = healthFee * 0.1314;
      const totalSelf = healthFee + longTermCare;
      return {
        type: "regional" as const,
        healthFee,
        longTermCare,
        totalSelf,
        totalCompany: 0,
        annual: totalSelf * 12,
      };
    }
  }, [type, monthlyWage, regionalScore]);

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 건강보험료 즉시 계산
        </h2>

        {/* 가입 유형 토글 */}
        <div className="mb-5 grid grid-cols-2 gap-2 p-1 bg-canvas-100 dark:bg-canvas-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setType("workplace")}
            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
              type === "workplace"
                ? "bg-white dark:bg-canvas-900 text-electric shadow-sm"
                : "text-muted-blue dark:text-canvas-300"
            }`}
          >
            직장가입자
          </button>
          <button
            type="button"
            onClick={() => setType("regional")}
            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
              type === "regional"
                ? "bg-white dark:bg-canvas-900 text-electric shadow-sm"
                : "text-muted-blue dark:text-canvas-300"
            }`}
          >
            지역가입자
          </button>
        </div>

        {type === "workplace" ? (
          <div className="mb-4">
            <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
              월 보수액 (비과세 제외, 원)
            </label>
            <input
              type="number"
              value={monthlyWage}
              onChange={(e) => setMonthlyWage(Math.max(0, Number(e.target.value) || 0))}
              min={0}
              step={100_000}
              className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
              aria-label="월 보수액"
            />
            <p className="mt-2 text-xs text-faint-blue">
              연봉 {fmt((monthlyWage * 12) / 10000)}만원 수준 (식대 20만원 등 비과세 제외)
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
              부과 점수: {fmt(regionalScore)}점
            </label>
            <input
              type="range"
              value={regionalScore}
              onChange={(e) => setRegionalScore(Number(e.target.value))}
              min={100}
              max={5000}
              step={50}
              className="w-full"
              aria-label="부과 점수"
            />
            <p className="mt-2 text-xs text-faint-blue">
              ※ 재산 점수 기준(자동차 부과는 2024년 폐지, 소득은 정률 7.19% 별도). 평균 자영업자 약 1,500~2,500점. 정확한 점수는 건보공단에서 조회.
            </p>
          </div>
        )}

        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            월 본인 부담 (건보료 + 장기요양)
          </p>
          <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
            {fmt(result.totalSelf)}원
          </p>
          <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>건강보험료</span>
              <span>{fmt(result.healthFee)}원</span>
            </div>
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>장기요양보험료 (건보료의 13.14%)</span>
              <span>+{fmt(result.longTermCare)}원</span>
            </div>
            {result.type === "workplace" && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-2 border-t border-electric-20 mt-2">
                <span>회사 분담분 (별도)</span>
                <span>+{fmt(result.totalCompany)}원</span>
              </div>
            )}
            <div className="flex justify-between text-navy dark:text-canvas-50 font-bold pt-2 border-t border-electric-20 mt-2">
              <span>연 본인 부담</span>
              <span>{fmt(result.annual)}원</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 2026년 보험료율: 직장가입자 7.19%(본인 3.595% + 회사 3.595%) + 장기요양 13.14%(건보료의).
          지역가입자 점수당 211.5원(2026년 확정) 기준. 정확한 금액은 건강보험공단(1577-1000) 또는 건보공단 홈페이지에서 조회하세요.
        </p>
      </div>
    </section>
  );
}
