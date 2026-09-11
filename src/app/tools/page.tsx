import type { Metadata } from "next";
import ToolHubPage from "@/components/tool/ToolHubPage";
import {
 Gift, Briefcase, TrendingUp, Home, CreditCard, Laptop,
 Heart, PiggyBank, Calculator, Calendar, Scale, Flame,
 DollarSign, Percent, Activity, Building2,
 Fuel, RefreshCw, Users, Zap
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "금융 계산기 모음 2026 | 31가지 세금·재테크 계산기 - 머니샐러리",
 description: "성과급 세금 계산기, 퇴직금, 증여세, 취득세, 주식 양도세, 배당소득세, 연봉 계산기 등 2026년 세법 기준 31가지 금융 계산기를 무료로 이용하세요.",
 path: "/tools",
});

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
 { title: "연봉 실수령액 계산기", desc: "4대보험·소득세와 예상 월급", href: "/", icon: DollarSign, isHot: true },
 { title: "성과급·인센티브 세금", desc: "2026 연봉합산 세율 적용", href: "/tools/finance/bonus", icon: Gift, isNew: true, isHot: true },
 { title: "퇴직금 세금 계산기", desc: "환산급여 방식 퇴직소득세", href: "/tools/finance/severance", icon: Briefcase, isNew: true },
 { title: "프리랜서 종합소득세", desc: "사업소득·필요경비 계산", href: "/tools/finance/freelance-tax", icon: Laptop, isNew: true },
 { title: "주식 양도소득세", desc: "해외주식·대주주 세금 계산", href: "/tools/finance/stock-tax", icon: TrendingUp, isNew: true },
 { title: "배당소득세 계산기", desc: "금융소득 2천만원 종합과세", href: "/tools/finance/dividend-tax", icon: PiggyBank, isNew: true },
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
 { title: "근무일수 계산기", desc: "주말 제외 영업일 계산", href: "/tools/date/work-days", icon: Calendar },
 { title: "더치페이 계산기", desc: "인원별 금액 분배", href: "/tools/life/dutch-pay", icon: Users },
 { title: "연비·유류비 계산기", desc: "주유비용 계산", href: "/tools/life/fuel-cost", icon: Fuel },
 { title: "단위 변환기", desc: "길이·무게·온도 변환", href: "/tools/life/unit-converter", icon: RefreshCw },
 { title: "백분율 계산기", desc: "퍼센트·할인율 계산", href: "/tools/math/percent", icon: Percent },
 { title: "랜덤 번호 생성기", desc: "로또·추첨 번호", href: "/tools/math/number-gen", icon: Calculator },
 ],
 },
];

export default function ToolsHubPage() {
 const totalCount = CATEGORIES.reduce((sum, category) => sum + category.items.length, 0);
 return <ToolHubPage
  path="/tools"
  leafName="금융 계산기 모음"
  badge="금융·생활 도구"
  badgeIcon={Calculator}
  headingPrefix="금융 계산기 모음"
  headingAccent="2026"
  headingSuffix={`${totalCount}종`}
  lead={`필요한 계산을 한곳에서. 급여, 세금, 대출부터 일상 계산까지 ${totalCount}가지 도구를 제공합니다. 주제를 선택하고 내 조건에 맞게 계산해 보세요.`}
  stats={[]}
  categories={CATEGORIES}
  seoHeading="계산 결과를 읽는 방법"
  seoBody="각 계산기에 표시된 기준 연도, 적용 범위와 입력 단위를 먼저 확인하세요. 세금·급여 결과는 입력한 조건에 따른 추정치이며, 실제 공제와 지급액은 개인별 조건에 따라 달라질 수 있습니다. 결과 아래의 계산 방식과 유의사항을 함께 확인할 수 있습니다."
 />;
}