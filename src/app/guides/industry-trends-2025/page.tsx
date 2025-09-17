import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "삼성 vs 하이닉스, 역대급 '성과급 격차' 심층 분석 (feat. 정부 밸류업) | Moneysalary",
  description:
    "왜 SK하이닉스 성과급은 연봉의 50%인데, 삼성전자는 아닐까? HBM 기술 격차, 사업부별 실적 차이, 그리고 정부의 '기업 밸류업 프로그램'이 두 거인의 연봉과 미래에 미칠 영향을 심층 분석합니다.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "삼성 vs 하이닉스, 역대급 '성과급 격차' 심층 분석 (feat. 정부 밸류업)",
  author: { "@type": "Organization", name: "Moneysalary" },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-09-18",
  dateModified: "2025-09-18",
  description:
    "HBM 기술 격차, 사업부별 실적 차이, 그리고 정부의 '기업 밸류업 프로그램'이 삼성전자와 SK하이닉스 직장인들의 연봉과 성과급에 미칠 영향을 심층 분석합니다.",
};

export default function IndustryTrends2025Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* 헤드라인 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-signature-blue to-violet-500 bg-clip-text text-transparent pb-2">
            성과급 전쟁: 삼성의 &apos;박탈감&apos; vs 하이닉스의
            &apos;축포&apos;
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            2025년 대한민국 산업 지형을 뒤흔드는 거대한 변화와 당신의 월급에
            미칠 영향을 심층 분석합니다.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 18일
          </p>
        </div>

        {/* [수정] article 태그를 추가하여 JSX 구조를 바로잡았습니다. */}
        <article className="space-y-8">
          {/* 1부: 반도체 */}
          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 !mt-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-signature-blue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-1.414-1.414M19.778 19.778l-1.414-1.414M18.364 5.636l-1.414 1.414M4.222 19.778l1.414-1.414M12 12a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
              1부: AI 골드러시 - 삼성 vs 하이닉스
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              &quot;같은 HBM 만드는데 왜...&quot; 직장인 커뮤니티를 달군
              삼성전자 직원들의 토로입니다. AI 반도체 특수로 SK하이닉스가 역대급
              &apos;축포&apos;를 터뜨린 반면, 삼성전자는 기대에 미치지 못하는
              성과급이 예상되며 직원들의 상대적 박탈감이 커지고 있습니다.
            </p>
            {/* [수정] 중복된 CSS 클래스를 정리했습니다. */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-lg">
                무엇이 성과급 격차를 만들었나?
              </h3>
              <p className="text-sm">
                <strong>SK하이닉스 (선택과 집중):</strong> HBM 시장을 선점한
                전략이 AI 시대와 맞물려 OPI 50%라는 최고의 성과로 이어졌습니다.
              </p>
              <p className="text-sm">
                <strong>삼성전자 (거인의 딜레마):</strong> HBM의 성과가
                파운드리, 낸드 등 다른 사업부의 부진과 합산되며 성과급 재원이
                희석되는 구조적 한계를 보입니다.
              </p>
              <p className="text-sm">
                <strong>정부의 K-칩스법:</strong> 반도체 투자 세액공제 혜택이
                현금흐름이 좋은 하이닉스의 인재 영입 경쟁에 더 유리하게 작용할
                수 있습니다.
              </p>
            </div>
            <Link
              href="/"
              className="block mt-6 p-4 bg-signature-blue/10 dark:bg-signature-blue/20 rounded-lg text-center font-semibold text-signature-blue hover:bg-signature-blue/20 dark:hover:bg-signature-blue/30 transition-colors"
            >
              성과급 포함 실수령액 확인하기 →
            </Link>
          </section>

          {/* 2부: 자동차 */}
          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 !mt-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-teal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              2부: 현대차의 전환, &apos;협상&apos;의 성과급
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              반도체 업계가 기술과 실적에 따라 성과급이 롤러코스터를 타는 반면,{" "}
              <strong>현대자동차</strong>는 매년 노사간의 치열한
              &apos;협상&apos;을 통해 성과급이 결정됩니다. 성공적인 전기차(EV)
              판매 실적을 바탕으로 역대급 성과급을 지급했지만, 이는 반도체
              업계와는 다른 성격의 보상 체계입니다.
            </p>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-lg">안정성과 딜레마</h3>
              <p className="text-sm">
                <strong>안정적 보상:</strong> 노사 합의 기반의 성과급은 변동성이
                적어 고용 안정성을 중시하는 직원들에게 장점이 될 수 있습니다.
              </p>
              <p className="text-sm">
                <strong>미래와의 갈등:</strong> 회사는 SDV(소프트웨어 중심
                자동차) 전환을 위한 R&D 투자를, 노조는 현재 이익의 분배를
                요구하며 미래 경쟁력과 현재 보상 사이의 딜레마가 반복됩니다.
              </p>
            </div>
          </section>

          {/* 3부: 정부 정책 */}
          <section className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 !mt-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              3부: 정부의 변수, &apos;기업 밸류업&apos;의 나비효과
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              정부가 추진하는 <strong>&apos;기업 밸류업 프로그램&apos;</strong>
              은 기업이 이익을 성과급보다 배당, 자사주 소각 등 주주환원에 더
              많이 쓰도록 유도하는 정책입니다. 이는 장기적으로 대기업의 보상
              체계에 큰 변화를 가져올 수 있습니다.
            </p>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-lg">기회와 위기</h3>
              <p className="text-sm">
                <strong>성과급 재원 감소?:</strong> 주주환원 압박이 커지면,
                기업이 예측 불가능한 거액의 OPI보다는 안정적인 보상 체계를
                선호하게 될 수 있습니다.
              </p>
              <p className="text-sm">
                <strong>자산 증식의 기회:</strong> 반면, 기업 가치가 재평가되어
                주가가 오르면 우리사주나 스톡옵션을 보유한 직원들의 자산 가치는
                크게 상승할 수 있습니다.
              </p>
            </div>
            <Link
              href="/?tab=comparator"
              className="block mt-6 p-4 bg-signature-blue/10 dark:bg-signature-blue/20 rounded-lg text-center font-semibold text-signature-blue hover:bg-signature-blue/20 dark:hover:bg-signature-blue/30 transition-colors"
            >
              여러 회사 오퍼, 실수령액으로 비교하기 →
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
