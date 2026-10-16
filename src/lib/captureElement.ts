import html2canvas, { type Options } from "html2canvas";

/** Exclude before cloning: onclone runs after iframe src requests can start. */
export function excludeFromCapture(element: Element): boolean {
  return /^(IFRAME|SCRIPT|OBJECT|EMBED)$/i.test(element.tagName) ||
    element.matches("[data-html2canvas-ignore], .adsbygoogle, .google-auto-placed, .adsbygoogle-noablate, [id^='google_ads_iframe'], [id^='aswift_']");
}

/** All result-image exports share this filter, including exports from live pages. */
export default function captureElement(element: HTMLElement, options: Partial<Options> = {}): Promise<HTMLCanvasElement> {
  const callerIgnore = options.ignoreElements;
  return html2canvas(element, {
    ...options,
    // A caller's options may add exclusions but cannot restore advertising frames.
    ignoreElements: (node) => excludeFromCapture(node) || callerIgnore?.(node) === true,
  });
}
