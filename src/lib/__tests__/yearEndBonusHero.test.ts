// /calc/year-end-bonus 결과 금액 글자 크기 (2026-11-15 N2-calc-15 calc-b01-F04)
//
// 48px 고정 결과 금액이 viewport-96px 상자에서 넘쳐 '원'이 둘째 줄로 내려갔다: 기본(과장) 6,096,879원 273.2px → 369px 아래,
// 임원 23,397,087원 297.0px → 393px 아래(360px Galaxy 포함). 결과 카드가 48px 커져 바로 아래 CalcResultAd 가 내려갔다.
// 휴대폰에서만 10vw 로 줄인다: 320px 32px · 360px 36px · 390px 39px · 480~639px 48px(종전과 같음) · sm 이상 60px(그대로).
// 임의 크기 클래스는 line-height 를 주지 않으므로 leading-none(종전 text-5xl 과 같은 line-height 1)이 함께 있어야 한다.
// 생성 CSS(Tailwind 3.4, 프로젝트 설정) 확인: font-size: clamp(1.75rem, 10vw, 3rem).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/year-end-bonus/Client.tsx"), "utf8");

describe("성과급 세금 계산기 결과 금액 크기 (calc-b01-F04)", () => {
  it("휴대폰은 clamp(1.75rem,10vw,3rem) + leading-none, sm 이상 text-6xl 그대로", () => {
    expect(src).toContain(
      'className="text-[length:clamp(1.75rem,10vw,3rem)] leading-none sm:text-6xl font-black tracking-tight text-white"',
    );
    expect(src).not.toContain('className="text-5xl sm:text-6xl font-black tracking-tight text-white"');
  });

  it("가장 넓은 기본 결과(임원 297.0px @48px)도 320px 부터 한 줄, 글자는 48px 을 넘지 않는다", () => {
    const px = (vw: number) => Math.min(48, Math.max(28, vw * 0.1));
    for (let vw = 320; vw < 640; vw++) {
      expect(px(vw)).toBeLessThanOrEqual(48);
      expect((297.0 * px(vw)) / 48).toBeLessThanOrEqual(vw - 96);
    }
    expect([px(320), px(360), px(390), px(480)]).toEqual([32, 36, 39, 48]);
  });
});
