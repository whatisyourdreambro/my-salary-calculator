// IndexNow 핑 — 빌드 산출물 사이트맵의 URL을 api.indexnow.org(빙·네이버 등
// 참여 엔진 공유 엔드포인트)로 제출해 신규·갱신 페이지의 색인을 즉시 요청한다.
//
// 안전 원칙: 어떤 실패도 빌드를 깨지 않는다 — 모든 경로에서 exit 0.
// (package.json postbuild 에서 `|| echo` 이중 안전망과 함께 사용)
//
// 실행 조건: Cloudflare Pages 프로덕션 빌드(CF_PAGES=1 && CF_PAGES_BRANCH=main)만.
// 로컬 수동 테스트: INDEXNOW_FORCE=1 node scripts/indexnow-ping.mjs
//
// 키 파일: public/{32자hex}.txt (파일명에서 자동 발견 — 상수/파일 불일치 원천 차단)
// 운영 확인: CF Pages 빌드 로그에서 "[indexnow]" 라인 존재 여부로 postbuild 실행 확인.
// 만약 로그에 없으면 대시보드가 npm run build를 우회하는 구성 —
// build 스크립트를 "next build && node scripts/indexnow-ping.mjs ..." 로 변경(플랜 B).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const HOST = "www.moneysalary.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const URL_CAP = 10000; // IndexNow 1회 POST 상한
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function findKey() {
  try {
    const f = readdirSync(path.join(process.cwd(), "public")).find((n) =>
      /^[0-9a-f]{32}\.txt$/.test(n)
    );
    return f ? f.slice(0, -4) : null;
  } catch {
    return null;
  }
}

const extractLocs = (xml) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.startsWith(`https://${HOST}/`));

// 1순위: next build 산출물의 프리렌더 사이트맵 — postbuild 시점에 항상 최신.
// 주의: .next/server/app 에는 sitemap.xml(디렉터리, route.js)과
// sitemap.xml.body(실제 XML)가 공존 — 항목별 try로 디렉터리는 건너뛴다.
function fromBuildOutput() {
  const dir = path.join(process.cwd(), ".next", "server", "app");
  if (!existsSync(dir)) return null;
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return null;
  }
  for (const f of entries) {
    if (!f.startsWith("sitemap.xml")) continue;
    try {
      const txt = readFileSync(path.join(dir, f), "utf8");
      if (txt.includes("<loc>")) return extractLocs(txt);
    } catch {
      // 디렉터리(EISDIR) 등 — 다음 항목 시도
    }
  }
  return null;
}

// 폴백: 프로덕션 사이트맵(직전 배포본 — 신규 URL은 다음 배포에서 커버)
async function fromProduction() {
  const res = await fetch(`https://${HOST}/sitemap.xml`, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`sitemap fetch ${res.status}`);
  return extractLocs(await res.text());
}

async function main() {
  const isProdBuild =
    process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH === "main";
  if (!isProdBuild && process.env.INDEXNOW_FORCE !== "1") {
    console.log("[indexnow] skip (not CF production build)");
    return;
  }

  const key = findKey();
  if (!key) {
    console.log("[indexnow] skip (no key file in public/)");
    return;
  }

  let urls = fromBuildOutput();
  if (!urls || urls.length === 0) {
    console.log("[indexnow] build output sitemap not found — production fallback");
    urls = await fromProduction();
  }
  if (!urls || urls.length === 0) {
    console.log("[indexnow] skip (no URLs found)");
    return;
  }
  if (urls.length > URL_CAP) urls = urls.slice(0, URL_CAP);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", "user-agent": UA },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `https://${HOST}/${key}.txt`,
      urlList: urls,
    }),
    signal: AbortSignal.timeout(20000),
  });
  // 200/202 = 접수. 4xx여도 빌드는 계속 — 로그로만 남김
  console.log(`[indexnow] submitted ${urls.length} urls → HTTP ${res.status}`);
}

main()
  .catch((e) => console.log(`[indexnow] error (non-fatal): ${e?.message ?? e}`))
  .finally(() => process.exit(0));
