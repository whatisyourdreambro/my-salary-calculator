// /tools/real-estate — 부동산 계산기 섹션 허브 (2026-09-01 신설)
// 배경: /tools/real-estate 인덱스가 없어 "부동산 세금 계산기" 류 헤드 키워드를
//       받을 랜딩이 0개였다. 하위 4종 + /calc 부동산 계열을 한 층에 묶는다.
// 광고: ToolHubPage 가 /tools 인덱스와 동일 조합(Multiplex + 쿠팡 rectangle)을 렌더.

import type { Metadata } from "next";
import {
  Home, Heart, TrendingUp, DollarSign, Percent, Scale,
  Building2, Calculator, PiggyBank, Calendar,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import ToolHubPage, { type HubCategory } from "@/components/tool/ToolHubPage";

export const metadata: Metadata = buildPageMetadata({
  title: "부동산 계산기 모음 2026 | 취득세·증여세·DSR·LTV·전세 - 머니샐러리",
  description:
    "취득세, 증여세, 양도소득세부터 DSR·LTV 대출 한도, 전세자금대출, 주택청약까지 부동산 계산기 13종을 2026년 기준으로 무료 제공합니다.",
  path: "/tools/real-estate",
});

const CATEGORIES: HubCategory[] = [
  {
    title: "부동산 세금 계산기",
    items: [
      { title: "취득세 계산기", desc: "주택·토지 취득세·교육세", href: "/tools/real-estate/acquisition-tax", icon: Home, isHot: true },
      { title: "증여세 계산기", desc: "가족별 공제한도·세율", href: "/tools/real-estate/gift-tax", icon: Heart },
      { title: "양도소득세 간편계산", desc: "보유기간별 세율·장기보유공제", href: "/calc/real-estate-capital-gains-quick", icon: TrendingUp },
      { title: "단기 매매 비용 계산", desc: "취득~양도 총비용 추정", href: "/calc/real-estate-flip-cost", icon: DollarSign },
    ],
  },
  {
    title: "대출 한도 계산기",
    items: [
      { title: "DSR 한도 계산기", desc: "총부채원리금상환비율", href: "/tools/real-estate/dsr", icon: Percent },
      { title: "LTV 담보인정비율", desc: "주택담보대출 가능액 계산", href: "/tools/real-estate/ltv", icon: Scale },
      { title: "주택담보대출 계산기", desc: "월 상환액·총이자 시뮬레이션", href: "/home-loan", icon: Building2, isHot: true },
      { title: "월 상환액 간편계산", desc: "금리·기간별 원리금", href: "/calc/mortgage-monthly-quick", icon: Calculator },
    ],
  },
  {
    title: "전세 · 월세 · 청약",
    items: [
      { title: "전세자금대출 계산기", desc: "한도·월 이자 부담", href: "/calc/jeonse-loan", icon: Home },
      { title: "전세대출 비용 계산", desc: "보증료·중개보수 포함 총비용", href: "/calc/jeonse-loan-cost", icon: DollarSign },
      { title: "전세 vs 월세 비교", desc: "기회비용까지 반영한 손익", href: "/calc/jeonse-vs-monthly-cost", icon: Scale },
      { title: "내 연봉 주택 구매력", desc: "소득 대비 매수 가능 가격", href: "/calc/housing-affordability-quick", icon: PiggyBank },
      { title: "주택청약 계산기", desc: "가점·납입 인정금액", href: "/calc/housing-subscription", icon: Calendar },
    ],
  },
];

export default function RealEstateToolsHubPage() {
  return (
    <ToolHubPage
      path="/tools/real-estate"
      leafName="부동산 계산기 모음"
      badge="2026 기준"
      badgeIcon={Home}
      headingPrefix="부동산 계산기"
      headingAccent="13종"
      headingSuffix="모음"
      lead="취득세·증여세·양도세부터 DSR·LTV 한도와 전세·청약까지, 집을 사고 빌릴 때 필요한 계산을 한곳에 모았습니다."
      stats={[["13", "계산기"], ["2026", "세법 기준"], ["무료", "전체 이용"]]}
      categories={CATEGORIES}
      crossLinks={[
        { label: "금융 계산기 모음", href: "/tools/finance" },
        { label: "생활 계산기 모음", href: "/tools/life" },
        { label: "연봉 실수령액 계산기", href: "/" },
        { label: "전체 계산기 보기", href: "/tools" },
      ]}
      seoHeading="부동산 세금과 대출 한도, 어디까지 계산되나요"
      seoBody="취득세는 주택 수와 조정대상지역 여부에 따라 세율이 달라지고, 증여세는 증여자와의 관계별 공제한도가 각각 다릅니다. DSR은 모든 금융권 대출의 연간 원리금 상환액을 연소득으로 나눈 값이며 LTV는 담보 가치 대비 대출 가능 금액의 비율입니다. 머니샐러리의 부동산 계산기는 이 기준을 2026년 현행 규정으로 반영합니다. 다만 실제 취득세율·대출 한도는 개별 물건과 금융기관 심사 기준에 따라 달라질 수 있으므로 계약 전에는 반드시 관할 지자체와 금융기관에 확인하시기 바랍니다."
    />
  );
}
