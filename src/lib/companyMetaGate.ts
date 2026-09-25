// src/lib/companyMetaGate.ts
//
// L10'(승인⑧) 빌드 시점 게이트 + A4' 공시 카드·FAQ 출처 문구 표시 — 잎(leaf) 모듈 (2026-09-25).
//
// 켜짐 스위치 하나(COMPANY_META_DISCLOSED_DATE, src/config/siteDates.ts)가 아래를 한꺼번에 켠다:
//  - 회사 meta description 개편(seo.ts buildCompanyMetadata)
//  - 대상 회사 페이지 수정일 승격(pageModified.ts companyPageModified → sitemap lastmod·RSS pubDate)
//  - A4' 공시 카드 출처 줄 라벨(CompanyDisclosedSalary disclosedSourceLabel)
//  - A4' DART 주입 출처 문구 꼬리(' — OpenDART 수집') 생략 — 카드 출처 줄과 FAQ '공시 인용 출처'
//    (companySalaryBasis buildCompanySalaryFaq → 화면 FAQ·FAQPage JSON-LD)
// 그 전 빌드는 네 가지 모두 종전 출력과 바이트 동일하다(companyMetaDescription.test.ts 가
// bd68d860 출력 고정본과 대조).
//
// 꼬리는 데이터(CompanyRepository buildDartDisclosed 의 source)에 그대로 두고 표시할 때만 뺀다 —
// CompanyRepository 는 클라이언트 번들에도 들어갈 수 있어 날짜 게이트를 거기 두지 않는다. 다른
// 소비처(인사이트 리포트 등)는 종전 문구 그대로다.
//
// ⚠️ siteDates 외 import 금지 — companySalaryBasis 가 이 모듈을 쓰고, companyMetaDisclosed 가
//    companySalaryBasis 를 쓰므로 게이트를 companyMetaDisclosed 에 두면 순환 import 가 된다.

import { COMPANY_META_DISCLOSED_DATE } from "@/config/siteDates";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** "YYYY-MM-DD"(KST 날짜) → 그날 KST 자정의 UTC ms. 머신 타임존과 무관 */
function kstMidnightMs(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d) - KST_OFFSET_MS;
}

/** COMPANY_META_DISCLOSED_DATE 의 KST 자정(UTC ms) */
export const COMPANY_META_DISCLOSED_FROM_MS = kstMidnightMs(COMPANY_META_DISCLOSED_DATE);

/**
 * L10'·A4' 가 켜졌는가 — 빌드(렌더) 시점 KST 날짜 기준.
 * 회사 페이지·sitemap·rss-companies.xml 은 정적 프리렌더라 호출 시각 = 빌드 시각이다.
 */
export function isCompanyMetaDisclosedLive(now: Date = new Date()): boolean {
  return now.getTime() >= COMPANY_META_DISCLOSED_FROM_MS;
}

/** DART 자동 주입 출처 문구의 꼬리 — CompanyRepository buildDartDisclosed 의 source 끝과 같아야 한다 */
export const DART_INJECTED_SOURCE_TAIL = " — OpenDART 수집";

/**
 * 공시 카드 출처 줄·FAQ '공시 인용 출처' 에 보일 출처 문구.
 * 게이트가 켜진 빌드에서만 DART 주입 꼬리를 뺀다(A4' — 카드 라벨 '출처(공시 원문):' 가 길어진 만큼
 * 줄 길이를 되돌려 광고 위 카드 높이 불변). 꺼진 빌드·꼬리 없는 문구(수기 큐레이션)는 그대로.
 */
export function displayedDisclosedSource(
  source: string,
  live: boolean = isCompanyMetaDisclosedLive()
): string {
  return live && source.endsWith(DART_INJECTED_SOURCE_TAIL)
    ? source.slice(0, -DART_INJECTED_SOURCE_TAIL.length)
    : source;
}
