// 홈 '목적별 계산기' 12~1월 피크 시즌 칩 고정 (2026-11-15 SEASONA, 감사 components ideas[4])
// 칩 목록은 HomeSeoSection 안 — 홈 마지막 광고(HomeClient 끝 MultiplexAd) 아래다. DEC·JAN 빌드에서만 칩이 더해지고,
// 지금(OCT) 빌드의 홈 HTML 은 그대로다. 라벨 글자는 기본 한국어·라틴 서브셋 안(homeSeasonChips.test 와 같은 기준).
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HOME_SEASON_EXTRA_CHIPS, homeSeasonExtraChips } from "@/components/home/HomeSeoSection";
import { SEASON_KEY } from "@/config/seasonKey.generated";

const pageExists = (href: string) => existsSync(resolve(process.cwd(), "src/app", href.slice(1), "page.tsx"));

describe("홈 시즌 피크 칩 (SEASONA components ideas[4])", () => {
  it("DEC·JAN 에만 칩이 있고 SEP·OCT 는 빈 배열 — 지금 빌드 키에서는 홈 출력 불변", () => {
    expect(homeSeasonExtraChips("SEP")).toEqual([]);
    expect(homeSeasonExtraChips("OCT")).toEqual([]);
    expect(homeSeasonExtraChips("DEC").map((c) => c.href)).toEqual(["/calc/year-end-bonus-tax", "/calc/bonus-calculators", "/civil-servant-pay-2027"]);
    expect(homeSeasonExtraChips("JAN").map((c) => c.href)).toEqual(["/calc/january-bonus", "/calc/bonus-calculators", "/civil-servant-pay-2027"]);
    if (SEASON_KEY === "OCT" || SEASON_KEY === "SEP") expect(homeSeasonExtraChips()).toEqual([]);
  });

  it("목적지는 실제 정적 쪽이고 라벨에 숫자 주장(인상률·금액)이 없다", () => {
    for (const chips of Object.values(HOME_SEASON_EXTRA_CHIPS)) {
      for (const chip of chips!) {
        expect(pageExists(chip.href), chip.href).toBe(true);
        expect(chip.label).not.toMatch(/%|\d\s*(?:원|만|억)/);
      }
    }
  });

  it("라벨 글자는 기본 한국어·라틴 서브셋 안", () => {
    const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
    const base = new Set<number>();
    for (const m of source.matchAll(/const (latin|korean) = localFont\(\{[\s\S]*?prop: "unicode-range", value: "([^"]+)"/g)) {
      for (const part of m[2].split(",")) {
        const [first, last = first] = part.trim().slice(2).split("-").map((v) => parseInt(v, 16));
        for (let c = first; c <= last; c++) base.add(c);
      }
    }
    const labels = Object.values(HOME_SEASON_EXTRA_CHIPS).flatMap((chips) => chips!.map((c) => c.label)).join("");
    expect([...labels].filter((ch) => ch.codePointAt(0)! > 127 && !base.has(ch.codePointAt(0)!))).toEqual([]);
  });

  it("칩은 시즌 1순위 허브 칩 바로 뒤에 펼쳐지고 href 중복 제거를 그대로 거친다", () => {
    const src = readFileSync("src/components/home/HomeSeoSection.tsx", "utf8");
    const hub = src.indexOf("...homeSeasonHubChips(),");
    const extra = src.indexOf("...homeSeasonExtraChips(),");
    expect(hub).toBeGreaterThan(-1);
    expect(extra).toBeGreaterThan(hub);
    expect(src.indexOf(".filter((chip, i, all) => all.findIndex((c) => c.href === chip.href) === i)")).toBeGreaterThan(extra);
  });
});
