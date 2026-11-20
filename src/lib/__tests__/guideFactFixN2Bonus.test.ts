// R4 GUIDES 단위 — N2-guides-content-03 (hot-bonus-tax-complete.ts 성과급 세금 가이드 7편, 2026-11-18) 사실 정정 핀.
//
// 모두 광고 위 본문·제목·설명의 같은 폭 이하 교체다(글마다 커밋 하나, 스윕에서 광고가 내려가면 그 커밋과 아래 같은 describe 블록을 함께 지운다).
// 분할 고정·읽기 시간 규칙은 guideFactFixN2Semis.test.ts 머리 주석과 같다. 공식 출처는 각 커밋 메시지(2026-11-18 확인).
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import {
  calcIncomeTax2026, earnedIncomeDeduction2026, earnedIncomeTaxCredit2026, INSURANCE_RATES_2026, PENSION_BASE_2026,
} from "@/lib/taxConstants2026";

const guide = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`가이드 없음: ${slug}`);
  return g;
};
const all = (slug: string) => {
  const g = guide(slug);
  return `${g.title}\n${g.description}\n${g.content}`;
};

const H2_OPEN_RE = /<h2[\s>]/gi;
function splitH2Ordinals(html: string): number[] {
  const indices = [...html.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
  if (indices.length < 2) return [];
  const candidates = indices.filter((i) => i > 0);
  if (candidates.length === 0) return [];
  const nearest = (target: number, pool: number[]) =>
    pool.reduce((best, cur) => (Math.abs(cur - target) < Math.abs(best - target) ? cur : best));
  let pts: number[];
  if (html.length < 4000 || candidates.length === 1) pts = [nearest(html.length / 2, candidates)];
  else {
    const p1 = nearest(html.length / 3, candidates);
    const after = candidates.filter((i) => i > p1);
    pts = after.length === 0 ? [p1] : [p1, nearest((html.length * 2) / 3, after)];
  }
  return pts.map((p) => indices.indexOf(p));
}

// [H2 개수, 분할 H2 순번, 히어로 읽기 시간(분)] — ce2463cda 실측
const SPLIT_PINS: Record<string, [number, number[], number]> = {
  "executive-bonus-corporate-limit-2026": [2, [1], 1],
  "bonus-property-sell-same-year-2026": [3, [1], 2],
  "dependent-check-before-bonus-2026": [3, [2], 2],
  "total-income-adjustment-bonus-2026": [2, [1], 1],
  "moving-company-bonus-2026": [2, [1], 1],
  "gift-children-with-bonus-2026": [2, [1], 1],
  "foreign-bonus-structure-2026": [2, [1], 1],
};

describe("N2-guides-content-03 — 광고 분할·읽기 시간 불변", () => {
  for (const [slug, [h2, split, minutes]] of Object.entries(SPLIT_PINS)) {
    it(slug, () => {
      const html = guide(slug).content;
      expect([...html.matchAll(H2_OPEN_RE)].length).toBe(h2);
      expect(splitH2Ordinals(html)).toEqual(split);
      expect(Math.ceil(html.length / 1000)).toBe(minutes);
    });
  }
});

describe("b03-F01 (f6aa59ce9) 비상장 임원 성과급 한도 — 2026 법인세율에 24% 구간은 없다", () => {
  it("초과 3억은 20% 구간 6,000만원, 24%·7,200만원 없음(본문·설명)", () => {
    const g = guide("executive-bonus-corporate-limit-2026");
    expect(g.content).toContain("<li>· 한도 초과분: 손금 불산입 → 법인세 추가</li>");
    expect(g.content).toContain("<li>· 한도 초과 3억: 손금 불산입 → 법인세 6,000만 추가</li>");
    expect(g.description).toContain("초과 3억 법인세 6,000만 추가");
    expect(all(g.slug)).not.toContain("법인세 24%");
    expect(all(g.slug)).not.toContain("7,200만");
    expect((300_000_000 * 20) / 100).toBe(60_000_000); // 2억 초과 200억 이하 구간 20%(법인세법 제55조, 2026년 이후 시작 사업연도)
  });
});

describe("b03-F02 (9aa629b10) 성과급·부동산 같은 해 — 예정신고는 양도월 말일부터 2개월", () => {
  it("양도일 다음달 말일 문구가 없다", () => {
    const c = guide("bonus-property-sell-same-year-2026").content;
    expect(c).toContain("양도월 말일부터 2개월 예정신고");
    expect(c).not.toContain("양도일 다음달 말일");
  });
});

describe("b03-F03 (69b3489b1) 가족 피부양자 점검 — 2022년 9월 개편, 재산 9억·5.4억, 임대소득", () => {
  it("본문·제목·설명", () => {
    const g = guide("dependent-check-before-bonus-2026");
    expect(g.content).toContain("2022년 9월 피부양자 요건 강화");
    expect(g.content).toContain("<strong>재산세 과세표준 9억 이하</strong>: 5.4억 초과는 조건부");
    expect(g.content).toContain("연금·이자소득 등으로 2,000만 넘거나 임대소득이 있으면 박탈 → 지역보험료 부과.");
    // R4 수리(2026-11-20): 함정 문단이 374~382px 에서 한 줄 늘어(+32, 핵심 요약 -26 과 합쳐 +6) GuideMidAd 가 내려갔다 —
    // N 문장의 낱말을 지우거나 더 좁은 낱말로만 바꾼 꼴로 다시 썼다(줄 수가 N 이하).
    // F5(law-4): 2022년 9월 개편은 소득 기준(3,400만 -> 2,000만)이고 재산 기준은 그대로였다.
    expect(g.content).toContain("2022년 9월 피부양자 요건 강화 — 연소득 2,000만원 이하, 재산 기준 유지.");
    expect(g.content).not.toContain("연소득 2,000만원 + 재산세 과세표준 5.4억 이하");
    // F4(law-gaps-4): 시행규칙 별표 1의2 제1호 나목 — 사업자등록이 있으면 사업소득이 있으면 탈락, 없으면 연 500만원 이하만 인정
    expect(g.content).toContain("<li>· <strong>사업소득</strong>: 등록자 0원, 미등록 500만 이하</li>");
    expect(g.content).not.toContain("연 500만 초과 시 피부양자 박탈");
    // F3(law-gaps-1): 소득 요건은 가족 한 사람 한 사람의 소득으로 본다(가족끼리 더하지 않는다)
    // R4 수리 2회차(2026-11-20): 설명이 '임대소득'·'보험료' 를 더하고 '연금'·'이자' 를 빼자 /guides 태그 링크(?q=임대소득 6 -> 7편 등)의
    // 카드 목록이 N 과 달라져 GuideMidAd 가 새로 생겼다 — N 문장에서 낱말을 지우거나 더 좁게 바꾼 꼴로, 한 사람 기준('가족 1인 … 합산')은 지킨다.
    expect(g.description).toBe("본인 성과급으로 피부양자 자격 직접 영향 없음. 단 가족 1인 연금·이자 합산 2,000만+ 시 박탈 → 지역가입자 부담.");
    expect(g.description).not.toContain("가족 임대·연금·이자 합산");
    expect(g.description).not.toContain("임대소득");
    expect(g.description).not.toContain("보험료");
    expect(g.content).toContain("<li>· 임대소득 있으면 피부양자 탈락</li>");
    expect(g.title).toBe("성과급 받기 전 가족 피부양자 점검 — 소득 2,000만 + 박탈");
    expect(all(g.slug)).not.toContain("2022년 11월");
    expect(all(g.slug)).not.toContain("50~150만");
    expect(all(g.slug)).not.toContain("임대 2,000만");
  });
});

describe("b03-F04 (f19859c27) 종합 정산 시뮬 — 배당 2,000만원 분리과세, 사이트 세금 엔진과 같은 자릿수", () => {
  it("본문·제목·설명의 새 숫자, 옛 2억·4,500만·5,750만 없음", () => {
    const g = guide("total-income-adjustment-bonus-2026");
    for (const s of ["<li>· 종합과세: 1.8억</li>", "<li>· 소득세: 약 4,100만</li>", "<li>· 지방세: 410만</li>", "<strong>총 부담: 약 5,300만</strong>"]) {
      expect(g.content).toContain(s);
    }
    // R4 수리(2026-11-20): '종합정산'(붙여 쓴 한 낱말)이 426~464px 에서 H1 을 한 줄 늘려 광고가 38px 내려갔다 — N 의 띄어 쓴
    // '종합 정산'으로 되돌리고, 끝말은 N 의 '추가'보다 좁은 '총'(5,300만 은 5,750만 보다 0.06em 넓다)으로 줄 수가 N 이하.
    expect(g.title).toBe("성과급 + 임대 + 금융 + 사업 종합 정산 — 영끌 2억 시 총 5,300만");
    expect(g.title).not.toContain("종합정산");
    // R4 수리 2회차(2026-11-20): 옛 첫 문장 '성과급 5,000만 + 임대 3,000만 + 배당 2,000만 + 사업 3,000만 = 영끌 2억' 은 더하면
    // 1.3억이었다(검토 B-1) — 본문 시나리오(연봉 7,000만 + 성과급 5,000만)대로 급여 1.2억. 4,100만은 종합과세 1.8억의
    // 종합소득세라 N 처럼 '종소세'(1회차의 '소득세' 는 /guides?q=종소세 결과를 7편 -> 5편으로 바꿔 GuideMidAd 를 없앴다).
    expect(g.description).toBe("급여 1.2억 + 임대 3,000만 + 배당 2,000만 + 사업 3,000만 = 영끌 2억. 종소세 4,100만 + 지방세 + 정산 800만 = 약 5,300만 부담.");
    expect(g.description).not.toContain("성과급 5,000만 + 임대");
    expect(all(g.slug)).not.toContain("5,750만");
    expect(all(g.slug)).not.toContain("종합소득 총: 2억");
    expect(all(g.slug)).not.toContain("4,500만");
  });
  it("taxConstants2026 엔진: 총급여 1.2억 + 임대·사업 소득금액 6,000만, 배당 2,000만 14% 분리과세 → 약 4,100만·410만·5,300만", () => {
    const gross = 120_000_000;
    const earned = gross - earnedIncomeDeduction2026(gross);
    const total = earned + 60_000_000;
    const ins = Math.min(gross / 12, PENSION_BASE_2026.MAX_MONTHLY) * 12 * INSURANCE_RATES_2026.NATIONAL_PENSION
      + gross * INSURANCE_RATES_2026.HEALTH_INSURANCE * (1 + INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO)
      + gross * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE;
    const calc = calcIncomeTax2026(total - 1_500_000 - ins);
    const decided = calc - earnedIncomeTaxCredit2026(calc * (earned / total), gross);
    const incomeTax = decided + 20_000_000 * 0.14;
    const local = incomeTax * INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO;
    const man = (x: number, unit: number) => Math.round(x / 10_000 / unit) * unit;
    expect(man(incomeTax, 100)).toBe(4100);
    expect(man(local, 10)).toBe(410);
    expect(man(incomeTax + local + 8_000_000, 100)).toBe(5300);
  });
});

describe("b03-F05 (31327daa8) 이직 중 성과급 — 새 회사 연말정산 합산, 건보는 회사별", () => {
  it("5월 합산 신고 의무·건보 양쪽 통합 문구가 없다", () => {
    const g = guide("moving-company-bonus-2026");
    expect(g.content).toContain("새 회사 연말정산에 합산(빠지면 5월 신고). 건보는 회사별.");
    expect(g.content).toContain("<strong>합산</strong>: 새 회사 정산에 합산.");
    expect(g.content).toContain("<li>· 빠지면 5월 종소세 신고로 합산</li>");
    expect(g.description).toContain("새 회사 연말정산에서 합산.");
    expect(all(g.slug)).not.toContain("양쪽 통합");
    expect(all(g.slug)).not.toContain("합산 신고 의무");
    expect(all(g.slug)).not.toContain("5월 종소세 신고 시");
  });
});

describe("b03-F06 (215b22a7b) 자녀 증여 — 손자녀 공제는 부모와 합산", () => {
  it("손자녀를 별도 10년 5,000만원으로 적지 않는다", () => {
    const c = guide("gift-children-with-bonus-2026").content;
    expect(c).toContain("<li>· 손자녀: 부모와 합산</li>");
    expect(c).not.toContain("손자녀: 10년 5,000만원");
  });
});

describe("b03-M01 (a7cd743b5) 외국계 성과급 — RSU 신고와 해외금융계좌 6월 신고", () => {
  it("'외국 자산 미신고 죄'·'매년 5월 … 함께 처리'가 없다", () => {
    const c = guide("foreign-bonus-structure-2026").content;
    expect(c).toContain("국내 회사가 원천징수하지 않았으면 본인이 5월 종소세로 신고");
    expect(c).toContain("해외계좌 잔액 5억 초과면 6월 별도 신고.");
    expect(c).not.toContain("미신고 죄");
    expect(c).not.toContain("종소세 신고와 함께 처리");
  });
});
