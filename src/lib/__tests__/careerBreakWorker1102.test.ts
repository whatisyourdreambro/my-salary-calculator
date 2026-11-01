// 중소기업 취업자 감면 대상 용어 정정 회귀 가드 (2026-11-02 OF1 T3 — 검증자·반박자가 공식 근거로 확인)
//
// 조세특례제한법 제30조제1항(2025.3.14 개정, 법률 제20778호): 감면 대상 '경력단절 여성' → '제29조의8제2항에 따른
// 경력단절 근로자'(성별 무관 — 1년 이상 근무 뒤 결혼·임신·출산·육아·자녀교육·가족돌봄 등으로 퇴직, 퇴직 후 2년 이상
// 15년 미만). 부칙 제7조: 이 법 시행(공포일 2025-03-14) 이후 취업해 받는 소득부터 적용 — 그 전 취업자는 종전
// '경력단절 여성' 요건. 감면율 70%·3년·과세기간별 200만원은 그대로다.
// - 광고 위 표기(Client 선택지·청년 요건 판정 문구, page 감면율 목록)는 한 글자 짧은 '경력단절자'(법정 용어
//   '경력단절 근로자'는 원문보다 길어 광고 위에 쓰지 않는다).
// - 2025-03-14 전 취업자 구분 문장은 접힌 FAQ 1(닫힌 details, 기본 화면 높이 0)에만 둔다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SMB_BREAK_RULES } from "@/lib/smbTaxBreak";

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
