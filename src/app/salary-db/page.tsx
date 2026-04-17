"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Building2, TrendingUp, Users, ArrowRight, Database } from "lucide-react";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import AdUnit from "@/components/AdUnit";

export default function SalaryDBPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const allCompanies = companyRepository.getAll();

    const filteredCompanies = searchTerm
        ? companyRepository.search(searchTerm)
        : allCompanies;

    return (
        <main className="w-full min-h-screen bg-slate-50 dark:bg-[#191F28] pb-20">
            {/* Hero Section */}
            <section className="relative pt-28 pb-14 overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-[#0f1623] dark:via-[#191F28] dark:to-[#1a2035] -z-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px] -z-10" />

                <div className="relative z-10 max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6">
                            <Database className="w-4 h-4" />
                            Corporate Salary Database
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-slate-900 dark:text-slate-900">
                            대한민국 <span className="text-blue-600">연봉의 모든 것</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
                            카더라 통신은 그만. <br className="sm:hidden" />
                            실제 데이터에 기반한 기업별 연봉, 복지, 워라밸 정보를 확인하세요.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="기업명, 산업군 검색 (예: 삼성전자, IT)"
                                className="toss-input pl-14"
                            />
                        </div>

                        {/* 상단 광고 */}
                        <div className="mt-10">
                            <AdUnit slotId="5492837410" format="auto" label="Salary DB Hero Ad" />
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Company Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company, idx) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link href={`/salary-db/${company.id}`} className="block h-full">
                                <div className="group h-full toss-card p-6 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 text-4xl flex items-center justify-center bg-secondary rounded-xl group-hover:scale-110 transition-transform">
                                            {company.logo}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${company.tier === 'conglomerate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                company.tier === 'unicorn' ? 'bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                            }`}>
                                            {company.tier}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                                        {company.name.ko}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                                        {company.industry}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Users className="w-4 h-4" /> 신입 초봉
                                            </span>
                                            <span className="font-bold text-foreground">
                                                {(company.salary.entry.base / 10000).toLocaleString('ko-KR')}만원
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4" /> 평균 인센
                                            </span>
                                            <span className="font-bold text-blue-500">
                                                {company.salary.entry.incentive.target}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        상세 리포트 보기 <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {filteredCompanies.length === 0 && (
                    <div className="text-center py-20">
                        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">검색 결과가 없습니다</h3>
                        <p className="text-muted-foreground">
                            아직 등록되지 않은 기업이거나 검색어를 확인해주세요.<br />
                            (현재 Top 3 기업 데이터만 제공 중입니다)
                        </p>
                    </div>
                )}

                {/* Ad Unit */}
                <div className="mt-16">
                    <AdUnit slotId="1122334455" format="auto" label="Salary DB Bottom" />
                </div>
            </div>
        </main>
    );
}
