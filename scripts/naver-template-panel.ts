// scripts/naver-template-panel.ts
//
// 네이버 템플릿 패널(R6-05) — GA4 'NAVER-PANEL' 탐색 CSV 로컬 집계기(수동 도구, 배포·빌드 무관).
// 템플릿(destTemplate 세분화)별 네이버 검색 세션·참여 세션·조회수·고유 URL·세션/페이지와,
// 사이트맵을 주면 커버리지(템플릿 사이트맵 URL 중 네이버 유입 1회 이상 비율)를 낸다. 주제 클러스터는 따로 낸다.
//
// 사용법:
//   npx tsx scripts/naver-template-panel.ts <ga4-28d.csv> [--7d <csv>] [--sitemap <file|https-url>]
//     [--slate /job/professor,/job/doctor,/home-loan [--referrer <리퍼러 csv>]] [--log-line]
//
// 운영자 절차(GA4 탐색 만들기·월요일 내보내기)·사전 등록 판독: docs/naver-template-panel.md
// 출력: stdout 마크다운 표만(--log-line 이면 URL 없는 한 줄만). 파일을 쓰지 않는다.
// 종료 코드: 0 성공 · 1 사용법/읽기/헤더/사이트맵 오류 · 2 저장소 안 경로 거부.
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import { runNaverTemplatePanelCli } from "../src/lib/naverTemplatePanel";

/** 정션·심볼릭 링크를 푼 실제 경로. 파일이 없으면 부모 폴더까지만 풀고, 그것도 없으면 문자열 경로. */
function realpath(p: string): string {
  try {
    return realpathSync.native(p);
  } catch {
    try {
      return path.join(realpathSync.native(path.dirname(p)), path.basename(p));
    } catch {
      return path.resolve(p);
    }
  }
}

/** --sitemap 이 https 주소일 때만. Cloudflare 가 기본 UA 를 403 으로 막으므로 브라우저형 UA 를 붙인다. */
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) moneysalary-naver-template-panel/1" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

runNaverTemplatePanelCli(process.argv.slice(2), {
  repoRoot: path.resolve(__dirname, ".."),
  cwd: process.cwd(),
  realpath,
  readText: (p) => readFileSync(p, "utf8"),
  fetchText,
}).then(
  (result) => {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exitCode = result.code;
  },
  (error: unknown) => {
    process.stderr.write(`오류: ${error instanceof Error ? error.name : "unknown"}\n`);
    process.exitCode = 1;
  },
);
