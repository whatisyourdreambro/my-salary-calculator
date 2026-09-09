import type { Metadata } from "next";
import Link from "@/components/AppLink";
import DsrCalculator from "@/components/calculators/real-estate/DsrCalculator";
import JsonLd from "@/components/JsonLd";
import { CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import { ArrowRight, Info, AlertTriangle, Percent } from "lucide-react";

export const metadata: Metadata = buildToolMetadata({
  name: "DSR 계산기",
  tagline: "연소득·연간 원리금으로 상환 비율 계산",
  description:
    "연소득과 연간 원금·이자 상환액을 원 단위로 입력해 소득 대비 원리금 상환 비율을 계산하세요. 대출별 산입 기준·스트레스 금리·승인 한도는 자동 판정하지 않는 단순 비율 계산기입니다.",
  path: "/tools/real-estate/dsr",
  keywords: [
    "DSR 계산기",
    "총부채원리금상환비율",
    "연간 원리금 상환액",
    "소득 대비 상환 비율",
    "내 DSR",
    "스트레스 DSR",
    "주담대 DSR",
    "신용대출 DSR",
    "DSR 계산 방법",
  ],
});

const FAQ_ITEMS = [
  {
    question: "DSR이 정확히 무엇인가요?",
    answer:
      "DSR(Debt Service Ratio, 총부채원리금상환비율)은 연소득에 대한 연간 원리금 상환액의 비율입니다. 이 도구는 사용자가 입력한 연간 원금과 이자를 더한 뒤 연소득으로 나누고 100을 곱합니다. 예를 들어 연소득 5,000만원, 연간 원금 1,000만원, 연간 이자 200만원이면 24%입니다. 규제상 DSR 심사와 일치하는지는 입력 금액의 산입 기준을 별도로 확인해야 합니다.",
  },
  {
    question: "어떤 대출이 DSR에 포함되나요?",
    answer:
      "이 도구에는 대출 종류를 선택하거나 산입·제외를 판정하는 기능이 없습니다. 생활비 계획을 위해 실제 상환액을 합산한 비율과 규제상 DSR은 다를 수 있습니다. 심사용 비율을 확인하려면 금융기관이 안내한 대출별 원금·이자 산입액과 소득 인정 기준을 확인한 뒤 입력하세요.",
  },
  {
    question: "결과가 40% 아래면 대출을 받을 수 있나요?",
    answer:
      "특정 비율 아래라고 대출이 승인되거나 추가 대출 금액이 확정되지는 않습니다. 이 계산기는 규제 적용 대상·상한·예외를 판정하지 않습니다. 본인에게 적용되는 기준과 담보·소득·기존 부채 등 승인 조건은 금융기관 심사로 확인해야 합니다.",
  },
  {
    question: "DSR과 LTV는 어떻게 다른가요?",
    answer:
      "DSR은 연소득 대비 연간 원리금 상환액의 비율이고, LTV는 담보 가치 대비 대출 금액의 비율입니다. 이 페이지는 DSR의 단순 비율만 계산합니다. LTV나 다른 심사 조건을 함께 적용해 승인 한도를 계산하지 않습니다.",
  },
  {
    question: "스트레스 금리나 지역별 규정이 자동 반영되나요?",
    answer:
      "자동 반영되지 않습니다. 이 도구에는 지역·금리·상환 기간을 입력하는 항목이 없으며, 입력한 연간 원금과 이자 합계만 사용합니다. 스트레스 DSR 적용 여부와 심사용 원리금 산정은 금융기관 안내에서 따로 확인하세요. 실제 납부하는 금액과 심사에 쓰는 금액을 같은 값으로 가정하지 마세요.",
  },
  {
    question: "대출 잔액을 연간 원금 상환액에 넣어도 되나요?",
    answer:
      "대출 잔액과 1년 동안 상환하는 원금은 서로 다릅니다. 원금 입력란에는 계산하려는 1년의 원금 상환액을, 이자 입력란에는 같은 기간의 이자 상환액을 넣으세요. 잔액을 입력해도 상환 기간으로 자동 나누거나 대출별 규제상 만기로 환산하지 않습니다.",
  },
  {
    question: "월 상환액만 알면 어떻게 입력하나요?",
    answer:
      "원금과 이자를 나누어 같은 12개월의 금액을 각각 합산하세요. 매월 금액이 변한다면 첫 달 금액에 12를 곱한 값과 실제 연간 합계가 다를 수 있습니다. 만기 원금 상환도 빠뜨리지 않도록 상환 일정표를 확인하세요. 규제상 심사에 사용할 금액은 금융기관이 산정한 기준과 대조해야 합니다.",
  },
  {
    question: "두 사람의 소득을 합산해도 되나요?",
    answer:
      "가계 상환 부담을 보려는 합산 계산과 대출 심사용 소득 인정은 별개입니다. 계산 목적에 맞춰 같은 대상의 소득과 원리금을 사용하세요. 이 도구는 공동 차주나 배우자 소득 합산 자격을 판정하지 않으므로, 심사용 소득의 범위는 신청 상품과 금융기관에 확인해야 합니다.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "연소득 입력",
    text: "계산 대상의 1년 소득을 원 단위로 입력합니다. 심사용 소득 인정 여부는 별도 확인이 필요합니다.",
  },
  {
    name: "연간 원금 상환액 입력",
    text: "계산에 포함할 대출의 같은 1년 원금 상환액을 합산합니다. 대출 잔액 자체를 넣지 않습니다.",
  },
  {
    name: "연간 이자 상환액 입력",
    text: "같은 기간의 이자 상환액 합계를 별도 입력란에 넣습니다. 금리나 대출 잔액으로 자동 산출하지 않습니다.",
  },
  {
    name: "상환 비율 계산",
    text: "계산하기를 누르면 (연간 원금 + 연간 이자) ÷ 연소득 × 100의 결과가 소수 둘째 자리까지 표시됩니다.",
  },
  {
    name: "입력 기준과 심사 조건 확인",
    text: "결과는 입력 금액의 비율입니다. 대출별 산입·제외, 스트레스 금리, 승인 한도는 금융기관에서 별도로 확인하세요.",
  },
];

export default function DsrPage() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-24 px-4">
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "DSR 계산기",
            description:
              "입력한 연간 원금·이자 상환액을 연소득으로 나눈 비율 계산. 대출별 산입 기준·승인 한도 자동 판정은 제외합니다.",
            url: "/tools/real-estate/dsr",
          }),
          autoBreadcrumbLd("/tools/real-estate/dsr", {
            leafName: "DSR 계산기",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "DSR 계산하는 방법",
            description:
              "연소득·연간 원금·연간 이자 3개 입력으로 상환 비율을 계산하고 심사와 구분하는 5단계.",
            steps: HOW_TO_STEPS,
            totalTime: "PT3M",
          }),
        ]}
      />

      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
            <Percent size={12} aria-hidden /> 연소득 대비 연간 원리금 비율
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-3">
            DSR 계산기
          </h1>
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-xl mx-auto">
            연소득과 연간 원금·이자 상환액으로 소득 대비 상환 비율을 확인하세요.
            추가 대출 가능 금액이나 규제상 승인 한도를 계산하지 않습니다.
          </p>
        </header>

        <DsrCalculator />

        {/* 결과 직하 광고 */}
        <CalcResultAd />

        {/* 단계별 사용법 */}
        <section className="mt-12 mb-10">
          <h2 className="text-xl font-black text-navy mb-5">
            DSR 계산 5단계
          </h2>
          <div className="rounded-2xl bg-white border border-canvas-200 p-6 space-y-3">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={step.name} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric flex items-center justify-center font-black text-white text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold text-navy text-sm mb-1">{step.name}</p>
                  <p className="text-xs text-muted-blue leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 본문 섹션 경계 광고(5단계 ↔ 가이드 본문) — 전면 최적화 (운영자 지시 2026-09-02) */}
        <div className="my-8">
          <GuideMidAd />
        </div>

        <article className="prose prose-sm sm:prose-base max-w-none mb-10">
          <h2 className="text-xl font-black text-navy mt-8 mb-4">
            같은 연간 원리금 1,200만원을 입력한 비율 예시
          </h2>
          <ul className="space-y-1 text-muted-blue leading-relaxed">
            <li>
              • <strong>연소득 3,000만원</strong> → 40%
            </li>
            <li>
              • <strong>연소득 5,000만원</strong> → 24%
            </li>
            <li>
              • <strong>연소득 8,000만원</strong> → 15%
            </li>
            <li>
              • <strong>연소득 1억원</strong> → 12%
            </li>
            <li>
              • <strong>연소득 1.5억원</strong> → 8%
            </li>
          </ul>
          <p className="text-muted-blue leading-relaxed">
            모두 연간 원금 1,000만원과 이자 200만원을 넣은 가정입니다.
            비율이 낮다고 승인되는 것은 아니며, 각 숫자는 대출 상한을 뜻하지 않습니다.
          </p>

          <h2 className="text-xl font-black text-navy mt-8 mb-4">
            계산 전에 확인할 3가지
          </h2>
          <ol className="space-y-1 text-muted-blue leading-relaxed">
            <li>
              <strong>같은 대상·같은 기간</strong> — 소득과 원리금을 모두 같은 사람과
              같은 1년 기준으로 정리합니다.
            </li>
            <li>
              <strong>원금·이자 구분</strong> — 월 납입금이나 대출 잔액을 연간 원금과
              혼동하지 않도록 상환 일정표를 확인합니다.
            </li>
            <li>
              <strong>계산 목적 구분</strong> — 생활비 계획용 실제 상환액인지,
              금융기관이 확인한 심사용 산입액인지 구분합니다.
            </li>
          </ol>
        </article>

        {/* 경고 */}
        <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-amber-50 border border-amber-200">
          <AlertTriangle
            size={20}
            className="text-amber-600 flex-shrink-0 mt-1"
            aria-hidden
          />
          <div>
            <p className="font-black text-amber-900 mb-1">
              참고용 계산기입니다
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              입력값의 단순 비율이며 대출별 원리금 환산, 산입·제외, 스트레스 금리,
              규제 상한을 자동 적용하지 않습니다. 실제 DSR과 승인 한도는 신청 시점의
              금융기관 안내를 확인하세요.
            </p>
          </div>
        </div>

        {/* 관련 페이지 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          <Link
            href="/home-loan"
            className="block p-5 bg-white border border-canvas-200 rounded-2xl hover:border-electric transition-colors group"
          >
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
              주담대 종합
            </p>
            <p className="font-bold text-navy text-sm mb-1">
              주택담보대출 계산기
            </p>
            <p className="text-xs text-muted-blue mb-3">
              주택 가격·자기 자본·입력 금리로 월 상환액과 총 이자 비교
            </p>
            <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
              주담대 계산{" "}
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                aria-hidden
              />
            </span>
          </Link>
          <Link
            href="/tools/real-estate/ltv"
            className="block p-5 bg-white border border-canvas-200 rounded-2xl hover:border-electric transition-colors group"
          >
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
              담보 대비 비율
            </p>
            <p className="font-bold text-navy text-sm mb-1">LTV 계산기</p>
            <p className="text-xs text-muted-blue mb-3">
              주택가 대비 대출 비율
            </p>
            <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
              LTV 계산{" "}
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                aria-hidden
              />
            </span>
          </Link>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-navy mb-5">자주 묻는 질문</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="rounded-2xl bg-white border border-canvas-200 p-5 group transition-shadow hover:shadow-md"
              >
                <summary className="cursor-pointer font-bold text-navy flex items-center justify-between gap-3">
                  <span>{item.question}</span>
                  <span className="text-electric group-open:rotate-180 transition-transform flex-shrink-0">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-muted-blue leading-relaxed text-sm">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
          <Info
            size={18}
            className="text-electric flex-shrink-0 mt-1"
            aria-hidden
          />
          <p className="text-xs text-muted-blue leading-relaxed">
            계산식: (연간 원금 상환액 + 연간 이자 상환액) ÷ 연소득 × 100.
            연소득은 0보다 크게 입력하세요. 산식 결과는 승인 가능 여부나 대출 금액이 아닙니다.
          </p>
        </div>
      </div>
    </main>
  );
}
