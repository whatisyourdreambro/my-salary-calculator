// rss.xml 본문 전문(content:encoded) 회귀 테스트 (2026-09-26 NAVER-03b)
//
// 배경: 네이버 서치어드바이저 요청 피드는 item 에 요약이 아닌 전문을 요구한다. 9/26 운영 rss.xml 은
// 240,707바이트·337 item·content:encoded 0개였다(네임스페이스만 선언). 최신 가이드 50편에 본문 HTML 을 싣는다.
// rssCompanies.test.ts 처럼 실제 GET 핸들러 출력(XML 문자열)을 정규식으로 분해한다 — XML 파서 의존성 추가 금지.

import { describe, expect, it } from "vitest";
import { GET } from "@/app/rss.xml/route";
import { koGuides } from "@/lib/guidesContent";
import { reportsRegistry } from "@/data/reportsRegistry";
import { getGuideModifiedDate } from "@/lib/guideDates";
import { absolutizeUrl, cdata, contentEncoded, feedHtml } from "@/lib/rssFullText";

const BASE = "https://www.moneysalary.com";
const CDATA_OPEN = "<![CDATA[";
const CDATA_CLOSE = "]]>";

interface ParsedItem {
  guid: string;
  pubDate: string;
  body: string;
  encoded: string[];
}

async function loadFeed(): Promise<string> {
  const res = await GET();
  expect(res.headers.get("Content-Type")).toContain("application/xml");
  return res.text();
}

/** CDATA 섹션을 빼고 남은 마크업 — 여닫는 태그·이스케이프 검사는 여기서만 한다 */
const stripCdata = (xml: string) => xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");

/** content:encoded 안의 CDATA 조각들을 이어 붙여 원문 HTML 을 복원한다 */
const decodeCdata = (inner: string) =>
  [...inner.matchAll(/<!\[CDATA\[([\s\S]*?)\]\]>/g)].map((m) => m[1]).join("");

function parseItems(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const body = m[1];
    const pick = (tag: string) => body.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))?.[1] ?? "";
    const encoded = [...body.matchAll(/<content:encoded>([\s\S]*?)<\/content:encoded>/g)].map((e) => e[1]);
    items.push({ guid: pick("guid"), pubDate: pick("pubDate"), body, encoded });
  }
  return items;
}

const guideSlug = (guid: string) =>
  guid.startsWith(`${BASE}/guides/`) ? guid.slice(`${BASE}/guides/`.length) : null;
const bySlug = new Map(koGuides.map((g) => [g.slug, g]));

describe("rss.xml — 최신 가이드 50편 본문 전문", () => {
  it("content:encoded 는 정확히 50개, 피드 첫 50개 가이드 item 에만 있다", async () => {
    const xml = await loadFeed();
    expect((xml.match(/<content:encoded>/g) ?? []).length).toBe(50);
    expect((xml.match(/<\/content:encoded>/g) ?? []).length).toBe(50);

    const items = parseItems(xml);
    const guides = items.filter((i) => guideSlug(i.guid));
    guides.forEach((item, idx) => {
      expect(item.encoded.length, item.guid).toBe(idx < 50 ? 1 : 0);
    });
    // 리포트 item 은 종전 그대로
    for (const item of items.filter((i) => !guideSlug(i.guid))) expect(item.encoded).toEqual([]);
    expect(items.length).toBe(koGuides.length + reportsRegistry.length);
  });

  it("전문 대상 = (modifiedDate ?? publishedDate) 내림차순 최신 50편", async () => {
    const items = parseItems(await loadFeed());
    const withText = items.filter((i) => i.encoded.length).map((i) => bySlug.get(guideSlug(i.guid)!)!);
    const withoutText = koGuides.filter((g) => !withText.includes(g));
    const oldestWithText = Math.min(...withText.map((g) => Date.parse(getGuideModifiedDate(g))));
    const newestWithout = Math.max(...withoutText.map((g) => Date.parse(getGuideModifiedDate(g))));
    expect(oldestWithText).toBeGreaterThanOrEqual(newestWithout);
    // 가장 최근 수정 가이드는 반드시 포함
    const newest = Math.max(...koGuides.map((g) => Date.parse(getGuideModifiedDate(g))));
    for (const g of koGuides.filter((x) => Date.parse(getGuideModifiedDate(x)) === newest).slice(0, 50)) {
      expect(withText, g.slug).toContain(g);
    }
  });

  it("본문 = 가이드 content 를 절대 URL 로 바꾼 것 — 상대 href/src 없음", async () => {
    const items = parseItems(await loadFeed());
    let rewritten = 0;
    for (const item of items.filter((i) => i.encoded.length)) {
      const guide = bySlug.get(guideSlug(item.guid)!)!;
      const html = decodeCdata(item.encoded[0]);
      expect(html).toBe(feedHtml(guide.content, item.guid));
      expect(html, item.guid).not.toMatch(/\s(?:href|src)\s*=\s*["'](?![a-z][a-z0-9+.-]*:)/i);
      expect(html).not.toMatch(/<(?:script|iframe)\b/i);
      rewritten += (guide.content.match(/\shref="\//g) ?? []).length;
    }
    expect(rewritten).toBeGreaterThan(0); // 실제로 상대 링크가 있던 본문을 검사했는지
  });

  it("피드 정합 — CDATA 균형 · 이스케이프 · 여닫는 item 수 · 3MB 미만", async () => {
    const xml = await loadFeed();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8" ?>')).toBe(true);
    expect(xml).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');
    expect(xml.trimEnd().endsWith("</channel></rss>")).toBe(true);
    expect(xml.split(CDATA_OPEN).length).toBe(xml.split(CDATA_CLOSE).length);
    // 모든 CDATA 가 content:encoded 안에만 있고, 닫힘 뒤에는 다음 CDATA 나 </content:encoded> 만 온다
    const outside = stripCdata(xml);
    expect(outside).not.toContain(CDATA_OPEN);
    expect(outside).not.toContain(CDATA_CLOSE);
    expect(outside).toMatch(/<content:encoded><\/content:encoded>/);
    expect(outside.replace(/<content:encoded><\/content:encoded>/g, "")).not.toContain("content:encoded");
    expect((outside.match(/<item>/g) ?? []).length).toBe((outside.match(/<\/item>/g) ?? []).length);
    expect(outside).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/);
    // XML 1.0 금지 제어 문자 없음
    // eslint-disable-next-line no-control-regex
    expect(xml).not.toMatch(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/);
    const size = Buffer.byteLength(xml, "utf8");
    expect(size).toBeLessThan(3_000_000);
    expect(size).toBeGreaterThan(500_000); // 전문이 실제로 실렸는지 (종전 약 0.24MB)
  });
});

describe("rssFullText — 가공 규칙", () => {
  const page = `${BASE}/guides/sample`;

  it("']]>' 는 CDATA 를 끊고 다시 열어 복원하면 원문과 같다", () => {
    const text = "a]]>b]]>]]>c";
    const wrapped = cdata(text);
    expect(wrapped).toBe("<![CDATA[a]]]]><![CDATA[>b]]]]><![CDATA[>]]]]><![CDATA[>c]]>");
    expect(decodeCdata(wrapped)).toBe(text);
    expect(stripCdata(wrapped)).toBe("");
  });

  it("상대 href/src → 절대 URL, 스킴 있는 값·data-src 는 그대로", () => {
    const html =
      '<p><a href="/calc/salary">계산기</a> <a href=\'/glossary/국민연금\'>용어</a>' +
      ' <a href="#faq">FAQ</a> <a href="other">상대</a> <a href="//cdn.example.com/x">cdn</a>' +
      ' <img src="/og.png" data-src="/lazy.png"> <a href="https://www.law.go.kr/">법령</a>' +
      ' <a href="mailto:help@example.com">메일</a></p>';
    const out = feedHtml(html, page);
    expect(out).toContain(`href="${BASE}/calc/salary"`);
    expect(out).toContain(`href='${BASE}/glossary/국민연금'`);
    expect(out).toContain(`href="${page}#faq"`);
    expect(out).toContain(`href="${BASE}/guides/other"`);
    expect(out).toContain('href="https://cdn.example.com/x"');
    expect(out).toContain(`src="${BASE}/og.png"`);
    expect(out).toContain('data-src="/lazy.png"');
    expect(out).toContain('href="https://www.law.go.kr/"');
    expect(out).toContain('href="mailto:help@example.com"');
    expect(absolutizeUrl("", page)).toBe("");
  });

  it("script·iframe 제거(짝 있는 것·단독 태그 모두), 나머지 본문은 보존", () => {
    const html =
      '<h2>제목</h2><script>alert(1)</script><p>본문</p>' +
      '<iframe src="https://www.law.go.kr/x"></iframe><iframe src="/y" /><SCRIPT src="/z.js"></SCRIPT><p>끝</p>';
    expect(feedHtml(html, page)).toBe("<h2>제목</h2><p>본문</p><p>끝</p>");
  });

  it("XML 금지 제어 문자 제거, content:encoded 로 감싼다", () => {
    expect(feedHtml("a\u0001b\u000Bc\td\ne", page)).toBe("abc\td\ne");
    expect(contentEncoded('<a href="/x">x</a>]]>', page)).toBe(
      `<content:encoded><![CDATA[<a href="${BASE}/x">x</a>]]]]><![CDATA[>]]></content:encoded>`
    );
  });
});
