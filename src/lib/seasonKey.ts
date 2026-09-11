// src/lib/seasonKey.ts
//
// 시즌 세트 키 — 순수 날짜 함수 (의존성 0). S1-1 (2026-09-11, docs/next-upgrade-plan-2026-09-11.md §2).
//
// 배경: 시즌 링크 세트(헤더 드롭다운·푸터·표 페이지 SeasonalLinks·검색 칩)는 3파일에서
// `= SEASON_TOP_SEP` 같은 한 줄을 사람이 바꿔 왔고, 2026-08-17 감사에서 7월 세트가 수주간
// 만료 방치된 채 최상위 트래픽에 노출됐다. 이제 키는 빌드 시점에 여기서 자동으로 고른다.
//
// 흐름: scripts/gen-season-key.ts(prebuild) → src/config/seasonKey.generated.ts 의 SEASON_KEY
//       → 3소비자(seasonLinks.ts·SeasonalLinks.tsx·HeaderSearch.tsx)가 그 상수로 세트를 고른다.
//       클라이언트 컴포넌트가 서버와 같은 세트를 렌더해야 하므로 `new Date()` 를 모듈 스코프에서
//       평가하지 않고 빌드 상수만 쓴다(경계일 이후 첫 배포에 반영 — 배포는 거의 매일).
// 알람: verify:site 의 `gen-season-key --check` 가 커밋된 값 ≠ 오늘 키면 WARNING(비차단),
//       주간 health-check 가 프로덕션 /table/2026/annual 의 data-season-key 를 오늘 키와 대조.
//
// ★ 경계(KST 자정 기준):  ~9/25 SEP(추석) | 9/26~11/30 OCT(연말정산 예열) | 12/1~ DEC(마감)
// ★ JAN 은 자동 선택하지 않는다 — 1/2 전 사람 확인 2건(공무원 2027 봉급표 확정 여부·간소화
//   오픈일) 후 SEASON_KEY_OVERRIDE = "JAN" 으로 수동 전환. 긴급 되돌림도 같은 상수로.
// ★ scripts/season-key.mjs 에 같은 날짜표가 중복돼 있다(헬스체크는 TS 를 import 못함) —
//   seasonKey.test.ts 의 일별 스윕이 두 파일의 일치를 강제하므로 여기 바꾸면 거기도 바꿀 것.

export type SeasonKey = "SEP" | "OCT" | "DEC" | "JAN";
/** 자동 선택 대상 키 — JAN 은 제외(수동 전환 전용) */
export type AutoSeasonKey = Exclude<SeasonKey, "JAN">;

/**
 * 수동 오버라이드 — null 이면 날짜로 자동 선택.
 * 1/2 JAN 전환·긴급 되돌림 시 이 한 줄만 바꾸고 `tsx scripts/gen-season-key.ts` 실행 후 커밋.
 * (scripts/season-key.mjs 의 readSeasonKeyOverride 가 이 줄을 정규식으로 읽어 헬스체크 기대값에도
 *  반영하므로 `export const SEASON_KEY_OVERRIDE = <null|"KEY"> as SeasonKey | null;` 꼴을 유지할 것.)
 */
export const SEASON_KEY_OVERRIDE = null as SeasonKey | null;

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** KST 자정을 UTC ms 로 (월은 1~12) */
function kstMidnight(y: number, m: number, d: number): number {
  return Date.UTC(y, m - 1, d) - KST_OFFSET_MS;
}

export type KstDate = readonly [year: number, month: number, day: number];

/** 자동 전환 경계 — 오름차순. 해당 KST 자정 이상이면 그 키. 첫 경계 이전은 SEP. */
export const SEASON_BOUNDARIES: ReadonlyArray<{ key: AutoSeasonKey; fromKst: KstDate }> = [
  { key: "OCT", fromKst: [2026, 9, 26] }, // 추석(9/25) 종료 익일 — 연말정산 예열 세트
  { key: "DEC", fromKst: [2026, 12, 1] }, // 연말정산 마감 세트
];

/** JAN 수동 전환 창 시작(KST) — 이 날 이후 오버라이드가 비어 있으면 게이트가 알린다 */
export const JAN_MANUAL_FROM_KST: KstDate = [2027, 1, 2];

/** 키별 만료(KST 자정) — 만료 뒤엔 어떤 게이트도 울리지 않던 공백을 메운다(2026-09-12 리뷰). JAN 은 연말정산 신고 마감(3/10) 익일. 세트가 늘면 함께 추가. scripts/season-key.mjs 사본과 동일해야 함. */
export const SEASON_EXPIRES_KST: Partial<Record<SeasonKey, KstDate>> = { JAN: [2027, 3, 11] };

/** 해당 키의 세트가 만료됐는가 (만료표에 없는 키는 false) */
export function isSeasonKeyExpired(key: SeasonKey, now: Date): boolean {
  const exp = SEASON_EXPIRES_KST[key];
  return exp ? now.getTime() >= kstMidnight(...exp) : false;
}

/** 날짜만으로 고르는 키 (JAN 은 절대 반환하지 않음) */
export function pickSeasonKey(now: Date): AutoSeasonKey {
  const t = now.getTime();
  let key: AutoSeasonKey = "SEP";
  for (const b of SEASON_BOUNDARIES) {
    if (t >= kstMidnight(...b.fromKst)) key = b.key;
  }
  return key;
}

/** 오버라이드 ?? 자동 키 — 코드젠·게이트가 쓰는 최종 키 */
export function resolveSeasonKey(
  now: Date,
  override: SeasonKey | null = SEASON_KEY_OVERRIDE,
): SeasonKey {
  return override ?? pickSeasonKey(now);
}

/** 1/2(KST) 이후인가 — JAN 수동 전환 대기 알림용 */
export function isJanManualWindow(now: Date): boolean {
  return now.getTime() >= kstMidnight(...JAN_MANUAL_FROM_KST);
}

/** 다음 자동 경계까지 남은 일수(올림) — 남은 경계가 없으면 null. verify:site 임박 알림용 */
export function daysToNextBoundary(
  now: Date,
): { key: AutoSeasonKey; days: number; fromKst: KstDate } | null {
  const t = now.getTime();
  for (const b of SEASON_BOUNDARIES) {
    const at = kstMidnight(...b.fromKst);
    if (at > t) return { key: b.key, days: Math.ceil((at - t) / DAY_MS), fromKst: b.fromKst };
  }
  return null;
}
