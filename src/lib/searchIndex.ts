// src/lib/searchIndex.ts
//
// 헤더 통합 검색용 정적 인덱스.
// 계산기·가이드·글로서리·Q&A·회사·시즌페이지를 단일 배열로 합쳐 빠른 클라이언트 검색 지원.

import { allCalculators } from "@/lib/simpleCalculators";
import { koGuides } from "@/lib/guidesData";
import { glossaryData, toGlossarySlug } from "@/data/glossaryData";
import { qnaData, toQnaSlug } from "@/data/qnaData";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

export type SearchCategory =
 | "계산기"
 | "가이드"
 | "용어"
 | "Q&A"
 | "회사"
 | "시즌"
 | "도구";

export interface SearchEntry {
 title: string;
 href: string;
 category: SearchCategory;
 description?: string;
 /** 검색 매칭 우선순위 (1이 가장 높음) */
 priority?: number;
}

const seasonPages: SearchEntry[] = [
 { title: "2026 종합소득세 신고 가이드", href: "/year-end-tax-2026", category: "시즌", description: "5월 프리랜서·N잡러" },
 { title: "2026 건강보험료 정산", href: "/health-insurance-2026", category: "시즌", description: "4월 정산·분납·환급" },
 { title: "2026 연말정산 + 성과급", href: "/year-end-tax-settlement-2026", category: "시즌", description: "12월 근로자 절세" },
 { title: "2026 신입 연봉 협상", href: "/new-employee-2026", category: "시즌", description: "3월 첫 협상" },
 { title: "연말정산 체크리스트", href: "/year-end-tax-checklist", category: "시즌", description: "12월 31일 마감" },
 { title: "2026 세율표", href: "/tax-rates-2026", category: "시즌", description: "소득세 구간" },
 { title: "2026 4대보험 요율", href: "/social-insurance-rates-2026", category: "시즌" },
 { title: "2026 세법 변경사항", href: "/tax-changes-2026", category: "시즌" },
 { title: "퇴직연금 DB·DC·IRP", href: "/retirement-pension-2026", category: "시즌" },
 { title: "삼성 신입 연봉 협상", href: "/samsung-negotiation-2026", category: "시즌" },
 { title: "삼성전자 성과급 계산기", href: "/calc/samsung-bonus", category: "계산기", description: "OPI·TAI 세후 실수령", priority: 1 },
 { title: "직장인 단계별 자산", href: "/career-stages-2026", category: "시즌", description: "20~50대" },
 { title: "연봉 인상 협상 시뮬레이터", href: "/salary-raise-2026", category: "계산기", description: "인상률·5년 누적 효과", priority: 1 },
 // 7차 신설 7개 정적 계산기 (8차 점검에서 추가) — 사이트 내부 검색 노출
 { title: "2026 자동차세 계산기", href: "/auto-tax-2026", category: "계산기", description: "배기량·차령·연납 5% 공제", priority: 2 },
 { title: "2026 주휴수당 계산기", href: "/weekly-holiday-allowance-2026", category: "계산기", description: "최저시급 10,320원 주 40h 82,560원", priority: 2 },
 { title: "2026 종합소득세 계산기", href: "/income-tax-2026", category: "계산기", description: "8단계 누진세율 + 지방소득세 10%", priority: 1 },
 { title: "2026 부동산 보유세 계산기", href: "/property-holding-tax-2026", category: "계산기", description: "재산세 7·9월 + 종부세 12월", priority: 2 },
 { title: "2026 건강보험료 계산기", href: "/health-insurance-fee-2026", category: "계산기", description: "본인부담 3.595% + 장기요양 합산 약 4.07%", priority: 1 },
 { title: "2026 국민연금 예상수령액", href: "/national-pension-estimate-2026", category: "계산기", description: "가입기간 비례 소득대체율 43%", priority: 2 },
 { title: "2026 적금·예금 이자 계산기", href: "/savings-interest-2026", category: "계산기", description: "정기적금/예금, 단리/복리, 세후 이자", priority: 2 },
];

const toolPages: SearchEntry[] = [
 { title: "주택담보대출 계산", href: "/home-loan", category: "도구", description: "DSR·LTV·월 상환" },
 { title: "자동차 구매·할부", href: "/car-loan", category: "도구" },
 { title: "FIRE 은퇴 계산기", href: "/fire-calculator", category: "도구" },
 { title: "연말정산 환급금 계산", href: "/year-end-tax", category: "도구" },
 { title: "MBTI 연봉 분석", href: "/mbti-salary", category: "도구" },
 { title: "해외 연봉 비교", href: "/global", category: "도구" },
 { title: "커리어 플래너", href: "/pro/career-planner", category: "도구" },
 { title: "기업별 연봉 DB", href: "/salary-db", category: "도구", description: "60+ 기업", priority: 1 },
 { title: "100가지 계산기 인덱스", href: "/calc", category: "도구", priority: 1 },
 { title: "전체 가이드", href: "/guides", category: "도구" },
 { title: "용어 사전", href: "/glossary", category: "도구" },
 { title: "Q&A 인덱스", href: "/qna", category: "도구" },
 { title: "Fun 콘텐츠", href: "/fun", category: "도구", description: "게임·테스트" },
 { title: "2026 연봉 실수령액 표", href: "/table/2026/annual", category: "도구" },
 { title: "2026 월급 실수령액 표", href: "/table/2026/monthly", category: "도구" },
];

const calculatorEntries: SearchEntry[] = allCalculators.map((c) => ({
 title: c.title,
 href: `/calc/${c.slug}`,
 category: "계산기" as const,
 description: c.description,
}));

const guideEntries: SearchEntry[] = koGuides.map((g) => ({
 title: g.title,
 href: `/guides/${g.slug}`,
 category: "가이드" as const,
 description: g.description,
}));

const glossaryEntries: SearchEntry[] = glossaryData.map((g) => ({
 title: g.title,
 href: `/glossary/${toGlossarySlug(g.title)}`,
 category: "용어" as const,
 description: g.summary,
}));

const qnaEntries: SearchEntry[] = qnaData.map((q) => ({
 title: q.question,
 href: `/qna/${toQnaSlug(q.question)}`,
 category: "Q&A" as const,
 description: q.answer.conclusion.slice(0, 60),
}));

const companyEntries: SearchEntry[] = companyRepository.getAll().map((c) => ({
 title: c.name.ko,
 href: `/salary-db/${c.id}`,
 category: "회사" as const,
 description: c.industry,
}));

export const searchIndex: SearchEntry[] = [
 ...toolPages,
 ...seasonPages,
 ...calculatorEntries,
 ...guideEntries,
 ...glossaryEntries,
 ...qnaEntries,
 ...companyEntries,
];

/**
 * 쿼리로 검색. 제목 prefix > 제목 includes > description includes 순위.
 * 최대 limit 개 반환.
 */
export function searchEntries(query: string, limit = 8): SearchEntry[] {
 const q = query.trim().toLowerCase();
 if (!q) return [];

 const matched = searchIndex
 .map((entry) => {
 const title = entry.title.toLowerCase();
 const desc = entry.description?.toLowerCase() ?? "";
 let score = 0;
 if (title.startsWith(q)) score = 100;
 else if (title.includes(q)) score = 60;
 else if (desc.includes(q)) score = 20;
 return { entry, score };
 })
 .filter((m) => m.score > 0)
 .sort((a, b) => {
 // 점수 내림차순 + priority 내림차순 + 제목 길이 (짧은 게 우선)
 if (b.score !== a.score) return b.score - a.score;
 const pa = a.entry.priority ?? 99;
 const pb = b.entry.priority ?? 99;
 if (pa !== pb) return pa - pb;
 return a.entry.title.length - b.entry.title.length;
 })
 .slice(0, limit);

 return matched.map((m) => m.entry);
}
