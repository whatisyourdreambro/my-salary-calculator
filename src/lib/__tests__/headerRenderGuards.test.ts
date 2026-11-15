// 2026-11-15 N2-perf-01 (lens-perf-F01) — 헤더 재렌더 가드.
// Pages 정적 빌드(NEXT_PUBLIC_PAGES_STATIC_EXPORT="1")는 deferPanels 가 상수 false 라 isHydrated 를 읽지 않는다.
// 그 빌드에서 하이드레이션 직후 isHydrated 를 뒤집으면 Header 와 데스크톱 메가메뉴 패널 7개를 한 번 더 그리므로
// 플립을 그 빌드에서만 건너뛰고, DesktopDropdown 은 memo 로 감싸 스크롤·모바일 메뉴 리렌더 때 다시 그리지 않는다.
// 저장소에 jsdom 이 없어(vitest node 환경) 렌더 횟수 대신 소스를 확인한다. 화면·HTML 은 바뀌지 않는다
// (edgeRenderedPaths.test.ts 의 renderToStaticMarkup 검사가 SSR 결과를 지킨다).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8").replace(/\r\n/g, "\n");
const HEADER = read("src/components/Header.tsx");
const DROPDOWN = read("src/components/header/DesktopDropdown.tsx");

describe("Header: Pages 정적 빌드에서 하이드레이션 직후 재렌더 없음", () => {
  it("isHydrated 플립은 Pages 정적 빌드가 아닐 때만 실행된다", () => {
    expect(HEADER).toContain(
      'useEffect(() => { if (process.env.NEXT_PUBLIC_PAGES_STATIC_EXPORT !== "1") setIsHydrated(true); }, []);',
    );
    expect(HEADER).not.toMatch(/useEffect\(\(\)\s*=>\s*\{\s*setIsHydrated\(true\);?\s*\},\s*\[\]\)/);
    expect(HEADER.match(/setIsHydrated\(/g)).toHaveLength(1);
  });

  it("deferPanels 는 Pages 정적 빌드에서 상수 false 로 남는다 (isHydrated 를 읽는 곳은 여기 하나)", () => {
    expect(HEADER).toContain(
      'const deferPanels = process.env.NEXT_PUBLIC_PAGES_STATIC_EXPORT !== "1" && isEdgeRenderedPath(pathname) && !isHydrated;',
    );
    const code = HEADER.replace(/^\s*\/\/.*$/gm, "");
    expect(code.match(/\bisHydrated\b/g)).toHaveLength(2); // 선언 1 + deferPanels 1 (주석 줄 제외)
  });
});

describe("DesktopDropdown: memo 로 감싸 Header 리렌더 때 패널을 다시 그리지 않는다", () => {
  it("react 에서 memo 를 가져오고 파일 끝에서 memo(DesktopDropdown) 을 기본 내보내기 한다", () => {
    expect(DROPDOWN).toMatch(/import \{[^}]*\bmemo\b[^}]*\} from "react";/);
    expect(DROPDOWN.trimEnd().endsWith("export default memo(DesktopDropdown);")).toBe(true);
    expect(DROPDOWN).not.toContain("export default function DesktopDropdown");
    expect(DROPDOWN).toContain("function DesktopDropdown({ item, pathname, locale = \"ko\", deferPanel = false }: DesktopDropdownProps)");
  });

  it("Header 는 DesktopDropdown 에 item·pathname·locale·deferPanel 만 넘긴다 (인라인 함수·객체 prop 은 memo 를 무력화)", () => {
    const usage = /<DesktopDropdown\b([\s\S]*?)\/>/.exec(HEADER);
    expect(usage, "Header.tsx 의 <DesktopDropdown ... />").not.toBeNull();
    const props = [...usage![1].matchAll(/(\w+)=/g)].map((m) => m[1]);
    expect(props).toEqual(["key", "item", "pathname", "locale", "deferPanel"]);
    expect(usage![1]).not.toMatch(/=>|=\{\{/);
    expect(usage![1]).toContain("item={item}");
    expect(usage![1]).toContain("pathname={pathname}");
    expect(usage![1]).toContain('locale={isEn ? "en" : "ko"}');
    expect(usage![1]).toContain("deferPanel={deferPanels}");
  });

  it("item 은 모듈 상수 배열에서 온다 (렌더마다 새로 만들지 않음)", () => {
    expect(read("src/components/header/navConfig.ts")).toMatch(/^export const navConfig: NavItem\[\] = \[/m);
    expect(read("src/components/header/navConfigEn.ts")).toMatch(/^export const navConfigEn: NavItem\[\] = /m);
    expect(HEADER).toContain("const activeNavConfig = isEn ? navConfigEn : navConfig;");
  });
});
