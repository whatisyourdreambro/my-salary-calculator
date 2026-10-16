import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const observed = vi.hoisted(() => ({ states: [] as unknown[], index: 0, gross: [] as number[] }));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, useState: () => [observed.states[observed.index++], vi.fn()] };
});
vi.mock("@/components/NumberInput", () => ({ default: () => null }));
vi.mock("@/hooks/useCalculatorMeasurement", () => ({
  useCalculatorMeasurement: () => ({ inputProps: {}, resultRef: () => undefined }),
}));
vi.mock("@/lib/bonusTaxCalc", async () => {
  const actual = await vi.importActual<typeof import("@/lib/bonusTaxCalc")>("@/lib/bonusTaxCalc");
  return {
    ...actual,
    calcBonusNet: (...args: Parameters<typeof actual.calcBonusNet>) => {
      observed.gross.push(args[1]);
      return actual.calcBonusNet(...args);
    },
  };
});

import MobisClient from "@/app/calc/hyundai-mobis-bonus/Client";
import RotemClient from "@/app/calc/hyundai-rotem-bonus/Client";

function renderMobis(year: 2024 | 2025, custom: boolean) {
  observed.index = 0;
  observed.states = [`${year}-settled`, 500, 280_000, false, 450, 14_200_000, 17, custom, 0, true];
  return renderToStaticMarkup(createElement(MobisClient));
}
function renderRotem(year: 2024 | 2025, custom: boolean) {
  observed.index = 0;
  observed.states = [`${year}-agreed`, 400, false, 450, 16_200_000, custom, 0, true, 0];
  return renderToStaticMarkup(createElement(RotemClient));
}

describe("회사 성과급 직접 입력의 시나리오 독립성", () => {
  beforeEach(() => { observed.gross = []; });

  it("모비스의 같은 직접 입력값은 이전에 선택한 연도와 무관하게 같은 세전액을 계산한다", () => {
    renderMobis(2024, true);
    renderMobis(2025, true);
    expect(observed.gross).toEqual([41_460_000, 41_460_000]);
  });

  it("로템의 같은 직접 입력값은 이전에 선택한 연도와 무관하며 잔존 상품권 안내도 표시하지 않는다", () => {
    const oldYear = renderRotem(2024, true);
    const newYear = renderRotem(2025, true);
    expect(observed.gross).toEqual([34_200_000, 34_200_000]);
    expect(oldYear).toContain("해당 시나리오 없음");
    expect(newYear).toContain("해당 시나리오 없음");
    expect(newYear).not.toContain("2025 타결안 포함분");
  });

  it("모비스의 기존 시나리오 계산은 2025년 상품권과 2024년 패키지를 그대로 반영한다", () => {
    renderMobis(2025, false);
    renderMobis(2024, false);
    expect(observed.gross).toEqual([41_660_000, 50_280_000]);
  });

  it("로템의 기존 시나리오 계산은 2025년 상품권과 2024년 패키지를 그대로 반영한다", () => {
    const html = renderRotem(2025, false);
    renderRotem(2024, false);
    expect(observed.gross).toEqual([34_400_000, 38_000_000]);
    expect(html).toContain("2025 타결안 포함분");
  });
});
