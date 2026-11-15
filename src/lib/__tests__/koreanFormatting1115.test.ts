// N2-app-data-pages-04 (2026-11-15) — 광고를 움직이지 않는 조사·숫자 표기 네 가지.
//  (a) app-data-pages-b03-F08: 공시 업종 순위 FAQ '한국씨티은행로'·'SK텔레콤로'·'HMM로' → 받침에 맞는 '으로/로' (접힌 FAQ·FAQPage JSON-LD).
//  (b) app-data-pages-b03-F10: 회사 로드맵 차트 Y축 '15천만'·'22.5천만' → '1.5억'·'2.25억' (높이 고정 300px 상자 안 눈금 글자).
//  (c) app-data-pages-b04-F05: /salary FAQ 의 '약 1133만원' → 제목·설명과 같은 '약 1,133만원' (접힌 FAQ·JSON-LD).
//  (d) app-data-pages-b04-F06: /salary '다른 연봉 리포트' 링크 '연봉 14,000만원' → '연봉 1억 4,000만원' (마지막 본문 광고 GuideMidAd 아래).
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
  permanentRedirect: () => {
    throw new Error("redirect");
  },
}));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => null,
  Display2Ad: () => null,
  GuideMidAd: () => null,
  HomeTopAd: () => null,
  InArticleAd: () => null,
  MultiplexAd: () => null,
  SidebarAd: () => null,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/SalaryResultCard", () => ({ default: () => null }));
vi.mock("@/components/SalaryTierCard", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/RelatedGuides", () => ({ default: () => null }));
vi.mock("@/components/RelatedCompanies", () => ({ default: () => null }));
vi.mock("@/components/ListedSalaryBandTable", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/components/NextActions", () => ({ default: () => null }));
vi.mock("@/components/WealthChartLazy", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/CitationCopyButton", () => ({ default: () => null }));
vi.mock("@/app/table/2026/SeasonalLinks", () => ({ default: () => null }));
vi.mock("@/lib/relatedGuides", () => ({ getRelatedGuides: () => [] }));

import { DART_RANKING_YEAR, industryRankings } from "@/lib/salary-data/dartRanking";
import IndustryRankingPage from "@/app/salary-db/listed/industry/[industryId]/page";
import { formatRoadmapTick } from "@/app/salary-db/[id]/SalaryRoadmapChart";
import SalaryPage from "@/app/salary/[amount]/page";

type Ld = { "@type"?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
const ldBlocks = (html: string) =>
  [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const parsed = JSON.parse(m[1]) as Ld | Ld[];
    return Array.isArray(parsed) ? parsed : [parsed];
  });
const faqAnswers = (html: string) =>
  ldBlocks(html)
    .find((d) => d["@type"] === "FAQPage")!
    .mainEntity!.map((q) => q.acceptedAnswer.text);
const stripComments = (html: string) => html.replaceAll("<!-- -->", "");

describe("(a) 공시 업종 순위 FAQ — 1위 회사 조사 '으로/로'", () => {
  // 받침 있는 1위 회사(으로) — 검증자 재현 8곳: 부국증권·SK텔레콤·한국씨티은행·SK이노베이션·현대로템·HMM·롯데정밀화학·브이엠
  const CONSONANT_FINAL = ["securities", "telecom", "bank", "energy", "heavy-industry", "logistics", "chemical", "manufacturing"];

  it.each(industryRankings.map((r) => [r.industryId, r.topRows[0].nameKo] as const))(
    "%s: %s 뒤 조사가 받침에 맞다",
    async (industryId, top1) => {
      const html = renderToStaticMarkup(await IndustryRankingPage({ params: Promise.resolve({ industryId }) }));
      const answer = faqAnswers(html).find((a) => a.includes(`, ${DART_RANKING_YEAR} 공시 평균연봉 `))!;
      const particle = CONSONANT_FINAL.includes(industryId) ? "으로" : "로";
      expect(answer.startsWith(`${top1}${particle}, ${DART_RANKING_YEAR} 공시 평균연봉 `)).toBe(true);
      // 화면 FAQ(접힌 details)도 같은 문장
      expect(stripComments(html)).toContain(`${top1}${particle}, ${DART_RANKING_YEAR} 공시 평균연봉 `);
    },
  );

  it("검증자가 찾은 8개 업종이 모두 데이터에 있다", () => {
    const ids = industryRankings.map((r) => r.industryId);
    for (const id of CONSONANT_FINAL) expect(ids).toContain(id);
  });
});

describe("(b) 회사 로드맵 차트 Y축 눈금", () => {
  it.each([
    [150_000_000, "1.5억"],
    [225_000_000, "2.25억"],
    [100_000_000, "1억"],
    [200_000_000, "2억"],
    [50_000_000, "5천만"],
    [63_000_000, "6.3천만"],
    [0, "0"],
  ])("%i원 → %s", (won, label) => {
    expect(formatRoadmapTick(won)).toBe(label);
  });
});

describe("(c)(d) /salary 금액 표기", () => {
  const render = async (amount: number) =>
    stripComments(renderToStaticMarkup(await SalaryPage({ params: Promise.resolve({ amount: String(amount) }) })));

  it("연봉 2억 FAQ 월 실수령은 '약 1,133만원' (쉼표 없는 '1133만원' 없음)", async () => {
    const html = await render(200_000_000);
    const answers = faqAnswers(html);
    expect(answers[0]).toContain("예상 월 실수령액은 약 1,133만원입니다.");
    expect(answers.join(" ")).not.toMatch(/\d{4}만원/);
    // 화면의 접힌 FAQ 도 같다. 광고(CalcResultAd) 위 speakable 요약 줄의 '1133만원'은 이 묶음 범위 밖(가드 스윕 몫)이라 그대로다.
    const faq = html.slice(html.indexOf("자주 묻는 질문"), html.indexOf("다른 연봉 리포트"));
    expect(faq).toContain("약 1,133만원");
    expect(faq).not.toContain("1133만원");
  });

  it("1억 미만 FAQ 답은 종전 표기 그대로 (3,000만·5,000만 고정 문장과 같은 형식)", async () => {
    const answers = faqAnswers(await render(50_000_000));
    expect(answers[0]).toMatch(/예상 월 실수령액은 약 \d{3}만원입니다\. 보험료와 세금을 포함한 월 공제액은 약 \d{2,3}만원입니다/);
  });

  it("연봉 1.5억 페이지의 다른 연봉 리포트 링크는 억 표기", async () => {
    const html = await render(150_000_000);
    const block = html.slice(html.indexOf("다른 연봉 리포트"));
    expect(block).toContain(">연봉 1억 4,000만원<");
    expect(html).not.toContain("14,000만원");
    expect(html).not.toMatch(/연봉 \d{2,3},\d{3}만원/);
  });

  it("1억 미만 링크 라벨은 종전 '연봉 N,NNN만원' 그대로", async () => {
    const html = await render(50_000_000);
    const block = html.slice(html.indexOf("다른 연봉 리포트"));
    expect(block).toMatch(/>연봉 \d,\d{3}만원</);
  });
});
