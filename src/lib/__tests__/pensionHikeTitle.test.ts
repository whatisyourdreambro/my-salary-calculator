// /calc/pension-hike-2027 제목 연도 충돌 정정 회귀 가드 (2026-10-05 감사 code4-01)
// 공용 buildToolMetadata 의 '{이름} 2026 — {태그라인}' 고정 패턴 때문에 '… 계산기 2026 — 2027년 요율 10%' 가 됐다.
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/calc/pension-hike-2027/Client", () => ({ default: () => null }));

describe("/calc/pension-hike-2027 메타", () => {
  it("title·og:title 에 2026 이 없고 2027 이 있다, 설명·주소·OG 이미지는 그대로", async () => {
    const { metadata } = await import("@/app/calc/pension-hike-2027/page");
    const title = (metadata.title as { absolute: string }).absolute;
    expect(title).toBe("국민연금 인상 계산기 2027 — 요율 10%, 월급에서 얼마나 더 빠지나 | 머니샐러리");
    expect(title).not.toContain("2026");
    expect(metadata.openGraph?.title).toBe(title);
    expect(metadata.alternates?.canonical).toBe("https://www.moneysalary.com/calc/pension-hike-2027");
    const images = metadata.openGraph?.images as { url: string }[];
    expect(images[0].url).toBe(
      `https://www.moneysalary.com/api/og?type=tool&name=${encodeURIComponent("국민연금 인상 계산기")}`
    );
    expect(metadata.description).toContain("2027년 국민연금 보험료율 총 10.0%");
  });
});
