import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, Briefcase, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "네이버 vs 카카오 연봉, 복지, 미래: 어디가 더 좋을까? (2025년)",
  description:
    "대한민국 IT를 대표하는 두 거인, 네이버와 카카오! 신입 초봉부터 성과급, 기업문화, 복지, 그리고 미래 성장성까지. 현직자와 취준생을 위한 가장 솔직하고 현실적인 비교 분석.",
  openGraph: {
    title: "네이버 vs 카카오, 당신의 선택은? (2025년 최종 비교)",
    description:
      "연봉, 복지, 기업문화, 미래 성장성까지 완벽하게 비교해 드립니다.",
    images: [
      "/api/og?title=네이버 vs 카카오, 최종 비교&description=2025년 기준 연봉·복지·미래 완벽 분석",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "네이버 vs 카카오 연봉, 복지, 미래: 어디가 더 좋을까? (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-10-04",
  dateModified: "2025-10-04",
  description:
    "신입 초봉부터 성과급, 기업문화, 복지, 미래 성장성까지. 현직자와 취준생을 위한 가장 솔직하고 현실적인 비교 분석.",
};

export default function NaverVsKakaoPage() {
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
        <div className="w-full bg-gradient-to-br from-green-500 to-yellow-500 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            네이버 vs 카카오
            <br /> <span className="text-green-200">당신의 선택은?</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-200 dark:text-gray-300">
            개발자들의 영원한 고민, &apos;초록 동산&apos;과 &apos;노란
            왕국&apos;. 연봉, 복지, 기업문화부터 미래 성장성까지, 두 IT 공룡을
            완벽하게 해부하여 당신의 최적의 선택을 돕습니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &apos;네카라쿠배&apos;라는 신조어의 시작을 알린 두 거인, 네이버와
              카카오. 대한민국 IT 인재라면 누구나 한 번쯤 입사를 꿈꾸는 두
              회사는 비슷한 듯 다른 매력을 가지고 있습니다. 안정적인 시스템의
              네이버냐, 도전적인 문화의 카카오냐. 당신의 커리어 나침반은 어디를
              향하고 있나요?
            </p>

            <section className="mt-12 overflow-x-auto">
              <h2 className="!text-2xl font-bold text-center">
                한눈에 보는 연봉&문화 비교
              </h2>
              <table className="min-w-full text-center mt-4">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">구분</th>
                    <th className="py-3 px-4 font-bold text-green-600">
                      네이버
                    </th>
                    <th className="py-3 px-4 font-bold text-yellow-500">
                      카카오
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-3 px-4 font-semibold">신입 초봉</td>
                    <td>약 6,000 ~ 6,500만원</td>
                    <td>약 6,000 ~ 6,500만원</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">
                      성과급(인센티브)
                    </td>
                    <td>안정적, 예측 가능</td>
                    <td>성과 중심, 변동폭 큼</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">기업 문화</td>
                    <td>체계적, 안정적, &apos;네이버후드&apos;</td>
                    <td>수평적, 도전적, &apos;크루&apos; 문화</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">핵심 성장 동력</td>
                    <td>AI(HyperCLOVA X), 클라우드</td>
                    <td>AI(KoGPT), 톡비즈, 콘텐츠</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Coffee className="w-7 h-7 text-green-500" />
                안정의 네이버: &quot;체계 속에서 성장하는 전문가&quot;
              </h2>
              <p>
                네이버는 국내 최고의 검색 엔진을 기반으로 한 탄탄한 비즈니스
                모델을 자랑합니다. 이는 직원들에게 안정적인 보상과 체계적인 성장
                기회를 제공하는 기반이 됩니다.
              </p>
              <blockquote>
                <p>
                  <strong>장점:</strong> 예측 가능한 수준의 안정적인 성과급,
                  사내 기술 컨퍼런스(DEVIEW) 등 깊이 있는 기술 문화, AI와
                  클라우드 등 차세대 기술에 대한 대규모 투자.
                  <br />
                  <strong>단점:</strong> 상대적으로 큰 조직 규모로 인한 느린
                  의사결정, 다소 수직적인 문화.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Zap className="w-7 h-7 text-yellow-500" />
                도전의 카카오: &quot;기회 속에서 스스로 증명하는 해결사&quot;
              </h2>
              <p>
                &apos;국민 메신저&apos; 카카오톡을 기반으로 끊임없이 새로운
                사업에 도전하는 카카오는 직원들에게 더 많은 기회와 자율성을
                부여하는 것으로 유명합니다.
              </p>
              <blockquote>
                <p>
                  <strong>장점:</strong> 개인과 조직의 성과에 따른 파격적인 보상
                  가능성, 직급 없는 영어 이름 사용 등 수평적인 문화,
                  &apos;카카오 공동체&apos; 내 다양한 서비스 경험 기회.
                  <br />
                  <strong>단점:</strong> 잦은 조직 개편, 상대적으로 변동성이 큰
                  성과급.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-signature-blue" />
                당신의 선택은?
              </h2>
              <p>
                안정적인 환경에서 깊이 있는 전문가로 성장하고 싶다면 네이버,
                자율적인 환경에서 새로운 도전을 즐기며 빠르게 성장하고 싶다면
                카카오가 더 나은 선택일 수 있습니다. 두 회사 모두에게
                합격했다면, 제시받은 조건을 저희 연봉 비교 계산기로 꼼꼼히
                따져보는 것이 중요합니다.
              </p>
              <Link
                href="/?tab=comparator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                네이버 vs 카카오 오퍼, 직접 비교하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
