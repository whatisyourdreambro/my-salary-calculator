import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { ChevronRight, LockKeyhole, Radio } from "lucide-react";
import { GuideMidAd } from "@/components/AdPlacement";
import JsonLd from "@/components/JsonLd";
import AutoShareSection from "@/components/AutoShareSection";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";
import WorkClockClient from "./WorkClockClient";
import styles from "./work-clock.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "실시간 월급 시계 — 오늘 번 돈·근무 기록·주휴수당",
  description: "연봉·월급·시급으로 오늘 번 돈과 예상 세금·보험 공제액을 실시간 환산하세요. 출퇴근·유급/무급 휴게·화장실 시간을 기록하고 근무 달력에서 일별·월별 수입을 확인합니다. 회원가입 없이 내 브라우저에 선택하여 저장하는 무료 월급 시계입니다.",
  path: "/work-clock",
  keywords: ["월급 시계", "실시간 월급 계산기", "오늘 번 돈", "근무시간 기록", "화장실 월급 계산기", "출퇴근 시간 계산", "실시간 시급 계산"],
});

const FAQ = [
  { question: "실시간 금액이 실제 월급과 같은가요?", answer: "아닙니다. 월급 시계는 급여를 근무시간에 나누어 보여 주는 개인용 환산 도구입니다. 연봉은 12로 나누어 월급으로 바꾼 뒤, 입력한 주 근무시간 × 209 ÷ 48로 산출한 월 환산시간으로 나눕니다. 이 환산 시급은 법정 통상시급과 다릅니다. 월별 합계는 실제 기록한 시간만 반영하며, 미기록 근무·주휴수당·연장·야간·휴일 가산수당을 자동 합산하지 않습니다." },
  { question: "세금과 4대보험은 어떻게 계산하나요?", answer: "사용자가 입력한 합산 예상 공제율을 세전 환산액에 곱합니다. 기본 15%는 예시이며 실제 세율이 아닙니다. 급여명세서의 총 공제액을 세전 급여로 나누어 조정하세요. 부양가족, 비과세 급여, 보험료 상한, 연말정산에 따라 실제 금액이 달라지므로 정확한 항목별 추정은 연봉 실수령액 계산기를 이용하세요." },
  { question: "화장실이나 점심시간에도 월급이 늘어나나요?", answer: "각 휴게를 시작할 때 유급 여부를 직접 선택합니다. 무급으로 기록하면 해당 시간만큼 환산액이 멈추고, 유급으로 기록하면 계속 증가합니다. 기본값은 무급이며 화장실 이용시간의 법적 유급 여부를 판단하는 기능은 아닙니다. 근로계약·취업규칙에 맞게 선택하세요. 휴식 영수증의 금액은 전체 환산액에 이미 포함되어 따로 더하지 않습니다." },
  { question: "탭을 닫거나 퇴근 버튼을 잊으면 어떻게 되나요?", answer: "예정 퇴근시간에 자동으로 환산이 멈춥니다. 한 근무는 최대 24시간으로 제한합니다. 저장을 켜면 이 브라우저에서 다시 열었을 때 기록을 불러오며, 진행 중이던 근무를 확인하라는 안내를 보여 줍니다. 이미 일찍 퇴근했다면 실제 퇴근시각을 입력할 수 있습니다. 저장을 켜지 않았다면 새로고침하거나 탭을 닫을 때 기록이 사라집니다." },
  { question: "근무 달력과 자정을 넘긴 근무는 어떻게 계산하나요?", answer: "달력에서 날짜를 누르면 그날의 세전 금액, 예상 공제액, 공제 후 금액과 근무 기록을 확인하고 지난 근무를 추가할 수 있습니다. 오늘과 조회 월은 한국시간(Asia/Seoul)을 기준으로 합니다. 자정이나 월 경계를 넘긴 근무와 휴게는 각 날짜·월에 해당하는 시간으로 나누어 계산합니다. 새로 바꾼 급여 설정은 새 근무에 적용되며, 진행 중이거나 이미 끝난 근무의 급여 기준은 바뀌지 않습니다." },
  { question: "주휴수당이 오늘 번 돈에 자동으로 더해지나요?", answer: "아니요. 월급·연봉에 이미 포함된 수당을 중복 합산하지 않도록 별도로 보여 줍니다. 주휴수당 도구는 4주 평균 주 소정근로시간 15시간 이상, 해당 주 소정근로일 개근, 주휴일까지 근로관계 유지 여부를 직접 확인한 뒤 계산합니다. 주 40시간·5일 통상근로자를 비교 기준으로 주 소정근로시간 ÷ 40 × 8 × 통상시급을 적용한 참고 추정입니다." },
  { question: "회원가입 없이 달력 기록을 저장할 수 있나요?", answer: "이 도구의 입력 금액과 근무 기록은 서버로 전송하지 않습니다. 기본은 저장하지 않으며, 저장을 선택하면 현재 브라우저의 로컬 저장소에 최대 500개 근무를 보관하고 홈과 월급 시계에서 같은 기록을 불러옵니다. 브라우저의 사이트 데이터를 삭제하거나 시크릿 모드를 종료하면 기록이 사라질 수 있습니다. 다른 기기와 동기화되지 않고 같은 브라우저를 쓰는 사람이 볼 수 있으므로 공용 기기에서는 저장을 끄세요. 기록 삭제와 실행 취소 기능도 제공합니다." },
];

export default function WorkClockPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={[
        breadcrumbLd([{ name: "홈", path: "/" }, { name: "월급 시계", path: "/work-clock" }]),
        faqLd(FAQ),
        softwareApplicationLd({ name: "실시간 월급 시계", description: "출퇴근과 휴게시간을 기록하고 근무 달력에서 일별·월별 급여 환산액을 확인하는 무료 개인용 도구", url: "/work-clock", featureList: ["실시간 급여 환산", "출퇴근·유급/무급 휴게 기록", "일별·월별 근무 달력", "회원가입 없는 선택형 브라우저 저장", "주휴수당 참고 추정", "목표 금액 즐겨찾기", "시간 설정·일시정지 가능한 집중 타이머"] }),
      ]} />
      <div className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="현재 위치"><Link href="/">홈</Link><ChevronRight size={12} /><span aria-current="page">월급 시계</span></nav>
        <header className={styles.intro}>
          <div><span className={styles.eyebrow}><Radio size={14} /> MY WORK, MY WORTH</span><h1>지금도, 월급은 흐른다</h1><p>집중한 시간도, 잠깐 쉬어 간 시간도.<br />오늘 내가 번 돈을 확인하고 나만의 근무 리듬을 만들어 보세요.</p></div>
          <span className={styles.privacyBadge}><LockKeyhole size={14} /> 내 기록은 내 브라우저에</span>
        </header>

        <WorkClockClient />

        <section className={styles.explanation} aria-labelledby="how-it-works">
          <p className={styles.sectionLabel}>HOW IT WORKS</p>
          <h2 id="how-it-works">월급 시계, 이렇게 읽어 주세요</h2>
          <div className={styles.guideGrid}>
            <article className={styles.guideCard}><span>01 / 나의 시간 단가</span><h3>시급과 연봉, 다른 방식으로</h3><p>시급은 입력한 금액 그대로 사용합니다. 연봉은 12로 나누고, 월급을 환산용 월 근무시간으로 나누어 근무시간당 금액을 만듭니다. 월 환산시간은 주 근무시간 × 209 ÷ 48입니다. 급여를 일하는 시간에 배분한 숫자여서 법정 통상시급과 구분해야 합니다.</p></article>
            <article className={styles.guideCard}><span>02 / 기록한 만큼</span><h3>유급과 무급을 직접 구분</h3><p>출근부터 퇴근까지의 시간에서 무급 휴게를 뺀 뒤 금액을 환산합니다. 유급으로 선택한 휴식은 포함됩니다. 근로기준법상 휴게는 근로 도중 자유롭게 사용할 수 있어야 하며, 4시간 근로 시 30분 이상, 8시간 근로 시 1시간 이상이 기준입니다.</p></article>
            <article className={styles.guideCard}><span>03 / 급여명세서와 함께</span><h3>세금은 예상치, 수당은 별도로</h3><p>공제액은 입력한 비율로 계산한 세금·보험 합산 추정치입니다. 주휴수당은 요건 확인 후 따로 보여 주며, 연장·야간·휴일 가산수당은 누적 금액에 포함하지 않습니다. 근로 형태와 임금 구성에 따라 달라지는 실제 지급액은 급여명세서로 확인하세요.</p></article>
          </div>
          <p className={styles.guideText}><strong>주휴수당의 ‘통상시급’과 화면의 ‘근무시간당 환산액’은 다른 숫자입니다.</strong> 주 40시간 근무의 월급제에서는 월 통상임금 ÷ 209시간이 통상시급의 일반적인 계산 기준입니다. 이 페이지가 월급 전액으로 제시하는 통상시급은 전액이 통상임금이라는 가정이므로, 실제 통상임금에 해당하는 시급을 직접 입력하는 것이 좋습니다. 휴일에 근무한 시간도 기록할 수 있지만 휴일 가산 여부와 비율은 자동 판단하지 않습니다.</p>
          <div className={styles.sources} aria-label="공식 기준 출처"><a href="https://www.moel.go.kr/news/cardinfo/view.do?bbs_seq=20240700152" target="_blank" rel="noopener noreferrer">고용노동부 · 209시간과 시급 환산</a><a href="https://1350.moel.go.kr/rtmview.do?id=1000315238" target="_blank" rel="noopener noreferrer">고용노동부 1350 · 주휴수당 요건</a><a href="https://moel.go.kr/faq/faqView.do?seqRepeat=63" target="_blank" rel="noopener noreferrer">고용노동부 · 휴게시간 기준</a></div>
        </section>

        <div className={styles.adSpace}><GuideMidAd /></div>

        <section className={styles.faq} aria-labelledby="work-clock-faq"><h2 id="work-clock-faq">궁금한 점을 모았어요</h2><div className={styles.faqList}>{FAQ.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>

        <nav className={styles.related} aria-label="함께 쓰면 좋은 계산기"><Link href="/">연봉 실수령액 계산기<span>부양가족·비과세·항목별 공제까지</span></Link><Link href="/weekly-holiday-allowance-2026">주휴수당 자세히 계산하기<span>개근 여부와 소정근로시간으로 확인</span></Link><Link href="/table/2026/hourly">시급별 월급 비교표<span>내 시급으로 월급은 어느 정도일까</span></Link></nav>
        <AutoShareSection contentType="tool" maxWidth="7xl" />
      </div>
    </div>
  );
}
