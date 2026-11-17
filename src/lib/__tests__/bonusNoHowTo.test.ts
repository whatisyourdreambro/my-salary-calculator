// CB-17(2026-09-29, 2026-11-18 R4 RL-17 재착지 — 10월 7a333bdeb): 성과급 계산기 23종의 HowTo JSON-LD 제거 가드.
// 단계(HOW_TO_STEPS)는 본문에 렌더되지 않는 구조화 데이터였고(JSON-LD 는 보이는 내용과 같아야 한다) 옛 수치까지 담고 있었다.
// Google 은 HowTo 리치 결과를 2023년 9월에 중단했다. SoftwareApplication·Breadcrumb·FAQPage 는 그대로 둔다.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CALC_DIR = path.resolve(process.cwd(), "src/app/calc");
const bonusPages = fs
  .readdirSync(CALC_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.endsWith("-bonus") && fs.existsSync(path.join(CALC_DIR, d.name, "page.tsx")))
  .map((d) => path.join(CALC_DIR, d.name, "page.tsx"));

describe("성과급 계산기 HowTo JSON-LD 제거(CB-17)", () => {
  it("대상 23쪽을 포함해 26개 *-bonus 페이지를 검사한다", () => {
    expect(bonusPages.length).toBeGreaterThanOrEqual(26);
  });
  it("*-bonus/page.tsx 에 howToLd·HOW_TO_STEPS 가 없다", () => {
    for (const f of bonusPages) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toContain("howToLd");
      expect(src, f).not.toContain("HOW_TO_STEPS");
    }
  });
  it("FAQPage·SoftwareApplication JSON-LD 는 남아 있다(표본)", () => {
    for (const slug of ["samsung-bonus", "sk-hynix-bonus", "kakao-bonus", "kepco-bonus"]) {
      const src = fs.readFileSync(path.join(CALC_DIR, slug, "page.tsx"), "utf8");
      expect(src, slug).toContain("faqLd(");
      expect(src, slug).toContain("softwareApplicationLd(");
    }
  });
});
