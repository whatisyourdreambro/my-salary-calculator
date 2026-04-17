import type { Metadata } from "next";
import Link from "next/link";
import {
  Gift, Briefcase, TrendingUp, Home, CreditCard, Laptop,
  Heart, PiggyBank, Calculator, Calendar, Scale, Flame,
  DollarSign, Percent, Activity, Building2, ChevronRight,
  Divide, Globe, Fuel, RefreshCw, Users, Zap
} from "lucide-react";

export const metadata: Metadata = {
  title: "금융 계산기 모음 2026 | 30가지 세금·재테크 계산기 - 머니샐러리",
  description: "성과급 세금 계산기, 퇴직금, 증여세, 취득세, 주식 양도세, 연봉 계산기 등 2026년 세법 기준 30가지 금융 계산기를 무료로 이용하세요.",
};

type CalcItem = {
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
  tag?: string;
  isNew?: boolean;
  isHot?: boolean;
};

const CATEGORIES: { title: string; color: string; items: CalcItem[] }[] = [
  {
    title: "소득세 계산기",
    color: "text-primary",
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
    color: "text-primary",
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
    color: "text-primary",
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
    color: "text-primary",
    items: [
      { title: "취득세 계산기", desc: "주택·토지 취득세·교육세", href: "/tools/real-estate/acquisition-tax", icon: Home, isNew: true },
      { title: "증여세 계산기", desc: "가족 간 증여한도·세율", href: "/tools/real-estate/gift-tax", icon: Heart, isNew: true },
      { title: "부가세(VAT) 계산기", desc: "공급가·세금 역산", href: "/tools/finance/vat", icon: Percent },
    ],
  },
  {
    title: "생활 · 일반 계산기",
    color: "text-primary",
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

function TagBadge({ label, type }: { label: string; type: "new" | "hot" }) {
  return (
    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${type === "new" ? "bg-primary text-white" : "bg-red-500 text-white"}`}>
      {label}
    </span>
  );
}

export default function ToolsHubPage() {
  const totalCount = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 pb-12 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6">
            <Calculator size={14} /> 2026 세법 전면 업데이트
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
            금융 계산기 <span className="text-primary">{totalCount}종</span> 모음
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            성과급·퇴직금·증여세·주식세금까지 — 직장인이 꼭 필요한 모든 금융 계산기를 2026년 최신 세법으로 무료 제공합니다.
          </p>
          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-8">
            {[["30+", "계산기"], ["2026", "세법 기준"], ["무료", "전체 이용"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-primary">{val}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Highlights */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-black bg-primary text-white px-3 py-1 rounded-sm uppercase tracking-widest">NEW</span>
            <h2 className="text-xl font-black text-slate-900">신규 추가 계산기</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "성과급 세금 계산기", desc: "연봉합산 방식 2026 세법", href: "/tools/finance/bonus", icon: Gift },
              { title: "퇴직금 세금 계산기", desc: "환산급여 방식 퇴직소득세", href: "/tools/finance/severance", icon: Briefcase },
              { title: "복리 계산기", desc: "적립식 40년 자산 시뮬레이션", href: "/tools/finance/compound", icon: Zap },
              { title: "주식 양도소득세", desc: "해외주식 250만원 공제 포함", href: "/tools/finance/stock-tax", icon: TrendingUp },
              { title: "취득세 계산기", desc: "주택·토지 취득세 전체 계산", href: "/tools/real-estate/acquisition-tax", icon: Home },
              { title: "증여세 계산기", desc: "가족별 공제한도·세율", href: "/tools/real-estate/gift-tax", icon: Heart },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="group flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors flex-shrink-0">
                  <item.icon size={22} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* All Categories */}
        {CATEGORIES.map((cat, ci) => (
          <div key={ci} className="mb-14">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-primary">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-sm">{ci + 1}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">{cat.title}</h2>
              <span className="text-xs text-slate-400 font-medium">{cat.items.length}개</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.items.map((item) => (
                <Link key={item.href} href={item.href}
                  className="group flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all bg-white shadow-sm hover:shadow-md">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 group-hover:bg-primary flex items-center justify-center transition-colors flex-shrink-0">
                    <item.icon size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{item.title}</p>
                      {item.isNew && <TagBadge label="NEW" type="new" />}
                      {item.isHot && <TagBadge label="HOT" type="hot" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-200 group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* SEO Bottom Content */}
        <div className="mt-16 p-8 bg-slate-50 border border-gray-100 rounded-2xl">
          <h2 className="text-lg font-black text-slate-900 mb-3">2026 세법 업데이트 완료</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            머니샐러리의 모든 금융 계산기는 2026년 최신 세법을 반영합니다. 근로소득세, 퇴직소득세, 양도소득세, 증여세 등
            주요 세목의 세율과 공제한도를 정확히 반영하여 신뢰할 수 있는 참고 자료로 활용하실 수 있습니다.
            단, 실제 납세액은 개인별 공제 항목에 따라 다를 수 있으므로 세무 전문가와 상담하시기를 권고드립니다.
          </p>
        </div>
      </div>
    </main>
  );
}
