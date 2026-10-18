// Bridges between narrowly named categories, based on the question's topic
// rather than incidental words in its answer. Same-category peers remain first.
const TOPICS = [
  /연봉|실수령|비과세|성과급|식대|소득세|프리랜서|부업/,
  /포괄임금|야근|연장근로|주 52|최저임금|연차|주휴|야간수당|휴일수당/,
  /퇴직|퇴사|이직|권고사직|실업급여|재취업/,
  /연금|IRP|은퇴|FIRE/,
  /4대\s?보험|건강보험|피부양자|지역가입자|의료비|국민연금/,
  /연말정산|세액공제|소득공제|부양가족 공제|원천징수영수증|세금 신고|소득세|식대/,
  /청년도약|CMA|예적금|인플레이션|ISA|저축/,
  /배당|공모주|ETF|펀드|ISA|FIRE/,
  /대출|DSR|주택|전세|월세|고정금리|변동금리|중도상환|원리금/,
  /육아|출산|자녀|맞벌이|부양가족/,
  /장려금|청년내일|청년도약|중소기업.*감면|최저임금/,
  /주 52|연차|육아휴직|출산휴가/,
] as const;

export function qnaTopicScore(source: { category: string; question: string }, target: { category: string; question: string }): number {
  const overlap = TOPICS.filter((topic) => topic.test(source.question) && topic.test(target.question)).length;
  return (source.category === target.category ? 20 : 0) + overlap * 5;
}
