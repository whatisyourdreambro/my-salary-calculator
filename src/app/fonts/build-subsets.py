"""Regenerate disjoint site fonts; not run by application builds.

Requires fonttools==4.64.0 and brotli==1.2.0. --refresh-manifest reviews
the named production-page snapshot and its shared/calculation UI sources.
"""
from collections import Counter
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
import argparse
import hashlib
import json
import math
import re
from fontTools import subset
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = HERE / "PretendardVariable-subset.woff2"
MANIFEST = HERE / "korean-subsets.json"
PAGES = ["index.html", "calc/samsung-bonus.html", "guides/wage-delayed-claim-2026.html", "home-loan.html"]
UI_SOURCES = [
    "src/app/HomeClient.tsx", "src/components/Header.tsx", "src/components/Footer.tsx",
    "src/components/HeroBadge.tsx", "src/components/CalculatorTabs.tsx", "src/components/SalaryCalculator.tsx",
    "src/components/SalaryResultCard.tsx", "src/components/SalaryTierCard.tsx", "src/components/NextActions.tsx",
    "src/components/DetailedAnalysis.tsx", "src/components/WealthChart.tsx", "src/components/RelatedCalculators.tsx",
    "src/components/ResultSharePanel.tsx", "src/components/ShareButtons.tsx", "src/components/PrivateFeedback.tsx",
    "src/components/HomeLoanSimulator.tsx", "src/components/LoanCalculator.tsx", "src/components/DepositCalculator.tsx",
    "src/components/GuideCategories.tsx", "src/components/SeasonalBanner.tsx", "src/components/SocialProof.tsx",
    "src/components/CurrencyInput.tsx", "src/components/ui/MoneyInput.tsx", "src/components/AdPlacement.tsx",
    "src/components/affiliate/CoupangBannerCore.tsx", "src/lib/fixedFeedbackContract.ts",
]

class RenderedText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocked = 0
        self.text = []
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.blocked += 1
    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.blocked -= 1
    def handle_data(self, data):
        if not self.blocked:
            self.text.append(data)

def unicode_range(points):
    intervals = []
    for point in sorted(points):
        if intervals and point == intervals[-1][1] + 1:
            intervals[-1][1] = point
        else:
            intervals.append([point, point])
    return ",".join(f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in intervals)

parser = argparse.ArgumentParser()
parser.add_argument("--refresh-manifest", action="store_true")
refresh = parser.parse_args().refresh_manifest
original = TTFont(SOURCE)
cmap = original.getBestCmap()
latin = {cp for cp in cmap if cp <= 0x10FF or 0x1200 <= cp <= 0x2FFF or 0xFF00 <= cp <= 0xFFEF} | set(map(ord, "한국어연말정산"))
remaining = set(cmap) - latin
source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
if refresh:
    common = set()
    sources = []
    for relative in PAGES:
        path = ROOT / ".next/server/app" / relative
        raw = path.read_text(encoding="utf-8")
        rendered = RenderedText()
        rendered.feed(raw)
        points = set(map(ord, "".join(rendered.text))) & remaining
        common |= points
        sources.append({"path": f".next/server/app/{relative}", "kind": "rendered HTML without scripts/styles", "sourceSha256": hashlib.sha256(raw.encode()).hexdigest(), "coveredCharacters": len(points)})
    paths = [ROOT / item for item in UI_SOURCES]
    paths += sorted((ROOT / "src/app/calc/samsung-bonus").glob("*.tsx"))
    paths += [ROOT / "src/app/calc/samsung-bonus/taiData.ts"]
    for path in paths:
        raw = path.read_text(encoding="utf-8")
        points = set(map(ord, raw)) & remaining
        common |= points
        sources.append({"path": path.relative_to(ROOT).as_posix(), "kind": "UI source, conservatively including comments", "sourceSha256": hashlib.sha256(raw.encode()).hexdigest(), "coveredCharacters": len(points)})
    frequency = Counter()
    for path in sorted((ROOT / "src/lib/guides").rglob("*.ts")):
        frequency.update(ord(char) for char in path.read_text(encoding="utf-8"))
    page_frequency = Counter()
    page_count = 0
    snapshot_hash = hashlib.sha256()
    strip_code = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.I | re.S)
    strip_tags = re.compile(r"<[^>]+>")
    snapshot = ROOT / ".next/server/app"
    for path in sorted(snapshot.rglob("*.html")):
        relative = path.relative_to(snapshot).as_posix()
        if relative == "en.html" or relative.startswith(("en/", "_")) or relative in ("contact.html", "dashboard.html"):
            continue
        raw = path.read_text(encoding="utf-8")
        body = unescape(strip_tags.sub(" ", strip_code.sub("", raw)))
        page_frequency.update(set(map(ord, body)) & remaining)
        page_count += 1
        snapshot_hash.update(relative.encode() + hashlib.sha256(raw.encode()).digest())
    ordered = sorted(remaining - common, key=lambda point: (-page_frequency[point], -frequency[point], point))
    size = math.ceil(len(ordered) / 4)
    manifest = {"schemaVersion": 1, "sourceSha256": source_hash, "selection": "Full rendered text of four priority pages plus calculation/shared UI; remaining characters by Korean-page occurrence count, guide-source frequency as tie-breaker, four bounded groups", "sources": sources, "frequencySnapshot": {"koreanHtmlFiles": page_count, "sha256": snapshot_hash.hexdigest()}, "commonCharacters": "".join(map(chr, sorted(common))), "extraCharacters": ["".join(map(chr, sorted(ordered[i * size:(i + 1) * size]))) for i in range(4)]}
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
assert manifest["sourceSha256"] == source_hash
parts = {"Latin": latin, "Korean": set(map(ord, manifest["commonCharacters"]))}
parts.update({f"KoreanExtra{index + 1}": set(map(ord, chars)) for index, chars in enumerate(manifest["extraCharacters"])})
union = set()
for points in parts.values():
    assert points and not union & points
    union |= points
assert union == set(cmap)
assert len(parts["Korean"]) < 1200, "Review the common corpus before making it too large"
report = {"sourceBytes": SOURCE.stat().st_size, "sourceCmapCount": len(cmap), "sourceSha256": source_hash, "parts": {}}
definitions = ['// Generated by build-subsets.py from reviewed korean-subsets.json.\nimport localFont from "next/font/local";\n']
variables = []
for label, selected in parts.items():
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
    temporary = HERE / f".{label}.generated.woff2"
    subset.save_font(font, str(temporary), options)
    result = TTFont(temporary)
    result_cmap = result.getBestCmap()
    assert set(result_cmap) == selected
    for tag, keys in {"hhea": ["ascent", "descent", "lineGap"], "OS/2": ["sTypoAscender", "sTypoDescender", "sTypoLineGap", "sxHeight"], "head": ["unitsPerEm"]}.items():
        for key in keys:
            assert getattr(result[tag], key) == getattr(original[tag], key), (label, tag, key)
    for cp in selected:
        assert result["hmtx"][result_cmap[cp]] == original["hmtx"][cmap[cp]], (label, cp)
    axes = lambda f: [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in f["fvar"].axes]
    assert axes(result) == axes(original)
    ordered = sorted(selected)
    samples = set(ordered[::max(1, len(ordered) // 12)]) | (set(map(ord, "MoneySalary0123456789$€£¥₩→≤éÅ가한글연봉급여세금")) & selected)
    for weight in [45, 400, 920]:
        source_glyphs = original.getGlyphSet(location={"wght": weight})
        result_glyphs = result.getGlyphSet(location={"wght": weight})
        for cp in selected if weight == 400 else samples:
            left = DecomposingRecordingPen(source_glyphs)
            right = DecomposingRecordingPen(result_glyphs)
            source_glyphs[cmap[cp]].draw(left)
            result_glyphs[result_cmap[cp]].draw(right)
            assert left.value == right.value, (label, weight, cp)
    result.close()
    candidate = temporary.read_bytes()
    if label == "Latin":
        assert candidate == target.read_bytes(), "The existing English font must remain byte-identical"
        temporary.unlink()
    else:
        temporary.replace(target)
    css_range = unicode_range(selected)
    variable = "--font-pretendard-latin" if label == "Latin" else "--font-pretendard-local" if label == "Korean" else f"--font-pretendard-extra-{label[-1]}"
    name = label[0].lower() + label[1:]
    adjustment = "" if label == "Latin" else "  adjustFontFallback: false,\n"
    definitions.append(f'const {name} = localFont({{\n  src: "./MoneySalaryText-{label}.woff2",\n  display: "optional",\n  preload: false,\n  weight: "45 920",\n{adjustment}  variable: "{variable}",\n  declarations: [{{ prop: "unicode-range", value: "{css_range}" }}],\n}});\n')
    variables.append(f"{name}.variable")
    report["parts"][label] = {"bytes": len(candidate), "sha256": hashlib.sha256(candidate).hexdigest(), "cmapCount": len(selected), "unicodeRange": css_range, "metricsAndAdvanceWidthsEqual": True, "variableAxesEqual": True, "allOutlinesEqualAt400": True, "sampleOutlinesEqualAtWeights": [45, 920]}
definitions.append('export const siteFontVariables = [' + ", ".join(variables) + '].join(" ");\n')
(HERE / "siteFonts.generated.ts").write_text("\n".join(definitions), encoding="utf-8")
report["totalBytes"] = sum(part["bytes"] for part in report["parts"].values())
report["priorityPageFontBytes"] = report["parts"]["Latin"]["bytes"] + report["parts"]["Korean"]["bytes"]
(HERE / "subset-verification.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({**report, "parts": {name: {key: value for key, value in part.items() if key != "unicodeRange"} for name, part in report["parts"].items()}}, ensure_ascii=False, indent=2))
