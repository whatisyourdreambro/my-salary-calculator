
import type { Metadata } from "next";
import Link from "next/link";
import { PiggyBank, ShieldCheck, TrendingUp, HelpCircle } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata: Metadata = {
  title: "연금저축펀드 vs IRP, 나에게 맞는 선택은? (세액공제 혜택 200% 활용)",
  description:
    "노후 준비와 절세를 동시에! 연금저축펀드와 IRP(개인형 퇴직연금)의 차이점, 세액공제 혜택, 투자 가능 상품, 중도 인출 조건까지 상세히 비교 분석합니다. 당신의 노후를 위한 최적의 연금 상품을 찾아보세요.",
  openGraph: {
    title: "연금저축펀드 vs IRP, 나에게 맞는 선택은? (세액공제 혜택 200% 활용)",
    description:
      "연금저축과 IRP, 헷갈리시나요? 당신의 노후를 위한 현명한 선택을 돕는 가이드.",
    images: ["/api/og?title=연금저축 vs IRP, 나에게 맞는 연금은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연금저축펀드 vs IRP, 나에게 맞는 선택은? (세액공제 혜택 200% 활용)",
  author: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-10-28",
  dateModified: currentDate,
  description:
    "연금저축펀드와 IRP(개인형 퇴직연금)의 차이점, 세액공제 혜택, 투자 가능 상품, 중도 인출 조건까지 상세히 비교 분석합니다. 당신의 노후를 위한 최적의 연금 상품을 찾아보세요.",
};

export default function PensionSavingsVsIrpGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연금저축펀드 vs IRP,
            <br /> 나에게 맞는 선택은?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            노후 준비와 절세를 동시에 잡는 두 마리 토끼, 연금저축펀드와 IRP. 헷갈리는 두 상품의 차이점을 명확히 이해하고, 당신의 재정 상황에 맞는 최적의 선택을 하세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연금저축펀드와 IRP(개인형 퇴직연금)는 대표적인 사적 연금 상품으로, 노후 대비와 함께 연말정산 시 세액공제 혜택을 받을 수 있어 많은 직장인들에게 필수적인 재테크 수단으로 꼽힙니다. 하지만 두 상품은 가입 대상, 세액공제 한도, 투자 가능 상품, 중도 인출 조건 등에서 차이가 있어 자신의 상황에 맞는 상품을 선택하는 것이 중요합니다. 이 가이드를 통해 연금저축펀드와 IRP의 모든 것을 비교 분석하고, 당신의 노후를 위한 현명한 선택을 하세요.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                연금저축 & IRP, 왜 필수일까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>세액공제 혜택:</strong> 연말정산 시 납입액에 대해 최대 900만원까지 세액공제 혜택을 받을 수 있어, 연봉에 따라 최대 148.5만원의 세금을 돌려받을 수 있습니다.
                </li>
                <li>
                  <strong>노후 대비:</strong> 은퇴 후 안정적인 생활을 위한 중요한 노후 자금 마련 수단입니다.
                </li>
                <li>
                  <strong>과세 이연 효과:</strong> 운용 수익에 대해 당장 세금을 내지 않고, 연금 수령 시점에 낮은 연금소득세율로 과세되어 복리 효과를 극대화할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <HelpCircle className="w-7 h-7 text-green-500" />
                연금저축펀드 vs IRP, 한눈에 비교하기
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">연금저축펀드</th>
                      <th className="py-3 px-4 font-bold text-orange-500">IRP (개인형 퇴직연금)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">가입 대상</td>
                      <td className="py-4 px-4">제한 없음 (소득 있는 누구나)</td>
                      <td className="py-4 px-4">소득 있는 취업자 (공무원, 자영업자 포함)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">세액공제 한도</td>
                      <td className="py-4 px-4">연 600만원 (총급여 1.2억원 초과 시 300만원)</td>
                      <td className="py-4 px-4">연 900만원 (연금저축 포함)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">투자 가능 상품</td>
                      <td className="py-4 px-4">펀드, ETF, 리츠 등 (원금 비보장)</td>
                      <td className="py-4 px-4">펀드, ETF, 리츠, 예금, ELS 등 (원금 보장 상품 가능)</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">중도 인출</td>
                      <td className="py-4 px-4">자유롭게 인출 가능 (단, 세액공제 받은 금액은 기타소득세 16.5% 부과)</td>
                      <td className="py-4 px-4">법정 사유 외 인출 제한 (세액공제 받은 금액은 기타소득세 16.5% 부과)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 내용은 2025년 세법 기준으로, 향후 변경될 수 있습니다.</p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 나에게 맞는 연금 상품 선택 가이드
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>투자 초보자 또는 안정적인 운용 선호:</strong> IRP의 예금 등 원금 보장 상품을 활용하거나, 연금저축펀드의 채권형 펀드 등을 고려할 수 있습니다.
                </li>
                <li>
                  <strong>적극적인 투자자:</strong> 연금저축펀드와 IRP 모두 ETF 등 다양한 투자 상품을 활용하여 공격적인 운용이 가능합니다. 다만, IRP는 위험자산 투자 비중 제한(70%)이 있습니다.
                </li>
                <li>
                  <strong>자발적 퇴사 후 퇴직금 운용:</strong> 퇴직금을 IRP 계좌로 이전하면 퇴직소득세 납부를 유예하고, 연금 수령 시 세금 감면 혜택을 받을 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                당신의 노후, 지금부터 준비하세요!
              </h2>
              <p>
                연금저축과 IRP는 당신의 노후를 든든하게 지켜줄 최고의 파트너입니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 노후 준비를 시작하세요.
              </p>
              <Link
                href="/fire-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                파이어(FIRE) 계산기로 은퇴 자금 예측하기 🔥
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
