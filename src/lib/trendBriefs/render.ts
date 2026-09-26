// src/lib/trendBriefs/render.ts
//
// 브리프 초안(JSON) → 가이드 모듈 소스(TS) · 평가된 본문 HTML. 순수·결정적(같은 초안 = 같은 출력).
// 한 번 만든 조각(Segment) 목록에서 소스와 HTML 을 같이 뽑으므로 둘은 항상 같은 본문을 가리킨다.
// 소스 규칙(guideSpec (5) 소스 탐색기 · verify:tax):
//   - content 는 템플릿 리터럴 하나. 모든 <h2> 와 <table class="w-full text-sm"> 여는 태그는 리터럴.
//   - 보간은 ${impactRows(...)} · ${impactCell(...)} · ${constText(...)} 만.
//   - 본문의 정본 상수 표기(최저시급·구직급여 상한·연금 요율 등 CANONICAL_CONSTS 의 autoReplace 표기)는 ${constText(NAME)} 로 자동 치환 → verify:tax 통과.
// 이스케이프: 문장은 HTML 이스케이프 → 템플릿 이스케이프(\ · ` · ${). img·iframe·script·style·새 class 없음.
// 미니 마크업: **굵게** · [라벨](링크) · {{engine:kind:행:열}} · {{const:NAME}}.
import type { Guide } from "@/lib/guidesData";
import { CANONICAL_CONSTS, IMPACT_KINDS, constText, escapeHtml, impactCell, impactDisclosure, impactRows } from "./impacts";
import {
  FAQ_HEADING,
  HOW_MADE_HEADING,
  HUMAN_REVIEW_TEXT,
  NOT_ADVICE_TEXT,
  SOURCES_HEADING,
  TREND_BRIEF_TAG,
  canonicalJson,
  type TrendBriefDraft,
} from "./types";

export type Segment =
  | { lit: string }
  | { call: "impactRows"; kind: string; params: Record<string, unknown> }
  | { call: "impactCell"; kind: string; params: Record<string, unknown>; r: number; c: number }
  | { call: "constText"; name: string };

// ─────────────────────────────────────────────────────────────
// 미니 마크업 파서
// ─────────────────────────────────────────────────────────────
export type Inline =
  | { t: "text"; v: string }
  | { t: "bold"; children: Inline[] }
  | { t: "link"; children: Inline[]; href: string }
  | { t: "engine"; r: number; c: number }
  | { t: "const"; name: string };

const TOKEN_RE = /\*\*([^*]+?)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)|\{\{engine:([a-z-]+):(\d+):(\d+)\}\}|\{\{const:([A-Z0-9_]+)\}\}/g;

/** 문장 → 인라인 토큰. engine 토큰의 kind 는 초안의 표 kind 와 같아야 한다(다르면 예외). */
export function parseInline(text: string, tableKind: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ t: "text", v: text.slice(last, at) });
    if (m[1] !== undefined) out.push({ t: "bold", children: parseInline(m[1], tableKind) });
    else if (m[2] !== undefined) out.push({ t: "link", children: parseInline(m[2], tableKind), href: m[3] });
    else if (m[4] !== undefined) {
      if (m[4] !== tableKind) throw new Error(`[render] {{engine:${m[4]}:…}} 는 표 kind(${tableKind})와 같아야 함`);
      out.push({ t: "engine", r: Number(m[5]), c: Number(m[6]) });
    } else out.push({ t: "const", name: m[7] });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

/** 인라인 토큰의 평문(마크업 제거) — 규칙 검사용. engine/const 는 실제 값으로 */
export function inlinePlain(nodes: Inline[], draft: TrendBriefDraft): string {
  return nodes
    .map((n) => {
      if (n.t === "text") return n.v;
      if (n.t === "bold") return inlinePlain(n.children, draft);
      if (n.t === "link") return inlinePlain(n.children, draft);
      if (n.t === "engine") return unescapeHtml(impactCell(draft.impact.table.kind, draft.impact.table.params, n.r, n.c));
      return CANONICAL_CONSTS[n.name]?.text ?? "";
    })
    .join("");
}

function unescapeHtml(s: string): string {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

// ─────────────────────────────────────────────────────────────
// 정본 상수 자동 치환 (critic fix) — 문장 속 정본 표기(원·% 표기) → {{const:NAME}}
// ─────────────────────────────────────────────────────────────
const AUTO_CONSTS = Object.entries(CANONICAL_CONSTS)
  .filter(([, c]) => c.autoReplace)
  .sort((a, b) => b[1].text.length - a[1].text.length || (a[0] < b[0] ? -1 : 1));

/** 평문 한 조각에서 정본 표기를 {{const:NAME}} 로 — 앞은 숫자·쉼표·점이 아니고 뒤는 숫자(또는 ,숫자)가 아닐 때만 */
export function autoConstText(text: string, replaced: { name: string; token: string }[]): string {
  let s = text;
  for (const [name, c] of AUTO_CONSTS) {
    let out = "";
    let i = 0;
    for (;;) {
      const at = s.indexOf(c.text, i);
      if (at < 0) break;
      const before = at > 0 ? s[at - 1] : "";
      const afterStr = s.slice(at + c.text.length, at + c.text.length + 2);
      const lastIsDigit = /\d$/.test(c.text);
      const blocked = /[\d,.]/.test(before) || (lastIsDigit && /^(?:\d|[,.]\d)/.test(afterStr));
      out += s.slice(i, at) + (blocked ? c.text : `{{const:${name}}}`);
      if (!blocked) replaced.push({ name, token: c.text });
      i = at + c.text.length;
    }
    s = out + s.slice(i);
  }
  return s;
}

/** 마크업 밖 평문에만 자동 치환 — 링크 주소·기존 {{…}} 토큰은 건드리지 않는다 */
function canonicalizeProse(text: string, replaced: { name: string; token: string }[]): string {
  let out = "";
  let last = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    const at = m.index ?? 0;
    out += autoConstText(text.slice(last, at), replaced);
    if (m[1] !== undefined) out += `**${canonicalizeProse(m[1], replaced)}**`;
    else if (m[2] !== undefined) out += `[${autoConstText(m[2], replaced)}](${m[3]})`;
    else out += m[0];
    last = at + m[0].length;
  }
  return out + autoConstText(text.slice(last), replaced);
}

/** 본문에 들어가는 모든 문장 필드 (경로, 값) — 규칙·치환·이스케이프가 같은 목록을 쓴다 */
export function proseFields(d: TrendBriefDraft): { path: string; text: string }[] {
  const f: { path: string; text: string }[] = [{ path: "lead", text: d.lead }];
  f.push({ path: "officialSummary.heading", text: d.officialSummary.heading });
  d.officialSummary.paragraphs.forEach((t, i) => f.push({ path: `officialSummary.paragraphs[${i}]`, text: t }));
  d.officialSummary.quotes.forEach((q, i) => f.push({ path: `officialSummary.quotes[${i}].text`, text: q.text }));
  f.push({ path: "impact.heading", text: d.impact.heading }, { path: "impact.intro", text: d.impact.intro });
  f.push({ path: "impact.table.caption", text: d.impact.table.caption });
  d.impact.notes.forEach((t, i) => f.push({ path: `impact.notes[${i}]`, text: t }));
  f.push({ path: "effective.heading", text: d.effective.heading });
  d.effective.paragraphs.forEach((t, i) => f.push({ path: `effective.paragraphs[${i}]`, text: t }));
  d.effective.beforeAfter.forEach((b, i) => {
    f.push({ path: `effective.beforeAfter[${i}].label`, text: b.label });
    f.push({ path: `effective.beforeAfter[${i}].before`, text: b.before });
    f.push({ path: `effective.beforeAfter[${i}].after`, text: b.after });
  });
  d.effective.caveats.forEach((t, i) => f.push({ path: `effective.caveats[${i}]`, text: t }));
  f.push({ path: "calculators.heading", text: d.calculators.heading });
  d.calculators.links.forEach((l, i) => {
    f.push({ path: `calculators.links[${i}].label`, text: l.label });
    f.push({ path: `calculators.links[${i}].why`, text: l.why });
  });
  d.faq.forEach((q, i) => {
    f.push({ path: `faq[${i}].q`, text: q.q });
    f.push({ path: `faq[${i}].a`, text: q.a });
  });
  return f;
}

/** 경로에 값 쓰기 (proseFields 경로 형식) */
function setPath(obj: Record<string, unknown>, path: string, value: string): void {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] as Record<string, unknown>;
  cur[parts[parts.length - 1]] = value;
}

/**
 * 정본 상수 자동 치환 + numbers[] 정리: 치환된 표기의 numbers 항목은 sourceId 'const:NAME' 이 된다(없으면 추가).
 * TREND_BRIEF_TAG 도 여기서 보장한다. 입력은 바꾸지 않는다.
 */
export function canonicalizeDraft(draft: TrendBriefDraft): { draft: TrendBriefDraft; replaced: { name: string; token: string }[] } {
  const copy = JSON.parse(JSON.stringify(draft)) as TrendBriefDraft;
  const replaced: { name: string; token: string }[] = [];
  for (const { path, text } of proseFields(copy)) {
    const next = canonicalizeProse(text, replaced);
    if (next !== text) setPath(copy as unknown as Record<string, unknown>, path, next);
  }
  const byToken = new Map<string, string>();
  for (const r of replaced) if (!byToken.has(r.token)) byToken.set(r.token, r.name);
  copy.numbers = copy.numbers.map((n) => (byToken.has(n.token) ? { ...n, sourceId: `const:${byToken.get(n.token)}`, locator: CANONICAL_CONSTS[byToken.get(n.token)!].source } : n));
  byToken.forEach((name, token) => {
    if (!copy.numbers.some((n) => n.token === token)) copy.numbers.push({ token, sourceId: `const:${name}`, locator: CANONICAL_CONSTS[name].source });
  });
  if (!copy.tags.includes(TREND_BRIEF_TAG)) copy.tags = [...copy.tags, TREND_BRIEF_TAG];
  return { draft: copy, replaced };
}

// ─────────────────────────────────────────────────────────────
// 조각 만들기
// ─────────────────────────────────────────────────────────────
const lit = (s: string): Segment => ({ lit: s });
const escAttr = (s: string) => escapeHtml(s);

function inlineSegments(text: string, d: TrendBriefDraft): Segment[] {
  const k = d.impact.table.kind;
  const walk = (nodes: Inline[]): Segment[] =>
    nodes.flatMap((n): Segment[] => {
      if (n.t === "text") return [lit(escapeHtml(n.v))];
      if (n.t === "bold") return [lit("<strong>"), ...walk(n.children), lit("</strong>")];
      if (n.t === "link") return [lit(`<a href="${escAttr(n.href)}">`), ...walk(n.children), lit("</a>")];
      if (n.t === "engine") return [{ call: "impactCell", kind: k, params: d.impact.table.params, r: n.r, c: n.c }];
      return [{ call: "constText", name: n.name }];
    });
  return walk(parseInline(text, k));
}

const ROLE_LABEL: Readonly<Record<string, string>> = { primary: "1차 출처", secondary: "보조 출처", statute: "법령" };

/** 본문 조각 목록 — 레이아웃: 리드 + 맨 <h2> 6개 (요약·영향·적용·계산기·FAQ·출처) */
export function buildSegments(input: TrendBriefDraft): Segment[] {
  const d = input;
  const s: Segment[] = [];
  const add = (...xs: Segment[]) => s.push(...xs);
  const p = (text: string) => add(lit("<p>"), ...inlineSegments(text, d), lit("</p>\n"));
  const li = (segs: Segment[]) => add(lit("<li>"), ...segs, lit("</li>\n"));

  add(lit('<p class="lead">'), ...inlineSegments(d.lead, d), lit("</p>\n"));

  // 1) 공식 발표 요약
  add(lit("<h2>"), ...inlineSegments(d.officialSummary.heading, d), lit("</h2>\n"));
  d.officialSummary.paragraphs.forEach(p);
  for (const q of d.officialSummary.quotes) {
    const src = d.sources.find((x) => x.id === q.sourceId);
    add(lit("<blockquote>「"), ...inlineSegments(q.text, d), lit("」"));
    if (src) add(lit(` — <a href="${escAttr(src.url)}">${escapeHtml(src.title)}</a>`));
    add(lit("</blockquote>\n"));
  }

  // 2) 영향 표 (엔진 계산)
  const kind = IMPACT_KINDS[d.impact.table.kind];
  add(lit("<h2>"), ...inlineSegments(d.impact.heading, d), lit("</h2>\n"));
  p(d.impact.intro);
  add(lit('<table class="w-full text-sm">\n<thead><tr>'));
  for (const col of kind ? kind.columns : []) add(lit(`<th>${escapeHtml(col)}</th>`));
  add(lit("</tr></thead>\n<tbody>\n"), { call: "impactRows", kind: d.impact.table.kind, params: d.impact.table.params }, lit("\n</tbody>\n</table>\n"));
  // 표 설명 + (결정 전 값이 있으면) 렌더가 붙이는 고정 고지 문장 — writer 문장이 아니다(critic fix 2026-09-26)
  const disclosure = kind ? impactDisclosure(d.impact.table.kind, d.impact.table.params) : "";
  add(lit("<p>"), ...inlineSegments(d.impact.table.caption, d), ...(disclosure ? [lit(` ${escapeHtml(disclosure)}`)] : []), lit("</p>\n"));
  if (d.impact.notes.length) {
    add(lit("<ul>\n"));
    d.impact.notes.forEach((n) => li(inlineSegments(n, d)));
    add(lit("</ul>\n"));
  }

  // 3) 적용 시점·전후 비교·주의
  add(lit("<h2>"), ...inlineSegments(d.effective.heading, d), lit("</h2>\n"));
  add(lit("<h3>바뀌는 점</h3>\n<ul>\n"));
  for (const b of d.effective.beforeAfter) {
    li([lit("<strong>"), ...inlineSegments(b.label, d), lit("</strong>: 변경 전 "), ...inlineSegments(b.before, d), lit(" → 변경 후 "), ...inlineSegments(b.after, d)]);
  }
  add(lit("</ul>\n<h3>적용 대상과 시점</h3>\n"));
  d.effective.paragraphs.forEach(p);
  add(lit(`<p>${escapeHtml(eventLine(d))}</p>\n`));
  add(lit("<h3>주의할 점</h3>\n<ul>\n"));
  d.effective.caveats.forEach((c) => li(inlineSegments(c, d)));
  add(lit("</ul>\n"));

  // 4) 계산기 (허브 먼저)
  add(lit("<h2>"), ...inlineSegments(d.calculators.heading, d), lit("</h2>\n<ul>\n"));
  for (const l of d.calculators.links) {
    li([lit(`<a href="${escAttr(l.href)}">`), ...inlineSegments(l.label, d), lit("</a> — "), ...inlineSegments(l.why, d)]);
  }
  add(lit("</ul>\n"));

  // 5) 자주 묻는 질문 — guideFaq.ts 추출 형식 <li><strong>Q</strong> — A</li>
  add(lit(`<h2>${FAQ_HEADING}</h2>\n<ul>\n`));
  for (const f of d.faq) li([lit("<strong>Q. "), ...inlineSegments(f.q, d), lit("</strong> — "), ...inlineSegments(f.a, d)]);
  add(lit("</ul>\n"));

  // 6) 출처와 작성 방식
  add(lit(`<h2>${SOURCES_HEADING}</h2>\n<ul>\n`));
  for (const src of d.sources) {
    li([lit(`<a href="${escAttr(src.url)}">${escapeHtml(src.title)}</a> (${ROLE_LABEL[src.role] ?? "출처"}, ${escapeHtml(src.publishedDate)} 게시)`)]);
  }
  add(lit("</ul>\n"));
  add(
    lit(
      `<p>기준일: ${escapeHtml(d.publishedDate)}. 이 글의 수치는 기준일에 위 공식 출처에서 확인한 값과 머니샐러리 계산 엔진의 계산 결과입니다.</p>\n`
    )
  );
  add(lit(`<h3>${HOW_MADE_HEADING}</h3>\n<ul>\n`));
  const kindLabel = kind ? kind.label : d.impact.table.kind;
  li([lit(`공식 출처 ${d.sources.length}건을 기준일에 내려받아 원문과 대조했습니다.`)]);
  li([lit(`영향 표는 머니샐러리 계산 엔진으로 계산했고 가정값은 표와 설명에 표시했습니다. 계산 종류: ${escapeHtml(kindLabel)}.`)]);
  li([lit("공식 발표 수집과 초안 작성에 자동화 도구와 AI의 도움을 받았습니다.")]);
  li([lit("발행 전 자동 검사로 출처 호스트·게시일, 수치 출처 대조, 기존 글과의 유사도, 금지 표현, 분량과 구성을 확인했습니다.")]);
  li([lit(`사람 검토: ${escapeHtml(HUMAN_REVIEW_TEXT[d.humanReview])}.`)]);
  add(lit("</ul>\n"));
  add(lit(`<p>${escapeHtml(NOT_ADVICE_TEXT)}</p>`));

  // 인접 리터럴 병합
  const merged: Segment[] = [];
  for (const seg of s) {
    const prev = merged[merged.length - 1];
    if ("lit" in seg && prev && "lit" in prev) merged[merged.length - 1] = { lit: prev.lit + seg.lit };
    else merged.push(seg);
  }
  return merged;
}

/** '적용 대상과 시점' 날짜 줄 — 미래 날짜는 '예정', 정부안·예고는 확정 전임을 밝힌다 */
export function eventLine(d: TrendBriefDraft): string {
  const e = d.event;
  const parts = [`발표: ${e.announcedDate} ${e.ministry} ${e.kind}`];
  if (e.effectiveDate) parts.push(`시행·적용: ${e.effectiveDate}${e.effectiveDate > d.publishedDate ? " 예정" : ""}`);
  if (e.status === "proposed") parts.push("입법·심의 등 남은 절차에 따라 달라질 수 있는 안입니다");
  return `${parts.join(" · ")}.`;
}

// ─────────────────────────────────────────────────────────────
// 출력 — HTML(평가) · 템플릿 소스 · 가이드 항목 소스
// ─────────────────────────────────────────────────────────────
export function segmentsToHtml(segs: Segment[]): string {
  return segs
    .map((g) =>
      "lit" in g
        ? g.lit
        : g.call === "impactRows"
          ? impactRows(g.kind, g.params)
          : g.call === "impactCell"
            ? impactCell(g.kind, g.params, g.r, g.c)
            : constText(g.name)
    )
    .join("");
}

/** 템플릿 리터럴 이스케이프 — \ · ` · ${ */
export function escapeTemplate(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

export function segmentsToTemplate(segs: Segment[]): string {
  return segs
    .map((g) => {
      if ("lit" in g) return escapeTemplate(g.lit);
      if (g.call === "constText") return `\${constText(${JSON.stringify(g.name)})}`;
      const params = canonicalJson(g.params);
      return g.call === "impactRows"
        ? `\${impactRows(${JSON.stringify(g.kind)}, ${params})}`
        : `\${impactCell(${JSON.stringify(g.kind)}, ${params}, ${g.r}, ${g.c})}`;
    })
    .join("");
}

/** 초안 → 정본 치환된 초안 + 조각 */
export function prepare(draft: TrendBriefDraft): { draft: TrendBriefDraft; segments: Segment[]; replaced: { name: string; token: string }[] } {
  const { draft: d, replaced } = canonicalizeDraft(draft);
  return { draft: d, segments: buildSegments(d), replaced };
}

/** 평가된 본문 HTML (게이트·테스트용) */
export function draftToHtml(draft: TrendBriefDraft): string {
  return segmentsToHtml(prepare(draft).segments);
}

/** 평가된 Guide 객체 (게이트·테스트용) */
export function draftToGuide(draft: TrendBriefDraft): Guide {
  const { draft: d, segments } = prepare(draft);
  return {
    slug: d.slug,
    title: d.title,
    description: d.description,
    category: d.category,
    tags: d.tags,
    level: d.level,
    publishedDate: d.publishedDate,
    modifiedDate: d.modifiedDate,
    views: 0,
    lang: "ko",
    content: segmentsToHtml(segments),
  };
}

const q = (s: string) => JSON.stringify(s);
export const ENTRY_BEGIN = (slug: string) => ` // @brief ${slug} begin`;
export const ENTRY_END = (slug: string) => ` // @brief ${slug} end`;

/** 가이드 객체 한 개의 TS 소스 (표식 주석 포함, LF) — 필드 순서: slug 먼저 … content 마지막 */
export function draftToEntrySource(draft: TrendBriefDraft): string {
  const { draft: d, segments } = prepare(draft);
  return [
    ENTRY_BEGIN(d.slug),
    " {",
    `  slug: ${q(d.slug)},`,
    `  title: ${q(d.title)},`,
    `  description: ${q(d.description)},`,
    `  category: ${q(d.category)},`,
    `  tags: [${d.tags.map(q).join(", ")}],`,
    `  level: ${q(d.level)},`,
    `  publishedDate: ${q(d.publishedDate)},`,
    `  modifiedDate: ${q(d.modifiedDate)},`,
    "  views: 0,",
    '  lang: "ko",',
    `  content: \`${segmentsToTemplate(segments)}\`,`,
    " },",
    ENTRY_END(d.slug),
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────
// 월별 파일·집계 파일 편집 (문자열 → 문자열, LF 기준 — CRLF 변환은 스크립트가)
// ─────────────────────────────────────────────────────────────
/** 'YYYY-MM' → 'trendBriefsYYYYMM' */
export const monthExportName = (month: string) => `trendBriefs${month.replace("-", "")}`;
export const monthFileBase = (month: string) => `trend-briefs-${month}`;

const BLOCK_RE = / \/\/ @brief ([a-z0-9-]+) begin\n[\s\S]*? \/\/ @brief \1 end/g;

/** 월별 파일에서 항목 블록 목록 */
export function parseMonthlyBlocks(source: string): { slug: string; block: string; publishedDate: string }[] {
  const text = source.replace(/\r\n/g, "\n");
  return [...text.matchAll(BLOCK_RE)].map((m) => ({
    slug: m[1],
    block: m[0],
    publishedDate: /publishedDate: "(\d{4}-\d{2}-\d{2})"/.exec(m[0])?.[1] ?? "",
  }));
}

/** 월별 파일 전체 소스 — 블록은 발행일·slug 순, import 는 실제로 쓰는 함수만(미사용 import lint 방지) */
export function buildMonthlyFile(month: string, blocks: { slug: string; block: string; publishedDate: string }[]): string {
  const sorted = [...blocks].sort((a, b) => (a.publishedDate + a.slug < b.publishedDate + b.slug ? -1 : 1));
  const body = sorted.map((b) => b.block).join("\n");
  const used = ["constText", "impactCell", "impactRows"].filter((fn) => body.includes(`\${${fn}(`));
  const lines = [
    `// src/lib/guides/${monthFileBase(month)}.ts`,
    "//",
    "// AUTO-GENERATED by scripts/trend-publish/render.ts — 손으로 고치지 말 것(초안 JSON 을 고쳐 다시 렌더).",
    `// 공식 발표 해설(트렌드 브리프) ${month} — 운영자 승인 발행분. 런북: docs/trend-publishing-runbook.md`,
    "// 표·정본 수치는 ${impactRows(…)}·${impactCell(…)}·${constText(…)} 보간(src/lib/trendBriefs/impacts.ts)으로만 들어간다.",
    'import type { Guide } from "@/lib/guidesData";',
  ];
  if (used.length) lines.push(`import { ${used.join(", ")} } from "@/lib/trendBriefs/impacts";`);
  lines.push("", `export const ${monthExportName(month)}: Guide[] = [`);
  if (body) lines.push(body);
  lines.push("];", "");
  return lines.join("\n");
}

/** 월별 파일에 항목 upsert (slug 기준, 멱등) */
export function upsertMonthly(existing: string | null, month: string, draft: TrendBriefDraft): string {
  const blocks = existing ? parseMonthlyBlocks(existing).filter((b) => b.slug !== draft.slug) : [];
  const entry = draftToEntrySource(draft);
  blocks.push({ slug: draft.slug, block: entry, publishedDate: draft.publishedDate });
  return buildMonthlyFile(month, blocks);
}

/** 월별 파일에서 항목 제거(철회) */
export function removeFromMonthly(existing: string, month: string, slug: string): string {
  return buildMonthlyFile(month, parseMonthlyBlocks(existing).filter((b) => b.slug !== slug));
}

export const IMPORT_MARKER = "// @trend-imports";
export const SPREAD_MARKER = "// @trend-spread";

/** 집계 파일(trend-briefs.ts)의 표식 뒤에 월별 import·spread 를 넣는다 (이미 있으면 그대로, 정렬 유지) */
export function upsertAggregator(existing: string, month: string): string {
  const text = existing.replace(/\r\n/g, "\n");
  const importLine = `import { ${monthExportName(month)} } from "./${monthFileBase(month)}";`;
  const spreadLine = `  ...${monthExportName(month)},`;
  const insertAfterMarker = (src: string, marker: string, line: string, linePrefix: RegExp): string => {
    const lines = src.split("\n");
    const at = lines.findIndex((l) => l.trim() === marker);
    if (at < 0) throw new Error(`[render] 집계 파일에 표식 ${marker} 없음`);
    if (lines.includes(line)) return src;
    let end = at + 1;
    while (end < lines.length && linePrefix.test(lines[end])) end++;
    const group = [...lines.slice(at + 1, end), line].sort();
    return [...lines.slice(0, at + 1), ...group, ...lines.slice(end)].join("\n");
  };
  let out = insertAfterMarker(text, IMPORT_MARKER, importLine, /^import \{ trendBriefs\d{6} \} from "\.\/trend-briefs-\d{4}-\d{2}";$/);
  out = insertAfterMarker(out, SPREAD_MARKER, spreadLine, /^ {2}\.\.\.trendBriefs\d{6},$/);
  return out;
}
