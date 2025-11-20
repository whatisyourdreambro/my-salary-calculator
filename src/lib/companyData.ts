export interface CompanyProfile {
    id: string;
    name: string;
    industry: string;
    description: string;
    logo: string; // Placeholder color or text for now
    employees: number;
    averageSalary: number; // Man won
    entryLevelSalary: number; // Man won
    executiveSalary: number; // Man won
    salaryGrowth: { year: number; salary: number }[];
    benefits: string[];
    tags: string[];
}

export const companies: CompanyProfile[] = [
    {
        id: "samsung-electronics",
        name: "삼성전자",
        industry: "IT/제조",
        description: "대한민국 시가총액 1위, 글로벌 반도체 및 모바일 리더.",
        logo: "bg-blue-600",
        employees: 120000,
        averageSalary: 13500,
        entryLevelSalary: 5300,
        executiveSalary: 80000,
        salaryGrowth: [
            { year: 1, salary: 5300 },
            { year: 3, salary: 7200 },
            { year: 5, salary: 9500 },
            { year: 10, salary: 14000 },
            { year: 15, salary: 18000 },
        ],
        benefits: ["복지포인트 100만원", "사내 병원", "자녀 학자금", "휴양소 지원"],
        tags: ["대기업", "반도체", "성과급"],
    },
    {
        id: "sk-hynix",
        name: "SK하이닉스",
        industry: "반도체",
        description: "글로벌 메모리 반도체 강자, 성과급의 제왕.",
        logo: "bg-red-600",
        employees: 30000,
        averageSalary: 14000,
        entryLevelSalary: 5500,
        executiveSalary: 75000,
        salaryGrowth: [
            { year: 1, salary: 5500 },
            { year: 3, salary: 7800 },
            { year: 5, salary: 10500 },
            { year: 10, salary: 15000 },
            { year: 15, salary: 19000 },
        ],
        benefits: ["해피프라이데이 (월 1회 휴무)", "의료비 지원", "주택 자금 대출"],
        tags: ["대기업", "성과급", "워라밸"],
    },
    {
        id: "naver",
        name: "NAVER",
        industry: "IT/플랫폼",
        description: "대한민국 대표 검색 포털 및 기술 플랫폼.",
        logo: "bg-green-500",
        employees: 4500,
        averageSalary: 12000,
        entryLevelSalary: 5000,
        executiveSalary: 60000,
        salaryGrowth: [
            { year: 1, salary: 5000 },
            { year: 3, salary: 7000 },
            { year: 5, salary: 9000 },
            { year: 10, salary: 13000 },
            { year: 15, salary: 16000 },
        ],
        benefits: ["유연근무제", "조식/중식/석식 무료", "최고급 장비 지원"],
        tags: ["IT", "판교", "수평문화"],
    },
    {
        id: "kakao",
        name: "카카오",
        industry: "IT/플랫폼",
        description: "국민 메신저 카카오톡을 기반으로 한 모바일 라이프 플랫폼.",
        logo: "bg-yellow-400",
        employees: 3800,
        averageSalary: 11000,
        entryLevelSalary: 4800,
        executiveSalary: 55000,
        salaryGrowth: [
            { year: 1, salary: 4800 },
            { year: 3, salary: 6800 },
            { year: 5, salary: 8800 },
            { year: 10, salary: 12500 },
            { year: 15, salary: 15500 },
        ],
        benefits: ["안식휴가 (3년 근속 시 1개월)", "어린이집", "대출 이자 지원"],
        tags: ["IT", "판교", "복지"],
    },
    {
        id: "hyundai-motor",
        name: "현대자동차",
        industry: "자동차/제조",
        description: "글로벌 Top 3 완성차 업체, 모빌리티 혁신 리더.",
        logo: "bg-blue-900",
        employees: 70000,
        averageSalary: 10500,
        entryLevelSalary: 5000,
        executiveSalary: 65000,
        salaryGrowth: [
            { year: 1, salary: 5000 },
            { year: 3, salary: 6500 },
            { year: 5, salary: 8000 },
            { year: 10, salary: 11000 },
            { year: 15, salary: 14000 },
        ],
        benefits: ["차량 구매 할인 (최대 30%)", "자녀 학자금", "주거 지원"],
        tags: ["대기업", "제조", "차량할인"],
    },
    {
        id: "lg-energy",
        name: "LG에너지솔루션",
        industry: "배터리",
        description: "글로벌 배터리 시장 점유율 1위, 전기차 시대의 심장.",
        logo: "bg-pink-600",
        employees: 10000,
        averageSalary: 11500,
        entryLevelSalary: 5200,
        executiveSalary: 70000,
        salaryGrowth: [
            { year: 1, salary: 5200 },
            { year: 3, salary: 7000 },
            { year: 5, salary: 9200 },
            { year: 10, salary: 13000 },
            { year: 15, salary: 17000 },
        ],
        benefits: ["복지포인트", "주택 자금 대출", "의료비 지원"],
        tags: ["대기업", "2차전지", "성장성"],
    },
];
