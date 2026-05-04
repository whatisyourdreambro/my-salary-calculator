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
 } = options;

 const url = `${SITE_URL}${path}`;
 const fullTitle = title.includes(SITE_NAME)
 ? title
 : `${title} | ${SITE_NAME}`;

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
