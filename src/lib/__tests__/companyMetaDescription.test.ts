// L10'(승인⑧) 회사 meta description 회귀 가드 — A7'·A4'·COMP-06 동봉 (2026-09-25 준비, 2026-10-01 KST 적용)
//
//  - 회사 <title> 은 영구 불변: 전 회사 제목을 fixtures/companyTitles-2026-09-25.json(58b8876d 출력 그대로)과
//    적용 전·후 두 시점 모두 대조한다.
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
const snapshot = titleSnapshot as Record<string, string>;
const pre = preGateSnapshot as {
  descriptions: Record<string, string>;
  disclosedSources: Record<string, string>;
  cardSha256: Record<string, string>;
  salaryFaqSha256: Record<string, string>;
};
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
  ])("%s: <title> 이 58b8876d 출력과 문자열 그대로 같다", (_label, when) => {
    at(when);
    for (const c of companies) {
      expect(metaOf(c).title, c.id).toBe(snapshot[c.id]);
      expect(companyPageTitleAndDescription(c).title, c.id).toBe(snapshot[c.id]);
    }
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
      expect(description.startsWith(`${c.name.ko}`), c.id).toBe(true);
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
      expect(description.startsWith(`${c.name.ko} 연봉 자체 추정치:`), c.id).toBe(true);
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
    const ids = companies.map((c) => c.id).sort();
    expect(Object.keys(pre.descriptions).sort()).toEqual(ids);
    expect(Object.keys(pre.salaryFaqSha256).sort()).toEqual(ids);
    const disclosedIds = companies.filter((c) => c.disclosed).map((c) => c.id).sort();
    expect(Object.keys(pre.disclosedSources).sort()).toEqual(disclosedIds);
    expect(Object.keys(pre.cardSha256).sort()).toEqual(disclosedIds);
  });

  it("description·og·twitter·RSS description 이 전 회사 bd68d860 출력과 같다", () => {
    at(BEFORE);
    for (const c of companies) {
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
    for (const c of companies) {
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
    for (const c of companies) {
      const faq = buildCompanySalaryFaq(c);
      expect(sha256(JSON.stringify(faq)), c.id).toBe(pre.salaryFaqSha256[c.id]);
      if (c.disclosed) {
        expect(faq[0].answer, c.id).toContain(`공시 인용 출처: ${pre.disclosedSources[c.id]}. `);
      }
    }
  });

  it("페이지 수정일은 전 회사 max(데이터일, FAQ 검수일) 그대로 — 적용일로 오르지 않는다", () => {
    at(BEFORE);
    for (const c of companies) {
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
        expect(new Date(after).toISOString().slice(0, 10), c.id).toBe("2026-10-01");
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

  it("rss-companies.xml: 적용 후 대상 회사가 적용일 pubDate 로 맨 앞에 온다", async () => {
    at(LIVE);
    const xml = await (await rssCompaniesGET()).text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => ({
      id: m[1].match(/<guid[^>]*>https:\/\/www\.moneysalary\.com\/salary-db\/([^<]+)<\/guid>/)![1],
      pubDate: m[1].match(/<pubDate>([^<]+)<\/pubDate>/)![1],
    }));
    const eligibleIds = new Set(companies.filter((c) => companyMetaDisclosedFigure(c)).map((c) => c.id));
    const head = items.slice(0, eligibleIds.size);
    expect(new Set(head.map((i) => i.id))).toEqual(eligibleIds);
    for (const i of head) expect(i.pubDate).toBe(new Date(META_DAY).toUTCString());
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

  it("전 공시 카드: 새 라벨 + 표시 문구, 출처 줄 글자 수가 종전('출처: ' + bd68d860 출처 문구) 이하", () => {
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
        `출처: ${pre.disclosedSources[c.id]}`.length
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

  it("회사 연봉 FAQ: '공시 인용 출처' 가 카드와 같은 표시 문구, 그 밖의 문장은 bd68d860 과 같다", () => {
    at(LIVE);
    for (const c of companies) {
      const faq = buildCompanySalaryFaq(c);
      const d = c.disclosed;
      if (!d) {
        expect(sha256(JSON.stringify(faq)), c.id).toBe(pre.salaryFaqSha256[c.id]);
        continue;
      }
      const shown = displayedDisclosedSource(d.source, true);
      expect(faq[0].answer, c.id).toContain(`공시 인용 출처: ${shown}. `);
      if (d.basis) expect(faq[0].answer, c.id).not.toContain("OpenDART 수집");
      // 출처 문구만 종전으로 되돌리면 병합 전 FAQ 와 바이트 동일 — 다른 문장은 바뀌지 않았다
      const restored = faq.map((item, i) =>
        i === 0
          ? {
              ...item,
              answer: item.answer.replace(
                `공시 인용 출처: ${shown}. `,
                `공시 인용 출처: ${pre.disclosedSources[c.id]}. `
              ),
            }
          : item
      );
      expect(sha256(JSON.stringify(restored)), c.id).toBe(pre.salaryFaqSha256[c.id]);
    }
  });
});
