// scripts/__tests__/trend-radar.test.mjs — 트렌드 레이더(scripts/trend-radar) 오프라인 테스트
// 실행: node --test scripts/__tests__/trend-radar.test.mjs
// 네트워크를 절대 쓰지 않는다 — 전역 fetch 를 던지는 스텁으로 막고, 필요한 테스트만 가짜 fetch 를 주입한다.
import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, statSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

globalThis.fetch = () => {
  throw new Error("테스트에서 네트워크 금지");
};

const { createHttp, redactUrl, urlCarriesKey } = await import("../trend-radar/lib/http.mjs");
const { parseRobots, selectRules, evaluate, isAllowed } = await import("../trend-radar/lib/robots.mjs");
const { parseDate, normalizeLink, parseRss, parseNtsList, parseMoelList, parseGtrends, parseLawDrf } = await import(
  "../trend-radar/lib/parse.mjs"
);
const { compileClusters, classifyTitle, routeExists, CLUSTER_IDS, trendsFinance, validateClusters } = await import(
  "../trend-radar/lib/filter.mjs"
);
const { loadSiteIndex, jaccard, statuteMentions, loadGuideCards } = await import("../trend-radar/lib/site-map.mjs");
const { recommend, scoreCandidate, calendarMatch, upcomingEvents, eventYear } = await import("../trend-radar/lib/score.mjs");
const { runLawDrf, NO_KEY_NOTE, buildLawDrfUrl } = await import("../trend-radar/lib/lawdrf.mjs");
const { validateRadar, renderMarkdown, pruneHeadlines, writeOutputs } = await import("../trend-radar/lib/report.mjs");
const { runRadar, buildCandidate, loadConfig, validateConfig, fixtureFetch, parseArgs, UsageError, checkRobots, REPO_ROOT } =
  await import("../trend-radar/run.mjs");

const RADAR_DIR = fileURLToPath(new URL("../trend-radar/", import.meta.url));
const RUN = join(RADAR_DIR, "run.mjs");
const FIX = join(RADAR_DIR, "fixtures");
const cfg = loadConfig();
const compiled = compileClusters(cfg.clusters);
const siteIndex = loadSiteIndex(REPO_ROOT);
const srcById = Object.fromEntries(cfg.sources.map((s) => [s.id, s]));
const NOW = Date.parse("2026-09-26T09:00:00+09:00");
const add = (arr, v) => {
  arr[arr.length] = v;
};
const tmp = () => mkdtempSync(join(tmpdir(), "trend-radar-"));
const okResponse = (body, init = {}) => new Response(body, { status: 200, ...init });

// ─── 날짜·링크 ───────────────────────────────────────────────
test("parseDate: 소스별 날짜 형식 → ISO +09:00", () => {
  assert.equal(parseDate("2026-09-23 17:00:00.0"), "2026-09-23T17:00:00+09:00"); // mofe
  assert.equal(parseDate("20260921150221"), "2026-09-21T15:02:21+09:00"); // mofe 통계 게시판
  assert.equal(parseDate("2026-09-23 09:43:47"), "2026-09-23T09:43:47+09:00"); // dc:date(KST)
  assert.equal(parseDate("2026-09-23T12:00:00+0900"), "2026-09-23T12:00:00+09:00"); // mpm ISO
  assert.equal(parseDate("2026-09-23T03:00:00Z"), "2026-09-23T12:00:00+09:00");
  assert.equal(parseDate("Wed, 23 Sep 2026 07:06:00 GMT"), "2026-09-23T16:06:00+09:00"); // mohw RFC-822
  assert.equal(parseDate("Fri, 25 Sep 2026 20:30:00 -0700"), "2026-09-26T12:30:00+09:00"); // 구글 트렌드 PDT
  assert.equal(parseDate("2026.09.01."), "2026-09-01T00:00:00+09:00"); // 국세청
  assert.equal(parseDate("2026.09.23"), "2026-09-23T00:00:00+09:00"); // 고용노동부 목록
  assert.equal(parseDate("<![CDATA[2026-09-22 00:00:00]]>"), "2026-09-22T00:00:00+09:00");
  assert.equal(parseDate("어제"), null);
  assert.equal(parseDate(""), null);
});

test("normalizeLink: 공식 기관 http → https, 엔티티 해석, 비공식 호스트는 그대로", () => {
  assert.equal(
    normalizeLink("<![CDATA[http://mofe.go.kr/nw/nes/detailNesDtaView.do?searchBbsId=MOSFBBS_000000000028&menuNo=4010100]]>"),
    "https://mofe.go.kr/nw/nes/detailNesDtaView.do?searchBbsId=MOSFBBS_000000000028&menuNo=4010100",
  );
  assert.equal(
    normalizeLink("http://www.mpm.go.kr/board/board.do?boardId=bbs_1&amp;mode=view&amp;cntId=4335"),
    "https://www.mpm.go.kr/board/board.do?boardId=bbs_1&mode=view&cntId=4335",
  );
  assert.equal(normalizeLink("http://www.nps.or.kr/x"), "https://www.nps.or.kr/x");
  assert.equal(normalizeLink("http://example.com/a"), "http://example.com/a");
});

// ─── 본문 차단 ───────────────────────────────────────────────
test("RSS 파서는 description·content:encoded 를 절대 읽지 않는다", () => {
  const xml = `<rss><channel><title>t</title>
    <item><description><![CDATA[<title>HIJACK</title> BODY_A]]></description>
      <title><![CDATA[진짜 제목]]></title><link>http://www.fsc.go.kr/no010101/1</link>
      <content:encoded><![CDATA[BODY_B]]></content:encoded><dc:date>2026-09-23 00:00:00</dc:date></item>
    <item><title>둘째</title><link>https://www.fsc.go.kr/no010101/2</link><description>BODY_C</description><pubDate>Wed, 23 Sep 2026 07:06:00 GMT</pubDate></item>
  </channel></rss>`;
  const items = parseRss(xml);
  assert.equal(items.length, 2);
  assert.deepEqual(items[0], { title: "진짜 제목", link: "https://www.fsc.go.kr/no010101/1", publishedAt: "2026-09-23T00:00:00+09:00" });
  assert.doesNotMatch(JSON.stringify(items), /BODY_|HIJACK/);
});

test("심은 <description>BODY</description> 는 레이더 JSON·보고서·헤드라인 어디에도 안 나온다", async () => {
  const base = fixtureFetch(cfg.sources);
  const planted = async (url) => {
    const res = await base(url);
    if (url !== srcById["fsc-press"].url) return res;
    const xml = (await res.text()).replace(/<\/title>/g, "</title><description><![CDATA[PLANTED_BODY 본문 전문]]></description><content:encoded>PLANTED_BODY2</content:encoded>");
    return okResponse(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
  };
  const { radar, headlines, exitCode } = await runRadar({ mode: "fixtures", today: "2026-09-26", fetchImpl: planted, write: false, log: () => {} });
  assert.equal(exitCode, 0);
  const all = JSON.stringify(radar) + renderMarkdown(radar) + JSON.stringify(headlines);
  assert.doesNotMatch(all, /PLANTED_BODY|본문 전문/);
});

// ─── 클러스터 분류 ─────────────────────────────────────────────
const item = (title, srcId, publishedAt = "2026-09-25T10:00:00+09:00") => ({
  title,
  link: `https://www.moel.go.kr/test/view.do?t=${encodeURIComponent(title)}`,
  publishedAt,
  src: srcById[srcId],
});
const ctx = { compiled, events: cfg.calendar.events, nowMs: NOW, date: "2026-09-26", trendClusters: new Set(), siteIndex };

test("공식 제목 8건 → 클러스터·추천", async () => {
  const cases = [
    [item("근로소득만 있는 가구에 최대 115만 원 지급, ’26년 상반기분 근로장려금, 9월 15일까지 신청하세요", "nts-press", "2026-09-01T00:00:00+09:00"), "earned-income-credit", "update-existing"],
    [item("2027년 적용 최저임금 시간급 10,700원 고시", "moel-press"), "minimum-wage", "update-existing"],
    [item("국민연금 기준소득월액 상·하한액 조정 고시", "mohw-press"), "national-pension", null],
    [item("인사혁신처, 2027년 공무원 보수 1.8% 인상안 발표", "mpm-press"), "civil-servant-pay", null],
    [item("한국은행 기준금리 연 3.00% 동결 관련 거시경제금융현안간담회 개최", "mofe-press"), "bok-base-rate", null],
    [item("2026년 세법개정안 발표", "mofe-press"), "tax-law-amendment", "not-new-brief"],
    [item("육아휴직 급여 인상 등 일·가정 양립 지원 확대 시행", "moel-policy"), "parental-leave", "not-new-brief"],
    [item("구직급여 신청 절차 안내", "moel-press"), "unemployment-benefit", null],
  ];
  for (const [it, cluster, rec] of cases) {
    const c = await buildCandidate(it, ctx);
    assert.ok(c, it.title);
    assert.equal(c.cluster, cluster, it.title);
    if (rec === "not-new-brief") assert.notEqual(c.recommendation, "new-brief", it.title);
    else if (rec) assert.equal(c.recommendation, rec, it.title);
  }
  const eitc = await buildCandidate(cases[0][0], ctx);
  assert.deepEqual(eitc.hubRoutes, ["/earned-income-credit"]);
});

test("연예·스포츠·사망 제목 → ignore(또는 금융 아님으로 탈락)", async () => {
  for (const title of ["배우 최수종, 연봉 공개", "아시안게임 축구 결승 한국 우승", "가수 신곡 음원 차트 1위", "프로야구 한국시리즈 일정 발표", "유명인 모친상 비보", "코인 급등 전망 성과급 대박"]) {
    const c = await buildCandidate(item(title, "moel-press"), ctx);
    assert.ok(c === null || c.recommendation === "ignore", title);
  }
  assert.equal(classifyTitle("배우 최수종, 연봉 공개", compiled).denied, "배우");
  assert.equal(classifyTitle("아시안게임 축구 결승 한국 우승", compiled).allowed, false);
  const ok = await buildCandidate(item("배우자 출산휴가 20일로 확대", "moel-policy"), ctx);
  assert.equal(ok.cluster, "parental-leave"); // '배우(?!자)' — 배우자는 막지 않는다
});

test("구글 트렌드 금융 매칭: 표본 0건, 금융 제목은 클러스터 부스트", () => {
  const { items } = parseGtrends(readFileSync(join(FIX, "gtrends-kr.xml"), "utf8"));
  assert.equal(items.length, 10);
  assert.equal(trendsFinance(items.map((x) => x.title), compiled).count, 0);
  const tf = trendsFinance(["최저임금 2027", "기준금리 동결", "배우 연봉"], compiled);
  assert.equal(tf.count, 2);
  assert.deepEqual([...tf.clusters].sort(), ["bok-base-rate", "minimum-wage"]);
});

test("클러스터 설정: 12종 정확, briefEligible, 모든 hubRoute 실존", () => {
  assert.deepEqual(cfg.clusters.clusters.map((c) => c.id), CLUSTER_IDS);
  assert.deepEqual(validateClusters(cfg.clusters, REPO_ROOT), []);
  for (const c of cfg.clusters.clusters) {
    assert.equal(c.briefEligible, !["tax-law-amendment", "earned-income-credit", "parental-leave"].includes(c.id), c.id);
    for (const r of c.hubRoutes) assert.ok(routeExists(REPO_ROOT, r), `${c.id} ${r}`);
    assert.ok([0.3, 0.5, 0.7, 1].includes(c.demandWeight), `${c.id} 거친 등급만`);
  }
  assert.ok(routeExists(REPO_ROOT, "/calc/pension-hike-2027"));
  assert.equal(routeExists(REPO_ROOT, "/no-such-route-xyz"), false);
  const broken = structuredClone(cfg.clusters);
  broken.clusters[0].hubRoutes = ["/no-such-route-xyz"];
  assert.ok(validateClusters(broken, REPO_ROOT).some((e) => e.includes("/no-such-route-xyz")));
  assert.deepEqual(validateConfig(cfg, REPO_ROOT), []);
});

// ─── 추천 행렬 ───────────────────────────────────────────────
test("추천 행렬: 우선순위대로 한 가지씩", () => {
  const base = {
    cluster: "minimum-wage",
    denied: null,
    kind: "보도자료",
    score: 70,
    ageH: 10,
    briefEligible: true,
    canonical: null,
    hubRoutes: ["/minimum-wage-2027"],
    bestOverlap: null,
    title: "2027년 최저임금 심의 착수",
    publishedAt: "2026-09-25T23:00:00+09:00",
    linkRobots: "allowed",
  };
  const r = (patch) => recommend({ ...base, ...patch }).recommendation;
  assert.equal(r({}), "new-brief");
  assert.equal(r({ denied: "사망" }), "ignore");
  assert.equal(r({ cluster: null }), "ignore");
  assert.equal(r({ ageH: 32 * 24 }), "watch");
  assert.equal(r({ canonical: "최저임금 고시", score: 10, ageH: 20 * 24 }), "update-existing");
  assert.equal(r({ canonical: "최저임금 고시", ageH: 40 * 24 }), "watch");
  assert.equal(r({ kind: "통계" }), "watch");
  assert.equal(r({ briefEligible: false }), "update-existing");
  assert.equal(r({ briefEligible: false, hubRoutes: [] }), "watch");
  assert.equal(r({ score: 54.9 }), "watch");
  assert.equal(r({ ageH: 8 * 24 }), "watch");
  assert.equal(r({ ageH: null }), "watch");
  assert.equal(r({ bestOverlap: { title: "2027 최저임금 시급 10,700원 확정", score: 0.6, where: "페이지" } }), "update-existing");
  assert.equal(r({ bestOverlap: { title: "최저임금 시급 환산", score: 0.6, where: "페이지" } }), "new-brief");
  assert.equal(r({ bestOverlap: { title: "2027 최저임금 시급", score: 0.49, where: "페이지" } }), "new-brief");
  assert.equal(r({ linkRobots: "disallowed" }), "watch");
  for (const patch of [{}, { denied: "x" }, { briefEligible: false }, { kind: "통계" }]) {
    assert.match(recommend({ ...base, ...patch }).reason, /[가-힣]/);
  }
});

test("점수: 구성요소 합, 일정 창 ±7일, 연도 추출", () => {
  const { score, parts } = scoreCandidate({ kind: "고시", ageH: 10, demandWeight: 0.5, calendarHit: true, trendsHit: true }, compiled.kindPoints);
  assert.deepEqual(parts, { officialKind: 40, recency: 20, demand: 10, calendar: 10, trends: 10 });
  assert.equal(score, 90);
  assert.equal(scoreCandidate({ kind: "통계", ageH: 100, demandWeight: 0.3, calendarHit: false, trendsHit: false }, compiled.kindPoints).score, 16 + 6 + 6);
  assert.equal(scoreCandidate({ kind: "보도자료", ageH: 50, demandWeight: 1, calendarHit: false, trendsHit: false }, compiled.kindPoints).score, 32 + 12 + 20);
  const ev = cfg.calendar.events;
  assert.equal(calendarMatch("earned-income-credit", "2026-09-01", ev).id, "eitc-half-first");
  assert.equal(calendarMatch("earned-income-credit", "2026-09-22", ev).id, "eitc-half-first");
  assert.equal(calendarMatch("earned-income-credit", "2026-09-23", ev), null);
  assert.equal(calendarMatch("bok-base-rate", "2026-10-15", ev).id, "bok-policy-rate-2026");
  assert.equal(calendarMatch("minimum-wage", "2027-08-10", ev).id, "minimum-wage-decision");
  assert.deepEqual(upcomingEvents("2026-09-26", ev, 14), []);
  assert.deepEqual(upcomingEvents("2026-10-10", ev, 14).map((e) => e.start), ["2026-10-22"]);
  assert.equal(eventYear("’26년 상반기분 근로장려금", null), 2026);
  assert.equal(eventYear("2027년 적용 최저임금", null), 2027);
  assert.equal(eventYear("세법개정안 발표", "2026-07-30T00:00:00+09:00"), 2026);
});

test("공식 일정: 모두 근거·https 출처·검증일, 확인 못 한 것은 dropped", () => {
  for (const e of cfg.calendar.events) {
    assert.match(e.sourceUrl, /^https:\/\/www\.(law\.go\.kr|bok\.or\.kr\/portal\/)/, e.id);
    assert.ok(e.basis && e.verifiedAt === "2026-09-26", e.id);
  }
  assert.ok(cfg.calendar.dropped.some((d) => d.name.includes("간소화")));
});

// ─── HTTP 계약 ───────────────────────────────────────────────
test("redactUrl: OC·key·auth·authKey·serviceKey·crtfc_key·ECOS 경로 키 가림", () => {
  const u = redactUrl("https://www.law.go.kr/DRF/lawSearch.do?OC=planted_oc_1&target=law&ancYd=20260919~20260926");
  assert.doesNotMatch(u, /planted_oc_1/);
  assert.match(u, /OC=\*\*\*&target=law&ancYd=20260919~20260926/);
  const v = redactUrl("https://x.go.kr/a?key=K_SECRET&auth=A_SECRET&authKey=AK_SECRET&serviceKey=SK_SECRET&crtfc_key=CK_SECRET&page=2");
  assert.doesNotMatch(v, /_SECRET/);
  assert.match(v, /page=2/);
  const e = redactUrl("https://ecos.bok.or.kr/api/StatisticSearch/ECOS_PLANTED_KEY/json/kr/1/10/722Y001/D/20260801/20260901/0101000");
  assert.equal(e, "https://ecos.bok.or.kr/api/StatisticSearch/***/json/kr/1/10/722Y001/D/20260801/20260901/0101000");
  assert.doesNotMatch(redactUrl("GET /DRF/lawSearch.do?OC=raw_secret&x=1"), /raw_secret/);
  assert.equal(urlCarriesKey("https://www.nts.go.kr/list?mi=2201"), false);
  assert.equal(urlCarriesKey("https://ecos.bok.or.kr/api/KeyStatisticList/K/json/kr/1/10"), true);
});

test("http: 호스트별 간격(가짜 시계)·순차 실행·요청 상한", async () => {
  let t = 0;
  const sleeps = [];
  let inflight = 0;
  let maxInflight = 0;
  const http = createHttp({
    fetchImpl: async () => {
      inflight += 1;
      maxInflight = Math.max(maxInflight, inflight);
      await Promise.resolve();
      inflight -= 1;
      return okResponse("ok");
    },
    now: () => t,
    sleep: async (ms) => {
      add(sleeps, ms);
      t += ms;
    },
    perHostGapMs: 1000,
    maxRequests: 3,
    log: () => {},
  });
  await Promise.all([http.get("https://a.go.kr/1"), http.get("https://a.go.kr/2"), http.get("https://b.go.kr/1")]);
  assert.deepEqual(sleeps, [1000]);
  assert.equal(maxInflight, 1);
  await assert.rejects(http.get("https://a.go.kr/3"), { name: "CapError" });
  assert.equal(http.stats.requests, 3);
});

test("http: 네트워크 오류만 1회 재시도, HTTP 오류는 재시도 없음", async () => {
  let calls = 0;
  const flaky = createHttp({
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new TypeError("fetch failed");
      return okResponse("ok");
    },
    perHostGapMs: 0,
    log: () => {},
  });
  assert.equal((await flaky.get("https://a.go.kr/")).text, "ok");
  assert.equal(flaky.stats.requests, 2);
  let n500 = 0;
  const err500 = createHttp({ fetchImpl: async () => ((n500 += 1), new Response("x", { status: 500 })), perHostGapMs: 0, log: () => {} });
  assert.equal((await err500.get("https://a.go.kr/")).status, 500);
  assert.equal(n500, 1);
  const dead = createHttp({ fetchImpl: async () => { throw new TypeError("fetch failed"); }, perHostGapMs: 0, log: () => {} });
  await assert.rejects(dead.get("https://a.go.kr/"), { name: "TypeError" });
  assert.equal(dead.stats.requests, 2);
});

test("http: 크기 상한·리다이렉트 3회·키 URL https 강제·허용 호스트·로그 가림", async () => {
  const big = createHttp({ fetchImpl: async () => okResponse("x".repeat(3000)), perHostGapMs: 0, log: () => {} });
  await assert.rejects(big.get("https://a.go.kr/", { maxBytes: 1000 }), { name: "SizeError" });

  const hops = { "https://moef.go.kr/rss": "https://mofe.go.kr/rss" };
  const redir = createHttp({
    fetchImpl: async (url) => (hops[url] ? new Response(null, { status: 301, headers: { location: hops[url] } }) : okResponse("feed")),
    perHostGapMs: 0,
    log: () => {},
  });
  const r = await redir.get("https://moef.go.kr/rss");
  assert.equal(r.finalUrl, "https://mofe.go.kr/rss");
  assert.equal(r.text, "feed");
  assert.equal(redir.stats.requests, 2);
  const loop = createHttp({ fetchImpl: async (url) => new Response(null, { status: 302, headers: { location: `${url}x` } }), perHostGapMs: 0, log: () => {} });
  await assert.rejects(loop.get("https://a.go.kr/"), { name: "RedirectError" });
  assert.equal(loop.stats.requests, 4);

  let called = 0;
  const lines = [];
  const keyed = createHttp({
    fetchImpl: async (url) => {
      called += 1;
      if (url.includes("hop")) return new Response(null, { status: 301, headers: { location: "http://www.law.go.kr/DRF/lawSearch.do?OC=planted_k" } });
      return okResponse("<LawSearch></LawSearch>");
    },
    perHostGapMs: 0,
    log: (l) => add(lines, l),
    allowHosts: ["www.law.go.kr"],
  });
  await assert.rejects(keyed.get("http://www.law.go.kr/DRF/lawSearch.do?OC=planted_k"), { name: "InsecureKeyUrlError" });
  assert.equal(called, 0);
  await keyed.get("https://www.law.go.kr/DRF/lawSearch.do?OC=planted_k&target=law");
  await assert.rejects(keyed.get("https://www.law.go.kr/DRF/hop?OC=planted_k"), { name: "InsecureKeyUrlError" });
  await assert.rejects(keyed.get("https://evil.example/x"), { name: "HostNotAllowedError" });
  assert.ok(lines.length >= 2);
  for (const l of lines) {
    assert.match(l, /^\[radar\] GET www\.law\.go\.kr\/DRF\/\S+ (\d{3}|ERR \w+) \d+( \d+)?$/);
    assert.doesNotMatch(l, /planted_k/);
  }
});

test("http: charset(euc-kr) 해석", async () => {
  const http = createHttp({
    fetchImpl: async () => okResponse(new Uint8Array([0xb0, 0xa1]), { headers: { "content-type": "text/html; charset=euc-kr" } }),
    perHostGapMs: 0,
    log: () => {},
  });
  assert.equal((await http.get("https://a.go.kr/")).text, "가");
});

// ─── robots ─────────────────────────────────────────────────
test("robots: 최장 일치·동률 Allow·와일드카드·$·UA 그룹·주석·공백 콜론", () => {
  const mohw = selectRules(parseRobots(readFileSync(join(FIX, "robots-www.mohw.go.kr.txt"), "utf8")));
  assert.equal(evaluate(mohw, "/rss/board.es?mid=a10503000000&bid=0027").allowed, true);
  assert.equal(evaluate(mohw, "/board.es?mid=a10503010100&bid=0027").allowed, true); // 명시 Allow 가 /board.es 보다 김
  assert.equal(evaluate(mohw, "/board.es?mid=a10503000000&bid=0027&list_no=1&act=view").allowed, false);
  const bok = selectRules(parseRobots("User-agent : *\nDisallow: /\nAllow: /portal/  # 공개 영역\n"));
  assert.equal(evaluate(bok, "/portal/singl/x.do").allowed, true);
  assert.equal(evaluate(bok, "/api/x").allowed, false);
  const wild = selectRules(parseRobots("User-agent: *\nDisallow: /*.pdf$\nDisallow: /priv*/doc\nAllow: /p\nDisallow: /p\n"));
  assert.equal(evaluate(wild, "/a/b.pdf").allowed, false);
  assert.equal(evaluate(wild, "/a/b.pdf?x=1").allowed, true);
  assert.equal(evaluate(wild, "/private/doc").allowed, false);
  assert.equal(evaluate(wild, "/p").allowed, true); // 같은 길이면 Allow
  const groups = parseRobots("User-agent: moneysalary-radar\nDisallow: /\n\nUser-agent: *\nAllow: /\n");
  assert.equal(evaluate(selectRules(groups, "moneysalary-radar"), "/x").allowed, false);
  assert.equal(evaluate(selectRules(groups, "otherbot"), "/x").allowed, true);
  const moel = selectRules(parseRobots(readFileSync(join(FIX, "robots-www.moel.go.kr.txt"), "utf8")));
  assert.equal(evaluate(moel, "/portal/x").allowed, false); // 행 끝 주석 제거
  assert.equal(evaluate(moel, "/rss/policy.do").allowed, true);
});

test("robots: 404 만 허용, 5xx·오류는 차단, 호스트별 캐시", async () => {
  const counts = {};
  const http = createHttp({
    fetchImpl: async (url) => {
      const h = new URL(url).hostname;
      counts[h] = (counts[h] || 0) + 1;
      if (h === "a.go.kr") return new Response("nf", { status: 404 });
      if (h === "b.go.kr") return new Response("err", { status: 503 });
      if (h === "c.go.kr") throw new Error("timeout-ish");
      return okResponse("User-agent: *\nDisallow: /x\n");
    },
    perHostGapMs: 0,
    log: () => {},
  });
  assert.equal((await isAllowed("https://a.go.kr/any", { http })).allowed, true);
  assert.equal((await isAllowed("https://b.go.kr/any", { http })).allowed, false);
  assert.equal((await isAllowed("https://c.go.kr/any", { http })).allowed, false);
  assert.equal((await isAllowed("https://d.go.kr/x/1", { http })).allowed, false);
  assert.equal((await isAllowed("https://d.go.kr/y", { http })).allowed, true);
  assert.equal(counts["d.go.kr"], 1);
});

test("--check-robots(고정 표본): 설정된 모든 경로 허용", async () => {
  const { rows, exitCode } = await checkRobots({ mode: "fixtures", log: () => {} });
  assert.equal(exitCode, 0);
  assert.equal(rows.length, cfg.sources.length);
  assert.ok(rows.every((r) => r.allowed));
});

// ─── 목록 파서·법령 ───────────────────────────────────────────
test("국세청·고용노동부 목록 HTML 파서", () => {
  const nts = parseNtsList(readFileSync(join(FIX, "nts-press.html"), "utf8"));
  assert.equal(nts.length, 10);
  const eitc = nts.find((x) => x.title.includes("근로장려금"));
  assert.equal(eitc.link, "https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?mi=2201&nttSn=1354576");
  assert.equal(eitc.publishedAt, "2026-09-01T00:00:00+09:00");
  const moel = parseMoelList(readFileSync(join(FIX, "moel-press.html"), "utf8"));
  assert.ok(moel.length >= 10);
  assert.match(moel[0].link, /^https:\/\/www\.moel\.go\.kr\/news\/enews\/report\/enewsView\.do\?news_seq=\d+$/);
  assert.match(moel[0].publishedAt, /^2026-09-\d{2}T00:00:00\+09:00$/);
});

test("법령 DRF: 키 없으면 건너뜀(요청 0), 키 있으면 대상 법령·소관부처만, 상세 링크·OC 는 출력 금지", async () => {
  const none = createHttp({ fetchImpl: async () => okResponse(""), log: () => {} });
  const skipped = await runLawDrf({ http: none, env: {}, today: "2026-09-26", siteIndex });
  assert.equal(skipped.status, "skipped");
  assert.equal(skipped.note, NO_KEY_NOTE);
  assert.equal(none.stats.requests, 0);

  const xml = readFileSync(join(FIX, "lawdrf.xml"));
  const lines = [];
  let asked = "";
  const http = createHttp({
    fetchImpl: async (url) => {
      asked = url;
      return okResponse(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
    },
    perHostGapMs: 0,
    log: (l) => add(lines, l),
  });
  const res = await runLawDrf({ http, env: { LAW_OC: "test" }, today: "2026-09-26", siteIndex });
  assert.equal(res.status, "ok");
  assert.match(asked, /ancYd=20260919~20260926/);
  assert.deepEqual(
    res.items.map((x) => x.name),
    ["소득세법 시행령", "고용보험법 시행규칙", "남녀고용평등과 일ㆍ가정 양립 지원에 관한 법률 시행령"],
  );
  for (const s of res.items) {
    assert.equal(s.kind, "공포");
    assert.match(s.link, /^https:\/\/www\.law\.go\.kr\/%EB%B2%95%EB%A0%B9\//);
    assert.equal(s.recommendation, s.routes.length ? "update-existing" : "watch");
  }
  assert.ok(res.items[0].routes.length > 0, "소득세법 시행령을 언급하는 라우트");
  const out = JSON.stringify(res);
  assert.doesNotMatch(out, /OC=test|MST=|lawService/);
  assert.ok(lines.every((l) => !l.includes("OC=test") && l.includes("OC=***")));

  const errHttp = createHttp({
    fetchImpl: async () => okResponse("<Response><result>필수입력요소 검증에 실패하였습니다.</result><msg>필수 입력값이 존재하지 않습니다.</msg></Response>"),
    perHostGapMs: 0,
    log: () => {},
  });
  assert.equal((await runLawDrf({ http: errHttp, env: { LAW_OC: "x" }, today: "2026-09-26", siteIndex })).status, "error");
  assert.equal(parseLawDrf(xml.toString("utf8")).length, 5);
  assert.match(buildLawDrfUrl("abc", "2026-01-03"), /ancYd=20251227~20260103/);
});

// ─── 사이트 색인 ─────────────────────────────────────────────
test("사이트 색인: 한국어 가이드 카드·정적 라우트(동적·en·api 제외)·바이그램 유사도", () => {
  const cards = loadGuideCards(REPO_ROOT);
  // main 가이드 상태 기준: adb120cc 한국어 카드 294편(R4 보류 40편 제외, 8e37ceb8 은 334편) — 하한은 여유를 둔 280
  assert.ok(cards.length >= 280, `한국어 가이드 카드 ${cards.length}편`);
  assert.ok(cards.every((g) => g.url === `/guides/${g.slug}`));
  assert.ok(siteIndex.routes.includes("/earned-income-credit"));
  assert.ok(siteIndex.routes.every((r) => !/\[|\(|^\/en(\/|$)|^\/api(\/|$)/.test(r)));
  assert.ok(siteIndex.pages.some((p) => p.route === "/minimum-wage-2027" && /최저임금/.test(p.title)));
  assert.equal(jaccard("최저임금 고시", "최저임금 고시"), 1);
  assert.equal(jaccard("최저임금", "국민연금"), 0);
  assert.ok(statuteMentions("근로기준법", siteIndex).length > 0);
});

// ─── 출력 스키마·파일 ─────────────────────────────────────────
test("출력 스키마: 고정 표본 1회 실행이 validateRadar 를 통과", async () => {
  const { radar, headlines, exitCode } = await runRadar({ mode: "fixtures", today: "2026-09-26", write: false, log: () => {} });
  assert.equal(exitCode, 0);
  assert.deepEqual(validateRadar(radar), []);
  assert.equal(radar.sources.length, 13);
  assert.ok(radar.sources.every((s) => s.ok), JSON.stringify(radar.sources));
  assert.ok(radar.candidates.length > 0);
  assert.ok(radar.candidates.every((c) => c.matches.guides.length <= 3 && c.matches.pages.length <= 3));
  assert.deepEqual(Object.keys(radar.trends).sort(), ["clusters", "financeMatches", "items"]);
  assert.equal(headlines.date, "2026-09-26");
  const md = renderMarkdown(radar);
  for (const h of ["소스 상태", "새 글 후보 top 5", "기존 페이지 갱신 권장", "관찰", "다가오는 공식 일정", "법령 공포 감시", "구글 트렌드 금융 매칭 수"]) assert.ok(md.includes(h), h);
  // 트렌드 제목은 보고서·JSON 에 싣지 않는다
  const trendSection = JSON.stringify(radar.trends) + md.slice(md.indexOf("## 구글 트렌드"));
  assert.ok(headlines.titles.length >= 10);
  for (const t of headlines.titles) assert.ok(!trendSection.includes(t), t);
  assert.ok(radar.candidates.every((c) => !headlines.titles.includes(c.title)));
  const bad = structuredClone(radar);
  bad.trends.titles = ["x"];
  bad.candidates[0].recommendation = "publish";
  assert.ok(validateRadar(bad).length >= 2);
});

test("헤드라인: 트렌드 뉴스 제목은 headlines 파일에만, 21일 지난 파일 정리", async () => {
  const base = fixtureFetch(cfg.sources);
  const withNews = async (url) => {
    const res = await base(url);
    if (url !== srcById["gtrends-kr"].url) return res;
    const xml = (await res.text()).replace("</item>", "<ht:news_item><ht:news_item_title>합성 헤드라인 ALPHA</ht:news_item_title><ht:news_item_snippet>SNIP</ht:news_item_snippet></ht:news_item></item>");
    return okResponse(xml);
  };
  const { radar, headlines } = await runRadar({ mode: "fixtures", today: "2026-09-26", fetchImpl: withNews, write: false, log: () => {} });
  assert.ok(headlines.titles.includes("합성 헤드라인 ALPHA"));
  assert.ok(!JSON.stringify(radar).includes("ALPHA") && !renderMarkdown(radar).includes("ALPHA"));
  assert.ok(!JSON.stringify(headlines).includes("SNIP"));

  const dir = tmp();
  try {
    for (const d of ["2026-09-01", "2026-09-04", "2026-09-05", "2026-09-20"]) writeFileSync(join(dir, `headlines-${d}.json`), "{}");
    writeFileSync(join(dir, "radar-2026-08-01.json"), "{}");
    assert.deepEqual(pruneHeadlines(dir, "2026-09-26", 21), ["headlines-2026-09-01.json", "headlines-2026-09-04.json"]);
    assert.deepEqual(readdirSync(dir).sort(), ["headlines-2026-09-05.json", "headlines-2026-09-20.json", "radar-2026-08-01.json"]);
    const { files } = writeOutputs(dir, radar, headlines);
    for (const f of Object.values(files)) assert.ok(existsSync(f), f);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ─── 금지 엔드포인트·비밀·표본 ─────────────────────────────────
function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".cache") continue;
    const p = join(dir, e.name);
    out = e.isDirectory() ? [...out, ...walk(p)] : [...out, p];
  }
  return out;
}

test("금지 엔드포인트 grep: scripts/trend-radar 전체", () => {
  const forbidden = ["korea.kr/rss", "openapi.naver.com", "datalab", "yna.co.kr", "finlife", "search.naver.com", "google.com/search", "trends/explore", "mpb.go.kr"];
  const files = walk(RADAR_DIR);
  assert.ok(files.length >= 20);
  for (const f of files) {
    const rel = relative(RADAR_DIR, f).split(sep).join("/");
    const text = readFileSync(f, "utf8");
    const lower = text.toLowerCase();
    for (const bad of forbidden) assert.ok(!lower.includes(bad), `${rel} 에 금지 문자열 ${bad}`);
    if (!rel.startsWith("fixtures/")) assert.ok(!text.includes("OC=test"), `${rel} 에 OC=test`);
    // 발행기(trend-publish) 게이트: 발행 스크립트 외 트렌드 스크립트에는 이 단어 자체가 없어야 한다
    assert.ok(!lower.includes("pu" + "sh"), `${rel} 에 금지 단어`);
  }
});

test("비밀 스캔: 40자리 hex·키 값 패턴 없음(설정·코드·표본)", () => {
  for (const f of walk(RADAR_DIR)) {
    const text = readFileSync(f, "utf8");
    assert.doesNotMatch(text, /\b[0-9a-f]{40}\b/i, f);
    assert.doesNotMatch(text, /\b(?:OC|key|auth|authKey|serviceKey|crtfc_key)=(?!test\b|\*\*\*)[A-Za-z0-9%_-]{6,}/, f);
  }
});

test("표본: 40KB 이하, description·본문 없음, 피드당 15건 이하", () => {
  const files = readdirSync(FIX);
  assert.ok(files.length >= 21);
  for (const n of files) {
    const p = join(FIX, n);
    const text = readFileSync(p, "utf8");
    assert.ok(statSync(p).size <= 40 * 1024, `${n} 크기`);
    assert.doesNotMatch(text, /<description|content:encoded|news_item/i, n);
    assert.ok((text.match(/<item>/g) || []).length <= 15, `${n} 항목 수`);
  }
});

// ─── CLI ─────────────────────────────────────────────────────
test("CLI 인자: 사용법 오류는 UsageError, 종료 코드 2", () => {
  assert.throws(() => parseArgs([]), UsageError);
  assert.throws(() => parseArgs(["--fixtures", "--live"]), UsageError);
  assert.throws(() => parseArgs(["--fixtures", "--today", "2026-9-1"]), UsageError);
  assert.throws(() => parseArgs(["--live", "--max-requests", "0"]), UsageError);
  assert.throws(() => parseArgs(["--bogus"]), UsageError);
  assert.equal(parseArgs(["--check-robots"]).mode, "live");
  assert.equal(parseArgs(["--fixtures", "--today", "2026-09-26"]).today, "2026-09-26");
  const r = spawnSync(process.execPath, [RUN], { encoding: "utf8" });
  assert.equal(r.status, 2);
});

test("고정 표본 CLI 1회: 5초 안·RSS 300MB 미만·3개 파일·근로장려금 행은 /earned-income-credit 갱신", () => {
  const out = tmp();
  try {
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [RUN, "--fixtures", "--today", "2026-09-26", "--out", out], { encoding: "utf8" });
    const elapsed = Date.now() - t0;
    assert.equal(r.status, 0, r.stderr);
    assert.ok(elapsed < 5000, `${elapsed}ms`);
    const rss = Number((/rssMB=([\d.]+)/.exec(r.stdout) || [])[1]);
    assert.ok(rss > 0 && rss < 300, `rssMB=${rss}`);
    const radar = JSON.parse(readFileSync(join(out, "radar-2026-09-26.json"), "utf8"));
    assert.deepEqual(validateRadar(radar), []);
    const md = readFileSync(join(out, "radar-2026-09-26.md"), "utf8");
    assert.match(md, /^# 트렌드 레이더 — 2026-09-26/);
    const hl = JSON.parse(readFileSync(join(out, "headlines-2026-09-26.json"), "utf8"));
    assert.equal(hl.date, "2026-09-26");
    assert.equal(radar.trends.financeMatches, 0);
    assert.ok(radar.candidates.every((c) => c.src !== "gtrends-kr"));
    const eitc = radar.candidates.find((c) => c.src === "nts-press" && c.title.includes("근로장려금"));
    assert.equal(eitc.recommendation, "update-existing");
    assert.ok(eitc.hubRoutes.includes("/earned-income-credit"));
    for (const c of radar.candidates) {
      if (["tax-law-amendment", "earned-income-credit", "parental-leave"].includes(c.cluster)) assert.notEqual(c.recommendation, "new-brief", c.title);
    }
    assert.doesNotMatch(readFileSync(join(out, "radar-2026-09-26.json"), "utf8") + md, /OC=test|FIXTURE/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
