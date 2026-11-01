// /property-holding-tax-2026 회귀 가드 (2026-10-05 감사 code15-02, 2026-11-01 R2-HOLD)
// 출처(law.go.kr): 지방세법 제113조 제2항(주택 재산세는 주택별 세율), 제111조의2(1세대 1주택 특례세율,
// 2026.12.28 까지 성립 납세의무), 지방세법 시행령 제109조 제1항 제2호(2026년도 1세대 1주택 43/44/45%),
// 종합부동산세법 제8조·제9조(인별 합계 9억/12억 공제, 2주택 이하 일반세율)
// R2-HOLD 추가 출처 (법제처 국가법령정보센터 원문, 2026-11-01 대조):
// · 종합부동산세법 [시행 2026. 1. 1.] 법률 제21224호 — 제9조 제1항 제1호·제2호 세율표, 제5항(1세대 1주택자 공제,
//   공제율 합계 100분의 80 범위에서 중복 적용), 제6항(만 60세 이상 20%·65세 이상 30%·70세 이상 40%),
//   제8항(5년 이상 20%·10년 이상 40%·15년 이상 50%), 제3조(과세기준일 = 재산세 과세기준일, 지방세법 제114조 6월 1일)
//   https://www.law.go.kr/법령/종합부동산세법
// · 종합부동산세법 시행령 [시행 2026. 10. 1.] 대통령령 제36739호 — 제2조의4 제1항 공정시장가액비율 100분의 60
//   https://www.law.go.kr/법령/종합부동산세법시행령
// · 농어촌특별세법 [시행 2026. 5. 12.] 법률 제21611호 — 제5조 제1항 제8호(납부하여야 할 종합부동산세액의 100분의 20)
//   https://www.law.go.kr/법령/농어촌특별세법
// 아래 기대값은 모두 위 조문으로 손계산했다 (재산세 중복분 공제·세부담 상한은 계산기와 같이 빼고 계산).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ONE_HOME_CREDIT_CAP_PERCENT,
  RURAL_SPECIAL_TAX_PERCENT,
  calcComprehensiveTax,
  calcHoldingTax2026,
  calcPropertyTax,
  longHoldingCreditPercent,
  seniorCreditPercent,
} from "@/lib/propertyHoldingTax2026";
import {
  DEFAULT_HOLDING_TAX_INPUTS,
  getHoldingTaxInputs,
  setHoldingTaxInputs,
  subscribeHoldingTaxInputs,
} from "@/app/property-holding-tax-2026/holdingTaxInputs";
import { enrichmentMap } from "@/lib/simpleCalculators/enrichments";

describe("재산세는 주택별, 종부세는 합계", () => {
  it("6억 2채(합계 12억) — 재산세 810,000 x 2, 종부세 (12억-9억) x 60% x 0.5%, 농특세 20%", () => {
    const r = calcHoldingTax2026(1_200_000_000, 2, false);
    expect(calcPropertyTax(600_000_000, false)).toBe(810_000);
    expect(r.propertyTax).toBe(1_620_000); // 종전 2,250,000 (합계에 누진세율)
    expect(r.educationTax).toBe(324_000);
    expect(r.comprehensiveTax).toBe(900_000);
    expect(r.ruralSpecialTax).toBe(180_000);
    // R2-HOLD: 총액에 농어촌특별세 포함 (종전 2,844,000 은 농특세 180,000 이 빠진 값)
    expect(r.total).toBe(1_620_000 + 324_000 + 900_000 + 180_000);
  });
  it("2주택 이상은 주택 수에 따라 결과가 달라진다 (종전 2~5 동일)", () => {
    const totals = [2, 3, 4, 5].map((n) => calcHoldingTax2026(1_500_000_000, n, true).propertyTax);
    expect(new Set(totals).size).toBe(4);
  });
  it("기본값(10억·1세대 1주택)은 종전과 같다 — 재산세 1,170,000, 종부세 0", () => {
    const r = calcHoldingTax2026(1_000_000_000, 1, true);
    expect(r.propertyTax).toBe(1_170_000);
    expect(r.comprehensiveTax).toBe(0);
    expect(r.ruralSpecialTax).toBe(0);
    expect(r.total).toBe(1_404_000);
  });
  it("1주택이지만 1세대 1주택 아님 — 공제 9억·일반 60%", () => {
    const r = calcHoldingTax2026(1_000_000_000, 1, false);
    expect(r.comprehensiveTax).toBe(calcComprehensiveTax(1_000_000_000, false));
    expect(r.comprehensiveTax).toBe(300_000);
  });
});

describe("R2-HOLD 세액공제 구간 — 종합부동산세법 제9조 제6항·제8항 (과세기준일 현재)", () => {
  it.each([
    [0, 0],
    [59, 0],
    [60, 20],
    [64, 20],
    [65, 30],
    [69, 30],
    [70, 40],
    [95, 40],
    [Number.NaN, 0],
  ])("만 %s세 → 연령별 공제율 %s%%", (age, percent) => {
    expect(seniorCreditPercent(age)).toBe(percent);
  });
  it.each([
    [0, 0],
    [4.9, 0],
    [5, 20],
    [9.9, 20],
    [10, 40],
    [14.9, 40],
    [15, 50],
    [40, 50],
    [-3, 0],
    [Number.NaN, 0],
  ])("보유 %s년 → 보유기간별 공제율 %s%%", (years, percent) => {
    expect(longHoldingCreditPercent(years)).toBe(percent);
  });
  it("한도 80%·농특세 20% 상수", () => {
    expect(ONE_HOME_CREDIT_CAP_PERCENT).toBe(80);
    expect(RURAL_SPECIAL_TAX_PERCENT).toBe(20);
  });
});

describe("R2-HOLD 손계산 사례 — 1주택 12억 이하·초과(공제 구간별), 2주택, 3주택", () => {
  it("사례 1: 1세대 1주택 공시 10억(12억 이하) — 70세·15년이어도 종부세·농특세 0", () => {
    // 종부세: max(0, 10억 - 12억) x 60% = 0 → 산출세액 0, 공제 0, 농특세 0
    // 재산세: 10억 x 45% = 4.5억 (공시 9억 초과라 특례세율 아님) → 57만 + (4.5억 - 3억) x 0.4% = 1,170,000
    const r = calcHoldingTax2026(1_000_000_000, 1, true, { age: 70, holdingYears: 15 });
    expect(r.oneHomeCreditEligible).toBe(true);
    expect(r.comprehensiveTaxBeforeCredit).toBe(0);
    expect(r.creditPercent).toBe(80); // 40 + 50 → 80 한도 (공제할 세액이 없을 뿐)
    expect(r.oneHomeCredit).toBe(0);
    expect(r.comprehensiveTax).toBe(0);
    expect(r.ruralSpecialTax).toBe(0);
    expect(r.totalNational).toBe(0);
    expect(r.propertyTax).toBe(1_170_000);
    expect(r.educationTax).toBe(234_000);
    expect(r.total).toBe(1_404_000);
  });

  // 사례 2: 1세대 1주택 공시 15억 — 과세표준 (15억 - 12억) x 60% = 1.8억 → 3억 이하 0.5% → 산출세액 900,000
  // 재산세 15억 x 45% = 6.75억 → 57만 + (6.75억 - 3억) x 0.4% = 2,070,000, 지방교육세 414,000 → 재산세 합계 2,484,000
  // [나이, 보유, 고령자%, 장기보유%, 적용%, 공제액, 납부할 종부세, 농특세(20%), 연 보유세 총액]
  it.each([
    [0, 0, 0, 0, 0, 0, 900_000, 180_000, 3_564_000],
    [60, 0, 20, 0, 20, 180_000, 720_000, 144_000, 3_348_000],
    [65, 0, 30, 0, 30, 270_000, 630_000, 126_000, 3_240_000],
    [70, 0, 40, 0, 40, 360_000, 540_000, 108_000, 3_132_000],
    [0, 5, 0, 20, 20, 180_000, 720_000, 144_000, 3_348_000],
    [0, 10, 0, 40, 40, 360_000, 540_000, 108_000, 3_132_000],
    [0, 15, 0, 50, 50, 450_000, 450_000, 90_000, 3_024_000],
    [65, 10, 30, 40, 70, 630_000, 270_000, 54_000, 2_808_000],
    [60, 15, 20, 50, 70, 630_000, 270_000, 54_000, 2_808_000],
    [70, 10, 40, 40, 80, 720_000, 180_000, 36_000, 2_700_000],
    [65, 15, 30, 50, 80, 720_000, 180_000, 36_000, 2_700_000],
    [70, 15, 40, 50, 80, 720_000, 180_000, 36_000, 2_700_000], // 90% → 80% 한도
  ])(
    "사례 2: 공시 15억·만 %s세·보유 %s년 → 고령자 %s%% + 장기보유 %s%% = 적용 %s%%",
    (age, holdingYears, senior, longHolding, applied, credit, payable, rural, total) => {
      const r = calcHoldingTax2026(1_500_000_000, 1, true, { age, holdingYears });
      expect(r.propertyTax).toBe(2_070_000);
      expect(r.totalRegional).toBe(2_484_000);
      expect(r.comprehensiveTaxBeforeCredit).toBe(900_000);
      expect(r.seniorCreditPercent).toBe(senior);
      expect(r.longHoldingCreditPercent).toBe(longHolding);
      expect(r.creditPercent).toBe(applied);
      expect(r.oneHomeCredit).toBe(credit);
      expect(r.comprehensiveTax).toBe(payable);
      expect(r.ruralSpecialTax).toBe(rural);
      expect(r.totalNational).toBe(payable + rural);
      expect(r.total).toBe(total);
    }
  );

  it("사례 3: 1세대 1주택 공시 30억·만 66세·보유 11년 — 6~12억 구간, 공제 30%+40%", () => {
    // 과세표준 (30억 - 12억) x 60% = 10.8억 → 360만 + (10.8억 - 6억) x 1.0% = 8,400,000
    // 공제 70% = 5,880,000 → 납부할 종부세 2,520,000 → 농특세 504,000
    // 재산세 30억 x 45% = 13.5억 → 57만 + 10.5억 x 0.4% = 4,770,000, 지방교육세 954,000
    const r = calcHoldingTax2026(3_000_000_000, 1, true, { age: 66, holdingYears: 11 });
    expect(r.comprehensiveTaxBeforeCredit).toBe(8_400_000);
    expect(r.creditPercent).toBe(70);
    expect(r.oneHomeCredit).toBe(5_880_000);
    expect(r.comprehensiveTax).toBe(2_520_000);
    expect(r.ruralSpecialTax).toBe(504_000);
    expect(r.propertyTax).toBe(4_770_000);
    expect(r.educationTax).toBe(954_000);
    expect(r.total).toBe(4_770_000 + 954_000 + 2_520_000 + 504_000);
  });

  it("사례 4: 1주택이지만 1세대 1주택 아님 공시 15억 — 9억 공제, 70세·15년이어도 세액공제 없음", () => {
    // 과세표준 (15억 - 9억) x 60% = 3.6억 → 150만 + (3.6억 - 3억) x 0.7% = 1,920,000 → 농특세 384,000
    // 재산세 15억 x 60% = 9억 → 57만 + 6억 x 0.4% = 2,970,000, 지방교육세 594,000
    const r = calcHoldingTax2026(1_500_000_000, 1, false, { age: 70, holdingYears: 15 });
    expect(r.oneHomeCreditEligible).toBe(false);
    expect(r.seniorCreditPercent).toBe(0);
    expect(r.longHoldingCreditPercent).toBe(0);
    expect(r.creditPercent).toBe(0);
    expect(r.oneHomeCredit).toBe(0);
    expect(r.comprehensiveTax).toBe(1_920_000);
    expect(r.ruralSpecialTax).toBe(384_000);
    expect(r.total).toBe(2_970_000 + 594_000 + 1_920_000 + 384_000);
  });

  it("사례 5: 2주택 공시 합계 20억(10억 x 2) — 9억 공제·일반세율, 세액공제 없음", () => {
    // 과세표준 (20억 - 9억) x 60% = 6.6억 → 360만 + (6.6억 - 6억) x 1.0% = 4,200,000 → 농특세 840,000
    // 재산세 집별 10억 x 60% = 6억 → 57만 + 3억 x 0.4% = 1,770,000 x 2 = 3,540,000, 지방교육세 708,000
    const r = calcHoldingTax2026(2_000_000_000, 2, true, { age: 70, holdingYears: 15 });
    expect(r.oneHomeCreditEligible).toBe(false);
    expect(r.oneHomeCredit).toBe(0);
    expect(r.comprehensiveTaxBeforeCredit).toBe(4_200_000);
    expect(r.comprehensiveTax).toBe(4_200_000);
    expect(r.ruralSpecialTax).toBe(840_000);
    expect(r.propertyTax).toBe(3_540_000);
    expect(r.educationTax).toBe(708_000);
    expect(r.totalNational).toBe(5_040_000);
    expect(r.total).toBe(3_540_000 + 708_000 + 4_200_000 + 840_000);
  });

  it("사례 6: 3주택 공시 합계 27억(9억 x 3) — 과세표준 10.8억은 3주택 이상 세율표에서도 12억 이하 구간", () => {
    // 제9조 제1항 제2호(3주택 이상)도 12억 이하는 0.5%·0.7%·1.0% 로 제1호와 같다:
    // 과세표준 (27억 - 9억) x 60% = 10.8억 → 360만 + 4.8억 x 1.0% = 8,400,000 → 농특세 1,680,000
    // 재산세 집별 9억 x 60% = 5.4억 → 57만 + 2.4억 x 0.4% = 1,530,000 x 3 = 4,590,000, 지방교육세 918,000
    const r = calcHoldingTax2026(2_700_000_000, 3, true, { age: 72, holdingYears: 20 });
    expect(r.oneHomeCreditEligible).toBe(false);
    expect(r.comprehensiveTax).toBe(8_400_000);
    expect(r.ruralSpecialTax).toBe(1_680_000);
    expect(r.propertyTax).toBe(4_590_000);
    expect(r.educationTax).toBe(918_000);
    expect(r.total).toBe(4_590_000 + 918_000 + 8_400_000 + 1_680_000);
  });

  it("공제 입력을 생략하면 공제 없음 — 종전 호출(3개 인자)과 종부세가 같다", () => {
    const withDefault = calcHoldingTax2026(1_500_000_000, 1, true);
    const explicitZero = calcHoldingTax2026(1_500_000_000, 1, true, { age: 0, holdingYears: 0 });
    expect(withDefault).toEqual(explicitZero);
    expect(withDefault.comprehensiveTax).toBe(calcComprehensiveTax(1_500_000_000, true));
  });
});

describe("종부세 간편 계산기(/calc/comprehensive-property-tax-quick) — 산출세액 계산기, 고지서 설명에 농특세", () => {
  it("결과는 산출세액 단계라고 밝히고(세액공제 제외 고지 유지), FAQ 의 고지서 설명에 농어촌특별세 20% 가 있다", () => {
    const quick = enrichmentMap["comprehensive-property-tax-quick"];
    expect(quick.caveats?.join(" ")).toContain("결과는 산출세액 단계의 값으로");
    const faq = quick.faqs?.find((f) => f.q.startsWith("공시가격 15억원이면"));
    expect(faq?.a).toContain("산출세액은 900,000원입니다.");
    expect(faq?.a).toContain("그 20%가 농어촌특별세로 함께 붙습니다.");
    expect(faq?.a).not.toContain("더 빠질 수 있습니다");
  });
});

describe("입력 공유 스토어 — 위 계산기와 맨 아래 상세가 같은 입력을 본다", () => {
  it("설정값을 구독자에게 알리고, 구독자가 모두 떠나면 기본값으로 돌아간다", () => {
    let calls = 0;
    const unsubscribeA = subscribeHoldingTaxInputs(() => calls++);
    const unsubscribeB = subscribeHoldingTaxInputs(() => calls++);
    expect(getHoldingTaxInputs()).toEqual(DEFAULT_HOLDING_TAX_INPUTS);
    setHoldingTaxInputs({ publishedValue: 1_500_000_000, age: 70, holdingYears: 15 });
    expect(calls).toBe(2);
    expect(getHoldingTaxInputs()).toMatchObject({ publishedValue: 1_500_000_000, age: 70, holdingYears: 15, numHomes: 1 });
    setHoldingTaxInputs({ age: 70 }); // 같은 값이면 알리지 않는다
    expect(calls).toBe(2);
    unsubscribeA();
    expect(getHoldingTaxInputs().age).toBe(70); // 아직 한 컴포넌트가 화면에 있다
    unsubscribeB();
    expect(getHoldingTaxInputs()).toEqual(DEFAULT_HOLDING_TAX_INPUTS); // 페이지를 벗어나면 다음 방문은 기본값
  });
});

describe("화면 — 2주택 이상은 합계 입력 안내, 기본(1주택) 문구 유지", () => {
  const src = readFileSync(resolve(process.cwd(), "src/app/property-holding-tax-2026/PropertyHoldingTaxClient.tsx"), "utf8");
  it("기본 상태 문구는 그대로", () => {
    expect(src).toContain('"주택 공시가격 (원)"');
    expect(src).toContain('"(공시가격과 시세는 다릅니다. 실제 시세는 별도로 확인하세요)"');
    // 안내 문구가 {식} 으로 바뀌어도 '만원 (' 사이 공백 유지 — 줄바꿈 뒤 공백은 JSX 가 지우므로 {" "} 로 명시
    expect(src).toMatch(/만원\{" "\}\s*\n/);
  });
  it("2주택 이상 문구는 기본 문구보다 길지 않다 (결과 광고 위 높이)", () => {
    const hangul = (s: string) => [...s].filter((c) => /[가-힣]/.test(c)).length;
    expect(src).toContain('"공시가격 합계 (원)"');
    expect(hangul("공시가격 합계 (원)")).toBeLessThanOrEqual(hangul("주택 공시가격 (원)"));
    expect(src).toContain('"(주택마다 공시가격이 같다고 보고 재산세를 집별로 계산)"');
    expect(hangul("(주택마다 공시가격이 같다고 보고 재산세를 집별로 계산)")).toBeLessThanOrEqual(
      hangul("(공시가격과 시세는 다릅니다. 실제 시세는 별도로 확인하세요)")
    );
  });
  it("인라인 산식 대신 lib 를 쓴다 — 계산은 공유 스토어의 calcHoldingTax2026 한 곳", () => {
    const store = readFileSync(resolve(process.cwd(), "src/app/property-holding-tax-2026/holdingTaxInputs.ts"), "utf8");
    expect(store).toContain("calcHoldingTax2026(publishedValue, numHomes, isOnlyOneHome, { age, holdingYears })");
    expect(src).toContain("useHoldingTax()");
    expect(src).not.toContain("function calcPropertyTax");
  });
});

describe("R2-HOLD 광고 안전 — 결과 광고 위 줄 수 불변, 상세는 마지막 광고 아래", () => {
  const client = readFileSync(resolve(process.cwd(), "src/app/property-holding-tax-2026/PropertyHoldingTaxClient.tsx"), "utf8");
  const page = readFileSync(resolve(process.cwd(), "src/app/property-holding-tax-2026/page.tsx"), "utf8");
  it("12월 줄 라벨은 종전 '종합부동산세 (12월)'보다 짧고, 위 계산기에는 나이·보유기간 입력이 없다", () => {
    expect(client).not.toContain("종합부동산세 (12월)");
    expect(client).toContain("12월 종부세·농특세");
    expect([..."12월 종부세·농특세"].length).toBeLessThan([..."종합부동산세 (12월)"].length);
    expect(client).toContain('href="#holding-tax-detail"');
    expect(client).not.toMatch(/<select\b/);
    expect(client).not.toContain("setHoldingTaxInputs({ age");
  });
  it("결과 광고 위 각주의 단순화 고지(재산세 중복분 공제·3주택 이상 중과·세부담상한)는 유지", () => {
    expect(client).toContain("종부세의 재산세 중복분 공제,");
    expect(client).toContain("3주택 이상 중과세율(과표 12억 초과분 2.0~5.0%)");
    expect(client).toContain("과세표준상한제·세부담상한은");
  });
  it("상세 섹션은 마지막 광고(MultiplexAd) 뒤에만 있고, 그 뒤에 광고가 없다", () => {
    const body = page.slice(page.indexOf("export default function"));
    const detailAt = body.indexOf("<PropertyHoldingTaxDetail />");
    const adTags = [...body.matchAll(/<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|CoupangBanner)\b/g)];
    expect(detailAt).toBeGreaterThan(-1);
    expect(adTags.length).toBeGreaterThan(0);
    for (const tag of adTags) expect(tag.index ?? Infinity, tag[1]).toBeLessThan(detailAt);
    // 결과(계산기)와 CalcResultAd 사이에는 아무것도 없다
    const clientEnd = body.indexOf("<PropertyHoldingTaxClient />") + "<PropertyHoldingTaxClient />".length;
    expect(body.slice(clientEnd, body.indexOf("<CalcResultAd />")).trim()).toBe("");
  });
});
