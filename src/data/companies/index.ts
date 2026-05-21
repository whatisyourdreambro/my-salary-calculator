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
import { krCompanies_Batch29 } from "@/data/krCompanies_Batch29";

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
 ...krCompanies_Batch29,
];

/**
 * 글로벌 기업 (FAANG 등 외국계 한국 지사 + 본사 정보).
 */
export { globalCompanies };

/**
 * 회사 목록에서 중복을 자동 제거한다.
 * - 같은 id가 두 번 등장하면 첫 번째만 유지 → 정적 라우트 중복 방지.
 * - id는 다르지만 한글 회사명이 같으면 첫 번째만 유지 → 같은 회사가
 *   두 URL로 생성돼 검색 순위가 분산되는 문제 방지.
 * 데이터 파일을 직접 손대지 않아도 로드 시점에 일관성이 보장된다.
 */
function dedupeCompanies(companies: CompanyProfile[]): CompanyProfile[] {
 const seenId = new Set<string>();
 const seenName = new Set<string>();
 const unique: CompanyProfile[] = [];
 const removed: string[] = [];

 for (const company of companies) {
 const nameKey = company.name.ko.trim();
 if (seenId.has(company.id) || seenName.has(nameKey)) {
 removed.push(`${company.id}(${nameKey})`);
 continue;
 }
 seenId.add(company.id);
 seenName.add(nameKey);
 unique.push(company);
 }

 if (process.env.NODE_ENV === "development" && removed.length > 0) {
 console.warn(
 `[companies] 중복 회사 ${removed.length}건 자동 제거: ${removed.join(", ")}`
 );
 }

 return unique;
}

/**
 * 모든 회사 단일 배열 (id·한글명 기준 중복 제거 완료).
 */
export const allCompanies: CompanyProfile[] = dedupeCompanies([
 ...krCompanies,
 ...globalCompanies,
]);
