// 2차 키퍼 G2C 3편 회귀 (2026-09-26 W3-A · GUIDES-05) — 퇴직금과 성과급 / 임원 퇴직소득 한도 / RSU와 현금 성과급.
// 본문 예시 금액은 사이트 엔진(severanceCalculator·bonusTaxCalc)과 회사 정본 데이터(seedCompanies·bonusData)에서
// 끼워 넣는다. 엔진·데이터가 바뀌면 본문도 따라 바뀌므로, 여기서는 (1) 본문이 엔진 출력과 같은 값을 보이는지,
// (2) 옛 오류 문구가 돌아오지 않는지, (3) 본문에 글자로 옮긴 정본 문구가 원천 데이터에 아직 있는지를 고정한다.
// 사실 근거: docs/guides-facts-2026-10-G2C.md
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { calculateSeverancePay, calculateSeveranceTax } from "@/lib/severanceCalculator";
import { calcBonusNet, estimateAnnualIncomeTax2026 } from "@/lib/bonusTaxCalc";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import { formatManwonKorean } from "@/lib/manwonFormat";
import { seedCompanies } from "@/data/seedCompanies";
import { BONUS_PROFILES } from "@/data/bonusData";
import {
  RSU_CASH_NET,
  RSU_EXAMPLE,
  RSU_NO_INSURANCE,
  SEVERANCE_BONUS_EXAMPLE,
  SEVERANCE_BONUS_ROWS,
  SEVERANCE_GAIN_1200,
  SEVERANCE_PER_100_PER_YEAR,
} from "@/lib/guides/hot-bonus-tax-complete";
import {
  EXEC_ALL_RETIRE_TAX,
  EXEC_EXAMPLE,
  EXEC_EXCESS,
  EXEC_LABOR_TAX,
  EXEC_LIMIT,
  EXEC_TOTAL_TAX,
  EXEC_WITHIN_TAX,
} from "@/lib/guides/hot-news-2026-extended";

const guide = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`missing guide ${slug}`);
  return g;
};
const all = (slug: string) => {
  const g = guide(slug);
  return `${g.title}\n${g.description}\n${g.metaDescription ?? ""}\n${g.content}`;
};
const man = (won: number) => formatManwonKorean(Math.round(won / 10_000));
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

describe("bonus-retire-impact-severance-2026 — 평균임금·퇴직금", () => {
  const slug = "bonus-retire-impact-severance-2026";

  it("표의 퇴직금·세액은 퇴직금 계산기 엔진을 다시 불러도 같은 값이다", () => {
    const html = guide(slug).content;
    for (const bonus of [0, 6_000_000, 12_000_000, 24_000_000]) {
      const { start, last, monthly } = SEVERANCE_BONUS_EXAMPLE;
      const r = calculateSeverancePay(start, last, [monthly, monthly, monthly], bonus, 0);
      expect(html, `상여 ${bonus}`).toContain(`<td>${won(r.averageDailyWage)}</td><td>${man(r.estimatedSeverancePay)}</td><td>${won(r.incomeTax + r.localTax)}</td><td>${man(r.netSeverancePay)}</td>`);
    }
    expect(SEVERANCE_BONUS_ROWS[0].r.totalDaysOfEmployment).toBe(3652);
    // 산정 기간 7/1~9/30 = 92일 (본문 문구)
    expect(Math.round((SEVERANCE_BONUS_EXAMPLE.monthly * 3) / SEVERANCE_BONUS_ROWS[0].r.averageDailyWage)).toBe(92);
    expect(html).toContain("92일");
  });

  it("리드의 증가액·100만원당 효과는 엔진 차이와 같다 (약 979만원 · 81,500원)", () => {
    const html = guide(slug).content;
    expect(man(SEVERANCE_GAIN_1200)).toBe("979만원");
    expect(html).toContain(`약 ${man(SEVERANCE_GAIN_1200)} 늘어납니다`);
    expect(SEVERANCE_PER_100_PER_YEAR).toBe(81_500);
    expect(html).toContain(`약 ${won(SEVERANCE_PER_100_PER_YEAR)}(100만원 × 3/12 ÷ 92일 × 30일)`);
  });

  it("판례·조문 근거와 기준일이 있고 옛 오류 문구가 없다", () => {
    const t = all(slug);
    for (const s of ["2021다248299", "2021다219994", "2015두36157", "2020다247190", "기준일"]) expect(t).toContain(s);
    // 옛 본문: 평균임금을 '3개월 합계 / 90일', 연 3,000만 정기상여를 월 250만 가산, 차이 2,500만
    for (const s of ["2,500만", "/ 90일", "평균임금 750만", "통상임금 산정 방식에 따라 퇴직금 1억"]) expect(t).not.toContain(s);
    // 흡수한 retire-with-bonus-4insurance 의 오류(퇴직소득 연금수령 세율을 연금계좌 세율로 적음)
    expect(t).not.toMatch(/5\.5\s?~\s?3\.3\s?%/);
    expect(t).toContain("퇴직소득세율의 70%");
  });
});

describe("executive-severance-limit-2026 — 임원 퇴직소득 한도", () => {
  const slug = "executive-severance-limit-2026";

  it("한도는 소득세법 제22조 제3항 산식 — 예시 6억, 국세청 사례 9.6억", () => {
    expect(EXEC_LIMIT).toBe(600_000_000);
    expect(EXEC_EXCESS).toBe(200_000_000);
    // 국세청 사례(cntntsId=7884): 3억/10×96/12×3 + 4억/10×36/12×2
    expect((300_000_000 / 10) * (96 / 12) * 3 + (400_000_000 / 10) * (36 / 12) * 2).toBe(960_000_000);
    const html = guide(slug).content;
    expect(html).toContain("= 9.6억원");
    expect(html).toContain("20억원 − 9.6억원 = 10.4억원");
    expect(html).toContain(`= ${man(EXEC_LIMIT)}입니다`);
  });

  it("세액 표는 퇴직소득세 엔진·근로소득 엔진(2026 요율)과 같다", () => {
    const within = calculateSeveranceTax(EXEC_LIMIT, EXEC_EXAMPLE.days, EXEC_EXAMPLE.years);
    const allRetire = calculateSeveranceTax(EXEC_EXAMPLE.severance, EXEC_EXAMPLE.days, EXEC_EXAMPLE.years);
    const s = EXEC_EXAMPLE.salaryInExitYear;
    const delta =
      estimateAnnualIncomeTax2026(s + EXEC_EXCESS, INSURANCE_RATES_2026, s) - estimateAnnualIncomeTax2026(s, INSURANCE_RATES_2026, s);
    expect(EXEC_WITHIN_TAX).toBe(within.incomeTax + within.localTax);
    expect(EXEC_ALL_RETIRE_TAX).toBe(allRetire.incomeTax + allRetire.localTax);
    expect(EXEC_LABOR_TAX).toBe(Math.round(delta) + Math.round(delta * 0.1));
    expect(EXEC_TOTAL_TAX).toBe(EXEC_WITHIN_TAX + EXEC_LABOR_TAX);
    expect(EXEC_TOTAL_TAX).toBeGreaterThan(EXEC_ALL_RETIRE_TAX);
    const html = guide(slug).content;
    for (const v of [EXEC_WITHIN_TAX, EXEC_ALL_RETIRE_TAX, EXEC_LABOR_TAX, EXEC_TOTAL_TAX]) expect(html).toContain(`<td>${man(v)}</td>`);
    expect(html).toContain(`약 ${man(EXEC_TOTAL_TAX - EXEC_ALL_RETIRE_TAX)} 늘어납니다`);
  });

  it("옛 오류 문구(직원 퇴직금 3~5배 한도, 5억 퇴직 1.08억)가 없다", () => {
    const t = all(slug);
    for (const s of ["3~5배", "1.08억", "7,800만", "한계세율 38%+"]) expect(t).not.toContain(s);
    for (const s of ["소득세법 제22조", "제42조의2", "제49조", "법인세법 시행령 제44조", "기준일"]) expect(t).toContain(s);
  });
});

describe("it-rsu-vs-cash-bonus-2026 — RSU와 현금 성과급 (엔티티 형식)", () => {
  const slug = "it-rsu-vs-cash-bonus-2026";

  it("세금·보험료는 성과급 엔진(2026 요율)과 같다", () => {
    const cash = calcBonusNet(RSU_EXAMPLE.salary, RSU_EXAMPLE.grant, 0, true, INSURANCE_RATES_2026);
    const noIns = calcBonusNet(RSU_EXAMPLE.salary, RSU_EXAMPLE.grant, 0, false, INSURANCE_RATES_2026);
    expect(RSU_CASH_NET).toEqual(cash);
    expect(RSU_NO_INSURANCE).toEqual(noIns);
    const html = guide(slug).content;
    expect(html).toContain(`약 ${man(cash.totalDeductions)}이고`);
    expect(html).toContain(`세후 ${man(cash.net)}이 남습니다`);
    expect(html).toContain(`약 ${man(noIns.totalDeductions)}으로`);
    // 주가 30% 하락 시 남는 가치 = 2,100만 − 추가 부담
    expect(html).toContain(`<td>30% 하락</td><td>${man(21_000_000)}</td><td>${man(cash.totalDeductions)}</td><td>${man(21_000_000 - cash.totalDeductions)}</td>`);
  });

  it("첫 표의 회사 값은 회사 페이지·성과급 계산기 정본과 같다", () => {
    const html = guide(slug).content;
    const naver = seedCompanies.find((c) => c.id === "naver")?.disclosed;
    const kakao = seedCompanies.find((c) => c.id === "kakao")?.disclosed;
    expect(naver && kakao).toBeTruthy();
    expect(html).toContain(`직원 평균 급여 ${formatManwonKorean(naver!.avgSalaryManwon)}`);
    expect(html).toContain(`직원 평균 급여 ${formatManwonKorean(kakao!.avgSalaryManwon)}`);
    // 본문에 글자로 옮긴 부분 — 원천 문구가 바뀌면 본문도 함께 고칠 것
    expect(naver!.note).toContain("제외 시 1억4,300만원");
    expect(html).toContain("빼면 1억 4,300만원");
    const rsu = (id: string) => BONUS_PROFILES.find((p) => p.companyId === id)?.payouts.find((p) => p.scheme === "RSU");
    expect(rsu("naver")?.note).toContain("465억원(약 22만주)을 1,683명");
    expect(html).toContain(`465억원(약 22만주)을 1,683명에게 RSU로 지급, 단순 평균 ${formatManwonKorean(rsu("naver")!.fixedAmountManwon!)}`);
    expect(html).toContain(`1인 평균 RSU 가치 약 ${formatManwonKorean(rsu("kakao")!.fixedAmountManwon!)}`);
    expect(html).not.toContain("공시 확인 중");
  });

  it("옛 오류 문구(RSU 175만 유리·5년 베스팅 25%·해외주식 손실 넘김)가 없다", () => {
    const t = all(slug);
    for (const s of ["175만", "5년 베스팅", "4년 베스팅", "lockup", "이월"]) expect(t).not.toContain(s);
    for (const s of ["서면-2023-원천-0341", "소득세법 제94조", "소득세법 제104조", "소득세법 제103조", "기준일"]) expect(t).toContain(s);
  });
});
