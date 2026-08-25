// src/config/popularCompanies.ts
//
// 인기 회사 연봉 링크 단일 소스 — 푸터 "인기 회사 연봉" 섹션이 소비.
// GSC TOP 검색 키워드 보유 회사 — 검색 권위 전역 분산, Sitelinks 노출 유도.
// 회사 추가/교체는 이 파일 1곳만 수정.
import { companyCountKo } from "./site";

export type PopularCompanyLink = { name: string; href: string };

export const popularCompanies: PopularCompanyLink[] = [
  { name: "삼성전자 연봉", href: "/salary-db/samsung-electronics" },
  { name: "SK하이닉스 연봉", href: "/salary-db/sk-hynix" },
  { name: "HMM 연봉", href: "/salary-db/hmm" },
  { name: "SK AX 연봉", href: "/salary-db/sk-cc" },
  { name: "HD현대중공업 연봉", href: "/salary-db/hd-hyundai-heavy" },
  { name: "LG에너지솔루션 연봉", href: "/salary-db/lgensol" },
  { name: "DL이앤씨 연봉", href: "/salary-db/dl-enc" },
  { name: `전체 회사 ${companyCountKo} →`, href: "/salary-db" },
];
