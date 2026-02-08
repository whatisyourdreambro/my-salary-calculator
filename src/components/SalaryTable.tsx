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
                transition={{ duration: 0.6 }}
                className={`relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 ${isHighlighted
                  ? "bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-lg"
                  : "bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-sm"
                  }`}
              >
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>

                {/* Visual Accent for Highlighted Rows */}
                {isHighlighted && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                )}

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200 dark:border-stone-700">
                    <span className="text-stone-400 font-bold tracking-widest text-xs uppercase">{headers[0].label}</span>
                    <span className={`text-2xl font-serif font-bold tracking-tight ${isHighlighted ? 'text-primary' : 'text-foreground'}`}>
                      {Number(row[headers[0].key]).toLocaleString()}{unit}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {headers.slice(1).map((header) => (
                      <div key={header.key as string} className="flex justify-between items-center text-sm group">
                        <span className="text-stone-500 group-hover:text-stone-400 transition-colors font-medium">{header.label}</span>
                        <span className={`tabular-nums font-bold ${header.key === 'monthlyNet' || header.key === 'preTax'
                          ? 'text-foreground text-base'
                          : 'text-stone-400'
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
      <div className="hidden md:block relative overflow-hidden rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-xl bg-white dark:bg-[#1C1917]">
        {/* Paper Texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />

        <div className="overflow-x-auto relative z-10 custom-scrollbar">
          <table className="min-w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30">
              <tr>
                {headers.map((header, headerIndex) => (
                  <th
                    key={header.key as string}
                    scope="col"
                    className={`px-8 py-6 text-xs font-bold text-stone-500 uppercase tracking-[0.15em] whitespace-nowrap ${headerIndex === 0
                      ? "text-left pl-10 sticky left-0 z-20 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-[5px_0_20px_rgba(0,0,0,0.02)]"
                      : "text-right"
                      }`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
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
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-stone-50 dark:hover:bg-stone-900/50"
                        }`}
                    >
                      {headers.map((header, cellIndex) => (
                        <td
                          key={header.key as string}
                          className={`px-8 py-5 whitespace-nowrap text-base tabular-nums ${cellIndex === 0
                            ? `text-left font-serif font-bold pl-10 sticky left-0 z-10 border-r border-stone-100 dark:border-stone-800 shadow-[5px_0_20px_rgba(0,0,0,0.02)] transition-colors ${isHighlighted
                              ? 'text-primary bg-stone-100 dark:bg-stone-900'
                              : 'text-foreground bg-white dark:bg-[#1C1917] group-hover:bg-stone-50 dark:group-hover:bg-stone-900/50'
                            }`
                            : "text-right text-stone-500 font-medium group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors"
                            } ${isHighlighted && cellIndex !== 0 ? "font-bold text-stone-700 dark:text-stone-300" : ""}`}
                        >
                          {Number(row[header.key]).toLocaleString()}
                          {unit && <span className="text-xs text-stone-400 ml-1 font-normal font-sans">{unit}</span>}
                        </td>
                      ))}
                    </motion.tr>
                    {showAd && (
                      <tr className="bg-transparent">
                        <td colSpan={headers.length} className="p-0 border-y border-stone-100 dark:border-stone-800">
                          <div className="flex justify-center w-full py-8 bg-stone-50/50 dark:bg-stone-900/50 backdrop-blur-sm">
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