
import type { Metadata } from "next";
import Link from "next/link";
import { Gem, DollarSign, ShieldCheck, LineChart } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "금 투자, 안전자산의 매력과 투자 방법: 불확실성 시대의 피난처 (2025년)",
  description:
    "불확실한 경제 상황 속에서 당신의 자산을 지키는 가장 확실한 방법, 금 투자! 금이 왜 안전자산으로 불리는지, 금 가격에 영향을 미치는 요인은 무엇인지, 그리고 실물 금, 금 ETF, 금 펀드, 금 통장 등 다양한 금 투자 방법을 상세히 알려드립니다. 당신의 포트폴리오를 든든하게 만드세요.",
  openGraph: {
    title: "금 투자, 안전자산의 매력과 투자 방법: 불확실성 시대의 피난처 (2025년)",
    description:
      "금 투자, 더 이상 어렵지 않습니다. 안전자산의 매력을 이해하고 당신의 자산을 지키세요.",
    images: ["/api/og?title=금 투자, 안전자산의 모든 것"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "금 투자, 안전자산의 매력과 투자 방법: 불확실성 시대의 피난처 (2025년)",
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
    "금이 왜 안전자산으로 불리는지, 금 가격에 영향을 미치는 요인은 무엇인지, 그리고 실물 금, 금 ETF, 금 펀드, 금 통장 등 다양한 금 투자 방법을 상세히 알려드립니다. 당신의 포트폴리오를 든든하게 만드세요.",
};

export default function GoldInvestmentGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-yellow-500 to-amber-600 dark:from-gray-900 dark:to-yellow-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            금 투자,
            <br /> 불확실성 시대의 피난처
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-amber-100 dark:text-gray-300">
            '금은 안전자산이다'라는 말, 많이 들어보셨죠? 인플레이션, 경기 침체, 지정학적 리스크 등 불확실한 경제 상황 속에서 당신의 자산을 지키는 가장 확실한 방법, 금 투자의 모든 것을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-amber-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              금은 인류 역사상 가장 오래된 화폐이자 가치 저장 수단으로, 오랜 기간 동안 안전자산으로서의 역할을 해왔습니다. 주식, 부동산 등 다른 자산 시장이 불안정할 때 금 가격은 오히려 상승하는 경향을 보여, 투자 포트폴리오의 위험을 분산하고 안정성을 높이는 데 기여합니다. 이 가이드를 통해 금 투자의 매력과 다양한 투자 방법을 파악하고, 당신의 소중한 자산을 지키는 현명한 투자자가 되세요.
            </p>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Gem className="w-6 h-6" />
                금, 왜 안전자산으로 불릴까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>인플레이션 헤지:</strong> 물가 상승으로 화폐 가치가 하락할 때, 금은 실물 자산으로서 가치를 유지하거나 상승하는 경향이 있습니다.
                </li>
                <li>
                  <strong>경기 침체 방어:</strong> 경제 위기나 경기 침체 시 투자자들이 안전한 자산을 선호하면서 금 가격이 상승하는 경향이 있습니다.
                </li>
                <li>
                  <strong>지정학적 리스크 헤지:</strong> 전쟁, 테러 등 국제 정세가 불안정할 때 투자 심리가 위축되면서 금 가격이 상승합니다.
                </li>
                <li>
                  <strong>희소성:</strong> 매장량이 한정되어 있어 희소성이 높고, 이는 금의 가치를 유지하는 중요한 요인입니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <DollarSign className="w-7 h-7 text-green-500" />
                금 투자, 다양한 방법과 장단점
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">투자 방법</th>
                      <th className="py-3 px-4 font-bold text-blue-600">장점</th>
                      <th className="py-3 px-4 font-bold text-orange-500">단점</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">실물 금 (골드바, 금화)</td>
                      <td className="py-4 px-4">실물 자산 보유, 심리적 안정감</td>
                      <td className="py-4 px-4">보관 비용, 분실 위험, 매매 시 부가가치세</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">금 통장 (골드뱅킹)</td>
                      <td className="py-4 px-4">소액 투자 가능, 편리한 매매</td>
                      <td className="py-4 px-4">예금자 보호 안됨, 환차익에 대한 배당소득세</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">금 ETF / 금 펀드</td>
                      <td className="py-4 px-4">소액 투자, 분산 투자 효과, 편리한 거래</td>
                      <td className="py-4 px-4">운용 보수 발생, 실물 금 보유 아님</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">금 선물</td>
                      <td className="py-4 px-4">레버리지 효과, 높은 수익률 기대</td>
                      <td className="py-4 px-4">높은 위험성, 전문 지식 필요</td>
                    </tr>
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 내용은 일반적인 특징이며, 개별 상품 및 시장 상황에 따라 다를 수 있습니다.</p>
            </section>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 금 투자, 이렇게 활용하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>포트폴리오 분산:</strong> 금은 다른 자산(주식, 채권)과 상관관계가 낮아 포트폴리오의 위험을 분산하는 데 효과적입니다. 전체 자산의 5~10% 정도를 금에 투자하는 것을 고려해볼 수 있습니다.
                </li>
                <li>
                  <strong>장기적인 관점:</strong> 금은 단기적인 시세 차익보다는 장기적인 관점에서 인플레이션 헤지 및 안전자산으로서의 가치를 보고 투자하는 것이 좋습니다.
                </li>
                <li>
                  <strong>환율 변동 고려:</strong> 금은 달러로 거래되므로, 환율 변동이 금 투자 수익률에 영향을 미칩니다. 환율의 움직임을 함께 고려하여 투자 전략을 세우세요.
                  <Link href="/guides/us-stock-investment-how-to-deal-with-exchange-rate-fluctuations" className="text-sm text-blue-600 hover:underline">→ 미국 주식 환율 변동 대처법 보기</Link>
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 자산을 지키는 현명한 투자자가 되세요!
              </h2>
              <p>
                금 투자는 불확실한 시대에 당신의 자산을 지키는 든든한 방패가 될 수 있습니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 투자자가 되세요.
              </p>
              <Link
                href="/guides/road-to-100m-part3-invest"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                투자 시스템 만들기 가이드 보기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
