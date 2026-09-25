// L10'(승인⑧) 회사 meta description 회귀 가드 — A7'·A4'·COMP-06 동봉 (2026-09-25 준비, 2026-09-28 KST 적용)
//
//  - 회사 <title> 은 영구 불변: 전 회사 제목을 fixtures/companyTitles-2026-09-25.json(58b8876d 출력 그대로)과
//    적용 전·후 두 시점 모두 대조한다.
//  - 적용 후 description: 150자 이하 · '로그인 없이'(A7') · 'N월 업데이트'/'최신' 없음(COMP-06) ·
//    og:description = meta description, og:title = <title>(NV-8).
//  - 공시 평균연봉 후미(L10'): DART·알리오 원문 + 2025 사업연도 + 공시 1인평균 기준(산정치 제외) +
//    title '신입~시니어' 범위 안 회사만. 대상 수는 빌드마다 실측(2026-09-25 기준 164곳).
//  - 대상 회사만 페이지 수정일(sitemap lastmod·RSS pubDate)이 적용일로 오른다. 적용 전 빌드는 전부 종전 그대로.
//  - A4': 공시 카드 출처 줄 라벨 — 줄 길이가 종전보다 길어지지 않는다(광고 위 높이 불변).
// 시각은 vi.setSystemTime 으로 고정한다(게이트가 빌드 시각을 읽는다).

import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import titleSnapshot from "./fixtures/companyTitles-2026-09-25.json";
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
import { companyPageModified } from "@/lib/pageModified";
import { COMPANY_FAQ_REVIEW_DATE, COMPANY_META_DISCLOSED_DATE } from "@/config/siteDates";
import { formatManwonKorean } from "@/lib/manwonFormat";
import CompanyDisclosedSalary, { disclosedSourceLabel } from "@/components/CompanyDisclosedSalary";
import { GET as rssCompaniesGET } from "@/app/rss-companies.xml/route";
import type { CompanyProfile } from "@/types/company";

/** 9/27 23:59:59.999 KST — 적용 직전 */
const BEFORE = new Date("2026-09-27T14:59:59.999Z");
/** 9/28 00:00 KST — 적용 시작 */
const FROM = new Date("2026-09-27T15:00:00.000Z");
/** 적용 후 임의 시각(9/28 12:00 KST) */
const LIVE = new Date("2026-09-28T03:00:00.000Z");

function at(date: Date) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(date);
}

afterEach(() => {
  vi.useRealTimers();
});

const companies = companyRepository.getAll();
const snapshot = titleSnapshot as Record<string, string>;
const SUFFIX_RE = / 공시 평균연봉 (.+)\((\d{4}) 사업연도\)\.$/;

function metaOf(company: CompanyProfile) {
  const metadata = buildCompanyMetadata(companyMetadataInput(company));
  return {
    metadata,
    title: metadataTitleText(metadata.title),
    description: metadata.description ?? "",
  };
}

describe("L10' 적용 게이트 — 빌드 시점 KST 날짜", () => {
  it("2026-09-28 00:00 KST 부터 켜진다 (그 직전은 꺼짐)", () => {
    expect(COMPANY_META_DISCLOSED_DATE).toBe("2026-09-28");
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

describe("적용 전 빌드 — 종전 출력 그대로", () => {
  it("description 에 L10' 문구가 없고 종전 'N월 업데이트 기준' 꼬리를 유지한다", () => {
    at(BEFORE);
    for (const c of companies) {
      const { description } = metaOf(c);
      expect(description, c.id).not.toContain("로그인 없이");
      expect(description, c.id).not.toContain("공시 평균연봉");
      expect(description, c.id).toMatch(/업데이트 기준으로 확인하세요\.$|2026년 최신 기준으로 확인하세요\.$|협상 팁을 확인하세요\.$/);
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

  it("적용 후: 대상 회사만 적용일(2026-09-28)로, 비대상은 종전 값 그대로", () => {
    let bumped = 0;
    for (const c of companies) {
      const before = companyPageModified(c, BEFORE).getTime();
      const after = companyPageModified(c, LIVE).getTime();
      if (companyMetaDisclosedFigure(c)) {
        bumped++;
        expect(after, c.id).toBe(Math.max(before, META_DAY));
        expect(new Date(after).toISOString().slice(0, 10), c.id).toBe("2026-09-28");
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

describe("A4' 공시 카드 출처 라벨 — 줄 길이 불변 이하", () => {
  const OLD_DART_TAIL = " — OpenDART 수집";

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

  it("전 공시 카드: 출처 줄 글자 수가 종전('출처: ' + 종전 출처 문구) 이하", () => {
    let injected = 0;
    for (const c of companies) {
      const d = c.disclosed;
      if (!d) continue;
      const html = renderToStaticMarkup(createElement(CompanyDisclosedSalary, { company: c }));
      const label = disclosedSourceLabel(d);
      expect(html, c.id).toContain(`${label} <a href=`);
      // 주입 카드는 출처 문구에서 꼬리를 뺐다 — 종전 문구 = 현재 문구 + 꼬리
      const oldSource = d.basis ? `${d.source}${OLD_DART_TAIL}` : d.source;
      expect(`${label} ${d.source}`.length, c.id).toBeLessThanOrEqual(`출처: ${oldSource}`.length);
      if (d.basis) {
        injected++;
        expect(d.source, c.id).not.toContain("OpenDART 수집");
        expect(label, c.id).toBe("출처(공시 원문):");
      }
    }
    expect(injected).toBeGreaterThan(200);
  });
});
