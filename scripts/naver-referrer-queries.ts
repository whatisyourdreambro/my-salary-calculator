// scripts/naver-referrer-queries.ts
//
// 네이버 검색어 × 방문 페이지 표 — GA4 페이지 리퍼러 내보내기 로컬 집계기(수동 도구, 배포·빌드 무관).
// 서치어드바이저는 검색어별 방문 페이지를 주지 않는다. GA4 자동 page_view 의 '페이지 리퍼러'에
// 네이버 검색 URL(query=)이 남아 있으면 그 빈칸을 채울 수 있다 — 남는 비율(커버리지)도 함께 보고한다.
//
// 사용법:
//   npx tsx scripts/naver-referrer-queries.ts <ga4-export.csv> [--top 200] [--by query|landing]
//
// GA4 내보내기 만드는 법(탐색 분석 → 자유 형식):
//   행 = '페이지 리퍼러', '방문 페이지 + 쿼리 문자열' / 값 = '세션수', '조회수'
//   필터 = 이벤트 이름 정확히 일치 page_view 권장 — 사이트 맞춤 이벤트는 리퍼러의 쿼리 문자열을
//   지우고 보내므로(analyticsPrivacy.ts) 필터 없이 내보내면 커버리지가 낮게 나온다.
//   공유 → 파일 다운로드 → CSV. ★파일은 저장소 밖에 둘 것(저장소 안 경로는 거부, exit 2).
//
// 출력: stdout 마크다운 표만. 파일을 쓰지 않고, 리퍼러 원문(URL)은 출력하지 않는다(집계값만).
// 네이버 리퍼러에 검색어가 한 건도 없으면 '네이버 리퍼러에 query 없음 — Search Advisor 유지' 출력 후 exit 0.
// 종료 코드: 0 성공 · 1 사용법/읽기/헤더 오류 · 2 저장소 안 경로 거부.
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import { runNaverReferrerCli } from "../src/lib/naverReferrerQueries";

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

const result = runNaverReferrerCli(process.argv.slice(2), {
  repoRoot: path.resolve(__dirname, ".."),
  cwd: process.cwd(),
  realpath,
  readText: (p) => readFileSync(p, "utf8"),
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.code;
