"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type TableRow = { [key: string]: string | number };
type Header = { key: keyof TableRow; label: string };

interface SalaryTableProps {
 headers: Header[];
 data: TableRow[];
 highlightRows?: number[];
 unit?: string;
 adInterval?: number;
 /** 첫 열(금액)을 `{base}/{첫열값}` 링크로 — 연봉표에서만 전달(월급/주급/시급 표는 단위가 달라 미지정).
  * 서버→클라 컴포넌트로 함수는 못 넘기므로 문자열 base 만 받아 내부에서 href 를 만든다. */
 linkColumnBaseHref?: string;
}

export default function SalaryTable({
 headers,
 data,
 highlightRows = [],
 unit = "원",
 adInterval = 20,
 linkColumnBaseHref,
}: SalaryTableProps) {
 return (
 <div className="w-full">
 {/* Mobile Card View */}
 <div className="md:hidden space-y-3">
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
 className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${isHighlighted
 ? "bg-primary/5 border border-primary/20 shadow-sm"
 : "bg-white border border-canvas shadow-sm"
 }`}
 >
 <div className="relative z-10 w-full">
 <div className="flex justify-between items-center mb-4 pb-3 border-b border-canvas">
 <span className="text-faint-blue font-bold tracking-widest text-xs uppercase shrink-0">{headers[0].label}</span>
 {(() => {
 const href = linkColumnBaseHref ? `${linkColumnBaseHref}/${row[headers[0].key]}` : undefined;
 const cls = `text-lg sm:text-xl font-black tracking-tight text-right ml-4 ${isHighlighted ? 'text-primary' : 'text-navy'}`;
 const label = `${Number(row[headers[0].key]).toLocaleString('ko-KR')}${unit}`;
 return href ? (
 <Link href={href} className={`${cls} hover:underline`}>{label}</Link>
 ) : (
 <span className={cls}>{label}</span>
 );
 })()}
 </div>

 <div className="space-y-2.5 w-full">
 {headers.slice(1).map((header) => (
 <div key={header.key as string} className="flex justify-between items-center text-sm">
 <span className="text-faint-blue font-medium shrink-0">{header.label}</span>
 <span className={`tabular-nums font-bold text-right ${header.key === 'monthlyNet' || header.key === 'preTax'
 ? 'text-navy text-base'
 : 'text-faint-blue'
 }`}>
 {Number(row[header.key]).toLocaleString('ko-KR')}{unit}
 </span>
 </div>
 ))}
 </div>
 </div>
 </motion.div>

 {showAd && (
 <div className="py-4">
 </div>
 )}
 </React.Fragment>
 );
 })}
 </div>

 {/* Desktop Table View */}
 <div className="hidden md:block relative overflow-hidden rounded-2xl border border-canvas shadow-sm bg-white">
 <div className="overflow-x-auto">
 <table className="min-w-full text-sm">
 <thead className="bg-canvas border-b border-canvas sticky top-0 z-30">
 <tr>
 {headers.map((header, headerIndex) => (
 <th
 key={header.key as string}
 scope="col"
 className={`px-6 py-4 text-xs font-bold text-faint-blue uppercase tracking-widest whitespace-nowrap ${headerIndex === 0
 ? "text-left pl-8 sticky left-0 z-20 bg-canvas border-r border-canvas"
 : "text-right"
 }`}
 >
 {header.label}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-canvas">
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
 transition={{ duration: 0.2, delay: index % 10 * 0.03 }}
 className={`group transition-all duration-200 ${isHighlighted
 ? "bg-primary/5 hover:bg-primary/8"
 : "hover:bg-canvas"
 }`}
 >
 {headers.map((header, cellIndex) => {
 const cellHref = cellIndex === 0 && linkColumnBaseHref ? `${linkColumnBaseHref}/${row[header.key]}` : undefined;
 const cellInner = (
 <>
 {Number(row[header.key]).toLocaleString('ko-KR')}
 {unit && <span className="text-xs text-faint-blue ml-0.5 font-normal">{unit}</span>}
 </>
 );
 return (
 <td
 key={header.key as string}
 className={`px-6 py-4 whitespace-nowrap text-sm tabular-nums ${cellIndex === 0
 ? `text-left font-bold pl-8 sticky left-0 z-10 border-r border-canvas transition-colors ${isHighlighted
 ? 'text-primary bg-primary/5'
 : 'text-navy bg-white group-hover:bg-canvas'
 }`
 : `text-right font-medium transition-colors ${isHighlighted && cellIndex !== 0 ? "font-bold text-muted-blue" : "text-faint-blue group-hover:text-muted-blue"}`
 }`}
 >
 {cellHref ? (
 <Link href={cellHref} className="hover:underline hover:text-electric transition-colors">{cellInner}</Link>
 ) : cellInner}
 </td>
 );
 })}
 </motion.tr>
 {showAd && (
 <tr className="bg-transparent">
 <td colSpan={headers.length} className="p-0 border-y border-canvas">
 <div className="flex justify-center w-full py-6 bg-canvas">
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