// src/components/CustomBarLabel.tsx
import type { ReactNode } from "react";

const formatNumber = (num: number): string => num.toLocaleString();

// recharts의 LabelList가 content 컴포넌트로 전달하는 props 타입입니다.
interface CustomBarLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: number | string;
  fill?: string; // Bar 또는 Cell 컴포넌트로부터 자동으로 색상 값을 받습니다.
}

export default function CustomBarLabel(props: CustomBarLabelProps): ReactNode {
  const { x, y, width, value, fill = "#8884d8" } = props;

  // recharts가 필수 props를 전달하지 않은 경우 렌더링하지 않습니다.
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    value === undefined
  ) {
    return null;
  }

  // props로 받은 값을 산술 연산 전에 안전하게 숫자형으로 변환합니다.
  const numX = Number(x);
  const numY = Number(y);
  const numWidth = Number(width);
  const numValue = Number(value);

  // 차트 바의 너비가 너무 좁으면 라벨을 숨깁니다.
  if (numWidth < 40) {
    return null;
  }

  // 라벨 텍스트의 위치를 바의 오른쪽으로 조정합니다.
  const labelX = numX + numWidth + 10;
  const labelY = numY + 15; // 바의 세로 중앙에 위치

  return (
    <text
      x={labelX}
      y={labelY}
      fill={fill}
      dominantBaseline="middle"
      textAnchor="start"
      className="font-bold text-lg"
    >
      {formatNumber(numValue)}
    </text>
  );
}
