// scripts/cf-purge-after-deploy.mjs
// 프로덕션 배포 뒤 Cloudflare 존 캐시 자동 Purge (2026-09-25, 승인 A35 · 감사 CLIENT-02).
// 배경: /salary/* 는 엣지 4시간, 규칙 B 이후 HTML 은 1시간 캐시된다. 배포 뒤 Purge 를 잊으면 삭제된 청크를
//       가리키는 옛 HTML 이 서빙돼 하이드레이션·광고·GA 가 멈출 수 있다. 런북의 "배포마다 Purge" 를 자동화한다.
// 동작(.github/workflows/cf-purge.yml 이 main push 마다 실행):
//   1) CF Pages 배포 목록을 폴링해 이 커밋(GITHUB_SHA)의 production 배포가 성공할 때까지 기다린다(기본 25분).
//   2) 성공하면 전파 여유(기본 30초) 뒤 존 캐시 Purge Everything.
// 환경변수: CF_API_TOKEN(Pages 읽기 + 존 Cache Purge 두 권한만), CF_ACCOUNT_ID, CF_ZONE_ID, GITHUB_SHA.
//   시크릿 3개 중 하나라도 비면 notice 만 남기고 exit 0 — CI 를 절대 실패시키지 않는다.
//   선택: CF_PAGES_PROJECT(기본 my-salary-calculator), CF_PURGE_TIMEOUT_MINUTES(25),
//         CF_PURGE_POLL_SECONDS(30), CF_PURGE_SETTLE_SECONDS(30).
// 종료 코드: 0 = Purge 완료 · 시크릿 없음 · CF 가 이 커밋을 건너뜀/취소 · 뒤 커밋 배포가 대신함(그쪽 실행이 Purge)
//            1 = 배포 실패 · 시간 초과 · 토큰 권한/프로젝트 오류 · Purge API 실패 → 운영자 수동 Purge 필요
// 토큰은 헤더로만 쓰고 로그에 절대 찍지 않는다. push·커밋 등 저장소 쓰기는 하지 않는다.
// 판정 함수 단위 테스트: node --test scripts/__tests__/cf-purge-after-deploy.test.mjs (네트워크 없음)

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const API = "https://api.cloudflare.com/client/v4";
const ZERO_SHA = /^0+$/;

// CF 배포의 커밋 해시와 GitHub SHA 비교 — 대소문자 무시, 한쪽이 축약(7자 이상)이어도 접두 일치 허용.
export function commitMatches(hash, sha) {
  if (!hash || !sha) return false;
  const a = String(hash).trim().toLowerCase();
  const b = String(sha).trim().toLowerCase();
  if (a.length < 7 || b.length < 7 || ZERO_SHA.test(a) || ZERO_SHA.test(b)) return false;
  return a.startsWith(b) || b.startsWith(a);
}

const createdMs = (d) => {
  const t = Date.parse(d?.created_on ?? "");
  return Number.isFinite(t) ? t : 0;
};
const isProduction = (d) => d?.environment === "production";
const isDeployed = (d) => d?.latest_stage?.name === "deploy" && d?.latest_stage?.status === "success";

// 배포 목록(CF API result 배열) → 이 커밋의 상태 판정.
//   success    — 이 커밋의 production 배포 중 하나가 deploy 단계까지 성공
//   failed     — 가장 최근 시도가 failure
//   canceled   — 가장 최근 시도가 canceled
//   skipped    — 가장 최근 시도가 is_skipped
//   superseded — 이 커밋 배포는 없는데, 작업 시작(sinceMs) 뒤에 만들어진 다른 커밋의 production 배포가 성공
//   pending    — 그 밖(아직 목록에 없음·대기·빌드 중)
export function classifyDeployments(deployments, sha, sinceMs = 0) {
  const list = Array.isArray(deployments) ? deployments.filter(isProduction) : [];
  const mine = list
    .filter((d) => commitMatches(d?.deployment_trigger?.metadata?.commit_hash, sha))
    .sort((x, y) => createdMs(y) - createdMs(x));
  if (mine.length) {
    const ok = mine.find(isDeployed);
    if (ok) return { state: "success", deployment: ok };
    const latest = mine[0];
    if (latest.is_skipped) return { state: "skipped", deployment: latest };
    const status = latest?.latest_stage?.status;
    if (status === "failure") return { state: "failed", deployment: latest };
    if (status === "canceled") return { state: "canceled", deployment: latest };
    return { state: "pending", deployment: latest };
  }
  const newer = list.find((d) => isDeployed(d) && sinceMs > 0 && createdMs(d) >= sinceMs);
  if (newer) return { state: "superseded", deployment: newer };
  return { state: "pending", deployment: null };
}

// CF API 오류 중 기다려도 풀리지 않는 것(토큰·권한·프로젝트 이름) — 즉시 실패로 끊는다.
export function isFatalApiError(httpStatus, body) {
  if (httpStatus === 401 || httpStatus === 403 || httpStatus === 404) return true;
  const codes = (body?.errors ?? []).map((e) => Number(e?.code));
  // 10000 Authentication error · 9109 Invalid access token · 8000007 Project not found
  return codes.some((c) => c === 10000 || c === 9109 || c === 8000007);
}

const describe = (d) => {
  if (!d) return "(없음)";
  const hash = String(d?.deployment_trigger?.metadata?.commit_hash ?? "").slice(0, 8) || "?";
  const stage = `${d?.latest_stage?.name ?? "?"}/${d?.latest_stage?.status ?? "?"}`;
  return `${d.short_id ?? d.id ?? "?"} commit ${hash} ${stage}${d.url ? ` ${d.url}` : ""}`;
};

const errText = (body) =>
  (body?.errors ?? []).map((e) => `${e?.code ?? "?"} ${e?.message ?? ""}`.trim()).join("; ") || "(오류 본문 없음)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function summary(line) {
  const f = process.env.GITHUB_STEP_SUMMARY;
  if (!f) return;
  try {
    fs.appendFileSync(f, line + "\n");
  } catch {
    // 요약 기록 실패는 무시 — 본 동작과 무관
  }
}

async function cfFetch(url, token, init = {}) {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { status: res.status, body };
  } catch (e) {
    return { status: 0, body: null, networkError: e?.message ?? String(e) };
  }
}

const num = (v, dflt) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : dflt;
};

export async function main(env = process.env) {
  const token = (env.CF_API_TOKEN ?? "").trim();
  const accountId = (env.CF_ACCOUNT_ID ?? "").trim();
  const zoneId = (env.CF_ZONE_ID ?? "").trim();
  const sha = (env.GITHUB_SHA ?? "").trim();
  const project = (env.CF_PAGES_PROJECT ?? "").trim() || "my-salary-calculator";
  const missing = [
    ["CF_API_TOKEN", token],
    ["CF_ACCOUNT_ID", accountId],
    ["CF_ZONE_ID", zoneId],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.log(
      `::notice::CF 캐시 자동 Purge 건너뜀 — 저장소 시크릿 ${missing.join("·")} 없음 (설정: docs/operator-console-pack.md '배포 후 캐시 자동 Purge'). 그동안은 배포마다 수동 Purge.`
    );
    return 0;
  }
  if (!sha) {
    console.log("::notice::GITHUB_SHA 가 없어 어느 배포를 기다릴지 알 수 없음 — 자동 Purge 건너뜀");
    return 0;
  }

  const timeoutMs = num(env.CF_PURGE_TIMEOUT_MINUTES, 25) * 60_000;
  const pollMs = num(env.CF_PURGE_POLL_SECONDS, 30) * 1000;
  const settleMs = num(env.CF_PURGE_SETTLE_SECONDS, 30) * 1000;
  const startedAt = Date.now();
  const listUrl = `${API}/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(project)}/deployments?env=production`;
  console.log(`CF Pages '${project}' production 배포 대기 — commit ${sha.slice(0, 12)} (최대 ${Math.round(timeoutMs / 60_000)}분)`);

  let lastState = "";
  let found = null;
  for (;;) {
    const { status, body, networkError } = await cfFetch(listUrl, token);
    if (networkError) {
      console.log(`배포 목록 조회 네트워크 오류(재시도): ${networkError}`);
    } else if (status !== 200 || !body?.success) {
      if (isFatalApiError(status, body)) {
        console.log(
          `::error::CF Pages 배포 목록 조회 실패 HTTP ${status} — ${errText(body)}. 토큰 권한(계정 > Cloudflare Pages > 읽기)·CF_ACCOUNT_ID·프로젝트 이름(${project})을 확인하고, 이번 배포는 수동 Purge 하세요.`
        );
        summary(`- CF 캐시 자동 Purge 실패: 배포 목록 조회 HTTP ${status} (${errText(body)})`);
        return 1;
      }
      console.log(`배포 목록 조회 일시 오류 HTTP ${status}(재시도): ${errText(body)}`);
    } else {
      const verdict = classifyDeployments(body.result, sha, startedAt);
      if (verdict.state !== lastState) {
        console.log(`상태: ${verdict.state} — ${describe(verdict.deployment)}`);
        lastState = verdict.state;
      }
      if (verdict.state === "success") {
        found = verdict.deployment;
        break;
      }
      if (verdict.state === "failed") {
        console.log(
          `::error::이 커밋의 CF Pages 프로덕션 배포가 실패했습니다(${describe(verdict.deployment)}). 사이트는 이전 배포 그대로라 Purge 하지 않습니다 — CF 대시보드 Workers & Pages > 배포 로그를 확인하세요.`
        );
        summary(`- CF Pages 배포 실패 — Purge 안 함 (${describe(verdict.deployment)})`);
        return 1;
      }
      if (verdict.state === "skipped" || verdict.state === "canceled") {
        console.log(`::notice::CF Pages 가 이 커밋 배포를 ${verdict.state === "skipped" ? "건너뜀" : "취소함"} — 바뀐 배포가 없어 Purge 하지 않습니다.`);
        summary(`- CF Pages 배포 ${verdict.state} — Purge 안 함`);
        return 0;
      }
      if (verdict.state === "superseded") {
        console.log(
          `::notice::이 커밋의 배포는 목록에 없고 더 뒤 커밋 배포(${describe(verdict.deployment)})가 이미 성공 — 그 push 의 실행이 Purge 합니다.`
        );
        summary(`- 뒤 커밋 배포로 대체됨 — 이 실행은 Purge 안 함`);
        return 0;
      }
    }
    if (Date.now() - startedAt + pollMs > timeoutMs) {
      console.log(
        `::error::${Math.round(timeoutMs / 60_000)}분 안에 이 커밋의 프로덕션 배포 성공을 확인하지 못했습니다(마지막 상태: ${lastState || "조회 실패"}). 배포가 끝난 뒤 CF 대시보드에서 수동 Purge Everything 하거나 이 실행을 Re-run 하세요.`
      );
      summary(`- 시간 초과 — 수동 Purge 필요 (마지막 상태 ${lastState || "조회 실패"})`);
      return 1;
    }
    await sleep(pollMs);
  }

  console.log(`배포 성공 확인(${describe(found)}) — ${Math.round(settleMs / 1000)}초 뒤 Purge Everything`);
  await sleep(settleMs);

  const purgeUrl = `${API}/zones/${encodeURIComponent(zoneId)}/purge_cache`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const { status, body, networkError } = await cfFetch(purgeUrl, token, {
      method: "POST",
      body: JSON.stringify({ purge_everything: true }),
    });
    if (!networkError && status === 200 && body?.success) {
      console.log(`::notice::CF 존 캐시 Purge Everything 완료 (commit ${sha.slice(0, 12)}, purge id ${body?.result?.id ?? "?"})`);
      summary(`- CF 존 캐시 Purge Everything 완료 — commit ${sha.slice(0, 12)}`);
      return 0;
    }
    const why = networkError ? `네트워크 오류 ${networkError}` : `HTTP ${status} — ${errText(body)}`;
    if (!networkError && isFatalApiError(status, body)) {
      console.log(`::error::Purge 거부: ${why}. 토큰 권한(영역 > 캐시 제거 > 제거)과 CF_ZONE_ID 를 확인하고 수동 Purge 하세요.`);
      summary(`- Purge 거부: ${why}`);
      return 1;
    }
    console.log(`Purge ${attempt}/3 실패(재시도): ${why}`);
    if (attempt < 3) await sleep(10_000);
  }
  console.log("::error::Purge 3회 실패 — CF 대시보드 Caching > Configuration > Purge Everything 을 수동으로 실행하세요.");
  summary("- Purge 3회 실패 — 수동 Purge 필요");
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => process.exit(code),
    (e) => {
      console.log(`::error::cf-purge-after-deploy 예외: ${e?.message ?? e} — 이번 배포는 수동 Purge 하세요.`);
      process.exit(1);
    }
  );
}
