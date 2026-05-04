// src/lib/simpleCalculators/types.ts

export interface CalculatorField {
 /** 입력 필드 식별자 (compute 함수의 input 키) */
 name: string;
 /** 사용자에게 보여지는 라벨 */
 label: string;
 /** 초기값 */
 defaultValue: number;
 /** 단위 표기 (예: "원", "%", "년") */
 suffix?: string;
 /** 입력 단계 (slider step) */
 step?: number;
 /** 최소값 */
 min?: number;
 /** 최대값 */
 max?: number;
 /** 도움말 텍스트 */
 hint?: string;
}

export interface CalculatorResult {
 /** 핵심 결과 (강조 표시) */
 primary: { label: string; value: number; suffix?: string };
 /** 추가 결과 (작게 표시) */
 secondary?: Array<{ label: string; value: number; suffix?: string }>;
 /** 결과 해석/조언 */
 note?: string;
}

export interface CalculatorFaq {
 q: string;
 a: string;
}

export interface CalculatorDef {
 slug: string;
 title: string;
 description: string;
 category:
 | "tax"
 | "salary"
 | "loan"
 | "real-estate"
 | "investment"
 | "insurance"
 | "business"
 | "life"
 | "health"
 | "family"
 | "career"
 | "currency";
 categoryLabel: string;
 keywords: string[];
 fields: CalculatorField[];
 compute: (inputs: Record<string, number>) => CalculatorResult;
 /** 결과 하단에 표시될 추가 설명 (선택) */
 explanation?: string;
 /** 계산 공식 (예: "산출세액 = 과세표준 × 세율 - 누진공제") */
 formula?: string;
 /** 자주 묻는 질문 (FAQPage Schema.org 자동 노출) */
 faqs?: CalculatorFaq[];
 /** 유의사항·주의 (불릿 리스트) */
 caveats?: string[];
 /** 관련 계산기 슬러그 (3~5개 권장) */
 relatedSlugs?: string[];
}
