"""Estimate font-request bytes from an existing production HTML snapshot.

This intentionally includes hidden DOM text, and excludes scripts/styles/attributes.
It does not measure browser requests, hydrated states, LCP, or field performance.
"""
from pathlib import Path
from html import unescape
from collections import Counter
import json
import math
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
report = json.loads((HERE / "subset-verification.json").read_text(encoding="utf-8"))
parts = {}
for name, value in report["parts"].items():
    points = set()
    for segment in value["unicodeRange"].split(","):
        limits = [int(point, 16) for point in segment.removeprefix("U+").split("-")]
        points.update(range(limits[0], limits[-1] + 1))
    parts[name] = points
old_korean = set().union(*(points for name, points in parts.items() if name != "Latin"))
strip_code = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.I | re.S)
strip_tags = re.compile(r"<[^>]+>")
rows = []
snapshot = ROOT / ".next/server/app"
html_files = sorted(snapshot.rglob("*.html"))
excluded = Counter()
for path in html_files:
    relative = path.relative_to(snapshot).as_posix()
    if relative == "en.html" or relative.startswith("en/"):
        excluded["English HTML"] += 1
        continue
    if relative.startswith("_") or relative in ("contact.html", "dashboard.html"):
        excluded["Error/private HTML"] += 1
        continue
    body = unescape(strip_tags.sub(" ", strip_code.sub("", path.read_text(encoding="utf-8"))))
    points = set(map(ord, body))
    used = [name for name, chars in parts.items() if points & chars]
    proposed = sum(report["parts"][name]["bytes"] for name in used)
    baseline = (111712 if points & parts["Latin"] else 0) + (413360 if points & old_korean else 0)
    route = "/" if relative == "index.html" else "/" + relative.removesuffix(".html")
    rows.append({"path": route, "proposedBytes": proposed, "baselineBytes": baseline, "deltaBytes": proposed - baseline, "parts": used})
values = sorted(row["proposedBytes"] for row in rows)
quantile = lambda p: values[max(0, math.ceil(p * len(values)) - 1)]
priority = ["/", "/calc/samsung-bonus", "/guides/wage-delayed-claim-2026", "/home-loan"]
def group_summary(group):
    sizes = sorted(row["proposedBytes"] for row in group)
    return {"pages": len(group), "p50Bytes": sizes[math.ceil(len(sizes) * .5) - 1], "p90Bytes": sizes[math.ceil(len(sizes) * .9) - 1], "maxBytes": max(sizes), "pagesAbove525072": sum(row["proposedBytes"] > 525072 for row in group)}
summary = {
    "scope": "Static HTML text estimate, including hidden DOM, excluding scripts/styles/attributes and post-hydration states",
    "baseline": "d13203c: Latin111712 + Korean413360 =525072 bytes when both are needed",
    "htmlFiles": len(html_files), "excluded": dict(excluded), "koreanPages": len(rows),
    "p50Bytes": quantile(.5), "p90Bytes": quantile(.9), "maxBytes": max(values),
    "pagesAbove525072": sum(row["proposedBytes"] > 525072 for row in rows),
    "pagesAboveOwnBaseline": sum(row["deltaBytes"] > 0 for row in rows),
    "requestPartCount": dict(sorted(Counter(len(row["parts"]) for row in rows).items())),
    "priorityPages": [row for row in rows if row["path"] in priority],
    "guides": group_summary([row for row in rows if row["path"].startswith("/guides/")]),
    "salaryDb": group_summary([row for row in rows if row["path"] == "/salary-db" or row["path"].startswith("/salary-db/")]),
    "largestPages": sorted(rows, key=lambda row: (-row["proposedBytes"], row["path"]))[:15],
}
(HERE / "coverage-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))
