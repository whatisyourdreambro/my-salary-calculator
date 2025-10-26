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
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-secondary/80 backdrop-blur-sm">
          <tr>
            {headers.map((header, headerIndex) => (
              <th
                key={header.key as string}
                scope="col"
                className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${
                  headerIndex === 0 ? "text-left" : "text-right"
                }`}
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
                    ? "bg-primary/10"
                    : "bg-card hover:bg-secondary/50"
                }`}
              >
                {headers.map((header, cellIndex) => (
                  <td
                    key={header.key as string}
                    className={`px-6 py-4 whitespace-nowrap font-mono ${
                      cellIndex === 0
                        ? "text-left font-sans font-bold text-primary"
                        : "text-right text-foreground/80"
                    } ${
                      isHighlighted && "font-bold text-primary"
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