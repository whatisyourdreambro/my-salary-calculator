// 삼성디스플레이·삼성SDI 성과급 계산기 — 접힌 FAQ 용어·입력 이름·입력 칸 폭·버튼 표기 (2026-11-18 R4 N2-calc-12 calc-04-F03·F08·F19·F21·F22)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const display = { page: read("src/app/calc/samsung-display-bonus/page.tsx"), client: read("src/app/calc/samsung-display-bonus/Client.tsx") };
const sdi = { page: read("src/app/calc/samsung-sdi-bonus/page.tsx"), client: read("src/app/calc/samsung-sdi-bonus/Client.tsx") };

describe("국민연금 상한 용어 — 기준소득월액 (calc-04-F21, 접힌 FAQ)", () => {
  for (const [name, f] of Object.entries({ display, sdi })) {
    it(name, () => {
      expect(f.page).toContain("국민연금은 기준소득월액 상한(2026.7~2027.6 연 7,908만원) 적용.");
      expect(f.page).not.toContain("보수월액 상한");
    });
  }
});

describe("입력 이름 (calc-04-F22, 속성만)", () => {
  for (const [name, f] of Object.entries({ display, sdi })) {
    it(name, () => {
      expect(f.client).toContain('<input aria-label="추가 세액공제 가정 (%)" type="range"');
      expect(f.client).toContain('aria-label="OPI 직접 입력 (연봉 대비 %)"');
    });
  }
});

describe("입력 칸이 카드 밖으로 넘치지 않는다 — min-w-0 (calc-04-F03, 높이 불변)", () => {
  it("삼성디스플레이 TAI 입력 2칸(기본 화면)·OPI 직접 입력, 삼성SDI OPI 직접 입력", () => {
    expect(display.client).toContain('className="min-w-0 flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold focus:outline-none focus:border-primary"');
    expect(display.client).toContain('className="min-w-0 flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold"');
    expect(sdi.client).toContain('className="min-w-0 flex-1 p-2 rounded border border-canvas-deep tabular-nums text-lg font-bold"');
    for (const src of [display.client, sdi.client]) expect(src).not.toMatch(/className="flex-1 p-2 rounded/);
  });
});
