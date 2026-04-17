/**
 * Fix number formatting across all TSX/TS files
 * 1. Add toLocaleString('ko-KR') to raw number displays
 * 2. Fix specific patterns of unformatted numbers
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('git ls-files src -- "*.tsx" "*.ts"', { cwd: process.cwd(), encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);

let totalFixed = 0;

for (const file of files) {
  const fullPath = path.resolve(file);
  let content;
  try { content = fs.readFileSync(fullPath, 'utf8'); } catch { continue; }
  const original = content;

  // Pattern 1: setState or default values like useState(50000000) — keep as-is (these are internal state values, not display)
  // Pattern 2: JSX display of numbers WITHOUT toLocaleString
  // Target: {someNumber}원 or {someVar}원 where the var is a plain number (no formatting)
  // We look for: {number}원 → {number.toLocaleString('ko-KR')}원
  
  // Fix raw number literals in JSX display (e.g., {50000000}원 → won't appear normally, but just in case)
  // More common: format display values in input's value prop — these should stay raw for editing

  // Fix: salary, bonus etc. displayed values in JSX text content
  // Pattern: >{digits}원< (digits 4+ without locale formatting)
  content = content.replace(
    />(\d{4,})원</g,
    (match, num) => `>${parseInt(num).toLocaleString('ko-KR')}원<`
  );

  // Fix: string values like "월 {N}만원" or preset labels
  content = content.replace(
    /(\d{5,})/g,
    (match, num) => {
      // Skip if already has comma or is in a string that's a className
      return match; // Don't touch raw numbers in code logic
    }
  );

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    console.log('Fixed number display:', file);
  }
}

console.log(`\nTotal: ${totalFixed} files updated`);
