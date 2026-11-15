// '이어서 확인할 내용'(TopicNextSteps) 상자 — 2026-11-15 SEASONA 로 더한 행 고정
// 상자는 렌더 위치가 모든 광고 뒤인 곳에서만 키를 더한다:
//  - calc/layout: InArticleAd·쿠팡·HomeTopAd → 공유 → CalcNewsNote → TopicNextSteps (아래 위치 검사)
// 키를 더하면 PAGE_LINK_REVIEW_PATHS 에도 들어간다(사이트맵 날짜 하한 2026-10-19 — 실제 수정일은 통합 원장 단계가 올린다).
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TOPIC_NEXT_STEPS, getTopicNextSteps } from "@/lib/topicNextSteps";
import { PAGE_LINK_REVIEW_PATHS } from "@/config/pageContentRevisions";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/components/AppLink", () => ({
  default: (props: Record<string, unknown>) => createElement("a", props),
}));

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const code = (p: string) => read(p).replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/^\s*\/\/.*$/gm, "");
const pageExists = (href: string) => existsSync(resolve(process.cwd(), "src/app", href.slice(1), "page.tsx"));

/** 이 묶음이 더한 행 (calc ideas[6]) */
const CALC_ROWS: Record<string, string[]> = {
  "/calc/year-end-bonus-tax": ["/calc/january-bonus", "/year-end-tax-2027", "/calc/bonus-calculators"],
  "/calc/year-end-bonus": ["/calc/january-bonus", "/year-end-tax-2027", "/calc/bonus-calculators"],
  "/calc/voluntary-retirement": ["/unemployment-benefit", "/tools/finance/irp", "/calc/severance-vs-pension"],
  "/calc/vacation-pay": ["/calc/annual-leave-days", "/calc/ordinary-wage", "/tools/finance/severance"],
  "/calc/severance-vs-pension": ["/tools/finance/severance", "/tools/finance/irp", "/calc/voluntary-retirement"],
  "/calc/smb-income-tax-break": ["/year-end-tax-2027", "/year-end-tax", "/calc/dependent-check"],
};

describe("calc/layout 의 TopicNextSteps 는 모든 광고 뒤", () => {
  it("InArticleAd·CoupangBanner·HomeTopAd 뒤, CalcNewsNote 뒤에 온다", () => {
    const layout = code("src/app/calc/layout.tsx");
    const at = (s: string) => layout.indexOf(s);
    for (const ad of ["<InArticleAd />", "<CoupangBanner", "<HomeTopAd />"]) {
      expect(at(ad), ad).toBeGreaterThan(-1);
      expect(at("<TopicNextSteps />"), ad).toBeGreaterThan(at(ad));
    }
    expect(at("<TopicNextSteps />")).toBeGreaterThan(at("<CalcNewsNote />"));
  });
});

describe("시즌·퇴직 계산기 6곳 (SEASONA calc ideas[6])", () => {
  it.each(Object.entries(CALC_ROWS))("%s 행", (source, targets) => {
    expect(TOPIC_NEXT_STEPS[source]).toEqual(targets);
    expect(pageExists(source), source).toBe(true);
    for (const href of targets) expect(pageExists(href), href).toBe(true);
    const cards = getTopicNextSteps(source);
    expect(cards.map((c) => c.href)).toEqual(targets);
    for (const card of cards) {
      expect(card.title.length, card.href).toBeGreaterThan(3);
      expect(card.description.length, card.href).toBeGreaterThan(20);
    }
    // 사이트맵 링크 검토 경로에 들어간다 — 통합 원장 단계가 실제 수정일로 날짜를 올린다
    expect(PAGE_LINK_REVIEW_PATHS.has(source)).toBe(true);
  });

  it("상자는 path 로 렌더되고 기존 모듈 id topic-next-steps 를 그대로 쓴다", async () => {
    const TopicNextSteps = (await import("@/components/TopicNextSteps")).default;
    const html = renderToStaticMarkup(createElement(TopicNextSteps, { path: "/calc/vacation-pay" }));
    expect(html).toContain('data-msy-module="topic-next-steps"');
    for (const href of CALC_ROWS["/calc/vacation-pay"]) expect(html).toContain(`href="${href}"`);
    expect(renderToStaticMarkup(createElement(TopicNextSteps, { path: "/calc/kia-bonus" }))).toBe("");
  });
});
