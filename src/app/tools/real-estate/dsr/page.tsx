import type { Metadata } from "next";
import Link from "next/link";
import DsrCalculator from "@/components/calculators/real-estate/DsrCalculator";
import JsonLd from "@/components/JsonLd";
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
  tagline: "총부채원리금상환비율 40% 한도 자동 산정",
  description:
    "DSR(총부채원리금상환비율) 계산기. 연봉과 모든 대출(주담대·신용·전세·카드론·자동차할부)의 월 상환액으로 본인 DSR을 즉시 계산하고 40% 규제 한도 확인. 추가 대출 가능 금액까지.",
  path: "/tools/real-estate/dsr",
  keywords: [
    "DSR 계산기",
    "DSR 40%",
    "총부채원리금상환비율",
    "대출 한도 DSR",
    "DSR 규제",
    "내 DSR",
    "스트레스 DSR",
    "주담대 DSR",
    "신용대출 DSR",
    "DSR 초과",
  ],
});

const FAQ_ITEMS = [
  {
    question: "DSR이 정확히 무엇인가요?",
    answer:
      "DSR(Debt Service Ratio, 총부채원리금상환비율)은 본인 연소득 대비 모든 대출의 연간 원리금 상환액 비율입니다. 2026년 기준 한국은 DSR 40%를 규제 상한으로 두어, 모든 대출의 연 원리금 합계가 연봉의 40%를 넘으면 추가 대출이 어렵습니다. 예) 연봉 5천만원 → 월 약 167만원이 모든 대출 상환액 상한.",
  },
  {
    question: "어떤 대출이 DSR에 포함되나요?",
    answer:
      "(1) 주택담보대출, (2) 신용대출, (3) 카드론·현금서비스, (4) 자동차할부·리스, (5) 전세대출 (2024년 이후 점진 포함), (6) 학자금대출, (7) P2P 대출 등 모든 금융권 대출. 다만 정책 상품 일부(디딤돌·보금자리론 일부)는 별도 예외 적용. 단, 마이너스통장(한도)은 사용액 기준이 아닌 한도의 일정 비율 적용.",
  },
  {
    question: "DSR 40%를 넘으면 절대 대출 못 받나요?",
    answer:
      "원칙적으로 신규 대출 거부. 다만 (1) 기존 대출 일부 상환 → DSR 낮춤, (2) 소득 인상 후 재신청, (3) 정책 상품(디딤돌·생애최초) 활용, (4) 일부 예외 상품 (햇살론 등) 검토가 옵션. 즉시 해결은 어렵고 최소 3~6개월 준비 기간 필요.",
  },
  {
    question: "DSR과 LTV는 어떻게 다른가요?",
    answer:
      "DSR은 소득 대비 상환액 비율(연봉 기준), LTV는 담보 가치 대비 대출액 비율(주택가 기준). 주담대 한도는 두 규제 중 더 작은 값. 실제로는 DSR이 더 빡빡한 경우가 많아 본인 연봉이 사실상의 결정 요인. LTV는 70%여도 DSR 40%로 잘리면 그 한도가 적용.",
  },
  {
    question: "스트레스 DSR이 뭔가요?",
    answer:
      "변동·혼합금리 대출의 미래 금리 인상 위험을 미리 DSR 계산에 반영. 2026년 기준 1단계: 변동 +0.38%p, 혼합 +0.75%p 가산금리 적용. 즉 명목 금리 4%여도 DSR 계산은 4.38%로 → 한도 축소. 고정금리는 가산 없음. 변동금리 한도가 점점 줄어드는 추세.",
  },
  {
    question: "DSR 계산 시 신용대출은 30년 분할 계산?",
    answer:
      "신용대출은 단기상품(통상 1년 만기 연장)이지만 DSR 계산 시에는 10년 분할 상환 기준으로 환산. 예) 신용대출 5천만원 4% → 월 약 50.6만원 (10년 원리금균등). 카드론은 더 짧은 기간 적용 (5~7년). 마이너스통장은 한도의 평균 사용액 또는 한도의 일정 비율로 환산.",
  },
  {
    question: "DSR 낮추는 방법은?",
    answer:
      "(1) 기존 대출 일부 상환 (가장 효과 빠름), (2) 마이너스통장 한도 축소, (3) 카드론·현금서비스 정리, (4) 자동차 할부 조기상환, (5) 신용대출 기간 연장으로 월 상환액 감축. 3~6개월 준비 후 재신청 시 한도 회복.",
  },
  {
    question: "맞벌이 부부는 DSR 합산?",
    answer:
      "기본은 차주(대출 신청자) 본인 소득 기준. 다만 공동명의 또는 배우자 추가소득 합산 신청 시 부부합산 소득 기준 가능 (일부 상품). 부부합산은 한도↑지만 대출도 부부 공동 책임 → 신중 결정. 디딤돌·보금자리는 부부합산 소득 요건.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "본인 연봉 입력",
    text: "세전 연봉을 입력. 부부합산 신청 시 합산 가능.",
  },
  {
    name: "기존 모든 대출 월 상환액 합산",
    text: "주담대·신용대출·전세대출·카드론·자동차할부 등 모든 금융권 대출의 월 상환액 합계.",
  },
  {
    name: "추가 대출 시 예상 월 상환액",
    text: "신규 대출의 월 상환액(원리금균등 기준)을 추가.",
  },
  {
    name: "DSR % 자동 계산",
    text: "(연 원리금 / 연봉) × 100. 40% 이하면 추가 대출 가능 영역.",
  },
  {
    name: "한도 초과 시 대응",
    text: "기존 대출 정리 → 신용대출 기간 연장 → 정책 상품 활용 순으로 검토.",
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
              "DSR(총부채원리금상환비율) 40% 한도를 연봉과 대출 상환액으로 자동 계산.",
            url: "/tools/real-estate/dsr",
          }),
          autoBreadcrumbLd("/tools/real-estate/dsr", {
            leafName: "DSR 계산기",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "DSR 계산하는 방법",
            description:
              "본인 연봉과 모든 대출 월 상환액으로 DSR % 산출, 추가 대출 가능 영역 확인까지 5단계.",
            steps: HOW_TO_STEPS,
            totalTime: "PT3M",
          }),
        ]}
      />

      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
            <Percent size={12} aria-hidden /> 2026 DSR 40% 규제
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-3">
            DSR 계산기
          </h1>
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-xl mx-auto">
            총부채원리금상환비율 — 연봉 대비 모든 대출 상환액 비율로 본인 대출
            가능 영역을 즉시 확인하세요.
          </p>
        </header>

        <DsrCalculator />

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

        <article className="prose prose-sm sm:prose-base max-w-none mb-10">
          <h2 className="text-xl font-black text-navy mt-8 mb-4">
            DSR 한도 시뮬 — 연봉별
          </h2>
          <ul className="space-y-1 text-muted-blue leading-relaxed">
            <li>
              • <strong>연봉 3,000만원</strong> → 월 상환 한도 약 100만원
            </li>
            <li>
              • <strong>연봉 5,000만원</strong> → 약 167만원
            </li>
            <li>
              • <strong>연봉 8,000만원</strong> → 약 267만원
            </li>
            <li>
              • <strong>연봉 1억원</strong> → 약 333만원
            </li>
            <li>
              • <strong>연봉 1.5억원</strong> → 약 500만원
            </li>
          </ul>

          <h2 className="text-xl font-black text-navy mt-8 mb-4">
            DSR 초과를 막는 3가지 사전 준비
          </h2>
          <ol className="space-y-1 text-muted-blue leading-relaxed">
            <li>
              1. <strong>주담대 신청 6개월 전 신용대출 정리</strong> — 마이너스
              통장 한도 축소, 카드론 우선 상환
            </li>
            <li>
              2. <strong>변동 vs 고정금리 선택</strong> — 스트레스 DSR 가산금리
              차이로 한도 5~15% 변동
            </li>
            <li>
              3. <strong>부부합산 소득 활용</strong> — 디딤돌·보금자리 등 정책
              상품 또는 공동명의 신청
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
              실제 DSR은 은행별 대출 환산 방식(신용대출 10년 분할, 마이너스 통장
              한도 비율 등)과 상품별 적용 예외에 따라 다소 다를 수 있습니다.
              정확한 한도는 은행 사전 상담 권장.
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
              DSR/LTV·월 상환액·시나리오 종합
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
              담보 한도
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
            본 계산기는 2026 DSR 40% 규제 + 일반적 대출 환산 방식 기준 추정치.
            정책 상품·은행별 특례·신용 등급에 따라 실제 한도가 다를 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
