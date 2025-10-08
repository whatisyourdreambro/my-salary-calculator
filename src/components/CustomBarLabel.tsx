// src/components/CustomBarLabel.tsx
import type { ReactNode } from "react";

const formatNumber = (value: number | string): string => {
  const num = Number(value);
  if (isNaN(num)) return "";
  // 소수점 둘째 자리까지 표시
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// recharts의 LabelList가 content 컴포넌트로 전달하는 props 타입입니다.
interface CustomBarLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
  fill?: string;
}

export default function CustomBarLabel(props: CustomBarLabelProps): ReactNode {
  const { x, y, width, height, value } = props;

  // recharts가 필수 props를 전달하지 않은 경우 렌더링하지 않습니다.
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined ||
    value === undefined
  ) {
    return null;
  }

  // props로 받은 값을 산술 연산 전에 안전하게 숫자형으로 변환합니다.
  const numX = Number(x);
  const numY = Number(y);
  const numWidth = Number(width);
  const numHeight = Number(height);
  const numValue = Number(value);

  // 차트 바의 너비가 너무 좁으면 라벨을 숨깁니다.
  if (numWidth < 40) {
    return null;
  }

  // 라벨 텍스트의 위치를 바의 오른쪽 바깥으로 조정합니다.
  const labelX = numX + numWidth + 10;
  const labelY = numY + numHeight / 2;

  return (
    <text
      x={labelX}
      y={labelY}
      fill="currentColor" // TailwindCSS의 현재 텍스트 색상을 사용합니다.
      dominantBaseline="middle"
      textAnchor="start"
      className="font-semibold text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary"
    >
      {formatNumber(numValue)}
    </text>
  );
}
