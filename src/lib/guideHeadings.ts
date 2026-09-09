export interface GuideHeading {
  id: string;
  text: string;
}

const ID_ATTRIBUTE = /(?:^|\s)id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;
const H2 = /<h2\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/h2\s*>/gi;

function decodeEntities(text: string): string {
  const named: Record<string, string> = { amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">" };
  return text.replace(/&(#x[\da-f]+|#\d+|amp|nbsp|quot|apos|lt|gt);/gi, (entity, code: string) => {
    if (!code.startsWith("#")) return named[code.toLowerCase()] ?? entity;
    const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
  });
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Callers can pass their existing article/ad segments; ID insertion never moves those boundaries.
export function prepareGuideHeadings(content: string, segments: string[] = [content]) {
  const reserved = new Set([...content.matchAll(/(?:\s)id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)]
    .map(match => decodeEntities(match[1] ?? match[2] ?? match[3])));
  const assigned = new Set<string>();
  const headings: GuideHeading[] = [];
  let next = 0;
  const preparedSegments = segments.map(segment => segment.replace(H2, (_match, attributes: string, inner: string) => {
    const existing = attributes.match(ID_ATTRIBUTE);
    let id = existing ? decodeEntities(existing[1] ?? existing[2] ?? existing[3]) : "";
    if (!id || assigned.has(id)) {
      do { id = `guide-section-${++next}`; } while (reserved.has(id) || assigned.has(id));
      attributes = attributes.replace(ID_ATTRIBUTE, "");
      attributes += ` id="${escapeAttribute(id)}"`;
    }
    assigned.add(id);
    const text = decodeEntities(inner.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
    if (text) headings.push({ id, text });
    return `<h2${attributes}>${inner}</h2>`;
  }));
  return { headings, segments: preparedSegments, html: preparedSegments.join("") };
}
