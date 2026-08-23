import IdealTypeWorldCup, {
  type WorldcupCompany,
} from "@/components/IdealTypeWorldCup";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

export const metadata: Metadata = buildPageMetadata({
  title: "기업 이상형 월드컵 - 나의 꿈의 직장 찾기",
  description: "당신의 꿈의 직장은 어디인가요? 16강 토너먼트로 알아보는 나의 최애 기업 찾기!",
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
      <IdealTypeWorldCup companies={companies} />
    </div>
  );
}
