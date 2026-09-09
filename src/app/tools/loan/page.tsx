import LoanCalculator from "@/components/calculators/LoanCalculator";
import JsonLd from "@/components/JsonLd";
import Link from "@/components/AppLink";
import { CalcResultAd } from "@/components/AdPlacement";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import { buildPageMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 대출 이자 계산기 — 원리금균등·원금균등·만기일시 월 상환액",
 description:
 "대출 금액·연 이자율·기간을 입력하고 원리금균등·원금균등·만기일시 방식을 바꾸어 월 상환액과 총 이자를 비교하세요. 입력한 금리가 만기까지 유지되는 예시이며 수수료·거치기간·승인 한도 심사는 포함하지 않습니다.",
 path: "/tools/loan",
 ogType: "article",
 publishedTime: "2026-06-11",
 modifiedTime: "2026-09-10",
 keywords: [
 "대출 이자 계산기",
 "원리금균등 상환",
 "원금균등 상환",
 "만기일시 상환",
 "대출 월 상환액",
 "주택담보대출 이자",
 "신용대출 이자",
 "대출 총 이자",
 "대출 상환 방식 비교",
 "대출 금리 비교",
 ],
});

// 동일한 원금·기간에 두 금리를 각각 전 기간 고정한 가정 예시.
// M = P·r·(1+r)^n / ((1+r)^n − 1), r=연이율/12, n=360. 표시 금액은 원 단위 반올림.
const RATE_COMPARISON_EXAMPLE = {
 before: "1,432,246원",
 after: "1,475,820원",
 monthlyDiff: "+43,574원",
 totalInterestDiff: "약 1,569만원",
};

export default function LoanCalculatorPage() {
 return (
 <div className="min-h-screen pt-24 pb-20">
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/loan", { leafName: "대출 이자 계산기" }),
 softwareApplicationLd({
 name: "대출 이자 계산기",
 description: "입력한 원금·연 이자율·기간으로 3가지 상환 방식의 월 상환액·총 이자를 계산하는 고정 금리 가정 예시. 승인 한도 심사는 제외합니다.",
 url: "/tools/loan",
 }),
 ]}
 />
 <div className="page-width">
 <div className="text-center mb-12">
 <h1 className="text-4xl md:text-5xl font-black text-navy mb-4 tracking-tight">
 대출 이자 계산기
 </h1>
 <p className="text-lg text-muted-blue max-w-2xl mx-auto">
 대출 금액·연 이자율·기간을 넣어 월 상환액과 총 이자를 확인하세요.
 <br className="hidden sm:block" />
 같은 조건에서 원리금균등, 원금균등, 만기일시 방식을 바꾸어 비교할 수 있습니다.
 </p>
 </div>
 <LoanCalculator />

 {/* 결과 직하 광고 */}
 <CalcResultAd />

 <section className="max-w-3xl mx-auto mt-14">
 <h2 className="text-2xl font-black text-navy mb-4">
 입력한 대출금리가 달라지면 상환액은 어떻게 바뀌나요?
 </h2>
 <div className="rounded-2xl bg-white border border-canvas-200 p-6">
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 <strong className="text-navy">은행이 안내한 연 대출금리 또는 비교할 가정 금리</strong>를
 입력하세요. 이 계산기는 기준금리나 은행 상품 금리를 자동으로 가져오지 않습니다.
 입력한 금리가 만기까지 유지되고 매월 상환한다는 가정으로 계산합니다.
 </p>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 예를 들어 <strong className="text-navy">3억원·30년·원리금균등</strong>{" "}
 조건에서 연 4.00%와 연 4.25%를 각각 30년간 유지한다고 가정하면 월 상환액은{" "}
 {RATE_COMPARISON_EXAMPLE.before}과 {RATE_COMPARISON_EXAMPLE.after}로{" "}
 <strong className="text-electric">
 월 {RATE_COMPARISON_EXAMPLE.monthlyDiff}
 </strong>
 의 차이가 나고, 총 이자는 연 4.25%일 때{" "}
 <strong className="text-navy">
 {RATE_COMPARISON_EXAMPLE.totalInterestDiff}
 </strong>{" "}
 더 많습니다. 수수료·중도상환은 제외한 가상 비교이며 금리 전망이 아닙니다.
 이미 상환 중인 대출은 남은 원금과 남은 기간을 기준으로 비교하되,
 이 계산기의 기간 입력은 1~50년의 정수이므로 월 단위 잔여 기간은 별도로 확인하세요.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
 <Link
 href="/tools/real-estate/dsr"
 className="block p-4 rounded-2xl bg-canvas border border-canvas-200 hover:border-electric transition-colors"
 >
 <p className="text-sm font-bold text-navy mb-1">DSR 비율 계산기</p>
 <p className="text-xs text-muted-blue">
 연소득과 연간 원금·이자 상환액으로 비율 계산 · 승인 한도 심사 아님
 </p>
 </Link>
 <Link
 href="/home-loan"
 className="block p-4 rounded-2xl bg-canvas border border-canvas-200 hover:border-electric transition-colors"
 >
 <p className="text-sm font-bold text-navy mb-1">
 주택담보대출 계산기
 </p>
 <p className="text-xs text-muted-blue">
 주택 가격·자기 자본에서 필요한 원금을 구해 월 상환액·총 이자 비교
 </p>
 </Link>
 </div>
 </div>
 </section>
 <section className="max-w-3xl mx-auto mt-10" aria-labelledby="loan-method-faq">
 <h2 id="loan-method-faq" className="text-2xl font-black text-navy mb-4">
 대출 상환 계산 방법과 자주 묻는 질문
 </h2>
 <div className="rounded-2xl bg-white border border-canvas-200 p-6 space-y-6">
 <div>
 <h3 className="font-bold text-navy mb-2">세 상환 방식의 월 금액은 무엇을 뜻하나요?</h3>
 <p className="text-sm text-muted-blue leading-relaxed">
 원리금균등은 매월 원금과 이자를 합친 납입금이 같습니다. 원금균등은 매월 같은 원금을 갚아
 이자가 줄어들며, 요약에는 가장 큰 첫 달 납입금을 표시합니다. 만기일시는 만기 전 매월 이자만
 내고, 마지막 달에는 이자와 대출 원금 전액을 함께 갚습니다. 매월 이자만 보고 만기 부담을
 제외하지 않도록 총 상환 금액도 확인하세요.
 </p>
 </div>
 <div>
 <h3 className="font-bold text-navy mb-2">원리금균등 상환액은 어떻게 계산하나요?</h3>
 <p className="text-sm text-muted-blue leading-relaxed">
 월 이자율 r은 입력한 연 이자율(%)을 100과 12로 나눈 값이고, 전체 개월 수 n은 대출 기간(년)의
 12배입니다. 원금을 P라고 하면 매월 납입금은 P × r × (1+r)의 n제곱 ÷ ((1+r)의 n제곱 − 1)입니다.
 금리가 0%이면 원금을 전체 개월 수로 나눕니다. 계산 결과는 원 단위로 반올림해 표시합니다.
 </p>
 </div>
 <div>
 <h3 className="font-bold text-navy mb-2">은행 상환 일정표와 금액이 같나요?</h3>
 <p className="text-sm text-muted-blue leading-relaxed">
 월 이자율로 계산하는 예시여서 실제 일수·납입일·원 단위 처리 방식에 따라 차이가 날 수 있습니다.
 수수료·거치기간·중도상환·기간 중 금리 변경은 포함하지 않습니다. 실제 납부액은 금융기관의
 약정과 상환 일정표를 확인하세요.
 </p>
 </div>
 <div>
 <h3 className="font-bold text-navy mb-2">대출 가능 금액이나 DSR·LTV 승인 한도도 나오나요?</h3>
 <p className="text-sm text-muted-blue leading-relaxed">
 이 계산기는 입력한 원금을 빌렸다고 가정한 상환액을 계산하며 대출 승인 여부나 한도를 판정하지
 않습니다. DSR 비율과 LTV 등 적용 기준, 소득·담보·기존 부채에 따른 심사는 별도로 확인해야 합니다.
 </p>
 </div>
 </div>
 </section>
 </div>
 </div>
 );
}
