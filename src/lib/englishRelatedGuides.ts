import { rankRelatedGuides } from './guideDiscovery';

// Preserve the existing three-card area, but select the next reading task rather
// than letting equally scored new articles crowd out older relevant material.
export const ENGLISH_RELATED_GUIDES: Record<string, readonly string[]> = {
  'samsung-electronics-stock-2026': ['sk-hynix-stock-2026', 'semiconductor-cycle-2026', 'kospi-leader-stock-strategy'],
  'samsung-employee-rsu-stock': ['sk-hynix-employee-bonus-stock', 'chip-stock-tax-guide', 'samsung-vs-hynix-employee-comparison'],
  'sk-hynix-stock-2026': ['samsung-electronics-stock-2026', 'semiconductor-cycle-2026', 'sk-hynix-employee-bonus-stock'],
  'sk-hynix-employee-bonus-stock': ['samsung-employee-rsu-stock', 'sk-hynix-stock-2026', 'samsung-vs-hynix-employee-comparison'],
  'semiconductor-cycle-2026': ['sk-hynix-stock-2026', 'samsung-electronics-stock-2026', 'loan-types-comparison-2026'],
  'samsung-vs-hynix-employee-comparison': ['samsung-employee-rsu-stock', 'sk-hynix-employee-bonus-stock', 'loan-types-comparison-2026'],
  'chip-stock-tax-guide': ['samsung-employee-rsu-stock', 'kospi-leader-stock-strategy', 'year-end-tax-deductions-guide'],
  'kospi-leader-stock-strategy': ['semiconductor-cycle-2026', 'chip-stock-tax-guide', 'sk-hynix-stock-2026'],
  'earned-income-credit-2026': ['four-major-insurance-complete', 'health-insurance-2026-guide', 'year-end-tax-deductions-guide'],
  'four-major-insurance-complete': ['earned-income-credit-2026', 'health-insurance-2026-guide', 'year-end-tax-deductions-guide'],
  'year-end-tax-deductions-guide': ['earned-income-credit-2026', 'four-major-insurance-complete', 'health-insurance-2026-guide'],
  'health-insurance-2026-guide': ['earned-income-credit-2026', 'four-major-insurance-complete', 'year-end-tax-deductions-guide'],
  'loan-types-comparison-2026': ['semiconductor-cycle-2026', 'four-major-insurance-complete', 'year-end-tax-deductions-guide'],
};

type Guide = { slug: string; title: string; description: string; category: string; tags: string[]; publishedDate: string; modifiedDate?: string };
export function getEnglishRelatedGuides<T extends Guide>(guides: readonly T[], current: T): T[] {
  const bySlug = new Map(guides.map(guide => [guide.slug, guide]));
  const selected = (ENGLISH_RELATED_GUIDES[current.slug] ?? []).flatMap(slug => {
    const guide = bySlug.get(slug); return guide && slug !== current.slug ? [guide] : [];
  });
  const fallback = rankRelatedGuides(guides, { currentSlug: current.slug, category: current.category, tags: current.tags });
  return [...new Map([...selected, ...fallback].map(guide => [guide.slug, guide])).values()].slice(0, 3);
}
