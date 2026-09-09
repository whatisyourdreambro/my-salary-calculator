"""Regenerate the two disjoint webfont subsets; not run during application builds.

Requires fonttools==4.64.0 and brotli==1.2.0. The existing source file is retained.
"""

from pathlib import Path
import hashlib
import json

from fontTools import subset
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "PretendardVariable-subset.woff2"
original = TTFont(SOURCE)
cmap = original.getBestCmap()
latin = {cp for cp in cmap if cp <= 0x10FF or 0x1200 <= cp <= 0x2FFF or 0xFF00 <= cp <= 0xFFEF} | set(map(ord, "한국어"))
parts = {
    "Latin": (latin, "U+0000-10FF,U+1200-2FFF,U+AD6D,U+C5B4,U+D55C,U+FF00-FFEF"),
    "Korean": (set(cmap) - latin, "U+1100-11FF,U+3000-AD6C,U+AD6E-C5B3,U+C5B5-D55B,U+D55D-FEFF,U+FFF0-10FFFF"),
}
assert parts["Latin"][0].isdisjoint(parts["Korean"][0])
assert parts["Latin"][0] | parts["Korean"][0] == set(cmap)
report = {"sourceBytes": SOURCE.stat().st_size, "sourceCmapCount": len(cmap), "sourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(), "parts": {}}
for label, (selected, unicode_range) in parts.items():
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    font = subset.load_font(str(SOURCE), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=selected)
    subsetter.subset(font)
    family = f"MoneySalary Text {label}"
    names = {1: family, 3: f"MoneySalaryText{label}-20260909", 4: family, 6: f"MoneySalaryText{label}", 16: family}
    for record in font["name"].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding())
    for platform, encoding, language in [(3, 1, 0x409), (1, 0, 0)]:
        font["name"].setName("Licensed under the SIL Open Font License, Version 1.1. See OFL.txt.", 13, platform, encoding, language)
        font["name"].setName("https://openfontlicense.org/", 14, platform, encoding, language)
    target = HERE / f"MoneySalaryText-{label}.woff2"
    subset.save_font(font, str(target), options)
    result = TTFont(target)
    result_cmap = result.getBestCmap()
    assert set(result_cmap) == selected
    for tag, keys in {"hhea": ["ascent", "descent", "lineGap"], "OS/2": ["sTypoAscender", "sTypoDescender", "sTypoLineGap", "sxHeight"], "head": ["unitsPerEm"]}.items():
        for key in keys:
            assert getattr(result[tag], key) == getattr(original[tag], key), (label, tag, key)
    for cp in selected:
        assert result["hmtx"][result_cmap[cp]] == original["hmtx"][cmap[cp]], (label, cp)
    axes = lambda f: [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in f["fvar"].axes]
    assert axes(result) == axes(original)
    sample = set(map(ord, "MoneySalary0123456789$€£¥₩→≤éÅ가한글연봉급여세금")) & selected
    for weight in [45, 400, 920]:
        source_glyphs = original.getGlyphSet(location={"wght": weight})
        result_glyphs = result.getGlyphSet(location={"wght": weight})
        for cp in sample:
            left = DecomposingRecordingPen(source_glyphs)
            right = DecomposingRecordingPen(result_glyphs)
            source_glyphs[cmap[cp]].draw(left)
            result_glyphs[result_cmap[cp]].draw(right)
            assert left.value == right.value, (label, weight, cp)
    report["parts"][label] = {"bytes": target.stat().st_size, "sha256": hashlib.sha256(target.read_bytes()).hexdigest(), "cmapCount": len(selected), "unicodeRange": unicode_range, "metricsAndAdvanceWidthsEqual": True, "variableAxesEqual": True, "sampleOutlinesEqualAtWeights": [45, 400, 920]}
report["totalBytes"] = sum(part["bytes"] for part in report["parts"].values())
print(json.dumps(report, ensure_ascii=False, indent=2))
