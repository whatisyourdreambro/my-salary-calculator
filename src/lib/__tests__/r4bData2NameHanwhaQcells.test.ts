// 회사명 정정 — 한화큐셀스 -> 한화큐셀 (N2-data-08 2단계, data-b03-F03, 운영자 승인 2026-11-18 C-3,
// 이 커밋 하나로 되돌릴 수 있다)
//
// '한화큐셀스'는 실제로 쓰이는 이름이 아니다. 회사 국문 사이트(qcells.com/kr)는 '한화큐셀', 법인은 2020년 한화솔루션에
// 합병됐다(DART 회사명 검색에는 옛 법인 한화큐셀앤드첨단소재·한화큐셀코리아만 있다). 회사명은 <title>·H1·이동 경로·
// 비교 페이지 제목·관련 회사 카드·업종 목록·메타 설명·JSON-LD 에 나온다 — 한 음절 짧아져 어디서나 종전보다 좁다.
// 회사 <title> 고정본(companyTitles-2026-09-25)과 적용 전 고정본(companyPreGate-bd68d860)은 이 id 의 이름만 바꿨다
// (제목·description 의 이름, 연봉 FAQ sha — 이름을 되돌리면 종전 sha 와 같다는 것을 아래에서 확인한다).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import titleSnapshot from "./fixtures/companyTitles-2026-09-25.json";
import preGateSnapshot from "./fixtures/companyPreGate-bd68d860.json";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { allCompanies } from "@/data/companies";
import { buildCompanySalaryFaq } from "@/lib/companySalaryBasis";

const ID = "hanwha-qcells";
const OLD = "한화큐셀스";
const NEW = "한화큐셀";
/** 정정 전 고정본의 연봉 FAQ sha(bd68d860 출력) — 이름만 되돌리면 이 값과 같아야 한다 */
const PRE_FAQ_SHA_OLD_NAME = "gnMjiC5/FWTvLTyz6cUqrf43ZkFyrpUuA/XKOTgqvBk=";
const sha = (t: string) => createHash("sha256").update(t, "utf8").digest("base64");

afterEach(() => vi.useRealTimers());

describe("N2-data-08 2단계 — hanwha-qcells 회사명 한화큐셀", () => {
  it("name.ko 는 한화큐셀, 영문명·업종·tier·lastUpdated 는 그대로", () => {
    const c = companyRepository.getById(ID)!;
    expect(c.name).toEqual({ ko: NEW, en: "Hanwha Qcells" });
    expect(c.industry).toBe("Solar Energy");
    expect(c.tier).toBe("conglomerate");
    expect(allCompanies.filter((x) => x.id === ID).map((x) => x.lastUpdated)).toEqual(["2026-05-15"]);
    expect(companyRepository.getAll().filter((x) => x.name.ko === NEW).map((x) => x.id)).toEqual([ID]);
  });

  it("옛 표기가 데이터·고정본에 남지 않는다", () => {
    expect(readFileSync("src/data/krCompanies_Batch21.ts", "utf8")).not.toContain(`ko: "${OLD}"`);
    const t = titleSnapshot as Record<string, string>;
    const pre = preGateSnapshot as { descriptions: Record<string, string> };
    expect(t[ID]).toBe("한화큐셀 연봉 2026 — 신입 6,300만원~시니어 1억 1,000만원 직급별 연봉표 | 머니샐러리");
    expect(pre.descriptions[ID].startsWith(`${NEW} 연봉 자체 추정치:`)).toBe(true);
    for (const text of [JSON.stringify(titleSnapshot), JSON.stringify(preGateSnapshot)]) expect(text).not.toContain(OLD);
  });

  it("적용 전 연봉 FAQ 는 이름만 바뀌었다 — 이름을 되돌리면 bd68d860 고정본 sha 와 같다", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T14:59:59.999Z"));
    const json = JSON.stringify(buildCompanySalaryFaq(companyRepository.getById(ID)!));
    expect(json).toContain(NEW);
    expect(sha(json.split(NEW).join(OLD))).toBe(PRE_FAQ_SHA_OLD_NAME);
    expect(sha(json)).toBe((preGateSnapshot as { salaryFaqSha256: Record<string, string> }).salaryFaqSha256[ID]);
  });

  it("사이트 검색이 새 이름·브랜드 줄임으로 찾는다", () => {
    expect(companyRepository.search(NEW).map((c) => c.id)).toContain(ID);
    expect(companyRepository.search("큐셀").map((c) => c.id)).toContain(ID);
    expect(companyRepository.search("qcells").map((c) => c.id)).toContain(ID);
  });

  it("이름이 한 음절 짧다(한글 음절 폭은 모두 같다) — 광고 위 제목·카드 어디서나 종전보다 좁다", () => {
    expect([...NEW].length).toBe([...OLD].length - 1);
    expect(OLD.startsWith(NEW)).toBe(true);
  });
});
