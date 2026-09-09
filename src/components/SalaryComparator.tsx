"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { initialOfferComparisonState, offerComparisonReducer, explainOfferDifference } from "@/lib/offerComparison";
import { trackOfferCompareComplete, trackOfferCompareExplanationView } from "@/lib/analytics";
import { consumeOfferComparisonHandoff, type OfferComparisonConditions } from "@/lib/offerComparisonHandoff";
import { prepareOfferComparisonExport } from "@/lib/offerComparisonExport";
import Link from "@/components/AppLink";
import CurrencyInput from "./CurrencyInput";
import { X } from "lucide-react";

const formatNumber = (value: number) => value.toLocaleString("ko-KR");
const signed = (value: number) => `${value > 0 ? "+" : ""}${formatNumber(value)}원`;

export default function SalaryComparator() {
  const [state, dispatch] = useReducer(offerComparisonReducer, initialOfferComparisonState);
  const { offers, settings, comparison, stale, error } = state;
  const [capturing, setCapturing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [anonymousNames, setAnonymousNames] = useState(true);
  const [handoff, setHandoff] = useState<OfferComparisonConditions | null>(null);
  const handoffConsumed = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const currentComparison = useRef(comparison);
  const pendingUserSubmit = useRef(false);
  const completed = useRef(false);
  const explained = useRef<typeof comparison>(null);
  currentComparison.current = comparison;
  const id = useId();
  const pathname = usePathname();

  useEffect(() => { completed.current = false; explained.current = null; }, [pathname]);
  useEffect(() => {
    if (pathname !== "/calc/offer-compare" || handoffConsumed.current) return;
    handoffConsumed.current = true;
    try { setHandoff(consumeOfferComparisonHandoff(window.sessionStorage)); }
    catch { /* Restricted storage leaves manual entry available. */ }
  }, [pathname]);
  useEffect(() => {
    if (comparison) {
      headingRef.current?.focus();
      if (pendingUserSubmit.current) {
        pendingUserSubmit.current = false;
        trackOfferCompareComplete(completed.current ? "recalculate" : "first");
        completed.current = true;
      }
    }
    setShareMessage("");
  }, [comparison]);

  const handleCapture = async () => {
    const snapshot = comparison;
    const element = resultsRef.current;
    if (!snapshot || !element || capturing) return;
    const expanded = Array.from(element.querySelectorAll("details"), details => details.open);
    setCapturing(true);
    setShareMessage("");
    try {
      const { default: html2canvas } = await import("html2canvas");
      if (currentComparison.current !== snapshot) return;
      const canvas = await html2canvas(element, { scale: 2,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#1a202c" : "#ffffff",
        onclone: clonedDocument => {
          const clonedArea = clonedDocument.getElementById(element.id);
          if (clonedArea) prepareOfferComparisonExport(clonedArea, expanded);
        } });
      if (currentComparison.current !== snapshot) return;
      const link = document.createElement("a");
      link.download = "연봉비교_결과_moneysalary.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setShareMessage("이미지를 저장하지 못했습니다. 현재 결과를 확인한 뒤 다시 시도해 주세요.");
    } finally { setCapturing(false); }
  };

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText("같은 조건으로 오퍼의 예상 실수령액을 비교해 보세요. https://www.moneysalary.com/calc/offer-compare");
      setShareMessage("금액과 회사명이 없는 계산기 링크를 복사했습니다.");
    } catch { setShareMessage("링크를 복사하지 못했습니다. https://www.moneysalary.com/calc/offer-compare 주소를 이용해 주세요."); }
  };
  const displayName = (offerId: number, name: string) => anonymousNames
    ? `오퍼 ${String.fromCharCode(65 + offers.findIndex(offer => offer.id === offerId))}` : name;
  const baseline = comparison?.results.find(result => result.id === comparison.baselineId);
  const highestMonthlyNet = comparison?.results[0]?.monthlyNet;
  const inputStyle = "w-full min-w-0 p-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-6">
      {handoff && <section className="rounded-xl border border-primary bg-primary/5 p-4 space-y-3" aria-label="홈에서 가져온 조건 확인">
        <h2 className="font-bold">홈에서 계산한 조건을 적용할까요?</h2>
        <p className="text-sm">세전 연봉 {formatNumber(handoff.annualGross)}원 · 월 비과세 {formatNumber(handoff.nonTaxableMonthly)}원(연봉에 포함) · 기본공제 대상 {handoff.dependents}명 · 공제 대상 자녀 {handoff.children}명</p>
        <p className="text-xs text-muted-foreground">적용하면 첫 오퍼의 계약 연봉과 공통 조건을 바꾸고, 첫 오퍼의 추가 성과급·수당은 비웁니다. 두 번째 오퍼는 유지합니다. 결과는 두 오퍼를 확인하고 비교 버튼을 눌러야 계산됩니다.</p>
        <p className="text-xs text-muted-foreground">홈의 정규직 계산과 같은 2026년 모델로 다시 계산합니다. 연간 총액·월 비과세액·가족 조건이 같으면 예상 실수령액도 같습니다.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" className="rounded-lg bg-primary text-primary-foreground px-4 py-3 font-semibold" onClick={() => {
            pendingUserSubmit.current = false;
            dispatch({ type: "prefill", ...handoff });
            setHandoff(null);
          }}>첫 오퍼와 공통 조건에 적용</button>
          <button type="button" className="rounded-lg border border-border px-4 py-3" onClick={() => setHandoff(null)}>사용하지 않고 닫기</button>
        </div>
      </section>}
      <form onSubmit={event => {
        event.preventDefault();
        if (comparison) { headingRef.current?.focus(); return; }
        pendingUserSubmit.current = event.nativeEvent.isTrusted;
        dispatch({ type: "compare" });
      }} noValidate>
        <fieldset className="bg-card p-4 sm:p-6 rounded-xl border border-border space-y-4">
          <legend className="px-2 text-lg font-bold">모든 오퍼에 적용할 공통 조건</legend>
          <p className="text-sm text-muted-foreground">비과세액은 세전 총액에 포함된 금액입니다. 계약 연봉에 이미 들어 있는 성과급·수당을 다시 더하지 마세요.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CurrencyInput label="비과세액 (월, 총액에 포함)" value={settings.nonTaxableAmount}
              onValueChange={value => dispatch({ type: "settings", value: { ...settings, nonTaxableAmount: value } })}
              quickAmounts={[100000, 50000]} className="pr-8" />
            <div>
              <label htmlFor={`${id}-dependents`} className="block text-sm font-medium mb-2">기본공제 대상 가족 (본인 포함)</label>
              <input id={`${id}-dependents`} type="number" min={1} max={20} step={1} value={settings.dependents}
                onChange={event => dispatch({ type: "settings", value: { ...settings, dependents: event.target.value === "" ? 0 : Number(event.target.value) } })}
                className={inputStyle} aria-describedby={`${id}-family-help`} />
            </div>
            <div>
              <label htmlFor={`${id}-children`} className="block text-sm font-medium mb-2">만 8세 이상 공제 대상 자녀</label>
              <input id={`${id}-children`} type="number" min={0} max={10} step={1} value={settings.children}
                onChange={event => dispatch({ type: "settings", value: { ...settings, children: event.target.value === "" ? 0 : Number(event.target.value) } })}
                className={inputStyle} aria-describedby={`${id}-family-help`} />
            </div>
          </div>
          <p id={`${id}-family-help`} className="text-xs text-muted-foreground">자녀·손자녀는 소득·기본공제 조건을 충족하는 만 8세 이상 인원입니다(통상 만 20세 이하, 장애인 나이 예외). 위 가족 수에도 포함해 주세요.</p>
        </fieldset>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {offers.map((offer, index) => (
            <fieldset key={offer.id} className="min-w-0 bg-card p-4 sm:p-6 rounded-xl border border-border space-y-4">
              <legend className="px-2 font-bold">오퍼 {index + 1}</legend>
              <div className="flex gap-2 items-center">
                <label htmlFor={`${id}-company-${offer.id}`} className="sr-only">오퍼 {index + 1} 회사명</label>
                <input id={`${id}-company-${offer.id}`} type="text" maxLength={60} value={offer.companyName}
                  onChange={event => dispatch({ type: "offer", id: offer.id, field: "companyName", value: event.target.value })}
                  placeholder="회사명 (선택)" className={`${inputStyle} font-bold`} />
                <button type="button" onClick={() => dispatch({ type: "remove", id: offer.id })} disabled={offers.length <= 2}
                  aria-label={`오퍼 ${index + 1} 삭제`} className="p-3 shrink-0 rounded-lg hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <CurrencyInput label={`오퍼 ${index + 1} 계약 연봉 (세전)`} value={offer.salary}
                onValueChange={value => dispatch({ type: "offer", id: offer.id, field: "salary", value })}
                quickAmounts={[10000000, 1000000, 100000]} className="pr-8" />
              <CurrencyInput label={`오퍼 ${index + 1} 추가 성과급 (연)`} value={offer.bonus}
                onValueChange={value => dispatch({ type: "offer", id: offer.id, field: "bonus", value })}
                quickAmounts={[10000000, 1000000, 100000]} className="pr-8" />
              <CurrencyInput label={`오퍼 ${index + 1} 추가 수당 (연)`} value={offer.overtime}
                onValueChange={value => dispatch({ type: "offer", id: offer.id, field: "overtime", value })}
                quickAmounts={[10000000, 1000000, 100000]} className="pr-8" />
            </fieldset>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">추가 성과급·수당의 빈칸은 0원으로 계산합니다. 주식 보상·복지·근로시간·퇴직금은 이번 금액 비교에 포함하지 않습니다.</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button type="button" onClick={() => dispatch({ type: "add" })} disabled={offers.length >= 10}
            className="w-full py-3 bg-secondary font-semibold rounded-lg disabled:opacity-40">+ 오퍼 추가 ({offers.length}/10)</button>
          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg">같은 조건으로 비교하기</button>
        </div>
      </form>
      <div aria-live="polite" role="status">{stale && <p className="rounded-lg bg-secondary p-4 text-sm">입력이 바뀌어 이전 비교 결과를 숨겼습니다. 같은 조건으로 다시 비교해 주세요.</p>}</div>
      {error && <p role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">{error}</p>}
      {comparison && baseline && (
        <>
          <label className="flex items-center gap-3 rounded-lg bg-secondary p-4 text-sm">
            <input type="checkbox" checked={anonymousNames} disabled={capturing} onChange={event => setAnonymousNames(event.target.checked)} />
            아래 결과와 저장 이미지의 회사명을 오퍼 A/B로 표시
          </label>
          <div id={`${id}-export`} ref={resultsRef} className="min-w-0 bg-card p-4 sm:p-6 rounded-xl border border-border space-y-5">
            <h2 ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold focus:outline-none">같은 조건의 월 예상 실수령 비교</h2>
            <p className="text-sm text-muted-foreground">월 예상 실수령액이 큰 순서입니다. 연간 세액 추정을 12개월로 나눈 모드이며, 월별 간이세액표 조회나 성과급 지급월 입금액·연말정산 확정 세액은 아닙니다.</p>
            <div className="rounded-lg bg-secondary p-4 text-sm space-y-2">
              <p>2026년 기준 모델 · 월 비과세 {formatNumber(comparison.settings.monthlyNonTaxable)}원 · 기본공제 대상 {comparison.settings.dependents}명(본인 포함) · 자녀세액공제 대상 {comparison.settings.children}명</p>
              <p className="text-xs text-muted-foreground">국민연금 상·하한은 2026년 7월 이후 기준입니다. 중소기업 청년 감면, 장애인·경로우대 추가공제, 연간 건강보험료 등 특별공제와 개인별 연말정산 공제는 반영하지 않습니다. 같은 공통 조건이어도 소득에 따른 세금·보험료가 달라집니다.</p>
              <p className="flex flex-wrap gap-x-4 gap-y-2 text-xs"><Link href="/income-tax-2026" className="text-primary underline">세율·공제 기준 설명</Link><Link href="/social-insurance-rates-2026" className="text-primary underline">보험료 기준 설명</Link></p>
            </div>
            {comparison.results.map(result => {
              const difference = explainOfferDifference(result, baseline);
              const highest = result.monthlyNet === highestMonthlyNet;
              const differenceRows: [string, number][] = [
                ["계약 연봉 차이", difference.salary], ["추가 성과급 차이", difference.bonus], ["추가 수당 차이", difference.overtime],
                ["세전 총액 차이", difference.gross], ["보험료 차이 (연환산)", difference.insurance], ["소득세·지방소득세 차이 (연환산)", difference.tax],
                ["원 단위 처리 조정 차이", difference.rounding], ["공제액 차이 (연환산)", difference.deductions],
                ["실수령액 차이 (연환산)", difference.net], ["월 예상 실수령액 차이", difference.monthlyNet],
              ];
              return (
                <section key={result.id} className={`min-w-0 rounded-lg border-2 p-4 space-y-3 ${highest ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold break-words">{displayName(result.id, result.companyName)}</h3>
                      {highest && <p className="text-xs font-bold text-primary">월 예상 실수령 최고{comparison.results.filter(item => item.monthlyNet === highestMonthlyNet).length > 1 ? " (공동)" : ""}</p>}
                    </div>
                    <p className="text-xl font-bold text-primary break-words">월 {formatNumber(result.monthlyNet)}원</p>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div><dt className="text-muted-foreground">연 세전 총액</dt><dd className="font-semibold break-words">{formatNumber(result.totalAnnual)}원</dd></div>
                    <div><dt className="text-muted-foreground">공제액 연환산</dt><dd className="font-semibold break-words">{formatNumber(result.annualDeduction)}원</dd></div>
                    <div><dt className="text-muted-foreground">실수령액 연환산</dt><dd className="font-semibold break-words">{formatNumber(result.annualNet)}원</dd></div>
                  </dl>
                  <details className="rounded-lg bg-background p-3">
                    <summary className="cursor-pointer font-semibold text-sm" onClick={event => {
                      const details = event.currentTarget.parentElement as HTMLDetailsElement;
                      if (!details.open && event.nativeEvent.isTrusted && explained.current !== comparison) {
                        explained.current = comparison;
                        trackOfferCompareExplanationView();
                      }
                    }}>{result.id === baseline.id ? "기준 오퍼의 계산 내용" : `${displayName(baseline.id, baseline.companyName)}와 결과가 다른 이유`}</summary>
                    <div className="mt-3 space-y-3 text-sm break-words">
                      <p>계약 연봉 {formatNumber(result.salary)}원 + 추가 성과급 {formatNumber(result.bonus)}원 + 추가 수당 {formatNumber(result.overtime)}원 = 연 세전 총액 {formatNumber(result.totalAnnual)}원</p>
                      <p>보험료 연환산 {formatNumber(result.annualInsurance)}원 + 소득세·지방소득세 연환산 {formatNumber(result.annualTax)}원 + 원 단위 처리 조정 {signed(result.roundingAdjustment)} = 공제액 연환산 {formatNumber(result.annualDeduction)}원</p>
                      {result.id !== baseline.id && <>
                        <p>첫 번째로 입력한 <strong>{displayName(baseline.id, baseline.companyName)}</strong>를 기준으로 비교합니다.</p>
                        <dl className="space-y-2">{differenceRows.map(([label, value]) => (
                          <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt>{label}</dt><dd className="font-semibold">{signed(value)}</dd></div>
                        ))}</dl>
                        <p className="rounded bg-secondary p-3">세전 차이 {signed(difference.gross)} − 공제 차이 ({signed(difference.deductions)}) = 실수령 차이 {signed(difference.net)} (연환산)</p>
                        <p className="text-xs text-muted-foreground">공제 차이가 양수면 기준 오퍼보다 더 공제되고, 음수면 덜 공제됩니다. 급여·성과급·수당을 합친 소득으로 계산하므로 각 입력이 세금에 미친 효과를 독립적으로 더한 값은 아닙니다.</p>
                      </>}
                      <p className="text-xs text-muted-foreground">홈과 같은 월 계산값을 12배했습니다. 원 단위 이하 처리에 따른 연환산 차이를 조정해 세전 총액 − 공제액 = 실수령액이 맞도록 표시합니다.</p>
                    </div>
                  </details>
                </section>
              );
            })}
            <p className="text-xs text-muted-foreground">금액 기준의 비교이며 보상 확정 여부, 근로시간, 복지, 고용 안정성을 포함한 이직 추천 순위는 아닙니다.</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">이미지에는 위 결과 영역의 이름·금액·공통 조건과 펼쳐 둔 설명이 포함됩니다. 익명 표시는 이름만 바꾸며 금액은 숨기지 않습니다. 공유 전에 위 미리보기를 확인하세요.</p>
            <button type="button" onClick={handleCapture} disabled={capturing}
              className="w-full py-3 bg-secondary font-semibold rounded-lg disabled:opacity-50">{capturing ? "이미지 만드는 중…" : "결과 이미지 저장"}</button>
            <button type="button" onClick={copyPublicLink} className="w-full py-3 border border-border rounded-lg font-semibold">금액 없는 계산기 링크 복사</button>
            <p role="status" aria-live="polite" className="text-sm">{shareMessage}</p>
          </div>
        </>
      )}
    </div>
  );
}
