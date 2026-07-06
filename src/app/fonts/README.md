# PretendardVariable-subset.woff2

Pretendard 가변 폰트(v1.3.9)의 **한글 서브셋판** — 원본 2,009KB → 503KB (-75%).

원본 전체 폰트는 데스크톱 LCP를 3.0초(GSC Core Web Vitals 불합격)로 밀어내던
주범이라 서브셋으로 교체함 (2026-07-06). 포함 범위:

- ASCII (U+0020-007E)
- KS X 1001 한글 상용 2,350자 + 빌드 시점 사이트 실사용 한글 전부 (총 ~2,400자)
- 한글 자모(ㄱ-ㅣ), CJK 기호, 화살표, 도형, 통화(₩), 전각 문자 등 기호 범위

## 미포함 글자의 동작

서브셋에 없는 희귀 한글(옛한글·비상용 조합)은 시스템 폰트(맑은 고딕 등)로
폴백 렌더링됨 — 깨지지 않고 글꼴만 살짝 다름. 상용 2,350자가 현대 한국어
텍스트의 99.9%를 커버하므로 실사용 영향 없음.

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
