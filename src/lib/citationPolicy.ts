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
//  - 봉급표 5쪽(/civil-servant-pay-2026·/police-pay-2026·/firefighter-pay-2026·/military-pay-2026·/teacher-pay-2026)
//    Dataset — G3(2026-11-01 운영자 승인 '구글 개선' 4번: GSC Dataset 'license' 누락 경고 1건 대응 — 경고가 난 페이지 자체는
//    콘솔 예시로 아직 확인하지 않았다). 공무원보수규정 별표(대통령령 — 저작권법 제7조 보호 대상 아님)를 사이트가 정리한 표이고,
//    경찰·소방·군인·교원 4쪽은 화면 인용 복사 상자가 이미 '출처 표기 시 자유 인용'을 안내한다.
//  - DART 원자료 파생 lite·랭킹 Dataset 에는 넣지 않는다 (META-11 — 사이트 소유가 아닌 원자료).
//  - /calc/bonus-home-plan Dataset(한국부동산원 R-ONE 중위가격 — 제공 기관 자체 이용 조건이 있는 통계)도 같은 이유로 넣지 않는다.
//    citation 이 원 출처를 가리킨다. 넣으려면 운영자 결정(META-11 과 같은 판단)이 먼저다.

const SITE_URL = "https://www.moneysalary.com";

export const CITATION_POLICY_PATH = "/insights#citation-policy";
export const CITATION_POLICY_URL = `${SITE_URL}${CITATION_POLICY_PATH}`;
