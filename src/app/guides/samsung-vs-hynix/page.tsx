import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, Users } from "lucide-react"; // DollarSign, LineChart 제거

export const metadata: Metadata = {
  title:
    "삼성전자 vs SK하이닉스: 연봉과 성과급, 누가 진정한 승자인가? (2025년)",
  description:
    "HBM 전쟁의 승자 SK하이닉스, 반도체 제왕 삼성전자. 두 거인의 성과급(OPI, PS)과 기업문화, 연봉 구조를 심층 비교 분석합니다. 2025년, 당신의 선택은 어디입니까?",
  openGraph: {
    title: "삼성전자 vs SK하이닉스: 연봉과 성과급, 누가 진정한 승자인가?",
    description:
      "HBM 전쟁 속 두 거인의 성과급과 미래, 현직자와 취준생을 위한 완벽 분석.",
    images: [
      "/api/og?title=삼성전자 vs SK하이닉스, 승자는?&description=2025년 연봉·성과급 심층 비교",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "삼성전자 vs SK하이닉스: 연봉과 성과급, 누가 진정한 승자인가? (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-21",
  dateModified: "2025-09-21",
  description:
    "HBM 전쟁의 승자 SK하이닉스, 반도체 제왕 삼성전자. 두 거인의 성과급(OPI, PS)과 기업문화, 연봉 구조를 심층 비교 분석합니다.",
};

export default function SamsungVsHynixPage() {
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
        <div className="w-full bg-gradient-to-br from-blue-700 via-sky-600 to-blue-800 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            삼성전자 vs SK하이닉스
            <br />{" "}
            <span className="text-sky-300">성과급 전쟁, 최후의 승자는?</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-sky-100 dark:text-gray-300">
            AI 반도체 시대, HBM의 왕좌를 두고 벌이는 두 거인의 자존심 대결. 이는
            곧 직원들의 연봉과 직결됩니다. 2025년, 과연 누구의 월급 통장이 더
            두둑할까요?
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &quot;같은 HBM 만드는데 왜...&quot; 직장인 커뮤니티를 뜨겁게 달군
              삼성전자 직원들의 토로는 2025년 대한민국 반도체 산업의 현주소를
              보여줍니다. AI 골드러시의 최대 수혜주로 떠오른 HBM(고대역폭
              메모리) 시장을 선점한 SK하이닉스는 역대급 성과급 잔치를 벌인 반면,
              &apos;반도체 초격차&apos;를 외치던 삼성전자는 예상 밖의 부진으로
              직원들의 상대적 박탈감이 커지고 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Cpu className="w-7 h-7 text-blue-500" />
                무엇이 성과급 격차를 만들었나?
              </h2>
              <p>
                두 회사의 희비를 가른 것은 결국 HBM 시장에 대한 &apos;선택과
                집중&apos; 전략의 차이였습니다.
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1">
                    SK하이닉스의 쾌거: HBM 시장 선점
                  </h3>
                  <p className="!my-0 !text-base">
                    AI 칩의 선두주자인 엔비디아와의 강력한 파트너십을 바탕으로
                    HBM 시장을 선점, AI 시대의 도래와 함께 폭발적인 실적 성장을
                    이뤄냈습니다. 이는 PS(초과이익분배금) 50%라는 역대급
                    성과급으로 이어졌습니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1">
                    삼성전자의 딜레마: 거대 사업부의 명과 암
                  </h3>
                  <p className="!my-0 !text-base">
                    삼성전자 DS(반도체)부문은 메모리, 파운드리, 시스템LSI 등
                    다양한 사업부로 구성됩니다. HBM의 성과가 파운드리, 낸드 등
                    다른 사업부의 부진과 합산되며 성과급 재원(OPI)이 희석되는
                    구조적 한계를 보였습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 overflow-x-auto">
              <h2 className="!text-2xl font-bold text-center">
                한눈에 보는 연봉&문화 비교
              </h2>
              <table className="min-w-full text-center mt-4">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">구분</th>
                    <th className="py-3 px-4 font-bold text-blue-600">
                      삼성전자 (DS)
                    </th>
                    <th className="py-3 px-4 font-bold text-orange-500">
                      SK하이닉스
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-3 px-4 font-semibold">신입 초봉</td>
                    <td>약 5,300만원</td>
                    <td>약 5,300만원</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">성과급 제도</td>
                    <td>OPI(초과이익성과급), TAI(목표달성장려금)</td>
                    <td>PS(초과이익분배금), PI(생산성격려금)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">2024년 성과급</td>
                    <td>0~12.5% (사업부별 차등)</td>
                    <td>50% + 특별격려금</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">기업 문화</td>
                    <td>체계적, 안정적, 대기업 문화</td>
                    <td>유연, 수평적, 성과 중심</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Users className="w-7 h-7 text-green-500" />
                그래서, 당신의 선택은?
              </h2>
              <p>
                단순히 그해의 성과급만 보고 회사를 선택하는 것은 현명하지
                않습니다. 당신의 성향과 커리어 목표에 따라 최적의 선택은 달라질
                수 있습니다.
              </p>
              <blockquote>
                <p>
                  <strong>안정성과 시스템을 중시한다면?</strong> 다양한 사업
                  포트폴리오를 갖춘 삼성전자는 장기적으로 안정적인 선택지가 될
                  수 있습니다. <br />
                  <strong>폭발적인 성장과 성과 보상을 원한다면?</strong> 특정
                  분야에 집중하며 빠른 의사결정을 하는 SK하이닉스가 더 매력적일
                  수 있습니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                최종 오퍼, 실수령액으로 비교하세요
              </h2>
              <p>
                두 회사 모두에게 합격 통보를 받았다면, 계약 연봉과 예상 성과급,
                복지 혜택까지 모두 고려한 &apos;세후 실수령액&apos;을 비교하여
                최종 결정을 내리는 것이 중요합니다.
              </p>
              <Link
                href="/?tab=comparator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                삼성 vs 하이닉스 오퍼, 직접 비교하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
