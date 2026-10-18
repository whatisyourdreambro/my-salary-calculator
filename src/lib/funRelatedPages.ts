/** Editorial connections between activities, not a rotation or a ranking of users. */
export const FUN_PAGES = {
  'rich-dna-test': { title: '부자 DNA 테스트', description: '투자 취향을 재미용 캐릭터로 살펴보세요.' },
  'financial-mbti': { title: '금융 MBTI', description: '돈을 대하는 성향을 다른 질문으로 돌아보세요.' },
  'spending-test': { title: '소비 성향 테스트', description: '소비 선택에 관한 짧은 질문을 풀어보세요.' },
  'iq-test': { title: '논리 퀴즈', description: '성향 질문 대신 논리 문제를 풀어보세요. 공식 IQ 검사는 아닙니다.' },
  reincarnation: { title: '환생 캐릭터 테스트', description: '가상의 캐릭터를 뽑는 재미용 테스트입니다.' },
  fortune: { title: '재미로 보는 운세', description: '캐릭터 테스트에 이어 가벼운 운세 콘텐츠를 즐겨보세요.' },
  rank: { title: '연봉 분포 시뮬레이터', description: '자체 참고 구간으로 연봉을 가볍게 비교합니다. 공식 순위는 아닙니다.' },
  'salary-rank': { title: '나이대별 연봉 참고표', description: '자체 연봉 구간과 나이대 조건을 함께 살펴보세요.' },
  'salary-slip': { title: '가상 급여명세서', description: '가정한 연봉의 공제와 실수령액을 명세서 형태로 확인하세요.' },
  'escape-plan': { title: '노비 탈출 계획', description: '저축과 지출 가정을 바꿔 경제적 자유까지의 시간을 비교하세요.' },
  'what-to-buy': { title: '플렉스 계산기', description: '입력한 예산으로 살 수 있는 물건을 비교해보세요.' },
  'salary-battle': { title: '연봉 배틀', description: '관심 있는 두 회사의 연봉·복지 참고 정보를 비교하세요.' },
  worldcup: { title: '기업 이상형 월드컵', description: '회사 선택 기준을 토너먼트 방식으로 돌아보세요.' },
  flappy: { title: '플래피 샐러리맨', description: '장애물을 피하는 짧은 비행 게임으로 쉬어가세요.' },
  tetris: { title: '샐러리맨 테트리스', description: '블록을 맞추는 퍼즐 게임에 도전해보세요.' },
  'asset-allocator': { title: '자산 배분 미니게임', description: '떨어지는 아이템을 잡는 게임입니다. 실제 투자 배분 도구는 아닙니다.' },
  'meme-coin': { title: '밈코인 모의투자', description: '가상 가격 변동을 경험하는 게임이며 실제 거래는 하지 않습니다.' },
  'random-draw': { title: '구슬 레이스 추첨', description: '참가자를 넣고 무작위 추첨을 진행하세요.' },
  'weekend-duty': { title: '주말 당직 룰렛', description: '참가자끼리 기준을 합의한 뒤 당직 추첨을 해보세요.' },
  'lunch-roulette': { title: '점심 메뉴 룰렛', description: '점심 메뉴를 고르기 어려울 때 후보를 뽑아보세요.' },
} as const;

export type FunPageSlug = keyof typeof FUN_PAGES;
export const FUN_RELATED_PAGES = {
  'rich-dna-test': ['financial-mbti', 'spending-test', 'meme-coin'],
  'financial-mbti': ['rich-dna-test', 'spending-test', 'iq-test'],
  'spending-test': ['financial-mbti', 'what-to-buy', 'rich-dna-test'],
  'iq-test': ['financial-mbti', 'tetris', 'reincarnation'],
  reincarnation: ['fortune', 'iq-test', 'rich-dna-test'],
  fortune: ['reincarnation', 'iq-test'],
  rank: ['salary-rank', 'salary-battle', 'worldcup'],
  'salary-rank': ['rank', 'salary-slip', 'salary-battle'],
  'salary-slip': ['salary-rank', 'escape-plan', 'what-to-buy'],
  'escape-plan': ['salary-slip', 'rank', 'what-to-buy'],
  'what-to-buy': ['spending-test', 'escape-plan', 'salary-slip'],
  'salary-battle': ['worldcup', 'salary-rank', 'rank'],
  worldcup: ['salary-battle', 'random-draw', 'salary-rank'],
  flappy: ['tetris', 'asset-allocator'],
  tetris: ['flappy', 'asset-allocator', 'iq-test'],
  'asset-allocator': ['flappy', 'tetris', 'meme-coin'],
  'meme-coin': ['asset-allocator', 'financial-mbti', 'rich-dna-test'],
  'random-draw': ['weekend-duty', 'lunch-roulette', 'worldcup'],
  'weekend-duty': ['random-draw', 'lunch-roulette'],
  'lunch-roulette': ['random-draw', 'weekend-duty'],
} as const satisfies Record<FunPageSlug, readonly FunPageSlug[]>;

// One additional, activity-specific next step. Keep these outside the game list:
// a work-time tool, for example, is not represented as another arcade game.
export const FUN_CONTEXT_LINKS: Partial<Record<FunPageSlug, { href: string; title: string; description: string }>> = {
  fortune: { href: '/fortune-2026', title: '2026 재물운·연봉운', description: '태어난 연도와 월로 보는 직장인 운세도 재미로 살펴보세요.' },
  reincarnation: { href: '/fortune-2026', title: '2026 재물운·연봉운', description: '가상 캐릭터와 함께 즐길 수 있는 생년월 운세입니다. 실제 미래를 예측하지 않습니다.' },
  'random-draw': { href: '/lotto', title: '로또 번호 추첨', description: '번호를 무작위로 뽑아보세요. 이전 결과로 당첨을 예측하는 기능은 아닙니다.' },
  'weekend-duty': { href: '/lotto', title: '로또 번호 추첨', description: '참가자 추첨과는 별개로 무작위 번호 조합을 만들어볼 수 있습니다. 당첨 확률을 높이지 않습니다.' },
  'financial-mbti': { href: '/mbti-salary', title: '연봉 MBTI 테스트', description: '직장 생활에 관한 질문으로 성향을 돌아보세요. 개인의 실제 소득을 예측하는 검사는 아닙니다.' },
  'rich-dna-test': { href: '/mbti-salary', title: '연봉 MBTI 테스트', description: '투자 취향 캐릭터에 이어 직장 생활과 성향에 관한 재미용 질문을 풀어보세요.' },
  'salary-slip': { href: '/work-clock', title: '실시간 월급 시계', description: '설정한 급여를 근무 시간당 금액으로 환산하고 선택하여 근무 기록을 남길 수 있습니다.' },
  'what-to-buy': { href: '/work-clock', title: '실시간 월급 시계', description: '물건 가격을 비교했다면, 설정한 급여를 근무 시간당 금액으로도 살펴보세요.' },
  'iq-test': { href: '/fun', title: '다른 퀴즈와 미니게임', description: '논리 문제를 마쳤다면 취향 테스트와 쉬어가는 게임 중에서 다음 활동을 골라보세요.' },
  flappy: { href: '/fun', title: '다른 미니게임 고르기', description: '비행 게임 다음에는 퍼즐이나 짧은 추첨 게임을 찾아보세요.' },
  'lunch-roulette': { href: '/fun', title: '함께 할 다른 활동', description: '메뉴를 정했다면 동료와 함께 할 추첨·퀴즈·미니게임도 둘러보세요.' },
};

export function getFunRelatedPages(pathname: string | null) {
  const slug = /^\/fun\/([a-z-]+)\/?$/.exec(pathname ?? '')?.[1];
  if (!slug || !Object.hasOwn(FUN_RELATED_PAGES, slug)) return [];
  const activity = slug as FunPageSlug;
  const peers = FUN_RELATED_PAGES[activity].map(target => ({ href: `/fun/${target}`, ...FUN_PAGES[target] }));
  const context = FUN_CONTEXT_LINKS[activity];
  return context ? [...peers, context] : peers;
}
