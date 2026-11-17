// /region 접힌 FAQ 답의 회사 이름 — 옛 사명·다른 지역 회사 정정 고정 (N2-data-06 커밋 A, data-b05-F04, R4 2026-11-18)
//
// 답은 닫힌 <details> 와 FAQPage JSON-LD 에만 있어 첫 화면·광고 위치가 바뀌지 않는다. 질문(summary, 화면에 보임)은
// 바꾸지 않는다 — '광주에서 기아자동차 직원 연봉은?' 같은 질문은 검색 표현으로 남긴다.
// 칩(majorCompanies)·설명 두 단어(커밋 B, GuideMidAd 위)는 스윕이 필요해 이 커밋 범위가 아니다.
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { regionsData, getRegionById } from "@/data/regionsData";

function region(id: string) {
  const r = getRegionById(id);
  if (!r) throw new Error(`missing region ${id}`);
  return r;
}
const answers = (id: string) => region(id).faqs.map((f) => f.a).join("\n");

describe("지역 FAQ 답 — 지금 사명으로, 다른 지역 회사 빼기", () => {
  it("어느 지역 답에도 기아자동차·대우조선해양 옛 사명과 접두 없는 현대중공업이 없다", () => {
    for (const r of regionsData) {
      const text = r.faqs.map((f) => f.a).join("\n");
      expect(text, r.id).not.toContain("기아자동차");
      expect(text, r.id).not.toContain("대우조선해양");
      expect(text.replace(/HD현대중공업/g, ""), r.id).not.toContain("현대중공업");
    }
  });

  it("광주·울산·경남·충남 답이 고친 문장 그대로", () => {
    expect(answers("gwangju")).toContain("기아 광주공장 생산직의 경우 초봉 약 3,500만원이며");
    expect(answers("ulsan")).toContain("현대차·HD현대중공업 생산직은 수당 포함 시 6,000만원~8,000만원에 달합니다.");
    expect(answers("ulsan")).toContain("HD현대중공업 등 조선업 기술직의 경우 경력 5년 이상 기준 5,500만원~7,500만원 수준이며");
    expect(answers("gyeongnam")).toContain("한화오션·삼성중공업 거제 현장 기술직의 경우");
    // 한화큐셀 공장은 충북(진천·음성) — 충남 답에서 빼고, 이차전지·솔라 -> 이차전지
    expect(answers("chungnam")).toContain("삼성SDI 등 이차전지 기업 신입 연봉은 4,000만원~5,000만원 수준이며");
    expect(answers("chungnam")).not.toContain("한화큐셀");
  });

  it("질문(summary)은 19개 지역 전부 그대로 — 해시 고정(ce2463cda 와 같은 값)", () => {
    const qs = regionsData.map((r) => [r.id, r.faqs.map((f) => f.q)]);
    expect(regionsData.length).toBe(19);
    expect(createHash("sha256").update(JSON.stringify(qs)).digest("hex")).toBe(
      "fddf48e779f9aa4275bb327773afecff8feb495f7bb6ae6abbbb400adea1c33b"
    );
    expect(region("gwangju").faqs.map((f) => f.q)).toContain("광주에서 기아자동차 직원 연봉은?");
  });
});
