import type { Metadata } from "next";
import Link from "next/link";
import {
 Gift, Briefcase, TrendingUp, Home, CreditCard, Laptop,
 Heart, PiggyBank, Calculator, Calendar, Scale, Flame,
 DollarSign, Percent, Activity, Building2, ChevronRight,
 Globe, Fuel, RefreshCw, Users, Zap
} from "lucide-react";
import CoupangBanner from "@/components/CoupangBanner";
import { PageShell, PageHero } from "@/components/ui/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";

export const metadata: Metadata = {
 title: "금융 계산기 모음 2026 | 30가지 세금·재테크 계산기 - 머니샐러리",
 description: "성과급 세금 계산기, 퇴직금, 증여세, 취득세, 주식 양도세, 연봉 계산기 등 2026년 세법 기준 30가지 금융 계산기를 무료로 이용하세요.",
};

type CalcItem = {
 title: string;
 desc: string;
 href: string;
 icon: React.ElementType;
 isNew?: boolean;
 isHot?: boolean;
};

const CATEGORIES: { title: string; items: CalcItem[] }[] = [
 {
 title: "소득세 계산기",
 items: [
 { title: "연봉 실수령액 계산기", desc: "4대보험·소득세 완벽 계산", href: "/", icon: DollarSign, isHot: true },
 { title: "성과급·인센티브 세금", desc: "2026 연봉합산 세율 적용", href: "/tools/finance/bonus", icon: Gift, isNew: true, isHot: true },
 { title: "퇴직금 세금 계산기", desc: "환산급여 방식 퇴직소득세", href: "/tools/finance/severance", icon: Briefcase, isNew: true },
 { title: "프리랜서 종합소득세", desc: "사업소득·필요경비 계산", href: "/tools/finance/freelance-tax", icon: Laptop, isNew: true },
 { title: "주식 양도소득세", desc: "해외주식·대주주 세금 계산", href: "/tools/finance/stock-tax", icon: TrendingUp, isNew: true },
 { title: "연말정산 계산기", desc: "환급액 미리 계산", href: "/year-end-tax", icon: RefreshCw },
 ],
 },
 {
 title: "재테크 · 투자 계산기",
 items: [
 { title: "복리 계산기", desc: "적립식 투자 미래 자산 시뮬레이션", href: "/tools/finance/compound", icon: Zap, isNew: true },
 { title: "예적금 만기 계산기", desc: "이자·원리금 계산", href: "/tools/deposit", icon: PiggyBank },
 { title: "IRP·연금저축 세액공제", desc: "최대 900만원 공제 계산", href: "/tools/finance/irp", icon: Building2 },
 { title: "CAGR 연평균 수익률", desc: "투자 기간별 수익률 계산", href: "/tools/finance/cagr", icon: Activity },
 { title: "FIRE 조기은퇴 계산기", desc: "경제적 자유 달성 시뮬레이션", href: "/fire-calculator", icon: Flame },
 { title: "구독 서비스 비용", desc: "월 총 구독료 분석", href: "/tools/life/subscription", icon: CreditCard },
 ],
 },
 {
 title: "대출 · 부동산 계산기",
 items: [
 { title: "대출 이자 계산기", desc: "원리금균등·원금균등상환", href: "/tools/loan", icon: Calculator },
 { title: "주택담보대출 계산기", desc: "모기지 상환 시뮬레이션", href: "/home-loan", icon: Home },
 { title: "자동차 할부 계산기", desc: "월 납부액·잔금 계산", href: "/car-loan", icon: Fuel },
 { title: "할부 이자 계산기", desc: "신용카드 할부·카드론", href: "/tools/finance/installment", icon: CreditCard, isNew: true },
 { title: "DSR 한도 계산기", desc: "총부채원리금상환비율", href: "/tools/real-estate/dsr", icon: Percent },
 { title: "LTV 담보인정비율", desc: "주택담보대출 가능액 계산", href: "/tools/real-estate/ltv", icon: Scale },
 ],
 },
 {
 title: "부동산 세금 계산기",
 items: [
 { title: "취득세 계산기", desc: "주택·토지 취득세·교육세", href: "/tools/real-estate/acquisition-tax", icon: Home, isNew: true },
 { title: "증여세 계산기", desc: "가족 간 증여한도·세율", href: "/tools/real-estate/gift-tax", icon: Heart, isNew: true },
 { title: "부가세(VAT) 계산기", desc: "공급가·세금 역산", href: "/tools/finance/vat", icon: Percent },
 ],
 },
 {
 title: "생활 · 일반 계산기",
 items: [
 { title: "BMI 비만도 계산기", desc: "체질량지수·비만 등급", href: "/tools/health/bmi", icon: Activity },
 { title: "나이 계산기", desc: "만 나이·한국 나이 계산", href: "/tools/date/age", icon: Calendar },
 { title: "D-Day 계산기", desc: "날짜 차이·남은 일수", href: "/tools/date/d-day", icon: Calendar },
 { title: "근무일수 계산기", desc: "평일·공휴일 제외 계산", href: "/tools/date/work-days", icon: Calendar },
 { title: "더치페이 계산기", desc: "인원별 금액 분배", href: "/tools/life/dutch-pay", icon: Users },
 { title: "연비·유류비 계산기", desc: "주유비용 계산", href: "/tools/life/fuel-cost", icon: Fuel },
 { title: "단위 변환기", desc: "길이·무게·온도 변환", href: "/tools/life/unit-converter", icon: RefreshCw },
 { title: "백분율 계산기", desc: "퍼센트·할인율 계산", href: "/tools/math/percent", icon: Percent },
 { title: "랜덤 번호 생성기", desc: "로또·추첨 번호", href: "/tools/math/number-gen", icon: Calculator },
 ],
 },
];

const NEW_HIGHLIGHTS = [
 { title: "성과급 세금 계산기", desc: "연봉합산 방식 2026 세법", href: "/tools/finance/bonus", icon: Gift },
 { title: "퇴직금 세금 계산기", desc: "환산급여 방식 퇴직소득세", href: "/tools/finance/severance", icon: Briefcase },
 { title: "복리 계산기", desc: "적립식 40년 자산 시뮬레이션", href: "/tools/finance/compound", icon: Zap },
 { title: "주식 양도소득세", desc: "해외주식 250만원 공제 포함", href: "/tools/finance/stock-tax", icon: TrendingUp },
 { title: "취득세 계산기", desc: "주택·토지 취득세 전체 계산", href: "/tools/real-estate/acquisition-tax", icon: Home },
 { title: "증여세 계산기", desc: "가족별 공제한도·세율", href: "/tools/real-estate/gift-tax", icon: Heart },
];

export default function ToolsHubPage() {
 const totalCount = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);

 return (
 <PageShell background="canvas" container="page" spacing="normal">
 {/* ── Hero ─────────────────────────────────────────────────── */}
 <PageHero
 size="lg"
 align="center"
 badge={
 <Badge intent="info" size="md">
 <Calculator size={13} aria-hidden="true" />
 2026 세법 전면 업데이트
 </Badge>
 }
 title={
 <>
 금융 계산기 <span className="text-electric">{totalCount}종</span> 모음
 </>
 }
 description="성과급·퇴직금·증여세·주식세금까지 — 직장인이 꼭 필요한 모든 금융 계산기를 2026년 최신 세법으로 무료 제공합니다."
 >
 <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
 <Stat value={totalCount} suffix="+" label="계산기" size="sm" align="center" />
 <Stat value={2026} suffix="년" label="세법 기준" size="sm" align="center" />
 <Stat value="무료" label="전체 이용" size="sm" align="center" />
 </div>
 </PageHero>

 {/* ── 신규 추가 ─────────────────────────────────────────────── */}
 <section className="mb-16" aria-labelledby="new-tools-heading">
 <div className="flex items-center gap-3 mb-6">
 <Badge intent="primary" size="sm">NEW</Badge>
 <h2 id="new-tools-heading" className="text-xl font-black text-navy dark:text-canvas-50">신규 추가 계산기</h2>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
 {NEW_HIGHLIGHTS.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className="group flex items-center gap-4 p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 no-tap-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
 >
 <div className="w-12 h-12 rounded-xl bg-electric-5 flex items-center justify-center group-hover:bg-electric transition-colors flex-shrink-0">
 <item.icon size={22} className="text-electric group-hover:text-white transition-colors" aria-hidden="true" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-extrabold text-navy dark:text-canvas-50 text-sm group-hover:text-electric transition-colors">{item.title}</p>
 <p className="text-xs text-faint-blue mt-0.5 truncate">{item.desc}</p>
 </div>
 <ChevronRight size={16} className="text-faint-blue group-hover:text-electric flex-shrink-0 transition-all group-hover:translate-x-0.5" aria-hidden="true" />
 </Link>
 ))}
 </div>
 </section>

 {/* ── All Categories ────────────────────────────────────────── */}
 {CATEGORIES.map((cat, ci) => (
 <section key={ci} className="mb-12 sm:mb-14" aria-labelledby={`cat-${ci}-heading`}>
 <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-electric">
 <div className="w-8 h-8 bg-electric rounded-lg flex items-center justify-center" aria-hidden="true">
 <span className="text-white font-black text-sm tabular-nums">{ci + 1}</span>
 </div>
 <h2 id={`cat-${ci}-heading`} className="text-xl font-black text-navy dark:text-canvas-50">{cat.title}</h2>
 <span className="text-xs text-faint-blue font-bold tabular-nums">{cat.items.length}개</span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {cat.items.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className="group flex items-center gap-4 p-4 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-xl hover:border-electric hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 no-tap-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
 >
 <div className="w-10 h-10 rounded-lg bg-canvas dark:bg-canvas-800 group-hover:bg-electric-10 flex items-center justify-center transition-colors flex-shrink-0">
 <item.icon size={18} className="text-electric transition-colors" aria-hidden="true" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <p className="font-bold text-navy dark:text-canvas-50 text-sm group-hover:text-electric transition-colors">{item.title}</p>
 {item.isNew && <Badge intent="primary" size="sm">NEW</Badge>}
 {item.isHot && <Badge intent="info" size="sm">HOT</Badge>}
 </div>
 <p className="text-xs text-faint-blue mt-0.5 truncate">{item.desc}</p>
 </div>
 <ChevronRight size={14} className="text-faint-blue group-hover:text-electric flex-shrink-0 transition-all group-hover:translate-x-0.5" aria-hidden="true" />
 </Link>
 ))}
 </div>
 </section>
 ))}

 {/* 쿠팡 파트너스 — 카테고리 섹션과 SEO 본문 사이 */}
 <div className="mt-16">
 <CoupangBanner
 responsive={{ mobile: "rectangle", desktop: "leaderboard" }}
 />
 </div>

 {/* SEO Bottom Content */}
 <div className="mt-16 p-6 sm:p-8 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl">
 <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">2026 세법 업데이트 완료</h2>
 <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
 머니샐러리의 모든 금융 계산기는 2026년 최신 세법을 반영합니다. 근로소득세, 퇴직소득세, 양도소득세, 증여세 등
 주요 세목의 세율과 공제한도를 정확히 반영하여 신뢰할 수 있는 참고 자료로 활용하실 수 있습니다.
 단, 실제 납세액은 개인별 공제 항목에 따라 다를 수 있으므로 세무 전문가와 상담하시기를 권고드립니다.
 </p>
 </div>
 </PageShell>
 );
}
