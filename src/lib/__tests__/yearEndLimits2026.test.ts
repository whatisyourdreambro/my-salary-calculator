// src/lib/__tests__/yearEndLimits2026.test.ts
//
// /year-end-tax '2026년 귀속 연말정산 주요 공제 한도' 표 + 한도 FAQ 5문항 회귀 가드 (2026-09-25).
//   1) 표·FAQ 수치가 정본 상수(카드·연금·월세·의료비·교육비·기부금)와 같고, 엔진 동작과도 맞는다.
//   2) 수치 문자열이 2026년 귀속 현행법 값 그대로다 (조문 확인 2026-09-25 — yearEndLimits2026.ts 머리말).
//   3) FAQPage JSON-LD 는 한 개이며 모든 질문·답변이 화면 본문과 글자 그대로 같다.
//   4) 새 섹션은 마지막 광고(쿠팡 배너)보다 아래 — 광고 위 FAQ 문항 수(4)는 그대로.
//   5) YE-06 (B43, 운영자 승인 2026-11-01 8번): 표 끝 비과세·감면 2행(기업 출산지원금 비과세·중소기업 취업자 소득세 감면)은
//      현행 조문(소득세법 §12(3)머목·시행령 §17의2, 조특법 §30①·시행령 §27①, 2026-11-01 확인)과 smbTaxBreak 정본 상수
//      그대로이고, 감면 행은 전용 계산기 링크와 '감면 대상이면 결정세액이 더 낮습니다'를 마지막 광고 아래에만 싣는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
}));
vi.mock("@/components/CoupangBanner", () => ({
  default: () => createElement("div", { "data-test-ad": "coupang" }),
}));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null }));
vi.mock("@/components/YearEndTaxCalculator", () => ({ default: () => null }));
vi.mock("@/components/YearEndTaxCluster", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({
  default: () => createElement("div", { "data-test": "share" }),
}));

import YearEndTaxPage from "@/app/year-end-tax/page";
import { calcCardDeduction2026 } from "@/lib/cardDeduction2026";
import { calcDonationCredit2026 } from "@/lib/donationCredit";
import { calculateYearEndTax, type TaxInputs } from "@/lib/yearEndTaxCalculator";
import {
  MARRIAGE_CREDIT_WINDOW,
  YEAR_END_LIMIT_FAQS,
  YEAR_END_LIMIT_ROWS,
  YEAR_END_LIMITS_SOURCE_NOTE,
} from "@/lib/yearEndLimits2026";
import { MARRIAGE_CREDIT_2026 } from "@/lib/taxConstants2026";
import { YEAR_END_REFORM_2027 } from "@/data/yearEndTaxHub";
import {
  SMB_BREAK_CAP_PER_YEAR,
  SMB_BREAK_RULES,
  YOUTH_MAX_AGE,
  YOUTH_MILITARY_DEDUCT_MAX_MONTHS,
  YOUTH_MIN_AGE,
} from "@/lib/smbTaxBreak";

const row = (item: string) => {
  const r = YEAR_END_LIMIT_ROWS.find((x) => x.item === item);
  if (!r) throw new Error(`표에 ${item} 행이 없다`);
  return r;
};

describe("공제 한도표 — 2026년 귀속 현행법 수치", () => {
  it("공제 7개 + 표 끝 비과세·감면 2개(YE-06, B43) 항목을 싣는다", () => {
    expect(YEAR_END_LIMIT_ROWS.map((r) => r.item)).toEqual([
      "신용카드 등 소득공제",
      "신용카드 추가 한도",
      "연금저축·IRP 세액공제",
      "월세 세액공제",
      "의료비 세액공제",
      "교육비 세액공제",
      "기부금 세액공제",
      "기업 출산지원금 비과세",
      "중소기업 취업자 소득세 감면",
    ]);
    // 기존 공제 7행은 모바일 이름표가 기본값(공제율·한도) 그대로
    for (const r of YEAR_END_LIMIT_ROWS.slice(0, 7)) {
      expect(r.rateLabel).toBeUndefined();
      expect(r.limitLabel).toBeUndefined();
    }
  });

  it("신용카드 — 공제율 15/30/40%·문화체육 30%, 기본 한도 자녀 수별 300/350/400만(초과 250/275/300만)", () => {
    const card = row("신용카드 등 소득공제");
    expect(card.rate).toBe(
      "총급여 25% 초과 사용분에 신용카드 15% · 체크카드·현금영수증 30% · 전통시장·대중교통 40% · 도서·공연·체육시설 등 문화체육 30%(총급여 7,000만원 이하)"
    );
    expect(card.limit).toBe(
      "기본 300만원(총급여 7,000만원 초과 250만원) · 자녀 1명 350만원(275만원) · 자녀 2명 이상 400만원(300만원)"
    );
    expect(row("신용카드 추가 한도").limit).toBe("추가 300만원(총급여 7,000만원 초과 200만원)");
  });

  it("신용카드 표의 한도 = 공유 모듈 계산 최대치 (기본 + 추가)", () => {
    const huge = { creditCard: 0, checkCash: 200_000_000, traditionalMarket: 50_000_000, publicTransport: 50_000_000 };
    const cases: [number, number, number][] = [
      // [총급여, 자녀 수, 기대 최대 공제액]
      [50_000_000, 0, 6_000_000],
      [50_000_000, 1, 6_500_000],
      [50_000_000, 2, 7_000_000],
      [50_000_000, 3, 7_000_000], // 셋째부터는 가산 없음
      [90_000_000, 0, 4_500_000],
      [90_000_000, 1, 4_750_000],
      [90_000_000, 2, 5_000_000],
    ];
    for (const [grossSalary, children, max] of cases) {
      expect(calcCardDeduction2026({ grossSalary, children, ...huge }).finalDeduction).toBe(max);
    }
  });

  it("연금계좌 — 5,500만 이하 15%·초과 12%, 연금저축 600만·합산 900만, ISA 전환 10%(최대 300만)", () => {
    const p = row("연금저축·IRP 세액공제");
    expect(p.rate).toBe("총급여 5,500만원 이하 15% · 초과 12% (지방소득세 포함 16.5% · 13.2%)");
    expect(p.limit).toBe("연금저축 600만원 · IRP 합산 900만원 (ISA 만기 전환액의 10%, 최대 300만원 추가)");
  });

  it("연금계좌 — 엔진이 표와 같은 한도·공제율을 쓴다 (경계 5,500만 포함 15%)", () => {
    const base: TaxInputs = {
      grossSalary: 55_000_000, prepaidTax: 0, nationalPension: 0, healthInsurance: 0,
      employmentInsurance: 0, dependents: 1, disabledDependents: 0, seniorDependents: 0,
      housingSubscription: 0, mortgageInterest: 0, creditCard: 0, debitCardAndCash: 0,
      traditionalMarket: 0, publicTransport: 0, children: 0, childTaxCreditEligibleChildren: 0, birthsOrAdoptions: 0,
      pensionSavings: 0, irp: 0, lifeInsurance: 0, medicalExpenses: 0, educationExpenses: 0,
      donation: 0, monthlyRent: 0,
    };
    const credit = (grossSalary: number) =>
      calculateYearEndTax({ ...base, grossSalary }).determinedTax -
      calculateYearEndTax({ ...base, grossSalary, pensionSavings: 12_000_000 }).determinedTax;
    expect(credit(55_000_000)).toBe(900_000); // 연금저축 단독 600만 × 15%
    expect(credit(55_000_001)).toBe(720_000); // 연금저축 단독 600만 × 12%
  });

  it("월세 — 17%/15%, 연 1,000만원, 최대 170만원, 총급여 8,000만원 이하", () => {
    const r = row("월세 세액공제");
    expect(r.rate).toBe("총급여 5,500만원 이하 17% · 8,000만원 이하 15%");
    expect(r.limit).toBe("월세 연 1,000만원(최대 170만원 공제) · 무주택 세대주, 총급여 8,000만원 이하");
  });

  it("의료비·교육비 — 3% 문턱·15/20/30%, 부양가족 700만, 산후조리원 200만 / 300만·900만", () => {
    const m = row("의료비 세액공제");
    expect(m.rate).toBe("총급여 3% 초과분의 15% (미숙아·선천성이상아 20% · 난임시술비 30%)");
    expect(m.limit).toBe("부양가족 연 700만원 · 본인·6세 이하·65세 이상·장애인 등 한도 없음 · 산후조리원 출산 1회 200만원");
    const e = row("교육비 세액공제");
    expect(e.rate).toBe("15%");
    expect(e.limit).toBe(
      "취학 전·초중고 1명당 300만원(2026년부터 초등 2학년 이하 예체능 학원비 포함) · 대학생 900만원 · 본인·장애인 특수교육비 한도 없음"
    );
  });

  it("기부금 — 특례·일반 15%/30%, 정치자금 100/110·15%·25%, 고향사랑 100/110·40%·15%(재난지역 30%) 전 구간", () => {
    const d = row("기부금 세액공제");
    // 소득세법 §59의4④ · 조특법 §76① · 조특법 §58①1~3호 (2026-01-01 이후 기부분, 부칙 제13조)
    expect(d.rate).toBe(
      "특례·일반 1,000만원 이하 15% · 초과분 30% / 정치자금 10만원까지 100/110 · 초과분 15%(3,000만원 초과분 25%) / 고향사랑 10만원까지 100/110 · 10만원 초과 20만원 이하 40%(지방소득세 포함 44%) · 20만원 초과분 15%(특별재난지역 30%)"
    );
    expect(d.limit).toBe("일반기부금 근로소득금액의 30%(종교단체 10%) · 고향사랑 연 2,000만원까지");
    // 표의 40% 구간 = 계산기 정본(donationCredit) — 20만원 기부 시 10만 × 100/110 + 10만 × 40% (지방세 포함 체감 44%)
    const zero = { grossSalary: 50_000_000, statutory: 0, general: 0, religious: 0, political: 0, hometown: 0 };
    expect(calcDonationCredit2026({ ...zero, hometown: 200_000 }).hometownCredit).toBe(130_909);
    // 20만원 초과분 15% · 정치자금 초과분 15%·3천만원 초과분 25% — 표 문구와 계산기 정본이 같은 산식
    expect(calcDonationCredit2026({ ...zero, hometown: 500_000 }).hometownCredit).toBe(175_909);
    expect(calcDonationCredit2026({ ...zero, political: 1_000_000 }).politicalCredit).toBe(225_909);
    expect(
      calcDonationCredit2026({ ...zero, grossSalary: 200_000_000, political: 40_000_000 }).politicalCredit
    ).toBe(7_075_909);
    // 특례·일반 1,000만원 초과분 30% — 1,500만원이면 150만 + 150만 = 300만원
    expect(
      calcDonationCredit2026({ ...zero, grossSalary: 100_000_000, statutory: 15_000_000 }).generalAxisCredit
    ).toBe(3_000_000);
  });

  it("출처 문구 — 조문·기준일·2027 개편안 미반영을 밝힌다", () => {
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("소득세법 제12조·제59조의3·제59조의4");
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("같은 법 시행령 제17조의2");
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("조세특례제한법 제30조·제58조·제76조·제95조의2·제126조의2");
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("2027년 귀속부터");
    expect(YEAR_END_LIMITS_SOURCE_NOTE).toContain("기준일 2026-09-25(출산지원금·중소기업 감면 행은 2026-11-01)");
  });
});

describe("표 끝 비과세·감면 행 — YE-06 (B43, 현행 조문 2026-11-01 확인)", () => {
  it("기업 출산지원금 — 소득세법 §12(3)머목1)·시행령 §17의2: 출생 후 2년 이내 첫 번째·두 번째 지급분 전액, 사용자별 계산, 특수관계인 제외", () => {
    const r = row("기업 출산지원금 비과세");
    expect(r.basis).toBe("소득세법 제12조제3호머목 · 같은 법 시행령 제17조의2");
    expect(r.rateLabel).toBe("비과세");
    expect(r.limitLabel).toBe("요건");
    expect(r.rate).toBe("근로자 본인 또는 배우자의 출산과 관련해 회사에서 받은 출산지원금 전액(총급여에서 제외)");
    expect(r.limit).toBe(
      "자녀 출생일 이후 2년 이내 첫 번째·두 번째 지급분(회사별로 계산) · 금액 한도 없음 · 사업주의 친족이나 지배주주 등 특수관계인은 제외 · 6세 이하 자녀 보육수당 비과세(1명당 월 20만원)와 별도"
    );
    expect(r.calc).toBeUndefined();
  });

  it("중소기업 취업자 감면 — 조특법 §30①: 청년 90%·5년, 60세 이상·장애인·경력단절 근로자 70%·3년, 과세기간별 200만원 (smbTaxBreak 정본 상수)", () => {
    expect(SMB_BREAK_RULES.youth).toMatchObject({ rate: 0.9, years: 5 });
    expect(SMB_BREAK_RULES.other).toMatchObject({ rate: 0.7, years: 3 });
    expect(SMB_BREAK_CAP_PER_YEAR).toBe(2_000_000);
    expect([YOUTH_MIN_AGE, YOUTH_MAX_AGE, YOUTH_MILITARY_DEDUCT_MAX_MONTHS]).toEqual([15, 34, 72]);
    const r = row("중소기업 취업자 소득세 감면");
    expect(r.basis).toBe("조세특례제한법 제30조");
    expect(r.rateLabel).toBe("감면율");
    expect(r.limitLabel).toBeUndefined();
    expect(r.rate).toBe(
      "소득세의 90%(청년: 근로계약 체결일 15~34세, 병역 이행기간 최대 6년은 나이에서 뺌, 취업일부터 5년) · 70%(60세 이상·장애인·경력단절 근로자, 3년)"
    );
    expect(r.limit).toBe(
      "과세기간별 200만원까지 · 회사(퇴사자는 세무서)에 감면 신청 · 위 계산기는 감면을 반영하지 않아 감면 대상이면 결정세액이 더 낮습니다"
    );
    expect(r.calc).toEqual({ href: "/calc/smb-income-tax-break", label: "중소기업 감면 계산기 →" });
  });

  it("'위 계산기는 감면을 반영하지 않아' 문장의 전제 — /year-end-tax 계산기 엔진·화면에 중소기업 감면 경로가 없다", () => {
    // 연말정산 엔진에 감면 경로가 생기면 이 단언이 깨진다 — 그때 감면 행의 안내 문장을 함께 고칠 것.
    for (const file of ["src/lib/yearEndTaxCalculator.ts", "src/components/YearEndTaxCalculator.tsx"]) {
      const src = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(src, `${file} 에 감면 경로가 생겼다면 yearEndLimits2026 감면 행 문장을 고칠 것`).not.toMatch(
        /smbTaxBreak|applySmeYouthReduction|SmbBreak|감면/
      );
    }
  });

  it("전용 계산기 페이지가 있다 (/calc/smb-income-tax-break)", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/calc/smb-income-tax-break/page.tsx"), "utf8");
    expect(src).toContain('path: "/calc/smb-income-tax-break"');
  });
});

describe("공제 한도 FAQ 6문항", () => {
  it("6문항이고 질문이 서로 다르며 소수점·NaN 없이 만들어진다 (6번째 = 혼인세액공제, SEASON-15)", () => {
    expect(YEAR_END_LIMIT_FAQS).toHaveLength(6);
    expect(new Set(YEAR_END_LIMIT_FAQS.map((f) => f.question)).size).toBe(6);
    for (const f of YEAR_END_LIMIT_FAQS) {
      expect(f.answer).not.toMatch(/NaN|undefined|\d\.\d{3,}/);
    }
    const all = YEAR_END_LIMIT_FAQS.map((f) => f.answer).join("\n");
    expect(all).toContain("연 300만원(총급여 7,000만원 초과자는 200만원)까지 추가로 공제됩니다");
    expect(all).toContain("연금저축계좌는 연 600만원까지만 공제 대상");
    expect(all).toContain("최대 170만원을 돌려받습니다");
    expect(all).toContain("총급여 5,000만원이라면 150만원을 넘는 금액이 대상");
    expect(all).toContain("대학생은 1명당 연 900만원까지 인정됩니다");
    expect(all).toContain("2024년 1월 1일부터 2026년 12월 31일까지 혼인신고를 한 사람은");
    expect(all).toContain("1회(생애 1회) 50만원");
  });

  it("혼인세액공제 기간은 정본 상수에서 만든다 — 조특법 §92①·부칙(법률 제20617호) 제14조: 2024-01-01~2026-12-31", () => {
    expect(MARRIAGE_CREDIT_2026.REGISTERED_FROM).toBe("2024-01-01");
    expect(MARRIAGE_CREDIT_2026.REGISTERED_UNTIL).toBe("2026-12-31");
    expect(MARRIAGE_CREDIT_WINDOW).toBe("2024년 1월 1일부터 2026년 12월 31일까지");
    const faq = YEAR_END_LIMIT_FAQS.find((f) => f.question.startsWith("혼인세액공제"));
    expect(faq?.answer.startsWith(MARRIAGE_CREDIT_WINDOW)).toBe(true);
    const hubRow = YEAR_END_REFORM_2027.rows.find((r) => r.item === "혼인세액공제");
    expect(hubRow?.now).toBe("2024년 1월 1일부터 2026년 12월 31일까지 혼인신고한 해에 1명당 50만원(생애 1회)");
  });
});

// ── 페이지 렌더 ──
function visibleContent(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
}
function decodeEntities(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
function structuredItems(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]) as Record<string, unknown>
  );
}

describe("/year-end-tax 페이지 — 한도표·FAQ 배치와 FAQPage JSON-LD", () => {
  const html = renderToStaticMarkup(createElement(YearEndTaxPage));
  const visible = decodeEntities(visibleContent(html));

  it("FAQPage 는 하나이고 모든 문항이 화면 본문과 글자 그대로 같다 (기존 4 + 한도 6)", () => {
    const faqPages = structuredItems(html).filter((d) => d["@type"] === "FAQPage");
    expect(faqPages).toHaveLength(1);
    const entities = faqPages[0].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(entities).toHaveLength(10);
    expect(entities.slice(4).map((e) => e.name)).toEqual(YEAR_END_LIMIT_FAQS.map((f) => f.question));
    for (const e of entities) {
      expect(visible).toContain(e.name);
      expect(visible).toContain(e.acceptedAnswer.text);
    }
  });

  it("한도표 전 행이 화면에 나온다", () => {
    expect(visible).toContain("2026년 귀속 연말정산 주요 공제 한도");
    for (const r of YEAR_END_LIMIT_ROWS) {
      expect(visible).toContain(r.item);
      expect(visible).toContain(r.rate);
      expect(visible).toContain(r.limit);
    }
    expect(visible).toContain(YEAR_END_LIMITS_SOURCE_NOTE);
  });

  it("새 섹션은 모든 광고(쿠팡 배너 포함)보다 아래이고, 광고 위 FAQ 는 4문항 그대로다", () => {
    const sectionAt = html.indexOf('id="year-end-limits-heading"');
    expect(sectionAt).toBeGreaterThan(-1);
    const adPositions = [...html.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => m.index ?? -1);
    expect(adPositions.length).toBeGreaterThanOrEqual(5);
    expect(Math.max(...adPositions)).toBeLessThan(sectionAt);
    expect(html.indexOf('data-test-ad="coupang"')).toBeLessThan(sectionAt);
    // 공유 섹션 뒤(컨테이너 맨 끝) — 기존 형제 요소 순서 불변
    expect(html.indexOf('data-test="share"')).toBeLessThan(sectionAt);
    const lastAd = Math.max(...adPositions);
    expect((html.slice(0, lastAd).match(/<details/g) ?? []).length).toBe(4);
  });

  it("표 끝 비과세·감면 행(YE-06)은 모바일 이름표가 맞고, 감면 계산기 링크·안내 문장은 마지막 광고 아래에만 있다", () => {
    expect(html).toContain('<span class="sm:hidden font-bold text-navy">비과세 </span>');
    expect(html).toContain('<span class="sm:hidden font-bold text-navy">요건 </span>');
    expect(html).toContain('<span class="sm:hidden font-bold text-navy">감면율 </span>');
    expect(html.split('<span class="sm:hidden font-bold text-navy">공제율 </span>')).toHaveLength(8); // 기존 7행
    expect(html.split('<span class="sm:hidden font-bold text-navy">한도 </span>')).toHaveLength(9); // 기존 7행 + 감면 행
    const lastAd = Math.max(...[...html.matchAll(/data-test-ad="([^"]+)"/g)].map((m) => m.index ?? -1));
    const link = html.indexOf('href="/calc/smb-income-tax-break"');
    expect(link).toBeGreaterThan(lastAd);
    expect(html.indexOf("중소기업 감면 계산기 →")).toBeGreaterThan(lastAd);
    expect(html.indexOf("감면 대상이면 결정세액이 더 낮습니다")).toBeGreaterThan(lastAd);
    expect(html.indexOf("기업 출산지원금 비과세")).toBeGreaterThan(lastAd);
    // 광고 위에는 이 행·링크가 없다
    const aboveLastAd = html.slice(0, lastAd);
    expect(aboveLastAd).not.toContain("/calc/smb-income-tax-break");
    expect(aboveLastAd).not.toContain("출산지원금");
    expect(aboveLastAd).not.toContain("중소기업 취업자");
  });

  it("page.tsx 소스에서도 광고 태그가 새 섹션보다 모두 앞에 있다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/year-end-tax/page.tsx"), "utf8");
    const sectionAt = src.indexOf("year-end-limits-heading");
    const adTags = [...src.matchAll(/<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g)];
    expect(adTags.length).toBeGreaterThanOrEqual(6);
    for (const m of adTags) expect(m.index ?? Infinity).toBeLessThan(sectionAt);
  });
});
