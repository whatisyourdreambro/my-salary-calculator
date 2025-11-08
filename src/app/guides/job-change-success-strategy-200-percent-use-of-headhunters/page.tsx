
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Handshake, Lightbulb, UserCheck, Linkedin } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "헤드헌터 200% 활용법: 비공개 채용 제안받는 비법 (2025년)",
  description:
    "성공적인 이직을 위한 비밀 병기, 헤드헌터! 헤드헌터가 먼저 연락하게 만드는 프로필 관리법부터, 연봉 협상을 유리하게 이끄는 커뮤니케이션 전략까지. 당신의 몸값을 높이는 이직의 모든 것을 알려드립니다.",
  openGraph: {
    title: "헤드헌터 200% 활용법: 비공개 채용 제안받는 비법 (2025년)",
    description:
      "헤드헌터는 당신의 이직을 돕는 최고의 조력자입니다. 제대로 활용하여 성공적인 이직을 만드세요.",
    images: ["/api/og?title=헤드헌터 200% 활용법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "헤드헌터 200% 활용법: 비공개 채용 제안받는 비법 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-06-15",
  dateModified: currentDate,
  description:
    "헤드헌터가 먼저 연락하게 만드는 프로필 관리법부터, 연봉 협상을 유리하게 이끄는 커뮤니케이션 전략까지 당신의 몸값을 높이는 이직의 모든 것을 알려드립니다.",
};

export default function HeadhunterUtilizationGuidePage() {
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
            이직 성공 전략,
            <br /> 헤드헌터 200% 활용법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            원하는 회사, 원하는 연봉으로 이직하고 싶다면? 헤드헌터는 당신의 이직을 돕는 최고의 조력자입니다. 헤드헌터를 200% 활용하여 성공적인 이직을 만드는 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              경력직 이직 시장에서 헤드헌터는 '비공개 우량 포지션'으로 가는 가장 빠른 길입니다. 하지만 기억하세요. 헤드헌터의 고객은 당신이 아닌 '기업'입니다. 그들이 당신을 기업에 더 잘 '판매'할 수 있도록 최고의 정보를 제공하는 '파트너'가 되는 것이 헤드헌터 활용의 핵심입니다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Handshake className="w-6 h-6" />
                헤드헌터, 왜 활용해야 할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li><strong>비공개 채용 정보:</strong> 외부에 공개되지 않는 고급 채용 정보를 얻을 수 있습니다.</li>
                <li><strong>객관적인 가치 평가:</strong> 나의 경력과 역량에 대한 객관적인 시장 가치를 파악할 수 있습니다.</li>
                <li><strong>연봉 협상 대리:</strong> 회사와 직접 말하기 어려운 연봉, 처우 등을 헤드헌터가 중간에서 조율하여 유리한 조건을 이끌어낼 수 있습니다.</li>
                <li><strong>이직 전 과정 관리:</strong> 이력서 작성부터 면접 준비, 레퍼런스 체크까지 이직 전 과정에 대한 전문가의 조언을 받을 수 있습니다.</li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <UserCheck className="w-7 h-7 text-green-500" />
                헤드헌터가 먼저 연락하게 만드는 3가지 방법
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2">1. 링크드인 프로필 최적화</h3>
                  <p className="!text-sm !my-0">
                    헤드라인에 직책과 회사명만 쓰지 마세요. <strong>'Backend Engineer | Java, Spring, MSA | Fintech'</strong> 와 같이 핵심 기술 스택과 도메인을 명시해야 검색에 잘 걸립니다. 'Open to Work' 기능은 'Recruiters only'로 설정하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2">2. 이력서/경력기술서 상시 업데이트</h3>
                  <p className="!text-sm !my-0">
                    성과는 숫자로 보여줘야 합니다. '매출 20% 상승', '비용 15% 절감' 등 구체적인 숫자로 당신의 성과를 정량화하고, 채용 플랫폼(원티드, 리멤버 등)에 항상 최신 버전으로 업데이트해두세요.
                  </p>
                   <Link href="/guides/career-description-key-to-job-change-success" className="text-sm font-bold text-gray-600 hover:underline block mt-2">→ 합격률 높이는 경력기술서 작성법</Link>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2">3. 전문 헤드헌터와 관계 맺기</h3>
                  <p className="!text-sm !my-0">
                    당신의 직무(IT, 마케팅, 재무 등)에 특화된 전문 헤드헌터를 링크드인 등에서 먼저 찾아 '1촌'을 맺고, 정중한 메시지로 자신을 소개해두세요. 좋은 관계는 좋은 기회로 이어집니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 헤드헌터와 소통하는 법
              </h2>
              <ul className="!my-2 space-y-2 text-base">
                <li><strong>솔직하지만, 전략적으로:</strong> 현재 상황과 희망 조건을 솔직하게 공유하되, 현재 연봉을 너무 낮춰 말할 필요는 없습니다. 희망 연봉은 '마지노선'이 아닌 '이상적인 금액'을 기준으로 제시하세요.</li>
                <li><strong>빠르고 명확한 피드백:</strong> 추천받은 포지션에 대해 진행 의사가 없더라도, 그 이유를 명확하고 정중하게 전달해야 더 좋은 다음 포지션을 추천받을 수 있습니다.</li>
                <li><strong>연봉 협상은 끝까지 직접 챙기기:</strong> 헤드헌터가 연봉 협상을 돕지만, 최종 결정은 당신의 몫입니다. 원하는 조건을 명확히 전달하고, 최종 오퍼 레터의 내용을 꼼꼼히 확인하세요.</li>
              </ul>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                헤드헌터의 연락을 부르는 프로필 만들기
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                좋은 헤드헌터를 활용하는 가장 좋은 방법은, 그들이 먼저 당신을 찾아오게 만드는 것입니다. 지금 바로 당신의 링크드인 프로필을 '매력적인 상품'으로 만들어보세요.
              </p>
              <Link
                href="/guides/linkedin-profile-how-to-make-headhunters-contact-you"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Linkedin className="inline-block w-5 h-5 mr-2" />
                링크드인 프로필 공략법 보기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
