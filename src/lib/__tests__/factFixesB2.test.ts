// YMYL 사실 정정 회귀 가드 (2026-09-27 B2 facts)
//
// 1) /savings-interest-2026 기준금리: 한국은행 경제통계시스템 ECOS 722Y001(한국은행 기준금리) 일별 값으로 확인 —
//    2026-07-15 2.50 → 07-16 2.75, 2026-08-26 2.75 → 08-27 3.00, 이후 9월 말까지 3.00.
//    광고(HomeTopAd) 위 안내 박스라 줄 수 불변이 조건이다.
//    - 제목: 옛 제목(259.44px, 14px 900)과 같은 1px 구간의 폭(259.67px) — 한 줄/두 줄 전환 폭이 같다.
//    - 본문: 두 번째 문장의 한글 단어만 같은 음절 수로 교체(띄어쓰기 위치·단어 폭 동일, 숫자 단어는 그대로).
//    - 날짜·수치 원문은 접힌 FAQ 답변에 둔다(접힌 details 는 높이 0).
//    측정: 320~1440px 1px 간격 + 1536·1920, 광고 top 차이 0(main 빌드에서 문구만 바꿔 비교).
// 2) SK하이닉스 2022년 실적분 PS 820%: 회사 사내 공지를 인용한 이투데이 2023-02-01 보도
//    (https://www.etoday.co.kr/news/view/2217429 — 월 기본급의 820%·연봉의 41%, 2023-02-03 지급). 보도 기준.
//    영업이익 6.8조원은 DART 사업보고서(감사 후 연결, rcpNo 20230321001209) — 잠정 공시 7조66억원과 다르다.
//    /insights 표 출처 문구는 옛 문구와 같은 음절 수("공개 보도 수치"→"회사 인용 보도").
// 3) /savings-interest-2026 접힌 FAQ: 예금자보호 한도 1억원(2025-09-01~, 예금보험공사)·원천징수 지방소득세 1.4%.
// 4) 반도체 심층 가이드 sk-hynix-wage-2026: 2025년 행 psData 값, 2026년 전망 행 취소선 철회, 합의선 추정→당시의 추정(아래 describe).
// 이 문자열들을 다시 바꿀 때는 같은 방식으로 폭을 맞추고 전 폭 광고 위치를 다시 잴 것.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BONUS_PROFILES } from "@/data/bonusData";
import { PS_HISTORY } from "@/app/calc/sk-hynix-bonus/psData";
import { koGuides } from "@/lib/guidesContent";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const flat = (s: string) => s.replace(/\s+/g, " ");
const savingsSrc = flat(readSrc("src/app/savings-interest-2026/page.tsx"));
/** 한글 음절 수 목록(띄어쓰기 단위) — 단어별 폭 고정 확인용 */
const syllables = (s: string) => s.split(" ").map((w) => [...w].length);

describe("/savings-interest-2026 기준금리 3.00%(2026-08-27)", () => {
  it("광고 위 박스 제목·본문이 3.00% 반영 문구이고 옛 2.75% 제목이 없다", () => {
    expect(savingsSrc).toContain("8월 기준금리 3%로 재인상, 예·적금 금리 상승기");
    expect(savingsSrc).not.toContain("기준금리 2.75% 인상 — 예·적금 금리 상승 국면");
    expect(savingsSrc).toContain(
      "한국은행이 2026년 7월 16일 기준금리를 연 2.50%에서 2.75%로 0.25%p 인상했습니다. 2023년 1월 이후 3년 6개월 만의 인상에 이어 한은은 바로 다음 금통위에서 올렸고, 기준금리 인상이 시차를 두고 시중은행",
    );
    expect(savingsSrc).not.toContain("가능성까지 시사해");
  });

  it("본문 교체 구간은 옛 문구와 단어별 음절 수가 같다(띄어쓰기 위치 고정)", () => {
    expect(syllables("인상에 이어 한은은 바로 다음 금통위에서 올렸고,")).toEqual(
      syllables("인상인 데다 한은이 추가 인상 가능성까지 시사해,"),
    );
  });

  it("접힌 FAQ 에 날짜·수치 원문(7/16 2.75%, 8/27 3.00%)이 있고 메타 키워드도 3.00%", () => {
    expect(savingsSrc).toContain("2026년 7월 16일(2.50%→2.75%)과 8월 27일(2.75%→3.00%) 두 차례 연속 인상돼 현재 연 3.00%");
    expect(savingsSrc).toContain('"기준금리 3.00%"');
    expect(savingsSrc).not.toContain('"기준금리 2.75%"');
  });

  // 3) 같은 페이지 접힌 FAQ(InArticleAd 아래 닫힌 details — 높이 0, FAQPage JSON-LD 로도 나간다) 2026-09-27 정정:
  //    예금자보호 한도는 2025-09-01부터 금융회사(저축은행 포함)별 1인당 원리금 합산 1억원(예금보험공사),
  //    이자소득 원천징수 15.4% = 소득세 14% + 지방소득세 1.4%.
  it("접힌 FAQ: 예금자보호 1억원(2025-09-01~)·지방소득세 1.4%", () => {
    expect(savingsSrc).toContain(
      "단 예금자보호 한도는 2025년 9월 1일부터 금융회사(저축은행 포함)별 1인당 원리금 합산 1억원(예금보험공사).",
    );
    expect(savingsSrc).not.toContain("5천만원까지 예금자보호");
    expect(savingsSrc).toContain("14% 이자소득세 + 1.4% 지방소득세 = 총 15.4%");
    expect(savingsSrc).not.toContain("1.4% 농어촌특별세");
  });
});

describe("SK하이닉스 2022년 실적분 PS 820%(회사 인용 보도 기준)", () => {
  it("계산기 psData 와 bonusData 가 같은 820% 이다", () => {
    expect(PS_HISTORY.find((r) => r.year === 2022)).toMatchObject({ psRatePct: 820, opTril: 6.8 });
    const sk = BONUS_PROFILES.find((p) => p.calcSlug === "sk-hynix-bonus")!;
    const pay2023 = sk.payouts.find((p) => p.year === 2023 && p.scheme === "PS")!;
    expect(pay2023.percentOfBase).toBe(820);
    expect(pay2023.source).toBe("회사 인용 보도 (psData.ts PS_HISTORY)");
    // /insights 표(광고 위) 줄 수 불변 — 옛 출처 문구와 같은 음절 구조
    expect(syllables("회사 인용 보도")).toEqual(syllables("공개 보도 수치"));
  });

  it("반도체 심층 가이드(sk-hynix-wage-2026) 2022년 행은 820%·영업이익 6.8조원", () => {
    const g = koGuides.find((x) => x.slug === "sk-hynix-wage-2026")!;
    const c = flat(g.content);
    expect(c).toContain('<td class="p-3">2022</td> <td class="p-3">6.8조원</td> <td class="p-3">820%</td>');
    expect(c).not.toContain('<td class="p-3">7조원</td>');
  });
});

// 4) 반도체 심층 가이드 sk-hynix-wage-2026 PS 5년 추이 표·본문(GuideMidAd 와 InArticleAd 사이) 2026-09-27 폭 맞춤 정정.
//    - 2025년 행: psData PS_HISTORY(47.2조 DART·PS 2,964% 보도) — PS 칸 ' 지급'은 옛 ' 안팎'과 같은 한글 2음절(표 숫자는 tabular-nums).
//    - 2026년 행: 5월 전망(30~35조·1,000~1,500%)은 상반기 98.2조와 맞지 않아 철회. 두 숫자가 영업이익·PS 열의 최소 폭을 정해서
//      지우면 320~544px 에서 표 높이가 바뀐다 — 글자는 두고 <s> 취소선, '(예상)'→'(정정)', '삼성 경쟁 격화'→'기존 전망 철회'.
//    - '합의선 추정' → '당시의 추정'(같은 3·2음절).
//    측정: 320~1440px 1px 간격 + 1536·1920px 광고 top 차이 0. 다시 고칠 때도 같은 음절 구조를 지키고 전 폭을 다시 잴 것.
describe("sk-hynix-wage-2026 PS 추이 표 2025·2026년 행과 '당시의 추정'(2026-09-27)", () => {
  const g = koGuides.find((x) => x.slug === "sk-hynix-wage-2026")!;
  const c = flat(g.content);

  it("2025년 행은 psData PS_HISTORY 값(영업이익·PS %)이고 옛 30조원+·1,500% 안팎이 없다", () => {
    const r = PS_HISTORY.find((x) => x.year === 2025)!;
    expect(r).toMatchObject({ psRatePct: 2964, opTril: 47.2 });
    expect(c).toContain(
      `<td class="p-3 font-bold">2025</td> <td class="p-3 font-bold">${r.opTril}조원</td> <td class="p-3 font-bold text-primary">${r.psRatePct!.toLocaleString("en-US")}% 지급</td>`,
    );
    expect(c).not.toContain("30조원+");
    expect(c).not.toContain("1,500% 안팎");
    expect(syllables("2,964% 지급")).toEqual(syllables("1,500% 안팎"));
  });

  it("2026년 전망 행은 취소선으로 철회 표시되고 음절 구조가 옛 행과 같다", () => {
    expect(c).toContain(
      '<td class="p-3 font-bold">2026 (정정)</td> <td class="p-3"><s>30~35조원</s></td> <td class="p-3"><s>1,000~1,500%</s></td> <td class="p-3">HBM4 진입, 기존 전망 철회</td>',
    );
    expect(c).not.toContain("2026 (예상)");
    expect(c).not.toContain("삼성 경쟁 격화");
    expect(syllables("(정정)")).toEqual(syllables("(예상)"));
    expect(syllables("HBM4 진입, 기존 전망 철회")).toEqual(syllables("HBM4 진입, 삼성 경쟁 격화"));
  });

  it("'합의선 추정'은 '당시의 추정'으로 바뀌었다(같은 음절 구조)", () => {
    expect(c).toContain("<strong>당시의 추정: 5.5~7.0%</strong>");
    expect(c).not.toContain("합의선 추정");
    expect(syllables("당시의 추정:")).toEqual(syllables("합의선 추정:"));
  });
});
