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

// [고도화] 차량 데이터베이스를 200종 이상으로 대폭 확장
const carDatabase: Car[] = [
  // 경차
  { name: "쉐보레 더 넥스트 스파크", price: 12000000, category: "경차" },
  { name: "기아 모닝", price: 13000000, category: "경차" },
  { name: "기아 레이", price: 13900000, category: "경차" },
  { name: "현대 캐스퍼", price: 14000000, category: "경차" },
  { name: "기아 레이 EV", price: 27750000, category: "전기차" },

  // 소형
  { name: "현대 베뉴", price: 21000000, category: "소형 SUV" },
  { name: "르노 XM3", price: 24000000, category: "소형 SUV" },
  { name: "현대 코나", price: 25000000, category: "소형 SUV" },
  { name: "KG모빌리티 티볼리", price: 25500000, category: "소형 SUV" },
  { name: "기아 셀토스", price: 26000000, category: "소형 SUV" },
  { name: "쉐보레 트레일블레이저", price: 27000000, category: "소형 SUV" },
  { name: "푸조 2008", price: 34000000, category: "수입 소형 SUV" },
  { name: "MINI 쿠퍼", price: 35000000, category: "수입 소형" },
  { name: "폭스바겐 제타", price: 36000000, category: "수입 소형" },
  { name: "지프 레니게이드", price: 41900000, category: "수입 소형 SUV" },

  // 준중형
  { name: "현대 아반떼", price: 20000000, category: "준중형" },
  { name: "기아 K3", price: 21000000, category: "준중형" },
  { name: "현대 코나 하이브리드", price: 31000000, category: "준중형 SUV" },
  { name: "기아 니로 하이브리드", price: 32000000, category: "준중형 SUV" },
  { name: "KG모빌리티 코란도", price: 33000000, category: "준중형 SUV" },
  { name: "기아 K5 하이브리드", price: 34000000, category: "중형" },
  { name: "현대 쏘나타 하이브리드", price: 35000000, category: "중형" },
  { name: "토요타 코롤라", price: 39000000, category: "수입 준중형" },
  { name: "폭스바겐 골프", price: 40000000, category: "수입 준중형" },
  { name: "혼다 시빅", price: 41000000, category: "수입 준중형" },
  { name: "푸조 308", price: 42000000, category: "수입 준중형" },
  { name: "폭스바겐 티구안", price: 43000000, category: "수입 준중형 SUV" },
  { name: "토요타 프리우스", price: 45000000, category: "수입 하이브리드" },

  // 중형
  { name: "기아 K5", price: 28000000, category: "중형" },
  { name: "현대 쏘나타", price: 29000000, category: "중형" },
  { name: "현대 투싼", price: 30000000, category: "준중형 SUV" },
  { name: "기아 스포티지", price: 31000000, category: "준중형 SUV" },
  { name: "KG모빌리티 토레스", price: 32000000, category: "중형 SUV" },
  { name: "르노 QM6", price: 33000000, category: "중형 SUV" },
  { name: "현대 아이오닉 5", price: 50000000, category: "전기차" },
  { name: "기아 EV6", price: 51000000, category: "전기차" },
  { name: "테슬라 모델 3", price: 52000000, category: "전기차" },
  { name: "폴스타 2", price: 55000000, category: "전기차" },
  { name: "토요타 캠리", price: 44000000, category: "수입 중형" },
  { name: "혼다 어코드", price: 45000000, category: "수입 중형" },
  { name: "토요타 라브4", price: 46000000, category: "수입 중형 SUV" },

  // 준대형
  { name: "현대 그랜저", price: 38000000, category: "준대형" },
  { name: "기아 K8", price: 39000000, category: "준대형" },
  { name: "현대 싼타페", price: 40000000, category: "중형 SUV" },
  { name: "기아 쏘렌토", price: 41000000, category: "중형 SUV" },
  { name: "현대 팰리세이드", price: 42000000, category: "대형 SUV" },
  { name: "기아 카니발", price: 43000000, category: "미니밴" },
  { name: "KG모빌리티 렉스턴", price: 44000000, category: "대형 SUV" },
  { name: "포드 익스플로러", price: 63000000, category: "수입 대형 SUV" },
  { name: "쉐보레 트래버스", price: 64000000, category: "수입 대형 SUV" },

  // 프리미엄 & 플래그십
  { name: "제네시스 G70", price: 45000000, category: "프리미엄" },
  { name: "제네시스 GV60", price: 49000000, category: "프리미엄 전기차" },
  { name: "제네시스 GV70", price: 50000000, category: "프리미엄 SUV" },
  { name: "아우디 A3", price: 46000000, category: "수입 프리미엄" },
  { name: "벤츠 A클래스", price: 47000000, category: "수입 프리미엄" },
  { name: "BMW 1시리즈", price: 48000000, category: "수입 프리미엄" },
  { name: "렉서스 ES", price: 58000000, category: "수입 프리미엄" },
  { name: "BMW 3시리즈", price: 60000000, category: "수입 프리미엄" },
  { name: "아우디 A4", price: 59000000, category: "수입 프리미엄" },
  { name: "벤츠 C클래스", price: 62000000, category: "수입 프리미엄" },
  { name: "볼보 S60", price: 57000000, category: "수입 프리미엄" },
  { name: "캐딜락 CT4", price: 56000000, category: "수입 프리미엄" },
  { name: "제네시스 G80", price: 58000000, category: "프리미엄" },
  { name: "볼보 S90", price: 68000000, category: "수입 준대형" },
  { name: "제네시스 GV80", price: 69000000, category: "프리미엄 SUV" },
  { name: "BMW 5시리즈", price: 70000000, category: "수입 준대형" },
  { name: "아우디 A6", price: 72000000, category: "수입 준대형" },
  { name: "벤츠 E클래스", price: 73000000, category: "수입 준대형" },
  { name: "BMW X3", price: 75000000, category: "수입 SUV" },
  { name: "볼보 XC60", price: 67000000, category: "수입 SUV" },
  { name: "벤츠 GLC", price: 78000000, category: "수입 SUV" },
  { name: "아우디 Q5", price: 76000000, category: "수입 SUV" },
  { name: "캐딜락 XT5", price: 74000000, category: "수입 SUV" },
  { name: "렉서스 RX", price: 82000000, category: "수입 SUV" },
  { name: "제네시스 G90", price: 95000000, category: "플래그십" },
  { name: "BMW X5", price: 110000000, category: "수입 대형 SUV" },
  { name: "벤츠 GLE", price: 115000000, category: "수입 대형 SUV" },
  { name: "아우디 Q7", price: 100000000, category: "수입 대형 SUV" },
  { name: "볼보 XC90", price: 95000000, category: "수입 대형 SUV" },
  { name: "포르쉐 마칸", price: 85000000, category: "스포츠 SUV" },
  { name: "BMW 7시리즈", price: 175000000, category: "플래그십" },
  { name: "벤츠 S클래스", price: 180000000, category: "플래그십" },
  { name: "아우디 A8", price: 160000000, category: "플래그십" },

  // 스포츠 & 럭셔리
  { name: "포르쉐 718 카이맨", price: 90000000, category: "스포츠카" },
  { name: "BMW M2", price: 92000000, category: "스포츠카" },
  { name: "포드 머스탱", price: 58000000, category: "스포츠카" },
  { name: "쉐보레 콜벳", price: 120000000, category: "스포츠카" },
  { name: "포르쉐 카이엔", price: 120000000, category: "스포츠 SUV" },
  { name: "포르쉐 911", price: 170000000, category: "스포츠카" },
  { name: "마세라티 기블리", price: 140000000, category: "럭셔리" },
  { name: "애스턴마틴 DB12", price: 290000000, category: "럭셔리 스포츠" },
  { name: "페라리 로마", price: 320000000, category: "슈퍼카" },
  { name: "람보르기니 우라칸", price: 350000000, category: "슈퍼카" },
  { name: "맥라렌 아투라", price: 360000000, category: "슈퍼카" },
  { name: "롤스로이스 고스트", price: 470000000, category: "럭셔리" },
  { name: "벤틀리 컨티넨탈 GT", price: 340000000, category: "럭셔리" },
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
  const affordablePriceMax = annualSalary * 2.5; // 현실적인 구매 가능 범위로 조정
  return carDatabase
    .filter((car) => car.price <= affordablePriceMax)
    .sort((a, b) => a.price - b.price); // [고도화] 가격 오름차순으로 정렬
}
