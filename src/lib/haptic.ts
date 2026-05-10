/**
 * 모바일 햅틱 피드백 — Web Vibration API 래퍼.
 * iOS Safari는 미지원이므로 안전하게 no-op으로 폴백된다.
 *
 * 의도:
 * - light(10ms): 일반 탭/입력 변경
 * - medium(20ms): 주요 액션(계산 실행, 공유)
 * - success(40ms 두 번): 결과 도착, 복사 완료
 * - warning([10, 50, 10]): 검증 실패
 */

type HapticPattern = "light" | "medium" | "success" | "warning" | number | number[];

const PATTERNS: Record<Exclude<HapticPattern, number | number[]>, number | number[]> = {
  light: 10,
  medium: 20,
  success: [20, 40, 20],
  warning: [10, 50, 10],
};

export function haptic(pattern: HapticPattern = "light"): void {
  if (typeof window === "undefined") return;
  if (!("vibrate" in navigator)) return;

  const resolved =
    typeof pattern === "string" ? PATTERNS[pattern] : pattern;

  try {
    navigator.vibrate(resolved);
  } catch {
    // 일부 브라우저는 사용자 제스처 컨텍스트 외부에서 throw — 무시.
  }
}
