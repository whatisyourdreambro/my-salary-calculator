// scripts/verify-company-salary-hrefs.ts
//
// 회사 상세(/salary-db/[id]) CompanySalaryTable '연 실수령' 셀 링크 게이트 — npm run verify:site (tsx 실행).
//
// 배경(2026-09-12 S2-2): 유입 엔진 430쪽의 표 금액 셀을 /salary/[amount] 로 잇는데, /salary 는
// dynamicParams=false 라 집합 밖 href 는 하드 404 이고, 집합 끝(3.5억)으로 클램프하면 임원 행 58건이
// 틀린 목적지로 간다. salaryReportHref 는 그런 경우 null(평문)을 돌려주는 계약인데, 회사 DB·정적 집합·
// helper 어느 쪽이 바뀌어 계약이 깨지면 430쪽 × 최대 5링크가 한꺼번에 상한다 — 여기서 잡는다.
//
// 검사 항목 (오류 누적 후 일괄 출력, 위반 시 exit 1 — verify-company-data.ts 와 같은 방식):
//  1. 생성된 href 전부 /salary/{n} 형식이고 n ∈ getStaticSalaryAmounts() (실제 generateStaticParams 소스)
//  2. 쪽당 링크 ≤ 5 (행 5개 × 이 열 1개) 그리고 ≥ 1 (신입 총보상은 companyEntryAmounts 로 집합 등재)
//  3. 클램프 누출 0 — 집합 최대를 넘는 총액에는 href 가 붙지 않는다 (특히 /salary/{최대})
//  4. 스냅 오차 ≤ SALARY_HREF_MAX_GAP
import { allCompanies } from "../src/data/companies/index";
import { getStaticSalaryAmounts } from "../src/lib/salaryStaticParams";
import { SALARY_HREF_MAX_GAP, salaryReportHref } from "../src/lib/salaryRedirect";
import type { JobLevel } from "../src/types/company";

const RANKS: JobLevel[] = ["entry", "junior", "senior", "lead", "executive"];
const MAX_PER_PAGE = RANKS.length;

const errors: string[] = [];
const staticAmounts = getStaticSalaryAmounts();
const staticSet = new Set(staticAmounts);
const gridMax = staticAmounts[staticAmounts.length - 1];

let hrefCount = 0;
let offGrid = 0;
let maxPerPage = 0;
let textOverRange = 0;
let textGap = 0;

for (const c of allCompanies) {
  let perPage = 0;
  for (const rank of RANKS) {
    const comp = c.salary[rank];
    // CompanySalaryTable 의 행 총액 식과 동일 (기본급 + 인센티브 평균; 주식·사인온 제외)
    const total = comp.base + (comp.incentive.avgAmount || 0);
    const href = salaryReportHref(total);
    if (href === null) {
      if (total > gridMax) textOverRange++;
      else textGap++;
      continue;
    }
    perPage++;
    hrefCount++;
    const m = href.match(/^\/salary\/(\d+)$/);
    const n = m ? Number(m[1]) : Number.NaN;
    if (!m || !staticSet.has(n)) {
      offGrid++;
      errors.push(`${c.id}/${rank}: ${href} 는 정적 집합 밖 (총액 ${total.toLocaleString()}원) — 하드 404`);
      continue;
    }
    if (total > gridMax) {
      errors.push(
        `${c.id}/${rank}: 집합 최대 ${gridMax.toLocaleString()}원을 넘는 총액 ${total.toLocaleString()}원에 ${href} — 클램프 금지`,
      );
    }
    const gap = Math.abs(n - total) / total;
    if (gap > SALARY_HREF_MAX_GAP) {
      errors.push(`${c.id}/${rank}: ${href} 오차 ${(gap * 100).toFixed(2)}% > ${SALARY_HREF_MAX_GAP * 100}%`);
    }
  }
  if (perPage > MAX_PER_PAGE) errors.push(`${c.id}: 쪽당 링크 ${perPage}건 > ${MAX_PER_PAGE}`);
  if (perPage === 0) {
    const entry = c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);
    errors.push(
      `${c.id}: 링크 0건 — 신입 총보상 ${entry.toLocaleString()}원이 정적 집합에 없음 (salaryStaticParams.companyEntryAmounts 확인)`,
    );
  }
  maxPerPage = Math.max(maxPerPage, perPage);
}

if (errors.length > 0) {
  console.error(`[verify-company-salary-hrefs] 위반 ${errors.length}건:`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}

console.log(
  `[verify-company-salary-hrefs] OK — 회사 ${allCompanies.length}곳 / 생성 href ${hrefCount}건 / 격자 밖 ${offGrid}건 / 쪽당 최대 ${maxPerPage}` +
    ` (평문 유지 ${textOverRange + textGap}셀: 집합 밖 ${textOverRange}·오차>${SALARY_HREF_MAX_GAP * 100}% ${textGap})`,
);
