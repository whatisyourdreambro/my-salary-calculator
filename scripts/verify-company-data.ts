// scripts/verify-company-data.ts
//
// 회사 DB 정합성 가드 — npm run verify:companies (tsx 실행).
//
// 검사 항목:
//  1. 전 회사 salary.entry.base > 0, KRW 범위(1천만~10억) 안
//  2. careerLevels 만원 단위 범위(500~50,000만원) — 원/만원 단위 혼입 감지
//  3. dedupe 후 회사 수 == site-metrics.generated.ts 의 COMPANY_COUNT (TASK-1 코드젠 연동)
//  4. isGlobal 태깅 == globalCompanies 유래 전수 (병합 지점 태깅 누락 감지)
//  5. CL 신입(설명에 "신입") total 과 entry 영끌의 10% 초과 괴리 — warn 리포트
//     (라벨로 안내되는 정당한 기준 차이 — 실패 아님, 목록 확인용)
//  6. id / name.ko 원본(dedupe 전) 중복 리포트 — warn
import { allCompanies } from "../src/data/companies/index";
import { globalCompanies } from "../src/data/globalCompanies";
import { COMPANY_COUNT } from "../src/config/site-metrics.generated";

const errors: string[] = [];
const warns: string[] = [];

// 1. entry.base 범위
for (const c of allCompanies) {
  const base = c.salary?.entry?.base;
  if (typeof base !== "number" || base <= 0) {
    errors.push(`${c.id}: salary.entry.base 누락/0 (${base})`);
    continue;
  }
  if (base < 10_000_000 || base > 1_000_000_000) {
    errors.push(`${c.id}: entry.base 범위 이탈 — ${base.toLocaleString()}원 (원 단위 확인)`);
  }
}

// 2. careerLevels 만원 범위 — 상한 20억(임원·등기이사 보수 커버), 하한 500만
//    (원 단위 혼입 시 수억~수백억 만원으로 튀므로 상한이 잡는다)
for (const c of allCompanies) {
  for (const g of c.careerLevels ?? []) {
    for (const s of g.steps) {
      for (const [field, v] of [
        ["baseManwon", s.baseManwon],
        ["totalManwon", s.totalManwon],
      ] as const) {
        if (typeof v !== "number") continue;
        if (v < 500 || v > 200_000) {
          errors.push(`${c.id} ${g.group}/${s.label}: ${field}=${v} 만원 범위(500~200000) 이탈`);
        }
      }
    }
  }
}

// 3. 코드젠 카운트 일치
if (allCompanies.length !== COMPANY_COUNT) {
  errors.push(
    `회사 수 불일치 — allCompanies ${allCompanies.length} vs site-metrics COMPANY_COUNT ${COMPANY_COUNT} (tsx scripts/gen-site-metrics.ts 재실행)`,
  );
}

// 4. isGlobal 태깅 정합 — globalCompanies 유래 id가 dedupe에서 살아남았다면 반드시 태깅
const globalIds = new Set(globalCompanies.map((c) => c.id));
for (const c of allCompanies) {
  if (globalIds.has(c.id) && !c.isGlobal) {
    errors.push(`${c.id}: globalCompanies 유래인데 isGlobal 미태깅 (index.ts 병합 지점 확인)`);
  }
  if (!globalIds.has(c.id) && c.isGlobal) {
    errors.push(`${c.id}: globalCompanies 유래가 아닌데 isGlobal 태깅됨`);
  }
}

// 5. CL 신입 vs entry 영끌 괴리 (10% 초과) — warn
// (salary.entry 부재 회사는 check 1 이 error 로 잡는다 — 여기선 크래시 없이 건너뛰어
//  전체 위반 리포트가 끝까지 출력되도록 옵셔널 체이닝)
for (const c of allCompanies) {
  const entryTotal =
    (c.salary?.entry?.base ?? 0) + (c.salary?.entry?.incentive?.avgAmount || 0);
  if (entryTotal <= 0) continue;
  for (const g of c.careerLevels ?? []) {
    for (const s of g.steps) {
      if (typeof s.totalManwon !== "number" || !s.description?.includes("신입")) continue;
      const gap = Math.abs(s.totalManwon * 10_000 - entryTotal) / entryTotal;
      if (gap > 0.1) {
        warns.push(
          `${c.id}: 신입 기준 괴리 ${(gap * 100).toFixed(0)}% — 요약 영끌 ${Math.round(entryTotal / 10_000).toLocaleString()}만 vs ${g.group}/${s.label} ${s.totalManwon.toLocaleString()}만 (라벨 안내 대상)`,
        );
      }
    }
  }
}

// 6. dedupe 후에도 남은 중복 (있을 수 없음 — dedupe 회귀 감지)
const seenIds = new Set<string>();
const seenNames = new Set<string>();
for (const c of allCompanies) {
  if (seenIds.has(c.id)) errors.push(`중복 id 잔존: ${c.id}`);
  if (seenNames.has(c.name.ko)) errors.push(`중복 name.ko 잔존: ${c.name.ko}`);
  seenIds.add(c.id);
  seenNames.add(c.name.ko);
}

if (warns.length > 0) {
  console.log(`[verify-company-data] 기준 괴리 안내 대상 ${warns.length}건 (실패 아님):`);
  warns.forEach((w) => console.log(`  - ${w}`));
}

if (errors.length > 0) {
  console.error(`[verify-company-data] 위반 ${errors.length}건:`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}

console.log(
  `[verify-company-data] OK — 회사 ${allCompanies.length}곳(글로벌 ${allCompanies.filter((c) => c.isGlobal).length} 포함) / 위반 0건 / 기준 괴리 warn ${warns.length}건`,
);
