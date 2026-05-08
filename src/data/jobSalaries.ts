// src/data/jobSalaries.ts
// 한국 직장인 100대 직업 평균 연봉 데이터.
// NCS·고용노동부 통계청·잡플래닛·블라인드 종합 추정 (2026 기준).
// 정확한 수치는 매년 갱신 — 본 데이터는 평균 추정값.

export interface JobSalary {
 slug: string;
 name: string; // 한국어 직업명
 category:
 | "IT"
 | "금융"
 | "의료"
 | "교육"
 | "법률"
 | "회계세무"
 | "영업"
 | "마케팅"
 | "제조"
 | "디자인"
 | "서비스"
 | "공공"
 | "기술"
 | "미디어"
 | "건설"
 | "물류";
 entrySalary: number; // 신입 평균
 midSalary: number; // 5년차 평균
 seniorSalary: number; // 10년차+ 평균
 avgSalary: number; // 전체 평균
 topCompanies: string[]; // 대표 회사 TOP 3~5
 description: string;
 keywords: string[];
}

export const JOB_SALARIES: JobSalary[] = [
 // ── IT (20개) ─────────────────────────────────────────────
 { slug: "backend-developer", name: "백엔드 개발자", category: "IT", entrySalary: 45_000_000, midSalary: 65_000_000, seniorSalary: 95_000_000, avgSalary: 65_000_000, topCompanies: ["네이버", "카카오", "쿠팡", "토스", "라인"], description: "서버·DB·API 개발. Java/Kotlin/Python/Go 주력. IT 직군 중 가장 큰 채용 풀.", keywords: ["백엔드 개발자 연봉", "서버 개발자", "Java 개발자"] },
 { slug: "frontend-developer", name: "프론트엔드 개발자", category: "IT", entrySalary: 42_000_000, midSalary: 60_000_000, seniorSalary: 85_000_000, avgSalary: 60_000_000, topCompanies: ["네이버", "카카오", "쿠팡", "당근마켓", "토스"], description: "웹 UI 개발. React/Vue/Next.js. 디자인+개발 융합 역할.", keywords: ["프론트엔드 연봉", "React 개발자", "웹 개발자"] },
 { slug: "fullstack-developer", name: "풀스택 개발자", category: "IT", entrySalary: 43_000_000, midSalary: 62_000_000, seniorSalary: 90_000_000, avgSalary: 62_000_000, topCompanies: ["스타트업", "쿠팡", "배민", "토스"], description: "프론트+백엔드 동시. 스타트업·중소 IT 기업에서 선호.", keywords: ["풀스택 개발자", "풀스택 연봉"] },
 { slug: "android-developer", name: "안드로이드 개발자", category: "IT", entrySalary: 44_000_000, midSalary: 62_000_000, seniorSalary: 88_000_000, avgSalary: 62_000_000, topCompanies: ["네이버", "카카오", "라인", "토스", "쿠팡"], description: "Android 앱 개발. Kotlin/Java. 모바일 부문 핵심.", keywords: ["안드로이드 개발자", "Kotlin 개발자"] },
 { slug: "ios-developer", name: "iOS 개발자", category: "IT", entrySalary: 45_000_000, midSalary: 65_000_000, seniorSalary: 90_000_000, avgSalary: 65_000_000, topCompanies: ["네이버", "카카오", "라인", "토스"], description: "iPhone 앱 개발. Swift/Objective-C.", keywords: ["iOS 개발자", "Swift 개발자"] },
 { slug: "data-engineer", name: "데이터 엔지니어", category: "IT", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 110_000_000, avgSalary: 75_000_000, topCompanies: ["네이버", "카카오", "쿠팡", "토스", "당근"], description: "데이터 파이프라인·BigQuery·Spark·Airflow. 수요 폭증 직군.", keywords: ["데이터 엔지니어 연봉", "BigQuery"] },
 { slug: "data-scientist", name: "데이터 사이언티스트", category: "IT", entrySalary: 55_000_000, midSalary: 80_000_000, seniorSalary: 120_000_000, avgSalary: 80_000_000, topCompanies: ["네이버", "카카오", "쿠팡", "삼성", "LG"], description: "ML 모델링·통계 분석·A/B 테스트. 박사 우대.", keywords: ["데이터 사이언티스트", "ML 엔지니어 연봉"] },
 { slug: "ml-engineer", name: "머신러닝 엔지니어", category: "IT", entrySalary: 55_000_000, midSalary: 80_000_000, seniorSalary: 120_000_000, avgSalary: 80_000_000, topCompanies: ["네이버", "카카오", "삼성", "LG", "현대"], description: "ML 모델 프로덕션화. PyTorch·TensorFlow.", keywords: ["ML 엔지니어", "AI 엔지니어"] },
 { slug: "devops-engineer", name: "DevOps 엔지니어", category: "IT", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 105_000_000, avgSalary: 75_000_000, topCompanies: ["쿠팡", "토스", "네이버", "라인"], description: "AWS·K8s·CI/CD·인프라 운영. SRE 역할 포함.", keywords: ["DevOps 연봉", "SRE", "K8s"] },
 { slug: "security-engineer", name: "보안 엔지니어", category: "IT", entrySalary: 50_000_000, midSalary: 70_000_000, seniorSalary: 100_000_000, avgSalary: 70_000_000, topCompanies: ["국정원", "안랩", "네이버", "카카오"], description: "정보보안·침투테스트·SOC. 자격증(CISSP·CEH) 우대.", keywords: ["보안 엔지니어", "보안 컨설턴트"] },
 { slug: "qa-engineer", name: "QA 엔지니어", category: "IT", entrySalary: 38_000_000, midSalary: 55_000_000, seniorSalary: 75_000_000, avgSalary: 55_000_000, topCompanies: ["네이버", "카카오", "쿠팡", "라인"], description: "소프트웨어 품질 보증. 자동화 테스트·QA Ops.", keywords: ["QA 엔지니어", "테스트 엔지니어"] },
 { slug: "game-developer", name: "게임 개발자", category: "IT", entrySalary: 40_000_000, midSalary: 60_000_000, seniorSalary: 90_000_000, avgSalary: 60_000_000, topCompanies: ["엔씨소프트", "넥슨", "스마일게이트", "크래프톤", "넷마블"], description: "Unity·Unreal·자체 엔진. AAA·모바일 게임.", keywords: ["게임 개발자 연봉", "Unity 개발자"] },
 { slug: "embedded-developer", name: "임베디드 개발자", category: "IT", entrySalary: 42_000_000, midSalary: 58_000_000, seniorSalary: 85_000_000, avgSalary: 58_000_000, topCompanies: ["삼성전자", "LG전자", "현대모비스", "한화"], description: "C/C++ 펌웨어·MCU 개발. 자동차·가전·통신.", keywords: ["임베디드 개발자", "펌웨어 엔지니어"] },
 { slug: "ai-researcher", name: "AI 연구원", category: "IT", entrySalary: 60_000_000, midSalary: 90_000_000, seniorSalary: 150_000_000, avgSalary: 90_000_000, topCompanies: ["네이버", "카카오", "삼성", "LG", "현대모비스"], description: "AI 모델 연구·논문. 박사 필수에 가까움.", keywords: ["AI 연구원", "AI 박사"] },
 { slug: "product-manager", name: "프로덕트 매니저", category: "IT", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 110_000_000, avgSalary: 75_000_000, topCompanies: ["네이버", "카카오", "토스", "쿠팡", "당근"], description: "제품 기획·로드맵·우선순위. PM/PO 역할.", keywords: ["PM 연봉", "프로덕트 매니저", "PO"] },
 { slug: "ui-designer", name: "UI 디자이너", category: "IT", entrySalary: 38_000_000, midSalary: 55_000_000, seniorSalary: 75_000_000, avgSalary: 55_000_000, topCompanies: ["네이버", "카카오", "토스", "당근"], description: "Figma·UI 컴포넌트·디자인 시스템.", keywords: ["UI 디자이너", "UX 디자이너"] },
 { slug: "ux-designer", name: "UX 디자이너", category: "IT", entrySalary: 40_000_000, midSalary: 60_000_000, seniorSalary: 80_000_000, avgSalary: 60_000_000, topCompanies: ["네이버", "카카오", "토스", "쿠팡"], description: "사용자 경험 설계·UT·정보구조.", keywords: ["UX 디자이너 연봉", "UX 리서처"] },
 { slug: "data-analyst", name: "데이터 분석가", category: "IT", entrySalary: 42_000_000, midSalary: 60_000_000, seniorSalary: 85_000_000, avgSalary: 60_000_000, topCompanies: ["네이버", "카카오", "쿠팡", "토스"], description: "SQL·Python·BI 도구. 비즈니스 분석.", keywords: ["데이터 분석가", "BI 엔지니어"] },
 { slug: "blockchain-developer", name: "블록체인 개발자", category: "IT", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 110_000_000, avgSalary: 75_000_000, topCompanies: ["빗썸", "두나무", "카카오", "라인"], description: "스마트 컨트랙트·Solidity·EVM.", keywords: ["블록체인 개발자", "Solidity"] },
 { slug: "cloud-architect", name: "클라우드 아키텍트", category: "IT", entrySalary: 60_000_000, midSalary: 85_000_000, seniorSalary: 130_000_000, avgSalary: 85_000_000, topCompanies: ["AWS", "Azure", "삼성SDS", "LG CNS"], description: "AWS/Azure/GCP 아키텍처 설계. 자격증 우대.", keywords: ["클라우드 아키텍트", "AWS 솔루션 아키텍트"] },

 // ── 금융 (15개) ─────────────────────────────────────────────
 { slug: "bank-clerk", name: "은행원", category: "금융", entrySalary: 48_000_000, midSalary: 70_000_000, seniorSalary: 100_000_000, avgSalary: 65_000_000, topCompanies: ["KB국민은행", "신한은행", "하나은행", "우리은행", "농협"], description: "예금·대출·외환 업무. 5대 시중은행 + 지방은행.", keywords: ["은행원 연봉", "은행 신입", "시중은행"] },
 { slug: "investment-banker", name: "IB 애널리스트", category: "금융", entrySalary: 70_000_000, midSalary: 120_000_000, seniorSalary: 200_000_000, avgSalary: 120_000_000, topCompanies: ["미래에셋", "한국투자", "NH투자", "삼성", "골드만삭스"], description: "M&A·IPO·기업금융. 회계·재무 전공 + 영어.", keywords: ["IB 연봉", "투자은행", "M&A 애널리스트"] },
 { slug: "fund-manager", name: "펀드매니저", category: "금융", entrySalary: 60_000_000, midSalary: 100_000_000, seniorSalary: 200_000_000, avgSalary: 100_000_000, topCompanies: ["미래에셋자산운용", "삼성자산운용", "한국투자신탁", "KB자산운용"], description: "주식·채권 포트폴리오 운용. CFA 필수.", keywords: ["펀드매니저 연봉", "자산운용사"] },
 { slug: "stock-broker", name: "주식 브로커", category: "금융", entrySalary: 50_000_000, midSalary: 80_000_000, seniorSalary: 150_000_000, avgSalary: 80_000_000, topCompanies: ["미래에셋증권", "키움증권", "삼성증권", "NH투자증권"], description: "주식 매매 중개·고객 자문. 증권사 PB.", keywords: ["주식 브로커", "증권 PB"] },
 { slug: "actuary", name: "보험 계리사", category: "금융", entrySalary: 55_000_000, midSalary: 80_000_000, seniorSalary: 130_000_000, avgSalary: 80_000_000, topCompanies: ["삼성생명", "한화생명", "교보생명", "현대해상"], description: "보험료 산정·리스크 평가. 계리사 자격증 필수.", keywords: ["보험 계리사", "actuary 연봉"] },
 { slug: "insurance-planner", name: "보험 설계사", category: "금융", entrySalary: 35_000_000, midSalary: 60_000_000, seniorSalary: 120_000_000, avgSalary: 60_000_000, topCompanies: ["삼성생명", "교보생명", "한화생명", "현대해상"], description: "개인 보험 영업·자산 컨설팅. 성과급 비중 큼.", keywords: ["보험 설계사", "보험 영업"] },
 { slug: "credit-card-analyst", name: "카드사 분석가", category: "금융", entrySalary: 45_000_000, midSalary: 65_000_000, seniorSalary: 90_000_000, avgSalary: 65_000_000, topCompanies: ["삼성카드", "신한카드", "현대카드", "KB국민카드"], description: "리스크 모델링·고객 세그멘테이션.", keywords: ["카드사 연봉", "카드 분석가"] },
 { slug: "risk-manager", name: "리스크 매니저", category: "금융", entrySalary: 55_000_000, midSalary: 80_000_000, seniorSalary: 130_000_000, avgSalary: 80_000_000, topCompanies: ["하나은행", "신한", "삼성생명", "한화"], description: "신용·시장·운영 리스크 관리. FRM 우대.", keywords: ["리스크 매니저", "FRM 연봉"] },
 { slug: "financial-planner", name: "재무 설계사 (FP)", category: "금융", entrySalary: 40_000_000, midSalary: 65_000_000, seniorSalary: 110_000_000, avgSalary: 65_000_000, topCompanies: ["증권사", "은행 PB", "보험사"], description: "고액 자산가 종합 컨설팅. AFPK·CFP 필수.", keywords: ["재무 설계사", "FP 연봉", "CFP"] },
 { slug: "credit-analyst", name: "신용 분석가", category: "금융", entrySalary: 48_000_000, midSalary: 70_000_000, seniorSalary: 100_000_000, avgSalary: 70_000_000, topCompanies: ["NICE신용평가", "한국신용평가", "은행"], description: "기업 신용도 평가·등급 산정.", keywords: ["신용 분석가", "신용평가사"] },
 { slug: "compliance-officer", name: "준법감시인", category: "금융", entrySalary: 55_000_000, midSalary: 80_000_000, seniorSalary: 120_000_000, avgSalary: 80_000_000, topCompanies: ["은행", "증권사", "보험사"], description: "내부통제·자금세탁방지·감독 대응.", keywords: ["준법감시인", "Compliance"] },
 { slug: "trader", name: "트레이더", category: "금융", entrySalary: 70_000_000, midSalary: 130_000_000, seniorSalary: 250_000_000, avgSalary: 130_000_000, topCompanies: ["증권사 본사", "외국계 IB"], description: "주식·채권·파생상품 자기매매. 성과급 절대적.", keywords: ["트레이더 연봉", "딜러"] },
 { slug: "fintech-developer", name: "핀테크 개발자", category: "금융", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 110_000_000, avgSalary: 75_000_000, topCompanies: ["토스", "카카오뱅크", "비바리퍼블리카", "두나무"], description: "결제·송금·자산 관리 서비스 개발.", keywords: ["핀테크 개발자", "토스 개발자"] },
 { slug: "venture-capitalist", name: "벤처 캐피탈 (VC)", category: "금융", entrySalary: 65_000_000, midSalary: 100_000_000, seniorSalary: 200_000_000, avgSalary: 100_000_000, topCompanies: ["KB인베스트먼트", "한투파트너스", "스톤브릿지", "TBT"], description: "스타트업 투자·심사역. 산업 전문성 우대.", keywords: ["VC 연봉", "벤처캐피탈 심사역"] },
 { slug: "private-equity", name: "사모펀드 (PE)", category: "금융", entrySalary: 90_000_000, midSalary: 180_000_000, seniorSalary: 350_000_000, avgSalary: 180_000_000, topCompanies: ["MBK파트너스", "한앤컴퍼니", "스카이레이크", "IMM PE"], description: "기업 인수·운영 후 매각. 금융 최상위.", keywords: ["PE 연봉", "사모펀드 매니저"] },

 // ── 의료 (12개) ─────────────────────────────────────────────
 { slug: "doctor", name: "의사 (개원의)", category: "의료", entrySalary: 100_000_000, midSalary: 200_000_000, seniorSalary: 400_000_000, avgSalary: 200_000_000, topCompanies: ["개원", "대학병원", "종합병원"], description: "전공의 → 전문의 → 개원 또는 봉직. 진료과별 큰 차이.", keywords: ["의사 연봉", "전문의 연봉", "개원의"] },
 { slug: "doctor-resident", name: "전공의", category: "의료", entrySalary: 60_000_000, midSalary: 70_000_000, seniorSalary: 80_000_000, avgSalary: 65_000_000, topCompanies: ["서울대병원", "삼성서울", "아산", "세브란스"], description: "전문의 자격 취득 과정. 4~5년 수련.", keywords: ["전공의 연봉", "수련의"] },
 { slug: "dentist", name: "치과의사", category: "의료", entrySalary: 80_000_000, midSalary: 150_000_000, seniorSalary: 300_000_000, avgSalary: 150_000_000, topCompanies: ["개원", "치과병원"], description: "치과대학 졸업 + 전문의 또는 일반의. 개원 비중 큼.", keywords: ["치과의사 연봉", "치과 의사"] },
 { slug: "oriental-doctor", name: "한의사", category: "의료", entrySalary: 60_000_000, midSalary: 100_000_000, seniorSalary: 180_000_000, avgSalary: 100_000_000, topCompanies: ["개원", "한방병원"], description: "한의대 졸업. 침·약·보약 등 한방 진료.", keywords: ["한의사 연봉"] },
 { slug: "pharmacist", name: "약사", category: "의료", entrySalary: 55_000_000, midSalary: 80_000_000, seniorSalary: 130_000_000, avgSalary: 80_000_000, topCompanies: ["개국 약국", "병원 약국", "제약사"], description: "약대 6년 + 약사 자격. 개국 또는 병원 약사.", keywords: ["약사 연봉"] },
 { slug: "nurse", name: "간호사", category: "의료", entrySalary: 38_000_000, midSalary: 50_000_000, seniorSalary: 70_000_000, avgSalary: 50_000_000, topCompanies: ["서울대병원", "삼성서울", "아산", "세브란스", "분당서울대"], description: "3교대 근무. 야근수당·당직수당 별도. 인력 부족 직군.", keywords: ["간호사 연봉", "신입 간호사"] },
 { slug: "nutritionist", name: "영양사", category: "의료", entrySalary: 32_000_000, midSalary: 42_000_000, seniorSalary: 55_000_000, avgSalary: 42_000_000, topCompanies: ["병원", "학교", "급식회사"], description: "병원·단체급식·학교. 식단 설계·영양 관리.", keywords: ["영양사 연봉"] },
 { slug: "physical-therapist", name: "물리치료사", category: "의료", entrySalary: 35_000_000, midSalary: 45_000_000, seniorSalary: 60_000_000, avgSalary: 45_000_000, topCompanies: ["병원", "재활센터", "스포츠센터"], description: "물리치료·재활 운동. 정형외과·신경과·재활의학과.", keywords: ["물리치료사 연봉"] },
 { slug: "veterinarian", name: "수의사", category: "의료", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 130_000_000, avgSalary: 75_000_000, topCompanies: ["동물병원", "검역원", "축산기업"], description: "반려동물 + 산업동물 진료.", keywords: ["수의사 연봉"] },
 { slug: "medical-technologist", name: "임상병리사", category: "의료", entrySalary: 35_000_000, midSalary: 48_000_000, seniorSalary: 65_000_000, avgSalary: 48_000_000, topCompanies: ["병원", "건강검진센터", "진단검사기관"], description: "혈액·체액 검사. 진단 보조.", keywords: ["임상병리사"] },
 { slug: "radiologic-technologist", name: "방사선사", category: "의료", entrySalary: 38_000_000, midSalary: 52_000_000, seniorSalary: 70_000_000, avgSalary: 52_000_000, topCompanies: ["대학병원", "종합병원", "건강검진센터"], description: "X-ray·CT·MRI 촬영. 야간 당직 가능.", keywords: ["방사선사 연봉"] },
 { slug: "dental-hygienist", name: "치과위생사", category: "의료", entrySalary: 32_000_000, midSalary: 42_000_000, seniorSalary: 55_000_000, avgSalary: 42_000_000, topCompanies: ["치과병원·의원"], description: "스케일링·치과 진료 보조·환자 관리.", keywords: ["치과위생사 연봉"] },

 // ── 교육 (10개) ─────────────────────────────────────────────
 { slug: "elementary-teacher", name: "초등학교 교사", category: "교육", entrySalary: 38_000_000, midSalary: 55_000_000, seniorSalary: 75_000_000, avgSalary: 55_000_000, topCompanies: ["교육청", "초등학교"], description: "교대 → 임용시험. 8호봉 시작 (초임).", keywords: ["초등 교사 연봉", "초임 교사"] },
 { slug: "middle-school-teacher", name: "중학교 교사", category: "교육", entrySalary: 38_000_000, midSalary: 55_000_000, seniorSalary: 75_000_000, avgSalary: 55_000_000, topCompanies: ["교육청", "중학교"], description: "사대 → 임용시험. 과목별 채용.", keywords: ["중등 교사 연봉"] },
 { slug: "high-school-teacher", name: "고등학교 교사", category: "교육", entrySalary: 38_000_000, midSalary: 58_000_000, seniorSalary: 80_000_000, avgSalary: 58_000_000, topCompanies: ["교육청", "고등학교"], description: "사대·자격증 → 임용시험. 인문/이공/예체능.", keywords: ["고등 교사 연봉"] },
 { slug: "professor", name: "대학교수", category: "교육", entrySalary: 60_000_000, midSalary: 90_000_000, seniorSalary: 150_000_000, avgSalary: 90_000_000, topCompanies: ["서울대", "연세대", "고려대", "KAIST", "포항공대"], description: "박사 필수. 정년 보장 후 안정적.", keywords: ["대학교수 연봉", "교수 급여"] },
 { slug: "academic-instructor", name: "학원 강사", category: "교육", entrySalary: 35_000_000, midSalary: 60_000_000, seniorSalary: 150_000_000, avgSalary: 60_000_000, topCompanies: ["대성", "메가스터디", "EBS"], description: "스타 강사는 수억대. 일반 강사는 50~80만/시간.", keywords: ["학원 강사 연봉"] },
 { slug: "online-instructor", name: "인강 강사", category: "교육", entrySalary: 50_000_000, midSalary: 100_000_000, seniorSalary: 500_000_000, avgSalary: 100_000_000, topCompanies: ["메가스터디", "EBS", "이투스", "대성마이맥"], description: "메가스터디·이투스 등 온라인 강의. 콘텐츠 의존 큼.", keywords: ["인강 강사", "메가스터디 강사"] },
 { slug: "kindergarten-teacher", name: "유치원 교사", category: "교육", entrySalary: 30_000_000, midSalary: 40_000_000, seniorSalary: 55_000_000, avgSalary: 40_000_000, topCompanies: ["사립 유치원", "공립 유치원"], description: "유아교육과 졸업 + 정교사 자격.", keywords: ["유치원 교사 연봉"] },
 { slug: "daycare-teacher", name: "어린이집 교사", category: "교육", entrySalary: 28_000_000, midSalary: 38_000_000, seniorSalary: 50_000_000, avgSalary: 38_000_000, topCompanies: ["국공립 어린이집", "민간 어린이집"], description: "보육교사 자격 + 영유아 보육.", keywords: ["어린이집 교사", "보육교사"] },
 { slug: "research-fellow", name: "연구원 (대학)", category: "교육", entrySalary: 45_000_000, midSalary: 70_000_000, seniorSalary: 110_000_000, avgSalary: 70_000_000, topCompanies: ["대학", "출연연구소"], description: "박사후·연구교수. 정년 보장은 아님.", keywords: ["연구원 연봉", "포닥 연봉"] },
 { slug: "tutor", name: "과외 교사", category: "교육", entrySalary: 25_000_000, midSalary: 50_000_000, seniorSalary: 100_000_000, avgSalary: 50_000_000, topCompanies: ["프리랜서"], description: "1:1 또는 그룹 과외. 시간당 5~10만원, 인기 강사 30만+.", keywords: ["과외 교사", "과외 연봉"] },

 // ── 법률·회계세무 (10개) ─────────────────────────────────────
 { slug: "lawyer", name: "변호사", category: "법률", entrySalary: 60_000_000, midSalary: 120_000_000, seniorSalary: 250_000_000, avgSalary: 120_000_000, topCompanies: ["김앤장", "광장", "태평양", "세종", "율촌"], description: "법전원 → 변호사시험. 대형로펌(빅5) 신입 1.2~1.5억.", keywords: ["변호사 연봉", "로펌 연봉"] },
 { slug: "judge", name: "판사", category: "법률", entrySalary: 70_000_000, midSalary: 110_000_000, seniorSalary: 180_000_000, avgSalary: 110_000_000, topCompanies: ["법원"], description: "법관임용시험 + 법조경력 5년+. 정년 보장.", keywords: ["판사 연봉"] },
 { slug: "prosecutor", name: "검사", category: "법률", entrySalary: 70_000_000, midSalary: 110_000_000, seniorSalary: 180_000_000, avgSalary: 110_000_000, topCompanies: ["검찰청"], description: "검사임용시험. 형사소송 담당.", keywords: ["검사 연봉"] },
 { slug: "patent-attorney", name: "변리사", category: "법률", entrySalary: 70_000_000, midSalary: 110_000_000, seniorSalary: 200_000_000, avgSalary: 110_000_000, topCompanies: ["특허법인 김앤장", "특허법인 광장", "특허법인 다래"], description: "변리사 자격 + 이공계. 특허 출원·등록.", keywords: ["변리사 연봉"] },
 { slug: "judicial-scrivener", name: "법무사", category: "법률", entrySalary: 50_000_000, midSalary: 80_000_000, seniorSalary: 130_000_000, avgSalary: 80_000_000, topCompanies: ["법무사 사무소"], description: "법무사 자격 → 등기·소장 작성. 변호사보다 좁은 업무.", keywords: ["법무사 연봉"] },
 { slug: "accountant", name: "공인회계사 (CPA)", category: "회계세무", entrySalary: 60_000_000, midSalary: 100_000_000, seniorSalary: 180_000_000, avgSalary: 100_000_000, topCompanies: ["삼일PwC", "삼정KPMG", "한영EY", "안진Deloitte"], description: "회계사 자격 + 빅4 회계법인. 감사·세무·자문.", keywords: ["회계사 연봉", "CPA 연봉"] },
 { slug: "tax-accountant", name: "세무사", category: "회계세무", entrySalary: 50_000_000, midSalary: 80_000_000, seniorSalary: 150_000_000, avgSalary: 80_000_000, topCompanies: ["세무법인", "개업"], description: "세무사 자격 → 신고대리·세무 자문.", keywords: ["세무사 연봉"] },
 { slug: "bookkeeper", name: "경리·회계 직원", category: "회계세무", entrySalary: 32_000_000, midSalary: 45_000_000, seniorSalary: 60_000_000, avgSalary: 45_000_000, topCompanies: ["일반 기업"], description: "기업 회계·세무 사무. CPA 자격은 아님.", keywords: ["경리 연봉", "회계 직원"] },
 { slug: "labor-attorney", name: "노무사", category: "법률", entrySalary: 50_000_000, midSalary: 80_000_000, seniorSalary: 130_000_000, avgSalary: 80_000_000, topCompanies: ["노무법인", "기업 인사팀"], description: "노무사 자격 → 노동법·인사 컨설팅.", keywords: ["노무사 연봉"] },
 { slug: "real-estate-broker", name: "공인중개사", category: "법률", entrySalary: 30_000_000, midSalary: 60_000_000, seniorSalary: 150_000_000, avgSalary: 60_000_000, topCompanies: ["공인중개사 사무소"], description: "공인중개사 자격 → 부동산 중개. 수수료 변동 큼.", keywords: ["공인중개사 연봉"] },

 // ── 영업·마케팅 (10개) ─────────────────────────────────────
 { slug: "b2b-sales", name: "B2B 영업", category: "영업", entrySalary: 40_000_000, midSalary: 65_000_000, seniorSalary: 110_000_000, avgSalary: 65_000_000, topCompanies: ["삼성", "LG", "현대", "포스코"], description: "기업 고객 영업. 인센티브 30~50%.", keywords: ["B2B 영업 연봉"] },
 { slug: "b2c-sales", name: "B2C 영업", category: "영업", entrySalary: 35_000_000, midSalary: 55_000_000, seniorSalary: 90_000_000, avgSalary: 55_000_000, topCompanies: ["통신사", "보험사", "유통"], description: "개인 고객 영업. 통신·보험·자동차.", keywords: ["B2C 영업 연봉"] },
 { slug: "marketing-manager", name: "마케팅 매니저", category: "마케팅", entrySalary: 42_000_000, midSalary: 65_000_000, seniorSalary: 100_000_000, avgSalary: 65_000_000, topCompanies: ["대기업", "스타트업"], description: "브랜드·디지털·퍼포먼스 마케팅 통합.", keywords: ["마케팅 매니저", "마케터 연봉"] },
 { slug: "performance-marketer", name: "퍼포먼스 마케터", category: "마케팅", entrySalary: 38_000_000, midSalary: 60_000_000, seniorSalary: 90_000_000, avgSalary: 60_000_000, topCompanies: ["스타트업", "이커머스"], description: "구글·메타·네이버 광고 운영. ROI 분석.", keywords: ["퍼포먼스 마케터", "그로스해커"] },
 { slug: "brand-manager", name: "브랜드 매니저", category: "마케팅", entrySalary: 45_000_000, midSalary: 70_000_000, seniorSalary: 110_000_000, avgSalary: 70_000_000, topCompanies: ["P&G", "유니레버", "LG생활건강", "아모레"], description: "브랜드 전략·캠페인. 외국계 + 국내 빅브랜드.", keywords: ["브랜드 매니저"] },
 { slug: "content-marketer", name: "콘텐츠 마케터", category: "마케팅", entrySalary: 35_000_000, midSalary: 55_000_000, seniorSalary: 80_000_000, avgSalary: 55_000_000, topCompanies: ["스타트업", "미디어 회사"], description: "블로그·SNS·뉴스레터 콘텐츠 기획·작성.", keywords: ["콘텐츠 마케터"] },
 { slug: "pr-specialist", name: "PR 전문가", category: "마케팅", entrySalary: 38_000_000, midSalary: 60_000_000, seniorSalary: 90_000_000, avgSalary: 60_000_000, topCompanies: ["대홍기획", "이노션", "제일기획"], description: "언론·매체 관계 + 위기관리.", keywords: ["PR 연봉", "홍보 담당"] },
 { slug: "sales-engineer", name: "세일즈 엔지니어", category: "영업", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 110_000_000, avgSalary: 75_000_000, topCompanies: ["IBM", "오라클", "AWS", "Salesforce"], description: "기술+영업 융합. SaaS·B2B 솔루션.", keywords: ["세일즈 엔지니어"] },
 { slug: "key-account-manager", name: "키 어카운트 매니저 (KAM)", category: "영업", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 120_000_000, avgSalary: 75_000_000, topCompanies: ["대기업"], description: "주요 고객 전담 관리. 외국계 강세.", keywords: ["KAM 연봉"] },
 { slug: "ad-planner", name: "광고 기획자 (AE)", category: "마케팅", entrySalary: 40_000_000, midSalary: 60_000_000, seniorSalary: 90_000_000, avgSalary: 60_000_000, topCompanies: ["제일기획", "이노션", "TBWA"], description: "광고 캠페인 기획·집행. 광고대행사 핵심.", keywords: ["광고 AE", "광고 기획자"] },

 // ── 제조 (10개) ─────────────────────────────────────────────
 { slug: "mechanical-engineer", name: "기계 엔지니어", category: "제조", entrySalary: 45_000_000, midSalary: 65_000_000, seniorSalary: 95_000_000, avgSalary: 65_000_000, topCompanies: ["현대자동차", "기아", "두산", "LG전자", "삼성"], description: "설계·제조·품질. 자동차·중공업·가전.", keywords: ["기계 엔지니어 연봉"] },
 { slug: "electrical-engineer", name: "전기 엔지니어", category: "제조", entrySalary: 45_000_000, midSalary: 65_000_000, seniorSalary: 95_000_000, avgSalary: 65_000_000, topCompanies: ["삼성전자", "LG전자", "한전", "포스코"], description: "전기·전자 회로·시스템 설계.", keywords: ["전기 엔지니어"] },
 { slug: "semiconductor-engineer", name: "반도체 엔지니어", category: "제조", entrySalary: 55_000_000, midSalary: 80_000_000, seniorSalary: 130_000_000, avgSalary: 80_000_000, topCompanies: ["삼성전자", "SK하이닉스", "DB하이텍"], description: "공정·설계·테스트. 한국 최고 대우 직군.", keywords: ["반도체 엔지니어 연봉", "삼성 반도체"] },
 { slug: "chemical-engineer", name: "화학 엔지니어", category: "제조", entrySalary: 48_000_000, midSalary: 70_000_000, seniorSalary: 100_000_000, avgSalary: 70_000_000, topCompanies: ["LG화학", "롯데케미칼", "SK이노베이션", "한화솔루션"], description: "공정·화학 분석·개발.", keywords: ["화학 엔지니어"] },
 { slug: "production-engineer", name: "생산 엔지니어", category: "제조", entrySalary: 42_000_000, midSalary: 60_000_000, seniorSalary: 85_000_000, avgSalary: 60_000_000, topCompanies: ["대기업 생산공장"], description: "공정 개선·품질 관리·생산 관리.", keywords: ["생산 엔지니어"] },
 { slug: "quality-engineer", name: "품질 엔지니어", category: "제조", entrySalary: 42_000_000, midSalary: 58_000_000, seniorSalary: 80_000_000, avgSalary: 58_000_000, topCompanies: ["제조 대기업"], description: "품질 보증·시스템 인증.", keywords: ["품질 엔지니어"] },
 { slug: "rd-researcher", name: "R&D 연구원", category: "제조", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 120_000_000, avgSalary: 75_000_000, topCompanies: ["삼성전자", "LG전자", "현대모비스", "포스코"], description: "기업 부설 연구소. 박사 우대.", keywords: ["R&D 연구원 연봉"] },
 { slug: "biotech-researcher", name: "바이오 연구원", category: "제조", entrySalary: 48_000_000, midSalary: 72_000_000, seniorSalary: 110_000_000, avgSalary: 72_000_000, topCompanies: ["셀트리온", "삼성바이오로직스", "녹십자", "한미약품"], description: "신약 개발·임상·바이오 의약품.", keywords: ["바이오 연구원"] },
 { slug: "automotive-engineer", name: "자동차 엔지니어", category: "제조", entrySalary: 50_000_000, midSalary: 72_000_000, seniorSalary: 105_000_000, avgSalary: 72_000_000, topCompanies: ["현대자동차", "기아", "현대모비스", "한국GM", "르노삼성"], description: "차량 설계·전기차·자율주행.", keywords: ["자동차 엔지니어 연봉"] },
 { slug: "factory-worker", name: "생산직 사원", category: "제조", entrySalary: 38_000_000, midSalary: 55_000_000, seniorSalary: 85_000_000, avgSalary: 55_000_000, topCompanies: ["현대차 생산", "삼성 라인", "포스코"], description: "생산 라인 작업. 4조 3교대 + 야간수당.", keywords: ["생산직 연봉", "현대차 생산직"] },

 // ── 디자인·미디어 (8개) ─────────────────────────────────
 { slug: "graphic-designer", name: "그래픽 디자이너", category: "디자인", entrySalary: 32_000_000, midSalary: 48_000_000, seniorSalary: 70_000_000, avgSalary: 48_000_000, topCompanies: ["디자인 에이전시", "출판사", "광고대행사"], description: "포스터·브랜딩·인쇄물 디자인.", keywords: ["그래픽 디자이너"] },
 { slug: "web-designer", name: "웹 디자이너", category: "디자인", entrySalary: 33_000_000, midSalary: 50_000_000, seniorSalary: 70_000_000, avgSalary: 50_000_000, topCompanies: ["웹 에이전시", "쇼핑몰"], description: "웹사이트·랜딩페이지 디자인.", keywords: ["웹 디자이너"] },
 { slug: "video-editor", name: "영상 편집자", category: "미디어", entrySalary: 32_000_000, midSalary: 48_000_000, seniorSalary: 75_000_000, avgSalary: 48_000_000, topCompanies: ["방송국", "유튜브 제작사"], description: "Premiere·Final Cut·편집 디자인.", keywords: ["영상 편집자 연봉"] },
 { slug: "youtuber", name: "유튜버 (전업)", category: "미디어", entrySalary: 24_000_000, midSalary: 80_000_000, seniorSalary: 500_000_000, avgSalary: 80_000_000, topCompanies: ["프리랜서"], description: "광고·후원·MCN. 채널 규모 따라 변동 큼.", keywords: ["유튜버 연봉"] },
 { slug: "broadcasting-pd", name: "방송 PD", category: "미디어", entrySalary: 50_000_000, midSalary: 80_000_000, seniorSalary: 130_000_000, avgSalary: 80_000_000, topCompanies: ["KBS", "MBC", "SBS", "JTBC", "tvN"], description: "프로그램 기획·연출. 입사 경쟁률 매우 높음.", keywords: ["방송 PD 연봉"] },
 { slug: "journalist", name: "기자", category: "미디어", entrySalary: 45_000_000, midSalary: 70_000_000, seniorSalary: 100_000_000, avgSalary: 70_000_000, topCompanies: ["조선일보", "중앙일보", "동아일보", "한국경제"], description: "신문·방송·인터넷 기자.", keywords: ["기자 연봉"] },
 { slug: "fashion-designer", name: "패션 디자이너", category: "디자인", entrySalary: 32_000_000, midSalary: 50_000_000, seniorSalary: 80_000_000, avgSalary: 50_000_000, topCompanies: ["LF", "한섬", "삼성물산패션", "이랜드"], description: "의류 디자인·MD 협업.", keywords: ["패션 디자이너"] },
 { slug: "interior-designer", name: "인테리어 디자이너", category: "디자인", entrySalary: 35_000_000, midSalary: 52_000_000, seniorSalary: 75_000_000, avgSalary: 52_000_000, topCompanies: ["인테리어 스튜디오", "건설사"], description: "주거·상업 공간 인테리어.", keywords: ["인테리어 디자이너"] },

 // ── 서비스·공공·기술·건설·물류 (15개) ────────────────────
 { slug: "civil-servant-9", name: "공무원 9급", category: "공공", entrySalary: 30_000_000, midSalary: 45_000_000, seniorSalary: 65_000_000, avgSalary: 45_000_000, topCompanies: ["행정안전부", "지방자치단체"], description: "9급 공채. 1호봉 약 188만/월. 정근수당·명절상여 별도.", keywords: ["공무원 9급 연봉", "9급 봉급"] },
 { slug: "civil-servant-7", name: "공무원 7급", category: "공공", entrySalary: 35_000_000, midSalary: 55_000_000, seniorSalary: 80_000_000, avgSalary: 55_000_000, topCompanies: ["중앙부처", "지방자치단체"], description: "7급 공채. 9급보다 한 단계 위. 1호봉 약 200만/월.", keywords: ["공무원 7급 연봉"] },
 { slug: "civil-servant-5", name: "공무원 5급 (사무관)", category: "공공", entrySalary: 50_000_000, midSalary: 75_000_000, seniorSalary: 110_000_000, avgSalary: 75_000_000, topCompanies: ["중앙부처"], description: "5급 공채 (행정고시·외무고시). 사무관 직급.", keywords: ["사무관 연봉", "5급 공채"] },
 { slug: "soldier-officer", name: "직업군인 (장교)", category: "공공", entrySalary: 40_000_000, midSalary: 65_000_000, seniorSalary: 100_000_000, avgSalary: 65_000_000, topCompanies: ["육군", "해군", "공군"], description: "ROTC·사관학교·학사장교. 5년+ 의무복무.", keywords: ["군인 연봉", "장교 연봉"] },
 { slug: "police-officer", name: "경찰관", category: "공공", entrySalary: 38_000_000, midSalary: 55_000_000, seniorSalary: 80_000_000, avgSalary: 55_000_000, topCompanies: ["경찰청"], description: "경찰공무원시험. 야간·당직수당 별도.", keywords: ["경찰관 연봉"] },
 { slug: "firefighter", name: "소방관", category: "공공", entrySalary: 38_000_000, midSalary: 55_000_000, seniorSalary: 80_000_000, avgSalary: 55_000_000, topCompanies: ["소방청"], description: "소방공무원시험. 위험수당·야간수당 별도.", keywords: ["소방관 연봉"] },
 { slug: "pilot", name: "조종사", category: "기술", entrySalary: 80_000_000, midSalary: 130_000_000, seniorSalary: 250_000_000, avgSalary: 130_000_000, topCompanies: ["대한항공", "아시아나", "제주항공", "진에어"], description: "민간 항공사 + 군 출신 우대. 기장 연봉 매우 높음.", keywords: ["조종사 연봉", "기장 연봉"] },
 { slug: "flight-attendant", name: "항공 승무원", category: "서비스", entrySalary: 45_000_000, midSalary: 60_000_000, seniorSalary: 90_000_000, avgSalary: 60_000_000, topCompanies: ["대한항공", "아시아나", "에미레이트", "카타르"], description: "비행수당·해외체류비 별도. 외항사 더 높음.", keywords: ["승무원 연봉"] },
 { slug: "barista", name: "바리스타", category: "서비스", entrySalary: 28_000_000, midSalary: 38_000_000, seniorSalary: 55_000_000, avgSalary: 38_000_000, topCompanies: ["스타벅스", "투썸", "이디야"], description: "커피 추출·매장 운영. 정직원·매니저 트랙.", keywords: ["바리스타 연봉"] },
 { slug: "chef", name: "셰프", category: "서비스", entrySalary: 30_000_000, midSalary: 55_000_000, seniorSalary: 110_000_000, avgSalary: 55_000_000, topCompanies: ["호텔 레스토랑", "파인다이닝"], description: "요리장·헤드 셰프. 근무 강도 높음.", keywords: ["셰프 연봉"] },
 { slug: "hotelier", name: "호텔리어", category: "서비스", entrySalary: 32_000_000, midSalary: 48_000_000, seniorSalary: 75_000_000, avgSalary: 48_000_000, topCompanies: ["조선호텔", "롯데호텔", "신라호텔", "그랜드하얏트"], description: "호텔 프런트·식음·객실 관리.", keywords: ["호텔리어 연봉"] },
 { slug: "construction-engineer", name: "건축 엔지니어", category: "건설", entrySalary: 45_000_000, midSalary: 65_000_000, seniorSalary: 95_000_000, avgSalary: 65_000_000, topCompanies: ["삼성물산", "현대건설", "GS건설", "대우건설", "DL"], description: "건축 설계·시공 관리.", keywords: ["건축 엔지니어 연봉"] },
 { slug: "civil-engineer", name: "토목 엔지니어", category: "건설", entrySalary: 43_000_000, midSalary: 62_000_000, seniorSalary: 90_000_000, avgSalary: 62_000_000, topCompanies: ["현대건설", "GS건설", "포스코건설", "두산건설"], description: "토목·교량·도로·댐.", keywords: ["토목 엔지니어 연봉"] },
 { slug: "logistics-manager", name: "물류 관리자", category: "물류", entrySalary: 40_000_000, midSalary: 58_000_000, seniorSalary: 85_000_000, avgSalary: 58_000_000, topCompanies: ["쿠팡 물류", "CJ대한통운", "롯데글로벌로지스"], description: "창고·운송·SCM. 이커머스 성장으로 수요 큼.", keywords: ["물류 관리자"] },
 { slug: "delivery-driver", name: "택배 기사", category: "물류", entrySalary: 35_000_000, midSalary: 50_000_000, seniorSalary: 75_000_000, avgSalary: 50_000_000, topCompanies: ["CJ대한통운", "롯데택배", "한진택배", "쿠팡"], description: "택배 배송. 지역·물량별 변동 큼. 자영업 형태.", keywords: ["택배 기사 연봉"] },
];

export const JOB_SLUGS: string[] = JOB_SALARIES.map((j) => j.slug);

export function getJob(slug: string): JobSalary | undefined {
 return JOB_SALARIES.find((j) => j.slug === slug);
}

export function getJobsByCategory(category: JobSalary["category"]): JobSalary[] {
 return JOB_SALARIES.filter((j) => j.category === category);
}
