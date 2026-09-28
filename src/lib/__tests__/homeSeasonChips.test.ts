// 홈 '목적별 계산기' 보유세·시즌 칩 게이트 고정 (SEO 신선도 정비 2026-09-29, MI-05)
//
// 종전 '9월 재산세 2기분 납부 (9/16~30)' 칩은 날짜 게이트 없이 박혀 10/1 부터 지난 기한을 광고했다.
// 납부기간 게이트(propertyTaxPeriod.ts)로 빌드 시점(KST)에 라벨을 고른다. 칩은 MultiplexAd(홈 마지막 광고) 아래
// HomeSeoSection 안이다. 새 라벨은 기본 한국어·라틴 서브셋 안이어야 한다(salaryContentIntegrity 폰트 가드와 같은 기준).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HOME_PROPERTY_TAX_CHIP_LABELS, homePropertyTaxChip } from "@/components/home/HomeSeoSection";

const kst = (iso: string) => new Date(`${iso}T00:00:00+09:00`);

describe("홈 보유세 칩 (MI-05)", () => {
  it("납부기간 경계(KST)에 따라 라벨이 바뀐다", () => {
    expect(homePropertyTaxChip(kst("2026-09-30")).label).toBe("9월 재산세 2기분 납부 (9/16~30)");
    expect(homePropertyTaxChip(kst("2026-10-01")).label).toBe("재산세·보유세 계산기");
    expect(homePropertyTaxChip(kst("2026-11-25")).label).toBe("12월 종부세 납부 (12/1~15)");
    expect(homePropertyTaxChip(kst("2026-12-16")).label).toBe("재산세·보유세 계산기");
    expect(homePropertyTaxChip(kst("2026-10-01")).href).toBe("/property-holding-tax-2026");
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
    const missing = [...Object.values(HOME_PROPERTY_TAX_CHIP_LABELS).join("")].filter((ch) => ch.codePointAt(0)! > 127 && !base.has(ch.codePointAt(0)!));
    expect(missing).toEqual([]);
  });

  it("고정 9월 칩 리터럴이 칩 목록에 남아 있지 않다", () => {
    const src = readFileSync("src/components/home/HomeSeoSection.tsx", "utf8");
    expect(src).not.toContain('{ label: "9월 재산세 2기분 납부 (9/16~30)", href: "/property-holding-tax-2026" }');
    expect(src).toContain("homePropertyTaxChip(),");
  });
});
