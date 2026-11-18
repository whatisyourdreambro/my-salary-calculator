// 회사명 정정 — 롯데글로벌로지스틱스 -> 롯데글로벌로지스 (N2-data-08 2단계, data-b03-F03, 운영자 승인 2026-11-18 C-3,
// 이 커밋 하나로 되돌릴 수 있다)
//
// DART 회사명과 회사 사이트(lotteglogis.com, LOTTE GLOBAL LOGISTICS CO,.LTD) 표기는 '롯데글로벌로지스'다.
// 회사명은 <title>·H1·이동 경로·비교 페이지 제목·관련 회사 카드·업종 목록·메타 설명·JSON-LD 에 나온다 — 두 음절 짧아져
// 어디서나 종전보다 좁다(새 이름이 옛 표기의 앞부분이다). 회사 <title> 고정본과 적용 전 고정본은 이 id 의 이름만 바꿨다.
// 검색 전용 통칭 '롯데택배'는 별도 커밋(r4bData2LotteAlias.test.ts)이 고정한다.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import titleSnapshot from "./fixtures/companyTitles-2026-09-25.json";
import preGateSnapshot from "./fixtures/companyPreGate-bd68d860.json";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { allCompanies } from "@/data/companies";
import { buildCompanySalaryFaq } from "@/lib/companySalaryBasis";

const ID = "lotte-global-logistics";
const OLD = "롯데글로벌로지스틱스";
const NEW = "롯데글로벌로지스";
/** 정정 전 고정본의 연봉 FAQ sha(bd68d860 출력) — 이름만 되돌리면 이 값과 같아야 한다 */
const PRE_FAQ_SHA_OLD_NAME = "mCJVdaXBjj6GA1Fetsk9uLGHzp+tRMy54hjSnH3NtNo=";
const sha = (t: string) => createHash("sha256").update(t, "utf8").digest("base64");

afterEach(() => vi.useRealTimers());

describe("N2-data-08 2단계 — lotte-global-logistics 회사명 롯데글로벌로지스", () => {
  it("name.ko 는 롯데글로벌로지스, 영문명·업종·tier·lastUpdated 는 그대로", () => {
    const c = companyRepository.getById(ID)!;
    expect(c.name).toEqual({ ko: NEW, en: "Lotte Global Logistics" });
    expect(c.industry).toBe("Logistics");
    expect(c.tier).toBe("conglomerate");
    expect(allCompanies.filter((x) => x.id === ID).map((x) => x.lastUpdated)).toEqual(["2026-05-15"]);
    expect(companyRepository.getAll().filter((x) => x.name.ko === NEW).map((x) => x.id)).toEqual([ID]);
  });

  it("옛 표기가 데이터·고정본에 남지 않는다", () => {
    expect(readFileSync("src/data/krCompanies_Batch20.ts", "utf8")).not.toContain(`ko: "${OLD}"`);
    const t = titleSnapshot as Record<string, string>;
    const pre = preGateSnapshot as { descriptions: Record<string, string> };
    expect(t[ID]).toBe("롯데글로벌로지스 연봉 2026 — 신입 4,800만원~시니어 7,900만원 직급별 연봉표 | 머니샐러리");
    expect(pre.descriptions[ID].startsWith(`${NEW} 연봉 자체 추정치:`)).toBe(true);
    for (const text of [JSON.stringify(titleSnapshot), JSON.stringify(preGateSnapshot)]) expect(text).not.toContain(OLD);
  });

  it("적용 전 연봉 FAQ 는 이름만 바뀌었다 — 이름을 되돌리면 bd68d860 고정본 sha 와 같다", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T14:59:59.999Z"));
    const json = JSON.stringify(buildCompanySalaryFaq(companyRepository.getById(ID)!));
    expect(json).toContain(NEW);
    expect(json).not.toContain(OLD);
    expect(sha(json.split(NEW).join(OLD))).toBe(PRE_FAQ_SHA_OLD_NAME);
    expect(sha(json)).toBe((preGateSnapshot as { salaryFaqSha256: Record<string, string> }).salaryFaqSha256[ID]);
  });

  it("사이트 검색이 새 이름·줄임으로 찾는다", () => {
    expect(companyRepository.search(NEW).map((c) => c.id)).toContain(ID);
    expect(companyRepository.search("롯데글로벌").map((c) => c.id)).toContain(ID);
  });

  it("새 이름은 옛 표기의 앞부분 — 두 음절 짧아 광고 위 제목·카드 어디서나 종전보다 좁다", () => {
    expect(OLD.startsWith(NEW)).toBe(true);
    expect([...NEW].length).toBe([...OLD].length - 2);
  });
});
