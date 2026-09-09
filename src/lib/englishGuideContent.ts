export function englishGuideContent(content: string) {
  const headings: { id: string; text: string }[] = [];
  const used = new Set([...content.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
  let index = 0;
  const html = content.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (_, attributes: string, inner: string) => {
    let id = attributes.match(/\bid=["']([^"']+)["']/i)?.[1];
    if (!id) {
      do { id = `en-section-${++index}`; } while (used.has(id));
      used.add(id);
      attributes += ` id="${id}"`;
    }
    const text = inner.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim();
    headings.push({ id, text });
    return `<h2${attributes}>${inner}</h2>`;
  });
  return { html, headings };
}
