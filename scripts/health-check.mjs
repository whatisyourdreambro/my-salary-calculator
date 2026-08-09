// scripts/health-check.mjs
// 주간 프로덕션 헬스체크 — "사용자에겐 정상, 크롤러에겐 고장" 유형의 조용한 사고를 조기 발견.
// 배경: 2026-08에 /salary 전량 500(수개월 미발견)·edge 전 라우트 일시 404(스텁 워커) 실측.
// 사용: node scripts/health-check.mjs   (모두 통과 시 exit 0, 실패 있으면 exit 1)
// 주의: 브라우저 UA 필수(기본 curl UA는 CF가 403 차단). 배포 직후 몇 분간은 전파 중이라
//       오탐 가능 — 실패 시 5분 뒤 1회 재확인 후 판단할 것.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const BASE = "https://www.moneysalary.com";

// [경로, 기대 상태코드, 본문 필수 문자열(선택), 설명]
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
];

const results = [];
let failed = 0;

async function check([path, expect, marker, desc]) {
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
console.log(`\n결과: ${CHECKS.length - failed}/${CHECKS.length} 통과${failed ? ` — 실패 ${failed}건!` : ""}`);
process.exit(failed ? 1 : 0);
