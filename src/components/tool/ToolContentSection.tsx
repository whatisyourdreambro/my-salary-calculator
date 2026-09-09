// src/components/tool/ToolContentSection.tsx
// 도구 페이지 본문 섹션 — H2 + 문단/리스트/비교표. 서버 컴포넌트.

import type { ToolContentSectionData } from "@/lib/toolContent";

export default function ToolContentSection({
  section,
}: {
  section: ToolContentSectionData;
}) {
  return (
    <section className="ms-surface ms-panel">
      <h2 className="mb-4 text-xl font-bold text-foreground">
        {section.heading}
      </h2>
      {section.paragraphs?.map((p, i) => (
        <p
          key={i}
          className="mb-4 text-base leading-7 text-muted-foreground last:mb-0"
        >
          {p}
        </p>
      ))}
      {section.list &&
        (section.list.ordered ? (
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-7 text-muted-foreground">
            {section.list.items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ol>
        ) : (
          <ul className="mt-3 space-y-2 text-base leading-7 text-muted-foreground">
            {section.list.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-electric font-bold">·</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        ))}
      {section.table && (
        <div className="mt-5 overflow-x-auto rounded-xl border border-border" role="region" aria-label={`${section.heading} 표`} tabIndex={0}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {section.table.headers.map((h, i) => (
                  <th key={i} scope="col">{h}</th>
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
