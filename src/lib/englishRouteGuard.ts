import { EN_GUIDE_SLUGS } from "./enGuideSlugs";
import { ENGLISH_TOOLS } from "./englishTools";

const toolSlugs: ReadonlySet<string> = new Set(ENGLISH_TOOLS.map(tool => tool.slug));

/** The Pages adapter otherwise serves its Korean static fallback for missing SSG details. */
export function isMissingEnglishDetail(pathname: string) {
  const match = pathname.match(/^\/en\/(guides|tools)\/([^/]+)\/?$/);
  if (!match) return false;
  let slug: string;
  try { slug = decodeURIComponent(match[2]); } catch { return true; }
  return !(match[1] === "guides" ? EN_GUIDE_SLUGS : toolSlugs).has(slug);
}
