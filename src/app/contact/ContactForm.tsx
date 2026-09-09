"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/AppLink";

const TYPES = [
  ["calculation_error", "계산 오류", "Calculation error"],
  ["explanation", "설명이 어려워요", "An explanation is unclear"],
  ["data_correction", "정보 정정·삭제", "Correct or remove information"],
  ["business", "서비스·위젯 제안", "Service or widget proposal"],
  ["privacy", "개인정보 관련 요청", "Privacy request"],
  ["other", "기타", "Other"],
] as const;
type InquiryType = (typeof TYPES)[number][0];
const SOURCES: Record<string, string> = {
  "samsung-bonus": "/calc/samsung-bonus",
  "civil-servant-pay-2027": "/civil-servant-pay-2027",
  "samsung-electronics": "/salary-db/samsung-electronics",
  embed: "/embed",
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  qna: "/qna",
};
const fieldClass = "mt-2 w-full rounded-xl border border-canvas-200 bg-white px-3 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-electric";

export default function ContactForm({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  const text = (ko: string, english: string) => en ? english : ko;
  const params = useSearchParams();
  const initialType = TYPES.find(([value]) => value === params.get("type"))?.[0] ?? "calculation_error";
  const [type, setType] = useState<InquiryType>(initialType);
  const [pagePath, setPagePath] = useState(() => {
    const source = params.get("source") ?? "";
    if (en && ["about", "privacy", "terms"].includes(source)) return `/en/${source}`;
    return SOURCES[source] ?? "";
  });
  const [body, setBody] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [inquiryConsent, setInquiryConsent] = useState(false);
  const [replyConsent, setReplyConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const lastAttempt = useRef<{ payload: string; id: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (receipt) heading.current?.focus();
  }, [receipt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || receipt) return;
    setError("");
    const trimmedPath = pagePath.trim() || (en ? "/en/contact" : "/contact");
    if (!trimmedPath.startsWith("/") || trimmedPath.startsWith("//") || /[?#\\\s]/.test(trimmedPath)) {
      setError(text("관련 페이지는 /calc/samsung-bonus처럼 경로만 입력해 주세요. 주소의 ? 또는 # 이후 내용은 제외해 주세요.", "Enter only a site path, such as /en/flat-tax. Remove everything after ? or #."));
      return;
    }
    if (!body.trim()) {
      setError(text("문의 내용을 입력해 주세요.", "Enter your message."));
      return;
    }
    const normalized = { type, pagePath: trimmedPath, body: body.trim(), inquiryConsent, replyEmail: replyEmail.trim(), replyConsent: !!replyEmail.trim() && replyConsent };
    const payload = JSON.stringify(normalized);
    if (lastAttempt.current?.payload !== payload) lastAttempt.current = { payload, id: crypto.randomUUID() };
    const submissionId = lastAttempt.current!.id;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ submissionId, ...normalized }),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (response.ok && typeof data === "object" && data !== null && "ok" in data && data.ok === true && "receiptId" in data && data.receiptId === submissionId) {
        setReceipt(submissionId);
        setBody("");
      } else if (response.status === 429) {
        setError(text("짧은 시간에 접수가 많았습니다. 잠시 후 다시 시도해 주세요. 입력 내용은 이 화면에 남아 있습니다.", "Too many submissions in a short period. Try again later. Your message remains on this screen."));
      } else if (response.status === 400 || response.status === 413 || response.status === 415) {
        setError(text("입력 형식과 동의 항목을 확인해 주세요. 내용은 HTML 없이 500자 이내로 적고, 관련 페이지에는 사이트 내부 경로만 입력해 주세요.", "Check your input and consent. Use up to 500 characters without HTML and enter only an internal site path."));
      } else if (response.status === 409) {
        setError(text("이 접수 번호의 내용이 이미 저장되어 다시 확인해야 합니다. 새로고침하지 말고 입력 내용을 보관해 주세요.", "This receipt ID already has different content and needs checking. Keep a copy of your message before refreshing."));
      } else {
        setError(text("접수 완료를 확인하지 못했습니다. 입력 내용은 유지됩니다. 같은 내용으로 다시 보내면 동일한 접수 번호로 확인합니다.", "We could not confirm receipt. Your message is still here. Retrying unchanged content uses the same receipt ID."));
      }
    } catch {
      setError(text("연결이 끊겨 접수 여부를 확인하지 못했습니다. 같은 내용으로 다시 보내면 중복 접수를 확인합니다. 새로고침하면 입력 내용이 사라집니다.", "The connection failed, so receipt is unconfirmed. Retrying unchanged content checks for a duplicate. Refreshing clears your message."));
    } finally {
      window.clearTimeout(timeout);
      setPending(false);
    }
  }

  if (receipt) return (
    <section className="mt-8 rounded-2xl border border-electric/30 bg-white p-6" aria-labelledby="contact-received">
      <h2 ref={heading} tabIndex={-1} id="contact-received" className="text-xl font-black text-navy">{text("비공개 접수가 완료되었습니다", "Your private message was received")}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-blue">{text("운영자가 확인할 접수함에 저장되었습니다. 공개 게시글이나 댓글로 표시되지 않습니다.", "It was stored in the operator’s private inbox. It will not appear as a public post or comment.")}</p>
      <p className="mt-3 text-xs text-muted-blue">{text("접수 번호 — 정정·삭제 요청 시 사용하세요.", "Receipt ID — keep this for a correction or deletion request.")}</p>
      <p className="mt-1 break-all select-all rounded-lg bg-canvas p-3 font-mono text-sm text-navy">{receipt}</p>
      <p className="mt-4 text-sm leading-6 text-muted-blue">{replyEmail.trim() ? text("필요한 경우 입력한 이메일로 운영자가 회신할 수 있습니다. 답변 시점은 접수 내용과 확인에 필요한 시간에 따라 달라집니다.", "The operator may reply to your email if needed. Timing depends on the message and the checks required; no automatic reply is sent.") : text("회신 이메일을 입력하지 않아 개별 답변 알림은 제공되지 않습니다. 접수 내용은 사이트 개선과 정정 검토에 활용됩니다.", "You did not provide a reply email, so individual reply notifications are unavailable. Your message can still inform site improvements and corrections.")}</p>
      <Link href={en ? "/en" : "/"} className="mt-5 inline-flex min-h-11 items-center font-bold text-electric underline underline-offset-4">{text("계산기로 돌아가기", "Return to English tools")}</Link>
    </section>
  );

  return (
    <form lang={locale} onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-canvas-200 bg-white p-5 sm:p-7">
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-70">
        <div>
          <label htmlFor="inquiry-type" className="text-sm font-bold text-navy">{text("문의 종류", "Message type")}</label>
          <select id="inquiry-type" value={type} onChange={e => setType(e.target.value as InquiryType)} className={fieldClass}>
            {TYPES.map(([value, label, english]) => <option key={value} value={value}>{en ? english : label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="inquiry-page" className="text-sm font-bold text-navy">{text("관련 페이지", "Related page")} <span className="font-normal text-muted-blue">{text("(선택)", "(optional)")}</span></label>
          <input id="inquiry-page" value={pagePath} onChange={e => setPagePath(e.target.value)} maxLength={200} placeholder={text("예: /calc/samsung-bonus", "For example: /en/flat-tax")} autoComplete="off" spellCheck={false} className={fieldClass} aria-describedby="inquiry-page-help" />
          <p id="inquiry-page-help" className="mt-2 text-xs leading-5 text-muted-blue">{text("주소에서 moneysalary.com 뒤의 경로만 입력하세요. 계산 입력값이 담긴 공유 주소는 보내지 마세요.", "Enter only the path after moneysalary.com. Do not send a result-sharing URL containing personal inputs.")}</p>
        </div>
        <div>
          <label htmlFor="inquiry-body" className="text-sm font-bold text-navy">{text("문의 내용", "Message")}</label>
          <textarea id="inquiry-body" value={body} onChange={e => setBody(e.target.value)} required maxLength={500} rows={6} className={fieldClass} aria-describedby="inquiry-body-help inquiry-length" placeholder={text("어떤 페이지의 어느 설명이나 계산에서 문제가 있었는지 알려주세요.", "Tell us which page, explanation or calculation needs attention.")} />
          <div className="mt-2 flex justify-between gap-4 text-xs leading-5 text-muted-blue">
            <p id="inquiry-body-help">{text("실명·사번·정확한 개인 연봉·급여 명세서·계좌번호는 보내지 마세요. 첨부 파일과 HTML은 받지 않습니다. 정정 근거는 자료 이름·기준일 또는 공개 자료 링크로 적어주세요.", "Do not include your full name, employee ID, exact personal salary, payslip or bank account number. Attachments and HTML are not accepted. For corrections, cite a source title, date or public source link.")}</p>
            <span id="inquiry-length" className="shrink-0 tabular-nums">{body.length}/500</span>
          </div>
        </div>
        <div>
          <label htmlFor="inquiry-email" className="text-sm font-bold text-navy">{text("회신 이메일", "Reply email")} <span className="font-normal text-muted-blue">{text("(선택)", "(optional)")}</span></label>
          <input id="inquiry-email" type="email" value={replyEmail} onChange={e => { setReplyEmail(e.target.value); if (!e.target.value.trim()) setReplyConsent(false); }} maxLength={254} autoComplete="email" className={fieldClass} aria-describedby="inquiry-email-help" />
          <p id="inquiry-email-help" className="mt-2 text-xs leading-5 text-muted-blue">{text("비워 두어도 접수됩니다. 이메일이 없으면 개별 답변을 알려드릴 수 없습니다.", "You can submit without an email. Without one, we cannot notify you of an individual reply.")}</p>
        </div>
        <div className="space-y-3 rounded-xl bg-canvas p-4 text-xs leading-6 text-muted-blue">
          <p>{text("문의 종류·관련 경로·내용·접수 시각·처리 상태를 오류 확인과 문의 처리에 사용합니다. 회신 이메일은 입력한 경우에만 회신에 사용합니다. 접수일로부터 90일을 보유 기준으로 운영자가 삭제 관리하며, 내용은 공개하지 않습니다.", "Your message type, related path, content, receipt time and status are used to review errors and handle your inquiry. A supplied email is used for replies. The operator manages deletion against a 90-day retention standard from receipt; content is not published.")} <Link href={en ? "/en/privacy" : "/privacy"} className="font-bold text-electric underline underline-offset-4">{text("개인정보 처리방침", "Privacy policy")}</Link></p>
          <label className="flex min-h-11 items-start gap-3"><input type="checkbox" checked={inquiryConsent} onChange={e => setInquiryConsent(e.target.checked)} required className="mt-1 h-4 w-4 shrink-0 accent-blue-600" /><span>{text("[필수] 문의 접수를 위한 위 정보의 수집·이용에 동의합니다. 동의하지 않으면 접수할 수 없습니다.", "[Required] I consent to collection and use of the information above to receive and handle my message. Submission requires this consent.")}</span></label>
          {!!replyEmail.trim() && <label className="flex min-h-11 items-start gap-3"><input type="checkbox" checked={replyConsent} onChange={e => setReplyConsent(e.target.checked)} required className="mt-1 h-4 w-4 shrink-0 accent-blue-600" /><span>{text("[선택] 회신을 위한 이메일 수집·이용에 동의합니다. 이메일을 지우면 동의 없이 접수할 수 있습니다.", "[Optional] I consent to collection and use of my email for a reply. Remove the email to submit without this consent.")}</span></label>}
        </div>
        <button type="submit" disabled={pending} className="w-full rounded-xl bg-electric px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-wait">{pending ? text("접수 확인 중…", "Confirming receipt…") : text("운영자에게 비공개로 보내기", "Send privately to the operator")}</button>
      </fieldset>
      <p className="text-xs leading-5 text-muted-blue">{text("입력 중인 내용은 자동 저장하지 않습니다. 화면을 닫거나 새로고침하면 사라집니다.", "Drafts are not saved automatically. Closing or refreshing this screen clears your input.")}</p>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{error}</p>}
    </form>
  );
}
