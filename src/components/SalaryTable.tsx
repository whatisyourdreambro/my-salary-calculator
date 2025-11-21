import AdUnit from "@/components/AdUnit";
import React from "react";

type TableRow = { [key: string]: string | number };
type Header = { key: keyof TableRow; label: string };

interface SalaryTableProps {
  headers: Header[];
  data: TableRow[];
  highlightRows?: number[]; // 특정 값을 기준으로 행을 하이라이트
  unit?: string; // 금액 뒤에 붙일 단위 (예: 원)
  adInterval?: number; // 광고 삽입 간격 (기본값: 20)
}

export default function SalaryTable({
  headers,
  data,
  highlightRows = [],
  unit = "원",
  adInterval = 20,
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
                className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${headerIndex === 0 ? "text-left" : "text-right"
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
            const showAd = (index + 1) % adInterval === 0 && index !== data.length - 1;

            return (
              <React.Fragment key={index}>
                <tr
                  className={`transition-colors ${isHighlighted
                      ? "bg-primary/10"
                      : "bg-card hover:bg-secondary/50"
                    }`}
                >
                  {headers.map((header, cellIndex) => (
                    <td
                      key={header.key as string}
                      className={`px-6 py-4 whitespace-nowrap ${cellIndex === 0
                          ? "text-left font-bold text-primary"
                          : "text-right text-foreground/80"
                        } ${isHighlighted && "font-bold text-primary"
                        }`}
                    >
                      {Number(row[header.key]).toLocaleString()}
                      {unit && ` ${unit}`}
                    </td>
                  ))}
                </tr>
                {showAd && (
                  <tr className="bg-secondary/20">
                    <td colSpan={headers.length} className="p-4">
                      <div className="flex justify-center w-full">
                        <AdUnit
                          slotId={`TABLE_IN_FEED_${index}`}
                          format="fluid"
                          layoutKey="-fb+5w+4e-db+86"
                          label={`Table Ad ${index}`}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}