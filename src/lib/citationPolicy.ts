// src/lib/citationPolicy.ts
//
// 사이트 데이터 인용 정책 URL — schema.org Dataset.license 정본 (가벼운 상수만, 클라 import 안전).
// 정책 본문은 /insights 의 인용 정책 섹션("출처 표기 시 자유 인용").
// CC BY 등 외부 표준 라이선스 채택은 운영자 결정 항목(승인 I) — 여기서 선언하지 않는다.
//
// 적용 범위:
//  - /insights 리포트 3편 Dataset·CSV/JSON (기존, reportDatasetMeta 경유)
//  - 회사 페이지(/salary-db/[id])·실수령액 표(/table/*) Dataset — 승인 A23(PROD-14, 2026-09-25)
//    GSC Dataset 보고서 "'license' 입력란이 누락되었습니다" 경고 해소.
//  - DART 원자료 파생 lite·랭킹 Dataset 에는 넣지 않는다 (META-11 — 사이트 소유가 아닌 원자료).

const SITE_URL = "https://www.moneysalary.com";

export const CITATION_POLICY_PATH = "/insights#citation-policy";
export const CITATION_POLICY_URL = `${SITE_URL}${CITATION_POLICY_PATH}`;
