// scripts/gen-salary-amounts.ts
//
// /salary/[amount] 정적 생성 집합을 미들웨어가 쓸 수 있는 경량 상수 모듈로 코드젠.
//
// 왜 코드젠인가: src/lib/salaryStaticParams.ts 는 회사 DB·직업·지역·표 생성기(수백 KB)를 import 한다.
// 미들웨어(Edge, Cloudflare Worker)가 그것을 직접 import 하면 워커 번들이 부풀고 CPU 한도(2026-08
// /salary 5xx 사건의 원인)를 다시 건드린다. 빌드 머신에서 숫자 배열만 뽑아 두면 미들웨어 비용은 ~5KB 다.
//
// 용도: 격자 밖 /salary/{금액}·구형 /salary/{N}-manwon·{N}-eok 요청을 404 대신 가장 가까운 정적
// 페이지로 308 (GSC '찾을 수 없음' 312건의 예시 URL 이 전부 이 형태, 2026-09-11).
//
// 실행: tsx scripts/gen-salary-amounts.ts          → 파일 생성/갱신 (npm prebuild 로 자동)
//       tsx scripts/gen-salary-amounts.ts --check  → 드리프트 검사만 (exit 1)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getStaticSalaryAmounts } from "../src/lib/salaryStaticParams";

const ROOT = join(__dirname, "..");
const OUT_PATH = join(ROOT, "src/lib/salaryStaticAmounts.generated.ts");

function render(): string {
  const amounts = [...new Set(getStaticSalaryAmounts())].sort((a, b) => a - b);
  const rows: string[] = [];
  for (let i = 0; i < amounts.length; i += 10) rows.push("  " + amounts.slice(i, i + 10).join(", ") + ",");
  return [
    "// 자동 생성 — 직접 수정 금지. 정본은 src/lib/salaryStaticParams.ts (getStaticSalaryAmounts).",
    "// 재생성: tsx scripts/gen-salary-amounts.ts  (npm prebuild 에서 자동 실행, --check 는 드리프트 게이트)",
    "// 미들웨어(Edge)가 /salary/* 격자 밖 요청을 가장 가까운 정적 페이지로 308 하는 데 쓴다.",
    "",
    `/** 오름차순 정렬된 정적 생성 연봉 금액 ${amounts.length}개 (원 단위). */`,
    "export const SALARY_STATIC_AMOUNTS: readonly number[] = [",
    ...rows,
    "];",
    "",
  ].join("\n");
}

const next = render();
if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT_PATH, "utf8");
  } catch {
    /* missing → drift */
  }
  const normalize = (s: string) => s.replace(/\r\n/g, "\n");
  if (normalize(current) !== normalize(next)) {
    console.error(`[gen-salary-amounts] 드리프트: ${OUT_PATH} 가 최신이 아닙니다. tsx scripts/gen-salary-amounts.ts 를 실행하세요.`);
    process.exit(1);
  }
  console.log("[gen-salary-amounts] OK (드리프트 없음)");
} else {
  writeFileSync(OUT_PATH, next);
  console.log(`[gen-salary-amounts] wrote ${OUT_PATH}`);
}
