// src/lib/guidesData.ts
//
// 가이드 "메타 인터페이스" — 타입·카테고리·카드 메타(본문 제외)만 제공.
// ★본문(content)은 guidesContent.ts 로 물리 분리 (2026-08-26 Phase 4 배포 1):
//   이 모듈은 본문 모듈을 일절 import 하지 않으므로, 홈(FeaturedGuides)·목록·
//   헤더 검색(searchIndex)이 이 모듈을 import 해도 본문 ~1.5MB 청크가 딸려
//   들어가지 않는다.
// - 본문이 필요한 소비처(상세 페이지·rss.xml·sitemap·relatedGuides·빌드 스크립트)는
//   guidesContent.ts 의 guides/koGuides/enGuides 를 사용할 것.
// - 카드 배열의 실데이터는 prebuild 산출물 guidesMeta.generated.ts 에서 온다
//   (scripts/gen-guides-meta.ts 가 guidesContent 에서 추출 — 정본은 guidesContent.
//   빌드마다 재생성되므로 드리프트는 자동 치유된다).

import { guideCards } from "./guidesMeta.generated";

export type GuideLang = 'ko' | 'en';

export interface Guide {
 slug: string;
 title: string;
 description: string;
 category: string;
 tags: string[];
 level: '초급' | '중급' | '고급' | 'Beginner' | 'Intermediate' | 'Advanced';
 publishedDate: string;
 views: number;
 content: string;
 /** 'ko' | 'en'. 미지정 시 'ko'로 간주 (기존 50개 가이드 호환) */
 lang?: GuideLang;
}

export const categories = [
 { id: "all", name: "전체보기" },
 { id: "연봉", name: "💰 연봉/급여" },
 { id: "세금", name: "💸 세금/절세" },
 { id: "투자", name: "📈 투자/재테크" },
 { id: "주식", name: "📊 주식/반도체" },
 { id: "부동산", name: "🏠 부동산" },
 { id: "커리어", name: "🚀 커리어" },
 { id: "기초", name: "🌱 금융기초" },
];

export const categoriesEn = [
 { id: "all", name: "All" },
 { id: "Salary", name: "💰 Salary & Pay" },
 { id: "Tax", name: "💸 Tax & Savings" },
 { id: "Investing", name: "📈 Investing" },
 { id: "Stocks", name: "📊 Stocks & Semiconductors" },
 { id: "RealEstate", name: "🏠 Real Estate" },
 { id: "Career", name: "🚀 Career" },
 { id: "Basics", name: "🌱 Finance Basics" },
];

// ─────────────────────────────────────────────────────────────
// 목록/카드 UI 전용 — 본문(content) 제외 경량 메타.
// contentChars: 본문 글자수 — 본문 없이 "실질 본문 보유" 판단용
// (FeaturedGuides 의 content.length > 1500 필터를 본문 import 없이 대체)
// ─────────────────────────────────────────────────────────────
export type GuideCardMeta = Omit<Guide, 'content'> & {
 /** 본문 글자수 (gen-guides-meta 산출) */
 contentChars: number;
};

export const koGuideCards: GuideCardMeta[] = guideCards.filter(
 (g) => g.lang === 'ko'
);
export const enGuideCards: GuideCardMeta[] = guideCards.filter(
 (g) => g.lang === 'en'
);
