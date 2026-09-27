// /calc/civil-servant-net-pay 클라이언트 렌더 가드 (2026-09-27)
//
// 결과 직하 광고(CalcResultAd) 위 블록(입력 카드 + 결과 카드)은 직종과 관계없이 같은 높이여야 한다
// (2026-08-16 광고 위 UI 사건 규칙). 해시 프리셋(#teacher 등)은 하이드레이션 뒤 상태만 바꾸므로,
// 다섯 직종 모두 광고 위 마크업의 행·칸·결과 행 수와 '높이에 영향을 주는 클래스' 순서가 같아야 한다.
// 또한 계측(calc_type)과 서버 렌더 기본값(골든 A = 9급 1호봉 실수령 2,218,140원)을 고정한다.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/calc/civil-servant-net-pay" }));

import CivilNetPayClient from "@/app/calc/civil-servant-net-pay/Client";
import { computeCivilNetPay, CIVIL_DEFAULT_INPUT, type CivilKind } from "@/lib/civilServantNetPay";

const KINDS: CivilKind[] = ["general", "teacher", "police", "fire", "soldier"];
const CLIENT = "src/app/calc/civil-servant-net-pay/Client.tsx";

const render = (kind?: CivilKind) =>
  renderToStaticMarkup(createElement(CivilNetPayClient, kind ? { initialKind: kind } : {}));

/** 광고 위 블록 — 테스트 환경에선 AdSlot 이 null 이므로 첫 광고 아래 섹션(<section) 앞까지 */
const aboveAd = (html: string) => {
  const cut = html.indexOf("<section");
  expect(cut).toBeGreaterThan(0);
  return html.slice(0, cut);
};

const count = (html: string, needle: string) => html.split(needle).length - 1;

/**
 * 높이에 영향을 주는 클래스만 남긴 태그 골격 (색·활성 상태 클래스는 제외).
 * <option> 개수(계급·호봉 선택지)는 높이와 무관해 빼고, 같은 고정 높이 클래스를 쓰는 라벨(label/span)과
 * 컨트롤(select/button)은 한 종류로 본다 — 칸의 크기는 클래스(h-5·h-11)가 정한다.
 */
const SIZE_CLASS = /^(sm:)?(h-|min-h-|mt-|mb-|my-|p[xytb]?-|grid-cols-|gap-|leading-|text-(xs|sm|base|lg|xl|\dxl|\[)|space-y-|truncate|whitespace-|overflow-)/;
const TAG_KIND: Record<string, string> = { label: "text", span: "text", select: "control", button: "control" };
const skeleton = (html: string) =>
  [...html.matchAll(/<([a-z]+)([^>]*)>/g)]
    .filter(([, tag]) => tag !== "option")
    .map(([, tag, attrs]) => {
      const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? "";
      return `${TAG_KIND[tag] ?? tag}[${cls.split(/\s+/).filter((c) => SIZE_CLASS.test(c)).join(" ")}]`;
    });

describe("공무원 실수령액 계산기 — 광고 위 고정 높이", () => {
  const blocks = Object.fromEntries(KINDS.map((kind) => [kind, aboveAd(render(kind))]));

  it("다섯 직종 모두 행 4개·칸 수·결과 행 수가 같다", () => {
    for (const kind of KINDS) {
      const html = blocks[kind];
      expect(count(html, "data-civ-row="), kind).toBe(4);
      expect(count(html, 'data-civ-slot=""'), kind).toBe(count(blocks.general, 'data-civ-slot=""'));
      // 캡션 1 + 결과 7행 = 8 (월 실수령액 큰 숫자는 캡션 아래 고정 높이 줄)
      expect(count(html, 'data-civ-result-row=""'), kind).toBe(8);
    }
    // 직종 1 + 계급·호봉·재직 3 + 가족 4 + 직종별 옵션 3
    expect(count(blocks.general, 'data-civ-slot=""')).toBe(10);
  });

  it("높이 관련 클래스·태그 골격이 직종마다 같다", () => {
    const base = skeleton(blocks.general);
    for (const kind of KINDS) expect(skeleton(blocks[kind]), kind).toEqual(base);
  });

  it("서버 렌더 기본값은 골든 A (9급 1호봉 실수령 2,218,140원)", () => {
    const html = render();
    const a = computeCivilNetPay(CIVIL_DEFAULT_INPUT);
    expect(a.net).toBe(2_218_140);
    expect(aboveAd(html)).toContain("2,218,140원");
    expect(aboveAd(html)).toContain("2,607,490원");
    expect(html).not.toMatch(/NaN|undefined|Infinity/);
  });

  it("병사 프리셋은 공제 0원을 숨기지 않고 표시한다", () => {
    const html = blocks.soldier;
    expect(html).toContain("1,500,000원");
    expect(count(html, ">0원<")).toBeGreaterThanOrEqual(4);
  });
});

describe("계측 배선", () => {
  function* walk(dir: string): Generator<string> {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) {
        if (name === "__tests__" || name === "node_modules") continue;
        yield* walk(p);
      } else if (/\.tsx?$/.test(name)) yield p;
    }
  }

  it("useCalculatorMeasurement·calc_type civil_servant_net_pay (사이트 전체에서 하나)", () => {
    const src = readFileSync(resolve(process.cwd(), CLIENT), "utf8");
    expect(src).toContain('import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";');
    expect(src).toMatch(/valid:[^;]*\.every\(Number\.isFinite\)/);
    expect(src).toContain("ref={measurement.resultRef}");
    expect(src).not.toMatch(/trackEvent\(|trackCalcSuccess\(|trackCalcStart\(|window\.gtag/);
    // 해시 프리셋은 useSearchParams 가 아닌 useEffect(정적 렌더 유지)
    expect(src).not.toMatch(/import[^;]*useSearchParams|useSearchParams\(/);
    const all = [...walk(resolve(process.cwd(), "src"))].map((p) => readFileSync(p, "utf8")).join("\n");
    expect(all.split('calcType: "civil_servant_net_pay"').length - 1).toBe(1);
  });
});
