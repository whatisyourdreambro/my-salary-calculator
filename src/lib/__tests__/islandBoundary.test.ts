// 섬 오류 경계 게이트 (2026-09-25 감사 B3 · CLIENT-01):
//  1) 정상일 때는 DOM 을 추가하지 않는다(children 그대로) — 광고 오프셋 불변.
//  2) 오류 뒤에는 fallback 만 그린다(자리 크기 className 유지, 단독 경로는 전체 로드 <a>).
//  3) 홈에서 감싸는 곳은 월급 시계·대출/적금 계산기(회사 로드맵 차트는 companyRoadmapDefer.test.ts)와
//     승인 #10 A14(2026-09-25)의 CalculatorTabs 섬(ResultAd 포함) — 광고 컴포넌트 자체는 감싸지 않는다.
//  4) A14 대체 화면: 로딩 자리와 같은 min-h 560, 자동 새로고침 없이 사용자가 누르는 새로고침 버튼만.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import IslandBoundary, { IslandFallback, reloadPage } from "@/components/IslandBoundary";
import { retryChunkImport } from "@/lib/chunkReload";

const read = (p: string) => readFileSync(path.resolve(process.cwd(), p), "utf8");

describe("IslandBoundary", () => {
  it("renders children unchanged (no wrapper element)", () => {
    const html = renderToStaticMarkup(
      createElement(IslandBoundary, { name: "t", fallback: createElement("p", null, "fallback") }, createElement("span", { id: "island" }, "ok")),
    );
    expect(html).toBe('<span id="island">ok</span>');
  });

  it("switches to the fallback after an error and only then", () => {
    const fallback = createElement("p", null, "fallback");
    const child = createElement("span", null, "child");
    const boundary = new IslandBoundary({ name: "t", fallback, children: child });
    expect(boundary.render()).toBe(child);
    boundary.state = IslandBoundary.getDerivedStateFromError();
    expect(boundary.state).toEqual({ failed: true });
    expect(boundary.render()).toBe(fallback);
  });

  it("IslandFallback keeps the slot class and links with a full-load anchor", () => {
    const html = renderToStaticMarkup(createElement(IslandFallback, {
      className: "min-h-[560px]", message: "불러오지 못했습니다.", href: "/tools/loan", linkLabel: "대출 이자 계산기 페이지에서 계산하기",
    }));
    expect(html).toContain('class="min-h-[560px]"');
    expect(html).toContain('role="status"');
    expect(html).toContain('<a href="/tools/loan"');
    expect(html).toContain("불러오지 못했습니다.");
  });

  it("IslandFallback without a link renders text only (company chart)", () => {
    const html = renderToStaticMarkup(createElement(IslandFallback, { className: "h-full", message: "차트를 불러오지 못했습니다." }));
    expect(html).not.toContain("<a ");
  });
});

/** 광고 컴포넌트 또는 광고를 품은 트리 */
const AD_COMPONENT = /<(CalcResultAd|InArticleAd|HomeTopAd|GuideMidAd|Display2Ad|CompanyTopAd|MultiplexAd|PageFooterAds|CoupangBanner|AdPlacement|ResultAd|CalculatorTabs)\b/;

/** 각 <IslandBoundary ...>...</IslandBoundary> 블록의 본문을 뽑는다. */
const boundaryBlocks = (src: string) => {
  const blocks: string[] = [];
  for (const m of src.matchAll(/<IslandBoundary\b[\s\S]*?<\/IslandBoundary>/g)) blocks.push(m[0]);
  return blocks;
};

describe("IslandBoundary placement on the home page (ad-safe)", () => {
  const wrapped: Record<string, { island: RegExp; href: string }> = {
    "src/components/home/HomeWorkClockSection.tsx": { island: /<WorkClockClient mode="home" \/>/, href: 'href="/work-clock"' },
    "src/components/home/DeferredHomeCalculator.tsx": { island: /<Component \/>/, href: "href={href}" },
  };

  for (const [file, { island, href }] of Object.entries(wrapped)) {
    it(`${file}: wraps only its island, never an ad`, () => {
      const blocks = boundaryBlocks(read(file));
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatch(island);
      expect(blocks[0]).not.toMatch(AD_COMPONENT);
      expect(blocks[0]).toContain(href);
    });
  }

  it("HomeClient wraps only the CalculatorTabs island (approval #10 A14), never an ad", () => {
    const src = read("src/app/HomeClient.tsx");
    const blocks = boundaryBlocks(src);
    expect(blocks).toHaveLength(1);
    // 경계 안은 동적 CalculatorTabs 하나뿐 — 광고 컴포넌트·다른 섬 없음
    expect(blocks[0]).toMatch(/<DynamicCalculatorTabs \/>/);
    expect(blocks[0]).not.toMatch(AD_COMPONENT);
    expect(blocks[0].match(/<[A-Z][A-Za-z]*/g)).toEqual(["<IslandBoundary", "<IslandFallback", "<DynamicCalculatorTabs"]);
    // 대체 화면은 로딩 자리와 같은 min-h 560 · 새로고침 버튼(사용자 조작) · 단독 링크 없음
    expect(blocks[0]).toContain('reloadLabel="새로고침"');
    expect(blocks[0]).toContain("min-h-[560px] w-full");
    expect(src).toMatch(/const DynamicCalculatorTabs = dynamic\([\s\S]*?loading: \(\) => <div className="flex min-h-\[560px\] w-full/);
    // 본문 JSX 는 그대로: <CalculatorTabs /> 줄 바로 다음이 경계 밖 Display2Ad
    expect(src).toMatch(/\n\s*<CalculatorTabs \/>\r?\n\s*<div className="mx-auto mt-10 max-w-3xl"><Display2Ad \/><\/div>/);
  });

  it("only one boundary on the home calculator tree (CalculatorTabs/SalaryCalculator stay unwrapped inside)", () => {
    for (const file of ["src/components/CalculatorTabs.tsx", "src/components/SalaryCalculator.tsx"]) {
      expect(read(file), file).not.toContain("IslandBoundary");
    }
  });

  it("home calculator loaders retry chunk errors (CalculatorTabs + its 9 tabs)", () => {
    expect(read("src/app/HomeClient.tsx")).toContain('dynamic(() => retryChunkImport(() => import("@/components/CalculatorTabs"))');
    const tabs = read("src/components/CalculatorTabs.tsx");
    expect(tabs.match(/= dynamic\(\(\) => retryChunkImport\(\(\) => import\("@\/components\/[A-Za-z]+"\)\)\);/g)).toHaveLength(9);
    expect(tabs).not.toMatch(/dynamic\(\(\) => import\(/);
  });
});

describe("A14 fallback + recovery path (CalculatorTabs island)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const chunkError = () => Object.assign(new Error("Loading chunk 5858 failed."), { name: "ChunkLoadError" });
  const fallback = createElement(IslandFallback, {
    className: "flex min-h-[560px] w-full items-center justify-center text-center text-sm text-muted-foreground",
    message: "계산기를 불러오지 못했습니다.",
    reloadLabel: "새로고침",
  });

  it("a chunk error that survives the retry flips the boundary to the in-slot fallback and logs it", async () => {
    vi.useFakeTimers();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const loader = vi.fn().mockRejectedValueOnce(chunkError()).mockRejectedValueOnce(chunkError());
    const pending = retryChunkImport(loader).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(1_000);
    const error = await pending;
    expect(loader).toHaveBeenCalledTimes(2);
    // React.lazy 가 이 거부를 렌더 중 던진다 → 가장 가까운 경계(이 섬) 가 잡는다
    const child = createElement("div", { id: "calc" }, "tabs");
    const boundary = new IslandBoundary({ name: "home-calculator-tabs", fallback, children: child });
    expect(boundary.render()).toBe(child);
    boundary.state = IslandBoundary.getDerivedStateFromError();
    boundary.componentDidCatch(error);
    expect(boundary.render()).toBe(fallback);
    expect(log).toHaveBeenCalledWith("[IslandBoundary:home-calculator-tabs]", "ChunkLoadError", "Loading chunk 5858 failed.");
    const html = renderToStaticMarkup(boundary.render() as ReturnType<typeof createElement>);
    expect(html).toContain('class="flex min-h-[560px] w-full items-center justify-center text-center text-sm text-muted-foreground"');
    expect(html).toContain('<button type="button"');
    expect(html).toContain("새로고침</button>");
    expect(html).not.toContain("<a ");
  });

  it("a transient chunk error recovers through the retry without touching the boundary", async () => {
    vi.useFakeTimers();
    const mod = { default: () => null };
    const loader = vi.fn().mockRejectedValueOnce(chunkError()).mockResolvedValueOnce(mod);
    const pending = retryChunkImport(loader);
    await vi.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toBe(mod);
  });

  it("the fallback never reloads by itself; only the button click reloads (once)", () => {
    const reload = vi.fn();
    vi.stubGlobal("window", { location: { reload } });
    renderToStaticMarkup(fallback);
    expect(reload).not.toHaveBeenCalled();
    // 렌더된 트리에서 버튼의 onClick 을 찾아 누른다
    const tree = IslandFallback(fallback.props as Parameters<typeof IslandFallback>[0]);
    const find = (node: unknown): { props: { onClick?: () => void; type?: string } } | null => {
      if (!node || typeof node !== "object") return null;
      if (Array.isArray(node)) { for (const n of node) { const f = find(n); if (f) return f; } return null; }
      const el = node as { type?: unknown; props?: { children?: unknown; onClick?: () => void } };
      if (el.type === "button") return el as { props: { onClick?: () => void; type?: string } };
      return find(el.props?.children);
    };
    const button = find(tree);
    expect(button?.props.type).toBe("button");
    expect(button?.props.onClick).toBe(reloadPage);
    button?.props.onClick?.();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
