# 사이트 글꼴과 재생성

Pretendard 가변 폰트(v1.3.9)의 **한글 서브셋판** — 원본 2,009KB → 503KB (-75%).

포함 범위:

- ASCII (U+0020-007E)
- KS X 1001 한글 상용 2,350자 + 빌드 시점 사이트 실사용 한글 전부 (총 ~2,400자)
- 한글 자모(ㄱ-ㅣ), CJK 기호, 화살표, 도형, 통화(₩), 전각 문자 등 기호 범위

## 현재 서비스 파일

기존 `PretendardVariable-subset.woff2`(516,040바이트)는 재생성 원본으로 보존합니다.
`layout.tsx`는 아래 두 파일을 `unicode-range`로 구분해 사용합니다.

| 파일 | 바이트 | 문자 수 | 용도 |
| --- | ---: | ---: | --- |
| MoneySalaryText-Latin.woff2 | 110,748 | 599 | 영문·기호·통화와 언어 메뉴의 `한국어` 세 글자 |
| MoneySalaryText-Korean.woff2 | 414,016 | 2,430 | 원본에 있던 나머지 한글·CJK 문자 |

두 파일의 문자 합집합은 원본 3,029개와 같고 교집합은 없습니다. 원본에 있던 글자를
제거하지 않았습니다. 한글이 포함된 페이지는 두 파일이 필요하며 합계 524,764바이트로
기존보다 8,724바이트(1.69%) 큽니다. 영문·기호만 필요한 페이지는 작은 파일만 사용합니다.
영문 가이드 안의 한국어 용어처럼 나머지 한글이 실제로 나오면 두 번째 파일도 내려받습니다.

파생 파일의 이름은 `MoneySalary Text Latin`, `MoneySalary Text Korean`입니다.
원저작자 표시와 [SIL Open Font License](./OFL.txt)를 함께 보존합니다.

분할 재생성은 앱 빌드와 분리된 작업입니다. 저장소의 패키지 의존성을 추가하지 않습니다.

```sh
python -m pip install fonttools==4.64.0 brotli==1.2.0
python src/app/fonts/build-subsets.py
```

스크립트는 모든 문자와 advance width, 줄 높이, 가변 굵기 축의 보존을 확인하고,
대표 영문·숫자·통화·한글의 45/400/920 굵기 윤곽이 원본과 같은지 검산합니다.
출력의 `unicodeRange` 두 값은 `layout.tsx` 선언과 같아야 합니다.

## 미포함 글자의 동작

서브셋에 없는 희귀 한글(옛한글·비상용 조합)은 시스템 폰트(맑은 고딕 등)로
폴백 렌더링됨 — 글자는 남으며 글꼴 모양이 다를 수 있습니다.

## 첫 방문과 재방문의 폰트 표시

`layout.tsx`는 `display: "optional"`, `preload: false`를 사용합니다. 느린 연결에서
폰트가 첫 배치에 늦으면 시스템 폰트로 내용을 표시하고, 현재 페이지에서 뒤늦게
교체하지 않습니다. 내려받은 폰트는 이후 탐색에서 사용할 수 있습니다.
따라서 첫 방문과 캐시가 있는 재방문은 글꼴 모양이 다를 수 있으나, 읽고 있는
본문이 폰트 교체로 움직이지 않게 하는 것이 목적입니다. Latin 파일에 기존과 같은
자동 Arial 폴백 매칭을 적용하고, 한글과 원본 미포함 문자는 뒤의 글꼴·시스템 폴백으로 이어집니다.

근거: [Chrome의 폰트 로딩 안내](https://web.dev/learn/performance/optimize-web-fonts),
[optional과 preload의 조합](https://web.dev/articles/preload-critical-assets#cumulative_layout_shift_cls).
변경 시 한국어/영어 첫 방문, 캐시 재방문, 폰트 요청 실패 상황을 확인합니다.

## 재생성 방법 (신규 콘텐츠에 희귀 글자가 많아졌을 때)

1. 원본 다운로드: https://github.com/orioncactus/pretendard/releases (web/variable/woff2/PretendardVariable.woff2)
2. `pip install fonttools brotli`
3. 사용 문자 추출 + 서브셋:

```bash
# 사용 문자 수집 (KS X 1001 ∪ src 실사용 문자 → subset_chars.txt)
python - << 'EOF'
import glob
ksx = set()
for lead in range(0xB0, 0xC9):
    for trail in range(0xA1, 0xFF):
        try: ksx.add(bytes([lead, trail]).decode('euc-kr'))
        except UnicodeDecodeError: pass
used = set()
for pat in ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.css', 'src/**/*.json']:
    for f in glob.glob(pat, recursive=True):
        try: used.update(c for c in open(f, encoding='utf-8').read() if ord(c) > 0x7E)
        except Exception: pass
final = set(chr(c) for c in range(0x20, 0x7F)) | ksx | used
open('subset_chars.txt', 'w', encoding='utf-8').write(''.join(sorted(final)))
EOF

python -m fontTools.subset PretendardVariable.woff2 \
  --output-file=PretendardVariable-subset.woff2 --flavor=woff2 \
  --text-file=subset_chars.txt \
  --unicodes="U+0020-007E,U+00A0-00FF,U+2000-206F,U+20A9,U+2190-21FF,U+2200-22FF,U+2460-24FF,U+25A0-25FF,U+2600-27BF,U+3000-303F,U+3130-318F,U+FF00-FFEF" \
  --layout-features="*" --recommended-glyphs
```
