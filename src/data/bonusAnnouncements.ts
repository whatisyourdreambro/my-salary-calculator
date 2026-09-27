// src/data/bonusAnnouncements.ts
//
// 성과급 지급률 확정 공지 키트 — 계산기 설명문(meta description) 꼬리 구절 (2026-09-27 R8, 운영자 9/27 승인 6).
// 대상 3곳: /calc/samsung-bonus(OPI, 시즌 등록부 E10) · /calc/sk-hynix-bonus(PS, E11) · /calc/hyundai-bonus(E11).
//
// ★ 지금은 휴면이다. 세 항목 모두 confirmed:false 라 세 페이지의 description 이 종전과 바이트 동일하다
//   (src/lib/__tests__/bonusAnnouncements.test.ts 가 종전 문자열 고정값과 대조).
//
// 켜는 법 (회사 공지가 나온 날 — 절차 전체는 docs/bonus-announcement-kit.md)
//   해당 회사 항목 하나에 네 칸을 한 번에 채운다. 하나라도 비면 꼬리 구절은 붙지 않는다.
//     confirmed: true
//     rateLabel: 무엇의 지급률이 확정됐는지 — '2026년 OPI' 처럼 짧은 이름만(숫자·% 금지 — 수치는 계산기 데이터
//                파일 opiData·psData 등의 갱신 몫이고, 설명문에는 추정 수치를 넣지 않는다)
//     date:      회사 공지일 YYYY-MM-DD (KST). 2027-01-01 ~ 2027-02-28 안이어야 한다(승인 6 = 1~2월 발표)
//     source:    회사 공지 URL 또는 회사를 인용한 보도 URL (https)
//   → 그 페이지 description 끝에 ' {rateLabel} 지급률 확정(M/D, 회사 공지).' 가 한 번 붙는다.
//
// 날짜 조건 (빌드 시각 KST 기준 — 계산기 페이지는 정적이라 배포 빌드 때 한 번 정해진다)
//   - 빌드 날짜가 공지일 이전이면 붙지 않는다(미래 날짜로 미리 채워 두어도 새지 않음).
//   - 빌드 날짜가 BONUS_ANNOUNCEMENT_SHOW_UNTIL(2027-03-31) 을 넘으면 붙지 않는다 — 그 뒤 첫 배포에서 저절로 빠진다.
//
// 규칙
//   - 회사 하나에 항목 하나 — 한 시즌에 한 번만 켠다(승인 6 '회사별 1회'). 같은 설명에 두 번 붙지 않는다(멱등).
//   - description·JSON-LD description·공유 설명(ShareButtons)에만 쓰인다. 화면 문장·H1·광고 위 문구는 건드리지 않는다.
//   - 삼성 OPI 를 켤 때는 src/data/opiAnnouncement.ts(홈 1월 배너 슬롯)도 같은 공지로 함께 채운다 — 별도 파일, 별도 줄.

export const BONUS_ANNOUNCEMENT_KEYS = ["samsung-bonus", "sk-hynix-bonus", "hyundai-bonus"] as const;
export type BonusAnnouncementKey = (typeof BONUS_ANNOUNCEMENT_KEYS)[number];

export interface BonusAnnouncement {
  /** 회사 공지로 지급률이 확정됐는가 — true 일 때만 아래 세 칸을 채운다 */
  confirmed: boolean;
  /** 확정된 지급률의 이름(예: '2026년 OPI'). 숫자·% 금지. 공지 전 null */
  rateLabel: string | null;
  /** 회사 공지일 YYYY-MM-DD (KST). 공지 전 null */
  date: string | null;
  /** 회사 공지 URL 또는 회사를 인용한 보도 URL. 공지 전 null */
  source: string | null;
}

/** 회사별 공지 상태 — 공지 전에는 전부 false/null (추정 기입 금지) */
export const BONUS_ANNOUNCEMENTS: Readonly<Record<BonusAnnouncementKey, BonusAnnouncement>> = {
  "samsung-bonus": { confirmed: false, rateLabel: null, date: null, source: null },
  "sk-hynix-bonus": { confirmed: false, rateLabel: null, date: null, source: null },
  "hyundai-bonus": { confirmed: false, rateLabel: null, date: null, source: null },
};

/** 공지일로 인정하는 범위 — 2027년 1~2월 발표 (승인 6) */
export const BONUS_ANNOUNCEMENT_SEASON = { from: "2027-01-01", to: "2027-02-28" } as const;
/** 이 날짜(포함)까지의 빌드에서만 꼬리 구절이 붙는다 */
export const BONUS_ANNOUNCEMENT_SHOW_UNTIL = "2027-03-31";

/** 꼬리 구절의 고정 부분 — 멱등 판정에도 쓴다 */
export const BONUS_ANNOUNCEMENT_MARK = "지급률 확정(";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD 가 실제 달력 날짜인가 (2027-02-30 같은 값 거부) */
function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** 빌드 시각의 KST 날짜 YYYY-MM-DD */
export function kstDate(now: Date): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * 항목 점검 — 문제 목록(빈 배열이면 통과). 공지 전 상태(false + null 세 칸)도 통과다.
 * 테스트 가드와 런타임이 같은 규칙을 쓴다(런타임은 문제가 있으면 붙이지 않는다 — 조용히 닫힘).
 */
export function bonusAnnouncementProblems(entry: BonusAnnouncement): string[] {
  const problems: string[] = [];
  if (!entry.confirmed) {
    if (entry.rateLabel !== null || entry.date !== null || entry.source !== null) {
      problems.push("confirmed:false 인데 값이 채워져 있다 — 공지 전에는 세 칸 모두 null");
    }
    return problems;
  }
  const label = entry.rateLabel ?? "";
  if (label.trim() === "" || label !== label.trim()) problems.push("rateLabel 이 비었거나 앞뒤 공백이 있다");
  if (label.length > 12) problems.push("rateLabel 이 12자를 넘는다");
  if (/[%％]/.test(label)) problems.push("rateLabel 에 % 수치가 있다");
  if (/[()]/.test(label) || label.includes("지급률")) problems.push("rateLabel 에 괄호나 '지급률'이 있다");
  const date = entry.date ?? "";
  if (!isRealDate(date)) problems.push("date 가 YYYY-MM-DD 실제 날짜가 아니다");
  else if (date < BONUS_ANNOUNCEMENT_SEASON.from || date > BONUS_ANNOUNCEMENT_SEASON.to) {
    problems.push(`date 가 ${BONUS_ANNOUNCEMENT_SEASON.from}~${BONUS_ANNOUNCEMENT_SEASON.to} 밖이다`);
  }
  if (!/^https:\/\/\S+$/.test(entry.source ?? "")) problems.push("source 가 https URL 이 아니다");
  return problems;
}

/**
 * 설명문 꼬리 구절 — ' 2026년 OPI 지급률 확정(1/27, 회사 공지).' 또는 빈 문자열.
 * 붙는 조건: 항목 점검 통과 + confirmed + 빌드 KST 날짜가 [공지일, SHOW_UNTIL] 안.
 */
export function bonusAnnouncementSuffix(
  key: BonusAnnouncementKey,
  now: Date = new Date(),
  table: Readonly<Record<BonusAnnouncementKey, BonusAnnouncement>> = BONUS_ANNOUNCEMENTS
): string {
  const entry = table[key];
  if (!entry || !entry.confirmed || bonusAnnouncementProblems(entry).length > 0) return "";
  const today = kstDate(now);
  const date = entry.date as string;
  if (today < date || today > BONUS_ANNOUNCEMENT_SHOW_UNTIL) return "";
  const [, m, d] = date.split("-").map(Number);
  return ` ${entry.rateLabel} ${BONUS_ANNOUNCEMENT_MARK}${m}/${d}, 회사 공지).`;
}

/**
 * 페이지 설명문에 꼬리 구절을 한 번만 붙인다 — 이미 '지급률 확정(' 이 있으면 그대로 둔다(멱등).
 * 휴면(모든 항목 confirmed:false)이면 입력 문자열을 그대로 돌려준다.
 */
export function withBonusAnnouncement(
  key: BonusAnnouncementKey,
  description: string,
  now: Date = new Date(),
  table: Readonly<Record<BonusAnnouncementKey, BonusAnnouncement>> = BONUS_ANNOUNCEMENTS
): string {
  if (description.includes(BONUS_ANNOUNCEMENT_MARK)) return description;
  const suffix = bonusAnnouncementSuffix(key, now, table);
  return suffix ? `${description}${suffix}` : description;
}
