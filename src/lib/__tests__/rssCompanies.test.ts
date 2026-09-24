// rss-companies.xml 회귀 테스트 (2026-09-25 B7, SEO-CRAWL-03)
//
// 배경: 피드가 `.slice(0, 200)` 으로 8/23 동률 회사를 id 알파벳순으로 잘라(abl-bio…semes)
// 삼성전자·SK하이닉스·현대차 등이 빠져 있었고, pubDate(데이터 lastUpdated)가 sitemap
// lastmod(max(lastUpdated, 회사 FAQ 검수일))와 어긋나 있었다. 10/5 네이버 재제출 전 고정.
// 실제 GET 핸들러 출력(XML 문자열)을 정규식으로 분해해 검증한다 — XML 파서 의존성 추가 금지.

import { describe, expect, it } from "vitest";
import { GET } from "@/app/rss-companies.xml/route";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { companyPageModified } from "@/lib/pageModified";
import {
  companyMetadataInput,
  companyPageTitleAndDescription,
  metadataTitleText,
} from "@/lib/companyPageMetadata";
import { getCompanySalaryBasis } from "@/lib/companySalaryBasis";
import { buildCompanyMetadata } from "@/lib/seo";
import { COMPANY_FAQ_REVIEW_DATE, STATIC_LAST_MODIFIED } from "@/config/siteDates";

const BASE = "https://www.moneysalary.com";

interface ParsedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

const unescapeXml = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

function parseItems(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const body = m[1];
    const pick = (tag: string) =>
      unescapeXml(body.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))?.[1] ?? "");
    items.push({
      title: pick("title"),
      link: pick("link"),
      description: pick("description"),
      pubDate: pick("pubDate"),
      guid: pick("guid"),
    });
  }
  return items;
}

async function loadFeed(): Promise<string> {
  const res = await GET();
  expect(res.headers.get("Content-Type")).toContain("application/xml");
  return res.text();
}

const companies = companyRepository.getAll();
const byId = new Map(companies.map((c) => [c.id, c]));
const idOf = (url: string) => url.slice(`${BASE}/salary-db/`.length);

describe("companyPageModified — sitemap lastmod · RSS pubDate 공용 규칙", () => {
  it("데이터일이 FAQ 검수일보다 늦으면 데이터일, 이르거나 없거나 깨졌으면 FAQ 검수일", () => {
    const later = new Date(COMPANY_FAQ_REVIEW_DATE.getTime() + 5 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    expect(companyPageModified({ lastUpdated: later }).toISOString()).toBe(
      new Date(later).toISOString()
    );
    expect(companyPageModified({ lastUpdated: "2026-08-23" }).toISOString()).toBe(
      COMPANY_FAQ_REVIEW_DATE.toISOString()
    );
    expect(companyPageModified({}).toISOString()).toBe(COMPANY_FAQ_REVIEW_DATE.toISOString());
    expect(companyPageModified({ lastUpdated: "not-a-date" }).toISOString()).toBe(
      COMPANY_FAQ_REVIEW_DATE.toISOString()
    );
    // 폴백 데이터일(STATIC_LAST_MODIFIED)이 FAQ 검수일보다 이르다는 전제 — 순서가 바뀌면 규칙 재검토
    expect(STATIC_LAST_MODIFIED.getTime()).toBeLessThan(COMPANY_FAQ_REVIEW_DATE.getTime());
  });

  it("공유 상수를 돌려주지 않는다 (호출부가 결과를 바꿔도 기준일 불변)", () => {
    const d = companyPageModified({});
    d.setUTCFullYear(2000);
    expect(COMPANY_FAQ_REVIEW_DATE.toISOString().slice(0, 10)).toBe("2026-09-10");
  });
});

describe("companyMetadataInput — 회사 페이지 <title> 불변 이동", () => {
  it("page.tsx 에 있던 인자 조립과 전 회사에서 동일하다", () => {
    for (const c of companies) {
      const total = (lv: "junior" | "senior" | "lead") =>
        c.salary[lv].base + (c.salary[lv].incentive.avgAmount || 0);
      expect(companyMetadataInput(c)).toEqual({
        id: c.id,
        name: c.name.ko,
        industry: c.industry,
        averageSalary: getCompanySalaryBasis(c).entryTotalWon,
        seniorSalary: total("senior"),
        juniorSalary: total("junior"),
        leadSalary: total("lead"),
        aliases: c.aliases,
        hasCareerLevels: !!c.careerLevels?.length,
        lastUpdated: c.lastUpdated,
      });
    }
  });

  it("title 은 buildCompanyMetadata 의 absolute 제목(사이트명 포함)이다", () => {
    const samsung = byId.get("samsung-electronics")!;
    const { title, description } = companyPageTitleAndDescription(samsung);
    const meta = buildCompanyMetadata(companyMetadataInput(samsung));
    expect(title).toBe(metadataTitleText(meta.title));
    expect(title.startsWith("삼성전자 연봉 2026 — ")).toBe(true);
    expect(title.endsWith(" | 머니샐러리")).toBe(true);
    expect(description).toBe(meta.description);
    expect(description.length).toBeGreaterThan(40);
  });
});

describe("rss-companies.xml — 정본 회사 전체 · sitemap 과 같은 수정일", () => {
  it("정본 회사 전체(약 430곳)가 실리고 네이버 상위 회사가 빠지지 않는다", async () => {
    const items = parseItems(await loadFeed());
    expect(items.length).toBe(companies.length);
    expect(items.length).toBeGreaterThanOrEqual(400);
    const ids = new Set(items.map((i) => idOf(i.guid)));
    for (const id of ["samsung-electronics", "sk-hynix", "naver", "kakao", "hyundai", "toss", "kt", "woori-bank"]) {
      expect(ids.has(id), `피드 누락: ${id}`).toBe(true);
    }
  });

  it("guid 중복 없음 · link = guid = /salary-db/{정본 id}", async () => {
    const items = parseItems(await loadFeed());
    expect(new Set(items.map((i) => i.guid)).size).toBe(items.length);
    for (const item of items) {
      expect(item.link).toBe(item.guid);
      expect(byId.has(idOf(item.guid)), `정본에 없는 id: ${item.guid}`).toBe(true);
    }
  });

  it("pubDate = companyPageModified(sitemap lastmod 와 같은 함수) · 정렬 = 수정일 내림차순 + id 오름차순", async () => {
    const xml = await loadFeed();
    const items = parseItems(xml);
    items.forEach((item, idx) => {
      const c = byId.get(idOf(item.guid))!;
      expect(item.pubDate).toBe(companyPageModified(c).toUTCString());
      if (idx === 0) return;
      const prev = items[idx - 1];
      const dt = Date.parse(prev.pubDate) - Date.parse(item.pubDate);
      expect(dt).toBeGreaterThanOrEqual(0);
      if (dt === 0) expect(idOf(prev.guid) < idOf(item.guid)).toBe(true);
    });
    // 채널 pubDate = 첫 item
    const channelHead = xml.slice(0, xml.indexOf("<item>"));
    const channelPub = channelHead.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1];
    expect(channelPub).toBe(items[0].pubDate);
  });

  it("item title·description = 회사 페이지 <title>·meta description 문자열 그대로", async () => {
    const items = parseItems(await loadFeed());
    for (const item of items) {
      const c = byId.get(idOf(item.guid))!;
      const page = companyPageTitleAndDescription(c);
      expect(item.title).toBe(page.title);
      expect(item.description).toBe(page.description);
      expect(item.title.length).toBeGreaterThan(0);
    }
  });

  it("XML 기본 정합 — 여닫는 item 수 일치 · 이스케이프 안 된 & 없음 · 선언/루트 정상", async () => {
    const xml = await loadFeed();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8" ?>')).toBe(true);
    expect(xml.trimEnd().endsWith("</channel></rss>")).toBe(true);
    expect((xml.match(/<item>/g) ?? []).length).toBe((xml.match(/<\/item>/g) ?? []).length);
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/);
    // 크기 가드 — 전체 수록 후 약 0.3MB. 1MB 를 넘으면 item 구조가 커진 것이므로 재검토.
    expect(Buffer.byteLength(xml, "utf8")).toBeLessThan(1_000_000);
  });
});
