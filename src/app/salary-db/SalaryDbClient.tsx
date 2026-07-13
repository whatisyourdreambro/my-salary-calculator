"use client";

// 회사 DB 인덱스 — 검색/필터 UI (클라이언트).
// 485개사 전체 프로필(~860KB)을 번들에 싣지 않도록, 서버 컴포넌트(page.tsx)가
// 목록 표시·검색에 필요한 필드만 추린 경량 인덱스를 props 로 내려준다.

import { useMemo, useState, Fragment } from "react";
import Link from "next/link";
import { Search, Building2, TrendingUp, Users, ArrowRight, Database, Briefcase, MapPin, Factory, Trophy, Calculator } from "lucide-react";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import RelatedCalculators from "@/components/RelatedCalculators";

/** 목록 카드·검색에 필요한 필드만 담은 경량 인덱스 항목 (서버에서 생성). */
export interface CompanyIndexItem {
 id: string;
 nameKo: string;
 nameEn: string;
 /** 검색 표기 변형 (옛 사명·줄임말 등) */
 aliases?: string[];
 industry: string;
 tier: "conglomerate" | "unicorn" | "startup" | "foreign" | "public";
 logo: string;
 /** 원 단위 — 신입 base 연봉 */
 entryBase: number;
 /** 원 단위 — 시니어 base 연봉 */
 seniorBase: number;
 /** 신입 인센티브 타깃 (%) */
 incentiveTarget: number;
 /** 주 실근무 시간 */
 weeklyHoursReal: number;
}

const TIER_LABEL: Record<CompanyIndexItem["tier"], string> = {
 conglomerate: "대기업",
 unicorn: "유니콘",
 startup: "스타트업",
 foreign: "외국계",
 public: "공기업",
};

const TIER_BADGE_CLASS: Record<CompanyIndexItem["tier"], string> = {
 conglomerate: "bg-canvas-dark text-electric",
 unicorn: "bg-primary/10 text-primary",
 startup: "bg-canvas-dark text-muted-blue",
 foreign: "bg-canvas-dark text-muted-blue",
 public: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

// 회사 DB 인덱스의 형제 허브 — 회사 검색 후 다른 차원(직업/산업/지역)으로
// 한 번 더 분기해 트래픽 엔진 간 PageRank를 양방향으로 흘려보낸다.
const SIBLING_HUBS: Array<{ href: string; label: string; sub: string; icon: React.ElementType }> = [
 { href: "/salary-db/ranking", label: "연봉 순위 TOP 30", sub: "총보상 기준 대기업 랭킹", icon: Trophy },
 { href: "/job", label: "직업별 연봉", sub: "직무 평균·신입 초봉", icon: Briefcase },
 { href: "/industry", label: "산업별 연봉", sub: "업종 순위·동종사", icon: Factory },
 { href: "/region", label: "지역별 연봉", sub: "17개 시도 분포", icon: MapPin },
 { href: "/salary-db/compare/naver-vs-kakao", label: "회사 비교", sub: "네이버 vs 카카오 정밀 비교", icon: TrendingUp },
 // 유입 #2(회사 검색) → 수익 #3(홈 계산기)로 가는 유일한 상단 동선
 { href: "/", label: "연봉 실수령액 계산기", sub: "세금·4대보험 즉시 계산", icon: Calculator },
];

// 검색 0건 dead-end 방지 — 인기 회사 바로가기 (id는 companyRepository 실존 확인)
const POPULAR_COMPANIES: Array<{ id: string; name: string }> = [
 { id: "samsung-electronics", name: "삼성전자" },
 { id: "sk-hynix", name: "SK하이닉스" },
 { id: "naver", name: "네이버" },
 { id: "kakao", name: "카카오" },
 { id: "hyundai", name: "현대자동차" },
];

export default function SalaryDbClient({ companies }: { companies: CompanyIndexItem[] }) {
 const [searchTerm, setSearchTerm] = useState("");
 const [tierFilter, setTierFilter] = useState<CompanyIndexItem["tier"] | "all">("all");
 const [sortByEntry, setSortByEntry] = useState(false);

 // CompanyRepository.search 와 동일 기준(한글명/영문명/업종/별칭 부분 일치)
 // + tier 필터 + 신입 연봉 정렬. 데이터는 이미 경량 인덱스로 내려와 있어 추가 페이로드 0.
 const filteredCompanies = useMemo(() => {
 const lowerQuery = searchTerm.toLowerCase().trim();
 let list = !lowerQuery
 ? companies
 : companies.filter(
 (c) =>
 c.nameKo.toLowerCase().includes(lowerQuery) ||
 c.nameEn.toLowerCase().includes(lowerQuery) ||
 c.industry.toLowerCase().includes(lowerQuery) ||
 (c.aliases?.some((a) => a.toLowerCase().includes(lowerQuery)) ?? false)
 );
 if (tierFilter !== "all") list = list.filter((c) => c.tier === tierFilter);
 if (sortByEntry) list = [...list].sort((a, b) => b.entryBase - a.entryBase);
 return list;
 }, [companies, searchTerm, tierFilter, sortByEntry]);

 return (
 <main className="w-full min-h-screen bg-canvas pb-20">
 {/* Hero Section */}
 <section className="relative pt-28 pb-14 overflow-hidden text-center">
 <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-indigo-50 -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 rounded-full blur-[120px] -z-10" />

 <div className="relative z-10 max-w-4xl mx-auto px-4">
 {/* framer-motion initial opacity:0 은 SSR HTML에 인라인으로 박혀
 하이드레이션 전까지 히어로(LCP)가 투명해지므로 CSS 애니메이션으로 대체 */}
 <div style={{ animation: "fadeIn 0.5s ease both" }}>
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
 <Database className="w-4 h-4" />
 Corporate Salary Database
 </div>
 <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-navy ">
 회사별 연봉 <span className="text-electric">데이터베이스</span>
 </h1>
 <p className="text-lg sm:text-xl text-faint-blue mb-10 max-w-2xl mx-auto font-medium">
 대한민국 연봉의 모든 것 — 카더라 통신은 그만. <br className="sm:hidden" />
 실제 데이터 기반 기업별 연봉·복지·워라밸을 확인하세요.
 </p>

 {/* Search Bar */}
 <div className="relative max-w-xl mx-auto">
 <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
 <Search className="w-5 h-5 text-faint-blue" />
 </div>
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="기업명, 산업군 검색 (예: 삼성전자, IT)"
 className="toss-input pl-14"
 />
 </div>


 </div>
 </div>
 </section>

 <div className="page-width pt-6">
 {/* 형제 허브 진입 — 회사 검색이 의도가 아니면 다른 차원으로 분기 */}
 <nav
 aria-label="다른 연봉 데이터 보기"
 className="max-w-5xl mx-auto mb-8 grid grid-cols-2 md:grid-cols-3 gap-3"
 >
 {SIBLING_HUBS.map((h) => {
 const Icon = h.icon;
 return (
 <Link
 key={h.href}
 href={h.href}
 className="group flex items-center gap-3 p-4 bg-white border border-canvas-200 rounded-2xl hover:border-electric hover:shadow-md transition-all"
 >
 <div className="w-10 h-10 rounded-xl bg-electric-10 flex items-center justify-center shrink-0">
 <Icon className="w-5 h-5 text-electric" />
 </div>
 <div className="min-w-0">
 <p className="font-bold text-navy text-sm group-hover:text-electric transition-colors">
 {h.label}
 </p>
 <p className="text-[11.5px] text-faint-blue truncate">{h.sub}</p>
 </div>
 </Link>
 );
 })}
 </nav>

 {/* 모바일 전용 sticky 검색 — 스크롤해도 재검색 쉽게 */}
 <div className="md:hidden sticky top-16 z-30 -mx-4 px-4 py-2.5 mb-4 bg-canvas/95 backdrop-blur-md border-b border-canvas-200">
 <div className="relative">
 <Search
 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint-blue pointer-events-none"
 aria-hidden
 />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder={`${companies.length.toLocaleString("ko-KR")}개 기업 검색`}
 className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-canvas-200 bg-white text-sm font-medium text-navy placeholder:text-faint-blue focus:outline-none focus:border-electric"
 aria-label="기업 검색"
 />
 </div>
 </div>

 {/* 검색바 직하 광고 */}
 <div className="max-w-3xl mx-auto mb-8">
 <HomeTopAd />
 </div>

 {/* Tier 필터 + 신입 연봉 정렬 — 29초 체류를 탐색으로 연장 */}
 <div className="flex flex-wrap items-center gap-2 mb-6">
 {(
 ["all", "conglomerate", "unicorn", "startup", "foreign", "public"] as const
 ).map((t) => {
 const active = tierFilter === t;
 const count =
 t === "all"
 ? companies.length
 : companies.filter((c) => c.tier === t).length;
 return (
 <button
 key={t}
 type="button"
 onClick={() => setTierFilter(t)}
 aria-pressed={active}
 className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
 active
 ? "bg-electric text-white"
 : "bg-white border border-canvas-200 text-muted-blue hover:border-electric hover:text-electric"
 }`}
 >
 {t === "all" ? "전체" : TIER_LABEL[t]}{" "}
 <span className={active ? "text-white/80" : "text-faint-blue"}>
 {count.toLocaleString("ko-KR")}
 </span>
 </button>
 );
 })}
 <button
 type="button"
 onClick={() => setSortByEntry((v) => !v)}
 aria-pressed={sortByEntry}
 className={`ml-auto px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-1 ${
 sortByEntry
 ? "bg-electric text-white"
 : "bg-white border border-canvas-200 text-muted-blue hover:border-electric hover:text-electric"
 }`}
 >
 <TrendingUp className="w-3.5 h-3.5" aria-hidden />
 신입 연봉 높은순
 </button>
 </div>

 {/* Company Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredCompanies.map((company, idx) => (
 <Fragment key={company.id}>
 {/* motion.div(SSR opacity:0 인라인) 제거 — 485개 카드가 하이드레이션
 전까지 투명해지는 LCP 저해 해소. 첫 8개만 CSS 계단식 페이드 */}
 <div
 style={{
 animation: "fadeIn 0.4s ease both",
 animationDelay: `${Math.min(idx, 8) * 0.05}s`,
 }}
 >
 <Link href={`/salary-db/${company.id}`} className="block h-full">
 <div className="group h-full duotone-card p-6 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 relative overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="w-12 h-12 text-4xl flex items-center justify-center bg-secondary rounded-xl group-hover:scale-110 transition-transform">
 {company.logo}
 </div>
 <span className={`px-2 py-1 rounded text-xs font-bold ${TIER_BADGE_CLASS[company.tier]}`}>
 {TIER_LABEL[company.tier]}
 </span>
 </div>

 <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
 {company.nameKo}
 </h3>
 <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
 {company.industry}
 </p>

 <div className="space-y-2.5">
 <div className="flex justify-between items-center text-sm">
 <span className="text-muted-foreground flex items-center gap-1">
 <Users className="w-4 h-4" /> 신입 → 시니어
 </span>
 <span className="font-bold text-foreground tabular-nums">
 {(company.entryBase / 10000).toLocaleString('ko-KR')}~{(company.seniorBase / 10000).toLocaleString('ko-KR')}만원
 </span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-muted-foreground flex items-center gap-1">
 <TrendingUp className="w-4 h-4" /> 평균 인센
 </span>
 <span className="font-bold text-electric tabular-nums">
 {company.incentiveTarget}%
 </span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-muted-foreground">📅 주 실근무</span>
 <span className="font-bold text-foreground tabular-nums">
 {company.weeklyHoursReal}h
 </span>
 </div>
 </div>

 <div className="mt-5 pt-4 border-t border-border flex justify-between items-center text-sm font-bold text-primary group-hover:text-electric transition-colors">
 <span className="inline-flex items-center gap-1">
 <span className="hidden sm:inline">직급별 연봉·복지·리뷰</span>
 <span className="sm:hidden">상세 리포트</span>
 </span>
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </div>
 </div>
 </Link>
 </div>
 {/* 6번째 카드 직후 중간 광고 — 회사 비교 스크롤 정점 */}
 {idx === 5 && filteredCompanies.length > 6 && (
 <div className="md:col-span-2 lg:col-span-3 my-2">
 <CalcResultAd />
 </div>
 )}
 </Fragment>
 ))}
 </div>

 {filteredCompanies.length === 0 && (
 <div className="text-center py-20">
 <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-xl font-bold text-foreground mb-2">검색 결과가 없습니다</h3>
 <p className="text-muted-foreground mb-6">
 아직 등록되지 않은 기업이거나 검색어를 확인해주세요.<br />
 (현재 {companies.length.toLocaleString("ko-KR")}개 기업 데이터 제공 중)
 </p>
 {/* dead-end 방지 — 인기 회사 바로가기 + 계산기 CTA */}
 <div className="flex flex-wrap justify-center gap-2 mb-4">
 {POPULAR_COMPANIES.map((c) => (
 <Link
 key={c.id}
 href={`/salary-db/${c.id}`}
 className="px-4 py-2 rounded-full bg-white border border-canvas-200 text-sm font-bold text-navy hover:border-electric hover:text-electric transition-colors"
 >
 {c.name} 연봉
 </Link>
 ))}
 </div>
 <Link
 href="/"
 className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-electric text-white text-sm font-bold hover:bg-blue-600 transition-colors"
 >
 <Calculator className="w-4 h-4" aria-hidden />
 연봉만 알면 실수령액 바로 계산
 <ArrowRight className="w-4 h-4" aria-hidden />
 </Link>
 </div>
 )}

 {/* 계산기 크로스링크 — 유입 엔진(#2)에서 수익 #1·#3으로 순환 */}
 <div className="max-w-5xl mx-auto mt-12">
 <RelatedCalculators
 currentPath="/salary-db"
 title="회사 연봉 확인했다면, 내 케이스로 계산해 보세요"
 />
 </div>

 {/* 회사 그리드 후 광고 + 쿠팡 */}
 <div className="max-w-3xl mx-auto mt-6">
 <InArticleAd />
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 </div>
 </div>
 </main>
 );
}
