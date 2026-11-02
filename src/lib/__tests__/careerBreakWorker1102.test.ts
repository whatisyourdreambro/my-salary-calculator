// 중소기업 취업자 감면 대상 용어 정정 회귀 가드 (2026-11-02 OF1 T3 — 검증자·반박자가 공식 근거로 확인)
//
// 조세특례제한법 제30조제1항(2025.3.14 개정, 법률 제20778호): 감면 대상 '경력단절 여성' → '제29조의8제2항에 따른
// 경력단절 근로자'(성별 무관 — 1년 이상 근무 뒤 결혼·임신·출산·육아·자녀교육·가족돌봄 등으로 퇴직, 퇴직 후 2년 이상
// 15년 미만). 부칙 제7조: 이 법 시행(공포일 2025-03-14) 이후 취업해 받는 소득부터 적용 — 그 전 취업자는 종전
// '경력단절 여성' 요건. 감면율 70%·3년·과세기간별 200만원은 그대로다.
// - 광고 위 표기(Client 선택지·청년 요건 판정 문구, page 감면율 목록)는 한 글자 짧은 '경력단절자'(법정 용어
//   '경력단절 근로자'는 원문보다 길어 광고 위에 쓰지 않는다).
// - 2025-03-14 전 취업자 구분 문장은 접힌 FAQ 1(닫힌 details, 기본 화면 높이 0)에만 둔다.
//
// 2026-11-02 FF-2(최종 사실 반박자, 조특법 §30① 시행 2026.9.18 재확인): 계산기 밖 두 화면이 '60세 이상도 5년간 70~90%'로
// 틀렸고 장애인·경력단절자가 빠져 있었다 — 감면 기간·율은 청년 5년 90%, 그 외(60세 이상·장애인·경력단절 근로자) 3년 70%.
// - /income-tax-2026 절세 핵심 5가지(InArticleAd 위): '청년 5년 90%, 60세 이상·장애인·경력단절자 3년 70%'(더 짧음, 뒤 '감면'은
//   굵은 제목에 이미 있어 뺐다).
// - /guides/career-gap-rehire-benefit-2026 ③(H2 1개 글 — 본문 전체가 GuideMidAd 와 본문 끝 InArticleAd 사이): 글 주제에 맞춰
//   '경력단절자 3년 70%(청년 5년 90%)'. 60세 이상을 넣으면 378~410px 에서 줄이 는다(정적 글꼴 모델) — 넣지 않는다.
// - 두 가이드 모두 modifiedDate·정정일 표(guideContentRevisions)를 달지 않는다 — 히어로 '수정' 칩이 광고 위에 새로 생긴다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SMB_BREAK_RULES } from "@/lib/smbTaxBreak";
import { koGuides } from "@/lib/guidesContent";
import { getGuideContentDate } from "@/lib/guideContentRevisions";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const page = readSrc("src/app/calc/smb-income-tax-break/page.tsx");
const client = readSrc("src/app/calc/smb-income-tax-break/Client.tsx");
const lib = readSrc("src/lib/smbTaxBreak.ts");

describe("중소기업 취업자 감면 — 경력단절 근로자 (조특법 §30①, 2025-03-14 이후 취업분)", () => {
  it("계산기 화면·메타·주석에 옛 '경력단절여성' 표기가 없다", () => {
    for (const [file, src] of Object.entries({ page, client, lib })) {
      expect({ file, found: src.includes("경력단절여성") }).toEqual({ file, found: false });
    }
  });

  it("광고 위 표기와 메타 설명은 '경력단절자'", () => {
    expect(client).toContain('<option value="other">60세 이상·장애인·경력단절자 — 70% · 3년</option>');
    expect(client).toContain("청년 요건 미충족 (60세 이상·장애인·경력단절자 해당 여부 확인)");
    expect(page).toContain("<li>60세 이상·장애인·경력단절자: <strong>감면율 70% · 3년</strong></li>");
    expect(page).toContain("청년 90%·5년, 60세 이상·장애인·경력단절자 70%·3년, 한도 200만원.");
    expect(SMB_BREAK_RULES.other).toEqual({ rate: 0.7, years: 3, label: "60세 이상·장애인·경력단절자" });
  });

  it("2025-03-14 전 취업자 구분 문장은 접힌 FAQ 1 답변에만 있다", () => {
    expect(page).toContain(
      "60세 이상, 장애인, 경력단절자가 대상입니다. 경력단절자는 2025년 3월 14일 이후 취업분부터 남성도 포함되며, 그 전에 취업했다면 종전 경력단절 여성 요건이 적용됩니다. 감면율은 청년 90%, 그 외 70%이며",
    );
    expect(page.split("2025년 3월 14일")).toHaveLength(2);
    expect(client).not.toContain("2025년 3월 14일");
  });
});

describe("계산기 밖 감면 설명 — 청년 5년 90%, 60세 이상·장애인·경력단절자 3년 70% (FF-2)", () => {
  const incomeTax = readSrc("src/app/income-tax-2026/page.tsx");
  const careerGap = koGuides.find((g) => g.slug === "career-gap-rehire-benefit-2026");

  it("/income-tax-2026 절세 핵심 5가지 — 60세 이상에 5년을 주지 않고 장애인·경력단절자를 넣는다", () => {
    expect(incomeTax).toContain("<li><strong>중소기업 취업자 감면</strong>: 청년 5년 90%, 60세 이상·장애인·경력단절자 3년 70%</li>");
    expect(incomeTax).not.toContain("60세 이상, 청년·고령자");
    expect(incomeTax).not.toContain("5년간 70~90%");
  });

  it("경력단절 재취업 가이드 ③ — 경력단절자 3년 70%(청년 5년 90%), 광고 분할·읽기 시간·날짜 칩 그대로", () => {
    expect(careerGap).toBeDefined();
    const html = careerGap!.content;
    expect(html).toContain("<li><strong>③ 중소기업 취업자 감면</strong>: 경력단절자 3년 70%(청년 5년 90%)</li>");
    expect(html).not.toContain("60세 이상 5년간");
    expect(html).not.toContain("70~90%");
    // 리드의 '소득세 70% 감면'과 같은 값이어야 한다.
    expect(html).toContain("중소기업 취업 시 소득세 70% 감면");
    // H2 1개(분할 없음)·읽기 1분(히어로 'N분 분량', 광고 위)·히어로 수정 칩 없음.
    expect(html.match(/<h2[\s>]/gi)).toHaveLength(1);
    expect(Math.ceil(html.length / 1000)).toBe(1);
    expect(careerGap!.modifiedDate).toBeUndefined();
    expect(getGuideContentDate(careerGap!)).toBe(careerGap!.publishedDate);
  });
});

// FF-2 추가(사실 재검증의 src 전수 grep): 청년 = 근로계약 체결일 현재 15~34세, 군 복무 기간(최대 6년)을 빼고 나이를 센다
// (국세청 중소기업 취업자 소득세 감면 안내) → 가장 많은 나이는 만 40세. 사이트의 qnaData 도 이미 최대 만 40세다.
// 같은 글자 수 숫자만 바꾼다(39→40, 정적 글꼴 모델로 0.19px 좁음). '최대 만 40세'는 345~372px 등에서 줄이 늘어 쓰지 않는다.
describe("청년 지원 정책 가이드 — 중소기업 취업 청년 감면 대상 최대 40세 (FF-2 추가)", () => {
  const youth = koGuides.find((g) => g.slug === "youth-benefits-2026");

  it("최대 39세 → 최대 40세, 광고 분할·읽기 시간·날짜 칩 그대로", () => {
    expect(youth).toBeDefined();
    const html = youth!.content;
    expect(html).toContain("<li><strong>대상:</strong> 만 15~34세 (군 복무 기간 차감, 최대 40세), 중소기업 취업자</li>");
    expect(html).not.toContain("최대 39세");
    // 본문 길이 그대로(3,003자 — 4,000자 미만 2분할, 읽기 4분)·히어로 수정 칩 없음.
    expect(html.length).toBeLessThan(4000);
    expect(Math.ceil(html.length / 1000)).toBe(4);
    expect(youth!.modifiedDate).toBeUndefined();
    expect(getGuideContentDate(youth!)).toBe(youth!.publishedDate);
  });
});
