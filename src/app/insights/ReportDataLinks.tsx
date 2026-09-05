"use client";

// src/app/insights/ReportDataLinks.tsx
//
// 리포트 원본 데이터(CSV·JSON) 내려받기 + 위젯 버전(/embed#anchor) 1줄 링크.
// ★배치 규칙: insights/layout.tsx 에서 PageFooterAds(마지막 광고) 아래에만 렌더 —
//   리포트 본문(방법론·통계 섹션)은 광고 2~3개 위라 삽입 금지 (2026-08-16 급락 사건 규칙).
// 슬러그 판정은 usePathname — layout 은 자식 세그먼트를 모르므로 클라이언트에서 매핑.
// /insights 인덱스·미등재 슬러그는 아무것도 렌더하지 않는다.
// 계측: dataset_download(format, slug) — analytics.trackEvent 기존 패턴.

import { usePathname } from "next/navigation";
import { Download, Code2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { getReportDatasetMeta, reportDataPaths } from "./_lib/reportDatasetMeta";

const MAX_WIDTH: Record<string, string> = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export default function ReportDataLinks({
  maxWidth = "3xl",
  className = "",
}: {
  maxWidth?: "3xl" | "4xl";
  className?: string;
}) {
  const pathname = usePathname() || "";
  const m = /^\/insights\/([a-z0-9-]+)\/?$/.exec(pathname);
  const meta = m ? getReportDatasetMeta(m[1]) : undefined;
  if (!meta) return null;

  const paths = reportDataPaths(meta.slug);
  const onDownload = (format: "csv" | "json") => () =>
    trackEvent("dataset_download", { format, slug: meta.slug });

  return (
    <section
      aria-label="리포트 원본 데이터"
      className={`page-width ${MAX_WIDTH[maxWidth]} ${className}`}
    >
      <div className="rounded-2xl border border-canvas-200 bg-white px-5 py-4 text-[13px] leading-[1.7] text-muted-blue font-medium space-y-2">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Download className="w-4 h-4 text-electric shrink-0" aria-hidden />
          <span className="font-bold text-navy">{meta.label} 원본 데이터</span>
          <a
            href={paths.csv}
            download
            onClick={onDownload("csv")}
            className="text-electric font-bold underline underline-offset-2"
          >
            CSV 내려받기
          </a>
          <span aria-hidden>·</span>
          <a
            href={paths.json}
            onClick={onDownload("json")}
            className="text-electric font-bold underline underline-offset-2"
          >
            JSON
          </a>
          <span className="text-faint-blue">— 출처 &ldquo;머니샐러리&rdquo; 표기 시 자유 인용</span>
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Code2 className="w-4 h-4 text-electric shrink-0" aria-hidden />
          <span>이 데이터의 위젯 버전 붙이기</span>
          <a
            href={`/embed#${meta.embedAnchor}`}
            className="text-electric font-bold underline underline-offset-2"
          >
            /embed 에서 내 블로그에 달기 →
          </a>
        </p>
      </div>
    </section>
  );
}
