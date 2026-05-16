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
import { krCompanies_Batch6 } from "@/data/krCompanies_Batch6";
import { krCompanies_Batch7 } from "@/data/krCompanies_Batch7";
import { krCompanies_Batch8 } from "@/data/krCompanies_Batch8";
import { krCompanies_Batch9 } from "@/data/krCompanies_Batch9";
import { krCompanies_Batch10 } from "@/data/krCompanies_Batch10";
import { krCompanies_Batch11 } from "@/data/krCompanies_Batch11";
import { krCompanies_Batch12 } from "@/data/krCompanies_Batch12";
import { krCompanies_Batch13 } from "@/data/krCompanies_Batch13";
import { krCompanies_Batch14 } from "@/data/krCompanies_Batch14";
import { krCompanies_Batch15 } from "@/data/krCompanies_Batch15";
import { krCompanies_Batch16 } from "@/data/krCompanies_Batch16";
import { krCompanies_Batch17 } from "@/data/krCompanies_Batch17";
import { krCompanies_Batch18 } from "@/data/krCompanies_Batch18";
import { krCompanies_Batch19 } from "@/data/krCompanies_Batch19";
import { krCompanies_Batch20 } from "@/data/krCompanies_Batch20";
import { krCompanies_Batch21 } from "@/data/krCompanies_Batch21";
import { krCompanies_Batch22 } from "@/data/krCompanies_Batch22";
import { krCompanies_Batch23 } from "@/data/krCompanies_Batch23";
import { krCompanies_Batch24 } from "@/data/krCompanies_Batch24";
import { krCompanies_Batch25 } from "@/data/krCompanies_Batch25";
import { krCompanies_Batch26 } from "@/data/krCompanies_Batch26";
import { krCompanies_Batch27 } from "@/data/krCompanies_Batch27";
import { krCompanies_Batch28 } from "@/data/krCompanies_Batch28";

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
 ...krCompanies_Batch6,
 ...krCompanies_Batch7,
 ...krCompanies_Batch8,
 ...krCompanies_Batch9,
 ...krCompanies_Batch10,
 ...krCompanies_Batch11,
 ...krCompanies_Batch12,
 ...krCompanies_Batch13,
 ...krCompanies_Batch14,
 ...krCompanies_Batch15,
 ...krCompanies_Batch16,
 ...krCompanies_Batch17,
 ...krCompanies_Batch18,
 ...krCompanies_Batch19,
 ...krCompanies_Batch20,
 ...krCompanies_Batch21,
 ...krCompanies_Batch22,
 ...krCompanies_Batch23,
 ...krCompanies_Batch24,
 ...krCompanies_Batch25,
 ...krCompanies_Batch26,
 ...krCompanies_Batch27,
 ...krCompanies_Batch28,
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
