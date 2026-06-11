// src/app/income-tax-2026/page.tsx
// 종합소득세 계산기 — 5월 신고 시즌 핵심 키워드 + 금융 카테고리 고RPM

import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import IncomeTaxClient from "./IncomeTaxClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 종합소득세 계산기 — 누진세율 8단계 자동 산출 (지방소득세 포함)",
  description:
    "연소득 5천만원이면 산출세액 약 678만원, 1억이면 약 1,956만원. 2026 종합소득세 8단계 누진세율(6~45%) + 누진공제 + 지방소득세 10% 자동 계산.",
  path: "/income-tax-2026",
  keywords: [
    "종합소득세 계산기",
    "2026 종합소득세",
    "종소세 계산",
    "소득세율표",
    "종합소득세 누진세율",
    "종소세 누진공제",
    "지방소득세 계산",
    "프리랜서 종소세",
    "사업소득세 계산",
  ],
});

const FAQS = [
  {
    q: "종합소득세는 어떤 소득에 부과되나요?",
    a: "근로소득, 사업소득(프리랜서·자영업), 이자·배당소득(2천만원 초과 시), 연금소득, 기타소득 6가지를 합산해 1년에 한 번 5월에 신고·납부합니다. 근로소득만 있는 직장인은 연말정산으로 끝나므로 별도 종합소득세 신고가 필요 없습니다.",
  },
  {
    q: "2026년 종합소득세율은 어떻게 되나요?",
    a: "8단계 누진세율로 1,400만원 이하 6%, 1,400~5,000만원 15%(누진공제 126만원), 5,000~8,800만원 24%(576만원), 8,800만원~1.5억 35%(1,544만원), 1.5억~3억 38%(1,994만원), 3억~5억 40%(2,594만원), 5억~10억 42%(3,594만원), 10억 초과 45%(6,594만원)입니다. 누진공제는 같은 구간 진입자도 그 이전 구간에서는 낮은 세율로 계산되도록 보정하는 값입니다.",
  },
  {
    q: "지방소득세는 어떻게 계산되나요?",
    a: "산출 소득세의 10%가 지방소득세로 추가됩니다. 예를 들어 산출세액이 500만원이면 지방소득세 50만원이 추가되어 총 550만원을 납부합니다. 지방소득세는 거주지 지방자치단체로 들어가며 별도 신고 없이 함께 부과됩니다.",
  },
  {
    q: "과세표준과 총소득(연봉)은 어떻게 다른가요?",
    a: "총소득(연봉)에서 비과세 소득, 근로소득공제, 인적공제, 연금·보험료 공제, 신용카드 등 특별공제를 차감한 금액이 과세표준입니다. 따라서 연봉 1억이라도 과세표준은 보통 7~8천만원 수준이며, 공제 항목이 많을수록 실효세율이 낮아집니다.",
  },
  {
    q: "누진세율 구간을 넘으면 손해 아닌가요?",
    a: "아닙니다. 누진세율은 초과분에만 높은 세율이 적용되는 구조입니다. 예: 과세표준 5천만원에서 5천1만원이 되어도 추가 1만원에만 24%가 적용되며, 기존 5천만원분은 그대로 15% 세율을 유지합니다. 따라서 임금이 올라 구간을 넘어도 실수령액은 항상 증가합니다.",
  },
  {
    q: "분납 신청은 어떻게 하나요?",
    a: "납부할 세액이 1,000만원을 초과하면 분납이 가능합니다. 5월 신고 시 신고서에 분납 표시를 하면 1차분은 5월 31일까지, 2차분(잔액)은 7월 31일(2개월 후)까지 납부 가능합니다. 2,000만원 초과 시 절반씩 분납, 그 이하는 1,000만원 초과분만 분납됩니다.",
  },
  {
    q: "신용카드 사용액이 종합소득세를 줄여주나요?",
    a: "직장인은 연말정산에서 신용카드·체크카드·현금영수증 사용액의 일정 비율을 소득공제로 받습니다. 프리랜서·사업자는 사업과 관련된 신용카드 사용분만 필요경비로 인정되며, 개인 소비분은 공제되지 않습니다. 사업용 카드를 별도 발급받아 분리 관리하는 것이 절세에 유리합니다.",
  },
];

const HOWTO_STEPS = [
  {
    name: "총소득 입력",
    text: "한 해 동안 발생한 모든 소득 합계를 입력합니다. (근로소득, 사업소득, 임대소득 등 합산)",
  },
  {
    name: "공제액 입력",
    text: "근로소득공제·인적공제·연금보험료 등 차감되는 공제 합계를 입력합니다.",
  },
  {
    name: "과세표준 자동 산출",
    text: "총소득 - 공제액 = 과세표준이 자동 계산됩니다.",
  },
  {
    name: "결과 확인",
    text: "8단계 누진세율과 누진공제가 자동 적용되어 산출세액, 지방소득세, 총 부담세액이 표시됩니다.",
  },
];

export default function IncomeTax2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/income-tax-2026", { leafName: "2026 종합소득세 계산기" }),
          softwareApplicationLd({
            name: "2026 종합소득세 계산기",
            description: "8단계 누진세율 + 누진공제 + 지방소득세 자동 산출",
            url: "/income-tax-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026 종합소득세 계산하는 방법",
            description: "총소득과 공제액으로 누진세율 8단계가 자동 적용된 산출세액을 1분 안에 계산",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/income-tax-2026" leafName="종합소득세 계산기 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            5월 종소세 신고 시즌
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            2026 종합소득세 계산기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            과세표준을 입력하면 8단계 누진세율(6~45%)과 누진공제가 자동 적용된 산출세액 + 지방소득세
            10%까지 계산합니다. 프리랜서·N잡러·임대소득자의 5월 종합소득세 신고 전에 환급/추가 납부
            여부를 미리 확인하세요. 2026년 최신 세법(소득세법 시행령) 기준입니다.
          </p>
        </header>

        <HomeTopAd />

        <IncomeTaxClient />

        <CalcResultAd />

        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            2026 종합소득세 8단계 누진세율
          </h2>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-canvas-200 dark:border-canvas-700">
              <thead className="bg-canvas-50 dark:bg-canvas-800 font-bold">
                <tr>
                  <th className="px-3 py-2 text-left">과세표준</th>
                  <th className="px-3 py-2 text-center">세율</th>
                  <th className="px-3 py-2 text-right">누진공제</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-canvas-100 dark:border-canvas-700"><td className="px-3 py-2">1,400만원 이하</td><td className="px-3 py-2 text-center">6%</td><td className="px-3 py-2 text-right">—</td></tr>
                <tr className="border-t border-canvas-100 dark:border-canvas-700"><td className="px-3 py-2">1,400~5,000만원</td><td className="px-3 py-2 text-center">15%</td><td className="px-3 py-2 text-right">126만원</td></tr>
                <tr className="border-t border-canvas-100 dark:border-canvas-700"><td className="px-3 py-2">5,000~8,800만원</td><td className="px-3 py-2 text-center">24%</td><td className="px-3 py-2 text-right">576만원</td></tr>
                <tr className="border-t border-canvas-100 dark:border-canvas-700"><td className="px-3 py-2">8,800만원~1.5억</td><td className="px-3 py-2 text-center">35%</td><td className="px-3 py-2 text-right">1,544만원</td></tr>
                <tr className="border-t border-canvas-100 dark:border-canvas-700"><td className="px-3 py-2">1.5억~3억</td><td className="px-3 py-2 text-center">38%</td><td className="px-3 py-2 text-right">1,994만원</td></tr>
                <tr className="border-t border-canvas-100 dark:border-canvas-700"><td className="px-3 py-2">3억~5억</td><td className="px-3 py-2 text-center">40%</td><td className="px-3 py-2 text-right">2,594만원</td></tr>
                <tr className="border-t border-canvas-100 dark:border-canvas-700"><td className="px-3 py-2">5억~10억</td><td className="px-3 py-2 text-center">42%</td><td className="px-3 py-2 text-right">3,594만원</td></tr>
                <tr className="border-t border-canvas-100 dark:border-canvas-700"><td className="px-3 py-2">10억 초과</td><td className="px-3 py-2 text-center">45%</td><td className="px-3 py-2 text-right">6,594만원</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">계산 공식</h2>
          <p>
            <strong>산출세액 = 과세표준 × 세율 - 누진공제</strong>
          </p>
          <p>
            예: 과세표준 7,000만원 → 7,000 × 24% - 576 = 1,680 - 576 = <strong className="text-electric">1,104만원</strong>이
            산출세액입니다. 여기에 지방소득세 10%(110.4만원)를 더하면 총 1,214.4만원이 최종 세부담입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            누가 종합소득세를 신고해야 하나요?
          </h2>
          <ul>
            <li><strong>프리랜서·N잡러</strong>: 사업소득(3.3%) 발생자, 강사·작가·디자이너·개발자 외주 등</li>
            <li><strong>1인 사업자</strong>: 개인사업자 등록자 (부가세 신고와 별도)</li>
            <li><strong>임대소득자</strong>: 주택임대 연 2,000만원 초과 시 (이하면 분리과세 선택 가능)</li>
            <li><strong>금융소득 종합과세 대상</strong>: 이자·배당 합계 2,000만원 초과</li>
            <li><strong>기타소득자</strong>: 강연료·원고료 등 연 300만원 초과</li>
            <li><strong>근로소득만 있는 직장인</strong>: 회사 연말정산으로 종결 — 별도 신고 불필요</li>
          </ul>
          <p>
            5월 신고 일정·필요 서류·환급 절차는{" "}
            <Link href="/year-end-tax-2026" className="text-electric font-bold hover:underline">
              2026 종합소득세 신고 가이드
            </Link>
            에서 단계별로 확인할 수 있습니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">절세 핵심 5가지</h2>
          <ol>
            <li><strong>필요경비 100% 챙기기</strong>: 사업용 카드 분리, 영수증 보관, 차량 유지비·통신비·재택 사무실 비용</li>
            <li><strong>인적공제 최대화</strong>: 부양가족 1인당 150만원 (연소득 100만원 이하 가족)</li>
            <li><strong>연금저축·IRP 세액공제</strong>: 최대 900만원 납입 시 13.2~16.5% 세액공제 (= 약 119~149만원 환급)</li>
            <li><strong>중소기업 취업자 감면</strong>: 만 34세 이하 또는 60세 이상, 청년·고령자 등 5년간 70~90% 감면</li>
            <li><strong>장기보유 부동산 우대세율</strong>: 10년 이상 보유 1주택 양도 시 80%까지 장기보유공제</li>
          </ol>
        </section>

        <InArticleAd />

        <section className="my-10">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
                  Q. {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-blue dark:text-canvas-300">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />

        {/* 14차 — RelatedCalculators 추가 (dead-end 차단) */}
        <RelatedCalculators currentPath="/income-tax-2026" title="종합소득세와 함께 보면 좋은 도구" />

        {/* 14차 — ShareButtons (공유 유입) */}
        <div className="my-8">
          <ShareButtons title="2026 종합소득세 계산기" description="8단계 누진세율 + 지방소득세 즉시 산출" />
        </div>

        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">함께 보면 좋은 계산기</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/year-end-tax" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">연말정산 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">근로자 1월~2월 환급금 미리</p>
            </Link>
            <Link href="/tools/finance/freelance-tax" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">프리랜서 종소세 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">사업소득 3.3% 분리</p>
            </Link>
            <Link href="/tools/finance/irp" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">IRP·연금저축 세액공제</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">최대 900만원 환급</p>
            </Link>
            <Link href="/" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">연봉 실수령액 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">4대보험·소득세 자동 공제</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
