// Clean manufacturer/model/last text.

const patterns = {
  ampersand: /&(amp;){1,2}/ig,
  parens: /\(.*\)/g,
  unknownLast: /unknown last\s*$/i,
  trailingLast: /last\s*$/i,
  spaces: /\s+/g,
};
const patternReplacementsOrdered = [
  { pattern: patterns.ampersand, repl: "&" },
  { pattern: patterns.parens, repl: "" },
  { pattern: patterns.unknownLast, repl: "" },
  { pattern: patterns.trailingLast, repl: "" },
  { pattern: patterns.spaces, repl: " " },
];

export function replace(s: string, { pattern, repl }: { pattern: RegExp, repl: string }): string {
  return s.replace(pattern, repl);
}

export function cleanManufacturerLast(mlast: string): string | null {
  const cleaned = patternReplacementsOrdered.reduce(replace, mlast).trim();
  if (!cleaned) {
    console.error(`Cleaning ${mlast} resulted in an empty string`);
    return null;
  }
  return cleaned;
}
