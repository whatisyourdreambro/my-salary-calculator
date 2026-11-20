// R4 수리 2회차(2026-11-20) — /guides 목록의 태그 링크 결과 수를 N(71471b5a5, 광고 위치 기준판)과 같게 고정한다.
//
// 왜: /guides 목록(src/app/guides/GuidesListClient.tsx)은 브라우저에서 태그 링크(/guides?q=<태그>, 모든 가이드의 태그 칩)·
// 검색창·카테고리·정렬로 거른다. 거르는 규칙은 제목·설명·태그의 대소문자 무시 부분 문자열 일치다(src/lib/guideDiscovery.ts).
// 그래서 카드 글(제목·설명)에 태그 낱말이 새로 들어가거나 빠지면, 그 태그 링크가 보여 주는 카드가 바뀐다. 한 쪽 9장 가운데
// 보이는 카드가 6장을 넘으면 6번째 카드 뒤에 GuideMidAd 가 새로 생기고, 그 아래 카드·MultiplexAd·푸터 광고가 모두 내려간다
// (R4 수리 1회차 뒤 검토 D-ads-1: 설명 '… 또는 임대소득 …' 때문에 ?q=임대소득 이 6장 -> 7장이 되어 광고가 생겼다).
// 아래 결과 수는 N 의 카드 목록(guidesMeta.generated.ts @71471b5a5, 공개 보류 목록 적용, 294장 — 지금 목록과 같은 294장)을
// 이 테스트와 같은 방법(filterAndSortGuides, 정렬과 무관한 개수)으로 센 값이다. 값이 달라지면 카드 글을 N 의 결과 집합이
// 나오게 고치거나, 그 태그 상태의 광고 위치를 실측해 운영자 결정을 받는다 — 값을 그냥 갱신하지 말 것.
// 결과 집합(어느 카드인지, 어떤 순서인지)까지 N 과 같은지는 저장소 밖 도구(guides-parity.mjs, 0 개 상태 차이)로 확인했고,
// 바뀐 카드가 보이는 상태의 높이는 측정 블록 RF 가 잰다.
import { describe, expect, it } from "vitest";
import { koGuideCards } from "@/lib/guidesData";
import { withoutHeldBackGuides } from "@/lib/guideReleaseHoldback";
import { filterAndSortGuides } from "@/lib/guideDiscovery";

const cards = withoutHeldBackGuides(koGuideCards);
const card = (slug: string) => {
  const g = cards.find((x) => x.slug === slug);
  if (!g) throw new Error(`카드 없음: ${slug}`);
  return g;
};

describe("R4 수리 2회차 — 카드 설명 세 편(광고 위 핵심 요약·카드·RSS)", () => {
  it("피부양자 점검: N 문장에서 낱말을 지우거나 더 좁게 바꾼 꼴, 한 사람 기준('가족 1인 … 합산')", () => {
    expect(card("dependent-check-before-bonus-2026").description).toBe(
      "본인 성과급으로 피부양자 자격 직접 영향 없음. 단 가족 1인 연금·이자 합산 2,000만+ 시 박탈 → 지역가입자 부담.",
    );
  });
  it("종합 정산: 급여 1.2억(연봉 7,000만 + 성과급 5,000만)을 넣어 합이 2억, 4,100만은 종합소득세(종소세)", () => {
    expect(card("total-income-adjustment-bonus-2026").description).toBe(
      "급여 1.2억 + 임대 3,000만 + 배당 2,000만 + 사업 3,000만 = 영끌 2억. 종소세 4,100만 + 지방세 + 정산 800만 = 약 5,300만 부담.",
    );
    expect(12_000 + 3_000 + 2_000 + 3_000).toBe(20_000); // 만원 단위: 1.2억 + 3,000만 + 2,000만 + 3,000만 = 2억
  });
  it("이직 중 성과급: 새 회사 정산에서 빠진 것은 5월 종소세 신고로 합산(본문 31327daa8 과 같은 뜻)", () => {
    expect(card("moving-company-bonus-2026").description).toBe(
      "전 회사 + 신 회사 성과급 모두 근로소득 합산. 5월 종소세 신고 시 누락 합산. 한계세율 점프 시 추가 1,000만+ 세금.",
    );
  });
});

// N(71471b5a5) 의 결과 수 — 태그 링크 ?q=<태그> 와 같은 검색어. 6장을 넘는지가 GuideMidAd 유무를 가른다.
const N_COUNTS: ReadonlyArray<readonly [string, number]> = [
  ["임대소득", 6],
  ["보험료", 13],
  ["연금", 26],
  ["이자", 14],
  ["금", 163],
  ["종소세", 7],
  ["5월 종소세", 4],
  ["종소세 신고", 5],
  ["연말정산", 14],
  ["정산", 19],
  ["전환", 7],
];

describe("R4 수리 2회차 — /guides 태그 링크 결과 수가 N 과 같다(GuideMidAd 유무·카드 수 불변)", () => {
  it("목록은 N 과 같은 294장(한국어, 공개 보류 제외)", () => {
    expect(cards.length).toBe(294);
  });
  for (const [query, n] of N_COUNTS) {
    it(`q=${query}: ${n}장 (최신순·오래된순 같음)`, () => {
      expect(filterAndSortGuides(cards, { query }).length).toBe(n);
      expect(filterAndSortGuides(cards, { query, order: "oldest" }).length).toBe(n);
    });
  }
});
