// /calc/hyundai-bonus 바로가기 위치 가드 (2026-10-05 운영자 승인 #6, 감사 code2-04)
//
// 9/19 3de3d6037 이 히어로에 넣은 바로가기 버튼 줄(첫 광고 CalcResultAd 위)을 광고 + 다음 단계 링크(BonusNextLinks) 아래로 옮겼다.
// '2026·2025 합의 항목 비교'(#hyundai-agreement)는 옮긴 자리 바로 다음 섹션이라 뺐다. 광고 컴포넌트 순서·개수는 그대로.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/hyundai-bonus/page.tsx"), "utf8")
  .replace(/\r\n/g, "\n")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
const NAV = 'aria-label="현대차 성과급 계산기 바로가기"';

describe("현대차 성과급 바로가기는 첫 광고 아래", () => {
  it("히어로(header)에는 바로가기 줄·페이지 안 앵커 링크가 없다", () => {
    const header = page.slice(page.indexOf("<header"), page.indexOf("</header>"));
    expect(header.length).toBeGreaterThan(0);
    expect(header).not.toContain("<nav");
    expect(header).not.toMatch(/href="#/);
  });

  it("광고는 그대로 1회, 바로가기는 광고 묶음(CalcResultAd + BonusNextLinks) 바로 다음 1회", () => {
    const ad = page.indexOf("<CalcResultAd />");
    expect(ad).toBeGreaterThan(-1);
    expect(page.indexOf("<CalcResultAd />", ad + 1)).toBe(-1);
    const nav = page.indexOf(NAV);
    expect(nav).toBeGreaterThan(ad);
    expect(page.indexOf(NAV, nav + 1)).toBe(-1);
    expect(page.slice(ad, page.lastIndexOf("<nav", nav))).toMatch(
      /^<CalcResultAd \/>\s*<BonusNextLinks slug="hyundai-bonus" \/>\s*<\/div>\s*$/,
    );
    expect(page.indexOf('id="hyundai-agreement"')).toBeGreaterThan(nav);
  });

  it("남은 바로가기는 입력 영역(#hyundai-bonus-input) 하나", () => {
    const nav = page.slice(page.lastIndexOf("<nav", page.indexOf(NAV)), page.indexOf("</nav>", page.indexOf(NAV)));
    expect([...nav.matchAll(/href="(#[^"]+)"/g)].map((m) => m[1])).toEqual(["#hyundai-bonus-input"]);
    const client = readFileSync(resolve(process.cwd(), "src/app/calc/hyundai-bonus/Client.tsx"), "utf8");
    expect(client).toContain('id="hyundai-bonus-input"');
  });
});
