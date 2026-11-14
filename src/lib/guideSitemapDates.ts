// src/lib/guideSitemapDates.ts
//
// 사이트맵 lastmod 전용 가이드 날짜 (lens-meta-F01, 운영자 승인 2026-11-13 '권장대로').
// 규칙: 마지막 광고 아래 보강(guideSupplements)만 바뀌어 화면 '수정' 칩이 없는(또는 칩 날짜를 바꾸지 않는) 가이드는
//   사이트맵 lastmod 만 그 보강을 실제로 고친 날로 올린다. 화면 날짜(히어로 칩·'마지막 내용 수정' 상자)·OG modifiedTime·
//   Article dateModified 는 getGuideContentDate 그대로다 — 칩이 새로 생기면 GuideMidAd 위 UI 가 늘고, 칩 숫자가 바뀌면
//   광고 위 폭 실측이 필요해서다(광고 위 UI 추가 금지). 11/1 '네 곳 같은 날짜' 규칙의 유일한 예외가 이 표다.
// 왜: IndexNow(게시 8단계 cloudIndexNowPlan)는 사이트맵 (loc, lastmod) 차이만 알린다. 날짜가 그대로면 보강한 글이
//   네이버·빙에 알려지지 않는다(lens-crawl-F01 의 같은 틈). rss.xml 도 이 날짜를 쓴다(피드 전문 = 본문 + 보강).
// 행 규칙: 값은 그 보강을 실제로 고친 날(KST, YYYY-MM-DD). 미래 날짜·게시일 선반영 금지. 링크 한 줄만 바뀐 보강은 넣지 않는다
//   (etf-beginner·basic-pension-65-2026·health-insurance-2026-guide·retirement-planning·public-company-salary-ranking-2026).
//   getGuideContentDate 보다 이르거나 같으면 효과가 없다(max). 뒤 묶음(RL-08·RL-15·RL-21·RL-23 등)이 칩 없는 가이드의 보강을
//   바꾸면 그 묶음의 원장일로 행을 더한다. 서버 전용(클라이언트 번들에 싣지 않는다).
// 테스트: src/lib/__tests__/guideSitemapDates.test.ts
import { RELAND_R1_PUSH } from "@/config/relandR1Push";
import { getGuideContentDate } from "./guideContentRevisions";

export const GUIDE_SITEMAP_ONLY_REVISED: Readonly<Record<string, string>> = {
  // ── R1 재착지(RL-01·RL-02 광고 아래 보강 추가 23편, 원장일 RELAND_R1_PUSH) ──
  "financial-income-tax": RELAND_R1_PUSH,
  "gap-investment-risk": RELAND_R1_PUSH,
  "n-job-tax-2026": RELAND_R1_PUSH,
  "crypto-tax-2026": RELAND_R1_PUSH,
  "social-insurance-reduction": RELAND_R1_PUSH,
  "rent-deposit-protection": RELAND_R1_PUSH,
  "unemployment-insurance-2026": RELAND_R1_PUSH,
  "p2p-investment-risk": RELAND_R1_PUSH,
  "tax-refund-mistakes-2026": RELAND_R1_PUSH,
  "vat-filing-2026": RELAND_R1_PUSH,
  "sk-hynix-stock-2026": RELAND_R1_PUSH,
  "newlywed-tax-benefits-2026": RELAND_R1_PUSH,
  "side-hustle-tax-2026": RELAND_R1_PUSH,
  "unemployment-benefits-complete": RELAND_R1_PUSH,
  "parental-leave-complete-guide": RELAND_R1_PUSH,
  "earned-income-credit-2026": RELAND_R1_PUSH,
  "national-pension-strategy-2026": RELAND_R1_PUSH,
  "four-major-insurance-complete": RELAND_R1_PUSH,
  "parental-leave-6plus6-2026": RELAND_R1_PUSH,
  "sk-hynix-ps-forecast-2027": RELAND_R1_PUSH,
  "samsung-medison-salary-2026": RELAND_R1_PUSH,
  "hl-mando-salary-2026": RELAND_R1_PUSH,
  "sk-hynix-ps-cash-vs-stock-scenarios-2026": RELAND_R1_PUSH,
  // ── R1 재착지에서 기존 보강 문장을 바꾼 3편(supplements-2026-10.ts, 원장일 RELAND_R1_PUSH) ──
  "samsung-opi-forecast-2027": RELAND_R1_PUSH,
  "samsung-bonus-treasury-stock-15-trillion-2026": RELAND_R1_PUSH,
  "samsung-vs-sk-hynix-stock-bonus-2026": RELAND_R1_PUSH,
  // ── 이미 운영 중인 보강의 마지막 실질 수정일(git 기록으로 확인) ──
  // 9/27 db933b147: SK하이닉스 9/16 가결 결과 보강(H2 '2026년 9월 27일 기준'). 그 뒤 끼워 넣는 psData 값 변화 없음.
  "sk-hynix-wage-2026": "2026-09-27",
  // 11/1 80dcc3138: 재원 표현을 'DS부문 영업이익의 10.5%'로 정정(공개 보도 기준). 11/2 05845980d 는 '성과금→성과급' 한 글자 표기라 날짜에 넣지 않는다.
  "samsung-wage-negotiation-2026": "2026-11-01",
  // 10/8 0d2242990·3980bb5b8: DS 특별성과급 세부안(10/7 보도) 보강과 같은 날 정정. 칩 날짜(9/26)는 그대로.
  "samsung-opi-tai-complete-2026": "2026-10-08",
  // 11/1 80dcc3138: '재원 기준' 줄 추가(DS부문 영업이익의 10.5%). 칩 날짜(10/3)는 그대로.
  "samsung-special-bonus-q3-preview-2027": "2026-11-01",
};

/** 사이트맵 lastmod·rss.xml pubDate 용 가이드 날짜 = max(getGuideContentDate, 사이트맵 전용 행). 화면·OG·Article 에는 쓰지 않는다. */
export function getGuideSitemapDate(guide: { slug: string; publishedDate: string; modifiedDate?: string }): string {
  const content = getGuideContentDate(guide);
  const row = GUIDE_SITEMAP_ONLY_REVISED[guide.slug];
  return row && row > content ? row : content;
}
