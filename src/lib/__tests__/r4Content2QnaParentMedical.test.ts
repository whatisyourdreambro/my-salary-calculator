// R4 CONTENT2 (2026-11-18) N2-data-01 / data-b05-M01 — 부모님 의료비 Q&A 의 '핵심 조건'.
// 소득세법 제59조의4 제2항: 의료비는 '기본공제대상자(나이 및 소득의 제한을 받지 아니한다)'를 위해 지급한 것.
// 소득이 있거나 60세 미만이라 기본공제를 못 받는 부모님도 생계를 같이하면(제53조 제3항: 주거 형편상 별거한
// 직계존속 포함) 대상이다 — '기본공제 대상자로 등록되어 있어야' 는 바로 윗줄과 모순되는 틀린 조건이었다.
// 이 줄은 /qna/[slug] 에서 GuideMidAd 와 InArticleAd 사이에 그려지므로 옛 줄(태그 뺀 77자)보다 길어지면 안 된다.
import { describe, expect, it } from "vitest";
import { qnaData } from "@/data/qnaData";

const QUESTION = "부모님 의료비를 제가 결제했는데 의료비 세액공제 받을 수 있나요?";
const OLD_LINE_TEXT_LENGTH = 77;

const strip = (html: string) => html.replace(/<[^>]+>/g, "");

describe("N2-data-01 부모님 의료비 Q&A — 기본공제를 못 받는 부모님도 의료비 공제", () => {
  const item = qnaData.find((q) => q.question === QUESTION);

  it("item exists", () => {
    expect(item).toBeDefined();
  });

  it("no longer requires the parent to be registered as 기본공제 대상자", () => {
    const details = item!.answer.details.join("\n");
    expect(details).not.toContain("등록되어 있어야 합니다");
    expect(details).toContain("기본공제를 못 받는 부모님도");
  });

  it("keeps the sibling rule in its own line", () => {
    const details = item!.answer.details.join("\n");
    expect(details).toContain("부양과 의료비 공제자는 일치해야 합니다");
  });

  it("the corrected line is not longer than the old one (above InArticleAd)", () => {
    const line = item!.answer.details.find((d) => d.includes("<strong>핵심 조건:</strong>"));
    expect(line).toBeDefined();
    expect(strip(line!).length).toBeLessThanOrEqual(OLD_LINE_TEXT_LENGTH);
  });
});
