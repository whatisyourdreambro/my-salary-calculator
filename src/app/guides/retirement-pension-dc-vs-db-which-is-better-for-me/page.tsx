
import type { Metadata } from "next";
import Link from "next/link";
import { PiggyBank, TrendingUp, UserCheck, UserPlus, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "퇴직연금 DC형 vs DB형, 당신의 선택은? (임금피크제 고려)",
  description:
    "퇴직연금, 제대로 알고 선택해야 노후가 든든합니다! DC형(확정기여형)과 DB형(확정급여형)의 차이점, 장단점, 그리고 임금피크제, 투자 성향에 맞는 최적의 선택 전략을 알려드립니다.",
  openGraph: {
    title: "퇴직연금 DC형 vs DB형, 당신의 선택은? (임금피크제 고려)",
    description:
      "퇴직연금, 더 이상 회사에 맡기지 마세요. 당신의 노후를 위한 현명한 선택을 돕는 가이드.",
    images: ["/api/og?title=퇴직연금 DC형 vs DB형, 당신의 선택은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "퇴직연금 DC형 vs DB형, 당신의 선택은? (임금피크제 고려)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-02-10",
  dateModified: currentDate,
  description:
    "DC형과 DB형 퇴직연금의 차이점, 장단점, 그리고 임금피크제, 투자 성향 등 개인의 상황에 맞는 최적의 선택 전략을 상세히 알려드립니다.",
};

export default function RetirementPensionGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            퇴직연금 DC형 vs DB형,
            <br /> 당신에게 유리한 선택은?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            직장인의 중요한 노후 자산, 퇴직연금! DC형과 DB형 중 어떤 것을 선택해야 할지 고민되시죠? 두 유형의 차이점을 명확히 이해하고, 당신의 노후를 위한 현명한 선택을 하세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              퇴직연금은 국민연금, 개인연금과 함께 직장인의 3층 연금 체계를 구성하는 중요한 노후 대비 수단입니다. 어떤 유형을 선택하느냐에 따라 당신의 노후 자산 규모가 크게 달라질 수 있으므로, 자신의 상황에 맞는 최적의 선택을 하는 것이 중요합니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Briefcase className="w-7 h-7 text-green-500" />
                DC형 vs DB형, 한눈에 비교하기
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">DB형 (확정급여형)</th>
                      <th className="py-3 px-4 font-bold text-orange-500">DC형 (확정기여형)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">퇴직급여</td>
                      <td className="py-4 px-4"><strong>정해진 금액</strong><br/>(퇴직 전 3개월 평균임금 × 근속연수)</td>
                      <td className="py-4 px-4"><strong>변동 가능 금액</strong><br/>(회사가 낸 돈 + 내 투자수익)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">운용 주체</td>
                      <td className="py-4 px-4">회사 (회사가 책임)</td>
                      <td className="py-4 px-4">나 (근로자가 직접 운용)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">투자 책임</td>
                      <td className="py-4 px-4">회사</td>
                      <td className="py-4 px-4">나</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-16">
              <h2 className="!text-2xl font-bold text-center">나에게 맞는 퇴직연금은?</h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold !mt-0 !text-xl text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <UserCheck className="w-6 h-6" /> DB형이 유리한 당신
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">안정적인 수익률을 원한다면</p>
                  <ul className="!my-4 space-y-2 text-base list-none !p-0">
                    <li className="flex items-start gap-2">✅ <span>안정성을 추구하는 <strong>보수적 투자자</strong></span></li>
                    <li className="flex items-start gap-2">✅ <span>임금 상승률이 높고, <strong>장기 근속</strong>이 예상되는 분</span></li>
                    <li className="flex items-start gap-2">✅ <span>투자에 신경 쓰고 싶지 않고, 정해진 퇴직금을 받고 싶은 분</span></li>
                  </ul>
                </div>
                <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border-2 border-orange-200 dark:border-orange-800">
                  <h3 className="font-bold !mt-0 !text-xl text-orange-700 dark:text-orange-300 flex items-center gap-2">
                    <UserPlus className="w-6 h-6" /> DC형이 유리한 당신
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">높은 수익률을 추구한다면</p>
                  <ul className="!my-4 space-y-2 text-base list-none !p-0">
                    <li className="flex items-start gap-2">✅ <span>투자에 자신 있는 <strong>적극적 투자자</strong></span></li>
                    <li className="flex items-start gap-2">✅ <span><strong>임금피크제</strong>를 앞두고 있거나, 임금 상승률이 낮은 분</span></li>
                    <li className="flex items-start gap-2">✅ <span>이직이 잦아 근속연수가 짧을 것으로 예상되는 분</span></li>
                  </ul>
                </div>
              </div>
              <blockquote className="!border-l-yellow-500 mt-8">
                <h4 className="font-bold !text-lg !mt-0">⚠️ 임금피크제 대상자라면 주목!</h4>
                <p>
                  DB형은 퇴직 직전 임금을 기준으로 퇴직금이 산정됩니다. 따라서 임금피크제로 임금이 줄어들기 시작하면 퇴직금도 함께 줄어듭니다. 임금피크제 적용 전, DC형으로 전환하거나 IRP 계좌로 받아 직접 운용하는 것이 유리합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                내 예상 퇴직금은 얼마일까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                퇴직연금 유형을 선택하기 전, 나의 예상 퇴직금 규모를 먼저 파악하는 것이 중요합니다. '퇴직금 계산기'로 간편하게 확인해보세요.
              </p>
              <Link
                href="/severance-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                퇴직금 계산기 바로가기 💼
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
