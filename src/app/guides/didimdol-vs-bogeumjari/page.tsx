import type { Metadata } from "next";
import Link from "next/link";
import { Home, User, Wallet, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "디딤돌 vs 보금자리론, 내게 맞는 대출은? (2025년 최종 비교)",
  description:
    "내 집 마련의 첫걸음, 어떤 대출을 받아야 할까? 신혼부부, 생애최초 주택 구매자를 위한 대표 정책 대출, 디딤돌과 보금자리론의 자격 조건, 한도, 금리를 완벽 비교하고 최적의 선택을 돕습니다.",
  openGraph: {
    title: "디딤돌 vs 보금자리론, 내게 맞는 대출은? (2025년 최종 비교)",
    description:
      "내 집 마련, 어떤 대출부터 알아봐야 할까요? 두 대표 정책 대출을 완벽하게 비교해드립니다.",
    images: [
      "/api/og?title=디딤돌 vs 보금자리론, 최종 선택 가이드&description=2025년 기준 자격·한도·금리 완벽 비교",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "디딤돌 vs 보금자리론, 내게 맞는 대출은? (2025년 최종 비교)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-22",
  dateModified: "2025-09-22",
  description:
    "신혼부부, 생애최초 주택 구매자를 위한 대표 정책 대출, 디딤돌과 보금자리론의 자격 조건, 한도, 금리를 완벽 비교하고 최적의 선택을 돕습니다.",
};

export default function DidimdolVsBogeumjariPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-gray-900 dark:to-cyan-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            내 집 마련의 첫 관문
            <br /> <span className="text-cyan-200">디딤돌 vs 보금자리론</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            인생 최대의 결정, 주택 구매. 그 첫걸음을 함께할 가장 든든한 정책
            대출, 디딤돌과 보금자리론의 모든 것을 비교 분석하여 당신에게 가장
            유리한 선택지를 찾아드립니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              영끌, 줍줍... 내 집 마련의 꿈을 이루기 위한 여정은 험난합니다.
              하지만 정부가 지원하는 낮은 금리의 정책 대출을 활용한다면, 그 꿈을
              조금 더 빨리 현실로 만들 수 있습니다. 신혼부부와 생애최초 주택
              구매자를 위한 대표적인 두 상품, 디딤돌 대출과 보금자리론의 핵심
              차이점을 명확히 알아봅시다.
            </p>

            <section className="mt-12 overflow-x-auto">
              <h2 className="!text-2xl font-bold text-center">
                한눈에 보는 핵심 조건 비교 (2025년 기준)
              </h2>
              <table className="min-w-full text-center mt-4">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">구분</th>
                    <th className="py-3 px-4 font-bold text-blue-600">
                      디딤돌 대출
                    </th>
                    <th className="py-3 px-4 font-bold text-green-600">
                      보금자리론
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-4 px-4 font-semibold flex items-center justify-center gap-2">
                      <User className="w-5 h-5" />
                      소득 조건
                    </td>
                    <td>
                      부부합산 연 6천만원 이하
                      <br />
                      (생애최초/신혼/2자녀 이상은 7천)
                    </td>
                    <td>
                      부부합산 연 7천만원 이하
                      <br />
                      (신혼 8.5천, 3자녀 이상 1억)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold flex items-center justify-center gap-2">
                      <Home className="w-5 h-5" />
                      대상 주택
                    </td>
                    <td>5억원 이하</td>
                    <td>6억원 이하</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold flex items-center justify-center gap-2">
                      <Wallet className="w-5 h-5" />
                      대출 한도
                    </td>
                    <td>
                      최대 2.5억원
                      <br />
                      (생애최초 3억, 신혼/2자녀 4억)
                    </td>
                    <td>
                      최대 3.6억원
                      <br />
                      (3자녀 이상 4억)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold flex items-center justify-center gap-2">
                      <Scale className="w-5 h-5" />
                      금리
                    </td>
                    <td className="font-bold text-blue-600">
                      더 낮음 (연 2.45% ~)
                    </td>
                    <td className="font-bold text-green-600">
                      상대적으로 높음 (연 4.2% ~)
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">결론: 나에게 맞는 대출은?</h2>
              <blockquote>
                <p>
                  <strong>
                    소득과 주택 가격이 낮다면 무조건 &apos;디딤돌&apos;부터!
                  </strong>
                  <br />
                  디딤돌 대출은 보금자리론보다 소득과 주택 가격 조건이 까다로운
                  대신, 금리가 훨씬 저렴합니다. 만약 당신이 디딤돌 대출의 자격
                  요건을 충족한다면, 다른 어떤 상품보다 우선적으로 고려해야
                  합니다.
                  <br />
                  <br />
                  <strong>
                    디딤돌 조건이 안된다면 차선책으로 &apos;보금자리론&apos;을!
                  </strong>
                  <br />
                  디딤돌보다 소득과 주택 가격 조건이 넉넉한 보금자리론은 더 많은
                  사람에게 기회를 제공합니다. 시중은행 주택담보대출보다는 여전히
                  금리가 저렴하므로, 디딤돌 대출 대상이 아니라면 보금자리론을
                  알아보는 것이 현명합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                내 연봉으로 감당 가능한 월 상환액은?
              </h2>
              <p>
                어떤 대출을 선택하든, 가장 중요한 것은 나의 소득으로 감당 가능한
                범위 내에서 계획을 세우는 것입니다. DSR(총부채원리금상환비율)
                규제까지 고려한 월 상환액을 미리 계산해보세요.
              </p>
              <Link
                href="/home-loan"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                주택담보대출 계산기 바로가기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
