// 페이지에 없는 것을 약속하던 검색 설명 3곳 가드 (2026-11-15 감사 app-tools-fun-b01-F05·b02-M03·b02-M02, N2-app-tools-fun-07)
//
// - /fun/financial-mbti: 결과 16개에 없는 워렌 버핏형·욜로족·짠돌이형, 질문 4개인데 '3분'
// - /fun/salary-battle: 총보상에 4대보험이 들어간다고 했지만 versusEngine 은 기본급+인센티브+주식+사이닝만 더한다
// - /lotto: lottoGenerator 에 없는 '합계 범위' 조건
// 메타데이터만 읽는다(렌더·광고 요청 없음). 변경 기록은 docs/gsc-sniping-log.md 2026-11-15 절.
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/JsonLd", () => ({ default: () => null }));
vi.mock("@/components/AutoShareSection", () => ({ default: () => null }));

import { metadata as mbtiMetadata } from "@/app/fun/financial-mbti/layout";
import { metadata as battleMetadata } from "@/app/fun/salary-battle/layout";
import { metadata as lottoMetadata } from "@/app/lotto/layout";

const descriptions = (m: { description?: string | null; openGraph?: unknown; twitter?: unknown }) => {
  const og = (m.openGraph ?? {}) as { description?: string };
  const tw = (m.twitter ?? {}) as { description?: string };
  return [m.description ?? "", og.description, tw.description].filter((d): d is string => typeof d === "string");
};

describe("search descriptions promise only what the pages have", () => {
  it.each([
    ["/fun/financial-mbti", mbtiMetadata, "퀀트 전략가", ["워렌 버핏형", "욜로족", "짠돌이형", "3분"]],
    ["/fun/salary-battle", battleMetadata, "주식 포함", ["4대보험"]],
    ["/lotto", lottoMetadata, "홀짝 균형", ["합계 범위"]],
  ] as const)("%s", (_route, metadata, mustHave, mustNot) => {
    const all = descriptions(metadata);
    expect(all.length).toBeGreaterThanOrEqual(1);
    for (const d of all) {
      expect(d).toContain(mustHave);
      for (const bad of mustNot) expect(d).not.toContain(bad);
    }
  });

  it("financial-mbti names only result types that exist and keeps the disclaimer", () => {
    const page = readFileSync("src/app/fun/financial-mbti/page.tsx", "utf8");
    const d = String(mbtiMetadata.description);
    for (const t of ["퀀트 전략가", "장기 적립식 투자자", "테마 투자 선구자"]) {
      expect(d).toContain(t);
      expect(page).toContain(`title: "${t}"`);
    }
    expect(d).toContain("4가지 질문");
    expect(d).toContain("공식 MBTI 검사나 투자성향 진단이 아닙니다");
  });

  it("salary-battle total comp matches the engine (no insurance term) and keeps 워라밸", () => {
    const engine = readFileSync("src/lib/versusEngine.ts", "utf8");
    expect(engine).toMatch(/return salary\.base \+ incentiveAmount \+ stockAmount \+ \(salary\.signOn \|\| 0\);/);
    expect(String(battleMetadata.description)).toContain("워라밸");
  });

  it("lotto generator really has the odd/even and high/low strategies and no sum filter", () => {
    const gen = readFileSync("src/lib/lottoGenerator.ts", "utf8");
    expect(gen).toContain('strategy === "balancedOddEven"');
    expect(gen).toContain('strategy === "balancedHighLow"');
    expect(gen).not.toMatch(/strategy === "[^"]*[Ss]um[^"]*"/);
  });
});
