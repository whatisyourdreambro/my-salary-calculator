import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const require = createRequire(import.meta.url);
const ts = require("typescript");

const grouped = [], exceptions = [], unresolved = [], widgets = [];
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
          else if (numeric || possibleMoney) unresolved.push({ path, line, reason: numeric ? "native numeric input" : "possible numeric text input", attrs });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
  }
}
walk("src/app"); walk("src/components");
console.log(JSON.stringify({ groupedInputSites: grouped.length, groupedFiles: new Set(grouped.map(item => item.path)).size, widgetInputSites: widgets.length, calendarExceptions: exceptions, unresolved }, null, 2));
if (unresolved.length) process.exitCode = 1;
