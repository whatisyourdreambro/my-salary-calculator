// src/lib/seo.ts
//
// 페이지 메타데이터 생성 헬퍼.
// canonical/openGraph/twitter/robots를 한 번에 일관되게 채워서
// 모든 페이지가 동일한 SEO 베이스라인을 갖도록 한다.

import type { Metadata } from "next";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const DEFAULT_OG_IMAGE = "/og-image.png";
const DEFAULT_KEYWORDS = [
 "연봉 계산기",
 "실수령액 계산기",
 "2026 연봉 계산기",
 "세후 월급 계산기",
 "4대보험 계산기",
];

export interface PageMetadataOptions {
 /** H1과 동일하거나 더 구체적인 제목. " | 머니샐러리"는 자동 추가됨 */
 title: string;
 /** 검색 결과에 노출되는 1~2문장 설명 (140~160자 권장) */
 description: string;
 /** "/home-loan" 같은 절대 경로 (앞에 / 포함) */
 path: string;
 /** OG 이미지 경로/URL. 미지정 시 자동 OG 라우트 또는 기본값 사용 */
 ogImage?: string;
 /** 추가 키워드 (기본 키워드와 합쳐짐) */
 keywords?: string[];
 /** noindex (개발/임시 페이지 등) */
 noIndex?: boolean;
 /** OG type override (default: "website", 가이드 글은 "article") */
 ogType?: "website" | "article";
 /** 발행일 (article 타입일 때) */
 publishedTime?: string;
 /** 수정일 */
 modifiedTime?: string;
 /**
 * 영문 카운터파트 경로. 지정 시 alternates.languages에 ko-KR/en/x-default 자동 적용.
 * 예: path="/salary-converter", enPath="/en/salary-converter"
 */
 enPath?: string;
 /**
 * 한국어 원본 경로 (영문 페이지에서 사용). 지정 시 hreflang 페어 자동 생성.
 * 예: path="/en/salary-converter", koPath="/salary-converter"
 */
 koPath?: string;
}

/**
 * 표준 페이지 메타데이터 생성.
 * 모든 page.tsx의 generateMetadata 또는 export const metadata에서 사용.
 */
export function buildPageMetadata(options: PageMetadataOptions): Metadata {
 const {
 title,
 description,
 path,
 ogImage,
 keywords = [],
 noIndex = false,
 ogType = "website",
 publishedTime,
 modifiedTime,
 enPath,
 koPath,
 } = options;

 const url = `${SITE_URL}${path}`;
 const fullTitle = title.includes(SITE_NAME)
 ? title
 : `${title} | ${SITE_NAME}`;

 // hreflang 페어 자동 생성 — enPath / koPath 중 하나라도 있으면 alternates.languages 채움
 const koUrl = koPath ? `${SITE_URL}${koPath}` : path.startsWith("/en") ? null : url;
 const enUrl = enPath ? `${SITE_URL}${enPath}` : path.startsWith("/en") ? url : null;
 const hasLanguagePair = (koUrl && enUrl) ? true : false;

 // OG 이미지: 명시 → 동적 OG 라우트 → 기본값
 const ogImageUrl = ogImage
 ? ogImage.startsWith("http")
 ? ogImage
 : `${SITE_URL}${ogImage}`
 : `${SITE_URL}/api/og?path=${encodeURIComponent(path)}&title=${encodeURIComponent(title)}`;

 const allKeywords = [...new Set([...DEFAULT_KEYWORDS, ...keywords])];

 const metadata: Metadata = {
 title: fullTitle,
 description,
 keywords: allKeywords.join(", "),
 alternates: {
 canonical: url,
 ...(hasLanguagePair && koUrl && enUrl
 ? {
 languages: {
 "ko-KR": koUrl,
 "en": enUrl,
 "x-default": koUrl,
 },
 }
 : {}),
 },
 robots: noIndex
 ? { index: false, follow: false }
 : {
 index: true,
 follow: true,
 googleBot: {
 index: true,
 follow: true,
 "max-image-preview": "large",
 "max-snippet": -1,
 },
 },
 openGraph: {
 type: ogType,
 locale: "ko_KR",
 url,
 siteName: SITE_NAME,
 title: fullTitle,
 description,
 images: [
 {
 url: ogImageUrl,
 width: 1200,
 height: 630,
 alt: title,
 },
 ],
 ...(ogType === "article" && publishedTime
 ? { publishedTime, modifiedTime: modifiedTime || publishedTime }
 : {}),
 },
 twitter: {
 card: "summary_large_image",
 title: fullTitle,
 description,
 images: [ogImageUrl],
 },
 };

 return metadata;
}

/**
 * /salary/[amount] 동적 페이지 전용 헬퍼.
 * 연봉 금액을 받아 SEO 친화적 메타데이터 생성.
 */
export function buildSalaryAmountMetadata(amount: number): Metadata {
 const manwon = Math.round(amount / 10000);
 const formatted = manwon.toLocaleString("ko-KR");

 return buildPageMetadata({
 title: `연봉 ${formatted}만원 실수령액 — 4대보험·세금 자동 계산 (2026)`,
 description: `연봉 ${formatted}만원의 세후 월급, 국민연금·건강보험·고용보험·소득세 공제액을 2026년 최신 세법 기준으로 즉시 계산합니다. 실수령액 분석, 자산 시뮬레이션, 동급 회사 비교까지 무료 제공.`,
 path: `/salary/${amount}`,
 keywords: [
 `연봉 ${formatted}만원`,
 `연봉 ${formatted}만원 실수령액`,
 `연봉 ${formatted}만원 월급`,
 `연봉 ${formatted}만원 세후`,
 ],
 ogImage: `${SITE_URL}/api/og?type=salary&amount=${amount}`,
 });
}

/**
 * /hourly/[amount] 시급 환산 페이지 전용 헬퍼.
 * 한국 표준 월 209시간(주 40시간 × 4.345 + 주휴수당) 기준.
 */
export function buildHourlyAmountMetadata(hourlyWage: number): Metadata {
 const formatted = hourlyWage.toLocaleString("ko-KR");
 const monthly = Math.round(hourlyWage * 209);
 const monthlyManwon = Math.round(monthly / 10000).toLocaleString("ko-KR");
 const yearlyManwon = Math.round((monthly * 12) / 10000).toLocaleString("ko-KR");

 return buildPageMetadata({
 title: `시급 ${formatted}원 = 월급·연봉 환산 — 4대보험·실수령액 (2026)`,
 description: `시급 ${formatted}원의 월 209시간 환산 월급 약 ${monthlyManwon}만원, 연봉 약 ${yearlyManwon}만원. 2026년 4대보험·소득세 차감 후 실수령액과 최저시급 비교까지.`,
 path: `/hourly/${hourlyWage}`,
 keywords: [
 `시급 ${formatted}원`,
 `시급 ${formatted}원 월급`,
 `시급 ${formatted}원 연봉`,
 `시급 ${formatted}원 실수령액`,
 "시급 연봉 환산",
 "알바 연봉",
 ],
 ogImage: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(`시급 ${formatted}원 환산`)}`,
 });
}

/**
 * /monthly/[amount] 월급 환산 페이지 전용 헬퍼.
 */
export function buildMonthlyAmountMetadata(monthlyWage: number): Metadata {
 const manwon = Math.round(monthlyWage / 10000).toLocaleString("ko-KR");
 const yearlyManwon = Math.round((monthlyWage * 12) / 10000).toLocaleString("ko-KR");

 return buildPageMetadata({
 title: `월급 ${manwon}만원 = 연봉·시급 환산 — 4대보험·실수령액 (2026)`,
 description: `월급 ${manwon}만원의 연봉 약 ${yearlyManwon}만원, 시급 환산 시 209시간 기준 약 ${Math.round(monthlyWage / 209).toLocaleString("ko-KR")}원. 2026년 세후 실수령액과 동급 직장인 비교.`,
 path: `/monthly/${monthlyWage}`,
 keywords: [
 `월급 ${manwon}만원`,
 `월급 ${manwon}만원 연봉`,
 `월급 ${manwon}만원 실수령액`,
 `월급 ${manwon}만원 시급`,
 "월급 연봉 환산",
 ],
 ogImage: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(`월급 ${manwon}만원 환산`)}`,
 });
}

/**
 * /year/[year]/tax-rates 연도별 세율 페이지 전용 헬퍼.
 */
export function buildYearTaxRatesMetadata(year: number): Metadata {
 return buildPageMetadata({
 title: `${year}년 세율표 — 소득세·증여세·상속세·양도세·법인세 누진세율`,
 description: `${year}년 한국 모든 세금 누진세율표. 근로소득세 6~45%, 증여세·상속세 10~50%, 양도세, 법인세까지 ${year}년 기준 한 페이지 정리.`,
 path: `/year/${year}/tax-rates`,
 keywords: [
 `${year} 세율`,
 `${year} 소득세율`,
 `${year} 누진세율`,
 `${year} 증여세 세율`,
 `${year} 상속세 세율`,
 ],
 ogImage: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(`${year}년 세율표`)}`,
 });
}

/**
 * /year/[year]/salary/[amount] 연도별 연봉 환산 헬퍼.
 */
export function buildYearSalaryMetadata(year: number, amount: number): Metadata {
 const manwon = Math.round(amount / 10000).toLocaleString("ko-KR");
 return buildPageMetadata({
 title: `${year}년 기준 연봉 ${manwon}만원 실수령액 — 그 해 세법 적용`,
 description: `${year}년 적용 세법 기준 연봉 ${manwon}만원의 월 실수령액과 4대보험·소득세 공제. 현재(2026) 대비 변화와 인플레이션 보정.`,
 path: `/year/${year}/salary/${amount}`,
 keywords: [
 `${year} 연봉 ${manwon}만원`,
 `${year} 실수령액`,
 `${year} 연봉 ${manwon}만`,
 ],
 ogImage: `${SITE_URL}/api/og?type=salary&amount=${amount}`,
 });
}

/**
 * /region/[slug]/cost-of-living 지역별 생활비 헬퍼.
 */
export function buildRegionMetadata(region: {
 slug: string;
 name: string;
 avgRent: number;
 avgFood: number;
 avgTransport: number;
}): Metadata {
 const total = region.avgRent + region.avgFood + region.avgTransport;
 return buildPageMetadata({
 title: `${region.name} 생활비 — 월 ${Math.round(total / 10000).toLocaleString("ko-KR")}만원 (2026)`,
 description: `${region.name}의 평균 월세, 식비, 교통비, 통신비 등 1인 가구 생활비. 본인 연봉 대비 가능 여부와 동급 지역 비교까지 한 페이지로.`,
 path: `/region/${region.slug}/cost-of-living`,
 keywords: [
 `${region.name} 생활비`,
 `${region.name} 월세`,
 `${region.name} 1인 가구`,
 `${region.name} 평균 임금`,
 `${region.name} 자취 비용`,
 ],
 ogImage: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(`${region.name} 생활비`)}`,
 });
}

/**
 * /job/[slug]/salary 직업별 연봉 헬퍼.
 */
export function buildJobMetadata(job: {
 slug: string;
 name: string;
 avgSalary: number;
}): Metadata {
 const manwon = Math.round(job.avgSalary / 10000).toLocaleString("ko-KR");
 return buildPageMetadata({
 title: `${job.name} 연봉 — 평균 ${manwon}만원·신입~10년차·실수령액 (2026)`,
 description: `${job.name}의 평균 연봉, 신입~10년차 연봉 분포, 동종업계 회사 TOP10, 4대보험·소득세 차감 후 월 실수령액까지 한 페이지로 정리.`,
 path: `/job/${job.slug}/salary`,
 keywords: [
 `${job.name} 연봉`,
 `${job.name} 평균 연봉`,
 `${job.name} 신입 연봉`,
 `${job.name} 실수령액`,
 `${job.name} 직업`,
 ],
 ogImage: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(`${job.name} 연봉`)}`,
 });
}

export interface ToolMeta {
 /** 툴 이름 (예: "성과급 세금 계산기") */
 name: string;
 /** 한 줄 설명 */
 tagline: string;
 /** 상세 설명 (140~160자) */
 description: string;
 /** 페이지 경로 */
 path: string;
 /** 추가 키워드 */
 keywords?: string[];
}

/**
 * /tools/* 페이지 전용 헬퍼.
 * 일관된 제목 패턴으로 SEO 강화.
 */
export function buildToolMetadata(tool: ToolMeta): Metadata {
 return buildPageMetadata({
 title: `${tool.name} 2026 — ${tool.tagline}`,
 description: tool.description,
 path: tool.path,
 keywords: tool.keywords,
 ogImage: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(tool.name)}`,
 });
}

/**
 * /guides/[slug] 동적 페이지 전용 헬퍼.
 * Article 타입 OG와 발행일/수정일 포함.
 */
export function buildGuideMetadata(guide: {
 slug: string;
 title: string;
 description: string;
 publishedDate: string;
 tags?: string[];
}): Metadata {
 return buildPageMetadata({
 title: guide.title,
 description: guide.description,
 path: `/guides/${guide.slug}`,
 keywords: guide.tags,
 ogType: "article",
 publishedTime: new Date(guide.publishedDate).toISOString(),
 ogImage: `${SITE_URL}/api/og?type=guide&slug=${guide.slug}`,
 });
}

/**
 * /salary-db/[id] 회사 페이지 전용 헬퍼.
 */
export function buildCompanyMetadata(company: {
 id: string;
 name: string;
 industry?: string;
 averageSalary?: number;
}): Metadata {
 const avg = company.averageSalary
 ? `평균 ${Math.round(company.averageSalary / 10000).toLocaleString("ko-KR")}만원`
 : "평균 연봉";
 const industry = company.industry ? ` · ${company.industry}` : "";

 return buildPageMetadata({
 title: `${company.name} 연봉 — ${avg} (2026)${industry}`,
 description: `${company.name}의 직급별 평균 연봉과 실수령액을 2026년 세법 기준으로 분석. 같은 업종 평균 대비 차이, 동급 회사 비교, 협상 팁까지 한눈에 확인하세요.`,
 path: `/salary-db/${company.id}`,
 keywords: [
 `${company.name} 연봉`,
 `${company.name} 실수령액`,
 `${company.name} 월급`,
 `${company.name} 신입 연봉`,
 ...(company.industry ? [company.industry] : []),
 ],
 ogImage: `${SITE_URL}/api/og?type=company&name=${encodeURIComponent(company.name)}`,
 });
}

export const SITE_CONFIG = {
 url: SITE_URL,
 name: SITE_NAME,
 defaultOgImage: DEFAULT_OG_IMAGE,
 defaultKeywords: DEFAULT_KEYWORDS,
};
