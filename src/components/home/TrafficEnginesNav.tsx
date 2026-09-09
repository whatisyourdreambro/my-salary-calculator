import Link from "@/components/AppLink";
import { Building2, Briefcase, MapPin, Factory, ArrowRight } from "lucide-react";
const ENGINES = [
  { href: "/salary-db", title: "회사별 연봉", description: "회사별 공개 자료와 자체 추정 연봉을 비교합니다. 직급과 보상 범위를 함께 확인하세요.", icon: Building2 },
  { href: "/job", title: "직업별 연봉", description: "직업의 업무·경력 단계와 함께 참고 연봉을 살펴보세요.", icon: Briefcase },
  { href: "/industry", title: "산업별 연봉", description: "업종별 보상 구조와 같은 산업의 회사 정보를 탐색하세요.", icon: Factory },
  { href: "/region", title: "지역별 연봉", description: "지역별 참고 연봉을 살펴보고 생활비와 함께 비교하세요.", icon: MapPin },
];
export default function TrafficEnginesNav() {
  return <section className="ms-section border-t border-border bg-card" aria-labelledby="home-salary-research"><div className="page-width">
    <div className="mb-8 max-w-2xl"><p className="ms-eyebrow">보상 정보 탐색</p><h2 id="home-salary-research" className="text-2xl font-semibold tracking-tight sm:text-3xl mt-3">회사·직업·산업·지역별 연봉</h2><p className="ms-description mt-3">회사·직업·산업·지역별로 비교해 보세요. 실제 제안 금액과 같지 않은 참고 정보이며, 원자료와 추정 여부를 확인해야 합니다.</p></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{ENGINES.map(({ icon: Icon, ...item }) => <Link key={item.href} href={item.href} className="ms-surface ms-interactive group flex h-full flex-col p-6">
      <Icon className="mb-5 h-6 w-6 text-link" aria-hidden="true" /><h3 className="text-lg font-semibold text-foreground">{item.title}</h3><p className="mb-6 mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p><span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-link">{item.title} 보기 <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
    </Link>)}</div>
  </div></section>;
}
