"use client";

import AdUnit from "@/components/AdUnit";
import React from "react";
import { motion } from "framer-motion";

type TableRow = { [key: string]: string | number };
type Header = { key: keyof TableRow; label: string };

interface SalaryTableProps {
  headers: Header[];
  data: TableRow[];
  highlightRows?: number[];
  unit?: string;
  adInterval?: number;
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
      {/* Mobile Card View */}
      <div className="md:hidden space-y-6">
        {data.map((row, index) => {
          const isHighlighted = highlightRows.includes(row[headers[0].key] as number);
          const showAd = (index + 1) % adInterval === 0 && index !== data.length - 1;

          return (
            <React.Fragment key={`mobile-${index}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`relative overflow-hidden rounded-[2rem] border p-6 backdrop-blur-3xl transition-all duration-300 ${isHighlighted
                  ? "bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]"
                  : "bg-zinc-900/60 border-white/5 hover:border-white/10"
                  }`}
              >
                {/* Visual Accent for Highlighted Rows */}
                {isHighlighted && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                )}

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                    <span className="text-slate-400 font-semibold tracking-wide text-sm uppercase">{headers[0].label}</span>
                    <span className={`text-2xl font-black tracking-tight ${isHighlighted ? 'text-indigo-400' : 'text-white'}`}>
                      {Number(row[headers[0].key]).toLocaleString()}{unit}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {headers.slice(1).map((header) => (
                      <div key={header.key as string} className="flex justify-between items-center text-sm group">
                        <span className="text-slate-500 group-hover:text-slate-400 transition-colors">{header.label}</span>
                        <span className={`font-semibold tabular-nums ${header.key === 'monthlyNet' || header.key === 'preTax'
                          ? 'text-white text-base'
                          : 'text-slate-300'
                          }`}>
                          {Number(row[header.key]).toLocaleString()}{unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {showAd && (
                <div className="py-6">
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

      {/* Desktop Table View */}
      <div className="hidden md:block relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-zinc-900/40 backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

        <div className="overflow-x-auto relative z-10 custom-scrollbar">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
              <tr>
                {headers.map((header, headerIndex) => (
                  <th
                    key={header.key as string}
                    scope="col"
                    className={`px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.15em] whitespace-nowrap ${headerIndex === 0
                      ? "text-left pl-10 sticky left-0 z-20 bg-zinc-950/95 border-r border-white/5 shadow-[5px_0_20px_rgba(0,0,0,0.5)]"
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
                    <motion.tr
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: index % 10 * 0.05 }}
                      className={`group transition-all duration-300 ${isHighlighted
                        ? "bg-indigo-500/5 hover:bg-indigo-500/10"
                        : "hover:bg-white/[0.02]"
                        }`}
                    >
                      {headers.map((header, cellIndex) => (
                        <td
                          key={header.key as string}
                          className={`px-8 py-6 whitespace-nowrap text-base tabular-nums ${cellIndex === 0
                            ? `text-left font-bold pl-10 sticky left-0 z-10 border-r border-white/5 shadow-[5px_0_20px_rgba(0,0,0,0.5)] transition-colors ${isHighlighted
                              ? 'text-indigo-400 bg-zinc-950/95 group-hover:bg-indigo-950/50'
                              : 'text-slate-200 bg-zinc-950/95 group-hover:bg-zinc-900'
                            }`
                            : "text-right text-slate-400 group-hover:text-slate-200 transition-colors"
                            } ${isHighlighted && cellIndex !== 0 ? "font-bold text-indigo-300" : ""}`}
                        >
                          {Number(row[header.key]).toLocaleString()}
                          {unit && <span className="text-xs text-slate-600 ml-1">{unit}</span>}
                        </td>
                      ))}
                    </motion.tr>
                    {showAd && (
                      <tr className="bg-transparent">
                        <td colSpan={headers.length} className="p-0 border-y border-white/5">
                          <div className="flex justify-center w-full py-8 bg-black/30 backdrop-blur-sm">
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