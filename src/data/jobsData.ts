// src/data/jobsData.ts
// 직업별 연봉 데이터 — "/OOO 연봉" 키워드 커버용
// salary 단위: 만원

export type JobCategory =
  | "의료"
  | "공무원/공공"
  | "교육"
  | "IT/개발"
  | "금융"
  | "법률"
  | "공학/제조"
  | "경영/서비스"
  | "미디어/창작"
  | "바이오/연구";

export interface JobSalaryRange {
  min: number;
  max: number;
  avg: number;
}

export interface JobProfile {
  id: string;
  name: string;
  nameEn: string;
  category: JobCategory;
  salary: {
    entry: JobSalaryRange;   // 신입 (0~2년)
    junior: JobSalaryRange;  // 주니어 (3~5년)
    senior: JobSalaryRange;  // 시니어 (10년+)
    overall: number;         // 전체 평균
  };
  description: string;
  requirements: string[];
  relatedCompanyIds: string[];
  relatedCalcSlugs: string[];
  faqs: Array<{ q: string; a: string }>;
  keywords: string[];
}

export const jobsData: JobProfile[] = [
  // ─── 의료 ───────────────────────────────────────────────
  {
    id: "nurse",
    name: "간호사",
    nameEn: "Nurse",
    category: "의료",
    salary: {
      entry: { min: 3200, max: 4200, avg: 3700 },
      junior: { min: 4000, max: 5200, avg: 4500 },
      senior: { min: 5000, max: 7000, avg: 5800 },
      overall: 4500,
    },
    description: "병원·클리닉에서 환자 간호 및 의료 보조를 담당하는 의료 전문직. 국가고시 합격 후 면허 취득 필수.",
    requirements: ["간호학과 졸업", "간호사 국가시험 합격", "간호사 면허증"],
    relatedCompanyIds: ["seoul-national-university-hospital", "asan-medical-center", "samsung-seoul-hospital", "severance-hospital"],
    relatedCalcSlugs: ["severance-pay-quick", "overtime-pay-quick", "night-shift-pay-quick"],
    faqs: [
      { q: "간호사 신입 연봉은 얼마인가요?", a: "2026년 기준 간호사 신입 연봉은 병원 규모에 따라 3,200만원~4,200만원 수준입니다. 상급종합병원(서울대병원·세브란스·삼성서울병원 등)은 4,000만원 이상이며, 3교대 간호사는 야간·교대 수당이 추가되어 실제 수령액이 더 높습니다." },
      { q: "간호사 월급 실수령액은 얼마인가요?", a: "연봉 3,700만원 기준 세후 월 실수령액은 약 267만원입니다. 야간·교대·위험수당이 붙는 경우 월 300만원 이상도 가능합니다. 정확한 실수령액은 머니샐러리 연봉 계산기에 직접 입력해 확인하세요." },
      { q: "간호사는 경력이 쌓이면 연봉이 얼마나 오르나요?", a: "간호사는 3~5년 차에 약 4,000~5,200만원, 10년 이상 경력 수간호사·파트장급은 5,000만원~7,000만원까지 올라갑니다. 전문간호사(NP) 자격 취득 시 더 높은 급여를 받을 수 있습니다." },
      { q: "간호사 3교대 수당은 얼마나 되나요?", a: "야간근무수당은 통상임금의 50% 가산이 법정 기준입니다. 실제로 상급종합병원 기준 야간수당만 월 30~70만원 추가 지급되는 경우가 많아 연봉 외 실질 소득이 높아집니다." },
    ],
    keywords: ["간호사 연봉", "간호사 월급", "간호사 신입 연봉", "간호사 평균 연봉", "간호사 실수령액", "간호사 연봉 2026"],
  },
  {
    id: "doctor",
    name: "의사",
    nameEn: "Doctor / Physician",
    category: "의료",
    salary: {
      entry: { min: 4000, max: 6000, avg: 4800 },  // 인턴/레지던트
      junior: { min: 10000, max: 18000, avg: 13000 }, // 전문의 초반
      senior: { min: 15000, max: 40000, avg: 22000 }, // 개원·교수급
      overall: 18000,
    },
    description: "진단·치료·수술 등 의료행위를 담당하는 최상위 의료 전문직. 의대 6년+인턴1년+레지던트4년의 긴 수련 과정이 필요.",
    requirements: ["의과대학 졸업(6년)", "의사 국가시험 합격", "전문의 수련(인턴 1년 + 레지던트 4년)"],
    relatedCompanyIds: ["seoul-national-university-hospital", "asan-medical-center", "samsung-seoul-hospital", "severance-hospital"],
    relatedCalcSlugs: ["earned-income-tax-quick", "income-tax-bracket-sim", "corporate-tax-quick"],
    faqs: [
      { q: "의사 연봉은 얼마인가요?", a: "의사는 직책에 따라 편차가 큽니다. 인턴·레지던트 수련의는 연 4,000~6,000만원, 전문의(봉직의)는 1억~2억원, 개원의는 전문과목과 위치에 따라 1억~4억원 이상입니다." },
      { q: "전문과목별 의사 연봉 차이는 얼마나 되나요?", a: "성형외과·피부과·안과 등 비급여 비중이 높은 개원의는 연 3억원 이상도 가능합니다. 반면 소아과·내과 봉직의는 1억~1.5억원 수준입니다. 최근 필수의료(응급·소아) 수가 인상으로 격차가 줄고 있습니다." },
      { q: "의대를 나오면 수련까지 몇 년이 걸리나요?", a: "의대 6년→인턴 1년→레지던트 4년 = 최소 11년이 필요합니다. 전문의 취득 후 펠로우(1~2년)까지 하면 전문의 수입은 30대 초중반부터 시작됩니다." },
    ],
    keywords: ["의사 연봉", "의사 월급", "의사 평균 연봉", "전문의 연봉", "봉직의 연봉", "개원의 연봉", "의사 실수령액"],
  },
  {
    id: "dentist",
    name: "치과의사",
    nameEn: "Dentist",
    category: "의료",
    salary: {
      entry: { min: 3500, max: 5500, avg: 4500 },  // 인턴/페이닥터 초반
      junior: { min: 7000, max: 13000, avg: 9000 },
      senior: { min: 12000, max: 30000, avg: 18000 },
      overall: 14000,
    },
    description: "치아·구강·턱 질환을 진단·치료하는 구강 전문 의사. 치과대학 6년 졸업 후 국가시험 합격 필수.",
    requirements: ["치과대학 졸업(6년)", "치과의사 국가시험 합격"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["earned-income-tax-quick", "income-tax-bracket-sim"],
    faqs: [
      { q: "치과의사 연봉은 얼마인가요?", a: "치과 페이닥터(고용 치과의사) 초봉은 연 3,500~5,500만원이며, 개원의는 위치·진료과목에 따라 연 1억~3억원 수준입니다. 임플란트·교정 비중이 높은 개원의는 더 높을 수 있습니다." },
      { q: "치과의사 개원 비용은 얼마인가요?", a: "치과 개원에는 보통 2억~5억원의 초기 비용이 필요합니다(장비·인테리어·보증금 등). 개원 후 손익분기점까지 1~2년이 걸리는 경우가 많습니다." },
    ],
    keywords: ["치과의사 연봉", "치과의사 월급", "치과의사 평균 연봉", "치과의사 실수령액", "페이닥터 연봉", "치과 개원의 연봉"],
  },
  {
    id: "pharmacist",
    name: "약사",
    nameEn: "Pharmacist",
    category: "의료",
    salary: {
      entry: { min: 3500, max: 4800, avg: 4000 },
      junior: { min: 4500, max: 6000, avg: 5000 },
      senior: { min: 5500, max: 9000, avg: 6500 },
      overall: 5200,
    },
    description: "처방전 검토·조제·복약 지도를 담당하는 약학 전문직. 약학대학 4년(또는 6년제) 졸업 후 국가시험 합격 필수.",
    requirements: ["약학대학 졸업", "약사 국가시험 합격", "약사 면허증"],
    relatedCompanyIds: ["yuhan", "hanmi-pharm", "chong-kun-dang"],
    relatedCalcSlugs: ["earned-income-tax-quick", "overtime-pay-quick"],
    faqs: [
      { q: "약사 연봉은 얼마인가요?", a: "2026년 기준 약사 평균 연봉은 4,000~6,000만원 수준입니다. 대형 병원 약사는 3,500~5,000만원, 개인 약국 근무 약사는 4,000~6,500만원, 개국 약사는 위치에 따라 5,000만원~1억원 이상도 가능합니다." },
      { q: "약사 근무 조건은 어떤가요?", a: "병원 약사는 3교대 근무가 있을 수 있으며 야간수당이 추가됩니다. 약국 근무 약사는 보통 주 5~6일이며 평균 주 48~52시간 근무합니다. 프리랜서 파트타임 약사도 가능합니다." },
    ],
    keywords: ["약사 연봉", "약사 월급", "약사 평균 연봉", "약사 실수령액", "약사 신입 연봉", "약사 연봉 2026"],
  },
  {
    id: "oriental-medicine-doctor",
    name: "한의사",
    nameEn: "Oriental Medicine Doctor",
    category: "의료",
    salary: {
      entry: { min: 3000, max: 5000, avg: 3800 },
      junior: { min: 4500, max: 8000, avg: 5800 },
      senior: { min: 7000, max: 20000, avg: 11000 },
      overall: 7500,
    },
    description: "침·뜸·한약 등 전통의학으로 질환을 치료하는 전문직. 한의과대학 6년 졸업 후 국가시험 합격 필수.",
    requirements: ["한의과대학 졸업(6년)", "한의사 국가시험 합격"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["earned-income-tax-quick", "corporate-tax-quick"],
    faqs: [
      { q: "한의사 연봉은 얼마인가요?", a: "봉직 한의사(취업) 초봉은 3,000~5,000만원이며, 개원 한의사는 위치·전문성에 따라 5,000만원~1억원 이상입니다. 피부·다이어트 특화 한의원은 높은 수익을 올리기도 합니다." },
    ],
    keywords: ["한의사 연봉", "한의사 월급", "한의사 평균 연봉", "한의사 실수령액"],
  },
  {
    id: "physical-therapist",
    name: "물리치료사",
    nameEn: "Physical Therapist",
    category: "의료",
    salary: {
      entry: { min: 2700, max: 3500, avg: 3000 },
      junior: { min: 3200, max: 4200, avg: 3600 },
      senior: { min: 3800, max: 5200, avg: 4400 },
      overall: 3500,
    },
    description: "운동·전기·열 치료 등으로 기능 회복을 돕는 의료 보조 전문직. 물리치료학과 졸업 후 국가시험 필수.",
    requirements: ["물리치료학과 졸업", "물리치료사 국가시험 합격"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["overtime-pay-quick", "severance-pay-quick"],
    faqs: [
      { q: "물리치료사 연봉은 얼마인가요?", a: "신입 물리치료사 연봉은 2,700~3,500만원이며, 3~5년 경력이면 3,200~4,200만원, 10년 이상이면 3,800~5,200만원 수준입니다. 상급종합병원·재활병원은 대체로 급여가 높습니다." },
    ],
    keywords: ["물리치료사 연봉", "물리치료사 월급", "물리치료사 평균 연봉", "물리치료사 실수령액"],
  },
  {
    id: "radiographer",
    name: "방사선사",
    nameEn: "Radiographer",
    category: "의료",
    salary: {
      entry: { min: 2900, max: 3800, avg: 3300 },
      junior: { min: 3500, max: 4500, avg: 3900 },
      senior: { min: 4200, max: 5500, avg: 4700 },
      overall: 3900,
    },
    description: "X선·CT·MRI·핵의학 등 방사선 기기를 운용해 영상 진단을 담당하는 의료기사.",
    requirements: ["방사선학과 졸업", "방사선사 국가시험 합격"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["overtime-pay-quick", "night-shift-pay-quick"],
    faqs: [
      { q: "방사선사 연봉은 얼마인가요?", a: "신입 방사선사 연봉은 2,900~3,800만원 수준이며, 경력 10년 이상이면 4,200~5,500만원까지 오를 수 있습니다. 상급종합병원은 야간·위험수당 포함 시 연봉이 더 높습니다." },
    ],
    keywords: ["방사선사 연봉", "방사선사 월급", "방사선사 평균 연봉", "방사선사 실수령액"],
  },
  {
    id: "veterinarian",
    name: "수의사",
    nameEn: "Veterinarian",
    category: "의료",
    salary: {
      entry: { min: 3000, max: 4500, avg: 3600 },
      junior: { min: 4000, max: 6500, avg: 5000 },
      senior: { min: 6000, max: 15000, avg: 9000 },
      overall: 6000,
    },
    description: "동물의 질병 진단·치료·예방을 담당하는 전문직. 수의학과 6년 졸업 후 국가시험 합격 필수.",
    requirements: ["수의학과 졸업(6년)", "수의사 국가시험 합격"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["earned-income-tax-quick", "corporate-tax-quick"],
    faqs: [
      { q: "수의사 연봉은 얼마인가요?", a: "소동물(반려동물) 임상 수의사 초봉은 3,000~4,500만원이며, 개원 수의사는 5,000만원~1억5,000만원 수준입니다. 반려동물 산업 성장으로 수요가 크게 늘고 있습니다." },
    ],
    keywords: ["수의사 연봉", "수의사 월급", "수의사 평균 연봉", "수의사 실수령액"],
  },

  // ─── 공무원/공공 ──────────────────────────────────────
  {
    id: "civil-servant-9",
    name: "공무원 9급",
    nameEn: "9th Grade Civil Servant",
    category: "공무원/공공",
    salary: {
      entry: { min: 2700, max: 3200, avg: 2900 },
      junior: { min: 3200, max: 4000, avg: 3500 },
      senior: { min: 4000, max: 5500, avg: 4600 },
      overall: 3600,
    },
    description: "행정·세무·교정·우정 등 국가 및 지방자치단체 일반직 최하위 직급. 9급 공개채용시험 합격 필요.",
    requirements: ["9급 공무원 시험 합격", "학력 제한 없음 (고졸 이상)"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["severance-pay-quick", "annual-leave-pay-quick"],
    faqs: [
      { q: "9급 공무원 신입 연봉은 얼마인가요?", a: "2026년 기준 9급 공무원 신입(1호봉) 기본급은 약 192만원입니다. 각종 수당(직급보조비·가족수당·명절상여 등) 포함 시 연 2,700~3,200만원 수준이며, 경기·서울 지역은 지역수당이 추가됩니다." },
      { q: "9급 공무원 20년 후 연봉은 얼마인가요?", a: "9급으로 입직 후 7급·6급·5급으로 승진하면 20년 후 5급(사무관) 기준 연봉은 약 6,000~7,000만원 수준입니다. 연금 포함 시 실질 보수가 높아집니다." },
      { q: "공무원 연금은 얼마나 받나요?", a: "2015년 이후 입직자는 기여율 9%, 퇴직 후 10년 이상 재직 시 수령 가능합니다. 30년 재직 시 퇴직 전 평균 기준소득의 약 40~50%를 연금으로 수령합니다." },
    ],
    keywords: ["9급 공무원 연봉", "공무원 9급 월급", "9급 공무원 신입 연봉", "공무원 연봉", "공무원 월급 2026"],
  },
  {
    id: "civil-servant-7",
    name: "공무원 7급",
    nameEn: "7th Grade Civil Servant",
    category: "공무원/공공",
    salary: {
      entry: { min: 3000, max: 3600, avg: 3200 },
      junior: { min: 3600, max: 4500, avg: 4000 },
      senior: { min: 4500, max: 6500, avg: 5400 },
      overall: 4100,
    },
    description: "국가·지방직 7급 공채 또는 9급 승진을 통해 진입하는 중간 관리직급. 7급 공채시험은 9급보다 경쟁률이 높음.",
    requirements: ["7급 공무원 시험 합격", "학사 이상 우대"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["severance-pay-quick", "annual-leave-pay-quick"],
    faqs: [
      { q: "7급 공무원 연봉은 얼마인가요?", a: "2026년 기준 7급 공무원 1호봉 기본급은 약 216만원이며, 각종 수당 포함 연 3,000~3,600만원 수준입니다. 경력에 따라 4,500만원 이상도 가능합니다." },
    ],
    keywords: ["7급 공무원 연봉", "공무원 7급 월급", "7급 공무원 신입 연봉"],
  },
  {
    id: "civil-servant-5",
    name: "공무원 5급",
    nameEn: "5th Grade Civil Servant",
    category: "공무원/공공",
    salary: {
      entry: { min: 4000, max: 5000, avg: 4400 },
      junior: { min: 5000, max: 6500, avg: 5700 },
      senior: { min: 6500, max: 9000, avg: 7500 },
      overall: 5700,
    },
    description: "행정고시(5급 공채) 또는 7급 승진으로 진입하는 고위 실무직. 주요 정책 결정에 참여하는 핵심 직급.",
    requirements: ["5급 공채(행정고시) 합격 또는 7급에서 승진"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["income-tax-bracket-sim", "earned-income-tax-quick"],
    faqs: [
      { q: "5급 공무원(사무관) 연봉은 얼마인가요?", a: "행정고시 합격 후 5급 사무관 초봉은 연 4,000~5,000만원이며, 10년 경력 과장급은 6,500~8,000만원 수준입니다. 외교부·기재부 등 부처에 따라 추가 수당 차이가 있습니다." },
    ],
    keywords: ["5급 공무원 연봉", "사무관 연봉", "행정고시 연봉", "행시 연봉"],
  },
  {
    id: "firefighter",
    name: "소방관",
    nameEn: "Firefighter",
    category: "공무원/공공",
    salary: {
      entry: { min: 3000, max: 3800, avg: 3300 },
      junior: { min: 3800, max: 4800, avg: 4200 },
      senior: { min: 4800, max: 6500, avg: 5500 },
      overall: 4200,
    },
    description: "화재 진압·구조·구급 업무를 담당하는 소방공무원. 소방직 공채시험 합격 후 임용.",
    requirements: ["소방공무원 공채시험 합격", "체력검정 통과", "소방학교 교육 수료"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["overtime-pay-quick", "night-shift-pay-quick", "severance-pay-quick"],
    faqs: [
      { q: "소방관 연봉은 얼마인가요?", a: "소방관 신입 연봉은 수당 포함 약 3,000~3,800만원이며, 야간·위험 수당이 추가됩니다. 경력 10년 이상 소방장급은 4,800~6,500만원 수준입니다. 순직 보상·연금 등 공무원 혜택도 포함됩니다." },
      { q: "소방관 3교대 수당은 얼마인가요?", a: "소방관은 24시간 맞교대 또는 3조 2교대 근무를 합니다. 야간근무수당·위험직무수당·화재진압수당 등이 추가되어 기본급 대비 수당 비중이 높은 편입니다." },
    ],
    keywords: ["소방관 연봉", "소방관 월급", "소방관 평균 연봉", "소방공무원 연봉", "소방관 실수령액"],
  },
  {
    id: "police-officer",
    name: "경찰관",
    nameEn: "Police Officer",
    category: "공무원/공공",
    salary: {
      entry: { min: 2800, max: 3500, avg: 3100 },
      junior: { min: 3500, max: 4500, avg: 3900 },
      senior: { min: 4500, max: 6000, avg: 5200 },
      overall: 3900,
    },
    description: "치안 유지·범죄 수사·교통 단속을 담당하는 경찰공무원. 순경 공채 또는 경찰간부 시험으로 임용.",
    requirements: ["경찰공무원 공채시험 합격", "체력검정 통과", "경찰교육원 교육 수료"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["overtime-pay-quick", "night-shift-pay-quick"],
    faqs: [
      { q: "경찰관 연봉은 얼마인가요?", a: "순경 신임 연봉은 수당 포함 약 2,800~3,500만원이며, 야간·교대수당이 추가됩니다. 경감·경정급 중간간부는 4,500~6,000만원 수준입니다." },
    ],
    keywords: ["경찰관 연봉", "경찰 월급", "경찰 평균 연봉", "순경 연봉", "경찰공무원 연봉"],
  },
  {
    id: "soldier",
    name: "직업군인",
    nameEn: "Professional Soldier",
    category: "공무원/공공",
    salary: {
      entry: { min: 2800, max: 4000, avg: 3200 },  // 부사관/초급장교
      junior: { min: 3800, max: 5500, avg: 4500 },
      senior: { min: 5000, max: 8000, avg: 6000 },
      overall: 4300,
    },
    description: "육·해·공군·해병대 부사관(하사~원사) 및 장교(소위~대령)로 복무하는 직업군인.",
    requirements: ["부사관: 부사관 후보생 선발 / 장교: 사관학교·ROTC·학사장교"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["severance-pay-quick", "annual-leave-pay-quick"],
    faqs: [
      { q: "직업군인(부사관/장교) 연봉은 얼마인가요?", a: "하사 신임 부사관 연봉은 수당 포함 약 2,800~3,500만원이며, 원사급 고참 부사관은 5,000~7,000만원입니다. 소위 초급장교는 약 3,500~4,200만원이며, 대령급 고위장교는 7,000~9,000만원 수준입니다." },
    ],
    keywords: ["직업군인 연봉", "부사관 연봉", "장교 연봉", "군인 월급", "군인 연봉 2026"],
  },
  {
    id: "prosecutor",
    name: "검사",
    nameEn: "Prosecutor",
    category: "공무원/공공",
    salary: {
      entry: { min: 6000, max: 8000, avg: 7000 },
      junior: { min: 7500, max: 10000, avg: 8500 },
      senior: { min: 9000, max: 15000, avg: 11000 },
      overall: 8800,
    },
    description: "국가를 대표해 형사사건을 수사하고 공소를 제기하는 법무직 공무원. 사법시험 또는 로스쿨 졸업 후 검사 임용시험 통과 필요.",
    requirements: ["사법시험 합격 또는 법학전문대학원(로스쿨) 졸업 + 변호사시험 합격", "검사 임용 시험"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["income-tax-bracket-sim", "earned-income-tax-quick"],
    faqs: [
      { q: "검사 연봉은 얼마인가요?", a: "신임 검사(3호봉) 기준 연봉은 수당 포함 약 6,000~8,000만원입니다. 부장검사·고검장급은 1억원 이상이며, 퇴직 후 변호사 개업 시 수입이 크게 증가합니다." },
    ],
    keywords: ["검사 연봉", "검사 월급", "검사 평균 연봉", "검사 실수령액"],
  },
  {
    id: "judge",
    name: "판사",
    nameEn: "Judge",
    category: "공무원/공공",
    salary: {
      entry: { min: 7000, max: 9000, avg: 8000 },
      junior: { min: 9000, max: 12000, avg: 10000 },
      senior: { min: 11000, max: 18000, avg: 13500 },
      overall: 10500,
    },
    description: "법원에서 민사·형사·행정사건을 심리하고 판결을 내리는 법관. 로스쿨 졸업 후 변호사 경력을 거쳐 임용.",
    requirements: ["로스쿨 졸업 + 변호사 시험 합격", "법원 판사 임용 (3~5년 변호사 경력 필요)"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["income-tax-bracket-sim"],
    faqs: [
      { q: "판사 연봉은 얼마인가요?", a: "법관 1호봉 기준 연봉은 약 7,000~9,000만원이며, 고법판사·대법관으로 올라갈수록 높아집니다. 로스쿨 제도 이후 판사 임용이 변호사 경력 중심으로 변화했습니다." },
    ],
    keywords: ["판사 연봉", "판사 월급", "판사 평균 연봉", "법관 연봉"],
  },

  // ─── 교육 ────────────────────────────────────────────
  {
    id: "elementary-teacher",
    name: "초등교사",
    nameEn: "Elementary School Teacher",
    category: "교육",
    salary: {
      entry: { min: 3000, max: 3600, avg: 3200 },
      junior: { min: 3600, max: 4500, avg: 4000 },
      senior: { min: 4500, max: 6500, avg: 5400 },
      overall: 4200,
    },
    description: "초등학교에서 전과목을 가르치는 국·공립 교원. 교육대학교 4년 졸업 후 임용시험 합격 필요.",
    requirements: ["교육대학교(교대) 졸업", "초등교사 임용시험 합격"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["severance-pay-quick", "annual-leave-pay-quick"],
    faqs: [
      { q: "초등교사 연봉은 얼마인가요?", a: "신임 초등교사(1호봉) 기준 연봉은 수당 포함 약 3,000~3,600만원이며, 경력 10년 이상 수석교사급은 5,000~6,500만원입니다. 공무원 연금과 방학 등 안정성이 높습니다." },
      { q: "초등교사 방학 기간은 얼마나 되나요?", a: "여름방학 약 5주, 겨울방학 약 5주로 총 10주 수준입니다. 방학 중에도 연수·행정업무가 있어 실제 휴가는 3~4주 정도입니다." },
    ],
    keywords: ["초등교사 연봉", "초등교사 월급", "교사 연봉", "교사 평균 연봉", "임용 후 연봉", "교사 실수령액"],
  },
  {
    id: "secondary-teacher",
    name: "중고등교사",
    nameEn: "Secondary School Teacher",
    category: "교육",
    salary: {
      entry: { min: 3000, max: 3600, avg: 3200 },
      junior: { min: 3600, max: 4600, avg: 4100 },
      senior: { min: 4500, max: 6500, avg: 5500 },
      overall: 4300,
    },
    description: "중학교·고등학교에서 특정 교과목을 가르치는 교원. 사범대학 또는 교직이수 후 중등교원 임용시험 합격 필요.",
    requirements: ["사범대학 졸업 또는 교직이수", "중등교원 임용시험 합격"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["severance-pay-quick", "annual-leave-pay-quick"],
    faqs: [
      { q: "중고등교사 연봉은 얼마인가요?", a: "초등교사와 동일한 공무원 봉급표를 따릅니다. 신임 기준 3,000~3,600만원이며, 10년 이상 경력 부장교사는 5,000~6,500만원 수준입니다." },
    ],
    keywords: ["중등교사 연봉", "고등교사 연봉", "교사 연봉", "교사 월급", "중고등 교사 연봉"],
  },
  {
    id: "kindergarten-teacher",
    name: "유치원교사",
    nameEn: "Kindergarten Teacher",
    category: "교육",
    salary: {
      entry: { min: 2400, max: 3200, avg: 2700 },
      junior: { min: 2800, max: 3800, avg: 3200 },
      senior: { min: 3500, max: 4800, avg: 4000 },
      overall: 3100,
    },
    description: "유치원에서 3~6세 아동 교육을 담당하는 교원. 유아교육학과 졸업 후 정교사 자격증 취득 필요.",
    requirements: ["유아교육학과 졸업", "유치원 정교사(2급 이상) 자격증"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["annual-leave-pay-quick", "severance-pay-quick"],
    faqs: [
      { q: "유치원교사 연봉은 얼마인가요?", a: "국공립 유치원 교사는 공무원 봉급표를 따라 3,000~4,000만원 수준입니다. 사립 유치원은 기관에 따라 차이가 크며 2,400~3,500만원 수준입니다." },
    ],
    keywords: ["유치원교사 연봉", "유치원 교사 월급", "유아교사 연봉", "유치원교사 실수령액"],
  },
  {
    id: "childcare-teacher",
    name: "보육교사",
    nameEn: "Childcare Teacher",
    category: "교육",
    salary: {
      entry: { min: 2200, max: 2900, avg: 2500 },
      junior: { min: 2600, max: 3300, avg: 2900 },
      senior: { min: 3000, max: 4000, avg: 3400 },
      overall: 2900,
    },
    description: "어린이집에서 0~5세 영유아를 보육하는 전문직. 보육교사 2급 이상 자격증 필요.",
    requirements: ["보육교사 2급 이상 자격증 (관련학과 졸업 또는 학점은행제)"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["annual-leave-pay-quick"],
    faqs: [
      { q: "보육교사 연봉은 얼마인가요?", a: "국공립 어린이집 보육교사 신입 연봉은 2,500~3,000만원이며, 민간 어린이집은 2,200~2,800만원 수준입니다. 처우 개선이 지속적으로 이루어지고 있습니다." },
    ],
    keywords: ["보육교사 연봉", "보육교사 월급", "어린이집 교사 연봉", "보육교사 실수령액"],
  },
  {
    id: "professor",
    name: "대학교수",
    nameEn: "University Professor",
    category: "교육",
    salary: {
      entry: { min: 5500, max: 8000, avg: 6500 },  // 조교수
      junior: { min: 7000, max: 10000, avg: 8000 }, // 부교수
      senior: { min: 9000, max: 15000, avg: 11000 }, // 정교수
      overall: 8500,
    },
    description: "대학교에서 강의·연구·사회봉사를 담당하는 교원. 박사학위 취득 후 강의경력을 거쳐 임용.",
    requirements: ["박사학위 취득", "연구 실적 (논문 SCI 등)", "강의 경력"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["income-tax-bracket-sim", "earned-income-tax-quick"],
    faqs: [
      { q: "대학교수 연봉은 얼마인가요?", a: "조교수 초봉은 연 5,500~8,000만원, 부교수는 7,000~1억원, 정교수는 9,000만~1억5,000만원 수준입니다. 국립대와 사립대, 학교 규모에 따라 편차가 큽니다." },
      { q: "대학교수가 되려면 어떻게 해야 하나요?", a: "일반적으로 박사학위 취득 → 포스닥/연구원 → 조교수 공채 순서입니다. SCI 논문 실적과 연구비(과제) 수주 능력이 중요합니다." },
    ],
    keywords: ["대학교수 연봉", "교수 월급", "교수 평균 연봉", "조교수 연봉", "부교수 연봉", "정교수 연봉"],
  },

  // ─── IT/개발 ──────────────────────────────────────────
  {
    id: "software-engineer",
    name: "소프트웨어 개발자",
    nameEn: "Software Engineer",
    category: "IT/개발",
    salary: {
      entry: { min: 4000, max: 5800, avg: 4700 },
      junior: { min: 6000, max: 9000, avg: 7200 },
      senior: { min: 8000, max: 15000, avg: 11000 },
      overall: 7500,
    },
    description: "소프트웨어를 설계·개발·테스트하는 IT 핵심 직군. 네이버·카카오·쿠팡 등 대형 IT기업부터 스타트업까지 수요가 많음.",
    requirements: ["컴퓨터공학·정보공학 관련 학위 또는 코딩 부트캠프 이수", "프로그래밍 언어 능숙"],
    relatedCompanyIds: ["naver", "kakao", "coupang", "krafton", "ncsoft", "nexon"],
    relatedCalcSlugs: ["earned-income-tax-quick", "income-tax-bracket-sim", "stock-capital-gains-quick"],
    faqs: [
      { q: "소프트웨어 개발자 연봉은 얼마인가요?", a: "2026년 기준 신입 개발자(0~2년) 연봉은 4,000~5,800만원이며, 네이버·카카오·쿠팡 등 대형 IT기업은 5,000만원 이상입니다. 3~5년 경력 개발자는 6,000~9,000만원, 10년 이상 시니어는 8,000만~1억5,000만원 수준입니다." },
      { q: "개발자 연봉이 높은 회사는 어디인가요?", a: "네이버·카카오·쿠팡·토스·당근·라인플러스 등 대형 IT기업이 최고 수준의 연봉을 제공합니다. 성과급·스톡옵션 포함 시 연 1억원 이상도 흔합니다." },
      { q: "비전공자도 개발자가 될 수 있나요?", a: "가능합니다. 부트캠프·독학을 통해 비전공자 개발자로 취업하는 사례가 많습니다. 다만 대형 IT기업은 CS 기초와 알고리즘 능력을 중요시합니다." },
    ],
    keywords: ["개발자 연봉", "소프트웨어 개발자 연봉", "프로그래머 연봉", "개발자 월급", "IT 개발자 연봉", "개발자 신입 연봉"],
  },
  {
    id: "frontend-developer",
    name: "프론트엔드 개발자",
    nameEn: "Frontend Developer",
    category: "IT/개발",
    salary: {
      entry: { min: 3800, max: 5200, avg: 4400 },
      junior: { min: 5500, max: 8500, avg: 6800 },
      senior: { min: 7500, max: 14000, avg: 10000 },
      overall: 6800,
    },
    description: "웹사이트·앱의 사용자 인터페이스(UI)를 개발하는 개발자. React·Vue·Next.js 등 프레임워크 활용.",
    requirements: ["HTML/CSS/JavaScript 필수", "React·Vue·Next.js 등 프레임워크", "웹 표준·접근성 이해"],
    relatedCompanyIds: ["naver", "kakao", "coupang"],
    relatedCalcSlugs: ["earned-income-tax-quick", "stock-capital-gains-quick"],
    faqs: [
      { q: "프론트엔드 개발자 연봉은 얼마인가요?", a: "신입 프론트엔드 개발자 연봉은 3,800~5,200만원이며, 경력 3~5년이면 5,500~8,500만원, 10년 이상 시니어는 7,500만~1억4,000만원 수준입니다." },
    ],
    keywords: ["프론트엔드 개발자 연봉", "프론트엔드 연봉", "React 개발자 연봉", "프론트엔드 개발자 월급"],
  },
  {
    id: "backend-developer",
    name: "백엔드 개발자",
    nameEn: "Backend Developer",
    category: "IT/개발",
    salary: {
      entry: { min: 4000, max: 5500, avg: 4700 },
      junior: { min: 6000, max: 9000, avg: 7200 },
      senior: { min: 8000, max: 15000, avg: 11000 },
      overall: 7500,
    },
    description: "서버·데이터베이스·API를 개발하는 개발자. Java·Python·Node.js·Go 등 다양한 언어 사용.",
    requirements: ["Java·Python·Node.js 등 서버 언어", "데이터베이스(MySQL·PostgreSQL·Redis)", "클라우드(AWS·GCP·Azure)"],
    relatedCompanyIds: ["naver", "kakao", "coupang", "krafton"],
    relatedCalcSlugs: ["earned-income-tax-quick", "stock-capital-gains-quick"],
    faqs: [
      { q: "백엔드 개발자 연봉은 얼마인가요?", a: "신입 백엔드 개발자 연봉은 4,000~5,500만원이며, 경력 5년 이상은 7,000~1억원, 아키텍처·테크리드급은 1억원 이상입니다." },
    ],
    keywords: ["백엔드 개발자 연봉", "백엔드 연봉", "서버 개발자 연봉", "Java 개발자 연봉", "Python 개발자 연봉"],
  },
  {
    id: "data-scientist",
    name: "데이터 사이언티스트",
    nameEn: "Data Scientist",
    category: "IT/개발",
    salary: {
      entry: { min: 4500, max: 6500, avg: 5300 },
      junior: { min: 6500, max: 10000, avg: 8000 },
      senior: { min: 9000, max: 18000, avg: 12500 },
      overall: 8500,
    },
    description: "데이터를 분석해 비즈니스 인사이트와 예측 모델을 도출하는 전문직. 통계·머신러닝·프로그래밍 능력 필수.",
    requirements: ["통계학·컴퓨터공학·수학 관련 학위 (석·박사 우대)", "Python·R·SQL", "머신러닝·딥러닝 프레임워크"],
    relatedCompanyIds: ["naver", "kakao", "samsung-electronics", "sk-hynix"],
    relatedCalcSlugs: ["earned-income-tax-quick", "income-tax-bracket-sim"],
    faqs: [
      { q: "데이터 사이언티스트 연봉은 얼마인가요?", a: "신입 데이터 사이언티스트 연봉은 4,500~6,500만원이며, 경력 5년 이상은 8,000만~1억3,000만원입니다. AI/ML 전문성이 높을수록 대우가 좋아집니다." },
    ],
    keywords: ["데이터 사이언티스트 연봉", "데이터 분석가 연봉", "머신러닝 엔지니어 연봉", "AI 엔지니어 연봉"],
  },
  {
    id: "ai-engineer",
    name: "AI 엔지니어",
    nameEn: "AI / ML Engineer",
    category: "IT/개발",
    salary: {
      entry: { min: 5000, max: 7500, avg: 6000 },
      junior: { min: 8000, max: 13000, avg: 10000 },
      senior: { min: 12000, max: 25000, avg: 17000 },
      overall: 11000,
    },
    description: "딥러닝·LLM·컴퓨터 비전 등 AI 모델을 연구·개발·배포하는 최고 수요 직군. ChatGPT 이후 몸값이 급등.",
    requirements: ["컴퓨터공학·AI 관련 석·박사 우대", "PyTorch·TensorFlow", "LLM·Transformer 모델 이해"],
    relatedCompanyIds: ["naver", "kakao", "samsung-electronics", "sk-hynix"],
    relatedCalcSlugs: ["earned-income-tax-quick", "income-tax-bracket-sim"],
    faqs: [
      { q: "AI 엔지니어 연봉은 얼마인가요?", a: "2026년 기준 신입 AI 엔지니어 연봉은 5,000~7,500만원이며, 네이버·카카오·삼성리서치 등 대형 AI 연구소는 더 높습니다. 경력 5년 이상 AI 리서처는 1억~2억원도 흔합니다." },
    ],
    keywords: ["AI 엔지니어 연봉", "머신러닝 엔지니어 연봉", "딥러닝 연봉", "AI 개발자 연봉", "LLM 엔지니어 연봉"],
  },
  {
    id: "devops-engineer",
    name: "DevOps 엔지니어",
    nameEn: "DevOps Engineer",
    category: "IT/개발",
    salary: {
      entry: { min: 4200, max: 5800, avg: 4800 },
      junior: { min: 6000, max: 9000, avg: 7200 },
      senior: { min: 8500, max: 14000, avg: 11000 },
      overall: 7500,
    },
    description: "개발(Dev)과 운영(Ops)을 통합해 CI/CD 파이프라인·인프라·클라우드를 관리하는 엔지니어.",
    requirements: ["Linux·AWS/GCP/Azure", "Docker·Kubernetes", "CI/CD (Jenkins·GitHub Actions)", "IaC (Terraform)"],
    relatedCompanyIds: ["naver", "kakao", "coupang"],
    relatedCalcSlugs: ["earned-income-tax-quick"],
    faqs: [
      { q: "DevOps 엔지니어 연봉은 얼마인가요?", a: "신입 DevOps 엔지니어 연봉은 4,200~5,800만원이며, 클라우드 아키텍트급 경력자는 1억원 이상도 가능합니다." },
    ],
    keywords: ["DevOps 엔지니어 연봉", "클라우드 엔지니어 연봉", "SRE 연봉", "인프라 엔지니어 연봉"],
  },
  {
    id: "ux-ui-designer",
    name: "UX/UI 디자이너",
    nameEn: "UX/UI Designer",
    category: "IT/개발",
    salary: {
      entry: { min: 3200, max: 4500, avg: 3800 },
      junior: { min: 4500, max: 7000, avg: 5600 },
      senior: { min: 6500, max: 10000, avg: 8000 },
      overall: 5500,
    },
    description: "사용자 경험(UX)과 인터페이스(UI)를 설계하는 디자이너. Figma·Sketch·프로토타이핑 툴 활용.",
    requirements: ["디자인 관련 학과 또는 독학·부트캠프", "Figma·Sketch·Adobe XD", "사용자 리서치·IA 설계"],
    relatedCompanyIds: ["naver", "kakao", "coupang"],
    relatedCalcSlugs: ["earned-income-tax-quick"],
    faqs: [
      { q: "UX/UI 디자이너 연봉은 얼마인가요?", a: "신입 UX/UI 디자이너 연봉은 3,200~4,500만원이며, 대형 IT기업(네이버·카카오)은 4,000만원 이상 신입도 있습니다. 경력 5년 이상은 6,000~9,000만원 수준입니다." },
    ],
    keywords: ["UX 디자이너 연봉", "UI 디자이너 연봉", "UX UI 디자이너 연봉", "프로덕트 디자이너 연봉"],
  },
  {
    id: "game-developer",
    name: "게임 개발자",
    nameEn: "Game Developer",
    category: "IT/개발",
    salary: {
      entry: { min: 3800, max: 5500, avg: 4500 },
      junior: { min: 5500, max: 8500, avg: 6800 },
      senior: { min: 7500, max: 14000, avg: 10000 },
      overall: 7000,
    },
    description: "게임 클라이언트·서버·엔진을 개발하는 개발자. C++·Unity·Unreal Engine 등 게임 특화 기술 필요.",
    requirements: ["컴퓨터공학 관련 학위", "C++·C#·Unity 또는 Unreal Engine", "그래픽스·네트워크 이해"],
    relatedCompanyIds: ["krafton", "ncsoft", "nexon"],
    relatedCalcSlugs: ["earned-income-tax-quick", "stock-capital-gains-quick"],
    faqs: [
      { q: "게임 개발자 연봉은 얼마인가요?", a: "신입 게임 개발자 연봉은 3,800~5,500만원이며, 크래프톤·엔씨소프트·넥슨 등 대형 게임사는 신입도 5,000만원 이상입니다. 경력 시니어는 1억원 이상 가능합니다." },
    ],
    keywords: ["게임 개발자 연봉", "게임 프로그래머 연봉", "Unity 개발자 연봉", "게임 개발자 월급"],
  },

  // ─── 금융 ────────────────────────────────────────────
  {
    id: "investment-banker",
    name: "투자은행원",
    nameEn: "Investment Banker",
    category: "금융",
    salary: {
      entry: { min: 7000, max: 10000, avg: 8500 },
      junior: { min: 12000, max: 20000, avg: 15000 },
      senior: { min: 20000, max: 50000, avg: 30000 },
      overall: 18000,
    },
    description: "기업 M&A·IPO·채권 발행 등 자본시장 거래를 자문·주선하는 투자금융(IB) 전문가. 골드만삭스·모건스탠리·미래에셋증권 등 근무.",
    requirements: ["상위권 대학 경영·금융·경제학과", "영어 능통(CFA 우대)", "인턴십 경험"],
    relatedCompanyIds: ["mirae-asset", "korea-investment", "samsung-securities"],
    relatedCalcSlugs: ["income-tax-bracket-sim", "earned-income-tax-quick", "dividend-tax-quick"],
    faqs: [
      { q: "투자은행원 연봉은 얼마인가요?", a: "IB 신입 애널리스트 연봉은 7,000~1억원이며, 성과 보너스 포함 시 1.5억~2억원까지 가능합니다. 5년 이상 경력 VP급은 2억~5억원, 파트너(MD)급은 10억원 이상도 있습니다." },
    ],
    keywords: ["투자은행원 연봉", "IB 연봉", "투자은행 연봉", "금융권 연봉", "증권사 IB 연봉"],
  },
  {
    id: "fund-manager",
    name: "펀드매니저",
    nameEn: "Fund Manager",
    category: "금융",
    salary: {
      entry: { min: 5000, max: 7500, avg: 6000 },
      junior: { min: 8000, max: 15000, avg: 11000 },
      senior: { min: 15000, max: 40000, avg: 25000 },
      overall: 14000,
    },
    description: "투자자의 자금을 위탁받아 주식·채권·대안투자 등에 운용하는 자산운용 전문가.",
    requirements: ["경영·금융·경제학 학위", "CFA·증권투자권유자문인력 자격증", "리서치 경험"],
    relatedCompanyIds: ["mirae-asset", "kb-securities", "samsung-asset-management"],
    relatedCalcSlugs: ["dividend-yield-quick", "dividend-tax-quick", "stock-capital-gains-quick"],
    faqs: [
      { q: "펀드매니저 연봉은 얼마인가요?", a: "신입 펀드매니저는 5,000~7,500만원이며, 운용 실적에 따른 성과보수가 붙어 경력자는 1억~4억원도 가능합니다. 헤지펀드 운용역은 성과에 따라 수십억원도 받습니다." },
    ],
    keywords: ["펀드매니저 연봉", "자산운용사 연봉", "펀드매니저 월급", "CFA 연봉"],
  },
  {
    id: "cpa",
    name: "공인회계사(CPA)",
    nameEn: "Certified Public Accountant",
    category: "금융",
    salary: {
      entry: { min: 5000, max: 7000, avg: 5800 },
      junior: { min: 7000, max: 11000, avg: 8500 },
      senior: { min: 10000, max: 20000, avg: 14000 },
      overall: 9500,
    },
    description: "기업 회계감사·세무조정·M&A 자문 등을 담당하는 회계 전문가. 공인회계사 시험 합격 필수.",
    requirements: ["공인회계사(CPA) 시험 합격", "회계법인 또는 기업 감사팀 근무"],
    relatedCompanyIds: ["samsung-electronics", "lg-electronics"],
    relatedCalcSlugs: ["corporate-tax-quick", "income-tax-bracket-sim", "dividend-tax-quick"],
    faqs: [
      { q: "공인회계사 연봉은 얼마인가요?", a: "4대 회계법인(삼일PwC·삼정KPMG·안진Deloitte·한영EY) 신입 연봉은 5,000~7,000만원이며, 경력 5~10년 매니저·시니어는 9,000만~1억5,000만원입니다. 파트너급은 2억원 이상입니다." },
      { q: "공인회계사 시험 난이도는 어떤가요?", a: "1차(합격률 15~20%)와 2차(합격률 20~25%)로 구성됩니다. 평균 합격까지 2~3년이 소요되며, 회계·세법·재무관리 등 광범위한 시험 범위를 커버해야 합니다." },
    ],
    keywords: ["공인회계사 연봉", "CPA 연봉", "회계사 연봉", "회계사 월급", "회계법인 연봉"],
  },
  {
    id: "tax-accountant",
    name: "세무사",
    nameEn: "Licensed Tax Accountant",
    category: "금융",
    salary: {
      entry: { min: 3500, max: 5000, avg: 4000 },
      junior: { min: 5000, max: 8000, avg: 6200 },
      senior: { min: 7000, max: 20000, avg: 12000 },
      overall: 7500,
    },
    description: "세금 신고·납부·조세 불복 등 납세자의 세무 업무를 대리하는 전문 자격사.",
    requirements: ["세무사 시험 합격", "실무 수습 (1년)"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["corporate-tax-quick", "income-tax-bracket-sim", "vat-quick", "earned-income-tax-quick"],
    faqs: [
      { q: "세무사 연봉은 얼마인가요?", a: "세무법인 취업 신입 세무사 연봉은 3,500~5,000만원이며, 개업 세무사는 5~10년 내에 연 8,000만~2억원까지 가능합니다. 세무조사 대리·양도세 전문 세무사는 수입이 더 높습니다." },
    ],
    keywords: ["세무사 연봉", "세무사 월급", "세무사 평균 연봉", "세무사 실수령액", "세무사 개업 수입"],
  },
  {
    id: "banker",
    name: "은행원",
    nameEn: "Banker",
    category: "금융",
    salary: {
      entry: { min: 4000, max: 5500, avg: 4700 },
      junior: { min: 5500, max: 7500, avg: 6500 },
      senior: { min: 7000, max: 10000, avg: 8200 },
      overall: 6300,
    },
    description: "시중은행·저축은행에서 예금·대출·외환·PB 업무를 담당. KB·신한·하나·우리·농협 등 5대 은행 취업 선호.",
    requirements: ["상경계열 학과 우대", "은행 공채 합격", "금융자격증(FP·투자권유) 우대"],
    relatedCompanyIds: ["kb-bank", "shinhan-bank", "hana-bank", "woori-bank"],
    relatedCalcSlugs: ["earned-income-tax-quick", "loan-monthly-payment", "loan-total-interest"],
    faqs: [
      { q: "은행원 신입 연봉은 얼마인가요?", a: "5대 시중은행 신입 행원 연봉은 성과급 포함 4,000~5,500만원 수준입니다. 일부 은행은 특별성과급 포함 시 6,000만원 이상도 가능합니다." },
      { q: "은행원 워라밸은 어떤가요?", a: "지점 근무는 대면 고객 응대로 스트레스가 있으나, 본점 이동 후에는 개선됩니다. 재택·하이브리드 근무 도입이 확대 중입니다." },
    ],
    keywords: ["은행원 연봉", "은행원 월급", "은행원 평균 연봉", "시중은행 연봉", "KB 연봉", "신한은행 연봉"],
  },
  {
    id: "actuary",
    name: "보험계리사",
    nameEn: "Actuary",
    category: "금융",
    salary: {
      entry: { min: 5000, max: 7000, avg: 5800 },
      junior: { min: 7000, max: 10000, avg: 8500 },
      senior: { min: 10000, max: 18000, avg: 13000 },
      overall: 9000,
    },
    description: "통계·확률 모델로 보험료·준비금·리스크를 계산하는 고급 금융 전문직. 보험계리사 자격증 필수.",
    requirements: ["수학·통계학·보험수리학 관련 학위", "보험계리사 시험 합격 (FSA·FCIA 등)"],
    relatedCompanyIds: ["samsung-life", "korea-life"],
    relatedCalcSlugs: ["income-tax-bracket-sim"],
    faqs: [
      { q: "보험계리사 연봉은 얼마인가요?", a: "신입 보험계리사 연봉은 5,000~7,000만원이며, 경력 10년 이상 수석계리사는 1억~1억8,000만원까지 가능합니다. 준계리사 단계에서도 높은 연봉을 받습니다." },
    ],
    keywords: ["보험계리사 연봉", "계리사 연봉", "보험계리사 월급", "보험계리사 평균 연봉"],
  },

  // ─── 법률 ────────────────────────────────────────────
  {
    id: "lawyer",
    name: "변호사",
    nameEn: "Lawyer / Attorney",
    category: "법률",
    salary: {
      entry: { min: 5000, max: 9000, avg: 6500 },
      junior: { min: 9000, max: 18000, avg: 12000 },
      senior: { min: 15000, max: 50000, avg: 25000 },
      overall: 14000,
    },
    description: "법률 사건을 대리하고 법률 자문을 제공하는 법조 전문직. 로스쿨 3년 졸업 후 변호사 시험 합격 필수.",
    requirements: ["법학전문대학원(로스쿨) 졸업", "변호사 시험 합격", "사법연수원(구 제도) 또는 법원·검찰 실무연수"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["income-tax-bracket-sim", "earned-income-tax-quick", "corporate-tax-quick"],
    faqs: [
      { q: "변호사 연봉은 얼마인가요?", a: "대형 로펌(김앤장·광장·태평양) 신입 변호사 연봉은 8,000만~1억원이며, 중소 로펌은 5,000~8,000만원입니다. 경력 5~10년 파트너급은 2억~5억원, 대형 로펌 시니어 파트너는 10억원 이상도 가능합니다." },
      { q: "변호사 시험 합격률은 얼마인가요?", a: "로스쿨 졸업자 대상 변호사 시험 합격률은 약 50~55% 수준입니다. 수험 기간은 5회 이내로 제한되므로 철저한 준비가 필요합니다." },
    ],
    keywords: ["변호사 연봉", "변호사 월급", "변호사 평균 연봉", "로펌 연봉", "변호사 실수령액", "변호사 신입 연봉"],
  },
  {
    id: "patent-attorney",
    name: "변리사",
    nameEn: "Patent Attorney",
    category: "법률",
    salary: {
      entry: { min: 4500, max: 6500, avg: 5500 },
      junior: { min: 6500, max: 10000, avg: 8000 },
      senior: { min: 10000, max: 25000, avg: 15000 },
      overall: 9500,
    },
    description: "특허·상표·디자인 등 지식재산권 출원·심판·소송을 대리하는 전문 자격사. 변리사 시험 합격 필수.",
    requirements: ["변리사 시험 합격 (1차·2차)", "이공계 학위 우대 (특허청 심사 분야에 따라)"],
    relatedCompanyIds: ["samsung-electronics", "lg-electronics", "sk-hynix"],
    relatedCalcSlugs: ["income-tax-bracket-sim"],
    faqs: [
      { q: "변리사 연봉은 얼마인가요?", a: "특허법인 신입 변리사 연봉은 4,500~6,500만원이며, 경력 5년 이상 파트너급은 1억~2억5,000만원까지 가능합니다. 이공계 박사 출신 변리사는 개업 시 수입이 더 높습니다." },
    ],
    keywords: ["변리사 연봉", "변리사 월급", "변리사 평균 연봉", "특허 변리사 연봉"],
  },
  {
    id: "real-estate-agent",
    name: "공인중개사",
    nameEn: "Real Estate Agent",
    category: "법률",
    salary: {
      entry: { min: 2500, max: 4000, avg: 3000 },
      junior: { min: 3500, max: 6000, avg: 4500 },
      senior: { min: 5000, max: 20000, avg: 9000 },
      overall: 5500,
    },
    description: "부동산 매매·임대차 거래를 중개하고 계약서 작성을 도와주는 공인 자격사. 공인중개사 시험 합격 필수.",
    requirements: ["공인중개사 자격시험 합격", "중개사무소 등록 또는 취업"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["registration-tax-quick", "real-estate-capital-gains-quick", "real-estate-flip-cost"],
    faqs: [
      { q: "공인중개사 연봉은 얼마인가요?", a: "개업 공인중개사의 수입은 위치와 거래 건수에 따라 편차가 큽니다. 강남·서초 등 고가 부동산 지역은 연 1억원 이상도 가능하며, 평균적으로 4,000~9,000만원 수준입니다. 직원 중개보조원은 2,500~4,000만원 수준입니다." },
      { q: "공인중개사 시험 합격률은 얼마인가요?", a: "1차 합격률은 약 30~40%, 2차는 약 25~35%입니다. 인기 자격증이라 경쟁이 치열하며, 대부분 6개월~1년 준비합니다." },
    ],
    keywords: ["공인중개사 연봉", "공인중개사 월급", "공인중개사 수입", "부동산 중개사 연봉"],
  },

  // ─── 공학/제조 ────────────────────────────────────────
  {
    id: "semiconductor-engineer",
    name: "반도체 엔지니어",
    nameEn: "Semiconductor Engineer",
    category: "공학/제조",
    salary: {
      entry: { min: 5000, max: 7000, avg: 5800 },
      junior: { min: 7000, max: 10000, avg: 8200 },
      senior: { min: 10000, max: 18000, avg: 13000 },
      overall: 9000,
    },
    description: "반도체 설계·공정·패키징·테스트를 담당하는 핵심 엔지니어. 삼성전자·SK하이닉스 등 한국 대표 기업 취업.",
    requirements: ["전기·전자·재료공학 학위 (석사 우대)", "회로 설계·공정 이해", "DRAM·NAND·HBM 공정 지식"],
    relatedCompanyIds: ["samsung-electronics", "sk-hynix"],
    relatedCalcSlugs: ["earned-income-tax-quick", "income-tax-bracket-sim", "stock-capital-gains-quick"],
    faqs: [
      { q: "반도체 엔지니어 연봉은 얼마인가요?", a: "삼성전자·SK하이닉스 신입 반도체 엔지니어 연봉(기본급+성과급)은 약 7,000~9,000만원 수준입니다. AI·HBM 호황으로 2024~2025년 성과급이 크게 올랐으며, 경력 10년 시니어는 1억2,000만~1억8,000만원 수준입니다." },
    ],
    keywords: ["반도체 엔지니어 연봉", "삼성전자 엔지니어 연봉", "SK하이닉스 연봉", "반도체 개발자 연봉"],
  },
  {
    id: "mechanical-engineer",
    name: "기계공학자",
    nameEn: "Mechanical Engineer",
    category: "공학/제조",
    salary: {
      entry: { min: 3500, max: 4800, avg: 4000 },
      junior: { min: 4800, max: 6500, avg: 5600 },
      senior: { min: 6000, max: 9000, avg: 7200 },
      overall: 5500,
    },
    description: "기계 설계·해석·제조 공정을 담당하는 엔지니어. 자동차·조선·항공·로봇 산업에서 수요가 높음.",
    requirements: ["기계공학 학위", "CAD(AutoCAD·SolidWorks)·CAE(ANSYS) 능력"],
    relatedCompanyIds: ["hyundai", "kia", "samsung-electronics"],
    relatedCalcSlugs: ["overtime-pay-quick", "severance-pay-quick"],
    faqs: [
      { q: "기계공학자 연봉은 얼마인가요?", a: "신입 기계공학자 연봉은 3,500~4,800만원이며, 현대차·삼성 등 대기업은 4,500만원 이상입니다. 경력 10년 수석엔지니어급은 6,500~9,000만원 수준입니다." },
    ],
    keywords: ["기계공학자 연봉", "기계 엔지니어 연봉", "기계공학 연봉", "자동차 엔지니어 연봉"],
  },
  {
    id: "electrical-engineer",
    name: "전기 엔지니어",
    nameEn: "Electrical Engineer",
    category: "공학/제조",
    salary: {
      entry: { min: 3800, max: 5200, avg: 4400 },
      junior: { min: 5000, max: 7000, avg: 5900 },
      senior: { min: 6500, max: 10000, avg: 8000 },
      overall: 6000,
    },
    description: "전기·전자 시스템 설계·시공·유지보수를 담당. 한전·SK E&S·건설사·제조사 등 수요 많음.",
    requirements: ["전기공학 학위", "전기기사 또는 전기산업기사 자격증 우대"],
    relatedCompanyIds: ["kepco", "samsung-electronics", "lg-electronics"],
    relatedCalcSlugs: ["overtime-pay-quick"],
    faqs: [
      { q: "전기 엔지니어 연봉은 얼마인가요?", a: "신입 전기 엔지니어 연봉은 3,800~5,200만원이며, 전기기사·전기공사기사 자격증 보유 시 우대됩니다. 경력 10년 이상은 6,500~1억원 수준입니다." },
    ],
    keywords: ["전기 엔지니어 연봉", "전기공학 연봉", "전기기사 연봉", "전기 기술자 연봉"],
  },
  {
    id: "civil-engineer",
    name: "토목 엔지니어",
    nameEn: "Civil Engineer",
    category: "공학/제조",
    salary: {
      entry: { min: 3000, max: 4200, avg: 3600 },
      junior: { min: 4200, max: 6000, avg: 5000 },
      senior: { min: 5800, max: 9000, avg: 7000 },
      overall: 5100,
    },
    description: "도로·교량·터널·댐 등 사회기반시설을 설계·시공·감리하는 엔지니어.",
    requirements: ["토목공학 학위", "토목기사 자격증 우대"],
    relatedCompanyIds: ["daewoo-construction", "gs-construction"],
    relatedCalcSlugs: ["overtime-pay-quick", "severance-pay-quick"],
    faqs: [
      { q: "토목 엔지니어 연봉은 얼마인가요?", a: "신입 토목 엔지니어 연봉은 3,000~4,200만원이며, 현장 수당이 붙을 경우 더 높습니다. 경력 10년 이상 수석은 6,000~9,000만원 수준입니다." },
    ],
    keywords: ["토목 엔지니어 연봉", "토목공학 연봉", "토목기사 연봉", "건설 엔지니어 연봉"],
  },
  {
    id: "chemical-engineer",
    name: "화학 엔지니어",
    nameEn: "Chemical Engineer",
    category: "공학/제조",
    salary: {
      entry: { min: 3800, max: 5200, avg: 4400 },
      junior: { min: 5200, max: 7200, avg: 6000 },
      senior: { min: 7000, max: 11000, avg: 8500 },
      overall: 6000,
    },
    description: "화학·석유화학·배터리·정유 플랜트의 공정 설계 및 운영을 담당하는 엔지니어.",
    requirements: ["화학공학 학위", "공정 시뮬레이션(Aspen) 능력"],
    relatedCompanyIds: ["lg-chem", "lotte-chemical"],
    relatedCalcSlugs: ["overtime-pay-quick"],
    faqs: [
      { q: "화학 엔지니어 연봉은 얼마인가요?", a: "신입 화학 엔지니어 연봉은 3,800~5,200만원이며, LG화학·롯데케미칼 등 대기업은 4,500만원 이상입니다. 경력 10년 이상은 7,000~1억원 수준입니다." },
    ],
    keywords: ["화학 엔지니어 연봉", "화학공학 연봉", "석유화학 연봉", "배터리 엔지니어 연봉"],
  },
  {
    id: "automotive-engineer",
    name: "자동차 엔지니어",
    nameEn: "Automotive Engineer",
    category: "공학/제조",
    salary: {
      entry: { min: 4500, max: 6000, avg: 5000 },
      junior: { min: 6000, max: 8500, avg: 7000 },
      senior: { min: 8000, max: 13000, avg: 10000 },
      overall: 7000,
    },
    description: "차량 설계·파워트레인·전기차 개발·자율주행 등을 담당하는 자동차 산업 엔지니어.",
    requirements: ["기계·전기·전자공학 학위", "EV·자율주행 관련 기술 우대"],
    relatedCompanyIds: ["hyundai", "kia"],
    relatedCalcSlugs: ["earned-income-tax-quick", "stock-capital-gains-quick"],
    faqs: [
      { q: "자동차 엔지니어 연봉은 얼마인가요?", a: "현대차·기아 신입 엔지니어 연봉(기본+성과)은 5,000~7,000만원 수준입니다. 전기차·자율주행 전문 엔지니어는 시장 수요 증가로 연봉이 빠르게 오르고 있습니다." },
    ],
    keywords: ["자동차 엔지니어 연봉", "현대차 연봉", "기아 연봉", "자동차 연봉", "전기차 엔지니어 연봉"],
  },
  {
    id: "architect",
    name: "건축사",
    nameEn: "Architect",
    category: "공학/제조",
    salary: {
      entry: { min: 3200, max: 4500, avg: 3700 },
      junior: { min: 4500, max: 6500, avg: 5300 },
      senior: { min: 6000, max: 12000, avg: 8000 },
      overall: 5500,
    },
    description: "건물 설계·감리·인허가를 담당하는 건축 전문직. 건축사 면허 취득 후 독립 개업 가능.",
    requirements: ["건축학과 5년제 졸업", "건축사 면허 취득 (건축사 시험 합격)"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["registration-tax-quick", "acquisition-tax-quick"],
    faqs: [
      { q: "건축사 연봉은 얼마인가요?", a: "설계사무소 신입 건축사 연봉은 3,200~4,500만원이며, 대형 설계사무소·건설사는 더 높습니다. 개업 건축사는 프로젝트에 따라 수입이 크게 달라집니다." },
    ],
    keywords: ["건축사 연봉", "건축사 월급", "건축 설계사 연봉", "건축사 실수령액"],
  },

  // ─── 경영/서비스 ───────────────────────────────────────
  {
    id: "marketer",
    name: "마케터",
    nameEn: "Marketer",
    category: "경영/서비스",
    salary: {
      entry: { min: 3000, max: 4200, avg: 3500 },
      junior: { min: 4200, max: 6500, avg: 5200 },
      senior: { min: 6000, max: 10000, avg: 7800 },
      overall: 5300,
    },
    description: "브랜드·디지털·퍼포먼스·콘텐츠 마케팅을 담당하는 직군. IT기업·소비재·스타트업에서 수요가 높음.",
    requirements: ["경영·광고·커뮤니케이션 학과 우대", "데이터 분석(GA·Meta Ads) 능력", "콘텐츠 기획력"],
    relatedCompanyIds: ["naver", "kakao", "coupang"],
    relatedCalcSlugs: ["earned-income-tax-quick"],
    faqs: [
      { q: "마케터 연봉은 얼마인가요?", a: "신입 마케터 연봉은 3,000~4,200만원이며, 대형 IT기업(네이버·카카오)은 4,000만원 이상입니다. 성과 기반 퍼포먼스 마케터나 그로스해커는 경력이 쌓이면 7,000만~1억원도 가능합니다." },
    ],
    keywords: ["마케터 연봉", "마케터 월급", "마케팅 연봉", "디지털 마케터 연봉", "퍼포먼스 마케터 연봉"],
  },
  {
    id: "management-consultant",
    name: "경영 컨설턴트",
    nameEn: "Management Consultant",
    category: "경영/서비스",
    salary: {
      entry: { min: 6000, max: 8500, avg: 7000 },
      junior: { min: 9000, max: 15000, avg: 11000 },
      senior: { min: 15000, max: 35000, avg: 22000 },
      overall: 13000,
    },
    description: "기업 전략·운영·디지털 전환 등을 자문하는 전략 컨설팅 전문가. McKinsey·BCG·Bain 등 빅3 및 PwC·Deloitte 등 Big4 컨설팅.",
    requirements: ["상위권 대학 MBA 또는 학사", "전략적 사고·데이터 분석 능력", "영어 능통"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["income-tax-bracket-sim", "earned-income-tax-quick"],
    faqs: [
      { q: "경영 컨설턴트 연봉은 얼마인가요?", a: "McKinsey·BCG·Bain 빅3 신입 어소시에이트 연봉은 7,000만~1억원이며, 성과 보너스 포함 시 1억~1억5,000만원입니다. 5년 이상 매니저급은 2억원 이상입니다." },
    ],
    keywords: ["컨설턴트 연봉", "경영 컨설턴트 연봉", "McKinsey 연봉", "BCG 연봉", "컨설팅 연봉"],
  },
  {
    id: "flight-attendant",
    name: "항공승무원",
    nameEn: "Flight Attendant",
    category: "경영/서비스",
    salary: {
      entry: { min: 3000, max: 4500, avg: 3600 },
      junior: { min: 4000, max: 5500, avg: 4700 },
      senior: { min: 5000, max: 7000, avg: 6000 },
      overall: 4600,
    },
    description: "항공기 내 승객 서비스·안전을 담당하는 캐빈 크루. 대한항공·아시아나항공·저가항공사 등 취업.",
    requirements: ["영어 기본 이상 (국제선은 영어 필수)", "항공사 공채 합격", "신체검사 통과"],
    relatedCompanyIds: ["korean-air", "asiana-airlines"],
    relatedCalcSlugs: ["overtime-pay-quick", "night-shift-pay-quick"],
    faqs: [
      { q: "항공승무원 연봉은 얼마인가요?", a: "대한항공·아시아나항공 신입 승무원 연봉은 국제선 탑승수당·숙박비 포함 시 3,000~4,500만원 수준입니다. 경력 7~10년 사무장급은 5,500~7,000만원까지 오릅니다." },
      { q: "항공승무원 경쟁률은 어떤가요?", a: "대형 항공사 신입 공채 경쟁률은 100:1 이상으로 매우 높습니다. 외모·영어 능력·서비스 마인드·체력이 주요 선발 기준입니다." },
    ],
    keywords: ["항공승무원 연봉", "스튜어디스 연봉", "캐빈크루 연봉", "대한항공 승무원 연봉"],
  },
  {
    id: "pilot",
    name: "파일럿(기장/부기장)",
    nameEn: "Pilot",
    category: "경영/서비스",
    salary: {
      entry: { min: 6000, max: 9000, avg: 7000 },  // 부기장 초임
      junior: { min: 9000, max: 14000, avg: 11000 },
      senior: { min: 13000, max: 20000, avg: 16000 },  // 기장급
      overall: 12000,
    },
    description: "여객기·화물기를 조종하는 항공 전문직. 자가용·사업용·운송용 조종사 자격증 단계별 취득 필요.",
    requirements: ["항공학과 또는 비행학교 교육", "조종사 면허 취득 (ATPL)", "비행시간 누적"],
    relatedCompanyIds: ["korean-air", "asiana-airlines"],
    relatedCalcSlugs: ["income-tax-bracket-sim"],
    faqs: [
      { q: "파일럿 연봉은 얼마인가요?", a: "대한항공·아시아나 부기장 초임은 연 6,000~9,000만원이며, 기장(Captain)이 되면 1억3,000만~2억원 수준입니다. 해외 항공사로 이직 시 연 2억원 이상도 가능합니다." },
    ],
    keywords: ["파일럿 연봉", "기장 연봉", "부기장 연봉", "조종사 연봉", "파일럿 월급"],
  },
  {
    id: "hr-specialist",
    name: "HR 담당자",
    nameEn: "HR Specialist",
    category: "경영/서비스",
    salary: {
      entry: { min: 3000, max: 4200, avg: 3500 },
      junior: { min: 4200, max: 6200, avg: 5000 },
      senior: { min: 6000, max: 9500, avg: 7500 },
      overall: 5200,
    },
    description: "채용·교육·노무·조직문화·보상 등 인사 전반을 담당. 대기업·스타트업·컨설팅사 등 전 산업에 걸쳐 수요.",
    requirements: ["경영·심리·법학 학과 우대", "노무 관련 자격증 우대", "HR 솔루션 경험"],
    relatedCompanyIds: ["samsung-electronics", "naver", "kakao"],
    relatedCalcSlugs: ["severance-pay-quick", "annual-leave-pay-quick", "overtime-pay-quick"],
    faqs: [
      { q: "HR 담당자 연봉은 얼마인가요?", a: "신입 HR 담당자 연봉은 3,000~4,200만원이며, 대기업 HR 팀장급은 7,000만~9,500만원 수준입니다. CHRO(최고인사책임자)는 1억원 이상입니다." },
    ],
    keywords: ["HR 담당자 연봉", "인사담당자 연봉", "채용 담당자 연봉", "HR 연봉"],
  },

  // ─── 미디어/창작 ───────────────────────────────────────
  {
    id: "journalist",
    name: "기자",
    nameEn: "Journalist",
    category: "미디어/창작",
    salary: {
      entry: { min: 3500, max: 5000, avg: 4000 },
      junior: { min: 4500, max: 6500, avg: 5500 },
      senior: { min: 6000, max: 10000, avg: 7500 },
      overall: 5700,
    },
    description: "뉴스·기사를 취재·작성·편집하는 언론 전문직. 방송사·신문사·인터넷 언론사 취업.",
    requirements: ["언론·국문·법학 등 학과", "언론사 공채 합격", "글쓰기·취재 능력"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["earned-income-tax-quick"],
    faqs: [
      { q: "기자 연봉은 얼마인가요?", a: "KBS·MBC·SBS 등 주요 방송사 신입 기자 연봉은 4,000~6,000만원이며, 조선·중앙·동아 등 주요 신문사도 비슷한 수준입니다. 경력 10년 이상 부장급은 7,000만~1억원 수준입니다." },
    ],
    keywords: ["기자 연봉", "기자 월급", "기자 평균 연봉", "방송기자 연봉", "신문기자 연봉"],
  },
  {
    id: "producer-director",
    name: "PD(방송연출가)",
    nameEn: "TV Producer / Director",
    category: "미디어/창작",
    salary: {
      entry: { min: 3500, max: 5500, avg: 4500 },
      junior: { min: 5000, max: 7500, avg: 6000 },
      senior: { min: 7000, max: 13000, avg: 9000 },
      overall: 6500,
    },
    description: "TV·OTT 프로그램을 기획·연출·제작하는 방송 전문직. KBS·MBC·SBS·CJ ENM·JTBC 등 취업.",
    requirements: ["방송사 공채 합격", "영상 제작 포트폴리오"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["earned-income-tax-quick"],
    faqs: [
      { q: "PD 연봉은 얼마인가요?", a: "공채 PD 신입 연봉은 3,500~5,500만원이며, 경력 10년 이상 CP·국장급은 8,000만~1억3,000만원 수준입니다. 프리랜서 PD나 OTT 오리지널 PD는 수익이 더 높을 수 있습니다." },
    ],
    keywords: ["PD 연봉", "방송 PD 연봉", "연출가 연봉", "PD 월급", "방송사 연봉"],
  },
  {
    id: "game-designer",
    name: "게임 기획자",
    nameEn: "Game Designer",
    category: "미디어/창작",
    salary: {
      entry: { min: 3500, max: 5000, avg: 4200 },
      junior: { min: 5000, max: 8000, avg: 6200 },
      senior: { min: 7500, max: 13000, avg: 9500 },
      overall: 6600,
    },
    description: "게임의 전체 콘셉트·레벨·시스템·경제·콘텐츠를 설계하는 게임 기획 전문직.",
    requirements: ["게임 관련 학과 또는 풍부한 게임 경험", "엑셀·기획서 작성 능력", "포트폴리오"],
    relatedCompanyIds: ["krafton", "ncsoft", "nexon"],
    relatedCalcSlugs: ["earned-income-tax-quick", "stock-capital-gains-quick"],
    faqs: [
      { q: "게임 기획자 연봉은 얼마인가요?", a: "신입 게임 기획자 연봉은 3,500~5,000만원이며, 크래프톤·엔씨소프트·넥슨 등 대형 게임사는 4,500만원 이상입니다. 경력 10년 이상 디렉터급은 9,000만~1억3,000만원 수준입니다." },
    ],
    keywords: ["게임 기획자 연봉", "게임 기획 연봉", "게임 디자이너 연봉", "게임PD 연봉"],
  },

  // ─── 바이오/연구 ───────────────────────────────────────
  {
    id: "biotech-researcher",
    name: "바이오 연구원",
    nameEn: "Biotech Researcher",
    category: "바이오/연구",
    salary: {
      entry: { min: 4000, max: 6000, avg: 4800 },
      junior: { min: 5500, max: 8000, avg: 6700 },
      senior: { min: 8000, max: 14000, avg: 10500 },
      overall: 7000,
    },
    description: "신약·백신·진단키트·바이오소재를 연구·개발하는 생명과학 전문직. 삼성바이오로직스·셀트리온·한미약품 등 취업.",
    requirements: ["생명공학·분자생물학·의생명과학 학위 (석·박사 우대)", "실험 기술 (세포배양·유전자편집·단백질 분석)"],
    relatedCompanyIds: ["samsung-bioepis", "celltrion", "hanmi-pharm"],
    relatedCalcSlugs: ["earned-income-tax-quick", "stock-capital-gains-quick"],
    faqs: [
      { q: "바이오 연구원 연봉은 얼마인가요?", a: "신입 바이오 연구원(학사)은 4,000~5,000만원, 석사 신입은 4,500~6,000만원, 박사 신입은 5,000~7,000만원 수준입니다. 삼성바이오로직스·셀트리온 등 대형 바이오 기업은 더 높습니다." },
    ],
    keywords: ["바이오 연구원 연봉", "생명공학 연봉", "바이오텍 연봉", "제약 연구원 연봉"],
  },
  {
    id: "clinical-researcher",
    name: "임상연구원(CRA/CRC)",
    nameEn: "Clinical Research Associate",
    category: "바이오/연구",
    salary: {
      entry: { min: 3500, max: 5000, avg: 4000 },
      junior: { min: 5000, max: 7500, avg: 6000 },
      senior: { min: 7000, max: 11000, avg: 8500 },
      overall: 6100,
    },
    description: "임상시험의 계획·수행·모니터링·데이터 관리를 담당. 제약사·CRO(임상시험수탁기관)·병원 근무.",
    requirements: ["생명과학·간호학·약학 관련 학위", "임상시험 GCP 교육 이수"],
    relatedCompanyIds: ["hanmi-pharm", "chong-kun-dang"],
    relatedCalcSlugs: ["overtime-pay-quick"],
    faqs: [
      { q: "임상연구원 연봉은 얼마인가요?", a: "신입 CRA/CRC 연봉은 3,500~5,000만원이며, 경력 5년 이상 시니어 CRA는 6,000~8,000만원, 매니저급은 8,000만~1억1,000만원 수준입니다." },
    ],
    keywords: ["임상연구원 연봉", "CRA 연봉", "CRC 연봉", "임상시험 연봉", "제약사 연봉"],
  },
  {
    id: "nutritionist-dietitian",
    name: "영양사",
    nameEn: "Nutritionist / Dietitian",
    category: "바이오/연구",
    salary: {
      entry: { min: 2500, max: 3300, avg: 2800 },
      junior: { min: 3000, max: 3800, avg: 3400 },
      senior: { min: 3500, max: 5000, avg: 4200 },
      overall: 3400,
    },
    description: "급식관리·영양상담·식단 설계를 담당하는 식품영양 전문직. 병원·학교·사업장급식·보건소 등 근무.",
    requirements: ["식품영양학과 졸업", "영양사 면허증"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["annual-leave-pay-quick"],
    faqs: [
      { q: "영양사 연봉은 얼마인가요?", a: "신입 영양사 연봉은 2,500~3,300만원 수준이며, 병원영양사·임상영양사는 더 높습니다. 상급종합병원 임상영양사 경력자는 4,000~5,000만원까지 가능합니다." },
    ],
    keywords: ["영양사 연봉", "영양사 월급", "영양사 평균 연봉", "임상영양사 연봉"],
  },
  {
    id: "social-worker",
    name: "사회복지사",
    nameEn: "Social Worker",
    category: "경영/서비스",
    salary: {
      entry: { min: 2400, max: 3200, avg: 2700 },
      junior: { min: 2900, max: 3800, avg: 3300 },
      senior: { min: 3500, max: 5000, avg: 4100 },
      overall: 3300,
    },
    description: "취약계층·노인·장애인·아동 대상 복지 서비스를 제공하는 전문 사회복지 인력.",
    requirements: ["사회복지학과 졸업 또는 학점은행제", "사회복지사 1급 자격증"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["annual-leave-pay-quick"],
    faqs: [
      { q: "사회복지사 연봉은 얼마인가요?", a: "신입 사회복지사 연봉은 2,400~3,200만원 수준이며, 공공 사회복지직(공무원)은 3,000만원 이상입니다. 경력이 쌓이고 관리자급이 되면 4,000~5,000만원까지 가능합니다." },
    ],
    keywords: ["사회복지사 연봉", "사회복지사 월급", "사회복지사 평균 연봉", "사회복지 연봉"],
  },
  {
    id: "counselor",
    name: "심리상담사",
    nameEn: "Counselor / Psychotherapist",
    category: "경영/서비스",
    salary: {
      entry: { min: 2500, max: 3500, avg: 2900 },
      junior: { min: 3000, max: 4500, avg: 3700 },
      senior: { min: 4000, max: 8000, avg: 5500 },
      overall: 4000,
    },
    description: "개인·집단 심리상담을 통해 정신건강을 돕는 전문직. 민간 자격증부터 정신건강전문요원까지 다양한 자격 체계.",
    requirements: ["심리학·상담학 학위", "임상심리사·정신건강상담사 등 자격증"],
    relatedCompanyIds: [],
    relatedCalcSlugs: ["earned-income-tax-quick"],
    faqs: [
      { q: "심리상담사 연봉은 얼마인가요?", a: "신입 심리상담사 연봉은 2,500~3,500만원이며, 개인 개업 상담사는 회기 수에 따라 수입이 달라집니다. 수요 증가로 기업 EAP 상담사, 학교 상담사 등 취업 경로가 다양해지고 있습니다." },
    ],
    keywords: ["심리상담사 연봉", "상담사 연봉", "심리상담사 월급", "임상심리사 연봉"],
  },
  {
    id: "logistics-manager",
    name: "물류/SCM 담당자",
    nameEn: "Logistics / SCM Manager",
    category: "경영/서비스",
    salary: {
      entry: { min: 3000, max: 4200, avg: 3500 },
      junior: { min: 4200, max: 6000, avg: 5000 },
      senior: { min: 6000, max: 9000, avg: 7200 },
      overall: 5200,
    },
    description: "공급망(SCM) 관리·물류 운영·수출입 통관을 담당하는 경영 지원 직군.",
    requirements: ["경영·물류·무역 관련 학과", "물류관리사·관세사 자격증 우대"],
    relatedCompanyIds: ["cj-logistics", "hyundai", "samsung-electronics"],
    relatedCalcSlugs: ["earned-income-tax-quick"],
    faqs: [
      { q: "물류/SCM 담당자 연봉은 얼마인가요?", a: "신입 연봉은 3,000~4,200만원이며, 대기업 SCM팀 경력자는 7,000~9,000만원 수준입니다. 글로벌 물류 전문가는 더 높은 대우를 받습니다." },
    ],
    keywords: ["물류 담당자 연봉", "SCM 연봉", "물류관리사 연봉", "공급망관리 연봉"],
  },
];

// 카테고리별 그룹
export const jobsByCategory = jobsData.reduce<Record<JobCategory, JobProfile[]>>(
  (acc, job) => {
    if (!acc[job.category]) acc[job.category] = [];
    acc[job.category].push(job);
    return acc;
  },
  {} as Record<JobCategory, JobProfile[]>
);

export function getJobById(id: string): JobProfile | undefined {
  return jobsData.find((j) => j.id === id);
}
