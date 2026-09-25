// src/app/firefighter-pay-2027/page.tsx
// 2027 소방공무원 봉급표 예상 — 예산안(9/1)~확정(12월 말) 사이 '2027 소방공무원 봉급표' 검색 선점
// (수익 추천 #3, 2026-09-25 준비).
//
// 모델: /civil-servant-pay-2027 — 예산안 3.9% 는 '예상·국회 심의 중·확정 전'으로만 쓰고 출처를 단다,
//   forecast2027 헬퍼, FAQ·JSON-LD(datasetLd 는 확정표 뒤에만)·PublishedMeta.
// 광고: /firefighter-pay-2026 배치 1:1 복제 — HomeTop → (그리드) CalcResult → InArticle → GuideMid → 쿠팡 →
//   사이드바 Sidebar·쿠팡 (추천 #3 '기존 광고 배치 복제' 승인 대상, 새 위치·새 유닛 없음).
// ★ 2027 전체 계급×호봉표는 싣지 않는다 — 저연차 추가 인상·국회 조정 전이라 오정보. 대표 지점 예상치만.
// ★ 경찰 2027 페이지와 같은 별표 10 을 쓰지만 수당·근무 문단은 직렬별로 따로 쓴다(중복 문서 방지).
// ★ 갱신 체크포인트: 12월 말 2027 봉급표 공표 → 확정표 체제로 전환(firefighter-pay-2026 구조 + datasetLd).
// 사실관계 출처(2026-09-25 확인):
//   - 2026 소방 봉급: 인사혁신처 2026 봉급표(mpm.go.kr, 원문 파싱 → payTablesFull2026.ts)
//   - 2026 계급·호봉별 인상률: 인사혁신처 2025·2026 봉급표 비교(payForecast2027.test.ts 가 2025 원문 앵커로 재계산)
//   - 2026 수당(위험근무수당 7만→8만, 화재진화·구조구급 출동가산금 일 상한 3만→4만, 긴급구조통제단 전담 소방
//     특수업무수당 월 8만 신설): 인사혁신처 보도자료 2025-12-30(mpm.go.kr cntId=4187)
//   - 2027 예산안 3.9%·9급 초임 보수 월 300만원 수준: 연합뉴스 2026-09-01(기획예산처 설명)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Calendar, Calculator, FileText, ArrowRight, Flame, AlertTriangle } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import PayForecastTable from "@/components/PayForecastTable";
import { HAZARD_ALLOWANCE_2026, RAISE_2027_BUDGET, RAISE_2027_RECOMMENDED } from "@/lib/civilServantPay";
import { policeFireForecastRows } from "@/lib/payForecast2027";

const fmt = (n: number) => n.toLocaleString("ko-KR");
const pct = (RAISE_2027_BUDGET * 100).toFixed(1);
const pctMin = (RAISE_2027_RECOMMENDED.min * 100).toFixed(1);
const pctMax = (RAISE_2027_RECOMMENDED.max * 100).toFixed(1);

const ROWS = policeFireForecastRows("fire");
// 소방사 1호봉(신임) — 메타·리드·FAQ 공용
const ENTRY = ROWS[0];
const rowOf = (label: string) => {
  const row = ROWS.find((r) => r.label === label);
  if (!row) throw new Error(`[firefighter-pay-2027] 대표 행 '${label}' 이 없습니다`);
  return row;
};
const SENIOR = rowOf("소방장 10호봉");
const CAPTAIN = rowOf("소방경 20호봉");

const PUBLISHED = "2026-09-25";
const MODIFIED = "2026-09-25";
const PAGE_TITLE = `2027 소방공무원 봉급표 예상 — 예산안 ${pct}%·계급별 월급`;
const PAGE_DESCRIPTION = `2027년 소방공무원 봉급 인상률은 정부 예산안 ${pct}%로 국회 심의 중(확정 전)입니다. 2026년 봉급표에 적용한 소방사 1호봉 약 ${fmt(ENTRY.predicted2027)}원부터 소방령까지 계급별 예상 월급과 일정을 정리했습니다.`;

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/firefighter-pay-2027",
  ogType: "article",
  publishedTime: PUBLISHED,
  modifiedTime: MODIFIED,
  // ⚠ 연도 없는 '소방공무원 봉급표' 단독 키워드 금지 — 2026 확정표 페이지 잠식 방지
  keywords: [
    "2027 소방공무원 봉급표",
    "2027년 소방공무원 봉급표",
    "소방공무원 봉급표 2027",
    "2027 소방 봉급표",
    "2027 소방사 월급",
    "내년 소방관 월급",
    "2027 소방공무원 인상률",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2027년 소방공무원 봉급은 몇 % 오르고, 확정됐나요?",
    answer: `2027년도 정부 예산안(2026년 9월 1일 국무회의 심의)에 공무원 보수 ${pct}% 인상이 반영됐다고 보도됐습니다(기획예산처 설명). 소방공무원도 같은 인상률을 적용받지만 지금은 정부안 단계입니다. 국회가 예산을 의결하고 연말에 공무원보수규정 별표 10이 개정돼야 소방사~소방정감의 호봉별 금액이 확정됩니다.`,
  },
  {
    question: "2027년 소방사 1호봉 월급은 얼마로 예상되나요?",
    answer: `2026년 소방사 1호봉 월 봉급은 ${fmt(ENTRY.base2026)}원이고, ${pct}%를 단순 적용하면 약 ${fmt(ENTRY.predicted2027)}원(월 +${fmt(ENTRY.monthlyIncrease)}원, 천원 단위 반올림)입니다. 확정 봉급표가 아닌 예상치입니다. 소방사 1호봉은 순경·일반직 9급 1호봉과 같은 금액으로 2026년에 6.6% 올랐으므로, 2027년에도 저연차 조정이 있으면 확정액은 이보다 클 수 있습니다.`,
  },
  {
    question: "출동가산금·위험근무수당도 3.9% 오르나요?",
    answer: `아닙니다. 위험근무수당(2026년 월 ${fmt(HAZARD_ALLOWANCE_2026)}원)과 화재진화·구조구급 출동가산금(일 상한 4만원)은 공무원수당규정에서 금액·상한을 따로 정하는 수당이라 봉급 인상률이 자동으로 붙지 않습니다. 2026년에는 봉급 인상과 별도로 위험근무수당이 월 7만원에서 8만원으로, 출동가산금 일 상한이 3만원에서 4만원으로 올랐고, 긴급구조통제단 운영을 전담하는 소방공무원의 특수업무수당(월 8만원)이 신설됐습니다(인사혁신처).`,
  },
  {
    question: "소방장·소방경은 2027년에 얼마를 받게 되나요?",
    answer: `예산안 ${pct}%를 단순 적용하면 소방장 10호봉은 2026년 ${fmt(SENIOR.base2026)}원에서 약 ${fmt(SENIOR.predicted2027)}원, 소방경 20호봉은 ${fmt(CAPTAIN.base2026)}원에서 약 ${fmt(CAPTAIN.predicted2027)}원이 됩니다(예상). 본인 계급·호봉의 2026년 금액은 2026 소방공무원 봉급표 전체표에서 확인할 수 있습니다.`,
  },
  {
    question: "2027 소방 봉급표는 언제 나오고, 경찰과 금액이 같나요?",
    answer:
      "소방과 경찰은 공무원보수규정 별표 10 통합표를 함께 써서 소방사=순경, 소방교=경장, 소방장=경사처럼 계급별 봉급이 같습니다. 2026년 표는 2025년 12월 30일 국무회의를 통과해 2026년 1월 1일부터 적용됐습니다(인사혁신처 보도자료). 2027년 표도 연말 개정·공표 후에 확정 금액을 확인할 수 있습니다.",
  },
];

const SCHEDULE = [
  {
    step: "1",
    title: "공무원보수위원회 권고 — 완료",
    desc: `2026년 7월 23일 보수위가 2027년 인상률 ${pctMin}~${pctMax}%를 정부·노동계 합의로 권고했습니다.`,
    done: true,
  },
  {
    step: "2",
    title: `정부 예산안 ${pct}% — 9월 1일 국무회의`,
    desc: `예산안에 공무원 보수 ${pct}% 인상 반영(보도, 2011년 5.1% 이후 최대). 소방 계급별 봉급액은 아직 정해지지 않은 정부안입니다.`,
    done: true,
  },
  {
    step: "3",
    title: "국회 예산 심의 — 법정 기한 12월 2일 (진행 중)",
    desc: `국회 의결 전까지 ${pct}%는 조정될 수 있는 수치입니다.`,
    done: false,
  },
  {
    step: "4",
    title: "별표 10 개정·2027 봉급표 공표 — 연말",
    desc: "소방사~소방정감의 호봉별 금액이 확정되는 단계입니다. 2026년 표는 2025년 12월 30일 국무회의 통과 후 1월 1일부터 적용됐습니다.",
    done: false,
  },
];

// 2026년 소방 봉급표 계급별 인상률 (2025 → 2026, 인사혁신처 봉급표 원문 비교 — 테스트가 앵커로 재계산)
const RAISE_2026_BY_RANK = [
  { rank: "소방사 1~7호봉", rate: "3.7~6.6%" },
  { rank: "소방교 1~5호봉", rate: "4.0~6.6%" },
  { rank: "소방장 1~4호봉", rate: "4.0~6.6%" },
  { rank: "소방위 1~2호봉", rate: "5.3~6.6%" },
  { rank: "그 밖의 호봉·소방경 이상", rate: "3.5%" },
];

export default function FirefighterPay2027Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "2027 소방공무원 봉급표", path: "/firefighter-pay-2027" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            slug: "firefighter-pay-2027",
            url: "/firefighter-pay-2027",
            publishedDate: PUBLISHED,
            modifiedDate: MODIFIED,
          }),
          // datasetLd 는 12월 말 확정표 공표 후에만 (예상치는 데이터셋 부적합)
          speakableLd({ url: "/firefighter-pay-2027", cssSelectors: [".faq-answer"] }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            예산안 {pct}% · 국회 심의 중 · 확정 전
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2027 소방공무원 봉급표 <span className="text-electric">예상 월급</span>
          </h1>
          <PublishedMeta publishedDate={PUBLISHED} updatedDate={MODIFIED} className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            <strong>2027년 소방공무원 봉급 인상률은 정부 예산안 기준 {pct}%</strong>로, 국회 심의 중인
            확정 전 수치입니다. 2026년 봉급표에 적용하면 소방사 1호봉은 약 {fmt(ENTRY.predicted2027)}원(단순
            예상치)입니다.
          </p>
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
        </div>

        <HomeTopAd />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
          <div className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">
            {/* 대표 지점 예상표 — 전체 계급×호봉표 아님 */}
            <section className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
                <Flame className="w-5 h-5 text-electric" />
                2026 → 2027 소방 월 봉급 비교 (계급별 예시, 예상)
              </h2>
              <p className="text-xs text-amber-700 mb-5">
                ⚠ 2027 예상 = 2026 확정 봉급 × (1 + {pct}%), 천원 단위 반올림 — 확정 봉급표 아님 · 저연차 추가
                인상·국회 심의 조정·수당 미반영
              </p>
              <PayForecastTable
                caption="소방공무원 월 봉급(기본급), 단위: 원. 신임부터 승진 경로를 가정한 예시 지점이며 실제 승진 시점·호봉은 개인마다 다릅니다."
                rows={ROWS}
                firstColumn="계급·호봉"
                regionLabel="2027 소방 봉급 예상표 (가로 스크롤)"
              />
              <p className="text-xs text-faint-blue leading-6 mt-4">
                ※ 소방사~소방정감 전 호봉 확정 금액은{" "}
                <Link href="/firefighter-pay-2026#fire-full-table" className="text-electric font-bold hover:underline">
                  2026 소방공무원 봉급표 전체
                </Link>
                에 있습니다. 같은 표를 쓰는 경찰은{" "}
                <Link href="/police-pay-2027" className="text-electric font-bold hover:underline">
                  2027 경찰 봉급표 예상
                </Link>
                , 일반직은{" "}
                <Link href="/civil-servant-pay-2027" className="text-electric font-bold hover:underline">
                  2027 공무원 봉급표 예상
                </Link>
                에서 볼 수 있습니다.
              </p>
            </section>

            <CalcResultAd />

            {/* 확정 일정 · 2026 계급별 인상률 · 수당 */}
            <section className="mt-10 mb-12">
              <h2 className="text-lg font-black text-navy mb-4">2027 소방 봉급 확정까지 — 4단계 일정</h2>
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
                참고: 2026년 소방 봉급 인상률은 계급·호봉마다 달랐다
              </h2>
              <p className="text-sm leading-7 text-muted-blue">
                인사혁신처 2025년·2026년 봉급표를 비교하면, 공통 인상률 3.5%와 달리 소방사~소방위의 낮은
                호봉은 더 크게 올랐습니다(각 계급 1호봉 6.6%).
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
              <p className="text-sm leading-7 text-muted-blue mt-4">
                이 페이지의 예상액은 모든 계급·호봉에 {pct}%를 똑같이 곱한 값이라, 저연차 조정이 다시 있으면
                소방사·소방교 낮은 호봉은 확정액이 더 클 수 있습니다. 2026년에는 소방경 이상이 전 호봉 3.5%
                그대로였습니다.
              </p>

              <h2 className="text-lg font-black text-navy mt-10 mb-3">소방 수당은 봉급 인상률과 별개</h2>
              <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
                <li>
                  <strong>위험근무수당</strong> — 2026년 월 {fmt(HAZARD_ALLOWANCE_2026)}원(7만원에서 인상), 수당규정에
                  금액이 정해진 항목입니다.
                </li>
                <li>
                  <strong>화재진화·구조구급 출동가산금</strong> — 2026년 일 상한 3만원 → 4만원. 긴급구조통제단 운영
                  전담 소방공무원에게는 특수업무수당 월 8만원이 2026년 신설됐습니다.
                </li>
                <li>
                  <strong>봉급 연동 수당</strong> — 명절휴가비(설·추석 각 월봉급의 60%)·정근수당(월봉급의 0~50%)은
                  봉급 인상분만큼 함께 늘어납니다.
                </li>
              </ul>
              <p className="text-sm leading-7 text-muted-blue mt-4">
                24시간 교대근무가 많은 현장 부서는 초과근무수당과 출동가산금 비중이 커서, 같은 계급·호봉이라도
                실수령 차이가 큽니다. 2027년 수당 금액은 수당규정 개정 발표 후 확인하세요.
              </p>
            </section>

            <InArticleAd />

            {/* CTA */}
            <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/firefighter-pay-2026#fire-full-table"
                className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
              >
                <FileText className="w-8 h-8 opacity-70 mb-3" />
                <h3 className="text-lg font-black mb-2">2026 소방 봉급표 전체</h3>
                <p className="text-sm opacity-90">소방사~소방정감 확정 금액</p>
              </Link>
              <Link
                href="/civil-servant-pay-2027"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <Calculator className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">2027 공무원 봉급표 예상</h3>
                <p className="text-sm text-muted-blue">일반직 9~5급 예상 월급</p>
              </Link>
              <Link
                href="/job/firefighter"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">소방공무원 연봉 정보</h3>
                <p className="text-sm text-muted-blue">계급·연차별 연봉 흐름</p>
              </Link>
            </section>

            <GuideMidAd />

            {/* FAQ */}
            <section className="mt-10 mb-12">
              <h2 className="text-xl font-black text-navy mb-6">2027 소방공무원 봉급 자주 묻는 질문</h2>
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

            <RelatedCalculators currentPath="/firefighter-pay-2027" />

            <div className="mt-8">
              <ShareButtons
                title={`2027 소방공무원 봉급표 예상 — 예산안 ${pct}% 적용 계급별 월급`}
                description={`소방사 1호봉 약 ${fmt(ENTRY.predicted2027)}원(예상). 확정 전 단순 계산이며 수당·저연차 추가 인상은 미반영입니다.`}
              />
            </div>
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start" aria-label="추천·광고">
            <SidebarAd />
            <CoupangBanner size="skyscraper" showDisclosure={false} />
          </aside>
        </div>
      </div>
    </main>
  );
}
