// 현대모비스 성과급 한 줄 — 허브 카드 hook 과 회사 페이지 계산기 안내 desc 를 2026 임단협 타결로 (N2-data-09, data-b01-F03,
// 운영자 승인 2026-11-18 C-1 / R4 2차 DATA2)
//
// /calc/hyundai-mobis-bonus 는 2026 타결(성과금 400% + 격려금 1,320만 + 주식 8주)을 기본값으로 이미 바꿨다(N2-calc-19).
// 그런데 같은 계산기를 소개하는 두 줄이 '임단협 450% + 1,420만 + 우리사주 17주 (2025 타결)'로 남아 있었다.
//  - src/data/bonusCalcHub.ts hook: /calc/bonus-calculators 카드(HomeTopAd 아래·GuideMidAd 위 카드 그리드)와 헤더 검색 설명
//  - src/components/CompanyBonusCalculatorLink.tsx desc: /salary-db/hyundai-mobis 계산기 안내(GuideMidAd 아래·Display2Ad 위)
// bonusCalcHub.ts 머리 주석대로 두 줄은 함께 움직인다 — 같은 문자열이어야 한다.
// 출처: 더팩트 2026-08-26(잠정합의안 성과급 400%+1,320만원·주식 8주)·2026-09-04(임단협 마무리), DART 2026-10-30
// 주요사항보고서(자기주식처분결정, rcpNo 20261030000571 — 2026년 단체교섭에 따른 회사주식 지급, 처분 예정일 2026-11-30).
// 광고 위 문구라 종전보다 넓으면 안 된다: 사이트 글꼴(MoneySalaryText 기본 인스턴스, unitsPerEm 2048) advance 합이 종전 이하.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BONUS_CALCS } from "@/data/bonusCalcHub";

const NEW = "2026 임단협 타결 400% + 1,320만 + 주식 8주";
const OLD = "임단협 450% + 1,420만 + 우리사주 17주 (2025 타결)";

/** MoneySalaryText 기본 인스턴스(wght 400) advance — 2026-11-18 fontTools 측정 */
const ADVANCE: Record<string, number> = {
  "0": 1220, "1": 898, "2": 1202, "3": 1264, "4": 1278, "5": 1222, "6": 1256, "7": 1130, "8": 1242, "9": 1256,
  " ": 514, ",": 528, "(": 698, ")": 698, "%": 1766, "+": 1284,
};
const HANGUL = 1770;
const width = (text: string) =>
  [...text].reduce((sum, ch) => {
    if (/[가-힣]/.test(ch)) return sum + HANGUL;
    if (!(ch in ADVANCE)) throw new Error(`advance 표에 없는 글자: ${JSON.stringify(ch)}`);
    return sum + ADVANCE[ch];
  }, 0);

const read = (rel: string) => readFileSync(rel, "utf8");

describe("N2-data-09 현대모비스 허브 hook·회사 페이지 desc = 2026 임단협 타결", () => {
  it("허브 카드 hook 이 2026 타결 문자열이다", () => {
    const mobis = BONUS_CALCS.find((c) => c.slug === "hyundai-mobis-bonus");
    expect(mobis?.companyId).toBe("hyundai-mobis");
    expect(mobis?.hook).toBe(NEW);
  });

  it("회사 페이지 계산기 안내 desc 가 허브 hook 과 같은 문자열이다(두 파일이 함께 움직인다)", () => {
    const src = read("src/components/CompanyBonusCalculatorLink.tsx");
    const block = src.slice(src.indexOf('"hyundai-mobis": {'), src.indexOf('"hanwha-aerospace": {'));
    expect(block).toContain('calc: "/calc/hyundai-mobis-bonus"');
    expect(block).toContain(`desc: "${NEW}",`);
    const hook = BONUS_CALCS.find((c) => c.slug === "hyundai-mobis-bonus")!.hook;
    expect(block).toContain(`desc: "${hook}",`);
  });

  it("2025 타결 문구가 두 파일에 남아 있지 않다", () => {
    for (const rel of ["src/data/bonusCalcHub.ts", "src/components/CompanyBonusCalculatorLink.tsx"]) {
      const src = read(rel);
      expect(src, rel).not.toContain(OLD);
      expect(src, rel).not.toContain("우리사주 17주 (2025 타결)");
    }
  });

  it("수치가 계산기의 2026 타결 시나리오(400%·1,320만·주식 8주)와 같다", () => {
    const client = read("src/app/calc/hyundai-mobis-bonus/Client.tsx");
    const start = client.indexOf('id: "2026-settled"');
    expect(start).toBeGreaterThan(0);
    const scenario = client.slice(start, client.indexOf("},", start));
    expect(scenario).toMatch(/bonusPercent: 400,/);
    expect(scenario).toMatch(/fixedAmount: 13_200_000,/);
    expect(scenario).toMatch(/freeShares: 8,/);
    expect(NEW).toContain("400%");
    expect(NEW).toContain("1,320만");
    expect(NEW).toContain("주식 8주");
  });

  it("광고 위 문구라 종전보다 좁다(글꼴 단위 합)", () => {
    expect(width(NEW)).toBe(39328);
    expect(width(OLD)).toBe(45032);
    expect(width(NEW)).toBeLessThan(width(OLD));
  });
});
