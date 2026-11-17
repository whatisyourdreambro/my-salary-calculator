// rss.xml — /insights 데이터 리포트 합류 회귀 테스트 (2026-09-05 google-authority-7)
//
// 배경: rss.xml이 koGuides만 발행해 리포트 3편이 어떤 피드에도 없었다. 10/5 서치어드바이저
// rss.xml 제출 전 리포트 item 포함·guid 중복 없음(2026-08-08 guid 중복 사고 재발 방지)·
// 채널 pubDate = 가이드/리포트 최신일 max 를 실제 GET 핸들러 출력(XML 문자열)으로 검증한다.
// XML 파서 의존성 추가 금지 — 정규식으로 <item> 블록만 분해한다.

import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/rss.xml/route";
import { reportsRegistry } from "@/data/reportsRegistry";
import { koGuides } from "@/lib/guidesContent";
import { getGuideSitemapDate } from "@/lib/guideSitemapDates";

const BASE = "https://www.moneysalary.com";

interface ParsedItem {
  guid: string;
  link: string;
  pubDate: string;
  categories: string[];
}

function parseItems(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const body = m[1];
    const pick = (tag: string) => body.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))?.[1] ?? "";
    const categories = [...body.matchAll(/<category>([^<]*)<\/category>/g)].map((c) => c[1]);
    items.push({ guid: pick("guid"), link: pick("link"), pubDate: pick("pubDate"), categories });
  }
  return items;
}

async function loadFeed(): Promise<string> {
  const res = await GET();
  expect(res.headers.get("Content-Type")).toContain("application/xml");
  return res.text();
}

describe("rss.xml — /insights 리포트 합류", () => {
  it("리포트 3편이 guid=/insights/<slug>·category '데이터 리포트'·유효 pubDate 로 실린다", async () => {
    const xml = await loadFeed();
    const items = parseItems(xml);
    expect(reportsRegistry.length).toBeGreaterThanOrEqual(3);

    for (const report of reportsRegistry) {
      const url = `${BASE}/insights/${report.slug}`;
      const item = items.find((i) => i.guid === url);
      expect(item, `리포트 item 누락: ${report.slug}`).toBeDefined();
      expect(item!.link).toBe(url);
      expect(item!.categories).toContain("데이터 리포트");
      // pubDate = 사이트맵 lastmod 와 같은 sitemapDate ?? updatedDate (갱신 시 피드 상단 재노출, app-data-pages-b02-F01)
      const parsed = new Date(item!.pubDate);
      expect(Number.isNaN(parsed.getTime()), `pubDate 파싱 실패: ${item!.pubDate}`).toBe(false);
      expect(parsed.toUTCString()).toBe(new Date(report.sitemapDate ?? report.updatedDate).toUTCString());
    }
  });

  it("guid 중복 없음 (가이드 + 리포트 전체)", async () => {
    const items = parseItems(await loadFeed());
    const guids = items.map((i) => i.guid);
    expect(guids.length).toBe(koGuides.length + reportsRegistry.length);
    expect(new Set(guids).size).toBe(guids.length);
  });

  it("item 은 날짜 내림차순, 채널 pubDate = 가이드 내용 수정일(사이트맵 lastmod)·리포트 갱신일 중 최신", async () => {
    const xml = await loadFeed();
    const items = parseItems(xml);
    const times = items.map((i) => new Date(i.pubDate).getTime());
    for (let k = 1; k < times.length; k += 1) {
      expect(times[k - 1]).toBeGreaterThanOrEqual(times[k]);
    }

    const latestGuide = Math.max(...koGuides.map((g) => new Date(getGuideSitemapDate(g)).getTime()));
    const latestReport = Math.max(...reportsRegistry.map((r) => new Date(r.sitemapDate ?? r.updatedDate).getTime()));
    const channelPubDate = xml.match(/<channel>[\s\S]*?<pubDate>([^<]*)<\/pubDate>/)?.[1] ?? "";
    expect(new Date(channelPubDate).getTime()).toBe(Math.max(latestGuide, latestReport));
  });

  // 2026-11-13 lens-crawl-F02: 피드 날짜 = 사이트맵 lastmod(getGuideSitemapDate). 종전 modifiedDate 비교는 본문 정정·보강일을 놓쳤다.
  it("가이드의 실제 수정일을 피드에 반영하고 기존 guid는 보존한다", async () => {
    const items = parseItems(await loadFeed());
    for (const guide of koGuides) {
      const item = items.find((entry) => entry.guid === `${BASE}/guides/${guide.slug}`);
      expect(item, guide.slug).toBeDefined();
      expect(new Date(item!.pubDate).toISOString().slice(0, 10), guide.slug)
        .toBe(getGuideSitemapDate(guide));
    }
  });

  it("리포트 updatedDate 는 ISO YYYY-MM-DD (listed-avg-salary 는 DART 스냅샷일과 max 파생)", () => {
    for (const report of reportsRegistry) {
      expect(report.updatedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(report.updatedDate >= report.publishedDate).toBe(true);
      if (report.sitemapDate) {
        expect(report.sitemapDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(report.sitemapDate >= report.updatedDate).toBe(true);
      }
    }
  });

  // 2026-11-15 app-data-pages-b02-F01: 성과급 리포트 표는 9/20·9/26·9/27(SK하이닉스 행)·10/4(본문)·10/8(출처 13칸)에 바뀌었다.
  // 2026-11-18 MOBIS(N2-calc-19, 68e172e7c): 현대모비스 2024 행 2개를 2026 타결 행 2개로 — 사이트맵·RSS 날짜 2026-11-18.
  // 화면 '최종 갱신' 칩·Article/Dataset 날짜는 광고 위라 측정 게시 때까지 updatedDate(9/3) 그대로, 사이트맵·RSS 만 실제 수정일.
  it("성과급 리포트: 사이트맵 lastmod·RSS = 2026-11-18, 화면·JSON-LD 날짜는 updatedDate 2026-09-03 그대로", () => {
    const report = reportsRegistry.find((r) => r.slug === "bonus-payout-history-2026")!;
    expect(report.updatedDate).toBe("2026-09-03");
    expect(report.sitemapDate).toBe("2026-11-18");
    // sitemap() 은 지연 require(@/...)를 써서 앱과 같은 tsx 경로 해석으로 실행한다(structuredDataTrust.test.ts 와 같은 방식, 네트워크 금지)
    const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
      const {default:sitemap}=require('./src/app/sitemap.ts');
      console.log(JSON.stringify(sitemap().filter(r=>new URL(r.url).pathname.startsWith('/insights/')).map(r=>({url:r.url,lastModified:new Date(r.lastModified).toISOString()}))));`;
    const entries: Array<{ url: string; lastModified: string }> = JSON.parse(
      execFileSync(process.execPath, ["--import", "tsx", "-e", fixture], { cwd: process.cwd(), encoding: "utf8", timeout: 60_000, maxBuffer: 4 * 1024 * 1024 }),
    );
    // 리포트 날짜는 ISO 날짜(UTC 자정) — 한국 날짜로 읽어도 같은 날이다(verify:sitemap 과 같은 읽기)
    const kstDay = (iso: string) => new Date(Date.parse(iso) + 9 * 3_600_000).toISOString().slice(0, 10);
    const lastmod = (slug: string) => {
      const hit = entries.filter((e) => e.url === `${BASE}/insights/${slug}`);
      expect(hit, slug).toHaveLength(1);
      return kstDay(hit[0].lastModified);
    };
    expect(lastmod("bonus-payout-history-2026")).toBe("2026-11-18");
    // 나머지 리포트는 sitemapDate 가 없고 사이트맵 날짜 = updatedDate
    for (const r of reportsRegistry.filter((x) => !x.sitemapDate)) expect(lastmod(r.slug), r.slug).toBe(r.updatedDate);
  }, 90_000);
});
