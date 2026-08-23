import SalaryBattleClient, {
  type BattleCompanyOption,
} from "./SalaryBattleClient";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

// 서버 컴포넌트 — 회사 전체 프로필(~860KB)을 클라 번들에 싣지 않도록 셀렉터용
// 3필드 경량 목록만 props 로 내려준다. 전체 저장소는 FIGHT 클릭 시 지연 로드.
export default function BattlePage() {
  const options: BattleCompanyOption[] = companyRepository.getAll().map((c) => ({
    id: c.id,
    nameKo: c.name.ko,
    logo: c.logo,
  }));

  return <SalaryBattleClient options={options} />;
}
