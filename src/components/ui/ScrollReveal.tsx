"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * 스크롤 진입 시 한 번만 페이드 + 약간 위로 슬라이드.
 * Toss/Naver 패턴: viewport에 들어오면 0.5s 부드럽게 노출.
 *
 * - `prefers-reduced-motion: reduce` 자동 존중 (즉시 완료)
 * - `once: true` 기본 — 다시 스크롤해도 재실행 X (성능)
 * - children에 stagger를 주려면 `stagger` prop 사용
 */
export interface ScrollRevealProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart"> {
  /** 자식들에 순차 지연을 줄지 (carousel·grid 효과) */
  stagger?: boolean;
  /** 시작 transform y 거리 (기본 16px) */
  distance?: number;
  /** 진입 후 지연 (기본 0) */
  delay?: number;
  /** 가시 영역 진입 임계값 (기본 -80px = 80px 들어왔을 때) */
  margin?: string;
  /** 1회만 실행할지 (기본 true) */
  once?: boolean;
  as?: "div" | "section" | "article" | "ul" | "ol";
}

export function ScrollReveal({
  children,
  stagger = false,
  distance = 16,
  delay = 0,
  margin = "-80px",
  once = true,
  as = "div",
  className,
  ...props
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  // 접근성: reduce 사용자에게는 즉시 노출
  if (prefersReducedMotion) {
    const Tag = as as React.ElementType;
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: distance },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay,
        ...(stagger && { staggerChildren: 0.08, delayChildren: delay }),
      },
    },
  };

  // stagger 모드: 자식이 motion 노드여야 효과 — 일반 children도 지원하게 자체 wrap
  if (stagger) {
    const itemVariants: Variants = {
      hidden: { opacity: 0, y: distance },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      },
    };
    return (
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once, margin }}
        variants={containerVariants}
        className={className}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {React.Children.map(children, (child, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <MotionTag
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin }}
      variants={containerVariants}
      className={className}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </MotionTag>
  );
}

export default ScrollReveal;
