// src/components/ListedSalaryBandTable.tsx
//
// "이 연봉대의 상장사 공시 연봉" 표 (server component) — /salary/[amount] 211p ·
// /monthly/[amount] 105p 증강 (2026-08-30 성장 제안 ①). 그리드 페이지의 준중복
// 해소(페이지별 회사 표가 전부 다름) + lite/salary-db 대량 내부링크.
// ★서버 전용 — dartReport(dartDisclosed 1.3MB) import. 클라 컴포넌트에서 사용 금지.
// 배치 규칙: 반드시 페이지의 모든 광고 아래 (2026-08-16 광고 위 UI 금지).

import Link from "@/components/AppLink";
import { getListedBySalaryBand } from "@/lib/salary-data/dartReport";
import { ShieldCheck } from "lucide-react";

function fmtManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest > 0) return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

export default function ListedSalaryBandTable({
  annualWon,
  title,
}: {
  /** 기준 연봉 (원) — 월급 페이지는 ×12 환산해 전달 */
  annualWon: number;
  title?: string;
}) {
  const rows = getListedBySalaryBand(annualWon);
  if (rows.length === 0) return null;

  return (
    <section data-msy-module="listed-band" aria-labelledby="listed-band-heading">
      <h2
        id="listed-band-heading"
        className="text-lg font-black text-navy mb-1 inline-flex items-center gap-2"
      >
        <ShieldCheck size={17} className="text-electric" aria-hidden="true" />
        {title ?? `연봉 ${fmtManwon(Math.round(annualWon / 10000))} 수준의 상장사`}
      </h2>
      <p className="text-xs text-muted-blue mb-4">
        DART 사업보고서 공시 평균연봉이 이 연봉대(±5~8%)인 상장사 — 추정이 아닌 공식
        수치입니다.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-canvas-200 bg-white">
        <table className="w-full text-sm min-w-[440px]">
          <thead>
            <tr className="border-b border-canvas-200 text-left text-xs text-faint-blue">
              <th className="py-2.5 px-3 font-bold">회사</th>
              <th className="py-2.5 px-3 font-bold">공시 평균연봉</th>
              <th className="py-2.5 px-3 font-bold">직원 수</th>
              <th className="py-2.5 px-3 font-bold">업종</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.stockCode || row.nameKo} className="border-b border-canvas-200/60">
                <td className="py-2 px-3 font-bold text-navy">
                  {row.href ? (
                    <Link href={row.href} className="hover:text-electric hover:underline">
                      {row.nameKo}
                    </Link>
                  ) : (
                    row.nameKo
                  )}
                </td>
                <td className="py-2 px-3 tabular-nums font-black text-electric">
                  {fmtManwon(row.avgSalaryManwon)}
                </td>
                <td className="py-2 px-3 tabular-nums text-muted-blue">
                  {row.employeeCount.toLocaleString("ko-KR")}명
                </td>
                <td className="py-2 px-3 text-muted-blue">{row.industryKo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-blue">
        전 직급 평균(신입 초봉 아님) · 전체 목록은{" "}
        <Link href="/salary-db/listed" className="font-bold text-electric hover:underline">
          상장사 공시 연봉
        </Link>
        에서 확인하세요.
      </p>
    </section>
  );
}
