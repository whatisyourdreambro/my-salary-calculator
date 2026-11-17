// 상장사 허브(/salary-db/listed) 소개 문단 라벨 고정 (2026-09-29 CL-04① — A19 누락분, R4 2026-11-18 재착지)
// 급여총액÷인원 산정치를 '공식' 평균연봉으로 부르지 않는다. GuideMidAd 위 문단이라 줄 수가 운영 이하여야 한다 —
// 2음절 교체(집계한 산정)는 10/30 준비본 스윕에서 323~353px 한 줄이 늘어 '에서 산정한' 으로 줄였다(8af4776ef).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CL-04① 상장사 허브 소개 문단", () => {
  it("상장사 허브 소개 문단 — '에서 산정한 평균연봉' (광고 위 줄 수 운영 이하)", () => {
    const src = readFileSync("src/app/salary-db/listed/page.tsx", "utf8");
    expect(src).not.toContain("집계한 공식");
    expect(src).not.toContain("집계한 산정");
    expect(src).toMatch(/에서 산정한\s+평균연봉입니다\(급여총액 ÷ 직원 수/);
  });

  it("상장 여부 단서(Codex 추가 문장)는 그대로 남는다", () => {
    const src = readFileSync("src/app/salary-db/listed/page.tsx", "utf8");
    expect(src).toContain("종목코드가 기록된 상장사 기준이며, 현재 상장 여부를 보증하지 않습니다.");
  });
});
