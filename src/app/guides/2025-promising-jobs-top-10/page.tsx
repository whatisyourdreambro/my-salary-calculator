
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, TrendingUp, Lightbulb, BrainCircuit } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 유망 직업 TOP 10: 미래를 선도할 직업은 무엇일까?",
  description:
    "AI, 빅데이터, 친환경 에너지, 디지털 헬스케어... 빠르게 변화하는 미래 사회에서 2025년 가장 각광받을 유망 직업 10가지를 선정했습니다. 각 직업의 특징, 요구 역량, 그리고 미래 전망까지 상세히 분석하여 당신의 커리어 설계를 돕습니다.",
  openGraph: {
    title: "2025년 유망 직업 TOP 10: 미래를 선도할 직업은 무엇일까?",
    description:
      "미래를 준비하는 당신을 위한 필독 가이드. 2025년, 당신의 커리어를 빛낼 유망 직업을 지금 바로 확인하세요.",
    images: ["/api/og?title=2025년 유망 직업 TOP 10"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 유망 직업 TOP 10: 미래를 선도할 직업은 무엇일까?",
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
    "2025년 가장 각광받을 유망 직업 10가지를 선정했습니다. 각 직업의 특징, 요구 역량, 그리고 미래 전망까지 상세히 분석하여 당신의 커리어 설계를 돕습니다.",
};

const promisingJobsData = [
  { rank: 1, job: "AI 전문가", description: "인공지능 기술 개발 및 활용" },
  { rank: 2, job: "데이터 과학자", description: "빅데이터 분석 및 인사이트 도출" },
  { rank: 3, job: "사이버 보안 전문가", description: "정보 보안 시스템 구축 및 관리" },
  { rank: 4, job: "재생에너지 엔지니어", description: "태양광, 풍력 등 친환경 에너지 기술 개발" },
  { rank: 5, job: "디지털 헬스케어 전문가", description: "IT 기술 기반 건강 관리 서비스 개발" },
  { rank: 6, job: "콘텐츠 크리에이터", description: "다양한 플랫폼에서 독창적인 콘텐츠 제작" },
  { rank: 7, job: "UX/UI 디자이너", description: "사용자 경험 및 인터페이스 설계" },
  { rank: 8, job: "로봇 엔지니어", description: "산업용/서비스용 로봇 개발 및 운용" },
  { rank: 9, job: "스마트팜 전문가", description: "첨단 기술 활용 농업 생산성 향상" },
  { rank: 10, job: "ESG 컨설턴트", description: "기업의 환경, 사회, 지배구조 개선 자문" },
];

export default function PromisingJobs2025GuidePage() {
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
            2025년 유망 직업 TOP 10,
            <br /> 미래를 선도할 직업은?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            빠르게 변화하는 시대, 어떤 직업이 당신의 미래를 빛내줄까요? AI, 빅데이터, 친환경 에너지 등 미래 산업을 이끌어갈 유망 직업 10가지를 선정하고, 각 직업의 특징과 요구 역량을 상세히 분석합니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              4차 산업혁명 시대의 도래와 함께 직업의 세계는 끊임없이 변화하고 있습니다. 사라지는 직업이 있는가 하면, 새롭게 떠오르는 직업들도 많습니다. 특히 인공지능, 빅데이터, 친환경 에너지 등 첨단 기술 분야와 사회적 가치를 중시하는 분야에서 새로운 직업들이 빠르게 생겨나고 있습니다. 미래를 준비하는 당신을 위해 2025년 가장 각광받을 유망 직업 10가지를 선정하고, 각 직업의 특징과 요구 역량을 상세히 분석해 드립니다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                미래 유망 직업, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>안정적인 커리어:</strong> 성장하는 산업과 직업을 선택하면 장기적으로 안정적인 커리어를 유지할 수 있습니다.
                </li>
                <li>
                  <strong>높은 연봉:</strong> 수요가 많고 전문성을 요구하는 직업은 높은 연봉을 받을 가능성이 큽니다.
                </li>
                <li>
                  <strong>개인의 성장:</strong> 새로운 기술과 트렌드를 배우며 끊임없이 성장하고 발전할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-500" />
                2025년 유망 직업 TOP 10
              </h2>
              <p className="text-center">
                미래 사회를 이끌어갈 핵심 직업들을 소개합니다. 당신의 적성과 흥미에 맞는 직업을 찾아보세요.
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">순위</th>
                      <th className="py-3 px-4 font-bold">직업명</th>
                      <th className="py-3 px-4 font-semibold">주요 업무</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {promisingJobsData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">{item.rank}</td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">
                          {item.job}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 순위는 예상치이며, 산업 및 기술 발전에 따라 변동될 수 있습니다.</p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 미래 유망 직업, 이렇게 준비하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>꾸준한 학습:</strong> 미래 유망 직업은 대부분 새로운 기술과 지식을 요구합니다. 온라인 강의, 스터디, 자격증 취득 등을 통해 꾸준히 학습하고 역량을 강화하세요.
                </li>
                <li>
                  <strong>융합적 사고:</strong> 한 분야에만 머무르지 않고, 다양한 분야의 지식을 융합하여 새로운 가치를 창출하는 능력이 중요합니다.
                </li>
                <li>
                  <strong>네트워크 형성:</strong> 관련 분야 전문가들과 교류하며 정보를 얻고, 협력 기회를 모색하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <BrainCircuit className="w-7 h-7 text-indigo-500" />
                당신의 미래 커리어, 지금 바로 설계하세요!
              </h2>
              <p>
                미래는 준비하는 자의 것입니다. 유망 직업에 대한 정보를 바탕으로 <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/industry-trends-2025"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                2025년 유망 산업 트렌드 확인하기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
