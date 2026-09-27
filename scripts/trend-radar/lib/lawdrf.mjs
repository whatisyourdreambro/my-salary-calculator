// scripts/trend-radar/lib/lawdrf.mjs
// 법령 공포 감시(선택) — 국가법령정보 공동활용 DRF 목록 API 1회 조회.
//   · env LAW_OC(open.law.go.kr 무료 등록 ID)가 있을 때만 실행. 없으면 '키 없음 — 건너뜀'.
//   · 최근 7일 공포분(ancYd=오늘-7~오늘) 중 대상 법령(시행령·시행규칙 포함)이고 소관부처가
//     재정경제부·고용노동부·보건복지부·인사혁신처·금융위원회인 것만.
//   · 링크는 https://www.law.go.kr/법령/<법령명> 으로 새로 만든다(응답의 상세 링크 필드는 읽지 않음 —
//     그 필드에는 요청자 OC 가 그대로 들어 있다).
//   · 각 항목은 statuteMentions 가 돌려준 라우트에 대해 update-existing(법령 변경 감시).
//   · OC 값은 로그·출력·파일 어디에도 남기지 않는다(http.mjs 의 redactUrl).

import { parseLawDrf, lawDrfError } from "./parse.mjs";
import { redactUrl } from "./http.mjs";
import { normalizeDots, statuteMentions } from "./site-map.mjs";

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

export const LAW_DRF_ENDPOINT = "https://www.law.go.kr/DRF/lawSearch.do";
export const NO_KEY_NOTE = "키 없음 — 건너뜀";

export const TARGET_STATUTES = [
  "소득세법",
  "조세특례제한법",
  "고용보험법",
  "근로기준법",
  "최저임금법",
  "국민연금법",
  "국민건강보험법",
  "공무원보수규정",
  "남녀고용평등과 일·가정 양립 지원에 관한 법률",
  "근로자퇴직급여 보장법",
];
export const TARGET_MINISTRIES = ["재정경제부", "고용노동부", "보건복지부", "인사혁신처", "금융위원회"];

const norm = (s) => normalizeDots(s).replace(/\s+/g, " ").trim();
const TARGETS = new Set(TARGET_STATUTES.map(norm));

/** 법령명 → 모법 이름(시행령·시행규칙 떼기) */
export function baseStatute(name) {
  return norm(name).replace(/\s*(시행령|시행규칙)$/, "");
}

export function isTargetStatute(name) {
  return TARGETS.has(baseStatute(name));
}

export function lawLink(name) {
  // 법령명 표기(ㆍ 등)는 법제처 원문 그대로 둔다 — 공백만 정리.
  return new URL(`https://www.law.go.kr/법령/${String(name).replace(/\s+/g, " ").trim()}`).href;
}

const compact = (ymd) => ymd.replace(/-/g, "");

export function minusDays(ymd, n) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export function buildLawDrfUrl(oc, todayYmd) {
  const q = new URLSearchParams({
    OC: oc,
    target: "law",
    type: "XML",
    display: "100",
    sort: "ddes",
    ancYd: `${compact(minusDays(todayYmd, 7))}~${compact(todayYmd)}`,
  });
  return `${LAW_DRF_ENDPOINT}?${q.toString().replace(/%7E/gi, "~")}`;
}

/**
 * @param {Object} ctx
 * @param {{get: Function}} ctx.http
 * @param {Record<string, string|undefined>} ctx.env
 * @param {string} ctx.today YYYY-MM-DD
 * @param {{routeTexts: Function}} ctx.siteIndex
 */
export async function runLawDrf({ http, env, today, siteIndex }) {
  const oc = env && typeof env.LAW_OC === "string" ? env.LAW_OC.trim() : "";
  if (!oc) return { status: "skipped", note: NO_KEY_NOTE, items: [], ms: 0, rows: 0 };
  const url = buildLawDrfUrl(oc, today);
  const t0 = Date.now();
  let res;
  try {
    res = await http.get(url, { maxBytes: 1024 * 1024, accept: "application/xml, text/xml;q=0.9" });
  } catch (err) {
    return { status: "error", note: `${err && err.name ? err.name : "Error"}: ${redactUrl(err && err.message ? err.message : "")}`, items: [], ms: Date.now() - t0, rows: 0 };
  }
  if (res.status !== 200) return { status: "error", note: `HTTP ${res.status}`, items: [], ms: res.ms, rows: 0 };
  const apiErr = lawDrfError(res.text);
  if (apiErr) return { status: "error", note: `DRF 응답 오류: ${apiErr}`, items: [], ms: res.ms, rows: 0 };
  const rows = parseLawDrf(res.text);
  const items = [];
  for (const r of rows) {
    if (!isTargetStatute(r.name)) continue;
    if (!TARGET_MINISTRIES.includes(r.ministry)) continue;
    const routes = siteIndex
      ? [...new Set([...statuteMentions(r.name, siteIndex), ...(r.shortName ? statuteMentions(r.shortName, siteIndex) : [])])].sort()
      : [];
    put(items, {
      name: r.name,
      shortName: r.shortName || "",
      base: baseStatute(r.name),
      kind: "공포",
      changeType: r.changeType,
      ministry: r.ministry,
      promulgatedAt: r.promulgatedAt,
      effectiveAt: r.effectiveAt,
      serial: r.serial,
      link: lawLink(r.name),
      routes,
      recommendation: routes.length ? "update-existing" : "watch",
      reason: routes.length
        ? `${r.name} ${r.changeType || "개정"} 공포(${r.promulgatedAt}) — 이 법령을 언급하는 ${routes.length}개 페이지 점검`
        : `${r.name} 공포(${r.promulgatedAt}) — 언급 페이지 없음, 관찰`,
    });
  }
  return { status: "ok", note: `목록 ${rows.length}건 중 대상 ${items.length}건`, items, ms: res.ms, rows: rows.length };
}
