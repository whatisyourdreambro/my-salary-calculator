// scripts/fetch-market-snapshot.ts
//
// /calc/bonus-home-plan 시세 스냅숏 갱신 — 한국부동산원 R-ONE 아파트 중위·평균 매매가격(시·군·구, 월) +
// 한국은행 ECOS 예금은행 주택담보대출 금리(신규취급액, 월)를 받아 src/data/marketSnapshot.json 을 새로 쓴다.
//
// ★ 빌드·런타임에서 절대 실행하지 않는다(Cloudflare Workers CPU 10ms). 운영자가 월 1회(매월 16일 이후) 손으로 돌리고
//   바뀐 JSON 을 커밋한다 — 커밋된 JSON 이 계산기의 유일한 런타임 소스다.
//
// 사용:
//   npx tsx scripts/fetch-market-snapshot.ts            (키 없으면 공개 표본 모드로 동작)
//   npx tsx scripts/fetch-market-snapshot.ts --sample   (키가 있어도 표본 모드 강제)
//   옵션: --accept-jumps (전월 대비 ±15% 초과 변동을 확인한 뒤 허용) · --dry-run (검증만, 쓰지 않음)
// 키(선택): 환경변수 RONE_API_KEY · ECOS_API_KEY. 로그·파일에 남기지 않는다 — 출력 URL 은 키를 가린다.
//   R-ONE 무인증(표본)은 처음 5행만 주지만 CLS_ID 로 거르면 정확히 1행이라 이 스크립트에는 충분하다.
//   ECOS 공개 키 'sample' 은 10행까지 — 조회 구간을 10개월로 둔다.
// 호출: 250ms 간격, 한 번 실행에 30회 이하(기준월 탐색 ≤3 + 지역 11 × 2 + 전국 1 + ECOS 1).
// 종료 코드: 0 성공 · 1 검증 실패(쓰지 않음) · 2 네트워크 오류(쓰지 않음). 쓰기는 임시 파일 → rename(원자적).
// 이용 조건: R-ONE 은 공공데이터포털 '이용허락범위 제한 없음'(15134761)·한국부동산원 저작권정책(공공저작물 자유이용),
//   ECOS 는 출처 표시 조건 — 페이지에 '출처: 한국부동산원 전국주택가격동향조사, {기준월}'·'출처: 한국은행 경제통계시스템(ECOS)'.

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ECOS_MORTGAGE_RATE, HOME_REGIONS, RONE_NATIONAL, RONE_TABLES } from "../src/data/homePriceRegions";
import {
  ecosRange,
  monthCandidates,
  monthLabelOf,
  validateSnapshot,
  type MarketSnapshot,
  type SnapshotRegion,
} from "../src/lib/bonusHome/marketSnapshotRules";

const OUT = join(process.cwd(), "src", "data", "marketSnapshot.json");
const args = new Set(process.argv.slice(2));
const SAMPLE = args.has("--sample");
const ACCEPT_JUMPS = args.has("--accept-jumps");
const DRY_RUN = args.has("--dry-run");
const RONE_KEY = SAMPLE ? "" : (process.env.RONE_API_KEY ?? "").trim();
const ECOS_KEY = SAMPLE ? "sample" : (process.env.ECOS_API_KEY ?? "").trim() || "sample";
// 로그에는 키 값이 아니라 '있음/없음'만 — 키 변수는 URL 조립(redact 로 가림) 외에 쓰지 않는다
const MODE_LABEL = `R-ONE ${RONE_KEY === "" ? "표본(무인증)" : "인증키"} · ECOS ${ECOS_KEY === "sample" ? "공개 sample 키" : "인증키"}`;
const SPACING_MS = 250;
const MAX_CALLS = 30;

class NetworkError extends Error {}
class ValidationError extends Error {}

let calls = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const redact = (url: string) =>
  url.replace(/([?&]KEY=)[^&]*/i, "$1***").replace(/(\/api\/StatisticSearch\/)([^/]+)/, (_m, p: string, k: string) => `${p}${k === "sample" ? k : "***"}`);

async function getJson(url: string): Promise<unknown> {
  if (calls >= MAX_CALLS) throw new NetworkError(`호출 한도 ${MAX_CALLS}회 초과`);
  if (calls > 0) await sleep(SPACING_MS);
  calls++;
  console.log(`[fetch ${calls}] ${redact(url)}`);
  let res: Response;
  try {
    res = await fetch(url, { headers: { "User-Agent": "moneysalary-snapshot/1.0 (+https://www.moneysalary.com)" } });
  } catch (e) {
    throw new NetworkError(`요청 실패: ${redact(url)} — ${String(e).slice(0, 120)}`);
  }
  if (!res.ok) throw new NetworkError(`HTTP ${res.status}: ${redact(url)}`);
  try {
    return await res.json();
  } catch {
    throw new NetworkError(`JSON 아님: ${redact(url)}`);
  }
}

type RoneRow = { CLS_ID: number; CLS_FULLNM: string; DTA_VAL: number; UI_NM: string; WRTTIME_IDTFR_ID: string };

function roneUrl(statblId: string, month: string, clsId: number): string {
  const q = new URLSearchParams({ Type: "json", STATBL_ID: statblId, DTACYCLE_CD: "MM", WRTTIME_IDTFR_ID: month, CLS_ID: String(clsId) });
  if (RONE_KEY) q.set("KEY", RONE_KEY);
  return `https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do?${q.toString()}`;
}

/** 한 분류 한 달 값 — 없으면 null(INFO-200), 형식 이상이면 ValidationError */
async function roneValue(statblId: string, month: string, clsId: number): Promise<RoneRow | null> {
  const j = (await getJson(roneUrl(statblId, month, clsId))) as { SttsApiTblData?: [unknown, { row?: RoneRow[] }]; RESULT?: { CODE?: string } };
  const rows = j?.SttsApiTblData?.[1]?.row;
  if (!rows || rows.length === 0) return null;
  const row = rows.find((r) => r.CLS_ID === clsId && r.WRTTIME_IDTFR_ID === month);
  if (!row) throw new ValidationError(`R-ONE ${statblId} ${month} ${clsId}: 요청한 분류·월의 행이 없음`);
  if (row.UI_NM !== "천원") throw new ValidationError(`R-ONE ${statblId} ${clsId}: 단위 '${row.UI_NM}'(천원 아님)`);
  if (typeof row.DTA_VAL !== "number" || !Number.isFinite(row.DTA_VAL)) throw new ValidationError(`R-ONE ${statblId} ${clsId}: 값 이상 ${row.DTA_VAL}`);
  return row;
}

const wonOf = (thousandWon: number) => Math.round(thousandWon * 1000);

async function main(): Promise<number> {
  const now = new Date();
  const prev: MarketSnapshot | null = existsSync(OUT) ? (JSON.parse(readFileSync(OUT, "utf8")) as MarketSnapshot) : null;
  console.log(`[snapshot] 모드: ${MODE_LABEL}`);

  // 1) 기준월 — 전국(500001) 중위가로 최신 달부터 탐색
  let month: string | null = null;
  let nationalMedian = 0;
  for (const m of monthCandidates(now)) {
    const row = await roneValue(RONE_TABLES.median.statblId, m, RONE_NATIONAL.clsId);
    if (row) {
      month = m;
      nationalMedian = wonOf(row.DTA_VAL);
      break;
    }
  }
  if (!month) throw new ValidationError("최근 3개월 안에 R-ONE 중위가격 발표월이 없다");

  // 2) 지역별 중위·평균
  const regions: Record<string, SnapshotRegion> = {};
  for (const region of HOME_REGIONS) {
    const med = await roneValue(RONE_TABLES.median.statblId, month, region.rOneClsId);
    const mean = await roneValue(RONE_TABLES.mean.statblId, month, region.rOneClsId);
    if (!med || !mean) throw new ValidationError(`${region.label}(${region.rOneClsId}) ${month} 값 없음`);
    if (med.CLS_FULLNM !== region.rOneFullName || mean.CLS_FULLNM !== region.rOneFullName) {
      throw new ValidationError(`${region.label}: CLS_FULLNM '${med.CLS_FULLNM}'/'${mean.CLS_FULLNM}' ≠ 설정 '${region.rOneFullName}'`);
    }
    regions[region.id] = { clsId: region.rOneClsId, fullName: med.CLS_FULLNM, median: wonOf(med.DTA_VAL), mean: wonOf(mean.DTA_VAL) };
  }

  // 3) ECOS 주담대 금리 — 최근 10개월 중 마지막 행
  const range = ecosRange(now);
  const ecosUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${encodeURIComponent(ECOS_KEY)}/json/kr/1/10/${ECOS_MORTGAGE_RATE.statCode}/M/${range.from}/${range.to}/${ECOS_MORTGAGE_RATE.itemCode}`;
  const ej = (await getJson(ecosUrl)) as { StatisticSearch?: { row?: { TIME: string; DATA_VALUE: string; ITEM_CODE1: string; UNIT_NAME: string }[] } };
  const erows = (ej?.StatisticSearch?.row ?? []).filter((r) => r.ITEM_CODE1 === ECOS_MORTGAGE_RATE.itemCode);
  const last = erows.sort((a, b) => a.TIME.localeCompare(b.TIME)).at(-1);
  if (!last) throw new ValidationError("ECOS 주담대 금리 행이 없다");
  if (last.UNIT_NAME !== "연리%") throw new ValidationError(`ECOS 단위 '${last.UNIT_NAME}'(연리% 아님)`);

  const kstToday = new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const next: MarketSnapshot = {
    schema: 1,
    fetchedAt: kstToday,
    rone: {
      medianStatblId: RONE_TABLES.median.statblId,
      meanStatblId: RONE_TABLES.mean.statblId,
      month,
      monthLabel: monthLabelOf(month),
      source: "한국부동산원 전국주택가격동향조사 (월) 중위매매가격_아파트·평균매매가격_아파트",
      sourceUrl: "https://www.reb.or.kr/r-one/",
      regions,
      nationalMedian,
    },
    ecos: {
      statCode: ECOS_MORTGAGE_RATE.statCode,
      itemCode: ECOS_MORTGAGE_RATE.itemCode,
      month: last.TIME,
      monthLabel: monthLabelOf(last.TIME),
      ratePct: Number(last.DATA_VALUE),
      source: "한국은행 경제통계시스템(ECOS) 예금은행 대출금리(신규취급액 기준) 주택담보대출",
      sourceUrl: "https://ecos.bok.or.kr/",
    },
  };

  const errors = validateSnapshot(next, prev, { acceptJumps: ACCEPT_JUMPS });
  if (errors.length) throw new ValidationError(errors.join("\n"));

  console.log(`[snapshot] R-ONE ${next.rone.monthLabel} · 전국 중위 ${nationalMedian.toLocaleString("ko-KR")}원 · ECOS ${next.ecos.monthLabel} ${next.ecos.ratePct}%`);
  for (const r of HOME_REGIONS) console.log(`  ${r.label.padEnd(10)} 중위 ${regions[r.id].median.toLocaleString("ko-KR")} · 평균 ${regions[r.id].mean.toLocaleString("ko-KR")}`);
  if (DRY_RUN) {
    console.log("[snapshot] --dry-run: 쓰지 않음");
    return 0;
  }
  const tmp = `${OUT}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(next, null, 2) + "\n");
  renameSync(tmp, OUT);
  console.log(`[snapshot] 저장: ${OUT} (호출 ${calls}회)`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (e: unknown) => {
    if (e instanceof ValidationError) {
      console.error(`[snapshot] 검증 실패 — 파일을 쓰지 않았다:\n${e.message}`);
      process.exit(1);
    }
    console.error(`[snapshot] 네트워크 오류 — 파일을 쓰지 않았다: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(2);
  },
);
