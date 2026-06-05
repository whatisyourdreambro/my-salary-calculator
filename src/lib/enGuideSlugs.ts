// src/lib/enGuideSlugs.ts
//
// 영어 가이드 슬러그 목록 (본문 없는 경량 상수).
//
// LocaleSwitcher 가 전역 Header 에 포함되어 모든 페이지 클라이언트 번들에 실린다.
// 거기서 guidesData(가이드 본문 ~888KB 포함)를 import 하면 전 페이지 First Load 에
// 본문이 끌려온다. LocaleSwitcher 는 "이 슬러그의 영어판이 있는가"만 확인하므로,
// 본문과 분리된 이 슬러그 상수만 import 한다. (전 사이트 번들 경량화)
//
// ⚠️ 영어 가이드를 추가/삭제하면 이 목록도 함께 갱신할 것.
//    출처: src/lib/guides/stock-deepdive-en.ts, src/lib/guides/hot-keywords-deepdive-en.ts
//    (sitemap.ts·/en/guides 는 enGuides 전체를 그대로 쓰므로 이 상수와 무관하게 정상 동작)
export const EN_GUIDE_SLUGS: ReadonlySet<string> = new Set([
  // stock-deepdive-en.ts
  "samsung-electronics-stock-2026",
  "samsung-employee-rsu-stock",
  "sk-hynix-stock-2026",
  "sk-hynix-employee-bonus-stock",
  "semiconductor-cycle-2026",
  "samsung-vs-hynix-employee-comparison",
  "chip-stock-tax-guide",
  "kospi-leader-stock-strategy",
  // hot-keywords-deepdive-en.ts
  "earned-income-credit-2026",
  "four-major-insurance-complete",
  "year-end-tax-deductions-guide",
  "health-insurance-2026-guide",
  "loan-types-comparison-2026",
]);
