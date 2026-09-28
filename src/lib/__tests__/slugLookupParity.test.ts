// S24 — /qna·/glossary 상세 slug 조회를 "isolate 당 slug Map + slugCandidates" 로 바꾼 뒤에도
// 종전 구현(후보 루프 × 전 항목 find, 2fbe2c3 의 glossaryData.ts·qnaData.ts)과 결과가 같은지,
// 그리고 /qna/[slug] 가 더 이상 glossaryData 를 import 하지 않는지 확인한다.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { glossaryData, getGlossaryBySlug, toGlossarySlug } from "@/data/glossaryData";
import { qnaData, getQnaBySlug, toQnaSlug } from "@/data/qnaData";
import { recoverMojibakeUtf8, slugCandidates } from "@/lib/slugCandidates";

// ── 종전 구현 사본 (동작 비교 기준 — 수정 금지) ──────────────────────────────
function legacyRecoverMojibakeUtf8(s: string): string | null {
  let hasHighByte = false;
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code > 0xff) return null;
    if (code >= 0x80) hasHighByte = true;
  }
  if (!hasHighByte) return null;
  try {
    const bytes = Uint8Array.from(s, (c) => c.charCodeAt(0));
    const d = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return d !== s ? d : null;
  } catch {
    return null;
  }
}

function legacyCandidates(slug: string): string[] {
  const candidates: string[] = [slug];
  let cur = slug;
  for (let i = 0; i < 2; i++) {
    try {
      const d = decodeURIComponent(cur);
      if (d === cur) break;
      candidates.push(d);
      cur = d;
    } catch {
      break;
    }
  }
  for (const c of [...candidates]) {
    const r = legacyRecoverMojibakeUtf8(c);
    if (r) candidates.push(r);
  }
  return candidates;
}

function legacyFind<T>(items: T[], name: (item: T) => string, toSlug: (s: string) => string, slug: string): T | undefined {
  for (const c of legacyCandidates(slug)) {
    const found = items.find((item) => toSlug(name(item)) === toSlug(c));
    if (found) return found;
  }
  return undefined;
}
// ────────────────────────────────────────────────────────────────────────────

/** UTF-8 바이트를 Latin-1 문자로 잘못 읽은 모지바케 ("연봉" → "ì—°ë´‰" 류) */
const latin1View = (s: string) => String.fromCharCode(...new TextEncoder().encode(s));

/** 실존 항목 하나에서 파생한 입력들 — edge 가 넘길 수 있는 형태 + 경계 형태 */
function variantsOf(name: string, toSlug: (s: string) => string): string[] {
  const slug = toSlug(name);
  const enc = encodeURIComponent(slug);
  const moj = latin1View(slug);
  return [
    slug,
    enc, // 1회 인코딩
    encodeURIComponent(enc), // 이중 인코딩
    encodeURIComponent(encodeURIComponent(enc)), // 3중 인코딩 — 두 구현 모두 2회까지만 디코드(미매칭)
    moj, // 모지바케
    encodeURIComponent(moj), // 퍼센트 인코딩된 모지바케
    encodeURIComponent(encodeURIComponent(moj)),
    latin1View(name),
    name, // 원문(공백·문장부호 포함) — toSlug 로 정규화돼 매칭
    encodeURIComponent(name),
    ` ${name.toUpperCase()} `,
    `${slug}-`,
    `${slug}x`,
    slug.slice(0, -1),
    `${enc}%`, // 깨진 % 시퀀스 → 디코드 중단
    `${enc}%E0%A4%A`,
    `${moj}Ā`, // Latin-1 밖 문자 섞임 → 복구 안 함
  ];
}

const GENERIC_INPUTS = [
  "",
  "-",
  "this-entry-does-not-exist",
  "%E0%A4%A",
  "%",
  "%%",
  "%25",
  "%2525",
  "%ED%A0%80", // 인코딩된 단독 서로게이트 → URIError
  "\uD800",
  "ì—°ë´‰", // "연봉" 모지바케
  "ÿþ", // 유효하지 않은 UTF-8 바이트열
  "🙂",
  "%F0%9F%99%82",
  "a".repeat(300),
  "가".repeat(80),
  "__proto__", // Map 조회라 프로토타입 키도 일반 문자열 — 미매칭
  "constructor",
  "hasOwnProperty",
];

const families = [
  {
    label: "qna",
    names: qnaData.map((item) => item.question),
    toSlug: toQnaSlug,
    lookup: getQnaBySlug,
    legacy: (slug: string) => legacyFind(qnaData, (item) => item.question, toQnaSlug, slug),
  },
  {
    label: "glossary",
    names: glossaryData.map((item) => item.title),
    toSlug: toGlossarySlug,
    lookup: getGlossaryBySlug,
    legacy: (slug: string) => legacyFind(glossaryData, (item) => item.title, toGlossarySlug, slug),
  },
] as const;

function allInputs(names: readonly string[], toSlug: (s: string) => string): string[] {
  return [...GENERIC_INPUTS, ...names.flatMap((name) => variantsOf(name, toSlug))];
}

describe("S24 slug 조회 동작 동일성", () => {
  it.each(families)("$label: 모든 입력에서 종전 구현과 같은 항목(동일 객체)을 돌려준다", ({ names, toSlug, lookup, legacy }) => {
    const inputs = allInputs(names, toSlug);
    expect(inputs.length).toBeGreaterThan(names.length * 10);
    for (const input of inputs) {
      expect(lookup(input), JSON.stringify(input)).toBe(legacy(input));
    }
  });

  it.each(families)("$label: 실존 항목은 원문·인코딩·이중 인코딩·모지바케 slug 모두 같은 항목으로 매칭된다", ({ names, toSlug, lookup, legacy }) => {
    for (const name of names) {
      const slug = toSlug(name);
      const expected = legacy(slug);
      expect(expected, slug).toBeDefined();
      for (const input of [
        slug,
        encodeURIComponent(slug),
        encodeURIComponent(encodeURIComponent(slug)),
        latin1View(slug),
        encodeURIComponent(latin1View(slug)),
      ]) {
        expect(lookup(input), input).toBe(expected);
      }
    }
  });

  it.each(families)("$label: 없는·깨진 slug 는 undefined (예외 없음)", ({ lookup }) => {
    for (const input of ["", "this-entry-does-not-exist", "%E0%A4%A", "%ED%A0%80", "\uD800", "__proto__", "constructor"]) {
      expect(() => lookup(input)).not.toThrow();
      expect(lookup(input)).toBeUndefined();
    }
  });

  it("slugCandidates 는 종전 후보 목록과 순서까지 같다", () => {
    const inputs = [
      ...allInputs(qnaData.map((item) => item.question), toQnaSlug),
      ...allInputs(glossaryData.map((item) => item.title), toGlossarySlug),
    ];
    for (const input of inputs) {
      expect(slugCandidates(input), JSON.stringify(input)).toEqual(legacyCandidates(input));
    }
  });

  it("recoverMojibakeUtf8 는 옮긴 뒤에도 같은 결과", () => {
    expect(recoverMojibakeUtf8(latin1View("연봉"))).toBe("연봉");
    expect(recoverMojibakeUtf8("ì—°ë´‰")).toBeNull(); // U+2014·U+2030 은 Latin-1 밖 — 복구 대상 아님
    expect(recoverMojibakeUtf8("abc")).toBeNull();
    expect(recoverMojibakeUtf8("연봉")).toBeNull();
    expect(recoverMojibakeUtf8("ÿþ")).toBeNull();
    for (const input of [...GENERIC_INPUTS, ...glossaryData.map((item) => latin1View(item.title))]) {
      expect(recoverMojibakeUtf8(input)).toBe(legacyRecoverMojibakeUtf8(input));
    }
  });
});

// ── import 경계: /qna/[slug] edge 함수가 용어 사전 데이터를 싣지 않는다 ─────────
const ROOT = process.cwd();
const EXTS = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx"];

function resolveLocal(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = path.join(ROOT, "src", spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null; // 패키지 import 는 대상 아님
  for (const ext of EXTS) {
    const p = base + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

/** 정적 import/re-export 를 따라간 로컬 모듈 집합 (import type 은 번들에 안 실리므로 제외) */
function staticImportClosure(entry: string): Set<string> {
  const seen = new Set<string>();
  const stack = [path.join(ROOT, entry)];
  const re = /(?:^|\n)\s*(?:import|export)\s+(type\s+)?[^;'"]*?from\s+["']([^"']+)["']|(?:^|\n)\s*import\s+["']([^"']+)["']/g;
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(re)) {
      if (m[1]) continue;
      const resolved = resolveLocal(file, m[2] ?? m[3]);
      if (resolved) stack.push(resolved);
    }
  }
  return new Set([...seen].map((p) => path.relative(ROOT, p).split(path.sep).join("/")));
}

describe("S24 import 경계", () => {
  it("/qna/[slug] 는 qnaData·slugCandidates 만 싣고 glossaryData 는 싣지 않는다", () => {
    const closure = staticImportClosure("src/app/qna/[slug]/page.tsx");
    expect(closure.has("src/data/qnaData.ts")).toBe(true);
    expect(closure.has("src/lib/slugCandidates.ts")).toBe(true);
    expect(closure.has("src/data/glossaryData.ts")).toBe(false);
  });

  it("/glossary/[slug] 는 qnaData 를 싣지 않고, slugCandidates 는 어떤 로컬 모듈도 import 하지 않는다", () => {
    const closure = staticImportClosure("src/app/glossary/[slug]/page.tsx");
    expect(closure.has("src/data/glossaryData.ts")).toBe(true);
    expect(closure.has("src/data/qnaData.ts")).toBe(false);
    expect([...staticImportClosure("src/lib/slugCandidates.ts")]).toEqual(["src/lib/slugCandidates.ts"]);
  });
});
