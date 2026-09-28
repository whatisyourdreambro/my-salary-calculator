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
import { UNEMPLOYMENT_BENEFIT_2026, unemploymentDailyLowerBound } from "@/config/unemploymentBenefit";

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
  // GB-03·MISSED-gb-4·MISSED-gb-6a 분납 기한·납부지연가산세·간이과세 기준·부가세 신고 주기·노란우산 한도
  ["comprehensive-income-tax-2026", ["7월 31일까지", "연 약 8% (일 0.022%)", "연 600만원까지 소득공제"], ["8월 31일까지", "9.125%", "연 500만원까지"]],
  ["n-job-tax-2026", ["납부지연 연 8.0%", "1억 400만원(간이과세 기준)", "(개인 일반과세자)은 1·7월 부가세 신고", "연 600만원까지 소득공제"], ["9.125%", "4,800만원(부가세 면세 한도)", "쿠팡파트너스·유튜브는 부가세 면제"]],
  // GB-04 가상자산 과세 2027-01-01 시행·연간 손익 통산·의제취득가액 (국세청 cntntsId=238935)
  ["crypto-tax-2026", ["2027년 1월 1일 이후 양도·대여분부터 과세", "1년 동안의 손익을 통산해 과세함", "2026년 말 시가와 실제 취득가 중 큰 금액"], ["World-Crossing", "추가 유예되었거나", "시행 직전에 매도하면 과세 대상 아님"]],
  // GB-19 조정대상지역 취득 주택 2년 거주 요건(유예된 적 없음) + 양도세 계산기 링크
  ["real-estate-capital-gains-2026", ["(조정대상지역 취득 주택은 2년 거주 요건 추가)", "href=\"/calc/real-estate-capital-gains-quick\">양도세 계산기</a>"], ["한시 유예", "acquisition-tax\">취득세 계산기"]],
  // GB-20 장례비 공제 1천만원 한도 + 봉안시설 5백만원 별도 (상증세법 시행령 §9②)
  ["inheritance-tax-strategy", ["1천만원 (봉안시설은 5백만원 별도)"], ["영수증 5천만원까지 인정"]],
  // GB-05·MISSED-gb-1 구직급여 상·하한(정본 상수 보간)·고용24·임금체불 2개월(시행규칙 별표 2)
  [
    "unemployment-insurance-2026",
    [
      `일 상한 ${UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER.toLocaleString("en-US")}원`,
      `하한 ${Math.floor((unemploymentDailyLowerBound() * 30) / 10000)}만`,
      "고용24 회원가입",
      "임금 체불 (1년 내 2개월+)",
    ],
    ["일급 한도", "최저 약 90만", "워크넷 회원가입", "매 4주 4회", "월 50만 초과", "수강료 100% 지원"],
  ],
  // GB-21 온투업 이자 원천징수 14%(지방세 포함 15.4%) — 소득세법 §129①1호 나목 단서
  ["p2p-investment-risk", ["이자 소득세 15.4%", "-3.5~2.5%", "온투업 이자 14% + 지방세 1.4% = 15.4%"], ["27.5%"]],
  // GB-22 개인회생 채무 한도 무담보 10억·담보 15억 (채무자회생법 §579, 2021-04-20 시행)
  ["personal-loan-vs-debt-consolidation", ["대상: 무담보 10억·담보 15억원 이하"], ["채무 5억 이하"]],
  // GB-23·MISSED-gb-2 휴직 = 직장가입자·고용보험 자격 유지, 지역 건보료 자동차 부과 폐지(2024-02)
  ["career-break-financial-plan", ["휴직 땐 직장가입자 유지, 고지 유예 가능", "휴직 중에도 자격 유지"], ["자동 전환. 본인 자산", "자동차 + 예금 있으면", "휴직 중에는 가입 X"]],
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
