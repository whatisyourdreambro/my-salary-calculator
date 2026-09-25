// src/components/PayStepTable.tsx
//
// 호봉 × 계급(급수) 봉급 전체표 (서버 컴포넌트) — 봉급표 페이지 맨 끝 풀표 공용
// (/teacher-pay-2026·/police-pay-2026·/firefighter-pay-2026·/civil-servant-pay-2026, 2026-09-25 준비).
// 모바일은 표를 감싼 영역 안에서만 가로 스크롤(페이지 가로 넘침 없음), 호봉 열은 스크롤 중에도 고정.
// 행 = [호봉, ...월 봉급액] — 해당 계급에 없는 호봉은 null 로 두면 '–'(스크린리더 '해당 없음')로 표시.
// 데이터: src/lib/payTablesFull2026.ts (인사혁신처 2026 봉급표 원문 파싱).

const fmt = (n: number) => n.toLocaleString("ko-KR");

type PayStepTableProps = {
  /** 표 제목(caption) — 스크린리더가 표 이름으로 읽는다 */
  caption: string;
  /** 호봉 열을 뺀 금액 열 머리글 */
  columns: ReadonlyArray<string>;
  /** [호봉, ...월 봉급액] */
  rows: ReadonlyArray<ReadonlyArray<number | null>>;
  /** 가로 스크롤 영역 이름 */
  regionLabel: string;
  /** 표 최소 폭 Tailwind 클래스 — 열 수에 맞춰 지정(모바일에서는 이 폭부터 영역 안 스크롤) */
  minWidthClass?: string;
};

export default function PayStepTable({
  caption,
  columns,
  rows,
  regionLabel,
  minWidthClass = "min-w-[280px]",
}: PayStepTableProps) {
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={regionLabel}>
      <table className={`w-full text-sm tabular-nums ${minWidthClass}`}>
        <caption className="mb-3 text-left text-xs font-bold text-muted-blue">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-canvas-200 text-navy">
            <th scope="col" className="sticky left-0 z-[1] bg-white py-2.5 px-2 text-left font-black whitespace-nowrap">
              호봉
            </th>
            {columns.map((name) => (
              <th key={name} scope="col" className="py-2.5 px-2 text-right font-black whitespace-nowrap">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([hobong, ...pays]) => (
            <tr key={hobong} className="border-b border-canvas-100">
              <th scope="row" className="sticky left-0 z-[1] bg-white py-2 px-2 text-left font-bold text-navy whitespace-nowrap">
                {hobong}호봉
              </th>
              {columns.map((name, i) => {
                const pay = pays[i];
                return (
                  <td key={name} className="py-2 px-2 text-right text-muted-blue whitespace-nowrap">
                    {typeof pay === "number" ? (
                      fmt(pay)
                    ) : (
                      <>
                        <span aria-hidden="true">–</span>
                        <span className="sr-only">해당 없음</span>
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
