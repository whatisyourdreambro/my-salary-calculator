// src/data/homePriceRegions.ts
//
// 성과급 내 집 마련 계산기의 비교 지역 — 반도체 사업장이 있는 시·구 단위. 가격은 한국부동산원 R-ONE
// '(월) 중위매매가격_아파트'(A_2024_00062)의 시·군·구 값이며 src/data/marketSnapshot.json 에만 들어 있다
// (갱신: scripts/fetch-market-snapshot.ts). 이 파일은 import 없는 순수 설정 — 갱신 스크립트(tsx)도 그대로 읽는다.
//
// rOneFullName 은 R-ONE 응답의 CLS_FULLNM 과 글자 단위로 같아야 한다(분류 코드가 바뀌면 갱신 스크립트가 멈춘다).
// 캡션은 시·구 전체를 설명한다 — 특정 단지·'근처' 표현 금지.
// 규제지역(조정대상지역·투기과열지구): 10·15 대책(2025-10-15, 정책브리핑 newsId 148950973) 경기 12곳 +
//   국토부 2026-06-30 지정(동탄구·기흥구·구리시, 2026-07-01 효력, 정책브리핑 newsId 148967354). 2026-09-27 확인.
// 화성시 4개 일반구(2026-02-01 출범): 반월동(삼성전자 화성캠퍼스)은 병점구 관할(화성시 병점구청 누리집 행정동 목록).

export type HomeRegion = {
  id: string;
  /** 표시 이름 */
  label: string;
  /** R-ONE 분류 코드(CLS_ID) */
  rOneClsId: number;
  /** R-ONE 분류 전체 이름(CLS_FULLNM) — 검증 가드 */
  rOneFullName: string;
  /** 수도권(서울·경기·인천) */
  capitalArea: boolean;
  /** 규제지역(조정대상지역·투기과열지구) */
  regulated: boolean;
  /** 규제 상태 표기(출처·날짜) */
  regulationNote: string;
  /** 주요 사업장 캡션 — 시·구 전체 기준 */
  workplace: string;
  /** 기본 비교 지역(나머지는 추가 비교) */
  core: boolean;
};

const REG_1015 = "규제지역 — 10·15 대책(2025-10-15) 지정";
const REG_0701 = "규제지역 — 국토부 2026-06-30 지정, 2026-07-01 효력";
const NONREG_CAPITAL = "수도권 비규제지역";
const LOCAL = "지방(수도권 밖) 비규제지역";

export const HOME_REGIONS: HomeRegion[] = [
  { id: "suwon-yeongtong", label: "수원시 영통구", rOneClsId: 530063, rOneFullName: "경기>경부2권>수원시>영통구", capitalArea: true, regulated: true, regulationNote: REG_1015, workplace: "삼성전자 본사(수원사업장) 소재 구", core: true },
  { id: "hwaseong-dongtan", label: "화성시 동탄구", rOneClsId: 530097, rOneFullName: "경기>서해안권>화성시>동탄구", capitalArea: true, regulated: true, regulationNote: REG_0701, workplace: "삼성전자 화성·기흥캠퍼스 통근권", core: true },
  { id: "hwaseong-byeongjeom", label: "화성시 병점구", rOneClsId: 530096, rOneFullName: "경기>서해안권>화성시>병점구", capitalArea: true, regulated: false, regulationNote: NONREG_CAPITAL, workplace: "삼성전자 화성캠퍼스 소재 구(반월동)", core: true },
  { id: "yongin-giheung", label: "용인시 기흥구", rOneClsId: 530057, rOneFullName: "경기>경부2권>용인시>기흥구", capitalArea: true, regulated: true, regulationNote: REG_0701, workplace: "삼성전자 기흥캠퍼스 소재 구", core: true },
  { id: "yongin-cheoin", label: "용인시 처인구", rOneClsId: 530056, rOneFullName: "경기>경부2권>용인시>처인구", capitalArea: true, regulated: false, regulationNote: NONREG_CAPITAL, workplace: "SK하이닉스 용인 반도체 클러스터·국가산단 조성 지역", core: true },
  { id: "pyeongtaek", label: "평택시", rOneClsId: 520034, rOneFullName: "경기>서해안권>평택시", capitalArea: true, regulated: false, regulationNote: NONREG_CAPITAL, workplace: "삼성전자 평택캠퍼스 소재 시", core: true },
  { id: "icheon", label: "이천시", rOneClsId: 520041, rOneFullName: "경기>동부2권>이천시", capitalArea: true, regulated: false, regulationNote: NONREG_CAPITAL, workplace: "SK하이닉스 이천캠퍼스 소재 시", core: true },
  { id: "cheongju", label: "청주시", rOneClsId: 510071, rOneFullName: "충북>청주시", capitalArea: false, regulated: false, regulationNote: LOCAL, workplace: "SK하이닉스 청주캠퍼스 소재 시(구별 통계 없음 — 시 전체)", core: true },
  { id: "cheonan", label: "천안시", rOneClsId: 510077, rOneFullName: "충남>천안시", capitalArea: false, regulated: false, regulationNote: LOCAL, workplace: "삼성전자 천안캠퍼스 소재 시", core: false },
  { id: "asan", label: "아산시", rOneClsId: 510080, rOneFullName: "충남>아산시", capitalArea: false, regulated: false, regulationNote: LOCAL, workplace: "삼성전자 온양캠퍼스 소재 시", core: false },
  { id: "seongnam-bundang", label: "성남시 분당구", rOneClsId: 530050, rOneFullName: "경기>경부1권>성남시>분당구", capitalArea: true, regulated: true, regulationNote: REG_1015, workplace: "SK하이닉스 분당캠퍼스 소재 구", core: false },
];

/** 계산기 기본 목표 지역 */
export const DEFAULT_REGION_ID = "hwaseong-dongtan";

/** 월 변동 검증에서 참고로 함께 받는 전국 값(분류 500001) — 기준월 탐색에도 쓴다 */
export const RONE_NATIONAL = { clsId: 500001, fullName: "전국" } as const;

/** R-ONE 통계표 */
export const RONE_TABLES = {
  median: { statblId: "A_2024_00062", name: "(월) 중위매매가격_아파트" },
  mean: { statblId: "A_2024_00060", name: "(월) 평균매매가격_아파트" },
} as const;

/** 한국은행 ECOS 예금은행 대출금리(신규취급액 기준) — 주택담보대출 */
export const ECOS_MORTGAGE_RATE = { statCode: "121Y006", itemCode: "BECBLA0302", name: "예금은행 대출금리(신규취급액 기준) 주택담보대출" } as const;
