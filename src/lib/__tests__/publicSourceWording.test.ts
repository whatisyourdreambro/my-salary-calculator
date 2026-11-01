// 공개 출처 표현 회귀 가드 — 성과급 화면 문자열에 '사내 공지'·'노조 공지 기반'을 쓰지 않는다
// (B28 STR-04-B, 운영자 승인 2026-11-01 5번 / 운영자 규칙 2026-10-08: 성과급·기업 소식은 언론 보도·회사 뉴스룸·DART 같은
//  공개 출처로만 쓰고, 사내 공지 원문을 본 듯한 표현은 쓰지 않는다).
//
// 10/9 정리(4b717914c·9820064e3·7f3428a84·ce408a96a) 가운데 광고 위에 보이는 문구가 B28 로 들어와, 이제 성과급 화면 문자열에는
// 두 표현이 남아 있지 않다. 다시 들어오면 실패한다. 화면에 나올 수 있는 글만 본다 — 코드 주석은 보지 않는다.
//  1) 성과급 계산기·페이지 소스(src/app/calc/*bonus*/, src/app/chuseok-bonus-2026/, src/app/samsung-negotiation-2026/,
//     src/lib/bonusHome/, 성과급 데이터·보도 요약 모듈): TypeScript 구문 트리에서 문자열·템플릿·JSX 텍스트만 꺼낸다.
//  2) 성과급 가이드: 제목·설명·검색 설명·본문·광고 아래 보강에 '성과급'이 나오는 한국어 가이드 전부(HTML 태그를 뺀 글).
//  3) 삼성 OPI 출처 표기(opiData sourceNote) — 계산기 광고 위 실지급률 문단과 접힌 FAQ 에 그대로 끼워진다.
// 독자에게 '본인 회사 공지를 확인하라'고 안내하거나 회사가 알리는 방식을 설명하는 문장은 출처 표기가 아니어서 ALLOWED 에
// 정확한 구절로만 둔다(구절이 바뀌거나 사라지면 실패 — 목록이 낡지 않게). 새 구절을 넣기 전에 운영자 규칙부터 볼 것.
//
// 아래 'B28 광고 위 문구' 묶음은 이식한 문구가 2026-11-01 에 다시 확인한 공개 보도와 정본 상수에 맞는지 고정한다:
//  - 재원 'DS부문 영업이익의 10.5%': 한국경제 2026-10-07 https://www.hankyung.com/article/2026100792131
//    ('성과급 재원은 올해 DS부문 영업이익의 10.5%로 마련된다'), 이투데이 https://www.etoday.co.kr/news/view/2633534
//  - 370조원 기준이 매체마다 다름: 한국경제·이투데이는 회사 전체 영업이익 컨센서스, 데일리안 https://www.dailian.co.kr/news/view/1699059
//    은 '증권가의 올해 DS부문 영업이익 전망치' — 세 기사 모두 노조 추산은 기존 OPI 포함 세전
//  - CL4(부장급) 고과 배수 EM 1.4·ES 1.2·MT 1.0·MS 0.9·NM 0.8: 인더스트리뉴스 2026-10-07
//    https://www.industrynews.co.kr/news/articleView.html?idxno=87174
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { guideSupplements } from "@/lib/guides/supplements";
import { OPI_ACTUAL, OPI_LATEST } from "@/app/calc/samsung-bonus/opiData";
import { FIXED_RERATE, getThreshold } from "@/app/calc/samsung-bonus/model";
import { staticRouteLastModified } from "@/app/sitemap";
import { koreanDay } from "../../../scripts/lib/sitemap-freshness.mjs";

const ROOT = process.cwd();
/** 금지 표현 — 붙여 쓴 꼴도 잡는다 */
const FORBIDDEN = /사내 ?공지|노조 ?공지 ?기반/;
const FORBIDDEN_G = new RegExp(FORBIDDEN.source, "g");
const norm = (s: string) => s.replace(/\s+/g, " ");

/** 소스에서 화면에 나올 수 있는 글만 — 문자열·템플릿 조각·JSX 텍스트(주석·import 경로 제외), 띄어쓰기 정규화 */
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

/** 성과급 계산기·페이지와 화면 데이터 모듈 */
const PAGE_DIRS = [
  ...readdirSync(resolve(ROOT, "src/app/calc"))
    .filter((d) => /bonus/.test(d) && statSync(resolve(ROOT, "src/app/calc", d)).isDirectory())
    .map((d) => `src/app/calc/${d}`),
  "src/app/chuseok-bonus-2026",
  "src/app/samsung-negotiation-2026",
  "src/lib/bonusHome",
];
const PAGE_MODULES = [
  "src/components/CalcNewsNote.tsx",
  "src/data/bonusAnnouncements.ts",
  "src/data/opiAnnouncement.ts",
  "src/data/bonusData.ts",
  "src/data/bonusCalcHub.ts",
];
const PAGE_FILES = [...PAGE_DIRS.flatMap(walk), ...PAGE_MODULES].sort();

/** 성과급 가이드(한국어) — 화면 글 전체 */
const guideText = (g: (typeof koGuides)[number]) =>
  norm(
    [g.title, g.description, (g as { metaDescription?: string }).metaDescription ?? "", g.content, guideSupplements[g.slug] ?? ""]
      .join(" ")
      .replace(/<[^>]+>/g, " "),
  );
const BONUS_GUIDES = koGuides.filter((g) => /성과급/.test(guideText(g)));

/** 출처 표기가 아닌 독자 안내·회사 공지 방식 설명 — 정확한 구절만(띄어쓰기 정규화 후) */
const ALLOWED: ReadonlyArray<{ where: string; text: string; why: string }> = [
  { where: "src/app/calc/kepco-bonus/page.tsx", text: "정확한 일정은 사내 공지로 확인하세요", why: "독자 안내(접힌 FAQ)" },
  { where: "src/app/calc/kepco-bonus/page.tsx", text: "정확한 일정은 사내 공지 기준으로 확인하세요", why: "독자 안내(본문)" },
  { where: "src/app/calc/hyundai-mobis-bonus/page.tsx", text: "인출 가능 시점을 사내 공지로 확인하세요", why: "독자 안내(접힌 FAQ)" },
  { where: "src/app/calc/gs-caltex-bonus/page.tsx", text: "'기본연봉의 %' 형태로 사내 공지됩니다", why: "회사가 알리는 방식 설명(출처 아님, 접힌 FAQ)" },
  { where: "guide:lg-hyundai-posco-bonus-2026", text: "회사 발표나 사내 공지로 본인 사업본부 지급률을 확인해야 합니다", why: "독자 안내(LG전자 FAQ)" },
];
const textOfSurface = (where: string) => {
  if (where.startsWith("guide:")) {
    const g = koGuides.find((x) => x.slug === where.slice(6));
    if (!g) throw new Error(`${where} 없음`);
    return guideText(g);
  }
  return visibleText(where);
};
/** 허용 구절을 지운 뒤 남은 금지 표현(앞뒤 문맥 포함) */
function violations(where: string, text: string): string[] {
  let rest = text;
  for (const a of ALLOWED) if (a.where === where) rest = rest.split(a.text).join(" ");
  return [...rest.matchAll(FORBIDDEN_G)].map((m) => `${where}: …${rest.slice(Math.max(0, m.index! - 30), m.index! + 30)}…`);
}

describe("추출기 자체 점검 — 주석은 빼고 문자열·템플릿·JSX 텍스트는 잡는다", () => {
  const sample = [
    "// 사내 공지 (주석 — 무시)",
    "/* 노조 공지 기반 (블록 주석 — 무시) */",
    'const a = "확정은 사내 공지로 정해집니다";',
    "const b = `${a} — 노조 공지 기반 보도`;",
    "export function C() { return <p>{/* 사내 공지 */}지급률은 사내",
    "   공지 기준입니다</p>; }",
  ].join("\n");
  it("문자열·템플릿·줄이 나뉜 JSX 텍스트의 금지 표현 3곳을 찾고 주석 3곳은 보지 않는다", () => {
    const text = visibleTextOf(sample, "sample.tsx");
    expect([...text.matchAll(FORBIDDEN_G)].map((m) => m[0])).toEqual(["사내 공지", "노조 공지 기반", "사내 공지"]);
    expect(visibleTextOf("// 사내 공지\nconst x = 1;", "x.ts")).toBe("");
  });
});

describe("범위 — 성과급 화면이 빠지지 않았다", () => {
  it("계산기·페이지 소스에 B28 이 고친 화면과 성과급 계산기 전부가 들어 있다", () => {
    for (const f of [
      "src/app/calc/samsung-bonus/page.tsx",
      "src/app/calc/samsung-bonus/Client.tsx",
      "src/app/calc/samsung-bonus/opiData.ts",
      "src/app/calc/sk-hynix-bonus/page.tsx",
      "src/app/calc/sk-hynix-bonus/psData.ts",
      "src/app/calc/bonus-home-plan/page.tsx",
      "src/app/calc/bonus-home-plan/Client.tsx",
      "src/app/samsung-negotiation-2026/page.tsx",
      "src/lib/bonusHome/compEngines.ts",
      "src/app/calc/bonus-calculators/page.tsx",
    ]) expect(PAGE_FILES, f).toContain(f);
    expect(PAGE_DIRS.filter((d) => d.startsWith("src/app/calc/")).length).toBeGreaterThanOrEqual(25);
    expect(PAGE_FILES.some((f) => /\.test\./.test(f))).toBe(false);
  });

  it("성과급 가이드에 B28 이 고친 삼성·SK 가이드가 모두 들어 있다", () => {
    const slugs = new Set(BONUS_GUIDES.map((g) => g.slug));
    for (const s of [
      "samsung-opi-forecast-2027",
      "sk-hynix-ps-forecast-2027",
      "samsung-opi-tai-complete-2026",
      "sk-hynix-bonus-renegotiation-sept-2026",
      "sk-hynix-ps-cash-vs-stock-scenarios-2026",
      "samsung-bonus-treasury-stock-15-trillion-2026",
      "samsung-vs-sk-hynix-stock-bonus-2026",
      "samsung-special-bonus-q3-preview-2027",
      "samsung-wage-negotiation-2026",
      "chip-rsu-stock-tax-2026",
    ]) expect(slugs.has(s), s).toBe(true);
    expect(BONUS_GUIDES.length).toBeGreaterThanOrEqual(50);
  });
});

describe("성과급 화면 문자열에 '사내 공지'·'노조 공지 기반'이 없다", () => {
  it("계산기·페이지 소스(주석 제외)", () => {
    expect(PAGE_FILES.flatMap((f) => violations(f, visibleText(f)))).toEqual([]);
  });

  it("성과급 가이드 제목·설명·본문·보강", () => {
    expect(BONUS_GUIDES.flatMap((g) => violations(`guide:${g.slug}`, guideText(g)))).toEqual([]);
  });

  it("삼성 OPI 출처 표기(sourceNote)는 공개 보도 표현이고, 계산기는 그 값을 그대로 끼운다", () => {
    for (const y of OPI_ACTUAL) {
      expect(y.sourceNote, String(y.fiscalYear)).not.toMatch(FORBIDDEN);
      expect(y.sourceNote, String(y.fiscalYear)).toMatch(/보도/);
    }
    // 2025년분 6행은 모두 둘 이상의 언론 기사에 있다(2026-11-02 재검색, opiData.ts 주석).
    expect(OPI_LATEST.sourceNote).toBe("복수 언론 보도");
    const page = readFileSync(resolve(ROOT, "src/app/calc/samsung-bonus/page.tsx"), "utf8");
    expect(page).toContain("{OPI_LATEST.sourceNote}에 따른 실제 지급률은");
    expect(page).toContain("`${OPI_LATEST.sourceNote}에 따르면 ${OPI_LATEST.fiscalYear}년 실적분 OPI");
  });

  it("허용 구절은 실제로 있고, 금지 표현을 담은 안내·설명 문장이다(낡은 항목 없음)", () => {
    for (const a of ALLOWED) {
      expect(textOfSurface(a.where), `${a.where} — ${a.why}`).toContain(a.text);
      expect(a.text, a.where).toMatch(FORBIDDEN);
      expect(a.text, a.where).toMatch(/확인|형태로/);
    }
    for (const a of ALLOWED.filter((x) => !x.where.startsWith("guide:"))) expect(PAGE_FILES, a.where).toContain(a.where);
    for (const a of ALLOWED.filter((x) => x.where.startsWith("guide:"))) {
      expect(BONUS_GUIDES.some((g) => `guide:${g.slug}` === a.where), a.where).toBe(true);
    }
  });
});

describe("B28 광고 위 문구 — 2026-11-01 재확인한 공개 보도·정본 상수와 같다", () => {
  const page = visibleText("src/app/calc/samsung-bonus/page.tsx");
  const client = visibleText("src/app/calc/samsung-bonus/Client.tsx");
  const plan = visibleText("src/app/calc/bonus-home-plan/page.tsx");

  it("정본: 재원 10.5%, 지급 조건 200조(2026~28년)·100조(2029년부터)", () => {
    expect(FIXED_RERATE).toBe(10.5);
    expect([getThreshold(2026), getThreshold(2028), getThreshold(2029)]).toEqual([200, 200, 100]);
  });

  it("/calc/samsung-bonus 사업부 시나리오 소개: 노조 추산은 기존 OPI 포함 세전, 370조원은 매체마다 회사 전체·DS부문 기준이 다르다", () => {
    expect(page).toContain(
      "사업부에 따라 1인당 성과급이 크게 다릅니다. 아래는 10월 7일 보도된 노조의 가정 추정(연봉 8천만원대, 기존 OPI 포함 세전)이며, 370조원은 매체에 따라 회사 전체 또는 DS부문 영업이익 전망치입니다.",
    );
    expect(page).not.toContain("삼성전자 DS(반도체) 부문은 메모리·공통·파운드리·시스템LSI 세 갈래로");
  });

  it("/calc/samsung-bonus 재원은 DS부문 영업이익 10.5%(분배 모델 1단계·본문 제목과 문단·하단 안내)", () => {
    expect(page).toContain(`OPI2 재원 = DS 영업이익 × ${FIXED_RERATE}%`);
    expect(page).toContain(`DS 영업이익 ${FIXED_RERATE}% — 의미와 한계`);
    expect(page).toContain(`공개 보도에 따르면 특별경영성과급 재원은 DS부문 영업이익의 ${FIXED_RERATE}%이고,`);
    expect(page).toContain(`DS부문 영업이익 ${FIXED_RERATE}% 재원·부문 사업부 4:6 비율은 보도 기반 고정값`);
    for (const old of ["OPI2 재원 산정 (영업이익 × 10.5%)", "영업이익 10.5% 재원 — 의미와 한계", "영업이익의 일정 비율을 성과급 풀로", "영업이익 분배 모델 추정치"]) {
      expect(page, old).not.toContain(old);
    }
  });

  it("/calc/samsung-bonus CL4 배수: 하위 0.9배·0.8배(10월 7일 보도)와 시뮬레이터 3단계 한계를 밝힌다", () => {
    expect(page).toContain("가고과 1.4배 · 나고과 1.2배 · 일반 1.0배, 하위 0.9배 · 0.8배(10월 7일 보도).");
    expect(page).toContain("위 다년도 시뮬레이터는 가·나·일반 3단계만 반영합니다.");
    expect(page).toContain("* 배수는 언론 보도 기준이며, 등급별 분포는 공개되지 않았습니다.");
    expect(client).toContain("나고과 1.2배 · 일반 1.0배가 적용됩니다(하위 0.9·0.8배는 미반영, 분포 직접 입력).");
    expect(client).not.toContain("등급 분포는 공개되지 않아");
  });

  // G3(2026-11-01): 구조화 데이터 날짜는 문자열 대신 사이트맵 lastmod 와 같은 함수(staticRouteLastModified)에서 온다.
  // 그 한국 날짜가 메타·하단 '페이지 수정일'과 같아야 한다 — 사이트맵 날짜를 올리면 화면 날짜도 함께 검토하게 된다.
  it("/calc/samsung-bonus 날짜 세 곳(메타·구조화 데이터·하단 '페이지 수정일')이 같다", () => {
    const src = readFileSync(resolve(ROOT, "src/app/calc/samsung-bonus/page.tsx"), "utf8");
    const meta = src.match(/"article:modified_time": "(\d{4}-\d{2}-\d{2})"/)?.[1];
    expect(src).toContain("dateModified: staticRouteLastModified(PAGE_PATH),");
    expect(src).toContain('const PAGE_PATH = "/calc/samsung-bonus";');
    const ld = koreanDay(staticRouteLastModified("/calc/samsung-bonus"));
    const shown = src.match(/페이지 수정일: <time dateTime="(\d{4}-\d{2}-\d{2})">(\d{4}-\d{2}-\d{2})<\/time>/);
    expect(meta).toBeDefined();
    expect([ld, shown?.[1], shown?.[2]]).toEqual([meta, meta, meta]);
  });

  it("/calc/bonus-home-plan 본문: 특별경영성과급은 DS 영업이익 10.5%, 200조·100조 조건", () => {
    expect(plan).toContain(`특별경영성과급(DS 영업이익 ${FIXED_RERATE}%, 2026~28년 ${getThreshold(2026)}조·29년부터 ${getThreshold(2029)}조 미만이면 0)`);
    expect(plan).not.toContain("영업이익 10.5% 재원, 2026~28년");
  });

  // samsung-special-bonus-q3-preview-2027 은 뺀다: 10/9 정리는 그 글의 '제도 규칙' 재원 줄만 고쳤고, 설명·첫 문단의
  // '규칙(영업이익 10.5%…)'과 시나리오 표의 '영업이익 × 10.5%'(회사 전체 영업이익 전망을 넣은 사이트 모델 산수)는 남겼다 —
  // DS부문 기준과 다르다는 점은 광고 아래 보강(supplements-samsung-ds-2026-10.ts)이 밝힌다. 설명·첫 문단 정리는 별도 승인 몫.
  it("고친 화면에서 재원 10.5% 는 DS부문(DS) 영업이익으로만 쓴다", () => {
    const BARE = /(?<!DS부문 (?:연간 )?|DS )영업이익(?:의)? 10\.5%/;
    const surfaces: Array<[string, string]> = [
      ["/calc/samsung-bonus page", page],
      ["/calc/samsung-bonus Client", client],
      ["/calc/bonus-home-plan page", plan],
      ["/samsung-negotiation-2026", visibleText("src/app/samsung-negotiation-2026/page.tsx")],
      ...[
        "samsung-opi-tai-complete-2026",
        "samsung-bonus-treasury-stock-15-trillion-2026",
        "samsung-vs-sk-hynix-stock-bonus-2026",
        "samsung-wage-negotiation-2026",
      ].map((s): [string, string] => [s, guideText(koGuides.find((g) => g.slug === s)!)]),
    ];
    for (const [name, text] of surfaces) {
      expect(text, name).not.toMatch(BARE);
      expect(text, name).not.toContain("사업성과의 10.5%");
    }
  });

  it("가이드: OPI 표 머리는 언론 보도를 앞에 두고, 반도체 심층 가이드 면책문에 직원 후기 플랫폼이 없다", () => {
    const opi = guideText(koGuides.find((g) => g.slug === "samsung-opi-forecast-2027")!);
    expect(opi).toContain("언론 보도(2026-01-16·28)로 확인된 2025년분 OPI(2026-01-30 지급) 사업부별 지급률입니다.");
    expect(opi).not.toContain("노조 공개 공지");
    expect(opi).not.toContain("전국삼성전자노동조합 공지(2026-01-16)와 보도로");
    for (const s of ["samsung-wage-negotiation-2026", "sk-hynix-wage-2026", "chip-rsu-stock-tax-2026"]) {
      const t = guideText(koGuides.find((g) => g.slug === s)!);
      expect(t, s).toContain("공개된 보도자료·DART 공시 등 공개 정보 기반의 추정치입니다.");
      expect(t, s).not.toMatch(/잡플래닛|블라인드/);
    }
  });
});

// 2026-11-02(OF2 S1): OPI·OPI2 명칭은 언론 표기 — '초과이익성과급(OPI)': 머니투데이 2026-01-16
// https://www.mt.co.kr/industry/2026/01/16/2026011615081356804 , '특별경영성과급(OPI2)': 한국경제 2026-10-07
// https://www.hankyung.com/article/2026100792131 . 금→급 한 글자 교체라 글자 폭이 같다.
describe("OPI·OPI2 명칭 — 언론 표기", () => {
  it("OPI·OPI2 표기는 언론 표기(초과이익성과급·특별경영성과급)", () => {
    for (const bad of ["초과이익성과금", "특별경영성과금"]) {
      expect(PAGE_FILES.filter((f) => visibleText(f).includes(bad)), bad).toEqual([]);
      expect(BONUS_GUIDES.filter((g) => guideText(g).includes(bad)).map((g) => g.slug), bad).toEqual([]);
    }
  });
});
