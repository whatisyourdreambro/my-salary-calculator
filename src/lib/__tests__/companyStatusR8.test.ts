// 매각·지배구조가 바뀐 회사 히어로 소개문 고정 (2026-09-27 R8 fix C — company hero)
//
// /salary-db/[id] 히어로의 company.description(<p class="ms-description">)은 광고보다 위에 있다.
// 그래서 사실관계를 고친 문구는 단어마다 옛 문구와 같은 렌더 폭으로 맞췄다(한글 음절 수·숫자·
// 문장부호·라틴 문자 위치 동일, 띄어쓰기 위치 동일). 글꼴 단위(upem 2048, wght 400) 합과 글자 수가
// 단어마다 같고, 320~1440px 1px 간격과 1536·1920px 에서 광고 위치가 4ef59a4b 빌드와 같음을 확인했다
// (scratch wordfit·sweep). 글자 간격(letter-spacing)이 글자마다 고정 px 이라 글자 수도 같아야 한다.
// ★ 이 문구를 고치기 전에는 반드시 같은 폭 맞춤과 전 폭 광고 위치 확인을 다시 하고 이 테스트의
//   고정값을 갱신한다. 글자 수만 맞추면 안 된다 — 한글·숫자·문장부호·라틴 문자는 폭이 다르다.
//
// 근거(금융감독원 DART, 공개 검색, 2026-09-27 확인):
//  - SK렌터카(에스케이렌터카, corp 00201450): SK네트웍스 타법인주식및출자증권처분결정 정정
//    20240820800090 — 지분 100%를 카리나모빌리티서비시스(어피니티에쿼티파트너스 또는 그 계열회사가
//    자문하는 펀드의 100% 계열회사)에 양도, 거래 종결 2024-08-20. 에스케이렌터카 최대주주등의주식보유변동
//    20240823000472 — 동일인측(SK네트웍스) 100% → 동일인측이 아닌 최다출자자 카리나모빌리티서비시스 100%.
//    에스케이렌터카 주요사항보고서(회사합병결정) 20260813001793 — 모회사 카리나모빌리티서비시스 흡수(합병기일
//    2026-09-29), 상호는 에스케이렌터카 그대로.
//
// 이번에 바꾸지 않은 항목(같은 배치에서 확인만 함, 커밋 메시지 참조):
//  - 한진(hanjin): 'HMM 최대주주로' 는 사실이 아니다(HMM 반기보고서 20260813001042 — 최대주주 한국산업은행
//    35.42%, 한국해양진흥공사 35.08%). 그러나 광고 위 폭을 맞출 3글자 자리(HMM, 4,938 유닛)에 들어갈
//    수 있는 문자열이 H·M·M 순열뿐이라 바꾸지 않았다. 렌더되는 항목은 Batch17 이다(아래 테스트).
//  - 예금보험공사(depic): 보호한도 1억원(예금자보호법 시행령 제18조제7항, 2025-09-01 시행)이 맞지만 같은
//    폭(10글자·13,083 유닛)의 자연스러운 문구가 없어 바꾸지 않았다.
//
// 제목·meta description·aliases·dartInjection·lastUpdated 는 건드리지 않았다.
//
// 2026-09-30 R8-C 리뷰(사실 렌즈 verdict=fix): '업계 1위'는 공정거래위원회 2026-01-26 심사결과(정책브리핑
// korea.kr newsId=156741347 — 장기·단기 렌터카 모두 1위 롯데렌탈, 2위 SK렌터카)에 비춰 사실이 아니다. 테스트가 이 앞 문장을
// 통째로 고정하지 않도록 뒤 문장(매각 사실)과 폭 서명만 단언한다. 순위 문구 교정(sk-rent·lotte-rental)은 운영자 결정 대기.
// → 2026-10-23 정정 완료(10/9 묶음 독립 검토 C 목록): sk-rent '업계 2위 렌터카.', lotte-rental '국내 1위 …' — 폭이 줄기만 하는
//   문구로 바꿨다(아래 SK_RENT_NEW 주석). 출처는 공개 보도(시사저널·한국공정경쟁연합회 2026-01-26).
import { describe, expect, it } from "vitest";
import { krCompanies_Batch14 } from "@/data/krCompanies_Batch14";
import { krCompanies_Batch17 } from "@/data/krCompanies_Batch17";
import { krCompanies_Batch26 } from "@/data/krCompanies_Batch26";
import { allCompanies } from "@/data/companies";

const SK_RENT_OLD = "업계 1위 법인 렌터카. 모빌리티 전환 시대의 SK 모빌리티 플랫폼.";
const SK_RENT_R8 = "업계 1위 법인 렌터카. 어피니티 인수 이후로 SK 계열에서 분리됨.";
// 2026-10-23 순위 정정(공개 출처): 공정거래위원회 2026-01-26 기업결합 금지 결정 보도 — '국내 렌터카 시장의 1·2위 사업자인
// 롯데렌탈, SK렌터카'(시사저널 https://www.sisajournal.com/news/articleView.html?idxno=360764), '롯데렌탈과 SK렌터카는 각각
// 1·2위 사업자'(한국공정경쟁연합회 https://www.kfcf.or.kr/news/news/read.do?no=3422). 정책브리핑 원문(newsId=156741347)은
// 2026-10-09 기준 '삭제되었거나 조회가 되지 않는 자료'라 위 두 공개 사본을 출처로 남긴다.
// 광고 위 히어로라 단어를 빼기만 했다: '1위 법인'(숫자 1 + 한글 3음절) 자리에 '2위'(숫자 2 + 한글 1음절)만 남는다.
// '2' 는 '1' 보다 304 유닛 넓지만 빠진 '법인'(한글 2음절 3,540 유닛) 보다 좁아, 새 단어마다 옛 단어 하나에 순서대로 대응하고
// 각각 폭이 같거나 좁다(wordcheck dom 통과, 1,123폭 스윕 광고 하향 0). 글자 수도 3자 줄어 글자 간격 합도 줄어든다.
const SK_RENT_NEW = "업계 2위 렌터카. 어피니티 인수 이후로 SK 계열에서 분리됨.";
const LOTTE_RENT_OLD = "국내 2위 렌터카·카셰어링 기업. 롯데그룹 모빌리티 사업의 핵심으로 EV 전환 가속.";
const LOTTE_RENT_NEW = "국내 1위 렌터카·카셰어링 기업. 롯데그룹 모빌리티 사업의 핵심으로 EV 전환 가속.";

const HANGUL = /[가-힣]/;
// 단어별 폭 서명: 한글 음절은 모두 같은 폭(1,770 유닛)이라 'H' 로 접고, 나머지 글자는 그대로 둔다.
const widthSignature = (text: string) =>
  text.split(" ").map((word) => [...word].map((ch) => (HANGUL.test(ch) ? "H" : ch)).join(""));

describe("R8 fix C 회사 히어로 소개문 — SK렌터카 매각 반영", () => {
  it("SK렌터카: 어피니티 인수·SK 계열 분리를 담은 문구가 그대로 노출되고 순위는 2위다", () => {
    const inBatch = krCompanies_Batch14.find((c) => c.id === "sk-rent");
    const merged = allCompanies.find((c) => c.id === "sk-rent");
    for (const description of [inBatch?.description ?? "", merged?.description ?? ""]) {
      expect(description).toBe(SK_RENT_NEW);
      expect(description).not.toContain("1위");
    }
    expect(SK_RENT_NEW).toContain("어피니티");
    expect(SK_RENT_NEW).toContain("SK 계열에서 분리");
    expect(SK_RENT_NEW).not.toContain("SK 모빌리티 플랫폼");
  });

  it("SK렌터카: R8 문구는 옛 문구와 같은 폭 서명이었다(기록)", () => {
    expect(widthSignature(SK_RENT_R8)).toEqual(widthSignature(SK_RENT_OLD));
    expect([...SK_RENT_R8].length).toBe([...SK_RENT_OLD].length);
  });

  it("SK렌터카 순위 정정: R8 문구에서 '법인' 한 단어를 빼고 '1위'를 '2위'로만 바꿨다(뒤 문장 그대로, 글자 수 감소)", () => {
    const r8 = SK_RENT_R8.split(" ");
    const now = SK_RENT_NEW.split(" ");
    expect(now).toEqual([r8[0], "2위", ...r8.slice(3)]);
    expect(r8.slice(1, 3)).toEqual(["1위", "법인"]);
    expect([...SK_RENT_NEW].length).toBe([...SK_RENT_R8].length - 3);
  });

  it("롯데렌탈: 순위를 1위로 정정 — '2'→'1' 한 글자만 바뀌어 같은 글자 수·같은 모양이고 '1' 이 더 좁다", () => {
    const lotte = allCompanies.find((c) => c.id === "lotte-rental");
    expect(lotte?.description).toBe(LOTTE_RENT_NEW);
    expect(LOTTE_RENT_NEW.replace("국내 1위", "국내 2위")).toBe(LOTTE_RENT_OLD);
    expect([...LOTTE_RENT_NEW].length).toBe([...LOTTE_RENT_OLD].length);
  });

  it("SK렌터카: 이름·aliases·lastUpdated 는 그대로다", () => {
    const inBatch = krCompanies_Batch14.find((c) => c.id === "sk-rent");
    expect(inBatch?.name).toEqual({ ko: "SK렌터카", en: "SK Rent-a-Car" });
    expect(inBatch?.aliases).toBeUndefined();
    expect(inBatch?.lastUpdated).toBe("2026-05-15");
  });

  it("다른 회사 소개문에 SK렌터카를 SK 모빌리티 플랫폼으로 부르는 문구가 남아 있지 않다", () => {
    expect(allCompanies.filter((c) => c.description.includes("SK 모빌리티 플랫폼")).map((c) => c.id)).toEqual([]);
  });

  it("한진: id 가 Batch17·Batch26 두 곳에 있고, 렌더되는 항목은 먼저 병합되는 Batch17 이다", () => {
    const b17 = krCompanies_Batch17.find((c) => c.id === "hanjin");
    const b26 = krCompanies_Batch26.find((c) => c.id === "hanjin");
    const merged = allCompanies.filter((c) => c.id === "hanjin");
    expect(b17).toBeDefined();
    expect(b26).toBeDefined();
    expect(merged).toHaveLength(1);
    expect(merged[0]).toBe(b17);
  });
});
