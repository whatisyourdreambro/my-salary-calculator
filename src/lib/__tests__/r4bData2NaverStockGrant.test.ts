// 네이버 복지 '스톡그랜트' — 끝난 제도를 '매년 1천만원 상당 자사주 지급'(연 1,000만원 가치)으로 적던 칸 정정
// (N2-data-07 3번, data-b06-F04, 운영자 승인 2026-11-18 C-4 — 광고가 내려가지 않을 때만 유지, 이 커밋 하나로 되돌릴 수 있다)
//
// 공개 보도(2026-11-18 확인): 2021-04 전 직원 연 1,000만원 상당 자사주 3년 지급으로 도입 → 2023-05 임협에서 2026년까지
// 2년 연장(아이뉴스24 2023-05-18) → 2024-07 지급(전자신문 2024-07-01) → 2025년 임단협 잠정합의에서 제도 종료(EBN·디지털데일리
// 2025-04-01, 대신 연봉 800만원 별도 인상). 지금 받는 복지가 아니므로:
//  - 설명 '매년 1천만원 상당 자사주 지급' -> '자사주 지급, 2025년 종료' (패키지 문구 '2021~23년 연 1천만원 상당 자사주 지급'은
//    2024년 지급 보도와 어긋나고 종전보다 넓어 쓰지 않았다 — 새 문구는 종전보다 좁다)
//  - value 10,000,000 -> 0: 복지 칸의 '+ 연 1,000만원 가치' 줄이 사라진다(CalcResultAd 아래·회사 상단 광고 K1 위, 한 줄 짧아짐).
//  - 복지 가치 합계(CompanyUniqueStats, GuideMidAd 아래)는 바뀌지 않는다 — 제목에 '스톡'이 든 항목은 연봉표 보상과 겹친다고
//    보고 처음부터 합산에서 뺐다(companyContentBuilder COMPENSATION_DUPLICATE_RE). 패키지의 '합계 1,000만원 감소'는 일어나지 않는다.
//  - 비교 2쪽(naver-vs-kakao, hyperconnect-vs-naver)의 '대표 복지'(값 상위 2개, CalcResultAd 위)가
//    '스톡그랜트 · 업무 기기 지원' -> '업무 기기 지원 · 커넥티드 워크' 로 바뀐다(끝난 제도를 대표 복지로 꼽지 않게 된 결과,
//    12px 에서 약 13px 넓어짐 — 카드 안쪽 폭 256px 이상에서 한 줄 안, 통합 스윕 판정).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { getBenefitsValue } from "@/lib/companyContentBuilder";

const naver = () => {
  const c = companyRepository.getById("naver");
  if (!c) throw new Error("naver 없음");
  return c;
};
const OLD_DESC = "매년 1천만원 상당 자사주 지급";
const NEW_DESC = "자사주 지급, 2025년 종료";

/** MoneySalaryText 기본 인스턴스(wght 400) advance — 2026-11-18 fontTools 측정 */
const ADVANCE: Record<string, number> = { "1": 898, "2": 1202, "0": 1220, "5": 1222, " ": 514, ",": 528 };
const width = (text: string) =>
  [...text].reduce((sum, ch) => {
    if (/[가-힣]/.test(ch)) return sum + 1770;
    if (!(ch in ADVANCE)) throw new Error(`advance 표에 없는 글자: ${JSON.stringify(ch)}`);
    return sum + ADVANCE[ch];
  }, 0);

describe("N2-data-07 3번 네이버 스톡그랜트", () => {
  it("복지 칸: 설명은 '자사주 지급, 2025년 종료', value 0 — 제목·순서·항목 수는 그대로", () => {
    const b = naver().benefits;
    expect(b.map((x) => x.title)).toEqual(["업무 기기 지원", "스톡그랜트", "커넥티드 워크"]);
    const grant = b.find((x) => x.title === "스톡그랜트")!;
    expect(grant).toEqual({ category: "financial", title: "스톡그랜트", description: NEW_DESC, value: 0 });
    expect(JSON.stringify(b)).not.toContain("매년 1천만원");
  });

  it("새 설명은 종전보다 좁다(광고 위 칸) — 패키지 문구는 더 넓었다", () => {
    expect(width(NEW_DESC)).toBe(21076);
    expect(width(OLD_DESC)).toBe(24194);
    expect(width(NEW_DESC)).toBeLessThan(width(OLD_DESC));
  });

  it("복지 가치 합계는 그대로(스톡 항목은 원래 합산 제외): 연 480만원·2개 항목·전체 3개", () => {
    const v = getBenefitsValue(naver())!;
    expect(v.totalAnnualValue).toBe(4_800_000);
    expect(v.countedItems).toBe(2);
    expect(v.totalItems).toBe(3);
  });

  it("값 순 상위 2개(비교 페이지 '대표 복지')는 업무 기기 지원·커넥티드 워크", () => {
    const top = [...naver().benefits].sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).slice(0, 2).map((x) => x.title);
    expect(top).toEqual(["업무 기기 지원", "커넥티드 워크"]);
  });

  it("데이터 옆 주석에 공개 보도 출처(도입·연장·지급·종료)가 있다", () => {
    const src = readFileSync("src/data/seedCompanies.ts", "utf8");
    const at = src.indexOf('title: "스톡그랜트"');
    const note = src.slice(src.lastIndexOf("benefits: [", at), at);
    for (const url of [
      "https://www.inews24.com/view/1595647",
      "https://www.etnews.com/20240701000387",
      "https://www.ebn.co.kr/news/articleView.html?idxno=1657605",
    ]) {
      expect(note, url).toContain(url);
    }
  });
});
