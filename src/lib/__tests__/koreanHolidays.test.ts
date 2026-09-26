// 영업일 계산기 공휴일 모듈 회귀 테스트 (2026-09-26 도입).
// 근거: 관공서의 공휴일에 관한 규정(대통령령 제36290호, 시행 2026. 5. 11.) 제2조·제3조,
// 우주항공청 2026·2027년 월력요항 발표(공휴일 수·주5일제 휴일 수·연휴 목록), 한국천문연구원 음양력 변환.
import { describe, expect, it } from "vitest";
import { AS_OF, HOLIDAYS, SOURCE, countWorkdays, workdayResultLabel } from "../koreanHolidays";
import { getToolContent } from "../toolContent";

const d = (ymd: string) => {
  const [y, m, day] = ymd.split("-").map(Number);
  return new Date(y, m - 1, day);
};
const count = (a: string, b: string) => countWorkdays(d(a), d(b));
const dow = (ymd: string) => d(ymd).getDay();

describe("HOLIDAYS data", () => {
  it("has unique, sorted, valid dates inside their own year", () => {
    for (const [year, list] of Object.entries(HOLIDAYS)) {
      const dates = list.map((h) => h.date);
      expect(new Set(dates).size).toBe(dates.length);
      expect([...dates].sort()).toEqual(dates);
      for (const date of dates) {
        expect(date.startsWith(`${year}-`)).toBe(true);
        const [y, m, day] = date.split("-").map(Number);
        const dt = d(date);
        expect([dt.getFullYear(), dt.getMonth() + 1, dt.getDate()]).toEqual([y, m, day]);
      }
    }
  });

  it("pins the weekday of the key dates (KASA 월력요항 wording)", () => {
    // 2026: 설날 2/17(화), 3·1절·부처님 오신 날 일요일, 추석 9/25(금), 추석 다음 날 9/26(토)
    expect(dow("2026-02-17")).toBe(2);
    expect(dow("2026-03-01")).toBe(0);
    expect(dow("2026-05-24")).toBe(0);
    expect(dow("2026-09-25")).toBe(5);
    expect(dow("2026-09-26")).toBe(6);
    // 2027: 설날 2/7(일) → 대체 2/9(화), 추석 9/15(수), 노동절·제헌절·한글날·성탄절 토요일
    expect(dow("2027-02-07")).toBe(0);
    expect(dow("2027-02-09")).toBe(2);
    expect(dow("2027-09-15")).toBe(3);
    for (const sat of ["2027-02-06", "2027-05-01", "2027-07-17", "2027-10-09", "2027-12-25"]) expect(dow(sat)).toBe(6);
  });

  it("matches the KASA totals: 공휴일(일요일 포함) and 주5일제 휴일", () => {
    const totals = (year: 2026 | 2027) => {
      let sundays = 0;
      let saturdays = 0;
      for (let dt = new Date(year, 0, 1); dt.getFullYear() === year; dt.setDate(dt.getDate() + 1)) {
        if (dt.getDay() === 0) sundays++;
        if (dt.getDay() === 6) saturdays++;
      }
      const nonSunday = HOLIDAYS[year].filter((h) => dow(h.date) !== 0).length;
      const weekday = HOLIDAYS[year].filter((h) => dow(h.date) !== 0 && dow(h.date) !== 6).length;
      return { publicHolidays: sundays + nonSunday, fiveDayOff: sundays + saturdays + weekday };
    };
    // 2026: 월력요항 70일 + 노동절·제헌절 2일 = 72일, 주5일제 휴일 120일 (2027년 월력요항 발표문 주석)
    expect(totals(2026)).toEqual({ publicHolidays: 72, fiveDayOff: 120 });
    // 2027: 공휴일 72일, 주5일제 휴일 119일
    expect(totals(2027)).toEqual({ publicHolidays: 72, fiveDayOff: 119 });
  });

  it("cites official sources and an as-of date", () => {
    expect(AS_OF).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const s of SOURCE) expect(s.url).toMatch(/^https:\/\/(www\.law\.go\.kr|www\.kasa\.go\.kr|astro\.kasi\.re\.kr|www\.nec\.go\.kr)\//);
  });
});

describe("countWorkdays", () => {
  it("excludes the 2027 설 holidays and their substitute (2/8 월, 2/9 화 대체)", () => {
    // 2027-02-01(월)~02-12(금): 평일 10일 - 2/8·2/9 = 8일. 2/6(토)·2/7(일)은 이미 주말.
    expect(count("2027-02-01", "2027-02-12")).toEqual({ workdays: 8, holidaysExcluded: 2, covered: true });
    expect(count("2027-02-05", "2027-02-10")).toEqual({ workdays: 2, holidaysExcluded: 2, covered: true });
  });

  it("excludes the 2026 추석 week without counting the Saturday holiday", () => {
    // 2026-09-21(월)~09-27(일): 평일 5일 - 9/24(목)·9/25(금) = 3일, 9/26(토)는 주말이라 제외 수에 넣지 않음.
    expect(count("2026-09-21", "2026-09-27")).toEqual({ workdays: 3, holidaysExcluded: 2, covered: true });
  });

  it("does not double count a Saturday holiday and its Monday substitute", () => {
    // 2026-10-01(목)~10-09(금): 평일 7일 - 10/5(개천절 대체)·10/9(한글날) = 5일. 10/3(토)은 1회도 세지 않음.
    expect(count("2026-10-01", "2026-10-09")).toEqual({ workdays: 5, holidaysExcluded: 2, covered: true });
    // 2027-04-26(월)~05-07(금): 평일 10일 - 5/3(노동절 대체)·5/5(어린이날) = 8일. 5/1(토) 노동절은 주말.
    expect(count("2027-04-26", "2027-05-07")).toEqual({ workdays: 8, holidaysExcluded: 2, covered: true });
  });

  it("counts the 2026 local election day, 노동절 and 제헌절 as holidays", () => {
    expect(count("2026-06-03", "2026-06-03")).toEqual({ workdays: 0, holidaysExcluded: 1, covered: true });
    expect(count("2026-05-01", "2026-05-01")).toEqual({ workdays: 0, holidaysExcluded: 1, covered: true });
    expect(count("2026-07-17", "2026-07-17")).toEqual({ workdays: 0, holidaysExcluded: 1, covered: true });
  });

  it("full-year totals: 365 - weekend days - weekday holidays (hand-checked)", () => {
    // 2026-01-01 목요일 → 365 = 52주 + 목 1일: 토 52 + 일 52 = 주말 104일. 평일 공휴일 16일
    // (1/1, 2/16~18, 3/2, 5/1, 5/5, 5/25, 6/3, 7/17, 8/17, 9/24, 9/25, 10/5, 10/9, 12/25).
    expect(count("2026-01-01", "2026-12-31")).toEqual({ workdays: 365 - 104 - 16, holidaysExcluded: 16, covered: true });
    expect(365 - 104 - 16).toBe(245);
    // 2027-01-01 금요일 → 주말 104일. 평일 공휴일 15일
    // (1/1, 2/8, 2/9, 3/1, 5/3, 5/5, 5/13, 7/19, 8/16, 9/14~16, 10/4, 10/11, 12/27).
    expect(count("2027-01-01", "2027-12-31")).toEqual({ workdays: 365 - 104 - 15, holidaysExcluded: 15, covered: true });
    expect(365 - 104 - 15).toBe(246);
  });

  it("reports covered=false when any day is outside 2026-2027", () => {
    // 2025-12-29(월)~2026-01-02(금): 2025년 날짜는 공휴일을 빼지 못함, 2026-01-01만 제외.
    expect(count("2025-12-29", "2026-01-02")).toEqual({ workdays: 4, holidaysExcluded: 1, covered: false });
    expect(count("2027-12-27", "2028-01-07").covered).toBe(false);
    expect(count("2028-01-03", "2028-01-07")).toEqual({ workdays: 5, holidaysExcluded: 0, covered: false });
  });

  it("returns zero for an empty (reversed) range", () => {
    expect(count("2026-03-10", "2026-03-01")).toEqual({ workdays: 0, holidaysExcluded: 0, covered: true });
  });
});

describe("result label (one line at 320px, measured 2026-09-26)", () => {
  it("keeps the covered label within the measured worst case and the uncovered label fixed", () => {
    // 2026+2027 평일 공휴일 합계 31일이 covered 범위의 최댓값 → '공휴일 31일 제외 영업일수'(15자) 1줄 실측.
    const worst = workdayResultLabel({ workdays: 491, holidaysExcluded: 31, covered: true });
    expect(worst).toBe("공휴일 31일 제외 영업일수");
    expect([...worst].length).toBeLessThanOrEqual(15);
    expect(workdayResultLabel({ workdays: 3, holidaysExcluded: 0, covered: true })).toBe("공휴일 0일 제외 영업일수");
    expect(workdayResultLabel({ workdays: 2609, holidaysExcluded: 0, covered: false })).toBe("2026~27년 공휴일만 제외");
  });
});

describe("toolContent /tools/date/work-days (above tools/layout ads: width-pinned copy)", () => {
  const c = getToolContent("/tools/date/work-days")!;

  // 본문 섹션·목록·유의사항은 GuideMidAd 와 tools/layout 의 InArticleAd·HomeTopAd 위에 있다.
  // 글자 수 상한만으로는 줄 수가 지켜지지 않았다(R4 리뷰: 390~430px 에서 광고 28px 이동).
  // 그래서 바뀐 문구는 단어마다 옛 문구와 같은 폭(한글 음절 수·문장부호, 14px 의 (26–27)=한글 4자 폭)
  // 으로 맞췄고, 섹션 제목은 모든 폭에서 한 줄이다. 320~1440px 1px 간격과 1536·1920px 에서 광고 위치가
  // 같음을 확인했다(scratch sweepfit). 바꾸려면 같은 확인을 다시 하고 이 값을 갱신한다.
  // 접힌 FAQ 답(details)은 높이에 영향이 없어 고정하지 않는다.
  it("keeps the width-fitted copy above the ads", () => {
    expect(c.sections[1].paragraphs).toEqual([
      "시작일과 종료일을 입력하면 그 사이의 주말과 공휴일 빼고 남은 영업일이 계산됩니다. 시작일과 종료일을 포함할지 여부에 따라 결과가 하루 정도 달라질 수 있으니 표시 기준을 확인하세요.",
      "휴일 없이 월요일부터 같은 주 금요일까지는 5일, 그다음 주 금요일까지는 10일이 됩니다. 기간이 길어질수록 손으로 세기 번거로운 작업을 빠르게 처리할 수 있습니다.",
    ]);
    expect(c.sections[2].heading).toBe("2026~27년 공휴일 처리");
    expect(c.sections[2].paragraphs).toEqual([
      "이 계산기는 토·일요일을 제외하며, 설날·추석·제헌절 같은 법정 공휴일도 계산에서 알아서 빠집니다. 회사휴일 낀 기간을 계산할 때는 그 일수만큼 결과에서 직접 빼서 보정해야 정확합니다.",
    ]);
    expect(c.sections[2].list!.items).toEqual([
      "급여·수당 계산 시 회사 규정상 휴일 기준을 먼저 확인합니다.",
      "타연도의 휴일 등 반영이 안된 날짜는 수동 보정이 필요합니다.",
      "임시공휴일이 지정되는 해에는 해당 연도 달력을 함께 참고하세요.",
    ]);
    expect(c.disclaimer).toBe(
      "본 계산기는 주말을 제외한 참고용 영업일 수를 제공하며 (26–27) 공휴일도 뺐습니다. 그밖의 공휴일은 회사 규정과 해당 연도 달력으로 확인하시기 바랍니다.",
    );
  });

  it("keeps the FAQ question text unchanged", () => {
    expect(c.faqs[0].question).toBe("이 계산기는 공휴일도 빼 주나요?");
  });

  it("no longer claims holidays are ignored", () => {
    const all = [
      ...c.sections.flatMap((s) => [...(s.paragraphs ?? []), ...(s.list?.items ?? [])]),
      ...c.faqs.map((f) => f.answer),
      c.disclaimer ?? "",
    ].join("\n");
    expect(all).not.toMatch(/토·일요일만 제외|토요일과 일요일만 제외|공휴일은 반영하지 않|자동으로 빠지지 않|주말만 제외/);
    expect(c.faqs[0].answer.startsWith("네.")).toBe(true);
    expect(all).toContain("2026~2027년");
  });
});
