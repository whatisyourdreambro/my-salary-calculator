import type { Metadata } from "next";
import Link from "next/link";
import LtvCalculator from "@/components/calculators/real-estate/LtvCalculator";
import JsonLd from "@/components/JsonLd";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import { ArrowRight, Info, AlertTriangle, Scale } from "lucide-react";

export const metadata: Metadata = buildToolMetadata({
  name: "LTV 계산기",
  tagline: "담보인정비율 한도 자동 산정 (규제·비규제·생애최초)",
  description:
    "LTV(담보인정비율) 계산기. 주택 가격과 대출액으로 본인 LTV % 자동 산출. 규제지역 50%/비규제 70%/생애최초 80% 기준 한도 비교, DSR과의 차이까지 상세 가이드.",
  path: "/tools/real-estate/ltv",
  keywords: [
    "LTV 계산기",
    "담보인정비율",
    "LTV 한도",
    "주택담보대출 LTV",
    "규제지역 LTV",
    "생애최초 LTV 80",
    "비규제지역 LTV",
    "주담대 한도",
    "LTV DSR 차이",
    "내 LTV",
  ],
});

const FAQ_ITEMS = [
  {
    question: "LTV가 정확히 무엇인가요?",
    answer:
      "LTV(Loan to Value, 담보인정비율)는 주택 가격 대비 대출 가능 비율입니다. 예) LTV 70%는 5억 주택의 경우 3.5억까지 대출 가능. 규제지역 50%, 비규제지역 70%, 생애최초 주택구입자 80%(2025년 발표 정책 — 2026년 갱신 발표 전까지 유지 기준). 다만 LTV 한도여도 DSR이 더 작으면 DSR이 결정.",
  },
  {
    question: "규제지역과 비규제지역은 어떻게 구분되나요?",
    answer:
      "정부가 부동산 시장 과열 방지를 위해 지정하는 조정대상지역·투기과열지구·투기지역 등이 규제지역. 2026년 기준 강남3구·용산구 일부가 규제지역, 그 외 대부분 비규제. 매수 전 국토부·LH 공시 확인 필수. 규제 해제·신규 지정은 분기별 발표.",
  },
  {
    question: "생애최초 LTV 80%는 누가 받나요?",
    answer:
      "본인 또는 배우자가 생애 최초로 주택을 구입하는 경우. 주택가 5억 이하, 부부합산 연소득 6천 이하 등 요건 충족 시 LTV 80%(2025년 발표 정책 — 2026년 갱신 발표 전까지 유지 기준). DSR도 비교적 완화 적용. 신혼부부 디딤돌·보금자리론은 별도 저금리 상품 옵션.",
  },
  {
    question: "LTV와 DSR 중 어느 게 한도가 되나요?",
    answer:
      "두 규제 중 더 작은 값이 실제 한도. 일반적으로 DSR이 더 빡빡: 10억 주택 LTV 70% = 7억까지 가능하지만, 연봉 7천만원 DSR 40% 적용 시 4억 8천만원 정도가 한도. 본인 연봉이 사실상 결정 요인. LTV만 보고 한도 추정하면 실망 가능성↑.",
  },
  {
    question: "다주택자 LTV는?",
    answer:
      "2주택 이상 보유자의 추가 주택 매수 시 LTV 0~50%로 강화. 규제지역은 사실상 0%(대출 불가), 비규제도 50% 수준. 일부 정책 변경 가능성 있어 사전 확인 필수. 1주택 처분 후 매수가 일반적.",
  },
  {
    question: "전세 끼고 매수 시 LTV는?",
    answer:
      "기존 전세 보증금이 있는 주택을 매수하면 그 보증금은 대출 한도에서 차감. 예) 7억 주택, 전세 3억 → 본인 매수 시 4억만 본인 자금/대출로 충당. LTV는 7억 기준 적용. 전세 만료까지 임차인 거주 보장 필수.",
  },
  {
    question: "주거용 vs 비주거용 LTV 차이?",
    answer:
      "주거용 주택은 LTV 50~80%, 비주거용(오피스텔·상가)은 40~60% 수준. 단 오피스텔도 주거 등록 시 주택과 동일하게 처리되는 경우 있음. 거주 목적 입증 자료가 LTV 결정에 영향.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "주택 위치 확인",
    text: "매수 주택이 규제지역(강남3구 등) vs 비규제. 공시는 분기별 갱신.",
  },
  {
    name: "본인 자격 확인",
    text: "생애최초·신혼부부 등 우대 자격. 부부합산 소득·자산 요건도.",
  },
  {
    name: "주택 가격 입력",
    text: "매매가 또는 KB시세 기준. 은행은 보통 KB시세 (감정가)를 사용.",
  },
  {
    name: "원하는 대출액 입력",
    text: "필요 대출액. LTV % 자동 산출.",
  },
  {
    name: "DSR도 함께 검증",
    text: "LTV 한도 OK여도 DSR이 더 작으면 그게 한도. DSR 계산기로 추가 확인.",
  },
];

export default function LtvPage() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-24 px-4">
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "LTV 계산기",
            description:
              "LTV(담보인정비율) 한도를 주택 가격과 대출액으로 자동 계산.",
            url: "/tools/real-estate/ltv",
          }),
          autoBreadcrumbLd("/tools/real-estate/ltv", {
            leafName: "LTV 계산기",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "LTV 계산하는 방법",
            description:
              "주택 위치·본인 자격·가격·대출액 입력으로 LTV % 자동 산출, DSR과 함께 검증까지 5단계.",
            steps: HOW_TO_STEPS,
            totalTime: "PT3M",
          }),
        ]}
      />

      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
            <Scale size={12} aria-hidden /> 규제·비규제·생애최초 한눈
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-3">
            LTV 계산기
          </h1>
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-xl mx-auto">
            담보인정비율 — 주택 가격 대비 대출 가능 비율로 본인 LTV %와 한도
            확인.
          </p>
        </header>

        <LtvCalculator />

        {/* 단계별 사용법 */}
        <section className="mt-12 mb-10">
          <h2 className="text-xl font-black text-navy mb-5">LTV 계산 5단계</h2>
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
            2026 LTV 한도 — 케이스별
          </h2>
          <ul className="space-y-1 text-muted-blue leading-relaxed">
            <li>
              • <strong>규제지역 1주택 매수</strong>: LTV 50% (강남3구·용산 등)
            </li>
            <li>
              • <strong>비규제지역 1주택 매수</strong>: LTV 70% (대부분 지역)
            </li>
            <li>
              • <strong>생애최초 주택구입</strong>: LTV 80% (소득·주택가 요건 충족 시)
            </li>
            <li>
              • <strong>다주택자 추가 매수</strong>: 규제 0% / 비규제 50%
            </li>
            <li>
              • <strong>오피스텔 (주거용)</strong>: 주택과 동일 (자격 입증 시)
            </li>
          </ul>

          <h2 className="text-xl font-black text-navy mt-8 mb-4">
            LTV는 한도 1순위, DSR은 실질 한도
          </h2>
          <p className="text-muted-blue leading-relaxed">
            많은 사람이 LTV로 한도를 계산해서 매수 계획을 세우지만, 실제로는 DSR이
            더 작아서 그게 한도가 되는 경우가 많습니다. 예) 10억 주택, LTV 70% =
            7억 가능. 그러나 연봉 7천만원 DSR 40% 적용 시 30년 4% 기준 4억 8천만원
            정도가 한도. LTV는 1차 게이트, DSR이 실제 결정자입니다.
          </p>

          <h2 className="text-xl font-black text-navy mt-8 mb-4">
            정책 변경에 민감 — 분기별 확인 필수
          </h2>
          <p className="text-muted-blue leading-relaxed">
            LTV 규제는 정부 부동산 정책의 핵심 도구로 분기별 또는 더 빠르게 변경됩니다.
            규제지역 지정/해제, 생애최초 한도, 다주택자 규제 등 모두 정책 발표에
            따라 달라집니다. 매수 시점에서 최신 공시(국토부·KB부동산) 확인 필수.
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
              LTV는 정부 정책 변경에 따라 빠르게 달라집니다. 매수 시점 기준
              최신 규제 확인 필수. 실제 대출 한도는 LTV·DSR·신용 등급·은행
              심사를 종합해 결정.
            </p>
          </div>
        </div>

        {/* 관련 페이지 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          <Link
            href="/tools/real-estate/dsr"
            className="block p-5 bg-white border border-canvas-200 rounded-2xl hover:border-electric transition-colors group"
          >
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
              실질 한도
            </p>
            <p className="font-bold text-navy text-sm mb-1">DSR 계산기</p>
            <p className="text-xs text-muted-blue mb-3">
              연봉 기준 실제 한도 검증
            </p>
            <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
              DSR 계산{" "}
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                aria-hidden
              />
            </span>
          </Link>
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
              월 상환액·시나리오·체크리스트
            </p>
            <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
              주담대 시뮬{" "}
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
            본 계산기는 2026 LTV 기본 규제 기준 추정치. 정부 정책 변경·은행별
            특례·다주택자 규제 등은 별도 확인 필수.
          </p>
        </div>
      </div>
    </main>
  );
}
