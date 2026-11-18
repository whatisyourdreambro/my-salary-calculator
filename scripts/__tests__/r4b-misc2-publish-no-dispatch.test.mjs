// node --test scripts/__tests__/r4b-misc2-publish-no-dispatch.test.mjs
// 운영자 결정 2026-11-18 질문 C-10 A안 (N2-scripts-09, scripts-b09-F02): 트렌드 브리프 발행기(publish-approved.mjs)는 main 에 반영한 뒤
// 운영 게시를 스스로 접수하지 않는다. 'Pages · 승인 후 게시'(pages-publish.yml)는 그 커밋까지의 main 전체를 운영에 올리므로,
// 운영자가 아직 게시하지 않은 다른 main 커밋까지 함께 나가지 않게 게시 버튼은 운영자가 앱에서 누른다(11/13 결정).
// 실행 경로는 trend-publish.test.mjs 의 가짜 실행기 경우가 고정하고, 여기서는 소스에 접수 경로가 다시 생기지 않는지만 본다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const source = readFileSync(join(ROOT, "scripts/trend-publish/publish-approved.mjs"), "utf8");
// 주석을 뺀 코드 — 설명 주석의 파일 이름은 허용
const code = source.replace(/^\s*\/\/.*$/gm, "");

test("발행기 코드에 운영 게시 접수(pages-cloud-dispatch 실행·워크플로 dispatch)가 없다", () => {
  assert.doesNotMatch(code, /join\(\s*wt\s*,\s*["']scripts\/pages-cloud-dispatch\.mjs["']\s*\)/);
  assert.doesNotMatch(code, /--approved-commit/);
  assert.doesNotMatch(code, /\/dispatches\b/);
  assert.doesNotMatch(code, /method:\s*["']POST["']/);
  // 준비 검사(읽기)는 그대로 — 운영자가 앱에서 게시할 워크플로와 정책 버전이 살아 있는지 확인한다
  assert.match(code, /contents\/scripts\/pages-cloud-dispatch\.mjs\?ref=/);
  assert.match(code, /actions\/workflows\/pages-publish\.yml`\)/);
});

test("푸시 뒤 알림은 전체 40자 SHA 와 운영자 게시 안내, 짧은 SHA 로는 알리지 않는다", () => {
  assert.ok(code.includes("`[publish] main 반영 ${pushed} — 게시는 운영자가 앱에서 Pages · 승인 후 게시로 이 커밋을 실행`"));
  assert.match(code, /if \(!SHA\.test\(pushed\)\) \{/);
  assert.doesNotMatch(code, /pushed\.slice\(/);
  assert.match(source, /커밋 → push main → 여기서 멈춤\. 운영 게시는 운영자가 앱에서 'Pages · 승인 후 게시'로/);
});

test("게시 접수 스크립트와 게시 워크플로 자체는 그대로 있다(운영자가 앱에서 쓰는 경로)", () => {
  const dispatch = readFileSync(join(ROOT, "scripts/pages-cloud-dispatch.mjs"), "utf8");
  assert.match(dispatch, /export\s+const\s+PAGES_CLOUD_DISPATCH_VERSION\s*=\s*1\s*;/);
  const workflow = readFileSync(join(ROOT, ".github/workflows/pages-publish.yml"), "utf8");
  for (const input of ["approved_commit:", "article_slug:", "article_marker:", "retirement_to:"]) assert.ok(workflow.includes(input), input);
});
