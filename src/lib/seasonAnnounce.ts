// src/lib/seasonAnnounce.ts
//
// 시즌 URL 등록부 + 발표일 알림 목록 — 순수 함수 (fs·네트워크·시계 없음). R6-04 (2026-09-27).
// 데이터: docs/season-urls-2026-27.json · CLI: npx tsx scripts/season-announce.ts check | event E3 | diff <prev> <next>
// 어떤 페이지·라우트도 이 모듈을 import 하지 않는다(빌드 산출물 무변화 — 운영 보조 도구).
//
// 무엇을 하나
//  - 동결기(11/1~1/31) 공식 발표 이벤트 E0~E12 마다 "어느 URL 이 바뀔 수 있고, 그 URL 의 sitemap lastmod 를
//    무엇으로 올리며, 어느 피드에 실리는지"를 한 표로 둔다. 이벤트 행은 R4 시즌 달력 행 id(C-xx)와
//    R3 W4-A 동결 런북 슬롯 이름만 가리킨다 — 바꿀 상수·문구·절차 본문은 그 원문에 있고 여기서 복사하지 않는다.
//    진행형 상태 문구 점검은 staleStatusScan(scripts/stale-status-scan.ts)의 몫이라 여기에는 상태 단어가 없다.
//  - announceList: 이벤트 하나의 알림 후보 — 네이버 수집 요청 10개 이하(클러스터 우선순위 순),
//    구글 URL 검사 3개 이하, rss-tables 피드 메타 동기화 대상, lastmod 손잡이 할 일, diff 밖 수동 요청 후보.
//  - diffSitemaps: 배포 전·후 사이트맵의 (loc, lastmod) 쌍 차이. scripts/indexnow-diff.mjs 와 같은 규칙
//    (같은 호스트만, XML 엔티티 복원, lastmod 는 날짜 값으로 비교, 오류 페이지·잘린 XML 은 판독 실패)이라
//    결과가 CF 빌드 로그 [indexnow] 제출 목록과 같다 — 운영자 수집 요청 목록 = [indexnow] 목록.
//    두 구현의 일치는 src/lib/__tests__/seasonAnnounce.test.ts 가 같은 입력으로 대조한다.
//
// lastmod 손잡이 종류 (row.lastmodHandle.kind)
//  - route-override    : src/app/sitemap.ts ROUTE_OVERRIDES[ref] 의 lastModified. ref = 라우트(= url).
//  - add-on-event      : 지금은 손잡이가 없다(STATIC_LAST_MODIFIED 폴백 등). 발표 반영 커밋에서 손잡이를 새로 둔다.
//                        ref 가 '/' 로 시작하면 그 라우트의 ROUTE_OVERRIDES 한 줄 추가, 아니면 설명.
//  - guide-modified    : 가이드 modifiedDate → gen-guides-meta. ref = 슬러그.
//  - calc-publishedAt  : 간이 계산기 날짜 — 사이트맵은 max(기준일, CalculatorDef.publishedAt, modifiedAt) 를 읽는다.
//                        발표 반영은 modifiedAt 으로 올린다(publishedAt 은 신설일 — 종류 이름은 등록부 호환으로 유지). ref = 슬러그.
//  - bonus-engine      : sitemap.ts 성과급 엔진 루프의 공유 날짜 — 루프가 ROUTE_OVERRIDES 의 날짜를 덮어쓰므로
//                        한 URL 만 올릴 수 없다(올리면 루프의 모든 라우트가 [indexnow] 대상).
//                        (11/1 전 결정 대기: 루프를 max(ROUTE_OVERRIDES 날짜, BONUS_ENGINE_REVIEW_DATE) 로 바꾸면
//                         발표 당사 계산기 한 곳만 올릴 수 있다 — sitemap.ts 코드 변경이라 R6 담당·운영자 결정.)
//  - data-checked      : 데이터 상수의 확인일에서 파생(예: 2027 봉급표 checked, 리포트 updatedDate). ref = 심볼.
//  - company-lastUpdated: 회사 상세 — companyPageModified(회사 데이터·FAQ 수정일).
//
// 날짜 손잡이가 없는 행(isHandleless: bonus-engine, ref 가 경로가 아닌 add-on-event)은 내용이 바뀌어도
// 사이트맵 diff·[indexnow] 에 나오지 않는다. 발표일에는 'diff 밖 수동 요청' 목록(manualOnly·manualRequest)으로
// 따로 내보내고, '손잡이 누락' 경고(eventUnchanged)에는 넣지 않는다.

export const EVENT_IDS = [
  "E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12",
] as const;
export type EventId = (typeof EVENT_IDS)[number];

/** R4 시즌 달력 행 id (C-01 ~ C-12) */
export const CALENDAR_IDS = [
  "C-01", "C-02", "C-03", "C-04", "C-05", "C-06", "C-07", "C-08", "C-09", "C-10", "C-11", "C-12",
] as const;
export type CalendarId = (typeof CALENDAR_IDS)[number];

/** R3 W4-A 동결 런북 슬롯 이름 (이름만 — 슬롯 내용은 런북 원문) */
export const W4A_SLOTS = [
  "F-A", "F-B", "F-C", "F-D", "F-E",
  "P-1", "P-2", "P-3", "P-4", "P-5", "P-6",
  "TAI 12월", "OPI 1월 말", "공무원 확정 12월 말", "최저임금 1/1",
  "12/1 DEC 시즌 자동", "1/2 JAN 수동", "11/25·12/16 보유세 재빌드",
] as const;
export type W4aSlot = (typeof W4A_SLOTS)[number];

export const LASTMOD_KINDS = [
  "route-override",
  "data-checked",
  "guide-modified",
  "calc-publishedAt",
  "bonus-engine",
  "company-lastUpdated",
  "add-on-event",
] as const;
export type LastmodKind = (typeof LASTMOD_KINDS)[number];

export const FEEDS = ["rss", "rss-tables", "rss-companies"] as const;
export type Feed = (typeof FEEDS)[number];

export const STATUSES = ["live", "pending-1014", "pending-1016", "pending-R4B3", "pending-civilpay"] as const;
export type RowStatus = (typeof STATUSES)[number];

/** 네이버 서치어드바이저 웹 페이지 수집 요청 — 하루 상한 */
export const NAVER_REQUEST_CAP = 10;
/** 구글 서치콘솔 URL 검사(색인 생성 요청) — 이벤트당 상한 */
export const GSC_INSPECT_CAP = 3;
/** /rss-tables.xml item 상한 (rssTablesFeed.ts TABLES_FEED_MAX_ITEMS 와 같은 값) */
export const RSS_TABLES_MAX_ITEMS = 60;

export const SITE_HOST = "www.moneysalary.com";
export const SITE_ORIGIN = `https://${SITE_HOST}`;

export interface LastmodHandle {
  kind: LastmodKind;
  ref: string;
}

export interface SeasonRow {
  url: string;
  cluster: string;
  events: EventId[];
  /** 검색 수요 정점: 'YYYY-MM' 또는 'YYYY-MM~YYYY-MM' */
  peak: string;
  lastmodHandle: LastmodHandle;
  feeds: Feed[];
  status: RowStatus;
}

export interface SeasonCluster {
  /** 작을수록 먼저 요청한다 */
  priority: number;
  name: string;
}

export interface SeasonEvent {
  name: string;
  expected: string;
  calendar: CalendarId[];
  w4a: W4aSlot[];
}

export interface SeasonRegistry {
  version: number;
  asOf: string;
  base: string;
  statuses: Record<RowStatus, string>;
  clusters: Record<string, SeasonCluster>;
  events: Record<EventId, SeasonEvent>;
  calendarNotMapped: Partial<Record<CalendarId, string>>;
  w4aNotMapped: Partial<Record<W4aSlot, string>>;
  rows: SeasonRow[];
}

// ── 스키마 ─────────────────────────────────────────────────────────────────────────

const PEAK_RE = /^\d{4}-(0[1-9]|1[0-2])(~\d{4}-(0[1-9]|1[0-2]))?$/;
const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const includes = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (list as readonly string[]).includes(v);

/** 등록부 JSON 의 구조 오류 목록 (빈 배열 = 통과). 사이트맵·ROUTE_OVERRIDES 와의 대조는 validateRegistry. */
export function schemaErrors(input: unknown): string[] {
  const errors: string[] = [];
  if (!isObj(input)) return ["등록부가 객체가 아님"];
  if (typeof input.version !== "number") errors.push("version 이 숫자가 아님");
  if (!isStr(input.asOf) || !ISO_DAY_RE.test(input.asOf)) errors.push("asOf 가 YYYY-MM-DD 가 아님");
  if (!isStr(input.base)) errors.push("base 없음");

  if (!isObj(input.statuses)) errors.push("statuses 없음");
  else for (const s of STATUSES) if (!isStr(input.statuses[s])) errors.push(`statuses.${s} 설명 없음`);

  const clusterIds = new Set<string>();
  if (!isObj(input.clusters)) errors.push("clusters 없음");
  else {
    const priorities = new Set<number>();
    for (const [id, c] of Object.entries(input.clusters)) {
      clusterIds.add(id);
      if (!isObj(c) || typeof c.priority !== "number" || !isStr(c.name)) {
        errors.push(`clusters.${id}: {priority:number, name} 아님`);
        continue;
      }
      if (priorities.has(c.priority)) errors.push(`clusters.${id}: priority ${c.priority} 중복`);
      priorities.add(c.priority);
    }
  }

  if (!isObj(input.events)) errors.push("events 없음");
  else {
    for (const id of Object.keys(input.events)) {
      if (!includes(EVENT_IDS, id)) errors.push(`events.${id}: 알 수 없는 이벤트 id`);
    }
    for (const id of EVENT_IDS) {
      const e = input.events[id];
      if (!isObj(e)) {
        errors.push(`events.${id} 없음`);
        continue;
      }
      if (!isStr(e.name)) errors.push(`events.${id}.name 없음`);
      if (!isStr(e.expected)) errors.push(`events.${id}.expected 없음`);
      if (!Array.isArray(e.calendar) || !e.calendar.every((c) => includes(CALENDAR_IDS, c))) {
        errors.push(`events.${id}.calendar 는 C-01~C-12 배열이어야 함`);
      }
      if (!Array.isArray(e.w4a) || !e.w4a.every((s) => includes(W4A_SLOTS, s))) {
        errors.push(`events.${id}.w4a 는 W4-A 슬롯 이름 배열이어야 함`);
      }
    }
  }
  for (const key of ["calendarNotMapped", "w4aNotMapped"] as const) {
    const m = input[key];
    if (!isObj(m)) {
      errors.push(`${key} 없음`);
      continue;
    }
    const allowed: readonly string[] = key === "calendarNotMapped" ? CALENDAR_IDS : W4A_SLOTS;
    for (const [id, why] of Object.entries(m)) {
      if (!allowed.includes(id)) errors.push(`${key}.${id}: 알 수 없는 id`);
      if (!isStr(why)) errors.push(`${key}.${id}: 사유 없음`);
    }
  }

  if (!Array.isArray(input.rows) || input.rows.length === 0) {
    errors.push("rows 가 비었거나 배열이 아님");
    return errors;
  }
  const seen = new Set<string>();
  input.rows.forEach((r: unknown, i: number) => {
    const at = isObj(r) && isStr(r.url) ? r.url : `rows[${i}]`;
    if (!isObj(r)) {
      errors.push(`${at}: 객체가 아님`);
      return;
    }
    const url = r.url;
    if (!isStr(url) || !url.startsWith("/") || (url !== "/" && url.endsWith("/")) || /[?#\s]/.test(url)) {
      errors.push(`${at}: url 은 '/'로 시작하는 경로(끝 '/'·쿼리·공백 없음)`);
    } else if (seen.has(url)) errors.push(`${at}: url 중복`);
    else seen.add(url);
    if (!isStr(r.cluster) || !clusterIds.has(r.cluster)) errors.push(`${at}: cluster 가 clusters 에 없음`);
    if (!Array.isArray(r.events) || !r.events.every((e) => includes(EVENT_IDS, e))) {
      errors.push(`${at}: events 는 E0~E12 배열이어야 함`);
    } else if (new Set(r.events).size !== r.events.length) errors.push(`${at}: events 중복`);
    if (!isStr(r.peak) || !PEAK_RE.test(r.peak)) errors.push(`${at}: peak 는 YYYY-MM 또는 YYYY-MM~YYYY-MM`);
    const h = r.lastmodHandle;
    if (!isObj(h) || !includes(LASTMOD_KINDS, h.kind) || !isStr(h.ref)) {
      errors.push(`${at}: lastmodHandle 은 {kind: ${LASTMOD_KINDS.join("|")}, ref}`);
    }
    if (!Array.isArray(r.feeds) || !r.feeds.every((f) => includes(FEEDS, f))) {
      errors.push(`${at}: feeds 는 ${FEEDS.join("|")} 배열이어야 함`);
    } else if (new Set(r.feeds).size !== r.feeds.length) errors.push(`${at}: feeds 중복`);
    if (!includes(STATUSES, r.status)) errors.push(`${at}: status 는 ${STATUSES.join("|")}`);
  });
  return errors;
}

/** 구조 검사를 통과한 등록부로 좁힌다. 실패하면 오류 목록을 담아 throw. */
export function parseRegistry(input: unknown): SeasonRegistry {
  const errors = schemaErrors(input);
  if (errors.length) throw new Error(`시즌 등록부 구조 오류 ${errors.length}건:\n- ${errors.join("\n- ")}`);
  return input as SeasonRegistry;
}

// ── 대조 검증 ───────────────────────────────────────────────────────────────────────

export interface RssTablesMembership {
  /** rssTablesFeed.ts FEED_PATHS */
  feed: readonly string[];
  /** rssTablesFeed.ts PENDING_AFTER_OCT_MERGE (아직 페이지가 없는 예정 멤버) */
  pending?: readonly string[];
}

export interface ValidateOptions {
  /** rssTablesFeed.ts 가 트리에 있으면 그 멤버 — 등록부 'rss-tables' 표시와 대조한다 */
  rssTables?: RssTablesMembership;
  /** 사이트맵이 실제로 내보내는 lastmod (경로 → YYYY-MM-DD) */
  sitemapLastmods?: ReadonlyMap<string, string>;
  /** ROUTE_OVERRIDES 의 lastModified (키 → YYYY-MM-DD, 날짜가 있는 키만) */
  overrideDays?: ReadonlyMap<string, string>;
}

/**
 * 등록부 ↔ 사이트맵·ROUTE_OVERRIDES 대조. 반환 = 오류 목록(빈 배열 = 통과).
 * - live 행의 url 은 사이트맵에 있어야 한다(대기 행은 없어도 된다).
 * - route-override 행의 ref 는 ROUTE_OVERRIDES 키여야 한다(대기 행은 그 키가 아직 없어도 된다).
 *   손잡이가 아직 없는 행은 add-on-event 로 적는다.
 * - 손잡이 ref 와 url 의 짝(가이드 슬러그·계산기 슬러그·라우트)이 맞아야 한다.
 * - sitemapLastmods·overrideDays 를 주면: route-override 행의 사이트맵 lastmod 가 ROUTE_OVERRIDES 날짜와 같아야 한다
 *   (다르면 다른 코드가 그 날짜를 덮어쓰는 것 — 예: 성과급 엔진 루프. 그 손잡이는 올려도 [indexnow] 에 안 나간다).
 * - 피드 표시가 경로 종류와 맞아야 하고, rss-tables 멤버는 RSS_TABLES_MAX_ITEMS 이하.
 * - rssTables 를 주면 양방향 대조: 'rss-tables' 표시 ↔ FEED_PATHS·PENDING_AFTER_OCT_MERGE,
 *   그리고 피드 멤버인데 등록부 행 자체가 없는 경로도 오류.
 * - 이벤트 표: 모든 C-xx·W4-A 슬롯은 어느 이벤트에 걸리거나 NotMapped 에 사유가 있어야 한다(둘 다는 안 됨).
 */
export function validateRegistry(
  registry: SeasonRegistry,
  sitemapPaths: Iterable<string>,
  routeOverrideKeys: Iterable<string>,
  options: ValidateOptions = {},
): string[] {
  const errors: string[] = [];
  const inSitemap = new Set(sitemapPaths);
  const overrides = new Set(routeOverrideKeys);

  for (const row of registry.rows) {
    const { url, status } = row;
    const live = status === "live";
    const { kind, ref } = row.lastmodHandle;
    if (live && !inSitemap.has(url)) errors.push(`${url}: live 인데 사이트맵에 없음`);

    switch (kind) {
      case "route-override":
        if (ref !== url) errors.push(`${url}: route-override ref(${ref}) 는 url 과 같아야 함`);
        if (!overrides.has(ref) && live) {
          errors.push(`${url}: ROUTE_OVERRIDES 에 '${ref}' 키 없음 — 손잡이가 없으면 add-on-event 로 적을 것`);
        }
        if (live && options.sitemapLastmods && options.overrideDays) {
          const actual = options.sitemapLastmods.get(url);
          const handle = options.overrideDays.get(ref);
          if (actual && handle && actual !== handle) {
            errors.push(
              `${url}: 사이트맵 lastmod ${actual} ≠ ROUTE_OVERRIDES 날짜 ${handle} — 다른 코드가 덮어쓰는 죽은 손잡이, kind 를 다시 분류`,
            );
          }
        }
        break;
      case "add-on-event":
        if (ref.startsWith("/") && ref !== url) errors.push(`${url}: add-on-event ref(${ref}) 는 url 과 같아야 함`);
        break;
      case "guide-modified":
        if (url !== `/guides/${ref}`) errors.push(`${url}: guide-modified ref(${ref}) 와 url 불일치`);
        break;
      case "calc-publishedAt":
        if (url !== `/calc/${ref}`) errors.push(`${url}: calc-publishedAt ref(${ref}) 와 url 불일치`);
        break;
      case "bonus-engine":
        if (!url.startsWith("/calc/")) errors.push(`${url}: bonus-engine 은 /calc/* 만`);
        break;
      case "company-lastUpdated":
        if (!url.startsWith("/salary-db/")) errors.push(`${url}: company-lastUpdated 는 /salary-db/* 만`);
        break;
      case "data-checked":
        break;
    }

    for (const feed of row.feeds) {
      if (feed === "rss" && !/^\/(guides|insights)\//.test(url)) errors.push(`${url}: rss 피드는 /guides/*·/insights/* 만`);
      if (feed === "rss-companies" && !url.startsWith("/salary-db/")) errors.push(`${url}: rss-companies 는 /salary-db/* 만`);
      if (feed === "rss-tables" && /^\/(guides|insights|job|salary-db)\//.test(url)) {
        errors.push(`${url}: rss-tables 에는 가이드·리포트·직업·회사 경로를 싣지 않음`);
      }
    }
  }

  const tablesRows = registry.rows.filter((r) => r.feeds.includes("rss-tables"));
  if (tablesRows.length > RSS_TABLES_MAX_ITEMS) {
    errors.push(`rss-tables 멤버 ${tablesRows.length}개 > 상한 ${RSS_TABLES_MAX_ITEMS}`);
  }
  if (options.rssTables) {
    const members = new Set([...options.rssTables.feed, ...(options.rssTables.pending ?? [])]);
    const feedNow = new Set(options.rssTables.feed);
    const rowUrls = new Set(registry.rows.map((r) => r.url));
    for (const r of tablesRows) {
      if (!members.has(r.url)) errors.push(`${r.url}: 'rss-tables' 표시인데 rssTablesFeed.ts 멤버가 아님`);
    }
    for (const r of registry.rows) {
      if (feedNow.has(r.url) && !r.feeds.includes("rss-tables")) {
        errors.push(`${r.url}: rssTablesFeed.ts FEED_PATHS 멤버인데 등록부에 'rss-tables' 표시 없음`);
      }
    }
    // 반대 방향 — 피드 멤버인데 등록부 행 자체가 없으면 위 루프(등록부 행 기준)로는 안 잡힌다
    for (const path of options.rssTables.feed) {
      if (!rowUrls.has(path)) errors.push(`${path}: rssTablesFeed.ts FEED_PATHS 멤버인데 등록부에 행 없음`);
    }
    for (const path of options.rssTables.pending ?? []) {
      if (!rowUrls.has(path)) errors.push(`${path}: rssTablesFeed.ts PENDING_AFTER_OCT_MERGE 멤버인데 등록부에 행 없음`);
    }
  }

  // 이벤트 표 — C-xx·W4-A 슬롯이 빠짐없이, 한 번만 설명되는지
  const mappedCal = new Set<string>();
  const mappedSlots = new Set<string>();
  for (const id of EVENT_IDS) {
    const e = registry.events[id];
    e.calendar.forEach((c) => mappedCal.add(c));
    e.w4a.forEach((s) => mappedSlots.add(s));
  }
  for (const c of CALENDAR_IDS) {
    const why = registry.calendarNotMapped[c];
    if (!mappedCal.has(c) && !why) errors.push(`${c}: 어느 이벤트에도 없고 calendarNotMapped 사유도 없음`);
    if (mappedCal.has(c) && why) errors.push(`${c}: 이벤트에 걸려 있는데 calendarNotMapped 에도 있음`);
  }
  for (const s of W4A_SLOTS) {
    const why = registry.w4aNotMapped[s];
    if (!mappedSlots.has(s) && !why) errors.push(`W4-A '${s}': 어느 이벤트에도 없고 w4aNotMapped 사유도 없음`);
    if (mappedSlots.has(s) && why) errors.push(`W4-A '${s}': 이벤트에 걸려 있는데 w4aNotMapped 에도 있음`);
  }
  return errors;
}

/** 오류는 아니지만 등록부를 고칠 때가 된 신호 (exit 코드에 영향 없음). */
export function registryWarnings(
  registry: SeasonRegistry,
  sitemapPaths: Iterable<string>,
  routeOverrideKeys: Iterable<string>,
  sitemapLastmods?: ReadonlyMap<string, string>,
): string[] {
  const warnings: string[] = [];
  const inSitemap = new Set(sitemapPaths);
  const overrides = new Set(routeOverrideKeys);
  if (sitemapLastmods) {
    // bonus-engine 은 공유 날짜 하나 — 서로 다르면 루프가 바뀐 것(개별 날짜가 생겼다면 kind 를 다시 분류)
    const days = new Set(
      registry.rows
        .filter((r) => r.status === "live" && r.lastmodHandle.kind === "bonus-engine")
        .map((r) => sitemapLastmods.get(r.url))
        .filter((d): d is string => Boolean(d)),
    );
    if (days.size > 1) {
      warnings.push(`bonus-engine 행의 사이트맵 lastmod 가 ${days.size}종(${[...days].sort().join(", ")}) — 성과급 루프가 바뀌었으면 kind 를 다시 분류`);
    }
  }
  for (const row of registry.rows) {
    if (row.status !== "live" && inSitemap.has(row.url)) {
      warnings.push(`${row.url}: ${row.status} 인데 이미 사이트맵에 있음 — status 를 live 로`);
    }
    const { kind, ref } = row.lastmodHandle;
    if (kind === "add-on-event" && overrides.has(ref)) {
      warnings.push(`${row.url}: ROUTE_OVERRIDES 에 '${ref}' 키가 생김 — kind 를 route-override 로`);
    }
    if (kind === "route-override" && row.status !== "live" && !overrides.has(ref) && inSitemap.has(row.url)) {
      warnings.push(`${row.url}: 사이트맵에 있으나 ROUTE_OVERRIDES 키 없음`);
    }
  }
  return warnings;
}

// ── 이벤트별 알림 목록 ───────────────────────────────────────────────────────────────

export interface LastmodTodo {
  url: string;
  kind: LastmodKind;
  ref: string;
  /** 사람이 할 일 (한국어) */
  action: string;
}

export interface AnnounceList {
  eventId: EventId;
  event: SeasonEvent;
  /** 이벤트에 걸린 live 행 전체 — 클러스터 우선순위, 같은 클러스터는 등록부 순서 */
  candidates: string[];
  /** 네이버 수집 요청 — candidates 앞에서 NAVER_REQUEST_CAP 개 */
  naverRequest: string[];
  /** 상한을 넘은 후보 — 다음 날 요청 */
  overflow: string[];
  /** 구글 URL 검사 — candidates 앞에서 GSC_INSPECT_CAP 개 */
  gscInspect: string[];
  /** rss-tables 멤버 — 제목·설명을 바꾸면 같은 커밋에서 TABLES_FEED_META 를 맞출 것 */
  feedMetaSync: string[];
  /** 가이드·리포트(rss) 멤버 — 날짜를 올리면 /rss.xml 순서가 바뀐다 */
  rssMembers: string[];
  /** 날짜 손잡이가 없는 후보(isHandleless) — 사이트맵 diff 에 나오지 않으니 내용이 바뀌면 수동 수집 요청 */
  manualOnly: string[];
  lastmodTodo: LastmodTodo[];
  /** 이벤트에 걸렸지만 아직 live 가 아닌 행 */
  skippedPending: Array<{ url: string; status: RowStatus }>;
}

/**
 * 날짜 손잡이가 없는 행인가 — 내용이 바뀌어도 사이트맵 lastmod 가 그대로라 diff·[indexnow] 에 나오지 않는다.
 *  - bonus-engine: 공유 날짜 하나라 한 URL 만 올릴 수 없다.
 *  - add-on-event 중 ref 가 경로가 아닌 것(예: /job/soldier — jobUrls 에 직업별 날짜 손잡이 없음).
 * ref 가 경로인 add-on-event 는 ROUTE_OVERRIDES 한 줄로 손잡이를 만들 수 있으니 여기 들지 않는다.
 */
export function isHandleless(handle: LastmodHandle): boolean {
  return handle.kind === "bonus-engine" || (handle.kind === "add-on-event" && !handle.ref.startsWith("/"));
}

/** 손잡이 종류별 할 일 한 줄 (한국어) */
export function lastmodAction(handle: LastmodHandle): string {
  const { kind, ref } = handle;
  switch (kind) {
    case "route-override":
      return `src/app/sitemap.ts ROUTE_OVERRIDES['${ref}'].lastModified → 반영 배포일`;
    case "add-on-event":
      return ref.startsWith("/")
        ? `손잡이 없음 — src/app/sitemap.ts ROUTE_OVERRIDES 에 '${ref}': { lastModified: 반영 배포일 } 한 줄 추가`
        : `손잡이 없음 — ${ref}. 날짜만으로 올릴 수 없어 diff·[indexnow] 에 안 나옴 — 내용이 바뀌었으면 'diff 밖 수동 요청'으로 수집 요청`;
    case "guide-modified":
      return `가이드 '${ref}' modifiedDate → 반영 배포일, 그다음 npx tsx scripts/gen-guides-meta.ts`;
    case "calc-publishedAt":
      return `간이 계산기 '${ref}' modifiedAt(없으면 추가) → 반영 배포일 (publishedAt 은 신설일이라 그대로)`;
    case "bonus-engine":
      return `공유 날짜 ${ref} — 한 URL 만 올릴 수 없음(올리면 성과급 엔진 루프 전체가 [indexnow] 대상). 날짜는 그대로 두고, 내용이 바뀌었으면 'diff 밖 수동 요청'으로 수집 요청`;
    case "data-checked":
      return `${ref} 에서 파생 — 그 확인일이 바뀌는 반영일 때만 자동으로 올라감(아니면 diff 의 'lastmod 그대로' 목록에 남는다)`;
    case "company-lastUpdated":
      return `회사 데이터·FAQ 수정일(companyPageModified) → 반영 배포일`;
  }
}

function orderedRows(registry: SeasonRegistry, rows: SeasonRow[]): SeasonRow[] {
  const index = new Map(registry.rows.map((r, i) => [r.url, i]));
  const prio = (r: SeasonRow) => registry.clusters[r.cluster]?.priority ?? Number.MAX_SAFE_INTEGER;
  return [...rows].sort((a, b) => prio(a) - prio(b) || (index.get(a.url) ?? 0) - (index.get(b.url) ?? 0));
}

/** 이벤트 하나의 알림 후보. 실제 요청 목록은 배포 뒤 diffSitemaps 결과로 확정한다(requestPlan). */
export function announceList(registry: SeasonRegistry, eventId: EventId): AnnounceList {
  const event = registry.events[eventId];
  if (!event) throw new Error(`알 수 없는 이벤트: ${eventId}`);
  const rows = registry.rows.filter((r) => r.events.includes(eventId));
  const live = orderedRows(
    registry,
    rows.filter((r) => r.status === "live"),
  );
  const candidates = live.map((r) => r.url);
  return {
    eventId,
    event,
    candidates,
    naverRequest: candidates.slice(0, NAVER_REQUEST_CAP),
    overflow: candidates.slice(NAVER_REQUEST_CAP),
    gscInspect: candidates.slice(0, GSC_INSPECT_CAP),
    feedMetaSync: live.filter((r) => r.feeds.includes("rss-tables")).map((r) => r.url),
    rssMembers: live.filter((r) => r.feeds.includes("rss")).map((r) => r.url),
    manualOnly: live.filter((r) => isHandleless(r.lastmodHandle)).map((r) => r.url),
    lastmodTodo: live.map((r) => ({
      url: r.url,
      kind: r.lastmodHandle.kind,
      ref: r.lastmodHandle.ref,
      action: lastmodAction(r.lastmodHandle),
    })),
    skippedPending: rows.filter((r) => r.status !== "live").map((r) => ({ url: r.url, status: r.status })),
  };
}

// ── 사이트맵 차이 (scripts/indexnow-diff.mjs 와 같은 규칙) ─────────────────────────────

const XML_ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };
const decodeXml = (s: string) => s.replace(/&(?:amp|lt|gt|quot|apos);/g, (e) => XML_ENTITIES[e]);

/** Cloudflare 오류 페이지(1102 등) 표식 — indexnow-diff.mjs CF_ERROR_RE 와 같은 식 */
const CF_ERROR_RE = /error(?:\s+code)?:?\s*1102\b|worker exceeded resource limits|cf-error-details/i;

/** 사이트맵 XML → Map<loc, lastmod|null>. 다른 호스트 loc 는 버린다. */
export function parseSitemapEntries(xml: string, host: string = SITE_HOST): Map<string, string | null> {
  const entries = new Map<string, string | null>();
  const urlRe = /<url>([\s\S]*?)<\/url>/g;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(xml)) !== null) {
    const body = m[1];
    const loc = body.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const url = decodeXml(loc.trim());
    if (!url.startsWith(`https://${host}/`)) continue;
    const lastmod = body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? null;
    entries.set(url, lastmod);
  }
  return entries;
}

export type SitemapRead = { ok: true; entries: Map<string, string | null> } | { ok: false; reason: string };

/** 사이트맵 본문 판독 — 빈 본문·오류 페이지·잘린 XML·loc 0건은 실패 (indexnow 는 이때 제출하지 않는다) */
export function readSitemapXml(xml: string): SitemapRead {
  if (typeof xml !== "string" || xml.length === 0) return { ok: false, reason: "빈 본문" };
  if (CF_ERROR_RE.test(xml)) return { ok: false, reason: "Cloudflare 오류 페이지(1102 등)" };
  if (!xml.includes("<urlset") || !xml.includes("</urlset>")) return { ok: false, reason: "urlset 아님 또는 잘린 XML" };
  const entries = parseSitemapEntries(xml);
  if (entries.size === 0) return { ok: false, reason: "loc 0건" };
  return { ok: true, entries };
}

function sameLastmod(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
  return ta === tb;
}

export type SitemapDiff =
  | {
      ok: true;
      added: string[];
      changed: string[];
      removed: string[];
      /** [indexnow] 제출 목록과 같은 순서: 신규 → 변경 → 삭제 (각각 정렬) */
      urls: string[];
    }
  | { ok: false; side: "prev" | "next"; reason: string };

/**
 * 배포 전(prev)·후(next) 사이트맵의 (loc, lastmod) 쌍 차이.
 * 한쪽이라도 판독에 실패하면 ok:false — indexnow 도 이때는 아무것도 제출하지 않는다.
 */
export function diffSitemaps(prevXml: string, nextXml: string): SitemapDiff {
  const prev = readSitemapXml(prevXml);
  if (!prev.ok) return { ok: false, side: "prev", reason: prev.reason };
  const next = readSitemapXml(nextXml);
  if (!next.ok) return { ok: false, side: "next", reason: next.reason };
  const added: string[] = [];
  const changed: string[] = [];
  const removed: string[] = [];
  next.entries.forEach((lastmod, url) => {
    if (!prev.entries.has(url)) added.push(url);
    else if (!sameLastmod(prev.entries.get(url), lastmod)) changed.push(url);
  });
  prev.entries.forEach((_, url) => {
    if (!next.entries.has(url)) removed.push(url);
  });
  added.sort();
  changed.sort();
  removed.sort();
  return { ok: true, added, changed, removed, urls: [...added, ...changed, ...removed] };
}

/** 절대 URL → 경로(퍼센트 인코딩 유지). 이 사이트 URL 이 아니면 그대로 */
export function toPath(url: string): string {
  return url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) || "/" : url;
}

export interface RequestPlan {
  /** 수집 요청 대상 = 신규 + 변경 (등록부 클러스터 우선순위 → 등록부 밖은 경로 순) */
  ordered: string[];
  /** NAVER_REQUEST_CAP 개씩 나눈 날짜별 묶음 */
  naverDays: string[][];
  gscInspect: string[];
  /** 삭제된 URL — 수집 요청 불필요(엔진이 404·308 을 보고 정리) */
  removed: string[];
  /** 등록부에 없는 바뀐 URL — 의도한 변경인지 확인 */
  outsideRegistry: string[];
  /**
   * eventId 를 준 경우: 이벤트 후보 중 날짜 손잡이가 없는 URL(isHandleless) 로 diff 에 안 나온 것.
   * diff 에 나올 수 없으니 누락 경고가 아니다 — 내용이 바뀐 것만 골라 diff 목록과 함께 수동으로 수집 요청.
   * 등록부 클러스터 우선순위 순.
   */
  manualRequest: string[];
  /** eventId 를 준 경우: 날짜 손잡이가 있는 이벤트 후보인데 lastmod 가 안 바뀐 URL — 손잡이를 빠뜨렸는지 확인 */
  eventUnchanged: string[];
  /** eventId 를 준 경우: 바뀌었지만 그 이벤트 후보가 아닌 등록부 URL */
  notInEvent: string[];
}

/**
 * diffSitemaps 결과(ok) → 운영자 요청 목록. ordered·removed 전체 = [indexnow] 제출 목록(삭제분은 요청 대상에서만 뺀다).
 * manualRequest 는 [indexnow] 밖 — 날짜 손잡이가 없어 diff 에 나올 수 없는 이벤트 후보(수동 요청, 내용이 바뀐 것만).
 */
export function requestPlan(
  diff: Extract<SitemapDiff, { ok: true }>,
  registry: SeasonRegistry,
  eventId?: EventId,
): RequestPlan {
  const byPath = new Map(registry.rows.map((r) => [r.url, r]));
  const touched = [...diff.added, ...diff.changed];
  const inReg = touched.filter((u) => byPath.has(toPath(u)));
  const outside = touched.filter((u) => !byPath.has(toPath(u)));
  const regOrdered = orderedRows(
    registry,
    inReg.map((u) => byPath.get(toPath(u)) as SeasonRow),
  ).map((r) => `${SITE_ORIGIN}${r.url}`);
  const ordered = [...regOrdered, ...outside];
  const naverDays: string[][] = [];
  for (let i = 0; i < ordered.length; i += NAVER_REQUEST_CAP) naverDays.push(ordered.slice(i, i + NAVER_REQUEST_CAP));

  let manualRequest: string[] = [];
  let eventUnchanged: string[] = [];
  let notInEvent: string[] = [];
  if (eventId) {
    const touchedPaths = new Set(touched.map(toPath));
    const untouched = announceList(registry, eventId).candidates.filter((p) => !touchedPaths.has(p));
    const handleless = (p: string) => isHandleless((byPath.get(p) as SeasonRow).lastmodHandle);
    manualRequest = untouched.filter(handleless).map((p) => `${SITE_ORIGIN}${p}`);
    eventUnchanged = untouched.filter((p) => !handleless(p)).map((p) => `${SITE_ORIGIN}${p}`);
    notInEvent = inReg.filter((u) => !(byPath.get(toPath(u)) as SeasonRow).events.includes(eventId));
  }
  return {
    ordered,
    naverDays,
    gscInspect: ordered.slice(0, GSC_INSPECT_CAP),
    removed: [...diff.removed],
    outsideRegistry: outside,
    manualRequest,
    eventUnchanged,
    notInEvent,
  };
}

/** CLI 인자 'E3' · 'e3' → EventId (아니면 null) */
export function toEventId(raw: string | undefined): EventId | null {
  if (!raw) return null;
  const up = raw.trim().toUpperCase();
  return includes(EVENT_IDS, up) ? up : null;
}
