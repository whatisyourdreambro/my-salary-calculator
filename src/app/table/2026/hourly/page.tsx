// src/app/table/2026/hourly/page.tsx

import { Suspense } from "react";
import { generateHourlyWageTableData2026 } from "@/lib/generateData";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "@/components/AppLink";
import SalaryTable from "@/components/SalaryTable";
import HourlyTableInteractive from "./HourlyTableInteractive";
import TableHero from "@/components/TableHero";
import SeasonalLinks from "../SeasonalLinks";
import FavoritesButton from "@/components/FavoritesButton";
import { CalcResultAd, Display2Ad } from "@/components/AdPlacement";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, datasetLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 시급 실수령액 표 — 10,320원 기준 시급별 월 환산 실수령액",
  description:
    "2026 최저시급 10,320원(2.9% 인상). 시급 9,500~50,000원 구간별 주휴수당 포함 월 209시간 환산 실수령액과 4대보험·소득세 공제액을 즉시 비교. 알바·파트타임 월급 계산도 한눈에.",
  path: "/table/2026/hourly",
  keywords: [
    "시급 실수령액",
    "2026 최저시급",
    "시급 계산기",
    "시급 월급 환산",
    "최저시급 10320원",
    "알바 실수령액",
    "파트타임 월급",
  ],
});

const tableHeaders = [
 { key: "preTax", label: "시급" },
 { key: "monthlyNet", label: "월 예상 실수령액" },
 { key: "totalDeduction", label: "월 공제액 합계" },
 { key: "pension", label: "국민연금" },
 { key: "health", label: "건강보험" },
 { key: "employment", label: "고용보험" },
 { key: "incomeTax", label: "소득세" },
];

// datasetLd 빌더로 dateModified(신선도 신호) 부여 + breadcrumb
const structuredData = [
 datasetLd({
 name: "2026년 시급 실수령액 표",
 description: "2026년 최신 세법 기준, 주휴수당 포함 월 209시간 근무 환산 시급 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
 url: "/table/2026/hourly",
 dateModified: "2026-08-07",
 keywords: ["시급", "실수령액", "세후 월급", "시급 테이블", "2026년"],
 }),
 autoBreadcrumbLd("/table/2026/hourly", { leafName: "2026 시급 실수령액 표" }),
];

// 서버 컴포넌트는 데이터 로직에만 집중합니다.
function HourlyTable2026() {
 const allData = generateHourlyWageTableData2026();
 const highlightRows = [10320, 12000, 15000, 20000];

 return (
 <>
 <JsonLd data={structuredData} />
 <main className="w-full bg-background">
 <TableHero
 badgeText="2026년 최신 데이터 반영"
 title={
 <>
 2026 시급 실수령액 <br className="sm:hidden" />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
 미리보기
 </span>
 </>
 }
 description={
 <>
 2026년 최저시급은 <strong>10,320원</strong>으로 확정되었습니다. <br className="hidden sm:block" />
 주휴수당 포함 월 209시간 기준, 내 시급의 월 환산 실수령액을 미리 확인해보세요.
 </>
 }
 />

 <Suspense fallback={<div>Loading...</div>}>
 <HourlyTableInteractive
 allData={allData}
 tableHeaders={tableHeaders}
 highlightRows={highlightRows}
 />
 </Suspense>

 {/* 전체 표 — annual 과 동일한 서버 렌더 패턴 (2026-08-24).
     종전엔 useSearchParams 를 쓰는 클라 컴포넌트 안에서만 표가 렌더돼
     정적 HTML에 /salary 행 링크가 0건이었다(JS 미실행 크롤러 불가시).
     행 데이터·링크를 서버 HTML에 직접 포함시킨다. */}
 <div className="page-width">
 <SalaryTable
 headers={tableHeaders}
 data={allData}
 highlightRows={highlightRows}
 linkColumnBaseHref="/salary"
 linkValueMultiplier={209 * 12}
 />
 </div>

 {/* 운영자 승인 광고 배치(2026-07-07): 표와 본문 사이 — 표 전 구간 무광고였음 */}
 <CalcResultAd />

 <div className="w-full py-16">
 <section>
 <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
 <TrendingUp className="w-8 h-8 text-primary" />
 2025년 vs 2026년 최저시급 비교
 </h2>
 <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
 <p className="text-center text-muted-foreground">
 2026년 최저임금이 10,320원으로 확정되었습니다.
 </p>
 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
 <div>
 <h3 className="font-bold text-xl mb-3 text-center">2025년</h3>
 <ul className="space-y-2 text-muted-foreground">
 <li>- 최저시급: 10,030원</li>
 <li>- 월 환산액: 2,096,270원</li>
 </ul>
 </div>
 <div>
 <h3 className="font-bold text-xl mb-3 text-center">2026년 (확정)</h3>
 <ul className="space-y-2 text-muted-foreground">
 <li>- 최저시급: <span className="font-semibold text-primary">10,320원 (2.9% 인상)</span></li>
 <li>- 월 환산액: <span className="font-semibold text-primary">2,156,880원</span></li>
 </ul>
 </div>
 </div>
 </div>
 </section>
 <section className="mt-16">
 <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
 <HelpCircle className="w-8 h-8 text-primary" />
 시급에 대한 모든 궁금증 (Q&A)
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
 <h3 className="font-bold text-xl mb-3">
 Q. 2026년 최저시급은 얼마인가요?
 </h3>
 <p className="text-muted-foreground">
 2026년 최저시급은 <strong>10,320원</strong>으로 결정되었습니다. 2025년 10,030원 대비 290원(2.9%) 인상된 금액입니다.
 </p>
 <p className="text-muted-foreground mt-3">
 한편 2027년 최저임금은 <strong>10,700원</strong>으로 의결되어, 내년에는 시급이 한 번 더 오릅니다.
 </p>
 <Link
 href="/minimum-wage-2026"
 className="text-primary font-semibold mt-4 inline-block"
 >
 2026 최저임금 시급·월급·연봉 환산표 →
 </Link>
 <Link
 href="/minimum-wage-2027"
 className="text-primary font-semibold mt-2 block"
 >
 2027 최저임금 10,700원 총정리 →
 </Link>
 </div>
 <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
 <h3 className="font-bold text-xl mb-3">
 Q. 알바도 4대보험에 가입해야 하나요?
 </h3>
 <p className="text-muted-foreground">
 네, 월 60시간 이상 근무하는 아르바이트생은 4대보험 의무 가입 대상입니다. 다만, 국민연금과 건강보험은 조건에 따라 제외될 수 있습니다. 자세한 내용은 프리랜서/알바 계산기를 참고하세요.
 </p>
 <Link
 href="/?tab=freelancer"
 className="text-primary font-semibold mt-4 inline-block"
 >
 프리랜서/알바 계산기 바로가기 →
 </Link>
 </div>
 </div>
 </section>

 {/* 실험 #1 (docs/ad-experiments.md, 운영자 승인 2026-08-17): display-2 추가 배치.
     env NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY_2 미설정 시 자동 미렌더. */}
 <div className="mt-10 px-4 sm:px-6">
 <Display2Ad />
 </div>

 {/* 시즌 크로스링크 — 표 유입을 시즌 피크 페이지로 라우팅 (2026-07-16, 광고 슬롯과 무관한 본문 영역) */}
 <SeasonalLinks className="px-4 sm:px-6" />

 {/* 즐겨찾기 락인 — 재방문 수요 큰 표 페이지 (2026-08-17, 광고 아래 영역) */}
 <div className="mt-6 flex justify-center">
 <FavoritesButton path="/table/2026/hourly" title="2026 시급 실수령액 표" />
 </div>
 </div>
 </main>
 </>
 );
}

export default function HourlyTable2026Page() {
 return <HourlyTable2026 />;
}
