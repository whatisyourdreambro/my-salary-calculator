import type { Metadata } from "next";
import Link from "@/components/AppLink";
import HomeLoanSimulator from "@/components/HomeLoanSimulator";
import RelatedCalculators from "@/components/RelatedCalculators";
import PageFooterAds from "@/components/PageFooterAds";
import { CalcResultAd, GuideMidAd, MultiplexAd } from "@/components/AdPlacement";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
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
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: "주택담보대출 계산기 2026 | 월 상환액·총 이자 비교",
  description:
    "주택 가격·자기 자본·대출금리·기간으로 원리금균등과 원금균등의 월 상환액·총 이자를 비교하세요. 기준금리와 대출금리의 차이, 별도로 확인할 DSR·LTV 심사 기준도 안내합니다.",
  path: "/home-loan",
  ogType: "article",
  publishedTime: "2026-05-23",
  modifiedTime: "2026-09-10",
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
    "기준금리 인상",
    "금리 인상 주담대",
    "금리 인상 이자 부담",
  ],
});

// 아래 수치는 원리금균등 공식 M = P·r·(1+r)^n / ((1+r)^n − 1), r=연이율/12, n=360으로
// node 실계산해 검증한 값 (2026-07-16). 연 4.00%→4.25%는 이해를 돕기 위한 가정 예시.
const RATE_HIKE_ROWS = [
  {
    principal: "2억원",
    before: "954,831원",
    after: "983,880원",
    monthlyDiff: "+29,049원",
    totalDiff: "약 1,046만원",
  },
  {
    principal: "3억원",
    before: "1,432,246원",
    after: "1,475,820원",
    monthlyDiff: "+43,574원",
    totalDiff: "약 1,569만원",
  },
  {
    principal: "5억원",
    before: "2,387,076원",
    after: "2,459,699원",
    monthlyDiff: "+72,623원",
    totalDiff: "약 2,614만원",
  },
];

const FAQ_ITEMS = [
  {
    question: "주택담보대출 한도는 어떻게 결정되나요?",
    answer:
      "LTV·DSR 외에도 주택 소재지·가격·보유 주택 수·대출 목적·금융기관 심사와 별도 금액 한도가 영향을 줍니다. 이 계산기는 입력한 원금의 상환액을 계산하며 승인 한도를 판정하지 않습니다. 연결된 DSR 계산기는 연소득·연간 원금·연간 이자를 입력하는 단순 비율 도구입니다. 승인 한도는 금융기관에서 확인하세요.",
  },
  {
    question: "DSR 40%를 적용한다면 어떻게 계산하나요?",
    answer:
      "심사에 쓰는 연소득이 5,000만원이고 DSR 상한을 40%로 적용한다는 가정이면, 산입 대상 대출의 연간 원리금 한도는 2,000만원입니다. 모든 대출을 같은 방식으로 합산하는 것은 아닙니다. 대출별 산입·제외 기준, 스트레스 금리와 심사상 만기를 확인해야 합니다.",
  },
  {
    question: "LTV 70%인데 왜 한도가 더 적게 나오나요?",
    answer:
      "LTV로 계산한 금액은 여러 제한 중 하나입니다. DSR에 따른 상환 능력, 지역·주택 가격에 따른 금액 제한, 금융기관 심사 때문에 더 적게 나올 수 있습니다. 생애최초나 정책 상품도 모든 경우에 같은 LTV를 적용하는 것은 아닙니다.",
  },
  {
    question: "원리금균등 vs 원금균등, 어느 쪽이 유리한가요?",
    answer:
      "같은 원금·금리·기간을 유지하면 원리금균등은 매월 원리금이 일정하고, 원금균등은 첫 달 부담이 크지만 점차 줄어들며 총 이자가 적습니다. 5억원·연 4%·30년 가정의 총 이자는 각각 약 3.59억원과 3.01억원입니다. 수수료·금리 변경·중도상환은 제외한 비교입니다.",
  },
  {
    question: "스트레스 DSR이 뭔가요?",
    answer:
      "미래 금리 상승에 따른 상환 부담을 대출 한도 심사에 반영하는 제도입니다. 심사용 스트레스 금리는 실제 납부하는 약정금리에 그대로 더하는 금리가 아닙니다. 적용 지역·대출 종류·금리 구조·실행 시점에 따라 기준이 다르므로, 이 페이지의 상환 계산과 구분해 확인하세요.",
  },
  {
    question: "전세대출도 DSR에 포함되나요?",
    answer:
      "모든 전세대출이 일괄 포함되는 것은 아닙니다. 금융위원회 2025년 10월 대책 문답은 1주택자의 수도권·규제지역 전세대출에 이자상환분을 반영하며 정책 목적 대출, 기존 계약 연장 등의 예외를 구분합니다. 아래 공식 문답과 실행일의 은행 기준으로 본인 조건을 확인하세요.",
  },
  {
    question: "신혼부부·생애최초 우대 한도는?",
    answer:
      "상품마다 소득·자산·주택 가격·지역·혼인·보유 이력과 한도가 다릅니다. 보금자리론은 별도의 LTV·DTI 및 상품 한도 기준을 안내합니다. 계산기에서 신혼부부·생애최초를 선택해도 자격을 확정하거나 금리를 자동 할인하지 않습니다. 공식 심사 후 안내받은 금리를 직접 입력하세요.",
  },
  {
    question: "원금 상환 미루는 거치기간이 있나요?",
    answer:
      "거치 가능 여부와 기간은 상품 약정에 따라 다릅니다. 이 계산기는 거치 없이 첫 달부터 원금을 갚는 조건입니다. 거치형 상품은 거치 중 이자와 거치 종료 후 상환액을 금융기관 상환 일정표로 따로 확인하세요.",
  },
  {
    question: "중도상환수수료는 얼마나 나오나요?",
    answer:
      "취급 시점·상품·잔여 기간·면제 약정에 따라 달라집니다. 이 계산기의 총 이자에는 중도상환수수료가 포함되지 않습니다. 갈아타기 전에는 금융기관이 제시한 실제 수수료와 새 대출의 비용을 함께 비교하세요.",
  },
  {
    question: "금리 인하 요구권은 언제 사용 가능?",
    answer:
      "소득이나 신용 상태가 개선됐다면 이용 중인 금융기관에 신청 대상인지 확인할 수 있습니다. 신용 상태가 금리에 영향을 주지 않는 상품은 대상에서 제외될 수 있고, 신청해도 인하가 보장되지는 않습니다. 실제 인하 금리를 안내받은 뒤 남은 원금과 기간으로 다시 비교하세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "본인 연봉·기존 부채 확인",
    text: "은행이 인정하는 소득과 기존 대출 종류·잔액·상환액을 정리합니다. 이 계산기의 소득 대비 상환 비율은 DSR 심사 결과가 아닙니다.",
  },
  {
    name: "주택 가격·자기자본 입력",
    text: "주택 가격에서 자기 자본을 뺀 금액이 필요 대출액입니다. 이 원금을 빌릴 수 있는지는 LTV 등 승인 한도 심사로 따로 확인합니다.",
  },
  {
    name: "금리·기간 시뮬레이션",
    text: "은행이 안내한 대출금리와 가능한 기간을 입력합니다. 금리를 바꾸어 비교할 때는 다른 조건을 동일하게 유지하세요.",
  },
  {
    name: "원리금·원금균등 비교",
    text: "두 방식의 월 상환액과 총 이자를 비교합니다. 원금균등 방식의 월 상환액은 첫 달 금액이며 이후 줄어듭니다.",
  },
  {
    name: "한도·상환 부담 검증",
    text: "연결된 DSR 계산기로 연소득 대비 연간 원리금의 비율을 살펴보고 승인 한도는 은행에서 따로 확인합니다. 생활비·비상자금·주택 취득 비용도 자금 계획에 포함하세요.",
  },
];

const SCENARIOS = [
  {
    title: "연봉 5천만원 + 3억 주택",
    detail:
      "자기자본 1억 + 대출 2억, 연 4%·30년 원리금균등 가정: 월 약 95.5만원. 세전 월소득 대비 약 22.9%이며 기존 부채와 심사용 스트레스 금리는 제외합니다.",
    color: "#10B981",
  },
  {
    title: "연봉 8천만원 + 7억 주택",
    detail:
      "자기자본 2억 + 대출 5억, 연 4%·30년 원리금균등 가정: 월 약 238.7만원. 세전 월소득 대비 약 35.8%입니다. 해당 원금을 실제로 빌릴 수 있다는 뜻은 아닙니다.",
    color: "#F59E0B",
  },
  {
    title: "연봉 1.2억 + 12억 주택",
    detail:
      "자기자본 4억 + 대출 8억, 연 4%·30년 원리금균등 가정: 월 약 381.9만원. 세전 월소득 대비 약 38.2%입니다. 지역·가격별 한도와 다른 대출을 별도 심사해야 합니다.",
    color: "#EF4444",
  },
  {
    title: "같은 원금 4억원, 금리만 비교",
    detail:
      "30년 원리금균등 가정: 연 4%이면 월 약 191.0만원, 연 4.25%이면 약 196.8만원입니다. 정책 상품의 확정 금리나 승인 한도를 제시한 예시가 아닙니다.",
    color: "#0145F2",
  },
];

const CHECKLIST = [
  "본인 연봉(세전) + 기존 모든 대출 월 상환액 정리",
  "주택 위치·가격·보유 주택 수에 따른 LTV와 별도 금액 한도 확인",
  "변동 vs 고정금리 선택 (스트레스 DSR 영향)",
  "기간 30년 vs 40년 비교 (40년은 총 이자↑)",
  "원리금균등 vs 원금균등 시뮬레이션",
  "중도상환수수료의 적용 기간·요율·면제 조건 확인",
  "신용 상태와 금융기관의 소득 인정 기준 확인",
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
              "입력한 대출금리로 원리금균등·원금균등의 월 상환액과 총 이자를 비교하는 계산기. 승인 한도 심사는 별도입니다.",
            url: "/home-loan",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "주택담보대출 월 상환액 계산과 별도 심사 확인 방법",
            description:
              "주택 가격·자기 자본·금리·기간으로 상환액을 비교하고 승인 한도는 금융기관에서 따로 확인하는 5단계.",
            steps: HOW_TO_STEPS,
            totalTime: "PT5M",
          }),
        ]}
      />

      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
          <Home size={12} aria-hidden /> 입력한 대출금리로 상환액 비교 · 2026
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-navy mb-4">
          주택담보대출 <span className="text-electric">계산기</span>
        </h1>
        <p className="text-base lg:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
          주택 가격과 자기 자본, 대출금리를 넣어 월 상환액·총 이자를 비교하세요.
          DSR·LTV에 따른 승인 한도는 별도로 확인해야 합니다.
        </p>
        <p className="mt-3 text-xs text-faint-blue">내용·계산 기준 확인: <time dateTime="2026-09-09">2026년 9월 9일</time></p>
      </header>

      <HomeLoanSimulator />

      {/* 계산 결과 직하 광고 — 하단 PageFooterAds 와는 본문 섹션들로 간격 확보 */}
      <CalcResultAd />

      {/* 최신 발표와 사용자가 입력할 대출금리를 구분 */}
      <section className="mt-12 mb-12">
        <h2 className="text-2xl font-black text-navy mb-5 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-electric" aria-hidden />
          기준금리 3.00%와 내 대출금리는 어떻게 다를까요?
        </h2>
        <div className="rounded-2xl bg-white border border-canvas-200 p-6">
          <p className="text-sm text-muted-blue leading-relaxed mb-4">
            한국은행은 2026년 8월 27일 기준금리를 연 2.75%에서{" "}
            <strong className="text-navy">3.00%로 조정</strong>했습니다.{" "}
            <a href="https://www.bok.or.kr/portal/bbs/P0000559/view.do?depth=201150&menuNo=200690&nttId=11064191" target="_blank" rel="noopener noreferrer" className="text-electric underline">한국은행 8월 통화정책방향</a>
            에서 발표를 확인할 수 있습니다. 이 기준금리는 개별 은행이 제시하는 주택담보대출 금리와 다릅니다.
          </p>
          <p className="text-sm text-muted-blue leading-relaxed mb-2">
            실제 대출금리는 상품의 지표금리·가산금리·우대 조건·재산정 주기에 따라 달라집니다. 아래는 30년
            원리금균등 기준, 금리가 0.25%p 오를 때(예: 연 4.00%→4.25% 가정)의
            변화입니다.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-canvas-200">
                  <th className="py-3 px-2 text-left text-navy font-bold">
                    대출 원금
                  </th>
                  <th className="py-3 px-2 text-right text-navy font-bold">
                    연 4.00% 월 상환액
                  </th>
                  <th className="py-3 px-2 text-right text-navy font-bold">
                    연 4.25% 월 상환액
                  </th>
                  <th className="py-3 px-2 text-right text-navy font-bold">
                    월 증가
                  </th>
                  <th className="py-3 px-2 text-right text-navy font-bold">
                    30년 총 이자 증가
                  </th>
                </tr>
              </thead>
              <tbody>
                {RATE_HIKE_ROWS.map((row) => (
                  <tr key={row.principal} className="border-b border-canvas">
                    <td className="py-3 px-2 font-bold text-navy">
                      {row.principal}
                    </td>
                    <td className="py-3 px-2 text-right text-muted-blue font-mono">
                      {row.before}
                    </td>
                    <td className="py-3 px-2 text-right text-muted-blue font-mono">
                      {row.after}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-electric font-mono">
                      {row.monthlyDiff}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-navy font-mono">
                      {row.totalDiff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint-blue mt-3 leading-relaxed">
            ※ 연 4.00%→4.25%는 이해를 돕기 위한 가정 예시입니다. 실제 시중
            주담대 금리는 은행·상품·신용도별로 다르며, 기준금리 인상분이
            대출금리에 그대로 반영되는 것도 아닙니다. 본인 금리 조건은 위
            계산기에 직접 입력해 비교하세요.
          </p>
          <p className="text-sm text-muted-blue leading-relaxed mt-4">
            변동금리 대출을 이용 중이라면 위 계산기에 현재 금리와 0.25%p 올린
            금리를 각각 넣어 월 상환액 변화를 확인해 보세요. 신규 대출을
            준비 중이라면 연소득과 연간 원금·이자 상환액의 비율을{" "}
            <Link
              href="/tools/real-estate/dsr"
              className="font-bold text-electric underline underline-offset-2"
            >
              DSR 비율 계산기
            </Link>
            에서 따로 계산할 수 있습니다. 이 도구는 심사용 금리를 입력받거나
            대출별 원리금을 환산하지 않으므로, 규제상 DSR과 승인 한도는 금융기관에 확인하세요.
          </p>
          <p className="text-xs text-faint-blue mt-3 leading-relaxed">
            본문은 9월 9일 확인한 공식 자료를 기준으로 수정했습니다. 이후 제도·상품 조건이 바뀌면 신청일의 공식 안내를 확인하세요.
          </p>
        </div>
      </section>

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
          연봉별 상환 부담 예시 · 대출 가능액 판정 아님
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
          ※ 모두 전 기간 동일 금리를 가정한 상환 예시입니다. 승인 여부·수수료·기존 부채·스트레스 DSR은 포함하지 않습니다.
        </p>
      </section>

      {/* 본문 중간 광고 — CalcResultAd(242행)~PageFooterAds 사이 ~390줄 무광고 구간
          해소 (2026-08-17 수익 감사, 운영자 승인). 고단가 대출 키워드 페이지.
          ★InArticleAd 금지: PageFooterAds에 이미 포함 — 같은 슬롯은 경로당 1회
          중복 방지로 하단 것이 조용히 사라져 "추가"가 아니라 "이동"이 됨. */}
      <div className="mb-12">
        <GuideMidAd />
      </div>

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
          상환액 계산과 대출 한도 심사는 다릅니다
        </h2>
        <p className="text-muted-blue leading-relaxed">
          <strong>LTV</strong>는 담보 가치에 대한 대출 비율이고, <strong>DSR</strong>은
          심사 대상 부채의 연간 원리금을 소득과 비교한 비율입니다.
          지역·주택 가격·보유 이력·상품에 따른 금액 제한과 은행 심사도 별도로 적용됩니다.
          이 페이지는 주택 가격에서 자기 자본을 뺀 원금을 빌린다는 가정으로 상환액을 보여줍니다.
          화면에 금액이 나온다고 그 원금을 대출받을 수 있는 것은 아닙니다.
        </p>

        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          스트레스 금리는 심사용, 대출금리는 납부액 계산용
        </h2>
        <p className="text-muted-blue leading-relaxed">
          스트레스 DSR은 금리가 오를 때의 상환 부담을 미리 심사하는 제도입니다.
          심사용 가산금리를 이 계산기의 실제 납부 금리에 자동으로 더하지 않습니다.
          상환액을 보려면 은행이 안내한 대출금리를 입력하세요. 연결된 DSR 도구는 연소득과
          연간 원리금의 비율만 계산하며 지역·금리 구조·심사용 만기를 자동 반영하지 않습니다.
          해당 조건의 심사상 적용은 금융기관에서 확인하세요. 전세대출도 주택 보유 수,
          지역, 신규·증액·기존 연장 여부에 따라 산입 범위가 달라질 수 있습니다.{" "}
          <a href="https://www.fsc.go.kr/po020201/85518" target="_blank" rel="noopener noreferrer">금융위원회 대책 문답의 적용 대상과 예외</a>
          를 참고하되 실제 실행일의 금융기관 안내를 확인하세요.
        </p>

        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          원리금균등 vs 원금균등 — 첫 달 부담과 총 이자 비교
        </h2>
        <p className="text-muted-blue leading-relaxed">
          5억원 30년 4% 기준 두 방식의 차이:
        </p>
        <ul className="space-y-1 text-muted-blue leading-relaxed">
          <li>
            • <strong>원리금균등</strong>: 매월 약 238.7만원 · 총 이자 약 3.59억원
          </li>
          <li>
            • <strong>원금균등</strong>: 첫 달 약 305.6만원 → 마지막 달 약 139.4만원 · 총
            이자 약 3.01억원
          </li>
          <li>
            • <strong>총 이자 차이 약 5,893만원</strong> · 전 기간 금리 동일, 수수료·중도상환 없음
          </li>
        </ul>
        <p className="text-muted-blue leading-relaxed">
          총 이자뿐 아니라 매달 유지할 수 있는 상환액을 함께 비교하세요.
          변동금리이거나 중도상환을 하면 실제 총 이자는 위 예시와 달라집니다.
        </p>

        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          금리 변경·갈아타기를 비교할 때 필요한 값
        </h2>
        <p className="text-muted-blue leading-relaxed">
          이미 갚은 원금을 제외한 잔액, 남은 기간, 실제 안내받은 새 금리를 사용하세요.
          대출을 처음 받은 금액과 최초 30년을 다시 넣으면 절감액을 과장할 수 있습니다.
          중도상환수수료와 신규 취급 비용도 별도로 반영해야 합니다.{" "}
          <Link href="/calc/loan-refinance-savings">대출 갈아타기 비교 도구</Link>에서
          조건을 비교할 수 있습니다. 금리 인하 신청의 승인·인하 폭은 보장되지 않습니다.
        </p>

        <h2 className="text-2xl font-black text-navy mt-8 mb-4">
          정책 상품은 공식 자격·금리를 확인한 뒤 계산하세요
        </h2>
        <p className="text-muted-blue leading-relaxed">
          신혼부부나 생애최초라는 조건 하나만으로 특정 상품의 자격이나 금리를 확정할 수 없습니다.
          계산기의 조건 선택은 확인할 안내를 바꾸며, 입력한 금리를 임의로 할인하지 않습니다.
        </p>
        <ul className="space-y-1 text-muted-blue leading-relaxed">
          <li>
            • <strong>상품 자격</strong>: 소득·자산·보유 주택·주택 가격 등 전체 요건을 확인하세요.
          </li>
          <li>
            • <strong>한도</strong>: 일반 은행 대출과 정책 상품의 LTV·DTI·금액 한도는 구분하세요.
          </li>
          <li>
            • <strong>금리</strong>: 우대 적용 가능 여부와 중복 제한, 실제 안내받은 적용 금리를 확인하세요.
          </li>
          <li>
            • <a href="https://www.hf.go.kr/ko/sub01/sub01_01_01.do" target="_blank" rel="noopener noreferrer">한국주택금융공사 보금자리론 공식 상품 안내</a>
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
            입력한 원금·금리·기간을 기준으로 거치 없이 상환하는 예시입니다.
            대출 승인 한도·DSR·LTV를 판정하거나 정책 우대금리를 자동 적용하지 않습니다.
            실제 금리·한도·수수료·납입일별 금액은 금융기관의 약정과 상환 일정표를 확인하세요.
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
            소득 대비 상환 비율
          </p>
          <p className="font-bold text-navy text-sm mb-1">DSR 비율 계산기</p>
          <p className="text-xs text-muted-blue mb-3">
            연소득·연간 원금·연간 이자로 비율 계산 · 승인 한도 판정 제외
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
            담보 대비 대출 비율
          </p>
          <p className="font-bold text-navy text-sm mb-1">LTV 비율 계산기</p>
          <p className="text-xs text-muted-blue mb-3">
            주택 가격과 대출 금액으로 비율 계산 · 지역별 한도 판정 제외
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
          계산 원금은 주택 가격에서 자기 자본을 뺀 금액입니다. 입력한 대출금리를
          만기까지 유지하고 거치 없이 상환하는 조건이며, DSR·LTV 승인 심사와
          우대금리 판정은 포함하지 않습니다. 실제 대출 가능액은 금융기관에 확인하세요.
        </p>
      </div>

      <PageFooterAds maxWidth="4xl" />

      <RelatedCalculators currentPath="/home-loan" />

      {/* 본문 끝 관련콘텐츠형 광고 — 관련 링크 직후, 전면 최적화 (운영자 지시 2026-09-02) */}
      <div className="my-10">
        <MultiplexAd />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <ShareSection contentType="calc_result" />
      </div>
    </main>
  );
}

// 미사용 경고 회피
void Info;
