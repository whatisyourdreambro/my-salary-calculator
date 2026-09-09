/** html2canvas does not reliably honor native details visibility. Modify only its cloned document. */
export function prepareOfferComparisonExport(clonedArea: HTMLElement, expanded: boolean[]): void {
  const doc = clonedArea.ownerDocument;
  clonedArea.querySelectorAll("details").forEach((details, index) => {
    const summary = details.querySelector("summary");
    const block = doc.createElement("div");
    block.className = details.className;
    if (summary) {
      const heading = doc.createElement("div");
      heading.className = summary.className;
      heading.textContent = summary.textContent;
      block.appendChild(heading);
    }
    if (expanded[index]) {
      for (const child of Array.from(details.childNodes)) {
        if (child !== summary) block.appendChild(child);
      }
    }
    details.replaceWith(block);
  });
}
