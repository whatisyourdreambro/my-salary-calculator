"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, BriefcaseBusiness, Calculator, Check, CheckCheck, House, PiggyBank, RotateCcw, ShieldCheck, Users, Wallet } from "lucide-react";
import Link from "@/components/AppLink";
import {
  getMoneyCheckItems, MONEY_CHECK_ITEMS, MONEY_CHECK_STORAGE_KEY, MONEY_CHECK_TOPICS,
  parseMoneyCheckProgress, serializeMoneyCheckProgress, updateMoneyCheckCompletion, type MoneyCheckFilter,
} from "@/lib/moneyCheck";

const TOPIC_ICONS = { salary: Wallet, tax: ShieldCheck, career: BriefcaseBusiness, home: House, saving: PiggyBank, family: Users };

export default function MoneyCheckClient() {
  const [topic, setTopic] = useState<MoneyCheckFilter>("all");
  const [completed, setCompleted] = useState<string[]>([]);
  const [storage, setStorage] = useState<"loading" | "available" | "unavailable">("loading");
  const [announcement, setAnnouncement] = useState("");
  const pendingChanges = useRef(new Map<string, boolean>());

  useEffect(() => {
    try {
      setCompleted(parseMoneyCheckProgress(window.localStorage.getItem(MONEY_CHECK_STORAGE_KEY)));
      setStorage("available");
    } catch {
      setStorage("unavailable");
    }
    const syncProgress = (event: StorageEvent) => {
      if (event.key !== MONEY_CHECK_STORAGE_KEY && event.key !== null) return;
      try {
        if (event.storageArea !== window.localStorage) return;
        // A queued event can describe an older write. Read the latest value and preserve unsaved local edits.
        let latest = parseMoneyCheckProgress(window.localStorage.getItem(MONEY_CHECK_STORAGE_KEY));
        pendingChanges.current.forEach((checked, id) => { latest = updateMoneyCheckCompletion(latest, id, checked); });
        setCompleted(latest);
        setStorage(pendingChanges.current.size > 0 ? "unavailable" : "available");
      } catch {
        setStorage("unavailable");
      }
    };
    window.addEventListener("storage", syncProgress);
    return () => window.removeEventListener("storage", syncProgress);
  }, []);

  const visibleItems = getMoneyCheckItems(topic);
  const visibleCompleted = visibleItems.filter((item) => completed.includes(item.id)).length;

  function toggleItem(id: string, checked: boolean) {
    let next = updateMoneyCheckCompletion(completed, id, checked);
    pendingChanges.current.set(id, checked);
    setAnnouncement("");
    try {
      // Merge the user's explicit check/uncheck into current storage rather than replacing another tab's changes.
      next = parseMoneyCheckProgress(window.localStorage.getItem(MONEY_CHECK_STORAGE_KEY));
      pendingChanges.current.forEach((pendingChecked, pendingId) => { next = updateMoneyCheckCompletion(next, pendingId, pendingChecked); });
      window.localStorage.setItem(MONEY_CHECK_STORAGE_KEY, serializeMoneyCheckProgress(next));
      pendingChanges.current.clear();
      setStorage("available");
    } catch {
      setStorage("unavailable");
    }
    setCompleted(next);
  }

  function resetProgress() {
    setCompleted([]);
    MONEY_CHECK_ITEMS.forEach((item) => pendingChanges.current.set(item.id, false));
    try {
      window.localStorage.removeItem(MONEY_CHECK_STORAGE_KEY);
      pendingChanges.current.clear();
      setStorage("available");
      setAnnouncement("체크 기록을 초기화했어요.");
    } catch {
      setStorage("unavailable");
      setAnnouncement("화면의 체크를 초기화했어요. 브라우저 저장소에 접근할 수 없어 이전 저장 기록은 삭제하지 못했어요.");
    }
  }

  return (
    <section aria-labelledby="checklist-heading" className="space-y-8">
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-link">01 · 관심 있는 상황 선택</p>
          <h2 id="checklist-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">지금 어떤 돈이 궁금한가요?</h2>
          <p id="topic-help" className="mt-3 text-base leading-7 text-muted-foreground">상황을 고르면 필요한 항목만 모아 볼 수 있어요.</p>
        </div>
        <div role="group" aria-label="확인할 상황" aria-describedby="topic-help" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {MONEY_CHECK_TOPICS.map((item) => {
            const Icon = TOPIC_ICONS[item.id];
            const selected = topic === item.id;
            return (
              <button key={item.id} type="button" aria-pressed={selected} aria-controls="money-check-results" onClick={() => setTopic(selected ? "all" : item.id)}
                className={`flex min-w-0 flex-col items-start rounded-2xl border p-4 text-left transition-colors ${selected ? "border-primary bg-accent text-accent-foreground ring-1 ring-primary" : "border-border bg-card text-foreground hover:bg-secondary"}`}>
                <span className="mb-3 flex w-full items-center justify-between"><Icon aria-hidden="true" className="h-5 w-5" />{selected && <Check aria-hidden="true" className="h-4 w-4" />}</span>
                <span className="text-base font-semibold">{item.label}</span>
                <span className={`mt-1 text-xs leading-5 ${selected ? "text-accent-foreground" : "text-muted-foreground"}`}>{item.description}</span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => setTopic("all")} aria-pressed={topic === "all"} aria-controls="money-check-results" className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${topic === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
          <CheckCheck aria-hidden="true" className="h-4 w-4" />전체 {MONEY_CHECK_ITEMS.length}개 보기
        </button>
      </div>

      <div className="rounded-2xl bg-accent px-5 py-5 text-accent-foreground sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-sm font-medium">{topic === "all" ? "전체 체크리스트" : `${MONEY_CHECK_TOPICS.find((item) => item.id === topic)?.label} 체크리스트`}</p>
            <p className="mt-1 text-xl font-bold">{visibleItems.length}개 중 {visibleCompleted}개 확인했어요</p>
          </div>
          <p className="text-sm">전체 진행 <strong className="tabular-nums">{completed.length} / {MONEY_CHECK_ITEMS.length}</strong></p>
        </div>
        <div role="progressbar" aria-label="전체 체크리스트 진행" aria-valuemin={0} aria-valuemax={MONEY_CHECK_ITEMS.length} aria-valuenow={completed.length} className="mt-4 h-2 overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${(completed.length / MONEY_CHECK_ITEMS.length) * 100}%` }} />
        </div>
      </div>

      <div id="money-check-results" className="space-y-10">
        {MONEY_CHECK_TOPICS.filter((group) => topic === "all" || group.id === topic).map((group) => (
          <section key={group.id} aria-labelledby={`topic-${group.id}`}>
            <div className="mb-5 max-w-3xl">
              <h3 id={`topic-${group.id}`} className="text-xl font-bold sm:text-2xl">{group.heading}</h3>
              <p className="mt-2 text-base leading-7 text-muted-foreground">{group.intro}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {getMoneyCheckItems(group.id).map((item, index) => {
                const checked = completed.includes(item.id);
                return (
                  <article key={item.id} id={item.id} aria-labelledby={`title-${item.id}`} className="flex min-w-0 flex-col rounded-3xl border border-border bg-card p-5 sm:p-7">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-muted-foreground">{index + 1}</span>
                      {checked && <span className="inline-flex items-center gap-1 text-sm font-semibold text-success"><Check aria-hidden="true" className="h-4 w-4" />확인 완료</span>}
                    </div>
                    <h4 id={`title-${item.id}`} className="text-xl font-bold leading-snug tracking-tight">{item.title}</h4>
                    <p className="mt-3 text-base leading-7 text-muted-foreground">{item.description}</p>
                    <p className="mb-6 mt-4 text-sm leading-6 text-muted-foreground"><span className="mr-2 font-semibold text-foreground">준비하면 좋아요</span>{item.prepare}</p>
                    <div className="mt-auto space-y-2">
                      <div data-msy-module="money-check-calculator">
                        <Link href={item.calculator.href} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-hover))]">
                          <span className="flex min-w-0 items-center gap-2"><Calculator aria-hidden="true" className="h-4 w-4 shrink-0" />{item.calculator.label}</span><ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                        </Link>
                      </div>
                      <div data-msy-module="money-check-guide">
                        <Link href={item.guide.href} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted">
                          <span className="flex min-w-0 items-center gap-2"><BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />{item.guide.label}</span><ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                        </Link>
                      </div>
                    </div>
                    <label htmlFor={`check-${item.id}`} className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
                      <input id={`check-${item.id}`} type="checkbox" checked={checked} disabled={storage === "loading"} onChange={(event) => toggleItem(item.id, event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded" />
                      <span>{item.check}</span>
                    </label>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm leading-6 text-muted-foreground">계산하고 설명을 읽은 뒤 직접 체크해 주세요. 확인 상태만 이 브라우저에 저장하며, 선택한 상황이나 체크 상태를 분석 도구로 전송하지 않습니다.</p>
        <p role="status" className="mt-2 text-sm leading-6 text-muted-foreground">
          {storage === "unavailable" ? "브라우저 저장을 사용할 수 없어요. 지금 화면에서 체크할 수 있지만, 페이지를 떠나면 기록이 유지되지 않을 수 있어요." : "다른 기기와 동기화되지 않으며, 브라우저 데이터를 지우면 기록도 사라져요."}
          {announcement && <span className="mt-1 block font-medium text-foreground">{announcement}</span>}
        </p>
        <button type="button" onClick={resetProgress} disabled={storage === "loading"} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-secondary"><RotateCcw aria-hidden="true" className="h-4 w-4" />체크 기록 초기화</button>
        <noscript><p className="mt-3 text-sm text-muted-foreground">체크 기록 저장과 상황별 필터는 자바스크립트를 켜면 사용할 수 있어요. 계산기·가이드 링크는 그대로 이용할 수 있습니다.</p></noscript>
      </div>
    </section>
  );
}
