import { describe, expect, it } from "vitest";
import { industriesData } from "@/data/industriesData";
import { regionsData } from "@/data/regionsData";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { getMonthlyNetEstimateManwon } from "@/lib/salaryMetadataEstimate";
import { generateMetadata as industryMetadata } from "@/app/industry/[slug]/page";
import { generateMetadata as regionMetadata } from "@/app/region/[slug]/page";

const entries = [
  ...industriesData.map((entry) => ({ kind: "industry", entry, metadata: industryMetadata })),
  ...regionsData.map((entry) => ({ kind: "region", entry, metadata: regionMetadata })),
];

describe("산업·지역 검색 설명과 연결된 연봉 계산의 정합성", () => {
  it.each(entries)("$kind/$entry.id: 동일 기본 조건의 세후 추정과 canonical을 제공한다", async ({ kind, entry, metadata }) => {
    const result = await metadata({ params: Promise.resolve({ slug: entry.id }) });
    // /salary/[amount] 기본값: 비과세 월 20만원, 본인 포함 부양가족 1명, 자녀 0명.
    const monthlyNet = Math.round(calculateSalary2026(entry.salary.overall * 10_000, 200_000, 1, 0).netPay / 10_000);
    expect(result.description).toContain(`월 실수령 추정 ${monthlyNet}만원`);
    expect(result.description).toContain("추정 평균 연봉");
    expect(result.description).toContain("본인 1명·자녀 0명·비과세 월 20만원 가정");
    expect(result.alternates?.canonical).toBe(`https://www.moneysalary.com/${kind}/${entry.id}`);
    expect(result.openGraph?.description).toBe(result.description);
    expect(result.twitter?.description).toBe(result.description);
    expect(result.title).toMatchObject({ absolute: expect.stringContaining("추정") });
  });

  it.each([
    [3_400, 253],
    [8_000, 537],
    [13_000, 807],
  ])("연봉 %i만원은 고정 83%% 공제율로 되돌아가지 않는다", (annualManwon, expectedMonthlyManwon) => {
    expect(getMonthlyNetEstimateManwon(annualManwon)).toBe(expectedMonthlyManwon);
    expect(getMonthlyNetEstimateManwon(annualManwon)).not.toBe(Math.round(annualManwon / 12 * 0.83));
  });
});
