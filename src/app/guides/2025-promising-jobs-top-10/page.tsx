
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, TrendingUp, BrainCircuit, Bot, Database, Cloud, Shield, HeartPulse, Leaf, Tractor, Code } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 유망 직업 TOP 10 (feat. 연봉, 필요 역량)",
  description:
    "AI, 데이터, 클라우드, ESG... 2025년 가장 각광받을 유망 직업 10가지를 선정했습니다. 각 직업의 전망, 필요 역량, 그리고 예상 연봉 수준까지 상세히 분석하여 당신의 커리어 설계를 돕습니다.",
  openGraph: {
    title: "2025년 유망 직업 TOP 10 (feat. 연봉, 필요 역량)",
    description:
      "미래를 준비하는 당신을 위한 필독 가이드. 2025년, 당신의 커리어를 빛낼 유망 직업을 지금 바로 확인하세요.",
    images: ["/api/og?title=2025년 유망 직업 TOP 10"],
  },
};
const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 유망 직업 TOP 10 (feat. 연봉, 필요 역량)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-07-10",
  dateModified: currentDate,
  description:
    "2025년 가장 각광받을 유망 직업 10가지의 전망, 필요 역량, 예상 연봉을 상세히 분석합니다.",
};
const promisingJobs = [
    { rank: 1, name: "AI/머신러닝 엔지니어", icon: Bot, outlook: "모든 산업의 AI 전환을 이끄는 핵심 인재", skills: "Python, TensorFlow, PyTorch, MLOps", salary: "신입 6천~8천, 경력 1억 이상" },
    { rank: 2, name: "데이터 과학자/분석가", icon: Database, outlook: "데이터 기반 의사결정의 필수 인력", skills: "SQL, Python, R, 통계학, 시각화 툴", salary: "신입 5천~7천, 경력 9천 이상" },
    { rank: 3, name: "클라우드 엔지니어/DevOps", icon: Cloud, outlook: "디지털 인프라의 설계자이자 관리자", skills: "AWS, GCP, Kubernetes, CI/CD", salary: "신입 5.5천~7.5천, 경력 9천 이상" },
    { rank: 4, name: "사이버 보안 전문가", icon: Shield, outlook: "기업의 정보 자산을 지키는 수호자", skills: "네트워크, 시스템, 암호학, 법규 이해", salary: "신입 5천~7천, 경력 8.5천 이상" },
    { rank: 5, name: "디지털 헬스케어 전문가", icon: HeartPulse, outlook: "고령화 시대, 기술과 의학의 융합", skills: "의료 데이터, 규제 이해, 서비스 기획", salary: "산업/직무 따라 상이" },
    { rank: 6, name: "ESG 전문가", icon: Leaf, outlook: "기업의 지속가능성을 책임지는 컨설턴트", skills: "환경/에너지, 사회적 책임, 경영", salary: "신입 5천 이상, 경력 8천 이상" },
    { rank: 7, name: "UX/UI 디자이너", icon: "Palette", outlook: "사용자 중심 서비스의 핵심 설계자", skills: "Figma, 사용자 리서치, 프로토타이핑", salary: "신입 4천~5.5천, 경력 7천 이상" },
    { rank: 8, name: "로보틱스 엔지니어", icon: "ToyBrick", outlook: "제조, 물류, 서비스를 혁신하는 기술", skills: "C++, Python, ROS, 제어공학", salary: "신입 5.5천 이상, 경력 9천 이상" },
    { rank: 9, name: "스마트팜 전문가", icon: Tractor, outlook: "미래 식량난을 해결할 농업 혁신가", skills: "농업 지식, IoT, 데이터 분석", salary: "산업/직무 따라 상이" },
    { rank: 10, name: "콘텐츠 크리에이터", icon: "Video", outlook: "개인의 영향력이 곧 자산이 되는 시대", skills: "콘텐츠 기획, 영상 편집, 플랫폼 이해", salary: "개인 역량에 따라 천차만별" },
]

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
            2025년 유망 직업 TOP 10
            <br /> (연봉, 필요역량 총정리)
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            빠르게 변화하는 시대, 어떤 직업이 당신의 미래를 빛내줄까요? AI, 데이터, ESG 등 미래 산업을 이끌어갈 유망 직업 10가지의 전망과 연봉, 필요 역량을 상세히 분석합니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              4차 산업혁명과 코로나19 팬데믹을 거치며 직업의 세계는 그 어느 때보다 빠르게 변화하고 있습니다. 사라지는 직업이 있는가 하면, 새롭게 떠오르는 직업들도 많습니다. 미래를 준비하는 당신을 위해 2025년 가장 각광받을 유망 직업 10가지를 선정하고, 각 직업의 특징과 요구 역량, 그리고 현실적인 연봉 수준까지 상세히 분석해 드립니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-500" />
                2025년 미래를 선도할 유망 직업 TOP 10
              </h2>
             
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {promisingJobs.map((job) => (
                  <div key={job.rank} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 flex flex-col">
                    <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                      <span className="font-bold text-lg text-purple-500">{job.rank}.</span> {job.name}
                    </h3>
                    <div className="text-sm space-y-2 mt-2 flex-grow">
                        <p className="!my-1"><strong>전망:</strong> {job.outlook}</p>
                        <p className="!my-1"><strong>필요 역량:</strong> {job.skills}</p>
                        <p className="!my-1"><strong>예상 연봉:</strong> <span className="font-semibold text-purple-600 dark:text-purple-400">{job.salary}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                개발 직군, 더 자세히 알아볼까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                유망 직업 TOP 10의 상당수는 IT 개발 직군입니다. 백엔드, AI, 데브옵스 등 내가 관심 있는 직무의 연봉과 필요 역량을 더 상세히 비교해보세요.
              </p>
              <Link
                href="/guides/it-developer-salary-comparison-by-role"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Code className="inline-block w-5 h-5 mr-2" />
                개발자 직군별 연봉 비교하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
