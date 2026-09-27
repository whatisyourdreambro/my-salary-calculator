// /calc/civil-servant-net-pay — 공무원 월급 실수령액 계산기 (2026-09-27 신설, 운영자 승인 — 202종 계산기 동결의 단일 예외)
// 정적 라우트(○) 전용 폴더 — /calc/[slug] 보다 우선하며 simpleCalculators 레지스트리(202종)에는 넣지 않는다.
// 광고 순서는 /calc/pension-hike-2027 과 같다: CALC_RESULT(Client 결과 직하) → IN_ARTICLE → GUIDE_MID → (layout) COUPANG → HOME_TOP.
// 본문·FAQ 의 금액은 전부 빌드 시 엔진(civilServantNetPay.ts)·정본 상수에서 계산한다 — 수기 숫자 금지.
// ★ 갱신 체크포인트: 12월 말 2027 봉급표 확정(미리보기 → 확정) · 1월 수당 규정 개정 · 4월 30일 기준소득월액 평균액 고시.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { Landmark, Info } from "lucide-react";
import CivilNetPayClient from "./Client";
import { CIVIL_DEFAULT_INPUT, computeCivilNetPay, previewCivilNetPay2027 } from "@/lib/civilServantNetPay";
import {
  CIVIL_FAMILY_ALLOWANCE_2026,
  CIVIL_HAZARD_ALLOWANCE_2026,
  CIVIL_HOLIDAY_BONUS_RATE_2026,
  CIVIL_MEAL_ALLOWANCE_2026,
  CIVIL_MEAL_NONTAX_CAP_2026,
  CIVIL_PENSION_2026,
  CIVIL_POSITION_ALLOWANCE_2026,
  CIVIL_TEACHER_ALLOWANCE_2026,
} from "@/lib/civilServantAllowances2026";
import { RAISE_2027_BUDGET } from "@/lib/civilServantPay";

const PATH = "/calc/civil-servant-net-pay";
const NAME = "공무원 월급 실수령액 계산기";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct = (rate: number) => `${Math.round(rate * 1000) / 10}%`;

// 빌드 시 계산 — 기본값(9급 1호봉·재직 2년 미만·본인만·시간외 정액분 10시간)
const A = computeCivilNetPay(CIVIL_DEFAULT_INPUT);
const A27 = previewCivilNetPay2027(CIVIL_DEFAULT_INPUT);
const itemOf = (key: string) => A.items.find((item) => item.key === key)?.amount ?? 0;
const RAISE = pct(RAISE_2027_BUDGET);
const MAX_CONTRIBUTION = Math.round(CIVIL_PENSION_2026.cap * CIVIL_PENSION_2026.rate);

const ALLOWANCE_ROWS: ReadonlyArray<{ name: string; amount: string; basis: string }> = [
  { name: "정액급식비", amount: `월 ${won(CIVIL_MEAL_ALLOWANCE_2026)} (비과세)`, basis: "제18조" },
  {
    name: "직급보조비",
    amount: `9·8급 ${won(CIVIL_POSITION_ALLOWANCE_2026.general[0])} · 7급 ${won(CIVIL_POSITION_ALLOWANCE_2026.general[2])} · 6급 ${won(CIVIL_POSITION_ALLOWANCE_2026.general[3])} · 5급 ${won(CIVIL_POSITION_ALLOWANCE_2026.general[4])}`,
    basis: "제18조의6·별표 15",
  },
  {
    name: "가족수당",
    amount: `배우자 ${won(CIVIL_FAMILY_ALLOWANCE_2026.spouse)} · 첫째 ${won(CIVIL_FAMILY_ALLOWANCE_2026.firstChild)} · 둘째 ${won(CIVIL_FAMILY_ALLOWANCE_2026.secondChild)} · 셋째 이후 ${won(CIVIL_FAMILY_ALLOWANCE_2026.thirdPlusChild)} · 기타 1명 ${won(CIVIL_FAMILY_ALLOWANCE_2026.otherEach)}`,
    basis: "제10조·별표 5",
  },
  { name: "정근수당 가산금", amount: `재직 5년 미만 월 ${won(itemOf("jeonggeunAddon"))}부터`, basis: "별표 2 제2호" },
  { name: "명절휴가비", amount: `설·추석 각 월봉급액의 ${pct(CIVIL_HOLIDAY_BONUS_RATE_2026)}`, basis: "제18조의3" },
  {
    name: "교직수당 (교사)",
    amount: `${won(CIVIL_TEACHER_ALLOWANCE_2026.teaching)} + 담임 ${won(CIVIL_TEACHER_ALLOWANCE_2026.homeroom)} · 보직교사 ${won(CIVIL_TEACHER_ALLOWANCE_2026.headTeacher)}`,
    basis: "별표 11 다목",
  },
  {
    name: "위험근무수당 (경찰·소방)",
    amount: `갑종 ${won(CIVIL_HAZARD_ALLOWANCE_2026.gap)} + 가산금 ${won(CIVIL_HAZARD_ALLOWANCE_2026.surcharge)}`,
    basis: "제13조·별표 8·9",
  },
  { name: "시간외근무수당", amount: `9급 1시간 ${won(A.overtimeHourly)} (정액분 월 10시간)`, basis: "제15조·별표 12" },
];

const FAQ_ITEMS = [
  {
    question: "9급 1호봉 실수령액은 얼마인가요?",
    answer: `재직 2년 미만·본인만·시간외근무 정액분 10시간 기준으로 일반 달 월 실수령액은 약 ${won(A.net)}입니다. 세전 월 지급액 ${won(A.grossMonthly)}(봉급 ${won(A.pay)} + 직급보조비 ${won(itemOf("position"))} + 정근수당 가산금 ${won(itemOf("jeonggeunAddon"))} + 시간외근무수당 ${won(A.overtime)} + 정액급식비 ${won(itemOf("meal"))})에서 공무원연금 기여금 ${won(A.contribution)}, 건강·장기요양보험 ${won(A.health + A.longTermCare)}, 소득세·지방소득세 ${won(A.incomeTax + A.localIncomeTax)}을 뺀 금액입니다.`,
  },
  {
    question: "공무원연금 기여금 9%와 상한은?",
    answer: `기여금은 기준소득월액의 9%입니다(공무원연금법 제67조). 기준소득월액은 공무원 전체 평균액의 160%를 넘을 수 없어 2026년 5월~2027년 4월 상한은 ${won(CIVIL_PENSION_2026.cap)}(평균액 ${won(CIVIL_PENSION_2026.avgBaseIncome)} × 160%), 월 기여금 최대는 ${won(MAX_CONTRIBUTION)}입니다. 기여금 납부기간이 36년을 넘으면 더 내지 않습니다. 기준소득월액은 전년도 과세소득을 바탕으로 매년 5월 새로 정해지므로 이 계산기는 올해 보수로 추정합니다.`,
  },
  {
    question: "정액급식비에도 세금이 붙나요?",
    answer: `아니요. 정액급식비는 월 ${won(CIVIL_MEAL_ALLOWANCE_2026)}(수당 규정 제18조)으로 소득세법상 식사대 비과세 한도(월 ${won(CIVIL_MEAL_NONTAX_CAP_2026)} 이하, 제12조제3호러목) 안이라 전액 비과세입니다. 직급보조비·가족수당·정근수당 가산금·시간외근무수당 등 나머지 수당은 과세됩니다.`,
  },
  {
    question: "명절휴가비·정근수당은 언제 얼마 나오나요?",
    answer: `명절휴가비는 설과 추석에 각각 월봉급액의 ${pct(CIVIL_HOLIDAY_BONUS_RATE_2026)}(제18조의3), 정근수당은 1월과 7월에 근무연수에 따라 월봉급액의 10~50%(별표 2)가 나옵니다. 9급 1호봉·재직 2년 미만이면 명절휴가비 각 ${won(A.annual.holidayBonusEach)}, 정근수당 각 ${won(A.annual.jeonggeunEach)}(${A.jeonggeunPct}%)입니다. 그 달 소득세는 따로 원천징수되므로 계산기의 일반 달 실수령액과 다릅니다.`,
  },
  {
    question: "2027년 공무원 월급은 얼마나 오르나요? (정부안)",
    answer: `2027년 정부 예산안의 공무원 보수 인상률은 ${RAISE}입니다. 단순 적용하면 9급 1호봉 봉급은 ${won(A27?.pay ?? 0)}, 같은 조건 월 실수령액은 약 ${won(A27?.net ?? 0)}으로 추정됩니다. 7~9급 저연차 추가 인상은 수치가 공표되지 않아 반영하지 않았고, 최종 봉급표는 12월 말 국무회의 의결로 확정됩니다.`,
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: NAME,
  tagline: "9급·교사·경찰·소방 호봉별 세후 월급",
  description:
    "공무원 월급 실수령액 계산기. 2026 봉급표(인사혁신처)에 정액급식비 16만원·직급보조비·가족수당을 더하고 공무원연금 기여금 9%·건강보험·소득세를 빼 세후 월급을 계산합니다. 9급 1호봉 예시와 2027 정부안(3.9%) 미리보기 포함.",
  path: PATH,
  keywords: [
    "공무원 실수령액",
    "공무원 월급 실수령액",
    "9급 공무원 실수령액",
    "공무원 월급 계산기",
    "교사 실수령액",
    "경찰 월급 실수령액",
    "소방관 실수령액",
    "공무원연금 기여금",
  ],
});

export default function CivilServantNetPayPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: NAME,
            description: "2026 봉급표와 수당 규정으로 9급~5급·교사·경찰·소방·병사의 세후 월급을 계산합니다.",
            url: PATH,
            featureList: [
              "호봉별 봉급 + 정액급식비·직급보조비·가족수당·정근수당 가산금",
              "공무원연금 기여금 9%·건강보험·장기요양·소득세 공제",
              "교사 교직수당·담임, 경찰·소방 위험근무수당, 시간외근무수당",
              "2027 정부안 인상률 미리보기",
            ],
          }),
          autoBreadcrumbLd(PATH, { leafName: NAME }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Landmark size={12} /> 2026 봉급표·수당 규정 반영
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              공무원 월급 실수령액 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              직종·호봉만 고르면 <strong className="text-electric">세후 월급</strong>이 바로 나옵니다
            </p>
          </header>

          <CivilNetPayClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">공무원 월급 실수령액, 이렇게 계산합니다</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              공무원 월급은 <strong>봉급표의 봉급</strong>에 매달 나오는 수당(정액급식비·직급보조비·가족수당·정근수당 가산금·시간외근무수당, 교사는
              교직수당, 경찰·소방은 위험근무수당)을 더한 금액입니다. 여기서 <strong>공무원연금 기여금</strong>, 건강보험·장기요양보험료, 소득세와
              지방소득세를 빼면 통장에 들어오는 실수령액이 됩니다. 공무원은 고용보험 대상이 아니고 국민연금 대신 공무원연금에 가입합니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">2026 주요 수당 금액 (법령 기준)</h2>
            <div className="not-prose overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-canvas-200 dark:border-canvas-700 text-left text-xs text-faint-blue">
                    <th className="py-2 pr-3 font-bold">수당</th>
                    <th className="py-2 pr-3 font-bold">월 금액</th>
                    <th className="py-2 font-bold">조문 (공무원수당 등에 관한 규정)</th>
                  </tr>
                </thead>
                <tbody>
                  {ALLOWANCE_ROWS.map((row) => (
                    <tr key={row.name} className="border-b border-canvas-100 dark:border-canvas-800 align-top">
                      <td className="py-2 pr-3 font-bold text-navy dark:text-canvas-50 whitespace-nowrap">{row.name}</td>
                      <td className="py-2 pr-3 text-muted-blue dark:text-canvas-300">{row.amount}</td>
                      <td className="py-2 text-xs text-muted-blue dark:text-canvas-300 whitespace-nowrap">{row.basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">공제 항목 — 기여금 9%·건강보험·소득세</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>공무원연금 기여금</strong>: 기준소득월액의 9%. 상한 {won(CIVIL_PENSION_2026.cap)}(공무원 전체 평균 {won(CIVIL_PENSION_2026.avgBaseIncome)}의
                160%)이라 월 최대 {won(MAX_CONTRIBUTION)}이며, 납부기간 36년을 넘으면 내지 않습니다.
              </li>
              <li>
                <strong>건강보험·장기요양보험</strong>: 보수월액에 직장가입자 요율을 곱합니다. 이 계산기는 기준소득월액 추정값을 보수월액으로 씁니다.
              </li>
              <li>
                <strong>소득세·지방소득세</strong>: 비과세(정액급식비)를 뺀 과세 월급여로 근로소득 간이세액표를 적용하고, 지방소득세는 소득세의 10%입니다.
              </li>
            </ul>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">예시: 9급 1호봉 신규 실수령액</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              재직 2년 미만·부양가족 없음·시간외근무 정액분 10시간 기준입니다.
            </p>
            <ul className="space-y-1 text-muted-blue dark:text-canvas-300">
              <li>
                세전 월 지급액 {won(A.grossMonthly)} = 봉급 {won(A.pay)} + 수당 {won(A.allowanceTotal)}
              </li>
              <li>
                공제 {won(A.deductions)} = 기여금 {won(A.contribution)} + 건강 {won(A.health)} + 장기요양 {won(A.longTermCare)} + 소득세 {won(A.incomeTax)} +
                지방소득세 {won(A.localIncomeTax)}
              </li>
              <li>
                <strong>월 실수령액 {won(A.net)}</strong>
              </li>
              <li>
                명절휴가비·정근수당을 더한 연간 세전 {won(A.annual.annualGross)} — 인사혁신처가 밝힌 9급 초임 연 보수(약{" "}
                {Math.round(A.annual.annualGross / 1e4).toLocaleString("ko-KR")}만원)와 같은 수준입니다.
              </li>
            </ul>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">2027 정부안 {RAISE}는 확정이 아닙니다</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              2027년 정부 예산안의 보수 인상률 {RAISE}를 단순 적용하면 9급 1호봉 봉급은 {won(A27?.pay ?? 0)}, 같은 조건 실수령액은 약 {won(A27?.net ?? 0)}
              입니다. 저연차 추가 인상 폭은 아직 공표되지 않았고, 확정 봉급표는 12월 말 국무회의 의결 뒤 나옵니다. 급수·호봉별 전망은{" "}
              <Link href="/civil-servant-pay-2027" className="text-electric font-bold hover:underline">
                2027 공무원 봉급표
              </Link>
              , 확정 봉급표는{" "}
              <Link href="/civil-servant-pay-2026" className="text-electric font-bold hover:underline">
                2026 공무원 봉급표
              </Link>
              에서 확인하세요.
            </p>
          </article>

          {/* 본문-FAQ 사이 광고 */}
          <InArticleAd />

          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={idx} className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group">
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}<span className="text-electric group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* FAQ 직하 광고 */}
          <GuideMidAd />

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              일반 달(명절·1월·7월 제외) 기준 추정치입니다. 기준소득월액은 실제로 전년도 과세소득으로 매년 5월 정해지고 건강보험료도 매년 4월 전년도 보수로
              정산되므로 급여명세서와 차이가 날 수 있습니다. 성과상여금·연가보상비·특수지근무수당 등은 기본 계산에 없습니다(고급 설정의 기타 수당으로
              입력). 4급 이상·경정(소방령) 이상·군 간부는 연봉제이거나 봉급표 체계가 달라 제외했습니다 — 각 봉급표 페이지를 참고하세요.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/civil-servant-net-pay" />
        </div>
      </main>
    </>
  );
}
