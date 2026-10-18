import Link from '@/components/AppLink';

const units = {
  annual: { title: '연봉', reason: '연간 총급여를 기준으로 공제 후 금액을 비교합니다. 상여금 포함 여부도 함께 확인하세요.' },
  monthly: { title: '월급', reason: '월 예산을 세울 때 월 단위 수령액을 확인합니다. 연봉의 월 환산값과 실제 급여 구조는 다를 수 있습니다.' },
  weekly: { title: '주급', reason: '주 단위 근무의 소득을 살펴봅니다. 근무시간과 주휴수당 적용 조건을 확인하세요.' },
  hourly: { title: '시급', reason: '시간당 임금으로 근로 조건을 비교합니다. 표에 명시한 근무시간·공제 가정을 적용합니다.' },
} as const;

export default function SalaryTableNextSteps({ year, unit }: { year: 2026 | 2027; unit: keyof typeof units }) {
  const otherYear = year === 2026 ? 2027 : 2026;
  return <section data-msy-module="salary-table-comparison" className="mx-auto my-10 max-w-5xl rounded-2xl border border-border bg-background p-6 text-foreground">
    <h2 className="text-xl font-bold">급여 단위와 적용 연도를 함께 비교하세요</h2>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">급여 단위가 달라지면 근무시간과 환산 조건도 달라집니다. 다음 표에서 각 계산의 전제를 확인하세요. 2027년 표는 확정 전 항목을 가정한 참고용 전망입니다.</p>
    <ul className="mt-5 grid gap-5 sm:grid-cols-2">
      {Object.entries(units).filter(([key]) => key !== unit).map(([key, item]) => <li key={key}>
        <Link href={`/table/${year}/${key}`} className="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">{year} {item.title} 실수령액 표 →</Link>
        <p className="text-sm leading-6 text-muted-foreground">{item.reason}</p>
      </li>)}
      <li><Link href={`/table/${otherYear}/${unit}`} className="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">{otherYear} {units[unit].title} 표와 비교 →</Link><p className="text-sm leading-6 text-muted-foreground">{otherYear === 2027 ? '다음 연도 전망의 가정을 확인하고, 확정값과 구분해 예산을 검토하세요.' : '2026년 적용 기준을 확인하고 다음 연도 전망과의 차이를 살펴보세요.'}</p></li>
    </ul>
    {year === 2026 && unit === 'monthly' && <p className="mt-5 text-sm leading-6 text-muted-foreground">고소득 구간의 계산 예시가 필요하다면 <Link href="/monthly/20000000" className="text-primary underline underline-offset-4">월급 2,000만원의 공제 항목과 실수령액</Link>을 따로 확인할 수 있습니다.</p>}
  </section>;
}
