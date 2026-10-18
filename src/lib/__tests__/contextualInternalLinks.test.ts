import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { allCalculators, toClientCalculator } from '@/lib/simpleCalculators';
import { CALCULATOR_JOURNEYS, calculatorJourneyNeighbors } from '@/lib/calculatorJourneys';
import { comparisonNeighbors } from '@/lib/salaryComparisonNeighbors';
import { regionsData } from '@/data/regionsData';
import { jobsData } from '@/data/jobsData';
import { getTopicNextSteps, TOPIC_NEXT_STEPS } from '@/lib/topicNextSteps';

describe('contextual internal links', () => {
  it('keeps curated calculator tasks distinct, valid, and reachable from two peer pages', () => {
    const selected = CALCULATOR_JOURNEYS.flatMap(group => group.slugs);
    expect(new Set(selected).size).toBe(selected.length);
    for (const group of CALCULATOR_JOURNEYS) {
      expect(group.slugs.length).toBeGreaterThanOrEqual(3);
      for (const slug of group.slugs) {
        const calc = allCalculators.find(c => c.slug === slug)!;
        expect(calc, slug).toBeDefined();
        const client = toClientCalculator(calc);
        const expected = calculatorJourneyNeighbors(slug);
        expect(expected).toHaveLength(2);
        expect(new Set(expected).size).toBe(2);
        expect(expected).not.toContain(slug);
        for (const target of expected) expect((client.relatedCards ?? []).map(c => c.slug)).toContain(target);
        const inbound = group.slugs.filter(source => source !== slug && (toClientCalculator(allCalculators.find(c => c.slug === source)!).relatedCards ?? []).some(c => c.slug === slug));
        expect(inbound.length, slug).toBeGreaterThanOrEqual(2);
      }
    }
    expect(calculatorJourneyNeighbors('unknown')).toEqual([]);
  });

  it('preserves region/job card budgets while covering the edges of each comparison set', () => {
    const groups: { items: { id: string }[]; limit: number }[] = [
      { items: [...regionsData].sort((a,b) => b.salary.overall-a.salary.overall || a.id.localeCompare(b.id)), limit: 5 },
      ...[...new Set(jobsData.map(job => job.category))].map(category => ({ items: jobsData.filter(job => job.category === category), limit: 6 })),
    ];
    for (const { items, limit } of groups) {
      for (const item of items) {
        const related = comparisonNeighbors(items, item.id, limit);
        expect(related).toHaveLength(Math.min(limit, items.length-1));
        expect(related.map(r => r.id)).not.toContain(item.id);
        expect(new Set(related.map(r => r.id)).size).toBe(related.length);
        const incoming = items.filter(source => comparisonNeighbors(items, source.id, limit).some(r => r.id === item.id));
        expect(incoming.length, item.id).toBeGreaterThanOrEqual(Math.min(2, items.length-1));
      }
    }
    expect(comparisonNeighbors([], 'missing', 5)).toEqual([]);
    expect(comparisonNeighbors([{id:'only'}], 'only', 5)).toEqual([]);
  });

  it('uses finite local destinations and useful descriptions only on reviewed pages', () => {
    for (const [source, targets] of Object.entries(TOPIC_NEXT_STEPS)) {
      const cards = getTopicNextSteps(source);
      expect(cards.length).toBeLessThanOrEqual(4);
      expect(new Set(targets).size).toBe(targets.length);
      expect(targets).not.toContain(source);
      for (const card of cards) {
        expect(card.title?.length).toBeGreaterThan(3);
        expect(card.description?.length).toBeGreaterThan(20);
        expect(card.href).toMatch(/^\/[a-z0-9/-]+$/);
        expect(existsSync(`src/app${card.href}/page.tsx`) || /^\/hub\/(career|fire|real-estate)$/.test(card.href), card.href).toBe(true);
      }
    }
    expect(getTopicNextSteps('/not-reviewed')).toEqual([]);
  });
});
