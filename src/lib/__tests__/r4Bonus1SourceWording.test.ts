// 공개 출처 표현 가드 2 — 성과급 화면 문자열에 '노조 자료'·'연봉체계 자료'를 출처로 쓰지 않는다
// (2026-11-18 R4 N2-calc-11 calc-02-F10, 운영자 규칙: 성과급·기업 소식은 언론 보도·회사 뉴스룸·DART·ALIO 만).
// 기존 publicSourceWording.test.ts(사내 공지·노조 공지 기반)와 같은 범위·같은 방식(문자열·템플릿·JSX 텍스트만, 주석 제외)으로 본다.
// 공유 테스트 파일을 넓히지 않고 이 단위 파일로 둔다(브랜치 병합 충돌 방지).
// '사람인'은 아직 /calc/samsung-display-bonus 접힌 FAQ 가 참고치로 인용해 전역 금지에 넣지 않고, LG화학 계산기에서만 막는다.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FORBIDDEN = /노조 ?자료|연봉체계 ?자료/;
const norm = (s: string) => s.replace(/\s+/g, " ");

function visibleTextOf(source: string, name: string): string {
  const sf = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, name.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const parts: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) parts.push(node.text);
    else if (ts.isTemplateExpression(node)) parts.push(node.head.text, ...node.templateSpans.map((s) => s.literal.text));
    else if (ts.isJsxText(node)) parts.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return norm(parts.join(" "));
}
const visibleText = (rel: string) => visibleTextOf(readFileSync(resolve(ROOT, rel), "utf8"), rel);
const isSource = (f: string) => /\.(?:tsx?|mts)$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.endsWith(".d.ts");
function walk(rel: string): string[] {
  const abs = resolve(ROOT, rel);
  if (statSync(abs).isFile()) return isSource(rel) ? [rel] : [];
  return readdirSync(abs).flatMap((name) => walk(join(rel, name).replace(/\\/g, "/")));
}

const PAGE_FILES = [
  ...readdirSync(resolve(ROOT, "src/app/calc"))
    .filter((d) => /bonus/.test(d) && statSync(resolve(ROOT, "src/app/calc", d)).isDirectory())
    .flatMap((d) => walk(`src/app/calc/${d}`)),
  "src/components/CalcNewsNote.tsx",
  "src/data/bonusData.ts",
  "src/data/bonusCalcHub.ts",
].sort();

describe("성과급 화면 출처에 '노조 자료'·'연봉체계 자료'가 없다 (N2-calc-11 calc-02-F10)", () => {
  it("정규식 자체 점검", () => {
    for (const s of ["LG화학 노조 자료", "노조자료", "카카오 연봉체계 자료", "연봉체계자료"]) expect(s, s).toMatch(FORBIDDEN);
    for (const s of ["노조 공지", "연봉 자료", "노조 요구"]) expect(s, s).not.toMatch(FORBIDDEN);
  });
  it(`성과급 계산기·데이터 ${PAGE_FILES.length}개 파일`, () => {
    expect(PAGE_FILES.length).toBeGreaterThan(40);
    const hits = PAGE_FILES.filter((f) => FORBIDDEN.test(visibleText(f)));
    expect(hits).toEqual([]);
  });
  it("LG화학 계산기는 '사람인'도 출처로 쓰지 않는다", () => {
    for (const f of walk("src/app/calc/lg-chem-bonus")) expect(visibleText(f), f).not.toContain("사람인");
  });
  it("리포트 행 출처(bonusData lg-chem) — 공개 보도", async () => {
    const { BONUS_PROFILES } = await import("@/data/bonusData");
    const chem = BONUS_PROFILES.find((p) => p.calcSlug === "lg-chem-bonus")!;
    expect(chem.payouts.find((p) => p.year === 2024)?.source).toBe("공개 보도 (page.tsx 출처)");
  });
});
