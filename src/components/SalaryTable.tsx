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
    <div className="w-full">
      {/* Mobile Card View (Hidden on MD and up) */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => {
          const isHighlighted = highlightRows.includes(row[headers[0].key] as number);
          const showAd = (index + 1) % adInterval === 0 && index !== data.length - 1;

          return (
            <React.Fragment key={`mobile-${index}`}>
              <div
                className={`rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 ${isHighlighted
                    ? "bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "bg-zinc-900/40 border-white/10"
                  }`}
              >
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                  <span className="text-zinc-400 font-medium">{headers[0].label}</span>
                  <span className={`text-xl font-bold ${isHighlighted ? 'text-primary' : 'text-white'}`}>
                    {Number(row[headers[0].key]).toLocaleString()}{unit}
                  </span>
                </div>

                <div className="space-y-3">
                  {headers.slice(1).map((header) => (
                    <div key={header.key as string} className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">{header.label}</span>
                      <span className={`font-medium ${header.key === 'monthlyNet' || header.key === 'preTax'
                          ? 'text-white'
                          : 'text-zinc-300'
                        }`}>
                        {Number(row[header.key]).toLocaleString()}{unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {showAd && (
                <div className="py-4">
                  <AdUnit
                    slotId={`TABLE_MOBILE_FEED_${index}`}
                    format="rectangle"
                    label={`Ad ${index}`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block overflow-hidden border border-white/10 rounded-2xl shadow-2xl bg-zinc-900/40 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/20 backdrop-blur-md">
              <tr>
                {headers.map((header, headerIndex) => (
                  <th
                    key={header.key as string}
                    scope="col"
                    className={`px-8 py-5 text-xs font-extrabold text-zinc-500 uppercase tracking-widest whitespace-nowrap ${headerIndex === 0
                        ? "text-left pl-8 sticky left-0 z-20 bg-zinc-950/90 backdrop-blur-sm border-r border-white/10"
                        : "text-right"
                      }`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row, index) => {
                const isHighlighted = highlightRows.includes(
                  row[headers[0].key] as number
                );
                const showAd = (index + 1) % adInterval === 0 && index !== data.length - 1;

                return (
                  <React.Fragment key={index}>
                    <tr
                      className={`transition-all duration-200 ${isHighlighted
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20"
                          : "hover:bg-white/5"
                        }`}
                    >
                      {headers.map((header, cellIndex) => (
                        <td
                          key={header.key as string}
                          className={`px-8 py-5 whitespace-nowrap text-base ${cellIndex === 0
                              ? `text-left font-bold pl-8 sticky left-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-r border-white/10 ${isHighlighted ? 'text-emerald-400' : 'text-zinc-200'}`
                              : "text-right text-zinc-300"
                            } ${isHighlighted && cellIndex !== 0 ? "font-bold text-emerald-400" : ""}`}
                        >
                          {Number(row[header.key]).toLocaleString()}
                          {unit && ` ${unit}`}
                        </td>
                      ))}
                    </tr>
                    {showAd && (
                      <tr className="bg-transparent">
                        <td colSpan={headers.length} className="p-0 border-y border-white/10">
                          <div className="flex justify-center w-full py-6 bg-black/20">
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
    </div>
  );
}