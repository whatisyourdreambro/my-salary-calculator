// rss.xml — /insights 데이터 리포트 합류 회귀 테스트 (2026-09-05 google-authority-7)
//
// 배경: rss.xml이 koGuides만 발행해 리포트 3편이 어떤 피드에도 없었다. 10/5 서치어드바이저
// rss.xml 제출 전 리포트 item 포함·guid 중복 없음(2026-08-08 guid 중복 사고 재발 방지)·
// 채널 pubDate = 가이드/리포트 최신일 max 를 실제 GET 핸들러 출력(XML 문자열)으로 검증한다.
// XML 파서 의존성 추가 금지 — 정규식으로 <item> 블록만 분해한다.

import { describe, expect, it } from "vitest";
import { GET } from "@/app/rss.xml/route";
import { reportsRegistry } from "@/data/reportsRegistry";
import { koGuides } from "@/lib/guidesContent";

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
      // pubDate = updatedDate (갱신 시 피드 상단 재노출)
      const parsed = new Date(item!.pubDate);
      expect(Number.isNaN(parsed.getTime()), `pubDate 파싱 실패: ${item!.pubDate}`).toBe(false);
      expect(parsed.toUTCString()).toBe(new Date(report.updatedDate).toUTCString());
    }
  });

  it("guid 중복 없음 (가이드 + 리포트 전체)", async () => {
    const items = parseItems(await loadFeed());
    const guids = items.map((i) => i.guid);
    expect(guids.length).toBe(koGuides.length + reportsRegistry.length);
    expect(new Set(guids).size).toBe(guids.length);
  });

  it("item 은 날짜 내림차순, 채널 pubDate = 가이드 발행일·리포트 갱신일 중 최신", async () => {
    const xml = await loadFeed();
    const items = parseItems(xml);
    const times = items.map((i) => new Date(i.pubDate).getTime());
    for (let k = 1; k < times.length; k += 1) {
      expect(times[k - 1]).toBeGreaterThanOrEqual(times[k]);
    }

    const latestGuide = Math.max(...koGuides.map((g) => new Date(g.publishedDate).getTime()));
    const latestReport = Math.max(...reportsRegistry.map((r) => new Date(r.updatedDate).getTime()));
    const channelPubDate = xml.match(/<channel>[\s\S]*?<pubDate>([^<]*)<\/pubDate>/)?.[1] ?? "";
    expect(new Date(channelPubDate).getTime()).toBe(Math.max(latestGuide, latestReport));
  });

  it("리포트 updatedDate 는 ISO YYYY-MM-DD (listed-avg-salary 는 DART 스냅샷일과 max 파생)", () => {
    for (const report of reportsRegistry) {
      expect(report.updatedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(report.updatedDate >= report.publishedDate).toBe(true);
    }
  });
});
