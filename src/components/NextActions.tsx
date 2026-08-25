// src/components/NextActions.tsx
//
// 결과창 직하 3-CTA 카드.
// 사용자가 결과를 본 직후 가장 자연스러운 다음 액션 3개를 제시.
// RelatedCalculators보다 더 구체적이고 컨텍스트 인식형.

"use client";

import Link from "@/components/AppLink";
import { trackGuideCTAClick } from "@/lib/analytics";
import { companyCountPlus } from "@/config/site";
import { OfferSlot } from "@/components/affiliate/AffiliateSlot";
import type { OfferVertical } from "@/lib/affiliateOffers";
import {
 ArrowRight,
 Home,
 Building2,
 Calculator,
 Shield,
 TrendingUp,
 PiggyBank,
 Receipt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NextActionCategory =
 | "salary"
 | "loan"
 | "tax"
 | "insurance"
 | "investment"
 | "real-estate";

interface NextActionsProps {
 /** 현재 연봉 (없으면 generic CTA) */
 annualSalary?: number;
 /** 컨텍스트 카테고리 — 카테고리별로 다른 3 CTA 표시 */
 category?: NextActionCategory;
 className?: string;
}

interface ActionItem {
 icon: LucideIcon;
 title: string;
 description: string;
 href: string;
}

function buildActions(
 category: NextActionCategory | undefined,
 annualSalary: number | undefined
): ActionItem[] {
 const formatManwon = (amount: number) =>
 `${Math.round(amount / 10000).toLocaleString("ko-KR")}만원`;
 const dsrLimit = annualSalary
 ? Math.round((annualSalary * 0.4) / 10000).toLocaleString("ko-KR")
 : null;

 // 카테고리별 분기
 if (category === "loan" || category === "real-estate") {
 return [
 {
 icon: Home,
 title: "주택담보대출 한도",
 description: dsrLimit
 ? `DSR 40% 기준 연 ${dsrLimit}만원 한도`
 : "DSR/LTV 한도와 월 상환액",
 href: "/home-loan",
 },
 {
 icon: PiggyBank,
 title: "전세자금대출 비교",
 description: "전세금 80% · 금리 비교",
 href: "/calc/jeonse-loan",
 },
 // 2026-07-16 — 원리금 상환 계산(대출 계산기와 기능 중복)을 재산세로 교체.
 // 재산세는 7·9월 납부 시즌 고CPC 페이지 — 대출·부동산 사용자와 문맥 정합.
 {
 icon: Receipt,
 title: "재산세·보유세 계산",
 description: "7·9월 재산세 납부 — 공시가별 부담 확인",
 href: "/property-holding-tax-2026",
 },
 ];
 }
 if (category === "tax") {
 return [
 {
 icon: Receipt,
 title: "연말정산 환급금 계산",
 description: "13월의 월급 미리 받기",
 href: "/year-end-tax",
 },
 {
 icon: Calculator,
 title: "종합소득세 신고 도움",
 description: "5월 종소세 환급 시뮬",
 href: "/tools/finance/freelance-tax",
 },
 {
 icon: Building2,
 title: "회사별 연봉·초봉 비교",
 description: `${companyCountPlus} 기업 평균 연봉·복지`,
 href: "/salary-db",
 },
 ];
 }
 if (category === "insurance") {
 return [
 {
 icon: Shield,
 title: "건강보험료 자동 계산",
 description: "직장/지역 가입자 비교",
 href: "/health-insurance-2026",
 },
 {
 icon: Calculator,
 title: "실손보험 청구 가능액",
 description: "보장 한도·실손 청구 금액 분석",
 href: "/calc/medical-expense-coverage",
 },
 {
 icon: PiggyBank,
 title: "노후 대비 보험 시뮬",
 description: "은퇴 후 필요 자금 분석",
 href: "/fire-calculator",
 },
 ];
 }
 if (category === "investment") {
 return [
 {
 icon: TrendingUp,
 title: "복리 시뮬레이션",
 description: "월 적립 → 10년 후 자산",
 href: "/calc/compound-interest-quick",
 },
 {
 icon: Calculator,
 title: "주식 양도세 계산",
 description: "2026 금투세 기준",
 href: "/calc/stock-capital-gains-quick",
 },
 {
 icon: PiggyBank,
 title: "FIRE 은퇴 자금 계산",
 description: "조기 은퇴 필요 자산",
 href: "/fire-calculator",
 },
 ];
 }

 // 기본(salary 또는 미지정) — 연봉 보유 여부에 따른 CTA
 return annualSalary
 ? [
 {
 icon: Home,
 title: "이 연봉으로 받을 수 있는 대출",
 description: dsrLimit
 ? `DSR 40% 기준 연 ${dsrLimit}만원 한도`
 : `연봉 ${formatManwon(annualSalary)} → DSR 40% 한도`,
 href: "/home-loan",
 },
 {
 icon: Building2,
 title: "동급 연봉 회사 보기",
 description: "비슷한 연봉대 기업 평균·복지 비교",
 href: "/salary-db",
 },
 {
 icon: Receipt,
 title: "연말정산 환급금 계산",
 description: "13월의 월급 미리 받기",
 href: "/year-end-tax",
 },
 ]
 : [
 {
 icon: Home,
 title: "주택담보대출 계산",
 description: "DSR/LTV 한도와 월 상환액",
 href: "/home-loan",
 },
 {
 icon: Building2,
 title: "회사별 연봉 비교",
 description: "기업 평균·복지·워라밸",
 href: "/salary-db",
 },
 {
 icon: Calculator,
 title: "연말정산 시뮬",
 description: "환급금 미리 계산",
 href: "/year-end-tax",
 },
 ];
}

export default function NextActions({
 annualSalary,
 category,
 className = "",
}: NextActionsProps) {
 const actions = buildActions(category, annualSalary);

 // 제휴 오퍼 병기 (지시서 §TASK-3-4) — 카테고리 문맥에 맞는 버티컬만 매핑.
 // vertical="loan" 하드코딩 시 활성 대출 오퍼가 보험·저축 등 /calc/[slug] 전
 // 카테고리(~101곳)에 새어 나가던 버그 수정 (2026-08 점검). 매핑 없는 카테고리
 // (tax 등)는 슬롯 자체를 렌더하지 않는다. 오퍼 inactive 시엔 어차피 무렌더.
 const CATEGORY_OFFER_VERTICAL: Partial<Record<NextActionCategory, OfferVertical>> = {
 salary: "loan", // 연봉 결과 → 대출 여력 문맥 (의도된 결과 연동 CTA)
 loan: "loan",
 "real-estate": "loan",
 insurance: "insurance",
 investment: "securities",
 };
 // category 미지정(생활·사업 등 매핑 외 계산기)은 오퍼 미렌더 — 문맥 없는 노출 금지.
 // 홈 연봉 계산기는 category="salary" 를 명시해 결과 CTA 오퍼를 유지한다.
 const offerVertical = category ? CATEGORY_OFFER_VERTICAL[category] : undefined;
 const offerCalcResult = annualSalary
 ? { amount: Math.round(annualSalary / 10000) }
 : undefined;

 return (
 <section className={`mt-8 ${className}`}>
 <h3 className="text-sm font-black text-navy mb-3 px-1">다음 단계로</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {actions.map((action) => {
 const Icon = action.icon;
 return (
 <Link
 key={action.href + action.title}
 href={action.href}
 onClick={() => trackGuideCTAClick(action.href, "next-action")}
 className="group flex items-start gap-3 p-4 bg-white rounded-2xl border border-canvas-200 hover:border-electric hover:shadow-md transition-all"
 >
 <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-electric-10 flex items-center justify-center group-hover:bg-electric group-hover:text-white transition-colors">
 <Icon className="w-5 h-5 text-electric group-hover:text-white" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-navy text-sm mb-0.5 leading-tight">
 {action.title}
 </p>
 <p className="text-xs text-faint-blue line-clamp-2">
 {action.description}
 </p>
 </div>
 <ArrowRight className="flex-shrink-0 w-4 h-4 text-faint-blue group-hover:text-electric group-hover:translate-x-0.5 transition-all" />
 </Link>
 );
 })}
 </div>
 {offerVertical && (
 <OfferSlot vertical={offerVertical} calcResult={offerCalcResult} />
 )}
 </section>
 );
}
