// src/components/CompanySalaryTable.tsx
//
// 회사 페이지 — 직급별 연봉/실수령액 자동 표 (server component, SEO 텍스트)
// thin content 탈출용: 직급 5단계 × 연봉/세금/실수령 자동 계산.
//
// '연 실수령' 셀 → /salary/[amount] hop (2026-09-12 S2-2, 높이 0):
//   · 행당 링크 1개(이 열만), 쪽당 ≤5, 표에 행·열 추가 없음. 링크는 display:inline 밑줄 텍스트라
//     48px 행 높이가 그대로다 (탭 타깃은 셀이 아니라 글자 — 접근성 트레이드오프, 의도된 것).
//   · href 는 정본 salaryReportHref: 정적 집합 범위 밖(임원 3.5억 초과 등)·최근접 금액 오차 2% 초과는
//     null → 평문 유지. dynamicParams=false 라 클램프해 보내면 틀린 목적지, 1원 어긋나면 404 라서다.
//   · 클릭 계측은 루트 InternalLinkTracker 가 data-msy-module 로 잡는다 — onClick 금지(서버 컴포넌트).

import type { CompanyProfile, JobLevel } from "@/types/company";
import Link from "@/components/AppLink";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { salaryReportHref } from "@/lib/salaryRedirect";

/** 사이트 공통 기준 — /salary/[amount]·/table 과 같은 비과세 식대 월 20만원 */
const NON_TAXABLE_MONTHLY = 200_000;

// 세율표·근로소득공제 인라인 사본은 정본 엔진 도입으로 제거했다
// (verify:tax 의 리터럴 감시 대상도 함께 줄어든다).
// 정본 엔진 재사용 (2026-09-06 전수검사).
// 종전에는 산출세액에 일률 ×0.7 을 곱해 근로소득세액공제를 근사하고 비과세
// 식대(월 20만원)도 빼먹은 인라인 사본을 썼다. 근로소득세액공제는 총급여
// 구간별 한도(1.2억 초과 20만원)가 있어 고연봉일수록 오차가 폭증했다 —
// 회사 상세 430쪽의 '리드·임원' 행이 사이트 자체 계산기(/salary/[amount]) 대비
// 연봉 2억에서 +9.9%, 8억에서 +21.1% 과다, 4,000만에서는 -2.0% 과소였다.
function estimateNetSalary(annualSalary: number): {
  totalDeduction: number;
  netAnnual: number;
  netMonthly: number;
} {
  const r = calculateSalary2026(annualSalary, NON_TAXABLE_MONTHLY, 1, 0);
  return {
    totalDeduction: r.totalDeductions * 12,
    netAnnual: r.netPay * 12,
    netMonthly: r.netPay,
  };
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
    // 연 실수령 셀의 /salary 리포트 링크 — 집합 밖·오차 2% 초과는 null(평문)
    const salaryHref = salaryReportHref(total);
    // href 가 실제로 가리키는 정적 금액(최근접 스냅, 오차 ≤2%). 총액과 다르면 title 에 '구간'으로 밝힌다 —
    // 1,890 링크 중 112건이 스냅인데 title 은 행 총액을 정확한 목적지처럼 말했다 (2026-09-12 리뷰 지적).
    const salaryHrefAmount = salaryHref ? Number(salaryHref.slice("/salary/".length)) : null;
    const salaryHrefTitle =
      salaryHrefAmount !== null && salaryHrefAmount !== total
        ? `연봉 ${fmt(salaryHrefAmount)}원 구간 실수령액 상세`
        : `연봉 ${fmt(total)}원 실수령액 상세`;

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
      salaryHref,
      salaryHrefTitle,
      ...net,
    };
  });

  // 주식보상(RSU·스톡옵션) 데이터가 실제로 있는 회사만 열 추가.
  // amount: 0 으로 입력된 회사(예: 전액 현금 보상)는 열 없이 기존과 동일 렌더.
  const hasStock = rows.some((row) => row.stock > 0);
  // 사인온 보너스가 있는 직급만 표 하단에 별도 명시 (1회성 — 연봉 합산 금지).
  const signOnRows = rows.filter((row) => row.signOn > 0);

  return (
    <section data-msy-module="company-salary-net" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  {row.salaryHref ? (
                    <Link
                      href={row.salaryHref}
                      className="underline decoration-dotted underline-offset-2 hover:decoration-solid"
                      title={row.salaryHrefTitle}
                    >
                      {fmt(row.netAnnual)}원
                    </Link>
                  ) : (
                    `${fmt(row.netAnnual)}원`
                  )}
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
