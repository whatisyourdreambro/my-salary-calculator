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
  it.each([
    "조정", "연봉 조정 관련 문의입니다", "임금 조정률이 틀렸어요", "조직 개편 후 연봉 정보가 달라요", "구조조정 이후 성과급 계산",
    "제휴 조건 조정 문의드립니다", "광고 단가 조정 제안드립니다", "보조지원금 기준", "조절·조작·조짐", "조종사 연봉",
    "작년 공시 발표 기준과 다릅니다", "최저임금 고시 발표 내용과 달라요", "원천징수영수증 다시 발급 받았는데 금액이 달라요",
    "즉시 발송 부탁드립니다", "오류 표시 발생합니다", "표시 바랍니다", "공시·발표 자료", "다시 발급",
    "화면이 꺼져요", "계산 중에 앱이 자꾸 꺼져서 결과를 못 봤어요", "닥쳐올 연말정산", "질병 신고", "질병신고 관련 설명", "성과급 1조 지급", "몇 조 정도", "김씨 발언",
  ])("does not match across syllable or word boundaries in ordinary text: %#", value => {
    expect(contentIssue(value)).toBeNull();
    expect(contentIssue(value, "opinion")).toBeNull();
  });
  it.each([
    "좆", "ㅈㅗㅈ", "조ㅈ", "ㅅ.ㅣ.ㅂ.ㅏ.ㄹ", "씨 발", "아 씨.발", "이 병신아", "개새끼야", "병신같은 계산기",
    "꺼져", "꺼져!", "그냥 꺼져", "꺼져라", "닥쳐", "닥쳐라", "죽여버린다", "죽여버림", "죽여 버린다",
  ])("still blocks whole-syllable, spaced-token and standalone imperative forms: %#", value => {
    expect(contentIssue(value)).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue(value, "opinion")).toBe("CONTENT_NOT_ALLOWED");
  });
  it.each([
    "계산 시 발생하는 차이", "신청 시 발급되는 서류", "공시 발표 후", "메일 발송 시 발생", "연말정산 시 발생한 환급",
    "계산 시 발생하는 오류가 있어요", "퇴사 시 발급되는 서류", "해지 시 발생하는 수수료", "필요 시 발급 가능",
    "계산시발생", "계산 시발생하는 차이", "다시발급", "즉시발송", "계산 시  발생", "계산 시\n발생하는 오류",
    "인사 이동 시 발령일", "변경 시 발표 자료", "증명서 신청 시 발행 번호", "확인 시 발견된 오류", "이직 시 발전 가능성",
    "계약 체결 시 발효되는 조항", "주문 시 발주 확인", "책 출간 시 발간 비용", "특허 출원 시 발명자 보상", "성장 시 발달 단계",
    "회의 시 발언 내용", "법안 제출 시 발의 요건", "승진 시 발탁 기준", "업무상 재해 시 발병 신고", "출시 시 발매일",
    "운동 시 발목 부상", "훈련 시 발사 횟수", "법인 설립 시 발족식", "감사 시 발각된 오류", "조사 시 발굴된 자료", "필요 시 발휘되는 역량",
  ])("allows 시 (when) before a common 발- word: %#", value => {
    expect(contentIssue(value)).toBeNull();
    expect(contentIssue(value, "opinion")).toBeNull();
  });
  it.each([
    "시발", "씨발", "ㅅㅂ", "시 발", "시.발", "시발!", "아 시발", "시발아", "시발놈", "시발 계산기",
    "시발 생각", "시발 발생", "시 발 생", "시발병신", "씨 발생", "씨발생", "시 발로 차",
  ])("still blocks 시발 and 씨발 unless 시 comes right before a listed 발- word: %#", value => {
    expect(contentIssue(value)).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue(value, "opinion")).toBe("CONTENT_NOT_ALLOWED");
  });
  it("does not let an allowed span exempt another blocked expression", () => {
    expect(contentIssue("질병신고 설명 병신")).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue("시발점 설명 씨발")).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue("시발점 설명 ㅅㅂ")).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue("보험 설명 f.u.c.k")).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue("계산 시 발생 씨발")).toBe("CONTENT_NOT_ALLOWED");
    expect(contentIssue("신청 시 발급 ㅅㅂ")).toBe("CONTENT_NOT_ALLOWED");
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
