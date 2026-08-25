"use client";

// src/components/AnimatedNumber.tsx
//
// SSR 에 실수치를 노출하는 카운트업 숫자.
//
// 배경: react-countup 은 마운트 전(=서버 HTML·초기 하이드레이션 렌더)에 시작값(0)을
// 렌더한다 — /salary/*·/monthly/* 수백 페이지의 결과 카드 핵심 수치가 서버 HTML 에
// 0/빈 값으로 내려가던 원인. 크롤러·자바스크립트 미실행 환경은 실수치를 못 봤다.
//
// 해법(프로그레시브 인핸스먼트): 서버와 초기 하이드레이션 렌더에서는 실수치 텍스트를
// 그대로 렌더하고(서버 HTML == 초기 클라 렌더 → hydration mismatch 없음), 마운트
// 후에만 CountUp 으로 교체해 기존 0→값 애니메이션을 재생한다.
//
// 포맷은 "ko-KR" 고정 — 서버/클라 기본 로케일 차이로 인한 mismatch 방지.
import { useEffect, useState } from "react";
import CountUp from "react-countup";

interface AnimatedNumberProps {
  value: number;
  /** CountUp 재생 시간(초) — 기존 사용처 기본값 유지 */
  duration?: number;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1,
  className,
}: AnimatedNumberProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{value.toLocaleString("ko-KR")}</span>;
  }
  return (
    <span className={className}>
      <CountUp end={value} separator="," duration={duration} />
    </span>
  );
}
