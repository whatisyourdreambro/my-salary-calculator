export type JobLevel = "entry" | "junior" | "senior" | "lead" | "executive";

export interface SalaryComponent {
 base: number; // Annual base salary in KRW
 incentive: {
 target: number; // Target percentage (e.g., 20%)
 max: number; // Max percentage (e.g., 50%)
 avgAmount?: number; // Estimated average amount in KRW
 };
 stock?: {
 type: "RSU" | "Option";
 amount: number; // Annual grant value in KRW
 vesting: string; // e.g., "4 years"
 };
 signOn?: number; // Typical sign-on bonus
}

export interface WorkLifeBalance {
 weeklyHours: {
 contract: number; // e.g., 40
 real: number; // e.g., 45 (The "Real" hours)
 };
 remoteWork: {
 policy: "remote" | "hybrid" | "office";
 daysPerWeek?: number; // If hybrid
 description?: string;
 };
 vacation: {
 days: number;
 usageRate: number; // 0-100% (How much people actually use)
 };
}

export interface BenefitItem {
 category: "financial" | "health" | "family" | "growth" | "lifestyle";
 title: string;
 description: string;
 value?: number; // Estimated annual monetary value
}

/**
 * 회사별 세부 직급 단계 (옵션).
 *
 * CL(Career Level) 체계처럼 같은 직급 내에서 연차 단위로 base 가 단계적으로
 * 올라가는 회사를 위한 데이터. 삼성전자의 CL1-1·CL1-2·CL2(2년 단위)·CL3·CL4
 * 같은 구조를 표현. 모든 회사에 필수가 아니라 — 명확한 단계 체계가 있는
 * 회사만 채우면 됨. 없으면 5단계 JobLevel(entry/junior/senior/lead/executive)
 * 만 노출.
 *
 * UI 노출: CompanyCareerLevels 컴포넌트가 careerLevels 가 있으면 자동으로
 * "직급별 세부 연봉표" 섹션을 렌더링.
 */
export interface CareerLevelStep {
 /** 직급 라벨. 예: "CL1-1", "CL2 (1~2년차)", "CL3 (3~4년차)" */
 label: string;
 /** 연차/배경 설명. 예: "고졸·전문대졸 입사 1~2년차" */
 description: string;
 /** 만원 단위 — base 연봉 (계약 연봉) */
 baseManwon: number;
 /** 만원 단위 — 영끌 평균 (base + 평균 OPI/TAI/RSU). 안 적으면 base 그대로 표시 */
 totalManwon?: number;
 /** 셀러리캡(직급 base 상한) 표시용. 단계가 cap에 근접/도달했을 때 강조 */
 isCapReached?: boolean;
}

export interface CareerLevelGroup {
 /** 그룹 라벨. 예: "CL2 (대리·사원)", "CL4 (부장·수석)" */
 group: string;
 /** 진급 기준 메모. 예: "대졸 신입 입사 → 9년차 CL3 진급(정규)" */
 promotionNote?: string;
 /** 직급 base 상한 (만원). 보도된 셀러리캡 — 표 하단에 별도 표시 */
 salaryCapManwon?: number;
 /** 세부 단계 목록 (2년 단위 등) */
 steps: CareerLevelStep[];
}

export interface CompanyProfile {
 id: string;
 name: {
 ko: string;
 en: string;
 };
 /** 검색 표기 변형(옛 사명·영문/한글 차이·줄임말 등). data/companyAliases.ts에서 주입됨 */
 aliases?: string[];
 industry: string;
 /** 표준 업종 id. CompanyRepository가 industry 원문을 정규화해 로드 시점에 주입. */
 industryId?: string;
 tier: "conglomerate" | "unicorn" | "startup" | "foreign" | "public";
 logo: string; // Path to image or emoji
 description: string;

 // Compensation Map by Level
 salary: Record<JobLevel, SalaryComponent>;

 /**
  * 옵션 — 회사 고유의 세부 직급 체계 (CL/호봉/Job Family 등).
  * 삼성전자처럼 CL1-1, CL1-2, CL2(2년 단위) 같은 단계가 있는 회사용.
  */
 careerLevels?: CareerLevelGroup[];

 // Work Life & Culture
 workLife: WorkLifeBalance;
 culture: {
 score: number; // 1-10
 keywords: string[]; // e.g., "Horizontal", "Intense", "Growth"
 pros: string[];
 cons: string[];
 };

 // Benefits
 benefits: BenefitItem[];

 // Meta
 lastUpdated: string;
}
