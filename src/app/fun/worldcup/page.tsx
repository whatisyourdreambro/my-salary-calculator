import IdealTypeWorldCup, {
  type WorldcupCompany,
} from "@/components/IdealTypeWorldCup";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

export const metadata: Metadata = buildPageMetadata({
  title: "기업 이상형 월드컵 - 나의 꿈의 직장 찾기",
  description: "삼성전자·SK하이닉스 등 국내 대표 기업을 16강 토너먼트로 붙여 나의 꿈의 직장을 찾는 기업 이상형 월드컵. 평균 연봉·워라밸 점수를 비교하며 고르고 결과를 공유해보세요.",
  path: "/fun/worldcup",
  keywords: ["기업 이상형 월드컵", "꿈의 직장", "회사 월드컵", "이상형 월드컵"],
});

export default function WorldCupPage() {
  // 회사 전체 프로필(~860KB)을 클라 번들에 싣지 않도록 서버에서 게임에 필요한
  // 5개 필드만 추려 props 로 내려준다 (SalaryDbClient 와 동일한 경량 인덱스 패턴).
  const companies: WorldcupCompany[] = companyRepository.getAll().map((c) => ({
    logo: c.logo,
    nameKo: c.name.ko,
    industry: c.industry,
    entryBase: c.salary.entry.base,
    cultureScore: c.culture.score,
  }));

  return (
    <div className="min-h-screen pt-20 pb-20 pt-28">
      {/* 헤더는 서버 렌더 — 클라 컴포넌트의 랜덤 셔플 게이트와 무관하게
          h1 이 항상 SSR HTML 에 존재 (2026-08-30 감사 수정) */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-500/10 text-primary text-sm font-bold mb-4 border border-primary/20">
          Ideal Type World Cup
        </div>
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-2">
          기업 이상형 월드컵 🏆
        </h1>
        <p className="text-muted-foreground mb-8">당신의 마음속 1위 기업은 어디인가요?</p>
      </div>
      <IdealTypeWorldCup companies={companies} />
    </div>
  );
}
