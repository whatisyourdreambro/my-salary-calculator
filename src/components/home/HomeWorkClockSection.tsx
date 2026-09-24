"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowRight, CalendarDays, Clock3, LockKeyhole, Play } from "lucide-react";
import Link from "@/components/AppLink";
import IslandBoundary, { IslandFallback } from "@/components/IslandBoundary";
import styles from "./home-work-clock.module.css";

// The timer and calendar load only after an explicit action; browsing the home
// page does not start a session or load another large interactive calculator.
const WorkClockClient = dynamic(() => import("@/app/work-clock/WorkClockClient"), {
  ssr: false,
  loading: () => <div className={styles.loading} role="status">월급 시계와 근무 달력을 불러오고 있습니다.</div>,
});

export default function HomeWorkClockSection() {
  const [opened, setOpened] = useState(false);

  return (
    <section id="home-work-clock" className={styles.section} aria-labelledby="home-work-clock-title" data-msy-module="home-work-clock">
      <div className="page-width">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}><Clock3 size={15} aria-hidden="true" />오늘의 월급, 지금 얼마나 쌓였을까요?</p>
            <h2 id="home-work-clock-title">실시간 월급 시계와 나의 근무 달력</h2>
            <p className={styles.description}>연봉·시급을 입력하고 출근부터 퇴근까지 오늘 번 돈을 확인하세요. 휴게시간과 날짜별 근무 기록도 이 페이지에서 관리할 수 있어요.</p>
          </div>
          <Link href="/work-clock" className={styles.fullLink}>전체 화면으로 보기<ArrowRight size={16} aria-hidden="true" /></Link>
        </div>

        <div id="home-work-clock-content" className={styles.content}>
          {/* 청크 로드 실패는 이 섬 자리(로딩 박스와 같은 크기)에서만 대체 화면 — 홈 본문·광고는 유지. */}
          {opened ? (
            <IslandBoundary
              name="home-work-clock"
              fallback={<IslandFallback className={styles.loading} message="월급 시계를 불러오지 못했습니다." href="/work-clock" linkLabel="월급 시계 전체 화면으로 보기" />}
            >
              <WorkClockClient mode="home" />
            </IslandBoundary>
          ) : (
            <div className={styles.intro}>
              <div className={styles.features}>
                <p><Clock3 size={18} aria-hidden="true" /><span><strong>출근·휴식·퇴근</strong>초마다 달라지는 오늘의 예상 수입</span></p>
                <p><CalendarDays size={18} aria-hidden="true" /><span><strong>날짜별 근무 달력</strong>오늘과 이번 달의 기록을 한곳에서</span></p>
                <p><LockKeyhole size={18} aria-hidden="true" /><span><strong>회원가입 없이</strong>저장을 켜면 이 브라우저에서 이어쓰기</span></p>
              </div>
              <div className={styles.launch}>
                <button type="button" className="ms-button ms-button-primary" aria-controls="home-work-clock-content" onClick={() => setOpened(true)}>
                  <Play size={17} aria-hidden="true" />여기서 월급 시계 열기
                </button>
                <p>페이지를 이동하지 않고 바로 사용할 수 있어요.</p>
              </div>
              <noscript><p>실시간 계산에는 자바스크립트가 필요합니다. <a href="/work-clock">월급 시계의 계산 기준과 안내 보기</a></p></noscript>
            </div>
          )}
        </div>
        <p className={styles.privacy}>‘이 브라우저에 저장’을 켠 경우에만 기록을 기기에 보관합니다. 메인과 전체 화면에서 같은 기록을 사용하며, 다른 기기와 동기화되지 않습니다. 예상 수입은 실제 급여명세서와 다를 수 있습니다.</p>
      </div>
    </section>
  );
}
