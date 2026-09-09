"use client";

import type { ReactNode } from "react";
import { CompanyProfile } from "@/types/company";
import dynamic from "next/dynamic";
import Link from "@/components/AppLink";
import {
 Briefcase,
 Clock,
 Heart,
 DollarSign,
 Trophy,
 Zap,
 Car,
 TrendingUp,
 ArrowRight
} from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";
import { CalcResultAd } from "@/components/AdPlacement";
import { calculateSalary2026 } from "@/lib/TaxLogic";

const formatMoney = (val: number) => `${(val / 10000).toLocaleString('ko-KR')}만원`;

// 히어로 배지 — 영문 enum(CONGLOMERATE 등) raw 노출 방지 한글 매핑
// (SalaryDbClient 의 TIER_LABEL 과 동일 규칙)
const TIER_LABEL_KO: Record<string, string> = {
 conglomerate: "대기업",
 unicorn: "유니콘",
 startup: "스타트업",
 foreign: "외국계",
 public: "공기업",
};

// 무거운 recharts 차트는 클라이언트에서만 + 지연 로드 → 432개 회사 페이지의
// 초기 번들(First Load JS)에서 recharts(~60kB) 분리. (WealthChart 와 동일 패턴)
const SalaryRoadmapChart = dynamic(() => import("./SalaryRoadmapChart"), {
 ssr: false,
 loading: () => (
 <div className="h-full w-full animate-pulse rounded-xl bg-canvas-200/40" />
 ),
});

export default function CompanyDetailClient({ company, summary }: { company: CompanyProfile; summary?: ReactNode }) {
 // Prepare Chart Data
 const salaryData = [
 { level: "신입", base: company.salary.entry.base, total: company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0) },
 { level: "주니어", base: company.salary.junior.base, total: company.salary.junior.base + (company.salary.junior.incentive.avgAmount || 0) },
 { level: "시니어", base: company.salary.senior.base, total: company.salary.senior.base + (company.salary.senior.incentive.avgAmount || 0) },
 { level: "리드", base: company.salary.lead.base, total: company.salary.lead.base + (company.salary.lead.incentive.avgAmount || 0) },
 { level: "임원", base: company.salary.executive.base, total: company.salary.executive.base + (company.salary.executive.incentive.avgAmount || 0) },
 ];

 // The same annual tax estimate as the salary comparison; this is a fixed savings scenario.
 const monthlyNetIncome = calculateSalary2026(company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0), 200_000, 1, 0).netPay;
 const monthsToGoal = monthlyNetIncome > 0 ? Math.ceil(60_000_000 / (monthlyNetIncome * 0.5)) : null;

 return (
 <main className="w-full min-h-screen bg-background pb-20">
 {/* Hero Header */}
 <header className="border-b border-border bg-card py-8 sm:py-12">
 <div className="ms-page flex flex-col items-start gap-5 md:flex-row md:gap-6">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary text-2xl font-bold text-link" aria-hidden="true">
 {company.name.ko.slice(0, 1)}
 </div>
 <div className="min-w-0">
 <div className="mb-4 flex flex-wrap items-center gap-3">
 <h1 className="ms-title">{company.name.ko} 연봉 2026</h1>
 <span className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-sm font-medium text-foreground">
 {TIER_LABEL_KO[company.tier] ?? company.tier}
 </span>
 </div>
 <p className="ms-description max-w-3xl">{company.description}</p>
 <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">공시 자료와 머니샐러리 DB의 추정값을 구분해 확인하세요. 회사 평균과 개인의 계약 연봉은 다를 수 있습니다.</p>
 <div className="mt-6">
 <ShareButtons
 title={`${company.name.ko} 연봉 및 기업 정보 | Moneysalary`}
 description={`${company.name.ko}의 신입 초봉, 평균 연봉, 복지 정보를 확인하세요.`}
 className="justify-start"
 />
 </div>
 {/* 재방문 루프 — 회사 페이지가 즐겨찾기 효과 최대 지점 ("{회사명} 연봉" 재검색 대체) */}
 <div className="mt-4 flex justify-start">
 <FavoritesButton title={`${company.name.ko} 연봉`} />
 </div>
 </div>
 </div>
 </header>

 <div className="page-width relative space-y-8 pt-8">
 {summary}
 {/* Quick Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <StatCard
 icon={DollarSign}
 label="신입 총보상 추정"
 value={formatMoney(company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0))}
 sub="기본급 + 평균 인센티브 (본 DB 추정 기준)"
 color="text-primary"
 />
 <StatCard
 icon={Clock}
 label="참고 근무 시간"
 value={`${company.workLife.weeklyHours.real}시간`}
 sub={`DB 입력값 · 계약 ${company.workLife.weeklyHours.contract}시간 대비`}
 color="text-electric"
 />
 <StatCard
 icon={Trophy}
 label="문화 참고 지표"
 value={`${company.culture.score}/10`}
 sub="조사 출처·기간·표본 미연결"
 color="text-primary"
 />
 <StatCard
 icon={Zap}
 label="인센티브 범위"
 value={company.salary.entry.incentive.max > 0 ? `최대 ${company.salary.entry.incentive.max}%` : "현금 중심 보상"}
 sub={company.salary.entry.incentive.max > 0 ? "연봉 대비 비율" : "별도 인센티브 없이 연봉 중심 책정"}
 color="text-primary"
 />
 </div>

 {/* Quick Stats 직후 첫 광고 — 회사명 검색 의도 정점 */}
 <CalcResultAd />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left Column: Charts & Analysis */}
 <div className="lg:col-span-2 space-y-8">
 {/* Salary Progression Chart */}
 <section className="bg-card border border-border rounded-2xl p-6 shadow-lg">
 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-primary" />
 커리어 연봉 로드맵
 </h2>
 <div className="h-[300px] w-full">
 <SalaryRoadmapChart data={salaryData} />
 </div>
 <p className="text-sm text-muted-foreground mt-4 text-center">
 * 성과급 및 스톡옵션 포함 추정치입니다.
 </p>
 </section>

 {/* Life Simulator */}
 <section className="ms-surface ms-panel">
 <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
 <Car className="w-5 h-5" />
 목표 금액 모으기
 </h2>
 <div className="relative z-10">
 <p className="mb-6 text-base leading-7 text-muted-foreground">
 DB의 신입 영끌 연봉으로 계산한 월 실수령 추정액의 50%를 저축한다면,<br />
 <span className="font-semibold text-foreground">목표 6,000만원</span>까지 얼마나 걸릴까요?
 </p>
 <div className="flex items-baseline gap-2">
 <span className="text-4xl font-bold tabular-nums text-link">
 {monthsToGoal === null ? "—" : monthsToGoal.toLocaleString("ko-KR")}
 </span>
 <span className="text-xl font-bold">개월</span>
 </div>
 <p className="mt-3 text-sm text-muted-foreground">
 {monthsToGoal === null ? "급여 자료를 확인해 주세요." : `(약 ${Math.ceil(monthsToGoal / 12)}년 · 현재 저축액 0원, 이자·물가 변화 제외)`}
 </p>
 <p className="mt-3 text-sm leading-6 text-muted-foreground">
 본인 1명·자녀 0명·월 비과세 20만원, 연간 세액을 월로 나눈 간이 추정입니다.
 성과급도 12개월에 나눠 받는 가정이므로 실제 월급·지급 시점과 다릅니다.
 </p>
 <Link
 href="/car-loan"
 className="ms-button ms-button-secondary mt-5 text-sm"
 >
 자동차 할부 상환액 비교하기
 <ArrowRight className="w-4 h-4" aria-hidden />
 </Link>
 </div>
 </section>
 </div>

 {/* Right Column: Details */}
 <div className="space-y-6">
 {/* Culture & WorkLife */}
 <section className="bg-card border border-border rounded-2xl p-6 shadow-lg">
 <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
 <Heart className="w-5 h-5 text-electric" />
 조직 문화 & 워라밸
 </h2>

 <div className="space-y-4">
 <div>
 <p className="text-sm text-muted-foreground mb-1">근무 형태</p>
 <div className="flex items-center gap-2">
 <span className={`px-2 py-1 rounded text-xs font-bold ${company.workLife.remoteWork.policy === 'remote' ? 'bg-primary/5 text-primary' :
 company.workLife.remoteWork.policy === 'hybrid' ? 'bg-canvas-dark text-electric' :
 'bg-canvas-dark text-muted-blue'
 }`}>
 {company.workLife.remoteWork.policy.toUpperCase()}
 </span>
 <span className="text-sm">{company.workLife.remoteWork.description}</span>
 </div>
 </div>

 <div>
 <p className="text-sm text-muted-foreground mb-1">키워드</p>
 <div className="flex flex-wrap gap-2">
 {company.culture.keywords.map(k => (
 <span key={k} className="px-2 py-1 bg-secondary rounded-full text-xs font-medium">
 #{k}
 </span>
 ))}
 </div>
 </div>

 <div className="pt-4 border-t border-border">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="mb-2 text-sm font-semibold text-foreground">장점으로 기록된 항목</p>
 <ul className="text-xs space-y-1 text-muted-foreground">
 {company.culture.pros.map(p => <li key={p}>• {p}</li>)}
 </ul>
 </div>
 <div>
 <p className="mb-2 text-sm font-semibold text-foreground">확인이 필요한 항목</p>
 <ul className="text-xs space-y-1 text-muted-foreground">
 {company.culture.cons.map(c => <li key={c}>• {c}</li>)}
 </ul>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Benefits */}
 <section className="bg-card border border-border rounded-2xl p-6 shadow-lg">
 <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-primary" />
 주요 복지 (Benefits)
 </h2>
 <div className="space-y-3">
 {company.benefits.map((benefit, idx) => (
 <div key={idx} className="flex gap-3 items-start">
 <div className="w-1 h-1 mt-2 rounded-full bg-primary flex-shrink-0" />
 <div>
 <p className="text-sm font-bold">{benefit.title}</p>
 <p className="text-xs text-muted-foreground">{benefit.description}</p>
 {benefit.value && benefit.value > 0 && (
 <p className="text-xs text-primary font-medium mt-0.5">
 + 연 {formatMoney(benefit.value)} 가치
 </p>
 )}
 </div>
 </div>
 ))}
 </div>
 </section>
 </div>
 </div>
 </div>
 </main>
 );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
 icon: React.ElementType;
 label: string;
 value: string;
 sub: string;
 color: string;
}) {
 return (
 <div className="ms-surface p-5">
 <div className="flex items-center gap-3 mb-2">
 <div className={`p-2 rounded-lg bg-secondary ${color}`}>
 <Icon className="w-5 h-5" />
 </div>
 <span className="text-sm font-medium text-muted-foreground">{label}</span>
 </div>
 <p className="text-2xl font-black tracking-tight">{value}</p>
 <p className="text-xs text-muted-foreground mt-1">{sub}</p>
 </div>
 )
}
