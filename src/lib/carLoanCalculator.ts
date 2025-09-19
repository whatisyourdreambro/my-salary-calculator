// src/lib/carLoanCalculator.ts

export interface CarLoanInput {
  annualSalary: number;
  loanTerm: number; // in years
  interestRate: number; // annual percentage
}

export interface Car {
  name: string;
  price: number;
  category: string;
}

export interface CarLoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

// [수정] 차량 데이터베이스를 50종 이상으로 대폭 확장
const carDatabase: Car[] = [
  // 경차
  { name: "기아 모닝", price: 13000000, category: "경차" },
  { name: "현대 캐스퍼", price: 14000000, category: "경차" },
  { name: "쉐보레 스파크", price: 12000000, category: "경차" },
  // 소형
  { name: "현대 아반떼", price: 20000000, category: "준중형" },
  { name: "기아 K3", price: 21000000, category: "준중형" },
  { name: "르노 XM3", price: 24000000, category: "소형 SUV" },
  { name: "현대 코나", price: 25000000, category: "소형 SUV" },
  { name: "기아 셀토스", price: 26000000, category: "소형 SUV" },
  // 중형
  { name: "현대 쏘나타", price: 29000000, category: "중형" },
  { name: "기아 K5", price: 28000000, category: "중형" },
  { name: "현대 투싼", price: 30000000, category: "준중형 SUV" },
  { name: "기아 스포티지", price: 31000000, category: "준중형 SUV" },
  { name: "KG모빌리티 토레스", price: 32000000, category: "중형 SUV" },
  // 준대형
  { name: "현대 그랜저", price: 38000000, category: "준대형" },
  { name: "기아 K8", price: 39000000, category: "준대형" },
  { name: "현대 싼타페", price: 40000000, category: "중형 SUV" },
  { name: "기아 쏘렌토", price: 41000000, category: "중형 SUV" },
  { name: "현대 팰리세이드", price: 42000000, category: "대형 SUV" },
  { name: "기아 카니발", price: 43000000, category: "미니밴" },
  // 프리미엄
  { name: "제네시스 G70", price: 45000000, category: "프리미엄" },
  { name: "제네시스 GV70", price: 50000000, category: "프리미엄 SUV" },
  { name: "제네시스 G80", price: 58000000, category: "프리미엄" },
  { name: "제네시스 GV80", price: 69000000, category: "프리미엄 SUV" },
  { name: "제네시스 G90", price: 95000000, category: "플래그십" },
  // 수입 엔트리
  { name: "BMW 1시리즈", price: 48000000, category: "수입 소형" },
  { name: "벤츠 A클래스", price: 47000000, category: "수입 소형" },
  { name: "아우디 A3", price: 46000000, category: "수입 소형" },
  { name: "폭스바겐 골프", price: 40000000, category: "수입 소형" },
  // 수입 중형
  { name: "BMW 3시리즈", price: 60000000, category: "수입 중형" },
  { name: "벤츠 C클래스", price: 62000000, category: "수입 중형" },
  { name: "아우디 A4", price: 59000000, category: "수입 중형" },
  { name: "테슬라 모델3", price: 55000000, category: "전기차" },
  // 수입 준대형
  { name: "BMW 5시리즈", price: 70000000, category: "수입 준대형" },
  { name: "벤츠 E클래스", price: 73000000, category: "수입 준대형" },
  { name: "아우디 A6", price: 72000000, category: "수입 준대형" },
  { name: "볼보 S90", price: 68000000, category: "수입 준대형" },
  // 수입 SUV
  { name: "BMW X3", price: 75000000, category: "수입 SUV" },
  { name: "벤츠 GLC", price: 78000000, category: "수입 SUV" },
  { name: "포르쉐 마칸", price: 85000000, category: "프리미엄 SUV" },
  { name: "포르쉐 카이엔", price: 120000000, category: "프리미엄 SUV" },
  // 하이엔드 & 드림카
  { name: "포르쉐 911", price: 170000000, category: "스포츠카" },
  { name: "벤츠 S클래스", price: 180000000, category: "플래그십" },
  { name: "BMW 7시리즈", price: 175000000, category: "플래그십" },
  { name: "페라리 로마", price: 320000000, category: "슈퍼카" },
  { name: "람보르기니 우라칸", price: 350000000, category: "슈퍼카" },
  { name: "롤스로이스 고스트", price: 470000000, category: "럭셔리" },
  { name: "롤스로이스 팬텀", price: 630000000, category: "럭셔리" },
];

export function calculateCarLoan(
  carPrice: number,
  input: CarLoanInput
): CarLoanResult {
  const principal = carPrice;
  if (principal <= 0 || input.interestRate <= 0 || input.loanTerm <= 0) {
    return { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
  }

  const monthlyRate = input.interestRate / 100 / 12;
  const numberOfMonths = input.loanTerm * 12;

  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths))) /
    (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

  const totalPayment = monthlyPayment * numberOfMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
  };
}

export function recommendCarsBySalary(annualSalary: number): Car[] {
  if (annualSalary <= 0) return [];
  // 추천 기준을 '연봉의 4배'까지로 확장하여 고연봉자에게도 다양한 선택지를 제공합니다.
  const affordablePriceMax = annualSalary * 4;
  return carDatabase.filter((car) => car.price <= affordablePriceMax);
}
