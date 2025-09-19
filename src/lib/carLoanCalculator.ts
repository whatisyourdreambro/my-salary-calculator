// src/lib/carLoanCalculator.ts

export interface CarLoanInput {
  annualSalary: number;
  loanTerm: number; // in years
  interestRate: number; // annual percentage
}

export interface RecommendedCar {
  grade: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface CarLoanResult {
  recommendedCars: RecommendedCar[];
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

const carTiers: RecommendedCar[] = [
  {
    grade: "사회초년생 추천",
    price: 25000000,
    description: "경차 및 소형 SUV (캐스퍼, 아반떼 등)",
    imageUrl: "https://placehold.co/600x400/007FFF/white?text=Avante",
  },
  {
    grade: "합리적인 선택",
    price: 45000000,
    description: "중형 세단 및 SUV (쏘나타, 쏘렌토 등)",
    imageUrl: "https://placehold.co/600x400/495057/white?text=Sorento",
  },
  {
    grade: "성공의 증표",
    price: 70000000,
    description:
      "준대형 세단 및 수입차 (그랜저, 제네시스 G80, 벤츠 E클래스 등)",
    imageUrl: "https://placehold.co/600x400/212529/white?text=Genesis+G80",
  },
  {
    grade: "드림카",
    price: 120000000,
    description: "고급 수입차 및 스포츠카 (포르쉐 등)",
    imageUrl: "https://placehold.co/600x400/DA012D/white?text=Porsche",
  },
];

export function calculateCarLoan(
  carPrice: number,
  input: CarLoanInput
): Omit<CarLoanResult, "recommendedCars"> {
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

export function recommendCarsBySalary(annualSalary: number): RecommendedCar[] {
  // 연봉의 0.8배 ~ 1.2배 사이의 차량을 추천
  const recommendedPriceMin = annualSalary * 0.8;
  const recommendedPriceMax = annualSalary * 1.2;

  return carTiers.filter(
    (car) =>
      car.price >= recommendedPriceMin && car.price <= recommendedPriceMax
  );
}
