// src/lib/__tests__/datasetLd.test.ts
//
// datasetLd 옵션 확장 회귀 가드 (2026-09-05, google-authority-8):
// citation → CreativeWork, isBasedOn, distribution → DataDownload[], license, temporalCoverage.
// 옵션이 없으면 해당 키가 출력에 없어야 한다(기존 20곳 호출부 출력 불변).
import { describe, expect, it } from "vitest";

import { datasetLd } from "@/lib/structuredData";

const base = {
  name: "테스트 데이터셋",
  description: "설명",
  url: "/salary-db/test",
  dateModified: "2026-07-06",
};

describe("datasetLd 옵션 확장", () => {
  it("옵션 미전달 시 citation/isBasedOn/distribution/license/temporalCoverage 키가 없다", () => {
    const ld = datasetLd(base) as Record<string, unknown>;
    for (const key of ["citation", "isBasedOn", "distribution", "license", "temporalCoverage"]) {
      expect(ld).not.toHaveProperty(key);
    }
    expect(ld.url).toBe("https://www.moneysalary.com/salary-db/test");
    expect(ld.dateModified).toBe(new Date("2026-07-06").toISOString());
  });

  it("citation 은 CreativeWork {name,url}, isBasedOn 은 문자열 그대로", () => {
    const url = "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260312000744";
    const ld = datasetLd({
      ...base,
      citation: { name: "금융감독원 DART 사업보고서", url },
      isBasedOn: url,
    }) as Record<string, unknown>;
    expect(ld.citation).toEqual({
      "@type": "CreativeWork",
      name: "금융감독원 DART 사업보고서",
      url,
    });
    expect(ld.isBasedOn).toBe(url);
  });

  it("distribution 은 DataDownload[] 로, 상대 contentUrl 은 절대 URL 로 보정", () => {
    const ld = datasetLd({
      ...base,
      distribution: [
        { encodingFormat: "text/csv", contentUrl: "/api/test.csv" },
        { encodingFormat: "application/json", contentUrl: "https://www.moneysalary.com/api/test.json" },
      ],
      license: "https://creativecommons.org/licenses/by/4.0/",
      temporalCoverage: "2025",
    }) as Record<string, unknown>;
    expect(ld.distribution).toEqual([
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: "https://www.moneysalary.com/api/test.csv",
      },
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: "https://www.moneysalary.com/api/test.json",
      },
    ]);
    expect(ld.license).toBe("https://creativecommons.org/licenses/by/4.0/");
    expect(ld.temporalCoverage).toBe("2025");
  });

  it("빈 distribution 배열은 키를 만들지 않는다", () => {
    const ld = datasetLd({ ...base, distribution: [] }) as Record<string, unknown>;
    expect(ld).not.toHaveProperty("distribution");
  });
});
