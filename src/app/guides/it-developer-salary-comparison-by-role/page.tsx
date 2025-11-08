
import type { Metadata } from "next";
import Link from "next/link";
import { Code, BarChart2, TrendingUp, Lightbulb, Server, Brush, Smartphone, Shield, Link2, Bot, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "IT 개발자 직군별 연봉과 필요 역량 총정리 (2025년)",
  description:
    "프론트엔드, 백엔드, 데브옵스, AI, 정보보안 등 주요 IT 개발 직무별 신입/경력 연봉과 핵심 기술 스택, 성장성을 상세히 비교 분석합니다. 당신의 몸값을 높이는 커리어 전략을 찾아보세요.",
  openGraph: {
    title: "IT 개발자 직군별 연봉과 필요 역량 총정리 (2025년)",
    description:
      "어떤 개발 직무가 가장 높은 연봉을 받을까? IT 개발자라면 반드시 알아야 할 직무별 연봉과 커리어 가이드.",
    images: ["/api/og?title=IT 개발자 직군별 연봉과 필요 역량 총정리"],
  },
};

const developerRoles = [
  { icon: Server, role: "백엔드 개발자", junior: "4,500 ~ 6,500만원", senior: "8,000만원 ~ 1.5억원+", description: "서비스의 핵심 로직, 데이터베이스, API를 설계하고 구현합니다.", skills: "Java, Spring, Go, Python, Node.js, Kotlin", potential: "모든 서비스의 근간. 클라우드, 대용량 트래픽 처리 능력이 중요." },
  { icon: Brush, role: "프론트엔드 개발자", junior: "4,000 ~ 6,000만원", senior: "7,000만원 ~ 1.3억원+", description: "사용자가 직접 마주하는 웹 화면과 인터랙션을 개발합니다.", skills: "React, Vue, TypeScript, Next.js", potential: "사용자 경험(UX)의 중요성이 커지며 역할 증대. 웹 접근성, 성능 최적화 역량 필요." },
  { icon: Smartphone, role: "모바일 앱 개발자", junior: "4,500 ~ 6,500만원", senior: "7,500만원 ~ 1.4억원+", description: "iOS 또는 Android 앱을 개발하고 배포, 유지보수합니다.", skills: "Swift (iOS), Kotlin (Android)", potential: "네이티브 앱 뿐만 아니라 크로스플랫폼(Flutter, RN) 경험자 우대." },
  { icon: TrendingUp, role: "데브옵스 엔지니어", junior: "5,500 ~ 7,500만원", senior: "9,000만원 ~ 1.8억원+", description: "개발과 운영을 통합하여 서비스의 안정적이고 빠른 배포를 책임집니다.", skills: "AWS, GCP, Kubernetes, Docker, CI/CD", potential: "클라우드 전환 가속화로 수요가 가장 빠르게 증가하는 직군 중 하나." },
  { icon: Bot, role: "AI/머신러닝 엔지니어", junior: "6,000 ~ 8,000만원", senior: "1억원 ~ 2억원+", description: "데이터를 분석하고 머신러닝 모델을 개발하여 새로운 가치를 창출합니다.", skills: "Python, R, TensorFlow, PyTorch, MLOps", potential: "전 산업 분야에서 AI 도입이 활발해지며 최고 수준의 대우를 받는 직군." },
  { icon: Shield, role: "정보 보안 전문가", junior: "5,000 ~ 7,000만원", senior: "8,500만원 ~ 1.6억원+", description: "해킹, 정보 유출 등 외부 위협으로부터 서비스를 안전하게 보호합니다.", skills: "네트워크, 시스템, 암호학, C/C++", potential: "개인정보보호 및 서비스 안정성의 중요성이 커지며 수요 급증." },
  { icon: Link2, role: "블록체인 개발자", junior: "6,000 ~ 8,000만원", senior: "1억원 ~ 2억원+", description: "스마트 컨트랙트, DApp, 블록체인 코어 엔진 등을 개발합니다.", skills: "Solidity, Rust, Go, Web3.js", potential: "Web3, NFT, DeFi 등 새로운 시장을 개척하는 고연봉 전문 직군." },
];

export default function ItDeveloperSalaryComparisonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            IT 개발자 연봉,
            <br /> 직군별로 얼마나 다를까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            개발자 전성시대! 하지만 어떤 직무를 선택하느냐에 따라 연봉과 커리어 패스는 천차만별입니다. 프론트엔드부터 AI 엔지니어까지, 주요 IT 개발 직무별 연봉과 필요 역량을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              IT 산업의 폭발적인 성장과 함께 개발자는 가장 각광받는 직업 중 하나가 되었습니다. 하지만 '개발자'라는 큰 범주 안에는 수많은 전문 분야가 존재하며, 각 분야는 요구하는 기술 스택, 업무 내용, 그리고 연봉 수준에서 큰 차이를 보입니다. 자신의 적성과 목표에 맞는 직무를 선택하고, 그에 맞는 역량을 키우는 것이 성공적인 개발자 커리어의 핵심입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <BarChart2 className="w-7 h-7 text-green-500" />
                주요 개발 직군별 연봉 및 핵심 역량 (2025년)
              </h2>
              <p className="text-center text-sm">
                아래 연봉은 네카라쿠배 등 상위 IT 기업을 기준으로 한 추정치이며, 개인의 역량과 경력에 따라 크게 달라질 수 있습니다.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {developerRoles.map((item) => (
                  <div key={item.role} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 flex flex-col">
                    <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                      <item.icon className="w-6 h-6 text-signature-blue" /> {item.role}
                    </h3>
                    <div className="text-sm space-y-1 mb-4">
                        <p className="!my-0"><strong>신입/주니어:</strong> {item.junior}</p>
                        <p className="!my-0"><strong>시니어(5년 이상):</strong> {item.senior}</p>
                    </div>
                    <p className="!text-sm !my-1"><strong>하는 일:</strong> {item.description}</p>
                    <p className="!text-sm !my-1"><strong>필요 역량:</strong> {item.skills}</p>
                    <p className="!text-sm !my-1"><strong>성장성:</strong> {item.potential}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                억대 연봉, 내 통장엔 얼마가 찍힐까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                꿈의 연봉을 현실로 만들었을 때, 세후 실수령액은 얼마나 될까요? '연봉 계산기'로 당신의 미래 월급을 미리 계산해보세요.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/salary"
                    className="inline-block py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
                >
                    <Calculator className="inline-block w-5 h-5 mr-2" />
                    연봉 실수령액 계산하기
                </Link>
                <Link
                    href="/guides/nekarakubae-salary"
                    className="inline-block py-4 px-8 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-center font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 shadow-lg"
                >
                    네카라쿠배 가이드 보기
                </Link>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
