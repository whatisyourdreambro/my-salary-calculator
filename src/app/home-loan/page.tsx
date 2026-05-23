import type { Metadata } from "next";
import Link from "next/link";
import HomeLoanSimulator from "@/components/HomeLoanSimulator";
import RelatedCalculators from "@/components/RelatedCalculators";
import PageFooterAds from "@/components/PageFooterAds";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import {
  breadcrumbLd,
  softwareApplicationLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import {
  Home,
  Calculator,
  AlertTriangle,
  Info,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: "주택담보대출 계산기 - DSR/LTV 한도·월 상환액 (2026)",
  description:
    "2026년 최신 DSR 40% 규제 반영. 주택 가격·대출 금리·기간을 입력하면 월 상환액, 총 이자, 내 연봉으로 받을 수 있는 대출 한도를 즉시 계산하세요. 원리금균등 vs 원금균등 비교까지.",
  path: "/home-loan",
  keywords: [
    "주택담보대출 계산기",
    "주담대 계산기",
    "DSR 계산기",
    "LTV 계산기",
    "주담대 한도",
    "월 상환액 계산기",
    "내 연봉 대출 한도",
    "원리금균등",
    "원금균등",
    "주담대 금리",
    "주택 구매 한도",
    "2026 주담대",
    "스트레스 DSR",
    "DSR 40%",
  ],
});

const FAQ_ITEMS = [
  {
    question: "주택담보대출 한도는 어떻게 결정되나요?",
    answer:
      "DSR(총부채원리금상환비율)과 LTV(담보인정비율) 두 가지로 결정됩니다. 2026년 기준 DSR 40%, 규제지역 LTV 50% 이내에서 더 작은 금액이 한도가 됩니다. 또한 스트레스 DSR이 추가 적용되어 변동금리 대출의 경우 가산금리(+0.5~1.5%p)를 반영해 한도가 축소될 수 있습니다.",
  },
  {
    question: "DSR 40% 규제는 무엇인가요?",
    answer:
      "총부채의 연간 원리금 상환액이 연소득의 40%를 넘지 않도록 하는 규제입니다. 예를 들어 연봉 5,000만원이면 연 2,000만원, 월 약 167만원이 모든 대출의 상환액 합계 상한입니다. 이 한도 안에 주담대·전세대출·신용대출·카드론·자동차할부까지 모두 포함됩니다.",
  },
  {
    question: "LTV 70%인데 왜 한도가 더 적게 나오나요?",
    answer:
      "LTV가 한도라도 DSR 규제가 더 엄격해 그 안에서 잘리는 경우가 많습니다. 예) 10억 주택 LTV 70% = 7억까지 가능하지만, 연봉 7천만원 DSR 40% 적용 시 30년 4% 금리 기준 월 상환 233만원 → 원금 약 4억 8천만원 정도가 한도. LTV·DSR 둘 중 작은 값이 실제 한도.",
  },
  {
    question: "원리금균등 vs 원금균등, 어느 쪽이 유리한가요?",
    answer:
      "원리금균등은 매월 상환액이 일정해 가계부 관리가 쉽지만 총 이자가 더 큽니다. 원금균등은 초기 상환액이 크고 점점 줄어들어 총 이자가 적습니다. 5억원 30년 4% 기준 원리금균등 총 이자 약 3.6억원 vs 원금균등 약 3.0억원 — 6천만원 차이. 여유자금이 있다면 원금균등 유리.",
  },
  {
    question: "스트레스 DSR이 뭔가요?",
    answer:
      "변동금리·혼합금리 대출에서 미래 금리 인상 위험을 미리 한도에 반영하는 제도. 2026년 기준 1단계 가산금리 +0.38%p (변동), +0.75%p (혼합). 단계별로 강화될 예정. 고정금리는 가산 없음. 변동금리로 대출받으려면 한도가 5~15% 축소될 수 있어 사전 확인 필요.",
  },
  {
    question: "전세대출도 DSR에 포함되나요?",
    answer:
      "2024년부터 일부 포함되기 시작했습니다. 2026년 기준 신규 전세대출은 DSR에 점진 포함 (전 금융권). 다만 이자만 상환하는 전세대출 특성상 DSR 계산식이 다소 다릅니다. 본인 케이스는 은행 사전 상담 권장.",
  },
  {
    question: "신혼부부·생애최초 우대 한도는?",
    answer:
      "생애최초 주택구입자는 LTV 80% 가능 (규제지역도). 신혼부부 디딤돌·보금자리론은 별도 저금리 상품 제공 (소득·자산 요건 충족 시). DSR 규제는 동일하게 적용되지만 정부 보증 상품은 일부 예외 적용. 본 계산기는 일반 주담대 기준이며 정책 상품은 별도 한도 적용.",
  },
  {
    question: "원금 상환 미루는 거치기간이 있나요?",
    answer:
      "주담대 거치기간은 2020년 이후 사실상 폐지(최대 1년). 원리금균등으로 곧바로 시작합니다. 거치기간이 있다고 광고하는 상품은 그 기간만큼 총 이자가 추가되니 신중 검토. 거치 종료 후 상환액이 급증할 수 있어 가계부 충격에 주의.",
  },
  {
    question: "중도상환수수료는 얼마나 나오나요?",
    answer:
      "대출 후 3년 이내 일부·전부 상환 시 부과. 통상 잔액의 1.2~1.5% 수준이지만 3년이 지나면 0원. 갈아타기·여유자금 상환 계획이 있다면 3년 차 이후가 유리. 또한 매년 잔액의 10%까지는 수수료 없이 일부 상환 가능한 옵션이 일반적.",
  },
  {
    question: "금리 인하 요구권은 언제 사용 가능?",
    answer:
      "연 1~2회, 본인의 신용 상태가 개선되었을 때(소득↑, 신용점수↑, 부채↓) 은행에 신청. 평균 0.1~0.3%p 인하 가능. 5억원 0.2%p 인하 시 30년 총 절감액 약 2,000만원. 적극 활용 권장.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "본인 연봉·기존 부채 확인",
    text: "연봉(세전), 기존 대출 월 상환액(전세대출·신용대출·카드론 포함)을 정리. DSR 계산의 기초.",
  },
  {
    name: "주택 가격·자기자본 입력",
    text: "목표 주택 가격 + 자기자본(보유 현금). 차액이 필요 대출액. 자기자본 비율에 따라 LTV가 결정.",
  },
  {
    name: "금리·기간 시뮬레이션",
    text: "현재 시장 금리(4~5% 변동, 5~6% 고정) + 기간(30년 일반, 40년 가능). 금리는 은행별 비교 필요.",
  },
  {
    name: "원리금·원금균등 비교",
    text: "월 상환액(부담), 총 이자(비용), 5~10년 잔여 원금(중도상환 대비)을 두 방식으로 비교.",
  },
  {
    name: "한도·상환 부담 검증",
    text: "DSR 40% 내 본인 한도 확인. 월 상환액이 본인 월 실수령의 30% 넘으면 부담 큼.",
  },
];

const SCENARIOS = [
  {
    title: "연봉 5천만원 + 3억 주택",
    detail:
      "자기자본 1억 + 대출 2억. 4% 30년 원리금균등 시 월 상환 약 95.5만원. DSR 22.9%로 안전 구간.",
    color: "#10B981",
  },
  {
    title: "연봉 8천만원 + 7억 주택",
    detail:
      "자기자본 2억 + 대출 5억. 4% 30년 시 월 상환 약 238.7만원. DSR 35.8%로 한계선 근접.",
    color: "#F59E0B",
  },
  {
    title: "연봉 1.2억 + 12억 주택",
    detail:
      "자기자본 4억 + 대출 8억. 4% 30년 시 월 382만원. DSR 38.2%로 거의 한도. 추가 대출 불가.",
    color: "#EF4444",
  },
  {
    title: "신혼부부 디딤돌 (저금리)",
    detail:
      "연봉 7천 + 5억 주택. 자기자본 1억 + 보금자리론 4억 2.5% 30년 시 월 158만원. 일반 대비 80만원 절약.",
    color: "#0145F2",
  },
];

const CHECKLIST = [
  "본인 연봉(세전) + 기존 모든 대출 월 상환액 정리",
  "주택 위치가 규제지역인지 확인 (LTV 50% vs 70%)",
  "변동 vs 고정금리 선택 (스트레스 DSR 영향)",
  "기간 30년 vs 40년 비교 (40년은 총 이자↑)",
  "원리금균등 vs 원금균등 시뮬레이션",
  "중도상환수수료 3년 룰 확인",
  "신용점수 점검 (NICE 800점 이상 권장)",
  "여러 은행 금리 비교 (KB·신한·우리·하나·NH·IBK)",
  "정부 정책 상품 자격 확인 (생애최초·신혼·디딤돌)",
  "주택구매 외 비용 (취득세·중개수수료·이사) 별도 준비",
];

export default function HomeLoanPage() {
  return (
    <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pt-24">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "주택담보대출 계산기", path: "/home-loan" },
          ]),
          softwareApplicationLd({
            name: "주택담보대출 계산기",
            description:
              "DSR 40%·LTV·스트레스 DSR을 반영한 2026 주담대 한도·월 상환액 계산기.",
            url: "/home-loan",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "주택담보대출 한도·월 상환액 계산하는 법",
            description:
              "본인 연봉·기존 부채부터 원리금/원금균등 비교, 한도·상환 부담 검증까지 5단계.",
            steps: HOW_TO_STEPS,
            totalTime: "PT5M",
          }),
        ]}
      />

      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
          <Home size={12} aria-hidden /> 2026 DSR/LTV 반영
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-navy mb-4">
          주택담보대출 <span className="text-electric">계산기</span>
        </h1>
        <p className="text-base lg:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
          주택담보대출 얼마나 받을 수 있을까? 월 상환액·총 이자·DSR/LTV 한도를
          한 번에 확인하고 안전한 내 집 마련을 시작하세요.
        </p>
      </header>

      <HomeLoanSimulator />

      {/* 단계별 사용법 */}
      <section className="mt-12 mb-12">
        <h2 className="text-2xl font-black text-navy mb-5 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-electric" aria-hidden />
          5단계로 따라하는 주담대 계획
        </h2>
        <div className="rounded-2xl bg-white border border-canvas-200 p-6 space-y-4">
          {HOW_TO_STEPS.map((step, i) => (
            <div key={step.name} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric flex items-center justify-center font-black text-white text-sm">
                {i + 1}
              </div>
              <div>
                <p className="font-bold text-navy text-sm mb-1">{step.name}</p>
                <p className="text-xs text-muted-blue leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 시나리오 */}
      <section className="mb-12">
        <h2 className="text-2xl font-black text-navy mb-5">
          연봉별 한도 시나리오
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderLeft: `4px solid ${s.color}` }}
            >
              <p className="font-black text-navy text-sm mb-2">{s.title}</p>
              <p className="text-xs text-muted-blue leading-relaxed">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-faint-blue mt-3">
          ※ 본인 케이스를 위 계산기로 직접 시뮬해 정확한 월 상환액·한도 확인.
        </p>
      </section>

      {/* 체크리스트 */}
      <section className="mb-12">
        <h2 className="text-2xl font-black text-navy mb-5">
          주담대 신청 전 10가지 체크리스트
        </h2>
        <div className="rounded-2xl bg-white border border-canvas-200 p-6">
          <ol className="space-y-2.5 text-sm">
            {CHECKLIST.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-md bg-electric-10 flex items-center justify-center font-black text-electric text-xs">
                  {i + 1}
                </div>
                <span className="text-muted-blue leading-relaxed pt-0.5">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 본문 — 전문성 강화 */}
      <article className="prose prose-sm sm:prose-base max-w-none mb-12">
        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          DSR 40%와 LTV — 두 규제의 의미
        </h2>
        <p className="text-muted-blue leading-relaxed">
          주담대 한도는 두 규제 중 더 작은 값으로 결정됩니다.{" "}
          <strong>LTV(담보인정비율)</strong>는 주택 가격 대비 대출 가능 비율
          (규제지역 50%, 비규제 70%, 생애최초 80%). <strong>DSR(총부채원리금상환비율)</strong>은
          연소득 대비 모든 대출의 연간 원리금 상환액 비율 상한(40%). 실제로는
          LTV는 여유롭지만 DSR이 한도가 되는 경우가 많아, 본인 연봉이 사실상의
          한도 결정 요소입니다.
        </p>

        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          스트레스 DSR — 2024년부터 단계별 강화
        </h2>
        <p className="text-muted-blue leading-relaxed">
          변동·혼합금리 대출에 미래 금리 인상 위험을 미리 반영하는 제도. 2026년
          기준 1단계가 적용되어 변동금리에 +0.38%p, 혼합금리에 +0.75%p의 가산금리가
          DSR 계산 시 적용됩니다. 단계별 강화 예정이라 변동금리 대출 한도는
          점점 줄어드는 추세. 고정금리는 가산 없음이라 한도가 더 큽니다. 다만
          고정금리는 금리 자체가 변동보다 0.3~0.5%p 높아 트레이드오프 존재.
        </p>

        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          원리금균등 vs 원금균등 — 1억원 차이의 갈림길
        </h2>
        <p className="text-muted-blue leading-relaxed">
          5억원 30년 4% 기준 두 방식의 차이:
        </p>
        <ul className="space-y-1 text-muted-blue leading-relaxed">
          <li>
            • <strong>원리금균등</strong>: 매월 약 238.7만원 (균일) · 총 이자 약 3.6억원
          </li>
          <li>
            • <strong>원금균등</strong>: 초기 약 305만원 → 말기 약 140만원 · 총
            이자 약 3.0억원
          </li>
          <li>
            • <strong>총 이자 차이 약 6,000만원</strong>
          </li>
        </ul>
        <p className="text-muted-blue leading-relaxed">
          단순 비용 측면에서 원금균등이 유리하나 초기 부담이 크다는 단점. 결혼·자녀
          출산·이직 등 가계 변동 가능성이 있다면 원리금균등 안전. 안정된 고소득자는
          원금균등으로 총 이자 절약 권장.
        </p>

        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          금리 인하 요구권 — 30년에 2,000만원 절감 가능
        </h2>
        <p className="text-muted-blue leading-relaxed">
          연 1~2회, 본인 신용 상태 개선(소득↑·신용점수↑·부채↓) 시 은행에 금리 인하
          요청 가능. 평균 0.1~0.3%p 인하. 5억원 대출 0.2%p 인하 시 30년 총 절감
          약 2,000만원. 실수령 연봉 1년치에 해당하므로 적극 활용 권장. 이직·승진
          후, 신용카드 정리 후, 다른 대출 상환 완료 후가 좋은 타이밍.
        </p>

        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          정부 정책 상품 — 저금리 + 우대 한도
        </h2>
        <p className="text-muted-blue leading-relaxed">
          소득·자산·자녀 요건 충족 시 정책 상품 활용 권장 (일반 주담대 대비
          0.5~1.5%p 저금리, 일부 우대 한도):
        </p>
        <ul className="space-y-1 text-muted-blue leading-relaxed">
          <li>
            • <strong>디딤돌대출</strong>: 부부합산 연봉 6천 이하, 주택가 5억 이하
            (2.45~3.55% 30년)
          </li>
          <li>
            • <strong>보금자리론</strong>: 부부합산 연봉 7천 이하 (3% 후반대)
          </li>
          <li>
            • <strong>버팀목·신혼희망타운</strong>: 신혼부부 특화
          </li>
          <li>
            • <strong>생애최초 LTV 80%</strong>: 첫 주택 구입 시 우대 한도
          </li>
        </ul>
      </article>

      {/* 경고 */}
      <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-amber-50 border border-amber-200">
        <AlertTriangle
          size={20}
          className="text-amber-600 flex-shrink-0 mt-1"
          aria-hidden
        />
        <div>
          <p className="font-black text-amber-900 mb-1">참고용 계산기입니다</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            본 계산기는 일반 주담대 기준 추정치이며 정책 상품·은행별 우대 금리·신용
            등급에 따라 실제 한도·금리와 차이가 있을 수 있습니다. 정확한 한도·조건은
            은행 사전 상담을 통해 확인하세요.
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
            상세 한도
          </p>
          <p className="font-bold text-navy text-sm mb-1">DSR 한도 계산기</p>
          <p className="text-xs text-muted-blue mb-3">
            연봉·기존 부채로 정확한 DSR 한도
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
          href="/tools/real-estate/ltv"
          className="block p-5 bg-white border border-canvas-200 rounded-2xl hover:border-electric transition-colors group"
        >
          <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
            담보 한도
          </p>
          <p className="font-bold text-navy text-sm mb-1">LTV 한도 계산기</p>
          <p className="text-xs text-muted-blue mb-3">
            주택가 대비 대출 한도 (규제·비규제)
          </p>
          <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
            LTV 계산{" "}
            <ArrowRight
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              aria-hidden
            />
          </span>
        </Link>
        <Link
          href="/tools/real-estate/acquisition-tax"
          className="block p-5 bg-white border border-canvas-200 rounded-2xl hover:border-electric transition-colors group"
        >
          <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
            매수 비용
          </p>
          <p className="font-bold text-navy text-sm mb-1">취득세 계산기</p>
          <p className="text-xs text-muted-blue mb-3">
            주택 매수 시 1~12% 취득세
          </p>
          <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
            취득세{" "}
            <ArrowRight
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              aria-hidden
            />
          </span>
        </Link>
        <Link
          href="/"
          className="block p-5 bg-white border border-canvas-200 rounded-2xl hover:border-electric transition-colors group"
        >
          <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
            본인 연봉
          </p>
          <p className="font-bold text-navy text-sm mb-1">연봉 실수령액</p>
          <p className="text-xs text-muted-blue mb-3">
            세후 월급으로 상환 부담 검증
          </p>
          <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
            계산하기{" "}
            <ArrowRight
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              aria-hidden
            />
          </span>
        </Link>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-2xl font-black text-navy mb-5">
          자주 묻는 질문
        </h2>
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
        <ShieldCheck
          size={18}
          className="text-electric flex-shrink-0 mt-1"
          aria-hidden
        />
        <p className="text-xs text-muted-blue leading-relaxed">
          본 계산기는 2026 DSR 40% + 스트레스 DSR 1단계 + LTV 규제지역 50%/비규제
          70% 기준 추정치입니다. 은행·상품·신용 상태별로 실제 한도·금리가 다를 수
          있어 사전 상담을 권장합니다.
        </p>
      </div>

      <PageFooterAds maxWidth="4xl" />

      <RelatedCalculators currentPath="/home-loan" />
    </main>
  );
}

// 미사용 경고 회피
void Info;
