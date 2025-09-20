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
        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-950 z-10">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key as string}
                scope="col"
                className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, index) => {
            const isHighlighted = highlightRows.includes(
              row[headers[0].key] as number
            );
            return (
              <tr
                key={index}
                className={`transition-colors ${
                  isHighlighted
                    ? "bg-blue-50 dark:bg-blue-900/20 font-bold"
                    : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {headers.map((header) => (
                  <td
                    key={header.key as string}
                    className={`px-6 py-5 whitespace-nowrap ${
                      isHighlighted
                        ? "text-signature-blue dark:text-blue-300"
                        : "text-gray-800 dark:text-gray-300"
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
