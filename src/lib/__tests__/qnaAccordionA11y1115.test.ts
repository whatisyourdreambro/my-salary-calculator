// N2-app-pages-04 (2026-11-15 감사 app-pages-b05-F06) — /qna 아코디언 접근성 회귀 가드.
//
// 답 59개는 FAQPage 구조화 데이터와 맞추려고 항상 DOM 에 있고 grid-rows-[0fr] 로만 접힌다. 그래서 접힌 답의 링크(항목당 2개,
// 약 116개)가 탭 순서에 남았고, 토글 버튼은 열림·닫힘 상태를 알리지 않았다.
// -> 버튼 aria-expanded·aria-controls, 접힘 래퍼 id·inert={!isActive}. 속성만 추가(클래스·문구·배치 불변), 광고는 래퍼 밖.
import { createElement, type AnchorHTMLAttributes } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-ad": "coupang" }) }));

import QnaPageClient, { type QnaListItem } from "@/app/qna/QnaPageClient";
import { qnaData, toQnaSlug } from "@/data/qnaData";

const flat = (s: string) => s.replace(/\s+/g, " ");
const src = flat(readFileSync(resolve(process.cwd(), "src/app/qna/QnaPageClient.tsx"), "utf8"));
const items: QnaListItem[] = qnaData.map((item) => ({ ...item, slug: toQnaSlug(item.question) }));
const html = renderToStaticMarkup(createElement(QnaPageClient, { items }));

describe("/qna 아코디언 상태 알림과 탭 순서", () => {
  it("토글 버튼에 aria-expanded·aria-controls, 접힘 래퍼에 같은 id 와 inert 를 둔다", () => {
    expect(src).toContain("aria-expanded={isActive} aria-controls={`qna-panel-${item.slug}`}");
    expect(src).toContain("id={`qna-panel-${item.slug}`} inert={!isActive}");
  });

  it("첫 화면에는 첫 답 하나만 열려 있고 나머지 답은 모두 inert 다", () => {
    const panels = html.match(/<div id="qna-panel-[^"]+"[^>]*>/g) ?? [];
    expect(panels.length).toBe(items.length);
    const inertCount = panels.filter((tag) => /\sinert=""/.test(tag)).length;
    expect(inertCount).toBe(items.length - 1);
    expect(html.match(/aria-expanded="true"/g)?.length).toBe(1);
    expect(html.match(/aria-expanded="false"/g)?.length).toBe(items.length - 1);
  });

  it("aria-controls 는 실제 래퍼 id 를 가리키고 id 는 공백 없이 유일하다", () => {
    const ids = items.map((i) => `qna-panel-${i.slug}`);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).not.toMatch(/\s/);
      expect(html).toContain(`aria-controls="${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("답은 여전히 DOM 에 있다(FAQPage 일치) — 마지막 질문의 결론도 렌더된다", () => {
    const last = items[items.length - 1];
    expect(html).toContain(`href="/qna/${last.slug}"`);
  });

  it("광고는 접힘 래퍼 안에 들어가지 않는다", () => {
    // 각 래퍼는 '이 질문 전용 페이지 보기' 링크로 끝난다 — 그 사이에 광고 자리가 없어야 한다.
    const panels = html.split('<div id="qna-panel-').slice(1);
    expect(panels.length).toBe(items.length);
    for (const p of panels) {
      const body = p.slice(0, p.indexOf("이 질문 전용 페이지 보기"));
      expect(body.length).toBeGreaterThan(0);
      expect(body).not.toContain("data-test-ad");
    }
    expect(html).toContain('data-test-ad="home-top"');
    expect(html).toContain('data-test-ad="in-article"');
  });
});
