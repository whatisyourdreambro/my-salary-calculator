// src/lib/guidesData.ts

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  level: '초급' | '중급' | '고급';
  publishedDate: string;
  views: number;
  content: string;
}

export const categories = [
  { id: "all", name: "전체보기" },
  { id: "연봉", name: "연봉 분석" },
  { id: "커리어", name: "커리어 성장" },
  { id: "세금", name: "절세/세금" },
  { id: "투자", name: "재테크/투자" },
  { id: "부동산", name: "부동산" },
  { id: "노동/법률", name: "노동/법률" },
  { id: "기초", name: "금융 기초" },
];

export const guides: Guide[] = [
  { slug: "salary-guide-2025", title: "2025년 연봉 실수령액 완벽 분석", description: "최신 세법을 적용한 연봉 구간별 상세 실수령액 표를 제공합니다.", category: "연봉", tags: ["연봉", "실수령액", "2025년"], level: "초급", publishedDate: "2025-10-26", views: 150234, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '연봉 5,000만원'이면 내 통장에는 한 달에 얼마가 찍힐까요? 많은 직장인들이 연봉 계약서의 숫자와 실제 월급이 달라 당황하곤 합니다. 그 이유는 바로 월급에서 의무적으로 떼어가는 '세금'과 '4대보험' 때문입니다. 2025년 최신 세법과 보험 요율을 기준으로, 연봉이 실수령액으로 바뀌는 과정과 연봉 구간별 상세 실수령액을 완벽하게 분석해 드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        내 월급에서 무엇을 떼어갈까? (공제 항목 심층 분석)
      </h2>
      <p>
        월급에서 공제되는 항목은 크게 '4대보험'과 '소득세'로 나뉩니다. 이 두 가지가 전체 공제액의 대부분을 차지하며, 각각의 계산 방식과 요율을 이해하는 것이 내 진짜 월급을 파악하는 첫걸음입니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">1. 4대 보험: 사회적 안전망</h3>
          <p className="!text-sm !my-2">국민연금, 건강보험, 고용보험, 산재보험을 의미하며, 질병, 실업, 노령 등의 위험으로부터 나를 보호하는 최소한의 사회적 안전장치입니다. 보험료는 나와 회사가 절반씩 부담하는 구조입니다. (산재보험은 전액 회사 부담)</p>
          <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
            <li><strong>국민연금 (4.5%):</strong> 노후 대비를 위한 연금</li>
            <li><strong>건강보험 (3.545%):</strong> 병원비 부담을 덜어주는 보험</li>
            <li><strong>장기요양보험 (건보료의 12.95%):</strong> 노인성 질환 등을 대비</li>
            <li><strong>고용보험 (0.9%):</strong> 실업 시 실업급여를 받기 위한 보험</li>
          </ul>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">2. 소득세 & 지방소득세: 국가 운영의 재원</h3>
          <p className="!text-sm !my-2">국가의 운영을 위해 국민 개개인이 소득의 일부를 내는 세금입니다. 총 급여에서 비과세 소득(식대 등)과 각종 공제(인적공제, 신용카드 공제 등)를 제외한 '과세표준'에 따라 부과됩니다.</p>
          <p className="!text-sm !my-0">소득세는 소득이 높을수록 세율도 함께 높아지는 '누진세' 구조를 따르며, 지방소득세는 계산된 소득세의 10%가 추가로 부과됩니다.</p>
        </div>
      </div>
    </section>

    <section className="mt-12">
        <h2 className="!text-2xl font-bold">소득세, 어떻게 계산될까? (누진세 구조)</h2>
        <p>
            소득세는 '과세표준' 금액에 따라 6%부터 최대 45%까지 차등적으로 세율이 적용됩니다. 예를 들어 과세표준이 5,000만원이라면, 1,400만원까지는 6% 세율을, 1,400만원을 초과하는 3,600만원에 대해서는 15% 세율을 적용하여 계산하는 방식입니다.
        </p>
        <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
            <table className="w-full text-center text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="p-3 font-semibold">과세표준 (2025년 기준)</th>
                        <th className="p-3 font-semibold">세율</th>
                        <th className="p-3 font-semibold">누진공제액</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3">1,400만원 이하</td><td className="p-3">6%</td><td className="p-3">-</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3">1,400만원 초과 ~ 5,000만원 이하</td><td className="p-3">15%</td><td className="p-3">126만원</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3">5,000만원 초과 ~ 8,800만원 이하</td><td className="p-3">24%</td><td className="p-3">576만원</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3">8,800만원 초과 ~ 1.5억원 이하</td><td className="p-3">35%</td><td className="p-3">1,544만원</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3">1.5억원 초과 ~ 3억원 이하</td><td className="p-3">38%</td><td className="p-3">1,994만원</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3">3억원 초과 ~ 5억원 이하</td><td className="p-3">40%</td><td className="p-3">2,594만원</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3">5억원 초과 ~ 10억원 이하</td><td className="p-3">42%</td><td className="p-3">3,594만원</td></tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3">10억원 초과</td><td className="p-3">45%</td><td className="p-3">6,594만원</td></tr>
                </tbody>
            </table>
        </div>
    </section>

    <section className="mt-12">
      <h2 className="!text-2xl font-bold">2025년 연봉 실수령액 표</h2>
      <p>
        아래 표는 1인 가구, 비과세액 20만원(식대 등), 별도의 연말정산 추가 공제가 없다고 가정한 예상 금액입니다. 부양가족 수, 중소기업 취업자 감면, 연금저축 세액공제 등 개인별 조건에 따라 실제 수령액은 달라질 수 있습니다.
      </p>
      <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
        <table className="w-full text-center text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 font-semibold">연봉</th>
              <th className="p-3 font-semibold">월 환산액</th>
              <th className="p-3 font-semibold text-red-500">공제액 합계</th>
              <th className="p-3 font-semibold text-blue-600">월 예상 실수령액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">3,000만원</td><td className="p-3">250만원</td><td className="p-3 text-red-500">약 28만원</td><td className="p-3 font-bold text-blue-600">약 222만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">4,000만원</td><td className="p-3">333만원</td><td className="p-3 text-red-500">약 43만원</td><td className="p-3 font-bold text-blue-600">약 290만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">5,000만원</td><td className="p-3">417만원</td><td className="p-3 text-red-500">약 63만원</td><td className="p-3 font-bold text-blue-600">약 354만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">6,000만원</td><td className="p-3">500만원</td><td className="p-3 text-red-500">약 86만원</td><td className="p-3 font-bold text-blue-600">약 414만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">7,000만원</td><td className="p-3">583만원</td><td className="p-3 text-red-500">약 111만원</td><td className="p-3 font-bold text-blue-600">약 472만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">8,000만원</td><td className="p-3">667만원</td><td className="p-3 text-red-500">약 138만원</td><td className="p-3 font-bold text-blue-600">약 529만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">9,000만원</td><td className="p-3">750만원</td><td className="p-3 text-red-500">약 168만원</td><td className="p-3 font-bold text-blue-600">약 582만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">1억원</td><td className="p-3">833만원</td><td className="p-3 text-red-500">약 199만원</td><td className="p-3 font-bold text-blue-600">약 634만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">1.5억원</td><td className="p-3">1,250만원</td><td className="p-3 text-red-500">약 384만원</td><td className="p-3 font-bold text-blue-600">약 866만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">2억원</td><td className="p-3">1,667만원</td><td className="p-3 text-red-500">약 598만원</td><td className="p-3 font-bold text-blue-600">약 1,069만원</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
        <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">실수령액을 높이는 3가지 현실적인 방법</h2>
        <p className="!my-2 text-base">
            매달 떼어가는 세금과 보험료가 아깝게 느껴지시나요? 합법적으로 공제액을 줄이고, 내 통장에 찍히는 돈을 늘릴 수 있는 3가지 핵심 전략을 소개합니다.
        </p>
        <ol className="!my-4 space-y-3 text-base !p-0 !list-none">
            <li className="p-3"><strong>1. 비과세 항목 최대한 활용하기:</strong> 회사에서 제공하는 식대, 차량유지비, 육아수당 등은 세금이 붙지 않는 비과세 소득입니다. 연봉 협상 시 이러한 비과세 항목을 포함하여 계약하면, 총액이 같더라도 실수령액을 높일 수 있습니다.</li>
            <li className="p-3"><strong>2. 연말정산 완벽하게 준비하기:</strong> 연말정산은 '13월의 월급'이라 불릴 만큼 중요합니다. 신용카드 사용액, 의료비, 교육비, 월세 등 공제 항목을 꼼꼼히 챙겨 '과세표준' 자체를 낮추는 것이 절세의 핵심입니다. <a href="/guides/year-end-tax-settlement-deep-dive" className="text-sm font-bold text-yellow-800 dark:text-yellow-300 hover:underline">→ 연말정산 공제 항목 가이드 보기</a></li>
            <li className="p-3"><strong>3. 절세 금융상품 200% 활용하기:</strong> 연금저축, IRP, ISA와 같은 절세 계좌는 국가에서 세금을 깎아주며 가입을 장려하는 최고의 재테크 도구입니다. 특히 연금계좌는 연말정산 시 최대 148.5만원의 세금을 직접 돌려받을 수 있는 강력한 혜택을 제공합니다. <a href="/guides/pension-saving-guide" className="text-sm font-bold text-yellow-800 dark:text-yellow-300 hover:underline">→ 연금계좌 완벽 비교 가이드</a></li>
        </ol>
    </section>

    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        내 연봉의 정확한 실수령액 계산하기
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        부양가족 수, 비과세액, 연말정산 공제 항목 등 나의 상황에 맞는 정확한 실수령액이 궁금하다면, '연봉 계산기'에 직접 입력하여 1원 단위까지 확인해보세요.
      </p>
      <a
        href="/salary"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        연봉 계산기 바로가기
      </a>
    </section>
  ` },
  { slug: "salary-negotiation-strategy", title: "연봉협상, 최소 20% 올리는 4단계 전략", description: "당신의 가치를 증명하고, 원하는 연봉을 얻어내는 실전 협상 기술을 공개합니다.", category: "연봉", tags: ["연봉협상", "커리어", "몸값"], level: "중급", publishedDate: "2025-10-20", views: 98765, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      연봉 협상은 1년간의 노고를 보상받고, 나의 가치를 시장에 증명하는 가장 중요한 과정입니다. 하지만 많은 직장인들이 연봉 협상 테이블 앞에서 작아지곤 합니다. 연봉 협상은 단순히 돈을 더 달라고 조르는 '감정적인 요구'가 아닙니다. 지난 1년간 내가 회사에 기여한 바를 객관적인 데이터로 증명하고, 나의 시장 가치에 맞는 합당한 대우를 요구하는 '논리적인 설득' 과정입니다. 철저한 준비와 전략적 소통만이 당신을 협상의 승자로 이끌 것입니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-purple-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        성공적인 연봉 협상을 위한 5단계 필승 전략
      </h2>
      <div className="mt-6 space-y-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">타이밍: 언제 이야기해야 할까?</h3>
            <p className="!text-sm !my-0">
              연봉 협상은 정해진 시기에만 하는 것이 아닙니다. 회사의 연말 평가 시즌 외에도, 성공적으로 대형 프로젝트를 완수했거나, 당신의 역할이 눈에 띄게 중요해졌을 때가 바로 협상을 시도할 적기입니다. '이직' 시에는 최종 합격 통보를 받은 후, 처우 협의를 할 때가 당신의 가치를 가장 높게 평가받을 수 있는 골든타임입니다.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">정보 수집: 나의 객관적인 시장 가치를 파악하라</h3>
            <p className="!text-sm !my-0">
              '많이 받고 싶다'는 생각만으로는 부족합니다. 채용 사이트(원티드, 리멤버, 잡플래닛)의 연봉 정보, 업계 현직자 커뮤니티(블라인드)를 통해 당신과 비슷한 연차, 직무, 기술 스택을 가진 사람들의 평균 연봉과 상위 연봉을 파악하세요. 이것이 당신의 협상 기준점이자, 논리의 근거가 됩니다.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">3</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">성과 정리: 숫자로 증명하고 스토리로 설득하라</h3>
            <p className="!text-sm !my-0">
              '열심히 일했다'는 말은 아무런 힘이 없습니다. '어떤 배경(Situation)에서, 어떤 과업(Task)을 맡아, 어떤 행동(Action)을 했고, 그 결과 어떤 숫자(Result)로 기여했는지' STAR 기법에 따라 성과를 구체적으로 정리하세요. "제가 담당한 A프로젝트를 통해 신규 유저가 20% 증가했고, 이는 매출 15% 상승으로 이어졌습니다." 와 같이 숫자로 증명해야 합니다.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">4</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">목표 설정: 3가지 숫자를 기억하라 (희망, 마지노선, 대안)</h3>
            <p className="!text-sm !my-0">
              협상 테이블에 앉기 전, 3가지 숫자를 명확히 정해야 합니다. <strong>① 희망 연봉 (Walk-away)</strong>: 이 금액 이하라면 차라리 이직하겠다고 생각하는 당신의 마지노선. <strong>② 목표 연봉 (Target)</strong>: 조사한 시장 가치와 당신의 성과를 바탕으로 한 가장 현실적이고 합리적인 목표 금액. <strong>③ 이상적인 연봉 (Ideal)</strong>: 협상이 아주 잘 풀렸을 때 받고 싶은 최고의 금액. 이 3가지 기준이 있어야 감정적인 대응을 피하고 유연하게 대처할 수 있습니다.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">5</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">논리적인 소통: 근거를 제시하고 미래를 약속하라</h3>
            <p className="!text-sm !my-0">
              '동기는 더 받는다던데' 같은 감정적인 비교나, '돈 때문에 힘들다'는 하소연은 최악의 협상 전략입니다. 준비한 자료를 바탕으로 "저는 지난 1년간 회사에 이러이러한 기여를 했습니다. 저의 시장 가치는 현재 이 정도로 평가받고 있습니다. 따라서 저는 이 정도의 보상을 기대하며, 앞으로 회사에 더 큰 기여를 하고 싶습니다." 라고 자신감 있고 긍정적인 태도로 이야기하세요.
            </p>
          </div>
        </div>
      </div>
    </section>
    <blockquote className="!border-l-purple-500 mt-12">
        <p className="font-bold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg> 협상 테이블에서의 전문가 Tip</p>
        <ul className="!my-2 space-y-2 text-base">
            <li><strong>먼저 액수를 말하지 마라:</strong> 회사 측의 제안을 먼저 들어보고 협상을 시작하는 것이 대부분의 경우 유리합니다. 회사가 당신의 가치를 어떻게 평가하는지 파악한 후, 당신의 목표 금액을 제시하며 간극을 좁혀나가세요.</li>
            <li><strong>침묵을 활용하라:</strong> 원하는 금액과 근거를 제시한 후에는, 불안해하며 말을 덧붙이지 말고 차분히 상대의 답변을 기다리세요. 어색한 침묵은 상대방에게 심리적 압박감을 주어, 당신의 제안을 더 진지하게 고려하게 만드는 강력한 무기가 될 수 있습니다.</li>
            <li><strong>긍정적인 태도를 유지하라:</strong> 협상은 싸움이 아닙니다. '회사와 함께 성장하고 싶다'는 긍정적인 태도를 유지하며, 당신의 가치를 인정해달라고 정중히 요구하세요. 당신은 회사의 소중한 자산이며, 이 협상은 그 자산의 가치를 재평가하는 과정임을 잊지 마세요.</li>
        </ul>
    </blockquote>
    <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
      <h2 className="!mt-0 !text-2xl font-bold text-red-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        회사의 '거절'에 현명하게 대처하는 법
      </h2>
      <p className="!my-2">협상이 항상 원하는 대로 흘러가지는 않습니다. 회사의 거절에 실망하고 감정적으로 대응하기보다, 아래와 같이 유연하고 전략적으로 대처하는 것이 중요합니다.</p>
      <ul className="!my-4 space-y-3 text-base">
        <li><strong>"회사 예산이 부족합니다":</strong> "대표님의 상황을 충분히 이해합니다. 그렇다면 혹시 연봉 인상분 중 일부를 스톡옵션이나 성과급, 또는 자기계발을 위한 복지포인트나 추가 유급휴가와 같은 다른 형태로 보상받는 방안도 논의가 가능할까요?" 라며 연봉 외의 대안을 적극적으로 제시하세요.</li>
        <li><strong>"내부 규정상 어렵습니다":</strong> "그렇군요. 회사의 규정을 존중합니다. 그렇다면 제가 다음 평가 시점에 원하는 수준의 보상을 받기 위해, 구체적으로 어떤 목표를 달성하고 어떤 역량을 더 보여드리면 될지 명확한 가이드를 주실 수 있을까요?" 라며 다음을 기약하고, 당신의 성장 의지를 보여주세요.</li>
        <li><strong>"일단 동결 후, 나중에 인상해줄게":</strong> "대표님의 말씀을 신뢰합니다. 다만, 오늘 논의된 내용을 잊지 않고 더 동기부여를 받기 위해, 간단하게 메일로 정리해서 보내드려도 괜찮을까요?" 라며 구두 약속을 반드시 기록으로 남겨두세요.</li>
      </ul>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        연봉 인상 후, 내 통장엔 얼마가 더 찍힐까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        연봉 1,000만원 인상과 500만원 인상의 실수령액 차이는 세금 구간 때문에 생각보다 큽니다. '연봉 계산기'로 협상 전후의 월급을 비교하고, 당신의 노력이 가져온 실질적인 변화를 직접 체감해보세요.
      </p>
      <a
        href="/salary"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        인상 전후 실수령액 비교하기
      </a>
    </section>
  ` },
  { slug: "nekarakubae-salary", title: "네카라쿠배 개발자 초봉 1억, 그 진실은?", description: "계약 연봉, 사이닝 보너스, 스톡옵션을 포함한 '영끌 초봉'의 실체를 파헤칩니다.", category: "연봉", tags: ["개발자", "IT", "네카라쿠배"], level: "중급", publishedDate: "2025-10-15", views: 120345, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '네카라쿠배(네이버, 카카오, 라인, 쿠팡, 배달의민족)'. 이제 이 단어는 단순히 유명 IT 기업의 나열이 아닙니다. 개발자들에게는 높은 연봉, 최고의 복지, 뛰어난 동료, 그리고 무한한 성장 기회를 상징하는 '꿈의 직장' 그 자체가 되었습니다. 과연 이들 기업은 무엇이 다르기에 대한민국 최고의 IT 인재들이 몰려드는 것일까요? 소문 속에 감춰진 '영끌 초봉'의 진실과 각 기업의 문화, 그리고 입사를 위해 무엇을 준비해야 하는지 심층 분석합니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        '영끌 초봉 1억', 진실 혹은 거짓?
      </h2>
      <p>
        결론부터 말하자면, 신입 개발자 '영끌 초봉 1억'은 충분히 가능한 이야기입니다. 하지만 여기에는 몇 가지 조건이 붙습니다. '영끌 초봉'은 단순히 계약서에 찍히는 기본 연봉만을 의미하는 것이 아니기 때문입니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">1. 계약 연봉 (Base Salary)</h3>
          <p className="!text-sm !my-0">가장 기본이 되는 연봉으로, 보통 6,000만원 내외에서 시작합니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">2. 사이닝 보너스 (Signing Bonus)</h3>
          <p className="!text-sm !my-0">입사를 확정하면 일시불로 지급하는 보너스입니다. 기업에 따라 1,000만원에서 2,000만원 이상을 지급하기도 합니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">3. 스톡옵션 (RSU 등)</h3>
          <p className="!text-sm !my-0">회사의 주식을 부여하는 것으로, 미래의 주가 상승에 따라 수천만원 이상의 가치를 가질 수 있는 가장 강력한 보상입니다.</p>
        </div>
      </div>
       <blockquote className="!border-l-blue-500 mt-6">
        <p>
          즉, <strong>계약 연봉 6,000만원 + 사이닝 보너스 2,000만원 + 스톡옵션 α</strong> 가 더해져 '영끌 1억'이 완성되는 구조입니다. 모든 신입이 이 조건을 받는 것은 아니며, 개인의 역량과 협상 결과에 따라 크게 달라질 수 있습니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">네카라쿠배 한눈에 비교하기</h2>
      <p>
        각 회사의 신입 개발자 초봉, 주요 복지, 그리고 문화를 한눈에 비교해 보세요. 연봉은 계약 조건, 스톡옵션, 사이닝 보너스에 따라 개인별로 크게 달라질 수 있습니다.
      </p>
      <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 font-semibold">회사</th>
              <th className="p-3 font-semibold">신입 초봉 (예상)</th>
              <th className="p-3 font-semibold">주요 복지</th>
              <th className="p-3 font-semibold">문화/특징</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">네이버</td>
              <td className="p-3">6,000만원 + α</td>
              <td className="p-3">주택자금 대출, 사내 병원, 릴랙스 휴가, 매년 340만원 복지포인트</td>
              <td className="p-3">안정적, 체계적, 기술 중심, DEVIEW 등 기술 공유 문화 선도</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3 font-bold">카카오</td>
                <td className="p-3">6,000만원 + α</td>
                <td className="p-3">닉네임 문화, 유연 근무, 안식 휴가(3년 근속 시 1개월), 직장 어린이집</td>
                <td className="p-3">수평적, 빠른 시도, 서비스 중심, 'if(kakao)' 컨퍼런스</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3 font-bold">라인</td>
                <td className="p-3">6,500만원 이상</td>
                <td className="p-3">해외 근무 기회, 뛰어난 개발 문화, 주택자금 대출, 아침/점심/저녁 식사 제공</td>
                <td className="p-3">글로벌, 자율성, 기술 공유 활발, LINE Developer Day</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3 font-bold">쿠팡</td>
                <td className="p-3">6,500만원 + 사이닝</td>
                <td className="p-3">스톡옵션(RSU), 높은 보상, 자율 출퇴근, 서울 외 지역 거주자 이주비 지원</td>
                <td className="p-3">미국식, 데이터 중심, 치열함, 아마존 출신 리더 다수</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3 font-bold">배달의민족</td>
                <td className="p-3">6,000만원 이상</td>
                <td className="p-3">'송파구에서 일 잘하는 법' 문화, 자기계발비, 주 32시간 근무제(월요일 오후 출근)</td>
                <td className="p-3">독특한 B급 감성, 사용자 경험 중시, '우아콘' 기술 컨퍼런스</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-center mt-2 text-gray-500">* 최근에는 '당토(당근마켓, 토스)'를 포함하여 '네카라쿠배당토'로 불리기도 합니다.</p>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m12 19-7-7 7-7"/><path d="M19 19-5 5"/></svg>
        네카라쿠배 입성을 위한 3+1가지 핵심 역량
      </h2>
      <ul className="!my-4 space-y-4 text-base">
        <li><strong>1. 코딩 테스트 통과 역량:</strong> 알고리즘과 자료구조는 기본 중의 기본입니다. '백준', '프로그래머스' 등의 플랫폼에서 꾸준히 문제를 풀며, 제한된 시간 안에 효율적인 코드를 작성하는 문제 해결 능력을 길러야 합니다. 단순히 정답을 맞추는 것을 넘어, 시간 복잡도와 공간 복잡도를 고려하는 습관이 중요합니다.</li>
        <li><strong>2. 기술 블로그 & 포트폴리오 (성장 가능성 증명):</strong> 단순히 코드를 나열하는 포트폴리오는 의미가 없습니다. 특정 기술을 왜 사용했는지, 문제 해결 과정에서 어떤 고민을 했고 어떻게 해결했는지, 그 과정에서 무엇을 배웠는지 '기록'으로 남기는 것이 중요합니다. 당신의 성장 가능성을 보여주는 가장 좋은 방법입니다.</li>
        <li><strong>3. CS 기본기 (기술적 깊이):</strong> 운영체제(OS), 네트워크, 데이터베이스, 컴퓨터 구조 등 컴퓨터 과학의 기본 지식은 좋은 개발자의 필수 소양입니다. 화려한 기술보다 탄탄한 기본기가 갖춰진 개발자를 선호하며, 면접에서 당신의 기술적 깊이를 보여줄 수 있는 결정적인 무기가 됩니다.</li>
        <li><strong>+1. 커뮤니케이션 능력:</strong> 뛰어난 개발자일수록 동료들과 명확하고 효율적으로 소통합니다. 코드 리뷰, 기술 토론, 협업 과정에서 자신의 의견을 논리적으로 표현하고 다른 사람의 의견을 경청하는 태도가 매우 중요합니다.</li>
      </ul>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        내 직군별 연봉은 어느 정도일까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        네카라쿠배를 목표로 하기 전, 백엔드, 프론트엔드, 앱 개발, 데이터 사이언티스트 등 내 직무의 시장 가치를 먼저 파악하는 것이 중요합니다. 직군별 상세 연봉 정보를 확인하고, 당신의 커리어 로드맵을 구체화해보세요.
      </p>
      <a
        href="/guides/it-developer-salary-comparison-by-role"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        개발자 직군별 연봉 비교하기
      </a>
    </section>
  ` },
  { slug: "hyundai-production-salary", title: "현대차 생산직 연봉: '킹산직'의 모든 것", description: "신의 직장이라 불리는 현대자동차 생산직의 실제 연봉과 복지를 심층 분석합니다.", category: "연봉", tags: ["생산직", "현대자동차", "킹산직"], level: "중급", publishedDate: "2025-10-10", views: 210987, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '킹산직' (King + 생산직), '갓산직' (God + 생산직). 모두 현대자동차그룹의 생산직을 일컫는 말입니다. 2023년 채용 당시 300:1이 넘는 경쟁률을 기록하며 그 인기를 증명했죠. 평균 연봉 1억, 만 60세 정년 보장, 자사 차량 30% 할인 등 압도적인 처우. 과연 소문은 사실일까요? 대한민국 최고의 직장 중 하나로 꼽히는 현대차 생산직의 연봉, 복지, 채용 과정의 모든 것을 파헤쳐봅니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        왜 '킹산직'이라 불릴까? (연봉 & 복지 심층 분석)
      </h2>
      <p>
        현대차 생산직이 '킹산직'으로 불리는 이유는 단순히 높은 연봉 때문만이 아닙니다. 강력한 고용 안정성과 삶의 질을 높여주는 압도적인 복지 혜택이 그 명성을 만들었습니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
            <h3 className="font-bold !mt-0 !mb-2">💰 압도적인 연봉</h3>
            <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
                <li><strong>평균 연봉 1억 이상:</strong> 기본급에 각종 수당(주말 특근, 잔업)과 매년 수천만원에 달하는 성과급이 더해져, 평균 연봉은 1억원을 상회하는 것으로 알려져 있습니다.</li>
                <li><strong>높은 초봉:</strong> 신입사원 초봉 역시 각종 수당을 포함하면 7,000만원 이상으로, 대기업 사무직과 비교해도 최고 수준입니다.</li>
            </ul>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
            <h3 className="font-bold !mt-0 !mb-2">🛡️ 철벽 고용 안정성</h3>
            <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
                <li><strong>만 60세 정년 보장:</strong> 강력한 노동조합의 영향으로 사실상 정년이 완벽하게 보장됩니다.</li>
                <li><strong>정년 후 계약직 근무:</strong> 퇴직 후에도 계약직으로 근무하며 소득을 이어갈 수 있는 기회가 있습니다.</li>
            </ul>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
            <h3 className="font-bold !mt-0 !mb-2">🚗 파격적인 차량 할인</h3>
            <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
                <li><strong>신차 최대 30% 할인:</strong> 근속 연수에 따라 2년에 한 번씩 자사 차량 구매 시 최대 30%의 파격적인 할인을 제공합니다.</li>
                <li><strong>퇴직 후에도 평생 혜택:</strong> '평생사원증'을 통해 퇴직 후에도 75세까지 3년마다 신차 25% 할인 혜택을 누릴 수 있습니다.</li>
            </ul>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
            <h3 className="font-bold !mt-0 !mb-2">👨‍👩‍👧‍👦 가족까지 챙기는 복지</h3>
            <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
                <li><strong>자녀 학자금 전액 지원:</strong> 유치원부터 대학교까지 자녀 학비 걱정이 없습니다.</li>
                <li><strong>주거 안정 지원:</strong> 저금리로 주택 구입 및 임차 자금을 지원합니다.</li>
                <li><strong>의료비 지원:</strong> 직원 본인 및 가족의 의료비를 지원하며, 사내 병원도 이용 가능합니다.</li>
            </ul>
        </div>
      </div>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">연봉 구조: 기본급 + 수당 + 성과급</h2>
      <p>
        현대차 생산직의 연봉은 여러 항목으로 구성되며, 특히 추가 근무 수당과 성과급의 비중이 매우 큽니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">기본급</h3>
          <p className="!text-sm !my-0">매년 노사 협상을 통해 결정되는 기본 연봉입니다. 근속 연수에 따라 호봉이 오르며 꾸준히 상승합니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">각종 수당</h3>
          <p className="!text-sm !my-0">주말 특근, 잔업 등 추가 근무에 대한 수당이 연봉의 상당 부분을 차지합니다. 생산량에 따라 수당 규모가 크게 달라질 수 있습니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">성과급 (PS/PI)</h3>
          <p className="!text-sm !my-0">매년 회사 경영 실적에 따라 지급되며, 실적이 좋을 때는 수천만원에 달하는 목돈을 받을 수 있어 '연봉의 꽃'으로 불립니다.</p>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">현실적인 장단점과 채용 과정</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <p className="font-semibold">👍 장점</p>
            <ul className="!text-sm !my-0 list-disc list-inside">
                <li>압도적인 연봉과 복지 혜택</li>
                <li>만 60세 정년 보장에 따른 강력한 고용 안정성</li>
                <li>자녀 학자금, 차량 할인 등 대체 불가능한 베네핏</li>
                <li>주간 2교대 근무로 비교적 좋은 워라밸</li>
            </ul>
        </div>
        <div>
            <p className="font-semibold">👎 단점 및 현실</p>
            <ul className="!text-sm !my-0 list-disc list-inside">
                <li>수백 대 일에 달하는 극악의 채용 경쟁률</li>
                <li>주야 2교대 등 육체적 근무 강도 및 라인 근무의 단조로움</li>
                <li>다소 경직되고 수직적인 조직 문화</li>
                <li>향후 전기차 전환에 따른 고용 구조 변화 가능성</li>
            </ul>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-bold !text-lg">채용 과정 (2025년 예상)</h3>
        <p className="!text-sm">고등학교 졸업 이상이면 누구나 지원 가능하지만, 서류-인적성-1차면접-2차면접의 험난한 과정을 거쳐야 합니다. 특히 자동차 생산 공정에 대한 이해도와 협업 능력을 어필하는 것이 중요합니다.</p>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        평균 연봉 1억, 내 실수령액은?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        성과급까지 더해진 나의 '영끌 연봉', 세금을 떼고 나면 통장에 얼마가 찍힐까요? '연봉 계산기'로 정확한 월 실수령액을 확인하고, '킹산직'의 꿈에 한 발 더 다가가 보세요.
      </p>
      <a
        href="/salary"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        내 연봉 실수령액 계산하기
      </a>
    </section>
  ` },
  { slug: "public-servant-salary", title: "9급 공무원 첫 월급, 정말 박봉일까?", description: "기본급 뒤에 숨겨진 각종 수당을 포함한 공무원의 진짜 월급을 공개합니다.", category: "연봉", tags: ["공무원", "9급", "월급"], level: "초급", publishedDate: "2025-09-28", views: 88765, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      "공무원은 박봉이다?" 많은 사람들이 갖는 고정관념입니다. 하지만 이 말은 반은 맞고 반은 틀립니다. 인사혁신처가 발표하는 봉급표의 '기본급'만 보면 낮아 보일 수 있지만, 실제 월급은 여기에 각종 수당이 더해져 결정되기 때문입니다. 공무원 봉급 체계의 핵심인 '기본급'과 18종에 달하는 복잡한 '수당'의 구조를 이해하는 것이 내 진짜 월급을 아는 첫걸음입니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-amber-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        공무원 월급 = 기본급(봉급) + 각종 수당
      </h2>
      <p>
        인사혁신처에서 매년 발표하는 '공무원 봉급표'는 기본급에 해당합니다. 여기에 아래와 같은 주요 수당들이 더해져 세전 월급이 완성됩니다. 수당은 크게 모든 공무원에게 지급되는 공통 수당과, 특정 업무나 근무 환경에 따라 지급되는 추가 수당으로 나뉩니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">정액급식비</h3>
          <p className="!text-sm !my-0">전 직원 대상 <strong>월 14만원</strong> 정액 지급</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">직급보조비</h3>
          <p className="!text-sm !my-0">직급별 차등 지급 (9급 <strong>월 17.5만원</strong>, 7급 <strong>월 18.5만원</strong>)</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">명절휴가비</h3>
          <p className="!text-sm !my-0">설날, 추석에 각각 <strong>월봉급액의 60%</strong> 지급 (연 2회)</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">정근수당</h3>
          <p className="!text-sm !my-0">근무 연수에 따라 1월, 7월에 지급 (최대 <strong>월봉급액의 50%</strong>)</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">시간외근무수당</h3>
          <p className="!text-sm !my-0">규정된 근무시간 외 초과 근무 시 지급</p>
        </div>
         <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">가족수당</h3>
          <p className="!text-sm !my-0">배우자 월 4만원, 자녀 1인당 월 2~10만원 등 부양가족에 따라 지급</p>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
      <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        그래서, 9급 1호봉의 진짜 첫 월급은?
      </h2>
      <p className="!my-2 text-base">
        2025년 9급 1호봉의 기본급은 <strong>1,877,000원</strong>입니다. 여기에 매달 고정적으로 나오는 수당을 더해봅시다. (초과근무수당 등 변동 수당 제외)
      </p>
      <blockquote className="!border-l-blue-500 !mt-4 !text-base bg-white dark:bg-gray-800 p-4 rounded">
         <ul className="!my-2 space-y-2">
          <li className="flex justify-between"><span>기본급 (9급 1호봉):</span> <strong>1,877,000원</strong></li>
          <li className="flex justify-between"><span>+ 직급보조비 (9급):</span> <strong>175,000원</strong></li>
          <li className="flex justify-between"><span>+ 정액급식비:</span> <strong>140,000원</strong></li>
          <li className="flex justify-between border-t pt-2 mt-2 border-gray-300 dark:border-gray-600"><span><strong>월 급여액 (세전):</strong></span> <strong className="text-blue-600">2,192,000원</strong></li>
        </ul>
      </blockquote>
      <p className="!my-2 text-base">
        즉, 고정 수당만 더해도 월 급여는 약 219만원이며, 여기서 4대보험(공무원연금 기여금)과 소득세를 공제한 금액이 실수령액이 됩니다. 또한, 1월과 7월에는 정근수당, 설과 추석에는 명절휴가비가 추가되어 해당 월에는 훨씬 더 많은 월급을 받게 됩니다. 여기에 초과근무수당까지 더해지면 실제 소득은 더 늘어납니다.
      </p>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">2025년 일반직 공무원 봉급표</h2>
      <p>
        아래는 2025년 일반직 공무원의 직급 및 호봉에 따른 월 기본급(봉급) 표입니다. 공무원 보수는 매년 물가상승률 등을 반영하여 인상됩니다. (단위: 원)
      </p>
      <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
        <table className="w-full text-center text-xs sm:text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2 font-semibold">직급/호봉</th>
              <th className="p-2 font-semibold">1호봉</th>
              <th className="p-2 font-semibold">5호봉</th>
              <th className="p-2 font-semibold">10호봉</th>
              <th className="p-2 font-semibold">15호봉</th>
              <th className="p-2 font-semibold">20호봉</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">9급</td><td className="p-2">1,877,000</td><td className="p-2">2,122,100</td><td className="p-2">2,555,900</td><td className="p-2">3,031,500</td><td className="p-2">3,476,900</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">8급</td><td className="p-2">1,937,600</td><td className="p-2">2,283,200</td><td className="p-2">2,781,500</td><td className="p-2">3,298,900</td><td className="p-2">3,749,100</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">7급</td><td className="p-2">2,086,700</td><td className="p-2">2,534,900</td><td className="p-2">3,110,500</td><td className="p-2">3,668,900</td><td className="p-2">4,169,700</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">6급</td><td className="p-2">2,244,800</td><td className="p-2">2,791,500</td><td className="p-2">3,453,500</td><td className="p-2">4,062,100</td><td className="p-2">4,592,200</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-2 font-bold">5급</td><td className="p-2">2,650,700</td><td className="p-2">3,258,900</td><td className="p-2">4,013,400</td><td className="p-2">4,691,900</td><td className="p-2">5,276,800</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        내 직급과 호봉, 실수령액은?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        나의 예상 직급, 호봉, 그리고 각종 수당을 더한 '월 지급액'을 연봉으로 환산하여 입력해보세요. 공무원연금 기여금과 소득세 등을 제외한 정확한 세후 실수령액을 확인할 수 있습니다.
      </p>
      <a
        href="/salary"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        공무원 월급 실수령액 계산하기
      </a>
    </section>
  ` },
  { slug: "foreign-company-salary", title: "외국계 기업 연봉, 정말 더 높을까?", description: "국내 기업 vs 외국계 기업, 같은 직무의 연봉과 복지를 비교 분석합니다.", category: "연봉", tags: ["외국계", "연봉 비교", "커리어"], level: "중급", publishedDate: "2025-09-22", views: 76543, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '워라밸', '수평적 문화', '높은 연봉'. 많은 직장인들이 외국계 기업에 대해 갖는 환상입니다. 하지만 그 실상은 어떨까요? 막연한 환상을 걷어내고, 데이터와 현실에 기반하여 국내 대기업과 외국계 기업의 연봉, 복지, 문화의 차이점을 심층 비교 분석하고, 나에게 더 맞는 기업은 어디일지 판단하는 기준을 제시합니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        결론부터: '케바케', 하지만 '구조'와 '철학'이 다르다
      </h2>
      <p>
        결론부터 말하자면, '외국계 기업 연봉이 항상 더 높다'는 것은 사실이 아닙니다. 구글, 애플과 같은 최상위 빅테크 기업은 국내 대기업보다 높은 보상을 제공하지만, 다수의 외국계 기업은 산업, 기업 규모, 직무, 개인의 역량에 따라 천차만별입니다. 중요한 것은 연봉의 액수보다 보상 시스템의 '구조'와 '철학'의 차이를 이해하는 것입니다.
      </p>
      <blockquote className="!border-l-blue-500">
        <p>
          <strong>핵심 차이:</strong> 국내 대기업이 '안정성'과 '집단' 중심의 연공서열 기반 보상 체계를 갖는다면, 외국계 기업은 '개인의 성과'와 '시장 가치'에 기반한 철저한 성과주의 보상 체계를 갖는 경향이 강합니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">국내 대기업 vs 외국계 기업, 무엇이 다른가?</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">국내 대기업</h3>
          <ul className="!text-sm !my-0 list-disc list-inside space-y-2">
            <li><strong>연봉 구조:</strong> 기본급 외에 각종 수당(식대, 교통비 등)과 상여금이 복잡하게 얽혀있습니다. 기본급 비중이 상대적으로 낮고, 변동성이 큰 성과급(PS/PI)의 영향이 큽니다.</li>
            <li><strong>문화:</strong> 근속 연수에 따라 연봉과 직급이 꾸준히 상승하는 연공서열 문화가 강하며, 조직 중심의 집단주의 문화가 특징입니다.</li>
            <li><strong>복지:</strong> 자녀 학자금, 사내 병원, 경조사 지원 등 가족 중심의 '요람에서 무덤까지' 식 복지 제도가 잘 갖춰져 있습니다.</li>
            <li><strong>고용 안정성:</strong> 강력한 노조의 영향 등으로 고용 안정성이 매우 높습니다.</li>
          </ul>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300">외국계 기업</h3>
          <ul className="!text-sm !my-0 list-disc list-inside space-y-2">
            <li><strong>연봉 구조:</strong> 연봉이 'Base Salary(기본급)'로 명확하게 정해져 있고, 개인의 성과에 따라 보너스(인센티브)가 책정되는 단순하고 명확한 구조입니다.</li>
            <li><strong>문화:</strong> 직급보다 역할(Role)을 중시하는 수평적인 문화가 많으며, 개인의 자율성과 책임을 강조합니다. '워라밸'을 중시하고, 재택근무나 유연근무가 비교적 자유롭습니다.</li>
            <li><strong>복지:</strong> 개인의 성장을 위한 교육 지원, 피트니스 멤버십, 심리 상담 등 개인 맞춤형 복지 프로그램을 제공하는 경우가 많습니다.</li>
            <li><strong>고용 안정성:</strong> 성과가 나지 않을 경우 해고가 비교적 자유로워 고용 안정성은 국내 대기업보다 낮습니다.</li>
          </ul>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">어떤 선택이 나에게 유리할까?</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <p className="font-semibold">👍 국내 대기업이 더 맞을 수 있는 사람</p>
            <ul className="!text-sm !my-0 list-disc list-inside">
                <li>안정적인 고용과 꾸준한 연봉 상승을 선호하는 사람</li>
                <li>강력한 노조의 보호와 조직 중심의 집단주의 문화를 편안하게 느끼는 사람</li>
                <li>자녀 학자금, 사내 병원 등 가족 중심의 복지 혜택을 중시하는 사람</li>
                <li>체계적인 시스템 안에서 전문가로 성장하고 싶은 사람</li>
            </ul>
        </div>
        <div>
            <p className="font-semibold">👍 외국계 기업이 더 맞을 수 있는 사람</p>
            <ul className="!text-sm !my-0 list-disc list-inside">
                <li>자신의 성과에 따라 확실하고 즉각적인 보상을 받고 싶은 사람</li>
                <li>수평적이고 개인의 자율성을 존중하는 문화를 선호하는 사람</li>
                <li>연봉 협상을 통해 자신의 가치를 적극적으로 어필하고 싶은 사람</li>
                <li>글로벌 환경에서 다양한 동료들과 함께 일하며 성장하고 싶은 사람</li>
            </ul>
        </div>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        외국계 이직의 핵심, '연봉 협상'
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        외국계 기업은 채용 시 지원자의 희망 연봉을 중요하게 고려하며, 협상을 통해 최종 연봉이 결정되는 경우가 많습니다. 당신의 가치를 제대로 인정받기 위해서는 철저한 시장 조사와 성과 증명, 그리고 논리적인 협상 전략이 필수입니다.
      </p>
      <a
        href="/guides/salary-negotiation-strategy"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        연봉 협상 실전 전략 가이드 보기
      </a>
    </section>
  ` },
  { slug: "first-job-guide", title: "첫 이직, 성공을 위한 A to Z 가이드", description: "이력서 작성부터 면접, 연봉 협상까지. 성공적인 첫 이직을 위한 모든 것을 담았습니다.", category: "커리어", tags: ["이직", "초년생", "면접"], level: "초급", publishedDate: "2025-10-25", views: 65432, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      첫 직장에서의 설렘도 잠시, '이게 정말 내 길이 맞을까?' 하는 고민과 함께 성장의 정체를 느끼고 있나요? 첫 이직은 당신의 커리어 방향을 결정하고, 몸값을 몇 단계나 점프시킬 수 있는 매우 중요한 분기점입니다. 막연한 불안감 대신, 체계적인 준비와 전략적인 접근을 통해 성공적인 첫 이직을 하고 당신의 가치를 제대로 인정받는 방법을 A부터 Z까지 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-purple-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        첫 이직, 언제 해야 할까? (골든타임 신호)
      </h2>
      <p>
        '최소 1년은 버텨야지'라는 막연한 조언에 얽매일 필요는 없습니다. 중요한 것은 '시간'이 아니라 '경험의 밀도'입니다. 아래와 같은 신호가 보인다면, 당신은 이직을 진지하게 고민해볼 때입니다.
      </p>
      <ul className="!my-4 space-y-3 text-base">
        <li><strong>더 이상 배울 것이 없다고 느껴질 때:</strong> 매일 반복되는 업무가 익숙해지고, 더 이상 새로운 기술이나 지식을 습득할 기회가 없어 성장의 정체가 느껴진다면 새로운 환경이 필요하다는 명확한 신호입니다.</li>
        <li><strong>회사의 비전이나 문화와 맞지 않을 때:</strong> 회사가 나아가는 방향에 동의할 수 없거나, 비합리적인 의사결정, 수직적인 조직 문화가 나와 맞지 않아 스트레스를 받는다면 장기적인 관점에서 이직을 고려해야 합니다.</li>
        <li><strong>노력에 비해 정당한 보상을 받지 못한다고 느낄 때:</strong> 당신의 성과와 시장 가치에 비해 연봉이나 처우가 불만족스럽고, 개선의 여지가 보이지 않는다면 더 나은 기회를 찾아 나설 때입니다.</li>
        <li><strong>더 좋은 기회가 찾아왔을 때:</strong> 현재 회사에 큰 불만은 없더라도, 당신의 커리어 목표에 더 부합하는 매력적인 포지션 제안이 왔다면 과감하게 도전해볼 가치가 있습니다.</li>
      </ul>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">성공적인 첫 이직을 위한 5단계 로드맵</h2>
      <div className="mt-6 space-y-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">1</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">자기 분석: '나'라는 상품을 파악하라</h3>
            <p className="!text-sm !my-0">
              이직 시장에서 당신은 하나의 '상품'입니다. 첫 직장에서 무엇을 배웠고(Skill-set), 어떤 성과를 냈으며(Performance), 어떤 강점과 약점을 가졌는지(Character) 냉정하게 분석해야 합니다. '나는 어떤 일을 할 때 가장 즐거운가?', '앞으로 어떤 분야의 전문가가 되고 싶은가?'를 스스로에게 질문하며 커리어의 방향성을 명확히 설정하는 것이 첫 단추입니다.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">2</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">서류 준비: '나'를 매력적으로 포장하라</h3>
            <p className="!text-sm !my-0">
              첫 이직에서 가장 중요한 서류는 '경력기술서'입니다. 단순히 '무엇을 했다'는 사실 나열에서 그치는 것이 아니라, 당신의 경험을 바탕으로 '어떤 문제를(Problem) 어떻게 해결했고(Action) 그 결과 어떤 성과(Result)를 만들었는지' PAR 공식을 활용해 구체적인 성과 중심으로 작성해야 합니다.
              <a href="/guides/portfolio-secret-to-increasing-acceptance-rate" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ 합격률 높이는 경력기술서 작성법</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">3</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">플랫폼 활용: '나'를 시장에 알려라</h3>
            <p className="!text-sm !my-0">
              잘 만든 이력서와 경력기술서를 원티드, 리멤버 등 주요 채용 플랫폼에 등록하고, 헤드헌터의 눈에 띌 수 있도록 링크드인 프로필을 꾸준히 관리해야 합니다. 좋은 포지션은 내가 찾기 전에 먼저 제안이 오는 경우가 많습니다.
              <a href="/guides/linkedin-power-up" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ 헤드헌터에게 연락받는 링크드인 프로필 만들기</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">4</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">면접 준비: '나'의 가치를 증명하라</h3>
            <p className="!text-sm !my-0">
              '왜 첫 직장을 1~3년 만에 그만두려 하는가?'는 단골 질문입니다. 전 직장에 대한 불만보다는 '성장'과 '비전'의 관점에서 "현재 회사도 좋지만, 귀사의 OOO 프로젝트에 기여하며 더 큰 성장을 하고 싶습니다"와 같이 긍정적이고 미래지향적인 답변을 준비해야 합니다. 경력기술서에 작성한 프로젝트 경험을 바탕으로 당신의 실력과 잠재력을 확실하게 증명하세요.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">5</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">연봉 협상: '나'의 몸값을 높여라</h3>
            <p className="!text-sm !my-0">
              첫 이직은 당신의 연봉을 가장 크게 올릴 수 있는 절호의 기회입니다. 당신의 시장 가치를 정확히 파악하고, 원하는 연봉을 논리적으로 요구하는 방법을 미리 준비해야 합니다. 연봉 협상은 이직 프로세스의 마지막 단계가 아닌, 당신의 가치를 인정받는 중요한 과정입니다.
              <a href="/guides/salary-negotiation-strategy" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ 연봉 협상 실전 전략 가이드</a>
            </p>
          </div>
        </div>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        당신의 성공적인 첫 이직을 응원합니다
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        첫 이직은 두렵고 막막하게 느껴질 수 있지만, 당신의 커리어를 한 단계 도약시키는 최고의 기회입니다. 철저한 준비와 자신감 있는 태도로 원하는 결과를 얻으시길 바랍니다.
      </p>
      <a
        href="/guides"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        더 많은 커리어 가이드 보기
      </a>
    </section>
  ` },
  { slug: "linkedin-power-up", title: "링크드인 프로필, 이렇게 만들면 헤드헌터에게 연락온다", description: "당신의 몸값을 높여줄 링크드인 프로필 작성법과 네트워킹 전략을 공개합니다.", category: "커리어", tags: ["링크드인", "헤드헌터", "브랜딩"], level: "중급", publishedDate: "2025-10-18", views: 81234, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      이직을 준비할 때만 링크드인 프로필을 업데이트하시나요? 링크드인은 더 이상 단순한 온라인 이력서가 아닙니다. 좋은 헤드헌터와 채용 담당자들은 지금 당장 이직할 사람이 아니더라도, 잠재적인 후보군을 꾸준히 관리하고 관계를 맺습니다. 즉, 당신의 링크드인 프로필은 24시간 쉬지 않고 당신의 전문성을 홍보하고, 미래의 기회를 만들어내는 '디지털 명함'이자 '개인 브랜딩 채널'입니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-green-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        헤드헌터의 눈을 사로잡는 프로필 최적화 5단계
      </h2>
      <p className="!my-2">헤드헌터는 하루에도 수백 개의 프로필을 검토합니다. 단 몇 초 만에 당신의 가치를 보여주지 못하면 기회는 사라집니다. 아래 5가지 핵심 요소를 최적화하여 헤드헌터의 연락을 이끌어내세요.</p>
      <div className="mt-6 space-y-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">1. 헤드라인: 당신을 '검색'하게 만드는 핵심 키워드 조합</h3>
          <p className="!text-sm !my-2">헤드헌터는 'Java 백엔드 개발자' 와 같은 키워드로 인재를 검색합니다. 당신의 직무, 핵심 기술, 전문 분야(도메인)를 조합하여 당신을 가장 잘 나타내는 키워드를 헤드라인에 모두 담아야 합니다.</p>
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md text-sm"><span className="font-bold text-red-600">Bad:</span> Backend Developer at Samsung</div>
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md text-sm mt-2"><span className="font-bold text-green-600">Good:</span> Backend Developer @ Samsung | Java, Spring, MSA | E-commerce & Fintech Expert</div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">2. 자기소개(About): 3줄로 요약하는 '나는 이런 사람'</h3>
          <p className="!text-sm !my-2">당신이 누구인지(Who), 무엇에 강점이 있는지(What), 그리고 어떤 기회를 찾는지(Next) 3~4줄의 짧은 문단으로 요약하여 제시하세요. 헤드헌터가 당신의 프로필을 더 자세히 읽어봐야 할 이유를 만들어주는 공간입니다.</p>
          <blockquote className="!border-l-blue-500 !my-2 !p-2 !text-sm">
            <p className="!my-1">1. <strong>Who:</strong> 5년차 백엔드 개발자 OOO입니다.</p>
            <p className="!my-1">2. <strong>What:</strong> Java/Spring 기반의 대용량 트래픽 처리 및 MSA 설계, 구축, 운영 경험에 강점이 있습니다.</p>
            <p className="!my-1">3. <strong>Next:</strong> 사용자 중심의 핀테크 플랫폼 기업에서 동료들과 함께 성장할 수 있는 시니어 개발자 포지션을 찾고 있습니다.</p>
          </blockquote>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">3. 경력: STAR 기법으로 '결과'를 증명하라</h3>
          <p className="!text-sm !my-2">'무엇을 했다'는 책임(Responsibility) 나열에서 그치지 말고, STAR 기법(Situation, Task, Action, Result)을 활용해 '어떤 문제를 어떻게 해결하여 어떤 결과를 만들었는지' 구체적인 숫자로 성과(Accomplishment)를 보여주세요.</p>
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md text-sm"><span className="font-bold text-red-600">Bad:</span><br/>- 쇼핑몰 백엔드 기능 개발 및 유지보수 담당</div>
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md text-sm mt-2"><span className="font-bold text-green-600">Good:</span><br/>- <strong>(S)</strong> 기존 모놀리식(Monolithic) 구조의 쇼핑몰 시스템에서 잦은 장애 발생 및 신규 기능 개발 지연 문제 발생. <strong>(T)</strong> 이를 해결하기 위해 MSA(Microservice Architecture)로 전환하는 프로젝트 리딩. <strong>(A)</strong> 주요 도메인별 서비스 분리, API Gateway 도입, CI/CD 파이프라인 구축. <strong>(R)</strong> 그 결과, 주문 처리량을 300% 향상시키고, 서버 비용을 20% 절감했으며, 배포 주기를 2주에서 1일로 단축.</div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">4. 기술(Skills) & 추천(Endorsement): 전문성을 객관적으로 입증하라</h3>
          <p className="!text-sm !my-2">당신이 다룰 수 있는 모든 기술 스택(프로그래밍 언어, 프레임워크, 클라우드 서비스 등)을 추가하세요. 그리고 함께 일했던 동료나 상사에게 '기술 추천(Endorsement)'을 요청하여 당신의 전문성에 대한 객관적인 신뢰도를 높이세요. 추천은 프로필의 사회적 증거가 됩니다.</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">5. 'Open to Work' 설정: 조용히 기회를 탐색하라</h3>
          <p className="!text-sm !my-2">'Open to Work' 기능을 'Recruiters only' 옵션으로 설정하면, 현재 회사 동료들은 모르게 헤드헌터와 채용 담당자에게만 당신이 이직 시장에 나왔음을 알릴 수 있습니다. 원하는 직무, 근무 형태, 지역 등을 상세히 설정하여 더 정확한 포지션 제안을 받으세요.</p>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        프로필 노출을 극대화하는 추가 활동
      </h2>
      <ul className="!my-2 space-y-2 text-base">
        <li><strong>1촌(Connections) 늘리기:</strong> 꾸준히 1촌을 늘려 네트워크를 확장하세요. 1촌이 500명 이상이 되면 프로필 신뢰도가 크게 향상됩니다.</li>
        <li><strong>콘텐츠 공유 및 작성:</strong> 관심 분야의 좋은 글을 공유하거나, 당신의 업무 경험과 인사이트를 담은 글을 직접 작성해보세요. 당신의 전문성을 보여주고, 프로필 노출 빈도를 높이는 가장 좋은 방법입니다.</li>
        <li><strong>적극적인 소통:</strong> 관심 분야의 게시물에 '좋아요'를 누르거나, 전문가의 글에 의미 있는 댓글을 다는 것만으로도 당신의 프로필이 더 많은 사람들에게 노출됩니다.</li>
      </ul>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        완벽한 프로필, 다음 단계는?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        이제 당신의 링크드인 프로필은 헤드헌터의 눈길을 사로잡을 준비가 되었습니다. 다음은, 당신의 모든 성과를 집약하여 합격을 결정짓는 '경력기술서'를 작성할 차례입니다.
      </p>
      <a
        href="/guides/portfolio-secret-to-increasing-acceptance-rate"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        합격률 높이는 경력기술서 작성법
      </a>
    </section>
  ` },
  { slug: "startup-vs-large-corp", title: "스타트업 vs 대기업, 당신의 선택은?", description: "성장 가능성과 안정성, 두 마리 토끼를 잡기 위한 커리어 선택 가이드.", category: "커리어", tags: ["스타트업", "대기업", "커리어패스"], level: "중급", publishedDate: "2025-10-12", views: 54321, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '안정적인 대기업에 가야 할까, 아니면 제2의 유니콘을 꿈꾸는 스타트업에 합류해야 할까?' 많은 주니어들이 커리어의 시작점에서 하는 가장 큰 고민입니다. 정답은 없습니다. 당신의 성향과 목표, 그리고 커리어 단계에 더 '적합한' 선택이 있을 뿐입니다. 안정적인 시스템과 폭발적인 성장, 두 마리 토끼 사이에서 고민하는 당신을 위해 두 선택지의 장단점을 심층 비교 분석해 드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-purple-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        무엇을 가장 중요하게 생각하시나요? (가치관 점검)
      </h2>
      <p>
        대기업과 스타트업은 연봉 구조, 업무 방식, 성장 기회, 조직 문화 등 거의 모든 면에서 다릅니다. 아래 질문들에 답하며 당신이 어떤 가치를 우선순위에 두는지 먼저 점검해보세요.
      </p>
      <ul className="!my-4 space-y-2 text-base list-disc list-inside bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <li>나는 안정적인 시스템 안에서 체계적으로 일하는 것을 선호하는가, 아니면 불확실하더라도 빠르게 실행하고 배우는 것을 선호하는가?</li>
          <li>나는 하나의 분야를 깊게 파고드는 '스페셜리스트'가 되고 싶은가, 아니면 다양한 분야를 경험하는 '제너럴리스트'가 되고 싶은가?</li>
          <li>나는 높은 연봉과 복지를 통한 안정적인 삶을 원하는가, 아니면 스톡옵션 등을 통한 '인생 역전'의 기회를 꿈꾸는가?</li>
      </ul>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">대기업 vs 스타트업, 한눈에 비교하기</h2>
      <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 font-semibold">구분</th>
              <th className="p-3 font-semibold">대기업</th>
              <th className="p-3 font-semibold">스타트업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">연봉/보상</td>
              <td className="p-3">높은 초봉과 안정적인 성과급, 강력한 복지(주택자금, 의료비 등)</td>
              <td className="p-3">상대적으로 낮은 초봉, 스톡옵션을 통한 '대박' 기회, 성과 기반 인센티브</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">업무 방식</td>
              <td className="p-3">체계적, 분업화. 정해진 프로세스 안에서 맡은 분야의 '스페셜리스트'로 성장</td>
              <td className="p-3">빠른 실행, 넓은 업무 범위(1인 다역). 다재다능한 '제너럴리스트'로 성장</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">성장 가능성</td>
              <td className="p-3">안정적인 커리어패스, 체계적인 사내 교육 시스템, 사수/부사수 문화</td>
              <td className="p-3">회사와 함께 폭발적으로 성장, 빠른 승진 기회, 자기주도적 학습 필수</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">고용 안정성</td>
              <td className="p-3">매우 높음. 정년 보장을 기대할 수 있으며, 노조의 보호를 받음</td>
              <td className="p-3">낮음. 회사의 생존이 곧 나의 생존. 투자 유치 실패 시 구조조정 위험</td>
            </tr>
             <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">문화</td>
              <td className="p-3">안정적, 체계적, 다소 보수적이고 수직적일 수 있음. 의사결정이 느림.</td>
              <td className="p-3">수평적, 자율적, 변화가 빠르고 혼란스러울 수 있음. 빠른 의사결정.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">당신은 어떤 사람인가요? (성향별 추천)</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <p className="font-semibold">👍 대기업이 더 맞는 당신</p>
            <ul className="!text-sm !my-0 list-disc list-inside">
                <li>안정적인 시스템 안에서 한 분야의 전문가로 깊이 성장하고 싶은 사람</li>
                <li>높은 초봉과 다양한 복지 혜택을 통한 안정적인 삶을 중요하게 생각하는 사람</li>
                <li>정년까지 안정적으로 일하고 싶은 '안정 추구형' 인재</li>
                <li>명확한 가이드라인과 체계적인 교육을 통해 배우는 것을 선호하는 사람</li>
            </ul>
        </div>
        <div>
            <p className="font-semibold">👍 스타트업이 더 맞는 당신</p>
            <ul className="!text-sm !my-0 list-disc list-inside">
                <li>스톡옵션 대박의 꿈을 꾸는 '리스크 감수형' 인재</li>
                <li>다양한 업무를 경험하며 빠르게 성장하고, 내 결정이 서비스에 즉각 반영되는 것을 보고 싶은 사람</li>
                <li>자율적인 환경에서 자신의 아이디어를 실현하고, 회사를 내 손으로 키워보고 싶은 '오너십'이 강한 사람</li>
                <li>정해진 답 없이, 스스로 문제를 찾고 해결하는 과정을 즐기는 사람</li>
            </ul>
        </div>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        어떤 선택이든, 성장은 계속되어야 합니다
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        대기업과 스타트업, 어디에 있든 가장 중요한 것은 당신의 '실력'입니다. 특히 AI가 많은 것을 대체하는 시대에는, 기술 변화에 빠르게 적응하고 새로운 가치를 만들어내는 개발자만이 살아남을 수 있습니다.
      </p>
      <a
        href="/guides/developer-roadmap-2026"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        2026년 개발자 커리어 로드맵 보기
      </a>
    </section>
  ` },
  { slug: "pm-career-path", title: "비개발자를 위한 IT 프로덕트 매니저(PM) 되는 법", description: "PM의 역할, 필요한 역량, 그리고 성공적인 커리어 전환을 위한 로드맵을 제시합니다.", category: "커리어", tags: ["PM", "IT", "커리어전환"], level: "고급", publishedDate: "2025-10-05", views: 92345, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '제품의 CEO', '미니 CEO'라 불리는 프로덕트 매니저(PM). 많은 개발자와 기획자들이 다음 커리어로 꿈꾸는 직무이지만, 구체적으로 어떤 일을 하고 어떻게 성장하는지에 대해서는 잘 알려져 있지 않습니다. PM의 역할과 역량, 그리고 성장 경로(Career Path)에 대해 총정리해 드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 8l-4 4 4 4"></path><path d="M16 12H8"></path></svg>
        프로덕트 매니저(PM)는 어떤 일을 하나요?
      </h2>
      <p>
        PM은 제품(Product)의 성공을 책임지는 사람입니다. 고객의 문제를 발견하고, 이를 해결할 제품을 정의하며, 디자인, 개발, 마케팅 등 다양한 팀과 협업하여 제품을 시장에 출시하고 성장시키는 전 과정을 관리합니다.
      </p>
      <ul className="!my-4 space-y-2 text-base list-disc list-inside bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <li><strong>Why & What (전략):</strong> 고객과 시장을 분석하여 '왜' 이 제품을 만들어야 하는지, '무엇을' 만들어야 하는지 정의합니다. (고객 인터뷰, 데이터 분석, 경쟁사 분석, 로드맵 수립)</li>
          <li><strong>How (실행):</strong> 디자이너, 개발자와 긴밀하게 협업하며 제품이 '어떻게' 만들어질지 구체화하고 실행을 관리합니다. (요구사항 정의(PRD), 스프린트 계획, 백로그 관리)</li>
          <li><strong>Go-to-Market (출시 및 성장):</strong> 마케팅, 세일즈 팀과 협력하여 제품을 성공적으로 출시하고, 출시 이후 고객 피드백과 데이터 분석을 통해 제품을 개선하고 성장시킵니다. (A/B 테스트, 그로스 해킹)</li>
      </ul>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">PM의 커리어패스 (성장 경로)</h2>
      <p>PM의 커리어는 크게 두 가지 방향으로 나뉩니다. 하나는 사람들을 관리하는 '관리자(People Manager)' 트랙, 다른 하나는 특정 분야의 전문가로 성장하는 '개인 기여자(Individual Contributor, IC)' 트랙입니다.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg">1. 관리자 (People Manager) 트랙</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">팀을 리딩하고, 더 큰 규모의 제품 조직을 책임지는 경로</p>
            <ul className="!my-4 space-y-3 text-sm">
                <li><strong>Associate PM (APM) / Junior PM:</strong> 시니어 PM의 지도 아래 특정 기능이나 작은 범위의 제품을 담당하며 PM의 기본기를 익힙니다.</li>
                <li><strong>Product Manager (PM):</strong> 하나의 제품 또는 핵심 기능을 독립적으로 책임지고 로드맵을 수립하고 실행합니다.</li>
                <li><strong>Senior PM:</strong> 여러 제품을 총괄하거나, 비즈니스 임팩트가 매우 큰 핵심 제품을 담당합니다. 주니어 PM을 멘토링하기도 합니다.</li>
                <li><strong>Director of Product:</strong> 여러 PM 그룹을 리딩하며, 제품 조직의 목표 설정, 채용, 성과 관리 등 조직 전체를 관리합니다.</li>
                <li><strong>VP of Product / CPO (Chief Product Officer):</strong> 전사의 모든 제품을 총괄하며, 비즈니스 전략과 연계된 장기적인 제품 비전과 전략을 수립하는 최고 제품 책임자입니다.</li>
            </ul>
        </div>
        <div className="border p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg">2. 개인 기여자 (Individual Contributor) 트랙</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">관리 역할 없이, 특정 도메인에 대한 깊은 전문성을 바탕으로 가장 어려운 제품 문제를 해결하는 경로</p>
            <ul className="!my-4 space-y-3 text-sm">
                <li><strong>Senior PM:</strong> 특정 도메인(예: AI/ML, Growth, Platform)에서 깊은 전문성을 쌓기 시작합니다.</li>
                <li><strong>Principal PM:</strong> 여러 팀에 걸쳐 있는 복잡하고 기술적인 문제를 해결합니다. 특정 분야에서 회사 내 최고의 전문가로 인정받습니다.</li>
                <li><strong>Distinguished PM / Fellow:</strong> 업계 전체에 영향을 미칠 수 있는 수준의 전문가로, 회사의 장기적인 기술 및 제품 전략에 핵심적인 역할을 합니다.</li>
            </ul>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
      <h2 className="!mt-0 !text-2xl font-bold text-blue-700">성공적인 PM이 되기 위한 핵심 역량 3가지</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
            <p className="font-semibold">1. 고객 중심 사고 (Customer Obsession)</p>
            <p className="!text-sm !my-0">모든 의사결정의 중심에 고객을 두는 능력. 고객의 목소리를 듣고, 데이터를 통해 숨겨진 니즈를 파악하여 제품에 반영해야 합니다.</p>
        </div>
        <div>
            <p className="font-semibold">2. 비즈니스 감각 (Business Acumen)</p>
            <p className="!text-sm !my-0">우리 회사의 비즈니스 모델을 이해하고, 제품의 성공이 어떻게 회사의 성장으로 이어지는지 설명할 수 있어야 합니다. 시장과 경쟁 환경에 대한 이해는 필수입니다.</p>
        </div>
        <div>
            <p className="font-semibold">3. 강력한 실행력과 소통 능력 (Execution & Communication)</p>
            <p className="!text-sm !my-0">아이디어를 현실로 만드는 능력. 개발, 디자인, 마케팅 등 다양한 이해관계자들을 설득하고 협업을 이끌어내기 위한 명확하고 논리적인 커뮤니케이션이 중요합니다.</p>
        </div>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        개발자에서 PM으로, 성공적인 커리어 전환을 꿈꾼다면?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        기술에 대한 깊은 이해는 PM에게 강력한 무기가 될 수 있습니다. 하지만 비즈니스와 고객을 이해하는 능력 없이는 반쪽짜리 PM이 될 뿐입니다. 성공적인 커리어 전환을 위한 구체적인 전략을 확인해보세요.
      </p>
      <a
        href="/guides/developer-to-pm-transition"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        개발자-PM 커리어 전환 가이드
      </a>
    </section>
  ` },
  { slug: "developer-roadmap-2026", title: "2026년 개발자 커리어 로드맵", description: "AI 시대, 살아남는 개발자가 되기 위한 기술 스택과 역량 강화 전략.", category: "커리어", tags: ["개발자", "로드맵", "AI"], level: "고급", publishedDate: "2025-09-29", views: 112345, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      AI가 코드를 짜주는 시대, 개발자는 이제 무엇을 해야 할까요? 많은 개발자들이 자신의 미래에 대해 불안감을 느끼고 있습니다. 하지만 위기는 곧 기회입니다. AI 시대에 살아남는 것을 넘어, 대체 불가능한 개발자로 성장하기 위한 2026년 커리어 로드맵을 제시합니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-purple-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        AI 시대, 개발자의 역할 변화: '코더'에서 '문제 해결사'로
      </h2>
      <p>
        GitHub Copilot, ChatGPT와 같은 AI 코딩 비서의 발전으로, 단순하고 반복적인 코드 작성은 점차 AI의 영역이 될 것입니다. 이제 개발자의 핵심 역량은 '코드를 얼마나 빨리 짜는가'가 아니라, '어떤 비즈니스 문제를 어떻게 기술로 해결할 것인가'를 정의하고 설계하는 능력이 됩니다.
      </p>
      <blockquote className="!border-l-purple-500">
        <p>
          <strong>핵심 변화:</strong> AI를 '나의 일을 뺏는 경쟁자'가 아닌, '나의 생산성을 극대화하는 똑똑한 부사수'로 활용할 수 있는 개발자가 살아남습니다. AI에게 정확하게 질문하고, AI가 생성한 코드를 비판적으로 검토하며, 더 나은 결과물을 만들도록 지시하는 'AI 프롬프트 엔지니어링' 역량이 중요해집니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">2026년, 몸값 높은 개발자의 4가지 핵심 역량</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">1. AI 리터러시 & 활용 능력</h3>
          <p className="!text-sm !my-0">AI 코딩 도구를 능숙하게 사용하여 개발 생산성을 높이는 것은 기본입니다. 나아가, 내가 만드는 서비스에 OpenAI API, LangChain, Vector DB 등을 어떻게 접목할지 고민하고, 간단한 머신러닝 모델이라도 직접 다뤄본 경험이 당신의 가치를 증명할 것입니다.</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">2. 클라우드 네이티브 & DevOps</h3>
          <p className="!text-sm !my-0">이제 모든 서비스는 클라우드 위에서 동작합니다. AWS, GCP, Azure 등 클라우드 환경에 대한 깊은 이해와, Kubernetes, Docker 등 컨테이너 기술을 활용한 CI/CD 파이프라인 구축 및 운영 능력은 필수 역량이 됩니다. 서버리스 아키텍처에 대한 이해는 당신을 더욱 돋보이게 할 것입니다.</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">3. 비즈니스 문제 해결 능력</h3>
          <p className="!text-sm !my-0">주어진 기능 명세서대로 개발만 하는 개발자는 AI로 대체되기 쉽습니다. 우리 회사의 비즈니스 목표가 무엇인지, 고객이 어떤 불편함을 겪고 있는지 먼저 이해하고, 기술을 통해 어떻게 그 문제를 해결할 수 있을지 먼저 제안하는 '문제 해결사'가 되어야 합니다.</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">4. 소프트 스킬 (커뮤니케이션 & 리더십)</h3>
          <p className="!text-sm !my-0">기술이 복잡해지고 협업이 중요해질수록, 동료 개발자, 기획자, 디자이너와 명확하고 효율적으로 소통하는 능력이 당신의 가치를 결정하게 될 것입니다. 코드 리뷰, 기술 토론, 프로젝트 관리 등에서 리더십을 발휘하는 경험은 당신을 시니어 개발자로 이끌 것입니다.</p>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
        <h2 className="!mt-0 !text-2xl font-bold text-blue-700">2026년 주목해야 할 기술 스택</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4">
                <h4 className="font-bold">Frontend</h4>
                <ul className="!text-sm !my-0 list-disc list-inside">
                    <li>TypeScript, Next.js (React)</li>
                    <li>WebAssembly (WASM)</li>
                    <li>GraphQL, Zustand/Recoil</li>
                </ul>
            </div>
            <div className="p-4">
                <h4 className="font-bold">Backend</h4>
                <ul className="!text-sm !my-0 list-disc list-inside">
                    <li>Go, Kotlin, Rust</li>
                    <li>gRPC, Microservices</li>
                    <li>Vector DB, Redis</li>
                </ul>
            </div>
            <div className="p-4">
                <h4 className="font-bold">AI & DevOps</h4>
                <ul className="!text-sm !my-0 list-disc list-inside">
                    <li>Python, LangChain</li>
                    <li>Kubernetes, Docker</li>
                    <li>GitHub Actions, Terraform</li>
                </ul>
            </div>
        </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        미래의 나는 어떤 모습일까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        AI 시대의 변화가 위기가 아닌 기회가 될 수 있습니다. 지금부터 미래 유망 직업들을 살펴보고, 당신의 커리어 방향을 설정해보세요.
      </p>
      <a
        href="/guides/2025-promising-jobs-top-10"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
        2025년 유망 직업 TOP 10 보기
      </a>
    </section>
  ` },
  { slug: "year-end-tax-settlement-deep-dive", title: "연말정산, 놓치기 쉬운 공제 항목 TOP 10", description: "13월의 월급을 두둑하게 만들어 줄 숨겨진 공제 항목들을 찾아드립니다.", category: "세금", tags: ["연말정산", "세금", "절세"], level: "중급", publishedDate: "2025-10-24", views: 134567, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      매년 하는 연말정산이지만, '이것도 공제가 됐어?'하며 놓치는 항목들이 생각보다 많습니다. 남들은 다 챙겨 받는 공제 혜택, 나만 놓치고 있다면 억울하겠죠? 당신의 13월의 월급을 한 푼이라도 더 늘려줄, 놓치기 쉬운 연말정산 공제 항목 TOP 10을 정리했습니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-green-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        연말정산의 기본: 소득공제 vs 세액공제
      </h2>
      <p>
        연말정산의 핵심은 1년 동안 내가 쓴 돈(소비)과 특정 목적의 지출(의료비, 교육비, 기부금 등)을 국세청에 증명하고, 그에 맞는 세금 혜택을 돌려받는 것입니다. 공제 방식은 크게 '소득공제'와 '세액공제' 두 가지로 나뉩니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300">소득공제</h3>
          <p className="!text-sm !my-0">
            세금이 부과되는 대상 소득(과세표준) 자체를 줄여주는 방식입니다. 소득이 높을수록(세율이 높을수록) 절세 효과가 큽니다. (예: 인적공제, 신용카드 공제)
          </p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">세액공제</h3>
          <p className="!text-sm !my-0">
            이미 계산된 세금 자체를 직접 깎아주는 방식입니다. 소득 수준과 관계없이 공제액이 동일하여 저소득자에게 더 유리할 수 있습니다. (예: 월세, 의료비, 교육비 공제)
          </p>
        </div>
      </div>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">놓치기 쉬운 연말정산 공제 항목 TOP 10</h2>
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">1. 월세 세액공제</h3>
          <p className="!text-sm !my-0">집주인 동의 없이도, 계좌이체 내역 등 증빙만 있으면 신청 가능! 총 급여 7천만원 이하 무주택자라면 연 750만원 한도 내에서 월세액의 15~17%를 돌려받는 최고의 공제 항목입니다. <a href="/guides/year-end-tax-monthly-rent" className="text-sm font-bold text-blue-600 hover:underline">→ 자세히 보기</a></p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">2. 안경·콘택트렌즈 구매 비용</h3>
          <p className="!text-sm !my-0">시력 교정용 안경, 콘택트렌즈 구매 비용은 1인당 연 50만원까지 의료비 세액공제 대상입니다. 간소화 서비스에서 조회가 안될 경우, 구매처에서 영수증을 발급받아 직접 등록해야 합니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">3. 취학 전 아동 학원비</h3>
          <p className="!text-sm !my-0">미취학 자녀의 학원비(미술, 음악, 체육 등)는 1인당 연 300만원 한도로 교육비 세액공제를 받을 수 있습니다. (단, 학습지는 제외)</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">4. 교복·체육복 구매 비용</h3>
          <p className="!text-sm !my-0">중·고등학생 자녀의 교복 구매 비용은 1인당 연 50만원까지 교육비 세액공제 대상입니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">5. 기부금 세액공제</h3>
          <p className="!text-sm !my-0">정치자금, 종교단체, 사회복지단체 등에 기부한 금액은 세액공제를 받을 수 있습니다. 연말정산 간소화 서비스에서 조회되지 않는 기부금은 해당 단체에서 '기부금 영수증'을 발급받아야 합니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">6. 따로 사는 부모님 인적공제</h3>
          <p className="!text-sm !my-0">주거 형편상 따로 살고 있지만, 실제로 부양하는 부모님(만 60세 이상, 연 소득 100만원 이하)이 계시다면 기본 인적공제(1인당 150만원)를 받을 수 있습니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">7. 중도 퇴사자 정산</h3>
          <p className="!text-sm !my-0">연중에 퇴사한 경우, 이전 회사에서 기본 공제만 적용된 연말정산을 받게 됩니다. 5월 종합소득세 신고 기간에 개별적으로 연말정산을 다시 진행하면, 놓쳤던 공제 항목을 적용받아 세금을 환급받을 수 있습니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">8. 산후조리원 비용</h3>
          <p className="!text-sm !my-0">총 급여 7천만원 이하 근로자라면, 출산 1회당 200만원 한도로 의료비 세액공제를 받을 수 있습니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">9. 신용카드 vs 체크카드 전략</h3>
          <p className="!text-sm !my-0">총 급여의 25%까지는 혜택이 많은 신용카드를 사용하고, 25%를 초과한 금액부터는 공제율이 2배 높은 체크카드나 현금을 사용하는 것이 유리합니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">10. 고향사랑기부제</h3>
          <p className="!text-sm !my-0">자신의 주소지 외의 지자체에 기부하면 10만원까지 전액 세액공제, 10만원 초과분에 대해서는 16.5% 세액공제를 받을 수 있으며, 30% 상당의 답례품까지 받을 수 있는 새로운 절세 꿀팁입니다.</p>
        </div>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        내 연말정산 환급금, 미리 계산해볼까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        총 급여와 부양가족, 주요 공제 항목만 입력하면, 내가 얼마를 돌려받을 수 있는지 미리 계산해볼 수 있습니다.
      </p>
      <a
        href="/year-end-tax"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        연말정산 계산기 바로가기
      </a>
    </section>
  ` },
  { slug: "bonus-tax-guide", title: "성과급 세금 폭탄, 피하는 법 완벽 가이드", description: "상여금 세금 계산 원리부터 IRP를 활용한 절세 전략까지 총정리.", category: "세금", tags: ["성과급", "세금", "IRP"], level: "고급", publishedDate: "2025-10-14", views: 109876, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      "상여금 1,000만원 받았는데, 세금만 300만원?" 직장인 커뮤니티에 심심치 않게 올라오는 하소연입니다. 성과급은 법적으로 '근로소득'에 포함되기에 세금을 내는 것이 당연하지만, 유독 세금 부담이 크게 느껴지는 이유는 무엇일까요? 그 비밀은 바로 소득세의 '누진세 구조'에 있습니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        왜 성과급은 '세금 폭탄'이 될까?
      </h2>
      <p>
        대한민국의 소득세는 소득이 높을수록 더 높은 세율을 적용하는 <strong>누진세 구조</strong>를 따릅니다. 평소 월급만 받을 때는 15% 세율을 적용받던 사람도, 목돈인 성과급이 더해지는 순간 24%, 35%의 높은 세율 구간으로 진입하게 됩니다. 국세청은 이 높은 세율을 기준으로 세금을 원천징수하기 때문에, 우리가 체감하는 세금 부담이 급격히 커지는 것입니다.
      </p>
      <blockquote className="!border-l-red-500">
        <p>
          <strong>핵심 원리:</strong> 성과급이 지급되는 달, 당신의 '월 소득'이 일시적으로 급증하면서, 그 달에 한해 매우 높은 세율이 적용되는 것입니다. 물론, 이렇게 많이 뗀 세금은 다음 해 <strong>연말정산</strong>을 통해 일부 돌려받게 됩니다. 하지만 당장의 현금 흐름에 부담이 되는 것은 사실입니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-signature-blue"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        내 성과급 세금, 계산 방식 2가지
      </h2>
      <p>
        회사는 보통 두 가지 방식 중 하나로 당신의 성과급 세금을 계산합니다. 어떤 방식을 쓰든 연말정산을 통해 최종 납부세액은 동일해지지만, 당장 내 손에 쥐는 돈이 달라질 수 있습니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">
            A. 원칙적인 방법 (정확하지만 복잡)
          </h3>
          <p className="!text-sm !my-0">
            성과급을 포함한 올해 총급여를 근무 개월 수로 나눠 '월평균 급여'를 다시 계산하고, 그에 맞는 세율을 적용해 세금을 정산하는 방식입니다. 상대적으로 정확하지만 계산이 복잡합니다.
          </p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">
            B. 간편한 방법 (대부분 회사 채택)
          </h3>
          <p className="!text-sm !my-0">
            성과급 지급 직전 달의 월급에 적용된 세율(간이세액표)을 성과급에도 동일하게 적용하여 원천징수합니다. 계산이 간편해 대부분의 회사가 이 방식을 사용하며, 이 경우 세금을 더 많이 떼는 경향이 있습니다.
          </p>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        합법적으로 세금 아끼는 현실적인 전략
      </h2>
      <p className="!my-2 text-base">
        성과급 자체에 대한 세금을 피할 순 없지만, 우리는 연말정산이라는 강력한 무기를 가지고 있습니다. 늘어난 총소득만큼 공제 항목을 철저히 준비하면, 떼였던 세금을 상당 부분 되돌려 받을 수 있습니다.
      </p>
      <div className="mt-6 p-6 border-l-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30">
        <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
          최고의 절세 치트키: IRP & 연금저축
        </h3>
        <p className="!my-2 !text-base">
          성과급을 받았다면 그 해 연말까지 <strong>개인형 퇴직연금(IRP)과 연금저축펀드</strong> 계좌를 최대한 활용하세요. 연간 최대 900만원까지 납입하면, 총급여액에 따라 <strong>최대 148만 5천원</strong>의 세금을 연말정산 시 그대로 돌려받을 수 있습니다. 성과급으로 늘어난 세금 부담을 상쇄할 가장 확실하고 강력한 방법입니다.
        </p>
        <a
          href="/guides/pension-saving-guide"
          className="font-semibold text-yellow-700 dark:text-yellow-300 hover:underline !text-base"
        >
          연금계좌(IRP) 자세히 알아보기 →
        </a>
      </div>
    </section>
    <section className="mt-16 text-center">
      <p className="text-lg font-semibold">
        성과급은 1년 동안의 노고에 대한 보상입니다.
        <br />
        세금 때문에 기쁨을 잃지 마세요.
      </p>
      <a
        href="/year-end-tax"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        내 연말정산 환급금 계산하기
      </a>
    </section>
  ` },
  { slug: "severance-tax-guide", title: "퇴직금 세금, 최소 40% 아끼는 공제의 비밀", description: "복잡한 퇴직소득세 계산법과 세금을 획기적으로 줄여주는 공제의 모든 것을 설명합니다.", category: "세금", tags: ["퇴직금", "퇴직소득세", "절세"], level: "고급", publishedDate: "2025-10-08", views: 156789, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      두둑한 퇴직금, 하지만 세금 명세서를 받아보는 순간 예상보다 큰 공제 금액에 놀라곤 합니다. 퇴직소득세는 근로소득세와는 완전히 다른 방식으로 계산되며, 그 구조를 이해하는 것만으로도 세금을 크게 줄일 수 있습니다. 당신의 소중한 노후 자금을 지키는 퇴직소득세 절세의 모든 것을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        퇴직소득세, 왜 따로 계산할까? (분류과세)
      </h2>
      <p>
        퇴직금은 한 회사에서 오랜 기간 일한 대가로 받는 소득입니다. 만약 이 큰 금액을 일반 월급처럼 합산하여 과세하면, 소득세의 '누진세' 구조 때문에 엄청난 '세금 폭탄'을 맞게 됩니다. 이를 방지하기 위해 국가는 퇴직소득에 대해서만 별도의 낮은 세율과 복잡한 공제 방식을 적용하며, 이를 <strong>'분류과세'</strong>라고 합니다.
      </p>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">복잡한 퇴직소득세, 3단계로 완전 정복</h2>
      <p>퇴직소득세 계산은 아래 3단계로 이루어집니다. 핵심은 '환산급여'라는 가상의 연봉을 만들어 세금을 계산한 뒤, 다시 근속연수로 나누어 최종 세금을 산출하는 것입니다. 이 복잡한 과정 덕분에 실효세율이 크게 낮아집니다.</p>
      <ol className="!my-4 list-decimal list-inside space-y-4 text-base bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
        <li><strong>1단계: 과세표준 계산 (세금 매길 금액 정하기)</strong><br/>
            <ul className="!my-2 !ml-4 text-sm list-disc list-inside">
                <li>총 퇴직금에서 '근속연수공제'를 먼저 빼줍니다. 근속연수가 길수록 공제액이 기하급수적으로 커져 세금이 크게 줄어듭니다.</li>
                <li>여기서 나온 금액을 다시 근속연수로 나눈 후 12를 곱해 가상의 '연봉'인 <strong>환산급여</strong>를 만듭니다.</li>
                <li>이 환산급여에서 '환산급여별 공제'를 한번 더 빼주면 최종 과세표준이 확정됩니다.</li>
            </ul>
        </li>
        <li><strong>2단계: 환산 산출세액 계산</strong><br/><span className="text-sm">1단계에서 구한 과세표준에 일반 근로소득세율(6~45%)을 적용하여 가상의 '연봉 세금'을 계산합니다.</span></li>
        <li><strong>3단계: 최종 퇴직소득세 산출</strong><br/><span className="text-sm">2단계에서 계산된 세금을 다시 12로 나누고, 근속연수를 곱하여 최종적으로 납부할 퇴직소득세를 확정합니다.</span></li>
      </ol>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        퇴직소득세 30% 추가 절감, 최고의 비밀(IRP)
      </h2>
      <p className="!my-2 text-base">
        퇴직금을 일반 계좌가 아닌 <strong>개인형 퇴직연금(IRP) 계좌</strong>로 이전하면, 위에서 계산된 퇴직소득세를 당장 내지 않고 나중에 연금으로 수령할 때까지 미룰 수 있습니다(과세이연).
      </p>
      <p className="!my-2 text-base">
        더 중요한 것은, 연금으로 수령 시 퇴직소득세의 <strong>70%</strong>만 연금소득세(3.3%~5.5%)로 납부하면 된다는 점입니다. 즉, <strong>퇴직소득세를 30%나 영구적으로 감면</strong>받는 효과가 있습니다. 퇴직금은 반드시 IRP 계좌로 받아야 하는 이유입니다.
      </p>
      <a href="/guides/pension-saving-guide" className="text-sm font-bold text-yellow-800 dark:text-yellow-300 hover:underline mt-2 inline-block">→ 연금저축 vs IRP 완벽 비교 가이드</a>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        내 퇴직금, 세금은 얼마일까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        복잡한 퇴직소득세, 직접 계산하기는 어렵습니다. 하지만 내 퇴직금이 얼마인지 알면, 세금의 규모도 대략적으로 예측할 수 있습니다. 먼저 내 퇴직금부터 계산해보세요.
      </p>
      <a
        href="/severance-calculator"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        내 퇴직금 계산기 바로가기
      </a>
    </section>
  ` },
  { slug: "freelancer-tax-guide", title: "프리랜서, 5월 종합소득세 완벽 대비 가이드", description: "3.3% 원천징수부터 경비 처리, 절세 꿀팁까지. 프리랜서를 위한 맞춤형 세금 가이드.", category: "세금", tags: ["프리랜서", "종합소득세", "5월"], level: "중급", publishedDate: "2025-09-25", views: 87654, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      자유롭게 일하는 프리랜서. 하지만 5월이 되면 '세금'이라는 무거운 현실과 마주하게 됩니다. 3.3% 원천징수로 끝나는 줄 알았다면 큰 오산! 프리랜서의 종합소득세 신고는 '경비 처리'에 대한 이해에서부터 시작됩니다. 세금 폭탄을 피하고, 합법적으로 세금을 줄이는 모든 방법을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        3.3% 원천징수, 이걸로 세금 끝 아닌가요?
      </h2>
      <p>
        아닙니다. 클라이언트에게 대금을 받을 때 떼이는 3.3%는, 내가 내야 할 전체 세금 중 일부를 '미리 낸' 것일 뿐입니다. 국세청은 당신의 1년 총수입에 대해 세금을 매기는데, 이때 당신이 일을 하기 위해 쓴 돈, 즉 '필요경비'를 제외하고 순수익에 대해서만 세금을 부과합니다.
      </p>
      <blockquote className="!border-l-blue-500">
        <p>
          <strong>핵심:</strong> 총수입에서 '필요경비'를 얼마나 많이 인정받느냐에 따라 당신이 내야 할 세금이 결정됩니다. 증빙 자료를 꼼꼼히 챙겨 경비를 최대한 인정받는 것이 프리랜서 절세의 전부라 해도 과언이 아닙니다. 미리 낸 3.3% 세금이 최종 세금보다 많다면, 5월 종소세 신고를 통해 '환급'을 받게 됩니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">프리랜서 절세의 핵심, '필요경비' 처리하기</h2>
      <p>프리랜서의 필요경비로 인정받을 수 있는 항목들은 다음과 같습니다. 모든 지출은 세금계산서, 신용카드 내역, 계좌이체 기록 등 명확한 증빙이 있어야 합니다.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">인정받을 수 있는 주요 경비 항목</h3>
          <ul className="!text-sm !my-0 list-disc list-inside space-y-1">
            <li><strong>인건비:</strong> 업무를 위해 직원을 고용했다면 지급한 급여</li>
            <li><strong>임차료:</strong> 별도의 작업실이나 사무실을 임대했다면 월세 및 관리비 (집에서 일한다면 월세의 일부를 경비 처리 가능)</li>
            <li><strong>차량유지비:</strong> 업무용 차량의 유류비, 보험료, 수리비, 톨게이트 비용 등</li>
            <li><strong>접대비/광고선전비:</strong> 클라이언트와의 식사, 명함 제작, 포트폴리오 사이트 운영비, 광고 집행 비용 등</li>
            <li><strong>소모품비:</strong> 업무용 소프트웨어 구독료(어도비, MS오피스 등), 사무용품, 노트북 등 고가 장비 구매 비용</li>
            <li><strong>교육훈련비:</strong> 업무 관련 강의 수강, 도서 구입 비용 등</li>
            <li><strong>통신비:</strong> 업무용으로 사용하는 휴대폰, 인터넷 요금</li>
          </ul>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !mb-2">장부 작성의 중요성 (단순경비율 vs 간편장부/복식부기)</h3>
          <p className="!text-sm !my-0">
            필요경비를 인정받으려면 수입과 지출을 기록한 '장부'를 작성해야 합니다. 전년도 수입 금액에 따라 신고 방식이 달라집니다.
          </p>
          <ul className="!text-sm !my-2 list-disc list-inside space-y-1">
            <li><strong>단순경비율:</strong> 신규 사업자 또는 직전년도 수입이 일정 금액(업종별 상이) 미만인 경우, 실제 경비 증빙 없이 수입의 일정 비율을 경비로 인정해주는 간편한 방식입니다.</li>
            <li><strong>간편/복식부기:</strong> 단순경비율 대상이 아니라면, 장부를 작성하여 실제 사용한 경비를 증명해야 합니다. 복식부기로 작성 시 세액공제 혜택도 있어 절세에 더 유리할 수 있습니다. 수입이 많고 거래가 복잡하다면 세무사의 도움을 받는 것이 좋습니다.</li>
          </ul>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">종합소득세 신고, 5월에 무엇을 해야 할까?</h2>
       <ol className="!my-4 space-y-2 text-base !p-0 !list-none">
        <li className="p-2"><strong>1단계 (1~4월): 증빙 자료 모으기</strong><br/><span className="text-sm">1년 동안의 모든 수입 내역과 경비 지출 증빙(세금계산서, 영수증, 이체내역 등)을 꼼꼼하게 정리하고 분류합니다.</span></li>
        <li className="p-2"><strong>2단계 (5월 초): 홈택스에서 신고 도움 서비스 확인</strong><br/><span className="text-sm">국세청 홈택스에 로그인하여 나의 총수입 금액과 원천징수된 세액, 신고 유형(단순경비율 등)을 확인합니다.</span></li>
        <li className="p-2"><strong>3단계 (5월 중): 장부 작성 및 세액 계산</strong><br/><span className="text-sm">정리한 자료를 바탕으로 장부를 작성하고, 총수입에서 필요경비를 뺀 '사업소득금액'을 확정합니다. 여기에 각종 소득공제(인적공제, 연금보험료공제 등)를 적용하여 최종 납부할 세금을 계산합니다.</span></li>
        <li className="p-2"><strong>4단계 (5/1~5/31): 신고 및 납부</strong><br/><span className="text-sm">홈택스를 통해 종합소득세 신고서를 제출하고, 계산된 세금을 납부합니다. 미리 낸 세금(원천징수)이 더 많다면 환급받게 됩니다.</span></li>
      </ol>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        내 몸값, 시간당 얼마로 책정해야 할까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        프리랜서에게 가장 어려운 일 중 하나는 바로 '가격 책정'입니다. 내 기술과 경력에 맞는 적정 시급과 월급을 '프리랜서 계산기'로 미리 가늠해보세요.
      </p>
      <a
        href="/freelancer-calculator"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        프리랜서 예상 수입 계산하기
      </a>
    </section>
  ` },
  { slug: "gift-tax-guide", title: "증여세, 10분 만에 이해하고 절세하는 법", description: "가족 간의 증여, 세금 폭탄을 피하기 위해 반드시 알아야 할 모든 것.", category: "세금", tags: ["증여세", "절세", "부동산"], level: "고급", publishedDate: "2025-09-18", views: 78901, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      자녀에게 집을 사주거나, 부모님께 용돈을 드릴 때도 세금이 발생할 수 있다는 사실, 알고 계셨나요? 바로 '증여세'입니다. 가족 간의 자산 이전 시, 증여세의 기본 원리만 알아도 수천만원의 세금을 아낄 수 있습니다. 10분 만에 증여세의 모든 것을 이해하고, 현명하게 절세하는 방법을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        증여세, 왜 내야 할까요? (vs 상속세)
      </h2>
      <p>
        증여세는 타인으로부터 재산을 무상으로 이전받을 때, 그 재산을 받은 사람(수증자)이 내는 세금입니다. 만약 증여세가 없다면, 부자들이 세금 없이 자녀에게 모든 재산을 물려주어 부의 대물림이 심화될 수 있겠죠? 이를 방지하기 위해 국가는 증여세를 부과합니다.
      </p>
      <blockquote className="!border-l-blue-500">
        <p>
          <strong>상속세와의 차이:</strong> 상속세는 '사망'으로 인해 재산이 이전될 때 내는 세금인 반면, 증여세는 '살아있을 때' 재산을 물려줄 때 내는 세금입니다. 세율은 동일하지만 공제 한도에서 큰 차이가 있습니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">증여세 절세의 핵심, '증여재산공제'</h2>
      <p className="!my-2 text-base">
        다행히 국가는 일정 금액까지는 증여세를 면제해줍니다. 이를 '증여재산공제'라고 하며, 이 한도를 아는 것이 절세의 첫걸음입니다.
      </p>
      <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr><th className="p-3 font-semibold">증여받는 사람 (수증자)</th><th className="p-3 font-semibold">공제 한도 (10년간 누적)</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">배우자</td><td className="p-3 font-bold text-red-500">6억원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">직계존속 (부모, 조부모)에게 받을 때</td><td className="p-3">5,000만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">직계비속 (자녀, 손자녀)에게 받을 때</td><td className="p-3">5,000만원 (미성년자 2,000만원)</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">기타 친족 (형제, 자매, 며느리, 사위 등)</td><td className="p-3">1,000만원</td></tr>
          </tbody>
        </table>
      </div>
       <p className="!text-sm !font-semibold !mt-4 text-red-600">
        ⚠️ 가장 중요한 규칙: 이 공제 한도는 1번만 적용되는 것이 아니라, <strong>10년 단위로 누적 계산</strong>됩니다. 즉, 2024년에 5,000만원을 증여받았다면, 2034년까지는 더 이상 공제를 받을 수 없습니다. 10년마다 공제 한도가 새로 갱신되는 셈입니다.
      </p>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">절세의 비밀: '10년 주기'를 활용한 사전 증여</h2>
      <p>
        증여세 절세의 가장 확실한 방법은 '10년 주기'를 활용하여 미리미리 증여하는 것입니다. 예를 들어, 자녀가 20살일 때 5,000만원, 30살일 때 5,000만원을 증여하면 총 1억원을 증여세 없이 물려줄 수 있습니다.
      </p>
       <blockquote className="!border-l-green-500">
        <p>
          <strong>사전 증여의 장점:</strong> 미리 증여한 재산(주식, 부동산 등)의 가치가 미래에 크게 상승하더라도, 증여세를 낸 시점의 가치로 인정받기 때문에 미래의 상속세를 크게 줄일 수 있습니다. '시간'에 투자하는 최고의 절세 전략입니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        증여세 vs 상속세, 무엇이 더 유리할까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        사전 증여와 상속, 어떤 것이 더 유리한지는 개인의 자산 규모와 상황에 따라 다릅니다. 두 세금의 차이점을 이해하고 장기적인 관점에서 자산 이전 계획을 세워보세요.
      </p>
      <a
        href="/guides/inheritance-tax-vs-gift-tax-preparing-for-asset-transfer"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        상속세 vs 증여세 비교 가이드 보기
      </a>
    </section>
  ` },
  { slug: "year-end-tax-monthly-rent", title: "연말정산 월세 세액공제, A to Z 완벽정리", description: "1년치 월세를 돌려받는 연말정산 월세 세액공제, 조건부터 신청 방법까지 모두 알려드립니다.", category: "세금", tags: ["연말정산", "월세", "세액공제"], level: "중급", publishedDate: "2025-10-29", views: 110456, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      매달 꼬박꼬박 나가는 월세, 그냥 사라지는 돈이라고 생각하셨나요? 1년치 월세의 최대 17%까지, <strong>세금 자체를 직접 깎아주는</strong> 강력한 '월세 세액공제'를 통해 돌려받을 수 있습니다. 집주인 동의도 필요 없습니다. 13월의 월급을 최대로 불려줄 월세 세액공제의 모든 것을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-green-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        월세 세액공제, 누가 받을 수 있나요? (4가지 조건)
      </h2>
      <p>
        아래 4가지 조건을 <strong>모두</strong> 충족해야 합니다.
      </p>
      <ol className="!my-4 list-decimal list-inside space-y-4 text-base bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
        <li><strong>소득 조건:</strong> 해당 연도 총 급여액이 <strong>7,000만원 이하</strong>인 근로자 (종합소득금액 6,000만원 이하)</li>
        <li><strong>무주택 조건:</strong> 과세기간 종료일(12월 31일) 기준, 세대주 또는 세대원 모두가 주택을 소유하지 않아야 합니다.</li>
        <li><strong>주소지 일치:</strong> 임대차 계약서의 주소지와 주민등록등본의 주소지가 동일해야 합니다. (전입신고 필수!)</li>
        <li><strong>주택 규모:</strong> 국민주택규모(전용면적 85㎡) 이하 또는 기준시가 4억원 이하의 주택(오피스텔, 고시원 포함)</li>
      </ol>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">얼마나 돌려받을 수 있나요?</h2>
      <p>
        연간 월세 지급액(최대 750만원 한도)에 소득에 따른 공제율을 곱한 금액만큼 세금을 직접 돌려받습니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300">총 급여 5,500만원 이하</h3>
          <p className="!text-sm !my-0">
            월세액의 <strong>17%</strong> 세액공제<br/>(최대 <strong>127.5만원</strong> 환급)
          </p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">총 급여 5,500만원 초과 ~ 7,000만원 이하</h3>
          <p className="!text-sm !my-0">
            월세액의 <strong>15%</strong> 세액공제<br/>(최대 <strong>112.5만원</strong> 환급)
          </p>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">월세 세액공제 Q&A: 핵심 꿀팁</h2>
      <ul className="!my-4 space-y-3 text-base">
        <li>
          <strong>Q: 집주인 동의나 확정일자가 꼭 필요한가요?</strong><br/>
          <strong>A:</strong> 아니요. 집주인 동의는 전혀 필요 없습니다. 확정일자도 필수 조건이 아닙니다. 임대차계약서 사본과 월세 이체 증빙(계좌이체 내역 등)만 있으면 신청 가능합니다.
        </li>
        <li>
          <strong>Q: 작년에 신청 못했는데, 지금이라도 받을 수 있나요?</strong><br/>
          <strong>A:</strong> 네, 가능합니다. 연말정산 기간을 놓쳤더라도, 5년 내에 '경정청구'를 통해 지난 월세액에 대한 세금을 돌려받을 수 있습니다.
        </li>
        <li>
          <strong>Q: 부모님 명의로 계약했는데, 제가 공제받을 수 있나요?</strong><br/>
          <strong>A:</strong> 아니요. 월세 세액공제는 반드시 근로자 본인 명의로 계약하고, 본인이 월세를 이체해야 합니다.
        </li>
      </ul>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        놓친 공제 항목이 더 없는지 확인해보세요
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        월세 세액공제 외에도 우리가 놓치기 쉬운 공제 항목들이 많습니다. 연말정산의 모든 것을 알아보고, 13월의 월급을 최대로 만드세요.
      </p>
      <a
        href="/guides/year-end-tax-settlement-deep-dive"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        연말정산 놓치기 쉬운 공제 항목 가이드
      </a>
    </section>
  ` },
  { slug: "first-investment-guide", title: "첫 월급 100만원 재테크: 부자되는 첫걸음", description: "사회초년생 필독! 당신의 미래를 바꿀 첫 월급 재테크 로드맵을 공개합니다.", category: "투자", tags: ["초년생", "재테크", "ETF"], level: "초급", publishedDate: "2025-10-22", views: 145678, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      인생의 첫 월급, 그 설렘도 잠시. 학자금 대출, 월세, 통신비 등 통장을 스쳐 지나가는 돈들을 보며 한숨 쉬고 있나요? 괜찮습니다. 중요한 것은 지금부터 어떻게 돈을 관리하고 불려나갈지 '시스템'을 만드는 것입니다. 이 글만 따라오면 당신도 똑똑한 재테크의 길을 걸을 수 있습니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-purple-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        사회초년생 돈 관리 시스템 5단계
      </h2>
      <p>
        복잡한 금융 상품 공부보다, 아래 5가지 단계를 순서대로 실천하는 것이 훨씬 중요합니다.
      </p>
      <div className="mt-6 space-y-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">급여명세서 확인 & 통장 쪼개기</h3>
            <p className="!text-sm !my-0">
              내 월급에서 세금과 <a href="/guides/4-major-insurances" className="text-purple-600 hover:underline">4대보험</a>이 왜, 얼마나 빠져나가는지 이해하는 것부터 시작입니다. 그 후, 월급 통장, 소비 통장, 그리고 비상금을 보관할 <a href="/guides/parking-account-comparison" className="text-purple-600 hover:underline">파킹통장</a>으로 돈의 흐름을 통제하세요.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">주택청약종합저축 가입하기</h3>
            <p className="!text-sm !my-0">
              내 집 마련의 첫걸음이자 필수 준비물입니다. 고민하지 말고 월 10만원씩 자동이체를 설정하세요. 연말정산 소득공제 혜택도 있습니다.
              <a href="/guides/housing-subscription-savings-priority" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 주택청약 1순위 만들기 가이드 보기</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">3</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">연금계좌(IRP/연금저축) 개설하기</h3>
            <p className="!text-sm !my-0">
              '13월의 월급'을 만드는 최고의 절세 상품. 먼 미래의 노후 대비는 물론, 당장의 세금을 아끼는 가장 확실한 방법입니다.
              <a href="/guides/pension-saving-guide" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 연금계좌 완벽 비교 가이드 보기</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">4</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">ISA 계좌 만들기</h3>
            <p className="!text-sm !my-0">
              투자로 얻은 수익에 대한 세금을 아껴주는 '만능 계좌'. 투자를 시작하기 전 반드시 함께 만들어야 할 필수품입니다.
              <a href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ ISA 계좌 200% 활용법 보기</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">5</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">소액으로 ETF 적립식 투자 시작하기</h3>
            <p className="!text-sm !my-0">
              모든 준비가 끝났다면, 이제 '복리의 마법'을 경험할 차례입니다. S&P 500, 나스닥 100 등 시장 지수 ETF를 매월 꾸준히 사모으는 것부터 시작해보세요.
              <a href="/guides/etf-investment-from-stock-selection-to-trading-strategy" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ ETF 투자 실전 가이드 보기</a>
            </p>
          </div>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
      <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        사회초년생이 피해야 할 재테크 실수 3가지
      </h2>
      <ul className="!my-4 space-y-2 text-base">
        <li><strong>1. 신용카드의 유혹:</strong> 할부의 편리함에 빠져 미래의 소득을 당겨쓰기 시작하면, 돈을 모으기 어렵습니다. 당신의 <a href="/guides/credit-score-101" className="text-red-600 hover:underline">신용점수</a> 관리에도 좋지 않습니다.</li>
        <li><strong>2. 묻지마 투자:</strong> 친구 따라, 유튜버 따라 잘 알지도 못하는 주식이나 코인에 투자하는 것은 도박과 같습니다. <a href="/guides/compound-interest-magic" className="text-red-600 hover:underline">복리의 마법</a>은 내가 이해하는 상품에 장기 투자할 때 일어납니다.</li>
        <li><strong>3. 불필요한 보험 가입:</strong> 보험은 필수지만, 사회초년생에게 월 20~30만원짜리 종신보험은 과합니다. 실손보험과 같은 보장성 보험부터 우선적으로 알아보세요.</li>
      </ul>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        내 첫 월급, 실수령액은 얼마일까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        세금과 4대보험을 떼고 내 통장에 실제로 찍히는 금액이 궁금하다면? '연봉 계산기'로 지금 바로 확인해보세요.
      </p>
      <a
        href="/salary"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        내 월급 실수령액 계산하기
      </a>
    </section>
  ` },
  { slug: "sp500-vs-nasdaq", title: "S&P 500 vs 나스닥 100, 당신의 선택은?", description: "미국 대표 지수 ETF, 두 상품의 특징과 장단점을 완벽 비교 분석해 드립니다.", category: "투자", tags: ["ETF", "미국주식", "S&P500"], level: "초급", publishedDate: "2025-10-16", views: 165432, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      미국 주식 투자를 시작하려는 사람들이 가장 먼저 마주하는 갈림길, 바로 'S&P 500'과 '나스닥 100'입니다. 둘 다 미국을 대표하는 지수지만, 그 성격은 매우 다릅니다. '안정적인 시장 전체'에 투자할 것인가, '혁신적인 기술주'에 집중 투자할 것인가? 당신의 투자 성향에 맞는 선택을 할 수 있도록 두 지수를 완벽하게 비교 분석해 드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        두 지수는 무엇이 다른가요?
      </h2>
      <p>
        두 지수의 가장 큰 차이점은 '구성 종목'에 있습니다. 이 차이가 안정성과 성장성의 차이를 만들어냅니다.
      </p>
      <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 font-semibold">구분</th>
              <th className="p-3 font-semibold">S&P 500</th>
              <th className="p-3 font-semibold">나스닥 100</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">구성 종목</td>
              <td className="p-3">미국 대표 우량주 500개 (전 산업 분산)</td>
              <td className="p-3">나스닥 상장 기업 중 비금융 상위 100개 (기술주 중심)</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">별명</td>
              <td className="p-3">'미국 시장 그 자체'</td>
              <td className="p-3">'미국의 기술 성장주'</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">안정성</td>
              <td className="p-3">높음 (금융, 헬스케어 등 경기방어주 포함)</td>
              <td className="p-3">상대적으로 낮음 (기술주 경기에 민감)</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">성장성</td>
              <td className="p-3">안정적, 시장 평균 성장률 기대</td>
              <td className="p-3">높음 (혁신 기술 기업에 집중 투자)</td>
            </tr>
             <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-bold">대표 ETF</td>
              <td className="p-3">VOO, IVV, SPY</td>
              <td className="p-3">QQQ, QQQM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">당신의 투자 성향에 맞는 선택은?</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <p className="font-semibold">👍 S&P 500을 추천하는 경우</p>
            <ul className="!text-sm !my-0 list-disc list-inside"><li>투자를 처음 시작하는 '왕초보' 투자자</li><li>변동성을 싫어하고, 안정적인 장기 투자를 선호하는 투자자</li><li>'미국 경제 전체'의 성장에 투자하고 싶은 사람</li></ul>
        </div>
        <div>
            <p className="font-semibold">👍 나스닥 100을 추천하는 경우</p>
            <ul className="!text-sm !my-0 list-disc list-inside"><li>더 높은 변동성을 감수하고 높은 수익률을 추구하는 '공격적인' 투자자</li><li>미래 기술의 성장을 확신하는 투자자</li><li>S&P 500과 함께 보유하여 성장성을 더하고 싶은 투자자</li></ul>
        </div>
      </div>
       <blockquote className="!border-l-yellow-500 !mt-6 !text-base">
        <p>
          <strong>결론:</strong> 정답은 없습니다. 'S&P 500으로 시작해서, 나스닥 100을 추가'하거나, '두 지수를 7:3 또는 5:5로 섞는' 등 자신만의 포트폴리오를 구성하는 것이 가장 좋습니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        그래서, 어떤 ETF를 사야 할까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        S&P 500을 추종하는 ETF에도 VOO, IVV, SPY 등 여러 종류가 있습니다. 각 ETF의 미세한 차이점(운용보수 등)을 비교하고, 나에게 맞는 최적의 종목을 선택하는 방법을 알아보세요.
      </p>
      <a
        href="/guides/etf-investment-from-stock-selection-to-trading-strategy"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
        대표 ETF 비교 및 선택 가이드 보기
      </a>
    </section>
  ` },
  { slug: "dollar-investment-guide", title: "지금 당장 달러 투자를 시작해야 하는 이유", description: "가장 안전한 자산, 달러에 투자하는 3가지 방법과 장기적인 관점의 투자 전략.", category: "투자", tags: ["달러", "환테크", "안전자산"], level: "중급", publishedDate: "2025-10-09", views: 99876, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      미국 주식, 금과 함께 '3대 안전자산'으로 꼽히는 달러. 세계 경제가 흔들릴 때마다 그 가치가 오르는 달러는, 단순히 해외여행을 위한 외화가 아니라 당신의 자산을 지키는 가장 강력한 '보험'이 될 수 있습니다. 왜 지금 달러 투자를 시작해야 하는지, 그리고 가장 쉽게 달러에 투자하는 3가지 방법을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-green-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        왜 달러에 투자해야 할까? (3가지 이유)
      </h2>
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !text-lg">1. 가장 강력한 안전자산</h3>
          <p className="!text-sm !my-0">전쟁, 금융위기 등 세계 경제에 위기가 닥치면 투자자들은 가장 안전한 곳으로 돈을 옮깁니다. 그 종착지가 바로 '달러'입니다. 주식 시장이 폭락할 때 달러 가치는 오르는 경향이 있어, 내 자산의 손실을 방어하는 '보험' 역할을 합니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !text-lg">2. 세계의 기축통화</h3>
          <p className="!text-sm !my-0">전 세계 모든 국가는 비상금을 달러로 보유하고, 석유를 비롯한 대부분의 국제 거래는 달러로 이루어집니다. 달러의 지위가 흔들리지 않는 한, 그 가치는 장기적으로 안정적일 수밖에 없습니다.</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="font-bold !mt-0 !text-lg">3. 미국 자산 투자의 기본</h3>
          <p className="!text-sm !my-0">S&P 500 ETF, 애플, 테슬라 등 미국 자산에 투자하기 위해서는 결국 달러가 필요합니다. 환율이 낮을 때 미리 달러를 확보해두면, 더 저렴한 가격에 미국 주식을 사는 효과를 누릴 수 있습니다.</p>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
      <h2 className="!mt-0 !text-2xl font-bold text-signature-blue">가장 쉽게 달러에 투자하는 3가지 방법</h2>
      <ol className="!my-4 space-y-3 text-base !p-0 !list-none">
        <li className="p-3"><strong>1. 외화예금 (가장 쉬운 방법):</strong> 주거래 은행 앱에서 비대면으로 쉽게 만들 수 있는 '달러 통장'입니다. 예금자보호법에 따라 5,000만원까지 보호되며, 환차익에 대해서는 세금이 없습니다.</li>
        <li className="p-3"><strong>2. 달러 RP (조금 더 높은 금리):</strong> 증권사에서 판매하는 단기 채권 상품입니다. 외화예금보다 금리가 조금 더 높고, 수시 입출금이 가능한 상품도 있어 파킹통장처럼 활용할 수 있습니다.</li>
        <li className="p-3"><strong>3. 달러 ETF (주식처럼 투자):</strong> 증권사에서 'KOSEF 미국달러선물'과 같은 ETF를 주식처럼 사고팔 수 있습니다. 환율의 움직임에 직접 투자하는 방식으로, 매매가 간편하지만 매매차익에 대해 배당소득세(15.4%)가 부과됩니다.</li>
      </ol>
    </section>
    <section className="mt-12">
        <h2 className="!text-2xl font-bold">현명한 달러 투자 전략</h2>
        <p>환율은 예측의 영역이 아닌, 대응의 영역입니다. 환율이 낮아 보일 때마다 '적립식'으로 꾸준히 달러를 사 모으는 것이 가장 현명한 전략입니다. 전체 자산의 5~10%를 달러로 보유하여, 어떤 경제 위기에도 흔들리지 않는 튼튼한 포트폴리오를 만들어보세요.</p>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        달러로 무엇을 살 수 있을까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        달러를 확보했다면, 이제 달러로 투자할 수 있는 최고의 자산인 '미국 주식 시장'에 대해 알아볼 차례입니다. S&P 500과 나스닥 100의 차이점을 이해하고 투자를 시작해보세요.
      </p>
      <a
        href="/guides/sp500-vs-nasdaq"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
        S&P 500 vs 나스닥 100 비교 가이드
      </a>
    </section>
  ` },
  { slug: "pension-saving-guide", title: "연금저축 vs IRP, 당신에게 맞는 연금 계좌는?", description: "세액공제 혜택부터 중도 인출 조건까지, 두 연금 계좌의 모든 것을 비교 분석합니다.", category: "투자", tags: ["연금", "IRP", "연말정산"], level: "중급", publishedDate: "2025-10-01", views: 132456, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '13월의 월급'을 만드는 가장 확실한 방법, 바로 연금계좌를 활용한 세액공제입니다. 하지만 '연금저축'과 'IRP'라는 두 가지 상품 앞에서 무엇을 먼저, 얼마나 가입해야 할지 막막하셨나요? 두 계좌의 결정적인 차이점과, 900만원 세액공제 한도를 최대로 활용하는 필승 전략을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        연금계좌, 왜 필수일까?
      </h2>
      <p>
        연금계좌(연금저축, IRP)는 단순히 노후를 대비하는 상품이 아닙니다. 국가가 세금을 깎아주면서까지 가입을 장려하는, 현존하는 가장 강력한 '절세 상품'입니다.
      </p>
      <blockquote className="!border-l-blue-500">
        <p>
          <strong>핵심 혜택:</strong> 연간 납입액의 13.2% 또는 16.5%를 연말정산 시 '세금 자체'에서 직접 돌려받습니다. 900만원을 납입하면 최대 148.5만원이 내 통장에 다시 들어오는, 손실 위험이 없는 '16.5%짜리 예금'과 같습니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">연금저축 vs IRP, 한눈에 비교하기</h2>
      <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 font-semibold">구분</th>
              <th className="p-3 font-semibold">연금저축펀드</th>
              <th className="p-3 font-semibold">IRP (개인형 퇴직연금)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">가입 자격</td><td className="p-3">전 국민 누구나</td><td className="p-3">소득이 있는 취업자, 자영업자</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">세액공제 한도</td><td className="p-3">연 600만원</td><td className="p-3">연 900만원 (연금저축 포함)</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">투자 자산</td><td className="p-3">주식, 펀드 등 위험자산 100% 투자 가능</td><td className="p-3">안전자산(예금 등) 30% 의무 포함</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">중도 인출</td><td className="p-3">비교적 자유로우나, 기타소득세(16.5%) 부과</td><td className="p-3">법에서 정한 사유 외에는 거의 불가능</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">그래서, 최고의 조합은? (필승 전략)</h2>
      <p className="!my-2 text-base">
        두 계좌의 장점만 쏙쏙 빼먹는 최적의 납입 전략은 정해져 있습니다.
      </p>
       <ol className="!my-4 space-y-3 text-base !p-0 !list-none">
        <li className="p-3"><strong>1단계: 연금저축펀드에 연 600만원 먼저 채우기</strong><br/><span className="text-sm">투자 자산에 100% 투자가 가능하여 공격적인 운용이 가능한 연금저축펀드의 한도를 먼저 채웁니다.</span></li>
        <li className="p-3"><strong>2단계: IRP에 연 300만원 추가 납입하기</strong><br/><span className="text-sm">연금저축에서 채운 600만원을 포함하여, IRP에 300만원을 추가로 넣어 총 900만원의 세액공제 한도를 모두 채웁니다.</span></li>
        <li className="p-3"><strong>3단계: 퇴직금은 무조건 IRP 계좌로 받기</strong><br/><span className="text-sm">퇴직 시 발생하는 퇴직금을 IRP 계좌로 받으면, 퇴직소득세를 30% 이상 절감할 수 있습니다.</span></li>
      </ol>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        13월의 월급, 얼마나 늘어날까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        연금계좌 세액공제는 연말정산에서 가장 큰 비중을 차지하는 항목 중 하나입니다. 다른 공제 항목들과 함께, 내가 얼마나 돌려받을 수 있는지 미리 계산해보세요.
      </p>
      <a
        href="/guides/year-end-tax-settlement-deep-dive"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        연말정산 놓치기 쉬운 공제 항목 가이드
      </a>
    </section>
  ` },
  { slug: "dividend-stock-guide", title: "파이어족을 위한 월배당 포트폴리오 짜는 법", description: "매달 현금 흐름을 만드는 배당주 투자의 모든 것. 종목 선정부터 포트폴리오 구성까지.", category: "투자", tags: ["배당주", "파이어족", "포트폴리오"], level: "고급", publishedDate: "2025-09-20", views: 110293, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      배당주 투자는 기업 이익의 일부를 현금으로 돌려주는 '배당금'을 목적으로 하는 투자 방식입니다. 주가 상승을 통한 시세 차익과 더불어, 꾸준한 배당금으로 안정적인 현금 흐름(패시브 인컴)을 만들 수 있어 경제적 자유를 꿈꾸는 '파이어족'에게 특히 매력적입니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">배당주 투자의 두 갈래 길</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300">1. 배당성장주</h3>
          <p className="!text-sm !my-0">
            현재 배당률은 다소 낮더라도, 매년 꾸준히 배당금을 늘려가는 기업에 투자합니다. <strong>젊고 투자 기간이 긴 투자자</strong>에게 적합하며, 장기적으로 시세 차익과 배당금 증가를 모두 노릴 수 있습니다.
          </p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">2. 고배당주</h3>
          <p className="!text-sm !my-0">
            기업의 성장성보다는 현재의 높은 배당률에 집중하여 투자합니다. <strong>은퇴 후 생활비 등 당장의 현금 흐름이 중요한 투자자</strong>에게 적합합니다.
          </p>
        </div>
      </div>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-purple-500"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
        이것만은 알고 가자! 대표 배당 ETF
      </h2>
      <p>개별 주식을 고르기 어렵다면, 여러 배당주를 모아놓은 ETF가 훌륭한 대안입니다.</p>
       <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr><th className="p-2 font-semibold">구분</th><th className="p-2 font-semibold">SCHD (배당성장)</th><th className="p-2 font-semibold">JEPI (고배당)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">정식 명칭</td><td className="p-2">Schwab US Dividend Equity ETF</td><td className="p-2">JPMorgan Equity Premium Income ETF</td></tr>
            <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">특징</td><td className="p-2">재무가 탄탄하고, 10년 이상 꾸준히 배당을 지급한 기업 100개에 투자</td><td className="p-2">S&P 500 주식과 옵션(ELN)을 활용해 매월 높은 배당금 지급</td></tr>
            <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">배당 방식</td><td className="p-2">분기 배당 (3,6,9,12월)</td><td className="p-2">월배당</td></tr>
            <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">배당률</td><td className="p-2">연 3%대 중반</td><td className="p-2">연 7~9%대</td></tr>
            <tr className="border-b dark:border-gray-600"><td className="p-2 font-bold">추천 대상</td><td className="p-2">안정적인 장기 우상향과 배당금 성장을 원하는 투자자</td><td className="p-2">높은 월 현금 흐름을 즉시 원하는 은퇴 준비자</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        나만의 '월배당' 포트폴리오 만드는 법
      </h2>
      <p className="!my-2 text-base">
        대부분의 미국 기업은 분기 배당을 실시합니다. 배당 지급 월이 다른 세 종류의 주식/ETF를 조합하면, 매달 월급처럼 배당금을 받을 수 있습니다.
      </p>
      <blockquote className="!border-l-yellow-500 !mt-4 !text-base bg-white dark:bg-gray-800 p-4 rounded">
        <p className="font-bold !mt-0">예시: '1-2-3 월배당 포트폴리오'</p>
        <ul className="!my-2 list-disc list-inside text-sm">
            <li><strong>1, 4, 7, 10월 배당 그룹:</strong> 리얼티인컴 (O), 펩시코 (PEP) 등</li>
            <li><strong>2, 5, 8, 11월 배당 그룹:</strong> 애플 (AAPL), 스타벅스 (SBUX) 등</li>
            <li><strong>3, 6, 9, 12월 배당 그룹:</strong> SCHD, 마이크로소프트 (MSFT) 등</li>
        </ul>
      </blockquote>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        배당소득세 15.4%, 절약하고 싶다면?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        배당금의 15.4%는 세금으로 나갑니다. 하지만 ISA 계좌를 활용하면 연간 발생한 금융소득 500만원(서민형)까지 비과세 혜택을 누릴 수 있습니다. 배당주 투자의 필수 파트너, ISA에 대해 알아보세요.
      </p>
      <a
        href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        ISA 계좌 200% 활용법 보기
      </a>
    </section>
  ` },
  { slug: "first-home-guide", title: "생애최초 주택 구매, A to Z 가이드", description: "디딤돌, 보금자리론부터 청약 전략까지. 내 집 마련의 꿈을 이루기 위한 모든 정보.", category: "부동산", tags: ["내집마련", "디딤돌", "청약"], level: "중급", publishedDate: "2025-10-23", views: 98712, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '내 집 마련'이라는 꿈, 어디서부터 어떻게 시작해야 할지 막막하신가요? 생애최초 주택 구매자를 위해 자금 계획부터 청약, 대출, 그리고 세금까지, 내 집 마련의 전 과정을 5단계 로드맵으로 정리했습니다. 이 가이드만 따라오면 당신도 현명하게 내 집 마련의 꿈을 이룰 수 있습니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-purple-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        내 집 마련 5단계 로드맵
      </h2>
      <div className="mt-6 space-y-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">자금 계획 세우기 (LTV/DTI)</h3>
            <p className="!text-sm !my-0">
              가장 먼저 '내가 얼마짜리 집을 살 수 있는지' 파악해야 합니다. 주택담보대출의 핵심 기준인 LTV(주택담보대출비율)와 DTI(총부채상환비율)의 개념을 이해하고, 나의 가용 자본과 대출 가능 금액을 계산하여 예산을 세워야 합니다.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">주택청약통장 점검하기</h3>
            <p className="!text-sm !my-0">
              아파트 신규 분양을 노린다면 주택청약통장은 필수입니다. 나의 청약통장이 1순위 조건을 만족하는지, 청약 가점은 몇 점인지 미리 확인하고 전략을 세워야 합니다.
              <a href="/guides/housing-subscription-savings-priority" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 주택청약 1순위 조건 및 가점 관리법</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">3</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">정부 지원 대출 알아보기</h3>
            <p className="!text-sm !my-0">
              생애최초 주택 구매자를 위해 정부는 낮은 금리의 다양한 정책 대출 상품을 지원합니다. 대표적인 '디딤돌 대출'과 '보금자리론'의 자격 조건을 확인하고, 나에게 가장 유리한 상품을 찾아야 합니다.
              <a href="/guides/didimdol-vs-bogeumjari" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 디딤돌 vs 보금자리론 완벽 비교</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">4</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">부동산 종류 선택하기</h3>
            <p className="!text-sm !my-0">
              아파트, 빌라, 오피스텔 등 어떤 종류의 주택을 구매할지 결정해야 합니다. 각 부동산의 장단점과 환금성, 미래 가치를 꼼꼼히 따져봐야 합니다.
              <a href="/guides/real-estate-investment-apartment-vs-officetel-vs-commercial" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 아파트 vs 오피스텔 vs 상가 투자 비교</a>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">5</div>
          <div>
            <h3 className="font-bold !mt-0 !mb-1">취득세 및 보유세 확인하기</h3>
            <p className="!text-sm !my-0">
              주택 구매 시에는 '취득세'를, 보유하는 동안에는 '재산세'와 '종합부동산세'를 내야 합니다. 자금 계획 시 이러한 세금까지 모두 고려해야 합니다.
              <a href="/guides/property-tax-relationship-between-public-housing-price-and-tax" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 재산세와 공시지가 완벽 가이드</a>
            </p>
          </div>
        </div>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        나의 월 상환액은 얼마일까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        내 집 마련의 꿈, 구체적인 상환 계획부터 시작됩니다. 원하는 대출 금액과 기간을 입력하여 매달 얼마를 갚아야 할지 미리 계산해보세요.
      </p>
      <a
        href="/home-loan"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        주택담보대출 계산기 바로가기
      </a>
    </section>
  ` },
  { slug: "jeonse-vs-monthly", title: "전세 vs 월세, 당신의 현금흐름에 맞는 선택은?", description: "각각의 장단점과 유불리를 현재 나의 재정 상황에 맞춰 분석해 드립니다.", category: "부동산", tags: ["전세", "월세", "주거"], level: "초급", publishedDate: "2025-10-11", views: 76543, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      목돈을 묶어두고 월 지출을 없애는 '전세', 적은 보증금으로 시작하는 대신 매달 고정비를 내는 '월세'. 대한민국에만 있는 독특한 주거 형태인 전세와 월세 사이에서, 당신의 현재 재정 상황과 라이프스타일에 더 적합한 선택은 무엇일까요? 두 선택지의 장단점을 명확히 비교 분석해 드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        전세 vs 월세, 핵심 차이점
      </h2>
      <p>
        두 제도의 핵심 차이는 '목돈'과 '월 고정비'의 유무입니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300">전세 (Jeonse)</h3>
          <p className="!text-sm !my-0">
            <strong>장점:</strong> 매달 나가는 월세가 없어 고정비 지출을 줄일 수 있습니다. 전세대출 이자가 월세보다 저렴한 경우가 많습니다.<br/>
            <strong>단점:</strong> 수억 원에 달하는 큰 목돈이 필요하며, '깡통전세' 등 보증금을 돌려받지 못할 위험이 존재합니다.
          </p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">월세 (Monthly Rent)</h3>
          <p className="!text-sm !my-0">
            <strong>장점:</strong> 상대적으로 적은 보증금으로 거주를 시작할 수 있어 초기 부담이 적습니다. 보증금 미반환 위험이 전세보다 낮습니다.<br/>
            <strong>단점:</strong> 매달 고정적인 월세 지출이 발생하며, 장기적으로는 전세보다 총 주거 비용이 높아질 수 있습니다.
          </p>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">당신에게 맞는 선택은?</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <p className="font-semibold">👍 전세를 추천하는 경우</p>
            <ul className="!text-sm !my-0 list-disc list-inside"><li>전세대출을 포함하여 목돈 마련이 가능한 사람</li><li>매달 고정 지출을 최소화하고 싶은 사람</li><li>2년 이상 안정적으로 거주할 계획이 있는 사람</li></ul>
        </div>
        <div>
            <p className="font-semibold">👍 월세를 추천하는 경우</p>
            <ul className="!text-sm !my-0 list-disc list-inside"><li>목돈 마련이 어려운 사회초년생</li><li>단기 거주를 계획하고 있는 사람</li><li>전세 사기에 대한 불안감이 큰 사람</li></ul>
        </div>
      </div>
    </section>
    <section className="mt-12">
        <h2 className="!text-2xl font-bold">전세 계약의 필수 안전장치</h2>
        <p>
            전세 계약 시 가장 큰 위험은 '보증금 미반환'입니다. 이를 막기 위한 최소한의 안전장치가 바로 <strong>전세보증금 반환보증보험</strong>입니다. 집주인이 보증금을 돌려주지 않을 경우, 주택도시보증공사(HUG) 등 보증기관이 대신 보증금을 돌려주는 제도입니다.
        </p>
        <blockquote className="!border-l-red-500">
            <p>
                <strong>핵심:</strong> 전세 계약을 한다면, 비용이 들더라도 전세보증금 반환보증보험은 선택이 아닌 필수입니다. 당신의 수억 원을 지키는 가장 확실한 방법입니다.
            </p>
            <a href="/guides/jeonse-deposit-return-guarantee-should-i-join" className="text-sm font-bold text-red-600 hover:underline block mt-2">→ 전세보증보험, 꼭 가입해야 할까?</a>
        </blockquote>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        전세대출 이자 vs 월세, 무엇이 더 저렴할까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        나의 조건으로 전세대출을 받았을 때 내야 하는 월 이자와, 동일한 조건의 집을 월세로 살 때의 비용을 비교해보세요. '주택담보대출 계산기'를 활용하여 대출 이자를 미리 계산해볼 수 있습니다.
      </p>
      <a
        href="/home-loan"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        대출 이자 계산해보기
      </a>
    </section>
  ` },
  { slug: "real-estate-investment-basics", title: "부동산 소액 투자, 1000만원으로 시작하는 법", description: "리츠(REITs)를 활용하여 누구나 쉽게 부동산에 간접 투자하는 방법을 알려드립니다.", category: "재테크/투자", tags: ["리츠", "소액투자", "재테크"], level: "초급", publishedDate: "2025-10-03", views: 87654, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '부동산 투자'라고 하면 수억 원의 목돈이 있어야만 가능하다고 생각하시나요? 단돈 1만원으로도 강남의 대형 빌딩 주인이 되어 월세처럼 따박따박 배당금을 받을 수 있는 방법이 있습니다. 바로 '리츠(REITs)'를 통해서입니다. 부동산 투자의 패러다임을 바꾼 리츠의 모든 것을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        리츠(REITs), 대체 뭔가요?
      </h2>
      <p>
        리츠(REITs, Real Estate Investment Trusts)는 '부동산 투자 신탁'이라는 뜻으로, 쉽게 말해 <strong>'주식처럼 사고파는 부동산 펀드'</strong>입니다.
      </p>
      <p>
        부동산 투자 전문 회사가 다수의 투자자로부터 자금을 모아 대형 오피스 빌딩, 쇼핑몰, 물류센터 등에 투자하고, 여기서 발생하는 임대수익과 시세차익을 투자자들에게 '배당'의 형태로 돌려주는 주식회사입니다.
      </p>
      <blockquote className="!border-l-blue-500">
        <p>
          <strong>핵심:</strong> 내가 직접 건물을 사는 것이 아니라, 건물을 소유하고 관리하는 '회사의 주식'을 사는 것입니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
      <h2 className="!mt-0 !text-2xl font-bold text-green-700">리츠(REITs) 투자의 4가지 장점</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">1. 소액 투자 가능</h3>
          <p className="!text-sm !my-0">수억, 수십억짜리 건물에 단돈 몇천원, 몇만원으로도 투자가 가능합니다.</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">2. 안정적인 배당 수익</h3>
          <p className="!text-sm !my-0">법적으로 배당가능이익의 90% 이상을 의무적으로 주주에게 배당해야 하므로, 은행 예금보다 훨씬 높은 안정적인 현금 흐름을 기대할 수 있습니다.</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">3. 높은 유동성</h3>
          <p className="!text-sm !my-0">주식처럼 거래소에 상장되어 있어, 원할 때 언제든지 쉽게 사고팔 수 있습니다.</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold !mt-0 !mb-1">4. 전문가의 운용</h3>
          <p className="!text-sm !my-0">부동산 투자 전문가들이 알아서 우량 부동산을 발굴하고 관리해주므로, 내가 직접 부동산을 공부하고 발품 팔 필요가 없습니다.</p>
        </div>
      </div>
    </section>
    <section className="mt-12">
        <h2 className="!text-2xl font-bold">어떻게 투자하나요?</h2>
        <p>
            리츠 투자는 주식 투자와 방법이 완전히 동일합니다. 사용하시는 증권사 앱(MTS)에서 사고 싶은 리츠 종목을 검색하여, 원하는 수량만큼 주문하면 끝입니다.
        </p>
        <p>
            국내에는 <strong>SK리츠, 롯데리츠, 신한알파리츠, ESR켄달스퀘어리츠</strong> 등 다양한 리츠가 상장되어 있으며, 각각 오피스, 쇼핑몰, 물류센터 등 다른 종류의 부동산에 투자하고 있습니다.
        </p>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        리츠로 월세같은 배당 수익 만들기
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        리츠는 안정적인 배당을 지급하는 대표적인 '고배당주'입니다. 여러 리츠와 배당주를 조합하여, 매달 월세처럼 배당금이 들어오는 현금 흐름 파이프라인을 만들어보세요.
      </p>
      <a
        href="/guides/dividend-stock-guide"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        월배당 포트폴리오 만드는 법 가이드
      </a>
    </section>
  ` },
  { slug: "housing-subscription-savings-priority", title: "주택청약 1순위 조건, 5분 만에 완벽 정복", description: "내 집 마련의 첫걸음, 주택청약 1순위가 되기 위한 모든 조건을 쉽고 빠르게 알려드립니다.", category: "부동산", tags: ["주택청약", "1순위", "내집마련"], level: "초급", publishedDate: "2025-10-28", views: 120345, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      내 집 마련의 필수품, 주택청약통장! 하지만 복잡한 조건 때문에 1순위가 되는 법을 놓치고 있진 않으신가요? 바쁜 당신을 위해, 청약 1순위가 되기 위한 핵심 조건만 쉽고 빠르게 정리했습니다. 5분만 투자해서 청약 당첨에 가까워지세요.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        국민주택 vs 민영주택, 목표부터 정하기
      </h2>
      <p>
        청약은 크게 '국민주택'과 '민영주택'으로 나뉩니다. 두 주택의 1순위 조건과 당첨자 선정 방식이 다르기 때문에, 나의 목표를 먼저 정하는 것이 중요합니다.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300">국민주택 (공공분양)</h3>
          <p className="!text-sm !my-0">
            <strong>핵심:</strong> 성실한 저축왕이 이긴다!<br/>
            <strong>당첨자 선정:</strong> 납입 횟수와 총 납입인정금액(월 최대 10만원)이 많은 순서.
          </p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">민영주택 (민간분양)</h3>
          <p className="!text-sm !my-0">
            <strong>핵심:</strong> 청약 가점이 높은 사람이 이긴다!<br/>
            <strong>당첨자 선정:</strong> 청약 가점(무주택기간, 부양가족 수, 통장가입기간)이 높은 순서. (추첨제도 있음)
          </p>
        </div>
      </div>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">1순위 자격, 핵심 조건 체크리스트</h2>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><path d="M20 6 9 17l-5-5"></path></svg>
            <span>청약통장 가입 기간 1년 이상 (수도권 외 6개월)</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><path d="M20 6 9 17l-5-5"></path></svg>
            <span>(국민주택) 납입 횟수 12회 이상 (수도권 외 6회)</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><path d="M20 6 9 17l-5-5"></path></svg>
            <span>(민영주택) 지역별 예치금액 충족</span>
        </div>
         <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><path d="M20 6 9 17l-5-5"></path></svg>
            <span>세대주 (국민주택 및 투기과열지구/청약과열지역의 민영주택)</span>
        </div>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">그래서, 지금 당장 해야 할 일은?</h2>
      <ol className="!my-4 space-y-2 text-base !p-0 !list-none">
        <li className="p-2"><strong>1. 청약통장 만들기:</strong> 아직 없다면, 지금 당장 은행에 가서 '주택청약종합저축' 통장을 만드세요. 모든 것의 시작입니다.</li>
        <li className="p-2"><strong>2. 월 10만원 자동이체 설정하기:</strong> 국민주택과 민영주택 모두를 대비하는 최고의 전략입니다. 매달 10만원씩 꾸준히 납입하여 납입 횟수와 인정 금액을 모두 채우세요.</li>
      </ol>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        더 자세한 정보가 필요하다면?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        청약 가점을 높이는 방법, 지역별 예치금 상세표 등 더 깊이 있는 정보가 궁금하다면 아래 상세 가이드를 확인하세요.
      </p>
      <a
        href="/guides/housing-subscription-savings-how-to-make-a-1st-priority-account"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        주택청약 1순위 완벽 공략집 보기
      </a>
    </section>
  ` },
  { slug: "4-major-insurances", title: "4대 보험 완벽 가이드: 내 월급에서 왜, 얼마나 떼는 걸까?", description: "국민연금, 건강보험, 고용보험, 산재보험. 내 삶을 지키는 최소한의 안전장치, 제대로 알아보세요.", category: "기초", tags: ["4대보험", "월급", "세금"], level: "초급", publishedDate: "2025-09-30", views: 187654, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      연봉 5,000만원을 12로 나누면 월 417만원인데, 왜 내 통장에는 350만원만 들어올까요? 바로 세금과 함께 <strong>4대 보험료</strong>가 공제되기 때문입니다. 대한민국 직장인이라면 의무적으로 가입하는 4대 보험, 어떤 것들이 있고 2025년에는 얼마나 내야 하는지 자세히 알아보겠습니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        나를 지키는 4개의 방패: 4대 보험
      </h2>
      <p>
        4대 보험은 질병, 실업, 노령, 산업재해 등 사회적 위험으로부터 모든 국민을 보호하기 위해 국가가 법으로 정한 사회보장제도입니다. 보험료는 회사(사업주)와 근로자가 함께 부담합니다.
      </p>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">2025년 4대보험 요율표</h2>
      <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-4 font-semibold">구분</th>
              <th className="p-4 font-semibold">근로자 부담</th>
              <th className="p-4 font-semibold">사업주 부담</th>
              <th className="p-4 font-semibold">합계</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-4 font-bold">국민연금</td>
              <td className="p-4">4.5%</td>
              <td className="p-4">4.5%</td>
              <td className="p-4">9.0%</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-4 font-bold">건강보험</td>
              <td className="p-4">3.545%</td>
              <td className="p-4">3.545%</td>
              <td className="p-4">7.09%</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-4 font-bold text-sm pl-8">ㄴ 장기요양보험</td>
              <td colSpan={2} className="p-4 text-center">건강보험료의 12.95%</td>
              <td className="p-4">-</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-4 font-bold">고용보험</td>
              <td className="p-4">0.9%</td>
              <td className="p-4">0.9% ~ 1.5%*</td>
              <td className="p-4">-</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-4 font-bold">산재보험</td>
              <td className="p-4">없음</td>
              <td className="p-4">업종별 상이 (전액 사업주 부담)</td>
              <td className="p-4">-</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-right mt-2 text-gray-500">* 고용보험의 사업주 부담분은 기업 규모에 따라 다릅니다.</p>
      </div>
    </section>
    <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
      <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        연봉 5,000만원, 월 공제액은?
      </h2>
      <p className="!my-4 text-center">
        월 급여(과세 대상) 4,166,667원 기준, 2025년 4대보험 공제액 예시입니다.
      </p>
      <blockquote className="text-left !border-l-blue-500 bg-white dark:bg-slate-800 p-4 rounded-lg">
         <ul className="!my-2 text-base space-y-2">
          <li className="flex justify-between"><span> 국민연금 (4.5%):</span> <strong>약 187,500원</strong></li>
          <li className="flex justify-between"><span> 건강보험 (3.545%):</span> <strong>약 147,708원</strong></li>
          <li className="flex justify-between"><span> ㄴ 장기요양보험 (건보료의 12.95%):</span> <strong>약 19,128원</strong></li>
          <li className="flex justify-between"><span> 고용보험 (0.9%):</span> <strong>약 37,500원</strong></li>
          <li className="flex justify-between border-t pt-2 mt-2 border-gray-300 dark:border-gray-600"><span><strong>근로자 총 부담액:</strong></span> <strong className="text-red-500">약 391,836원</strong></li>
        </ul>
      </blockquote>
      <p className="text-sm text-center mt-4">
        여기에 근로소득세(약 28만원)까지 더하면, 월 공제액은 약 67만원에 달합니다.
      </p>
    </section>
    <section className="mt-16 text-center">
      <h2 className="!text-2xl font-bold">
        내 연봉의 정확한 실수령액이 궁금하다면?
      </h2>
      <p className="mt-4">
        부양가족 수, 비과세 항목 등 개인의 조건에 따라 공제액은 달라집니다. <br />
        Moneysalary의 연봉 계산기로 1원 단위까지 정확한 내 월급을 확인해보세요.
      </p>
      <a
        href="/salary"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        내 연봉 실수령액 계산하기 💸
      </a>
    </section>
  ` },
  { slug: "compound-interest-magic", title: "복리의 마법, 스노우볼 효과: 부자들의 비밀 무기", description: "시간을 내 편으로 만들어 자산을 불리는 가장 확실한 방법, 복리의 모든 것을 알려드립니다.", category: "기초", tags: ["복리", "투자", "기초"], level: "초급", publishedDate: "2025-09-15", views: 198765, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      복리(複利)란 원금에만 이자가 붙는 '단리(單利)'와 달리, <strong>원금과 이자를 합친 금액에 다시 이자가 붙는 방식</strong>입니다. 시간이 지날수록 돈이 스스로 돈을 버는 속도가 기하급수적으로 빨라지는, 말 그대로 '눈덩이 효과'를 만들어냅니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-amber-500"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
        단리 vs 복리: 30년 후, 당신의 1,000만원은?
      </h2>
      <p>
        1,000만원을 연 10% 수익률로 30년간 투자했을 때, 단리와 복리의 차이는 얼마나 벌어질까요?
      </p>
      <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
        <table className="w-full text-center text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 font-semibold">년차</th>
              <th className="p-3 font-semibold">단리</th>
              <th className="p-3 font-semibold text-green-600">복리</th>
              <th className="p-3 font-semibold text-red-500">차이</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">1년</td><td className="p-3">1,100만원</td><td className="p-3 font-semibold text-green-600">1,100만원</td><td className="p-3 font-semibold text-red-500">0원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">5년</td><td className="p-3">1,500만원</td><td className="p-3 font-semibold text-green-600">1,611만원</td><td className="p-3 font-semibold text-red-500">111만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">10년</td><td className="p-3">2,000만원</td><td className="p-3 font-semibold text-green-600">2,594만원</td><td className="p-3 font-semibold text-red-500">594만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">20년</td><td className="p-3">3,000만원</td><td className="p-3 font-semibold text-green-600">6,728만원</td><td className="p-3 font-semibold text-red-500">3,728만원</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">30년</td><td className="p-3">4,000만원</td><td className="p-3 font-semibold text-green-600">1억 7,449만원</td><td className="p-3 font-semibold text-red-500">1억 3,449만원</td></tr>
          </tbody>
        </table>
      </div>
      <p className="text-center mt-4 text-lg font-semibold">30년 후, 그 차이는 무려 <strong className="text-red-500">1억 3,449만원</strong>에 달합니다!</p>
    </section>
    <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
      <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        내 돈이 2배가 되는 시간, '72의 법칙'
      </h2>
      <p className="!my-2 text-base">
        복리 투자의 계획을 쉽게 세우도록 돕는 마법의 공식이 있습니다. 바로 '72의 법칙'입니다.
      </p>
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
         <p className="text-lg font-medium">
          돈이 2배가 되는 기간 (년) ≈ 72 / 연 수익률 (%)
        </p>
      </div>
      <p className="!text-sm !mt-4">
        예를 들어, 연 8% 수익률이라면 약 9년(72÷8), 10% 수익률이라면 약 7.2년(72÷10) 만에 원금이 2배가 됩니다. 이 간단한 법칙만 알아도 장기 투자의 위력을 체감할 수 있습니다.
      </p>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-signature-blue"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        복리의 마법을 내 것으로 만드는 3가지 행동
      </h2>
      <ol className="!my-4 space-y-4 text-base">
        <li>
          <strong>1. '장기적으로 우상향'하는 자산에 투자하기</strong><br/>
          복리는 '시간'과 '수익률'의 함수입니다. 어떤 자산에 투자해야 할지 막막하다면, 세계 최고의 기업들에 자동으로 분산 투자하는 '지수 추종 ETF'부터 시작해보세요.
          <a href="/guides/etf-investment-from-stock-selection-to-trading-strategy" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ ETF 투자 완벽 가이드 보기</a>
        </li>
        <li>
          <strong>2. '세금'이라는 마찰력 줄이기</strong><br/>
          투자로 번 돈에서 세금을 떼면, 눈덩이가 굴러가는 데 마찰이 생깁니다. ISA 계좌 등을 활용해 세금을 최대한 줄이는 것이 복리 효과를 극대화하는 핵심입니다.
          <a href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ ISA 계좌 200% 활용법 보기</a>
        </li>
        <li>
          <strong>3. '시간'을 내 편으로 만들기</strong><br/>
          복리의 가장 중요한 재료는 '시간'입니다. 하루라도 빨리 시작해서, 시장의 단기적인 등락에 흔들리지 않고 꾸준히 투자하는 '시스템'을 만드는 것이 중요합니다.
          <a href="/guides/road-to-100m-part3-invest" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ 돈이 일하는 투자 시스템 만들기 가이드 보기</a>
        </li>
      </ol>
    </section>
    <section className="mt-16 text-center">
      <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-indigo-500"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
        당신의 미래 자산, 지금 바로 계산해보세요
      </h2>
      <p className="mt-4">
        매월 꾸준히 투자하면 10년, 20년 뒤 내 자산은 얼마나 불어날까요? <br />
        '파이어 계산기'로 당신의 부를 예측하고 계획을 세워보세요.
      </p>
      <a
        href="/fire-calculator"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        파이어(FIRE) 은퇴 계산기 🔥
      </a>
    </section>
  ` },
  { slug: "credit-score-101", title: "신용점수, 100점 올리는 가장 빠른 방법", description: "신용점수의 중요성부터, 일상 속에서 점수를 관리하고 올리는 실질적인 팁까지 모두 알려드립니다.", category: "기초", tags: ["신용점수", "대출", "신용카드"], level: "초급", publishedDate: "2025-09-14", views: 78123, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      신용점수는 현대 사회를 살아가는 '금융 신분증'입니다. 대출 한도와 금리부터 신용카드 발급까지, 우리의 모든 금융 활동에 막대한 영향을 미칩니다. 낮은 신용점수 때문에 고민이라면, 지금 당장 점수를 100점 이상 올릴 수 있는 가장 빠르고 확실한 방법들을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        내 신용점수, 어디서 어떻게 확인할까?
      </h2>
      <p>
        과거와 달리, 이제는 신용점수를 조회해도 점수가 하락하지 않습니다. 오히려 자주 확인하며 관리하는 것이 중요합니다. 토스, 카카오페이, 네이버페이 등 핀테크 앱을 통해 누구나 <strong>무료로, 횟수 제한 없이</strong> 자신의 신용점수(NICE, KCB)를 확인할 수 있습니다.
      </p>
    </section>
    <section className="mt-12 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
      <h2 className="!mt-0 !text-2xl font-bold text-green-700">신용점수 100점 올리는 4가지 핵심 비법</h2>
      <ol className="!my-4 space-y-4 text-base !p-0 !list-none">
        <li className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
          <h4 className="font-bold !mt-0 !mb-1">1. 성실한 대출 상환: 기본 중의 기본</h4>
          <p className="!text-sm !my-0">대출 원금과 이자, 신용카드 대금을 단 하루도, 단 1원도 연체하지 않는 것이 가장 중요합니다. 연체는 신용도에 가장 치명적인 적입니다.</p>
        </li>
        <li className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
          <h4 className="font-bold !mt-0 !mb-1">2. 신용카드 '잘' 쓰기: 한도의 30~50%</h4>
          <p className="!text-sm !my-0">신용카드를 아예 안 쓰는 것보다, 한도의 30~50% 내에서 꾸준히 사용하고 연체 없이 갚는 것이 신용도에 훨씬 긍정적입니다. '선결제'를 활용하는 것도 좋은 습관입니다.</p>
        </li>
        <li className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
          <h4 className="font-bold !mt-0 !mb-1">3. 체크카드 꾸준히 사용하기</h4>
          <p className="!text-sm !my-0">신용카드뿐만 아니라, 월 30만원 이상 6개월 넘게 체크카드를 꾸준히 사용하는 것도 신용 평가에 가점을 줍니다.</p>
        </li>
        <li className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
          <h4 className="font-bold !mt-0 !mb-1">4. 비금융 정보 제출하기 (가장 빠른 꿀팁)</h4>
          <p className="!text-sm !my-0">국민연금, 건강보험, 통신비, 도시가스 요금 등의 납부 내역을 신용평가사(NICE, KCB)에 직접 제출하면, 성실성을 인정받아 가점을 받을 수 있습니다. 사회초년생이나 주부처럼 금융 거래 이력이 부족한 분들에게 특히 효과적입니다.</p>
        </li>
      </ol>
    </section>
    <section className="mt-12">
        <h2 className="!text-2xl font-bold">이것만은 피하세요: 신용점수 하락의 주범</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 className="font-bold !mt-0 !mb-1 text-red-700 dark:text-red-300">현금서비스/카드론/리볼빙</h3>
                <p className="!text-sm !my-0">급전이 필요하더라도 이 서비스들을 이용하면 신용점수가 큰 폭으로 하락할 수 있습니다. '빚으로 빚을 돌려막는' 최악의 신호로 인식되기 때문입니다.</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 className="font-bold !mt-0 !mb-1 text-red-700 dark:text-red-300">잦은 연체</h3>
                <p className="!text-sm !my-0">통신비, 공과금 등 소액이라도 연체를 반복하면 신용도에 악영향을 미칩니다. 자동이체를 생활화하세요.</p>
            </div>
        </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        높아진 신용점수, 어떻게 활용할까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        신용점수가 높아지면 더 낮은 금리로 더 많은 대출을 받을 수 있습니다. 내 집 마련을 위한 정부 지원 대출의 자격 조건을 확인해보세요.
      </p>
      <a
        href="/guides/didimdol-vs-bogeumjari"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 20V10H6V8l6-6 6 6v2h-6v8Z"></path><path d="M12 20v-2"></path><path d="M12 12v-2"></path></svg>
        디딤돌 vs 보금자리론 비교 가이드
      </a>
    </section>
  ` },
  { slug: "k-pass-guide", title: "K-패스, 정말 이득일까? 완벽 분석", description: "알뜰교통카드와 K-패스의 차이점, 그리고 나에게 가장 유리한 교통비 절약 카드는 무엇일까요?", category: "기초", tags: ["K-패스", "교통비", "절약"], level: "초급", publishedDate: "2025-09-01", views: 87654, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      매일 이용하는 대중교통, 교통비 부담이 만만치 않으신가요? 월 15회 이상 대중교통을 이용하기만 해도, 쓴 돈의 최대 53%까지 돌려받을 수 있는 'K-패스'가 2024년 5월부터 시행되었습니다. 기존 '알뜰교통카드'의 불편함은 없애고 혜택은 늘린 K-패스의 모든 것을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        K-패스, 대체 뭔가요?
      </h2>
      <p>
        K-패스는 월 15회 이상 정기적으로 대중교통(시내버스, 지하철, 광역버스, GTX 등)을 이용할 경우, 지출 금액의 일정 비율을 다음 달에 돌려받을 수 있는 교통카드입니다.
      </p>
      <blockquote className="!border-l-blue-500">
        <p>
          <strong>알뜰교통카드와 가장 큰 차이점:</strong> 더 이상 앱에서 '출발', '도착' 버튼을 누를 필요가 없습니다! K-패스는 이동 거리가 아닌 '이용 금액'을 기준으로 환급해주기 때문에, 그냥 평소처럼 카드를 찍고 다니기만 하면 자동으로 혜택이 적용됩니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-12 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
      <h2 className="!mt-0 !text-2xl font-bold text-green-700">얼마나 돌려받을 수 있나요? (환급률)</h2>
      <p className="!my-2 text-base">
        환급률은 나이와 소득 수준에 따라 달라집니다. 월 60회 이용까지 혜택이 적용됩니다.
      </p>
      <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr><th className="p-3 font-semibold">구분</th><th className="p-3 font-semibold">환급률</th><th className="p-3 font-semibold">월 최대 환급액 (60회 기준)</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">일반</td><td className="p-3 font-bold text-green-600">20%</td><td className="p-3">최대 27,000원 (월 13.5만원 이용 시)</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">청년 (만 19~34세)</td><td className="p-3 font-bold text-green-600">30%</td><td className="p-3">최대 40,500원 (월 13.5만원 이용 시)</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">저소득층</td><td className="p-3 font-bold text-green-600">53%</td><td className="p-3">최대 71,500원 (월 13.5만원 이용 시)</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section className="mt-12">
        <h2 className="!text-2xl font-bold">K-패스 이용법 (3단계)</h2>
        <ol className="!my-4 space-y-3 text-base !p-0 !list-none">
            <li className="p-3 border-l-4 border-purple-300"><strong>1단계: K-패스 카드 발급받기</strong><br/><span className="text-sm">10개 카드사(신한, 국민, 하나, 우리, 현대, 삼성, BC, 농협, 이동, DGB유페이)에서 K-패스 기능이 탑재된 신용카드 또는 체크카드를 발급받습니다.</span></li>
            <li className="p-3 border-l-4 border-purple-300"><strong>2단계: K-패스 회원가입하기</strong><br/><span className="text-sm">K-패스 공식 홈페이지(korea-pass.kr) 또는 앱에서 발급받은 카드 번호를 등록하여 회원가입을 완료합니다.</span></li>
            <li className="p-3 border-l-4 border-purple-300"><strong>3단계: 그냥 사용하기!</strong><br/><span className="text-sm">이제 등록한 카드로 평소처럼 대중교통을 이용하기만 하면, 다음 달에 카드사에서 환급액을 계좌로 입금해주거나, 청구 금액에서 할인해줍니다.</span></li>
        </ol>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        사회초년생이라면 놓치지 마세요
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        K-패스는 교통비 부담이 큰 사회초년생에게 특히 유용한 혜택입니다. 첫 월급부터 시작하는 다양한 절약 및 재테크 방법을 확인하고, 현명한 금융 생활을 시작하세요.
      </p>
      <a
        href="/guides/first-investment-guide"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        사회초년생 재테크 로드맵 보기
      </a>
    </section>
  ` },
  { slug: "parking-account-comparison", title: "파킹통장, 금리 비교 및 추천 (2025년 최신)", description: "하루만 맡겨도 이자가 붙는 파킹통장, 제2의 월급으로 활용하는 방법과 최고의 상품을 추천합니다.", category: "기초", tags: ["파킹통장", "금리", "CMA"], level: "초급", publishedDate: "2025-08-26", views: 88765, content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      월급은 통장을 스쳐 지나갈 뿐이라고요? 놀고 있는 내 비상금, 단기 목적 자금에서 이자를 받을 수 있다면 어떨까요? 하루만 맡겨도 이자가 붙는 '파킹통장'을 활용하여, 잠자는 내 돈을 깨워 제2의 월급을 만드는 방법을 알려드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-blue-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
        파킹통장, 왜 써야 할까?
      </h2>
      <p>
        파킹통장은 이름처럼, 잠시 주차(Parking)하듯 돈을 보관하는 용도의 통장입니다. 수시입출금 통장처럼 입출금이 자유로우면서도, 예적금처럼 하루만 맡겨도 이자를 주기 때문에 <strong>비상금</strong>이나 <strong>단기 목적 자금(여행, 이사 등)</strong>을 보관하기에 최적의 상품입니다.
      </p>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">CMA vs 은행 파킹통장, 무엇이 다를까?</h2>
      <p>파킹통장은 크게 증권사의 'CMA'와 저축은행/인터넷은행의 '고금리 수시입출금 통장'으로 나뉩니다.</p>
      <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 font-semibold">구분</th>
              <th className="p-3 font-semibold">증권사 CMA</th>
              <th className="p-3 font-semibold">은행 파킹통장</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">운용 주체</td><td className="p-3">증권사</td><td className="p-3">제1금융권, 저축은행, 인터넷은행</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">수익 구조</td><td className="p-3">국공채 등 단기 채권에 투자하여 수익 발생</td><td className="p-3">은행 예금 이자</td></tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">예금자보호</td><td className="p-3 font-bold text-red-500">X (단, 매우 안전한 자산에 투자)</td><td className="p-3 font-bold text-green-600">O (5,000만원까지)</td></tr>
             <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-bold">금리 수준</td><td className="p-3">은행 파킹통장보다 약간 높은 경향</td><td className="p-3">CMA보다 약간 낮은 경향</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">그래서, 어떤 상품을 선택해야 할까?</h2>
      <blockquote className="!border-l-yellow-500 !mt-4 !text-base">
        <ul className="!my-2 list-disc list-inside space-y-2">
            <li><strong>안정성이 최우선이라면:</strong> 예금자 보호가 되는 <strong>은행 파킹통장</strong> (토스뱅크, 케이뱅크, OK저축은행 등)</li>
            <li><strong>단 0.1%라도 높은 금리를 원한다면:</strong> <strong>증권사 CMA</strong> (미래에셋증권, 한국투자증권 등)</li>
        </ul>
        <p className="!mt-4">
          금리는 계속 변동되므로, 가입 시점의 금리를 각 금융사 앱에서 직접 확인하는 것이 가장 중요합니다.
        </p>
      </blockquote>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        사회초년생 재테크의 첫걸음, 비상금 만들기
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        파킹통장은 재테크의 가장 첫 단계인 '비상금 모으기'에 가장 적합한 도구입니다. 첫 월급부터 시작하는 돈 관리 시스템을 만들어보세요.
      </p>
      <a
        href="/guides/first-investment-guide"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-5 h-5 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        사회초년생 재테크 로드맵 보기
      </a>
    </section>
  ` },
  {
    slug: "labor-union-pros-and-cons",
    title: "노동조합, 가입할까 말까? 장단점 완벽 비교",
    description: "노동조합 가입을 고민하는 당신을 위해, 노조의 진짜 역할과 장단점을 객관적으로 분석해 드립니다.",
    category: "노동/법률",
    tags: ["노동조합", "노조", "직장생활"],
    level: "중급",
    publishedDate: "2025-11-08",
    views: 12345,
    content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      '노동조합'하면 무엇이 떠오르시나요? 빨간 조끼, 머리띠, 투쟁? 혹은 회사의 부당함에 맞서 나의 권리를 지켜주는 든든한 울타리? 노동조합은 근로자가 주체가 되어 근로조건의 유지·개선 기타 근로자의 경제적·사회적 지위의 향상을 도모함을 목적으로 조직하는 단체입니다. 가입을 망설이는 당신을 위해, 노동조합의 장점과 단점을 객관적으로 비교 분석해 드립니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">노동조합의 장점: 뭉치면 강해진다</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300">1. 임금 및 복지 향상</h3>
          <p className="!text-sm !my-0">개인이 회사와 동등한 위치에서 연봉, 성과급, 복지 혜택을 협상하기는 어렵습니다. 노조는 조합원들의 힘을 모아 회사와 대등한 위치에서 '단체교섭'을 진행하며, 이를 통해 개인 혼자서는 얻기 힘든 임금 인상과 복지 향상을 이끌어낼 수 있습니다.</p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300">2. 부당해고 및 징계로부터 보호</h3>
          <p className="!text-sm !my-0">회사가 정당한 이유 없이 해고, 징계, 부서 이동 등 불이익을 줄 경우, 노조는 법률 자문, 변호사 선임 등을 통해 조합원이 부당한 처우를 받지 않도록 보호하는 방패 역할을 합니다.</p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300">3. 투명한 정보 공개 요구</h3>
          <p className="!text-sm !my-0">회사의 경영 성과, 성과급 지급 기준 등 민감한 정보들을 투명하게 공개하도록 요구할 수 있습니다. 이를 통해 깜깜이 성과급 지급과 같은 불합리한 관행을 개선하고, 공정한 보상 체계를 만드는 데 기여할 수 있습니다.</p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-bold !mt-0 !mb-2 text-green-700 dark:text-green-300">4. 근무 환경 개선</h3>
          <p className="!text-sm !my-0">과도한 야근, 열악한 휴게 공간, 불합리한 평가 제도 등 개인이 말하기 어려운 문제들을 노조가 공식적으로 문제 제기하고 개선을 요구하여 더 나은 근무 환경을 만들 수 있습니다.</p>
        </div>
      </div>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">노동조합의 단점: 빛과 그림자</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="font-bold !mt-0 !mb-2 text-red-700 dark:text-red-300">1. 조합비 납부 의무</h3>
          <p className="!text-sm !my-0">노조 운영을 위해 매달 통상임금의 1% 내외를 조합비로 납부해야 합니다. 노조의 활동으로 얻는 이익이 조합비보다 크다고 판단될 때 가입하는 것이 합리적입니다.</p>
        </div>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="font-bold !mt-0 !mb-2 text-red-700 dark:text-red-300">2. 회사와의 갈등 가능성</h3>
          <p className="!text-sm !my-0">노조 활동이 활발한 사업장의 경우, 파업이나 쟁의 행위 등으로 인해 회사와의 관계가 악화될 수 있으며, 이 과정에서 조합원들이 심리적, 물리적 어려움을 겪을 수 있습니다.</p>
        </div>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="font-bold !mt-0 !mb-2 text-red-700 dark:text-red-300">3. 집단주의적 의사결정</h3>
          <p className="!text-sm !my-0">노조의 결정(예: 임금 인상률)이 나의 개인적인 생각과 다르더라도 따라야 하는 경우가 있습니다. 개인의 성과에 따른 차등 보상보다, 전체 조합원의 이익을 우선시하는 경향이 있습니다.</p>
        </div>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="font-bold !mt-0 !mb-2 text-red-700 dark:text-red-300">4. 정치적 편향성 우려</h3>
          <p className="!text-sm !my-0">일부 노조의 경우, 근로조건 개선이라는 본연의 목적을 넘어 특정 정당이나 정치적 입장을 대변하는 활동을 하여 내부 조합원들 간의 갈등을 유발하기도 합니다.</p>
        </div>
      </div>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        노동조합, 더 자세히 알고 싶다면?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        노동조합의 종류, 설립 방법, 그리고 교섭대표노조의 역할 등 더 깊이 있는 정보가 궁금하다면 아래 가이드를 확인해보세요.
      </p>
      <a
        href="/guides/labor-union-deep-dive"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        노동조합 심층 탐구 가이드 보기
      </a>
    </section>
  `
  },
  {
    slug: "labor-union-deep-dive",
    title: "노동조합 심층 탐구: 종류, 설립, 교섭대표노조 A to Z",
    description: "단위노조, 산별노조, 교섭대표노조 등 복잡한 노동조합의 세계를 명확하게 정리해 드립니다.",
    category: "노동/법률",
    tags: ["노동조합", "산별노조", "교섭대표노조"],
    level: "고급",
    publishedDate: "2025-11-07",
    views: 8765,
    content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      최근 IT 업계를 중심으로 노동조합 설립 열풍이 불고 있습니다. 네이버, 카카오, 넥슨, 스마일게이트 등 주요 기업에 노조가 생기면서 '노동조합'은 더 이상 특정 산업군만의 이야기가 아니게 되었습니다. 하지만 단위노조, 지회, 산별노조, 교섭대표노조 등 복잡한 용어들은 여전히 어렵게 느껴집니다. 노동조합의 종류와 설립 방법, 그리고 가장 중요한 '교섭대표노조'의 역할까지, 노동조합의 모든 것을 심층적으로 알아봅니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">노동조합의 종류: 어디까지 묶을 것인가?</h2>
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">1. 기업별 노동조합 (단위노조)</h3>
          <p className="!text-sm !my-0">가장 일반적인 형태로, 특정 기업에 소속된 근로자들로 구성된 노조입니다. (예: 삼성전자 노동조합, 현대자동차 노동조합)</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">2. 산업별 노동조합 (산별노조)</h3>
          <p className="!text-sm !my-0">동일한 산업에 종사하는 근로자들이 기업의 경계를 넘어 함께 구성하는 노조입니다. (예: 전국금속노동조합, 전국화학섬유식품산업노동조합). 보통 산별노조 산하에 각 기업별 '지회'가 있는 구조입니다. (예: 전국금속노동조합 현대자동차지부)</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <h3 className="font-bold !mt-0 !text-lg">3. 일반 노동조합</h3>
          <p className="!text-sm !my-0">직업이나 산업과 관계없이, 여러 분야의 근로자들이 함께 가입할 수 있는 노조입니다. (예: 청년유니온)</p>
        </div>
      </div>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">노동조합은 어떻게 만드나요? (설립 절차)</h2>
      <p>2명 이상의 근로자만 모이면 누구나 자유롭게 노동조합을 설립할 수 있습니다.</p>
      <ol className="!my-4 list-decimal list-inside space-y-2 text-base bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <li><strong>설립 준비:</strong> 함께할 동료 2명 이상을 모으고, 노조의 목표와 활동 방향을 정합니다.</li>
        <li><strong>규약 제정:</strong> 노조의 명칭, 목적, 조합원의 자격 등 노조 운영에 필요한 규칙(규약)을 만듭니다.</li>
        <li><strong>창립 총회 개최:</strong> 조합원 과반수가 참석하여 규약을 확정하고, 임원을 선출합니다.</li>
        <li><strong>설립 신고:</strong> 관할 행정관청(고용노동부, 시/군/구청)에 설립신고서를 제출하면 '노동조합 설립 필증'이 교부되며 법적인 지위를 갖게 됩니다.</li>
      </ol>
    </section>
    <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
      <h2 className="!mt-0 !text-2xl font-bold text-yellow-700">가장 중요한 '교섭대표노조'란?</h2>
      <p className="!my-2 text-base">
        하나의 회사에 여러 개의 노동조합이 있는 경우, 회사는 모든 노조와 개별적으로 교섭하지 않습니다. 법적으로 '교섭 창구 단일화' 절차를 거쳐, 조합원 수가 가장 많은 <strong>과반수 노조</strong>가 '교섭대표노조'의 지위를 얻어 모든 조합원을 대표하여 회사와 교섭하게 됩니다.
      </p>
      <blockquote className="!border-l-yellow-500 !mt-4 !text-base">
        <p>
          <strong>핵심:</strong> 내가 가입한 노조가 교섭대표노조가 아니라면, 임금 및 단체협약의 주요 내용 결정 과정에서 목소리를 내기 어렵습니다. 따라서 어떤 노조가 우리 회사의 교섭대표노조인지, 그리고 그 노조가 나의 입장을 잘 대변해주는지가 매우 중요합니다.
        </p>
        <a href="/guides/majority-union-benefits" className="text-sm font-bold text-yellow-800 dark:text-yellow-300 hover:underline block mt-2">→ 과반수 노조의 막강한 힘 알아보기</a>
      </blockquote>
    </section>
  `
  },
  {
    slug: "majority-union-benefits",
    title: "과반수 노조의 막강한 힘: 근로자에게 유리한 3가지",
    description: "교섭대표노조가 되었을 때 얻게 되는 강력한 권한과, 그것이 나의 직장생활에 미치는 영향을 알아봅니다.",
    category: "노동/법률",
    tags: ["노동조합", "과반수노조", "교섭대표노조"],
    level: "고급",
    publishedDate: "2025-11-06",
    views: 7654,
    content: `
    <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      하나의 사업장에 여러 노동조합이 존재할 경우, 법에 따라 조합원 수가 가장 많은 '과반수 노조'가 교섭대표노조의 지위를 갖게 됩니다. 이 교섭대표노조는 단순히 조합원 수가 많은 것을 넘어, 법적으로 막강한 권한을 부여받습니다. 과반수 노조가 되었을 때 근로자에게 유리한 3가지 핵심적인 권한을 알아봅니다.
    </p>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">과반수 노조의 3가지 막강한 권한</h2>
      <div className="mt-6 space-y-4">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-bold !mt-0 !text-xl text-blue-700 dark:text-blue-300">1. 근로시간면제 (타임오프) 제도</h3>
          <p className="!text-sm !my-2">
            노조의 간부나 직원이 회사의 업무는 하지 않고 노조 활동만 전담하면서도, 회사로부터 급여를 받을 수 있는 제도입니다. 조합원 수에 따라 사용할 수 있는 총 시간이 정해지며, 과반수 노조는 이 시간을 어떻게 배분할지 결정하는 주도권을 갖게 됩니다. 이를 통해 노조 활동가들이 안정적으로 노조 업무에 집중할 수 있는 환경이 만들어집니다.
          </p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-bold !mt-0 !text-xl text-blue-700 dark:text-blue-300">2. 노사협의회 근로자위원 위촉 권한</h3>
          <p className="!text-sm !my-2">
            노사협의회는 임금 외에 회사의 복지, 교육, 안전 등 전반적인 사항을 논의하는 중요한 기구입니다. 과반수 노조는 이 노사협의회에 참여하는 '근로자위원'을 위촉할 수 있는 막강한 권한을 가집니다. 이를 통해 회사의 중요한 의사결정 과정에 직접 참여하여 근로자의 목소리를 반영할 수 있습니다.
          </p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-bold !mt-0 !text-xl text-blue-700 dark:text-blue-300">3. 취업규칙 불이익 변경 시 동의권</h3>
          <p className="!text-sm !my-2">
            회사가 근로자에게 불리하게 취업규칙(예: 임금피크제 도입, 휴가 축소 등)을 변경하려고 할 때, 반드시 근로자 과반수의 동의를 얻어야 합니다. 이때 과반수 노조가 있다면, 전체 근로자의 의견을 묻는 대신 '과반수 노조의 동의'만으로 법적인 효력이 발생합니다. 즉, 과반수 노조가 반대하면 회사는 근로자에게 불리한 제도를 마음대로 도입할 수 없습니다.
          </p>
        </div>
      </div>
    </section>
    <section className="mt-12">
      <h2 className="!text-2xl font-bold">결론: 과반수의 힘이 근로자의 힘</h2>
      <p>
        이처럼 과반수 노조는 단순히 교섭대표권을 갖는 것을 넘어, 회사의 주요 의사결정에 실질적인 영향력을 행사할 수 있는 법적 권한을 가집니다. 따라서 어떤 노조가 과반수가 되는지는 전체 근로자의 근로조건과 직장생활에 매우 큰 영향을 미치게 됩니다.
      </p>
    </section>
    <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
      <h2 className="!text-2xl font-bold">
        노동조합, 가입해야 할까?
      </h2>
      <p className="mt-4 max-w-xl mx-auto">
        과반수 노조의 강력한 힘을 알아보았습니다. 이제 노동조합 가입의 장점과 단점을 다시 한번 꼼꼼히 따져보고, 현명한 결정을 내려보세요.
      </p>
      <a
        href="/guides/labor-union-pros-and-cons"
        className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        노동조합 장단점 비교 가이드 보기
      </a>
    </section>
  `
  },
];