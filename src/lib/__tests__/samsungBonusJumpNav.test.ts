// /calc/samsung-bonus 페이지 안 바로가기 위치 가드 (2026-10-05 운영자 승인 #6, 감사 code6-02)
//
// 9/9(00780026e)·9/19(3de3d6037) 히어로에 넣은 바로가기 줄(버튼 3개)은 모든 광고 위에 있었다.
// 첫 광고(Client 의 평균 결과 HomeTopAd) 아래, 평균 결과 섹션과 '내 연봉으로 계산' 사이로 옮겼다.
// '내 연봉으로 바로 계산'(#my-calc-title)은 바로 다음 섹션이 그 계산기라 뺐고 TAI·OPI 이력 두 개만 남겼다.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) =>
  readFileSync(resolve(process.cwd(), p), "utf8").replace(/\r\n/g, "\n").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
const page = read("src/app/calc/samsung-bonus/page.tsx");
const client = read("src/app/calc/samsung-bonus/Client.tsx");
const NAV = 'aria-label="삼성 성과급 계산기 바로가기"';

describe("삼성 성과급 바로가기는 첫 광고 아래", () => {
  it("히어로(header)에는 바로가기 줄·페이지 안 앵커 링크가 없다", () => {
    const header = page.slice(page.indexOf("<header"), page.indexOf("</header>"));
    expect(header.length).toBeGreaterThan(0);
    expect(header).not.toContain("<nav");
    expect(header).not.toMatch(/href="#/);
    expect(page).not.toContain(NAV);
  });

  it("Client 의 바로가기는 1회, HomeTopAd 와 평균 결과 섹션 뒤·개인 계산기 앞", () => {
    const nav = client.indexOf(NAV);
    expect(nav).toBeGreaterThan(-1);
    expect(client.indexOf(NAV, nav + 1)).toBe(-1);
    const homeTop = client.indexOf("<HomeTopAd />");
    const poolEnd = client.indexOf("</section>", homeTop);
    const mySalary = client.indexOf("<MySalaryCalculator");
    expect(homeTop).toBeGreaterThan(-1);
    expect(nav).toBeGreaterThan(poolEnd);
    expect(mySalary).toBeGreaterThan(nav);
    // 섹션 닫힘과 바로가기 사이에 다른 요소 없음
    expect(client.slice(poolEnd + "</section>".length, client.lastIndexOf("<nav", nav)).trim()).toBe("");
    // 첫 광고 앞(Client 시작 ~ HomeTopAd)에는 바로가기가 없다
    expect(client.slice(0, homeTop)).not.toContain(NAV);
  });

  it("바로가기 대상은 TAI·OPI 이력 두 개이고 도착점 id 가 page.tsx 에 있다", () => {
    const nav = client.slice(client.lastIndexOf("<nav", client.indexOf(NAV)), client.indexOf("</nav>", client.indexOf(NAV)));
    expect([...nav.matchAll(/href="(#[^"]+)"/g)].map((m) => m[1])).toEqual(["#tai-title", "#opi-actual-title"]);
    expect(page).toContain('id="tai-title"');
    expect(page).toContain('id="opi-actual-title"');
  });
});
