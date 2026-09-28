// 2026-10 가이드 사실 정정 배치(guidesb) 가드 — 테스트 전용, 런타임 파일 무변경.
//
// (1) 광고 위치 가드: GuidePageClient.splitContentByH2 는 본문 길이 4,000자(UTF-16)를 경계로 2분할/3분할을 가르고
//     조각 사이에 GuideMidAd·InArticleAd 를 넣는다. 이 배치에서 본문을 고친 글마다 수정 전(4ef59a4b) 분할 수·분할 H2 순번·
//     4,000자 경계의 어느 쪽인지·읽기 시간(히어로의 'N분 분량', 광고 위)을 고정한다. 본문을 다시 고칠 때 값이 바뀌면
//     광고 위치가 움직인 것이므로 문구 폭부터 다시 맞출 것(값을 그냥 갱신하지 말 것).
//     분할 함수 복제본의 원본 일치는 guideSpec.test.ts 의 SPLIT_FN_SHA 드리프트 가드가 맡는다.
// (2) 사실 고정: 정정한 수치가 옛 값으로 되돌아가지 않게 글별로 핀을 둔다(공식 출처는 각 커밋 메시지).
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";

const H2_OPEN_RE = /<h2[\s>]/gi;

/** GuidePageClient.splitContentByH2 복제 — 분할이 시작되는 본문 위치 목록 */
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

interface SplitPin {
  /** 조각 수 (2 = GuideMidAd 1개, 3 = GuideMidAd + 본문 속 InArticleAd) */
  segs: 2 | 3;
  /** 분할이 시작되는 H2 순번(0부터) */
  splitH2: number[];
  /** 4,000자 경계 기준 — 'under' 면 2분할 규칙, 'over' 면 3분할 규칙 */
  side: "under" | "over";
  /** 히어로 'N분 분량' = ceil(본문 길이 / 1000) */
  readingMinutes: number;
}

// 수정 전(4ef59a4b) 실측값 — 이 배치의 본문 수정 뒤에도 같아야 한다.
const SPLIT_PINS: Record<string, SplitPin> = {
  "individual-vs-corporate-tax": { segs: 2, splitH2: [2], side: "under", readingMinutes: 3 },
  "social-insurance-reduction": { segs: 2, splitH2: [2], side: "under", readingMinutes: 3 },
  "comprehensive-income-tax-2026": { segs: 2, splitH2: [2], side: "under", readingMinutes: 3 },
  "n-job-tax-2026": { segs: 2, splitH2: [2], side: "under", readingMinutes: 3 },
  "crypto-tax-2026": { segs: 2, splitH2: [2], side: "under", readingMinutes: 2 },
  "real-estate-capital-gains-2026": { segs: 2, splitH2: [3], side: "under", readingMinutes: 3 },
  "inheritance-tax-strategy": { segs: 2, splitH2: [2], side: "under", readingMinutes: 3 },
  "unemployment-insurance-2026": { segs: 2, splitH2: [4], side: "under", readingMinutes: 3 },
  "p2p-investment-risk": { segs: 2, splitH2: [3], side: "under", readingMinutes: 2 },
  "personal-loan-vs-debt-consolidation": { segs: 2, splitH2: [3], side: "under", readingMinutes: 2 },
  "career-break-financial-plan": { segs: 2, splitH2: [2], side: "under", readingMinutes: 3 },
  "retirement-planning-30s": { segs: 2, splitH2: [3], side: "under", readingMinutes: 3 },
  "stock-investment-beginner-2026": { segs: 2, splitH2: [2], side: "under", readingMinutes: 3 },
  "tax-refund-mistakes-2026": { segs: 2, splitH2: [6], side: "under", readingMinutes: 3 },
  "sk-hynix-ps-cash-vs-stock-scenarios-2026": { segs: 3, splitH2: [3, 5], side: "over", readingMinutes: 13 },
  "samsung-bonus-treasury-stock-15-trillion-2026": { segs: 3, splitH2: [3, 6], side: "over", readingMinutes: 13 },
  "samsung-vs-sk-hynix-stock-bonus-2026": { segs: 3, splitH2: [3, 6], side: "over", readingMinutes: 15 },
  "samsung-special-bonus-q3-preview-2027": { segs: 3, splitH2: [2, 5], side: "over", readingMinutes: 13 },
  "sk-hynix-wage-2026": { segs: 3, splitH2: [1, 3], side: "over", readingMinutes: 6 },
  "semiconductor-performance-bonus-tax": { segs: 3, splitH2: [1, 3], side: "over", readingMinutes: 7 },
  "samsung-employee-rsu-stock": { segs: 3, splitH2: [1, 3], side: "over", readingMinutes: 5 },
  "sk-hynix-stock-2026": { segs: 2, splitH2: [2], side: "under", readingMinutes: 4 },
  "sk-hynix-employee-bonus-stock": { segs: 3, splitH2: [1, 3], side: "over", readingMinutes: 5 },
  "semiconductor-cycle-2026": { segs: 2, splitH2: [2], side: "under", readingMinutes: 4 },
  "chip-stock-tax-guide": { segs: 2, splitH2: [2], side: "under", readingMinutes: 3 },
  "job-change-salary-jump-2026": { segs: 2, splitH2: [3], side: "under", readingMinutes: 3 },
  "stock-options-rsu-valuation": { segs: 2, splitH2: [3], side: "under", readingMinutes: 3 },
  "isa-account-guide": { segs: 3, splitH2: [2, 4], side: "over", readingMinutes: 6 },
  "us-treasury-bond": { segs: 3, splitH2: [2, 5], side: "over", readingMinutes: 6 },
  "financial-income-tax": { segs: 3, splitH2: [1, 4], side: "over", readingMinutes: 6 },
  "car-tax-annual-payment": { segs: 3, splitH2: [2, 4], side: "over", readingMinutes: 6 },
  "donation-tax-credit": { segs: 3, splitH2: [1, 4], side: "over", readingMinutes: 6 },
  "interview-questions-100": { segs: 3, splitH2: [2, 3], side: "over", readingMinutes: 8 },
  "mbti-work-style": { segs: 3, splitH2: [1, 2], side: "over", readingMinutes: 6 },
};

const bySlug = new Map(koGuides.map((g) => [g.slug, g]));
function body(slug: string): string {
  const g = bySlug.get(slug);
  if (!g) throw new Error(`가이드 없음: ${slug}`);
  return g.content;
}

describe("(1) guidesb 가 고친 가이드의 광고 분할 구조 불변", () => {
  for (const [slug, pin] of Object.entries(SPLIT_PINS)) {
    it(`${slug}: 분할 수·분할 H2·4,000자 경계·읽기 시간`, () => {
      const html = body(slug);
      const opens = [...html.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
      const starts = splitStarts(html);
      expect({
        segs: starts.length + 1,
        splitH2: starts.map((p) => opens.indexOf(p)),
        side: html.length < 4000 ? "under" : "over",
        readingMinutes: Math.ceil(html.length / 1000),
      }).toEqual(pin);
    });
  }
});

/** [슬러그, 있어야 할 문자열[], 없어야 할 문자열[]] — 항목 ID 는 주석 */
const FACT_PINS: Array<[string, string[], string[]]> = [
  // GB-01 법인세율 2026 (국세청 cntntsId=7746)
  ["individual-vs-corporate-tax", ["2억까지 10% / 200억까지 20% / 3000억까지 22% / 3000억 초과 25%", "700만 × 10% = 70만"], ["2억 이하 9%", "× 9% = 63만"]],
  // GB-02·MISSED-gb-3 비과세 근로소득 요건 (국세청 cntntsId=7867, 소득세법 시행령 §12·§17)
  ["social-insurance-reduction", ["(회사 1.15~1.75%)", "2023년부터 한도가", "월급 260만원 이하", "자녀 학자금은 과세 대상", "교원·출연연·중소기업 연구소"], ["1.05~1.65%", "210만원 이하", "출퇴근하는 경우", "R&D 직군 연구원은"]],
];

describe("(2) guidesb 사실 정정 고정", () => {
  for (const [slug, must, mustNot] of FACT_PINS) {
    it(`${slug}`, () => {
      const html = body(slug);
      for (const s of must) expect(html, `있어야 함: ${s}`).toContain(s);
      for (const s of mustNot) expect(html, `없어야 함: ${s}`).not.toContain(s);
    });
  }
});
