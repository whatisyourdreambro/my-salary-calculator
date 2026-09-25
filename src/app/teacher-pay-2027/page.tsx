// src/app/teacher-pay-2027/page.tsx
// 2027 교사 봉급표 예상 — 예산안(9/1)~확정(12월 말) 사이 '2027 교사 봉급표' 검색 선점 (수익 추천 #3, 2026-09-25 준비).
//
// 모델: /civil-servant-pay-2027 — 예산안 3.9% 는 '예상·국회 심의 중·확정 전'으로만 쓰고 출처를 단다,
//   forecast2027 헬퍼, FAQ·JSON-LD(datasetLd 는 확정표 뒤에만)·PublishedMeta.
// 광고: /teacher-pay-2026 배치 1:1 복제 — HomeTop → (그리드) CalcResult → InArticle → GuideMid → 쿠팡 →
//   사이드바 Sidebar·쿠팡 (추천 #3 '기존 광고 배치 복제' 승인 대상, 새 위치·새 유닛 없음).
// ★ 2027 전체 '예상' 호봉표는 싣지 않는다 — 저연차 추가 인상·국회 조정 전이라 오정보. 대표 호봉 예상치만(payForecast2027.ts).
// ★ 중복 제목 방지(네이버): 2026 페이지의 연도만 바꾼 문구 금지 — 일정·2026 대비 차액·수당 문단을 새로 쓴다.
// ★ 12월 말 확정 = 숫자만 교체 (11/1~1/31 동결기에 새 구조를 만들지 않게 10월에 자리를 미리 둠):
//   payTablesFull2027.ts 의 PAY_FULL_2027 에 인사혁신처 2027 봉급표 원문 숫자·근거·확인일을 넣으면 이 페이지의
//   title·description·배지·H1 강조어·리드·출처 박스·비교표(2026 확정 → 2027 확정)·일정·FAQ·공유 문구가 확정 문구로
//   바뀌고, Dataset JSON-LD 와 1~40호봉 전체표(#teacher-full-table, 마지막 광고·공유 버튼 아래)가 나온다.
//   광고 컴포넌트 위치·순서는 같고, 광고 위 문구는 확정 쪽이 더 짧다(pay2027ConfirmedSlot.test.ts).
//   수정일·sitemap lastModified 는 PAY_FULL_2027.checked 로 자동 갱신 — 이 파일은 고치지 않는다.
// 사실관계 출처(2026-09-25 확인):
//   - 2026 교원 봉급: 인사혁신처 2026 봉급표(mpm.go.kr, 원문 파싱 → payTablesFull2026.ts)
//   - 2026 호봉별 인상률: 인사혁신처 2025·2026 봉급표 비교(1~8호봉 6.6%, 9호봉 5.5%, 10~11호봉 5.4%,
//     12호봉 5.3%, 13호봉 이상 3.5% — payForecast2027.test.ts 가 2025 원문 앵커로 재계산)
//   - 2027 예산안 3.9%·9급 초임 보수 월 300만원 수준: 연합뉴스 2026-09-01(기획예산처 설명)
//   - 보수위 권고 3.4~3.9%(2026-07-23), 2026 표 2025-12-30 국무회의 통과·2026-01-01 적용: 인사혁신처 보도자료
//   - 담임수당 20만·보직교사수당 15만·정액급식비 16만·명절휴가비 60%·정근수당 0~50%: 기존 teacher-pay-2026·
//     civil-servant-pay-2026 표기(법제처 공무원수당규정, 인사혁신처 보도자료)와 같은 값

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Calendar, Calculator, FileText, ArrowRight, GraduationCap, AlertTriangle } from "lucide-react";
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
import { RAISE_2027_BUDGET, RAISE_2027_RECOMMENDED, TEACHER_ALLOWANCE_2026 } from "@/lib/civilServantPay";
import { teacherForecastRows } from "@/lib/payForecast2027";
import { PAY_FULL_2027, PAY_2027_PAGES_MODIFIED, raisePct, ratePct, teacherRaiseRange } from "@/lib/payTablesFull2027";
import { PAY_TABLES_RELEASE_DATE } from "@/config/siteDates";

const fmt = (n: number) => n.toLocaleString("ko-KR");
const pct = ratePct(RAISE_2027_BUDGET);
const pctMin = ratePct(RAISE_2027_RECOMMENDED.min);
const pctMax = ratePct(RAISE_2027_RECOMMENDED.max);

// 12월 말 확정표 입력 전까지 null — 값이 들어오면 아래 문구·비교표·일정·FAQ·Dataset·맨 끝 전체표가 확정 체제로
const CONFIRMED = PAY_FULL_2027;
/** 확정 인상률(%) — 확정 전에는 빈 문자열(확정 문구에서만 쓴다) */
const finalPct = CONFIRMED ? ratePct(CONFIRMED.commonRate) : "";
const RANGE = CONFIRMED ? teacherRaiseRange(CONFIRMED) : null;

const ROWS = teacherForecastRows(CONFIRMED);
// 신규 교사 통상 시작(9호봉) — 메타·리드·FAQ 공용
const START = ROWS[0];
// 최고 호봉(40호봉) — 확정 FAQ·본문
const TOP = ROWS[ROWS.length - 1];
// 명절휴가비(설·추석 각 월봉급의 60%) 1회분 — 봉급 연동 수당 예시
const holidayBonus = (monthly: number) => Math.round(monthly * 0.6);

const PUBLISHED = PAY_TABLES_RELEASE_DATE;
const MODIFIED = PAY_2027_PAGES_MODIFIED;
const PAGE_TITLE = CONFIRMED
  ? `2027 교사 봉급표 확정 — 인상률 ${finalPct}%·교원 호봉별 월급`
  : `2027 교사 봉급표 예상 — 예산안 ${pct}%·교원 호봉별 월급`;
const PAGE_DESCRIPTION = CONFIRMED
  ? `2027년 교원 봉급표가 확정됐습니다(공무원 보수 인상률 ${finalPct}%). 신규 교사 ${START.label} 월 ${fmt(START.pay2027)}원 등 1~40호봉 전체 월급과 2026년 대비 인상액을 정리했습니다.`
  : `2027년 교사 봉급 인상률은 정부 예산안 ${pct}%로 국회 심의 중(확정 전)입니다. 2026년 교원 봉급표에 적용한 ${START.label} 약 ${fmt(START.pay2027)}원 등 주요 호봉 예상 월급과 확정 일정을 정리했습니다.`;

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/teacher-pay-2027",
  ogType: "article",
  publishedTime: PUBLISHED,
  modifiedTime: MODIFIED,
  // ⚠ 연도 없는 '교사 호봉표' 단독 키워드 금지 — 2026 확정표 페이지 잠식 방지
  keywords: [
    "2027 교사 봉급표",
    "2027년 교사 봉급표",
    "2027 교원 봉급표",
    "교사 호봉표 2027",
    "2027 교사 호봉표",
    "2027 교사 월급",
    "내년 교사 월급",
    "2027 교사 인상률",
  ],
});

const FAQ_FORECAST = [
  {
    question: "2027년 교사 봉급은 몇 % 오르고, 확정됐나요?",
    answer: `2026년 9월 1일 국무회의에서 심의된 2027년도 정부 예산안에 공무원 보수 ${pct}% 인상이 반영됐다고 보도됐습니다(기획예산처 설명). 교원도 공무원 보수 인상을 적용받지만 아직 확정되지 않았습니다. 국회 예산 심의를 거쳐 연말 공무원보수규정(별표 11 교원 봉급표)이 개정돼야 호봉별 금액이 정해집니다.`,
  },
  {
    question: "신규 교사(9호봉) 2027년 월급은 얼마로 예상되나요?",
    answer: `2026년 9호봉 월 봉급 ${fmt(START.base2026)}원에 ${pct}%를 단순 적용하면 약 ${fmt(START.pay2027)}원으로 월 ${fmt(START.monthlyIncrease)}원가량 늘어납니다(천원 단위 반올림, 확정 봉급표 아님). 2026년에는 공통 인상률 3.5%와 별도로 저연차 구간이 더 올라 9호봉이 5.5% 인상됐으므로, 2027년에도 저연차 조정이 있으면 실제 금액은 이보다 클 수 있습니다. 담임수당·정액급식비 등 수당은 봉급과 별도입니다.`,
  },
  {
    question: "담임수당 같은 교원 수당도 3.9% 오르나요?",
    answer: `아닙니다. 담임수당(월 ${fmt(TEACHER_ALLOWANCE_2026.homeroom)}원)·보직교사수당(월 ${fmt(TEACHER_ALLOWANCE_2026.headTeacher)}원)·정액급식비(월 160,000원) 같은 정액 수당은 공무원수당규정에 금액이 정해져 있어 봉급 인상률이 자동으로 붙지 않습니다(금액은 2026년 기준). 반면 명절휴가비(설·추석 각 월봉급의 60%)와 정근수당(근무연수에 따라 월봉급의 0~50%)은 봉급에 비례하므로 봉급이 오르면 함께 늘어납니다.`,
  },
  {
    question: "2027년 교원 봉급표는 언제 확정되나요?",
    answer:
      "교원 봉급표는 공무원보수규정 별표 11이라 일반직 봉급표와 같은 개정 절차로 바뀝니다. 2026년 봉급표는 2025년 12월 30일 국무회의를 통과해 2026년 1월 1일부터 적용됐습니다(인사혁신처 보도자료). 2027년 표도 국회 예산 의결 뒤 연말 개정·공표 자료로 확인해야 하며, 그 전까지 이 페이지의 금액은 예상치로만 보세요.",
  },
  {
    question: "이 예상 금액은 실제 봉급표와 얼마나 다를 수 있나요?",
    answer: `이 페이지는 2026년 확정 봉급에 예산안 인상률 ${pct}%를 모든 호봉에 똑같이 적용한 단순 계산입니다. 실제 인상률은 호봉마다 다를 수 있습니다. 2026년 교원 봉급표는 공통 인상률이 3.5%였지만 1~8호봉 6.6%, 9호봉 5.5%, 10~11호봉 5.4%, 12호봉 5.3%, 13호봉 이상 3.5% 올랐습니다(인사혁신처 2025·2026 봉급표 비교). 국회 심의에서 인상률이 조정될 수도 있습니다.`,
  },
];

// 확정 FAQ — 모든 수치는 PAY_FULL_2027(원문)과 2026 원문에서 계산한다(추정 문구 없음)
const FAQ_CONFIRMED =
  CONFIRMED && RANGE
    ? [
        {
          question: "2027년 교사 봉급은 몇 % 올랐고, 확정됐나요?",
          answer: `확정됐습니다. 2027년 교원 봉급표(공무원보수규정 별표 11)가 공표됐고(${CONFIRMED.basis}), 공무원 보수 인상률은 ${finalPct}%입니다(인사혁신처). 2026년 표와 호봉별로 비교한 인상률은 ${RANGE.text}이니, 본인 호봉 금액은 이 페이지 맨 아래 1~40호봉 전체표에서 확인하세요.`,
        },
        {
          question: "신규 교사(9호봉) 2027년 월급은 얼마인가요?",
          answer: `2027년 9호봉 월 봉급은 ${fmt(START.pay2027)}원으로 2026년 ${fmt(START.base2026)}원보다 ${fmt(START.monthlyIncrease)}원(${raisePct(START.base2026, START.pay2027)}%) 올랐습니다(인사혁신처 2027 봉급표). 담임수당·정액급식비 등 수당은 봉급과 별도입니다.`,
        },
        {
          question: "담임수당 같은 교원 수당도 봉급만큼 오르나요?",
          answer: `정액 수당은 봉급 인상률이 자동으로 붙지 않습니다. 담임수당(2026년 월 ${fmt(TEACHER_ALLOWANCE_2026.homeroom)}원)·보직교사수당(월 ${fmt(TEACHER_ALLOWANCE_2026.headTeacher)}원)·정액급식비(월 160,000원)는 공무원수당규정에 금액이 정해져 있어 바뀌면 수당규정 개정으로 따로 발표됩니다. 명절휴가비(설·추석 각 월봉급의 60%)와 정근수당(월봉급의 0~50%)은 봉급에 비례해 함께 늘어납니다.`,
        },
        {
          question: "최고 호봉(40호봉)은 2027년에 얼마인가요?",
          answer: `40호봉 월 봉급은 2026년 ${fmt(TOP.base2026)}원에서 2027년 ${fmt(TOP.pay2027)}원으로 ${fmt(TOP.monthlyIncrease)}원(${raisePct(TOP.base2026, TOP.pay2027)}%) 올랐습니다. 다른 호봉 금액은 맨 아래 전체표에서, 2026년 금액은 2026 교원 봉급표 전체에서 비교할 수 있습니다.`,
        },
      ]
    : null;

const FAQ_ITEMS = FAQ_CONFIRMED ?? FAQ_FORECAST;

const SCHEDULE = [
  {
    step: "1",
    title: "공무원보수위원회 권고 — 완료",
    desc: `2026년 7월 23일 전체회의에서 2027년 보수 인상률 ${pctMin}~${pctMax}%를 권고했습니다. 정부·노동계 위원이 합의한 권고입니다.`,
    done: true,
  },
  {
    step: "2",
    title: `정부 예산안 ${pct}% — 9월 1일 국무회의`,
    desc: CONFIRMED
      ? `기획예산처가 2027년도 예산안에 공무원 보수 ${pct}% 인상을 반영했다고 보도됐습니다(2011년 5.1% 이후 최대).`
      : `기획예산처가 2027년도 예산안에 공무원 보수 ${pct}% 인상을 반영했다고 보도됐습니다(2011년 5.1% 이후 최대). 정부안이며, 교원 봉급표의 호봉별 금액은 아직 정해지지 않았습니다.`,
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
        desc: `국회 심의에서 예산안이 조정될 수 있습니다. 예산이 의결되기 전까지 ${pct}%는 확정 수치가 아닙니다.`,
        done: false,
      },
  CONFIRMED
    ? {
        step: "4",
        title: "공무원보수규정 개정·2027 봉급표 공표 — 완료",
        desc: `교원 봉급표(별표 11)가 호봉별 금액으로 확정됐습니다(${CONFIRMED.basis}). 1~40호봉 금액은 이 페이지 맨 아래 전체표에 있습니다.`,
        done: true,
      }
    : {
        step: "4",
        title: "공무원보수규정 개정·2027 봉급표 공표 — 연말",
        desc: "교원 봉급표(별표 11)가 호봉별 금액으로 확정되는 단계입니다. 2026년 표는 2025년 12월 30일 국무회의 통과 후 1월 1일부터 적용됐습니다.",
        done: false,
      },
];

// 2026년 교원 봉급표 호봉별 인상률 (2025 → 2026, 인사혁신처 봉급표 원문 비교 — 테스트가 앵커로 재계산)
const RAISE_2026_BY_STEP = [
  { range: "1~8호봉", rate: "6.6%" },
  { range: "9호봉", rate: "5.5%" },
  { range: "10~11호봉", rate: "5.4%" },
  { range: "12호봉", rate: "5.3%" },
  { range: "13~40호봉", rate: "3.5%" },
];

export default function TeacherPay2027Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "2027 교사 봉급표", path: "/teacher-pay-2027" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            slug: "teacher-pay-2027",
            url: "/teacher-pay-2027",
            publishedDate: PUBLISHED,
            modifiedDate: MODIFIED,
          }),
          // datasetLd 는 12월 말 확정표 입력 뒤에만 (예상치는 데이터셋 부적합)
          ...(CONFIRMED
            ? [
                datasetLd({
                  name: "2027년 교육공무원(교원) 호봉표 데이터",
                  description:
                    "공무원보수규정 별표 11 기준 2027년 유·초·중등 교원 1~40호봉 전체 월 봉급액 데이터셋(인사혁신처 2027 봉급표 원문).",
                  url: "/teacher-pay-2027",
                  datePublished: CONFIRMED.checked,
                  dateModified: CONFIRMED.checked,
                  keywords: ["2027 교사 봉급표", "2027 교원 봉급표", "교사 호봉표 2027", "2027 교사 월급"],
                  citation: { name: "인사혁신처 2027년 공무원 봉급표", url: CONFIRMED.sourceUrl },
                  temporalCoverage: "2027",
                }),
              ]
            : []),
          speakableLd({ url: "/teacher-pay-2027", cssSelectors: [".faq-answer"] }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            {CONFIRMED ? `인상률 ${finalPct}% · 2027 봉급표 확정` : `예산안 ${pct}% · 국회 심의 중 · 확정 전`}
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2027 교사 봉급표 <span className="text-electric">{CONFIRMED ? "확정" : "예상 월급"}</span>
          </h1>
          <PublishedMeta publishedDate={PUBLISHED} updatedDate={MODIFIED} className="mb-2" />
          {CONFIRMED ? (
            <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
              <strong>2027년 교원 봉급표가 확정됐습니다(공무원 보수 인상률 {finalPct}%).</strong> 신규 교사 통상
              시작인 {START.label}은 월 {fmt(START.pay2027)}원으로 2026년보다 {fmt(START.monthlyIncrease)}원
              올랐습니다.
            </p>
          ) : (
            <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
              <strong>2027년 교사 봉급 인상률은 정부 예산안 기준 {pct}%</strong>로, 국회 심의 중인 확정 전
              수치입니다. 2026년 교원 봉급표에 적용하면 신규 교사 통상 시작인 {START.label}은 약{" "}
              {fmt(START.pay2027)}원(단순 예상치)입니다.
            </p>
          )}
          {CONFIRMED ? (
            <p className="mt-6 inline-flex items-start gap-2 text-xs text-muted-blue px-4 py-2 bg-white rounded-xl border border-canvas-200 max-w-xl text-left">
              <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                인사혁신처가 공표한 <strong>2027년 교원 봉급표(별표 11)</strong> 기준입니다({CONFIRMED.basis}).
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
            {/* 대표 호봉 비교표 — 전체 호봉표 아님(확정 뒤 전체표는 페이지 맨 끝) */}
            <section className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-electric" />
                2026 → 2027 교원 월 봉급 비교 (주요 호봉, {CONFIRMED ? "확정" : "예상"})
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
                caption="유·초·중등 교원 공통, 월 봉급(기본급), 단위: 원. 연차는 9호봉 임용·경력 가산이 없을 때의 대략값입니다."
                rows={ROWS}
                firstColumn="호봉"
                regionLabel={CONFIRMED ? "2027 교원 봉급 비교표 (가로 스크롤)" : "2027 교원 봉급 예상표 (가로 스크롤)"}
                confirmed={CONFIRMED !== null}
              />
              {CONFIRMED ? (
                <p className="text-xs text-faint-blue leading-6 mt-4">
                  ※ 2027년 1~40호봉 전체는{" "}
                  <Link href="/teacher-pay-2027#teacher-full-table" className="text-electric font-bold hover:underline">
                    이 페이지 맨 아래 전체표
                  </Link>
                  에 있습니다. 다른 직렬은{" "}
                  <Link href="/civil-servant-pay-2027" className="text-electric font-bold hover:underline">
                    일반직
                  </Link>
                  ·
                  <Link href="/police-pay-2027" className="text-electric font-bold hover:underline">
                    경찰
                  </Link>
                  ·
                  <Link href="/firefighter-pay-2027" className="text-electric font-bold hover:underline">
                    소방
                  </Link>{" "}
                  2027 봉급표 페이지에서 볼 수 있습니다.
                </p>
              ) : (
                <p className="text-xs text-faint-blue leading-6 mt-4">
                  ※ 1~40호봉 확정 금액은{" "}
                  <Link href="/teacher-pay-2026#teacher-full-table" className="text-electric font-bold hover:underline">
                    2026 교원 봉급표 전체
                  </Link>
                  에서 볼 수 있습니다. 다른 직렬 예상은{" "}
                  <Link href="/civil-servant-pay-2027" className="text-electric font-bold hover:underline">
                    일반직
                  </Link>
                  ·
                  <Link href="/police-pay-2027" className="text-electric font-bold hover:underline">
                    경찰
                  </Link>
                  ·
                  <Link href="/firefighter-pay-2027" className="text-electric font-bold hover:underline">
                    소방
                  </Link>{" "}
                  2027 봉급표 페이지에 정리돼 있습니다.
                </p>
              )}
            </section>

            <CalcResultAd />

            {/* 확정 일정 · 2026 호봉별 인상률 · 수당 */}
            <section className="mt-10 mb-12">
              <h2 className="text-lg font-black text-navy mb-4">
                {CONFIRMED ? "2027 교원 봉급 확정 — 4단계 경과" : "2027 교원 봉급 확정까지 — 4단계 일정"}
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
                참고: 2026년 교원 봉급은 호봉마다 인상률이 달랐다
              </h2>
              <p className="text-sm leading-7 text-muted-blue">
                2026년 공무원 보수 공통 인상률은 3.5%였지만, 교원 봉급표는 저연차 구간이 더 많이 올랐습니다.
                인사혁신처가 공표한 2025년·2026년 봉급표를 호봉별로 비교한 결과입니다(소수 첫째 자리 반올림).
              </p>
              <ul className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {RAISE_2026_BY_STEP.map((item) => (
                  <li key={item.range} className="p-3 bg-white rounded-xl border border-canvas-200 text-center">
                    <p className="text-xs font-bold text-faint-blue">{item.range}</p>
                    <p className="text-base font-black text-navy tabular-nums">+{item.rate}</p>
                  </li>
                ))}
              </ul>
              {CONFIRMED && RANGE ? (
                <p className="text-sm leading-7 text-muted-blue mt-4">
                  2027년 확정표를 같은 방법으로 2026년 표와 비교하면 호봉별 인상률은 {RANGE.text}입니다.{" "}
                  {START.label}은 {raisePct(START.base2026, START.pay2027)}%, 40호봉은{" "}
                  {raisePct(TOP.base2026, TOP.pay2027)}% 올랐습니다. 호봉별 금액은 맨 아래 전체표에서 확인하세요.
                </p>
              ) : (
                <p className="text-sm leading-7 text-muted-blue mt-4">
                  정부는 2027년 예산안을 설명하며 9급 초임(1호봉) 보수(봉급+수당)가 월 300만원 수준이 된다고
                  밝혔지만, 교원 저연차 호봉에 별도 조정이 있을지와 그 폭은 아직 공표되지 않았습니다. 그래서 위
                  예상표는 모든 호봉에 {pct}%를 같은 비율로 적용했고, 저연차 호봉일수록 실제 확정액과 차이가 날 수
                  있습니다.
                </p>
              )}

              <h2 className="text-lg font-black text-navy mt-10 mb-3">
                수당은 {CONFIRMED ? finalPct : pct}%와 따로 움직인다
              </h2>
              <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
                <li>
                  <strong>정액 수당</strong> — 담임수당 월 {fmt(TEACHER_ALLOWANCE_2026.homeroom)}원, 보직교사수당 월{" "}
                  {fmt(TEACHER_ALLOWANCE_2026.headTeacher)}원, 정액급식비 월 160,000원(2026년 기준). 금액이 수당규정에
                  정해져 있어 봉급 인상률이 자동으로 붙지 않고, 바뀌면 수당규정 개정으로 발표됩니다.
                </li>
                <li>
                  <strong>봉급 연동 수당</strong> — 명절휴가비(설·추석 각 월봉급의 60%)와 정근수당(월봉급의
                  0~50%)은 봉급이 오르면 함께 늘어납니다. 예: {START.label} 명절휴가비 1회분은 2026년{" "}
                  {fmt(holidayBonus(START.base2026))}원 →{" "}
                  {CONFIRMED
                    ? `2027년 ${fmt(holidayBonus(START.pay2027))}원.`
                    : `2027년 약 ${fmt(holidayBonus(START.pay2027))}원(예상).`}
                </li>
              </ul>
            </section>

            <InArticleAd />

            {/* CTA */}
            <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/teacher-pay-2026#teacher-full-table"
                className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
              >
                <FileText className="w-8 h-8 opacity-70 mb-3" />
                <h3 className="text-lg font-black mb-2">2026 교원 봉급표 전체</h3>
                <p className="text-sm opacity-90">{CONFIRMED ? "2026년 1~40호봉 금액과 비교" : "지금 받는 1~40호봉 확정 금액"}</p>
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
                href="/job/elementary-teacher"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">초등교사 연봉 정보</h3>
                <p className="text-sm text-muted-blue">임용·커리어별 연봉 흐름</p>
              </Link>
            </section>

            <GuideMidAd />

            {/* FAQ */}
            <section className="mt-10 mb-12">
              <h2 className="text-xl font-black text-navy mb-6">2027 교사 봉급 자주 묻는 질문</h2>
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

            <RelatedCalculators currentPath="/teacher-pay-2027" />

            <div className="mt-8">
              <ShareButtons
                title={
                  CONFIRMED
                    ? `2027 교사 봉급표 확정 — 인상률 ${finalPct}% 교원 호봉별 월급`
                    : `2027 교사 봉급표 예상 — 예산안 ${pct}% 적용 호봉별 월급`
                }
                description={
                  CONFIRMED
                    ? `9호봉 월 ${fmt(START.pay2027)}원(2026년 대비 +${fmt(START.monthlyIncrease)}원). 인사혁신처 2027 봉급표 기준입니다.`
                    : `9호봉 약 ${fmt(START.pay2027)}원(예상). 확정 전 단순 계산이며 수당·저연차 추가 인상은 미반영입니다.`
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
            id="teacher-full-table"
            aria-labelledby="teacher-full-table-title"
            className="scroll-mt-24 mt-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200"
          >
            <h2 id="teacher-full-table-title" className="text-xl font-black text-navy mb-2">
              2027 교원 봉급표 전체 (1~40호봉)
            </h2>
            <p className="text-xs text-faint-blue leading-6 mb-5">
              단위: 원(월 봉급액) · 유치원·초·중·고 교원 공통 · 출처:{" "}
              <a
                href={CONFIRMED.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric font-bold hover:underline"
              >
                인사혁신처 2027년 공무원 봉급표
              </a>
              (공무원보수규정 별표 11) · 확인일 {CONFIRMED.checked}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <PayStepTable
                caption="1~20호봉"
                columns={["월 봉급액"]}
                rows={CONFIRMED.teacher.filter(([h]) => h <= 20)}
                regionLabel="2027 교원 봉급표 1~20호봉"
              />
              <PayStepTable
                caption="21~40호봉"
                columns={["월 봉급액"]}
                rows={CONFIRMED.teacher.filter(([h]) => h > 20)}
                regionLabel="2027 교원 봉급표 21~40호봉"
              />
            </div>
            <p className="text-xs text-faint-blue leading-6 mt-4">
              ※ 봉급표 금액은 수당을 뺀 기본급입니다. 2026년 금액은{" "}
              <Link href="/teacher-pay-2026#teacher-full-table" className="text-electric font-bold hover:underline">
                2026 교원 봉급표 전체
              </Link>
              에서 비교할 수 있습니다.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
