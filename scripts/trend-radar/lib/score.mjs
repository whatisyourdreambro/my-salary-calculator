// scripts/trend-radar/lib/score.mjs
// 점수(0..100)와 추천(recommendation).
// 점수 = 자료 종류(고시·공포 40 / 보도자료 32 / 설명자료 24 / 입법·행정예고 20 / 통계·공고 16)
//      + 최신성(24시간 20 / 72시간 12 / 7일 6)
//      + 20 × demandWeight(클러스터 수요 등급)
//      + 공식 일정 창(±7일) 일치 10
//      + 구글 트렌드 부스트 10(트렌드 제목이 같은 클러스터 정규식에 맞을 때)
//      + 네이버 데이터랩 부스트 10(선택 — 그 군집 검색량 급상승, 구글 트렌드 부스트와 합쳐 최대 10)
// 추천 우선순위(위에서 먼저 걸리는 것):
//   1 ignore          클러스터 없음 또는 denylist
//   2 watch           발표 후 31일 초과(목록에 남은 오래된 글)
//   3 update-existing 클러스터의 정본 데이터 발표(canonicalReleases) — 새 글이 아니라 허브 갱신
//   4 watch           자료 종류 '통계'
//   5 update-existing briefEligible=false(세법 개정·장려금·육아휴직)이고 허브가 있음
//   6 watch           briefEligible=false 인데 연결 페이지 없음
//   7 watch           점수 55 미만 또는 발표 후 7일 초과(새 글 트리거는 7일 이내 원문만)
//   8 update-existing 기존 가이드·페이지 제목 유사도 0.5 이상이고 그 제목에 같은 연도
//   9 watch           원문 상세 페이지가 robots 차단(스냅샷 불가)
//  10 new-brief       그 밖의 경우
// 3·5 가 7 보다 먼저인 이유: 허브 갱신은 새 URL 을 만들지 않는 유지보수 권고라 7일 신선도·55점
// 문턱(새 글 트리거 기준)을 적용하지 않는다. 대신 31일 창(2) 안에서만 권고한다.

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

export const NEW_BRIEF_MIN_SCORE = 55;
export const NEW_BRIEF_MAX_AGE_DAYS = 7;
export const UPDATE_MAX_AGE_DAYS = 31;
export const OVERLAP_UPDATE_MIN = 0.5;
export const CALENDAR_SLACK_DAYS = 7;

const DAY_MS = 86400000;

export function ageHours(publishedAt, nowMs) {
  if (!publishedAt) return null;
  const t = Date.parse(publishedAt);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, (nowMs - t) / 3600000);
}

export function recencyPoints(hours) {
  if (hours === null || hours === undefined) return 0;
  if (hours <= 24) return 20;
  if (hours <= 72) return 12;
  if (hours <= 24 * 7) return 6;
  return 0;
}

/** KST 날짜 문자열 'YYYY-MM-DD' */
export function kstDate(msOrIso) {
  const ms = typeof msOrIso === "number" ? msOrIso : Date.parse(msOrIso);
  const d = new Date(ms + 9 * 3600000);
  return d.toISOString().slice(0, 10);
}

const dayNum = (ymd) => Math.floor(Date.parse(`${ymd}T00:00:00Z`) / DAY_MS);

/**
 * 일정 정의 → 기준일 주변(전년·당년·익년) 실제 발생 창 [{start, end}] (YYYY-MM-DD)
 * recurrence: yearly(start/end 'MM-DD') · once(start/end 'YYYY-MM-DD') · dates(dates[])
 */
export function occurrences(ev, refYmd) {
  const y = Number(refYmd.slice(0, 4));
  if (ev.recurrence === "yearly") {
    return [y - 1, y, y + 1].map((yy) => {
      const endYear = ev.end < ev.start ? yy + 1 : yy;
      return { start: `${yy}-${ev.start}`, end: `${endYear}-${ev.end}` };
    });
  }
  if (ev.recurrence === "dates") return (ev.dates || []).map((d) => ({ start: d, end: d }));
  return [{ start: ev.start, end: ev.end || ev.start }];
}

/** 후보 날짜가 클러스터 일정 창 ±7일 안이면 그 일정 */
export function calendarMatch(clusterId, dateYmd, events) {
  const d = dayNum(dateYmd);
  for (const ev of events) {
    if (ev.cluster !== clusterId) continue;
    for (const o of occurrences(ev, dateYmd)) {
      if (d >= dayNum(o.start) - CALENDAR_SLACK_DAYS && d <= dayNum(o.end) + CALENDAR_SLACK_DAYS) return ev;
    }
  }
  return null;
}

/** 오늘부터 N일 안에 걸치는 공식 일정 */
export function upcomingEvents(todayYmd, events, days = 14) {
  const from = dayNum(todayYmd);
  const to = from + days;
  const out = [];
  for (const ev of events) {
    for (const o of occurrences(ev, todayYmd)) {
      if (dayNum(o.end) >= from && dayNum(o.start) <= to) {
        put(out, { id: ev.id, cluster: ev.cluster, name: ev.name, start: o.start, end: o.end, basis: ev.basis, sourceUrl: ev.sourceUrl });
      }
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

/** 다음 공식 일정 1건(14일 밖이라도) — 보고서 안내용 */
export function nextEvent(todayYmd, events) {
  const from = dayNum(todayYmd);
  let best = null;
  for (const ev of events) {
    for (const o of occurrences(ev, todayYmd)) {
      if (dayNum(o.end) < from) continue;
      if (!best || o.start < best.start) best = { id: ev.id, cluster: ev.cluster, name: ev.name, start: o.start, end: o.end };
    }
  }
  return best;
}

/**
 * @param {{kind: string, ageH: number|null, demandWeight: number, calendarHit: boolean, trendsHit: boolean, datalabHit?: boolean}} x
 * @param {Record<string, number>} kindPoints
 */
export function scoreCandidate(x, kindPoints) {
  const parts = {
    officialKind: kindPoints[x.kind] ?? 0,
    recency: recencyPoints(x.ageH),
    demand: Math.round(20 * (x.demandWeight || 0) * 10) / 10,
    calendar: x.calendarHit ? 10 : 0,
    trends: x.trendsHit ? 10 : 0,
    // 데이터랩 부스트는 구글 트렌드 부스트와 겹치지 않는다(검색 수요 신호는 합쳐 최대 10)
    datalab: x.datalabHit && !x.trendsHit ? 10 : 0,
  };
  const score = Math.min(100, Math.round((parts.officialKind + parts.recency + parts.demand + parts.calendar + parts.trends + parts.datalab) * 10) / 10);
  return { score, parts };
}

/** 제목의 연도(2027년·’26년·'26.) → 없으면 발표일 연도 */
export function eventYear(title, publishedAt) {
  const t = String(title || "");
  const full = /(20\d{2})\s*년?/.exec(t);
  if (full) return Number(full[1]);
  const short = /[’‘'`](\d{2})\s*[년.]/.exec(t);
  if (short) return 2000 + Number(short[1]);
  return publishedAt ? Number(String(publishedAt).slice(0, 4)) : null;
}

function titleHasYear(title, year) {
  if (!year) return false;
  const t = String(title || "");
  return t.includes(String(year)) || new RegExp(`[’‘'\`]${String(year).slice(2)}\\s*[년.]`).test(t);
}

/**
 * 추천 결정.
 * @param {Object} c
 * @param {string|null} c.cluster
 * @param {string|null} c.denied
 * @param {string} c.kind
 * @param {number} c.score
 * @param {number|null} c.ageH
 * @param {boolean} c.briefEligible
 * @param {string|null} c.canonical
 * @param {string[]} c.hubRoutes
 * @param {{title: string, score: number, where: string}|null} c.bestOverlap
 * @param {string} c.title
 * @param {string|null} c.publishedAt
 * @param {'allowed'|'disallowed'|'unknown'} [c.linkRobots]
 * @returns {{recommendation: 'ignore'|'watch'|'update-existing'|'new-brief', reason: string}}
 */
export function recommend(c) {
  const days = c.ageH === null || c.ageH === undefined ? null : c.ageH / 24;
  const hub = c.hubRoutes && c.hubRoutes.length ? c.hubRoutes[0] : null;
  if (c.denied) return { recommendation: "ignore", reason: `제외 주제(denylist: ${c.denied})` };
  if (!c.cluster) return { recommendation: "ignore", reason: "금융 12개 클러스터에 해당 없음" };
  if (days !== null && days > UPDATE_MAX_AGE_DAYS) return { recommendation: "watch", reason: `발표 후 ${Math.floor(days)}일 경과(31일 초과) — 관찰만` };
  if (c.canonical && hub)
    return { recommendation: "update-existing", reason: `정본 데이터 발표('${c.canonical}') — 새 글 대신 허브 ${hub} 갱신` };
  if (c.kind === "통계") return { recommendation: "watch", reason: "통계·현황 자료는 새 글 트리거가 아님 — 관찰" };
  if (!c.briefEligible) {
    if (hub) return { recommendation: "update-existing", reason: `새 글 대상 아닌 클러스터(briefEligible=false) — 허브 ${hub} 갱신 검토` };
    return { recommendation: "watch", reason: "새 글 대상 아닌 클러스터이고 연결 페이지 없음 — 관찰" };
  }
  if (c.score < NEW_BRIEF_MIN_SCORE) return { recommendation: "watch", reason: `점수 ${c.score} < ${NEW_BRIEF_MIN_SCORE} — 관찰` };
  if (days === null || days > NEW_BRIEF_MAX_AGE_DAYS)
    return { recommendation: "watch", reason: days === null ? "발표일 미상 — 관찰" : `발표 후 ${Math.floor(days)}일(새 글은 7일 이내 원문만) — 관찰` };
  const year = eventYear(c.title, c.publishedAt);
  if (c.bestOverlap && c.bestOverlap.score >= OVERLAP_UPDATE_MIN && titleHasYear(c.bestOverlap.title, year))
    return {
      recommendation: "update-existing",
      reason: `기존 ${c.bestOverlap.where} '${c.bestOverlap.title}' 와 제목 유사도 ${c.bestOverlap.score}·같은 연도(${year}) — 그 페이지 갱신`,
    };
  if (c.linkRobots === "disallowed")
    return { recommendation: "watch", reason: "원문 상세 페이지가 robots 차단(스냅샷 불가) — 다른 공식 원문 확보 전까지 관찰" };
  return { recommendation: "new-brief", reason: `공식 ${c.kind}·점수 ${c.score}·7일 이내 — 새 해설 글 후보(발행 게이트 별도)` };
}
