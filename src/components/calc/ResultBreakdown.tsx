"use client";

/**
 * 계산기 결과의 보조 항목들을 시각화한다.
 * - 같은 단위(suffix)의 항목이 2개 이상일 때만 의미 있음 → SimpleCalculatorView에서 사전 필터링
 * - Toss 톤: 단일 파란색 스케일, 미니멀
 * - SSR 비활성 (recharts는 클라이언트 전용)
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";

import { chartSeries, colors } from "@/lib/design-tokens";

export interface BreakdownItem {
  label: string;
  value: number;
  suffix?: string;
}

interface ResultBreakdownProps {
  items: BreakdownItem[];
  /** 색상 onLight=흰 배경용 (어두운 텍스트), onDark=파란 배경용 (밝은 텍스트) */
  surface?: "onLight" | "onDark";
  /** 막대 두께 (px) */
  barSize?: number;
  className?: string;
}

const formatTick = (v: number, suffix?: string): string => {
  if (suffix === "%") return `${v.toFixed(1)}%`;
  if (Math.abs(v) >= 100000000) return `${(v / 100000000).toFixed(1)}억`;
  if (Math.abs(v) >= 10000) return `${Math.round(v / 10000)}만`;
  return v.toLocaleString("ko-KR");
};

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{ payload: BreakdownItem; value: number }>;
}

function CustomTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const suffix = item.payload.suffix ?? "";
  return (
    <div
      style={{
        background: colors.white,
        border: `1.5px solid ${colors.canvasDark}`,
        borderRadius: 12,
        padding: "8px 12px",
        boxShadow: "0 4px 16px -4px rgba(10, 24, 41, 0.12)",
        fontSize: 13,
      }}
    >
      <div style={{ color: colors.textMuted, fontWeight: 600, marginBottom: 2 }}>
        {item.payload.label}
      </div>
      <div style={{ color: colors.text, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        {formatTick(item.value, suffix)}
        {suffix && suffix !== "%" && suffix}
      </div>
    </div>
  );
}

export default function ResultBreakdown({
  items,
  surface = "onLight",
  barSize = 16,
  className = "",
}: ResultBreakdownProps) {
  if (!items || items.length < 2) return null;

  const labelColor = surface === "onDark" ? "rgba(255,255,255,0.85)" : colors.textMuted;
  const tickColor = surface === "onDark" ? "rgba(255,255,255,0.7)" : colors.textFaint;
  const height = Math.max(items.length * (barSize + 18) + 16, 96);

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={items}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <XAxis
            type="number"
            hide
            tickFormatter={(v) => formatTick(v, items[0]?.suffix)}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={92}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: labelColor,
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <Tooltip
            cursor={{ fill: "rgba(1, 69, 242, 0.05)" }}
            content={<CustomTooltip />}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={barSize}>
            {items.map((_, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={
                  surface === "onDark"
                    ? `rgba(255, 255, 255, ${1 - idx * 0.15})`
                    : chartSeries[idx % chartSeries.length]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
