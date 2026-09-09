/** Export clone only: html2canvas does not reliably render background-clipped text. */
export function normalizeShareImageText(element: HTMLElement, color: string): void {
  element.querySelectorAll<HTMLElement>(".bg-clip-text").forEach((heading) => {
    heading.classList.remove("bg-clip-text", "text-transparent");
    heading.style.setProperty("background-image", "none", "important");
    heading.style.setProperty("background-clip", "border-box", "important");
    heading.style.setProperty("-webkit-background-clip", "border-box", "important");
    heading.style.setProperty("color", color, "important");
    heading.style.setProperty("-webkit-text-fill-color", color, "important");
    heading.style.lineHeight = "1.35";
  });
}
