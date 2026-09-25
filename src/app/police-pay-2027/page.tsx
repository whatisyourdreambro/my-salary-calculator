// src/app/police-pay-2027/page.tsx
// 2027 경찰 봉급표 예상 — 예산안(9/1)~확정(12월 말) 사이 '2027 경찰 봉급표' 검색 선점 (수익 추천 #3, 2026-09-25 준비).
//
// 모델: /civil-servant-pay-2027 — 예산안 3.9% 는 '예상·국회 심의 중·확정 전'으로만 쓰고 출처를 단다,
//   forecast2027 헬퍼, FAQ·JSON-LD(datasetLd 는 확정표 뒤에만)·PublishedMeta.
// 광고: /police-pay-2026 배치 1:1 복제 — HomeTop → (그리드) CalcResult → InArticle → GuideMid → 쿠팡 →
//   사이드바 Sidebar·쿠팡 (추천 #3 '기존 광고 배치 복제' 승인 대상, 새 위치·새 유닛 없음).
// ★ 2027 전체 '예상' 계급×호봉표는 싣지 않는다 — 저연차 추가 인상·국회 조정 전이라 오정보. 대표 지점 예상치만.
// ★ 소방 2027 페이지와 같은 별표 10 을 쓰지만 수당·근무 문단은 직렬별로 따로 쓴다(중복 문서 방지).
// ★ 12월 말 확정 = 숫자만 교체 (11/1~1/31 동결기에 새 구조를 만들지 않게 10월에 자리를 미리 둠):
//   payTablesFull2027.ts 의 PAY_FULL_2027 에 인사혁신처 2027 봉급표 원문 숫자·근거·확인일을 넣으면 이 페이지의
//   title·description·배지·H1 강조어·리드·출처 박스·비교표(2026 확정 → 2027 확정)·일정·FAQ·공유 문구가 확정 문구로
//   바뀌고, Dataset JSON-LD 와 순경~치안정감 전 호봉 전체표(#police-full-table, 마지막 광고·공유 버튼 아래)가 나온다.
//   광고 컴포넌트 위치·순서는 같고, 광고 위 문구는 확정 쪽이 더 짧다(pay2027ConfirmedSlot.test.ts).
//   수정일·sitemap lastModified 는 PAY_FULL_2027.checked 로 자동 갱신 — 이 파일은 고치지 않는다.
// 사실관계 출처(2026-09-25 확인):
//   - 2026 경찰 봉급: 인사혁신처 2026 봉급표(mpm.go.kr, 원문 파싱 → payTablesFull2026.ts)
//   - 2026 계급·호봉별 인상률: 인사혁신처 2025·2026 봉급표 비교(payForecast2027.test.ts 가 2025 원문 앵커로 재계산)
//   - 2026 수당(위험근무수당 7만→8만, 112 출동수당 일 상한 3만→4만, 인파 사고 담당 경찰 특수업무수당 월 8만 신설):
//     인사혁신처 보도자료 2025-12-30(mpm.go.kr cntId=4187)
//   - 2027 예산안 3.9%·9급 초임 보수 월 300만원 수준: 연합뉴스 2026-09-01(기획예산처 설명)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Calendar, Calculator, FileText, ArrowRight, Shield, AlertTriangle } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, datasetLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import PayForecastTable from "@/components/PayForecastTable";
import PayStepTable from "@/components/PayStepTable";
import { HAZARD_ALLOWANCE_2026, RAISE_2027_BUDGET, RAISE_2027_RECOMMENDED } from "@/lib/civilServantPay";
import { policeFireForecastRows } from "@/lib/payForecast2027";
import { POLICE_FIRE_RANKS_FULL, pickPayColumns } from "@/lib/payTablesFull2026";
import {
  PAY_FULL_2027,
  PAY_2027_PAGES_MODIFIED,
  policeFireRaiseRange,
  raisePct,
  ratePct,
} from "@/lib/payTablesFull2027";
import { PAY_TABLES_RELEASE_DATE } from "@/config/siteDates";

const fmt = (n: number) => n.toLocaleString("ko-KR");
const pct = (RAISE_2027_BUDGET * 100).toFixed(1);
const pctMin = (RAISE_2027_RECOMMENDED.min * 100).toFixed(1);
const pctMax = (RAISE_2027_RECOMMENDED.max * 100).toFixed(1);

// 12월 말 확정표 입력 전까지 null — 값이 들어오면 아래 문구·비교표·일정·FAQ·Dataset·맨 끝 전체표가 확정 체제로
const CONFIRMED = PAY_FULL_2027;
/** 확정 인상률(%) — 확정 전에는 빈 문자열(확정 문구에서만 쓴다) */
const finalPct = CONFIRMED ? ratePct(CONFIRMED.commonRate) : "";
const RANGE = CONFIRMED ? policeFireRaiseRange(CONFIRMED) : null;
// 확정 뒤 맨 끝 전체표 — 하위 5계급(순경~경감)·상위 5계급(경정~치안정감) 두 표
const POLICE_LABELS = POLICE_FIRE_RANKS_FULL.map((r) => r.police);
const FULL_2027_LOWER = CONFIRMED ? pickPayColumns(CONFIRMED.policeFire, 0, 5) : [];
const FULL_2027_UPPER = CONFIRMED ? pickPayColumns(CONFIRMED.policeFire, 5, 10) : [];

const ROWS = policeFireForecastRows("police", CONFIRMED);
// 순경 1호봉(신임) — 메타·리드·FAQ 공용
const ENTRY = ROWS[0];
const rowOf = (label: string) => {
  const row = ROWS.find((r) => r.label === label);
  if (!row) throw new Error(`[police-pay-2027] 대표 행 '${label}' 이 없습니다`);
  return row;
};
const SERGEANT = rowOf("경사 10호봉");
const LIEUTENANT = rowOf("경위 15호봉");

// 대표 행 마지막(경정 25호봉) — 확정 본문
const LAST = ROWS[ROWS.length - 1];

const PUBLISHED = PAY_TABLES_RELEASE_DATE;
const MODIFIED = PAY_2027_PAGES_MODIFIED;
const PAGE_TITLE = CONFIRMED
  ? `2027 경찰 봉급표 확정 — 인상률 ${finalPct}%·계급별 월급`
  : `2027 경찰 봉급표 예상 — 예산안 ${pct}%·계급별 월급`;
const PAGE_DESCRIPTION = CONFIRMED
  ? `2027년 경찰 봉급표가 확정됐습니다(공무원 보수 인상률 ${finalPct}%). 순경 1호봉 월 ${fmt(ENTRY.pay2027)}원부터 순경~치안정감 전 호봉 월급과 2026년 대비 인상액을 정리했습니다.`
  : `2027년 경찰 봉급 인상률은 정부 예산안 ${pct}%로 국회 심의 중(확정 전)입니다. 2026년 봉급표에 적용한 순경 1호봉 약 ${fmt(ENTRY.pay2027)}원부터 경정까지 계급별 예상 월급과 확정 일정을 정리했습니다.`;

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/police-pay-2027",
  ogType: "article",
  publishedTime: PUBLISHED,
  modifiedTime: MODIFIED,
  // ⚠ 연도 없는 '경찰 봉급표' 단독 키워드 금지 — 2026 확정표 페이지 잠식 방지
  keywords: [
    "2027 경찰 봉급표",
    "2027년 경찰 봉급표",
    "경찰 봉급표 2027",
    "2027 경찰공무원 봉급표",
    "2027 순경 월급",
    "내년 경찰 월급",
    "2027 경찰 인상률",
  ],
});

// Dataset(확정 뒤) 키워드
const KEYWORDS_DATASET = ["2027 경찰 봉급표", "2027 경찰공무원 봉급표", "경찰 봉급표 2027", "2027 순경 월급"];

const FAQ_FORECAST = [
  {
    question: "2027년 경찰 봉급은 몇 % 오르고, 확정됐나요?",
    answer: `2026년 9월 1일 국무회의에서 심의된 2027년도 정부 예산안에 공무원 보수 ${pct}% 인상이 반영됐다고 보도됐습니다(기획예산처 설명). 경찰공무원도 이 인상을 적용받지만 아직 정부안 단계입니다. 국회 예산 심의 후 연말 공무원보수규정 별표 10(경찰·소방 봉급표)이 개정돼야 계급·호봉별 금액이 확정됩니다.`,
  },
  {
    question: "2027년 순경 1호봉 월급은 얼마로 예상되나요?",
    answer: `2026년 순경 1호봉 월 봉급 ${fmt(ENTRY.base2026)}원에 ${pct}%를 단순 적용하면 약 ${fmt(ENTRY.pay2027)}원으로 월 ${fmt(ENTRY.monthlyIncrease)}원가량 늘어납니다(천원 단위 반올림, 확정 봉급표 아님). 순경 1호봉은 2025·2026년 모두 일반직 9급 1호봉과 같은 금액이었고 2026년에는 둘 다 6.6% 올랐습니다. 정부가 9급 초임 보수(봉급+수당)를 월 300만원 수준으로 올린다고 설명한 만큼 저연차 조정이 더해질 수 있지만, 확정 금액은 연말 봉급표로 확인해야 합니다.`,
  },
  {
    question: "위험근무수당·112 출동수당도 3.9% 오르나요?",
    answer: `아닙니다. 위험근무수당(2026년 월 ${fmt(HAZARD_ALLOWANCE_2026)}원)과 112 신고 출동수당(일 상한 4만원)은 공무원수당규정에서 금액·상한을 따로 정하는 수당이라 봉급 인상률이 자동으로 붙지 않습니다. 2026년에도 봉급 인상과 별도로 위험근무수당이 월 7만원에서 8만원으로, 112 출동수당 일 상한이 3만원에서 4만원으로 올랐고 인파 사고 담당 경찰의 특수업무수당(월 8만원)이 신설됐습니다(인사혁신처). 명절휴가비·정근수당처럼 월봉급에 비례하는 수당만 봉급과 함께 늘어납니다.`,
  },
  {
    question: "경사·경위가 되면 2027년에는 얼마를 받나요?",
    answer: `같은 방식으로 계산하면 경사 10호봉은 2026년 ${fmt(SERGEANT.base2026)}원에서 2027년 약 ${fmt(SERGEANT.pay2027)}원, 경위 15호봉은 ${fmt(LIEUTENANT.base2026)}원에서 약 ${fmt(LIEUTENANT.pay2027)}원이 됩니다(예상). 승진 시점과 호봉은 사람마다 다르므로 본인 계급·호봉의 2026년 금액은 2026 경찰 봉급표 전체표에서 찾아 ${pct}%를 곱해 보면 됩니다.`,
  },
  {
    question: "2027 경찰 봉급표는 언제 확정되고, 소방과 같나요?",
    answer:
      "경찰·소방 봉급은 공무원보수규정 별표 10 한 표에 함께 실려 순경=소방사, 경장=소방교처럼 계급별 금액이 같습니다. 2026년 표는 2025년 12월 30일 국무회의를 통과해 2026년 1월 1일부터 적용됐습니다(인사혁신처 보도자료). 2027년 표도 국회 예산 의결 뒤 연말 개정·공표 자료로 확인해야 하며, 그 전까지 이 페이지 금액은 예상치입니다.",
  },
];

// 확정 FAQ — 모든 수치는 PAY_FULL_2027(원문)과 2026 원문에서 계산한다(추정 문구 없음)
const FAQ_CONFIRMED =
  CONFIRMED && RANGE
    ? [
        {
          question: "2027년 경찰 봉급은 몇 % 올랐고, 확정됐나요?",
          answer: `확정됐습니다. 공무원보수규정 별표 10(경찰·소방 봉급표)이 2027년 금액으로 개정·공표됐고(${CONFIRMED.basis}), 공무원 보수 인상률은 ${finalPct}%입니다(인사혁신처). 2026년 표와 계급·호봉별로 비교한 인상률은 ${RANGE.text}이니, 본인 계급·호봉 금액은 이 페이지 맨 아래 전체표에서 확인하세요.`,
        },
        {
          question: "2027년 순경 1호봉 월급은 얼마인가요?",
          answer: `2027년 순경 1호봉 월 봉급은 ${fmt(ENTRY.pay2027)}원으로 2026년 ${fmt(ENTRY.base2026)}원보다 ${fmt(ENTRY.monthlyIncrease)}원(${raisePct(ENTRY.base2026, ENTRY.pay2027)}%) 올랐습니다(인사혁신처 2027 봉급표). 위험근무수당·초과근무수당 등 수당은 봉급과 별도입니다.`,
        },
        {
          question: "위험근무수당·112 출동수당도 봉급만큼 오르나요?",
          answer: `봉급처럼 자동으로 오르지는 않습니다. 위험근무수당(2026년 월 ${fmt(HAZARD_ALLOWANCE_2026)}원)과 112 신고 출동수당(2026년 일 상한 4만원)은 공무원수당규정에서 금액·상한을 따로 정하므로, 바뀌면 수당규정 개정으로 발표됩니다. 명절휴가비·정근수당처럼 월봉급에 비례하는 수당만 봉급과 함께 늘어납니다.`,
        },
        {
          question: "경사·경위는 2027년에 얼마를 받나요?",
          answer: `2027년 확정 봉급표 기준으로 경사 10호봉은 2026년 ${fmt(SERGEANT.base2026)}원에서 ${fmt(SERGEANT.pay2027)}원, 경위 15호봉은 ${fmt(LIEUTENANT.base2026)}원에서 ${fmt(LIEUTENANT.pay2027)}원이 됐습니다. 승진 시점과 호봉은 사람마다 다르니 본인 계급·호봉 금액은 맨 아래 전체표에서 찾아보세요.`,
        },
      ]
    : null;

const FAQ_ITEMS = FAQ_CONFIRMED ?? FAQ_FORECAST;

const SCHEDULE = [
  {
    step: "1",
    title: "공무원보수위원회 권고 — 완료",
    desc: `2026년 7월 23일 2027년 보수 인상률 ${pctMin}~${pctMax}% 권고. 정부·노동계 위원이 합의한 권고입니다.`,
    done: true,
  },
  {
    step: "2",
    title: `정부 예산안 ${pct}% — 9월 1일 국무회의`,
    desc: `2027년도 예산안에 공무원 보수 ${pct}% 인상 반영(보도, 2011년 5.1% 이후 최대). 경찰 계급·호봉별 금액은 이 단계에서 정해지지 않습니다.`,
    done: true,
  },
  CONFIRMED
    ? {
        step: "3",
        title: "국회 예산 심의 — 완료",
        desc: `국회 예산 의결을 거쳐 2027년 공무원 보수 인상률이 ${finalPct}%로 정해졌습니다(인사혁신처).`,
        done: true,
      }
    : {
        step: "3",
        title: "국회 예산 심의 — 법정 기한 12월 2일 (진행 중)",
        desc: `심의 과정에서 조정될 수 있어, 예산 의결 전까지 ${pct}%는 확정 수치가 아닙니다.`,
        done: false,
      },
  CONFIRMED
    ? {
        step: "4",
        title: "별표 10 개정·2027 경찰·소방 봉급표 공표 — 완료",
        desc: `계급×호봉 금액이 확정됐습니다(${CONFIRMED.basis}). 순경~치안정감 전 호봉은 이 페이지 맨 아래 전체표에 있습니다.`,
        done: true,
      }
    : {
        step: "4",
        title: "별표 10 개정·2027 경찰·소방 봉급표 공표 — 연말",
        desc: "계급×호봉 금액이 확정되는 단계입니다. 2026년 표는 2025년 12월 30일 국무회의 통과 후 1월 1일부터 적용됐습니다.",
        done: false,
      },
];

// 2026년 경찰 봉급표 계급별 인상률 (2025 → 2026, 인사혁신처 봉급표 원문 비교 — 테스트가 앵커로 재계산)
const RAISE_2026_BY_RANK = [
  { rank: "순경 1~7호봉", rate: "3.7~6.6%" },
  { rank: "경장 1~5호봉", rate: "4.0~6.6%" },
  { rank: "경사 1~4호봉", rate: "4.0~6.6%" },
  { rank: "경위 1~2호봉", rate: "5.3~6.6%" },
  { rank: "그 밖의 호봉·경감 이상", rate: "3.5%" },
];

export default function PolicePay2027Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "2027 경찰 봉급표", path: "/police-pay-2027" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            slug: "police-pay-2027",
            url: "/police-pay-2027",
            publishedDate: PUBLISHED,
            modifiedDate: MODIFIED,
          }),
          // datasetLd 는 12월 말 확정표 입력 뒤에만 (예상치는 데이터셋 부적합)
          ...(CONFIRMED
            ? [
                datasetLd({
                  name: "2027년 경찰공무원 봉급표 데이터 (순경~치안정감 전 호봉)",
                  description:
                    "공무원보수규정 별표 10 기준 2027년 경찰공무원 계급별(순경~치안정감)·호봉별 전체 월 봉급액 데이터셋(인사혁신처 2027 봉급표 원문).",
                  url: "/police-pay-2027",
                  datePublished: CONFIRMED.checked,
                  dateModified: CONFIRMED.checked,
                  keywords: KEYWORDS_DATASET,
                  citation: { name: "인사혁신처 2027년 공무원 봉급표", url: CONFIRMED.sourceUrl },
                  temporalCoverage: "2027",
                }),
              ]
            : []),
          speakableLd({ url: "/police-pay-2027", cssSelectors: [".faq-answer"] }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            {CONFIRMED ? `인상률 ${finalPct}% · 2027 봉급표 확정` : `예산안 ${pct}% · 국회 심의 중 · 확정 전`}
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2027 경찰 봉급표 <span className="text-electric">{CONFIRMED ? "확정" : "예상 월급"}</span>
          </h1>
          <PublishedMeta publishedDate={PUBLISHED} updatedDate={MODIFIED} className="mb-2" />
          {CONFIRMED ? (
            <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
              <strong>2027년 경찰 봉급표가 확정됐습니다(공무원 보수 인상률 {finalPct}%).</strong> 순경 1호봉은 월{" "}
              {fmt(ENTRY.pay2027)}원으로 2026년보다 {fmt(ENTRY.monthlyIncrease)}원 올랐습니다.
            </p>
          ) : (
            <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
              <strong>2027년 경찰 봉급 인상률은 정부 예산안 기준 {pct}%</strong>로, 국회 심의 중인 확정 전
              수치입니다. 2026년 봉급표에 적용하면 순경 1호봉은 약 {fmt(ENTRY.pay2027)}원(단순
              예상치)입니다.
            </p>
          )}
          {CONFIRMED ? (
            <p className="mt-6 inline-flex items-start gap-2 text-xs text-muted-blue px-4 py-2 bg-white rounded-xl border border-canvas-200 max-w-xl text-left">
              <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                인사혁신처가 공표한 <strong>2027년 경찰·소방 봉급표(별표 10)</strong> 기준입니다({CONFIRMED.basis}).
                출처:{" "}
                <a href={CONFIRMED.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
                  인사혁신처 2027년 봉급표
                </a>
                {" · "}확인일 {CONFIRMED.checked}
              </span>
            </p>
          ) : (
            <p className="mt-6 inline-flex items-start gap-2 text-xs text-amber-800 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 max-w-xl text-left">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                확정 봉급표가 아닌 <strong>예산안 {pct}% 단순 적용 예상치</strong>입니다(저연차 추가 인상·국회 조정
                미반영). 기준:{" "}
                <a
                  href="https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  인사혁신처 2026년 봉급표
                </a>
                {" · "}근거:{" "}
                <a
                  href="https://www.yna.co.kr/view/AKR20260831140300002"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  9월 1일 예산안 보도
                </a>
                {" · "}확인일 2026-09-25
              </span>
            </p>
          )}
        </div>

        <HomeTopAd />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
          <div className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">
            {/* 대표 지점 예상표 — 전체 계급×호봉표 아님 */}
            <section className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-electric" />
                2026 → 2027 경찰 월 봉급 비교 (계급별 예시, {CONFIRMED ? "확정" : "예상"})
              </h2>
              {CONFIRMED ? (
                <p className="text-xs text-faint-blue mb-5">
                  2027 확정 = 인사혁신처 2027 봉급표 금액 · 월 차이 = 2027 확정 − 2026 확정 · 수당 미포함
                </p>
              ) : (
                <p className="text-xs text-amber-700 mb-5">
                  ⚠ 2027 예상 = 2026 확정 봉급 × (1 + {pct}%), 천원 단위 반올림 — 확정 봉급표 아님 · 저연차 추가
                  인상·국회 심의 조정·수당 미반영
                </p>
              )}
              <PayForecastTable
                caption="경찰공무원 월 봉급(기본급), 단위: 원. 신임부터 승진 경로를 가정한 예시 지점이며 실제 승진 시점·호봉은 개인마다 다릅니다."
                rows={ROWS}
                firstColumn="계급·호봉"
                regionLabel={CONFIRMED ? "2027 경찰 봉급 비교표 (가로 스크롤)" : "2027 경찰 봉급 예상표 (가로 스크롤)"}
                confirmed={CONFIRMED !== null}
              />
              <p className="text-xs text-faint-blue leading-6 mt-4">
                {CONFIRMED ? "※ 2027년 순경~치안정감 전 호봉은" : "※ 순경~치안정감 전 호봉 확정 금액은"}{" "}
                <Link
                  href={CONFIRMED ? "/police-pay-2027#police-full-table" : "/police-pay-2026#police-full-table"}
                  className="text-electric font-bold hover:underline"
                >
                  {CONFIRMED ? "이 페이지 맨 아래 전체표" : "2026 경찰 봉급표 전체"}
                </Link>
                에 있습니다. 같은 표를 쓰는 소방은{" "}
                <Link href="/firefighter-pay-2027" className="text-electric font-bold hover:underline">
                  {CONFIRMED ? "2027 소방공무원 봉급표" : "2027 소방공무원 봉급표 예상"}
                </Link>
                , 일반직은{" "}
                <Link href="/civil-servant-pay-2027" className="text-electric font-bold hover:underline">
                  {CONFIRMED ? "2027 공무원 봉급표" : "2027 공무원 봉급표 예상"}
                </Link>
                에서 볼 수 있습니다.
              </p>
            </section>

            <CalcResultAd />

            {/* 확정 일정 · 2026 계급별 인상률 · 수당 */}
            <section className="mt-10 mb-12">
              <h2 className="text-lg font-black text-navy mb-4">
                {CONFIRMED ? "2027 경찰 봉급 확정 — 4단계 경과" : "2027 경찰 봉급 확정까지 — 4단계 일정"}
              </h2>
              <ol className="space-y-3">
                {SCHEDULE.map((item) => (
                  <li key={item.step} className="flex gap-4 p-4 bg-white rounded-2xl border border-canvas-200">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        item.done ? "bg-electric text-white" : "bg-canvas-100 text-faint-blue"
                      }`}
                    >
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-black text-navy">{item.title}</p>
                      <p className="text-sm text-muted-blue leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <h2 className="text-lg font-black text-navy mt-10 mb-3">
                참고: 2026년에는 하위 계급 낮은 호봉이 더 올랐다
              </h2>
              <p className="text-sm leading-7 text-muted-blue">
                2026년 공통 인상률은 3.5%였지만 경찰 봉급표에서는 순경·경장·경사·경위의 낮은 호봉이 더 많이
                올랐습니다(각 계급 1호봉 6.6%). 인사혁신처 2025년·2026년 봉급표를 계급·호봉별로 비교한 결과입니다.
              </p>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RAISE_2026_BY_RANK.map((item) => (
                  <li
                    key={item.rank}
                    className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-canvas-200"
                  >
                    <span className="text-sm font-bold text-navy">{item.rank}</span>
                    <span className="text-sm font-black text-electric tabular-nums">+{item.rate}</span>
                  </li>
                ))}
              </ul>
              {CONFIRMED && RANGE ? (
                <p className="text-sm leading-7 text-muted-blue mt-4">
                  2027년 확정표를 같은 방법으로 2026년 표와 비교하면 계급·호봉별 인상률은 {RANGE.text}입니다.{" "}
                  {ENTRY.label}은 {raisePct(ENTRY.base2026, ENTRY.pay2027)}%, {LAST.label}은{" "}
                  {raisePct(LAST.base2026, LAST.pay2027)}% 올랐습니다. 본인 계급·호봉 금액은 맨 아래 전체표에서 확인하세요.
                </p>
              ) : (
                <p className="text-sm leading-7 text-muted-blue mt-4">
                  위 예상표는 모든 계급·호봉에 {pct}%를 같은 비율로 적용했습니다. 2027년에도 저연차 조정이
                  있으면 순경·경장 낮은 호봉의 확정액은 예상보다 클 수 있습니다. 2026년에는 경감 이상 전 호봉이
                  공통 인상률 3.5% 그대로 올랐습니다. 연말 공표 전까지는 참고용으로만 보세요.
                </p>
              )}

              <h2 className="text-lg font-black text-navy mt-10 mb-3">경찰 수당은 {CONFIRMED ? finalPct : pct}%와 따로 정해진다</h2>
              <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
                <li>
                  <strong>위험근무수당</strong> — 2026년 월 {fmt(HAZARD_ALLOWANCE_2026)}원(7만원에서 인상). 수당규정에
                  금액이 정해져 있어 봉급 인상률이 자동으로 붙지 않습니다.
                </li>
                <li>
                  <strong>112 신고 출동수당</strong> — 2026년 일 상한 3만원 → 4만원. 인파 사고를 직접 담당하는
                  경찰에게는 특수업무수당 월 8만원이 2026년 신설됐습니다.
                </li>
                <li>
                  <strong>봉급 연동 수당</strong> — 명절휴가비(설·추석 각 월봉급의 60%)·정근수당(월봉급의 0~50%)은
                  봉급이 오르면 함께 늘어납니다.
                </li>
              </ul>
              <p className="text-sm leading-7 text-muted-blue mt-4">
                지구대·파출소처럼 교대·야간 근무가 많은 곳은 초과근무수당이 실수령을 크게 좌우합니다. 2027년 수당
                금액은 공무원수당규정 개정 발표로 확인하고, 그 전까지는 2026년 금액을 기준으로 보세요.
              </p>
            </section>

            <InArticleAd />

            {/* CTA */}
            <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/police-pay-2026#police-full-table"
                className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
              >
                <FileText className="w-8 h-8 opacity-70 mb-3" />
                <h3 className="text-lg font-black mb-2">2026 경찰 봉급표 전체</h3>
                <p className="text-sm opacity-90">{CONFIRMED ? "2026년 전 호봉 금액과 비교" : "순경~치안정감 확정 금액"}</p>
              </Link>
              <Link
                href="/civil-servant-pay-2027"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <Calculator className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">{CONFIRMED ? "2027 공무원 봉급표" : "2027 공무원 봉급표 예상"}</h3>
                <p className="text-sm text-muted-blue">{CONFIRMED ? "일반직 9급~1급 봉급" : "일반직 9~5급 예상 월급"}</p>
              </Link>
              <Link
                href="/job/police-officer"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">경찰공무원 연봉 정보</h3>
                <p className="text-sm text-muted-blue">계급·연차별 연봉 흐름</p>
              </Link>
            </section>

            <GuideMidAd />

            {/* FAQ */}
            <section className="mt-10 mb-12">
              <h2 className="text-xl font-black text-navy mb-6">2027 경찰 봉급 자주 묻는 질문</h2>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.question} className="group p-5 bg-white rounded-2xl border border-canvas-200">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
                      {item.question}
                      <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />

            <RelatedCalculators currentPath="/police-pay-2027" />

            <div className="mt-8">
              <ShareButtons
                title={
                  CONFIRMED
                    ? `2027 경찰 봉급표 확정 — 인상률 ${finalPct}% 계급별 월급`
                    : `2027 경찰 봉급표 예상 — 예산안 ${pct}% 적용 계급별 월급`
                }
                description={
                  CONFIRMED
                    ? `순경 1호봉 월 ${fmt(ENTRY.pay2027)}원(2026년 대비 +${fmt(ENTRY.monthlyIncrease)}원). 인사혁신처 2027 봉급표 기준입니다.`
                    : `순경 1호봉 약 ${fmt(ENTRY.pay2027)}원(예상). 확정 전 단순 계산이며 수당·저연차 추가 인상은 미반영입니다.`
                }
              />
            </div>
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start" aria-label="추천·광고">
            <SidebarAd />
            <CoupangBanner size="skyscraper" showDisclosure={false} />
          </aside>
        </div>

        {/* 2027 확정 전체표 — 12월 말 PAY_FULL_2027 입력 뒤에만. 모든 광고(사이드바 포함)·공유 버튼 아래 페이지 맨 끝 */}
        {CONFIRMED && (
          <section
            id="police-full-table"
            aria-labelledby="police-full-table-title"
            className="scroll-mt-24 mt-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200"
          >
            <h2 id="police-full-table-title" className="text-xl font-black text-navy mb-2">
              2027 경찰공무원 봉급표 전체 (순경~치안정감, 전 호봉)
            </h2>
            <p className="text-xs text-faint-blue leading-6 mb-5">
              단위: 원(월 봉급액) · 출처:{" "}
              <a
                href={CONFIRMED.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric font-bold hover:underline"
              >
                인사혁신처 2027년 공무원 봉급표
              </a>
              (공무원보수규정 별표 10, 경찰·소방 통합표) · 확인일 {CONFIRMED.checked} · &lsquo;–&rsquo;는 해당
              계급에 없는 호봉
            </p>
            <div className="space-y-8">
              <PayStepTable
                caption="순경~경감 (1~32호봉)"
                columns={POLICE_LABELS.slice(0, 5)}
                rows={FULL_2027_LOWER}
                regionLabel="2027 경찰 봉급표 순경~경감 전체 (가로 스크롤)"
                minWidthClass="min-w-[520px]"
              />
              <PayStepTable
                caption="경정~치안정감 (1~30호봉)"
                columns={POLICE_LABELS.slice(5, 10)}
                rows={FULL_2027_UPPER}
                regionLabel="2027 경찰 봉급표 경정~치안정감 전체 (가로 스크롤)"
                minWidthClass="min-w-[520px]"
              />
            </div>
            <p className="text-xs text-faint-blue leading-6 mt-4">
              ※ 봉급표 금액은 위험근무수당·초과근무수당 등 수당을 뺀 기본급입니다. 2026년 금액은{" "}
              <Link href="/police-pay-2026#police-full-table" className="text-electric font-bold hover:underline">
                2026 경찰공무원 봉급표 전체
              </Link>
              에서 비교할 수 있습니다.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
