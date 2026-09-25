// src/lib/payTablesFull2027.ts
//
// 2027 봉급표 확정 풀표 '빈칸' — 12월 말 인사혁신처가 2027 봉급표를 공표하면 여기에 숫자만 넣는다
// (수익 추천 #2 '2027 빈칸' + #3 '12월 말 숫자만 교체', 2026-09-25 준비. 11/1~1/31 동결기에는 새 구조를
//  만들 수 없어서 10월 안에 자리를 미리 둔다).
//
// 지금 값: PAY_FULL_2027 = null → /teacher-pay-2027·/police-pay-2027·/firefighter-pay-2027 은 예산안 예상 체제
//   그대로이고, 페이지 맨 끝 풀표 섹션·Dataset JSON-LD 는 아무것도 그리지 않는다(렌더 결과가 지금과 같다).
//   /civil-servant-pay-2027 도 맨 끝 일반직 풀표 섹션·Dataset 만 같은 방식으로 기다린다.
// 값을 넣으면 (구조 변경 없음 — 데이터만):
//   - 교사·경찰·소방 2027: title·description·배지·H1 강조어·리드·출처 박스·비교표(2026 확정 → 2027 확정)·
//     일정·FAQ·공유 문구가 확정 문구로 바뀌고, Dataset JSON-LD 와 전 호봉 풀표(마지막 광고·공유 버튼 아래)가 나온다.
//   - 일반직 2027(/civil-servant-pay-2027): 맨 끝 일반직 풀표와 Dataset 만 나온다. 위쪽 예상 문구는 그 페이지
//     갱신 체크포인트대로 제자리 문구 교체(동결기에도 허용되는 '숫자·문구 교체')로 정리한다.
//   - 2026 풀표 4쪽의 '2027 … 예상' 링크 문구가 '2027 …'로 바뀐다.
//   광고 컴포넌트의 위치·개수·순서는 두 상태에서 같다(pay2027ConfirmedSlot.test.ts 가 가짜 확정 데이터로 고정).
//
// ★ 12월 말 입력 절차 (숫자만):
//   1) 인사혁신처 2027 봉급표 페이지(mpm.go.kr/mpm/info/resultPay/bizSalary/2027/)의 표를 2026 과 같은 방식
//      (원문 HTML 표 파싱 — 수기 전사 금지)으로 teacher·policeFire·general 에 넣는다. 모양·열 순서는
//      payTablesFull2026.ts 와 같다(교원 [호봉, 금액] 40행, 경찰·소방 [호봉, 순경…치안정감], 일반직 [호봉, 9급…1급]).
//   2) commonRate(인사혁신처 보도자료의 2027 공무원 보수 인상률), basis(확정 근거 한 줄, 40자 이내 —
//      예: '2026년 12월 30일 국무회의 의결, 2027년 1월 1일 적용'), sourceUrl(인사혁신처 2027 봉급표 원문),
//      checked(원문 대조일 = 배포일)를 채운다. 추정·보도 수치는 넣지 않는다 — 원문으로 확인한 값만.
//   3) npx vitest run src/lib/__tests__/payTablesFull2027.test.ts src/lib/__tests__/pay2027ConfirmedSlot.test.ts
//      — validatePayFull2027 가 모양(호봉·계급·빈 칸)이 2026 표와 같은지, 금액이 100원 단위이고 2026 보다
//      작지 않은지, 호봉이 오를수록 금액이 오르는지 본다. 앵커 몇 칸(9급 1호봉·순경 1호봉·교원 9호봉)은
//      공표 원문과 손으로 한 번 더 대조한다.
//   4) sitemap lastModified·2027 페이지 수정일은 checked 로 자동 갱신된다(PAY_2027_PAGES_MODIFIED).

import { PAY_TABLES_RELEASE_DATE } from "@/config/siteDates";
import {
  GENERAL_PAY_FULL_2026,
  POLICE_FIRE_PAY_FULL_2026,
  TEACHER_PAY_FULL_2026,
} from "@/lib/payTablesFull2026";

export type PayFull2027 = {
  /** 2027 공무원 보수 공통 인상률(확정, 인사혁신처 보도자료) — 예: 0.039 */
  commonRate: number;
  /** 확정 근거 한 줄(40자 이내) — 리드 아래 출처 박스·일정·FAQ 에 그대로 들어간다 */
  basis: string;
  /** 인사혁신처 2027 봉급표 원문 URL */
  sourceUrl: string;
  /** 원문 대조일(YYYY-MM-DD) — 2027 페이지 수정일·sitemap lastModified·Dataset dateModified */
  checked: string;
  /** 교육공무원 1~40호봉 — [호봉, 월 봉급액(원)]. 별표 11, TEACHER_PAY_FULL_2026 과 같은 모양 */
  teacher: ReadonlyArray<readonly [number, number]>;
  /** 경찰·소방 — [호봉, 순경…치안정감], 없는 호봉 null. 별표 10, POLICE_FIRE_PAY_FULL_2026 과 같은 모양 */
  policeFire: ReadonlyArray<ReadonlyArray<number | null>>;
  /** 일반직 — [호봉, 9급…1급], 없는 호봉 null. 별표 3, GENERAL_PAY_FULL_2026 과 같은 모양 */
  general: ReadonlyArray<ReadonlyArray<number | null>>;
};

/**
 * 2027 확정 봉급표 — 12월 말 공표 전까지 null (위 입력 절차 참고).
 * `as` 로 선언 타입을 유지한다(리터럴 null 로 좁혀지면 이 파일 안의 확정 분기가 never 가 된다).
 */
export const PAY_FULL_2027 = null as PayFull2027 | null;

/** 2027 확정표가 들어왔는지 — 2026 페이지의 '2027 … 예상' 링크 문구 전환용 */
export const PAY_2027_CONFIRMED = PAY_FULL_2027 !== null;

/**
 * 교사·경찰·소방 2027 페이지 수정일(메타·Article·Dataset·sitemap) — 확정 전에는 봉급표 묶음 배포일,
 * 확정표 입력 뒤에는 원문 대조일.
 */
export const PAY_2027_PAGES_MODIFIED = PAY_FULL_2027?.checked ?? PAY_TABLES_RELEASE_DATE;

/** 인상률 표기(소수 첫째 자리) — 예: 3.9 */
export function ratePct(rate: number): string {
  return (rate * 100).toFixed(1);
}

/** 2026 → 2027 인상률(%) 소수 첫째 자리 문자열 */
export function raisePct(before: number, after: number): string {
  return ((after / before - 1) * 100).toFixed(1);
}

type Grid = ReadonlyArray<ReadonlyArray<number | null>>;

const teacherGrid = (rows: ReadonlyArray<readonly [number, number]>): Grid => rows.map(([h, v]) => [h, v]);

/**
 * 같은 모양의 두 표에서 칸별 인상률의 최소·최대(%) — FAQ·본문 요약용.
 * text = 'a~b%' (모든 칸이 같으면 'a%')
 */
export function raiseRange(before: Grid, after: Grid): { min: string; max: string; text: string } {
  const rates: number[] = [];
  before.forEach((row, r) => {
    row.slice(1).forEach((prev, c) => {
      const next = after[r]?.[c + 1];
      if (typeof prev === "number" && typeof next === "number") rates.push(next / prev - 1);
    });
  });
  if (rates.length === 0) throw new Error("[payTablesFull2027] 인상률을 계산할 칸이 없습니다");
  const pctOf = (x: number) => (x * 100).toFixed(1);
  const min = pctOf(Math.min(...rates));
  const max = pctOf(Math.max(...rates));
  return { min, max, text: min === max ? `${min}%` : `${min}~${max}%` };
}

/** 교원 2026 → 2027 인상률 범위 */
export function teacherRaiseRange(data: PayFull2027) {
  return raiseRange(teacherGrid(TEACHER_PAY_FULL_2026), teacherGrid(data.teacher));
}

/** 경찰·소방 2026 → 2027 인상률 범위 */
export function policeFireRaiseRange(data: PayFull2027) {
  return raiseRange(POLICE_FIRE_PAY_FULL_2026, data.policeFire);
}

/** 일반직 2026 → 2027 인상률 범위 */
export function generalRaiseRange(data: PayFull2027) {
  return raiseRange(GENERAL_PAY_FULL_2026, data.general);
}

function checkGrid(name: string, base: Grid, next: Grid, problems: string[]) {
  if (next.length !== base.length) {
    problems.push(`${name}: 행 수 ${next.length} ≠ 2026 표 ${base.length}`);
    return;
  }
  next.forEach((row, r) => {
    const baseRow = base[r];
    if (row.length !== baseRow.length) problems.push(`${name} ${r + 1}행: 열 수 ${row.length} ≠ ${baseRow.length}`);
    if (row[0] !== baseRow[0]) problems.push(`${name} ${r + 1}행: 호봉 ${row[0]} ≠ 2026 표 ${baseRow[0]}`);
    row.slice(1).forEach((value, c) => {
      const prev = baseRow[c + 1];
      const where = `${name} ${row[0]}호봉 ${c + 1}열`;
      if ((prev === null) !== (value === null)) {
        problems.push(`${where}: 빈 칸 위치가 2026 표와 다름`);
        return;
      }
      if (typeof value !== "number" || typeof prev !== "number") return;
      if (!Number.isInteger(value) || value % 100 !== 0) problems.push(`${where}: ${value} 은 100원 단위 정수가 아님`);
      if (value < prev) problems.push(`${where}: ${value} < 2026 ${prev}`);
      const above = r > 0 ? next[r - 1][c + 1] : null;
      if (typeof above === "number" && value <= above) problems.push(`${where}: 앞 호봉 ${above} 보다 크지 않음`);
    });
  });
}

/**
 * 입력한 2027 확정표 점검 — 문제 목록(빈 배열이면 통과). 12월 입력 시 테스트가 부른다.
 * 모양은 2026 원문 표와 같아야 한다(호봉 수·계급 열·빈 칸 위치), 금액은 100원 단위·2026 이상·호봉 오름차순.
 */
export function validatePayFull2027(data: PayFull2027): string[] {
  const problems: string[] = [];
  if (!(data.commonRate > 0 && data.commonRate < 0.2)) problems.push(`commonRate ${data.commonRate} 가 0~20% 밖`);
  if (data.basis.trim().length === 0 || [...data.basis].length > 40) problems.push("basis 는 1~40자");
  if (!/^https:\/\/www\.(mpm|law)\.go\.kr\//.test(data.sourceUrl)) problems.push("sourceUrl 은 인사혁신처·법제처 원문");
  const checkedAt = Date.parse(data.checked);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.checked) ||
    !Number.isFinite(checkedAt) ||
    new Date(checkedAt).toISOString().slice(0, 10) !== data.checked
  ) {
    problems.push(`checked ${data.checked} 는 YYYY-MM-DD 날짜여야 함`);
  }
  checkGrid("교원", teacherGrid(TEACHER_PAY_FULL_2026), teacherGrid(data.teacher), problems);
  checkGrid("경찰·소방", POLICE_FIRE_PAY_FULL_2026, data.policeFire, problems);
  checkGrid("일반직", GENERAL_PAY_FULL_2026, data.general, problems);
  return problems;
}
