// /calc/sk-innovation-bonus FY2025 실적분 본문 안내 (2026-11-15 N2-calc-09 calc-04-F04 본문)
//
// GuideMidAd 와 InArticleAd 사이 섹션: H2 '아직 미확정입니다' -> '2026년 초 지급됐습니다', 첫 두 문장을 SBS Biz
// 2026-02-22 보도(전년보다 적게 지급, SK온 미지급, 지급률 미보도)로, '즉시 반영' 약속을 '보도되면 반영'으로.
// 모두 더 짧다(H2 20px 900 424.2px -> 355.4px, 서브셋 글꼴 keep-all 줄 수 모의에서 줄이 늘어나는 폭 0).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/sk-innovation-bonus/page.tsx"), "utf8");
const flat = page.replace(/\s*\r?\n\s*/g, " ");

describe("SK이노베이션 FY2025 실적분 본문 (calc-04-F04)", () => {
  it("H2·첫 문장·반영 약속", () => {
    expect(flat).toContain("FY2025 실적분은 2026년 초 지급됐습니다 </h2>");
    expect(flat).toContain("FY2025 실적분은 2026년 초 전년보다 적게 지급됐고 SK온은 미지급입니다(SBS Biz 2026-02-22). 지급률은 보도되지 않았습니다.");
    expect(flat).toContain("지급률이 보도되면 이 페이지에 반영하겠습니다.");
    expect(flat).not.toContain("아직 미확정입니다");
    expect(flat).not.toContain("보도가 확인되지 않았습니다");
    expect(flat).not.toContain("즉시 이 페이지에 반영");
  });
});
