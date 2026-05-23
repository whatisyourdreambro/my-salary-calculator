import type { Metadata } from "next";
import Link from "next/link";
import IRPCalculatorClient from "./IRPCalculatorClient";
import RelatedCalculators from "@/components/RelatedCalculators";
import JsonLd from "@/components/JsonLd";
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
  tagline: "연 900만 한도 환급 + 노후 자산 시뮬",
  description:
    "IRP(개인형 퇴직연금)와 연금저축 세액공제 환급액을 2026년 기준 자동 계산. 연봉별 환급률(16.5% vs 13.2%), 노후 자산 누적 시뮬레이션, 운용 수익 과세이연 효과까지.",
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
      "IRP(개인형 퇴직연금)는 퇴직급여 + 추가 납입 가능한 통합 계좌. 연금저축(연금저축펀드/연금저축보험)은 추가 납입 전용 별도 계좌. 두 계좌 합산 연 900만원까지 세액공제. IRP는 안전자산 30% 의무 + 위험자산 70% 상한, 연금저축은 운용 자유도 높음.",
  },
  {
    question: "세액공제율 16.5% vs 13.2%는?",
    answer:
      "연봉 5,500만원 이하: 16.5% (지방세 포함, 소득세 15% + 지방세 1.5%). 5,500만 초과: 13.2% (12% + 1.2%). 900만원 풀 납입 시 환급액 최대 148.5만원(저소득) 또는 118.8만원(고소득). 매년 동일하게 받을 수 있어 30년 누적 3,500~4,500만원.",
  },
  {
    question: "55세 전 인출하면 어떻게 되나요?",
    answer:
      "기타소득세 16.5% 일시 부과 + 그동안 받았던 세액공제 모두 환수. 예) 매년 900만원 5년간 납입 → 환급 약 594만원 받았다면 모두 토해내야. 의료·재해·주택구입(생애최초) 등 법정 사유 외에는 절대 인출 금지. 가입 전 5년 이상 자금 여유 필수.",
  },
  {
    question: "IRP 안전자산 30%는 어떻게?",
    answer:
      "예금·국채·우량 회사채·TDF의 채권 부분이 안전자산. 위험자산(주식형 펀드·ETF)은 70%까지만. TDF(타겟데이트펀드)는 만기에 가까울수록 자동으로 채권 비중이 늘어나 30% 의무를 자연 충족. 운용 모르면 TDF 일임 추천.",
  },
  {
    question: "연 900만원 전부 IRP에 넣어야 하나요?",
    answer:
      "꼭 그럴 필요 없습니다. (1) IRP 단독 900만 풀 활용, (2) 연금저축 600만 + IRP 300만 분산, (3) 연금저축 900만 + IRP 별도(세액공제 한도 외) 등 자유. 한도 합산이 900만이므로 어느 계좌에 얼마를 넣든 환급액 동일. 다만 IRP는 안전자산 30% 의무 vs 연금저축은 자유.",
  },
  {
    question: "운용 수익에도 세금이 부과되나요?",
    answer:
      "IRP·연금저축 계좌 내 운용 수익은 인출 시점까지 과세이연(세금 부과 연기). 일반 펀드 대비 복리 효과 극대화. 만 55세 이후 연금 수령 시 연금소득세 3.3~5.5% (저세율). 일시 수령 시 기타소득세 16.5% (불리).",
  },
  {
    question: "퇴직금을 IRP로 옮기는 게 유리한가요?",
    answer:
      "거의 항상 유리. 퇴직 시 일시 수령은 퇴직소득세 5~10% 일시 부과, IRP 이전 후 만 55세부터 연금 수령 시 연금소득세 3.3~5.5% 적용 → 평균 50~70% 세금 절감. 또한 IRP 내 추가 운용 수익도 과세이연.",
  },
  {
    question: "맞벌이 부부는 각자 900만 가능?",
    answer:
      "네, 각자 본인 명의 계좌로 각자 900만원 한도 적용. 부부 합산 1,800만원까지 가능. 다만 본인 소득 기준 세액공제율 적용 (배우자 소득 합산 X). 부부 모두 5,500만 이하면 합산 환급 297만원, 모두 초과면 237.6만원.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "본인 연봉으로 환급률 확인",
    text: "5,500만 이하 16.5% / 초과 13.2%. 본인 연봉을 입력해 정확한 환급률을 계산.",
  },
  {
    name: "납입 한도 설정",
    text: "IRP+연금저축 합산 연 900만원이 세액공제 한도. 추가 납입은 가능하지만 공제 X.",
  },
  {
    name: "환급액 시뮬",
    text: "납입액 × 환급률 = 연 환급액. 매년 동일하므로 30년 누적은 곱셈으로.",
  },
  {
    name: "운용 수익 과세이연 효과",
    text: "계좌 내 수익은 인출 시까지 과세 X. 일반 펀드 대비 복리 효과.",
  },
  {
    name: "55세 이후 연금 수령 계획",
    text: "10년 이상 분할 수령 시 연금소득세 3.3~5.5% 저세율 적용. 일시 수령은 기타세 16.5%.",
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
              "IRP·연금저축 납입액으로 연 환급액과 노후 자산 시뮬을 즉시 계산.",
            url: "/tools/finance/irp",
          }),
          autoBreadcrumbLd("/tools/finance/irp", {
            leafName: "IRP·연금저축 계산기",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "IRP·연금저축 세액공제 활용 5단계",
            description:
              "본인 연봉 기준 환급률 확인부터 노후 연금 수령까지 5단계 전략.",
            steps: HOW_TO_STEPS,
            totalTime: "PT3M",
          }),
        ]}
      />

      <main className="min-h-screen bg-canvas pb-20 pt-24 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
              <PiggyBank size={12} aria-hidden /> 연 900만 한도·최대 148.5만 환급
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-3">
              IRP·연금저축 계산기
            </h1>
            <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-xl mx-auto">
              연봉별 환급률 자동 적용 + 노후 자산 누적 시뮬 + 운용 수익 과세이연
              효과까지.
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

          <article className="prose prose-sm sm:prose-base max-w-none mb-10">
            <h2 className="text-xl font-black text-navy mt-8 mb-4">
              연봉별 환급액 — 매년 받는 13월 보너스
            </h2>
            <ul className="space-y-1 text-muted-blue leading-relaxed">
              <li>
                • <strong>연봉 4,000만</strong> + 900만 납입 = 148.5만 환급
              </li>
              <li>
                • <strong>연봉 5,500만</strong> + 900만 = 148.5만 (마지막 구간)
              </li>
              <li>
                • <strong>연봉 7,000만</strong> + 900만 = 118.8만 (13.2%)
              </li>
              <li>
                • <strong>연봉 1억</strong> + 900만 = 118.8만 (13.2%)
              </li>
              <li>
                • <strong>30년 누적 (매년)</strong> = 약 3,500~4,500만원
              </li>
            </ul>

            <h2 className="text-xl font-black text-navy mt-8 mb-4">
              과세이연의 진짜 가치
            </h2>
            <p className="text-muted-blue leading-relaxed">
              일반 펀드는 매년 운용 수익에 15.4% 배당소득세. IRP·연금저축은
              인출 시까지 0% (과세이연). 30년 운용 시 같은 7% 수익률이라도 일반
              펀드 대비 IRP가 약 25~30% 더 큰 만기 자산을 보장합니다. 단순 환급
              + 과세이연의 복리 효과 = IRP의 진짜 가치.
            </p>

            <h2 className="text-xl font-black text-navy mt-8 mb-4">
              주의 — 55세 전 인출은 절대 금지
            </h2>
            <p className="text-muted-blue leading-relaxed">
              기타소득세 16.5% + 그동안 받은 세액공제 환수. 예) 5년 납입 후 인출
              시 약 600~750만원 페널티. 비상 자금이 필요하면 일반 적금이나
              CMA에서. IRP는 절대 손대지 않는 '잠긴 자금'으로만 활용.
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
            </p>
          </div>

          <RelatedCalculators currentPath="/tools/finance/irp" />
        </div>
      </main>
    </>
  );
}
