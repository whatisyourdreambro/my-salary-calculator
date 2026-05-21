// src/components/home/TrafficEnginesNav.tsx
//
// 홈/허브 페이지에서 트래픽 엔진 4종(회사·직업·산업·지역)으로 직접 보내는 카드.
// 사이트 유입의 대부분이 "{회사명}/{직업}/{지역} 연봉" 검색이므로,
// 홈에서 이 4개 허브로의 1-클릭 진입로가 PageRank 분배·CTR·체류시간 모두에 결정적.

import Link from "next/link";
import { Building2, Briefcase, MapPin, Factory, ArrowRight } from "lucide-react";

const ENGINES: Array<{
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}> = [
  {
    href: "/salary-db",
    title: "회사별 연봉",
    description: "삼성·SK·카카오·네이버 등 200+ 기업 신입 초봉·직급별 평균 연봉",
    icon: Building2,
    badge: "BEST",
  },
  {
    href: "/job",
    title: "직업별 연봉",
    description: "간호사·의사·개발자·공무원 등 직업별 평균 연봉·실수령액·연봉 협상",
    icon: Briefcase,
    badge: "인기",
  },
  {
    href: "/industry",
    title: "산업별 연봉",
    description: "반도체·IT·금융·자동차 등 업종별 평균 연봉 순위와 동종사 비교",
    icon: Factory,
  },
  {
    href: "/region",
    title: "지역별 연봉",
    description: "서울·경기·부산 등 17개 시도 평균 연봉과 신입~시니어 연봉 분포",
    icon: MapPin,
  },
];

export default function TrafficEnginesNav() {
  return (
    <section
      className="section-lg"
      style={{
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #DDE4EC",
      }}
    >
      <div className="page-width">
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <p
            className="duotone-badge"
            style={{ display: "inline-flex", marginBottom: "1rem" }}
          >
            <Building2 style={{ width: "12px", height: "12px" }} />
            Salary Database
          </p>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 900,
              color: "#0A1829",
              letterSpacing: "-0.035em",
              marginBottom: "0.5rem",
            }}
          >
            회사·직업·산업·지역별 연봉
          </h2>
          <p style={{ color: "#3D5E78", fontSize: "15px", fontWeight: 500 }}>
            내가 다닐 회사, 내가 원하는 직업, 우리 동네 평균 연봉까지 한곳에서
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENGINES.map((e) => {
            const Icon = e.icon;
            return (
              <Link
                key={e.href}
                href={e.href}
                className="group block h-full duotone-card p-6 hover:-translate-y-1 transition-transform"
                aria-label={`${e.title} 페이지로 이동`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-[14px] bg-electric-10 border border-electric/20 flex items-center justify-center group-hover:bg-electric group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6 text-electric group-hover:text-white transition-colors" />
                  </div>
                  {e.badge && (
                    <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-electric-10 text-electric border border-electric/20">
                      {e.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-navy mb-1 tracking-tight group-hover:text-electric transition-colors">
                  {e.title}
                </h3>
                <p className="text-[13px] text-faint-blue leading-relaxed font-medium mb-4">
                  {e.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-electric">
                  바로가기 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
