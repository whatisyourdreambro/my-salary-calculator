"""Reproducible build-only bitmap atlas. Python 3.13, Pillow 11.3, fontTools 4.64.

The normal stage generator consumes the reviewed gzip files and needs no Python.
No network, application server, HTML execution or browser is used here.
"""
from pathlib import Path
import gzip
import hashlib
import json
import struct
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "vendor/og-font"
OUT = ROOT / "vendor/og-atlas"
FONT = SOURCE / "NotoSansKR.ttf"
PROVENANCE = json.loads((SOURCE / "provenance.json").read_text())
assert hashlib.sha256(FONT.read_bytes()).hexdigest() == PROVENANCE["fontSha256"]
OUT.mkdir(parents=True, exist_ok=True)
CMAP = TTFont(FONT).getBestCmap()
assert all(c in CMAP for c in range(0xAC00, 0xD7A4))
PAGES = sorted({c >> 12 for c in CMAP})
assert len(PAGES) <= 32
files = {}

def save(name, data):
    compressed = gzip.compress(data, compresslevel=9, mtime=0)
    (OUT / (name + ".gz")).write_bytes(compressed)
    files[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
                   "gzipBytes": len(compressed), "gzipSha256": hashlib.sha256(compressed).hexdigest()}

def font(size):
    result = ImageFont.truetype(str(FONT), size)
    result.set_variation_by_axes([700])
    return result

def encode_glyph(f, char):
    mask, (x, y) = f.getmask2(char, mode="L", anchor="ls")
    w, h = mask.size
    advance = round(f.getlength(char) * 16)
    # Four unusually wide/tall compatibility marks (two-/three-em dash and
    # vertical kana repeat marks) fit one bounded cell without losing the mark.
    if w > f.size or h > round(f.size * 1.3):
        reduced = Image.frombytes("L", (w,h), bytes(mask)).resize((min(w,f.size), min(h,round(f.size*1.3))), Image.Resampling.LANCZOS)
        mask = reduced.tobytes()
        w, h = reduced.size
        advance = min(advance, f.size * 16)
        y = max(y, -f.size)
    assert 0 <= w <= 96 and 0 <= h <= 96 and -128 <= x < 128 and -128 <= y < 128 and advance <= 1536
    result = bytearray(struct.pack("<BBbbH", w, h, x, y, advance))
    # 4-bit antialias coverage; each (length, coverage) run is <=255 pixels.
    values = bytes((v * 15 + 127) // 255 for v in bytes(mask))
    i = 0
    while i < len(values):
        j = i + 1
        while j < len(values) and values[j] == values[i] and j - i < 255:
            j += 1
        result.extend((j - i, values[i]))
        i = j
    return result

for size in (36, 64):
    f = font(size)
    for page in PAGES:
        # O(1) direct codepoint lookup, no giant JSON parse at runtime.
        head = bytearray(b"OGAT" + struct.pack("<HH", size, page))
        head.extend(bytes(4096 * 8))
        records = bytearray()
        for low in range(4096):
            cp = page * 4096 + low
            if cp not in CMAP and cp != 0:
                continue
            data = encode_glyph(f, chr(cp))
            struct.pack_into("<II", head, 8 + low * 8, len(head) + len(records), len(data))
            records.extend(data)
        save(f"atlas-{size}-{page}.bin", head + records)
    print(f"atlas size {size}: {len(PAGES)} banks", flush=True)

# Fixed palette: separately preblended antialias ramps over the two flat cards,
# the canvas pill, blue/purple outer backgrounds. No per-pixel RGB math at runtime.
BLUE, CARD, PURPLE, FUN_CARD, CANVAS, DARK = (1,69,242), (20,75,199), (95,38,183), (111,57,192), (237,241,245), (10,24,41)
colors = [BLUE, CARD, PURPLE, FUN_CARD, CANVAS, DARK, (255,255,255), (240,171,252)]
ramps = {}
for name, bg, fg in [("card", CARD, (255,255,255)), ("fun", FUN_CARD, (255,255,255)),
                     ("pill", CANVAS, DARK), ("blue", BLUE, (255,255,255)),
                     ("purple", PURPLE, (255,255,255)), ("accent", FUN_CARD, (240,171,252))]:
    ramps[name] = len(colors)
    colors.extend(tuple(round(b + (v-b)*a/15) for b,v in zip(bg,fg)) for a in range(16))
colors.extend([(0,0,0)] * (256-len(colors)))
palette = bytes(v for c in colors for v in c)
save("palette.bin", palette)

def static_text(image, text, size, x, y, ramp, center=True):
    f = font(size)
    layer = Image.new("L", image.size)
    draw = ImageDraw.Draw(layer)
    if center:
        x -= round(draw.textlength(text, font=f)/2)
    draw.text((x,y), text, font=f, fill=255, anchor="lt")
    box = layer.getbbox()
    if box:
        source = layer.load()
        dest = image.load()
        for yy in range(box[1],box[3]):
            for xx in range(box[0],box[2]):
                a = (source[xx,yy]*15+127)//255
                if a:
                    dest[xx,yy] = ramps[ramp]+a

labels = {
    "default": ("머니샐러리", "내 조건으로 비교하는 급여·금융 도구"),
    "tool": ("머니샐러리 · 금융 계산기", "2026년 최신 세법 기준 · 무료"),
    "guide": ("머니샐러리 · 금융 가이드", "직장인이 꼭 알아야 할 세금·재테크"),
    "fun": ("머니샐러리 · FUN", "지금 바로 무료로 즐기는 머니 게임"),
    "company": ("머니샐러리 · 회사별 연봉", "평균 연봉 · 직급별 실수령액"),
    "report": ("머니샐러리 데이터 리포트", "출처 표기 시 자유 인용 · 원문 데이터 공개"),
    "en": ("Moneysalary", "Korea salary · tax · stocks — in English"),
}
for kind in [*labels, "salary", "salary-net"]:
    fun = kind == "fun"
    image = Image.new("P", (1200,630), 2 if fun else 0)
    image.putpalette(palette)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((80,75,1120,520), radius=40, fill=3 if fun else 1)
    if kind.startswith("salary"):
        # Year is deliberately supplied by the TypeScript stage generator from the
        # canonical currentRates pointer, as a dynamic line above the amount.
        static_text(image, "세후 월 실수령액", 30, 600, 300, "card")
        if kind == "salary-net":
            draw.rounded_rectangle((160,360,1040,456), radius=48, fill=4)
    else:
        label, subtitle = labels[kind]
        static_text(image, label, 28, 600, 116, "accent" if fun else "card")
        static_text(image, subtitle, 26, 600, 461, "fun" if fun else "card")
    draw.rounded_rectangle((444,548,490,594), radius=12, fill=6)
    draw.line((455,581,467,561,479,581), fill=0, width=4)
    static_text(image, "moneysalary.com", 24, 504, 559, "purple" if fun else "blue", False)
    raw = image.tobytes()
    scanlines = b"".join(b"\0" + raw[y*1200:(y+1)*1200] for y in range(630))
    save(f"template-{kind}.bin", scanlines)

manifest = {"version":1, "fontSha256":PROVENANCE["fontSha256"], "glyphCount":len(CMAP),
            "hangulSyllables":11172, "pages":PAGES, "sizes":[36,64], "ramps":ramps, "files":files}
(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2)+"\n", encoding="utf-8")
print(json.dumps({"files":len(files), "rawBytes":sum(x["bytes"] for x in files.values()),
                  "gzipBytes":sum(x["gzipBytes"] for x in files.values())}), flush=True)
