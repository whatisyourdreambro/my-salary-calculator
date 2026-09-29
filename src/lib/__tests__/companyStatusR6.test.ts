// 합병 소멸 회사 히어로 소개문 고정 (2026-09-27 R6-08 corpstatus)
//
// /salary-db/[id] 히어로의 company.description(<p class="ms-description">)은 광고보다 위에 있다.
// 그래서 사실관계를 고친 문구는 단어마다 옛 문구와 같은 렌더 폭으로 맞췄다(한글 음절 수·숫자·
// 문장부호·라틴 문자 위치 동일, 띄어쓰기 위치 동일). 320~1440px 1px 간격과 1536·1920px 에서
// 광고 위치가 adb120cc 빌드와 같음을 확인했다(scratch wordfit·sweepcompare·adpos).
// ★ 이 문구를 고치기 전에는 반드시 같은 폭 맞춤(wordfit)과 전 폭 광고 위치 확인을 다시 하고
//   이 테스트의 고정값을 갱신한다. 글자 수만 맞추면 안 된다 — 한글·숫자·문장부호·라틴 문자는 폭이 다르다.
//
// 근거(금융감독원 DART, 공개 검색):
//  - HD현대인프라코어(042670): 주요사항보고서(회사합병결정) 20250701000231(정정 20250711000213) —
//    에이치디현대건설기계가 흡수합병, 합병기일 2026-01-01. 존속회사 증권발행실적보고서(합병)
//    20260102000224(2026-01-02). 최대주주 대량보유보고 20260109000541: "피합병으로 인한 소멸".
//    존속회사 현재 공시명 HD건설기계(에이치디건설기계).
//  - HD현대미포(010620)는 20250827000428(합병기일 2025-12-01, HD현대중공업 흡수합병)으로 확인됐지만
//    'HD현대중공업'(7자)이 들어갈 만큼 넓은 단어 자리는 'PC선·MR탱커의'(9자) 하나뿐이고, 남는 2자가
//    정확히 1,550 폰트 유닛(upem 2048)이어야 하는데 자연스러운 글자 조합이 없어 이번에 바꾸지 않았다.
//    바꾸려면 별도 승인된 방식이 필요하다.
//
// 제목·meta description·aliases·dartInjection·lastUpdated 는 건드리지 않았다.
import { describe, expect, it } from "vitest";
import { krCompanies_Batch15 } from "@/data/krCompanies_Batch15";
import { allCompanies } from "@/data/companies";

const INFRACORE_OLD = "두산인프라코어에서 HD현대로 품을 옮긴 굴착기 전문. 건설기계 글로벌 탑10.";
const INFRACORE_NEW = "두산인프라코어에서 HD현대로 옮겨 계열 법인에 합병. 건설기계 글로벌 탑10.";
const MIPO_CURRENT = "중소형 선박 세계 1위. PC선·MR탱커의 글로벌 강자, HD현대 조선 3사 중 막내.";

const HANGUL = /[가-힣]/;
// 단어별 폭 서명: 한글 음절은 모두 같은 폭이라 'H' 로 접고, 나머지 글자는 그대로 둔다.
const widthSignature = (text: string) =>
  text.split(" ").map((word) => [...word].map((ch) => (HANGUL.test(ch) ? "H" : ch)).join(""));

const byId = (id: string) => {
  const inBatch = krCompanies_Batch15.find((c) => c.id === id);
  const merged = allCompanies.find((c) => c.id === id);
  if (!inBatch || !merged) throw new Error(`missing company ${id}`);
  return { inBatch, merged };
};

describe("R6-08 합병 소멸 회사 히어로 소개문", () => {
  it("HD현대인프라코어: 합병 사실을 담은 새 문구가 그대로 노출된다", () => {
    const { inBatch, merged } = byId("hd-hyundai-infracore");
    expect(inBatch.description).toBe(INFRACORE_NEW);
    expect(merged.description).toBe(INFRACORE_NEW);
    expect(INFRACORE_NEW).toContain("합병");
    expect(INFRACORE_NEW).toContain("두산인프라코어");
    expect(INFRACORE_NEW).toContain("HD현대");
    expect(INFRACORE_NEW).not.toContain("품을 옮긴 굴착기 전문");
  });

  it("HD현대인프라코어: 새 문구는 단어마다 옛 문구와 같은 폭 서명(띄어쓰기·숫자·문장부호·라틴 위치)이다", () => {
    expect(widthSignature(INFRACORE_NEW)).toEqual(widthSignature(INFRACORE_OLD));
    expect([...INFRACORE_NEW].length).toBe([...INFRACORE_OLD].length);
  });

  it("HD현대인프라코어: 이름·aliases·lastUpdated 는 그대로다", () => {
    const { inBatch } = byId("hd-hyundai-infracore");
    expect(inBatch.name).toEqual({ ko: "HD현대인프라코어", en: "HD Hyundai Infracore" });
    expect(inBatch.aliases).toBeUndefined();
    expect(inBatch.lastUpdated).toBe("2026-05-15");
  });

  it("HD현대미포: 폭 맞춤 문구가 없어 이번 변경에서 제외 — 소개문은 종전 그대로다", () => {
    const { inBatch, merged } = byId("hd-hyundai-mipo");
    expect(inBatch.description).toBe(MIPO_CURRENT);
    expect(merged.description).toBe(MIPO_CURRENT);
    expect(inBatch.lastUpdated).toBe("2026-05-15");
  });
});
