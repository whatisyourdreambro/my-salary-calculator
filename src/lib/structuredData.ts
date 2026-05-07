// src/lib/structuredData.ts
//
// JSON-LD 구조화 데이터 빌더.
// schema.org 표준 준수, Google Rich Results 호환.
// 각 함수는 <script type="application/ld+json"> 안에 들어갈
// JavaScript 객체를 반환. JsonLd 컴포넌트로 주입.

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
 name: ORGANIZATION_NAME,
 url: SITE_URL,
 logo: ORGANIZATION_LOGO,
 sameAs: [],
 };
}

// ─────────────────────────────────────────────────────────────
// WebSite — 사이트 검색 박스 활성화 (Google sitelinks search box)
// ─────────────────────────────────────────────────────────────
export function webSiteLd() {
 return {
 "@context": "https://schema.org",
 "@type": "WebSite",
 name: SITE_NAME,
 url: SITE_URL,
 potentialAction: {
 "@type": "SearchAction",
 target: {
 "@type": "EntryPoint",
 urlTemplate: `${SITE_URL}/salary/{search_term_string}`,
 },
 "query-input": "required name=search_term_string",
 },
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
}) {
 return {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 name: tool.name,
 description: tool.description,
 url: tool.url.startsWith("http") ? tool.url : `${SITE_URL}${tool.url}`,
 applicationCategory: "FinanceApplication",
 operatingSystem: "Web",
 offers: {
 "@type": "Offer",
 price: "0",
 priceCurrency: "KRW",
 },
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
 calc: "100가지 계산기",
 salary: "연봉 표",
 "salary-db": "회사 연봉 DB",
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
 dashboard: "대시보드",
 "fire-calculator": "FIRE 계산기",
 "year-end-tax": "연말정산",
 "year-end-tax-2026": "연말정산 2026",
 "home-loan": "주택담보대출",
 "car-loan": "자동차 대출",
 "mbti-salary": "MBTI 연봉",
};

export interface AutoBreadcrumbOptions {
 /** 마지막 단계의 한국어 명 (없으면 마지막 segment 사용) */
 leafName?: string;
 /** 중간 단계 명 강제 override (예: { "calc": "100가지 계산기" }) */
 overrides?: Record<string, string>;
}

/**
 * 경로를 받아 BreadcrumbList JSON-LD 자동 생성.
 * 예: /tools/finance/severance → [홈, 금융 도구, 금융, 퇴직금 계산기]
 */
export function autoBreadcrumbLd(path: string, options: AutoBreadcrumbOptions = {}) {
 const segments = path.split("/").filter(Boolean);
 const crumbs: Breadcrumb[] = [{ name: "홈", path: "/" }];

 let acc = "";
 segments.forEach((seg, idx) => {
 acc += `/${seg}`;
 const isLast = idx === segments.length - 1;
 const override = options.overrides?.[seg];
 const label =
 override ||
 (isLast && options.leafName) ||
 SEGMENT_LABELS[seg] ||
 decodeURIComponent(seg).replace(/-/g, " ");
 crumbs.push({ name: label, path: acc });
 });

 return breadcrumbLd(crumbs);
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
}) {
 const url = `${SITE_URL}/guides/${article.slug}`;
 const imageUrl = article.image
 ? article.image.startsWith("http")
 ? article.image
 : `${SITE_URL}${article.image}`
 : `${SITE_URL}/api/og?type=guide&slug=${article.slug}`;

 return {
 "@context": "https://schema.org",
 "@type": "Article",
 headline: article.title,
 description: article.description,
 image: imageUrl,
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
// ─────────────────────────────────────────────────────────────
export function companyOrganizationLd(company: {
 name: string;
 url?: string;
 industry?: string;
 description?: string;
}) {
 return {
 "@context": "https://schema.org",
 "@type": "Organization",
 name: company.name,
 ...(company.url ? { url: company.url } : {}),
 ...(company.description ? { description: company.description } : {}),
 ...(company.industry ? { industry: company.industry } : {}),
 };
}
