"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/AppLink";
import {
  FIXED_FEEDBACK_CONFIG,
  type FixedFeedbackRequest,
  type FixedFeedbackReason,
  type FixedFeedbackTarget,
  type FixedFeedbackVote,
} from "@/lib/fixedFeedbackContract";

const CONTACT_SOURCE: Record<FixedFeedbackTarget, string> = {
  samsung_bonus: "samsung-bonus",
  civil_pay_2027: "civil-servant-pay-2027",
  samsung_company: "samsung-electronics",
};
const choiceClass = "inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric disabled:cursor-default";

/** Only the three exact pilot paths. A pathname/target change starts a new visit. */
export default function PrivateFeedback({ target }: { target: FixedFeedbackTarget }) {
  const pathname = usePathname();
  if (pathname !== FIXED_FEEDBACK_CONFIG[target].path) return null;
  return <FeedbackVisit key={`${pathname}:${target}`} target={target} />;
}

function FeedbackVisit({ target }: { target: FixedFeedbackTarget }) {
  const [vote, setVote] = useState<FixedFeedbackVote | null>(null);
  const [reason, setReason] = useState<FixedFeedbackReason | null>(null);
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const attempt = useRef<FixedFeedbackRequest | null>(null);
  const inFlight = useRef<{ controller: AbortController; timeout: number } | null>(null);
  const visit = useRef<symbol | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = `private-feedback-${target}`;
  const config = FIXED_FEEDBACK_CONFIG[target];
  const contactHref = `/contact?source=${CONTACT_SOURCE[target]}&type=explanation`;

  useEffect(() => {
    visit.current = Symbol("feedback-visit");
    return () => {
      visit.current = null;
      if (inFlight.current) {
        window.clearTimeout(inFlight.current.timeout);
        inFlight.current.controller.abort();
        inFlight.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (receipt) heading.current?.focus();
  }, [receipt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The ref also covers two submits before React commits the disabled state.
    if (inFlight.current || receipt || !visit.current) return;
    if (!attempt.current) {
      if (!consent || !vote || (vote === "confusing" && !config.reasons.some(option => option.value === reason))) return;
      try {
        attempt.current = {
          submissionId: crypto.randomUUID(), target, vote,
          reason: vote === "helpful" ? null : reason, feedbackConsent: true,
        };
      } catch {
        setError("접수 번호를 만들지 못했습니다. 브라우저 연결 환경을 확인해 주세요.");
        return;
      }
    }
    const request = attempt.current;
    const currentVisit = visit.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    inFlight.current = { controller, timeout };
    setLocked(true);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "same-origin", body: JSON.stringify(request), signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (visit.current !== currentVisit) return;
      if (response.ok && typeof data === "object" && data !== null &&
        "ok" in data && data.ok === true && "receiptId" in data && data.receiptId === request.submissionId &&
        "duplicate" in data && typeof data.duplicate === "boolean") {
        setReceipt(request.submissionId);
      } else if (response.status === 429) {
        setError("짧은 시간에 접수가 많았습니다. 잠시 후 같은 의견으로 다시 확인해 주세요.");
      } else if (response.status === 409) {
        setError("접수 번호의 내용이 일치하지 않아 저장 완료를 확인하지 못했습니다. 아래 자세한 문의에서 운영자에게 알려주세요.");
      } else {
        setError("저장 완료를 확인하지 못했습니다. 선택을 유지하고 같은 접수 번호로 다시 확인할 수 있습니다.");
      }
    } catch {
      if (visit.current === currentVisit) setError("연결이 끊기거나 응답 시간이 초과되어 저장 여부를 확인하지 못했습니다. 이미 저장됐을 수도 있으니 같은 의견으로 다시 확인해 주세요.");
    } finally {
      window.clearTimeout(timeout);
      if (visit.current === currentVisit) {
        inFlight.current = null;
        setPending(false);
      }
    }
  }

  return (
    <section aria-labelledby={headingId} className="my-10 rounded-2xl border border-electric/20 bg-white p-5 sm:p-6 text-navy">
      {receipt ? (
        <>
          <h2 ref={heading} id={headingId} tabIndex={-1} className="text-base font-black">의견이 비공개로 저장되었습니다</h2>
          <p role="status" className="mt-2 text-sm leading-6 text-muted-blue">페이지 개선을 위해 운영자가 확인합니다. 공개 댓글이나 개별 답변 알림은 제공하지 않습니다.</p>
          <details className="mt-3 text-xs text-muted-blue">
            <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold">접수 번호 보기 · 정정·삭제 요청용</summary>
            <p className="mt-2 break-all select-all rounded-lg bg-canvas p-3 font-mono">{receipt}</p>
          </details>
        </>
      ) : (
        <form onSubmit={submit}>
          <h2 id={headingId} className="text-base font-black">이 페이지가 도움이 됐나요?</h2>
          <p className="mt-2 text-xs leading-6 text-muted-blue">선택 후 보내기를 눌러야 접수됩니다. 참여는 선택입니다.</p>
          <fieldset disabled={locked || pending} className="mt-3 space-y-4 disabled:opacity-75">
            <legend className="sr-only">도움 여부와 이유 선택</legend>
            <div className="flex flex-wrap gap-2">
              {([['helpful', '도움 됐어요'], ['confusing', '헷갈려요']] as const).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={vote === value} className={`${choiceClass} ${vote === value ? "border-electric bg-electric/10 text-electric" : "border-canvas-200 text-muted-blue"}`} onClick={() => { setVote(value); setReason(null); }}>{label}</button>
              ))}
            </div>
            {vote === "confusing" && (
              <fieldset className="rounded-xl bg-canvas p-3">
                <legend className="px-1 text-xs font-bold">가장 가까운 이유 하나를 골라 주세요</legend>
                {config.reasons.map(option => (
                  <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3 py-2 text-sm">
                    <input type="radio" name={`${headingId}-reason`} value={option.value} checked={reason === option.value} onChange={() => setReason(option.value)} required className="h-4 w-4 shrink-0 accent-blue-600" />
                    <span>{option.label}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <p className="text-xs leading-6 text-muted-blue">페이지·선택한 의견과 이유·접수 번호·시각을 비공개 개선에 사용합니다. 계산 입력값과 결과는 포함하지 않습니다. 접수일부터 90일을 보유 기준으로 운영자가 삭제 관리합니다. <Link href="/privacy" className="inline-flex min-h-11 items-center font-bold text-electric underline underline-offset-4">개인정보 처리방침</Link></p>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-xs leading-6">
              <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required className="mt-1 h-4 w-4 shrink-0 accent-blue-600" />
              <span>의견 접수를 위한 위 정보의 수집·이용에 동의합니다. 동의하지 않아도 계산은 이용할 수 있습니다.</span>
            </label>
          </fieldset>
          {locked && !pending && <p className="mt-3 text-xs leading-6 text-muted-blue">중복 접수를 막기 위해 보낸 선택을 유지합니다. 새로고침하면 이 화면의 접수 상태가 사라집니다.</p>}
          <button type="submit" disabled={pending || !consent || !vote || (vote === "confusing" && !reason)} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-electric px-5 py-3 text-sm font-bold text-white disabled:cursor-default disabled:opacity-50">{pending ? "저장 확인 중…" : locked ? "같은 의견으로 다시 확인" : "의견 보내기"}</button>
          <p role="status" className="sr-only">{pending ? "저장 확인 중입니다." : ""}</p>
          {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">{error}</p>}
          {error && attempt.current && <details className="mt-2 text-xs text-muted-blue"><summary className="inline-flex min-h-11 cursor-pointer items-center">확인 중인 접수 번호 보기</summary><p className="break-all select-all font-mono">{attempt.current.submissionId}</p></details>}
        </form>
      )}
      <Link href={contactHref} className="mt-3 inline-flex min-h-11 items-center text-xs font-bold text-electric underline underline-offset-4">자세한 내용은 비공개 문의로 보내기</Link>
    </section>
  );
}
