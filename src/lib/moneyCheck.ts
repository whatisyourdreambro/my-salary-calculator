export const MONEY_CHECK_PATH = "/money-check";
export const MONEY_CHECK_STORAGE_KEY = "moneysalary:money-check:v1";

export const MONEY_CHECK_TOPICS = [
  { id: "salary", label: "월급", description: "실수령액과 성과급", heading: "월급에서 먼저 확인할 것", intro: "연봉 계약서의 숫자와 통장에 들어오는 돈을 연결해 보세요. 급여명세서를 준비하면 공제 내역까지 비교하기 편합니다." },
  { id: "tax", label: "절세", description: "연말정산과 연금", heading: "연말정산 전에 확인할 것", intro: "환급액만 보기 전에 공제 대상과 증빙부터 살펴보세요. 이미 낸 세금과 공제 항목을 나누어 확인하면 다음 준비가 보입니다." },
  { id: "career", label: "이직·퇴사", description: "처우 비교와 퇴직금", heading: "회사를 옮기기 전에 확인할 것", intro: "새 연봉만으로 처우를 판단하기는 어렵습니다. 고정급·성과급·퇴직 시 받을 돈을 각각 계산해 자금 계획을 세워 보세요." },
  { id: "home", label: "주거", description: "월세와 대출 부담", heading: "집에 드는 돈에서 확인할 것", intro: "매달 낼 수 있는 주거비부터 계산해 보세요. 월세 관련 공제와 대출 상환액은 서로 다른 항목이므로 따로 확인하는 편이 좋습니다." },
  { id: "saving", label: "저축", description: "만기 금액과 목표", heading: "돈을 모으기 전에 확인할 것", intro: "목표 금액과 사용할 시점을 정하고, 이자와 세금을 구분해 보세요. 예상 수익률을 바꿔 가며 무리 없이 유지할 수 있는 금액을 찾습니다." },
  { id: "family", label: "가족", description: "부양가족과 육아휴직", heading: "가족 상황이 바뀌면 확인할 것", intro: "부양가족이나 휴직 계획이 달라지면 확인할 자료도 달라집니다. 가족 구성원끼리 공제 신청 내용과 휴직 기간을 함께 점검해 보세요." },
] as const;

export type MoneyCheckTopic = (typeof MONEY_CHECK_TOPICS)[number]["id"];
export type MoneyCheckFilter = MoneyCheckTopic | "all";

export interface MoneyCheckItem {
  id: string;
  topic: MoneyCheckTopic;
  title: string;
  description: string;
  prepare: string;
  check: string;
  calculator: { href: string; label: string };
  guide: { href: string; label: string };
}

export const MONEY_CHECK_ITEMS: readonly MoneyCheckItem[] = [
  {
    id: "salary-take-home", topic: "salary", title: "내 월급, 실제로 얼마가 들어올까?",
    description: "연봉으로 예상 월 실수령액을 구하고 급여명세서와 비교해 보세요. 비과세 수당이나 개인별 공제 설정이 다르면 결과도 달라집니다.",
    prepare: "연봉 계약서, 최근 급여명세서", check: "세전 급여와 공제 내역을 비교했어요",
    calculator: { href: "/", label: "실수령액 계산" }, guide: { href: "/guides/salary-guide-2026", label: "연봉·실수령액 읽는 법" },
  },
  {
    id: "salary-bonus", topic: "salary", title: "성과급은 통장에 얼마가 남을까?",
    description: "성과급을 연간 소득과 함께 계산해 예상 세금 차이를 확인하세요. 지급월 원천징수액과 연말정산 뒤 확정되는 세금은 구분해 봅니다.",
    prepare: "기본 연봉, 성과급 예상액, 지급 안내", check: "성과급의 세전·세후 차이를 확인했어요",
    calculator: { href: "/tools/finance/bonus", label: "성과급 세금 계산" }, guide: { href: "/guides/bonus-tax-rate", label: "성과급 과세 방식 읽기" },
  },
  {
    id: "tax-year-end", topic: "tax", title: "연말정산, 빠뜨린 항목이 있을까?",
    description: "연간 급여와 이미 낸 세금, 공제 자료를 한 번에 정리해 보세요. 계산 결과를 확인한 뒤 회사에 낼 자료와 누락 항목을 점검합니다.",
    prepare: "원천징수 내역, 공제 자료, 회사 제출 안내", check: "공제 항목과 준비할 증빙을 살펴봤어요",
    calculator: { href: "/year-end-tax", label: "연말정산 미리 계산" }, guide: { href: "/guides/year-end-tax-deductions-guide", label: "연말정산 공제 안내" },
  },
  {
    id: "tax-pension", topic: "tax", title: "연금저축·IRP 납입 내역을 확인했나요?",
    description: "올해 납입한 금액으로 예상 세액공제를 계산해 보세요. 추가 납입을 정하기 전에는 자금이 필요한 시점과 중도 인출 조건도 함께 살펴봅니다.",
    prepare: "연금계좌별 올해 납입액, 총급여 자료", check: "납입 내역과 공제·인출 조건을 확인했어요",
    calculator: { href: "/tools/finance/irp", label: "연금계좌 공제 계산" }, guide: { href: "/guides/irp-pension-year-end-2026", label: "연금계좌 연말정산 안내" },
  },
  {
    id: "career-offer", topic: "career", title: "새 회사의 제안, 지금보다 얼마나 좋을까?",
    description: "현재 회사와 제안받은 회사의 고정급·성과급 등을 같은 기준으로 비교하세요. 확정된 보상과 예상 보상을 나누어 입력하는 것이 출발점입니다.",
    prepare: "현재 보상 내역, 서면 처우 제안서", check: "두 회사의 보상을 같은 기준으로 비교했어요",
    calculator: { href: "/calc/offer-compare", label: "이직 제안 비교" }, guide: { href: "/guides/job-change-salary-jump-2026", label: "이직 처우 확인 가이드" },
  },
  {
    id: "career-severance", topic: "career", title: "퇴사할 때 받을 돈을 예상해 볼까요?",
    description: "근무 기간과 급여를 바탕으로 예상 퇴직금과 세금을 확인하세요. 실제 정산 방식과 지급 일정은 회사 안내 및 가입한 퇴직연금 제도와 대조합니다.",
    prepare: "입사·퇴사 예정일, 급여 내역, 퇴직연금 유형", check: "예상 퇴직금과 회사 정산 안내를 확인했어요",
    calculator: { href: "/tools/finance/severance", label: "퇴직금·세금 계산" }, guide: { href: "/guides/severance-pay-guide", label: "퇴직금 확인 가이드" },
  },
  {
    id: "home-rent", topic: "home", title: "내 월세도 공제 대상인지 확인해 볼까요?",
    description: "월세 지급액으로 예상 공제액을 확인하고, 소득·주택·계약 관련 요건을 가이드와 대조하세요. 계약서와 이체 내역을 미리 모아 두면 편합니다.",
    prepare: "임대차계약서, 월세 이체 내역, 소득 자료", check: "월세 공제 요건과 증빙을 확인했어요",
    calculator: { href: "/rent-tax-credit-2026", label: "월세 공제 계산" }, guide: { href: "/guides/monthly-rent-tax-credit", label: "월세 공제 준비 가이드" },
  },
  {
    id: "home-loan", topic: "home", title: "매달 갚을 대출금, 감당할 수 있을까?",
    description: "금액·금리·기간을 바꿔 월 상환액과 총이자를 비교하세요. 생활비와 비상자금을 남길 수 있는지 살펴보고 실제 금융회사 조건과 대조합니다.",
    prepare: "대출 예상액, 금리, 상환 기간·방식", check: "월 상환액과 생활비를 함께 점검했어요",
    calculator: { href: "/tools/loan", label: "대출 상환액 계산" }, guide: { href: "/guides/loan-types-comparison-2026", label: "대출 방식 비교 가이드" },
  },
  {
    id: "saving-deposit", topic: "saving", title: "예금·적금 만기에 얼마를 받을까?",
    description: "입금 방식과 금리, 기간에 따라 만기 금액을 확인하세요. 세전 이자와 세후 수령액을 구분하고 상품의 우대금리 조건도 함께 살펴봅니다.",
    prepare: "월 저축액 또는 예치금, 금리, 만기", check: "세후 만기 금액과 금리 조건을 확인했어요",
    calculator: { href: "/tools/deposit", label: "예적금 만기 계산" }, guide: { href: "/guides/first-job-financial-setup", label: "월급·저축 관리 시작하기" },
  },
  {
    id: "saving-compound", topic: "saving", title: "목표 금액까지 얼마나 걸릴까?",
    description: "매달 모을 금액과 기간을 바꾸어 목표를 시뮬레이션해 보세요. 수익률은 가정이므로 여러 경우를 비교하고 보장된 결과로 해석하지 않습니다.",
    prepare: "현재 모은 돈, 매달 모을 돈, 목표 기간", check: "다른 수익률에서도 목표 계획을 비교했어요",
    calculator: { href: "/tools/finance/compound", label: "복리·적립식 계산" }, guide: { href: "/guides/rule-of-72", label: "복리의 원리 이해하기" },
  },
  {
    id: "family-dependent", topic: "family", title: "부양가족 공제, 누구에게 적용할까?",
    description: "가족별 요건을 하나씩 확인하고 다른 가족과 중복 신청하지 않는지 점검하세요. 계산기의 간이 판단 이후에는 실제 소득 자료와 공식 요건을 대조합니다.",
    prepare: "가족별 관계·나이·소득 자료, 가족의 공제 신청 내용", check: "가족별 요건과 중복 공제 여부를 확인했어요",
    calculator: { href: "/calc/dependent-check", label: "부양가족 요건 확인" }, guide: { href: "/guides/parent-support-deduction-integration-2026", label: "부양가족 공제 가이드" },
  },
  {
    id: "family-leave", topic: "family", title: "육아휴직 중 생활비를 준비했나요?",
    description: "휴직 예정 기간으로 예상 급여 흐름을 확인하세요. 부부의 휴직 일정과 회사에서 받을 돈을 나누어 정리하고 실제 신청 요건과 절차를 살펴봅니다.",
    prepare: "휴직 예정 기간, 통상임금, 배우자 휴직 계획", check: "휴직 급여 흐름과 신청 절차를 확인했어요",
    calculator: { href: "/parental-leave", label: "육아휴직 급여 계산" }, guide: { href: "/guides/parental-leave-complete-guide", label: "육아휴직 신청 가이드" },
  },
];

export function getMoneyCheckItems(topic: MoneyCheckFilter): readonly MoneyCheckItem[] {
  return topic === "all" ? MONEY_CHECK_ITEMS : MONEY_CHECK_ITEMS.filter((item) => item.topic === topic);
}

const ITEM_IDS = new Set(MONEY_CHECK_ITEMS.map((item) => item.id));

/** Apply the checkbox's explicit intent instead of toggling a potentially stale snapshot. */
export function updateMoneyCheckCompletion(completed: readonly string[], id: string, checked: boolean): string[] {
  const valid = new Set(completed.filter((item) => ITEM_IDS.has(item)));
  if (ITEM_IDS.has(id)) {
    if (checked) valid.add(id);
    else valid.delete(id);
  }
  return [...valid];
}

/** Restore only current, known item IDs. No amounts, personal data, or topic selections are stored. */
export function parseMoneyCheckProgress(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1 || !("completed" in value) || !Array.isArray(value.completed)) return [];
    return [...new Set(value.completed.filter((id): id is string => typeof id === "string" && ITEM_IDS.has(id)))];
  } catch {
    return [];
  }
}

export function serializeMoneyCheckProgress(completed: readonly string[]): string {
  return JSON.stringify({ version: 1, completed: [...new Set(completed.filter((id) => ITEM_IDS.has(id)))] });
}

export const MONEY_CHECK_FAQ = [
  { question: "내 돈 체크는 어떤 서비스인가요?", answer: "월급·절세·이직·주거·저축·가족의 여섯 가지 상황에서 확인할 일을 모은 무료 체크리스트입니다. 각 항목에서 계산기를 열어 예상 금액을 확인하고, 가이드에서 준비할 자료와 적용 조건을 읽을 수 있습니다. 완료 표시는 직접 선택합니다." },
  { question: "체크한 내용은 어디에 저장되나요?", answer: "확인한 항목의 상태만 현재 브라우저의 로컬 저장소에 보관합니다. 로그인이나 서버 동기화는 없으며 다른 기기나 브라우저에서는 이어지지 않습니다. 브라우저 데이터를 지우면 기록이 사라지고, 저장이 제한된 환경에서는 페이지를 떠날 때 기록이 사라질 수 있습니다. 저장 기능은 자바스크립트가 켜져 있어야 작동합니다." },
  { question: "체크 표시를 지우거나 다시 시작할 수 있나요?", answer: "각 항목의 체크를 해제하거나 ‘체크 기록 초기화’를 누르면 됩니다. 초기화는 이 체크리스트의 기록만 지우며, 다른 계산기에 입력한 내용에는 영향을 주지 않습니다." },
  { question: "체크를 완료하면 공제나 지원금을 받을 수 있나요?", answer: "체크 표시는 내용을 확인했다는 개인 메모입니다. 공제 대상 판정이나 신청 완료를 의미하지 않습니다. 실제 적용 여부는 소득·가족·주거·고용 조건 등에 따라 달라지므로 연결된 가이드의 근거 자료와 담당 기관의 안내를 확인하세요." },
  { question: "계산한 금액과 실제 지급액이 다를 수 있나요?", answer: "계산기는 입력값과 페이지에 안내된 기준을 사용한 예상 결과입니다. 회사 정산 방식, 금융상품 조건, 개인별 공제 내역에 따라 실제 결과와 차이가 생길 수 있습니다. 각 계산기의 적용 연도와 가정을 확인한 뒤 급여명세서나 계약서 등 실제 자료와 비교하세요." },
] as const;
