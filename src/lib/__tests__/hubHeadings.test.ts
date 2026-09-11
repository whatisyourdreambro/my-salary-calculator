// 허브 H1 키워드 선행 회귀 가드 (S3-5, 2026-09-12 — docs/next-upgrade-plan-2026-09-11.md §4 SEO-10)
//
// 배경: /qna·/glossary·/tools·/insights 등 허브의 <h1> 이 슬로건("금융에 대한 모든 질문과 해답" 등)이라
// 검색 대상 키워드가 H1 에 없었다. H1 은 키워드 선행으로 바꾸고 슬로건은 히어로 <p> 첫 문장으로 내렸다.
// 소스 스캔(jsdom 없음)으로 고정하는 것:
//  (1) 각 파일의 H1 이 새 키워드 문자열을 담고, 옛 슬로건은 H1 밖(<p>/lead)에만 남는다
//  (2) 영문 허브는 title(= <title>·OG, 동결 창) 을 건드리지 않고 heading 필드로만 H1 을 바꾼다
//  (3) 홈(/)·/calc 의 H1 은 M01 판정 게이트(9/20) 안이라 이번 커밋에서 무접촉
//  (4) 변경된 H1 문자열은 서로 겹치지 않는다 (qa-page-quality 중복 H1 리뷰 플래그 예방)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { ENGLISH_HUBS } from "@/lib/englishHubs";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/** 파일 안의 <h1 ...>…</h1> 블록(들) — 소스 그대로(JSX 포함) */
const h1Blocks = (src: string) => [...src.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1]);

type Case = { file: string; h1Parts: string[]; oldSlogan: string; sloganNowInBody?: boolean };

const KO_CASES: Case[] = [
  { file: "src/app/qna/page.tsx", h1Parts: ["연봉·세금", "자주 묻는 질문 Q&A"], oldSlogan: "모든 질문과 해답", sloganNowInBody: true },
  { file: "src/app/glossary/page.tsx", h1Parts: ["금융·세금", "용어 사전 {glossaryData.length}개"], oldSlogan: "당신의 돈이 말을 거는 순간", sloganNowInBody: true },
  { file: "src/app/insights/page.tsx", h1Parts: ["연봉·성과급", "데이터 리포트"], oldSlogan: "연봉의 진실", sloganNowInBody: true },
  { file: "src/app/money-check/page.tsx", h1Parts: ["내 돈 체크", "직장인 돈 체크리스트"], oldSlogan: "하나씩 가볍게", sloganNowInBody: true },
  { file: "src/app/hub/page.tsx", h1Parts: ["재테크·절세 주제별 가이드"], oldSlogan: "" },
];

describe("허브 H1 — 키워드 선행, 슬로건은 부제 (S3-5)", () => {
  it.each(KO_CASES)("$file 의 H1 이 새 키워드를 담고 옛 슬로건은 H1 밖에 있다", ({ file, h1Parts, oldSlogan, sloganNowInBody }) => {
    const src = read(file);
    const blocks = h1Blocks(src);
    expect(blocks, `${file}: <h1> 은 정확히 1개`).toHaveLength(1);
    for (const part of h1Parts) expect(blocks[0], `${file} H1 에 '${part}'`).toContain(part);
    if (oldSlogan) {
      expect(blocks[0], `${file} H1 에 옛 슬로건 잔존`).not.toContain(oldSlogan);
      if (sloganNowInBody) expect(src, `${file} 본문(<p>)에 슬로건 보존`).toContain(oldSlogan);
    }
  });

  it("/tools 는 ToolHubPage props 로 H1 을 만든다 — 접두 '금융 계산기 모음' · 강조 2026 · 접미 N종, 슬로건은 lead 첫 문장", () => {
    const src = read("src/app/tools/page.tsx");
    expect(src).toMatch(/headingPrefix="금융 계산기 모음"/);
    expect(src).toMatch(/headingAccent="2026"/);
    expect(src).toMatch(/headingSuffix=\{`\$\{totalCount\}종`\}/);
    expect(src).toMatch(/lead=\{`필요한 계산을 한곳에서\. /);
    expect(src).not.toMatch(/headingPrefix="필요한 계산을"/);
    // 형제 허브 3종은 무접촉 (금융·부동산·생활 계산기 N종 모음)
    for (const f of ["finance", "real-estate", "life"]) {
      expect(read(`src/app/tools/${f}/page.tsx`)).toMatch(/headingSuffix="모음"/);
    }
  });

  it("/table/2026/annual 의 TableHero title 은 '2026 연봉 실수령액 표' (대백과 → 표, 구조 동일)", () => {
    const src = read("src/app/table/2026/annual/page.tsx");
    const m = src.match(/title=\{\s*<>([\s\S]*?)<\/>\s*\}/);
    expect(m).not.toBeNull();
    const title = m![1];
    expect(title).toContain("2026 연봉 실수령액");
    expect(title).toMatch(/<span[^>]*>\s*표\s*<\/span>/);
    expect(title).not.toContain("대백과");
    expect((title.match(/<br /g) ?? []).length).toBe(1);
  });

  it("영문 허브 5종 — heading 만 바뀌고 title(<title>·OG) 은 동결", () => {
    const expected: Record<string, [title: string, heading: string]> = {
      salary: ["Understand salary data and compare offers", "Korea salary data & offers"],
      fun: ["Everyday money, in perspective", "Korea money, everyday numbers"],
      calculators: ["English calculators", "Korea salary & tax calculators"],
      money: ["Money planning tools", "Korea money planning tools"],
      bonus: ["Bonuses and stock awards", "Korea bonus & stock award tax"],
    };
    for (const [id, [title, heading]] of Object.entries(expected)) {
      const hub = ENGLISH_HUBS[id as keyof typeof ENGLISH_HUBS] as { title: string; heading?: string };
      expect(hub.title, `${id}.title`).toBe(title);
      expect(hub.heading, `${id}.heading`).toBe(heading);
    }
    // /en/season 은 무접촉 (heading 없음 → title 그대로 H1)
    expect((ENGLISH_HUBS.season as { heading?: string }).heading).toBeUndefined();
    // 셸은 heading 우선, 브레드크럼은 title 유지
    const shell = read("src/components/english/EnglishHubPage.tsx");
    expect(shell).toMatch(/title=\{hub\.heading \?\? hub\.title\}/);
    expect(shell).toMatch(/breadcrumbs=\{\[\{ name: hub\.title, href: hub\.path \}\]\}/);
  });

  it("홈(/)·/calc H1 은 M01 판정 게이트(9/20) 안 — 무접촉", () => {
    expect(read("src/app/HomeClient.tsx")).toContain("2026 연봉 계산기");
    const calc = h1Blocks(read("src/app/calc/page.tsx"));
    expect(calc.length).toBeGreaterThanOrEqual(1);
  });

  it("변경된 H1 문자열은 서로 다르다 (색인 페이지 간 중복 H1 0)", () => {
    const heads = [
      "연봉·세금 자주 묻는 질문 Q&A",
      "금융·세금 용어 사전",
      "금융 계산기 모음 2026",
      "연봉·성과급 데이터 리포트",
      "2026 연봉 실수령액 표",
      "내 돈 체크 직장인 돈 체크리스트",
      "재테크·절세 주제별 가이드",
      ...Object.values(ENGLISH_HUBS).map((h) => (h as { heading?: string; title: string }).heading ?? h.title),
    ];
    expect(new Set(heads).size).toBe(heads.length);
    // /tools/finance 의 H1('금융 계산기 13종 모음')과 /tools 의 H1('금융 계산기 모음 2026 31종')이 같은 문자열이 되지 않는다
    expect(read("src/app/tools/finance/page.tsx")).not.toMatch(/headingPrefix="금융 계산기 모음"/);
  });
});
