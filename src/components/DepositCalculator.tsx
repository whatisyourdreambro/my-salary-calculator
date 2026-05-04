// src/components/DepositCalculator.tsx
//
// re-export shim — 실제 구현은 src/components/calculators/DepositCalculator.tsx.
// 기존 import 경로 호환성을 위해 유지. 향후 모든 import를
// @/components/calculators/DepositCalculator로 마이그레이션 완료 시 이 파일 제거 가능.

export { default } from "./calculators/DepositCalculator";
