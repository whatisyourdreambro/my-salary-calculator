// src/components/LoanCalculator.tsx
//
// re-export shim — 실제 구현은 src/components/calculators/LoanCalculator.tsx.
// 기존 import 경로 호환성을 위해 유지. 신버전은 recharts 기반 차트 + 다중
// 상환 방식(원리금균등·원금균등·만기일시) 지원으로 더 풍부한 UI 제공.

export { default } from "./calculators/LoanCalculator";
