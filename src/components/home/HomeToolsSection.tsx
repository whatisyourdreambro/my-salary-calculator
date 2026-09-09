import { Calculator, PiggyBank, Briefcase, Globe, FileText, Receipt, TrendingUp, GitCompare, BarChart3, Shield } from "lucide-react";
import ToolCard from "@/components/home/ToolCard";
const tools = [
  { icon: Calculator, title: "정규직 계산기", description: "연봉과 가족 조건에 따른 공제액·예상 세후 월급", href: "/?tab=salary#calculator-section" },
  { icon: PiggyBank, title: "퇴직금 계산기", description: "근속기간과 평균임금으로 예상 퇴직금 확인", href: "/?tab=severance#calculator-section" },
  { icon: Briefcase, title: "알바·프리랜서", description: "근무 조건과 원천징수 방식에 따른 예상 수령액", href: "/?tab=freelancer#calculator-section" },
  { icon: Globe, title: "환율 영향", description: "환율 가정을 바꾸며 연봉의 환산 금액 비교", href: "/?tab=exchange#calculator-section" },
  { icon: FileText, title: "연말정산 설계", description: "소득·공제 조건에 따른 예상 세금과 체크리스트", href: "/year-end-tax" },
  { icon: Receipt, title: "급여명세서", description: "입력한 조건으로 참고용 급여명세서 만들기", href: "/fun/salary-slip" },
  { icon: TrendingUp, title: "미래 연봉 예측", description: "연봉 인상률 가정에 따른 장기 시나리오", href: "/?tab=future#calculator-section" },
  { icon: GitCompare, title: "기업 오퍼 비교", description: "회사별 보상·복지 조건을 같은 기준으로 검토", href: "/company/compare" },
  { icon: BarChart3, title: "연봉 순위", description: "자체 참고표에서 연봉의 상대적 위치 확인", href: "/?tab=rank#calculator-section" },
  { icon: Shield, title: "종합 계산기 허브", description: "대출·저축·세금 계산기를 목적에 맞게 선택", href: "/tools" },
];
/** Static discovery content stays in the server component tree. */
export default function HomeToolsSection() {
  return <section className="ms-section border-t border-border bg-background" aria-labelledby="home-tools-heading"><div className="page-width">
    <div className="mb-8 max-w-2xl"><p className="ms-eyebrow">목적별 계산</p><h2 id="home-tools-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl mt-3">다음 돈 고민도, 같은 기준으로.</h2><p className="ms-description mt-3">급여에서 퇴직금까지. 지금 필요한 계산을 선택하세요.</p></div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{tools.map(tool => <ToolCard key={tool.href} {...tool} />)}</div>
  </div></section>;
}
