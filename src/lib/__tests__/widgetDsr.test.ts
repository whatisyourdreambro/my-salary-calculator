// /widget/dsr 산식 드리프트 게이트 (2026-09-25 B1).
//
// 종전에는 widget/dsr/route.ts 가 모듈 스코프에서 본편 dsr-quick compute 와 산식을 대조했다.
// 그 assert 가 계산기 레지스트리 전체를 edge 함수에 끌어들여(1.68MB) 콜드 isolate 마다 CPU 를 쓰고,
// 드리프트가 나도 빌드가 아니라 프로덕션 첫 요청에서 500 을 냈다. 대조를 이 테스트로 옮긴다.
//   1) dsrLimitOf(src/lib/widgets/dsrLimit.ts) == 본편 compute (여러 표본, 금리 0 포함)
//   2) 방문자가 실제로 실행하는 위젯 인라인 JS 산식 == 본편 compute (응답 HTML 에서 추출해 평가)
//   3) route.ts 가 simpleCalculators 를 다시 import 하지 않는다 (edge 번들 비대 재발 방지)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { DSR_RATIO, dsrLimitOf } from "@/lib/widgets/dsrLimit";
import { GET } from "@/app/widget/dsr/route";
import { WIDGET_HEADERS } from "@/app/widget/shared";

// [연소득(원), 금리(%), 기간(년)]
const SAMPLES: ReadonlyArray<readonly [number, number, number]> = [
  [50_000_000, 4, 30], // 종전 모듈 assert 표본 (위젯 기본값)
  [50_000_000, 0, 30], // 금리 0 — 분모 0 분기
  [30_000_000, 0, 10],
  [30_000_000, 3.5, 10],
  [80_000_000, 4.25, 40],
  [120_000_000, 5.9, 35],
  [5_000_000, 20, 1], // 위젯 입력 하한·금리 상한 근처
  [1_000_000_000, 0.1, 50], // 위젯 입력 상한 근처
  [45_670_000, 3.87, 23],
];

function dsrQuickPrimary(yearly: number, rate: number, years: number): number {
  const calc = getCalculatorBySlug("dsr-quick");
  if (!calc) throw new Error("dsr-quick 계산기를 찾지 못함");
  const out = calc.compute({ yearly, rate, years }) as { primary: { value: number } };
  return out.primary.value;
}

describe("widget/dsr — dsrLimitOf 와 본편 dsr-quick compute 일치", () => {
  it("DSR_RATIO 는 40%", () => {
    expect(DSR_RATIO).toBe(0.4);
  });

  it.each(SAMPLES)("연소득 %s원·금리 %s%%·%s년 → 차이 1원 이하", (yearly, rate, years) => {
    const main = dsrQuickPrimary(yearly, rate, years);
    const mine = dsrLimitOf(yearly, rate, years);
    expect(Number.isFinite(mine)).toBe(true);
    expect(mine).toBeGreaterThan(0);
    expect(Math.abs(main - mine), `${main} vs ${mine}`).toBeLessThanOrEqual(1);
  });

  it("금리 0 은 월 한도 × 개월 수 (무이자 분기)", () => {
    expect(dsrLimitOf(50_000_000, 0, 30)).toBe(Math.round(((50_000_000 * 0.4) / 12) * 360));
  });
});

describe("widget/dsr — 응답 HTML 의 인라인 JS 산식도 본편과 일치", () => {
  it("헤더는 위젯 공용 상수 그대로 (핸들러 직접 세팅 유지)", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    for (const [k, v] of Object.entries(WIDGET_HEADERS)) expect(res.headers.get(k), k).toBe(v);
  });

  it("인라인 JS 의 산식 줄을 그대로 평가해도 본편과 1원 이내", async () => {
    const html = await (await GET()).text();
    expect(html).toContain(`var RATIO = ${DSR_RATIO};`);
    const monthlyLine = html.match(/var monthly = [^\n]+;/)?.[0];
    const rateLine = html.match(/var r = rp \/ 100 \/ 12, months = n \* 12;/)?.[0];
    const principalLine = html.match(/var principal = [^\n]+;/)?.[0];
    expect(monthlyLine, "인라인 JS 월 한도 산식").toBeDefined();
    expect(rateLine, "인라인 JS 금리·개월 산식").toBeDefined();
    expect(principalLine, "인라인 JS 원금 산식").toBeDefined();
    // 위젯 JS 는 연소득을 만원 단위로 받아 y = 입력 × 10000 으로 환산한다 — 여기선 원 단위 y 를 직접 넣는다.
    const widgetPrincipal = new Function(
      "y",
      "rp",
      "n",
      `var RATIO = ${DSR_RATIO}; ${monthlyLine} ${rateLine} ${principalLine} return principal;`,
    ) as (y: number, rp: number, n: number) => number;
    for (const [yearly, rate, years] of SAMPLES) {
      const main = dsrQuickPrimary(yearly, rate, years);
      const widget = Math.round(widgetPrincipal(yearly, rate, years));
      expect(Math.abs(main - widget), `${yearly}/${rate}/${years}: ${main} vs ${widget}`).toBeLessThanOrEqual(1);
    }
  });
});

describe("widget/dsr — edge 번들 비대 재발 방지", () => {
  it("route.ts 는 simpleCalculators 를 import 하지 않는다 (레지스트리 전체가 edge 함수에 번들됨)", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/widget/dsr/route.ts"), "utf8");
    expect(src).not.toMatch(/from\s+["']@\/lib\/simpleCalculators/);
    expect(src).not.toMatch(/import\(\s*["']@\/lib\/simpleCalculators/);
  });
});
