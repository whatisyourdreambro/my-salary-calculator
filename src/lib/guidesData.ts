// src/lib/guidesData.ts

// --- ENHANCED GUIDE DATA STRUCTURE ---
export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  level: '초급' | '중급' | '고급';
  publishedDate: string;
  views: number;
}

export const categories = [
  { id: "all", name: "전체보기" },
  { id: "연봉", name: "연봉 분석" },
  { id: "커리어", name: "커리어 성장" },
  { id: "세금", name: "절세/세금" },
  { id: "투자", name: "재테크/투자" },
  { id: "부동산", name: "부동산" },
  { id: "기초", name: "금융 기초" },
];

// 50+ Placeholder Guides
export const guides: Guide[] = [
  // 연봉
  { slug: "salary-guide-2025", title: "2025년 연봉 실수령액 완벽 분석", description: "최신 세법을 적용한 연봉 구간별 상세 실수령액 표를 제공합니다.", category: "연봉", tags: ["연봉", "실수령액", "2025년"], level: "초급", publishedDate: "2025-10-26", views: 150234 },
  { slug: "salary-negotiation-strategy", title: "연봉협상, 최소 20% 올리는 4단계 전략", description: "당신의 가치를 증명하고, 원하는 연봉을 얻어내는 실전 협상 기술을 공개합니다.", category: "연봉", tags: ["연봉협상", "커리어", "몸값"], level: "중급", publishedDate: "2025-10-20", views: 98765 },
  // ... (rest of the guides data)
];
