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
 * 회사 상세(/salary-db/[id]) FAQ 본문을 실제로 고친 날 — 회사 페이지 수정일
 * (src/lib/pageModified.ts companyPageModified)의 하한. sitemap lastmod 와
 * rss-companies.xml pubDate 가 같은 값을 쓴다.
 * 2026-09-10: 연봉 상세 계산 방법·회사 FAQ 문구 실질 수정 (sitemap.ts 에서 이동, 2026-09-25 B7).
 * 다음 갱신: 회사 페이지 본문·메타를 실제로 바꾸는 커밋과 같은 커밋에서만 올린다(일반 배포 자동 갱신 금지).
 */
export const COMPANY_FAQ_REVIEW_DATE = new Date("2026-09-10");

/**
 * L10'(승인⑧) 회사 meta description 개편 적용일 — KST 날짜(YYYY-MM-DD). 같은 값이 두 가지로 쓰인다.
 *  1) 켜짐 스위치: 이 날짜 KST 자정 이후 빌드에서만 새 description(공시 평균연봉 후미·'로그인 없이'·
 *     'N월 업데이트' 삭제)이 나간다. 그 전 빌드는 종전 description 그대로다 — 9/26 시즌 푸시처럼
 *     이 브랜치가 먼저 main 에 합쳐져 배포돼도 조기 노출·미래 lastmod 가 생기지 않는다
 *     (src/lib/companyMetaDisclosed.ts isCompanyMetaDisclosedLive, propertyTaxPeriod.ts 와 같은 빌드 시점 게이트).
 *  2) 대상 회사(공시 평균연봉을 description 에 싣는 약 160곳)의 페이지 수정일(sitemap lastmod·
 *     rss-companies.xml pubDate) — src/lib/pageModified.ts companyPageModified 가 max() 에 넣는다.
 *     데이터 lastUpdated(배지·Dataset dateModified)는 그대로 둔다 — 바뀐 것은 데이터가 아니라 메타 문구다.
 * 배포: 이 날짜 이후 첫 빌드(아무 main 푸시 또는 CF 'Retry deployment') → 운영자 Purge.
 * 첫 빌드가 10/5(RSS 제출) 뒤로 밀리면 이 값을 실제 배포일로 바꾼 뒤 배포한다 — 수정일은 실제 변경일에 가깝게.
 */
export const COMPANY_META_DISCLOSED_DATE = "2026-09-28";

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
 * 2026-09-25: A17(c95c183e) — TaxLogic.calculateSalary2026 월 소득세를 근로소득 간이세액표
 *   원천징수액으로 전환해 전 회사 실수령액 열(CompanySalaryTable·CompanyNarrative)이 다시 계산됐다.
 */
export const TAX_TABLE_EFFECTIVE_DATE = "2026-09-25";

/**
 * 봉급표 묶음(수익 추천 #2·#3) 배포일 — 2026 풀표 4쪽(/teacher-pay-2026·/police-pay-2026·
 * /firefighter-pay-2026·/civil-servant-pay-2026)의 수정일(메타·Article·Dataset), 2027 예상 3쪽
 * (/teacher-pay-2027·/police-pay-2027·/firefighter-pay-2027)의 발행일·수정일, sitemap.ts 의 해당 7개
 * lastModified 가 전부 이 값 하나를 쓴다.
 * ★ 배포 담당: 실제 배포일(KST, YYYY-MM-DD)로 이 한 줄만 바꿔 배포 커밋에 넣는다. 지금 값 2026-09-25 는
 *   준비일이라, 그대로 나가면 2027 페이지가 존재하기 전 날짜를 발행일로 보여 준다.
 * 12월 말 2027 확정표 입력 뒤 2027 페이지 수정일은 PAY_FULL_2027.checked 가 대신한다(payTablesFull2027.ts).
 */
export const PAY_TABLES_RELEASE_DATE = "2026-09-25";
