// src/lib/koreanHolidays.ts
//
// 2026·2027년 관공서 공휴일(대체공휴일 포함) 공유 모듈 — 순수 함수, 의존성 없음.
// 영업일 계산기(/tools/date/work-days)가 평일(월~금) 중 공휴일을 빼는 데 쓴다.
//
// 근거 (2026-09-26 확인):
//  - 관공서의 공휴일에 관한 규정 [대통령령 제36290호, 2026. 4. 30. 일부개정, 시행 2026. 5. 11.]
//    제2조: 국경일(국경일에 관한 법률 — 3·1절·제헌절·광복절·개천절·한글날), 1월 1일, 설 연휴,
//    부처님 오신 날, 노동절(5월 1일, 2026. 5. 1. 시행), 어린이날, 현충일, 추석 연휴, 기독탄신일,
//    임기만료 선거일(제10호의2), 정부 수시 지정일(제11호).
//    제3조(대체공휴일): 국경일·부처님 오신 날·노동절·어린이날·기독탄신일이 토·일과 겹치거나,
//    설·추석 연휴가 일요일과 겹치거나, 공휴일끼리 평일에 겹치면 다음 첫 비공휴일.
//    1월 1일·현충일은 대체 대상이 아니다.
//  - 우주항공청 「2026년 월력요항」(2025-06-30), 「2027년 월력요항」(2026-06-29) —
//    2026년 공휴일 70일(노동절·제헌절 추가로 72일, 주5일제 휴일 120일),
//    2027년 공휴일 72일(주5일제 휴일 119일).
//  - 음력 날짜(설·부처님 오신 날·추석)는 한국천문연구원 음양력 변환으로 교차 확인.
//  - 2026. 6. 3. 제9회 전국동시지방선거일(중앙선거관리위원회) — 제2조 제10호의2.
//
// 갱신: 제11호 임시공휴일은 지정 시점에 추가해야 한다(AS_OF 기준 2026·2027 지정 없음).
// 2028년 이후는 매년 6월 말 우주항공청 월력요항 발표 후 추가한다.

export type HolidayYear = 2026 | 2027;

export interface KoreanHoliday {
  /** YYYY-MM-DD (한국 날짜) */
  date: string;
  name: string;
}

export const AS_OF = "2026-09-26";

export const SOURCE = [
  {
    title: "관공서의 공휴일에 관한 규정 (대통령령 제36290호, 시행 2026. 5. 11.)",
    url: "https://www.law.go.kr/법령/관공서의공휴일에관한규정",
  },
  {
    title: "공휴일에 관한 법률 (법률 제21338호·제21543호 — 제헌절·노동절, 2026년 개정)",
    url: "https://www.law.go.kr/법령/공휴일에관한법률",
  },
  {
    title: "국경일에 관한 법률 제2조",
    url: "https://www.law.go.kr/법령/국경일에관한법률",
  },
  {
    title: "우주항공청 「2026년 월력요항」 발표 (2025-06-30)",
    url: "https://www.kasa.go.kr/bbs/BBSMSTR_000000000010/view.do?nttId=B000000001860Pe2zT3",
  },
  {
    title: "우주항공청 「2027년 월력요항」 발표 (2026-06-29)",
    url: "https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431",
  },
  {
    title: "한국천문연구원 음양력 변환 (설·부처님 오신 날·추석)",
    url: "https://astro.kasi.re.kr/life/pageView/8",
  },
  {
    title: "중앙선거관리위원회 제9회 전국동시지방선거 주요사무일정 (2026. 6. 3.)",
    url: "https://www.nec.go.kr/site/nec/ex/bbs/View.do?cbIdx=1104&bcIdx=289351",
  },
] as const;

/** 토·일요일과 겹치는 날도 그대로 싣는다(공식 목록). 평일 판정은 countWorkdays 가 한다. */
export const HOLIDAYS: Record<HolidayYear, KoreanHoliday[]> = {
  2026: [
    { date: "2026-01-01", name: "1월 1일" },
    { date: "2026-02-16", name: "설날 전날" },
    { date: "2026-02-17", name: "설날" },
    { date: "2026-02-18", name: "설날 다음 날" },
    { date: "2026-03-01", name: "3·1절" },
    { date: "2026-03-02", name: "대체공휴일(3·1절)" },
    { date: "2026-05-01", name: "노동절" },
    { date: "2026-05-05", name: "어린이날" },
    { date: "2026-05-24", name: "부처님 오신 날" },
    { date: "2026-05-25", name: "대체공휴일(부처님 오신 날)" },
    { date: "2026-06-03", name: "제9회 전국동시지방선거일" },
    { date: "2026-06-06", name: "현충일" },
    { date: "2026-07-17", name: "제헌절" },
    { date: "2026-08-15", name: "광복절" },
    { date: "2026-08-17", name: "대체공휴일(광복절)" },
    { date: "2026-09-24", name: "추석 전날" },
    { date: "2026-09-25", name: "추석" },
    { date: "2026-09-26", name: "추석 다음 날" },
    { date: "2026-10-03", name: "개천절" },
    { date: "2026-10-05", name: "대체공휴일(개천절)" },
    { date: "2026-10-09", name: "한글날" },
    { date: "2026-12-25", name: "기독탄신일" },
  ],
  2027: [
    { date: "2027-01-01", name: "1월 1일" },
    { date: "2027-02-06", name: "설날 전날" },
    { date: "2027-02-07", name: "설날" },
    { date: "2027-02-08", name: "설날 다음 날" },
    { date: "2027-02-09", name: "대체공휴일(설날)" },
    { date: "2027-03-01", name: "3·1절" },
    { date: "2027-05-01", name: "노동절" },
    { date: "2027-05-03", name: "대체공휴일(노동절)" },
    { date: "2027-05-05", name: "어린이날" },
    { date: "2027-05-13", name: "부처님 오신 날" },
    { date: "2027-06-06", name: "현충일" },
    { date: "2027-07-17", name: "제헌절" },
    { date: "2027-07-19", name: "대체공휴일(제헌절)" },
    { date: "2027-08-15", name: "광복절" },
    { date: "2027-08-16", name: "대체공휴일(광복절)" },
    { date: "2027-09-14", name: "추석 전날" },
    { date: "2027-09-15", name: "추석" },
    { date: "2027-09-16", name: "추석 다음 날" },
    { date: "2027-10-03", name: "개천절" },
    { date: "2027-10-04", name: "대체공휴일(개천절)" },
    { date: "2027-10-09", name: "한글날" },
    { date: "2027-10-11", name: "대체공휴일(한글날)" },
    { date: "2027-12-25", name: "기독탄신일" },
    { date: "2027-12-27", name: "대체공휴일(기독탄신일)" },
  ],
};

const FIRST_YEAR = 2026;
const LAST_YEAR = 2027;

const HOLIDAY_DATES: ReadonlySet<string> = new Set(
  Object.values(HOLIDAYS).flatMap((list) => list.map((h) => h.date))
);

function localKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface WorkdayCount {
  /** 월~금 중 공휴일(2026·2027 목록)을 뺀 날 수 — 시작일·종료일 포함 */
  workdays: number;
  /** 평일과 겹쳐 뺀 공휴일 수 (토·일 공휴일은 이미 주말이라 세지 않음, 같은 날은 1회) */
  holidaysExcluded: number;
  /** 기간 전체가 2026~2027년 안이면 true — 밖의 날짜는 공휴일을 빼지 못한다 */
  covered: boolean;
}

/**
 * start~end(양끝 포함, 로컬 날짜 기준) 영업일 수.
 * 입력은 parseLocalDate 로 만든 로컬 자정 Date 를 가정한다. start > end 또는 잘못된 날짜면 0.
 */
export function countWorkdays(start: Date, end: Date): WorkdayCount {
  let workdays = 0;
  let holidaysExcluded = 0;
  let covered = true;
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    const year = cur.getFullYear();
    if (year < FIRST_YEAR || year > LAST_YEAR) covered = false;
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) {
      if (HOLIDAY_DATES.has(localKey(cur))) holidaysExcluded++;
      else workdays++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return { workdays, holidaysExcluded, covered };
}

/**
 * 영업일 계산기 결과 라벨(숫자 위 한 줄). 320px 결과 박스(내폭 172px, 16px)에서 한 줄이어야
 * 결과 직하 광고 위치가 바뀌지 않는다 — 2026-09-26 DOM 실측, 길이 상한은 테스트가 고정.
 */
export function workdayResultLabel(r: WorkdayCount): string {
  return r.covered
    ? `공휴일 ${r.holidaysExcluded}일 제외 영업일수`
    : "2026~27년 공휴일만 제외";
}
