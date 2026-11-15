// /calc/sk-innovation-bonus 직접 입력 칩·면책 안내 (2026-11-15 N2-calc-09 calc-04-F04 칩·면책)
//
// FY2025 실적분은 2026년 초 지급됐고(SBS Biz 2026-02-22) 지급률만 보도되지 않았다 — '미확정' -> '미공개'.
// 칩은 CalcResultAd 위, 면책 안내는 레이아웃 광고 위. 두 낱말의 서브셋 글꼴 폭이 같다(12px 400·700 모두).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/sk-innovation-bonus/page.tsx"), "utf8");
const client = readFileSync(resolve(process.cwd(), "src/app/calc/sk-innovation-bonus/Client.tsx"), "utf8");

describe("SK이노베이션 칩·면책 미공개 (calc-04-F04)", () => {
  it("칩과 면책 안내에 미확정이 남지 않는다", () => {
    expect(client).toContain("FY2025 실적분(2026년) 미공개 — 예상치를 직접 넣어 시뮬레이션");
    expect(page).toContain("미공개입니다.");
    expect(client).not.toMatch(/^[^/]*미확정/m);
    expect(page).not.toMatch(/^[^/]*미확정/m);
  });
});
