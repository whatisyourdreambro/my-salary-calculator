import { CompanyProfile } from "@/types/company";

export const seedCompanies: CompanyProfile[] = [
    {
        id: "samsung-electronics",
        name: { ko: "삼성전자", en: "Samsung Electronics" },
        industry: "Semiconductor / Consumer Electronics",
        tier: "conglomerate",
        logo: "🏢",
        description: "대한민국 시가총액 1위, 글로벌 반도체 및 모바일 리더.",
        salary: {
            entry: {
                base: 53000000,
                incentive: { target: 50, max: 50, avgAmount: 25000000 },
            },
            junior: {
                base: 70000000,
                incentive: { target: 50, max: 50, avgAmount: 35000000 },
            },
            senior: {
                base: 95000000,
                incentive: { target: 50, max: 50, avgAmount: 45000000 },
            },
            lead: {
                base: 130000000,
                incentive: { target: 50, max: 50, avgAmount: 60000000 },
            },
            executive: {
                base: 250000000,
                incentive: { target: 50, max: 50, avgAmount: 120000000 },
            },
        },
        workLife: {
            weeklyHours: { contract: 40, real: 48 },
            remoteWork: { policy: "office", description: "원칙적 출근, 부서별 상이" },
            vacation: { days: 15, usageRate: 85 },
        },
        culture: {
            score: 8.2,
            keywords: ["성과주의", "체계적", "대기업", "복지끝판왕"],
            pros: ["압도적인 성과급(OPI)", "삼시세끼 무료", "최고 수준의 의료비 지원"],
            cons: ["수직적인 문화", "부서 바이 부서(부바부) 심함", "지방 근무 가능성"],
        },
        benefits: [
            { category: "financial", title: "OPI (성과인센티브)", description: "연봉의 최대 50% 지급", value: 25000000 },
            { category: "financial", title: "TAI (목표달성장려금)", description: "월 기본급의 최대 100% (연 2회)", value: 6000000 },
            { category: "health", title: "사내 병원/약국", description: "임직원 및 가족 의료비 지원", value: 2000000 },
            { category: "lifestyle", title: "삼시세끼 무료", description: "아침, 점심, 저녁 사내식당 무료 제공", value: 3600000 },
        ],
        lastUpdated: "2025-11-23",
    },
    {
        id: "sk-hynix",
        name: { ko: "SK하이닉스", en: "SK Hynix" },
        industry: "Semiconductor",
        tier: "conglomerate",
        logo: "💾",
        description: "글로벌 메모리 반도체 2위, AI 반도체(HBM) 선두주자.",
        salary: {
            entry: {
                base: 53000000,
                incentive: { target: 50, max: 50, avgAmount: 28000000 }, // Recent boom
            },
            junior: {
                base: 72000000,
                incentive: { target: 50, max: 50, avgAmount: 38000000 },
            },
            senior: {
                base: 98000000,
                incentive: { target: 50, max: 50, avgAmount: 50000000 },
            },
            lead: {
                base: 135000000,
                incentive: { target: 50, max: 50, avgAmount: 70000000 },
            },
            executive: {
                base: 260000000,
                incentive: { target: 50, max: 50, avgAmount: 150000000 },
            },
        },
        workLife: {
            weeklyHours: { contract: 40, real: 46 },
            remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "거점 오피스 활용 가능" },
            vacation: { days: 15, usageRate: 90 },
        },
        culture: {
            score: 8.5,
            keywords: ["수평적 지향", "성과공유", "해피프라이데이"],
            pros: ["해피프라이데이(월 2회 휴무)", "높은 성과급", "자유로운 연차 사용"],
            cons: ["이천/청주 근무", "반도체 사이클에 따른 성과급 변동"],
        },
        benefits: [
            { category: "lifestyle", title: "해피프라이데이", description: "월 2회 금요일 휴무 (주 4일 근무 효과)", value: 5000000 },
            { category: "financial", title: "PS (초과이익분배금)", description: "영업이익의 10% 재원 활용", value: 30000000 },
            { category: "family", title: "난임 시술 지원", description: "최대 1000만원 지원", value: 0 },
        ],
        lastUpdated: "2025-11-23",
    },
    {
        id: "naver",
        name: { ko: "네이버", en: "NAVER" },
        industry: "IT / Internet",
        tier: "unicorn",
        logo: "💚",
        description: "대한민국 대표 검색 포털 및 테크 기업.",
        salary: {
            entry: {
                base: 55000000,
                incentive: { target: 15, max: 30, avgAmount: 8000000 },
                stock: { type: "RSU", amount: 10000000, vesting: "3 years" },
            },
            junior: {
                base: 75000000,
                incentive: { target: 20, max: 40, avgAmount: 15000000 },
                stock: { type: "RSU", amount: 20000000, vesting: "3 years" },
            },
            senior: {
                base: 105000000,
                incentive: { target: 25, max: 50, avgAmount: 25000000 },
                stock: { type: "RSU", amount: 40000000, vesting: "3 years" },
            },
            lead: {
                base: 150000000,
                incentive: { target: 30, max: 60, avgAmount: 45000000 },
                stock: { type: "RSU", amount: 80000000, vesting: "3 years" },
            },
            executive: {
                base: 300000000,
                incentive: { target: 50, max: 100, avgAmount: 150000000 },
            },
        },
        workLife: {
            weeklyHours: { contract: 40, real: 42 },
            remoteWork: { policy: "remote", description: "Type R(Remote) / Type O(Office) 선택 가능" },
            vacation: { days: 20, usageRate: 95 },
        },
        culture: {
            score: 9.0,
            keywords: ["자율", "수평", "기술중심", "워라밸"],
            pros: ["완전 자율 근무(재택 선택)", "눈치 안 보는 휴가", "최고의 동료"],
            cons: ["성과 압박", "개인주의 성향", "정체된 연봉 상승률"],
        },
        benefits: [
            { category: "growth", title: "업무 기기 지원", description: "최고사양 맥북/노트북 및 장비 지원", value: 3000000 },
            { category: "financial", title: "스톡그랜트", description: "매년 1천만원 상당 자사주 지급", value: 10000000 },
            { category: "lifestyle", title: "커넥티드 워크", description: "원격 근무 지원금 (월 15만원)", value: 1800000 },
        ],
        lastUpdated: "2025-11-23",
    },
    // 4. Kakao
    {
        id: "kakao",
        name: { ko: "카카오", en: "Kakao" },
        industry: "IT/Platform",
        tier: "conglomerate",
        logo: "🟡",
        description: "국민 메신저 카카오톡을 기반으로 한 대한민국 대표 모바일 생활 플랫폼 기업입니다.",
        salary: {
            entry: { base: 55000000, incentive: { target: 15, max: 30, avgAmount: 8000000 }, stock: { type: "RSU", amount: 10000000, vesting: "4 years" }, signOn: 0 },
            junior: { base: 65000000, incentive: { target: 15, max: 30, avgAmount: 10000000 }, stock: { type: "RSU", amount: 15000000, vesting: "4 years" } },
            senior: { base: 90000000, incentive: { target: 20, max: 40, avgAmount: 18000000 }, stock: { type: "RSU", amount: 30000000, vesting: "4 years" } },
            lead: { base: 130000000, incentive: { target: 25, max: 50, avgAmount: 30000000 }, stock: { type: "RSU", amount: 50000000, vesting: "4 years" } },
            executive: { base: 250000000, incentive: { target: 50, max: 100, avgAmount: 100000000 }, stock: { type: "RSU", amount: 100000000, vesting: "4 years" } },
        },
        workLife: {
            weeklyHours: { contract: 40, real: 42 },
            vacation: { days: 25, usageRate: 95 },
            remoteWork: { policy: "hybrid", description: "부서별 자율 근무제" },
        },
        benefits: [
            { category: "health", title: "안식휴가", description: "3년 근속 시 1개월 유급 휴가", value: 5000000 },
            { category: "financial", title: "대출 지원", description: "최대 3억 주택자금 대출 이자 지원", value: 4000000 },
            { category: "lifestyle", title: "점심/저녁 식대", description: "월 30만원 포인트 지급", value: 3600000 },
        ],
        culture: {
            score: 8.5,
            keywords: ["자율", "수평", "영어이름"],
            pros: ["자유로운 연차 사용", "3년마다 돌아오는 안식휴가", "수평적인 소통 문화"],
            cons: ["잦은 조직 개편", "부서바부서(케바케) 심함"],
        },
        lastUpdated: "2025-11-23",
    },
    // 5. Coupang
    {
        id: "coupang",
        name: { ko: "쿠팡", en: "Coupang" },
        industry: "E-commerce",
        tier: "unicorn",
        logo: "🚀",
        description: "로켓배송으로 쇼핑의 상식을 깬 글로벌 이커머스 기업입니다.",
        salary: {
            entry: { base: 60000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" }, signOn: 0 },
            junior: { base: 80000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" } },
            senior: { base: 120000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" } },
            lead: { base: 180000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" } },
            executive: { base: 350000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" } },
        },
        workLife: {
            weeklyHours: { contract: 40, real: 45 },
            vacation: { days: 15, usageRate: 80 },
            remoteWork: { policy: "hybrid", description: "주 1~2회 재택 (직군별 상이)" },
        },
        benefits: [
            { category: "lifestyle", title: "쿠팡캐시", description: "연 100만원 상당 지급", value: 1000000 },
            { category: "financial", title: "단체상해보험", description: "본인 및 가족 의료비 지원", value: 1000000 },
        ],
        culture: {
            score: 7.8,
            keywords: ["치열함", "데이터", "글로벌"],
            pros: ["업계 최고 수준의 연봉", "글로벌 인재와 협업 기회", "빠른 성장 속도"],
            cons: ["높은 업무 강도", "성과 압박", "외국계 특유의 냉정함"],
        },
        lastUpdated: "2025-11-23",
    },
    // 6. Viva Republica (Toss)
    {
        id: "toss",
        name: { ko: "비바리퍼블리카 (토스)", en: "Viva Republica" },
        industry: "Fintech",
        tier: "unicorn",
        logo: "🔵",
        description: "금융의 모든 것을 토스에서. 대한민국 핀테크 혁신을 주도하는 유니콘입니다.",
        salary: {
            entry: { base: 65000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 100000000, vesting: "4 years" }, signOn: 20000000 },
            junior: { base: 80000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 100000000, vesting: "4 years" } },
            senior: { base: 120000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 200000000, vesting: "4 years" } },
            lead: { base: 180000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 300000000, vesting: "4 years" } },
            executive: { base: 300000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 500000000, vesting: "4 years" } },
        },
        workLife: {
            weeklyHours: { contract: 40, real: 50 },
            vacation: { days: 25, usageRate: 90 },
            remoteWork: { policy: "office", description: "오피스 퍼스트 (전원 출근)" },
        },
        benefits: [
            { category: "lifestyle", title: "식대/간식 무제한", description: "법인카드 식대 전액 지원", value: 6000000 },
            { category: "financial", title: "주택자금 대출", description: "1억 무이자 대출", value: 5000000 },
            { category: "lifestyle", title: "통신비 지원", description: "월 10만원 지원", value: 1200000 },
        ],
        culture: {
            score: 8.2,
            keywords: ["몰입", "자율", "책임"],
            pros: ["업계 최고 대우 (사이닝, 스톡)", "최고의 동료들", "식대 무제한 등 실질적 복지"],
            cons: ["높은 업무 강도 (워라밸 부족)", "오피스 출근 필수", "치열한 생존 경쟁"],
        },
        lastUpdated: "2025-11-23",
    },
    // 7. Hyundai Motor
    {
        id: "hyundai",
        name: { ko: "현대자동차", en: "Hyundai Motor" },
        industry: "Automotive",
        tier: "conglomerate",
        logo: "🚙",
        description: "글로벌 Top 3 완성차 업체로 도약한 대한민국 자동차 산업의 심장입니다.",
        salary: {
            entry: { base: 55000000, incentive: { target: 30, max: 50, avgAmount: 20000000 }, signOn: 0 },
            junior: { base: 65000000, incentive: { target: 30, max: 50, avgAmount: 25000000 } },
            senior: { base: 85000000, incentive: { target: 30, max: 50, avgAmount: 35000000 } },
            lead: { base: 110000000, incentive: { target: 30, max: 50, avgAmount: 45000000 } },
            executive: { base: 200000000, incentive: { target: 50, max: 100, avgAmount: 100000000 } },
        },
        workLife: {
            weeklyHours: { contract: 40, real: 40 },
            vacation: { days: 20, usageRate: 95 },
            remoteWork: { policy: "hybrid", description: "주 1~2회 재택 권장" },
        },
        benefits: [
            { category: "lifestyle", title: "차량 할인", description: "최대 30% 자사 차량 할인 (근속별 상이)", value: 10000000 },
            { category: "lifestyle", title: "삼시세끼 제공", description: "사내 식당 무료", value: 3000000 },
        ],
        culture: {
            score: 8.8,
            keywords: ["안정", "변화", "워라밸"],
            pros: ["강력한 노조와 고용 안정성", "높은 성과급", "차량 할인 혜택"],
            cons: ["수직적인 군대 문화 (부서바부서)", "보수적인 의사결정"],
        },
        lastUpdated: "2025-11-23",
    },
    // 8. LG Energy Solution
    {
        id: "lgensol",
        name: { ko: "LG에너지솔루션", en: "LG Energy Solution" },
        industry: "Battery",
        tier: "conglomerate",
        logo: "🔋",
        description: "글로벌 배터리 시장을 선도하는 2차전지 분야의 세계적 기업입니다.",
        salary: {
            entry: { base: 53000000, incentive: { target: 20, max: 40, avgAmount: 15000000 }, signOn: 0 },
            junior: { base: 62000000, incentive: { target: 20, max: 40, avgAmount: 18000000 } },
            senior: { base: 82000000, incentive: { target: 20, max: 40, avgAmount: 25000000 } },
            lead: { base: 105000000, incentive: { target: 20, max: 40, avgAmount: 35000000 } },
            executive: { base: 190000000, incentive: { target: 40, max: 80, avgAmount: 80000000 } },
        },
        workLife: {
            weeklyHours: { contract: 40, real: 42 },
            vacation: { days: 20, usageRate: 90 },
            remoteWork: { policy: "hybrid", description: "원격 근무 활성화" },
        },
        benefits: [
            { category: "financial", title: "복지 포인트", description: "연 200만원 지급", value: 2000000 },
            { category: "health", title: "의료비 지원", description: "본인/가족 실비 지원", value: 1000000 },
        ],
        culture: {
            score: 8.3,
            keywords: ["성장", "글로벌", "인화"],
            pros: ["폭발적인 산업 성장성", "LG 특유의 인화 문화", "높은 성과급 기대감"],
            cons: ["오창/대전 등 지방 근무 가능성", "급격한 성장에 따른 성장통"],
        },
        lastUpdated: "2025-11-23",
    },
];
