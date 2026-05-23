"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Building2, TrendingUp, Users, ArrowRight, Database, Briefcase, MapPin, Factory } from "lucide-react";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { Fragment } from "react";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

// 회사 DB 인덱스의 형제 허브 — 회사 검색 후 다른 차원(직업/산업/지역)으로
// 한 번 더 분기해 트래픽 엔진 간 PageRank를 양방향으로 흘려보낸다.
const SIBLING_HUBS: Array<{ href: string; label: string; sub: string; icon: React.ElementType }> = [
 { href: "/job", label: "직업별 연봉", sub: "직무 평균·신입 초봉", icon: Briefcase },
 { href: "/industry", label: "산업별 연봉", sub: "업종 순위·동종사", icon: Factory },
 { href: "/region", label: "지역별 연봉", sub: "17개 시도 분포", icon: MapPin },
 { href: "/company/compare", label: "회사 비교", sub: "두 회사 정밀 비교", icon: TrendingUp },
];
export default function SalaryDBPage() {
 const [searchTerm, setSearchTerm] = useState("");
 const allCompanies = companyRepository.getAll();

 const filteredCompanies = searchTerm
 ? companyRepository.search(searchTerm)
 : allCompanies;

 return (
 <main className="w-full min-h-screen bg-canvas pb-20">
 {/* Hero Section */}
 <section className="relative pt-28 pb-14 overflow-hidden text-center">
 <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-indigo-50 -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 rounded-full blur-[120px] -z-10" />

 <div className="relative z-10 max-w-4xl mx-auto px-4">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
 <Database className="w-4 h-4" />
 Corporate Salary Database
 </div>
 <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-navy ">
 대한민국 <span className="text-electric">연봉의 모든 것</span>
 </h1>
 <p className="text-lg sm:text-xl text-faint-blue mb-10 max-w-2xl mx-auto font-medium">
 카더라 통신은 그만. <br className="sm:hidden" />
 실제 데이터에 기반한 기업별 연봉, 복지, 워라밸 정보를 확인하세요.
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

 
 </motion.div>
 </div>
 </section>

 <div className="page-width pt-6">
 {/* 형제 허브 진입 — 회사 검색이 의도가 아니면 다른 차원으로 분기 */}
 <nav
 aria-label="다른 연봉 데이터 보기"
 className="max-w-5xl mx-auto mb-8 grid grid-cols-2 md:grid-cols-4 gap-3"
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
 placeholder={`${allCompanies.length.toLocaleString("ko-KR")}개 기업 검색`}
 className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-canvas-200 bg-white text-sm font-medium text-navy placeholder:text-faint-blue focus:outline-none focus:border-electric"
 aria-label="기업 검색"
 />
 </div>
 </div>

 {/* 검색바 직하 광고 */}
 <div className="max-w-3xl mx-auto mb-8">
 <HomeTopAd />
 </div>

 {/* Company Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredCompanies.map((company, idx) => (
 <Fragment key={company.id}>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 >
 <Link href={`/salary-db/${company.id}`} className="block h-full">
 <div className="group h-full duotone-card p-6 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 relative overflow-hidden">
 <div className="flex justify-between items-start mb-4">
 <div className="w-12 h-12 text-4xl flex items-center justify-center bg-secondary rounded-xl group-hover:scale-110 transition-transform">
 {company.logo}
 </div>
 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${company.tier === 'conglomerate' ? 'bg-canvas-dark text-electric 900/30 300' :
 company.tier === 'unicorn' ? 'bg-primary/10 text-primary/30 ' :
 company.tier === 'public' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ' :
 'bg-canvas-dark text-muted-blue '
 }`}>
 {company.tier === 'public' ? '공기업' : company.tier}
 </span>
 </div>

 <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
 {company.name.ko}
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
 {(company.salary.entry.base / 10000).toLocaleString('ko-KR')}~{(company.salary.senior.base / 10000).toLocaleString('ko-KR')}만원
 </span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-muted-foreground flex items-center gap-1">
 <TrendingUp className="w-4 h-4" /> 평균 인센
 </span>
 <span className="font-bold text-electric tabular-nums">
 {company.salary.entry.incentive.target}%
 </span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-muted-foreground">📅 주 실근무</span>
 <span className="font-bold text-foreground tabular-nums">
 {company.workLife.weeklyHours.real}h
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
 </motion.div>
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
 <p className="text-muted-foreground">
 아직 등록되지 않은 기업이거나 검색어를 확인해주세요.<br />
 (현재 {allCompanies.length.toLocaleString("ko-KR")}개 기업 데이터 제공 중)
 </p>
 </div>
 )}

 {/* 회사 그리드 후 광고 + 쿠팡 */}
 <div className="max-w-3xl mx-auto mt-12">
 <InArticleAd />
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 </div>
 </div>
 </main>
 );
}
