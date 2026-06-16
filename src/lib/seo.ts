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
 // title.absolute = layout의 `template: "%s | 머니샐러리"` 중복 적용 차단.
 // (string 형태로 두면 layout이 또 "| 머니샐러리"를 붙여 사이트명 2번 노출)
 title: { absolute: fullTitle },
 description,
 keywords: allKeywords.join(", "),
 alternates: {
 canonical: url,
 // hreflang 전체 적용(7차): 미국 노출 193·클릭 0 (잘못된 매칭) 차단.
 // 영문 카운터파트가 있는 페이지는 page별로 languages를 override.
 languages: {
 "ko-KR": url,
 "x-default": url,
 },
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
 * monthlyNet을 넘기면 OG 이미지에 월 실수령액 숫자를 직접 박아 SNS 공유 CTR 상승.
 */
export function buildSalaryAmountMetadata(
 amount: number,
 monthlyNet?: number
): Metadata {
 const manwon = Math.round(amount / 10000);
 const formatted = manwon.toLocaleString("ko-KR");
 const netParam = monthlyNet ? `&net=${Math.round(monthlyNet)}` : "";
 const netManwon = monthlyNet
 ? Math.round(monthlyNet / 10000).toLocaleString("ko-KR")
 : null;

 // 검색 의도 = "연봉 X 실수령액이 얼마?" → 답(월 실수령액 숫자)을 제목 맨 앞에 박아
 // SERP에서 질문에 즉답 → CTR 상승 (GSC: 이 페이지군이 11~13위인데 클릭0인 문제 해결).
 const title = netManwon
 ? `연봉 ${formatted}만원 실수령액 월 ${netManwon}만원 (2026 세후 월급)`
 : `연봉 ${formatted}만원 실수령액 — 2026 세후 월급 계산`;

 const description = netManwon
 ? `연봉 ${formatted}만원의 월 실수령액은 약 ${netManwon}만원입니다(2026년 최신 세법 기준). 국민연금·건강보험·고용보험·소득세 공제 내역과 세후 월급, 실수령액 표, 같은 연봉대 회사까지 한눈에 확인하세요.`
 : `연봉 ${formatted}만원의 세후 월급과 국민연금·건강보험·고용보험·소득세 공제액을 2026년 최신 세법 기준으로 즉시 계산합니다. 실수령액 분석·자산 시뮬레이션·동급 회사 비교까지 무료 제공.`;

 return buildPageMetadata({
 title,
 description,
 path: `/salary/${amount}`,
 keywords: [
 `연봉 ${formatted}만원`,
 `연봉 ${formatted}만원 실수령액`,
 `연봉 ${formatted} 실수령액`,
 `${formatted}만원 실수령액`,
 `연봉 ${formatted}만원 월급`,
 `연봉 ${formatted}만원 세후`,
 `${formatted}만원 세후 월급`,
 ],
 ogImage: `${SITE_URL}/api/og?type=salary&amount=${amount}${netParam}`,
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
 seniorSalary?: number;
 aliases?: string[];
}): Metadata {
 // 네이버 검색 데이터 기준: "{회사} 연봉"·"{회사} 신입 연봉"·"{회사} 초봉"·
 // "{회사} 직급" 쿼리 비중이 압도적. page.tsx가 넘기는 averageSalary는 실제로
 // 신입 영끌 수치이므로 "신입 초봉"으로 정확히 라벨링하고, "{회사} 연봉"을
 // title 맨 앞에 둬 핵심 키워드 매칭을 강화한다 (영문 industry 접미사 제거).
 const entryFigure = company.averageSalary
 ? `${Math.round(company.averageSalary / 10000).toLocaleString("ko-KR")}만원`
 : null;
 const seniorFigureTitle = company.seniorSalary
 ? `${Math.round(company.seniorSalary / 10000).toLocaleString("ko-KR")}만원`
 : null;
 // 제목에 연봉 "범위"(신입~시니어)를 노출 — 상한선이 보여 "{회사} 연봉" 검색의
 // 클릭을 더 끈다. 범위 정보가 없으면 초봉 단일 수치로 폴백.
 const title =
 entryFigure && seniorFigureTitle
 ? `${company.name} 연봉 2026 — 신입 ${entryFigure}~시니어 ${seniorFigureTitle} 실수령액`
 : entryFigure
 ? `${company.name} 연봉 2026 — 신입 초봉 ${entryFigure}·직급별 실수령액`
 : `${company.name} 연봉 2026 — 신입 초봉·직급별 실수령액 정보`;

 // 별칭(옛 사명·표기 변형)을 "{별칭} 연봉/초봉" 키워드로 확장
 const aliasKeywords = (company.aliases ?? []).flatMap((alias) => [
 `${alias} 연봉`,
 `${alias} 초봉`,
 ]);

 // 회사별 고유 설명 — 실제 초봉·시니어 수치를 넣어 검색 결과 클릭률(CTR)을 높인다
 const seniorFigure = company.seniorSalary
 ? `${Math.round(company.seniorSalary / 10000).toLocaleString("ko-KR")}만원`
 : null;
 const description =
 entryFigure && seniorFigure
 ? `${company.name} 신입 초봉 약 ${entryFigure}, 시니어 약 ${seniorFigure} 수준. ${company.name}의 사원·대리·과장·부장 직급별 평균 연봉과 세후 실수령액, 인센티브·복지·워라밸을 2026년 최신 기준으로 분석했습니다.`
 : `${company.name}의 신입 초봉부터 대리·과장·부장 직급별 평균 연봉과 세후 실수령액을 2026년 기준으로 분석합니다. 동종업계 비교·연봉 협상 팁까지 한눈에 확인하세요.`;

 return buildPageMetadata({
 title,
 description,
 path: `/salary-db/${company.id}`,
 keywords: [
 `${company.name} 연봉`,
 `${company.name} 신입 연봉`,
 `${company.name} 초봉`,
 `${company.name} 신입 초봉`,
 `${company.name} 2026 연봉`,
 `${company.name} 평균 연봉`,
 `${company.name} 직급별 연봉`,
 `${company.name} 실수령액`,
 `${company.name} 월급`,
 // 직급별 long-tail (사원/대리/과장/부장은 검색 빈도 매우 높음)
 `${company.name} 사원 연봉`,
 `${company.name} 대리 연봉`,
 `${company.name} 과장 연봉`,
 `${company.name} 부장 연봉`,
 `${company.name} 시니어 연봉`,
 // 직장인 관심 요소 (취업·이직 검색 의도)
 `${company.name} 신입 월급`,
 `${company.name} 워라밸`,
 `${company.name} 복지`,
 `${company.name} 성과급`,
 `${company.name} 인센티브`,
 ...aliasKeywords,
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
