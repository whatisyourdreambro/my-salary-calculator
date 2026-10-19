import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import BoxingGame from '@/components/BoxingGame';
import type { CompanyProfile } from '@/types/company';
import type { ComparisonResult } from '@/lib/versusEngine';

const modalCall = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useModalDialog', () => ({ useModalDialog: modalCall }));

describe('modal surface contracts', () => {
  it('renders a named native game dialog with an immediately available skip-to-result button', () => {
    const companyA = { name: { ko: '가 회사' } } as CompanyProfile;
    const companyB = { name: { ko: '나 회사' } } as CompanyProfile;
    const result = { metrics: { totalComp: { winner: 'a' } } } as ComparisonResult;
    const html = renderToStaticMarkup(createElement(BoxingGame, { companyA, companyB, result, onFinish() {} }));
    expect(html).toContain('<dialog');
    expect(html).toContain('aria-label="연봉 비교 게임"');
    expect(html).toMatch(/<button type="button"[^>]*>애니메이션 건너뛰고 결과 보기<\/button>/);
    expect(html).not.toContain('결과 확인하기'); // available only after the animation; skip is present from the start
  });
  it('keeps PWA installation a nonmodal region without changing its ad-safe visibility gate', () => {
    const source = readFileSync('src/components/InstallPwaBanner.tsx', 'utf8');
    expect(source).toContain('role="region"');
    expect(source).not.toContain('role="dialog"');
    expect(source).toContain('if (!visible || adBlocked) return null;');
  });
  it('passes the stable async opener to the dialog hook rather than relying on the current active element', () => {
    const returnFocusRef = { current: null };
    renderToStaticMarkup(createElement(BoxingGame, {
      companyA: { name: { ko: '가 회사' } } as CompanyProfile,
      companyB: { name: { ko: '나 회사' } } as CompanyProfile,
      result: { metrics: { totalComp: { winner: 'a' } } } as ComparisonResult,
      onFinish() {}, returnFocusRef,
    }));
    expect(modalCall).toHaveBeenLastCalledWith(true, expect.objectContaining({ current: null }), returnFocusRef);
  });
});
