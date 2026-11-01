'use client';

// 연봉·월급·주급·시급 실수령액 표(2026·2027)의 '급여 단위와 적용 연도 비교' 상자를 경로로 고르는 래퍼.
// ★ 배치 규칙: src/app/table/2026/layout.tsx·2027/layout.tsx 의 **맨 끝**(PageFooterAds 의 HomeTopAd·InArticleAd·쿠팡,
//   공유 fallback 뒤)에만 둔다. 2026-10-19 에 각 표 page.tsx 의 <main> 끝에 들어가 layout 하단 광고를 상자 높이만큼
//   밀어내던 것을 옮겼다(B12·P2UX-01, 운영자 승인 2026-11-01 — 2026-08-16 '광고 위 UI 삽입 금지' 규칙).
//   맨 끝이라 기존 형제 요소의 자동광고 CSS 경로도 바뀌지 않는다(CalcNewsNote 와 같은 선례).
// - layout 에는 params 가 없어 usePathname 으로 연도·단위를 고른다. usePathname 은 서버 렌더에서도 동작하므로
//   프리렌더 HTML 에 상자가 그대로 들어간다. 4개 표 밖의 경로는 null.
import { usePathname } from 'next/navigation';
import SalaryTableNextSteps from '@/components/SalaryTableNextSteps';

type TableUnit = 'annual' | 'monthly' | 'weekly' | 'hourly';

const TABLE_PATH = /^\/table\/(2026|2027)\/(annual|monthly|weekly|hourly)\/?$/;

/** /table/(2026|2027)/(annual|monthly|weekly|hourly) → 연도·단위. 그 밖의 경로는 null. */
export function salaryTableFromPath(pathname: string | null): { year: 2026 | 2027; unit: TableUnit } | null {
  const match = pathname ? TABLE_PATH.exec(pathname) : null;
  if (!match) return null;
  return { year: match[1] === '2026' ? 2026 : 2027, unit: match[2] as TableUnit };
}

export default function SalaryTableNextStepsFromPath() {
  const table = salaryTableFromPath(usePathname());
  if (!table) return null;
  return <SalaryTableNextSteps year={table.year} unit={table.unit} />;
}
