// src/app/civil-servant-pay-2026/page.tsx
// 2026 공무원 봉급표 시즌 페이지 — "공무원 봉급표"는 매년 12월 말~1월 검색 폭증 키워드
//
// ★ 갱신 체크포인트: 매년 12월 말 인사혁신처가 이듬해 공무원 보수 인상률·봉급표를
//   국무회의 의결 직후 발표한다(2026년분은 2025-12-30 의결). 발표 즉시
//   봉급표(GENERAL_PAY_ROWS·POLICE_FIRE_ROWS)·인상률·수당 수치·연도 표기를 갱신할 것.
//   출처: 인사혁신처 mpm.go.kr(2026 봉급표 원문·보도자료 cntId=4187), 법제처 공무원수당규정

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import {
  TrendingUp,
  ArrowRight,
  Calculator,
  FileText,
  Calendar,
  Shield,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import {
  breadcrumbLd,
  faqLd,
  articleLd,
  datasetLd,
  speakableLd,
} from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, SidebarAd, MultiplexAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 공무원 봉급표 — 9급~5급 호봉별 월급·3.5% 인상 확정",
  description:
    "인사혁신처 확정 2026년 공무원 봉급표. 9급 1호봉 월 2,133,000원(수당 포함 초임 연 3,428만원), 전체 3.5%·저연차 6.6% 인상. 9·8·7·6·5급 1~10호봉 월급표, 경찰(순경)·소방(소방사) 초임, 정액급식비·명절휴가비 등 수당 구조와 실수령액까지.",
  path: "/civil-servant-pay-2026",
  ogType: "article",
  publishedTime: "2026-08-15",
  modifiedTime: "2026-08-15",
  keywords: [
    "공무원 봉급표 2026",
    "2026 공무원 봉급표",
    "공무원 월급",
    "9급 공무원 월급",
    "9급 초임",
    "7급 공무원 월급",
    "공무원 인상률",
    "경찰 공무원 월급",
    "소방 공무원 월급",
    "공무원 수당",
  ],
});

// 데이터는 src/lib/civilServantPay.ts 단일 진실 소스 —
// /civil-servant-pay-2027(전망 페이지)과 공유 (2026-08-16 추출)
import {
  GENERAL_PAY_ROWS_2026 as GENERAL_PAY_ROWS,
  POLICE_FIRE_ROWS_2026 as POLICE_FIRE_ROWS,
  POSITION_ALLOWANCE_2026 as POSITION_ALLOWANCE,
} from "@/lib/civilServantPay";

const fmt = (n: number) => n.toLocaleString("ko-KR");

const FAQ_ITEMS = [
  {
    question: "2026년 공무원 봉급 인상률은 얼마인가요?",
    answer:
      "전체 3.5% 인상으로 2017년 이후 최고 인상률이며, 2년 연속 3%대 인상입니다. 여기에 7~9급 저연차(낮은 호봉) 구간은 추가 3.1%를 더해 최대 6.6% 인상됐습니다. 2025년 12월 30일 국무회의에서 의결돼 2026년 1월 1일부터 시행 중입니다. (출처: 인사혁신처 보도자료)",
  },
  {
    question: "2026년 9급 공무원 초임(첫 월급)은 실제로 얼마인가요?",
    answer:
      "봉급표상 9급 1호봉 월 봉급은 2,133,000원이지만, 정액급식비·직급보조비·명절휴가비 등 공통 수당을 합친 초임 보수는 연 3,428만원(월평균 약 286만원)입니다. 2025년 연 3,222만원 대비 약 205만원 올랐습니다. 여기서 4대보험(공무원연금)과 소득세를 공제한 금액이 통장에 들어오는 실수령액입니다. (출처: 인사혁신처 보도자료)",
  },
  {
    question: "봉급표 금액이 실수령액인가요?",
    answer:
      "아닙니다. 봉급표는 수당을 뺀 기본급(봉급)만 표시합니다. 실제 보수는 봉급에 정액급식비(월 16만원), 직급보조비, 명절휴가비(설·추석 각 월봉급의 60%), 정근수당 등을 더해 계산하고, 여기서 공무원연금 기여금·건강보험료·소득세 등을 공제한 금액이 실수령액입니다. 봉급표만 보면 실제 받는 돈보다 적어 보이는 이유입니다.",
  },
  {
    question: "경찰(순경)·소방(소방사) 공무원 월급은 얼마인가요?",
    answer:
      "2026년 순경·소방사 1호봉 월 봉급은 2,133,000원으로 일반직 9급 1호봉과 같지만, 2호봉부터는 별도 봉급표가 적용돼 2호봉 2,155,600원, 3호봉 2,187,500원, 4호봉 2,229,200원, 5호봉 2,281,100원으로 오릅니다. 한 계급 위인 경장·소방교 1호봉은 2,215,300원입니다. (출처: 인사혁신처 2026 공무원 봉급표)",
  },
  {
    question: "공무원 수당에는 어떤 것이 있나요?",
    answer:
      "2026년 확정 기준으로 정액급식비 월 160,000원(기존 14만원에서 인상), 명절휴가비 설·추석 각각 월봉급액의 60%, 직급보조비 월 175,000원(8·9급)~750,000원(1급), 정근수당 연 2회(1월·7월) 근무연수에 따라 월봉급액의 0~50%가 대표적입니다. 이외 직무·가족 수당 등이 직렬과 개인 상황에 따라 추가됩니다. (출처: 법제처 공무원수당 등에 관한 규정)",
  },
  {
    question: "군무원 봉급표는 따로 있나요?",
    answer:
      "군무원은 공무원보수규정 별표 3에 따라 일반직 공무원과 동일한 봉급표를 적용받습니다. 즉 위의 9~5급 봉급표를 군무원 9~5급에 그대로 대입해 보면 됩니다.",
  },
  {
    question: "다음 연도 공무원 봉급표는 언제 발표되나요?",
    answer:
      "매년 12월 말 국무회의에서 이듬해 공무원 보수규정 개정안이 의결되면서 인상률과 봉급표가 확정·발표되고, 다음 해 1월 1일부터 시행됩니다. 2026년 봉급표도 2025년 12월 30일 국무회의 의결을 거쳐 확정됐습니다. 2027년은 공무원보수위원회가 3.4~3.9% 인상을 권고한 상태이며, 권고안 기준 예상 봉급표는 본 사이트의 2027 공무원 봉급 전망 페이지에서 미리 확인할 수 있습니다.",
  },
];

export default function CivilServantPay2026Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "공무원 봉급표 2026", path: "/civil-servant-pay-2026" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: "2026 공무원 봉급표 — 9급~5급 호봉별 월급·인상률·수당 구조",
            description:
              "인사혁신처 확정 2026 공무원 봉급표(9·8·7·6·5급 1~10호봉), 경찰·소방 초임, 3.5%(저연차 6.6%) 인상률과 수당·실수령액 해설",
            slug: "civil-servant-pay-2026",
            url: "/civil-servant-pay-2026",
            publishedDate: "2026-08-15",
            modifiedDate: "2026-08-15",
          }),
          datasetLd({
            name: "2026년 공무원 봉급표 데이터 (9급~5급 1~10호봉)",
            description:
              "인사혁신처 2026년 공무원 보수규정 기준 일반직 9·8·7·6·5급 1~10호봉 월 봉급액과 경찰(순경)·소방(소방사) 초임 봉급 데이터셋. 2025-12-30 국무회의 의결, 2026-01-01 시행분.",
            url: "/civil-servant-pay-2026",
            datePublished: "2026-08-15",
            dateModified: "2026-08-15",
            keywords: [
              "공무원 봉급표",
              "2026 공무원 월급",
              "9급 공무원",
              "7급 공무원",
              "경찰 월급",
              "소방 월급",
            ],
          }),
          speakableLd({
            url: "/civil-servant-pay-2026",
            cssSelectors: [".faq-answer"],
          }),
        ]}
      />

      <div className="page-width">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            2025-12-30 국무회의 의결 · 2026-01-01 시행
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2026 공무원 봉급표 <span className="text-electric">9급~5급 월급</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-15" updatedDate="2026-08-15" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            전체 3.5% 인상(2017년 이후 최고), 7~9급 저연차는 추가 3.1%를 더해 최대 6.6%
            인상됐습니다. 9급 초임은 수당 포함 연 3,428만원(월평균 약 286만원)입니다.
          </p>
          <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
            📚 공식 출처:{" "}
            <a
              href="https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              인사혁신처 2026년 공무원 봉급표
            </a>{" "}
            · 인사혁신처 보도자료(2025-12-30) · 법제처 공무원수당규정
          </p>
        </div>

        <HomeTopAd />

        {/* 데스크톱 2컬럼 — calc/[slug] 정본 패턴 (사이드바 광고, 운영자 일괄 승인
            2026-08-23). 히어로·상단 광고는 그리드 밖 전폭, 좌측 컬럼 max-w-3xl 단일 래퍼 */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
          <div className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">

        {/* 핵심 요약 */}
        <section className="mt-10 mb-12 prose prose-slate">
          <p className="text-sm leading-7 text-muted-blue">
            공무원 봉급표는 인사혁신처가 매년 12월 말 국무회의 의결(공무원보수규정 개정)을
            거쳐 확정하며, 다음 해 1월 1일부터 시행됩니다. 2026년 봉급표는 2025년 12월 30일
            국무회의에서 의결됐습니다. 아래 표는 인사혁신처가 공표한{" "}
            <strong>일반직 공무원 9·8·7·6·5급 1~10호봉 월 봉급액</strong> 원문 수치입니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            주의할 점은 봉급표의 금액이 <strong>수당을 뺀 기본급(봉급)</strong>이라는 것입니다.
            실제 보수는 봉급에 정액급식비·직급보조비·명절휴가비·정근수당 등을 더해 계산하므로,
            9급 1호봉의 봉급은 월 2,133,000원이지만 수당을 포함한 초임 보수는 연 3,428만원
            (월평균 약 286만원)입니다. 봉급표 아래에서 수당 구조와 실수령액 계산 흐름까지
            차례로 정리합니다.
          </p>
        </section>

        {/* 메인 봉급표 */}
        <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-electric" />
            2026 일반직 공무원 봉급표 (9급~5급, 1~10호봉)
          </h2>
          <p className="text-xs text-faint-blue mb-5">
            단위: 원(월 봉급액) · 출처: 인사혁신처 2026년 공무원 봉급표
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b-2 border-canvas-200 text-navy">
                  <th className="py-3 px-2 text-left font-black">호봉</th>
                  <th className="py-3 px-2 text-right font-black">9급</th>
                  <th className="py-3 px-2 text-right font-black">8급</th>
                  <th className="py-3 px-2 text-right font-black">7급</th>
                  <th className="py-3 px-2 text-right font-black">6급</th>
                  <th className="py-3 px-2 text-right font-black">5급</th>
                </tr>
              </thead>
              <tbody>
                {GENERAL_PAY_ROWS.map(([hobong, g9, g8, g7, g6, g5]) => (
                  <tr key={hobong} className="border-b border-canvas-100">
                    <td className="py-2.5 px-2 font-bold text-navy">{hobong}호봉</td>
                    <td className="py-2.5 px-2 text-right text-muted-blue">{fmt(g9)}</td>
                    <td className="py-2.5 px-2 text-right text-muted-blue">{fmt(g8)}</td>
                    <td className="py-2.5 px-2 text-right text-muted-blue">{fmt(g7)}</td>
                    <td className="py-2.5 px-2 text-right text-muted-blue">{fmt(g6)}</td>
                    <td className="py-2.5 px-2 text-right text-muted-blue">{fmt(g5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint-blue mt-4">
            ※ 참고: 1급 1호봉 월 {fmt(4656100)}원, 1급 23호봉 월 {fmt(8001400)}원.
            군무원은 공무원보수규정 별표 3에 따라 일반직과 동일한 봉급표를 적용받습니다.
          </p>
        </section>

        <CalcResultAd />

        {/* 인상률 해설 */}
        <section className="mt-10 mb-12 prose prose-slate">
          <h2 className="text-lg font-black text-navy mb-3">
            인상률 3.5% — 2017년 이후 최고, 저연차는 6.6%
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            2026년 공무원 보수는 <strong>전체 3.5% 인상</strong>으로 2017년 이후 최고
            인상률이며 2년 연속 3%대 인상입니다. 여기에 처우 개선이 시급한{" "}
            <strong>7~9급 저연차(낮은 호봉) 구간에는 추가 3.1%p를 얹어 최대 6.6%</strong>{" "}
            인상됐습니다. 이 저연차 추가 인상 덕분에 9급 1호봉 초임 보수(봉급+수당)는
            2025년 연 3,222만원에서 2026년 연 3,428만원으로 약 205만원 올랐습니다.
            (출처: 인사혁신처 보도자료, 2025-12-30) 내년이 궁금하다면{" "}
            <Link
              href="/civil-servant-pay-2027"
              className="text-electric font-bold hover:underline"
            >
              2027 공무원 봉급 전망(보수위 권고 3.4~3.9%)
            </Link>
            도 함께 확인하세요.
          </p>

          <h2 className="text-lg font-black text-navy mt-8 mb-3">
            봉급 위에 얹히는 수당 구조 (2026 확정)
          </h2>
          <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
            <li>
              <strong>정액급식비</strong> — 월 160,000원 (기존 14만원에서 16만원으로 인상)
            </li>
            <li>
              <strong>명절휴가비</strong> — 설·추석 각각 월봉급액의 60% (연 2회)
            </li>
            <li>
              <strong>직급보조비</strong> — 직급별 정액 지급 (아래 표, 2026년 현행 유지)
            </li>
            <li>
              <strong>정근수당</strong> — 연 2회(1월·7월), 근무연수에 따라 월봉급액의 0~50%
            </li>
          </ul>
          <div className="not-prose mt-4 p-5 bg-white rounded-2xl border border-canvas-200">
            <p className="text-xs font-bold text-faint-blue mb-3">
              직급보조비 월액 (출처: 법제처 공무원수당 등에 관한 규정)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {POSITION_ALLOWANCE.map((row) => (
                <div key={row.grade} className="p-3 bg-canvas rounded-xl text-center">
                  <p className="text-xs font-bold text-faint-blue mb-1">{row.grade}</p>
                  <p className="text-sm font-black text-navy">{fmt(row.amount)}원</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <InArticleAd />

        {/* 봉급 ≠ 실수령 */}
        <section className="mt-10 mb-12 prose prose-slate">
          <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-electric" />
            봉급표 금액 ≠ 실수령액 — 통장에 들어오는 돈 계산 흐름
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            실제 월급 통장에 찍히는 금액은{" "}
            <strong>① 봉급 + 수당 합산 → ② 공제</strong>의 두 단계를 거칩니다. 봉급표의
            월 봉급액에 정액급식비·직급보조비 등 매월 수당과 명절휴가비·정근수당 같은
            비정기 수당을 더한 것이 세전 보수이고, 여기서 공무원연금 기여금, 건강보험료,
            소득세·지방소득세 등을 공제한 금액이 실수령액입니다. 9급 1호봉이라면 봉급
            2,133,000원이 아니라 수당 포함 연 3,428만원이 세전 기준이 됩니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            9급 초임 연 3,428만원의 월별 공제·실수령 내역은 가장 가까운 구간인{" "}
            <Link href="/salary/34500000" className="text-electric font-bold hover:underline">
              연봉 3,450만원 실수령액 표
            </Link>
            에서 바로 확인할 수 있고, 9급 공무원의 직급별 연봉 흐름과 직업 정보는{" "}
            <Link href="/job/civil-servant-9" className="text-electric font-bold hover:underline">
              9급 공무원 연봉 페이지
            </Link>
            에 정리돼 있습니다.
          </p>
        </section>

        {/* CTA 카드 */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/salary/34500000"
            className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
          >
            <Calculator className="w-8 h-8 opacity-70 mb-3" />
            <h3 className="text-lg font-black mb-2">9급 초임 실수령액</h3>
            <p className="text-sm opacity-90">연 3,428만원과 가장 가까운 3,450만원 구간 보기</p>
          </Link>
          <Link
            href="/job/civil-servant-9"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <FileText className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">9급 공무원 연봉 정보</h3>
            <p className="text-sm text-muted-blue">직업 정보·연차별 연봉 흐름</p>
          </Link>
          <Link
            href="/social-insurance-rates-2026"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <FileText className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">2026 4대보험 요율</h3>
            <p className="text-sm text-muted-blue">공제 항목 요율 한눈에 확인</p>
          </Link>
        </section>

        {/* 경찰·소방 초임 */}
        <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-electric" />
            경찰(순경)·소방(소방사) 초임 봉급 (1~5호봉)
          </h2>
          <p className="text-xs text-faint-blue mb-5">
            단위: 원(월 봉급액) · 출처: 인사혁신처 2026년 공무원 봉급표
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="border-b-2 border-canvas-200 text-navy">
                  <th className="py-3 px-2 text-left font-black">호봉</th>
                  <th className="py-3 px-2 text-right font-black">순경 · 소방사</th>
                </tr>
              </thead>
              <tbody>
                {POLICE_FIRE_ROWS.map(([hobong, pay]) => (
                  <tr key={hobong} className="border-b border-canvas-100">
                    <td className="py-2.5 px-2 font-bold text-navy">{hobong}호봉</td>
                    <td className="py-2.5 px-2 text-right text-muted-blue">{fmt(pay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint-blue mt-4">
            ※ 순경·소방사 1호봉({fmt(2133000)}원)은 일반직 9급 1호봉과 같지만 2호봉부터는
            별도 봉급표가 적용됩니다. 한 계급 위인 경장·소방교 1호봉은 {fmt(2215300)}원입니다.
            실제 보수는 여기에 위험근무수당 등 직렬별 수당이 추가됩니다. 상위 계급까지의 전체
            표는{" "}
            <Link href="/police-pay-2026" className="text-electric font-bold hover:underline">
              경찰 봉급표
            </Link>
            ·
            <Link href="/firefighter-pay-2026" className="text-electric font-bold hover:underline">
              소방 봉급표
            </Link>
            에서, 교원·군인 봉급은{" "}
            <Link href="/teacher-pay-2026" className="text-electric font-bold hover:underline">
              교사 호봉표
            </Link>
            ·
            <Link href="/military-pay-2026" className="text-electric font-bold hover:underline">
              군인 월급 2026
            </Link>
            에서 확인하세요.
          </p>
        </section>

        <GuideMidAd />

        {/* FAQ */}
        <section className="mt-10 mb-12">
          <h2 className="text-xl font-black text-navy mb-6">공무원 봉급 자주 묻는 질문</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group p-5 bg-white rounded-2xl border border-canvas-200"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
                  {item.question}
                  <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
                </summary>
                <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        <RelatedCalculators currentPath="/civil-servant-pay-2026" />

        <div className="mt-8">
          <ShareButtons
            title="2026 공무원 봉급표 — 9급~5급 호봉별 월급"
            description="3.5% 인상 확정, 9급 초임 연 3,428만원. 경찰·소방 초임과 수당 구조까지 한눈에"
          />
        </div>

        {/* 본문 끝 관련콘텐츠형 광고 — 좌측 컬럼 끝, 전면 최적화 (운영자 지시 2026-09-02) */}
        <div className="mt-10">
          <MultiplexAd />
        </div>
          </div>

          {/* Desktop sticky sidebar — 광고 + 쿠팡 (salary/[amount] 동일 조합) */}
          <aside
            className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start"
            aria-label="추천·광고"
          >
            <SidebarAd />
            <CoupangBanner size="skyscraper" showDisclosure={false} />
          </aside>
        </div>
      </div>
    </main>
  );
}
