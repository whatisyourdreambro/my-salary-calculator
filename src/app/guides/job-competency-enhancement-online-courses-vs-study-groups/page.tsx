
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Users, Lightbulb, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "직무 역량 강화, 온라인 강의 vs 스터디: 나에게 맞는 학습법은?",
  description:
    "멈추면 뒤처진다! 빠르게 변화하는 직무 환경에서 당신의 경쟁력을 높이는 방법, 온라인 강의와 스터디 그룹. 두 학습 방법의 장단점을 비교 분석하고, 당신의 학습 스타일과 목표에 맞는 최적의 방법을 찾아드립니다.",
  openGraph: {
    title: "직무 역량 강화, 온라인 강의 vs 스터디: 나에게 맞는 학습법은?",
    description:
      "온라인 강의와 스터디, 어떤 것이 당신의 직무 역량을 더 효과적으로 강화할 수 있을까요? 현명한 선택을 위한 가이드.",
    images: ["/api/og?title=직무 역량 강화, 온라인 vs 스터디"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "직무 역량 강화, 온라인 강의 vs 스터디: 나에게 맞는 학습법은?",
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
    "온라인 강의와 스터디 그룹의 장단점을 비교 분석하고, 당신의 학습 스타일과 목표에 맞는 최적의 방법을 찾아드립니다.",
};

export default function JobCompetencyEnhancementGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-gray-900 dark:to-teal-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            직무 역량 강화,
            <br /> 온라인 강의 vs 스터디
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            멈추면 뒤처지는 시대! 당신의 직무 역량을 강화하기 위한 가장 효과적인 방법은 무엇일까요? 온라인 강의와 스터디 그룹, 두 가지 대표적인 학습법의 장단점을 비교 분석하고 당신에게 맞는 최적의 길을 찾아드립니다.
          </p>
          <p className="mt-4 text-xs text-cyan-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              빠르게 변화하는 산업 환경 속에서 직무 역량 강화는 선택이 아닌 필수가 되었습니다. 새로운 기술을 배우고, 전문성을 심화하며, 끊임없이 자신을 발전시켜야만 경쟁력을 유지할 수 있습니다. 하지만 바쁜 직장 생활 속에서 어떻게 효율적으로 학습해야 할까요? 많은 직장인들이 온라인 강의와 스터디 그룹 사이에서 고민합니다. 이 가이드를 통해 두 학습 방법의 특징을 명확히 이해하고, 당신의 학습 목표와 스타일에 맞는 최적의 선택을 하세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                직무 역량 강화, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>경쟁력 확보:</strong> 새로운 기술과 지식을 습득하여 변화하는 시장에서 당신의 경쟁력을 유지하고 높일 수 있습니다.
                </li>
                <li>
                  <strong>커리어 성장:</strong> 전문성 강화를 통해 더 높은 직급, 더 좋은 연봉으로의 이직 기회를 만들 수 있습니다.
                </li>
                <li>
                  <strong>자기 만족:</strong> 끊임없이 배우고 성장하는 과정에서 오는 성취감과 만족감을 느낄 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Lightbulb className="w-7 h-7 text-purple-500" />
                온라인 강의 vs 스터디 그룹, 당신의 선택은?
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">온라인 강의</th>
                      <th className="py-3 px-4 font-bold text-orange-500">스터디 그룹</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">장점</td>
                      <td className="py-4 px-4">시간/장소 제약 없음, 반복 학습 가능, 다양한 콘텐츠</td>
                      <td className="py-4 px-4">상호 피드백, 동기 부여, 정보 공유, 네트워킹</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">단점</td>
                      <td className="py-4 px-4">자기 주도 학습 필요, 질문/피드백 제한적</td>
                      <td className="py-4 px-4">시간/장소 제약, 스터디원 간 역량 차이, 갈등 발생 가능성</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">추천 대상</td>
                      <td className="py-4 px-4">자기 주도 학습 능력 우수, 특정 지식 습득 목표</td>
                      <td className="py-4 px-4">상호 작용 선호, 동기 부여 필요, 문제 해결 능력 향상 목표</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <BookOpen className="w-6 h-6" /> 효과적인 학습을 위한 꿀팁!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>목표 설정:</strong> 무엇을 배우고 싶은지, 왜 배우고 싶은지 명확한 목표를 설정하세요.
                </li>
                <li>
                  <strong>꾸준함:</strong> 단기간에 모든 것을 이루려 하기보다는 꾸준히 학습하는 습관을 들이는 것이 중요합니다.
                </li>
                <li>
                  <strong>실천:</strong> 배운 내용을 실제 업무나 프로젝트에 적용해보면서 체득하는 것이 가장 효과적인 학습 방법입니다.
                </li>
                <li>
                  <strong>피드백:</strong> 스터디원이나 멘토에게 피드백을 요청하고, 자신의 부족한 점을 개선해나가세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Users className="w-7 h-7 text-indigo-500" />
                당신의 직무 역량을 한 단계 업그레이드하세요!
              </h2>
              <p>
                지속적인 학습과 성장은 당신의 커리어를 더욱 빛나게 할 것입니다. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/career-growth-side-projects"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                사이드 프로젝트로 커리어 성장하기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
