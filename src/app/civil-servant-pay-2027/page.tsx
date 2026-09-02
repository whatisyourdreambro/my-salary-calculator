// src/app/civil-servant-pay-2027/page.tsx
// 2027 공무원 봉급 전망 시즌 페이지 — 예산안 발표(8월 말)~확정(12월 말) 검색 선점
//
// ★ 갱신 체크포인트 (2단계):
//   1) 2026년 8월 말~9월 초: 정부 예산안에 반영된 2027 인상률 확정 발표 시
//      RAISE_2027(src/lib/civilServantPay.ts)·본문·FAQ를 확정률로 갱신
//   2) 2026년 12월 말: 국무회의 의결로 2027 봉급표 원문 공표 시
//      이 페이지를 확정표 체제로 전면 개편(civil-servant-pay-2026 구조 복제)
//      + datasetLd 추가 + 2026 페이지와 상호 링크 갱신
// 현재 상태: 공무원보수위원회 권고안(3.4~3.9%, 2026-07-23 의결) 기반 "전망" 프레이밍.
// 사실관계 출처: 뉴시스·이투데이·정책브리핑 (2026-07-23~30 보도, 교차 확인 완료)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import {
  TrendingUp,
  ArrowRight,
  Calculator,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  InArticleAd,
  HomeTopAd,
  CalcResultAd,
  GuideMidAd,
  MultiplexAd,
} from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import {
  GENERAL_PAY_ROWS_2026,
  RAISE_2027_RECOMMENDED,
  forecastRange,
} from "@/lib/civilServantPay";

export const metadata: Metadata = buildPageMetadata({
  title: "2027 공무원 봉급표 전망 — 인상률 권고안 3.4~3.9%·확정 일정·예상 월급",
  description:
    "2027년 공무원 봉급 인상률은 공무원보수위원회가 3.4~3.9%를 권고했습니다(사상 첫 노정 합의). 최종 확정은 8월 말 정부 예산안~12월 말 국무회의 의결. 권고안 기준 9급 1호봉 예상 월급 약 220.6만~221.6만원, 9급~5급 호봉별 전망표까지 정리.",
  path: "/civil-servant-pay-2027",
  ogType: "article",
  publishedTime: "2026-08-16",
  modifiedTime: "2026-08-16",
  // ⚠ 연도 없는 "공무원 봉급표" 단독 키워드 금지 — 2026 페이지 잠식 방지
  keywords: [
    "2027 공무원 봉급표",
    "공무원 봉급표 2027",
    "공무원 인상률 2027",
    "2027 공무원 월급",
    "내년 공무원 월급",
    "2027 9급 공무원 월급",
    "공무원보수위원회 권고",
    "2027 공무원 봉급 인상",
  ],
});

const fmt = (n: number) => n.toLocaleString("ko-KR");
const pctMin = (RAISE_2027_RECOMMENDED.min * 100).toFixed(1);
const pctMax = (RAISE_2027_RECOMMENDED.max * 100).toFixed(1);

// 9급 1호봉 전망 (FAQ·리드문 공용)
const g9h1 = forecastRange(2133000);

const FAQ_ITEMS = [
  {
    question: "2027년 공무원 봉급 인상률은 확정됐나요?",
    answer:
      `아직 확정되지 않았습니다(2026년 8월 기준). 공무원보수위원회가 2026년 7월 23일 제2차 전체회의에서 ${pctMin}~${pctMax}% 인상을 권고했고 — 정부·노동계 위원 전원 찬성으로 언론에서 '사상 첫 합의'로 보도됐습니다 — 최종 인상률은 8월 말 발표되는 2027년도 정부 예산안에 반영돼 사실상 확정되고, 12월 말 국무회의에서 공무원보수규정 개정으로 최종 의결됩니다.`,
  },
  {
    question: "2027년 9급 공무원 월급은 얼마가 되나요?",
    answer:
      `권고안(${pctMin}~${pctMax}%)이 그대로 반영된다고 가정하면 9급 1호봉 월 봉급은 약 ${fmt(g9h1.lo)}~${fmt(g9h1.hi)}원 범위로 전망됩니다(2026년 2,133,000원 기준 시뮬레이션 — 확정치 아님). 실제 보수는 여기에 정액급식비·직급보조비·명절휴가비 등 수당이 더해지므로 통장 기준으로는 더 큽니다. 참고로 최근 2년은 저연차(7~9급 낮은 호봉)에 추가 인상이 얹혔는데, 2027년에도 비슷한 저연차 우대가 반영될지는 확정 발표를 확인해야 합니다.`,
  },
  {
    question: "공무원보수위원회 권고안에는 인상률 외에 뭐가 있나요?",
    answer:
      "보수위는 인상률과 함께 ① 5급 이하 초과근무수당 지급률 55%→60% 상향 ② 직급보조비 인상(6급 3만5천원, 7급 2만5천원, 8·9급 2만원 인상)을 권고했습니다. 이 항목들도 예산안·보수규정 개정을 거쳐야 확정됩니다. (출처: 공무원보수위원회 2026-07-23 의결 보도)",
  },
  {
    question: "2026년 인상률은 얼마였나요? (참고 기준)",
    answer:
      "2026년은 전체 3.5% 인상으로 2017년 이후 최고였고, 7~9급 저연차 구간은 처우개선 가산을 더해 최대 6.6% 인상됐습니다. 9급 1호봉 월 봉급은 2,133,000원, 수당 포함 초임 보수는 연 3,428만원이었습니다. 2027년 권고안(3.4~3.9%)이 실현되면 2년 연속 3%대 중반 인상이 됩니다.",
  },
  {
    question: "확정 봉급표는 언제, 어디서 확인할 수 있나요?",
    answer:
      "매년 12월 말 국무회의에서 공무원보수규정 개정안이 의결되면 인사혁신처(mpm.go.kr)가 이듬해 봉급표 원문을 공표하고, 1월 1일부터 시행됩니다. 2027년 확정 봉급표가 발표되는 대로 이 페이지를 확정표로 전면 갱신할 예정입니다. 현재 시행 중인 표는 2026 공무원 봉급표 페이지에서 확인하세요.",
  },
  {
    question: "이 페이지의 예상 월급은 얼마나 정확한가요?",
    answer:
      "본 전망표는 '2026년 확정 봉급표 × 보수위 권고 인상률(3.4~3.9%)'의 단순 시뮬레이션입니다. 실제 확정 인상률이 권고 범위를 벗어나거나, 저연차 추가 인상·수당 개편이 더해지면 결과가 달라질 수 있습니다. 확정 전 참고용으로만 활용하세요.",
  },
];

export default function CivilServantPay2027Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "공무원 봉급 전망 2027", path: "/civil-servant-pay-2027" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title:
              "2027 공무원 봉급표 전망 — 인상률 권고안 3.4~3.9%·확정 일정·예상 월급",
            description:
              "공무원보수위원회 권고안(3.4~3.9%) 기반 2027 공무원 봉급 전망. 9급~5급 예상 월급 시뮬레이션, 확정 일정 타임라인, 초과근무수당·직급보조비 권고 사항 정리",
            slug: "civil-servant-pay-2027",
            url: "/civil-servant-pay-2027",
            publishedDate: "2026-08-16",
            modifiedDate: "2026-08-16",
          }),
          // datasetLd는 확정표 발표 후에만 추가 (전망 시뮬레이션은 데이터셋 부적합)
          speakableLd({
            url: "/civil-servant-pay-2027",
            cssSelectors: [".faq-answer"],
          }),
        ]}
      />

      <div className="page-width">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            보수위 권고 {pctMin}~{pctMax}% (2026-07-23) · 최종 확정은 예산안~12월 국무회의
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2027 공무원 봉급표 <span className="text-electric">전망과 확정 일정</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-16" updatedDate="2026-08-16" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            공무원보수위원회가 2027년 인상률로 <strong>{pctMin}~{pctMax}%</strong>를
            권고했습니다 — 정부·노동계 위원 전원 찬성, 사상 첫 합의입니다. 권고안 기준
            9급 1호봉 예상 월급은 약 {fmt(g9h1.lo)}~{fmt(g9h1.hi)}원입니다.
          </p>
          <p className="mt-6 inline-flex items-start gap-2 text-xs text-amber-800 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 max-w-xl text-left">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              아래 표는 <strong>권고안 기반 전망 시뮬레이션</strong>이며 확정 봉급표가
              아닙니다. 최종 인상률은 8월 말 정부 예산안과 12월 말 국무회의 의결로
              확정됩니다.
            </span>
          </p>
        </div>

        <HomeTopAd />

        {/* 확정 일정 타임라인 */}
        <section className="mt-10 mb-12 max-w-3xl mx-auto">
          <h2 className="text-lg font-black text-navy mb-4">
            2027 봉급 확정까지 — 4단계 일정
          </h2>
          <ol className="space-y-3">
            {[
              {
                step: "1",
                title: "공무원보수위원회 권고 — 완료",
                desc: `2026-07-23 제2차 전체회의에서 ${pctMin}~${pctMax}% 인상 권고 의결. 노동계 최초 요구 7.1% → 중재안 전원 찬성 타결.`,
                done: true,
              },
              {
                step: "2",
                title: "정부 예산안 반영 — 8월 말 발표",
                desc: "인사혁신처 처우개선안 → 예산 당국 심사를 거쳐 2027년도 정부 예산안에 인상률이 반영됩니다. 이 단계에서 사실상 확정됩니다.",
                done: false,
              },
              {
                step: "3",
                title: "국회 예산 심의 — 9~12월",
                desc: "예산안은 헌법상 9월 초 국회에 제출되고, 심의 과정을 거칩니다.",
                done: false,
              },
              {
                step: "4",
                title: "국무회의 의결·봉급표 공표 — 12월 말",
                desc: "공무원보수규정 개정 의결과 함께 인사혁신처가 2027 봉급표 원문을 공표하고 2027-01-01 시행됩니다.",
                done: false,
              },
            ].map((item) => (
              <li
                key={item.step}
                className="flex gap-4 p-4 bg-white rounded-2xl border border-canvas-200"
              >
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
        </section>

        {/* 전망 봉급표 */}
        <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-electric" />
            2027 예상 봉급표 (9급~5급, 1~10호봉) — 권고안 {pctMin}~{pctMax}% 적용
          </h2>
          <p className="text-xs text-amber-700 mb-5">
            ⚠ 전망 시뮬레이션(2026 확정표 × 권고 인상률, 천원 단위 반올림) — 확정 봉급표
            아님 · 저연차 추가 인상 등 변수 미반영
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-canvas-200 text-navy">
                  <th className="py-3 px-2 text-left font-black">호봉</th>
                  <th className="py-3 px-2 text-right font-black">9급 (전망)</th>
                  <th className="py-3 px-2 text-right font-black">8급 (전망)</th>
                  <th className="py-3 px-2 text-right font-black">7급 (전망)</th>
                  <th className="py-3 px-2 text-right font-black">6급 (전망)</th>
                  <th className="py-3 px-2 text-right font-black">5급 (전망)</th>
                </tr>
              </thead>
              <tbody>
                {GENERAL_PAY_ROWS_2026.map(([hobong, g9, g8, g7, g6, g5]) => {
                  const cells = [g9, g8, g7, g6, g5].map((v) => forecastRange(v));
                  return (
                    <tr key={hobong} className="border-b border-canvas-100">
                      <td className="py-2.5 px-2 font-bold text-navy">{hobong}호봉</td>
                      {cells.map((r, i) => (
                        <td
                          key={i}
                          className="py-2.5 px-2 text-right text-muted-blue whitespace-nowrap"
                        >
                          {fmt(r.lo)}~{fmt(r.hi)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint-blue mt-4">
            ※ 현재 시행 중인 확정표는{" "}
            <Link
              href="/civil-servant-pay-2026"
              className="text-electric font-bold hover:underline"
            >
              2026 공무원 봉급표
            </Link>
            에서 확인하세요. 봉급 외에 정액급식비(월 16만원)·직급보조비·명절휴가비(설·추석
            각 월봉급의 60%) 등 수당이 더해집니다.
          </p>
        </section>

        <CalcResultAd />

        {/* 권고안 해설 */}
        <section className="mt-10 mb-12 max-w-3xl mx-auto prose prose-slate">
          <h2 className="text-lg font-black text-navy mb-3">
            권고안 {pctMin}~{pctMax}% — 어떻게 나온 숫자인가
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            공무원보수위원회는 노동계 위원, 정부 위원, 전문가 위원으로 구성된 협의체로,
            매년 이듬해 공무원 보수 인상률을 권고합니다. 2027년분 논의에서 노동계는 당초{" "}
            <strong>7.1%</strong>를 요구했고, 협상 과정에서 정부 3.3~3.8% 대 노조
            4.1~4.3%까지 좁혀진 뒤 전문가 중재안 <strong>{pctMin}~{pctMax}%</strong>를
            정부·노동계 위원 전원 찬성으로 수용했습니다 — 표결 없이 합의로 권고안이 나온
            것은 이번이 처음이라고 보도됐습니다. (출처: 뉴시스·이투데이, 2026-07)
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            인상률 외 권고 사항도 실수령에 직접 영향을 줍니다: ① 5급 이하{" "}
            <strong>초과근무수당 지급률 55% → 60% 상향</strong> ② <strong>직급보조비 인상</strong>
            (6급 +3만5천원, 7급 +2만5천원, 8·9급 +2만원). 다만 권고는 권고일 뿐, 예산
            심사 과정에서 조정될 수 있어 최종 확정 발표를 확인해야 합니다.
          </p>

          <h2 className="text-lg font-black text-navy mt-8 mb-3">
            참고 기준: 2026년은 3.5% (저연차 6.6%)
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            2026년 보수는 전체 3.5% 인상으로 2017년 이후 최고였고, 7~9급 저연차 구간은
            추가 가산으로 최대 6.6% 인상됐습니다. 9급 1호봉 월 봉급 2,133,000원, 수당 포함
            초임 보수 연 3,428만원이 현재 기준입니다. 2027년에도 저연차 우대가 반영되면
            9급 초임의 체감 인상은 전망표보다 커질 수 있습니다.
          </p>
        </section>

        <InArticleAd />

        {/* CTA 카드 */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/civil-servant-pay-2026"
            className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
          >
            <FileText className="w-8 h-8 opacity-70 mb-3" />
            <h3 className="text-lg font-black mb-2">2026 확정 봉급표</h3>
            <p className="text-sm opacity-90">현재 시행 중인 9급~5급 호봉표 원문</p>
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
            <Calculator className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">4대보험 요율</h3>
            <p className="text-sm text-muted-blue">공제 항목 요율 한눈에 확인</p>
          </Link>
        </section>

        <GuideMidAd />

        {/* FAQ */}
        <section className="mt-10 mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-6">
            2027 공무원 봉급 자주 묻는 질문
          </h2>
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

        <RelatedCalculators currentPath="/civil-servant-pay-2027" />

        {/* 직렬별 봉급표 바로가기 — R2 W5 (2026-08-31): 2026판과의 링크 비대칭 해소 */}
        <section className="mt-8 max-w-3xl mx-auto" aria-label="직렬별 봉급표">
          <h2 className="text-sm font-black text-navy mb-3">직렬별 2026 봉급표 바로가기</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/military-pay-2026" className="rounded-full border border-canvas-200 bg-white px-4 py-2 text-sm font-bold text-navy hover:border-electric hover:text-electric transition">
              군인 월급 2026
            </Link>
            <Link href="/teacher-pay-2026" className="rounded-full border border-canvas-200 bg-white px-4 py-2 text-sm font-bold text-navy hover:border-electric hover:text-electric transition">
              교사 호봉표 2026
            </Link>
            <Link href="/police-pay-2026" className="rounded-full border border-canvas-200 bg-white px-4 py-2 text-sm font-bold text-navy hover:border-electric hover:text-electric transition">
              경찰 봉급표 2026
            </Link>
            <Link href="/firefighter-pay-2026" className="rounded-full border border-canvas-200 bg-white px-4 py-2 text-sm font-bold text-navy hover:border-electric hover:text-electric transition">
              소방관 봉급표 2026
            </Link>
          </div>
        </section>

        <div className="mt-8 max-w-3xl mx-auto">
          <ShareButtons
            title="2027 공무원 봉급표 전망 — 인상률 권고안 3.4~3.9%"
            description="사상 첫 노정 합의 권고안 기준 9급~5급 예상 월급과 확정 일정 타임라인"
          />
        </div>

        {/* 본문 끝 관련콘텐츠형 광고 — 직렬별 링크·공유 직후, 전면 최적화 (운영자 지시 2026-09-02) */}
        <div className="mt-10 max-w-3xl mx-auto">
          <MultiplexAd />
        </div>
      </div>
    </main>
  );
}
