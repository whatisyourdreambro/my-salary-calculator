// /tools/life — 생활 계산기 섹션 허브 (2026-09-01 신설)
// 배경: /tools/life 인덱스 부재. /tools/date(3종)·/tools/health(1종)·/tools/math(2종)은
//       각각 허브를 세우기엔 하위가 너무 얇아(저품질 신호) 이 허브에 흡수한다.
// 광고: ToolHubPage 가 /tools 인덱스와 동일 조합(Multiplex + 쿠팡 rectangle)을 렌더.

import type { Metadata } from "next";
import {
  Users, Fuel, CreditCard, Calendar, RefreshCw,
  Percent, Calculator, Activity,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import ToolHubPage, { type HubCategory } from "@/components/tool/ToolHubPage";

export const metadata: Metadata = buildPageMetadata({
  title: "생활 계산기 모음 | N빵·유류비·구독료·나이·D-Day 10종 - 머니샐러리",
  description:
    "더치페이(N빵), 연비·유류비, 구독료 합계, 만 나이, D-Day, 근무일수, 단위 변환, 백분율, BMI까지 일상에서 자주 쓰는 생활 계산기 10종을 무료로 제공합니다.",
  path: "/tools/life",
});

const CATEGORIES: HubCategory[] = [
  {
    title: "생활비 계산기",
    items: [
      { title: "더치페이(N빵) 계산기", desc: "회식·모임 인원별 금액 분배", href: "/tools/life/dutch-pay", icon: Users, isHot: true },
      { title: "연비·유류비 계산기", desc: "주행거리별 주유 비용", href: "/tools/life/fuel-cost", icon: Fuel },
      { title: "구독 서비스 비용", desc: "월 총 구독료 분석", href: "/tools/life/subscription", icon: CreditCard },
    ],
  },
  {
    title: "날짜 계산기",
    items: [
      { title: "나이 계산기", desc: "만 나이·한국 나이 계산", href: "/tools/date/age", icon: Calendar },
      { title: "D-Day 계산기", desc: "날짜 차이·남은 일수", href: "/tools/date/d-day", icon: Calendar },
      { title: "근무일수 계산기", desc: "주말 제외 영업일 계산", href: "/tools/date/work-days", icon: Calendar },
    ],
  },
  {
    title: "변환 · 건강 계산기",
    items: [
      { title: "단위 변환기", desc: "길이·무게·온도 변환", href: "/tools/life/unit-converter", icon: RefreshCw },
      { title: "백분율 계산기", desc: "퍼센트·할인율 계산", href: "/tools/math/percent", icon: Percent },
      { title: "랜덤 번호 생성기", desc: "추첨·번호 생성", href: "/tools/math/number-gen", icon: Calculator },
      { title: "BMI 비만도 계산기", desc: "체질량지수·비만 등급", href: "/tools/health/bmi", icon: Activity },
    ],
  },
];

export default function LifeToolsHubPage() {
  return (
    <ToolHubPage
      path="/tools/life"
      leafName="생활 계산기 모음"
      badge="일상 필수 도구"
      badgeIcon={Users}
      headingPrefix="생활 계산기"
      headingAccent="10종"
      headingSuffix="모음"
      lead="회식 N빵부터 유류비·구독료·만 나이·D-Day까지, 일상에서 자주 찾는 계산을 한곳에 모았습니다. 설치 없이 바로 씁니다."
      stats={[["10", "계산기"], ["설치", "불필요"], ["무료", "전체 이용"]]}
      categories={CATEGORIES}
      crossLinks={[
        { label: "금융 계산기 모음", href: "/tools/finance" },
        { label: "부동산 계산기 모음", href: "/tools/real-estate" },
        { label: "연봉 실수령액 계산기", href: "/" },
        { label: "전체 계산기 보기", href: "/tools" },
      ]}
      seoHeading="생활 계산기는 어떻게 쓰나요"
      seoBody="더치페이 계산기는 총액과 인원수를 넣으면 1인당 금액과 잔돈 처리까지 정리해 줍니다. 만 나이 계산기는 2023년 6월 시행된 만 나이 통일법 기준으로 생일 경과 여부를 반영해 계산하며, 근무일수 계산기는 주말을 제외한 영업일을 세어 연차·급여 산정에 활용할 수 있습니다. 모든 계산은 브라우저에서 처리되어 입력값이 서버로 전송되지 않습니다."
    />
  );
}
