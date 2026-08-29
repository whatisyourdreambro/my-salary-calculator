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
 /** 만원 단위 — base 연봉 (계약 연봉). 공시가 총급여만 제공하는 경우(은행 보수체계 연차보고서 등) 생략 가능 — 생략 시 UI는 "—" 표시 */
 baseManwon?: number;
 /** 만원 단위 — 영끌 평균 (base + 평균 OPI/TAI/RSU). 안 적으면 — 표시 */
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
 /**
  * 해외 본사 기준 글로벌 기업 (globalCompanies.ts 유래) — 국내 채용 시장과
  * 보상 체계가 달라 국내 전국·업종 랭킹 풀에서 제외하고 "글로벌 참고"로 표기.
  * data/companies/index.ts 병합 시점에 자동 주입 — 개별 데이터 파일에 기재 금지.
  * (tier:"foreign"은 국내 외국계 자회사도 포함하는 별개 축이라 판별자로 쓰지 않는다)
  */
 isGlobal?: boolean;
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

 /**
  * 옵션 — 공시 기준 평균연봉 (금융감독원 전자공시 DART 사업보고서·
  * 공공기관 알리오 등 공식 공시, 또는 이를 인용한 언론 보도 수치).
  * 추정치 기재 절대 금지 — 출처가 확인된 공시·보도 값만 넣는다.
  * UI 노출: CompanyDisclosedSalary 컴포넌트가 disclosed 있을 때만 렌더.
  */
 disclosed?: {
  /** 만원 단위 — 공시 기준 직원 1인 평균 급여액 */
  avgSalaryManwon: number;
  /** 사업연도 표기. 예: "2025", "2024/25 회계연도(2025년 5월 결산)" */
  fiscalYear: string;
  /** 평균 근속연수(년). 공시·보도로 확인된 경우만 기재 */
  avgTenureYears?: number;
  /** 출처 설명 — 매체·보도일·공시명 명시 */
  source: string;
  /** 출처 링크 (있으면 외부 링크로 노출, rel="nofollow noopener") */
  sourceUrl?: string;
  /** 산정 기준·주의점 등 부가 설명 */
  note?: string;
 };

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
