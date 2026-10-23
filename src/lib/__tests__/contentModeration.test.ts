import { describe, expect, it } from "vitest";
import { contentIssue } from "@/lib/contentModeration";

describe("bounded input moderation", () => {
  it.each([
    "씨발", "시\u200b발", "ㅅㅣㅂㅏㄹ", "ㅆㅣㅂㅏㄹ", "씨.발", "개 새 끼", "병-신", "죽여버릴 거야", "ＦＵＣＫ",
    "ㅅㅂ", "ㅆㅂ", "ㅂㅅ", "(ㅅ.ㅂ)", "ㅆ ㅂ!", "ㅂ-ㅅ", "ㅅ\u200bㅂ", "ᄉᄇ",
    "시\u00ad발", "씨\u034f발", "시\ufe0f발", "ㅅ\u{e0100}ㅂ",
    "f.u.c.k", "F..U..C..K!", "ｆ．ｕ．ｃ．ｋ", "f u c k", "(s-h-i-t)", "b.i.t.c.h.e.s",
    "f\u200du\ufeffc\u2060k", "f\ufe0fu\u034fc\u00adk",
  ])("blocks a known expression and bounded evasions: %#", value => {
    expect(contentIssue(value)).toBe("CONTENT_NOT_ALLOWED");
  });
  it.each([
    "시발점을 알려 주세요", "시발역 기준입니다", "직계비속 공제와 보험 계산이 틀렸어요",
    "계산이 틀렸어요. 설명이 불친절해요", "이 계산기는 최악이에요. 결과를 고쳐 주세요",
    "성과급 500만원의 공제 설명이 필요해요", "정정 근거 https://example.com/source",
    "개인정보 삭제를 요청합니다. 문제 유형: 모욕 표현. 위치: 두 번째 문단",
    "성·성과급·성실 신고 안내", "보험과 실손보험의 차이가 궁금해요", "직계비속과 직계존속 공제 기준",
    "성과급 산정의 시발점이 무엇인가요?", "계산이 엉망이에요. 이런 설명은 신뢰하기 어렵습니다",
    "초성 목록 ㅅㅂㅅ / ㅂㅅㄱ / ㄱㅅㅂ", "SBS 방송 자료", "assumption and class membership",
    "shiitake mushrooms", "shitake mushrooms", "Scunthorpe salary", "prefixf.u.c.ksuffix identifier",
  ])("allows ordinary criticism, reports, and financial words: %#", value => {
    expect(contentIssue(value)).toBeNull();
  });
  it("does not let an allowed span exempt another blocked expression", () => {
    expect(contentIssue("시발점 설명 씨발")).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue("시발점 설명 ㅅㅂ")).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue("보험 설명 f.u.c.k")).toBe("CONTENT_NOT_ALLOWED");
  });
  it.each([
    "https://example.com", "www.example.com", "example.co.kr", "a@example.com", "010-1234-5678", "900101-1234567",
    "example.dev", "example.xyz/path", "example.app", "sub.example.finance:443/path", "example.dev에서 확인",
    "EXAMPLE.DEV", "ｅｘａｍｐｌｅ．ｄｅｖ", "example\u200b.dev", "example。dev", "example\uff61dev",
    "테스트.한국", "пример.рф", "example.xn--p1ai", "ftp://example.invalid/path", "mailto:a@example.dev", "192.0.2.1/path",
  ])("restricts links/contact details only in opinions: %#", value => {
    expect(contentIssue(value, "opinion")).toBe("PERSONAL_DATA_NOT_ALLOWED");
    expect(contentIssue(value, "contact")).toBeNull();
  });
  it.each([
    "계산이 틀렸어요.설명이 부족합니다", "계산 결과가 3.9%입니다", "2026.10.23 기준인가요?",
    "첨부 자료.pdf 설명을 고쳐 주세요", "계산표.xlsx와 결과가 다릅니다", "v1.2.3 기준 설명이 필요합니다",
    "시발점과 직계비속, 보험 공제 설명이 부족합니다",
  ])("keeps ordinary punctuation and financial feedback available in opinions: %#", value => {
    expect(contentIssue(value, "opinion")).toBeNull();
  });
  it("fails closed on oversize and unsafe formatting, without modifying input", () => {
    expect(contentIssue("가".repeat(201), "opinion")).toBe("INVALID_TEXT");
    expect(contentIssue("a".repeat(501))).toBe("INVALID_TEXT");
    expect(contentIssue("<script>alert(1)</script>")).toBe("INVALID_TEXT");
    expect(contentIssue("a\u202eb")).toBe("INVALID_TEXT");
    const original = "  정상 👩‍💻 설명  ";
    expect(contentIssue(original)).toBeNull();
    expect(original).toBe("  정상 👩‍💻 설명  ");
  });
  it("handles long punctuation and combining-mark inputs with a fixed scan bound", () => {
    expect(contentIssue(".".repeat(500))).toBeNull();
    expect(contentIssue("가" + "\u0301".repeat(499))).toBeNull();
    expect(contentIssue("시" + ".".repeat(498) + "발")).toBeNull();
  });
});
