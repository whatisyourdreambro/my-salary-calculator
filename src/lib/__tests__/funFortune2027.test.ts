// /fun/fortune 신년운세 연도 — 2027 정미년(丁未年, 붉은 양의 해)으로 (2026-11-15 SEASONC, app-tools-fun ideas[0])
//
// 12~1월 신년운세 시즌에 맞춰 제목·설명·JSON-LD·H1·결과 머리글·공유 제목·/fun 허브 카드·이동 경로 이름을 함께 바꾼다.
// 화면 문구는 모두 광고(fun/layout CalcResultAd·결과 InArticleAd) 위라 같은 폭 이하만: '2026'→'2027'(7 이 6 보다 좁다),
// 병오→정미·말→양(한글 음절 폭 같음), 결과 머리글의 한자는 서브셋 글꼴에 丁·未 가 없어 뺐다(검색 설명에만 둔다).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");
const stripComments = (s: string) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("/fun/fortune 2027 정미년", () => {
  const layout = read("src/app/fun/fortune/layout.tsx");
  const page = read("src/app/fun/fortune/page.tsx");
  const hub = read("src/app/fun/page.tsx");
  const sd = read("src/lib/structuredData.ts");

  it("메타 제목·설명·키워드·JSON-LD 는 2027 정미년", () => {
    expect(layout).toContain('title: "2027년 신년운세 - 재미로 보는 사주풀이"');
    expect(layout).toContain("2027년 정미년(丁未年) 당신의 운세는?");
    expect(layout).toContain('"정미년운세"');
    expect(layout).toContain('"name": "2027년 신년운세"');
    expect(layout).toContain("생년월일 기반 2027년 정미년 재미용 운세 콘텐츠");
  });

  it("화면 H1·부제·결과 머리글·공유 제목·결과 이름은 2027 정미년·붉은 양", () => {
    expect(page).toContain("2027 정미년<br />신년운세");
    expect(page).toContain("붉은 양의 해, 재미로 보는 한 해 운세를 미리 확인하세요.");
    expect(page).toContain('<p className="text-stone-600 font-sans mb-2">2027 정미년</p>');
    expect(page).toContain("[2027 정미년 신년운세]");
    expect(page).toContain('"온화한 붉은 양"');
    expect(page).toContain("2027년 정미년은 당신에게 있어 '도약'의 해입니다.");
  });

  it("지난 해(2026 병오년·붉은 말) 문구가 남지 않는다", () => {
    for (const src of [layout, page]) {
      for (const bad of ["병오", "丙午", "붉은 말", "2026년 신년운세", "2026 신년운세", "2026년운세"]) expect(src, bad).not.toContain(bad);
    }
    expect(hub).not.toContain("병오년");
    expect(hub).not.toContain("2026 신년운세");
    expect(sd).toContain('"/fun/fortune": "2027년 신년운세"');
  });

  it("/fun 허브 카드는 같은 폭의 2027 문구", () => {
    expect(hub).toContain('title="2027 신년운세" description="정미년 붉은 양의 해, 생년월일로 보는 나의 한 해 운세." href="/fun/fortune"');
    expect(hub).toContain("소비 성향, 2027 신년운세, 점심 메뉴 룰렛");
  });

  it("화면에 서브셋 글꼴 밖 한자(丁·未)를 새로 싣지 않는다 — 주석 밖에는 없다", () => {
    expect(stripComments(page)).not.toMatch(/[丁未]/);
  });
});

describe("/fortune-2026 → /fun/fortune 교차 링크 문구도 2027 (같은 폭 이하)", () => {
  it("링크 문구가 대상 쪽 연도와 같다", () => {
    const src = readFileSync("src/app/fortune-2026/page.tsx", "utf8");
    expect(src).toContain("생년월일시로 보는 2027 신년운세 전체보기");
    expect(src).not.toContain("2026 신년운세");
  });
});
