"use client";

import { useState } from "react";
import { estimateHolidayWorkPay } from "@/lib/holidayPay";

export default function HolidayPayEstimate({ ordinaryHourlyDefault }: { ordinaryHourlyDefault: number | null }) {
  const [hourly, setHourly] = useState("");
  const [hours, setHours] = useState("8");
  const [night, setNight] = useState("0");
  const [eligible, setEligible] = useState(false);
  const rate = hourly === "" ? ordinaryHourlyDefault : Number(hourly);
  const result = hours.trim() && night.trim() && rate !== null ? estimateHolidayWorkPay({ ordinaryHourly: rate, hours: Number(hours), nightHours: Number(night), eligible }) : null;
  const won = (amount: number) => `${Math.round(amount).toLocaleString("ko-KR")}원`;
  const fieldClass = "mt-2 block min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground";
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6" aria-labelledby="holiday-estimate-heading">
    <h2 id="holiday-estimate-heading" className="text-lg font-bold">휴일에 일했다면?</h2>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">주휴수당과 별개로, 휴일에 실제 일한 시간의 임금과 가산액을 확인하세요. 이 결과는 오늘·이번 달 기록에 자동으로 더하지 않습니다.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      <label className="min-w-0 text-sm font-medium">통상시급 (원)<input className={fieldClass} type="number" min="1" max="100000000" inputMode="decimal" value={hourly} placeholder={ordinaryHourlyDefault !== null ? String(Math.round(ordinaryHourlyDefault)) : "통상시급 직접 입력"} onChange={(event) => setHourly(event.target.value)} /></label>
      <label className="min-w-0 text-sm font-medium">휴일 하루의 실제 근로 (시간)<input className={fieldClass} type="number" min="0" max="24" step="0.25" value={hours} onChange={(event) => setHours(event.target.value)} /></label>
      <label className="min-w-0 text-sm font-medium">그중 야간 근로 (시간)<input className={fieldClass} type="number" min="0" max="8" step="0.25" value={night} onChange={(event) => setNight(event.target.value)} /></label>
    </div>
    <p className="mt-3 text-xs leading-6 text-muted-foreground">휴게시간을 뺀 하루의 시간을 입력하고, 여러 휴일을 합산하지 마세요. 야간은 22:00~06:00이며 휴일 근로시간 안에 포함된 시간입니다. 통상시급이 비어 있으면 위 급여 설정에서 산출한 참고값을 사용합니다. 참고값이 없으면 직접 입력하세요.</p>
    <label className="mt-4 flex items-start gap-2 text-sm leading-6"><input className="mt-1 h-4 w-4 shrink-0" type="checkbox" checked={eligible} onChange={(event) => setEligible(event.target.checked)} />상시 근로자 5인 이상 사업장이며, 해당 시간이 법정·약정 휴일근로이고 가산 규정 적용 대상입니다.</label>
    {result ? <dl className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-secondary p-4 sm:grid-cols-4">{[["실제 근로임금", result.base], ["휴일 가산액", result.holidayPremium], ["야간 가산액", result.nightPremium], ["합계 · 세전", result.total]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-lg font-bold tabular-nums">{won(Number(value))}</dd></div>)}</dl> : <p className="mt-4 text-sm text-muted-foreground" role="status">{eligible ? "통상시급과 실제 근로·야간 시간을 확인해 주세요." : "적용 조건을 확인하면 예상 금액을 표시합니다."}</p>}
    <p className="mt-4 text-xs leading-6 text-muted-foreground">8시간 이내 휴일근로는 50%, 초과분은 100%, 야간근로는 50%를 가산한 참고 계산입니다. 쉬어도 지급되는 유급휴일 임금은 포함하지 않으며, 월급에 이미 포함된 금액과 중복해서 더하지 마세요. 보상휴가·휴일대체·특례·추가 약정은 반영하지 않습니다. <a className="underline underline-offset-4" href="https://1350.moel.go.kr/rtmview.do?id=1000111373" target="_blank" rel="noopener noreferrer">고용노동부 산정 안내</a></p>
  </section>;
}
