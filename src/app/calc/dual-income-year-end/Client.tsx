"use client";

// /calc/dual-income-year-end 클라이언트 — 맞벌이 몰아주기 시나리오 비교.
// 세법 로직은 전량 기존 정본 엔진 호출 조합: calculateYearEndTax(연말정산 엔진)
// + calcCardDeduction2026(카드 문턱 표시용) + taxConstants2026(4대보험 자동 산출).
// 신규 세법 산식 없음 — 시나리오별 입력 배분 후 엔진 재호출만 수행.
// 갱신 슬롯: 2026-12 세법개정 확인 (자녀세액공제·의료비 특례·카드공제 연장 여부)

import { useMemo, useState } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import { calculateDualIncomeYearEnd2026, type AssignmentSide as Side } from "@/lib/dualIncomeYearEnd2026";
import { calcCardDeduction2026 } from "@/lib/cardDeduction2026";
import NumberInput from "@/components/NumberInput";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  return d ? Number(d).toLocaleString("ko-KR") : "";
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

const SIDE_LABEL: Record<Side, string> = { me: "본인", sp: "배우자" };

export default function DualIncomeYearEndClient() {
  const [vals, setVals] = useState<Record<string, string>>({
    salaryMe: "60,000,000",
    salarySp: "40,000,000",
    childMedical: "3,000,000",
    childEducation: "2,000,000",
    childDonation: "0",
    coupleMedical: "1,000,000",
  });
  const [children, setChildren] = useState(0);
  const [childTaxCreditEligibleChildren, setChildTaxCreditEligibleChildren] = useState(0);

  const r = useMemo(() => {
    const salaryMe = parseInput(vals.salaryMe);
    const salarySp = parseInput(vals.salarySp);
    const spMed = parseInput(vals.coupleMedical);
    const { allMe, allSp, optimal, saving } = calculateDualIncomeYearEnd2026({
      salaryMe, salarySp, children, childTaxCreditEligibleChildren,
      childMedical: parseInput(vals.childMedical), childEducation: parseInput(vals.childEducation),
      childDonation: parseInput(vals.childDonation), coupleMedical: spMed,
    });

    // 최적 배분 설명 문구
    const parts: string[] = [];
    if (children > 0) {
      const k = optimal.assign.kidsToMe;
      parts.push(
        k === children
          ? `자녀 ${children}명 기본공제 전부 → 본인`
          : k === 0
            ? `자녀 ${children}명 기본공제 전부 → 배우자`
            : `자녀 기본공제 본인 ${k}명 · 배우자 ${children - k}명`
      );
      parts.push(`그중 연간 자녀세액공제 본인 ${optimal.assign.creditKidsToMe}명 · 배우자 ${childTaxCreditEligibleChildren - optimal.assign.creditKidsToMe}명`);
      if (optimal.assign.childExpTo)
        parts.push(
          `자녀 의료비·교육비·기부금 → ${SIDE_LABEL[optimal.assign.childExpTo]}`
        );
    }
    if (optimal.assign.coupleMedTo)
      parts.push(
        `서로를 위한 의료비 → ${SIDE_LABEL[optimal.assign.coupleMedTo]}가 결제·공제`
      );
    if (parts.length === 0) parts.push("배분할 항목이 없습니다");

    // 카드 문턱(총급여 25%)은 정본 카드공제 모듈에서 산출 — 사전 전략 안내 전용
    const zeroCard = {
      children: 0,
      creditCard: 0,
      checkCash: 0,
      traditionalMarket: 0,
      publicTransport: 0,
    };
    const cardMinMe = calcCardDeduction2026({ grossSalary: salaryMe, ...zeroCard }).minUsage;
    const cardMinSp = calcCardDeduction2026({ grossSalary: salarySp, ...zeroCard }).minUsage;

    return { allMe, allSp, optimal, saving, parts, cardMinMe, cardMinSp };
  }, [vals, children, childTaxCreditEligibleChildren]);

  const scenarioRows = [
    { label: "전부 본인 귀속", res: r.allMe },
    { label: "전부 배우자 귀속", res: r.allSp },
    { label: "최적 배분", res: r.optimal, highlight: true },
  ];

  const moneyFields = [
    { key: "salaryMe", label: "본인 총급여 (연봉, 비과세 제외)", show: true },
    { key: "salarySp", label: "배우자 총급여 (연봉, 비과세 제외)", show: true },
    { key: "childMedical", label: "자녀 의료비 (연간)", show: children > 0 },
    { key: "childEducation", label: "자녀 교육비 (연간)", show: children > 0 },
    { key: "childDonation", label: "자녀 명의 기부금 (연간)", show: children > 0 },
    { key: "coupleMedical", label: "서로를 위한 의료비 (부부 상호 지출분)", show: true },
  ] as const;

  return (
    <div className="space-y-5 mb-10">
      {/* 입력 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {moneyFields.slice(0, 2).map((f) => (
          <div key={f.key}>
            <label
              htmlFor={`di-${f.key}`}
              className="text-xs font-bold tracking-tight block mb-2 text-faint-blue"
            >
              {f.label}
            </label>
            <div className="relative">
              <NumberInput
                id={`di-${f.key}`}
                type="text"
                inputMode="numeric"
                value={vals[f.key]}
                onChange={(e) =>
                  setVals((v) => ({ ...v, [f.key]: formatInput(e.target.value) }))
                }
                className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-9"
                aria-label={f.label}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">
                원
              </span>
            </div>
          </div>
        ))}

        <div>
          <label
            htmlFor="di-children"
            className="text-xs font-bold tracking-tight block mb-2 text-faint-blue"
          >
            자녀 수 (기본공제 대상)
          </label>
          <select
            id="di-children"
            value={children}
            onChange={(e) => {
              const count = Number(e.target.value);
              setChildren(count);
              setChildTaxCreditEligibleChildren((previous) => Math.min(previous, count));
            }}
            className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}명
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="di-credit-children" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
            그중 연간 자녀세액공제 대상 (2026년 귀속)
          </label>
          <select id="di-credit-children" value={childTaxCreditEligibleChildren}
            onChange={(e) => setChildTaxCreditEligibleChildren(Number(e.target.value))}
            aria-describedby="di-child-credit-help"
            className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50">
            {Array.from({ length: children + 1 }, (_, count) => <option key={count} value={count}>{count}명</option>)}
          </select>
          <p id="di-child-credit-help" className="mt-2 text-xs leading-relaxed text-faint-blue">
            기본공제 대상 중 9세 이상이며, 2017년생은 제외합니다. 해당 과세기간 중 요건 나이에 해당되는 날이 있는지 확인하세요. 소득·부양 요건과 사망 등 판정 시점 예외는 별도로 확인합니다.
          </p>
        </div>

        {moneyFields.slice(2).map(
          (f) =>
            f.show && (
              <div key={f.key}>
                <label
                  htmlFor={`di-${f.key}`}
                  className="text-xs font-bold tracking-tight block mb-2 text-faint-blue"
                >
                  {f.label}
                </label>
                <div className="relative">
                  <NumberInput
                    id={`di-${f.key}`}
                    type="text"
                    inputMode="numeric"
                    value={vals[f.key]}
                    onChange={(e) =>
                      setVals((v) => ({
                        ...v,
                        [f.key]: formatInput(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-9"
                    aria-label={f.label}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">
                    원
                  </span>
                </div>
              </div>
            )
        )}
      </div>

      {/* 결과 */}
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div
          className="px-8 py-8 text-center"
          style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}
        >
          <p
            className="text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            최적 배분 시 부부 합산 절감액
          </p>
          <div
            className="text-5xl sm:text-6xl font-black tracking-tight text-white"
            style={{ letterSpacing: "-0.04em" }}
          >
            {fmt(r.saving)}원
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            잘못 몰아줬을 때 대비 · 최적 합산 결정세액 {fmt(r.optimal.total)}원 (소득세 기준)
          </p>
        </div>

        <div className="bg-white dark:bg-canvas-900 px-6 py-5 space-y-4">
          {/* 최적 배분 제시 */}
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
              최적 배분
            </p>
            <ul className="space-y-1">
              {r.parts.map((p) => (
                <li key={p} className="text-sm font-bold text-navy dark:text-canvas-50">
                  · {p}
                </li>
              ))}
            </ul>
          </div>

          {/* 시나리오 비교표 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-faint-blue border-b border-canvas-200 dark:border-canvas-700">
                  <th className="py-2 pr-3 font-bold">시나리오</th>
                  <th className="py-2 pr-3 font-bold text-right">본인 결정세액</th>
                  <th className="py-2 pr-3 font-bold text-right">배우자 결정세액</th>
                  <th className="py-2 pr-3 font-bold text-right">부부 합산</th>
                  <th className="py-2 font-bold text-right">최적 대비</th>
                </tr>
              </thead>
              <tbody>
                {scenarioRows.map((row) => (
                  <tr
                    key={row.label}
                    className={`border-b border-canvas-100 dark:border-canvas-800 ${
                      row.highlight ? "bg-electric-5" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-3 font-bold text-navy dark:text-canvas-50">
                      {row.label}
                      {row.highlight && (
                        <span className="ml-1.5 text-[10px] font-black text-electric">BEST</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums font-bold text-muted-blue dark:text-canvas-300">
                      {fmt(row.res.taxMe)}원
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums font-bold text-muted-blue dark:text-canvas-300">
                      {fmt(row.res.taxSp)}원
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums font-black text-navy dark:text-canvas-50">
                      {fmt(row.res.total)}원
                    </td>
                    <td
                      className={`py-2.5 text-right tabular-nums font-black ${
                        row.res.total - r.optimal.total > 0 ? "text-red-500" : "text-electric"
                      }`}
                    >
                      {row.res.total - r.optimal.total > 0
                        ? `+${fmt(row.res.total - r.optimal.total)}원`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 과대 표시 가능성 고지 — 엔진 단순화 항목 */}
          <p className="text-[11px] leading-relaxed text-faint-blue">
            ※ 본 계산은 소득세 기준(지방소득세 10% 별도)이며, 계산 엔진이 일부 한도를
            단순화합니다 — 부양가족 의료비 공제대상 한도(연 700만원)·교육비 한도(취학
            단계별 300만~900만원) 미적용이며 자녀별 지출도 구분하지 않습니다. 연간 자녀세액공제는
            별도로 입력한 적격 인원만 같은 자녀의 기본공제 배정에 맞춰 적용합니다. 지출 단순화 때문에
            배분 이익이 실제보다 크게 표시될 수 있습니다.
            국세청 홈택스 최종 수치와 반드시 대조하세요.
          </p>
        </div>
      </div>

      {/* 결과 직하 광고 */}
      <CalcResultAd />

      {/* 신용카드 사전 전략 — 광고 아래 배치 (사후 배분 불가 항목) */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-2">
          신용카드 공제는 몰아주기 불가 — 남은 기간 결제 전략만 가능
        </h2>
        <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed mb-4">
          신용카드 등 사용액 소득공제는 <strong>각자 명의 카드로 쓴 금액만 본인이
          공제</strong>받습니다. 이미 결제한 금액을 연말정산 때 배우자에게 옮기는 것은
          불가능합니다. 지금부터 연말까지 <strong>어느 명의 카드로 결제할지</strong>를
          정하는 것이 유일한 전략입니다. 공제는 총급여의 25%를 초과한 사용분부터
          시작되므로, 문턱을 넘길 수 있는 쪽에 지출을 집중하는 것이 기본입니다.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4">
            <p className="text-[11px] font-bold text-faint-blue mb-1">본인 공제 문턱 (총급여 25%)</p>
            <p className="text-xl font-black tabular-nums text-navy dark:text-canvas-50">
              {fmt(r.cardMinMe)}원
            </p>
          </div>
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4">
            <p className="text-[11px] font-bold text-faint-blue mb-1">배우자 공제 문턱 (총급여 25%)</p>
            <p className="text-xl font-black tabular-nums text-navy dark:text-canvas-50">
              {fmt(r.cardMinSp)}원
            </p>
          </div>
        </div>
        <p className="text-[11px] text-faint-blue leading-relaxed mt-3">
          통상 총급여가 낮은 배우자 쪽이 문턱이 낮아 넘기기 쉽습니다. 이미 한쪽이
          문턱을 크게 넘겨 공제 한도에 근접했다면 나머지 지출은 반대쪽 카드로
          돌리는 것이 유리할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
