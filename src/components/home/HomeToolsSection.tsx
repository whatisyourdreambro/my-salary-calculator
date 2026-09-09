import { Calculator, PiggyBank, Briefcase, Globe, FileText, Receipt, TrendingUp, GitCompare, BarChart3, Shield, Sparkles } from "lucide-react";
import ToolCard from "@/components/home/ToolCard";

// Static discovery content stays in the server component tree.
export default function HomeToolsSection() {
 return (<>
 {/* ═══ Premium Tools Grid ══════════════════════════════════ */}
 <section
 className="section-lg"
 style={{
 backgroundColor: "#EDF1F5",
 borderTop: "1px solid #DDE4EC",
 }}
 >
 <div className="page-width">
 <div style={{ marginBottom: "2.5rem" }}>
 <p
 className="duotone-badge"
 style={{
 display: "inline-flex",
 marginBottom: "1rem",
 }}
 >
 <Sparkles style={{ width: "12px", height: "12px" }} />
 Premium Tools
 </p>
 <h2
 style={{
 fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
 fontWeight: 900,
 color: "#0A1829",
 letterSpacing: "-0.035em",
 marginBottom: "0.5rem",
 }}
 >
 프리미엄 금융 도구
 </h2>
 <p style={{ color: "#3D5E78", fontSize: "15px", fontWeight: 500 }}>
 당신의 재정 건강을 위한 필수 도구들
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 <ToolCard
 icon={Calculator}
 title="정규직 계산기"
 description="2026년 최신 세율 · 실수령액 정확 계산"
 href="/?tab=salary#calculator-section"
 badge="인기"
 />
 <ToolCard
 icon={PiggyBank}
 title="퇴직금 계산기"
 description="예상 퇴직금과 IRP 절세 효과 분석"
 href="/?tab=severance#calculator-section"
 />
 <ToolCard
 icon={Briefcase}
 title="알바/프리랜서"
 description="3.3% 공제 및 주휴수당 계산"
 href="/?tab=freelancer#calculator-section"
 />
 <ToolCard
 icon={Globe}
 title="환율 영향"
 description="내 연봉의 글로벌 구매력 비교"
 href="/?tab=exchange#calculator-section"
 />
 <ToolCard
 icon={FileText}
 title="연말정산 설계"
 description="13월의 월급을 위한 필승 시뮬레이션"
 href="/year-end-tax"
 badge="HOT"
 />
 <ToolCard
 icon={Receipt}
 title="급여명세서"
 description="나만의 급여 명세서 생성"
 href="/fun/salary-slip"
 />
 <ToolCard
 icon={TrendingUp}
 title="미래 연봉 예측"
 description="커리어 성장 곡선과 은퇴 목표 분석"
 href="/?tab=future#calculator-section"
 />
 <ToolCard
 icon={GitCompare}
 title="기업 오퍼 비교"
 description="두 회사의 시급·복지 정밀 비교"
 href="/company/compare"
 />
 <ToolCard
 icon={BarChart3}
 title="연봉 순위"
 description="전국 소득 분포에서 내 위치 확인"
 href="/?tab=rank#calculator-section"
 />
 <ToolCard
 icon={Shield}
 title="종합 계산기 허브"
 description="30+ 금융 계산기 한곳에 모아보기"
 href="/tools"
 />
 </div>
 </div>
 </section>

 </>);
}
