// /calc/pension-hike-2027 입력 안내 한 줄 높이 가드 (2026-11-01 운영자 승인 B11 · P3G-04)
//  - 10/23 이후 안내 줄이 항상 보여 결과창 광고(CalcResultAd)가 기본 화면에서 한 줄(약 24px) 내려갔다.
//  - 평소(정상 입력, 상·하한 밖)에는 sr-only: 입력의 aria-describedby 대상과 낭독 문구는 남기고 화면 높이는 0.
//  - 입력 오류·상한·하한일 때만 보이는 한 줄(종전에는 상한일 때만 보였다).
// 광고·계측은 스텁(광고 코드·네트워크 요청 없음). 상태별 결과는 실제 계산 엔진에 입력값만 바꿔 넣어 만든다.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const engine = vi.hoisted(() => ({ input: null as string | null }));
vi.mock("@/lib/pensionHike", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/pensionHike")>();
  return { calculatePensionHike: (input: string) => actual.calculatePensionHike(engine.input ?? input) };
});
vi.mock("@/hooks/useCalculatorMeasurement", () => ({
  useCalculatorMeasurement: () => ({ inputProps: {}, resultRef: () => {} }),
}));
vi.mock("@/components/AdPlacement", async () => {
  const { createElement: h } = await import("react");
  return { CalcResultAd: () => h("i", { "data-test-ad": "CalcResultAd" }) };
});

import PensionHikeClient from "@/app/calc/pension-hike-2027/Client";

const VISIBLE = "mt-2 text-[11px] font-bold text-electric";
const render = (input?: string) => {
  engine.input = input ?? null;
  return renderToStaticMarkup(createElement(PensionHikeClient));
};
const helpLine = (html: string) => html.match(/<p id="ph-input-help" class="([^"]*)">([\s\S]*?)<\/p>/);

afterEach(() => {
  engine.input = null;
});

describe("국민연금 인상 계산기 입력 안내 — 평소에는 화면 높이 0, 결과창 광고 위 줄 수 복원", () => {
  it("기본값 3,500,000원에서는 sr-only — aria-describedby 대상과 낭독 문구는 그대로", () => {
    const html = render();
    const line = helpLine(html);
    expect(line?.[1]).toBe("sr-only");
    expect(line?.[2]).toBe("기준소득월액 3,500,000원 · 천 원 미만 절사");
    expect(html.split('id="ph-input-help"').length - 1).toBe(1);
    expect(html).toContain('aria-describedby="ph-input-help"');
  });

  it.each([
    ["상한", "6,590,001", "상한 6,590,000원 적용"],
    ["하한", "1", "하한 410,000원 적용"],
    ["입력 오류", "0", "0보다 큰 월 소득을 입력해 주세요."],
  ])("%s일 때만 보이는 한 줄로 나온다", (_, input, text) => {
    const line = helpLine(render(input));
    expect(line?.[1]).toBe(VISIBLE);
    expect(line?.[2]).toContain(text);
  });

  it("순서는 그대로 — 안내 줄(입력 카드 안) 다음 결과, 그 바로 다음이 결과창 광고", () => {
    const html = render();
    const help = html.indexOf('id="ph-input-help"');
    const result = html.indexOf('aria-label="국민연금 보험료 계산 결과"');
    const ad = html.indexOf('<i data-test-ad="CalcResultAd"></i>');
    expect(help).toBeGreaterThan(-1);
    expect(result).toBeGreaterThan(help);
    expect(ad).toBeGreaterThan(result);
  });
});
