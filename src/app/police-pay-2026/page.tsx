// src/app/police-pay-2026/page.tsx
// 2026 경찰 봉급표 — "경찰 봉급표"·"순경 월급" 에버그린 수요 (2026-08-30 승인 배치 ⑤).
// 데이터: civilServantPay.ts POLICE_RANK_ROWS_2026 (별표 10, 3중 교차검증).
// 광고: civil-servant-pay-2026 표준 배치 복제 (운영자 승인 2026-08-30).
// ★ 갱신 체크포인트: 매년 12월 말 국무회의 의결 시 봉급표·수당 갱신.
// 순경~치안정감 전 호봉 전체표 (RL-12, 2026-11-15 — 10월 917e628f7 재구현, 운영자 2026-11-13 질문 2 승인):
//   FAQ 뒤 본문 칼럼 마지막 광고(쿠팡 배너) 아래 기본 접힘 상자(#police-full-table, open 금지). 광고 위 요약표
//   (PoliceFireRankTable 1~5호봉)·메타·리드·광고 컴포넌트 순서는 그대로. 데이터는 payTablesFull2026.ts(인사혁신처 원문 파싱,
//   법제처 별표 10 재대조 2026-11-15). 가드: src/lib/__tests__/payTablesFull2026.test.ts
//   ★ D+28 관찰(10월 159d4cfaf 메모): 경찰·소방 두 페이지가 같은 약 290칸 표를 싣는다 — 28일 뒤 네이버 색인을 비교해
//   한쪽이 빠지면 표는 한 페이지에만 두고 다른 쪽은 링크로 바꾼다.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Shield, Calendar, Calculator, FileText, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, datasetLd, speakableLd } from "@/lib/structuredData";
import { CITATION_POLICY_URL } from "@/lib/citationPolicy";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CIVIL_DISPATCH_DAILY_CAP_2026,
  CIVIL_DISPATCH_PER_CASE_2026,
  CIVIL_HAZARD_ALLOWANCE_2026,
  CIVIL_MEAL_ALLOWANCE_2026,
  CIVIL_POSITION_ALLOWANCE_2026,
  CIVIL_POSITION_ALLOWANCE_POLICE_FIRE_UPPER_2026,
  CIVIL_SPECIAL_DUTY_CROWD_DISASTER_2026,
  PAY_PAGE_ALLOWANCE_SOURCE_2026,
} from "@/lib/civilServantAllowances2026";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import PoliceFireRankTable from "@/components/PoliceFireRankTable";
import { HAZARD_ALLOWANCE_2026, POLICE_RANK_ROWS_2026 } from "@/lib/civilServantPay";
import CitationCopyButton from "@/components/CitationCopyButton";
import PayStepTable from "@/components/PayStepTable";
import {
  POLICE_FIRE_PAY_FULL_2026,
  POLICE_FIRE_RANKS_FULL,
  PAY_FULL_2026_CHECKED,
  pickPayColumns,
} from "@/lib/payTablesFull2026";

const fmt = (n: number) => n.toLocaleString("ko-KR");

// 맨 아래 접힌 상자 전용 — 하위 5계급(순경~경감)·상위 5계급(경정~치안정감) 두 표로 나눠 모바일 가로 스크롤을 줄인다
const POLICE_LABELS = POLICE_FIRE_RANKS_FULL.map((r) => r.police);
const FULL_LOWER = pickPayColumns(POLICE_FIRE_PAY_FULL_2026, 0, 5);
const FULL_UPPER = pickPayColumns(POLICE_FIRE_PAY_FULL_2026, 5, 10);
// 공무원보수규정 [별표 10] 경찰공무원ㆍ소방공무원 및 의무경찰 등의 봉급표 — 법제처 국가법령정보센터 별표 링크(현행)
const LAW_ANNEX_10_URL = `https://www.law.go.kr/LSW/lsBylInfoPLinkR.do?lsNm=${encodeURIComponent("공무원보수규정")}&bylNo=0010&bylBrNo=00&bylCls=BE&bylEfYdYn=Y`;

export const metadata: Metadata = buildPageMetadata({
  title: "2026 경찰 봉급표 — 순경~경감 계급·호봉별 월급 총정리",
  description:
    "인사혁신처 확정 2026년 경찰공무원 봉급표. 순경 1호봉 월 2,133,000원(저연차 6.6% 인상)부터 경감까지 계급×호봉 월급, 위험근무수당 8만원·수당 구조와 실수령액 계산 흐름 — 공무원보수규정 별표 10 원문 수치.",
  path: "/police-pay-2026",
  ogType: "article",
  publishedTime: "2026-08-30",
  modifiedTime: "2026-10-04",
  keywords: [
    "경찰 봉급표 2026",
    "경찰 월급",
    "순경 월급",
    "순경 초임",
    "경장 월급",
    "경찰공무원 봉급표",
    "경찰 연봉",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2026년 순경 첫 월급은 얼마인가요?",
    answer:
      "순경 1호봉 월 봉급은 2,133,000원으로 일반직 9급 1호봉과 같습니다(저연차 추가 인상 6.6% 반영). 여기에 정액급식비(월 16만원)·직급보조비(월 17.5만원)·위험근무수당(월 8만원)과 초과근무수당 등이 더해지므로 실제 세전 보수는 봉급표보다 큽니다. 중앙경찰학교 교육 기간에는 별도 기준이 적용됩니다.",
  },
  {
    question: "경찰 봉급표는 소방과 같나요?",
    answer:
      "네. 공무원보수규정 별표 10은 '경찰공무원·소방공무원' 단일 통합 봉급표입니다. 순경=소방사, 경장=소방교, 경사=소방장, 경위=소방위, 경감=소방경으로 계급이 1:1 대응하며 금액이 같습니다. 차이는 직렬별 수당(위험근무·출동 수당 등)에서 생깁니다.",
  },
  {
    question: "봉급표 금액이 실수령액인가요?",
    answer:
      "아닙니다. 봉급표는 기본급만 표시합니다. 실제 보수는 봉급 + 정액급식비·직급보조비·위험근무수당·초과근무수당·명절휴가비(설·추석 각 월봉급의 60%) 등을 더한 뒤 공무원연금 기여금·건강보험·소득세를 공제한 금액입니다. 교대근무가 많은 지구대·파출소는 초과근무수당 비중이 커서 실수령 편차가 큽니다.",
  },
  {
    question: "경찰 위험근무수당은 얼마인가요?",
    answer:
      "2026년 위험근무수당은 월 80,000원으로 전년 7만원에서 인상됐습니다. 112 출동수당과 관련 출동 가산금의 일 상한도 3만원에서 4만원으로 올랐습니다(2026년 공무원수당규정 개정).",
  },
  {
    question: "승진하면 월급이 얼마나 오르나요?",
    answer:
      "같은 5호봉 기준 순경 2,281,100원 → 경장 2,427,500원 → 경사 2,710,600원 → 경위 2,879,500원 → 경감 3,178,700원으로, 한 계급 승진마다 월 15만~30만원가량 오릅니다. 승진 시 호봉도 일부 이어지므로 실제 인상 폭은 더 큽니다.",
  },
];

// 2026 경찰 수당 한눈에 (RL-12 T14b, 10월 b2cdf929d PT-08 재구현) — 본문 칼럼 맨 끝(마지막 광고 아래) 표. 숫자는 전부 정본 상수.
// 소방 페이지와 같은 틀을 복제하지 않도록 경찰은 '계급별 직급보조비 → 현장 수당' 순서, 112 출동 중심 문장으로 쓴다.
const PF = CIVIL_POSITION_ALLOWANCE_2026.policeFire;
const PF_UPPER = CIVIL_POSITION_ALLOWANCE_POLICE_FIRE_UPPER_2026;
const POLICE_POSITION_ROWS: { name: string; amount: string }[] = [
  { name: "순경·경장", amount: `월 ${fmt(PF[0])}원` },
  { name: "경사", amount: `월 ${fmt(PF[2])}원` },
  { name: "경위·경감", amount: `월 ${fmt(PF[3])}원` },
  { name: "경정", amount: `월 ${fmt(PF_UPPER[0])}원` },
  { name: "총경", amount: `월 ${fmt(PF_UPPER[1])}원` },
  { name: "경무관", amount: `월 ${fmt(PF_UPPER[2])}원` },
  { name: "치안감", amount: `월 ${fmt(PF_UPPER[3])}원` },
  { name: "치안정감", amount: `월 ${fmt(PF_UPPER[4])}원` },
];
const POLICE_DUTY_ROWS: { name: string; amount: string; note: string }[] = [
  {
    name: "위험근무수당",
    amount: `월 ${fmt(CIVIL_HAZARD_ALLOWANCE_2026.gap + CIVIL_HAZARD_ALLOWANCE_2026.surcharge)}원`,
    note: `갑종 월 ${fmt(CIVIL_HAZARD_ALLOWANCE_2026.gap)}원 + 현장 가산금 ${fmt(CIVIL_HAZARD_ALLOWANCE_2026.surcharge)}원(별표 9 비고 해당 직무). 직무에 따라 을종 월 ${fmt(CIVIL_HAZARD_ALLOWANCE_2026.eul)}원·병종 월 ${fmt(CIVIL_HAZARD_ALLOWANCE_2026.byeong)}원`,
  },
  {
    name: "112신고 출동수당",
    amount: `1일 상한 ${fmt(CIVIL_DISPATCH_DAILY_CAP_2026)}원`,
    note: `긴급 출동 1건당 ${fmt(CIVIL_DISPATCH_PER_CASE_2026)}원 — 2026년 상한 3만원에서 4만원으로 인상`,
  },
  {
    name: "특수업무수당",
    amount: `월 ${fmt(CIVIL_SPECIAL_DUTY_CROWD_DISASTER_2026)}원 이하`,
    note: "2026년 신설 — 인파 사고 등 재난·안전관리 업무를 상시 맡는 경찰청 경비부서 경찰",
  },
  { name: "정액급식비", amount: `월 ${fmt(CIVIL_MEAL_ALLOWANCE_2026)}원`, note: "공무원 공통" },
];

export default function PolicePay2026Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "경찰 봉급표 2026", path: "/police-pay-2026" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: "2026 경찰 봉급표 — 순경~경감 계급·호봉별 월급과 수당 구조",
            description:
              "경찰공무원 봉급표(순경~경감 1~5호봉)와 위험근무수당·수당 구조, 실수령액 계산 흐름",
            slug: "police-pay-2026",
            url: "/police-pay-2026",
            publishedDate: "2026-08-30",
            modifiedDate: "2026-10-04",
          }),
          datasetLd({
            name: "2026년 경찰공무원 봉급표 데이터 (순경~치안정감 전 호봉)",
            description:
              "공무원보수규정 별표 10 기준 2026년 경찰공무원 계급별(순경~치안정감)·호봉별 전체 월 봉급액 데이터셋(인사혁신처 2026 봉급표 원문, 1~5호봉 요약표 포함).",
            url: "/police-pay-2026",
            datePublished: "2026-08-30",
            dateModified: "2026-11-15",
            keywords: ["경찰 봉급표", "순경 월급", "경찰 월급", "경찰공무원"],
            // 사이트 인용 정책 URL — 페이지 인용 복사 상자('출처 표기 시 자유 인용')와 같은 정책 (G3, 2026-11-01)
            license: CITATION_POLICY_URL,
          }),
          speakableLd({ url: "/police-pay-2026", cssSelectors: [".faq-answer"] }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            공무원보수규정 별표 10 · 2026-01-01 시행
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2026 경찰 봉급표 <span className="text-electric">순경~경감 월급</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-30" updatedDate="2026-10-04" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            순경 1호봉 월 2,133,000원(저연차 6.6% 인상 반영)부터 경감까지 — 계급×호봉 봉급표
            원문 수치와 위험근무수당·실수령 계산 흐름을 정리했습니다.
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
            · 법제처 공무원수당규정
          </p>
        </div>

        <HomeTopAd />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
          <div className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">
            {/* 봉급표 */}
            <section className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-electric" />
                2026 경찰공무원 봉급표 (순경~경감, 1~5호봉)
              </h2>
              <p className="text-xs text-faint-blue mb-5">
                단위: 원(월 봉급액) · 출처: 공무원보수규정 별표 10 (경찰·소방 통합표)
              </p>
              <PoliceFireRankTable variant="police" />
              <p className="text-xs text-faint-blue mt-4">
                ※ 참고: 경정 1호봉 월 {fmt(3126100)}원. 소방공무원은 동일 표를 적용받습니다 —{" "}
                <Link href="/firefighter-pay-2026" className="text-electric font-bold hover:underline">
                  소방 봉급표 페이지
                </Link>
                에서 소방 계급 기준으로 볼 수 있습니다.
              </p>
            </section>

            <CalcResultAd />

            {/* 수당 해설 */}
            <section className="mt-10 mb-12 prose prose-slate">
              <h2 className="text-lg font-black text-navy mb-3">봉급 위에 얹히는 경찰 수당</h2>
              <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
                <li>
                  <strong>위험근무수당</strong> — 월 {fmt(HAZARD_ALLOWANCE_2026)}원 (2026년 7만→8만원 인상)
                </li>
                <li>
                  <strong>112 출동수당·출동 가산금</strong> — 일 상한 4만원 (2026년 3만→4만원 인상)
                </li>
                <li>
                  <strong>정액급식비</strong> 월 16만원 · <strong>직급보조비</strong> 월 17.5만원(순경~경장급) ·{" "}
                  <strong>명절휴가비</strong> 설·추석 각 월봉급의 60%
                </li>
                <li>
                  <strong>초과근무수당</strong> — 교대·비상근무 비중이 커 실수령 편차의 핵심
                </li>
              </ul>
              <p className="text-sm leading-7 text-muted-blue mt-4">
                수당까지 합친 순경 초임의 세전 보수는 일반직 9급 초임(연 3,428만원)보다 높은
                편입니다. 세후 실수령은{" "}
                <Link href="/calc/civil-servant-net-pay#police" data-msy-module="pay-full-next" className="text-electric font-bold hover:underline">
                  경찰공무원 실수령액 계산기
                </Link>
                에서, 경찰 커리어별 연봉 흐름은{" "}
                <Link href="/job/police-officer" data-msy-module="pay-full-next" className="text-electric font-bold hover:underline">
                  경찰공무원 연봉 페이지
                </Link>
                에서 확인하세요.
              </p>
            </section>

            <InArticleAd />

            {/* CTA — mt-8: 위 광고 바깥 여백(24px)과 병합돼 광고 아래 32px(2026-10-05 운영자 승인 #5, 광고 아래만) */}
            <section className="mt-8 mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/civil-servant-pay-2026"
                className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
              >
                <Calculator className="w-8 h-8 opacity-70 mb-3" />
                <h3 className="text-lg font-black mb-2">공무원 봉급표 2026</h3>
                <p className="text-sm opacity-90">일반직 9~5급 호봉별 월급</p>
              </Link>
              <Link
                href="/job/police-officer"
                data-msy-module="pay-full-next"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">경찰공무원 연봉 정보</h3>
                <p className="text-sm text-muted-blue">계급·연차별 연봉 흐름</p>
              </Link>
              <Link
                href="/firefighter-pay-2026"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">소방 봉급표 2026</h3>
                <p className="text-sm text-muted-blue">소방사~소방경 동일표</p>
              </Link>
            </section>

            <GuideMidAd />

            {/* FAQ */}
            <section className="mt-10 mb-12">
              <h2 className="text-xl font-black text-navy mb-6">경찰 월급 자주 묻는 질문</h2>
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

            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />

            {/* 순경~치안정감 전 호봉 전체표 — FAQ 뒤 마지막 본문 광고(위 쿠팡 배너) 아래, 기본 접힘(open 금지)
                (RL-12, 운영자 승인 2026-11-13 질문 2). 광고 위·광고 사이에는 넣지 않는다.
                데이터: POLICE_FIRE_PAY_FULL_2026 (payTablesFull2026.ts). 출처: 공무원보수규정 [별표 10] · 인사혁신처 2026년 공무원 봉급표 */}
            <details
              id="police-full-table"
              className="group scroll-mt-24 mt-10 mb-12 bg-white rounded-3xl border border-canvas-200"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer p-5 sm:px-8 sm:py-6 text-base font-black text-navy">
                순경~치안정감 전 호봉 보기
                <ArrowRight className="w-4 h-4 shrink-0 text-electric transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                <p className="text-xs text-faint-blue leading-6 mb-5">
                  2026 경찰공무원 봉급표 전체 · 소방공무원 공통 · 단위: 원(월 봉급액) · &lsquo;–&rsquo;는 해당 계급에 없는 호봉
                </p>
                <div className="space-y-8">
                  <PayStepTable
                    caption="순경~경감 (1~32호봉)"
                    columns={POLICE_LABELS.slice(0, 5)}
                    rows={FULL_LOWER}
                    regionLabel="경찰 봉급표 순경~경감 전체 (가로 스크롤)"
                    minWidthClass="min-w-[520px]"
                  />
                  <PayStepTable
                    caption="경정~치안정감 (1~30호봉)"
                    columns={POLICE_LABELS.slice(5, 10)}
                    rows={FULL_UPPER}
                    regionLabel="경찰 봉급표 경정~치안정감 전체 (가로 스크롤)"
                    minWidthClass="min-w-[520px]"
                  />
                </div>
                <p className="text-xs text-faint-blue leading-6 mt-4">
                  ※ 봉급표 금액은 위험근무수당·초과근무수당 등 수당을 뺀 기본급입니다. 출처:{" "}
                  <a
                    href={LAW_ANNEX_10_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-electric font-bold hover:underline"
                  >
                    공무원보수규정 [별표 10]
                  </a>{" "}
                  · 인사혁신처 2026년 공무원 봉급표(확인일 {PAY_FULL_2026_CHECKED}). 같은 표를 소방 계급으로 보려면{" "}
                  <Link href="/firefighter-pay-2026#fire-full-table" data-msy-module="pay-full-next" className="text-electric font-bold hover:underline">
                    소방 봉급표 전체
                  </Link>
                  , 내년 인상률(정부 예산안 기준·확정 전)은{" "}
                  <Link href="/civil-servant-pay-2027" data-msy-module="pay-full-next" className="text-electric font-bold hover:underline">
                    2027 공무원 봉급표 예상
                  </Link>
                  에서 확인하세요.
                </p>
              </div>
            </details>

            <RelatedCalculators currentPath="/police-pay-2026" />

            {/* 인용 복사 — R2 B4 (운영자 승인 2026-08-31): 데이터 변수 기반 빌드타임 생성 */}
            <div className="mt-8">
              <CitationCopyButton
                quote={`2026년 순경 1호봉 월 봉급은 ${POLICE_RANK_ROWS_2026[0][1].toLocaleString("ko-KR")}원으로 일반직 9급 1호봉과 같으며, 여기에 위험근무수당 월 ${HAZARD_ALLOWANCE_2026.toLocaleString("ko-KR")}원 등 직렬 수당이 더해진다 — 공무원보수규정 별표 10 기준.`}
                path="/police-pay-2026"
                quoteId="police-first-step-pay"
                sourceLabel="경찰 봉급표"
              />
            </div>

            <div className="mt-8">
              <ShareButtons
                title="2026 경찰 봉급표 — 순경~경감 계급·호봉별 월급"
                description="순경 1호봉 213만원부터 경감까지, 위험근무수당·수당 구조 총정리"
              />
            </div>
            {/* 세후 월급 계산기 역링크 — 광고 아래 마지막 줄 (2026-09-27) */}
            <p className="mt-8 text-sm text-muted-blue dark:text-canvas-300">
              위험근무수당·공무원연금 기여금을 반영한 경찰 세후 월급은{" "}
              <Link href="/calc/civil-servant-net-pay#police" className="font-bold text-electric hover:underline">
                경찰 실수령액 계산기
              </Link>
              에서 호봉별로 바로 계산할 수 있습니다.
            </p>

            {/* 2026 경찰 수당 한눈에 (RL-12 T14b, 운영자 승인 2026-11-13 질문 2) — 본문 칼럼 맨 끝, 마지막 광고 아래·사이드바 앞 */}
            <section id="police-allowances" className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2">2026 경찰 수당 한눈에 — 계급별 직급보조비와 현장 수당</h2>
              <p className="text-sm leading-7 text-muted-blue mb-5">
                지구대·파출소 교대근무와 112 신고 출동이 잦은 경찰은 봉급 외에 계급별 직급보조비와 위험근무·출동
                수당을 받습니다. 직급보조비는 계급이 오를수록 커집니다.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="border-b-2 border-canvas-200 text-navy">
                      <th className="py-3 px-2 text-left font-black">계급</th>
                      <th className="py-3 px-2 text-right font-black">직급보조비</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POLICE_POSITION_ROWS.map((row) => (
                      <tr key={row.name} className="border-b border-canvas-100">
                        <td className="py-2.5 px-2 font-bold text-navy">{row.name}</td>
                        <td className="py-2.5 px-2 text-right text-muted-blue tabular-nums">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="text-lg font-black text-navy mt-8 mb-3">현장 수당</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="border-b-2 border-canvas-200 text-navy">
                      <th className="py-3 px-2 text-left font-black">수당</th>
                      <th className="py-3 px-2 text-right font-black">금액</th>
                      <th className="py-3 px-2 text-left font-black pl-6">대상·비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POLICE_DUTY_ROWS.map((row) => (
                      <tr key={row.name} className="border-b border-canvas-100">
                        <td className="py-2.5 px-2 font-bold text-navy">{row.name}</td>
                        <td className="py-2.5 px-2 text-right text-muted-blue tabular-nums">{row.amount}</td>
                        <td className="py-2.5 px-2 pl-6 text-xs text-faint-blue">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-faint-blue mt-4">
                출처: {PAY_PAGE_ALLOWANCE_SOURCE_2026.regulation}({PAY_PAGE_ALLOWANCE_SOURCE_2026.decree},{" "}
                {PAY_PAGE_ALLOWANCE_SOURCE_2026.effectiveOn} 시행) 별표 8·9·11·15 · 인사혁신처 2025-12-30 수당 개정 발표 · 확인일{" "}
                {PAY_PAGE_ALLOWANCE_SOURCE_2026.checkedOn}
              </p>
            </section>
          </div>

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
