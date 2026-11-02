// 연속 광고 금지 가드 — 저장소 전체 (2026-11-02, ADS-STACK-01)
//
// 운영자 규칙: 'HomeTop 직후 Multiplex 연속 배치'는 9월에 기각·재제안 금지(docs/ad-experiments.md), 광고 유닛끼리 또는
// 광고 유닛과 쿠팡 배너를 붙여 두지 않는다(연속 광고 금지 — glossary/[slug]·qna/[slug] 는 쿠팡 옆 유닛을 아예 뺐다).
// OF4 A1 의 공유 블록 이동이 10곳에서 이 배치를 다시 만들어 A1 을 5곳으로 줄였다(adAdjacentFeedbackShareOrder.test.ts).
//
// src/app·src/components 의 .tsx 전부(테스트 제외)를 TypeScript 구문 트리로 읽어, 광고 유닛 두 개 또는 광고 유닛과 쿠팡
// 배너가 래퍼 요소·주석·공백만 사이에 두고 이어지는 곳을 찾는다. 2cab06bc(운영과 같은 배치의 2단계+구글 머리)에 이미 있던
// 쌍만 BASELINE 에 둔다 — 새 쌍이 생기면 실패하고, BASELINE 의 쌍이 없어지면 목록에서 지우라고 실패한다(다시 생기지 않게).
// BASELINE 의 쌍을 고치는 것은 광고 코드 변경이라 운영자 결정 몫이다.
//
// 판정 규칙
//  - 광고 유닛: AdPlacement.tsx 가 내보내는 *Ad 컴포넌트 전부 + PageFooterAds(아래 첫 묶음이 export 와 대조한다).
//  - 쿠팡 배너: CoupangBanner(AffiliateSlot 심)·AffiliateSlot·CoupangBannerCore. OfferSlot 은 쿠팡을 렌더하지 않는 오퍼 전용
//    슬롯이라 넣지 않는다(scripts/ad-audit.mjs 와 같은 판단). 쿠팡 배너끼리의 이웃은 이 가드의 대상이 아니다.
//  - 사이에 있어도 '이어진다'로 보는 것: WRAPPERS 의 여닫는 태그(빈 간격 div 포함), {/* 주석 */}, 공백, {" "}.
//  - 사이를 끊는 것: 그 밖의 요소·컴포넌트(ShareSection·OfferSlot 처럼 첫 렌더에 비어 있을 수 있는 것도 소스 배치의
//    구분자로 친다 — 첫 화면 간격은 실측 스윕 몫), 공백이 아닌 글, 코드가 든 {…}. 조건부 렌더 {조건 && …}·{a ? … : …} 는
//    서로 배타인 조건이 많아 정적으로 이웃을 판정하지 않고, 그 안의 JSX 만 따로 검사한다.
//  - 파일 하나 안의 JSX 순서만 본다(page 끝 광고와 layout 광고의 이웃은 ad-audit·실측 몫).
//  - 쌍의 키는 '파일: 앞 > 뒤'(줄 번호는 바뀌므로 넣지 않고, 같은 파일의 같은 쌍은 개수로 센다).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const AD_UNITS = new Set([
  "HomeTopAd",
  "CalcResultAd",
  "ResultAd",
  "GuideMidAd",
  "SidebarAd",
  "InArticleAd",
  "MultiplexAd",
  "Display2Ad",
  "CompanyTopAd",
  "PageFooterAds",
]);
const COUPANG = new Set(["CoupangBanner", "AffiliateSlot", "CoupangBannerCore"]);
const WRAPPERS = new Set([
  "div", "section", "aside", "article", "main", "span", "header", "footer", "nav", "figure", "ul", "ol", "li",
  "", "Fragment", "React.Fragment", "Suspense", "React.Suspense",
]);
const isPair = (a: string, b: string) =>
  (AD_UNITS.has(a) && AD_UNITS.has(b)) || (AD_UNITS.has(a) && COUPANG.has(b)) || (COUPANG.has(a) && AD_UNITS.has(b));

/** 2cab06bc 에 이미 있던 쌍(운영 배치) — 줄 번호 없는 키, 정렬 */
const BASELINE = [
  "src/app/HomeClient.tsx: GuideMidAd > MultiplexAd",
  "src/app/calc/[slug]/page.tsx: HomeTopAd > SidebarAd",
  "src/app/calc/[slug]/page.tsx: SidebarAd > CoupangBanner",
  "src/app/calc/layout.tsx: CoupangBanner > HomeTopAd",
  "src/app/calc/layout.tsx: InArticleAd > CoupangBanner",
  "src/app/civil-servant-pay-2026/page.tsx: SidebarAd > CoupangBanner",
  "src/app/firefighter-pay-2026/page.tsx: SidebarAd > CoupangBanner",
  "src/app/fun/layout.tsx: CalcResultAd > CoupangBanner",
  "src/app/fun/layout.tsx: CoupangBanner > HomeTopAd",
  "src/app/glossary/page.tsx: GuideMidAd > CoupangBanner",
  "src/app/guides/[slug]/GuidePageClient.tsx: CoupangBanner > MultiplexAd",
  "src/app/industry/page.tsx: MultiplexAd > CoupangBanner",
  "src/app/job/page.tsx: InArticleAd > CoupangBanner",
  "src/app/military-pay-2026/page.tsx: SidebarAd > CoupangBanner",
  "src/app/minimum-wage-2026/page.tsx: HomeTopAd > SidebarAd",
  "src/app/minimum-wage-2026/page.tsx: SidebarAd > CoupangBanner",
  "src/app/monthly/[amount]/page.tsx: CoupangBanner > HomeTopAd",
  "src/app/police-pay-2026/page.tsx: SidebarAd > CoupangBanner",
  "src/app/qna/QnaPageClient.tsx: InArticleAd > CoupangBanner",
  "src/app/salary-db/SalaryDbClient.tsx: InArticleAd > CoupangBanner",
  "src/app/salary-db/[id]/page.tsx: CoupangBanner > HomeTopAd",
  "src/app/salary-db/[id]/page.tsx: HomeTopAd > SidebarAd",
  "src/app/salary-db/[id]/page.tsx: SidebarAd > CoupangBanner",
  "src/app/salary/[amount]/page.tsx: SidebarAd > CoupangBanner",
  "src/app/teacher-pay-2026/page.tsx: SidebarAd > CoupangBanner",
  "src/app/tools/layout.tsx: CoupangBanner > HomeTopAd",
  "src/app/year-end-tax-checklist/page.tsx: MultiplexAd > SidebarAd",
  "src/app/year-end-tax-checklist/page.tsx: SidebarAd > CoupangBanner",
  "src/components/PageFooterAds.tsx: HomeTopAd > InArticleAd",
  "src/components/PageFooterAds.tsx: InArticleAd > CoupangBanner",
  "src/components/StaticSharePage.tsx: CalcResultAd > CoupangBanner",
  "src/components/tool/ToolHubPage.tsx: MultiplexAd > CoupangBanner",
];

type Pair = { key: string; at: string };
const isJsx = (n: ts.Node): n is ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment =>
  ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n);

/** 한 파일의 이어진 광고 쌍과 쓰인 *Ad·*Ads 태그 이름 */
function scanSource(file: string, source: string): { pairs: Pair[]; adLikeTags: string[] } {
  const sf = ts.createSourceFile(file, source.replace(/\r\n/g, "\n"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const pairs: Pair[] = [];
  const adLikeTags: string[] = [];
  const lineOf = (n: ts.Node) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const tagOf = (n: ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment) =>
    ts.isJsxFragment(n) ? "" : (ts.isJsxElement(n) ? n.openingElement.tagName : n.tagName).getText(sf);

  // 코드 안의 JSX 는 뿌리마다 따로 센다(앞뒤 이웃 없음).
  const nested = (node: ts.Node) => {
    const visit = (n: ts.Node) => {
      if (isJsx(n)) walk(n, { prev: null });
      else ts.forEachChild(n, visit);
    };
    visit(node);
  };
  type Ctx = { prev: { name: string; line: number } | null };
  function walk(node: ts.Node, ctx: Ctx) {
    if (isJsx(node)) {
      const name = tagOf(node);
      if (/Ads?$/.test(name)) adLikeTags.push(name);
      const attrs = ts.isJsxElement(node) ? node.openingElement.attributes : ts.isJsxSelfClosingElement(node) ? node.attributes : null;
      for (const p of attrs?.properties ?? []) {
        if (ts.isJsxAttribute(p) && p.initializer && ts.isJsxExpression(p.initializer) && p.initializer.expression) nested(p.initializer.expression);
        else if (ts.isJsxSpreadAttribute(p)) nested(p.expression);
      }
      if (AD_UNITS.has(name) || COUPANG.has(name)) {
        const line = lineOf(node);
        if (ctx.prev && isPair(ctx.prev.name, name)) {
          pairs.push({ key: `${file}: ${ctx.prev.name} > ${name}`, at: `${file}:${ctx.prev.line}>${line}` });
        }
        ctx.prev = { name, line };
        return;
      }
      const children = ts.isJsxSelfClosingElement(node) ? [] : node.children;
      if (WRAPPERS.has(name)) {
        for (const c of children) walk(c, ctx);
        return;
      }
      ctx.prev = null;
      for (const c of children) walk(c, ctx);
      ctx.prev = null;
      return;
    }
    if (ts.isJsxText(node)) {
      if (!node.containsOnlyTriviaWhiteSpaces && node.text.trim() !== "") ctx.prev = null;
      return;
    }
    if (ts.isJsxExpression(node)) {
      const e = node.expression;
      if (!e) return; // {/* 주석 */}
      if ((ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) && e.text.trim() === "") return; // {" "}
      ctx.prev = null;
      nested(e);
      ctx.prev = null;
      return;
    }
    ctx.prev = null;
  }
  const top = (n: ts.Node) => {
    if (isJsx(n)) walk(n, { prev: null });
    else ts.forEachChild(n, top);
  };
  top(sf);
  return { pairs, adLikeTags };
}

const isScanned = (rel: string) =>
  rel.endsWith(".tsx") && !/(^|\/)__tests__\//.test(rel) && !/\.(?:test|spec)\.tsx$/.test(rel);
function walkDir(rel: string): string[] {
  const abs = resolve(ROOT, rel);
  if (statSync(abs).isFile()) return isScanned(rel) ? [rel] : [];
  return readdirSync(abs).flatMap((name) => walkDir(join(rel, name).replace(/\\/g, "/")));
}
const FILES = [...walkDir("src/app"), ...walkDir("src/components")].sort();
const SCANS = FILES.map((file) => ({ file, ...scanSource(file, readFileSync(resolve(ROOT, file), "utf8")) }));
const PAIRS = SCANS.flatMap((s) => s.pairs);

/** 여러 벌 차이(a 에서 b 를 개수만큼 뺀 나머지) */
function multisetMinus(a: string[], b: string[]) {
  const left = new Map<string, number>();
  for (const k of b) left.set(k, (left.get(k) ?? 0) + 1);
  return a.filter((k) => {
    const n = left.get(k) ?? 0;
    if (n > 0) {
      left.set(k, n - 1);
      return false;
    }
    return true;
  });
}

describe("판정 대상 광고 유닛 목록", () => {
  it("AdPlacement.tsx 가 내보내는 *Ad 컴포넌트와 같다(+ PageFooterAds)", () => {
    const sf = ts.createSourceFile(
      "AdPlacement.tsx",
      readFileSync(resolve(ROOT, "src/components/AdPlacement.tsx"), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const names: string[] = [];
    for (const st of sf.statements) {
      const exported = ts.canHaveModifiers(st) && ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!exported) continue;
      if (ts.isFunctionDeclaration(st) && st.name) names.push(st.name.text);
      if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
    }
    expect(names.filter((n) => /Ad$/.test(n)).sort()).toEqual([...AD_UNITS].filter((n) => n !== "PageFooterAds").sort());
  });

  it("src 의 JSX 에 쓰인 *Ad·*Ads 태그는 모두 판정 대상이다", () => {
    expect(FILES.length).toBeGreaterThan(400);
    const unknown = [...new Set(SCANS.flatMap((s) => s.adLikeTags))].filter((n) => !AD_UNITS.has(n));
    expect(unknown).toEqual([]);
  });
});

describe("판정 규칙(합성 예시)", () => {
  const keys = (jsx: string) => scanSource("x.tsx", `export default function P() { return (<>${jsx}</>); }`).pairs.map((p) => p.key);
  const RULES: Array<[name: string, jsx: string, expected: string[]]> = [
    ["래퍼·주석만 사이", `<div className="mt-10"><HomeTopAd /></div>{/* 본문 끝 */}<div className="mt-10"><MultiplexAd /></div>`, ["x.tsx: HomeTopAd > MultiplexAd"]],
    ["쿠팡 배너 다음 광고", `<CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />\n<div className="mt-8"><MultiplexAd /></div>`, ["x.tsx: CoupangBanner > MultiplexAd"]],
    ["빈 간격 div 와 공백 문자열", `<GuideMidAd /><div className="h-8" />{" "}<section><HomeTopAd /></section>`, ["x.tsx: GuideMidAd > HomeTopAd"]],
    ["주석 속 태그 글자는 태그가 아니다", `<GuideMidAd />{/* <ShareSection /> 아래 <HomeTopAd /> */}<MultiplexAd />`, ["x.tsx: GuideMidAd > MultiplexAd"]],
    ["공유 블록이 사이", `<HomeTopAd /><ShareSection contentType="page" className="mt-10" /><div className="mt-10"><MultiplexAd /></div>`, []],
    ["글이 사이", `<HomeTopAd /><p>다음 글</p><MultiplexAd />`, []],
    ["오퍼 슬롯이 사이", `<InArticleAd /><OfferSlot vertical="loan" /><MultiplexAd />`, []],
    ["조건부 렌더는 판정하지 않는다", `<HomeTopAd />{show && <MultiplexAd />}{a ? <GuideMidAd /> : <InArticleAd />}`, []],
    ["조건부 안의 JSX 는 따로 검사", `{show && (<><HomeTopAd /><div><InArticleAd /></div></>)}`, ["x.tsx: HomeTopAd > InArticleAd"]],
    ["쿠팡 배너끼리는 대상 아님", `<CoupangBanner /><CoupangBanner size="skyscraper" />`, []],
  ];
  it.each(RULES)("%s", (_name, jsx, expected) => {
    expect(keys(jsx)).toEqual(expected);
  });
});

describe("저장소 전체: 2cab06bc 에 없던 연속 광고 쌍이 없다", () => {
  it("새 쌍 0 (광고 유닛끼리·광고 유닛과 쿠팡 배너)", () => {
    const added = multisetMinus(PAIRS.map((p) => p.key), BASELINE);
    const where = PAIRS.filter((p) => added.includes(p.key)).map((p) => p.at);
    expect({ added, where }).toEqual({ added: [], where: [] });
  });

  it("BASELINE 에는 지금 남아 있는 쌍만 둔다(고쳐진 쌍은 지운다)", () => {
    expect(BASELINE).toEqual([...BASELINE].sort());
    expect(multisetMinus(BASELINE, PAIRS.map((p) => p.key))).toEqual([]);
  });

  // OF4 A1 을 5곳으로 줄인 10곳 — 공유 블록이 두 슬롯 사이의 유일한 구분자다(adAdjacentFeedbackShareOrder.test.ts 와 짝).
  const SHARE_SEPARATED: Array<[file: string, pair: string]> = [
    ["src/app/hub/page.tsx", "GuideMidAd > HomeTopAd"],
    ["src/app/industry/[slug]/page.tsx", "CoupangBanner > MultiplexAd"],
    ["src/app/job/[slug]/page.tsx", "CoupangBanner > MultiplexAd"],
    ["src/app/retirement-pension-2026/page.tsx", "HomeTopAd > MultiplexAd"],
    ["src/app/social-insurance-rates-2027/page.tsx", "HomeTopAd > MultiplexAd"],
    ["src/app/tax-rates-2026/page.tsx", "HomeTopAd > MultiplexAd"],
    ["src/app/tips/page.tsx", "CoupangBanner > MultiplexAd"],
    ["src/app/year-end-tax-2026/page.tsx", "HomeTopAd > MultiplexAd"],
    ["src/app/year-end-tax-checklist/page.tsx", "HomeTopAd > MultiplexAd"],
    ["src/app/year-end-tax-settlement-2026/page.tsx", "HomeTopAd > MultiplexAd"],
  ];
  it.each(SHARE_SEPARATED)("%s: 공유 블록을 빼면 %s 가 이어진다 — 결정 K 전까지 공유 블록을 옮기지 않는다", (file, pair) => {
    const source = readFileSync(resolve(ROOT, file), "utf8").replace(/\r\n/g, "\n");
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const shares: ts.Node[] = [];
    const visit = (n: ts.Node) => {
      if ((ts.isJsxSelfClosingElement(n) || ts.isJsxElement(n)) && (ts.isJsxElement(n) ? n.openingElement.tagName : n.tagName).getText(sf) === "ShareSection") shares.push(n);
      ts.forEachChild(n, visit);
    };
    visit(sf);
    expect(shares).toHaveLength(1);
    const keysNow = scanSource(file, source).pairs.map((p) => p.key);
    expect(keysNow).not.toContain(`${file}: ${pair}`);
    const without = source.slice(0, shares[0].getStart(sf)) + source.slice(shares[0].getEnd());
    expect(scanSource(file, without).pairs.map((p) => p.key)).toContain(`${file}: ${pair}`);
  });
});
