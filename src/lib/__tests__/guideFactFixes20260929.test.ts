// 2026-09-29 가이드 사실 정정 묶음(guides-a) 회귀 방지 — 테스트 전용.
//
// (1) 광고 분할 고정: 본문을 고친 가이드마다 H2 개수와 광고 분할 지점(GuidePageClient.splitContentByH2 의 H2 순번)과
//     4,000자(UTF-16) 경계의 어느 쪽인지를 고정한다. 본문 길이가 경계를 넘거나 분할 H2 가 바뀌면 InArticleAd·GuideMidAd 위치가 움직인다.
//     (splitContentByH2 복제본과 원본의 일치는 guideSpec.test.ts 의 드리프트 가드가 맡는다.)
// (2) 정정한 사실이 옛 값으로 되돌아가지 않게 핵심 문구를 고정한다(본문은 광고 위 같은 폭 교체라 문구가 짧다).
//
// 배포가 두 슬롯으로 나뉜다: 이 파일의 첫 판은 10/2 분(본문 같은 폭 정정 17편)만 고정하고,
// 10/13 분(회사 가이드 3편 본문 + 마지막 광고 아래 보강)은 그 커밋들 뒤의 테스트 커밋이 더한다.
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { extractGuideFaqs } from "@/lib/guideFaq";

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
};

describe("2026-09-29 정정 가이드 — 광고 분할 고정", () => {
  for (const [slug, [h2, split, under4000]] of Object.entries(SPLIT_PIN)) {
    it(`${slug}: H2 ${h2}개, 분할 H2 #${split.join("·#")}, 4,000자 ${under4000 ? "미만" : "이상"}`, () => {
      expect(shape(bySlug(slug).content)).toEqual({ h2, split, under4000 });
    });
  }
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
