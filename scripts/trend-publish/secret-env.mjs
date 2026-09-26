// scripts/trend-publish/secret-env.mjs — 저장소 밖 선택 키 파일 읽기 (2026-09-27 운영자 결정)
//
// config.json secretEnvFiles: [{ path, names[] }] — 파일이 있으면 names 에 적힌 이름만 환경변수로 넣는다.
//   · 파일이 없으면 조용히 건너뛴다 — 파이프라인은 키 없이 돈다(레이더 법령 감시·감시기 ECOS·레이더 데이터랩 부스터가
//     각자 '키 없음 — 건너뜀').
//   · 이미 환경변수에 값이 있으면 덮어쓰지 않는다(운영자가 --env-file 로 직접 넘긴 값이 이긴다).
//   · 값은 반환·로그·보고서·파일 어디에도 남기지 않는다. 돌려주는 것은 파일 이름·있음/없음·읽은 변수 '이름'뿐.
//   · 읽은 값은 이 프로세스의 환경변수가 되어 자식(레이더·감시기·게이트)에게 상속되고, secret-scan 이
//     원문·URL 인코딩·base64 로 diff·.next·로그를 뒤져 새어 나간 흔적을 잡는다(이름 규칙 SECRET_ENV_NAME).
//   · 형식: 한 줄에 이름=값. 빈 줄·# 주석·앞의 'export '·값을 감싼 따옴표·BOM·CRLF 허용. 허용 이름 밖의 줄은 무시.
//   · 이 모듈을 부르는 곳은 daily.mjs defaultDeps().secretEnv 뿐이다 — 테스트의 가짜 deps 에는 이 함수가 없어서
//     테스트가 실제 키 파일을 열지 않는다(테스트는 임시 폴더의 가짜 파일로 이 모듈만 직접 부른다).
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename } from "node:path";

/** 키 파일 크기 상한 — 키 몇 줄짜리 파일이다. 넘으면 읽지 않는다(잘못된 파일 지정 방지) */
export const MAX_SECRET_ENV_BYTES = 16 * 1024;
/** 허용 이름 모양 — 대문자·숫자·밑줄 */
export const SECRET_ENV_NAME_SHAPE = /^[A-Z][A-Z0-9_]{1,63}$/;

/** 키 파일 본문 → 허용 이름만 { 이름: 값 } */
export function parseEnvText(text, allowedNames) {
  const allow = new Set(allowedNames);
  const out = {};
  for (const raw of String(text ?? "").replace(/^﻿/, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m || !allow.has(m[1])) continue;
    let value = m[2].trim();
    const quoted = value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0];
    if (quoted) value = value.slice(1, -1);
    if (value) out[m[1]] = value;
  }
  return out;
}

/**
 * 선택 키 파일들을 읽어 env 에 넣는다.
 * @param {{path: string, names: string[]}[]} specs  config.json secretEnvFiles
 * @param {Record<string, string|undefined>} env      기본 process.env
 * @param {{existsSync: Function, statSync: Function, readFileSync: Function}} fsImpl  테스트 주입용
 * @returns {{file: string, present: boolean, loaded: string[], kept: string[], error?: string}[]}  값은 없다
 */
export function loadSecretEnvFiles(specs, env = process.env, fsImpl = { existsSync, statSync, readFileSync }) {
  const summary = [];
  const add = (row) => summary.splice(summary.length, 0, row);
  for (const spec of Array.isArray(specs) ? specs : []) {
    const names = Array.isArray(spec?.names) ? spec.names.filter((n) => typeof n === "string" && SECRET_ENV_NAME_SHAPE.test(n)) : [];
    if (typeof spec?.path !== "string" || !spec.path || !names.length) continue;
    const file = basename(spec.path);
    if (!fsImpl.existsSync(spec.path)) {
      add({ file, present: false, loaded: [], kept: [] });
      continue;
    }
    let text;
    try {
      if (fsImpl.statSync(spec.path).size > MAX_SECRET_ENV_BYTES) {
        add({ file, present: true, loaded: [], kept: [], error: `${MAX_SECRET_ENV_BYTES}바이트 초과 — 읽지 않음` });
        continue;
      }
      text = fsImpl.readFileSync(spec.path, "utf8");
    } catch (e) {
      add({ file, present: true, loaded: [], kept: [], error: `읽기 실패(${e && e.code ? e.code : "오류"})` });
      continue;
    }
    const parsed = parseEnvText(text, names);
    const loaded = [];
    const kept = [];
    for (const name of names) {
      if (!(name in parsed)) continue;
      if (env[name]) kept.splice(kept.length, 0, name);
      else {
        env[name] = parsed[name];
        loaded.splice(loaded.length, 0, name);
      }
    }
    add({ file, present: true, loaded, kept });
  }
  return summary;
}

/** 보고서 한 줄 — 파일 이름과 변수 이름만(값 없음) */
export function describeSecretEnv(summary) {
  if (!Array.isArray(summary) || !summary.length) return "설정 없음";
  return summary
    .map((s) => {
      if (!s.present) return `${s.file} 없음(키 없이 동작)`;
      if (s.error) return `${s.file} ${s.error}`;
      const names = [...s.loaded, ...s.kept];
      return `${s.file} 있음(${names.length ? names.join("·") : "허용 이름 없음"})`;
    })
    .join(" · ");
}
