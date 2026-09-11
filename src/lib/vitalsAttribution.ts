// src/lib/vitalsAttribution.ts
//
// 계측 순수 헬퍼 — S1-6 (2026-09-11). DOM·window 에 의존하지 않는 함수만 둔다(vitest 에 jsdom 없음).
//
// 1) viewportBucket: ad_filled/ad_unfilled 의 뷰포트 폭 버킷(m/t/d). 슬롯·뷰포트별 예약 높이 자료용(ADS-05).
// 2) shouldSampleAttribution: web_vitals 귀속 필드 20% 샘플 — 페이지 로드당 1회, 난수를 인자로 받아 결정.
// 3) describeNode: LCP 요소·CLS 최대 이동 대상 노드를 짧은 선택자 문자열로. 개인정보 원칙 —
//    태그명 + #id + 클래스 토큰 ≤2, 80자 상한. 텍스트·id/class 외 속성값은 절대 읽지 않는다(PERF-08).
// 4) largestShiftSource: layout-shift 항목들 중 hadRecentInput 이 아닌 최대 단일 이동과 그 최대 면적 source 노드.

export type ViewportBucket = "m" | "t" | "d";

export const ATTRIBUTION_SAMPLE_RATE = 0.2;
export const SELECTOR_MAX_LENGTH = 80;

const ID_MAX_LENGTH = 32;
const CLASS_MAX_LENGTH = 24;
const CLASS_MAX_COUNT = 2;
const PARENT_HOPS_MAX = 3;
/** 선택자에 실을 수 있는 토큰 — 문자·숫자·_·- 만. Radix 의 `radix-:r0:`·Tailwind 임의값 `text-[…]`·`w-1/2` 는 생략된다. */
const SAFE_TOKEN = /^[A-Za-z0-9_-]+$/;

/** 뷰포트 폭 버킷 — m: <768, t: <1024, d: 그 외. 유효하지 않은 폭은 undefined(필드 생략). */
export function viewportBucket(width: unknown): ViewportBucket | undefined {
  if (typeof width !== "number" || !Number.isFinite(width) || width <= 0) return undefined;
  if (width < 768) return "m";
  if (width < 1024) return "t";
  return "d";
}

/** random ∈ [0,1) 이 rate 미만이면 귀속 필드를 보낸다. 난수·비율이 이상하면 보내지 않는다(fail-closed). */
export function shouldSampleAttribution(random: unknown, rate: number = ATTRIBUTION_SAMPLE_RATE): boolean {
  if (typeof random !== "number" || !Number.isFinite(random) || random < 0 || random >= 1) return false;
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) return false;
  return random < Math.min(rate, 1);
}

/** DOM Node/Element 의 덕타입 — 테스트는 평범한 객체로 만든다. */
export type SelectorNode = {
  nodeType?: unknown;
  tagName?: unknown;
  id?: unknown;
  className?: unknown;
  getAttribute?: (name: string) => string | null;
  parentElement?: SelectorNode | null;
};

const ELEMENT_NODE = 1;

function resolveElement(node: unknown): SelectorNode | null {
  let current: unknown = node;
  for (let hop = 0; hop <= PARENT_HOPS_MAX; hop++) {
    if (!current || typeof current !== "object") return null;
    const candidate = current as SelectorNode;
    const isElement = candidate.nodeType === ELEMENT_NODE || (candidate.nodeType === undefined && typeof candidate.tagName === "string");
    if (isElement) return candidate;
    // 텍스트 노드 등 — 부모 요소로 올라간다(최대 PARENT_HOPS_MAX).
    current = candidate.parentElement ?? null;
  }
  return null;
}

function classTokens(el: SelectorNode): string[] {
  let raw: unknown = null;
  if (typeof el.getAttribute === "function") {
    try {
      raw = el.getAttribute("class");
    } catch {
      raw = null;
    }
  }
  // SVG 의 className 은 SVGAnimatedString(객체)라 getAttribute 를 우선하고, 문자열일 때만 fallback.
  if (typeof raw !== "string") raw = el.className;
  if (typeof raw !== "string") return [];
  return raw.split(/\s+/).filter(Boolean);
}

/**
 * 노드 → 짧은 선택자 문자열. 예: `img#hero.rounded-xl.shadow`, `p.text-sm`.
 * 텍스트 내용·data-*·alt·href 등은 읽지 않는다. 만들 수 없으면 "" (호출자가 "unknown" 등으로 치환).
 */
export function describeNode(node: unknown): string {
  try {
    const el = resolveElement(node);
    if (!el || typeof el.tagName !== "string") return "";
    const tag = el.tagName.toLowerCase();
    if (!tag || !SAFE_TOKEN.test(tag)) return "";
    let out = tag;
    if (typeof el.id === "string" && el.id && SAFE_TOKEN.test(el.id)) {
      out += `#${el.id.slice(0, ID_MAX_LENGTH)}`;
    }
    const classes = classTokens(el).filter((token) => SAFE_TOKEN.test(token)).slice(0, CLASS_MAX_COUNT);
    for (const token of classes) out += `.${token.slice(0, CLASS_MAX_LENGTH)}`;
    return out.slice(0, SELECTOR_MAX_LENGTH);
  } catch {
    return "";
  }
}

export type RectLike = { width?: unknown; height?: unknown };
export type ShiftSourceLike = { node?: unknown; previousRect?: RectLike | null; currentRect?: RectLike | null };
export type ShiftEntryLike = { value?: unknown; hadRecentInput?: unknown; sources?: readonly ShiftSourceLike[] | null };

function rectArea(rect: RectLike | null | undefined): number {
  const w = rect && typeof rect.width === "number" && Number.isFinite(rect.width) ? Math.max(0, rect.width) : 0;
  const h = rect && typeof rect.height === "number" && Number.isFinite(rect.height) ? Math.max(0, rect.height) : 0;
  return w * h;
}

function largestSourceNode(sources: readonly ShiftSourceLike[] | null | undefined): unknown {
  if (!Array.isArray(sources) || sources.length === 0) return null;
  let bestNode: unknown = null;
  let bestArea = -1;
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const area = Math.max(rectArea(source.previousRect), rectArea(source.currentRect));
    if (area > bestArea) {
      bestArea = area;
      bestNode = source.node ?? null;
    }
  }
  return bestNode;
}

/**
 * layout-shift 항목 중 (hadRecentInput 이 아닌) 값이 currentMax 를 넘는 최대 단일 이동을 고른다.
 * 반환 node 는 그 이동에서 면적(이전/현재 rect 중 큰 쪽)이 가장 큰 source 의 노드. 갱신할 것이 없으면 null.
 * 호출자는 반환 value 를 다음 호출의 currentMax 로 넘겨 페이지 로드 전체의 최대치를 유지한다.
 */
export function largestShiftSource(
  entries: readonly ShiftEntryLike[] | null | undefined,
  currentMax = 0,
): { value: number; node: unknown } | null {
  if (!Array.isArray(entries)) return null;
  let max = typeof currentMax === "number" && Number.isFinite(currentMax) ? currentMax : 0;
  let best: { value: number; node: unknown } | null = null;
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || entry.hadRecentInput) continue;
    const value = typeof entry.value === "number" ? entry.value : NaN;
    if (!Number.isFinite(value) || value <= max) continue;
    max = value;
    best = { value, node: largestSourceNode(entry.sources) };
  }
  return best;
}
