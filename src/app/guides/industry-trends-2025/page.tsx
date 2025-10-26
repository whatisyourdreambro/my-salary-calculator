import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, Car, Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "2025 산업대전망: 반도체, 자동차 그리고 내 월급의 미래 | Moneysalary",
  description:
    "AI발 반도체 성과급 격차, 현대차의 SDV 전환, 정부의 '기업 밸류업 프로그램'이 2025년 당신의 연봉과 자산에 미칠 영향을 심층 분석하고 미래 전략을 제시합니다.",
  openGraph: {
    title: "2025 산업대전망: 반도체, 자동차 그리고 내 월급의 미래",
    description:
      "거대한 산업의 흐름 속, 당신의 연봉은 어디로 향할까요? 2025년 핵심 트렌드를 분석합니다.",
    images: [
      "/api/og?title=2025 산업대전망과 내 월급의 미래&description=반도체·자동차·정부정책 핵심 분석",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025 산업대전망: 반도체, 자동차 그리고 내 월급의 미래",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-18",
  dateModified: "2025-09-22",
  description:
    "AI발 반도체 성과급 격차, 현대차의 SDV 전환, 정부의 '기업 밸류업 프로그램'이 2025년 당신의 연봉과 자산에 미칠 영향을 심층 분석하고 미래 전략을 제시합니다.",
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
      <main className="w-full bg-background">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-slate-800 to-gray-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025 대전망:
            <br />{" "}
            <span className="text-cyan-400">
              당신의 월급을 결정할 3가지 흐름
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
            AI 반도체 전쟁, 자동차 산업의 대전환, 그리고 정부의 정책 변화.
            거대한 파도 속에서 당신의 커리어와 연봉은 어디로 향하게 될까요?
            2025년 대한민국 산업 지형을 읽고 미래를 준비하세요.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              우리는 개인의 노력을 넘어, 거대한 산업의 흐름이 개인의 부를
              결정하는 시대에 살고 있습니다. 내가 속한 산업이 성장하는가,
              정체하는가에 따라 나의 연봉 상승률과 자산 증식 속도는 극명하게
              달라집니다. 2025년, 당신이 반드시 주목해야 할 세 가지 거대한
              흐름을 분석합니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Cpu className="w-7 h-7 text-signature-blue" />
                흐름 1: AI 반도체, 성과급의 &apos;부익부 빈익빈&apos;
              </h2>
              <p>
                &quot;같은 HBM 만드는데 왜...&quot; 이 한탄은 AI가 촉발한 반도체
                시장의 지각변동을 상징합니다. HBM 시장을 선점한 SK하이닉스가
                역대급 성과급(PS)을 터뜨린 반면, 거함 삼성전자는 상대적으로
                부진한 성과급(OPI)이 예상되며 직원들의 희비가 엇갈렸습니다. 이는
                기술 리더십과 시장 선점의 중요성을 여실히 보여줍니다.
              </p>
              <blockquote>
                <p>
                  <strong>핵심 인사이트:</strong> 앞으로 반도체 업계의 연봉은
                  &apos;회사&apos;가 아닌 &apos;사업부&apos;와
                  &apos;기술&apos;에 따라 극명하게 갈릴 것입니다. HBM, CXL 등 AI
                  관련 핵심 기술 분야의 인재 가치는 계속해서 치솟을 것이며,
                  전통적인 메모리나 파운드리 분야와의 격차는 더 벌어질 수
                  있습니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Car className="w-7 h-7 text-teal-500" />
                흐름 2: 자동차, &apos;하드웨어&apos;에서
                &apos;소프트웨어&apos;로
              </h2>
              <p>
                현대자동차의 &apos;킹산직&apos; 신드롬은 강력한 노사 협상을 통한
                안정적인 고연봉 시대를 상징했습니다. 하지만 자동차 산업의
                패러다임이 전기차와 SDV(소프트웨어 중심 자동차)로 급격히
                전환되면서 새로운 연봉 지형이 펼쳐지고 있습니다.
              </p>
              <div className="mt-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-l-4 border-teal-500">
                <h3 className="font-bold !mt-0 !text-xl">
                  새로운 &apos;킹&apos;의 등장: 자동차 S/W 개발자
                </h3>
                <p className="!my-2 !text-base">
                  자율주행, 인포테인먼트 시스템을 개발하는 소프트웨어
                  엔지니어들의 몸값이 천정부지로 치솟고 있습니다. 기존 생산직의
                  연봉 테이블과는 완전히 다른, IT 업계 최상위권에 준하는 보상
                  패키지를 제시하며 인재를 끌어모으고 있습니다. 이는 전통
                  제조업이 IT 기업으로 변모하는 과정에서 나타나는 자연스러운
                  현상입니다.
                </p>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Landmark className="w-7 h-7 text-amber-500" />
                흐름 3: 정부 정책, &apos;성과급&apos;에서
                &apos;주주환원&apos;으로
              </h2>
              <p>
                정부가 추진하는{" "}
                <strong>&apos;기업 밸류업 프로그램&apos;</strong>은 장기적으로
                대기업의 보상 체계에 큰 변화를 가져올 수 있습니다. 기업의 이익을
                직원 성과급으로 지급하기보다, 배당이나 자사주 소각 등 주주가치를
                높이는 데 사용하라는 압박이 커지기 때문입니다.
              </p>
              <blockquote>
                <p>
                  <strong>기회와 위기:</strong> 단기적으로는 성과급 재원이
                  줄어들 수 있다는 우려가 있습니다. 하지만 장기적으로는 기업
                  가치 상승으로 인한 주가 상승이 우리사주나 스톡옵션을 보유한
                  직원들의 자산 가치를 크게 증대시키는 기회가 될 수 있습니다.
                  &apos;현금 보너스&apos;의 시대에서 &apos;자본 이득&apos;의
                  시대로 전환될 가능성을 시사합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                거인의 어깨 위에서 미래를 보세요
              </h2>
              <p>
                산업의 거대한 흐름을 이해하는 것은 내 연봉과 커리어를 위한
                최고의 나침반입니다. 당신이 속한 산업은 어디로 향하고 있나요?
                지금 바로 당신의 연봉 위치를 확인하고 미래 전략을 세워보세요.
              </p>
              <Link
                href="/?tab=rank"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 연봉 순위 확인하고 미래 예측하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
