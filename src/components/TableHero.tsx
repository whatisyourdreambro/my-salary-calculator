import { TrendingUp } from "lucide-react";
interface TableHeroProps {
 badgeText: string;
 title: React.ReactNode;
 description: React.ReactNode;
}

// 상단 여백은 table/2026 layout 의 탭 바가 헤더 높이를 확보하므로 작게 유지
export default function TableHero({ badgeText, title, description }: TableHeroProps) {
 return (
 <section className="border-b border-border bg-card py-10 sm:py-14">
 <div className="ms-page max-w-5xl">
 {/* 배지 */}
 <div className="ms-eyebrow mb-4 inline-flex items-center gap-2">
 <TrendingUp className="h-4 w-4" aria-hidden="true" />
 <span>{badgeText}</span>
 </div>

 {/* 타이틀 */}
 <h1 className="ms-title mb-4 max-w-4xl">
 {title}
 </h1>

 {/* 서브 텍스트 */}
 <div className="ms-description max-w-3xl">
 {description}
 </div>
 </div>
 </section>
 );
}
