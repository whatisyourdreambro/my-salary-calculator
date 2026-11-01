// src/lib/editorialTrust.ts
//
// 핵심 페이지의 '만든 사람과 확인 방법' 상자 내용 (G4, 운영자 승인 2026-11-01 구글 개선 5번 — 돈·세금(YMYL) 신뢰 신호).
// 화면은 src/components/EditorialTrustNote.tsx 하나가 모든 페이지에서 같은 모양으로 그리고, 이 파일은 경로별 내용만 둔다.
//  - 작성자: /about '운영자 소개'와 같은 사실(현직 직장인 1인이 운영)만 쓴다. 실명은 절대 넣지 않는다(운영자 겸직 규정).
//  - sources: 그 페이지가 화면에 실제로 인용하는 출처만 적는다. 언론 보도가 섞인 페이지(성과급 계산기)는 official=false —
//    '공식 자료'라고 쓰지 않고 '공개 자료'·'자료 대조일'로 표기한다(두 페이지 모두 '회사 공식 자료가 아닙니다' 고지).
//  - checkedOn: 위 자료와 마지막으로 대조한 날. 이미 있는 날짜(화면 수정일·PublishedMeta·데이터 상수·Dataset dateModified,
//    그것도 없으면 내용 검토 원장 contentDate)에서만 가져온다. 새 날짜를 만들지 않고, 믿을 근거가 없으면 비운다(날짜 줄 없음).
//    링크·배치만 바뀐 날(10/19 링크 검토일 등)은 대조일이 아니다. 일자를 모르면 월(YYYY-MM)까지만 쓴다.
//    각 값이 출처 값과 같은지는 src/lib/__tests__/editorialTrustNote.test.ts 가 고정한다 — 페이지를 실질 수정해 출처 날짜가
//    바뀌면 그 테스트가 알려 준다(링크·배치·이 상자만 바뀐 경우에는 대조일을 올리지 않는다).
// ★이 모듈은 클라이언트 번들(calc·표·회사 layout 의 EditorialTrustNoteFromPath)에 실린다 — 상수만 두고 페이지 데이터 모듈은
//   import 하지 않는다(siteDates 는 상수만 있는 클라이언트 안전 모듈).
import { TAX_TABLE_EFFECTIVE_DATE } from "@/config/siteDates";

export interface EditorialTrustNoteContent {
  /** 대조한 자료 — 페이지가 화면에 인용하는 출처만 */
  sources: string;
  /** true: 법령·관계 기관·공시 등 공식 자료만 대조. false: 언론 보도 등 공개 자료가 섞임 */
  official: boolean;
  /** 마지막 대조일 YYYY-MM-DD(일자를 모르면 YYYY-MM). 근거가 없으면 생략 */
  checkedOn?: string;
  /** 대조 범위 밖 안내(선택) */
  note?: string;
}

/** /about 운영자 소개와 같은 사실만 — 실명 금지 */
export const EDITORIAL_TRUST_AUTHOR = "머니샐러리 편집팀(현직 직장인 1인 운영)";

/** 단일 페이지 — 키는 끝 슬래시 없는 경로 */
export const EDITORIAL_TRUST_PAGES: Readonly<Record<string, EditorialTrustNoteContent>> = {
  // A17(c95c183e, 2026-09-25): 홈 계산기가 쓰는 TaxLogic.calculateSalary2026 의 월 소득세를 간이세액표로 바꿔 다시 계산한 날.
  // 10/19 사이트맵 날짜는 링크 검토일이라 대조일이 아니다.
  "/": {
    sources: "국세청 근로소득 간이세액표, 4대보험 공단 요율 안내",
    official: true,
    checkedOn: TAX_TABLE_EFFECTIVE_DATE,
  },
  // 화면 '페이지 수정일'(page.tsx) — 2026-11-01 B28 이식 때 2026-10-07 보도 원문을 다시 확인(page.tsx 머리 주석).
  "/calc/samsung-bonus": {
    sources: "언론 보도 원문, 사업보고서",
    official: false,
    checkedOn: "2026-11-01",
  },
  // psData LAST_UPDATED(화면 '마지막 갱신') — 2026-11-01 B27, 10/28 회사 발표 3분기 실적 반영.
  "/calc/sk-hynix-bonus": {
    sources: "언론 보도, 사업보고서·실적 공시",
    official: false,
    checkedOn: "2026-11-01",
  },
  // 공제 한도표 근거 문단의 최신 기준일(YEAR_END_LIMITS_SOURCE_NOTE)·내용 검토 원장 contentDate — B24·B43 법령 대조.
  "/year-end-tax": {
    sources: "소득세법·조세특례제한법(국가법령정보센터), 국세청 연말정산 안내",
    official: true,
    checkedOn: "2026-11-01",
  },
  // 내용 검토 원장 contentDate — B30 이 개통일을 대한민국 정책브리핑의 국세청 발표로 확인한 날(이 페이지는 화면 날짜 필드 없음).
  "/year-end-tax-preview": {
    sources: "국세청 발표(대한민국 정책브리핑)",
    official: true,
    checkedOn: "2026-11-01",
  },
  // PublishedMeta updatedDate — 2027 장기요양 13.90%(2026-10-30 장기요양위원회 의결) 반영.
  "/social-insurance-rates-2027": {
    sources: "연금개혁법, 건정심·장기요양위원회 의결, 고용노동부 고시",
    official: true,
    checkedOn: "2026-11-01",
  },
  // PublishedMeta updatedDate — 실수령 참고치에 2027 장기요양 확정 비율 반영.
  "/minimum-wage-2027": {
    sources: "고용노동부 확정 고시, 최저임금위원회 의결",
    official: true,
    checkedOn: "2026-11-01",
  },
  // 화면 출처·근거의 '국민건강보험공단 피부양자 자격 안내 (2026년 8월 조회 기준)' — 일자 기록이 없어 월까지만.
  // 원장 contentDate 2026-10-17 은 간이 판정 범위를 밝힌 문구 수정일이라 대조일이 아니다.
  "/health-insurance-dependent": {
    sources: "국민건강보험법 시행규칙 별표 1의2, 국민건강보험공단 안내",
    official: true,
    checkedOn: "2026-08",
  },
  // metadata modifiedTime — 2026-11-01 R2-HOLD, 종부세법 제9조·농특세법 제5조 원문 대조.
  "/property-holding-tax-2026": {
    sources: "지방세법·종합부동산세법·농어촌특별세법",
    official: true,
    checkedOn: "2026-11-01",
  },
};

/** /table/2026/{annual,monthly,weekly,hourly} — 4개 표 Dataset dateModified(A17 간이세액표 재산출일)와 같은 날 */
export const EDITORIAL_TRUST_TABLE_2026: EditorialTrustNoteContent = {
  sources: "국세청 근로소득 간이세액표, 2026년 4대보험 요율",
  official: true,
  checkedOn: TAX_TABLE_EFFECTIVE_DATE,
};

/** /table/2027/{annual,monthly,weekly,hourly} — 4개 표 Dataset dateModified(2027 장기요양 확정 반영 재산출일)와 같은 날 */
export const EDITORIAL_TRUST_TABLE_2027: EditorialTrustNoteContent = {
  sources: "2027년 확정 요율 발표, 국세청 근로소득 간이세액표",
  official: true,
  checkedOn: "2026-11-01",
};

/** /salary-db/[id] 회사 페이지 — 회사마다 공시·데이터 날짜가 달라 하나의 대조일이 없다(상단 업데이트 배지가 회사별 데이터일).
 *  문구는 /about '회사 연봉 데이터는 어떻게 산출하나요?'와 같은 구분(공시 인용값 vs 자체 추정치).
 *  공시 부분은 '공시가 있는 회사는'으로 조건을 단다(2026-11-02 통합 수정) — 430개사 중 140곳은 공시 평균급여 카드가 없고
 *  (CompanyDisclosedSalary 는 disclosed 가 있을 때만 그린다), 보도 인용 2곳(meritz-fire·deloitte-anjin)은 DART 값도 없다.
 *  layout 은 params 가 없고 회사 데이터를 클라이언트에 싣지 않으므로 회사별로 문구를 가르지 않고 모든 회사에 맞는 한 문장을 쓴다. */
export const EDITORIAL_TRUST_COMPANY: EditorialTrustNoteContent = {
  sources: "공시가 있는 회사는 사업보고서 등 공시 원문(공시 평균급여), 실수령액은 국세청 근로소득 간이세액표",
  official: true,
  note: "직급별 연봉은 공개 자료를 종합한 자체 추정치입니다.",
};

const TABLE_PATH = /^\/table\/(2026|2027)\/(?:annual|monthly|weekly|hourly)$/;
const COMPANY_PATH = /^\/salary-db\/([^/]+)$/;
/** /salary-db/ 바로 아래의 회사 아닌 경로(인덱스형 페이지·비교 상위). 없는 회사 id 는 page 가 /salary-db 로 308 한다. */
const NOT_COMPANY = new Set(["listed", "ranking", "compare", "submit"]);

/** 경로(끝 슬래시 무시) → 상자 내용. 대상이 아니면 null */
export function editorialTrustNoteFor(pathname: string | null | undefined): EditorialTrustNoteContent | null {
  if (!pathname) return null;
  const path = pathname.replace(/\/+$/, "") || "/";
  if (Object.prototype.hasOwnProperty.call(EDITORIAL_TRUST_PAGES, path)) return EDITORIAL_TRUST_PAGES[path];
  const table = TABLE_PATH.exec(path);
  if (table) return table[1] === "2026" ? EDITORIAL_TRUST_TABLE_2026 : EDITORIAL_TRUST_TABLE_2027;
  const company = COMPANY_PATH.exec(path);
  if (company && !NOT_COMPANY.has(company[1])) return EDITORIAL_TRUST_COMPANY;
  return null;
}

/** "2026-11-01" → "2026.11.01", "2026-08" → "2026.08" (PublishedMeta 와 같은 표기). 형식이 아니면 null */
export function formatEditorialTrustDate(value: string): string | null {
  const match = /^(\d{4})-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/.exec(value);
  if (!match) return null;
  return match[3] ? `${match[1]}.${match[2]}.${match[3]}` : `${match[1]}.${match[2]}`;
}
