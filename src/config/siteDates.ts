// src/config/siteDates.ts
//
// 사이트 신선도(freshness) 기준일 단일 소스 — sitemap lastmod · WebApplication JSON-LD
// dateModified · 회사 lastUpdated 파생 규칙이 전부 여기서 파생된다.
//
// 유지보수 규칙 (L18' 위생 조건 "dateModified 는 실제 갱신 커밋일만"):
//  - 매 배포마다 new Date() 로 today 를 찍으면 Google freshness 신호가 무의미해져
//    순위 변동성이 커진다. 마지막 "실질 콘텐츠 갱신" 날짜를 고정해 두고 진짜 갱신
//    배포 때만 손으로 올린다.
//  - sitemap.ts 와 structuredData.ts(webApplicationLd) 가 같은 상수를 써야 두 신호가
//    어긋나지 않는다 — scripts/verify-sitemap.ts 가 불일치 시 [WARN](비차단).
//
// ⚠️ 이 모듈은 클라이언트 번들에도 실릴 수 있다(structuredData 경유) — 상수만 두고
//    회사 데이터·DART 배열 import 금지.

/**
 * 정적 라우트 + 공식/데이터 기반 동적 URL(연봉·직업·산업·지역·용어·Q&A·환산표·
 * 비교·계산기) 공통 lastModified 기준일. 회사 페이지는 company.lastUpdated 우선,
 * 값이 없을 때만 이 기준일로 폴백.
 * 2026-07-16: 2027 최저임금·세법개정안 신설 + 재산세·국민연금·대출 페이지 시즌 갱신
 */
export const STATIC_LAST_MODIFIED = new Date("2026-07-16");

/** STATIC_LAST_MODIFIED 의 ISO 날짜(YYYY-MM-DD) — JSON-LD dateModified 용 */
export const STATIC_LAST_MODIFIED_ISO = STATIC_LAST_MODIFIED.toISOString().slice(0, 10);

/**
 * 회사 페이지 실수령액 표(CompanySalaryTable.estimateNetSalary)가 마지막으로 실제
 * 재계산된 날 — CompanyRepository.enrich 가 lastUpdated = max(데이터일, DART 주입일,
 * 이 값) 으로 파생할 때 쓰는 하한.
 *
 * 법정 적용일은 2026-07-01(국민연금 기준소득월액 상한 637만→659만·하한 41만) 이지만
 * 코드에 날짜 게이트가 없어 사이트 값이 실제로 바뀐 날은 반영 커밋 e0604ae(2026-07-06).
 * "실제 갱신 커밋일만" 원칙에 따라 커밋일을 쓴다. 다음 갱신 체크포인트: 매년 7월
 * 연금 상한 개정 반영 커밋 시 이 값을 그 커밋일로 올린다(자의적 상향 금지 —
 * 실수령액 열에 영향 없는 배포는 포함 금지).
 */
export const TAX_TABLE_EFFECTIVE_DATE = "2026-07-06";
