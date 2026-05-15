// src/components/tool/ToolContentSection.tsx
// 도구 페이지 본문 섹션 — H2 + 문단/리스트/비교표. 서버 컴포넌트.

import type { ToolContentSectionData } from "@/lib/toolContent";

export default function ToolContentSection({
  section,
}: {
  section: ToolContentSectionData;
}) {
  return (
    <section className="p-6 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800">
      <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
        {section.heading}
      </h2>
      {section.paragraphs?.map((p, i) => (
        <p
          key={i}
          className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed mb-3 last:mb-0"
        >
          {p}
        </p>
      ))}
      {section.list &&
        (section.list.ordered ? (
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-muted-blue dark:text-canvas-300 mt-2">
            {section.list.items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ol>
        ) : (
          <ul className="space-y-1.5 text-sm text-muted-blue dark:text-canvas-300 mt-2">
            {section.list.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-electric font-bold">·</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        ))}
      {section.table && (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {section.table.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
