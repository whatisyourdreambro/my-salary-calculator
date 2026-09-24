// src/lib/structuredData.ts
//
// JSON-LD 구조화 데이터 빌더.
// schema.org 표준 준수, Google Rich Results 호환.
// 각 함수는 <script type="application/ld+json"> 안에 들어갈
// JavaScript 객체를 반환. JsonLd 컴포넌트로 주입.

import { STATIC_LAST_MODIFIED_ISO } from "@/config/siteDates";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const ORGANIZATION_NAME = "머니샐러리";
const ORGANIZATION_LOGO = `${SITE_URL}/logo-full.png`;

// ─────────────────────────────────────────────────────────────
// Organization — 사이트 운영 주체 정보 (전역 1회)
// ─────────────────────────────────────────────────────────────
export function organizationLd() {
 return {
 "@context": "https://schema.org",
 "@type": "Organization",
 // 사이트 운영 주체 노드 식별자 — 회사 페이지의 Organization(다른 회사)과 구분 (2026-09-25 B14 META-14)
 "@id": `${SITE_URL}/#organization`,
 name: ORGANIZATION_NAME,
 url: SITE_URL,
 logo: ORGANIZATION_LOGO,
 sameAs: [],
 };
}

// ─────────────────────────────────────────────────────────────
// WebSite — 사이트 아이덴티티만 선언.
// SearchAction(sitelinks search box)은 제거 — urlTemplate(/salary/{term})이
// 임의 검색어로 404를 유발했고, 구글이 사이트링크 검색박스를 은퇴시켜 실익 없음.
// ─────────────────────────────────────────────────────────────
export function webSiteLd() {
 return {
 "@context": "https://schema.org",
 "@type": "WebSite",
 name: SITE_NAME,
 alternateName: "Moneysalary",
 inLanguage: ["ko", "en"],
 url: SITE_URL,
 };
}

// ─────────────────────────────────────────────────────────────
// WebApplication — 메인 페이지/계산기 허브
// ─────────────────────────────────────────────────────────────
export function webApplicationLd() {
 return {
 "@context": "https://schema.org",
 "@type": "WebApplication",
 name: SITE_NAME,
 url: SITE_URL,
 description:
 "2026년 최신 세법 기준 연봉 실수령액 계산기. 4대보험, 소득세, 연말정산까지 직장인 필수 금융 도구.",
 applicationCategory: "FinanceApplication",
 operatingSystem: "Web",
 inLanguage: "ko",
 alternateName: "연봉 계산기",
 datePublished: "2024-12-01",
 // sitemap STATIC_LAST_MODIFIED 와 단일 상수 공유(src/config/siteDates.ts, 2026-09-05) —
 // 실질 콘텐츠 갱신 배포 때만 그 상수를 올린다(매 배포 today 금지). verify-sitemap 이 불일치 WARN.
 dateModified: STATIC_LAST_MODIFIED_ISO,
 offers: {
 "@type": "Offer",
 price: "0",
 priceCurrency: "KRW",
 },
 provider: {
 "@type": "Organization",
 name: ORGANIZATION_NAME,
 url: SITE_URL,
 },
 };
}

// ─────────────────────────────────────────────────────────────
// SoftwareApplication — 개별 계산기 페이지
// ─────────────────────────────────────────────────────────────
export function softwareApplicationLd(tool: {
 name: string;
 description: string;
 url: string;
 /** 주요 기능 목록 (선택) — 리치 결과 보강용 */
 featureList?: string[];
 inLanguage?: "ko" | "en";
 datePublished?: string;
 dateModified?: string;
}) {
 const absUrl = tool.url.startsWith("http") ? tool.url : `${SITE_URL}${tool.url}`;
 return {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "@id": `${absUrl}#software`,
 name: tool.name,
 description: tool.description,
 url: absUrl,
 applicationCategory: "FinanceApplication",
 operatingSystem: "Web",
 inLanguage: tool.inLanguage ?? "ko",
 offers: {
 "@type": "Offer",
 price: "0",
 priceCurrency: "KRW",
 },
 ...(tool.featureList?.length ? { featureList: tool.featureList } : {}),
 ...(tool.datePublished ? { datePublished: tool.datePublished } : {}),
 ...(tool.dateModified ? { dateModified: tool.dateModified } : {}),
 };
}

// ─────────────────────────────────────────────────────────────
// BreadcrumbList — 페이지 위계
// ─────────────────────────────────────────────────────────────
export interface Breadcrumb {
 name: string;
 path: string;
}

export function breadcrumbLd(crumbs: Breadcrumb[]) {
 return {
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 itemListElement: crumbs.map((crumb, index) => ({
 "@type": "ListItem",
 position: index + 1,
 name: crumb.name,
 item: `${SITE_URL}${crumb.path}`,
 })),
 };
}

// ─────────────────────────────────────────────────────────────
// 자동 Breadcrumb 빌더 — 경로만으로 위계 자동 생성
// 한국어 라벨링, 동적 라우트 자동 인식
// ─────────────────────────────────────────────────────────────
const SEGMENT_LABELS: Record<string, string> = {
 "": "홈",
 calc: "계산기 모음",
 salary: "연봉 표",
 "salary-db": "회사 연봉 DB",
 insights: "데이터 리포트",
 guides: "금융 가이드",
 tools: "금융 도구",
 finance: "금융",
 "real-estate": "부동산",
 date: "날짜",
 health: "건강",
 life: "생활",
 math: "수학",
 loan: "대출",
 deposit: "예적금",
 fun: "재미있는 도구",
 company: "회사",
 compare: "회사 비교",
 simulator: "시뮬레이터",
 table: "연봉 테이블",
 "2026": "2026년",
 annual: "연간",
 monthly: "월별",
 weekly: "주간",
 hourly: "시간당",
 pro: "프리미엄",
 en: "English",
 about: "사이트 소개",
 privacy: "개인정보처리방침",
 terms: "이용약관",
 qna: "Q&A",
 tips: "절세 팁",
 glossary: "용어 사전",
 hub: "주제별 가이드",
 dashboard: "대시보드",
 "fire-calculator": "FIRE 계산기",
 "year-end-tax": "연말정산",
 "year-end-tax-2026": "연말정산 2026",
 "home-loan": "주택담보대출",
 "car-loan": "자동차 대출",
 "mbti-salary": "MBTI 연봉",
};

/**
 * 페이지(page.tsx)가 없는 중간 경로 — 라이브에서 404 다(2026-09-24 실측).
 * BreadcrumbList 에 404 URL 을 싣지 않도록 "마지막이 아닌" 단계에서만 건너뛴다.
 * 예: /table/2026/annual → [홈, 2026 연봉 실수령액 표] (종전 [홈, /table, /table/2026, …])
 * 새 허브 페이지를 만들면 여기서 빼야 다시 단계로 나온다 — breadcrumbRoutes.test 가
 * 방출되는 중간 경로가 전부 실제 라우트인지 검사한다 (2026-09-25 B14 RT-06/META-08).
 */
const NON_PAGE_PATHS: ReadonlySet<string> = new Set([
 "/table",
 "/table/2026",
 "/table/2027",
 "/tools/date",
 "/tools/health",
 "/pro",
]);

/**
 * leafName 을 넘기지 않는 공용 layout(AutoBreadcrumb) 페이지의 마지막 단계 한국어 명 — 경로 전체 키.
 * 라벨 출처는 각 페이지 layout/page 의 metadata title 앞부분 (fun/layout.tsx 는 광고 파일이라
 * 손대지 않고 여기서 맵으로 처리). 2026-07-06 영문 슬러그 leaf("bmi quick") 제거와 같은 취지
 * (2026-09-25 B14 META-09).
 */
const LEAF_LABELS: Record<string, string> = {
 "/fun/asset-allocator": "자산 배분 마스터",
 "/fun/escape-plan": "노비 탈출 계산기",
 "/fun/financial-mbti": "금융 MBTI 테스트",
 "/fun/flappy": "플래피 샐러리맨",
 "/fun/fortune": "2026년 신년운세",
 "/fun/iq-test": "멘사급 IQ 테스트",
 "/fun/lunch-roulette": "직장인 점심 메뉴 룰렛",
 "/fun/meme-coin": "밈코인 모의투자 시뮬레이션",
 "/fun/random-draw": "랜덤 추첨",
 "/fun/rank": "연봉 분포 시뮬레이터",
 "/fun/reincarnation": "인생 2회차 시뮬레이터",
 "/fun/rich-dna-test": "부자 DNA 테스트",
 "/fun/salary-battle": "연봉 배틀",
 "/fun/salary-rank": "내 연봉 순위 계산기",
 "/fun/salary-slip": "가상 월급 명세서 만들기",
 "/fun/spending-test": "소비 성향 테스트",
 "/fun/tetris": "직장인 테트리스",
 "/fun/weekend-duty": "주말 당직 게임",
 "/fun/what-to-buy": "플렉스(FLEX) 계산기",
 "/fun/worldcup": "기업 이상형 월드컵",
 "/pro/career-planner": "커리어 패스 시뮬레이터",
};

export interface AutoBreadcrumbOptions {
 /** 마지막 단계의 한국어 명 (없으면 LEAF_LABELS·SEGMENT_LABELS, 그래도 없으면 마지막 단계 생략) */
 leafName?: string;
 /** 중간 단계 명 강제 override (예: { "calc": "계산기 모음" }) */
 overrides?: Record<string, string>;
}

/**
 * 경로를 받아 breadcrumb 단계 배열 생성 (순수 함수).
 * 시각적 Breadcrumbs 컴포넌트와 JSON-LD가 동일 데이터를 공유하도록 분리.
 * 예: /tools/finance/severance → [홈, 금융 도구, 금융, 퇴직금 계산기]
 *
 * - NON_PAGE_PATHS 의 중간 단계는 건너뛴다 (404 URL 방출 금지).
 * - 마지막 단계에 한국어 라벨이 없으면 영문 슬러그("career planner")를 싣지 않고 생략한다.
 */
export function buildBreadcrumbTrail(
 path: string,
 options: AutoBreadcrumbOptions = {}
): Breadcrumb[] {
 const segments = path.split("/").filter(Boolean);
 const crumbs: Breadcrumb[] = [{ name: "홈", path: "/" }];

 let acc = "";
 segments.forEach((seg, idx) => {
 acc += `/${seg}`;
 const isLast = idx === segments.length - 1;
 if (!isLast && NON_PAGE_PATHS.has(acc)) return;
 const override = options.overrides?.[seg];
 // 잘못된 % 인코딩 세그먼트에서 decodeURIComponent가 URIError를 던지면 원본 seg 사용
 let decoded: string;
 try {
 decoded = decodeURIComponent(seg);
 } catch {
 decoded = seg;
 }
 const label = isLast
 ? override || options.leafName || LEAF_LABELS[acc] || SEGMENT_LABELS[seg]
 : override || SEGMENT_LABELS[seg] || decoded.replace(/-/g, " ");
 if (!label) {
 // 라벨 없는 leaf 는 생략 — 그러면 BreadcrumbList 가 현재 페이지가 아닌 상위 URL(또는 홈)에서
 // 끝난다. 새 라우트가 조용히 이 분기로 떨어지지 않도록 개발 서버에서만 경고한다.
 if (isLast && process.env.NODE_ENV === "development") {
 console.warn(
 `[breadcrumb] ${path}: 마지막 단계 한국어 라벨 없음 — leafName 을 넘기거나 LEAF_LABELS 에 추가하세요.`
 );
 }
 return;
 }
 crumbs.push({ name: label, path: acc });
 });

 return crumbs;
}

/**
 * 경로를 받아 BreadcrumbList JSON-LD 자동 생성.
 */
export function autoBreadcrumbLd(path: string, options: AutoBreadcrumbOptions = {}) {
 return breadcrumbLd(buildBreadcrumbTrail(path, options));
}

// ─────────────────────────────────────────────────────────────
// FAQPage — Q&A 콘텐츠
// ─────────────────────────────────────────────────────────────
export interface FaqItem {
 question: string;
 answer: string;
}

export function faqLd(items: FaqItem[]) {
 return {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 mainEntity: items.map((item) => ({
 "@type": "Question",
 name: item.question,
 acceptedAnswer: {
 "@type": "Answer",
 text: item.answer,
 },
 })),
 };
}

// ─────────────────────────────────────────────────────────────
// Article — 가이드 글
// ─────────────────────────────────────────────────────────────
export function articleLd(article: {
 title: string;
 description: string;
 slug: string;
 publishedDate: string;
 modifiedDate?: string;
 image?: string;
 author?: string;
 /** ISO 639 언어코드, 기본 ko-KR. 영문 가이드는 "en"으로 전달. */
 inLanguage?: string;
 /** 영문 가이드일 경우 /en/guides/{slug} 경로로 빌드 */
 lang?: "ko" | "en";
 /**
  * 기본 /guides/{slug} 경로 대신 사용할 실제 경로 override.
  * 시즌 페이지 등 guides 밖 라우트에서 필수 (예: "/tax-reform-2026").
  * 미지정 시 기존 동작(/guides/{slug}) 유지.
  */
 url?: string;
}) {
 const lang = article.lang ?? "ko";
 const url = article.url
 ? article.url.startsWith("http")
 ? article.url
 : `${SITE_URL}${article.url}`
 : lang === "en"
 ? `${SITE_URL}/en/guides/${article.slug}`
 : `${SITE_URL}/guides/${article.slug}`;
 // 기본 OG는 title 파라미터 필수 — /api/og type=guide 분기가 slug를 무시함 (2026-07-06 정정)
 const imageUrl = article.image
 ? article.image.startsWith("http")
 ? article.image
 : `${SITE_URL}${article.image}`
 : `${SITE_URL}/api/og?type=guide&title=${encodeURIComponent(article.title)}`;

 return {
 "@context": "https://schema.org",
 "@type": "Article",
 headline: article.title,
 description: article.description,
 image: imageUrl,
 inLanguage: article.inLanguage ?? (lang === "en" ? "en" : "ko-KR"),
 datePublished: new Date(article.publishedDate).toISOString(),
 dateModified: new Date(
 article.modifiedDate || article.publishedDate
 ).toISOString(),
 author: {
 "@type": "Organization",
 name: article.author || ORGANIZATION_NAME,
 url: SITE_URL,
 },
 publisher: {
 "@type": "Organization",
 name: ORGANIZATION_NAME,
 logo: {
 "@type": "ImageObject",
 url: ORGANIZATION_LOGO,
 },
 },
 mainEntityOfPage: {
 "@type": "WebPage",
 "@id": url,
 },
 };
}

// ─────────────────────────────────────────────────────────────
// HowTo — 단계형 가이드 (예: "연말정산 환급받는 법")
// ─────────────────────────────────────────────────────────────
export interface HowToStep {
 name: string;
 text: string;
 url?: string;
}

export function howToLd(howTo: {
 name: string;
 description: string;
 steps: HowToStep[];
 totalTime?: string;
 image?: string;
}) {
 return {
 "@context": "https://schema.org",
 "@type": "HowTo",
 name: howTo.name,
 description: howTo.description,
 ...(howTo.totalTime ? { totalTime: howTo.totalTime } : {}),
 ...(howTo.image
 ? { image: howTo.image.startsWith("http") ? howTo.image : `${SITE_URL}${howTo.image}` }
 : {}),
 step: howTo.steps.map((step, index) => ({
 "@type": "HowToStep",
 position: index + 1,
 name: step.name,
 text: step.text,
 ...(step.url ? { url: step.url } : {}),
 })),
 };
}

// ─────────────────────────────────────────────────────────────
// Speakable — 음성 검색(Google Assistant) 노출용
// FAQPage answer 또는 핵심 문단을 음성 발화 대상으로 지정
// ─────────────────────────────────────────────────────────────
export function speakableLd(opts: {
  url: string;
  /** 음성 발화 대상 CSS 셀렉터 배열 (예: ["#tldr", ".faq-answer"]) */
  cssSelectors?: string[];
  /** XPath 셀렉터 (선택) */
  xpaths?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    speakable: {
      "@type": "SpeakableSpecification",
      ...(opts.cssSelectors?.length ? { cssSelector: opts.cssSelectors } : {}),
      ...(opts.xpaths?.length ? { xpath: opts.xpaths } : {}),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Person/Organization (회사 페이지) - 회사 정보 LD
// 2026-09-25 B14 META-14: schema.org Organization 에 없는 `industry`(JobPosting 속성)와,
// 회사 설명이 아닌 페이지 요약 문구("○○ 평균 연봉, 워라밸, 복지 정보")를 넣던
// description 을 뺐다. 회사 <title>·meta description 과는 무관 (JSON-LD 만).
// ─────────────────────────────────────────────────────────────
export function companyOrganizationLd(company: {
 name: string;
 url?: string;
 /** 별칭(옛 사명·표기 변형) — schema.org alternateName */
 alternateName?: string[];
}) {
 return {
 "@context": "https://schema.org",
 "@type": "Organization",
 name: company.name,
 ...(company.alternateName && company.alternateName.length > 0
 ? { alternateName: company.alternateName }
 : {}),
 ...(company.url ? { url: company.url } : {}),
 };
}

// ─────────────────────────────────────────────────────────────
// ItemList — 순위/목록 (업종별 회사 연봉 순위 등)
// ─────────────────────────────────────────────────────────────
export interface ItemListEntry {
 name: string;
 url: string;
 /** 미지정 시 배열 순서대로 1부터 자동 부여 */
 position?: number;
}

export function itemListLd(opts: { name?: string; items: ItemListEntry[] }) {
 return {
 "@context": "https://schema.org",
 "@type": "ItemList",
 ...(opts.name ? { name: opts.name } : {}),
 numberOfItems: opts.items.length,
 itemListElement: opts.items.map((item, index) => ({
 "@type": "ListItem",
 position: item.position ?? index + 1,
 name: item.name,
 url: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
 })),
 };
}

// ─────────────────────────────────────────────────────────────
// Occupation — 직업 페이지 (Google estimated salary 리치결과)
// estimatedSalary는 MonetaryAmountDistribution — median 또는
// percentile10/25/75/90 중 최소 1개 필수. 값 단위: KRW(원).
// 수치는 반드시 데이터에 실존하는 값만 전달 — 임의 수치 금지.
// ─────────────────────────────────────────────────────────────
export interface OccupationSalaryDistribution {
 /** 중위값, KRW(원) */
 median?: number;
 /** 하위 10%, KRW(원) */
 percentile10?: number;
 /** 하위 25%, KRW(원) */
 percentile25?: number;
 /** 상위 25%, KRW(원) */
 percentile75?: number;
 /** 상위 10%, KRW(원) */
 percentile90?: number;
}

export function occupationLd(opts: {
 /** 직업명 (예: "간호사") */
 name: string;
 description: string;
 /** 페이지 경로 또는 절대 URL — mainEntityOfPage로 주입 */
 url: string;
 /** 연봉 분포 — median·percentile 중 존재하는 값만 */
 estimatedSalary: OccupationSalaryDistribution;
 /** 통계상 직종명이 페이지 직업명과 다를 때 (schema.org alternateName) */
 alternateName?: string;
}) {
 const url = opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`;
 const dist = opts.estimatedSalary;
 const distribution: Record<string, unknown> = {
 "@type": "MonetaryAmountDistribution",
 name: "base",
 currency: "KRW",
 duration: "P1Y", // 연봉 기준 (ISO 8601)
 ...(dist.median !== undefined ? { median: dist.median } : {}),
 ...(dist.percentile10 !== undefined ? { percentile10: dist.percentile10 } : {}),
 ...(dist.percentile25 !== undefined ? { percentile25: dist.percentile25 } : {}),
 ...(dist.percentile75 !== undefined ? { percentile75: dist.percentile75 } : {}),
 ...(dist.percentile90 !== undefined ? { percentile90: dist.percentile90 } : {}),
 };

 return {
 "@context": "https://schema.org",
 "@type": "Occupation",
 name: opts.name,
 ...(opts.alternateName ? { alternateName: opts.alternateName } : {}),
 description: opts.description,
 mainEntityOfPage: {
 "@type": "WebPage",
 "@id": url,
 },
 estimatedSalary: [distribution],
 occupationLocation: [
 {
 "@type": "Country",
 name: "대한민국",
 },
 ],
 };
}

// ─────────────────────────────────────────────────────────────
// Dataset — 연봉 데이터셋. dateModified로 신선도(freshness) 신호 전달.
// 회사 페이지·업종 페이지가 보유한 직급별 연봉 데이터를 schema.org Dataset로 표현.
// ─────────────────────────────────────────────────────────────
export function datasetLd(opts: {
 name: string;
 description: string;
 url: string;
 /** ISO 날짜 — 데이터 갱신일 */
 dateModified?: string;
 /** ISO 날짜 — 데이터 최초 발행일 */
 datePublished?: string;
 keywords?: string[];
 /** 근거 자료(공시 원문 등) — schema.org citation: CreativeWork {name,url}. 출처 URL 이 실재할 때만 전달 */
 citation?: { name: string; url: string };
 /** 파생 원본 URL — schema.org isBasedOn (예: DART 사업보고서 rcpNo 링크) */
 isBasedOn?: string;
 /** 내려받기 표현 — schema.org distribution: DataDownload[] (CSV/JSON 엔드포인트가 생길 때 전달) */
 distribution?: { encodingFormat: string; contentUrl: string }[];
 /** 라이선스 URL 또는 문구 — schema.org license */
 license?: string;
 /** 시간 범위 — schema.org temporalCoverage (예: "2025", "2024/2026") */
 temporalCoverage?: string;
}) {
 const toIso = (d: string) => {
 const parsed = new Date(d);
 return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
 };
 const modified = opts.dateModified ? toIso(opts.dateModified) : undefined;
 const published = opts.datePublished ? toIso(opts.datePublished) : undefined;

 return {
 "@context": "https://schema.org",
 "@type": "Dataset",
 name: opts.name,
 description: opts.description,
 url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
 ...(modified ? { dateModified: modified } : {}),
 ...(published ? { datePublished: published } : {}),
 ...(opts.keywords && opts.keywords.length > 0 ? { keywords: opts.keywords } : {}),
 ...(opts.citation
 ? { citation: { "@type": "CreativeWork", name: opts.citation.name, url: opts.citation.url } }
 : {}),
 ...(opts.isBasedOn ? { isBasedOn: opts.isBasedOn } : {}),
 ...(opts.distribution && opts.distribution.length > 0
 ? {
 distribution: opts.distribution.map((d) => ({
 "@type": "DataDownload",
 encodingFormat: d.encodingFormat,
 contentUrl: d.contentUrl.startsWith("http") ? d.contentUrl : `${SITE_URL}${d.contentUrl}`,
 })),
 }
 : {}),
 ...(opts.license ? { license: opts.license } : {}),
 ...(opts.temporalCoverage ? { temporalCoverage: opts.temporalCoverage } : {}),
 isAccessibleForFree: true,
 inLanguage: "ko-KR",
 creator: {
 "@type": "Organization",
 name: ORGANIZATION_NAME,
 url: SITE_URL,
 },
 };
}
