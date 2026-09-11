// scripts/calc-default-result.ts
//
// S3-1 본문 작성 보조 — 계산기의 기본 입력값(fields[].defaultValue)과 그 입력으로 compute() 가 돌려주는 결과를
// 그대로 출력한다. 설명(explanation) 두 번째 문단 '기본값 예시 계산' 의 숫자는 오직 이 출력에서 옮겨 적는다
// (docs/calc-content-writing-guide-2026-09-12.md §2). 값은 반올림하지 않은 원값이다.
//
// 실행: npx tsx scripts/calc-default-result.ts <slug> [<slug> ...]
//       npx tsx scripts/calc-default-result.ts --all          → 202종 전부, 한 줄에 하나(JSON Lines)
// 읽기 전용 — 저장소의 어떤 파일도 수정하지 않는다. 서버 전용 레지스트리(index.ts)만 import 한다.

import { allCalculators, defaultInputsOf, getCalculatorBySlug } from "../src/lib/simpleCalculators/index";
import type { CalculatorDef } from "../src/lib/simpleCalculators/types";

const args = process.argv.slice(2);
if (args.length === 0) {
  process.stderr.write("usage: npx tsx scripts/calc-default-result.ts <slug> [<slug> ...] | --all\n");
  process.exit(2);
}

const targets: CalculatorDef[] = args.includes("--all")
  ? allCalculators
  : args.map((slug) => {
      const calc = getCalculatorBySlug(slug);
      if (!calc) {
        process.stderr.write(`unknown slug: ${slug}\n`);
        process.exit(1);
      }
      return calc;
    });

for (const calc of targets) {
  const inputs = defaultInputsOf(calc);
  const fields = calc.fields.map((f) => ({ name: f.name, label: f.label, defaultValue: f.defaultValue, suffix: f.suffix ?? "" }));
  const line = { slug: calc.slug, title: calc.title, fields, result: calc.compute(inputs) };
  process.stdout.write(JSON.stringify(line, null, args.includes("--all") ? 0 : 1) + "\n");
}
