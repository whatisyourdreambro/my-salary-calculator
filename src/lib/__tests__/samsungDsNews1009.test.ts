// 2026-10-09 삼성 DS 특별성과급 세부안(10/7 언론 보도) 묶음 회귀 가드 — 운영자 답 5(2026-10-08).
// ① 새 소식 글: 등록·공개 보류(기존 쪽 자동 목록 제외)·공개 출처 표현.
// ② 가이드 4편 보강: 광고 아래 보강 맵에만 있고 새 글로 링크.
// ③④ /calc/samsung-bonus: 지급 시기·재원(DS부문)·원천징수 안내, 내부 자료처럼 보이는 표현('회의록'·'사내 공지'·'보도값 791%') 없음.
//     계산기 보도 요약 상자는 calc/layout 의 맨 끝(모든 광고 아래)에만 있다.
// 숫자: 노조 가정 추정과 비교하는 사이트 계산기 값(370조원·연봉 8천만원·OPI 50%)은 model.ts 산출값과 같아야 한다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { guideSupplements } from "@/lib/guides/supplements";
import { guideSupplementsSamsungDs202610 } from "@/lib/guides/supplements-samsung-ds-2026-10";
import { SAMSUNG_DS_NEWS_SLUG, semiconductorBonusNews202610Guides } from "@/lib/guides/semiconductor-bonus-news-2026-10";
import { isReleaseHeldBack } from "@/lib/guideReleaseHoldback";
import { getGuideRelatedCalcs } from "@/lib/crossLink";
import { CALC_NEWS_NOTES, calcNewsNoteFor } from "@/components/CalcNewsNote";
import { computeDivisionPool, defaultDivisionCounts, defaultDivisionRatios, FIXED_OPI1_RATE, REFERENCE_SALARY } from "@/app/calc/samsung-bonus/model";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
/** 주석을 뺀 소스(화면·데이터 문자열만 남긴다) — // 줄 주석과 JSX {/* *\/} 주석 제거 */
const code = (p: string) => read(p).replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
const INTERNAL = /회의록|사내 공지|합의서 원문|블라인드|보도값 ?791|791%\/553%\/252%/;

describe("① 새 소식 글", () => {
  const guide = koGuides.find((g) => g.slug === SAMSUNG_DS_NEWS_SLUG);

  it("guidesContent 정본에 1편 등록, 발행일 2026-10-09, 연봉 카테고리", () => {
    expect(semiconductorBonusNews202610Guides).toHaveLength(1);
    expect(guide).toBeDefined();
    expect(guide!.publishedDate).toBe("2026-10-09");
    expect(guide!.category).toBe("연봉");
  });

  it("기존 쪽 자동 목록에서는 공개 보류(광고 위 높이 불변), 삼성 계산기 카드는 새 글 아래에 붙는다", () => {
    expect(isReleaseHeldBack(SAMSUNG_DS_NEWS_SLUG)).toBe(true);
    expect(getGuideRelatedCalcs(SAMSUNG_DS_NEWS_SLUG)).toContain("samsung-bonus");
  });

  it("공개 출처 표현만 — 사내 공지·회의록·커뮤니티 출처 없음, '10월 7일 언론 보도' 기준과 기사 URL", () => {
    const text = guide!.title + guide!.description + guide!.content;
    expect(text).not.toMatch(INTERNAL);
    expect(guide!.content).toContain("2026년 10월 7일 언론 보도");
    for (const url of [
      "https://www.hankyung.com/article/2026100792131",
      "https://www.ebn.co.kr/news/articleView.html?idxno=1727056",
      "https://www.etoday.co.kr/news/view/2633534",
      "https://m.inews24.com/v/2012739",
    ]) expect(guide!.content).toContain(url);
  });

  it("노조 추산은 '가정 추정'으로 밝히고, 보도마다 다른 제외 기준은 단정하지 않는다", () => {
    expect(guide!.content).toContain("노조 가정 추정");
    expect(guide!.content).not.toMatch(/1개월 (이하|미만)|10월 1일 이후 입사/);
  });

  it("FAQ 패턴(자주 묻는 질문 H2 + Q. 항목)", () => {
    expect(guide!.content).toMatch(/<h2>자주 묻는 질문<\/h2>\s*<ul>\s*<li><strong>Q\. /);
  });
});

describe("② 가이드 4편 광고 아래 보강", () => {
  const SLUGS = [
    "samsung-special-bonus-q3-preview-2027",
    "samsung-bonus-treasury-stock-15-trillion-2026",
    "samsung-opi-tai-complete-2026",
    "samsung-opi-forecast-2027",
  ];
  it("4편 모두 보강 맵에 있고 새 글로 링크한다(본문 정본은 그대로)", () => {
    expect(Object.keys(guideSupplementsSamsungDs202610).sort()).toEqual([...SLUGS].sort());
    for (const s of SLUGS) {
      expect(koGuides.some((g) => g.slug === s), s).toBe(true);
      expect(guideSupplements[s], s).toBe(guideSupplementsSamsungDs202610[s]);
      expect(guideSupplements[s], s).toContain(`/guides/${SAMSUNG_DS_NEWS_SLUG}`);
      expect(guideSupplements[s], s).not.toMatch(INTERNAL);
      expect(guideSupplements[s], s).not.toMatch(/자주 묻는 질문/);
    }
  });
});

describe("③④ /calc/samsung-bonus", () => {
  it("화면 문자열에 내부 자료처럼 보이는 표현이 없다 (page.tsx·Client.tsx, 주석 제외)", () => {
    for (const p of ["src/app/calc/samsung-bonus/page.tsx", "src/app/calc/samsung-bonus/Client.tsx"]) {
      expect(code(p), p).not.toMatch(INTERNAL);
    }
  });

  it("특별성과급 첫 지급은 2027년 3월 말~4월 초, 재원은 DS부문 영업이익 — 2027년 1월 첫 지급 문구 없음", () => {
    const page = code("src/app/calc/samsung-bonus/page.tsx");
    expect(page).not.toMatch(/2027년 1월 (첫 )?지급분부터|2027년 1월 첫 지급/);
    expect(page).toContain("2027년 3월 말~4월 초");
    expect(page).toContain("DS부문 영업이익의 10.5%");
    expect(code("src/app/calc/bonus-home-plan/page.tsx")).not.toContain("2027년 1월입니다");
  });

  it("49.5% 원천징수 → 연말정산 안내는 계산기 맨 끝(모든 광고 아래) 보도 요약 상자에 있다", () => {
    const item = calcNewsNoteFor("/calc/samsung-bonus/");
    expect(item).not.toBeNull();
    expect(item!.points.join(" ")).toMatch(/49\.5%.*원천징수.*연말정산/);
    expect(item!.href).toBe(`/guides/${SAMSUNG_DS_NEWS_SLUG}`);
    expect(item!.title + item!.points.join("") + item!.source).not.toMatch(INTERNAL);
    expect(Object.keys(CALC_NEWS_NOTES)).toEqual(["/calc/samsung-bonus"]);
    expect(calcNewsNoteFor("/calc/sk-hynix-bonus")).toBeNull();
    const layout = read("src/app/calc/layout.tsx");
    const at = (s: string) => layout.indexOf(s);
    expect(at("<CalcNewsNote />")).toBeGreaterThan(at("<HomeTopAd />"));
    expect(at("<CalcNewsNote />")).toBeGreaterThan(at("<FloatingShareBar />"));
    // 맨 끝: CalcNewsNote 뒤에는 닫는 fragment 만 온다(뒤에 다른 형제를 두면 이 줄을 같이 고칠 것)
    expect(layout.slice(at("<CalcNewsNote />")).replace(/\s+/g, "")).toMatch(/^<CalcNewsNote\/>(<CalcAfterAdsLink\/>)?<\/>/);
  });

  it("보도 요약 상자의 계산기 값(370조원·연봉 8천만원·OPI 50%)은 모델 산출값과 같다", () => {
    expect(REFERENCE_SALARY).toBe(80_000_000);
    expect(FIXED_OPI1_RATE).toBe(50);
    const pool = computeDivisionPool(370, defaultDivisionCounts(), defaultDivisionRatios(), true);
    const eok = (id: string) => {
      const row = pool.perDivision.find((d) => d.id === id)!;
      const won = row.total * 10_000 + REFERENCE_SALARY * (FIXED_OPI1_RATE / 100);
      return (won / 1e8).toFixed(2);
    };
    const text = CALC_NEWS_NOTES["/calc/samsung-bonus"].points.join(" ");
    expect(text).toContain(`약 ${eok("memory")}억·${eok("common")}억·${eok("foundry")}억원`);
    const guide = koGuides.find((g) => g.slug === SAMSUNG_DS_NEWS_SLUG)!;
    expect(eok("memory")).toBe("7.66");
    expect(guide.content).toContain("메모리 약 7억 6,600만원, 공통 약 5억 3,000만원, 파운드리·시스템LSI 약 2억 6,700만원");
  });
});
