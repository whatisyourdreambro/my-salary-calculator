// 맞벌이 몰아주기 — 자녀를 나눠 귀속하는 최적안의 자녀 지출 줄 (2026-10-05 감사 code2-02, 2026-11-01 B26 → 통합 스윕 수리)
// 엔진은 자녀 의료비·교육비·기부금을 한 덩어리로 한쪽에 귀속한다. 자녀를 나눠 기본공제할 때 그 배분은 지출이 모두
// 그쪽 자녀 몫일 때만 가능하다(지출 자녀를 기본공제하는 사람만 공제 — 소득세법 제59조의4). B26 은 그 조건을 결과 줄 끝에
// '(… 쪽 자녀 지출일 때만 가능)' 으로 붙였지만, 이 줄은 320px 에서 이미 한 줄을 거의 채워 320~500px 에서 두 줄이 되고
// CalcResultAd 이하 광고가 20~60px 내려갔다(11/1 통합 스윕 실측). 광고 위 줄 수를 늘리지 않는 원칙에 따라 종전 문구로
// 되돌리고, 조건은 같은 결과 카드 아래 고지('자녀별 지출도 구분하지 않습니다 … 배분 이익이 실제보다 크게 표시될 수
// 있습니다')가 대신한다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateDualIncomeYearEnd2026 } from "@/lib/dualIncomeYearEnd2026";

const PAGE_DEFAULTS = {
  salaryMe: 60_000_000, salarySp: 40_000_000,
  childMedical: 3_000_000, childEducation: 2_000_000, childDonation: 0, coupleMedical: 1_000_000,
};

describe("/calc/dual-income-year-end 최적 배분 문구 — 자녀 지출 줄", () => {
  const src = readFileSync(resolve(process.cwd(), "src/app/calc/dual-income-year-end/Client.tsx"), "utf8");

  it("자녀를 나눌 때도 자녀 지출 줄은 종전 문구 한 가지다 (CalcResultAd 위 줄 수 불변)", () => {
    expect(src).toContain("`자녀 의료비·교육비·기부금 → ${SIDE_LABEL[optimal.assign.childExpTo]}`");
    expect(src).not.toContain("쪽 자녀 지출일 때만 가능");
    expect(src).not.toContain("const splitKids");
  });

  it("조건은 결과 카드 아래 고지가 대신한다 — 고지는 CalcResultAd 보다 앞, 자녀별 지출 미구분·과대 표시 가능", () => {
    const disclosure = src.indexOf("자녀별 지출도 구분하지 않습니다");
    expect(disclosure).toBeGreaterThan(0);
    expect(src.indexOf("배분 이익이 실제보다 크게 표시될 수 있습니다")).toBeGreaterThan(disclosure);
    expect(disclosure).toBeLessThan(src.indexOf("<CalcResultAd />"));
  });

  it("연간 자녀세액공제 인원 줄 다음이 자녀 지출 줄이다", () => {
    const creditLine = src.indexOf("parts.push(`그중 연간 자녀세액공제 본인 ${optimal.assign.creditKidsToMe}명");
    const childExp = src.indexOf("`자녀 의료비·교육비·기부금 → ${SIDE_LABEL[optimal.assign.childExpTo]}`");
    const coupleMed = src.indexOf("if (optimal.assign.coupleMedTo)");
    expect(creditLine).toBeGreaterThan(0);
    expect(creditLine).toBeLessThan(childExp);
    expect(childExp).toBeLessThan(coupleMed);
  });

  it("자녀를 나누는 최적안은 실제로 나온다 — 3,000만·3,000만·자녀 2명(세액공제 0명)이면 1명씩 나누고 지출은 한쪽", () => {
    const split = calculateDualIncomeYearEnd2026({
      ...PAGE_DEFAULTS, salaryMe: 30_000_000, salarySp: 30_000_000, children: 2, childTaxCreditEligibleChildren: 0,
    });
    expect(split.optimal.assign.kidsToMe).toBe(1);
    expect(split.optimal.assign.childExpTo).not.toBeNull();
    // 자녀 1명은 나눌 수 없다 (0 < k < 1 인 정수 없음)
    for (const eligible of [0, 1]) {
      const one = calculateDualIncomeYearEnd2026({ ...PAGE_DEFAULTS, children: 1, childTaxCreditEligibleChildren: eligible });
      expect([0, 1]).toContain(one.optimal.assign.kidsToMe);
    }
  });
});
