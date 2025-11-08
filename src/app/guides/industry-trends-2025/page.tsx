import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Cpu, BatteryCharging, Plane, BrainCircuit } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 연봉 트렌드: 어떤 산업이 뜨고 있을까? (AI, 반도체, 바이오)",
  description:
    "2025년, 연봉 많이 주는 산업은 어디일까? AI, 반도체, 2차전지, 바이오 등 유망 산업의 연봉 트렌드와 전망을 분석하고, 당신의 커리어 방향 설정을 돕습니다.",
  openGraph: {
    title: "2025년 연봉 트렌드: 어떤 산업이 뜨고 있을까? (AI, 반도체, 바이오)",
    description:
      "미래의 부는 어디에 있을까? 2025년을 주도할 고연봉 유망 산업을 미리 만나보세요.",
    images: ["/api/og?title=2025년 연봉 트렌드, 어떤 산업이 뜰까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 연봉 트렌드: 어떤 산업이 뜨고 있을까? (AI, 반도체, 바이오)",
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
    "2025년, 연봉 많이 주는 산업은 어디일까? AI, 반도체, 2차전지, 바이오 등 유망 산업의 연봉 트렌드와 전망을 분석합니다.",
};

export default function IndustryTrends2025GuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-indigo-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025년 연봉 트렌드,
            <br /> 돈은 어디로 흐르는가?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-purple-100 dark:text-gray-300">
            이직과 연봉 협상의 계절, 어떤 산업이 유망할까요? AI 혁명부터 K-바이오의 약진까지, 2025년 대한민국 산업 지형도와 연봉 트렌드를 전망해봅니다.
          </p>
          <p className="mt-4 text-xs text-purple-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              취업과 이직을 준비할 때 가장 먼저 고려해야 할 것 중 하나는 바로 '산업의 성장성'입니다. 성장하는 산업에 몸을 담아야 개인의 커리어와 연봉도 함께 성장할 수 있기 때문입니다. 2025년, 어떤 산업이 당신의 몸값을 높여줄까요?
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Activity className="w-7 h-7 text-green-500" />
                2025년을 주도할 고연봉 유망 산업 TOP 4
              </h2>
              <p>
                여러 경제 전망과 채용 시장의 데이터를 분석했을 때, 아래 4개 산업은 2025년에도 높은 성장과 함께 연봉 상승을 주도할 것으로 보입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-purple-500" /> 1. AI (인공지능)
                  </h3>
                  <p className="!text-sm !my-0">
                    설명이 필요 없는 현재 최고의 화두. AI 개발자, 데이터 사이언티스트의 몸값은 천정부지로 치솟고 있으며, 모든 산업에 AI가 접목되면서 관련 인력 수요는 더욱 폭발적으로 증가할 것입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <Cpu className="w-6 h-6 text-blue-500" /> 2. 반도체
                  </h3>
                  <p className="!text-sm !my-0">
                    AI 혁명의 기반이 되는 산업. 특히 고대역폭 메모리(HBM) 시장을 주도하는 한국 기업들의 인재 확보 경쟁은 더욱 치열해질 것이며, 이는 곧 연봉 상승으로 이어집니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <BatteryCharging className="w-6 h-6 text-green-600" /> 3. 2차전지 & 전기차
                  </h3>
                  <p className="!text-sm !my-0">
                    전기차 시장의 성장과 함께 K-배터리 기업들의 위상은 더욱 높아지고 있습니다. 소재, 셀, 장비 등 밸류체인 전반에 걸쳐 높은 연봉과 성과급을 기대할 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <Plane className="w-6 h-6 text-red-500" /> 4. 바이오 & 헬스케어
                  </h3>
                  <p className="!text-sm !my-0">
                    고령화 사회 진입과 함께 가장 확실한 미래 먹거리 중 하나입니다. 신약 개발, 디지털 헬스케어 분야의 성장과 함께 전문 인력에 대한 대우는 계속해서 좋아질 것입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">
                전통 산업의 반격: 자동차와 방산
              </h2>
              <p>
                새로운 성장 산업뿐만 아니라, 전통 강자들의 약진도 눈여겨봐야 합니다. 전기차와 자율주행 기술로 무장한 <strong>자동차 산업</strong>, 그리고 K-방산 붐을 이끄는 <strong>방위 산업</strong> 역시 역대급 실적을 바탕으로 높은 수준의 연봉과 성과급을 자랑하고 있습니다.
              </p>
              <blockquote className="!border-l-blue-500">
                <p>
                  <strong>핵심은 '융합'</strong>: 어떤 산업에 있든, AI와 데이터를 이해하고 활용할 수 있는 능력은 당신의 몸값을 결정하는 가장 중요한 요소가 될 것입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                내 커리어, 어떻게 계획해야 할까?
              </h2>
              <p>
                산업의 흐름을 읽고, 자신의 강점과 흥미를 연결하는 것이 성공적인 커리어의 핵심입니다. <br />
                Moneysalary의 다양한 가이드와 함께 당신의 미래를 계획해보세요.
              </p>
              <Link
                href="/guides/salary-negotiation"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연봉 협상 잘하는 법 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}