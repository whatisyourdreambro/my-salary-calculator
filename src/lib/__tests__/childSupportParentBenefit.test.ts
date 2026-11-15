// 아동수당 가이드의 부모급여 문단 사실 가드 — 10월 1385d7937 재착지(RL-08, 2026-11-15).
//
// 부모급여(복지부 2026 안내, korea.kr 148957936): 만 2세 미만 모든 아동, 0세 월 100만원·1세 월 50만원,
// 어린이집을 이용하면 영유아보육료를 뺀 차액을 현금 지원(0세 41만 6천원, 1세 차액 없음).
// 부모의 육아휴직 여부·육아휴직 급여 수급 여부와 상관없이 받는 보편수당(복지부 Q&A, korea.kr 148910399).
// 그래서 '육아휴직 못 받는 가구 한정' 은 틀린 조건이다. 광고 위 높이를 늘리지 않게 같은 괄호 자리에 더 좁은 구절로 바꿨다.
// 10월 테스트의 '정정일 = CONTENT_FIX_PUSH' 단언은 옮기지 않는다 — 그 날짜 장치는 base 에 없고, 이 글은 수정일이 없어
// 화면 정정일을 넣으면 GuideMidAd 위에 새 '수정' 칩이 생긴다. 대신 칩이 없고 사이트맵 날짜만 실제 수정일인지 본다.
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { getGuideContentDate } from "@/lib/guideContentRevisions";
import { RL08_EDIT_DAY, getGuideSitemapDate } from "@/lib/guideSitemapDates";

describe("child-support-100-2026 부모급여 문단", () => {
  const guide = koGuides.find((g) => g.slug === "child-support-100-2026")!;

  it("부모급여를 육아휴직과 묶지 않고 어린이집 등 이용 시 차감으로 안내한다", () => {
    expect(guide.content).toContain("만 0세: 월 100만원 / 만 1세: 월 50만원 (어린이집 등 이용 시 차감). 아동수당 10만원과 중복 수령 가능.");
    expect(guide.content).not.toMatch(/육아휴직 못 받는/);
  });

  it("화면 '수정' 칩은 생기지 않고(수정일 없음), 사이트맵·RSS 날짜만 실제 수정일이다", () => {
    expect(guide.modifiedDate).toBeUndefined();
    expect(getGuideContentDate(guide)).toBe(guide.publishedDate);
    expect(getGuideSitemapDate(guide)).toBe(RL08_EDIT_DAY);
  });
});
