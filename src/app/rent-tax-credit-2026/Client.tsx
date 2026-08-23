"use client";

// src/app/rent-tax-credit-2026/Client.tsx
// 월세 세액공제 계산기 — 2026년 귀속(현행법) 조세특례제한법 제95조의2 기준.
// 국세청 공식 안내(nts.go.kr, 2026-08 조회)로 검증된 파라미터만 사용.

import { useMemo, useState } from "react";
import { RENT_CREDIT_2026 } from "@/lib/taxConstants2026";

// ── 2026년 귀속 현행법 파라미터 — 정본은 taxConstants2026 (엔진과 공유) ──
const RENT_CREDIT_CAP = RENT_CREDIT_2026.CAP;
const SALARY_CAP = RENT_CREDIT_2026.SALARY_CAP;
const SALARY_17_MAX = RENT_CREDIT_2026.SALARY_17_MAX;
const RATE_HIGH = RENT_CREDIT_2026.RATE_HIGH;
const RATE_LOW = RENT_CREDIT_2026.RATE_LOW;

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function RentTaxCreditClient() {
  const [totalSalary, setTotalSalary] = useState(40_000_000);
  const [monthlyRent, setMonthlyRent] = useState(500_000);
  const [months, setMonths] = useState(12);
  const [isNoHouse, setIsNoHouse] = useState(true); // 무주택 세대의 세대주(또는 요건 충족 세대원)
  const [isHouseOk, setIsHouseOk] = useState(true); // 전용 85㎡ 이하 또는 기준시가 4억원 이하
  const [isMoveIn, setIsMoveIn] = useState(true); // 전입신고 완료 (계약서 주소 = 등본 주소)

  const result = useMemo(() => {
    const reasons: string[] = [];
    if (totalSalary > SALARY_CAP) {
      reasons.push(
        "총급여 8,000만원 초과 — 월세 세액공제 대상이 아닙니다 (종합소득금액 7,000만원 초과자도 제외)."
      );
    }
    if (!isNoHouse) {
      reasons.push(
        "무주택 세대 요건 미충족 — 과세기간 종료일(12월 31일) 현재 무주택 세대의 세대주여야 합니다. 세대주가 주택 관련 공제를 받지 않았다면 세대원도 가능합니다."
      );
    }
    if (!isHouseOk) {
      reasons.push(
        "주택 요건 미충족 — 전용면적 85㎡ 이하 또는 기준시가 4억원 이하, 둘 중 하나는 충족해야 합니다."
      );
    }
    if (!isMoveIn) {
      reasons.push(
        "전입신고 미완료 — 임대차계약증서 주소지와 주민등록등본 주소지가 같아야 공제받을 수 있습니다."
      );
    }

    const eligible = reasons.length === 0;
    const rate = totalSalary <= SALARY_17_MAX ? RATE_HIGH : RATE_LOW;
    const annualRent = monthlyRent * months;
    const creditBase = Math.min(annualRent, RENT_CREDIT_CAP);
    // 부동소수점 오차 방지 (10,000,000 × 0.17 = 1,700,000.0000000002) — 원 단위 반올림
    const credit = eligible ? Math.round(creditBase * rate) : 0;

    return {
      eligible,
      reasons,
      rate,
      ratePercent: rate === RATE_HIGH ? 17 : 15,
      annualRent,
      creditBase,
      credit,
      cappedAmount: Math.max(0, annualRent - RENT_CREDIT_CAP),
    };
  }, [totalSalary, monthlyRent, months, isNoHouse, isHouseOk, isMoveIn]);

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 월세 세액공제 즉시 계산
        </h2>

        {/* 1단계 — 총급여 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ① 총급여 (연봉, 비과세 제외 · 원)
          </label>
          <input
            type="number"
            value={totalSalary}
            onChange={(e) => setTotalSalary(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={1_000_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="총급여"
          />
          <p className="mt-2 text-xs text-faint-blue">
            총급여 {fmt(totalSalary / 10000)}만원 →{" "}
            {totalSalary > SALARY_CAP
              ? "8,000만원 초과 (공제 대상 아님)"
              : totalSalary <= SALARY_17_MAX
                ? "5,500만원 이하 구간 → 공제율 17%"
                : "5,500만원 초과~8,000만원 이하 구간 → 공제율 15%"}
          </p>
        </div>

        {/* 2단계 — 월세액 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ② 월세액 (월 단위 · 원)
          </label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={50_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="월세액"
          />
          <p className="mt-2 text-xs text-faint-blue">
            보증금은 입력하지 않습니다. 해당 연도에 실제 지급한 월세만 공제 대상입니다.
          </p>
        </div>

        {/* 3단계 — 지급 개월 수 */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ③ 올해 월세 지급 개월 수: {months}개월
          </label>
          <input
            type="range"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            min={1}
            max={12}
            step={1}
            className="w-full"
            aria-label="월세 지급 개월 수"
          />
          <p className="mt-2 text-xs text-faint-blue">
            연간 월세 지급액: {fmt(result.annualRent)}원 (월 {fmt(monthlyRent)}원 × {months}개월)
          </p>
        </div>

        {/* 4단계 — 요건 체크 */}
        <fieldset className="mb-6 space-y-3">
          <legend className="block text-sm font-bold text-navy dark:text-canvas-100 mb-1">
            ④ 공제 요건 확인 (모두 충족해야 공제 가능)
          </legend>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isNoHouse}
              onChange={(e) => setIsNoHouse(e.target.checked)}
              className="w-4 h-4 mt-0.5"
            />
            <span className="text-sm font-medium text-navy dark:text-canvas-100">
              12월 31일 현재 무주택 세대의 세대주입니다
              <span className="block text-xs font-normal text-faint-blue mt-0.5">
                세대주가 주택자금공제·주택마련저축공제 등을 받지 않았다면 세대원도 가능
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isHouseOk}
              onChange={(e) => setIsHouseOk(e.target.checked)}
              className="w-4 h-4 mt-0.5"
            />
            <span className="text-sm font-medium text-navy dark:text-canvas-100">
              전용면적 85㎡ 이하 또는 기준시가 4억원 이하 주택입니다
              <span className="block text-xs font-normal text-faint-blue mt-0.5">
                둘 중 하나만 충족하면 됨 — 주거용 오피스텔·고시원 포함
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isMoveIn}
              onChange={(e) => setIsMoveIn(e.target.checked)}
              className="w-4 h-4 mt-0.5"
            />
            <span className="text-sm font-medium text-navy dark:text-canvas-100">
              전입신고를 마쳤습니다 (계약서 주소지 = 주민등록등본 주소지)
              <span className="block text-xs font-normal text-faint-blue mt-0.5">
                임대차계약은 본인 또는 본인의 기본공제대상자 명의여야 함
              </span>
            </span>
          </label>
        </fieldset>

        {/* 결과 카드 */}
        {result.eligible ? (
          <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
            <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
              예상 월세 세액공제액 (2026년 귀속)
            </p>
            <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
              {fmt(result.credit)}원
            </p>
            <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
              <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                <span>연간 월세 지급액</span>
                <span>{fmt(result.annualRent)}원</span>
              </div>
              <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                <span>공제 대상액 (연 1,000만원 한도)</span>
                <span>{fmt(result.creditBase)}원</span>
              </div>
              {result.cappedAmount > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>한도 초과로 제외된 월세</span>
                  <span>-{fmt(result.cappedAmount)}원</span>
                </div>
              )}
              <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                <span>공제율 (총급여 기준 자동 판정)</span>
                <span>{result.ratePercent}%</span>
              </div>
              <div className="flex justify-between text-navy dark:text-canvas-50 font-bold pt-2 border-t border-electric-20 mt-2">
                <span>예상 절세액 (산출세액에서 차감)</span>
                <span>{fmt(result.credit)}원</span>
              </div>
            </div>

            {/* 계산 근거 상세 */}
            <details className="mt-4 pt-3 border-t border-electric-20">
              <summary className="cursor-pointer text-xs font-bold text-navy dark:text-canvas-100">
                계산 근거 자세히 보기
              </summary>
              <ol className="mt-2 space-y-1 text-xs leading-6 text-muted-blue dark:text-canvas-300 list-decimal list-inside">
                <li>
                  연간 월세 지급액 = 월 {fmt(monthlyRent)}원 × {months}개월 ={" "}
                  {fmt(result.annualRent)}원
                </li>
                <li>
                  공제 대상액 = min({fmt(result.annualRent)}원, 한도 1,000만원) ={" "}
                  {fmt(result.creditBase)}원
                </li>
                <li>
                  공제율 판정: 총급여 {fmt(totalSalary / 10000)}만원은{" "}
                  {result.ratePercent === 17
                    ? "5,500만원 이하(경계 포함)이므로 17%"
                    : "5,500만원 초과~8,000만원 이하이므로 15%"}
                </li>
                <li>
                  세액공제액 = {fmt(result.creditBase)}원 × {result.ratePercent}% ={" "}
                  {fmt(result.credit)}원
                </li>
              </ol>
              <p className="mt-2 text-xs leading-5 text-faint-blue">
                근거: 조세특례제한법 제95조의2 (월세액 세액공제). 공제액은 산출세액에서 직접
                차감되며, 산출세액을 초과하는 부분은 환급되지 않습니다.
              </p>
            </details>
          </div>
        ) : (
          <div className="mt-6 p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
              공제 요건 미충족
            </p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 mb-3">
              공제 대상이 아닙니다
            </p>
            <ul className="space-y-2 text-sm leading-6 text-red-800 dark:text-red-300 list-disc list-inside">
              {result.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 간이 계산입니다. 총급여 5,500만원 이하라도 종합소득금액이 4,500만원을 초과하면
          15%가 적용되고, 종합소득금액 7,000만원 초과 시 공제 대상에서 제외됩니다. 월세
          세액공제는 산출세액 한도 내에서만 차감되며(초과분 환급 없음), 실제 정산 결과는
          연말정산 시 국세청 홈택스·회사 정산 자료 기준으로 확정됩니다.
        </p>
      </div>
    </section>
  );
}
