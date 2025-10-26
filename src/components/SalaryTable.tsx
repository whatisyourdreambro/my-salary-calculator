// src/components/SalaryTable.tsx

type TableRow = { [key: string]: string | number };
type Header = { key: keyof TableRow; label: string };

interface SalaryTableProps {
  headers: Header[];
  data: TableRow[];
  highlightRows?: number[]; // 특정 값을 기준으로 행을 하이라이트
  unit?: string; // 금액 뒤에 붙일 단위 (예: 원)
}

export default function SalaryTable({
  headers,
  data,
  highlightRows = [],
  unit = "원",
}: SalaryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="sticky top-0 bg-secondary z-10">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key as string}
                scope="col"
                className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, index) => {
            const isHighlighted = highlightRows.includes(
              row[headers[0].key] as number
            );
            return (
              <tr
                key={index}
                className={`transition-colors ${
                  isHighlighted
                    ? "bg-primary/10 font-bold"
                    : "bg-card hover:bg-secondary"
                }`}
              >
                {headers.map((header) => (
                  <td
                    key={header.key as string}
                    className={`px-6 py-5 whitespace-nowrap ${
                      isHighlighted
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {Number(row[header.key]).toLocaleString()}
                    {unit && ` ${unit}`}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}