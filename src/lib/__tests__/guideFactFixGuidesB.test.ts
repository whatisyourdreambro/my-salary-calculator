// 2026-10 가이드 사실 정정 배치(guidesb) 가드 — 테스트 전용, 런타임 파일 무변경.
//
// (1) 광고 위치 가드: GuidePageClient.splitContentByH2 는 본문 길이 4,000자(UTF-16)를 경계로 2분할/3분할을 가르고
//     조각 사이에 GuideMidAd·InArticleAd 를 넣는다. 이 배치에서 본문을 고친 글마다 수정 전(4ef59a4b) 분할 수·분할 H2 순번·
//     4,000자 경계의 어느 쪽인지·읽기 시간(히어로의 'N분 분량', 광고 위)을 고정한다. 본문을 다시 고칠 때 값이 바뀌면
//     광고 위치가 움직인 것이므로 문구 폭부터 다시 맞출 것(값을 그냥 갱신하지 말 것).
//     2026-10-03 예외: 아래 개인회생·상환조건 교정으로 늘어난 읽기 시간은 사유를 기록해 갱신. 분할 수·H2는 유지한다.
//     분할 함수 복제본의 원본 일치는 guideSpec.test.ts 의 SPLIT_FN_SHA 드리프트 가드가 맡는다.
// (2) 사실 고정: 정정한 수치가 옛 값으로 되돌아가지 않게 글별로 핀을 둔다(공식 출처는 각 커밋 메시지).
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { UNEMPLOYMENT_BENEFIT_2026, unemploymentDailyLowerBound } from "@/config/unemploymentBenefit";
import { MINIMUM_WAGE_2027 } from "@/config/minimumWage";
import { guideSupplements } from "@/lib/guides/supplements";
import { extractGuideFaqs } from "@/lib/guideFaq";

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

// 수정 전(4ef59a4b) 실측값. 2026-10-03 법령·계산 조건 정정에 따른 읽기 시간 변경은 아래에 명시한다.
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
  // 2026-10-03: 상환 가정·현행 개인회생 요건·공식 출처 보강. 광고 분할은 유지하고 읽기 시간만 3분으로 갱신.
  "personal-loan-vs-debt-consolidation": { segs: 2, splitH2: [3], side: "under", readingMinutes: 3 },
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

/**
 * [슬러그, 있어야 할 문자열[], 없어야 할 문자열[]] — 항목 ID 는 주석.
 * 2026-09-29 광고 위치 스윕(1,123폭) 수정: 광고 위 정정은 어절마다 폭이 같은 문구(한글 음절 수·기호 동일)로만 남기고,
 * 같은 폭을 못 만든 정정(숫자 글리프 폭이 다른 경우)은 프로덕션 문구로 되돌려 광고 아래 보강(supplements-2026-10.ts)으로 옮겼다.
 * 되돌린 줄은 여기서 핀을 빼고 (3) 보강 핀에서 고정한다 — 본문 정정 문구로 다시 바꾸려면 스윕부터 통과시킬 것.
 */
const FACT_PINS: Array<[string, string[], string[]]> = [
  // GB-02·MISSED-gb-3 비과세 근로소득 요건 (국세청 cntntsId=7867, 소득세법 시행령 §12·§17) — 사업주 고용보험률·생산직 260만원은 보강으로
  // 2026-11-02 FF-3: 생산직 기준은 본문에서 고친다 — 숫자만 바꾼 월급 260만원은 9/29 스윕에서 광고를 내려 되돌렸고, 이번에는 더 짧은
  // 월정액 260만원 이하 생산직은 …(시행령 §17① 시행 2026.10.1: 월정액급여 260만원 이하 + 직전 총급여 3,700만원 이하, ②1 연 240만원).
  // 국세청 cntntsId=7867 은 아직 210만원·3천만원(옛 기준)이라 그쪽으로 되돌리지 말 것. 직전 총급여 요건은 넣으면 줄이 늘어 본문에 없다.
  ["social-insurance-reduction", ["2023년부터 한도가", "본인 차량으로 업무수행을 하고", "R&D 직군 일부만이", "임차해 제공 시 비과세", "월세를 현금으로 주면 1원도 과세 대상", "자녀 학자금은 과세 대상", "<p>월정액 260만원 이하 생산직은 야간·휴일 근로수당 연 240만원까지 비과세.</p>"], ["출퇴근하는 경우", "R&D 직군 연구원은", "외국인 임직원의 경우", "210만원"]],
  // GB-03·MISSED-gb-4·MISSED-gb-6a 노란우산·가산세·간이과세 납부면제·부가세 주기 — 분납 기한·가산세율(종합소득세)·노란우산(N잡)은 보강으로
  ["comprehensive-income-tax-2026", ["연 600만원까지 소득공제"], ["연 500만원까지"]],
  ["n-job-tax-2026", ["납부지연 연 8.0%", "4,800만원(부가세 납부 기준) 미만 매출 시 간이과세자 납부 면제", "분기별로 납부나 신고(1·4·7·10월)", "구글애드센스·유튜브는"], ["9.125%", "4,800만원(부가세 면세 한도)", "쿠팡파트너스·유튜브는 부가세 면제"]],
  // GB-04 가상자산 과세 법정 시행·연간 손익 통산·의제취득가액 (국세청 cntntsId=238935) — 날짜·취득가 기준은 보강으로
  ["crypto-tax-2026", ["법으로 시행 확정되었으며 추가 유예 없었습니다", "재매수(연간 손익통산 제도)", "손익 통산이 허용되므로 연간 손익을 합쳐 과세", "의제 취득가 적용되니 미리 매도 불요"], ["World-Crossing", "추가 유예되었거나", "시행 직전에 매도하면 과세 대상 아님"]],
  // GB-19 조정대상지역 2년 거주 요건(유예된 적 없음) + 양도세 계산기 링크
  ["real-estate-capital-gains-2026", ["(조정대상지역은 2년 거주 추가 요건 적용 대상)", "href=\"/calc/real-estate-capital-gains-quick\">양도세 계산기</a>"], ["한시 유예", "acquisition-tax\">취득세 계산기"]],
  // GB-20 장례비 공제 1천만원 한도 + 봉안시설 5백만원 별도 (상증세법 시행령 §9②)
  ["inheritance-tax-strategy", ["1천만원 (봉안시설은 5백만원 별도)"], ["영수증 5천만원까지 인정"]],
  // GB-05·MISSED-gb-1 고용24·임금체불 2개월(시행규칙 별표 2)·재취업활동 — 1일 상·하한·함정 목록은 보강으로
  ["unemployment-insurance-2026", ["재취업 활동 (인정 때마다 증명)", "고용24 회원가입", "임금 체불 (1년 내 2개월+)"], ["적극적 구직 활동", "워크넷 회원가입", "임금 체불 (3개월+)"]],
  // GB-21 온투업 이자 원천징수 14%(지방세 포함 15.4%) — 표의 세금 행만 본문, 실 세율·실 수익률은 보강으로
  ["p2p-investment-risk", ["<td>이자 소득세 15.4%</td><td>-1.5%</td>"], ["이자 소득세 27.5%"]],
  // GB-23·MISSED-gb-2 휴직 = 직장가입자·고용보험 자격 유지 — 자동차·예금 문구와 납입고지 유예는 보강으로
  ["career-break-financial-plan", ["퇴사자라면 → 지역가입자 자동 전환", "3. 고용보험 — 휴직 중 유지", "휴직 중에도 상실 X. 회사 측 휴직 사실 신고.", "소득·재산이 많으면 월 80만 부담"], ["직장가입자 → 지역가입자 자동 전환", "휴직 중에는 가입 X", "자가·자동차 있으면"]],
  // GB-24: 월말 적립 50만원 × 30년, 월 수익률 7%/12의 미래가치는 약 6.1억원. 10억 목표를 계산 결과처럼 쓰지 않는다.
  ["retirement-planning-30s", ["30세부터 월 50만원을 30년 동안 연 7%", "약 6.1억원", "세금·수수료·물가를 제외한 예시", "13.2% 또는 16.5%", "실제 절세액"], ["60세 10억 가능", "60세 10억 목표", "평균 월 90~150만", "연 약 148만 환급"]],
  // GB-25 국내상장 ETF 중 국내주식형만 매매차익 비과세(소득세법 시행령 §26의2)
  ["stock-investment-beginner-2026", ["국내주식형만 차익 비과세, 나머지 15.4%"], ["매매차익 비과세, 분배금 15.4% 분리과세"]],
  // GB-26 평균 환급액을 통계처럼 쓰지 않는다 — 환급 한도(결정세액)는 보강으로
  ["tax-refund-mistakes-2026", ["챙기면 가령 50만"], ["평균 50만"]],
  // GB-09: 2027년 이후 매도 가능 주식에 2026년 세율을 확정 적용하지 않는다. 거래세·농특세 구분과 매도 시점 확인을 유지.
  ["samsung-special-bonus-q3-preview-2027", ["매도 시점에 적용되는 증권거래세·농어촌특별세와 수수료는 별도로 확인"], ["매도 시 증권거래세 0.20%가 붙습니다"]],
  // GB-27 2024 실적분 PS 기본급 1,500%(psData PS_HISTORY) · GB-10 ISA 연 2,000만원은 납입 한도
  ["sk-hynix-wage-2026", ["2024년 실적분 월급의 1500% 수준(기본급 기준)", "ISA 납입액 한도(연 2,000만원)"], ["연봉의 1000%", "ISA 비과세 한도(연 2,000만원)"]],
  // GB-10 ISA 연 2,000만원·총 1억은 납입 한도(조특법 §91의18), 소액주주 상장주식 장내 매도 차익은 일반 계좌도 비과세
  ["sk-hynix-employee-bonus-stock", ["ISA 계좌의 납입액 한도(연 2,000만원, 누적 1억)", "매매차익을 절세하며 가져갈 수"], ["비과세 한도(연 2,000만원, 누적 1억)", "매매차익을 비과세로"]],
  ["chip-stock-tax-guide", ["매도하면 대주주만이 과세 대상이 될 수 있습니다", "누적 1억까지 납입액 한도가 있습니다", "ISA 밖에서 매매해도 매매차익은 비과세입니다", "(배당용)"], ["양도소득세 과세 대상이 될 수 있습니다", "ISA 안에서 매매하면 매매차익이 비과세", "(최우선)"]],
  // GB-11 재직 중 스톡옵션 행사이익·RSU 는 근로소득(소득세법 시행령 §38①17호)
  ["samsung-employee-rsu-stock", ["베스팅 기간 후 부여. 근로소득세 적용."], ["부여. 양도소득세 적용."]],
  ["stock-options-rsu-valuation", ["행사 시 근로소득 과세", "1년 보유 후 매도가 절세 효과 없음(대주주 예외)"], ["행사 시 차익에 양도세", "절세 효과 있음(국가별 다름)"]],
  // GB-35 출처 없는 인상률을 통계처럼 쓰지 않는다(추정 금지 원칙)
  ["job-change-salary-jump-2026", ["직군별 이직 통념 인상률 (2026 기준)", "<th>이직 인상률 통념</th>"], ["이직 평균 인상률"]],
  // GB-13: 공식 FOMC 성명(2026-09-16)의 결정일·인상폭·목표범위를 고정하고, 이후 전망과 구분.
  ["us-treasury-bond", ["2026년 9월 16일 FOMC 성명", "0.25%p 인상해 3.75~4.00%", "이후 인상·동결·인하 전망은 별개", "https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm"], ["8월 현재까지", "인하 재개와 인상 리스크가 공존"]],
  // GB-22: 이자만 비교한 예시와 현행 채무자회생법 §579·§611, 금융위 대환대출 신용점수 안내를 구분한다.
  ["personal-loan-vs-debt-consolidation", ["연225만원 차이", "원금 상환액·수수료·잔액 변화는 별도", "무담보채무 10억원·담보채무 15억원 이하", "원칙 3년 이내", "특별한 사정이 있으면 5년 이내", "대환 여부만으로 일률 판단 불가"], ["채무 5억 이하", "신청 시점 -5~10점", "신용점수 800점+", "즉시 월 20~30만원 절약"]],
  // GB-14 2026-01-01 시행 조특법 §104의27 고배당기업 배당소득 분리과세 특례 — 특례 설명은 보강(GB-15)
  ["financial-income-tax", ["초과하면 원칙상 종합과세 대상입니다"], ["무조건 종합과세 대상"]],
  // GB-18 연납 신청은 1·3·6·9월 — 10월 1일부터 틀리는 '올해 안이라면 9월' 문장 제거
  ["car-tax-annual-payment", ["그해 마지막엔 9월 16~30일 연납으로"], ["올해 안이라면 9월 16~30일"]],
  // GB-28 앵커와 목적지 일치(/year-end-tax-2026 은 종합소득세 페이지, 연말정산 허브는 /year-end-tax-2027) · noindex 링크 제거
  ["donation-tax-credit", ["href=\"/year-end-tax-2027\">2026 연말정산 가이드"], ["href=\"/year-end-tax-2026\""]],
  ["semiconductor-performance-bonus-tax", ["href=\"/year-end-tax-2027\" class=\"text-primary underline\">2026 연말정산 종합 가이드"], ["href=\"/year-end-tax-2026\""]],
  ["sk-hynix-employee-bonus-stock", ["href=\"/salary-db/sk-hynix\" class=\"text-primary underline\">SK하이닉스 직급별 연봉 DB"], ["href=\"/salary-db\" class=\"text-primary underline\">SK하이닉스"]],
  ["interview-questions-100", ["href=\"/\">연봉 계산기"], ["href=\"/calc\">연봉 계산기"]],
  ["mbti-work-style", ["href=\"/\">연봉 계산기"], ["href=\"/calc\">연봉 계산기"]],
  ["semiconductor-cycle-2026", ["href=\"/calc/portfolio-allocation\""], ["href=\"/dashboard\""]],
];

/**
 * (3) 광고 아래 보강 섹션(supplements-2026-10.ts) — [슬러그, 있어야 할 문자열[], FAQPage 항목 수(본문+보강)].
 * FAQ 수 0 은 '자주 묻는 질문' 이 없거나 2개 미만이라 FAQPage 를 내보내지 않는다는 뜻.
 */
// 2026-10-05 재기반: 10/4 배포(352451886)가 본문에서 같은 사실을 먼저 고친 moved-below 보강 4편(GB-01 individual-vs-corporate-tax,
// GB-22 personal-loan-vs-debt-consolidation, GB-13 us-treasury-bond, GB-09 samsung-special-bonus-q3-preview-2027)과
// retirement-planning-30s 의 국민연금 평균액 줄은 뺐다 — 아래 REVERTED_BODY_PINS(보강이 가리키는 옛 본문 문구) 가드가 그 본문 문구가
// 사라졌음을 잡아 중복을 드러냈다. 해당 본문 정정은 위 FACT_PINS(10/4 문구)가 고정한다.
const SUPPLEMENT_PINS: Array<[string, string[], number]> = [
  // GB-06 구직급여 상·하한(정본 상수)·고용24·실업크레딧 + 계산기 링크
  [
    "unemployment-insurance-2026",
    [
      `${UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER.toLocaleString("en-US")}원 (2025년 이직자 66,000원)`,
      `${unemploymentDailyLowerBound().toLocaleString("en-US")}원 (최저시급 × 80% × 8시간)`,
      'href="/unemployment-benefit"',
      "구직급여 수급자가(재산·소득 요건 충족 시) 신청하면",
      // 스윕 수정(moved-below, GB-05·MISSED-gb-1) — 본문 리드·금액 문단·함정 2줄·자기계발 li 는 프로덕션 문구
      "일급 한도 6만·최저 약 90만은 옛 기준",
      "금액과 관계없이 실업인정 때 신고해야 합니다",
      "과정과 대상에 따라 달라 자부담이 생길 수 있습니다",
    ],
    2,
  ],
  // GB-08 2027 최저임금 확정 비교표(정본 상수) + 2027 페이지·주휴수당 링크
  [
    "minimum-wage-impact-2026",
    [`시급 ${MINIMUM_WAGE_2027.hourly.toLocaleString("en-US")}원으로 확정`, 'href="/minimum-wage-2027"', 'href="/weekly-holiday-allowance-2026"'],
    0,
  ],
  // GB-15 고배당기업 배당 분리과세 특례(조특법 §104의27, 2026-01-01) — 세율 표는 조문 확인 전이라 없음
  ["financial-income-tax", ["조세특례제한법 제104조의27", 'href="/calc/dividend-tax-quick"'], 2],
  // GB-17 10·15 대책 토지거래허가구역 + 2년 실거주 의무 + 무주택자 실거주 유예(국토부 2026-05-12) — 출처는 공식(정책브리핑)만 (본문 FAQ 3개는 그대로)
  ["gap-investment-risk", ["서울 전역과 경기 12곳", "2년 실거주 의무", 'href="/calc/ltv-quick"', "2026년 5월 12일부터 계속 무주택인 사람", "정책브리핑 2025-10-15"], 3],
  // GB-33 비과세 근로소득 한도·요건 표(국세청 cntntsId=7867, 소득세법 시행령 §12·§17) — 출산지원금 행 포함
  //   + 사업주 고용보험 1.15~1.75% 구성(고용보험료징수법 시행령 §12). 2026-11-02 재착지: 본문이 48dabb2dc(회사 1.15~1.75%)·FF-3
  //   497310359(월정액 260만원)로 이미 고쳐져 '본문의 … 아니라' 정정 문장은 빼고 10월 끝판의 구성 설명 한 문장만 둔다(아래 (3-2) 가드).
  ["social-insurance-reduction", ["직전 연도 총급여 3,700만원 이하", "자녀 1명당 월 20만원", "<td>출산지원금</td><td>전액</td>", "고용보험 회사 부담 1.15~1.75%는 실업급여 0.9%에"], 0],
  // GB-32 연말정산 기둥 글 가시 FAQ 4개(FAQPage) + 2027 허브·13가지 조건 글 링크
  ["year-end-tax-2026", ['href="/year-end-tax-2027"', 'href="/guides/year-end-tax-13-tips-2026"'], 4],
  // ── 2026-09-29 광고 위치 스윕 수정 — 광고 위 같은 폭을 못 만든 정정(moved-below). FAQ 헤더 없음(본문 FAQPage 항목 수 그대로) ──
  // GB-23·MISSED-gb-2 휴직 = 직장가입자 유지·납입고지 유예, 지역 자동차 보험료 폐지(2024-02)
  ["career-break-financial-plan", ["납입고지 유예를 신청할 수 있습니다", "2024년 2월분부터 폐지", "예금 원금은 재산에 들어가지 않습니다"], 0],
  // GB-03 분납 기한 7월 31일(성실신고확인 대상 8월 31일)·납부지연가산세 하루 0.022%
  ["comprehensive-income-tax-2026", ["5월 31일 기한이면 7월 31일까지", "하루 0.022%(연 약 8.0%)"], 0],
  // GB-04 2027-01-01 이후 양도·대여분·2026-12-31 시가와 취득가액 중 큰 금액
  ["crypto-tax-2026", ["2027년 1월 1일 이후 양도·대여하는 가상자산부터", "2026년 12월 31일 시가와 실제 취득가액 중 큰 금액"], 0],
  // GB-12 4,000만·500만은 2024년 개정안, 2026 개편안은 생산적금융 ISA·일반 ISA 한도 유지
  ["isa-account-guide", ["2024년 세법개정안의 수치", "일반 ISA 납입 한도(연 2,000만원·총 1억원)를 그대로", "생산적금융 ISA"], 0],
  // GB-03·MISSED-gb-4·6a 노란우산 600만원(2025 납입분)·간이과세 1억 400만원·개인 예정고지
  ["n-job-tax-2026", ["연 600만원까지 소득공제됩니다", "1억 400만원 미만", "4월·10월에는 세무서가 고지한 예정고지 세액"], 0],
  // GB-21 온투업 이자 14% + 지방세 1.4% = 15.4%, 실 수익률 재계산
  ["p2p-investment-risk", ["소득세 14%와 지방소득세 1.4%를 더해 15.4%", "약 -3.5%~+2.5%"], 0],
  // GB-24 월 50만 → 약 6.1억, 10억은 월 약 82만원 · 국민연금 평균액은 공식 통계 아님
  ["retirement-planning-30s", ["월 50만원은 약 6.1억원", "월 약 82만원이 필요합니다"], 0],
  // GB-09 코스피 증권거래세 0.05% + 농특세 0.15% = 0.20% (2026-01-02 시행) — 본문 FAQ 6개는 그대로
  ["samsung-bonus-treasury-stock-15-trillion-2026", ["더해 0.20%가 붙습니다", "본문 매도 시 세금 항목과 세금 FAQ의 0.15%"], 6],
  ["samsung-vs-sk-hynix-stock-bonus-2026", ["더해 0.20%가 붙습니다", "본문 매도 이후 항목의 0.15%"], 6],
  ["sk-hynix-ps-cash-vs-stock-scenarios-2026", ["더해 0.20%가 붙습니다", "정리 문단·세금 FAQ의 0.15%"], 6],
  // MISSED-gb-7 HBM4 개발 완료·양산 체제 구축(2025-09)
  ["sk-hynix-stock-2026", ["2025년 9월 세계 최초로 HBM4 개발을 마치고 양산 체제를 구축"], 0],
  // GB-26 환급은 결정세액을 넘지 않는다 · 50만·100만원은 예시
  ["tax-refund-mistakes-2026", ["원래 내야 할 세금(결정세액)보다 클 수 없습니다", "예시일 뿐 평균 통계가 아니며"], 0],
];

/** 스윕 수정 가드 — 광고 위 본문에 되돌린 프로덕션 문구가 그대로 있어야 보강 문장(본문의 …은 옛 기준)이 맞는다 */
const REVERTED_BODY_PINS: Array<[string, string[]]> = [
  ["comprehensive-income-tax-2026", ["2회 분할, 8월 31일까지", "연 9.125% (일할 계산)"]],
  ["isa-account-guide", ["납입 한도를 연 4,000만원·총 2억원으로"]],
  ["n-job-tax-2026", ["연 500만원까지 소득공제"]],
  ["p2p-investment-risk", ["실 세율 27.5%."]],
  ["samsung-bonus-treasury-stock-15-trillion-2026", ["농특세 포함 0.15%", "증권거래세 0.15%가 붙습니다"]],
  ["samsung-vs-sk-hynix-stock-bonus-2026", ["농특세 포함 0.15%"]],
  ["sk-hynix-ps-cash-vs-stock-scenarios-2026", ["농특세 포함 0.15%", "거래세 0.15% 외에", "증권거래세 0.15%, 배당은"]],
  ["sk-hynix-stock-2026", ["2026년 하반기 양산을 목표로"]],
  ["unemployment-insurance-2026", ["일급 한도 6만", "최저 약 90만", "매 4주 4회 이상", "월 50만 초과 부정 수급", "수강료 100% 지원"]],
];

describe("(3-1) 스윕 수정 — 보강이 가리키는 본문 문구", () => {
  for (const [slug, must] of REVERTED_BODY_PINS) {
    it(`${slug}`, () => {
      const html = body(slug);
      for (const s of must) expect(html, `본문에 있어야 함(보강이 옛 기준이라고 가리키는 문구): ${s}`).toContain(s);
    });
  }
});

// 2026-11-02 재착지: 10월 사슬 뒤 본문이 먼저 고쳐진 글은 보강이 '본문의 …' 정정 문장을 쓰지 않는다.
describe("(3-2) 본문이 이미 고쳐진 글 — 보강에 본문 정정 문장 없음", () => {
  it("social-insurance-reduction: 본문은 회사 1.15~1.75%·월정액 260만원(48dabb2dc·FF-3), 보강은 구성 설명만", () => {
    const b = body("social-insurance-reduction");
    expect(b).toContain("(회사 1.15~1.75%)");
    expect(b).toContain("월정액 260만원 이하 생산직");
    const html = guideSupplements["social-insurance-reduction"];
    expect(html).not.toContain("본문의 월급 210만원");
    expect(html).not.toContain("본문 4대보험 목록의 고용보험 회사 부담");
  });
});

describe("(3) guidesb 보강 섹션(광고 아래) 등록·FAQ", () => {
  for (const [slug, must, faqCount] of SUPPLEMENT_PINS) {
    it(`${slug}`, () => {
      const html = guideSupplements[slug];
      expect(html, `보강 없음: ${slug}`).toBeTruthy();
      for (const s of must) expect(html, `있어야 함: ${s}`).toContain(s);
      expect(extractGuideFaqs(body(slug) + html)).toHaveLength(faqCount);
    });
  }
});

describe("(2) guidesb 사실 정정 고정", () => {
  for (const [slug, must, mustNot] of FACT_PINS) {
    it(`${slug}`, () => {
      const html = body(slug);
      for (const s of must) expect(html, `있어야 함: ${s}`).toContain(s);
      for (const s of mustNot) expect(html, `없어야 함: ${s}`).not.toContain(s);
    });
  }
});

it("노후 적립표의 자산·인출 예시는 본문에 명시한 월말 적립 가정과 일치한다", () => {
  const html = body("retirement-planning-30s");
  const rows = [...html.matchAll(/<tr><td>(\d+)세<\/td><td>(\d+)만<\/td><td>약 ([\d.]+)억<\/td><td>(\d+)만<\/td><\/tr>/g)];
  expect(rows).toHaveLength(5);
  for (const [, startAge, monthlyMan, assetEok, withdrawalMan] of rows) {
    const monthlyRate = 0.07 / 12;
    const months = (60 - Number(startAge)) * 12;
    const asset = Number(monthlyMan) * 10_000 * ((1 + monthlyRate) ** months - 1) / monthlyRate;
    expect(Number(assetEok)).toBe(Number((asset / 100_000_000).toFixed(1)));
    expect(Number(withdrawalMan)).toBe(Math.round(asset * 0.035 / 12 / 10_000));
  }
});
