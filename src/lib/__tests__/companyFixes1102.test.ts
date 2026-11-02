// 메리츠화재 공시 카드 출처 정정 고정 (2026-11-02, 운영자 승인 15번 '권장대로' — 원문 재확인 후 원문 값 사용)
//
// 카드 값 1억4,397만원은 DART 2025 사업보고서(rcpNo 20260331003916) VIII-1 '2.직원 등 현황' 합 계 행 1인평균 143,965천원
// 그대로다(세계일보 2026-04-02 보도 값이 바로 이 행). 바뀐 것: 출처(보도 인용 -> DART 원문, 라벨 '보도:' -> 같은 폭 '원문:'),
// note(2024 사업보고서 합계 1억3,876만원), 확인 방법 상자(보도 인용뿐인 회사 집합에서 빠짐), 메타 동결(DISCLOSED_CORRECTION_HOLD_IDS).
// GuideMidAd 위 카드는 짧아지기만 한다 — 글자 종류(한글·숫자·라틴·그 밖)마다 종전 이하(cfa4c670c db-insurance 와 같은 규칙).
// 짧아져도 GuideMidAd 가 올라갈 수 있어 배포 전 격리 QA 서버·가드 러너의 1,123폭 실측 스윕 대상이다.
// 두 번째 describe: 임베드 위젯(dartInjection)도 같은 원문 합계 행으로 맞춘 별도 커밋(삼성전자 fa8131c1f 방식, 날짜 불변) —
// 운영자가 카드만 원하면 그 커밋과 그 describe 만 뺀다(첫 describe 는 위젯 값에 기대지 않는다).
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));

import preGateSnapshot from "./fixtures/companyPreGate-bd68d860.json";
import { allCompanies } from "@/data/companies";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

/** 사이트 글꼴 서브셋 6종의 unicode-range 합집합 — 새 문구에 서브셋 밖 글자가 없어야 한다 */
function siteFontCodepoints(): Set<number> {
  const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
  const set = new Set<number>();
  for (const range of source.matchAll(/prop: "unicode-range", value: "([^"]+)"/g)) {
    for (const part of range[1].split(",")) {
      const [first, last = first] = part.trim().slice(2).split("-").map((v) => parseInt(v, 16));
      for (let code = first; code <= last; code++) set.add(code);
    }
  }
  return set;
}
const FONT = siteFontCodepoints();
const outsideFont = (text: string) =>
  [...new Set([...text].filter((ch) => ch.codePointAt(0)! > 127 && !FONT.has(ch.codePointAt(0)!)))];

function company(id: string) {
  const c = companyRepository.getById(id);
  if (!c) throw new Error(`missing company ${id}`);
  return c;
}

/** [한글, 숫자, 라틴 문자, 그 밖(공백·기호)] 글자 수 */
const classes = (text: string) => {
  const chars = [...text];
  const hangul = chars.filter((ch) => /[가-힣]/.test(ch)).length;
  const digits = chars.filter((ch) => /[0-9]/.test(ch)).length;
  const latin = chars.filter((ch) => /[A-Za-z]/.test(ch)).length;
  return [hangul, digits, latin, chars.length - hangul - digits - latin];
};
const notMoreByClass = (after: string, before: string) =>
  classes(after).every((n, i) => n <= classes(before)[i]);

const toText = (html: string) =>
  html
    .replace(/<\/?(strong|a|b|em)\b[^>]*>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&");

/** 2025 사업보고서 본문 접수번호 — 2026-04-01 [첨부정정] 2건(20260401000251·20260401000273)은 첨부만 고쳤다 */
const RCPT_2025 = "20260331003916";

describe("메리츠화재 공시 카드 — 세계일보 인용 -> DART 2025 사업보고서 원문 합계 행 (값 1억4,397만원 그대로, 운영자 승인 15번)", () => {
  /** 종전(운영 중) 카드 문구 — 바꾼 문구가 글자 종류마다 이보다 많지 않아야 한다(GuideMidAd 위) */
  const OLD = {
    source: "세계일보 2026-04-02 — 금융감독원 전자공시 기준 2025년 직원 평균 보수 1억4,397만원",
    note: "2024년은 1억3,164만원(머니S 2025-03-06, 임직원 기준).",
  };

  it("헤드라인은 원문 합계 행 1인평균 143,965천원의 만원 반올림, 출처는 같은 접수번호의 DART 원문, note 는 2024 사업보고서 합계 행", async () => {
    const c = company("meritz-fire");
    const d = c.disclosed!;
    const { dartDisclosed } = await import("@/data/dart/dartDisclosed");
    const dart = dartDisclosed.find((x) => x.corpCode === "00117744")!;
    expect(dart.corpNameKo).toBe("메리츠화재해상보험");
    expect(dart.fiscalYear).toBe("2025");
    expect(dart.rceptNo).toBe(RCPT_2025);
    // 원문 합 계 행 직원 3,027명(남 1,216·여 1,811) — OpenDART 직원현황 두 행의 합과 같다
    expect(dart.employeeCount).toBe(3027);
    // 143,965천원 = 14,396.5만원 -> 14,397 (S-OIL 카드 138,652천원 -> 13,865 와 같은 반올림 환산)
    expect(d.avgSalaryManwon).toBe(14397);
    expect(d.avgSalaryManwon).toBe(Math.round(143_965 / 10));
    expect(d.fiscalYear).toBe("2025");
    expect(d.sourceUrl).toBe(`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${dart.rceptNo}`);
    expect(d.source).toBe("전자공시 2025 사업보고서 합계 1인평균 143,965천원(상담·단순계약직 제외)");
    // 수기 블록 그대로 — basis 없음(카드 제목 '추정이 아닌 공식 수치'·라벨 '원문:'), 근속 칩 없음(광고 위 줄 불변)
    expect(d.basis).toBeUndefined();
    expect(d.avgTenureYears).toBeUndefined();
    // 2024 사업보고서(rcpNo 20250331003145, 정정 없음) 같은 표 합계 1인평균 138,762천원 -> 13,876 (같은 주3·주4 기준)
    expect(Math.round(138_762 / 10)).toBe(13876);
    expect(d.note).toBe("2024년은 1억3,876만원(2024 사업보고서 합계).");
    // 보도 인용·다른 공시(지배구조 연차보고서) 값·원문이 싣지 않는 파생값(성별 행 가중 13,167·급여총액÷인원 9,689)은 카드에 없다
    expect(JSON.stringify(c)).not.toMatch(/세계일보|머니S|13,164|v\.daum\.net|13,167|9,689/);
    // 데이터 날짜는 그대로(메타 동결 — cfa4c670c 와 같다)
    expect(allCompanies.find((x) => x.id === "meritz-fire")!.lastUpdated).toBe("2026-05-15");
    // 비교 기준 OLD 는 운영 문구 그대로다 — bd68d860 고정본(재생성 금지)이 종전 출처를 그대로 가진다
    expect((preGateSnapshot as { disclosedSources: Record<string, string> }).disclosedSources["meritz-fire"]).toBe(OLD.source);
  });

  it("광고 위 카드: 출처·note 는 글자 종류마다 종전 이하, 라벨은 같은 폭 '원문:', 서브셋 밖 글자 없음", async () => {
    const { disclosedSourceLabel } = await import("@/components/CompanyDisclosedSalary");
    const d = company("meritz-fire").disclosed!;
    expect(classes(d.source)).toEqual([25, 11, 0, 10]);
    expect(classes(OLD.source)).toEqual([25, 17, 0, 14]);
    expect(notMoreByClass(d.source, OLD.source)).toBe(true);
    expect(classes(d.note!)).toEqual([12, 13, 0, 7]);
    expect(classes(OLD.note)).toEqual([12, 17, 1, 11]);
    expect(notMoreByClass(d.note!, OLD.note)).toBe(true);
    // 라벨: DART 원문 링크 수기 카드 '원문:' — 종전 보도 링크 '보도:'와 같은 두 글자 + 콜론
    expect(disclosedSourceLabel(d)).toBe("원문:");
    expect(disclosedSourceLabel({ sourceUrl: "https://v.daum.net/v/20260402050336779" })).toBe("보도:");
    expect("원문:".length).toBe("보도:".length);
    // A4' 규칙: 라벨 + 출처 문구가 종전 줄('보도: ' + 종전 출처)과 '출처: ' + 출처보다 길지 않다
    expect(`원문: ${d.source}`.length).toBeLessThanOrEqual(`보도: ${OLD.source}`.length);
    expect(`원문: ${d.source}`.length).toBeLessThanOrEqual(`출처: ${d.source}`.length);
    expect(outsideFont(`${d.source}${d.note}`)).toEqual([]);
  });

  it("카드 모양은 운영과 같다 — 제목·헤드라인·본문 문단 그대로, 배지·이력 표·근속 칩·괴리 병기 없음, 출처 줄만 '원문:' + DART 링크", async () => {
    const { dartCompanyStatsById } = await import("@/lib/salary-data/dartReport");
    const { industryRankingByCompanyId } = await import("@/lib/salary-data/dartRanking");
    const { default: CompanyDisclosedSalary } = await import("@/components/CompanyDisclosedSalary");
    // DART 두 산정 방식 괴리(V4) 플래그로 통계에서 빠져 page.tsx 가 넘기는 DART 값이 없다 — 배지·이력·병기 없음(종전과 같다)
    expect(dartCompanyStatsById.has("meritz-fire")).toBe(false);
    const c = company("meritz-fire");
    const html = renderToStaticMarkup(
      createElement(CompanyDisclosedSalary, {
        company: c,
        dartRank: null,
        dartSalaryManwon: dartCompanyStatsById.get("meritz-fire")?.dartSalaryManwon ?? null,
        dartStats: null,
        industryLink: industryRankingByCompanyId.get("meritz-fire") ?? null,
      })
    );
    const text = toText(html);
    expect(text).toContain("메리츠화재 공시 기준 평균연봉 — 추정이 아닌 공식 수치");
    expect(text).toContain("1억 4,397만원");
    expect(text).toContain("사업연도 2025 기준");
    expect(text).toContain("은 14,397만원입니다.");
    expect(text).toContain("2024년은 1억3,876만원(2024 사업보고서 합계).");
    expect(html).toContain(`원문: <a href="https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${RCPT_2025}"`);
    expect(html).not.toContain("보도:");
    expect(html).not.toContain("<table");
    expect(text).not.toContain("평균 근속");
    expect(text).not.toContain("산정치");
    expect(text).not.toContain("전년 대비");
  });

  it("제목·meta description·페이지 수정일은 그대로 — 출처가 DART 원문이 돼도 L10' 후미 대상이 되지 않는다(메타 동결)", async () => {
    const { companyPageTitleAndDescription } = await import("@/lib/companyPageMetadata");
    const { companyMetaDisclosedFigure, DISCLOSED_CORRECTION_HOLD_IDS } = await import("@/lib/companyMetaDisclosed");
    const { companyPageModified } = await import("@/lib/pageModified");
    const { COMPANY_FAQ_REVIEW_DATE } = await import("@/config/siteDates");
    const c = company("meritz-fire");
    expect(DISCLOSED_CORRECTION_HOLD_IDS.has("meritz-fire")).toBe(true);
    expect(companyMetaDisclosedFigure(c)).toBeNull();
    // id 없이 보면 대상 조건(공시 원문·2025·basis 없음·신입~시니어 범위)을 새로 채운다 — 보류 목록이 막는 것이 이것
    expect(companyMetaDisclosedFigure({ salary: c.salary, disclosed: c.disclosed })).toEqual({
      avgSalaryManwon: 14397,
      fiscalYear: "2025",
    });
    const { title, description } = companyPageTitleAndDescription(c);
    expect(title).toBe("메리츠화재 연봉 2026 — 신입 8,500만원~시니어 1억 6,200만원 직급별 연봉표 | 머니샐러리");
    expect(description).not.toContain("공시 평균연봉");
    const before = companyPageModified(c, new Date("2026-09-30T14:59:59.999Z")).getTime();
    expect(companyPageModified(c, new Date("2026-11-02T03:00:00Z")).getTime()).toBe(before);
    expect(before).toBe(Math.max(new Date(c.lastUpdated).getTime(), COMPANY_FAQ_REVIEW_DATE.getTime()));
  });

  it("연봉 FAQ 첫 답(FAQPage JSON-LD)이 1억 4,397만원과 DART 원문 출처를 인용한다", async () => {
    const { buildCompanySalaryFaq } = await import("@/lib/companySalaryBasis");
    const faq = buildCompanySalaryFaq(company("meritz-fire"));
    expect(faq[0].answer).toContain("2025 사업연도 1억 4,397만원입니다.");
    expect(faq[0].answer).toContain(
      "공시 인용 출처: 전자공시 2025 사업보고서 합계 1인평균 143,965천원(상담·단순계약직 제외). "
    );
    expect(JSON.stringify(faq)).not.toContain("세계일보");
  });

  it("확인 방법 상자는 일반 회사 상자 — 보도 인용뿐인 회사 집합에서 빠졌다(데이터와 상수가 같은 커밋)", async () => {
    const { EDITORIAL_TRUST_COMPANY, EDITORIAL_TRUST_PRESS_ONLY_COMPANY_IDS, editorialTrustNoteFor } = await import(
      "@/lib/editorialTrust"
    );
    expect(editorialTrustNoteFor("/salary-db/meritz-fire")).toBe(EDITORIAL_TRUST_COMPANY);
    expect([...EDITORIAL_TRUST_PRESS_ONLY_COMPANY_IDS]).toEqual(["deloitte-anjin"]);
  });
});

describe("메리츠화재 DART 주입값(임베드 위젯) — 원문 합계 행 1인평균 143,965천원 (삼성전자 fa8131c1f 와 같은 방식, 날짜 불변)", () => {
  it("dartInjection·dartDisclosed 공시 기준값이 원문 합계 행이고, 위젯이 회사 카드 값의 100만원 반올림을 보인다", async () => {
    const { dartInjection, DART_INJECTION_DATE } = await import("@/data/dart/dartInjection");
    const { dartDisclosed, DART_DATA_DATE } = await import("@/data/dart/dartDisclosed");
    const { dartCompanyStatsById } = await import("@/lib/salary-data/dartReport");
    const inj = dartInjection["meritz-fire"];
    expect(inj).toEqual({ a: 14400, y: "2025", e: 3027, r: RCPT_2025 });
    const d = dartDisclosed.find((x) => x.corpCode === "00117744")!;
    // 14,396.5만원 -> Math.round 14,397 (종전: 성별 행 1인평균의 연말 인원 가중 13,167 — 원문에 없는 값)
    expect(d.reportedAvgManwonRaw).toBe(14397);
    expect(inj.a).toBe(Math.round(d.reportedAvgManwonRaw! / 100) * 100);
    // 급여총액÷인원 산정치(293,287,645천원 ÷ 3,027명)·괴리·V4 플래그는 그대로 — 통계·랭킹·상장사 페이지 제외도 그대로
    expect(d.avgSalaryManwonRaw).toBe(9689);
    expect(Math.round(293_287_645 / 3_027 / 10)).toBe(9689);
    expect(d.avgSalaryManwon).toBe(9700);
    expect(d.divergencePct).toBe(35.9);
    expect(d.flags).toEqual(["V4-divergence"]);
    expect(dartCompanyStatsById.has("meritz-fire")).toBe(false);
    // 회사 카드(수기 14,397)와 위젯(100만원 반올림)이 같은 원문 값을 가리킨다
    expect(inj.a).toBe(Math.round(company("meritz-fire").disclosed!.avgSalaryManwon / 100) * 100);
    // 손으로 맞춘 값이 emit 결과와 바이트 동일해 keepPrevDate 가 종전 날짜를 유지한다 — 다른 회사 페이지 날짜 불변
    expect(DART_INJECTION_DATE).toBe("2026-09-24");
    expect(DART_DATA_DATE).toBe("2026-08-23");
    const { GET } = await import("@/app/widget/company/route");
    const html = await (await GET(new Request("https://pages-data.invalid/widget/company?id=meritz-fire"))).text();
    expect(html).toContain("1억 4,400만원");
    expect(html).not.toContain("1억 3,200만원");
    expect(html).toContain("1인평균급여액 기준");
  });

  it("ETL 은 같은 접수번호일 때만 원문 합계 행 값을 쓴다(다음 해 보고서는 자동 해제)", () => {
    const etl = readFileSync("scripts/dart-etl.mjs", "utf8");
    expect(etl).toContain('"00117744": { rceptNo: "20260331003916", manwon: 14396.5 }');
    expect(etl).toContain("filingTotal && filingTotal.rceptNo === list[0].rcept_no");
  });
});
