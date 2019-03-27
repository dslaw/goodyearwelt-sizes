// Find sizing information via regular expressions.

export interface RegExpMatch {
  match: string;
  captures: string[];
  index: number;
}

type MatchFunction = (s: string) => RegExpMatch | null;

export interface SizeParts {
  size: string | null;
  width: string | null;
  intl: string | null;
}


export function matchRegex(line: string, pattern: RegExp): RegExpMatch | null {
  const matchObj = pattern.exec(line);
  if (!matchObj) {
    return null;
  }

  const [ match, ...captures ] = matchObj;
  const { index } = matchObj;
  return { match, captures, index };
}

export function matchSize(line: string): RegExpMatch | null {
  // TODO: Will match a whole size if first decimal is not a
  //       half size, i.e. 8.2 => 8.
  //       If someone meant a half size, but made a typo, the
  //       whole size will be returned!
  const pattern = /[0-9]{1,2}(\.[05])?/;
  return matchRegex(line, pattern);
}

export function matchWidth(line: string): RegExpMatch | null {
  // The pattern /E(?!U)/ stops the regex from matching
  // the "E" in "EU" when no width is specified. But if
  // there is no space between an "E" width and an intl
  // of "UK/US", the width will not be matched. The latter
  // case can be matched via /E(?=U)/, but then the former
  // will be broken. We opt to handle the former as it is
  // significantly more common.
  const pattern = /^\s?((EEE)|(EE)|(E(?!U))|[ABCDFG])/i;
  return matchRegex(line, pattern);
}

export function matchIntl(line: string): RegExpMatch | null {
  const pattern = /^\s?(US|UK|EU)/i;
  return matchRegex(line, pattern);
}

export function matchIntlPreceding(line: string): RegExpMatch | null {
  const pattern = /(US|UK|(EU)R?)(?=\s?[0-9])/i;
  return matchRegex(line, pattern);
}

export function collapseSpaces(s: string): string {
  return s.replace(/\s+/g, " ");
}

export function stickyMatch(line: string, fns: MatchFunction[], nChars: number): Array<string | null> {
  // Ensure output is always uppercase. Spacing won't be returned.
  const inputString = collapseSpaces(line).toUpperCase();
  const matches: Array<string | null> = [];
  let startPos = 0;
  let endPos = inputString.length;

  fns.forEach((fn) => {
    const matchResult = fn(inputString.slice(startPos, endPos));
    if (matchResult) {
      const { match, index } = matchResult;
      // Constrain the search space after the number is found,
      // as the pattern for `width` may generate a lot of false
      // positives, otherwise (i.e. if notes are present and not
      // international convention).
      startPos += index + match.length;
      endPos = startPos + nChars;
      matches.push(match);
    } else {
      matches.push(null);
    }
  });

  return matches.map((match) => match ? match.trim() : match);
}

export function postMatch(line: string): SizeParts {
  const fns = [ matchSize, matchWidth, matchIntl ];
  const maxCharsAhead = 4; // Space + three chars for "EEE".
  const matches = stickyMatch(line, fns, maxCharsAhead);
  const [ size, width, intl ] = matches;
  return { size, width, intl };
}

export function precedesMatch(line: string): SizeParts {
  const fns = [ matchIntlPreceding, matchSize, matchWidth ];
  const maxCharsAhead = 6; // Space, R (from EUR) and four chars for e.g. 11.5.
  const matches = stickyMatch(line, fns, maxCharsAhead);
  const [ intl, size, width ] = matches;
  const fixedIntl = intl === "EUR" ? "EU" : intl;
  return { size, width, intl: fixedIntl };
}
