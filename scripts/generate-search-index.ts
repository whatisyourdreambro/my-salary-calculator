// 헤더 검색 인덱스 경량 파생 데이터 생성기 — npx tsx scripts/generate-search-index.ts
//
// 배경(2026-08-24): 헤더 검색 청크가 약 2.3MB — src/lib/searchIndex.ts 가
// koGuides(가이드 본문 content 포함 ~1.5MB)와 companyRepository(회사 DB 전문
// ~680KB)를 통째로 클라이언트 번들에 끌고 들어갔다. 검색은 가이드
// title/description/slug/category, 회사 id/name/industry 만 쓰므로 이 스크립트가
// 원본 데이터에서 해당 필드만 뽑은 정적 파생 파일 3개를 생성한다.
//   - src/data/guideSearchIndex.ts    (ko 가이드 검색 메타 — 본문 제외)
//   - src/data/companySearchIndex.ts  (회사 검색 메타 — 연봉 데이터 제외)
//   - src/data/calcSearchIndex.ts     (계산기 검색 메타 — enrichment 본문·아이콘 제외.
//     allCalculators 직접 import 는 explanation/faqs ~290KB + react/lucide 까지
//     검색 청크에 실어 목표(~300KB)를 못 맞춰 함께 파생화 — 2026-08-24 실측)
//
// ★ tree-shake 로는 해결 불가: koGuideCards·allCompanies.map(...) 같은 "런타임
//   파생"은 파생 계산이 원본 값을 실제로 읽으므로 원본 모듈 전체가 번들에 남는다.
//   빌드 전에 미리 뽑아 둔 정적 파생 파일을 import 하는 것만이 구조적으로 확실하다.
//
// 재실행 시점: 가이드(src/lib/guides/*, guidesData.ts) 또는 회사 데이터
// (src/data/*Companies*.ts, seedCompanies, globalCompanies, companyAliases)를
// 추가·수정했을 때. 재생성을 잊으면 새 항목이 헤더 검색에서 누락된다.
// 드리프트 검증: npx tsx scripts/generate-search-index.ts --check
//   (생성물이 원본 데이터와 어긋나 있으면 diff 요약 출력 후 exit 1 — CI 적합)
//
// (verify-sitemap.ts 처럼 @/ alias 를 쓰므로 tsx 로 실행한다.)

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { koGuides } from "@/lib/guidesData";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { allCalculators } from "@/lib/simpleCalculators";

const CHECK_MODE = process.argv.includes("--check");
const DATA_DIR = join(process.cwd(), "src", "data");

// ── 파생 데이터 (searchIndex.ts 의 SearchEntry 매핑에 필요한 필드만) ──

const guideItems = koGuides.map((g) => ({
  slug: g.slug,
  title: g.title,
  description: g.description,
  category: g.category,
}));

const calcItems = allCalculators.map((c) => ({
  slug: c.slug,
  title: c.title,
  description: c.description,
}));

const companyItems = companyRepository.getAll().map((c) => ({
  id: c.id,
  name: c.name.ko,
  industry: c.industry,
  // 별칭(옛 사명·줄임말)은 현재 헤더 검색 매칭에는 안 쓰이지만 수 KB 수준이라
  // 향후 별칭 매칭 도입 대비로 함께 실어 둔다 (companyAliases 주입 결과).
  ...(c.aliases && c.aliases.length > 0 ? { aliases: c.aliases } : {}),
}));

// ── 모듈 렌더링 (결정적 출력 — --check 문자열 비교의 전제) ──

function renderModule(opts: {
  sourceNote: string;
  typeName: string;
  typeBody: string;
  constName: string;
  items: unknown[];
}): string {
  const rows = opts.items.map((i) => `  ${JSON.stringify(i)},`).join("\n");
  return [
    "// AUTO-GENERATED — 직접 수정 금지.",
    `// 원본: ${opts.sourceNote}`,
    "// 재생성: npx tsx scripts/generate-search-index.ts   (검증: 동일 명령 + --check)",
    "// 원본 데이터 추가·수정 시 반드시 재생성 — 안 하면 헤더 검색에서 새 항목이 빠진다.",
    "",
    `export interface ${opts.typeName} {`,
    opts.typeBody,
    "}",
    "",
    `export const ${opts.constName}: ${opts.typeName}[] = [`,
    rows,
    "];",
    "",
  ].join("\n");
}

const OUTPUTS: { file: string; content: string; label: string }[] = [
  {
    file: join(DATA_DIR, "guideSearchIndex.ts"),
    label: `가이드 ${guideItems.length}건`,
    content: renderModule({
      sourceNote:
        "src/lib/guidesData.ts (koGuides) — 검색에 쓰는 메타만 추출(본문 content 제외)",
      typeName: "GuideSearchItem",
      typeBody: "  slug: string;\n  title: string;\n  description: string;\n  category: string;",
      constName: "guideSearchIndex",
      items: guideItems,
    }),
  },
  {
    file: join(DATA_DIR, "calcSearchIndex.ts"),
    label: `계산기 ${calcItems.length}건`,
    content: renderModule({
      sourceNote:
        "src/lib/simpleCalculators (allCalculators) — slug·제목·설명만 추출(enrichment 본문 제외)",
      typeName: "CalcSearchItem",
      typeBody: "  slug: string;\n  title: string;\n  description: string;",
      constName: "calcSearchIndex",
      items: calcItems,
    }),
  },
  {
    file: join(DATA_DIR, "companySearchIndex.ts"),
    label: `회사 ${companyItems.length}건`,
    content: renderModule({
      sourceNote:
        "src/lib/salary-data/CompanyRepository.ts (getAll) — id·한글명·업종·별칭만 추출",
      typeName: "CompanySearchItem",
      typeBody: "  id: string;\n  name: string;\n  industry: string;\n  aliases?: string[];",
      constName: "companySearchIndex",
      items: companyItems,
    }),
  },
];

let drift = 0;
for (const out of OUTPUTS) {
  if (CHECK_MODE) {
    const onDisk = existsSync(out.file) ? readFileSync(out.file, "utf8") : "";
    if (onDisk === out.content) {
      console.log(`[OK] ${out.file} — 원본과 일치 (${out.label})`);
    } else {
      console.error(
        `[DRIFT] ${out.file} — 원본 데이터와 불일치 (기대 ${out.label}). ` +
          "npx tsx scripts/generate-search-index.ts 로 재생성하세요."
      );
      drift++;
    }
  } else {
    writeFileSync(out.file, out.content);
    console.log(`[generated] ${out.file} (${out.label}, ${out.content.length.toLocaleString()} bytes)`);
  }
}

if (CHECK_MODE && drift > 0) process.exit(1);
