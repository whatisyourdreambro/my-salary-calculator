import type { Metadata } from "next";
import Link from "next/link";
import { Award, CalendarCheck, FileWarning } from "lucide-react"; // AlertCircle 제거

export const metadata: Metadata = {
  title: "주휴수당, 당신의 숨겨진 1일치 월급 | 조건, 계산법, Q&A 완벽정리",
  description:
    "주 15시간 이상 일했다면 당신도 받을 수 있다! 2025년 최신 주휴수당 지급 조건과 내 시급에 맞는 정확한 계산법, 못 받았을 때 대처법까지. 당신의 소중한 권리를 찾아드립니다.",
  openGraph: {
    title: "주휴수당, 당신의 숨겨진 1일치 월급 | 조건, 계산법 완벽정리",
    description:
      "주 15시간 이상 일했다면 당신도 받을 수 있습니다. 지금 바로 확인해보세요.",
    images: [
      "/api/og?title=주휴수당, 당신의 숨겨진 하루치 월급&description=지급 조건부터 계산법, Q&A까지",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주휴수당, 당신의 숨겨진 1일치 월급 | 조건, 계산법, Q&A 완벽정리",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-01",
  dateModified: "2025-09-20",
  description:
    "2025년 최신 주휴수당 지급 조건과 내 시급에 맞는 정확한 계산법, 못 받았을 때 대처법까지. 당신의 소중한 권리를 찾아드립니다.",
};

export default function HolidayAllowancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-lime-500 to-green-600 dark:from-gray-900 dark:to-lime-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            주휴수당,
            <br /> 당신의 숨겨진 월급입니다
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-green-100 dark:text-gray-300">
            아르바이트, 단기 계약직, 정규직 모두에게 해당되는 소중한 권리.
            일주일을 성실하게 채운 당신에게 주어지는 당연한 보상, 주휴수당의
            모든 것을 알려드립니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              일주일에 5일 일했는데, 6일치 급여를 받는다고? 바로
              &apos;주휴수당&apos; 덕분입니다. 근로기준법에 명시된 엄연한
              근로자의 권리이지만, 많은 분들이 지급 조건과 계산법을 잘 몰라
              놓치고 있습니다. 이 글을 끝까지 읽는다면, 당신의 통장에 잠들어
              있던 숨은 돈을 찾게 될지도 모릅니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <CalendarCheck className="w-7 h-7 text-lime-600" />
                나는 주휴수당 대상일까? (핵심 체크리스트 3가지)
              </h2>
              <p>
                복잡한 법 조항은 잊으세요. 아래 3가지 질문에 모두
                &apos;네&apos;라고 답할 수 있다면, 당신은 주휴수당을 받을 자격이
                충분합니다.
              </p>
              <ul className="!my-6 !pl-0 space-y-4">
                <li className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-lime-500">
                  <h3 className="!mt-0 !mb-1 font-semibold">
                    1. 일주일에 15시간 이상 일하기로 약속했나요?
                  </h3>
                  <p className="!my-0 !text-base">
                    근로계약서에 명시된 &apos;소정근로시간&apos;이 주 15시간
                    이상이어야 합니다. 실제 초과 근무 시간은 포함되지 않습니다.
                  </p>
                </li>
                <li className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-lime-500">
                  <h3 className="!mt-0 !mb-1 font-semibold">
                    이번 주, 약속한 날에 모두 출근했나요?
                  </h3>
                  <p className="!my-0 !text-base">
                    일하기로 약속한 날에 모두 출근, 즉 &apos;개근&apos;해야
                    합니다. 지각이나 조퇴는 결근이 아니지만, 단 하루라도
                    무단결근했다면 그 주의 주휴수당은 받을 수 없습니다.
                  </p>
                </li>
                <li className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-lime-500">
                  <h3 className="!mt-0 !mb-1 font-semibold">
                    다음 주에도 계속 일할 예정인가요?
                  </h3>
                  <p className="!my-0 !text-base">
                    주휴수당은 다음 주의 근로를 전제로 발생합니다. 따라서 마지막
                    근무를 마친 주에는 일반적으로 주휴수당이 발생하지 않습니다.
                  </p>
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Award className="w-7 h-7 text-amber-500" />내 주휴수당, 정확히
                얼마일까?
              </h2>
              <p>
                주휴수당은 보통 <strong>&apos;하루치 일급&apos;</strong>에
                해당합니다. 계산은 간단한 공식으로 할 수 있습니다.
              </p>
              <div className="mt-6 p-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 text-center">
                <p className="text-lg font-medium">주휴수당 계산 공식</p>
                <p className="text-xl sm:text-2xl font-bold my-2 text-wrap break-all">
                  (1주일 총 근로시간 / 40시간) × 8시간 × 시급
                </p>
              </div>
              <p className="mt-4">
                <strong>[실전 예시]</strong> 카페에서 시급 1만원을 받고, 월, 수,
                금, 토 주 4일, 하루 5시간씩 일하는 아르바이트생의 경우:
              </p>
              <ul className="!my-2">
                <li>
                  <strong>1주일 총 근로시간:</strong> 5시간 × 4일 = 20시간
                </li>
                <li>
                  <strong>주휴수당 계산:</strong> (20시간 / 40시간) × 8시간 ×
                  10,000원 = <strong>40,000원</strong>
                </li>
              </ul>
              <p>
                따라서 이 아르바이트생은 주급 200,000원 (20시간 × 10,000원)에
                주휴수당 40,000원을 더한 <strong>총 240,000원</strong>을 받아야
                마땅합니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileWarning className="w-7 h-7 text-red-500" />
                사장님이 주휴수당을 안 주신다면?
              </h2>
              <p>
                주휴수당 지급은 법적 의무입니다. 만약 위 조건을 모두
                충족하는데도 받지 못했다면, 이는 <strong>임금체불</strong>에
                해당합니다.
              </p>
              <ol className="!my-4">
                <li>
                  <strong>증거 자료 확보:</strong> 근로계약서, 급여명세서,
                  출퇴근 기록 등 근무 사실을 입증할 수 있는 자료를 최대한
                  모아두세요.
                </li>
                <li>
                  <strong>사장님과 대화:</strong> 먼저 사장님께 주휴수당 지급
                  의무에 대해 정중히 설명하고 지급을 요청하는 것이 좋습니다.
                </li>
                <li>
                  <strong>고용노동부 신고:</strong> 대화로 해결되지 않는다면,
                  관할 고용노동청에 임금체불 진정을 제기하여 법적인 도움을 받을
                  수 있습니다.
                </li>
              </ol>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">아는 것이 힘입니다</h2>
              <p>
                주휴수당은 당신의 땀과 노력에 대한 정당한 대가입니다. 더 이상
                헷갈리지 말고, 당신의 소중한 권리를 당당하게 챙기세요.
              </p>
              <Link
                href="/table/hourly"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                시급별 실수령액 테이블 확인하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
