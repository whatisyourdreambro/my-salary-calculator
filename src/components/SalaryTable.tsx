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
    <div className="overflow-hidden border border-white/20 rounded-2xl shadow-2xl bg-white/5 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5 backdrop-blur-md">
            <tr>
              {headers.map((header, headerIndex) => (
                <th
                  key={header.key as string}
                  scope="col"
                  className={`px-8 py-5 text-xs font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap ${headerIndex === 0
                      ? "text-left pl-8 sticky left-0 z-20 bg-background/95 backdrop-blur-sm shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-border/50"
                      : "text-right"
                    }`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.map((row, index) => {
              const isHighlighted = highlightRows.includes(
                row[headers[0].key] as number
              );
              const showAd = (index + 1) % adInterval === 0 && index !== data.length - 1;

              return (
                <React.Fragment key={index}>
                  <tr
                    className={`transition-all duration-200 ${isHighlighted
                      ? "bg-primary/20 hover:bg-primary/30"
                      : "hover:bg-white/5 dark:hover:bg-white/5"
                      }`}
                  >
                    {headers.map((header, cellIndex) => (
                      <td
                        key={header.key as string}
                        className={`px-8 py-5 whitespace-nowrap text-base ${cellIndex === 0
                            ? "text-left font-bold text-primary pl-8 sticky left-0 z-10 bg-background/95 backdrop-blur-sm shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-border/50"
                            : "text-right text-foreground/90"
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
                      <td colSpan={headers.length} className="p-0">
                        <div className="flex justify-center w-full py-4">
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
    </div>
  );
}