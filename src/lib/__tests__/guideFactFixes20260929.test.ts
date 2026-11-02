// 2026-09-29 가이드 사실 정정 묶음(guides-a) 회귀 방지 — 테스트 전용.
//
// (1) 광고 분할 고정: 본문을 고친 가이드마다 H2 개수와 광고 분할 지점(GuidePageClient.splitContentByH2 의 H2 순번)과
//     4,000자(UTF-16) 경계의 어느 쪽인지를 고정한다. 본문 길이가 경계를 넘거나 분할 H2 가 바뀌면 InArticleAd·GuideMidAd 위치가 움직인다.
//     (splitContentByH2 복제본과 원본의 일치는 guideSpec.test.ts 의 드리프트 가드가 맡는다.)
// (2) 정정한 사실이 옛 값으로 되돌아가지 않게 핵심 문구를 고정한다(본문은 광고 위 같은 폭 교체라 문구가 짧다).
// (3) 마지막 광고 아래 보강(supplements.ts)의 정본 상수 보간과 FAQPage 추출, 보강에서 고친 사실을 고정한다.
//
// 배포가 두 슬롯으로 나뉜다: 10/2 분(본문 같은 폭 정정 17편)은 첫 테스트 커밋이,
// 10/13 분(회사 가이드 3편 본문 + 마지막 광고 아래 보강)은 그 커밋들 뒤의 두 번째 테스트 커밋이 고정한다.
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { extractGuideFaqs } from "@/lib/guideFaq";
import { guideSupplements } from "@/lib/guides/supplements";
import { UNEMPLOYMENT_BENEFIT_2026, unemploymentDailyLowerBound } from "@/config/unemploymentBenefit";
import { dartInjection } from "@/data/dart/dartInjection";

const H2_OPEN_RE = /<h2[\s>]/gi;
/** GuidePageClient.splitContentByH2 와 같은 규칙 — 분할이 시작되는 본문 위치 */
function splitStarts(html: string): number[] {
  const indices = [...html.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
  if (indices.length < 2) return [];
  const candidates = indices.filter((i) => i > 0);
  if (candidates.length === 0) return [];
  const nearest = (target: number, pool: number[]) =>
    pool.reduce((best, cur) => (Math.abs(cur - target) < Math.abs(best - target) ? cur : best));
  if (html.length < 4000 || candidates.length === 1) return [nearest(html.length / 2, candidates)];
  const p1 = nearest(html.length / 3, candidates);
  const after = candidates.filter((i) => i > p1);
  if (after.length === 0) return [p1];
  return [p1, nearest((html.length * 2) / 3, after)];
}
function shape(html: string) {
  const opens = [...html.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
  return { h2: opens.length, split: splitStarts(html).map((p) => opens.indexOf(p)), under4000: html.length < 4000 };
}

const bySlug = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`missing guide ${slug}`);
  return g;
};

/** 슬러그 → [H2 개수, 분할 H2 순번, 4,000자 미만 여부] — 2026-09-29 기준선(4ef59a4b)과 같다 */
const SPLIT_PIN: Record<string, [number, number[], boolean]> = {
  "earned-income-credit-2026": [7, [2], true],
  "minimum-wage-impact-2026": [7, [3], true],
  "minimum-wage-2026": [8, [2, 5], false],
  "parental-leave-complete-guide": [6, [2], true],
  "unemployment-benefits-complete": [8, [3], true],
  "health-insurance-2026-guide": [5, [2], true],
  "year-end-tax-deductions-guide": [5, [2], true],
  "business-trip-expense-tax-2026": [2, [1], true],
  "samsung-opi-forecast-2027": [9, [3, 6], false],
  "sk-hynix-ps-forecast-2027": [10, [3, 7], false],
  "parental-leave-6plus6-2026": [4, [2], true],
  "irp-pension-isa-comparison-2026": [7, [4], true],
  "side-hustle-tax-2026": [13, [5, 9], false],
  "newlywed-tax-benefits-2026": [8, [3], true],
  "first-home-2026-strategy": [7, [3], true],
  "rental-income-tax-2026": [6, [3], true],
  "vat-filing-2026": [8, [4], true],
  // 10/13 분 — 회사 가이드 3편(본문이 하단 보강을 가리키므로 보강과 같은 날 배포)
  "samsung-medison-salary-2026": [5, [2], true],
  "kai-salary-2026": [7, [2, 4], false],
  "hl-mando-salary-2026": [7, [3], true],
};

describe("2026-09-29 정정 가이드 — 광고 분할 고정", () => {
  for (const [slug, [h2, split, under4000]] of Object.entries(SPLIT_PIN)) {
    it(`${slug}: H2 ${h2}개, 분할 H2 #${split.join("·#")}, 4,000자 ${under4000 ? "미만" : "이상"}`, () => {
      expect(shape(bySlug(slug).content)).toEqual({ h2, split, under4000 });
    });
  }
  it("삼성메디슨 본문은 4,000자 경계 바로 아래(3,952자)라 늘리지 않는다", () => {
    expect(bySlug("samsung-medison-salary-2026").content.length).toBeLessThanOrEqual(3952);
  });
});

describe("2026-09-29 정정 가이드 — 옛 값 재발 금지", () => {
  it("최저임금: 월급 215만원은 위반, 월 환산 216만원, 2027년 확정", () => {
    const t = bySlug("minimum-wage-impact-2026").content;
    expect(t).toContain("약 10,287원 (위반)");
    expect(t).not.toContain("(경계)");
    expect(t).toContain("약 216만원 (주휴 포함)");
    expect(bySlug("minimum-wage-2026").content).toContain("2027년 (확정)");
  });
  it("근로장려금: 자녀장려금 7,000만원, 반기 3월 신청→6월·9월 신청→12월 30일", () => {
    const t = bySlug("earned-income-credit-2026").content;
    expect(t).toContain("총소득 7,000만원 미만");
    expect(t).not.toContain("총소득 4,000만원 미만");
    expect(t).toMatch(/반기 \(하반기\)<\/td><td class="p-2">2026년 3월 1일~15일<\/td><td class="p-2">2026년 6월/);
    expect(t).toMatch(/반기 \(상반기\)<\/td><td class="p-2">2026년 9월 1일~15일<\/td><td class="p-2">12월 30일/);
  });
  it("육아휴직: 6+6 첫 달 250만원, 7개월 이후 160만원, 출산휴가 220만원, 거부는 벌금", () => {
    const t = bySlug("parental-leave-complete-guide").content;
    expect(t).toContain("월 250만원</td><td class=\"p-2 text-right\">월 500만원");
    expect(t).toContain("상한 160만원) 적용");
    expect(t).toContain("상한 월 220만원");
    expect(t).not.toContain("과태료");
    // 과태료→벌금 교체 뒤 조사까지 맞는지(벌금이) 고정
    expect(t).toContain("벌금</strong>이 부과");
    expect(t).not.toContain("벌금</strong>가 부과");
    expect(bySlug("parental-leave-6plus6-2026").content).toContain("(월 상한 160만원)");
  });
  it("실업급여: 왕복 통근, 대기기간은 실업 신고부터, 근거 없는 5년 박탈 삭제", () => {
    const t = bySlug("unemployment-benefits-complete").content;
    expect(t).toContain("왕복 통근 시간");
    expect(t).toContain("실업 신고 이후 첫 7일간");
    expect(t).toContain("월 60시간 이상");
    expect(t).not.toContain("5년간 수급 자격 박탈");
  });
  it("건강보험: 2026년 본인부담상한액(843만원), 사후환급은 신청해야 지급", () => {
    const t = bySlug("health-insurance-2026-guide").content;
    expect(t).toContain("약 843만원");
    expect(t).not.toContain("약 780만원");
    expect(t).not.toContain("별도 신청 불필요");
  });
  it("연말정산 공제: 인적공제 최대 450만원, 대학생 900만원, 특례·일반 기부금", () => {
    const t = bySlug("year-end-tax-deductions-guide").content;
    expect(t).toContain("1인 최대 450만원 공제");
    expect(t).toContain("대학생 자녀 15%(1인 한도 900만원)");
    expect(t).not.toContain("법정·지정");
  });
  it("회사 가이드: 공시 없음·FY2025 미확인 문구 삭제", () => {
    expect(bySlug("samsung-medison-salary-2026").content).not.toContain("공식 평균연봉·초봉 수치가 존재하지 않습니다");
    expect(bySlug("hl-mando-salary-2026").content).not.toContain("인용한 보도가 아직 없어");
    expect(bySlug("kai-salary-2026").content).not.toContain("공시 인용 보도가 확인되지 않아");
  });
  it("신혼부부 세금: 증여공제는 평생 1억원, 시부모 증여를 직계존속 공제로 적지 않는다", () => {
    const t = bySlug("newlywed-tax-benefits-2026").content;
    expect(t).toContain("(평생 1억원)");
    expect(t).not.toContain("시부모 5천만");
  });
  it("임대소득 분리과세 1월 15일 신고 문구 삭제, DSR 예시 약 3.5억", () => {
    expect(bySlug("rental-income-tax-2026").content).not.toContain("1월 15일");
    expect(bySlug("first-home-2026-strategy").content).toContain("약 3.5억 한도");
  });
  it("부가세: 법인도 소규모는 예정고지 — '무조건 신고'로 되돌리지 않는다", () => {
    const t = bySlug("vat-filing-2026").content;
    expect(t).toContain("25일까지 원칙상 신고");
    expect(t).not.toContain("무조건 신고");
  });
  it("국민연금 FAQPage 답변이 화살표로 시작하지 않는다", () => {
    const faqs = extractGuideFaqs(bySlug("national-pension-strategy-2026").content);
    expect(faqs.length).toBe(3);
    for (const f of faqs) expect(f.answer.startsWith("→")).toBe(false);
  });
});

describe("2026-09-29 보강 섹션 — 정본 보간·FAQ", () => {
  it("보강 키는 모두 실제 한국어 가이드 슬러그다", () => {
    for (const slug of Object.keys(guideSupplements)) expect(koGuides.some((g) => g.slug === slug), slug).toBe(true);
  });
  it("실업급여 보강 FAQ 2문항 — 1일 상·하한은 정본 상수", () => {
    const html = guideSupplements["unemployment-benefits-complete"];
    expect(html).toContain(`${UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER.toLocaleString("en-US")}원`);
    expect(html).toContain(`${unemploymentDailyLowerBound().toLocaleString("en-US")}원`);
    const faqs = extractGuideFaqs(bySlug("unemployment-benefits-complete").content + html);
    expect(faqs.map((f) => f.question)).toEqual(["2026년 실업급여 하루 최대·최소 금액은?", "50세 이상이면 며칠 받나요?"]);
  });
  it("방산 4사 FY2025 표는 dartInjection 값과 같다", () => {
    const html = guideSupplements["kai-salary-2026"];
    for (const id of ["hanwha-aerospace", "hyundai-rotem", "kai", "lig-nex1"]) {
      const d = dartInjection[id];
      expect(d.y).toBe("2025");
      expect(html).toContain(`href="/salary-db/${id}"`);
      expect(html).toContain(`${d.e.toLocaleString("en-US")}명`);
      expect(html).toContain(d.r);
    }
  });
  it("삼성메디슨·HL만도 보강은 DART 공시 평균(1억800만원)을 적는다", () => {
    expect(dartInjection["samsung-medison"].a).toBe(10800);
    expect(guideSupplements["samsung-medison-salary-2026"]).toContain("1억800만원");
    expect(guideSupplements["hl-mando-salary-2026"]).toContain("1억800만원");
  });
  it("임의가입 최저 보험료 96,230원, 6+6 대상 자녀 생후 18개월·만 8세", () => {
    expect(guideSupplements["national-pension-strategy-2026"]).toContain("월 96,230원");
    expect(guideSupplements["parental-leave-6plus6-2026"]).toContain("생후 18개월 이내");
    expect(guideSupplements["parental-leave-6plus6-2026"]).toContain("만 8세 이하");
  });
  it("육아기 단축급여 상한은 2026년 값(최초 10시간 250만원·나머지 160만원), 18개월은 조건부", () => {
    const html = guideSupplements["parental-leave-complete-guide"];
    // 2026-01-01 시행 고용보험법 시행령: 220→250만원, 150→160만원
    expect(html).toContain("상한 250만원");
    expect(html).not.toContain("상한 220만원");
    expect(html).toContain("나머지 단축분 80%는 상한 160만원");
    // 최초 10시간 100%는 2024-07-01 시행 — '첫 5시간'을 2024년 전체 제도로 적지 않는다
    expect(html).toContain("단축 첫 5시간 100%는 2024년 6월까지");
    expect(html).not.toContain("설명은 2024년 제도입니다");
    // 남녀고용평등법 제19조 제2항: 6개월 추가는 부모 각 3개월 이상 사용 등에 한정
    expect(html).toContain("부모가 각각 3개월 이상 쓰는 경우 등에 한해");
  });
  it("일용근로 소액부징수는 일괄 지급 시 여러 날 세액 합계로 판단한다", () => {
    const html = guideSupplements["coupang-fulfillment-night-pay-2026"];
    expect(html).not.toContain("(일당 18만7천원 이하는 0원)");
    expect(html).toContain("주급·월급으로 몰아 받으면 여러 날 세액을 합쳐 1천원 이상이면 원천징수됩니다");
    expect(html).toContain("법인46013-343");
  });
  it("부가세 보강: 소규모 법인(직전 공급가액 1억5천만원 미만)은 예정고지", () => {
    expect(guideSupplements["vat-filing-2026"]).toContain("(직전 과세기간 공급가액 1억5천만원 미만 법인은 예정고지)");
  });
  // 통합(2026-09-29): page.tsx 는 본문 + 보강을 합쳐 FAQPage 를 뽑는다(extractGuideFaqs). 보강 FAQ 는 광고 아래에 보이는
  // 문항이라 FAQPage 에 들어가도 가시 내용과 1:1 이다 — 막아야 할 것은 헤더 자체가 아니라 본문·보강 사이의 같은 질문 중복이다.
  // (guidesb 배치가 financial-income-tax·real-estate-tax-comprehensive·unemployment-insurance-2026·year-end-tax-2026 보강에
  //  본문 FAQ 가 없는 글의 유일한 FAQ 로 넣었다.)
  it("본문 + 보강에서 뽑은 FAQ 질문이 겹치지 않는다(FAQPage 중복 방지)", () => {
    const bodies = new Map(koGuides.map((g) => [g.slug, g.content]));
    for (const [slug, html] of Object.entries(guideSupplements)) {
      const body = bodies.get(slug);
      expect(body, `${slug}: 보강 키가 실제 가이드`).toBeDefined();
      const questions = extractGuideFaqs(body + html).map((f) => f.question.replace(/\s+/g, ""));
      expect(new Set(questions).size, `${slug}: FAQ 질문 중복`).toBe(questions.length);
    }
  });
});
