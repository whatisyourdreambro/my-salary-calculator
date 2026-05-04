// src/components/CompanyInsights.tsx
//
// 회사 페이지에 자동 생성되는 SEO 콘텐츠 섹션.
// CompanyDetailClient의 그래프/카드와 별도로, 검색 친화적인 텍스트 콘텐츠 제공.
// 페이지마다 unique 콘텐츠가 자동으로 생성되어 thin content 페널티 회피.

import Link from "next/link";
import { TrendingUp, Award, ArrowRight, Building2 } from "lucide-react";
import type { CompanyProfile } from "@/types/company";
import {
 getIndustryBenchmark,
 getSimilarSalaryCompanies,
 formatSalaryKorean,
 describeSalaryGrowth,
 describeWorkLife,
} from "@/lib/companyContentBuilder";

interface CompanyInsightsProps {
 company: CompanyProfile;
}

export default function CompanyInsights({ company }: CompanyInsightsProps) {
 const benchmark = getIndustryBenchmark(company);
 const similarCompanies = getSimilarSalaryCompanies(company, 5);
 const koName = company.name.ko;
 const enName = company.name.en;
 const entryTotal =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);

 return (
 <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
 {/* 자동 요약 카드 */}
 <div className="p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl sm:text-2xl font-black text-navy mb-4">
 {koName} 연봉·워라밸 핵심 요약
 </h2>
 <div className="space-y-3 text-sm sm:text-base text-muted-blue leading-relaxed">
 <p>
 <strong className="text-navy">{koName}</strong>({enName})는 {company.industry} 업종의 {company.tier === "conglomerate" ? "대기업" : company.tier === "unicorn" ? "유니콘" : company.tier === "startup" ? "스타트업" : "외국계"}로,{" "}
 신입 영끌 연봉 <strong className="text-electric">{formatSalaryKorean(entryTotal)}</strong> 수준을 형성합니다.
 </p>
 <p>
 <strong className="text-navy">연봉 성장:</strong> {describeSalaryGrowth(company)}
 </p>
 <p>
 <strong className="text-navy">워라밸:</strong> {describeWorkLife(company)}
 </p>
 {company.workLife.remoteWork.policy !== "office" && (
 <p>
 <strong className="text-navy">원격근무:</strong>{" "}
 {company.workLife.remoteWork.policy === "remote"
 ? "전면 원격"
 : `하이브리드 (주 ${company.workLife.remoteWork.daysPerWeek}일 사무실)`}
 </p>
 )}
 </div>
 </div>

 {/* 업종 평균 대비 */}
 {benchmark && (
 <div className="p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl sm:text-2xl font-black text-navy mb-2 flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-electric" />
 같은 업종({company.industry}) 평균 대비
 </h2>
 <p className="text-sm text-faint-blue mb-6">
 표본 {benchmark.sampleSize}개 회사 비교
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="p-5 bg-canvas rounded-2xl">
 <p className="text-xs text-faint-blue font-bold mb-2">
 신입 영끌 평균
 </p>
 <p className="text-2xl font-black text-navy mb-1">
 {formatSalaryKorean(benchmark.averageEntry)}
 </p>
 <p
 className={`text-xs font-bold ${
 entryTotal > benchmark.averageEntry
 ? "text-green-600"
 : "text-red-500"
 }`}
 >
 {koName}: {formatSalaryKorean(entryTotal)} (
 {entryTotal > benchmark.averageEntry ? "+" : ""}
 {Math.round(((entryTotal - benchmark.averageEntry) / benchmark.averageEntry) * 100)}%)
 </p>
 </div>
 <div className="p-5 bg-canvas rounded-2xl">
 <p className="text-xs text-faint-blue font-bold mb-2">
 시니어 영끌 평균
 </p>
 <p className="text-2xl font-black text-navy mb-1">
 {formatSalaryKorean(benchmark.averageSenior)}
 </p>
 <p className="text-xs text-faint-blue">
 업종 평균 대비 백분위: 상위 {100 - benchmark.percentile}%
 </p>
 </div>
 </div>
 </div>
 )}

 {/* 같은 연봉대 cross-link */}
 {similarCompanies.length > 0 && (
 <div>
 <h2 className="text-xl sm:text-2xl font-black text-navy mb-2 flex items-center gap-2">
 <Building2 className="w-5 h-5 text-electric" />
 비슷한 연봉대 회사 {similarCompanies.length}개
 </h2>
 <p className="text-sm text-faint-blue mb-6">
 {koName}와 신입 연봉이 ±15% 범위 내인 회사
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {similarCompanies.map((peer) => {
 const peerTotal =
 peer.salary.entry.base + (peer.salary.entry.incentive.avgAmount || 0);
 return (
 <Link
 key={peer.id}
 href={`/salary-db/${peer.id}`}
 className="group p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <p className="text-xs text-faint-blue font-bold mb-1">
 {peer.industry}
 </p>
 <p className="font-black text-navy text-sm mb-2 group-hover:text-electric transition-colors">
 {peer.name.ko}
 </p>
 <p className="text-base font-bold text-electric mb-1">
 {formatSalaryKorean(peerTotal)}
 </p>
 <div className="flex items-center gap-1 text-xs font-bold text-faint-blue group-hover:text-electric mt-3 transition-colors">
 자세히 보기
 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
 </div>
 </Link>
 );
 })}
 </div>
 </div>
 )}

 {/* 다음 액션 CTA */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Link
 href="/home-loan"
 className="p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
 >
 <Award className="w-6 h-6 opacity-70 mb-3" />
 <p className="font-black text-lg mb-2">
 이 연봉으로 받을 수 있는 대출
 </p>
 <p className="text-sm opacity-90">
 신입 {formatSalaryKorean(entryTotal)} 기준 DSR 40% 한도 시뮬
 </p>
 </Link>
 <Link
 href="/year-end-tax"
 className="p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <TrendingUp className="w-6 h-6 text-electric mb-3" />
 <p className="font-black text-lg mb-2">
 연말정산 환급금 미리 보기
 </p>
 <p className="text-sm text-muted-blue">
 {koName} 연봉 기준 13월의 월급 시뮬
 </p>
 </Link>
 </div>
 </section>
 );
}
