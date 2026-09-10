"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import Link from "@/components/AppLink";


type TableRow = { [key: string]: string | number };
type Header = { key: keyof TableRow; label: string };

interface SalaryTableProps {
 headers: Header[];
 data: TableRow[];
 highlightRows?: number[];
 unit?: string;
 /** 첫 열(금액)을 `{base}/{연봉 환산값}` 링크로.
  * 서버→클라 컴포넌트로 함수는 못 넘기므로 문자열 base 만 받아 내부에서 href 를 만든다. */
 linkColumnBaseHref?: string;
 /** 링크 금액으로 쓸 필드 — 미지정 시 첫 열 값 사용 (월급 표처럼 행에 연봉 원본(preTax)이 있으면 그 키 지정) */
 linkValueKey?: string;
 /** 첫 열 값 → 연봉 환산 배수 (월급 ×12, 주급 ×52, 시급 ×2508(209시간×12)). 미지정 시 1(연봉표). */
 linkValueMultiplier?: number;
 /** 표 중간 광고 — afterRow(1-based) 행 뒤에 노드 삽입. 모바일 카드/데스크톱 행 양쪽에 렌더 (2026-09-11) */
 interstitials?: { afterRow: number; node: ReactNode }[];
}

export default function SalaryTable({
 headers,
 data,
 highlightRows = [],
 unit = "원",
 linkColumnBaseHref,
 linkValueKey,
 linkValueMultiplier = 1,
 interstitials = [],
}: SalaryTableProps) {
 // 표 중간 광고 — 연봉표는 모바일에서 57,000px(60화면) 동안 광고 0개였다(2026-09-11 실측, 운영자 승인 배치).
 // 모바일 카드 목록과 데스크톱 표가 둘 다 DOM 에 있어(CSS 로 한쪽 숨김) 같은 슬롯을 두 번 그리면 AdPlacement dedup 이
 // 뒤쪽(데스크톱 행)을 죽인다 → 현재 뷰포트에 맞는 한쪽에만 렌더. SSR·첫 렌더는 모바일(트래픽 다수) 기준, 마운트 후 전환.
 const [wide, setWide] = useState(false);
 useEffect(() => {
 const mq = window.matchMedia("(min-width: 768px)");
 const sync = () => setWide(mq.matches);
 sync();
 mq.addEventListener("change", sync);
 return () => mq.removeEventListener("change", sync);
 }, []);
 const interstitialAfter = (index: number, mode: "card" | "row") => {
 if ((mode === "card") === wide) return null;
 const hit = interstitials.find((i) => i.afterRow === index + 1);
 if (!hit) return null;
 if (mode === "card") return <div className="py-2">{hit.node}</div>;
 // colSpan 셀은 표 전체 폭(overflow-x 스크롤 영역보다 넓을 수 있음)이라 광고가 가로로 잘릴 수 있다 →
 // 스크롤 컨테이너 왼쪽에 고정(sticky)하고 폭을 뷰포트·페이지 폭으로 제한해 항상 보이는 영역 안에 둔다.
 return (
 <tr>
 <td colSpan={headers.length} className="p-0">
 <div className="sticky left-0 max-w-[64rem]" style={{ width: "min(100%, calc(100vw - 2rem))" }}>{hit.node}</div>
 </td>
 </tr>
 );
 };
 // 첫 열 링크 href — 월급/주급/시급 값도 연봉으로 환산해 /salary/{연봉} 으로 연결
 const buildHref = (row: TableRow) => {
 if (!linkColumnBaseHref) return undefined;
 const raw = Number(linkValueKey ? row[linkValueKey] : row[headers[0].key]);
 return `${linkColumnBaseHref}/${Math.round(raw * linkValueMultiplier)}`;
 };

 return (
 <div className="w-full">
 {/* Mobile Card View */}
 <div className="md:hidden space-y-3">
 {data.map((row, index) => {
 const isHighlighted = highlightRows.includes(row[headers[0].key] as number);

 return (
 <Fragment key={`mobile-${index}`}>
 <div
 className={`relative overflow-hidden rounded-2xl p-5 transition-colors duration-150 ${isHighlighted
 ? "bg-primary/5 border border-primary/20 shadow-sm"
 : "bg-card border border-border shadow-sm"
 }`}
 >
 <div className="relative z-10 w-full">
 <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
 <span className="text-muted-foreground font-bold tracking-widest text-xs uppercase shrink-0">{headers[0].label}</span>
 {(() => {
 const href = buildHref(row);
 const cls = `text-lg sm:text-xl font-black tracking-tight text-right ml-4 ${isHighlighted ? 'text-primary' : 'text-foreground'}`;
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
 <span className="text-muted-foreground font-medium shrink-0">{header.label}</span>
 <span className={`tabular-nums font-bold text-right ${header.key === 'monthlyNet' || header.key === 'preTax'
 ? 'text-foreground text-base'
 : 'text-muted-foreground'
 }`}>
 {Number(row[header.key]).toLocaleString('ko-KR')}{unit}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 {interstitialAfter(index, "card")}
 </Fragment>
 );
 })}
 </div>

 {/* Desktop Table View */}
 <div className="hidden md:block relative overflow-hidden rounded-2xl border border-border shadow-sm bg-card">
 <div className="overflow-x-auto" role="region" aria-label="실수령액 상세 표" tabIndex={0}>
 <table className="min-w-full text-sm">
 <thead className="bg-secondary border-b border-border sticky top-0 z-30">
 <tr>
 {headers.map((header, headerIndex) => (
 <th
 key={header.key as string}
 scope="col"
 className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap ${headerIndex === 0
 ? "text-left pl-8 sticky left-0 z-20 bg-secondary border-r border-border"
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

 return (
 <Fragment key={index}>
 <tr
 className={`group transition-colors duration-150 ${isHighlighted
 ? "bg-primary/5 hover:bg-primary/8"
 : "hover:bg-secondary"
 }`}
 >
 {headers.map((header, cellIndex) => {
 const cellHref = cellIndex === 0 ? buildHref(row) : undefined;
 const cellInner = (
 <>
 {Number(row[header.key]).toLocaleString('ko-KR')}
 {unit && <span className="text-xs text-muted-foreground ml-0.5 font-normal">{unit}</span>}
 </>
 );
 return (
 <td
 key={header.key as string}
 className={`px-6 py-4 whitespace-nowrap text-sm tabular-nums ${cellIndex === 0
 ? `text-left font-bold pl-8 sticky left-0 z-10 border-r border-border transition-colors ${isHighlighted
 ? 'text-primary bg-primary/5'
 : 'text-foreground bg-card group-hover:bg-secondary'
 }`
 : `text-right font-medium transition-colors ${isHighlighted && cellIndex !== 0 ? "font-bold text-muted-blue" : "text-muted-foreground group-hover:text-muted-blue"}`
 }`}
 >
 {cellHref ? (
 <Link href={cellHref} className="hover:underline hover:text-electric transition-colors">{cellInner}</Link>
 ) : cellInner}
 </td>
 );
 })}
 </tr>
 {interstitialAfter(index, "row")}
 </Fragment>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}