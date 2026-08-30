"use client";

// src/app/donation-tax-credit-2026/Client.tsx
// 기부금 세액공제 계산기 — 2026년 귀속(현행법).
// 소득세법 §59의4·조특법 §76(정치자금)·§58(고향사랑) 확정값만 사용.
// 계산 로직 정본: src/lib/donationCredit.ts (vitest 검증 완료 2026-08-31)

import { useMemo, useState } from "react";
import {
  calcDonationCredit2026,
  DONATION_CREDIT_2026,
} from "@/lib/donationCredit";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

const FIELDS = [
  {
    key: "statutory" as const,
    label: "② 특례(법정)기부금",
    hint: "국가·지자체 기부, 이재민 구호금품, 국립대병원·사립학교 시설비 등",
  },
  {
    key: "general" as const,
    label: "③ 일반(지정)기부금 — 종교단체 외",
    hint: "사회복지법인·공익법인·NGO 등 (유니세프·굿네이버스 등 지정 단체)",
  },
  {
    key: "religious" as const,
    label: "④ 종교단체 기부금",
    hint: "교회 헌금·절 시주 등 — 소속 교파 총회 등록 단체 기준",
  },
  {
    key: "political" as const,
    label: "⑤ 정치자금기부금 (본인 지출만)",
    hint: "정당·후보자·선관위 기탁금 — 배우자·부양가족 지출분은 공제 불가",
  },
  {
    key: "hometown" as const,
    label: "⑥ 고향사랑기부금 (본인 지출만)",
    hint: "주소지 외 지자체 기부 — 연 2,000만원 한도, 답례품 30% 별도",
  },
];

export default function DonationTaxCreditClient() {
  const [grossSalary, setGrossSalary] = useState(50_000_000);
  const [amounts, setAmounts] = useState({
    statutory: 0,
    general: 1_200_000,
    religious: 0,
    political: 0,
    hometown: 100_000,
  });

  const result = useMemo(
    () => calcDonationCredit2026({ grossSalary, ...amounts }),
    [grossSalary, amounts]
  );

  const totalInput =
    amounts.statutory +
    amounts.general +
    amounts.religious +
    amounts.political +
    amounts.hometown;

  const setAmount = (key: keyof typeof amounts, value: number) =>
    setAmounts((prev) => ({ ...prev, [key]: Math.max(0, value || 0) }));

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 기부금 세액공제 즉시 계산
        </h2>

        {/* 1단계 — 총급여 */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ① 총급여 (연봉, 비과세 제외 · 원)
          </label>
          <input
            type="number"
            value={grossSalary}
            onChange={(e) => setGrossSalary(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={1_000_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label="총급여"
          />
          <p className="mt-2 text-xs text-faint-blue">
            근로소득금액(총급여 − 근로소득공제) = {fmt(result.earnedIncomeAmount)}원 —
            기부금 공제 한도의 기준이 됩니다.
          </p>
        </div>

        {/* 2단계 — 기부 유형별 금액 */}
        <fieldset className="mb-6 space-y-4">
          <legend className="block text-sm font-bold text-navy dark:text-canvas-100 mb-1">
            올해 기부한 금액을 유형별로 입력하세요 (원)
          </legend>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-1.5">
                {f.label}
              </label>
              <input
                type="number"
                value={amounts[f.key]}
                onChange={(e) => setAmount(f.key, Number(e.target.value))}
                min={0}
                step={100_000}
                className="w-full px-4 py-2.5 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold focus:outline-none focus:border-electric"
                aria-label={f.label}
              />
              <p className="mt-1 text-xs text-faint-blue">{f.hint}</p>
            </div>
          ))}
        </fieldset>

        {/* 결과 카드 */}
        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            예상 기부금 세액공제액 (2026년 귀속)
          </p>
          <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
            {fmt(result.totalCredit)}원
          </p>

          <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>총 기부액</span>
              <span>{fmt(totalInput)}원</span>
            </div>
            {result.politicalCredit > 0 && (
              <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                <span>정치자금 공제 (10만원까지 100/110)</span>
                <span>{fmt(result.politicalCredit)}원</span>
              </div>
            )}
            {result.hometownCredit > 0 && (
              <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                <span>고향사랑 공제 (10만원까지 100/110)</span>
                <span>{fmt(result.hometownCredit)}원</span>
              </div>
            )}
            {result.generalAxisCredit > 0 && (
              <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                <span>특례+일반 합산 공제 (15%·30%)</span>
                <span>{fmt(result.generalAxisCredit)}원</span>
              </div>
            )}
            {result.hometownGiftValue > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>+ 고향사랑 답례품 혜택 (기부액 30% 포인트)</span>
                <span>{fmt(result.hometownGiftValue)}원 상당</span>
              </div>
            )}
          </div>

          {/* 한도 초과분 안내 */}
          {(result.carryoverTotal > 0 ||
            result.politicalExcess > 0 ||
            result.hometownExcess > 0) && (
            <div className="mt-3 pt-3 border-t border-electric-20 space-y-1 text-sm">
              {result.carryoverTotal > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>
                    한도 초과분 (특례·일반) — 최대{" "}
                    {DONATION_CREDIT_2026.CARRYOVER_YEARS}년 이월공제 가능
                  </span>
                  <span>{fmt(result.carryoverTotal)}원</span>
                </div>
              )}
              {result.politicalExcess > 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>정치자금 한도 초과분 — 이월 불가(소멸)</span>
                  <span>{fmt(result.politicalExcess)}원</span>
                </div>
              )}
              {result.hometownExcess > 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>고향사랑 연 2,000만원 초과분 — 기부 불가·이월 불가</span>
                  <span>{fmt(result.hometownExcess)}원</span>
                </div>
              )}
            </div>
          )}

          {/* 계산 근거 상세 */}
          <details className="mt-4 pt-3 border-t border-electric-20">
            <summary className="cursor-pointer text-xs font-bold text-navy dark:text-canvas-100">
              계산 근거 자세히 보기
            </summary>
            <ol className="mt-2 space-y-1 text-xs leading-6 text-muted-blue dark:text-canvas-300 list-decimal list-inside">
              <li>
                근로소득금액 = 총급여 {fmt(grossSalary)}원 − 근로소득공제 ={" "}
                {fmt(result.earnedIncomeAmount)}원 (한도 판정 기준)
              </li>
              {(amounts.political > 0 || amounts.hometown > 0) && (
                <li>
                  정치자금·고향사랑: 각각 10만원까지 100/110 전액공제, 초과분 15%
                  {result.politicalEligible > DONATION_CREDIT_2026.POLITICAL_HIGH_THRESHOLD &&
                    " (정치자금 3천만원 초과분은 25%)"}
                </li>
              )}
              <li>
                특례기부금 공제대상 = min(기부액, 근로소득금액 100%) ={" "}
                {fmt(result.statutoryEligible)}원
              </li>
              <li>
                일반기부금 한도 = 잔여 소득의 30%(종교단체분 10%) ={" "}
                {fmt(result.generalLimit)}원 → 공제대상 {fmt(result.generalEligible)}원
              </li>
              <li>
                특례+일반 합산 {fmt(result.statutoryEligible + result.generalEligible)}원
                중 1천만원 이하 {fmt(result.generalAxisLowBase)}원 × 15% + 초과{" "}
                {fmt(result.generalAxisHighBase)}원 × 30% ={" "}
                {fmt(result.generalAxisCredit)}원
              </li>
              <li>
                합계 세액공제 = {fmt(result.totalCredit)}원 (산출세액 한도 내 차감)
              </li>
            </ol>
            <p className="mt-2 text-xs leading-5 text-faint-blue">
              근거: 소득세법 제59조의4, 조세특례제한법 제76조·제58조. 세액공제는
              산출세액에서 직접 차감되며, 산출세액을 초과하는 부분은 환급되지 않습니다.
            </p>
          </details>
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 간이 계산입니다. 근로소득만 있는 근로자를 가정해 근로소득금액을 산출하며,
          우리사주조합기부금·전년도 이월 기부금은 반영하지 않습니다. 정치자금·고향사랑
          기부금은 근로자 본인 지출분만 공제되고, 특례·일반기부금은 기본공제대상자(소득
          요건 충족 배우자·부양가족) 지출분도 합산할 수 있습니다. 실제 공제액은
          연말정산·종합소득세 신고 결과로 확정됩니다.
        </p>
      </div>
    </section>
  );
}
