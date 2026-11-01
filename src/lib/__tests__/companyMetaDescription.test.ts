// L10'(승인⑧) 회사 meta description 회귀 가드 — A7'·A4'·COMP-06 동봉 (2026-09-25 준비, 2026-10-01 KST 적용)
//
//  - 회사 <title> 은 불변 원칙: 전 회사 제목을 fixtures/companyTitles-2026-09-25.json(58b8876d 출력 그대로 — 재생성·수정
//    금지)과 적용 전·후 두 시점 모두 대조한다. 운영자 승인 예외(APPROVED_TITLE_CHANGES)만 새 제목을 기대한다.
//  - 적용 후 description: 150자 이하 · '로그인 없이'(A7') · 'N월 업데이트'/'최신' 없음(COMP-06) ·
//    og:description = meta description, og:title = <title>(NV-8).
//  - 공시 평균연봉 후미(L10'): DART·알리오 원문 + 2025 사업연도 + 공시 1인평균 기준(산정치 제외) +
//    title '신입~시니어' 범위 안 회사만. 대상 수는 빌드마다 실측(2026-09-25 기준 164곳).
//  - 대상 회사만 페이지 수정일(sitemap lastmod·RSS pubDate)이 적용일로 오른다.
//  - A4': 공시 카드 출처 줄 라벨·DART 주입 꼬리(' — OpenDART 수집') 생략 — 같은 게이트 뒤, 줄 길이가
//    종전보다 길어지지 않는다(광고 위 높이 불변). FAQ '공시 인용 출처' 도 같은 게이트로 꼬리를 뺀다.
//  - 적용 전 빌드: description·공시 카드 HTML·회사 연봉 FAQ·페이지 수정일이 bd68d860(병합 전 main) 출력과
//    바이트 동일 — fixtures/companyPreGate-bd68d860.json(그 커밋 src 로 생성, 이후 코드로 재생성 금지).
//    L10' 적용 배포 확인 뒤 seo.ts 적용 전 분기를 지울 때 이 고정본과 '적용 전' 테스트도 같이 지운다.
// 시각은 vi.setSystemTime 으로 고정한다(게이트가 빌드 시각을 읽는다).

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import titleSnapshot from "./fixtures/companyTitles-2026-09-25.json";
import preGateSnapshot from "./fixtures/companyPreGate-bd68d860.json";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import {
  companyMetadataInput,
  companyPageTitleAndDescription,
  metadataTitleText,
} from "@/lib/companyPageMetadata";
import { buildCompanyMetadata, COMPANY_DESCRIPTION_MAX_CHARS } from "@/lib/seo";
import {
  COMPANY_META_DISCLOSED_FISCAL_YEAR,
  COMPANY_META_DISCLOSED_FROM_MS,
  companyMetaDisclosedFigure,
  isCompanyMetaDisclosedLive,
  isOfficialDisclosureUrl,
} from "@/lib/companyMetaDisclosed";
import { DART_INJECTED_SOURCE_TAIL, displayedDisclosedSource } from "@/lib/companyMetaGate";
import { buildCompanySalaryFaq } from "@/lib/companySalaryBasis";
import { companyPageModified } from "@/lib/pageModified";
import { COMPANY_FAQ_REVIEW_DATE, COMPANY_META_DISCLOSED_DATE } from "@/config/siteDates";
import { formatManwonKorean } from "@/lib/manwonFormat";
import CompanyDisclosedSalary, { disclosedSourceLabel } from "@/components/CompanyDisclosedSalary";
import { GET as rssCompaniesGET } from "@/app/rss-companies.xml/route";
import type { CompanyProfile } from "@/types/company";

/** 9/30 23:59:59.999 KST — 적용 직전 */
const BEFORE = new Date("2026-09-30T14:59:59.999Z");
/** 10/1 00:00 KST — 적용 시작 */
const FROM = new Date("2026-09-30T15:00:00.000Z");
/** 적용 후 임의 시각(10/1 12:00 KST) */
const LIVE = new Date("2026-10-01T03:00:00.000Z");

function at(date: Date) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(date);
}

afterEach(() => {
  vi.useRealTimers();
});

const companies = companyRepository.getAll();
// Historical output fixtures must retain their historical inputs. At bd68d860,
// korea-highway had no disclosed block (krCompanies_Batch12.ts), and enrichment
// raised its 2026-05-15 data date to TAX_TABLE_EFFECTIVE_DATE = 2026-09-25.
// Current disclosure retention is independently checked by companyDisclosedRetention.test.ts.
// Do not rewrite the bd68d860 output fixture when current company data changes.
const historicalCompanies = companies.map((company): CompanyProfile => company.id === "korea-highway"
  ? { ...company, disclosed: undefined, lastUpdated: "2026-09-25" }
  : company);
const snapshot = titleSnapshot as Record<string, string>;
const pre = preGateSnapshot as {
  descriptions: Record<string, string>;
  disclosedSources: Record<string, string>;
  cardSha256: Record<string, string>;
  salaryFaqSha256: Record<string, string>;
};
/** 고정본 뒤 공시 카드 note 를 고친 회사(같은 폭 숫자 교체) — 적용 전 카드 바이트 대조에서만 뺀다.
 *  korea-investment: '증권업 평균연봉 전체 1위 수준' -> '4위 수준'(DART 2025 증권업 24곳 중 4위, 2026-10). */
const CARD_NOTE_CHANGED_AFTER_FIXTURE: readonly string[] = ["korea-investment"];
/** 고정본 뒤 수기 공시 카드의 헤드라인·출처·note 를 원문 값으로 바로잡은 회사 — 적용 전 카드 바이트 대조에서만 뺀다
 *  (적용 후 '출처 줄 글자 수 ≤ 종전' 검사는 그대로 받는다). 고친 값은 companyFixes1030.test.ts 가 고정한다.
 *  db-insurance: 보도 인용 1억3,700만원 -> DART 2025 사업보고서 원문 1억370만원(A5, 2026-10). */
const DISCLOSED_VALUE_CORRECTED_AFTER_FIXTURE: readonly string[] = ["db-insurance"];
/** 고정본 뒤 연봉 FAQ(평균·신입 초봉 두 문항) 문장이 바뀐 회사 — bd68d860 고정본 연봉 FAQ 바이트 대조(적용 전)에서만 뺀다.
 *  적용 후 검사는 현재 데이터로 게이트 전후를 비교하므로 그대로 받는다. */
const SALARY_FAQ_CHANGED_AFTER_FIXTURE: readonly string[] = [...DISCLOSED_VALUE_CORRECTED_AFTER_FIXTURE];
/** 고정본(58b8876d 출력) 뒤 운영자 승인으로 <title> 을 바꾼 회사 — 이 회사만 새 제목을 기대하고, 나머지 전 회사는
 *  고정본과 바이트 동일해야 한다. 2026-11-01 승인 목록 8번(B34):
 *  - kotra: 검색 표기 '코트라' + 자체 추정 수치 생략(titleName·titleFigures — 신입 추정이 알리오 2025 결산 초임보다 높다)
 *  - lig-nex1: 2026-03-31 상호 변경 — 현재 상장명(구 사명), 수치 없음(nameChange.currentListedName) */
const APPROVED_TITLE_CHANGES: Readonly<Record<string, string>> = {
  kotra: "코트라 연봉 2026 (KOTRA) — 신입 초봉·직급별 연봉표 | 머니샐러리",
  "lig-nex1": "LIG디펜스앤에어로스페이스(구 LIG넥스원) 연봉 2026 — 신입 초봉·직급별 연봉표 | 머니샐러리",
};
const expectedTitle = (id: string) => APPROVED_TITLE_CHANGES[id] ?? snapshot[id];
/** 상호 변경 회사의 적용 후 description 머리 문장 — seo.ts buildCompanyMetadata 와 같은 규칙(B34). 그 밖의 회사는 빈 문자열 */
const nameChangeLead = (c: CompanyProfile) =>
  c.nameChange ? `${c.nameChange.changedAt} ${c.name.ko}에서 상호 변경. ` : "";
const SUFFIX_RE = / 공시 평균연봉 (.+)\((\d{4}) 사업연도\)\.$/;
const INJECTED_SOURCE_SAMPLE = "금융감독원 전자공시(DART) 사업보고서(2025 사업연도) '직원 등의 현황'";

// base64 표기 — 고정본에 긴 hex 열을 두지 않는다(DART 키 커밋 전 40자리 hex 스캔 게이트 오탐 방지)
const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("base64");

/** renderToStaticMarkup 텍스트 이스케이프와 같은 규칙(& < > " ') — 출처 문구 대조용 */
const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const renderCard = (c: CompanyProfile) =>
  renderToStaticMarkup(createElement(CompanyDisclosedSalary, { company: c }));

function metaOf(company: CompanyProfile) {
  const metadata = buildCompanyMetadata(companyMetadataInput(company));
  return {
    metadata,
    title: metadataTitleText(metadata.title),
    description: metadata.description ?? "",
  };
}

describe("L10' 적용 게이트 — 빌드 시점 KST 날짜", () => {
  it("2026-10-01 00:00 KST 부터 켜진다 (그 직전은 꺼짐) — 운영자 승인 적용일 = 10/1 예약 재빌드", () => {
    expect(COMPANY_META_DISCLOSED_DATE).toBe("2026-10-01");
    expect(COMPANY_META_DISCLOSED_FROM_MS).toBe(FROM.getTime());
    expect(isCompanyMetaDisclosedLive(BEFORE)).toBe(false);
    expect(isCompanyMetaDisclosedLive(FROM)).toBe(true);
    expect(isCompanyMetaDisclosedLive(LIVE)).toBe(true);
  });
});

describe("회사 <title> 불변 — 전 회사 고정 스냅샷", () => {
  it("스냅샷이 정본 회사 전체와 같은 집합이다", () => {
    expect(Object.keys(snapshot).sort()).toEqual(companies.map((c) => c.id).sort());
    expect(companies.length).toBeGreaterThanOrEqual(400);
  });

  it.each([
    ["적용 전", BEFORE],
    ["적용 후", LIVE],
  ])("%s: <title> 이 58b8876d 출력과 문자열 그대로 같다 (승인 예외 회사만 새 제목)", (_label, when) => {
    at(when);
    const changed: string[] = [];
    for (const c of companies) {
      const { title } = metaOf(c);
      expect(title, c.id).toBe(expectedTitle(c.id));
      expect(companyPageTitleAndDescription(c).title, c.id).toBe(expectedTitle(c.id));
      if (title !== snapshot[c.id]) changed.push(c.id);
    }
    // 고정본과 다른 회사 = 승인 예외 목록 그대로 — 다른 회사 제목은 한 글자도 바뀌지 않았다
    expect(changed.sort()).toEqual(Object.keys(APPROVED_TITLE_CHANGES).sort());
  });
});

describe("B34 승인 예외(2026-11-01 승인 목록 8번) — 코트라 제목·LIG 새 이름", () => {
  it("예외 키는 kotra(titleName·titleFigures)와 상호 변경 회사 lig-nex1(nameChange)에만 있다", () => {
    expect(companies.filter((c) => c.titleName !== undefined).map((c) => c.id)).toEqual(["kotra"]);
    expect(companies.filter((c) => c.titleFigures !== undefined).map((c) => c.id)).toEqual(["kotra"]);
    expect(companies.filter((c) => c.nameChange).map((c) => c.id)).toEqual(["lig-nex1"]);
    // 검색 별칭은 CompanyNarrative 본문 문단으로도 렌더된다 — kotra 는 넣지 않는다(광고 위 줄 불변)
    expect(companies.find((c) => c.id === "kotra")!.aliases).toBeUndefined();
  });

  it.each([
    ["적용 전", BEFORE],
    ["적용 후", LIVE],
  ])("%s: kotra 제목은 '코트라'·수치 없음(43자), og·twitter·RSS 제목도 같고 description·회사명은 그대로", (_label, when) => {
    at(when);
    const kotra = companies.find((c) => c.id === "kotra")!;
    expect(kotra.name.ko).toBe("KOTRA"); // H1·본문 회사명
    const { metadata, title, description } = metaOf(kotra);
    expect(title).toBe("코트라 연봉 2026 (KOTRA) — 신입 초봉·직급별 연봉표 | 머니샐러리");
    expect(title.length).toBe(43);
    expect(title).not.toContain("만원"); // 자체 추정 수치 없음
    expect(metadata.openGraph?.title).toBe(title);
    expect(metadata.twitter?.title).toBe(title);
    expect(companyPageTitleAndDescription(kotra)).toEqual({ title, description });
    // titleName·titleFigures 는 description 을 바꾸지 않는다(제목 전용)
    const plain = { ...companyMetadataInput(kotra), titleName: undefined, titleFigures: undefined };
    expect(description).toBe(buildCompanyMetadata(plain).description);
    expect(description.startsWith("KOTRA 연봉 자체 추정치:")).toBe(true);
    // keywords 는 '코트라 연봉' 하나만 더한다
    const keywords = String(metadata.keywords).split(", ");
    const plainKeywords = String(buildCompanyMetadata(plain).keywords).split(", ");
    expect(keywords).toEqual([...plainKeywords, "코트라 연봉"]);
  });

  it("lig-nex1: 제목은 현재 상장명(구 사명)·수치 없음, 적용 후 description 은 변경일 머리 문장 + 150자 안, 적용 전 description 은 고정본 그대로", () => {
    const lig = companies.find((c) => c.id === "lig-nex1")!;
    expect(lig.name.ko).toBe("LIG넥스원"); // H1·본문 회사명
    expect(lig.nameChange?.currentListedName).toBe("LIG디펜스앤에어로스페이스");
    expect(lig.nameChange?.changedAt).toBe("2026-03-31");
    const expected = "LIG디펜스앤에어로스페이스(구 LIG넥스원) 연봉 2026 — 신입 초봉·직급별 연봉표 | 머니샐러리";

    at(LIVE);
    const { metadata, title, description } = metaOf(lig);
    expect(title).toBe(expected);
    expect(metadata.openGraph?.title).toBe(title);
    expect(metadata.twitter?.title).toBe(title);
    expect(description.startsWith("2026-03-31 LIG넥스원에서 상호 변경. 연봉 자체 추정치: 신입 6,700만원, ")).toBe(true);
    expect(description.length).toBeLessThanOrEqual(COMPANY_DESCRIPTION_MAX_CHARS);
    expect(description).toContain("로그인 없이");
    expect(description.endsWith(" 공시 평균연봉 1억 1,000만원(2025 사업연도).")).toBe(true);
    expect(metadata.openGraph?.description).toBe(description);
    expect(companyPageTitleAndDescription(lig)).toEqual({ title, description });

    at(BEFORE);
    expect(metaOf(lig).title).toBe(expected);
    expect(metaOf(lig).description).toBe(pre.descriptions["lig-nex1"]);
  });
});

describe("적용 후 description — 150자·A7'·COMP-06·NV-8", () => {
  it("전 회사: 150자 이하, '로그인 없이' 포함, 페이지별 날짜·'최신' 단정 없음, 자체 추정치 표시 유지", () => {
    at(LIVE);
    const lengths: number[] = [];
    for (const c of companies) {
      const { description } = metaOf(c);
      lengths.push(description.length);
      expect(description.length, `${c.id}: ${description}`).toBeLessThanOrEqual(
        COMPANY_DESCRIPTION_MAX_CHARS
      );
      expect(description, c.id).toContain("로그인 없이");
      expect(description, c.id).not.toMatch(/업데이트|최신/);
      expect(description, c.id).toContain("자체 추정치");
      // 첫 구절은 회사명 — 상호 변경 회사만 '{변경일} {회사명}에서 상호 변경.' 이 앞선다(B34)
      expect(description.startsWith(nameChangeLead(c) || c.name.ko), c.id).toBe(true);
    }
    expect(Math.max(...lengths)).toBeLessThanOrEqual(150);
  });

  it("og:title = <title>, og:description = meta description (twitter 도 같게)", () => {
    at(LIVE);
    for (const c of companies) {
      const { metadata, title, description } = metaOf(c);
      expect(metadata.openGraph?.title, c.id).toBe(title);
      expect(metadata.openGraph?.description, c.id).toBe(description);
      expect(metadata.twitter?.title, c.id).toBe(title);
      expect(metadata.twitter?.description, c.id).toBe(description);
    }
  });

  it("rss-companies.xml 은 페이지 description 을 그대로 쓴다 (적용 후 문구 포함)", () => {
    at(LIVE);
    for (const c of companies) {
      expect(companyPageTitleAndDescription(c).description, c.id).toBe(metaOf(c).description);
    }
  });
});

describe("L10' 공시 평균연봉 후미 — 대상 판정과 문구", () => {
  const eligible = companies.filter((c) => companyMetaDisclosedFigure(c));

  it(`대상 수 실측 — 조건 4개(공시 원문·${COMPANY_META_DISCLOSED_FISCAL_YEAR} 사업연도·산정치 제외·제목 범위)`, () => {
    // 2026-09-25 실측 164곳(계획 추정 ≈140). DART 재수집·데이터 변경으로 달라질 수 있어 범위로 건다.
    console.log(`[L10'] 공시 평균연봉 description 대상 ${eligible.length}곳 / 전체 ${companies.length}곳`);
    expect(eligible.length).toBeGreaterThanOrEqual(120);
    expect(eligible.length).toBeLessThanOrEqual(220);
    for (const c of eligible) {
      const d = c.disclosed!;
      expect(isOfficialDisclosureUrl(d.sourceUrl), c.id).toBe(true);
      expect(d.fiscalYear, c.id).toBe("2025");
      expect(d.basis, c.id).not.toBe("computed");
      const input = companyMetadataInput(c);
      const avgWon = d.avgSalaryManwon * 10_000;
      expect(avgWon, c.id).toBeGreaterThanOrEqual(input.averageSalary!);
      expect(avgWon, c.id).toBeLessThanOrEqual(input.seniorSalary!);
    }
  });

  it("대상 회사만 후미에 공시 평균연봉(카드 헤드라인과 같은 값·표기)이 붙고, 첫 구절은 자체 추정치 그대로", () => {
    at(LIVE);
    const eligibleIds = new Set(eligible.map((c) => c.id));
    let withSuffix = 0;
    for (const c of companies) {
      const { description } = metaOf(c);
      const m = description.match(SUFFIX_RE);
      if (!eligibleIds.has(c.id)) {
        expect(description, c.id).not.toContain("공시 평균연봉");
        continue;
      }
      withSuffix++;
      expect(m, `${c.id}: ${description}`).not.toBeNull();
      expect(m![1], c.id).toBe(formatManwonKorean(c.disclosed!.avgSalaryManwon));
      expect(m![2], c.id).toBe(c.disclosed!.fiscalYear);
      // 후미 삽입 — 자체 추정치 구절 뒤, 맨 끝
      expect(description.indexOf("공시 평균연봉"), c.id).toBeGreaterThan(
        description.indexOf("자체 추정치")
      );
      // 상호 변경 회사는 머리 문장이 회사명을 담아 뒤 구절의 회사명을 뺀다(B34 — 150자 상한)
      const lead = nameChangeLead(c);
      expect(
        description.startsWith(lead ? `${lead}연봉 자체 추정치:` : `${c.name.ko} 연봉 자체 추정치:`),
        c.id
      ).toBe(true);
    }
    expect(withSuffix).toBe(eligible.length);
  });

  it("판정 규칙 — 보도 인용·과년도·산정치·범위 밖·깨진 URL 은 제외, 알리오 하위 도메인·경계값은 포함", () => {
    const salary = (entry: number, senior: number) =>
      ({
        entry: { base: entry, incentive: { target: 0, max: 0, avgAmount: 0 } },
        junior: { base: entry, incentive: { target: 0, max: 0, avgAmount: 0 } },
        senior: { base: senior, incentive: { target: 0, max: 0, avgAmount: 0 } },
        lead: { base: senior, incentive: { target: 0, max: 0, avgAmount: 0 } },
        executive: { base: senior, incentive: { target: 0, max: 0, avgAmount: 0 } },
      }) as unknown as CompanyProfile["salary"];
    const base = {
      avgSalaryManwon: 8000,
      fiscalYear: "2025",
      source: "x",
      sourceUrl: "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=1",
    };
    const s = salary(60_000_000, 100_000_000);
    const fig = (disclosed: CompanyProfile["disclosed"], sal = s) =>
      companyMetaDisclosedFigure({ salary: sal, disclosed });

    expect(fig({ ...base })).toEqual({ avgSalaryManwon: 8000, fiscalYear: "2025" });
    expect(fig({ ...base, basis: "reported" })).not.toBeNull();
    expect(fig({ ...base, sourceUrl: "https://www.alio.go.kr/item/itemReportTerm.do" })).not.toBeNull();
    expect(fig({ ...base, sourceUrl: "https://alio.go.kr/x" })).not.toBeNull();
    // 경계값(신입 = 공시, 시니어 = 공시)은 포함
    expect(fig({ ...base, avgSalaryManwon: 6000 })).not.toBeNull();
    expect(fig({ ...base, avgSalaryManwon: 10000 })).not.toBeNull();

    expect(fig({ ...base, sourceUrl: "https://www.newsis.com/view/1" })).toBeNull();
    expect(fig({ ...base, sourceUrl: "https://dart.fss.or.kr.evil.example/x" })).toBeNull();
    expect(fig({ ...base, sourceUrl: "not a url" })).toBeNull();
    expect(fig({ ...base, sourceUrl: undefined })).toBeNull();
    expect(fig({ ...base, fiscalYear: "2024" })).toBeNull();
    expect(fig({ ...base, fiscalYear: "2024/25 회계연도(2025년 5월 결산)" })).toBeNull();
    expect(fig({ ...base, basis: "computed" })).toBeNull();
    expect(fig({ ...base, avgSalaryManwon: 5999 })).toBeNull();
    expect(fig({ ...base, avgSalaryManwon: 10001 })).toBeNull();
    expect(fig({ ...base, avgSalaryManwon: 0 })).toBeNull();
    expect(fig(undefined)).toBeNull();
    expect(companyMetaDisclosedFigure({ disclosed: base })).toBeNull();
  });

  it("긴 회사명·억 단위 수치여도 150자 안 — 꼬리 문구를 줄이고 후미는 유지", () => {
    at(LIVE);
    const meta = buildCompanyMetadata({
      id: "example",
      name: "가나다라마바사아자차카타파하(가나다라마바사)",
      averageSalary: 88_000_000,
      juniorSalary: 105_000_000,
      seniorSalary: 175_000_000,
      leadSalary: 228_000_000,
      hasCareerLevels: true,
      disclosedAverage: { avgSalaryManwon: 11_400, fiscalYear: "2025" },
    });
    const description = meta.description ?? "";
    expect(description.length).toBeLessThanOrEqual(COMPANY_DESCRIPTION_MAX_CHARS);
    expect(description.endsWith(" 공시 평균연봉 1억 1,400만원(2025 사업연도).")).toBe(true);
    expect(description).toContain("로그인 없이");
  });
});

describe("적용 전 빌드 — bd68d860(병합 전 main) 출력과 바이트 동일", () => {
  it("고정본이 정본 회사 전체와 같은 집합이다", () => {
    const ids = historicalCompanies.map((c) => c.id).sort();
    expect(Object.keys(pre.descriptions).sort()).toEqual(ids);
    expect(Object.keys(pre.salaryFaqSha256).sort()).toEqual(ids);
    const disclosedIds = historicalCompanies.filter((c) => c.disclosed).map((c) => c.id).sort();
    expect(Object.keys(pre.disclosedSources).sort()).toEqual(disclosedIds);
    expect(Object.keys(pre.cardSha256).sort()).toEqual(disclosedIds);
  });

  it("description·og·twitter·RSS description 이 전 회사 bd68d860 출력과 같다", () => {
    at(BEFORE);
    for (const c of historicalCompanies) {
      const { metadata, description } = metaOf(c);
      expect(description, c.id).toBe(pre.descriptions[c.id]);
      expect(metadata.openGraph?.description, c.id).toBe(pre.descriptions[c.id]);
      expect(metadata.twitter?.description, c.id).toBe(pre.descriptions[c.id]);
      expect(companyPageTitleAndDescription(c).description, c.id).toBe(pre.descriptions[c.id]);
      // 종전 꼬리 형식 — 고정본이 병합 전 문구임을 한 번 더 확인
      expect(description, c.id).not.toContain("로그인 없이");
      expect(description, c.id).not.toContain("공시 평균연봉");
      expect(description, c.id).toMatch(
        /업데이트 기준으로 확인하세요\.$|2026년 최신 기준으로 확인하세요\.$|협상 팁을 확인하세요\.$/
      );
    }
  });

  it("A4' 게이트 — 공시 카드 HTML 이 bd68d860 렌더와 같고, 출처 줄은 '출처: ' + 종전 출처 문구(주입 꼬리 포함)", () => {
    at(BEFORE);
    let injected = 0;
    for (const c of historicalCompanies.filter((x) => ![...CARD_NOTE_CHANGED_AFTER_FIXTURE, ...DISCLOSED_VALUE_CORRECTED_AFTER_FIXTURE].includes(x.id))) {
      const d = c.disclosed;
      if (!d) continue;
      // 데이터 출처 문구 자체가 병합 전과 같다 — 꼬리는 표시 단계(게이트 뒤)에서만 뺀다
      expect(d.source, c.id).toBe(pre.disclosedSources[c.id]);
      const html = renderCard(c);
      expect(sha256(html), c.id).toBe(pre.cardSha256[c.id]);
      const oldSource = escapeHtml(pre.disclosedSources[c.id]);
      if (d.sourceUrl) {
        expect(html, c.id).toContain("출처: <a href=");
        expect(html, c.id).toContain(`>${oldSource}<svg`);
      } else {
        expect(html, c.id).toContain(`출처: ${oldSource}</p>`);
      }
      expect(html, c.id).not.toContain("출처(공시 원문):");
      if (d.basis) {
        injected++;
        expect(d.source.endsWith(DART_INJECTED_SOURCE_TAIL), c.id).toBe(true);
        expect(html, c.id).toContain("OpenDART 수집");
      }
    }
    expect(injected).toBeGreaterThan(200);
  });

  it("A4' 게이트 — 회사 연봉 FAQ(화면 FAQ·FAQPage JSON-LD 입력)가 전 회사 bd68d860 출력과 같다", () => {
    at(BEFORE);
    for (const c of historicalCompanies.filter((x) => !SALARY_FAQ_CHANGED_AFTER_FIXTURE.includes(x.id))) {
      const faq = buildCompanySalaryFaq(c);
      expect(sha256(JSON.stringify(faq)), c.id).toBe(pre.salaryFaqSha256[c.id]);
      if (c.disclosed) {
        expect(faq[0].answer, c.id).toContain(`공시 인용 출처: ${pre.disclosedSources[c.id]}. `);
      }
    }
  });

  it("페이지 수정일은 전 회사 max(데이터일, FAQ 검수일) 그대로 — 적용일로 오르지 않는다", () => {
    at(BEFORE);
    for (const c of historicalCompanies) {
      const expected = Math.max(new Date(c.lastUpdated).getTime(), COMPANY_FAQ_REVIEW_DATE.getTime());
      expect(companyPageModified(c).getTime(), c.id).toBe(expected);
    }
  });
});

describe("대상 회사 페이지 수정일 승격 — sitemap lastmod · RSS pubDate", () => {
  const META_DAY = new Date(COMPANY_META_DISCLOSED_DATE).getTime();

  it("적용 후: 대상 회사만 적용일(2026-10-01)로, 비대상은 종전 값 그대로", () => {
    let bumped = 0;
    for (const c of companies) {
      const before = companyPageModified(c, BEFORE).getTime();
      const after = companyPageModified(c, LIVE).getTime();
      if (companyMetaDisclosedFigure(c)) {
        bumped++;
        expect(after, c.id).toBe(Math.max(before, META_DAY));
        expect(after, c.id).toBeGreaterThanOrEqual(META_DAY);
      } else {
        expect(after, c.id).toBe(before);
      }
    }
    expect(bumped).toBe(companies.filter((c) => companyMetaDisclosedFigure(c)).length);
  });

  it("salary·disclosed 없는 부분 객체는 대상이 아니다 (종전 규칙 그대로)", () => {
    expect(companyPageModified({}, LIVE).toISOString()).toBe(COMPANY_FAQ_REVIEW_DATE.toISOString());
    expect(companyPageModified({ lastUpdated: "2026-09-25" }, LIVE).toISOString().slice(0, 10)).toBe(
      "2026-09-25"
    );
  });

  it("rss-companies.xml: 적용일과 후속 데이터 수정일을 반영해 최신순으로 정렬한다", async () => {
    at(LIVE);
    const xml = await (await rssCompaniesGET()).text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => ({
      id: m[1].match(/<guid[^>]*>https:\/\/www\.moneysalary\.com\/salary-db\/([^<]+)<\/guid>/)![1],
      pubDate: m[1].match(/<pubDate>([^<]+)<\/pubDate>/)![1],
    }));
    expect(new Set(items.map((item) => item.id))).toEqual(new Set(companies.map((c) => c.id)));
    const companyById = new Map(companies.map((c) => [c.id, c]));
    for (const item of items) {
      expect(item.pubDate, item.id).toBe(companyPageModified(companyById.get(item.id)!, LIVE).toUTCString());
    }
    for (let index = 1; index < items.length; index++) {
      const previous = items[index - 1], current = items[index];
      const previousTime = Date.parse(previous.pubDate), currentTime = Date.parse(current.pubDate);
      expect(previousTime).toBeGreaterThanOrEqual(currentTime);
      if (previousTime === currentTime) expect(previous.id < current.id).toBe(true);
    }
  });

  it("sitemap.ts 는 회사 객체를 통째로 companyPageModified 에 넘긴다 (대상 판정이 salary·disclosed 를 읽는다)", () => {
    const src = fs.readFileSync(path.join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    expect(src).toMatch(/allCompanies\.forEach\(\(company: CompanyProfile\) =>/);
    expect(src).toContain("lastModified: companyPageModified(company)");
  });
});

describe("A4' 공시 카드 출처 라벨·출처 문구 — 적용 후, 줄 길이 불변 이하", () => {
  it("라벨 규칙: 주입 카드 '출처(공시 원문):', 수기 원문 '원문:', 보도 '보도:', 링크 없음 '출처:'", () => {
    const dart = "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=1";
    expect(disclosedSourceLabel({ basis: "reported", sourceUrl: dart })).toBe("출처(공시 원문):");
    expect(disclosedSourceLabel({ basis: "computed", sourceUrl: dart })).toBe("출처(공시 원문):");
    expect(disclosedSourceLabel({ sourceUrl: dart })).toBe("원문:");
    expect(disclosedSourceLabel({ sourceUrl: "https://www.alio.go.kr/item/x" })).toBe("원문:");
    expect(disclosedSourceLabel({ sourceUrl: "https://www.newsis.com/view/1" })).toBe("보도:");
    expect(disclosedSourceLabel({})).toBe("출처:");
    // 수기 카드 라벨은 종전 '출처:'와 같은 글자 수(한글 2 + 콜론) — 출처 문구를 줄일 수 없는 카드
    expect("원문:".length).toBe("출처:".length);
    expect("보도:".length).toBe("출처:".length);
  });

  it("출처 문구 표시 규칙: 적용 후에만 DART 주입 꼬리를 끝에서 뺀다, 그 밖의 문구는 그대로", () => {
    const injected = `${INJECTED_SOURCE_SAMPLE}${DART_INJECTED_SOURCE_TAIL}`;
    expect(DART_INJECTED_SOURCE_TAIL).toBe(" — OpenDART 수집");
    expect(displayedDisclosedSource(injected, false)).toBe(injected);
    expect(displayedDisclosedSource(injected, true)).toBe(INJECTED_SOURCE_SAMPLE);
    // 꼬리가 끝에 있지 않은 문구(수기 큐레이션)는 건드리지 않는다
    const curated = "연합뉴스 보도 — OpenDART 수집 자료 인용";
    expect(displayedDisclosedSource(curated, true)).toBe(curated);
    // 기본값 = 빌드 시각 게이트
    at(BEFORE);
    expect(displayedDisclosedSource(injected)).toBe(injected);
    at(LIVE);
    expect(displayedDisclosedSource(injected)).toBe(INJECTED_SOURCE_SAMPLE);
  });

  it("전 공시 카드: 새 라벨 + 표시 문구, 동일 데이터의 게이트 전 출처 줄보다 길어지지 않는다", () => {
    at(LIVE);
    let injected = 0;
    for (const c of companies) {
      const d = c.disclosed;
      if (!d) continue;
      const html = renderCard(c);
      const label = disclosedSourceLabel(d);
      const shown = displayedDisclosedSource(d.source, true);
      expect(html, c.id).toContain(`${label} <a href=`);
      expect(html, c.id).toContain(`>${escapeHtml(shown)}<svg`);
      expect(`${label} ${shown}`.length, c.id).toBeLessThanOrEqual(
        `출처: ${d.source}`.length
      );
      if (d.basis) {
        injected++;
        expect(d.source.endsWith(DART_INJECTED_SOURCE_TAIL), c.id).toBe(true);
        expect(shown, c.id).not.toContain("OpenDART 수집");
        expect(html, c.id).not.toContain("OpenDART 수집");
        expect(label, c.id).toBe("출처(공시 원문):");
      } else {
        expect(shown, c.id).toBe(d.source);
      }
    }
    expect(injected).toBeGreaterThan(200);
  });

  it("회사 연봉 FAQ: 현재 데이터의 출처 표시만 바뀌고 게이트 전후 다른 문장은 같다", () => {
    for (const c of companies) {
      at(BEFORE);
      const before = buildCompanySalaryFaq(c);
      at(LIVE);
      const faq = buildCompanySalaryFaq(c);
      const d = c.disclosed;
      if (!d) {
        expect(faq, c.id).toEqual(before);
        continue;
      }
      const shown = displayedDisclosedSource(d.source, true);
      expect(faq[0].answer, c.id).toContain(`공시 인용 출처: ${shown}. `);
      if (d.basis) expect(faq[0].answer, c.id).not.toContain("OpenDART 수집");
      // Compare both gates using the same current data, independently of historical snapshots.
      const restored = faq.map((item, i) =>
        i === 0
          ? {
              ...item,
              answer: item.answer.replace(
                `공시 인용 출처: ${shown}. `,
                `공시 인용 출처: ${d.source}. `
              ),
            }
          : item
      );
      expect(restored, c.id).toEqual(before);
    }
  });
});
