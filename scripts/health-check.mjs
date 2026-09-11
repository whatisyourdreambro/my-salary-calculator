// scripts/health-check.mjs
// 주간 프로덕션 헬스체크 — "사용자에겐 정상, 크롤러에겐 고장" 유형의 조용한 사고를 조기 발견.
// 배경: 2026-08에 /salary 전량 500(수개월 미발견)·edge 전 라우트 일시 404(스텁 워커) 실측.
// 사용: node scripts/health-check.mjs   (모두 통과 시 exit 0, 실패 있으면 exit 1)
// 주의: 브라우저 UA 필수(기본 curl UA는 CF가 403 차단). 배포 직후 몇 분간은 전파 중이라
//       오탐 가능 — 실패 시 5분 뒤 1회 재확인 후 판단할 것.
// 시즌 세트(S1-1, 2026-09-11): 프로덕션 /table/2026/annual 의 data-season-key 가 '오늘 키'와
//       같은지 검사한다(경계표 scripts/season-key.mjs = src/lib/seasonKey.ts 사본, 오버라이드는
//       TS 파일에서 읽음). 불일치 = 경계일 이후 미배포 또는 CF 캐시 잔존 → 재생성·재배포·퍼지.

import { fileURLToPath } from "node:url";
import {
  isJanManualWindow,
  isSeasonKeyExpired,
  pickSeasonKey,
  readSeasonKeyOverride,
  resolveSeasonKey,
} from "./season-key.mjs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const BASE = "https://www.moneysalary.com";

// ── 시즌 키 기대값 — 오늘(KST) 자동 키, 단 src/lib/seasonKey.ts 의 SEASON_KEY_OVERRIDE 가 우선 ──
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const NOW = new Date();
const SEASON_OVERRIDE = readSeasonKeyOverride(ROOT);
const EXPECTED_SEASON_KEY = resolveSeasonKey(NOW, SEASON_OVERRIDE.override);
const SEASON_MARKER = `data-season-key="${EXPECTED_SEASON_KEY}"`;

/** 시즌 마커 불일치 시 실제 값과 조치를 덧붙인다 */
function diagnoseSeasonKey(html) {
  const m = html.match(/data-season-key="([A-Z]{3})"/);
  const live = m ? m[1] : "(속성 없음 — S1-1 미배포?)";
  return (
    `프로덕션=${live}, 기대=${EXPECTED_SEASON_KEY}` +
    (SEASON_OVERRIDE.override ? `(오버라이드 ${SEASON_OVERRIDE.override})` : `(자동 ${pickSeasonKey(NOW)})`) +
    `. 조치: tsx scripts/gen-season-key.ts 실행 후 커밋·재배포(또는 src/lib/seasonKey.ts 의 ` +
    `SEASON_KEY_OVERRIDE 설정) → 배포 후 CF 캐시 퍼지. 방금 배포했다면 캐시 잔존 — 퍼지 후 재확인.`
  );
}

// [경로, 기대 상태코드, 본문 필수 문자열(선택), 설명, 마커 불일치 시 진단 함수(선택, html → string)]
const CHECKS = [
  // 핵심 정적 페이지
  ["/", 200, "연봉", "홈"],
  ["/salary-db/samsung-electronics", 200, "금융감독원", "회사 페이지 + 공시 섹션"],
  ["/salary-db/compare/naver-vs-kakao", 200, null, "비교 페이지"],
  ["/calc/samsung-bonus", 200, null, "삼성 성과급 계산기(#1 수익 페이지)"],
  ["/calc/celltrion-bonus", 200, null, "셀트리온 계산기"],
  ["/credit-card-deduction-2026", 200, null, "신용카드 공제 계산기"],
  ["/rent-tax-credit-2026", 200, null, "월세 공제 계산기"],
  ["/medical-tax-credit-2026", 200, null, "의료비 공제 계산기"],
  ["/industry/semiconductor", 200, null, "업종 허브"],
  ["/industry/startup", 200, null, "스타트업 허브"],
  ["/job/nurse", 200, null, "직업 페이지"],
  // /salary 정적 격자 (2026-08 500 사건 재발 감시)
  ["/salary/50000000", 200, "실수령", "연봉 격자 페이지"],
  ["/salary/103000000", 200, null, "연봉 격자(표 행 전용값)"],
  ["/salary/12345678", 404, null, "격자 밖 → 404가 정상 (200이면 정적화 깨짐)"],
  // 한글 슬러그 (실존 슬러그만! 임의 슬러그로 바꾸지 말 것 — 2026-08-08 오판 사례)
  ["/glossary/" + encodeURIComponent("국민연금"), 200, null, "글로서리 한글 슬러그"],
  ["/glossary/" + encodeURIComponent("원천징수"), 200, null, "글로서리 한글 슬러그 2"],
  [
    "/qna/" + encodeURIComponent("퇴직금-중간정산-아무-때나-받을-수-있나요"),
    200,
    null,
    "Q&A 한글 슬러그",
  ],
  // edge 워커 생존 감시 (전부 404면 스텁 워커 사고)
  ["/api/salary-table?type=annual", 200, null, "edge API (워커 생존 신호)"],
  [
    "/api/og?type=salary&amount=50000000&net=3300000",
    200,
    null,
    "OG 이미지 (카톡 공유 카드)",
  ],
  // SEO 인프라
  ["/sitemap.xml", 200, "<loc>", "사이트맵"],
  ["/rss.xml", 200, "<rss", "RSS"],
  ["/robots.txt", 200, null, "robots"],
  // 시즌 세트 만료 감시 (S1-1) — 표 페이지 SeasonalLinks 섹션의 data-season-key == 오늘 키
  [
    "/table/2026/annual",
    200,
    SEASON_MARKER,
    `시즌 세트 키 == 오늘 키 ${EXPECTED_SEASON_KEY} (미교체 감시 — 이 경로는 엣지 캐시 없음)`,
    diagnoseSeasonKey,
  ],
  // 엣지 캐시 경로(/salary/* 14400s)에서도 대조 — 경계일 이후 배포해도 최대 4h 구 세트가 남는 것을 잡는다(2026-09-12 리뷰).
  // 격자 위 금액만 유효(dynamicParams=false) — 5,000만은 정적 격자 고정값.
  [
    "/salary/50000000",
    200,
    SEASON_MARKER,
    `시즌 세트 키 == 오늘 키 ${EXPECTED_SEASON_KEY} (엣지 캐시 경로 /salary/* 잔존 감시 — 배포 직후면 CF 퍼지 후 재확인)`,
    diagnoseSeasonKey,
  ],
];

const results = [];
let failed = 0;

async function check([path, expect, marker, desc, diagnose]) {
  const url = BASE + path;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA },
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    let ok = res.status === expect;
    let detail = `status=${res.status}(기대 ${expect})`;
    if (ok && marker) {
      const text = await res.text();
      if (!text.includes(marker)) {
        ok = false;
        detail += ` 본문에 "${marker}" 없음`;
        if (diagnose) detail += ` — ${diagnose(text)}`;
      }
    }
    results.push({ ok, path, desc, detail });
    if (!ok) failed++;
  } catch (e) {
    results.push({ ok: false, path, desc, detail: `요청 실패: ${e.message}` });
    failed++;
  }
}

// 동시성 5로 실행
const queue = [...CHECKS];
await Promise.all(
  Array.from({ length: 5 }, async () => {
    while (queue.length) await check(queue.shift());
  })
);

console.log(`\n=== moneysalary.com 헬스체크 (${CHECKS.length}건) ===\n`);
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.path}  [${r.desc}] ${r.ok ? "" : "— " + r.detail}`);
}
// 시즌 키 참고 정보 (PASS/FAIL 과 별개 — 사람이 볼 알림)
if (SEASON_OVERRIDE.source !== "file") {
  console.log(
    `INFO  시즌 오버라이드를 읽지 못함(${SEASON_OVERRIDE.source}) — 자동 키 ${EXPECTED_SEASON_KEY} 로 대조함`,
  );
} else if (SEASON_OVERRIDE.override) {
  console.log(`INFO  시즌 오버라이드 활성: ${SEASON_OVERRIDE.override} (자동 키였다면 ${pickSeasonKey(NOW)})`);
}
if (!SEASON_OVERRIDE.override && isJanManualWindow(NOW)) {
  console.log(
    "WARN  1/2 이후인데 JAN 수동 전환 전 — 확인 2건(공무원 2027 확정·간소화 오픈일) 후 " +
      "src/lib/seasonKey.ts SEASON_KEY_OVERRIDE = \"JAN\" → tsx scripts/gen-season-key.ts → 커밋·배포",
  );
}
if (isSeasonKeyExpired(EXPECTED_SEASON_KEY, NOW)) {
  console.log(
    `WARN  시즌 세트 만료 — ${EXPECTED_SEASON_KEY} 세트 유효기간 경과(scripts/season-key.mjs SEASON_EXPIRES_KST). ` +
      "다음 세트 정의 또는 SEASON_KEY_OVERRIDE 변경 전까지 프로덕션은 만료 세트를 노출한다.",
  );
}
console.log(`\n결과: ${CHECKS.length - failed}/${CHECKS.length} 통과${failed ? ` — 실패 ${failed}건!` : ""}`);
process.exit(failed ? 1 : 0);
