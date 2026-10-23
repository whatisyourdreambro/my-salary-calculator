"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "@/components/AppLink";
import { contentIssue } from "@/lib/contentModeration";
import { OPINION_CONTRACT_VERSION, type OpinionRequest, type ParticipationTarget } from "@/lib/participationContract";
import { uuidV4 } from "@/lib/uuidV4";

/** Private draft stays in component memory; no local storage or analytics. */
export default function PrivateOpinion({ target }: { target: ParticipationTarget }) {
  const [body, setBody] = useState("");
  const [consent, setConsent] = useState(false);
  const [composing, setComposing] = useState(false);
  const composingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [locked, setLocked] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const [restartRequired, setRestartRequired] = useState(false);
  const attempt = useRef<OpinionRequest | null>(null);
  const flight = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const issue = composing ? null : contentIssue(body, "opinion");
  const fieldId = `private-opinion-${target}`;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; flight.current?.abort(); };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (flight.current || receipt || composingRef.current || !mounted.current || restartRequired) return;
    if (!attempt.current) {
      const normalized = body.replace(/\r\n?/g, "\n").trim();
      if (!consent || !normalized || contentIssue(normalized, "opinion")) return;
      try {
        attempt.current = { submissionId: uuidV4(), contractVersion: OPINION_CONTRACT_VERSION,
          target, body: normalized, inquiryConsent: true };
      } catch { setError("접수 번호를 만들지 못했습니다. 브라우저 연결 환경을 확인해 주세요."); return; }
    }
    const request = attempt.current;
    const controller = new AbortController();
    flight.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setLocked(true); setPending(true); setError("");
    try {
      const response = await fetch("/api/participation/opinions", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify(request), signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!mounted.current || flight.current !== controller) return;
      if (response.ok && data !== null && typeof data === "object" && "ok" in data && data.ok === true
        && "receiptId" in data && data.receiptId === request.submissionId && "duplicate" in data && typeof data.duplicate === "boolean") {
        setReceipt(request.submissionId); setBody(""); attempt.current = null;
      } else if (response.status === 400 && data !== null && typeof data === "object" && "error" in data && data.error === "CONTRACT_CHANGED") {
        setRestartRequired(true); setConsent(false);
        setError("동의 내용이 변경되어 이번 요청은 접수되지 않았습니다. 작성 내용을 별도로 보관하고 새로고침한 뒤 동의 내용을 다시 확인해 주세요.");
      } else if (response.status === 409) {
        setRestartRequired(true); setConsent(false);
        setError("접수 번호의 내용 또는 유효기간이 맞지 않아 완료를 확인하지 못했습니다. 작성 내용을 별도로 보관해 주세요. 새 접수는 새로고침한 뒤 다시 동의하여 진행할 수 있습니다.");
      } else if (response.status === 400 && data !== null && typeof data === "object" && "error" in data
        && ["CONTENT_NOT_ALLOWED", "PERSONAL_DATA_NOT_ALLOWED", "INVALID_REQUEST"].includes(String(data.error))) {
        // A definitive validation rejection is not an uncertain network outcome.
        attempt.current = null; setLocked(false);
        setError("내용이 접수되지 않았습니다. 욕설·개인정보·링크를 제외하고 200자 이내로 수정해 주세요.");
      } else if (response.status === 429) {
        setError("현재 접수 한도에 도달했습니다. 자동으로 재전송하지 않습니다. 잠시 후 같은 접수 번호로 확인해 주세요.");
      } else {
        setError("저장 완료를 확인하지 못했습니다. 같은 접수 번호로 다시 확인할 수 있습니다.");
      }
    } catch {
      if (mounted.current && flight.current === controller) setError("연결이 끊겨 저장 여부를 확인하지 못했습니다. 같은 내용과 접수 번호로 다시 확인해 주세요.");
    } finally {
      window.clearTimeout(timeout);
      if (flight.current === controller) { flight.current = null; if (mounted.current) setPending(false); }
    }
  }

  return <details className="mt-4 border-t border-canvas-200 pt-3">
    <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-bold">짧은 의견 비공개로 보내기</summary>
    {receipt ? <div role="status" className="mt-3 text-sm leading-6">
      <p>의견이 비공개로 접수되었습니다. 공개 댓글이나 답변 알림은 제공하지 않습니다.</p>
      <details><summary className="inline-flex min-h-11 cursor-pointer items-center">정정·삭제 요청용 접수 번호</summary><p className="break-all select-all font-mono text-xs">{receipt}</p></details>
    </div> : <form onSubmit={submit} className="mt-3 space-y-3">
      <fieldset disabled={locked || pending} className="space-y-3 disabled:opacity-75">
        <label htmlFor={fieldId} className="block text-sm font-bold">개선 의견 · 최대 200자</label>
        <textarea id={fieldId} value={body} maxLength={200} rows={4} required
          onChange={event => setBody(event.target.value)}
          onCompositionStart={() => { composingRef.current = true; setComposing(true); }}
          onCompositionEnd={event => { composingRef.current = false; setComposing(false); setBody(event.currentTarget.value); }}
          aria-invalid={Boolean(issue)} aria-describedby={`${fieldId}-help`}
          className="w-full rounded-xl border border-canvas-300 p-3 text-base focus-visible:outline-electric" />
        <p id={`${fieldId}-help`} className="text-xs leading-6 text-muted-blue">
          {body.length}/200자 · {issue ? "욕설·위협·개인정보·링크 또는 허용되지 않는 문자가 포함되어 전송할 수 없습니다." : "불편한 점과 개선 요청을 적어 주세요. 욕설·위협·개인정보·링크는 접수할 수 없습니다."}
        </p>
        <p className="text-xs leading-6 text-muted-blue">운영자가 페이지 개선을 위해 페이지 구분·의견·접수 번호·시각을 확인합니다. 접수일부터 90일 보관을 기준으로 정기 삭제하며 공개하지 않습니다. 회신이 필요한 내용은 <Link href="/contact" className="font-bold underline">비공개 문의</Link>를 이용해 주세요.</p>
        <label className="flex min-h-11 items-start gap-3 text-xs leading-6"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required className="mt-1 h-4 w-4 shrink-0" /><span>위 정보의 비공개 수집·이용에 동의합니다. 참여하지 않아도 계산을 이용할 수 있습니다.</span></label>
      </fieldset>
      <button type="submit" disabled={pending || composing || Boolean(issue) || !body.trim() || !consent || restartRequired} className="inline-flex min-h-11 items-center rounded-xl bg-electric px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "저장 확인 중…" : locked ? "같은 의견으로 다시 확인" : "비공개 의견 보내기"}</button>
      {error && <p role="alert" className="text-sm leading-6 text-red-800">{error}</p>}
      {error && attempt.current && <details className="text-xs"><summary className="inline-flex min-h-11 cursor-pointer items-center">확인 중인 접수 번호</summary><p className="break-all select-all font-mono">{attempt.current.submissionId}</p></details>}
    </form>}
  </details>;
}
