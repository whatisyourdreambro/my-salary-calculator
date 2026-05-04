import Link from "next/link";
import { Home, Search, Calculator, BookOpen } from "lucide-react";

const SUGGESTED_LINKS = [
 { href: "/", label: "홈으로", icon: Home, description: "연봉 실수령액 계산기" },
 { href: "/tools", label: "금융 계산기", icon: Calculator, description: "30+ 종 무료 계산기" },
 { href: "/guides", label: "금융 가이드", icon: BookOpen, description: "직장인 절세·재테크" },
 { href: "/salary-db", label: "회사별 연봉", icon: Search, description: "기업 평균 연봉 비교" },
];

export default function NotFound() {
 return (
 <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-electric-10 mb-6">
 <span className="text-4xl font-black text-electric">404</span>
 </div>
 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy">
 페이지를 찾을 수 없습니다
 </h1>
 <p className="mt-4 text-base sm:text-lg leading-7 text-muted-blue max-w-xl mx-auto">
 요청하신 페이지가 존재하지 않거나, 주소가 변경되었습니다.
 <br className="hidden sm:block" />
 아래 추천 페이지에서 원하시는 정보를 찾아보세요.
 </p>

 <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
 {SUGGESTED_LINKS.map(({ href, label, icon: Icon, description }) => (
 <Link
 key={href}
 href={href}
 className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-canvas-200 hover:border-electric hover:bg-electric-5 transition-all"
 >
 <div className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center group-hover:bg-electric-10 transition-colors">
 <Icon className="w-5 h-5 text-electric" />
 </div>
 <p className="text-sm font-bold text-navy mt-1">{label}</p>
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
