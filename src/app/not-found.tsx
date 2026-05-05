import Link from "next/link";
import { Home, Search, Calculator, BookOpen, Building2, Receipt, Briefcase, Gift } from "lucide-react";

const SUGGESTED_LINKS = [
  { href: "/", label: "연봉 계산기", icon: Home, description: "2026 실수령액 즉시 계산" },
  { href: "/calc", label: "100가지 계산기", icon: Calculator, description: "세금·대출·투자·부동산" },
  { href: "/guides", label: "금융 가이드", icon: BookOpen, description: "직장인 절세·재테크" },
  { href: "/salary-db", label: "회사별 연봉", icon: Building2, description: "기업 평균 연봉 비교" },
  { href: "/calc/january-bonus", label: "13월의 월급", icon: Gift, description: "연말정산 환급 미리보기" },
  { href: "/calc/year-end-bonus", label: "성과급 세금", icon: Receipt, description: "직급별 보너스 실수령액" },
  { href: "/tools/finance/severance", label: "퇴직금 계산", icon: Briefcase, description: "환산급여 정확 계산" },
  { href: "/fire-calculator", label: "FIRE 계산기", icon: Search, description: "조기은퇴 자산 시뮬" },
];

export default function NotFound() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center bg-canvas dark:bg-canvas-950 min-h-[80vh]">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-electric-10 mb-6">
        <span className="text-4xl font-black text-electric">404</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-4 text-base sm:text-lg leading-7 text-muted-blue dark:text-canvas-300 max-w-xl mx-auto">
        요청하신 페이지가 존재하지 않거나, 주소가 변경되었습니다.
        <br className="hidden sm:block" />
        아래 인기 계산기에서 원하시는 도구를 찾아보세요.
      </p>

      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {SUGGESTED_LINKS.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 hover:border-electric hover:bg-electric-5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-canvas dark:bg-canvas-800 flex items-center justify-center group-hover:bg-electric-10 transition-colors">
              <Icon className="w-5 h-5 text-electric" />
            </div>
            <p className="text-sm font-bold text-navy dark:text-canvas-50 mt-1">{label}</p>
            <p className="text-xs text-faint-blue">{description}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="mt-12 inline-flex items-center gap-2 px-6 py-3 bg-electric text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        홈으로 돌아가기
      </Link>
    </main>
  );
}
