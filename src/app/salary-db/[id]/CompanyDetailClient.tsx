"use client";

import { CompanyProfile } from "@/types/company";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";
import {
 Briefcase,
 Clock,
 Heart,
 DollarSign,
 Trophy,
 Zap,
 Car,
 TrendingUp
} from "lucide-react";
import CountUp from "react-countup";
import ShareButtons from "@/components/ShareButtons";

const formatMoney = (val: number) => `${(val / 10000).toLocaleString('ko-KR')}만원`;

export default function CompanyDetailClient({ company }: { company: CompanyProfile }) {
 // Prepare Chart Data
 const salaryData = [
 { level: "신입", base: company.salary.entry.base, total: company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0) },
 { level: "주니어", base: company.salary.junior.base, total: company.salary.junior.base + (company.salary.junior.incentive.avgAmount || 0) },
 { level: "시니어", base: company.salary.senior.base, total: company.salary.senior.base + (company.salary.senior.incentive.avgAmount || 0) },
 { level: "리드", base: company.salary.lead.base, total: company.salary.lead.base + (company.salary.lead.incentive.avgAmount || 0) },
 { level: "임원", base: company.salary.executive.base, total: company.salary.executive.base + (company.salary.executive.incentive.avgAmount || 0) },
 ];

 // Buying Power Simulation (Tesla Model 3 ~ 6000만원)
 const monthlyNetIncome = (company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0)) / 12 * 0.85; // Rough net
 const monthsToTesla = Math.ceil(60000000 / (monthlyNetIncome * 0.5)); // Saving 50%

 return (
 <main className="w-full min-h-screen bg-background pb-20">
 {/* Hero Header */}
 <div className="relative bg-electric text-white py-16 overflow-hidden">
 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
 <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent" />

 <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-8">
 <div className="w-24 h-24 text-6xl flex items-center justify-center bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
 {company.logo}
 </div>
 <div className="text-center md:text-left">
 <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
 <h1 className="text-4xl font-black tracking-tight">{company.name.ko}</h1>
 <span className="px-2 py-1 rounded bg-primary text-xs font-bold uppercase">
 {company.tier}
 </span>
 </div>
 <p className="text-faint-blue text-lg max-w-2xl">{company.description}</p>
 <div className="mt-6">
 <ShareButtons
 title={`${company.name.ko} 연봉 및 기업 정보 | Moneysalary`}
 description={`${company.name.ko}의 신입 초봉, 평균 연봉, 복지 정보를 확인하세요.`}
 className="justify-center md:justify-start"
 />
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
 {/* Quick Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <StatCard
 icon={DollarSign}
 label="신입 영끌 연봉"
 value={formatMoney(company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0))}
 sub="기본급 + 평균 인센티브"
 color="text-primary"
 />
 <StatCard
 icon={Clock}
 label="실제 근무 시간"
 value={`${company.workLife.weeklyHours.real}시간`}
 sub={`계약 ${company.workLife.weeklyHours.contract}시간 대비`}
 color="text-electric"
 />
 <StatCard
 icon={Trophy}
 label="기업 문화 점수"
 value={`${company.culture.score}/10`}
 sub={company.culture.keywords[0]}
 color="text-primary"
 />
 <StatCard
 icon={Zap}
 label="인센티브 포텐"
 value={`최대 ${company.salary.entry.incentive.max}%`}
 sub="연봉 대비 비율"
 color="text-primary"
 />
 </div>

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
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={salaryData}>
 <defs>
 <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
 <XAxis dataKey="level" />
 <YAxis tickFormatter={(val) => `${val / 10000000}천`} />
 <Tooltip
 formatter={(value: number) => formatMoney(value)}
 contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
 />
 <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" name="총 보상" />
 <Area type="monotone" dataKey="base" stroke="#7A9AB5" fillOpacity={0.5} fill="transparent" strokeDasharray="5 5" name="기본급" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 <p className="text-sm text-muted-foreground mt-4 text-center">
 * 성과급 및 스톡옵션 포함 추정치입니다.
 </p>
 </section>

 {/* Life Simulator */}
 <section className="bg-gradient-to-br from-indigo-900 to-primary/80 text-navy rounded-2xl p-8 shadow-xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
 <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
 <Car className="w-5 h-5" />
 구매력 시뮬레이터
 </h2>
 <div className="relative z-10">
 <p className="text-indigo-200 mb-6">
 신입사원으로 입사하여 월급의 50%를 저축한다면,<br />
 <span className="text-navy font-bold">테슬라 Model 3</span>를 사는데 얼마나 걸릴까요?
 </p>
 <div className="flex items-baseline gap-2">
 <span className="text-5xl font-black text-primary">
 <CountUp end={monthsToTesla} duration={2} />
 </span>
 <span className="text-xl font-bold">개월</span>
 </div>
 <p className="text-sm text-indigo-300 mt-2">
 (약 {Math.ceil(monthsToTesla / 12)}년 소요 예상)
 </p>
 </div>
 </section>

 {/* Ad Unit */}
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
 <p className="text-xs font-bold text-electric mb-2">PROS 👍</p>
 <ul className="text-xs space-y-1 text-muted-foreground">
 {company.culture.pros.map(p => <li key={p}>• {p}</li>)}
 </ul>
 </div>
 <div>
 <p className="text-xs font-bold text-electric mb-2">CONS 👎</p>
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

function StatCard({ icon: Icon, label, value, sub, color }: any) {
 return (
 <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
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
