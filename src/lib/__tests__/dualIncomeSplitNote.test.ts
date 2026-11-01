// 맞벌이 몰아주기 — 자녀를 나눠 귀속하는 최적안에는 자녀 지출 귀속 조건을 붙인다 (2026-10-05 감사 code2-02)
// 엔진은 자녀 의료비·교육비·기부금을 한 덩어리로 한쪽에 귀속한다. 자녀를 나눠 기본공제할 때 그 배분은 지출이 모두
// 그쪽 자녀 몫일 때만 가능하므로(지출 자녀를 기본공제하는 사람만 공제 — 소득세법 제59조의4제2항·제3항·제4항),
// 화면에 조건을 표시한다. 2026-11-01 B26: ca2add3f8 을 재이식하며 Codex 의 연간 자녀세액공제 인원 줄은 그대로 두고
// 조건 문구를 그 다음 줄에 붙였다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateDualIncomeYearEnd2026 } from "@/lib/dualIncomeYearEnd2026";

const PAGE_DEFAULTS = {
  salaryMe: 60_000_000, salarySp: 40_000_000,
  childMedical: 3_000_000, childEducation: 2_000_000, childDonation: 0, coupleMedical: 3_000_000,
};

describe("/calc/dual-income-year-end 최적 배분 문구", () => {
  const src = readFileSync(resolve(process.cwd(), "src/app/calc/dual-income-year-end/Client.tsx"), "utf8");
  it("자녀를 나눌 때만 조건 문구, 한쪽에 몰 때는 종전 문구", () => {
    expect(src).toContain("const splitKids = k > 0 && k < children;");
    expect(src).toContain("쪽 자녀 지출일 때만 가능)");
    expect(src).toContain("`자녀 의료비·교육비·기부금 → ${side} (${side} 쪽 자녀 지출일 때만 가능)`");
    expect(src).toContain("`자녀 의료비·교육비·기부금 → ${side}`");
  });

  it("연간 자녀세액공제 인원 줄은 그대로 두고, 자녀 지출 줄은 그 다음이다 (B26 재이식)", () => {
    const creditLine = src.indexOf("parts.push(`그중 연간 자녀세액공제 본인 ${optimal.assign.creditKidsToMe}명");
    const splitNote = src.indexOf("const splitKids = k > 0 && k < children;");
    const coupleMed = src.indexOf("if (optimal.assign.coupleMedTo)");
    expect(creditLine).toBeGreaterThan(0);
    expect(creditLine).toBeLessThan(splitNote);
    expect(splitNote).toBeLessThan(coupleMed);
  });

  it("첫 화면(자녀 0명)에는 자녀 줄이 없어 조건 문구가 뜰 수 없다", () => {
    expect(src).toContain("const [children, setChildren] = useState(0);");
    expect(src).toMatch(/if \(children > 0\) \{\s+const k = optimal\.assign\.kidsToMe;/);
  });

  it("조건 문구가 실제로 뜨는 입력이 있다 — 기본 예시에 자녀 2명·연간 자녀세액공제 1명이면 자녀를 1명씩 나눈다", () => {
    const split = calculateDualIncomeYearEnd2026({ ...PAGE_DEFAULTS, children: 2, childTaxCreditEligibleChildren: 1 });
    expect(split.optimal.assign.kidsToMe).toBe(1);
    expect(split.optimal.assign.childExpTo).toBe("sp");
    // 자녀 1명은 나눌 수 없다 (0 < k < 1 인 정수 없음)
    for (const eligible of [0, 1]) {
      const one = calculateDualIncomeYearEnd2026({ ...PAGE_DEFAULTS, children: 1, childTaxCreditEligibleChildren: eligible });
      expect([0, 1]).toContain(one.optimal.assign.kidsToMe);
    }
  });
});
