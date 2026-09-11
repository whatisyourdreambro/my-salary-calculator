// scripts/season-key.mjs
// 시즌 키 날짜표 — src/lib/seasonKey.ts 의 순수 JS 사본 (health-check.mjs 는 plain Node ESM 이라
// TS 를 import 하지 못한다). S1-1 (2026-09-11).
// ★ 두 파일은 src/lib/__tests__/seasonKey.test.ts 의 일별 스윕(2026-09-01~2027-02-28)으로
//   일치가 강제된다. 경계를 바꾸면 반드시 양쪽을 함께 바꿀 것.
// ★ 오버라이드(SEASON_KEY_OVERRIDE)는 여기 중복 보관하지 않는다 — readSeasonKeyOverride() 가
//   src/lib/seasonKey.ts 의 해당 줄을 정규식으로 읽는다. 그래서 1/2 JAN 전환은 TS 한 줄이면 끝이고
//   헬스체크 기대값도 자동으로 따라온다.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
/** KST 자정을 UTC ms 로 (월은 1~12) */
const kstMidnight = (y, m, d) => Date.UTC(y, m - 1, d) - KST_OFFSET_MS;

export const SEASON_KEYS = ["SEP", "OCT", "DEC", "JAN"];

/** 자동 전환 경계(KST 자정, 오름차순) — src/lib/seasonKey.ts SEASON_BOUNDARIES 와 동일해야 함 */
export const SEASON_BOUNDARIES = [
  { key: "OCT", fromKst: [2026, 9, 26] },
  { key: "DEC", fromKst: [2026, 12, 1] },
];

/** JAN 수동 전환 창 시작(KST) — src/lib/seasonKey.ts JAN_MANUAL_FROM_KST 와 동일해야 함 */
export const JAN_MANUAL_FROM_KST = [2027, 1, 2];

/**
 * 날짜만으로 고르는 키 — JAN 은 절대 반환하지 않음
 * @param {Date} now
 * @returns {"SEP"|"OCT"|"DEC"}
 */
export function pickSeasonKey(now) {
  const t = now.getTime();
  /** @type {"SEP"|"OCT"|"DEC"} */
  let key = "SEP";
  for (const b of SEASON_BOUNDARIES) {
    if (t >= kstMidnight(...b.fromKst)) key = /** @type {"OCT"|"DEC"} */ (b.key);
  }
  return key;
}

/**
 * 오버라이드 ?? 자동 키
 * @param {Date} now
 * @param {"SEP"|"OCT"|"DEC"|"JAN"|null} [override]
 * @returns {"SEP"|"OCT"|"DEC"|"JAN"}
 */
export function resolveSeasonKey(now, override = null) {
  return override ?? pickSeasonKey(now);
}

/**
 * 1/2(KST) 이후인가 — JAN 수동 전환 대기 알림용
 * @param {Date} now
 * @returns {boolean}
 */
export function isJanManualWindow(now) {
  return now.getTime() >= kstMidnight(...JAN_MANUAL_FROM_KST);
}

const OVERRIDE_RE =
  /export\s+const\s+SEASON_KEY_OVERRIDE\s*(?::\s*SeasonKey\s*\|\s*null)?\s*=\s*(null|"(SEP|OCT|DEC|JAN)")/;

/**
 * src/lib/seasonKey.ts 의 SEASON_KEY_OVERRIDE 값을 읽는다.
 * @param {string} rootDir 저장소 루트
 * @returns {{ override: string|null, source: "file"|"missing"|"unparsed" }}
 *   source: file=정상 파싱, missing=파일 없음(체크아웃 밖 실행), unparsed=줄 형식 변경(→ null 로 간주)
 */
export function readSeasonKeyOverride(rootDir = process.cwd()) {
  let src;
  try {
    src = readFileSync(join(rootDir, "src/lib/seasonKey.ts"), "utf8");
  } catch {
    return { override: null, source: "missing" };
  }
  const m = src.match(OVERRIDE_RE);
  if (!m) return { override: null, source: "unparsed" };
  return { override: m[2] ?? null, source: "file" };
}
