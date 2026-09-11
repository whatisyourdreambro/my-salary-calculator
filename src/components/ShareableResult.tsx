// src/components/ShareableResult.tsx

"use client";

import { useMemo } from "react";
import CountUp from "react-countup";
import { decodeSharedSalary } from "@/lib/salarySharePayload";
import Link from "@/components/AppLink";
// 정본 격자 스냅 — salaryRedirect 는 코드젠된 숫자 배열(~5KB)만 끌어오므로 클라이언트 번들에
// 회사 DB 등 무거운 모듈(salaryStaticParams)이 실리지 않는다.
import { salaryReportHrefOrNearest } from "@/lib/salaryRedirect";

const formatNumber = (num: number) => num.toLocaleString('ko-KR');

// /salary/[amount]는 정적 생성(dynamicParams=false)이라 정적 집합 밖 금액은 404.
// 종전에는 격자를 닫힌식(5백만~1억 50만 단위, 1억~2억 5백만 단위, 2억 상한)으로 복제했는데
// 실제 집합(1억~2억은 100만 단위, 최대 3.5억)과 어긋나 링크 대상이 달랐다 — 2026-09-12 S2-2 에서
// 정본 salaryReportHref 계열로 교체. 집합 범위 밖 금액은 클램프하지 않고, 같은 자리의 버튼을 홈 계산기로 돌린다(높이 불변).

interface ShareableResultProps {
 data: string;
}

export default function ShareableResult({ data }: ShareableResultProps) {
 const result = useMemo(() => decodeSharedSalary(data), [data]);

 if (!result) {
 return (
 <div className="text-center p-8 bg-card rounded-2xl shadow-lg border">
 <h1 className="text-2xl font-bold text-destructive">잘못된 정보입니다.</h1>
 <p className="mt-4 text-muted-foreground">
 공유된 데이터가 올바르지 않습니다. 다시 시도해주세요.
 </p>
 <Link
 href="/"
 className="inline-block mt-6 py-3 px-6 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition"
 >
 홈으로 돌아가기
 </Link>
 </div>
 );
 }

 const { annualSalary, payload } = result;

 // 연봉 상세 리포트(/salary/[amount]) — 정적 집합 범위 안일 때만, 가장 가까운 정적 페이지로.
 // 범위 밖(500만 미만·3.5억 초과 — 페이로드는 1조까지 허용)이면 null. 그래도 버튼 자리는 비우지 않는다:
 // 이 카드 바로 아래가 /share 의 CalcResultAd 라 카드 높이가 줄면 광고가 올라온다(2026-08-16 규칙). null 이면
 // 같은 클래스의 버튼을 홈 계산기(/)로 연결해 두 버튼 행을 유지한다 (2026-09-12 리뷰 지적, S2-2).
 // 월 소득 환산 결과(regular 아님)는 종전대로 버튼 1개 — 그쪽은 원래 상세 리포트 버튼이 없었다.
 const salaryReportLink = result.regular ? salaryReportHrefOrNearest(annualSalary) : null;

 return (
 <div className="bg-card p-8 rounded-2xl shadow-2xl border animate-fade-in-up">
 <div className="text-center">
 <p className="font-semibold text-muted-foreground">
 공유받은 소득 계산 결과
 </p>
 <h2 className="text-3xl font-bold my-2">
 {result.regular ? "연봉" : "월 소득의 연 환산"}{" "}
 <span className="text-primary">{formatNumber(annualSalary)}원</span>의
 </h2>
 <h1 className="text-5xl sm:text-6xl font-bold text-primary my-4">
 월 수령 추정액 <br />{" "}
 <CountUp end={result.monthlyNet} separator="," duration={1.5} />원
 </h1>
 <p className="text-muted-foreground">
 {result.modelLabel}
 </p>
 <p className="mt-3 text-sm text-muted-foreground">공유 링크에 포함된 입력으로 재현한 결과이며, 실제 급여명세서나 최종 확정 세액이 아닙니다.</p>
 <dl className="mt-5 grid grid-cols-1 gap-2 rounded-xl bg-muted/40 p-4 text-left text-sm">
 {"annualSalary" in payload ? <>
 <div><dt className="inline font-semibold">월 비과세액: </dt><dd className="inline">{formatNumber(payload.nonTaxableAmount)}원</dd></div>
 <div><dt className="inline font-semibold">부양가족 수(본인 포함): </dt><dd className="inline">{payload.dependents}명</dd></div>
 <div><dt className="inline font-semibold">공제 대상 자녀 수: </dt><dd className="inline">{payload.children}명</dd></div>
 </> : <div><dt className="inline font-semibold">세전 월 소득: </dt><dd className="inline">{formatNumber(payload.monthlyIncome)}원</dd></div>}
 </dl>
 <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
 {result.regular && (
 <Link
 href={salaryReportLink ?? "/"}
 className="inline-block py-4 px-8 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition-transform transform hover:scale-105 shadow-lg"
 >
 {salaryReportLink ? "연봉 상세 분석 보기" : "연봉 계산기로 다시 계산"}
 </Link>
 )}
 <Link
 href="/"
 className="inline-block py-4 px-8 bg-accent text-accent-foreground font-bold text-lg rounded-lg hover:bg-accent/90 transition-transform transform hover:scale-105 shadow-lg"
 >
 나의 연봉도 계산해보기 →
 </Link>
 </div>
 </div>
 </div>
 );
}
