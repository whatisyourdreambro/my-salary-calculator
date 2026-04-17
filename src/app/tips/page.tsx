import type { Metadata } from "next";
import { BookOpen, TrendingUp, Shield, CreditCard, Home, Briefcase, ChevronRight } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import Link from "next/link";

export const metadata: Metadata = {
  title: "직장인 꿀팁 모음 | 연봉 협상부터 세금 절세까지 - 머니샐러리",
  description: "직장인이라면 꼭 알아야 할 연봉 협상 전략, 절세 꿀팁, 재테크 방법, 퇴직금 극대화 등 검증된 재정 정보를 총망라했습니다.",
};

const tips = [
  {
    category: "연봉 협상",
    icon: TrendingUp,
    items: [
      { title: "연봉 협상 '최적 타이밍'은 언제인가", desc: "이직 제안 직후가 재직 중보다 평균 20% 높은 협상력을 가집니다. 역제안(Counter offer) 전략과 시장 시세 근거 제시법을 알아두세요." },
      { title: "연봉 외 복리후생 협상법", desc: "성과급 구조, 주식매수선택권(스톡옵션), 퇴직연금 기여율은 세후 소득에 직접적 영향을 줍니다. 연봉 외 '보이지 않는 연봉' 항목을 꼭 따지세요." },
      { title: "이직 시 꼭 확인해야 할 4대 보험 공백 처리", desc: "퇴직 ~ 재입사 사이 '임의계속가입'으로 건강보험료 폭탄을 막을 수 있습니다. 실업급여 신청 자격도 사전에 확인하세요." },
    ]
  },
  {
    category: "절세 전략",
    icon: Shield,
    items: [
      { title: "연말정산 환급 최대화 5가지 공제", desc: "신용카드보다 체크카드(공제율 30%), 전통시장(40%), 대중교통(40%)을 전략적으로 혼합 사용하면 환급액이 달라집니다." },
      { title: "IRP·연금저축 세액공제 한도 완벽 정리", desc: "2026년 기준 IRP+연금저축 합산 최대 900만원(세액공제 13.2%~16.5%)을 최대한 활용하면 세금을 매년 최대 148만원 절감할 수 있습니다." },
      { title: "중소기업 취업자 소득세 감면 놓치지 말기", desc: "만 34세 이하 중소기업 취업자는 최대 5년간 소득세 90%(한도 200만원)를 감면받을 수 있습니다. 국세청 자동 적용이 안 되므로 직접 신청해야 합니다." },
    ]
  },
  {
    category: "재테크 입문",
    icon: CreditCard,
    items: [
      { title: "직장인 첫 투자, ETF가 정답인 이유", desc: "S&P500 ETF(TIGER, KODEX)는 분산투자 효과와 낮은 수수료(0.01~0.07%)로 개별 종목 리스크를 최소화합니다. 매월 자동 매수 설정이 핵심입니다." },
      { title: "청약통장 제대로 쌓는 법 (2026 개편 반영)", desc: "주택청약종합저축 매월 최대 25만원 납입이 소득공제 대상(한도 300만원)입니다. 청약 가점을 위한 납입 횟수 및 금액 전략을 세우세요." },
      { title: "퇴직연금 DC형 vs DB형 어떤 게 유리할까", desc: "연봉 인상률이 높다면 DB형, 투자 운용에 자신 있다면 DC형이 유리합니다. DC형 전환 후 적극적 포트폴리오 운용으로 수익률을 높일 수 있습니다." },
    ]
  },
  {
    category: "부동산 & 내집마련",
    icon: Home,
    items: [
      { title: "생애 최초 주택 구입 세금 혜택 총정리", desc: "취득세 최대 200만원 감면 + 디딤돌 대출(최저 2.35% 금리)을 활용하면 초기 비용을 크게 줄일 수 있습니다. DSR 40% 규제 하에서의 대출 한도 계산이 필수입니다." },
      { title: "전세 vs 월세, 2026년 기준으로 따져보기", desc: "월세 전환율(전세금 대비 월세)이 시중 금리보다 낮다면 전세가 유리합니다. 전월세 전환율 계산기로 직접 비교해 보세요." },
      { title: "신생아 특례대출 자격 조건 완벽 정리", desc: "2023년 이후 출생아를 둔 가구는 최저 1.6% 특례금리(5년)로 최대 5억원까지 대출 가능합니다. 소득 기준 1억 3천만원 이하 확인이 필요합니다." },
    ]
  },
  {
    category: "커리어 & 자기계발",
    icon: Briefcase,
    items: [
      { title: "직장인이 받을 수 있는 국가지원 교육비 정리", desc: "K-디지털 크레딧(국민내일배움카드)으로 최대 300만~500만원의 AI·데이터 교육비를 정부가 지원합니다. 재직자도 신청 가능합니다." },
      { title: "부업·N잡 수익, 세금 신고 제대로 하는 법", desc: "연간 500만원 이상 부업 수익은 종합소득세 신고 대상입니다. 필요경비 처리와 분리과세 선택으로 세부담을 낮출 수 있습니다." },
      { title: "직장인 대출, 신용점수 올리는 현실적인 방법", desc: "카카오뱅크·케이뱅크 주거래 설정, 핀크·토스 신용관리 연계, 통신비 자동이체 등록만으로도 6개월 내 20~50점 향상이 가능합니다." },
    ]
  },
];

const relatedLinks = [
  { label: "연봉 계산기", href: "/", desc: "내 실수령액 계산" },
  { label: "연말정산 계산기", href: "/year-end-tax", desc: "환급액 미리 보기" },
  { label: "IRP·연금 계산기", href: "/tools/deposit", desc: "노후 자산 시뮬레이션" },
  { label: "주택청약 가점 계산", href: "/tools/real-estate/dsr", desc: "청약 당첨 가능성 확인" },
];

export default function TipsPage() {
  return (
    <main className="w-full min-h-screen bg-white px-4 pt-28 pb-20 font-sans">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-16 pb-12 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-sm mb-6 uppercase tracking-widest">
          <BookOpen size={16} /> 직장인 필수 금융 지식
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
          직장인 꿀팁 완전정복
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
          연봉 협상 전략부터 절세, 재테크, 내집마련까지 — 직장인이 반드시 알아야 할 핵심 정보를 전문가 검증 기반으로 정리했습니다.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-16">
        {/* Ad Top */}
        <AdUnit slotId="1234509876" format="auto" label="꿀팁 상단 광고" />

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {relatedLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
              <p className="font-bold text-slate-900 group-hover:text-primary text-sm mb-1 transition-colors">{link.label}</p>
              <p className="text-xs text-slate-500">{link.desc}</p>
              <ChevronRight size={14} className="text-slate-400 group-hover:text-primary mt-2 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Tips Sections */}
        {tips.map((section, si) => (
          <div key={si}>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-primary">
              <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center">
                <section.icon size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900">{section.category}</h2>
            </div>
            <div className="space-y-4">
              {section.items.map((item, ii) => (
                <div key={ii} className="p-6 rounded-xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm transition-all">
                  <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            {si === 1 && (
              <div className="mt-8">
                <AdUnit slotId="9875643210" format="auto" label="꿀팁 중간 광고" />
              </div>
            )}
          </div>
        ))}

        {/* Bottom Ad */}
        <AdUnit slotId="6543219870" format="auto" label="꿀팁 하단 광고" />
      </div>
    </main>
  );
}