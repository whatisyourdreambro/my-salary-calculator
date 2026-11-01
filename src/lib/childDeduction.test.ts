import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateChildDeduction2026, type ChildDeductionInput } from "./childDeduction";

const empty: ChildDeductionInput = {
  basicDeductionChildren: 0, childTaxCreditEligibleChildren: 0,
  firstBirthOrAdoption: 0, secondBirthOrAdoption: 0, thirdPlusBirthOrAdoption: 0,
};

describe("2026 귀속 자녀 공제액", () => {
  it("기본공제 대상이 없으면 두 종류 공제 모두 0원이다", () => {
    expect(calculateChildDeduction2026(empty)).toEqual({
      valid: true, incomeDeduction: 0, childTaxCredit: 0, birthAdoptionTaxCredit: 0, taxCreditBeforeLimit: 0,
    });
  });
  it("기본공제 1명·연간 세액공제 0명을 구분하며 추가 소득공제를 만들지 않는다", () => {
    expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: 1 })).toEqual({
      valid: true, incomeDeduction: 1_500_000, childTaxCredit: 0, birthAdoptionTaxCredit: 0, taxCreditBeforeLimit: 0,
    });
  });
  it.each([[1, 250_000], [2, 550_000], [3, 950_000], [4, 1_350_000], [5, 1_750_000]])(
    "연간 세액공제 적격 대상 %i명의 공제액은 %i원이다", (children, credit) => {
      expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: children, childTaxCreditEligibleChildren: children })).toEqual({
        valid: true, incomeDeduction: children * 1_500_000, childTaxCredit: credit,
        birthAdoptionTaxCredit: 0, taxCreditBeforeLimit: credit,
      });
    },
  );
  it("기본공제 대상 중 일부만 연간 세액공제 대상이어도 두 공제액을 합치지 않는다", () => {
    expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: 4, childTaxCreditEligibleChildren: 2 })).toEqual({
      valid: true, incomeDeduction: 6_000_000, childTaxCredit: 550_000,
      birthAdoptionTaxCredit: 0, taxCreditBeforeLimit: 550_000,
    });
  });
  it.each([
    ["firstBirthOrAdoption", 300_000], ["secondBirthOrAdoption", 500_000], ["thirdPlusBirthOrAdoption", 700_000],
  ] as const)("해당 연도 %s 1명의 공제는 %i원이다", (field, credit) => {
    expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: 1, [field]: 1 })).toEqual({
      valid: true, incomeDeduction: 1_500_000, childTaxCredit: 0,
      birthAdoptionTaxCredit: credit, taxCreditBeforeLimit: credit,
    });
  });
  it("첫째·둘째 쌍둥이의 출산 공제는 80만원이고 기본공제는 300만원이다", () => {
    expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: 2, firstBirthOrAdoption: 1, secondBirthOrAdoption: 1 })).toEqual({
      valid: true, incomeDeduction: 3_000_000, childTaxCredit: 0,
      birthAdoptionTaxCredit: 800_000, taxCreditBeforeLimit: 800_000,
    });
  });
  it("올해 입양한 연간 세액공제 적격 자녀는 두 세액공제 항목을 구분해 산출한다", () => {
    expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: 1, childTaxCreditEligibleChildren: 1, firstBirthOrAdoption: 1 })).toEqual({
      valid: true, incomeDeduction: 1_500_000, childTaxCredit: 250_000,
      birthAdoptionTaxCredit: 300_000, taxCreditBeforeLimit: 550_000,
    });
  });
  it.each([-1, 0.5, Number.NaN, Infinity, 21])("잘못된 인원 %s에서 금액을 표시하지 않는다", (count) => {
    expect(calculateChildDeduction2026({ ...empty, childTaxCreditEligibleChildren: count }).valid).toBe(false);
    expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: count }).valid).toBe(false);
  });
  it("연간 적격 인원은 기본공제 인원을 넘지 않는다", () => {
    expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: 1, childTaxCreditEligibleChildren: 2 }).valid).toBe(false);
  });
  it("기본공제 대상보다 출산·입양 인원이 많거나 첫째가 중복되면 입력 확인을 요청한다", () => {
    expect(calculateChildDeduction2026({ ...empty, firstBirthOrAdoption: 1 }).valid).toBe(false);
    expect(calculateChildDeduction2026({ ...empty, basicDeductionChildren: 2, firstBirthOrAdoption: 2 }).valid).toBe(false);
  });
});

// 계산기 밖 안내문 (2026-10-05 후속) — 연말정산 자녀세액공제 나이는 2026년 귀속 9세 이상·2017년생 제외.
// 반대로 월 원천징수(간이세액표 별표2 비고 3)의 자녀 공제는 8세 이상 20세 이하 그대로라, 그 칸을 쓰는 오퍼 비교기는 만 8세를 유지한다.
// /year-end-tax-checklist 단언은 그 쪽을 고치는 묶음의 src/lib/__tests__/yearEndChecklistChildCredit.test.ts 에 둔다
// (2026-11-01 이식 때 분리 — 이 파일은 체크리스트 쪽 변경 없이도 통과해야 한다).
describe("계산기 밖 자녀세액공제 나이 표기", () => {
  const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
  it("/tax-changes-2026 는 만 9세 초과(2017년생 제외)로 적는다", () => {
    const changes = read("src/app/tax-changes-2026/page.tsx");
    expect(changes).not.toMatch(/"[^"\n]*만 8세 이상[^"\n]*"/);
    expect(changes).toContain("만 9세 초과");
    expect(changes).toContain('title: "자녀세액공제 — 기본공제 대상 중 만 9세 초과"');
    // 첫 광고 위 본문 — '만 9세 초과가' 는 765px 에서 한 줄 늘어 광고 +22px (2026-10-06 실측), 조사 없이 쓴다
    expect(changes).toContain('detail: "기본공제 대상 자녀·손자녀 중 만 9세 초과 1명 25만, 2명 55만, 3명부터 40만원씩 추가됩니다.');
    // 광고 아래 접힌 FAQ 첫 답 — 개정 사실 한 문장(법률 제21548호 부칙 제2조, 2017년생 제외)
    expect(changes).toContain(
      "자녀세액공제 나이 기준도 2026년 4월 21일 법 개정(법률 제21548호) 부칙에 따라 2026년 귀속 9세 이상(2017년생 제외)으로 올라 2016년 이전 출생 자녀만 대상입니다.",
    );
  });
  it("오퍼 비교는 간이세액표 자녀(8~20세)를 자녀세액공제 대상이라 부르지 않는다", () => {
    const offerPage = read("src/app/calc/offer-compare/page.tsx");
    const comparator = read("src/components/SalaryComparator.tsx");
    expect(offerPage).not.toContain("만 8세 이상 자녀세액공제");
    expect(offerPage).toContain("간이세액표의 자녀 공제 대상(8세 이상 20세 이하)");
    expect(offerPage).toContain("2017년생 제외");
    expect(comparator).not.toContain("· 자녀세액공제 대상 {");
    expect(comparator).toContain("· 8~20세 자녀 {comparison.settings.children}명");
    // 입력 칸은 간이세액표 규정 — 9세로 바꾸지 않는다
    expect(comparator).toContain(">만 8세 이상 공제 대상 자녀</label>");
  });
  it("/tax-rates-2026 접힌 FAQ 는 자녀 공제·결혼세액공제가 새로 추가됐다고 하지 않고 2026년 귀속 기준을 적는다", () => {
    const rates = read("src/app/tax-rates-2026/page.tsx");
    // 문자열(화면·FAQ 구조화 데이터)만 본다 — 정정 이유를 적은 주석의 종전 문구는 허용
    expect(rates).not.toMatch(/"[^"\n]*50만 부활[^"\n]*"/);
    expect(rates).not.toMatch(/"[^"\n]*만 8세 이상[^"\n]*"/);
    expect(rates).toContain(
      "혼인세액공제(1명 50만원)는 2024~2026년 혼인신고분에 적용되며, 2026년 귀속 자녀세액공제는 9세 이상(2017년생 제외) 자녀가 대상입니다.",
    );
  });
});
