// R4 CONTENT2 (2026-11-18) N2-data-01 / data-b05-F02 — 전세사기 Q&A 의 대항력 시점.
// 주택임대차보호법 제3조 제1항: 대항력은 주택 인도 + 주민등록(전입신고)을 마친 다음 날부터.
// 확정일자는 대항요건에 더해 우선변제권(제3조의2 제2항)을 준다 — '확정일자부터 대항력'은 틀린 문장.
// 이 줄은 /qna/[slug] 에서 GuideMidAd 와 InArticleAd 사이에 그려지므로 옛 줄(태그 뺀 55자)보다 길어지면 안 된다.
import { describe, expect, it } from "vitest";
import { qnaData } from "@/data/qnaData";

const QUESTION = "전세 계약 시 전세사기를 피하려면 어떻게 확인해야 하나요?";
const OLD_LINE_TEXT_LENGTH = 55; // '확정일자 + 전입신고: 입주 당일 주민센터 방문. 확정일자부터 대항력이 생기므로 반드시 당일 처리.'

const strip = (html: string) => html.replace(/<[^>]+>/g, "");

describe("N2-data-01 전세사기 Q&A — 대항력은 전입 다음 날", () => {
  const item = qnaData.find((q) => q.question === QUESTION);

  it("item exists", () => {
    expect(item).toBeDefined();
  });

  it("states that 대항력 starts the day after 전입, not from 확정일자", () => {
    const details = item!.answer.details.join("\n");
    expect(details).not.toContain("확정일자부터 대항력");
    expect(details).toContain("대항력은 전입 다음 날");
  });

  it("the corrected line is not longer than the old one (above InArticleAd)", () => {
    const line = item!.answer.details.find((d) => d.includes("<strong>확정일자 + 전입신고:</strong>"));
    expect(line).toBeDefined();
    expect(strip(line!).length).toBeLessThanOrEqual(OLD_LINE_TEXT_LENGTH);
  });
});
