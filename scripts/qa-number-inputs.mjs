import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const require = createRequire(import.meta.url);
const ts = require("typescript");

const grouped = [], exceptions = [], nonMoney = [], unresolved = [], widgets = [];
// Reviewed allowlist of non-money or self-formatted inputs (2026-11-18 N2-scripts-04, scripts-b07-F03), keyed by file
// plus the id attribute or the value expression as written in the source (attribute text keeps its quotes).
// Hours, days, minutes and percent are not money; the /table search box is grouped by formatTableSearch.
// Any other ungrouped money input still fails.
const NON_MONEY = {
  "src/app/work-clock/WorkClockClient.tsx": ['id:"work-hours"', 'id:"work-days"', 'id:"work-deductions"', 'id:"focus-minutes"', 'id:"weekly-hours"', 'id:"manual-pause-minutes"'],
  "src/app/work-clock/HolidayPayEstimate.tsx": ["value:{hours}", "value:{night}"],
  "src/components/TableInteraction.tsx": ['id:"search"'],
};
const nonMoneyReason = (path) => (path === "src/components/TableInteraction.tsx" ? "grouped by formatTableSearch" : "non-money quantity (hours/minutes/days/percent)");
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) { walk(path); continue; }
    if (!path.endsWith(".tsx") && !path.startsWith("src/app/widget/")) continue;
    const source = readFileSync(path, "utf8");
    if (path.startsWith("src/app/widget/") && path.endsWith("/route.ts")) {
      for (const input of source.matchAll(/<input\b[^>]*>/g)) {
        if (/type="number"/.test(input[0])) unresolved.push({ path, input: input[0], reason: "ungrouped HTML widget number" });
        if (/data-number-input="grouped"/.test(input[0])) widgets.push({ path });
      }
    }
    if (!path.endsWith(".tsx")) continue;
    const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
        const tag = node.tagName.getText(file);
        const attrs = Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(attribute => [attribute.name.getText(file), attribute.initializer?.getText(file) ?? "true"]));
        const line = file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
        if (tag === "NumberInput") grouped.push({ path, line });
        if (tag === "input" && path !== "src/components/NumberInput.tsx") {
          const numeric = /["']number["']/.test(attrs.type ?? "") || /numeric|decimal/.test(attrs.inputMode ?? "");
          const possibleMoney = !attrs.type || /["']text["']/.test(attrs.type)
            ? /(?:salary|wage|amount|income|principal|deposit|price|rate|cost|exempt|deduction)/i.test(attrs.value ?? "") || /(?:Number|parseFloat|parseInt)\(/.test(attrs.onChange ?? "") : false;
          if (attrs["data-number-format"] === '"calendar"') exceptions.push({ path, line, reason: "calendar/birth year", value: attrs.value });
          else if ((numeric || possibleMoney) && (NON_MONEY[path] ?? []).some(key => key === "id:" + attrs.id || key === "value:" + attrs.value))
            nonMoney.push({ path, line, reason: nonMoneyReason(path), value: attrs.value });
          else if (numeric || possibleMoney) unresolved.push({ path, line, reason: numeric ? "native numeric input" : "possible numeric text input", attrs });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
  }
}
walk("src/app"); walk("src/components");
console.log(JSON.stringify({ groupedInputSites: grouped.length, groupedFiles: new Set(grouped.map(item => item.path)).size, widgetInputSites: widgets.length, calendarExceptions: exceptions, nonMoneyExceptions: nonMoney, unresolved }, null, 2));
if (unresolved.length) process.exitCode = 1;
