// src/lib/guideContentRevisions.relandR1.ts
//
// R1 재착지(운영자 2026-11-01 승인 7번 — RL-01 광고 아래 보강, RL-02 같은 폭 사실 정정)로 사실 문장이 바뀐 가이드 가운데
// 화면 날짜(히어로 '수정' 칩·하단 '마지막 내용 수정')까지 올리는 글의 본문 정정일. 지금은 쿠팡 야간 가이드 1편뿐이다.
// guideContentRevisions.ts 가 mergeLatest 로 합친다(상세 화면 날짜·OG·사이트맵 lastmod·Article dateModified 공통).
//
// 경과: R1 원장(d48f17877, 2026-11-03)은 이미 수정일(modifiedDate 2026-10-03)이 있어 '수정' 칩이 떠 있던 11편을 모두 이 표에 넣어
//   칩 숫자를 2026.10.03 → 2026.11.03 으로 바꿨다. 그때 이 주석은 '같은 10글자에 숫자가 더 좁아 광고 위 줄 수 불변'이라고 적었지만
//   글꼴 폭 계산이었고 실측은 달랐다. 2026-11-15 에 10편을 뺐다(ads-01·ads-05). 그 10편은 src/lib/guideSitemapDates.ts 의
//   사이트맵 전용 행으로 옮겨, 화면·OG·Article 날짜는 운영 값 2026-10-03 그대로이고 사이트맵 lastmod·rss.xml pubDate 만 2026-11-03 이다.
// 실측(2026-11-14·15, 광고 없는 로컬 QA 빌드 가드 스윕, 운영 내용 d2fcc8720 대비):
//   - 히어로 날짜 줄(GuidePageClient)은 줄바꿈되는 flex 줄이다: [발행·수정 날짜] · [N분 분량] · 공유 버튼(44px) · 즐겨찾기 버튼(44px).
//   - 새 날짜는 사이트 글꼴에서 2~3px 좁다. 그만큼 화면 폭 440~445px 에서 44px 공유 버튼이 첫 줄로 올라올 자리가 생겨
//     첫 줄 높이가 글자 높이 20px → 44px 가 되었고, 제목 아래 광고가 모두 24px 내려갔다
//     (10편 — 수화 후 5칸, 첫 화면 7칸 전부. 그 밖의 잰 폭에서는 아래로 0px).
//   - 즉 날짜가 좁아진다고 줄이 낮아지지 않는다. 더 큰 요소가 윗줄로 올라와 줄이 높아질 수 있다.
// 규칙: 이미 떠 있는 '수정' 날짜의 숫자를 바꾸는 것은 광고 위 변경이다. 칩 있는 글을 이 표(와 다른 guideContentRevisions.*.ts 표)에
//   넣으려면 게시 전에 화면 폭 320~460px 를 1px 단위로, 수화 후와 첫 화면(수화 전) 둘 다 가드 스윕으로 재서 광고 아래 이동이
//   0 이어야 한다. 글꼴 폭 계산은 실측을 대신하지 못한다. 갱신이 광고 아래에만 있거나 스윕에서 한 곳이라도 내려가면 기본은
//   사이트맵 전용 표(guideSitemapDates.ts — lens-meta-F01, 운영자 승인 2026-11-13)다.
// 넣지 않은 글: 수정일이 없는 글(넣으면 GuideMidAd 위에 새 칩이 생긴다 — 광고 위 UI 추가 금지, metaFactFixes20261013.test 의 4편 포함),
//   링크 한 줄만 받은 글(health-insurance-2026-guide·retirement-planning — 링크 줄은 날짜를 올리지 않는다),
//   칩 숫자가 바뀌면 광고가 내려가는 10편(위 경과): career-break-financial-plan·comprehensive-income-tax-2026·
//   first-home-2026-strategy·isa-account-guide·kai-salary-2026·minimum-wage-impact-2026·performance-pay-complete-2026·
//   retirement-planning-30s·us-treasury-bond·year-end-tax-2026.
// 서버 전용(클라이언트 번들에 싣지 않는다). 가드: src/lib/__tests__/relandR1Ledger.test.ts
import { RELAND_R1_PUSH } from "@/config/relandR1Push";

export const GUIDE_CONTENT_REVISED_RELAND_R1: Readonly<Record<string, string>> = {
  // RL-02 제목·TL;DR·본문 주휴수당 209시간 재계산(월 336만원) + RL-01 일용근로 세금 보강.
  // 광고 위 제목·TL;DR·본문을 실제로 고친 글이라 2026-11-03 이 화면에 보일 실제 수정일이다. 가드 스윕 B(2026-11-14·15)에서
  // 제목 아래 광고가 모두(수화 후 5칸, 첫 화면 7칸) 잰 모든 폭에서 위로만 움직였다(−32~−160px, 아래 이동 0): 수화 후는
  // 320~460px 1px 단위와 464~1440px 8px 단위 264폭, 첫 화면(수화 전)은 표준 8폭(320·360·375·390·412·768·1024·1440)만 쟀다.
  "coupang-fulfillment-night-pay-2026": RELAND_R1_PUSH,
};
