"use client";

import { useState } from "react";
import Link from "next/link";
import { companies } from "@/lib/companyData";
import { Search, Building2, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import AdUnit from "@/components/AdUnit";

export default function CompanyPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        기업 연봉 데이터베이스
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        대한민국 주요 기업의 연봉, 복지, 그리고 성장률을 투명하게 확인하세요.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8 relative">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="기업명, 산업, 또는 태그로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-card/50 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                        />
                    </div>
                </div>

                {/* Ad Unit: Below Search */}
                <div className="mb-12">
                    <AdUnit slotId="5566778899" format="auto" label="Company List Top Ad" />
                </div>

                {/* Company Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company, index) => (
                        <Link href={`/company/${company.id}`} key={company.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-card/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                            >
                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl ${company.logo} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                            {company.name[0]}
                                        </div>
                                        <span className="px-3 py-1 bg-secondary/50 rounded-full text-xs font-medium text-muted-foreground">
                                            {company.industry}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                        {company.name}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {company.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-secondary/30 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <Users className="w-3 h-3" />
                                                평균 연봉
                                            </div>
                                            <div className="font-bold text-lg">
                                                {company.averageSalary.toLocaleString()}만원
                                            </div>
                                        </div>
                                        <div className="bg-secondary/30 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <TrendingUp className="w-3 h-3" />
                                                신입 초봉
                                            </div>
                                            <div className="font-bold text-lg text-emerald-500">
                                                {company.entryLevelSalary.toLocaleString()}만원
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {company.tags.map((tag) => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Ad Unit: Bottom */}
                <div className="mt-12">
                    <AdUnit slotId="9988776655" format="auto" label="Company List Bottom Ad" />
                </div>

                {filteredCompanies.length === 0 && (
                    <div className="text-center py-20">
                        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-muted-foreground">검색 결과가 없습니다.</h3>
                        <p className="text-sm text-muted-foreground/60 mt-2">다른 검색어로 다시 시도해보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
