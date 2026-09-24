// /salary-db/compare/[slug] 조사 회귀 가드 (2026-09-25 B12 META-05·META-06)
//
// 비교 페이지 413쌍은 회사명·업종명 뒤 조사를 템플릿에 하드코딩해 '아모레퍼시픽와'·'서울아산병원가'·
// '11번가과'·'아마존 (Amazon)와' 같은 오류가 메타 설명 199쪽·본문 287쪽에 있었다.
// 전 쌍을 실제로 렌더(react-dom/server)해 메타 설명·본문·FAQ(JSON-LD 포함)에서
//   (a) 회사명·업종명 바로 뒤 은/는·이/가·과/와·을/를이 받침과 맞는지,
//   (b) '은(는)' 같은 병기 자리표시가 없는지,
//   (c) 1억 이상 신입 금액이 '18,700만원' 대신 억 단위로 쓰였는지
// 를 고정한다. 광고·쿠팡·추적 컴포넌트는 빈 요소로 대체(문구 검사 대상 아님).
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { stub } = vi.hoisted(() => ({ stub: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: stub,
  CalcResultAd: stub,
  GuideMidAd: stub,
  SidebarAd: stub,
  InArticleAd: stub,
  MultiplexAd: stub,
  Display2Ad: stub,
  ResultAd: stub,
}));
vi.mock("@/components/CoupangBanner", () => ({ default: stub }));
vi.mock("@/components/CompareViewTracker", () => ({ default: stub }));
vi.mock("@/components/RelatedCalculators", () => ({ default: stub }));
vi.mock("@/components/ShareButtons", () => ({
  default: ({ title, description }: { title: string; description: string }) =>
    createElement("p", { "data-share": "" }, `${title} / ${description}`),
}));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/salary-db",
  permanentRedirect: () => {
    throw new Error("redirect");
  },
}));

import ComparePage, { generateMetadata } from "@/app/salary-db/compare/[slug]/page";
import { getComparePairs } from "@/lib/salary-data/companyComparePairs";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { industryLabelKo } from "@/lib/companyContentBuilder";
import { josaParticle } from "@/lib/josa";

const PAIRS: Record<string, [string, string]> = {
  은: ["은", "는"],
  는: ["은", "는"],
  이: ["이", "가"],
  가: ["이", "가"],
  과: ["과", "와"],
  와: ["과", "와"],
  을: ["을", "를"],
  를: ["을", "를"],
};

/** 한글로 끝나는 이름은 josa.ts 와 독립적으로 받침을 판정하고, 그 외(영문·숫자 끝 46곳)는 josa.ts 발음표를 쓴다. */
function expectedParticle(word: string, found: string): string {
  const [withBatchim, withoutBatchim] = PAIRS[found];
  const base = word.replace(/\s*\([^()]*\)$/, "");
  const code = base.charCodeAt(base.length - 1);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 === 0 ? withoutBatchim : withBatchim;
  }
  return josaParticle(word, `${withBatchim}/${withoutBatchim}` as "은/는");
}

function decode(html: string): string {
  return html
    .replace(/&apos;|&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ldquo;|&rdquo;/g, '"');
}

/** 인라인 태그는 붙이고(이름<strong>…</strong>조사 인접 유지) 블록 태그는 공백으로 — JSON-LD 본문도 포함 */
function toText(html: string): string {
  return decode(
    html
      .replace(/<\/?(strong|a|span|b|em)\b[^>]*>/g, "")
      .replace(/<script[^>]*>/g, " ")
      .replace(/<\/script>/g, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** text 에서 names 각각의 바로 뒤 조사(선택적 '(…)' 병기 뒤 포함)를 찾아 받침 불일치를 모은다. */
function particleMismatches(text: string, names: string[]): string[] {
  const sorted = [...new Set(names)].sort((x, y) => y.length - x.length);
  const out: string[] = [];
  for (const name of sorted) {
    const re = new RegExp(`${escapeRe(name)}(\\([^()]*\\))?([은는이가과와을를])(?=[\\s.,?!'"·)]|$)`, "g");
    for (const m of text.matchAll(re)) {
      const at = m.index ?? 0;
      // 더 긴 이름의 일부(예: 'KT' ⊂ 'KT&G')는 그 이름의 검사로 넘긴다
      if (sorted.some((longer) => longer.length > name.length && longer.includes(name) && text.startsWith(longer, at - longer.indexOf(name)))) continue;
      const found = m[2];
      const expected = expectedParticle(name, found);
      if (found !== expected) out.push(`${name}${m[1] ?? ""}${found} (기대: ${expected}) … ${text.slice(Math.max(0, at - 15), at + name.length + 20)}`);
    }
  }
  return out;
}

const PLACEHOLDER = /은\(는\)|이\(가\)|과\(와\)|와\(과\)|을\(를\)|\(으\)로/;

describe("비교 페이지 413쌍 — 회사명·업종명 뒤 조사", () => {
  const pairs = getComparePairs();

  it("메타 설명·본문·FAQ(JSON-LD 포함)에 받침 불일치·병기 자리표시가 0건", async () => {
    expect(pairs.length).toBeGreaterThanOrEqual(400);
    const mismatches: string[] = [];
    const placeholders: string[] = [];
    let checkedSites = 0;
    for (const p of pairs) {
      const a = companyRepository.getById(p.aId)!;
      const b = companyRepository.getById(p.bId)!;
      const names = [a.name.ko, b.name.ko, industryLabelKo(a.industry), industryLabelKo(b.industry)];
      const meta = await generateMetadata({ params: { slug: p.slug } });
      const description = String(meta.description ?? "");
      const html = renderToStaticMarkup(
        createElement(ComparePage as unknown as (props: { params: { slug: string } }) => ReactNode, {
          params: { slug: p.slug },
        }),
      );
      const text = `${description}\n${toText(html)}`;
      const found = particleMismatches(text, names);
      mismatches.push(...found.map((f) => `${p.slug}: ${f}`));
      if (PLACEHOLDER.test(text)) placeholders.push(`${p.slug}: ${text.match(new RegExp(`.{0,20}(${PLACEHOLDER.source}).{0,10}`))?.[0]}`);
      checkedSites += names.reduce((n, name) => n + (text.match(new RegExp(`${escapeRe(name)}(\\([^()]*\\))?[은는이가과와을를](?=[\\s.,?!'"·)]|$)`, "g"))?.length ?? 0), 0);
    }
    // 템플릿이 실제로 이름 뒤 조사를 만들어 냈는지(검사 공회전 방지) — 쌍당 수십 곳
    expect(checkedSites).toBeGreaterThan(pairs.length * 20);
    expect(mismatches.slice(0, 20)).toEqual([]);
    expect(placeholders.slice(0, 20)).toEqual([]);
  }, 120_000);

  it("메타 설명의 1억 이상 신입 금액은 억 단위 — '18,700만원' 같은 5자리 만원 표기 0건", async () => {
    const bad: string[] = [];
    let eokCount = 0;
    for (const p of pairs) {
      const meta = await generateMetadata({ params: { slug: p.slug } });
      const description = String(meta.description ?? "");
      if (/\d{2,3},\d{3}만원/.test(description)) bad.push(`${p.slug}: ${description.slice(0, 60)}`);
      if (/약 \d+억/.test(description)) eokCount++;
    }
    expect(bad).toEqual([]);
    expect(eokCount).toBeGreaterThan(0);
  });

  it("본문 금액 뒤 조사 — '만원로' 대신 '만원으로'", () => {
    const p = pairs[0];
    const html = renderToStaticMarkup(
      createElement(ComparePage as unknown as (props: { params: { slug: string } }) => ReactNode, {
        params: { slug: p.slug },
      }),
    );
    expect(toText(html)).not.toMatch(/만원로|억원로/);
  });
});
