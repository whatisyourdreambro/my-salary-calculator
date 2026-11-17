// src/lib/guideSitemapDates.ts
//
// 사이트맵 lastmod 전용 가이드 날짜 (lens-meta-F01, 운영자 승인 2026-11-13 '권장대로').
// 규칙: 마지막 광고 아래 보강(guideSupplements)만 바뀌어 화면 '수정' 칩이 없는(또는 칩 날짜를 바꾸지 않는) 가이드는
//   사이트맵 lastmod 만 그 보강을 실제로 고친 날로 올린다. 화면 날짜(히어로 칩·'마지막 내용 수정' 상자)·OG modifiedTime·
//   Article dateModified 는 getGuideContentDate 그대로다 — 칩이 새로 생기면 GuideMidAd 위 UI 가 늘고, 칩 숫자가 바뀌면
//   광고 위 폭 실측이 필요해서다(광고 위 UI 추가 금지). 11/1 '네 곳 같은 날짜' 규칙의 유일한 예외가 이 표다.
// ★ 칩 숫자 규칙(2026-11-15, ads-01·ads-05): 이미 떠 있는 '수정' 날짜의 숫자를 바꾸는 것은 광고 위 변경이다.
//   실측: R1 원장(d48f17877)이 칩 있는 가이드 11편의 날짜를 2026.10.03 → 2026.11.03 으로 바꾸자, 그 가운데 10편에서 화면 폭
//   440~445px 일 때 제목 아래 광고가 모두 24px 내려갔다. 히어로 날짜 줄은 줄바꿈되는 flex 줄이고, 날짜가 2~3px 좁아지자 44px
//   공유 버튼이 첫 줄로 올라와 그 줄이 20px → 44px 가 되었기 때문이다(2026-11-14·15 광고 없는 QA 빌드 가드 스윕,
//   기록 docs/ad-experiments.md 2026-11-15 절). 그래서:
//   ① 갱신이 광고 아래에만 있으면 칩이 있든 없든 화면 날짜는 건드리지 않고 이 표에 행을 더하는 것이 기본이다.
//   ② 화면 날짜를 올리려면(guideContentRevisions.*.ts 표) 게시 전에 화면 폭 320~460px 를 1px 단위로, 수화 후와 첫 화면(수화 전)
//     둘 다 가드 스윕으로 재서 광고 아래 이동이 0 이어야 한다. 한 곳이라도 내려가면 그 글도 이 표가 기본이다.
//     글꼴 폭 계산('같은 글자 수에 더 좁은 숫자')은 실측을 대신하지 못한다.
// ★ 칩 없는 글의 본문 정정(운영자 결정 2026-11-17 10번, DEFER 질문 '화면은 그대로 두고 검색엔진용 날짜만 고친 날로'):
//   ③ 화면에 '수정' 칩이 없는 글(modifiedDate 없음·정정일 표에 없음)의 본문(광고 위 같은 폭 이하 정정)을 고치면, 칩을 새로 만들지
//     않고(GuideMidAd 위 새 UI 금지) 이 표에 그 본문을 실제로 고친 날(KST, git 기록의 커밋일)로 행을 더한다 — 보강이 없어도 된다.
//     칩이 없으니 화면·OG·Article 날짜는 발행일 그대로이고 사이트맵 lastmod·rss.xml pubDate 만 바뀌어 IndexNow 가 알린다.
//     보강 없는 행은 테스트의 이름 붙인 목록(CHIPLESS_BODY_ROWS, 이유 20자 이상)에 있어야 하고, 아직 알리지 않은 정정에만 쓴다
//     (오늘 날짜로 옛 정정을 덮거나 게시일·미래 날짜를 쓰지 않는다). 칩이 있는 글은 ① 그대로(NO_SUPPLEMENT_ROWS).
// 왜: IndexNow(게시 8단계 cloudIndexNowPlan)는 사이트맵 (loc, lastmod) 차이만 알린다. 날짜가 그대로면 보강한 글이
//   네이버·빙에 알려지지 않는다(lens-crawl-F01 의 같은 틈). rss.xml 도 이 날짜를 쓴다(피드 전문 = 본문 + 보강).
// 행 규칙: 값은 그 보강(또는 화면 날짜를 올리지 못한 광고 위 같은 폭 정정, 또는 ③ 칩 없는 글의 본문 정정)을 실제로 고친 날(KST, YYYY-MM-DD). 미래 날짜·게시일
//   선반영 금지. 링크 한 줄만 바뀐 보강은 넣지 않는다
//   (etf-beginner·basic-pension-65-2026·health-insurance-2026-guide·retirement-planning·public-company-salary-ranking-2026).
//   getGuideContentDate 보다 이르거나 같으면 효과가 없다(max). 뒤 묶음(RL-08·RL-15·RL-21·RL-23 등)이 가이드의 보강을 바꾸면
//   칩이 없는 글이든 있는 글이든 그 묶음의 원장일로 행을 더한다(위 ★ ①). 광고 아래 보강이 없는 행은 테스트의 이름 붙인 예외
//   목록(칩 있는 글 NO_SUPPLEMENT_ROWS · 칩 없는 글 본문 정정 CHIPLESS_BODY_ROWS)에 이유와 함께 있어야 한다. 서버 전용(클라이언트 번들에 싣지 않는다).
// 테스트: src/lib/__tests__/guideSitemapDates.test.ts · relandR1Ledger.test.ts(R1 10편의 두 날짜) ·
//   guideRevisionDates.test.ts(R1 10편의 실제 화면·OG·Article 출력) · rl08GuideFacts.test.ts(RL-08 칩 없는 5편의 ③ 행)
import { RELAND_R1_PUSH } from "@/config/relandR1Push";
import { getGuideContentDate } from "./guideContentRevisions";

/** RL-08 재착지(부동산 세금·복지 가이드 사실 정정) 가이드 문장·보강을 실제로 고친 날(KST) — 게시일이 아니다. */
export const RL08_EDIT_DAY = "2026-11-15";

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
  // RL-08 재착지(2026-11-15): 광고 위 IRP 문장 같은 폭 이하 정정(과세표준 → 세액공제). 칩 없는 글이라 화면 날짜는 그대로, 사이트맵만 그날로.
  "side-hustle-tax-2026": RL08_EDIT_DAY,
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
  // samsung-opi-forecast-2027 은 그 뒤 2026-11-15(facts-01)에 광고 아래 10/9 보강의 '확정 실적은 10월 29일 발표됩니다'(지난 일)를
  // 10월 29일 실적 발표 영업이익 107조 4,405억원으로 고쳐 행 값이 그날이다(RELAND_R1_PUSH 를 쓰지 않는다).
  "samsung-opi-forecast-2027": "2026-11-15",
  "samsung-bonus-treasury-stock-15-trillion-2026": RELAND_R1_PUSH,
  "samsung-vs-sk-hynix-stock-bonus-2026": RELAND_R1_PUSH,
  // ── R1 재착지에서 내용이 바뀐 '수정 칩 있는' 가이드 10편(원장일 RELAND_R1_PUSH) — 화면 날짜는 2026.10.03 그대로 (2026-11-15, ads-01) ──
  // R1 원장(d48f17877)은 이 10편을 본문 정정일 표(guideContentRevisions.relandR1.ts)에 넣어 칩을 2026.11.03 으로 바꿨고, 그 숫자
  // 변화가 화면 폭 440~445px 에서 제목 아래 광고를 24px 내렸다(머리 주석 ★). 운영자 상시 규칙(광고를 내리지 않는다)에 따라
  // 화면·OG·Article 날짜는 운영 값 2026-10-03 으로 두고, 사이트맵 lastmod·rss.xml pubDate 만 R1 내용을 실제로 고친 날로 유지한다.
  // 8편: 바뀐 것은 마지막 광고 아래 보강뿐이다 — lens-meta-F01(운영자 결정 2026-11-13) 그대로.
  "career-break-financial-plan": RELAND_R1_PUSH, // 휴직·퇴사 4대보험 차이(자동차 보험료 폐지 2024-02, 납입고지 유예)
  "comprehensive-income-tax-2026": RELAND_R1_PUSH, // 분납 기한·납부지연 가산세 하루 0.022%
  // first-home 은 R1 보강(디딤돌·보금자리론 조건표, 규제지역 LTV 40%) 뒤 RL-08(2026-11-15)에 광고 위 매수 가능액 공식 두 줄을
  // 같은 폭 이하로 정정했다 — 칩(2026.10.03)은 그대로 두고 사이트맵 날짜만 그날로 늦춘다(relandR1Ledger.test.ts 가 함께 고정).
  "first-home-2026-strategy": RL08_EDIT_DAY,
  "isa-account-guide": RELAND_R1_PUSH, // 2026 세제개편안 ISA 내용 정정(생산적금융 ISA)
  "minimum-wage-impact-2026": RELAND_R1_PUSH, // 2027 최저임금 10,700원 확정 표
  "performance-pay-complete-2026": RELAND_R1_PUSH, // SK하이닉스 PS 지급 방식·삼성 인상률·DS 특별경영성과급(보도 기준)
  "retirement-planning-30s": RELAND_R1_PUSH, // 10억 목표 월 적립액 재계산
  "year-end-tax-2026": RELAND_R1_PUSH, // 2026년 귀속 연말정산 FAQ 4문항
  // 2편: 광고 위 같은 폭 사실 정정(R1 RL-02)도 받았다. 이 2편도 화면 날짜는 2026.10.03 그대로다 — 광고를 내린 것은 정정 문장이
  // 아니라 날짜 숫자였고, 날짜 숫자 때문에 광고가 내려가도 되는지는 운영자에게 물은 적이 없다(질문 1 은 광고 위 틀린 사실 문장을
  // 제자리에서 고치는 경우이고, 수정 날짜는 그런 정정이 아니다). 화면 날짜를 올리려면 운영자 결정과 머리 주석 ★ ② 의 스윕이 먼저다.
  "kai-salary-2026": RELAND_R1_PUSH, // 본문 FY2025 공시 문장(같은 폭) + 광고 아래 방산 4사 DART 평균연봉 표
  "us-treasury-bond": RELAND_R1_PUSH, // TL;DR·카드·Article 설명 '금리 인하 시기' → '금리 변동 시기'(같은 폭) — 광고 아래 보강은 없다
  // ── 이미 운영 중인 보강의 마지막 실질 수정일(git 기록으로 확인) ──
  // 9/27 db933b147: SK하이닉스 9/16 가결 결과 보강(H2 '2026년 9월 27일 기준'). 그 뒤 끼워 넣는 psData 값 변화 없음.
  "sk-hynix-wage-2026": "2026-09-27",
  // 11/1 80dcc3138: 재원 표현을 'DS부문 영업이익의 10.5%'로 정정(공개 보도 기준). 11/2 05845980d 는 '성과금→성과급' 한 글자 표기라 날짜에 넣지 않는다.
  "samsung-wage-negotiation-2026": "2026-11-01",
  // 10/8 0d2242990·3980bb5b8: DS 특별성과급 세부안(10/7 보도) 보강과 같은 날 정정. 칩 날짜(9/26)는 그대로.
  "samsung-opi-tai-complete-2026": "2026-10-08",
  // 11/1 80dcc3138: '재원 기준' 줄 추가(DS부문 영업이익의 10.5%). 칩 날짜(10/3)는 그대로.
  "samsung-special-bonus-q3-preview-2027": "2026-11-01",
  // ── RL-08 재착지(10월 8b46a5e36·25bc65494 등, 2026-11-15): 광고 위 같은 폭 이하 사실 정정 + 마지막 광고 아래 새 보강(supplements-2026-11.ts) ──
  // 아동수당: 칩 없는 글 — 금액 줄 월 10만~12만원·부모급여 조건 정정, 지역별 금액 보강. 칩을 새로 만들지 않는다(GuideMidAd 위 UI).
  "child-support-100-2026": RL08_EDIT_DAY,
  // 에너지바우처: 칩(2026.10.03) 있는 글 — 금액·기간·대상·신청 기간 정정, 공식 원 단위 보강. 칩 숫자는 바꾸지 않는다(머리 주석 ★).
  "energy-voucher-2026": RL08_EDIT_DAY,
  // ── ③ 칩 없는 글의 본문 정정(운영자 결정 2026-11-17 10번) — 보강 없이 사이트맵 날짜만 본문을 고친 날로. 화면은 그대로(칩 없음) ──
  // 같은 묶음(RL-08, GUIDES8 2026-11-15 12:51~12:56 커밋)에서 광고 위 문장만 같은 폭 이하로 고친 칩 없는·보강 없는 5편. 11/15 에는
  // 보강 없는 칩 없는 글의 행이 금지라 날짜를 두지 못했다(DEFER 질문). 값은 그 본문을 실제로 고친 날 RL08_EDIT_DAY.
  "commercial-office-capital-gains-2026": RL08_EDIT_DAY, // 1c90ba05a 장기보유공제 20%·약 1.46억
  "lease-right-transfer-tax-2026": RL08_EDIT_DAY, // 266f6e806 2년 미만만 단기 40~50%, 3년 보유는 기본세율
  "child-gift-10year-rule-2026": RL08_EDIT_DAY, // c11f56d41 신고기한 증여월 말일부터 3개월
  "rental-business-prop-tax-exclusion-2026": RL08_EDIT_DAY, // ffcfbd57b 10년 장기·6년 단기, 종부세 산출 318만원
  "minimum-wage-2026": RL08_EDIT_DAY, // 3406a00b1 월급제 유급 시간 연 2,508시간(주휴 포함)
  // 홈택스 연말정산 미리보기 활용법: 46d56278d(2026-11-13 08:10 KST) 개통 미정 문장 → 국세청 운영 기간 10월 28일~12월 18일(같은 길이 이하).
  // 칩 없는 글이라 그날 정정이 검색엔진에 알려지지 않았다(n1 게시 뒤 네이버 수동 요청 목록에만 있었다).
  "hometax-year-end-preview-2026": "2026-11-13",
};

/** 사이트맵 lastmod·rss.xml pubDate 용 가이드 날짜 = max(getGuideContentDate, 사이트맵 전용 행). 화면·OG·Article 에는 쓰지 않는다. */
export function getGuideSitemapDate(guide: { slug: string; publishedDate: string; modifiedDate?: string }): string {
  const content = getGuideContentDate(guide);
  const row = GUIDE_SITEMAP_ONLY_REVISED[guide.slug];
  return row && row > content ? row : content;
}
