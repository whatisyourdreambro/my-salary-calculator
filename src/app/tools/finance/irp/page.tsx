import type { Metadata } from "next";
import Link from "@/components/AppLink";
import IRPCalculatorClient from "./IRPCalculatorClient";
import JsonLd from "@/components/JsonLd";
import { GuideMidAd } from "@/components/AdPlacement";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import { ArrowRight, Info, AlertTriangle, PiggyBank } from "lucide-react";

export const metadata: Metadata = buildToolMetadata({
  name: "IRP·연금저축 세액공제 계산기",
  tagline: "연 900만 한도 세액공제·환급 예상액",
  description:
    "총급여와 IRP·연금저축 납입액으로 세액공제 예상액을 계산합니다. 운용 수익, 미래 자산, 인출 세금 및 최종 환급액은 계산하지 않습니다.",
  path: "/tools/finance/irp",
  keywords: [
    "IRP 계산기",
    "IRP 세액공제",
    "연금저축 계산기",
    "연금저축 세액공제",
    "IRP 환급",
    "IRP 900만원",
    "노후 자산 시뮬",
    "퇴직연금 IRP",
    "세액공제 한도",
    "연금 수령 세금",
  ],
});

const FAQ_ITEMS = [
  {
    question: "IRP와 연금저축의 차이는?",
    answer:
      "IRP(개인형 퇴직연금)는 퇴직급여 + 추가 납입 가능한 통합 계좌. 연금저축(연금저축펀드/연금저축보험)은 추가 납입 전용 별도 계좌. 두 계좌 합산 연 900만원까지 세액공제. IRP는 일반 위험자산 투자한도가 적립금의 70%이며, 법정 요건을 충족한 적격 TDF는 이 한도에서 제외됩니다. 연금저축은 운용 자유도가 높습니다.",
  },
  {
    question: "세액공제율 16.5% vs 13.2%는?",
    answer:
      "근로소득만 있는 경우 총급여 5,500만원 이하의 공제율은 소득세 15%(지방소득세 포함 16.5%), 초과는 12%(지방소득세 포함 13.2%)입니다. 공제 대상 납입액 900만원에 적용하면 세액공제 예상액은 각각 148.5만원, 118.8만원입니다. 실제 적용액과 환급액은 해당 연도의 세액·다른 공제에 따라 달라지며, 앞으로 매년 같은 금액을 받는다는 의미는 아닙니다.",
  },
  {
    question: "55세 전 인출하면 어떻게 되나요?",
    answer:
      "연금외수령은 돈의 원천별로 과세가 다릅니다. 세액공제를 받지 않은 납입 원금은 과세제외이며, 세액공제를 받은 납입금과 운용수익에는 일반적으로 기타소득세 15%(지방소득세 포함 16.5%)가 적용됩니다. 여기에 과거 세액공제 전액을 다시 더해 환수하는 것으로 계산하지 않습니다. 이연퇴직소득에는 퇴직소득세가 적용됩니다. 의료목적 등 부득이한 사유에는 예외가 있으므로, 인출 가능 여부와 과세 요건을 금융회사에 각각 확인해야 합니다.",
  },
  {
    question: "IRP 안전자산 30%는 어떻게?",
    answer:
      "예금·국채·우량 회사채 등이 안전자산이고, 위험자산(주식형 펀드·ETF)은 적립금의 70%까지만 담을 수 있습니다. 다만 퇴직연금감독규정의 요건(운용 기간 안전자산 비중 유지 등)을 충족한 적격 TDF(타겟데이트펀드)는 위험자산 한도에서 빠져 적립금의 100%까지 투자할 수 있습니다. 직접 운용할 시간이 없다면 적격 TDF를 먼저 검토해 보세요.",
  },
  {
    question: "연 900만원 전부 IRP에 넣어야 하나요?",
    answer:
      "꼭 그럴 필요 없습니다. IRP 단독 900만원, 또는 연금저축 600만원과 IRP 300만원으로 나누는 방식이 있습니다. 연금저축 단독 세액공제 대상 한도는 600만원이므로, 일반 합산 한도 900만원을 채우려면 나머지는 IRP 등 퇴직연금계좌의 공제 대상 납입금이어야 합니다. 같은 공제율·공제 대상 금액이라면 계산상 세액공제 예상액은 같지만 실제 적용액과 환급액은 해당 연도의 세액에 따라 달라집니다.",
  },
  {
    question: "운용 수익에도 세금이 부과되나요?",
    answer:
      "계좌 안의 운용수익은 인출할 때 과세됩니다. 연금수령 요건을 충족하면 나이에 따른 원천징수 소득세율은 3~5%(지방소득세 포함 3.3~5.5%)입니다. 다른 과세 조건이나 연간 사적연금액에 따라 종합과세 또는 별도 분리과세가 적용될 수 있어 이것이 항상 최종 세율은 아닙니다. 일반적인 연금외수령은 기타소득세 15%(지방소득세 포함 16.5%)이며, 부득이한 사유 등 예외는 별도로 확인해야 합니다.",
  },
  {
    question: "퇴직금을 IRP로 옮기는 게 유리한가요?",
    answer:
      "퇴직금에서 이연된 퇴직소득은 개인 납입금·운용수익과 과세 방식이 다릅니다. 연금수령 요건을 충족하면 퇴직소득세의 70%(연금 수령 11~20년차는 60%, 21년차부터는 50%)를 적용합니다(2026년 이후 수령 기준). 이는 퇴직금에 3.3~5.5%를 일괄 적용한다는 뜻이 아닙니다. 실제 세금과 유불리는 퇴직소득세, 수령 방식·기간 및 자금 필요에 따라 달라집니다.",
  },
  {
    question: "맞벌이 부부는 각자 900만 가능?",
    answer:
      "각자의 공제 요건과 납입 한도를 적용합니다. 근로소득만 있는 부부가 각각 공제 대상 금액 900만원을 납입했다면, 둘 다 총급여 5,500만원 이하일 때 합산 세액공제 예상액은 지방소득세 포함 297만원, 둘 다 초과일 때는 237.6만원입니다. 각자 적용할 세액과 다른 공제에 따라 실제 적용액·환급액은 달라집니다.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "본인 총급여로 세액공제율 확인",
    text: "근로소득만 있는 경우 총급여 5,500만원 이하 16.5% / 초과 13.2%(지방소득세 포함).",
  },
  {
    name: "납입 한도 설정",
    text: "IRP+연금저축 합산 연 900만원이 세액공제 한도. 추가 납입은 가능하지만 공제 X.",
  },
  {
    name: "세액공제 예상액 계산",
    text: "공제 대상 납입액 × 공제율 = 세액공제 예상액. 실제 적용액과 환급액은 해당 연도의 세액·다른 공제에 따라 달라집니다.",
  },
  {
    name: "운용 수익 과세이연 효과",
    text: "계좌 내 수익은 인출 시까지 과세 X. 일반 펀드 대비 복리 효과.",
  },
  {
    name: "55세 이후 연금 수령 계획",
    text: "연금수령 요건·소득 원천별로 과세가 다릅니다. 공제받은 납입금·운용수익과 이연퇴직소득을 구분하세요.",
  },
];

export default function IRPPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "IRP·연금저축 세액공제 계산기",
            description:
              "총급여와 IRP·연금저축 납입액으로 세액공제 예상액을 계산.",
            url: "/tools/finance/irp",
          }),
          autoBreadcrumbLd("/tools/finance/irp", {
            leafName: "IRP·연금저축 계산기",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "IRP·연금저축 세액공제 활용 5단계",
            description:
              "총급여 기준 세액공제율과 공제 대상 납입액을 확인하는 방법.",
            steps: HOW_TO_STEPS,
            totalTime: "PT3M",
          }),
        ]}
      />

      <main className="min-h-screen bg-canvas pb-20 pt-24 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
              <PiggyBank size={12} aria-hidden /> 연 900만 한도·세액공제 예상액 계산
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-3">
              IRP·연금저축 계산기
            </h1>
            <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-xl mx-auto">
              총급여와 납입액으로 세액공제 예상액을 확인하세요.
              운용 수익과 최종 환급액은 별도 확인이 필요합니다.
            </p>
          </header>

          <IRPCalculatorClient />

          {/* 5단계 활용법 */}
          <section className="mt-12 mb-10">
            <h2 className="text-xl font-black text-navy mb-5">
              IRP·연금저축 활용 5단계
            </h2>
            <div className="rounded-2xl bg-white border border-canvas-200 p-6 space-y-3">
              {HOW_TO_STEPS.map((step, i) => (
                <div key={step.name} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric flex items-center justify-center font-black text-white text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-navy text-sm mb-1">
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-blue leading-relaxed">
                      {step.text}
                    </p>
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
              총급여별 세액공제 예상액 — 지방소득세 포함
            </h2>
            <ul className="space-y-1 text-muted-blue leading-relaxed">
              <li>
                • <strong>총급여 4,000만</strong> + 공제 대상 900만 납입 = 148.5만
              </li>
              <li>
                • <strong>총급여 5,500만</strong> + 900만 = 148.5만 (16.5%)
              </li>
              <li>
                • <strong>총급여 7,000만</strong> + 900만 = 118.8만 (13.2%)
              </li>
              <li>
                • <strong>총급여 1억</strong> + 900만 = 118.8만 (13.2%)
              </li>
              <li>
                • 근로소득만 있는 경우의 예시입니다. 실제 적용액·환급액은 해당 연도의 세액과 다른 공제에 따라 달라집니다.
              </li>
            </ul>

            <h2 className="text-xl font-black text-navy mt-8 mb-4">
              과세이연의 진짜 가치
            </h2>
            <p className="text-muted-blue leading-relaxed">
              연금계좌의 과세이연 효과는 투자 상품의 과세 방식, 운용 결과와
              인출 시 적용되는 세금에 따라 달라집니다. 이 계산기는 운용 수익이나
              미래 자산을 계산하지 않으며, 만기 자산의 증가를 보장하지 않습니다.
            </p>

            <h2 className="text-xl font-black text-navy mt-8 mb-4">
              주의 — 중도인출 조건과 세금 확인
            </h2>
            <p className="text-muted-blue leading-relaxed">
              세액공제를 받은 납입금과 운용수익의 일반적인 연금외수령에는
              기타소득세 15%(지방소득세 포함 16.5%)가 적용됩니다. 미공제 납입
              원금은 과세제외이고 이연퇴직소득에는 퇴직소득세가 적용됩니다.
              과거 공제액 전액을 세금에 다시 더하지 않습니다. 인출 가능 사유와
              부득이한 사유에 따른 과세 예외는 금융회사에 각각 확인하세요.
            </p>
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
                실제 환급액은 본인 다른 세액공제 (자녀·의료비·기부 등) 합산
                결과에 따라 다를 수 있습니다. 운용 수익은 시장 변동에 따라
                달라지며, 손실 가능성도 있습니다.
              </p>
            </div>
          </div>

          {/* 관련 페이지 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            <Link
              href="/retirement-pension-2026"
              className="block p-5 bg-white border border-canvas-200 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                종합 가이드
              </p>
              <p className="font-bold text-navy text-sm mb-1">
                퇴직연금 DB·DC·IRP
              </p>
              <p className="text-xs text-muted-blue mb-3">
                세 가지 제도 비교·선택법
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                가이드 보기{" "}
                <ArrowRight
                  className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden
                />
              </span>
            </Link>
            <Link
              href="/year-end-tax"
              className="block p-5 bg-white border border-canvas-200 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                연말정산
              </p>
              <p className="font-bold text-navy text-sm mb-1">
                연말정산 계산기
              </p>
              <p className="text-xs text-muted-blue mb-3">
                IRP 포함 전체 환급액 시뮬
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                연말정산{" "}
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
              본 계산기는 2026 세액공제율(16.5%/13.2%) 기준 추정치. 본인 다른
              공제 항목 합산 결과는 연말정산 계산기에서 확인.
              {" "}근거: <a className="underline" href="https://g.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596">국세청 연금계좌 세액공제</a>,
              {" "}<a className="underline" href="https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7888&mi=6452">국세청 연금소득 과세</a>
              {" "}(2026-10-23 확인).
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
