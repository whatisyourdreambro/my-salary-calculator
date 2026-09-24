// 성과급 계산기 calc_start/calc_success v2 배선 회귀 가드 (2026-09-25, 감사 승인 항목 4 — GA4 계측 수리 (d))
//
// 배경: GA4 calc_type 분해에서 삼성(개인 4,587·풀 2,755 성공)과 달리 SK하이닉스(PV 1,108)·
// 현대로템(504)·한화에어로스페이스(187) 성과급 계산기는 calc_success 0건 — 훅이 아예 없었다.
// 현대차 성과급 계산기(hyundai-bonus)와 같은 useCalculatorMeasurement 패턴으로 배선한다:
// 입력 영역에만 inputProps, 결과 카드에만 resultRef, 고급 옵션 '토글 버튼'은 시작으로 치지 않는다.
// 이벤트 파라미터는 calc_type·page_path·measurement_version 뿐(analyticsPrivacy CALC_KEYS) — 금액 미전송.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/calc/sk-hynix-bonus" }));

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

const CALCS = [
  { file: "src/app/calc/sk-hynix-bonus/Client.tsx", calcType: "sk-hynix-bonus", inputAreas: 5, heading: "내 성과급 계산 결과" },
  { file: "src/app/calc/hyundai-rotem-bonus/Client.tsx", calcType: "hyundai-rotem-bonus", inputAreas: 3, heading: "내 성과급 계산 결과" },
  { file: "src/app/calc/hanwha-aerospace-bonus/Client.tsx", calcType: "hanwha-aerospace-bonus", inputAreas: 5, heading: "내 성과급 계산 결과" },
  // 기준 패턴 — 이미 배선된 현대차
  { file: "src/app/calc/hyundai-bonus/Client.tsx", calcType: "hyundai-bonus", inputAreas: 4, heading: "" },
];

describe("bonus calculators use the shared v2 calculation measurement", () => {
  for (const { file, calcType, inputAreas } of CALCS) {
    it(`${calcType}: hook, calc_type, input areas and a single result ref`, () => {
      const src = read(file);
      expect(src).toContain('import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";');
      expect(src).toContain(`calcType: "${calcType}"`);
      expect(src.match(/\{\.\.\.measurement\.inputProps\}/g)?.length).toBe(inputAreas);
      expect(src.match(/ref=\{measurement\.resultRef\}/g)?.length).toBe(1);
      // valid 는 입력 유효성 + 결과 유한성 — 빈 칸(0 강제 변환)·NaN 을 성공으로 치지 않는다
      expect(src).toMatch(/valid: inputsValid && \[[^\]]+\]\s*\.every\(Number\.isFinite\)/);
      // 직접 gtag·trackEvent 호출 없이 훅만 사용(금액 전송 경로 차단)
      expect(src).not.toMatch(/trackEvent\(|trackCalcSuccess\(|trackCalcStart\(|window\.gtag/);
    });

    it(`${calcType}: the advanced-options toggle button is outside every inputProps area`, () => {
      const src = read(file);
      const toggle = src.indexOf("setShowAdvanced(!showAdvanced)");
      expect(toggle).toBeGreaterThan(-1);
      const openingSection = src.lastIndexOf("<section", toggle);
      expect(src.slice(openingSection, toggle)).not.toContain("inputProps");
    });
  }

  it("the three newly wired calculators still server-render their result card", async () => {
    for (const { file, heading } of CALCS.slice(0, 3)) {
      const mod = (await import(`@/${file.replace(/^src\//, "").replace(/\.tsx$/, "")}`)) as { default: ComponentType };
      const html = renderToStaticMarkup(createElement(mod.default));
      expect(html).toContain(heading);
      expect(html).toContain("세후 실수령");
      // 계측은 이벤트 핸들러·ref 뿐 — SSR 마크업에 계측 속성을 남기지 않는다(레이아웃·높이 무변경)
      expect(html).not.toContain("inputProps");
      expect(html).not.toContain("resultRef");
    }
  });
});
