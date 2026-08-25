// src/components/CompanySalaryTable.tsx
//
// 회사 페이지 — 직급별 연봉/실수령액 자동 표 (server component, SEO 텍스트)
// thin content 탈출용: 직급 5단계 × 연봉/세금/실수령 자동 계산.

import type { CompanyProfile, JobLevel } from "@/types/company";

const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06, deduction: 0 },
  { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function calcEmpDeduction(total: number): number {
  if (total <= 5_000_000) return total * 0.7;
  if (total <= 15_000_000) return 3_500_000 + (total - 5_000_000) * 0.4;
  if (total <= 45_000_000) return 7_500_000 + (total - 15_000_000) * 0.15;
  if (total <= 100_000_000) return 12_000_000 + (total - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (total - 100_000_000) * 0.02, 20_000_000);
}

function calcTax(taxable: number): number {
  if (taxable <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.limit) return Math.max(0, Math.round(taxable * b.rate - b.deduction));
  }
  return 0;
}

// NOTE: 간이 추정용 인라인 사본 — 정본 엔진은 src/lib/TaxLogic.ts(calculateSalary2026).
// 요율·산식 변경 금지. 향후 통합 시 TaxLogic 재사용으로 교체할 것 (2026-08 감사 메모).
function estimateNetSalary(annualSalary: number): {
  totalDeduction: number;
  netAnnual: number;
  netMonthly: number;
} {
  const basicDeduct = 1_500_000;
  const empDeduct = calcEmpDeduction(annualSalary);
  const taxable = Math.max(0, annualSalary - empDeduct - basicDeduct);
  const incomeTax = calcTax(taxable) * 0.7; // 세액공제 후 추정
  const localTax = incomeTax * 0.1;

  // 4대보험 (정기 급여 기준)
  const monthlyBase = annualSalary / 12;
  const pensionMonthly = Math.min(monthlyBase, 6_590_000) * 0.0475;
  const healthMonthly = monthlyBase * 0.03595;
  const longTermMonthly = healthMonthly * 0.1314;
  const employmentMonthly = monthlyBase * 0.009;
  const totalInsurance =
    (pensionMonthly + healthMonthly + longTermMonthly + employmentMonthly) * 12;

  const totalDeduction = incomeTax + localTax + totalInsurance;
  const netAnnual = annualSalary - totalDeduction;
  const netMonthly = netAnnual / 12;

  return { totalDeduction, netAnnual, netMonthly };
}

const RANK_LABELS: Record<JobLevel, { ko: string; range: string }> = {
  entry: { ko: "신입 (1~2년차)", range: "사원" },
  junior: { ko: "주니어 (3~5년차)", range: "사원·대리" },
  senior: { ko: "시니어 (6~10년차)", range: "과장·차장" },
  lead: { ko: "리드 (11~15년차)", range: "차장·부장" },
  executive: { ko: "임원 (15년차 이상)", range: "임원급" },
};

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function CompanySalaryTable({ company }: { company: CompanyProfile }) {
  const ranks: JobLevel[] = ["entry", "junior", "senior", "lead", "executive"];
  const rows = ranks.map((rank) => {
    const comp = company.salary[rank];
    const total = comp.base + (comp.incentive.avgAmount || 0);
    const stockValue = comp.stock?.amount || 0;
    const totalWithStock = total + stockValue;
    const net = estimateNetSalary(total);

    return {
      rank,
      label: RANK_LABELS[rank].ko,
      range: RANK_LABELS[rank].range,
      base: comp.base,
      incentive: comp.incentive.avgAmount || 0,
      stock: stockValue,
      stockType: comp.stock?.type,
      signOn: comp.signOn || 0,
      total,
      totalWithStock,
      ...net,
    };
  });

  // 주식보상(RSU·스톡옵션) 데이터가 실제로 있는 회사만 열 추가.
  // amount: 0 으로 입력된 회사(예: 전액 현금 보상)는 열 없이 기존과 동일 렌더.
  const hasStock = rows.some((row) => row.stock > 0);
  // 사인온 보너스가 있는 직급만 표 하단에 별도 명시 (1회성 — 연봉 합산 금지).
  const signOnRows = rows.filter((row) => row.signOn > 0);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-navy dark:text-canvas-50 mb-2">
          {company.name.ko} 직급별 연봉 · 실수령액 (2026 세법 기준)
        </h2>
        <p className="text-sm text-muted-blue dark:text-canvas-300">
          신입부터 임원까지 직급별 평균 연봉, 세금 공제 후 실수령액, 월 실수령까지 한눈에 비교하세요.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900">
        <table className="w-full text-sm">
          <thead className="bg-electric text-white">
            <tr>
              <th className="px-4 py-3 text-left font-black">직급</th>
              <th className="px-4 py-3 text-right font-black">기본급</th>
              <th className="px-4 py-3 text-right font-black">인센티브</th>
              <th className="px-4 py-3 text-right font-black">총 연봉</th>
              {hasStock && (
                <th className="px-4 py-3 text-right font-black">주식보상 포함</th>
              )}
              <th className="px-4 py-3 text-right font-black">세금·4대보험</th>
              <th className="px-4 py-3 text-right font-black">연 실수령</th>
              <th className="px-4 py-3 text-right font-black">월 실수령</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-200 dark:divide-canvas-800">
            {rows.map((row) => (
              <tr key={row.rank} className="hover:bg-electric-5 dark:hover:bg-canvas-800">
                <td className="px-4 py-3.5">
                  <div className="font-black text-navy dark:text-canvas-50">{row.label}</div>
                  <div className="text-xs text-faint-blue mt-0.5">{row.range}</div>
                </td>
                <td className="px-4 py-3.5 text-right text-muted-blue dark:text-canvas-300 tabular-nums">
                  {fmt(row.base)}원
                </td>
                <td className="px-4 py-3.5 text-right text-muted-blue dark:text-canvas-300 tabular-nums">
                  {row.incentive > 0 ? `${fmt(row.incentive)}원` : "—"}
                </td>
                <td className="px-4 py-3.5 text-right font-black text-navy dark:text-canvas-50 tabular-nums">
                  {fmt(row.total)}원
                </td>
                {hasStock && (
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    {row.stock > 0 ? (
                      <>
                        <div className="font-black text-violet-600 dark:text-violet-400">
                          {fmt(row.totalWithStock)}원
                        </div>
                        <div className="text-xs text-faint-blue mt-0.5">
                          {row.stockType === "Option" ? "스톡옵션" : "RSU"} 연{" "}
                          {fmt(row.stock)}원
                        </div>
                      </>
                    ) : (
                      <span className="text-faint-blue">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3.5 text-right text-rose-500 tabular-nums">
                  -{fmt(row.totalDeduction)}원
                </td>
                <td className="px-4 py-3.5 text-right font-black text-electric tabular-nums">
                  {fmt(row.netAnnual)}원
                </td>
                <td className="px-4 py-3.5 text-right text-muted-blue dark:text-canvas-300 tabular-nums">
                  {fmt(row.netMonthly)}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 사인온 보너스 — 데이터가 있는 회사만 표 하단에 명시 (1회성, 연봉 미합산) */}
      {signOnRows.length > 0 && (
        <div className="mt-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm font-black text-amber-800 dark:text-amber-300 mb-1">
            입사 시 사인온 보너스 별도 지급
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {signOnRows
              .map((row) => `${row.label} 약 ${fmt(row.signOn)}원`)
              .join(" · ")}
            {" — "}입사 첫 해에만 지급되는 일회성 금액으로, 위 표의 연봉·실수령액
            합계에는 포함하지 않았습니다.
          </p>
        </div>
      )}

      {/* 인사이트 텍스트 (SEO 본문) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-electric-5 dark:bg-electric-10 border border-electric-20 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
            연봉 성장 곡선
          </p>
          <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
            {company.name.ko} 신입 평균 <strong className="text-navy dark:text-canvas-50">{fmt(rows[0].total)}원</strong>에서
            임원 평균 <strong className="text-navy dark:text-canvas-50">{fmt(rows[4].total)}원</strong>까지
            약 <strong className="text-electric">{(rows[4].total / rows[0].total).toFixed(1)}배</strong> 상승.
            동일 업종 평균과 비교는 아래 인사이트 섹션에서 확인하세요.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
            실수령액 비율
          </p>
          <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
            세전 대비 실수령 비율은 신입 약{" "}
            <strong className="text-emerald-700 dark:text-emerald-400">
              {((rows[0].netAnnual / rows[0].total) * 100).toFixed(0)}%
            </strong>
            에서 임원 약{" "}
            <strong className="text-emerald-700 dark:text-emerald-400">
              {((rows[4].netAnnual / rows[4].total) * 100).toFixed(0)}%
            </strong>
            로 감소합니다. 누진세율이 높아지기 때문이며, IRP·연금저축 활용으로 절세 가능합니다.
          </p>
        </div>
      </div>

      <p className="text-xs text-faint-blue mt-4 text-center">
        * 본인 1인 기본공제, 세액공제 평균 적용 추정치. 부양가족·연말정산 변수에 따라 실제 금액은 다를 수 있습니다.
      </p>
      {hasStock && (
        <p className="text-xs text-faint-blue mt-2 text-center">
          * 주식보상(RSU·스톡옵션)은 베스팅 일정에 따라 나눠 취득되며 취득·행사
          시점에 별도 과세됩니다. 위 표의 세금·실수령액은 현금 보상(기본급+인센티브)
          기준입니다.
        </p>
      )}
    </section>
  );
}
