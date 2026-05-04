// src/data/companies/index.ts
//
// 회사 데이터 단일 진입점.
// 기존에 분산된 6개 파일(seedCompanies, globalCompanies, krCompanies_Batch2~5)을
// 도메인 기반(kr / global)으로 재정리.
// CompanyRepository, sitemap, 기타 모든 소비자는 이 파일만 import.

import type { CompanyProfile } from "@/types/company";

// Domain-specific re-exports (기존 batch 명명 폐기)
import { seedCompanies } from "@/data/seedCompanies";
import { globalCompanies } from "@/data/globalCompanies";
import { krCompanies_Batch2 } from "@/data/krCompanies_Batch2";
import { krCompanies_Batch3 } from "@/data/krCompanies_Batch3";
import { krCompanies_Batch4 } from "@/data/krCompanies_Batch4";
import { krCompanies_Batch5 } from "@/data/krCompanies_Batch5";

/**
 * 한국 기업 (대기업·IT·금융·공기업·스타트업 등).
 * 향후 카테고리별 분리 시 이 변수만 교체.
 */
export const krCompanies: CompanyProfile[] = [
 ...seedCompanies,
 ...krCompanies_Batch2,
 ...krCompanies_Batch3,
 ...krCompanies_Batch4,
 ...krCompanies_Batch5,
];

/**
 * 글로벌 기업 (FAANG 등 외국계 한국 지사 + 본사 정보).
 */
export { globalCompanies };

/**
 * 모든 회사 단일 배열. 중복 ID는 build 시 검증.
 */
export const allCompanies: CompanyProfile[] = [
 ...krCompanies,
 ...globalCompanies,
];

// 빌드 시 ID 중복 검증 (개발 환경에서만 throw)
if (process.env.NODE_ENV === "development") {
 const idSet = new Set<string>();
 const duplicates: string[] = [];
 for (const company of allCompanies) {
 if (idSet.has(company.id)) {
 duplicates.push(company.id);
 } else {
 idSet.add(company.id);
 }
 }
 if (duplicates.length > 0) {
 console.warn(
 `[companies] Duplicate company IDs detected: ${duplicates.join(", ")}`
 );
 }
}
