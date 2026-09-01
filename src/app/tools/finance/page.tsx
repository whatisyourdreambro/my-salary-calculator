// /tools/finance — 금융 계산기 섹션 허브 (2026-09-01 신설)
// 배경: 하위에 도구 12종이 있는데 이를 묶는 인덱스가 없어 "금융 계산기" 류
//       카테고리 헤드 키워드를 받을 랜딩이 0개였다. 내부링크도 /tools 인덱스
//       하나가 26개를 전부 떠안고 있었다.
// 광고: ToolHubPage 가 /tools 인덱스와 동일 조합(Multiplex + 쿠팡 rectangle)을 렌더.
//       나머지(InArticle·HomeTop·쿠팡 leaderboard)는 tools/layout.tsx 상속.

import type { Metadata } from "next";
import {
  Gift, Briefcase, Laptop, TrendingUp, Percent, RefreshCw,
  Zap, Activity, Building2, PiggyBank, CreditCard, Calculator,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import ToolHubPage, { type HubCategory } from "@/components/tool/ToolHubPage";

export const metadata: Metadata = buildPageMetadata({
  title: "금융 계산기 모음 2026 | 세금·투자·대출 12종 - 머니샐러리",
  description:
    "성과급 세금, 퇴직금, 프리랜서 종합소득세, 주식 양도소득세, 복리, IRP 세액공제, 예적금, 대출 이자까지 2026년 세법 기준 금융 계산기 12종을 무료로 이용하세요.",
  path: "/tools/finance",
});

const CATEGORIES: HubCategory[] = [
  {
    title: "세금 계산기",
    items: [
      { title: "성과급·인센티브 세금", desc: "2026 연봉합산 세율 적용", href: "/tools/finance/bonus", icon: Gift, isHot: true },
      { title: "퇴직금 세금 계산기", desc: "환산급여 방식 퇴직소득세", href: "/tools/finance/severance", icon: Briefcase },
      { title: "프리랜서 종합소득세", desc: "사업소득·필요경비 계산", href: "/tools/finance/freelance-tax", icon: Laptop },
      { title: "주식 양도소득세", desc: "해외주식 250만원 공제 포함", href: "/tools/finance/stock-tax", icon: TrendingUp },
      { title: "부가세(VAT) 계산기", desc: "공급가·세액 역산", href: "/tools/finance/vat", icon: Percent },
      { title: "연말정산 계산기", desc: "환급액 미리 계산", href: "/year-end-tax", icon: RefreshCw },
    ],
  },
  {
    title: "투자 · 재테크 계산기",
    items: [
      { title: "복리 계산기", desc: "적립식 투자 미래 자산 시뮬레이션", href: "/tools/finance/compound", icon: Zap },
      { title: "CAGR 연평균 수익률", desc: "투자 기간별 수익률 계산", href: "/tools/finance/cagr", icon: Activity },
      { title: "IRP·연금저축 세액공제", desc: "최대 900만원 공제 계산", href: "/tools/finance/irp", icon: Building2 },
      { title: "예적금 만기 계산기", desc: "이자·원리금·세후 수령액", href: "/tools/deposit", icon: PiggyBank },
    ],
  },
  {
    title: "대출 · 할부 계산기",
    items: [
      { title: "대출 이자 계산기", desc: "원리금균등·원금균등상환", href: "/tools/loan", icon: Calculator },
      { title: "할부 이자 계산기", desc: "신용카드 할부·카드론", href: "/tools/finance/installment", icon: CreditCard },
    ],
  },
];

export default function FinanceToolsHubPage() {
  return (
    <ToolHubPage
      path="/tools/finance"
      leafName="금융 계산기 모음"
      badge="2026 세법 기준"
      badgeIcon={Calculator}
      headingPrefix="금융 계산기"
      headingAccent="12종"
      headingSuffix="모음"
      lead="성과급 세금부터 퇴직금·주식 양도세·IRP 세액공제까지, 직장인이 실제로 쓰는 금융 계산기를 2026년 최신 세법으로 모았습니다."
      stats={[["12", "계산기"], ["2026", "세법 기준"], ["무료", "전체 이용"]]}
      categories={CATEGORIES}
      crossLinks={[
        { label: "부동산 계산기 모음", href: "/tools/real-estate" },
        { label: "생활 계산기 모음", href: "/tools/life" },
        { label: "연봉 실수령액 계산기", href: "/" },
        { label: "전체 계산기 보기", href: "/tools" },
      ]}
      seoHeading="2026년 세법을 반영한 금융 계산기"
      seoBody="머니샐러리의 금융 계산기는 2026년 근로소득세·퇴직소득세·양도소득세·부가가치세의 세율과 공제한도를 반영합니다. 성과급은 연봉합산 방식, 퇴직금은 환산급여 방식으로 계산하며 해외주식 양도소득 기본공제 250만원, IRP·연금저축 합산 세액공제 한도 900만원 등 실제 적용 기준을 그대로 따릅니다. 다만 실제 납부세액은 개인별 공제 항목과 소득 구성에 따라 달라질 수 있으므로 최종 판단은 세무 전문가와 상담하시기 바랍니다."
    />
  );
}
