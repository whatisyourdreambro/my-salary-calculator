// YMYL 사실 정정 회귀 가드 (2026-09-27 R8 fix batch D — 가이드 낡은 사실)
//
// 1) LG CNS 는 이미 유가증권시장 상장사다 — 한국거래소 KIND 회사개요(종목코드 064400): 시장구분 '유가증권 상장',
//    상장일 2025-02-05, 같은 날 상호변경 (주)엘지씨엔에스 → LG씨엔에스. 두 가이드가 아직 '상장 추진'·'상장 확정 여부 미확인'으로 적고 있었다.
//    - /guides/it-service-big3-salary-2026 (job-salary-deepdive-2026.ts): 사업 구조 목록의 LG CNS 항목, 취업·이직 정리의 AI·클라우드 항목
//    - /guides/sk-ax-salary-2026 (company-salary-deepdive-2026.ts): 실적 흐름 절의 경쟁사 문단 괄호
//    광고 사이 본문이라 같은 글자 수·같은 음절 구조(한글 자리엔 한글, 띄어쓰기·숫자·기호 위치 그대로)로 제자리 교체했다.
//    그래서 guide.content 길이(contentChars)가 그대로이고 guidesMeta.generated.ts 는 바뀌지 않는다(gen-guides-meta '변경 없음').
//    측정: 4ef59a4b 빌드에서 문구만 바꿔 320~1440px 1px 간격 + 1536·1920 에서 대상 요소 높이·광고 top 차이 0,
//    새 음절은 모두 사이트 글꼴 서브셋의 균일 한글 폭(굵은 글씨 포함).
// 2) /guides/samsung-wage-negotiation-2026 은 타결 전(5월 12일) 글이다. 확정 결과(2026-05-27 조합원 찬반투표 가결, 임금 기본 4.1% +
//    성과 평균 2.1% = 6.2%, DS부문 특별경영성과급 신설)는 레이아웃 푸터 광고 아래 보강 섹션(supplements.ts)에만 두고
//    본문·제목·설명은 건드리지 않는다. 수치는 계산기 정본(SAMSUNG_WAGE_2026·samsung-bonus model)에서 끼워 넣는다 — 보도 기준.
//    본문 첫머리의 '5월 12일 본격 교섭 돌입'은 작성 당시에도 사실이 아니었으므로(상견례 2025-12-11) 보강 머리말이 그렇게 밝히고,
//    협상 경과는 실제 일지(파이낸셜뉴스 2026-05-27 일지·서울신문 2026-05-13·헤럴드경제 2026-05-27 보도 기준)로 적는다.
// 이 문자열들을 다시 바꿀 때는 같은 방식으로 폭을 맞추고 전 폭 광고 위치를 다시 잴 것.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FIXED_RERATE, getThreshold } from "@/app/calc/samsung-bonus/model";
import { SAMSUNG_WAGE_2026 } from "@/lib/bonusHome/compEngines";
import { extractGuideFaqs } from "@/lib/guideFaq";
import { koGuides } from "@/lib/guidesContent";
import { guideCards } from "@/lib/guidesMeta.generated";
import { guideSupplements } from "@/lib/guides/supplements";

const flat = (s: string) => s.replace(/\s+/g, " ");
/** 글자 모양 — 한글 음절은 H, 나머지는 그 글자 그대로. 두 문구의 모양이 같으면 단어 폭·줄바꿈 기회가 같다 */
const shape = (s: string) => [...s].map((c) => (/[가-힣]/.test(c) ? "H" : c)).join("");
const guide = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`guide ${slug} 없음`);
  return g;
};
const card = (slug: string) => {
  const c = guideCards.find((x) => x.slug === slug);
  if (!c) throw new Error(`card ${slug} 없음`);
  return c;
};

/** [옛 문구, 새 문구] — 광고 위 제자리 교체 쌍 */
const BIG3_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["<strong>LG CNS = DX·AX 전문, 상장 추진 스토리.</strong>", "<strong>LG CNS = DX·AX 전문, 상장 이후 스토리.</strong>"],
  [
    "2025년 초 코스피 상장 추진이 보도됐고 당시 예상 시가총액은 6조원대였습니다(뉴스투데이 2025-01 — 추진 보도 기준).",
    "2025년 초 코스피 신규 상장을 완료했고 당시 예상 시가총액은 6조원대였습니다(뉴스투데이 2025-01 — 상장 직전 보도).",
  ],
  ["상장 추진 스토리는 향후 보상 체계 변화의 변수입니다.", "상장 이후 주식시장 평가 또한 보상 체계의 변수입니다."],
];
const SKAX_PAIRS: ReadonlyArray<readonly [string, string]> = [
  [
    "(뉴스투데이 2025-01-10 — 상장 확정 여부까지는 확인되지 않은 보도 기반 내용입니다).",
    "(뉴스투데이 2025-01-10 — 이후 실제 상장까지도 완료되어 현재 정식 상장 기업입니다).",
  ],
];

describe("LG CNS 상장 완료(KRX KIND 상장일 2025-02-05) — 광고 위 제자리 교체", () => {
  for (const [slug, pairs] of [
    ["it-service-big3-salary-2026", BIG3_PAIRS],
    ["sk-ax-salary-2026", SKAX_PAIRS],
  ] as const) {
    it(`${slug}: 새 문구가 있고 옛 문구('상장 추진'·'확정 여부 미확인')가 없다`, () => {
      const c = flat(guide(slug).content);
      for (const [oldText, newText] of pairs) {
        expect(c).toContain(newText);
        expect(c).not.toContain(oldText);
      }
      expect(c).not.toContain("상장 추진 스토리");
      expect(c).not.toContain("추진 보도 기준");
      expect(c).not.toContain("상장 확정 여부까지는 확인되지 않은");
    });

    it(`${slug}: 교체 쌍은 글자 수·글자 모양이 같다(띄어쓰기·숫자·기호 자리 고정)`, () => {
      for (const [oldText, newText] of pairs) {
        expect(newText.length).toBe(oldText.length);
        expect(shape(newText)).toBe(shape(oldText));
      }
    });

    it(`${slug}: 본문 길이가 카드 메타 contentChars 와 같다(guidesMeta.generated.ts 불변)`, () => {
      expect(guide(slug).content.length).toBe(card(slug).contentChars);
    });
  }

  it("it-service-big3: LG CNS 항목이 상장 완료를 말한다", () => {
    const c = flat(guide("it-service-big3-salary-2026").content);
    expect(c).toContain("코스피 신규 상장을 완료했고");
  });
});

describe("samsung-wage-negotiation-2026 — 타결 결과는 광고 아래 보강 섹션에만", () => {
  const slug = "samsung-wage-negotiation-2026";
  const s = flat(guideSupplements[slug] ?? "");

  it("정본 값: 2026-05-27 가결·기본 4.1% + 성과 평균 2.1% = 6.2%·재원 10.5%·임계 200조/100조", () => {
    expect(SAMSUNG_WAGE_2026.ratifiedDate).toBe("2026-05-27");
    expect([SAMSUNG_WAGE_2026.basePct, SAMSUNG_WAGE_2026.meritAvgPct, SAMSUNG_WAGE_2026.totalPct]).toEqual([4.1, 2.1, 6.2]);
    expect(FIXED_RERATE).toBe(10.5);
    expect([getThreshold(2026), getThreshold(2028), getThreshold(2029), getThreshold(2035)]).toEqual([200, 200, 100, 100]);
  });

  it("보강 섹션이 가결 날짜·투표 결과·인상률·특별경영성과급 조건을 담는다", () => {
    expect(s).toContain("5월 22~27일 조합원 찬반투표(투표율 95.5%, 찬성 73.7%) → 2026년 5월 27일 가결");
    expect(s).toContain("기본인상률 4.1% + 성과인상률 평균 2.1%, 합계 평균 6.2%입니다");
    expect(s).toContain("노사가 합의해 정한 DS부문 사업성과의 10.5%를 재원으로 하고 지급률 상한은 두지 않습니다");
    expect(s).toContain("재원은 부문 40%·사업부 60%로 나누고, 세후 금액 전액을 자사주로 지급합니다");
    expect(s).toContain("받은 주식의 3분의 1은 즉시 팔 수 있고 나머지 3분의 1씩은 1년·2년 동안 매각이 제한됩니다");
    expect(s).toContain("지급 조건은 DS부문 연간 영업이익 200조원(2026~2028년)·100조원(2029~2035년)입니다");
    expect(s).toContain("시나리오이며 전망이 아닙니다");
    expect(s).not.toMatch(/<h2>[^<]*[\u{1F300}-\u{1FAFF}]/u); // 이모지 헤더 금지(보강 섹션 관습)
  });

  // R8-D 리뷰 반영: 본문의 '5월 12일 본격 교섭 돌입'은 작성 당시에도 사실이 아니었다(상견례 2025-12-11, 5/11~12 는 중노위 사후조정).
  // 머리말이 이를 '작성 당시의 내용'으로 넘기지 않고 사실과 다르다고 밝히는지, 경과가 실제 일지(파이낸셜뉴스 2026-05-27 일지·
  // 서울신문 2026-05-13·헤럴드경제 2026-05-27 보도 기준)대로인지 고정한다.
  it("머리말이 본문의 '5월 12일 본격 교섭 시작'이 사실과 다르다고 밝힌다", () => {
    expect(s).toContain(
      "본문 첫머리의 '5월 12일 본격 교섭 시작'은 사실과 다릅니다 — 2026년 임금교섭은 2025년 12월 11일 상견례로 시작됐고, 5월 11~12일은 중앙노동위원회 사후조정 일정이었습니다",
    );
    expect(s).toContain("'6~8주, 5~10차 본교섭'·'합의 시점은 6~8월'도 실제 경과와 맞지 않으니 아래 협상 경과를 기준으로 보세요");
    // 옛 머리말·옛 경과 문구(5/12 를 정상적인 교섭 시작처럼 남겨 두던 표현)는 없어야 한다
    expect(s).not.toContain("임금협상이 타결되기 전에 쓴 분석입니다");
    expect(s).not.toContain("본문의 일정·인상률 전망");
    expect(s).not.toContain("사후조정 회의(5월 11~12일) 일정입니다");
  });

  it("협상 경과가 실제 일지 순서(상견례 → 결렬 → 조정 중지 → 사후조정 2회 → 장관 중재 잠정합의 → 투표 → 가결)다", () => {
    const steps = [
      "2025년 12월 11일 상견례(12월 16일 1차 본교섭)",
      "2026년 2월 19일 교섭 결렬",
      "3월 3일 중앙노동위원회 조정 중지",
      "5월 11~12일 1차 사후조정(13일 새벽 결렬)",
      "5월 18~20일 2차 사후조정(결렬)",
      "5월 20일 고용노동부 장관 중재 교섭에서 잠정합의",
      "5월 22~27일 조합원 찬반투표(투표율 95.5%, 찬성 73.7%)",
      "2026년 5월 27일 가결(파이낸셜뉴스·서울신문·헤럴드경제 보도 기준)",
    ];
    expect(s).toContain(steps.join(" → "));
  });

  // R8-B(같은 10/5 푸시)가 통합 페이지 마지막 광고 아래에 '2026 임금협약 타결 결과' 요약을 넣으므로, 링크 문장은 그 요약을
  // 가리키되 쟁점 카드·직급별 표가 협상 전 시나리오임을 밝힌다. R8-B 를 빼고 내보내면 이 문장이 거짓이 되므로 교차 단언한다.
  it("통합 페이지 링크는 그 페이지의 타결 결과 요약을 가리키고, 쟁점 카드·직급별 표는 협상 전 시나리오라고 밝힌다", () => {
    expect(s).toContain(
      "협상 쟁점 배경과 타결 결과 요약은 <a href=\"/samsung-negotiation-2026\">삼성전자 2026 임금협상 통합 페이지</a>에도 정리돼 있습니다(그 페이지의 쟁점 카드·직급별 인상폭 표는 협상 전 시나리오입니다)",
    );
    expect(s).not.toContain("협상 전체 흐름은");
    expect(s).not.toContain("타결 전에 만든 <a");
    const hub = readFileSync(resolve(process.cwd(), "src/app/samsung-negotiation-2026/page.tsx"), "utf8");
    expect(hub).toContain("2026 임금협약 타결 결과");
  });

  // R8-D 리뷰 minor 3·4 + dedupe 13 (2026-09-30): 소급 시점·인상률 비교의 주어·재원 표현·OPI 줄의 지급 시점 추론 정정.
  it("소급은 2026년 3월 급여부터(본문의 1월 1일자 소급은 작성 당시 가정)이고, 기본인상률 4.1%는 당시 추정보다 낮다", () => {
    expect(s).toContain(
      "<li><strong>소급 적용</strong> — 인상분은 2026년 3월 급여부터 소급 적용됩니다(보도 기준). 본문의 1월 1일자 소급과 7월 급여에 5~7개월치 차액 계산은 작성 당시의 가정입니다.</li>",
    );
    expect(s).toContain(
      "합계 6.2%는 본문의 당시 추정(5.0~6.5%) 범위 안이지만 기본인상률만 보면 4.1%로 추정보다 낮고, 직급별 시뮬레이션 표에서는 6% 열이 가장 가깝습니다",
    );
    expect(s).not.toContain("본문의 당시 추정(5.0~6.5%) 범위 안이며");
    // 본문이 실제로 1월 1일자 소급 가정을 담고 있어야 위 설명이 맞다
    const body = flat(guide(slug).content);
    expect(body).toContain("소급 적용은 1월 1일자");
    expect(body).toContain("1월 1일자 소급 적용 시 7월 급여에 5~7개월치 차액이 일시 지급되는 패턴");
  });

  it("재원은 '노사가 합의해 정한 DS부문 사업성과의 10.5%'이고 '영업이익의 10.5%'로 줄여 쓰지 않는다(본문·FAQ 모두)", () => {
    expect(s.match(/노사가 합의해 정한 DS부문 사업성과의 10\.5%/g)?.length).toBe(2);
    expect(s).not.toContain("DS부문 영업이익의 10.5%");
    const faqs = extractGuideFaqs(guide(slug).content + (guideSupplements[slug] ?? ""));
    expect(faqs[1].answer).toContain("사업성과의 10.5%");
  });

  it("OPI 줄은 지급 조건(연간 영업이익) 기준과 10/7 세부안 보도(지급 시기·지급률 공지)를 날짜·매체와 함께 적는다", () => {
    expect(s).toContain(
      "지급 조건이 DS부문 연간 영업이익 기준이라 2026년분은 연간 실적이 나온 뒤 지급 여부가 정해지며, 10월 7일 언론 보도에 따르면 2026년분은 2027년 3월 말~4월 초(3월 정기 주총 뒤) 자사주로 지급되고, 사업부별 지급률은 2027년 2월 공지 예정입니다(한국경제·EBN 2026-10-07).",
    );
    expect(s).not.toContain("2026년 실적이 첫 적용 연도라 연간 실적이 확정된 뒤 지급되며");
  });

  it("본문 쟁점 1 의 '합의선 추정'은 같은 음절 구조의 '당시의 추정'이다(sk-hynix-wage-2026 과 같은 교체, 길이 불변)", () => {
    const body = flat(guide(slug).content);
    expect(body).toContain("<strong>당시의 추정: 5.0~6.5%</strong>");
    expect(body).not.toContain("합의선 추정");
    expect(shape("당시의 추정: 5.0~6.5%")).toBe(shape("합의선 추정: 5.0~6.5%"));
  });

  it("보강 FAQ 3개가 FAQPage 추출 패턴에 걸린다(본문에는 FAQ 섹션이 없다)", () => {
    const g = guide(slug);
    expect(extractGuideFaqs(g.content)).toEqual([]);
    const faqs = extractGuideFaqs(g.content + (guideSupplements[slug] ?? ""));
    expect(faqs.map((f) => f.question)).toEqual([
      "삼성전자 2026년 임금 인상률은 최종 몇 %인가요?",
      "특별경영성과급은 기존 OPI와 어떻게 다른가요?",
      "특별경영성과급 자사주는 바로 팔 수 있나요?",
    ]);
    expect(faqs[0].answer).toContain("평균 6.2%");
  });

  it("본문·카드 메타는 그대로다 — 새 문장은 본문에 들어가지 않았다", () => {
    const g = guide(slug);
    const c = flat(g.content);
    expect(c).not.toContain("2026년 9월 27일 기준 확인 사항");
    expect(c).not.toContain("5월 27일");
    expect(c).not.toContain("특별경영성과급");
    expect(g.content.length).toBe(card(slug).contentChars);
    expect(card(slug).publishedDate).toBe("2026-05-12");
    expect(card(slug).modifiedDate).toBeUndefined();
  });
});
