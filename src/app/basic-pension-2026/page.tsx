// src/app/basic-pension-2026/page.tsx
// 기초연금 2026 계산기 + 제도 해설 시즌 페이지.
// 전 수치 출처: 보건복지부 보도자료(2026-01-09) · basicpension.mohw.go.kr
// — 기준연금액 349,700원(2.1% 인상) / 선정기준액 단독 247만·부부 395.2만
// — 감액 3종: 국민연금 연계(기준 524,550원) · 부부 20% · 소득역전방지(최저 10%/부부 20%)
// 연례 갱신 체크포인트: 매년 1월 복지부 공표 시 기준연금액·선정기준액 갱신 필요.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import {
  ArrowRight,
  Calculator,
  FileText,
  Landmark,
  ExternalLink,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import {
  breadcrumbLd,
  faqLd,
  softwareApplicationLd,
} from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";
import { getRelatedGuides } from "@/lib/relatedGuides";
import {
  InArticleAd,
  HomeTopAd,
  CalcResultAd,
  GuideMidAd,
} from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import BasicPensionCalculator from "./Client";

export const metadata: Metadata = buildPageMetadata({
  title: "기초연금 계산기 2026 — 월 349,700원 기준·감액 3종 간이 계산",
  description:
    "2026년 기초연금 기준연금액 월 349,700원(2.1% 인상), 선정기준액 단독 247만원·부부 395만 2천원. 가구 유형·소득인정액·국민연금 수령액 입력 → 부부 20% 감액·소득역전방지 감액 반영 예상 수령액 간이 계산. 보건복지부 공표 수치 기준.",
  path: "/basic-pension-2026",
  keywords: [
    "기초연금 계산기",
    "기초연금 2026",
    "기초연금 수급자격",
    "기초연금 선정기준액",
    "기초연금 감액",
    "소득인정액",
    "국민연금 연계 감액",
    "기초연금 부부 감액",
    "기초노령연금",
    "기초연금 얼마",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2026년 기초연금은 한 달에 얼마인가요?",
    answer:
      "2026년 기준연금액은 월 349,700원입니다(전년 대비 2.1% 인상, 보건복지부 공표). 단독 가구는 최대 349,700원, 부부가 모두 받으면 각자 20% 감액되어 1인당 279,760원, 부부 합산 최대 559,520원입니다. 소득 수준에 따라 소득역전방지 감액이 추가로 적용될 수 있습니다.",
  },
  {
    question: "기초연금 선정기준액은 얼마인가요?",
    answer:
      "2026년 선정기준액은 소득인정액 기준 단독 가구 월 247만원, 부부 가구 월 395만 2천원입니다(보건복지부 공표). 소득인정액이 이 금액 이하인 만 65세 이상이면 수급 대상입니다. 소득인정액은 월 소득평가액과 재산의 월 소득환산액을 합산해 산정하며, 근로소득 공제 등이 적용되어 실제 월급·재산보다 낮게 계산되는 경우가 많습니다.",
  },
  {
    question: "국민연금을 받고 있으면 기초연금을 못 받나요?",
    answer:
      "받을 수 있습니다. 국민연금 월 수령액이 524,550원(기준연금액의 150%) 이하면 국민연금 연계 감액 없이 전액 기준으로 산정됩니다. 524,550원을 초과하면 연계 산식에 따라 기초연금이 감액될 수 있는데, 감액 후 금액의 상한은 기준연금액(349,700원)입니다. 정확한 연계 감액액은 개인별 국민연금 가입 이력에 따라 달라 국민연금공단 산정으로 확정됩니다.",
  },
  {
    question: "부부가 둘 다 받으면 왜 깎이나요?",
    answer:
      "부부가 모두 기초연금을 받는 경우 각자의 기초연금액에서 20%씩 감액하는 부부 감액 제도가 적용됩니다. 2026년 기준 1인당 349,700원에서 279,760원으로 줄어 부부 합산 최대 559,520원을 받습니다. 생활비가 1인 가구의 2배까지 들지 않는다는 가구 규모의 경제를 반영한 제도입니다.",
  },
  {
    question: "소득역전방지 감액이 무엇인가요?",
    answer:
      "기초연금을 받아서 총소득이 선정기준액을 넘어버리면, 기초연금을 못 받는 사람보다 오히려 소득이 높아지는 역전이 생깁니다. 이를 막기 위해 (소득인정액 + 기초연금액)이 선정기준액을 초과하는 만큼 기초연금을 감액합니다. 다만 최저 보장이 있어 기준연금액의 10%(단독 34,970원), 부부 2인 기준 20%까지는 지급됩니다.",
  },
  {
    question: "소득인정액은 어떻게 계산하나요?",
    answer:
      "소득인정액 = 월 소득평가액 + 재산의 월 소득환산액입니다. 근로소득 공제, 지역별 기본재산 공제, 금융재산 공제 등 공제 항목이 많아 실제 월급이나 재산보다 낮게 산정되는 경우가 많습니다. 정확한 금액은 기초연금 공식 사이트(basicpension.mohw.go.kr)의 모의계산 또는 국민연금공단(1355) 상담으로 확인하는 것이 가장 정확합니다.",
  },
  {
    question: "기초연금은 어디서 신청하나요?",
    answer:
      "만 65세 이상 생일이 속한 달의 1개월 전부터 신청할 수 있습니다. 전국 국민연금공단 지사, 주소지 읍·면·동 주민센터에서 신청 가능하며, 거동이 불편하면 국민연금공단(1355)에 '찾아뵙는 서비스'를 요청할 수 있습니다. 신청 후 소득·재산 조사를 거쳐 수급 여부와 금액이 결정됩니다.",
  },
  {
    question: "이 계산기의 결과만 믿고 신청해도 되나요?",
    answer:
      "이 계산기는 보건복지부 공표 수치(기준연금액 349,700원, 선정기준액 단독 247만원·부부 395만 2천원, 감액 규칙)를 기반으로 한 간이 계산입니다. 소득인정액 산정의 각종 공제와 국민연금 연계 감액 산식은 간소화돼 있어 실제 금액과 다를 수 있습니다. 실제 수급 여부와 금액은 국민연금공단의 소득·재산 조사와 심사로 확정되므로, 결과와 무관하게 대상이 될 것 같다면 일단 신청해 보는 것이 좋습니다.",
  },
];

export default function BasicPension2026Page() {
  const relatedGuideItems = getRelatedGuides({
    currentSlug: "basic-pension-2026",
    category: "기초",
    tags: ["기초연금", "국민연금", "노후", "정부지원", "2026"],
    limit: 3,
    explicitSlugs: [
      "national-pension-strategy-2026",
      "elder-care-insurance-2026",
      "low-income-support-4benefits-2026",
    ],
  });

  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "기초연금 계산기 2026", path: "/basic-pension-2026" },
          ]),
          faqLd(FAQ_ITEMS),
          softwareApplicationLd({
            name: "기초연금 계산기 2026",
            description:
              "2026년 기초연금 예상 수령액 간이 계산기. 가구 유형·소득인정액·국민연금 수령액 입력 → 기준연금액 349,700원 기준 부부 감액·소득역전방지 감액 반영 예상액 계산.",
            url: "/basic-pension-2026",
          }),
        ]}
      />

      <div className="page-width">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Landmark className="w-4 h-4" />
            2026년 기준연금액 월 349,700원 · 보건복지부 공표
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            기초연금 계산기 <span className="text-electric">2026</span>
          </h1>
          <PublishedMeta
            publishedDate="2026-08-15"
            updatedDate="2026-08-15"
            className="mb-2"
          />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            가구 유형·소득인정액·국민연금 수령액을 입력하면 2026년 기준연금액
            349,700원을 기준으로 부부 감액·소득역전방지 감액을 반영한 예상
            수령액을 간이 계산합니다. 실제 수급 여부는 국민연금공단 심사로
            확정됩니다.
          </p>
          <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
            📚 공식 출처: 보건복지부 보도자료(2026-01-09) ·{" "}
            <a
              href="https://basicpension.mohw.go.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              기초연금 공식 사이트
            </a>
          </p>
        </div>

        <HomeTopAd />

        {/* 계산기 */}
        <div className="mt-10">
          <BasicPensionCalculator />
        </div>

        <CalcResultAd />

        {/* 핵심 수치 표 */}
        <section className="my-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-6">
            2026 기초연금 핵심 수치 한눈에
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-canvas-200 text-left">
                  <th className="py-3 pr-4 font-bold text-faint-blue">구분</th>
                  <th className="py-3 pr-4 font-bold text-faint-blue text-right">
                    2026년 금액 (월)
                  </th>
                  <th className="py-3 font-bold text-faint-blue">비고</th>
                </tr>
              </thead>
              <tbody className="text-navy">
                {[
                  {
                    label: "기준연금액 (단독 최대)",
                    value: "349,700원",
                    note: "전년 대비 2.1% 인상",
                  },
                  {
                    label: "부부 1인당 (20% 감액 후)",
                    value: "279,760원",
                    note: "부부 모두 수급 시",
                  },
                  {
                    label: "부부 합산 최대",
                    value: "559,520원",
                    note: "279,760원 × 2인",
                  },
                  {
                    label: "선정기준액 — 단독 가구",
                    value: "2,470,000원",
                    note: "소득인정액 기준",
                  },
                  {
                    label: "선정기준액 — 부부 가구",
                    value: "3,952,000원",
                    note: "소득인정액 기준",
                  },
                  {
                    label: "국민연금 연계 기준",
                    value: "524,550원",
                    note: "기준연금액의 150% — 이하면 연계 감액 없음",
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-canvas-100">
                    <td className="py-3 pr-4 font-bold">{row.label}</td>
                    <td className="py-3 pr-4 text-right font-black text-electric whitespace-nowrap">
                      {row.value}
                    </td>
                    <td className="py-3 text-muted-blue text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint-blue mt-4">
            ※ 출처: 보건복지부 보도자료(2026-01-09) 및 기초연금 공식 사이트
            (basicpension.mohw.go.kr). 기준연금액·선정기준액은 매년 1월 복지부가
            새로 공표합니다.
          </p>
        </section>

        {/* 감액 3종 해설 */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-6">
            기초연금이 깎이는 3가지 경우
          </h2>
          <div className="space-y-4">
            {[
              {
                no: "①",
                title: "국민연금 연계 감액",
                desc: "국민연금 월 수령액이 524,550원(기준연금액의 150%) 이하면 감액 없이 전액 기준으로 산정됩니다. 초과하면 개인별 국민연금 가입 이력에 따른 연계 산식이 적용되며, 산식 결과의 상한은 기준연금액(349,700원)입니다. 위 계산기에서는 대상 여부만 안내하는 간이 방식입니다.",
              },
              {
                no: "②",
                title: "부부 감액 — 각자 20%",
                desc: "부부가 모두 기초연금을 받으면 각자의 연금액에서 20%씩 감액됩니다. 2026년 기준 1인당 349,700원 → 279,760원, 부부 합산 최대 559,520원입니다.",
              },
              {
                no: "③",
                title: "소득역전방지 감액",
                desc: "(소득인정액 + 기초연금액)이 선정기준액을 초과하는 만큼 감액됩니다. 기초연금 수급으로 비수급자보다 소득이 높아지는 역전을 막기 위한 장치로, 최저 보장액은 기준연금액의 10%(단독 34,970원), 부부 2인 기준 20%입니다.",
              },
            ].map((item) => (
              <div
                key={item.no}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-canvas-200"
              >
                <span className="w-9 h-9 shrink-0 bg-electric-10 text-electric rounded-full flex items-center justify-center text-sm font-black">
                  {item.no}
                </span>
                <div>
                  <p className="text-sm font-black text-navy mb-1">{item.title}</p>
                  <p className="text-sm text-muted-blue leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <InArticleAd />

        {/* 소득인정액 해설 */}
        <section className="my-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-4">
            소득인정액이란? — 월급·재산 그대로가 아닙니다
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-sm leading-7 text-muted-blue">
              기초연금 수급 여부를 가르는 <strong>소득인정액</strong>은 실제 월급이나
              통장 잔액이 아니라, <strong>월 소득평가액 + 재산의 월 소득환산액</strong>
              으로 계산되는 행정상 지표입니다. 근로소득에는 공제가 적용되고,
              재산도 지역별 기본재산 공제·금융재산 공제를 뺀 뒤 일정 비율로만 월
              소득으로 환산되기 때문에, 대부분의 경우 체감 소득보다 낮게
              산정됩니다. 국민연금 등 연금 수령액도 소득에 포함됩니다.
            </p>
            <p className="text-sm leading-7 text-muted-blue mt-4">
              공제 항목과 환산율이 복잡해 정확한 소득인정액을 손으로 계산하기는
              어렵습니다. 월급이나 재산이 있어서 안 될 것 같다고 지레 포기하지
              말고, 아래 공식 모의계산으로 본인의 소득인정액을 먼저 확인해
              보세요. 선정기준액(단독 247만원·부부 395만 2천원) 경계선에 있는
              분일수록 공식 계산이 중요합니다.
            </p>
          </div>
          <a
            href="https://basicpension.mohw.go.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-between gap-3 p-5 bg-electric rounded-2xl text-white hover:bg-blue-600 transition-colors"
          >
            <span>
              <span className="block text-base font-black">
                기초연금 공식 사이트에서 소득인정액 모의계산 하기
              </span>
              <span className="block text-sm opacity-90 mt-1">
                보건복지부 운영 · basicpension.mohw.go.kr · 수급 대상 자가진단
              </span>
            </span>
            <ExternalLink className="w-6 h-6 shrink-0" />
          </a>
          <p className="text-xs text-faint-blue mt-3">
            ※ 본 페이지의 계산은 간이 계산이며, 실제 수급 여부와 금액은
            국민연금공단의 소득·재산 조사와 심사로 확정됩니다.
          </p>
        </section>

        {/* CTA — 관련 계산기 */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/national-pension-estimate-2026"
            className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
          >
            <Calculator className="w-8 h-8 opacity-70 mb-3" />
            <h3 className="text-lg font-black mb-2">국민연금 예상 수령액</h3>
            <p className="text-sm opacity-90">연계 감액 기준 확인의 출발점</p>
          </Link>
          <Link
            href="/retirement-pension-2026"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <FileText className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">퇴직연금 2026</h3>
            <p className="text-sm text-muted-blue">노후 3층 연금 함께 설계</p>
          </Link>
          <Link
            href="/health-insurance-fee-2026"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <FileText className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">건강보험료 계산</h3>
            <p className="text-sm text-muted-blue">은퇴 후 지역가입자 보험료</p>
          </Link>
        </section>

        <GuideMidAd />

        {/* FAQ */}
        <section className="my-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-6">
            기초연금 자주 묻는 질문
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

        <RelatedGuides items={relatedGuideItems} />

        <RelatedCalculators currentPath="/basic-pension-2026" />

        <div className="mt-8 max-w-3xl mx-auto">
          <ShareButtons
            title="기초연금 계산기 2026 — 월 349,700원 기준 간이 계산"
            description="선정기준액 단독 247만·부부 395.2만, 감액 3종 반영 예상 수령액 계산"
          />
        </div>
      </div>
    </main>
  );
}
