// /calc/voluntary-retirement 결과 금액 글자 크기 (2026-11-15 N2-calc-15 calc-04-F09)
//
// 48px 고정이던 결과 금액(기본 156,448,000원, 48px·900·-0.04em 에서 332.8px)이 viewport-96px 상자에서 430px 아래로는 '원'이
// 다음 줄로 넘어가 결과 카드가 48px 커지고, 320px 에서는 숫자 끝이 잘렸다. 휴대폰에서만 9.5vw 로 줄인다:
// 320px 30.4px · 390px 37.05px · 505px 이상 48px(종전과 같음) · sm(640px) 이상 60px(종전과 같음).
// 임의 크기 클래스는 line-height 를 주지 않으므로 leading-none(종전 text-5xl 과 같은 line-height 1)이 꼭 함께 있어야 한다.
// 생성 CSS(Tailwind 3.4, 프로젝트 설정) 확인: font-size: clamp(1.75rem, 9.5vw, 3rem) — 색이 아니라 글자 크기.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/voluntary-retirement/Client.tsx"), "utf8");

describe("희망퇴직 계산기 결과 금액 크기 (calc-04-F09)", () => {
  it("휴대폰은 clamp(1.75rem,9.5vw,3rem) + leading-none, sm 이상 text-6xl 그대로", () => {
    expect(src).toContain(
      'className="text-[length:clamp(1.75rem,9.5vw,3rem)] leading-none sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}',
    );
    expect(src).not.toContain('className="text-5xl sm:text-6xl font-black tracking-tight text-white"');
  });

  it("휴대폰 글자 크기는 종전 48px 을 넘지 않는다(결과 카드는 줄어들기만)", () => {
    const px = (vw: number) => Math.min(48, Math.max(28, vw * 0.095));
    for (let vw = 320; vw < 640; vw++) expect(px(vw)).toBeLessThanOrEqual(48);
    expect(px(320)).toBeCloseTo(30.4, 5);
    expect(px(390)).toBeCloseTo(37.05, 5);
    // 기본 결과 폭(48px 에서 332.8px)이 상자(viewport - 96px)에 한 줄로 들어간다
    for (let vw = 320; vw < 640; vw++) expect((332.8 * px(vw)) / 48).toBeLessThanOrEqual(vw - 96);
  });
});
