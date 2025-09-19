// src/lib/carLoanCalculator.ts

export interface CarLoanInput {
  annualSalary: number;
  loanTerm: number; // in years
  interestRate: number; // annual percentage
}

// [수정] 기존 RecommendedCar 인터페이스를 Car로 변경하고, 개별 차량 정보를 담도록 구조 변경
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

// [수정] 차량 데이터를 등급이 아닌 개별 차량 데이터베이스로 확장
const carDatabase: Car[] = [
  { name: "기아 모닝", price: 13000000, category: "경차" },
  { name: "현대 캐스퍼", price: 14000000, category: "경차" },
  { name: "현대 아반떼", price: 20000000, category: "준중형" },
  { name: "기아 K3", price: 21000000, category: "준중형" },
  { name: "KG모빌리티 티볼리", price: 22000000, category: "소형 SUV" },
  { name: "현대 코나", price: 25000000, category: "소형 SUV" },
  { name: "기아 셀토스", price: 26000000, category: "소형 SUV" },
  { name: "현대 쏘나타", price: 29000000, category: "중형" },
  { name: "기아 K5", price: 28000000, category: "중형" },
  { name: "현대 투싼", price: 30000000, category: "준중형 SUV" },
  { name: "기아 스포티지", price: 31000000, category: "준중형 SUV" },
  { name: "현대 그랜저", price: 38000000, category: "준대형" },
  { name: "기아 K8", price: 39000000, category: "준대형" },
  { name: "현대 싼타페", price: 40000000, category: "중형 SUV" },
  { name: "기아 쏘렌토", price: 41000000, category: "중형 SUV" },
  { name: "제네시스 G70", price: 45000000, category: "프리미엄" },
  { name: "제네시스 GV70", price: 50000000, category: "프리미엄 SUV" },
  { name: "제네시스 G80", price: 58000000, category: "프리미엄" },
  { name: "BMW 3시리즈", price: 60000000, category: "수입" },
  { name: "벤츠 C클래스", price: 62000000, category: "수입" },
  { name: "BMW 5시리즈", price: 70000000, category: "수입" },
  { name: "벤츠 E클래스", price: 73000000, category: "수입" },
  { name: "제네시스 G90", price: 95000000, category: "플래그십" },
  { name: "포르쉐 카이엔", price: 120000000, category: "드림카" },
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

// [수정] 추천 로직을 '연봉의 1.2배 이하 모든 차량'으로 변경하여 '데드존' 문제 해결
export function recommendCarsBySalary(annualSalary: number): Car[] {
  if (annualSalary <= 0) return [];
  const affordablePriceMax = annualSalary * 1.2;
  return carDatabase.filter((car) => car.price <= affordablePriceMax);
}
